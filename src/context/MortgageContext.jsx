"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  getMortgages, 
  addMortgage, 
  updateMortgage, 
  deleteMortgage, 
  getMortgage,
  getMortgagesByProperty 
} from '@/lib/firestore';
import { db } from '@/lib/firebase';

const MortgageContext = createContext();

export const MortgageProvider = ({ children }) => {
  const { user } = useAuth();
  const [mortgages, setMortgages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load mortgages when user changes
  useEffect(() => {
    if (!user?.uid) {
      setMortgages([]);
      setLoading(false);
      return;
    }

    if (!db) {
      // Provide mock data when Firebase is not available
      setMortgages([
        {
          id: 'mock-mortgage-1',
          lenderName: 'TD Bank',
          propertyId: 'richmond-st-e-403',
          originalAmount: 492000,
          interestRate: 5.2,
          rateType: 'FIXED',
          amortizationPeriodYears: 25,
          termYears: 5,
          startDate: new Date('2022-02-04'),
          paymentFrequency: 'BIWEEKLY',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'mock-mortgage-2',
          lenderName: 'RBC Royal Bank',
          propertyId: 'wilson-ave-415',
          originalAmount: 385000,
          interestRate: 4.8,
          rateType: 'VARIABLE',
          amortizationPeriodYears: 30,
          termYears: 5,
          startDate: new Date('2023-01-15'),
          paymentFrequency: 'MONTHLY',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      setLoading(false);
      setError(null); // Clear error to prevent display issues
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = getMortgages(user.uid, (mortgageList) => {
      setMortgages(mortgageList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Add a new mortgage
  const addNewMortgage = async (mortgageData) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    if (!db) {
      // Mock implementation for development
      const mockMortgage = {
        id: `mock-mortgage-${Date.now()}`,
        ...mortgageData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setMortgages(prev => [mockMortgage, ...prev]);
      return mockMortgage.id;
    }

    try {
      setLoading(true);
      setError(null);
      
      const mortgageId = await addMortgage(user.uid, {
        ...mortgageData,
        userId: user.uid
      });
      
      return mortgageId;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing mortgage
  const updateExistingMortgage = async (mortgageId, mortgageData) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    if (!db) {
      // Mock implementation for development
      setMortgages(prev => prev.map(mortgage => 
        mortgage.id === mortgageId 
          ? { ...mortgage, ...mortgageData, updatedAt: new Date() }
          : mortgage
      ));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await updateMortgage(user.uid, mortgageId, mortgageData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a mortgage
  const removeMortgage = async (mortgageId) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    if (!db) {
      // Mock implementation for development
      setMortgages(prev => prev.filter(mortgage => mortgage.id !== mortgageId));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await deleteMortgage(user.uid, mortgageId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single mortgage
  const getSingleMortgage = async (mortgageId) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    if (!db) {
      // Mock implementation for development
      return mortgages.find(mortgage => mortgage.id === mortgageId) || null;
    }

    try {
      return await getMortgage(user.uid, mortgageId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get mortgages for a specific property
  const getPropertyMortgages = async (propertyId) => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    if (!db) {
      // Mock implementation for development
      return mortgages.filter(mortgage => mortgage.propertyId === propertyId);
    }

    try {
      return await getMortgagesByProperty(user.uid, propertyId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Calculate mortgage payment
  const calculateMortgagePayment = (principal, annualRate, years, frequency = 'MONTHLY') => {
    if (principal <= 0 || annualRate < 0 || years <= 0) return 0;

    const rate = annualRate / 100;
    const periodsPerYear = frequency === 'MONTHLY' ? 12 : 
                          frequency === 'BIWEEKLY' ? 26 : 
                          frequency === 'WEEKLY' ? 52 : 12;
    
    const totalPeriods = years * periodsPerYear;
    const periodRate = rate / periodsPerYear;

    if (periodRate === 0) {
      return principal / totalPeriods;
    }

    return principal * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
           (Math.pow(1 + periodRate, totalPeriods) - 1);
  };

  // Calculate remaining balance
  const calculateRemainingBalance = (principal, annualRate, years, paymentsMade, frequency = 'MONTHLY') => {
    if (principal <= 0 || annualRate < 0 || years <= 0) return principal;

    const rate = annualRate / 100;
    const periodsPerYear = frequency === 'MONTHLY' ? 12 : 
                          frequency === 'BIWEEKLY' ? 26 : 
                          frequency === 'WEEKLY' ? 52 : 12;
    
    const totalPeriods = years * periodsPerYear;
    const periodRate = rate / periodsPerYear;
    const payment = calculateMortgagePayment(principal, annualRate, years, frequency);

    if (periodRate === 0) {
      return Math.max(0, principal - (payment * paymentsMade));
    }

    const remainingPeriods = totalPeriods - paymentsMade;
    if (remainingPeriods <= 0) return 0;

    return payment * (1 - Math.pow(1 + periodRate, -remainingPeriods)) / periodRate;
  };

  const value = {
    mortgages,
    loading,
    error,
    addNewMortgage,
    updateExistingMortgage,
    removeMortgage,
    getSingleMortgage,
    getPropertyMortgages,
    calculateMortgagePayment,
    calculateRemainingBalance
  };

  return (
    <MortgageContext.Provider value={value}>
      {children}
    </MortgageContext.Provider>
  );
};

export const useMortgages = () => {
  const context = useContext(MortgageContext);
  if (context === undefined) {
    throw new Error('useMortgages must be used within a MortgageProvider');
  }
  return context;
};
