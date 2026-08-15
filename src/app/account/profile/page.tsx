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
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <span className="font-semibold">Complete your profile</span> — add your name so we can personalise your orders.
                </div>
              )}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-stone-50 p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-500 text-sm mt-0.5">Your account details and contact information</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
              >
                {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <User className="w-4 h-4 text-teal-600" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-stone-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      <p className="font-medium text-gray-900">{user.name || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Mail className="w-4 h-4 text-teal-600" />
                    Email Address <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-stone-50 px-4 py-3.5 rounded-xl border border-gray-200">
                      <p className="font-medium text-gray-900">{user.email || 'Not provided'}</p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Phone className="w-4 h-4 text-teal-600" />
                    Phone Number
                    <span className="text-xs font-normal text-gray-400 ml-1">(cannot be changed)</span>
                  </label>
                  <div className="bg-gray-50 px-4 py-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                    <p className="font-medium text-gray-500">{user.phone || 'Not provided'}</p>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Locked</span>
                  </div>
                </div>

                {/* Member Since */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Member Since
                  </label>
                  <div className="bg-gradient-to-br from-teal-50 to-mint-50 px-4 py-3.5 rounded-xl border border-teal-200">
                    <p className="font-medium text-teal-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : new Date().toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all disabled:opacity-50 font-medium shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
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
                    className="flex-1 bg-white text-gray-700 border-2 border-gray-200 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
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
