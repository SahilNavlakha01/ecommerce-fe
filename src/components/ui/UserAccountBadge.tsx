"use client"

import React from 'react'
import { ShoppingBag, Store } from 'lucide-react'

interface UserAccountBadgeProps {
  userRole?: string | number
  roleName?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
}

const UserAccountBadge: React.FC<UserAccountBadgeProps> = ({ 
  userRole, 
  roleName,
  className = "",
  size = 'md',
  showIcon = true,
  showLabel = true
}) => {
  // Determine if user is B2B
  const isB2B = userRole === 2 || userRole === '2' || roleName === 'B2b Customer'
  
  if (!userRole && !roleName) return null

  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    lg: {
      container: 'px-3 py-1 text-sm',
      icon: 'h-4 w-4',
      text: 'text-sm'
    }
  }

  const currentSize = sizeClasses[size]

  if (isB2B) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 font-semibold text-emerald-700 ${currentSize.container} ${className}`}>
        {showIcon && <Store className={`${currentSize.icon} flex-shrink-0`} />}
        {showLabel && <span className={currentSize.text}>Business</span>}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-200 font-semibold text-blue-700 ${currentSize.container} ${className}`}>
      {showIcon && <ShoppingBag className={`${currentSize.icon} flex-shrink-0`} />}
      {showLabel && <span className={currentSize.text}>Retail</span>}
    </span>
  )
}

export default UserAccountBadge