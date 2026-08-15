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
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50">
          <div className="bg-gradient-to-r from-teal-800 to-teal-900 relative overflow-hidden">
            <div className="relative px-6 lg:px-8 py-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <div className="h-10 w-48 bg-white/20 rounded mb-2 animate-pulse"></div>
                    <div className="h-6 w-64 bg-white/10 rounded animate-pulse"></div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="h-10 w-24 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-vanilla-50 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-3xl shadow-xl p-12 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-32 translate-x-32 opacity-70"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-50 rounded-full translate-y-32 -translate-x-32 opacity-70"></div>

              <div className="relative z-10">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <svg className="w-16 h-16 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 font-sans">Your Wishlist is Empty</h1>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Save your favorite jewelry pieces to your wishlist and never lose track of what you love
                </p>
                <Link href="/shop" className="inline-flex items-center bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold hover:from-teal-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Explore Collection
                </Link>
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
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-32 -translate-x-32"></div>

          <div className="relative px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white font-sans mb-2">My Wishlist</h1>
                  <p className="text-teal-100 text-lg">{items.length} beautiful pieces you've saved</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleSelectAll}
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedItems.size > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowRemoveModal(true)}
                      className="bg-red-500/80 backdrop-blur-sm border-red-400/30 hover:bg-red-600/80"
                    >
                      Remove ({selectedItems.size})
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setShowClearModal(true)}
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px sm:gap-6">
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
                  style={{ animationDelay: `${index * 50}ms` }}
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
