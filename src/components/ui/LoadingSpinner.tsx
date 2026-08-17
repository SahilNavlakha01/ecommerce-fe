'use client'

import { cn } from '../../utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'rose' | 'teal' | 'gold' | 'white' | 'gray'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

const colorClasses = {
  rose: 'border-rose-900 border-t-transparent',
  teal: 'border-rose-900 border-t-transparent',
  gold: 'border-amber-400 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-stone-400 border-t-transparent'
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'rose'
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  )
}