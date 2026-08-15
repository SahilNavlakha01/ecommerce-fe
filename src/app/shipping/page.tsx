import type { Metadata } from 'next'
import PolicyLayout from '../components/PolicyLayout'

export const metadata: Metadata = {
  title: 'Shipping Policy | Ethnic Sparkle',
  description: 'Shipping Policy for Ethnic Sparkle — order processing, delivery timelines, and tracking.',
}

export default function ShippingPolicy() {
  return (
    <PolicyLayout
      title="Shipping Policy"
      effectiveDate="20/04/2026"
      intro="We strive to deliver your orders safely and on time. Please read our shipping policy for details on processing, delivery, and tracking."
      sections={[
        {
          title: 'Order Processing',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Orders are processed within <strong>1–3 business days</strong> after payment confirmation</li>
              <li>Orders placed on weekends or holidays will be processed on the next working day</li>
            </ul>
          ),
        },
        {
          title: 'Shipping Timeline',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Standard delivery: <strong>3–7 business days</strong> across India</li>
              <li>Timelines may vary depending on location and courier services</li>
            </ul>
          ),
        },
        {
          title: 'Shipping Charges',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Shipping charges (if applicable) will be displayed at checkout</li>
              <li>Free shipping may be offered on select orders or promotions</li>
            </ul>
          ),
        },
        {
          title: 'Order Tracking',
          content: (
            <p>Once shipped, you will receive tracking details via email, SMS, or WhatsApp.</p>
          ),
        },
        {
          title: 'Delivery Issues',
          content: (
            <p>If your order is delayed, lost, or damaged in transit, please contact us within <strong>48 hours</strong> of the expected delivery date.</p>
          ),
        },
        {
          title: 'Incorrect Address',
          content: (
            <ul className="list-disc pl-4 space-y-1">
              <li>Customers are responsible for providing accurate shipping details</li>
              <li>We are not liable for delays or losses due to incorrect addresses</li>
            </ul>
          ),
        },
      ]}
    />
  )
}
