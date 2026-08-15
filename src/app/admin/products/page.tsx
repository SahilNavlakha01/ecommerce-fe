"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { GetAllProducts, GetAllCategories } from '@/Services/GetService'
import { DeleteProduct, UpdateStock } from '@/Services/PostService'
import { BASE_URL } from '@/Constant/Api'
import { successToast, errorToast } from '@/utils/toast'
import { ProductsLoading } from '@/components/ui/AdminLoading'
import { SearchAndFilter } from '@/components/ui/SearchAndFilter'
import { AdminTable } from '@/components/ui/AdminTable'
import { Pagination } from '@/components/ui/Pagination'
import { exportToCSV, exportToExcel, printTable } from '@/utils/exportUtils'
import BulkUploadModal from '@/components/BulkUploadModal'
import AdminProductAddModal from '@/components/AdminProductAddModal'
import AdminProductEditModal from '@/components/AdminProductEditModal'

interface Product {
  id: string
  name: string
  skuCode: string
  images: { imageUrl: string }[]
  category_name: string | { name: string }
  subcategory_name?: string | { name: string }
  basePrice: number
  b2bPrice?: number
  discountPrice?: number
  isB2b: boolean
  isBoth?: boolean
  purity: string | { name: string; value?: string } | { name: string; value?: string }[]
  weight: number
  stockQuantity: number
  isActive: boolean
}

const SCROLL_KEY = 'admin_products_scroll'
const STATE_KEY = 'admin_products_table_state'

