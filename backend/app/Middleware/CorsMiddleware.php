<?php

namespace App\Middleware;

class CorsMiddleware
{
    public static function handle(callable $next)
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (!empty($origin)) {  
            header("Access-Control-Allow-Origin: " . $origin);
            header("Access-Control-Allow-Credentials: true");
        } else {
            header("Access-Control-Allow-Origin: *");
        }

        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        return $next();
    }
}

