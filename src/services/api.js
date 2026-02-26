import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ ВАЖНО: Добавляем токен к КАЖДОМУ запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('🔑 Token from storage:', token ? 'есть' : 'нет')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token added to request:', config.method, config.url)
    } else {
      console.log('❌ No token for request:', config.method, config.url)
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Добавляем обработку ответов
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url)

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🚫 Unauthorized, redirecting to login')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
