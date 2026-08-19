import React, { useState, useEffect, useRef } from 'react'
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

// Function utama login page
export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState(null)
  const recaptchaRef = useRef(null)

  // Load and render Google reCAPTCHA
  useEffect(() => {
    let widgetId = null

    const renderCaptcha = () => {
      if (!recaptchaRef.current) return
      if (recaptchaRef.current.children.length > 0) return

      try {
        widgetId = window.grecaptcha.render(recaptchaRef.current, {
          sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
          callback: (token) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          'error-callback': () => setCaptchaToken(null),
        })
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error)
      }
    }

    const initCaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(renderCaptcha)
      } else {
        // Script not yet loaded, keep checking
        const interval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.ready) {
            clearInterval(interval)
            window.grecaptcha.ready(renderCaptcha)
          }
        }, 100)
        // Cleanup interval after 10s to avoid memory leak
        setTimeout(() => clearInterval(interval), 10000)
      }
    }

    const scriptId = 'google-recaptcha-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Init after component mount
    initCaptcha()

    return () => {
      // Cleanup: reset the widget if it was rendered
      if (widgetId !== null && window.grecaptcha && window.grecaptcha.reset) {
        try { window.grecaptcha.reset(widgetId) } catch (_) {}
      }
    }
  }, [])

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

  // handler jika login menggunakan google berhasil
  const handleGoogleSuccess = async (credential) => {
    try {
      console.log('Google Credential Token received:', credential)
      const userData = await googleLogin(credential, { is_register: false })
      toast.success(`Selamat datang, ${userData.name}!`)
      if (userData.role === 'publisher') {
        navigate('/publisher/dashboard', { replace: true })
      } else {
        navigate('/user/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Google login error:', error)
      const message =
        error.response?.data?.message || error.message || 'Gagal masuk dengan Google. Coba lagi'
      
      toast.error(message)

      // Jika akun belum pernah terdaftar, alihkan pengguna ke halaman registrasi setelah toast
      if (
        error.response?.status === 404 ||
        message.includes('belum didaftarkan') ||
        message.includes('registrasi')
      ) {
        setTimeout(() => {
          navigate('/register')
        }, 2500)
      }
    }
  }

  // useeffect untuk menginisialisasi google sign in
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

    // handler jika google sign in berhasil
    const initializeGoogle = () => {
      if (window.google?.accounts?.id && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              handleGoogleSuccess(response.credential)
            }
          },
        })

        const btnDiv = document.getElementById('googleBtnContainer')
        if (btnDiv) {
          btnDiv.innerHTML = ''
          window.google.accounts.id.renderButton(btnDiv, {
            theme: 'outline',
            size: 'large',
            width: '360',
            text: 'continue_with',
            shape: 'rectangular',
          })
        }
      }
    }

    // cek apakah sudah ada script google sign in
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script')
      script.id = 'google-gsi-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogle
      document.body.appendChild(script)
    } else {
      initializeGoogle()
    }
  }, [])

  // handler untuk button ketika diklik (fallback jika iframe tidak tertekan)
  const handleGoogleButtonClick = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      toast.error('VITE_GOOGLE_CLIENT_ID belum dikonfigurasi di .env')
      return
    }

    // prompt untuk google sign in
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    } else {
      toast.error('Google SDK sedang dimuat, silakan coba beberapa saat lagi.')
    }
  }

  // handler untuk login manual tanpa OAuth
  const onSubmit = async (formData) => {
    if (!captchaToken) {
      toast.error('Silakan verifikasi reCAPTCHA terlebih dahulu')
      return
    }

    try {
      // Kirim email & password ke API, backend yang menentukan role
      const userData = await login({
        email: formData.email,
        password: formData.password,
        captcha_token: captchaToken
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

            <div className="login-form-header">
              <img src="/assets/logo.png" alt="Logo" className="login-logo" />
              <h6 className="login-form-header__title">Masuk ke Akun <span className="login-title-highlight">MyTiket</span> Anda</h6>            
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

              {/* Google reCAPTCHA v2 Checkbox */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                <div ref={recaptchaRef}></div>
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
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider__line" />
              <span className="login-divider__text">atau</span>
              <div className="login-divider__line" />
            </div>

            {/* OAuth masuk dengan google account */}
            {/* Container Google Login dengan Transparent Overlay untuk menangkap direct user gesture */}
            <div style={{ position: 'relative', width: '100%' }}>
              <button
                type="button"
                onClick={handleGoogleButtonClick}
                className="login-google-btn"
                id="google-login-btn"
              >
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Masuk Dengan Google</span>
              </button>

              {/* Overlay Google GSI SDK iframe */}
              <div
                id="googleBtnContainer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0.001,
                  zIndex: 10,
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              ></div>
            </div>

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
