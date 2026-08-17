"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { GetActiveBanners } from "@/Services/GetService"

const DEFAULT_EDITORIAL_SLIDES = [
  {
    id: 1,
    image: "/images/Ring.jpeg",
    title: "Trending Fashion Jewellery For Modern Women",
    subtitle: "Premium Polish • Lightweight • 100% Skin Friendly & Daily Wear",
    tag: "TRENDING COLLECTION",
    link: "/shop"
  },
  {
    id: 2,
    image: "/images/Earrings.jpeg",
    title: "Celebrity-Inspired Statement Looks",
    subtitle: "From Daily College & Office Wear to Wedding Festive Glam",
    tag: "NEW DROPS",
    link: "/shop"
  },
  {
    id: 3,
    image: "/images/Bracelet.jpeg",
    title: "Chic Accessories Under ₹999",
    subtitle: "Handcrafted designs with complimentary gift packaging",
    tag: "BESTSELLERS",
    link: "/shop"
  }
]

export default function Hero() {
  const [slides, setSlides] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const res = await GetActiveBanners()
        const banners = res?.data?.data
        if (Array.isArray(banners) && banners.length > 0) {
          setSlides(banners.map((banner: any, index: number) => ({
            id: banner.id ?? index + 1,
            image: banner.imageUrl,
            title: banner.title || "Trending Fashion Jewellery",
            subtitle: banner.subtitle || "Lightweight, Skin Friendly & Everyday Accessories",
            link: banner.link || "/shop"
          })))
        } else {
          setSlides(DEFAULT_EDITORIAL_SLIDES)
        }
      } catch {
        setSlides(DEFAULT_EDITORIAL_SLIDES)
      }
    }

    loadBanners()
  }, [])

  const displaySlides = slides.length > 0 ? slides : DEFAULT_EDITORIAL_SLIDES

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && displaySlides.length > 1) {
      intervalRef.current = setInterval(() => {
        nextSlide()
      }, 6000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentSlide, isPaused, displaySlides.length])

  const transitionMs = 260

  const nextSlide = () => {
    if (displaySlides.length < 2) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
      setIsAnimating(false)
    }, transitionMs)
  }

  const prevSlide = () => {
    if (displaySlides.length < 2) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)
      setIsAnimating(false)
    }, transitionMs)
  }

  const handleSlideChange = (index: number) => {
    if (index !== currentSlide) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide(index)
        setIsAnimating(false)
      }, transitionMs)
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) nextSlide()
    if (distance < -50) prevSlide()
  }

  return (
    <div
      className="relative w-full h-[46vh] min-h-[340px] sm:h-[60vh] sm:min-h-[460px] lg:h-[80vh] lg:min-h-[620px] overflow-hidden bg-[#18181b]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={displaySlides[currentSlide]?.image}
          alt="Fashion Jewelry Banner"
          className={`w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isAnimating ? 'opacity-40 scale-105' : 'opacity-85 scale-100'
          }`}
        />
      </div>

      {/* Luxury Vignette & Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30 z-10 pointer-events-none" />

      {/* Editorial Content Overlay */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col justify-center">
        <div className="max-w-xl sm:max-w-2xl text-left space-y-3 sm:space-y-4">
          
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/60 backdrop-blur-md border border-rose-400/30 shadow-lg animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-200 uppercase tracking-[0.2em]">
              {displaySlides[currentSlide]?.tag || "TRENDING COLLECTION"}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
            {displaySlides[currentSlide]?.title || "Everyday Fashion Jewellery Made For You"}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base lg:text-lg text-stone-200 font-sans font-light tracking-wide max-w-lg leading-relaxed">
            {displaySlides[currentSlide]?.subtitle || "Skin-friendly, lightweight fashion jewellery designed for everyday style."}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-800 hover:to-rose-800 text-white font-bold rounded-full shadow-xl hover:shadow-rose-900/50 transition-all duration-300 text-xs sm:text-sm uppercase tracking-wider group transform hover:-translate-y-0.5"
            >
              <span>Explore Collection</span>
              <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/shop?sort=BestSelling"
              className="inline-flex items-center justify-center px-5 sm:px-7 py-3 sm:py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-bold rounded-full transition-all duration-300 text-xs sm:text-sm uppercase tracking-wider transform hover:-translate-y-0.5"
            >
              <span>Bestsellers Under ₹999</span>
            </Link>
          </div>

          {/* Trust Badges Strip Under Hero */}
          <div className="pt-4 sm:pt-6 hidden sm:flex items-center gap-6 text-stone-300 text-xs font-semibold tracking-wider">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Premium Finish</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>100% Skin Friendly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span>Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 sm:w-10 h-1.5 bg-gradient-to-r from-amber-300 to-rose-400 rounded-full shadow-md'
                : 'w-2 h-1.5 bg-white/40 rounded-full hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-rose-900/60 backdrop-blur-md rounded-full items-center justify-center text-white transition-all duration-300 border border-white/10 hover:scale-105"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 hover:bg-rose-900/60 backdrop-blur-md rounded-full items-center justify-center text-white transition-all duration-300 border border-white/10 hover:scale-105"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  )
}
