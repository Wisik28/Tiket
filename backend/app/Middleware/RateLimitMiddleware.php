<?php

namespace App\Middleware;

class RateLimitMiddleware
{
    /**
     * @param callable $next The next middleware/closure to call
     * @param int $limit Maximum number of requests allowed
     * @param int $timeWindowSeconds Time window in seconds
     */
    public static function handle(callable $next, $limit = 60, $timeWindowSeconds = 60)
    {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (strpos($ip, ',') !== false) {
            $ip = explode(',', $ip)[0];
        }
        $ip = trim($ip);

        // If IP is unknown, we just pass (or we could block, but pass is safer)
        if (empty($ip) || $ip === 'unknown') {
            return $next();
        }

        $db = getDatabase();
        $collection = $db->selectCollection('rate_limits');

        $now = time();
        $record = $collection->findOne(['ip' => $ip]);

        if ($record) {
            $windowStart = $record['window_start'] ?? 0;
            if (($now - $windowStart) > $timeWindowSeconds) {
                // Time window expired, reset count and window start
                $collection->updateOne(
                    ['ip' => $ip],
                    ['$set' => ['count' => 1, 'window_start' => $now]]
                );
            } else {
                // Still in the same time window
                if ($record['count'] >= $limit) {
                    http_response_code(429);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Too Many Requests. Please try again later.'
                    ]);
                    exit;
                }
                
                // Increment count
                $collection->updateOne(
                    ['ip' => $ip],
                    ['$inc' => ['count' => 1]]
                );
            }
        } else {
            // New IP
            $collection->insertOne([
                'ip' => $ip,
                'count' => 1,
                'window_start' => $now
            ]);
        }

        return $next();
    }
}
