<?php

namespace App\Models;

class Event
{
    public static function getCollection()
    {
        return getDatabase()->selectCollection('events');
    }

    /**
     * Ambil semua event milik publisher tertentu
     */
    public static function findAllByPublisher(string $publisherId): array
    {
        $collection = self::getCollection();
        $cursor = $collection->find(
            ['publisher_id' => new \MongoDB\BSON\ObjectId($publisherId)],
            ['sort' => ['createdAt' => -1]]
        );
        return $cursor->toArray();
    }

    /**
     * Ambil semua event (untuk user)
     */
    public static function findAll(): array
    {
        $collection = self::getCollection();
        $cursor = $collection->find(
            [], // Tanpa filter publisher_id, agar semua event tampil
            ['sort' => ['createdAt' => -1]]
        );
        return $cursor->toArray();
    }

    /**
     * Cari event berdasarkan ID
     */
    public static function findById(string $id)
    {
        $collection = self::getCollection();
        try {
            return $collection->findOne(['_id' => new \MongoDB\BSON\ObjectId($id)]);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Buat event baru
     */
    public static function create(array $data)
    {
        $collection = self::getCollection();

        $eventData = [
            'title'        => $data['title'],
            'description'  => $data['description'],
            'location'     => $data['location'],
            'date'         => $data['date'],
            'price'        => (float) $data['price'],
            'quota'        => (int) $data['quota'],
            'category'     => $data['category'],
            'image_url'    => $data['image_url'] ?? null,
            'publisher_id' => new \MongoDB\BSON\ObjectId($data['publisher_id']),
            'createdAt'    => new \MongoDB\BSON\UTCDateTime(),
            'updatedAt'    => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $collection->insertOne($eventData);
        $eventData['_id'] = $result->getInsertedId();

        return $eventData;
    }

    /**
     * Update event berdasarkan ID
     */
    public static function update(string $id, array $data): bool
    {
        $collection = self::getCollection();

        $updateFields = array_filter([
            'title'       => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'location'    => $data['location'] ?? null,
            'date'        => $data['date'] ?? null,
            'price'       => isset($data['price']) ? (float) $data['price'] : null,
            'quota'       => isset($data['quota']) ? (int) $data['quota'] : null,
            'category'    => $data['category'] ?? null,
            'image_url'   => $data['image_url'] ?? null,
        ], fn($v) => $v !== null);

        $updateFields['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

        $result = $collection->updateOne(
            ['_id' => new \MongoDB\BSON\ObjectId($id)],
            ['$set' => $updateFields]
        );

        return $result->getModifiedCount() > 0;
    }

    /**
     * Hapus event berdasarkan ID
     */
    public static function delete(string $id): bool
    {
        $collection = self::getCollection();
        $result = $collection->deleteOne(['_id' => new \MongoDB\BSON\ObjectId($id)]);
        return $result->getDeletedCount() > 0;
    }

    /**
     * Kurangi kuota event saat tiket dibeli
     */
    public static function decrementQuota(string $id, int $quantity): bool
    {
        $collection = self::getCollection();
        $result = $collection->updateOne(
            ['_id' => new \MongoDB\BSON\ObjectId($id)],
            ['$inc' => ['quota' => -$quantity]]
        );
        return $result->getModifiedCount() > 0;
    }
}
