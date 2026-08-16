import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'Your saved NS Collection fashion jewelry pieces — rings, earrings, necklaces and more waiting for you.',
  robots: { index: false, follow: false },
}

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
