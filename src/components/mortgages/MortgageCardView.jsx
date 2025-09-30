"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercentage } from '@/utils/formatting';
import { calculateAmortizationSchedule } from '@/utils/mortgageCalculator';

const MortgageCardView = ({ mortgage }) => {
  // Calculate mortgage data
  const mortgageData = useMemo(() => {
    if (!mortgage?.mortgage) return null;
    
    try {
      const schedule = calculateAmortizationSchedule(mortgage.mortgage);
      const now = new Date();
      const startDate = new Date(mortgage.mortgage.startDate || mortgage.startDate);
      const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
      
      const currentPayment = schedule.payments[monthsElapsed] || schedule.payments[0];
      const currentBalance = currentPayment?.remainingBalance || mortgage.originalAmount;
      const principalPaid = mortgage.originalAmount - currentBalance;
      const totalInterestPaid = schedule.payments.slice(0, monthsElapsed).reduce((sum, payment) => sum + payment.interest, 0);
      
      // Calculate term remaining
      const termEndDate = new Date(startDate);
      termEndDate.setFullYear(termEndDate.getFullYear() + mortgage.termYears);
      const termRemainingMs = termEndDate - now;
      const termRemainingYears = Math.floor(termRemainingMs / (365.25 * 24 * 60 * 60 * 1000));
      const termRemainingMonths = Math.floor((termRemainingMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      
      // Calculate next payment date based on payment frequency
      const nextPaymentDate = new Date(now);
      if (mortgage.paymentFrequency === 'BIWEEKLY') {
        // For bi-weekly, assume payments every 14 days from start date
        const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const paymentsMade = Math.floor(daysSinceStart / 14);
        const nextPaymentDay = (paymentsMade + 1) * 14;
        nextPaymentDate.setTime(startDate.getTime() + (nextPaymentDay * 24 * 60 * 60 * 1000));
      } else if (mortgage.paymentFrequency === 'MONTHLY') {
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
      renewalDate.setFullYear(renewalDate.getFullYear() + mortgage.termYears);
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

  const startingBalance = mortgage.originalAmount;
  const currentBalance = mortgageData.currentBalance;
  const balancePaid = mortgageData.principalPaid;
  const monthlyPayment = mortgageData.monthlyPayment;
  const principalAmount = monthlyPayment * 0.6; // Approximate principal portion
  const interestAmount = monthlyPayment * 0.4; // Approximate interest portion

  // Donut chart data for balance - using proper colors from design
  const balanceChartData = [
    { name: 'Current Balance', value: currentBalance, color: '#205A3E' },
    { name: 'Balance Paid', value: balancePaid, color: '#D1D5DB' }
  ];

  // Donut chart data for payment breakdown - using proper colors from design
  const paymentChartData = [
    { name: 'Principal', value: principalAmount, color: '#205A3E' },
    { name: 'Interest', value: interestAmount, color: '#D1D5DB' }
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
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={balanceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {balanceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xs font-medium">Starting Balance</div>
                  <div className="text-sm font-bold">{formatCurrency(startingBalance)}</div>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-[#205A3E]"></div>
                <span>Current Balance: <strong>{formatCurrency(currentBalance)}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Balance Paid: <strong>{formatCurrency(balancePaid)}</strong></span>
              </div>
            </div>
          </div>

          {/* Middle Section - Next Payment Date with Progress Bar */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-white/80">Next Payment Date</div>
              <div className="text-lg font-bold">
                {mortgageData.nextPaymentDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-sm text-white/80">{mortgageData.daysUntilPayment} days</div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${mortgageData.paymentProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Section - Total Payment Breakdown */}
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-white/80">Total Payment</div>
              <div className="text-xl font-bold">{formatCurrency(monthlyPayment)}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs">Principal: <strong>{formatCurrency(principalAmount)}</strong></div>
                <div className="text-xs">Interest: <strong>{formatCurrency(interestAmount)}</strong></div>
              </div>
              <div className="w-16 h-16 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={25}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Property Address</span>
              <span className="font-medium text-right">{mortgage.property?.address || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Lender</span>
              <span className="font-medium">{mortgage.lenderName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Amortization Period</span>
              <span className="font-medium">{mortgage.amortizationPeriodYears} Years {mortgage.amortizationPeriodYears ? '0' : ''} Months</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Rate</span>
              <span className="font-medium">{mortgage.interestRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Term</span>
                <InfoIcon />
              </div>
              <span className="font-medium">{mortgage.termYears} Years</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Start Date</span>
              <span className="font-medium">
                {new Date(mortgage.startDate).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Renewal Date</span>
              <span className="font-medium">
                {mortgageData.renewalDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Product</span>
              <span className="font-medium">{mortgage.rateType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Payment Type</span>
              <span className="font-medium">Fixed Payment</span>
            </div>
          </div>
        </div>

        {/* Right Column - Loan & Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-black/10 dark:border-white/10 p-6">
          <div className="space-y-6">
            
            {/* Original Loan Amount */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Original Loan Amount</span>
              <span className="font-medium">{formatCurrency(mortgage.originalAmount)}</span>
            </div>

            {/* Payment Components */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Payment Components</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Principal and Interest</span>
                  <span className="font-medium">{formatCurrency(monthlyPayment)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Property Tax</span>
                  <span className="font-medium">-</span>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Additional Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Payment Frequency</span>
                  <span className="font-medium">{mortgage.paymentFrequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">Remaining Amortization</span>
                    <InfoIcon />
                  </div>
                  <span className="font-medium">{mortgage.amortizationPeriodYears - Math.floor(mortgageData.monthsElapsed / 12)} Years {mortgageData.monthsElapsed % 12} Months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Term Remaining</span>
                  <span className="font-medium">{mortgageData.renewalRemaining}</span>
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
