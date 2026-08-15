import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login with OTP',
  description: 'Sign in to your Ethnic Sparkles account using a one-time password.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
