import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Pagination from '../../../components/common/Pagination';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/helpers';

const ManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filter, setFilter] = useState('');

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter === 'pending') params.isApproved = false;
      if (filter === 'approved') params.isApproved = true;
      const { data } = await api.get('/agents', { params });
      setAgents(data.data || []);
      setPages(data.pages || 1);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAgents(); }, [page, filter]);

  const handleApprove = async (id) => {
    try {
      await api.put(`/agents/${id}/approve`);
      toast.success('Agent approved');
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve agent');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Manage Agents - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Manage Agents</h1>

      <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }} className="input-field w-48 mb-6">
        <option value="">All Agents</option>
        <option value="pending">Pending Approval</option>
        <option value="approved">Approved</option>
      </select>

      {loading ? <LoadingSpinner className="py-12" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Agent</th>
                <th className="text-left p-4">License</th>
                <th className="text-left p-4">Experience</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent._id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-4">
                    <p className="font-medium">{agent.user?.name || 'N/A'}</p>
                    <p className="text-gray-500 text-xs">{agent.user?.email}</p>
                  </td>
                  <td className="p-4">{agent.licenseNumber || '-'}</td>
                  <td className="p-4">{agent.yearsOfExperience || 0} years</td>
                  <td className="p-4">
                    <span className={`badge ${agent.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {agent.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(agent.createdAt)}</td>
                  <td className="p-4 text-right">
                    {!agent.isApproved && (
                      <button onClick={() => handleApprove(agent._id)} className="text-primary-600 hover:underline">Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
    </DashboardLayout>
  );
};

export default ManageAgents;
