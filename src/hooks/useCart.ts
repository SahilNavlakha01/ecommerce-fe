import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { 
  fetchCartAsync, 
  addToCartAsync, 
  removeFromCartAsync, 
  clearCartAsync,
  clearError 
} from '../redux/features/cart/cartSlice';
import { isCustomerLoggedIn } from '../utils/auth';
import { successToast, errorToast } from '../utils/toast';
import { getGuestCart, removeFromGuestCart, updateGuestCartQty, clearGuestCart as clearGuestCartStorage, GuestCartItem } from '../utils/guestCart';

interface CartItem {
  id: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  imageUrl?: string;
  image?: string;
  productImage?: string;
  productName?: string;
  selectedSize?: string;
  product?: any;
  [key: string]: any;
}

interface Cart {
  id: string | number;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  loading: boolean;
  error: any;
}

interface RootState {
  cart: CartState;
}

// Global flag to prevent multiple simultaneous fetches
let isCartFetching = false;
let cartFetchPromise: Promise<any> | null = null;

export const useCart = () => {
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([])
  const [initialFetching, setInitialFetching] = useState(false)
  const [isGuest, setIsGuest] = useState(true)
  const dispatch = useDispatch();
  const cartState = useSelector((state: RootState) => state.cart);
  const { cart, items, totalItems, totalAmount, loading, error } = cartState;
  const hasInitialized = useRef(false);
  const lastErrorRef = useRef<any>(null);

  // Sync guest cart from localStorage
  useEffect(() => {
    const sync = () => setGuestItems(getGuestCart())
    sync()
    window.addEventListener('guestCartUpdated', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('guestCartUpdated', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    const loggedIn = isCustomerLoggedIn()
    setIsGuest(!loggedIn)
    if (!loggedIn) {
      setInitialFetching(false);
      return;
    }
    setInitialFetching(true);
    if (!hasInitialized.current && !isCartFetching) {
      hasInitialized.current = true;
      isCartFetching = true;
      cartFetchPromise = (dispatch as any)((fetchCartAsync as any)()).finally(() => {
        isCartFetching = false;
        cartFetchPromise = null;
        setInitialFetching(false);
      });
    } else if (cartFetchPromise) {
      cartFetchPromise.finally(() => setInitialFetching(false));
    } else {
      setInitialFetching(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      // 404 on cart fetch = no cart yet (empty), not a real error — don't toast it
      const is404CartNotFound = error?.status === 404 || error?.statusMessage === 'Cart not found';
      if (!is404CartNotFound) {
        const errorMessage = error?.statusMessage || error?.message || 'Cart operation failed';
        errorToast(errorMessage);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const addToCart = useCallback(async (productId: string | number, quantity: number = 1, size?: string) => {
    if (!isCustomerLoggedIn()) {
      errorToast('Please login to add items to cart');
      return;
    }
    try {
      await (dispatch as any)((addToCartAsync as any)({ productId, quantity, size })).unwrap();
      if (!isCartFetching) {
        isCartFetching = true;
        (dispatch as any)((fetchCartAsync as any)()).finally(() => { isCartFetching = false; });
      }
    } catch (error: any) {
      throw error;
    }
  }, [dispatch]);

  const removeFromCart = useCallback(async (itemId: string | number) => {
    if (!isCustomerLoggedIn()) {
      setGuestItems(removeFromGuestCart(itemId))
      window.dispatchEvent(new Event('guestCartUpdated'))
      return
    }
    try {
      // cartSlice.removeFromCartAsync.fulfilled immediately updates Redux items
      await (dispatch as any)((removeFromCartAsync as any)(itemId)).unwrap();
      successToast('Item removed from cart');
      // Background refetch to sync any server-side changes
      if (!isCartFetching) {
        isCartFetching = true;
        (dispatch as any)((fetchCartAsync as any)()).finally(() => { isCartFetching = false; });
      }
    } catch (error) {
      console.error('Remove from cart failed:', error);
      throw error;
    }
  }, [dispatch]);

  const clearCart = useCallback(async () => {
    if (!cart?.id) return;
    try {
      await (dispatch as any)((clearCartAsync as any)(cart.id)).unwrap();
      successToast('Cart cleared');
    } catch (error) {
      errorToast('Failed to clear cart');
    }
  }, [dispatch, cart?.id]);

  const refreshCart = useCallback(() => {
    if (isCustomerLoggedIn() && !isCartFetching) {
      isCartFetching = true;
      (dispatch as any)((fetchCartAsync as any)()).finally(() => { isCartFetching = false; });
    }
  }, [dispatch]);

  const removeGuestItem = useCallback((productId: string | number) => {
    setGuestItems(removeFromGuestCart(productId))
    window.dispatchEvent(new Event('guestCartUpdated'))
  }, [])

  const updateGuestQty = useCallback((productId: string | number, quantity: number) => {
    setGuestItems(updateGuestCartQty(productId, quantity))
    window.dispatchEvent(new Event('guestCartUpdated'))
  }, [])

  const clearGuest = useCallback(() => {
    clearGuestCartStorage()
    setGuestItems([])
    window.dispatchEvent(new Event('guestCartUpdated'))
  }, [])

  const guestTotalItems = useMemo(() => guestItems.reduce((s, i) => s + i.quantity, 0), [guestItems])
  const guestTotalAmount = useMemo(() => guestItems.reduce((s, i) => s + i.price * i.quantity, 0), [guestItems])

  const serverItems = items || []
  const serverTotalItems = totalItems || 0
  const serverTotalAmount = totalAmount || 0

  return {
    cart,
    loading: loading || false,
    error,
    items: isGuest ? guestItems : serverItems,
    totalItems: isGuest ? guestTotalItems : serverTotalItems,
    totalAmount: isGuest ? guestTotalAmount : serverTotalAmount,
    isGuest,
    initialFetching,
    guestItems,
    addToCart,
    removeFromCart,
    removeGuestItem,
    updateGuestQty,
    clearGuest,
    clearCart,
    refreshCart
  };
};
