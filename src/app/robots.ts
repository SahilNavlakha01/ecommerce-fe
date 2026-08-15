import { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/seo.config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/account/', '/checkout/', '/cart/', '/auth/', '/b2b-registration/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
