import { useState, useEffect, useRef } from 'react'
import { PROVINCES } from '../utils/constants'

export default function FilterBar({
  currentProvince,
  currentAmphoes,
  provinceCounts,
  amphoeCounts,
  onSelectProvince,
  onToggleAmphoe,
  showDateIndicator,
  dateText,
  clockText,
  clockShort,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownOpen && wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [dropdownOpen])

  const activeClass =
    'bg-blue-600 text-white border-blue-600 shadow-lg'
  const inactiveClass =
    'bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'

  const totalNews = Object.values(provinceCounts).reduce((a, b) => a + b, 0)

  const showAmphoeFilter =
    currentProvince !== 'All' &&
    amphoeCounts[currentProvince] &&
    Object.keys(amphoeCounts[currentProvince]).length > 1

  let buttonText = 'ทั้งหมด'
  if (currentAmphoes.length > 0) {
    buttonText =
      currentAmphoes.length <= 2
        ? currentAmphoes.join(', ')
        : `${currentAmphoes.length} กลุ่ม`
  }

  const amphoes = showAmphoeFilter
    ? Object.keys(amphoeCounts[currentProvince]).sort((a, b) => {
        if (a === 'ทั่วไป') return -1
        if (b === 'ทั่วไป') return 1
        return a.localeCompare(b, 'th')
      })
    : []

  return (
    <div
      id="filter-bar"
      className="sticky top-0 z-40 bg-gray-100/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 shadow-md transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 w-full flex flex-col relative z-50 overflow-visible">
        <div className="flex flex-col w-full relative overflow-visible">
          <div className="w-full overflow-hidden relative">
            <div
              id="filter-container"
              className="flex flex-nowrap items-center justify-start gap-2 overflow-x-auto no-scrollbar pb-1 w-full"
            >
              <button
                onClick={() => onSelectProvince('All')}
                className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 ${
                  currentProvince === 'All' ? activeClass : inactiveClass
                }`}
              >
                ทั้งหมด{' '}
                <span
                  className={`bg-black/20 px-1.5 py-0.5 rounded-md text-[10px] ${
                    currentProvince === 'All' ? 'text-white' : 'text-gray-500 dark:text-gray-300'
                  }`}
                >
                  {totalNews}
                </span>
              </button>
              {PROVINCES.map((prov) => {
                const count = provinceCounts[prov] || 0
                const isActive = currentProvince === prov
                return (
                  <button
                    key={prov}
                    onClick={() => onSelectProvince(prov)}
                    className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition-all duration-200 flex items-center justify-center gap-2 ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    {prov}{' '}
                    <span
                      className={`bg-black/20 px-1.5 py-0.5 rounded-md text-[10px] ${
                        isActive ? 'text-white' : 'text-gray-500 dark:text-gray-300'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-gray-100 dark:from-gray-800 to-transparent md:hidden pointer-events-none z-10" />
          </div>

          {showAmphoeFilter && (
            <div
              id="amphoe-filter-wrapper"
              className="w-full relative mt-1 border-t border-gray-200/60 dark:border-gray-700/60 pt-2 overflow-visible"
            >
              <div id="amphoe-filter-container" className="flex flex-col sm:flex-row sm:items-center gap-2 w-full overflow-visible">
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 shrink-0">
                  <i className="fa-solid fa-filter"></i> กลุ่มย่อย:
                </span>
                <div
                  ref={wrapperRef}
                  id="amphoe-dropdown-wrapper"
                  className="relative flex-1 min-w-0 text-left w-full sm:w-[200px] md:w-64 z-[100]"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDropdownOpen((v) => !v)
                    }}
                    className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 transition-colors"
                  >
                    <span className="truncate block w-full text-left">{buttonText}</span>
                    <i className="fa-solid fa-chevron-down text-[10px] text-gray-400 ml-2"></i>
                  </button>
                  {!dropdownOpen ? null : (
                    <div
                      id="amphoe-dropdown-menu"
                      className="origin-top-right absolute left-0 mt-1 w-full rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-600 max-h-60 overflow-y-auto z-[100]"
                    >
                      <div className="p-2">
                        <label className="flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition-colors group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                            checked={currentAmphoes.length === 0}
                            onChange={() => onToggleAmphoe('All')}
                          />
                          <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600">
                            ทั้งหมด
                          </span>
                        </label>
                        <hr className="my-1 border-gray-100 dark:border-gray-700" />
                        {amphoes.map((amp) => (
                          <label
                            key={amp}
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                          >
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                              checked={currentAmphoes.includes(amp)}
                              onChange={() => onToggleAmphoe(amp)}
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-200 flex-grow">
                              {amp}
                            </span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-md font-medium">
                              {amphoeCounts[currentProvince][amp]}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full border-t border-gray-200 dark:border-gray-700 pt-2 pb-1 mt-1">
          {showDateIndicator && (
            <div id="date-indicator" className="shrink-0">
              <div className="text-[10px] md:text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-2.5 sm:px-3 py-1 rounded-full shadow-sm flex items-center w-fit max-w-full">
                <i className="fa-regular fa-calendar-check mr-1 sm:mr-1.5 shrink-0"></i>
                <span className="truncate">
                  ข้อมูลของวันที่ <span className="font-bold">{dateText}</span>
                </span>
              </div>
            </div>
          )}
          <div id="live-clock" className={`shrink-0 ${showDateIndicator ? 'sm:ml-auto' : 'ml-auto'}`}>
            <div className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2.5 sm:px-3 py-1 rounded-full shadow-sm flex items-center transition-colors w-fit max-w-full">
              <i className="fa-regular fa-clock mr-1 sm:mr-1.5 shrink-0"></i>
              <span className="sm:hidden truncate">{clockShort}</span>
              <span className="hidden sm:inline truncate">{clockText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
