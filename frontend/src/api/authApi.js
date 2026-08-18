import axiosInstance from './axiosInstance'

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials)
    return response.data
  },
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData)
    return response.data
  },
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },
  // function auth menggunakan OAuth google account
  googleLogin: async (credential, options = {}) => {
    console.log('authApi.googleLogin - sending credential to /auth/google')
    // menggunakan options untuk cek ke database apakah akun sudah terdaftar atau belum
    const response = await axiosInstance.post('/auth/google', { credential, ...options }) // consume API untuk 
    console.log('authApi.googleLogin - raw response status:', response.status)
    console.log('authApi.googleLogin - raw response data:', response.data)
    console.log('authApi.googleLogin - data type:', typeof response.data)

    // Jika PHP mengeluarkan warning sebelum JSON, response.data bisa berupa string
    if (typeof response.data === 'string') {
      console.error('authApi.googleLogin - Backend returned string instead of JSON:', response.data)
      try {
        // Coba parse JSON dari string (mungkin ada PHP warning sebelum JSON)
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        // ignore parse error
      }
      throw new Error('Backend mengembalikan response yang bukan JSON. Periksa error log PHP.')
    }

    return response.data
  },
  refresh: async () => {
    const response = await axiosInstance.post('/auth/refresh')
    return response.data
  },
}
