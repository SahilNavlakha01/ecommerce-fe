"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BulkUpload from '@/components/BulkUpload'
import FileManager from '@/components/FileManager'

export default function BulkManagementPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('upload')

  const handleUploadComplete = () => {
    // Switch to file manager tab after upload
    setActiveTab('files')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white via-teal-50/30 to-white rounded-2xl p-6 border border-gray-200 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-heading">Bulk Product Management</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Upload Excel files and manage bulk product imports</p>
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'upload'
                ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Files</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'files'
                ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Manage Files</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'upload' ? (
          <BulkUpload onUploadComplete={handleUploadComplete} />
        ) : (
          <FileManager />
        )}
      </div>
    </div>
  )
}