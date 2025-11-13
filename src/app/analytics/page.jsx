"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useProperties, usePortfolioMetrics } from "@/context/PropertyContext";
import ScenarioAnalysisDashboard from "@/components/scenarios/ScenarioAnalysisDashboard";
import AssumptionsPanel from "@/components/calculators/AssumptionsPanel";
import BaselineForecast from "@/components/calculators/BaselineForecast";
import SensitivityDashboard from "@/components/calculators/SensitivityDashboard";
import YoYAnalysis from "@/components/calculators/YoYAnalysis";
import SaveScenarioModal from "@/components/calculators/SaveScenarioModal";
import SavedScenariosPanel from "@/components/calculators/SavedScenariosPanel";
import PropertySelector from "@/components/analytics/PropertySelector";
import { DEFAULT_ASSUMPTIONS } from "@/lib/sensitivity-analysis";
import { formatCurrency, formatPercentage } from "@/utils/formatting";
import { useToast } from "@/context/ToastContext";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('sensitivity');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [assumptions, setAssumptions] = useState(DEFAULT_ASSUMPTIONS);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [scenariosKey, setScenariosKey] = useState(0); // Key to force refresh of SavedScenariosPanel
  const [mounted, setMounted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const properties = useProperties();
  const portfolioMetrics = usePortfolioMetrics();
  const { addToast } = useToast();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set default property selection
  useEffect(() => {
    if (!selectedPropertyId && properties.length > 0) {
      setSelectedPropertyId(properties[0].id);
    }
  }, [selectedPropertyId, properties]);

  // Get selected property
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  // Handle save scenario success
  const handleSaveSuccess = () => {
    setScenariosKey(prev => prev + 1); // Increment key to refresh SavedScenariosPanel
    addToast("Scenario saved to your library.");
  };

  // Handle load scenario
  const handleLoadScenario = (loadedAssumptions) => {
    setAssumptions(loadedAssumptions);
  };

  const tabs = [
    { id: 'sensitivity', label: 'Sensitivity Analysis', icon: '🎯' },
    { id: 'scenarios', label: 'Scenario Analysis', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <RequireAuth>
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E]"></div>
            </div>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <header className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Explore how each property performs today, try out new assumptions, and compare outcomes side by side.
              </p>
            </div>
            <GuidedIntroCard />
          </header>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'sensitivity' && (
              <div className="space-y-8">
                <PropertySelector
                  properties={properties}
                  selectedPropertyId={selectedPropertyId}
                  onSelect={setSelectedPropertyId}
                  isLoading={!mounted}
                />

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                  <div className="space-y-6">
                    <StepCard
                      step="1"
                      title="Understand the default projection"
                      subtitle="We start with conservative assumptions so you have a baseline to compare against."
                    >
                      <BaselineForecast 
                        property={selectedProperty}
                        assumptions={DEFAULT_ASSUMPTIONS}
                      />
                    </StepCard>

                    <StepCard
                      step="3"
                      title="Compare your scenario to the default plan"
                      subtitle="See how your changes affect long-term returns, cash flow, and risk."
                    >
                      <div className="space-y-6">
                        <SensitivityDashboard 
                          property={selectedProperty}
                          assumptions={assumptions}
                        />
                      <YoYAnalysis 
                        property={selectedProperty}
                        assumptions={assumptions}
                        baselineAssumptions={DEFAULT_ASSUMPTIONS}
                      />
                      </div>
                    </StepCard>
                  </div>

                  <div className="space-y-6">
                    <StepCard
                      step="2"
                      title="Adjust the levers"
                      subtitle="Tweak growth, expense, and exit assumptions. Small changes can create big differences."
                    >
                      <AssumptionsPanel 
                        assumptions={assumptions}
                        onAssumptionsChange={setAssumptions}
                        onSaveClick={() => setShowSaveModal(true)}
                      />
                    </StepCard>

                    <SavedScenariosPanel 
                      key={scenariosKey}
                      propertyId={selectedPropertyId}
                      onLoadScenario={handleLoadScenario}
                      currentAssumptions={assumptions}
                    />
                  </div>
                </div>

                {/* Save Scenario Modal */}
                {showSaveModal && selectedProperty && (
                  <SaveScenarioModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    assumptions={assumptions}
                    property={selectedProperty}
                    onSaveSuccess={handleSaveSuccess}
                  />
                )}
              </div>
            )}

            {activeTab === 'scenarios' && <ScenarioAnalysisDashboard />}
            
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <h2 className="text-lg font-semibold mb-4">Portfolio Insights</h2>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <h3 className="font-medium mb-2">💡 Top Performing Property</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {properties.length > 0 ? 
                          `${properties.reduce((best, current) => current.monthlyCashFlow > best.monthlyCashFlow ? current : best).nickname} has the highest monthly cash flow at ${formatCurrency(properties.reduce((best, current) => current.monthlyCashFlow > best.monthlyCashFlow ? current : best).monthlyCashFlow)}.`
                          : 'No properties available for analysis.'
                        }
                      </p>
                    </div>
                    
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <h3 className="font-medium mb-2">📈 Portfolio Diversification</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Your portfolio consists of {properties.length} properties with an average cap rate of {properties.length > 0 ? formatPercentage(properties.reduce((sum, p) => sum + p.capRate, 0) / properties.length) : formatPercentage(0)}. 
                        Consider diversifying across different property types or locations for risk reduction.
                      </p>
                    </div>

                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <h3 className="font-medium mb-2">⚠️ Risk Assessment</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Monitor vacancy rates and market conditions. Consider setting aside 5-10% of annual rent as a vacancy allowance. 
                        Your current portfolio generates {formatCurrency(properties.reduce((sum, p) => sum + p.annualCashFlow, 0))} in annual cash flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


function GuidedIntroCard() {
  const [isOpen, setIsOpen] = useState(false);
  const steps = [
    {
      title: "Pick a property",
      description: "Choose which rental you'd like to explore. We'll load its rent, expenses, and mortgage details automatically."
    },
    {
      title: "Adjust the assumptions",
      description: "Change rent growth, expense inflation, interest rates, or exit cap rate to match your expectations."
    },
    {
      title: "Compare the outcomes",
      description: "See how cash flow, equity, and returns change instantly so you can decide what to do next."
    },
  ];

  return (
    <section className="rounded-2xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="text-left">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            New to investment analytics? Start here.
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Follow the three steps below to test "what if" scenarios and understand the story behind your numbers.
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-black/10 dark:border-white/10">
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-xl border border-black/10 bg-gray-50 p-4 dark:border-white/5 dark:bg-gray-800/70"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {index + 1}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StepCard({ step, title, subtitle, children }) {
  return (
    <section className="space-y-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          Step {step}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
      </header>
      <div>{children}</div>
    </section>
  );
}


