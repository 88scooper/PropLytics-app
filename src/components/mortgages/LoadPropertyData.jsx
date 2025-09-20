"use client";

import { useState } from "react";
import { useMortgages } from "@/hooks/useMortgages";
import { usePropertyData } from "@/context/PropertyDataContext";
import { useToast } from "@/context/ToastContext";
import { Download, Loader2, AlertCircle } from "lucide-react";

export default function LoadPropertyData({ onDataLoaded, className = "" }) {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const propertyData = usePropertyData();
  
  // Create a properties array from the single property data
  const properties = propertyData ? [{
    id: propertyData.id,
    address: propertyData.address,
    name: propertyData.address
  }] : [];
  
  const { data: mortgages, isLoading: mortgagesLoading } = useMortgages(selectedPropertyId);
  const { showToast } = useToast();

  const handleLoadData = async () => {
    if (!selectedPropertyId) {
      showToast("Please select a property first", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Find the selected property
      const selectedProperty = (properties || []).find(p => p.id === selectedPropertyId);
      
      if (!selectedProperty) {
        showToast("Property not found", "error");
        return;
      }

      // Get mortgages for this property
      const propertyMortgages = mortgages || [];
      
      if (propertyMortgages.length === 0) {
        showToast("No mortgage data found for this property", "warning");
        return;
      }

      // Use the first mortgage (most recent or primary)
      const mortgage = propertyMortgages[0];
      
      // Transform mortgage data for calculator
      const calculatorData = {
        originalAmount: mortgage.originalAmount,
        interestRate: mortgage.interestRate * 100, // Convert to percentage
        rateType: mortgage.rateType,
        amortizationPeriodYears: mortgage.amortizationPeriodYears,
        termYears: mortgage.termYears,
        paymentFrequency: mortgage.paymentFrequency,
        startDate: mortgage.startDate,
        variableRateSpread: mortgage.variableRateSpread ? mortgage.variableRateSpread * 100 : null,
        lenderName: mortgage.lenderName,
        propertyId: mortgage.propertyId
      };

      // Call the callback with loaded data
      onDataLoaded(calculatorData, selectedProperty);
      
      showToast(`Loaded mortgage data for ${selectedProperty.address}`, "success");
    } catch (error) {
      console.error("Error loading property data:", error);
      showToast("Failed to load property data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProperty = (properties || []).find(p => p.id === selectedPropertyId);
  const hasMortgages = mortgages && mortgages.length > 0;

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Download className="w-5 h-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">Load My Data</h3>
      </div>
      
      <div className="space-y-3">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
          >
            <option value="">Choose a property...</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address}
              </option>
            ))}
          </select>
        </div>

        {/* Property Info */}
        {selectedProperty && (
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {selectedProperty.address}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  {selectedProperty.city}, {selectedProperty.province}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(selectedProperty.purchasePrice)}
                </p>
                <p className="text-xs text-gray-600">
                  Purchased {new Date(selectedProperty.purchaseDate).getFullYear()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mortgage Status */}
        {selectedPropertyId && (
          <div className="flex items-center gap-2 text-sm">
            {mortgagesLoading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading mortgage data...</span>
              </div>
            ) : hasMortgages ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{mortgages.length} mortgage{mortgages.length !== 1 ? 's' : ''} found</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span>No mortgage data available</span>
              </div>
            )}
          </div>
        )}

        {/* Load Button */}
        <button
          onClick={handleLoadData}
          disabled={!selectedPropertyId || !hasMortgages || isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isLoading ? 'Loading...' : 'Load Mortgage Data'}
        </button>

        {/* Help Text */}
        <p className="text-xs text-gray-500">
          This will pre-fill the calculator with your property's mortgage information.
        </p>
      </div>
    </div>
  );
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
