"use client"
import Link from "next/link"

interface CategoryCardProps {
  name: string
  count: number
  image: string
  href: string
  gradient: string
  icon: string
}

export default function CategoryCard({ name, count, image, href, gradient, icon }: CategoryCardProps) {
  return (
    <Link href={href} className="group block bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className={`relative overflow-hidden ${gradient} aspect-square sm:aspect-[4/3] transition-all duration-300 group-hover:scale-[1.02]`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
        
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-300">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl sm:text-3xl">{icon}</div>
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3">
              <span className="text-white text-xs sm:text-sm font-semibold">{count}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-sm sm:text-lg font-bold mb-1">{name}</h3>
            <p className="text-white/80 text-xs sm:text-sm">Explore Collection</p>
          </div>
        </div>
        
        {/* Hover Arrow */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
      
      {/* Bottom Info - Similar to ProductCard */}
      <div className="p-2 sm:p-3">
        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate group-hover:text-teal-600 transition-colors">
          {name}
        </h4>
        <p className="text-gray-500 text-xs mt-1">
          {count} items available
        </p>
      </div>
    </Link>
  )
}