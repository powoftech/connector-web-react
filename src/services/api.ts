import axios, { HttpStatusCode } from 'axios'
import { clearAuthToken, getAuthToken, setAuthToken } from './authService'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
})

// --- Request Interceptor ---
// Add the access token to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken() // Get token from memory
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// --- Response Interceptor ---
// Handle token expiration and automatic refresh
let isRefreshing = false
let failedQueue = [] // Queue for requests that failed due to 401 Unauthorized

const processQueue = (error: unknown, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response, // Simply return successful responses
  async (error) => {
    const originalRequest = error.config

    // Check if it's a 401 Unauthorized error and not a retry request
    if (
      error.response?.status === HttpStatusCode.Unauthorized &&
      !originalRequest._retry
    ) {
      // Avoid refresh loops if the refresh endpoint itself returns 401
      if (originalRequest.url === '/api/auth/refresh') {
        console.error('Refresh token failed or expired.')
        clearAuthToken() // Clear tokens from memory/state
        // Optionally redirect to login: window.location.href = '/login';
        // window.location.href = '/login'
        return Promise.reject(error)
      }

      // If already refreshing, add the request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest) // Retry original request with new token
          })
          .catch((err) => {
            return Promise.reject(err) // Propagate the error if refresh failed
          })
      }

      // Mark as refreshing and set retry flag
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call the refresh endpoint (refresh token cookie is sent automatically)
        const { data } = await api.post('/auth/refresh')
        const newAccessToken = data.access_token

        setAuthToken(newAccessToken) // Store new token in memory

        // Update the header for the current original request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`

        // Process the queue with the new token
        processQueue(null, newAccessToken)

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Could not refresh token:', refreshError)
        processQueue(refreshError, null) // Reject all queued requests
        clearAuthToken() // Log the user out
        // Redirect to login is often a good idea here
        // window.location.href = '/login';
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // For errors other than 401, just reject
    return Promise.reject(error)
  },
)

export default api
