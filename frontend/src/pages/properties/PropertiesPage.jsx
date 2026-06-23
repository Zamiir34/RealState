import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { fetchProperties } from '../../store/slices/propertySlice';
import api from '../../api/axios';
import PropertyCard from '../../components/property/PropertyCard';
import PropertyFilters from '../../components/property/PropertyFilters';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiSearch } from 'react-icons/fi';

const defaultFilters = { page: 1, limit: 12, sort: '-createdAt' };

const PropertiesPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading, pages, total } = useSelector((state) => state.property);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    listingType: searchParams.get('listingType') || '',
    search: searchParams.get('search') || '',
  }));

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCategories(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = { ...filters };
    if (params.amenities?.length) params.amenities = params.amenities.join(',');
    Object.keys(params).forEach((k) => { if (!params[k] && params[k] !== 0) delete params[k]; });
    dispatch(fetchProperties(params));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const sp = new URLSearchParams();
    if (newFilters.listingType) sp.set('listingType', newFilters.listingType);
    if (newFilters.search) sp.set('search', newFilters.search);
    setSearchParams(sp);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchParams({});
  };

  return (
    <>
      <Helmet><title>Properties - RealP Estate</title></Helmet>
      <div className="bg-white dark:bg-surface-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-2">Browse</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Find your perfect property</h1>
          <p className="text-slate-500 mt-2">{total} properties available</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 shrink-0">
            <PropertyFilters filters={filters} onChange={handleFilterChange} onReset={handleReset} categories={categories} />
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange({ ...filters, search: e.target.value, page: 1 })}
                  placeholder="Quick search..."
                  className="input-field pl-10"
                />
              </div>
              <select
                value={filters.sort || '-createdAt'}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value, page: 1 })}
                className="input-field sm:w-48"
              >
                <option value="-createdAt">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-views">Most Viewed</option>
              </select>
            </div>

            {loading ? (
              <LoadingSpinner size="lg" className="py-20" />
            ) : properties.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No properties found</p>
                <button onClick={handleReset} className="btn-primary mt-4">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
                </div>
                <Pagination
                  currentPage={filters.page}
                  totalPages={pages}
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertiesPage;
