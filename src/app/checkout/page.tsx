"use client"

import { useState, useEffect, useRef, type FormEvent } from 'react'
import EcommerceLayout from '../EcommerceLayout'
import { FetchAddresses, AddAddress, CheckoutOrder, CreateRazorpayOrder, VerifyPayment, ClearCart, CancelPayment, CreateCodChargeOrder, ApplyCoupon, UpdateUser, RegisterWithPhone } from '../../Services/PostService.jsx'

import Link from 'next/link'
import { successToast, errorToast } from '../../utils/toast'
import { GetCartEstimation, FetchCart, GetActiveCoupons } from '../../Services/GetService.jsx'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { BASE_URL } from '../../Constant/Api'
import { cn } from '../../utils/cn'
import { CartItemSkeleton, Skeleton } from '../../components/ui/Skeleton'
import { setAuthCookie } from '../../utils/auth'
import { migrateGuestCartToServer } from '../../utils/migrateGuestCart'

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const dynamic = 'force-dynamic'

interface Address {
  id: number
  line1: string
  line2?: string
  cityName: string
  stateId: string
  postal_code: string
  Addtype: string
  AddType: string
}

interface CartEstimation {
  cartId: number | null
  subtotal: number
  gstRate: number
  gstAmount: number
  addressFound?: boolean
  shippingCharge: number | null
  shippingPartner: string | null
  finalAmount: number
  itemCount: number
  codCharges: number
  isB2bUser?: boolean
  deliveryEstimate?: {
    cod_available?: boolean
    b2b_shipping?: boolean
    total_weight_kg?: number
    base_charge?: number
    extra_kg?: number
    extra_charge?: number
  }
}

interface CartItem {
  id: number
  name: string
  price: number
  basePrice?: number
  b2bPrice?: number
  isB2b?: boolean
  isBoth?: boolean
  subtotal: number | null
  discountPrice: number
  quantity: number
  image: string
  description?: string
  weight?: string
  purity?: string
  size?: string | null
  minQuantity?: number
}

