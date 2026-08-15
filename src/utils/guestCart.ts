const GUEST_CART_KEY = 'guestCart'

export interface GuestCartItem {
  id: string | number
  productId: string | number
  name: string
  price: number
  basePrice: number
  discountPrice: number
  quantity: number
  imageUrl?: string
  image?: string
  stockQuantity?: number
  weight?: string
  purity?: string
  size?: string | null
  description?: string
  rating?: number
  avgRating?: number
  reviewCount?: number
  discount?: number
  isB2b?: boolean
  isBoth?: boolean
  b2bPrice?: number
  minQuantity?: number
}

export const getGuestCart = (): GuestCartItem[] => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveGuestCart = (items: GuestCartItem[]): void => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export const addToGuestCart = (product: Omit<GuestCartItem, 'id' | 'quantity'> & { id?: string | number }, quantity = 1): GuestCartItem[] => {
  const items = getGuestCart()
  const existing = items.find(i => i.productId === product.productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    items.push({ ...product, id: product.productId, quantity })
  }
  saveGuestCart(items)
  return items
}

export const removeFromGuestCart = (productId: string | number): GuestCartItem[] => {
  const items = getGuestCart().filter(i => i.productId !== productId)
  saveGuestCart(items)
  return items
}

export const updateGuestCartQty = (productId: string | number, quantity: number): GuestCartItem[] => {
  const items = getGuestCart().map(i => i.productId === productId ? { ...i, quantity } : i)
  saveGuestCart(items)
  return items
}

export const clearGuestCart = (): void => {
  localStorage.removeItem(GUEST_CART_KEY)
}
