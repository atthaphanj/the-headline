import {
  API_URLS,
  SOURCE_MAPPING,
  PROVINCE_PRIORITY,
  AUTH,
  GROUP_TIME_LIMIT,
} from './constants'

export const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

export const parseDate = (dateStr) =>
  !dateStr ? new Date() : new Date(dateStr.replace(' ', 'T'))

export const isImageFile = (url) => {
  if (!url) return false
  const extension = url.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)
}

export const stripHtml = (html) => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export const formatThaiDate = (dateString) => {
  if (!dateString) return { date: '', time: '' }
  const date = new Date(dateString.replace(' ', 'T'))
  if (isNaN(date.getTime())) return { date: dateString, time: '' }
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ]
  const d = `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`
  const t = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
  return { date: d, time: t }
}

export const groupData = (rawData) => {
  const groups = []
  rawData.forEach((item) => {
    const itemDate = parseDate(item.created_at)
    const lastGroup = groups[groups.length - 1]
    let addToGroup = false
    if (lastGroup) {
      const lastItemInGroup = lastGroup.items[lastGroup.items.length - 1]
      const lastDate = parseDate(lastItemInGroup.created_at)
      const diffMinutes = Math.abs(lastDate - itemDate) / (1000 * 60)
      if (
        String(lastGroup.mainPost.user_id) === String(item.user_id) &&
        lastGroup.mainPost.province === item.province &&
        lastGroup.mainPost.amphoe === item.amphoe &&
        diffMinutes <= GROUP_TIME_LIMIT
      ) {
        addToGroup = true
      }
    }
    if (addToGroup) {
      lastGroup.items.push(item)
      if (item.file_url) lastGroup.images.push(item.file_url)
      if (!lastGroup.mainPost.text && item.text) lastGroup.mainPost.text = item.text
    } else {
      groups.push({
        mainPost: item,
        items: [item],
        images: item.file_url ? [item.file_url] : [],
      })
    }
  })
  return groups
}

export const splitText = (rawText, targetLength) => {
  let title = rawText
  let detailText = ''
  if (rawText.length > targetLength) {
    let splitIndex = targetLength
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      try {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' })
        let currentLen = 0
        for (const seg of segmenter.segment(rawText)) {
          if (currentLen + seg.segment.length > targetLength) {
            splitIndex = currentLen
            break
          }
          currentLen += seg.segment.length
        }
        if (splitIndex === 0) splitIndex = targetLength
      } catch {
        splitIndex = targetLength
      }
    }
    title = rawText.substring(0, splitIndex) + '...'
    detailText = rawText.substring(splitIndex).trim()
    if (detailText.startsWith('.')) detailText = detailText.replace(/^[\.\s]+/, '')
  }
  return { title, detailText }
}

export const getTargetDate = () => {
  const dateParam = getQueryParam('date')
  let targetDateObj = new Date()
  if (dateParam) {
    const parts = dateParam.split('-')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      targetDateObj = new Date(`${year}-${month}-${day}T00:00:00`)
    }
  }
  return targetDateObj
}

export const formatDateParam = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const cleanAndSortData = (combinedData, targetDateObj) => {
  combinedData.sort((a, b) => {
    const p1 = PROVINCE_PRIORITY[a.province] || 99
    const p2 = PROVINCE_PRIORITY[b.province] || 99
    if (p1 !== p2) return p1 - p2
    if (a.amphoe !== b.amphoe) {
      if (a.amphoe === 'ทั่วไป') return -1
      if (b.amphoe === 'ทั่วไป') return 1
      return a.amphoe.localeCompare(b.amphoe, 'th')
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const unsentMsgIds = new Set(
    combinedData.filter((item) => item.msg_type === 'unsend').map((item) => item.msg_id)
  )

  return combinedData.filter((item) => {
    if (
      item.msg_type === 'unsend' ||
      item.msg_type === 'sticker' ||
      (item.msg_id && unsentMsgIds.has(item.msg_id))
    )
      return false
    if (item.is_show == 0) return false
    if (item.event_type === 'memberJoined') return false
    if (item.file_url && !isImageFile(item.file_url)) return false

    const itemDate = parseDate(item.created_at)
    if (
      itemDate.getDate() !== targetDateObj.getDate() ||
      itemDate.getMonth() !== targetDateObj.getMonth() ||
      itemDate.getFullYear() !== targetDateObj.getFullYear()
    )
      return false
    return true
  })
}

export const fetchAllNews = async (dateParam) => {
  const fetchPromises = API_URLS.map((url) =>
    fetch(`${url}?date=${dateParam}`, { headers: { Authorization: AUTH } })
      .then((r) => r.json())
      .then((json) => {
        if (json.status === 'success' && Array.isArray(json.data)) {
          json.data.forEach((i) => {
            i.source_api = url
            const mapInfo = SOURCE_MAPPING[url] || { province: 'อื่นๆ', amphoe: 'อื่นๆ' }
            i.province = mapInfo.province
            i.amphoe = mapInfo.amphoe
          })
        }
        return json
      })
      .catch(() => ({ status: 'error', data: [] }))
  )

  const results = await Promise.all(fetchPromises)
  let combinedData = []
  results.forEach((json) => {
    if (json.status === 'success' && Array.isArray(json.data))
      combinedData = combinedData.concat(json.data)
  })
  return combinedData
}

export const countByProvinceAmphoe = (groups) => {
  const provinceCounts = {}
  const amphoeCounts = {}
  groups.forEach((group) => {
    const p = group.mainPost.province
    const a = group.mainPost.amphoe
    provinceCounts[p] = (provinceCounts[p] || 0) + 1
    if (!amphoeCounts[p]) amphoeCounts[p] = {}
    amphoeCounts[p][a] = (amphoeCounts[p][a] || 0) + 1
  })
  return { provinceCounts, amphoeCounts }
}
