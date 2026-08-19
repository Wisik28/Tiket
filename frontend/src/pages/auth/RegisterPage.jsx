import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../../style/RegisterPage.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import useAuth from '../../hooks/useAuth'
import { authApi } from '../../api/authApi'

// Vaalidasi input field menggunakan zod
const registerSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    nik: z.string().length(16, 'NIK harus 16 karakter'),
    tglLahir: z
      .string()
      .optional()
      .refine((val) => !val || new Date(val) <= new Date(), {
        message: 'Tanggal lahir harus tanggal di masa lalu',
      }),
    address: z.string().min(10, 'Alamat harus lengkap'),
    email: z.string().email('Format email tidak valid'),
    mobile: z.string().min(12, 'Nomor handphone tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    role: z.enum(['user', 'publisher']),
    company_name: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'user') {
        return !!data.tglLahir && data.tglLahir.trim().length > 0
      }
      return true
    },
    {
      message: 'Tanggal lahir wajib diisi',
      path: ['tglLahir'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'publisher') {
        return !!data.company_name && data.company_name.trim().length >= 3
      }
      return true
    },
    {
      message: 'Nama perusahaan/institusi minimal 3 karakter untuk Publisher',
      path: ['company_name'],
    }
  )

export default function RegisterPage() {
  const navigate = useNavigate()
  const { googleLogin } = useAuth()
  const [loading, setLoading] = useState(false)
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
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nik: '', //ini juga bisa dihapus
      name: '',
      tglLahir: '', //ini bisa dihapus
      email: '',
      password: '',
      role: 'user',
      company_name: '',
      address: '',      
      mobile: '',
    },
  })
  
  const selectedRole = watch('role')

  // handler jika pendaftaran menggunakan google berhasil
  const handleGoogleSuccess = async (credential) => {
    try {
      console.log('Google Credential Token received:', credential)
      const userData = await googleLogin(credential, { 
        is_register: true, 
        role: selectedRole 
      })
      toast.success(`Registrasi berhasil! Selamat datang, ${userData.name}!`)
      if (userData.role === 'publisher') {
        navigate('/publisher/dashboard', { replace: true })
      } else {
        navigate('/user/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Google register error:', error)
      const message =
        error.response?.data?.message || error.message || 'Gagal mendaftar dengan akun Google. Coba lagi'
      toast.error(message)
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

  // handler untuk register manual tanpa OAuth
  const onSubmit = async (formData) => {
    if (!captchaToken) {
      toast.error('Silakan verifikasi reCAPTCHA terlebih dahulu')
      return
    }

    setLoading(true)
    try {    
      const payload = {
        name: formData.name,
        nik: formData.nik,
        tglLahir: formData.tglLahir,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        address: formData.address,        
        mobile: formData.mobile,
        captcha_token: captchaToken,
        ...(formData.role === 'publisher' ? { company_name: formData.company_name } : {}),
      }

      await authApi.register(payload)
      toast.success('Pendaftaran berhasil! Silakan masuk ke akun Anda.')
      navigate('/login')
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.'
      toast.error(message)
    } finally {
      setLoading(false)
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

      <div className="login-container register-container">
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
              Gabung sekarang dan temukan jutaan event menarik atau buat event Anda sendiri!
            </p>

            <div className="login-branding__features">
              <div className="login-branding__feature">
                <div className="login-branding__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span>Sebagai Pembeli (User)</span>
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
                <span>Sebagai Penyelenggara (Publisher)</span>
              </div>
            </div>
          </div>

          <p className="login-branding__footer">
            &copy; {new Date().getFullYear()} EventTicket. All rights reserved.
          </p>
        </div>

        {/* Right panel - register form */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            {/* Mobile logo */}            

            <div className="login-form-header">
              <img src="/assets/logo.png" alt="Logo" className="login-logo" />
              <h6 className="login-form-header__title">Buat Akun Baru di <span className="login-title-highlight">MyTiket</span></h6>
              {/* <p className="login-form-header__desc">
                Mulai perjalanan Anda sebagai Pembeli atau Publisher
              </p> */}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form" id="register-form">
              {/* Role Selection Segmented Control */}
              <div className="login-field">
                <label className="login-field__label">Daftar Sebagai</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-selector__btn ${selectedRole === 'user' ? 'role-selector__btn--active' : ''}`}
                    onClick={() => {
                      setValue('role', 'user')
                      setValue('company_name', '')
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-selector__icon">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Pembeli
                    {/* tooltip pada button toggle switch role */}
                    <span className="role-selector__tooltip">Pembeli jika Anda akan membeli tiket</span>
                  </button>
                  <button
                    type="button"
                    className={`role-selector__btn ${selectedRole === 'publisher' ? 'role-selector__btn--active' : ''}`}
                    onClick={() => setValue('role', 'publisher')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="role-selector__icon">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Publisher
                    {/* tooltip pada button toggle switch role */}
                    <span className="role-selector__tooltip">Publisher jika Anda ingin menjual tiket</span>
                  </button>
                </div>
              </div>

              {/* Field NIK */}
              <div className="login-field">
                <label htmlFor="reg-nik" className="login-field__label">
                  NIK
                </label>
                <div className={`login-field__input-wrapper ${errors.nik ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="reg-nik"
                    type="number"
                    maxLength={16}
                    minLength={16}
                    placeholder="Masukkan NIK"
                    autoComplete="nik"
                    className="login-field__input"
                    {...register('nik')}
                  />
                </div>
                {errors.nik && <p className="login-field__error">{errors.nik.message}</p>}
              </div>

              {/* Name field */}
              <div className="login-field">
                <label htmlFor="reg-name" className="login-field__label">
                  Nama Lengkap
                </label>
                <div className={`login-field__input-wrapper ${errors.name ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    className="login-field__input"
                    {...register('name')}
                  />
                </div>
                {errors.name && <p className="login-field__error">{errors.name.message}</p>}
              </div>

              {/* Alamat field */}
              <div className="login-field">
                <label htmlFor="reg-address" className="login-field__label">
                  Alamat Tinggal/Institusi
                </label>
                <div className={`login-field__input-wrapper ${errors.address ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <input
                    id="reg-address"
                    type="text"
                    placeholder="Masukkan alamat lengkap"
                    className="login-field__input"
                    {...register('address')}
                  />
                </div>
                {errors.address && <p className="login-field__error">{errors.address.message}</p>}
              </div>

              {/* User saja: Tanggal Lahir */}
              {selectedRole === 'user' && (
                <div className="login-field animate-fade-in">
                  <label htmlFor="reg-tglLahir" className="login-field__label">
                    Tanggal Lahir
                  </label>                  
                  <div className={`login-field__input-wrapper ${errors.tglLahir ? 'login-field__input-wrapper--error' : ''}`}>
                    <div className="login-field__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <input                        
                      id="reg-tglLahir"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="login-field__input"
                      {...register('tglLahir')}
                    />
                  </div>
                  {errors.tglLahir && (
                    <p className="login-field__error">{errors.tglLahir.message}</p>
                  )}
                </div>
              )}

              {/* Company Name field (Conditional) */}
              {selectedRole === 'publisher' && (
                <div className="login-field animate-fade-in">
                  <label htmlFor="reg-company" className="login-field__label">
                    Nama Perusahaan / Institusi
                  </label>
                  <div className={`login-field__input-wrapper ${errors.company_name ? 'login-field__input-wrapper--error' : ''}`}>
                    <div className="login-field__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                    </div>
                    <input
                      id="reg-company"
                      type="text"
                      placeholder="Nama instansi penyelenggara"
                      className="login-field__input"
                      {...register('company_name')}
                    />
                  </div>
                  {errors.company_name && (
                    <p className="login-field__error">{errors.company_name.message}</p>
                  )}
                </div>
              )}

              {/* Email field */}
              <div className="login-field">
                <label htmlFor="reg-email" className="login-field__label">
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
                    id="reg-email"
                    type="email"
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="login-field__input"
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="login-field__error">{errors.email.message}</p>}
              </div>

              {/* Nomor Handphone */}
              <div className="login-field">
                <label htmlFor="reg-mobile" className="login-field__label">
                  Nomor Telepon
                </label>
                <div className={`login-field__input-wrapper ${errors.mobile ? 'login-field__input-wrapper--error' : ''}`}>
                  <div className="login-field__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      <line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                  </div>
                  <input
                    id="reg-mobile"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    className="login-field__input"
                    {...register('mobile')}
                  />
                </div>
                {errors.mobile && <p className="login-field__error">{errors.mobile.message}</p>}
              </div>

              {/* Password field */}
              <div className="login-field">
                <label htmlFor="reg-password" className="login-field__label">
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
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password minimal 6 karakter"
                    autoComplete="new-password"
                    className="login-field__input"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-field__toggle"
                    id="toggle-reg-password"
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
                {errors.password && <p className="login-field__error">{errors.password.message}</p>}
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
                id="register-submit-btn"
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
                    Daftar Sekarang
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
                <span>Daftar Dengan Akun Google</span>
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

            {/* Login link */}
            <p className="login-register-link">
              Sudah punya akun?{' '}
              <Link to="/login" id="login-link">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
