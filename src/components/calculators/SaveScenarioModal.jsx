"use client";

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { saveScenario, scenarioNameExists } from '@/lib/scenario-storage';

const SaveScenarioModal = ({ isOpen, onClose, assumptions, property, onSaveSuccess }) => {
  const [scenarioName, setScenarioName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    // Validate scenario name
    if (!scenarioName.trim()) {
      setError('Please enter a scenario name');
      return;
    }

    if (scenarioName.length < 3) {
      setError('Scenario name must be at least 3 characters');
      return;
    }

    if (scenarioName.length > 50) {
      setError('Scenario name must be less than 50 characters');
      return;
    }

    // Check if name already exists for this property
    if (scenarioNameExists(scenarioName, property.id)) {
      setError('A scenario with this name already exists for this property');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const success = saveScenario({
        name: scenarioName,
        propertyId: property.id,
        propertyName: property.nickname,
        assumptions: assumptions,
      });

      if (success) {
        // Reset form and close modal
        setScenarioName('');
        setError('');
        onSaveSuccess && onSaveSuccess();
        onClose();
      } else {
        setError('Failed to save scenario. Please try again.');
      }
    } catch (error) {
      console.error('Error saving scenario:', error);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setScenarioName('');
      setError('');
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    } else if (e.key === 'Escape' && !isSaving) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Scenario
          </h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Save your current assumptions as a named scenario for future reference and comparison.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                Property: {property?.nickname || 'Unknown'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scenario Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => {
                setScenarioName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Optimistic Growth, Conservative Forecast"
              disabled={isSaving}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
              autoFocus
            />
          </div>

          {/* Current Assumptions Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Current Assumptions
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Rent Increase:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{assumptions.annualRentIncrease}%</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Expense Inflation:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{assumptions.annualExpenseInflation}%</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Appreciation:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{assumptions.annualPropertyAppreciation}%</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vacancy:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{assumptions.vacancyRate}%</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600 dark:text-gray-400">Future Rate:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">{assumptions.futureInterestRate}%</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 
                     rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !scenarioName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Scenario
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveScenarioModal;

