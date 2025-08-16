// Centralized property data source parsed from Property Details.xlsx - Sheet1.csv
export const properties = [
  {
    id: 'richmond-st-e-403',
    address: '403-311 Richmond St E, Toronto, ON M5A4S8',
    nickname: 'Richmond St E',
    imageUrl: '/images/311 Richmond St E.png',
    purchasePrice: 615000,
    closingCosts: 18150,
    closingDate: '2019-02-04',
    marketValue: 800000,
    yearBuilt: 2001,
    propertyType: 'Condo',
    size: 946,
    unitConfig: '2 Bed+Den, 2 Bath',
    monthlyRent: 3450,
    annualPropertyTax: 3852,
    annualInsurance: 512,
    annualMaintenance: 200,
    monthlyCondoFees: 829.58, // 9955 / 12
    propertyManagementFee: 0,
    tenant: {
      name: 'MacNeil, Kate St John',
      leaseStart: '2025-02-16',
      leaseEnd: '2026-02-28',
      rent: 3450
    },
    // Calculated fields
    totalInvestment: 633150, // purchasePrice + closingCosts
    appreciation: 166850, // marketValue - purchasePrice
    monthlyPropertyTax: 321, // annualPropertyTax / 12
    monthlyInsurance: 42.67, // annualInsurance / 12
    monthlyMaintenance: 16.67, // annualMaintenance / 12
    monthlyExpenses: {
      propertyTax: 321,
      insurance: 42.67,
      maintenance: 16.67,
      condoFees: 829.58,
      propertyManagement: 0,
      total: 1209.92
    },
    monthlyCashFlow: 2240.08, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 26880.96, // monthlyCashFlow * 12
    capRate: 5.18, // (monthlyRent * 12) / marketValue * 100
    cashOnCashReturn: 5.09, // (annualCashFlow / totalInvestment) * 100
    occupancy: 100,
    // Mortgage details (estimated based on typical ratios)
    mortgage: {
      lender: 'TD Bank',
      loanAmount: 492000, // 80% of purchase price
      interestRate: 4.25,
      term: 25,
      monthlyPayment: 2650,
      remainingBalance: 465000,
      nextPayment: '2024-01-15'
    },
    // Additional fields for compatibility
    name: 'Richmond St E Condo',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 946,
    purchaseDate: '2019-02-04',
    downPayment: 123000,
    renovationCosts: 0,
    currentValue: 800000,
    tenants: [
      {
        name: 'MacNeil, Kate St John',
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
    address: '317-30 Tretti Way, Toronto, ON M3H0E3',
    nickname: 'Tretti Way',
    imageUrl: '/images/30 Tretti Way.png',
    purchasePrice: 448618,
    closingCosts: 68086,
    closingDate: '2023-10-04',
    marketValue: 550000,
    yearBuilt: 2023,
    propertyType: 'Condo',
    size: 553,
    unitConfig: '2 Bed, 2 Bath',
    monthlyRent: 2300,
    annualPropertyTax: 2567.21,
    annualInsurance: 467,
    annualMaintenance: 200,
    monthlyCondoFees: 473.10, // 5677.2 / 12
    propertyManagementFee: 0,
    tenant: {
      name: 'Pratikkumar Chaudary',
      leaseStart: '2025-07-01',
      leaseEnd: '2026-06-30',
      rent: 2300
    },
    // Calculated fields
    totalInvestment: 516704, // purchasePrice + closingCosts
    appreciation: 101382, // marketValue - purchasePrice
    monthlyPropertyTax: 213.93, // annualPropertyTax / 12
    monthlyInsurance: 38.92, // annualInsurance / 12
    monthlyMaintenance: 16.67, // annualMaintenance / 12
    monthlyExpenses: {
      propertyTax: 213.93,
      insurance: 38.92,
      maintenance: 16.67,
      condoFees: 473.10,
      propertyManagement: 0,
      total: 742.62
    },
    monthlyCashFlow: 1557.38, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 18688.56, // monthlyCashFlow * 12
    capRate: 5.02, // (monthlyRent * 12) / marketValue * 100
    cashOnCashReturn: 3.62, // (annualCashFlow / totalInvestment) * 100
    occupancy: 100,
    // Mortgage details (estimated based on typical ratios)
    mortgage: {
      lender: 'RBC',
      loanAmount: 358894, // 80% of purchase price
      interestRate: 5.25,
      term: 25,
      monthlyPayment: 2150,
      remainingBalance: 345000,
      nextPayment: '2024-01-20'
    },
    // Additional fields for compatibility
    name: 'Tretti Way Condo',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 553,
    purchaseDate: '2023-10-04',
    downPayment: 89724,
    renovationCosts: 0,
    currentValue: 550000,
    tenants: [
      {
        name: 'Pratikkumar Chaudary',
        unit: 'Unit 317',
        rent: 2300,
        leaseStart: '2025-07-01',
        leaseEnd: '2026-06-30',
        status: 'Current'
      }
    ]
  },
  {
    id: 'wilson-ave-415',
    address: '415-500 Wilson Ave, Toronto, ON M3H 0E5',
    nickname: 'Wilson Ave',
    imageUrl: '/images/500 Wilson Ave.png',
    purchasePrice: 533379,
    closingCosts: 53241.9,
    closingDate: '2025-01-22',
    marketValue: 550000,
    yearBuilt: 2025,
    propertyType: 'Condo',
    size: 557,
    unitConfig: '2 Bed, 2 Bath',
    monthlyRent: 2300,
    annualPropertyTax: 2537.5,
    annualInsurance: 527,
    annualMaintenance: 200,
    monthlyCondoFees: 395.58, // 4746.96 / 12
    propertyManagementFee: 0,
    tenant: {
      name: '', // No tenant yet
      leaseStart: '',
      leaseEnd: '',
      rent: 2300
    },
    // Calculated fields
    totalInvestment: 586620.9, // purchasePrice + closingCosts
    appreciation: 16620.1, // marketValue - purchasePrice
    monthlyPropertyTax: 211.46, // annualPropertyTax / 12
    monthlyInsurance: 43.92, // annualInsurance / 12
    monthlyMaintenance: 16.67, // annualMaintenance / 12
    monthlyExpenses: {
      propertyTax: 211.46,
      insurance: 43.92,
      maintenance: 16.67,
      condoFees: 395.58,
      propertyManagement: 0,
      total: 667.63
    },
    monthlyCashFlow: 1632.37, // monthlyRent - monthlyExpenses.total
    annualCashFlow: 19588.44, // monthlyCashFlow * 12
    capRate: 5.02, // (monthlyRent * 12) / marketValue * 100
    cashOnCashReturn: 3.34, // (annualCashFlow / totalInvestment) * 100
    occupancy: 0, // No tenant yet
    // Mortgage details (estimated based on typical ratios)
    mortgage: {
      lender: 'Scotiabank',
      loanAmount: 426703, // 80% of purchase price
      interestRate: 5.75,
      term: 25,
      monthlyPayment: 2650,
      remainingBalance: 426703,
      nextPayment: '2024-02-22'
    },
    // Additional fields for compatibility
    name: 'Wilson Ave Condo',
    type: 'Condo',
    units: 1,
    bedrooms: [2],
    bathrooms: [2],
    squareFootage: 557,
    purchaseDate: '2025-01-22',
    downPayment: 106676,
    renovationCosts: 0,
    currentValue: 550000,
    tenants: [] // No tenants yet
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
  const totalValue = properties.reduce((sum, property) => sum + property.marketValue, 0);
  const totalInvestment = properties.reduce((sum, property) => sum + property.totalInvestment, 0);
  const totalMonthlyRent = properties.reduce((sum, property) => sum + property.monthlyRent, 0);
  const totalMonthlyExpenses = properties.reduce((sum, property) => sum + property.monthlyExpenses.total, 0);
  const totalMonthlyCashFlow = properties.reduce((sum, property) => sum + property.monthlyCashFlow, 0);
  const totalEquity = totalValue - properties.reduce((sum, property) => sum + property.mortgage.remainingBalance, 0);
  
  return {
    totalValue,
    totalInvestment,
    totalEquity,
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
