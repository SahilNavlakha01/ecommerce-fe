"use client"

import React from "react"

interface ProfessionalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'minimal'
  showText?: boolean
  className?: string
}

const emblemDimensions = {
  xs: { box: 'w-7 h-7', text: 'text-[10px]', star: 'w-2 h-2' },
  sm: { box: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-[11px] sm:text-xs', star: 'w-2.5 h-2.5' },
  md: { box: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-xs sm:text-sm', star: 'w-3 h-3' },
  lg: { box: 'w-10 h-10 sm:w-11 sm:h-11', text: 'text-sm sm:text-base', star: 'w-3.5 h-3.5' },
  xl: { box: 'w-14 h-14 sm:w-16 sm:h-16', text: 'text-lg sm:text-xl', star: 'w-4 h-4' }
}

const fontSizes = {
  xs: { title: 'text-[11px]', sub: 'text-[7px]' },
  sm: { title: 'text-[12px] sm:text-[13px]', sub: 'text-[8px]' },
  md: { title: 'text-[14px] sm:text-[15px]', sub: 'text-[8.5px]' },
  lg: { title: 'text-[16px] sm:text-[18px]', sub: 'text-[9.5px]' },
  xl: { title: 'text-[20px] sm:text-[24px]', sub: 'text-[11px]' }
}

export default function ProfessionalLogo({
  size = 'md',
  variant = 'default',
  showText = false,
  className = ''
}: ProfessionalLogoProps) {
  const isWhite = variant === 'white'
  const emblem = emblemDimensions[size]
  const font = fontSizes[size]

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Luxury Medallion Emblem */}
      <div
        className={`relative ${emblem.box} rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${
          isWhite
            ? 'bg-gradient-to-br from-white/20 via-white/10 to-transparent border border-white/40 shadow-sm backdrop-blur-xs text-white'
            : 'bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] border border-amber-400/40 shadow-[0_2px_8px_rgba(159,18,57,0.25)] text-amber-200'
        }`}
      >
        {/* Subtle Inner Gold Ring */}
        <div className="absolute inset-0.5 rounded-full border border-amber-300/20 pointer-events-none" />

        {/* Monogram */}
        <div className="relative flex items-center justify-center font-serif font-extrabold tracking-tight">
          <span className={`${emblem.text} font-serif tracking-tighter leading-none`}>
            NS
          </span>
          <span className="absolute -top-1 -right-1 text-amber-300 text-[8px] sm:text-[10px] leading-none animate-pulse">
            ✦
          </span>
        </div>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`${font.title} font-serif font-extrabold tracking-[0.22em] uppercase leading-tight ${
                isWhite ? 'text-white' : 'text-stone-900'
              }`}
            >
              NS COLLECTION
            </span>
          </div>
          <span
            className={`${font.sub} font-sans font-bold tracking-[0.34em] uppercase leading-tight mt-0.5 ${
              isWhite ? 'text-amber-200/90' : 'text-rose-900'
            }`}
          >
            FASHION JEWELLERY
          </span>
        </div>
      )}
    </div>
  )
}
