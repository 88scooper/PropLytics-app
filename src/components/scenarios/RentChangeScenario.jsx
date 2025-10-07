"use client";

import { useState, useEffect } from 'react';
import { useProperties } from '@/context/PropertyContext';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { calculateCapRate, calculateMonthlyCashFlow, calculateAnnualCashFlow, calculateCashOnCashReturn } from '@/utils/financialCalculations';

export default function RentChangeScenario({ propertyId, onClose }) {
  const properties = useProperties();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rentChange, setRentChange] = useState(0);
  const [changeType, setChangeType] = useState('increase'); // 'increase' or 'decrease'
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      setSelectedProperty(property);
    } else if (properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [propertyId, properties]);

  const calculateRentChangeImpact = () => {
    if (!selectedProperty) return;

    const currentRent = selectedProperty.rent.monthlyRent;
    const changeAmount = changeType === 'increase' ? rentChange : -rentChange;
    const newRent = currentRent + changeAmount;
    
    // Create temporary property object with new rent for calculations
    const tempProperty = {
      ...selectedProperty,
      rent: {
        ...selectedProperty.rent,
        monthlyRent: newRent
      }
    };
    
    const currentMonthlyCashFlow = selectedProperty.monthlyCashFlow;
    const newMonthlyCashFlow = calculateMonthlyCashFlow(tempProperty);
    const newAnnualCashFlow = calculateAnnualCashFlow(tempProperty);
    
    const currentCapRate = selectedProperty.capRate;
    const newCapRate = calculateCapRate(tempProperty);
    
    const currentCashOnCashReturn = selectedProperty.cashOnCashReturn;
    const newCashOnCashReturn = calculateCashOnCashReturn(tempProperty);

    setAnalysisResults({
      currentRent,
      newRent,
      changeAmount,
      currentMonthlyCashFlow,
      newMonthlyCashFlow,
      currentAnnualCashFlow: selectedProperty.annualCashFlow,
      newAnnualCashFlow,
      currentCapRate,
      newCapRate,
      currentCashOnCashReturn,
      newCashOnCashReturn,
      monthlyImpact: changeAmount,
      annualImpact: changeAmount * 12
    });
  };

  if (!selectedProperty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rent Change Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Model the impact of rent increases or decreases on your property
          </p>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="space-y-6">
        {/* Property Selection */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <label className="block text-sm font-medium mb-2">Property</label>
          <select
            value={selectedProperty.id}
            onChange={(e) => {
              const property = properties.find(p => p.id === e.target.value);
              setSelectedProperty(property);
            }}
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          >
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.nickname} - {formatCurrency(property.rent.monthlyRent)}/month
              </option>
            ))}
          </select>
        </div>

        {/* Current Rent Display */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <h3 className="font-semibold mb-3">Current Performance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedProperty.monthlyRent)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Annual Cash Flow</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(selectedProperty.annualCashFlow)}
              </div>
            </div>
          </div>
        </div>

        {/* Rent Change Inputs */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <h3 className="font-semibold mb-4">Rent Change Parameters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Change Type</label>
              <select
                value={changeType}
                onChange={(e) => setChangeType(e.target.value)}
                className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
              >
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
              </select>
            </div>
            <div>
              <Input
                label="Amount ($)"
                type="number"
                value={rentChange}
                onChange={(e) => setRentChange(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>

        <Button onClick={calculateRentChangeImpact} className="w-full">
          Analyze Rent Change Impact
        </Button>

        {/* Results */}
        {analysisResults && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Analysis Results</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-medium mb-2">New Rent</h4>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(analysisResults.newRent)}/month
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {analysisResults.changeAmount > 0 ? '+' : ''}{formatCurrency(analysisResults.changeAmount)}/month
                </p>
              </div>

              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-medium mb-2">New Cash Flow</h4>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(analysisResults.newMonthlyCashFlow)}/month
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {analysisResults.monthlyImpact > 0 ? '+' : ''}{formatCurrency(analysisResults.monthlyImpact)}/month
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-medium mb-1">Annual Impact</h4>
                <p className="text-lg font-semibold">
                  {analysisResults.annualImpact > 0 ? '+' : ''}{formatCurrency(analysisResults.annualImpact)}
                </p>
              </div>

              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-medium mb-1">New Cap Rate</h4>
                <p className="text-lg font-semibold">
                  {formatPercentage(analysisResults.newCapRate)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {analysisResults.newCapRate > analysisResults.currentCapRate ? '+' : ''}
                  {formatPercentage(analysisResults.newCapRate - analysisResults.currentCapRate)}
                </p>
              </div>

              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-medium mb-1">Cash-on-Cash Return</h4>
                <p className="text-lg font-semibold">
                  {formatPercentage(analysisResults.newCashOnCashReturn)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {analysisResults.newCashOnCashReturn > analysisResults.currentCashOnCashReturn ? '+' : ''}
                  {formatPercentage(analysisResults.newCashOnCashReturn - analysisResults.currentCashOnCashReturn)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
