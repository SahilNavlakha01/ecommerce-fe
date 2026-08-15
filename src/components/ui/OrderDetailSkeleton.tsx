export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 p-8">
          <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Tracking Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Items Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
