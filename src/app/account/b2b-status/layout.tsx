import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'B2B Approval Status',
  description: 'Track your Ethnic Sparkles B2B wholesale account verification and approval journey.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
