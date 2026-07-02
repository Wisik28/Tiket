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

            $ticket = $this->ticketService->purchase($userId, $input['event_id'], (int) $input['quantity']);

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
}
