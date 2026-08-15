"use client"

import { clearAuthCookie } from "../utils/auth"
import Portal from './ui/Portal'

export default function LogoutModal({ isOpen, onClose, onLogout }) {
  const handleLogout = () => {
    try {
      clearAuthCookie('user')
    } catch (e) {
      // ignore
    }
    onLogout()
    onClose()
    window.location.href = '/'
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Logout</h3>
              <p className="text-sm text-gray-500">Are you sure?</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            You will be signed out and redirected to the home page.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  )
}
