import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Ethnic Sparkles and explore a curated collection of premium handcrafted jewelry. Sign up for exclusive offers and member benefits.',
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
