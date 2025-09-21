"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useMortgages } from "@/context/MortgageContext";
import { useState } from "react";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Upload } from "lucide-react";
import MortgageFormUpgraded from "@/components/mortgages/MortgageFormUpgraded";
import MortgageDetails from "@/components/mortgages/MortgageDetails";
import BulkUploadModal from "@/components/mortgages/BulkUploadModal";

export default function MortgagesPage() {
  const { mortgages, loading, error } = useMortgages();
  const [showForm, setShowForm] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState(null);
  const [viewingMortgage, setViewingMortgage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProperty, setFilterProperty] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Get unique properties for filter
  const properties = [...new Set(mortgages.map(m => m.propertyId).filter(Boolean))];

  // Filter mortgages based on search and property filter
  const filteredMortgages = mortgages.filter(mortgage => {
    const matchesSearch = mortgage.lenderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mortgage.propertyId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty = !filterProperty || mortgage.propertyId === filterProperty;
    return matchesSearch && matchesProperty;
  });

  const handleEdit = (mortgage) => {
    setEditingMortgage(mortgage);
    setShowForm(true);
  };

  const handleView = (mortgage) => {
    setViewingMortgage(mortgage);
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

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by lender or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterProperty}
                onChange={(e) => setFilterProperty(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent appearance-none"
              >
                <option value="">All Properties</option>
                {properties.map(propertyId => (
                  <option key={propertyId} value={propertyId}>
                    {propertyId}
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

          {/* Mortgages List */}
          {!loading && (
            <div className="space-y-4">
              {filteredMortgages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No mortgages found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterProperty 
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by adding your first mortgage."
                    }
                  </p>
                  {!searchTerm && !filterProperty && (
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
                <div className="grid gap-4">
                  {filteredMortgages.map((mortgage) => (
                    <div
                      key={mortgage.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {mortgage.lenderName || 'Unnamed Mortgage'}
                            </h3>
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
                                {(mortgage.interestRate || 0).toFixed(2)}%
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
                                {formatDate(mortgage.startDate)}
                              </p>
                            </div>
                          </div>

                          {mortgage.propertyId && (
                            <div className="mt-3">
                              <p className="text-gray-600 dark:text-gray-400 text-sm">Property</p>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {mortgage.propertyId}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleView(mortgage)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(mortgage)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Edit Mortgage"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="More Options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
      </Layout>
    </RequireAuth>
  );
}
