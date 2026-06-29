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
  refresh: async () => {
    const response = await axiosInstance.post('/auth/refresh')
    return response.data
  },
}
