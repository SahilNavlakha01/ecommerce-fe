'use client'

import { useWishlist } from '../hooks/useWishlist'
import { useState, useEffect, memo, useCallback } from 'react'
import { cn } from '../utils/cn'

interface Product {
  id: string | number;
  name: string;
  price: number;
  imageUrl: string;
}

interface WishlistButtonProps {
  productId: string | number;
  product?: Product | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  product = null, 
  className = "", 
  size = "md",
  showTooltip = true 
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!mounted || isProcessing) return
    
    setIsProcessing(true)
    
    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId)
      } else {
        await addToWishlist(product || productId)
      }
    } finally {
      setTimeout(() => setIsProcessing(false), 300)
    }
  }, [mounted, isProcessing, isInWishlist, productId, removeFromWishlist, addToWishlist, product])

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  }

  if (!mounted) {
    return (
      <button className={cn("bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 shadow-md text-gray-400", sizeClasses[size], className)}>
        <svg className={cn("transition-all duration-300", iconSizes[size])} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    )
  }

  const isInWish = isInWishlist(productId)

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isProcessing}
        className={cn(
          "bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          sizeClasses[size],
          isInWish 
            ? 'text-red-500 hover:bg-red-50 shadow-red-100' 
            : 'text-gray-400 hover:text-red-500 hover:bg-red-50',
          className
        )}

      >
        <svg 
          className={cn("transition-all duration-300", iconSizes[size])} 
          fill={isInWish ? "currentColor" : "none"} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </button>
      
      {showTooltip && isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 opacity-90">
          {isInWish ? 'Remove from wishlist' : 'Add to wishlist'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}

export default memo(WishlistButton, (prevProps, nextProps) => {
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.product === nextProps.product &&
    prevProps.className === nextProps.className &&
    prevProps.size === nextProps.size &&
    prevProps.showTooltip === nextProps.showTooltip
  );
});
