"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useProperties, usePropertyContext } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

// Calculate YoY change percentage
function calculateYoYChange(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return null;
  return ((currentValue - previousValue) / previousValue) * 100;
}

// Get revenue for a specific period with proper tenant transition handling
function getRevenueForPeriod(property, year, startMonth = 1, endMonth = 12) {
  if (!property.tenants || property.tenants.length === 0) return 0;
  
  const targetYear = parseInt(year);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // Create period start and end dates
  const periodStart = new Date(targetYear, startMonth - 1, 1);
  const periodEnd = new Date(targetYear, endMonth, 0); // Last day of endMonth
  
  // For current year, limit to current month if period extends beyond
  if (targetYear === currentYear && endMonth > currentMonth) {
    const adjustedEndMonth = Math.min(endMonth, currentMonth);
    const adjustedPeriodEnd = new Date(targetYear, adjustedEndMonth, 0);
    periodEnd.setTime(adjustedPeriodEnd.getTime());
  }
  
  let totalRevenue = 0;
  
  // Process each tenant to calculate revenue for the period
  property.tenants.forEach(tenant => {
    const leaseStart = new Date(tenant.leaseStart);
    const leaseEnd = tenant.leaseEnd === 'Active' 
      ? new Date(currentYear, currentMonth - 1, new Date().getDate())
      : new Date(tenant.leaseEnd);
    
    // Check if tenant was active during any part of the period
    if (leaseStart <= periodEnd && leaseEnd >= periodStart) {
      // Calculate the overlap between tenant lease and the period
      const overlapStart = new Date(Math.max(leaseStart.getTime(), periodStart.getTime()));
      const overlapEnd = new Date(Math.min(leaseEnd.getTime(), periodEnd.getTime()));
      
      // Calculate days in overlap
      const daysInOverlap = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1);
      
      // Calculate days in the month for proration
      const overlapStartMonth = overlapStart.getMonth();
      const overlapEndMonth = overlapEnd.getMonth();
      
      let monthlyRevenue = 0;
      
      // Handle same month
      if (overlapStartMonth === overlapEndMonth) {
        const daysInMonth = new Date(overlapStart.getFullYear(), overlapStart.getMonth() + 1, 0).getDate();
        const prorationFactor = daysInOverlap / daysInMonth;
        monthlyRevenue = tenant.rent * prorationFactor;
      } else {
        // Handle multiple months
        for (let month = overlapStartMonth; month <= overlapEndMonth; month++) {
          const monthStart = new Date(overlapStart.getFullYear(), month, 1);
          const monthEnd = new Date(overlapStart.getFullYear(), month + 1, 0);
          
          const monthOverlapStart = new Date(Math.max(overlapStart.getTime(), monthStart.getTime()));
          const monthOverlapEnd = new Date(Math.min(overlapEnd.getTime(), monthEnd.getTime()));
          
          const daysInMonth = monthEnd.getDate();
          const daysInOverlap = Math.max(0, Math.ceil((monthOverlapEnd - monthOverlapStart) / (1000 * 60 * 60 * 24)) + 1);
          const prorationFactor = daysInOverlap / daysInMonth;
          
          monthlyRevenue += tenant.rent * prorationFactor;
        }
      }
      
      totalRevenue += monthlyRevenue;
    }
  });
  
  return totalRevenue;
}

// Get expenses for a specific period with prorated annual expenses
function getExpensesForPeriod(property, year, startMonth = 1, endMonth = 12) {
  if (!property.expenseHistory) return 0;
  
  const targetYear = parseInt(year);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  // For current year, limit to current month if period extends beyond
  const actualEndMonth = targetYear === currentYear ? Math.min(endMonth, currentMonth) : endMonth;
  
  let totalExpenses = 0;
  
  // Process each expense
  property.expenseHistory.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth() + 1;
    
    // Only process expenses from the target year
    if (expenseYear !== targetYear) return;
    
    // Determine if this is an annual expense that should be prorated
    const isAnnualExpense = expense.category === 'Property Tax' || 
                           expense.category === 'Insurance' ||
                           expense.amount > 1000; // Large expenses likely annual
    
    if (isAnnualExpense) {
      // Prorate annual expenses across the entire year
      const monthsInYear = 12;
      const proratedAmount = (expense.amount / monthsInYear) * (actualEndMonth - startMonth + 1);
      totalExpenses += proratedAmount;
    } else {
      // For monthly/one-time expenses, only include if they fall within the period
      if (expenseMonth >= startMonth && expenseMonth <= actualEndMonth) {
        totalExpenses += expense.amount;
      }
    }
  });
  
  return totalExpenses;
}

