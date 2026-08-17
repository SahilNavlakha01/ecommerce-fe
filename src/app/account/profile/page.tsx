"use client"

import { useState, useEffect } from 'react'
import AccountLayout from '../AccountLayout'
import { toast } from 'sonner'
import { UpdateUser } from '../../../Services/PostService'
import PageTransition from '../../../components/PageTransition'
import { User, Mail, Phone, Calendar, Edit2, Save } from 'lucide-react'

import VerificationModal from '../../../components/VerificationModal'

export default function ProfilePage() {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    created_at: '',
    userRole: 1
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    const userData = document.cookie.split('; ').find(row => row.startsWith('userData='))?.split('=')[1]
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setUser(parsedData)
        setFormData({
          name: parsedData.name || '',
          email: parsedData.email || '',
          phone: parsedData.phone || ''
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleUpdate = async () => {
    const nextEmail = formData.email.trim()
    const currentEmail = (user.email || '').trim()

    if (nextEmail && nextEmail !== currentEmail) {
      setPendingEmail(nextEmail)
      setShowEmailVerification(true)
      return
    }

    setLoading(true)
    try {
      const payload = { ...formData, email: nextEmail || '' }
      await UpdateUser(payload, user.id)
      const updatedUser = { ...user, ...payload }
      setUser(updatedUser)
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailVerified = async () => {
    setShowEmailVerification(false)
    setLoading(true)
    try {
      const payload = { ...formData, email: pendingEmail }
      await UpdateUser(payload, user.id)
      const updatedUser = { ...user, ...payload, email: pendingEmail }
      setUser(updatedUser)
      setFormData((prev) => ({ ...prev, email: pendingEmail }))
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(updatedUser))}; path=/`
      toast.success('Email verified and profile updated successfully!')
      setIsEditing(false)
      setPendingEmail('')
    } catch (error) {
      toast.error('Email verified but profile update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountLayout>
      <PageTransition>
        <div className="space-y-6">
          {!user.name && (
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs sm:text-sm text-amber-900 flex items-center gap-3 shadow-xs">
              <span className="text-base">✨</span>
              <div>
                <strong className="font-bold">Complete your fashion profile:</strong> Add your name to personalize your orders and invoices.
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 overflow-hidden">
            <div className="bg-stone-50/80 p-5 sm:p-7 border-b border-stone-200/80 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-widest">
                    Account Profile
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Personal Information</h2>
                <p className="text-stone-500 text-xs mt-0.5">Manage your personal profile and registered contact details</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isEditing
                    ? 'border border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200'
                    : 'bg-rose-900 text-white shadow-xs hover:bg-rose-950'
                }`}
              >
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                    <User className="w-3.5 h-3.5 text-rose-900" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all font-medium text-sm bg-stone-50/50 focus:bg-white outline-none"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-stone-50/70 px-4 py-3.5 rounded-2xl border border-stone-200/80">
                      <p className="font-semibold text-stone-900 text-sm">{user.name || 'Not provided yet'}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                    <Mail className="w-3.5 h-3.5 text-rose-900" />
                    Email Address <span className="text-stone-400 font-normal normal-case">(for order receipts)</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all font-medium text-sm bg-stone-50/50 focus:bg-white outline-none"
                      placeholder="name@example.com"
                    />
                  ) : (
                    <div className="bg-stone-50/70 px-4 py-3.5 rounded-2xl border border-stone-200/80">
                      <p className="font-semibold text-stone-900 text-sm">{user.email || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                    <Phone className="w-3.5 h-3.5 text-rose-900" />
                    Primary Phone Number
                    <span className="text-[10px] font-normal text-stone-400 normal-case">(OTP verified login)</span>
                  </label>
                  <div className="bg-stone-50/70 px-4 py-3.5 rounded-2xl border border-stone-200/80 flex items-center justify-between">
                    <p className="font-semibold text-stone-900 text-sm">{user.phone ? `+91 ${user.phone}` : 'Not provided'}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                    <Calendar className="w-3.5 h-3.5 text-rose-900" />
                    Member Since
                  </label>
                  <div className="bg-rose-50/50 px-4 py-3.5 rounded-2xl border border-rose-200/60">
                    <p className="font-serif font-bold text-rose-950 text-sm">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : '2026'}
                    </p>
                  </div>
                </div>

              </div>

              {isEditing && (
                <div className="mt-7 pt-5 border-t border-stone-200 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || ''
                      })
                    }}
                    className="sm:w-32 h-12 bg-white text-stone-700 border border-stone-300 rounded-xl hover:bg-stone-50 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
      <VerificationModal
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false)
          setPendingEmail('')
        }}
        onSuccess={handleEmailVerified}
        userId={user.id}
        type="email"
        contactValue={pendingEmail}
        title="Verify New Email"
      />
    </AccountLayout>
  )
}
