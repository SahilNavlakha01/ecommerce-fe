"use client"

import { useEffect, useState } from "react"

export default function TopBanner() {
  const [isB2bUser, setIsB2bUser] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  const messages = isB2bUser ? [
    "💎 B2B Wholesale Fashion Jewellery: Minimum Order ₹3000",
    "🚚 Pan-India Express Bulk Delivery Available",
    "✨ Premium Quality & Skin-Friendly Assured"
  ] : [
    "✨ USE CODE 'FASHION15' FOR 15% OFF ON YOUR FIRST ORDER",
    "✨ TRENDING DESIGNS & CELEBRITY-INSPIRED LOOKS",
    "🚚 FREE EXPRESS DELIVERY ON ORDERS ABOVE ₹999",
    "🎁 COMPLIMENTARY PREMIUM GIFT PACKAGING"
  ]

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1]

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setIsB2bUser(parsedData.userRole === 2)
      } catch { }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="bg-[#18181b] text-stone-200 text-center px-3 py-2 sm:px-4 sm:py-2.5 border-b border-rose-950/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase transition-opacity duration-300">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1"></span>
          <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 bg-clip-text text-transparent font-bold">
            {messages[currentMessageIndex]}
          </span>
          <span className="hidden md:inline text-stone-400 font-normal">|</span>
          <span className="hidden md:inline text-stone-300 font-medium tracking-widest text-[10px]">
            PREMIUM FINISH • SKIN FRIENDLY • PAN-INDIA DELIVERY
          </span>
        </div>
      </div>
    </div>
  )
}
