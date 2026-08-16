import type { Metadata } from 'next'
import EcommerceLayout from '../EcommerceLayout'
import Link from 'next/link'
import { Package, Receipt, BadgeCheck, Headphones, ArrowRight, Check, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'B2B Wholesale | NS Collection',
  description: 'Wholesale jewellery sourcing for retailers and businesses — exclusive pricing, GST invoicing, and dedicated support.',
  openGraph: { title: 'B2B Wholesale | NS Collection', url: '/b2b' },
}

const benefits = [
  { icon: Package, title: 'Trusted wholesale ecosystem', desc: 'A dependable wholesale flow built to support modern retail operations.' },
  { icon: Receipt, title: 'Premium trend-driven collections', desc: 'Curated jewellery designed to keep your assortment fresh and relevant.' },
  { icon: BadgeCheck, title: 'Scalable solutions', desc: 'Flexible support for businesses ready to grow faster and bigger.' },
  { icon: Headphones, title: 'Dedicated business support', desc: 'Responsive help from onboarding through every stage of scaling.' },
]

const tiers = [
  {
    name: 'Silver',
    minOrder: 'Annual Billing ₹50,000',
    discount: 'Anually 10 % Cash back',
    features: ['Standard Support'],
  },
  {
    name: 'Gold',
    minOrder: 'Annual Billing ₹1,50,000',
    discount: 'Anually 15% Cash Back',
    features: ['Priority Support'],
    popular: true,
  },
  {
    name: 'Platanium',
    minOrder: 'Annual Billing ₹2,00,000',
    discount: 'Anually 20% Cash back',
    features: ['Priority Support', 'Campaign Support'],
  },
]

const steps = [
  { step: '1', title: 'Register', desc: 'Create your business account.' },
  { step: '2', title: 'Browse Collection', desc: 'Explore our premium wholesale designs.' },
  { step: '3', title: 'Start Ordering', desc: 'Access wholesale pricing.' },
]

const highlights = [
  { icon: ShieldCheck, title: 'Trusted wholesale workflow' },
  { icon: Sparkles, title: 'Premium curated collection' },
  { icon: TrendingUp, title: 'Built to scale with your business' },
]

export default function B2BPage() {
  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-[#f8faf9] text-gray-900">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#026670]">
          <div className="absolute inset-0 opacity-15"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fce181 0%, transparent 40%), radial-gradient(circle at 80% 20%, #fce181 0%, transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }} />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-2xl">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#fce181]">
                  B2B Portal
                </span>
                <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Wholesale jewellery solutions crafted for the future of retail.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
                  Unlock exclusive tiered pricing, cashback rewards, and dedicated business support designed for retailers, designers, and corporate buyers who demand scale, style, and seamless growth.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/b2b-registration"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fce181] px-7 py-3.5 font-semibold text-[#026670] transition-colors duration-300 hover:bg-white"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
                  >
                    Contact Sales
                  </Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlights.map(({ icon: Icon, title }) => (
                    <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white/90 backdrop-blur-sm">
                      <Icon className="h-5 w-5 text-[#fce181]" />
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-[#fce181]/15 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/95 p-6 shadow-2xl">
                  <div className="rounded-[1.5rem] bg-gradient-to-br from-[#026670] to-[#014f56] p-6 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fce181]">B2B Benefits</p>
                    <h2 className="mt-3 text-2xl font-semibold">Professional wholesale access</h2>
                    <p className="mt-3 text-sm leading-7 text-white/75">
                      Everything your business needs in one streamlined onboarding flow.
                    </p>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {benefits.slice(0, 4).map(({ icon: Icon, title }) => (
                      <div key={title} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <Icon className="h-5 w-5 text-[#026670]" />
                        <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#026670]">Why Choose Us</span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">Built for Business</h2>
            <p className="mt-3 text-base leading-7 text-gray-600">
              Choose a wholesale partner built for trust, growth, and modern retail demand.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#026670]/20 hover:shadow-lg">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#026670]/10 transition-colors duration-300 group-hover:bg-[#026670]">
                  <Icon className="h-5 w-5 text-[#026670] transition-colors duration-300 group-hover:text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm leading-7 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="border-y border-gray-100 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#026670]">Pricing</span>
              <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">Business Tiers</h2>
              <p className="mt-3 text-base leading-7 text-gray-600">
                Choose the tier that fits your annual billing target and access the matching support level.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative overflow-hidden rounded-[2rem] border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${tier.popular ? 'border-[#026670] shadow-lg ring-1 ring-[#026670]/10' : 'border-gray-100'}`}
                >
                  {tier.popular && (
                    <div className="bg-[#026670] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#fce181]">
                      Most Popular
                    </div>
                  )}
                  <div className="p-7 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">{tier.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">Annual billing based access level</p>
                      </div>
                      <div className="rounded-full bg-[#026670]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#026670]">
                        Tier
                      </div>
                    </div>
                    <div className="mt-7 space-y-4">
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Billing</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{tier.minOrder}</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Cashback</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{tier.discount}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Included support</p>
                      <ul className="mt-3 space-y-3">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-center gap-3 text-sm font-medium text-gray-800">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#026670]/10">
                              <Check className="h-3.5 w-3.5 text-[#026670]" />
                            </span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href="/b2b-registration"
                      className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition-colors duration-300 ${tier.popular ? 'bg-[#026670] text-white hover:bg-[#01555c]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#026670]">Onboarding</span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm h-full">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#026670] text-lg font-semibold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm leading-7 text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#026670] py-16 text-white sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to get started?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/75">
              Join businesses across India who trust NS Collection for reliable wholesale jewellery sourcing.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/b2b-registration"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fce181] px-8 py-3.5 font-semibold text-[#026670] transition-colors duration-300 hover:bg-white"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-3.5 font-semibold text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>

      </div>
    </EcommerceLayout>
  )
}
