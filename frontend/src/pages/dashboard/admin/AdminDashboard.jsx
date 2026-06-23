import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { FiGrid, FiUsers, FiUserCheck, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import DashboardCharts from '../../../components/charts/DashboardCharts';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatPrice } from '../../../utils/helpers';
import api from '../../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/charts'),
        ]);
        setStats(statsRes.data.data);
        setChartData(chartsRes.data.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout role="admin"><LoadingSpinner size="lg" className="py-20" /></DashboardLayout>;

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Admin Dashboard - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Properties" value={stats?.totalProperties || 0} icon={FiGrid} color="primary" />
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={FiUsers} color="blue" />
        <StatCard title="Active Agents" value={stats?.totalAgents || 0} icon={FiUserCheck} color="green" />
        <StatCard title="Monthly Revenue" value={formatPrice(stats?.monthlyRevenue || 0)} icon={FiAlertCircle} color="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals || 0} color="amber" />
        <StatCard title="New Listings (Month)" value={stats?.newListings || 0} color="green" />
        <StatCard title="Pending Appointments" value={stats?.pendingAppointments || 0} color="blue" />
      </div>

      <DashboardCharts chartData={chartData} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {[
          { to: '/dashboard/admin/users', label: 'Manage Users' },
          { to: '/dashboard/admin/properties', label: 'Manage Properties' },
          { to: '/dashboard/admin/reports', label: 'View Reports' },
          { to: '/dashboard/admin/settings', label: 'Settings' },
        ].map((link) => (
          <Link key={link.to} to={link.to} className="card p-4 text-center hover:shadow-md transition font-medium text-primary-600">
            {link.label}
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
