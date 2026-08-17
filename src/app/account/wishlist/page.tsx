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
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <Heart className="w-7 h-7 text-amber-200 fill-amber-200/40" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Saved Favourites</h1>
                  <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">
                    {items.length} {items.length === 1 ? 'favourite design' : 'favourite designs'} saved
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          {items.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-12 text-center">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Heart className="w-8 h-8 text-rose-900" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Your wishlist is empty</h3>
              <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto">
                Save jewellery pieces you love to easily revisit and order them anytime.
              </p>
              <button
                onClick={() => router.push('/shop')}
                className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
