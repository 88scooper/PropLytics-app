"use client";

import Layout from "@/components/Layout.jsx";
import { RequireAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Share2, MoreVertical, Info, ChevronDown } from "lucide-react";

export default function MortgageCalculatorMobilePage() {
  return (
    <RequireAuth>
      <Layout>
        <div className="min-h-screen bg-gray-900 py-4">
          <div className="max-w-md mx-auto px-4">
            {/* Mobile Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full bg-gray-800">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#205A3E] rounded-full"></div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">Untitled</h1>
                    <p className="text-sm text-gray-400">Mortgage Calculator</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full bg-gray-800">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 rounded-full bg-gray-800">
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <MobileMortgageCalculator />
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}

function MobileMortgageCalculator() {
  const [formData, setFormData] = useState({
    mortgageAmount: 500000,
    interestRate: 5.25,
    amortizationYears: 25,
    amortizationMonths: 0,
    firstPaymentDate: new Date().toISOString().split('T')[0],
    paymentFrequency: 'monthly'
  });

  const [results, setResults] = useState({
    monthlyPayment: 0,
    principalPaid: 0,
    interestPaid: 0,
    totalPaid: 0,
    balanceEndOfTerm: 0,
    effectiveAmortization: 0
  });

  const [activeTab, setActiveTab] = useState('term');
  const canvasRef = useRef(null);

  // Calculate mortgage payment
  const calculateMortgage = () => {
    const { mortgageAmount, interestRate, amortizationYears, amortizationMonths } = formData;
    
    const principal = mortgageAmount;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = amortizationYears * 12 + amortizationMonths;
    
    if (monthlyRate === 0) {
      const monthlyPayment = principal / totalMonths;
      const totalPaid = monthlyPayment * totalMonths;
      
      setResults({
        monthlyPayment,
        principalPaid: principal,
        interestPaid: 0,
        totalPaid,
        balanceEndOfTerm: 0,
        effectiveAmortization: totalMonths / 12
      });
      return;
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                          (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    const totalPaid = monthlyPayment * totalMonths;
    const interestPaid = totalPaid - principal;
    
    setResults({
      monthlyPayment,
      principalPaid: principal,
      interestPaid,
      totalPaid,
      balanceEndOfTerm: 0,
      effectiveAmortization: totalMonths / 12
    });
  };

  // Update chart
  const updateChart = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { principalPaid, interestPaid } = results;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 15;
    
    const total = principalPaid + interestPaid;
    if (total === 0) return;
    
    const principalAngle = (principalPaid / total) * 2 * Math.PI;
    const interestAngle = (interestPaid / total) * 2 * Math.PI;
    
    // Draw principal slice (light blue)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, principalAngle);
    ctx.closePath();
    ctx.fillStyle = '#60A5FA'; // Light blue
    ctx.fill();
    
    // Draw interest slice (pink)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, principalAngle, principalAngle + interestAngle);
    ctx.closePath();
    ctx.fillStyle = '#F472B6'; // Pink
    ctx.fill();
    
    // Draw center circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#F4D03F';
    ctx.fill();
  };

  // Handle slider changes
  const handleSliderChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate and update on form data changes
  useEffect(() => {
    calculateMortgage();
  }, [formData]);

  // Update chart when results change
  useEffect(() => {
    updateChart();
  }, [results]);

  return (
    <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Main Payment Display */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-medium text-[#205A3E]">Mortgage Payment</h2>
              <ChevronDown className="w-4 h-4 text-[#205A3E]" />
            </div>
            <div className="text-4xl font-bold text-white">
              ${results.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <button className="px-4 py-2 border border-[#205A3E] text-[#205A3E] rounded-full text-sm font-medium hover:bg-[#205A3E] hover:text-white transition-colors">
            Monthly
          </button>
        </div>
      </div>

      {/* Input Sliders Section */}
      <div className="p-6 space-y-6">
        {/* Mortgage Amount Slider */}
        <MobileSliderInput
          label="Mortgage"
          value={formData.mortgageAmount}
          min={100000}
          max={2000000}
          step={10000}
          formatValue={(value) => `$${value.toLocaleString()}`}
          onChange={(value) => handleSliderChange('mortgageAmount', value)}
        />

        {/* Interest Rate Slider */}
        <MobileSliderInput
          label="Rate"
          subLabel="Find a Rate"
          value={formData.interestRate}
          min={1}
          max={10}
          step={0.1}
          formatValue={(value) => `${value}%`}
          subtitle="5 years Fixed"
          onChange={(value) => handleSliderChange('interestRate', value)}
        />

        {/* Amortization Slider */}
        <MobileSliderInput
          label="Amortization"
          subLabel="View Schedule"
          value={formData.amortizationYears}
          min={5}
          max={30}
          step={1}
          formatValue={(value) => `${value} years ${formData.amortizationMonths} months`}
          gradient={true}
          onChange={(value) => handleSliderChange('amortizationYears', value)}
        />

        {/* First Payment Date */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm font-medium text-gray-300">First Payment Date</label>
              <div className="text-xs text-blue-400 cursor-pointer hover:underline">Set to Today</div>
            </div>
            <div className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {new Date(formData.firstPaymentDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
          <input
            type="date"
            value={formData.firstPaymentDate}
            onChange={(e) => handleInputChange('firstPaymentDate', e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#205A3E]"
          />
        </div>
      </div>

      {/* Payment Summary Section */}
      <div className="p-6 bg-gray-750">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-6">
            <button className="text-sm text-gray-400">Payment Summary</button>
            <button 
              onClick={() => setActiveTab('term')}
              className={`text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'term'
                  ? 'text-[#205A3E] border-[#205A3E]'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              Term
            </button>
            <button 
              onClick={() => setActiveTab('total')}
              className={`text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'total'
                  ? 'text-[#205A3E] border-[#205A3E]'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              Total
            </button>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Chart and Legend */}
          <div className="flex items-center space-x-6">
            <canvas
              ref={canvasRef}
              width="120"
              height="120"
              className="flex-shrink-0"
            ></canvas>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Principal Paid</span>
                </div>
                <span className="text-sm font-medium text-white">
                  ${results.principalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Interest Paid</span>
                </div>
                <span className="text-sm font-medium text-white">
                  ${results.interestPaid.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Total Paid</span>
                  <span className="text-sm font-bold text-white">
                    ${results.totalPaid.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Balance end of term</span>
              <span className="text-sm font-medium text-white">
                ${results.balanceEndOfTerm.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Effective Amortization</span>
              <span className="text-sm font-medium text-white">
                {results.effectiveAmortization.toFixed(1)} years
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button className="text-blue-400 text-sm hover:underline">
              Add Extra Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile Slider Input Component
function MobileSliderInput({ 
  label, 
  subLabel, 
  value, 
  min, 
  max, 
  step, 
  formatValue, 
  subtitle, 
  gradient = false,
  onChange 
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div>
          <label className="text-sm font-medium text-gray-300">{label}</label>
          {subLabel && (
            <div className="text-xs text-blue-400 cursor-pointer hover:underline">{subLabel}</div>
          )}
        </div>
        <div className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
          {formatValue(value)}
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer mobile-slider ${
            gradient ? 'mobile-slider-gradient' : ''
          }`}
        />
      </div>
      
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Custom CSS for mobile sliders
const mobileSliderStyles = `
  .mobile-slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #205A3E;
    cursor: pointer;
    border: 2px solid #1F2937;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .mobile-slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #205A3E;
    cursor: pointer;
    border: 2px solid #1F2937;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .mobile-slider::-webkit-slider-track {
    background: #374151;
    border-radius: 6px;
    height: 8px;
  }
  
  .mobile-slider::-moz-range-track {
    background: #374151;
    border-radius: 6px;
    height: 8px;
  }
  
  .mobile-slider-gradient::-webkit-slider-track {
    background: linear-gradient(to right, #ef4444, #10b981);
  }
  
  .mobile-slider-gradient::-moz-range-track {
    background: linear-gradient(to right, #ef4444, #10b981);
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mobileSliderStyles;
  document.head.appendChild(style);
}
