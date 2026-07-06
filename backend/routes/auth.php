<?php

return function (\FastRoute\RouteCollector $r) {
    $r->addRoute('POST', '/api/auth/register', ['App\Controllers\AuthController', 'register']);
    $r->addRoute('POST', '/api/auth/login', ['App\Controllers\AuthController', 'login']);
};

