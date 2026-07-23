import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authApi } from '../api/authApi'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user')
    if (!stored || stored === 'undefined') return null
    try {
      return JSON.parse(stored)
    } catch (e) {
      sessionStorage.removeItem('user')
      return null
    }
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!token && !!user

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const responseData = await authApi.login(credentials)
      // API diharapkan mengembalikan: { success: true, data: { token, user: { id, name, email, role: 'user' | 'publisher' } } }
      const { token: newToken, user: userData } = responseData.data
      sessionStorage.setItem('token', newToken)
      sessionStorage.setItem('user', JSON.stringify(userData))
      setToken(newToken)
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Tetap lanjutkan logout meskipun API gagal
    } finally {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((updatedUserData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedUserData }
      sessionStorage.setItem('user', JSON.stringify(newUser))
      return newUser
    })
  }, [])

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
