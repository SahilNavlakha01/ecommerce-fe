"use client"

import { useState, useEffect } from 'react'
import { CheckUploadStatus } from '@/Services/GetService'

interface StatusCheckerProps {
  fileLogId: number
  onStatusUpdate?: (status: any) => void
  interval?: number
}

export default function StatusChecker({ fileLogId, onStatusUpdate, interval = 3000 }: StatusCheckerProps) {
  const [status, setStatus] = useState<any>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!fileLogId) return

    const checkStatus = async () => {
      try {
        const response = await CheckUploadStatus(fileLogId)
        if (response?.data) {
          setStatus(response.data)
          if (onStatusUpdate) {
            onStatusUpdate(response.data)
          }
          
          // Stop checking if completed or failed
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            setIsChecking(false)
          }
        }
      } catch (error) {
        console.error('Error checking status:', error)
        setIsChecking(false)
      }
    }

    // Initial check
    checkStatus()

    // Set up interval if still checking
    let intervalId: NodeJS.Timeout | null = null
    if (isChecking) {
      intervalId = setInterval(checkStatus, interval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fileLogId, isChecking, interval, onStatusUpdate])

  if (!status) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
        <span>Checking status...</span>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'failed': return 'text-red-600'
      case 'processing': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'processing':
        return (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        )
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        )
    }
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon(status.status)}
      <span className={`font-medium ${getStatusColor(status.status)}`}>
        Status: {status.status}
      </span>
      {status.message && (
        <span className="text-gray-600">- {status.message}</span>
      )}
    </div>
  )
}