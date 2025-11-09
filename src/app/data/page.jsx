"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/context/ToastContext";
import { useProperties, useProperty } from "@/context/PropertyContext";
import { Download, Upload, X, ChevronDown, ChevronUp, Edit2, Save, XCircle } from "lucide-react";
import * as XLSX from 'xlsx';

// Helper functions for historical data calculations
function getHistoricalIncome(property, year) {
  if (!property.tenants || property.tenants.length === 0) return 0;
  
  const targetYear = parseInt(year);
  const calendarYearStart = new Date(targetYear, 0, 1); // January 1st
  const calendarYearEnd = new Date(targetYear, 11, 31); // December 31st
  let totalIncome = 0;
  
  property.tenants.forEach(tenant => {
    const leaseStart = new Date(tenant.leaseStart);
    const leaseEnd = tenant.leaseEnd === 'Active' 
      ? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
      : new Date(tenant.leaseEnd);
    
    // Check if tenant was active during any part of the calendar year
    if (leaseStart <= calendarYearEnd && leaseEnd >= calendarYearStart) {
      // Calculate the overlap between tenant lease and the calendar year
      const overlapStart = new Date(Math.max(leaseStart.getTime(), calendarYearStart.getTime()));
      const overlapEnd = new Date(Math.min(leaseEnd.getTime(), calendarYearEnd.getTime()));
      
      if (overlapStart <= overlapEnd) {
        // Calculate days in overlap for precise calculation
        const daysInOverlap = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1);
        
        // Calculate days in the month for proration
        const overlapStartMonth = overlapStart.getMonth();
        const overlapEndMonth = overlapEnd.getMonth();
        
        let monthlyIncome = 0;
        
        // Handle same month
        if (overlapStartMonth === overlapEndMonth) {
          const daysInMonth = new Date(overlapStart.getFullYear(), overlapStart.getMonth() + 1, 0).getDate();
          const prorationFactor = daysInOverlap / daysInMonth;
          monthlyIncome = tenant.rent * prorationFactor;
        } else {
          // Handle multiple months
          for (let month = overlapStartMonth; month <= overlapEndMonth; month++) {
            const monthStart = new Date(overlapStart.getFullYear(), month, 1);
            const monthEnd = new Date(overlapStart.getFullYear(), month + 1, 0);
            
            const monthOverlapStart = new Date(Math.max(overlapStart.getTime(), monthStart.getTime()));
            const monthOverlapEnd = new Date(Math.min(overlapEnd.getTime(), monthEnd.getTime()));
            
            const daysInMonth = monthEnd.getDate();
            const daysInOverlap = Math.max(0, Math.ceil((monthOverlapEnd - monthOverlapStart) / (1000 * 60 * 60 * 24)) + 1);
            const prorationFactor = daysInOverlap / daysInMonth;
            
            monthlyIncome += tenant.rent * prorationFactor;
          }
        }
        
        totalIncome += monthlyIncome;
      }
    }
  });
  
  return totalIncome;
}

function getHistoricalExpenses(property, year) {
  if (!property.expenseHistory) return 0;
  
  const targetYear = parseInt(year);
  const yearExpenses = property.expenseHistory.filter(expense => {
    const expenseYear = new Date(expense.date).getFullYear();
    return expenseYear === targetYear;
  });
  
  return yearExpenses.reduce((total, expense) => total + expense.amount, 0);
}

function getAvailableYears(property) {
  const years = new Set();
  
  // Get years from expense history
  if (property.expenseHistory) {
    property.expenseHistory.forEach(expense => {
      const year = new Date(expense.date).getFullYear();
      years.add(year);
    });
  }
  
  // Get years from tenant history
  if (property.tenants) {
    property.tenants.forEach(tenant => {
      const leaseStartYear = new Date(tenant.leaseStart).getFullYear();
      const leaseEndYear = tenant.leaseEnd === 'Active' 
        ? new Date().getFullYear()
        : new Date(tenant.leaseEnd).getFullYear();
      
      for (let year = leaseStartYear; year <= leaseEndYear; year++) {
        years.add(year);
      }
    });
  }
  
  return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
}

