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
      amortizationYears: 20, // 239 months / 12
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
      total: 1450.00
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
      amortizationYears: 30, // 361 months / 12
      paymentFrequency: 'Monthly',
      startDate: '2025-03-21', // Start date of current mortgage
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
      total: 897.00
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
    purchaseDate: '2025-01-22',
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
      startDate: '2025-01-22',
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
      total: 320.99
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
  const totalMortgageBalance = properties.reduce((sum, property) => sum + property.mortgage.originalAmount, 0);
  const totalEquity = totalValue - totalMortgageBalance;
  
  return {
    totalValue,
    totalInvestment,
    totalEquity,
    totalMortgageBalance,
    totalMonthlyRent,
    totalMonthlyExpenses,
    totalMonthlyCashFlow,
    totalProperties: properties.length,
    averageCapRate: properties.reduce((sum, property) => sum + property.capRate, 0) / properties.length,
    averageOccupancy: properties.reduce((sum, property) => sum + property.occupancy, 0) / properties.length,
    totalAnnualCashFlow: totalMonthlyCashFlow * 12,
    cashOnCashReturn: (totalMonthlyCashFlow * 12 / totalInvestment) * 100
  };
};
