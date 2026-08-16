"use client"
import EcommerceLayout from '../EcommerceLayout'
import { useState } from 'react'
import { Mail, MapPin, Clock, ChevronDown, Send, MessageCircle } from 'lucide-react'
import { SendContactEmail } from '@/Services/PostService'

const faqs = [
  {
    q: 'What materials are used in your jewelry?',
    a: 'Material is skin friendly and jewellery is made from Stainless steel or Brass in most cases. Stones are artificial.',
  },
  {
    q: 'Do you offer customization or made-to-order pieces?',
    a: 'Yes! We love creating custom pieces for weddings, events, and gifting. Share your vision with us via email or WhatsApp and we will try to reach out within 24 working hours.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 5–7 business days across India. Express delivery (2–3 days) is available at checkout. Free shipping on orders above ₹999.',
  },
  {
    q: 'How do I care for my jewelry?',
    a: 'Store in pouch away from moisture. Avoid contact with Perfume, water and chemicals. Wipe gently with soft dry cloth after use to maintain shine.',
  },
]

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const inputCls = (err?: string) =>
  `w-full px-4 py-3 rounded-xl border text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${err ? 'border-red-400' : 'border-gray-200'}`

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Message is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const res = await SendContactEmail(form)
      if (res.data?.status === 200) {
        setStatus('sent')
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('idle')
        alert(res.data?.statusMessage || 'Failed to send. Please try again.')
      }
    } catch (err: any) {
      setStatus('idle')
      alert(err.response?.data?.statusMessage || 'Failed to send. Please try again.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-white">

        {/* ── Hero ── */}
        <section className="bg-teal-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #fce181 0%, transparent 50%), radial-gradient(circle at 10% 80%, #fce181 0%, transparent 40%)' }} />
          <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-30 text-center">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-3">We'd love to hear from you</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Get in Touch</h1>
            <p className="text-teal-200 text-lg max-w-xl mx-auto">
              Questions about an order, a custom design, or just want to say hello? Our team is here for you.
            </p>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="max-w-5xl mx-auto px-6 py-14 md:py-18">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

            {/* ── Left: Form ── */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Send us a message</h2>
              <p className="text-gray-500 text-sm mb-7">Fill in the form and we'll get back to you within 24 hours.</p>

              {status === 'sent' && (
                <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3.5 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  Message sent! We'll get back to you within 24 hours.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" error={errors.name}>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Your name" className={inputCls(errors.name)} />
                  </Field>
                  <Field label="Email Address" error={errors.email}>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="you@example.com" className={inputCls(errors.email)} />
                  </Field>
                </div>

                <Field label="Subject (optional)">
                  <input name="subject" value={form.subject} onChange={handleChange}
                    placeholder="e.g. Custom bridal set inquiry" className={inputCls()} />
                </Field>

                <Field label="Message" error={errors.message}>
                  <textarea name="message" value={form.message} onChange={handleChange}
                    rows={5} placeholder="Tell us how we can help you..."
                    className={`${inputCls(errors.message)} resize-none`} />
                </Field>

                <button type="submit" disabled={status === 'sending'}
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm">
                  {status === 'sending'
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Sending...</>
                    : <><Send className="w-4 h-4" />Send Message</>
                  }
                </button>
              </form>
            </div>

            {/* ── Right: Info ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact info card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-5">
                <h3 className="font-bold text-gray-900 text-base">Contact Information</h3>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-medium text-gray-900">support@nscollection.com</p>
                    <p className="text-xs text-gray-400 mt-0.5">We reply within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">WhatsApp</p>
                    <p className="text-sm font-medium text-gray-900">+91 6356701295</p>
                    <p className="text-xs text-gray-400 mt-0.5">Response in 24 working hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-sm font-medium text-gray-900">Ahmedabad, Gujarat</p>
                    <p className="text-xs text-gray-400 mt-0.5">India — Shipping nationwide</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Business Hours</p>
                    <p className="text-sm font-medium text-gray-900">Mon – Sat, 10 AM – 7 PM</p>
                    <p className="text-xs text-gray-400 mt-0.5">IST · Closed on Sundays</p>
                  </div>
                </div>
              </div>

              {/* Quick note */}
              <div className="bg-teal-600 rounded-2xl p-6 text-white">
                <p className="font-bold text-base mb-1.5">Custom Orders Welcome</p>
                <p className="text-teal-100 text-sm leading-relaxed">
                  Planning a wedding or bulk gifting? We create bespoke jewelry sets tailored to your requirements.
                </p>
                <p className="text-teal-200 text-xs mt-3 font-medium">Response in 24 working hours</p>
              </div>

              {/* Social links */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Follow Us</p>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Instagram', href: 'https://www.instagram.com/nscollection', color: 'hover:bg-pink-500', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> },
                    { label: 'Facebook', href: 'https://facebook.com/nscollection', color: 'hover:bg-blue-600', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                    { label: 'YouTube', href: 'https://youtube.com/@nscollection', color: 'hover:bg-red-600', icon: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
                  ].map(({ label, href, color, icon }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                      className={`w-9 h-9 rounded-xl bg-gray-200 ${color} text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-t border-gray-100 bg-gray-50 py-14 md:py-18">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-600 mb-2">Quick Answers</p>
              <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors gap-4">
                    <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-teal-600 flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 pt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </EcommerceLayout>
  )
}
