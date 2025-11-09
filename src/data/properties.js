// Import mortgage calculator utilities (conditional import for Next.js environment)
let getMonthlyMortgagePayment, getMonthlyMortgageInterest, getMonthlyMortgagePrincipal, getCurrentMortgageBalance, getAnnualMortgageInterest;

try {
  const mortgageUtils = require('@/utils/mortgageCalculator');
  getMonthlyMortgagePayment = mortgageUtils.getMonthlyMortgagePayment;
  getMonthlyMortgageInterest = mortgageUtils.getMonthlyMortgageInterest;
  getMonthlyMortgagePrincipal = mortgageUtils.getMonthlyMortgagePrincipal;
  getCurrentMortgageBalance = mortgageUtils.getCurrentMortgageBalance;
  getAnnualMortgageInterest = mortgageUtils.getAnnualMortgageInterest;
} catch (error) {
  // Fallback functions for non-Next.js environments
  getMonthlyMortgagePayment = () => 0;
  getMonthlyMortgageInterest = () => 0;
  getMonthlyMortgagePrincipal = () => 0;
  getCurrentMortgageBalance = (mortgage) => mortgage?.originalAmount || 0;
  getAnnualMortgageInterest = (mortgage) => (mortgage?.originalAmount || 0) * (mortgage?.interestRate || 0);
}

// Import financial calculation utilities
let calculateAnnualOperatingExpenses, calculateNOI, calculateCapRate, calculateMonthlyCashFlow, calculateAnnualCashFlow, calculateCashOnCashReturn, updatePropertyFinancialMetrics;

try {
  const financialUtils = require('@/utils/financialCalculations');
  calculateAnnualOperatingExpenses = financialUtils.calculateAnnualOperatingExpenses;
  calculateNOI = financialUtils.calculateNOI;
  calculateCapRate = financialUtils.calculateCapRate;
  calculateMonthlyCashFlow = financialUtils.calculateMonthlyCashFlow;
  calculateAnnualCashFlow = financialUtils.calculateAnnualCashFlow;
  calculateCashOnCashReturn = financialUtils.calculateCashOnCashReturn;
  updatePropertyFinancialMetrics = financialUtils.updatePropertyFinancialMetrics;
} catch (error) {
  // Fallback functions for non-Next.js environments
  calculateAnnualOperatingExpenses = () => 0;
  calculateNOI = () => 0;
  calculateCapRate = () => 0;
  calculateMonthlyCashFlow = () => 0;
  calculateAnnualCashFlow = () => 0;
  calculateCashOnCashReturn = () => 0;
  updatePropertyFinancialMetrics = (property) => property;
}

