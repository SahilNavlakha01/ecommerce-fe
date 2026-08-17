'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    // Stale deployment: browser has cached JS from old build, new server doesn't
    // recognise the action hash. Hard-reload fetches fresh chunks automatically.
    if (error?.message?.includes('Failed to find Server Action')) {
      window.location.reload()
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-sans">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-rose-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-3">Something went wrong!</h2>
        <p className="text-stone-500 text-sm mb-6">
          We apologize for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md cursor-pointer"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-white text-rose-900 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest border border-stone-200 hover:bg-rose-50/60 transition-all shadow-sm cursor-pointer"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    </div>
  )
}