import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Fashion Jewelry',
  description: 'Shop the full NS Collection fashion jewelry collection — rings, jhumkas, necklaces, bangles, and more. Filter by category, occasion, and price.',
  keywords: ['shop fashion jewelry India', 'buy fashion jewelry online', 'jhumka earrings', 'kundan necklace', 'bangles online', 'fashion jewelry collection'],
  openGraph: {
    title: 'Shop Fashion Jewelry | NS Collection',
    description: 'Explore our full fashion jewelry collection with rings, earrings, necklaces, bangles and more.',
    url: '/shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Fashion Jewelry | NS Collection',
    description: 'Explore our full fashion jewelry collection.',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
