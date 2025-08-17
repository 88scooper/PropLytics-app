"use client";

import Link from "next/link";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { getAllProperties } from "@/lib/propertyData";

export default function MyPropertiesPage() {
  const properties = getAllProperties();
  
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

  return (
    <Link 
      href={`/my-properties/${property.id}`}
      className="group block rounded-lg border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-black/20 dark:hover:border-white/20"
    >
      <div className="aspect-square relative overflow-hidden">
        {property.imageUrl ? (
          <img 
            src={property.imageUrl} 
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-base sm:text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {property.name}
          </h3>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
          {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Type</div>
            <div className="font-medium">{property.type}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Units</div>
            <div className="font-medium">{property.units}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
            <div className="font-medium">${property.purchasePrice.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Monthly Rent</div>
            <div className="font-medium text-emerald-600 dark:text-emerald-400">
              ${property.monthlyRent.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Cash Flow</div>
            <div className={`font-medium ${monthlyCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              ${monthlyCashFlow.toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-500 dark:text-gray-400">Cap Rate</span>
            <span className="font-medium">{capRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </Link>
  );
}


