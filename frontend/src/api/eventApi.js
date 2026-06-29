import axiosInstance from './axiosInstance'

export const eventApi = {
  getAllEvents: async (params) => {
    const response = await axiosInstance.get('/events', { params })
    return response.data
  },
  getEventById: async (id) => {
    const response = await axiosInstance.get(`/events/${id}`)
    return response.data
  },
  searchEvents: async (query) => {
    const response = await axiosInstance.get('/events/search', { params: { q: query } })
    return response.data
  },
  getPublisherEvents: async () => {
    const response = await axiosInstance.get('/publisher/events')
    return response.data
  },
  createEvent: async (eventData) => {
    const response = await axiosInstance.post('/publisher/events', eventData)
    return response.data
  },
  updateEvent: async (id, eventData) => {
    const response = await axiosInstance.put(`/publisher/events/${id}`, eventData)
    return response.data
  },
  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/publisher/events/${id}`)
    return response.data
  },
}
