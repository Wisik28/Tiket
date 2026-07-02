import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import PublisherLayout from '../layouts/PublisherLayout'
import PublisherPage from '../pages/publisher/Dashboard'
import CreateEventPage from '../pages/publisher/CreateEvent'
import UpdateEventPage from '../pages/publisher/UpdateEvent'

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
          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User routes */}
          <Route path="/" element={<HomePage />} />

          {/* Publisher routes */}
          <Route path="/publisher" element={<PublisherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PublisherPage />} />
            <Route path="events/create" element={<CreateEventPage />} />
            <Route path="events/update/:id" element={<UpdateEventPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
