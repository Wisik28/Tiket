<?php

namespace App\Middleware;

class RoleMiddleware
{
    public static function handle(callable $next, ...$allowedRoles)
    {
        $user = $_REQUEST['user'] ?? null;

        if (!$user || empty($user['role'])) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Missing authentication or role.'
            ]);
            return;
        }

        if (!in_array($user['role'], $allowedRoles)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Forbidden: Access denied.'
            ]);
            return;
        }

        return $next();
    }
}
