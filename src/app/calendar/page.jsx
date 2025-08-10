import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";

export default function CalendarPage() {
  return (
    <RequireAuth>
      <Layout>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Schedule and reminders.</p>
        <div className="mt-6 rounded-lg border border-dashed border-black/15 dark:border-white/15 p-8 text-center text-sm text-gray-600 dark:text-gray-300">
          Placeholder for calendar UI.
        </div>
      </Layout>
    </RequireAuth>
  );
}


