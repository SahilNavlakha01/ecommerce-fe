import { BASE_URL } from '../Constant/Api'

/**
 * Constructs proper image URL from various image path formats
 * @param imagePath - The image path from API response
 * @returns Properly formatted image URL
 */
export const getImageUrl = (imagePath: any): string => {
  if (!imagePath) return ''

  // If imagePath is an object (common in some API responses)
  const path = typeof imagePath === 'object' ? imagePath.imageUrl : imagePath

  if (!path || typeof path !== 'string') return ''

  // If already a complete URL (Cloudinary or otherwise), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Get base URL without /api/ suffix
  const baseUrl = BASE_URL.replace('/api/', '/')

  // Construct full URL
  return `${baseUrl}${cleanPath}`
}

/**
 * Gets the first available image from various image field formats
 * @param item - Product or item object with potential image fields
 * @returns First available image URL or empty string
 */
export const getFirstImageUrl = (item: any): string => {
  if (!item) return ''

  // Try different image field names in order of preference
  const imageFields = [
    'images',
    'imageUrls',
    'imageUrl',
    'image',
    'productImage'
  ]

  for (const field of imageFields) {
    const value = item[field]

    if (Array.isArray(value) && value.length > 0) {
      // Handle array of strings or array of objects
      return getImageUrl(value[0])
    }

    if (value) {
      return getImageUrl(value)
    }
  }

  return ''
}

/**
 * Placeholder SVG for when images fail to load
 */
export const getPlaceholderImage = (): string => {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Cpath d='M90 105h120v90H90z' fill='%23d1d5db'/%3E%3Ccircle cx='120' cy='135' r='9' fill='%23f3f4f6'/%3E%3Cpath d='M96 165l24-24 12 12 24-24 48 48v12H96z' fill='%23f3f4f6'/%3E%3C/svg%3E"
}