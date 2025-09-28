"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useMortgages } from "@/hooks/useMortgages";
import { useState, useMemo } from "react";
import { Plus, Filter, MoreVertical, Edit, Trash2, Eye, Upload, Calculator, TrendingDown, DollarSign, Percent, Calendar, Building2, Clock, Banknote, Download, BarChart3, PieChart, TrendingUp, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import MortgageFormUpgraded from "@/components/mortgages/MortgageFormUpgraded";
import MortgageDetails from "@/components/mortgages/MortgageDetails";
import BulkUploadModal from "@/components/mortgages/BulkUploadModal";
import AmortizationSchedule from "@/components/mortgages/AmortizationSchedule";
import { useProperties } from "@/context/PropertyContext";
import { formatCurrency, formatPercentage } from "@/utils/formatting";
import { calculateAmortizationSchedule } from "@/utils/mortgageCalculator";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts";

export default function MortgagesPage() {
  const { data: apiMortgages = [], isLoading: loading, error } = useMortgages();
  const properties = useProperties();
  
  // All state hooks must be called before any conditional logic
  const [showForm, setShowForm] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [viewingMortgage, setViewingMortgage] = useState(null);
  const [filterProperty, setFilterProperty] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [selectedMortgage, setSelectedMortgage] = useState(null);
  const [selectedMortgageForDashboard, setSelectedMortgageForDashboard] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'analytics', 'comparison'
  const [selectedMortgagesForComparison, setSelectedMortgagesForComparison] = useState([]);
  const [expandedMortgages, setExpandedMortgages] = useState(new Set());
  
  // Create mortgages array from properties data
  const mortgages = properties.map(property => ({
    id: `property-${property.id}`,
    propertyId: property.id,
    lenderName: property.mortgage.lender,
    originalAmount: property.mortgage.originalAmount,
    interestRate: property.mortgage.interestRate * 100, // Convert to percentage for display
    rateType: property.mortgage.rateType,
    amortizationPeriodYears: property.mortgage.amortizationYears,
    termYears: property.mortgage.termMonths / 12,
    startDate: property.mortgage.startDate,
    paymentFrequency: property.mortgage.paymentFrequency,
    mortgage: property.mortgage, // Include the full mortgage object
    propertyName: property.nickname
  }));

  // Get unique property IDs for filter
  const propertyIds = [...new Set(mortgages.map(m => m.propertyId).filter(Boolean))];

  // Group mortgages by property
  const mortgagesByProperty = useMemo(() => {
    const grouped = {};
    mortgages.forEach(mortgage => {
    const propertyId = mortgage.propertyId;
      if (!grouped[propertyId]) {
        grouped[propertyId] = {
        property: properties.find(p => p.id === propertyId),
        mortgages: []
      };
    }
      grouped[propertyId].mortgages.push(mortgage);
    });
    return grouped;
  }, [mortgages, properties]);

  // Filter mortgages based on selected property
  const filteredMortgages = useMemo(() => {
    if (!filterProperty) return mortgages;
    return mortgages.filter(mortgage => mortgage.propertyId === filterProperty);
  }, [mortgages, filterProperty]);

  // Calculate current balance for a mortgage
  const getCurrentMortgageBalance = (mortgage) => {
    try {
      const schedule = calculateAmortizationSchedule(mortgage.mortgage);
      const now = new Date();
      const startDate = new Date(mortgage.startDate);
      const monthsElapsed = Math.max(0, (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth()));
      
      if (monthsElapsed >= schedule.length) {
        return 0; // Mortgage is paid off
      }
      
      return schedule[monthsElapsed]?.remainingBalance || mortgage.originalAmount;
    } catch (error) {
      console.error("Error calculating current balance:", error);
      return mortgage.originalAmount;
    }
  };

  // Calculate monthly payment for each mortgage
  const calculateMonthlyPayment = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears, paymentFrequency } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return 0;
      if (rate === 0) return principal / (years * 12);
      
      // Rate is stored as percentage (2.69 for 2.69%), so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment using standard mortgage formula
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      return Math.round(monthlyPayment * 100) / 100;
    } catch (error) {
      console.error("Error calculating monthly payment:", error);
      return 0;
    }
  };

  // Calculate renewal date
  const calculateRenewalDate = (mortgage) => {
    try {
      const startDate = new Date(mortgage.startDate);
      const renewalDate = new Date(startDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + mortgage.termYears);
      return renewalDate;
    } catch (error) {
      console.error("Error calculating renewal date:", error);
      return null;
    }
  };

  // Calculate remaining loan balance
  const calculateRemainingBalance = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears, startDate } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return principal;
      if (rate === 0) return principal;
      
      // Calculate months since start
      const startDateObj = new Date(startDate);
      const now = new Date();
      const monthsSinceStart = Math.max(0, (now.getFullYear() - startDateObj.getFullYear()) * 12 + (now.getMonth() - startDateObj.getMonth()));
      
      // Rate is stored as percentage, so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      // Calculate remaining balance
      const remainingBalance = principal * 
        (Math.pow(1 + monthlyRate, totalPayments) - Math.pow(1 + monthlyRate, monthsSinceStart)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      return Math.round(Math.max(0, remainingBalance) * 100) / 100;
    } catch (error) {
      console.error("Error calculating remaining balance:", error);
      return mortgage.originalAmount;
    }
  };

  // Calculate total principal paid to date
  const calculateTotalPrincipalPaid = (mortgage) => {
    try {
      const originalAmount = parseFloat(mortgage.originalAmount);
      const remainingBalance = calculateRemainingBalance(mortgage);
      return Math.round((originalAmount - remainingBalance) * 100) / 100;
    } catch (error) {
      console.error("Error calculating total principal paid:", error);
      return 0;
    }
  };

  // Calculate total interest paid to date
  const calculateTotalInterestPaid = (mortgage) => {
    try {
      const { originalAmount, interestRate, amortizationPeriodYears, startDate } = mortgage;
      
      // Ensure all values are numbers
      const principal = parseFloat(originalAmount);
      const rate = parseFloat(interestRate);
      const years = parseFloat(amortizationPeriodYears);
      
      if (principal <= 0 || years <= 0) return 0;
      if (rate === 0) return 0;
      
      // Calculate months since start
      const startDateObj = new Date(startDate);
      const now = new Date();
      const monthsSinceStart = Math.max(0, (now.getFullYear() - startDateObj.getFullYear()) * 12 + (now.getMonth() - startDateObj.getMonth()));
      
      // Rate is stored as percentage, so convert to decimal
      const monthlyRate = (rate / 100) / 12;
      const totalPayments = years * 12;
      
      // Calculate monthly payment
      const monthlyPayment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      // Calculate total payments made
      const totalPaymentsMade = monthlyPayment * monthsSinceStart;
      
      // Calculate total principal paid
      const totalPrincipalPaid = calculateTotalPrincipalPaid(mortgage);
      
      // Total interest paid = total payments made - total principal paid
      return Math.round((totalPaymentsMade - totalPrincipalPaid) * 100) / 100;
    } catch (error) {
      console.error("Error calculating total interest paid:", error);
      return 0;
    }
  };

  // Add current balance and calculated payment to mortgages
  const mortgagesWithBalance = mortgages.map(mortgage => ({
    ...mortgage,
    currentBalance: getCurrentMortgageBalance(mortgage),
    monthlyPayment: calculateMonthlyPayment(mortgage)
  }));

  // Portfolio analytics
  const portfolioAnalytics = useMemo(() => {
    const totalOriginalAmount = mortgagesWithBalance.reduce((sum, m) => sum + m.originalAmount, 0);
    const totalCurrentBalance = mortgagesWithBalance.reduce((sum, m) => sum + m.currentBalance, 0);
    const totalMonthlyPayments = mortgagesWithBalance.reduce((sum, m) => sum + m.monthlyPayment, 0);
    const averageInterestRate = mortgagesWithBalance.length > 0 
      ? mortgagesWithBalance.reduce((sum, m) => sum + m.interestRate, 0) / mortgagesWithBalance.length 
      : 0;
    
    const rateTypeDistribution = mortgagesWithBalance.reduce((acc, m) => {
      acc[m.rateType] = (acc[m.rateType] || 0) + 1;
      return acc;
    }, {});
    
    const termDistribution = mortgagesWithBalance.reduce((acc, m) => {
      acc[m.termYears] = (acc[m.termYears] || 0) + 1;
    return acc;
  }, {});

    const amortizationDistribution = mortgagesWithBalance.reduce((acc, m) => {
      acc[m.amortizationPeriodYears] = (acc[m.amortizationPeriodYears] || 0) + 1;
      return acc;
    }, {});

    return {
      totalOriginalAmount,
      totalCurrentBalance,
      totalMonthlyPayments,
      averageInterestRate,
      rateTypeDistribution,
      termDistribution,
      amortizationDistribution
    };
  }, [mortgagesWithBalance]);

  // Comparison data
  const comparisonData = useMemo(() => {
    if (selectedMortgagesForComparison.length < 2) return null;
    
    return selectedMortgagesForComparison.map(mortgageId => {
      const mortgage = mortgagesWithBalance.find(m => m.id === mortgageId);
      if (!mortgage) return null;
      
      try {
        const schedule = calculateAmortizationSchedule(mortgage.mortgage);
        const totalInterest = schedule.payments.reduce((sum, payment) => sum + payment.interest, 0);
        
        return {
          ...mortgage,
          totalInterest,
          totalCost: mortgage.originalAmount + totalInterest,
          payoffDate: schedule.payments[schedule.payments.length - 1]?.paymentDate
        };
      } catch (error) {
        console.error("Error calculating comparison data for mortgage:", mortgage.lenderName, error);
        return null;
      }
    }).filter(Boolean);
  }, [selectedMortgagesForComparison, mortgagesWithBalance]);

  // Dashboard data for selected mortgage
  const dashboardData = useMemo(() => {
    if (!selectedMortgageForDashboard) return null;
    
    const mortgage = mortgagesWithBalance.find(m => m.id === selectedMortgageForDashboard.id);
    if (!mortgage) return null;
    
    try {
      const schedule = calculateAmortizationSchedule(mortgage.mortgage);
      const totalInterest = schedule.payments.reduce((sum, payment) => sum + payment.interest, 0);
      const totalCost = mortgage.originalAmount + totalInterest;

      return {
        mortgage,
        schedule: schedule.payments,
        totalInterest,
        totalCost,
        remainingPayments: schedule.payments.length,
        payoffDate: schedule.payments[schedule.payments.length - 1]?.paymentDate
      };
    } catch (error) {
      console.error("Error calculating dashboard data:", error);
      return null;
    }
  }, [selectedMortgageForDashboard, mortgagesWithBalance]);

  const handleSelectForDashboard = (mortgage) => {
    setSelectedMortgageForDashboard(mortgage);
  };

  const toggleMortgageExpansion = (mortgageId) => {
    setExpandedMortgages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mortgageId)) {
        newSet.delete(mortgageId);
      } else {
        newSet.add(mortgageId);
      }
      return newSet;
    });
  };

  const handleDownloadSchedule = (mortgageId) => {
    const mortgage = mortgagesWithBalance.find(m => m.id === mortgageId);
    if (!mortgage) return;
    
    const schedule = calculateAmortizationSchedule(mortgage.mortgage);
    const csvContent = [
      ['Payment #', 'Date', 'Principal', 'Interest', 'Total Payment', 'Remaining Balance'],
      ...schedule.map(payment => [
        payment.paymentNumber,
        new Date(payment.paymentDate).toLocaleDateString(),
        payment.principal.toFixed(2),
        payment.interest.toFixed(2),
        payment.monthlyPayment.toFixed(2),
        payment.remainingBalance.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mortgage-schedule-${mortgage.lenderName}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleComparisonToggle = (mortgageId) => {
    setSelectedMortgagesForComparison(prev => {
      if (prev.includes(mortgageId)) {
        return prev.filter(id => id !== mortgageId);
      } else {
        return [...prev, mortgageId];
      }
    });
  };

  // Handle loading and error states after all hooks are called
  if (loading) {
    return (
        <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading mortgages...</p>
          </div>
        </div>
        </Layout>
    );
  }

  if (error) {
    return (
        <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Mortgages</h2>
            <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
          </div>
        </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="space-y-6">
        {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mortgages</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage and analyze your mortgage portfolio
              </p>
            </div>
          <div className="flex gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
              Bulk Upload
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Mortgage
              </button>
            </div>
          </div>

        {/* View Mode Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'dashboard'
                  ? 'bg-[#205A3E] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'analytics'
                  ? 'bg-[#205A3E] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                viewMode === 'comparison'
                  ? 'bg-[#205A3E] text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Comparison
            </button>
          </div>
        </div>

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <div className="space-y-6">
            {/* Portfolio Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Original Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioAnalytics.totalOriginalAmount)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-[#205A3E]" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioAnalytics.totalCurrentBalance)}
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payments</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(portfolioAnalytics.totalMonthlyPayments)}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolioAnalytics.averageInterestRate.toFixed(2)}%
                    </p>
                  </div>
                  <Percent className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rate Type Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(portfolioAnalytics.rateTypeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{type}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Term Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(portfolioAnalytics.termDistribution).map(([term, count]) => (
                    <div key={term} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{term} years</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amortization Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(portfolioAnalytics.amortizationDistribution).map(([amort, count]) => (
                    <div key={amort} className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{amort} years</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison View */}
        {viewMode === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Mortgages to Compare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mortgagesWithBalance.map(mortgage => (
                  <label key={mortgage.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedMortgagesForComparison.includes(mortgage.id)}
                      onChange={() => handleComparisonToggle(mortgage.id)}
                      className="w-4 h-4 text-[#205A3E] border-gray-300 rounded focus:ring-[#205A3E]"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{mortgage.lenderName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(mortgage.originalAmount)}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {comparisonData && comparisonData.length >= 2 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mortgage Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interest Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Interest</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {comparisonData.map((mortgage, index) => (
                        <tr key={mortgage.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {mortgage.lenderName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(mortgage.originalAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {mortgage.interestRate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(mortgage.monthlyPayment)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {formatCurrency(mortgage.totalInterest)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(mortgage.totalCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <>
          {/* Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Property
                  </label>
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#205A3E] focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Properties</option>
                    {propertyIds.map(propertyId => {
                      const property = properties.find(p => p.id === propertyId);
                      return (
                        <option key={propertyId} value={propertyId}>
                          {property?.nickname || `Property ${propertyId}`}
                  </option>
                      );
                    })}
              </select>
            </div>
          </div>
            </div>

            {/* Mortgages List */}
            {Object.keys(mortgagesByProperty).length === 0 ? (
                <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Mortgages Found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by adding your first mortgage.
                </p>
                    <button
                      onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                  Add Mortgage
                    </button>
                </div>
              ) : (
                  <div className="space-y-6">
                    {Object.entries(mortgagesByProperty).map(([propertyId, { property, mortgages: propertyMortgages }]) => (
                      <div key={propertyId} className="space-y-4">

                        {/* Mortgages for this Property */}
                        <div className="grid gap-4">
                      {propertyMortgages.map((mortgage) => {
                        const isExpanded = expandedMortgages.has(mortgage.id);
                        // Calculate schedule directly instead of using useMemo inside map
                        let mortgageSchedule = null;
                        try {
                          const scheduleResult = calculateAmortizationSchedule(mortgage.mortgage);
                          mortgageSchedule = scheduleResult.payments;
                        } catch (error) {
                          console.error("Error calculating schedule:", error);
                          mortgageSchedule = null;
                        }

                        return (
                            <div
                              key={mortgage.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                                selectedMortgageForDashboard?.id === mortgage.id 
                                  ? 'border-[#205A3E] shadow-lg' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-[#205A3E]/50'
                              }`}
                          >
                            {/* Header Section */}
                            <div className="p-4 md:p-6 cursor-pointer" onClick={() => handleSelectForDashboard(mortgage)}>
                              {/* Property Address and Lender */}
                              <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {property?.address || 'Property Address'}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Lender: {mortgage.lenderName || 'Unknown Lender'}
                                </p>
                              </div>

                              {/* Primary Details Section */}
                              <div className="space-y-4 mb-4">
                                {/* Original Loan Amount and Type */}
                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(mortgage.originalAmount)}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Original Loan</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {mortgage.rateType === 'Fixed' ? 'Fixed-Rate Mortgage' : 'Variable-Rate Mortgage'}
                                    </p>
                                  </div>
                                </div>

                                {/* Payment Amount and Interest Rate */}
                                <div className="flex justify-between items-end">
                                  <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                      {formatCurrency(calculateMonthlyPayment(mortgage))} / month
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {mortgage.rateType === 'Variable' ? 'Prime ' : ''}{mortgage.interestRate}%
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Secondary Details Section */}
                              <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                                {/* First row - Original details */}
                                <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                                  <span>Amortization: {mortgage.amortizationPeriodYears} Years</span>
                                  <span>Term: {mortgage.termYears} Years</span>
                                  <span>Starts: {new Date(mortgage.startDate).toLocaleDateString()}</span>
                                </div>
                                
                                {/* Second row - New details */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Renewal Date:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {calculateRenewalDate(mortgage) ? calculateRenewalDate(mortgage).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Remaining Loan:</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {formatCurrency(calculateRemainingBalance(mortgage))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Principal Paid:</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                      {formatCurrency(calculateTotalPrincipalPaid(mortgage))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Interest Paid:</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                      {formatCurrency(calculateTotalInterestPaid(mortgage))}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-2 mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMortgageForDashboard(mortgage);
                                    setShowForm(true);
                                  }}
                                  className="px-3 py-1 text-sm bg-[#205A3E] text-white rounded hover:bg-[#1a4a32] transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMortgageExpansion(mortgage.id);
                                  }}
                                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Hide Schedule
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      Show Schedule
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadSchedule(mortgage.id);
                                  }}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </button>
                              </div>
                            </div>

                            {/* Expanded Amortization Schedule */}
                            {isExpanded && mortgageSchedule && (
                              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                                <div className="mb-4">
                                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Amortization Schedule Preview
                                  </h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
                                      <p className="text-lg font-semibold text-red-600">
                                        {formatCurrency(mortgageSchedule ? mortgageSchedule.reduce((sum, payment) => sum + payment.interest, 0) : 0)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(mortgageSchedule ? mortgageSchedule.reduce((sum, payment) => sum + payment.monthlyPayment, 0) : 0)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Payments Remaining</p>
                                      <p className="text-lg font-semibold text-blue-600">
                                        {mortgageSchedule ? mortgageSchedule.length : 0}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Payoff Date</p>
                                      <p className="text-lg font-semibold text-green-600">
                                        {mortgageSchedule && mortgageSchedule.length > 0 ? new Date(mortgageSchedule[mortgageSchedule.length - 1]?.paymentDate).toLocaleDateString() : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Payment #</th>
                                        <th className="text-left py-2 text-gray-600 dark:text-gray-400">Date</th>
                                        <th className="text-right py-2 text-gray-600 dark:text-gray-400">Principal</th>
                                        <th className="text-right py-2 text-gray-600 dark:text-gray-400">Interest</th>
                                        <th className="text-right py-2 text-gray-600 dark:text-gray-400">Total</th>
                                        <th className="text-right py-2 text-gray-600 dark:text-gray-400">Balance</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {mortgageSchedule ? mortgageSchedule.slice(0, 12).map((payment, index) => (
                                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                                          <td className="py-2 text-gray-900 dark:text-white">{payment.paymentNumber}</td>
                                          <td className="py-2 text-gray-600 dark:text-gray-400">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                          </td>
                                          <td className="py-2 text-right text-gray-900 dark:text-white">
                                            {formatCurrency(payment.principal)}
                                          </td>
                                          <td className="py-2 text-right text-red-600">
                                            {formatCurrency(payment.interest)}
                                          </td>
                                          <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(payment.monthlyPayment)}
                                          </td>
                                          <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                                            {formatCurrency(payment.remainingBalance)}
                                          </td>
                                        </tr>
                                      )) : null}
                                    </tbody>
                                  </table>
                                </div>

                                {mortgageSchedule && mortgageSchedule.length > 12 && (
                                  <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      Showing first 12 of {mortgageSchedule.length} payments
                                    </p>
                                    <button
                                      onClick={() => handleDownloadSchedule(mortgage.id)}
                                      className="text-[#205A3E] hover:text-[#1a4a32] text-sm font-medium"
                                    >
                                      View Complete Schedule →
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      </div>
                    </div>
                  ))}
                  </div>
            )}

                  {/* Dashboard for Selected Mortgage */}
                  {selectedMortgageForDashboard && dashboardData && (
                    <div className="space-y-6">
                      {/* Top-Level Summary Bar */}
                      <div className="bg-gradient-to-r from-[#205A3E] to-[#2d7a5a] rounded-xl p-6 text-white">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <TrendingDown className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Current Balance</span>
                            </div>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.mortgage.currentBalance)}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                        <DollarSign className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Monthly Payment</span>
                            </div>
                      <p className="text-2xl font-bold">{formatCurrency(dashboardData.mortgage.monthlyPayment)}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Percent className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Interest Rate</span>
                            </div>
                      <p className="text-2xl font-bold">{dashboardData.mortgage.interestRate}%</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Calendar className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium opacity-90">Remaining Payments</span>
                            </div>
                      <p className="text-2xl font-bold">{dashboardData.remainingPayments}</p>
                          </div>
                        </div>
                      </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Breakdown */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Breakdown</h3>
                          <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
                        <span className="text-red-600 font-semibold">{formatCurrency(dashboardData.totalInterest)}</span>
                            </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
                        <span className="text-gray-900 dark:text-white font-semibold">{formatCurrency(dashboardData.totalCost)}</span>
                            </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Payoff Date</span>
                        <span className="text-green-600 font-semibold">
                          {new Date(dashboardData.payoffDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                  {/* Amortization Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Amortization Schedule</h3>
                    <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dashboardData.schedule.slice(0, 24)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="paymentNumber" />
                          <YAxis />
                                <Tooltip 
                                  formatter={(value, name) => [
                                    formatCurrency(value), 
                              name === 'principalPayment' ? 'Principal' : 'Interest'
                            ]}
                                />
                                <Area
                                  type="monotone"
                            dataKey="principalPayment" 
                                  stackId="1"
                                  stroke="#205A3E"
                            fill="#205A3E" 
                            fillOpacity={0.6}
                                />
                                <Area
                                  type="monotone"
                            dataKey="interestPayment" 
                                  stackId="1"
                            stroke="#ef4444" 
                            fill="#ef4444" 
                            fillOpacity={0.6}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

        {/* Modals */}
        {showForm && (
          <MortgageFormUpgraded
            mortgage={editingMortgage}
            onClose={() => {
              setShowForm(false);
              setEditingMortgage(null);
            }}
            onSave={(mortgageData) => {
              console.log('Saving mortgage:', mortgageData);
              setShowForm(false);
              setEditingMortgage(null);
            }}
          />
        )}

        {viewingMortgage && (
          <MortgageDetails
            mortgage={viewingMortgage}
            onClose={() => setViewingMortgage(null)}
            onEdit={(mortgage) => {
              setEditingMortgage(mortgage);
              setViewingMortgage(null);
              setShowForm(true);
            }}
          />
        )}

        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onUpload={(data) => {
              console.log('Bulk upload data:', data);
              setShowBulkUpload(false);
            }}
          />
        )}

        {showAmortization && selectedMortgage && (
          <AmortizationSchedule
            mortgage={selectedMortgage}
            onClose={() => {
              setShowAmortization(false);
              setSelectedMortgage(null);
            }}
          />
        )}
      </div>
      </Layout>
  );
}