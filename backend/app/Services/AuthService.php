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
/**
     * Buat Oauth
     */
    public function googleLogin(array $data)
    {
        if (empty($data['credential'])) {
            throw new \InvalidArgumentException('Google credential token is required.', 400);
        }

        $config = require __DIR__ . '/../../config/app.php';
        $googleClientId = $_ENV['GOOGLE_CLIENT_ID'] ?? getenv('GOOGLE_CLIENT_ID') ?? ''; // ambil google id dari .env

        if (empty($googleClientId)) {
            throw new \RuntimeException('GOOGLE_CLIENT_ID belum dikonfigurasi di server.', 500);
        }

        // Verifikasi Google ID Token tanpa library google/apiclient
        // Menggunakan Google OAuth2 tokeninfo endpoint
        $credential = $data['credential'];
        $payload = $this->verifyGoogleIdToken($credential, $googleClientId);

        if (!$payload) {
            throw new \RuntimeException('Invalid Google credential.', 401);
        }

        $googleId = $payload['sub'];
        $email = $payload['email'];
        $name = $payload['name'];
        $avatarUrl = $payload['picture'] ?? null;

        $user = User::findByEmail($email);
        
        // validasi untuk login sebagai user atau publisher menggunakan OAuth
        if (!$user) {
            $newUserData = [
                'name' => $name,
                'email' => $email,
                'role' => 'user',
                'google_id' => $googleId,
                'avatar_url' => $avatarUrl
            ];
            $user = User::create($newUserData);
        } else {                        
            if (!isset($user['google_id'])) {
                User::updateProfile((string)$user['_id'], ['google_id' => $googleId, 'avatar_url' => $avatarUrl]);
                $user['google_id'] = $googleId;
                $user['avatar_url'] = $avatarUrl;
            }
        }
        
        $jwtSecret = $config['jwt']['secret'];
        $jwtExpire = $config['jwt']['expire'];

        $issuedAt = time();
        $expire = $issuedAt + $jwtExpire;

        $jwtPayload = [
            'iss' => $config['url'],
            'aud' => $config['url'],
            'iat' => $issuedAt,
            'exp' => $expire,
            'sub' => (string)$user['_id'],
            'role' => $user['role']
        ];

        $token = JWT::encode($jwtPayload, $jwtSecret, 'HS256');

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

    /**
     * Verifikasi Google ID Token menggunakan Google OAuth2 tokeninfo endpoint.
     * Tidak memerlukan library google/apiclient.
     * 
     * @param string $idToken Google ID token (JWT) dari frontend
     * @param string $clientId Google Client ID untuk validasi audience
     * @return array|null Payload token jika valid, null jika tidak valid
     */
    private function verifyGoogleIdToken(string $idToken, string $clientId): ?array
    {
        // Gunakan Google tokeninfo endpoint untuk verifikasi
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($idToken);
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            throw new \RuntimeException('Gagal menghubungi server Google: ' . $curlError, 500);
        }
        
        if ($httpCode !== 200) {
            return null;
        }
        
        $payload = json_decode($response, true);
        
        if (!$payload || json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        
        // Validasi audience (aud) harus sesuai dengan Client ID kita
        if (!isset($payload['aud']) || $payload['aud'] !== $clientId) {
            return null;
        }
        
        // Validasi issuer
        $validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!isset($payload['iss']) || !in_array($payload['iss'], $validIssuers)) {
            return null;
        }
        
        // Validasi token belum expired
        if (isset($payload['exp']) && (int)$payload['exp'] < time()) {
            return null;
        }
        
        return $payload;
    }
}
