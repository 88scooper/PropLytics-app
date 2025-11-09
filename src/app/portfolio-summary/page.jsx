"use client";


import Layout from "@/components/Layout.jsx";
import { RequireAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Settings, GripVertical, Building2, PiggyBank, FileSpreadsheet } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProperties, usePortfolioMetrics, usePropertyContext } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage } from "@/utils/formatting";


const highlightedMetricIds = ['portfolioValue', 'equity', 'mortgageDebt'];

const metricPresets = {
  essentials: {
    label: "Essential View",
    description: "Focus on equity, debt, and cash performance",
    visibleIds: [
      'portfolioValue',
      'equity',
      'mortgageDebt',
      'monthlyCashFlow',
      'netOperatingIncome',
      'overallCapRate'
    ],
  },
  cashFlow: {
    label: "Cash Flow Focus",
    description: "Track income, expenses, and NOI together",
    visibleIds: [
      'portfolioValue',
      'equity',
      'mortgageDebt',
      'annualRevenue',
      'annualExpenses',
      'monthlyCashFlow',
      'netOperatingIncome',
      'blendedCashOnCash'
    ],
  },
  taxPrep: {
    label: "Tax Season",
    description: "See deductible costs and goals at a glance",
    visibleIds: [
      'portfolioValue',
      'equity',
      'mortgageDebt',
      'annualDeductibleExpenses',
      'annualExpenses',
      'financialGoals',
      'portfolioLTV',
      'blendedCashOnCash'
    ],
  },
};

// Sortable Metric Item Component
function SortableMetricItem({ metric, onToggleVisibility }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="checkbox"
        checked={metric.isVisible}
        onChange={() => onToggleVisibility(metric.id)}
        className="w-4 h-4 text-[#205A3E] bg-gray-100 border-gray-300 rounded focus:ring-[#205A3E] focus:ring-2"
      />
      <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">{metric.name}</span>
    </div>
  );
}

const isValidDateValue = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const formatDateDisplay = (value, options, fallback) => {
  if (!value) {
    return fallback ?? "N/A";
  }

  if (!isValidDateValue(value)) {
    return fallback ?? (typeof value === "string" ? value : "N/A");
  }

  return new Date(value).toLocaleDateString("en-CA", options);
};

