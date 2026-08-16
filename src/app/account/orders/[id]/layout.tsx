import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View your NS Collection jewelry order details, shipment tracking, and download your invoice.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
