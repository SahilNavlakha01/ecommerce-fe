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
      <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg font-medium text-center">
        {allowedType ? 'Continue with your registered account' : 'How will you shop with us?'}
      </p>
      
      <div className={`grid gap-3 ${allowedType ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {showRetail && (
          <button
            onClick={() => onSelect('retail')}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-60"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">Retail Account</p>
              <p className="text-xs text-blue-600 font-semibold">Personal Shopping</p>
            </div>
          </button>
        )}

        {showB2B && (
          <button
            onClick={() => onSelect('b2b')}
            disabled={isLoading}
            className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl transition-all disabled:opacity-60"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">Business Account</p>
              <p className="text-xs text-emerald-600 font-semibold">Wholesale & B2B</p>
            </div>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-teal-600 text-center flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent"></div>
          Setting up your account...
        </div>
      )}
    </div>
  )
}

export default AccountTypeSelector