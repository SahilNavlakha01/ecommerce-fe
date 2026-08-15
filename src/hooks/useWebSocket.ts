import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckUploadStatus } from '@/Services/GetService'

interface ProgressData {
  rowNumber: number
  status: 'success' | 'error'
  message: string
  totalRows: number
  successRows: number
  failedRows: number
  progressPercentage: number
}

interface CompleteData {
  status: 'completed' | 'failed'
  message: string
  totalRows: number
  successRows: number
  failedRows: number
  errors?: string[]
}

interface UsePollingOptions {
  onProgress?: (data: ProgressData) => void
  onComplete?: (data: CompleteData) => void
  onError?: (error: any) => void
}

export function useWebSocket(fileLogId: number | null, options: UsePollingOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastProgressRef = useRef<number>(0)
  const hasCompletedRef = useRef<boolean>(false)

  const pollStatus = useCallback(async () => {
    if (!fileLogId) return

    try {
      const response = await CheckUploadStatus(fileLogId)
      
      if (response?.data?.success) {
        const data = response.data.data
        
        if (data.status === 'processing') {
          setConnectionStatus('connected')
          setIsConnected(true)
          
          const progress = Math.round((data.processedRows / data.totalRows) * 100)
          
          if (options.onProgress) {
            options.onProgress({
              rowNumber: data.processedRows,
              status: 'success',
              message: `Processing row ${data.processedRows} of ${data.totalRows}`,
              totalRows: data.totalRows,
              successRows: data.successRows,
              failedRows: data.failedRows,
              progressPercentage: progress
            })
          }
        } else if (data.status === 'completed' || data.status === 'failed') {
          setIsConnected(false)
          setConnectionStatus('disconnected')
          
          if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
          }
          
          if (options.onComplete && !hasCompletedRef.current) {
            hasCompletedRef.current = true
            options.onComplete({
              status: data.status,
              message: data.message || 'Upload completed',
              totalRows: data.totalRows,
              successRows: data.successRows,
              failedRows: data.failedRows,
              errors: data.errors
            })
          }
        }
      }
    } catch (error) {
      console.error('Polling error:', error)
      if (options.onError) {
        options.onError(error)
      }
    }
  }, [fileLogId, options])

  const disconnect = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
    hasCompletedRef.current = false
  }, [])

  useEffect(() => {
    if (fileLogId) {
      hasCompletedRef.current = false
      setConnectionStatus('connecting')
      pollStatus()
      pollingRef.current = setInterval(pollStatus, 2000)
    }

    return () => {
      disconnect()
    }
  }, [fileLogId, pollStatus, disconnect])

  return {
    isConnected,
    connectionStatus,
    disconnect
  }
}
