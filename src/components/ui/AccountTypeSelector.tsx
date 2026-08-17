"use client"

import React from 'react'
import { ShoppingBag, Store } from 'lucide-react'

interface AccountTypeSelectorProps {
  onSelect: (type: 'retail' | 'b2b') => void
  isLoading?: boolean
  className?: string
  allowedType?: 'retail' | 'b2b' | null
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ 
  onSelect, 
  isLoading = false, 
  className = "",
  allowedType = null
}) => {
  const showRetail = !allowedType || allowedType === 'retail'
  const showB2B = !allowedType || allowedType === 'b2b'

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-600 bg-stone-100/70 px-3 py-2 rounded-xl text-center">
        {allowedType ? 'Continue with your registered account' : 'How will you shop with us?'}
      </p>
      
      <div className={`grid gap-3 ${allowedType ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {showRetail && (
          <button
            onClick={() => onSelect('retail')}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-stone-200 hover:border-rose-700 hover:bg-rose-50/50 rounded-2xl transition-all disabled:opacity-60 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-rose-900" />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold text-stone-900">Retail Account</p>
              <p className="text-[11px] text-rose-700 font-semibold">Personal Shopping</p>
            </div>
          </button>
        )}

        {showB2B && (
          <button
            onClick={() => onSelect('b2b')}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-stone-200 hover:border-amber-600 hover:bg-amber-50/50 rounded-2xl transition-all disabled:opacity-60 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-amber-800" />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm font-bold text-stone-900">Business Account</p>
              <p className="text-[11px] text-amber-700 font-semibold">Wholesale & B2B</p>
            </div>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-xs text-rose-900 font-semibold text-center flex items-center justify-center gap-2 py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-900 border-t-transparent"></div>
          Setting up your account...
        </div>
      )}
    </div>
  )
}

export default AccountTypeSelector