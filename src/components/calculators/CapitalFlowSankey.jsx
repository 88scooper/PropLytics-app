"use client";

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';
import { buildCapitalFlowSankeyData } from '@/lib/sensitivity-analysis';
import { formatCurrency } from '@/utils/formatting';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const { payload: data } = payload[0];
  const sourceName = data?.source?.name ?? 'Source';
  const targetName = data?.target?.name ?? 'Target';
  const value = data?.value ?? 0;
  const label = data?.label;

  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="font-medium text-gray-900 dark:text-gray-100">
        {sourceName} → {targetName}
      </div>
      <div className="text-gray-600 dark:text-gray-300">
        {formatCurrency(value)}
      </div>
      {label && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
      )}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

const CapitalFlowSankey = ({ property, forecast, className }) => {
  const sankeyData = useMemo(() => {
    return buildCapitalFlowSankeyData(property, forecast);
  }, [property, forecast]);

  if (!property || !forecast || !sankeyData || !sankeyData.links.length) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 ${className ?? ''}`}>
        <p className="mb-0">
          Capital flow visualization will appear once forecast data is available for the selected scenario.
        </p>
      </div>
    );
  }

  const { nodes, links, meta } = sankeyData;

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className ?? ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Capital Flow Overview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Width of each link shows how dollars move from income and sale proceeds to expenses, debt service, and investor returns.
          </p>
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer>
          <Sankey
            data={{ nodes, links }}
            nodePadding={24}
            nodeWidth={18}
            linkCurvature={0.5}
            iterations={32}
          >
            <Tooltip content={<CustomTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/40">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Sources</div>
          <div className="mt-1 space-y-1 text-gray-700 dark:text-gray-200">
            <div>Initial Equity: <span className="font-medium">{formatCurrency(meta.initialEquity)}</span></div>
            <div>Rental Income (10 yr): <span className="font-medium">{formatCurrency(meta.totalRentalIncome)}</span></div>
            <div>Sale Proceeds: <span className="font-medium">{formatCurrency(meta.saleProceedsGross)}</span></div>
          </div>
        </div>
        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/40">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Uses</div>
          <div className="mt-1 space-y-1 text-gray-700 dark:text-gray-200">
            <div>Operating Expenses: <span className="font-medium">{formatCurrency(meta.totalOperatingExpenses)}</span></div>
            <div>Debt Service & Payoff: <span className="font-medium">{formatCurrency(meta.totalDebtPaid)}</span></div>
            <div>Net Cash Flow: <span className="font-medium">{formatCurrency(meta.totalNetCashFlow)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

CapitalFlowSankey.propTypes = {
  property: PropTypes.object,
  forecast: PropTypes.shape({
    rentalIncome: PropTypes.array,
    operatingExpenses: PropTypes.array,
    debtService: PropTypes.array,
    netCashFlow: PropTypes.array,
    propertyValue: PropTypes.array,
    mortgageBalance: PropTypes.array,
  }),
  className: PropTypes.string,
};

export default CapitalFlowSankey;
