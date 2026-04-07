function Shimmer({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function PulseCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shimmer className="w-2.5 h-2.5 rounded-full" />
        <Shimmer className="h-4 w-24" />
      </div>
      <Shimmer className="h-3 w-32" />
      <Shimmer className="h-1.5 w-full rounded-full" />
      <div className="flex justify-between">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-3 w-16" />
      </div>
    </div>
  );
}

export function PulseStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
          <Shimmer className="h-3 w-20" />
          <Shimmer className="h-7 w-16" />
          <Shimmer className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PulseChartSkeleton({ height = "h-48" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-4`}>
      <Shimmer className="h-4 w-36 mb-4" />
      <Shimmer className={`w-full ${height}`} />
    </div>
  );
}
