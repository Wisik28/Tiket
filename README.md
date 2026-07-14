# 🎫 EventTicket — Platform Ticketing Event Online

Website ticketing event berbasis **pihak ketiga (marketplace)** yang menghubungkan **User** (pembeli tiket) dengan **Publisher** (penyelenggara event). Dibangun menggunakan React.js + Vite (frontend) dan PHP Composer + MongoDB Atlas (backend).

---

## 📁 Struktur Folder Proyek

```
eventticket/
├── frontend/                          # React.js + Vite
│   ├── public/
│   │   ├── favicon.ico
│   │   └── assets/
│   │       └── images/
│   ├── src/
│   │   ├── api/                       # Axios instance & endpoint helpers
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   ├── eventApi.js
│   │   │   ├── ticketApi.js
│   │   │   └── userApi.js
│   │   ├── assets/                    # Gambar, font, icon statis
│   │   │   └── images/
│   │   ├── components/                # Komponen reusable (shared)
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Pagination.jsx
│   │   │   ├── cards/
│   │   │   │   ├── EventCard.jsx
│   │   │   │   └── TicketCard.jsx
│   │   │   └── forms/
│   │   │       ├── LoginForm.jsx
│   │   │       ├── RegisterForm.jsx
│   │   │       └── SearchForm.jsx
│   │   ├── context/                   # React Context (Auth, Toast, dll)
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   └── useLocalStorage.js
│   │   ├── layouts/                   # Layout wrapper per role
│   │   │   ├── UserLayout.jsx
│   │   │   ├── PublisherLayout.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/                     # Halaman berdasarkan role
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── ForgotPassword.jsx
│   │   │   ├── user/                  # View khusus USER (pembeli)
│   │   │   │   ├── Home.jsx           # Landing page + daftar event
│   │   │   │   ├── EventList.jsx      # Browse semua event
│   │   │   │   ├── EventDetail.jsx    # Detail event & pilih tiket
│   │   │   │   ├── Checkout.jsx       # Halaman pembayaran
│   │   │   │   ├── PaymentConfirm.jsx # Konfirmasi pembayaran
│   │   │   │   ├── MyTickets.jsx      # Tiket yang dimiliki user
│   │   │   │   ├── TicketDetail.jsx   # Detail tiket + QR code
│   │   │   │   └── Profile.jsx        # Profil user
│   │   │   └── publisher/             # View khusus PUBLISHER (penyelenggara)
│   │   │       ├── Dashboard.jsx      # Ringkasan statistik
│   │   │       ├── EventManage.jsx    # Daftar event milik publisher
│   │   │       ├── EventCreate.jsx    # Form buat event baru
│   │   │       ├── EventEdit.jsx      # Edit event yang ada
│   │   │       ├── TicketType.jsx     # Manajemen jenis & harga tiket
│   │   │       ├── OrderList.jsx      # Daftar transaksi/order
│   │   │       ├── AttendeeList.jsx   # Daftar peserta per event
│   │   │       ├── SalesReport.jsx    # Laporan penjualan
│   │   │       └── PublisherProfile.jsx # Profil & info publisher
│   │   ├── routes/                    # Konfigurasi routing
│   │   │   ├── AppRouter.jsx
│   │   │   ├── UserRoutes.jsx
│   │   │   ├── PublisherRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/                     # Helper functions
│   │   │   ├── formatDate.js
│   │   │   ├── formatCurrency.js
│   │   │   └── validators.js
│   │   ├── constants/                 # Konstanta global
│   │   │   └── roles.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                           # PHP Composer + MongoDB Atlas
│   ├── app/
│   │   ├── Controllers/               # Controller per resource
│   │   │   ├── AuthController.php
│   │   │   ├── EventController.php
│   │   │   ├── TicketController.php
│   │   │   ├── OrderController.php
│   │   │   ├── UserController.php
│   │   │   └── PublisherController.php
│   │   ├── Models/                    # Model MongoDB
│   │   │   ├── User.php
│   │   │   ├── Publisher.php
│   │   │   ├── Event.php
│   │   │   ├── TicketType.php
│   │   │   ├── Order.php
│   │   │   └── Transaction.php
│   │   ├── Middleware/                # Middleware (Auth, Role, CORS)
│   │   │   ├── AuthMiddleware.php
│   │   │   ├── RoleMiddleware.php
│   │   │   └── CorsMiddleware.php
│   │   └── Services/                  # Business logic / service layer
│   │       ├── AuthService.php
│   │       ├── EventService.php
│   │       ├── OrderService.php
│   │       └── PaymentService.php
│   ├── config/                        # Konfigurasi aplikasi
│   │   ├── database.php               # Koneksi MongoDB Atlas
│   │   └── app.php                    # Konfigurasi umum (JWT secret, dll)
│   ├── public/                        # Entry point HTTP
│   │   └── index.php
│   ├── routes/                        # Definisi route API
│   │   ├── api.php                    # Router utama
│   │   ├── auth.php
│   │   ├── user.php
│   │   └── publisher.php
│   ├── storage/
│   │   ├── logs/
│   │   └── uploads/                   # File upload (banner event, dll)
│   ├── tests/
│   │   ├── Unit/
│   │   └── Feature/
│   ├── vendor/                        # Auto-generate oleh Composer
│   ├── .env
│   ├── .env.example
│   ├── .htaccess
│   ├── .gitignore
│   └── composer.json
│
├── .gitignore
└── README.md
```

