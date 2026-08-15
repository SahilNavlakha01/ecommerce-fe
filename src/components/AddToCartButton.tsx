'use client'

import { useState, memo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "../hooks/useCart"
import { useSelector } from "react-redux"
import { getAuthCookie, isCustomerLoggedIn } from "../utils/auth"
import { errorToast } from "../utils/toast"
import { cn } from "../utils/cn"
import { addToGuestCart } from "../utils/guestCart"
import { GetSingleProduct } from "../Services/GetService"
import { getFirstImageUrl } from "../utils/imageUtils"
import B2BCartQuantityManager from "./B2BCartQuantityManager"

interface AddToCartButtonProps {
  productId: string | number;
  className?: string;
  children?: React.ReactNode;
  quantity?: number;
  existingQuantity?: number;
  stockQuantity?: number;
  selectedSize?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'luxury';
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  productId,
  className = "",
  children = "Add to Cart",
  quantity = 1,
  existingQuantity = 0,
  stockQuantity,
  selectedSize,
  disabled = false,
  variant = "primary",
  buttonSize = "md"
}) => {
  const { addToCart, refreshCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const userData = typeof document !== "undefined" ? getAuthCookie('user').user : null
  const isB2bUser = Boolean(userData?.userRole === 2 || userData?.role === 2 || String((userData as any)?.roleName || '').toLowerCase().includes('b2b'))
  const { items } = useSelector((state: any) => state.cart)
  const isInCart = items?.some((item: any) => String(item.productId) === String(productId))

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()

    if (!productId) {
      errorToast("Product not found")
      return
    }

    const totalRequested = Number(existingQuantity || 0) + Number(quantity || 0)
    if (Number(stockQuantity) > 0 && totalRequested > Number(stockQuantity)) {
      errorToast(`Only ${Number(stockQuantity)} units available in stock`)
      return
    }

    if (isLoading) return;

    if (!isCustomerLoggedIn()) {
      // Guest user: fetch product details and add to localStorage cart
      try {
        setIsLoading(true)
        const res = await GetSingleProduct(productId)
        const p = res?.data?.data || res?.data
        if (!p) { errorToast("Product not found"); return }
        const basePrice = Number(p.basePrice || p.price || 0)
        const discountPrice = Number(p.discountPrice || 0)
        const discountPct = (basePrice > 0 && discountPrice > 0) ? Math.round((discountPrice / basePrice) * 100) : 0
        const guestStock = Number(p.stockQuantity || 0)
        if (guestStock > 0 && totalRequested > guestStock) {
          errorToast(`Only ${guestStock} units available in stock`)
          return
        }

        addToGuestCart({
          productId: p.id,
          name: p.name || p.title || 'Product',
          price: (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice) ? basePrice - discountPrice : basePrice,
          basePrice,
          discountPrice,
          imageUrl: getFirstImageUrl(p),
          stockQuantity: p.stockQuantity,
          weight: p.weight,
          purity: p.purity,
          description: p.description || '',
          rating: parseFloat(p.avgRating || p.rating || 0),
          avgRating: parseFloat(p.avgRating || 0),
          reviewCount: p.reviewCount || 0,
          discount: discountPct,
          isB2b: p.isB2b || false,
          isBoth: p.isBoth || false,
          b2bPrice: Number(p.b2bPrice || 0),
          minQuantity: p.minQuantity || 1,
          size: selectedSize || null,
        }, quantity)
        window.dispatchEvent(new Event('guestCartUpdated'))
        if (!isB2bUser) router.push('/cart')
      } catch (error) {
        console.error("Failed to add to guest cart:", error)
        errorToast("Failed to add to cart")
      } finally {
        setIsLoading(false)
      }
      return
    }

    try {
      setIsLoading(true)
      await addToCart(productId, quantity)
      refreshCart()
      if (!isB2bUser) router.push('/cart')
    } catch (error: any) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsLoading(false)
    }
  }, [addToCart, refreshCart, productId, quantity, existingQuantity, stockQuantity, selectedSize, isLoading, isB2bUser, router])

  // For B2B users, show quantity manager if product is in cart
  if (isB2bUser && isInCart && isCustomerLoggedIn()) {
    return (
      <B2BCartQuantityManager 
        productId={productId}
        stockQuantity={stockQuantity}
        className={className}
        size={buttonSize === 'sm' ? 'sm' : buttonSize === 'lg' || buttonSize === 'xl' ? 'lg' : 'md'}
      />
    )
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading || (Number(stockQuantity) > 0 && (Number(existingQuantity || 0) + Number(quantity || 0)) > Number(stockQuantity))}
      className={cn(
        "luxury-btn luxury-btn-sm w-full",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none",
        className
      )}
    >
      {isLoading ? (
        <>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-[10px] sm:text-sm">Adding...</span>
        </>
      ) : (
        <>
          <span className="text-[10px] sm:text-sm mr-1 sm:mr-2">{children}</span>
          {/* <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg> */}
        </>
      )}
    </button>
  )
}

export default memo(AddToCartButton, (prevProps, nextProps) => {
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.className === nextProps.className &&
    prevProps.children === nextProps.children &&
    prevProps.quantity === nextProps.quantity &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.variant === nextProps.variant &&
    prevProps.buttonSize === nextProps.buttonSize &&
    prevProps.selectedSize === nextProps.selectedSize
  );
});
