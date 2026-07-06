import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Publisher import
import PublisherLayout from '../layouts/PublisherLayout'
import PublisherPage from '../pages/publisher/Dashboard'
import CreateEventPage from '../pages/publisher/CreateEvent'
import UpdateEventPage from '../pages/publisher/UpdateEvent'
import ProfilePage from '../pages/publisher/Profile'
import DaftarPesananPage from '../pages/publisher/DaftarPesanan'

// user import
import UserPage from '../pages/user/Dashboard'
import UserLayout from '../layouts/UserLayout'
import RiwayatPembelianPage from '../pages/user/RiwayatPembelian'
import ProfilePageUser from '../pages/user/ProfileUser'
import PembelianPage from '../pages/user/Pembelian'
import DetailRiwayatPage from '../pages/user/DetailRiwayat'

// cuma coba aja
import CobaPage from '../pages/publisher/Coba'
import CobaLagiPage from '../pages/publisher/CobaLagi'

// Halaman placeholder sementara
function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Selamat Datang di EventTicket</h1>
      <p>Halaman utama untuk user</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routing autentikasi */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routing user */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserPage />} />
            <Route path="riwayatPembelian" element={<RiwayatPembelianPage />} />
            <Route path="profileUser" element={<ProfilePageUser />} />
            <Route path="pembelian/:id" element={<PembelianPage />} />
            <Route path="detailRiwayat/:id" element={<DetailRiwayatPage />} />
          </Route>

          {/* Routing publisher */}
          <Route path="/publisher" element={<PublisherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PublisherPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/update/:id" element={<UpdateEventPage />} />
            <Route path="coba" element={<CobaPage />} />
            <Route path="cobalagi" element={<CobaLagiPage />} />
            <Route path="orders" element={<DaftarPesananPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