---

## 🤝 Panduan Kolaborator (GitHub Workflow)

Untuk menjaga kerapian repositori dan alur kerja tim, seluruh kolaborator diharapkan mengikuti alur kerja (*Git Workflow*) berikut:

### 1. Kloning Repositori & Persiapan
Jika Anda belum mengkloning repositori ini ke komputer lokal Anda:
```bash
git clone git@github.com:Wisik28/MyPlan.git
cd MyPlan
```

### 2. Sinkronisasi Branch `main`
Sebelum mulai membuat fitur baru atau memperbaiki bug, selalu pastikan branch `main` lokal Anda adalah yang paling mutakhir:
```bash
git checkout main
git pull origin main
```

### 3. Membuat Branch Baru
Jangan pernah melakukan commit langsung ke branch `main`. Buatlah branch baru dengan penamaan yang deskriptif berdasarkan tugas Anda:
*   Fitur baru: `feat/nama-fitur`
*   Perbaikan bug: `fix/nama-bug`
*   Dokumentasi: `docs/nama-dokumentasi`
*   Refaktor/Optimasi: `refactor/nama-refaktor`

Contoh pembuatan branch:
```bash
git checkout -b feat/tampilan-upload
```

### 4. Melakukan Commit (Conventional Commits)
Gunakan pesan commit yang jelas dan deskriptif. Disarankan mengikuti format *Conventional Commits*:
*   `feat: menambahkan fitur upload kamera`
*   `fix: memperbaiki bug pada layout navbar`
*   `docs: memperbarui panduan instalasi di readme`

Cara commit:
```bash
git add .
git commit -m "feat: menambahkan komponen kamera untuk upload"
```

### 5. Mengirim Perubahan ke GitHub
Push branch lokal Anda ke repositori GitHub:
```bash
git push -u origin feat/tampilan-upload
```

### 6. Membuat Pull Request (PR)
1. Buka halaman repositori di GitHub.
2. Anda akan melihat tombol kuning bertuliskan **"Compare & pull request"** untuk branch yang baru saja Anda push. Klik tombol tersebut.
3. Berikan deskripsi yang jelas tentang perubahan yang Anda lakukan pada PR tersebut.
4. Minta anggota tim lainnya untuk melakukan *review*.g
5. Setelah disetujui (dan tidak ada konflik), PR dapat di-merge ke branch `main`.



## 🗂️ Penjelasan Role & View

### 👤 Role: USER (Pembeli Tiket)
| Halaman | Deskripsi |
|---|---|
| `Register` | Landing page, register akun baru |
| `Login` | Halaman login |
| `Home` | Landing page, event unggulan, pencarian event |
| `EventList` | Browse semua event dengan filter & kategori |
| `EventDetail` | Detail event, pilih jenis tiket & jumlah |
| `Checkout` | Isi data pemesan & proses pembayaran |
| `PaymentConfirm` | Konfirmasi & status pembayaran |
| `MyTickets` | Daftar semua tiket yang telah dibeli |
| `TicketDetail` | QR code tiket untuk check-in di venue |
| `Profile` | Edit profil & riwayat transaksi |

