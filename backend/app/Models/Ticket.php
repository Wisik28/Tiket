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
            'user_id'     => new \MongoDB\BSON\ObjectId($data['user_id']),
            'event_id'    => new \MongoDB\BSON\ObjectId($data['event_id']),
            'quantity'    => (int) $data['quantity'],
            'total_price' => (float) $data['total_price'],
            'createdAt'   => new \MongoDB\BSON\UTCDateTime(),
            'updatedAt'   => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $collection->insertOne($ticketData);
        $ticketData['_id'] = $result->getInsertedId();

        return $ticketData;
    }

    /**
     * Ambil semua transaksi tiket milik user tertentu beserta detail event-nya
     */
    public static function findAllByUser(string $userId): array
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
            ]
        ]);
        return $cursor->toArray();
    }
}
