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
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => $data['role'], // "publisher" or "user"
            'company_name' => $data['company_name'] ?? null,
            'createdAt' => new \MongoDB\BSON\UTCDateTime(),
            'updatedAt' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $collection->insertOne($userData);
        $userData['_id'] = $result->getInsertedId();
        
        return $userData;
    }
}
