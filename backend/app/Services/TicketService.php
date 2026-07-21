<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Ticket;
use App\Models\User;
use App\Services\PaymentService;

class TicketService
{
    /**
     * Helper: konversi field MongoDB ke format JSON-friendly
     */
    private function formatTicket($ticket): array
    {
        if (!$ticket) return [];

        $data = (array) $ticket;

        if (isset($data['_id'])) {
            $data['id'] = (string) $data['_id'];
            unset($data['_id']);
        }

        if (isset($data['user_id'])) {
            $data['user_id'] = (string) $data['user_id'];
        }

        if (isset($data['event_id'])) {
            $data['event_id'] = (string) $data['event_id'];
        }

        foreach (['createdAt', 'updatedAt', 'payment_date'] as $field) {
            if (isset($data[$field]) && $data[$field] instanceof \MongoDB\BSON\UTCDateTime) {
                $data[$field] = $data[$field]->toDateTime()->format(\DateTime::ATOM);
            }
        }

        if (isset($data['status']) && $data['status'] === 'paid' && !isset($data['payment_date'])) {
            $data['payment_date'] = $data['updatedAt'] ?? null;
        }

        // Format nested event detail jika ada (dari lookup)
        if (isset($data['event']) && (is_array($data['event']) || is_object($data['event']))) {
            $eventData = (array) $data['event'];
            if (isset($eventData['_id'])) {
                $eventData['id'] = (string) $eventData['_id'];
                unset($eventData['_id']);
            }
            if (isset($eventData['publisher_id'])) {
                $eventData['publisher_id'] = (string) $eventData['publisher_id'];
            }
            foreach (['createdAt', 'updatedAt'] as $field) {
                if (isset($eventData[$field]) && $eventData[$field] instanceof \MongoDB\BSON\UTCDateTime) {
                    $eventData[$field] = $eventData[$field]->toDateTime()->format(\DateTime::ATOM);
                }
            }

            // Tambahkan flag is_expired agar frontend lebih mudah
            if (isset($eventData['date'])) {
                $eventData['is_expired'] = $eventData['date'] < date('Y-m-d');
            } else {
                $eventData['is_expired'] = false;
            }

            // Map nama penyelenggara/publisher ke event
            if (isset($data['publisher']) && (is_array($data['publisher']) || is_object($data['publisher']))) {
                $publisherData = (array) $data['publisher'];
                $eventData['company_name'] = $publisherData['company_name'] ?? null;
            }

            $data['event'] = $eventData;
        }

        if (isset($data['publisher'])) {
            unset($data['publisher']);
        }

        // Format nested buyer detail jika ada (dari lookup)
        if (isset($data['buyer']) && (is_array($data['buyer']) || is_object($data['buyer']))) {
            $buyerData = (array) $data['buyer'];
            if (isset($buyerData['_id'])) {
                $buyerData['id'] = (string) $buyerData['_id'];
                unset($buyerData['_id']);
            }
            unset($buyerData['password']);
            unset($buyerData['role']);
            $data['buyer'] = $buyerData;
        }

        return $data;
    }

