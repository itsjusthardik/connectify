import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Attach access token from memory to every request
api.interceptors.request.use((config) => {
  const token = window.__accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// On 401: try refresh, retry original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }).catch(err => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        const token = res.data.accessToken
        window.__accessToken = token
        
        processQueue(null, token)
        
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch (err) {
        processQueue(err, null)
        window.__accessToken = null
        const path = window.location.pathname
        // Skip redirecting if already on home or admin routes
        if (!['/', '/admin/login'].includes(path)) {
          window.location.href = '/'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
