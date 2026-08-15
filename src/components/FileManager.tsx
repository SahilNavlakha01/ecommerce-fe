"use client"

import { useState, useEffect } from 'react'
import { GetUploadedFiles, DownloadUploadedFile } from '@/Services/GetService'
import { DeleteUploadedFile } from '@/Services/PostService'
import { successToast, errorToast } from '@/utils/toast'

interface UploadedFile {
  id: number
  fileName: string
  originalFileName: string
  fileSize: number
  uploadedAt: string
  status: string
  totalRows: number
  successRows: number
  failedRows: number
  linkedProducts: number
  uploaderName: string
}

export default function FileManager() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await GetUploadedFiles()
      if (response?.data?.success) {
        setFiles(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
      errorToast('Failed to load uploaded files')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await DownloadUploadedFile(fileId)
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      successToast('File downloaded successfully')
    } catch (error) {
      console.error('Error downloading file:', error)
      errorToast('Failed to download file')
    }
  }

  const handleDelete = async (fileId: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}" and all associated products? This cannot be undone.`)) {
      return
    }

    try {
      const response = await DeleteUploadedFile(fileId)
      if (response?.data?.success) {
        successToast(response.data.message)
        fetchFiles() // Refresh list
      }
    } catch (error: any) {
      console.error('Error deleting file:', error)
      errorToast(error?.response?.data?.message || 'Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
        <p className="text-sm text-gray-600 mt-1">Manage your bulk upload files and associated products</p>
      </div>

      {files.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Files Uploaded</h4>
          <p className="text-gray-600">Upload your first Excel file to see it here</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {files.map((file) => (
            <div key={file.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex-shrink-0">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{file.originalFileName}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)} • Uploaded {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status)}`}>
                      {file.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Rows:</span>
                      <span className="ml-1 font-medium">{file.totalRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success:</span>
                      <span className="ml-1 font-medium text-green-600">{file.successRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span>
                      <span className="ml-1 font-medium text-red-600">{file.failedRows}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Products:</span>
                      <span className="ml-1 font-medium">{file.linkedProducts}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDownload(file.id, file.originalFileName)}
                    className="text-teal-600 hover:text-teal-700 p-2 rounded-lg hover:bg-teal-50 transition-colors"
                    title="Download File"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.originalFileName)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete File & Products"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}