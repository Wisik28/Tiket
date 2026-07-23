import React, { useState, useEffect } from 'react'
import useAuth from '../../hooks/useAuth'
import { userApi } from '../../api/userApi'
import toast from 'react-hot-toast'

export default function Profile() {
  // mengambil data user dari AuthContext
  const { user, updateUser } = useAuth()

  // inisialisasi state
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    tglLahir: '',
    email: '',
    mobile: '',
    address: '',
  })

  // sinkronisasi data dengan user context
  useEffect(() => {
    if (user) {
      setFormData({
        nik: user.nik || '',
        name: user.name || '',
        tglLahir: user.tglLahir || '',
        email: user.email || '',
        mobile: user.mobile || '',
        address: user.address || '',
      })
    }
  }, [user])

  // handler edit toggle (merubah field ketika button edit diklik)
  const handleEditToggle = () => {
    if (isEditing) {      
      setIsEditing(false) // cancel mode edit dan masuk mode view biasa
      if (user) {
        setFormData({
          nik: user.nik || '',
          name: user.name || '',
          tglLahir: user.tglLahir || '',
          email: user.email || '',
          mobile: user.mobile || '',
          address: user.address || '',
        })
      }
    } else {
      setIsEditing(true) // set true untuk masuk mode editing
    }
  }

  // handler perubahan input (mengubah nilai state saat mengetik)
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // handler save untuk simpan ke dalam database
  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await userApi.updateProfile(formData)
      const updatedData = response?.data || response

      if (updateUser) {
        updateUser(formData)
      }
      toast.success('Profil berhasil diperbarui!')
      setIsEditing(false)
    } catch (error) {
      const message =
        error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Format initials dari nama user
  const getInitials = (name) => {
    if (!name) return 'P'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="max-w-3xl mx-auto my-6">
      {/* Profile Card Wrapper */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
        
        {/* Decorative Top Accent Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg border-4 border-white">
              {getInitials(user?.name)}
            </div>
          </div>
        </div>

        {/* Informasi User */}
        <div className="pt-16 pb-6 px-8 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name || '—'}</h2>
              <p className="text-gray-500 text-sm mt-1">{user?.email || '—'}</p>
            </div>
            <div>
              <span className="items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>              
                {user?.role === 'user' ? "Pembeli" : user?.role === 'admin' ? "Admin" : "Penjual/Publisher"}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="p-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-6">Informasi Akun</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            
            {/* NIK */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-3M10 6a2 2 0 012-2h0a2 2 0 012 2m-4 0h4m-4 7a2 2 0 104 0 2 2 0 00-4 0zm-1 5a4 4 0 016 0" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">NIK</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    maxLength={16}
                    placeholder="Masukkan NIK 16 digit"
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.nik || '—'}</p>
                )}
              </div>
            </div>

            {/* Nama Lengkap */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.name || '—'}</p>
                )}
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tanggal Lahir</p>
                {isEditing ? (
                  <input
                    type="date"
                    name="tglLahir"
                    value={formData.tglLahir}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.tglLahir || '—'}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email"
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.email || '—'}</p>
                )}
              </div>
            </div>

            {/* Nomor Handphone */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeLinecap="round" strokeWidth="3" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nomor Handphone</p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="Masukkan nomor handphone"
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.mobile || '—'}</p>
                )}
              </div>
            </div>

            {/* Alamat tinggal */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alamat Tinggal</p>
                {isEditing ? (
                  <textarea
                    name="address"
                    rows={2}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Masukkan alamat tinggal lengkap"
                    className="mt-1.5 w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                  />
                ) : (
                  <p className="text-base font-semibold text-gray-800 mt-1">{user?.address || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Button untuk, switch ke mode editing dan mode view */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                  id="btn-save-profile"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75" />
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Simpan</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEditToggle}
                  disabled={loading}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors duration-200"
                  id="btn-cancel-profile"
                >
                  Batal
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditToggle}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm"
                title="Edit Profile"
                id={`btn-edit-${user?.id || 'profile'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profil</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}