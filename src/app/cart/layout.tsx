import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Shopping Cart',
  description: 'Review your selected Ethnic Sparkles fashion jewelry pieces and proceed to secure checkout.',
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
