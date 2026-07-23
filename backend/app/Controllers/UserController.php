<?php

namespace App\Controllers;

use App\Services\UserService;

class UserController
{
    private $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    /**
     * PUT /api/user/profile
     * Mengubah data profile user / publisher yang login
     */
    public function updateProfile()
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        
        try {
            $userId = $_REQUEST['user']['id'];
            $role = $_REQUEST['user']['role'];
            
            $updatedUser = $this->userService->updateProfile($userId, $input, $role);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully.',
                'data'    => $updatedUser
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
