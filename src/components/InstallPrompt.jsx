import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  // เพิ่ม State สำหรับจัดการสถานะ Push Notification
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    // เช็คสถานะ Permission ปัจจุบัน (ถ้าเบราว์เซอร์รองรับ)
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    setIsIOS(ios)
    setIsStandalone(standalone)

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (!standalone && !dismissed) {
      if (ios) setShowBanner(true)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (!dismissed) setShowBanner(true)
    }

    // ดักจับกรณีที่ผู้ใช้ติดตั้งแอปผ่านเมนูของเบราว์เซอร์เอง (ไม่ได้กดปุ่มของเรา)
    const onAppInstalled = () => {
      requestNotification()
      setShowBanner(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  // ฟังก์ชันขออนุญาตแจ้งเตือน
  const requestNotification = async () => {
    if (!('Notification' in window)) return
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        setNotificationPermission(permission)
        
        if (permission === 'granted') {
          // แจ้งเตือนสำเร็จ สามารถใส่โค้ด Subscribe Service Worker ต่อตรงนี้ได้
          console.log('Notification allowed!')
        }
      } catch (error) {
        console.error('Error requesting notification:', error)
      }
    }
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      // เมื่อผู้ใช้กดยอมรับการติดตั้งแอปสำเร็จ
      if (outcome === 'accepted') {
        // ให้เด้งขอ Notification ทันที (สำหรับ Android / Desktop)
        await requestNotification()
      }
      
      setDeferredPrompt(null)
      setShowBanner(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', '1')
    setShowBanner(false)
  }

  // ----------------------------------------------------------------------
  // สำหรับ iOS และผู้ใช้ที่ติดตั้งแล้ว (Standalone) แต่ยังไม่เคยเปิดแจ้งเตือน
  // ----------------------------------------------------------------------
  if (isStandalone && notificationPermission === 'default') {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-bell text-white text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              เปิดรับการแจ้งเตือน
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              เพื่อไม่ให้พลาดข่าวสารสำคัญจาก THE HEADLINE กรุณาเปิดการแจ้งเตือน
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={requestNotification}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition"
              >
                อนุญาตแจ้งเตือน
              </button>
              <button
                onClick={() => setNotificationPermission('denied')} // ซ่อนแบนเนอร์ถ้ากดไว้ทีหลัง
                className="px-4 py-1.5 text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
              >
                ไว้ทีหลัง
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ซ่อนแบนเนอร์ติดตั้ง หากติดตั้งแล้ว หรือกดปิดไปแล้ว
  if (isStandalone || !showBanner) return null

  // แบนเนอร์ติดตั้งแอปแบบเดิม
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-mobile-screen text-white text-xl"></i>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-sm">
            ติดตั้ง THE HEADLINE
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {isIOS
              ? 'กด Share แล้วเลือก "Add to Home Screen" เพื่อรับการแจ้งเตือนข่าวใหม่'
              : 'ติดตั้งแอปบนมือถือเพื่อรับ Push Notification ข่าวใหม่'}
          </p>
          <div className="flex gap-2 mt-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 transition"
              >
                ติดตั้งเลย
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="px-4 py-1.5 text-gray-500 text-xs font-semibold hover:text-gray-700 transition"
            >
              ไว้ทีหลัง
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  )
}