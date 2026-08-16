"use client";
import EcommerceLayout from "./EcommerceLayout";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import ShopByCategory from "./components/ShopByCategory";
import { Suspense, useState, useEffect, useRef } from "react";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { GetAllCategories } from "../Services/GetService";
import { useRouter } from "next/navigation";
import B2bProductShowcase from "./components/B2bProductShowcase";

export default function HomePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [isB2bUser, setIsB2bUser] = useState(false)

  useEffect(() => {
    fetchCategories()
    checkUserRole()
  }, [])

  const checkUserRole = () => {
    if (typeof document === 'undefined') return;
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        setIsB2bUser(parsedData.userRole === 2);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await GetAllCategories()
      if (response?.data.data) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleCollectionClick = (categoryName: string) => {
    const category = categories.find((cat: any) => cat.name === categoryName)
    if (category) {
      router.push(`/shop?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`)
    }
  }

  return (
    <EcommerceLayout>
      <style jsx global>{`
        :root {
          /* Luxury Brand Color Palette */
          --luxury-teal: #026670;      /* Deep Teal - Primary brand color */
          --luxury-mint: #9fedd7;      /* Mint - Accent color */
          --luxury-vanilla: #fef9c7;   /* Vanilla - Soft background */
          --luxury-gold: #fce181;      /* Gold - Highlight/CTA color */
          --luxury-stone: #edeae5;     /* Warm Gray - Neutral base */
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: var(--luxury-stone);
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--luxury-teal);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #014d5a;
        }
        
        /* Base button styles */
       :root {
  --teal-700: #0f766e;
  --teal-600: #0d9488;
  --emerald-400: #34d399;
  --teal-800: #115e59;
}

        
        /* Section title styles */
        .section-title {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--luxury-teal);
          margin-bottom: 1rem;
          text-align: center;
          letter-spacing: 0.02em;
        }

        .section-subtitle {
          font-family: var(--font-accent);
          font-size: 1.125rem;
          color: #4b5563;
          max-width: 800px;
          margin: 0 auto 3rem;
          text-align: center;
          line-height: 1.6;
          font-style: italic;
        }
        
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        
        .section-divider-line {
          height: 1px;
          width: 80px;
          background: linear-gradient(to right, transparent, var(--luxury-teal), transparent);
        }
        
        .section-divider-icon {
          margin: 0 1.5rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, var(--luxury-vanilla), var(--luxury-gold));
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <div className="w-full bg-white">
        {/* Hero Section */}
        <Hero />

        {/* Products Section with Filter */}
        <section className="bg-gray-50">
          <div className="w-full">
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>

        {/* Collection Showcase */}
        <section className="bg-white lg:pb-16">
          <div className="w-full mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="section-divider">
                <div className="section-divider-line"></div>
                <div className="section-divider-icon">
                  <svg className="w-8 h-8 text-[var(--luxury-teal)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="section-divider-line"></div>
              </div>
              <h2 className="section-title">Our Signature Collections</h2>
              <p className="section-subtitle">
                Where timeless elegance meets contemporary design
              </p>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Rings Collection */}
              <div onClick={() => handleCollectionClick('Rings')} className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer will-change-transform">
                <div className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src="/images/Ring.jpeg" alt="Rings Collection" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] text-[var(--luxury-teal)] text-xs font-bold rounded-full shadow-lg">EXCLUSIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Rings Collection</h3>
                      <div className="w-12 h-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] mb-3"></div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">Exquisite rings for life's special moments. From engagement to statement pieces.</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCollectionClick('Rings'); }} className="luxury-btn w-full">
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chains Collection */}
              <div onClick={() => handleCollectionClick('Chains')} className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer will-change-transform">
                <div className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src="/images/Chain.jpeg" alt="Chains Collection" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] text-[var(--luxury-teal)] text-xs font-bold rounded-full shadow-lg">PREMIUM</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Chains Collection</h3>
                      <div className="w-12 h-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] mb-3"></div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">Elegant chains for every style. Our chains collection features versatile pieces that complement any outfit.</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCollectionClick('Chains'); }} className="luxury-btn w-full">
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Earrings Collection */}
              <div onClick={() => handleCollectionClick('Earrings')} className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer will-change-transform">
                <div className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src="/images/Earrings.jpeg" alt="Earrings Collection" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] text-[var(--luxury-teal)] text-xs font-bold rounded-full shadow-lg">HERITAGE</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Earrings Collection</h3>
                      <div className="w-12 h-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] mb-3"></div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">Stunning earrings for every occasion. From studs to chandeliers, find your perfect pair.</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCollectionClick('Earrings'); }} className="luxury-btn w-full">
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bracelets Collection */}
              <div onClick={() => handleCollectionClick('Bracelets')} className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer will-change-transform">
                <div className="h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src="/images/Bracelet.jpeg" alt="Bracelets Collection" className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] text-[var(--luxury-teal)] text-xs font-bold rounded-full shadow-lg">ELEGANCE</span>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 font-heading">Bracelets Collection</h3>
                      <div className="w-12 h-1 bg-gradient-to-r from-[var(--luxury-gold)] to-[var(--luxury-vanilla)] mb-3"></div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">Beautiful bracelets to adorn your wrist. From delicate to bold, express your style.</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleCollectionClick('Bracelets'); }} className="luxury-btn w-full">
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </section>

        {/* B2B Showcase - Only for retail/guest users */}
        {/* {!isB2bUser && <B2bProductShowcase />} */}

        {/* Testimonials Section */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
          <div className="px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 text-lg">Join thousands of satisfied jewelry lovers</p>
            </div>
          </div>
          <TestimonialCarousel />
        </section>

        {/* Why Choose Section */}
        <section>

        </section>
        <section className="py-16 bg-white">
          <div className="px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4">Why Shop With Us?</h2>
              <p className="text-gray-600 text-lg">Your trusted fashion jewelry destination</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{ icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Affordable Prices', text: 'Premium quality fashion jewelry at prices that won\'t break the bank. Great value for money.' },
              { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Quality Assured', text: 'Each piece is carefully crafted with attention to detail. Durable and long-lasting designs.' },
              { icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', title: 'Skin-Friendly Materials', text: 'All our jewelry is hypoallergenic and nickel-free. Safe for sensitive skin with anti-tarnish coating.' }].map((feature, i) => (
                <div key={i} className="group bg-gradient-to-br from-teal-50 via-white to-teal-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-2 border-teal-100 hover:border-teal-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-teal-700 mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </EcommerceLayout>
  );
}


const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'Beautiful designs and excellent quality! The jewelry looks exactly like the pictures. Very happy with my purchase.', img: 'priya', stars: 5 },
  { name: 'Anita Gupta', location: 'Delhi', text: 'Love the trendy collection! Perfect for daily wear and special occasions. Great value for money.', img: 'anita', stars: 5 },
  { name: 'Ravi Kumar', location: 'Bangalore', text: 'Fast delivery and secure packaging. The jewelry is stunning and my wife absolutely loves it!', img: 'ravi', stars: 5 },
  { name: 'Sneha Patel', location: 'Ahmedabad', text: 'The anti-tarnish coating is amazing. My necklace still looks brand new after 3 months of daily wear!', img: 'sneha', stars: 5 },
  { name: 'Meera Nair', location: 'Kochi', text: 'Ordered earrings for my daughter\'s wedding. Everyone complimented how gorgeous they looked. Highly recommend!', img: 'meera', stars: 5 },
  { name: 'Kavya Reddy', location: 'Hyderabad', text: 'Skin-friendly jewelry that doesn\'t cause any irritation. Finally found my go-to jewelry brand!', img: 'kavya', stars: 5 },
  { name: 'Pooja Singh', location: 'Jaipur', text: 'The NS Collection is breathtaking. Got so many compliments at the festival. Will definitely order again.', img: 'pooja', stars: 5 },
  { name: 'Divya Menon', location: 'Chennai', text: 'Affordable yet premium quality. The bracelet set I ordered is absolutely gorgeous and well-crafted.', img: 'divya', stars: 5 },
  { name: 'Sunita Joshi', location: 'Pune', text: 'Packaging was beautiful and the jewelry exceeded my expectations. Perfect gifting option too!', img: 'sunita', stars: 5 },
  { name: 'Rekha Verma', location: 'Lucknow', text: 'The ring collection is stunning. Fits perfectly and the finish is so elegant. Love this brand!', img: 'rekha', stars: 5 },
];

function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .testimonial-track {
          animation: scroll-left 35s linear infinite;
        }
        .testimonial-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="overflow-hidden py-4">
        <div ref={trackRef} className="testimonial-track flex gap-6 w-max">
          {doubled.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 w-80 flex-shrink-0">
              <div className="flex mb-3">
                {[...Array(t.stars)].map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-5 leading-relaxed italic text-sm">"{t.text}"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-400 rounded-full overflow-hidden mr-3 flex-shrink-0">
                  <img src={`https://picsum.photos/seed/${t.img}/100/100.jpg`} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-teal-600">{t.location}, India</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
