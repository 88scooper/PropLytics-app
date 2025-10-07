"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

export default function MortgageRenewalScenario({ propertyId, onClose }) {
  const { mortgages, calculateMortgagePayment, calculateRemainingBalance } = useMortgages();
  const [selectedMortgage, setSelectedMortgage] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newTerm, setNewTerm] = useState(5);
  const [results, setResults] = useState(null);

  // Filter mortgages for the selected property
  const propertyMortgages = mortgages.filter(m => 
    !propertyId || m.propertyId === propertyId
  );

  const calculateRenewalImpact = () => {
    if (!selectedMortgage || !newRate) {
      setResults(null);
      return;
    }

    const mortgage = propertyMortgages.find(m => m.id === selectedMortgage);
    if (!mortgage) return;

    const newRateValue = parseFloat(newRate);

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

    // Calculate remaining amortization
    const remainingAmortization = mortgage.amortizationPeriodYears - (paymentsMade / 12);

    // Calculate current payment
    const currentPayment = calculateMortgagePayment(
      mortgage.originalAmount,
      mortgage.interestRate,
      mortgage.amortizationPeriodYears,
      mortgage.paymentFrequency
    );

    // Calculate new payment with new rate
    const newPayment = calculateMortgagePayment(
      currentBalance,
      newRateValue,
      remainingAmortization,
      mortgage.paymentFrequency
    );

    // Calculate payment difference
    const paymentDifference = newPayment - currentPayment;

    // Calculate total cost/savings over new term
    const totalCostSavings = paymentDifference * (newTerm * 12);

    // Calculate interest savings over remaining amortization
    const totalInterestSavings = (currentPayment - newPayment) * (remainingAmortization * 12);

    setResults({
      currentBalance,
      currentPayment,
      newPayment,
      paymentDifference,
      totalCostSavings,
      totalInterestSavings,
      newRateValue,
      remainingAmortization,
      currentRate: mortgage.interestRate
    });
  };

  useEffect(() => {
    calculateRenewalImpact();
  }, [selectedMortgage, newRate, newTerm]);

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
            Mortgage Renewal Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze the impact of renewing your mortgage at a new rate
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Renewal Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mortgage Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Mortgage to Renew
            </label>
            <select
              value={selectedMortgage}
              onChange={(e) => setSelectedMortgage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value="">Choose a mortgage...</option>
              {propertyMortgages.map((mortgage) => (
                <option key={mortgage.id} value={mortgage.id}>
                  {mortgage.lenderName} - {mortgage.interestRate}% - {formatCurrency(mortgage.originalAmount)}
                </option>
              ))}
            </select>
          </div>

          {/* New Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Interest Rate (%)
            </label>
            <input
              type="number"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="4.5"
              min="0"
              max="20"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            />
          </div>

          {/* New Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Term (Years)
            </label>
            <select
              value={newTerm}
              onChange={(e) => setNewTerm(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={4}>4 Years</option>
              <option value={5}>5 Years</option>
              <option value={6}>6 Years</option>
              <option value={7}>7 Years</option>
              <option value={10}>10 Years</option>
            </select>
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
                {results.paymentDifference > 0 ? 'Up from' : 'Down from'} {formatCurrency(results.currentPayment)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Impact</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(Math.abs(results.paymentDifference))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.paymentDifference > 0 ? 'Additional cost' : 'Savings'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Term Impact</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(Math.abs(results.totalCostSavings))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Over {newTerm} year term
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Renewal Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.currentBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.currentRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">New Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.newRateValue}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Rate Change</span>
                <span className={`font-medium ${results.newRateValue > results.currentRate ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {results.newRateValue > results.currentRate ? '+' : ''}{(results.newRateValue - results.currentRate).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Payment</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.currentPayment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">New Payment</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.newPayment)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Remaining Amortization</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {results.remainingAmortization.toFixed(1)} years
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Interest Impact</span>
                  <span className={`text-lg font-bold ${results.totalInterestSavings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(results.totalInterestSavings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-lg p-6 ${
            results.totalInterestSavings > 0 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <h3 className="text-lg font-semibold mb-2">
              {results.totalInterestSavings > 0 ? 'Renewal Recommended' : 'Consider Current Rate'}
            </h3>
            <p className={
              results.totalInterestSavings > 0 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }>
              {results.totalInterestSavings > 0 
                ? `You would save ${formatCurrency(results.totalInterestSavings)} in interest over the remaining amortization period.`
                : `The new rate would cost you an additional ${formatCurrency(Math.abs(results.totalInterestSavings))} in interest over the remaining amortization period.`
              }
            </p>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!results && (selectedMortgage || newRate) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            Please select a mortgage and enter a new interest rate to see the analysis.
          </p>
        </div>
      )}
    </div>
  );
}
