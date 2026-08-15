"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { GetAllManualInvoices, DownloadManualInvoicePDF, GetAllProducts } from '@/Services/GetService'
import { CreateManualInvoice, UpdateManualInvoice, DeleteManualInvoice } from '@/Services/PostService'
import { successToast, errorToast, loadingToast, dismissToast } from '@/utils/toast'
import { AdminStatsCard } from '@/components/ui/AdminStatsCard'
import { Pagination } from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'

// ─── Types ─────────────────────────────────────────────────────────
interface InvoiceItem {
  id?: number
  productId: number | null
  productName: string
  skuCode: string
  quantity: number
  price: number
  subtotal: number
  isManual?: boolean
}

interface Invoice {
  id: number
  invoiceNumber: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  addressLine1: string | null
  addressLine2: string | null
  cityName: string | null
  stateName: string | null
  postal_code: string | null
  countryName: string | null
  totalAmount: number
  gstRate: number
  gstAmount: number
  shippingAmount: number
  giftingCharges: number
  discount: number
  couponCode: string | null
  finalAmount: number
  notes: string | null
  paymentMethod: string | null
  paymentStatus: string | null
  items: InvoiceItem[] | null
  createdAt: string
}

interface Product {
  id: number
  name: string
  skuCode: string
  basePrice: number
  discountPrice: number | null
  stockQuantity: number
}

const EMPTY_ITEM: InvoiceItem = {
  productId: null,
  productName: '',
  skuCode: '',
  quantity: 1,
  price: 0,
  subtotal: 0,
  isManual: false,
}

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  addressLine1: '',
  addressLine2: '',
  cityName: '',
  stateName: '',
  postal_code: '',
  countryName: 'India',
  items: [{ ...EMPTY_ITEM }] as InvoiceItem[],
  gstRate: 3,
  shippingAmount: 0,
  giftingCharges: 0,
  discount: 0,
  couponCode: '',
  notes: '',
  enableGst: false,
  enableShipping: false,
  enableGifting: false,
  enableDiscount: false,
  paymentMethod: 'Cash',
  paymentStatus: 'Paid',
}

