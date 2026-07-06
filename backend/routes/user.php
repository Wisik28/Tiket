<?php

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (\FastRoute\RouteCollector $r) {

    // GET /api/user/events — ambil semua event publik (terbuka untuk user & publisher terautentikasi)
    $r->addRoute('GET', '/api/user/events', [
        'App\Controllers\EventController',
        'publicIndex',
        [AuthMiddleware::class]
    ]);

    // POST /api/user/tickets — buat pembelian tiket (hanya role "user")
    $r->addRoute('POST', '/api/user/tickets', [
        'App\Controllers\TicketController',
        'store',
        [
            AuthMiddleware::class,
            [RoleMiddleware::class, 'user']
        ]
    ]);

    // GET /api/user/tickets — ambil riwayat pembelian tiket user (hanya role "user")
    $r->addRoute('GET', '/api/user/tickets', [
        'App\Controllers\TicketController',
        'index',
        [
            AuthMiddleware::class,
            [RoleMiddleware::class, 'user']
        ]
    ]);
};
