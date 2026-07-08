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

        foreach (['createdAt', 'updatedAt'] as $field) {
            if (isset($data[$field]) && $data[$field] instanceof \MongoDB\BSON\UTCDateTime) {
                $data[$field] = $data[$field]->toDateTime()->format(\DateTime::ATOM);
            }
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

        return $data;
    }

    /**
     * Mengambil riwayat pembelian tiket user dengan pagination
     */
    public function getUserTickets(string $userId, int $page = 1, int $limit = 10): array
    {
        $skip = ($page - 1) * $limit;
        $tickets = Ticket::findAllByUser($userId, $skip, $limit);
        $total = Ticket::countByUser($userId);

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
}
