"use client";

import { useState, use } from "react";
import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { useProperty } from "@/context/PropertyContext";

export default function PropertyDetailPage({ params }) {
  const { propertyId } = use(params) || {};
  
  // Get property data using propertyId from PropertyContext
  const property = useProperty(propertyId);

  if (!property) {
    return (
      <RequireAuth>
        <Layout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Property Not Found</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              The property you're looking for doesn't exist.
            </p>
          </div>
        </Layout>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-300">{property.address}</p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
                  {property.type}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {property.units} unit{property.units > 1 ? 's' : ''}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {property.squareFootage.toLocaleString()} sq ft
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">Edit Property</Button>
              <Button>Add Expense</Button>
            </div>
          </div>

          {/* Property Image */}
          <div className="h-64 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
            {property.imageUrl ? (
              <img 
                src={property.imageUrl} 
                alt={property.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="text-lg font-medium">Property Image</div>
                  <div className="text-sm">Upload functionality coming soon</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Purchase & Initial Costs */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Purchase & Initial Costs</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Purchase Price</span>
                      <span className="font-medium">${property.purchasePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Down Payment</span>
                      <span className="font-medium">${(property.purchasePrice - property.mortgage.originalAmount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Closing Costs</span>
                      <span className="font-medium">${property.closingCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Renovation Costs</span>
                      <span className="font-medium">${property.renovationCosts.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between font-semibold">
                        <span>Total Investment</span>
                        <span>${property.totalInvestment.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Purchase Date</span>
                      <span className="font-medium">{new Date(property.purchaseDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Value</span>
                      <span className="font-medium">${property.currentValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Appreciation</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        +${(property.currentValue - property.purchasePrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Financials */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Current Financials</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-3">Monthly Income</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Rental Income</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          ${property.rent.monthlyRent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Monthly Expenses</h3>
                    <div className="space-y-2">
                      {Object.entries(property.monthlyExpenses).map(([key, value]) => {
                        if (key === 'total') return null;
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              -${value.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-black/10 dark:border-white/10">
                        <div className="flex justify-between font-semibold">
                          <span>Total Expenses</span>
                          <span className="text-red-600 dark:text-red-400">
                            -${property.monthlyExpenses.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${property.monthlyCashFlow.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.capRate}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cap Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{property.cashOnCashReturn}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Cash on Cash</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mortgage Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Mortgage Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Lender</span>
                      <span className="font-medium">{property.mortgage.lender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Original Loan</span>
                      <span className="font-medium">${property.mortgage.originalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <span className="font-medium">{(property.mortgage.interestRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Term</span>
                      <span className="font-medium">{property.mortgage.termMonths / 12} years</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
                      <span className="font-medium">Calculated</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                      <span className="font-medium">${property.mortgage.originalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Next Payment</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Principal Paid</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        $0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History - Coming Soon */}
              {false && (
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                  <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-black/10 dark:border-white/10">
                          <th className="text-left py-2 font-medium">Date</th>
                          <th className="text-right py-2 font-medium">Principal</th>
                          <th className="text-right py-2 font-medium">Interest</th>
                          <th className="text-right py-2 font-medium">Total</th>
                          <th className="text-right py-2 font-medium">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mortgageData.paymentHistory.slice(0, 10).map((payment, index) => (
                          <tr key={index} className="border-b border-black/5 dark:border-white/5">
                            <td className="py-2">{new Date(payment.date).toLocaleDateString()}</td>
                            <td className="text-right py-2">${Math.abs(payment.principal).toLocaleString()}</td>
                            <td className="text-right py-2">${Math.abs(payment.interest).toLocaleString()}</td>
                            <td className="text-right py-2 font-medium">${Math.abs(payment.total).toLocaleString()}</td>
                            <td className="text-right py-2 text-gray-600 dark:text-gray-400">
                              {payment.remaining > 0 ? `$${payment.remaining.toLocaleString()}` : 'Paid Off'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing last 10 payments of {mortgageData.paymentHistory.length} total payments
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Placeholder */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Charts</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-48 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-sm">Cash Flow Over Time</div>
                      <div className="text-xs">Chart placeholder</div>
                    </div>
                  </div>
                  <div className="h-48 rounded-lg bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <div className="text-sm">Expense Breakdown</div>
                      <div className="text-xs">Chart placeholder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Mortgage Summary - Coming Soon */}
              {false && (
                <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                  <h3 className="font-semibold mb-3">Mortgage Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Current Balance</span>
                      <span className="font-medium">${mortgageData.currentBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Monthly Payment</span>
                      <span className="font-medium">${mortgageData.paymentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <span className="font-medium">{mortgageData.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Principal Paid</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        ${(mortgageData.purchasePrice - mortgageData.currentBalance).toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-black/10 dark:border-white/10">
                      <div className="flex justify-between font-medium">
                        <span>Total Payments</span>
                        <span>{mortgageData.paymentHistory.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Occupancy</span>
                    <span className="font-medium">{property.occupancy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Annual Cash Flow</span>
                    <span className={`font-medium ${property.annualCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      ${property.annualCashFlow.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Units</span>
                    <span className="font-medium">{property.units}</span>
                  </div>
                </div>
              </div>

              {/* Tenants */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Current Tenants</h3>
                <div className="space-y-3">
                  {property.tenants.map((tenant, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-gray-600 dark:text-gray-400">{tenant.unit}</div>
                      <div className="text-emerald-600 dark:text-emerald-400">${tenant.rent.toLocaleString()}/mo</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Lease: {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Property Details */}
              <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
                <h3 className="font-semibold mb-3">Property Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Square Footage</span>
                    <span className="font-medium">{property.squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                    <span className="font-medium">{property.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Property Type</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


