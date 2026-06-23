import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMap } from 'react-icons/fi';
import PropertyListingForm, { emptyPropertyForm } from '../../components/property/PropertyListingForm';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const landFormDefaults = {
  ...emptyPropertyForm,
  propertyType: 'land',
  listingType: 'sale',
  areaUnit: 'acre',
};

const SellLandPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(landFormDefaults);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Land listing submitted! It will appear after admin approval.');
      navigate('/properties?propertyType=land');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to list land');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet><title>Sell Land — RealP Estate</title></Helmet>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-surface-900 dark:to-surface-950 border-b border-amber-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white mb-4">
            <FiMap size={28} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Sell Your Land</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            List your land for sale. Upload a photo and enter the land size — we&apos;ll handle the rest.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="card p-6 md:p-8">
          <PropertyListingForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            submitLabel={submitting ? 'Submitting...' : 'List Land for Sale'}
            landOnly
          />
        </div>
      </div>
    </>
  );
};

export default SellLandPage;
