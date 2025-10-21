/**
 * Sensitivity Analysis Utility Functions
 * 
 * This module provides functions for:
 * - 10-year financial forecasts
 * - IRR (Internal Rate of Return) calculations
 * - Scenario modeling with variable assumptions
 */

import { getCurrentMortgageBalance, getMonthlyMortgagePayment } from '@/utils/mortgageCalculator';

/**
 * Default assumptions for sensitivity analysis
 */
export const DEFAULT_ASSUMPTIONS = {
  annualRentIncrease: 2.0, // 2% per year
  annualExpenseInflation: 2.5, // 2.5% per year
  annualPropertyAppreciation: 3.0, // 3% per year
  vacancyRate: 5.0, // 5% vacancy allowance
  futureInterestRate: 5.0, // 5% for mortgage renewals
  exitCapRate: 5.0, // 5% cap rate for calculating future sale price
};

/**
 * Calculate IRR using Newton-Raphson method
 * @param {Array<number>} cashFlows - Array of cash flows (negative for investment, positive for returns)
 * @returns {number} IRR as a percentage
 */
export function calculateIRR(cashFlows) {
  if (!cashFlows || cashFlows.length < 2) {
    return 0;
  }

  // Initial guess
  let rate = 0.1;
  const maxIterations = 1000;
  const tolerance = 0.000001;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      dnpv += (-j * cashFlows[j]) / Math.pow(1 + rate, j + 1);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }

    rate = newRate;
  }

  return rate * 100; // Return as percentage even if not converged
}

/**
 * Calculate NPV (Net Present Value)
 * @param {Array<number>} cashFlows - Array of cash flows
 * @param {number} discountRate - Discount rate as decimal (e.g., 0.08 for 8%)
 * @returns {number} NPV
 */
export function calculateNPV(cashFlows, discountRate) {
  return cashFlows.reduce((npv, cashFlow, year) => {
    return npv + cashFlow / Math.pow(1 + discountRate, year);
  }, 0);
}

/**
 * Generate 10-year forecast for a property
 * @param {Object} property - Property object
 * @param {Object} assumptions - Forecast assumptions
 * @returns {Object} Forecast data with yearly projections
 */
