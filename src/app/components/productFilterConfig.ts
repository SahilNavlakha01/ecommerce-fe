export const PRICE_MIN = 50
export const PRICE_MAX = 2000

export const filterConfigs: Record<string, string> = {
  'Metal Type': 'metalType',
  'Gender': 'gender',
  'Occasion': 'occasion',
  // 'Gemstone': 'gemstoneType',
  // 'Collection': 'collectionName',
}

export const configNameMapping: Record<string, string> = {
  'Metal Type': 'Metal Type',
  'Gender': 'Gender',
  'Occasion': 'Occasion',
  // 'Gemstone': 'Gemstone Type',
  // 'Collection': 'Collection',
}

export const isPriceFilterActive = (priceRange: [number, number]) =>
  priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX

export const resetPriceRange = (): [number, number] => [PRICE_MIN, PRICE_MAX]
