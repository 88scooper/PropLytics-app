"use client";

import { useMortgages } from "@/hooks/useMortgages";
import { CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function PropertyMortgageSummary({ propertyId, className = "" }) {
  const { data: mortgages, isLoading, error } = useMortgages(propertyId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !mortgages || mortgages.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No mortgage data available
      </div>
    );
  }

  // Calculate summary statistics
  const totalOutstanding = mortgages.reduce((sum, mortgage) => {
    // For demo purposes, we'll estimate outstanding balance
    // In a real app, you'd calculate this based on payments made
    const yearsElapsed = (new Date() - new Date(mortgage.startDate)) / (1000 * 60 * 60 * 24 * 365);
    const totalPayments = yearsElapsed * getPaymentsPerYear(mortgage.paymentFrequency);
    const estimatedOutstanding = Math.max(0, mortgage.originalAmount - (totalPayments * 1000)); // Rough estimate
    return sum + estimatedOutstanding;
  }, 0);

  const primaryMortgage = mortgages[0]; // Use the first mortgage as primary
  const averageRate = mortgages.reduce((sum, m) => sum + m.interestRate, 0) / mortgages.length;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Primary Mortgage Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {primaryMortgage.lenderName}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {formatCurrency(totalOutstanding)}
        </span>
      </div>

      {/* Rate and Payment Info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{(averageRate * 100).toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{primaryMortgage.paymentFrequency.toLowerCase()}</span>
        </div>
      </div>

      {/* Multiple Mortgages Indicator */}
      {mortgages.length > 1 && (
        <div className="text-xs text-blue-600 font-medium">
          +{mortgages.length - 1} more mortgage{mortgages.length > 2 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

// Helper function to get payments per year based on frequency
function getPaymentsPerYear(frequency) {
  switch (frequency) {
    case 'MONTHLY':
      return 12;
    case 'BIWEEKLY':
      return 26;
    case 'WEEKLY':
      return 52;
    default:
      return 12;
  }
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
