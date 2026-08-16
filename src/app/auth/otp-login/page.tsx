'use client'

import { useState, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { RegisterWithPhone, SendOtp, VerifyOtp } from '@/Services/PostService'
import { setAuthCookie } from '@/utils/auth'
import { getGuestCart } from '@/utils/guestCart'
import { migrateGuestCartToServer } from '@/utils/migrateGuestCart'
import AccountTypeSelector from '@/components/ui/AccountTypeSelector'
import { warmupServer } from '@/utils/serverWarmup'
import ProfessionalLogo from '@/components/ui/ProfessionalLogo'

type Step = 'phone' | 'otp' | 'choose'

export default function OtpLoginPage() {
  const currentYear = new Date().getFullYear()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])
  const lastSubmittedOtpRef = useRef('')

  useEffect(() => {
    // Fire-and-forget background warmup — never blocks the UI
    warmupServer()
  }, [])

  const extractError = (err: any, fallback: string): string => {
    const serverMsg = err?.response?.data?.statusMessage
    if (serverMsg) return serverMsg
    if (err?.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
    if (!err?.response) return fallback
    return err?.message || fallback
  }

  const requestOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      return
    }
    setIsLoading(true)
    try {
      await SendOtp({ contactType: 'mobile', contactValue: phone, isLoginAuth: true })
      setOtp('')
      lastSubmittedOtpRef.current = ''
      setStep('otp')
    } catch (err: any) {
      setError(extractError(err, 'Unable to send OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    await requestOtp()
  }

  const verifyOtpCode = async (code: string) => {
    setError('')
    const sanitizedOtp = code.replace(/\D/g, '').slice(0, 6)
    if (!/^\d{6}$/.test(sanitizedOtp)) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setIsLoading(true)
    try {
      const res = await VerifyOtp({ contactType: 'mobile', contactValue: phone, otpCode: sanitizedOtp, isLoginAuth: true })
      const payload = res?.data?.data || {}

      if (payload?.isExist && payload?.user && payload?.token) {
        setAuthCookie(payload.token, payload.user, payload.user.userRole === 3 ? 'admin' : 'user')
        const hadGuestItems = getGuestCart().length > 0
        await migrateGuestCartToServer(payload.user.id)
        router.push(payload.user.userRole === 3 ? '/admin' : hadGuestItems ? '/cart' : '/')
        return
      }

      setStep('choose')
    } catch (err: any) {
      setError(extractError(err, 'Invalid OTP. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyOtpCode(otp)
  }

  const otpDigits = otp.padEnd(6, ' ').split('').slice(0, 6)

  const focusOtpIndex = (index: number) => {
    otpRefs.current[index]?.focus()
  }

  const updateOtp = (nextValue: string) => {
    const sanitized = nextValue.replace(/\D/g, '').slice(0, 6)
    setOtp(sanitized)
  }

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const chars = otp.padEnd(6, ' ').split('').slice(0, 6)
    chars[index] = digit || ''
    const nextOtp = chars.join('').replace(/\s/g, '')
    setOtp(nextOtp)

    if (digit && index < 5) {
      focusOtpIndex(index + 1)
    }
  }

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index].trim() && index > 0) {
      focusOtpIndex(index - 1)
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      focusOtpIndex(index - 1)
    }
    if (e.key === 'ArrowRight' && index < 5) {
      focusOtpIndex(index + 1)
    }
  }

  const handleOtpPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    updateOtp(pasted)
    focusOtpIndex(Math.min(pasted.length, 5))
  }

  const handleChooseType = async (accountType: 'retail' | 'b2b') => {
    setIsLoading(true)
    setError('')
    try {
      const res = await RegisterWithPhone({ phone, accountType })
      const { user, token } = res.data.data
      setAuthCookie(token, user, user.userRole === 3 ? 'admin' : 'user')
      const hadGuestItems = getGuestCart().length > 0
      await migrateGuestCartToServer(user.id)
      if (user.userRole === 3) {
        router.push('/admin')
      } else {
        router.push(hadGuestItems ? '/cart' : '/')
      }
    } catch (err: any) {
      setError(extractError(err, 'Something went wrong. Please check your connection and try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (step !== 'otp') return

    const controller = new AbortController()
    const timer = window.setTimeout(() => focusOtpIndex(0), 0)

    const startWebOtp = async () => {
      if (typeof window === 'undefined' || !('OTPCredential' in window) || !('credentials' in navigator)) return
      try {
        // Web OTP API works on supported mobile browsers over secure origins.
        const credential = await (navigator as any).credentials.get({
          otp: { transport: ['sms'] },
          signal: controller.signal
        })
        const code = String((credential as any)?.code || '').replace(/\D/g, '').slice(0, 6)
        if (code.length === 6) {
          updateOtp(code)
        }
      } catch {
        // Silently ignore unsupported browsers or user-dismissed prompts.
      }
    }

    startWebOtp()

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [step])

  useEffect(() => {
    if (step !== 'otp') return
    if (!/^\d{6}$/.test(otp)) return
    if (isLoading) return
    if (lastSubmittedOtpRef.current === otp) return

    lastSubmittedOtpRef.current = otp
    void verifyOtpCode(otp)
  }, [otp, step, isLoading])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
          <div className="w-full">
            <div className="mb-6 flex justify-center">
              <Link href="/" className="transition-transform hover:scale-105">
                <ProfessionalLogo size="xl" showText />
              </Link>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
              <div className="h-1 w-full bg-teal-500" />

              <div className="p-5 sm:p-8">
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                    {step === 'choose' ? 'Almost there' : step === 'otp' ? 'Verify mobile' : 'Sign in / Register'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[2rem]">
                    {step === 'choose'
                      ? 'Choose your account type'
                      : step === 'otp'
                        ? 'Enter the OTP sent to your phone'
                        : 'Continue with your mobile number'}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
                    {step === 'choose'
                      ? 'Select Retail for personal shopping or Business for wholesale access.'
                      : step === 'otp'
                        ? 'We sent a 6-digit code to this number. Enter it to continue.'
                        : 'Enter your mobile number to continue.'}
                  </p>
                </div>

                {step === 'phone' && (
                  <form onSubmit={handlePhoneSubmit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Mobile number</label>
                      <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition focus-within:border-teal-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-100">
                        <span className="inline-flex items-center border-r border-gray-200 px-4 text-sm font-semibold text-gray-600 sm:px-5">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="10-digit mobile number"
                          autoFocus
                          className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || phone.length < 10}
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Checking...' : 'Continue'}
                    </button>
                  </form>
                )}

                {step === 'otp' && (
                  <form onSubmit={handleOtpSubmit} className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">OTP code</label>
                        <span className="text-xs font-medium text-gray-400">Auto-fill supported</span>
                      </div>
                      <div
                        className="grid grid-cols-6 gap-2 sm:gap-3"
                        onPaste={handleOtpPaste}
                      >
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => { otpRefs.current[index] = el }}
                            type="tel"
                            inputMode="numeric"
                            autoComplete={index === 0 ? 'one-time-code' : 'off'}
                            maxLength={1}
                            value={digit === ' ' ? '' : digit}
                            onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            className="h-12 rounded-2xl border border-gray-200 bg-gray-50 text-center text-lg font-bold tracking-[0.1em] text-gray-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 sm:h-14"
                          />
                        ))}
                      </div>
                    </div>

                    {error && (
                      <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || otp.length < 6}
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setOtp(''); setError(''); lastSubmittedOtpRef.current = '' }}
                        className="text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
                        disabled={isLoading}
                      >
                        Change number
                      </button>
                      <button
                        type="button"
                        onClick={() => { setError(''); requestOtp() }}
                        className="text-teal-700 underline-offset-4 hover:text-teal-900 hover:underline"
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {step === 'choose' && (
                  <div className="space-y-5">
                    <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                      Mobile: <span className="font-semibold">+91 {phone}</span>
                      <button
                        type="button"
                        onClick={() => { setStep('phone'); setError(''); setOtp(''); lastSubmittedOtpRef.current = '' }}
                        className="ml-3 text-xs text-teal-600 underline hover:text-teal-800"
                      >
                        Change
                      </button>
                    </div>
                    <AccountTypeSelector
                      onSelect={handleChooseType}
                      isLoading={isLoading}
                    />
                    {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                  </div>
                )}

                <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-400">© {currentYear} NS Collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
