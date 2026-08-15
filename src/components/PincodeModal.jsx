"use client"

import { useState } from 'react'

export default function PincodeModal({ isOpen, onClose, onLocationSelect }) {
  const [pincode, setPincode] = useState("")

  const handleApply = () => {
    if (pincode && pincode.length === 6) {
      onLocationSelect(pincode)
      onClose()
      setPincode("")
    }
  }

  const handleCitySelect = (location) => {
    onLocationSelect(location)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Delivery Location</h3>
                <p className="text-sm text-gray-500">Enter your pincode for delivery options</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pincode</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  maxLength={6}
                />
                <button
                  onClick={handleApply}
                  disabled={!pincode || pincode.length !== 6}
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:from-teal-700 hover:to-teal-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Popular Cities</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Mumbai - 400001",
                  "Delhi - 110001", 
                  "Bangalore - 560001",
                  "Chennai - 600001"
                ].map((location) => (
                  <button
                    key={location}
                    onClick={() => handleCitySelect(location)}
                    className="p-3 text-left bg-gray-50 hover:bg-teal-50 border border-gray-200 rounded-xl transition-all duration-200 group"
                  >
                    <div className="text-sm font-medium text-gray-900 group-hover:text-teal-600">
                      {location.split(" - ")[0]}
                    </div>
                    <div className="text-xs text-gray-500 group-hover:text-teal-600">
                      {location.split(" - ")[1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}