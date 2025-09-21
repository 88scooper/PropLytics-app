"use client";

import { useState } from 'react';
import { getAllProperties } from '@/lib/propertyData';
import RentChangeScenario from './RentChangeScenario';
import ExpenseChangeScenario from './ExpenseChangeScenario';
import UnitVacancyScenario from './UnitVacancyScenario';
import SellPropertyScenario from './SellPropertyScenario';
import LumpSumPaymentScenario from './LumpSumPaymentScenario';
import LumpSumPaymentScenarioEnhanced from './LumpSumPaymentScenarioEnhanced';
import RefinanceMortgageScenario from './RefinanceMortgageScenario';
import MortgageRenewalScenario from './MortgageRenewalScenario';

const scenarios = [
  {
    id: 'rent-change',
    title: 'Rent Change',
    description: 'Model a rent increase or decrease',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
    component: RentChangeScenario
  },
  {
    id: 'expense-change',
    title: 'Expense Change',
    description: 'Simulate a change in operating costs like taxes or insurance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    component: ExpenseChangeScenario
  },
  {
    id: 'unit-vacancy',
    title: 'Unit Vacancy',
    description: 'Forecast the impact of a vacant unit',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    component: UnitVacancyScenario
  },
  {
    id: 'lump-sum-payment',
    title: 'Lump Sum Payment',
    description: 'Analyze a one-time mortgage payment',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    component: LumpSumPaymentScenarioEnhanced
  },
  {
    id: 'refinance-mortgage',
    title: 'Refinance Mortgage',
    description: 'Model replacing your mortgage with a new loan',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    component: RefinanceMortgageScenario
  },
  {
    id: 'mortgage-renewal',
    title: 'Mortgage Renewal',
    description: 'Simulate renewing your mortgage at a new rate',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    component: MortgageRenewalScenario
  },
  {
    id: 'heloc',
    title: 'HELOC',
    description: 'Model drawing from or paying down a Home Equity Line of Credit',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    component: null // TODO: Implement
  },
  {
    id: 'renovation',
    title: 'Renovation',
    description: 'Analyze the cost and return of a renovation',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    component: null // TODO: Implement
  },
  {
    id: 'sell-property',
    title: 'Sell Property',
    description: 'Forecast the net profit from selling the property',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    component: SellPropertyScenario
  }
];

export default function ScenarioAnalysisDashboard() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const properties = getAllProperties();

  const handleScenarioSelect = (scenario) => {
    if (scenario.component) {
      setActiveScenario(scenario);
    } else {
      alert(`${scenario.title} analysis is coming soon!`);
    }
  };

  const handleCloseScenario = () => {
    setActiveScenario(null);
  };

  if (activeScenario) {
    const ScenarioComponent = activeScenario.component;
    return (
      <ScenarioComponent 
        propertyId={selectedProperty?.id}
        onClose={handleCloseScenario}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Scenario Analysis</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Model different scenarios to understand their impact on your property investments
        </p>
      </div>

      {/* Property Selection */}
      {properties.length > 1 && (
        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Property for Analysis
            </label>
            <select
              value={selectedProperty?.id || ''}
              onChange={(e) => {
                const property = properties.find(p => p.id === e.target.value);
                setSelectedProperty(property);
              }}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="">All Properties (will prompt for selection)</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.nickname} - ${property.rent.monthlyRent.toLocaleString()}/month
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario) => (
          <div
            key={scenario.id}
            onClick={() => handleScenarioSelect(scenario)}
            className={`group block rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:shadow-gray-200/50 dark:hover:shadow-gray-900/20 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 ${
              scenario.component ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
            }`}
          >
            <div className="p-8">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                    {scenario.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {scenario.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {scenario.description}
                </p>
                {!scenario.component && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
