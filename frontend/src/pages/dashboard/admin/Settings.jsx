import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import api from '../../../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSettings(data.data || {}))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout role="admin"><LoadingSpinner className="py-20" /></DashboardLayout>;

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Settings - RealP Estate</title></Helmet>
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Site Name</label>
          <input value={settings.siteName || ''} onChange={(e) => handleChange('siteName', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Contact Email</label>
          <input type="email" value={settings.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Contact Phone</label>
          <input value={settings.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Default Currency</label>
          <select value={settings.defaultCurrency || 'USD'} onChange={(e) => handleChange('defaultCurrency', e.target.value)} className="input-field">
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Commission Rate (%)</label>
          <input type="number" value={settings.commissionRate || ''} onChange={(e) => handleChange('commissionRate', e.target.value)} className="input-field" min="0" max="100" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="maintenance" checked={settings.maintenanceMode || false} onChange={(e) => handleChange('maintenanceMode', e.target.checked)} className="rounded" />
          <label htmlFor="maintenance" className="text-sm">Maintenance Mode</label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </DashboardLayout>
  );
};

export default Settings;
