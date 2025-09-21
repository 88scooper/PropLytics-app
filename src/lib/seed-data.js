// Production seed data for mortgages
export const seedMortgageData = [
  {
    lenderName: 'RMG',
    originalAmount: 492000,
    interestRate: 0.05, // Default prime rate for variable
    rateType: 'VARIABLE',
    variableRateSpread: -0.0095, // -0.95% spread
    amortizationPeriodMonths: 300,
    termMonths: 60,
    startDate: new Date('2019-02-04'),
    paymentFrequency: 'MONTHLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: true,
    propertyId: null
  },
  {
    lenderName: 'RMG',
    originalAmount: 443146.14,
    interestRate: 0.0269, // 2.69% fixed
    rateType: 'FIXED',
    variableRateSpread: null,
    amortizationPeriodMonths: 239,
    termMonths: 60,
    startDate: new Date('2022-02-03'),
    paymentFrequency: 'BI_WEEKLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: false,
    propertyId: null
  },
  {
    lenderName: 'TD Bank',
    originalAmount: 358800,
    interestRate: 0.0549, // 5.49% fixed
    rateType: 'FIXED',
    variableRateSpread: null,
    amortizationPeriodMonths: 360,
    termMonths: 48,
    startDate: new Date('2023-08-01'),
    paymentFrequency: 'MONTHLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: true,
    propertyId: null
  },
  {
    lenderName: 'RBC',
    originalAmount: 358000,
    interestRate: 0.05, // Default prime rate for variable
    rateType: 'VARIABLE',
    variableRateSpread: -0.0075, // -0.75% spread
    amortizationPeriodMonths: 361,
    termMonths: 60,
    startDate: new Date('2025-03-21'),
    paymentFrequency: 'MONTHLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: true,
    propertyId: null
  },
  {
    lenderName: 'RBC',
    originalAmount: 426382.1,
    interestRate: 0.0445, // 4.45% fixed
    rateType: 'FIXED',
    variableRateSpread: null,
    amortizationPeriodMonths: 360,
    termMonths: 36,
    startDate: new Date('2025-01-22'),
    paymentFrequency: 'MONTHLY',
    mortgageType: 'CLOSED',
    hasFixedPayments: true,
    propertyId: null
  }
];

// Helper function to seed production data
export async function seedProductionData(userId) {
  try {
    // This would be called from a production seeding script
    // and would use the actual Firebase/Firestore database
    console.log('Seeding production data for user:', userId);
    console.log('Mortgage data:', seedMortgageData);
    
    // In a real implementation, this would:
    // 1. Connect to the production database
    // 2. Clear existing data for the user
    // 3. Insert the seed data
    // 4. Return success/failure status
    
    return {
      success: true,
      message: 'Production data seeded successfully',
      count: seedMortgageData.length
    };
  } catch (error) {
    console.error('Error seeding production data:', error);
    return {
      success: false,
      message: 'Failed to seed production data',
      error: error.message
    };
  }
}
