import { ReactNode, useState } from 'react'
import LoadingScreen from '../components/LoadingScreen'
import { LoadingContext } from '../contexts/LoadingContext'

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingScreen />}
      {children}
    </LoadingContext.Provider>
  )
}
