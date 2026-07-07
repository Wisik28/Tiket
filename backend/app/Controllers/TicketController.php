<?php

namespace App\Controllers;

use App\Services\TicketService;

class TicketController
{
    private $ticketService;

    public function __construct()
    {
        $this->ticketService = new TicketService();
    }

    /**
     * GET /api/user/tickets
     * Mengambil riwayat transaksi tiket milik user yang login
     */
    public function index()
    {
        try {
            $userId = $_REQUEST['user']['id'];
            $tickets = $this->ticketService->getUserTickets($userId);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Tickets retrieved successfully.',
                'data'    => $tickets
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Internal Server Error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * POST /api/user/tickets
     * Membeli tiket
     */
    public function store()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        try {
            $userId = $_REQUEST['user']['id'];
            
            if (!isset($input['event_id']) || !isset($input['quantity'])) {
                throw new \InvalidArgumentException('event_id and quantity are required.', 400);
            }

            $bank   = $input['bank'] ?? 'bni';
            $ticket = $this->ticketService->purchase($userId, $input['event_id'], (int) $input['quantity'], $bank);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Ticket purchased successfully.',
                'data'    => $ticket
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Internal Server Error: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * POST /api/payment/webhook
     * Menerima notifikasi pembayaran dari Midtrans (tanpa auth)
     */
    public function handleWebhook()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];

        try {
            $serverKey = $_ENV['MIDTRANS_SERVER_KEY'] ?? '';
            $this->ticketService->handleWebhookNotification($input, $serverKey);

            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Notification processed.']);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Internal Server Error']);
        }
    }
}
