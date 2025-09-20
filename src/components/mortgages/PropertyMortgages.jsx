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
          <div key={mortgage.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                  {mortgage.lenderName}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {mortgage.rateType} • {mortgage.interestRate}%
                </p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Eye className="w-3 h-3" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Original:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  {formatCurrency(mortgage.originalAmount)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Term:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  {mortgage.termYears}y
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Start:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  {formatDate(mortgage.startDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Freq:</span>
                <span className="font-medium text-gray-900 dark:text-white ml-1">
                  {mortgage.paymentFrequency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