// Calculate YoY changes with proper period-over-period comparison and data completeness warnings
function calculateYoYChanges(property) {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Compare Jan through current month for both years
  const startMonth = 1;
  const endMonth = currentMonth;
  
  // Get current year data (Jan through current month)
  const currentRevenue = getRevenueForPeriod(property, currentYear.toString(), startMonth, endMonth);
  const currentExpenses = getExpensesForPeriod(property, currentYear.toString(), startMonth, endMonth);
  
  // Get previous year data (Jan through same month)
  const previousRevenue = getRevenueForPeriod(property, previousYear.toString(), startMonth, endMonth);
  const previousExpenses = getExpensesForPeriod(property, previousYear.toString(), startMonth, endMonth);
  
  // Calculate YoY changes
  const yoyRevenueChange = calculateYoYChange(currentRevenue, previousRevenue);
  const yoyExpenseChange = calculateYoYChange(currentExpenses, previousExpenses);
  
  // Create comparison period description
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const comparisonPeriod = startMonth === endMonth 
    ? monthNames[startMonth - 1] 
    : `${monthNames[startMonth - 1]}-${monthNames[endMonth - 1]}`;
  
  // Determine if current year data is incomplete
  const isIncompleteData = currentMonth < 12;
  const dataCompletenessWarning = isIncompleteData 
    ? `Based on ${comparisonPeriod} data only` 
    : 'Full year comparison';
  
  // Check if we have sufficient data for meaningful comparison
  const hasData = previousRevenue > 0 && previousExpenses > 0 && currentRevenue > 0 && currentExpenses > 0;
  
  return {
    yoyRevenueChange,
    yoyExpenseChange,
    currentRevenue,
    currentExpenses,
    previousRevenue,
    previousExpenses,
    comparisonPeriod,
    isIncompleteData,
    dataCompletenessWarning,
    hasData
  };
}

