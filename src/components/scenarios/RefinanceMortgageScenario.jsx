"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { ArrowLeft, Calculator, TrendingUp, DollarSign, Percent } from "lucide-react";

export default function RefinanceMortgageScenario({ propertyId, onClose }) {
  const { mortgages, calculateMortgagePayment, calculateRemainingBalance } = useMortgages();
  const [selectedMortgage, setSelectedMortgage] = useState("");
  const [newRate, setNewRate] = useState("");
  const [newTerm, setNewTerm] = useState(5);
  const [newAmortization, setNewAmortization] = useState(25);
  const [refinanceCosts, setRefinanceCosts] = useState("");
  const [results, setResults] = useState(null);

  // Filter mortgages for the selected property
  const propertyMortgages = mortgages.filter(m => 
    !propertyId || m.propertyId === propertyId
  );

  const calculateRefinanceImpact = () => {
    if (!selectedMortgage || !newRate) {
      setResults(null);
      return;
    }

    const mortgage = propertyMortgages.find(m => m.id === selectedMortgage);
    if (!mortgage) return;

    const newRateValue = parseFloat(newRate);
    const costs = parseFloat(refinanceCosts) || 0;

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

    // Calculate current payment
    const currentPayment = calculateMortgagePayment(
      mortgage.originalAmount,
      mortgage.interestRate,
      mortgage.amortizationPeriodYears,
      mortgage.paymentFrequency
    );

    // Calculate new payment
    const newPayment = calculateMortgagePayment(
      currentBalance,
      newRateValue,
      newAmortization,
      mortgage.paymentFrequency
    );

    // Calculate savings per payment
    const paymentSavings = currentPayment - newPayment;

    // Calculate total savings over new term
    const totalSavings = paymentSavings * (newTerm * 12);

    // Calculate break-even point
    const breakEvenMonths = costs > 0 && paymentSavings > 0 ? Math.ceil(costs / paymentSavings) : 0;

    // Calculate total cost of refinancing
    const totalRefinanceCost = costs + (currentBalance * 0.01); // Assume 1% penalty

    setResults({
      currentBalance,
      currentPayment,
      newPayment,
      paymentSavings,
      totalSavings,
      breakEvenMonths,
      totalRefinanceCost,
      newRateValue,
      costs
    });
  };

  useEffect(() => {
    calculateRefinanceImpact();
  }, [selectedMortgage, newRate, newTerm, newAmortization, refinanceCosts]);

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
            Refinance Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analyze the impact of refinancing your mortgage
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Refinance Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mortgage Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Mortgage to Refinance
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

          {/* New Amortization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Amortization (Years)
            </label>
            <select
              value={newAmortization}
              onChange={(e) => setNewAmortization(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value={15}>15 Years</option>
              <option value={20}>20 Years</option>
              <option value={25}>25 Years</option>
              <option value={30}>30 Years</option>
              <option value={35}>35 Years</option>
            </select>
          </div>

          {/* Refinance Costs */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Refinance Costs (Legal, Appraisal, etc.)
            </label>
            <input
              type="number"
              value={refinanceCosts}
              onChange={(e) => setRefinanceCosts(e.target.value)}
              placeholder="2000"
              min="0"
              step="100"
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
                {results.paymentSavings > 0 ? 'Down from' : 'Up from'} {formatCurrency(results.currentPayment)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Savings</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(Math.abs(results.paymentSavings))}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.paymentSavings > 0 ? 'Savings' : 'Additional cost'}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Break-Even</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {results.breakEvenMonths > 0 ? `${results.breakEvenMonths} months` : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                To recover costs
              </p>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Refinance Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.currentBalance)}
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
                <span className="text-gray-600 dark:text-gray-400">Refinance Costs</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.costs)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Refinance Cost</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(results.totalRefinanceCost)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Savings Over Term</span>
                  <span className={`text-lg font-bold ${results.totalSavings > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(results.totalSavings)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`rounded-lg p-6 ${
            results.totalSavings > results.totalRefinanceCost 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <h3 className="text-lg font-semibold mb-2">
              {results.totalSavings > results.totalRefinanceCost ? 'Refinancing Recommended' : 'Refinancing Not Recommended'}
            </h3>
            <p className={
              results.totalSavings > results.totalRefinanceCost 
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }>
              {results.totalSavings > results.totalRefinanceCost 
                ? `You would save ${formatCurrency(results.totalSavings - results.totalRefinanceCost)} over the term after accounting for refinance costs.`
                : `The refinance costs (${formatCurrency(results.totalRefinanceCost)}) exceed the potential savings (${formatCurrency(results.totalSavings)}).`
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
