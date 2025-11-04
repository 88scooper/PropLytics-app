// Shared mock data storage for development - Updated with real data from CSV files
export let mockMortgages = [
  {
    id: 'mock-mortgage-1',
    userId: 'demo-user',
    lenderName: 'Lender 1',
    propertyId: 'first-st-1',
    originalAmount: 400000,
    interestRate: 2.5,
    rateType: 'FIXED',
    amortizationPeriodYears: 30,
    termYears: 5,
    startDate: new Date('2021-01-01'),
    paymentFrequency: 'MONTHLY',
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  },
  {
    id: 'mock-mortgage-2',
    userId: 'demo-user',
    lenderName: 'Lender 2',
    propertyId: 'second-dr-1',
    originalAmount: 400000,
    interestRate: 2.5,
    rateType: 'FIXED',
    amortizationPeriodYears: 30,
    termYears: 5,
    startDate: new Date('2021-01-01'),
    paymentFrequency: 'MONTHLY',
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01')
  }
];

export function addMockMortgage(mortgage) {
  mockMortgages.push(mortgage);
}

export function getMockMortgagesByUser(userId) {
  return mockMortgages.filter(mortgage => mortgage.userId === userId);
}
