import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../style/LoginPage.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (formData) => {
    try {
      // Kirim email & password ke API, backend yang menentukan role
      const userData = await login({
        email: formData.email,
        password: formData.password,
      })

      toast.success(`Selamat datang, ${userData.name}!`)

      // Redirect berdasarkan role yang dikembalikan dari backend
      if (userData.role === 'publisher') {
        navigate('/publisher/dashboard', { replace: true })
      } else if (userData.role === 'user'){
        navigate('/user/dashboard', { replace: true })
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login gagal. Periksa email dan password Anda.'
      toast.error(message)
    }
  }

  return (
    <div className="login-page">
      {/* Animated background elements */}
      <div className="login-bg-decoration">
        <div className="login-bg-orb login-bg-orb--1" />
        <div className="login-bg-orb login-bg-orb--2" />
        <div className="login-bg-orb login-bg-orb--3" />
        <div className="login-bg-grid" />
      </div>

      <div className="login-container">
        {/* Left panel - branding */}
        <div className="login-branding">
          <div className="login-branding__content">
            <div className="login-branding__icon">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 20h40" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="36" cy="28" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 28h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M0 24l8-4v8z" fill="currentColor" opacity="0.3" />
              </svg>
            </div>
            <h1 className="login-branding__title">EventTicket</h1>
            <p className="login-branding__subtitle">
              Platform tiket event terpercaya untuk pengalaman yang tak terlupakan
            </p>

            <div className="login-branding__features">
              <div className="login-branding__feature">
                <div className="login-branding__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>Pembayaran Aman & Terenkripsi</span>
              </div>
              <div className="login-branding__feature">
                <div className="login-branding__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <span>E-Ticket Digital Instan</span>
              </div>
              <div className="login-branding__feature">
                <div className="login-branding__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span>Untuk User & Publisher</span>
              </div>
            </div>
          </div>

          <p className="login-branding__footer">
            &copy; {new Date().getFullYear()} EventTicket. All rights reserved.
          </p>
        </div>

        {/* Right panel - login form */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <svg viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
                <path d="M4 20h40" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="36" cy="28" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M12 28h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>EventTicket</span>
            </div>

            <div className="login-form-header">
              <h2 className="login-form-header__title">Masuk ke Akun Anda</h2>
              <p className="login-form-header__desc">
                Satu akun untuk semua — baik sebagai <strong>User</strong> maupun <strong>Publisher</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form" id="login-form">
              {/* Email field */}
              <div className="login-field">
                <label htmlFor="login-email" className="login-field__label">
                  Email
                </label>
                <div className={`login-field__input-wrapper ${errors.email ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="login-field__input"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="login-field__error">{errors.email.message}</p>
                )}
              </div>

              {/* Password field */}
              <div className="login-field">
                <label htmlFor="login-password" className="login-field__label">
                  Password
                </label>
                <div className={`login-field__input-wrapper ${errors.password ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="login-field__input"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-field__toggle"
                    id="toggle-password"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="login-field__error">{errors.password.message}</p>
                )}
              </div>

              {/* Info badge */}
              <div className="login-role-info">
                <div className="login-role-info__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </div>
                <p>
                  Sistem akan otomatis mengenali akun Anda sebagai <strong>User</strong> atau <strong>Publisher</strong>
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
                id="login-submit-btn"
              >
                {loading ? (
                  <span className="login-submit-btn__loading">
                    <svg className="login-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="15" strokeLinecap="round" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  <span className="login-submit-btn__text">
                    Masuk
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Register link */}
            <p className="login-register-link">
              Belum punya akun?{' '}
              <Link to="/register" id="register-link">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
