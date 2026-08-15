"use client"

import Image from "next/image"

interface ProfessionalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'minimal'
  showText?: boolean
  className?: string
}

const sizeMap = {
  xs: { w: 100, h: 67 },
  sm: { w: 130, h: 87 },
  md: { w: 160, h: 107 },
  lg: { w: 170, h: 104 },
  xl: { w: 240, h: 161 }
}

export default function ProfessionalLogo({
  size = 'md',
  variant = 'default',
  showText = false,
  className = ''
}: ProfessionalLogoProps) {
  const { w, h } = sizeMap[size]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/LogoNew.png"
        alt="Ethnic Sparkles"
        width={w}
        height={h}
        className="object-contain flex-shrink-0"
        priority
      />
      <span className="hidden xl:block text-[9px] font-medium tracking-[0.18em] text-gray-400 uppercase leading-tight border-l border-gray-200 pl-2">
        Presented by<br />EEAS Lifestyle
      </span>
    </div>
  )
}
