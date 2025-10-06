"use client";

import { useState, use, useMemo } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useProperty } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage, formatNumber } from "@/utils/formatting";
import { calculateAmortizationSchedule } from "@/utils/mortgageCalculator";

export default function PropertyDetailPage({ params }) {
  const { propertyId } = use(params) || {};
  
  // Get property data using propertyId from PropertyContext
  const property = useProperty(propertyId);

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

  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [expenseView, setExpenseView] = useState('monthly'); // 'monthly' or 'annual'

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

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchase & Initial Costs */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Purchase & Initial Costs</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                      <span className="font-medium">{formatCurrency(property.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Down Payment</span>
                      <span className="font-medium">{formatCurrency(property.purchasePrice - property.mortgage.originalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Closing Costs</span>
                      <span className="font-medium">{formatCurrency(property.closingCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Renovation Costs</span>
                      <span className="font-medium">{formatCurrency(property.renovationCosts)}</span>
                    </div>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between font-semibold">
                        <span>Total Investment</span>
                        <span>{formatCurrency(property.totalInvestment)}</span>
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
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-3">{expenseView === 'monthly' ? 'Monthly' : 'Annual'} Income</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rental Income</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(expenseView === 'monthly' ? property.rent.monthlyRent : property.rent.annualRent)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">{expenseView === 'monthly' ? 'Monthly' : 'Annual'} Expenses</h3>
                    <div className="space-y-2">
                      {Object.entries(property.monthlyExpenses).map(([key, value]) => {
                        if (key === 'total') return null;
                        const displayValue = expenseView === 'annual' ? value * 12 : value;
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
                            -{formatCurrency(expenseView === 'annual' ? property.monthlyExpenses.total * 12 : property.monthlyExpenses.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(expenseView === 'annual' ? property.annualCashFlow : property.monthlyCashFlow)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{expenseView === 'annual' ? 'Annual' : 'Monthly'} Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPercentage(property.capRate)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cap Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatPercentage(property.cashOnCashReturn)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cash on Cash</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Mortgage Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Mortgage Details</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    >
                      {showPaymentHistory ? 'Hide' : 'View'} Schedule
                    </Button>
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

              {/* Payment History */}
              {mortgageData && (
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Payment History</h2>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    >
                      {showPaymentHistory ? 'Hide' : 'Show'} Full Schedule
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10">
                          <th className="text-left py-2 font-medium">Payment #</th>
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-right py-2 font-medium">Principal</th>
                          <th className="text-right py-2 font-medium">Interest</th>
                          <th className="text-right py-2 font-medium">Total</th>
                          <th className="text-right py-2 font-medium">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(showPaymentHistory ? mortgageData.schedule : mortgageData.schedule.slice(0, 12)).map((payment, index) => (
                          <tr key={index} className="border-b border-black/5 dark:border-white/5">
                            <td className="py-2">{payment.paymentNumber}</td>
                            <td className="py-2">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td className="text-right py-2 text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(payment.principal)}
                            </td>
                            <td className="text-right py-2 text-red-600 dark:text-red-400">
                              {formatCurrency(payment.interest)}
                            </td>
                            <td className="text-right py-2 font-medium">
                              {formatCurrency(payment.monthlyPayment)}
                            </td>
                            <td className="text-right py-2 text-gray-600 dark:text-gray-400">
                              {formatCurrency(payment.remainingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {!showPaymentHistory && mortgageData.schedule.length > 12 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Showing first 12 of {mortgageData.schedule.length} payments
                        </p>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setShowPaymentHistory(true)}
                        >
                          View Complete Schedule
                        </Button>
                      </div>
                    )}
                    
                    {showPaymentHistory && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Showing all {mortgageData.schedule.length} payments
                        </p>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => setShowPaymentHistory(false)}
                        >
                          Show Less
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Charts Placeholder */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Charts</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-48 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-sm">Cash Flow Over Time</div>
                      <div className="text-xs">Chart placeholder</div>
                    </div>
                  </div>
                  <div className="h-48 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-sm">Expense Breakdown</div>
                      <div className="text-xs">Chart placeholder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mortgage Summary - Coming Soon */}
              {false && (
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                  <h3 className="font-semibold mb-3">Mortgage Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                      <span className="font-medium">{formatCurrency(mortgageData.currentBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
                      <span className="font-medium">{formatCurrency(mortgageData.paymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <span className="font-medium">{mortgageData.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Principal Paid</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(mortgageData.purchasePrice - mortgageData.currentBalance)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between font-medium">
                        <span>Total Payments</span>
                        <span>{mortgageData.paymentHistory.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                    <span className="font-medium">{property.occupancy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Annual Cash Flow</span>
                    <span className={`font-medium ${property.annualCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(property.annualCashFlow)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Units</span>
                    <span className="font-medium">{property.units}</span>
                  </div>
                </div>
              </div>

              {/* Tenants */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Current Tenants</h3>
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

              {/* Property Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Square Footage</span>
                    <span className="font-medium">{formatNumber(property.squareFootage)} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Property Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


