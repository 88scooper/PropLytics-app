"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/hooks/useMortgages";
import { usePrepaymentAnalysis } from "@/hooks/useMortgages";
import { usePropertyData } from "@/context/PropertyDataContext";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Calculator, TrendingDown, DollarSign, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

export default function LumpSumPaymentScenarioEnhanced({ propertyId, onClose }) {
  const { data: mortgages, isLoading: mortgagesLoading } = useMortgages(propertyId);
  const prepaymentAnalysis = usePrepaymentAnalysis();
  const propertyData = usePropertyData();
  
  // Create a properties array from the single property data
  const properties = propertyData ? [{
    id: propertyData.id,
    address: propertyData.address,
    name: propertyData.address
  }] : [];
  
  const { showToast } = useToast();
  
  const [useRealData, setUseRealData] = useState(false);
  const [selectedMortgage, setSelectedMortgage] = useState("");
  const [lumpSumAmount, setLumpSumAmount] = useState("");
  const [lumpSumPaymentNumber, setLumpSumPaymentNumber] = useState(12);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Filter mortgages for the selected property
  const propertyMortgages = mortgages || [];

  // Mock data for when real data is not used
  const mockMortgage = {
    id: 'mock-mortgage',
    lenderName: 'TD Bank',
    originalAmount: 500000,
    interestRate: 0.0525,
    rateType: 'FIXED',
    amortizationPeriodYears: 25,
    termYears: 5,
    startDate: new Date('2022-01-01'),
    paymentFrequency: 'MONTHLY'
  };

  const currentMortgages = useRealData ? propertyMortgages : [mockMortgage];

  const calculateLumpSumImpact = async () => {
    if (!selectedMortgage || !lumpSumAmount) {
      setResults(null);
      return;
    }

    const mortgage = currentMortgages.find(m => m.id === selectedMortgage);
    if (!mortgage) return;

    const lumpSum = parseFloat(lumpSumAmount);
    if (lumpSum <= 0) return;

    setIsCalculating(true);
    try {
      if (useRealData) {
        // Use real API calculation
        const analysisData = {
          mortgageData: {
            originalAmount: mortgage.originalAmount,
            interestRate: mortgage.interestRate,
            rateType: mortgage.rateType,
            amortizationPeriodYears: mortgage.amortizationPeriodYears,
            paymentFrequency: mortgage.paymentFrequency,
            startDate: mortgage.startDate,
            termYears: mortgage.termYears
          },
          prepaymentType: 'lumpSum',
          lumpSumAmount: lumpSum,
          lumpSumPaymentNumber: lumpSumPaymentNumber
        };

        const result = await prepaymentAnalysis.mutateAsync(analysisData);
        setResults(result);
      } else {
        // Use mock calculation
        const mockResults = calculateMockLumpSumImpact(mortgage, lumpSum, lumpSumPaymentNumber);
        setResults(mockResults);
      }
    } catch (error) {
      console.error('Error calculating lump sum impact:', error);
      showToast('Failed to calculate lump sum impact', 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateMockLumpSumImpact = (mortgage, lumpSum, paymentNumber) => {
    // Simplified mock calculation
    const monthlyRate = mortgage.interestRate / 12;
    const totalPayments = mortgage.amortizationPeriodYears * 12;
    const monthlyPayment = mortgage.originalAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const remainingPayments = totalPayments - paymentNumber;
    const totalSavings = remainingPayments * monthlyPayment - lumpSum;
    const interestSavings = totalSavings * 0.6; // Rough estimate

    return {
      totalSavings,
      interestSavings,
      paymentsEliminated: Math.floor(lumpSum / monthlyPayment),
      mortgagePaidOff: lumpSum >= mortgage.originalAmount * 0.8,
      newAmortizationSchedule: []
    };
  };

  useEffect(() => {
    if (currentMortgages.length > 0 && !selectedMortgage) {
      setSelectedMortgage(currentMortgages[0].id);
    }
  }, [currentMortgages, selectedMortgage]);

  const selectedMortgageData = currentMortgages.find(m => m.id === selectedMortgage);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Lump Sum Payment Analysis
          </h2>
        </div>
        
        {/* Data Source Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mock Data</span>
          <button
            onClick={() => setUseRealData(!useRealData)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {useRealData ? (
              <ToggleRight className="w-5 h-5 text-blue-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-400" />
            )}
            <span className="text-sm font-medium">
              {useRealData ? 'Real Data' : 'Mock Data'}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4">Analysis Parameters</h3>
            
            {/* Mortgage Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Mortgage
              </label>
              {useRealData && mortgagesLoading ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading mortgages...</span>
                </div>
              ) : (
                <select
                  value={selectedMortgage}
                  onChange={(e) => setSelectedMortgage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currentMortgages.map((mortgage) => (
                    <option key={mortgage.id} value={mortgage.id}>
                      {mortgage.lenderName} - {formatCurrency(mortgage.originalAmount)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Lump Sum Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lump Sum Amount
              </label>
              <input
                type="number"
                value={lumpSumAmount}
                onChange={(e) => setLumpSumAmount(e.target.value)}
                placeholder="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Payment Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Number (when to make lump sum)
              </label>
              <input
                type="number"
                value={lumpSumPaymentNumber}
                onChange={(e) => setLumpSumPaymentNumber(parseInt(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateLumpSumImpact}
              disabled={!selectedMortgage || !lumpSumAmount || isCalculating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCalculating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4" />
              )}
              {isCalculating ? 'Calculating...' : 'Calculate Impact'}
            </button>
          </div>

          {/* Mortgage Details */}
          {selectedMortgageData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Selected Mortgage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Lender:</span>
                  <span className="font-medium text-blue-900">{selectedMortgageData.lenderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Original Amount:</span>
                  <span className="font-medium text-blue-900">
                    {formatCurrency(selectedMortgageData.originalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Interest Rate:</span>
                  <span className="font-medium text-blue-900">
                    {(selectedMortgageData.interestRate * 100).toFixed(2)}% {selectedMortgageData.rateType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Amortization:</span>
                  <span className="font-medium text-blue-900">
                    {selectedMortgageData.amortizationPeriodYears} years
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {results && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Analysis Results
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Total Savings</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(results.totalSavings)}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Interest Savings</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">
                      {formatCurrency(results.interestSavings)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calculator className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Payments Eliminated</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {results.paymentsEliminated} payments
                  </p>
                </div>

                {results.mortgagePaidOff && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-yellow-800">
                      🎉 This lump sum would pay off your mortgage completely!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!results && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
              <p className="text-gray-600">
                Enter your lump sum amount and payment number to see the impact on your mortgage.
              </p>
            </div>
          )}
        </div>
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
