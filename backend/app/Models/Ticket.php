<?php

namespace App\Models;

class Ticket
{
    public static function getCollection()
    {
        return getDatabase()->selectCollection('tickets');
    }

    /**
     * Buat record pembelian tiket baru
     */
    public static function create(array $data)
    {
        $collection = self::getCollection();

        $ticketData = [
            'user_id'        => new \MongoDB\BSON\ObjectId($data['user_id']),
            'event_id'       => new \MongoDB\BSON\ObjectId($data['event_id']),
            'quantity'       => (int) $data['quantity'],
            'total_price'    => (float) $data['total_price'],
            'status'         => 'pending',   // pending | paid | failed
            'payment_id'     => null,        // order_id Midtrans
            'va_number'      => null,
            'va_bank'        => null,
            'payment_expiry' => null,
            'createdAt'      => new \MongoDB\BSON\UTCDateTime(),
            'updatedAt'      => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $collection->insertOne($ticketData);
        $ticketData['_id'] = $result->getInsertedId();

        return $ticketData;
    }

    /**
     * Update info Virtual Account setelah dibuat di Midtrans
     */
    public static function updatePaymentInfo(string $ticketId, array $paymentData): bool
    {
        $collection = self::getCollection();
        $result = $collection->updateOne(
            ['_id' => new \MongoDB\BSON\ObjectId($ticketId)],
            ['$set' => array_merge($paymentData, ['updatedAt' => new \MongoDB\BSON\UTCDateTime()])]
        );
        return $result->getModifiedCount() > 0;
    }

    public static function updateStatusByOrderId(string $orderId, string $status): bool
    {
        $collection = self::getCollection();
        $updateFields = [
            'status' => $status,
            'updatedAt' => new \MongoDB\BSON\UTCDateTime()
        ];
        if ($status === 'paid') {
            $updateFields['payment_date'] = new \MongoDB\BSON\UTCDateTime();
        }
        $result = $collection->updateOne(
            ['payment_id' => $orderId],
            ['$set' => $updateFields]
        );
        return $result->getModifiedCount() > 0;
    }

    /**
     * Cari tiket berdasarkan order_id Midtrans
     */
    public static function findByOrderId(string $orderId)
    {
        $collection = self::getCollection();
        try {
            return $collection->findOne(['payment_id' => $orderId]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Hitung total tiket milik user
     */
    public static function countByUser(string $userId, bool $isSearch = false): int
    {
        $collection = self::getCollection();
        
        if ($isSearch) {
            return $collection->countDocuments(['user_id' => new \MongoDB\BSON\ObjectId($userId)]);
        }

        // Jika bukan pencarian, hitung hanya tiket yang acaranya masih aktif
        $pipeline = [
            ['$match' => ['user_id' => new \MongoDB\BSON\ObjectId($userId)]],
            ['$lookup' => ['from' => 'events', 'localField' => 'event_id', 'foreignField' => '_id', 'as' => 'event']],
            ['$unwind' => ['path' => '$event', 'preserveNullAndEmptyArrays' => true]],
            ['$match' => ['event.date' => ['$gte' => date('Y-m-d')]]],
            ['$count' => 'total']
        ];
        
        $result = $collection->aggregate($pipeline)->toArray();
        return $result[0]['total'] ?? 0;
    }

    /**
     * Ambil semua transaksi tiket milik user tertentu beserta detail event-nya dengan pagination
     */
    public static function findAllByUser(string $userId, bool $isSearch = false, int $skip = 0, int $limit = 10): array
    {
        $collection = self::getCollection();
        $pipeline = [
            [
                '$match' => [
                    'user_id' => new \MongoDB\BSON\ObjectId($userId)
                ]
            ],
            [
                '$lookup' => [
                    'from' => 'events',
                    'localField' => 'event_id',
                    'foreignField' => '_id',
                    'as' => 'event'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$event',
                    'preserveNullAndEmptyArrays' => true
                ]
            ]
        ];

        // Jika bukan pencarian (tampilan default), hanya tampilkan tiket dengan event yang masih aktif (hari ini atau masa depan)
        if (!$isSearch) {
            $pipeline[] = [
                '$match' => [
                    'event.date' => ['$gte' => date('Y-m-d')]
                ]
            ];
        }

        $pipeline = array_merge($pipeline, [
            [
                '$lookup' => [
                    'from' => 'users',
                    'localField' => 'event.publisher_id',
                    'foreignField' => '_id',
                    'as' => 'publisher'
                ]
            ],
            [
                '$unwind' => [
                    'path' => '$publisher',
                    'preserveNullAndEmptyArrays' => true
                ]
            ],
            [
                '$sort' => [
                    'createdAt' => -1
                ]
            ],
            [
                '$skip' => $skip
            ],
            [
                '$limit' => $limit
            ]
        ]);

        $cursor = $collection->aggregate($pipeline);
        return $cursor->toArray();
    }

    /**
     * Hitung total tiket terjual untuk suatu event dengan status 'paid'
     */
    public static function getSoldQuantity(string $eventId): int
    {
        $collection = self::getCollection();
        $cursor = $collection->aggregate([
            [
                '$match' => [
                    'event_id' => new \MongoDB\BSON\ObjectId($eventId),
                    'status' => 'paid'
                ]
            ],
            [
                '$group' => [
                    '_id' => null,
                    'total' => ['$sum' => '$quantity']
                ]
            ]
        ]);
        $result = $cursor->toArray();
        if (empty($result)) {
            return 0;
        }
        $first = (array)$result[0];
        return isset($first['total']) ? (int)$first['total'] : 0;
    }
}
