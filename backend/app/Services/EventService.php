<?php

namespace App\Services;

use App\Models\Event;

class EventService
{
    /**
     * Helper: konversi field MongoDB ke format JSON-friendly
     */
    private function formatEvent($event): array
    {
        if (!$event) return [];

        $data = (array) $event;

        // Konversi _id ke string
        if (isset($data['_id'])) {
            $data['id'] = (string) $data['_id'];
            unset($data['_id']);
        }

        // Konversi publisher_id ke string dan dapatkan nama penyelenggara
        if (isset($data['publisher_id'])) {
            $data['publisher_id'] = (string) $data['publisher_id'];
            $pubUser = \App\Models\User::findById($data['publisher_id']);
            $data['publisher_name'] = $pubUser ? ($pubUser['company_name'] ?? $pubUser['name'] ?? 'Penyelenggara') : 'Penyelenggara';
        }

        // Konversi UTCDateTime ke ISO8601
        foreach (['createdAt', 'updatedAt'] as $field) {
            if (isset($data[$field]) && $data[$field] instanceof \MongoDB\BSON\UTCDateTime) {
                $data[$field] = $data[$field]->toDateTime()->format(\DateTime::ATOM);
            }
        }

        $eventId = $data['id'] ?? (isset($event->_id) ? (string)$event->_id : null);
        if ($eventId) {
            $sold = \App\Models\Ticket::getSoldQuantity($eventId);
            $data['sold'] = $sold;
            $data['capacity'] = isset($data['capacity']) ? (int)$data['capacity'] : ((int)($data['quota'] ?? 0) + $sold);
        } else {
            $data['sold'] = 0;
            $data['capacity'] = (int)($data['quota'] ?? 0);
        }

        // tambahkan is_expired agar sama dengan TicketService
        if (isset($data['date'])) {
            $data['is_expired'] = substr($data['date'], 0, 10) < date('Y-m-d');
        } else {
            $data['is_expired'] = false;
        }

        return $data;
    }

    /**
     * Ambil semua event milik publisher
     */
    public function getAllEvents(string $publisherId): array
    {
        $events = Event::findAllByPublisher($publisherId);
        return array_map([$this, 'formatEvent'], $events);
    }

    /**
     * Ambil semua event (untuk user publik) dengan pagination
     */
    public function getPublicEvents(int $page = 1, int $limit = 12): array
    {
        $skip = ($page - 1) * $limit;
        $events = Event::findAll($skip, $limit);
        $total = Event::countAll();

        return [
            'events' => array_map([$this, 'formatEvent'], $events),
            'pagination' => [
                'total' => $total,
                'current_page' => $page,
                'limit' => $limit,
                'has_more' => ($skip + count($events)) < $total
            ]
        ];
    }

    /**
     * Ambil satu event berdasarkan ID (hanya milik publisher)
     */
    public function getEventById(string $id, string $publisherId): array
    {
        $event = Event::findById($id);

        if (!$event) {
            throw new \RuntimeException('Event not found.', 404);
        }

        // Pastikan event milik publisher ini
        if ((string) $event['publisher_id'] !== $publisherId) {
            throw new \RuntimeException('Forbidden: You do not own this event.', 403);
        }

        return $this->formatEvent($event);
    }

    /**
     * Buat event baru
     */
    public function createEvent(array $data, string $publisherId): array
    {
        // Validasi field wajib
        $required = ['title', 'description', 'location', 'date', 'price', 'quota', 'category'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                throw new \InvalidArgumentException("Field '{$field}' is required.", 400);
            }
        }

        // Validasi tipe data
        if (!is_numeric($data['price']) || $data['price'] < 30000) {
            throw new \InvalidArgumentException('Price must be at least 30000.', 400);
        }

        if (!is_numeric($data['quota']) || (int) $data['quota'] < 1 || (int) $data['quota'] > 10000) {
            throw new \InvalidArgumentException('Quota must be between 1 and 10000.', 400);
        }

        // Tambahkan publisher_id dari JWT
        $data['publisher_id'] = $publisherId;
        $data['capacity'] = (int) $data['quota'];

        $event = Event::create($data);
        return $this->formatEvent($event);
    }

    /**
     * Update event (hanya milik publisher)
     */
    public function updateEvent(string $id, array $data, string $publisherId): array
    {
        // Cek event ada dan milik publisher ini
        $event = Event::findById($id);

        if (!$event) {
            throw new \RuntimeException('Event not found.', 404);
        }

        if ((string) $event['publisher_id'] !== $publisherId) {
            throw new \RuntimeException('Forbidden: You do not own this event.', 403);
        }

        // Validasi tipe data jika dikirim
        if (isset($data['price']) && (!is_numeric($data['price']) || $data['price'] < 30000)) {
            throw new \InvalidArgumentException('Price must be at least 30000.', 400);
        }

        if (isset($data['quota'])) {
            if (!is_numeric($data['quota']) || (int) $data['quota'] < 1 || (int) $data['quota'] > 10000) {
                throw new \InvalidArgumentException('Quota must be between 1 and 10000.', 400);
            }
            $newCapacity = (int) $data['quota'];
            $data['capacity'] = $newCapacity;

            // Hitung sisa kuota (kapasitas baru - jumlah tiket terjual)
            $sold = \App\Models\Ticket::getSoldQuantity($id);
            $data['quota'] = max(0, $newCapacity - $sold);
        }

        Event::update($id, $data);

        // Kembalikan data event terbaru
        $updated = Event::findById($id);
        return $this->formatEvent($updated);
    }

    /**
     * Hapus event (hanya milik publisher)
     */
    public function deleteEvent(string $id, string $publisherId): void
    {
        $event = Event::findById($id);

        if (!$event) {
            throw new \RuntimeException('Event not found.', 404);
        }

        if ((string) $event['publisher_id'] !== $publisherId) {
            throw new \RuntimeException('Forbidden: You do not own this event.', 403);
        }

        Event::delete($id);
    }
}
