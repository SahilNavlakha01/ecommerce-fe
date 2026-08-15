"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useCart } from "../../hooks/useCart"

export default function MobileMenu({ isLoggedIn, categories = [] }) {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const [showCategories, setShowCategories] = useState(false)

  const isActive = (href) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const closeCategories = () => setShowCategories(false)

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-14">

          {/* Home */}
          <Link href="/" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/') ? 'text-teal-600' : 'text-gray-400 active:text-teal-600'}`}>
            <svg className="w-[22px] h-[22px]" fill={isActive('/') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] font-semibold tracking-wide">Home</span>
          </Link>

          {/* Shop */}
          <Link href="/shop" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/shop') ? 'text-teal-600' : 'text-gray-400 active:text-teal-600'}`}>
            <svg className="w-[22px] h-[22px]" fill={isActive('/shop') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[9px] font-semibold tracking-wide">Shop</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="flex flex-col items-center justify-center gap-0.5 relative">
            <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-md -translate-y-3 transition-colors ${isActive('/cart') ? 'bg-teal-700' : 'bg-teal-600'}`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5 leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-semibold tracking-wide -mt-2 ${isActive('/cart') ? 'text-teal-600' : 'text-gray-400'}`}>Cart</span>
          </Link>

          {/* Categories */}
          <button
            type="button"
            onClick={() => setShowCategories(true)}
            className={`flex flex-col items-center justify-center gap-0.5 ${showCategories ? 'text-teal-600' : 'text-gray-400 active:text-teal-600'}`}
          >
            <svg className="w-[22px] h-[22px]" fill={showCategories ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h10M4 17h16" />
            </svg>
            <span className="text-[9px] font-semibold tracking-wide">Categories</span>
          </button>

          {/* Account / Login */}
          {isLoggedIn ? (
            <Link href="/account" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/account') ? 'text-teal-600' : 'text-gray-400 active:text-teal-600'}`}>
              <svg className="w-[22px] h-[22px]" fill={isActive('/account') ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-[9px] font-semibold tracking-wide">Account</span>
            </Link>
          ) : (
            <Link href="/auth/otp-login" className={`flex flex-col items-center justify-center gap-0.5 ${isActive('/auth') ? 'text-teal-600' : 'text-gray-400 active:text-teal-600'}`}>
              <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-[9px] font-semibold tracking-wide">Login</span>
            </Link>
          )}

        </div>
      </nav>

      {showCategories && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            onClick={closeCategories}
            aria-label="Close categories"
          />
          <div className="absolute left-2 right-2 bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] sm:left-4 sm:right-4 sm:bottom-[calc(3.5rem+env(safe-area-inset-bottom)+1rem)] rounded-t-3xl sm:rounded-3xl bg-white shadow-[0_18px_60px_rgba(15,23,42,0.25)] border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-white to-teal-50/40">
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">Select Category</h3>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Jump straight to a category</p>
              </div>
              <button
                type="button"
                onClick={closeCategories}
                className="shrink-0 rounded-full p-2.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition"
                aria-label="Close category drawer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto overscroll-contain p-2 sm:p-3">
              <Link
                href="/shop"
                onClick={closeCategories}
                className={`flex items-center justify-between rounded-2xl px-4 py-4 text-sm sm:text-base font-medium transition-colors ${pathname === '/shop' ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-100' : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'}`}
              >
                <span>All Categories</span>
                <span className="text-xs text-gray-400">View all</span>
              </Link>
              {categories.length === 0 ? (
                <div className="px-4 py-6 text-sm text-gray-500 text-center">No categories available</div>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}
                    onClick={closeCategories}
                    className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm sm:text-base font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100 transition-colors"
                  >
                    <span className="pr-3 truncate">{cat.name}</span>
                    <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
