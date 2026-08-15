import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your Ethnic Sparkles fashion jewelry order securely. Fast delivery across India with multiple payment options.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
