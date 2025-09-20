import { z } from 'zod';

// Mortgage form validation schema
export const mortgageSchema = z.object({
  lenderName: z.string()
    .min(1, 'Lender name is required')
    .max(255, 'Lender name must be less than 255 characters')
    .trim(),
  
  propertyId: z.string()
    .min(1, 'Property selection is required')
    .transform(val => val === '' ? null : val),
  
  originalAmount: z.number()
    .min(1, 'Original amount must be greater than 0')
    .max(10000000, 'Original amount must be less than $10,000,000'),
  
  interestRate: z.number()
    .min(0, 'Interest rate must be 0 or greater')
    .max(50, 'Interest rate must be less than 50%'),
  
  rateType: z.enum(['FIXED', 'VARIABLE'], {
    errorMap: () => ({ message: 'Rate type must be either FIXED or VARIABLE' })
  }),
  
  variableRateSpread: z.number()
    .min(-10, 'Variable rate spread must be greater than -10%')
    .max(10, 'Variable rate spread must be less than 10%')
    .optional()
    .nullable()
    .transform(val => val === undefined ? null : val),
  
  amortizationPeriodYears: z.number()
    .int('Amortization period must be a whole number')
    .min(1, 'Amortization period must be at least 1 year')
    .max(50, 'Amortization period must be less than 50 years'),
  
  termYears: z.number()
    .int('Term must be a whole number')
    .min(1, 'Term must be at least 1 year')
    .max(30, 'Term must be less than 30 years'),
  
  startDate: z.date({
    errorMap: () => ({ message: 'Start date must be a valid date' })
  }),
  
  paymentFrequency: z.enum([
    'MONTHLY', 
    'SEMI_MONTHLY', 
    'BI_WEEKLY', 
    'ACCELERATED_BI_WEEKLY', 
    'WEEKLY', 
    'ACCELERATED_WEEKLY'
  ], {
    errorMap: () => ({ message: 'Payment frequency must be one of the supported options' })
  }),
});

// Partial mortgage schema for updates
export const partialMortgageSchema = mortgageSchema.partial();

// Prepayment analysis validation schema
export const prepaymentAnalysisSchema = z.object({
  mortgageData: mortgageSchema,
  prepaymentType: z.enum(['lumpSum', 'increasedPayment']),
  lumpSumAmount: z.number()
    .min(1, 'Lump sum amount must be greater than 0')
    .optional(),
  lumpSumPaymentNumber: z.number()
    .int('Payment number must be a whole number')
    .min(1, 'Payment number must be at least 1')
    .optional(),
  additionalPayment: z.number()
    .min(1, 'Additional payment must be greater than 0')
    .optional(),
  startPaymentNumber: z.number()
    .int('Start payment number must be a whole number')
    .min(1, 'Start payment number must be at least 1')
    .optional(),
}).refine((data) => {
  if (data.prepaymentType === 'lumpSum') {
    return data.lumpSumAmount !== undefined && data.lumpSumPaymentNumber !== undefined;
  }
  if (data.prepaymentType === 'increasedPayment') {
    return data.additionalPayment !== undefined;
  }
  return true;
}, {
  message: 'Required fields are missing for the selected prepayment type',
  path: ['prepaymentType']
});

// Refinance analysis validation schema
export const refinanceAnalysisSchema = z.object({
  currentMortgage: z.object({
    interestRate: z.number()
      .min(0, 'Interest rate must be 0 or greater')
      .max(50, 'Interest rate must be less than 50%'),
    rateType: z.enum(['FIXED', 'VARIABLE']),
    amortizationPeriodYears: z.number()
      .int('Amortization period must be a whole number')
      .min(1, 'Amortization period must be at least 1 year')
      .max(50, 'Amortization period must be less than 50 years'),
    paymentFrequency: z.enum([
      'MONTHLY', 
      'SEMI_MONTHLY', 
      'BI_WEEKLY', 
      'ACCELERATED_BI_WEEKLY', 
      'WEEKLY', 
      'ACCELERATED_WEEKLY'
    ]),
    startDate: z.date().optional(),
    termYears: z.number().int().min(1).max(30).optional(),
  }),
  newMortgage: mortgageSchema,
  remainingBalance: z.number()
    .min(1, 'Remaining balance must be greater than 0')
    .max(10000000, 'Remaining balance must be less than $10,000,000'),
});

// Calculator form validation schema
export const calculatorSchema = z.object({
  originalAmount: z.number()
    .min(1, 'Loan amount must be greater than 0')
    .max(10000000, 'Loan amount must be less than $10,000,000'),
  
  interestRate: z.number()
    .min(0, 'Interest rate must be 0 or greater')
    .max(50, 'Interest rate must be less than 50%'),
  
  rateType: z.enum(['FIXED', 'VARIABLE']),
  
  amortizationPeriodYears: z.number()
    .int('Amortization period must be a whole number')
    .min(1, 'Amortization period must be at least 1 year')
    .max(50, 'Amortization period must be less than 50 years'),
  
  paymentFrequency: z.enum([
    'MONTHLY', 
    'SEMI_MONTHLY', 
    'BI_WEEKLY', 
    'ACCELERATED_BI_WEEKLY', 
    'WEEKLY', 
    'ACCELERATED_WEEKLY'
  ]),
  
  startDate: z.date().optional(),
  termYears: z.number().int().min(1).max(30).optional(),
  includeSchedule: z.boolean().optional().default(false),
});

// Property selection schema
export const propertySelectionSchema = z.object({
  propertyId: z.string().min(1, 'Please select a property'),
});

// Helper function to transform form data for API
export function transformMortgageFormData(formData) {
  return {
    ...formData,
    originalAmount: Number(formData.originalAmount),
    interestRate: Number(formData.interestRate) / 100, // Convert percentage to decimal
    variableRateSpread: formData.variableRateSpread ? Number(formData.variableRateSpread) / 100 : null,
    amortizationPeriodYears: Number(formData.amortizationPeriodYears),
    termYears: Number(formData.termYears),
    startDate: formData.startDate instanceof Date ? formData.startDate.toISOString() : formData.startDate,
  };
}

// Helper function to transform API data for forms
export function transformMortgageApiData(apiData) {
  return {
    ...apiData,
    interestRate: Number(apiData.interestRate) * 100, // Convert decimal to percentage
    variableRateSpread: apiData.variableRateSpread ? Number(apiData.variableRateSpread) * 100 : null,
    startDate: apiData.startDate ? new Date(apiData.startDate) : new Date(),
  };
}
