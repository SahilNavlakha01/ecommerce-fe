"use client"

import { useState, useContext, useEffect } from 'react'
import { useParams } from 'next/navigation'
import EcommerceLayout from '../../EcommerceLayout'
import { CartContext } from '../../providers/CartProvider'
import { WishlistContext } from '../../providers/WishlistProvider'
import { GetSingleProduct, GetDeliveryEstimate, FetchAddresses } from '../../../Services/GetService'
import AddToCartButton from '../../../components/AddToCartButton'
import WishlistButton from '../../../components/WishlistButton'
import { BASE_URL } from '../../../Constant/Api'
import Link from 'next/link'
import { toast } from 'sonner'


export default function ProductDetailPage() {
  const params = useParams()
  const { add } = useContext(CartContext)
  const { toggle: addToWishlist } = useContext(WishlistContext)
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')


  const [selectedMetal, setSelectedMetal] = useState('')
  const [mobileImageFullscreen, setMobileImageFullscreen] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null)
  const [locationPermission, setLocationPermission] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)


  


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

  const fetchUserAddresses = async () => {
    try {
      const response = await FetchAddresses(user.id)
      if (response?.data?.data) {
        setUserAddresses(response.data.data)
        // Auto-check delivery for default address
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
              .map((img: any) => {
                if (typeof img === 'object' && img.imageUrl) {
                  return BASE_URL.replace('/api/', '') + img.imageUrl;
                }
                return typeof img === 'string' ? img : null;
              })
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





  const checkDeliveryForPincode = async (targetPincode: string) => {
    if (targetPincode && targetPincode.length === 6) {
      try {
        const response = await GetDeliveryEstimate('380051', targetPincode, product?.weight || 0.5)
        console.log('Delivery API Response:', response)
        
        // Check if delivery is available from the response
        const deliveryData = response?.data?.data
        
        if (deliveryData && deliveryData.courier_name) {
          // Direct response structure
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
              toast.success(`Location detected in Ahmedabad! Using pincode: 380015`)
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
              toast.success(`Location detected! Pincode: ${pincode}`)
            } else {
              // Show detected city but ask for manual pincode entry
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
              )
              const data = await response.json()
              const city = data.city || data.locality || 'your location'
              toast.error(`Detected ${city}, but couldn't find pincode. Please enter manually.`)
            }
          } catch (error) {
            console.error('Location detection failed:', error)
            toast.error('Failed to get location details')
          } finally {
            setLoadingLocation(false)
          }
        },
        (error) => {
          console.error('Geolocation failed:', error)
          let errorMessage = 'Location access denied'
          switch(error.code) {
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
          toast.error(errorMessage)
          setLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } else {
      toast.error('Geolocation not supported by this browser')
      setLoadingLocation(false)
    }
  }





  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
                <div 
                  className="relative aspect-square cursor-pointer"
                  onClick={() => window.innerWidth < 768 && setMobileImageFullscreen(true)}
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
                  
                  {/* Discount Badge */}
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                        {Math.round((parseFloat(product.discountPrice) / parseFloat(product.basePrice)) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  
                  {/* Wishlist */}
                  <div className="absolute top-4 right-4">
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
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-teal-500 shadow-md' 
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
            <div className="space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    SKU: {product.skuCode || 'N/A'}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{parseFloat(product.basePrice).toFixed(2)}
                  </span>
                  {product.discountPrice && parseFloat(product.discountPrice) > 0 && (
                    <span className="text-xl text-gray-400 line-through">
                      ₹{(parseFloat(product.basePrice) + parseFloat(product.discountPrice)).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {product.discountPrice && parseFloat(product.discountPrice) > 0 && (
                  <div className="text-base font-medium text-teal-600">
                    Save ₹{parseFloat(product.discountPrice).toFixed(2)}
                  </div>
                )}
              </div>

              {/* Product Details */}
              {(product.purity?.length > 0 || product.polishType?.length > 0 || product.warranty?.length > 0) && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {product.polishType && product.polishType.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Polish</p>
                          <p className="font-medium text-gray-900">{product.polishType[0].name}</p>
                        </div>
                      </div>
                    )}
                    {product.warranty && product.warranty.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Warranty</p>
                          <p className="font-medium text-gray-900">{product.warranty[0].name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-gray-900">Quantity</label>
                  <span className="text-sm text-teal-600 font-medium">{product.stockQuantity || 0} available</span>
                </div>
                <div className="flex items-center border-2 border-gray-200 rounded-lg w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    −
                  </button>
                  <span className="px-6 py-3 border-x-2 border-gray-200 font-semibold text-gray-900 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <AddToCartButton 
                  productId={product.id}
                  quantity={quantity}
                  className="py-3 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 bg-teal-600 hover:bg-teal-700 text-white w-1/2"
                />
              
              </div>
              
              {/* Delivery Check */}
              {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Check Delivery</h3>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    disabled={loadingLocation}
                    className="px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
                  >
                    {loadingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="hidden sm:inline">Getting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline">Use Location</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={checkDelivery}
                    className="px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Check
                  </button>
                </div>
                
                {deliveryInfo && (
                  <div className="mt-4 p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
                    {deliveryInfo.available ? (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-600 font-bold text-lg mb-1">
                            Delivery Available!
                          </p>
                          <p className="text-gray-700 font-semibold">
                            Expected delivery: {deliveryInfo.etd || `${deliveryInfo.deliveryDays} days`}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {deliveryInfo.cod ? '✓ Cash on Delivery available' : '• Prepaid payment only'}
                          </p>
                          {deliveryInfo.courierName && (
                            <p className="text-xs text-gray-500 mt-1">via {deliveryInfo.courierName}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-red-600 font-bold">Delivery not available</p>
                          <p className="text-sm text-gray-600">to pincode {pincode}</p>
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

          {/* Product Information */}
          <div className="mt-12 bg-white rounded-xl border border-gray-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {product.description || 'This exquisite piece combines traditional craftsmanship with contemporary design, creating a timeless accessory that complements any style.'}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">SKU</span>
                    <span className="text-gray-900 font-medium">{product.skuCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Weight</span>
                    <span className="text-gray-900 font-medium">{product.weight ? `${product.weight}g` : 'N/A'}</span>
                  </div>
                  {product.metalType && product.metalType.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Metal</span>
                      <span className="text-gray-900 font-medium">{product.metalType[0].name}</span>
                    </div>
                  )}
                  {product.purity && product.purity.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Purity</span>
                      <span className="text-gray-900 font-medium">{product.purity[0].name}</span>
                    </div>
                  )}
                  {product.polishType && product.polishType.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Polish</span>
                      <span className="text-gray-900 font-medium">{product.polishType[0].name}</span>
                    </div>
                  )}
                  {product.warranty && product.warranty.length > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Warranty</span>
                      <span className="text-gray-900 font-medium">{product.warranty[0].name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>





      {/* Mobile Image Fullscreen Modal */}
      {mobileImageFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button 
              onClick={() => setMobileImageFullscreen(false)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-800 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={Array.isArray(product.images) && product.images.length > selectedImage && product.images[selectedImage] ? product.images[selectedImage] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Cpath d='M120 140h160v120H120z' fill='%23d1d5db'/%3E%3Ccircle cx='160' cy='180' r='12' fill='%23f3f4f6'/%3E%3Cpath d='M128 220l32-32 16 16 32-32 64 64v16H128z' fill='%23f3f4f6'/%3E%3C/svg%3E"}
              alt={product.name}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => { 
                const target = e.target as HTMLImageElement;
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Cpath d='M120 140h160v120H120z' fill='%23d1d5db'/%3E%3Ccircle cx='160' cy='180' r='12' fill='%23f3f4f6'/%3E%3Cpath d='M128 220l32-32 16 16 32-32 64 64v16H128z' fill='%23f3f4f6'/%3E%3C/svg%3E";
                target.onerror = null;
              }}
            />
            <div className="flex justify-center mt-4 space-x-2">
              {(Array.isArray(product.images) && product.images.length > 0 ? product.images : [`https://picsum.photos/seed/${product.id}/100/100`]).map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === index 
                      ? 'border-teal-500' 
                      : 'border-gray-300'
                  }`}
                >
                  <img
                    src={image || `https://picsum.photos/seed/${product.id}-${index}/100/100`}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      const fallbackUrl = `https://picsum.photos/seed/${product.id}-${index}/100/100`;
                      if (target.src !== fallbackUrl) {
                        target.src = fallbackUrl;
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </EcommerceLayout>
  )
}2