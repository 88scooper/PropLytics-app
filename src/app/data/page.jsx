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

// PropertyCard component with collapsible sections
function PropertyCard({ property, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
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

  const DataRow = ({ label, value, editable = false, field = "", type = "text" }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      {isEditing && editable ? (
        <input
          type={type}
          value={editedData[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
        />
      ) : (
        <span className="text-sm text-gray-900 dark:text-gray-100">{value || "N/A"}</span>
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
          <DataRow label="Property Name" value={property.name || property.nickname} editable field="name" />
          <DataRow label="Address" value={property.address} editable field="address" />
          <DataRow label="Property Type" value={property.propertyType || property.type} editable field="propertyType" />
          <DataRow label="Year Built" value={property.yearBuilt} editable field="yearBuilt" type="number" />
          <DataRow label="Square Footage" value={property.size || property.squareFootage} editable field="size" type="number" />
          <DataRow label="Bedrooms" value={property.bedrooms?.[0] || property.bedrooms} editable field="bedrooms" type="number" />
          <DataRow label="Bathrooms" value={property.bathrooms?.[0] || property.bathrooms} editable field="bathrooms" type="number" />
          <DataRow label="Unit Config" value={property.unitConfig} />
        </div>
      </Section>

      <Section title="Purchase Information" sectionKey="purchaseInfo">
        <div className="space-y-1">
          <DataRow label="Purchase Date" value={property.purchaseDate} editable field="purchaseDate" type="date" />
          <DataRow 
            label="Purchase Price" 
            value={`$${(property.purchasePrice || 0).toLocaleString()}`} 
            editable 
            field="purchasePrice" 
            type="number" 
          />
          <DataRow 
            label="Closing Costs" 
            value={`$${(property.closingCosts || 0).toLocaleString()}`} 
            editable 
            field="closingCosts" 
            type="number" 
          />
          <DataRow 
            label="Renovation Costs" 
            value={`$${(property.renovationCosts || 0).toLocaleString()}`} 
            editable 
            field="renovationCosts" 
            type="number" 
          />
          <DataRow 
            label="Total Investment" 
            value={`$${(property.totalInvestment || 0).toLocaleString()}`} 
          />
          <DataRow 
            label="Current Market Value" 
            value={`$${(property.currentMarketValue || property.currentValue || 0).toLocaleString()}`} 
            editable 
            field="currentMarketValue" 
            type="number" 
          />
          <DataRow 
            label="Appreciation" 
            value={`$${(property.appreciation || 0).toLocaleString()}`} 
          />
        </div>
      </Section>

      <Section title="Mortgage Details" sectionKey="mortgageDetails">
        <div className="space-y-1">
          <DataRow label="Lender" value={property.mortgage?.lender} editable field="lender" />
          <DataRow 
            label="Original Amount" 
            value={`$${(property.mortgage?.originalAmount || 0).toLocaleString()}`} 
            editable 
            field="loanAmount" 
            type="number" 
          />
          <DataRow 
            label="Interest Rate" 
            value={`${((property.mortgage?.interestRate || 0) * 100).toFixed(2)}%`} 
            editable 
            field="interestRate" 
            type="number" 
          />
          <DataRow label="Rate Type" value={property.mortgage?.rateType} />
          <DataRow 
            label="Amortization (Years)" 
            value={property.mortgage?.amortizationYears?.toFixed(1)} 
            editable 
            field="loanTerm" 
            type="number" 
          />
          <DataRow label="Term (Months)" value={property.mortgage?.termMonths} />
          <DataRow label="Payment Frequency" value={property.mortgage?.paymentFrequency} />
          <DataRow label="Start Date" value={property.mortgage?.startDate} />
        </div>
      </Section>

      <Section title="Income & Expenses" sectionKey="incomeExpenses">
        <div className="space-y-1">
          <DataRow 
            label="Monthly Rent" 
            value={`$${(property.rent?.monthlyRent || 0).toLocaleString()}`} 
            editable 
            field="monthlyRent" 
            type="number" 
          />
          <DataRow 
            label="Annual Rent" 
            value={`$${(property.rent?.annualRent || 0).toLocaleString()}`} 
          />
          <DataRow 
            label="Property Tax (Monthly)" 
            value={`$${(property.monthlyPropertyTax || 0).toFixed(2)}`} 
          />
          <DataRow 
            label="Condo Fees (Monthly)" 
            value={`$${(property.monthlyCondoFees || 0).toFixed(2)}`} 
          />
          <DataRow 
            label="Insurance (Monthly)" 
            value={`$${(property.monthlyInsurance || 0).toFixed(2)}`} 
          />
          <DataRow 
            label="Maintenance (Monthly)" 
            value={`$${(property.monthlyMaintenance || 0).toFixed(2)}`} 
          />
          <DataRow 
            label="Professional Fees (Monthly)" 
            value={`$${(property.monthlyProfessionalFees || 0).toFixed(2)}`} 
          />
          <DataRow 
            label="Total Monthly Expenses" 
            value={`$${(property.monthlyExpenses?.total || 0).toFixed(2)}`} 
          />
        </div>
      </Section>

      <Section title="Performance Metrics" sectionKey="performanceMetrics">
        <div className="space-y-1">
          <DataRow 
            label="Monthly Cash Flow" 
            value={`$${(property.monthlyCashFlow || 0).toLocaleString()}`} 
          />
          <DataRow 
            label="Annual Cash Flow" 
            value={`$${(property.annualCashFlow || 0).toLocaleString()}`} 
          />
          <DataRow 
            label="Cap Rate" 
            value={`${(property.capRate || 0).toFixed(2)}%`} 
          />
          <DataRow 
            label="Cash on Cash Return" 
            value={`${(property.cashOnCashReturn || 0).toFixed(2)}%`} 
          />
          <DataRow 
            label="Net Operating Income" 
            value={`$${(property.netOperatingIncome || 0).toLocaleString()}`} 
          />
          <DataRow 
            label="Occupancy Rate" 
            value={`${property.occupancy || 0}%`} 
          />
        </div>
      </Section>

      <Section title="Tenant Information" sectionKey="tenantInfo">
        <div className="space-y-1">
          <DataRow label="Tenant Name" value={property.tenant?.name} />
          <DataRow label="Lease Start Date" value={property.tenant?.leaseStartDate} />
          <DataRow label="Lease End Date" value={property.tenant?.leaseEndDate} />
          <DataRow 
            label="Monthly Rent" 
            value={`$${(property.tenant?.rent || 0).toLocaleString()}`} 
          />
          <DataRow label="Status" value={property.tenant?.status} />
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


