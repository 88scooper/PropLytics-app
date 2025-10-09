"use client";

import { useMemo } from 'react';
import { formatPercentage } from '@/utils/formatting';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { getMonthlyMortgagePayment } from '@/utils/mortgageCalculator';

const BreakEvenAnalysis = ({ property }) => {
  // Calculate break-even vacancy rate
  const breakEvenMetrics = useMemo(() => {
    if (!property) return null;

    try {
      // Potential Gross Income (maximum possible rent)
      const potentialGrossIncome = property.rent.monthlyRent * 12;

      // Total Annual Operating Expenses (excluding mortgage)
      const annualOperatingExpenses = (
        (property.monthlyExpenses.propertyTax || 0) +
        (property.monthlyExpenses.condoFees || 0) +
        (property.monthlyExpenses.insurance || 0) +
        (property.monthlyExpenses.maintenance || 0) +
        (property.monthlyExpenses.professionalFees || 0) +
        (property.monthlyExpenses.utilities || 0)
      ) * 12;

      // Total Annual Debt Service (mortgage payments)
      let annualDebtService;
      try {
        const monthlyMortgagePayment = getMonthlyMortgagePayment(property.mortgage);
        annualDebtService = monthlyMortgagePayment * 12;
      } catch (error) {
        console.warn('Error calculating mortgage payment:', error);
        // Fallback calculation
        const monthlyRate = property.mortgage.interestRate / 12;
        const numPayments = property.mortgage.amortizationYears * 12;
        const monthlyPayment = property.mortgage.originalAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
          (Math.pow(1 + monthlyRate, numPayments) - 1);
        annualDebtService = monthlyPayment * 12;
      }

      // Cash Flow Break-Even Vacancy Rate
      // Formula: (Operating Expenses + Debt Service) / Potential Gross Income
      const breakEvenVacancyRate = ((annualOperatingExpenses + annualDebtService) / potentialGrossIncome) * 100;

      // Current vacancy rate (from property or assume 0)
      const currentVacancyRate = property.vacancyRate || 0;

      // Safety margin
      const safetyMargin = breakEvenVacancyRate - currentVacancyRate;

      return {
        breakEvenVacancyRate,
        currentVacancyRate,
        safetyMargin,
        potentialGrossIncome,
        annualOperatingExpenses,
        annualDebtService
      };
    } catch (error) {
      console.error('Error calculating break-even metrics:', error);
      return null;
    }
  }, [property]);

  if (!property || !breakEvenMetrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Select a property to view break-even analysis.
        </p>
      </div>
    );
  }

  const { breakEvenVacancyRate, currentVacancyRate, safetyMargin } = breakEvenMetrics;

  // Determine risk level based on safety margin
  const getRiskLevel = () => {
    if (safetyMargin > 20) {
      return {
        level: 'Low Risk',
        bgClass: 'bg-green-50 dark:bg-green-900/20',
        borderClass: 'border-green-200 dark:border-green-800',
        textClass: 'text-green-900 dark:text-green-300',
        labelClass: 'text-green-700 dark:text-green-400',
        iconBgClass: 'bg-green-100 dark:bg-green-900',
        iconClass: 'text-green-600 dark:text-green-400',
        icon: TrendingUp
      };
    }
    if (safetyMargin > 10) {
      return {
        level: 'Moderate Risk',
        bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderClass: 'border-yellow-200 dark:border-yellow-800',
        textClass: 'text-yellow-900 dark:text-yellow-300',
        labelClass: 'text-yellow-700 dark:text-yellow-400',
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900',
        iconClass: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertCircle
      };
    }
    return {
      level: 'High Risk',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      borderClass: 'border-red-200 dark:border-red-800',
      textClass: 'text-red-900 dark:text-red-300',
      labelClass: 'text-red-700 dark:text-red-400',
      iconBgClass: 'bg-red-100 dark:bg-red-900',
      iconClass: 'text-red-600 dark:text-red-400',
      icon: TrendingDown
    };
  };

  const riskInfo = getRiskLevel();
  const RiskIcon = riskInfo.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        ⚖️ Break-Even Analysis
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Understand your property's risk profile by analyzing the vacancy rate at which you would break even on cash flow.
      </p>

      {/* Main Metric Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
            Cash Flow Break-Even Vacancy Rate
          </h3>
        </div>
        <p className="text-4xl font-bold text-blue-900 dark:text-blue-300 mb-2">
          {formatPercentage(breakEvenVacancyRate)}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Your property would break even on cash flow if vacant {breakEvenVacancyRate.toFixed(1)}% of the time
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Vacancy</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(currentVacancyRate)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your assumed vacancy rate
          </p>
        </div>

        <div className={`${riskInfo.bgClass} border ${riskInfo.borderClass} rounded-lg p-6`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 ${riskInfo.iconBgClass} rounded-lg`}>
              <RiskIcon className={`w-5 h-5 ${riskInfo.iconClass}`} />
            </div>
            <h3 className={`text-lg font-semibold ${riskInfo.textClass}`}>Safety Margin</h3>
          </div>
          <p className={`text-3xl font-bold ${riskInfo.textClass}`}>
            {formatPercentage(Math.abs(safetyMargin))}
          </p>
          <p className={`text-sm ${riskInfo.labelClass}`}>
            {safetyMargin > 0 ? 'Cushion before break-even' : 'Currently below break-even'}
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Risk Assessment: {riskInfo.level}
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {safetyMargin > 20 && (
            <>
              <p className={riskInfo.labelClass}>
                ✓ <strong>Excellent safety margin.</strong> Your property can sustain significant vacancy periods while maintaining positive cash flow.
              </p>
              <p>
                • Even with {formatPercentage(breakEvenVacancyRate)} vacancy, you would still break even on operating costs.
              </p>
            </>
          )}
          
          {safetyMargin > 10 && safetyMargin <= 20 && (
            <>
              <p className={riskInfo.labelClass}>
                ⚠ <strong>Moderate risk level.</strong> Your property has a reasonable buffer, but extended vacancies could impact cash flow.
              </p>
              <p>
                • Consider maintaining an emergency fund to cover {formatPercentage(Math.abs(safetyMargin))} additional vacancy.
              </p>
            </>
          )}
          
          {safetyMargin <= 10 && (
            <>
              <p className={riskInfo.labelClass}>
                ⚠ <strong>High risk level.</strong> Your property has limited cushion for vacancy periods. Even small disruptions could result in negative cash flow.
              </p>
              <p>
                • Consider strategies to reduce expenses or increase rental income to improve your safety margin.
              </p>
              <p>
                • Maintain a robust emergency fund to cover potential vacancy periods.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Additional Context */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm">
          <summary className="font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
            How is this calculated?
          </summary>
          <div className="mt-3 space-y-3 text-gray-600 dark:text-gray-400">
            <p>
              The <strong>Cash Flow Break-Even Vacancy Rate</strong> is calculated as:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs">
              (Total Annual Operating Expenses + Total Annual Debt Service) / Potential Gross Income
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Where:</p>
            <div className="space-y-2 ml-2">
              <div className="flex justify-between items-center">
                <span><strong>Potential Gross Income:</strong></span>
                <span className="font-semibold">${(breakEvenMetrics.potentialGrossIncome).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span><strong>Operating Expenses:</strong></span>
                <span className="font-semibold">${(breakEvenMetrics.annualOperatingExpenses).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span><strong>Debt Service:</strong></span>
                <span className="font-semibold">${(breakEvenMetrics.annualDebtService).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default BreakEvenAnalysis;

