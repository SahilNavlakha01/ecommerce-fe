'use client'

import { useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateCartQuantityAsync, removeFromCartAsync } from "../redux/features/cart/cartSlice"
import { getAuthCookie } from "../utils/auth"
import { successToast } from "../utils/toast"
import { cn } from "../utils/cn"

interface B2BCartQuantityManagerProps {
  productId: string | number
  stockQuantity?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const B2BCartQuantityManager: React.FC<B2BCartQuantityManagerProps> = ({
  productId,
  stockQuantity: stockProp,
  className = "",
  size = "md"
}) => {
  const dispatch = useDispatch()
  const { items } = useSelector((state: any) => state.cart)
  const [isUpdating, setIsUpdating] = useState(false)

  const cartItem = items?.find((item: any) => String(item.productId) === String(productId))
  const currentQuantity = cartItem?.quantity || 0
  const cartItemId = cartItem?.id

  // Always prefer stockQuantity from Redux cart item (live DB value), fall back to prop
  const effectiveStock = Number(cartItem?.stockQuantity ?? stockProp ?? 999)
  const isAtStockLimit = effectiveStock > 0 && currentQuantity >= effectiveStock

  const userData = getAuthCookie('user')
  const userId = userData?.user?.id

  const handleDecrement = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isUpdating || !cartItemId || !userId) return

    if (currentQuantity <= 1) {
      try {
        setIsUpdating(true)
        await dispatch(removeFromCartAsync(cartItemId) as any).unwrap()
        successToast("Removed from cart")
      } catch { } finally {
        setIsUpdating(false)
      }
      return
    }

    try {
      setIsUpdating(true)
      await dispatch(updateCartQuantityAsync({ cartItemId, quantity: currentQuantity - 1, userId }) as any).unwrap()
    } catch { } finally {
      setIsUpdating(false)
    }
  }, [isUpdating, cartItemId, userId, currentQuantity, dispatch])

  const handleIncrement = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Hard block at every level — no API call if at limit
    if (isUpdating || !cartItemId || !userId || isAtStockLimit) return
    if (effectiveStock > 0 && currentQuantity + 1 > effectiveStock) return

    try {
      setIsUpdating(true)
      await dispatch(updateCartQuantityAsync({ cartItemId, quantity: currentQuantity + 1, userId }) as any).unwrap()
    } catch { } finally {
      setIsUpdating(false)
    }
  }, [isUpdating, cartItemId, userId, isAtStockLimit, effectiveStock, currentQuantity, dispatch])

  if (!cartItem) return null

  const btnCls = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base"
  }[size]

  const qtyWidth = { sm: "min-w-[24px] text-xs", md: "min-w-[32px] text-sm", lg: "min-w-[40px] text-base" }[size]

  return (
    <div className={cn(
      "flex items-center justify-center bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-lg border border-teal-200 px-2 py-1 gap-1.5",
      className
    )}>
      {/* Decrement / Delete */}
      <button
        onClick={handleDecrement}
        disabled={isUpdating}
        className={cn(
          "flex items-center justify-center rounded-md bg-white border border-teal-300 font-bold text-teal-600 shadow-sm",
          "hover:bg-teal-600 hover:text-white transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          btnCls
        )}
      >
        {currentQuantity === 1
          ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          : <span>−</span>
        }
      </button>

      {/* Quantity display */}
      <span className={cn("font-bold text-teal-800 text-center select-none", qtyWidth)}>
        {isUpdating ? "..." : currentQuantity}
      </span>

      {/* Increment — disabled when at stock limit */}
      <div className="relative group/inc">
        <button
          onClick={handleIncrement}
          disabled={isUpdating || isAtStockLimit}
          className={cn(
            "flex items-center justify-center rounded-md bg-white border font-bold shadow-sm transition-all duration-200",
            isAtStockLimit
              ? "border-gray-200 text-gray-300 cursor-not-allowed"
              : "border-teal-300 text-teal-600 hover:bg-teal-600 hover:text-white",
            btnCls
          )}
        >
          <span>+</span>
        </button>
        {isAtStockLimit && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 pointer-events-none opacity-0 group-hover/inc:opacity-100 transition-opacity">
            <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap shadow-lg">
              Max {effectiveStock} in stock
            </div>
            <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
          </div>
        )}
      </div>

      {/* In Cart badge — icon only on mobile, icon+text on larger */}
      <div className="flex items-center gap-0.5 text-teal-600 ml-0.5 shrink-0">
        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span className="hidden sm:inline text-[10px] font-semibold">In Cart</span>
      </div>
    </div>
  )
}

export default B2BCartQuantityManager
