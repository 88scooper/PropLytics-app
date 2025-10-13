"use client";

import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useProperties, usePropertyContext } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

// Historical data map for YoY calculations
const historicalDataMap = {
  'richmond-st-e-403': [
    { year: '2023', income: 40200, expenses: 23493.77 },
    { year: '2024', income: 41323.03, expenses: 17399.9 },
    { year: '2025', income: 41400, expenses: 17400 }
  ],
  'tretti-way-317': [
    { year: '2024', income: 36000, expenses: 2567.21 },
    { year: '2025', income: 36000, expenses: 2537.5 }
  ],
  'wilson-ave-415': [
    { year: '2025', income: 28800, expenses: 10237.2 }
  ]
};

// Calculate YoY change percentage
function calculateYoYChange(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return null;
  return ((currentValue - previousValue) / previousValue) * 100;
}

export default function MyPropertiesPage() {
  const { calculationsComplete } = usePropertyContext();
  const properties = useProperties();
  
  // Show loading state until calculations are complete to prevent undefined values
  if (!calculationsComplete) {
    return (
      <RequireAuth>
        <Layout>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Investment Properties</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage and view details for all your properties.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E]"></div>
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading property data...</span>
            </div>
          </div>
        </Layout>
      </RequireAuth>
    );
  }
  
  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Investment Properties</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage and view details for all your properties.
              </p>
            </div>
            <Button onClick={() => console.log("Add new property")}>
              Add New Property
            </Button>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No properties yet. Add your first investment property to get started.
              </div>
              <Button onClick={() => console.log("Add first property")}>
                Add Your First Property
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}

function PropertyCard({ property }) {
  const monthlyCashFlow = property.monthlyCashFlow;
  const capRate = property.capRate;
  const squareFeet = property.size || property.squareFootage || 0;
  const rentPerSqFt = squareFeet > 0 ? property.rent.monthlyRent / squareFeet : 0;
  
  // Calculate YoY changes
  const historicalData = historicalDataMap[property.id] || [];
  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();
  
  const currentYearData = historicalData.find(d => d.year === currentYear);
  const lastYearData = historicalData.find(d => d.year === lastYear);
  
  const yoyRevenueChange = currentYearData && lastYearData 
    ? calculateYoYChange(currentYearData.income, lastYearData.income) 
    : null;
  
  const yoyExpenseChange = currentYearData && lastYearData 
    ? calculateYoYChange(currentYearData.expenses, lastYearData.expenses) 
    : null;

  return (
    <Link 
      href={`/my-properties/${property.id}`}
      className="group block rounded-lg border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-black/20 dark:hover:border-white/20"
    >
      <div className="aspect-square relative overflow-hidden">
        {property.imageUrl ? (
          <Image 
            src={property.imageUrl} 
            alt={property.nickname || property.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-base sm:text-lg group-hover:text-[#205A3E] dark:group-hover:text-[#4ade80] transition-colors">
            {property.nickname || property.name}
          </h3>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
          {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Type</div>
            <div className="font-medium">{property.propertyType || property.type}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Units</div>
            <div className="font-medium">{property.units || 1}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
            <div className="font-medium">{formatCurrency(property.purchasePrice)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Monthly Rent</div>
            <div className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(property.rent.monthlyRent)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Cash Flow</div>
            <div className={`font-medium ${monthlyCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(monthlyCashFlow)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Rent/Sq Ft</div>
            <div className="font-medium">
              {formatCurrency(rentPerSqFt)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">YoY Revenue</div>
            <div className={`font-medium ${
              yoyRevenueChange === null 
                ? 'text-gray-400' 
                : yoyRevenueChange >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
            }`}>
              {yoyRevenueChange !== null ? `${yoyRevenueChange >= 0 ? '+' : ''}${yoyRevenueChange.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">YoY Expenses</div>
            <div className={`font-medium ${
              yoyExpenseChange === null 
                ? 'text-gray-400' 
                : yoyExpenseChange >= 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {yoyExpenseChange !== null ? `${yoyExpenseChange >= 0 ? '+' : ''}${yoyExpenseChange.toFixed(1)}%` : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400">Cap Rate</span>
            <span className="font-medium">{formatPercentage(capRate)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}