// Centralized property data source parsed from CSV files
export const properties = [
  {
    id: 'first-st-1',
    nickname: 'First St',
    address: '1-1 First St, Toronto, ON 1A1 A1A',
    purchasePrice: 500000,
    purchaseDate: '2021-01-01',
    closingCosts: 50000,
    initialRenovations: 0,
    renovationCosts: 0,
    currentMarketValue: 600000,
    yearBuilt: 2021,
    propertyType: 'Condo',
    size: 700, // square feet
    unitConfig: '2 Bed, 2 Bath',
    
    mortgage: {
      lender: 'Lender 1',
      originalAmount: 400000,
      interestRate: 0.025, // 2.5% as decimal
      rateType: 'Fixed',
      termMonths: 60, // 5 years
      amortizationYears: 30, // 360 months
      paymentFrequency: 'Monthly',
      startDate: '2021-01-01',
    },

    rent: {
      monthlyRent: 2650, // Current tenant rent from CSV 2025.11.03 data
      annualRent: 31800, // 2650 * 12 (current tenant)
    },

    expenseHistory: [
      // 2021 Expenses from CSV
      { id: 'first-2021-insurance', date: '2021-01-15', amount: 400, category: 'Insurance', description: 'Property insurance' },
      { id: 'first-2021-interest', date: '2021-06-01', amount: 9845, category: 'Other', description: 'Interest & bank charges' },
      { id: 'first-2021-professional', date: '2021-03-15', amount: 2938, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'first-2021-maintenance', date: '2021-08-15', amount: 200, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'first-2021-tax', date: '2021-01-15', amount: 2300, category: 'Property Tax', description: 'Property taxes' },
      { id: 'first-2021-motor', date: '2021-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'first-2021-other', date: '2021-01-15', amount: 20000, category: 'Other', description: 'Other rental expenses' },
      { id: 'first-2021-condo', date: '2021-01-15', amount: 9500, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2022 Expenses from CSV
      { id: 'first-2022-insurance', date: '2022-01-15', amount: 420, category: 'Insurance', description: 'Property insurance' },
      { id: 'first-2022-interest', date: '2022-06-01', amount: 9617, category: 'Other', description: 'Interest & bank charges' },
      { id: 'first-2022-professional', date: '2022-03-15', amount: 0, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'first-2022-maintenance', date: '2022-08-15', amount: 200, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'first-2022-tax', date: '2022-01-15', amount: 2415, category: 'Property Tax', description: 'Property taxes' },
      { id: 'first-2022-motor', date: '2022-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'first-2022-condo', date: '2022-01-15', amount: 9975, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2023 Expenses from CSV
      { id: 'first-2023-insurance', date: '2023-01-15', amount: 441, category: 'Insurance', description: 'Property insurance' },
      { id: 'first-2023-interest', date: '2023-06-01', amount: 9382, category: 'Other', description: 'Interest & bank charges' },
      { id: 'first-2023-professional', date: '2023-03-15', amount: 3051, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'first-2023-maintenance', date: '2023-08-15', amount: 200, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'first-2023-tax', date: '2023-01-15', amount: 2536, category: 'Property Tax', description: 'Property taxes' },
      { id: 'first-2023-motor', date: '2023-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'first-2023-condo', date: '2023-01-15', amount: 10474, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2024 Expenses from CSV
      { id: 'first-2024-insurance', date: '2024-01-15', amount: 463, category: 'Insurance', description: 'Property insurance' },
      { id: 'first-2024-interest', date: '2024-06-01', amount: 9142, category: 'Other', description: 'Interest & bank charges' },
      { id: 'first-2024-professional', date: '2024-03-15', amount: 0, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'first-2024-maintenance', date: '2024-08-15', amount: 200, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'first-2024-tax', date: '2024-01-15', amount: 2663, category: 'Property Tax', description: 'Property taxes' },
      { id: 'first-2024-motor', date: '2024-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'first-2024-condo', date: '2024-01-15', amount: 10997, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2025 Expenses from CSV
      { id: 'first-2025-insurance', date: '2025-01-15', amount: 486, category: 'Insurance', description: 'Property insurance' },
      { id: 'first-2025-interest', date: '2025-06-01', amount: 8896, category: 'Other', description: 'Interest & bank charges' },
      { id: 'first-2025-professional', date: '2025-03-15', amount: 0, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'first-2025-maintenance', date: '2025-08-15', amount: 200, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'first-2025-tax', date: '2025-01-15', amount: 2796, category: 'Property Tax', description: 'Property taxes' },
      { id: 'first-2025-motor', date: '2025-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'first-2025-condo', date: '2025-01-15', amount: 11547, category: 'Condo Fees', description: 'Condo maintenance fees' },
    ],

    tenant: {
      name: 'Jane Doe',
      leaseStartDate: '2023-01-01',
      leaseEndDate: 'Active', // Active lease per CSV
      rent: 2650, // Updated to 2025 rent from CSV 2025.11.03
      status: 'Active'
    },

    // Calculated fields
    totalInvestment: 150000, // down payment + closingCosts + initial renovations
    appreciation: 100000, // currentMarketValue - purchasePrice
    monthlyPropertyTax: 233, // 2796 / 12 (using 2025 data)
    monthlyCondoFees: 962.25, // 11547 / 12 (using 2025 data)
    monthlyInsurance: 40.5, // 486 / 12 (using 2025 data)
    monthlyMaintenance: 16.67, // 200 / 12 (using 2025 data)
    monthlyProfessionalFees: 0,
    
    monthlyExpenses: {
      propertyTax: 233,
      condoFees: 962.25,
      insurance: 40.5,
      maintenance: 16.67,
      professionalFees: 0,
      mortgagePayment: 0, // Will be calculated below
      mortgageInterest: 0, // Will be calculated below
      mortgagePrincipal: 0, // Will be calculated below
      total: 1252.42 // Will be recalculated below
    },
    
    monthlyCashFlow: 1397.58, // monthlyRent - monthlyExpenses.total (will be recalculated)
    annualCashFlow: 16771, // monthlyCashFlow * 12
    capRate: 5.3, // (annualRent / currentMarketValue) * 100 = (31800 / 600000) * 100
    occupancy: 100,
    
    // Additional fields for compatibility
    name: 'First St',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 700,
    currentValue: 600000,
    imageUrl: '/images/1 First St.png',
    tenants: [
      {
        name: 'Jon Doe',
        unit: 'Unit 1',
        rent: 2800, // Based on 2021 annual income 33600 / 12
        leaseStart: '2021-01-01',
        leaseEnd: '2022-12-22',
        status: 'Vacant'
      },
      {
        name: 'Jane Doe',
        unit: 'Unit 1',
        rent: 2650, // Updated to 2025 rent from CSV 2025.11.03
        leaseStart: '2023-01-01',
        leaseEnd: 'Active',
        status: 'Active'
      }
    ]
  },
  
  {
    id: 'second-dr-1',
    nickname: 'Second Dr',
    address: '1-1 Second Dr, Toronto, ON 2B2 B2B',
    purchasePrice: 600000,
    purchaseDate: '2021-01-01',
    closingCosts: 60000,
    initialRenovations: 0,
    renovationCosts: 0,
    currentMarketValue: 650000,
    yearBuilt: 2021,
    propertyType: 'Condo',
    size: 700, // square feet
    unitConfig: '2 Bed, 2 Bath',
    
    mortgage: {
      lender: 'Lender 2',
      originalAmount: 400000,
      interestRate: 0.025, // 2.5% as decimal
      rateType: 'Fixed',
      termMonths: 60, // 5 years
      amortizationYears: 30, // 360 months
      paymentFrequency: 'Monthly',
      startDate: '2021-01-01',
    },

    rent: {
      monthlyRent: 2650, // Current tenant rent from CSV 2025.11.03 data
      annualRent: 31800, // 2650 * 12 (current tenant)
    },

    expenseHistory: [
      // 2021 Expenses from CSV
      { id: 'second-2021-insurance', date: '2021-01-15', amount: 567, category: 'Insurance', description: 'Property insurance' },
      { id: 'second-2021-interest', date: '2021-06-01', amount: 15038, category: 'Other', description: 'Interest & bank charges' },
      { id: 'second-2021-professional', date: '2021-03-15', amount: 2938, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'second-2021-maintenance', date: '2021-08-15', amount: 386, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'second-2021-tax', date: '2021-01-15', amount: 2573, category: 'Property Tax', description: 'Property taxes' },
      { id: 'second-2021-motor', date: '2021-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'second-2021-other', date: '2021-01-15', amount: 25000, category: 'Other', description: 'Other rental expenses' },
      { id: 'second-2021-condo', date: '2021-01-15', amount: 10815, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2022 Expenses from CSV
      { id: 'second-2022-insurance', date: '2022-01-15', amount: 595, category: 'Insurance', description: 'Property insurance' },
      { id: 'second-2022-interest', date: '2022-06-01', amount: 14711, category: 'Other', description: 'Interest & bank charges' },
      { id: 'second-2022-professional', date: '2022-03-15', amount: 3022.75, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'second-2022-maintenance', date: '2022-08-15', amount: 398, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'second-2022-tax', date: '2022-01-15', amount: 2701, category: 'Property Tax', description: 'Property taxes' },
      { id: 'second-2022-motor', date: '2022-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'second-2022-condo', date: '2022-01-15', amount: 11139, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2023 Expenses from CSV
      { id: 'second-2023-insurance', date: '2023-01-15', amount: 625, category: 'Insurance', description: 'Property insurance' },
      { id: 'second-2023-interest', date: '2023-06-01', amount: 14374, category: 'Other', description: 'Interest & bank charges' },
      { id: 'second-2023-professional', date: '2023-03-15', amount: 0, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'second-2023-maintenance', date: '2023-08-15', amount: 410, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'second-2023-tax', date: '2023-01-15', amount: 2836, category: 'Property Tax', description: 'Property taxes' },
      { id: 'second-2023-motor', date: '2023-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'second-2023-condo', date: '2023-01-15', amount: 11474, category: 'Condo Fees', description: 'Condo maintenance fees' },
      
      // 2024 Expenses from CSV
      { id: 'second-2024-insurance', date: '2024-01-15', amount: 656, category: 'Insurance', description: 'Property insurance' },
      { id: 'second-2024-interest', date: '2024-06-01', amount: 14026, category: 'Other', description: 'Interest & bank charges' },
      { id: 'second-2024-professional', date: '2024-03-15', amount: 0, category: 'Professional Fees', description: 'Professional fees' },
      { id: 'second-2024-maintenance', date: '2024-08-15', amount: 422, category: 'Maintenance', description: 'Repairs & maintenance' },
      { id: 'second-2024-tax', date: '2024-01-15', amount: 2978, category: 'Property Tax', description: 'Property taxes' },
      { id: 'second-2024-motor', date: '2024-12-01', amount: 50, category: 'Other', description: 'Motor vehicle expenses' },
      { id: 'second-2024-condo', date: '2024-01-15', amount: 11818, category: 'Condo Fees', description: 'Condo maintenance fees' },
    ],

    tenant: {
      name: 'Jane Doe',
      leaseStartDate: '2023-01-01',
      leaseEndDate: 'Active', // Active lease per CSV
      rent: 2650, // Updated to 2025 rent from CSV 2025.11.03
      status: 'Active'
    },

    // Calculated fields
    totalInvestment: 260000, // down payment + closingCosts + initial renovations
    appreciation: 50000, // currentMarketValue - purchasePrice
    monthlyPropertyTax: 248.17, // 2978 / 12 (using 2024 data - no 2025 data available)
    monthlyCondoFees: 985.17, // 11818 / 12 (using 2024 data - no 2025 data available)
    monthlyInsurance: 54.67, // 656 / 12 (using 2024 data - no 2025 data available)
    monthlyMaintenance: 35.17, // 422 / 12 (using 2024 data - no 2025 data available)
    monthlyProfessionalFees: 0,
    
    monthlyExpenses: {
      propertyTax: 248.17,
      condoFees: 985.17,
      insurance: 54.67,
      maintenance: 35.17,
      professionalFees: 0,
      mortgagePayment: 0, // Will be calculated below
      mortgageInterest: 0, // Will be calculated below
      mortgagePrincipal: 0, // Will be calculated below
      total: 1323.18 // Will be recalculated below
    },
    
    monthlyCashFlow: 1326.82, // monthlyRent - monthlyExpenses.total (will be recalculated)
    annualCashFlow: 15922, // monthlyCashFlow * 12
    capRate: 4.9, // (annualRent / currentMarketValue) * 100 = (31800 / 650000) * 100
    occupancy: 100,
    
    // Additional fields for compatibility
    name: 'Second Dr',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 700,
    currentValue: 650000,
    imageUrl: '/images/1 Second Dr.png',
    tenants: [
      {
        name: 'Jon Doe',
        unit: 'Unit 1',
        rent: 2600, // Based on 2021 annual income 31200 / 12
        leaseStart: '2021-01-01',
        leaseEnd: '2022-12-22',
        status: 'Vacant'
      },
      {
        name: 'Jane Doe',
        unit: 'Unit 1',
        rent: 2650, // Updated to 2025 rent from CSV 2025.11.03
        leaseStart: '2023-01-01',
        leaseEnd: 'Active',
        status: 'Active'
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
      
      // Use standardized financial calculations
      const annualOperatingExpenses = calculateAnnualOperatingExpenses(property);
      const noi = calculateNOI(property);
      const capRate = calculateCapRate(property);
      const monthlyCashFlow = calculateMonthlyCashFlow(property);
      const annualCashFlow = calculateAnnualCashFlow(property);
      const cashOnCashReturn = calculateCashOnCashReturn(property);
      
      // Update property with standardized calculations
      property.annualOperatingExpenses = annualOperatingExpenses;
      property.netOperatingIncome = noi;
      property.capRate = capRate;
      property.monthlyCashFlow = monthlyCashFlow;
      property.annualCashFlow = annualCashFlow;
      property.cashOnCashReturn = cashOnCashReturn;
      
      // Recalculate total monthly expenses (including mortgage for cash flow calculation)
      const monthlyOperatingExpenses = annualOperatingExpenses / 12;
      property.monthlyExpenses.total = monthlyOperatingExpenses + property.monthlyExpenses.mortgagePayment;
      
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
  
  // Calculate current mortgage balance using accurate calculation
  let totalMortgageBalance = 0;
  
  // Use accurate calculation for browser environment
  if (typeof window !== 'undefined' && getCurrentMortgageBalance) {
    totalMortgageBalance = properties.reduce((sum, property) => {
      try {
        return sum + getCurrentMortgageBalance(property.mortgage);
      } catch (error) {
        console.warn(`Error calculating mortgage balance for ${property.id}:`, error);
        return sum + (property.mortgage?.originalAmount || 0);
      }
    }, 0);
  } else {
    // Fallback: use original amount if calculation not available
    totalMortgageBalance = properties.reduce((sum, property) => {
      return sum + (property.mortgage?.originalAmount || 0);
    }, 0);
  }
  
  
  const totalEquity = totalValue - totalMortgageBalance;
  
  // Calculate total annual operating expenses (excluding mortgage payments) using standardized calculation
  const totalAnnualOperatingExpenses = properties.reduce((sum, property) => {
    return sum + calculateAnnualOperatingExpenses(property);
  }, 0);
  
  // Calculate Net Operating Income (NOI) = Total Annual Income - Total Annual Operating Expenses
  const netOperatingIncome = (totalMonthlyRent * 12) - totalAnnualOperatingExpenses;
  
  // Calculate total annual deductible expenses (operating expenses + mortgage interest)
  let totalAnnualDeductibleExpenses = 0;
  
  // Use accurate calculation for browser environment
  if (typeof window !== 'undefined' && getAnnualMortgageInterest && calculateAnnualOperatingExpenses) {
    totalAnnualDeductibleExpenses = properties.reduce((sum, property) => {
      try {
        // Calculate annual operating expenses (excluding mortgage principal)
        const annualOperatingExpenses = calculateAnnualOperatingExpenses(property);
        
        // Calculate accurate annual mortgage interest from schedule
        const annualMortgageInterest = getAnnualMortgageInterest(property.mortgage);
        
        return sum + annualOperatingExpenses + annualMortgageInterest;
      } catch (error) {
        console.warn(`Error calculating deductible expenses for ${property.id}:`, error);
        // Fallback to simplified calculation
        const annualOperatingExpenses = 
          (property.monthlyExpenses?.propertyTax || 0) * 12 +
          (property.monthlyExpenses?.condoFees || 0) * 12 +
          (property.monthlyExpenses?.insurance || 0) * 12 +
          (property.monthlyExpenses?.maintenance || 0) * 12 +
          (property.monthlyExpenses?.professionalFees || 0) * 12 +
          (property.monthlyExpenses?.utilities || 0) * 12;
        const estimatedAnnualMortgageInterest = (property.mortgage?.originalAmount || 0) * (property.mortgage?.interestRate || 0);
        return sum + annualOperatingExpenses + estimatedAnnualMortgageInterest;
      }
    }, 0);
  } else {
    // Fallback: use simplified calculation if utilities not available
    totalAnnualDeductibleExpenses = properties.reduce((sum, property) => {
      const annualOperatingExpenses = 
        (property.monthlyExpenses?.propertyTax || 0) * 12 +
        (property.monthlyExpenses?.condoFees || 0) * 12 +
        (property.monthlyExpenses?.insurance || 0) * 12 +
        (property.monthlyExpenses?.maintenance || 0) * 12 +
        (property.monthlyExpenses?.professionalFees || 0) * 12 +
        (property.monthlyExpenses?.utilities || 0) * 12;
      const estimatedAnnualMortgageInterest = (property.mortgage?.originalAmount || 0) * (property.mortgage?.interestRate || 0);
      return sum + annualOperatingExpenses + estimatedAnnualMortgageInterest;
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
