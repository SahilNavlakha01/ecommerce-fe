import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'cart/fetchCart/fulfilled',
          'wishlist/fetchWishlist/fulfilled',
          'wishlist/addToWishlist/fulfilled',
          'wishlist/removeFromWishlist/fulfilled'
        ],
        ignoredPaths: [
          'payload.headers', 
          'payload.config', 
          'payload.request',
          'payload.status',
          'payload.statusText',
          'meta.arg',
          'meta.baseQueryMeta',
          'payload.data',
          'payload.response'
        ],
      },
    }),
});

export default store;
