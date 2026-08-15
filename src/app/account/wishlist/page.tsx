"use client"

import { useContext } from 'react'
import AccountLayout from '../AccountLayout'
import { WishlistContext } from '../../providers/WishlistProvider'
import ProductCard from '../../components/ProductCard'
import PageTransition from '../../../components/PageTransition'
import { Heart, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFirstImageUrl } from '../../../utils/imageUtils'

export default function WishlistPage() {
  const { items } = useContext(WishlistContext)
  const router = useRouter()

  const resolveWishlistPricing = (product: any) => {
    const basePrice = Number(
      product?.basePrice ??
      product?.oldPrice ??
      product?.price ??
      product?.offerPrice ??
      0
    )

    const discountPrice = Number(
      product?.discountPrice ??
      (Number(product?.oldPrice) > 0 && Number(product?.price) > 0
        ? Number(product.oldPrice) - Number(product.price)
        : 0)
    )

    const price = (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice)
      ? basePrice - discountPrice
      : Number(product?.price ?? basePrice ?? 0)

    const oldPrice = discountPrice > 0
      ? basePrice
      : (Number(product?.oldPrice) > 0 ? Number(product.oldPrice) : undefined)

    return { price, oldPrice, discountPrice }
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
                <Heart className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">My Wishlist</h1>
                <p className="text-teal-100 text-xs sm:text-sm">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          {items.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Save your favorite items to your wishlist and shop them later.
              </p>
              <button
                onClick={() => router.push('/shop')}
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all font-medium shadow-lg inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {items.map((product: any) => {
                const { price, oldPrice, discountPrice } = resolveWishlistPricing(product)

                return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={price}
                  oldPrice={oldPrice}
                  discountPrice={discountPrice}
                  image={getFirstImageUrl(product)}
                  isB2b={product.isB2b}
                  isBoth={product.isBoth}
                  b2bPrice={product.b2bPrice}
                  rating={product.avgRating || 0}
                  reviewCount={product.reviewCount || 0}
                  stockQuantity={product.stockQuantity}
                />
                )
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
