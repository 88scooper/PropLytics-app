// Import mortgage calculator utilities (conditional import for Next.js environment)
let getMonthlyMortgagePayment, getMonthlyMortgageInterest, getMonthlyMortgagePrincipal;

try {
  const mortgageUtils = require('@/utils/mortgageCalculator');
  getMonthlyMortgagePayment = mortgageUtils.getMonthlyMortgagePayment;
  getMonthlyMortgageInterest = mortgageUtils.getMonthlyMortgageInterest;
  getMonthlyMortgagePrincipal = mortgageUtils.getMonthlyMortgagePrincipal;
} catch (error) {
  // Fallback functions for non-Next.js environments
  getMonthlyMortgagePayment = () => 0;
  getMonthlyMortgageInterest = () => 0;
  getMonthlyMortgagePrincipal = () => 0;
}

// Centralized property data source parsed from CSV files
export const properties = [
  {
    id: 'richmond-st-e-403',
    nickname: 'Richmond St E',
    address: '403-311 Richmond St E, Toronto, ON M5A4S8',
    purchasePrice: 615000,
    purchaseDate: '2019-02-04',
    closingCosts: 18150,
    renovationCosts: 100000,
    currentMarketValue: 800000,
    yearBuilt: 2001,
    propertyType: 'Condo',
    size: 946, // square feet
    unitConfig: '2 Bed+Den, 2 Bath',
    
    mortgage: {
      lender: 'RMG',
      originalAmount: 443146.14, // Current mortgage amount from CSV
      interestRate: 0.0269, // 2.69% as decimal
      rateType: 'Fixed',
      termMonths: 60,
      amortizationYears: 19.92, // 239 months / 12
      paymentFrequency: 'Bi-weekly',
      startDate: '2022-02-03', // Start date of current mortgage
    },

    rent: {
      monthlyRent: 3450,
      annualRent: 41400, // 3450 * 12
    },

    expenses: {
      propertyTax: { amount: 2205.39, frequency: 'Annually' },
      condoFees: { amount: 9954.84, frequency: 'Annually' }, // 829.57/month
      insurance: { amount: 512, frequency: 'Annually' },
      maintenance: { amount: 829.17, frequency: 'Annually' },
      professionalFees: { amount: 3898.5, frequency: 'Annually' },
    },

    tenant: {
      name: 'Steve MacNeil, Kate St John',
      leaseStartDate: '2025-02-16',
      leaseEndDate: '2026-02-28',
      rent: 3450,
      status: 'Active'
    },

    // Calculated fields
    totalInvestment: 733150, // purchasePrice + closingCosts + renovationCosts
    appreciation: 185000, // currentMarketValue - purchasePrice
    monthlyPropertyTax: 183.78, // propertyTax / 12
    monthlyCondoFees: 829.57, // condoFees / 12
    monthlyInsurance: 42.67, // insurance / 12
    monthlyMaintenance: 69.10, // maintenance / 12
    monthlyProfessionalFees: 324.88, // professionalFees / 12
    
    monthlyExpenses: {
      propertyTax: 183.78,
      condoFees: 829.57,
      insurance: 42.67,
      maintenance: 69.10,
      professionalFees: 324.88,
      mortgagePayment: 0, // Will be calculated below
      mortgageInterest: 0, // Will be calculated below
      mortgagePrincipal: 0, // Will be calculated below
      total: 1450.00 // Will be recalculated below
    },
    
    monthlyCashFlow: 2000.00, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 24000.00, // monthlyCashFlow * 12
    capRate: 5.18, // (annualRent / currentMarketValue) * 100
    occupancy: 100,
    
    // Additional fields for compatibility
    name: 'Richmond St E',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 946,
    currentValue: 800000,
    imageUrl: '/images/311 Richmond St E.png',
    tenants: [
      {
        name: 'Steve MacNeil, Kate St John',
        unit: 'Unit 403',
        rent: 3450,
        leaseStart: '2025-02-16',
        leaseEnd: '2026-02-28',
        status: 'Current'
      }
    ]
  },
  
  {
    id: 'tretti-way-317',
    nickname: 'Tretti Way',
    address: '317-30 Tretti Way, Toronto, ON M3H0E3',
    purchasePrice: 448618,
    purchaseDate: '2023-10-04',
    closingCosts: 68086,
    renovationCosts: 0,
    currentMarketValue: 550000,
    yearBuilt: 2023,
    propertyType: 'Condo',
    size: 553, // square feet
    unitConfig: '2 Bed, 2 Bath',
    
    mortgage: {
      lender: 'RBC', // Current lender from CSV
      originalAmount: 358000, // Current mortgage amount from CSV
      interestRate: -0.0075, // -0.75% as decimal (variable rate)
      rateType: 'Variable',
      termMonths: 60,
      amortizationYears: 30.08, // 361 months / 12
      paymentFrequency: 'Monthly',
      startDate: '2024-03-21', // Start date of current mortgage
    },

    rent: {
      monthlyRent: 2300,
      annualRent: 27600, // 2300 * 12
    },

    expenses: {
      propertyTax: { amount: 2294.1, frequency: 'Annually' },
      condoFees: { amount: 5204.88, frequency: 'Annually' }, // 433.74/month
      insurance: { amount: 552.96, frequency: 'Annually' },
      professionalFees: { amount: 2712, frequency: 'Annually' },
    },

    tenant: {
      name: 'Pratikkumar Chaudary',
      leaseStartDate: '2024-07-01',
      leaseEndDate: 'Active', // Currently active tenant
      rent: 2300,
      status: 'Active'
    },

    // Calculated fields
    totalInvestment: 516704, // purchasePrice + closingCosts
    appreciation: 101382, // currentMarketValue - purchasePrice
    monthlyPropertyTax: 191.18, // propertyTax / 12
    monthlyCondoFees: 433.74, // condoFees / 12
    monthlyInsurance: 46.08, // insurance / 12
    monthlyProfessionalFees: 226.00, // professionalFees / 12
    
    monthlyExpenses: {
      propertyTax: 191.18,
      condoFees: 433.74,
      insurance: 46.08,
      professionalFees: 226.00,
      mortgagePayment: 0, // Will be calculated below
      mortgageInterest: 0, // Will be calculated below
      mortgagePrincipal: 0, // Will be calculated below
      total: 897.00 // Will be recalculated below
    },
    
    monthlyCashFlow: 1403.00, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 16836.00, // monthlyCashFlow * 12
    capRate: 5.02, // (annualRent / currentMarketValue) * 100
    occupancy: 100,
    
    // Additional fields for compatibility
    name: 'Tretti Way',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 553,
    currentValue: 550000,
    imageUrl: '/images/30 Tretti Way.png',
    tenants: [
      {
        name: 'Pratikkumar Chaudary',
        unit: 'Unit 317',
        rent: 2300,
        leaseStart: '2024-07-01',
        leaseEnd: 'Active',
        status: 'Current'
      }
    ]
  },
  
  {
    id: 'wilson-ave-415',
    nickname: 'Wilson Ave',
    address: '415-500 Wilson Ave, Toronto, ON M3H0E5',
    purchasePrice: 533379.47,
    purchaseDate: '2025-01-20',
    closingCosts: 53241.9,
    renovationCosts: 0,
    currentMarketValue: 550000, // Estimated based on similar properties
    yearBuilt: 2025,
    propertyType: 'Condo',
    size: 557, // square feet
    unitConfig: '2 Bed, 2 Bath',
    
    mortgage: {
      lender: 'RBC',
      originalAmount: 426382.1, // From CSV
      interestRate: 0.0445, // 4.45% as decimal
      rateType: 'Fixed',
      termMonths: 36, // 3 years
      amortizationYears: 30, // 360 months
      paymentFrequency: 'Monthly',
      startDate: '2024-01-22',
    },

    rent: {
      monthlyRent: 2400,
      annualRent: 28800, // 2400 * 12
    },

    expenses: {
      propertyTax: { amount: 0, frequency: 'Annually' }, // Not specified in CSV
      condoFees: { amount: 0, frequency: 'Annually' }, // Not specified in CSV
      insurance: { amount: 710, frequency: 'Annually' },
      maintenance: { amount: 253.9, frequency: 'Annually' },
      professionalFees: { amount: 2712, frequency: 'Annually' },
      utilities: { amount: 175.96, frequency: 'Annually' },
    },

    tenant: {
      name: 'Aanal Shah, Kavya Gandhi, Parth Patel',
      leaseStartDate: '2025-07-01',
      leaseEndDate: '2025-08-31',
      rent: 2400,
      status: 'Active'
    },

    // Calculated fields
    totalInvestment: 586621.37, // purchasePrice + closingCosts
    appreciation: 16620.53, // currentMarketValue - purchasePrice
    monthlyPropertyTax: 0, // Not specified
    monthlyCondoFees: 0, // Not specified
    monthlyInsurance: 59.17, // insurance / 12
    monthlyMaintenance: 21.16, // maintenance / 12
    monthlyProfessionalFees: 226.00, // professionalFees / 12
    monthlyUtilities: 14.66, // utilities / 12
    
    monthlyExpenses: {
      propertyTax: 0,
      condoFees: 0,
      insurance: 59.17,
      maintenance: 21.16,
      professionalFees: 226.00,
      utilities: 14.66,
      mortgagePayment: 0, // Will be calculated below
      mortgageInterest: 0, // Will be calculated below
      mortgagePrincipal: 0, // Will be calculated below
      total: 320.99 // Will be recalculated below
    },
    
    monthlyCashFlow: 2079.01, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 24948.12, // monthlyCashFlow * 12
    capRate: 5.24, // (annualRent / currentMarketValue) * 100
    occupancy: 100,
    
    // Additional fields for compatibility
    name: 'Wilson Ave',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 557,
    currentValue: 550000,
    imageUrl: '/images/500 Wilson Ave.png',
    tenants: [
      {
        name: 'Aanal Shah, Kavya Gandhi, Parth Patel',
        unit: 'Unit 415',
        rent: 2400,
        leaseStart: '2025-07-01',
        leaseEnd: '2025-08-31',
        status: 'Current'
      }
    ]
  }
];

