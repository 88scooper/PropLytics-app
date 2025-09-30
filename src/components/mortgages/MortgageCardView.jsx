"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { calculateAmortizationSchedule } from '@/utils/mortgageCalculator';

const MortgageCardView = ({ mortgage }) => {
  // Calculate mortgage data
  const mortgageData = useMemo(() => {
    if (!mortgage) return null;
    
    try {
      // Use the mortgage object directly, or fallback to nested mortgage
      const mortgageObj = mortgage.mortgage || mortgage;
      const schedule = calculateAmortizationSchedule(mortgageObj);
      const now = new Date();
      const startDate = new Date(mortgageObj.startDate);
      const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
      
      const currentPayment = schedule.payments[monthsElapsed] || schedule.payments[0];
      const currentBalance = currentPayment?.remainingBalance || mortgageObj.originalAmount;
      const principalPaid = mortgageObj.originalAmount - currentBalance;
      const totalInterestPaid = schedule.payments.slice(0, monthsElapsed).reduce((sum, payment) => sum + payment.interest, 0);
      
      // Calculate term remaining
      const termEndDate = new Date(startDate);
      termEndDate.setFullYear(termEndDate.getFullYear() + (mortgage.termYears || mortgageObj.termYears));
      const termRemainingMs = termEndDate - now;
      const termRemainingYears = Math.floor(termRemainingMs / (365.25 * 24 * 60 * 60 * 1000));
      const termRemainingMonths = Math.floor((termRemainingMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      
      // Calculate next payment date based on payment frequency
      const nextPaymentDate = new Date(now);
      const paymentFreq = (mortgageObj.paymentFrequency || mortgage.paymentFrequency || '').toUpperCase();
      if (paymentFreq === 'BIWEEKLY' || paymentFreq === 'BI-WEEKLY') {
        // For bi-weekly, assume payments every 14 days from start date
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const paymentsMade = Math.floor(daysSinceStart / 14);
        const nextPaymentDay = (paymentsMade + 1) * 14;
        nextPaymentDate.setTime(startDate.getTime() + (nextPaymentDay * 24 * 60 * 60 * 1000));
      } else if (paymentFreq === 'MONTHLY') {
        // For monthly, assume payments on the same day each month
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        nextPaymentDate.setDate(startDate.getDate());
      } else {
        // Default to monthly
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        nextPaymentDate.setDate(startDate.getDate());
      }
      
      const daysUntilPayment = Math.ceil((nextPaymentDate - now) / (1000 * 60 * 60 * 24));
      
      // Calculate renewal date remaining (current date to renewal date)
      const renewalDate = new Date(startDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + (mortgage.termYears || mortgageObj.termYears));
      const renewalRemainingMs = renewalDate - now;
      const renewalRemainingYears = Math.floor(renewalRemainingMs / (365.25 * 24 * 60 * 60 * 1000));
      const renewalRemainingMonths = Math.floor((renewalRemainingMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      
      return {
        schedule: schedule.payments,
        currentBalance,
        principalPaid,
        totalInterestPaid,
        monthsElapsed,
        totalPayments: schedule.payments.length,
        monthlyPayment: schedule.payments[0]?.monthlyPayment || 0,
        termRemaining: `${termRemainingYears} Years ${termRemainingMonths} Months`,
        renewalRemaining: `${renewalRemainingYears} Years ${renewalRemainingMonths} Months`,
        renewalDate,
        nextPaymentDate,
        daysUntilPayment,
        paymentProgress: Math.max(0, Math.min(100, (14 - daysUntilPayment) / 14 * 100))
      };
    } catch (error) {
      console.error('Error calculating mortgage data:', error);
      return null;
    }
  }, [mortgage]);

  if (!mortgageData || !mortgage) return null;

  const mortgageObj = mortgage.mortgage || mortgage;
  const startingBalance = mortgageObj.originalAmount;
  const currentBalance = mortgageData.currentBalance;
  const balancePaid = mortgageData.principalPaid;
  const monthlyPayment = mortgageData.monthlyPayment;
  const principalAmount = monthlyPayment * 0.6; // Approximate principal portion
  const interestAmount = monthlyPayment * 0.4; // Approximate interest portion

  // Donut chart data for balance - using improved color scheme
  const balanceChartData = [
    { name: 'Current Balance', value: currentBalance, color: '#6B7280' },
    { name: 'Balance Paid', value: balancePaid, color: '#F3F4F6' }
  ];

  // Donut chart data for payment breakdown - using improved color scheme
  const paymentChartData = [
    { name: 'Principal', value: principalAmount, color: '#205A3E' },
    { name: 'Interest', value: interestAmount, color: '#F3F4F6' }
  ];

  const InfoIcon = () => (
    <svg className="w-4 h-4 text-[#205A3E] dark:text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Top Summary Banner - Green Background */}
      <div className="bg-gradient-to-r from-[#205A3E] to-[#2d7a5a] text-white p-6 rounded-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Section - Balance Overview with Donut Chart */}
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 relative flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={balanceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    stroke="none"
                    strokeWidth={0}
                  >
                    {balanceChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium text-white/90">Starting Balance</div>
                  <div className="text-sm font-bold text-white">{formatCurrency(startingBalance)}</div>
                </div>
              </div>
            </div>
              <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-500 shadow-sm flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Current Balance</div>
                  <div className="font-bold text-white text-sm mt-1">{formatCurrency(currentBalance)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-white/20 shadow-sm flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Balance Paid</div>
                  <div className="font-bold text-white text-sm mt-1">{formatCurrency(balancePaid)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section - Next Payment Date with Progress Bar */}
          <div className="space-y-4 text-center">
            <div>
              <div className="text-xs font-medium text-white/80 uppercase tracking-wide mb-2">Next Payment Date</div>
              <div className="text-xl font-bold text-white mb-1">
                {mortgageData.nextPaymentDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-sm font-medium text-white/90">{mortgageData.daysUntilPayment} days remaining</div>
            </div>
            <div className="px-2">
              <div className="w-full bg-white/20 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-white to-white/90 h-3 rounded-full transition-all duration-500 shadow-sm" 
                  style={{ width: `${Math.max(0, Math.min(100, mortgageData.paymentProgress))}%` }}
                ></div>
              </div>
              <div className="text-xs text-white/70 mt-2">
                {Math.round(mortgageData.paymentProgress)}% of payment cycle complete
              </div>
            </div>
          </div>

          {/* Right Section - Total Payment Breakdown */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-xs font-medium text-white/80 uppercase tracking-wide mb-2">Total Payment</div>
              <div className="text-xl font-bold text-white">{formatCurrency(monthlyPayment)}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#205A3E] flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Principal</div>
                    <div className="font-bold text-white text-sm">{formatCurrency(principalAmount)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white/20 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-white/80 uppercase tracking-wide">Interest</div>
                    <div className="font-bold text-white text-sm">{formatCurrency(interestAmount)}</div>
                  </div>
                </div>
              </div>
              <div className="w-20 h-20 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={28}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                      stroke="none"
                      strokeWidth={0}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Mortgage Specifics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-black/10 dark:border-white/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            Mortgage Details
          </h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Address</span>
              <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">{mortgage.property?.address || mortgage.propertyName || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Lender</span>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.lenderName || mortgageObj.lender}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amortization Period</span>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.amortizationPeriodYears || mortgageObj.amortizationYears} Years {mortgage.amortizationPeriodYears ? '0' : ''} Months</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.interestRate || (mortgageObj.interestRate * 100)}%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Term</span>
                <InfoIcon />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.termYears || (mortgageObj.termMonths / 12)} Years</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {new Date(mortgage.startDate || mortgageObj.startDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Renewal Date</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {mortgageData.renewalDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Product</span>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.rateType || mortgageObj.rateType}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Type</span>
              <span className="font-semibold text-gray-900 dark:text-white">{mortgage.paymentFrequency || mortgageObj.paymentFrequency}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Loan & Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-black/10 dark:border-white/10 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
            Payment Details
          </h3>
          <div className="space-y-6">
            
            {/* Original Loan Amount */}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Original Loan Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(mortgage.originalAmount || mortgageObj.originalAmount)}</span>
            </div>

            {/* Payment Components */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Payment Components</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Principal and Interest</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Tax</span>
                  <span className="font-semibold text-gray-900 dark:text-white">-</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Additional Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Frequency</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{mortgage.paymentFrequency || mortgageObj.paymentFrequency}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remaining Amortization</span>
                    <InfoIcon />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{(mortgage.amortizationPeriodYears || mortgageObj.amortizationYears) - Math.floor(mortgageData.monthsElapsed / 12)} Years {mortgageData.monthsElapsed % 12} Months</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Term Remaining</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{mortgageData.renewalRemaining}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCardView;

