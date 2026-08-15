"use client"

import { useState } from 'react'
import BulkUpload from './BulkUpload'
import Portal from './ui/Portal'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: () => void
}

export default function BulkUploadModal({ isOpen, onClose, onUploadComplete }: BulkUploadModalProps) {
  if (!isOpen) return null

  const handleUploadComplete = () => {
    onClose()
    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-y-auto">
        <BulkUpload onUploadComplete={handleUploadComplete} onClose={onClose} />
      </div>
      </div>
    </Portal>
  )
}