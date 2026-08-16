import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Wishlist',
  description: 'Your saved NS Collection fashion jewelry — revisit and shop your favourite rings, earrings, necklaces and more.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
