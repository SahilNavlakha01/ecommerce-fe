import { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/seo.config'
import { GET_ALL_PRODUCTS, GET_ALL_CATEGORIES } from '../Constant/Api'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: SITE_URL,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${SITE_URL}/shop`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${SITE_URL}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${SITE_URL}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${SITE_URL}/b2b`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
]

async function fetchAllProducts(): Promise<any[]> {
  const pageSize = 500
  let page = 1
  let all: any[] = []

  while (true) {
    const res = await fetch(GET_ALL_PRODUCTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, limit: pageSize, isB2b: false }),
      next: { revalidate: 3600 },
    })
    if (!res.ok) break
    const json = await res.json()
    const products: any[] = json?.data?.products || []
    all = [...all, ...products]
    if (products.length < pageSize) break
    page++
  }

  return all
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [products, categoriesRes] = await Promise.all([
      fetchAllProducts(),
      fetch(GET_ALL_CATEGORIES, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null),
    ])

    // Product pages
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.id}`,
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Shop filtered by subcategory (indexable discovery pages)
    const subcategoryRoutes: MetadataRoute.Sitemap = []
    const categories: any[] = categoriesRes?.data?.data || []
    for (const cat of categories) {
      for (const sub of cat.subCategories || []) {
        subcategoryRoutes.push({
          url: `${SITE_URL}/shop?subcategoryId=${sub.id}&subcategoryName=${encodeURIComponent(sub.name)}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        })
      }
    }

    return [...staticRoutes, ...subcategoryRoutes, ...productRoutes]
  } catch {
    return staticRoutes
  }
}
