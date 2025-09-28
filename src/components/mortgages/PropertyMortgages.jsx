"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { Eye, Plus } from "lucide-react";

export default function PropertyMortgages({ propertyId }) {
  const { mortgages, getPropertyMortgages } = useMortgages();
  const [propertyMortgages, setPropertyMortgages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMortgages = async () => {
      if (!propertyId) {
        setPropertyMortgages([]);
        setLoading(false);
        return;
      }

      try {
        const mortgages = await getPropertyMortgages(propertyId);
        setPropertyMortgages(mortgages);
      } catch (error) {
        console.error('Failed to load property mortgages:', error);
        setPropertyMortgages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMortgages();
  }, [propertyId, getPropertyMortgages]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-CA');
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h3 className="font-semibold mb-3">Property Mortgages</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (propertyMortgages.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h3 className="font-semibold mb-3">Property Mortgages</h3>
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            No mortgages found for this property
          </p>
          <button className="text-sm text-[#205A3E] hover:text-[#1a4a32] transition-colors">
            Add Mortgage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Property Mortgages</h3>
        <button className="text-sm text-[#205A3E] hover:text-[#1a4a32] transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {propertyMortgages.map((mortgage) => (
          <div key={mortgage.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            {/* Header Section */}
            <div className="mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {mortgage.lenderName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mortgage.rateType === 'FIXED' ? 'Fixed-Rate Mortgage' : 'Variable-Rate Mortgage'}
              </p>
            </div>

            {/* Primary Details Section */}
            <div className="space-y-3 mb-3">
              {/* Original Loan Amount and Interest Rate */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(mortgage.originalAmount)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Original Loan</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {mortgage.interestRate}%
                  </p>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mortgage.monthlyPayment)} / month
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Payment</p>
              </div>
            </div>

            {/* Secondary Details Section */}
            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
              <span>Amortization: {mortgage.amortizationPeriodYears}y</span>
              <span>Term: {mortgage.termYears}y</span>
              <span>Start: {formatDate(mortgage.startDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