    /**
     * Mengambil riwayat pembelian tiket user dengan pagination
     */
    public function getUserTickets(string $userId, int $page = 1, int $limit = 10, bool $isSearch = false): array
    {
        // Jika user tidak membayar lebih dari 10 menit maka status akan berubah menjadi failed (gagal)
        $collection = Ticket::getCollection();
        $tenMinutesAgo = new \MongoDB\BSON\UTCDateTime((time() - 600) * 1000);
        $collection->updateMany(
            [
                'user_id' => new \MongoDB\BSON\ObjectId($userId),
                'status' => 'pending',
                'createdAt' => ['$lt' => $tenMinutesAgo]
            ],
            [
                '$set' => [
                    'status' => 'failed',
                    'updatedAt' => new \MongoDB\BSON\UTCDateTime()
                ]
            ]
        );

        $skip = ($page - 1) * $limit;
        $tickets = Ticket::findAllByUser($userId, $isSearch, $skip, $limit);
        $total = Ticket::countByUser($userId, $isSearch);

        // Proaktif cek status Midtrans untuk pending tickets (Sangat berguna untuk localhost)
        $paymentService = new PaymentService();
        $updatedAny = false;
        foreach ($tickets as &$ticket) {
            $ticketArray = (array)$ticket;
            if (isset($ticketArray['status']) && $ticketArray['status'] === 'pending' && isset($ticketArray['payment_id'])) {
                try {
                    $midtransStatus = $paymentService->getTransactionStatus($ticketArray['payment_id']);
                    $txStatus = $midtransStatus['transaction_status'] ?? '';
                    $fraudStatus = $midtransStatus['fraud_status'] ?? '';

                    if (in_array($txStatus, ['settlement', 'capture'])) {
                        $status = ($fraudStatus === '' || $fraudStatus === 'accept') ? 'paid' : 'failed';
                        Ticket::updateStatusByOrderId($ticketArray['payment_id'], $status);
                        $ticket['status'] = $status;
                        $updatedAny = true;
                    } elseif (in_array($txStatus, ['deny', 'cancel', 'expire', 'failure'])) {
                        Ticket::updateStatusByOrderId($ticketArray['payment_id'], 'failed');
                        $ticket['status'] = 'failed';
                        $updatedAny = true;
                    }
                } catch (\Exception $e) {
                    // Abaikan jika error (misal belum di-charge ke midtrans atau masalah jaringan)
                }
            }
        }
        unset($ticket);

        if ($updatedAny) {
            // Ambil ulang data tiket yang terupdate
            $tickets = Ticket::findAllByUser($userId, $isSearch, $skip, $limit);
        }

        return [
            'tickets' => array_map([$this, 'formatTicket'], $tickets),
            'pagination' => [
                'total' => $total,
                'current_page' => $page,
                'limit' => $limit,
                'has_more' => ($skip + count($tickets)) < $total
            ]
        ];
    }

    /**
     * Membeli tiket dan membuat Virtual Account Midtrans
     */
    public function purchase(string $userId, string $eventId, int $quantity, string $bank = 'bni'): array
    {
        if ($quantity < 1) {
            throw new \InvalidArgumentException('Quantity must be at least 1.', 400);
        }

        // Cek apakah event ada
        $event = Event::findById($eventId);
        if (!$event) {
            throw new \RuntimeException('Event not found.', 404);
        }

        // Cek kuota
        if ((int)$event['quota'] < $quantity) {
            throw new \RuntimeException('Not enough quota available.', 400);
        }

        // Hitung total harga
        $totalPrice = (float)$event['price'] * $quantity;

        // Kurangi kuota event
        $decremented = Event::decrementQuota($eventId, $quantity);
        if (!$decremented) {
            throw new \RuntimeException('Failed to process ticket purchase (concurrency issue).', 500);
        }

        // Simpan tiket dengan status pending
        $ticketData = [
            'user_id'     => $userId,
            'event_id'    => $eventId,
            'quantity'    => $quantity,
            'total_price' => $totalPrice
        ];
        $ticket   = Ticket::create($ticketData);
        $ticketId = (string) $ticket['_id'];
        $orderId  = 'TICKET-' . $ticketId;

        // Ambil data user untuk isian customer detail Midtrans
        $user = User::findById($userId);

        // Buat Virtual Account di Midtrans
        $paymentService = new PaymentService();
        $vaResponse = $paymentService->createVirtualAccount(
            $orderId,
            (int) $totalPrice,
            [
                'name'  => $user ? (string)($user['name'] ?? 'Customer') : 'Customer',
                'email' => $user ? (string)($user['email'] ?? '') : '',
            ],
            $bank
        );

        // Ambil nomor VA dari response Midtrans
        $vaNumber      = $vaResponse['va_numbers'][0]['va_number'] ?? null;
        $vaBank        = $vaResponse['va_numbers'][0]['bank'] ?? $bank;
        $paymentExpiry = $vaResponse['expiry_time'] ?? null;

        // Simpan info VA ke dokumen tiket
        Ticket::updatePaymentInfo($ticketId, [
            'payment_id'     => $orderId,
            'va_number'      => $vaNumber,
            'va_bank'        => $vaBank,
            'payment_expiry' => $paymentExpiry,
        ]);

        // Tambahkan info VA ke array yang akan dikembalikan
        $ticket['payment_id']     = $orderId;
        $ticket['va_number']      = $vaNumber;
        $ticket['va_bank']        = $vaBank;
        $ticket['payment_expiry'] = $paymentExpiry;
        $ticket['status']         = 'pending';

        return $this->formatTicket($ticket);
    }

