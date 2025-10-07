"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { ArrowLeft, Edit, Trash2, Download, Calendar, DollarSign, Percent, Clock } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

export default function MortgageDetails({ mortgage, onClose }) {
  const { calculateMortgagePayment, calculateRemainingBalance, removeMortgage } = useMortgages();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return 'N/A';
    return new Date(date.seconds ? date.seconds * 1000 : date).toLocaleDateString('en-CA');
  };

  // Calculate current values
  const currentPayment = calculateMortgagePayment(
    mortgage.originalAmount,
    mortgage.interestRate,
    mortgage.amortizationPeriodYears,
    mortgage.paymentFrequency
  );

  const startDate = mortgage.startDate ? new Date(mortgage.startDate.seconds ? mortgage.startDate.seconds * 1000 : mortgage.startDate) : new Date();
  const monthsSinceStart = Math.max(0, Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24 * 30)));
  const paymentsMade = Math.floor(monthsSinceStart / (mortgage.paymentFrequency === 'MONTHLY' ? 1 : mortgage.paymentFrequency === 'BIWEEKLY' ? 0.5 : 0.25));

  const remainingBalance = calculateRemainingBalance(
    mortgage.originalAmount,
    mortgage.interestRate,
    mortgage.amortizationPeriodYears,
    paymentsMade,
    mortgage.paymentFrequency
  );

  const totalPaid = currentPayment * paymentsMade;
  const principalPaid = mortgage.originalAmount - remainingBalance;
  const interestPaid = totalPaid - principalPaid;

  // Calculate term end date
  const termEndDate = new Date(startDate);
  termEndDate.setFullYear(termEndDate.getFullYear() + mortgage.termYears);

  // Calculate amortization end date
  const amortizationEndDate = new Date(startDate);
  amortizationEndDate.setFullYear(amortizationEndDate.getFullYear() + mortgage.amortizationPeriodYears);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeMortgage(mortgage.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete mortgage:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mortgage.lenderName || 'Unnamed Mortgage'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Mortgage Details & Payment History
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Current Payment</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(currentPayment)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mortgage.paymentFrequency.toLowerCase()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[#205A3E]/10 dark:bg-[#205A3E]/20 rounded-lg">
              <Percent className="w-5 h-5 text-[#205A3E] dark:text-[#205A3E]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interest Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatPercentage(mortgage.interestRate * 100)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mortgage.rateType}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Remaining Balance</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(remainingBalance)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {((remainingBalance / mortgage.originalAmount) * 100).toFixed(1)}% of original
          </p>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mortgage Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mortgage Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Lender</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.lenderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Original Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(mortgage.originalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.interestRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rate Type</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.rateType}</span>
            </div>
            {mortgage.variableRateSpread && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rate Spread</span>
                <span className="font-medium text-gray-900 dark:text-white">{mortgage.variableRateSpread}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amortization</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.amortizationPeriodYears} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Term</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.termYears} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment Frequency</span>
              <span className="font-medium text-gray-900 dark:text-white">{mortgage.paymentFrequency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Start Date</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatDate(mortgage.startDate)}</span>
            </div>
            {mortgage.propertyId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Property ID</span>
                <span className="font-medium text-gray-900 dark:text-white">{mortgage.propertyId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payments Made</span>
              <span className="font-medium text-gray-900 dark:text-white">{paymentsMade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Principal Paid</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(principalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Interest Paid</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(interestPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{formatCurrency(remainingBalance)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Important Dates</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Term End Date</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(termEndDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#205A3E]/10 dark:bg-[#205A3E]/20 rounded-lg">
              <Calendar className="w-4 h-4 text-[#205A3E] dark:text-[#205A3E]" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Amortization End Date</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(amortizationEndDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Mortgage
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this mortgage? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
