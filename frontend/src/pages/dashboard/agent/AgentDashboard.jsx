import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiGrid, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import api from '../../../api/axios';

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/agents/stats/me')
      .then(({ data }) => setStats(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="agent"><LoadingSpinner size="lg" className="py-20" /></DashboardLayout>;

  return (
    <DashboardLayout role="agent">
      <Helmet><title>Agent Dashboard - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Agent Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Active Listings" value={stats?.activeListings || 0} icon={FiGrid} color="primary" />
        <StatCard title="Total Views" value={stats?.totalViews || 0} icon={FiTrendingUp} color="green" />
        <StatCard title="Appointments" value={stats?.appointments || 0} icon={FiCalendar} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/dashboard/agent/listings" className="card p-6 hover:shadow-md transition">
          <FiGrid className="text-2xl text-primary-600 mb-2" />
          <h3 className="font-semibold">Manage Listings</h3>
          <p className="text-sm text-gray-500 mt-1">View and edit your property listings</p>
        </Link>
        <Link to="/dashboard/agent/appointments" className="card p-6 hover:shadow-md transition">
          <FiCalendar className="text-2xl text-primary-600 mb-2" />
          <h3 className="font-semibold">Appointments</h3>
          <p className="text-sm text-gray-500 mt-1">Manage scheduled viewings</p>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
