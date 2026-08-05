<?php

namespace App\Models;

class User
{
    public static function getCollection()
    {
        return getDatabase()->selectCollection('users');
    }

    public static function findByEmail(string $email)
    {
        $collection = self::getCollection();
        return $collection->findOne(['email' => $email]);
    }
/**
     * Buat Oaut
     */
    public static function findByGoogleId(string $googleId)
    {
        $collection = self::getCollection();
        return $collection->findOne(['google_id' => $googleId]);
    }

    public static function findById(string $id)
    {
        $collection = self::getCollection();
        try {
            return $collection->findOne(['_id' => new \MongoDB\BSON\ObjectId($id)]);
        } catch (\Exception $e) {
            return null;
        }
    }

    public static function create(array $data)
    {
        $collection = self::getCollection();
        
        $userData = [
            'nik' => $data['nik'] ?? null,
            'tglLahir' => $data['tglLahir'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => isset($data['password']) ? password_hash($data['password'], PASSWORD_BCRYPT) : null,
            'role' => $data['role'], // "publisher" or "user"
            'address' => $data['address'] ?? null,            
            'mobile' => $data['mobile'] ?? null,
            'google_id' => $data['google_id'] ?? null,
            'avatar_url' => $data['avatar_url'] ?? null,
            'createdAt' => new \MongoDB\BSON\UTCDateTime(),
            'updatedAt' => new \MongoDB\BSON\UTCDateTime(),
        ];

        if ($data['role'] === 'publisher' && isset($data['company_name'])) {
            $userData['company_name'] = $data['company_name'];
        }

        $result = $collection->insertOne($userData);
        $userData['_id'] = $result->getInsertedId();
        
        return $userData;
    }

    public static function updateProfile(string $id, array $data)
    {
        $collection = self::getCollection();
        
        $setFields = [];
        $allowedFields = ['name', 'tglLahir', 'nik', 'address', 'mobile', 'company_name', 'google_id', 'avatar_url'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setFields[$field] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            return false;
        }

        $setFields['updatedAt'] = new \MongoDB\BSON\UTCDateTime();

        $result = $collection->updateOne(
            ['_id' => new \MongoDB\BSON\ObjectId($id)],
            ['$set' => $setFields]
        );

        return $result->getModifiedCount() > 0;
    }
}
