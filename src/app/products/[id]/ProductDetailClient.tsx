"use client"

import { useState, useContext, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import EcommerceLayout from '../../EcommerceLayout'
import { useCart } from '../../../hooks/useCart'
import { WishlistContext } from '../../providers/WishlistProvider'
import { GetSingleProduct, GetDeliveryEstimate, FetchAddresses, GetAllProducts, GetProductReviews } from '../../../Services/GetService'
import AddToCartButton from '../../../components/AddToCartButton'
import WishlistButton from '../../../components/WishlistButton'
import ProductCard from '../../../app/components/ProductCard'
import { BASE_URL } from '../../../Constant/Api'
import { getImageUrl, getFirstImageUrl } from '../../../utils/imageUtils'
import Link from 'next/link'
import { successToast, errorToast, infoToast } from '../../../utils/toast'


export default function ProductDetailClient() {
  const params = useParams()
  const { items: cartItems, addToCart } = useCart()
  const { toggle: addToWishlist } = useContext(WishlistContext)

  const [isB2bUser, setIsB2bUser] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')

  // Find corresponding cart item to sync quantity
  const cartItem = useMemo(() => {
    return cartItems.find((item: any) => item.productId === parseInt(params.id as string))
  }, [cartItems, params.id])

  // Sync internal quantity with cart items
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity)
    } else if (product) {
      // If not in cart, default to MOQ for B2B or 1 for retail
      const minQty = (isB2bUser && (product.isB2b || product.isBoth)) ? (product.minQuantity || 1) : 1
      setQuantity(minQty)
    }
  }, [cartItem, product, isB2bUser])


  const [selectedMetal, setSelectedMetal] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const [locationPermission, setLocationPermission] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false)
  const [hasMoreRelated, setHasMoreRelated] = useState(true)
  const [totalRelated, setTotalRelated] = useState(0)
  const relatedPageRef = useRef(1)
  const relatedLoadingRef = useRef(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const isGuestUser = !user





  // Get user data from cookie
  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        setUser(parsedData);
        setIsB2bUser(parsedData.userRole === 2);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [])

  // Fetch user addresses
  useEffect(() => {
    if (user?.id) {
      fetchUserAddresses()
    }
  }, [user])

  const checkDeliveryForPincode = async (targetPincode: string) => {
    if (targetPincode && targetPincode.length === 6) {
      try {
        const response = await (GetDeliveryEstimate as any)(targetPincode, product?.weight || 0.5)
        console.log('Delivery API Response:', response)

        const deliveryData = response?.data?.data

        if (deliveryData && deliveryData.courier_name) {
          setDeliveryInfo({
            available: true,
            deliveryDays: deliveryData.estimated_delivery_days,
            courierName: deliveryData.courier_name,
            etd: deliveryData.etd,
            cod: deliveryData.cod_available === true || deliveryData.cod_available === 1
          })
        } else {
          setDeliveryInfo({ available: false })
        }
      } catch (error) {
        console.error('Delivery check failed:', error)
        setDeliveryInfo({ available: false })
      }
    }
  }

  const fetchUserAddresses = async () => {
    try {
      const response = await FetchAddresses(user.id)
      if (response?.data?.data) {
        setUserAddresses(response.data.data)
        const defaultAddress = response.data.data.find((addr: any) => addr.isDefault) || response.data.data[0]
        if (defaultAddress?.postal_code) {
          setPincode(defaultAddress.postal_code)
          checkDeliveryForPincode(defaultAddress.postal_code)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  // Fetch product data and related products
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await GetSingleProduct(params.id)
        console.log('Full API Response:', response)

        // Handle the specific response structure from your API
        let productData = null
        if (response?.data?.status === 200 && response?.data?.data) {
          productData = response.data.data
        } else if (response?.status === 200 && response?.data) {
          productData = response.data
        } else if (response?.data) {
          productData = response.data
        }

        console.log('Extracted product data:', productData)

        if (productData) {
          // Process images to extract URLs and ensure they're valid
          if (productData.images && Array.isArray(productData.images)) {
            productData.images = productData.images
              .map((img: any) => getImageUrl(img))
              .filter(Boolean); // Remove null/undefined values
          } else {
            // Ensure images is always an array
            productData.images = [];
          }

          setProduct(productData)
          // Set default metal if available
          if (productData.metalType && productData.metalType.length > 0) {
            setSelectedMetal(productData.metalType[0].name || '')
          }
          // Set default size if available
          if (productData.size && productData.size.length > 0) {
            setSelectedSize(productData.size[0].name || '')
          }


        } else {
          setError('Product not found')
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  // Fetch related products and reviews
  useEffect(() => {
    if (product?.subcategoryId) {
      relatedPageRef.current = 1
      setHasMoreRelated(true)
      setRelatedProducts([])
      fetchRelatedProducts(product.subcategoryId, product.id, 1, false)
    }
    if (product?.id) {
      fetchReviews()
    }
  }, [product?.id, product?.subcategoryId])

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await GetProductReviews(product.id)
      if (response?.data?.data) {
        setReviews(response.data.data.reviews || [])
        setAvgRating(parseFloat(response.data.data.summary?.avgRating || 0))
        setTotalReviews(response.data.data.summary?.totalReviews || 0)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchRelatedProducts = async (subcategoryId: number, productId: number, page = 1, isLoadMore = false) => {
    if (relatedLoadingRef.current) return
    relatedLoadingRef.current = true

    try {
      if (isLoadMore) setRelatedLoadingMore(true)
      else setRelatedLoading(true)

      const filters: any = { subcategoryId, page, limit: 12, inStock: true }

      const userData = document.cookie.split('; ').find(row => row.startsWith('userData='))?.split('=')[1]
      if (userData) {
        try { filters.isB2b = JSON.parse(decodeURIComponent(userData)).userRole === 2 }
        catch { filters.isB2b = false }
      } else {
        filters.isB2b = false
      }

      const response = await GetAllProducts(filters)
      if (response?.data?.data) {
        const productsData = response.data.data.products || []
        const paginationData = response.data.data.pagination || {}

        const filtered = productsData.filter((p: any) => p.id !== productId)

        if (isLoadMore) {
          setRelatedProducts(prev => [...prev, ...filtered])
        } else {
          setRelatedProducts(filtered)
        }

        relatedPageRef.current = page
        setTotalRelated(paginationData.totalProducts || filtered.length)
        setHasMoreRelated(paginationData.hasNextPage ?? false)
      }
    } catch (error) {
      console.error('Error fetching related products:', error)
    } finally {
      relatedLoadingRef.current = false
      if (isLoadMore) setRelatedLoadingMore(false)
      else setRelatedLoading(false)
    }
  }

  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleLoadMoreRelated = useCallback(() => {
    if (relatedLoadingRef.current || !hasMoreRelated || !product?.subcategoryId) return
    fetchRelatedProducts(product.subcategoryId, product.id, relatedPageRef.current + 1, true)
  }, [hasMoreRelated, product?.subcategoryId, product?.id])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMoreRelated() },
      { threshold: 0.1, rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleLoadMoreRelated])

  // Loading state
  if (loading) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-rose-100 border-t-rose-900 mx-auto mb-4"></div>
            <p className="text-stone-600 text-xs font-semibold uppercase tracking-wider">Loading product details...</p>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <Link href="/shop" className="inline-block bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-md">
              Back to Catalog
            </Link>
          </div>
        </div>
      </EcommerceLayout>
    )
  }







  const checkDelivery = () => {
    checkDeliveryForPincode(pincode)
  }

  const getCurrentLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Location coordinates:', position.coords.latitude, position.coords.longitude)

            // For Ahmedabad coordinates, use a known pincode as fallback
            const lat = position.coords.latitude
            const lng = position.coords.longitude

            // Check if coordinates are in Ahmedabad area (rough bounds)
            if (lat >= 22.9 && lat <= 23.3 && lng >= 72.4 && lng <= 72.7) {
              // Common Ahmedabad pincodes based on area
              const ahmedabadPincodes = {
                'vejalpur': '380051',
                'bopal': '380058',
                'prahlad_nagar': '380015',
                'satellite': '380015',
                'maninagar': '380008',
                'navrangpura': '380009',
                'vastrapur': '380015'
              }

              // Use a default Ahmedabad pincode
              setPincode('380015')
              setLocationPermission(true)
              successToast(`Location detected in Ahmedabad! Using pincode: 380015`)
              setLoadingLocation(false)
              return
            }

            // Try geocoding for other locations
            let pincode = null

            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
              )
              const data = await response.json()
              console.log('Geocoding response:', data)

              // Try different possible fields for pincode
              pincode = data.postcode || data.postalCode || data.zipCode

              // If still no pincode, try to extract from locality info
              if (!pincode && data.localityInfo?.administrative) {
                for (const admin of data.localityInfo.administrative) {
                  if (admin.adminLevel >= 6 && /^\d{6}$/.test(admin.name)) {
                    pincode = admin.name
                    break
                  }
                }
              }
            } catch (e) {
              console.log('Geocoding failed:', e)
            }

            if (pincode && /^\d{6}$/.test(pincode)) {
              setPincode(pincode)
              setLocationPermission(true)
              successToast(`Location detected! Pincode: ${pincode}`)
            } else {
              // Show detected city but ask for manual pincode entry
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
              )
              const data = await response.json()
              const city = data.city || data.locality || 'your location'
              errorToast(`Detected ${city}, but couldn't find pincode. Please enter manually.`)
            }
          } catch (error) {
            console.error('Location detection failed:', error)
            errorToast('Failed to get location details')
          } finally {
            setLoadingLocation(false)
          }
        },
        (error) => {
          console.error('Geolocation failed:', error)
          let errorMessage = 'Location access denied'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          errorToast(errorMessage)
          setLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      errorToast('Geolocation not supported by this browser')
      setLoadingLocation(false)
    }
  }





  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans pb-16">
        
        {/* Top Breadcrumb Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-rose-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-rose-900 transition-colors">Jewellery</Link>
            {product.subcategories && product.subcategories.length > 0 && (
              <>
                <span>/</span>
                <span className="hover:text-rose-900 transition-colors">{product.subcategories[0].categoryName}</span>
                <span>/</span>
                <span className="text-rose-900 font-semibold">{product.subcategories[0].name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-stone-400 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Main Product Hero Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Left: Gallery (Thumbnails + Main Image) */}
            <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-4 lg:sticky lg:top-24 lg:self-start">
              
              {/* Thumbnail Strip */}
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto lg:max-h-[560px] pb-2 lg:pb-0 scrollbar-hide shrink-0">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white cursor-pointer ${
                        selectedImage === index
                          ? 'border-rose-900 ring-2 ring-rose-200/60 shadow-sm scale-105'
                          : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f8fafc'/%3E%3C/svg%3E";
                          target.onerror = null;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Showcase */}
              <div className="flex-1 relative bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-2 group">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50/60">
                  <img
                    src={Array.isArray(product.images) && product.images.length > selectedImage && product.images[selectedImage] ? product.images[selectedImage] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f8fafc'/%3E%3Cpath d='M150 175h200v150H150z' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='225' r='15' fill='%23f8fafc'/%3E%3Cpath d='M160 275l40-40 20 20 40-40 80 80v20H160z' fill='%23f8fafc'/%3E%3C/svg%3E"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f8fafc'/%3E%3Cpath d='M150 175h200v150H150z' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='225' r='15' fill='%23f8fafc'/%3E%3Cpath d='M160 275l40-40 20 20 40-40 80 80v20H160z' fill='%23f8fafc'/%3E%3C/svg%3E";
                      target.onerror = null;
                    }}
                  />

                  {/* Top-Left Discount Badge */}
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-900 to-rose-950 text-amber-200 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      {Math.round((parseFloat(product.discountPrice) / parseFloat(product.basePrice)) * 100)}% OFF
                    </div>
                  )}

                  {/* Top-Right Floating Wishlist */}
                  <div className="absolute top-3 right-3">
                    <WishlistButton
                      productId={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        price: parseFloat(product.basePrice),
                        imageUrl: (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ? product.images[0] : ""
                      }}
                      size="sm"
                      showTooltip={false}
                      className="bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg hover:bg-white rounded-full p-2.5 transition-all"
                    />
                  </div>

                  {/* Bottom-Left Zoom Hint */}
                  <div className="absolute bottom-3 left-3 bg-stone-900/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>🔍</span> Hover to zoom
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Editorial Product Details & Purchase Form */}
            <div className="lg:col-span-5 space-y-5">
              
              {/* Brand Tag & Stock Status */}
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-[0.2em]">
                    NS Collection
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.stockQuantity > 0 ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Product Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-[1.2]">
                  {product.name}
                </h1>
                <p className="text-xs text-stone-400 mt-1.5">SKU: <span className="text-stone-600 font-medium">{product.skuCode || 'NS-JW-01'}</span></p>
              </div>

              {/* Star Rating Strip */}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                  <span className="text-xs font-extrabold text-amber-900">{parseFloat(product.avgRating || 0) > 0 ? parseFloat(product.avgRating).toFixed(1) : '4.8'}</span>
                  <div className="flex text-amber-500 text-xs">★</div>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {product.reviewCount || totalReviews || 18} Verified Customer Reviews
                </span>
              </div>

              {/* Price Banner Card */}
              <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                    ₹{(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice
                      ? parseFloat(product.b2bPrice)
                      : parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                  
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                    <span className="text-base text-stone-400 line-through font-medium">
                      ₹{parseFloat(product.basePrice).toLocaleString('en-IN')}
                    </span>
                  )}

                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                    <span className="text-xs font-bold text-rose-900 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      Save ₹{parseFloat(product.discountPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
                  <span>✓</span> Inclusive of all applicable taxes • Free shipping eligible
                </p>

                {isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice && (
                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">B2B WHOLESALE PRICING</span>
                    <span className="text-xs text-stone-600">MOQ: {product.minQuantity || 1} units</span>
                  </div>
                )}
              </div>

              {/* Size Selector */}
              {product.size?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-800">
                      Select Size
                    </label>
                    <span className="text-xs font-bold text-rose-900">
                      {selectedSize ? `Selected: ${selectedSize}` : 'Please choose a size'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSize(String(s.name || ''))}
                        className={`min-w-[48px] h-10 px-3.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                          selectedSize === String(s.name || '')
                            ? 'border-rose-900 bg-rose-900 text-white shadow-sm scale-105'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-rose-300 hover:bg-rose-50/30'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Specifications Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {product.metalType?.length > 0 && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Metal Plating</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.metalType[0].name}</p>
                  </div>
                )}
                {product.occasion?.length > 0 && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Occasion</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.occasion[0].name}</p>
                  </div>
                )}
                {product.gender?.length > 0 && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Ideal For</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.gender[0].name}</p>
                  </div>
                )}
                {product.stoneSettingType?.length > 0 && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Setting</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.stoneSettingType[0].name}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Net Weight</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.weight}g</p>
                  </div>
                )}
                {product.polishType?.length > 0 && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-2xs">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Polish Finish</p>
                    <p className="text-xs sm:text-sm font-bold text-stone-900 mt-0.5">{product.polishType[0].name}</p>
                  </div>
                )}
              </div>

              {/* Quantity Stepper & Add to Cart Area */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-stone-200 bg-white rounded-xl overflow-hidden h-12">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-full hover:bg-stone-100 text-stone-700 font-bold text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        const minQty = (isB2bUser && (product.isB2b || product.isBoth)) ? (product.minQuantity || 1) : 1
                        const maxQty = product.stockQuantity || 1
                        setQuantity(Math.min(Math.max(val, minQty), maxQty))
                      }}
                      className="w-12 text-center font-bold text-stone-900 border-none focus:ring-0 text-sm bg-transparent outline-none"
                    />
                    <button
                      onClick={() => {
                        const maxQty = product.stockQuantity || 1
                        if (quantity >= maxQty) {
                          errorToast(`Only ${maxQty} units available in stock`)
                          return
                        }
                        setQuantity(quantity + 1)
                      }}
                      disabled={quantity >= (product.stockQuantity || 1)}
                      className="w-10 h-full hover:bg-stone-100 text-stone-700 font-bold text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Primary Add to Cart Button */}
                  <div className="flex-1">
                    {isGuestUser ? (
                      <AddToCartButton
                        productId={product.id}
                        quantity={quantity}
                        existingQuantity={cartItem?.quantity || 0}
                        stockQuantity={product.stockQuantity || 0}
                        selectedSize={selectedSize || undefined}
                        className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        disabled={(product.size?.length > 0 && !selectedSize) || (Number(product.stockQuantity || 0) > 0 && ((cartItem?.quantity || 0) + quantity > Number(product.stockQuantity || 0)))}
                      >
                        Add to Cart
                      </AddToCartButton>
                    ) : (
                      <button
                        onClick={async () => {
                          const diff = quantity - (cartItem?.quantity || 0)
                          if (diff !== 0) {
                            if (product.size?.length > 0 && !selectedSize) {
                              errorToast('Please select a size')
                              return
                            }
                            try {
                              await addToCart(product.id, diff, selectedSize || undefined)
                              successToast(cartItem
                                ? (diff > 0 ? "Cart updated: Quantity increased!" : "Cart updated: Quantity reduced!")
                                : "Item added to cart successfully!"
                              )
                            } catch (err) {
                              // Handled by hook
                            }
                          } else {
                            infoToast("Quantity already matches cart")
                          }
                        }}
                        className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                        disabled={Number(product.stockQuantity || 0) > 0 && ((cartItem?.quantity || 0) + quantity > Number(product.stockQuantity || 0))}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartItem ? 'Update Cart' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Pillars Trust Guarantee Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-200">
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-rose-800 text-base">🚚</span>
                  <span className="text-[11px] font-bold">Pan-India Express</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-amber-700 text-base">💎</span>
                  <span className="text-[11px] font-bold">Anti-Tarnish Polish</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-emerald-700 text-base">🔒</span>
                  <span className="text-[11px] font-bold">100% Safe Checkout</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-rose-800 text-base">⚡</span>
                  <span className="text-[11px] font-bold">COD Available</span>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Information Tabs */}
          <div className="mt-12 bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50/50">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'description'
                    ? 'border-rose-900 text-rose-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                Product Description
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'care'
                    ? 'border-rose-900 text-rose-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                Care & Styling Guide
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  activeTab === 'shipping'
                    ? 'border-rose-900 text-rose-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                Delivery & Returns
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {activeTab === 'description' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-stone-900">About this Jewellery Piece</h3>
                  <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
                    {product.description || 'Designed with meticulous attention to detail, this fashion jewellery piece offers high-end glamour for festive celebrations, weddings, and everyday elevated style.'}
                  </p>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-stone-900">How to Care for Your Fashion Jewellery</h3>
                  <ul className="text-xs sm:text-sm text-stone-600 space-y-2 list-disc list-inside">
                    <li>Keep away from direct perfume sprays, hairsprays, and harsh chemicals.</li>
                    <li>Wipe gently with a soft microfibre cloth after wearing to remove oils and moisture.</li>
                    <li>Store separately in a dry, airtight ziplock pouch to prevent scratches and tarnishing.</li>
                    <li>Avoid wearing while showering, swimming, or working out.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-3">
                  <h3 className="text-lg font-serif font-bold text-stone-900">Shipping & Delivery Information</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    All orders are dispatched within 24–48 hours from our fulfillment hub. Standard delivery timeline is 3–5 business days across India. Cash on Delivery (COD) and all major UPI & card payment options are supported.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-10 bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Customer Reviews</h2>
                <p className="text-xs text-stone-500 mt-0.5">Authentic feedback from verified fashion jewellery buyers</p>
              </div>

              {totalReviews > 0 && (
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-serif font-bold text-stone-900">{avgRating.toFixed(1)}</span>
                  <div className="flex text-amber-500 text-sm">★★★★★</div>
                  <span className="text-xs text-stone-500 ml-1">({totalReviews} reviews)</span>
                </div>
              )}
            </div>

            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-stone-50 rounded-2xl p-4">
                    <div className="h-4 bg-stone-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-stone-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-stone-50/70 border border-stone-200/70 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-900 font-bold flex items-center justify-center text-xs">
                          {review.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{review.userName || 'Verified Buyer'}</p>
                          <div className="flex text-amber-400 text-xs">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {review.reviewText && (
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2 pl-12">
                        {review.reviewText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-stone-500 font-serif text-sm">No reviews yet for this product.</p>
                <p className="text-stone-400 text-xs mt-1">Be the first to order and review!</p>
              </div>
            )}
          </div>

          {/* Related Products Recommendation Grid */}
          <section className="mt-12 pt-8 border-t border-stone-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">You May Also Adore</h2>
                <p className="text-xs text-stone-500 mt-0.5">Complementary designs selected for you</p>
              </div>
              <Link href="/shop" className="text-xs font-bold text-rose-900 hover:text-rose-950 uppercase tracking-wider underline underline-offset-4">
                View All →
              </Link>
            </div>

            {relatedLoading && relatedProducts.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl p-3 border border-stone-200">
                    <div className="bg-stone-200 aspect-square rounded-xl mb-3"></div>
                    <div className="h-3 bg-stone-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {relatedProducts.slice(0, 8).map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    price={parseFloat(p.basePrice) - parseFloat(p.discountPrice || 0)}
                    oldPrice={p.discountPrice && parseFloat(p.discountPrice) > 0 ? p.basePrice : undefined}
                    discountPrice={p.discountPrice}
                    image={getFirstImageUrl(p) || '/images/placeholder.jpg'}
                    rating={p.avgRating || 0}
                    reviewCount={p.reviewCount || 0}
                    isB2b={p.isB2b || ''}
                    isBoth={p.isBoth}
                    b2bPrice={p.b2bPrice}
                    stockQuantity={p.stockQuantity || 0}
                    description={p.description}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-stone-500 text-xs">Explore more designs in our fashion jewellery catalog.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </EcommerceLayout>
  )
}
