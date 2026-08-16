export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nscollection.com'
export const SITE_NAME = 'NS Collection'
export const SITE_DESCRIPTION =
  'Discover exquisite handcrafted jewelry at NS Collection. Premium quality rings, necklaces, earrings with BIS hallmark and lifetime warranty.'

export const defaultMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Premium Jewelry Collection`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'jewelry', 'rings', 'necklaces', 'earrings', 'gold jewelry',
    'diamond jewelry', 'fashion jewelry', 'handcrafted jewelry',
    'BIS hallmark', 'premium jewelry India',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website' as const,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Premium Jewelry Collection`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: `${SITE_NAME} - Premium Jewelry Collection`,
    description: SITE_DESCRIPTION,
    images: ['/images/og-default.jpg'],
  },
  icons: { icon: '/images/LogoNew.png' },
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/LogoNew.png`,
  description: SITE_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
}
