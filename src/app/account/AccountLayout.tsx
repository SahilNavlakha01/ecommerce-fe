"use client"

import { usePathname, useRouter } from 'next/navigation'
import { User, Package, MapPin, ChevronRight, LogOut, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import LogoutModal from '../../components/LogoutModal'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState({ name: '', email: '', userRole: 0 })
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const userData = document.cookie.split('; ').find(row => row.startsWith('userData='))?.split('=')[1]
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setUser({ name: parsedData.name || '', email: parsedData.email || '', userRole: parsedData.userRole || 1 })
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const roleBadge = {
    1: { label: 'Customer', className: 'bg-white/20 text-white border border-white/30' },
    2: { label: 'B2B User', className: 'bg-amber-400/90 text-amber-900 border border-amber-300' },
    3: { label: 'Admin', className: 'bg-rose-500/90 text-white border border-rose-400' },
  }[user.userRole] ?? { label: 'Customer', className: 'bg-white/20 text-white border border-white/30' }

  const navItems = [
    { icon: User, label: 'Profile', path: '/account/profile' },
    { icon: Package, label: 'Orders', path: '/account/orders' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: MapPin, label: 'Addresses', path: '/account/addresses' },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-8 space-y-3">
                {/* User Card */}
                <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold border-2 border-white/30 flex-shrink-0">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{user.name || 'My Account'}</p>
                      <p className="text-teal-100 text-xs truncate mt-0.5">{user.email}</p>
                      <span className={`inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.className}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <nav className="p-1.5">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.path
                      return (
                        <button
                          key={item.path}
                          onClick={() => router.push(item.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-0.5 ${
                            isActive
                              ? 'bg-teal-600 text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                        </button>
                      )
                    })}
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium text-sm flex-1 text-left">Logout</span>
                    </button>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-2 bg-white">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm font-bold border border-white/30 flex-shrink-0">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{user.name || 'My Account'}</p>
                  <p className="text-teal-100 text-xs truncate">{user.email}</p>
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge.className}`}>
                  {roleBadge.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all bg-red-50 text-red-500 hover:bg-red-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[10px] font-medium leading-tight">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={() => setShowLogoutModal(false)}
      />
    </>
  )
}
