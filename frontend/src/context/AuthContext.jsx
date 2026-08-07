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

  const googleLogin = useCallback(async (credential) => {
    setLoading(true)
    try {
      console.log('Sending Google credential to backend...')
      const responseData = await authApi.googleLogin(credential) // consume API untuk login menggunakan google
      console.log('Backend response:', responseData)

      // Validasi response sebelum destructuring
      if (!responseData || !responseData.data) {
        console.error('Invalid response structure from backend:', responseData)
        throw new Error('Server mengembalikan response yang tidak valid. Periksa backend.')
      }

      // inti/core proses destructing
      const { token: newToken, user: userData } = responseData.data // ambil token dan user dari response data

      // memeriksa apakah token dan user ditemukan sebelum menyimpan ke storage
      if (!newToken || !userData) {
        console.error('Missing token or user in response.data:', responseData.data)
        throw new Error('Token atau data user tidak ditemukan dalam response server.')
      }

      sessionStorage.setItem('token', newToken) // simpan token ke storage
      sessionStorage.setItem('user', JSON.stringify(userData)) // simpan user ke storage
      setToken(newToken) // set token ke state
      setUser(userData) // set user ke state
      return userData
    } finally {
      setLoading(false) // set loading ke false
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
    googleLogin,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
