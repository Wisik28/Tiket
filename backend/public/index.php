<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use Dotenv\Dotenv;

// Load Env
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
}

// Suppress PHP warnings/notices from being output before JSON (they corrupt the response)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Always respond with JSON
header('Content-Type: application/json');

// Handle CORS first
\App\Middleware\CorsMiddleware::handle(function() {
    // Apply Rate Limiting globally (60 requests per 1 minute)
    \App\Middleware\RateLimitMiddleware::handle(function() {
        // Fetch method and URI
        $httpMethod = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];

    // Strip query string (?foo=bar) and decode URI
    if (false !== $pos = strpos($uri, '?')) {
        $uri = substr($uri, 0, $pos);
    }
    $uri = rawurldecode($uri);

    // Load router dispatcher
    $dispatcher = require __DIR__ . '/../routes/api.php';

    $routeInfo = $dispatcher->dispatch($httpMethod, $uri);

    switch ($routeInfo[0]) {
        case \FastRoute\Dispatcher::NOT_FOUND:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Not Found']);
            break;
            
        case \FastRoute\Dispatcher::METHOD_NOT_ALLOWED:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
            break;
            
        case \FastRoute\Dispatcher::FOUND:
            $handler = $routeInfo[1];
            $vars = $routeInfo[2];
            
            $controllerName = $handler[0];
            $methodName = $handler[1];
            $middlewares = $handler[2] ?? [];
            
            $execute = function() use ($controllerName, $methodName, $vars) {
                $controller = new $controllerName();
                return call_user_func_array([$controller, $methodName], $vars);
            };
            
            $pipeline = $execute;
            foreach (array_reverse($middlewares) as $middlewareSpec) {
                if (is_array($middlewareSpec)) {
                    $middlewareClass = $middlewareSpec[0];
                    $params = array_slice($middlewareSpec, 1);
                    $pipeline = function() use ($middlewareClass, $params, $pipeline) {
                        return call_user_func_array([$middlewareClass, 'handle'], array_merge([$pipeline], $params));
                    };
                } else {
                    $middlewareClass = $middlewareSpec;
                    $pipeline = function() use ($middlewareClass, $pipeline) {
                        return $middlewareClass::handle($pipeline);
                    };
                }
            }
            
            $pipeline();
            break;
    }
    });
});
