import { AxiosInstance } from 'axios'

// Simple in-memory storage for the access token
let inMemoryToken: string | null = null

// Flag to check if refresh token *might* exist (based on cookie presence after login/refresh)
// We can't directly read HttpOnly cookies, but we know when they *should* be set.
let refreshTokenPotentiallyExists = false

export const setAuthToken = (token: string) => {
  inMemoryToken = token
  // Assume refresh token was also set/refreshed if we got a new access token
  refreshTokenPotentiallyExists = true
}

export const getAuthToken = () => {
  return inMemoryToken
}

export const clearAuthToken = () => {
  inMemoryToken = null
  refreshTokenPotentiallyExists = false
  // Note: We can't clear the HttpOnly cookie directly from JS.
  // The backend's /auth/logout endpoint handles invalidating it server-side
  // and the browser clears it based on expiry or if the backend sends a 'Set-Cookie' header
  // with an expired date or empty value for 'refresh_token'.
}

// Check if the user *might* have a valid session (based on refresh token presence)
// Useful for initial app load check.
export const getRefreshTokenExists = () => {
  // In a real app, you might check if a cookie named 'refresh_token' exists,
  // even though you can't read its value. This is tricky and browser-dependent.
  // A simpler approach is to rely on our flag or just attempt a refresh on load.
  return refreshTokenPotentiallyExists
}

// Function to attempt initial auth check on app load
export const checkInitialAuth = async (api: AxiosInstance) => {
  // We don't have an access token initially. If a refresh token cookie exists,
  // the /auth/refresh call should succeed.
  try {
    const { data } = await api.post('/auth/refresh')
    setAuthToken(data.access_token)
    // Fetch user data after successful refresh
    const userResponse = await api.get('/auth') // Your endpoint to get user details
    return { token: data.access_token, user: userResponse.data }
  } catch {
    console.error('Initial auth check failed (likely no valid refresh token).')
    clearAuthToken()
    return { token: null, user: null }
  }
}
