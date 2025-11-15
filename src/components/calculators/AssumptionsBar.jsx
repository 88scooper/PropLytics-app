"use client";

import { useState } from 'react';
import { HelpCircle, Settings2, Lock, Unlock } from 'lucide-react';
import { SCENARIO_PRESETS } from '@/lib/sensitivity-analysis';

const AssumptionsBar = ({ assumptions, onAssumptionsChange, onSaveClick }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  const [activePreset, setActivePreset] = useState(null);
  const [frozenScenarios, setFrozenScenarios] = useState({
    revenue: false,
    expenses: false,
    vacancy: false,
  });

  const handleInputChange = (field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onAssumptionsChange({
        ...assumptions,
        [field]: numValue
      });
      // Clear active preset when user manually changes an input
      setActivePreset(null);
    }
  };

  const toggleScenario = (scenario) => {
    setFrozenScenarios(prev => {
      // If clicking the same scenario, toggle it off (all inputs editable)
      if (prev[scenario]) {
        return {
          revenue: false,
          expenses: false,
          vacancy: false,
        };
      }
      // Otherwise, activate only this scenario (freeze all others)
      return {
        revenue: false,
        expenses: false,
        vacancy: false,
        [scenario]: true,
      };
    });
  };

  const applyPreset = (presetName) => {
    const preset = SCENARIO_PRESETS[presetName];
    if (preset) {
      onAssumptionsChange(preset);
      setActivePreset(presetName);
    }
  };

  const isPresetActive = (presetName) => {
    if (activePreset !== presetName) return false;
    const preset = SCENARIO_PRESETS[presetName];
    return Object.keys(preset).every(key => 
      Math.abs(assumptions[key] - preset[key]) < 0.01
    );
  };

  const inputFields = [
    {
      id: 'annualRentIncrease',
      label: 'Rent Growth',
      tooltip: 'Expected percentage increase in rental income each year. Historical average is 2-3% in major Canadian cities.',
      suffix: '%',
      step: '0.1',
      compact: true,
      frozenBy: 'revenue'
    },
    {
      id: 'annualExpenseInflation',
      label: 'Expense Inflation',
      tooltip: 'Expected percentage increase in operating expenses each year (property tax, insurance, maintenance, etc.).',
      suffix: '%',
      step: '0.1',
      compact: true,
      frozenBy: 'expenses'
    },
    {
      id: 'annualPropertyAppreciation',
      label: 'Property Appreciation',
      tooltip: 'Expected percentage increase in property value each year. Historical average varies by market, typically 3-5%.',
      suffix: '%',
      step: '0.1',
      compact: true
    },
    {
      id: 'vacancyRate',
      label: 'Vacancy Rate',
      tooltip: 'Expected percentage of time the property will be vacant. A 5% allowance is standard for long-term rentals.',
      suffix: '%',
      step: '0.1',
      compact: true,
      frozenBy: 'vacancy'
    },
    {
      id: 'futureInterestRate',
      label: 'Future Interest Rate',
      tooltip: 'Expected mortgage interest rate for renewals. Use this to model what happens when your current term expires.',
      suffix: '%',
      step: '0.1',
      compact: true
    },
    {
      id: 'exitCapRate',
      label: 'Exit Cap Rate',
      tooltip: 'The capitalization rate used to determine the future sale price. Future Sale Price = Final Year NOI / Exit Cap Rate. Typically 0.5-1% higher than entry cap rate.',
      suffix: '%',
      step: '0.1',
      compact: true
    }
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Forecast Assumptions
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {onSaveClick && (
            <button
              onClick={onSaveClick}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md 
                       hover:bg-blue-700 transition-colors"
            >
              Save Scenario
            </button>
          )}
        </div>
      </div>

      {/* Scenario Presets */}
      <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Presets:</span>
          <button
            onClick={() => applyPreset('conservative')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isPresetActive('conservative')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Conservative
          </button>
          <button
            onClick={() => applyPreset('standard')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isPresetActive('standard')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => applyPreset('aggressive')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              isPresetActive('aggressive')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            Aggressive
          </button>
        </div>
      </div>

      {/* Scenario Toggles */}
      <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Scenario Focus:</span>
          <button
            onClick={() => toggleScenario('revenue')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              frozenScenarios.revenue
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {frozenScenarios.revenue ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
            Revenue
          </button>
          <button
            onClick={() => toggleScenario('expenses')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              frozenScenarios.expenses
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {frozenScenarios.expenses ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
            Expenses
          </button>
          <button
            onClick={() => toggleScenario('vacancy')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              frozenScenarios.vacancy
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {frozenScenarios.vacancy ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
            Vacancy
          </button>
        </div>
      </div>

      {/* Always Visible Controls */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {inputFields.map((field) => {
            // Check if any scenario focus is active
            const hasActiveFocus = frozenScenarios.revenue || frozenScenarios.expenses || frozenScenarios.vacancy;
            // If a focus is active, freeze this input unless it's the one related to the active focus
            const isFrozen = hasActiveFocus && (!field.frozenBy || !frozenScenarios[field.frozenBy]);
            
            return (
              <div key={field.id} className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  {isFrozen && (
                    <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  )}
                  <div className="relative inline-block">
                    <HelpCircle
                      className="w-3 h-3 text-gray-400 cursor-help"
                      onMouseEnter={() => setShowTooltip(field.id)}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === field.id && (
                      <div className="absolute left-4 top-0 z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none">
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
                    disabled={isFrozen}
                    className={`w-full px-3 py-1.5 pr-7 text-sm border rounded-md transition-colors ${
                      isFrozen
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-xs font-medium">
                    {field.suffix}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
          <button
            onClick={() => onAssumptionsChange({
              annualRentIncrease: 2.0,
              annualExpenseInflation: 2.5,
              annualPropertyAppreciation: 3.0,
              vacancyRate: 5.0,
              futureInterestRate: 5.0,
              exitCapRate: 5.0,
            })}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                     font-medium transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssumptionsBar;

