"use client"

import { useState, useEffect } from 'react'
import AccountLayout from '../AccountLayout'
import { toast } from 'react-hot-toast'
import PageTransition from '../../../components/PageTransition'
import { Settings, Lock, Shield } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
    
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        setUser({
          id: parsedData.id,
          name: parsedData.name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || ''
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [])

  return (
    <AccountLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <Shield className="w-7 h-7 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Security & Settings</h1>
                  <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">Authentication & account safety preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Overview Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 overflow-hidden">
            <div className="bg-stone-50/80 p-5 sm:p-7 border-b border-stone-200/80">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-200/60">
                  <Lock className="w-6 h-6 text-rose-900" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">Account Protection</h3>
                  <p className="text-stone-500 text-xs mt-0.5">Instant OTP Authentication Enabled</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7 space-y-4">
              <div className="flex items-start gap-4 p-4 sm:p-5 bg-rose-50/50 border border-rose-200/70 rounded-2xl">
                <div className="w-10 h-10 bg-rose-900 text-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold text-stone-900">Passwordless Security Active</p>
                  <p className="text-stone-600 leading-relaxed">
                    Your account is secured with single-use mobile OTP verification sent directly to your registered number{' '}
                    <strong className="font-bold text-rose-950">{user.phone ? `+91 ${user.phone}` : ''}</strong>. You never have to worry about compromised passwords.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">🔐 256-Bit SSL Encryption</p>
                  <p className="text-xs text-stone-500">All data transfers & payment sessions are encrypted with TLS 1.3 standards.</p>
                </div>
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
                  <p className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">🛡️ Anti-Fraud Checkout</p>
                  <p className="text-xs text-stone-500">Every order transaction is cryptographically verified to prevent unauthorized charges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
