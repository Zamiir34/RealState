import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';
import PropertyListingForm, { emptyPropertyForm } from '../../../components/property/PropertyListingForm';
import { formatPrice, getPropertyImage, formatLandSize, isLandProperty } from '../../../utils/helpers';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyPropertyForm);
  const [editId, setEditId] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/properties/my/listings');
      setProperties(data.data || []);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleSubmit = async (formData) => {
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editId) {
        await api.put(`/properties/${editId}`, formData, config);
        toast.success('Property updated');
      } else {
        await api.post('/properties', formData, config);
        toast.success('Property listed');
      }
      setModal(false);
      setForm(emptyPropertyForm);
      setEditId(null);
      setExistingImages([]);
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setForm({
      ...emptyPropertyForm,
      title: p.title,
      description: p.description,
      price: p.price,
      propertyType: p.propertyType,
      listingType: p.listingType,
      location: p.location,
      city: p.city,
      country: p.country,
      state: p.state || '',
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      areaSize: p.areaSize,
      areaUnit: p.areaUnit || 'sqft',
      landDimensions: p.landDimensions || '',
    });
    setExistingImages(p.images || []);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted');
      fetchProperties();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <DashboardLayout role="owner">
      <Helmet><title>My Properties - RealP Estate</title></Helmet>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <div className="flex gap-2">
          <Link to="/sell-land" className="btn-secondary text-sm">Sell Land</Link>
          <button onClick={() => { setEditId(null); setForm(emptyPropertyForm); setExistingImages([]); setModal(true); }} className="btn-primary text-sm">Add Property</button>
        </div>
      </div>

      {loading ? <LoadingSpinner className="py-12" /> : properties.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <p>No properties listed yet.</p>
          <Link to="/sell-land" className="btn-primary mt-4 inline-flex">Sell Land</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => (
            <div key={p._id} className="card overflow-hidden">
              <img src={getPropertyImage(p)} alt={p.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  {isLandProperty(p) && <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Land</span>}
                  <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800">{p.approvalStatus}</span>
                </div>
                <Link to={`/properties/${p._id}`} className="font-semibold hover:text-primary-600">{p.title}</Link>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPrice(p.price)}
                  {isLandProperty(p) && ` · ${formatLandSize(p.areaSize, p.areaUnit)}`}
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(p)} className="btn-secondary text-sm py-1.5 px-3">Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editId ? 'Edit Property' : 'Add Property'} size="lg">
        <PropertyListingForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          submitLabel={editId ? 'Update Property' : 'List Property'}
          existingImages={existingImages}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default MyProperties;