const getSavedTableState = () => {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(sessionStorage.getItem(STATE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function ProductsPage() {
  const router = useRouter()
  const initialScrollY = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('scrollY')
    : null
  const initialProductId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('productId')
    : null
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(() => getSavedTableState().activeTab || 'normal') // 'normal' or 'b2b'
  const [searchTerm, setSearchTerm] = useState(() => getSavedTableState().searchTerm || '')
  const [statusFilter, setStatusFilter] = useState(() => getSavedTableState().statusFilter || 'all')
  const [categoryFilter, setCategoryFilter] = useState(() => getSavedTableState().categoryFilter || 'all')
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [sortKey, setSortKey] = useState<string>(() => getSavedTableState().sortKey || '')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => getSavedTableState().sortDirection || 'asc')
  const [currentPage, setCurrentPage] = useState(() => getSavedTableState().currentPage || 1)
  const [itemsPerPage, setItemsPerPage] = useState(() => getSavedTableState().itemsPerPage || 10)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockValue, setEditingStockValue] = useState<string>('')
  const [stockSaving, setStockSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)
  const [imagePreviewMounted, setImagePreviewMounted] = useState(false)
  
  // Modals for Add and Edit Product
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const scrollRestored = useRef(false)
  const restoreTimer = useRef<number | null>(null)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // Open modals if query params are present (migrated from pages)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const openAdd = searchParams.get('openAddModal') === 'true'
      const openEditId = searchParams.get('openEditModalId')
      if (openAdd) {
        setShowAddModal(true)
      } else if (openEditId) {
        setEditingProductId(openEditId)
      }
    }
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

  // Save scroll position on scroll
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const handleScroll = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    const saveScroll = () => sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pagehide', saveScroll)
    window.addEventListener('beforeunload', saveScroll)
    return () => {
      saveScroll()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pagehide', saveScroll)
      window.removeEventListener('beforeunload', saveScroll)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      activeTab,
      searchTerm,
      statusFilter,
      categoryFilter,
      sortKey,
      sortDirection,
      currentPage,
      itemsPerPage
    }))
  }, [activeTab, searchTerm, statusFilter, categoryFilter, sortKey, sortDirection, currentPage, itemsPerPage])

  // Restore scroll after products load
  useEffect(() => {
    if (!loading && !scrollRestored.current) {
      const restore = () => {
        const rowId = initialProductId || sessionStorage.getItem('admin_products_row_id')
        const saved = initialScrollY || sessionStorage.getItem(SCROLL_KEY)
        if (rowId) {
          const el = document.getElementById(`product-row-${rowId}`)
          if (el) {
            el.scrollIntoView({ block: 'center', behavior: 'auto' })
            scrollRestored.current = true
            return
          }
        }
        if (saved) {
          window.scrollTo(0, parseInt(saved))
        }
        scrollRestored.current = true
      }

      if (restoreTimer.current) window.clearTimeout(restoreTimer.current)
      restoreTimer.current = window.setTimeout(restore, 50)
    }
  }, [loading, initialScrollY, initialProductId])

  const persistListingState = () => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    sessionStorage.setItem(STATE_KEY, JSON.stringify({
      activeTab,
      searchTerm,
      statusFilter,
      categoryFilter,
      sortKey,
      sortDirection,
      currentPage,
      itemsPerPage
    }))
  }

  const goToEdit = (id: string) => {
    persistListingState()
    sessionStorage.setItem('admin_products_row_id', String(id))
    setEditingProductId(id)
  }

  const goToOtherPage = (path: string) => {
    sessionStorage.removeItem(SCROLL_KEY)
    sessionStorage.removeItem(STATE_KEY)
    sessionStorage.removeItem('admin_products_row_id')
    router.push(path)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, searchTerm ? 500 : 0) // Debounce search by 500ms
    
    return () => clearTimeout(timeoutId)
  }, [activeTab, currentPage, itemsPerPage, searchTerm, statusFilter, categoryFilter])

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await GetAllCategories()
      if (response?.data?.data) {
        setAllCategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const isB2b = activeTab === 'b2b'
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
        isB2b: isB2b,
        includeOutOfStock: true
      }
      
      const response = await GetAllProducts(filters)
      if (response?.data?.data) {
        setProducts(response.data.data.products || [])
        setPagination(response.data.data.pagination || {
          totalPages: 1,
          totalProducts: 0,
          hasNextPage: false,
          hasPrevPage: false
        })
      }
    } catch (error: unknown) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await DeleteProduct(id)
        setProducts(products?.filter(prod => prod.id !== id))
        successToast('Product deleted successfully!')
      } catch (error: unknown) {
        console.error('Error deleting product:', error)
        errorToast((error as any)?.response?.data?.message || (error as Error)?.message || 'Error deleting product')
      }
    }
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }

  const getStockColor = (quantity: number) => {
    if (quantity > 5) return 'bg-green-100 text-green-700'
    if (quantity > 0) return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Rings': 'bg-purple-100 text-purple-700',
      'Necklace': 'bg-blue-100 text-blue-700',
      'Earrings': 'bg-pink-100 text-pink-700',
      'Bracelet': 'bg-indigo-100 text-indigo-700',
      'default': 'bg-teal-100 text-teal-700'
    }
    return colors[category] || colors['default']
  }

  // Client-side sort on current page data
  const displayProducts = useMemo(() => {
    if (!sortKey) return products
    return [...products].sort((a: any, b: any) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]
      if (typeof aVal === 'object' && aVal !== null) aVal = aVal.name || ''
      if (typeof bVal === 'object' && bVal !== null) bVal = bVal.name || ''
      if (aVal == null) aVal = ''
      if (bVal == null) bVal = ''
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return sortDirection === 'asc' ? (aStr < bStr ? -1 : aStr > bStr ? 1 : 0) : (aStr > bStr ? -1 : aStr < bStr ? 1 : 0)
    })
  }, [products, sortKey, sortDirection])

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(product => {
      return typeof product.category_name === 'object' 
        ? product.category_name?.name 
        : product.category_name
    }).filter(Boolean))]
    return uniqueCategories
  }, [products])

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category)
    setCurrentPage(1)
  }

  const handleStockSave = async (id: string) => {
    const qty = parseInt(editingStockValue)
    if (isNaN(qty) || qty < 0) return
    setStockSaving(true)
    try {
      await UpdateStock(id, qty)
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stockQuantity: qty } : p))
      successToast('Stock updated!')
    } catch {
      errorToast('Failed to update stock')
    } finally {
      setStockSaving(false)
      setEditingStockId(null)
    }
  }

  const prepareExportData = () => {
    return products.map(product => {
      const purity = typeof product.purity === 'object' 
        ? (Array.isArray(product.purity) 
          ? product.purity.map((p: any) => p.name || p.value).join(', ')
          : (product.purity as any)?.name || (product.purity as any)?.value || 'N/A')
        : product.purity || 'N/A'
      
      const base = Number(product.basePrice || 0)
      const discount = Number(product.discountPrice || 0)
      const retail = base - discount
      const productType = product.isBoth ? 'Both' : (product.isB2b ? 'B2B' : 'Retail')

      return {
        'Product Name': product.name,
        'SKU Code': product.skuCode,
        'Category': typeof product.category_name === 'object' ? product.category_name?.name : product.category_name,
        'Subcategory': typeof product.subcategory_name === 'object' ? product.subcategory_name?.name : product.subcategory_name || 'N/A',
        'Base Price': base,
        'Discount Price': discount,
        'Retail Price': retail,
        'B2B Price': product.b2bPrice || 'N/A',
        'Stock Quantity': product.stockQuantity,
        'Weight (grams)': product.weight,
        'Purity': purity,
        'Product Type': productType,
        'Status': product.isActive ? 'Active' : 'Inactive'
      }
    })
  }

  const handleExport = () => {
    const exportData = prepareExportData()
    exportToCSV(exportData, `${activeTab}_products`)
  }

  const handleExportExcel = () => {
    const exportData = prepareExportData()
    exportToExcel(exportData, `${activeTab}_products`)
  }

  const handlePrint = () => {
    const printData = products.map(product => {
      const base = Number(product.basePrice || 0)
      const discount = Number(product.discountPrice || 0)
      const retail = base - discount
      const hasB2b = product.isB2b || product.isBoth
      const b2b = hasB2b && product.b2bPrice ? `₹${Number(product.b2bPrice).toLocaleString('en-IN')}` : '—'

      return {
        name: product.name,
        skuCode: product.skuCode,
        category: typeof product.category_name === 'object' ? product.category_name?.name : product.category_name,
        'Base Price': `₹${base.toLocaleString('en-IN')}`,
        'Retail Price': `₹${retail.toLocaleString('en-IN')}`,
        'B2B Price': b2b,
        stockQuantity: product.stockQuantity,
        status: product.isActive ? 'Active' : 'Inactive'
      }
    })
    
    printTable(printData, `${activeTab === 'b2b' ? 'B2B' : 'Retail'} Products Report`)
  }

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
        render: (value: any, row: Product) => (
        <div className="flex items-center" id={`product-row-${row.id}`}>
          <button
            type="button"
            onClick={() => {
              const src = row.images?.[0]?.imageUrl
              if (!src) return
              setSelectedImage({ src, alt: row.name })
            }}
            className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center hover:ring-2 hover:ring-teal-200 transition"
            title="View image"
          >
            {row.images?.[0]?.imageUrl ? (
              <img 
                src={row.images[0].imageUrl}
                alt={row.name} 
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.skuCode}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category_name',
      label: 'Category',
      sortable: true,
      render: (value: any, row: Product) => (
        <div className="space-y-1">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            typeof row.category_name === 'object' 
              ? getCategoryColor(row.category_name?.name || '')
              : getCategoryColor(row.category_name || '')
          }`}>
            {typeof row.category_name === 'object' ? row.category_name?.name || 'N/A' : row.category_name || 'N/A'}
          </span>
          {row.subcategory_name && (
            <div className="block">
              <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                {typeof row.subcategory_name === 'object' ? row.subcategory_name?.name || 'N/A' : row.subcategory_name || 'N/A'}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'basePrice',
      label: 'Pricing',
      sortable: true,
      render: (value: any, row: Product) => {
        const base = Number(row.basePrice || 0)
        const discount = Number(row.discountPrice || 0)
        const retail = base - discount
        const hasB2b = row.isB2b || row.isBoth
        const b2b = hasB2b && row.b2bPrice ? Number(row.b2bPrice) : null

        return (
          <div className="text-xs space-y-1.5 py-1">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 w-10">Base:</span>
              <span className="font-medium text-gray-700">₹{base.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 w-10">Retail:</span>
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                ₹{retail.toLocaleString('en-IN')}
                {discount > 0 && (
                  <span className="text-[10px] text-red-500 bg-red-50 px-1 py-0.25 rounded font-normal">
                    -₹{discount.toLocaleString('en-IN')}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-2 border-t border-gray-100 pt-1 mt-1">
              <span className="text-gray-400 w-10">B2B:</span>
              <span className={`font-semibold ${b2b ? 'text-teal-600' : 'text-gray-400'}`}>
                {b2b ? `₹${b2b.toLocaleString('en-IN')}` : '—'}
              </span>
            </div>
          </div>
        )
      }
    },
    {
      key: 'isB2b',
      label: 'Type',
      sortable: true,
      render: (value: any, row: Product) => {
        if (row.isBoth) {
          return (
            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">
              Both
            </span>
          )
        }
        return (
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.isB2b 
              ? 'bg-teal-100 text-teal-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {row.isB2b ? 'B2B' : 'Retail'}
          </span>
        )
      }
    },
    {
      key: 'stockQuantity',
      label: 'Stock',
      sortable: true,
      render: (value: any, row: Product) => (
        editingStockId === row.id ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={editingStockValue}
              onChange={e => setEditingStockValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleStockSave(row.id)
                if (e.key === 'Escape') setEditingStockId(null)
              }}
              className="w-20 border border-teal-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              autoFocus
            />
            <button
              onClick={() => handleStockSave(row.id)}
              disabled={stockSaving}
              className="text-green-600 hover:text-green-800 disabled:opacity-50 p-1 hover:bg-green-50 rounded transition-colors"
              title="Save"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={() => setEditingStockId(null)}
              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
              title="Cancel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditingStockId(row.id); setEditingStockValue(String(row.stockQuantity)) }}
            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockColor(row.stockQuantity)} hover:ring-2 hover:ring-offset-1 hover:ring-teal-300 transition cursor-pointer`}
            title="Click to edit stock"
          >
            {row.stockQuantity} in stock
          </button>
        )
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: false,
      render: (value: any, row: Product) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.isActive)}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Product) => (
        <div className="flex space-x-2">
          <button
            onClick={() => goToEdit(row.id)}
            className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors"
            title="Edit Product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
            title="Delete Product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Products Management</h1>
              <p className="text-gray-600 mt-1">Manage your jewelry inventory and product catalog</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <button
            onClick={() => goToOtherPage('/admin/products/bulk-management')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Bulk Management</span>
            </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Professional Product Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('normal')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'normal'
                ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Regular Products</span>
        
            </div>
          </button>
          <button
            onClick={() => setActiveTab('b2b')}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 relative ${
              activeTab === 'b2b'
                ? 'bg-white text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>B2B Products</span>
       
            </div>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products by name, SKU, or category..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="w-full lg:w-64">
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
            >
              <option value="all">All Categories</option>
              {allCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium"
              title="Export to CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium"
              title="Export to Excel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 font-medium"
              title="Print"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || categoryFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                Search: {searchTerm}
                <button
                  onClick={() => handleSearch('')}
                  className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                Category: {allCategories.find(c => c.id === parseInt(categoryFilter))?.name || categoryFilter}
                <button
                  onClick={() => handleCategoryFilter('all')}
                  className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                handleSearch('')
                handleCategoryFilter('all')
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <ProductsLoading />
      ) : products?.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600 mb-6">You haven't added any {activeTab === 'b2b' ? 'B2B' : ''} products yet. Start by creating your first product.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'b2b' ? 'B2B' : 'Regular'} Products
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Showing {products.length} of {pagination.totalProducts} products</span>
                <span>•</span>
                <span>Page {currentPage} of {pagination.totalPages}</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <AdminTable
            columns={columns}
            data={displayProducts}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalProducts}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}
      
      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={showBulkUploadModal} 
        onClose={() => setShowBulkUploadModal(false)}
        onUploadComplete={() => {
          fetchProducts()
          setShowBulkUploadModal(false)
        }}
      />

      {/* Add Product Modal */}
      <AdminProductAddModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchProducts}
      />

      {/* Edit Product Modal */}
      <AdminProductEditModal
        isOpen={editingProductId !== null}
        productId={editingProductId}
        onClose={() => setEditingProductId(null)}
        onSuccess={fetchProducts}
      />

      {imagePreviewMounted && selectedImage && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md px-4 py-6"
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
