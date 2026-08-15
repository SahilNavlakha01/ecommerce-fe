import React from 'react'

interface FormLoadingProps {
  show: boolean
  message?: string
}

export function FormLoading({ show, message = "Processing..." }: FormLoadingProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-200 border-t-teal-600"></div>
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  )
}