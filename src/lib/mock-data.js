// Shared mock data storage for development
export let mockMortgages = [
  {
    id: 'mock-mortgage-1',
    userId: 'mock-user-1',
    lenderName: 'TD Bank',
    propertyId: 'richmond-st-e-403',
    originalAmount: 492000,
    interestRate: 5.2,
    rateType: 'FIXED',
    variableRateSpread: null,
    amortizationPeriodMonths: 300, // 25 years * 12 months
    termMonths: 60, // 5 years * 12 months
    startDate: new Date('2022-02-04'),
    paymentFrequency: 'BIWEEKLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function addMockMortgage(mortgage) {
  mockMortgages.push(mortgage);
}

export function getMockMortgagesByUser(userId) {
  return mockMortgages.filter(mortgage => mortgage.userId === userId);
}
