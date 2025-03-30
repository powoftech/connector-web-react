import { useContext } from 'react'
import { DarkModeContext } from '../contexts/DarkModeContext'

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
