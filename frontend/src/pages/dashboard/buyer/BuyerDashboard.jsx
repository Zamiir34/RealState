import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiCalendar, FiLayers } from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/common/StatCard';
import PropertyCard from '../../../components/property/PropertyCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { fetchFavorites } from '../../../store/slices/propertySlice';
import api from '../../../api/axios';

const BuyerDashboard = () => {
  const dispatch = useDispatch();
  const { favorites, compareList, loading } = useSelector((state) => state.property);
  const [appointments, setAppointments] = useState(0);

  useEffect(() => {
    dispatch(fetchFavorites());
    api.get('/appointments', { params: { status: 'pending' } })
      .then(({ data }) => setAppointments(data.data?.length || 0))
      .catch(() => {});
  }, [dispatch]);

  return (
    <DashboardLayout role="buyer">
      <Helmet><title>Buyer Dashboard - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Buyer Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Favorites" value={favorites.length} icon={FiHeart} color="red" />
        <StatCard title="Compare List" value={compareList.length} icon={FiLayers} color="primary" />
        <StatCard title="Pending Visits" value={appointments} icon={FiCalendar} color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/properties" className="card p-4 text-center hover:shadow-md transition font-medium text-primary-600">Browse Properties</Link>
        <Link to="/favorites" className="card p-4 text-center hover:shadow-md transition font-medium text-primary-600">My Favorites</Link>
        <Link to="/compare" className="card p-4 text-center hover:shadow-md transition font-medium text-primary-600">Compare Properties</Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Favorites</h2>
      {loading ? <LoadingSpinner /> : favorites.length === 0 ? (
        <p className="text-gray-500">No favorites yet. <Link to="/properties" className="text-primary-600 hover:underline">Start browsing</Link></p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.slice(0, 3).map((p) => <PropertyCard key={p._id} property={p} />)}
        </div>
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;
