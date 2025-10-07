import { useEffect } from 'react';
import { properties } from '@/data/properties';
import { getMonthlyMortgagePayment, getMonthlyMortgageInterest, getMonthlyMortgagePrincipal } from '@/utils/mortgageCalculator';
import { 
  calculateAnnualOperatingExpenses, 
  calculateNOI, 
  calculateCapRate, 
  calculateMonthlyCashFlow, 
  calculateAnnualCashFlow, 
  calculateCashOnCashReturn 
} from '@/utils/financialCalculations';

export function usePropertyCalculations() {
  useEffect(() => {
    // Calculate mortgage payments for each property when the hook is used
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
  }, []);
}
