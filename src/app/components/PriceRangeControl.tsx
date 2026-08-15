"use client"

type PriceRange = [number, number]

type PriceRangeControlProps = {
  value: PriceRange
  min?: number
  max?: number
  step?: number
  title?: string
  description?: string
  className?: string
  onChange: (range: PriceRange) => void
  onApply: (range: PriceRange) => void
  onReset?: () => void
  applyLabel?: string
  resetLabel?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export default function PriceRangeControl({
  value,
  min = 50,
  max = 2000,
  step = 10,
  title = 'Select Price Range',
  description = 'Choose the maximum price, then tap Apply to filter products.',
  className = '',
  onChange,
  onApply,
  onReset,
  applyLabel = 'Apply',
  resetLabel = 'Reset',
}: PriceRangeControlProps) {
  const safeMin = Math.min(min, max)
  const safeMax = Math.max(min, max)

  const normalizedMax = clamp(value[1], safeMin, safeMax)
  const currentMin = safeMin
  const currentMax = Math.max(currentMin, normalizedMax)

  const rangeSpan = Math.max(1, safeMax - safeMin)
  const fillPercent = ((currentMax - safeMin) / rangeSpan) * 100

  const updateRange = (nextMax: number) => {
    const boundedMax = clamp(nextMax, safeMin, safeMax)
    onChange([safeMin, Math.max(safeMin, boundedMax)])
  }

  const displayValue = (amount: number) => amount.toLocaleString('en-IN')

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm">
        <div className="mb-4 rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
          Up to ₹{displayValue(currentMax)}
        </div>

        <div className="relative h-10">
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-200" />
          <div
            className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
            style={{ left: '0%', width: `${fillPercent}%` }}
          />

          <input
            type="range"
            min={safeMin}
            max={safeMax}
            step={step}
            value={currentMax}
            onChange={(e) => updateRange(Number(e.target.value))}
            className="price-range-input absolute inset-0 z-20 w-full bg-transparent"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onReset?.()}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            {resetLabel}
          </button>
          <button
            type="button"
            onClick={() => onApply([currentMin, currentMax])}
            className="flex-[1.2] rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
