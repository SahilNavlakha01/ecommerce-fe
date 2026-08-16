import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login with OTP',
  description: 'Sign in to your NS Collection account using a one-time password.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
