"use client"
import { useState, useEffect, memo, useMemo } from "react"
import Link from "next/link"
import AddToCartButton from "../../components/AddToCartButton"
import WishlistButton from "../../components/WishlistButton"
import { getImageUrl, getPlaceholderImage } from "../../utils/imageUtils"

interface ProductCardProps {
  name: string
  price: number | string
  oldPrice?: number | string
  discountPrice?: number | string
  image: string
  id?: string
  badge?: string
  rating?: number
  reviewCount?: number
  isB2b?: boolean
  b2bPrice?: number | string
  stockQuantity?: number
  description?: string
  forceB2bPrice?: boolean
  isBoth?: boolean
}

function ProductCard({
  id, name, price, oldPrice, discountPrice, image, badge,
  rating, reviewCount, isB2b, isBoth, b2bPrice,
  stockQuantity = 1, description, forceB2bPrice
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [isB2bUser, setIsB2bUser] = useState(false)

  const userRole = useMemo(() => {
    if (typeof document === 'undefined') return 0
    const userData = document.cookie.split('; ').find(r => r.startsWith('userData='))?.split('=')[1]
    if (userData) {
      try { return JSON.parse(decodeURIComponent(userData)).userRole || 0 } catch { }
    }
    return 0
  }, [])

  useEffect(() => { setIsB2bUser(userRole === 2) }, [userRole])
  useEffect(() => { if (image && !imageError) setImageSrc(getImageUrl(image)) }, [image, imageError])

  const displayPrice = (forceB2bPrice || (isB2bUser && (isB2b || isBoth) && b2bPrice)) ? (b2bPrice || price) : price
  const displayOldPrice = (forceB2bPrice && b2bPrice && b2bPrice !== price) ? price : oldPrice

  const numericPrice = typeof displayPrice === "string" ? parseFloat(displayPrice.replace(/[^0-9.]/g, "")) : (displayPrice as number)
  const numericOldPrice = typeof displayOldPrice === "string" ? parseFloat((displayOldPrice as string).replace(/[^0-9.]/g, "")) : (displayOldPrice as number)
  const discountPct = numericOldPrice && numericPrice ? Math.round(((numericOldPrice - numericPrice) / numericOldPrice) * 100) : 0
  const isOutOfStock = stockQuantity <= 0

  const displayRating = Number(rating) || 0
  const displayReviewCount = Number(reviewCount) || 0

  return (
    <div className="group relative bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full min-w-0">

      {/* ── Image area ── */}
      <div className="relative overflow-hidden aspect-square bg-gray-50 flex-shrink-0">

        {/* Wishlist */}
        <div className="absolute top-2 right-2 z-20">
          {id && (
            <WishlistButton
              productId={id}
              product={{
                id,
                name,
                price: numericPrice,
                oldPrice: numericOldPrice,
                discountPrice: discountPct > 0 ? numericOldPrice - numericPrice : 0,
                image,
                isB2b,
                isBoth,
                b2bPrice,
                stockQuantity,
                description,
                rating: displayRating,
                reviewCount: displayReviewCount,
              } as any}
              size="sm"
              showTooltip={false}
            />
          )}
        </div>

        {/* Discount badge */}
        {discountPct > 0 && !isB2bUser && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              -{discountPct}%
            </span>
          </div>
        )}

        {/* Custom badge */}
        {badge && !isB2bUser && !discountPct && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {badge}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product image */}
        <Link href={`/products/${id}`} className="block w-full h-full">
          {!imageError && imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageSrc('') }}
                loading="lazy"
              />
              {!imageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
            </>
          ) : (
            <img src={getPlaceholderImage()} alt={name} className="w-full h-full object-cover" />
          )}

        </Link>
      </div>

      {/* ── Content ── */}
      <div className="px-2 sm:px-3 pt-2 sm:pt-2.5 pb-2 sm:pb-3 flex flex-col flex-1 gap-1 sm:gap-1.5 min-w-0">

        {/* Rating */}
        {(displayRating > 0 || displayReviewCount > 0) && (
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < Math.floor(displayRating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">({displayReviewCount})</span>
          </div>
        )}

        {/* Name */}
        <Link href={`/products/${id}`} className="block">
          <h3 className="text-xs sm:text-[13px] md:text-sm font-bold text-gray-900 line-clamp-2 hover:text-teal-600 transition-colors leading-snug break-words">
            {name}
          </h3>
        </Link>

        {/* Description — only 1 line, muted, clearly secondary */}
        {description && (
          <p className="hidden sm:block text-[11px] text-gray-400 line-clamp-1 leading-relaxed break-words">
            {description}
          </p>
        )}

        {/* Price row */}
        <div className="mt-auto pt-1 flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-sm sm:text-sm md:text-[15px] font-extrabold text-gray-900">
            ₹{typeof numericPrice === "number" ? numericPrice.toLocaleString("en-IN") : numericPrice}
          </span>
          {numericOldPrice > 0 && !isB2bUser && (
            <span className="text-[11px] text-gray-400 line-through font-medium">
              ₹{numericOldPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discountPct > 0 && !isB2bUser && (
            <span className="hidden sm:inline text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {discountPct}% off
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-1 flex gap-1.5">
          {isOutOfStock ? (
            <div className="w-full text-center py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-400 text-[10px] sm:text-xs font-semibold tracking-wide">
              Out of Stock
            </div>
          ) : id ? (
            <AddToCartButton productId={id} className="flex-1 !text-[11px] sm:!text-xs !py-1.5 sm:!py-2" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default memo(ProductCard, (prev, next) =>
  prev.id === next.id &&
  prev.name === next.name &&
  prev.price === next.price &&
  prev.oldPrice === next.oldPrice &&
  prev.image === next.image &&
  prev.rating === next.rating &&
  prev.reviewCount === next.reviewCount &&
  prev.isB2b === next.isB2b &&
  prev.isBoth === next.isBoth &&
  prev.b2bPrice === next.b2bPrice &&
  prev.stockQuantity === next.stockQuantity &&
  prev.forceB2bPrice === next.forceB2bPrice
)