export function generateForecast(property, assumptions = DEFAULT_ASSUMPTIONS) {
  const forecast = {
    years: [],
    netCashFlow: [],
    mortgageBalance: [],
    propertyValue: [],
    equity: [],
    cumulativeCashFlow: [],
    totalProfit: [],
    noi: [], // Net Operating Income (before debt service)
  };

  // Get current mortgage details
  let currentMortgageBalance;
  try {
    currentMortgageBalance = getCurrentMortgageBalance(property.mortgage);
  } catch (error) {
    console.warn('Error getting mortgage balance, using original amount:', error);
    currentMortgageBalance = property.mortgage.originalAmount;
  }

  let monthlyMortgagePayment;
  try {
    monthlyMortgagePayment = getMonthlyMortgagePayment(property.mortgage);
  } catch (error) {
    console.warn('Error calculating mortgage payment:', error);
    // Fallback calculation
    const monthlyRate = (property.mortgage.interestRate / 12);
    const numPayments = property.mortgage.amortizationYears * 12;
    monthlyMortgagePayment = property.mortgage.originalAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Starting values
  let currentRent = property.rent.monthlyRent;
  let currentPropertyValue = property.currentMarketValue;
  let mortgageBalance = currentMortgageBalance;
  let cumulativeCashFlow = 0;
  
  // Calculate current monthly operating expenses (excluding mortgage)
  const currentMonthlyOperatingExpenses = 
    (property.monthlyExpenses.propertyTax || 0) +
    (property.monthlyExpenses.condoFees || 0) +
    (property.monthlyExpenses.insurance || 0) +
    (property.monthlyExpenses.maintenance || 0) +
    (property.monthlyExpenses.professionalFees || 0) +
    (property.monthlyExpenses.utilities || 0);

  // Project 10 years into the future
  for (let year = 1; year <= 10; year++) {
    forecast.years.push(year);

    // Calculate rent with vacancy allowance
    const effectiveRent = currentRent * (1 - assumptions.vacancyRate / 100);
    const annualRentalIncome = effectiveRent * 12;

    // Calculate operating expenses (grows with inflation)
    const annualOperatingExpenses = currentMonthlyOperatingExpenses * 12 * 
      Math.pow(1 + assumptions.annualExpenseInflation / 100, year - 1);

    // Calculate NOI (Net Operating Income - before debt service)
    const noi = annualRentalIncome - annualOperatingExpenses;

    // Calculate interest payment for this year
    const monthlyInterestRate = property.mortgage.interestRate / 12;
    const annualInterest = mortgageBalance * property.mortgage.interestRate;

    // Calculate principal payment
    const annualMortgagePayment = monthlyMortgagePayment * 12;
    const annualPrincipal = Math.min(annualMortgagePayment - annualInterest, mortgageBalance);

    // Update mortgage balance
    mortgageBalance = Math.max(0, mortgageBalance - annualPrincipal);

    // Calculate net cash flow (after debt service)
    const netCashFlow = annualRentalIncome - annualOperatingExpenses - annualMortgagePayment;
    cumulativeCashFlow += netCashFlow;

    // Calculate property value
    // For year 10, use Exit Cap Rate formula: Future Sale Price = NOI / Exit Cap Rate
    // For other years, use appreciation model
    if (year === 10 && assumptions.exitCapRate && assumptions.exitCapRate > 0) {
      currentPropertyValue = noi / (assumptions.exitCapRate / 100);
    } else {
      currentPropertyValue = property.currentMarketValue * 
        Math.pow(1 + assumptions.annualPropertyAppreciation / 100, year);
    }

    // Calculate equity
    const equity = currentPropertyValue - mortgageBalance;

    // Calculate total profit if sold today (equity + cumulative cash flow - initial investment)
    const totalProfit = equity + cumulativeCashFlow - property.totalInvestment;

    // Store values
    forecast.netCashFlow.push(netCashFlow);
    forecast.mortgageBalance.push(mortgageBalance);
    forecast.propertyValue.push(currentPropertyValue);
    forecast.equity.push(equity);
    forecast.cumulativeCashFlow.push(cumulativeCashFlow);
    forecast.totalProfit.push(totalProfit);
    forecast.noi.push(noi);

    // Update rent for next year
    currentRent = currentRent * (1 + assumptions.annualRentIncrease / 100);
  }

  return forecast;
}

/**
 * Calculate key return metrics for a property over 10 years
 * @param {Object} property - Property object
 * @param {Object} assumptions - Forecast assumptions
 * @returns {Object} Return metrics (IRR, average annual cash flow, total profit)
 */
export function calculateReturnMetrics(property, assumptions = DEFAULT_ASSUMPTIONS) {
  const forecast = generateForecast(property, assumptions);

  // Calculate IRR
  // Cash flows: Year 0 = -initial investment, Years 1-9 = net cash flow, Year 10 = net cash flow + sale proceeds
  const cashFlows = [
    -property.totalInvestment, // Initial investment (negative)
    ...forecast.netCashFlow.slice(0, 9), // Years 1-9 cash flows
    forecast.netCashFlow[9] + forecast.equity[9] // Year 10: cash flow + equity from sale
  ];

  const irr = calculateIRR(cashFlows);

  // Calculate average annual cash flow
  const averageAnnualCashFlow = forecast.netCashFlow.reduce((sum, cf) => sum + cf, 0) / 10;

  // Total profit at end of year 10 (if property is sold)
  const totalProfitAtSale = forecast.totalProfit[9];

  return {
    irr,
    averageAnnualCashFlow,
    totalProfitAtSale,
    forecast
  };
}

/**
 * Compare two scenarios and calculate percentage differences
 * @param {Object} baseline - Baseline metrics
 * @param {Object} newScenario - New scenario metrics
 * @returns {Object} Comparison with differences
 */
export function compareScenarios(baseline, newScenario) {
  return {
    irr: {
      baseline: baseline.irr,
      newScenario: newScenario.irr,
      difference: newScenario.irr - baseline.irr,
      percentChange: baseline.irr !== 0 ? ((newScenario.irr - baseline.irr) / Math.abs(baseline.irr)) * 100 : 0
    },
    averageAnnualCashFlow: {
      baseline: baseline.averageAnnualCashFlow,
      newScenario: newScenario.averageAnnualCashFlow,
      difference: newScenario.averageAnnualCashFlow - baseline.averageAnnualCashFlow,
      percentChange: baseline.averageAnnualCashFlow !== 0 ? 
        ((newScenario.averageAnnualCashFlow - baseline.averageAnnualCashFlow) / Math.abs(baseline.averageAnnualCashFlow)) * 100 : 0
    },
    totalProfitAtSale: {
      baseline: baseline.totalProfitAtSale,
      newScenario: newScenario.totalProfitAtSale,
      difference: newScenario.totalProfitAtSale - baseline.totalProfitAtSale,
      percentChange: baseline.totalProfitAtSale !== 0 ? 
        ((newScenario.totalProfitAtSale - baseline.totalProfitAtSale) / Math.abs(baseline.totalProfitAtSale)) * 100 : 0
    }
  };
}

/**
 * Format forecast data for chart display
 * @param {Object} forecast - Forecast object from generateForecast
 * @returns {Array} Array of data points for charting
 */
export function formatForecastForChart(forecast) {
  return forecast.years.map((year, index) => ({
    year,
    netCashFlow: Math.round(forecast.netCashFlow[index]),
    mortgageBalance: Math.round(forecast.mortgageBalance[index]),
    equity: Math.round(forecast.equity[index]),
    propertyValue: Math.round(forecast.propertyValue[index]),
    cumulativeCashFlow: Math.round(forecast.cumulativeCashFlow[index])
  }));
}

/**
 * Calculate YoY (Year-over-Year) metrics for property analysis
 * @param {Object} property - Property object
 * @param {Object} assumptions - Forecast assumptions
 * @param {Object} baselineAssumptions - Baseline assumptions for comparison
 * @returns {Object} YoY metrics including historical and projected changes
 */
export function calculateYoYMetrics(property, assumptions = DEFAULT_ASSUMPTIONS, baselineAssumptions = DEFAULT_ASSUMPTIONS) {
  if (!property) return null;

  // Historical data for YoY calculations
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

  const historicalData = historicalDataMap[property.id] || [];
  const currentYear = new Date().getFullYear().toString();
  const previousYear = (new Date().getFullYear() - 1).toString();

  // Find current and previous year data
  const currentYearData = historicalData.find(d => d.year === currentYear);
  const previousYearData = historicalData.find(d => d.year === previousYear);

  // Calculate historical YoY changes
  const calculateYoYChange = (current, previous) => {
    if (!current || !previous || previous === 0) return null;
    return ((current - previous) / previous) * 100;
  };

  // Calculate historical YoY changes - require minimum 2 years of data
  const hasMinimumData = historicalData.length >= 2 && currentYearData && previousYearData;
  
  const historicalYoY = {
    revenue: hasMinimumData 
      ? calculateYoYChange(currentYearData.income, previousYearData.income)
      : null,
    expenses: hasMinimumData 
      ? calculateYoYChange(currentYearData.expenses, previousYearData.expenses)
      : null,
    cashFlow: hasMinimumData 
      ? calculateYoYChange(currentYearData.cashFlow, previousYearData.cashFlow)
      : null
  };

  // Calculate current values
  const currentRent = property.rent.monthlyRent * 12;
  const currentExpenses = (property.monthlyExpenses.total - property.monthlyExpenses.mortgagePayment) * 12;
  const currentCashFlow = currentRent - currentExpenses - (property.monthlyExpenses.mortgagePayment * 12);
  
  // Project next year's values based on assumptions
  const projectedRent = currentRent * (1 + assumptions.annualRentIncrease / 100);
  const projectedExpenses = currentExpenses * (1 + assumptions.annualExpenseInflation / 100);
  const projectedCashFlow = projectedRent - projectedExpenses - (property.monthlyExpenses.mortgagePayment * 12);

  const projectedYoY = {
    revenue: ((projectedRent - currentRent) / currentRent) * 100,
    expenses: ((projectedExpenses - currentExpenses) / currentExpenses) * 100,
    cashFlow: currentCashFlow !== 0 ? ((projectedCashFlow - currentCashFlow) / Math.abs(currentCashFlow)) * 100 : 0
  };

  // Calculate baseline projected YoY for comparison
  const baselineProjectedRent = currentRent * (1 + baselineAssumptions.annualRentIncrease / 100);
  const baselineProjectedExpenses = currentExpenses * (1 + baselineAssumptions.annualExpenseInflation / 100);
  const baselineProjectedCashFlow = baselineProjectedRent - baselineProjectedExpenses - (property.monthlyExpenses.mortgagePayment * 12);

  const baselineProjectedYoY = {
    revenue: ((baselineProjectedRent - currentRent) / currentRent) * 100,
    expenses: ((baselineProjectedExpenses - currentExpenses) / currentExpenses) * 100,
    cashFlow: currentCashFlow !== 0 ? ((baselineProjectedCashFlow - currentCashFlow) / Math.abs(currentCashFlow)) * 100 : 0
  };

  return {
    historical: historicalYoY,
    projected: projectedYoY,
    baselineProjected: baselineProjectedYoY,
    hasHistoricalData: hasMinimumData,
    hasMinimumData,
    dataRequirement: {
      requiredYears: 2,
      availableYears: historicalData.length,
      meetsRequirement: hasMinimumData
    },
    currentYearData,
    previousYearData,
    currentValues: {
      rent: currentRent,
      expenses: currentExpenses,
      cashFlow: currentCashFlow
    },
    projectedValues: {
      rent: projectedRent,
      expenses: projectedExpenses,
      cashFlow: projectedCashFlow
    }
  };
}

/**
 * Calculate YoY growth rates for multiple years in forecast
 * @param {Object} forecast - Forecast object from generateForecast
 * @returns {Array} Array of YoY growth rates for each year
 */
export function calculateForecastYoYGrowth(forecast) {
  const yoyGrowth = [];
  
  for (let i = 1; i < forecast.years.length; i++) {
    const currentYear = i;
    const previousYear = i - 1;
    
    const revenueGrowth = forecast.netCashFlow[previousYear] !== 0 
      ? ((forecast.netCashFlow[currentYear] - forecast.netCashFlow[previousYear]) / Math.abs(forecast.netCashFlow[previousYear])) * 100
      : 0;
    
    const equityGrowth = forecast.equity[previousYear] !== 0 
      ? ((forecast.equity[currentYear] - forecast.equity[previousYear]) / forecast.equity[previousYear]) * 100
      : 0;
    
    yoyGrowth.push({
      year: currentYear + 1, // Year 2, 3, 4, etc.
      revenueGrowth,
      equityGrowth,
      netCashFlow: forecast.netCashFlow[currentYear],
      equity: forecast.equity[currentYear]
    });
  }
  
  return yoyGrowth;
}

