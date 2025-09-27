"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useProperties, usePortfolioMetrics } from "@/context/PropertyContext";
import ScenarioAnalysisDashboard from "@/components/scenarios/ScenarioAnalysisDashboard";
import { formatCurrency, formatPercentage } from "@/utils/formatting";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('scenarios');
  const properties = useProperties();
  const portfolioMetrics = usePortfolioMetrics();

  const tabs = [
    { id: 'scenarios', label: 'Scenario Analysis', icon: '📊' },
    { id: 'portfolio', label: 'Portfolio Analytics', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Analyze your property portfolio and model different scenarios
            </p>
          </div>

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
            {activeTab === 'scenarios' && <ScenarioAnalysisDashboard />}
            
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Portfolio Value</div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(portfolioMetrics.totalValue)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Monthly Cash Flow</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(portfolioMetrics.totalMonthlyCashFlow)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Average Cap Rate</div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercentage(portfolioMetrics.averageCapRate)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Equity</div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(portfolioMetrics.totalEquity)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Net Operating Income (NOI)</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(portfolioMetrics.netOperatingIncome)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Annual Deductible Expenses</div>
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(portfolioMetrics.totalAnnualDeductibleExpenses)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <h2 className="text-lg font-semibold mb-4">Property Performance</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Monthly Rent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Cash Flow
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Cap Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Market Value
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 dark:divide-white/10">
                        {properties.map((property) => (
                          <tr key={property.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {property.nickname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatCurrency(property.rent.monthlyRent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <span className={`font-medium ${property.monthlyCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(property.monthlyCashFlow)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatPercentage(property.capRate)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {formatCurrency(property.marketValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

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


