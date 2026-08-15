import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Update your personal details and preferences on Ethnic Sparkles.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
