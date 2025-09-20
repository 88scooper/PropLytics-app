"use client";

import { useState, useEffect } from "react";
import { useMortgages } from "@/context/MortgageContext";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Save, X } from "lucide-react";

export default function MortgageForm({ mortgage, onClose }) {
  const { addNewMortgage, updateExistingMortgage, calculateMortgagePayment } = useMortgages();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lenderName: '',
    propertyId: '',
    originalAmount: '',
    interestRate: '',
    rateType: 'FIXED',
    variableRateSpread: '',
    amortizationPeriodYears: 25,
    termYears: 5,
    startDate: new Date().toISOString().split('T')[0],
    paymentFrequency: 'MONTHLY'
  });

  const [calculatedPayment, setCalculatedPayment] = useState(0);

  // Initialize form with existing mortgage data
  useEffect(() => {
    if (mortgage) {
      setFormData({
        lenderName: mortgage.lenderName || '',
        propertyId: mortgage.propertyId || '',
        originalAmount: mortgage.originalAmount?.toString() || '',
        interestRate: mortgage.interestRate?.toString() || '',
        rateType: mortgage.rateType || 'FIXED',
        variableRateSpread: mortgage.variableRateSpread?.toString() || '',
        amortizationPeriodYears: mortgage.amortizationPeriodYears || 25,
        termYears: mortgage.termYears || 5,
        startDate: mortgage.startDate ? 
          (mortgage.startDate.seconds ? 
            new Date(mortgage.startDate.seconds * 1000).toISOString().split('T')[0] :
            new Date(mortgage.startDate).toISOString().split('T')[0]
          ) : new Date().toISOString().split('T')[0],
        paymentFrequency: mortgage.paymentFrequency || 'MONTHLY'
      });
    }
  }, [mortgage]);

  // Calculate payment when relevant fields change
  useEffect(() => {
    const amount = parseFloat(formData.originalAmount);
    const rate = parseFloat(formData.interestRate);
    const years = formData.amortizationPeriodYears;

    if (amount > 0 && rate >= 0 && years > 0) {
      const payment = calculateMortgagePayment(amount, rate, years, formData.paymentFrequency);
      setCalculatedPayment(payment);
    } else {
      setCalculatedPayment(0);
    }
  }, [formData.originalAmount, formData.interestRate, formData.amortizationPeriodYears, formData.paymentFrequency, calculateMortgagePayment]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.lenderName.trim()) {
      showToast('Please enter a lender name', 'error');
      return;
    }

    if (!formData.originalAmount || parseFloat(formData.originalAmount) <= 0) {
      showToast('Please enter a valid original amount', 'error');
      return;
    }

    if (formData.interestRate === '' || parseFloat(formData.interestRate) < 0) {
      showToast('Please enter a valid interest rate', 'error');
      return;
    }

    setLoading(true);

    try {
      const mortgageData = {
        lenderName: formData.lenderName.trim(),
        propertyId: formData.propertyId.trim() || null,
        originalAmount: parseFloat(formData.originalAmount),
        interestRate: parseFloat(formData.interestRate),
        rateType: formData.rateType,
        variableRateSpread: formData.variableRateSpread ? parseFloat(formData.variableRateSpread) : null,
        amortizationPeriodYears: formData.amortizationPeriodYears,
        termYears: formData.termYears,
        startDate: new Date(formData.startDate),
        paymentFrequency: formData.paymentFrequency
      };

      if (mortgage) {
        await updateExistingMortgage(mortgage.id, mortgageData);
        showToast('Mortgage updated successfully', 'success');
      } else {
        await addNewMortgage(mortgageData);
        showToast('Mortgage added successfully', 'success');
      }

      onClose();
    } catch (error) {
      showToast(error.message || 'Failed to save mortgage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mortgage ? 'Edit Mortgage' : 'Add New Mortgage'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {mortgage ? 'Update mortgage details' : 'Enter mortgage information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lender Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lender Name *
            </label>
            <input
              type="text"
              value={formData.lenderName}
              onChange={(e) => handleInputChange('lenderName', e.target.value)}
              placeholder="e.g., TD Bank, RBC, etc."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
              required
            />
          </div>

          {/* Property ID */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Property ID
            </label>
            <input
              type="text"
              value={formData.propertyId}
              onChange={(e) => handleInputChange('propertyId', e.target.value)}
              placeholder="Link to a property (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            />
          </div>

          {/* Original Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Original Amount *
            </label>
            <input
              type="number"
              value={formData.originalAmount}
              onChange={(e) => handleInputChange('originalAmount', e.target.value)}
              placeholder="500000"
              min="0"
              step="1000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
              required
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interest Rate (%) *
            </label>
            <input
              type="number"
              value={formData.interestRate}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              placeholder="5.25"
              min="0"
              max="20"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
              required
            />
          </div>

          {/* Rate Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rate Type
            </label>
            <select
              value={formData.rateType}
              onChange={(e) => handleInputChange('rateType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value="FIXED">Fixed Rate</option>
              <option value="VARIABLE">Variable Rate</option>
            </select>
          </div>

          {/* Variable Rate Spread */}
          {formData.rateType === 'VARIABLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variable Rate Spread (%)
              </label>
              <input
                type="number"
                value={formData.variableRateSpread}
                onChange={(e) => handleInputChange('variableRateSpread', e.target.value)}
                placeholder="-0.5"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                e.g., -0.5 for Prime - 0.5%
              </p>
            </div>
          )}

          {/* Amortization Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amortization Period (Years)
            </label>
            <select
              value={formData.amortizationPeriodYears}
              onChange={(e) => handleInputChange('amortizationPeriodYears', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value={15}>15 Years</option>
              <option value={20}>20 Years</option>
              <option value={25}>25 Years</option>
              <option value={30}>30 Years</option>
              <option value={35}>35 Years</option>
            </select>
          </div>

          {/* Term Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Term (Years)
            </label>
            <select
              value={formData.termYears}
              onChange={(e) => handleInputChange('termYears', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={4}>4 Years</option>
              <option value={5}>5 Years</option>
              <option value={6}>6 Years</option>
              <option value={7}>7 Years</option>
              <option value={10}>10 Years</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            />
          </div>

          {/* Payment Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Frequency
            </label>
            <select
              value={formData.paymentFrequency}
              onChange={(e) => handleInputChange('paymentFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#205A3E] focus:border-transparent"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="BIWEEKLY">Bi-weekly</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>
        </div>

        {/* Payment Preview */}
        {calculatedPayment > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payment Preview
            </h3>
            <p className="text-2xl font-bold text-[#205A3E]">
              {formatCurrency(calculatedPayment)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formData.paymentFrequency.toLowerCase()} payment
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#205A3E] text-white rounded-lg hover:bg-[#1a4a32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mortgage ? 'Update Mortgage' : 'Add Mortgage'}
          </button>
        </div>
      </form>
    </div>
  );
}
