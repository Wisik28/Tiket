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

        // Handle image file upload if exists (Upload to Cloudinary)
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $cloudinaryUrl = $this->uploadToCloudinary($_FILES['image']);
            if ($cloudinaryUrl) {
                $input['image_url'] = $cloudinaryUrl;
            }
        }

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

        // Handle image file upload if exists (Upload to Cloudinary)
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $cloudinaryUrl = $this->uploadToCloudinary($_FILES['image']);
            if ($cloudinaryUrl) {
                $input['image_url'] = $cloudinaryUrl;
            }
        }

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

    /**
     * Upload an image file to Cloudinary.
     * Supports both signed and unsigned upload configurations.
     */
    private function uploadToCloudinary(array $file): ?string
    {
        $cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? null;
        // Jika cloud name belum diganti maka akan mengembalikan nilai null
        if (!$cloudName || $cloudName === 'your_cloud_name') {
            return null;
        }

        $apiKey = $_ENV['CLOUDINARY_API_KEY'] ?? null;
        $apiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? null;
        $uploadPreset = $_ENV['CLOUDINARY_UPLOAD_PRESET'] ?? null;

        // Check jika API key atau secret atau preset belum diganti maka akan mengembalikan nilai null
        if ($apiKey === 'your_api_key' || $apiKey === '') $apiKey = null;
        if ($apiSecret === 'your_api_secret' || $apiSecret === '') $apiSecret = null;
        if ($uploadPreset === 'your_upload_preset' || $uploadPreset === '') $uploadPreset = null;

        $url = "https://api.cloudinary.com/v1_1/{$cloudName}/image/upload";
        $postFields = [];

        // Check signed upload configuration
        if ($apiKey && $apiSecret) {
            $timestamp = time();
            $params = [
                'timestamp' => $timestamp
            ];
            ksort($params);
            
            $serialized = [];
            foreach ($params as $key => $value) {
                $serialized[] = "$key=$value";
            }
            $stringToSign = implode('&', $serialized) . $apiSecret;
            $signature = sha1($stringToSign);

            $postFields['file'] = new \CURLFile($file['tmp_name'], $file['type'], $file['name']);
            $postFields['timestamp'] = $timestamp;
            $postFields['api_key'] = $apiKey;
            $postFields['signature'] = $signature;
        } elseif ($uploadPreset) {
            // Fallback to unsigned upload
            $postFields['file'] = new \CURLFile($file['tmp_name'], $file['type'], $file['name']);
            $postFields['upload_preset'] = $uploadPreset;
        } else {
            return null; // Missing credentials or presets
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Fix for Windows XAMPP SSL cert issues

        $response = curl_exec($ch);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            return null;
        }

        $result = json_decode($response, true);
        return $result['secure_url'] ?? $result['url'] ?? null;
    }
}
