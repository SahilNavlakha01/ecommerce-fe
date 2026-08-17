"use client"
import Link from "next/link"
import { useState } from "react"

const categories = [
  {
    name: 'Rings',
    image: '/images/Ring.jpeg',
    href: '/shop?category=rings',
    description: 'Solitaires, Bands & Stacks',
    count: '40+ Styles'
  },
  {
    name: 'Earrings',
    image: '/images/Earrings.jpeg',
    href: '/shop?category=earrings',
    description: 'Jhumkas, Hoops & Studs',
    count: '60+ Styles'
  },
  {
    name: 'Necklaces & Chains',
    image: '/images/Chain.jpeg',
    href: '/shop?category=chains',
    description: 'Pendants & Layered Chains',
    count: '35+ Styles'
  },
  {
    name: 'Bracelets',
    image: '/images/Bracelet.jpeg',
    href: '/shop?category=bracelets',
    description: 'Cuffs & Charm Bracelets',
    count: '25+ Styles'
  },
  {
    name: 'Mangalsutras',
    image: '/images/product01.jpeg',
    href: '/shop?category=mangalsutras',
    description: 'Modern Minimal & Bridal Edit',
    count: '20+ Styles'
  },
  {
    name: 'Anklets',
    image: '/images/product02.jpeg',
    href: '/shop?category=anklets',
    description: 'Trending Payals & Anklets',
    count: '15+ Styles'
  }
]

export default function ShopByCategory() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#faf9f6] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-[0.18em]">
              EXPLORE BY CATEGORY
            </span>
          </div>
          <h2 className="section-title text-stone-900">
            Shop Trending Categories
          </h2>
          <p className="section-subtitle">
            Explore curated fashion jewellery pieces designed for daily styling, celebrations & gifting
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center text-center"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Circular Avatar Container with Gold Accent Border */}
              <div className="relative mb-3.5 sm:mb-4">
                <div className={`w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full p-1 transition-all duration-500 ${
                  hoveredCategory === category.name
                    ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-amber-300 shadow-xl shadow-rose-900/15 scale-105'
                    : 'bg-stone-200/80 hover:bg-stone-300'
                }`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/images/Ring.jpeg'
                      }}
                    />
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                </div>

                {/* Micro Badge */}
                <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-sm border border-stone-200/80 shadow-sm rounded-full px-2.5 py-0.5 text-[10px] font-bold text-rose-900">
                  {category.count}
                </div>
              </div>

              {/* Category Info */}
              <div className="space-y-0.5">
                <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900 group-hover:text-rose-900 transition-colors">
                  {category.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10 sm:mt-14">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-7 py-3 bg-white hover:bg-stone-50 text-stone-900 font-bold rounded-full border border-stone-300/90 shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm uppercase tracking-wider group"
          >
            <span>Explore All Categories</span>
            <svg className="w-4 h-4 ml-2 text-rose-800 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  )
}