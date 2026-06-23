import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiHome } from 'react-icons/fi';

const HeroSearch = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [listingType, setListingType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (listingType) params.set('listingType', listingType);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="card-glass p-2 md:p-3 max-w-3xl animate-fade-up animate-delay-300 opacity-0">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="City, neighborhood, or keyword..."
            className="w-full pl-11 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-surface-900 dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-40">
            <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-surface-800/50 rounded-xl outline-none appearance-none cursor-pointer border border-slate-200/50 dark:border-slate-700"
            >
              <option value="">All Types</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap px-8">
            <FiMapPin className="md:hidden" />
            <span className="hidden md:inline">Search</span>
            <span className="md:hidden">Go</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeroSearch;
