import axiosInstance from './axiosInstance'

export const ticketApi = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData)
    return response.data
  },
  getMyOrders: async () => {
    const response = await axiosInstance.get('/orders/my')
    return response.data
  },
  getOrderById: async (id) => {
    const response = await axiosInstance.get(`/orders/${id}`)
    return response.data
  },
  getMyTickets: async (page = 1) => {
    const response = await axiosInstance.get(`/user/tickets?page=${page}`)
    return response.data
  },
  purchaseTicket: async (ticketData) => {
    const response = await axiosInstance.post('/user/tickets', ticketData)
    return response.data
  },
}
