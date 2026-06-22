export const API_URLS = [
  'https://ujic.uniserv.cmu.ac.th/api/api.php',
  'https://haze.cmuccdc.org/api/api.php',
  'https://cm-command.cmuccdc.org/api/api.php',
  'https://lp-hff.cmuccdc.org/api/api.php',
  'https://lp-ff.cmuccdc.org/api/api.php',
  'https://warroom-lp.cmuccdc.org/api/api.php',
  'https://cr-ff.cmuccdc.org/api/api.php',
  'https://mhs-ff.cmuccdc.org/api/api.php',
  'https://mhs-warroom.cmuccdc.org/api/api.php',
  'https://bnep-doiluang.cmuccdc.org/api/api.php',
  'https://sam-ngao-warroom.cmuccdc.org/api/api.php',
  'https://mae-sariang-ff.cmuccdc.org/api/api.php',
]

export const SOURCE_MAPPING = {
  'https://ujic.uniserv.cmu.ac.th/api/api.php': { province: 'เชียงใหม่', amphoe: 'ทั่วไป' },
  'https://haze.cmuccdc.org/api/api.php': { province: 'ภาคประชาชน', amphoe: 'ทั่วไป' },
  'https://cm-command.cmuccdc.org/api/api.php': { province: 'เชียงใหม่', amphoe: 'ทั่วไป' },
  'https://lp-hff.cmuccdc.org/api/api.php': { province: 'ลำพูน', amphoe: 'ทั่วไป' },
  'https://lp-ff.cmuccdc.org/api/api.php': { province: 'ลำพูน', amphoe: 'ทั่วไป' },
  'https://warroom-lp.cmuccdc.org/api/api.php': { province: 'ลำปาง', amphoe: 'ทั่วไป' },
  'https://cr-ff.cmuccdc.org/api/api.php': { province: 'เชียงราย', amphoe: 'ทั่วไป' },
  'https://mhs-ff.cmuccdc.org/api/api.php': { province: 'แม่ฮ่องสอน', amphoe: 'ทั่วไป' },
  'https://mhs-warroom.cmuccdc.org/api/api.php': { province: 'แม่ฮ่องสอน', amphoe: 'ทั่วไป' },
  'https://bnep-doiluang.cmuccdc.org/api/api.php': { province: 'ลำปาง', amphoe: 'ดอยหลวง' },
  'https://sam-ngao-warroom.cmuccdc.org/api/api.php': { province: 'ตาก', amphoe: 'สามเงา' },
  'https://mae-sariang-ff.cmuccdc.org/api/api.php': { province: 'แม่ฮ่องสอน', amphoe: 'แม่สะเรียง' },
}

export const PROVINCE_PRIORITY = {
  'เชียงใหม่': 1,
  'ลำพูน': 2,
  'ลำปาง': 3,
  'เชียงราย': 4,
  'แม่ฮ่องสอน': 5,
  'ตาก': 6,
  'ภาคประชาชน': 7,
}

export const PROVINCES = [
  'เชียงใหม่',
  'ลำพูน',
  'ลำปาง',
  'เชียงราย',
  'แม่ฮ่องสอน',
  'ตาก',
  'ภาคประชาชน',
]

export const AUTH = 'Basic ' + btoa('uniserv:uniservadmin')
export const BATCH_SIZE = 9
export const GROUP_TIME_LIMIT = 2

// ใส่ OneSignal App ID ของคุณที่นี่
export const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID'
