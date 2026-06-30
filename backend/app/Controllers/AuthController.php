<?php

namespace App\Controllers;

use App\Services\AuthService;

class AuthController
{
    private $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function register()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        try {
            $user = $this->authService->register($input);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'User registered successfully.',
                'data' => $user
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 409);
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

    public function login()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

        try {
            $result = $this->authService->login($input);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Login successful.',
                'data' => $result
            ]);
        } catch (\InvalidArgumentException $e) {
            http_response_code($e->getCode() ?: 400);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        } catch (\RuntimeException $e) {
            http_response_code($e->getCode() ?: 401);
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
