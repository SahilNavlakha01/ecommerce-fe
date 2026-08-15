"use client"

import { useState } from 'react'

export default function FAQ() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqs = [
    {
      question: "What is the purity of gold jewelry?",
      answer: "We offer gold jewelry in 22K (91.6% pure), 18K (75% pure), and 14K (58.3% pure) gold. All our gold jewelry comes with BIS hallmark certification ensuring guaranteed purity."
    },
    {
      question: "Do you provide certificates for diamond jewelry?",
      answer: "Yes, all our diamond jewelry above 0.30 carats comes with internationally recognized certificates from GIA, IGI, or SGL. These certificates guarantee the authenticity and quality of diamonds."
    },
    {
      question: "What is your return and exchange policy?",
      answer: "We offer a 30-day return policy for unused jewelry in original condition. Exchange is available within 7 days of purchase. Custom-made jewelry and engraved items are not eligible for return."
    },
    {
      question: "Is EMI available for jewelry purchases?",
      answer: "Yes, we offer EMI options starting from 3 months up to 24 months on purchases above ₹10,000. We partner with major banks and financial institutions for easy EMI processing."
    },
    {
      question: "How do you ensure secure packaging and delivery?",
      answer: "All jewelry is packaged in tamper-proof boxes with GPS tracking. We use insured courier services and require signature confirmation. High-value items are delivered through specialized jewelry logistics partners."
    },
    {
      question: "Do you offer customization services?",
      answer: "Yes, we provide custom jewelry design services. Our expert craftsmen can create personalized pieces based on your requirements. Custom orders typically take 15-21 working days."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, UPI, net banking, digital wallets, and cash on delivery (for orders below ₹50,000). We also offer bank transfer options for bulk orders."
    },
    {
      question: "Is there a warranty on jewelry?",
      answer: "Yes, we provide a 1-year warranty on manufacturing defects for gold and silver jewelry. Diamond jewelry comes with a lifetime warranty on the setting. Warranty covers free cleaning and minor repairs."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white font-sans">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-mint-400 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our jewelry, policies, and services
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4 font-heading">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center transition-transform duration-300 ${
                    openFAQ === index ? 'rotate-180' : ''
                  }`}>
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-teal-50 to-mint-50 rounded-3xl p-8 border border-teal-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-heading">Still have questions?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our customer support team is here to help you with any queries about our jewelry and services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Live Chat
              </button>
              <button className="btn btn-secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Support
              </button>
              <button className="btn btn-secondary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: '🔒', title: 'Secure Payment', desc: 'SSL Encrypted' },
            { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹25,000' },
            { icon: '↩️', title: '30-Day Returns', desc: 'Hassle-free returns' },
            { icon: '🏆', title: 'Certified Quality', desc: 'BIS & IGI certified' }
          ].map((item, index) => (
            <div key={index} className="text-center animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-semibold text-gray-900 mb-1 font-heading">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}