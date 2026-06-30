<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class AuthMiddleware
{
    public static function handle(callable $next)
    {
        // Fallback for environments where getallheaders() may not be available
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        } else {
            $headers = [];
            foreach ($_SERVER as $key => $value) {
                if (str_starts_with($key, 'HTTP_')) {
                    $name = str_replace('_', '-', substr($key, 5));
                    $headers[$name] = $value;
                }
            }
        }
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized: Missing or invalid token format.'
            ]);
            return;
        }

        $token = $matches[1];
        
        try {
            $config = require __DIR__ . '/../../config/app.php';
            $jwtSecret = $config['jwt']['secret'];
            
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            
            // Simpan data user ke request attribute
            $_REQUEST['user'] = [
                'id' => $decoded->sub,
                'role' => $decoded->role
            ];
            
            return $next();
        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Unauthorized: ' . $e->getMessage()
            ]);
            return;
        }
    }
}
