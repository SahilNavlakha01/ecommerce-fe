import { apiCache, createCache } from '../utils/performance';

// Request deduplication cache
const pendingRequests = new Map();

// Response cache with TTL
const responseCache = createCache(100);
const cacheTimestamps = new Map();

const CACHE_TTL = {
  categories: 5 * 60 * 1000, // 5 minutes
  products: 2 * 60 * 1000,   // 2 minutes
  config: 10 * 60 * 1000,    // 10 minutes
  reviews: 1 * 60 * 1000,    // 1 minute
  default: 30 * 1000         // 30 seconds
};

const getCacheKey = (url, params = {}) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  return `${url}:${JSON.stringify(sortedParams)}`;
};

const getCacheTTL = (url) => {
  if (url.includes('categories')) return CACHE_TTL.categories;
  if (url.includes('products')) return CACHE_TTL.products;
  if (url.includes('config')) return CACHE_TTL.config;
  if (url.includes('review')) return CACHE_TTL.reviews;
  return CACHE_TTL.default;
};

const isCacheValid = (cacheKey) => {
  const timestamp = cacheTimestamps.get(cacheKey);
  if (!timestamp) return false;
  
  const ttl = getCacheTTL(cacheKey);
  return Date.now() - timestamp < ttl;
};

export const optimizedApiCall = async (apiFunction, url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  
  // Check cache first
  if (responseCache.has(cacheKey) && isCacheValid(cacheKey)) {
    console.log(`Cache hit for: ${cacheKey}`);
    return responseCache.get(cacheKey);
  }
  
  // Check if request is already pending (deduplication)
  if (pendingRequests.has(cacheKey)) {
    console.log(`Request deduplication for: ${cacheKey}`);
    return pendingRequests.get(cacheKey);
  }
  
  // Make the API call
  const requestPromise = apiFunction(params)
    .then(response => {
      // Cache the response
      responseCache.set(cacheKey, response);
      cacheTimestamps.set(cacheKey, Date.now());
      
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
      
      return response;
    })
    .catch(error => {
      // Remove from pending requests on error
      pendingRequests.delete(cacheKey);
      throw error;
    });
  
  // Store pending request
  pendingRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

// Cache invalidation helpers
export const invalidateCache = (pattern) => {
  const keysToDelete = [];
  
  // Find matching cache keys
  for (const [key] of responseCache.entries()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  // Delete matching keys
  keysToDelete.forEach(key => {
    responseCache.delete(key);
    cacheTimestamps.delete(key);
  });
  
  console.log(`Invalidated ${keysToDelete.length} cache entries for pattern: ${pattern}`);
};

export const clearAllCache = () => {
  responseCache.clear();
  cacheTimestamps.clear();
  pendingRequests.clear();
  console.log('All caches cleared');
};

// Preload critical data
export const preloadCriticalData = async () => {
  try {
    const { GetAllCategories, GetAllConfig } = await import('./GetService');
    
    // Preload categories and config in parallel
    await Promise.all([
      optimizedApiCall(GetAllCategories, 'categories'),
      optimizedApiCall(GetAllConfig, 'config')
    ]);
    
    console.log('Critical data preloaded');
  } catch (error) {
    console.error('Failed to preload critical data:', error);
  }
};

// Background cache refresh
export const refreshCacheInBackground = (apiFunction, url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  
  // Only refresh if cache exists and is getting stale (75% of TTL)
  const timestamp = cacheTimestamps.get(cacheKey);
  if (!timestamp) return;
  
  const ttl = getCacheTTL(cacheKey);
  const age = Date.now() - timestamp;
  
  if (age > ttl * 0.75) {
    console.log(`Background refresh for: ${cacheKey}`);
    
    // Refresh in background without blocking
    apiFunction(params)
      .then(response => {
        responseCache.set(cacheKey, response);
        cacheTimestamps.set(cacheKey, Date.now());
      })
      .catch(error => {
        console.error('Background refresh failed:', error);
      });
  }
};

export default {
  optimizedApiCall,
  invalidateCache,
  clearAllCache,
  preloadCriticalData,
  refreshCacheInBackground
};