/**
 * Invoice Download Examples
 * 
 * This file contains various examples of how to implement invoice download
 * functionality in different scenarios using Next.js
 */

"use client"

import { useState } from 'react'
import { downloadInvoiceByNumber, downloadInvoiceByOrderId, viewInvoice } from '@/utils/invoiceUtils'

// ============================================================================
// Example 1: Simple Download Button
// ============================================================================

export function SimpleDownloadButton({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <button 
      onClick={() => downloadInvoiceByNumber(invoiceNumber)}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
    >
      Download Invoice
    </button>
  )
}

// ============================================================================
// Example 2: Download Button with Loading State
// ============================================================================

export function DownloadButtonWithLoading({ invoiceNumber }: { invoiceNumber: string }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      await downloadInvoiceByNumber(invoiceNumber)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={loading}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Downloading...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Invoice
        </>
      )}
    </button>
  )
}

// ============================================================================
// Example 3: Download with Fallback (Invoice Number or Order ID)
// ============================================================================

export function DownloadWithFallback({ 
  invoiceNumber, 
  orderId 
}: { 
  invoiceNumber?: string
  orderId?: string | number 
}) {
  const handleDownload = async () => {
    try {
      if (invoiceNumber) {
        await downloadInvoiceByNumber(invoiceNumber)
      } else if (orderId) {
        await downloadInvoiceByOrderId(orderId)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <button 
      onClick={handleDownload}
      disabled={!invoiceNumber && !orderId}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
    >
      Download Invoice
    </button>
  )
}

// ============================================================================
// Example 4: Invoice Preview Modal
// ============================================================================

export function InvoicePreviewModal({ 
  invoiceNumber,
  isOpen,
  onClose 
}: { 
  invoiceNumber: string
  isOpen: boolean
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const loadInvoice = async () => {
    setLoading(true)
    try {
      await viewInvoice(invoiceNumber, 'invoicePreviewIframe')
    } catch (error) {
      console.error('Failed to load invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-teal-600 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-gray-600">Loading invoice...</p>
              </div>
            </div>
          ) : (
            <iframe 
              id="invoicePreviewIframe"
              className="w-full h-full border border-gray-200 rounded-lg"
              title="Invoice Preview"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={loadInvoice}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Load Invoice
          </button>
          <button
            onClick={() => downloadInvoiceByNumber(invoiceNumber)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Example 5: Table Row Action
// ============================================================================

export function OrderTableRow({ order }: { order: any }) {
  return (
    <tr>
      <td>{order.invoiceNumber}</td>
      <td>{order.customerName}</td>
      <td>₹{order.amount}</td>
      <td>
        <button
          onClick={() => downloadInvoiceByNumber(order.invoiceNumber)}
          className="text-blue-600 hover:text-blue-900"
          title="Download Invoice"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

// ============================================================================
// Example 6: Manual Fetch Implementation
// ============================================================================

export function ManualFetchExample({ invoiceNumber }: { invoiceNumber: string }) {
  const [loading, setLoading] = useState(false)

  const handleManualDownload = async () => {
    setLoading(true)
    try {
      // Fetch the invoice
      const response = await fetch(`/api/bills/invoice/${invoiceNumber}`)
      const { data } = await response.json()

      // Create data URL from base64
      const pdfUrl = `data:${data.mimeType};base64,${data.pdfBase64}`
      
      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${data.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleManualDownload}
      disabled={loading}
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
    >
      {loading ? 'Downloading...' : 'Download (Manual)'}
    </button>
  )
}

// ============================================================================
// Example 7: Dropdown Menu with Multiple Actions
// ============================================================================

export function InvoiceActionsDropdown({ 
  invoiceNumber,
  orderId 
}: { 
  invoiceNumber: string
  orderId: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        Actions ▼
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <button
            onClick={() => {
              downloadInvoiceByNumber(invoiceNumber)
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice
          </button>
          
          <button
            onClick={() => {
              viewInvoice(invoiceNumber)
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Invoice
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Example 8: Bulk Download Multiple Invoices
// ============================================================================

export function BulkInvoiceDownload({ invoiceNumbers }: { invoiceNumbers: string[] }) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleBulkDownload = async () => {
    setDownloading(true)
    setProgress(0)

    for (let i = 0; i < invoiceNumbers.length; i++) {
      try {
        await downloadInvoiceByNumber(invoiceNumbers[i])
        setProgress(((i + 1) / invoiceNumbers.length) * 100)
        
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to download ${invoiceNumbers[i]}:`, error)
      }
    }

    setDownloading(false)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleBulkDownload}
        disabled={downloading}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
      >
        {downloading ? `Downloading... ${Math.round(progress)}%` : `Download All (${invoiceNumbers.length})`}
      </button>
      
      {downloading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
