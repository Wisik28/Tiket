<?php

return function (\FastRoute\RouteCollector $r) {

    // POST /api/payment/webhook — notifikasi dari Midtrans (tanpa auth, Midtrans yang hit endpoint ini)
    $r->addRoute('POST', '/api/payment/webhook', [
        'App\Controllers\TicketController',
        'handleWebhook',
        [] // Tidak pakai middleware — Midtrans langsung hit endpoint ini
    ]);
};
