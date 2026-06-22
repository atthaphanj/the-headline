import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import NewsDaily from './pages/NewsDaily'
import { ThemeProvider } from './hooks/useTheme'
import { initOneSignal } from './utils/oneSignal'
import { registerSW } from 'virtual:pwa-register'

function App() {
  useEffect(() => {
    initOneSignal()

    const updateSW = registerSW({
      onNeedRefresh() {
        if (confirm('มีเวอร์ชันใหม่ ต้องการอัปเดตไหม?')) {
          updateSW(true)
        }
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline')
      },
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewsDaily />} />
        <Route path="/news_daily" element={<NewsDaily />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
