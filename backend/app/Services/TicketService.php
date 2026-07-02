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

        return $data;
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
