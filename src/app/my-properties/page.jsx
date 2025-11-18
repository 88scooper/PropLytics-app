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
      className="group block rounded-lg border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-black/20 dark:hover:border-white/20"
    >
      <div className="aspect-square relative overflow-hidden">
        {property.imageUrl ? (
          <Image 
            src={property.imageUrl} 
            alt={property.nickname || property.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700" />
        )}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-base sm:text-lg group-hover:text-[#205A3E] dark:group-hover:text-[#4ade80] transition-colors">
            {property.nickname || property.name}
          </h3>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3">
          {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
            <div className="font-medium">{formatCurrency(property.purchasePrice)}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Units</div>
            <div className="font-medium">{property.units || 1}</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Monthly Rent</div>
            <div className="font-medium text-emerald-600 dark:text-emerald-400">
              {formatCurrency(property.rent.monthlyRent)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Monthly Expenses</div>
            <div className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(property.monthlyExpenses?.total || 0)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Cash Flow</div>
            <div className={`font-medium ${monthlyCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(monthlyCashFlow)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Rent/Sq Ft</div>
            <div className="font-medium">
              {formatCurrency(rentPerSqFt)}
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Key Metrics</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">Cap Rate</div>
                <div className="font-medium text-[#205A3E] dark:text-[#4ade80]">
                  {formatPercentage(capRate)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">Cash on Cash</div>
                <div className="font-medium text-[#205A3E] dark:text-[#4ade80]">
                  {formatPercentage(cashOnCashReturn)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">DSCR</div>
                <div className="font-medium text-[#205A3E] dark:text-[#4ade80]">
                  {dscr > 0 ? dscr.toFixed(2) : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400">IRR</div>
                <div className="font-medium text-[#205A3E] dark:text-[#4ade80]">
                  {formatPercentage(irr * 100)}
                </div>
                <div className="mt-1">
                  <select 
                    value={irrYears} 
                    onChange={(e) => setIrrYears(parseInt(e.target.value))}
                    className="text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#205A3E] dark:focus:ring-[#4ade80]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value={3}>3Y</option>
                    <option value={5}>5Y</option>
                    <option value={10}>10Y</option>
                    <option value={15}>15Y</option>
                    <option value={20}>20Y</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


