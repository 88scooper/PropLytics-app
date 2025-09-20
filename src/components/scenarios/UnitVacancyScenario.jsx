"use client";

import { useState, useEffect } from 'react';
import { getAllProperties } from '@/lib/propertyData';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function UnitVacancyScenario({ propertyId, onClose }) {
  const [properties] = useState(getAllProperties());
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [vacancyMonths, setVacancyMonths] = useState(1);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      setSelectedProperty(property);
    } else if (properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [propertyId, properties]);

  const calculateVacancyImpact = () => {
    if (!selectedProperty) return;

    const currentMonthlyRent = selectedProperty.monthlyRent;
    const currentMonthlyExpenses = selectedProperty.monthlyExpenses.total;
    const currentMonthlyCashFlow = selectedProperty.monthlyCashFlow;
    
    // During vacancy, rent is 0 but expenses continue
    const vacancyMonthlyCashFlow = -currentMonthlyExpenses;
    const totalVacancyLoss = currentMonthlyRent * vacancyMonths;
    const totalExpenseDuringVacancy = currentMonthlyExpenses * vacancyMonths;
    const netVacancyImpact = -(totalVacancyLoss + totalExpenseDuringVacancy);
    
    // Calculate impact on annual metrics
    const monthsWithRent = 12 - vacancyMonths;
    const annualRentDuringVacancy = currentMonthlyRent * monthsWithRent;
    const annualExpenses = currentMonthlyExpenses * 12;
    const annualCashFlowDuringVacancy = annualRentDuringVacancy - annualExpenses;
    
    const currentAnnualCashFlow = selectedProperty.annualCashFlow;
    const annualCashFlowImpact = annualCashFlowDuringVacancy - currentAnnualCashFlow;
    
    const newCapRate = (annualRentDuringVacancy / selectedProperty.marketValue) * 100;
    const newCashOnCashReturn = (annualCashFlowDuringVacancy / selectedProperty.totalInvestment) * 100;

    setAnalysisResults({
      currentMonthlyRent,
      currentMonthlyExpenses,
      currentMonthlyCashFlow,
      vacancyMonths,
      vacancyMonthlyCashFlow,
      totalVacancyLoss,
      totalExpenseDuringVacancy,
      netVacancyImpact,
      annualRentDuringVacancy,
      annualCashFlowDuringVacancy,
      annualCashFlowImpact,
      currentAnnualCashFlow,
      currentCapRate: selectedProperty.capRate,
      newCapRate,
      currentCashOnCashReturn: selectedProperty.cashOnCashReturn,
      newCashOnCashReturn
    });
  };

  if (!selectedProperty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Unit Vacancy Analysis
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Property
          </label>
          <select
            value={selectedProperty.id}
            onChange={(e) => {
              const property = properties.find(p => p.id === e.target.value);
              setSelectedProperty(property);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.nickname} - ${property.monthlyRent.toLocaleString()}/month rent
              </option>
            ))}
          </select>
        </div>

        {/* Current Performance Display */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Performance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Monthly Rent</div>
              <div className="font-semibold text-green-600 dark:text-green-400">
                +${selectedProperty.monthlyRent.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Monthly Expenses</div>
              <div className="font-semibold text-red-600 dark:text-red-400">
                -${selectedProperty.monthlyExpenses.total.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Monthly Cash Flow</div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                ${selectedProperty.monthlyCashFlow.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Vacancy Duration Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vacancy Duration (months)
          </label>
          <Input
            type="number"
            min="1"
            max="12"
            value={vacancyMonths}
            onChange={(e) => setVacancyMonths(parseInt(e.target.value) || 1)}
            placeholder="Enter months"
          />
        </div>

        <Button onClick={calculateVacancyImpact} className="w-full">
          Analyze Vacancy Impact
        </Button>

        {/* Results */}
        {analysisResults && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Vacancy Impact Analysis</h4>
            
            {/* Vacancy Period Impact */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-red-900 dark:text-red-300 mb-2">
                During {analysisResults.vacancyMonths} Month{analysisResults.vacancyMonths > 1 ? 's' : ''} Vacancy
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-red-700 dark:text-red-300">Lost Rent</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    -${analysisResults.totalVacancyLoss.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-red-700 dark:text-red-300">Ongoing Expenses</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    -${analysisResults.totalExpenseDuringVacancy.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-red-700 dark:text-red-300">Net Impact</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${analysisResults.netVacancyImpact.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Annual Cash Flow Impact</h5>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${analysisResults.annualCashFlowImpact.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  vs. normal: ${analysisResults.currentAnnualCashFlow.toLocaleString()}
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h5 className="font-medium text-orange-900 dark:text-orange-300 mb-2">Effective Annual Rent</h5>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${analysisResults.annualRentDuringVacancy.toLocaleString()}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {12 - analysisResults.vacancyMonths} months of rent
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Cap Rate Impact</h5>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {analysisResults.newCapRate.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysisResults.newCapRate > analysisResults.currentCapRate ? '+' : ''}
                  {(analysisResults.newCapRate - analysisResults.currentCapRate).toFixed(2)}%
                  vs. normal {analysisResults.currentCapRate.toFixed(2)}%
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">Cash-on-Cash Return</h5>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {analysisResults.newCashOnCashReturn.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysisResults.newCashOnCashReturn > analysisResults.currentCashOnCashReturn ? '+' : ''}
                  {(analysisResults.newCashOnCashReturn - analysisResults.currentCashOnCashReturn).toFixed(2)}%
                  vs. normal {analysisResults.currentCashOnCashReturn.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Key Insights</h5>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Each month of vacancy costs ${(analysisResults.currentMonthlyRent + analysisResults.currentMonthlyExpenses).toLocaleString()}</li>
                <li>• Annual cash flow reduced by ${Math.abs(analysisResults.annualCashFlowImpact).toLocaleString()}</li>
                <li>• Consider tenant retention strategies to minimize vacancy risk</li>
                <li>• Factor vacancy allowance into investment analysis (typically 5-10% of annual rent)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
