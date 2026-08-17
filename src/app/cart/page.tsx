"use client"

import { useState, useMemo, useEffect, useRef, type KeyboardEvent, type ClipboardEvent, type FormEvent } from 'react'
import EcommerceLayout from '../EcommerceLayout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useCart } from '../../hooks/useCart'
import { BASE_URL } from '../../Constant/Api'
import { GetAllProducts, GetCartEstimation, FetchAddresses } from '../../Services/GetService'
import AddToCartButton from '../../components/AddToCartButton'
import { Button } from '../../components/ui/Button'
import { successToast, errorToast } from '../../utils/toast'
import UserAccountBadge from '../../components/ui/UserAccountBadge'
import AccountTypeSelector from '../../components/ui/AccountTypeSelector'
import { cn } from '../../utils/cn'
import ProductCard from '../components/ProductCard'
import { getFirstImageUrl } from '../../utils/imageUtils'
import { SendOtp, VerifyOtp, RegisterWithPhone } from '../../Services/PostService.jsx'
import { setAuthCookie } from '../../utils/auth'
import { migrateGuestCartToServer } from '../../utils/migrateGuestCart'

export default function CartPage() {
  const router = useRouter()
  const { items, totalAmount, totalItems, removeFromCart, addToCart, loading, isGuest, initialFetching, removeGuestItem, updateGuestQty } = useCart()
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const pendingRemovals = useRef<Set<string>>(new Set())
  const [cartEstimation, setCartEstimation] = useState<{
    cartId: number | null
    subtotal?: number
    gstRate?: number
    gstAmount?: number
    shippingCharge?: number | null
    shippingPartner?: string | null
    finalAmount?: number
    itemCount?: number
    addressFound?: boolean
    codCharges?: number
    deliveryEstimate?: {
      b2b_shipping?: boolean
      total_weight_grams?: number
      base_charge?: number
      extra_charge?: number
      per_unit_charge?: number
      cod_available?: boolean
    }
  } | null>(null)
  const B2B_MIN_ORDER = 3000
  const [user, setUser] = useState<any>(null)
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [selectedPincode, setSelectedPincode] = useState('')

  const cartItems = useMemo(
    () => (items || []).filter(item => !pendingRemovals.current.has(String(item.id))),
    [items]
  )
  const optimisticTotalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const isB2bUser = !isGuest && (user?.roleName === 'B2b Customer' || user?.userRole === 2)
  const getEffectiveUnitPrice = (item: any) => {
    const isB2bProduct = item?.isB2b || item?.isBoth
    if (isB2bUser && isB2bProduct && item?.b2bPrice) return Number(item.b2bPrice)
    const basePrice = Number(item?.basePrice || item?.price || 0)
    const discountPrice = Number(item?.discountPrice || 0)
    if (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice) return basePrice - discountPrice
    return basePrice
  }
  const optimisticTotalAmount = useMemo(() => cartItems.reduce((sum, item) => sum + (getEffectiveUnitPrice(item) * item.quantity), 0), [cartItems])

  // Get user data
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
    if (user?.id && !isGuest) {
      fetchUserAddresses()
    }
  }, [user])

  const fetchUserAddresses = async () => {
    try {
      const response = await FetchAddresses(user.id)
      if (response?.data?.data) {
        setUserAddresses(response.data.data)
        const defaultAddress = response.data.data.find((addr: any) => addr.isDefault) || response.data.data[0]
        if (defaultAddress?.postal_code) {
          setSelectedPincode(defaultAddress.postal_code)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  // Fetch cart estimation
  useEffect(() => {
    if (user?.id && optimisticTotalItems > 0 && !isGuest) {
      fetchCartEstimation()
    }
  }, [user?.id, optimisticTotalItems, selectedPincode])

  const fetchCartEstimation = async () => {
    try {
      const response = await GetCartEstimation(user.id, selectedPincode ? selectedPincode : undefined)

      if (response?.data?.data) {
        setCartEstimation(response.data.data)
        return
      }
      // If response shape unexpected, fall through to compute locally
    } catch (error) {
      console.warn('Cart estimation API failed, computing local fallback:', error)
    }

    // Fallback estimation computed from cart items to avoid blocking the user
    try {
      const subtotal = cartItems.reduce((sum, it) => sum + (getEffectiveUnitPrice(it) * Number(it.quantity || 1)), 0)
      const gstRate = 3
      const gstAmount = subtotal * (gstRate / 100)
      const finalAmount = subtotal + gstAmount
      setCartEstimation({ cartId: null, subtotal, gstRate, gstAmount, shippingCharge: null, shippingPartner: null, finalAmount, itemCount: cartItems.length, addressFound: false })
    } catch (fallbackErr) {
      console.error('Error computing fallback cart estimation:', fallbackErr)
    }
  }

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (cartItems.length === 0) return

      try {
        const response = await GetAllProducts({ limit: 200 })
        if (response?.data) {
          // Normalize possible response shapes to an array of products
          let productsData: any = response.data.data ?? response.data

          if (!Array.isArray(productsData)) {
            if (Array.isArray(productsData?.items)) productsData = productsData.items
            else if (Array.isArray(productsData?.products)) productsData = productsData.products
            else if (Array.isArray(response.data)) productsData = response.data
            else productsData = []
          }

          const cartProductIds = cartItems.map(item => item.productId)
          const availableProducts = productsData.filter((product: any) => !cartProductIds.includes(product.id))
          const shuffled = availableProducts.sort(() => 0.5 - Math.random())
          setRecommendedProducts(shuffled.slice(0, 12))
          setProductsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to fetch recommended products:', error)
      }
    }

    fetchRecommendedProducts()
  }, [cartItems.length])

  const calculations = useMemo(() => {
    if (cartEstimation) {
      const discount = appliedPromo ? optimisticTotalAmount * (appliedPromo.discount / 100) : 0
      const baseSubtotal = cartEstimation.subtotal ?? optimisticTotalAmount
      const baseGstAmount = cartEstimation.gstAmount ?? (baseSubtotal * (cartEstimation.gstRate || 3) / 100)
      const baseShipping = cartEstimation.shippingCharge ?? 0
      const baseFinalAmount = baseSubtotal + baseGstAmount + baseShipping
      return {
        subtotal: baseSubtotal,
        gstAmount: baseGstAmount,
        gstRate: cartEstimation.gstRate || 3,
        shippingCost: baseShipping,
        shippingPartner: cartEstimation.shippingPartner,
        discount,
        codCharges: cartEstimation.codCharges || 75,
        finalAmount: baseFinalAmount - discount
      }
    }

    // Fallback to frontend calculation using optimistic values
    const GST_RATE = 3
    const shippingCost = 0
    const discount = appliedPromo ? optimisticTotalAmount * (appliedPromo.discount / 100) : 0
    const gstAmount = optimisticTotalAmount * (GST_RATE / 100)
    const finalAmount = optimisticTotalAmount + gstAmount + shippingCost - discount
    return { subtotal: optimisticTotalAmount, shippingCost, discount, finalAmount, gstAmount, gstRate: GST_RATE, codCharges: 75 }
  }, [cartEstimation, optimisticTotalAmount, appliedPromo])

  const { subtotal, shippingCost, discount, finalAmount, gstAmount, gstRate, shippingPartner, codCharges } = calculations

  const applyPromoCode = () => {
    const validCodes = {
      'SAVE10': { discount: 10, name: 'Save 10%' },
      'WELCOME15': { discount: 15, name: 'Welcome 15%' },
      'LUXURY20': { discount: 20, name: 'Luxury 20%' }
    }

    const code = validCodes[promoCode.toUpperCase() as keyof typeof validCodes]
    if (code) {
      setAppliedPromo({ code: promoCode.toUpperCase(), ...code })
      successToast(`${code.name} applied successfully!`)
    } else {
      errorToast('Invalid promo code')
    }
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode('')
    successToast('Promo code removed')
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map(item => String(item.id)))
    }
  }

  const handleQuantityChange = async (itemId: string, productId: number, newQuantity: number, item: any) => {
    if (newQuantity < 1) return

    if (isGuest) {
      updateGuestQty(productId, newQuantity)
      return
    }

    // Find the original item from Redux state to get the "real" current quantity
    const originalItem = items.find(i => i.id === itemId)
    const currentQuantity = originalItem ? originalItem.quantity : item.quantity

    const isB2bUser = user?.roleName === 'B2b Customer'
    const isB2bProduct = item.isB2b || item.isBoth
    const minQty = item.minQuantity || 1

    // Enforce MOQ for B2B users
    if (isB2bUser && isB2bProduct && newQuantity < minQty) {
      errorToast(`Minimum quantity required: ${minQty}`)
      return
    }

    const quantityDiff = newQuantity - currentQuantity
    if (quantityDiff !== 0) {
      try {
        await addToCart(productId, quantityDiff)
      } catch (error) {
        // Re-catch might be handled by hook, but ensure UI is synced
      }
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    const itemToRemove = items.find(item => String(item.id) === String(itemId))
    pendingRemovals.current.add(String(itemId))
    setSelectedItems(prev => prev.filter(id => id !== itemId))

    if (isGuest) {
      removeGuestItem(itemToRemove?.productId ?? itemId)
      pendingRemovals.current.delete(String(itemId))
      return
    }

    try {
      await removeFromCart(itemId)
    } catch (error) {
      pendingRemovals.current.delete(String(itemId))
      if (itemToRemove) {
        // Redux remains the source of truth; once the thunk fails the item will still be present there.
      }
      errorToast('Failed to remove item')
    } finally {
      pendingRemovals.current.delete(String(itemId))
    }
  }

  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return
    const toRemove = [...selectedItems]
    toRemove.forEach(id => pendingRemovals.current.add(String(id)))
    setSelectedItems([])
    try {
      await Promise.all(toRemove.map(itemId => removeFromCart(itemId)))
      successToast(`${toRemove.length} items removed`)
    } catch (error) {
      errorToast('Failed to remove some items')
    } finally {
      toRemove.forEach(id => pendingRemovals.current.delete(String(id)))
    }
  }

  if (initialFetching) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 animate-pulse space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  if (cartItems.length === 0) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-[#faf9f6]">
          <div className="py-8 lg:py-16">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-xl p-6 lg:p-12 border border-stone-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 lg:w-64 lg:h-64 bg-rose-50 rounded-full -translate-y-16 translate-x-16 lg:-translate-y-32 lg:translate-x-32 opacity-70"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 lg:w-64 lg:h-64 bg-amber-50 rounded-full translate-y-16 -translate-x-16 lg:translate-y-32 lg:-translate-x-32 opacity-70"></div>

                <div className="relative z-10">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-rose-50 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-md">
                    <svg className="w-12 h-12 lg:w-16 lg:h-16 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-stone-900 mb-3 lg:mb-4">Your Cart is Empty</h2>
                  <p className="text-sm lg:text-base text-stone-500 mb-6 lg:mb-8 max-w-md mx-auto">
                    Discover our collection of handcrafted fashion jewellery & accessories
                  </p>
                  <Link href="/shop" className="inline-flex items-center bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-6 py-3 lg:px-8 lg:py-3.5 rounded-full font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all duration-200 shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4 lg:w-5 lg:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Explore Collection</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Header with selection controls */}
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Shopping Cart <span className="text-sm font-normal text-gray-400">({optimisticTotalItems} items)</span></h1>
                    {!isGuest && user && (
                      <UserAccountBadge 
                        userRole={user?.userRole} 
                        roleName={user?.roleName}
                        size="md"
                      />
                    )}
                  </div>
                  {selectedItems.length > 0 && (
                    <Button variant="destructive" size="sm" onClick={handleRemoveSelected}>
                      Remove ({selectedItems.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3 lg:space-y-4">
                {cartItems.map((item, index) => {
                  // Better image handling with fallback
                  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30 35h40v30H30z' fill='%23d1d5db'/%3E%3Ccircle cx='40' cy='45' r='3' fill='%23f3f4f6'/%3E%3Cpath d='M32 55l8-8 4 4 8-8 16 16v4H32z' fill='%23f3f4f6'/%3E%3C/svg%3E"
                  const i = item as any
                  const rawImage = i.imageUrl || i.image || i.productImage || ''
                  const imageUrl = rawImage
                    ? (rawImage.startsWith('http') || rawImage.startsWith('//') ? rawImage : BASE_URL.replace('/api/', '') + rawImage)
                    : placeholderSvg

                  return (
                    <div
                      key={`${item.id}-${item.size}`}
                      className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-200 hover:shadow-md"
                    >
                      <div className="p-4 lg:p-5">
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden bg-gray-50">
                              <img
                                src={imageUrl}
                                alt={item.name || 'Product'}
                                className={`w-full h-full object-cover ${(item.stockQuantity || 0) === 0 ? 'grayscale opacity-60' : ''}`}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = placeholderSvg
                                  target.onerror = null
                                }}
                              />
                              {(item.stockQuantity || 0) === 0 && (
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <span className="text-white text-[9px] font-bold uppercase tracking-wider text-center px-1">Out of Stock</span>
                                </div>
                              )}
                            </div>
                            {item.discount > 0 && (item.stockQuantity || 0) > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                -{item.discount}%
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2">
                            {/* Row 1: name + delete */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(String(item.id))}
                                  onChange={() => toggleSelectItem(String(item.id))}
                                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                                    {item.name || (item as any).productName || 'Product'}
                                  </h3>
                                  {item.description && typeof item.description === 'string' && item.description.trim().length > 0 && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(String(item.id))}
                                className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {/* Row 2: meta tags */}
                            <div className="flex flex-wrap gap-1.5 ml-6">
                              {((item as any).selectedSize || item.size) && (
                                <span className="text-xs bg-rose-50 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-full font-medium">Size: {(item as any).selectedSize || item.size}</span>
                              )}
                              {item.weight && (
                                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">{item.weight}g</span>
                              )}
                              {Number(item.rating) > 0 && (
                                <span className="text-xs text-stone-500 flex items-center gap-0.5">
                                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  {item.rating}
                                </span>
                              )}
                              {(item.isB2b || item.isBoth) && (item.minQuantity || 1) > 1 && (
                                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                  {item.minQuantity} units/pkg
                                </span>
                              )}
                            </div>

                            {/* Row 3: stock warning */}
                            {(item.stockQuantity || 0) === 0 ? (
                              <p className="ml-6 text-red-500 text-xs font-medium flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                Currently unavailable
                              </p>
                            ) : item.quantity > (item.stockQuantity || 0) ? (
                              <p className="ml-6 text-amber-600 text-xs font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Only {item.stockQuantity} left
                              </p>
                            ) : null}

                            {/* Row 4: qty stepper + price */}
                            <div className="flex items-center justify-between mt-auto ml-6">
                              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                <button
                                  onClick={() => handleQuantityChange(String(item.id), Number(item.productId), item.quantity - 1, item)}
                                  disabled={item.quantity <= 1 || (user?.roleName === 'B2b Customer' && (item.isB2b || item.isBoth) && item.quantity <= (item.minQuantity || 1))}
                                  className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-900 select-none">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(String(item.id), Number(item.productId), item.quantity + 1, item)}
                                  disabled={item.quantity >= (item.stockQuantity || 0)}
                                  className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-base sm:text-lg font-bold text-gray-900">
                                  ₹{(getEffectiveUnitPrice(item) * item.quantity).toLocaleString('en-IN')}
                                </p>
                                {!isB2bUser && item.discountPrice > 0 && Number(item.discountPrice) < Number(item.basePrice || item.price || 0) && (
                                  <p className="text-xs text-gray-400 line-through">
                                    ₹{(Number(item.basePrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 lg:sticky lg:top-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6 font-sans">Order Summary</h2>

                {/* Promo Code */}
                {/* <div className="mb-4 lg:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder="Enter code"
                      disabled={!!appliedPromo}
                    />
                    {appliedPromo ? (
                      <Button variant="secondary" onClick={removePromoCode}>
                        Remove
                      </Button>
                    ) : (
                      <Button onClick={applyPromoCode} disabled={!promoCode.trim()}>
                        Apply
                      </Button>
                    )}
                  </div>
                  {appliedPromo && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        ✓ {appliedPromo.code} applied ({appliedPromo.discount}% off)
                      </p>
                    </div>
                  )}
                </div> */}

                {/* Price Breakdown */}
                <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Subtotal ({optimisticTotalItems} items)</span>
                    <span className="font-semibold text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">GST ({gstRate}%)</span>
                    <span className="font-semibold text-sm">₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Shipping{shippingPartner ? ` (${shippingPartner})` : ''}</span>
                    {!cartEstimation?.addressFound ? (
                      <span className="text-xs text-gray-400 italic">No address added</span>
                    ) : shippingCost > 0 ? (
                      <span className="font-semibold text-sm">₹{shippingCost.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="font-semibold text-sm text-green-600">Free</span>
                    )}
                  </div>

                  {/* B2B shipping note */}
                  {cartEstimation?.deliveryEstimate?.b2b_shipping && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-900">
                      <p className="font-semibold">B2B Shipping</p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        First 500g is ₹125. Additional ₹50 per 500g above that.
                      </p>
                      <p className="text-xs text-red-600 mt-1.5 italic font-medium">
                        Additional freight if applicable will be coordinated and collected before dispatch.
                      </p>
                    </div>
                  )}

                  {shippingCost === 0 && subtotal > 1000 && user?.roleName === 'Customer' && (
                    <div className="flex items-center gap-1.5 text-[10px] lg:text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 mb-2">
                      <svg className="w-3 h-3 lg:w-3.5 lg:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Free shipping applied on orders above ₹1,000!
                    </div>
                  )}

                  {subtotal <= 1000 && subtotal > 0 && user?.roleName === 'Customer' && (
                    <div className="text-[10px] lg:text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-md border border-teal-100 mb-2">
                      Add ₹{(1001 - subtotal).toLocaleString('en-IN')} more for free shipping!
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{finalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* B2B Minimum Order Warning */}
                {user?.userRole === 2 && subtotal < B2B_MIN_ORDER && subtotal > 0 && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-stone-900 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-amber-950">You&apos;re almost there</p>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Spend ₹{(B2B_MIN_ORDER - subtotal).toLocaleString('en-IN')} more to reach the ₹3,000 B2B minimum.
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-200">
                        B2B
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-amber-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-700"
                        style={{ width: `${Math.min((subtotal / B2B_MIN_ORDER) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Checkout Buttons */}
                <div className="space-y-3">
                  {isGuest ? (
                    <button onClick={() => setShowGuestModal(true)} className="luxury-btn">
                      Proceed to Checkout
                      <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  ) : (
                    <Link
                      href={user?.userRole === 2 && subtotal < B2B_MIN_ORDER ? '#' : '/checkout'}
                      className={cn(
                        'luxury-btn',
                        user?.userRole === 2 && subtotal < B2B_MIN_ORDER && 'opacity-50 pointer-events-none cursor-not-allowed'
                      )}
                      aria-disabled={user?.userRole === 2 && subtotal < B2B_MIN_ORDER}
                    >
                      Proceed to Checkout
                      <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}

                  <Link href="/shop" className="luxury-btn-secondary">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="mt-6 lg:mt-8 p-4 lg:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2 lg:space-x-3 text-xs lg:text-sm text-gray-700">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <div className="font-semibold">Secure Checkout</div>
                      <div className="text-xs text-gray-600">SSL encrypted & PCI compliant</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Products - Full Width Below */}
          {recommendedProducts.length > 0 && (
            <div className="bg-vanilla-50 rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 mt-8">
              <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">You May Also Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={parseFloat(product.basePrice) - parseFloat(product.discountPrice || 0)}
                    oldPrice={product.discountPrice && parseFloat(product.discountPrice) > 0 ? product.basePrice : undefined}
                    discountPrice={product.discountPrice}
                    image={getFirstImageUrl(product) || '/images/placeholder.jpg'}
                    rating={product.avgRating || 0}
                    reviewCount={product.reviewCount || 0}
                    isB2b={product.isB2b || false}
                    isBoth={product.isBoth}
                    b2bPrice={product.b2bPrice}
                    stockQuantity={product.stockQuantity || 0}
                    description={product.description}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showGuestModal && (
        <GuestCheckoutModal
          onClose={() => setShowGuestModal(false)}
          onSuccess={() => router.push('/checkout')}
        />
      )}
    </EcommerceLayout>
  )
}

function GuestCheckoutModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<'phone' | 'otp' | 'choose'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const otpDigits = otp.padEnd(6, ' ').split('').slice(0, 6)

  const startTimer = () => {
    setTimer(30)
    const interval = setInterval(() => {
      setTimer(prev => { if (prev <= 1) { clearInterval(interval); return 0 } return prev - 1 })
    }, 1000)
  }

  const sendOtp = async () => {
    setLoading(true); setError('')
    try {
      const res = await SendOtp({ contactType: 'mobile', contactValue: phone, isLoginAuth: true, requestSource: 'checkout' })
      if (res.status === 200) { setStep('otp'); startTimer() }
      else setError(res.data?.statusMessage || 'Failed to send OTP')
    } catch (err: any) { setError(err.response?.data?.statusMessage || 'Failed to send OTP') }
    finally { setLoading(false) }
  }

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await VerifyOtp({ contactType: 'mobile', contactValue: phone, otpCode: otp, isLoginAuth: true })
      if (res.status === 200) {
        const { isExist, user, token } = res.data.data
        if (isExist) {
          setAuthCookie(token, user, 'user')
          await migrateGuestCartToServer(user.id)
          onSuccess()
        } else {
          setStep('choose')
        }
      } else setError(res.data?.statusMessage || 'Invalid OTP')
    } catch (err: any) { setError(err.response?.data?.statusMessage || 'Invalid OTP') }
    finally { setLoading(false) }
  }

  const handleChooseType = async (accountType: 'retail' | 'b2b') => {
    setLoading(true)
    setError('')
    try {
      const res = await RegisterWithPhone({ phone, accountType })
      if (res.status === 200 || res.status === 201) {
        const { user, token } = res.data.data
        setAuthCookie(token, user, 'user')
        await migrateGuestCartToServer(user.id)
        onSuccess()
      } else {
        setError(res.data?.statusMessage || 'Registration failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.statusMessage || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const chars = otp.padEnd(6, ' ').split('').slice(0, 6)
    chars[index] = digit || ''
    setOtp(chars.join('').replace(/\s/g, ''))
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index].trim() && index > 0) otpRefs.current[index - 1]?.focus()
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    setOtp(pasted)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200/90 relative animate-fade-up">
        {/* Top Luxury Gradient Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-700 to-rose-950" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-7">
          
          {/* Header with Brand Monogram */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-[0.18em]">
                {step === 'choose' ? 'Final Step' : step === 'otp' ? 'Security Verification' : 'Instant Checkout Access'}
              </span>
            </div>

            <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {step === 'phone' ? 'Login or Sign Up' : step === 'otp' ? 'Enter 6-Digit OTP' : 'Select Account Type'}
            </h2>
            
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              {step === 'phone'
                ? 'Enter your mobile number to securely place your order'
                : step === 'otp'
                  ? `Enter the code sent to +91 ${phone}`
                  : 'Choose how you want to complete your order'}
            </p>
          </div>

          {/* Step 1: Mobile Phone */}
          {step === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); sendOtp() }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex rounded-xl overflow-hidden border border-stone-200 bg-stone-50/70 focus-within:border-rose-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-100 transition-all">
                  <span className="inline-flex items-center px-3.5 bg-stone-100/70 text-xs font-bold text-stone-700 border-r border-stone-200">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    autoFocus
                    className="min-w-0 flex-1 px-4 py-3.5 text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400 placeholder:font-normal bg-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Sending Code...
                  </span>
                ) : (
                  'Get OTP & Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">Verification Code</label>
                  <span className="text-[11px] font-medium text-rose-800">Auto-fill ready</span>
                </div>
                <div onPaste={handlePaste} className="grid grid-cols-6 gap-2">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el }}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit === ' ' ? '' : digit}
                      onChange={e => handleDigitChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      autoFocus={i === 0}
                      className="h-12 sm:h-13 rounded-xl border border-stone-200 text-center text-lg font-bold text-stone-900 focus:border-rose-700 focus:bg-white focus:ring-4 focus:ring-rose-100 outline-none transition bg-stone-50/70"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Proceed'
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp('') }}
                  className="text-stone-500 hover:text-stone-900 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  ← Change number
                </button>
                {timer > 0 ? (
                  <span className="text-stone-400">
                    Resend in <strong className="text-rose-900 font-bold">{timer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="text-rose-900 font-bold hover:underline underline-offset-4 cursor-pointer"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3: Choose Account Type */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-rose-900 flex items-center justify-between">
                <span>Verified: <strong className="font-bold">+91 {phone}</strong></span>
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setError(''); setOtp('') }}
                  className="text-rose-700 underline hover:text-rose-900 font-bold cursor-pointer"
                >
                  Edit
                </button>
              </div>
              
              <AccountTypeSelector 
                onSelect={handleChooseType}
                isLoading={loading}
              />

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Trust Guarantee Footer */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-4 text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cart Items Preserved
            </span>
            <span>•</span>
            <span>256-Bit Encrypted</span>
          </div>

        </div>
      </div>
    </div>
  )
}
