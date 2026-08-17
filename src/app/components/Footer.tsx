"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import ProfessionalLogo from '@/components/ui/ProfessionalLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
    setIsLoggedIn(!!userData)
  }, [])

  return (
    <footer className="bg-[#18181b] text-stone-300 relative overflow-hidden font-sans border-t border-rose-950/40">
      {/* Subtle background glow */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-rose-700/20 top-0 left-1/4 blur-3xl" />
        <div className="absolute w-96 h-96 rounded-full bg-amber-500/20 bottom-0 right-1/4 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
              <ProfessionalLogo size="md" variant="white" showText />
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              India’s premier fashion jewellery destination. Discover trending earrings, necklaces, rings, and bracelets crafted with premium 18K gold polish and anti-tarnish finish for everyday styling.
            </p>

            <div className="pt-2 flex flex-wrap gap-2.5">
              {[
                {
                  name: "Instagram", href: "https://www.instagram.com/nscollection", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )
                },
                {
                  name: "Facebook", href: "https://facebook.com/nscollection", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )
                },
                {
                  name: "YouTube", href: "https://youtube.com/@nscollection", icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  )
                }
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-rose-900 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white transition-all duration-200"
                  title={item.name}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-4 text-amber-200">Shop Collections</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                ["All Jewellery", "/shop"],
                ["Rings & Solitaires", "/shop?category=rings"],
                ["Chains & Necklaces", "/shop?category=chains"],
                ["Earrings & Hoops", "/shop?category=earrings"],
                ["Bracelets & Cuffs", "/shop?category=bracelets"],
                ["B2B Wholesale Portal", "/b2b"]
              ].map(([label, link]) => (
                <li key={label}>
                  <Link href={link} className="text-stone-400 hover:text-rose-300 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Policies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] mb-4 text-amber-200">Customer Care</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {isLoggedIn && (
                <li>
                  <Link href="/account" className="text-stone-400 hover:text-rose-300 transition-colors">
                    My Account
                  </Link>
                </li>
              )}
              <li>
                <Link href="/contact" className="text-stone-400 hover:text-rose-300 transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-stone-400 hover:text-rose-300 transition-colors">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-stone-400 hover:text-rose-300 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-stone-400 hover:text-rose-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-stone-400 hover:text-rose-300 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">The NS Promise</h3>
            <div className="space-y-3 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <span className="text-amber-400">✓</span>
                <span>Premium Long-Lasting Finish</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400">✓</span>
                <span>Hypoallergenic & 100% Skin Friendly</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400">✓</span>
                <span>Free Express Shipping Across India</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400">✓</span>
                <span>Cash on Delivery (COD) Available</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {currentYear} NS Collection. All rights reserved. Handcrafted with passion in India.
          </div>
          <div className="flex items-center gap-4 text-stone-400 text-xs">
            <span>🔒 100% Secure Checkout</span>
            <span>•</span>
            <span>UPI / Cards / NetBanking / COD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
