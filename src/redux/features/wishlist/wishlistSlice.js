import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AddToWishlist, RemoveFromWishlist } from '../../../Services/PostService.jsx';
import { FetchWishlist } from '../../../Services/GetService.jsx';
import { getAuthCookie } from '../../../utils/auth';

export const fetchWishlistAsync = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const { user } = getAuthCookie('user');
      if (!user?.id) throw new Error('User not authenticated');
      
      const response = await FetchWishlist(user.id);
      return response?.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const { user } = getAuthCookie('user');
      if (!user?.id) throw new Error('User not authenticated');
      
      await AddToWishlist({ userId: user.id, productId });
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const { user } = getAuthCookie('user');
      if (!user?.id) throw new Error('User not authenticated');
      
      await RemoveFromWishlist({ userId: user.id, productId });
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    totalItems: 0,
  fetchLoading: false,
  pendingOps: [],
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
    },
    // Optimistic updates
    optimisticAdd: (state, action) => {
      const product = action.payload;
      const id = product?.id || product?.productId || product?.product_id;
      if (!state.items.some(item => String(item.id || item.productId || item.product_id) === String(id))) {
        state.items.push({ ...product, wishlistId: product.wishlistId || `temp-${Date.now()}` });
        state.totalItems = state.items.length;
      }
    },
    optimisticRemove: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => String(item.id || item.productId || item.product_id) !== String(productId));
      state.totalItems = state.items.length;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistAsync.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlistAsync.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.items = action.payload;
        state.totalItems = state.items.length;
      })
      .addCase(fetchWishlistAsync.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlistAsync.pending, (state, action) => {
        state.pendingOps.push(action.meta.arg);
        state.error = null;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.pendingOps = state.pendingOps.filter(id => String(id) !== String(action.meta.arg));
      })
      .addCase(addToWishlistAsync.rejected, (state, action) => {
        state.pendingOps = state.pendingOps.filter(id => String(id) !== String(action.meta.arg));
        state.error = action.payload;
      })
      .addCase(removeFromWishlistAsync.pending, (state, action) => {
        state.pendingOps.push(action.meta.arg);
        state.error = null;
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.pendingOps = state.pendingOps.filter(id => String(id) !== String(action.meta.arg));
      })
      .addCase(removeFromWishlistAsync.rejected, (state, action) => {
        state.pendingOps = state.pendingOps.filter(id => String(id) !== String(action.meta.arg));
        state.error = action.payload;
      });
  },
});

export const { clearError, clearWishlist, optimisticAdd, optimisticRemove } = wishlistSlice.actions;
export default wishlistSlice.reducer;
