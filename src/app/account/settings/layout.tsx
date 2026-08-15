import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your Ethnic Sparkles account security settings — update your password and preferences.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
