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
      className="relative px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition-all duration-200 whitespace-nowrap group">
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-teal-600 group-hover:w-3/4 transition-all duration-300 rounded-full" />
    </Link>
  )
}
