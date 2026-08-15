"use client"

import { useState, useEffect } from 'react'
import { useReview } from '../hooks/useReview'
import { getAuthCookie, isCustomerLoggedIn } from '../utils/auth'
import Portal from './ui/Portal'

export default function ReviewModal({ isOpen, onClose, productName, productId, onReviewAdded }) {
  const [reviewData, setReviewData] = useState({
    rating: 0,
    reviewText: ''
  })
  const [user, setUser] = useState(null)
  const { addReview, loading } = useReview()

  // Get user data from cookies on component mount
  useEffect(() => {
    if (isOpen) {
      if (isCustomerLoggedIn()) {
        const { user: userData } = getAuthCookie('user')
        setUser(userData)
      } else {
        setUser(null)
      }
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Additional validation before submission
    if (!productId) {
      console.error('Missing productId:', productId)
      return
    }
    
    if (!user?.id) {
      console.error('Missing user ID:', user)
      return
    }
    
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      console.error('Invalid rating:', reviewData.rating)
      return
    }
    
    if (!reviewData.reviewText?.trim()) {
      console.error('Missing review text:', reviewData.reviewText)
      return
    }
    
    console.log('Submitting review with data:', {
      productId,
      userId: user.id,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText
    })
    
    const success = await addReview(productId, reviewData.rating, reviewData.reviewText)
    
    if (success) {
      setReviewData({ rating: 0, reviewText: '' })
      onClose()
      if (onReviewAdded) onReviewAdded()
    }
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop with proper opacity */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewData({...reviewData, rating: star})}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <svg 
                    className={`w-7 h-7 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {reviewData.rating > 0 ? `${reviewData.rating} star${reviewData.rating > 1 ? 's' : ''}` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              value={reviewData.reviewText}
              onChange={(e) => setReviewData({...reviewData, reviewText: e.target.value})}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              required
              disabled={loading}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !user}
              className="flex-1 py-3 px-6 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  )
}