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
          {/* Header */}
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-200/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <Settings className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">Settings</h1>
                  <p className="text-teal-100 text-xs sm:text-sm">Security & preferences</p>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border-2 border-white/30">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-stone-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                  <p className="text-gray-600 mt-1">Your account is secured with mobile OTP</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-teal-900">Passwordless account</p>
                  <p className="text-sm text-teal-700 mt-1">You sign in using a one-time OTP sent to your mobile number <span className="font-semibold">{user.phone ? `+91 ${user.phone}` : ''}</span>. No password is needed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
