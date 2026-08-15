import type { Metadata } from 'next'
import PolicyLayout from '../components/PolicyLayout'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Ethnic Sparkle',
  description: 'Terms & Conditions for Ethnic Sparkle — guidelines for using our website and services.',
}

export default function TermsAndConditions() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      effectiveDate="20/04/2026"
      intro="By accessing or using our website, you agree to comply with and be bound by the following Terms & Conditions."
      sections={[
        {
          title: 'General',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>The content on this website is for general information and shopping purposes only.</li>
              <li>We reserve the right to update or modify these terms at any time without prior notice.</li>
            </ul>
          ),
        },
        {
          title: 'Products & Pricing',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>All products are subject to availability.</li>
              <li>We strive for accurate descriptions and pricing; however, errors may occur.</li>
              <li>Prices are subject to change without prior notice.</li>
            </ul>
          ),
        },
        {
          title: 'Orders & Payments',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Orders are confirmed only after successful payment.</li>
              <li>We reserve the right to cancel orders due to stock issues, pricing errors, or suspicious activity.</li>
              <li>Refunds (if applicable) are processed as per our Refund Policy.</li>
            </ul>
          ),
        },
        {
          title: 'Intellectual Property',
          content: (
            <p>All content on this website (images, logos, text, designs) is the property of Ethnic Sparkle / EEAS Lifestyle. Unauthorized use or reproduction is strictly prohibited.</p>
          ),
        },
        {
          title: 'User Responsibilities',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>You agree not to misuse the website for fraudulent or unlawful purposes.</li>
              <li>You are responsible for maintaining the confidentiality of your account details.</li>
            </ul>
          ),
        },
        {
          title: 'Limitation of Liability',
          content: (
            <p>We are not liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</p>
          ),
        },
        {
          title: 'Governing Law',
          content: (
            <>
              <p>These Terms are governed by the laws of India.</p>
              <p className="mt-1 font-medium text-gray-700">Jurisdiction: Ahmedabad, Gujarat</p>
            </>
          ),
        },
      ]}
    />
  )
}
