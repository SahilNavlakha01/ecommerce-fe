import Link from 'next/link'

const categories = [
  { name: "Rings", image: "/images/product01.jpeg", count: 124, icon: "💍" },
  { name: "Necklaces", image: "/images/product02.jpeg", count: 87, icon: "📿" },
  { name: "Earrings", image: "/images/product03.jpeg", count: 156, icon: "👂" },
  { name: "Bracelets", image: "/images/product01.jpeg", count: 92, icon: "🔗" },
  { name: "Pendants", image: "/images/product02.jpeg", count: 68, icon: "🔮" },
  { name: "Bangles", image: "/images/product03.jpeg", count: 43, icon: "⭕" },
  { name: "Anklets", image: "/images/product04.jpeg", count: 37, icon: "🦶" },
  { name: "Sets", image: "/images/product05.jpeg", count: 28, icon: "💎" }
]

export default function Categories() {
  return (
    <section className="py-16 bg-white font-sans">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 font-heading">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our curated collections of exquisite jewelry
          </p>
          <div className="w-20 h-1 mx-auto mt-4 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px sm:gap-4">
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              href={`/products?category=${encodeURIComponent(cat.name)}`} 
              className="group block bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square sm:aspect-[4/3] transition-all duration-300 group-hover:scale-[1.02]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-600/0 group-hover:from-teal-500/10 group-hover:to-teal-600/10 transition-all duration-300"></div>
              </div>
              
              <div className="p-2 sm:p-3">
                <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate group-hover:text-teal-600 transition-colors font-heading">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1">
                  {cat.count} items
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/products" 
             className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm">
            View All Categories
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}