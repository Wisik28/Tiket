<?php

namespace App\Services;

use App\Models\Event;
use App\Models\Ticket;

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
     * Mengambil riwayat pembelian tiket user
     */
    public function getUserTickets(string $userId): array
    {
        $tickets = Ticket::findAllByUser($userId);
        return array_map([$this, 'formatTicket'], $tickets);
    }

    /**
     * Membeli tiket
     */
    public function purchase(string $userId, string $eventId, int $quantity): array
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

        // Simpan transaksi tiket
        $ticketData = [
            'user_id' => $userId,
            'event_id' => $eventId,
            'quantity' => $quantity,
            'total_price' => $totalPrice
        ];

        $ticket = Ticket::create($ticketData);
        return $this->formatTicket($ticket);
    }
}
