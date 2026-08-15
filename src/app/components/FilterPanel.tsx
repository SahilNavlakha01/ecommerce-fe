"use client"

import { useState } from 'react'
import PriceRangeControl from './PriceRangeControl'

export default function FilterPanel() {
  const PRICE_MIN = 50
  const PRICE_MAX = 2000
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [PRICE_MIN, PRICE_MAX],
    metal: '',
    stone: '',
    occasion: '',
    gender: ''
  })
  const [draftPriceRange, setDraftPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX])

  const categories = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Bangles']
  const metals = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']
  const stones = ['Diamond', 'Ruby', 'Emerald', 'Sapphire', 'Pearl']
  const occasions = ['Wedding', 'Engagement', 'Festival', 'Party', 'Daily Wear', 'Office']
  const genders = ['Men', 'Women', 'Unisex', 'Kids']

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => {
            setFilters({
              category: '',
              priceRange: [PRICE_MIN, PRICE_MAX],
              metal: '',
              stone: '',
              occasion: '',
              gender: ''
            })
            setDraftPriceRange([PRICE_MIN, PRICE_MAX])
          }}
          className="text-sm text-[#026670] hover:text-[#026670]/80"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange('category', category === filters.category ? '' : category)}
                className={`p-2 rounded text-sm font-medium transition-colors text-left ${
                  filters.category === category
                    ? 'bg-[#026670] text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <PriceRangeControl
          value={draftPriceRange}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={10}
          onChange={setDraftPriceRange}
          onApply={(range) => {
            setDraftPriceRange(range)
            handleFilterChange('priceRange', range)
          }}
          onReset={() => setDraftPriceRange([PRICE_MIN, PRICE_MAX])}
          applyLabel="Apply Price"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Metal</label>
          <div className="space-y-2">
            {metals.map((metal) => (
              <label key={metal} className="flex items-center">
                <input
                  type="radio"
                  name="metal"
                  value={metal}
                  checked={filters.metal === metal}
                  onChange={(e) => handleFilterChange('metal', e.target.value)}
                  className="w-4 h-4 text-[#026670] border-gray-300 focus:ring-[#026670]"
                />
                <span className="ml-2 text-sm text-gray-700">{metal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Stone</label>
          <div className="space-y-2">
            {stones.map((stone) => (
              <label key={stone} className="flex items-center">
                <input
                  type="radio"
                  name="stone"
                  value={stone}
                  checked={filters.stone === stone}
                  onChange={(e) => handleFilterChange('stone', e.target.value)}
                  className="w-4 h-4 text-[#026670] border-gray-300 focus:ring-[#026670]"
                />
                <span className="ml-2 text-sm text-gray-700">{stone}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Occasion</label>
          <select
            value={filters.occasion}
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#026670] focus:border-[#026670]"
          >
            <option value="">All Occasions</option>
            {occasions.map((occasion) => (
              <option key={occasion} value={occasion}>{occasion}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
          <div className="grid grid-cols-2 gap-2">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => handleFilterChange('gender', gender === filters.gender ? '' : gender)}
                className={`p-2 rounded text-sm font-medium transition-colors ${
                  filters.gender === gender
                    ? 'bg-[#026670] text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-[#026670] text-white py-2 rounded-lg hover:bg-[#026670]/90 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  )
}
