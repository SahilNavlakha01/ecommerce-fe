"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { GetAllProducts } from '@/Services/GetService'
import { UpdateTopProducts } from '@/Services/PostService'
import { successToast, errorToast } from '@/utils/toast'
import { getFirstImageUrl } from '@/utils/imageUtils'

interface Product {
  id: string
  name: string
  skuCode: string
  images: { imageUrl: string }[]
  basePrice: number
  discountPrice?: number
  isTopProduct: boolean
  topProductOrder: number
}

export default function TopProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initial fetch for top products (large limit to ensure we get all top products)
    fetchInitialTopProducts()
    // Fetch first page of available products
    fetchAvailableProducts(1, false, '')
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAvailableProducts(1, false, searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchInitialTopProducts = async () => {
    try {
      const response = await GetAllProducts({ limit: 500, sortBy: 'Featured', includeOutOfStock: true })
      if (response?.data?.data?.products) {
        const products = response.data.data.products
        const currentTop = products
          .filter((p: Product) => p.isTopProduct)
          .sort((a: Product, b: Product) => (a.topProductOrder || 0) - (b.topProductOrder || 0))
        setTopProducts(currentTop)
      }
    } catch (error) {
      console.error('Error fetching initial top products:', error)
    }
  }

  const fetchAvailableProducts = async (page = 1, append = false, search = '') => {
    if (append) setLoadingMore(true)
    else setLoading(true)
    
    try {
      const response = await GetAllProducts({ limit: 20, page, search, sortBy: 'createdDate', includeOutOfStock: true })
      if (response?.data?.data?.products) {
        const products = response.data.data.products
        const pagination = response.data.data.pagination
        
        if (append) {
          setAllProducts(prev => {
            // Avoid duplicates
            const existingIds = new Set(prev.map(p => p.id))
            const newProducts = products.filter((p: Product) => !existingIds.has(p.id))
            return [...prev, ...newProducts]
          })
        } else {
          setAllProducts(products)
        }
        
        setCurrentPage(page)
        setHasMore(pagination?.hasNextPage || false)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      if (!append) errorToast('Failed to load products')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    fetchAvailableProducts(currentPage + 1, true, searchTerm)
  }, [loadingMore, hasMore, currentPage, searchTerm])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )
    
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore])

  const handleAddTopProduct = (product: Product) => {
    if (topProducts.find(p => p.id === product.id)) {
      return // Already added
    }
    setTopProducts([...topProducts, product])
  }

  const handleRemoveTopProduct = (productId: string) => {
    setTopProducts(topProducts.filter(p => p.id !== productId))
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newOrder = [...topProducts]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp
    setTopProducts(newOrder)
  }

  const moveDown = (index: number) => {
    if (index === topProducts.length - 1) return
    const newOrder = [...topProducts]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp
    setTopProducts(newOrder)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = topProducts.map((p, index) => ({
        id: p.id,
        order: index + 1
      }))
      await UpdateTopProducts(payload)
      successToast('Top products updated successfully!')
      fetchInitialTopProducts()
    } catch (error) {
      console.error('Error saving top products:', error)
      errorToast('Failed to update top products')
    } finally {
      setSaving(false)
    }
  }

  const filteredAvailableProducts = allProducts
    .filter(p => !topProducts.find(tp => tp.id === p.id))

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-teal-50/30 rounded-2xl p-6 border border-teal-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Top Products</h1>
              <p className="text-gray-600 mt-1">Manage the products that appear first on the home page</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Selected Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[700px]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Selected Top Products</h2>
            <p className="text-sm text-gray-500">Drag to reorder or use the up/down arrows. Products at the top will appear first on the home page.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-100 border-t-rose-800"></div>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No top products selected yet.<br/>Search and add from the list on the right.</p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors group">
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button 
                      onClick={() => moveDown(index)} 
                      disabled={index === topProducts.length - 1}
                      className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  
                  <div className="w-12 h-12 bg-white rounded flex-shrink-0 border border-gray-200 overflow-hidden">
                    <img src={getFirstImageUrl(product) || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 truncate">SKU: {product.skuCode}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                      {index + 1}
                    </span>
                    <button 
                      onClick={() => handleRemoveTopProduct(product.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from Top Products"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Available Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[700px]">
          <div className="mb-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Available Products</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-100 border-t-rose-800"></div>
              </div>
            ) : filteredAvailableProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No products found matching your search.
              </div>
            ) : (
              filteredAvailableProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                  <div className="w-10 h-10 bg-white rounded flex-shrink-0 border border-gray-200 overflow-hidden">
                    <img src={getFirstImageUrl(product) || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 truncate">SKU: {product.skuCode}</p>
                  </div>
                  
                  <button
                    onClick={() => handleAddTopProduct(product)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Add
                  </button>
                </div>
              ))
            )}
            
            {/* Loading indicator for pagination */}
            {loadingMore && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-rose-100 border-t-rose-800"></div>
              </div>
            )}
            
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
