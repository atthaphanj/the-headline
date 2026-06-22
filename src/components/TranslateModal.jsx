import { useState } from 'react'

const LANGUAGES = [
  { code: 'th', flag: '🇹🇭', name: 'ภาษาไทย', sub: 'Thai' },
  { code: 'en', flag: '🇬🇧', name: 'English', sub: 'อังกฤษ' },
  { code: 'zh-CN', flag: '🇨🇳', name: '简体中文', sub: 'จีน (Chinese Simplified)' },
  { code: 'ja', flag: '🇯🇵', name: '日本語', sub: 'ญี่ปุ่น (Japanese)' },
  { code: 'ko', flag: '🇰🇷', name: '한국어', sub: 'เกาหลี (Korean)' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch', sub: 'เยอรมัน (German)' },
]

export default function TranslateModal({ open, onClose }) {
  const changeLanguage = (langCode) => {
    const googleCombo = document.querySelector('.goog-te-combo')
    if (googleCombo) {
      googleCombo.value = langCode
      googleCombo.dispatchEvent(new Event('change'))
    }
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-language text-blue-500"></i> เลือกภาษา / Language
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700 transition group border border-transparent hover:border-blue-100 dark:hover:border-gray-600 text-left"
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex flex-col">
                <span className="font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {lang.name}
                </span>
                <span className="text-xs text-gray-400">{lang.sub}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700">
          Powered by Google Translate
        </div>
      </div>
    </div>
  )
}

export function initGoogleTranslate() {
  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'th',
        includedLanguages: 'th,en,zh-CN,ja,ko,de',
        autoDisplay: false,
      },
      'google_translate_element'
    )
  }
}
