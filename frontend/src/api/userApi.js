import axiosInstance from './axiosInstance'

// consume API untuk get profile dan update profile milik user dan publisher

export const userApi = {
  getProfile: async () => {
    const response = await axiosInstance.get('/user/profile')    
    return response.data
  },
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/user/profile', profileData)
    return response.data
  },
  getPublisherProfile: async () => {
    const response = await axiosInstance.get('/publisher/profile')
    return response.data
  },
  updatePublisherProfile: async (profileData) => {
    const response = await axiosInstance.put('/publisher/profile', profileData)
    return response.data
  },
}
