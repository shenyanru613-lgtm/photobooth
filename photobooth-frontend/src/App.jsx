import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import NavBar from './components/NavBar'
import Onboarding from './components/Onboarding'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Gallery from './pages/Gallery'
import Styles from './pages/Styles'

// Lazy-load Preview (heavy page with generation logic)
const Preview = lazy(() => import('./pages/Preview'))

export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <Onboarding />
      <main className="flex-1 pb-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-dvh">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/preview/:id" element={<Preview />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/styles" element={<Styles />} />
          </Routes>
        </Suspense>
      </main>
      <NavBar />
    </div>
  )
}
