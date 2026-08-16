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
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="transition-transform hover:scale-105">
          <ProfessionalLogo size="xl" showText />
        </Link>
      </div>
      <div className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
        <div className="p-6 sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Admin access</p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Sign in to the admin panel</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">Use your admin email and password to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="support@nscollection.com"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
