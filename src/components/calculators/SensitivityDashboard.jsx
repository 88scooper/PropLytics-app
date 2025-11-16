"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { calculateReturnMetrics, compareScenarios, calculateYoYMetrics, DEFAULT_ASSUMPTIONS } from '@/lib/sensitivity-analysis';
import { TrendingUp, TrendingDown, Minus, Target, ChevronDown, Lightbulb, Check, ArrowRight, AlertTriangle } from 'lucide-react';
import MetricCardSkeleton from '@/components/analytics/MetricCardSkeleton';

const SensitivityDashboard = ({ property, assumptions }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [baselineMetrics, setBaselineMetrics] = useState(null);
  const [newScenarioMetrics, setNewScenarioMetrics] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [yoyMetrics, setYoyMetrics] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const dropdownRef = useRef(null);

  // Calculate metrics with loading state
  useEffect(() => {
    if (!property) {
      setBaselineMetrics(null);
      setNewScenarioMetrics(null);
      setComparison(null);
      setYoyMetrics(null);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      try {
        const baseline = calculateReturnMetrics(property, DEFAULT_ASSUMPTIONS);
        const newScenario = calculateReturnMetrics(property, assumptions);
        const comp = compareScenarios(baseline, newScenario);
        const yoy = calculateYoYMetrics(property, assumptions, DEFAULT_ASSUMPTIONS);

        setBaselineMetrics(baseline);
        setNewScenarioMetrics(newScenario);
        setComparison(comp);
        setYoyMetrics(yoy);
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [property, assumptions]);


  if (!property) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 shadow-sm" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          disabled
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Sensitivity Analysis Dashboard
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="px-4 pb-4">
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-sm">Select a property to view sensitivity analysis</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isCalculating || !baselineMetrics || !newScenarioMetrics || !comparison) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 shadow-sm" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">
              Sensitivity Analysis Dashboard
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-black/10 dark:border-white/10">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Compare baseline scenario with your adjusted assumptions. Green indicates improvement, red indicates decline.
            </p>
            <MetricCardSkeleton count={3} />
          </div>
        )}
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

  // Add YoY metrics if available
  const yoyMetricsArray = yoyMetrics ? [
    {
      label: 'Next Year Revenue Growth',
      description: 'Projected year-over-year revenue growth based on rent increase assumptions',
      baseline: yoyMetrics.baselineProjected.revenue,
      newScenario: yoyMetrics.projected.revenue,
      difference: yoyMetrics.projected.revenue - yoyMetrics.baselineProjected.revenue,
      percentChange: yoyMetrics.baselineProjected.revenue !== 0 ? 
        ((yoyMetrics.projected.revenue - yoyMetrics.baselineProjected.revenue) / Math.abs(yoyMetrics.baselineProjected.revenue)) * 100 : 0,
      formatter: (val) => `${val.toFixed(1)}%`,
      higherIsBetter: true
    },
    {
      label: 'Next Year Expense Growth',
      description: 'Projected year-over-year expense growth based on inflation assumptions',
      baseline: yoyMetrics.baselineProjected.expenses,
      newScenario: yoyMetrics.projected.expenses,
      difference: yoyMetrics.projected.expenses - yoyMetrics.baselineProjected.expenses,
      percentChange: yoyMetrics.baselineProjected.expenses !== 0 ? 
        ((yoyMetrics.projected.expenses - yoyMetrics.baselineProjected.expenses) / Math.abs(yoyMetrics.baselineProjected.expenses)) * 100 : 0,
      formatter: (val) => `${val.toFixed(1)}%`,
      higherIsBetter: false // Lower expense growth is better
    },
    {
      label: 'Next Year Cash Flow Growth',
      description: 'Projected year-over-year cash flow growth based on combined assumptions',
      baseline: yoyMetrics.baselineProjected.cashFlow,
      newScenario: yoyMetrics.projected.cashFlow,
      difference: yoyMetrics.projected.cashFlow - yoyMetrics.baselineProjected.cashFlow,
      percentChange: yoyMetrics.baselineProjected.cashFlow !== 0 ? 
        ((yoyMetrics.projected.cashFlow - yoyMetrics.baselineProjected.cashFlow) / Math.abs(yoyMetrics.baselineProjected.cashFlow)) * 100 : 0,
      formatter: (val) => `${val.toFixed(1)}%`,
      higherIsBetter: true
    }
  ] : [];

  const allMetrics = [...metrics, ...yoyMetricsArray];

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
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-black/10 dark:border-white/10 shadow-sm" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-semibold text-gray-900 dark:text-white">
            Sensitivity Analysis Dashboard
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-black/10 dark:border-white/10">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Compare baseline scenario with your adjusted assumptions. Green indicates improvement, red indicates decline.
          </p>

      <div className="space-y-6">
        {allMetrics.map((metric, index) => (
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
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Key Insights
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          {comparison.irr.difference > 0 ? (
            <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your adjusted assumptions project a <strong>{comparison.irr.percentChange.toFixed(1)}% higher IRR</strong>, 
                suggesting more favorable investment conditions.
              </p>
            </div>
          ) : comparison.irr.difference < 0 ? (
            <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your adjusted assumptions project a <strong>{Math.abs(comparison.irr.percentChange).toFixed(1)}% lower IRR</strong>, 
                suggesting less favorable investment conditions.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your adjusted assumptions result in similar returns to the baseline.
              </p>
            </div>
          )}

          {Math.abs(comparison.averageAnnualCashFlow.difference) > 1000 && (
            <p className="text-gray-600 dark:text-gray-400">
              Average annual cash flow changes by <strong>{formatCurrency(Math.abs(comparison.averageAnnualCashFlow.difference))}</strong> per year,
              totaling <strong>{formatCurrency(Math.abs(comparison.averageAnnualCashFlow.difference) * 10)}</strong> over 10 years.
            </p>
          )}

          {Math.abs(comparison.totalProfitAtSale.difference) > 10000 && (
            <p className="text-gray-600 dark:text-gray-400">
              If you sell at year 10, your total profit would be <strong>{formatCurrency(Math.abs(comparison.totalProfitAtSale.difference))} 
              {comparison.totalProfitAtSale.difference > 0 ? ' higher' : ' lower'}</strong> than baseline.
            </p>
          )}

          {/* YoY Insights */}
          {yoyMetrics && (
            <>
              {Math.abs(yoyMetrics.projected.revenue - yoyMetrics.baselineProjected.revenue) > 0.5 && (
                <p className="text-gray-600 dark:text-gray-400">
                  Your rent growth assumptions will impact next year's revenue by <strong>
                    {Math.abs(yoyMetrics.projected.revenue - yoyMetrics.baselineProjected.revenue).toFixed(1)}%
                  </strong> {yoyMetrics.projected.revenue > yoyMetrics.baselineProjected.revenue ? 'more' : 'less'} than baseline.
                </p>
              )}
              
              {Math.abs(yoyMetrics.projected.expenses - yoyMetrics.baselineProjected.expenses) > 0.5 && (
                <p className="text-gray-600 dark:text-gray-400">
                  Your expense inflation assumptions will impact next year's expenses by <strong>
                    {Math.abs(yoyMetrics.projected.expenses - yoyMetrics.baselineProjected.expenses).toFixed(1)}%
                  </strong> {yoyMetrics.projected.expenses < yoyMetrics.baselineProjected.expenses ? 'less' : 'more'} than baseline.
                </p>
              )}
              
              {Math.abs(yoyMetrics.projected.cashFlow - yoyMetrics.baselineProjected.cashFlow) > 1 && (
                <p className="text-gray-600 dark:text-gray-400">
                  Combined assumptions will impact next year's cash flow growth by <strong>
                    {Math.abs(yoyMetrics.projected.cashFlow - yoyMetrics.baselineProjected.cashFlow).toFixed(1)}%
                  </strong> {yoyMetrics.projected.cashFlow > yoyMetrics.baselineProjected.cashFlow ? 'more' : 'less'} than baseline.
                </p>
              )}
            </>
          )}
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default SensitivityDashboard;

