<?php

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (\FastRoute\RouteCollector $r) {

    // Semua route di sini membutuhkan:
    // 1. AuthMiddleware  — user harus login (JWT valid)
    // 2. RoleMiddleware  — user harus memiliki role "user"

    $middlewares = [
        AuthMiddleware::class,
        [RoleMiddleware::class, 'user'],
    ];

    // GET /api/user/events — ambil semua event publik
    $r->addRoute('GET', '/api/user/events', [
        'App\Controllers\EventController',
        'publicIndex',
        $middlewares
    ]);

    // POST /api/user/tickets — buat pembelian tiket
    $r->addRoute('POST', '/api/user/tickets', [
        'App\Controllers\TicketController',
        'store',
        $middlewares
    ]);
};
