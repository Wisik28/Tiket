<?php

namespace App\Services;

/**
 * PaymentService
 * 
 * Menangani integrasi dengan Midtrans untuk generate Virtual Account.
 * Saat ini mendukung metode Bank Transfer (BNI, BRI, Mandiri, Permata).
 */
class PaymentService
{
    private string $serverKey;
    private string $clientKey;
    private bool $isProduction;
    private string $baseUrl;

    public function __construct()
    {
        $this->serverKey    = $_ENV['MIDTRANS_SERVER_KEY'] ?? '';
        $this->clientKey    = $_ENV['MIDTRANS_CLIENT_KEY'] ?? '';
        $this->isProduction = ($_ENV['MIDTRANS_IS_PRODUCTION'] ?? 'false') === 'true';
        $this->baseUrl      = $this->isProduction
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Membuat transaksi Virtual Account di Midtrans.
     *
     * @param string $orderId     ID unik order (misal: "TICKET-{ticketId}")
     * @param int    $totalPrice  Total harga dalam Rupiah
     * @param array  $customer    Data customer ['name', 'email']
     * @param string $bank        Bank untuk VA: bni | bri | mandiri | permata
     * 
     * @return array  Response dari Midtrans berisi va_number, expiry_time, dll.
     */
    public function createVirtualAccount(
        string $orderId,
        int $totalPrice,
        array $customer,
        string $bank = 'bni'
    ): array {
        $payload = [
            'payment_type' => 'bank_transfer',
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $totalPrice,
            ],
            'bank_transfer' => [
                'bank' => $bank,
            ],
            'customer_details' => [
                'first_name' => $customer['name'] ?? 'Customer',
                'email'      => $customer['email'] ?? '',
            ],
        ];

        $response = $this->sendRequest('/charge', $payload);

        return $response;
    }

    /**
     * Mengirim HTTP request ke Midtrans API.
     */
    private function sendRequest(string $endpoint, array $payload): array
    {
        $url = $this->baseUrl . $endpoint;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Accept: application/json',
                'Authorization: Basic ' . base64_encode($this->serverKey . ':'),
            ],
        ]);

        $result   = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($result === false) {
            throw new \RuntimeException('Gagal terhubung ke Midtrans.', 500);
        }

        $data = json_decode($result, true);

        if ($httpCode >= 400) {
            $errorMsg = $data['status_message'] ?? 'Midtrans error.';
            throw new \RuntimeException($errorMsg, $httpCode);
        }

        return $data;
    }

    /**
     * Mendapatkan Client Key (dipakai di frontend).
     */
    public function getClientKey(): string
    {
        return $this->clientKey;
    }
}
