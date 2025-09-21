"use client";

import { useState, useMemo } from "react";
import { calculateAmortizationSchedule } from "@/utils/mortgageCalculator";
import { ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";

export default function AmortizationSchedule({ mortgage, propertyName, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 12; // Show 12 payments per page (1 year)

  // Calculate amortization schedule
  const schedule = useMemo(() => {
    if (!mortgage) return null;
    try {
      return calculateAmortizationSchedule(mortgage);
    } catch (error) {
      console.error("Error calculating amortization schedule:", error);
      return null;
    }
  }, [mortgage]);

  // Pagination logic
  const totalPages = schedule ? Math.ceil(schedule.payments.length / paymentsPerPage) : 1;
  const startIndex = (currentPage - 1) * paymentsPerPage;
  const endIndex = startIndex + paymentsPerPage;
  const currentPayments = schedule ? schedule.payments.slice(startIndex, endIndex) : [];

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handleExportCSV = () => {
    if (!schedule) return;
    
    const csvContent = [
      // Header
      ["Payment #", "Date", "Payment", "Principal", "Interest", "Remaining Balance"].join(","),
      // Data rows
      ...schedule.payments.map(payment => [
        payment.paymentNumber,
        payment.paymentDate,
        payment.monthlyPayment.toFixed(2),
        payment.principal.toFixed(2),
        payment.interest.toFixed(2),
        payment.remainingBalance.toFixed(2)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${propertyName}_amortization_schedule.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!mortgage || !schedule) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Unable to Calculate Schedule</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              There was an error calculating the amortization schedule for this mortgage.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Amortization Schedule
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {propertyName} - {mortgage.lender}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Payments</p>
              <p className="text-lg font-semibold">{schedule.totalPayments}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Interest</p>
              <p className="text-lg font-semibold">${schedule.totalInterest.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Final Payment</p>
              <p className="text-lg font-semibold">{schedule.finalPaymentDate}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">Payment Frequency</p>
              <p className="text-lg font-semibold">{mortgage.paymentFrequency}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
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
              {currentPayments.map((payment) => (
                <tr key={payment.paymentNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{payment.paymentNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    ${payment.monthlyPayment.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">
                    ${payment.principal.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 dark:text-red-400">
                    ${payment.interest.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300">
                    ${payment.remainingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing payments {startIndex + 1} to {Math.min(endIndex, schedule.payments.length)} of {schedule.payments.length}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
