"use client"

import { createContext, useMemo, useReducer, ReactNode, useCallback } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  qty: number
}

type CartState = {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD"; payload: Omit<CartItem, "qty">; qty?: number }
  | { type: "REMOVE"; id: string }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "CLEAR" }

const initialState: CartState = { items: [] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = action.qty ?? 1
      const exists = state.items.find(i => i.id === action.payload.id)
      if (exists) {
        return {
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, qty: i.qty + qty } : i
          ),
        }
      }
      return { items: [...state.items, { ...action.payload, qty }] }
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.id !== action.id) }
    case "SET_QTY":
      return {
        items: state.items.map(i => (i.id === action.id ? { ...i, qty: action.qty } : i)),
      }
    case "CLEAR":
      return initialState
    default:
      return state
  }
}

export const CartContext = createContext({
  items: [] as CartItem[],
  totalItems: 0,
  totalPrice: 0,
  add: (_item: Omit<CartItem, "qty">, _qty?: number) => {},
  remove: (_id: string) => {},
  setQty: (_id: string, _qty: number) => {},
  clear: () => {},
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const add = useCallback((item: Omit<CartItem, "qty">, qty?: number) => {
    dispatch({ type: "ADD", payload: item, qty })
  }, [])
  const remove = useCallback((id: string) => dispatch({ type: "REMOVE", id }), [])
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "SET_QTY", id, qty }), [])
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), [])

  const totals = useMemo(() => {
    const totalItems = state.items.reduce((s, i) => s + i.qty, 0)
    const totalPrice = state.items.reduce((s, i) => s + i.price * i.qty, 0)
    return { totalItems, totalPrice }
  }, [state.items])

  const value = useMemo(
    () => ({ items: state.items, ...totals, add, remove, setQty, clear }),
    [state.items, totals, add, remove, setQty, clear]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}


