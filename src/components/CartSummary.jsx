'use client'
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BASE_URL } from '@/Constant/Api';
import { useCart } from '@/hooks/useCart';
import { getAuthCookie } from '@/utils/auth';

const getEffectivePrice = (item, isB2bUser) => {
  const isB2bProduct = item?.isB2b || item?.isBoth
  if (isB2bUser && isB2bProduct && item?.b2bPrice) return Number(item.b2bPrice)
  const basePrice = Number(item?.basePrice || item?.price || 0)
  const discountPrice = Number(item?.discountPrice || 0)
  if (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice) return basePrice - discountPrice
  return basePrice
}

const resolveImage = (item) => {
  const raw = item.imageUrl || item.image || item.productImage || ''
  if (!raw) return ''
  if (raw.startsWith('http') || raw.startsWith('//')) return raw
  return BASE_URL.replace('/api/', '') + raw
}

const CartSummary = ({ isOpen, onClose }) => {
  const [isB2bUser, setIsB2bUser] = useState(false)
  const { items, removeFromCart, removeGuestItem, isGuest } = useCart()

  useEffect(() => {
    const userData = getAuthCookie('user')?.user
    setIsB2bUser(userData?.userRole === 2)
  }, [])

  const computedTotal = useMemo(
    () => items.reduce((sum, item) => sum + getEffectivePrice(item, isB2bUser) * item.quantity, 0),
    [items, isB2bUser]
  )
  const computedCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const handleRemove = async (itemId) => {
    if (isGuest) {
      removeGuestItem(itemId)
      return
    }
    try {
      await removeFromCart(itemId)
    } catch (e) {
      console.error('Remove failed', e)
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-600">{computedCount} item{computedCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Your cart is empty</div>
        ) : (
          <div className="p-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <img
                  src={resolveImage(item)}
                  alt={item.name || 'Product'}
                  className="w-12 h-12 object-cover rounded flex-shrink-0 bg-gray-100"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name || item.productName || 'Product'}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{(getEffectivePrice(item, isB2bUser) * item.quantity).toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-gray-900">Total:</span>
            <span className="text-lg font-bold text-gray-900">
              ₹{computedTotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors block text-center"
            >
              View Cart
            </Link>
            {isGuest ? (
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all block text-center shadow-md"
              >
                Proceed to Checkout
              </Link>
            ) : (
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all block text-center shadow-md"
              >
                Checkout
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CartSummary
