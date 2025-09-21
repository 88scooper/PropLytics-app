"use client";


import Layout from "@/components/Layout.jsx";
import { RequireAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { Settings, GripVertical } from "lucide-react";
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
import { getCurrentMortgageBalance } from "@/utils/mortgageCalculator";
import PortfolioMortgageDashboard from "@/components/mortgages/PortfolioMortgageDashboard";

// ROI data for different time periods
const roiData = {
  1: 8.2,   // 1 Year ROI
  2: 12.5,  // 2 Year ROI
  3: 18.7,  // 3 Year ROI
  4: 24.3,  // 4 Year ROI
  5: 28.3,  // 5 Year ROI
  10: 45.7, // 10 Year ROI
  15: 62.4, // 15 Year ROI
  20: 78.9  // 20 Year ROI
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

  // Default metrics configuration
  const defaultMetrics = [
    { id: 'portfolioValue', name: 'Total Estimated Portfolio Value', isVisible: true },
    { id: 'equity', name: 'Total Estimated Equity', isVisible: true },
    { id: 'mortgageDebt', name: 'Total Mortgage Debt', isVisible: true },
    { id: 'cashOnCash', name: 'Cash on Cash', isVisible: true },
    { id: 'monthlyCashFlow', name: 'Monthly Net Cash Flow', isVisible: true },
    { id: 'monthlyExpenses', name: 'Total Monthly Expenses', isVisible: true },
    { id: 'netOperatingIncome', name: 'Net Operating Income (NOI)', isVisible: true },
    { id: 'capRate', name: 'Average Cap Rate', isVisible: true },
    { id: 'returnOnCost', name: 'Total Estimated Return on Investment (ROI)', isVisible: true },
    { id: 'totalProperties', name: 'Total Properties', isVisible: false },
    { id: 'occupancyRate', name: 'Average Occupancy Rate', isVisible: false },
    { id: 'financialGoals', name: 'Financial Goals 2025', isVisible: false },
  ];

  // State for metrics (array of objects to preserve order and visibility)
  const [metrics, setMetrics] = useState(defaultMetrics);

  // State for ROI time period selection
  const [selectedROIYear, setSelectedROIYear] = useState(2);

  // State for expense view toggle (Annual Expenses vs Annual Deductible Expenses)
  const [expenseViewType, setExpenseViewType] = useState('annual');

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
    const savedMetrics = localStorage.getItem('portfolio-dashboard-layout');
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error('Error parsing saved metrics:', error);
        setMetrics(defaultMetrics);
      }
    } else {
      setMetrics(defaultMetrics);
    }
  }, []);

  // Initialize expense view type from localStorage or use default
  useEffect(() => {
    const savedExpenseView = localStorage.getItem('expense-view-type');
    if (savedExpenseView) {
      setExpenseViewType(savedExpenseView);
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

  // Data is now coming from PropertyContext
  
  // Calculate total monthly expenses
  const totalMonthlyExpenses = portfolioMetrics.totalMonthlyExpenses || 0;

  // Calculate additional metrics
  const totalMortgageDebt = portfolioMetrics.totalMortgageBalance || 0;

  const annualCashFlow = portfolioMetrics.totalAnnualCashFlow || 0;
  const totalCashInvested = portfolioMetrics.totalInvestment || 0;
  const cashOnCashReturn = portfolioMetrics.cashOnCashReturn || 0;

  const totalRevenue = (portfolioMetrics.totalMonthlyRent || 0) * 12;
  const totalOperatingExpenses = totalMonthlyExpenses * 12;
  const netOperatingIncome = totalRevenue - totalOperatingExpenses;

  // Calculate portfolio totals from actual data
  const totalPortfolioValue = portfolioMetrics.totalValue || 0;
  const totalEquity = portfolioMetrics.totalEquity || 0;
  const totalProperties = portfolioMetrics.totalProperties || 0;
  const averageOccupancyRate = portfolioMetrics.averageOccupancy || 0;
  const averageCapRate = portfolioMetrics.averageCapRate || 0;

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Summary</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Overview of your real estate investment performance and key metrics.
              </p>
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
                        onClick={() => setMetrics(defaultMetrics)}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        Reset to Default
                      </button>
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

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {metrics.filter(metric => metric.isVisible).length === 0 ? (
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
              metrics
                .filter(metric => metric.isVisible)
                .map(metric => {
                switch (metric.id) {
                  case 'portfolioValue':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Estimated Portfolio Value"
                        value={`$${totalPortfolioValue.toLocaleString()}`}
                        showInfoIcon={true}
                        tooltipText="The estimated current market value of all properties in your portfolio."
                      />
                    );
                  case 'equity':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Estimated Equity"
                        value={`$${totalEquity.toLocaleString()}`}
                        showInfoIcon={true}
                        tooltipText="The estimated market value of your properties minus the remaining mortgage balances."
                      />
                    );
                  case 'monthlyCashFlow':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Monthly Net Cash Flow"
                        value={`$${portfolioMetrics.totalMonthlyCashFlow?.toLocaleString() || '0'}`}
                        showInfoIcon={true}
                        tooltipText="The monthly rental income remaining after all operating expenses and mortgage payments."
                      />
                    );
                  case 'monthlyExpenses':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Monthly Expenses"
                        value={`$${totalMonthlyExpenses.toLocaleString()}`}
                        isExpense={true}
                        showInfoIcon={true}
                        tooltipText="The sum of all recurring monthly costs, including mortgage, taxes, fees, and insurance."
                      />
                    );
                  case 'totalProperties':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Properties"
                        value={totalProperties.toString()}
                        showInfoIcon={true}
                        tooltipText="The total number of investment properties currently in your portfolio."
                      />
                    );
                  case 'occupancyRate':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Average Occupancy Rate"
                        value={`${averageOccupancyRate.toFixed(1)}%`}
                        showInfoIcon={true}
                        tooltipText="The average percentage of occupied units across all properties in your portfolio."
                      />
                    );
                  case 'capRate':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Average Cap Rate"
                        value={`${averageCapRate.toFixed(1)}%`}
                        showInfoIcon={true}
                        tooltipText="The rate of return on a real estate investment property based on the income that the property is expected to generate."
                      />
                    );
                  case 'returnOnCost':
                    return (
                      <div key={metric.id} className="rounded-lg border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Estimate Return on Investment (ROI)</h3>
                              <div className="relative group">
                                <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-100 border-2 border-[#205A3E] dark:border-[#4ade80] flex items-center justify-center cursor-help">
                                  <span className="text-[#205A3E] dark:text-[#4ade80] text-xs font-bold">i</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-[#205A3E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-normal z-10 w-64 shadow-lg">
                                  This metric calculates the total return based on the initial capital invested.
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#205A3E]"></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 mb-3">
                              <select
                                value={selectedROIYear}
                                onChange={(e) => setSelectedROIYear(Number(e.target.value))}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
                              >
                                <option value={1}>1 Year</option>
                                <option value={2}>2 Year</option>
                                <option value={3}>3 Year</option>
                                <option value={4}>4 Year</option>
                                <option value={5}>5 Year</option>
                                <option value={10}>10 Year</option>
                                <option value={15}>15 Year</option>
                                <option value={20}>20 Year</option>
                              </select>
                              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                {roiData[selectedROIYear]}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
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
                          { label: "Portfolio Value", value: `$${(totalPortfolioValue * 1.1).toLocaleString()}` },
                          { label: "Cash on Cash", value: `${(cashOnCashReturn * 1.2).toFixed(1)}%` }
                        ]}
                      />
                    );
                  case 'mortgageDebt':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Total Mortgage Debt"
                        value={`$${totalMortgageDebt.toLocaleString()}`}
                        isExpense={true}
                        showInfoIcon={true}
                        tooltipText="The total remaining mortgage balance across all properties in your portfolio."
                      />
                    );
                  case 'cashOnCash':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Cash on Cash"
                        value={`${cashOnCashReturn.toFixed(1)}%`}
                        showInfoIcon={true}
                        tooltipText="Measures the annual pre-tax cash flow as a percentage of the total cash invested."
                      />
                    );
                  case 'netOperatingIncome':
                    return (
                      <MetricCard
                        key={metric.id}
                        title="Net Operating Income (NOI)"
                        value={`$${netOperatingIncome.toLocaleString()}`}
                        showInfoIcon={true}
                        tooltipText="Calculates the property's profitability by subtracting operating expenses from total revenue."
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
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div key={property.id} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{property.nickname}</h4>
                        <span className={`text-sm ${property.tenant.name ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                          {property.tenant.name ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {property.tenant.name ? property.tenant.name : 'No tenant'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {property.tenant.leaseStartDate ? 
                              `Lease: ${new Date(property.tenant.leaseStartDate).toLocaleDateString()} - ${new Date(property.tenant.leaseEndDate).toLocaleDateString()}` :
                              'No lease'
                            }
                          </p>
                        </div>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          ${property.rent.monthlyRent.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Annual Rental Income (by Property)</h3>
              <div className="space-y-3">
                {properties.map((property) => (
                  <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{property.nickname}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        ${(property.rent.monthlyRent * 12).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${property.rent.monthlyRent.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total Annual Income</span>
                    <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                      ${(portfolioMetrics.totalMonthlyRent * 12).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Annual Expenses Chart */}
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {expenseViewType === 'annual' ? 'Annual Expenses (by Property)' : 'Annual Deductible Expenses (by Property)'}
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
                  properties.map((property) => (
                    <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{property.nickname}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{property.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                          ${((property.monthlyExpenses?.total || 0) * 12).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${(property.monthlyExpenses?.total || 0).toLocaleString()}/mo
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No properties found
                  </div>
                )}
                {properties.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Total Annual Expenses</span>
                      <span className="font-bold text-lg text-red-600 dark:text-red-400">
                        ${((portfolioMetrics?.totalMonthlyExpenses || 0) * 12).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mortgage Dashboard Section */}
          <PortfolioMortgageDashboard />
        </div>
      </Layout>
    </RequireAuth>
  );
}

function MetricCard({ title, value, description, trend, trendPositive, isExpense, showInfoIcon, tooltipText, isMultiMetric, multiMetrics }) {
  const getValueColor = () => {
    if (isExpense) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  };

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
        </div>
        
        {!isMultiMetric && (
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
  
  // Generate upcoming events from real property data
  const upcomingEvents = properties.flatMap(property => {
    const events = [
      { propertyName: property.nickname, eventType: "Mortgage Payment", date: property.mortgage.nextPayment },
      { propertyName: property.nickname, eventType: "Insurance Renewal", date: "2025-02-15" }, // Estimated
      { propertyName: property.nickname, eventType: "Property Tax", date: "2025-03-01" }, // Estimated
      { propertyName: property.nickname, eventType: "Maintenance", date: "2025-01-20" }, // Estimated
    ];
    
    // Add lease-related events if tenant exists
    if (property.tenant.name && property.tenant.leaseEndDate) {
      events.push({
        propertyName: property.nickname,
        eventType: "Lease Renewal",
        date: property.tenant.leaseEndDate
      });
    }
    
    return events;
  });

  // Filter events based on selected date range
  const today = new Date();
  const endDate = new Date(today.getTime() + dateRange * 24 * 60 * 60 * 1000);
  const filteredEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= endDate;
  });

  // Sort events by date
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group events by property
  const eventsByProperty = {};
  filteredEvents.forEach(event => {
    if (!eventsByProperty[event.propertyName]) {
      eventsByProperty[event.propertyName] = [];
    }
    eventsByProperty[event.propertyName].push(event);
  });

  // Get next week date for urgency highlighting
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const getUrgencyClass = (date) => {
    const eventDate = new Date(date);
    const isWithinWeek = eventDate <= nextWeek && eventDate >= today;
    
    if (isWithinWeek) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500';
    }
    return 'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-l-gray-200 dark:border-l-gray-700';
  };

  const formatDate = (date) => {
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

  return (
    <div>
      {/* Date Range Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={30}>Next 30 days</option>
          <option value={60}>Next 60 days</option>
          <option value={90}>Next 90 days</option>
        </select>
      </div>

      {/* Events by Property */}
      <div className="space-y-4">
        {Object.entries(eventsByProperty).map(([propertyName, events]) => (
          <div key={propertyName} className="space-y-2">
            {/* Property Header */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
              {propertyName}
            </h4>
            
            {/* Events for this property */}
            <div className="space-y-1">
              {events.map((event, index) => (
                <div 
                  key={`${propertyName}-${event.eventType}-${index}`} 
                  className={`p-2 rounded ${getUrgencyClass(event.date)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {event.eventType}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




