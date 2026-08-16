"use client"

import Image from "next/image"

interface ProfessionalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'minimal'
  showText?: boolean
  className?: string
}

const sizeMap = {
  xs: { w: 40, h: 40 },
  sm: { w: 52, h: 52 },
  md: { w: 68, h: 68 },
  lg: { w: 84, h: 84 },
  xl: { w: 120, h: 120 }
}

export default function ProfessionalLogo({
  size = 'md',
  variant = 'default',
  showText = false,
  className = ''
}: ProfessionalLogoProps) {
  const { w, h } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/images/LogoNew.png"
        alt="NS Collection"
        width={w}
        height={h}
        className={`object-contain flex-shrink-0 ${
          variant === 'white' ? 'brightness-0 invert' : ''
        }`}
        priority
      />
      {showText && (
        <div className="flex flex-col border-l border-gray-200 pl-2.5">
          <span className={`text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase leading-tight ${
            variant === 'white' ? 'text-white' : 'text-gray-900 font-heading'
          }`}>
            NS Collection
          </span>
          <span className={`text-[8px] sm:text-[9px] font-medium tracking-[0.15em] uppercase leading-tight ${
            variant === 'white' ? 'text-gray-300' : 'text-teal-700'
          }`}>
            Luxury Jewellery
          </span>
        </div>
      )}
    </div>
  )
}
