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
    <div className="min-h-screen bg-[#faf9f6] relative flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Subtle Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto">
        
        {/* Brand Logo Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="transition-transform hover:scale-105 inline-block">
            <ProfessionalLogo size="xl" showText />
          </Link>
          <p className="text-stone-500 text-xs mt-3 tracking-widest uppercase font-medium">
            Fashion Jewellery & Accessories
          </p>
        </div>

        {/* Main Luxury Auth Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-[0_20px_50px_rgba(159,18,57,0.06)] overflow-hidden">
          
          {/* Top Gradient Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-700 to-rose-950" />

          <div className="p-6 sm:p-8">
            <div className="mb-6 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-[0.18em]">
                  {step === 'choose' ? 'Final Step' : step === 'otp' ? 'Security Verification' : 'Quick & Secure Access'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
                {step === 'choose'
                  ? 'Select Account Type'
                  : step === 'otp'
                    ? 'Enter 6-Digit OTP'
                    : 'Login or Sign Up'}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-stone-500 leading-relaxed">
                {step === 'choose'
                  ? 'Choose Retail for personal shopping or Business for wholesale pricing.'
                  : step === 'otp'
                    ? `Enter the one-time code sent to +91 ${phone}`
                    : 'Enter your 10-digit mobile number to receive an instant verification code.'}
              </p>
            </div>

            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-stone-200 bg-stone-50/70 transition-all focus-within:border-rose-700 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-100">
                    <span className="inline-flex items-center border-r border-stone-200 px-4 text-xs font-bold text-stone-700 bg-stone-100/50">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="Enter 10-digit number"
                      autoFocus
                      className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm font-semibold text-stone-900 outline-none placeholder:text-stone-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || phone.length < 10}
                  className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    'Get OTP Code'
                  )}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">Verification Code</label>
                    <span className="text-[11px] font-medium text-rose-800">Auto-fill ready</span>
                  </div>
                  <div
                    className="grid grid-cols-6 gap-2"
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
                        className="h-12 sm:h-14 rounded-xl border border-stone-200 bg-stone-50/70 text-center text-lg sm:text-xl font-bold tracking-wider text-stone-900 outline-none transition-all focus:border-rose-700 focus:bg-white focus:ring-4 focus:ring-rose-100 shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full h-12 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Proceed'
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setOtp(''); setError(''); lastSubmittedOtpRef.current = '' }}
                    className="text-stone-500 hover:text-stone-900 font-semibold underline underline-offset-4"
                    disabled={isLoading}
                  >
                    ← Change Number
                  </button>
                  <button
                    type="button"
                    onClick={() => { setError(''); requestOtp() }}
                    className="text-rose-900 hover:text-rose-950 font-bold underline underline-offset-4"
                    disabled={isLoading}
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {step === 'choose' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 p-3 text-xs text-rose-900 flex items-center justify-between">
                  <span>Logged in as: <strong className="font-bold">+91 {phone}</strong></span>
                  <button
                    type="button"
                    onClick={() => { setStep('phone'); setError(''); setOtp(''); lastSubmittedOtpRef.current = '' }}
                    className="text-rose-700 underline hover:text-rose-900 font-bold"
                  >
                    Edit
                  </button>
                </div>
                <AccountTypeSelector
                  onSelect={handleChooseType}
                  isLoading={isLoading}
                />
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Trust & Security Strip */}
            <div className="mt-6 pt-5 border-t border-stone-100 text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-[11px] text-stone-400 font-medium">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  256-Bit Encrypted
                </span>
                <span>•</span>
                <span>Fast 1-Click Login</span>
              </div>
              <p className="text-[10px] text-stone-400">
                By continuing, you agree to our <Link href="/terms" className="text-stone-600 underline">Terms</Link> & <Link href="/privacy" className="text-stone-600 underline">Privacy Policy</Link>
              </p>
            </div>

          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          © {currentYear} NS Collection. All rights reserved.
        </p>

      </div>
    </div>
  )
}
