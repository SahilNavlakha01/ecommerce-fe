import type { Metadata } from 'next'
import EcommerceLayout from '../EcommerceLayout'
import { Gem, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Ethnic Sparkles',
  description: 'Discover the story behind Ethnic Sparkles — where traditional Indian craftsmanship meets contemporary fashion jewelry.',
  openGraph: { title: 'About Ethnic Sparkles', url: '/about' },
}

const values = [
  { icon: Gem, title: 'Modern Craftsmanship', desc: 'Every piece is crafted with best of inputs be it design or built.' },
  { icon: ShieldCheck, title: 'Quality Assured', desc: 'Premium materials and rigorous quality checks on every collection.' },
  { icon: Heart, title: 'Designed with Love', desc: 'Passion poured into every curve, stone setting, and finish.' },
  { icon: Sparkles, title: 'Trend-Forward', desc: 'Timeless ethnic motifs blended with modern silhouettes.' },
]

const stats = [
  { value: '10,000+', label: 'Happy Customers' },
  { value: '500+', label: 'Unique Designs' },
  { value: '15+', label: 'Years of Craft' },
  { value: '50+', label: 'Artisan Partners' },
]

export default function About() {
  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-[#026670] py-20 md:py-28 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fce181 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fce181 0%, transparent 40%)' }} />
          <div className="relative max-w-3xl mx-auto px-4">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fce181]">Our Story</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-5 leading-tight">
              Jewelry That Speaks<br className="hidden md:block" /> Your Language
            </h1>
            <p className="text-white/75 text-lg leading-relaxed">
              At Ethnic Sparkles, we believe fashion jewelry is more than adornment — it's an expression of culture, confidence, and individuality.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-[#fce181]/40 bg-[#fce181]/10">
          <div className="max-w-4xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-[#026670]">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="max-w-4xl mx-auto px-4 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#026670]">Who We Are</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2 mb-5">Tradition Meets Modern Elegance</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Ethnic Sparkle, we celebrate the timeless charm of tradition with a touch of modern elegance. As a proud part of EEAS Lifestyle, our journey is rooted in a simple yet powerful idea — to bring the richness of ethnic artistry into everyday style.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe jewellery is more than an accessory; it is an expression of identity, culture, and emotion. Each piece we curate reflects a story — inspired by heritage, crafted with care, and designed for the contemporary individual who values authenticity and grace.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                From statement pieces that capture attention to subtle designs that whisper elegance, Ethnic Sparkle blends tradition with trend, ensuring there is something for every mood, occasion, and personality.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Driven by a passion for quality and aesthetics, we are committed to offering designs that not only enhance your look but also resonate with your spirit. Whether it’s a celebration, a special moment, or simply everyday elegance — we are here to add that perfect sparkle.
              </p>
              <p className="text-[#026670] font-bold">
                Ethnic Sparkle — where tradition shines, and style evolves.
              </p>
            </div>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#026670]/10 to-[#fce181]/30 flex items-center justify-center border border-[#026670]/10">
              <div className="text-center p-8">
                <Gem className="w-14 h-14 text-[#026670]/40 mx-auto mb-3" />
                <p className="text-[#026670]/50 font-medium text-sm">Crafted with Tradition</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#026670]">What We Stand For</span>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#026670]/30 hover:shadow-md transition-all duration-300 group">
                  <div className="w-11 h-11 rounded-xl bg-[#026670]/10 flex items-center justify-center mb-4 group-hover:bg-[#026670] transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#026670] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#026670] py-16 text-center text-white">
          <div className="max-w-xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-3">Find Your Perfect Piece</h2>
            <p className="text-white/70 mb-8">Explore our latest collections and discover jewelry made for you.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#fce181] text-[#026670] font-bold px-8 py-3 rounded-full hover:bg-white transition-colors duration-300"
            >
              Shop Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    </EcommerceLayout>
  )
}
