"use client";

import React, { createContext, useContext, useMemo, useCallback, ReactNode, useEffect, useState } from 'react';
import { properties, getPropertyById, getAllProperties, getPortfolioMetrics } from '@/data/properties';

// Define TypeScript interfaces for better type safety
export interface Property {
  id: string;
  nickname: string;
  address: string;
  purchasePrice: number;
  purchaseDate: string;
  closingCosts: number;
  renovationCosts: number;
  currentMarketValue: number;
  yearBuilt: number;
  propertyType: string;
  size: number;
  unitConfig: string;
  mortgage: {
    lender: string;
    originalAmount: number;
    interestRate: number;
    rateType: string;
    termMonths: number;
    amortizationYears: number;
    paymentFrequency: string;
    startDate: string;
  };
  rent: {
    monthlyRent: number;
    annualRent: number;
  };
  expenses: {
    propertyTax: { amount: number; frequency: string };
    condoFees: { amount: number; frequency: string };
    insurance: { amount: number; frequency: string };
    maintenance: { amount: number; frequency: string };
    professionalFees: { amount: number; frequency: string };
    utilities?: { amount: number; frequency: string };
  };
  tenant: {
    name: string;
    leaseStartDate: string;
    leaseEndDate: string;
    rent: number;
    status: string;
  };
  totalInvestment: number;
  appreciation: number;
  monthlyPropertyTax: number;
  monthlyCondoFees: number;
  monthlyInsurance: number;
  monthlyMaintenance: number;
  monthlyProfessionalFees: number;
  monthlyUtilities?: number;
  monthlyExpenses: {
    propertyTax: number;
    condoFees: number;
    insurance: number;
    maintenance: number;
    professionalFees: number;
    utilities?: number;
    total: number;
  };
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  occupancy: number;
  name: string;
  type: string;
  units: number;
  bedrooms: number[];
  bathrooms: number[];
  squareFootage: number;
  currentValue: number;
  tenants: Array<{
    name: string;
    unit: string;
    rent: number;
    leaseStart: string;
    leaseEnd: string;
    status: string;
  }>;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalInvestment: number;
  totalEquity: number;
  totalMortgageBalance: number;
  totalMonthlyRent: number;
  totalMonthlyExpenses: number;
  totalMonthlyCashFlow: number;
  totalAnnualOperatingExpenses: number;
  netOperatingIncome: number;
  totalAnnualDeductibleExpenses: number;
  totalProperties: number;
  averageCapRate: number;
  averageOccupancy: number;
  totalAnnualCashFlow: number;
  cashOnCashReturn: number;
}

export interface PropertyContextType {
  // All properties data
  properties: Property[];
  
  // Portfolio metrics
  portfolioMetrics: PortfolioMetrics;
  
  // Calculation state
  calculationsComplete: boolean;
  
  // Helper functions
  getPropertyById: (id: string) => Property | undefined;
  getPropertiesByType: (type: string) => Property[];
  getPropertiesByLocation: (location: string) => Property[];
  getPropertiesWithTenants: () => Property[];
  getVacantProperties: () => Property[];
  
  // Loading and error states (for future use)
  loading: boolean;
  error: string | null;
}

// Create the context
const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

// Provider component
export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calculationsComplete, setCalculationsComplete] = useState(false);
  
  // Calculate mortgage payments and update property data in browser environment
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // For now, use simplified calculations to avoid infinite loading
      properties.forEach(property => {
        try {
          // Use estimated mortgage payments based on original amount and interest rate
          const estimatedMonthlyPayment = (property.mortgage.originalAmount * property.mortgage.interestRate / 12) + 
                                        (property.mortgage.originalAmount / (property.mortgage.amortizationYears * 12));
          
          // Update monthly expenses
          property.monthlyExpenses.mortgagePayment = estimatedMonthlyPayment;
          property.monthlyExpenses.mortgageInterest = property.mortgage.originalAmount * property.mortgage.interestRate / 12;
          property.monthlyExpenses.mortgagePrincipal = property.mortgage.originalAmount / (property.mortgage.amortizationYears * 12);
          
          // Recalculate total monthly expenses
          property.monthlyExpenses.total = 
            (property.monthlyExpenses.propertyTax || 0) +
            (property.monthlyExpenses.condoFees || 0) +
            (property.monthlyExpenses.insurance || 0) +
            (property.monthlyExpenses.maintenance || 0) +
            (property.monthlyExpenses.professionalFees || 0) +
            (property.monthlyExpenses.utilities || 0) +
            property.monthlyExpenses.mortgagePayment;
          
          // Recalculate cash flow
          property.monthlyCashFlow = property.rent.monthlyRent - property.monthlyExpenses.total;
          property.annualCashFlow = property.monthlyCashFlow * 12;
          
          // Recalculate cap rate
          property.capRate = (property.rent.annualRent / property.currentMarketValue) * 100;
          
          // Recalculate cash-on-cash return
          property.cashOnCashReturn = (property.annualCashFlow / property.totalInvestment) * 100;
          
        } catch (error) {
          console.warn(`Error calculating mortgage payments for ${property.id}:`, error);
        }
      });
      
      // Mark calculations as complete to trigger re-render
      setCalculationsComplete(true);
    } else {
      setCalculationsComplete(true); // Server-side rendering
    }
  }, []);
  
  // Get all properties and portfolio metrics
  const allProperties = getAllProperties();
  const metrics = getPortfolioMetrics();

  // Memoized helper functions for performance
  const contextValue = useMemo(() => ({
    properties: allProperties,
    portfolioMetrics: metrics,
    calculationsComplete,
    
    // Helper functions
    getPropertyById: (id: string) => getPropertyById(id),
    getPropertiesByType: (type: string) => 
      allProperties.filter(property => property.propertyType.toLowerCase() === type.toLowerCase()),
    getPropertiesByLocation: (location: string) => 
      allProperties.filter(property => 
        property.address.toLowerCase().includes(location.toLowerCase())
      ),
    getPropertiesWithTenants: () => 
      allProperties.filter(property => 
        property.tenant && property.tenant.name && property.tenant.name.trim() !== ''
      ),
    getVacantProperties: () => 
      allProperties.filter(property => 
        !property.tenant || !property.tenant.name || property.tenant.name.trim() === ''
      ),
    
    // Loading and error states (currently static, can be enhanced later)
    loading: false,
    error: null,
  }), [allProperties, metrics, calculationsComplete]);

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
};

// Custom hook to use the PropertyContext
export const usePropertyContext = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};

// Additional convenience hooks for specific use cases
export const useProperties = (): Property[] => {
  const { properties } = usePropertyContext();
  return properties;
};

export const useProperty = (id: string): Property | undefined => {
  const { getPropertyById } = usePropertyContext();
  return getPropertyById(id);
};

export const usePortfolioMetrics = (): PortfolioMetrics => {
  const { portfolioMetrics } = usePropertyContext();
  return portfolioMetrics;
};

export const usePropertiesByType = (type: string): Property[] => {
  const { getPropertiesByType } = usePropertyContext();
  return getPropertiesByType(type);
};

export const usePropertiesWithTenants = (): Property[] => {
  const { getPropertiesWithTenants } = usePropertyContext();
  return getPropertiesWithTenants();
};

export const useVacantProperties = (): Property[] => {
  const { getVacantProperties } = usePropertyContext();
  return getVacantProperties();
};

// Export the context for direct use if needed
export { PropertyContext };

// Backward compatibility - export the old hook name
export const usePropertyData = usePropertyContext;
