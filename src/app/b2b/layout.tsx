import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B Wholesale Jewellery | NS Collection',
  description: 'NS Collection B2B wholesale program — bulk jewellery orders with exclusive pricing for retailers and businesses.',
  openGraph: {
    title: 'B2B Wholesale Jewellery | NS Collection',
    url: '/b2b',
  },
}

export default function B2bLayout({ children }: { children: React.ReactNode }) {
  return children
}
