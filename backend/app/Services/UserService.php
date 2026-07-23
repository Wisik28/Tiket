<?php

namespace App\Services;

use App\Models\User;
use Respect\Validation\Validator as v;
use Respect\Validation\Exceptions\NestedValidationException;

class UserService
{
    /**
     * Memperbarui profile user
     * 
     * @param string $userId
     * @param array $input
     * @param string $role
     * @return array Data user yang telah diperbarui
     * @throws \InvalidArgumentException Jika validasi gagal
     * @throws \RuntimeException Jika user tidak ditemukan
     */
    public function updateProfile(string $userId, array $input, string $role)
    {
        // Validasi opsional (tergantung field apa yang dikirim)
        // Kita buat sederhana: name jika dikirim tidak boleh kosong
        if (isset($input['name']) && empty(trim($input['name']))) {
            throw new \InvalidArgumentException('Nama harus diisi.');
        }

        // Jika bukan publisher, jangan izinkan edit company_name
        if ($role !== 'publisher' && isset($input['company_name'])) {
            unset($input['company_name']);
        }

        // Jika array $input kosong dari data yang relevan, throw exception atau lanjutkan
        $updateSuccess = User::updateProfile($userId, $input);

        $user = User::findById($userId);
        if (!$user) {
            throw new \RuntimeException('Pengguna tidak ditemukan.');
        }

        // Jangan kembalikan password di response
        unset($user['password']);

        // Ubah ObjectID ke string untuk response API
        $user['_id'] = (string) $user['_id'];
        
        // Ubah format tanggal (jika diperlukan)
        if (isset($user['createdAt'])) {
            $user['createdAt'] = $user['createdAt']->toDateTime()->format(\DateTime::ATOM);
        }
        if (isset($user['updatedAt'])) {
            $user['updatedAt'] = $user['updatedAt']->toDateTime()->format(\DateTime::ATOM);
        }

        return (array) $user;
    }
}
