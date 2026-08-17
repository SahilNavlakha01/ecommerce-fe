"use client";
import EcommerceLayout from "./EcommerceLayout";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import { Suspense, useState, useEffect, useRef } from "react";
import { ProductGridSkeleton } from "../components/ui/Skeleton";
import { GetAllCategories } from "../Services/GetService";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    const category = categories.find((cat: any) => cat.name?.toLowerCase() === categoryName.toLowerCase())
    if (category) {
      router.push(`/shop?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`)
    } else {
      router.push(`/shop?search=${encodeURIComponent(categoryName)}`)
    }
  }

  return (
    <EcommerceLayout>
      <div className="w-full bg-[#faf9f6]">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Value Proposition Strip (Nykaa & Palmonas Inspired) */}
        <section className="bg-white border-y border-stone-200/80 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Premium Finish",
                  subtitle: "Long-lasting luster crafted for daily wear"
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: "100% Skin Friendly",
                  subtitle: "Hypoallergenic, nickel-free & lightweight"
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  ),
                  title: "Gift Ready Packaging",
                  subtitle: "Signature gift box & authenticity tag"
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-rose-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  ),
                  title: "Fast Express Shipping",
                  subtitle: "Free delivery across India above ₹999"
                }
              ].map((prop, i) => (
                <div key={i} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-stone-50/70 border border-stone-200/60 hover:bg-rose-50/40 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-rose-100/70 flex items-center justify-center flex-shrink-0">
                    {prop.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-serif font-bold text-stone-900 leading-tight">
                      {prop.title}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 leading-snug">
                      {prop.subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Products Section with Filter & Search */}
        <section className="bg-white py-10 sm:py-16 border-t border-stone-200/80">
          <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-[0.18em]">
                  TRENDING FASHION PICKS
                </span>
              </div>
              <h2 className="section-title text-stone-900">
                Trending Fashion Jewellery
              </h2>
              <p className="section-subtitle">
                Celebrity-inspired designs, minimal everyday essentials & festive statement pieces
              </p>
            </div>

            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <ProductGrid />
            </Suspense>
          </div>
        </section>

        {/* 5. Editorial Spotlight Banner */}
        <section className="py-12 sm:py-16 bg-[#18181b] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#be123c_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-4 sm:space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-[11px] font-bold text-amber-200 uppercase tracking-[0.2em]">
                    THE FASHION EDIT
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  High Fashion Looks Without The Heavy Price Tag
                </h2>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed font-light">
                  Upgrade your jewellery collection with NS Collection. Expertly crafted with premium polish and long-lasting shine, each piece gives you a glamorous look tailored for weddings, parties, college, and daily styling.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 text-stone-950 font-bold rounded-full text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
                  >
                    <span>Shop Trending Fashion Styles</span>
                  </Link>
                </div>
              </div>

              {/* Visual Collage */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] bg-stone-900">
                    <img src="/images/Ring.jpeg" alt="Fashion Ring" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
                    <p className="text-amber-300 font-serif font-bold text-lg">50,000+</p>
                    <p className="text-stone-400 text-xs">Happy Fashion Lovers</p>
                  </div>
                </div>
                <div className="space-y-4 pt-6">
                  <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
                    <p className="text-amber-300 font-serif font-bold text-lg">100% Quality</p>
                    <p className="text-stone-400 text-xs">Assured Craftsmanship</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/5] bg-stone-900">
                    <img src="/images/Earrings.jpeg" alt="Fashion Earrings" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Signature Collections Showcase */}
        <section className="bg-white py-12 sm:py-16 lg:py-20 border-b border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-[0.18em]">
                  SIGNATURE COLLECTIONS
                </span>
              </div>
              <h2 className="section-title text-stone-900">
                Trending Fashion Collections
              </h2>
              <p className="section-subtitle">
                Handpicked designs crafted to complement every Indian & Western outfit
              </p>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Rings', tag: 'EXCLUSIVE', img: '/images/Ring.jpeg', desc: 'Chic stackables, cocktail rings, and adjustable daily wear bands.' },
                { name: 'Chains', tag: 'TRENDING', img: '/images/Chain.jpeg', desc: 'Layered chains, choker sets, and statement pendant necklaces.' },
                { name: 'Earrings', tag: 'HERITAGE', img: '/images/Earrings.jpeg', desc: 'Glamorous jhumkas, trendy hoops, and elegant stud earrings.' },
                { name: 'Bracelets', tag: 'LUXE', img: '/images/Bracelet.jpeg', desc: 'Designer bangles, charm bracelets, and adjustable cuff wear.' },
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleCollectionClick(item.name)}
                  className="group relative bg-[#faf9f6] rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-56 overflow-hidden bg-stone-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 bg-rose-900 text-amber-200 text-[10px] font-bold rounded-full shadow-sm tracking-wider">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 mb-1 group-hover:text-rose-900 transition-colors">
                        {item.name} Collection
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>
                    <button className="luxury-btn w-full !text-xs !py-2.5">
                      <span>Explore Collection</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Testimonials Section (Palmonas & Nykaa Review Style) */}
        <section className="py-14 sm:py-20 bg-[#faf9f6] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-[0.18em]">
                  CUSTOMER LOVE
                </span>
              </div>
              <h2 className="section-title text-stone-900">
                Loved By Fashion Enthusiasts
              </h2>
              <p className="section-subtitle">
                Over 50,000+ verified shoppers across India style their daily looks with NS Collection
              </p>
            </div>
          </div>
          <TestimonialCarousel />
        </section>

      </div>
    </EcommerceLayout>
  );
}

