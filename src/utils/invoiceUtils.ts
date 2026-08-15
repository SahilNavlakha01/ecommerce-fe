import { BASE_URL } from '@/Constant/Api'
import { toast } from 'sonner'

/**
 * Download invoice by invoice number
 * @param invoiceNumber - The invoice number (e.g., "INV-1234567890")
 * @returns Promise<void>
 */
export const downloadInvoiceByNumber = async (invoiceNumber: string): Promise<void> => {
  if (!invoiceNumber) {
    toast.error('Invoice number is required')
    return
  }

  try {
    const response = await fetch(`${BASE_URL}bills/invoice/${invoiceNumber}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }

    const result = await response.json()
    
    if (result.status === 200 && result.data?.pdfBase64) {
      // Create data URL from base64
      const pdfUrl = `data:${result.data.mimeType};base64,${result.data.pdfBase64}`
      
      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${result.data.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Invoice downloaded successfully')
    } else {
      throw new Error(result.message || 'Invalid invoice data')
    }
  } catch (error) {
    console.error('Invoice download error:', error)
    toast.error('Failed to download invoice')
    throw error
  }
}

/**
 * Download invoice by order ID
 * @param orderId - The order ID
 * @returns Promise<void>
 */
export const downloadInvoiceByOrderId = async (orderId: string | number): Promise<void> => {
  if (!orderId) {
    toast.error('Order ID is required')
    return
  }

  try {
    const response = await fetch(`${BASE_URL}bills/invoice/order/${orderId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }

    const result = await response.json()
    
    if (result.status === 200 && result.data?.pdfBase64) {
      // Create data URL from base64
      const pdfUrl = `data:${result.data.mimeType};base64,${result.data.pdfBase64}`
      
      // Create download link
      const link = document.createElement('a')
      link.href = pdfUrl
      link.download = `${result.data.invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Invoice downloaded successfully')
    } else {
      throw new Error(result.message || 'Invalid invoice data')
    }
  } catch (error) {
    console.error('Invoice download error:', error)
    toast.error('Failed to download invoice')
    throw error
  }
}

/**
 * View invoice in a new tab or iframe
 * @param invoiceNumber - The invoice number
 * @param targetElementId - Optional: ID of an iframe element to display the PDF
 * @returns Promise<string> - Returns the data URL of the PDF
 */
export const viewInvoice = async (
  invoiceNumber: string,
  targetElementId?: string
): Promise<string> => {
  if (!invoiceNumber) {
    toast.error('Invoice number is required')
    throw new Error('Invoice number is required')
  }

  try {
    const response = await fetch(`${BASE_URL}bills/invoice/${invoiceNumber}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }

    const result = await response.json()
    
    if (result.status === 200 && result.data?.pdfBase64) {
      // Create data URL from base64
      const pdfUrl = `data:${result.data.mimeType};base64,${result.data.pdfBase64}`
      
      // If target element ID is provided, set it as iframe source
      if (targetElementId) {
        const iframe = document.getElementById(targetElementId) as HTMLIFrameElement
        if (iframe) {
          iframe.src = pdfUrl
        }
      } else {
        // Open in new tab
        window.open(pdfUrl, '_blank')
      }
      
      return pdfUrl
    } else {
      throw new Error(result.message || 'Invalid invoice data')
    }
  } catch (error) {
    console.error('Invoice view error:', error)
    toast.error('Failed to view invoice')
    throw error
  }
}

/**
 * Get invoice data without downloading
 * @param invoiceNumber - The invoice number
 * @returns Promise with invoice data
 */
export const getInvoiceData = async (invoiceNumber: string) => {
  if (!invoiceNumber) {
    throw new Error('Invoice number is required')
  }

  try {
    const response = await fetch(`${BASE_URL}bills/invoice/${invoiceNumber}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }

    const result = await response.json()
    
    if (result.status === 200 && result.data) {
      return result.data
    } else {
      throw new Error(result.message || 'Invalid invoice data')
    }
  } catch (error) {
    console.error('Invoice fetch error:', error)
    throw error
  }
}
