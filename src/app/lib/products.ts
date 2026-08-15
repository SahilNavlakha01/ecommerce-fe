export type Product = {
  id: string
  name: string
  price: number
  oldPrice?: number
  image: string
  description?: string
  category?: string
}

export function findProductById(id: string) {
  return undefined
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)
}
