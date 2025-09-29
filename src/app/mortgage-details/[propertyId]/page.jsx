"use client";

import { useState, use } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useProperty } from "@/context/PropertyContext";
import MortgageSummaryBanner from "@/components/mortgages/MortgageSummaryBanner";
import MortgageDetailsPanel from "@/components/mortgages/MortgageDetailsPanel";
import PaymentBreakdown from "@/components/mortgages/PaymentBreakdown";

export default function MortgageDetailsPage({ params }) {
  const { propertyId } = use(params) || {};
  
  // Get property data using propertyId from PropertyContext
  const property = useProperty(propertyId);

  if (!property) {
    return (
      <RequireAuth>
        <Layout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Property Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              The property you're looking for doesn't exist.
            </p>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  // Prepare mortgage data for the components
  const mortgageData = {
    propertyId: propertyId,
    property: property,
    mortgage: property.mortgage
  };

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={() => window.history.back()}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold">Mortgage Details</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{property.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
            </div>
          </div>

          {/* Top Summary Banner */}
          <MortgageSummaryBanner mortgageData={mortgageData} />

          {/* Two-Column Layout: Details Panel and Payment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left-Side Details Panel */}
            <MortgageDetailsPanel mortgageData={mortgageData} />
            
            {/* Right-Side Payment Breakdown */}
            <PaymentBreakdown mortgageData={mortgageData} />
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}
