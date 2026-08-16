import type { Metadata } from 'next'
import PolicyLayout from '../components/PolicyLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy | NS Collection',
  description: 'Privacy Policy for NS Collection — how we collect, use, and safeguard your data.',
}

export default function PrivacyPolicy() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      effectiveDate="20/04/2026"
      intro="At NS Collection, we value your trust and are committed to protecting your personal information."
      sections={[
        {
          title: 'Information We Collect',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Personal:</strong> Name, phone, email, shipping/billing address</li>
              <li><strong>Payment:</strong> Processed securely via third-party gateways — we do not store card details</li>
              <li><strong>Technical:</strong> IP address, browser type, device info, browsing behavior</li>
              <li><strong>Communication:</strong> Messages, feedback, or inquiries you send us</li>
            </ul>
          ),
        },
        {
          title: 'How We Use Your Information',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Process and deliver your orders</li>
              <li>Communicate order updates and respond to inquiries</li>
              <li>Improve our products, services, and website</li>
              <li>Send promotional offers (only if you opt-in)</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          ),
        },
        {
          title: 'Sharing of Information',
          content: (
            <>
              <p>We do not sell or rent your personal information. We may share data only with:</p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Trusted service providers (payment gateways, delivery partners, IT support)</li>
                <li>Legal authorities, if required by law</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Data Security',
          content: (
            <p>We implement appropriate technical and organizational measures to protect your data. However, no online platform is completely secure — we encourage users to take necessary precautions.</p>
          ),
        },
        {
          title: 'Cookies & Tracking',
          content: (
            <>
              <p>Our website may use cookies to enhance experience, analyze traffic, and remember preferences. You can disable cookies through your browser settings.</p>
            </>
          ),
        },
        {
          title: 'Your Rights',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Request details about how your data is used</li>
            </ul>
          ),
        },
        {
          title: 'Third-Party Links',
          content: (
            <p>Our website may contain links to third-party sites. We are not responsible for their privacy practices.</p>
          ),
        },
        {
          title: 'Changes to This Policy',
          content: (
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated effective date.</p>
          ),
        },
      ]}
    />
  )
}
