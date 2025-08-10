"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToast } from "@/context/ToastContext";

export default function DataPage() {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
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
        </div>
      </Layout>
    </RequireAuth>
  );
}


