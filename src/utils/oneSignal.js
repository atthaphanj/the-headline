import { ONESIGNAL_APP_ID } from '../utils/constants'

let initialized = false

export async function initOneSignal() {
  if (initialized) return
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
    console.warn('[OneSignal] กรุณาตั้งค่า VITE_ONESIGNAL_APP_ID ใน .env')
    return
  }

  try {
    const OneSignal = (await import('react-onesignal')).default
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      notifyButton: {
        enable: true,
        prenotify: true,
        showCredit: false,
        text: {
          'tip.state.unsubscribed': 'รับการแจ้งเตือนข่าวใหม่',
          'tip.state.subscribed': 'คุณจะได้รับการแจ้งเตือนข่าวใหม่',
          'tip.state.blocked': 'เปิดการแจ้งเตือนในเบราว์เซอร์',
          'message.prenotify': 'คลิกเพื่อรับการแจ้งเตือนข่าวใหม่จาก THE HEADLINE',
          'message.action.subscribed': 'ขอบคุณที่สมัครรับการแจ้งเตือน!',
          'message.action.resubscribed': 'สมัครรับการแจ้งเตือนอีกครั้งแล้ว',
          'message.action.unsubscribed': 'ยกเลิกการแจ้งเตือนแล้ว',
          'dialog.main.title': 'จัดการการแจ้งเตือน',
          'dialog.main.button.subscribe': 'สมัครรับ',
          'dialog.main.button.unsubscribe': 'ยกเลิก',
          'dialog.blocked.title': 'ปลดบล็อกการแจ้งเตือน',
          'dialog.blocked.message': 'กรุณาอนุญาตการแจ้งเตือนในเบราว์เซอร์',
        },
      },
      welcomeNotification: {
        title: 'THE HEADLINE',
        message: 'ขอบคุณที่สมัครรับการแจ้งเตือนข่าวใหม่!',
      },
    })
    initialized = true
  } catch (err) {
    console.error('[OneSignal] init failed:', err)
  }
}

export async function promptPushPermission() {
  try {
    const OneSignal = (await import('react-onesignal')).default
    await OneSignal.Slidedown.promptPush()
  } catch (err) {
    console.error('[OneSignal] prompt failed:', err)
  }
}
