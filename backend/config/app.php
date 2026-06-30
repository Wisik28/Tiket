<?php

return [
    'env' => $_ENV['APP_ENV'] ?? 'development',
    'url' => $_ENV['APP_URL'] ?? 'http://localhost:8000',
    'secret' => $_ENV['APP_SECRET'] ?? '',
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'default_secret_key',
        'expire' => (int)($_ENV['JWT_EXPIRE'] ?? 86400),
    ],
    'port' => $_ENV['PORT'] ?? 8000,
];
