"use client"

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { GetAllOrders, GetOrdersExport } from '@/Services/GetService'
import { errorToast } from '@/utils/toast'
import { formatDate } from '@/utils/dateFormat'
import { OrdersLoading } from '@/components/ui/AdminLoading'
import { AdminStatsCard } from '@/components/ui/AdminStatsCard'
import { SearchAndFilter } from '@/components/ui/SearchAndFilter'
import { AdminTable } from '@/components/ui/AdminTable'
import { Pagination } from '@/components/ui/Pagination'
import { exportToCSV, exportToExcel, printTable, filterData, sortData, paginateData } from '@/utils/exportUtils'
import { downloadInvoiceByNumber, downloadInvoiceByOrderId } from '@/utils/invoiceUtils'
import { toast } from 'sonner'
import Modal from '@/components/ui/Modal'
import { UpdateOrderStatus } from '@/Services/PostService'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [exportPeriod, setExportPeriod] = useState('monthly')
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [imagePreviewMounted, setImagePreviewMounted] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    setImagePreviewMounted(true)
  }, [])

  useEffect(() => {
    if (!selectedImage) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [selectedImage])

  const fetchOrders = async () => {
    try {
      const response = await GetAllOrders()
      if (response?.data && response.data.data && response.data.data.length > 0) {
        setOrders(response.data.data)
      } else {
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      errorToast((error as any).response?.data?.statusMessage || (error as any).message || 'Error loading orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders

    // Apply search filter
    if (searchTerm) {
      filtered = filterData(filtered, searchTerm, ['invoiceNumber', 'userName', 'orderId'])
    }

    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const status = typeof order.paymentStatus === 'string' ? order.paymentStatus.toLowerCase() : order.paymentStatus;
        if (paymentStatusFilter === 'paid') return status === 1 || status === 'paid'
        if (paymentStatusFilter === 'pending') return status === 0 || status === 'pending'
        if (paymentStatusFilter === 'fail') return status === 'fail' || status === 'failed'
        if (paymentStatusFilter === 'refunded') return status === 'refunded'
        return true
      })
    }

    // Apply delivery status filter
    if (deliveryStatusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const deliveryStatus = typeof order.deliveryStatus === 'string' ? order.deliveryStatus.toLowerCase() : order.deliveryStatus;
        if (deliveryStatusFilter === 'pending') return deliveryStatus === 'pending' || deliveryStatus === 'assigned'
        if (deliveryStatusFilter === 'processing') return deliveryStatus === 1 || deliveryStatus === 'processing'
        if (deliveryStatusFilter === 'shipped') return deliveryStatus === 2 || deliveryStatus === 'shipped' || deliveryStatus === 'shipping'
        if (deliveryStatusFilter === 'delivered') return deliveryStatus === 3 || deliveryStatus === 'delivered'
        if (deliveryStatusFilter === 'cancelled') return deliveryStatus === 4 || deliveryStatus === 'cancelled'
        return true
      })
    }

    // Apply sorting
    if (sortKey) {
      filtered = sortData(filtered, sortKey, sortDirection)
    }

    return filtered
  }, [orders, searchTerm, paymentStatusFilter, deliveryStatusFilter, sortKey, sortDirection])

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    return paginateData(filteredAndSortedOrders, currentPage, itemsPerPage)
  }, [filteredAndSortedOrders, currentPage, itemsPerPage])

  const DELIVERY_STATUSES = ['Pending', 'Assigned', 'Ready For Ship', 'Shipping', 'Out For Delivery', 'Delivered', 'Cancelled']

  const updateDeliveryStatus = async (orderId: any, newStatus: string) => {
    try {
      await UpdateOrderStatus(orderId, { deliveryStatus: newStatus })
      setOrders(orders.map((order: any) =>
        order.orderId === orderId ? { ...order, deliveryStatus: newStatus } : order
      ))
      toast.success(`Delivery status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update delivery status')
    }
  }

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const openImagePreview = (src: string, alt: string) => {
    if (!src) return
    setSelectedImage({ src, alt })
  }

  const getStatusColor = (paymentStatus: any) => {
    const status = typeof paymentStatus === 'string' ? paymentStatus.toLowerCase() : paymentStatus;
    switch (status) {
      case 1:
      case 'paid': return 'bg-green-100 text-green-700'
      case 0:
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'fail': 
      case 'failed': return 'bg-red-100 text-red-700'
      case 'refunded': return 'bg-blue-100 text-blue-700'
      case 'b2b customer': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (paymentStatus: any) => {
    if (typeof paymentStatus === 'string') return paymentStatus;
    return paymentStatus === 1 ? 'Paid' : 'Pending'
  }

  const getPaymentMethodText = (paymentMethod: any) => {
    if (typeof paymentMethod === 'string') return paymentMethod;
    switch (paymentMethod) {
      case 1: return 'Credit Card'
      case 2: return 'Debit Card'
      case 3: return 'UPI'
      case 4: return 'Net Banking'
      case 5: return 'Cash on Delivery'
      default: return 'Unknown'
    }
  }

  const getDeliveryStatusColor = (deliveryStatus: any) => {
    const status = typeof deliveryStatus === 'string' ? deliveryStatus.toLowerCase() : deliveryStatus;
    if (String(status).includes('delivered') || status === 4) return 'bg-green-100 text-green-700'
    if (String(status).includes('cancel')) return 'bg-red-100 text-red-700'
    if (String(status).includes('out for delivery')) return 'bg-orange-100 text-orange-700'
    if (String(status).includes('shipping') || String(status).includes('shipped') || String(status).includes('in transit')) return 'bg-purple-100 text-purple-700'
    if (String(status).includes('assigned')) return 'bg-blue-100 text-blue-700'
    if (String(status).includes('ready for ship')) return 'bg-cyan-100 text-cyan-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const isCODConfirmed = (order: any) =>
    order.isCOD === 1 && String(order.paymentStatus).toLowerCase() === 'confirmed'
  const getDeliveryStatusText = (deliveryStatus: any) => {
    const status = typeof deliveryStatus === 'string' ? deliveryStatus.trim() : '';
    if (status) return status;
    switch (deliveryStatus) {
      case 1: return 'Processing'
      case 2: return 'Assigned'
      case 3: return 'Shipping'
      case 4: return 'Delivered'
      case 5: return 'Cancelled'
      default: return 'Processing'
    }
  }

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const prepareExportData = () => {
    return filteredAndSortedOrders.map(order => ({
      'Order ID': order.orderId,
      'Invoice Number': order.invoiceNumber,
      'Customer Name': order.userName,
      'Customer ID': order.userId,
      'Total Amount': order.totalAmount,
      'Discount': order.discount || 0,
      'Coupon Code': order.couponCode || '',
      'Final Amount': order.finalAmount,
      'Payment Status': getStatusText(order.paymentStatus),
      'Payment Method': getPaymentMethodText(order.paymentMethod),
      'Delivery Status': getDeliveryStatusText(order.deliveryStatus),
      'Order Date': formatDate(order.createdAt),
      'Items': (order.items || []).map((i: any) => `${i.productName} [SKU:${i.skuCode || 'N/A'}] x${i.quantity}${i.isGifted ? ' 🎁' : ''}`).join('; '),
      'Gifting': parseFloat(order.giftingCharges) > 0 ? `Yes (₹${order.giftingCharges})` : 'No',
      'Delivery Address': order.addressLine1 || 'N/A'
    }))
  }

  const handleExport = () => {
    const exportData = prepareExportData()
    exportToCSV(exportData, 'orders')
  }

  const handleExportExcel = () => {
    const exportData = prepareExportData()
    exportToExcel(exportData, 'orders')
  }

  const handlePrint = () => {
    const printData = filteredAndSortedOrders.map(order => ({
      invoice: order.invoiceNumber,
      customer: order.userName,
      amount: `₹${(parseFloat(order.finalAmount) || 0).toLocaleString('en-IN')}`,
      payment: getStatusText(order.paymentStatus),
      delivery: getDeliveryStatusText(order.deliveryStatus),
      date: formatDate(order.createdAt)
    }))
    
    printTable(printData, 'Orders Report')
  }

  const handlePeriodExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportLoading(true)
    try {
      const params: any = { period: exportPeriod }
      if (exportPeriod === 'custom') {
        if (!exportStartDate || !exportEndDate) {
          toast.error('Please select start and end dates')
          setExportLoading(false)
          return
        }
        params.startDate = exportStartDate
        params.endDate = exportEndDate
      }

      const response = await GetOrdersExport(params)
      const { orders: exportOrders, startDate, endDate } = response.data.data
      const filename = `orders-${startDate}-to-${endDate}`

      if (format === 'pdf') {
        generateOrdersPDF(exportOrders, startDate, endDate, filename)
      } else {
        const data = exportOrders.map((order: any) => {
          const gst = parseFloat(order.gstAmount) || 0
          return {
            'Date': formatDate(order.createdAt),
            'Invoice No': order.invoiceNumber,
            'Customer': order.userName || '',
            'Products': Number(order.itemCount) || 0,
            'Qty': Number(order.totalQty) || 0,
            'Net Amt (Rs)': parseFloat(order.totalAmount) || 0,
            'Discount (Rs)': parseFloat(order.discount) || 0,
            'CGST (Rs)': parseFloat((gst / 2).toFixed(2)),
            'SGST (Rs)': parseFloat((gst / 2).toFixed(2)),
            'Total Tax (Rs)': parseFloat(gst.toFixed(2)),
            'Gross Amt (Rs)': parseFloat(order.finalAmount) || 0,
            'Gifting (Rs)': parseFloat(order.giftingCharges) || 0,
            'Delivery Charge (Rs)': parseFloat(order.shippingAmount) || 0,
          }
        })
        if (format === 'csv') exportToCSV(data, filename)
        else exportToExcel(data, filename)
      }
      toast.success(`Exported ${exportOrders.length} orders`)
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const generateOrdersPDF = (exportOrders: any[], startDate: string, endDate: string, filename: string) => {
    const fmtAmt = (v: any) => (parseFloat(v) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Group individual orders by date
    const dateMap = new Map<string, { displayDate: string; orders: any[] }>()
    exportOrders.forEach((o: any) => {
      const dateKey = new Date(o.createdAt).toISOString().slice(0, 10)
      if (!dateMap.has(dateKey)) dateMap.set(dateKey, { displayDate: formatDate(o.createdAt), orders: [] })
      dateMap.get(dateKey)!.orders.push(o)
    })
    const groupedDates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    const totalNet = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.totalAmount) || 0), 0)
    const totalDiscount = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.discount) || 0), 0)
    const totalService = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.shippingAmount) || 0), 0)
    const totalGST = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.gstAmount) || 0), 0)
    const totalGross = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.finalAmount) || 0), 0)
    const totalGifting = exportOrders.reduce((s: number, o: any) => s + (parseFloat(o.giftingCharges) || 0), 0)
    const totalItems = exportOrders.reduce((s: number, o: any) => s + (Number(o.itemCount) || 0), 0)
    const totalQty = exportOrders.reduce((s: number, o: any) => s + (Number(o.totalQty) || 0), 0)

    const rows: string[] = []
    rows.push(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Orders Report</title><style>
      @page{size:A4 landscape;margin:12mm 10mm}
      *{box-sizing:border-box}
      body{font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#1a1a1a;margin:0;padding:0}
      .header{background:#0d9488;color:#fff;padding:10px 14px;border-radius:6px 6px 0 0;display:flex;justify-content:space-between;align-items:center}
      .header h2{margin:0;font-size:15px;letter-spacing:.5px}
      .header .meta{font-size:8.5px;opacity:.9;text-align:right}
      .summary{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px;background:#f0fdfa;border:1px solid #99f6e4;border-top:none;margin-bottom:4px}
      .summary-item{background:#fff;border:1px solid #ccfbf1;border-radius:4px;padding:5px 10px;min-width:100px}
      .summary-item .lbl{font-size:7.5px;color:#6b7280;text-transform:uppercase;letter-spacing:.4px}
      .summary-item .val{font-size:11px;font-weight:700;color:#0d9488;margin-top:1px}
      .summary-item.rev .val{color:#1d4ed8}
      table{width:100%;border-collapse:collapse;table-layout:fixed}
      thead{display:table-header-group}
      thead tr{background:#0d9488}
      thead th{color:#fff;padding:6px 5px;text-align:left;font-size:8px;font-weight:700;letter-spacing:.3px;white-space:nowrap;overflow:hidden}
      tbody tr:nth-child(even){background:#f8fffe}
      tbody td{padding:5px;border-bottom:1px solid #e5e7eb;font-size:8.5px;vertical-align:middle;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .subtotal-row td{background:#e6faf8;border-top:1px solid #99f6e4;border-bottom:2px solid #99f6e4;color:#0d9488}
      .totals-wrap{page-break-inside:avoid}
      .totals-row td{padding:6px 5px;font-size:8.5px;font-weight:700;background:#f0fdfa;border-top:2px solid #0d9488}
      .num{text-align:right}
      .green{color:#16a34a;font-weight:600}
      .amber{color:#d97706;font-weight:600}
      .bold{font-weight:700}
      .footer{margin-top:8px;text-align:center;font-size:7.5px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:5px;page-break-inside:avoid}
      col.c-date{width:7%} col.c-inv{width:11%} col.c-cust{width:10%} col.c-items{width:4%} col.c-qty{width:4%}
      col.c-net{width:9%} col.c-disc{width:8%} col.c-svc{width:9%}
      col.c-cgst{width:7%} col.c-sgst{width:7%} col.c-tax{width:7%}
      col.c-gross{width:9%} col.c-gift{width:8%}
    </style></head><body>
    <div class="header">
      <div><h2>EEAS LIFESTYLE &mdash; Orders Report</h2><div style="font-size:8.5px;margin-top:3px;opacity:.85">Generated: ${new Date().toLocaleString('en-IN')}</div></div>
      <div class="meta">Period: <strong>${startDate}</strong> to <strong>${endDate}</strong><br/>Days: <strong>${groupedDates.length}</strong> &nbsp;|&nbsp; Orders: <strong>${exportOrders.length}</strong></div>
    </div>
    <div class="summary">
      <div class="summary-item"><div class="lbl">Net Amount</div><div class="val">Rs.${fmtAmt(totalNet)}</div></div>
      <div class="summary-item"><div class="lbl">Discount</div><div class="val green">-Rs.${fmtAmt(totalDiscount)}</div></div>
      <div class="summary-item"><div class="lbl">Delivery Charge</div><div class="val">Rs.${fmtAmt(totalService)}</div></div>
      <div class="summary-item"><div class="lbl">CGST</div><div class="val">Rs.${fmtAmt(totalGST / 2)}</div></div>
      <div class="summary-item"><div class="lbl">SGST</div><div class="val">Rs.${fmtAmt(totalGST / 2)}</div></div>
      <div class="summary-item"><div class="lbl">Total Tax</div><div class="val">Rs.${fmtAmt(totalGST)}</div></div>
      <div class="summary-item"><div class="lbl">Gifting</div><div class="val amber">Rs.${fmtAmt(totalGifting)}</div></div>
      <div class="summary-item rev"><div class="lbl">Gross Amount</div><div class="val">Rs.${fmtAmt(totalGross)}</div></div>
    </div>
    <table>
      <colgroup><col class="c-date"><col class="c-inv"><col class="c-cust"><col class="c-items"><col class="c-qty"><col class="c-net"><col class="c-disc"><col class="c-cgst"><col class="c-sgst"><col class="c-tax"><col class="c-gross"><col class="c-gift"><col class="c-svc"></colgroup>
      <thead><tr>
        <th>Date</th><th>Invoice No.</th><th>Customer</th><th style="text-align:center">Products</th><th style="text-align:center">Qty</th>
        <th class="num">Net Amt</th><th class="num">Discount</th>
        <th class="num">CGST</th><th class="num">SGST</th><th class="num">Total Tax</th>
        <th class="num">Gross Amt</th><th class="num">Gifting</th><th class="num">Delivery Chg</th>
      </tr></thead>
      <tbody>`)

    groupedDates.forEach(([, group]) => {
      group.orders.forEach((o: any, idx: number) => {
        const gst = parseFloat(o.gstAmount) || 0
        const cgst = gst / 2
        const giftAmt = parseFloat(o.giftingCharges) || 0
        const discAmt = parseFloat(o.discount) || 0
        rows.push(`<tr>
          <td>${idx === 0 ? `<strong>${group.displayDate}</strong>` : ''}</td>
          <td title="${o.invoiceNumber}" style="padding-left:10px">${o.invoiceNumber}</td>
          <td>${o.userName || ''}</td>
          <td style="text-align:center">${o.itemCount || 0}</td>
          <td style="text-align:center">${o.totalQty || 0}</td>
          <td class="num">${fmtAmt(o.totalAmount)}</td>
          <td class="num">${discAmt > 0 ? `<span class="green">-${fmtAmt(discAmt)}</span>` : '—'}</td>
          <td class="num">${fmtAmt(cgst)}</td>
          <td class="num">${fmtAmt(cgst)}</td>
          <td class="num">${fmtAmt(gst)}</td>
          <td class="num bold">${fmtAmt(o.finalAmount)}</td>
          <td class="num">${giftAmt > 0 ? `<span class="amber">${fmtAmt(giftAmt)}</span>` : '—'}</td>
          <td class="num">${fmtAmt(o.shippingAmount)}</td>
        </tr>`)
      })
      // Date subtotal row
      const ds = group.orders.reduce((acc: any, o: any) => {
        acc.net += parseFloat(o.totalAmount) || 0
        acc.disc += parseFloat(o.discount) || 0
        acc.svc += parseFloat(o.shippingAmount) || 0
        acc.gst += parseFloat(o.gstAmount) || 0
        acc.gross += parseFloat(o.finalAmount) || 0
        acc.gift += parseFloat(o.giftingCharges) || 0
        acc.items += Number(o.itemCount) || 0
        acc.qty += Number(o.totalQty) || 0
        return acc
      }, { net: 0, disc: 0, svc: 0, gst: 0, gross: 0, gift: 0, items: 0, qty: 0 })
      rows.push(`<tr class="subtotal-row">
        <td></td>
        <td class="bold" style="font-size:7.5px">Subtotal (${group.orders.length} orders)</td>
        <td></td>
        <td style="text-align:center" class="bold">${ds.items}</td>
        <td style="text-align:center" class="bold">${ds.qty}</td>
        <td class="num bold">${fmtAmt(ds.net)}</td>
        <td class="num bold">${ds.disc > 0 ? `-${fmtAmt(ds.disc)}` : '—'}</td>
        <td class="num bold">${fmtAmt(ds.gst / 2)}</td>
        <td class="num bold">${fmtAmt(ds.gst / 2)}</td>
        <td class="num bold">${fmtAmt(ds.gst)}</td>
        <td class="num bold">${fmtAmt(ds.gross)}</td>
        <td class="num bold">${ds.gift > 0 ? fmtAmt(ds.gift) : '—'}</td>
        <td class="num bold">${fmtAmt(ds.svc)}</td>
      </tr>`)
    })

    rows.push(`</tbody></table>
    <div class="totals-wrap">
      <table style="margin-top:0">
        <colgroup><col class="c-date"><col class="c-inv"><col class="c-cust"><col class="c-items"><col class="c-qty"><col class="c-net"><col class="c-disc"><col class="c-cgst"><col class="c-sgst"><col class="c-tax"><col class="c-gross"><col class="c-gift"><col class="c-svc"></colgroup>
        <tbody><tr class="totals-row">
          <td class="bold">GRAND TOTAL</td>
          <td></td>
          <td></td>
          <td style="text-align:center" class="bold">${totalItems}</td>
          <td style="text-align:center" class="bold">${totalQty}</td>
          <td class="num">${fmtAmt(totalNet)}</td>
          <td class="num green">-${fmtAmt(totalDiscount)}</td>
          <td class="num">${fmtAmt(totalGST / 2)}</td>
          <td class="num">${fmtAmt(totalGST / 2)}</td>
          <td class="num">${fmtAmt(totalGST)}</td>
          <td class="num">${fmtAmt(totalGross)}</td>
          <td class="num amber">${fmtAmt(totalGifting)}</td>
          <td class="num">${fmtAmt(totalService)}</td>
          <td class="num">${fmtAmt(totalGST)}</td>
          <td class="num">${fmtAmt(totalGross)}</td>
          <td class="num amber">${fmtAmt(totalGifting)}</td>
        </tr></tbody>
      </table>
      <div class="footer">EEAS LIFESTYLE &bull; support@eeaslifestyle.com &bull; +91 63567 01295 &bull; This is a system-generated report.</div>
    </div>
    </body></html>`)

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(rows.join(''))
      win.document.close()
      win.focus()
      setTimeout(() => { win.print(); win.close() }, 600)
    }
  }

  const handleDownloadInvoice = async (order: any) => {
    if (!order?.invoiceNumber && !order?.orderId) {
      toast.error('Invoice not available')
      return
    }

    try {
      // Use invoice number if available, otherwise use order ID
      if (order?.invoiceNumber) {
        await downloadInvoiceByNumber(order.invoiceNumber)
      } else {
        await downloadInvoiceByOrderId(order.orderId)
      }
    } catch (error) {
      // Error handling is done in the utility function
      console.error('Invoice download failed:', error)
    }
  }

  // Table columns configuration
  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Order ID',
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <p className="font-medium text-gray-900">#{row.invoiceNumber}</p>
          <p className="text-sm text-gray-500">Order ID: {row.orderId}</p>
        </div>
      )
    },
    {
      key: 'userName',
      label: 'Customer',
      sortable: true,
      render: (value: any, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.userName}</p>
          <p className="text-sm text-gray-500">User ID: {row.userId}</p>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (value: any, row: any) => (
        <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
          {row.items?.length || 0} items
        </span>
      )
    },
    {
      key: 'finalAmount',
      label: 'Amount',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="text-sm text-gray-900">
          <div className="font-semibold">₹{(parseFloat(row.finalAmount) || 0).toLocaleString('en-IN')}</div>
          {row.discount > 0 && (
            <div className="text-xs text-gray-500">Discount: ₹{parseFloat(row.discount || 0).toLocaleString('en-IN')}</div>
          )}
          {isCODConfirmed(row) && parseFloat(row.codCharges) > 0 && (
            <div className="text-xs text-amber-600">Due at delivery: ₹{(parseFloat(row.finalAmount) - parseFloat(row.codCharges)).toLocaleString('en-IN')}</div>
          )}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value: any, row: any) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.paymentStatus)}`}>
          {getStatusText(row.paymentStatus)}
        </span>
      )
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery',
      sortable: true,
      render: (value: any, row: any) => (
        <select
          value={getDeliveryStatusText(row.deliveryStatus)}
          onChange={(e) => updateDeliveryStatus(row.orderId, e.target.value)}
          className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-teal-400 outline-none ${getDeliveryStatusColor(row.deliveryStatus)}`}
        >
          {DELIVERY_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => viewOrderDetails(row)}
            className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors"
            title="View Order Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button 
            onClick={() => handleDownloadInvoice(row)}
            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
            title="Download Invoice"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white to-teal-50/30 rounded-2xl p-6 border border-teal-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Orders Management</h1>
              <p className="text-gray-600 mt-1">Track and manage customer orders and transactions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <button
              onClick={() => setShowExportPanel(true)}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Report Modal */}
      <Modal
        isOpen={showExportPanel}
        onClose={() => setShowExportPanel(false)}
        title="Export Orders Report"
        size="md"
        footer={
          <button
            onClick={() => setShowExportPanel(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        }
      >
        <div className="space-y-5">
              {/* Period selector as pill tabs */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Period</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'monthly', label: 'Current Month' },
                    { value: 'weekly', label: 'Current Week' },
                    { value: 'yearly', label: 'Current Year' },
                    { value: 'custom', label: 'Custom Range' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setExportPeriod(opt.value)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                        exportPeriod === opt.value
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom date inputs */}
              {exportPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={e => setExportStartDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={e => setExportEndDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Export format buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Export Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handlePeriodExport('csv')}
                    disabled={exportLoading}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-bold text-green-700">CSV</span>
                  </button>
                  <button
                    onClick={() => handlePeriodExport('excel')}
                    disabled={exportLoading}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-blue-700">Excel</span>
                  </button>
                  <button
                    onClick={() => handlePeriodExport('pdf')}
                    disabled={exportLoading}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-red-700">{exportLoading ? '...' : 'PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
      </Modal>

      {loading ? (
        <OrdersLoading />
      ) : (
        <>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AdminStatsCard
              title="Total Orders"
              value={orders.length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Paid Orders"
              value={orders.filter((o: any) => {
                const status = typeof o.paymentStatus === 'string' ? o.paymentStatus.toLowerCase() : String(o.paymentStatus).toLowerCase();
                const isPaid = status === 'paid';
                const isUncollectedCOD = o.isCOD === 1 && parseFloat(o.codCharges || '0') > 0;
                return isPaid && !isUncollectedCOD;
              }).length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Pending Orders"
              value={orders.filter((o: any) => {
                const status = typeof o.paymentStatus === 'string' ? o.paymentStatus.toLowerCase() : o.paymentStatus;
                return status === 0 || status === 'pending';
              }).length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Total Revenue"
              value={`₹${orders.reduce((sum: number, o: any) => {
                const status = typeof o.paymentStatus === 'string' ? o.paymentStatus.toLowerCase() : String(o.paymentStatus).toLowerCase();
                const isPaid = status === 'paid';
                const isUncollectedCOD = o.isCOD === 1 && parseFloat(o.codCharges || '0') > 0;
                if (isPaid && !isUncollectedCOD) {
                  return sum + (parseFloat(o.finalAmount) || 0);
                }
                return sum;
              }, 0).toLocaleString('en-IN')}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
          </div>

          {/* Search and Filter */}
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search orders by invoice, customer, or order ID..."
            filters={[
              {
                key: 'payment',
                label: 'Payment Status',
                value: paymentStatusFilter,
                onChange: setPaymentStatusFilter,
                options: [
                  { value: 'all', label: 'All Payments' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'fail', label: 'Fail' },
                  { value: 'refunded', label: 'Refunded' }
                ]
              },
              {
                key: 'delivery',
                label: 'Delivery Status',
                value: deliveryStatusFilter,
                onChange: setDeliveryStatusFilter,
                options: [
                  { value: 'all', label: 'All Deliveries' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]
              }
            ]}
            // onExport={handleExport}
            // onExportExcel={handleExportExcel}
            // onPrint={handlePrint}
          />

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">There are no orders in the system yet.</p>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">No orders match your current search and filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setPaymentStatusFilter('all')
                  setDeliveryStatusFilter('all')
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Showing {paginatedOrders.data.length} of {filteredAndSortedOrders.length} orders</span>
                    <span>•</span>
                    <span>Total: {orders.length} orders</span>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <AdminTable
                columns={columns}
                data={paginatedOrders.data}
                loading={loading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedOrders.totalPages}
                totalItems={paginatedOrders.totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage)
                  setCurrentPage(1)
                }}
              />
            </>
          )}
        </>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={showModal && !!selectedOrder}
        onClose={() => setShowModal(false)}
        title={`Order #${selectedOrder?.invoiceNumber}`}
        size="xl"
        footer={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => handleDownloadInvoice(selectedOrder)}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Invoice
            </button>
          </>
        }
      >
        {selectedOrder && (
        <div className="space-y-5">

              {/* Top 3-col info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Customer */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Customer</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selectedOrder.userName?.charAt(0)}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedOrder.userName}</p>
                  </div>
                  <p className="text-xs text-gray-500">User ID: <span className="font-medium text-gray-700">{selectedOrder.userId}</span></p>
                  {selectedOrder.phoneNumber && (
                    <p className="text-xs text-gray-500 mt-1">Mobile: <span className="font-medium text-gray-700">{selectedOrder.phoneNumber}</span></p>
                  )}
                </div>

                {/* Payment */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Payment</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-semibold text-gray-800">{selectedOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${getStatusColor(selectedOrder.paymentStatus)}`}>
                        {getStatusText(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    {selectedOrder.isCOD ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type</span>
                          <span className="font-semibold text-orange-600">Cash on Delivery</span>
                        </div>
                        {isCODConfirmed(selectedOrder) && parseFloat(selectedOrder.codCharges) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">COD Charge</span>
                            <span className="font-semibold text-green-600">₹{parseFloat(selectedOrder.codCharges).toLocaleString('en-IN')} paid online</span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Delivery</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${getDeliveryStatusColor(selectedOrder.deliveryStatus)}`}>
                        {selectedOrder.deliveryStatus}
                      </span>
                    </div>
                    {selectedOrder.shippingPartner && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Partner</span>
                        <span className="font-semibold text-gray-800">{selectedOrder.shippingPartner}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ordered</span>
                      <span className="font-semibold text-gray-800">{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Shipping Address
                </p>
                <p className="text-sm text-gray-800 font-medium">
                  {[selectedOrder.addressLine1, selectedOrder.addressLine2].filter(Boolean).join(', ')}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {[selectedOrder.cityName, selectedOrder.stateName, selectedOrder.postal_code, selectedOrder.countryName].filter(Boolean).join(', ')}
                </p>
              </div>

              {/* Shipment Tracking Info */}
              {(selectedOrder.awb_code || selectedOrder.shipment_id) && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1.576 9.172A2 2 0 008.556 19h6.888a2 2 0 001.98-1.828L19 8" />
                    </svg>
                    Shipment Info
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {selectedOrder.shipment_id && (
                      <div>
                        <span className="text-gray-500 block">Shipment ID</span>
                        <span className="font-semibold text-gray-800 font-mono">{selectedOrder.shipment_id}</span>
                      </div>
                    )}
                    {selectedOrder.awb_code && (
                      <div>
                        <span className="text-gray-500 block">AWB Code</span>
                        <span className="font-semibold text-gray-800 font-mono">{selectedOrder.awb_code}</span>
                      </div>
                    )}
                    {selectedOrder.courier_name && (
                      <div>
                        <span className="text-gray-500 block">Courier</span>
                        <span className="font-semibold text-gray-800">{selectedOrder.courier_name}</span>
                      </div>
                    )}
                    {selectedOrder.shipment_status && (
                      <div>
                        <span className="text-gray-500 block">Shipment Status</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${getDeliveryStatusColor(selectedOrder.shipment_status)}`}>
                          {selectedOrder.shipment_status}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedOrder.tracking_url && (
                    <a
                      href={selectedOrder.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 underline underline-offset-2"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Track Shipment
                    </a>
                  )}
                </div>
              )}

              {/* Order Items */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Order Items ({(selectedOrder.items || []).length})</p>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${item.isGifted ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <button
                            type="button"
                            onClick={() => openImagePreview(item.imageUrl, item.productName)}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white hover:ring-2 hover:ring-teal-200 transition"
                            title="View image"
                          >
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          </button>
                        ) : (
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-teal-700 text-xs font-bold">{index + 1}</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{item.productName}</p>
                            {item.isGifted && (
                              <span className="text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold tracking-wide">🎁 Gift Wrap</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            SKU: {item.skuCode || 'N/A'} &nbsp;·&nbsp; Qty: {item.quantity} &nbsp;·&nbsp; ₹{(parseFloat(item.price) || 0).toLocaleString('en-IN')} each
                            {item.size ? ` · Size: ${item.size}` : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{(parseFloat(item.subtotal) || 0).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Price Breakdown</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-teal-50 text-teal-700 border border-teal-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {(selectedOrder.items || []).length} product{(selectedOrder.items || []).length !== 1 ? 's' : ''}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {(selectedOrder.items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0)} qty
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{(parseFloat(selectedOrder.totalAmount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(selectedOrder.gstAmount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>GST</span>
                      <span>₹{(parseFloat(selectedOrder.gstAmount) || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {parseFloat(selectedOrder.shippingAmount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping {selectedOrder.shippingPartner ? `(${selectedOrder.shippingPartner})` : ''}</span>
                      <span>₹{(parseFloat(selectedOrder.shippingAmount) || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {isCODConfirmed(selectedOrder) && parseFloat(selectedOrder.codCharges) > 0 && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1.5">
                          COD Charge
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Paid Online</span>
                        </span>
                        <span>₹{(parseFloat(selectedOrder.codCharges) || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-teal-700 font-semibold">
                        <span>Amount Due at Delivery</span>
                        <span>₹{(parseFloat(selectedOrder.finalAmount) - parseFloat(selectedOrder.codCharges)).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {parseFloat(selectedOrder.giftingCharges) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>🎁 Gift Wrapping</span>
                      <span>₹{(parseFloat(selectedOrder.giftingCharges) || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount{selectedOrder.couponCode ? ` (${selectedOrder.couponCode})` : ''}
                      </span>
                      <span>-₹{(parseFloat(selectedOrder.discount) || 0).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{(parseFloat(selectedOrder.finalAmount) || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

        </div>
        )}
      </Modal>

      {imagePreviewMounted && selectedImage && createPortal(
        <div
          className="fixed inset-0 z-[10050] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 py-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative inline-flex max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 text-gray-700 shadow-lg transition hover:bg-gray-50"
              aria-label="Close image preview"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center justify-center bg-gradient-to-b from-gray-50 to-white p-3 sm:p-4">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="block max-h-[84vh] max-w-[88vw] w-auto rounded-xl object-contain shadow-sm ring-1 ring-gray-200"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
