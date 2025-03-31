import { createContext, ReactNode, useContext, useState } from 'react'
import LoadingScreen from '../components/LoadingScreen'

type LoadingContextType = {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext)

  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }

  return context
}
