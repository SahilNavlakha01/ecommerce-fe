"use client"

import { useState, useEffect } from 'react'
import { CheckUploadStatus } from '@/Services/GetService'

interface RealTimeProgressProps {
  fileLogId: number
  onComplete?: (status: any) => void
  onError?: (error: any) => void
}

export default function RealTimeProgress({ fileLogId, onComplete, onError }: RealTimeProgressProps) {
  const [status, setStatus] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!fileLogId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await CheckUploadStatus(fileLogId)
        console.log('Status response:', response) // Debug log
        
        if (response?.data?.success && response.data.data) {
          const currentStatus = response.data.data
          setStatus(currentStatus)
          
          // Calculate progress
          if (currentStatus.totalRows && currentStatus.totalRows > 0) {
            const processed = (currentStatus.successRows || 0) + (currentStatus.failedRows || 0)
            const progressPercent = Math.round((processed / currentStatus.totalRows) * 100)
            setProgress(progressPercent)
          }
          
          // Stop polling when done - check multiple completion indicators
          if (currentStatus.status === 'completed' || 
              currentStatus.status === 'failed' || 
              currentStatus.progressPercentage === 100 ||
              (currentStatus.totalRows && currentStatus.processedRows >= currentStatus.totalRows)) {
            clearInterval(pollInterval)
            if (onComplete) {
              onComplete(currentStatus)
            }
          }
        } else {
          console.warn('No valid data in status response:', response)
          // If no valid response, stop polling after a few attempts
          clearInterval(pollInterval)
          if (onError) {
            onError(new Error('Invalid status response'))
          }
        }
      } catch (error) {
        console.error('Progress tracking error:', error)
        clearInterval(pollInterval)
        if (onError) {
          onError(error)
        }
      }
    }, 2000)

    // Cleanup timeout after 5 minutes
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval)
      console.warn('Progress tracking timeout after 5 minutes')
      if (onError) {
        onError(new Error('Progress tracking timeout'))
      }
    }, 300000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeoutId)
    }
  }, [fileLogId, onComplete, onError])

  if (!status) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin"></div>
        <span>Initializing upload...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Processing {status.totalRows ? `${(status.successRows || 0) + (status.failedRows || 0)}/${status.totalRows}` : ''} rows
          </span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-2 text-center border">
          <div className="text-lg font-bold text-gray-900">{status.totalRows || 0}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border">
          <div className="text-lg font-bold text-green-600">{status.successRows || 0}</div>
          <div className="text-xs text-gray-600">Success</div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center border">
          <div className="text-lg font-bold text-red-600">{status.failedRows || 0}</div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
      </div>

      {/* Live Errors */}
      {status.errors && status.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="font-medium text-red-900 text-sm mb-2">Recent Errors:</h4>
          <div className="max-h-24 overflow-y-auto">
            <ul className="text-xs text-red-800 space-y-1">
              {status.errors.slice(-5).map((error: string, index: number) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}