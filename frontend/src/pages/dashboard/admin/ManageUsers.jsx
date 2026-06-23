import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Pagination from '../../../components/common/Pagination';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, search, role: roleFilter, limit: 10 } });
      setUsers(data.data);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const toggleStatus = async (id) => {
    try {
      await api.put(`/users/${id}/toggle-status`);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    try {
      await api.put(`/users/${editUser._id}`, {
        name: form.get('name'),
        role: form.get('role'),
        phone: form.get('phone'),
      });
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Manage Users - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field sm:max-w-xs" />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="input-field sm:w-40">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="owner">Owner</option>
          <option value="buyer">Buyer</option>
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-12" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    <span className={`badge ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(user.createdAt)}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditUser(user)} className="text-primary-600 hover:underline">Edit</button>
                    <button onClick={() => toggleStatus(user._id)} className="text-amber-600 hover:underline">Toggle</button>
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input name="name" defaultValue={editUser.name} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input name="phone" defaultValue={editUser.phone || ''} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Role</label>
              <select name="role" defaultValue={editUser.role} className="input-field">
                <option value="buyer">Buyer</option>
                <option value="owner">Owner</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default ManageUsers;
