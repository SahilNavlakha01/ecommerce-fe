'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react'
import { SendOtp, VerifyOtp } from '@/Services/PostService'
import Portal from '@/components/ui/Portal'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
  type: 'mobile' | 'email'
  contactValue: string
  title?: string
}

export default function VerificationModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  type,
  contactValue,
  title
}: VerificationModalProps) {
  const [step, setStep] = useState<'send' | 'verify'>('send')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(0)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const startTimer = () => {
    setTimer(30)
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await SendOtp({
        contactType: type,
        contactValue: contactValue,
        userId: userId,
        isLoginAuth: false
      })

      if (response.data?.status === 200) {
        setStep('verify')
        startTimer()
      } else {
        setError(response.data?.statusMessage || 'Failed to send OTP')
      }
    } catch (err: any) {
      setError(err.response?.data?.statusMessage || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await VerifyOtp({
        contactType: type,
        contactValue: contactValue,
        otpCode: otp,
        isLoginAuth: false
      })

      if (response.data?.status === 200) {
        onSuccess()
        handleClose()
      } else {
        setError(response.data?.statusMessage || 'Invalid OTP')
      }
    } catch (err: any) {
      setError(err.response?.data?.statusMessage || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('send')
    setOtp('')
    setError('')
    setTimer(0)
    onClose()
  }

  const otpDigits = otp.padEnd(6, ' ').split('').slice(0, 6)

  const updateOtp = (nextValue: string) => {
    setOtp(nextValue.replace(/\D/g, '').slice(0, 6))
  }

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const chars = otp.padEnd(6, ' ').split('').slice(0, 6)
    chars[index] = digit || ''
    const nextOtp = chars.join('').replace(/\s/g, '')
    setOtp(nextOtp)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    updateOtp(pasted)
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()
  }

  useEffect(() => {
    if (isOpen && step === 'verify') {
      window.setTimeout(() => inputRefs.current[0]?.focus(), 0)
    }
  }, [isOpen, step])

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
        <div className="px-5 sm:px-6 py-5 sm:py-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">Secure verification</p>
              <h3 className="mt-1 text-xl font-bold text-gray-900">
                {title || `Verify ${type === 'mobile' ? 'Mobile Number' : 'Email Address'}`}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter the 6-digit code to continue checkout.
              </p>
            </div>
            <button onClick={handleClose} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>

        {step === 'send' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Destination</p>
              <p className="mt-1 break-all text-sm font-semibold text-gray-900">{contactValue}</p>
              <p className="mt-2 text-sm text-gray-600">
                We&apos;ll send a one-time code to verify your {type === 'mobile' ? 'mobile number' : 'email address'}.
                {type === 'email' && ' This is required only when an email was added.'}
              </p>
            </div>
            
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Sending code...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
              <p className="text-sm font-semibold text-teal-900">Code sent successfully</p>
              <p className="mt-1 text-sm text-teal-700">We sent a 6-digit code to {contactValue}.</p>
            </div>

            <div onPaste={handlePaste}>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-800">Enter verification code</label>
                <span className="text-xs font-medium text-gray-500">6 digits</span>
              </div>
              <div className="grid grid-cols-6 gap-2 sm:gap-3">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit === ' ' ? '' : digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="h-12 rounded-2xl border border-gray-200 bg-white text-center text-lg font-bold text-gray-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 sm:h-14"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button
                onClick={() => setStep('send')}
                className="font-semibold text-gray-600 transition hover:text-gray-900"
              >
                Change contact
              </button>
              <button
                onClick={handleSendOtp}
                disabled={timer > 0 || isLoading}
                className="font-semibold text-teal-600 transition hover:text-teal-700 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend code'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Verifying...' : 'Verify code'}
            </button>
          </div>
        )}
        </div>
      </div>
      </div>
    </Portal>
  )
}
