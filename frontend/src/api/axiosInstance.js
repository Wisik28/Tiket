import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor untuk memberi token atuentikasi
// kemudian request dikirim ke server backend
// function ini berfungsi untuk memberi token atuentikasi pada request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Respons interceptor untuk eror handling kemudian menghapus token dari sessionStorage
// dilakukan ketika token autentikasi sudah kadaluwarsa dan user diharuskan login kembali
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')      
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