// ─── Helpers ───────────────────────────────────────────────────────
const formatCurrency = (amt: number) =>
  `₹${Number(amt || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Component ─────────────────────────────────────────────────────
export default function ManualInvoicesPage() {
  // ── List state
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // ── Form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)

  // ── Product search
  const [productSearches, setProductSearches] = useState<Record<number, string>>({})
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [dropdownProducts, setDropdownProducts] = useState<Product[]>([])
  const [dropdownPage, setDropdownPage] = useState(1)
  const [dropdownHasMore, setDropdownHasMore] = useState(true)
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const dropdownSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownListRef = useRef<HTMLDivElement | null>(null)

  // ── View detail
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)

  // ── Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Download loading
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  // ── Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      const res = await GetAllManualInvoices()
      if (res?.data?.data) {
        setInvoices(res.data.data)
      } else {
        setInvoices([])
      }
    } catch {
      errorToast('Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDropdownProducts = useCallback(async (search: string, page: number, replace: boolean) => {
    setDropdownLoading(true)
    try {
      const res = await GetAllProducts({ search: search || undefined, page, limit: 20, includeOutOfStock: true })
      const list: Product[] = res?.data?.data?.products || (Array.isArray(res?.data?.data) ? res.data.data : [])
      const pagination = res?.data?.data?.pagination
      setDropdownProducts(prev => replace ? list : [...prev, ...list])
      setDropdownHasMore(pagination ? pagination.currentPage < pagination.totalPages : false)
    } catch {
      // silent
    } finally {
      setDropdownLoading(false)
    }
  }, [])

  const openDropdown = useCallback((idx: number) => {
    setActiveDropdown(idx)
    setDropdownProducts([])
    setDropdownPage(1)
    setDropdownHasMore(true)
    loadDropdownProducts(productSearches[idx] || '', 1, true)
  }, [loadDropdownProducts, productSearches])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  // ── Computed: filtered + paginated
  const filtered = useMemo(() => {
    if (!search.trim()) return invoices
    const q = search.toLowerCase()
    return invoices.filter(
      (inv) =>
        inv.invoiceNumber?.toLowerCase().includes(q) ||
        inv.customerName?.toLowerCase().includes(q) ||
        inv.customerPhone?.toLowerCase().includes(q)
    )
  }, [invoices, search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage, itemsPerPage]
  )

  // ── Stats
  const stats = useMemo(() => {
    const total = invoices.length
    const revenue = invoices.reduce((s, i) => s + Number(i.finalAmount || 0), 0)
    const avg = total > 0 ? revenue / total : 0
    return { total, revenue, avg }
  }, [invoices])

  // ── Form calculations
  const formTotals = useMemo(() => {
    const subtotal = form.items.reduce((s, i) => s + (Number(i.price) * Number(i.quantity) || 0), 0)
    const gstAmt = form.enableGst ? subtotal * (Number(form.gstRate) / 100) : 0
    const ship = form.enableShipping ? Number(form.shippingAmount) || 0 : 0
    const gift = form.enableGifting ? Number(form.giftingCharges) || 0 : 0
    const disc = form.enableDiscount ? Number(form.discount) || 0 : 0
    const final = subtotal + gstAmt + ship + gift - disc
    return { subtotal, gstAmt, ship, gift, disc, final: Math.max(final, 0) }
  }, [form])

  // ── Open form
  const openCreate = () => {
    setEditingInvoice(null)
    setForm({ ...EMPTY_FORM, items: [{ ...EMPTY_ITEM }] })
    setProductSearches({})
    setActiveDropdown(null)
    setDropdownProducts([])
    setIsFormOpen(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditingInvoice(inv)
    const items: InvoiceItem[] = (inv.items && inv.items.length > 0)
      ? inv.items.map(i => ({ ...i, subtotal: Number(i.price) * Number(i.quantity), isManual: !i.productId }))
      : [{ ...EMPTY_ITEM }]
    setForm({
      customerName: inv.customerName || '',
      customerPhone: inv.customerPhone || '',
      customerEmail: inv.customerEmail || '',
      addressLine1: inv.addressLine1 || '',
      addressLine2: inv.addressLine2 || '',
      cityName: inv.cityName || '',
      stateName: inv.stateName || '',
      postal_code: inv.postal_code || '',
      countryName: inv.countryName || 'India',
      items,
      gstRate: inv.gstRate || 0,
      shippingAmount: inv.shippingAmount || 0,
      giftingCharges: inv.giftingCharges || 0,
      discount: inv.discount || 0,
      couponCode: inv.couponCode || '',
      notes: inv.notes || '',
      enableGst: Number(inv.gstRate) > 0,
      enableShipping: Number(inv.shippingAmount) > 0,
      enableGifting: Number(inv.giftingCharges) > 0,
      enableDiscount: Number(inv.discount) > 0,
      paymentMethod: inv.paymentMethod || 'Cash',
      paymentStatus: inv.paymentStatus || 'Paid',
    })
    setProductSearches({})
    setActiveDropdown(null)
    setDropdownProducts([])
    setIsFormOpen(true)
  }

  // ── Item management
  const addItem = () => {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }))
  }

  const removeItem = (idx: number) => {
    if (form.items.length <= 1) return
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))
    setProductSearches(prev => {
      const next = { ...prev }
      delete next[idx]
      return next
    })
  }

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    setForm(prev => {
      const items = [...prev.items]
      const item = { ...items[idx], [field]: value }
      item.subtotal = Number(item.price) * Number(item.quantity)
      items[idx] = item
      return { ...prev, items }
    })
  }

  const selectProduct = (idx: number, product: Product) => {
    setForm(prev => {
      const items = [...prev.items]
      items[idx] = {
        ...items[idx],
        productId: product.id,
        productName: product.name,
        skuCode: product.skuCode || '',
        price: Number(product.discountPrice || product.basePrice),
        quantity: items[idx].quantity || 1,
        subtotal: Number(product.discountPrice || product.basePrice) * (items[idx].quantity || 1),
      }
      return { ...prev, items }
    })
    setProductSearches(prev => ({ ...prev, [idx]: '' }))
    setActiveDropdown(null)
  }

  const handleProductSearch = (idx: number, value: string) => {
    setProductSearches(p => ({ ...p, [idx]: value }))
    setActiveDropdown(idx)
    updateItem(idx, 'productName', value)
    if (dropdownSearchTimer.current) clearTimeout(dropdownSearchTimer.current)
    dropdownSearchTimer.current = setTimeout(() => {
      setDropdownProducts([])
      setDropdownPage(1)
      loadDropdownProducts(value, 1, true)
    }, 300)
  }

  const handleDropdownScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (dropdownLoading || !dropdownHasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      const nextPage = dropdownPage + 1
      setDropdownPage(nextPage)
      loadDropdownProducts(productSearches[activeDropdown ?? -1] || '', nextPage, false)
    }
  }

  // ── Submit
  const handleSubmit = async () => {
    if (!form.customerName.trim()) {
      errorToast('Customer name is required')
      return
    }
    const validItems = form.items.filter(i => i.productName.trim() && Number(i.price) >= 0)
    if (validItems.length === 0) {
      errorToast('At least one item with a name and price is required')
      return
    }

    const payload = {
      customerName: form.customerName,
      customerPhone: form.customerPhone || null,
      customerEmail: form.customerEmail || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      cityName: form.cityName || null,
      stateName: form.stateName || null,
      postal_code: form.postal_code || null,
      countryName: form.countryName || 'India',
      items: validItems.map(i => ({
        productId: i.isManual ? null : i.productId,
        productName: i.productName,
        skuCode: i.skuCode,
        quantity: Number(i.quantity),
        price: Number(i.price),
      })),
      gstRate: form.enableGst ? Number(form.gstRate) : 0,
      shippingAmount: form.enableShipping ? Number(form.shippingAmount) : 0,
      giftingCharges: form.enableGifting ? Number(form.giftingCharges) : 0,
      discount: form.enableDiscount ? Number(form.discount) : 0,
      couponCode: form.enableDiscount ? form.couponCode || null : null,
      notes: form.notes || null,
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
    }

    const toastId = loadingToast(editingInvoice ? 'Updating invoice...' : 'Creating invoice...')
    setSaving(true)
    try {
      if (editingInvoice) {
        await UpdateManualInvoice(payload, editingInvoice.id)
        dismissToast(toastId)
        successToast('Invoice updated successfully')
      } else {
        await CreateManualInvoice(payload)
        dismissToast(toastId)
        successToast('Invoice created successfully')
      }
      setIsFormOpen(false)
      fetchInvoices()
    } catch (err: any) {
      dismissToast(toastId)
      errorToast(err?.response?.data?.message || 'Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await DeleteManualInvoice(deleteTarget.id)
      successToast('Invoice deleted successfully')
      setDeleteTarget(null)
      fetchInvoices()
    } catch {
      errorToast('Failed to delete invoice')
    } finally {
      setDeleting(false)
    }
  }

  // ── Download PDF
  const handleDownload = async (inv: Invoice) => {
    setDownloadingId(inv.id)
    try {
      const res = await DownloadManualInvoicePDF(inv.id)
      if (res?.data?.data?.pdfBase64) {
        const link = document.createElement('a')
        link.href = `data:${res.data.data.mimeType || 'application/pdf'};base64,${res.data.data.pdfBase64}`
        link.download = `${res.data.data.invoiceNumber || inv.invoiceNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        successToast('Invoice downloaded')
      } else {
        errorToast('No PDF data received')
      }
    } catch {
      errorToast('Failed to download invoice')
    } finally {
      setDownloadingId(null)
    }
  }

  // ── Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            Manual Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create, manage and download invoices manually</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-600/30 hover:from-teal-700 hover:to-teal-800 transition-all duration-200 hover:shadow-xl hover:shadow-teal-700/30 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Invoice
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <AdminStatsCard
          title="Total Invoices"
          value={stats.total}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="teal"
        />
        <AdminStatsCard
          title="Total Revenue"
          value={formatCurrency(stats.revenue)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          color="emerald"
        />
        <AdminStatsCard
          title="Average Invoice"
          value={formatCurrency(stats.avg)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by invoice number, customer name, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Subtotal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">No invoices found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {search ? 'Try a different search term' : 'Create your first manual invoice'}
                      </p>
                      {!search && (
                        <button
                          onClick={openCreate}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((inv) => {
                  const itemCount = inv.items ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items).length : 0
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{inv.customerName}</p>
                          {inv.customerPhone && (
                            <p className="text-xs text-gray-500 mt-0.5">{inv.customerPhone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{formatCurrency(inv.totalAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(inv.finalAmount)}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-500">{formatDate(inv.createdAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            onClick={() => setViewInvoice(inv)}
                            title="View details"
                            className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEdit(inv)}
                            title="Edit invoice"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Download */}
                          <button
                            onClick={() => handleDownload(inv)}
                            disabled={downloadingId === inv.id}
                            title="Download PDF"
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-150 disabled:opacity-50"
                          >
                            {downloadingId === inv.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(inv)}
                            title="Delete invoice"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1) }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════
          CREATE / EDIT MODAL
         ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => !saving && setIsFormOpen(false)}
        title={editingInvoice ? `Edit Invoice — ${editingInvoice.invoiceNumber}` : 'Create New Invoice'}
        size="xl"
        footer={
          <>
            <button
              onClick={() => setIsFormOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg shadow-lg shadow-teal-600/20 hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : editingInvoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* ── Customer Details ─── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Customer Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Customer name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input type="text" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="email@example.com" />
              </div>
            </div>
          </div>

          {/* ── Address ─── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Address <span className="text-xs font-normal text-gray-400">(optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={form.addressLine1} onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Address Line 1" />
              <input type="text" value={form.addressLine2} onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Address Line 2" />
              <input type="text" value={form.cityName} onChange={e => setForm(f => ({ ...f, cityName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="City" />
              <input type="text" value={form.stateName} onChange={e => setForm(f => ({ ...f, stateName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="State" />
              <input type="text" value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Postal Code" />
              <input type="text" value={form.countryName} onChange={e => setForm(f => ({ ...f, countryName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Country" />
            </div>
          </div>

          {/* ── Items ─── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Products / Items <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100 relative group">
                  {/* Mode toggle */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">Entry mode:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => {
                          const items = [...prev.items]
                          items[idx] = { ...items[idx], isManual: false, productId: null, productName: '', skuCode: '', price: 0, subtotal: 0 }
                          return { ...prev, items }
                        })
                        setProductSearches(p => ({ ...p, [idx]: '' }))
                        setActiveDropdown(null)
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        !item.isManual ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      Search Product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(prev => {
                          const items = [...prev.items]
                          items[idx] = { ...items[idx], isManual: true, productId: null }
                          return { ...prev, items }
                        })
                        setActiveDropdown(null)
                      }}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        item.isManual ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>
                  <div className="grid grid-cols-12 gap-2 items-end">
                    {/* Product search / name */}
                    <div className="col-span-12 sm:col-span-5 relative">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {item.isManual ? 'Item Name' : 'Product'}
                      </label>
                      {item.isManual ? (
                        <input
                          type="text"
                          value={item.productName}
                          onChange={e => updateItem(idx, 'productName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          placeholder="e.g. Custom Engraving, Labour Charge..."
                        />
                      ) : (
                        <>
                          <input
                            type="text"
                            value={activeDropdown === idx ? (productSearches[idx] ?? '') : item.productName}
                            onChange={e => handleProductSearch(idx, e.target.value)}
                            onFocus={() => openDropdown(idx)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            placeholder="Search product by name or SKU..."
                          />
                          {/* Dropdown */}
                          {activeDropdown === idx && (
                            <div
                              ref={dropdownListRef}
                              onScroll={handleDropdownScroll}
                              className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                            >
                              {dropdownProducts.map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => selectProduct(idx, p)}
                                  className="w-full px-3 py-2 text-left hover:bg-teal-50 text-sm flex items-center justify-between transition-colors"
                                >
                                  <div>
                                    <span className="font-medium text-gray-900">{p.name}</span>
                                    {p.skuCode && <span className="ml-2 text-xs text-gray-400">{p.skuCode}</span>}
                                  </div>
                                  <span className="text-xs font-semibold text-teal-600">
                                    {formatCurrency(Number(p.discountPrice || p.basePrice))}
                                  </span>
                                </button>
                              ))}
                              {dropdownLoading && (
                                <div className="px-3 py-2 text-sm text-gray-400 text-center">Loading...</div>
                              )}
                              {!dropdownLoading && dropdownProducts.length === 0 && (
                                <div className="px-3 py-3 text-sm text-gray-400 text-center">No products found</div>
                              )}
                              {!dropdownLoading && dropdownHasMore && (
                                <div className="px-3 py-1.5 text-xs text-gray-400 text-center">Scroll for more</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* SKU */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">SKU</label>
                      <input type="text" value={item.skuCode} onChange={e => updateItem(idx, 'skuCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-gray-50" placeholder="SKU" />
                    </div>
                    {/* Qty */}
                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                    </div>
                    {/* Price */}
                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
                      <input type="number" min="0" step="0.01" value={item.price} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="0.00" />
                    </div>
                    {/* Subtotal + Remove */}
                    <div className="col-span-2 sm:col-span-2 flex items-end gap-1">
                      <div className="flex-1 text-right">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Subtotal</label>
                        <p className="py-2 text-sm font-semibold text-gray-900">{formatCurrency(Number(item.price) * Number(item.quantity))}</p>
                      </div>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors mb-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Another Item
              </button>
            </div>
          </div>

          {/* ── Charges (Toggles) ─── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Additional Charges <span className="text-xs font-normal text-gray-400">(optional)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* GST */}
              <div className={`rounded-xl border p-3 transition-all ${form.enableGst ? 'border-teal-300 bg-teal-50/40' : 'border-gray-100 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.enableGst} onChange={e => setForm(f => ({ ...f, enableGst: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm font-medium text-gray-700">GST</span>
                </label>
                {form.enableGst && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">GST Rate (%)</label>
                    <input type="number" min="0" max="28" step="0.5" value={form.gstRate} onChange={e => setForm(f => ({ ...f, gstRate: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                    {formTotals.gstAmt > 0 && (
                      <p className="text-xs text-teal-600 mt-1 font-medium">
                        GST: {formatCurrency(formTotals.gstAmt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* Shipping */}
              <div className={`rounded-xl border p-3 transition-all ${form.enableShipping ? 'border-blue-300 bg-blue-50/40' : 'border-gray-100 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.enableShipping} onChange={e => setForm(f => ({ ...f, enableShipping: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Shipping</span>
                </label>
                {form.enableShipping && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">Shipping Amount (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.shippingAmount} onChange={e => setForm(f => ({ ...f, shippingAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                )}
              </div>
              {/* Gifting */}
              <div className={`rounded-xl border p-3 transition-all ${form.enableGifting ? 'border-pink-300 bg-pink-50/40' : 'border-gray-100 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.enableGifting} onChange={e => setForm(f => ({ ...f, enableGifting: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500" />
                  <span className="text-sm font-medium text-gray-700">Gift Wrapping</span>
                </label>
                {form.enableGifting && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-500 mb-1">Gifting Charges (₹)</label>
                    <input type="number" min="0" step="0.01" value={form.giftingCharges} onChange={e => setForm(f => ({ ...f, giftingCharges: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500" />
                  </div>
                )}
              </div>
              {/* Discount */}
              <div className={`rounded-xl border p-3 transition-all ${form.enableDiscount ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-100 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.enableDiscount} onChange={e => setForm(f => ({ ...f, enableDiscount: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">Discount</span>
                </label>
                {form.enableDiscount && (
                  <div className="mt-2 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Discount Amount (₹)</label>
                      <input type="number" min="0" step="0.01" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Coupon Code</label>
                      <input type="text" value={form.couponCode} onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="SAVE10" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Notes ─── */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
              placeholder="Any internal notes..." />
          </div>

          {/* ── Payment ─── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xs font-bold">5</span>
              Payment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Cheque</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Partial</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Live Summary ─── */}
          <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Invoice Summary</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({form.items.filter(i => i.productName).length} items)</span>
                <span className="text-gray-700 font-medium">{formatCurrency(formTotals.subtotal)}</span>
              </div>
              {form.enableGst && formTotals.gstAmt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST ({form.gstRate}%)</span>
                  <span className="text-gray-700">+{formatCurrency(formTotals.gstAmt)}</span>
                </div>
              )}
              {form.enableShipping && formTotals.ship > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-700">+{formatCurrency(formTotals.ship)}</span>
                </div>
              )}
              {form.enableGifting && formTotals.gift > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gift Wrapping</span>
                  <span className="text-gray-700">+{formatCurrency(formTotals.gift)}</span>
                </div>
              )}
              {form.enableDiscount && formTotals.disc > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Discount{form.couponCode ? ` (${form.couponCode})` : ''}</span>
                  <span className="text-emerald-600">-{formatCurrency(formTotals.disc)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-gray-900">Total Amount</span>
                  <span className="text-base font-bold text-teal-700">{formatCurrency(formTotals.final)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          VIEW DETAIL MODAL
         ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title={viewInvoice ? `Invoice — ${viewInvoice.invoiceNumber}` : ''}
        size="xl"
        footer={
          viewInvoice && (
            <>
              <button onClick={() => setViewInvoice(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
              <button onClick={() => { openEdit(viewInvoice); setViewInvoice(null) }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button onClick={() => handleDownload(viewInvoice)} disabled={downloadingId === viewInvoice.id}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all flex items-center gap-1 disabled:opacity-50">
                {downloadingId === viewInvoice.id ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Download PDF
              </button>
            </>
          )
        }
      >
        {viewInvoice && (() => {
          const inv = viewInvoice
          const items: InvoiceItem[] = inv.items
            ? (typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items)
            : []
          return (
            <div className="space-y-5">
              {/* Customer & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</h4>
                  <p className="text-sm font-semibold text-gray-900">{inv.customerName}</p>
                  {inv.customerPhone && <p className="text-sm text-gray-600 mt-1">{inv.customerPhone}</p>}
                  {inv.customerEmail && <p className="text-sm text-gray-500">{inv.customerEmail}</p>}
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Invoice Info</h4>
                  <p className="text-sm"><span className="text-gray-500">Number:</span> <span className="font-semibold text-teal-700">{inv.invoiceNumber}</span></p>
                  <p className="text-sm mt-1"><span className="text-gray-500">Date:</span> <span className="font-medium">{formatDate(inv.createdAt)}</span></p>
                </div>
              </div>

              {/* Address */}
              {(inv.addressLine1 || inv.cityName) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-700">
                    {[inv.addressLine1, inv.addressLine2].filter(Boolean).join(', ')}
                    {inv.cityName && <><br />{[inv.cityName, inv.stateName, inv.postal_code].filter(Boolean).join(', ')}</>}
                    {inv.countryName && <><br />{inv.countryName}</>}
                  </p>
                </div>
              )}

              {/* Items table */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-900">{item.productName}</p>
                            {item.skuCode && <p className="text-xs text-gray-400">{item.skuCode}</p>}
                          </td>
                          <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                          <td className="px-4 py-2.5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{formatCurrency(item.subtotal || Number(item.price) * Number(item.quantity))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl p-4 border border-gray-200">
                <div className="space-y-1.5 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-700">{formatCurrency(inv.totalAmount)}</span>
                  </div>
                  {Number(inv.gstRate) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST ({inv.gstRate}%)</span>
                      <span className="text-gray-700">{formatCurrency(Number(inv.gstAmount))}</span>
                    </div>
                  )}
                  {Number(inv.shippingAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-700">+{formatCurrency(inv.shippingAmount)}</span>
                    </div>
                  )}
                  {Number(inv.giftingCharges) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Gift Wrapping</span>
                      <span className="text-gray-700">+{formatCurrency(inv.giftingCharges)}</span>
                    </div>
                  )}
                  {Number(inv.discount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Discount{inv.couponCode ? ` (${inv.couponCode})` : ''}</span>
                      <span className="text-emerald-600">-{formatCurrency(inv.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-base font-bold text-teal-700">{formatCurrency(inv.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {inv.notes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Notes</h4>
                  <p className="text-sm text-amber-800">{inv.notes}</p>
                </div>
              )}

              {/* Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Method</h4>
                  <p className="text-sm font-medium text-gray-900">{inv.paymentMethod || 'Cash'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Payment Status</h4>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                    inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                    inv.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{inv.paymentStatus || 'Paid'}</span>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Invoice"
        size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} disabled={deleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {deleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Deleting...
                </>
              ) : 'Delete Invoice'}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete invoice <span className="font-semibold text-teal-700">{deleteTarget.invoiceNumber}</span>?
            </p>
            <p className="text-gray-500 text-xs mt-2">This action cannot be undone.</p>
          </div>
        )}
      </Modal>

      {/* Click-outside handler for product dropdown */}
      {activeDropdown !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
      )}
    </div>
  )
}
