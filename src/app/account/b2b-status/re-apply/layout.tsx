import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Re-Apply for B2B Access',
  description: 'Update and resubmit your Ethnic Sparkles B2B wholesale application for business account verification.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
