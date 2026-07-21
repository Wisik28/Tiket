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
            'nik' => $data['nik'] ?? null,
            'tglLahir' => $data['tglLahir'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => password_hash($data['password'], PASSWORD_BCRYPT),
            'role' => $data['role'], // "publisher" or "user"
            'address' => $data['address'] ?? null,            
            'mobile' => $data['mobile'] ?? null,
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
}
