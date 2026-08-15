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
    <footer className="bg-gradient-to-b from-gray-100 via-gray-50 to-white text-gray-800 relative overflow-hidden font-sans border-t border-gray-200">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <div className="absolute w-48 h-48 rounded-full border border-teal-200 top-10 left-20 blur-[1px]" />
        <div className="absolute w-40 h-40 rounded-full border border-teal-300 bottom-16 right-16 blur-[1px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6">

          {/* Brand Section */}
          <div>
            <div className="mb-6">
              <ProfessionalLogo size="md" showText />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              India’s most trusted online jewelry destination. Discover exquisite designs crafted with precision and elegance.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                {
                  name: "Facebook", href: "https://facebook.com/ethnicsparkles", icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )
                },
                {
                  name: "Instagram", href: "https://www.instagram.com/ethnicsparklesforyou?igsh=MTdidnFyYnZ4d2lteg==", icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )
                },
                {
                  name: "YouTube", href: "https://youtube.com/@ethnicsparkles", icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
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
                  className="w-10 h-10 bg-gray-200 hover:bg-teal-500 rounded-full flex items-center justify-center transition-all duration-200 text-gray-600 hover:text-white shadow-sm hover:shadow-md"
                  title={item.name}
                >
                  {item.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-300 pb-2 font-heading">Shop</h3>
            <ul className="space-y-3 text-sm">
              {[
                ["Shop", "/shop"],
                // ["Cart", "/cart"],
                ["Wishlist", "/wishlist"],
                // ["Checkout", "/checkout"],
                ["B2B Portal", "/b2b"]
              ].map(([label, link]) => (
                <li key={label}>
                  <Link href={link} className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                    <span className="mr-2 text-teal-600">›</span> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-300 pb-2 font-heading">Account & Support</h3>
            <ul className="space-y-3 text-sm">
              {isLoggedIn && (
                <li>
                  <Link href="/account" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                    <span className="mr-2 text-teal-600">›</span> My Account
                  </Link>
                </li>
              )}
              <li>
                <Link href="/contact" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
                  <span className="mr-2 text-teal-600">›</span> Shipping Policy
                </Link>
              </li>
            </ul>
          </div>


        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-gray-300 flex flex-col md:flex-row items-center justify-center text-sm text-gray-600 gap-2 px-1">
          <div className="text-center md:text-center">
            © {currentYear} Ethnic Sparkles. All rights reserved.
            {/* <div className="text-xs text-gray-500 mt-1">Designed with ❤️ in India</div> */}
          </div>
        </div>
      </div>
    </footer>
  )
}
