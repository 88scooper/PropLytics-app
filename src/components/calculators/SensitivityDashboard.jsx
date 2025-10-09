"use client";

import { useMemo } from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { calculateReturnMetrics, compareScenarios, DEFAULT_ASSUMPTIONS } from '@/lib/sensitivity-analysis';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SensitivityDashboard = ({ property, assumptions }) => {
  // Calculate baseline metrics (using default assumptions)
  const baselineMetrics = useMemo(() => {
    if (!property) return null;
    return calculateReturnMetrics(property, DEFAULT_ASSUMPTIONS);
  }, [property]);

  // Calculate new scenario metrics (using user-adjusted assumptions)
  const newScenarioMetrics = useMemo(() => {
    if (!property) return null;
    return calculateReturnMetrics(property, assumptions);
  }, [property, assumptions]);

  // Compare scenarios
  const comparison = useMemo(() => {
    if (!baselineMetrics || !newScenarioMetrics) return null;
    return compareScenarios(baselineMetrics, newScenarioMetrics);
  }, [baselineMetrics, newScenarioMetrics]);

  if (!property || !baselineMetrics || !newScenarioMetrics || !comparison) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Select a property to view sensitivity analysis.
        </p>
      </div>
    );
  }

  const metrics = [
    {
      label: '10-Year IRR (Internal Rate of Return)',
      description: 'Annualized return considering all cash flows and property appreciation',
      baseline: baselineMetrics.irr,
      newScenario: newScenarioMetrics.irr,
      difference: comparison.irr.difference,
      percentChange: comparison.irr.percentChange,
      formatter: (val) => `${val.toFixed(2)}%`,
      higherIsBetter: true
    },
    {
      label: 'Average Annual Cash Flow',
      description: 'Mean net cash flow per year after all expenses and debt service',
      baseline: baselineMetrics.averageAnnualCashFlow,
      newScenario: newScenarioMetrics.averageAnnualCashFlow,
      difference: comparison.averageAnnualCashFlow.difference,
      percentChange: comparison.averageAnnualCashFlow.percentChange,
      formatter: (val) => formatCurrency(val),
      higherIsBetter: true
    },
    {
      label: 'Total Profit at Sale (Year 10)',
      description: 'Total profit if property is sold at end of year 10 (equity + cumulative cash flow - initial investment)',
      baseline: baselineMetrics.totalProfitAtSale,
      newScenario: newScenarioMetrics.totalProfitAtSale,
      difference: comparison.totalProfitAtSale.difference,
      percentChange: comparison.totalProfitAtSale.percentChange,
      formatter: (val) => formatCurrency(val),
      higherIsBetter: true
    }
  ];

  const getComparisonIcon = (difference, higherIsBetter) => {
    if (Math.abs(difference) < 0.01) {
      return <Minus className="w-5 h-5 text-gray-400" />;
    }
    if ((difference > 0 && higherIsBetter) || (difference < 0 && !higherIsBetter)) {
      return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
    return <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  const getComparisonColor = (difference, higherIsBetter) => {
    if (Math.abs(difference) < 0.01) {
      return 'text-gray-600 dark:text-gray-400';
    }
    if ((difference > 0 && higherIsBetter) || (difference < 0 && !higherIsBetter)) {
      return 'text-emerald-600 dark:text-emerald-400 font-semibold';
    }
    return 'text-red-600 dark:text-red-400 font-semibold';
  };

  const getComparisonBg = (difference, higherIsBetter) => {
    if (Math.abs(difference) < 0.01) {
      return 'bg-gray-50 dark:bg-gray-700/50';
    }
    if ((difference > 0 && higherIsBetter) || (difference < 0 && !higherIsBetter)) {
      return 'bg-emerald-50 dark:bg-emerald-900/20';
    }
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        🎯 Sensitivity Analysis Dashboard
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Compare baseline scenario with your adjusted assumptions. Green indicates improvement, red indicates decline.
      </p>

      <div className="space-y-6">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Metric Header */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {metric.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {metric.description}
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              {/* Baseline */}
              <div className="p-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Baseline
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.formatter(metric.baseline)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Default assumptions
                </div>
              </div>

              {/* New Scenario */}
              <div className={`p-4 ${getComparisonBg(metric.difference, metric.higherIsBetter)}`}>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  New Scenario
                </div>
                <div className={`text-2xl font-bold ${getComparisonColor(metric.difference, metric.higherIsBetter)}`}>
                  {metric.formatter(metric.newScenario)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {getComparisonIcon(metric.difference, metric.higherIsBetter)}
                  <span className={`text-xs ${getComparisonColor(metric.difference, metric.higherIsBetter)}`}>
                    {metric.difference > 0 ? '+' : ''}{metric.formatter(metric.difference)}
                  </span>
                </div>
              </div>

              {/* Change */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  % Change
                </div>
                <div className={`text-2xl font-bold ${getComparisonColor(metric.difference, metric.higherIsBetter)}`}>
                  {metric.percentChange > 0 ? '+' : ''}{metric.percentChange.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  vs. baseline
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          💡 Key Insights
        </h3>
        <div className="space-y-2 text-sm">
          {comparison.irr.difference > 0 ? (
            <p className="text-emerald-700 dark:text-emerald-400">
              ✓ Your adjusted assumptions project a <strong>{comparison.irr.percentChange.toFixed(1)}% higher IRR</strong>, 
              suggesting more favorable investment conditions.
            </p>
          ) : comparison.irr.difference < 0 ? (
            <p className="text-red-700 dark:text-red-400">
              ⚠ Your adjusted assumptions project a <strong>{Math.abs(comparison.irr.percentChange).toFixed(1)}% lower IRR</strong>, 
              suggesting less favorable investment conditions.
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              → Your adjusted assumptions result in similar returns to the baseline.
            </p>
          )}

          {Math.abs(comparison.averageAnnualCashFlow.difference) > 1000 && (
            <p className="text-gray-600 dark:text-gray-400">
              • Average annual cash flow changes by <strong>{formatCurrency(Math.abs(comparison.averageAnnualCashFlow.difference))}</strong> per year,
              totaling <strong>{formatCurrency(Math.abs(comparison.averageAnnualCashFlow.difference) * 10)}</strong> over 10 years.
            </p>
          )}

          {Math.abs(comparison.totalProfitAtSale.difference) > 10000 && (
            <p className="text-gray-600 dark:text-gray-400">
              • If you sell at year 10, your total profit would be <strong>{formatCurrency(Math.abs(comparison.totalProfitAtSale.difference))} 
              {comparison.totalProfitAtSale.difference > 0 ? ' higher' : ' lower'}</strong> than baseline.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensitivityDashboard;

