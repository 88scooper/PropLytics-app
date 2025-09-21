// Shared mock data storage for development
export let mockMortgages = [
  {
    id: 'mock-mortgage-1',
    userId: 'demo-user',
    lenderName: 'TD Bank',
    propertyId: 'richmond-st-e-403',
    originalAmount: 492000,
    interestRate: 5.2,
    rateType: 'FIXED',
    amortizationPeriodYears: 25,
    termYears: 5,
    startDate: new Date('2022-02-04'),
    paymentFrequency: 'BIWEEKLY',
    createdAt: new Date('2022-02-04'),
    updatedAt: new Date('2022-02-04')
  },
  {
    id: 'mock-mortgage-2',
    userId: 'demo-user',
    lenderName: 'RBC Royal Bank',
    propertyId: 'wilson-ave-415',
    originalAmount: 385000,
    interestRate: 4.8,
    rateType: 'VARIABLE',
    amortizationPeriodYears: 30,
    termYears: 5,
    startDate: new Date('2023-01-15'),
    paymentFrequency: 'MONTHLY',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15')
  }
];

export function addMockMortgage(mortgage) {
  mockMortgages.push(mortgage);
}

export function getMockMortgagesByUser(userId) {
  return mockMortgages.filter(mortgage => mortgage.userId === userId);
}
