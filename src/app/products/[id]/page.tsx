import type { Metadata } from 'next'
import { GET_SINGLE_PRODUCT } from '../../../Constant/Api'
import { SITE_NAME, SITE_URL } from '../../../lib/seo.config'
import ProductDetailClient from './ProductDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const res = await fetch(`${GET_SINGLE_PRODUCT}${id}`, {
      next: { revalidate: 0 },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return { title: 'Product | NS Collection' }

    const json = await res.json()
    if (json?.status !== 200 || !json?.data) return { title: 'Product | NS Collection' }

    const product = json.data
    const name: string = product.name || 'Jewelry'
    const description: string = (
      product.description ||
      `Buy ${name} at NS Collection. Premium quality jewelry with BIS hallmark.`
    ).slice(0, 160)

    const firstImage: string =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]?.imageUrl || `${SITE_URL}/images/og-default.jpg`
        : `${SITE_URL}/images/og-default.jpg`

    const canonicalUrl = `${SITE_URL}/products/${id}`

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image: firstImage,
      sku: product.skuCode,
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'INR',
        price: product.basePrice || '0',
        availability:
          (product.stockQuantity || 0) > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: SITE_NAME },
      },
      ...(product.avgRating && product.reviewCount
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: product.avgRating,
              reviewCount: product.reviewCount,
            },
          }
        : {}),
    }

    return {
      title: name,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: `${name} | ${SITE_NAME}`,
        description,
        url: canonicalUrl,
        type: 'website',
        images: [{ url: firstImage, alt: name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | ${SITE_NAME}`,
        description,
        images: [firstImage],
      },
      other: {
        'script:ld+json': JSON.stringify(productSchema),
      },
    }
  } catch (err: any) {
    return { title: 'Product | NS Collection' }
  }
}

export default function ProductPage() {
  return <ProductDetailClient />
}
