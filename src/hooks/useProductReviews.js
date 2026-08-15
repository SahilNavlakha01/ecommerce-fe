import { useState, useEffect, useRef, useCallback } from 'react';
import { GetProductReviews } from '../Services/GetService';
import { DeleteReview } from '../Services/PostService';
import { getAuthCookie } from '../utils/auth';
import { successToast, errorToast } from '../utils/toast';

export const useProductReviews = (productId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const lastProductId = useRef(null);
  const abortController = useRef(null);

  const fetchReviews = useCallback(async (forceRefresh = false) => {
    if (!productId || (!forceRefresh && productId === lastProductId.current)) return;
    
    // Cancel previous request if still pending
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    lastProductId.current = productId;
    
    setLoading(true);
    try {
      const response = await GetProductReviews(productId);
      
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }
      
      let reviewsData = [];
      
      // Handle the specific API response format
      if (response?.data?.data?.reviews && Array.isArray(response.data.data.reviews)) {
        reviewsData = response.data.data.reviews;
        // Use the summary data from API
        const summary = response.data.data.summary;
        setAverageRating(parseFloat(summary?.avgRating || 0));
        setTotalReviews(parseInt(summary?.totalReviews || 0));
      }
      
      setReviews(reviewsData);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setTotalReviews(0);
      setAverageRating(0);
    } finally {
      if (!abortController.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [productId]);

  useEffect(() => {
    if (productId && productId !== lastProductId.current) {
      fetchReviews();
    }
    
    // Cleanup on unmount
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [productId]); // Removed fetchReviews from dependencies

  const deleteReview = useCallback(async (reviewId) => {
    try {
      const { user } = getAuthCookie('user');
      if (!user?.id) {
        errorToast('Please login to delete review');
        return false;
      }

      await DeleteReview({ id: reviewId, userId: user.id });
      successToast('Review deleted successfully');
      
      // Optimistic update - remove review from local state immediately
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      setTotalReviews(prev => Math.max(0, prev - 1));
      
      // Refresh reviews after a delay to get updated data
      setTimeout(() => {
        fetchReviews(true); // Force refresh
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      errorToast('Failed to delete review');
      return false;
    }
  }, [fetchReviews]);

  const refetchReviews = useCallback(() => {
    fetchReviews(true); // Force refresh
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    averageRating,
    totalReviews,
    refetchReviews,
    deleteReview
  };
};