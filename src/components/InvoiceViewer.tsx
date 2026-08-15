"use client"

import { useState } from 'react'
import { downloadInvoiceByNumber, downloadInvoiceByOrderId, viewInvoice } from '@/utils/invoiceUtils'

interface InvoiceViewerProps {
  invoiceNumber?: string
  orderId?: string | number
  showPreview?: boolean
}

/**
 * Invoice Viewer Component
 * Demonstrates different ways to handle invoice display and download
 */
export default function InvoiceViewer({ 
  invoiceNumber, 
  orderId,
  showPreview = false 
}: InvoiceViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Method 1: Download invoice directly
  const handleDownload = async () => {
    setLoading(true)
    try {
      if (invoiceNumber) {
        await downloadInvoiceByNumber(invoiceNumber)
      } else if (orderId) {
        await downloadInvoiceByOrderId(orderId)
      }
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Method 2: View in iframe
  const handleViewInIframe = async () => {
    if (!invoiceNumber) return
    
    setLoading(true)
    try {
      const url = await viewInvoice(invoiceNumber, 'pdfViewer')
      setPdfUrl(url)
    } catch (error) {
      console.error('View failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Method 3: Open in new tab
  const handleViewInNewTab = async () => {
    if (!invoiceNumber) return
    
    setLoading(true)
    try {
      await viewInvoice(invoiceNumber)
    } catch (error) {
      console.error('View failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Method 4: Manual fetch and display
  const handleManualFetch = async () => {
    if (!invoiceNumber) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/bills/invoice/${invoiceNumber}`)
      const { data } = await response.json()
      
      // Display in iframe
      const pdfUrl = `data:${data.mimeType};base64,${data.pdfBase64}`
      const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement
      if (iframe) {
        iframe.src = pdfUrl
      }
      setPdfUrl(pdfUrl)
    } catch (error) {
      console.error('Fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Method 5: Download with custom link
  const handleCustomDownload = async () => {
    if (!invoiceNumber) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/bills/invoice/${invoiceNumber}`)
      const { data } = await response.json()
      
      const pdfUrl = `data:${data.mimeType};base64,${data.pdfBase64}`
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${data.invoiceNumber}.pdf`
      link.click()
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          disabled={loading || (!invoiceNumber && !orderId)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {loading ? 'Loading...' : 'Download Invoice'}
        </button>

        {invoiceNumber && (
          <>
            <button
              onClick={handleViewInIframe}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              View in Iframe
            </button>

            <button
              onClick={handleViewInNewTab}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              Open in New Tab
            </button>
          </>
        )}
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Invoice Preview</h3>
          </div>
          <iframe
            id="pdfViewer"
            className="w-full h-[600px]"
            title="Invoice Preview"
          />
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Usage Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {invoiceNumber && <p>Invoice Number: <span className="font-mono font-semibold">{invoiceNumber}</span></p>}
          {orderId && <p>Order ID: <span className="font-mono font-semibold">{orderId}</span></p>}
        </div>
      </div>
    </div>
  )
}
