import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Pagination from '../../../components/common/Pagination';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import { formatPrice, getPropertyImage, statusColors } from '../../../utils/helpers';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/properties/admin/all', {
        params: { page, limit: 10, approvalStatus: statusFilter || undefined },
      });
      setProperties(data.data);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, [page, statusFilter]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/properties/${id}/approve`);
      toast.success('Property approved');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/properties/${rejectModal}/reject`, { reason });
      toast.success('Property rejected');
      setRejectModal(null);
      setReason('');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await api.put(`/properties/${id}/featured`);
      toast.success('Featured status updated');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Manage Properties - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Manage Properties</h1>

      <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-48 mb-6">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? <LoadingSpinner className="py-12" /> : (
        <div className="space-y-4">
          {properties.map((p) => (
            <div key={p._id} className="card p-4 flex flex-col md:flex-row gap-4">
              <img src={getPropertyImage(p)} alt={p.title} className="w-full md:w-40 h-28 object-cover rounded-lg" />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/properties/${p._id}`} className="font-semibold hover:text-primary-600">{p.title}</Link>
                    <p className="text-sm text-gray-500">{p.city} · {formatPrice(p.price)}</p>
                  </div>
                  <span className={`badge ${statusColors[p.approvalStatus] || statusColors.pending}`}>{p.approvalStatus}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Owner: {p.owner?.name}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.approvalStatus === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(p._id)} className="btn-primary text-sm py-1.5 px-3">Approve</button>
                      <button onClick={() => setRejectModal(p._id)} className="btn-danger text-sm py-1.5 px-3">Reject</button>
                    </>
                  )}
                  <button onClick={() => toggleFeatured(p._id)} className="btn-secondary text-sm py-1.5 px-3">
                    {p.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />

      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Property">
        <div className="space-y-4">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Rejection reason..." rows={3} className="input-field" required />
          <button onClick={handleReject} className="btn-danger w-full">Confirm Reject</button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageProperties;
