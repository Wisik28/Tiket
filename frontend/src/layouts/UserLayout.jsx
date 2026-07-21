import React from 'react'
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function UserLayout() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Untuk menampilkan nama page di navbar
  const getHeaderTitle = () => {
    const path = location.pathname
    if (path.startsWith('/user/dashboard')) return 'Dashboard Pembeli'
    if (path.startsWith('/user/riwayatPembelian')) return 'Riwayat Pembelian'
    if (path.startsWith('/user/profileUser')) return 'Profil Pengguna'
    if (path.startsWith('/user/pembelian')) return 'Form Registrasi Acara'
    if (path.startsWith('/user/detailRiwayat')) return 'Detail Transaksi & E-Tiket'
    if (path.startsWith('/user/pembayaran')) return 'Pembayaran Tiket'
    return 'Dashboard Pembeli'
  }

  React.useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true })
    } else if (user.role !== 'user') {
      navigate(user.role === 'publisher' ? '/publisher/dashboard' : '/login', { replace: true })
    }
  }, [user, token, navigate])

  if (!user || !token || user.role !== 'user') {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col justify-between">
        <div className="p-6">
          <Link to="/user/dashboard" className="text-2xl font-bold tracking-wider">
            Menu 
          </Link>
          <nav className="mt-8 space-y-2">
            {/* /user/dashboard - harus sesuai dengan apa yang ada di AppRouter.jsx */}
            {/* pakai NavLink agar muncul tampilan yang berbeda, kalau cuma pakai Nav saja tidak bisa */}
            <NavLink
              to="/user/dashboard"
              className={({ isActive }) => {
                const isDashboardActive = isActive || 
                location.pathname.startsWith('/user/pembelian')                
                return `block px-4 py-2.5 rounded-lg text-sm font-medium ${isDashboardActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
              }                
            } >Dashboard</NavLink>

            <NavLink
              to="/user/riwayatPembelian"
              className={({ isActive }) => {
                const isRiwayatActive = isActive || 
                location.pathname.startsWith('/user/detailRiwayat/') ||
                location.pathname.startsWith('/user/pembayaran')
                return `block px-4 py-2.5 rounded-lg text-sm font-medium ${isRiwayatActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
              }}
            > Riwayat Pembelian </NavLink>

            <NavLink
              to="/user/profileUser"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Profil User </NavLink>
          </nav>

        </div>
        <div className="p-6 border-t border-indigo-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">Pembeli</p>
          </div>
          <button onClick={handleLogout} className="text-indigo-200 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h2>          
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
