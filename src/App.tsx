import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Toaster } from 'sonner'
import './App.css'
import LoadingScreen from './components/LoadingScreen'
import { DarkModeProvider } from './providers/DarkModeProvider'
import { LoadingProvider } from './providers/LoadingProvider'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  return (
    <DarkModeProvider>
      <LoadingProvider>
        <BrowserRouter>
          <Toaster theme="system" position="bottom-center" expand={false} />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </LoadingProvider>
    </DarkModeProvider>
  )
}

export default App