export default function PortfolioSummaryPage() {
  // Get data from PropertyContext
  const { calculationsComplete } = usePropertyContext();
  const properties = useProperties();
  const portfolioMetrics = usePortfolioMetrics();
  
  // State for settings dropdown visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  // State for expense settings dropdown visibility
  const [isExpenseSettingsOpen, setIsExpenseSettingsOpen] = useState(false);
  const expenseSettingsRef = useRef(null);

  const [activePreset, setActivePreset] = useState(null);

  // Default metrics configuration - Reordered according to new layout
  const defaultMetrics = [
    { id: 'portfolioValue', name: 'Total Estimated Portfolio Value', isVisible: true },
    { id: 'equity', name: 'Total Estimated Equity', isVisible: true },
    { id: 'mortgageDebt', name: 'Total Mortgage Debt', isVisible: true },
    { id: 'annualExpenses', name: 'Total Annual Expenses', isVisible: true },
    { id: 'annualDeductibleExpenses', name: 'Total Annual Deductible Expenses', isVisible: true },
    { id: 'monthlyCashFlow', name: 'Monthly Net Cash Flow', isVisible: true },
    { id: 'netOperatingIncome', name: 'Annual Net Operating Income', isVisible: true },
    { id: 'overallCapRate', name: 'Overall Cap Rate', isVisible: true },
    { id: 'blendedCashOnCash', name: 'Blended Cash on Cash', isVisible: true },
    { id: 'avgRentPerSqFt', name: 'Average Rent Per Square Foot', isVisible: true },
    { id: 'totalProperties', name: 'Total Properties & Units', isVisible: true },
    { id: 'financialGoals', name: 'Financial Goals', isVisible: true },
  ];

  // State for metrics (array of objects to preserve order and visibility)
  const [metrics, setMetrics] = useState(defaultMetrics);


  // State for expense view toggle (Annual Expenses vs Annual Deductible Expenses)
  const [expenseViewType, setExpenseViewType] = useState('annual');

  // State for time period toggle (All Time vs Current Year)
  const [timePeriod, setTimePeriod] = useState('current');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
      if (expenseSettingsRef.current && !expenseSettingsRef.current.contains(event.target)) {
        setIsExpenseSettingsOpen(false);
      }
    };

    if (isSettingsOpen || isExpenseSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen, isExpenseSettingsOpen]);

  // Initialize metrics from localStorage or use default
  useEffect(() => {
    // Force reset to new default order for now
    console.log('Forcing reset to new default metrics order');
    setMetrics(defaultMetrics);
    localStorage.setItem('portfolio-dashboard-layout', JSON.stringify(defaultMetrics));
  }, []);

  // Initialize expense view type from localStorage or use default
  useEffect(() => {
    const savedExpenseView = localStorage.getItem('expense-view-type');
    if (savedExpenseView) {
      setExpenseViewType(savedExpenseView);
    }
  }, []);

  // Initialize time period from localStorage or use default
  useEffect(() => {
    const savedTimePeriod = localStorage.getItem('portfolio-time-period');
    if (savedTimePeriod) {
      setTimePeriod(savedTimePeriod);
    }
  }, []);


  // Save metrics to localStorage whenever metrics change
  useEffect(() => {
    if (metrics.length > 0) {
      localStorage.setItem('portfolio-dashboard-layout', JSON.stringify(metrics));
    }
  }, [metrics]);

  // Save expense view type to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('expense-view-type', expenseViewType);
  }, [expenseViewType]);

  // Save time period to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('portfolio-time-period', timePeriod);
  }, [timePeriod]);

  // Handle metric visibility toggle
  const toggleMetricVisibility = (metricId) => {
    setMetrics(prev => prev.map(metric => 
      metric.id === metricId 
        ? { ...metric, isVisible: !metric.isVisible }
        : metric
    ));
  };

  // Handle expense view type toggle
  const handleExpenseViewChange = (viewType) => {
    setExpenseViewType(viewType);
    setIsExpenseSettingsOpen(false);
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setMetrics((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePresetSelect = (presetKey) => {
    const preset = metricPresets[presetKey];
    if (!preset) return;

    setMetrics((prev) => {
      const presetOrder = preset.visibleIds;
      const updated = prev
        .map((metric) => ({
          ...metric,
          isVisible: presetOrder.includes(metric.id),
        }))
        .sort((a, b) => {
          const aIndex = presetOrder.indexOf(a.id);
          const bIndex = presetOrder.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) {
            return 0;
          }
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      return updated;
    });

    setActivePreset(presetKey);
    setIsSettingsOpen(false);
  };

  // Data is now coming from PropertyContext
  
  // Calculate total monthly expenses
  const totalMonthlyOperatingExpenses = portfolioMetrics.totalMonthlyOperatingExpenses || 0;
  const totalMonthlyDebtService = portfolioMetrics.totalMonthlyDebtService || 0;
  const totalMonthlyExpenses = portfolioMetrics.totalMonthlyExpenses || (totalMonthlyOperatingExpenses + totalMonthlyDebtService);
  const totalAnnualOperatingExpenses = portfolioMetrics.totalAnnualOperatingExpenses || 0;
  const totalAnnualDebtService = portfolioMetrics.totalAnnualDebtService || (totalMonthlyDebtService * 12);

  // Helper function to calculate metrics based on time period
  const getTimePeriodMultiplier = () => {
    return timePeriod === 'all' ? 1 : 1; // For now, both show current year data
  };

  // Helper function to get time period label
  const getTimePeriodLabel = (baseLabel) => {
    if (timePeriod === 'all') {
      return baseLabel.replace('Annual', 'Total').replace('Monthly', 'Average Monthly');
    }
    return baseLabel;
  };

  // Calculate additional metrics
  const totalMortgageDebt = portfolioMetrics.totalMortgageBalance || 0;

  const annualCashFlow = portfolioMetrics.totalAnnualCashFlow || 0;
    const totalRevenue = (portfolioMetrics.totalMonthlyRent || 0) * 12;
    const netOperatingIncome = portfolioMetrics.netOperatingIncome || 0;
  const monthlyCashFlowValue = portfolioMetrics.totalMonthlyCashFlow || 0;

  // Calculate portfolio totals from actual data
  const totalPortfolioValue = portfolioMetrics.totalValue || 0;
  const totalEquity = portfolioMetrics.totalEquity || 0;
  const totalProperties = portfolioMetrics.totalProperties || 0;
  const totalUnits = properties.reduce((sum, property) => sum + (property.units || 0), 0);
  const totalSquareFeet = properties.reduce((sum, property) => sum + (property.size || property.squareFootage || 0), 0);
  const averageRentPerSqFt = totalSquareFeet > 0 ? (portfolioMetrics.totalMonthlyRent || 0) / totalSquareFeet : 0;
  const averageOccupancyRate = portfolioMetrics.averageOccupancy || 0;
  const averageCapRate = portfolioMetrics.averageCapRate || 0;

  const occupiedPropertiesCount = properties.filter((property) => Boolean(property?.tenant?.name)).length;
  const occupancyRate = properties.length > 0 ? occupiedPropertiesCount / properties.length : 0;

  const expenseAggregates = properties.reduce(
    (acc, property) => {
      const monthlyExpenses = property.monthlyExpenses || {};

      acc.propertyTax += (monthlyExpenses.propertyTax || 0) * 12;
      acc.insurance += (monthlyExpenses.insurance || 0) * 12;
      acc.maintenance += (monthlyExpenses.maintenance || 0) * 12;
      acc.utilities += (monthlyExpenses.utilities || 0) * 12;
      acc.condoFees += (monthlyExpenses.condoFees || 0) * 12;
      acc.professionalFees += (monthlyExpenses.professionalFees || 0) * 12;

      return acc;
    },
    {
      propertyTax: 0,
      insurance: 0,
      maintenance: 0,
      utilities: 0,
      condoFees: 0,
      professionalFees: 0,
    }
  );

  const expenseCategoryList = [
    { id: 'propertyTax', label: 'Property Tax', value: expenseAggregates.propertyTax },
    { id: 'insurance', label: 'Insurance', value: expenseAggregates.insurance },
    { id: 'maintenance', label: 'Maintenance', value: expenseAggregates.maintenance },
    { id: 'utilities', label: 'Utilities', value: expenseAggregates.utilities },
    { id: 'condoFees', label: 'Condo Fees', value: expenseAggregates.condoFees },
    { id: 'professionalFees', label: 'Professional Fees', value: expenseAggregates.professionalFees },
  ]
    .filter((category) => category.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const totalTrackedExpenses = expenseCategoryList.reduce((sum, category) => sum + category.value, 0);

  // Calculate new KPIs
  // 1. Overall Cap Rate = Total Annual NOI / Total Estimated Portfolio Value
  const totalAnnualNOI = portfolioMetrics.netOperatingIncome || 0;
  const overallCapRate = totalPortfolioValue > 0 ? (totalAnnualNOI / totalPortfolioValue) * 100 : 0;

  // 2. Portfolio LTV = Total Mortgage Debt / Total Estimated Portfolio Value
  const portfolioLTV = totalPortfolioValue > 0 ? (totalMortgageDebt / totalPortfolioValue) * 100 : 0;

  // 3. Blended Cash on Cash Return = Total Annual Cash Flow Before Tax / Total Initial Cash Invested
  const totalAnnualCashFlowBeforeTax = portfolioMetrics.totalAnnualCashFlow || 0;
  const totalInitialCashInvested = properties.reduce((sum, property) => {
    const hasTotalInvestment = typeof property.totalInvestment === "number" && !Number.isNaN(property.totalInvestment);
    const fallbackDownPayment = Math.max(
      0,
      (property.purchasePrice || 0) - (property.mortgage?.originalAmount || 0)
    );

    return sum + (hasTotalInvestment ? property.totalInvestment : fallbackDownPayment);
  }, 0);
  const blendedCashOnCashReturn = totalInitialCashInvested > 0 ? (totalAnnualCashFlowBeforeTax / totalInitialCashInvested) * 100 : 0;

  // 4. Anticipated Annual Equity Built = Sum of annual principal payments from all mortgages
  // This accounts for rent paid to date and anticipated rent for the remainder of the year
  const annualEquityBuilt = properties.reduce((sum, property) => {
    if (property.mortgage && property.monthlyExpenses?.mortgagePrincipal) {
      // Calculate equity built based on rent paid to date and anticipated rent
      const monthlyPrincipal = property.monthlyExpenses.mortgagePrincipal;
      
      // Calculate anticipated equity built for the full year
      // This assumes consistent rent payments and principal payments
      const anticipatedAnnualEquity = monthlyPrincipal * 12;
      
      return sum + anticipatedAnnualEquity;
    }
    return sum;
  }, 0);

  const capRateTone = overallCapRate >= 5
    ? 'positive'
    : overallCapRate >= 3.5
      ? 'neutral'
      : 'warning';
  const capRateMessage = overallCapRate >= 5
    ? 'Healthy versus GTA benchmark (5–7%).'
    : overallCapRate >= 3.5
      ? 'Slightly below target; review rent and operating costs.'
      : 'Cap rate under 3.5%; prioritize NOI improvements.';

  const ltvTone = portfolioLTV <= 75
    ? 'positive'
    : portfolioLTV <= 85
      ? 'neutral'
      : 'warning';
  const ltvMessage = portfolioLTV <= 75
    ? 'Comfortable cushion under the common 80% lender threshold.'
    : portfolioLTV <= 85
      ? 'Above the ideal 80%; plan to deleverage or grow equity.'
      : 'LTV nearing risk threshold; consider paying down debt.';

  const cashFlowTone = annualCashFlow >= 0 ? 'positive' : 'warning';
  const cashFlowMessage = annualCashFlow >= 0
    ? 'Portfolio is generating positive annual cash flow.'
    : 'Negative cash flow; address vacancy or expense spikes.';

  const cashOnCashTone = blendedCashOnCashReturn >= 8
    ? 'positive'
    : blendedCashOnCashReturn >= 5
      ? 'neutral'
      : 'warning';
  const cashOnCashMessage = blendedCashOnCashReturn >= 8
    ? 'In line with strong cash-on-cash targets (8–12%).'
    : blendedCashOnCashReturn >= 5
      ? 'Slightly below optimal range; evaluate rents or financing.'
      : 'Under 5%; revisit acquisition assumptions or expenses.';

  const periodSummary =
    timePeriod === 'all'
      ? 'Showing lifetime performance since each acquisition.'
      : 'Showing year-to-date performance to help you plan the rest of the year.';

  const highlightedMetrics = metrics.filter(
    (metric) => metric.isVisible && highlightedMetricIds.includes(metric.id)
  );
  const standardMetrics = metrics.filter(
    (metric) => metric.isVisible && !highlightedMetricIds.includes(metric.id)
  );
  const visibleMetricCount = metrics.filter((metric) => metric.isVisible).length;

  // Show loading state until calculations are complete to prevent hydration mismatch
  if (!calculationsComplete) {
    return (
      <RequireAuth>
        <Layout>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E]"></div>
                <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading portfolio data...</span>
              </div>
            </div>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Summary</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Overview of your real estate investment performance and key metrics.
              </p>
              <div
                className="mt-4 text-sm text-gray-500 dark:text-gray-400"
                role="status"
                aria-live="polite"
              >
                {periodSummary}
              </div>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Time Period Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Time Period:</span>
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setTimePeriod('current')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timePeriod === 'current'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Current Year
                  </button>
                  <button
                    onClick={() => setTimePeriod('all')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      timePeriod === 'all'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    All Time
                  </button>
                </div>
              </div>

              {/* Settings Button */}
              <div className="relative" ref={settingsRef}>
                <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Customize portfolio"
              >
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Customization Dropdown */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-black/10 dark:border-white/10 py-4 z-50">
                  <div className="px-4 pb-3 border-b border-black/10 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Customize Metrics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Select which metrics to display on your portfolio
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setMetrics(defaultMetrics);
                          setActivePreset(null);
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Quick views
                    </h4>
                    <div className="mt-3 space-y-2">
                      {Object.entries(metricPresets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => handlePresetSelect(key)}
                          className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                            activePreset === key
                              ? 'border-[#205A3E] bg-[#205A3E]/10 text-[#205A3E] dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-200'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
                          }`}
                        >
                          <span className="block font-medium">{preset.label}</span>
                          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                            {preset.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 max-h-96 overflow-y-auto">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={metrics.map(metric => metric.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {metrics.map((metric) => (
                            <SortableMetricItem
                              key={metric.id}
                              metric={metric}
                              onToggleVisibility={toggleMetricVisibility}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {highlightedMetrics.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {highlightedMetrics.map((metric) => {
                switch (metric.id) {
                  case 'portfolioValue':
                    return (
                      <TopMetricCard
                        key={metric.id}
                        title="Total Estimated Portfolio Value"
                        value={formatCurrency(totalPortfolioValue)}
                        icon={Building2}
                        accent="emerald"
                        supporting={`${formatCurrency(totalEquity)} equity • ${formatCurrency(totalMortgageDebt)} debt`}
                      />
                    );
                  case 'equity': {
                    const projectedEquityCopy = `Projected equity added this calendar year: ${formatCurrency(annualEquityBuilt)}`;

                    return (
                      <TopMetricCard
                        key={metric.id}
                        title="Total Estimated Equity"
                        value={formatCurrency(totalEquity)}
                        icon={PiggyBank}
                        accent="teal"
                        iconBadge="$"
                        iconBadgePosition="top-center"
                        supporting={projectedEquityCopy}
                      />
                    );
                  }
                  case 'mortgageDebt':
                    return (
                      <TopMetricCard
                        key={metric.id}
                        title="Total Mortgage Debt"
                        value={formatCurrency(totalMortgageDebt)}
                        icon={FileSpreadsheet}
                        accent="amber"
                        supporting={`Portfolio LTV ${formatPercentage(portfolioLTV)}`}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}

          <IncomeWaterfallCard
            totalRevenue={totalRevenue}
            operatingExpenses={totalAnnualOperatingExpenses}
            debtService={totalAnnualDebtService}
            netCashFlow={annualCashFlow}
          />

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {visibleMetricCount === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Metrics Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  Please select key performance metrics to display on your dashboard. 
                  Use the settings button above to customize your view.
                </p>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-4 py-2 bg-[#205A3E] text-white rounded-md hover:bg-[#1a4a32] transition-colors"
                >
                  Customize Dashboard
                </button>
              </div>
            ) : (
              standardMetrics.map(metric => {
                switch (metric.id) {
                  case 'portfolioValue':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Estimated Portfolio Value"
                        value={formatCurrency(totalPortfolioValue)}
                        showInfoIcon={true}
                        tooltipText="The estimated current market value of all properties in your portfolio."
                        subtitle={`${formatCurrency(totalEquity)} equity • ${formatCurrency(totalMortgageDebt)} debt`}
                      />
                    );
                  case 'equity': {
                    const projectedEquitySubtitle = `Projected equity added this calendar year: ${formatCurrency(annualEquityBuilt)}`;

                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Estimated Equity"
                        value={formatCurrency(totalEquity)}
                        showInfoIcon={true}
                        tooltipText="The estimated market value of your properties minus the remaining mortgage balances."
                        subtitle={projectedEquitySubtitle}
                      />
                    );
                  }
                  case 'monthlyCashFlow':
                    return (
                      <MetricCard
                        key={metric.id}
                        title={getTimePeriodLabel("Monthly Net Cash Flow")}
                        value={formatCurrency(monthlyCashFlowValue)}
                        showInfoIcon={true}
                        tooltipText={timePeriod === 'all' 
                          ? "The average monthly rental income remaining after all operating expenses and mortgage payments since acquisition." 
                          : "The monthly rental income remaining after all operating expenses and mortgage payments."}
                        customColor={monthlyCashFlowValue < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}
                        statusMessage={cashFlowMessage}
                        statusTone={cashFlowTone}
                      />
                    );
                  case 'annualExpenses':
                    return (
                      <MetricCard
                        key={metric.id}
                        title={getTimePeriodLabel("Total Expense Breakdown")}
                        isMultiMetric={true}
                        showInfoIcon={true}
                        tooltipText={timePeriod === 'all' 
                          ? "Includes both operating expenses (taxes, fees, insurance, maintenance, utilities) and debt service across the full holding period."
                          : "Annual view of operating expenses and mortgage debt service so you can reconcile to cash flow."}
                        multiMetrics={[
                          {
                            label: getTimePeriodLabel("Annual Operating Expenses"),
                            value: formatCurrency(totalAnnualOperatingExpenses),
                          },
                          {
                            label: getTimePeriodLabel("Annual Debt Service"),
                            value: formatCurrency(totalAnnualDebtService),
                          },
                          {
                            label: getTimePeriodLabel("Total Expenses"),
                            value: formatCurrency(totalAnnualOperatingExpenses + totalAnnualDebtService),
                          },
                        ]}
                        statusMessage="Use this breakdown to spot categories that can be trimmed."
                        statusTone="neutral"
                      />
                    );
                  case 'annualDeductibleExpenses':
                    return (
                      <MetricCard
                        key={metric.id}
                        title={getTimePeriodLabel("Total Annual Deductible Expenses")}
                        value={formatCurrency(portfolioMetrics?.totalAnnualDeductibleExpenses || 0)}
                        isExpense={true}
                        showInfoIcon={true}
                        tooltipText={timePeriod === 'all' 
                          ? "Total tax-deductible expenses since acquisition, including mortgage interest, property tax, utilities, insurance, maintenance, and professional fees." 
                          : "Tax-deductible expenses including mortgage interest, property tax, utilities, insurance, maintenance, and professional fees. These costs can be written off to reduce your taxable income."}
                        statusMessage="Track deductible costs ahead of tax filing to maximize write-offs."
                        statusTone="neutral"
                      />
                    );
                  case 'totalProperties':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Properties & Units"
                        showInfoIcon={true}
                        tooltipText="The total number of investment properties and rental units currently in your portfolio."
                        isMultiMetric={true}
                        multiMetrics={[
                          { label: "Properties", value: totalProperties.toString() },
                          { label: "Units", value: totalUnits.toString() }
                        ]}
                        statusMessage={`Occupancy: ${formatPercentage(occupancyRate)} of properties filled`}
                        statusTone={occupancyRate >= 0.9 ? 'positive' : occupancyRate >= 0.75 ? 'neutral' : 'warning'}
                      />
                    );
                  case 'occupancyRate':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Average Occupancy Rate"
                        value={formatPercentage(averageOccupancyRate)}
                        showInfoIcon={true}
                        tooltipText="The average percentage of occupied units across all properties in your portfolio."
                      />
                    );
                  case 'avgRentPerSqFt':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Average Rent Per Square Foot"
                        value={formatCurrency(averageRentPerSqFt)}
                        showInfoIcon={true}
                        tooltipText="The average monthly rental income per square foot across all properties in your portfolio. This helps compare rental efficiency between properties of different sizes."
                      />
                    );
                  case 'financialGoals':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Financial Goals 2025"
                        showInfoIcon={true}
                        tooltipText="This card tracks your progress towards the financial goals set for the current year."
                        isMultiMetric={true}
                        multiMetrics={[
                          { label: "Portfolio Value", value: formatCurrency(totalPortfolioValue * 1.1) },
                          { label: "Cash Flow", value: formatCurrency(annualCashFlow * 1.2) }
                        ]}
                        statusMessage="Stay within 10% of your annual goals to remain on track."
                        statusTone="neutral"
                      />
                    );
                  case 'mortgageDebt':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Mortgage Debt"
                        value={formatCurrency(totalMortgageDebt)}
                        isExpense={true}
                        showInfoIcon={true}
                        tooltipText="The total remaining mortgage balance across all properties in your portfolio."
                        statusMessage={`Current leverage: ${formatPercentage(portfolioLTV)}`}
                        statusTone={ltvTone}
                      />
                    );
                  case 'netOperatingIncome':
                    return (
                      <MetricCard
                        key={metric.id}
                        title={getTimePeriodLabel("Net Operating Income (NOI)")}
                        value={formatCurrency(netOperatingIncome)}
                        showInfoIcon={true}
                        tooltipText={timePeriod === 'all' 
                          ? "Total profitability by subtracting operating expenses from total revenue since acquisition." 
                          : "Calculates the property's profitability by subtracting operating expenses from total revenue."}
                        statusMessage={netOperatingIncome > 0 ? 'NOI is positive, indicating strong operations.' : 'Negative NOI; inspect operating costs closely.'}
                        statusTone={netOperatingIncome > 0 ? 'positive' : 'warning'}
                      />
                    );
                  case 'overallCapRate':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Overall Cap Rate"
                        value={formatPercentage(overallCapRate)}
                        showInfoIcon={true}
                        tooltipText="The portfolio's capitalization rate calculated as total annual NOI divided by total estimated portfolio value. A 'strong' cap rate for a rental property in the Toronto area is typically considered to be in the 5% to 7% range for suburban and high-demand areas, while downtown core properties often have lower cap rates of 3.75% to 4.25% due to higher property values and demand."
                        statusMessage={capRateMessage}
                        statusTone={capRateTone}
                      />
                    );
                  case 'blendedCashOnCash':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Blended Cash on Cash"
                        value={formatPercentage(blendedCashOnCashReturn)}
                        showInfoIcon={true}
                        tooltipText="The blended cash-on-cash return across your portfolio, calculated as total annual cash flow before tax divided by total initial cash invested. A good cash-on-cash return in real estate is generally considered to be between 8% and 12%."
                        statusMessage={cashOnCashMessage}
                        statusTone={cashOnCashTone}
                      />
                    );
                  default:
                    return null;
                }
              })
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Center Column: Tenants & Rent */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tenants & Rent</h2>
              
              {/* Current Tenants */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Tenants</h3>
                {properties.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add a property to start tracking occupancy, leases, and rent collection.
                  </p>
                ) : (
                  <>
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>{occupiedPropertiesCount} of {properties.length} properties occupied</span>
                        <span>{formatPercentage(occupancyRate)}</span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${occupancyRate >= 0.75 ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-amber-500 dark:bg-amber-400'}`}
                          style={{ width: `${Math.min(occupancyRate, 1) * 100}%` }}
                          role="presentation"
                        />
                      </div>
                    </div>

                <div className="space-y-4">
                      {properties.map((property) => {
                        const isOccupied = Boolean(property.tenant?.name);
                        const leaseStart = property.tenant?.leaseStartDate;
                        const leaseEnd = property.tenant?.leaseEndDate;
                        const monthlyRent = property.rent?.monthlyRent || 0;

                        let leaseSummary = "No lease details on file";
                        let leaseTone = "text-xs text-gray-500 dark:text-gray-400";

                        if (leaseStart) {
                          leaseSummary = `Lease: ${formatDateDisplay(leaseStart)} - ${formatDateDisplay(
                            leaseEnd,
                            undefined,
                            leaseEnd || "No end date"
                          )}`;
                        }

                        if (leaseEnd && isValidDateValue(leaseEnd)) {
                          const endDate = new Date(leaseEnd);
                          const daysToEnd = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          if (daysToEnd < 0) {
                            leaseTone = "text-xs text-red-600 dark:text-red-400";
                            leaseSummary = `Lease expired ${Math.abs(daysToEnd)} days ago (${formatDateDisplay(leaseEnd)})`;
                          } else if (daysToEnd <= 45) {
                            leaseTone = "text-xs text-amber-600 dark:text-amber-400";
                            leaseSummary = `Lease ends in ${daysToEnd} days (${formatDateDisplay(leaseEnd)})`;
                          } else {
                            leaseTone = "text-xs text-gray-500 dark:text-gray-400";
                            leaseSummary = `Lease ends ${formatDateDisplay(leaseEnd)}`;
                          }
                        }

                        return (
                          <div
                            key={property.id}
                            className={`rounded-lg border p-4 transition-colors ${
                              isOccupied
                                ? 'border-gray-200 bg-gray-50/80 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/40 dark:hover:border-gray-600'
                                : 'border-red-200 bg-red-50/60 hover:border-red-300 dark:border-red-800 dark:bg-red-900/20 dark:hover:border-red-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    isOccupied ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-red-500 dark:bg-red-400'
                                  }`}
                                  aria-hidden="true"
                                />
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  {property.nickname || property.name}
                                </h4>
                              </div>
                              <span
                                className={`text-xs font-semibold uppercase tracking-wide ${
                                  isOccupied ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                {isOccupied ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                            <div className="mt-3 flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {isOccupied ? property.tenant?.name : 'No tenant assigned'}
                                </p>
                                <p className={leaseTone}>
                                  {leaseSummary}
                          </p>
                        </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {formatCurrency(monthlyRent)}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">per month</p>
                      </div>
                    </div>
                </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Right Column: Schedule */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Schedule</h2>
              
              {/* Key Upcoming Dates */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Upcoming Dates (30 days)</h3>
                
                <ScheduleEvents properties={properties} />
              </div>
            </div>

            {/* Annual Rental Income Chart */}
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Annual Rental Income </h3>
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {property.nickname || property.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(property.rent.monthlyRent * 12)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(property.rent.monthlyRent)}/mo
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total Annual Income</span>
                    <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(portfolioMetrics.totalMonthlyRent * 12)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Expenses Chart */}
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {expenseViewType === 'annual' ? 'Annual Expenses (Operating + Debt Service)' : 'Annual Deductible Expenses '}
                </h3>
                
                {/* Expense View Settings */}
                <div className="relative" ref={expenseSettingsRef}>
                  <button
                    onClick={() => setIsExpenseSettingsOpen(!isExpenseSettingsOpen)}
                    className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    aria-label="Customize expense view"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>

                  {/* Expense View Dropdown */}
                  {isExpenseSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-black/10 dark:border-white/10 py-2 z-50">
                      <div className="px-4 pb-2 border-b border-black/10 dark:border-white/10">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Expense View</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Select which expense data to display
                        </p>
                      </div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => handleExpenseViewChange('annual')}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            expenseViewType === 'annual' 
                              ? 'text-[#205A3E] dark:text-[#4ade80] font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Annual Expenses</span>
                            {expenseViewType === 'annual' && (
                              <div className="w-2 h-2 bg-[#205A3E] dark:bg-[#4ade80] rounded-full"></div>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => handleExpenseViewChange('deductible')}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            expenseViewType === 'deductible' 
                              ? 'text-[#205A3E] dark:text-[#4ade80] font-medium' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>Annual Deductible Expenses</span>
                              <div className="relative group">
                                <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-100 border border-[#205A3E] dark:border-[#4ade80] flex items-center justify-center cursor-help">
                                  <span className="text-[#205A3E] dark:text-[#4ade80] text-xs font-bold">i</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-[#205A3E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal z-10 w-64 shadow-lg">
                                  To boost your property's financial performance, you can deduct allowable costs to directly reduce your tax liability on its income. Common write-offs include mortgage interest, property tax, utilities, and home insurance
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#205A3E]"></div>
                                </div>
                              </div>
                            </div>
                            {expenseViewType === 'deductible' && (
                              <div className="w-2 h-2 bg-[#205A3E] dark:bg-[#4ade80] rounded-full"></div>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {properties.length > 0 ? (
                  properties.map((property) => {
                    const propertyExpenseValue = expenseViewType === 'deductible' 
                      ? (() => {
                          try {
                            // Calculate annual operating expenses (excluding mortgage principal)
                            const annualOperatingExpenses = 
                              (property.monthlyExpenses.propertyTax || 0) * 12 +
                              (property.monthlyExpenses.condoFees || 0) * 12 +
                              (property.monthlyExpenses.insurance || 0) * 12 +
                              (property.monthlyExpenses.maintenance || 0) * 12 +
                              (property.monthlyExpenses.professionalFees || 0) * 12 +
                              (property.monthlyExpenses.utilities || 0) * 12;
                            
                            // Add estimated annual mortgage interest
                            const estimatedAnnualInterest = property.mortgage.originalAmount * property.mortgage.interestRate;
                            
                            return annualOperatingExpenses + estimatedAnnualInterest;
                          } catch (error) {
                            // Fallback: use total expenses minus estimated principal
                            const estimatedAnnualPrincipal = (property.mortgage.originalAmount / property.mortgage.amortizationYears);
                            return (property.monthlyExpenses?.total || 0) * 12 - estimatedAnnualPrincipal;
                          }
                        })()
                      : (property.monthlyExpenses?.total || 0) * 12;

                    return (
                      <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {property.nickname || property.name}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(propertyExpenseValue)}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(propertyExpenseValue / 12)}/mo
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No properties found
                  </div>
                )}
                {properties.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {expenseViewType === 'deductible' ? 'Total Annual Deductible Expenses' : 'Total Annual Expenses (Operating + Debt Service)'}
                      </span>
                      <span className="font-bold text-lg text-red-600 dark:text-red-400">
                        {expenseViewType === 'deductible' 
                          ? formatCurrency(portfolioMetrics?.totalAnnualDeductibleExpenses || 0)
                          : formatCurrency((portfolioMetrics?.totalAnnualOperatingExpenses || 0) + (portfolioMetrics?.totalAnnualDebtService || 0))
                        }
                      </span>
                    </div>
                  </div>
                )}

                {expenseCategoryList.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Largest Expense Categories
                    </h4>
                    <div className="mt-3 space-y-3">
                      {expenseCategoryList.map((category) => {
                        const width = totalTrackedExpenses > 0 ? (category.value / totalTrackedExpenses) * 100 : 0;
                        return (
                          <div key={category.id}>
                            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                              <span>{category.label}</span>
                              <span>{formatCurrency(category.value)}</span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className="h-full bg-amber-500 dark:bg-amber-400"
                                style={{ width: `${Math.min(width, 100)}%` }}
                                role="presentation"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </Layout>
    </RequireAuth>
  );
}

function TopMetricCard({
  title,
  value,
  icon: Icon,
  accent = 'emerald',
  supporting,
  iconBadge,
  iconBadgePosition = 'bottom-right',
}) {
  const accentConfig = {
    emerald: {
      border: 'border-[#205A3E]/30 dark:border-[#1C4F39]/40',
      gradient: 'from-[#D9E5DC] via-[#F4F8F5] to-transparent dark:from-[#1A2F25] dark:via-[#101B15] dark:to-transparent',
      icon: 'text-[#205A3E] dark:text-[#66B894] bg-white/90 dark:bg-[#1D3A2C]/70',
    },
    teal: {
      border: 'border-[#1A4A5A]/25 dark:border-[#123640]/40',
      gradient: 'from-[#D8E6EA] via-[#F5F9FA] to-transparent dark:from-[#11252B] dark:via-[#0B181D] dark:to-transparent',
      icon: 'text-[#1A4A5A] dark:text-[#7AC0CF] bg-white/90 dark:bg-[#132E36]/70',
    },
    amber: {
      border: 'border-[#B57A33]/25 dark:border-[#8C5D24]/35',
      gradient: 'from-[#F3E6D4] via-[#FBF6EE] to-transparent dark:from-[#2A2014] dark:via-[#1B140C] dark:to-transparent',
      icon: 'text-[#B57A33] dark:text-[#E9C08A] bg-white/90 dark:bg-[#2D2115]/70',
    },
  };

  const config = accentConfig[accent] || accentConfig.emerald;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.border} bg-gradient-to-br ${config.gradient} p-5`}>
      <div className="flex items-start justify-between gap-3.5">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {Icon && (
          <div className={`relative rounded-full p-2.5 ${config.icon}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
            {iconBadge && (
              <span
                className={`absolute flex h-4 w-4 items-center justify-center rounded-full bg-[#205A3E] text-[10px] font-semibold text-white shadow-sm dark:bg-[#2F7E57] ${
                  iconBadgePosition === 'top-center'
                    ? '-top-1 left-1/2 -translate-x-1/2'
                    : '-bottom-1 -right-1'
                }`}
              >
                {iconBadge}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="mt-5 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {supporting && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          {supporting}
        </p>
      )}
    </div>
  );
}

function IncomeWaterfallCard({ totalRevenue, operatingExpenses, debtService, netCashFlow }) {
  const totalOutflows = operatingExpenses + debtService;
  const netPositive = netCashFlow >= 0;
  const margin = totalRevenue > 0 ? netCashFlow / totalRevenue : 0;
  const percentFormatter = new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  const marginLabel = Number.isFinite(margin) ? percentFormatter.format(margin) : 'N/A';
  const expenseShare = totalRevenue > 0 ? totalOutflows / totalRevenue : null;

  const scale = totalRevenue > 0
    ? totalRevenue
    : Math.max(totalOutflows, Math.abs(netCashFlow), 1);

  const steps = [
    { label: 'Total Revenue', value: totalRevenue, type: 'base' },
    { label: 'Total Expenses', value: totalOutflows, type: 'subtract', isAggregate: true },
    { label: 'Operating Expenses', value: operatingExpenses, type: 'subtract', isSub: true },
    { label: 'Debt Service', value: debtService, type: 'subtract', isSub: true },
  ];

  const barWidth = (value) => {
    if (scale <= 0) return 0;
    return Math.min(100, (Math.abs(value) / scale) * 100);
  };

  return (
    <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Income vs Outflows
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Annualized snapshot of how rent covers operating costs and debt service.
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            netPositive
              ? 'bg-[#D9E5DC] text-[#205A3E] dark:bg-[#1D3A2C] dark:text-[#66B894]'
              : 'bg-[#F7D9D9] text-[#9F3838] dark:bg-[#2B1111] dark:text-[#F2A5A5]'
          }`}
        >
          {marginLabel === 'N/A' ? 'No revenue' : `${marginLabel} margin`}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className={`relative ${step.isSub ? 'pl-8' : 'pl-3'}`}>
            {index > 0 && !step.isSub && (
              <span
                className="absolute left-0 top-0 h-full border-l border-dashed border-gray-300 dark:border-gray-700"
                aria-hidden="true"
              />
            )}
            <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
              <span>
                {step.type === 'subtract'
                  ? `${step.isSub ? 'Less ' : 'Less '}${step.label}`
                  : step.label}
              </span>
              <span className="text-gray-900 dark:text-gray-100">
                {step.type === 'subtract' ? `-${formatCurrency(step.value)}` : formatCurrency(step.value)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full ${
                  step.type === 'base'
                    ? 'bg-[#205A3E] dark:bg-[#2F7E57]'
                    : step.isAggregate
                      ? 'bg-[#E16262] dark:bg-[#A12424]'
                      : 'bg-[#9CA3AF] dark:bg-[#E2E8F0]'
                }`}
                style={{ width: `${barWidth(step.value)}%` }}
                role="presentation"
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-6 flex items-start justify-between rounded-md border px-4 py-3 text-sm ${
          netPositive
            ? 'border-[#C7D9CB] bg-[#EFF4F0] text-[#205A3E] dark:border-[#244632] dark:bg-[#15251D] dark:text-[#7AC0A1]'
            : 'border-[#E1B8B8] bg-[#FDF3F3] text-[#9F3838] dark:border-[#4C1F1F] dark:bg-[#1F1111] dark:text-[#F2A5A5]'
        }`}
      >
        <div>
          <p className="font-semibold">Net Cash Flow</p>
          <p className="text-xs opacity-80">After operating expenses and debt service</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold">{formatCurrency(netCashFlow)}</p>
          {expenseShare !== null && Number.isFinite(expenseShare) && (
            <p className="text-xs font-medium opacity-80">
              {percentFormatter.format(expenseShare)} of revenue consumed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  trend,
  trendPositive,
  isExpense,
  showInfoIcon,
  tooltipText,
  isMultiMetric,
  multiMetrics,
  customColor,
  subtitle,
  statusMessage,
  statusTone = 'neutral',
}) {
  const getValueColor = () => {
    if (customColor) {
      return customColor;
    }
    if (isExpense) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  };

  const statusToneConfig = {
    positive: {
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800/60',
    },
    neutral: {
      text: 'text-gray-600 dark:text-gray-300',
      bg: 'bg-gray-50 dark:bg-gray-900/40',
      border: 'border-gray-100 dark:border-gray-700',
    },
    warning: {
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800/60',
    },
  };

  const statusStyles = statusToneConfig[statusTone] || statusToneConfig.neutral;

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
            {showInfoIcon && (
              <div className="relative group">
                <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-100 border-2 border-[#205A3E] dark:border-[#4ade80] flex items-center justify-center cursor-help">
                  <span className="text-[#205A3E] dark:text-[#4ade80] text-xs font-bold">i</span>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-[#205A3E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal z-10 w-64 shadow-lg">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#205A3E]"></div>
                </div>
              </div>
            )}
          </div>
          
          {isMultiMetric ? (
            <div className="space-y-2">
              {multiMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-3xl font-bold ${getValueColor()}`}>{value}</p>
          )}

          {subtitle && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          {statusMessage && (
            <div
              className={`mt-4 rounded-md border px-3 py-2 text-xs leading-5 ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text}`}
            >
              {statusMessage}
            </div>
          )}
        </div>
        
        {!isMultiMetric && trend && (
          <div className={`text-sm font-medium ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleEvents({ properties = [] }) {
  const [dateRange, setDateRange] = useState(30);
  
  const upcomingEvents = properties.flatMap(property => {
    const events = [
      { propertyName: property.nickname || property.name, eventType: "Mortgage Payment", date: property.mortgage?.nextPayment },
      { propertyName: property.nickname || property.name, eventType: "Insurance Renewal", date: "2025-02-15" }, // Estimated
      { propertyName: property.nickname || property.name, eventType: "Property Tax", date: "2025-03-01" }, // Estimated
      { propertyName: property.nickname || property.name, eventType: "Maintenance", date: "2025-01-20" }, // Estimated
    ];
    
    if (property.tenant?.name && property.tenant?.leaseEndDate) {
      events.push({
        propertyName: property.nickname || property.name,
        eventType: "Lease Renewal",
        date: property.tenant.leaseEndDate
      });
    }
    
    return events;
  });

  const today = new Date();
  const endDate = new Date(today.getTime() + dateRange * 24 * 60 * 60 * 1000);

  const upcomingWithinRange = upcomingEvents
    .filter(event => isValidDateValue(event.date))
    .map(event => ({
      ...event,
      eventDate: new Date(event.date),
    }))
    .filter(event => event.eventDate >= today && event.eventDate <= endDate)
    .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());

  const formatEventDate = (date) => {
    if (!isValidDateValue(date)) {
      return typeof date === "string" ? date : "Date TBD";
    }

    const eventDate = new Date(date);
    const isToday = eventDate.toDateString() === today.toDateString();
    const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isTomorrow) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getUrgencyMeta = (eventDate) => {
    const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        dot: 'border-red-500 bg-red-100 dark:bg-red-900/40',
        card: 'border-red-100 bg-red-50 dark:border-red-800/60 dark:bg-red-900/20',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        label: 'Past due',
      };
    }

    if (diffDays <= 7) {
      return {
        dot: 'border-amber-500 bg-amber-100 dark:bg-amber-900/40',
        card: 'border-amber-100 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-900/20',
        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        label: 'This week',
      };
    }

    if (diffDays <= 30) {
      return {
        dot: 'border-blue-500 bg-blue-100 dark:bg-blue-900/40',
        card: 'border-blue-100 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-900/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        label: `In ${diffDays} days`,
      };
    }

    return {
      dot: 'border-gray-300 bg-gray-100 dark:bg-gray-800',
      card: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30',
      badge: '',
      label: '',
    };
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Upcoming mortgage, tax, maintenance, and lease milestones.
        </p>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
        >
          <option value={30}>Next 30 days</option>
          <option value={60}>Next 60 days</option>
          <option value={90}>Next 90 days</option>
        </select>
      </div>

      {upcomingWithinRange.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
          No key events in the next {dateRange} days. You’re in the clear.
        </div>
      ) : (
        <div className="relative mt-6 pl-6">
          <span className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
          <div className="space-y-6">
            {upcomingWithinRange.map((event, index) => {
              const urgency = getUrgencyMeta(event.eventDate);
              return (
                <div key={`${event.propertyName}-${event.eventType}-${index}`} className="relative">
                  <span
                    className={`absolute -left-3 mt-1 h-3 w-3 rounded-full border-2 ${urgency.dot}`}
                    aria-hidden="true"
                  />
                  <div className={`rounded-lg border px-4 py-3 transition-colors ${urgency.card}`}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {event.eventType}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.propertyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {formatEventDate(event.eventDate)}
                        </p>
                        {urgency.label && (
                          <span className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${urgency.badge}`}>
                            {urgency.label}
                    </span>
                        )}
                  </div>
                </div>
            </div>
          </div>
              );
            })}
      </div>
        </div>
      )}
    </div>
  );
}






