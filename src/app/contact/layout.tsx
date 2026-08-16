import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with NS Collection jewelry experts for questions, customization requests, or support. We\'re here to help.',
  openGraph: {
    title: 'Contact NS Collection',
    description: 'Reach out to our jewelry experts for any questions or special requests.',
    url: '/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
