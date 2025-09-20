"use client";

import { useState, useEffect } from 'react';
import { getAllProperties } from '@/lib/propertyData';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function SellPropertyScenario({ propertyId, onClose }) {
  const [properties] = useState(getAllProperties());
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [salePrice, setSalePrice] = useState(0);
  const [sellingCosts, setSellingCosts] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);

  useEffect(() => {
    if (propertyId) {
      const property = properties.find(p => p.id === propertyId);
      setSelectedProperty(property);
      setSalePrice(property?.marketValue || 0);
      setSellingCosts(property?.marketValue * 0.05 || 0); // Default 5% selling costs
    } else if (properties.length > 0) {
      setSelectedProperty(properties[0]);
      setSalePrice(properties[0].marketValue);
      setSellingCosts(properties[0].marketValue * 0.05);
    }
  }, [propertyId, properties]);

  const calculateSaleAnalysis = () => {
    if (!selectedProperty) return;

    const currentMarketValue = selectedProperty.marketValue;
    const currentMortgageBalance = selectedProperty.mortgage.remainingBalance;
    const totalInvestment = selectedProperty.totalInvestment;
    
    // Calculate proceeds from sale
    const grossProceeds = salePrice;
    const netProceeds = grossProceeds - sellingCosts - currentMortgageBalance;
    
    // Calculate gains/losses
    const capitalGain = grossProceeds - selectedProperty.purchasePrice;
    const totalGain = netProceeds - (totalInvestment - currentMortgageBalance);
    const totalReturn = (netProceeds / (totalInvestment - currentMortgageBalance)) * 100;
    
    // Calculate annualized return
    const purchaseDate = new Date(selectedProperty.purchaseDate);
    const currentDate = new Date();
    const yearsOwned = (currentDate - purchaseDate) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = (Math.pow(netProceeds / (totalInvestment - currentMortgageBalance), 1 / yearsOwned) - 1) * 100;
    
    // Calculate opportunity cost vs keeping property
    const annualCashFlow = selectedProperty.annualCashFlow;
    const yearsToCompare = 5; // Compare 5-year scenarios
    const keepScenarioValue = (totalInvestment - currentMortgageBalance) + (annualCashFlow * yearsToCompare);
    const sellScenarioValue = netProceeds * Math.pow(1.05, yearsToCompare); // Assume 5% annual return on proceeds
    
    setAnalysisResults({
      currentMarketValue,
      salePrice,
      sellingCosts,
      currentMortgageBalance,
      totalInvestment,
      grossProceeds,
      netProceeds,
      capitalGain,
      totalGain,
      totalReturn,
      annualizedReturn,
      yearsOwned,
      annualCashFlow,
      keepScenarioValue,
      sellScenarioValue,
      opportunityCost: sellScenarioValue - keepScenarioValue
    });
  };

  if (!selectedProperty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sell Property Analysis
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Property Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Property
          </label>
          <select
            value={selectedProperty.id}
            onChange={(e) => {
              const property = properties.find(p => p.id === e.target.value);
              setSelectedProperty(property);
              setSalePrice(property.marketValue);
              setSellingCosts(property.marketValue * 0.05);
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                {property.nickname} - ${property.marketValue.toLocaleString()} market value
              </option>
            ))}
          </select>
        </div>

        {/* Current Property Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Property Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Market Value</div>
              <div className="font-semibold">${selectedProperty.marketValue.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Mortgage Balance</div>
              <div className="font-semibold">${selectedProperty.mortgage.remainingBalance.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Total Investment</div>
              <div className="font-semibold">${selectedProperty.totalInvestment.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Annual Cash Flow</div>
              <div className="font-semibold">${selectedProperty.annualCashFlow.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Sale Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sale Price ($)
            </label>
            <Input
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
              placeholder="Enter sale price"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selling Costs ($)
            </label>
            <Input
              type="number"
              value={sellingCosts}
              onChange={(e) => setSellingCosts(parseFloat(e.target.value) || 0)}
              placeholder="Enter selling costs"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Typically 4-6% of sale price (realtor fees, legal, etc.)
            </p>
          </div>
        </div>

        <Button onClick={calculateSaleAnalysis} className="w-full">
          Analyze Sale Scenario
        </Button>

        {/* Results */}
        {analysisResults && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Sale Analysis Results</h4>
            
            {/* Sale Proceeds */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-green-900 dark:text-green-300 mb-2">Sale Proceeds</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-green-700 dark:text-green-300">Gross Proceeds</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    ${analysisResults.grossProceeds.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-700 dark:text-green-300">Less: Selling Costs</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    -${analysisResults.sellingCosts.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-700 dark:text-green-300">Less: Mortgage Payoff</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    -${analysisResults.currentMortgageBalance.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                <div className="text-sm text-green-700 dark:text-green-300">Net Proceeds</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${analysisResults.netProceeds.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Returns Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Capital Gains</h5>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${analysisResults.capitalGain.toLocaleString()}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {((analysisResults.capitalGain / selectedProperty.purchasePrice) * 100).toFixed(1)}% appreciation
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h5 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Total Return</h5>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analysisResults.totalReturn.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {analysisResults.annualizedReturn.toFixed(1)}% annualized over {analysisResults.yearsOwned.toFixed(1)} years
                </p>
              </div>
            </div>

            {/* Keep vs Sell Comparison */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">5-Year Scenario Comparison</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Keep Property</div>
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    ${analysisResults.keepScenarioValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    Current equity + 5 years cash flow
                  </div>
                </div>
                <div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Sell & Invest</div>
                  <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    ${analysisResults.sellScenarioValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    Proceeds invested at 5% annually
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-700">
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Opportunity Cost</div>
                <div className={`text-lg font-semibold ${analysisResults.opportunityCost > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analysisResults.opportunityCost > 0 ? '+' : ''}${analysisResults.opportunityCost.toLocaleString()}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  {analysisResults.opportunityCost > 0 ? 'Selling is better' : 'Keeping is better'}
                </div>
              </div>
            </div>

            {/* Tax Considerations */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Tax Considerations</h5>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Capital gains tax may apply on appreciation (consult tax advisor)</li>
                <li>• Principal residence exemption may reduce tax liability</li>
                <li>• Consider timing of sale for tax optimization</li>
                <li>• Factor in potential tax savings from keeping property</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
