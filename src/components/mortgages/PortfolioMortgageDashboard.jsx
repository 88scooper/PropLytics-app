"use client";

import { useMortgages } from "@/hooks/useMortgages";
import { usePropertyData } from "@/context/PropertyDataContext";
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  PieChart,
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function PortfolioMortgageDashboard({ className = "" }) {
  const { data: allMortgages, isLoading, error } = useMortgages();
  const propertyData = usePropertyData();
  
  // Create a properties array from the single property data
  // In a real app, this would come from a proper properties context
  const properties = propertyData ? [{
    id: propertyData.id,
    address: propertyData.address,
    name: propertyData.address
  }] : [];

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Failed to load mortgage data</span>
        </div>
      </div>
    );
  }

  if (!allMortgages || allMortgages.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mortgages Found</h3>
          <p className="text-gray-600">Add mortgage information to see your portfolio summary.</p>
        </div>
      </div>
    );
  }

  // Calculate portfolio metrics
  const totalOriginalAmount = allMortgages.reduce((sum, mortgage) => sum + mortgage.originalAmount, 0);
  const totalOutstanding = allMortgages.reduce((sum, mortgage) => {
    // Estimate outstanding balance (in a real app, you'd calculate this properly)
    const yearsElapsed = (new Date() - new Date(mortgage.startDate)) / (1000 * 60 * 60 * 24 * 365);
    const totalPayments = yearsElapsed * getPaymentsPerYear(mortgage.paymentFrequency);
    const estimatedOutstanding = Math.max(0, mortgage.originalAmount - (totalPayments * 1000));
    return sum + estimatedOutstanding;
  }, 0);

  const averageRate = allMortgages.reduce((sum, mortgage) => sum + mortgage.interestRate, 0) / allMortgages.length;
  const totalMonthlyPayments = allMortgages.reduce((sum, mortgage) => {
    const monthlyPayment = calculateMonthlyPayment(mortgage);
    return sum + monthlyPayment;
  }, 0);

  const propertiesWithMortgages = (properties || []).filter(property => 
    allMortgages.some(mortgage => mortgage.propertyId === property.id)
  );

  const rateTypeDistribution = allMortgages.reduce((acc, mortgage) => {
    acc[mortgage.rateType] = (acc[mortgage.rateType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Mortgage Portfolio</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-xs text-blue-700">
            of {formatCurrency(totalOriginalAmount)} original
          </p>
        </div>

        <div className="bg-[#205A3E]/10 border border-[#205A3E]/20 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#205A3E]" />
            <span className="text-sm font-medium text-[#205A3E]">Average Rate</span>
          </div>
          <p className="text-2xl font-bold text-[#205A3E]">
            {(averageRate * 100).toFixed(2)}%
          </p>
          <p className="text-xs text-[#205A3E]/70">
            {allMortgages.length} mortgage{allMortgages.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Monthly Payments</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {formatCurrency(totalMonthlyPayments)}
          </p>
          <p className="text-xs text-purple-700">
            Total monthly obligation
          </p>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate Type Distribution */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Rate Types</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(rateTypeDistribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {type === 'FIXED' ? 'Fixed Rate' : 'Variable Rate'}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                              className={`h-2 rounded-full ${
                                type === 'FIXED' ? 'bg-blue-500' : 'bg-[#205A3E]'
                              }`}
                      style={{ width: `${(count / allMortgages.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Properties with Mortgages */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Properties with Mortgages</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Properties with mortgages</span>
              <span className="text-sm font-medium text-gray-900">
                {propertiesWithMortgages.length} of {properties?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total mortgages</span>
              <span className="text-sm font-medium text-gray-900">
                {allMortgages.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg per property</span>
              <span className="text-sm font-medium text-gray-900">
                {propertiesWithMortgages.length > 0 
                  ? (allMortgages.length / propertiesWithMortgages.length).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Mortgages */}
      <div className="mt-6">
        <h3 className="font-medium text-gray-900 mb-3">Recent Mortgages</h3>
        <div className="space-y-2">
          {allMortgages.slice(0, 3).map((mortgage) => {
            const property = (properties || []).find(p => p.id === mortgage.propertyId);
            return (
              <div key={mortgage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{mortgage.lenderName}</p>
                  <p className="text-sm text-gray-600">
                    {property ? property.address : 'No property linked'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(mortgage.originalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(mortgage.interestRate * 100).toFixed(2)}% {mortgage.rateType}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to get payments per year based on frequency
function getPaymentsPerYear(frequency) {
  switch (frequency) {
    case 'MONTHLY':
      return 12;
    case 'BIWEEKLY':
      return 26;
    case 'WEEKLY':
      return 52;
    default:
      return 12;
  }
}

// Helper function to calculate monthly payment (simplified)
function calculateMonthlyPayment(mortgage) {
  // This is a simplified calculation - in a real app you'd use the proper formula
  const monthlyRate = mortgage.interestRate / 12;
  const totalPayments = mortgage.amortizationPeriodYears * 12;
  
  if (monthlyRate === 0) {
    return mortgage.originalAmount / totalPayments;
  }
  
  const monthlyPayment = mortgage.originalAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
  
  // Convert to monthly equivalent if needed
  switch (mortgage.paymentFrequency) {
    case 'MONTHLY':
      return monthlyPayment;
    case 'BIWEEKLY':
      return monthlyPayment * 26 / 12;
    case 'WEEKLY':
      return monthlyPayment * 52 / 12;
    default:
      return monthlyPayment;
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
