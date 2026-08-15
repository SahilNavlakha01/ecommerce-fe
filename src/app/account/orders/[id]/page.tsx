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
        <div className="space-y-5">

          {/* Back */}
          <button onClick={() => router.push('/account/orders')} className="flex items-center text-teal-600 hover:text-teal-700 font-medium group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </button>

          {/* Header card */}
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <p className="text-teal-200 text-xs font-medium uppercase tracking-wider mb-1">Invoice</p>
                  <h1 className="text-xl sm:text-2xl font-bold">{order.invoiceNumber}</h1>
                  <div className="flex items-center gap-1.5 mt-1 text-teal-100 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                    <StatusIcon className="w-3.5 h-3.5" />{statusCfg.label}
                  </span>
                  <button onClick={handleDownloadInvoice} className="bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all flex items-center gap-1.5 border border-white/30 text-xs font-medium">
                    <Download className="w-3.5 h-3.5" />Download Invoice
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShoppingBag, label: 'Items', value: summary?.itemCount ?? orderItems.length },
                  { icon: CreditCard, label: 'Payment', value: summary?.isCOD ? 'COD' : 'Online', sub: summary?.isCOD && summary?.codCharges > 0 ? 'Charge paid online' : null },
                  { icon: Package, label: 'Total', value: `₹${(summary?.finalAmount ?? (order as any).finalAmount ?? order.totalAmount)?.toLocaleString('en-IN')}` },
                ].map(({ icon: Icon, label, value, sub }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1"><Icon className="w-3.5 h-3.5 text-teal-200" /><p className="text-teal-200 text-xs">{label}</p></div>
                    <p className="font-bold text-sm sm:text-base">{value}</p>
                    {sub && <p className="text-teal-200 text-[10px] mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery info + Price breakdown */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Delivery Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0"><Truck className="w-4 h-4 text-teal-600" /></div>
                    <div><p className="text-xs text-gray-500">Shipping Partner</p><p className="font-semibold text-gray-900 text-sm">{summary.shippingPartner}</p></div>
                  </div>
                  {tracking?.courier_name && tracking.courier_name !== summary.shippingPartner && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0"><Truck className="w-4 h-4 text-purple-600" /></div>
                      <div><p className="text-xs text-gray-500">Assigned Courier</p><p className="font-semibold text-gray-900 text-sm">{tracking.courier_name}</p></div>
                    </div>
                  )}
                  {tracking?.awb_code && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="w-4 h-4 text-gray-600" /></div>
                      <div><p className="text-xs text-gray-500">AWB Code</p><p className="font-semibold text-gray-900 text-sm font-mono">{tracking.awb_code}</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-green-600" /></div>
                    <div>
                      <p className="text-xs text-gray-500">Estimated Delivery</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {tracking?.edd
                          ? new Date(tracking.edd).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                          : new Date(summary.deliveryEstimate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-gray-600" /></div>
                    <div><p className="text-xs text-gray-500">Delivery Address</p><p className="font-semibold text-gray-900 text-sm">{order.line1}, {order.postal_code}</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Price Breakdown</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal ({summary.itemCount} {summary.itemCount === 1 ? 'item' : 'items'})</span><span className="font-medium text-gray-900">₹{summary.subtotal.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between text-gray-600"><span>GST ({summary.gstRate}%)</span><span className="font-medium text-gray-900">₹{summary.gstAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {summary.shippingCharge > 0 ? <span className="font-medium text-gray-900">₹{summary.shippingCharge.toLocaleString('en-IN')}</span> : <span className="font-medium text-green-600">Free</span>}
                  </div>
                  {summary.isCOD && summary.codCharges > 0 && (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span className="flex items-center gap-1">COD Charge <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">Paid Online</span></span>
                        <span className="font-medium text-gray-900">₹{summary.codCharges.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-teal-700 font-semibold">
                        <span>Amount Due at Delivery</span>
                        <span>₹{(summary.finalAmount - summary.codCharges).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  {summary.giftingCharges > 0 && <div className="flex justify-between text-gray-600"><span>🎁 Gift Wrapping</span><span className="font-medium text-gray-900">₹{summary.giftingCharges.toLocaleString('en-IN')}</span></div>}
                  {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span><span className="font-medium">-₹{Number(order.discount).toLocaleString('en-IN')}</span></div>}
                  <div className="border-t-2 border-dashed border-gray-200 pt-2.5">
                    <div className="flex justify-between"><span className="font-bold text-gray-900">Grand Total</span><span className="font-bold text-lg text-teal-600">₹{summary.finalAmount.toLocaleString('en-IN')}</span></div>
                    {summary.isCOD && summary.codCharges > 0 && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800 mt-2">
                        <span className="font-semibold">₹{summary.codCharges.toLocaleString('en-IN')}</span> COD charge paid online · Pay <span className="font-semibold">₹{(summary.finalAmount - summary.codCharges).toLocaleString('en-IN')}</span> at delivery
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipment Tracking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Shipment Tracking</h2>
              {tracking?.tracking_url && (
                <a href={tracking.tracking_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700">
                  <ExternalLink className="w-3.5 h-3.5" />Track on courier
                </a>
              )}
            </div>

            {tracking ? (
              <>
                {/* Status banner */}
                <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${trackingStatusCfg?.bg ?? 'bg-gray-50'} ${trackingStatusCfg?.border ?? 'border-gray-200'}`}>
                  <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className={`font-bold text-base ${trackingStatusCfg?.color ?? 'text-gray-700'}`}>{trackingStatusCfg?.label ?? (tracking.shipment_status || tracking.current_status || 'Processing')}</p>
                    {tracking.courier_name && <p className="text-xs text-gray-500 mt-0.5">{tracking.courier_name}</p>}
                  </div>
                  {tracking.awb_code && (
                    <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-lg font-mono border border-gray-200">AWB: {tracking.awb_code}</span>
                  )}
                </div>

                {/* Step progress bar */}
                {statusCfg.step >= 0 && (
                  <div className="flex items-center justify-between relative px-2 mb-6">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-gray-200 z-0">
                      <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                    {STEPS.map((step, idx) => {
                      const done = stepDone(idx)
                      const Icon = step.icon
                      return (
                        <div key={step.key} className="flex flex-col items-center gap-1.5 z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-teal-600 border-teal-600' : 'bg-white border-gray-300'}`}>
                            <Icon className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`} />
                          </div>
                          <span className={`text-xs font-medium text-center leading-tight ${done ? 'text-teal-700' : 'text-gray-400'}`}>{step.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Activity timeline */}
                {activities.length > 0 && (
                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-teal-600 rounded-full" />
                        <p className="text-sm font-bold text-gray-900">Shipment Activity</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">{activities.length} update{activities.length > 1 ? 's' : ''}</span>
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-teal-400 via-gray-200 to-gray-100 z-0" />
                      <div className="space-y-3">
                        {activities.map((a: any, i: number) => {
                          const isLatest = i === 0
                          const dt = new Date(a.date)
                          const iconMap: Record<string, any> = { BKD: Truck, PCUP: Package, OFD: Truck, DL: CheckCircle2 }
                          const Icon = iconMap[a.status] ?? MapPin
                          return (
                            <div key={i} className="relative flex gap-3 z-10">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 shadow-sm ${isLatest ? 'bg-teal-600 border-teal-600' : 'bg-gray-50 border-gray-200'}`}>
                                <Icon className={`w-4 h-4 ${isLatest ? 'text-white' : 'text-gray-500'}`} />
                              </div>
                              <div className={`flex-1 rounded-xl border p-3 ${isLatest ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 shadow-sm' : 'bg-white border-gray-100'}`}>
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className={`text-sm font-bold ${isLatest ? 'text-teal-800' : 'text-gray-800'}`}>{a.activity}</p>
                                    {isLatest && <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">Latest</span>}
                                  </div>
                                  {a['sr-status-label'] && (
                                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${isLatest ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                                      {a['sr-status-label']}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Clock className={`w-3 h-3 ${isLatest ? 'text-teal-500' : 'text-gray-400'}`} />
                                    <span className={`text-xs ${isLatest ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                                      {dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {a.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className={`w-3 h-3 flex-shrink-0 ${isLatest ? 'text-teal-500' : 'text-gray-400'}`} />
                                      <span className={`text-xs truncate max-w-[180px] sm:max-w-none ${isLatest ? 'text-teal-600' : 'text-gray-400'}`}>{a.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* No AWB yet — show pending state inline */}
                {!tracking.awb_code && activities.length === 0 && (
                  <div className="flex flex-col items-center py-4 text-center border-t border-gray-100 mt-2">
                    <p className="text-sm text-gray-500">Your shipment is registered on Shiprocket but a courier hasn't been assigned yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Live tracking will appear here once the shipment is picked up.</p>
                    {summary?.deliveryEstimate && (
                      <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Expected by {new Date(summary.deliveryEstimate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-6 text-center">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mb-3 border border-orange-100">
                  <Truck className="w-7 h-7 text-orange-400" />
                </div>
                <p className="font-semibold text-gray-800 mb-1">Tracking not yet available</p>
                <p className="text-xs text-gray-500 max-w-xs">Your order is being processed. Tracking will appear once the shipment is created.</p>
                {summary?.deliveryEstimate && (
                  <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Expected by {new Date(summary.deliveryEstimate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {orderItems.map((item) => {
                const userReview = getUserReview(item.productId)
                return (
                  <div key={item.id} className="bg-gradient-to-br from-gray-50 to-stone-50 border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        {item.imageUrl ? (
                          <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL.replace('/api/', '')}${item.imageUrl}`} alt={item.name} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100"><Package className="w-8 h-8 text-gray-400" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">{item.name}</h3>
                        {userReview && (
                          <div className="mb-2 bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className="flex text-teal-500">
                                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < userReview.rating ? 'fill-current' : ''}`} />)}
                                </div>
                                <span className="text-xs font-medium text-gray-600">({userReview.rating}.0)</span>
                              </div>
                              <button onClick={() => deleteUserReview(userReview.id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /><span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>
                            {userReview.reviewText && <p className="text-xs sm:text-sm text-gray-700 mb-1">"{userReview.reviewText}"</p>}
                            <span className="text-xs text-gray-500">{new Date(userReview.createdAt).toLocaleDateString('en-GB')}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                          {[
                            { label: 'SKU', value: item.skuCode },
                            { label: 'Weight', value: `${item.weight}g` },
                            { label: 'Qty', value: item.quantity },
                            item.size ? { label: 'Size', value: item.size, teal: true } : null,
                            { label: 'Price', value: `₹${item.subtotal?.toLocaleString('en-IN')}`, teal: true },
                          ].filter(Boolean).map((f: any) => (
                            <div key={f.label} className={`px-2 py-1.5 rounded-lg border text-xs ${f.teal ? 'bg-teal-50 border-teal-200' : 'bg-white border-gray-200'}`}>
                              <span className={`block ${f.teal ? 'text-teal-700' : 'text-gray-500'}`}>{f.label}</span>
                              <p className={`font-semibold ${f.teal ? 'text-teal-700' : 'text-gray-900'}`}>{f.value}</p>
                            </div>
                          ))}
                        </div>
                        {!userReview && (
                          <button onClick={() => setReviewModal(item)} className="text-teal-600 hover:text-teal-700 text-xs sm:text-sm font-medium flex items-center gap-1">
                            <Star className="w-3.5 h-3.5" />Add Review
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Add Review</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Rating *</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="transition-all">
                    <Star className={`w-10 h-10 ${star <= rating ? 'fill-teal-500 text-teal-500' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Share your experience..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={submitReview} disabled={!rating || submitting}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 font-medium">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
