import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import api from '../services/api' // Your configured Axios instance
import {
  checkInitialAuth,
  clearAuthToken,
  setAuthToken,
} from '../services/authService'

type User = {
  name: string
  username: string
  profile_picture: string
}

type NewUserFormSchema = {
  name?: string
  username?: string
  gender?: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  requestLogin: (
    email: string,
  ) => Promise<{ login_token: string; is_new_user: boolean }>
  verifyLogin: (
    loginToken: string,
    verificationCode: string,
    isNewUser: boolean,
    details?: NewUserFormSchema,
  ) => Promise<unknown>
  logout: () => Promise<void>
  fetchUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Start loading until initial check is done

  // Function to fetch user data (call after login/refresh)
  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth') // Your endpoint to get logged-in user's basic info
      setUser(response.data)
      setIsAuthenticated(true)
      return response.data
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // If fetching user fails even with a token, treat as unauthenticated
      logout()
      return null
    }
  }, [])

  // Check authentication status on initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        // Try to refresh token using the HttpOnly cookie
        const { token, user: initialUser } = await checkInitialAuth(api)
        if (token && initialUser) {
          // No need to call setAuthToken here, checkInitialAuth does it
          setUser(initialUser)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        // Handled inside checkInitialAuth
        console.error('Initial auth check failed:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [fetchUser]) // Add fetchUser dependency if used inside initAuth indirectly

  // Login step 1: Request verification code
  const requestLogin = async (email: string) => {
    const response = await api.post('/auth/login/email', { email })
    return response.data // Returns { login_token, is_new_user }
  }

  // Login step 2: Verify code and get tokens
  const verifyLogin = async (
    loginToken: string,
    verificationCode: string,
    isNewUser: boolean,
    details: { name?: string; username?: string; gender?: string } = {},
  ) => {
    const payload = {
      token: loginToken,
      verification_code: verificationCode,
      is_new_user: isNewUser,
      ...details,
    }
    const response = await api.post('/auth/verify/email', payload)
    const accessToken = response.data.access_token
    setAuthToken(accessToken) // Store access token in memory
    // Refresh token cookie is set by the backend automatically
    await fetchUser() // Fetch user details after successful verification
    return response.data
  }

  // Logout
  const logout = useCallback(async () => {
    try {
      // Inform the backend to invalidate the refresh token
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
      // Still proceed with client-side cleanup
    } finally {
      clearAuthToken() // Clear access token from memory
      setUser(null)
      setIsAuthenticated(false)
      // The HttpOnly refresh_token cookie cannot be cleared by JS,
      // but it's invalidated server-side and will expire eventually.
      // Redirecting might be needed: window.location.href = '/login';
    }
  }, [])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    requestLogin,
    verifyLogin,
    logout,
    fetchUser, // Expose if needed elsewhere
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