// Calculate mortgage payments for each property and update monthly expenses
// This will run in the browser environment where the mortgage calculator is available
if (typeof window !== 'undefined') {
  properties.forEach(property => {
    try {
      // Calculate mortgage payments
      const mortgagePayment = getMonthlyMortgagePayment(property.mortgage);
      const mortgageInterest = getMonthlyMortgageInterest(property.mortgage);
      const mortgagePrincipal = getMonthlyMortgagePrincipal(property.mortgage);
      
      // Update monthly expenses
      property.monthlyExpenses.mortgagePayment = mortgagePayment;
      property.monthlyExpenses.mortgageInterest = mortgageInterest;
      property.monthlyExpenses.mortgagePrincipal = mortgagePrincipal;
      
      // Recalculate total monthly expenses (handle different expense structures)
      property.monthlyExpenses.total = 
        (property.monthlyExpenses.propertyTax || 0) +
        (property.monthlyExpenses.condoFees || 0) +
        (property.monthlyExpenses.insurance || 0) +
        (property.monthlyExpenses.maintenance || 0) +
        (property.monthlyExpenses.professionalFees || 0) +
        (property.monthlyExpenses.utilities || 0) +
        property.monthlyExpenses.mortgagePayment;
      
      // Recalculate cash flow
      property.monthlyCashFlow = property.rent.monthlyRent - property.monthlyExpenses.total;
      property.annualCashFlow = property.monthlyCashFlow * 12;
      
      // Recalculate cap rate
      property.capRate = (property.rent.annualRent / property.currentMarketValue) * 100;
      
      // Recalculate cash-on-cash return
      property.cashOnCashReturn = (property.annualCashFlow / property.totalInvestment) * 100;
      
    } catch (error) {
      console.warn(`Error calculating mortgage payments for ${property.id}:`, error);
      // Keep default values if calculation fails
    }
  });
}

