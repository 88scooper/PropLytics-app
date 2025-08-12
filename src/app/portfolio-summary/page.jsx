"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import { useState } from "react";

// Comprehensive sample data for the new dashboard layout
const portfolioData = {
  portfolioMetrics: {
    totalValue: 2450000,
    yearToDateGrowth: 5.2,
    totalEquity: 1180000,
    returnOnCost: {
      twoYear: 12.5,
      fiveYear: 28.3,
      tenYear: 45.7
    },
    monthlyCashFlow: {
      income: 28400,
      costs: 15950,
      cashOnCash: 8.9
    },
    capRate: 6.8,
    goals2025: {
      portfolioValue: 2800000,
      cashOnCash: 12.5
    }
  },
  properties: [
    {
      id: "p-101",
      name: "Maple Street Duplex",
      address: "123 Maple St, Toronto, ON",
      type: "Duplex",
      units: 2,
      currentValue: 920000,
      monthlyRent: 4200,
      tenant: {
        name: "John Smith",
        occupancyDate: "2023-06-01",
        monthlyRent: 2200,
        unit: "Unit A"
      },
      upcomingDates: {
        mortgagePayment: "2024-01-15",
        rentIncrease: "2024-03-01",
        insurance: "2024-02-15",
        maintenance: "2024-01-20",
        mortgageRenewal: "2027-03-15"
      }
    },
    {
      id: "p-102",
      name: "Willow Apartments",
      address: "456 Willow Ave, Mississauga, ON",
      type: "Apartment Building",
      units: 8,
      currentValue: 1200000,
      monthlyRent: 9600,
      tenant: {
        name: "Sarah Johnson",
        occupancyDate: "2023-08-01",
        monthlyRent: 2000,
        unit: "Unit B"
      },
      upcomingDates: {
        mortgagePayment: "2024-01-20",
        rentIncrease: "2024-04-01",
        insurance: "2024-03-01",
        maintenance: "2024-02-10",
        mortgageRenewal: "2026-08-20"
      }
    },
    {
      id: "p-103",
      name: "Cedar Townhome",
      address: "789 Cedar Rd, Oakville, ON",
      type: "Townhouse",
      units: 1,
      currentValue: 650000,
      monthlyRent: 2800,
      tenant: {
        name: "Michael Chen",
        occupancyDate: "2023-09-15",
        monthlyRent: 2800,
        unit: "Main Unit"
      },
      upcomingDates: {
        mortgagePayment: "2024-01-25",
        rentIncrease: "2024-05-01",
        insurance: "2024-02-28",
        maintenance: "2024-01-30",
        mortgageRenewal: "2028-09-25"
      }
    },
    {
      id: "p-104",
      name: "Oak Terrace",
      address: "12 Oak Dr, Burlington, ON",
      type: "Single Family",
      units: 1,
      currentValue: 750000,
      monthlyRent: 3200,
      tenant: {
        name: "Emily Davis",
        occupancyDate: "2023-07-01",
        monthlyRent: 3200,
        unit: "Main House"
      },
      upcomingDates: {
        mortgagePayment: "2024-01-30",
        rentIncrease: "2024-06-01",
        insurance: "2024-03-15",
        maintenance: "2024-02-05",
        mortgageRenewal: "2027-07-30"
      }
    }
  ]
};