// Shared DataRow component for displaying data rows
function DataRow({ label, value, isBold = false }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${isBold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value || "N/A"}</span>
    </div>
  );
}

// Historical Data Display Component
function HistoricalDataDisplay({ property, expenseView, selectedYear: externalSelectedYear, onYearChange }) {
  const availableYears = getAvailableYears(property);
  const [internalSelectedYear, setInternalSelectedYear] = useState(availableYears[0] || new Date().getFullYear());
  
  // Use external year if provided, otherwise use internal state
  const selectedYear = externalSelectedYear !== undefined ? externalSelectedYear : internalSelectedYear;
  const setSelectedYear = onYearChange || setInternalSelectedYear;

  if (availableYears.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <div className="text-sm">No historical data available</div>
      </div>
    );
  }

  const historicalIncome = getHistoricalIncome(property, selectedYear);
  const historicalExpenses = getHistoricalExpenses(property, selectedYear);
  const netIncome = historicalIncome - historicalExpenses;

  return (
    <div className="space-y-4">
      {/* Year Selector is now handled at the section level */}

      {/* Historical Income */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Income</div>
        <DataRow 
          label={expenseView === 'monthly' ? 'Monthly Rent' : 'Annual Rent'} 
          value={`$${expenseView === 'monthly' ? (historicalIncome / 12).toLocaleString() : historicalIncome.toLocaleString()}`} 
        />
        <DataRow 
          label={expenseView === 'monthly' ? 'Total Monthly Revenue' : 'Total Annual Revenue'} 
          value={`$${expenseView === 'monthly' ? (historicalIncome / 12).toLocaleString() : historicalIncome.toLocaleString()}`} 
          isBold={true}
        />
      </div>

      {/* Separator */}
      <div className="py-2"></div>

      {/* Historical Expenses */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expenses</div>
        {property.expenseHistory && property.expenseHistory.length > 0 ? (
          <>
            {Object.entries(
              property.expenseHistory
                .filter(expense => new Date(expense.date).getFullYear() === selectedYear)
                .reduce((acc, expense) => {
                  const category = expense.category;
                  if (!acc[category]) {
                    acc[category] = 0;
                  }
                  acc[category] += expense.amount;
                  return acc;
                }, {})
            ).map(([category, amount]) => (
              <DataRow 
                key={category}
                label={category} 
                value={`$${expenseView === 'monthly' ? (amount / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
            ))}
            <DataRow 
              label={expenseView === 'monthly' ? 'Total Monthly Expenses' : 'Total Annual Expenses'} 
              value={`$${expenseView === 'monthly' ? (historicalExpenses / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : historicalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              isBold={true}
            />
          </>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">No expense data for {selectedYear}</div>
        )}
      </div>

      {/* Net Income */}
      <div className="py-2 border-t border-gray-200 dark:border-gray-700">
        <DataRow 
          label={expenseView === 'monthly' ? 'Monthly Net Income' : 'Annual Net Income'} 
          value={`$${expenseView === 'monthly' ? (netIncome / 12).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          isBold={true}
        />
      </div>
    </div>
  );
}

// PropertyCard component with collapsible sections
function PropertyCard({ property, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [expenseView, setExpenseView] = useState('monthly');
  const [tenantView, setTenantView] = useState('current');
  const [historicalView, setHistoricalView] = useState('current');
  const availableYears = getAvailableYears(property);
  const [selectedYear, setSelectedYear] = useState(availableYears[0] || new Date().getFullYear());
  const { addToast } = useToast();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      name: property.name || property.nickname || "",
      address: property.address || "",
      propertyType: property.propertyType || "",
      yearBuilt: property.yearBuilt || "",
      size: property.size || property.squareFootage || "",
      bedrooms: property.bedrooms?.[0] || "",
      bathrooms: property.bathrooms?.[0] || "",
      purchaseDate: property.purchaseDate || "",
      purchasePrice: property.purchasePrice || "",
      closingCosts: property.closingCosts || "",
      renovationCosts: property.renovationCosts || "",
      currentMarketValue: property.currentMarketValue || property.currentValue || "",
      monthlyRent: property.rent?.monthlyRent || "",
      lender: property.mortgage?.lender || "",
      loanAmount: property.mortgage?.originalAmount || "",
      interestRate: (property.mortgage?.interestRate * 100) || "",
      loanTerm: property.mortgage?.amortizationYears || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSave = () => {
    // In a real app, this would save to the database
    addToast("Property updated successfully!", { type: "success" });
    setIsEditing(false);
    if (onUpdate) onUpdate(property.id, editedData);
  };

  const updateField = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const Section = ({ title, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        {isExpanded && (
          <div className="p-4 pt-0 bg-gray-50 dark:bg-gray-800/50">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Editable DataRow component for PropertyCard (with editing capabilities)
  const EditableDataRow = ({ label, value, editable = false, field = "", type = "text", isBold = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className={`text-sm font-medium text-gray-600 dark:text-gray-400 ${isBold ? 'font-bold' : ''}`}>{label}</span>
      {isEditing && editable ? (
        <input
          type={type}
          value={editedData[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
        />
      ) : (
        <span className={`text-sm text-gray-900 dark:text-gray-100 ${isBold ? 'font-bold' : ''}`}>{value || "N/A"}</span>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="p-6 bg-gradient-to-r from-[#205A3E] to-[#2a7050] text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{property.name || property.nickname}</h2>
            <p className="text-sm opacity-90 mt-1">{property.address}</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Cancel editing"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Edit property"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <Section title="Property Details" sectionKey="propertyDetails">
        <div className="space-y-1">
          <EditableDataRow label="Property Name" value={property.name || property.nickname} editable field="name" />
          <EditableDataRow label="Address" value={property.address} editable field="address" />
          <EditableDataRow label="Property Type" value={property.propertyType || property.type} editable field="propertyType" />
          <EditableDataRow label="Year Built" value={property.yearBuilt} editable field="yearBuilt" type="number" />
          <EditableDataRow label="Square Footage" value={property.size || property.squareFootage} editable field="size" type="number" />
          <EditableDataRow label="Bedrooms" value={property.bedrooms?.[0] || property.bedrooms} editable field="bedrooms" type="number" />
          <EditableDataRow label="Bathrooms" value={property.bathrooms?.[0] || property.bathrooms} editable field="bathrooms" type="number" />
          <EditableDataRow label="Unit Config" value={property.unitConfig} />
        </div>
      </Section>

      <Section title="Purchase Information" sectionKey="purchaseInfo">
        <div className="space-y-1">
          <EditableDataRow label="Purchase Date" value={property.purchaseDate} editable field="purchaseDate" type="date" />
          <EditableDataRow 
            label="Purchase Price" 
            value={`$${(property.purchasePrice || 0).toLocaleString()}`} 
            editable 
            field="purchasePrice" 
            type="number" 
          />
          <EditableDataRow 
            label="Original Mortgage" 
            value={`$${(property.mortgage?.originalAmount || 0).toLocaleString()}`} 
            editable 
            field="originalAmount" 
            type="number" 
          />
          <EditableDataRow 
            label="Down Payment" 
            value={`$${((property.purchasePrice || 0) - (property.mortgage?.originalAmount || 0)).toLocaleString()}`} 
          />
          <EditableDataRow 
            label="Closing Costs" 
            value={`$${(property.closingCosts || 0).toLocaleString()}`} 
            editable 
            field="closingCosts" 
            type="number" 
          />
          <EditableDataRow 
            label="Initial Renovations" 
            value={`$${(property.initialRenovations || 0).toLocaleString()}`} 
            editable 
            field="initialRenovations" 
            type="number" 
          />
          <EditableDataRow 
            label="Total Investment (Cash)" 
            value={`$${(((property.purchasePrice || 0) - (property.mortgage?.originalAmount || 0)) + (property.closingCosts || 0) + (property.initialRenovations || 0)).toLocaleString()}`} 
          />
          <EditableDataRow 
            label="Current Market Value" 
            value={`$${(property.currentMarketValue || property.currentValue || 0).toLocaleString()}`} 
            editable 
            field="currentMarketValue" 
            type="number" 
          />
          <EditableDataRow 
            label="Appreciation" 
            value={`$${(property.appreciation || 0).toLocaleString()}`} 
          />
        </div>
      </Section>

      <Section title="Mortgage Details" sectionKey="mortgageDetails">
        <div className="space-y-1">
          <EditableDataRow label="Lender" value={property.mortgage?.lender} editable field="lender" />
          <EditableDataRow 
            label="Original Amount" 
            value={`$${(property.mortgage?.originalAmount || 0).toLocaleString()}`} 
            editable 
            field="loanAmount" 
            type="number" 
          />
          <EditableDataRow 
            label="Interest Rate" 
            value={`${((property.mortgage?.interestRate || 0) * 100).toFixed(2)}%`} 
            editable 
            field="interestRate" 
            type="number" 
          />
          <EditableDataRow label="Rate Type" value={property.mortgage?.rateType} />
          <EditableDataRow 
            label="Amortization (Years)" 
            value={property.mortgage?.amortizationYears?.toFixed(1)} 
            editable 
            field="loanTerm" 
            type="number" 
          />
          <EditableDataRow label="Term (Months)" value={property.mortgage?.termMonths} />
          <EditableDataRow label="Payment Frequency" value={property.mortgage?.paymentFrequency} />
          <EditableDataRow label="Start Date" value={property.mortgage?.startDate} />
        </div>
      </Section>

      <Section title="Income & Expenses" sectionKey="incomeExpenses">
        <div className="space-y-1">
          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setExpenseView('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  expenseView === 'monthly'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setExpenseView('annual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  expenseView === 'annual'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Historical Data Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Data:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setHistoricalView('current')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  historicalView === 'current'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setHistoricalView('historical')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  historicalView === 'historical'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Historical
              </button>
            </div>
          </div>

          {/* Year Selector - shown when Historical view is selected */}
          {historicalView === 'historical' && availableYears.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {historicalView === 'current' ? (
            /* Current Data Display */
            <>
              {/* Income */}
              <EditableDataRow 
                label={expenseView === 'monthly' ? 'Monthly Rent' : 'Annual Rent'} 
                value={`$${expenseView === 'monthly' ? (property.rent?.monthlyRent || 0).toLocaleString() : (property.rent?.annualRent || 0).toLocaleString()}`} 
                editable 
                field={expenseView === 'monthly' ? 'monthlyRent' : 'annualRent'} 
                type="number" 
              />
              <EditableDataRow 
                label={expenseView === 'monthly' ? 'Total Monthly Revenue' : 'Total Annual Revenue'} 
                value={`$${expenseView === 'monthly' ? (property.rent?.monthlyRent || 0).toLocaleString() : (property.rent?.annualRent || 0).toLocaleString()}`} 
                isBold={true}
              />

              {/* Separator */}
              <div className="py-2"></div>

              {/* Expenses */}
              <EditableDataRow 
                label="Advertising" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.advertising || 0) : ((property.monthlyExpenses?.advertising || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Insurance" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.insurance || 0) : ((property.monthlyExpenses?.insurance || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Interest & Banking Charges" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.mortgageInterest || 0) : ((property.monthlyExpenses?.mortgageInterest || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Office Expenses" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.officeExpenses || 0) : ((property.monthlyExpenses?.officeExpenses || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Professional Fees" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.professionalFees || 0) : ((property.monthlyExpenses?.professionalFees || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Management & Administration" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.management || 0) : ((property.monthlyExpenses?.management || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Repairs & Maintenance" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.maintenance || 0) : ((property.monthlyExpenses?.maintenance || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Property Taxes" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.propertyTax || 0) : ((property.monthlyExpenses?.propertyTax || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Travel" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.travel || 0) : ((property.monthlyExpenses?.travel || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Utilities" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.utilities || 0) : ((property.monthlyExpenses?.utilities || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Motor Vehicle Expense" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.motorVehicle || 0) : ((property.monthlyExpenses?.motorVehicle || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Other Rental Expense (incl. Condo Fees & Broker Fees)" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.condoFees || 0) : ((property.monthlyExpenses?.condoFees || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label="Mortgage (Principal)" 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.mortgagePrincipal || 0) : ((property.monthlyExpenses?.mortgagePrincipal || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              />
              <EditableDataRow 
                label={expenseView === 'monthly' ? 'Total Monthly Expenses' : 'Total Annual Expenses'} 
                value={`$${(expenseView === 'monthly' ? (property.monthlyExpenses?.total || 0) : ((property.monthlyExpenses?.total || 0) * 12)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                isBold={true}
              />
            </>
          ) : (
            /* Historical Data Display */
            <HistoricalDataDisplay 
              property={property} 
              expenseView={expenseView}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          )}
        </div>
      </Section>

      <Section title="Tenant Information" sectionKey="tenantInfo">
        <div className="space-y-1">
          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setTenantView('current')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  tenantView === 'current'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => setTenantView('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  tenantView === 'all'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Tenant History
              </button>
            </div>
          </div>

          {tenantView === 'current' ? (
            /* Current Tenant */
            <>
              <EditableDataRow label="Tenant Name" value={property.tenant?.name || property.tenants?.find(t => t.status === 'Active')?.name || 'N/A'} />
              <EditableDataRow label="Unit" value={property.tenants?.find(t => t.status === 'Active')?.unit || 'N/A'} />
              <EditableDataRow label="Lease Start Date" value={property.tenant?.leaseStartDate || property.tenants?.find(t => t.status === 'Active')?.leaseStart || 'N/A'} />
              <EditableDataRow label="Lease End Date" value={property.tenant?.leaseEndDate || property.tenants?.find(t => t.status === 'Active')?.leaseEnd || 'N/A'} />
              <EditableDataRow 
                label="Monthly Rent" 
                value={`$${(property.tenant?.rent || property.tenants?.find(t => t.status === 'Active')?.rent || 0).toLocaleString()}`} 
              />
              <EditableDataRow label="Key Deposit" value="" />
              <EditableDataRow label="Status" value={property.tenant?.status || property.tenants?.find(t => t.status === 'Active')?.status || 'N/A'} />
            </>
          ) : (
            /* All Tenants */
            <div className="space-y-4">
              {property.tenants && property.tenants.length > 0 ? (
                property.tenants.map((tenant, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Tenant {index + 1}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tenant.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {tenant.status}
                        </span>
                      </div>
                      <EditableDataRow label="Name" value={tenant.name} />
                      <EditableDataRow label="Unit" value={tenant.unit} />
                      <EditableDataRow label="Lease Start" value={tenant.leaseStart} />
                      <EditableDataRow label="Lease End" value={tenant.leaseEnd} />
                      <EditableDataRow 
                        label="Monthly Rent" 
                        value={`$${(tenant.rent || 0).toLocaleString()}`} 
                      />
                      <EditableDataRow label="Key Deposit" value="" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <div className="text-sm">No tenant data available</div>
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      <Section title="Property Notes" sectionKey="propertyNotes">
        <div className="space-y-1">
          <EditableDataRow label="Appliance Details" value="" editable field="applianceDetails" type="text" />
          <EditableDataRow label="Paint Details" value="" editable field="paintDetails" type="text" />
          <EditableDataRow label="Flooring Details" value="" editable field="flooringDetails" type="text" />
          <EditableDataRow label="Kitchen Features" value="" editable field="kitchenFeatures" type="text" />
          <EditableDataRow label="Bathroom Features" value="" editable field="bathroomFeatures" type="text" />
          <EditableDataRow label="Special Features" value="" editable field="specialFeatures" type="text" />
          <EditableDataRow label="Maintenance Notes" value="" editable field="maintenanceNotes" type="text" />
          <EditableDataRow label="Upgrade History" value="" editable field="upgradeHistory" type="text" />
          <EditableDataRow label="General Notes" value="" editable field="generalNotes" type="text" />
        </div>
      </Section>
    </div>
  );
}

export default function DataPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const properties = useProperties(); // Get properties from context
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ processed: 0, total: 0 });

  const handlePropertyUpdate = (propertyId, updatedData) => {
    // In a real application, this would update the property in the database
    console.log("Updating property:", propertyId, updatedData);
  };

  // Excel Template Download
  function downloadTemplate() {
    const templateData = [
      {
        name: "Property Name",
        address: "Street Address",
        city: "City",
        state: "State/Province",
        zipCode: "ZIP/Postal Code",
        propertyType: "Property Type",
        units: "Number of Units",
        squareFootage: "Square Footage",
        yearBuilt: "Year Built",
        bedrooms: "Bedrooms",
        bathrooms: "Bathrooms",
        purchaseDate: "Purchase Date",
        closingDate: "Closing Date",
        purchasePrice: "Purchase Price",
        downPayment: "Down Payment",
        closingCosts: "Closing Costs",
        renovationCosts: "Renovation Costs",
        otherCosts: "Other Costs",
        lender: "Lender",
        loanAmount: "Loan Amount",
        interestRate: "Interest Rate (%)",
        loanTerm: "Loan Term (years)",
        monthlyPayment: "Monthly Payment",
        remainingBalance: "Remaining Balance",
        nextPaymentDate: "Next Payment Date",
        monthlyRent: "Monthly Rent",
        propertyTax: "Property Tax (monthly)",
        insurance: "Insurance (monthly)",
        utilities: "Utilities (monthly)",
        maintenance: "Maintenance (monthly)",
        propertyManagement: "Property Management (monthly)",
        hoaFees: "HOA Fees (monthly)",
        currentValue: "Current Market Value",
        lastAppraisalDate: "Last Appraisal Date"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Property Template");
    
    XLSX.writeFile(wb, "property_data_template.xlsx");
    addToast("Template downloaded successfully!", { type: "success" });
  }

  // Excel File Upload and Processing
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      addToast("Please upload an Excel file (.xlsx or .xls)", { type: "error" });
      return;
    }

    setUploading(true);
    setUploadProgress({ processed: 0, total: 0 });

    try {
      const data = await readExcelFile(file);
      await processExcelData(data);
    } catch (error) {
      addToast("Failed to process Excel file: " + error.message, { type: "error" });
    } finally {
      setUploading(false);
      setUploadProgress({ processed: 0, total: 0 });
      event.target.value = ''; // Reset file input
    }
  }

  function readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Remove header row and convert to objects
          const headers = jsonData[0];
          const rows = jsonData.slice(1);
          const properties = rows.map(row => {
            const property = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                property[header] = row[index];
              }
            });
            return property;
          });
          
          resolve(properties);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function processExcelData(properties) {
    setUploadProgress({ processed: 0, total: properties.length });
    
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      try {
        // Mock Firestore save - replace with actual implementation
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API call
        
        setUploadProgress({ processed: i + 1, total: properties.length });
      } catch (error) {
        addToast(`Failed to save property ${property.name || 'Unknown'}: ${error.message}`, { type: "error" });
      }
    }
    
    addToast(`Successfully processed ${properties.length} properties!`, { type: "success" });
    setIsExcelModalOpen(false);
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Property Data</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                View and manage comprehensive property information and financial details.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import / Export via Excel
            </Button>
          </div>

          {/* Property Cards Grid */}
          {properties && properties.length > 0 ? (
            <div className="space-y-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onUpdate={handlePropertyUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                No properties found. Import properties using Excel or add them manually.
              </p>
            </div>
          )}

          {/* Excel Workflow Modal */}
          {isExcelModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Import / Export via Excel
                  </h2>
                  <button
                    onClick={() => setIsExcelModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Step 1: Download Template */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Step 1: Download Template</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Download the Excel template with all required fields to ensure proper data formatting.
                    </p>
                    <Button
                      type="button"
                      onClick={downloadTemplate}
                      className="flex items-center gap-2 w-full"
                    >
                      <Download className="w-4 h-4" />
                      Download Template
                    </Button>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Step 2: Upload File</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Upload your completed Excel file to import property data.
                    </p>
                    
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-[#205A3E] file:text-white
                        hover:file:bg-[#1a4a33]
                        file:cursor-pointer
                        cursor-pointer"
                      disabled={uploading}
                    />

                    {uploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Processing...</span>
                          <span>{uploadProgress.processed} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-[#205A3E] h-2 rounded-full transition-all duration-300"
                            style={{
                              width: uploadProgress.total > 0 
                                ? `${(uploadProgress.processed / uploadProgress.total) * 100}%` 
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>• Supported formats: .xlsx, .xls</p>
                    <p>• Maximum file size: 10MB</p>
                    <p>• First row should contain column headers</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}


