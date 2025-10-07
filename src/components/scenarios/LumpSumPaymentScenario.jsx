"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { ArrowLeft, Calculator, TrendingDown, DollarSign } from "lucide-react";

export default function LumpSumPaymentScenario({ propertyId, onClose }) {
  const { mortgages, calculateMortgagePayment, calculateRemainingBalance } = useMortgages();
  const [selectedMortgage, setSelectedMortgage] = useState("");
  const [lumpSumAmount, setLumpSumAmount] = useState("");
  const [results, setResults] = useState(null);

  // Filter mortgages for the selected property
  const propertyMortgages = mortgages.filter(m => 
    !propertyId || m.propertyId === propertyId
  );

  const calculateLumpSumImpact = () => {
    if (!selectedMortgage || !lumpSumAmount) {
      setResults(null);
      return;
    }

    const mortgage = propertyMortgages.find(m => m.id === selectedMortgage);
    if (!mortgage) return;

    const lumpSum = parseFloat(lumpSumAmount);
    if (lumpSum <= 0) return;

    // Calculate current remaining balance
    const startDate = mortgage.startDate ? new Date(mortgage.startDate.seconds ? mortgage.startDate.seconds * 1000 : mortgage.startDate) : new Date();
    const monthsSinceStart = Math.max(0, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24 * 30)));
    const paymentsMade = Math.floor(monthsSinceStart / (mortgage.paymentFrequency === 'MONTHLY' ? 1 : mortgage.paymentFrequency === 'BIWEEKLY' ? 0.5 : 0.25));
    
    const currentBalance = calculateRemainingBalance(
      mortgage.originalAmount,
      mortgage.interestRate,
      mortgage.amortizationPeriodYears,
      paymentsMade,
      mortgage.paymentFrequency
    );

    const newBalance = Math.max(0, currentBalance - lumpSum);
    
    // Calculate new payment with reduced balance
    const newPayment = calculateMortgagePayment(
      newBalance,
      mortgage.interestRate,
      mortgage.amortizationPeriodYears - (paymentsMade / 12),
      mortgage.paymentFrequency
    );

    const currentPayment = calculateMortgagePayment(
      mortgage.originalAmount,
      mortgage.interestRate,
      mortgage.amortizationPeriodYears,
      mortgage.paymentFrequency
    );

    // Calculate interest savings
    const remainingPayments = (mortgage.amortizationPeriodYears * 12) - paymentsMade;
    const interestSavings = (currentPayment - newPayment) * remainingPayments;

    setResults({
      currentBalance,
      newBalance,
      currentPayment,
      newPayment,
      interestSavings,
      lumpSum
    });
  };

  useEffect(() => {
    calculateLumpSumImpact();
  }, [selectedMortgage, lumpSumAmount]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lump Sum Payment Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze the impact of making a lump sum payment on your mortgage
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Scenario Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mortgage Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Mortgage
            </label>
            <select
              value={selectedMortgage}
              onChange={(e) => setSelectedMortgage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value="">Choose a mortgage...</option>
              {propertyMortgages.map((mortgage) => (
                <option key={mortgage.id} value={mortgage.id}>
                  {mortgage.lenderName} - {formatCurrency(mortgage.originalAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* Lump Sum Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lump Sum Amount
            </label>
            <input
              type="number"
              value={lumpSumAmount}
              onChange={(e) => setLumpSumAmount(e.target.value)}
              placeholder="10000"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Payment</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(results.newPayment)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Down from {formatCurrency(results.currentPayment)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interest Savings</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(results.interestSavings)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Over remaining term
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Balance</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(results.newBalance)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Down from {formatCurrency(results.currentBalance)}
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Impact Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Lump Sum Payment</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.lumpSum)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.currentBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">New Balance</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.newBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Payment Reduction</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(results.currentPayment - results.newPayment)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Interest Savings</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(results.interestSavings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!results && (selectedMortgage || lumpSumAmount) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please select a mortgage and enter a lump sum amount to see the analysis.
          </p>
        </div>
      )}
    </div>
  );
}
