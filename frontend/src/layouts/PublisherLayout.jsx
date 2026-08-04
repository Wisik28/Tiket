import React, { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function PublisherLayout() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Default sidebar terbuka (isCollapsed = false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Status sidebar apakah sedang terbuka/membesar
  const isExpanded = !isCollapsed || isHovered

  // Handler saat user mengklik menu navigasi di sidebar
  const handleNavClick = () => {
    // Menandai bahwa sidebar sudah dalam mode collapse default (isCollapsed = true)
    // Sidebar tetap terbuka selama pointer user masih berada di atas sidebar (isHovered = true)
    setIsCollapsed(true)
  }

  // Untuk menampilkan nama page di navbar
  const getHeaderTitle = () => {
    const path = location.pathname
    if (path.startsWith('/publisher/dashboard')) return 'Publisher Dashboard'
    if (path.startsWith('/publisher/events/create')) return 'Tambah Event Baru'
    if (path.startsWith('/publisher/events/update')) return 'Ubah Event'
    if (path.startsWith('/publisher/orders')) return 'Daftar Pesanan'
    if (path.startsWith('/publisher/profile')) return 'Profil Publisher'
    if (path.startsWith('/publisher/coba')) return 'Coba'
    if (path.startsWith('/publisher/cobalagi')) return 'Coba Lagi'
    return 'Publisher Dashboard'
  }

  React.useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true })
    } else if (user.role !== 'publisher') {
      navigate(user.role === 'user' ? '/user/dashboard' : '/login', { replace: true })
    }
  }, [user, token, navigate])

  if (!user || !token || user.role !== 'publisher') {
    return null
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar dengan transisi smooth dan hover effect saat collapsed */}
      <aside
        onMouseEnter={() => {
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
        }}
        className={`${
          isExpanded ? 'w-64' : 'w-20'
        } bg-indigo-900 text-white flex flex-col justify-between transition-all duration-300 ease-in-out z-20 shadow-xl overflow-hidden`}
      >
        <div className={isExpanded ? 'p-6' : 'p-4'}>
          {/* Tombol Menu yang dapat diklik untuk memperkecil/memperbesar sidebar */}
          <button
            type="button"
            onClick={() => {
              if (isExpanded) {
                setIsCollapsed(true)
                setIsHovered(false)
              } else {
                setIsCollapsed(false)
              }
            }}
            className={`flex items-center gap-3 text-xl font-bold tracking-wider text-white hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer w-full ${
              !isExpanded ? 'justify-center' : ''
            }`}
            title={isExpanded ? 'Kecilkan Sidebar' : 'Buka Sidebar'}
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
            {isExpanded && <span className="whitespace-nowrap">Menu</span>}
          </button>

          <nav className="mt-8 space-y-2">
            {/* /publisher/dashboard - harus sesuai dengan apa yang ada di AppRouter.jsx */}
            <NavLink
              to="/publisher/dashboard"
              title="Dashboard"
              onClick={handleNavClick}
              className={({ isActive }) => {
                const isDashboardActive =
                  isActive ||
                  location.pathname.startsWith('/publisher/events/update') ||
                  location.pathname.startsWith('/publisher/events/create')
                return `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isExpanded ? 'justify-center px-2' : 'px-4'
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
              {isExpanded && <span className="whitespace-nowrap">Dashboard</span>}
            </NavLink>

            <NavLink
              to="/publisher/orders"
              title="Daftar Pesanan"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isExpanded ? 'justify-center px-2' : 'px-4'
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              {isExpanded && <span className="whitespace-nowrap">Daftar Pesanan</span>}
            </NavLink>

            <NavLink
              to="/publisher/profile"
              title="Profil Publisher"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  !isExpanded ? 'justify-center px-2' : 'px-4'
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
              {isExpanded && <span className="whitespace-nowrap">Profil Publisher</span>}
            </NavLink>
          </nav>
        </div>

        <div
          className={`border-t border-indigo-800 flex items-center ${
            !isExpanded ? 'p-4 justify-center flex-col gap-3' : 'p-6 justify-between'
          }`}
        >
          {isExpanded && (
            <div className="truncate pr-2">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-indigo-300 truncate">Publisher</p>
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

      {/* Navbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{getHeaderTitle()}</h2>
          {!location.pathname.startsWith('/publisher/events/create') &&
            !location.pathname.startsWith('/publisher/events/update') && (
              <Link to="/publisher/events/create" className="pd-btn pd-btn--primary pd-btn--lg flex items-center gap-2">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  <img src="/assets/add.png" alt="Add" className="w-full h-full object-contain" />
                </div>
                <span>Buat Acara Baru</span>
              </Link>
            )}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
