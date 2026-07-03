import React from 'react'
import useAuth from '../../hooks/useAuth'

export default function Profile() {
  // mengambil data user dari AuthContext
  const { user } = useAuth()

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

  // Format tanggal buatan
  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      // Check if valid date
      if (isNaN(date.getTime())) return dateString
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch (e) {
      return dateString
    }
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>              
                {user?.role === 'user' ? "Pembeli" : user?.role === 'admin' ? "Admin" : "Penjual/Publisher"}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="p-8">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Informasi Akun</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nama Lengkap */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nama Lengkap</p>
                <p className="text-base font-semibold text-gray-800 mt-1">{user?.name || '—'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-base font-semibold text-gray-800 mt-1">{user?.email || '—'}</p>
              </div>
            </div>

            {/* Nomor telepon (menyusul) */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Nomor Telepon</p>
                <p className="text-base font-semibold text-gray-800 mt-1">{user?.name || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}