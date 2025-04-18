// import Logo from '../assets/logo.svg'
import { useEffect, useState } from 'react'
import Logo from '../assets/Logo'
import { cn } from '../lib/utils'

export default function LoadingScreen() {
  const [isUnmounting, setIsUnmounting] = useState(false)

  useEffect(() => {
    return () => {
      setIsUnmounting(true)
    }
  }, [])

  return (
    <div
      className={cn(
        'bg-barcelona-primary-background fixed top-0 right-0 left-0 z-50 flex h-svh shrink-0 touch-manipulation overflow-hidden opacity-100 transition-all duration-200 ease-in select-none',
        isUnmounting && 'opacity-0',
      )}
    >
      <Logo
        className={cn(
          'fill-barcelona-splash-screen-logo-color absolute top-[50svh] left-[50vw] size-24 -translate-1/2 scale-100 transition-all duration-200 ease-in',
          isUnmounting && 'scale-200',
        )}
      />
    </div>
  )
}