export default function CheckoutPage() {
  const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

  // Guest flow state (phone → choose, no OTP)
  const [guestStep, setGuestStep] = useState<'phone' | 'choose' | 'done'>('phone')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState('')
  const [isGuest, setIsGuest] = useState(true) // assume guest until cookie check confirms otherwise

  const [user, setUser] = useState({ id: '', userRole: 1 })
  const [isB2bUser, setIsB2bUser] = useState(false)
  const [isApproved, setIsApproved] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [cartEstimation, setCartEstimation] = useState<CartEstimation | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const isProcessingRef = useRef(false)
  const [formData, setFormData] = useState({
    Addtype: '1',
    line1: '',
    line2: '',
    cityName: '',
    stateId: '1',
    postal_code: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponApplied, setCouponApplied] = useState(false)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderDetails, setOrderDetails] = useState<{ invoiceNumber: string, orderId: number } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showCodChargeModal, setShowCodChargeModal] = useState(false)
  const [codChargePayment, setCodChargePayment] = useState<{ razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string } | null>(null)
  const [isLoadingCodPayment, setIsLoadingCodPayment] = useState(false)
  const [giftingItemIds, setGiftingItemIds] = useState<number[]>([])
  const [refundPolicyAccepted, setRefundPolicyAccepted] = useState(false)
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([])
  const [showCouponDropdown, setShowCouponDropdown] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const GIFTING_CHARGE = 50
  const B2B_MIN_ORDER = 3000
  const isB2bAccount = isB2bUser || user.userRole === 2 || user.userRole === 3
  const getEffectiveUnitPrice = (item: any) => {
    const isB2bProduct = item?.isB2b || item?.isBoth
    if (isB2bAccount && isB2bProduct && item?.b2bPrice) return Number(item.b2bPrice)
    const basePrice = Number(item?.basePrice || item?.price || 0)
    const discountPrice = Number(item?.discountPrice || 0)
    if (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice) return basePrice - discountPrice
    return basePrice
  }

  const handleGuestPhoneSubmit = (e: FormEvent) => {
    e.preventDefault()
    setGuestError('')
    if (!/^[6-9]\d{9}$/.test(guestPhone)) {
      setGuestError('Please enter a valid 10-digit Indian mobile number')
      return
    }
    setGuestStep('choose')
  }

  const handleGuestChooseType = async (accountType: 'retail' | 'b2b') => {
    setGuestLoading(true); setGuestError('')
    try {
      const res = await RegisterWithPhone({ phone: guestPhone, accountType })
      if (res.status === 200 || res.status === 201) {
        const { user: newUser, token } = res.data.data
        setAuthCookie(token, newUser, 'user')
        await migrateGuestCartToServer(newUser.id)
        setIsGuest(false)
        setUser({ id: newUser.id, userRole: newUser.userRole })
        setIsB2bUser(newUser.userRole === 2)
        if (newUser.userRole === 2) setIsApproved(true)
        setGuestStep('done')
      } else setGuestError(res.data?.statusMessage || 'Registration failed')
    } catch (err: any) { setGuestError(err.response?.data?.statusMessage || 'Registration failed') }
    finally { setGuestLoading(false) }
  }

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=').slice(1).join('=');

    if (!userData) {
      // Guest user — show inline OTP flow, don't redirect
      setIsGuest(true)
      setGuestStep('phone')
      setLoading(false)
      return
    }

    try {
      const parsedData = JSON.parse(decodeURIComponent(userData));
      setUser({
        id: parsedData.id,
        userRole: parsedData.userRole,
      });

      // B2B roleId is 2 based on previous investigation
      const isB2b = parsedData.userRole === 2;
      setIsB2bUser(isB2b);
      setIsGuest(false) // confirmed logged in

      if (isB2b) setIsApproved(true);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setIsGuest(true)
      setGuestStep('phone')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isB2bAccount && selectedPaymentMethod === 'cod') {
      setSelectedPaymentMethod('razorpay')
    }
    // Reset COD charge payment when switching away from COD
    if (selectedPaymentMethod !== 'cod') {
      setCodChargePayment(null)
    }
  }, [isB2bAccount, selectedPaymentMethod])

  // This single effect handles both: initial load for logged-in users AND
  // post-OTP transition when a guest completes verification (guestStep becomes 'done')
  useEffect(() => {
    if (user.id && !isGuest) {
      fetchUserData()
    }
  }, [user.id, isGuest, guestStep])

  useEffect(() => {
    // Determine userType from cookie for coupon filtering
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=').slice(1).join('=')
    let userType = 'retail'
    if (userData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(userData))
        userType = (parsed.userRole === 2 || parsed.userRole === 3) ? 'b2b' : 'retail'
      } catch { }
    }
    GetActiveCoupons(userType)
      .then(res => {
        if (Array.isArray(res?.data?.data)) {
          setAvailableCoupons(res.data.data)
        }
      })
      .catch(() => { })
    // Preload Razorpay script on mount so it's ready when user clicks Place Order
    loadRazorpayScript().catch(() => { })
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Fetch user profile, addresses, and cart estimation ALL in parallel
      const [userRes, addressRes] = await Promise.all([
        import('../../Services/GetService.jsx').then(m => m.GetSingleUser(user.id)).catch(() => null),
        FetchAddresses(user.id).catch(() => null),
      ])

      // Handle user profile
      if (userRes?.data?.data) {
        const userData = userRes.data.data
        const isB2b = userData.userRole === 2
        setIsB2bUser(isB2b)
        setIsApproved(true)
      }

      // Handle addresses
      let deliveryPincode = ''
      if (addressRes?.data?.data?.length) {
        setAddresses(addressRes.data.data)
        const homeAddress = addressRes.data.data.find((addr: Address) => addr.AddType === 'Home')
        const firstAddress = homeAddress || addressRes.data.data[0]
        setSelectedAddress(firstAddress || null)
        setShowAddForm(false)
        deliveryPincode = firstAddress?.postal_code || ''
      } else {
        setShowAddForm(true)
      }

      // Now fetch cart estimation with pincode (after we know the address)
      try {
        const cartRes = deliveryPincode
          ? await GetCartEstimation(user.id, deliveryPincode)
          : await GetCartEstimation(user.id)

        if (cartRes?.data?.data && cartRes.data.data.itemCount > 0) {
          setCartEstimation(cartRes.data.data)
          const itemsRes = await FetchCart(user.id)
          setCartItems(normalizeCartItems(itemsRes))
        } else {
          const itemsRes = await FetchCart(user.id)
          const normalized = normalizeCartItems(itemsRes)
          if (!normalized.length) { window.location.href = '/cart'; return }
          const subtotal = normalized.reduce((s, it) => s + (getEffectiveUnitPrice(it) * it.quantity), 0)
          const gstRate = 3
          const gstAmount = subtotal * (gstRate / 100)
          setCartEstimation({ cartId: null, subtotal, gstRate, gstAmount, shippingCharge: null, shippingPartner: null, finalAmount: subtotal + gstAmount, itemCount: normalized.length, addressFound: false, codCharges: 75 })
          setCartItems(normalized)
        }
      } catch {
        window.location.href = '/cart'
        return
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      errorToast('Failed to load checkout data')
    } finally {
      setLoading(false)
    }
  }

  const normalizeCartItems = (itemsRes: any): CartItem[] => {
    let itemsArray: any[] = []
    if (Array.isArray(itemsRes?.data?.data)) itemsArray = itemsRes.data.data
    else if (Array.isArray(itemsRes?.data)) itemsArray = itemsRes.data
    else if (Array.isArray(itemsRes?.data?.data?.items)) itemsArray = itemsRes.data.data.items
    else if (Array.isArray(itemsRes?.data?.items)) itemsArray = itemsRes.data.items
    else if (Array.isArray(itemsRes?.data?.data?.cart?.items)) itemsArray = itemsRes.data.data.cart.items

    return itemsArray.map((it: any, idx: number) => {
      let image = '/images/placeholder.jpg'
      if (it.imageUrl) image = it.imageUrl.startsWith('http') ? it.imageUrl : BASE_URL.replace('/api/', '') + it.imageUrl
      else if (it.image) image = it.image.startsWith('http') ? it.image : BASE_URL.replace('/api/', '') + it.image
      else if (it.productImage) image = it.productImage.startsWith('http') ? it.productImage : BASE_URL.replace('/api/', '') + it.productImage
      else if (it.product?.imageUrl) image = it.product.imageUrl.startsWith('http') ? it.product.imageUrl : BASE_URL.replace('/api/', '') + it.product.imageUrl
      return {
        id: it.id ?? it.productId ?? it.product?.id ?? idx + 1,
        name: it.name ?? it.productName ?? it.product?.name ?? 'Product',
        price: Number(it.price ?? it.product?.basePrice ?? 0),
        basePrice: Number(it.basePrice ?? it.product?.basePrice ?? it.price ?? 0),
        b2bPrice: Number(it.b2bPrice ?? it.product?.b2bPrice ?? 0),
        isB2b: it.isB2b ?? it.product?.isB2b ?? false,
        isBoth: it.isBoth ?? it.product?.isBoth ?? false,
        subtotal: Number(it.subtotal ?? 0) || null,
        discountPrice: Number(it.discountPrice ?? it.product?.discountPrice ?? 0),
        quantity: Number(it.quantity ?? 1),
        image,
        description: it.description ?? it.product?.description ?? '',
        weight: it.weight ?? it.product?.weight ?? '',
        purity: it.purity ?? it.product?.purity ?? '',
        size: it.selectedSize ?? it.size ?? null
      }
    })
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.line1.trim()) errors.line1 = "Address line 1 is required"
    if (!formData.cityName.trim()) errors.cityName = "City is required"
    if (!formData.postal_code.trim()) errors.postal_code = "PIN code is required"
    else if (!/^\d{6}$/.test(formData.postal_code)) errors.postal_code = "Please enter a valid 6-digit PIN code"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const addressData = {
        ...formData,
        userId: user.id,
        countryId: 1,
        createdBy: user.id
      }
      const response = await AddAddress(addressData)
      if (response?.data) {
        await fetchUserData()
        setShowAddForm(false)
        setFormData({
          Addtype: '1',
          line1: '',
          line2: '',
          cityName: '',
          stateId: '1',
          postal_code: ''
        })
        successToast('Address added successfully')
      }
    } catch (error) {
      console.error('Error adding address:', error)
      errorToast('Failed to add address. Please try again.')
    }
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true)
        return
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existing) {
        // Script tag exists — poll until window.Razorpay is available
        const poll = setInterval(() => {
          if (window.Razorpay) { clearInterval(poll); resolve(true) }
        }, 100)
        setTimeout(() => { clearInterval(poll); resolve(!!window.Razorpay) }, 5000)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePlaceOrder = async (injectedCodPayment?: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string } | null) => {
    if (!selectedAddress || !cartEstimation) {
      errorToast('Please select an address and ensure cart has items')
      return
    }

    // Prevent double-submit — check ref synchronously (useState is async)
    if (isProcessingRef.current) return
    isProcessingRef.current = true
    setIsProcessing(true)

    // Use injected payment data (from modal callback) or existing state
    const activeCodPayment = injectedCodPayment !== undefined ? injectedCodPayment : codChargePayment

    // For COD: require COD charge payment first
    if (selectedPaymentMethod === 'cod' && !activeCodPayment) {
      isProcessingRef.current = false
      setIsProcessing(false)
      setShowCodChargeModal(true)
      return
    }

    // OTP verification removed — phone-registered users have isContactVerified=1 by default.
    // VerifyContactCheckout / VerifyEmailCheckout OTP modal flow is disabled.

    try {
      setIsProcessing(true)

      // 1. Prepare common order data
      const orderData = {
        userId: user.id,
        paymentMethod: selectedPaymentMethod === 'cod' ? 98 : 20,
        addressId: selectedAddress.id,
        couponCode: couponCode || null,
        isCOD: selectedPaymentMethod === 'cod',
        shippingAmount: cartEstimation?.shippingCharge ?? 0,
        shippingPartner: cartEstimation?.shippingPartner || '',
        giftingItemIds,
        // COD charge payment proof
        ...(selectedPaymentMethod === 'cod' && activeCodPayment ? {
          codChargeRazorpayPaymentId: activeCodPayment.razorpayPaymentId,
          codChargeRazorpayOrderId: activeCodPayment.razorpayOrderId,
          codChargeRazorpaySignature: activeCodPayment.razorpaySignature,
        } : {})
      }

      // 2. For Razorpay flow: pre-load script BEFORE creating order so gateway is
      //    guaranteed ready. If it fails we abort before any order is created.
      if (selectedPaymentMethod !== 'cod') {
        if (!RAZORPAY_KEY) {
          throw new Error('Razorpay key is missing. Contact support.')
        }
        const scriptLoaded = await loadRazorpayScript()
        if (!scriptLoaded || !window.Razorpay) {
          throw new Error('Payment gateway failed to load. Please check your internet connection and try again.')
        }
      }

      // 3. Call Checkout API to initialize order
      const orderResponse = await CheckoutOrder(orderData)
      if (!orderResponse?.data) {
        throw new Error('Failed to initialize order')
      }

      const { orderId, razorpayOrderId, invoiceNumber, amount } = orderResponse.data.data

      if (selectedPaymentMethod === 'cod') {
        setOrderDetails({ invoiceNumber, orderId })
        setShowSuccessModal(true)
        isProcessingRef.current = false
        setIsProcessing(false)
        return
      }

      // 4. Open Razorpay — order already created, any failure here must cancel it
      // Safety timeout: if Razorpay closes without firing any callback (edge case), reset after 10 min
      let rzpCallbackFired = false
      const rzpSafetyTimer = setTimeout(() => {
        if (!rzpCallbackFired) {
          isProcessingRef.current = false
          setIsProcessing(false)
        }
      }, 10 * 60 * 1000)

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(amount),
        currency: 'INR',
        name: 'Ethnic Sparkles',
        description: 'Jewelry Purchase',
        image: 'https://ethnicsparkles.com/images/LogoNew.png',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          rzpCallbackFired = true
          clearTimeout(rzpSafetyTimer)
          isProcessingRef.current = false
          setIsProcessing(false)
          setOrderDetails({ invoiceNumber, orderId })
          setShowSuccessModal(true)
          try {
            await ClearCart(cartEstimation?.cartId || null)
          } catch (clearErr) {
            console.warn('Frontend cart clear failed (webhook should handle)', clearErr)
          }
        },
        prefill: {
          name: addresses.find(a => a.id === selectedAddress.id)?.Addtype || 'Customer',
          email: '',
          contact: ''
        },
        theme: { color: '#026670' },
        modal: {
          ondismiss: async function () {
            rzpCallbackFired = true
            clearTimeout(rzpSafetyTimer)
            isProcessingRef.current = false
            setIsProcessing(false)
            setShowCancelModal(true)
            try {
              await CancelPayment({ orderId: orderId, userId: user.id })
            } catch (err) {
              console.error('Failed to notify backend about cancellation:', err)
            }
          }
        }
      }

      try {
        const razorpay = new window.Razorpay(options)
        razorpay.on('payment.failed', function (response: any) {
          rzpCallbackFired = true
          clearTimeout(rzpSafetyTimer)
          isProcessingRef.current = false
          setIsProcessing(false)
          // ondismiss will also fire after this — CancelPayment will be called there
        })
        razorpay.open()
        // isProcessing stays TRUE here — resets in handler/ondismiss/payment.failed
      } catch (rzpErr: any) {
        console.error('Razorpay open failed:', rzpErr)
        rzpCallbackFired = true
        clearTimeout(rzpSafetyTimer)
        isProcessingRef.current = false
        setIsProcessing(false)
        try {
          await CancelPayment({ orderId: orderId, userId: user.id })
        } catch (_) { }
        throw new Error('Payment gateway failed to open. Your order has been cancelled. Please try again.')
      }

    } catch (error: any) {
      console.error('Checkout failed:', error)
      const errorMessage = error.response?.data?.statusMessage || error.message || 'Failed to process checkout. Please try again.';
      errorToast(errorMessage)
      isProcessingRef.current = false
      setIsProcessing(false)
    }
    // Note: for Razorpay flow, isProcessing stays true until ondismiss or handler fires
    // For COD flow, it resets in the try block above via the return
  }

  const applyCoupon = async () => {
    if (!couponInput.trim()) return
    setIsApplyingCoupon(true)
    try {
      const res = await ApplyCoupon({ couponCode: couponInput.trim().toUpperCase(), userId: user.id, cartTotal: derivedSubtotal })
      if (res?.data?.data) {
        const { discountAmount, message } = res.data.data
        setCouponCode(couponInput.trim().toUpperCase())
        setDiscount(Number(discountAmount) || 0)
        setCouponApplied(true)
        successToast(message || 'Coupon applied successfully!')
      } else {
        errorToast(res?.data?.message || res?.data?.statusMessage || 'Invalid coupon code')
        setDiscount(0)
        setCouponApplied(false)
      }
    } catch (err: any) {
      errorToast(err?.response?.data?.message || err?.response?.data?.statusMessage || 'Invalid coupon code')
      setDiscount(0)
      setCouponApplied(false)
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const removeCoupon = () => {
    setCouponCode('')
    setCouponInput('')
    setDiscount(0)
    setCouponApplied(false)
    setShowCouponDropdown(false)
    setShowManualInput(false)
  }

  // Refresh cart estimation when address changes
  const refreshCartEstimation = async (pincode: string) => {
    if (user.id && pincode) {
      try {
        console.log('Refreshing cart estimation with pincode:', pincode)
        const cartRes = await GetCartEstimation(user.id, pincode)
        if (cartRes?.data?.data) {
          setCartEstimation(cartRes.data.data)
          console.log('Updated cart estimation:', cartRes.data.data)
        }
      } catch (error) {
        console.error('Error refreshing cart estimation:', error)
      }
    }
  }

  // Handle address selection with immediate cart estimation refresh
  const handleAddressSelection = (address: Address) => {
    setSelectedAddress(address)
    if (address?.postal_code) {
      refreshCartEstimation(address.postal_code)
    }
  }

  // COD Charge handler
  const handlePayCodCharge = async () => {
    try {
      if (!RAZORPAY_KEY) {
        errorToast('Razorpay key is missing. Restart the dev server after updating .env.local.')
        return
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        errorToast('Payment gateway failed to load')
        return
      }
      if (!window.Razorpay) {
        errorToast('Payment gateway not available. Please try again.')
        return
      }

      setIsLoadingCodPayment(true)

      const res = await CreateCodChargeOrder({ userId: user.id })
      if (!res?.data?.data) throw new Error('Failed to create COD charge order')

      const { razorpayOrderId, codCharges } = res.data.data

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(codCharges * 100),
        currency: 'INR',
        name: 'Ethnic Sparkles',
        description: 'COD Handling Charge',
        image: 'https://ethnicsparkles.com/images/LogoNew.png',
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          const paymentData = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          }
          setCodChargePayment(paymentData)
          setShowCodChargeModal(false)
          setIsLoadingCodPayment(false)
          successToast('COD charge paid! Placing your order...')
          handlePlaceOrder(paymentData)
        },
        theme: { color: '#026670' },
        modal: {
          ondismiss: () => setIsLoadingCodPayment(false)
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error('COD charge payment error:', err)
      errorToast('Failed to initiate COD charge payment')
      setIsLoadingCodPayment(false)
    }
  }

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal) return null
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-up">
          {/* Red top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-orange-400" />
          <div className="p-8 text-center">
            {/* Icon */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Cancelled</h2>
            <p className="text-sm text-gray-500 mb-1">Your payment was not completed.</p>
            <p className="text-sm text-gray-500 mb-6">Your cart items are safe and ready for checkout.</p>
            <div className="space-y-2.5">
              <button
                onClick={() => { setShowCancelModal(false); handlePlaceOrder() }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/cart'}
                className="w-full border border-gray-200 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal || !orderDetails) return null
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-up">
          {/* Green top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-teal-400 to-green-400" />
          <div className="p-8 text-center">
            {/* Animated checkmark */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center">
                <svg className="w-9 h-9 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Order Confirmed!</h2>
            <p className="text-sm text-gray-500 mb-3">Your order has been placed successfully.</p>
            {/* Order ID pill */}
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-6">
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-sm font-semibold text-teal-700">#{orderDetails.invoiceNumber}</span>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => window.location.href = '/account/orders'}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View My Orders
              </button>
              <button
                onClick={() => window.location.href = '/shop'}
                className="w-full border border-gray-200 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const derivedSubtotal = cartEstimation?.subtotal ?? cartItems.reduce((s, it) => s + (getEffectiveUnitPrice(it) * it.quantity), 0)
  const isB2bBelowMinOrder = isB2bAccount && derivedSubtotal < B2B_MIN_ORDER
  const derivedGstRate = cartEstimation?.gstRate ?? 3
  const derivedGstAmount = cartEstimation?.gstAmount ?? (derivedSubtotal * (derivedGstRate / 100))
  const shippingCost = cartEstimation?.shippingCharge ?? 0
  const codCharge = selectedPaymentMethod === 'cod' ? (cartEstimation?.codCharges ?? 75) : 0
  const giftingTotal = giftingItemIds.length * GIFTING_CHARGE
  const derivedFinalAmount = derivedSubtotal + derivedGstAmount + shippingCost + codCharge + giftingTotal

  // Guest who lands on checkout directly (bypassed cart modal) — show minimal inline form
  if (isGuest && guestStep !== 'done') {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-cyan-500" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Verify to checkout</h2>
                  <p className="text-xs text-gray-500">Enter your mobile number</p>
                </div>
              </div>

              {guestStep === 'phone' && (
                <form onSubmit={handleGuestPhoneSubmit} className="space-y-4">
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-sm font-medium text-gray-600">+91</span>
                    <input type="tel" required maxLength={10} value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit number" autoFocus
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                  {guestError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{guestError}</p>}
                  <button type="submit" disabled={guestPhone.length < 10} className="luxury-btn disabled:opacity-60 disabled:transform-none">
                    Continue
                  </button>
                  <Link href="/cart" className="block text-center text-sm text-gray-500 hover:text-teal-600">← Back to cart</Link>
                </form>
              )}

              {guestStep === 'choose' && (
                <div className="space-y-4">
                  <p className="text-sm text-teal-700 bg-teal-50 px-3 py-2 rounded-lg">Mobile: <span className="font-semibold">+91 {guestPhone}</span> <button type="button" onClick={() => { setGuestStep('phone'); setGuestError('') }} className="ml-2 text-xs underline text-teal-600 hover:text-teal-800">Change</button></p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGuestChooseType('retail')}
                      disabled={guestLoading}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-60"
                    >
                      <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-800">Retail</span>
                      <span className="text-xs text-gray-500 text-center">Personal shopping</span>
                    </button>
                    <button
                      onClick={() => handleGuestChooseType('b2b')}
                      disabled={guestLoading}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 rounded-xl transition-all disabled:opacity-60"
                    >
                      <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm font-bold text-gray-800">Business</span>
                      <span className="text-xs text-gray-500 text-center">Wholesale / B2B</span>
                    </button>
                  </div>
                  {guestLoading && <p className="text-sm text-teal-600 text-center">Setting up your account...</p>}
                  {guestError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{guestError}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-64">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  return (
    <>
      <EcommerceLayout>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Address Section */}
                <div className="bg-white rounded-2xl lg:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 lg:px-4 lg:py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 lg:w-7 lg:h-7 bg-teal-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h2 className="text-base lg:text-sm font-bold text-gray-900">Delivery Address</h2>
                    </div>
                    {addresses.length > 0 && !showAddForm && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add New
                      </button>
                    )}
                  </div>

                  <div className="p-5 lg:p-4">
                    {/* Name + B2B fields for users who need them */}
                    {user.id && (() => {
                      const userData = document.cookie.split('; ').find(r => r.startsWith('userData='))?.split('=').slice(1).join('=')
                      const parsedUser = userData ? (() => { try { return JSON.parse(decodeURIComponent(userData)) } catch { return null } })() : null
                      const needsName = parsedUser && (!parsedUser.name || /^\d{10}$/.test(parsedUser.name || ''))
                      if (!needsName && !isB2bUser) return null
                      return (
                        <div className="mb-4 overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-teal-50/40 shadow-sm">
                          <div className="flex items-start gap-3 border-b border-teal-100 px-4 py-4 sm:px-5">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c2.485 0 4.5-2.015 4.5-4.5S14.485 2 12 2 7.5 4.015 7.5 6.5 9.515 11 12 11zM4 22a8 8 0 0116 0" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900">Complete your delivery profile</p>
                              <p className="mt-1 text-xs text-gray-500">
                                We use this name for shipping labels and order updates.
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4 px-4 py-4 sm:px-5">
                            {needsName && (
                              <div className="space-y-2">
                                <label className="block text-xs font-semibold uppercase tracking-wide text-teal-700">Full name</label>
                                <NameUpdateField userId={user.id} />
                              </div>
                            )}
                            {isB2bUser && (
                              <B2BDetailsField userId={user.id} />
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Add Address Form */}
                    {showAddForm ? (
                      <form onSubmit={handleAddAddress} className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address Line 1 *</label>
                            <input
                              type="text" name="line1" value={formData.line1} onChange={handleInputChange}
                              placeholder="House no., Street, Area"
                              className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition", formErrors.line1 ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white')}
                              required
                            />
                            {formErrors.line1 && <p className="text-red-500 text-xs mt-1">{formErrors.line1}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address Line 2 <span className="font-normal text-gray-400">(Optional)</span></label>
                            <input
                              type="text" name="line2" value={formData.line2} onChange={handleInputChange}
                              placeholder="Landmark, Apartment, Floor"
                              className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">City *</label>
                              <input
                                type="text" name="cityName" value={formData.cityName} onChange={handleInputChange}
                                placeholder="City"
                                className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition", formErrors.cityName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white')}
                                required
                              />
                              {formErrors.cityName && <p className="text-red-500 text-xs mt-1">{formErrors.cityName}</p>}
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">PIN Code *</label>
                              <input
                                type="text" name="postal_code" value={formData.postal_code} onChange={handleInputChange}
                                placeholder="6-digit PIN"
                                maxLength={6}
                                className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition", formErrors.postal_code ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white')}
                                required
                              />
                              {formErrors.postal_code && <p className="text-red-500 text-xs mt-1">{formErrors.postal_code}</p>}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                            Save Address
                          </button>
                          {addresses.length > 0 && (
                            <button type="button" onClick={() => setShowAddForm(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-2.5">
                        {addresses.map((address) => {
                          const isSelected = selectedAddress?.id === address.id
                          const typeIcons: Record<string, string> = { Home: '🏠', Work: '🏢', Other: '📍' }
                          const icon = typeIcons[address.AddType] || '📍'
                          return (
                            <label
                              key={address.id}
                              className={cn(
                                "flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                isSelected
                                  ? 'border-teal-500 bg-teal-50/60'
                                  : 'border-gray-100 bg-gray-50/50 hover:border-gray-200 hover:bg-gray-50'
                              )}
                            >
                              {/* Radio */}
                              <div className={cn(
                                "mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                                isSelected ? 'border-teal-500' : 'border-gray-300'
                              )}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                                <input type="radio" name="selectedAddress" checked={isSelected}
                                  onChange={() => handleAddressSelection(address)} className="sr-only" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">{icon}</span>
                                  <span className={cn(
                                    "text-xs font-bold uppercase tracking-wide",
                                    isSelected ? 'text-teal-700' : 'text-gray-500'
                                  )}>{address.AddType || 'Address'}</span>
                                  {isSelected && (
                                    <span className="ml-auto text-[10px] font-bold text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">SELECTED</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-800 leading-snug">
                                  {address.line1}{address.line2 && `, ${address.line2}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">{address.cityName} — {address.postal_code}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">No saved addresses</p>
                        <p className="text-xs text-gray-400 mb-4">Add a delivery address to continue</p>
                        <button onClick={() => setShowAddForm(true)}
                          className="inline-flex items-center gap-2 bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                    <span className="text-sm text-gray-500">{cartItems.length} items</span>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 lg:gap-4 rounded-xl border border-gray-100 p-3 lg:p-4">
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm lg:text-base font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                          {item.description && (
                            <p className="text-xs text-gray-600 line-clamp-1">{item.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            {item.size && <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">Size: {item.size}</span>}
                            {item.weight && <span className="text-xs text-gray-500">• {item.weight}g</span>}
                            {isB2bAccount && (item.minQuantity || 1) > 1 && (
                              <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                                {(item.minQuantity || 1)} units/package
                              </span>
                            )}
                          </div>
                          {/* Gift option */}
                          <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={giftingItemIds.includes(item.id)}
                              onChange={(e) => {
                                setGiftingItemIds(prev =>
                                  e.target.checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                                )
                              }}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-xs text-gray-600">🎁 Gift wrap this item <span className="text-teal-600 font-medium">(+₹{GIFTING_CHARGE})</span></span>
                          </label>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm lg:text-base font-semibold text-gray-900">
                            ₹{(getEffectiveUnitPrice(item) * item.quantity).toLocaleString('en-IN')}
                          </div>
                          {!isB2bAccount && item.discountPrice > 0 && Number(item.discountPrice) < Number(item.basePrice || item.price || 0) && (
                            <div className="text-xs text-gray-400 line-through mt-1">
                              ₹{(Number(item.basePrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={selectedPaymentMethod === 'razorpay'}
                        onChange={() => setSelectedPaymentMethod('razorpay')}
                        className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                          <span className="text-white text-xs font-bold">R</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Razorpay</p>
                          <p className="text-xs text-gray-500">Credit/Debit Cards, UPI, Net Banking</p>
                        </div>
                      </div>
                    </label>

                    {cartEstimation?.deliveryEstimate?.cod_available && !isB2bAccount && (
                      <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={selectedPaymentMethod === 'cod'}
                          onChange={() => setSelectedPaymentMethod('cod')}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                        />
                        <div className="ml-3 flex items-center flex-1">
                          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">₹</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                            {/* <p className="text-xs text-gray-500">Pay when you receive · COD charge ₹{(cartEstimation?.codCharges ?? 75).toLocaleString('en-IN')} paid online</p> */}
                          </div>
                          {selectedPaymentMethod === 'cod' && codChargePayment && (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Fee Paid ✓</span>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>

              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 lg:p-6 sticky top-8">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                    {isB2bAccount && (
                      <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                        B2B
                      </span>
                    )}
                  </div>

                  {cartEstimation ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Items ({cartEstimation?.itemCount ?? cartItems.length})</span>
                        <span className="text-gray-900">₹{derivedSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GST ({derivedGstRate}%)</span>
                        <span className="text-gray-900">₹{derivedGstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Shipping{cartEstimation.shippingPartner ? ` (${cartEstimation.shippingPartner})` : ''}</span>
                        {cartEstimation.shippingCharge === null || !cartEstimation.addressFound ? (
                          <span className="text-xs text-gray-400 italic">No address added</span>
                        ) : cartEstimation.shippingCharge > 0 ? (
                          <span className="text-gray-900">₹{cartEstimation.shippingCharge.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-green-600">Free</span>
                        )}
                      </div>

                      {/* B2B shipping note */}
                      {cartEstimation.deliveryEstimate?.b2b_shipping && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-900">
                          <p className="font-semibold">B2B Shipping</p>
                          <p className="text-xs text-blue-700 mt-0.5">
                            First 500g is ₹{cartEstimation.deliveryEstimate.base_charge}. Additional ₹{cartEstimation.deliveryEstimate.per_unit_charge} per 500g above that.
                          </p>
                          <p className="text-xs text-red-600 mt-1.5 italic font-medium">
                            Additional freight if applicable will be coordinated and collected before dispatch.
                          </p>
                        </div>
                      )}

                      {selectedPaymentMethod === 'cod' && !isB2bAccount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">COD Charge</span>
                          <span className="text-gray-900">₹{(cartEstimation?.codCharges ?? 50).toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {giftingTotal > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">🎁 Gift Wrapping ({giftingItemIds.length} item{giftingItemIds.length > 1 ? 's' : ''})</span>
                          <span className="text-gray-900">₹{giftingTotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Coupon ({couponCode})
                          </span>
                          <span className="text-green-600 font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span className="text-gray-900">Total Payable</span>
                          <span className="text-teal-600">₹{(derivedFinalAmount - discount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Coupon Code - Retail & B2B users */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <p className="text-sm font-semibold text-gray-800">Coupon Code</p>
                          </div>
                          {!couponApplied && availableCoupons.length > 0 && (
                            <button
                              onClick={() => { setShowCouponDropdown(v => !v); setShowManualInput(false) }}
                              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                              View offers
                              <svg className={cn("w-3.5 h-3.5 transition-transform", showCouponDropdown ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {couponApplied ? (
                          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-green-800 font-mono tracking-wider">{couponCode}</p>
                                <p className="text-xs text-green-600">You save ₹{discount.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <button
                              onClick={removeCoupon}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Available coupons dropdown */}
                            {showCouponDropdown && availableCoupons.length > 0 && (
                              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available Offers</p>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
                                  {availableCoupons.map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between px-3 py-3 hover:bg-teal-50 transition-colors group">
                                      <div className="flex-1 min-w-0 mr-3">
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="text-xs font-bold font-mono tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md group-hover:bg-white">
                                            {c.code}
                                          </span>
                                          <span className="text-xs font-semibold text-orange-600">
                                            {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                                          </span>
                                        </div>
                                        {c.description && (
                                          <p className="text-xs text-gray-500 truncate">{c.description}</p>
                                        )}
                                        {c.minOrderValue > 0 && (
                                          <p className="text-xs text-gray-400">Min. order ₹{Number(c.minOrderValue).toLocaleString('en-IN')}</p>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => {
                                          setCouponInput(c.code)
                                          setShowCouponDropdown(false)
                                          setTimeout(() => {
                                            const applyBtn = document.getElementById('apply-coupon-btn')
                                            applyBtn?.click()
                                          }, 50)
                                        }}
                                        className="text-xs font-bold text-teal-600 hover:text-white hover:bg-teal-600 border border-teal-300 hover:border-teal-600 px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                                      >
                                        Apply
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
                                  <button
                                    onClick={() => { setShowManualInput(true); setShowCouponDropdown(false) }}
                                    className="text-xs text-gray-500 hover:text-teal-600 font-medium w-full text-left"
                                  >
                                    + Enter code manually
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Manual input — shown when no dropdown coupons or user chose manual */}
                            {(showManualInput || availableCoupons.length === 0 || (!showCouponDropdown && !showManualInput)) && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={couponInput}
                                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                  onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                                  placeholder="Enter coupon code"
                                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
                                />
                                <button
                                  id="apply-coupon-btn"
                                  onClick={applyCoupon}
                                  disabled={!couponInput.trim() || isApplyingCoupon}
                                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
                                >
                                  {isApplyingCoupon ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                  ) : 'Apply'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isB2bAccount && derivedSubtotal < B2B_MIN_ORDER && (
                        <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 text-sm text-teal-950 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">You&apos;re almost there</p>
                              <p className="text-xs text-teal-700 mt-0.5">
                                Spend ₹{(B2B_MIN_ORDER - derivedSubtotal).toLocaleString('en-IN')} more to unlock B2B checkout.
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-teal-800 border border-teal-200">
                              B2B
                            </span>
                          </div>
                          <div className="mt-3 h-2 rounded-full bg-teal-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                              style={{ width: `${Math.min((derivedSubtotal / B2B_MIN_ORDER) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Refund policy note */}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        By placing an order, you agree to our policy of refunds being issued only as{' '}
                        <a href="/refund" target="_blank" className="font-semibold text-teal-600 hover:underline">store credit (credit note)</a>.
                      </p>

                      <button
                        onClick={() => handlePlaceOrder()}
                        disabled={!selectedAddress || isProcessing || (isB2bAccount && !isApproved) || isB2bBelowMinOrder}
                        className="luxury-btn disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                      >
                        {isProcessing ? (
                          <>
                            <svg className="w-4 h-4 animate-spin flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : isB2bBelowMinOrder ? 'Min Order ₹3,000 Required'
                          : selectedPaymentMethod === 'cod' && !codChargePayment
                            ? `Pay ₹${(cartEstimation?.codCharges ?? 75).toLocaleString('en-IN')} COD Charge & Place Order`
                            : selectedPaymentMethod === 'cod' ? 'Place COD Order'
                              : 'Place Order & Pay'
                        }
                      </button>


                      {!selectedAddress && (
                        <p className="text-xs text-red-500 text-center mt-2">
                          Please select a delivery address
                        </p>
                      )}

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Secure Checkout</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span>Safe Payment</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <LoadingSpinner />
                      <p className="text-gray-600 mt-2">Loading order summary...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COD Charge Modal - inside EcommerceLayout so it mounts stably */}
        {showCodChargeModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-400" />
              <div className="p-7">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 bg-amber-50 rounded-full border-2 border-amber-100">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 text-center mb-1">COD Handling Charge</h2>
                <p className="text-sm text-gray-500 text-center mb-5">A small fee is required to confirm your Cash on Delivery order.</p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Handling Fee</span>
                    <span className="font-semibold text-gray-900">₹{(cartEstimation?.codCharges ?? 75).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-2 flex justify-between text-sm font-bold">
                    <span className="text-gray-800">Amount to Pay Now</span>
                    <span className="text-amber-600">₹{(cartEstimation?.codCharges ?? 75).toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    <span className="font-semibold">Why this charge?</span> This fee covers the handling cost for Cash on Delivery orders and is non-refundable. The remaining order amount (₹{(derivedFinalAmount - discount - (cartEstimation?.codCharges ?? 75)).toLocaleString('en-IN')}) will be collected at delivery.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={handlePayCodCharge}
                    disabled={isLoadingCodPayment}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoadingCodPayment ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Processing...</>
                    ) : (
                      <>Pay ₹{(cartEstimation?.codCharges ?? 75).toLocaleString('en-IN')} &amp; Place Order</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowCodChargeModal(false)}
                    className="w-full border border-gray-200 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </EcommerceLayout>

      <SuccessModal />
      <CancelModal />
      {isProcessing && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
              <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-lg font-bold text-gray-900">Processing your order...</p>
            <p className="text-sm text-gray-500">Please do not close or refresh this page</p>
          </div>
        </div>
      )}
    </>
  )
}

function NameUpdateField({ userId }: { userId: string }) {
  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await UpdateUser({ name: name.trim() }, userId)
      const userData = document.cookie.split('; ').find(r => r.startsWith('userData='))?.split('=').slice(1).join('=')
      if (userData) {
        const parsed = JSON.parse(decodeURIComponent(userData))
        parsed.name = name.trim()
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      setSaved(true)
    } catch { }
    finally { setSaving(false) }
  }

  if (saved) return <p className="text-sm text-green-700 font-medium">✓ Name saved: {name}</p>

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your full name"
        className="flex-1 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      <button
        onClick={save}
        disabled={saving || !name.trim()}
        className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}

function B2BDetailsField({ userId }: { userId: string }) {
  const [form, setForm] = useState({ name: '', companyName: '', gstNumber: '' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await UpdateUser({ name: form.name.trim() }, userId)
      if (form.companyName.trim() || form.gstNumber.trim()) {
        const { BASE_URL } = await import('../../Constant/Api')
        await fetch(`${BASE_URL}users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name.trim(), companyName: form.companyName.trim(), gstNumber: form.gstNumber.trim().toUpperCase() })
        })
      }
      const userData = document.cookie.split('; ').find(r => r.startsWith('userData='))?.split('=').slice(1).join('=')
      if (userData) {
        const parsed = JSON.parse(decodeURIComponent(userData))
        parsed.name = form.name.trim()
        document.cookie = `userData=${encodeURIComponent(JSON.stringify(parsed))}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      setSaved(true)
    } catch { }
    finally { setSaving(false) }
  }

  if (saved) return (
    <div className="text-sm text-green-700 font-medium space-y-0.5">
      <p>✓ Name: {form.name}</p>
      {form.companyName && <p>✓ Business: {form.companyName}</p>}
    </div>
  )

  return (
    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Business account details</p>
        <p className="mt-1 text-xs text-amber-900/70">Add the details that should appear on business orders.</p>
      </div>
      <input
        type="text"
        value={form.name}
        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        placeholder="Your full name *"
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      <input
        type="text"
        value={form.companyName}
        onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
        placeholder="Business / Company name (optional)"
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      <input
        type="text"
        value={form.gstNumber}
        onChange={e => setForm(p => ({ ...p, gstNumber: e.target.value }))}
        placeholder="GST number (optional)"
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 uppercase shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      <button
        onClick={save}
        disabled={saving || !form.name.trim()}
        className="inline-flex w-full items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Details'}
      </button>
    </div>
  )
}
