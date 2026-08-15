export const getProductStockQuantity = (product: any): number => {
  const stock = product?.stockQuantity ?? product?.stock_quantity ?? 0
  const parsed = typeof stock === 'string' ? Number(stock) : stock
  return Number.isFinite(parsed) ? Number(parsed) : 0
}

export const isProductInStock = (product: any): boolean => getProductStockQuantity(product) > 0

export const filterInStockProducts = <T extends Record<string, any>>(products: T[] = []): T[] => products