### 🏢 Role: PUBLISHER (Penyelenggara Event)
| Halaman | Deskripsi |
|---|---|
| `Register` | Landing page, register akun baru |
| `Login` | Halaman login |
| `Dashboard` | Statistik penjualan, grafik, ringkasan |
| `EventManage` | Daftar semua event milik publisher |
| `EventCreate` | Form membuat event baru |
| `EventEdit` | Edit detail event yang sudah ada |
| `TicketType` | Atur jenis tiket (VIP, Regular, dll) & harga |
| `OrderList` | Semua transaksi pembelian tiket event ini |
| `AttendeeList` | Daftar peserta beserta status kehadiran |
| `SalesReport` | Laporan penjualan & rekap pendapatan |
| `PublisherProfile` | Edit profil & informasi penyelenggara |

---

## ⚙️ Panduan Instalasi & Setup

### Prasyarat
Pastikan tools berikut sudah terinstal di sistem:

| Tool | Versi Minimum | Cek Versi |
|---|---|---|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| PHP | 8.1 | `php -v` |
| Composer | 2.x | `composer --version` |
| Git | - | `git --version` |

---

## 🎨 Frontend — React.js + Vite

### 1. Inisialisasi Proyek

```bash
# Masuk ke direktori proyek utama
cd eventticket

# Buat proyek React + Vite
npm create vite@latest frontend -- --template react

# Masuk ke folder frontend
cd frontend
```

### 2. Install Dependensi Utama

```bash
# Install semua dependensi default
npm install

# Install library tambahan yang dibutuhkan
npm install react-router-dom        # Routing
npm install axios                   # HTTP client ke backend
npm install @tanstack/react-query   # Data fetching & caching
npm install react-hook-form         # Manajemen form
npm install zod                     # Validasi schema
npm install @hookform/resolvers     # Integrasi zod + react-hook-form
npm install react-hot-toast         # Notifikasi toast
npm install date-fns                # Utilitas format tanggal
npm install qrcode.react            # Generate QR code tiket
```

### 3. Install Dependensi Dev (Opsional tapi Disarankan)

```bash
npm install -D tailwindcss postcss autoprefixer   # Styling
npx tailwindcss init -p                           # Init config Tailwind
```

### 4. Konfigurasi File `.env`

Buat file `.env` di dalam folder `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=EventTicket
```

> ⚠️ Semua variabel environment di Vite **wajib** diawali dengan `VITE_`

### 5. Konfigurasi `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### 6. Menjalankan Frontend

```bash
# Mode development (hot-reload aktif)
npm run dev

# Build untuk production
npm run build

# Preview hasil build production
npm run preview
```

Frontend akan berjalan di: **http://localhost:3000**

---

## 🖥️ Backend — PHP Composer + MongoDB Atlas

### 1. Inisialisasi Proyek Composer

```bash
# Dari direktori root proyek
cd eventticket/backend

# Inisialisasi composer.json baru
composer init
```

Isi prompt interaktif:
- **Package name**: `eventticket/backend`
- **Description**: `Backend API EventTicket`
- **Author**: nama kamu
- **Minimum Stability**: `stable`
- **License**: `MIT`

### 2. Install Package PHP yang Dibutuhkan

```bash
# MongoDB driver untuk PHP
composer require mongodb/mongodb

# JWT untuk autentikasi
composer require firebase/php-jwt

# Dotenv untuk membaca file .env
composer require vlucas/phpdotenv

# Router HTTP ringan
composer require nikic/fast-route

# Validasi data
composer require respect/validation

# Untuk generate UUID
composer require ramsey/uuid
```

### 3. Install Package Dev

```bash
# PHPUnit untuk testing
composer require --dev phpunit/phpunit
```

### 4. Setup Autoload di `composer.json`

