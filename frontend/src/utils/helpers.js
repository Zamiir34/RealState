export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const landAreaUnits = [
  { value: 'acre', label: 'Acres' },
  { value: 'hectare', label: 'Hectares' },
  { value: 'sqm', label: 'Square Meters' },
  { value: 'sqft', label: 'Square Feet' },
];

export const formatLandSize = (size, unit = 'acre') => {
  const labels = { acre: 'acres', hectare: 'hectares', sqm: 'sq m', sqft: 'sq ft' };
  return `${Number(size).toLocaleString()} ${labels[unit] || unit}`;
};

export const resolveImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  return url.startsWith('/') ? `${apiBase}${url}` : url;
};

export const getPropertyImage = (property) => {
  if (property?.images?.length > 0) {
    return resolveImageUrl(property.images[0].url);
  }

  if (property?.propertyType === 'land') {
    return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';
  }
  return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
};

export const isLandProperty = (property) => property?.propertyType === 'land';

export const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'condo', label: 'Condo' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
];

export const amenitiesList = [
  'pool', 'gym', 'parking', 'garden', 'security', 'smart-home',
  'fireplace', 'garage', 'elevator', 'balcony', 'furnished',
];

export const statusColors = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  sold: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  rented: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'off-market': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export const getDashboardPath = (role) => {
  const paths = { admin: '/dashboard/admin', agent: '/dashboard/agent', owner: '/dashboard/owner', buyer: '/dashboard/buyer' };
  return paths[role] || '/';
};