// Helper function to get property by ID
export const getPropertyById = (id) => {
  return properties.find(property => property.id === id);
};

// Helper function to get all properties
export const getAllProperties = () => {
  return properties;
};

// Helper function to calculate portfolio metrics
export const getPortfolioMetrics = () => {
  const totalValue = properties.reduce((sum, property) => sum + property.currentMarketValue, 0);
  const totalInvestment = properties.reduce((sum, property) => sum + property.totalInvestment, 0);
  const totalMonthlyRent = properties.reduce((sum, property) => sum + property.rent.monthlyRent, 0);
  const totalMonthlyExpenses = properties.reduce((sum, property) => sum + property.monthlyExpenses.total, 0);
  const totalMonthlyCashFlow = properties.reduce((sum, property) => sum + property.monthlyCashFlow, 0);
  
  // Calculate current mortgage balance - simplified for now
  // TODO: Implement proper mortgage balance calculation based on payments made
  let totalMortgageBalance = 0;
  try {
    const { getCurrentMortgageBalance } = require('@/utils/mortgageCalculator');
    totalMortgageBalance = properties.reduce((sum, property) => {
      try {
        const currentBalance = getCurrentMortgageBalance(property.mortgage);
        return sum + currentBalance;
      } catch (error) {
        console.warn(`Error calculating current balance for ${property.id}:`, error);
        // For now, use a simplified calculation: reduce original amount by ~10% for older mortgages
        const monthsSinceStart = Math.max(0, (new Date() - new Date(property.mortgage.startDate)) / (1000 * 60 * 60 * 24 * 30));
        const estimatedPaidOff = (property.mortgage.originalAmount * 0.1 * Math.min(monthsSinceStart / 12, 1)); // Assume 10% paid off per year
        return sum + Math.max(0, property.mortgage.originalAmount - estimatedPaidOff);
      }
    }, 0);
  } catch (error) {
    console.warn('Mortgage calculator not available, using estimated amounts:', error);
    // Fallback: estimate current balances based on time since start
    totalMortgageBalance = properties.reduce((sum, property) => {
      const monthsSinceStart = Math.max(0, (new Date() - new Date(property.mortgage.startDate)) / (1000 * 60 * 60 * 24 * 30));
      const estimatedPaidOff = (property.mortgage.originalAmount * 0.1 * Math.min(monthsSinceStart / 12, 1)); // Assume 10% paid off per year
      return sum + Math.max(0, property.mortgage.originalAmount - estimatedPaidOff);
    }, 0);
  }
  
  
  const totalEquity = totalValue - totalMortgageBalance;
  
  // Calculate total annual operating expenses (excluding mortgage payments)
  const totalAnnualOperatingExpenses = properties.reduce((sum, property) => {
    return sum + 
      (property.monthlyExpenses.propertyTax || 0) * 12 +
      (property.monthlyExpenses.condoFees || 0) * 12 +
      (property.monthlyExpenses.insurance || 0) * 12 +
      (property.monthlyExpenses.maintenance || 0) * 12 +
      (property.monthlyExpenses.professionalFees || 0) * 12 +
      (property.monthlyExpenses.utilities || 0) * 12;
  }, 0);
  
  // Calculate Net Operating Income (NOI) = Total Annual Income - Total Annual Operating Expenses
  const netOperatingIncome = (totalMonthlyRent * 12) - totalAnnualOperatingExpenses;
  
  // Calculate total annual deductible expenses (operating expenses + mortgage interest)
  let totalAnnualDeductibleExpenses = 0;
  try {
    const { getAnnualMortgageInterest } = require('@/utils/mortgageCalculator');
    totalAnnualDeductibleExpenses = properties.reduce((sum, property) => {
      try {
        // Calculate annual operating expenses (excluding mortgage principal)
        const annualOperatingExpenses = 
          (property.monthlyExpenses.propertyTax || 0) * 12 +
          (property.monthlyExpenses.condoFees || 0) * 12 +
          (property.monthlyExpenses.insurance || 0) * 12 +
          (property.monthlyExpenses.maintenance || 0) * 12 +
          (property.monthlyExpenses.professionalFees || 0) * 12 +
          (property.monthlyExpenses.utilities || 0) * 12;
        
        // Add annual mortgage interest
        const annualMortgageInterest = getAnnualMortgageInterest(property.mortgage);
        
        return sum + annualOperatingExpenses + annualMortgageInterest;
      } catch (error) {
        console.warn(`Error calculating deductible expenses for ${property.id}:`, error);
        // Fallback: use total monthly expenses minus estimated principal
        const estimatedAnnualPrincipal = (property.mortgage.originalAmount / property.mortgage.amortizationYears);
        const annualExpenses = property.monthlyExpenses.total * 12;
        return sum + (annualExpenses - estimatedAnnualPrincipal);
      }
    }, 0);
  } catch (error) {
    console.warn('Mortgage calculator not available for deductible expenses, using fallback:', error);
    // Fallback: estimate deductible expenses as total expenses minus estimated principal
    totalAnnualDeductibleExpenses = properties.reduce((sum, property) => {
      const estimatedAnnualPrincipal = (property.mortgage.originalAmount / property.mortgage.amortizationYears);
      const annualExpenses = property.monthlyExpenses.total * 12;
      return sum + (annualExpenses - estimatedAnnualPrincipal);
    }, 0);
  }
  
  return {
    totalValue,
    totalInvestment,
    totalEquity,
    totalMortgageBalance,
    totalMonthlyRent,
    totalMonthlyExpenses,
    totalMonthlyCashFlow,
    totalAnnualOperatingExpenses,
    netOperatingIncome,
    totalAnnualDeductibleExpenses,
    totalProperties: properties.length,
    averageCapRate: properties.reduce((sum, property) => sum + property.capRate, 0) / properties.length,
    averageOccupancy: properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length,
    totalAnnualCashFlow: totalMonthlyCashFlow * 12,
    cashOnCashReturn: (totalMonthlyCashFlow * 12 / totalInvestment) * 100
  };
};
