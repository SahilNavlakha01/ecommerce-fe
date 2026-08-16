import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B Wholesale Registration',
  description: 'Register as a B2B wholesale partner with NS Collection. Get exclusive bulk pricing on fashion jewelry for your boutique, shop, or reselling business.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
