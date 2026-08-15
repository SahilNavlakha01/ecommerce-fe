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
        const response = await GetDeliveryEstimate('380051', targetPincode, product?.weight || 0.5)
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
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
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
            <Link href="/products" className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
              Back to Products
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
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Product Images */}
            <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gray-100 shadow-md lg:shadow-lg">
                <div
                  className="relative aspect-square cursor-pointer"

                >
                  <img
                    src={Array.isArray(product.images) && product.images.length > selectedImage && product.images[selectedImage] ? product.images[selectedImage] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f8fafc'/%3E%3Cpath d='M150 175h200v150H150z' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='225' r='15' fill='%23f8fafc'/%3E%3Cpath d='M160 275l40-40 20 20 40-40 80 80v20H160z' fill='%23f8fafc'/%3E%3C/svg%3E"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'%3E%3Crect width='500' height='500' fill='%23f8fafc'/%3E%3Cpath d='M150 175h200v150H150z' fill='%23e2e8f0'/%3E%3Ccircle cx='200' cy='225' r='15' fill='%23f8fafc'/%3E%3Cpath d='M160 275l40-40 20 20 40-40 80 80v20H160z' fill='%23f8fafc'/%3E%3C/svg%3E";
                      target.onerror = null;
                    }}
                  />

                  {/* Wishlist */}
                  <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
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
                      className="bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg hover:bg-white transition-all duration-200"
                    />
                  </div>

                </div>
              </div>

              {/* Thumbnail Images */}
              {Array.isArray(product.images) && product.images.length > 1 && (
                <div className="flex gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-14 h-14 lg:w-20 lg:h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${selectedImage === index
                        ? 'border-teal-500 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
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
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              {/* Breadcrumb */}
              {product.subcategories && product.subcategories.length > 0 && (
                <nav className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                  {(() => {
                    const sub = product.subcategories[0]
                    return (
                      <>
                        <span>{sub.categoryName}</span>
                        {sub.parentSubcategoryName && <><span>›</span><span>{sub.parentSubcategoryName}</span></>}
                        <span>›</span><span className="text-teal-700 font-medium">{sub.name}</span>
                      </>
                    )
                  })()}
                </nav>
              )}

              {/* Title + Stock */}
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight mb-2">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-gray-400">SKU: <span className="text-gray-600 font-medium">{product.skuCode || 'N/A'}</span></span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    product.stockQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {product.availabilityStatus?.length > 0 ? product.availabilityStatus[0].name : (product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock')}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(product.avgRating || 0)) ? 'text-yellow-400 fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{parseFloat(product.avgRating || 0).toFixed(1)} ({product.reviewCount || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-teal-50 to-white border border-teal-100 rounded-xl p-4">
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice
                      ? parseFloat(product.b2bPrice)
                      : parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                    <span className="text-base text-gray-400 line-through">
                      ₹{parseFloat(product.basePrice).toLocaleString('en-IN')}
                    </span>
                  )}
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                    <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                      -{Math.round((parseFloat(product.discountPrice) / parseFloat(product.basePrice)) * 100)}% OFF
                    </span>
                  )}
                </div>
                {product.discountPrice && parseFloat(product.discountPrice) > 0 && !(isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice) && (
                  <p className="text-xs text-green-600 font-medium">You save ₹{parseFloat(product.discountPrice).toLocaleString('en-IN')}</p>
                )}
                {isB2bUser && (product.isB2b || product.isBoth) && product.b2bPrice && (
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mt-1">B2B Professional Price</p>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description || 'This exquisite piece combines traditional craftsmanship with contemporary design.'}
              </p>

              {/* Size Selector */}
              {product.size?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Size:{' '}
                    <span className={`ml-1 ${selectedSize ? 'text-teal-700' : 'text-gray-400'}`}>
                      {selectedSize || 'Select size'}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSize(String(s.name || ''))}
                        className={`px-4 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedSize === String(s.name || '')
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-200 text-gray-700 hover:border-teal-400'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.metalType?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Metal</p>
                    <p className="text-sm font-semibold text-gray-800">{product.metalType[0].name}</p>
                  </div>
                )}
                {product.gender?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">For</p>
                    <p className="text-sm font-semibold text-gray-800">{product.gender[0].name}</p>
                  </div>
                )}
                {product.occasion?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Occasion</p>
                    <p className="text-sm font-semibold text-gray-800">{product.occasion[0].name}</p>
                  </div>
                )}
                {product.stoneSettingType?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Stone</p>
                    <p className="text-sm font-semibold text-gray-800">{product.stoneSettingType[0].name}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Weight</p>
                    <p className="text-sm font-semibold text-gray-800">{product.weight}g</p>
                  </div>
                )}
                {product.purity?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Purity</p>
                    <p className="text-sm font-semibold text-gray-800">{product.purity[0].name}</p>
                  </div>
                )}
                {product.polishType?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Polish</p>
                    <p className="text-sm font-semibold text-gray-800">{product.polishType[0].name}</p>
                  </div>
                )}
                {product.warranty?.length > 0 && (
                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                    <p className="text-[10px] uppercase tracking-wider text-teal-500 mb-0.5">Warranty</p>
                    <p className="text-sm font-semibold text-teal-800">{product.warranty[0].name}</p>
                  </div>
                )}
                {product.gemstoneType?.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Gemstone</p>
                    <p className="text-sm font-semibold text-gray-800">{product.gemstoneType[0].name}</p>
                  </div>
                )}
              </div>

              {/* Quantity & B2B Packages */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-base lg:text-lg font-semibold text-gray-900">Quantity</label>
                    <span className="text-xs lg:text-sm text-teal-600 font-medium bg-teal-50 px-2 lg:px-3 py-1 rounded-full">
                      {product.stockQuantity || 0} in stock
                    </span>
                  </div>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-4 lg:px-5 py-2.5 lg:py-3 hover:bg-gray-50 text-gray-700 font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
                      onBlur={() => {
                        const minQty = (isB2bUser && (product.isB2b || product.isBoth)) ? (product.minQuantity || 1) : 1
                        const maxQty = product.stockQuantity || 1
                        if (quantity < minQty) {
                          setQuantity(minQty)
                          errorToast(`Minimum quantity allowed: ${minQty}`)
                        } else if (quantity > maxQty) {
                          setQuantity(maxQty)
                          errorToast(`Only ${maxQty} units available in stock`)
                        }
                      }}
                      className="w-16 lg:w-24 text-center font-bold text-gray-900 border-x-2 border-gray-200 focus:ring-0 focus:outline-none text-lg bg-transparent"
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
                      className="px-4 lg:px-5 py-2.5 lg:py-3 hover:bg-gray-50 text-gray-700 font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* {isB2bUser && (product.isB2b || product.isBoth) && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <label className="text-base lg:text-lg font-semibold text-gray-900">Add Packages</label>
                        <p className="text-xs text-gray-500">1 Package = {product.minQuantity || 1} units</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-teal-100 rounded-xl w-fit bg-teal-50/30">
                        <button
                          onClick={() => setQuantity(Math.max((product.minQuantity || 1), quantity - (product.minQuantity || 1)))}
                          className="px-4 lg:px-5 py-2.5 lg:py-3 hover:bg-teal-50 text-teal-700 font-bold text-lg transition-colors disabled:opacity-30"
                          disabled={quantity <= (product.minQuantity || 1)}
                        >
                          −
                        </button>
                        <span className="px-5 lg:px-8 py-2.5 lg:py-3 border-x-2 border-teal-100 font-bold text-teal-900 min-w-[60px] lg:min-w-[80px] text-center text-lg">
                          {Math.floor(quantity / (product.minQuantity || 1))} PKG
                        </span>
                        <button
                          onClick={() => {
                            const next = quantity + (product.minQuantity || 1)
                            const maxQty = product.stockQuantity || 1
                            if (next > maxQty) {
                              errorToast(`Only ${maxQty} units available in stock`)
                              return
                            }
                            setQuantity(next)
                          }}
                          disabled={quantity + (product.minQuantity || 1) > (product.stockQuantity || 1)}
                          className="px-4 lg:px-5 py-2.5 lg:py-3 hover:bg-teal-50 text-teal-700 font-bold text-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="flex gap-3">
                {isGuestUser ? (
                  <AddToCartButton
                    productId={product.id}
                    quantity={quantity}
                    existingQuantity={cartItem?.quantity || 0}
                    stockQuantity={product.stockQuantity || 0}
                    selectedSize={selectedSize || undefined}
                    className="flex-1 py-3.5 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
                    disabled={(product.size?.length > 0 && !selectedSize) || (Number(product.stockQuantity || 0) > 0 && ((cartItem?.quantity || 0) + quantity > Number(product.stockQuantity || 0)))}
                  >
                    Add to Cart
                  </AddToCartButton>
                ) : (
                  <button
                    onClick={async () => {
                      const diff = quantity - (cartItem?.quantity || 0)
                      if (diff !== 0) {
                        // Require size selection if product has sizes
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
                          // Error shown by hook
                        }
                      } else {
                        infoToast("Quantity already matches cart")
                      }
                    }}
                    className="flex-1 py-3.5 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
                    disabled={Number(product.stockQuantity || 0) > 0 && ((cartItem?.quantity || 0) + quantity > Number(product.stockQuantity || 0))}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    {cartItem ? 'Update Cart' : 'Add to Cart'}
                  </button>
                )}

              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  <span className="font-medium">Certified</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  <span className="font-medium">Secure Pay</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <span className="font-medium">Premium</span>
                </div>
              </div>

              {/* Delivery Check */}
              {/* <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-4 lg:p-6 shadow-sm">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Check Delivery</h3>
                <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3 lg:px-4 py-2.5 lg:py-3 border-2 border-gray-200 rounded-lg text-sm lg:text-base focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="px-3 lg:px-4 py-2.5 lg:py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-sm lg:text-base whitespace-nowrap"
                  >
                    {loadingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="hidden sm:inline text-sm lg:text-base">Getting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline text-sm lg:text-base">Use Location</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={checkDelivery}
                    className="px-4 lg:px-6 py-2.5 lg:py-3 bg-teal-600 text-white text-sm lg:text-base font-semibold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                  >
                    Check
                  </button>
                </div>
                
                {deliveryInfo && (
                  <div className="mt-4 p-3 lg:p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
                    {deliveryInfo.available ? (
                      <div className="flex items-start gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 lg:mt-1">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-green-600 font-bold text-base lg:text-lg mb-1">
                            Delivery Available!
                          </p>
                          <p className="text-gray-700 font-semibold text-sm lg:text-base">
                            Expected: {deliveryInfo.etd || `${deliveryInfo.deliveryDays} days`}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">
                            {deliveryInfo.cod ? '✓ Cash on Delivery available' : '• Prepaid payment only'}
                          </p>
                          {deliveryInfo.courierName && (
                            <p className="text-xs text-gray-500 mt-1">via {deliveryInfo.courierName}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 lg:gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-red-600 font-bold text-sm lg:text-base">Delivery not available</p>
                          <p className="text-xs lg:text-sm text-gray-600">to pincode {pincode}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">30-day returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Free shipping ₹2500+</span>
                  </div>
                </div>
              </div> */}


            </div>
          </div>


          {/* Reviews */}
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 lg:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Customer Reviews
                </h3>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                      <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-4 lg:p-5 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-700 font-bold text-sm">
                              {review.userName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.userName || 'Anonymous'}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.reviewText && (
                        <p className="text-gray-700 text-sm leading-relaxed ml-13">{review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-gray-500 font-medium">No reviews yet</p>
                  <p className="text-gray-400 text-sm mt-1">Be the first to review this product</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-100">
          <div className="mb-5">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900">You May Also Like</h2>
            <div className="w-12 h-0.5 bg-teal-600 mt-1.5"></div>
          </div>

          {relatedLoading && relatedProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                  >
                    <ProductCard
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
                  </div>
                ))}
              </div>

              {relatedLoadingMore && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mt-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-2xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              )}

              <div ref={sentinelRef} className="h-4" />
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No related products found in this category.</p>
            </div>
          )}
        </section>
      </div>


    </EcommerceLayout>
  )
}
