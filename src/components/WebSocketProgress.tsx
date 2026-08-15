"use client"

import { useState, useEffect } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'

interface ActivityItem {
  row: number
  status: 'success' | 'error'
  message: string
  timestamp: number
}

interface ErrorItem {
  row: number
  message: string
}

interface WebSocketProgressProps {
  fileLogId: number
  onComplete?: (status: any) => void
  onError?: (error: any) => void
}

export default function WebSocketProgress({ fileLogId, onComplete, onError }: WebSocketProgressProps) {
  const [progress, setProgress] = useState(0)
  const [stats, setStats] = useState({
    current: 0,
    total: 0,
    success: 0,
    failed: 0
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [errors, setErrors] = useState<ErrorItem[]>([])
  const [showErrors, setShowErrors] = useState(false)

  const { isConnected, connectionStatus } = useWebSocket(fileLogId, {
    onProgress: (data) => {
      setProgress(data.progressPercentage)
      setStats({
        current: data.rowNumber,
        total: data.totalRows,
        success: data.successRows,
        failed: data.failedRows
      })

      // Add to activity feed
      setActivities(prev => [...prev.slice(-20), {
        row: data.rowNumber,
        status: data.status,
        message: data.message,
        timestamp: Date.now()
      }])

      // Add to errors if failed
      if (data.status === 'error') {
        setErrors(prev => [...prev, {
          row: data.rowNumber,
          message: data.message
        }])
      }
    },
    onComplete: (data) => {
      setProgress(100)
      if (onComplete) {
        onComplete({
          status: data.status,
          message: data.message,
          totalRows: data.totalRows,
          successRows: data.successRows,
          failedRows: data.failedRows,
          errors: errors.map(e => `Row ${e.row}: ${e.message}`)
        })
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
      if (onError) {
        onError(error)
      }
    }
  })

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center space-x-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' :
          connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        }`}></div>
        <span className="text-gray-600">
          {connectionStatus === 'connected' ? 'Connected' :
           connectionStatus === 'connecting' ? 'Connecting...' :
           'Disconnected'}
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Processing: Row {stats.current} of {stats.total}
          </span>
          <span className="text-sm font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
          <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total Rows</div>
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

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700">Activity Feed</h4>
        </div>
        <div className="max-h-48 overflow-y-auto p-3 space-y-2">
          {activities.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Waiting for updates...</p>
          ) : (
            activities.slice().reverse().map((activity, index) => (
              <div key={`${activity.row}-${activity.timestamp}`} className="flex items-start space-x-2 text-sm">
                <span className={activity.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                  {activity.status === 'success' ? '✓' : '✗'}
                </span>
                <span className="text-gray-700 flex-1">{activity.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Error Summary */}
      {errors.length > 0 && (
        <div className="bg-red-50 rounded-lg border border-red-200">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="w-full px-4 py-2 flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-red-900">
              Failed Rows ({errors.length})
            </span>
            <svg 
              className={`w-4 h-4 text-red-900 transition-transform ${showErrors ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showErrors && (
            <div className="px-4 pb-3 max-h-40 overflow-y-auto">
              <ul className="text-xs text-red-800 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>Row {error.row}: {error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
