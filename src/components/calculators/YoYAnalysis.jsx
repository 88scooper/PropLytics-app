"use client";

import { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';

/**
 * YoY Analysis Component
 * 
 * Displays year-over-year performance metrics for property analysis
 * Shows historical trends and projected YoY changes based on sensitivity assumptions
 */
export default function YoYAnalysis({ property, assumptions, baselineAssumptions }) {
  // Calculate YoY metrics
  const yoyMetrics = useMemo(() => {
    if (!property) return null;

    // Historical data for YoY calculations
    const historicalDataMap = {
      'richmond-st-e-403': [
        { year: '2023', income: 40200, expenses: 23493.77, cashFlow: 16706.23 },
        { year: '2024', income: 41323.03, expenses: 17399.9, cashFlow: 23923.13 },
        { year: '2025', income: 41400, expenses: 17400, cashFlow: 24000 }
      ],
      'tretti-way-317': [
        { year: '2024', income: 36000, expenses: 2567.21, cashFlow: 33432.79 },
        { year: '2025', income: 36000, expenses: 2537.5, cashFlow: 33462.5 }
      ],
      'wilson-ave-415': [
        { year: '2025', income: 28800, expenses: 10237.2, cashFlow: 18562.8 }
      ]
    };

    const historicalData = historicalDataMap[property.id] || [];
    const currentYear = new Date().getFullYear().toString();
    const previousYear = (new Date().getFullYear() - 1).toString();

    // Find current and previous year data
    const currentYearData = historicalData.find(d => d.year === currentYear);
    const previousYearData = historicalData.find(d => d.year === previousYear);

    // Calculate historical YoY changes
    const calculateYoYChange = (current, previous) => {
      if (!current || !previous || previous === 0) return null;
      return ((current - previous) / previous) * 100;
    };

    const historicalYoY = {
      revenue: currentYearData && previousYearData 
        ? calculateYoYChange(currentYearData.income, previousYearData.income)
        : null,
      expenses: currentYearData && previousYearData 
        ? calculateYoYChange(currentYearData.expenses, previousYearData.expenses)
        : null,
      cashFlow: currentYearData && previousYearData 
        ? calculateYoYChange(currentYearData.cashFlow, previousYearData.cashFlow)
        : null
    };

    // Calculate projected YoY changes based on assumptions
    const currentRent = property.rent.monthlyRent * 12;
    const currentExpenses = (property.monthlyExpenses.total - property.monthlyExpenses.mortgagePayment) * 12;
    const currentCashFlow = currentRent - currentExpenses - (property.monthlyExpenses.mortgagePayment * 12);
    
    // Project next year's values based on assumptions
    const projectedRent = currentRent * (1 + assumptions.annualRentIncrease / 100);
    const projectedExpenses = currentExpenses * (1 + assumptions.annualExpenseInflation / 100);
    const projectedCashFlow = projectedRent - projectedExpenses - (property.monthlyExpenses.mortgagePayment * 12);

    const projectedYoY = {
      revenue: ((projectedRent - currentRent) / currentRent) * 100,
      expenses: ((projectedExpenses - currentExpenses) / currentExpenses) * 100,
      cashFlow: currentCashFlow !== 0 ? ((projectedCashFlow - currentCashFlow) / Math.abs(currentCashFlow)) * 100 : 0
    };

    // Calculate baseline projected YoY for comparison
    const baselineProjectedRent = currentRent * (1 + baselineAssumptions.annualRentIncrease / 100);
    const baselineProjectedExpenses = currentExpenses * (1 + baselineAssumptions.annualExpenseInflation / 100);
    const baselineProjectedCashFlow = baselineProjectedRent - baselineProjectedExpenses - (property.monthlyExpenses.mortgagePayment * 12);

    const baselineProjectedYoY = {
      revenue: ((baselineProjectedRent - currentRent) / currentRent) * 100,
      expenses: ((baselineProjectedExpenses - currentExpenses) / currentExpenses) * 100,
      cashFlow: currentCashFlow !== 0 ? ((baselineProjectedCashFlow - currentCashFlow) / Math.abs(currentCashFlow)) * 100 : 0
    };

    return {
      historical: historicalYoY,
      projected: projectedYoY,
      baselineProjected: baselineProjectedYoY,
      hasHistoricalData: historicalData.length > 1,
      currentYearData,
      previousYearData
    };
  }, [property, assumptions, baselineAssumptions]);

  if (!yoyMetrics) {
    return (
      <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4">Year-over-Year Analysis</h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="text-sm">No property selected for analysis</div>
        </div>
      </div>
    );
  }

  const { historical, projected, baselineProjected, hasHistoricalData, dataRequirement } = yoyMetrics;

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
      <h3 className="text-lg font-semibold mb-4">Year-over-Year Analysis</h3>
      
      {/* Historical YoY Performance */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Historical Performance
          {!dataRequirement.meetsRequirement && (
            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
              (Requires {dataRequirement.requiredYears} years of data - {dataRequirement.availableYears} available)
            </span>
          )}
        </h4>
        
        {dataRequirement.meetsRequirement ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenue Growth</div>
              <div className={`text-sm font-medium ${
                historical.revenue === null 
                  ? 'text-gray-400' 
                  : historical.revenue >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {historical.revenue === null 
                  ? 'N/A' 
                  : `${historical.revenue >= 0 ? '+' : ''}${historical.revenue.toFixed(1)}%`
                }
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expense Growth</div>
              <div className={`text-sm font-medium ${
                historical.expenses === null 
                  ? 'text-gray-400' 
                  : historical.expenses >= 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {historical.expenses === null 
                  ? 'N/A' 
                  : `${historical.expenses >= 0 ? '+' : ''}${historical.expenses.toFixed(1)}%`
                }
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cash Flow Growth</div>
              <div className={`text-sm font-medium ${
                historical.cashFlow === null 
                  ? 'text-gray-400' 
                  : historical.cashFlow >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {historical.cashFlow === null 
                  ? 'N/A' 
                  : `${historical.cashFlow >= 0 ? '+' : ''}${historical.cashFlow.toFixed(1)}%`
                }
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Insufficient Historical Data
              </span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Historical YoY analysis requires at least {dataRequirement.requiredYears} years of expense data. 
              Currently {dataRequirement.availableYears} year{dataRequirement.availableYears !== 1 ? 's' : ''} available. 
              Projected YoY analysis is still available below.
            </p>
          </div>
        )}
      </div>

      {/* Projected YoY Performance */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Projected Next Year Performance</h4>
        <div className="space-y-4">
          {/* Revenue Growth */}
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Revenue Growth</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Baseline: {baselineProjected.revenue >= 0 ? '+' : ''}{baselineProjected.revenue.toFixed(1)}%
              </div>
              <div className={`text-sm font-medium ${
                projected.revenue >= baselineProjected.revenue 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {projected.revenue >= 0 ? '+' : ''}{projected.revenue.toFixed(1)}%
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                projected.revenue >= baselineProjected.revenue 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {projected.revenue >= baselineProjected.revenue ? '↗' : '↘'} 
                {Math.abs(projected.revenue - baselineProjected.revenue).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Expense Growth */}
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Expense Growth</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Baseline: {baselineProjected.expenses >= 0 ? '+' : ''}{baselineProjected.expenses.toFixed(1)}%
              </div>
              <div className={`text-sm font-medium ${
                projected.expenses <= baselineProjected.expenses 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {projected.expenses >= 0 ? '+' : ''}{projected.expenses.toFixed(1)}%
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                projected.expenses <= baselineProjected.expenses 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {projected.expenses <= baselineProjected.expenses ? '↘' : '↗'} 
                {Math.abs(projected.expenses - baselineProjected.expenses).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Cash Flow Growth */}
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cash Flow Growth</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Baseline: {baselineProjected.cashFlow >= 0 ? '+' : ''}{baselineProjected.cashFlow.toFixed(1)}%
              </div>
              <div className={`text-sm font-medium ${
                projected.cashFlow >= baselineProjected.cashFlow 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {projected.cashFlow >= 0 ? '+' : ''}{projected.cashFlow.toFixed(1)}%
              </div>
              <div className={`text-xs px-2 py-1 rounded ${
                projected.cashFlow >= baselineProjected.cashFlow 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {projected.cashFlow >= baselineProjected.cashFlow ? '↗' : '↘'} 
                {Math.abs(projected.cashFlow - baselineProjected.cashFlow).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Insights</h4>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          {projected.revenue > baselineProjected.revenue && (
            <div>• Higher rent growth assumptions will increase revenue by {Math.abs(projected.revenue - baselineProjected.revenue).toFixed(1)}% more than baseline</div>
          )}
          {projected.expenses < baselineProjected.expenses && (
            <div>• Lower expense inflation assumptions will reduce expense growth by {Math.abs(projected.expenses - baselineProjected.expenses).toFixed(1)}% vs baseline</div>
          )}
          {projected.cashFlow > baselineProjected.cashFlow && (
            <div>• Combined assumptions project {Math.abs(projected.cashFlow - baselineProjected.cashFlow).toFixed(1)}% higher cash flow growth than baseline</div>
          )}
          {!dataRequirement.meetsRequirement && (
            <div>• Historical YoY analysis requires at least {dataRequirement.requiredYears} years of data. 
            Currently {dataRequirement.availableYears} year{dataRequirement.availableYears !== 1 ? 's' : ''} available. 
            Projections based on current assumptions.</div>
          )}
        </div>
      </div>
    </div>
  );
}
