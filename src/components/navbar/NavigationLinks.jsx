"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { GetAllCategories } from "../../Services/GetService.jsx"

export default function NavigationLinks() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    GetAllCategories()
      .then(r => { if (r?.data?.data) setCategories(r.data.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <nav className="flex items-center justify-center gap-2 w-full py-3">
      <NavLink href="/">Home</NavLink>

      {loading
        ? [...Array(4)].map((_, i) => (
          <div key={i} className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
        ))
        : categories.map((cat) => (
          <NavLink key={cat.id} href={`/shop?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`}>
            {cat.name}
          </NavLink>
        ))
      }
    </nav>
  )
}

function NavLink({ href, children }) {
  return (
    <Link href={href}
      className="relative px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-700 hover:text-rose-900 rounded-md hover:bg-rose-50/60 transition-all duration-200 whitespace-nowrap group">
      {children}
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-rose-700 via-rose-500 to-amber-500 group-hover:w-4/5 transition-all duration-300 rounded-full" />
    </Link>
  )
}
