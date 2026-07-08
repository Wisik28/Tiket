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

    /**
     * Update status tiket berdasarkan order_id (dipanggil dari webhook Midtrans)
     */
    public static function updateStatusByOrderId(string $orderId, string $status): bool
    {
        $collection = self::getCollection();
        $result = $collection->updateOne(
            ['payment_id' => $orderId],
            ['$set' => ['status' => $status, 'updatedAt' => new \MongoDB\BSON\UTCDateTime()]]
        );
        return $result->getModifiedCount() > 0;
    }

    /**
     * Hitung total tiket milik user
     */
    public static function countByUser(string $userId): int
    {
        $collection = self::getCollection();
        return $collection->countDocuments([
            'user_id' => new \MongoDB\BSON\ObjectId($userId)
        ]);
    }

    /**
     * Ambil semua transaksi tiket milik user tertentu beserta detail event-nya dengan pagination
     */
    public static function findAllByUser(string $userId, int $skip = 0, int $limit = 10): array
    {
        $collection = self::getCollection();
        $cursor = $collection->aggregate([
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
            ],
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
        return $cursor->toArray();
    }
}
