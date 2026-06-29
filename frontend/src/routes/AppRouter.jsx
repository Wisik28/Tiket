import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import PublisherLayout from '../layouts/PublisherLayout'

// Halaman placeholder sementara
function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Selamat Datang di EventTicket</h1>
      <p>Halaman utama untuk user</p>
    </div>
  )
}

function PublisherDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Publisher</h1>
      <p className="text-gray-600 mt-2">Selamat datang di dashboard publisher Anda.</p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route path="/" element={<HomePage />} />

          {/* Publisher routes */}
          <Route path="/publisher" element={<PublisherLayout />}>
            <Route path="dashboard" element={<PublisherDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
