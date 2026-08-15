"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ChevronRight, ShoppingBag, MapPin } from 'lucide-react'
import AccountLayout from '../AccountLayout'
import { GetUserOrders } from '../../../Services/GetService.jsx'
import { OrderItemSkeleton } from '../../../components/ui/Skeleton'
import PageTransition from '../../../components/PageTransition'

interface Order {
  id: number
  userId: number
  totalAmount: number
  finalAmount: number
  discount?: number
  couponCode?: string
  codCharges?: number
  isCOD?: boolean
  paymentStatus: string | number
  deliveryStatus: string | number
  invoiceNumber: string
  createdAt: string
  line1: string
  cityId: number
  stateId: number
  postal_code: string
  paymentMethod?: string
  items?: any[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState({ id: '' })
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
    
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        setUser({ id: parsedData.id });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [])

  useEffect(() => {
    if (user.id) {
      fetchOrders()
    }
  }, [user.id])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await GetUserOrders(user.id)
      if (response?.data?.data) {
        setOrders(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const normalizeText = (value: string | number | null | undefined) => String(value ?? '').trim().toLowerCase()

  const getDeliveryStatusMeta = (status: string | number) => {
    const text = normalizeText(status)
    const code = Number(status)

    if (text.includes('delivered') || code === 4) return { label: 'Delivered', className: 'bg-green-100 text-green-700 border-green-200' }
    if (text.includes('cancel') || code === 5) return { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' }
    if (text.includes('out for delivery')) return { label: 'Out For Delivery', className: 'bg-orange-100 text-orange-700 border-orange-200' }
    if (text.includes('shipping') || text.includes('shipped') || text.includes('in transit')) return { label: 'Shipping', className: 'bg-purple-100 text-purple-700 border-purple-200' }
    if (text.includes('assigned')) return { label: 'Assigned', className: 'bg-blue-100 text-blue-700 border-blue-200' }
    if (text.includes('ready for ship')) return { label: 'Ready For Ship', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' }
    if (text.includes('pending') || text.includes('processing') || code === 0 || code === 1 || code === 2 || code === 3) {
      return { label: text.includes('pending') ? 'Pending' : 'Processing', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
    }
    return { label: typeof status === 'string' && status ? status : 'Processing', className: 'bg-gray-100 text-gray-700 border-gray-200' }
  }

  const getStatusText = (status: string | number) => getDeliveryStatusMeta(status).label
  const getStatusColor = (status: string | number) => getDeliveryStatusMeta(status).className

  const getPaymentStatusColor = (status: string | number) => {
    if (typeof status === 'string') {
      const s = status.toLowerCase()
      if (s.includes('paid') || s.includes('b2b')) return 'text-green-600'
      return 'text-orange-600'
    }
    return status === 1 ? 'text-green-600' : 'text-orange-600'
  }

  const getPaymentStatusText = (status: string | number) => {
    if (typeof status === 'string') return status
    return status === 1 ? 'Paid' : 'Pending Payment'
  }

  const handleOrderClick = (orderId: number) => {
    router.push(`/account/orders/${orderId}`)
  }

  return (
    <AccountLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-200/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">My Orders</h1>
                <p className="text-teal-100 text-xs sm:text-sm">
                  {loading ? 'Loading...' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
                </p>
              </div>
            </div>
          </div>
          
          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <OrderItemSkeleton key={i} />
                ))}
              </>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-12 h-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Start exploring our beautiful jewelry collection and place your first order.</p>
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all font-medium shadow-lg inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => handleOrderClick(order.id)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-teal-200 transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                              <Package className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-700 transition-colors">
                                Order #{order.invoiceNumber}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(order.deliveryStatus)}`}>
                            {getStatusText(order.deliveryStatus)}
                          </span>
                        </div>
                        
                        <div className="bg-gradient-to-br from-gray-50 to-stone-50 rounded-xl p-4 mb-4 border border-gray-200">
                          <div className="flex items-start gap-2 text-sm text-gray-700">
                            <MapPin className="w-4 h-4 mt-0.5 text-teal-600 flex-shrink-0" />
                            <p className="flex-1">{order.line1}, {order.postal_code}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{((order as any).finalAmount ?? order.totalAmount).toLocaleString('en-IN')}
                            </p>
                            {Number(order.discount) > 0 && (
                              <p className="text-xs text-green-600 font-medium">
                                Coupon {order.couponCode ? `(${order.couponCode}) ` : ''}applied · Save ₹{Number(order.discount).toLocaleString('en-IN')}
                              </p>
                            )}
                            {order.isCOD && Number(order.codCharges) > 0 ? (
                              <div className="mt-1 space-y-0.5">
                                <p className="text-xs text-green-600 font-medium">₹{Number(order.codCharges).toLocaleString('en-IN')} COD charge paid online</p>
                                <p className="text-xs text-amber-600 font-medium">Pay ₹{(Number((order as any).finalAmount ?? order.totalAmount) - Number(order.codCharges)).toLocaleString('en-IN')} at delivery</p>
                              </div>
                            ) : (
                            <p className={`text-sm font-medium mt-1 ${getPaymentStatusColor(order.paymentStatus)}`}>
                              {getPaymentStatusText(order.paymentMethod ?? order.paymentStatus)}
                            </p>
                          )}
                          </div>
                          <div className="flex items-center text-teal-600 group-hover:text-teal-700 font-medium">
                            <span className="mr-2">View Details</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
