"use client"

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import EcommerceLayout from '../EcommerceLayout';
import Link from 'next/link';
import Image from 'next/image';
import { GetAllProducts, GetAllConfig, GetSubcategoriesByCategory, GetSubcategoriesByParent } from '../../Services/GetService';
import { BASE_URL } from '../../Constant/Api';
import OptimizedProductCard from '../components/ProductCard';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton, HeroSkeleton } from '../../components/ui/Skeleton';
import { getFirstImageUrl } from '../../utils/imageUtils';
import PriceRangeControl from '../components/PriceRangeControl';
import { PRICE_MIN, PRICE_MAX, filterConfigs, configNameMapping, isPriceFilterActive, resetPriceRange } from '../components/productFilterConfig';
import { filterInStockProducts } from '../../utils/productVisibility';

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sortBy, setSortBy] = useState('Featured')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [filterOptions, setFilterOptions] = useState<any>({})
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null)
  const [compareList, setCompareList] = useState<string[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>(resetPriceRange())
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>(resetPriceRange())
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [limit, setLimit] = useState<number>(12)
  const [pagination, setPagination] = useState<any>(null)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number, left: number, placement: 'bottom' | 'top' } | null>(null)
  const [subcategoryName, setSubcategoryName] = useState<string>('')
  const [categoryName, setCategoryName] = useState<string>('')
  const [categorySubcategories, setCategorySubcategories] = useState<any[]>([])
  const [expandedSubcategoryId, setExpandedSubcategoryId] = useState<number | null>(null)
  const [subSubcategories, setSubSubcategories] = useState<Record<number, any[]>>({})
  const sentinelRef = useRef<HTMLDivElement>(null)

  const closeOverlays = useCallback(() => {
    setOpenDropdown(null)
    setShowMobileFilters(false)
  }, [])

  const calculateDropdownPosition = (buttonId: string, dropdownWidth: number = 192, dropdownHeight: number = 240) => {
    const button = document.getElementById(buttonId)
    if (!button) return { top: 100, left: 20, placement: 'bottom' as const }

    const rect = button.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    let top = rect.bottom + 4
    let left = rect.left
    let placement: 'bottom' | 'top' = 'bottom'

    // Check if dropdown fits below
    if (top + dropdownHeight > viewport.height - 20) {
      // Try above
      if (rect.top - dropdownHeight - 4 > 20) {
        top = rect.top - dropdownHeight - 4
        placement = 'top'
      } else {
        // Keep below but adjust
        top = viewport.height - dropdownHeight - 20
      }
    }

    // Check horizontal overflow
    if (left + dropdownWidth > viewport.width - 20) {
      left = viewport.width - dropdownWidth - 20
    }
    if (left < 20) left = 20

    return { top, left, placement }
  }

  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Load subcategories when categoryId changes
  const categoryIdParam = searchParams.get('categoryId')
  const categoryNameParam = searchParams.get('categoryName')
  useEffect(() => {
    setCategoryName(categoryNameParam || '')
    if (categoryIdParam) {
      GetSubcategoriesByCategory(categoryIdParam)
        .then(r => { if (r?.data?.data) setCategorySubcategories(r.data.data) })
        .catch(() => setCategorySubcategories([]))
    } else {
      setCategorySubcategories([])
      setSubSubcategories({})
      setExpandedSubcategoryId(null)
    }
  }, [categoryIdParam])

  const loadSubSubcategories = async (subId: number) => {
    if (subSubcategories[subId]) {
      // toggle collapse
      setExpandedSubcategoryId(prev => prev === subId ? null : subId)
      return
    }
    try {
      const r = await GetSubcategoriesByParent(subId)
      if (r?.data?.data) {
        setSubSubcategories(prev => ({ ...prev, [subId]: r.data.data }))
      }
    } catch { }
    setExpandedSubcategoryId(prev => prev === subId ? null : subId)
  }

  useEffect(() => {
    if (openDropdown === 'price') {
      setDraftPriceRange(priceRange)
    }
  }, [openDropdown, priceRange])

  useEffect(() => {
    const handleScroll = () => closeOverlays()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [closeOverlays])

  useEffect(() => {
    // Parse URL parameters and set filters
    const filtersFromUrl: Record<string, string[]> = {}
    Object.keys(filterConfigs).forEach(category => {
      const paramKey = category.toLowerCase().replace(/ /g, '_')
      const paramValue = searchParams.get(paramKey)
      if (paramValue) {
        filtersFromUrl[category] = paramValue.split(',')
      }
    })

    // Handle subcategoryId parameter for direct filtering
    const subcategoryIdParam = searchParams.get('subcategoryId')
    const subcategoryNameParam = searchParams.get('subcategoryName')
    if (subcategoryNameParam) setSubcategoryName(subcategoryNameParam)
    else setSubcategoryName('')

    // Parse pagination, sorting, and search from URL
    const pageParam = searchParams.get('page')
    const sortParam = searchParams.get('sort')
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')

    if (pageParam) setCurrentPage(parseInt(pageParam))
    if (sortParam) setSortBy(sortParam)
    if (minPriceParam || maxPriceParam) {
      const min = parseInt(minPriceParam || String(PRICE_MIN)) || PRICE_MIN
      const max = parseInt(maxPriceParam || String(PRICE_MAX)) || PRICE_MAX
      setPriceRange([min, max])
      setDraftPriceRange([min, max])
    }

    setSelectedFilters(filtersFromUrl)

    // Always fetch products when URL changes (if filterOptions are loaded)
    if (Object.keys(filterOptions).length > 0) {
      fetchProductsFromFilters(filtersFromUrl)
    } else {
      console.log("Hey no calls happening here!")
    }
  }, [searchParams, filterOptions])

  const fetchProductsFromFilters = async (filters: any, isLoadMore = false) => {
    console.log('fetchProductsFromFilters called with filters:', filters)
    console.log('filterOptions available:', filterOptions)

    const apiFilters: any = {
      page: isLoadMore ? currentPage + 1 : 1,
      limit: limit
    }

    // B2B Logic
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        apiFilters.isB2b = parsedData.userRole === 2;
      } catch (error) {
        apiFilters.isB2b = false;
      }
    } else {
      apiFilters.isB2b = false;
    }

    // Read from URL params directly instead of state
    const searchParam = searchParams.get('search')
    if (searchParam) {
      apiFilters.search = searchParam
    }

    const categoryIdParam = searchParams.get('categoryId')
    if (categoryIdParam) {
      apiFilters.categoryId = [parseInt(categoryIdParam)]
    }

    const subcategoryIdParam = searchParams.get('subcategoryId')
    if (subcategoryIdParam) {
      apiFilters.subcategoryId = [parseInt(subcategoryIdParam)]
    }

    // Read price range from URL params
    const minPriceParam = searchParams.get('minPrice')
    const maxPriceParam = searchParams.get('maxPrice')
    if (minPriceParam) {
      apiFilters.minPrice = parseInt(minPriceParam)
    }
    if (maxPriceParam) {
      apiFilters.maxPrice = parseInt(maxPriceParam)
    }

    // Read sort from URL params
    const sortParam = searchParams.get('sort') || 'Featured'
    const sortMapping = {
      'Featured': { sortBy: 'createAt', sortOrder: 'DESC' },
      'PriceLowToHigh': { sortBy: 'basePrice', sortOrder: 'ASC' },
      'PriceHighToLow': { sortBy: 'basePrice', sortOrder: 'DESC' },
      'Newest': { sortBy: 'createAt', sortOrder: 'DESC' },
      'BestSelling': { sortBy: 'avgRating', sortOrder: 'DESC' },
      'TopRated': { sortBy: 'avgRating', sortOrder: 'DESC' }
    }

    const sortConfig = sortMapping[sortParam as keyof typeof sortMapping] || sortMapping['Featured']
    apiFilters.sortBy = sortConfig.sortBy
    apiFilters.sortOrder = sortConfig.sortOrder

    // Process all filters
    Object.entries(filters).forEach(([category, selections]) => {
      console.log(`Processing category: ${category}, selections:`, selections)
      if (Array.isArray(selections) && selections.length > 0) {
        const apiField = filterConfigs[category]
        console.log(`API field for ${category}:`, apiField)
        if (!apiField) return

        const options = (filterOptions as any)[category]
        console.log(`Options for ${category}:`, options)
        if (options && Array.isArray(options)) {
          const selectedIds = selections.map((selection: string) => {
            const selectedOption = options.find((opt: any) => opt.name === selection)
            console.log(`Mapping ${selection} to:`, selectedOption)
            return selectedOption ? selectedOption.id : null
          }).filter((id: any) => id !== null)

          console.log(`Selected IDs for ${apiField}:`, selectedIds)
          if (selectedIds.length > 0) {
            apiFilters[apiField] = selectedIds
          }
        }
      }
    })

    console.log('Final API Filters being sent:', apiFilters)
    await fetchProducts(apiFilters, isLoadMore)
  }

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loading) return
    fetchProductsFromFilters(selectedFilters, true)
  }, [loadingMore, hasMore, loading, selectedFilters])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading && hasMore) {
          handleLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore, hasMore, loadingMore, loading])

  const loadFilterOptions = async () => {
    try {
      const response = await GetAllConfig()
      if (response?.data.data && Array.isArray(response.data.data)) {
        const options = {}

        // Group configs by ConfigName
        response.data.data.forEach((config: any) => {
          const configName = config.ConfigName

          // Find matching filter category (case-insensitive)
          const category = Object.keys(configNameMapping).find(
            key => configNameMapping[key].toLowerCase() === configName?.toLowerCase()
          )

          if (category) {
            if (!(options as any)[category]) {
              (options as any)[category] = []
            }
            (options as any)[category].push({
              id: config.id,
              name: config.ConfigValue,
              productCount: config.productCount
            })
          }
        })

        setFilterOptions(options)
      }
    } catch (error) {
      console.error('Failed to load filter options:', error)
    }
  }

  const fetchProducts = async (filters = {}, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setCurrentPage(1)
      // Clear products immediately when starting new search
      setProducts([])
    }

    try {
      const response = await GetAllProducts(filters)

      if (response?.data?.data?.products && response.data.data.products.length > 0) {
        const newProducts = response.data.data.products
        const paginationData = response.data.data.pagination

        if (isLoadMore) {
          setProducts(prev => [...prev, ...newProducts])
        } else {
          setProducts(newProducts)
        }

        setPagination(paginationData)
        setTotalProducts(paginationData?.totalProducts || 0)
        setTotalPages(paginationData.totalPages)
        setCurrentPage(paginationData.currentPage)
        setHasMore(paginationData.hasNextPage)
      } else {
        // No products found - clear everything
        if (!isLoadMore) {
          setProducts([])
          setTotalProducts(0)
          setTotalPages(1)
          setPagination(null)
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      if (!isLoadMore) {
        setProducts([])
      }
      setTotalProducts(0)
      setTotalPages(1)
      setPagination(null)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const updateUrlParams = (newFilters: any, page = currentPage, sort = sortBy, minPrice = priceRange[0], maxPrice = priceRange[1]) => {
    const params = new URLSearchParams()

    // Preserve categoryId, categoryName, subcategoryId and subcategoryName
    const currentParams = new URLSearchParams(window.location.search)
    const categoryId = currentParams.get('categoryId')
    const categoryNameParam = currentParams.get('categoryName')
    const subcategoryId = currentParams.get('subcategoryId')
    const subcategoryNameParam = currentParams.get('subcategoryName')
    if (categoryId) params.set('categoryId', categoryId)
    if (categoryNameParam) params.set('categoryName', categoryNameParam)
    if (subcategoryId) params.set('subcategoryId', subcategoryId)
    if (subcategoryNameParam) params.set('subcategoryName', subcategoryNameParam)

    // Add filter parameters
    Object.entries(newFilters).forEach(([category, selections]) => {
      if (Array.isArray(selections) && selections.length > 0) {
        const paramKey = category.toLowerCase().replace(/ /g, '_')
        params.set(paramKey, selections.join(','))
      }
    })

    // Add pagination and sorting parameters
    if (page > 1) params.set('page', page.toString())
    if (sort !== 'Featured') params.set('sort', sort)
    params.set('minPrice', minPrice.toString())
    params.set('maxPrice', maxPrice.toString())

    router.push(`/shop?${params.toString()}`, { scroll: false })
  }

  const handleFilterChange = (category: string, option: string) => {
    const currentSelections = selectedFilters[category] || []
    let newSelections: string[]

    if (option === 'All') {
      newSelections = []
    } else {
      if (currentSelections.includes(option)) {
        newSelections = currentSelections.filter(item => item !== option)
      } else {
        newSelections = [...currentSelections, option]
      }
    }

    const newFilters = { ...selectedFilters, [category]: newSelections }
    setSelectedFilters(newFilters)
    setCurrentPage(1)
    updateUrlParams(newFilters, 1, sortBy, priceRange[0], priceRange[1])
  }

  const toggleCompare = (productId: string) => {
    setCompareList(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateUrlParams(selectedFilters, 1, newSort, priceRange[0], priceRange[1])
  }

  const applyPriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange)
    setDraftPriceRange(newRange)
    setCurrentPage(1)
    setOpenDropdown(null)
    updateUrlParams(selectedFilters, 1, sortBy, newRange[0], newRange[1])
  }

  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
        {/* Elegant Shop Banner */}
        <div className="relative bg-gradient-to-r from-teal-600 to-teal-700 py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                {subcategoryName || categoryName || 'Shop Collection'}
              </h1>
              <p className="text-teal-50 text-base sm:text-lg max-w-2xl mx-auto mb-8">
                {(subcategoryName || categoryName) ? `Discover our exquisite ${(subcategoryName || categoryName).toLowerCase()} pieces` : 'Discover our exquisite jewelry collection'}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 sm:gap-10">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{totalProducts}+</div>
                  <div className="text-xs sm:text-sm text-teal-100">Products</div>
                </div>
                <div className="w-px h-10 bg-teal-400"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
                  <div className="text-xs sm:text-sm text-teal-100">Authentic</div>
                </div>
                <div className="w-px h-10 bg-teal-400"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">4.8★</div>
                  <div className="text-xs sm:text-sm text-teal-100">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-40 shadow-sm hidden md:block">
          <div className="px-4">
            <div className="flex items-center justify-between py-3">
              {/* Filters - Left */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <span className="text-xs font-semibold text-gray-700 mr-2">FILTER:</span>

                {/* Subcategory filter — only when browsing a category */}
                {categorySubcategories.length > 0 && (
                  <button
                    id="subcategory-filter-btn"
                    onClick={() => setOpenDropdown(openDropdown === 'subcategory' ? null : 'subcategory')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 whitespace-nowrap transition-all ${openDropdown === 'subcategory' || searchParams.get('subcategoryId')
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                      }`}
                  >
                    {subcategoryName || 'Subcategory'}
                    <svg className={`w-3 h-3 transition-transform ${openDropdown === 'subcategory' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                )}

                <button
                  id="price-filter-btn"
                  onClick={() => {
                    if (openDropdown === 'price') {
                      setOpenDropdown(null)
                    } else {
                      setDraftPriceRange(priceRange)
                      setOpenDropdown('price')
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 whitespace-nowrap transition-all ${openDropdown === 'price' ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'}`}
                >
                  Price
                  <svg className={`w-3 h-3 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {Object.keys(filterConfigs).map((category) => (
                  <button
                    key={category}
                    id={`${category.toLowerCase().replace(' ', '-')}-filter-btn`}
                    onClick={() => setOpenDropdown(openDropdown === category ? null : category)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border-2 whitespace-nowrap transition-all ${openDropdown === category ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'}`}
                  >
                    {category}
                    <svg className={`w-3 h-3 transition-transform ${openDropdown === category ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                ))}
              </div>
              {/* Right */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-medium">{loading ? 'Loading...' : `${totalProducts} items`}</span>
                <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)} className="text-xs border-2 border-gray-300 px-3 py-1.5 pr-7 bg-white rounded-full font-medium hover:border-teal-400 focus:outline-none focus:border-teal-500">
                  <option value="Featured">Featured</option>
                  <option value="PriceLowToHigh">Price: Low to High</option>
                  <option value="PriceHighToLow">Price: High to Low</option>
                  <option value="Newest">Newest</option>
                  {/* <option value="BestSelling">Best Selling</option> */}
                  {/* <option value="TopRated">Top Rated</option> */}
                </select>
                {(Object.values(selectedFilters).some(s => s?.length) || isPriceFilterActive(priceRange)) && (
                  <button onClick={() => {
                    setPriceRange(resetPriceRange())
                    setDraftPriceRange(resetPriceRange())
                    setSelectedFilters({})
                    setSortBy('Featured')
                    setCurrentPage(1)
                    setSubcategoryName('')
                    updateUrlParams({}, 1, 'Featured', PRICE_MIN, PRICE_MAX)
                  }} className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-full hover:bg-red-50 transition-all">Clear All</button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subcategory dropdown */}
        {openDropdown === 'subcategory' && categorySubcategories.length > 0 && (() => {
          const pos = calculateDropdownPosition('subcategory-filter-btn', 256, Math.min(400, (categorySubcategories.length + 1) * 44))
          const activeSubId = searchParams.get('subcategoryId')
          return (
            <>
              <div className="fixed inset-0 z-40" onClick={closeOverlays} />
              <div
                className="fixed z-50 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
              >
                <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900">Subcategory</h4>
                </div>
                <div className="py-1 max-h-80 overflow-y-auto">
                  {/* All option */}
                  <button
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search)
                      params.delete('subcategoryId')
                      params.delete('subcategoryName')
                      setSubcategoryName('')
                      setExpandedSubcategoryId(null)
                      closeOverlays()
                      router.push(`/shop?${params.toString()}`, { scroll: false })
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${!activeSubId ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    All
                  </button>
                  {categorySubcategories.map((sub: any) => {
                    const kids = subSubcategories[sub.id] || []
                    const isExpanded = expandedSubcategoryId === sub.id
                    const isActive = activeSubId === String(sub.id)
                    return (
                      <div key={sub.id}>
                        <div className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isActive ? 'bg-teal-50' : 'hover:bg-gray-50'
                          }`}>
                          <button
                            className={`flex-1 text-left text-sm ${isActive ? 'text-teal-700 font-semibold' : 'text-gray-700'
                              }`}
                            onClick={() => {
                              const params = new URLSearchParams(window.location.search)
                              params.set('subcategoryId', sub.id)
                              params.set('subcategoryName', sub.name)
                              setSubcategoryName(sub.name)
                              closeOverlays()
                              router.push(`/shop?${params.toString()}`, { scroll: false })
                            }}
                          >
                            {sub.name}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); loadSubSubcategories(sub.id) }}
                            className="ml-2 p-1 rounded hover:bg-gray-200 flex-shrink-0"
                          >
                            <svg className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        {isExpanded && kids.length > 0 && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {kids.map((child: any) => (
                              <button
                                key={child.id}
                                onClick={() => {
                                  const params = new URLSearchParams(window.location.search)
                                  params.set('subcategoryId', child.id)
                                  params.set('subcategoryName', child.name)
                                  setSubcategoryName(child.name)
                                  closeOverlays()
                                  router.push(`/shop?${params.toString()}`, { scroll: false })
                                }}
                                className={`w-full flex items-center gap-2 pl-7 pr-4 py-2 text-sm transition-colors ${activeSubId === String(child.id) ? 'text-teal-700 font-semibold bg-teal-50' : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                                  }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                {child.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )
        })()}

        {/* Dropdown Portals - Enhanced Design matching ProductGrid */}
        {openDropdown === 'price' && (() => {
          const pos = calculateDropdownPosition('price-filter-btn', 320, 200)
          return (
            <>
              <div className="fixed inset-0 z-40" onClick={closeOverlays} />
              <div
                className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
              >
                <div className="p-5">
                  <PriceRangeControl
                    value={draftPriceRange}
                    onChange={setDraftPriceRange}
                    onApply={applyPriceRangeChange}
                    onReset={() => setDraftPriceRange(resetPriceRange())}
                  />
                </div>
              </div>
            </>
          )
        })()}

        {Object.keys(filterConfigs).map((category) => {
          const options = filterOptions[category] || []
          if (openDropdown !== category) return null

          const pos = calculateDropdownPosition(`${category.toLowerCase().replace(' ', '-')}-filter-btn`, 320, Math.min(400, (options.length + 1) * 48))
          return (
            <div key={category}>
              <div className="fixed inset-0 z-40" onClick={closeOverlays} />
              <div
                className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
              >
                <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h4 className="text-base font-bold text-gray-900">{category}</h4>
                  <p className="text-xs text-gray-500 mt-1">{options.length} options available</p>
                </div>
                <div className="py-2 max-h-96 overflow-y-auto">
                  {options.map((option: any) => {
                    const isSelected = selectedFilters[category]?.includes(option.name) || false
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleFilterChange(category, option.name)}
                        className="w-full flex items-center justify-between px-5 py-3 text-left transition-all group hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-50/50"
                      >
                        <span className={`text-sm font-medium ${isSelected ? 'text-teal-700 font-semibold' : 'text-gray-700 group-hover:text-teal-700'}`}>{option.name}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isSelected ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600 group-hover:bg-teal-100 group-hover:text-teal-700'}`}>{option.productCount || 0}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {/* Mobile Filter Buttons - Fixed Bottom */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="flex gap-3 p-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span className="font-medium text-sm">Filters</span>
              {(() => {
                const activeFiltersCount = Object.values(selectedFilters).reduce((count, selections) =>
                  count + (selections ? selections.length : 0), 0
                ) + (isPriceFilterActive(priceRange) ? 1 : 0)
                return activeFiltersCount > 0 ? (
                  <span className="bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                ) : null
              })()}
            </button>

            <button
              onClick={() => setOpenDropdown(openDropdown === 'mobile-sort' ? null : 'mobile-sort')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h9m-9 5h18" />
              </svg>
              <span className="font-medium text-sm">Sort</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Panel - Bottom Sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0  bg-opacity-20" onClick={closeOverlays}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
              <div className="flex-shrink-0 p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={closeOverlays}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Mobile subcategory filter */}
                {categorySubcategories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Subcategory</h4>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(window.location.search)
                          params.delete('subcategoryId')
                          params.delete('subcategoryName')
                          setSubcategoryName('')
                          router.push(`/shop?${params.toString()}`, { scroll: false })
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors ${!searchParams.get('subcategoryId') ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                          }`}
                      >
                        All
                      </button>
                      {categorySubcategories.map((sub: any) => {
                        const kids = subSubcategories[sub.id] || []
                        const isExpanded = expandedSubcategoryId === sub.id
                        const isActive = searchParams.get('subcategoryId') === String(sub.id)
                        return (
                          <div key={sub.id}>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams(window.location.search)
                                  params.set('subcategoryId', sub.id)
                                  params.set('subcategoryName', sub.name)
                                  setSubcategoryName(sub.name)
                                  router.push(`/shop?${params.toString()}`, { scroll: false })
                                }}
                                className={`flex-1 text-left px-3 py-2 text-sm rounded-lg border transition-colors ${isActive ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                                  }`}
                              >
                                {sub.name}
                              </button>
                              <button
                                onClick={() => loadSubSubcategories(sub.id)}
                                className="p-2 rounded-lg border border-gray-300 hover:border-teal-300 bg-white"
                              >
                                <svg className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                            {isExpanded && kids.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {kids.map((child: any) => (
                                  <button
                                    key={child.id}
                                    onClick={() => {
                                      const params = new URLSearchParams(window.location.search)
                                      params.set('subcategoryId', child.id)
                                      params.set('subcategoryName', child.name)
                                      setSubcategoryName(child.name)
                                      router.push(`/shop?${params.toString()}`, { scroll: false })
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${searchParams.get('subcategoryId') === String(child.id) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-300'
                                      }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                    {child.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <PriceRangeControl
                  value={draftPriceRange}
                  onChange={setDraftPriceRange}
                  onApply={(range) => {
                    applyPriceRangeChange(range)
                    closeOverlays()
                  }}
                  onReset={() => setDraftPriceRange(resetPriceRange())}
                  className="w-full"
                />

                {Object.keys(filterConfigs).map((category) => {
                  const options = filterOptions[category] || []
                  return (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {options.map((option: any) => {
                          const isSelected = selectedFilters[category]?.includes(option.name) || false
                          return (
                            <button
                              key={option.id}
                              onClick={() => handleFilterChange(category, option.name)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${isSelected
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-teal-300'
                                }`}
                            >
                              {option.name} ({option.productCount || 0})
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex-shrink-0 p-4 border-t space-y-3">
                {(Object.values(selectedFilters).some(selections => selections && selections.length > 0) || isPriceFilterActive(priceRange)) && (
                  <button
                    onClick={() => {
                      setPriceRange(resetPriceRange())
                      setDraftPriceRange(resetPriceRange())
                      setSelectedFilters({})
                      setSortBy('Featured')
                      setCurrentPage(1)
                      setSubcategoryName('')
                      updateUrlParams({}, 1, 'Featured', PRICE_MIN, PRICE_MAX)
                    }}
                    className="w-full py-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
                <button
                  onClick={closeOverlays}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sort Panel - Bottom Sheet */}
        {openDropdown === 'mobile-sort' && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0  bg-opacity-20" onClick={closeOverlays}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Sort By</h3>
                  <button
                    onClick={closeOverlays}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>
              </div>

              <div className="p-4 space-y-2">
                {[
                  { value: 'Featured', label: 'Featured' },
                  { value: 'PriceLowToHigh', label: 'Price: Low to High' },
                  { value: 'PriceHighToLow', label: 'Price: High to Low' },
                  { value: 'Newest', label: 'Newest First' },
                  // { value: 'BestSelling', label: 'Best Selling' },
                  // { value: 'TopRated', label: 'Top Rated' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      handleSortChange(option.value)
                      closeOverlays()
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${sortBy === option.value
                      ? 'bg-teal-50 text-teal-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters - Enhanced */}
        {(Object.values(selectedFilters).some(selections => selections && selections.length > 0) || isPriceFilterActive(priceRange) || searchParams.get('search')) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  Active Filters
                </h3>
                <button
                  onClick={() => {
                    setPriceRange(resetPriceRange())
                    setSelectedFilters({})
                    setSortBy('Featured')
                    setCurrentPage(1)
                    setSubcategoryName('')
                    updateUrlParams({}, 1, 'Featured', PRICE_MIN, PRICE_MAX)
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchParams.get('search') && (
                  <div className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm border border-blue-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-medium">Search: "{searchParams.get('search')}"</span>
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.delete('search')
                        router.push(`/shop?${params.toString()}`, { scroll: false })
                      }}
                      className="hover:text-blue-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {(isPriceFilterActive(priceRange)) && (
                  <div className="bg-white text-teal-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm border border-teal-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    <button
                      onClick={() => applyPriceRangeChange(resetPriceRange())}
                      className="hover:text-teal-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {Object.entries(selectedFilters).map(([category, selections]) => {
                  if (!selections || selections.length === 0) return null
                  return selections.map((selection) => (
                    <div key={`${category}-${selection}`} className="bg-white text-teal-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2 shadow-sm border border-teal-200">
                      <span className="font-medium">{category}: {selection}</span>
                      <button
                        onClick={() => {
                          const newSelections = selections.filter(s => s !== selection)
                          const newFilters = { ...selectedFilters, [category]: newSelections }
                          setSelectedFilters(newFilters)
                          updateUrlParams(newFilters, 1, sortBy, priceRange[0], priceRange[1])
                        }}
                        className="hover:text-teal-900 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 py-4 pb-20 md:pb-6">
          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : Array.isArray(products) && products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product, i) => (
                  <div
                    key={product.id}
                    style={{
                      animationDelay: `${i * 50}ms`,
                      animationFillMode: 'both'
                    }}
                    className="animate-fade-up"
                  >
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)}
                      oldPrice={product.discountPrice && parseFloat(product.discountPrice) > 0 ? product.basePrice : undefined}
                      discountPrice={product.discountPrice && parseFloat(product.discountPrice) > 0 ? product.discountPrice : undefined}
                      image={getFirstImageUrl(product) || '/images/placeholder.jpg'}
                      rating={product.avgRating || 0}
                      reviewCount={product.reviewCount || 0}
                      isB2b={product.isB2b}
                      isBoth={product.isBoth}
                      b2bPrice={product.b2bPrice}
                      stockQuantity={product.stockQuantity || 0}
                      description={product.description}
                    />
                  </div>
                ))}
              </div>

              {/* Infinite scroll sentinel and loader */}
              {hasMore && (
                <div className="mt-8">
                  <div ref={sentinelRef} className="h-4" />
                  {loadingMore && (
                    <div className="mt-4">
                      <ProductGridSkeleton count={4} />
                    </div>
                  )}
                  {!loadingMore && (
                    <p className="text-sm text-gray-500 mt-4 text-center">Showing {products.length} products</p>
                  )}
                </div>
              )}

              {/* {!hasMore && products.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-sm text-gray-500">You've reached the end • {products.length} products total</p>
                </div>
              )} */}
            </>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full mb-6">
                  <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">We couldn't find any products matching your criteria. Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setPriceRange(resetPriceRange())
                    setSelectedFilters({})
                    setSortBy('Featured')
                    setCurrentPage(1)
                    setSubcategoryName('')
                    updateUrlParams({}, 1, 'Featured', PRICE_MIN, PRICE_MAX)
                  }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-teal-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </EcommerceLayout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
