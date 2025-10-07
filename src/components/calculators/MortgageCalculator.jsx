"use client";

import { useState, useEffect } from "react";
import Input from "@/components/Input";
import { formatCurrency } from "@/utils/formatting";

export default function MortgageCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [amortizationPeriod, setAmortizationPeriod] = useState("25");
  const [interestRate, setInterestRate] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  // Final corrected property data from "My Investment Properties" page
  const myProperties = [
    {
      id: 1,
      address: "Richmond St E Condo",
      purchasePrice: 815000,
      downPayment: 163000, // Assuming 20%
      interestRate: 5.2,
      amortization: 25
    },
    {
      id: 2,
      address: "Tretti Way Condo",
      purchasePrice: 448878,
      downPayment: 89776, // Assuming 20%
      interestRate: 5.1,
      amortization: 25
    },
    {
      id: 3,
      address: "Wilson Ave Condo",
      purchasePrice: 532379,
      downPayment: 106476, // Assuming 20%
      interestRate: 5.0,
      amortization: 25
    }
  ];

  // Mortgage calculation function
  const calculateMortgage = () => {
    const price = parseFloat(purchasePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = parseFloat(interestRate) || 0;
    const amort = parseFloat(amortizationPeriod) || 25;

    if (price > 0 && down >= 0 && rate > 0 && amort > 0) {
      const principal = price - down;
      const monthlyRate = (rate / 100) / 12;
      const numberOfPayments = amort * 12;

      if (monthlyRate > 0) {
        // Calculate monthly payment
        const monthlyPaymentAmount = principal * 
          (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Calculate total payment and interest
        const totalPaymentAmount = monthlyPaymentAmount * numberOfPayments;
        const totalInterestAmount = totalPaymentAmount - principal;

        setMonthlyPayment(monthlyPaymentAmount);
        setTotalInterest(totalInterestAmount);
        setTotalPayment(totalPaymentAmount);
      } else {
        setMonthlyPayment(0);
        setTotalInterest(0);
        setTotalPayment(0);
      }
    } else {
      setMonthlyPayment(0);
      setTotalInterest(0);
      setTotalPayment(0);
    }
  };

  // Handle property selection
  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    
    if (propertyId) {
      const selectedProp = myProperties.find(prop => prop.id === parseInt(propertyId));
      if (selectedProp) {
        setPurchasePrice(selectedProp.purchasePrice.toString());
        setDownPayment(selectedProp.downPayment.toString());
        setInterestRate(selectedProp.interestRate.toString());
        setAmortizationPeriod(selectedProp.amortization.toString());
      }
    } else {
      // Clear form if no property is selected
      setPurchasePrice("");
      setDownPayment("");
      setInterestRate("");
      setAmortizationPeriod("25");
    }
  };

  // Recalculate mortgage whenever inputs change
  useEffect(() => {
    calculateMortgage();
  }, [purchasePrice, downPayment, interestRate, amortizationPeriod]);


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Calculators</h1>
          <p className="text-gray-600">Calculate your monthly mortgage payments and understand your financing options.</p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Property Selection */}
          <div className="mb-6">
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
          </div>

          {/* Card Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mortgage Calculator</h2>
            <p className="text-gray-600">Calculate your monthly mortgage payments.</p>
          </div>

          {/* Input Form Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Price */}
            <div>
              <label htmlFor="purchase-price" className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price
              </label>
              <input
                type="number"
                id="purchase-price"
                placeholder="Enter purchase price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Down Payment */}
            <div>
              <label htmlFor="down-payment" className="block text-sm font-medium text-gray-700 mb-2">
                Down Payment
              </label>
              <input
                type="number"
                id="down-payment"
                placeholder="Enter down payment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Amortization Period */}
            <div>
              <label htmlFor="amortization-period" className="block text-sm font-medium text-gray-700 mb-2">
                Amortization Period
              </label>
              <div className="relative">
                <select
                  id="amortization-period"
                  value={amortizationPeriod}
                  onChange={(e) => setAmortizationPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="15">15 Years</option>
                  <option value="20">20 Years</option>
                  <option value="25">25 Years</option>
                  <option value="30">30 Years</option>
                  <option value="35">35 Years</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              <input
                type="number"
                id="interest-rate"
                placeholder="Enter interest rate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Results Section - Payment Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Monthly Payment</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(monthlyPayment)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Interest</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalInterest)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Payment</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalPayment)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
