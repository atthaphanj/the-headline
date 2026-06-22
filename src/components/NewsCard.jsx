import {
  isImageFile,
  stripHtml,
  formatThaiDate,
  splitText,
} from '../utils/newsApi'

export function SectionHeader({ provinceName, amphoeName, count }) {
  const displayName =
    amphoeName !== 'ทั่วไป' ? `${provinceName} (กลุ่ม ${amphoeName})` : provinceName
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 sm:mt-6 mb-2 fade-in">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
        <div className="h-6 sm:h-8 w-1.5 bg-blue-500 rounded-sm shrink-0"></div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white font-sans tracking-tight min-w-0 break-words">
          {displayName}
        </h3>
        <span className="bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border shrink-0">
          {count} ข่าว
        </span>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-gray-300 via-gray-400 to-transparent dark:from-gray-700 dark:via-gray-800" />
    </div>
  )
}

export default function NewsCard({ group }) {
  const item = group.mainPost
  const validImages = group.images.filter((url) => isImageFile(url))
  const totalImages = validImages.length
  const hasImage = totalImages > 0
  const imageUrl = hasImage ? validImages[0] : ''

  let rawText = item.text ? stripHtml(item.text).trim() : ''
  const hasText = rawText.length > 0

  const { date: dateStr, time: timeStr } = formatThaiDate(item.created_at)
  const sourceParam = item.source_api ? `&source=${encodeURIComponent(item.source_api)}` : ''
  const link = `/newsdetail?id=${item.id}${sourceParam}`
  const groupName = item.amphoe !== 'ทั่วไป' ? `${item.province} (${item.amphoe})` : item.province
  const postedBy = item.group_name || 'สำนักบริการวิชาการ มช.'

  const cardBaseClass =
    'group block fade-in h-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col'

  const cardHeader = (
    <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex items-center gap-2 sm:gap-3 min-w-0">
      <div className="shrink-0">
        <img
          src="/assets/images/logo/Logo3.jpg"
          className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 p-0.5 object-contain bg-white"
          alt="logo"
          onError={(e) => { e.target.src = '/favicon.svg' }}
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0 flex-1">
        <span className="font-bold text-sm text-gray-900 dark:text-gray-100 font-sans">
          THE HEAD<span className="text-red-600">LINE</span>
        </span>
        <div className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center flex-wrap gap-1">
          <span
            className="font-semibold text-gray-600 dark:text-gray-300 line-clamp-1 max-w-[120px] sm:max-w-[180px]"
            title={postedBy}
          >
            {postedBy}
          </span>
          <span className="mx-0.5 opacity-50 sm:inline hidden">•</span>
          <span className="text-blue-600 dark:text-blue-400 line-clamp-1">{groupName}</span>
        </div>
      </div>
    </div>
  )

  const footerStandard = (
    <div className="mt-auto pt-3 pb-4 px-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
      <div className="flex items-center gap-2">
        <i className="fa-regular fa-calendar"></i>
        <span>{dateStr}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <i className="fa-regular fa-clock"></i>
        <span>{timeStr}</span>
      </div>
    </div>
  )

  const targetLength = hasImage ? 80 : 150
  const { title, detailText } = splitText(rawText, targetLength)

  if (hasImage && !hasText) {
    return (
      <a href={link} className={cardBaseClass}>
        {cardHeader}
        <div className="relative w-full h-full min-h-[300px] mt-1">
          <img
            src={imageUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            alt=""
          />
          {totalImages > 1 && (
            <div className="album-marker">
              <i className="fa-solid fa-layer-group"></i> 1/{totalImages}
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-300">
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-calendar"></i> <span>{dateStr}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-clock"></i> <span>{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    )
  }

  if (!hasImage && hasText) {
    return (
      <a href={link} className={cardBaseClass}>
        {cardHeader}
        <div className="p-4 pt-1 flex flex-col flex-grow">
          <h3 className="text-lg font-bold leading-snug mb-2 text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
            {title}
          </h3>
          {detailText && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light thai-reading line-clamp-6 flex-grow">
              {detailText}
            </p>
          )}
        </div>
        {footerStandard}
      </a>
    )
  }

  return (
    <a href={link} className={cardBaseClass}>
      {cardHeader}
      <div className="relative w-full h-64 bg-gray-200 dark:bg-gray-900 overflow-hidden shrink-0 mt-1">
        <img
          src={imageUrl}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          alt=""
        />
        {totalImages > 1 && (
          <div className="album-marker">
            <i className="fa-solid fa-layer-group"></i> 1/{totalImages}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-4 pt-3">
        <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-brand-blue transition-colors line-clamp-2 text-gray-800 dark:text-gray-100">
          {title}
        </h3>
        {detailText && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light thai-reading mb-2 line-clamp-2 flex-grow">
            {detailText}
          </p>
        )}
      </div>
      {footerStandard}
    </a>
  )
}

export function SkeletonCards({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full"
    >
      <div className="p-4 flex gap-3 items-center border-b border-gray-100 dark:border-gray-700">
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-1/2 rounded"></div>
          <div className="skeleton h-2 w-1/3 rounded"></div>
        </div>
      </div>
      <div className="skeleton w-full aspect-video"></div>
      <div className="p-4 flex flex-col flex-grow gap-3">
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-3/4 rounded"></div>
      </div>
    </div>
  ))
}