    /**
     * Menangani notifikasi webhook dari Midtrans
     * Memverifikasi signature dan update status tiket
     */
    public function handleWebhookNotification(array $notification, string $serverKey): bool
    {
        $orderId      = $notification['order_id'] ?? '';
        $statusCode   = $notification['status_code'] ?? '';
        $grossAmount  = $notification['gross_amount'] ?? '';
        $signatureKey = $notification['signature_key'] ?? '';
        $txStatus     = $notification['transaction_status'] ?? '';
        $fraudStatus  = $notification['fraud_status'] ?? '';

        // Verifikasi signature Midtrans
        $expectedSig = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
        if (!hash_equals($expectedSig, $signatureKey)) {
            throw new \RuntimeException('Invalid signature.', 403);
        }

        // Tentukan status tiket berdasarkan status transaksi Midtrans
        if (in_array($txStatus, ['settlement', 'capture'])) {
            $status = ($fraudStatus === '' || $fraudStatus === 'accept') ? 'paid' : 'failed';
        } elseif (in_array($txStatus, ['deny', 'cancel', 'expire', 'failure'])) {
            $status = 'failed';
        } else {
            $status = 'pending';
        }

        return Ticket::updateStatusByOrderId($orderId, $status);
    }

    /**
     * Mengambil daftar pesanan dari event milik publisher dengan filter & search
     */
    public function getPublisherTickets(string $publisherId, int $page = 1, int $limit = 15, ?string $search = null, ?string $filter = null): array
    {
        $collection = Ticket::getCollection();
        $skip = ($page - 1) * $limit;

        $pipeline = [
            [
                '$lookup' => [
                    'from' => 'events',
                    'localField' => 'event_id',
                    'foreignField' => '_id',
                    'as' => 'event'
                ]
            ],
            [
                '$unwind' => '$event'
            ],
            [
                '$lookup' => [
                    'from' => 'users',
                    'localField' => 'user_id',
                    'foreignField' => '_id',
                    'as' => 'buyer'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$buyer',
                    'preserveNullAndEmptyArrays' => true
                ]
            ]
        ];

        // Match stage
        $matchStage = [
            'event.publisher_id' => new \MongoDB\BSON\ObjectId($publisherId)
        ];

        // Apply time filter (hari | minggu | bulan | tahun)
        if ($filter) {
            $startDateTime = null;
            if ($filter === 'hari') {
                $startDateTime = new \DateTime('today');
            } elseif ($filter === 'minggu') {
                $startDateTime = (new \DateTime())->modify('-7 days');
            } elseif ($filter === 'bulan') {
                $startDateTime = new \DateTime('first day of this month 00:00:00');
            } elseif ($filter === 'tahun') {
                $startDateTime = new \DateTime('first day of January 00:00:00');
            }

            if ($startDateTime) {
                $matchStage['createdAt'] = ['$gte' => new \MongoDB\BSON\UTCDateTime($startDateTime->getTimestamp() * 1000)];
            }
        }

        // Apply search filter (event title or buyer name)
        if ($search) {
            $matchStage['$or'] = [
                ['event.title' => ['$regex' => $search, '$options' => 'i']],
                ['buyer.name' => ['$regex' => $search, '$options' => 'i']]
            ];
        }

        $pipeline[] = ['$match' => $matchStage];

        // Facet for pagination
        $pipeline[] = [
            '$facet' => [
                'metadata' => [
                    ['$count' => 'total']
                ],
                'data' => [
                    ['$sort' => ['createdAt' => -1]],
                    ['$skip' => $skip],
                    ['$limit' => $limit]
                ]
            ]
        ];

        $result = $collection->aggregate($pipeline)->toArray();
        $total = 0;
        $tickets = [];

        if (!empty($result)) {
            $total = $result[0]['metadata'][0]['total'] ?? 0;
            $tickets = $result[0]['data'] ?? [];
        }

        $ticketsArray = is_object($tickets) && method_exists($tickets, 'getArrayCopy')
            ? $tickets->getArrayCopy()
            : (array)$tickets;

        return [
            'tickets' => array_map([$this, 'formatTicket'], $ticketsArray),
            'pagination' => [
                'total' => $total,
                'current_page' => $page,
                'limit' => $limit,
                'has_more' => ($skip + count($ticketsArray)) < $total
            ]
        ];
    }
}
