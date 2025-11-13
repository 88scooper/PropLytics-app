"use client";

import { useState, useEffect } from 'react';
import { HelpCircle, Save, TrendingUp, TrendingDown, Home, Sparkles } from 'lucide-react';

const SCENARIO_MODES = {
  CUSTOM: 'custom',
  RENT_CHANGE: 'rent-change',
  EXPENSE_CHANGE: 'expense-change',
  UNIT_VACANCY: 'unit-vacancy',
};

const scenarioConfigs = {
  [SCENARIO_MODES.CUSTOM]: {
    label: 'Custom Analysis',
    description: 'Adjust all assumptions freely',
    icon: null,
    editableFields: ['annualRentIncrease', 'annualExpenseInflation', 'annualPropertyAppreciation', 'vacancyRate', 'futureInterestRate', 'exitCapRate'],
  },
  [SCENARIO_MODES.RENT_CHANGE]: {
    label: 'Rent Change Scenario',
    description: 'Focus on how rent changes affect returns',
    icon: TrendingUp,
    editableFields: ['annualRentIncrease'],
  },
  [SCENARIO_MODES.EXPENSE_CHANGE]: {
    label: 'Expense Change Scenario',
    description: 'See how expense changes impact cash flow',
    icon: TrendingDown,
    editableFields: ['annualExpenseInflation'],
  },
  [SCENARIO_MODES.UNIT_VACANCY]: {
    label: 'Unit Vacancy Scenario',
    description: 'Model the impact of vacancy on performance',
    icon: Home,
    editableFields: ['vacancyRate'],
  },
};

// Preset templates
const PRESET_TEMPLATES = {
  conservative: {
    name: 'Conservative',
    description: 'Cautious growth assumptions with higher vacancy and interest rates',
    values: {
      annualRentIncrease: 2.0,
      annualExpenseInflation: 3.0,
      annualPropertyAppreciation: 2.0,
      vacancyRate: 7.0,
      futureInterestRate: 5.5,
      exitCapRate: 5.5,
    },
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced assumptions based on market averages',
    values: {
      annualRentIncrease: 3.0,
      annualExpenseInflation: 2.5,
      annualPropertyAppreciation: 3.5,
      vacancyRate: 5.0,
      futureInterestRate: 5.0,
      exitCapRate: 5.0,
    },
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Optimistic growth with lower vacancy and interest rates',
    values: {
      annualRentIncrease: 5.0,
      annualExpenseInflation: 2.0,
      annualPropertyAppreciation: 5.0,
      vacancyRate: 3.0,
      futureInterestRate: 4.5,
      exitCapRate: 4.5,
    },
  },
};

const AssumptionsPanel = ({ assumptions, onAssumptionsChange, onSaveClick }) => {
  const [showTooltip, setShowTooltip] = useState(null);
  const [scenarioMode, setScenarioMode] = useState(SCENARIO_MODES.CUSTOM);
  const [selectedTemplate, setSelectedTemplate] = useState('moderate');

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

  const currentScenario = scenarioConfigs[scenarioMode];
  const isFieldEditable = (fieldId) => currentScenario.editableFields.includes(fieldId);

  const handleScenarioModeChange = (mode) => {
    setScenarioMode(mode);
    // Reset to selected template when switching modes
    const template = PRESET_TEMPLATES[selectedTemplate];
    onAssumptionsChange(template ? template.values : PRESET_TEMPLATES.moderate.values);
  };

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = PRESET_TEMPLATES[templateKey];
    if (template) {
      onAssumptionsChange(template.values);
      // Visual feedback: brief highlight animation
      const event = new CustomEvent('templateApplied', { detail: { template: templateKey } });
      window.dispatchEvent(event);
    }
  };

  const handleResetToTemplate = () => {
    const template = PRESET_TEMPLATES[selectedTemplate];
    if (template) {
      onAssumptionsChange(template.values);
    }
  };

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Assumptions
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {scenarioMode === SCENARIO_MODES.CUSTOM
            ? 'Adjust assumptions to model different scenarios'
            : `Focus mode: ${currentScenario.description.toLowerCase()}`}
        </p>
      </div>
      
      {/* Preset Templates */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preset Templates
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESET_TEMPLATES).map(([key, template]) => {
            const isActive = selectedTemplate === key;
            return (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 border-2 border-transparent'
                }`}
                title={template.description}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{template.name}</span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {PRESET_TEMPLATES[selectedTemplate]?.description}
        </p>
      </div>

      {/* Scenario Mode Selector - Compact Pills */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Analysis Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(scenarioConfigs).map(([mode, config]) => {
            const Icon = config.icon;
            const isActive = scenarioMode === mode;
            return (
              <button
                key={mode}
                onClick={() => handleScenarioModeChange(mode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{config.label.replace(' Scenario', '').replace(' Analysis', '')}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Fields - Compact Grid */}
      <div className="space-y-4">
        {inputFields.map((field) => {
          const isEditable = isFieldEditable(field.id);
          return (
            <div key={field.id} className={!isEditable ? 'opacity-50' : ''}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {field.label}
                  <div className="relative inline-block">
                    <HelpCircle
                      className="w-3.5 h-3.5 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-300"
                      onMouseEnter={() => setShowTooltip(field.id)}
                      onMouseLeave={() => setShowTooltip(null)}
                    />
                    {showTooltip === field.id && (
                      <div className="absolute left-5 top-0 z-50 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-md shadow-xl">
                        {field.tooltip}
                        {!isEditable && (
                          <div className="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                            Locked in focus mode
                          </div>
                        )}
                        <div className="absolute left-0 top-2 -ml-1.5 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                      </div>
                    )}
                  </div>
                </label>
                {!isEditable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                    LOCKED
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={assumptions[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  step={field.step}
                  min="0"
                  max="100"
                  disabled={!isEditable}
                  className={`w-full px-3 py-2 pr-8 rounded-md border bg-transparent text-sm transition-colors ${
                    isEditable
                      ? 'border-black/15 dark:border-white/15 text-gray-900 dark:text-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                />
                <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                  isEditable ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {field.suffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 pt-5 border-t border-black/10 dark:border-white/10 space-y-2">
        {onSaveClick && (
          <button
            onClick={onSaveClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                     bg-black text-white dark:bg-white dark:text-gray-900 rounded-md 
                     hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Save Scenario
          </button>
        )}
        
        <button
          onClick={handleResetToTemplate}
          className="w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 
                   font-medium transition-colors py-1.5"
        >
          Reset to {PRESET_TEMPLATES[selectedTemplate]?.name || 'Moderate'}
        </button>
      </div>
    </div>
  );
};

export default AssumptionsPanel;

