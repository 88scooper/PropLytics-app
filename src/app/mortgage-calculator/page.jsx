"use client";

import Layout from "@/components/Layout.jsx";
import { RequireAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function MortgageCalculatorPage() {
  return (
    <RequireAuth>
      <Layout>
        <div className="min-h-screen bg-gray-900 py-4">
          <div className="max-w-md mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full bg-gray-800">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <h1 className="text-lg font-semibold text-white">Untitled</h1>
                    <p className="text-sm text-gray-400">Mortgage Calculator</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full bg-gray-800">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
                <button className="p-2 rounded-full bg-gray-800">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <MortgageCalculator />
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}

function MortgageCalculator() {
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
    ctx.fillStyle = '#1F2937';
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
            <h2 className="text-lg font-medium text-gray-300 mb-1">
              Mortgage Payment
            </h2>
            <div className="text-4xl font-bold text-white">
              ${results.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <button className="px-4 py-2 border border-green-500 text-green-500 rounded-full text-sm font-medium hover:bg-green-500 hover:text-white transition-colors">
            Monthly
          </button>
        </div>
      </div>

      {/* Input Sliders Section */}
      <div className="p-6 space-y-6">
        {/* Mortgage Amount Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300">Mortgage</label>
            <div className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
              ${formData.mortgageAmount.toLocaleString()}
            </div>
          </div>
          <input
            type="range"
            min="100000"
            max="2000000"
            step="10000"
            value={formData.mortgageAmount}
            onChange={(e) => handleSliderChange('mortgageAmount', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Interest Rate Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Rate</label>
              <div className="text-xs text-blue-400">Find a Rate</div>
            </div>
            <div className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {formData.interestRate}%
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={formData.interestRate}
            onChange={(e) => handleSliderChange('interestRate', e.target.value)}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-gray-500 mt-1">5 years Fixed</p>
        </div>

        {/* Amortization Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm font-medium text-gray-300">Amortization</label>
              <div className="text-xs text-blue-400">View Schedule</div>
            </div>
            <div className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium">
              {formData.amortizationYears} years {formData.amortizationMonths} months
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={formData.amortizationYears}
              onChange={(e) => handleSliderChange('amortizationYears', e.target.value)}
              className="w-full h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>

        {/* First Payment Date */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="text-sm font-medium text-gray-300">First Payment Date</label>
              <div className="text-xs text-blue-400">Set to Today</div>
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
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  ? 'text-green-500 border-green-500'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              Term
            </button>
            <button 
              onClick={() => setActiveTab('total')}
              className={`text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'total'
                  ? 'text-green-500 border-green-500'
                  : 'text-gray-400 border-transparent'
              }`}
            >
              Total
            </button>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
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

      {/* Custom CSS for sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10B981;
          cursor: pointer;
          border: 2px solid #1F2937;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10B981;
          cursor: pointer;
          border: 2px solid #1F2937;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-track {
          background: #374151;
          border-radius: 6px;
          height: 8px;
        }
        
        .slider::-moz-range-track {
          background: #374151;
          border-radius: 6px;
          height: 8px;
        }
      `}</style>
    </div>
  );
}