Tambahkan bagian `autoload` agar class PHP dapat di-load otomatis:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "app/"
    }
  }
}
```

Setelah mengedit `composer.json`, jalankan:

```bash
composer dump-autoload
```

### 5. Konfigurasi File `.env`

Buat file `.env` di dalam folder `backend/`:

```env
APP_ENV=development
APP_URL=http://localhost:8000
APP_SECRET=your_super_secret_key_here

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
MONGODB_DATABASE=eventticket_db

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=86400
```

> 🔗 Ganti `<username>`, `<password>`, dan URI sesuai connection string dari MongoDB Atlas Dashboard.

### 6. Konfigurasi Koneksi MongoDB (`config/database.php`)

```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

function getDatabase(): \MongoDB\Database
{
    $client = new \MongoDB\Client($_ENV['MONGODB_URI']);
    return $client->selectDatabase($_ENV['MONGODB_DATABASE']);
}
```

### 7. Konfigurasi `.htaccess` (untuk Apache)

Buat file `.htaccess` di dalam folder `backend/public/`:

```apache
Options -MultiViews
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.php [QSA,L]
```

### 8. Entry Point `public/index.php`

```php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Load CORS Middleware
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load routes
require_once __DIR__ . '/../routes/api.php';
```

### 9. Menjalankan Backend

```bash
# Jalankan PHP built-in server (development)
cd backend
php -S localhost:8000 -t public/

# Atau jika menggunakan Apache / XAMPP, arahkan document root ke folder public/
```

Backend API akan berjalan di: **http://localhost:8000**

---

## 🔗 Struktur API Endpoint

### Auth
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| POST | `/api/auth/register` | Registrasi akun baru | Public |
| POST | `/api/auth/login` | Login & dapat JWT token | Public |
| POST | `/api/auth/logout` | Logout & invalidasi token | All |
| POST | `/api/auth/refresh` | Refresh JWT token | All |

### Events (User)
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/events` | Ambil semua event (publik) | Public |
| GET | `/api/events/{id}` | Detail event | Public |
| GET | `/api/events/search` | Cari event | Public |

### Tickets & Orders (User)
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| POST | `/api/orders` | Buat order / beli tiket | User |
| GET | `/api/orders/my` | Daftar order milik user | User |
| GET | `/api/orders/{id}` | Detail order | User |
| GET | `/api/tickets/my` | Daftar tiket dimiliki | User |

### Publisher
| Method | Endpoint | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/publisher/events` | Daftar event publisher | Publisher |
| POST | `/api/publisher/events` | Buat event baru | Publisher |
| PUT | `/api/publisher/events/{id}` | Update event | Publisher |
| DELETE | `/api/publisher/events/{id}` | Hapus event | Publisher |
| GET | `/api/publisher/orders` | Daftar order event publisher | Publisher |
| GET | `/api/publisher/reports` | Laporan penjualan | Publisher |

---

## 🧪 Menjalankan Full Stack

Buka **2 terminal** secara bersamaan:

**Terminal 1 — Frontend:**
```bash
cd eventticket/frontend
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd eventticket/backend
php -S localhost:8000 -t public/
```

Akses aplikasi di browser: **http://localhost:3000**

---

## 📦 Ringkasan Command Penting

### Frontend (React + Vite)
```bash
npm create vite@latest frontend -- --template react   # Init proyek
npm install                                           # Install semua dependensi
npm run dev                                           # Jalankan dev server
npm run build                                         # Build production
npm run preview                                       # Preview build
```

### Backend (PHP Composer)
```bash
composer init                     # Init proyek baru
composer require <package>        # Install package
composer remove <package>         # Hapus package
composer update                   # Update semua package
composer install                  # Install dari composer.lock
composer dump-autoload            # Regenerate autoloader
php -S localhost:8000 -t public/  # Jalankan dev server
vendor/bin/phpunit                # Jalankan unit test
```

---

## 🌐 Collection MongoDB (Database Schema)

| Collection | Deskripsi |
|---|---|
| `users` | Data akun user (pembeli) |
| `publishers` | Data akun publisher (penyelenggara) |
| `events` | Data event yang dibuat publisher |
| `ticket_types` | Jenis tiket per event (VIP, Regular, dll) |
| `orders` | Transaksi pembelian tiket |
| `transactions` | Log detail pembayaran |

---

## 👥 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

---

> Dibuat untuk project website ticketing event online — platform perantara antara User dan Publisher.
