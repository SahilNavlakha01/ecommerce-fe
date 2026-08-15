import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AddToCart, DeleteCartItem, ClearCart, UpdateCartQuantity } from '../../../Services/PostService.jsx';
import { FetchCart } from '../../../Services/GetService.jsx';
import { getAuthCookie } from '../../../utils/auth';

const getEffectiveUnitPrice = (item) => {
  const isB2bUser = item?.userRoleName === 'B2b Customer';
  const isB2bProduct = item?.isB2b || item?.isBoth;
  if (isB2bUser && isB2bProduct && item?.b2bPrice) return Number(item.b2bPrice);
  const basePrice = Number(item?.basePrice || item?.price || 0);
  const discountPrice = Number(item?.discountPrice || 0);
  if (basePrice > 0 && discountPrice > 0 && discountPrice < basePrice) return basePrice - discountPrice;
  return basePrice;
};

// Async thunks for cart operations
export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const authData = getAuthCookie('user');
      if (!authData?.user?.id) {
        throw new Error('User not authenticated');
      }
      const response = await FetchCart(authData.user.id);
      return {
        cart: response?.data?.data?.cart || null,
        items: response?.data?.data?.items || []
      };
    } catch (error) {
      // 404 = no cart exists yet (empty cart) — not a real error
      if (error?.response?.data?.status === 404) {
        return { cart: null, items: [] };
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity, size }, { rejectWithValue }) => {
    try {
      const authData = getAuthCookie('user');
      if (!authData?.user?.id) {
        console.error('User not authenticated:', authData);
        throw new Error('User not authenticated');
      }
      
      const userId = parseInt(authData.user.id);
      const parsedProductId = parseInt(productId);
      const parsedQuantity = parseInt(quantity);
      
      const params = {
        userId,
        sessionId: `session_${userId}_${Date.now()}`,
        productId: parsedProductId,
        quantity: parsedQuantity,
        size: size || null
      };
      
      console.log('AddToCart params:', params);
      
      const response = await AddToCart(params);
      return response;
    } catch (error) {
      console.error('AddToCart error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCartQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartItemId, quantity, userId }, { rejectWithValue }) => {
    try {
      const response = await UpdateCartQuantity({ cartItemId, quantity, userId });
      return { cartItemId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      await DeleteCartItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearCartAsync = createAsyncThunk(
  'cart/clearCart',
  async (cartId, { rejectWithValue }) => {
    try {
      await ClearCart(cartId);
      return cartId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCartAsync.pending, (state) => {
        // Don't show loading for refresh operations
        state.error = null;
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart;
        state.items = action.payload.items || [];
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalAmount = state.items.reduce((sum, item) => sum + (getEffectiveUnitPrice(item) * item.quantity), 0);
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add to cart (optimistic update for instant UX)
      .addCase(addToCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        // Trigger immediate cart fetch for updated data
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update cart quantity
      .addCase(updateCartQuantityAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        const { cartItemId, quantity } = action.payload;
        const item = state.items.find(item => String(item.id) === String(cartItemId));
        if (item) {
          item.quantity = quantity;
          state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
          state.totalAmount = state.items.reduce((sum, item) => sum + (getEffectiveUnitPrice(item) * item.quantity), 0);
        }
      })
      .addCase(updateCartQuantityAsync.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove from cart — update Redux state immediately on success
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(item => String(item.id) !== String(action.payload));
        state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalAmount = state.items.reduce((sum, item) => sum + (getEffectiveUnitPrice(item) * item.quantity), 0);
      })
      // Clear cart
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.cart = null;
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;
