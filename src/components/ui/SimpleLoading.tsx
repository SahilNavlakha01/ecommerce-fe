import React from 'react'

interface SimpleLoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function SimpleLoading({ message = "Loading...", size = 'md' }: SimpleLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-3">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-2 border-teal-200 border-t-teal-600`}></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}

export function PageLoading({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
        <SimpleLoading message={message} size="lg" />
      </div>
    </div>
  )
}