"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateMortgage, useUpdateMortgage, useCalculateMortgage } from "@/hooks/useMortgages";
import { useToast } from "@/context/ToastContext";
import { usePropertyData } from "@/context/PropertyDataContext";
import { mortgageSchema, transformMortgageFormData, transformMortgageApiData } from "@/lib/mortgage-validation";
import { ArrowLeft, Save, X, Calculator, Loader2 } from "lucide-react";

export default function MortgageFormUpgraded({ mortgage, onClose }) {
  const createMortgage = useCreateMortgage();
  const updateMortgage = useUpdateMortgage();
  const calculateMortgage = useCalculateMortgage();
  const { showToast } = useToast();
  const propertyData = usePropertyData();
  
  // Create a properties array from the single property data
  const properties = propertyData ? [{
    id: propertyData.id,
    address: propertyData.address,
    name: propertyData.address
  }] : [];
  
  const [calculatedPayment, setCalculatedPayment] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      lenderName: '',
      propertyId: '',
      originalAmount: 0,
      interestRate: 0,
      rateType: 'FIXED',
      variableRateSpread: null,
      amortizationValue: 25,
      amortizationUnit: 'years',
      termValue: 5,
      termUnit: 'years',
      startDate: new Date(),
      paymentFrequency: 'MONTHLY'
    }
  });

  // Watch form values for payment calculation
  const watchedValues = watch(['originalAmount', 'interestRate', 'rateType', 'amortizationValue', 'amortizationUnit', 'paymentFrequency']);

  // Initialize form with existing mortgage data
  useEffect(() => {
    if (mortgage) {
      const formData = transformMortgageApiData(mortgage);
      reset(formData);
    }
  }, [mortgage, reset]);

  // Calculate payment when relevant fields change
  useEffect(() => {
    const [originalAmount, interestRate, rateType, amortizationValue, amortizationUnit, paymentFrequency] = watchedValues;
    
    if (originalAmount > 0 && interestRate > 0 && amortizationValue > 0) {
      // Convert amortization to years for calculation
      const amortizationInYears = amortizationUnit === 'years' ? amortizationValue : amortizationValue / 12;
      
      calculatePayment({
        originalAmount,
        interestRate: interestRate / 100, // Convert percentage to decimal
        rateType,
        amortizationPeriodYears: amortizationInYears,
        paymentFrequency,
        startDate: new Date(),
        termYears: amortizationInYears
      });
    }
  }, [watchedValues]);

  const calculatePayment = async (mortgageData) => {
    setIsCalculating(true);
    try {
      const result = await calculateMortgage.mutateAsync(mortgageData);
      setCalculatedPayment(result.payment);
    } catch (error) {
      console.error('Error calculating payment:', error);
      setCalculatedPayment(0);
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const transformedData = transformMortgageFormData(data);
      
      if (mortgage) {
        // Update existing mortgage
        await updateMortgage.mutateAsync({
          mortgageId: mortgage.id,
          mortgageData: transformedData
        });
        showToast('Mortgage updated successfully!', 'success');
      } else {
        // Create new mortgage
        await createMortgage.mutateAsync(transformedData);
        showToast('Mortgage created successfully!', 'success');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving mortgage:', error);
      showToast(error.message || 'Failed to save mortgage', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {mortgage ? 'Edit Mortgage' : 'Add New Mortgage'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Lender Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lender Name *
            </label>
            <input
              {...register('lenderName')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., TD Bank, RBC, Scotiabank"
            />
            {errors.lenderName && (
              <p className="mt-1 text-sm text-red-600">{errors.lenderName.message}</p>
            )}
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property <span className="text-red-500">*</span>
            </label>
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a property *</option>
                  {(properties || []).map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.propertyId && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyId.message}</p>
            )}
          </div>

          {/* Original Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Loan Amount *
            </label>
            <input
              {...register('originalAmount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="500000"
            />
            {errors.originalAmount && (
              <p className="mt-1 text-sm text-red-600">{errors.originalAmount.message}</p>
            )}
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%) *
            </label>
            <input
              {...register('interestRate', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5.25"
            />
            {errors.interestRate && (
              <p className="mt-1 text-sm text-red-600">{errors.interestRate.message}</p>
            )}
          </div>

          {/* Rate Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Type *
            </label>
            <Controller
              name="rateType"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="FIXED">Fixed Rate</option>
                  <option value="VARIABLE">Variable Rate</option>
                </select>
              )}
            />
            {errors.rateType && (
              <p className="mt-1 text-sm text-red-600">{errors.rateType.message}</p>
            )}
          </div>

          {/* Variable Rate Spread (conditional) */}
          {watch('rateType') === 'VARIABLE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variable Rate Spread (%) (Optional)
              </label>
              <input
                {...register('variableRateSpread', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="-0.5 (for Prime - 0.5%)"
              />
              {errors.variableRateSpread && (
                <p className="mt-1 text-sm text-red-600">{errors.variableRateSpread.message}</p>
              )}
            </div>
          )}

          {/* Amortization Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amortization Period *
            </label>
            <div className="flex gap-2">
              <input
                {...register('amortizationValue', { valueAsNumber: true })}
                type="number"
                min="1"
                max={watch('amortizationUnit') === 'years' ? 50 : 600}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={watch('amortizationUnit') === 'years' ? '25' : '300'}
              />
              <Controller
                name="amortizationUnit"
                control={control}
                render={({ field }) => (
                  <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('years');
                        // Auto-convert value when switching units
                        const currentValue = watch('amortizationValue');
                        if (currentValue && watch('amortizationUnit') === 'months') {
                          setValue('amortizationValue', Math.round(currentValue / 12));
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        field.value === 'years'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('months');
                        // Auto-convert value when switching units
                        const currentValue = watch('amortizationValue');
                        if (currentValue && watch('amortizationUnit') === 'years') {
                          setValue('amortizationValue', Math.round(currentValue * 12));
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        field.value === 'months'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Months
                    </button>
                  </div>
                )}
              />
            </div>
            {(errors.amortizationValue || errors.amortizationUnit) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amortizationValue?.message || errors.amortizationUnit?.message}
              </p>
            )}
          </div>

          {/* Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term *
            </label>
            <div className="flex gap-2">
              <input
                {...register('termValue', { valueAsNumber: true })}
                type="number"
                min="1"
                max={watch('termUnit') === 'years' ? 30 : 360}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={watch('termUnit') === 'years' ? '5' : '60'}
              />
              <Controller
                name="termUnit"
                control={control}
                render={({ field }) => (
                  <div className="flex bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('years');
                        // Auto-convert value when switching units
                        const currentValue = watch('termValue');
                        if (currentValue && watch('termUnit') === 'months') {
                          setValue('termValue', Math.round(currentValue / 12));
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        field.value === 'years'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Years
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange('months');
                        // Auto-convert value when switching units
                        const currentValue = watch('termValue');
                        if (currentValue && watch('termUnit') === 'years') {
                          setValue('termValue', Math.round(currentValue * 12));
                        }
                      }}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        field.value === 'months'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Months
                    </button>
                  </div>
                )}
              />
            </div>
            {(errors.termValue || errors.termUnit) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.termValue?.message || errors.termUnit?.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date *
            </label>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          {/* Payment Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Frequency *
            </label>
            <Controller
              name="paymentFrequency"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MONTHLY">Monthly (12 payments/year)</option>
                  <option value="SEMI_MONTHLY">Semi-monthly (24 payments/year)</option>
                  <option value="BI_WEEKLY">Bi-weekly (26 payments/year)</option>
                  <option value="ACCELERATED_BI_WEEKLY" title="Accelerated payments use your monthly payment to calculate a slightly higher recurring payment, resulting in paying off your mortgage faster.">Accelerated Bi-weekly (26 payments/year)</option>
                  <option value="WEEKLY">Weekly (52 payments/year)</option>
                  <option value="ACCELERATED_WEEKLY" title="Accelerated payments use your monthly payment to calculate a slightly higher recurring payment, resulting in paying off your mortgage faster.">Accelerated Weekly (52 payments/year)</option>
                </select>
              )}
            />
            {errors.paymentFrequency && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentFrequency.message}</p>
            )}
          </div>
        </div>

        {/* Calculated Payment Display */}
        {calculatedPayment > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Calculated Payment</h3>
              {isCalculating && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(calculatedPayment)}
            </p>
            <p className="text-sm text-blue-700">
              {watch('paymentFrequency')?.replace(/_/g, ' ').toLowerCase()} payment
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mortgage ? 'Update Mortgage' : 'Create Mortgage'}
          </button>
        </div>
      </form>
    </div>
  );
}
