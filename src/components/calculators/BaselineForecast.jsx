"use client";

import { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatting';
import { generateForecast, formatForecastForChart } from '@/lib/sensitivity-analysis';

const BaselineForecast = ({ property, assumptions }) => {
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  // Generate forecast data
  const forecastData = useMemo(() => {
    if (!property) return [];
    const forecast = generateForecast(property, assumptions);
    return formatForecastForChart(forecast);
  }, [property, assumptions]);

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Year {label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prevent hydration mismatch by showing loading state until client mounts
  if (!isClient) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          📈 Baseline Forecast (10 Years)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading forecast...
        </p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          📈 Baseline Forecast (10 Years)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Select a property to view the baseline forecast.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        📈 Baseline Forecast (10 Years)
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Most likely projection based on default assumptions. This chart shows your expected financial position over the next decade.
      </p>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="netCashFlow"
              name="Net Cash Flow"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="mortgageBalance"
              name="Mortgage Balance"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="equity"
              name="Total Equity"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
              Year 10 Net Cash Flow
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(forecastData[9]?.netCashFlow || 0)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
              Year 10 Total Equity
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(forecastData[9]?.equity || 0)}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
              Year 10 Mortgage Balance
            </p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">
              {formatCurrency(forecastData[9]?.mortgageBalance || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaselineForecast;

