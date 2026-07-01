<?php

use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

return function (\FastRoute\RouteCollector $r) {

    // Semua route di sini membutuhkan:
    // 1. AuthMiddleware  — user harus login (JWT valid)
    // 2. RoleMiddleware  — user harus memiliki role "publisher"

    $middlewares = [
        AuthMiddleware::class,
        [RoleMiddleware::class, 'publisher'],
    ];

    // GET /api/publisher/events — ambil semua event milik publisher
    $r->addRoute('GET', '/api/publisher/events', [
        'App\Controllers\EventController',
        'index',
        $middlewares
    ]);

    // GET /api/publisher/events/{id} — ambil detail event
    $r->addRoute('GET', '/api/publisher/events/{id}', [
        'App\Controllers\EventController',
        'show',
        $middlewares
    ]);

    // POST /api/publisher/events — buat event baru
    $r->addRoute('POST', '/api/publisher/events', [
        'App\Controllers\EventController',
        'store',
        $middlewares
    ]);

    // PUT /api/publisher/events/{id} — update event
    $r->addRoute('PUT', '/api/publisher/events/{id}', [
        'App\Controllers\EventController',
        'update',
        $middlewares
    ]);

    // DELETE /api/publisher/events/{id} — hapus event
    $r->addRoute('DELETE', '/api/publisher/events/{id}', [
        'App\Controllers\EventController',
        'destroy',
        $middlewares
    ]);
};
