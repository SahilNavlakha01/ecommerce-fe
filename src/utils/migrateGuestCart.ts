import { getGuestCart, clearGuestCart } from './guestCart'
import { AddToCart } from '../Services/PostService'

/**
 * After login, push all guest cart items to the server cart.
 * The backend auto-calculates price based on user role (retail vs B2B),
 * so no client-side price logic needed here.
 */
export const migrateGuestCartToServer = async (userId: string | number): Promise<void> => {
  const guestItems = getGuestCart()
  if (!guestItems.length) return

  await Promise.allSettled(
    guestItems.map(item =>
      AddToCart({
        userId: Number(userId),
        sessionId: `session_${userId}_${Date.now()}`,
        productId: Number(item.productId),
        quantity: item.quantity,
        size: item.size || null,
      })
    )
  )

  clearGuestCart()
  window.dispatchEvent(new Event('guestCartUpdated'))
}
