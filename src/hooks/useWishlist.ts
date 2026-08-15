import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { 
  fetchWishlistAsync, 
  addToWishlistAsync, 
  removeFromWishlistAsync, 
  clearError,
  optimisticAdd,
  optimisticRemove
} from '../redux/features/wishlist/wishlistSlice';
import { isCustomerLoggedIn } from '../utils/auth';
import { wishlistToast, errorToast } from '../utils/toast';
import { debounce } from '../utils/performance';

interface WishlistItem {
  id: string | number;
  productId?: string | number;
  product_id?: string | number;
  name?: string;
  title?: string;
  basePrice?: number;
  price?: number;
  discountPrice?: number;
  image?: string;
  imageUrl?: string;
  productImage?: string;
  img?: string;
  thumbnail?: string;
  image_url?: string;
  imageurl?: string;
  wishlistId?: string | number;
  wishlist_id?: string | number;
  product?: any;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
  fetchLoading: boolean;
  error: any;
}

interface RootState {
  wishlist: WishlistState;
}

const GUEST_WISHLIST_KEY = 'wishlist'

const getGuestWishlist = (): WishlistItem[] => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_WISHLIST_KEY) || '[]')
  } catch {
    return []
  }
}

const saveGuestWishlist = (items: WishlistItem[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items))
}

export const useWishlist = () => {
  const dispatch = useDispatch();
  const [guestItems, setGuestItems] = useState<WishlistItem[]>(() => getGuestWishlist())
  const { items: rawItems, totalItems, fetchLoading, error } = useSelector(
    (state: RootState) => state.wishlist,
    (prev: WishlistState, next: WishlistState) => {
      return prev.items === next.items && 
             prev.totalItems === next.totalItems && 
             prev.fetchLoading === next.fetchLoading;
    }
  );
  const lastErrorRef = useRef<any>(null);
  const pendingOperations = useRef(new Set<string | number>());

  useEffect(() => {
    const sync = () => setGuestItems(getGuestWishlist())
    window.addEventListener('storage', sync)
    window.addEventListener('guestWishlistUpdated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('guestWishlistUpdated', sync)
    }
  }, [])

  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      errorToast(error.statusMessage || 'Wishlist operation failed');
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const debouncedApiCall = useMemo(
    () => debounce((action: any, productId: string | number) => {
      if (!pendingOperations.current.has(productId)) {
        pendingOperations.current.add(productId);
        dispatch(action(productId)).finally(() => {
          pendingOperations.current.delete(productId);
        });
      }
    }, 300),
    [dispatch]
  );

  const addToWishlist = useCallback(async (productOrId: any) => {
    try {
      let product = null;
      let productId = null;

      if (productOrId && typeof productOrId === 'object') {
        product = productOrId;
        productId = product.id || product.productId || product.product_id;
      } else {
        productId = productOrId;
      }

      if (!productId) {
        errorToast('Product not found');
        return;
      }

      const guestAlreadyHadItem = !isCustomerLoggedIn() && getGuestWishlist().some(item => String(item.id || item.productId) === String(productId))

      if (isCustomerLoggedIn()) {
        if (product) dispatch(optimisticAdd(product));
        else dispatch(optimisticAdd({ id: productId }));
        debouncedApiCall(addToWishlistAsync, productId);
      } else {
        const existing = getGuestWishlist()
        const normalizedId = String(productId)
        const nextItems = existing.some(item => String(item.id || item.productId) === normalizedId)
          ? existing.filter(item => String(item.id || item.productId) !== normalizedId)
          : [...existing, { ...(product || {}), id: productId, productId }]
        saveGuestWishlist(nextItems as WishlistItem[])
        setGuestItems(nextItems as WishlistItem[])
        window.dispatchEvent(new Event('guestWishlistUpdated'))
      }

      wishlistToast(guestAlreadyHadItem ? 'Removed from wishlist' : 'Added to wishlist')
    } catch (err) {
      console.error('Add to wishlist failed:', err)
      errorToast('Failed to add to wishlist')
    }
  }, [dispatch, debouncedApiCall]);

  const removeFromWishlist = useCallback(async (productId: string | number) => {
    try {
      if (isCustomerLoggedIn()) {
        dispatch(optimisticRemove(productId));
        debouncedApiCall(removeFromWishlistAsync, productId);
      } else {
        const nextItems = getGuestWishlist().filter(item => String(item.id || item.productId) !== String(productId))
        saveGuestWishlist(nextItems)
        setGuestItems(nextItems)
        window.dispatchEvent(new Event('guestWishlistUpdated'))
      }
      wishlistToast('Removed from wishlist');
    } catch (err) {
      console.error('Remove from wishlist failed:', err);
      errorToast('Failed to remove from wishlist');
    }
  }, [dispatch, debouncedApiCall]);

  const items = useMemo(() => {
    if (!isCustomerLoggedIn()) return guestItems as WishlistItem[]
    return (rawItems || []).map((entry: WishlistItem) => {
      if (entry && (entry.name || entry.title || entry.basePrice || entry.price)) {
        const img = entry.image || entry.imageUrl || entry.productImage || entry.img || entry.thumbnail || entry.image_url || entry.imageurl;
        return { ...entry, wishlistId: entry.wishlistId || entry.id || entry.wishlist_id, image: img };
      }

      if (entry && entry.product) {
        const product = entry.product;
        const img = product.image || product.imageUrl || product.productImage || product.img || product.thumbnail || product.image_url || product.imageurl;
        return {
          ...product,
          wishlistId: entry.id || entry.wishlistId || entry.wishlist_id,
          image: img
        };
      }

      return entry;
    });
  }, [rawItems, guestItems]);

  const isInWishlist = useCallback((productId: string | number) => {
    if (!productId) return false;
    
    const productIdStr = String(productId);

    if (!isCustomerLoggedIn()) {
      return getGuestWishlist().some(item => String(item.id || item.productId) === productIdStr)
    }
    
    const matchInRaw = (rawItems || []).some((item: WishlistItem) => {
      const idFromEntry = item.productId || item.product_id || (item.product && (item.product.id || item.product.productId)) || item.id;
      return String(idFromEntry) === productIdStr;
    });
    
    return matchInRaw;
  }, [rawItems]);

  const refreshWishlist = useCallback(async () => {
    if (!isCustomerLoggedIn()) {
      setGuestItems(getGuestWishlist())
      return
    }
    try {
      await dispatch(fetchWishlistAsync() as any).unwrap();
    } catch (err) {
      console.error('Failed to refresh wishlist:', err);
    }
  }, [dispatch]);

  const clearWishlist = useCallback(async (onConfirm?: () => void) => {
    if (onConfirm) {
      onConfirm();
    }
    try {
      if (isCustomerLoggedIn()) {
        const itemsToRemove = items.map((item: any) => item.productId || item.product_id || item.id);
        await Promise.all(itemsToRemove.map((id: string | number) => dispatch(removeFromWishlistAsync(id))));
        dispatch({ type: 'wishlist/clearWishlist' });
      } else {
        saveGuestWishlist([])
        setGuestItems([])
        window.dispatchEvent(new Event('guestWishlistUpdated'))
      }
      wishlistToast('Wishlist cleared');
    } catch (error) {
      console.error('Clear wishlist failed:', error);
      errorToast('Failed to clear wishlist');
    }
  }, [items, dispatch]);

  return {
    items,
    rawItems,
    totalItems,
    fetchLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist,
    clearWishlist
  };
};
