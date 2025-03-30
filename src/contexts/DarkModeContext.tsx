import { createContext } from 'react'

type DarkModeContextType = {
  darkMode: string
  setDarkMode: (darkMode: string) => void
}

export const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
)
