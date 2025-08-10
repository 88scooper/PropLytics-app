import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";
import MortgagePaymentCalculator from "@/components/calculators/MortgagePaymentCalculator";
import RefinanceCalculator from "@/components/calculators/RefinanceCalculator";
import MortgageBreakPenaltyCalculator from "@/components/calculators/MortgageBreakPenaltyCalculator";

export default function CalculatorPage() {
  return (
    <RequireAuth>
      <Layout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Financial Calculators</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Run numbers for deals, refinancing scenarios, and mortgage penalties.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-1">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Mortgage Payment Calculator</h2>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Calculate monthly mortgage payments, total interest, and overall cost.
                </p>
              </div>
              <MortgagePaymentCalculator />
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Refinance Calculator</h2>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Compare current vs new mortgage terms and calculate potential savings.
                </p>
              </div>
              <RefinanceCalculator />
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Mortgage Break Penalty Calculator</h2>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  Estimate penalties for breaking your mortgage early.
                </p>
              </div>
              <MortgageBreakPenaltyCalculator />
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Calculator Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use realistic interest rates based on current market conditions</li>
              <li>• Include all closing costs when calculating refinance scenarios</li>
              <li>• Consider both three months' interest and IRD penalties</li>
              <li>• These calculations are estimates - consult with your lender for exact figures</li>
            </ul>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}


