import type { Metadata } from 'next'
import PolicyLayout from '../components/PolicyLayout'

export const metadata: Metadata = {
  title: 'Refund & Return Policy | Ethnic Sparkle',
  description: 'Refund & Return Policy for Ethnic Sparkle — information on returns, exchanges, and store credit.',
}

export default function RefundPolicy() {
  return (
    <PolicyLayout
      title="Refund & Return Policy"
      effectiveDate="20/04/2026"
      intro="At Ethnic Sparkle, we aim to deliver quality products and a delightful experience. If you are not fully satisfied, please review our policy below."
      sections={[
        {
          title: 'Return Eligibility',
          content: (
            <>
              <p>Returns are accepted only if:</p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>The product is damaged, defective, or incorrect</li>
                <li>The return request is raised within <strong>3–5 days</strong> of delivery</li>
                <li>The item is unused, unworn, and in original packaging</li>
              </ul>
            </>
          ),
        },
        {
          title: 'Non-Returnable Items',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Earrings (for hygiene reasons)</li>
              <li>Customized or made-to-order products</li>
              <li>Items purchased during clearance or sale (unless damaged)</li>
            </ul>
          ),
        },
        {
          title: 'Return Process',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Email or WhatsApp us with your order details and product images</li>
              <li>Our team will review and approve the request</li>
              <li>Once approved, return instructions will be shared</li>
            </ul>
          ),
        },
        {
          title: 'Refund Policy (Store Credit Only)',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>No cash refunds</strong> will be provided under any circumstances</li>
              <li>Approved returns will be issued as a <strong>Credit Note / Store Credit</strong> only</li>
              <li>Credit notes can be used for future purchases on our website</li>
              <li>Issued within 5–7 business days after product inspection</li>
              <li><strong>Validity:</strong> 90 days from the date of issue</li>
              <li>Shipping charges are non-refundable</li>
            </ul>
          ),
        },
        {
          title: 'Exchange Policy',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Exchanges are subject to product availability</li>
              <li>If the requested product is unavailable, a credit note will be issued</li>
            </ul>
          ),
        },
      ]}
    />
  )
}
