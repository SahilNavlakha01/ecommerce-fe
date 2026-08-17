'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginUser } from '@/Services/PostService'
import { setAuthCookie } from '@/utils/auth'
import Link from 'next/link'
import ProfessionalLogo from '@/components/ui/ProfessionalLogo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await LoginUser({ email: email.trim(), password, isB2bLogin: false })
      const payload = res?.data?.data
      const user = payload?.user

      if (!user || user.userRole !== 3) {
        setError('This account is not an admin account.')
        return
      }

      setAuthCookie(payload.token, user, 'admin')
      router.push('/admin')
    } catch (err: any) {
      setError(err?.response?.data?.statusMessage || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="mb-6 text-center">
        <Link href="/" className="transition-transform hover:scale-105 inline-block">
          <ProfessionalLogo size="xl" showText />
        </Link>
      </div>

      <div className="w-full max-w-[440px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_50px_rgba(159,18,57,0.06)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-700 to-rose-950" />
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 mb-2">
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-widest">Admin Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">Sign In to Dashboard</h1>
            <p className="mt-1 text-xs text-stone-500">Authorized administrative personnel only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nscollection.com"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-700 focus:bg-white focus:ring-4 focus:ring-rose-100"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-rose-700 focus:bg-white focus:ring-4 focus:ring-rose-100"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
