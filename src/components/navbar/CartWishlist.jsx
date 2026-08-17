"use client"

import Link from "next/link"
import CartSummary from "../CartSummary"

export default function CartWishlist({ 
  totalItems, 
  wishCount, 
  showCartSummary, 
  setShowCartSummary,
  isMobile = false 
}) {
  return (
    <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
      <Link
        href="/wishlist"
        aria-label="Wishlist"
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-stone-100/80 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-200 transition-all duration-200 group shadow-none"
      >
        <svg className="w-4 h-4 text-stone-700 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {wishCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] rounded-full w-4 h-4 min-w-[16px] min-h-[16px] flex items-center justify-center font-bold shadow-sm">
            {wishCount}
          </span>
        )}
      </Link>

      <div className="relative flex items-center">
        <Link
          href="/cart"
          aria-label="Shopping Bag"
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-stone-100/80 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-200 transition-all duration-200 group shadow-none"
        >
          <svg className="w-4 h-4 text-stone-700 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-900 text-white text-[10px] rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center font-bold shadow-sm px-1">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={() => setShowCartSummary(!showCartSummary)}
            className="ml-0.5 flex items-center justify-center w-4 h-9 text-stone-400 hover:text-rose-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        <CartSummary isOpen={showCartSummary} onClose={() => setShowCartSummary(false)} />
      </div>
    </div>
  )
}