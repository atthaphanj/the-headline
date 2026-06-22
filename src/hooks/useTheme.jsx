import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      root.classList.remove('dark')
      localStorage.theme = 'light'
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      isDark ? '#111827' : '#3b82f6'
    )
  }, [isDark])

  const toggleTheme = useCallback(() => setIsDark((v) => !v), [])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function useLiveClock() {
  const [clockText, setClockText] = useState('Loading...')
  const [clockShort, setClockShort] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClockText(
        now.toLocaleDateString('th-TH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
      setClockShort(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' น.'
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return { clockText, clockShort }
}

export function useStickyHeader() {
  useEffect(() => {
    const onScroll = () => {
      const stickyHeader = document.getElementById('sticky-header')
      const filterBar = document.getElementById('filter-bar')
      if (window.scrollY > 150) {
        stickyHeader?.classList.remove('-translate-y-full')
        stickyHeader?.classList.add('translate-y-0')
        if (filterBar) filterBar.style.top = '56px'
      } else {
        stickyHeader?.classList.remove('translate-y-0')
        stickyHeader?.classList.add('-translate-y-full')
        if (filterBar) filterBar.style.top = '0px'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
