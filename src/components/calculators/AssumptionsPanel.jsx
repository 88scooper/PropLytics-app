"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, Save } from 'lucide-react';

const AssumptionsPanel = ({ assumptions, onAssumptionsChange, onSaveClick }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onAssumptionsChange({
        ...assumptions,
        [field]: numValue
      });
    }
  };

  const inputFields = [
    {
      id: 'annualRentIncrease',
      label: 'Annual Rent Increase',
      tooltip: 'Expected percentage increase in rental income each year. Historical average is 2-3% in major Canadian cities.',
      suffix: '%',
      step: '0.1'
    },
    {
      id: 'annualExpenseInflation',
      label: 'Annual Expense Inflation',
      tooltip: 'Expected percentage increase in operating expenses each year (property tax, insurance, maintenance, etc.).',
      suffix: '%',
      step: '0.1'
    },
    {
      id: 'annualPropertyAppreciation',
      label: 'Annual Property Value Appreciation',
      tooltip: 'Expected percentage increase in property value each year. Historical average varies by market, typically 3-5%.',
      suffix: '%',
      step: '0.1'
    },
    {
      id: 'vacancyRate',
      label: 'Vacancy Rate',
      tooltip: 'Expected percentage of time the property will be vacant. A 5% allowance is standard for long-term rentals.',
      suffix: '%',
      step: '0.1'
    },
    {
      id: 'futureInterestRate',
      label: 'Future Interest Rate',
      tooltip: 'Expected mortgage interest rate for renewals. Use this to model what happens when your current term expires.',
      suffix: '%',
      step: '0.1'
    },
    {
      id: 'exitCapRate',
      label: 'Exit Cap Rate',
      tooltip: 'The capitalization rate used to determine the future sale price. Future Sale Price = Final Year NOI / Exit Cap Rate. Typically 0.5-1% higher than entry cap rate.',
      suffix: '%',
      step: '0.1'
    }
  ];

  // Prevent hydration mismatch by showing loading state until client mounts
  if (!isClient) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          📊 Assumptions Panel
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Loading assumptions...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        📊 Assumptions Panel
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Adjust the assumptions below to see how they impact your investment returns over 10 years.
      </p>

      <div className="space-y-5">
        {inputFields.map((field) => (
          <div key={field.id}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              <div className="relative inline-block">
                <HelpCircle
                  className="w-4 h-4 text-gray-400 cursor-help"
                  onMouseEnter={() => setShowTooltip(field.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                />
                {showTooltip === field.id && (
                  <div className="absolute left-6 top-0 z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                    {field.tooltip}
                    <div className="absolute left-0 top-2 -ml-2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                  </div>
                )}
              </div>
            </label>
            <div className="relative">
              <input
                type="number"
                value={assumptions[field.id]}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                step={field.step}
                min="0"
                max="100"
                className="w-full px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-medium">
                {field.suffix}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {onSaveClick && (
          <button
            onClick={onSaveClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            Save Scenario
          </button>
        )}
        
        <button
          onClick={() => onAssumptionsChange({
            annualRentIncrease: 2.0,
            annualExpenseInflation: 2.5,
            annualPropertyAppreciation: 3.0,
            vacancyRate: 5.0,
            futureInterestRate: 5.0,
            exitCapRate: 5.0,
          })}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                   font-medium transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default AssumptionsPanel;

