"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout.jsx";
import { RequireAuth } from "@/context/AuthContext";

export default function FinancialCalculators() {
  const [activeCalculator, setActiveCalculator] = useState("mortgage");
  const [selectedProperty, setSelectedProperty] = useState("");

  // Property data from "My Investment Properties" page
  const myProperties = [
    {
      id: 1,
      address: "Richmond St E Condo",
      purchasePrice: 815000,
      downPayment: 163000,
      interestRate: 5.2,
      amortization: 25
    },
    {
      id: 2,
      address: "Tretti Way Condo",
      purchasePrice: 448878,
      downPayment: 89776,
      interestRate: 5.1,
      amortization: 25
    },
    {
      id: 3,
      address: "Wilson Ave Condo",
      purchasePrice: 532379,
      downPayment: 106476,
      interestRate: 5.0,
      amortization: 25
    }
  ];

  // Mortgage Calculator State
  const [mortgageData, setMortgageData] = useState({
    purchasePrice: "",
    downPayment: "",
    amortizationPeriod: "25",
    interestRate: "",
    monthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0
  });

  // Refinance Calculator State
  const [refinanceData, setRefinanceData] = useState({
    currentBalance: "",
    remainingYears: "20",
    currentRate: "",
    newRate: "",
    refiCost: 3000,
    currentPmt: 0,
    newPmt: 0,
    monthlySavings: 0,
    breakEvenMonths: 0,
    interestSavings: 0
  });

  // Mortgage Break Calculator State
  const [breakData, setBreakData] = useState({
    remainingBalance: "",
    contractRate: "",
    comparisonRate: 3.5,
    monthsRemaining: 24,
    threeMonthsInterest: 0,
    ird: 0,
    penalty: 0
  });

  // HELOC Calculator State
  const [helocData, setHelocData] = useState({
    propertyValue: "",
    currentBalance: "",
    helocAmount: 0,
    helocRate: 7.5,
    monthlyPayment: 0,
    totalInterest: 0
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Handle property selection
  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    
    if (propertyId) {
      const selectedProp = myProperties.find(prop => prop.id === parseInt(propertyId));
      if (selectedProp) {
        const currentBalance = selectedProp.purchasePrice - selectedProp.downPayment;
        
        // Update Mortgage Calculator
        setMortgageData(prev => ({
          ...prev,
          purchasePrice: selectedProp.purchasePrice.toString(),
          downPayment: selectedProp.downPayment.toString(),
          interestRate: selectedProp.interestRate.toString(),
          amortizationPeriod: selectedProp.amortization.toString()
        }));

        // Update Refinance Calculator
        setRefinanceData(prev => ({
          ...prev,
          currentBalance: currentBalance.toString(),
          currentRate: selectedProp.interestRate.toString()
        }));

        // Update Mortgage Break Calculator
        setBreakData(prev => ({
          ...prev,
          remainingBalance: currentBalance.toString(),
          contractRate: selectedProp.interestRate.toString()
        }));

        // Update HELOC Calculator
        setHelocData(prev => ({
          ...prev,
          propertyValue: selectedProp.purchasePrice.toString(),
          currentBalance: currentBalance.toString()
        }));
      }
    } else {
      // Clear all calculators
      setMortgageData({
        purchasePrice: "",
        downPayment: "",
        amortizationPeriod: "25",
        interestRate: "",
        monthlyPayment: 0,
        totalInterest: 0,
        totalPayment: 0
      });
      setRefinanceData({
        currentBalance: "",
        remainingYears: "20",
        currentRate: "",
        newRate: "",
        refiCost: 3000,
        currentPmt: 0,
        newPmt: 0,
        monthlySavings: 0,
        breakEvenMonths: 0,
        interestSavings: 0
      });
      setBreakData({
        remainingBalance: "",
        contractRate: "",
        comparisonRate: 3.5,
        monthsRemaining: 24,
        threeMonthsInterest: 0,
        ird: 0,
        penalty: 0
      });
      setHelocData({
        propertyValue: "",
        currentBalance: "",
        helocAmount: 0,
        helocRate: 7.5,
        monthlyPayment: 0,
        totalInterest: 0
      });
    }
  };

  // Mortgage calculation function
  const calculateMortgage = () => {
    const price = parseFloat(mortgageData.purchasePrice) || 0;
    const down = parseFloat(mortgageData.downPayment) || 0;
    const rate = parseFloat(mortgageData.interestRate) || 0;
    const amort = parseFloat(mortgageData.amortizationPeriod) || 25;

    if (price > 0 && down >= 0 && rate > 0 && amort > 0) {
      const principal = price - down;
      const monthlyRate = (rate / 100) / 12;
      const numberOfPayments = amort * 12;

      if (monthlyRate > 0) {
        const monthlyPaymentAmount = principal * 
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const totalPaymentAmount = monthlyPaymentAmount * numberOfPayments;
        const totalInterestAmount = totalPaymentAmount - principal;

        setMortgageData(prev => ({
          ...prev,
          monthlyPayment: monthlyPaymentAmount,
          totalInterest: totalInterestAmount,
          totalPayment: totalPaymentAmount
        }));
      }
    }
  };

  // Refinance calculation function
  const calculateRefinance = () => {
    const balance = parseFloat(refinanceData.currentBalance) || 0;
    const years = parseFloat(refinanceData.remainingYears) || 20;
    const currentRate = parseFloat(refinanceData.currentRate) || 0;
    const newRate = parseFloat(refinanceData.newRate) || 0;
    const refiCost = parseFloat(refinanceData.refiCost) || 0;

    if (balance > 0 && currentRate > 0 && newRate > 0) {
      const monthlyRateCurrent = (currentRate / 100) / 12;
      const monthlyRateNew = (newRate / 100) / 12;
      const numberOfPayments = years * 12;

      if (monthlyRateCurrent > 0 && monthlyRateNew > 0) {
        const currentPmt = balance * 
          (monthlyRateCurrent * Math.pow(1 + monthlyRateCurrent, numberOfPayments)) / 
          (Math.pow(1 + monthlyRateCurrent, numberOfPayments) - 1);
        const newPmt = balance * 
          (monthlyRateNew * Math.pow(1 + monthlyRateNew, numberOfPayments)) / 
          (Math.pow(1 + monthlyRateNew, numberOfPayments) - 1);
        
        const monthlySavings = Math.max(0, currentPmt - newPmt);
        const breakEvenMonths = monthlySavings > 0 ? Math.ceil(refiCost / monthlySavings) : Infinity;
        const totalInterestCurrent = currentPmt * numberOfPayments - balance;
        const totalInterestNew = newPmt * numberOfPayments - balance;
        const interestSavings = Math.max(0, totalInterestCurrent - totalInterestNew);

        setRefinanceData(prev => ({
          ...prev,
          currentPmt,
          newPmt,
          monthlySavings,
          breakEvenMonths: Number.isFinite(breakEvenMonths) ? breakEvenMonths : 0,
          interestSavings
        }));
      }
    }
  };

  // Mortgage Break calculation function
  const calculateBreak = () => {
    const balance = parseFloat(breakData.remainingBalance) || 0;
    const contractRate = parseFloat(breakData.contractRate) || 0;
    const comparisonRate = parseFloat(breakData.comparisonRate) || 0;
    const monthsRemaining = parseFloat(breakData.monthsRemaining) || 24;

    if (balance > 0 && contractRate > 0) {
      const r = contractRate / 100;
      const threeMonthsInterest = balance * r * (3 / 12);
      const rateDiff = Math.max(0, (contractRate - comparisonRate) / 100);
      const ird = balance * rateDiff * (monthsRemaining / 12);
      const penalty = Math.max(threeMonthsInterest, ird);

      setBreakData(prev => ({
        ...prev,
        threeMonthsInterest,
        ird,
        penalty
      }));
    }
  };

  // HELOC calculation function
  const calculateHELOC = () => {
    const propertyValue = parseFloat(helocData.propertyValue) || 0;
    const currentBalance = parseFloat(helocData.currentBalance) || 0;
    const helocRate = parseFloat(helocData.helocRate) || 7.5;

    if (propertyValue > 0 && currentBalance > 0) {
      // Assume HELOC can be up to 80% of property value minus current mortgage
      const maxHeloc = propertyValue * 0.8 - currentBalance;
      const helocAmount = Math.max(0, maxHeloc);
      
      // Calculate interest-only payment (typical for HELOC)
      const monthlyInterest = helocAmount * (helocRate / 100) / 12;
      const totalInterest = helocAmount * (helocRate / 100) * 10; // Assume 10-year draw period

      setHelocData(prev => ({
        ...prev,
        helocAmount,
        monthlyPayment: monthlyInterest,
        totalInterest
      }));
    }
  };

  // Recalculate when data changes
  useEffect(() => {
    calculateMortgage();
  }, [mortgageData.purchasePrice, mortgageData.downPayment, mortgageData.interestRate, mortgageData.amortizationPeriod]);

  useEffect(() => {
    calculateRefinance();
  }, [refinanceData.currentBalance, refinanceData.remainingYears, refinanceData.currentRate, refinanceData.newRate, refinanceData.refiCost]);

  useEffect(() => {
    calculateBreak();
  }, [breakData.remainingBalance, breakData.contractRate, breakData.comparisonRate, breakData.monthsRemaining]);

  useEffect(() => {
    calculateHELOC();
  }, [helocData.propertyValue, helocData.currentBalance, helocData.helocRate]);

  const calculators = [
    {
      id: "mortgage",
      title: "Mortgage Calculator",
      description: "Calculate your monthly mortgage payments"
    },
    {
      id: "refinance",
      title: "Refinance Calculator",
      description: "Compare current vs new mortgage terms"
    },
    {
      id: "break",
      title: "Mortgage Break Calculator",
      description: "Estimate early termination penalties"
    },
    {
      id: "heloc",
      title: "HELOC Calculator",
      description: "Calculate home equity line of credit"
    }
  ];



  return (
    <RequireAuth>
      <Layout>
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            {/* Calculator Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* Property Selection */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label htmlFor="property-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select a property to populate data
                </label>
                <select
                  id="property-select"
                  value={selectedProperty}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Choose a property...</option>
                  {myProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">Available properties: {myProperties.length}</p>
              </div>

              {/* Accordion */}
              <div className="space-y-4">
                {calculators.map((calculator) => (
                  <div key={calculator.id} className="border border-gray-200 rounded-lg">
                    {/* Accordion Header */}
                    <button
                      onClick={() => setActiveCalculator(activeCalculator === calculator.id ? "" : calculator.id)}
                      className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{calculator.title}</h3>
                          <p className="text-sm text-gray-600">{calculator.description}</p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            activeCalculator === calculator.id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {activeCalculator === calculator.id && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        {calculator.id === "mortgage" && (
                          <div className="space-y-6">
                            {/* Input Form Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label htmlFor="purchase-price" className="block text-sm font-medium text-gray-700 mb-2">
                                  Purchase Price
                                </label>
                                <input
                                  type="number"
                                  id="purchase-price"
                                  placeholder="Enter purchase price"
                                  value={mortgageData.purchasePrice}
                                  onChange={(e) => setMortgageData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="down-payment" className="block text-sm font-medium text-gray-700 mb-2">
                                  Down Payment
                                </label>
                                <input
                                  type="number"
                                  id="down-payment"
                                  placeholder="Enter down payment"
                                  value={mortgageData.downPayment}
                                  onChange={(e) => setMortgageData(prev => ({ ...prev, downPayment: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="amortization-period" className="block text-sm font-medium text-gray-700 mb-2">
                                  Amortization Period
                                </label>
                                <select
                                  id="amortization-period"
                                  value={mortgageData.amortizationPeriod}
                                  onChange={(e) => setMortgageData(prev => ({ ...prev, amortizationPeriod: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  <option value="15">15 Years</option>
                                  <option value="20">20 Years</option>
                                  <option value="25">25 Years</option>
                                  <option value="30">30 Years</option>
                                  <option value="35">35 Years</option>
                                </select>
                              </div>
                              <div>
                                <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  Interest Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="interest-rate"
                                  placeholder="Enter interest rate"
                                  value={mortgageData.interestRate}
                                  onChange={(e) => setMortgageData(prev => ({ ...prev, interestRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="pt-6 border-t border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Monthly Payment</p>
                                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(mortgageData.monthlyPayment)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Total Interest</p>
                                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(mortgageData.totalInterest)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Total Payment</p>
                                  <p className="text-2xl font-bold text-gray-800">{formatCurrency(mortgageData.totalPayment)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {calculator.id === "refinance" && (
                          <div className="space-y-6">
                            {/* Input Form Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label htmlFor="current-balance" className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Mortgage Balance
                                </label>
                                <input
                                  type="number"
                                  id="current-balance"
                                  placeholder="Enter current balance"
                                  value={refinanceData.currentBalance}
                                  onChange={(e) => setRefinanceData(prev => ({ ...prev, currentBalance: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="remaining-years" className="block text-sm font-medium text-gray-700 mb-2">
                                  Remaining Years
                                </label>
                                <input
                                  type="number"
                                  id="remaining-years"
                                  placeholder="Enter remaining years"
                                  value={refinanceData.remainingYears}
                                  onChange={(e) => setRefinanceData(prev => ({ ...prev, remainingYears: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="current-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Interest Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="current-rate"
                                  placeholder="Enter current rate"
                                  value={refinanceData.currentRate}
                                  onChange={(e) => setRefinanceData(prev => ({ ...prev, currentRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="new-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  New Interest Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="new-rate"
                                  placeholder="Enter new rate"
                                  value={refinanceData.newRate}
                                  onChange={(e) => setRefinanceData(prev => ({ ...prev, newRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="refi-cost" className="block text-sm font-medium text-gray-700 mb-2">
                                  Refinance Costs
                                </label>
                                <input
                                  type="number"
                                  id="refi-cost"
                                  placeholder="Enter refinance costs"
                                  value={refinanceData.refiCost}
                                  onChange={(e) => setRefinanceData(prev => ({ ...prev, refiCost: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="pt-6 border-t border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Refinance Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Current Payment</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(refinanceData.currentPmt)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">New Payment</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(refinanceData.newPmt)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Monthly Savings</p>
                                  <p className="text-xl font-bold text-green-600">{formatCurrency(refinanceData.monthlySavings)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Break-even (months)</p>
                                  <p className="text-xl font-bold text-gray-800">{refinanceData.breakEvenMonths > 0 ? refinanceData.breakEvenMonths : "-"}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Interest Savings</p>
                                  <p className="text-xl font-bold text-green-600">{formatCurrency(refinanceData.interestSavings)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {calculator.id === "break" && (
                          <div className="space-y-6">
                            {/* Input Form Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label htmlFor="remaining-balance" className="block text-sm font-medium text-gray-700 mb-2">
                                  Remaining Mortgage Balance
                                </label>
                                <input
                                  type="number"
                                  id="remaining-balance"
                                  placeholder="Enter remaining balance"
                                  value={breakData.remainingBalance}
                                  onChange={(e) => setBreakData(prev => ({ ...prev, remainingBalance: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="contract-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Interest Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="contract-rate"
                                  placeholder="Enter contract rate"
                                  value={breakData.contractRate}
                                  onChange={(e) => setBreakData(prev => ({ ...prev, contractRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="comparison-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  Comparison Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="comparison-rate"
                                  placeholder="Enter comparison rate"
                                  value={breakData.comparisonRate}
                                  onChange={(e) => setBreakData(prev => ({ ...prev, comparisonRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="months-remaining" className="block text-sm font-medium text-gray-700 mb-2">
                                  Months Remaining in Term
                                </label>
                                <input
                                  type="number"
                                  id="months-remaining"
                                  placeholder="Enter months remaining"
                                  value={breakData.monthsRemaining}
                                  onChange={(e) => setBreakData(prev => ({ ...prev, monthsRemaining: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="pt-6 border-t border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">Break Penalty Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Three Months Interest</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(breakData.threeMonthsInterest)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Interest Rate Differential</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(breakData.ird)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Estimated Penalty</p>
                                  <p className="text-xl font-bold text-red-600">{formatCurrency(breakData.penalty)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {calculator.id === "heloc" && (
                          <div className="space-y-6">
                            {/* Input Form Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label htmlFor="property-value" className="block text-sm font-medium text-gray-700 mb-2">
                                  Property Value
                                </label>
                                <input
                                  type="number"
                                  id="property-value"
                                  placeholder="Enter property value"
                                  value={helocData.propertyValue}
                                  onChange={(e) => setHelocData(prev => ({ ...prev, propertyValue: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="heloc-current-balance" className="block text-sm font-medium text-gray-700 mb-2">
                                  Current Mortgage Balance
                                </label>
                                <input
                                  type="number"
                                  id="heloc-current-balance"
                                  placeholder="Enter current balance"
                                  value={helocData.currentBalance}
                                  onChange={(e) => setHelocData(prev => ({ ...prev, currentBalance: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                              <div>
                                <label htmlFor="heloc-rate" className="block text-sm font-medium text-gray-700 mb-2">
                                  HELOC Interest Rate (%)
                                </label>
                                <input
                                  type="number"
                                  id="heloc-rate"
                                  placeholder="Enter HELOC rate"
                                  value={helocData.helocRate}
                                  onChange={(e) => setHelocData(prev => ({ ...prev, helocRate: e.target.value }))}
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="pt-6 border-t border-gray-200">
                              <h4 className="text-lg font-semibold text-gray-800 mb-4">HELOC Summary</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Available HELOC</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(helocData.helocAmount)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">Monthly Interest Payment</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(helocData.monthlyPayment)}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-sm text-gray-600">10-Year Interest Cost</p>
                                  <p className="text-xl font-bold text-gray-800">{formatCurrency(helocData.totalInterest)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


