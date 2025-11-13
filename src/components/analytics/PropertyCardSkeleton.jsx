"use client";

export default function PropertyCardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800"
        >
          {/* Thumbnail */}
          <div className="h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
          
          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

