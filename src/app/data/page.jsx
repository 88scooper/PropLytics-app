"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/context/ToastContext";
import { useProperties, useProperty } from "@/context/PropertyContext";
import { Download, Upload, X } from "lucide-react";
import * as XLSX from 'xlsx';

export default function DataPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const properties = useProperties(); // Get properties from context
  const [saving, setSaving] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ processed: 0, total: 0 });
  const [form, setForm] = useState({
    // Property Details
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    units: "",
    squareFootage: "",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    
    // Key Dates
    purchaseDate: "",
    closingDate: "",
    
    // Purchase & Initial Costs
    purchasePrice: "",
    downPayment: "",
    closingCosts: "",
    renovationCosts: "",
    otherCosts: "",
    
    // Current Mortgage Details
    lender: "",
    loanAmount: "",
    interestRate: "",
    loanTerm: "",
    monthlyPayment: "",
    remainingBalance: "",
    nextPaymentDate: "",
    
    // Income & Expenses
    monthlyRent: "",
    propertyTax: "",
    insurance: "",
    utilities: "",
    maintenance: "",
    propertyManagement: "",
    hoaFees: "",
    
    // Current Value
    currentValue: "",
    lastAppraisalDate: "",
  });
  const [versions, setVersions] = useState([]);

  // Fetch user's properties from Firestore
  // Properties are now available from PropertyContext

  function fetchPropertyDetails(propertyId) {
    try {
      // Find property from context data
      const realPropertyData = properties.find(p => p.id === propertyId);
      
      if (realPropertyData) {
        const formattedPropertyData = {
          name: realPropertyData.nickname || realPropertyData.name,
          address: realPropertyData.address,
          city: "Toronto", // Extract from address if needed
          state: "ON",
          zipCode: realPropertyData.address.split(' ').pop() || "",
          propertyType: realPropertyData.propertyType,
          units: "1",
          squareFootage: realPropertyData.size?.toString() || realPropertyData.squareFootage?.toString(),
          yearBuilt: realPropertyData.yearBuilt?.toString(),
          bedrooms: realPropertyData.bedrooms?.[0]?.toString() || "2",
          bathrooms: realPropertyData.bathrooms?.[0]?.toString() || "2",
          purchaseDate: realPropertyData.purchaseDate || realPropertyData.purchaseDate,
          closingDate: realPropertyData.purchaseDate,
          purchasePrice: realPropertyData.purchasePrice?.toString(),
          downPayment: (realPropertyData.purchasePrice - realPropertyData.mortgage.originalAmount)?.toString(),
          closingCosts: realPropertyData.closingCosts?.toString(),
          renovationCosts: realPropertyData.renovationCosts?.toString(),
          otherCosts: "0",
          lender: realPropertyData.mortgage.lender,
          loanAmount: realPropertyData.mortgage.originalAmount?.toString(),
          interestRate: (realPropertyData.mortgage.interestRate * 100)?.toString(),
          loanTerm: realPropertyData.mortgage.amortizationYears?.toString(),
          monthlyPayment: "0", // Would need to calculate
          remainingBalance: realPropertyData.mortgage.originalAmount?.toString(),
          nextPaymentDate: "2024-02-01",
          monthlyRent: realPropertyData.rent?.monthlyRent?.toString(),
          propertyTax: realPropertyData.monthlyPropertyTax?.toString(),
          insurance: realPropertyData.monthlyInsurance?.toString(),
          utilities: "0",
          maintenance: realPropertyData.monthlyMaintenance?.toString(),
          propertyManagement: "0",
          hoaFees: realPropertyData.monthlyCondoFees?.toString(),
          currentValue: realPropertyData.currentMarketValue?.toString() || realPropertyData.currentValue?.toString(),
          lastAppraisalDate: "2023-12-01"
        };
        setForm(formattedPropertyData);
        addToast("Property data loaded successfully!", { type: "success" });
      } else {
        addToast("Property not found.", { type: "error" });
      }
    } catch (error) {
      addToast("Failed to load property details.", { type: "error" });
    }
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const newVersion = {
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        data: form,
      };
      setVersions((prev) => [newVersion, ...prev]);
      addToast("Property data saved successfully!", { type: "success" });
    } catch (err) {
      addToast("Failed to save property data.", { type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (Object.values(form).some(value => value !== "")) {
      if (confirm("Are you sure you want to cancel? All unsaved changes will be lost.")) {
        setForm({
          name: "", address: "", city: "", state: "", zipCode: "", propertyType: "", units: "", squareFootage: "", yearBuilt: "", bedrooms: "", bathrooms: "",
          purchaseDate: "", closingDate: "",
          purchasePrice: "", downPayment: "", closingCosts: "", renovationCosts: "", otherCosts: "",
          lender: "", loanAmount: "", interestRate: "", loanTerm: "", monthlyPayment: "", remainingBalance: "", nextPaymentDate: "",
          monthlyRent: "", propertyTax: "", insurance: "", utilities: "", maintenance: "", propertyManagement: "", hoaFees: "",
          currentValue: "", lastAppraisalDate: "",
        });
        addToast("Form reset.", { type: "success" });
      }
    }
  }

  function onDelete() {
    if (confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      addToast("Property deleted.", { type: "success" });
      // Reset form after deletion
      setForm({
        name: "", address: "", city: "", state: "", zipCode: "", propertyType: "", units: "", squareFootage: "", yearBuilt: "", bedrooms: "", bathrooms: "",
        purchaseDate: "", closingDate: "",
        purchasePrice: "", downPayment: "", closingCosts: "", renovationCosts: "", otherCosts: "",
        lender: "", loanAmount: "", interestRate: "", loanTerm: "", monthlyPayment: "", remainingBalance: "", nextPaymentDate: "",
        monthlyRent: "", propertyTax: "", insurance: "", utilities: "", maintenance: "", propertyManagement: "", hoaFees: "",
        currentValue: "", lastAppraisalDate: "",
      });
    }
  }

  function restoreVersion(version) {
    setForm(version.data);
    addToast("Restored fields from version. Click Save to confirm.", { type: "success" });
  }

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
    
    // Refresh properties list
    await fetchUserProperties();
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Property Data</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Add or edit comprehensive property information and financial details.
            </p>
          </div>

          {/* Property Selector and Excel Workflow */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex-1">
              <label htmlFor="propertySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Property
              </label>
              <select
                id="propertySelect"
                value={selectedProperty}
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  if (e.target.value) {
                    fetchPropertyDetails(e.target.value);
                  } else {
                    // Reset form when "Add New Property" is selected
                    setForm({
                      name: "", address: "", city: "", state: "", zipCode: "", propertyType: "", units: "", squareFootage: "", yearBuilt: "", bedrooms: "", bathrooms: "",
                      purchaseDate: "", closingDate: "",
                      purchasePrice: "", downPayment: "", closingCosts: "", renovationCosts: "", otherCosts: "",
                      lender: "", loanAmount: "", interestRate: "", loanTerm: "", monthlyPayment: "", remainingBalance: "", nextPaymentDate: "",
                      monthlyRent: "", propertyTax: "", insurance: "", utilities: "", maintenance: "", propertyManagement: "", hoaFees: "",
                      currentValue: "", lastAppraisalDate: "",
                    });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
              >
                <option value="">Add New Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} - {property.address}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                type="button"
                onClick={() => setIsExcelModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import / Export via Excel
              </Button>
            </div>
          </div>

          <form onSubmit={onSave} className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="space-y-8">
              {/* Property Details Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Property Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Property Name"
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g., Maple Street Duplex"
                  />
                  <Input
                    label="Property Type"
                    id="propertyType"
                    value={form.propertyType}
                    onChange={(e) => updateField("propertyType", e.target.value)}
                    placeholder="e.g., Duplex, Single Family"
                  />
                  <Input
                    label="Street Address"
                    id="address"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                  <Input
                    label="City"
                    id="city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Toronto"
                  />
                  <Input
                    label="State/Province"
                    id="state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="ON"
                  />
                  <Input
                    label="ZIP/Postal Code"
                    id="zipCode"
                    value={form.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    placeholder="M5V 2H1"
                  />
                  <Input
                    label="Number of Units"
                    id="units"
                    type="number"
                    value={form.units}
                    onChange={(e) => updateField("units", e.target.value)}
                    placeholder="1"
                  />
                  <Input
                    label="Square Footage"
                    id="squareFootage"
                    type="number"
                    value={form.squareFootage}
                    onChange={(e) => updateField("squareFootage", e.target.value)}
                    placeholder="2400"
                  />
                  <Input
                    label="Year Built"
                    id="yearBuilt"
                    type="number"
                    value={form.yearBuilt}
                    onChange={(e) => updateField("yearBuilt", e.target.value)}
                    placeholder="1985"
                  />
                  <Input
                    label="Bedrooms"
                    id="bedrooms"
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => updateField("bedrooms", e.target.value)}
                    placeholder="3"
                  />
                  <Input
                    label="Bathrooms"
                    id="bathrooms"
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => updateField("bathrooms", e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>

              {/* Key Dates Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Key Dates</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Purchase Date"
                    id="purchaseDate"
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => updateField("purchaseDate", e.target.value)}
                  />
                  <Input
                    label="Closing Date"
                    id="closingDate"
                    type="date"
                    value={form.closingDate}
                    onChange={(e) => updateField("closingDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Purchase & Initial Costs Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Purchase & Initial Costs</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Purchase Price"
                    id="purchasePrice"
                    type="number"
                    value={form.purchasePrice}
                    onChange={(e) => updateField("purchasePrice", e.target.value)}
                    placeholder="850000"
                  />
                  <Input
                    label="Down Payment"
                    id="downPayment"
                    type="number"
                    value={form.downPayment}
                    onChange={(e) => updateField("downPayment", e.target.value)}
                    placeholder="170000"
                  />
                  <Input
                    label="Closing Costs"
                    id="closingCosts"
                    type="number"
                    value={form.closingCosts}
                    onChange={(e) => updateField("closingCosts", e.target.value)}
                    placeholder="25000"
                  />
                  <Input
                    label="Renovation Costs"
                    id="renovationCosts"
                    type="number"
                    value={form.renovationCosts}
                    onChange={(e) => updateField("renovationCosts", e.target.value)}
                    placeholder="45000"
                  />
                  <Input
                    label="Other Costs"
                    id="otherCosts"
                    type="number"
                    value={form.otherCosts}
                    onChange={(e) => updateField("otherCosts", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Current Mortgage Details Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Current Mortgage Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Lender"
                    id="lender"
                    value={form.lender}
                    onChange={(e) => updateField("lender", e.target.value)}
                    placeholder="TD Bank"
                  />
                  <Input
                    label="Loan Amount"
                    id="loanAmount"
                    type="number"
                    value={form.loanAmount}
                    onChange={(e) => updateField("loanAmount", e.target.value)}
                    placeholder="680000"
                  />
                  <Input
                    label="Interest Rate (%)"
                    id="interestRate"
                    type="number"
                    step="0.01"
                    value={form.interestRate}
                    onChange={(e) => updateField("interestRate", e.target.value)}
                    placeholder="4.25"
                  />
                  <Input
                    label="Loan Term (years)"
                    id="loanTerm"
                    type="number"
                    value={form.loanTerm}
                    onChange={(e) => updateField("loanTerm", e.target.value)}
                    placeholder="25"
                  />
                  <Input
                    label="Monthly Payment"
                    id="monthlyPayment"
                    type="number"
                    value={form.monthlyPayment}
                    onChange={(e) => updateField("monthlyPayment", e.target.value)}
                    placeholder="3200"
                  />
                  <Input
                    label="Remaining Balance"
                    id="remainingBalance"
                    type="number"
                    value={form.remainingBalance}
                    onChange={(e) => updateField("remainingBalance", e.target.value)}
                    placeholder="665000"
                  />
                  <Input
                    label="Next Payment Date"
                    id="nextPaymentDate"
                    type="date"
                    value={form.nextPaymentDate}
                    onChange={(e) => updateField("nextPaymentDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Income & Expenses Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Income & Expenses</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Monthly Rent"
                    id="monthlyRent"
                    type="number"
                    value={form.monthlyRent}
                    onChange={(e) => updateField("monthlyRent", e.target.value)}
                    placeholder="4200"
                  />
                  <Input
                    label="Property Tax (monthly)"
                    id="propertyTax"
                    type="number"
                    value={form.propertyTax}
                    onChange={(e) => updateField("propertyTax", e.target.value)}
                    placeholder="450"
                  />
                  <Input
                    label="Insurance (monthly)"
                    id="insurance"
                    type="number"
                    value={form.insurance}
                    onChange={(e) => updateField("insurance", e.target.value)}
                    placeholder="180"
                  />
                  <Input
                    label="Utilities (monthly)"
                    id="utilities"
                    type="number"
                    value={form.utilities}
                    onChange={(e) => updateField("utilities", e.target.value)}
                    placeholder="120"
                  />
                  <Input
                    label="Maintenance (monthly)"
                    id="maintenance"
                    type="number"
                    value={form.maintenance}
                    onChange={(e) => updateField("maintenance", e.target.value)}
                    placeholder="150"
                  />
                  <Input
                    label="Property Management (monthly)"
                    id="propertyManagement"
                    type="number"
                    value={form.propertyManagement}
                    onChange={(e) => updateField("propertyManagement", e.target.value)}
                    placeholder="210"
                  />
                  <Input
                    label="HOA Fees (monthly)"
                    id="hoaFees"
                    type="number"
                    value={form.hoaFees}
                    onChange={(e) => updateField("hoaFees", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Current Value Section */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-6">Current Value</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Current Market Value"
                    id="currentValue"
                    type="number"
                    value={form.currentValue}
                    onChange={(e) => updateField("currentValue", e.target.value)}
                    placeholder="920000"
                  />
                  <Input
                    label="Last Appraisal Date"
                    id="lastAppraisalDate"
                    type="date"
                    value={form.lastAppraisalDate}
                    onChange={(e) => updateField("lastAppraisalDate", e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button type="submit" loading={saving}>
                  Save Property
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="button" variant="secondary" onClick={onDelete} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10">
                  Delete Property
                </Button>
              </div>
            </div>

            {/* Version History Sidebar */}
            <aside className="rounded-lg border border-black/10 dark:border-white/10 p-4">
              <h2 className="font-semibold mb-4">Version History</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Restoring only updates the form. Click Save to confirm and create a new version.
              </p>
              <ul className="space-y-3 text-sm">
                {versions.length === 0 && (
                  <li className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No versions yet.
                  </li>
                )}
                {versions.map((v) => (
                  <li key={v.id} className="rounded-md border border-black/10 dark:border-white/10 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium">{new Date(v.createdAt).toLocaleString()}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                          {v.data.name || "Untitled"} • ${v.data.monthlyRent || 0}/mo rent
                        </div>
                      </div>
                      <Button type="button" variant="secondary" onClick={() => restoreVersion(v)}>
                        Restore
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>
          </form>

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


