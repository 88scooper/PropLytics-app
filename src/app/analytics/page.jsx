import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  return (
    <RequireAuth>
      <Layout>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Charts and insights coming soon.</p>
        <div className="mt-6 rounded-lg border border-dashed border-black/15 dark:border-white/15 p-8 text-center text-sm text-gray-600 dark:text-gray-300">
          Placeholder for analytics content.
        </div>
      </Layout>
    </RequireAuth>
  );
}


