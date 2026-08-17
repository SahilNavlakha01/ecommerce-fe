"use client"

import { usePathname, useRouter } from 'next/navigation'
import { User, Package, MapPin, ChevronRight, LogOut, Heart, Shield, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import LogoutModal from '../../components/LogoutModal'
import Link from 'next/link'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState({ name: '', email: '', phone: '', userRole: 0 })
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const userData = document.cookie.split('; ').find(row => row.startsWith('userData='))?.split('=')[1]
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setUser({
          name: parsedData.name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          userRole: parsedData.userRole || 1
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const roleBadge = {
    1: { label: 'Retail Member', className: 'bg-white/20 text-amber-100 border border-white/30' },
    2: { label: 'B2B Wholesale', className: 'bg-amber-400 text-stone-950 font-bold border border-amber-300' },
    3: { label: 'Administrator', className: 'bg-rose-950 text-amber-200 border border-amber-400/40' },
  }[user.userRole] ?? { label: 'Retail Member', className: 'bg-white/20 text-amber-100 border border-white/30' }

  const navItems = [
    { icon: User, label: 'My Profile', desc: 'Account details & contact', path: '/account/profile' },
    { icon: Package, label: 'My Orders', desc: 'Tracking & invoice history', path: '/account/orders' },
    { icon: Heart, label: 'Wishlist', desc: 'Saved favorite designs', path: '/wishlist' },
    { icon: MapPin, label: 'Saved Addresses', desc: 'Delivery locations', path: '/account/addresses' },
    { icon: Shield, label: 'Security & Settings', desc: 'Passwordless login info', path: '/account/settings' },
  ]

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#faf9f6] text-stone-900 font-sans pb-20 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-6 font-medium">
            <Link href="/" className="hover:text-rose-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-rose-900 font-semibold">My Account</span>
            <span>/</span>
            <span className="text-stone-400 capitalize">
              {pathname.split('/').filter(Boolean).pop() || 'Profile'}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-4">
                
                {/* User Card */}
                <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="relative flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-serif font-bold text-amber-200 border border-amber-300/30 shadow-inner flex-shrink-0">
                      {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-serif font-bold text-base text-white truncate">
                          {user.name || 'Boutique Member'}
                        </p>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      </div>
                      <p className="text-rose-200/80 text-xs truncate mt-0.5 font-sans">
                        {user.phone ? `+91 ${user.phone}` : user.email || 'Welcome back'}
                      </p>
                      <span className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${roleBadge.className}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Links Card */}
                <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 overflow-hidden p-2">
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.path
                      return (
                        <button
                          key={item.path}
                          onClick={() => router.push(item.path)}
                          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all cursor-pointer group text-left ${
                            isActive
                              ? 'bg-rose-900 text-white shadow-sm'
                              : 'text-stone-700 hover:bg-rose-50/60 hover:text-rose-950'
                          }`}
                        >
                          <div className={`p-2 rounded-xl transition-colors ${
                            isActive ? 'bg-white/15 text-amber-200' : 'bg-stone-100 text-stone-600 group-hover:bg-rose-100 group-hover:text-rose-900'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold leading-tight">{item.label}</p>
                            <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-rose-200' : 'text-stone-400'}`}>{item.desc}</p>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-amber-300 opacity-90' : 'text-stone-300'}`} />
                        </button>
                      )
                    })}

                    <div className="my-2 border-t border-stone-100" />
                    
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-red-600 hover:bg-red-50 cursor-pointer group"
                    >
                      <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold leading-tight">Sign Out</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Securely exit session</p>
                      </div>
                    </button>
                  </nav>
                </div>
              </div>
            </aside>

            {/* Mobile Navigation Header */}
            <div className="lg:hidden rounded-3xl shadow-sm border border-stone-200 overflow-hidden bg-white mb-2">
              <div className="bg-gradient-to-r from-[#881337] to-[#9f1239] px-4 py-3.5 flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-200 font-serif font-bold border border-white/20">
                  {(user.name || user.phone || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-sm truncate">{user.name || 'My Account'}</p>
                  <p className="text-rose-200 text-xs truncate">{user.phone ? `+91 ${user.phone}` : user.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${roleBadge.className}`}>
                  {roleBadge.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1 p-2 bg-stone-50/50">
                {navItems.slice(0, 4).map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all cursor-pointer ${
                        isActive ? 'bg-rose-900 text-white' : 'text-stone-600 hover:bg-stone-200/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[9px] font-bold truncate max-w-full">{item.label}</span>
                    </button>
                  )
                })}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-[9px] font-bold">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
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
