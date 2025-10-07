/**
 * Centralized Financial Calculations for Real Estate Investment Analysis
 * 
 * This module provides accurate, standardized calculations for:
 * - Operating Expenses (excluding mortgage payments)
 * - Net Operating Income (NOI)
 * - Cap Rate
 * - Cash Flow (after debt service)
 * 
 * All calculations follow standard real estate investment principles.
 */

/**
 * Calculate annual operating expenses for a property
 * EXCLUDES mortgage payments (principal and interest)
 * 
 * @param {Object} property - Property object with monthlyExpenses
 * @returns {number} Annual operating expenses
 */
export function calculateAnnualOperatingExpenses(property) {
  if (!property || !property.monthlyExpenses) {
    return 0;
  }

  const monthlyOperatingExpenses = 
    (property.monthlyExpenses.propertyTax || 0) +
    (property.monthlyExpenses.condoFees || 0) +
    (property.monthlyExpenses.insurance || 0) +
    (property.monthlyExpenses.maintenance || 0) +
    (property.monthlyExpenses.professionalFees || 0) +
    (property.monthlyExpenses.utilities || 0);

  return monthlyOperatingExpenses * 12;
}

/**
 * Calculate Net Operating Income (NOI) for a property
 * NOI = Annual Rental Income - Annual Operating Expenses
 * 
 * @param {Object} property - Property object
 * @returns {number} Annual NOI
 */
export function calculateNOI(property) {
  if (!property || !property.rent || !property.rent.monthlyRent) {
    return 0;
  }

  const annualRentalIncome = property.rent.monthlyRent * 12;
  const annualOperatingExpenses = calculateAnnualOperatingExpenses(property);
  
  return annualRentalIncome - annualOperatingExpenses;
}

/**
 * Calculate Cap Rate for a property
 * Cap Rate = NOI / Current Market Value
 * 
 * @param {Object} property - Property object
 * @returns {number} Cap Rate as a percentage (e.g., 5.5 for 5.5%)
 */
export function calculateCapRate(property) {
  if (!property || !property.currentMarketValue || property.currentMarketValue <= 0) {
    return 0;
  }

  const noi = calculateNOI(property);
  return (noi / property.currentMarketValue) * 100;
}

/**
 * Calculate monthly cash flow for a property
 * Cash Flow = Monthly Rent - Monthly Operating Expenses - Monthly Mortgage Payment
 * 
 * @param {Object} property - Property object
 * @returns {number} Monthly cash flow
 */
export function calculateMonthlyCashFlow(property) {
  if (!property || !property.rent || !property.rent.monthlyRent) {
    return 0;
  }

  const monthlyRent = property.rent.monthlyRent;
  const monthlyOperatingExpenses = calculateAnnualOperatingExpenses(property) / 12;
  const monthlyMortgagePayment = property.monthlyExpenses?.mortgagePayment || 0;

  return monthlyRent - monthlyOperatingExpenses - monthlyMortgagePayment;
}

/**
 * Calculate annual cash flow for a property
 * 
 * @param {Object} property - Property object
 * @returns {number} Annual cash flow
 */
export function calculateAnnualCashFlow(property) {
  return calculateMonthlyCashFlow(property) * 12;
}

/**
 * Calculate Cash-on-Cash Return for a property
 * Cash-on-Cash = Annual Cash Flow / Total Cash Invested
 * 
 * @param {Object} property - Property object
 * @returns {number} Cash-on-Cash return as a percentage
 */
export function calculateCashOnCashReturn(property) {
  if (!property || !property.totalInvestment || property.totalInvestment <= 0) {
    return 0;
  }

  const annualCashFlow = calculateAnnualCashFlow(property);
  return (annualCashFlow / property.totalInvestment) * 100;
}

/**
 * Calculate portfolio-level metrics
 * 
 * @param {Array} properties - Array of property objects
 * @returns {Object} Portfolio metrics
 */
export function calculatePortfolioMetrics(properties) {
  if (!properties || properties.length === 0) {
    return {
      totalValue: 0,
      totalInvestment: 0,
      totalEquity: 0,
      totalMortgageBalance: 0,
      totalMonthlyRent: 0,
      totalAnnualOperatingExpenses: 0,
      netOperatingIncome: 0,
      totalMonthlyCashFlow: 0,
      totalAnnualCashFlow: 0,
      averageCapRate: 0,
      averageCashOnCashReturn: 0,
      totalProperties: 0
    };
  }

  const totalValue = properties.reduce((sum, property) => sum + (property.currentMarketValue || 0), 0);
  const totalInvestment = properties.reduce((sum, property) => sum + (property.totalInvestment || 0), 0);
  const totalMortgageBalance = properties.reduce((sum, property) => sum + (property.mortgage?.remainingBalance || 0), 0);
  const totalEquity = totalValue - totalMortgageBalance;
  
  const totalMonthlyRent = properties.reduce((sum, property) => sum + (property.rent?.monthlyRent || 0), 0);
  const totalAnnualOperatingExpenses = properties.reduce((sum, property) => sum + calculateAnnualOperatingExpenses(property), 0);
  const netOperatingIncome = (totalMonthlyRent * 12) - totalAnnualOperatingExpenses;
  
  const totalMonthlyCashFlow = properties.reduce((sum, property) => sum + calculateMonthlyCashFlow(property), 0);
  const totalAnnualCashFlow = totalMonthlyCashFlow * 12;
  
  const averageCapRate = properties.reduce((sum, property) => sum + calculateCapRate(property), 0) / properties.length;
  const averageCashOnCashReturn = properties.reduce((sum, property) => sum + calculateCashOnCashReturn(property), 0) / properties.length;

  return {
    totalValue,
    totalInvestment,
    totalEquity,
    totalMortgageBalance,
    totalMonthlyRent,
    totalAnnualOperatingExpenses,
    netOperatingIncome,
    totalMonthlyCashFlow,
    totalAnnualCashFlow,
    averageCapRate,
    averageCashOnCashReturn,
    totalProperties: properties.length
  };
}

/**
 * Update property financial metrics using standardized calculations
 * 
 * @param {Object} property - Property object to update
 * @returns {Object} Updated property object
 */
export function updatePropertyFinancialMetrics(property) {
  if (!property) {
    return property;
  }

  // Calculate and update all financial metrics
  const annualOperatingExpenses = calculateAnnualOperatingExpenses(property);
  const noi = calculateNOI(property);
  const capRate = calculateCapRate(property);
  const monthlyCashFlow = calculateMonthlyCashFlow(property);
  const annualCashFlow = calculateAnnualCashFlow(property);
  const cashOnCashReturn = calculateCashOnCashReturn(property);

  // Update property object
  return {
    ...property,
    annualOperatingExpenses,
    netOperatingIncome: noi,
    capRate,
    monthlyCashFlow,
    annualCashFlow,
    cashOnCashReturn
  };
}
