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
    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-1.5'}`}>
      <Link
        href="/wishlist"
        className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200 group"
      >
        <svg className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {wishCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center font-bold shadow">
            {wishCount}
          </span>
        )}
      </Link>

      <div className="relative flex items-center">
        <Link
          href="/cart"
          className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 transition-all duration-200 group"
        >
          <svg className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-[10px] rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center font-bold shadow px-1">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
        {!isMobile && (
          <button
            onClick={() => setShowCartSummary(!showCartSummary)}
            className="ml-0.5 flex items-center justify-center w-5 h-9 text-gray-400 hover:text-teal-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        <CartSummary isOpen={showCartSummary} onClose={() => setShowCartSummary(false)} />
      </div>
    </div>
  )
}