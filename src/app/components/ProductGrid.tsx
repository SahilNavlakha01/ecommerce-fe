"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GetAllProducts, GetAllConfig } from '../../Services/GetService.jsx';
import { BASE_URL } from '../../Constant/Api';
import ProductCard from './ProductCard';
import { ProductGridSkeleton, FilterSkeleton } from '../../components/ui/Skeleton';
import { getFirstImageUrl } from '../../utils/imageUtils';
import PriceRangeControl from './PriceRangeControl';
import { filterConfigs, configNameMapping, isPriceFilterActive, resetPriceRange } from './productFilterConfig';
import { filterInStockProducts } from '../../utils/productVisibility';

export default function ProductGrid() {
  const router = useRouter()
  const [sortBy, setSortBy] = useState('Featured')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filterOptions, setFilterOptions] = useState<Record<string, any[]>>({})
  const [priceRange, setPriceRange] = useState<[number, number]>(resetPriceRange())
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>(resetPriceRange())
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [subcategoryName, setSubcategoryName] = useState('')
  const sentinelRef = useRef<HTMLDivElement>(null)
  const limit = 12

  const closeOverlays = useCallback(() => {
    setOpenDropdown(null)
    setShowMobileFilters(false)
  }, [])

  useEffect(() => {
    loadFilterOptions()

    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const subcategoryId = urlParams.get('subcategoryId')
    const subcategoryNameParam = urlParams.get('subcategoryName')

    if (subcategoryNameParam) {
      setSubcategoryName(subcategoryNameParam)
    }

    if (subcategoryId) {
      fetchProducts({ subcategoryId: [parseInt(subcategoryId)] })
    } else {
      fetchProducts()
    }
  }, [])

  useEffect(() => {
    // Navigate to shop page with filters instead of filtering in place
    if (Object.values(selectedFilters).some(s => s?.length) || isPriceFilterActive(priceRange) || sortBy !== 'Featured') {
      navigateToShopWithFilters()
    }
  }, [selectedFilters, priceRange, sortBy])

  useEffect(() => {
    if (openDropdown === 'price' || showMobileFilters) {
      setDraftPriceRange(priceRange)
    }
  }, [openDropdown, showMobileFilters, priceRange])