const TESTIMONIALS = [
  { name: 'Priya Sharma', location: 'Mumbai', text: 'The shine and polish is unbelievable! I wear my necklace set regularly and it still looks fresh and brand new.', img: 'priya', stars: 5 },
  { name: 'Anita Gupta', location: 'Delhi', text: 'Received so many compliments on my layered chain & earring set. Looks like designer jewellery without burning a hole in the pocket.', img: 'anita', stars: 5 },
  { name: 'Sneha Patel', location: 'Ahmedabad', text: 'Zero skin irritation and super lightweight! The rings and bracelet set have become my everyday accessories.', img: 'sneha', stars: 5 },
  { name: 'Meera Nair', location: 'Kochi', text: 'Ordered earrings for a festive party. The packaging, sparkle, and detailing completely exceeded my expectations.', img: 'meera', stars: 5 },
  { name: 'Kavya Reddy', location: 'Hyderabad', text: 'Super fast delivery and the complimentary gift box packaging made it feel like a luxury shopping experience!', img: 'kavya', stars: 5 },
  { name: 'Divya Menon', location: 'Chennai', text: 'Anti-tarnish and comfortable. Wore it all day during a wedding function with zero heaviness. Loved it!', img: 'divya', stars: 5 },
];

function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .testimonial-track {
          will-change: transform;
          animation: scroll-left 36s linear infinite;
        }
        .testimonial-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="overflow-hidden py-4">
        <div ref={trackRef} className="testimonial-track flex gap-5 w-max">
          {doubled.map((t, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-stone-200/80 w-80 sm:w-88 flex-shrink-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(t.stars)].map((_, j) => (
                      <svg key={j} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Verified Buyer
                  </span>
                </div>
                <p className="text-stone-700 mb-5 leading-relaxed font-sans text-xs sm:text-sm">
                  "{t.text}"
                </p>
              </div>
              <div className="flex items-center pt-3 border-t border-stone-100">
                <div className="w-9 h-9 bg-rose-900 rounded-full flex items-center justify-center text-amber-200 font-bold text-xs mr-3 flex-shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-serif font-bold text-stone-900 text-xs sm:text-sm">{t.name}</p>
                  <p className="text-[11px] text-stone-400">{t.location}, India</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