export default function MyPropertiesPage() {
  const { calculationsComplete } = usePropertyContext();
  const properties = useProperties();
  
  // Show loading state until calculations are complete to prevent undefined values
  if (!calculationsComplete) {
    return (
      <RequireAuth>
        <Layout>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Investment Properties</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage and view details for all your properties.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E]"></div>
              <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading property data...</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Investment Properties</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage and view details for all your properties.
              </p>
            </div>
            <Button onClick={() => console.log("Add new property")}>
              Add New Property
            </Button>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                No properties yet. Add your first investment property to get started.
              </div>
              <Button onClick={() => console.log("Add first property")}>
                Add Your First Property
              </Button>
            </div>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}

function PropertyCard({ property }) {
  const [irrYears, setIrrYears] = useState(5); // Default to 5 years
  const monthlyCashFlow = property.monthlyCashFlow;
  const capRate = property.capRate;
  const squareFeet = property.size || property.squareFootage || 0;
  const rentPerSqFt = squareFeet > 0 ? property.rent.monthlyRent / squareFeet : 0;
  
  // Calculate Key Metrics
  const annualCashFlow = property.annualCashFlow || (monthlyCashFlow * 12);
  const downPayment = property.purchasePrice - (property.mortgage?.originalAmount || 0);
  const closingCosts = property.closingCosts || 0;
  const initialRenovations = property.initialRenovations || 0;
  const totalInitialCashInvested = downPayment + closingCosts + initialRenovations;
  
  // Cash on Cash Return = Annual Cash Flow / Total Initial Cash Invested
  const cashOnCashReturn = totalInitialCashInvested > 0 ? (annualCashFlow / totalInitialCashInvested) * 100 : 0;
  
  // Debt Service Coverage Ratio (DSCR) = NOI / Annual Debt Service
  // NOI = Net Operating Income = Annual Revenue - Annual Operating Expenses (excluding debt service)
  // Annual Debt Service = Annual Principal + Annual Interest payments
  const annualRevenue = property.rent.monthlyRent * 12;
  const monthlyPrincipal = property.monthlyExpenses?.mortgagePrincipal || 0;
  const monthlyInterest = property.monthlyExpenses?.mortgageInterest || 0;
  const monthlyDebtService = monthlyPrincipal + monthlyInterest;
  const annualDebtService = monthlyDebtService * 12;
  
  // Calculate NOI: Annual Revenue - Annual Operating Expenses (excluding debt service)
  const monthlyOperatingExpenses = (property.monthlyExpenses?.total || 0) - monthlyDebtService;
  const annualOperatingExpenses = monthlyOperatingExpenses * 12;
  const noi = annualRevenue - annualOperatingExpenses;
  
  // DSCR = NOI / Annual Debt Service
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
  
  // Internal Rate of Return (simplified calculation with adjustable years)
  // This is a simplified IRR calculation - in practice, IRR would require more complex calculations
  const currentValue = property.currentMarketValue || property.currentValue || 0;
  const totalReturn = currentValue - property.purchasePrice;
  const yearsHeld = new Date().getFullYear() - new Date(property.purchaseDate).getFullYear();
  
  // Calculate IRR based on selected years
  const calculateIRR = (years) => {
    if (years <= 0 || totalInitialCashInvested <= 0) return 0;
    
    // Simplified IRR: assumes property value grows and cash flow continues for the specified years
    const projectedValue = currentValue * Math.pow(1.03, years); // Assume 3% annual appreciation
    const totalCashFlow = annualCashFlow * years;
    const totalReturn = projectedValue + totalCashFlow - totalInitialCashInvested;
    
    return Math.pow((totalReturn + totalInitialCashInvested) / totalInitialCashInvested, 1/years) - 1;
  };
  
  const irr = calculateIRR(irrYears);
  
  return (
    <Link 
      href={`/my-properties/${property.id}`}
      prefetch={false}
      className="group block rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 bg-white dark:bg-neutral-900"
    >
      <div className="aspect-square relative overflow-hidden">
        {property.imageUrl ? (
          <Image 
            src={`${property.imageUrl}?v=3`}
            alt={property.nickname || property.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
      </div>
      
      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#205A3E] dark:group-hover:text-[#4ade80] transition-colors">
            {property.nickname || property.name}
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Price</div>
            <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(property.purchasePrice)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Units</div>
            <div className="font-semibold text-gray-900 dark:text-white">{property.units || 1}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Rent</div>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(property.rent.monthlyRent)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</div>
            <div className="font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(property.monthlyExpenses?.total || 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cash Flow</div>
            <div className={`font-semibold ${monthlyCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(monthlyCashFlow)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rent/Sq Ft</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(rentPerSqFt)}
            </div>
          </div>
        </div>
        
        <div className="mt-5 pt-5 border-t border-black/10 dark:border-white/10">
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Key Metrics</h4>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <KeyMetricCard
              title="Cap Rate"
              value={formatPercentage(capRate)}
              tooltipText="The capitalization rate measures the property's return based on its income relative to its value. A strong cap rate for Toronto area rentals is typically 5-7%."
              statusTone={capRate >= 5 ? 'positive' : capRate >= 3.5 ? 'neutral' : 'warning'}
              statusMessage={capRate >= 5 ? 'Strong' : capRate >= 3.5 ? 'Moderate' : 'Low'}
            />
            <KeyMetricCard
              title="Cash on Cash"
              value={formatPercentage(cashOnCashReturn)}
              tooltipText="Cash-on-cash return shows the annual return on your initial cash investment. A good cash-on-cash return is generally between 8-12%."
              statusTone={cashOnCashReturn >= 8 ? 'positive' : cashOnCashReturn >= 5 ? 'neutral' : 'warning'}
              statusMessage={cashOnCashReturn >= 8 ? 'Strong' : cashOnCashReturn >= 5 ? 'Moderate' : 'Low'}
            />
            <KeyMetricCard
              title="DSCR"
              value={dscr > 0 ? dscr.toFixed(2) : 'N/A'}
              tooltipText="Debt Service Coverage Ratio measures the property's ability to cover its debt payments. A DSCR above 1.25 is generally considered healthy."
              statusTone={dscr >= 1.25 ? 'positive' : dscr >= 1.0 ? 'neutral' : 'warning'}
              statusMessage={dscr >= 1.25 ? 'Healthy' : dscr >= 1.0 ? 'Adequate' : 'Risk'}
            />
            <KeyMetricCard
              title="IRR"
              value={formatPercentage(irr * 100)}
              tooltipText="Internal Rate of Return estimates the annualized return on investment over the selected time period, accounting for cash flows and property appreciation."
              statusTone={irr >= 0.12 ? 'positive' : irr >= 0.08 ? 'neutral' : 'warning'}
              statusMessage={irr >= 0.12 ? 'Strong' : irr >= 0.08 ? 'Moderate' : 'Low'}
              customContent={
                <select 
                  value={irrYears} 
                  onChange={(e) => setIrrYears(parseInt(e.target.value))}
                  className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#205A3E] dark:focus:ring-[#4ade80] mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value={3}>3Y</option>
                  <option value={5}>5Y</option>
                  <option value={10}>10Y</option>
                  <option value={15}>15Y</option>
                  <option value={20}>20Y</option>
                </select>
              }
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function KeyMetricCard({ title, value, tooltipText, statusTone = 'neutral', statusMessage, customContent }) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Gradient configurations matching Portfolio page aesthetic
  const gradientConfig = {
    positive: {
      border: 'border-[#205A3E]/30 dark:border-[#1C4F39]/40',
      gradient: 'from-[#D9E5DC] via-[#F4F8F5] to-transparent dark:from-[#1A2F25] dark:via-[#101B15] dark:to-transparent',
    },
    neutral: {
      border: 'border-[#1A4A5A]/25 dark:border-[#123640]/40',
      gradient: 'from-[#D8E6EA] via-[#F5F9FA] to-transparent dark:from-[#11252B] dark:via-[#0B181D] dark:to-transparent',
    },
    warning: {
      border: 'border-[#B57A33]/25 dark:border-[#8C5D24]/35',
      gradient: 'from-[#F3E6D4] via-[#FBF6EE] to-transparent dark:from-[#2A2014] dark:via-[#1B140C] dark:to-transparent',
    },
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

  const gradient = gradientConfig[statusTone] || gradientConfig.neutral;
  const statusStyles = statusToneConfig[statusTone] || statusToneConfig.neutral;

  return (
    <div className={`relative overflow-hidden rounded-lg border ${gradient.border} bg-gradient-to-br ${gradient.gradient} p-3 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{title}</h5>
          {tooltipText && (
            <div 
              className="relative flex-shrink-0"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div className="w-3 h-3 rounded-full bg-white/90 dark:bg-gray-100 border border-[#205A3E] dark:border-[#4ade80] flex items-center justify-center cursor-help hover:border-[#205A3E]/80 dark:hover:border-[#4ade80]/80 transition-colors">
                <span className="text-[#205A3E] dark:text-[#4ade80] text-[8px] font-bold leading-none">i</span>
              </div>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-[#205A3E] text-white text-xs rounded-lg pointer-events-none whitespace-normal z-50 w-64 shadow-lg">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#205A3E]"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>

      {statusMessage && (
        <div className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusStyles.bg} ${statusStyles.border} ${statusStyles.text} inline-block`}>
          {statusMessage}
        </div>
      )}

      {customContent && (
        <div className="mt-2">
          {customContent}
        </div>
      )}
    </div>
  );
}


