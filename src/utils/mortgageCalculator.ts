// Mortgage amortization calculator utility
// Compatible with existing property data structure

export interface MortgageData {
  lender: string;
  originalAmount: number;
  interestRate: number; // as decimal (e.g., 0.0269 for 2.69%)
  rateType: string;
  termMonths: number;
  amortizationYears: number;
  paymentFrequency: string;
  startDate: string;
}

export interface PaymentScheduleItem {
  paymentNumber: number;
  paymentDate: string;
  monthlyPayment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface AmortizationSchedule {
  payments: PaymentScheduleItem[];
  totalInterest: number;
  totalPayments: number;
  finalPaymentDate: string;
}

/**
 * Calculate mortgage payment amount based on payment frequency
 */
function calculatePaymentAmount(
  principal: number,
  annualRate: number,
  amortizationYears: number,
  paymentFrequency: string
): number {
  const totalPayments = getTotalPayments(amortizationYears, paymentFrequency);
  const periodicRate = getPeriodicRate(annualRate, paymentFrequency);
  
  if (periodicRate === 0) {
    return principal / totalPayments;
  }
  
  return principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / 
         (Math.pow(1 + periodicRate, totalPayments) - 1);
}

/**
 * Get total number of payments based on frequency
 */
function getTotalPayments(amortizationYears: number, paymentFrequency: string): number {
  switch (paymentFrequency.toLowerCase()) {
    case 'monthly':
      return amortizationYears * 12;
    case 'bi-weekly':
      return amortizationYears * 26;
    case 'weekly':
      return amortizationYears * 52;
    default:
      return amortizationYears * 12; // Default to monthly
  }
}

/**
 * Get periodic interest rate based on payment frequency
 */
function getPeriodicRate(annualRate: number, paymentFrequency: string): number {
  switch (paymentFrequency.toLowerCase()) {
    case 'monthly':
      return annualRate / 12;
    case 'bi-weekly':
      return annualRate / 26;
    case 'weekly':
      return annualRate / 52;
    default:
      return annualRate / 12; // Default to monthly
  }
}

/**
 * Calculate the number of days to add for next payment based on frequency
 */
function getPaymentIntervalDays(paymentFrequency: string): number {
  switch (paymentFrequency.toLowerCase()) {
    case 'monthly':
      return 30; // Approximate
    case 'bi-weekly':
      return 14;
    case 'weekly':
      return 7;
    default:
      return 30;
  }
}

/**
 * Calculate complete amortization schedule for a mortgage
 */
export function calculateAmortizationSchedule(mortgage: MortgageData): AmortizationSchedule {
  // Validate inputs
  if (!mortgage.originalAmount || mortgage.originalAmount <= 0) {
    throw new Error('Invalid mortgage amount');
  }
  
  if (mortgage.interestRate === undefined || mortgage.interestRate === null) {
    throw new Error('Invalid interest rate');
  }
  
  if (!mortgage.amortizationYears || mortgage.amortizationYears <= 0) {
    throw new Error('Invalid amortization period');
  }

  const principal = mortgage.originalAmount;
  const annualRate = mortgage.interestRate;
  const amortizationYears = mortgage.amortizationYears;
  const paymentFrequency = mortgage.paymentFrequency;
  const startDate = new Date(mortgage.startDate);

  // Calculate payment amount
  const paymentAmount = calculatePaymentAmount(principal, annualRate, amortizationYears, paymentFrequency);
  const totalPayments = getTotalPayments(amortizationYears, paymentFrequency);
  const periodicRate = getPeriodicRate(annualRate, paymentFrequency);
  const paymentIntervalDays = getPaymentIntervalDays(paymentFrequency);

  const payments: PaymentScheduleItem[] = [];
  let remainingBalance = principal;
  let totalInterest = 0;

  for (let i = 1; i <= totalPayments; i++) {
    const interestPayment = remainingBalance * periodicRate;
    const principalPayment = Math.min(paymentAmount - interestPayment, remainingBalance);
    const actualPayment = principalPayment + interestPayment;

    // Handle final payment
    if (i === totalPayments) {
      const finalPrincipal = remainingBalance;
      const finalInterest = finalPrincipal * periodicRate;
      remainingBalance = 0;
      totalInterest += finalInterest;
      
      payments.push({
        paymentNumber: i,
        paymentDate: new Date(startDate.getTime() + (i - 1) * paymentIntervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyPayment: finalPrincipal + finalInterest,
        principal: finalPrincipal,
        interest: finalInterest,
        remainingBalance: 0
      });
    } else {
      remainingBalance -= principalPayment;
      totalInterest += interestPayment;

      payments.push({
        paymentNumber: i,
        paymentDate: new Date(startDate.getTime() + (i - 1) * paymentIntervalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyPayment: actualPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: remainingBalance
      });
    }
  }

  const finalPaymentDate = payments[payments.length - 1]?.paymentDate || '';

  return {
    payments,
    totalInterest,
    totalPayments,
    finalPaymentDate
  };
}

/**
 * Get current month's mortgage payment breakdown
 * Returns the principal and interest for the current payment period
 */
export function getCurrentMortgagePayment(mortgage: MortgageData): {
  principal: number;
  interest: number;
  totalPayment: number;
  paymentNumber: number;
} {
  const schedule = calculateAmortizationSchedule(mortgage);
  const currentDate = new Date();
  
  // Find the current payment period
  const currentPayment = schedule.payments.find(payment => {
    const paymentDate = new Date(payment.paymentDate);
    return paymentDate <= currentDate;
  });

  if (currentPayment) {
    return {
      principal: currentPayment.principal,
      interest: currentPayment.interest,
      totalPayment: currentPayment.monthlyPayment,
      paymentNumber: currentPayment.paymentNumber
    };
  }

  // Fallback to first payment if no current payment found
  const firstPayment = schedule.payments[0];
  return {
    principal: firstPayment.principal,
    interest: firstPayment.interest,
    totalPayment: firstPayment.monthlyPayment,
    paymentNumber: 1
  };
}

/**
 * Get monthly mortgage payment amount (converted to monthly equivalent for bi-weekly payments)
 */
export function getMonthlyMortgagePayment(mortgage: MortgageData): number {
  const paymentAmount = calculatePaymentAmount(
    mortgage.originalAmount,
    mortgage.interestRate,
    mortgage.amortizationYears,
    mortgage.paymentFrequency
  );

  // Convert to monthly equivalent
  switch (mortgage.paymentFrequency.toLowerCase()) {
    case 'monthly':
      return paymentAmount;
    case 'bi-weekly':
      return paymentAmount * 26 / 12; // 26 bi-weekly payments per year / 12 months
    case 'weekly':
      return paymentAmount * 52 / 12; // 52 weekly payments per year / 12 months
    default:
      return paymentAmount;
  }
}

/**
 * Get monthly mortgage interest payment (converted to monthly equivalent)
 */
export function getMonthlyMortgageInterest(mortgage: MortgageData): number {
  const currentPayment = getCurrentMortgagePayment(mortgage);
  
  // Convert to monthly equivalent based on payment frequency
  switch (mortgage.paymentFrequency.toLowerCase()) {
    case 'monthly':
      return currentPayment.interest;
    case 'bi-weekly':
      return currentPayment.interest * 26 / 12; // 26 bi-weekly payments per year / 12 months
    case 'weekly':
      return currentPayment.interest * 52 / 12; // 52 weekly payments per year / 12 months
    default:
      return currentPayment.interest;
  }
}

/**
 * Get monthly mortgage principal payment (converted to monthly equivalent)
 */
export function getMonthlyMortgagePrincipal(mortgage: MortgageData): number {
  const currentPayment = getCurrentMortgagePayment(mortgage);
  
  // Convert to monthly equivalent based on payment frequency
  switch (mortgage.paymentFrequency.toLowerCase()) {
    case 'monthly':
      return currentPayment.principal;
    case 'bi-weekly':
      return currentPayment.principal * 26 / 12; // 26 bi-weekly payments per year / 12 months
    case 'weekly':
      return currentPayment.principal * 52 / 12; // 52 weekly payments per year / 12 months
    default:
      return currentPayment.principal;
  }
}

/**
 * Calculate current mortgage balance based on payments made to date
 */
export function getCurrentMortgageBalance(mortgage: MortgageData): number {
  const currentPayment = getCurrentMortgagePayment(mortgage);
  return currentPayment.remainingBalance;
}
