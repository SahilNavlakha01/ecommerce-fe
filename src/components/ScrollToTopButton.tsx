'use client'

import { useEffect, useState } from 'react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        // Keep the button above the mobile bottom tab bar.
        'fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50',
        'h-11 w-11 sm:h-12 sm:w-12 rounded-full shadow-lg',
        'bg-teal-700 text-white border border-white/20',
        'flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'hover:bg-teal-800 hover:scale-105 active:scale-95',
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
