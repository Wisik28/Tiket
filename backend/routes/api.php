<?php

use FastRoute\RouteCollector;
use function FastRoute\simpleDispatcher;

$dispatcher = simpleDispatcher(function (RouteCollector $r) {
    // Load auth routes
    $authRoutes = require __DIR__ . '/auth.php';
    $authRoutes($r);

    // Load event routes (publisher CRUD)
    $eventRoutes = require __DIR__ . '/event.php';
    $eventRoutes($r);

    // Load user routes (dashboard, purchase ticket)
    $userRoutes = require __DIR__ . '/user.php';
    $userRoutes($r);
});

return $dispatcher;
