<?php

namespace App\Controllers;

use App\Services\EventService;

class EventController
{
    private $eventService;

    public function __construct()
    {
        $this->eventService = new EventService();
    }

    /**
     * GET /api/publisher/events
     * Ambil semua event milik publisher yang sedang login
     */
    public function index()
    {
        try {
            $publisherId = $_REQUEST['user']['id'];
            $events = $this->eventService->getAllEvents($publisherId);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Events retrieved successfully.',
                'data'    => $events
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
     * GET /api/user/events
     * Ambil semua event (untuk user)
     */
    public function publicIndex()
    {
        try {
            $events = $this->eventService->getPublicEvents();

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Events retrieved successfully.',
                'data'    => $events
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
     * GET /api/publisher/events/{id}
     * Ambil detail satu event milik publisher
     */
    public function show(string $id)
    {
        try {
            $publisherId = $_REQUEST['user']['id'];
            $event = $this->eventService->getEventById($id, $publisherId);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Event retrieved successfully.',
                'data'    => $event
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
     * POST /api/publisher/events
     * Buat event baru
     */
    public function store()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        try {
            $publisherId = $_REQUEST['user']['id'];
            $event = $this->eventService->createEvent($input, $publisherId);

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Event created successfully.',
                'data'    => $event
            ]);
        } catch (\InvalidArgumentException $e) {
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
     * PUT /api/publisher/events/{id}
     * Update event milik publisher
     */
    public function update(string $id)
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        try {
            $publisherId = $_REQUEST['user']['id'];
            $event = $this->eventService->updateEvent($id, $input, $publisherId);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Event updated successfully.',
                'data'    => $event
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
     * DELETE /api/publisher/events/{id}
     * Hapus event milik publisher
     */
    public function destroy(string $id)
    {
        try {
            $publisherId = $_REQUEST['user']['id'];
            $this->eventService->deleteEvent($id, $publisherId);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Event deleted successfully.'
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