const FALLBACK_FILTER_OPTIONS: Record<string, { id: string | number; name: string; productCount?: number }[]> = {
  'Metal Type': [
    { id: 'gold-plated', name: 'Gold Plated' },
    { id: 'silver-finish', name: 'Silver Finish' },
    { id: 'rose-gold', name: 'Rose Gold' },
    { id: 'brass-alloy', name: 'Brass / Alloy' },
    { id: 'oxidised-silver', name: 'Oxidised Silver' },
  ],
  'Gender': [
    { id: 'women', name: 'Women' },
    { id: 'unisex', name: 'Unisex' },
    { id: 'men', name: 'Men' },
    { id: 'girls', name: 'Girls' },
  ],
  'Occasion': [
    { id: 'daily-wear', name: 'Daily Wear' },
    { id: 'party-wear', name: 'Party & Casual' },
    { id: 'festive', name: 'Festive & Wedding' },
    { id: 'office', name: 'Work / Office' },
  ],
}

  const loadFilterOptions = async () => {
    try {
      const response = await GetAllConfig()
      const options: Record<string, any[]> = { ...FALLBACK_FILTER_OPTIONS }

      if (response?.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((config: any) => {
          const configName = (config.ConfigName || '').toLowerCase()
          const category = Object.keys(configNameMapping).find(
            key => configNameMapping[key]?.toLowerCase() === configName || key.toLowerCase() === configName
          )

          if (category && config.ConfigValue) {
            if (!options[category] || options[category] === FALLBACK_FILTER_OPTIONS[category]) {
              options[category] = []
            }
            // Avoid duplicates
            if (!options[category].some(o => o.name === config.ConfigValue)) {
              options[category].push({
                id: config.id,
                name: config.ConfigValue,
                productCount: config.productCount
              })
            }
          }
        })
      }

      setFilterOptions(options)
    } catch (error) {
      console.error('Failed to load filter options:', error)
      setFilterOptions(FALLBACK_FILTER_OPTIONS)
    }
  }

  const fetchProducts = async (filters: Record<string, any> = {}, page = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setProducts([])
    }

    try {
      // Build filter object for API
      const apiFilters: Record<string, any> = {
        page,
        limit,
        ...filters
      }

      // Add isB2b filter based on user role
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

      // Add selected filters
      Object.entries(selectedFilters).forEach(([category, selections]) => {
        if (!selections || selections.length === 0) return

        const apiField = filterConfigs[category]
        if (!apiField) return

        const options = filterOptions[category] || []
        const selectedIds = selections
          .map((selection) => options.find((opt) => opt.name === selection)?.id)
          .filter((id): id is number => typeof id === 'number')

        if (selectedIds.length > 0) {
          apiFilters[apiField] = selectedIds
        }
      })

      // Add price range
      apiFilters.minPrice = priceRange[0]
      apiFilters.maxPrice = priceRange[1]

      // Add sort
      if (sortBy && sortBy !== 'Featured') {
        apiFilters.sortBy = sortBy
      }

      const response = await GetAllProducts(apiFilters)

      if (response?.data?.data?.products) {
        const newProducts = response.data.data.products
        const pagination = response.data.data.pagination

        if (append) {
          setProducts(prev => [...prev, ...newProducts])
        } else {
          setProducts(newProducts)
        }

        setHasMore(pagination?.hasNextPage || false)
        setTotalProducts(prev => append ? prev + newProducts.length : newProducts.length)
      } else {
        if (!append) {
          setProducts([])
          setHasMore(false)
          setTotalProducts(0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      if (!append) {
        setProducts([])
        setHasMore(false)
        setTotalProducts(0)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
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

    // Navigate to shop page immediately when filter is applied
    navigateToShopWithFilters(newFilters)
  }

  const navigateToShopWithFilters = (
    filters = selectedFilters,
    price: [number, number] = priceRange
  ) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([category, selections]) => {
      if (selections && selections.length > 0) {
        const paramKey = category.toLowerCase().replace(' ', '_')
        params.set(paramKey, selections.join(','))
      }
    })

    params.set('minPrice', price[0].toString())
    params.set('maxPrice', price[1].toString())

    if (sortBy !== 'Featured') params.set('sort', sortBy)

    router.push(`/shop?${params.toString()}`)
  }

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)

    const filters: any = {}
    const urlParams = new URLSearchParams(window.location.search)
    const subcategoryId = urlParams.get('subcategoryId')
    if (subcategoryId) {
      filters.subcategoryId = [parseInt(subcategoryId)]
    }

    fetchProducts(filters, nextPage, true)
  }, [loadingMore, hasMore, currentPage])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMore() },
      { threshold: 0.1, rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMore])

  const applyPriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange)
    setDraftPriceRange(newRange)
    setCurrentPage(1)
    closeOverlays()
    navigateToShopWithFilters(selectedFilters, newRange)
  }

  const clearAllFilters = () => {
    setPriceRange(resetPriceRange())
    setDraftPriceRange(resetPriceRange())
    setSelectedFilters({})
    setSortBy('Featured')
    setCurrentPage(1)

    // Stay on current page when clearing filters
  }

  return (
    <div>
      {/* Filter Bar */}
      <div className="sticky top-0 bg-[#faf9f6] border-b border-stone-200/80 z-40 shadow-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Filters - Left */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold tracking-widest text-stone-500 uppercase mr-1">FILTER:</span>

              {/* Price Filter */}
              <div className="relative">
                <button
                  type="button"
                  id="price-filter-btn"
                  onClick={() => {
                    if (openDropdown === 'price') {
                      setOpenDropdown(null)
                    } else {
                      setDraftPriceRange(priceRange)
                      setOpenDropdown('price')
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
                    openDropdown === 'price'
                      ? 'bg-rose-900 text-white border-rose-900 shadow-sm'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-rose-400 hover:bg-rose-50/60'
                  }`}
                >
                  Price
                  <svg className={`w-3 h-3 transition-transform ${openDropdown === 'price' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === 'price' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 z-50 w-80 bg-white rounded-xl shadow-2xl border border-stone-200 p-5 animate-in fade-in duration-150">
                      <PriceRangeControl
                        value={draftPriceRange}
                        onChange={setDraftPriceRange}
                        onApply={applyPriceRangeChange}
                        onReset={() => setDraftPriceRange(resetPriceRange())}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Category Dropdowns */}
              {Object.keys(filterConfigs).map((category) => {
                const options = filterOptions[category] || FALLBACK_FILTER_OPTIONS[category] || []
                const isOpen = openDropdown === category

                return (
                  <div key={category} className="relative">
                    <button
                      type="button"
                      id={`${category.toLowerCase().replace(/\s+/g, '-')}-filter-btn`}
                      onClick={() => setOpenDropdown(isOpen ? null : category)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition-all ${
                        isOpen
                          ? 'bg-rose-900 text-white border-rose-900 shadow-sm'
                          : 'border-stone-300 bg-white text-stone-700 hover:border-rose-400 hover:bg-rose-50/60'
                      }`}
                    >
                      {category}
                      <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in duration-150">
                          <div className="p-3 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <span className="text-xs font-bold uppercase tracking-wider text-stone-900">{category}</span>
                            {selectedFilters[category]?.length ? (
                              <button
                                type="button"
                                onClick={() => handleFilterChange(category, '')}
                                className="text-[11px] text-rose-700 hover:text-rose-800 font-semibold"
                              >
                                Reset
                              </button>
                            ) : null}
                          </div>

                          <div className="py-1 max-h-72 overflow-y-auto scrollbar-thin-professional">
                            {options.map((option) => {
                              const isSelected = selectedFilters[category]?.includes(option.name)
                              return (
                                <button
                                  type="button"
                                  key={option.id || option.name}
                                  onClick={() => handleFilterChange(category, option.name)}
                                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors ${
                                    isSelected ? 'bg-rose-50/80 text-rose-900 font-bold' : 'hover:bg-stone-50 text-stone-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                      isSelected ? 'bg-rose-900 border-rose-900 text-white' : 'border-stone-300 bg-white'
                                    }`}>
                                      {isSelected && (
                                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-xs">{option.name}</span>
                                  </div>
                                  {option.productCount !== undefined && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                                      {option.productCount}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-500 font-medium">{loading ? 'Loading...' : `${totalProducts} designs`}</span>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setTimeout(() => navigateToShopWithFilters(), 100); }} className="text-xs border border-stone-300 px-3 py-1.5 pr-7 bg-white rounded-full font-semibold text-stone-800 hover:border-rose-400 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500">
                <option value="Featured">Featured</option>
                <option value="PriceLowToHigh">Price: Low to High</option>
                <option value="PriceHighToLow">Price: High to Low</option>
                <option value="Newest">Newest Drops</option>
              </select>
              {(Object.values(selectedFilters).some(s => s?.length) || isPriceFilterActive(priceRange)) && (
                <button onClick={clearAllFilters} className="text-xs font-bold text-rose-700 hover:text-rose-800 px-3 py-1.5 rounded-full hover:bg-rose-50 transition-all">Clear All</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Buttons - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-xl z-40">
        <div className="flex gap-2.5 p-2.5">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-300 rounded-full bg-white hover:bg-stone-50 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            <span className="font-bold text-xs uppercase tracking-wider text-stone-800">Filters</span>
            {(() => {
              const activeFiltersCount = Object.values(selectedFilters).reduce((count, selections) =>
                count + (selections ? selections.length : 0), 0
              ) + (isPriceFilterActive(priceRange) ? 1 : 0)
              return activeFiltersCount > 0 ? (
                <span className="bg-rose-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              ) : null
            })()}
          </button>

          <button
            onClick={() => setOpenDropdown(openDropdown === 'mobile-sort' ? null : 'mobile-sort')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-300 rounded-full bg-white hover:bg-stone-50 transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h9m-9 5h18" />
            </svg>
            <span className="font-bold text-xs uppercase tracking-wider text-stone-800">Sort</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="min-h-screen bg-white">
        <div className="px-2 sm:px-4 py-3 pb-20 md:pb-4">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {products.map((product, index) => (
                  <ProductCard
                    key={`${product.id ?? 'product'}-${index}`}
                    id={product.id}
                    name={product.name}
                    price={parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)}
                    oldPrice={product.discountPrice && parseFloat(product.discountPrice) > 0 ? product.basePrice : undefined}
                    discountPrice={product.discountPrice}
                    image={getFirstImageUrl(product) || '/images/placeholder.jpg'}
                    rating={product.avgRating || 0}
                    reviewCount={product.reviewCount || 0}
                    isB2b={product.isB2b || ''}
                    isBoth={product.isBoth}
                    b2bPrice={product.b2bPrice}
                    stockQuantity={product.stockQuantity || 0}
                    description={product.description}
                  />
                ))}
              </div>

              {/* Loading skeleton for load more */}
              {loadingMore && (
                <div className="mt-6">
                  <ProductGridSkeleton count={4} />
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-heading mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-4 text-sm font-accent">Try adjusting your filters</p>
              <button onClick={clearAllFilters} className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Panel - Bottom Sheet */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-opacity-20" onClick={closeOverlays}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="flex-shrink-0 p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-heading">Filters</h3>
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
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 font-heading">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {options.map((option) => {
                        const isSelected = selectedFilters[category]?.includes(option.name) || false
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange(category, option.name)}
                            className={`px-3 py-2 rounded-lg border transition-colors ${isSelected
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
                  onClick={clearAllFilters}
                  className="w-full py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
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
          <div className="absolute inset-0 bg-opacity-20" onClick={closeOverlays}></div>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 font-heading">Sort By</h3>
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
                    setSortBy(option.value)
                    closeOverlays()
                    setTimeout(() => navigateToShopWithFilters(), 100)
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
    </div>
  )
}
