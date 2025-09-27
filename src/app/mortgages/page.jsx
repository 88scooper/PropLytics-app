"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useMortgages } from "@/hooks/useMortgages";
import { useState, useMemo } from "react";
import { Plus, Filter, MoreVertical, Edit, Trash2, Eye, Upload, Calculator, TrendingDown, DollarSign, Percent, Calendar, Building2, Clock, Banknote } from "lucide-react";
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
  const [showForm, setShowForm] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [viewingMortgage, setViewingMortgage] = useState(null);
  const [filterProperty, setFilterProperty] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);
  const [selectedMortgage, setSelectedMortgage] = useState(null);
  const [selectedMortgageForDashboard, setSelectedMortgageForDashboard] = useState(null);

  // Get unique property IDs for filter
  const propertyIds = [...new Set(mortgages.map(m => m.propertyId).filter(Boolean))];

  // Filter mortgages based on property filter
  const filteredMortgages = mortgages.filter(mortgage => {
    const matchesProperty = !filterProperty || mortgage.propertyId === filterProperty;
    return matchesProperty;
  });

  // Group mortgages by property
  const mortgagesByProperty = filteredMortgages.reduce((acc, mortgage) => {
    const propertyId = mortgage.propertyId;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        property: properties.find(p => p.id === propertyId),
        mortgages: []
      };
    }
    acc[propertyId].mortgages.push(mortgage);
    return acc;
  }, {});

  // Calculate dashboard data for selected mortgage
  const dashboardData = useMemo(() => {
    if (!selectedMortgageForDashboard) return null;
    
    try {
      const schedule = calculateAmortizationSchedule(selectedMortgageForDashboard.mortgage);
      const currentPayment = schedule.payments[0];
      const totalPayments = schedule.payments.length;
      const paymentsRemaining = totalPayments;
      
      // Create chart data for amortization visualization
      const chartData = schedule.payments.map((payment, index) => ({
        year: Math.floor(index / 12) + 1,
        month: index + 1,
        balance: payment.remainingBalance,
        principalPaid: payment.principal,
        interestPaid: payment.interest,
        cumulativePrincipal: schedule.payments.slice(0, index + 1).reduce((sum, p) => sum + p.principal, 0),
        cumulativeInterest: schedule.payments.slice(0, index + 1).reduce((sum, p) => sum + p.interest, 0)
      }));

      return {
        currentBalance: currentPayment.remainingBalance,
        monthlyPayment: currentPayment.monthlyPayment,
        interestRate: selectedMortgageForDashboard.interestRate,
        paymentsRemaining,
        schedule,
        chartData
      };
    } catch (error) {
      console.error("Error calculating dashboard data:", error);
      return null;
    }
  }, [selectedMortgageForDashboard]);

  const handleEdit = (mortgage) => {
    setEditingMortgage(mortgage);
    setShowForm(true);
  };

  const handleSelectForDashboard = (mortgage) => {
    setSelectedMortgageForDashboard(mortgage);
  };

  const handleView = (mortgage) => {
    setViewingMortgage(mortgage);
  };

  const handleViewAmortization = (mortgage) => {
    setSelectedMortgage(mortgage);
    setShowAmortization(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMortgage(null);
  };

  const handleCloseDetails = () => {
    setViewingMortgage(null);
  };

  const handleBulkUploadSuccess = () => {
    // Refresh the mortgages list or trigger a re-fetch
    // This would typically involve calling a refresh function from the context
    window.location.reload(); // Simple refresh for now
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString();
  };

  if (viewingMortgage) {
    return (
      <RequireAuth>
        <Layout>
          <MortgageDetails 
            mortgage={viewingMortgage} 
            onClose={handleCloseDetails}
          />
        </Layout>
      </RequireAuth>
    );
  }

  if (showForm) {
    return (
      <RequireAuth>
        <Layout>
          <MortgageFormUpgraded 
            mortgage={editingMortgage}
            onClose={handleCloseForm}
          />
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mortgages</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Manage your mortgage loans and track payment schedules.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#205A3E] text-[#205A3E] rounded-lg hover:bg-[#205A3E] hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import from File
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

          {/* Filter */}
          <div className="flex justify-end">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent appearance-none"
              >
                <option value="">All Properties</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.nickname || property.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#205A3E]"></div>
            </div>
          )}

          {/* Dashboard Content */}
          {!loading && (
            <div className="space-y-6">
              {filteredMortgages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No mortgages found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {filterProperty 
                      ? "Try adjusting your filter criteria."
                      : "Get started by adding your first mortgage."
                    }
                  </p>
                  {!filterProperty && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Your First Mortgage
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Mortgage Selection */}
                  <div className="space-y-6">
                    {Object.entries(mortgagesByProperty).map(([propertyId, { property, mortgages: propertyMortgages }]) => (
                      <div key={propertyId} className="space-y-4">
                        {/* Property Header */}
                        <div className="bg-gradient-to-r from-[#205A3E] to-[#2d7a5a] rounded-lg p-4 text-white">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{property?.nickname || 'Unknown Property'}</h3>
                              <p className="text-[#205A3E]/80 text-sm">{property?.address || 'No address available'}</p>
                              <p className="text-[#205A3E]/80 text-xs mt-1">
                                {propertyMortgages.length} mortgage{propertyMortgages.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#205A3E]/80">Property Value</p>
                              <p className="text-lg font-semibold">{formatCurrency(property?.currentValue || 0)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Mortgages for this Property */}
                        <div className="grid gap-4">
                          {propertyMortgages.map((mortgage) => (
                            <div
                              key={mortgage.id}
                              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 md:p-6 hover:shadow-md transition-all cursor-pointer ${
                                selectedMortgageForDashboard?.id === mortgage.id 
                                  ? 'border-[#205A3E] shadow-lg' 
                                  : 'border-gray-200 dark:border-gray-700 hover:border-[#205A3E]/50'
                              }`}
                              onClick={() => handleSelectForDashboard(mortgage)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {mortgage.lenderName || 'Unnamed Mortgage'}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      mortgage.rateType === 'FIXED' 
                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                        : 'bg-[#205A3E]/10 text-[#205A3E] dark:bg-[#205A3E]/20 dark:text-[#205A3E]'
                                    }`}>
                                      {mortgage.rateType || 'FIXED'}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600 dark:text-gray-400">Original Amount</p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(mortgage.originalAmount || 0)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 dark:text-gray-400">Interest Rate</p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {formatPercentage(mortgage.interestRate / 100)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 dark:text-gray-400">Term</p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {mortgage.termYears || 0} years
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600 dark:text-gray-400">Start Date</p>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {new Date(mortgage.startDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleView(mortgage);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewAmortization(mortgage);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="View Amortization Schedule"
                                  >
                                    <Calculator className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(mortgage);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    title="Edit Mortgage"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

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
                            <p className="text-2xl font-bold">{formatCurrency(dashboardData.currentBalance)}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Banknote className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Monthly Payment</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(dashboardData.monthlyPayment)}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Percent className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Interest Rate</span>
                            </div>
                            <p className="text-2xl font-bold">{formatPercentage(dashboardData.interestRate / 100)}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Calendar className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium opacity-90">Payments Remaining</span>
                            </div>
                            <p className="text-2xl font-bold">{dashboardData.paymentsRemaining}</p>
                          </div>
                        </div>
                      </div>

                      {/* Main Dashboard - Two Column Layout */}
                      <div className="grid lg:grid-cols-2 gap-6">
                        {/* Left Column: Loan Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-[#205A3E]" />
                            Loan Details
                          </h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Original Amount</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(selectedMortgageForDashboard.originalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Amortization Period</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedMortgageForDashboard.amortizationPeriodYears} years
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Term Length</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedMortgageForDashboard.termYears} years
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Interest Type</span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                selectedMortgageForDashboard.rateType === 'FIXED' 
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-[#205A3E]/10 text-[#205A3E] dark:bg-[#205A3E]/20 dark:text-[#205A3E]'
                              }`}>
                                {selectedMortgageForDashboard.rateType || 'FIXED'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                              <span className="text-gray-600 dark:text-gray-400">Lender</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {selectedMortgageForDashboard.lenderName}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {new Date(selectedMortgageForDashboard.startDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Interactive Amortization Chart */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                            <TrendingDown className="w-5 h-5 mr-2 text-[#205A3E]" />
                            Amortization Visualization
                          </h3>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={dashboardData.chartData}>
                                <defs>
                                  <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#205A3E" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#205A3E" stopOpacity={0.1}/>
                                  </linearGradient>
                                  <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis 
                                  dataKey="year" 
                                  stroke="#6B7280"
                                  fontSize={12}
                                />
                                <YAxis 
                                  stroke="#6B7280"
                                  fontSize={12}
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                  formatter={(value, name) => [
                                    formatCurrency(value), 
                                    name === 'cumulativePrincipal' ? 'Principal Paid' : 
                                    name === 'cumulativeInterest' ? 'Interest Paid' : 'Balance'
                                  ]}
                                  labelFormatter={(label) => `Year ${label}`}
                                  contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="cumulativePrincipal"
                                  stackId="1"
                                  stroke="#205A3E"
                                  fill="url(#principalGradient)"
                                  name="Principal Paid"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="cumulativeInterest"
                                  stackId="1"
                                  stroke="#3B82F6"
                                  fill="url(#interestGradient)"
                                  name="Interest Paid"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="balance"
                                  stroke="#EF4444"
                                  strokeWidth={3}
                                  dot={false}
                                  name="Remaining Balance"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Full Amortization Table */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <Calculator className="w-5 h-5 mr-2 text-[#205A3E]" />
                            Full Amortization Schedule
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Complete payment-by-payment breakdown for detailed analysis
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Payment #</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Date</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Payment</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Principal</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Interest</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">Balance</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                              {dashboardData.schedule.payments.slice(0, 12).map((payment) => (
                                <tr key={payment.paymentNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-4 py-3 text-gray-900 dark:text-white">{payment.paymentNumber}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                                    {formatCurrency(payment.monthlyPayment)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                                    {formatCurrency(payment.principal)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                                    {formatCurrency(payment.interest)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                                    {formatCurrency(payment.remainingBalance)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {dashboardData.schedule.payments.length > 12 && (
                            <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => handleViewAmortization(selectedMortgageForDashboard)}
                                className="text-[#205A3E] hover:text-[#1a4a32] font-medium"
                              >
                                View Complete Schedule ({dashboardData.schedule.payments.length} payments)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onSuccess={handleBulkUploadSuccess}
          />
        )}

        {/* Amortization Schedule Modal */}
        {showAmortization && selectedMortgage && (
          <AmortizationSchedule
            mortgage={selectedMortgage.mortgage}
            propertyName={selectedMortgage.propertyName || 'Unknown Property'}
            onClose={() => {
              setShowAmortization(false);
              setSelectedMortgage(null);
            }}
          />
        )}
      </Layout>
    </RequireAuth>
  );
}
