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
    if (safetyMargin > 20) return { level: 'Low Risk', color: 'emerald', icon: TrendingUp };
    if (safetyMargin > 10) return { level: 'Moderate Risk', color: 'yellow', icon: AlertCircle };
    return { level: 'High Risk', color: 'red', icon: TrendingDown };
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
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg p-6 mb-6">
        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
          Cash Flow Break-Even Vacancy Rate
        </div>
        <div className="text-4xl font-bold text-blue-900 dark:text-blue-300 mb-2">
          {formatPercentage(breakEvenVacancyRate)}
        </div>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Your property would break even on cash flow if vacant {breakEvenVacancyRate.toFixed(1)}% of the time
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Current Vacancy Assumption
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(currentVacancyRate)}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Your assumed vacancy rate
          </p>
        </div>

        <div className={`bg-${riskInfo.color}-50 dark:bg-${riskInfo.color}-900/20 rounded-lg p-4`}>
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Safety Margin
          </div>
          <div className={`text-2xl font-bold text-${riskInfo.color}-900 dark:text-${riskInfo.color}-300 flex items-center gap-2`}>
            <RiskIcon className="w-6 h-6" />
            {formatPercentage(Math.abs(safetyMargin))}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {safetyMargin > 0 ? 'Cushion before break-even' : 'Currently below break-even'}
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Risk Assessment: {riskInfo.level}
        </h3>
        <div className="space-y-2 text-sm">
          {safetyMargin > 20 && (
            <>
              <p className="text-emerald-700 dark:text-emerald-400">
                ✓ <strong>Excellent safety margin.</strong> Your property can sustain significant vacancy periods while maintaining positive cash flow.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                • Even with {formatPercentage(breakEvenVacancyRate)} vacancy, you would still break even on operating costs.
              </p>
            </>
          )}
          
          {safetyMargin > 10 && safetyMargin <= 20 && (
            <>
              <p className="text-yellow-700 dark:text-yellow-400">
                ⚠ <strong>Moderate risk level.</strong> Your property has a reasonable buffer, but extended vacancies could impact cash flow.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                • Consider maintaining an emergency fund to cover {formatPercentage(Math.abs(safetyMargin))} additional vacancy.
              </p>
            </>
          )}
          
          {safetyMargin <= 10 && (
            <>
              <p className="text-red-700 dark:text-red-400">
                ⚠ <strong>High risk level.</strong> Your property has limited cushion for vacancy periods. Even small disruptions could result in negative cash flow.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                • Consider strategies to reduce expenses or increase rental income to improve your safety margin.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                • Maintain a robust emergency fund to cover potential vacancy periods.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Additional Context */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm">
          <summary className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white">
            How is this calculated?
          </summary>
          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              The <strong>Cash Flow Break-Even Vacancy Rate</strong> is calculated as:
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-xs">
              (Total Annual Operating Expenses + Total Annual Debt Service) / Potential Gross Income
            </div>
            <p className="mt-2">Where:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Potential Gross Income:</strong> Maximum possible annual rent (${(breakEvenMetrics.potentialGrossIncome).toLocaleString()})</li>
              <li><strong>Operating Expenses:</strong> Annual costs excluding mortgage (${(breakEvenMetrics.annualOperatingExpenses).toLocaleString()})</li>
              <li><strong>Debt Service:</strong> Annual mortgage payments (${(breakEvenMetrics.annualDebtService).toLocaleString()})</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default BreakEvenAnalysis;

