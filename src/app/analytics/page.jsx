"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <Layout>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Charts and insights coming soon.</p>
        
        {/* Keep vs. Sell Scenario Analysis Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keep vs. Sell Scenario Analysis</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Compare the financial implications of keeping your property versus selling it
              </p>
            </div>
            <Button 
              className="whitespace-nowrap"
              onClick={() => {
                // TODO: Navigate to keep vs. sell analysis workflow
                console.log("Navigate to keep vs. sell analysis");
              }}
            >
              Start Analysis
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-black/15 dark:border-white/15 p-8 text-center text-sm text-gray-600 dark:text-gray-300">
          Placeholder for analytics content.
        </div>
      </Layout>
    </RequireAuth>
  );
}


