"use client"
import Link from "next/link"
import { useState } from "react"

const categories = [
  {
    name: 'Mangalsutras',
    image: '/images/product01.jpeg',
    href: '/products?category=mangalsutras',
    description: 'Traditional elegance',
    count: 24
  },
  {
    name: 'Rings',
    image: '/images/product02.jpeg',
    href: '/products?category=rings',
    description: 'Timeless beauty',
    count: 48
  },
  {
    name: 'Earrings',
    image: '/images/product03.jpeg',
    href: '/products?category=earrings',
    description: 'Graceful charm',
    count: 36
  },
  {
    name: 'Toe Rings',
    image: '/images/product04.jpeg',
    href: '/products?category=toe-rings',
    description: 'Delicate detail',
    count: 18
  },
  {
    name: 'Bracelets',
    image: '/images/product01.jpeg',
    href: '/products?category=bracelets',
    description: 'Elegant wristwear',
    count: 32
  },
  {
    name: 'Anklets',
    image: '/images/product02.jpeg',
    href: '/products?category=anklets',
    description: 'Subtle sparkle',
    count: 22
  }
]

export default function ShopByCategory() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <>
      <style jsx global>{`
        :root {
          /* Luxury Brand Color Palette */
          --luxury-teal: #026670;      /* Deep Teal - Primary brand color */
          --luxury-mint: #9fedd7;      /* Mint - Accent color */
          --luxury-vanilla: #fef9c7;   /* Vanilla - Soft background */
          --luxury-gold: #fce181;      /* Gold - Highlight/CTA color */
          --luxury-stone: #edeae5;     /* Warm Gray - Neutral base */
        }
      `}</style>

      <div className="py-16 sm:py-20 lg:py-28 bg-white relative overflow-hidden font-sans">
        {/* Elegant Background */}
        <div className="absolute inset-0">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--luxury-stone)]/10 via-white to-[var(--luxury-vanilla)]/10"></div>

          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--luxury-mint)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[var(--luxury-vanilla)]/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-[var(--luxury-gold)]/3 to-transparent rounded-full blur-3xl"></div>

          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23026670' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 lg:mb-20">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--luxury-teal)] to-[var(--luxury-teal)] w-24"></div>
              <div className="mx-6 p-3 bg-gradient-to-br from-[var(--luxury-vanilla)] to-[var(--luxury-gold)] rounded-full shadow-lg">
                <svg className="w-8 h-8 text-[var(--luxury-teal)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="h-px bg-gradient-to-r from-[var(--luxury-teal)] to-transparent w-24"></div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--luxury-teal)] mb-6 font-heading">
              Shop By Category
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-light">
              Discover our curated collection of exquisite jewelry pieces, crafted with precision and love
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={category.href}
                className="group block text-center"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <div className="relative mb-6">
                  {/* Image Container */}
                  <div className={`relative aspect-square rounded-2xl overflow-hidden bg-white border border-[var(--luxury-stone)]/30 transition-all duration-700 ${hoveredCategory === category.name ? 'shadow-2xl transform scale-105' : 'shadow-lg'}`}>
                    <div className="w-full h-full rounded-2xl bg-[var(--luxury-stone)]/20 p-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className={`w-full h-full object-cover rounded-xl transition-all duration-700 ${hoveredCategory === category.name ? 'scale-110' : 'scale-100'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          // Show placeholder as fallback
                          const parent = target.parentElement
                          if (parent) {
                            const placeholder = document.createElement('div')
                            placeholder.className = 'w-full h-full bg-gradient-to-br from-[var(--luxury-stone)] to-[var(--luxury-mint)]/30 rounded-xl flex items-center justify-center'
                            placeholder.innerHTML = `<svg class="w-12 h-12 text-[var(--luxury-teal)]/30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                    </div>

                    {/* Hover Overlay */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ${hoveredCategory === category.name ? 'opacity-100' : 'opacity-0'}`}></div>

                    {/* Category Count Badge */}
                    <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg transition-all duration-500 ${hoveredCategory === category.name ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      <span className="text-xs font-semibold text-[var(--luxury-teal)]">{category.count} items</span>
                    </div>
                  </div>
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <h3 className="text-gray-900 font-bold text-base lg:text-lg font-heading">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-16 lg:mt-20">
            <Link
              href="/collections"
              className={`
                inline-flex items-center justify-center px-8 py-4 
                bg-gradient-to-r from-[var(--luxury-teal)] to-[var(--luxury-mint)] text-white font-bold rounded-full
                hover:from-[var(--luxury-mint)] hover:to-[var(--luxury-teal)] focus:outline-none focus:ring-4 focus:ring-[var(--luxury-teal)]/30
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-500 transform hover:scale-105 hover:shadow-xl
                text-lg font-serif
              `}
            >
              <span>View All Collections</span>
              <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}