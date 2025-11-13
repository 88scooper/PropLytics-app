"use client";

export default function MetricCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-3 w-48 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

