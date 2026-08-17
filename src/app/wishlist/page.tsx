"use client"

import EcommerceLayout from '../EcommerceLayout'
import { useWishlist } from '../../hooks/useWishlist'
import { useEffect, useState } from 'react'
import { getFirstImageUrl, getPlaceholderImage } from '../../utils/imageUtils'
import Link from 'next/link'
import { Button } from '../../components/ui/Button'
import { successToast, errorToast } from '../../utils/toast'
import { ProductCardSkeleton } from '../../components/ui/Skeleton'
import ProductCard from '../components/ProductCard'
import ConfirmModal from '../../components/ConfirmModal'

export default function WishlistPage() {
  const { items, fetchLoading, refreshWishlist, clearWishlist, removeFromWishlist } = useWishlist()
  const [selectedItems, setSelectedItems] = useState(new Set<string>())
  const [showClearModal, setShowClearModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)

  const resolveWishlistPricing = (item: any) => {
    const basePrice = Number(
      item?.basePrice ??
      item?.oldPrice ??
      item?.price ??
      item?.offerPrice ??
      0
    )

    const discountPrice = Number(
      item?.discountPrice ??
      (Number(item?.oldPrice) > 0 && Number(item?.price) > 0
        ? Number(item.oldPrice) - Number(item.price)
        : 0)
    )

    const computedPrice = (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice)
      ? basePrice - discountPrice
      : Number(item?.price ?? basePrice ?? 0)

    const oldPrice = discountPrice > 0
      ? basePrice
      : (Number(item?.oldPrice) > 0 ? Number(item.oldPrice) : undefined)

    return { price: computedPrice, oldPrice, discountPrice }
  }

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const handleClearWishlist = async () => {
    try {
      await clearWishlist()
    } catch (error) {
      errorToast('Failed to clear wishlist')
    }
  }

  const handleRemoveItem = (itemId: string) => {
    removeFromWishlist(itemId)
    setSelectedItems(prev => {
      const next = new Set(prev)
      next.delete(String(itemId))
      return next
    })
  }

  const toggleItemSelection = (itemId: string) => {
    const productId = String(itemId)
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      const allIds = items.map(item => String(item.id || item.productId || item.product_id || item.sku || item.wishlist_product_id))
      setSelectedItems(new Set(allIds))
    }
  }

  const handleRemoveSelected = () => {
    if (selectedItems.size === 0) return

    Array.from(selectedItems).forEach(itemId => removeFromWishlist(itemId as string | number))
    successToast(`${selectedItems.size} items removed from wishlist`)
    setSelectedItems(new Set())
  }

  if (fetchLoading) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-[#faf9f6]">
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-400/30">
            <div className="max-w-7xl mx-auto">
              <div className="h-8 w-48 bg-white/20 rounded-xl mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  if (items.length === 0) {
    return (
      <EcommerceLayout>
        <div className="min-h-screen bg-[#faf9f6] py-16 px-4">
          <div className="max-w-xl mx-auto text-center bg-white rounded-3xl p-10 sm:p-12 border border-stone-200/90 shadow-xs">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-100">
              <svg className="w-9 h-9 text-rose-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-2">Your Wishlist is Empty</h1>
            <p className="text-stone-500 text-xs sm:text-sm mb-7 max-w-md mx-auto">
              Save your favourite jewellery pieces to easily revisit and purchase anytime.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md cursor-pointer"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </EcommerceLayout>
    )
  }

  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-[#faf9f6] pb-16">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-b border-amber-400/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-200 text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/10">
                Exclusive Collection
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Saved Favourites</h1>
              <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">{items.length} {items.length === 1 ? 'favourite design' : 'favourite designs'} saved</p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                onClick={() => setShowClearModal(true)}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {items.map((item, index) => {
              const productId = String(item.id || item.productId || item.product_id || item.sku || item.wishlist_product_id)
              const keyId = item.wishlistId || item.id || productId
              const { price, oldPrice, discountPrice } = resolveWishlistPricing(item)
              const name = item.name || item.title || item.productName || 'Product'
              const image = getFirstImageUrl(item) || getPlaceholderImage()

              return (
                <div
                  key={keyId}
                  className="relative"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <ProductCard
                    id={productId}
                    name={name}
                    price={price}
                    oldPrice={oldPrice}
                    discountPrice={discountPrice}
                    image={image}
                    rating={item.avgRating || 0}
                    reviewCount={item.reviewCount || 0}
                    isB2b={item.isB2b}
                    isBoth={item.isBoth}
                    b2bPrice={item.b2bPrice}
                    stockQuantity={item.stockQuantity || 1}
                    description={item.description}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearWishlist}
        title="Clear Wishlist"
        message="Are you sure you want to clear your entire wishlist? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={handleRemoveSelected}
        title="Remove Items"
        message={`Are you sure you want to remove ${selectedItems.size} item(s) from your wishlist?`}
        confirmText="Remove"
        cancelText="Cancel"
        type="warning"
      />
    </EcommerceLayout>
  )
}
