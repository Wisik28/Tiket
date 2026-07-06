<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Respect\Validation\Validator as v;

class AuthService
{
    public function register(array $data)
    {
        // 1. Validasi field wajib
        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['role']) || empty($data['address']) || empty($data['mobile'])) {
            throw new \InvalidArgumentException('Name, email, password, role, address, and mobile are required.', 400);
        }

        // 2. Validasi format email
        if (!v::email()->validate($data['email'])) {
            throw new \InvalidArgumentException('Invalid email format.', 400);
        }

        // 3. Validasi role harus "publisher" atau "user"
        $role = strtolower($data['role']);
        if ($role !== 'publisher' && $role !== 'user') {
            throw new \InvalidArgumentException('Role must be either "publisher" or "user".', 400);
        }

        // 4. Cek email belum terdaftar
        $existingUser = User::findByEmail($data['email']);
        if ($existingUser) {
            throw new \RuntimeException('Email is already registered.', 409);
        }

        // 5. Simpan user (password di-hash di dalam Model User)
        $data['role'] = $role;
        $user = User::create($data);

        // Jangan tampilkan password di response
        unset($user['password']);
        
        // Convert MongoDB ObjectId to string for easy response
        $user['id'] = (string)$user['_id'];
        unset($user['_id']);

        // Convert UTCDateTime to ISO8601 string or similar for response
        if (isset($user['createdAt']) && $user['createdAt'] instanceof \MongoDB\BSON\UTCDateTime) {
            $user['createdAt'] = $user['createdAt']->toDateTime()->format(\DateTime::ATOM);
        }
        if (isset($user['updatedAt']) && $user['updatedAt'] instanceof \MongoDB\BSON\UTCDateTime) {
            $user['updatedAt'] = $user['updatedAt']->toDateTime()->format(\DateTime::ATOM);
        }

        return $user;
    }

    public function login(array $data)
    {
        // 1. Validasi input
        if (empty($data['email']) || empty($data['password'])) {
            throw new \InvalidArgumentException('Email and password are required.', 400);
        }

        // 2. Cek email ada
        $user = User::findByEmail($data['email']);
        if (!$user) {
            throw new \RuntimeException('Invalid credentials.', 401);
        }

        // 3. Verifikasi password
        if (!password_verify($data['password'], $user['password'])) {
            throw new \RuntimeException('Invalid credentials.', 401);
        }

        // 4. Generate JWT
        $config = require __DIR__ . '/../../config/app.php';
        $jwtSecret = $config['jwt']['secret'];
        $jwtExpire = $config['jwt']['expire'];

        $issuedAt = time();
        $expire = $issuedAt + $jwtExpire;

        $payload = [
            'iss' => $config['url'],
            'aud' => $config['url'],
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => (string)$user['_id'],
            'role' => $user['role']
        ];

        $token = JWT::encode($payload, $jwtSecret, 'HS256');

        // Kembalikan token + data user (tanpa password)
        unset($user['password']);
        $user['id'] = (string)$user['_id'];
        unset($user['_id']);

        if (isset($user['createdAt']) && $user['createdAt'] instanceof \MongoDB\BSON\UTCDateTime) {
            $user['createdAt'] = $user['createdAt']->toDateTime()->format(\DateTime::ATOM);
        }
        if (isset($user['updatedAt']) && $user['updatedAt'] instanceof \MongoDB\BSON\UTCDateTime) {
            $user['updatedAt'] = $user['updatedAt']->toDateTime()->format(\DateTime::ATOM);
        }

        return [
            'token' => $token,
            'user' => $user
        ];
    }
}
