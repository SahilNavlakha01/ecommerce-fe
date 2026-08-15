"use client"

import { createContext, useMemo, useReducer, ReactNode, useCallback, useEffect } from "react"

type WishItem = { id: string; name: string; image?: string; price?: number }
type State = { items: WishItem[] }
type Action = { type: "TOGGLE"; item: WishItem } | { type: "REMOVE"; id: string } | { type: "CLEAR" } | { type: "INIT"; items: WishItem[] }

const initial: State = { items: [] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return { items: action.items }
    case "TOGGLE": {
      const exists = state.items.some(i => i.id === action.item.id)
      return exists ? { items: state.items.filter(i => i.id !== action.item.id) } : { items: [...state.items, action.item] }
    }
    case "REMOVE":
      return { items: state.items.filter(i => i.id !== action.id) }
    case "CLEAR":
      return initial
    default:
      return state
  }
}

export const WishlistContext = createContext({
  items: [] as WishItem[],
  count: 0,
  toggle: (_item: WishItem) => {},
  remove: (_id: string) => {},
  clear: () => {},
})

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)

  useEffect(() => {
    const saved = localStorage.getItem('wishlist')
    if (saved) {
      try {
        dispatch({ type: 'INIT', items: JSON.parse(saved) })
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(state.items))
  }, [state.items])

  const toggle = useCallback((item: WishItem) => dispatch({ type: "TOGGLE", item }), [])
  const remove = useCallback((id: string) => dispatch({ type: "REMOVE", id }), [])
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), [])
  const value = useMemo(() => ({ items: state.items, count: state.items.length, toggle, remove, clear }), [state.items, toggle, remove, clear])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}


