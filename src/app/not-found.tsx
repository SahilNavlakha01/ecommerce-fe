import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist. Browse our fashion jewelry collection at NS Collection.',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-sans">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <svg className="w-10 h-10 text-rose-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.137 0-4.146.832-5.636 2.172M6 18h12a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-6xl font-serif font-bold text-stone-900 mb-2">404</h1>
        <h2 className="text-xl font-serif font-bold text-stone-800 mb-3">Page Not Found</h2>
        <p className="text-stone-500 text-sm mb-8">
          The jewellery piece or page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md"
          >
            Go to Homepage
          </Link>
          <Link
            href="/shop"
            className="inline-block w-full bg-white text-rose-900 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-widest border border-stone-200 hover:bg-rose-50/60 transition-all shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}