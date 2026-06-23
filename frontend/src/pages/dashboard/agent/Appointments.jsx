import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatDate } from '../../../utils/helpers';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', { params: { status: filter || undefined } });
      setAppointments(data.data || []);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      toast.success('Status updated');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <DashboardLayout role="agent">
      <Helmet><title>Appointments - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>

      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48 mb-6">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {loading ? <LoadingSpinner className="py-12" /> : appointments.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">No appointments found</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="card p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Link to={`/properties/${apt.property?._id}`} className="font-semibold hover:text-primary-600">
                    {apt.property?.title || 'Property'}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(apt.date)} at {apt.time}
                  </p>
                  <p className="text-sm text-gray-500">Buyer: {apt.buyer?.name || apt.user?.name || 'N/A'}</p>
                  {apt.notes && <p className="text-sm mt-1">{apt.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${statusColors[apt.status] || statusColors.pending}`}>{apt.status}</span>
                  {apt.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(apt._id, 'approved')} className="btn-primary text-sm py-1.5 px-3">Confirm</button>
                      <button onClick={() => cancelAppointment(apt._id)} className="btn-danger text-sm py-1.5 px-3">Cancel</button>
                    </>
                  )}
                  {apt.status === 'approved' && (
                    <button onClick={() => updateStatus(apt._id, 'completed')} className="btn-secondary text-sm py-1.5 px-3">Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Appointments;
