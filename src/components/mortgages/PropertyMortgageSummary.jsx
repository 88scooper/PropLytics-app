"use client";

import { useProperty } from "@/context/PropertyContext";
import { getCurrentMortgageBalance } from "@/utils/mortgageCalculator";
import { CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react";

export default function PropertyMortgageSummary({ propertyId, className = "" }) {
  const property = useProperty(propertyId);

  if (!property || !property.mortgage) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No mortgage data available
      </div>
    );
  }

  // Calculate summary statistics using the property's mortgage data
  const currentBalance = getCurrentMortgageBalance(property.mortgage);
  const monthlyPayment = property.monthlyExpenses.mortgagePayment || 0;
  const interestRate = property.mortgage.interestRate * 100; // Convert to percentage

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Mortgage Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-900">
            {property.mortgage.lender}
          </span>
        </div>
        <span className="text-sm text-gray-600">
          ${currentBalance.toLocaleString()}
        </span>
      </div>

      {/* Rate and Payment Info */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{interestRate.toFixed(2)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{property.mortgage.paymentFrequency.toLowerCase()}</span>
        </div>
      </div>
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

