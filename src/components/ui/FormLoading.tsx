import React from 'react'

interface FormLoadingProps {
  show: boolean
  message?: string
}

export function FormLoading({ show, message = "Processing..." }: FormLoadingProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-6 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-rose-100 border-t-rose-900"></div>
        <span className="text-stone-800 font-semibold text-xs sm:text-sm">{message}</span>
      </div>
    </div>
  )
}