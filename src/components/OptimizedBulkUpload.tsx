"use client"

import { useState, useRef, useMemo } from 'react'
import { BulkUploadProducts } from '@/Services/PostService'
import { DownloadBulkTemplate } from '@/Services/GetService'
import { successToast, errorToast } from '@/utils/toast'
import { FormLoading } from '@/components/ui/FormLoading'
import ExcelTemplateDocs from './ExcelTemplateDocs'
import OptimizedProgress from './OptimizedProgress'

interface BulkUploadProps {
  onUploadComplete?: () => void
  onClose?: () => void
}

interface UploadStatus {
  fileLogId?: number
  totalRows?: number
  successRows?: number
  failedRows?: number
  errors?: string[]
  status?: string
}

type UploadStrategy = 'continue' | 'rollback'

export default function OptimizedBulkUpload({ onUploadComplete, onClose }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showDocs, setShowDocs] = useState(false)
  const [currentFileLogId, setCurrentFileLogId] = useState<number | null>(null)
  const [uploadStrategy, setUploadStrategy] = useState<UploadStrategy>('continue')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toastShownRef = useRef<boolean>(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
      }
    }
  }

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      errorToast('Please select a valid Excel file (.xlsx, .xls) or CSV file')
      return false
    }
    
    if (file.size > 10 * 1024 * 1024) {
      errorToast('File size must be less than 10MB')
      return false
    }
    
    return true
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await DownloadBulkTemplate()
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'bulk-products-template.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      successToast('Template downloaded successfully!')
    } catch (error) {
      console.error('Error downloading template:', error)
      errorToast('Failed to download template')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      errorToast('Please select a file to upload')
      return
    }

    setUploading(true)
    setUploadStatus(null)
    setCurrentFileLogId(null)
    toastShownRef.current = false

    try {
      const userData = document.cookie
        .split('; ')
        .find(row => row.startsWith('userData='))
        ?.split('=')[1]

      let createdBy = '2'
      if (userData) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(userData))
          createdBy = parsedData.id || '2'
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }

      const formData = new FormData()
      formData.append('excelFile', file)
      formData.append('createdBy', createdBy)
      formData.append('uploadStrategy', uploadStrategy)

      const response = await BulkUploadProducts(formData)
      
      if (response?.data?.success) {
        const responseData = response.data.data
        
        if (responseData?.fileLogId) {
          setCurrentFileLogId(responseData.fileLogId)
        } else {
          setUploadStatus(responseData || {})
          setUploading(false)
          successToast('Products uploaded successfully!')
          if (onUploadComplete) {
            onUploadComplete()
          }
        }
      } else {
        setUploading(false)
        errorToast(response?.data?.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      setUploading(false)
      errorToast(error?.response?.data?.message || error?.message || 'Upload failed')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus(null)
    setCurrentFileLogId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const fileInfo = useMemo(() => {
    if (!file) return null
    return {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2)
    }
  }, [file])

  return (
    <>
      <FormLoading show={uploading && !currentFileLogId} message="Uploading products..." />
      
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h2>
            <p className="text-gray-600 mt-1">Upload multiple products using Excel file</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the Excel template below</li>
            <li>Fill in your product data following the template format</li>
            <li>Upload the completed Excel file</li>
            <li>Review the upload results and fix any errors if needed</li>
          </ol>
        </div>

        {/* Upload Strategy Selection */}
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Upload Strategy</h3>
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="uploadStrategy"
                value="continue"
                checked={uploadStrategy === 'continue'}
                onChange={(e) => setUploadStrategy(e.target.value as UploadStrategy)}
                className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Continue on Error (Recommended)</div>
                <div className="text-sm text-gray-600">Adds successful products even if some rows fail. Shows detailed error report at the end.</div>
              </div>
            </label>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="uploadStrategy"
                value="rollback"
                checked={uploadStrategy === 'rollback'}
                onChange={(e) => setUploadStrategy(e.target.value as UploadStrategy)}
                className="mt-1 w-4 h-4 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">Rollback on Error (All or Nothing)</div>
                <div className="text-sm text-gray-600">If any row fails, no products are added. Ensures data consistency.</div>
              </div>
            </label>
          </div>
        </div>

        {/* Download Template */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Excel Template</span>
          </button>
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showDocs ? 'Hide' : 'Show'} Field Documentation</span>
          </button>
        </div>

        {/* Documentation */}
        {showDocs && (
          <div className="mb-6">
            <ExcelTemplateDocs />
          </div>
        )}

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-teal-400 bg-teal-50'
              : file
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">{fileInfo?.name}</p>
                <p className="text-sm text-gray-500">{fileInfo?.size} MB</p>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Upload Products
                </button>
                <button
                  onClick={resetUpload}
                  disabled={uploading}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Remove File
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Drop your Excel file here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Choose File
              </button>
              <p className="text-xs text-gray-400">Supports .xlsx, .xls, .csv files up to 10MB</p>
            </div>
          )}
        </div>

        {/* Real-time Progress */}
        {currentFileLogId && uploading && (
          <div className="mt-6">
            <OptimizedProgress 
              fileLogId={currentFileLogId}
              onComplete={(status) => {
                setUploadStatus(status)
                setUploading(false)
                if (!toastShownRef.current) {
                  toastShownRef.current = true
                  if (status.status === 'completed') {
                    successToast(`Upload completed! ${status.successRows} products uploaded successfully`)
                  } else if (status.status === 'failed') {
                    errorToast('Upload failed. Please check the errors below.')
                  }
                }
                if (onUploadComplete) {
                  onUploadComplete()
                }
              }}
              onError={(error) => {
                console.error('Polling error:', error)
              }}
            />
          </div>
        )}

        {/* Final Results */}
        {uploadStatus && !uploading && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Upload Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{uploadStatus.totalRows || 0}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{uploadStatus.successRows || 0}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{uploadStatus.failedRows || 0}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
            
            {uploadStatus.errors && uploadStatus.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Errors:</h4>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="text-sm text-red-800 space-y-1">
                    {uploadStatus.errors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
