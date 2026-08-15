"use client"

import { useEffect, useState } from "react"

export default function TopBanner() {
  const [isB2bUser, setIsB2bUser] = useState(false)

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1]

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setIsB2bUser(parsedData.userRole === 2)
      } catch {}
    }
  }, [])

  return (
    <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 text-white text-center px-3 py-2 sm:px-4 sm:py-2.5 shadow-md relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-[11px] sm:text-sm font-bold tracking-wide leading-tight">
          <svg className="hidden sm:block w-4 h-4 text-yellow-300 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {isB2bUser ? (
            <span className="max-w-[16rem] sm:max-w-none bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent font-extrabold text-center">
              B2B Minimum Order: Rs 3000
            </span>
          ) : (
            <span className="max-w-[17rem] sm:max-w-none bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent font-extrabold text-center">
              New customers enjoy 15% off on their first order
            </span>
          )}

          <svg className="hidden sm:block w-4 h-4 text-yellow-300 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
