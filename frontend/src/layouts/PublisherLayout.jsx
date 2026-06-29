import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function PublisherLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
            Organizer
          </Link>
          <nav className="mt-8 space-y-2">
            <Link to="/publisher/dashboard" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Dashboard
            </Link>
            <Link to="/publisher/events" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Manage Events
            </Link>
            <Link to="/publisher/events/create" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Create Event
            </Link>
            <Link to="/publisher/orders" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Orders List
            </Link>
            <Link to="/publisher/reports" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Sales Report
            </Link>
            <Link to="/publisher/profile" className="block px-4 py-2.5 rounded-lg hover:bg-indigo-800 text-sm font-medium">
              Publisher Profile
            </Link>
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
          <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-500">View Public Site &rarr;</Link>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