export default function PortfolioSummaryPage() {
  // Calculate total monthly expenses
  const totalMonthlyExpenses = portfolioData.properties.reduce((total, property) => {
    // Estimate monthly expenses based on typical ratios
    const monthlyMortgage = property.monthlyRent * 0.6; // ~60% of rent
    const monthlyPropertyTax = property.monthlyRent * 0.1; // ~10% of rent
    const monthlyMaintenance = property.monthlyRent * 0.05; // ~5% of rent
    const monthlyInsurance = property.monthlyRent * 0.03; // ~3% of rent
    return total + monthlyMortgage + monthlyPropertyTax + monthlyMaintenance + monthlyInsurance;
  }, 0);



  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Summary</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Overview of your real estate investment performance and key metrics.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Total Estimated Portfolio Value"
              value="$2,450,000"
              description="Combined market value of all properties"
              trend="+5.2%"
              trendPositive={true}
            />
            <MetricCard
              title="Total Estimated Equity"
              value="$1,180,000"
              description="Current equity across all properties"
              trend="+8.7%"
              trendPositive={true}
            />
            <MetricCard
              title="Monthly Net Cash Flow"
              value="$12,450"
              description="Total monthly income after expenses"
              trend="+2.1%"
              trendPositive={true}
            />
            <MetricCard
              title="Total Monthly Expenses"
              value={`$${totalMonthlyExpenses.toLocaleString()}`}
              description="Total recurring monthly costs across all properties"
              trend="+1.8%"
              trendPositive={false}
              isExpense={true}
            />
            <MetricCard
              title="Total Properties"
              value="8"
              description="Number of properties in portfolio"
              trend="+1"
              trendPositive={true}
            />
            <MetricCard
              title="Average Occupancy Rate"
              value="94.5%"
              description="Current occupancy across all units"
              trend="-1.2%"
              trendPositive={false}
            />
            <MetricCard
              title="Average Cap Rate"
              value="6.8%"
              description="Weighted average capitalization rate"
              trend="+0.3%"
              trendPositive={true}
            />
            <MetricCard
              title="Total Estimated Return on Cost"
              value=""
              description=""
              trend=""
              trendPositive={true}
              showInfoIcon={true}
              tooltipText="This metric calculates the total return based on the initial capital invested."
              isMultiMetric={true}
              multiMetrics={[
                { label: "2-Year", value: "12.5%" },
                { label: "5-Year", value: "28.3%" },
                { label: "10-Year", value: "45.7%" }
              ]}
            />
            <MetricCard
              title="Financial Goals 2025"
              value=""
              description=""
              trend=""
              trendPositive={true}
              showInfoIcon={true}
              tooltipText="This card tracks your progress towards the financial goals set for the current year."
              isMultiMetric={true}
              multiMetrics={[
                { label: "Portfolio Value", value: "$2,800,000" },
                { label: "Cash on Cash", value: "12.5%" }
              ]}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Center Column: Tenants & Rent */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tenants & Rent</h2>
              
              {/* Current Tenants */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Current Tenants</h3>
                <div className="space-y-4">
                  {portfolioData.properties.map((property) => (
                    <div key={property.id} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{property.name}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{property.tenant.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{property.tenant.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Occupied: {new Date(property.tenant.occupancyDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          ${property.tenant.monthlyRent.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Annual Rental Income Chart */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Annual Rental Income (by Property)</h3>
                <div className="h-48 rounded-lg bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="text-sm font-medium">Pie Chart Placeholder</div>
                    <div className="text-xs">Annual rental income distribution</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Schedule */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Schedule</h2>
              
              {/* Key Upcoming Dates */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Upcoming Dates (30 days)</h3>
                
                <ScheduleEvents />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}

function MetricCard({ title, value, description, trend, trendPositive, isExpense, showInfoIcon, tooltipText, isMultiMetric, multiMetrics }) {
  const getValueColor = () => {
    if (isExpense) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  };

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
            {showInfoIcon && (
              <div className="relative group">
                <span className="text-gray-400 text-sm cursor-help">ⓘ</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                </div>
              </div>
            )}
          </div>
          
          {isMultiMetric ? (
            <div className="space-y-2">
              {multiMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{metric.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className={`mt-1 text-3xl font-bold ${getValueColor()}`}>{value}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </>
          )}
        </div>
        
        {!isMultiMetric && (
          <div className={`text-sm font-medium ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleEvents() {
  const [dateRange, setDateRange] = useState(30);
  
  // Static array of placeholder data for upcoming events
  const upcomingEvents = [
    { propertyName: "Maple Street Duplex", eventType: "Mortgage Payment", date: "2025-08-15" },
    { propertyName: "Willow Apartments", eventType: "Insurance Renewal", date: "2025-08-20" },
    { propertyName: "Maple Street Duplex", eventType: "Rent Increase", date: "2025-09-01" },
    { propertyName: "Cedar Townhome", eventType: "Maintenance", date: "2025-09-10" },
    { propertyName: "Willow Apartments", eventType: "Mortgage Payment", date: "2025-09-15" },
    { propertyName: "Maple Street Duplex", eventType: "Mortgage Renewal", date: "2025-10-25" },
  ];

  // Filter events based on selected date range
  const today = new Date();
  const endDate = new Date(today.getTime() + dateRange * 24 * 60 * 60 * 1000);
  const filteredEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= today && eventDate <= endDate;
  });

  // Sort events by date
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Group events by property
  const eventsByProperty = {};
  filteredEvents.forEach(event => {
    if (!eventsByProperty[event.propertyName]) {
      eventsByProperty[event.propertyName] = [];
    }
    eventsByProperty[event.propertyName].push(event);
  });

  // Get next week date for urgency highlighting
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const getUrgencyClass = (date) => {
    const eventDate = new Date(date);
    const isWithinWeek = eventDate <= nextWeek && eventDate >= today;
    
    if (isWithinWeek) {
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-l-yellow-500';
    }
    return 'bg-gray-50 dark:bg-gray-900/20 border-l-4 border-l-gray-200 dark:border-l-gray-700';
  };

  const formatDate = (date) => {
    const eventDate = new Date(date);
    const isToday = eventDate.toDateString() === today.toDateString();
    const isTomorrow = eventDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isTomorrow) {
      return 'Tomorrow';
    } else {
      return eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div>
      {/* Date Range Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={30}>Next 30 days</option>
          <option value={60}>Next 60 days</option>
          <option value={90}>Next 90 days</option>
        </select>
      </div>

      {/* Events by Property */}
      <div className="space-y-4">
        {Object.entries(eventsByProperty).map(([propertyName, events]) => (
          <div key={propertyName} className="space-y-2">
            {/* Property Header */}
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-1">
              {propertyName}
            </h4>
            
            {/* Events for this property */}
            <div className="space-y-1">
              {events.map((event, index) => (
                <div 
                  key={`${propertyName}-${event.eventType}-${index}`} 
                  className={`p-2 rounded ${getUrgencyClass(event.date)}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {event.eventType}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




