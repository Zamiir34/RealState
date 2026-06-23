import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiGrid, FiEye } from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import api from '../../../api/axios';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({ listings: 0, views: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/properties/my/listings')
      .then(({ data }) => {
        const props = data.data || [];
        setStats({
          listings: props.length,
          views: props.reduce((sum, p) => sum + (p.views || 0), 0),
          inquiries: props.reduce((sum, p) => sum + (p.inquiries || 0), 0),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout role="owner"><LoadingSpinner size="lg" className="py-20" /></DashboardLayout>;

  return (
    <DashboardLayout role="owner">
      <Helmet><title>Owner Dashboard - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="My Properties" value={stats.listings} icon={FiGrid} color="primary" />
        <StatCard title="Total Views" value={stats.views} icon={FiEye} color="green" />
        <StatCard title="Inquiries" value={stats.inquiries} color="amber" />
      </div>

      <Link to="/dashboard/owner/properties" className="card p-6 inline-block hover:shadow-md transition">
        <FiGrid className="text-2xl text-primary-600 mb-2" />
        <h3 className="font-semibold">Manage My Properties</h3>
        <p className="text-sm text-gray-500 mt-1">View, edit, and add property listings</p>
      </Link>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
