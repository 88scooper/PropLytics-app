"use client";

import { useState, use, useMemo, useEffect } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useProperty } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage, formatNumber } from "@/utils/formatting";
import { calculateAmortizationSchedule } from "@/utils/mortgageCalculator";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import AnnualExpenseChart from '@/components/charts/AnnualExpenseChart';

export default function PropertyDetailPage({ params }) {
  const { propertyId } = use(params) || {};
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Get property data using propertyId from PropertyContext
  const property = useProperty(propertyId);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debug logging for capRate and cashOnCashReturn
  if (property) {
    console.log('DEBUG - Cap Rate:', property.capRate, 'Type:', typeof property.capRate);
    console.log('DEBUG - Cash on Cash:', property.cashOnCashReturn, 'Type:', typeof property.cashOnCashReturn);
  }

  // Calculate mortgage schedule and current balance
  const mortgageData = useMemo(() => {
    if (!property?.mortgage) return null;
    
    try {
      const schedule = calculateAmortizationSchedule(property.mortgage);
      const now = new Date();
      const startDate = new Date(property.mortgage.startDate || property.purchaseDate);
      const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
      
      const currentPayment = schedule.payments[monthsElapsed] || schedule.payments[0];
      const currentBalance = currentPayment?.remainingBalance || property.mortgage.originalAmount;
      const principalPaid = property.mortgage.originalAmount - currentBalance;
      const totalInterestPaid = schedule.payments.slice(0, monthsElapsed).reduce((sum, payment) => sum + payment.interest, 0);
      
      return {
        schedule: schedule.payments,
        currentBalance,
        principalPaid,
        totalInterestPaid,
        monthsElapsed,
        totalPayments: schedule.payments.length,
        monthlyPayment: schedule.payments[0]?.monthlyPayment || 0
      };
    } catch (error) {
      console.error('Error calculating mortgage data:', error);
      return null;
    }
  }, [property]);

  const [expenseView, setExpenseView] = useState('monthly'); // 'monthly' or 'annual'
  const [hoveredSegment, setHoveredSegment] = useState(null); // For hover interactions

  // Prepare expense data for pie chart
  const expenseChartData = useMemo(() => {
    if (!property?.monthlyExpenses || !isHydrated) return [];
    
    // Diverse color palette for better visualization
    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    return Object.entries(property.monthlyExpenses)
      .filter(([key, value]) => key !== 'total' && value > 0)
      .map(([key, value], index) => ({
        name: key.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase()),
        value: expenseView === 'annual' ? value * 12 : value,
        color: colors[index % colors.length]
      }));
  }, [property?.monthlyExpenses, expenseView, isHydrated]);

  // Generate historical income and cost data from actual property data
  const historicalData = useMemo(() => {
    if (!property || !isHydrated) return [];
    
    const data = [];
    
    // Define historical data for each property based on available CSV data
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
    
    // Get historical data for this property
    const propertyHistory = historicalDataMap[property.id] || [];
    
    // If no historical data available, create a simple current year entry
    if (propertyHistory.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      const currentIncome = property.rent?.annualRent || 0;
      const currentExpenses = property.monthlyExpenses?.total ? property.monthlyExpenses.total * 12 : 0;
      const currentCashFlow = currentIncome - currentExpenses;
      
      data.push({
        year: currentYear,
        income: currentIncome,
        expenses: currentExpenses,
        cashFlow: currentCashFlow
      });
    } else {
      // Use actual historical data
      data.push(...propertyHistory);
    }
    
    return data;
  }, [property, isHydrated]);

  if (!property) {
    return (
      <RequireAuth>
        <Layout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Property Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              The property you're looking for doesn't exist.
            </p>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{property.address}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                  {property.type}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {property.units} unit{property.units > 1 ? 's' : ''}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatNumber(property.squareFootage)} sq ft
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">Edit Property</Button>
              <Button>Add Expense</Button>
            </div>
          </div>

          {/* Property Image */}
          <div className="h-64 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-lg font-medium">Property Image</div>
                  <div className="text-sm">Upload functionality coming soon</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Main Content - Full Width */}
            <div className="space-y-6">
              {/* Property Summary & Purchase Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Property Summary & Purchase Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                      <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Original Mortgage</span>
                      <span className="font-medium">{formatCurrency(property.mortgage.originalAmount)}</span>
                    </div>
                    
                    {/* Visual Separator */}
                    <div className="pt-2 border-t border-black/10 dark:border-white/10"></div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Down Payment</span>
                      <span className="font-medium">{formatCurrency(property.purchasePrice - property.mortgage.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Closing Costs</span>
                      <span className="font-medium">{formatCurrency(property.closingCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Initial Renovations</span>
                      <span className="font-medium">{formatCurrency(property.initialRenovations)}</span>
                    </div>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between font-semibold">
                        <span>Total Investment (Cash)</span>
                        <span>{formatCurrency((property.purchasePrice - property.mortgage.originalAmount) + property.closingCosts + property.initialRenovations)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Purchase Date</span>
                      <span className="font-medium">{new Date(property.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Value</span>
                      <span className="font-medium">{formatCurrency(property.currentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Appreciation</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(property.currentValue - property.purchasePrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Financials */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Current Financials</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setExpenseView('monthly')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          expenseView === 'monthly'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setExpenseView('annual')}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          expenseView === 'annual'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        Annual
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                  <div>
                    <h3 className="font-medium mb-3">{expenseView === 'monthly' ? 'Monthly' : 'Annual'} Income</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rental Income</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {isHydrated ? formatCurrency(expenseView === 'monthly' ? (property.rent?.monthlyRent || 0) : (property.rent?.annualRent || 0)) : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{expenseView === 'monthly' ? 'Monthly' : 'Annual'} Expenses</h3>
                    <div className="space-y-2">
                      {isHydrated ? (
                        <>
                          {Object.entries(property.monthlyExpenses || {}).map(([key, value]) => {
                            if (key === 'total') return null;
                            const safeValue = value || 0;
                            const displayValue = expenseView === 'annual' ? safeValue * 12 : safeValue;
                            return (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                  -{formatCurrency(displayValue)}
                                </span>
                              </div>
                            );
                          })}
                          <div className="pt-2 border-t border-black/10 dark:border-white/10">
                            <div className="flex justify-between font-semibold">
                              <span>Total Expenses</span>
                              <span className="text-red-600 dark:text-red-400">
                                -{formatCurrency(expenseView === 'annual' ? (property.monthlyExpenses?.total || 0) * 12 : (property.monthlyExpenses?.total || 0))}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#205A3E]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{expenseView === 'monthly' ? 'Monthly' : 'Annual'} Expense Breakdown</h3>
                    <div className="h-48">
                      {expenseChartData.length > 0 ? (
                        <div className="flex items-center gap-6 h-full">
                          {/* Donut Chart */}
                          <div className="flex-shrink-0 relative">
                            <ResponsiveContainer width={120} height={120}>
                              <PieChart>
                                <Pie
                                  data={expenseChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={35}
                                  outerRadius={55}
                                  paddingAngle={2}
                                  dataKey="value"
                                  stroke="none"
                                  onMouseEnter={(data, index) => setHoveredSegment(index)}
                                  onMouseLeave={() => setHoveredSegment(null)}
                                >
                                  {expenseChartData.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color}
                                      style={{
                                        filter: hoveredSegment === index ? 'brightness(1.1) drop-shadow(0 0 6px rgba(0,0,0,0.3))' : 'none',
                                        transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
                                        transformOrigin: 'center',
                                        transition: 'all 0.2s ease-in-out'
                                      }}
                                    />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(expenseChartData.reduce((sum, item) => sum + item.value, 0))}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total {expenseView === 'monthly' ? 'Monthly' : 'Annual'} Expense
                              </div>
                            </div>
                          </div>
                          
                          {/* Data-Rich Legend */}
                          <div className="flex-1 space-y-2">
                            {expenseChartData.map((entry, index) => {
                              const total = expenseChartData.reduce((sum, item) => sum + item.value, 0);
                              const percentage = ((entry.value / total) * 100).toFixed(1);
                              
                              return (
                                <div 
                                  key={index}
                                  className={`flex items-center justify-between py-1 px-2 rounded transition-all duration-200 cursor-pointer group ${
                                    hoveredSegment === index 
                                      ? 'bg-gray-100 dark:bg-gray-700 shadow-sm' 
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                  }`}
                                  onMouseEnter={() => setHoveredSegment(index)}
                                  onMouseLeave={() => setHoveredSegment(null)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full flex-shrink-0" 
                                      style={{ backgroundColor: entry.color }}
                                    ></div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                      {entry.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-gray-500 dark:text-gray-400 min-w-[3rem] text-right">
                                      {percentage}%
                                    </span>
                                    <span className="text-gray-900 dark:text-gray-100 font-medium min-w-[4rem] text-right">
                                      {formatCurrency(entry.value)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="text-sm">No expense data available</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {isHydrated ? formatCurrency(expenseView === 'annual' ? (property.annualCashFlow || 0) : (property.monthlyCashFlow || 0)) : '--'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{expenseView === 'annual' ? 'Annual' : 'Monthly'} Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{isHydrated ? formatPercentage(property.capRate || 0) : '--'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cap Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{isHydrated ? formatPercentage(property.cashOnCashReturn || 0) : '--'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cash on Cash</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {isHydrated ? formatCurrency((property.size || property.squareFootage) > 0 ? property.rent.monthlyRent / (property.size || property.squareFootage) : 0) : '--'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Rent/Sq Ft</div>
                    </div>
                  </div>
                </div>
              </div>



              {/* Historical Performance Chart */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Historical Performance</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    Based on actual records
                  </span>
                </div>
                <div className="h-80">
                  {historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="year" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#9ca3af' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#9ca3af' }}
                          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(value), 
                            name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Cash Flow'
                          ]}
                          labelFormatter={(year) => `Year: ${year}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          formatter={(value) => {
                            switch(value) {
                              case 'income': return 'Income';
                              case 'expenses': return 'Expenses';
                              case 'cashFlow': return 'Cash Flow';
                              default: return value;
                            }
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#22c55e', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="expenses" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cashFlow" 
                          stroke="#205A3E" 
                          strokeWidth={3}
                          dot={{ fill: '#205A3E', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#205A3E', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="text-sm">No historical data available</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Mortgage Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Mortgage Details</h2>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">
                      Edit Mortgage
                    </Button>
                  </div>
                </div>
                
                {/* Mortgage Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div className="bg-gradient-to-br from-[#205A3E]/10 to-[#205A3E]/5 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</div>
                    <div className="text-xl font-bold text-[#205A3E]">
                      {formatCurrency(mortgageData?.monthlyPayment || property.mortgage.monthlyPayment || 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {property.mortgage.paymentFrequency || 'Monthly'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Current Balance</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(mortgageData?.currentBalance || property.mortgage.currentBalance || property.mortgage.originalAmount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {mortgageData ? `${mortgageData.monthsElapsed}/${mortgageData.totalPayments} payments made` : 'Payment progress'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Principal Paid</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(mortgageData?.principalPaid || 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {mortgageData && property.mortgage.originalAmount ? 
                        `${((mortgageData.principalPaid / property.mortgage.originalAmount) * 100).toFixed(1)}% paid off` : 
                        'Progress'
                      }
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Interest Paid</div>
                    <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(mortgageData?.totalInterestPaid || 0)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatPercentage(property.mortgage.interestRate * 100)} rate
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Loan Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Lender</span>
                        <span className="font-medium">{property.mortgage.lender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Original Loan Amount</span>
                        <span className="font-medium">{formatCurrency(property.mortgage.originalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                        <span className="font-medium">
                          {property.mortgage.startDate ? new Date(property.mortgage.startDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Term Length</span>
                        <span className="font-medium">{property.mortgage.termMonths / 12} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Amortization</span>
                        <span className="font-medium">{property.mortgage.amortizationYears || 'N/A'} years</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">Payment Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment Frequency</span>
                        <span className="font-medium">{property.mortgage.paymentFrequency || 'Monthly'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Next Payment Due</span>
                        <span className="font-medium">
                          {property.mortgage.nextPaymentDate ? new Date(property.mortgage.nextPaymentDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rate Type</span>
                        <span className="font-medium">{property.mortgage.rateType || 'Fixed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Renewal Date</span>
                        <span className="font-medium">
                          {property.mortgage.renewalDate ? new Date(property.mortgage.renewalDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mortgage Number</span>
                        <span className="font-medium text-sm">{property.mortgage.mortgageNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Progress Bar */}
                {mortgageData && property.mortgage.originalAmount && (
                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Payment Progress</span>
                      <span className="font-medium">
                        {`${((mortgageData.principalPaid / property.mortgage.originalAmount) * 100).toFixed(1)}%`}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#205A3E] to-[#2d7a5a] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(mortgageData.principalPaid / property.mortgage.originalAmount) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>{formatCurrency(mortgageData.principalPaid)} principal paid</span>
                      <span>{formatCurrency(mortgageData.currentBalance)} remaining</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Tenants */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Current Tenants</h2>
                <div className="space-y-3">
                  {property.tenants.map((tenant, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">{tenant.unit}</div>
                      <div className="text-emerald-600 dark:text-emerald-400">{formatCurrency(tenant.rent)}/mo</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Lease: {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annual Expense History Chart */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Annual Expense History</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    Categorized expenses
                  </span>
                </div>
                <AnnualExpenseChart expenseHistory={property?.expenseHistory || []} />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


