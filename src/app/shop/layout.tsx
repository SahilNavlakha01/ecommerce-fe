import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Fashion Jewelry',
  description: 'Shop the full Ethnic Sparkles fashion jewelry collection — ethnic rings, jhumkas, necklaces, bangles, and more. Filter by category, occasion, and price.',
  keywords: ['shop fashion jewelry India', 'buy ethnic jewelry online', 'jhumka earrings', 'kundan necklace', 'bangles online', 'fashion jewelry collection'],
  openGraph: {
    title: 'Shop Fashion Jewelry | Ethnic Sparkles',
    description: 'Explore our full ethnic and fashion jewelry collection with rings, earrings, necklaces, bangles and more.',
    url: '/shop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Fashion Jewelry | Ethnic Sparkles',
    description: 'Explore our full ethnic and fashion jewelry collection.',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
