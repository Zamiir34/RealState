import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '' });
    setModal(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        await api.post('/admin/categories', form);
        toast.success('Category created');
      } else {
        await api.put(`/admin/categories/${modal._id}`, form);
        toast.success('Category updated');
      }
      setModal(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Manage Categories - RealP Estate</title></Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Categories</h1>
        <button onClick={openCreate} className="btn-primary">Add Category</button>
      </div>

      {loading ? <LoadingSpinner className="py-12" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-4">
              <h3 className="font-semibold text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.description || 'No description'}</p>
              <p className="text-xs text-gray-400 mt-2">Slug: {cat.slug}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(cat)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                <button onClick={() => handleDelete(cat._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Category' : 'Edit Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageCategories;
