import { useState } from 'react';
import { AddReview } from '../Services/PostService';
import { getAuthCookie, isCustomerLoggedIn } from '../utils/auth';
import { successToast, errorToast } from '../utils/toast';

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addReview = async (productId, rating, reviewText) => {
    if (!isCustomerLoggedIn()) {
      errorToast('Please login to submit a review');
      return false;
    }

    if (!productId || !rating || !reviewText?.trim()) {
      errorToast('Please provide all required fields');
      return false;
    }

    if (rating < 1 || rating > 5) {
      errorToast('Rating must be between 1 and 5');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { user } = getAuthCookie('user');
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Ensure all values are properly typed and validated
      const reviewPayload = {
        productId: Number(productId),
        userId: Number(user.id),
        rating: Number(rating),
        reviewText: String(reviewText).trim()
      };
      
      // Final validation
      if (isNaN(reviewPayload.productId) || reviewPayload.productId <= 0) {
        throw new Error('Invalid product ID');
      }
      if (isNaN(reviewPayload.userId) || reviewPayload.userId <= 0) {
        throw new Error('Invalid user ID');
      }
      if (isNaN(reviewPayload.rating) || reviewPayload.rating < 1 || reviewPayload.rating > 5) {
        throw new Error('Invalid rating');
      }
      if (!reviewPayload.reviewText || reviewPayload.reviewText.length < 1) {
        throw new Error('Review text is required');
      }

      console.log('Submitting review:', reviewPayload);
      const response = await AddReview(reviewPayload);
      console.log('Review response:', response);

      // Check for success in multiple ways to handle different response formats
      const isSuccess = response?.data?.success || 
                       response?.status === 200 || 
                       response?.data?.status === 200 ||
                       response?.statusText === 'OK' ||
                       (response?.data && !response?.data?.error);

      if (isSuccess) {
        successToast('Review submitted successfully!');
        return true;
      } else {
        throw new Error(response?.data?.message || response?.statusMessage || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      
      // Handle different error formats
      let errorMessage = 'Failed to submit review. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.statusMessage) {
        errorMessage = error.response.data.statusMessage;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please check if all required fields are provided correctly.';
      }
      
      setError(errorMessage);
      errorToast(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addReview,
    loading,
    error
  };
};