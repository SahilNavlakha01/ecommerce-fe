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
    <div className="group relative bg-white rounded-xl overflow-hidden border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col h-full min-w-0">

      {/* ── Image Area (Clean Square Aspect Ratio) ── */}
      <div className="relative overflow-hidden aspect-square bg-[#f8f8f8] flex-shrink-0">

        {/* Floating Wishlist Button */}
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

        {/* Discount Badge */}
        {discountPct > 0 && !isB2bUser && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-rose-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase">
              {discountPct}% OFF
            </span>
          </div>
        )}

        {/* Custom Badge */}
        {badge && !isB2bUser && !discountPct && (
          <div className="absolute top-2 left-2 z-20">
            <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs tracking-wider uppercase">
              {badge}
            </span>
          </div>
        )}

        {/* Rating Floating Chip (Bottom-Left on Photo) */}
        {(displayRating > 0 || displayReviewCount > 0) && (
          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 rounded shadow-xs border border-stone-200/60 pointer-events-none">
            <span className="text-[10px] font-bold text-stone-800 flex items-center gap-0.5">
              <span className="text-amber-500">★</span> {displayRating > 0 ? displayRating.toFixed(1) : '4.5'}
            </span>
            {displayReviewCount > 0 && (
              <>
                <span className="text-stone-300 text-[9px]">|</span>
                <span className="text-stone-500 text-[10px] font-medium">{displayReviewCount}</span>
              </>
            )}
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex items-center justify-center">
            <span className="bg-white text-stone-900 text-xs font-bold px-3 py-1 rounded shadow uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Product Image */}
        <Link href={`/products/${id}`} className="block w-full h-full">
          {!imageError && imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={name}
                className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageSrc('') }}
                loading="lazy"
              />
              {!imageLoaded && <div className="absolute inset-0 bg-stone-100 animate-pulse" />}
            </>
          ) : (
            <img src={getPlaceholderImage()} alt={name} className="w-full h-full object-cover" />
          )}
        </Link>
      </div>

      {/* ── Content Area ── */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1 min-w-0 bg-white">
        
        {/* Brand Tag */}
        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-stone-400 uppercase leading-none">
          NS Collection
        </span>

        {/* Product Title */}
        <Link href={`/products/${id}`} className="block">
          <h3 className="text-xs sm:text-[13px] font-medium text-stone-800 line-clamp-1 group-hover:text-rose-800 transition-colors leading-snug break-words" title={name}>
            {name}
          </h3>
        </Link>

        {/* Price Row */}
        <div className="mt-auto pt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-stone-950">
            ₹{typeof numericPrice === "number" ? numericPrice.toLocaleString("en-IN") : numericPrice}
          </span>
          {numericOldPrice > 0 && !isB2bUser && (
            <span className="text-[11px] sm:text-xs text-stone-400 line-through font-normal">
              ₹{numericOldPrice.toLocaleString("en-IN")}
            </span>
          )}
          {discountPct > 0 && !isB2bUser && (
            <span className="text-[10px] sm:text-[11px] font-bold text-rose-700">
              ({discountPct}% OFF)
            </span>
          )}
        </div>

        {/* Add to Bag Action */}
        <div className="mt-2">
          {isOutOfStock ? (
            <div className="w-full text-center py-1.5 rounded-lg bg-stone-100 text-stone-400 text-xs font-semibold uppercase tracking-wider">
              Out of Stock
            </div>
          ) : id ? (
            <AddToCartButton productId={id} className="w-full !text-xs !py-2 !rounded-lg" />
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
