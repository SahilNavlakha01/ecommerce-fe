"use client"

import { useState, useEffect } from 'react'
import { useReview } from '../hooks/useReview'
import { getAuthCookie, isCustomerLoggedIn } from '../utils/auth'
import { ReviewSkeleton } from './ui/Skeleton'

export default function InlineReviewSection({ 
  productId, 
  reviews, 
  averageRating, 
  totalReviews, 
  onReviewAdded,
  deleteReview 
}) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 0,
    reviewText: ''
  })
  const [user, setUser] = useState(null)
  const { addReview, loading } = useReview()

  useEffect(() => {
    if (isCustomerLoggedIn()) {
      const { user: userData } = getAuthCookie('user')
      setUser(userData)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!productId || !user?.id || reviewData.rating < 1 || !reviewData.reviewText?.trim()) {
      return
    }
    
    const success = await addReview(productId, reviewData.rating, reviewData.reviewText)
    
    if (success) {
      setReviewData({ rating: 0, reviewText: '' })
      setShowReviewForm(false)
      if (onReviewAdded) onReviewAdded()
    }
  }

  const handleLoginRedirect = () => {
    window.location.href = '/auth/otp-login'
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
              {averageRating || 0}
            </div>
            <div className="flex justify-center mb-1">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-5 h-5 ${i < Math.floor(averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating Breakdown */}
          <div className="hidden sm:block flex-1 max-w-xs">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-600">{rating}</span>
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-xs text-gray-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Write Review Button */}
        <div className="flex-shrink-0">
          {user ? (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors text-sm sm:text-base"
            >
              {showReviewForm ? 'Cancel' : 'Write Review'}
            </button>
          ) : (
            <button
              onClick={handleLoginRedirect}
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm sm:text-base"
            >
              Login to Review
            </button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && user && (
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <svg 
                      className={`w-6 h-6 sm:w-7 sm:h-7 ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {reviewData.rating > 0 ? `${reviewData.rating} star${reviewData.rating > 1 ? 's' : ''}` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewData.reviewText}
                onChange={(e) => setReviewData({...reviewData, reviewText: e.target.value})}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || reviewData.rating < 1 || !reviewData.reviewText.trim()}
                className="flex-1 sm:flex-none px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <ReviewSkeleton key={i} />
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review) => {
            const canDelete = user?.id === review.userId
            
            return (
              <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm sm:text-base font-bold text-rose-900">
                        {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {review.userName || 'Anonymous'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canDelete && (
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="self-start p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
                      title="Delete review"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {review.reviewText}
                </p>
              </div>
            )
          })
        ) : (
          <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share your experience with this product!</p>
            {user ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Write First Review
              </button>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Login to Write Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}