import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiDownload } from 'react-icons/fi';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../../utils/helpers';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('properties');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const endpoints = {
    properties: '/reports/properties',
    sales: '/reports/sales',
    rentals: '/reports/rentals',
    agents: '/reports/agents',
    revenue: '/reports/revenue',
  };

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(endpoints[activeTab]);
        setData(res.data || []);
      } catch {
        toast.error('Failed to load report');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [activeTab]);

  const handleExport = (format) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    window.open(`${base}${endpoints[activeTab]}?format=${format}`, '_blank');
  };

  const tabs = [
    { key: 'properties', label: 'Properties' },
    { key: 'sales', label: 'Sales' },
    { key: 'rentals', label: 'Rentals' },
    { key: 'agents', label: 'Agents' },
    { key: 'revenue', label: 'Revenue' },
  ];

  return (
    <DashboardLayout role="admin">
      <Helmet><title>Reports - RealP Estate</title></Helmet>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          <button onClick={() => handleExport('pdf')} className="btn-secondary text-sm flex items-center gap-1"><FiDownload /> PDF</button>
          <button onClick={() => handleExport('excel')} className="btn-secondary text-sm flex items-center gap-1"><FiDownload /> Excel</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner className="py-12" /> : (
        <div className="card overflow-x-auto">
          {data.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No data available</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {Object.keys(data[0]).filter((k) => k !== '_id').map((key) => (
                    <th key={key} className="text-left p-4 capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row._id || i} className="border-b border-gray-100 dark:border-gray-700">
                    {Object.entries(row).filter(([k]) => k !== '_id').map(([key, val]) => (
                      <td key={key} className="p-4">
                        {key === 'price' || key === 'amount' || key === 'revenue' ? formatPrice(val || 0) : String(val ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
