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

  // Calculate monthly payment for mortgage
  const calculateMonthlyPayment = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return 0;
      if (rate === 0) return principal / (years * 12);
      
      // Rate is stored as percentage (2.69 for 2.69%), so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment using standard mortgage formula
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      return Math.round(monthlyPayment * 100) / 100;
    } catch (error) {
      console.error("Error calculating monthly payment:", error);
      return 0;
    }
  };

  // Calculate renewal date
  const calculateRenewalDate = (mortgage) => {
    try {
      const startDate = new Date(mortgage.startDate);
      const renewalDate = new Date(startDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + mortgage.termYears);
      return renewalDate;
    } catch (error) {
      console.error("Error calculating renewal date:", error);
      return null;
    }
  };

  // Calculate remaining loan balance
  const calculateRemainingBalance = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears, startDate } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return principal;
      if (rate === 0) return principal;
      
      // Calculate months since start
      const startDateObj = new Date(startDate);
      const now = new Date();
      const monthsSinceStart = Math.max(0, (now.getFullYear() - startDateObj.getFullYear()) * 12 + (now.getMonth() - startDateObj.getMonth()));
      
      // Rate is stored as percentage, so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      // Calculate remaining balance
      const remainingBalance = principal * 
        (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, monthsSinceStart)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      return Math.round(Math.max(0, remainingBalance) * 100) / 100;
    } catch (error) {
      console.error("Error calculating remaining balance:", error);
      return mortgage.originalAmount;
    }
  };

  // Calculate total principal paid to date
  const calculateTotalPrincipalPaid = (mortgage) => {
    try {
      const originalAmount = parseFloat(mortgage.originalAmount);
      const remainingBalance = calculateRemainingBalance(mortgage);
      return Math.round((originalAmount - remainingBalance) * 100) / 100;
    } catch (error) {
      console.error("Error calculating total principal paid:", error);
      return 0;
    }
  };

  // Calculate total interest paid to date
  const calculateTotalInterestPaid = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears, startDate } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return 0;
      if (rate === 0) return 0;
      
      // Calculate months since start
      const startDateObj = new Date(startDate);
      const now = new Date();
      const monthsSinceStart = Math.max(0, (now.getFullYear() - startDateObj.getFullYear()) * 12 + (now.getMonth() - startDateObj.getMonth()));
      
      // Rate is stored as percentage, so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      // Calculate total payments made
      const totalPaymentsMade = monthlyPayment * monthsSinceStart;
      
      // Calculate total principal paid
      const totalPrincipalPaid = calculateTotalPrincipalPaid(mortgage);
      
      // Total interest paid = total payments made - total principal paid
      return Math.round((totalPaymentsMade - totalPrincipalPaid) * 100) / 100;
    } catch (error) {
      console.error("Error calculating total interest paid:", error);
      return 0;
    }
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
                {mortgage.rateType === 'Fixed' ? 'Fixed-Rate Mortgage' : 'Variable-Rate Mortgage'}
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
                    {mortgage.rateType === 'Variable' ? 'Prime ' : ''}{mortgage.interestRate}%
                  </p>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(calculateMonthlyPayment(mortgage))} / month
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Payment</p>
              </div>
            </div>

            {/* Secondary Details Section */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
              {/* First row - Original details */}
              <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
                <span>Amortization: {mortgage.amortizationPeriodYears}y</span>
                <span>Term: {mortgage.termYears}y</span>
                <span>Start: {formatDate(mortgage.startDate)}</span>
              </div>
              
              {/* Second row - New details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Renewal:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {calculateRenewalDate(mortgage) ? calculateRenewalDate(mortgage).toLocaleDateString('en-CA') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(calculateRemainingBalance(mortgage))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Principal:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(calculateTotalPrincipalPaid(mortgage))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Interest:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(calculateTotalInterestPaid(mortgage))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
