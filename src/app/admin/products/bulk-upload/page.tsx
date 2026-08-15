"use client"

import { useRouter } from 'next/navigation'
import OptimizedBulkUpload from '@/components/OptimizedBulkUpload'

export default function BulkUploadPage() {
  const router = useRouter()

  const handleUploadComplete = () => {
    setTimeout(() => {
      router.push('/admin/products')
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-teal-50/30 to-white rounded-2xl p-6 border border-gray-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">Bulk Product Upload</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Upload multiple products at once using Excel files</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="btn btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Optimized Bulk Upload Component */}
      <OptimizedBulkUpload onUploadComplete={handleUploadComplete} />
    </div>
  )
}