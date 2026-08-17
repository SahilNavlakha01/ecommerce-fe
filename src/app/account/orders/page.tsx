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
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <Package className="w-7 h-7 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Order History</h1>
                  <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">
                    {loading ? 'Checking your orders...' : `${orders.length} ${orders.length === 1 ? 'order placed' : 'orders placed'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Orders List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <OrderItemSkeleton key={i} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-12 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <ShoppingBag className="w-8 h-8 text-rose-900" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No orders placed yet</h3>
                <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto">
                  Explore our curated fashion jewellery collections and elevate your styling.
                </p>
                <button
                  onClick={() => router.push('/shop')}
                  className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Jewellery
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => handleOrderClick(order.id)}
                    className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-6 hover:shadow-md hover:border-rose-300/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-200/60 group-hover:scale-105 transition-transform flex-shrink-0">
                          <Package className="w-5 h-5 text-rose-900" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg group-hover:text-rose-900 transition-colors">
                            Invoice #{order.invoiceNumber || `NS-${order.id}`}
                          </h3>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(order.deliveryStatus)}`}>
                        {getStatusText(order.deliveryStatus)}
                      </span>
                    </div>
                    
                    {order.line1 && (
                      <div className="bg-stone-50/70 rounded-2xl p-3.5 mb-4 border border-stone-200/70 flex items-start gap-2.5 text-xs text-stone-600">
                        <MapPin className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                        <p className="truncate flex-1">{order.line1}, {order.postal_code}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs uppercase tracking-wider font-bold text-stone-400">Total</span>
                          <p className="text-xl sm:text-2xl font-extrabold text-stone-900">
                            ₹{((order as any).finalAmount ?? order.totalAmount).toLocaleString('en-IN')}
                          </p>
                        </div>
                        {Number(order.discount) > 0 && (
                          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                            Discount applied: Saved ₹{Number(order.discount).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center text-xs font-bold text-rose-900 group-hover:text-rose-950 uppercase tracking-wider">
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
