import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Addresses',
  description: 'Manage your saved delivery addresses on NS Collection.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
