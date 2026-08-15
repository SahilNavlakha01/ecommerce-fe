"use client"
import { useState, useEffect, useRef } from "react"
import { GetActiveBanners } from "@/Services/GetService"

export default function Hero() {
  const [slides, setSlides] = useState<{ id: number; image: string }[]>([])
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
          })))
        } else {
          setSlides([])
        }
      } catch {
        setSlides([])
      }
    }

    loadBanners()
  }, [])

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && slides.length > 1) {
      intervalRef.current = setInterval(() => {
        nextSlide()
      }, 6000)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentSlide, isPaused])

  const transitionMs = 220

  const nextSlide = () => {
    if (slides.length < 2) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
      setIsAnimating(false)
    }, transitionMs)
  }

  const prevSlide = () => {
    if (slides.length < 2) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
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
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div 
      className="relative w-full h-[32vh] min-h-[240px] max-h-[360px] sm:h-[52vh] sm:min-h-[420px] lg:h-[78vh] lg:min-h-[620px] overflow-hidden bg-[#f8f5ee]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.length > 0 && (
        <>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={slides[currentSlide]?.image}
          alt="Homepage banner"
          className={`w-full h-full object-cover object-center transition-opacity duration-200 ease-out ${isAnimating ? 'opacity-60' : 'opacity-100'} brightness-[0.96] sm:brightness-100`}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-black/0 to-black/8 sm:from-black/10 sm:via-black/0 sm:to-black/5 pointer-events-none" />

      {/* Slide Indicators */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-3 z-30">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`transition-all duration-300 ${
              index === currentSlide 
                ? 'w-7 sm:w-10 h-1.5 sm:h-2 bg-white rounded-full shadow-sm' 
                : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/55 rounded-full hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <button 
        onClick={nextSlide}
        className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 sm:h-1 bg-white/20 z-30 w-full">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{
            width: '100%',
            // use explicit longhand animation properties to avoid mixing shorthand and longhand
            animationName: !isPaused ? 'progress' : 'none',
            animationDuration: !isPaused ? '6000ms' : '0ms',
            animationTimingFunction: !isPaused ? 'linear' : 'initial',
            animationIterationCount: !isPaused ? 'infinite' : '1',
            animationDelay: '0ms'
          }}
        ></div>
      </div>
        </>
      )}
    </div>
  )
}
