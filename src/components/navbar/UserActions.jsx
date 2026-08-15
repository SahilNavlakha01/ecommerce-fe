"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { getAuthCookie } from "../../utils/auth"
import UserAccountBadge from "../ui/UserAccountBadge"

export default function UserActions({
  isLoggedIn,
  selectedLocation,
  onPincodeClick,
  onLogoutClick
}) {
  const [user, setUser] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roleBadge = {
    1: { label: 'Customer', className: 'bg-teal-50 text-teal-700 border border-teal-200' },
    2: { label: 'B2B', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
    3: { label: 'Admin', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
  }[user?.userRole] ?? { label: 'Customer', className: 'bg-teal-50 text-teal-700 border border-teal-200' }
  const [dropdownPosition, setDropdownPosition] = useState('bottom')
  const ref = useRef()
  const buttonRef = useRef()

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const { user: userData } = getAuthCookie('user')
        setUser(userData)
      } catch (e) {
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [isLoggedIn])

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsDropdownOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const dropdownHeight = 80 // Approximate dropdown height
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    // Default to bottom, switch to top only if not enough space below
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
  }

  const handleToggle = () => {
    if (!isDropdownOpen) {
      calculateDropdownPosition()
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <div ref={ref} className="hidden lg:flex items-center gap-2">
      {/* Pincode - Clean minimal design */}
      <button
        onClick={onPincodeClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-left">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Deliver to</div>
          <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
            {selectedLocation}
          </div>
        </div>
      </button>

      {/* User Section */}
      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          {/* User dropdown with clean design */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={handleToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors leading-tight">
                  {user?.name?.split(' ')[0] || 'Account'}
                </div>
                <UserAccountBadge 
                  userRole={user?.userRole} 
                  roleName={user?.roleName}
                  size="sm"
                  showIcon={false}
                  className="mt-0.5"
                />
              </div>
              <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 w-56 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100 ${
                dropdownPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
              }`}>
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-teal-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-gray-900 truncate">{user?.name || user?.username || 'User'}</div>
                      <UserAccountBadge 
                        userRole={user?.userRole} 
                        roleName={user?.roleName}
                        size="sm"
                        showIcon={true}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link href="/account" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Account
                  </Link>
                  <Link href="/account/orders" className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </Link>
                  <button onClick={() => { onLogoutClick(); setIsDropdownOpen(false); }} className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100 group">
                    <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/auth/otp-login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-gray-700 hover:text-teal-600 hover:bg-gray-50 transition-all duration-200 font-semibold text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </Link>
          <Link
            href="/auth/otp-login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-all duration-200 font-semibold text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
