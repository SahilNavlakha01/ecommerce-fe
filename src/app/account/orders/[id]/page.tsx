"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AccountLayout from '../../AccountLayout'
import PageTransition from '../../../../components/PageTransition'
import { OrderDetailSkeleton } from '../../../../components/ui/OrderDetailSkeleton'
import { GetUserOrders, GetOrderWithTracking, GetProductReviews } from '../../../../Services/GetService.jsx'
import { AddReview, DeleteReview } from '../../../../Services/PostService.jsx'
import { BASE_URL } from '../../../../Constant/Api'
import { toast } from 'sonner'
import { downloadInvoiceByNumber, downloadInvoiceByOrderId } from '../../../../utils/invoiceUtils'
import {
  ArrowLeft, Download, Package, Truck, MapPin, Star, Trash2,
  CreditCard, Calendar, CheckCircle2, Clock, XCircle, ShoppingBag, ExternalLink
} from 'lucide-react'

// Single source of truth for status display
const resolveStatus = (status: string | number | null | undefined) => {
  const t = String(status || '').trim().toLowerCase()
  if (t.includes('delivered')) return { label: 'Delivered', bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle2, step: 3, color: 'text-green-600' }
  if (t.includes('cancel')) return { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, step: -1, color: 'text-red-600' }
  if (t.includes('rto')) return { label: 'RTO', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: XCircle, step: -1, color: 'text-red-600' }
  if (t.includes('out for delivery')) return { label: 'Out For Delivery', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: Truck, step: 3, color: 'text-orange-600' }
  if (t.includes('transit') || t.includes('shipping') || t.includes('shipped') || t.includes('pickup')) return { label: 'In Transit', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: Truck, step: 2, color: 'text-purple-600' }
  if (t.includes('assign')) return { label: 'Assigned', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: CheckCircle2, step: 1, color: 'text-blue-600' }
  if (t.includes('ready')) return { label: 'Ready to Ship', bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: Package, step: 1, color: 'text-cyan-600' }
  return { label: t.includes('pending') ? 'Pending' : 'Processing', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, step: 0, color: 'text-yellow-600' }
}

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: ShoppingBag },
  { key: 'assigned', label: 'Assigned', icon: Package },
  { key: 'transit', label: 'In Transit', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [tracking, setTracking] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({ id: '' })
  const [reviewModal, setReviewModal] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userReviews, setUserReviews] = useState<any[]>([])

  useEffect(() => {
    const raw = document.cookie.split('; ').find(r => r.startsWith('userData='))?.split('=')[1]
    if (raw) {
      try { setUser({ id: JSON.parse(decodeURIComponent(raw)).id }) } catch (_) {}
    }
  }, [])

  useEffect(() => {
    if (user.id && orderId) fetchOrderDetails()
  }, [user.id, orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const [ordersRes, trackingRes] = await Promise.all([
        GetUserOrders(user.id),
        GetOrderWithTracking(orderId, user.id)
      ])
      if (ordersRes?.data?.data) {
        const found = ordersRes.data.data.find((o: any) => String(o.id) === orderId)
        if (found) setOrder(found)
      }
      if (trackingRes?.data?.data) {
        const d = trackingRes.data.data
        setOrderItems(d.items || [])
        setTracking(d.tracking || null)
        setSummary(d.estimationSummary || null)
        if (d.items?.length) fetchUserReviews(d.items)
      }
    } catch {
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserReviews = async (items: any[]) => {
    try {
      const all = await Promise.all(items.map(async item => {
        const r = await GetProductReviews(String(item.productId))
        return (r?.data?.data?.reviews || []).filter((rv: any) => String(rv.userId) === String(user.id))
      }))
      setUserReviews(all.flat())
    } catch (_) {}
  }

  const getUserReview = (productId: number) =>
    userReviews.find(r => String(r.productId) === String(productId))

  const deleteUserReview = async (reviewId: number) => {
    try {
      await DeleteReview({ id: reviewId, userId: user.id })
      toast.success('Review deleted')
      fetchOrderDetails()
    } catch { toast.error('Failed to delete review') }
  }

  const submitReview = async () => {
    if (!rating) { toast.error('Please provide a rating'); return }
    setSubmitting(true)
    try {
      await AddReview({ productId: String(reviewModal.productId), userId: String(user.id), rating, reviewText: comment.trim() })
      toast.success('Review submitted!')
      setReviewModal(null); setRating(0); setComment('')
      fetchOrderDetails()
    } catch { toast.error('Failed to submit review') }
    finally { setSubmitting(false) }
  }

  const handleDownloadInvoice = async () => {
    try {
      if (order?.invoiceNumber) await downloadInvoiceByNumber(order.invoiceNumber)
      else await downloadInvoiceByOrderId(orderId)
    } catch (_) {}
  }

  if (loading) return <AccountLayout><OrderDetailSkeleton /></AccountLayout>

  if (!order) return (
    <AccountLayout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Order not found</h3>
        <button onClick={() => router.push('/account/orders')} className="mt-4 text-teal-600 font-medium">Back to Orders</button>
      </div>
    </AccountLayout>
  )

  const statusCfg = resolveStatus(order.deliveryStatus)
  const StatusIcon = statusCfg.icon
  const trackingStatusCfg = tracking ? resolveStatus(tracking.shipment_status || tracking.current_status) : null
  const activities: any[] = tracking?.activities || []
  const stepDone = (idx: number) => idx === 0 || (statusCfg.step >= idx)
  const progressPct = statusCfg.step <= 0 ? 0 : Math.min((statusCfg.step / (STEPS.length - 1)) * 100, 100)

  return (
    <AccountLayout>
      <PageTransition>
        <div className="space-y-6">

          {/* Back Button */}
          <button
            onClick={() => router.push('/account/orders')}
            className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-rose-900 hover:text-rose-950 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </button>

          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-amber-200 text-[10px] font-bold uppercase tracking-widest mb-1.5 border border-white/10">
                    Official Tax Invoice
                  </div>
                  <h1 className="text-xl sm:text-3xl font-serif font-bold tracking-tight">{order.invoiceNumber || `NS-${order.id}`}</h1>
                  <div className="flex items-center gap-2 mt-1 text-rose-200 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusCfg.label}
                  </span>
                  <button
                    onClick={handleDownloadInvoice}
                    className="bg-white text-rose-950 px-4 py-2 rounded-xl hover:bg-rose-50 transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Invoice PDF
                  </button>
                </div>
              </div>

              {/* Quick KPI stats */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { icon: ShoppingBag, label: 'Items Ordered', value: summary?.itemCount ?? orderItems.length },
                  { icon: CreditCard, label: 'Payment Mode', value: summary?.isCOD ? 'Cash on Delivery' : 'Online Paid', sub: summary?.isCOD && summary?.codCharges > 0 ? 'COD charge paid' : null },
                  { icon: Package, label: 'Final Total', value: `₹${(summary?.finalAmount ?? (order as any).finalAmount ?? order.totalAmount)?.toLocaleString('en-IN')}` },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-amber-300" />
                      <p className="text-rose-200 text-[11px] font-medium uppercase tracking-wider">{label}</p>
                    </div>
                    <p className="font-serif font-bold text-sm sm:text-lg text-white">{value}</p>
                    {sub && <p className="text-amber-200 text-[10px] mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery info & Price breakdown */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Delivery Info */}
              <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-6">
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Delivery & Courier</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/60">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-rose-900" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-stone-400">Shipping Partner</p>
                      <p className="font-bold text-stone-900 text-sm">{summary.shippingPartner || 'Shiprocket Express'}</p>
                    </div>
                  </div>

                  {tracking?.awb_code && (
                    <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                      <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-stone-700" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">AWB Tracking Code</p>
                        <p className="font-mono font-bold text-stone-900 text-sm">{tracking.awb_code}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/70">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-emerald-800" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-emerald-700">Estimated Delivery Date</p>
                      <p className="font-bold text-emerald-950 text-sm">
                        {tracking?.edd
                          ? new Date(tracking.edd).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                          : new Date(summary.deliveryEstimate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="w-10 h-10 bg-stone-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-stone-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold text-stone-400">Destination Address</p>
                      <p className="font-bold text-stone-900 text-xs truncate">{order.line1}, {order.postal_code}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-6">
                <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Price Summary</h2>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold text-stone-900">₹{summary.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST ({summary.gstRate}%)</span>
                    <span className="font-semibold text-stone-900">₹{summary.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Express Shipping</span>
                    {summary.shippingCharge > 0 ? (
                      <span className="font-semibold text-stone-900">₹{summary.shippingCharge.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="font-bold text-emerald-700">Free</span>
                    )}
                  </div>
                  {summary.isCOD && summary.codCharges > 0 && (
                    <>
                      <div className="flex justify-between text-stone-600">
                        <span>COD Charge <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">Paid Online</span></span>
                        <span className="font-semibold text-stone-900">₹{summary.codCharges.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-rose-900 font-bold">
                        <span>Due on Delivery</span>
                        <span>₹{(summary.finalAmount - summary.codCharges).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount / Coupon Applied</span>
                      <span>-₹{Number(order.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-dashed border-stone-200 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-serif font-bold text-base text-stone-900">Grand Total</span>
                      <span className="font-extrabold text-2xl text-rose-900">₹{summary.finalAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Tracking Timeline */}
          <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">Shipment Progress</h2>
                <p className="text-xs text-stone-400">Live parcel movements & courier status updates</p>
              </div>
              {tracking?.tracking_url && (
                <a
                  href={tracking.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 hover:text-rose-950 uppercase tracking-wider underline underline-offset-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Courier Page
                </a>
              )}
            </div>

            {/* Step progress bar */}
            {statusCfg.step >= 0 && (
              <div className="flex items-center justify-between relative px-2 mb-8 mt-2">
                <div className="absolute top-4 left-6 right-6 h-1 bg-stone-100 z-0">
                  <div className="h-full bg-gradient-to-r from-rose-900 to-amber-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                {STEPS.map((step, idx) => {
                  const done = stepDone(idx)
                  const Icon = step.icon
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                        done ? 'bg-rose-900 border-rose-900 text-white shadow-xs' : 'bg-white border-stone-200 text-stone-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-bold text-center leading-tight ${done ? 'text-rose-950' : 'text-stone-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Activity History Timeline */}
            {activities.length > 0 && (
              <div className="border-t border-stone-100 pt-6">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Detailed Checkpoints</h3>
                <div className="space-y-3">
                  {activities.map((a: any, i: number) => {
                    const isLatest = i === 0
                    const dt = new Date(a.date)
                    return (
                      <div key={i} className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isLatest ? 'bg-rose-50/50 border-rose-200 shadow-2xs' : 'bg-stone-50/50 border-stone-200/70'
                      }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isLatest ? 'bg-rose-900 text-amber-200' : 'bg-stone-200 text-stone-600'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs sm:text-sm font-bold text-stone-900">{a.activity}</p>
                            {isLatest && (
                              <span className="text-[10px] uppercase font-bold bg-rose-900 text-white px-2 py-0.5 rounded-full">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {a.location ? ` — ${a.location}` : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-7">
            <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 mb-4">Ordered Jewellery Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => {
                const userReview = getUserReview(item.productId)
                return (
                  <div key={item.id} className="bg-stone-50/60 border border-stone-200/80 rounded-2xl p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-stone-200 p-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL.replace('/api/', '')}${item.imageUrl}`}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-100"><Package className="w-8 h-8 text-stone-400" /></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">{item.name}</h3>
                          <span className="font-extrabold text-base text-rose-900">₹{item.subtotal?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-stone-600 mb-3">
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 font-medium">SKU: {item.skuCode || 'NS-JW'}</span>
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-stone-200 font-medium">Qty: {item.quantity}</span>
                          {item.size && (
                            <span className="bg-rose-50 text-rose-900 px-2.5 py-1 rounded-lg border border-rose-200 font-bold">Size: {item.size}</span>
                          )}
                        </div>

                        {userReview ? (
                          <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                            <div>
                              <div className="flex text-amber-500 text-xs">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i}>{i < userReview.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                              {userReview.reviewText && <p className="text-xs text-stone-700 mt-1 italic">"{userReview.reviewText}"</p>}
                            </div>
                            <button
                              onClick={() => deleteUserReview(userReview.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewModal(item)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-900 hover:text-rose-950 uppercase tracking-wider cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                            Write a Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </PageTransition>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-fade-up">
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-700 to-rose-950 -mt-6 -mx-6 mb-6 rounded-t-3xl" />
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">Review this Jewellery Piece</h3>
            <p className="text-xs text-stone-500 mb-5">{reviewModal.name}</p>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Rating</label>
              <div className="flex gap-2 justify-center py-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="text-2xl transition-transform hover:scale-110 cursor-pointer">
                    <span className={star <= rating ? 'text-amber-400' : 'text-stone-300'}>★</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">Review Comment</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-800 text-sm bg-stone-50/50 focus:bg-white resize-none"
                placeholder="Share your thoughts on design, finishing, and shine..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setReviewModal(null)}
                className="flex-1 py-3 border border-stone-300 text-stone-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={!rating || submitting}
                className="flex-1 py-3 bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
