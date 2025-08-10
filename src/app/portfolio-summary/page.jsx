import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";

export default function PortfolioSummaryPage() {
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
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <ActivityItem
                  title="Rent collected"
                  description="Maple Street Duplex"
                  amount="$2,400"
                  date="2 days ago"
                  type="income"
                />
                <ActivityItem
                  title="Maintenance expense"
                  description="Willow Apartments - HVAC repair"
                  amount="-$850"
                  date="5 days ago"
                  type="expense"
                />
                <ActivityItem
                  title="New tenant signed"
                  description="Cedar Townhome"
                  amount=""
                  date="1 week ago"
                  type="info"
                />
              </div>
            </div>

            <div className="rounded-lg border border-black/10 dark:border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
              <div className="space-y-3">
                <EventItem
                  title="Rent due"
                  description="Oak Terrace"
                  date="Tomorrow"
                  type="rent"
                />
                <EventItem
                  title="Insurance renewal"
                  description="Maple Street Duplex"
                  date="Next week"
                  type="insurance"
                />
                <EventItem
                  title="Property inspection"
                  description="Willow Apartments"
                  date="2 weeks"
                  type="inspection"
                />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </RequireAuth>
  );
}

function MetricCard({ title, value, description, trend, trendPositive }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-6 hover:bg-black/5 dark:hover:bg-white/5 transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
          <p className="mt-1 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <div className={`text-sm font-medium ${trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, description, amount, date, type }) {
  const getTypeColor = () => {
    switch (type) {
      case 'income': return 'text-emerald-600 dark:text-emerald-400';
      case 'expense': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
      </div>
      <div className="text-right">
        {amount && <div className={`font-medium ${getTypeColor()}`}>{amount}</div>}
        <div className="text-sm text-gray-500 dark:text-gray-400">{date}</div>
      </div>
    </div>
  );
}

function EventItem({ title, description, date, type }) {
  const getTypeColor = () => {
    switch (type) {
      case 'rent': return 'text-blue-600 dark:text-blue-400';
      case 'insurance': return 'text-orange-600 dark:text-orange-400';
      case 'inspection': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{description}</div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-medium ${getTypeColor()}`}>{date}</div>
      </div>
    </div>
  );
}


