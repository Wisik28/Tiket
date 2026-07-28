import React, { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function UserLayout() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-indigo-900 text-white flex flex-col justify-between transition-all duration-300 ease-in-out`}
      >
        <div className={isCollapsed ? 'p-4' : 'p-6'}>
          {/* Tombol Menu yang dapat diklik untuk memperkecil/memperbesar sidebar */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-3 text-xl font-bold tracking-wider text-white hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Buka Sidebar' : 'Kecilkan Sidebar'}
          >
            <svg
              className="w-6 h-6 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {!isCollapsed && <span>Menu</span>}
          </button>

          <nav className="mt-8 space-y-2">
            {/* /user/dashboard - harus sesuai dengan apa yang ada di AppRouter.jsx */}
            {/* pakai NavLink agar muncul tampilan yang berbeda, kalau cuma pakai Nav saja tidak bisa */}
            <NavLink
              to="/user/dashboard"
              title="Dashboard"
              className={({ isActive }) => {
                const isDashboardActive =
                  isActive || location.pathname.startsWith('/user/pembelian')
                return `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  isDashboardActive
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'hover:bg-indigo-800 text-white'
                }`
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 00-1 1m-6 0h6"
                />
              </svg>
              {!isCollapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink
              to="/user/riwayatPembelian"
              title="Riwayat Pembelian"
              className={({ isActive }) => {
                const isRiwayatActive =
                  isActive ||
                  location.pathname.startsWith('/user/detailRiwayat/') ||
                  location.pathname.startsWith('/user/pembayaran')
                return `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  isRiwayatActive
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'hover:bg-indigo-800 text-white'
                }`
              }}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {!isCollapsed && <span>Riwayat Pembelian</span>}
            </NavLink>

            <NavLink
              to="/user/profileUser"
              title="Profil User"
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isCollapsed ? 'justify-center px-2' : 'px-4'
                } ${
                  isActive
                    ? 'bg-white text-indigo-900 shadow-sm'
                    : 'hover:bg-indigo-800 text-white'
                }`
              }
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {!isCollapsed && <span>Profil User</span>}
            </NavLink>
          </nav>
        </div>

        <div
          className={`border-t border-indigo-800 flex items-center ${
            isCollapsed ? 'p-4 justify-center flex-col gap-3' : 'p-6 justify-between'
          }`}
        >
          {!isCollapsed && (
            <div className="truncate pr-2">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 truncate">Pembeli</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-indigo-200 hover:text-white"
            title="Keluar / Logout"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
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
