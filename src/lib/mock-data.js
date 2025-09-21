// Shared mock data storage for development - Updated with real data from CSV files
export let mockMortgages = [
  {
    id: 'mock-mortgage-1',
    userId: 'demo-user',
    lenderName: 'RMG',
    propertyId: 'richmond-st-e-403',
    originalAmount: 443146.14,
    interestRate: 2.69,
    rateType: 'FIXED',
    amortizationPeriodYears: 20,
    termYears: 5,
    startDate: new Date('2022-02-03'),
    paymentFrequency: 'BIWEEKLY',
    createdAt: new Date('2022-02-03'),
    updatedAt: new Date('2022-02-03')
  },
  {
    id: 'mock-mortgage-2',
    userId: 'demo-user',
    lenderName: 'RBC',
    propertyId: 'tretti-way-317',
    originalAmount: 358000,
    interestRate: -0.75,
    rateType: 'VARIABLE',
    amortizationPeriodYears: 30,
    termYears: 5,
    startDate: new Date('2025-03-21'),
    paymentFrequency: 'MONTHLY',
    createdAt: new Date('2025-03-21'),
    updatedAt: new Date('2025-03-21')
  },
  {
    id: 'mock-mortgage-3',
    userId: 'demo-user',
    lenderName: 'RBC',
    propertyId: 'wilson-ave-415',
    originalAmount: 426382.1,
    interestRate: 4.45,
    rateType: 'FIXED',
    amortizationPeriodYears: 30,
    termYears: 3,
    startDate: new Date('2025-01-22'),
    paymentFrequency: 'MONTHLY',
    createdAt: new Date('2025-01-22'),
    updatedAt: new Date('2025-01-22')
  }
];

export function addMockMortgage(mortgage) {
  mockMortgages.push(mortgage);
}

export function getMockMortgagesByUser(userId) {
  return mockMortgages.filter(mortgage => mortgage.userId === userId);
}
