import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const chartColors = {
  primary: '#2563eb',
  green: '#16a34a',
  amber: '#d97706',
  purple: '#9333ea',
};

export const RevenueLineChart = ({ data = [] }) => (
  <div className="card p-4">
    <h4 className="font-semibold mb-4">Revenue Trend</h4>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--tooltip-bg, #fff)', borderRadius: 8 }} />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke={chartColors.primary} strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="listings" stroke={chartColors.green} strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const PropertyBarChart = ({ data = [] }) => (
  <div className="card p-4">
    <h4 className="font-semibold mb-4">Properties by Status</h4>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 8 }} />
        <Bar dataKey="value" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const DashboardCharts = ({ chartData }) => {
  const revenueData = chartData?.revenue || [];
  const statusData = chartData?.propertyStatus || [
    { name: 'Available', value: 0 },
    { name: 'Sold', value: 0 },
    { name: 'Rented', value: 0 },
    { name: 'Pending', value: 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueLineChart data={revenueData} />
      <PropertyBarChart data={statusData} />
    </div>
  );
};

export default DashboardCharts;
