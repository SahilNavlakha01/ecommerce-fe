// Performance monitoring utilities

export const measurePerformance = <T extends (...args: any[]) => any>(name: string, fn: T) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start} milliseconds:`, error);
      throw error;
    }
  };
};

export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    const promises = urls.map(url => preloadImage(url));
    await Promise.all(promises);
    console.log('All images preloaded successfully');
  } catch (error) {
    console.error('Error preloading images:', error);
  }
};

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
}

export const reportWebVitals = (metric: WebVitalMetric): void => {
  if (process.env.NODE_ENV === 'production') {
    console.log(metric);
  }
};

interface Cache<T> {
  get: (key: string) => T | undefined;
  set: (key: string, value: T) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean;
  clear: () => void;
  size: () => number;
  entries: () => IterableIterator<[string, T]>;
  keys: () => IterableIterator<string>;
}

export const createCache = <T>(maxSize: number = 100): Cache<T> => {
  const cache = new Map<string, T>();
  
  return {
    get: (key: string) => cache.get(key),
    set: (key: string, value: T) => {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    has: (key: string) => cache.has(key),
    delete: (key: string) => cache.delete(key),
    clear: () => cache.clear(),
    size: () => cache.size,
    entries: () => cache.entries(),
    keys: () => cache.keys()
  };
};

export const apiCache = createCache<any>(50);

export const createIntersectionObserver = (
  callback: IntersectionObserverCallback, 
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};