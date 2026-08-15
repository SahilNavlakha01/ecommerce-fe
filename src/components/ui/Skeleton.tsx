import { cn } from "../../utils/cn"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-none sm:rounded-xl shadow-none sm:shadow-sm overflow-hidden border-0 sm:border border-gray-100 h-full flex flex-col">
      <div className="relative overflow-hidden">
        <div className="w-full bg-gray-200 relative overflow-hidden aspect-square animate-pulse"></div>
      </div>
      <div className="p-2 sm:p-3 flex-grow flex flex-col">
        <div className="flex items-center mb-1">
          <Skeleton className="h-3 w-8 mr-1" />
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-2.5 h-2.5 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-3 w-8 ml-1" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mb-2" />
        <div className="mb-2">
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  )
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Product Detail Skeleton
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16">
        {/* Product Images Skeleton */}
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-32 mb-3" />
            <div className="flex items-center gap-4 mb-3">
              <div className="flex space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-5 h-5 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>

          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex gap-6">
          <div className="w-32 h-32 rounded-xl bg-gray-200 animate-pulse flex-shrink-0"></div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-1 bg-gray-200 animate-pulse rounded"></div>
                <div>
                  <div className="h-3 w-16 mb-2 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-5 w-48 mb-2 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="w-5 h-5 bg-gray-200 animate-pulse rounded"></div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-20 bg-gray-200 animate-pulse rounded-full"></div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                <div className="w-8 h-6 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-10 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order Item Skeleton
export function OrderItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Account Stats Skeleton
export function AccountStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="ml-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Profile Page Skeleton
export function ProfilePageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-6">
          <Skeleton className="h-8 w-48 bg-white/20" />
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <Skeleton className="h-6 w-32 mb-4" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Address Card Skeleton
export function AddressCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  )
}

// Filter Skeleton
export function FilterSkeleton() {
  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="mb-6">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center">
                  <Skeleton className="w-4 h-4 mr-2" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hero Section Skeleton
export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900"></div>
      <div className="relative px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto mb-6 bg-white/20" />
            <div className="space-y-4 mb-8">
              <Skeleton className="h-12 w-64 mx-auto bg-white/20" />
              <Skeleton className="h-12 w-48 mx-auto bg-white/20" />
              <Skeleton className="h-12 w-56 mx-auto bg-white/20" />
            </div>
            <Skeleton className="h-6 w-96 mx-auto mb-12 bg-white/20" />
            <Skeleton className="h-12 w-48 mx-auto rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Review Skeleton
export function ReviewSkeleton() {
  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <div className="flex items-start space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-4 h-4 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  )
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50/50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <Skeleton className="h-4 w-16" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
