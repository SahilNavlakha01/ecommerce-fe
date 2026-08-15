"use client"

import { useState, useEffect, useRef, memo } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

interface ProgressStats {
  current: number
  total: number
  success: number
  failed: number
}

interface OptimizedProgressProps {
  fileLogId: number
  onComplete?: (status: any) => void
  onError?: (error: any) => void
}

const OptimizedProgress = memo(({ fileLogId, onComplete, onError }: OptimizedProgressProps) => {
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState<ProgressStats>({
    current: 0,
    total: 0,
    success: 0,
    failed: 0
  })
  const [recentActivity, setRecentActivity] = useState<string>('')
  const [errorCount, setErrorCount] = useState(0)
  const errorsRef = useRef<string[]>([])

  const { connectionStatus } = useWebSocket(fileLogId, {
    onProgress: (data) => {
      setProgress(data.progressPercentage)
      setStats({
        current: data.rowNumber,
        total: data.totalRows,
        success: data.successRows,
        failed: data.failedRows
      })
      setRecentActivity(data.message)

      if (data.status === 'error') {
        errorsRef.current.push(`Row ${data.rowNumber}: ${data.message}`)
        setErrorCount(prev => prev + 1)
      }
    },
    onComplete: (data) => {
      setProgress(100)
      if (onComplete) {
        onComplete({
          ...data,
          errors: errorsRef.current
        })
      }
    },
    onError: (error) => {
      if (onError) onError(error)
    }
  })

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-gray-600">
            {connectionStatus === 'connected' ? 'Processing' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Disconnected'}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-900">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Row {stats.current} of {stats.total}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
          <div className="text-xl font-bold text-green-600">✓ {stats.success}</div>
          <div className="text-xs text-gray-600">Success</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
          <div className="text-xl font-bold text-red-600">✗ {stats.failed}</div>
          <div className="text-xs text-gray-600">Failed</div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <p className="text-xs text-gray-500 mb-1">Recent Activity:</p>
          <p className="text-sm text-gray-700">{recentActivity}</p>
        </div>
      )}

      {/* Error Alert */}
      {errorCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ {errorCount} row{errorCount > 1 ? 's' : ''} failed. Details will be shown after completion.
          </p>
        </div>
      )}
    </div>
  )
})

OptimizedProgress.displayName = 'OptimizedProgress'

export default OptimizedProgress
