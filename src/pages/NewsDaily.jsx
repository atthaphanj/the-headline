import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '../components/Header'
import FilterBar from '../components/FilterBar'
import NewsCard, { SectionHeader, SkeletonCards } from '../components/NewsCard'
import TranslateModal, { initGoogleTranslate } from '../components/TranslateModal'
import InstallPrompt from '../components/InstallPrompt'
import { useLiveClock, useStickyHeader } from '../hooks/useTheme'
import { BATCH_SIZE } from '../utils/constants'
import {
  fetchAllNews,
  groupData,
  cleanAndSortData,
  countByProvinceAmphoe,
  getTargetDate,
  formatDateParam,
} from '../utils/newsApi'

export default function NewsDaily() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allGroupedPosts, setAllGroupedPosts] = useState([])
  const [currentDisplayList, setCurrentDisplayList] = useState([])
  const [renderedCount, setRenderedCount] = useState(0)
  const [currentProvince, setCurrentProvince] = useState('All')
  const [currentAmphoes, setCurrentAmphoes] = useState([])
  const [provinceCounts, setProvinceCounts] = useState({})
  const [amphoeCounts, setAmphoeCounts] = useState({})
  const [showDateIndicator, setShowDateIndicator] = useState(false)
  const [dateText, setDateText] = useState('')
  const [translateOpen, setTranslateOpen] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showNoContent, setShowNoContent] = useState(false)

  const isLoadingRef = useRef(false)
  const sentinelRef = useRef(null)
  const clock = useLiveClock()
  useStickyHeader()

  useEffect(() => {
    initGoogleTranslate()
  }, [])

  const applyFilters = useCallback((groups, prov, amphoes) => {
    const filtered = groups.filter((group) => {
      const p = group.mainPost.province
      const a = group.mainPost.amphoe
      if (prov !== 'All' && p !== prov) return false
      if (prov !== 'All' && amphoes.length > 0 && !amphoes.includes(a)) return false
      return true
    })
    setCurrentDisplayList(filtered)
    setRenderedCount(Math.min(BATCH_SIZE, filtered.length))
    setShowEnd(filtered.length <= BATCH_SIZE && filtered.length > 0)
    setShowNoContent(filtered.length === 0)
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        const targetDateObj = getTargetDate()
        const dateParam = formatDateParam(targetDateObj)

        const today = new Date()
        const targetCopy = new Date(targetDateObj)
        if (targetCopy.setHours(0, 0, 0, 0) !== today.setHours(0, 0, 0, 0)) {
          setShowDateIndicator(true)
          const day = String(targetDateObj.getDate()).padStart(2, '0')
          const month = String(targetDateObj.getMonth() + 1).padStart(2, '0')
          const year = targetDateObj.getFullYear()
          setDateText(`${day}/${month}/${year}`)
        }

        const combinedData = await fetchAllNews(dateParam)
        const cleanData = cleanAndSortData(combinedData, targetDateObj)
        const groups = groupData(cleanData)
        const counts = countByProvinceAmphoe(groups)

        setAllGroupedPosts(groups)
        setProvinceCounts(counts.provinceCounts)
        setAmphoeCounts(counts.amphoeCounts)
        applyFilters(groups, 'All', [])
      } catch (err) {
        console.error(err)
        setError('Failed to load content.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [applyFilters])

  const loadMore = useCallback(() => {
    if (isLoadingRef.current) return
    if (renderedCount >= currentDisplayList.length) {
      setShowEnd(true)
      return
    }
    isLoadingRef.current = true
    setBatchLoading(true)
    setTimeout(() => {
      setRenderedCount((prev) => {
        const next = Math.min(prev + BATCH_SIZE, currentDisplayList.length)
        if (next >= currentDisplayList.length) setShowEnd(true)
        return next
      })
      isLoadingRef.current = false
      setBatchLoading(false)
    }, 300)
  }, [renderedCount, currentDisplayList.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || currentDisplayList.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '100px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [currentDisplayList, loadMore])

  const handleSelectProvince = (prov) => {
    setCurrentProvince(prov)
    setCurrentAmphoes([])
    setShowEnd(false)
    applyFilters(allGroupedPosts, prov, [])
  }

  const handleToggleAmphoe = (amp) => {
    let next = [...currentAmphoes]
    if (amp === 'All') next = []
    else {
      const idx = next.indexOf(amp)
      if (idx > -1) next.splice(idx, 1)
      else next.push(amp)
    }
    setCurrentAmphoes(next)
    setShowEnd(false)
    applyFilters(allGroupedPosts, currentProvince, next)
  }

  const visiblePosts = currentDisplayList.slice(0, renderedCount)
  const renderedSections = new Set()
  const cards = []

  visiblePosts.forEach((group) => {
    const displayId = `${group.mainPost.province}_${group.mainPost.amphoe}`
    if (!renderedSections.has(displayId)) {
      renderedSections.add(displayId)
      const count = amphoeCounts[group.mainPost.province]?.[group.mainPost.amphoe] || 0
      cards.push(
        <SectionHeader
          key={`section-${displayId}`}
          provinceName={group.mainPost.province}
          amphoeName={group.mainPost.amphoe}
          count={count}
        />
      )
    }
    cards.push(<NewsCard key={`${group.mainPost.id}-${group.mainPost.source_api}`} group={group} />)
  })

  return (
    <div className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-slate-100 font-sans relative flex flex-col min-h-screen transition-colors duration-300 w-full">
      <TranslateModal open={translateOpen} onClose={() => setTranslateOpen(false)} />
      <Header onOpenTranslate={() => setTranslateOpen(true)} />
      <InstallPrompt />

      <FilterBar
        currentProvince={currentProvince}
        currentAmphoes={currentAmphoes}
        provinceCounts={provinceCounts}
        amphoeCounts={amphoeCounts}
        onSelectProvince={handleSelectProvince}
        onToggleAmphoe={handleToggleAmphoe}
        showDateIndicator={showDateIndicator}
        dateText={dateText}
        clockText={clock.clockText}
        clockShort={clock.clockShort}
      />

      <main className="pb-20 flex-grow pt-4 sm:pt-6">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7 min-h-[200px]">
            {loading && <SkeletonCards count={9} />}
            {error && <p className="text-center col-span-full text-red-500">{error}</p>}
            {!loading && !error && cards}
          </div>

          <div ref={sentinelRef} className="h-20 w-full flex items-center justify-center mt-8">
            {batchLoading && (
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-gray-500"></i>
            )}
          </div>

          {showEnd && !showNoContent && (
            <div className="text-center py-8 text-gray-500 text-sm uppercase tracking-wider font-semibold">
              - THE HEADLINE News -
            </div>
          )}

          {showNoContent && !loading && (
            <div className="text-center py-20 text-gray-500">
              <i className="fa-regular fa-calendar-xmark text-4xl mb-4"></i>
              <p className="font-sans font-bold text-lg mb-1">ไม่พบข่าวสาร</p>
              <p className="font-sans text-sm">ยังไม่มีข่าวสำหรับหมวดหมู่หรือวันที่นี้</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
