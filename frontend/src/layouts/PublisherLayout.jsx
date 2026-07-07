import React from 'react'
// import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function PublisherLayout() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

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
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-900 text-white flex flex-col justify-between">
        <div className="p-6">
          <Link to="/publisher/dashboard" className="text-2xl font-bold tracking-wider">
            Menu
          </Link>
          <nav className="mt-8 space-y-2">
            {/* /publisher/dashboard - harus sesuai dengan apa yang ada di AppRouter.jsx */}
            {/* pakai NavLink agar muncul tampilan yang berbeda, kalau cuma pakai Nav saja tidak bisa */}
            <NavLink
              to="/publisher/dashboard"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Dashboard</NavLink>

            {/* <NavLink
              to="/publisher/coba"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Coba </NavLink>

            <NavLink
              to="/publisher/cobalagi"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Coba Lagi </NavLink> */}

            <NavLink
              to="/publisher/orders"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Daftar Pesanan </NavLink>

            <NavLink
              to="/publisher/profile"
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'hover:bg-indigo-800 text-white'}`
            } >Profil Publisher </NavLink>
          </nav>

        </div>
        <div className="p-6 border-t border-indigo-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">Publisher</p>
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
          <h2 className="text-xl font-semibold text-gray-800">Publisher Dashboard</h2>
          {/* <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500">View Public Site &rarr;</Link> */}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
