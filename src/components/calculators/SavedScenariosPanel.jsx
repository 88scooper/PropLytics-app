"use client";

import { useState, useEffect } from 'react';
import { Trash2, Download, Upload, RefreshCw, Calendar, TrendingUp } from 'lucide-react';
import { getSavedScenarios, deleteScenario, getScenariosByProperty } from '@/lib/scenario-storage';

const SavedScenariosPanel = ({ propertyId, onLoadScenario, currentAssumptions }) => {
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load saved scenarios
  useEffect(() => {
    loadScenarios();
  }, [propertyId]);

  const loadScenarios = () => {
    if (propertyId) {
      const scenarios = getScenariosByProperty(propertyId);
      setSavedScenarios(scenarios);
    } else {
      setSavedScenarios([]);
    }
  };

  const handleLoadScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    onLoadScenario(scenario.assumptions);
  };

  const handleDeleteScenario = (scenarioId) => {
    const success = deleteScenario(scenarioId);
    if (success) {
      loadScenarios();
      if (selectedScenarioId === scenarioId) {
        setSelectedScenarioId(null);
      }
      setShowDeleteConfirm(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const isCurrentScenario = (scenario) => {
    if (!currentAssumptions) return false;
    return JSON.stringify(scenario.assumptions) === JSON.stringify(currentAssumptions);
  };

  if (savedScenarios.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Saved Scenarios
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            No saved scenarios yet
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-xs">
            Save your current assumptions to compare different scenarios later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Saved Scenarios
        </h3>
        <button
          onClick={loadScenarios}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {savedScenarios.length} scenario{savedScenarios.length !== 1 ? 's' : ''} saved for this property
      </p>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {savedScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`relative rounded-lg border transition-all ${
              isCurrentScenario(scenario)
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {scenario.name}
                    {isCurrentScenario(scenario) && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        Current
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>Saved {formatDate(scenario.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Assumptions Summary */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="text-gray-600 dark:text-gray-400">
                  Rent: <span className="font-medium text-gray-900 dark:text-white">{scenario.assumptions.annualRentIncrease}%</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Expenses: <span className="font-medium text-gray-900 dark:text-white">{scenario.assumptions.annualExpenseInflation}%</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Appreciation: <span className="font-medium text-gray-900 dark:text-white">{scenario.assumptions.annualPropertyAppreciation}%</span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Vacancy: <span className="font-medium text-gray-900 dark:text-white">{scenario.assumptions.vacancyRate}%</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!isCurrentScenario(scenario) && (
                  <button
                    onClick={() => handleLoadScenario(scenario)}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded 
                             hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-3 h-3 inline mr-1" />
                    Load
                  </button>
                )}
                
                {showDeleteConfirm === scenario.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteScenario(scenario.id)}
                      className="flex-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded 
                               hover:bg-red-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 
                               text-gray-700 dark:text-gray-300 rounded 
                               hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(scenario.id)}
                    className={`px-3 py-1.5 text-sm border border-red-300 dark:border-red-800 
                             text-red-600 dark:text-red-400 rounded 
                             hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                               isCurrentScenario(scenario) ? 'flex-1' : ''
                             }`}
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedScenariosPanel;

