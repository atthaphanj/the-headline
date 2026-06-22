import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

function ThemeToggleButton({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
      className={`w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition shrink-0 ${className}`}
    >
      {isDark ? (
        <i className="fa-solid fa-sun text-amber-400"></i>
      ) : (
        <i className="fa-solid fa-moon text-blue-600"></i>
      )}
    </button>
  )
}

export default function Header({ onOpenTranslate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  const toggleMenu = () => setMenuOpen((v) => !v)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      {/* Sticky mini header — แสดงเมื่อ scroll ลง */}
      <div className="fixed top-0 inset-x-0 z-50 pointer-events-none">
        <header
          id="sticky-header"
          className="pointer-events-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-sm transition-transform duration-300 -translate-y-full w-full"
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
            <a href="/" className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                THE HEAD<span className="text-red-600">LINE</span>
              </span>
            </a>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onOpenTranslate}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="แปลภาษา"
              >
                <i className="fa-solid fa-language"></i>
              </button>
              <ThemeToggleButton />
            </div>
          </div>
        </header>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[min(280px,85vw)] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            THE HEAD<span className="text-red-600">LINE</span>
          </span>
          <button
            type="button"
            onClick={closeMenu}
            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-500"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <nav className="p-3 flex flex-col gap-1">
          <a
            href="/"
            onClick={closeMenu}
            className="px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm"
          >
            <i className="fa-solid fa-newspaper mr-2"></i> ข่าวประจำวัน
          </a>
          <button
            type="button"
            onClick={() => { onOpenTranslate(); closeMenu() }}
            className="px-4 py-3 rounded-xl text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
          >
            <i className="fa-solid fa-language mr-2"></i> แปลภาษา
          </button>
          <button
            type="button"
            onClick={() => { toggleTheme(); closeMenu() }}
            className="px-4 py-3 rounded-xl text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm flex items-center gap-2"
          >
            <i className={`fa-solid ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-blue-600'}`}></i>
            {isDark ? 'ธีมสว่าง' : 'ธีมมืด'}
          </button>
        </nav>
      </aside>

      {/* Hero header — มองเห็นตลอด */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 pb-3">
          {/* Top bar: actions บนมือถือ */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition shrink-0"
              aria-label="เมนู"
            >
              <i className="fa-solid fa-bars text-lg"></i>
            </button>

            <div className="hidden md:flex items-center gap-3 ml-auto">
              <a href="/" className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                ข่าวประจำวัน
              </a>
              <button
                type="button"
                onClick={onOpenTranslate}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition flex items-center gap-1"
              >
                <i className="fa-solid fa-language"></i> แปลภาษา
              </button>
              <ThemeToggleButton />
            </div>

            {/* Mobile: ปุ่ม theme + translate ด้านขวา */}
            <div className="flex md:hidden items-center gap-1.5 ml-auto shrink-0">
              <button
                type="button"
                onClick={onOpenTranslate}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="แปลภาษา"
              >
                <i className="fa-solid fa-language"></i>
              </button>
              <ThemeToggleButton className="w-10 h-10 rounded-xl" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white font-serif leading-tight">
              THE HEADLINE
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
              Daily News
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
