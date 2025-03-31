import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

const DarkModeOptions = {
  ENABLED: 'ENABLED',
  DISABLED: 'DISABLED',
  USE_SYSTEM: 'USE_SYSTEM',
}

type DarkModeContextType = {
  darkMode: string
  setDarkMode: (darkMode: string) => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(
  undefined,
)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('dark_mode') || DarkModeOptions.USE_SYSTEM,
  )

  // Apply theme to document and save preference
  useEffect(() => {
    if (darkMode === DarkModeOptions.USE_SYSTEM) {
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
      )
      document.documentElement.classList.toggle(
        'dark',
        darkModeMediaQuery.matches,
      )
    } else {
      document.documentElement.classList.toggle(
        'dark',
        darkMode === DarkModeOptions.ENABLED,
      )
    }

    localStorage.setItem('dark_mode', darkMode)
  }, [darkMode])

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (darkMode === DarkModeOptions.USE_SYSTEM) {
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)',
      )

      const handleChange = (event: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', event.matches)
      }

      darkModeMediaQuery.addEventListener('change', handleChange)
      return () =>
        darkModeMediaQuery.removeEventListener('change', handleChange)
    }
  }, [darkMode])

  return (
    <DarkModeContext.Provider
      value={{ darkMode: darkMode, setDarkMode: setDarkMode }}
    >
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode(): DarkModeContextType {
  const context = useContext(DarkModeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
