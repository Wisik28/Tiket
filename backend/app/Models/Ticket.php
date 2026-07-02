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
}
