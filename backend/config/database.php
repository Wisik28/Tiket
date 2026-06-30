<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

// Only load if not already loaded (e.g. in index.php)
if (!isset($_ENV['MONGO_URI']) && !isset($_ENV['MONGODB_URI'])) {
    if (file_exists(__DIR__ . '/../.env')) {
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
        $dotenv->load();
    }
}

function getDatabase(): \MongoDB\Database
{
    $mongoUri = $_ENV['MONGODB_URI'] ?? $_ENV['MONGO_URI'] ?? 'mongodb://localhost:27017';
    
    // Parse database name from connection string if MONGODB_DATABASE not set
    if (empty($_ENV['MONGODB_DATABASE'])) {
        $path = parse_url($mongoUri, PHP_URL_PATH);
        $mongoDb = $path ? trim($path, '/') : '';
        if (strpos($mongoDb, '?') !== false) {
            $mongoDb = explode('?', $mongoDb)[0];
        }
        if (empty($mongoDb)) {
            $mongoDb = 'tiket_db'; // fallback
        }
    } else {
        $mongoDb = $_ENV['MONGODB_DATABASE'];
    }

    // TLS options - allow self-signed/untrusted certs in development (Windows XAMPP fix)
    $options = [];
    $driverOptions = [];
    if (str_contains($mongoUri, 'mongodb+srv://') || str_contains($mongoUri, 'tls=true')) {
        $env = $_ENV['APP_ENV'] ?? 'development';
        if ($env === 'development') {
            // Append tlsAllowInvalidCertificates to URI for Windows XAMPP OpenSSL compatibility
            if (!str_contains($mongoUri, 'tlsAllowInvalidCertificates')) {
                $separator = str_contains($mongoUri, '?') ? '&' : '?';
                $mongoUri .= $separator . 'tlsAllowInvalidCertificates=true';
            }
        }
    }

    $client = new \MongoDB\Client($mongoUri, $options, $driverOptions);
    return $client->selectDatabase($mongoDb);
}
