"use client";

import { Check, TrendingUp, Home } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import PropertyCardSkeleton from './PropertyCardSkeleton';

export default function PropertySelector({ properties = [], selectedPropertyId, onSelect, isLoading = false }) {

  // Get property image or generate gradient placeholder
  const getPropertyImage = (property, index) => {
    if (property.imageUrl) {
      return property.imageUrl;
    }
    // Generate consistent gradient based on property index
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-emerald-400 to-emerald-600',
      'from-purple-400 to-purple-600',
      'from-orange-400 to-orange-600',
      'from-pink-400 to-pink-600',
      'from-teal-400 to-teal-600',
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Choose a property to analyse
        </h2>
        <PropertyCardSkeleton count={3} />
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Choose a property to analyse
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We'll use this property's rent, expenses, and mortgage to build your forecast.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No properties yet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Add a property first so we can run the numbers. Head to the <strong>Data</strong> tab to import details.
          </p>
          <a
            href="/data"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white dark:bg-white dark:text-gray-900 rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
          >
            Go to Data Page
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Choose a property to analyse
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We'll use this property's rent, expenses, and mortgage to build your forecast.
        </p>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {properties.map((property, index) => {
            const isSelected = selectedPropertyId === property.id;
            const imageGradient = getPropertyImage(property, index);
            const monthlyCashFlow = property.monthlyCashFlow || 0;
            const capRate = property.capRate || 0;

            return (
              <button
                key={property.id}
                onClick={() => onSelect(property.id)}
                className={`group relative rounded border overflow-hidden bg-white dark:bg-gray-800 transition-all hover:shadow-md hover:scale-[1.05] ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 ring-1 ring-blue-500/20 dark:ring-blue-400/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Thumbnail */}
                {property.imageUrl ? (
                  <div className="h-10 bg-cover bg-center" style={{ backgroundImage: `url(${property.imageUrl}?v=3)` }} />
                ) : (
                  <div className={`h-10 bg-gradient-to-br ${imageGradient} dark:opacity-80`} />
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}

                {/* Content */}
                <div className="p-1 text-left">
                  <h3 className="font-medium text-[10px] text-gray-900 dark:text-white mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {property.nickname || property.name || 'Unnamed'}
                  </h3>
                  <p className="text-[8px] text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                    {property.address || 'No address'}
                  </p>

                  {/* Key Metrics Badge */}
                  <div className="flex items-center gap-0.5 flex-wrap">
                    {monthlyCashFlow !== 0 && (
                      <span
                        className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-medium ${
                          monthlyCashFlow >= 0
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        <TrendingUp className="w-2 h-2" />
                        {formatCurrency(monthlyCashFlow)}/mo
                      </span>
                    )}
                    {capRate > 0 && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {formatPercentage(capRate)} cap
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
    </section>
  );
}

