"use client";

import React from 'react';
import { formatCurrency, formatPercentage } from '@/utils/formatting';

const MortgageDetailsPanel = ({ mortgageData }) => {
  // Use actual mortgage data from property context
  const mortgageNumber = mortgageData?.mortgage?.mortgageNumber || "8963064.1";
  const principalBalance = mortgageData?.mortgage?.currentBalance || mortgageData?.mortgage?.originalAmount || 378652.02;
  const propertyAddress = mortgageData?.property?.address || "403 311 Richmond St E Toronto ON";
  const rate = (mortgageData?.mortgage?.interestRate || 0.0269) * 100;
  const term = `${(mortgageData?.mortgage?.termMonths || 60) / 12} Years`;
  const renewalDate = mortgageData?.mortgage?.renewalDate ? new Date(mortgageData.mortgage.renewalDate) : new Date('2027-01-28');
  const product = mortgageData?.mortgage?.product || "Fixed";

  const InfoIcon = () => (
    <svg className="w-4 h-4 text-[#205A3E] dark:text-[#4ade80]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );

  const DetailRow = ({ label, value, hasInfoIcon = false, infoTooltip = "" }) => (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        {hasInfoIcon && (
          <div className="group relative">
            <InfoIcon />
            {infoTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#205A3E] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                {infoTooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#205A3E]"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <span className="font-medium text-right">{value}</span>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-black/10 dark:border-white/10 p-6">
      <div className="space-y-1">
        <DetailRow 
          label="Mortgage Number" 
          value={mortgageNumber} 
        />
        
        <DetailRow 
          label="Principal Balance" 
          value={formatCurrency(principalBalance)}
          hasInfoIcon={true}
          infoTooltip="The outstanding principal amount on your mortgage"
        />
        
        <DetailRow 
          label="Property Address" 
          value={propertyAddress}
        />
        
        <DetailRow 
          label="Rate" 
          value={`${rate}%`}
        />
        
        <DetailRow 
          label="Term" 
          value={term}
          hasInfoIcon={true}
          infoTooltip="The length of your current mortgage term"
        />
        
        <DetailRow 
          label="Renewal Date" 
          value={renewalDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        />
        
        <DetailRow 
          label="Product" 
          value={product}
        />
      </div>
    </div>
  );
};

export default MortgageDetailsPanel;
