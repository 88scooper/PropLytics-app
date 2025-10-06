import { useEffect } from 'react';
import { properties } from '@/data/properties';
import { getMonthlyMortgagePayment, getMonthlyMortgageInterest, getMonthlyMortgagePrincipal } from '@/utils/mortgageCalculator';

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
        
        // Calculate operating expenses (excluding mortgage payments)
        const monthlyOperatingExpenses = 
          (property.monthlyExpenses.propertyTax || 0) +
          (property.monthlyExpenses.condoFees || 0) +
          (property.monthlyExpenses.insurance || 0) +
          (property.monthlyExpenses.maintenance || 0) +
          (property.monthlyExpenses.professionalFees || 0) +
          (property.monthlyExpenses.utilities || 0);
        
        // Calculate Net Operating Income (NOI) = Rent - Operating Expenses (excluding mortgage)
        const monthlyNOI = property.rent.monthlyRent - monthlyOperatingExpenses;
        const annualNOI = monthlyNOI * 12;
        
        // Recalculate total monthly expenses (including mortgage for cash flow calculation)
        property.monthlyExpenses.total = monthlyOperatingExpenses + property.monthlyExpenses.mortgagePayment;
        
        // Recalculate cash flow (after debt service)
        property.monthlyCashFlow = property.rent.monthlyRent - property.monthlyExpenses.total;
        property.annualCashFlow = property.monthlyCashFlow * 12;
        
        // Recalculate cap rate using correct NOI
        property.capRate = (annualNOI / property.currentMarketValue) * 100;
        
        // Recalculate cash-on-cash return
        property.cashOnCashReturn = (property.annualCashFlow / property.totalInvestment) * 100;
        
      } catch (error) {
        console.warn(`Error calculating mortgage payments for ${property.id}:`, error);
        // Keep default values if calculation fails
      }
    });
  }, []);
}
