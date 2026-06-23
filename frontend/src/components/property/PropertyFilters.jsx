import { propertyTypes, amenitiesList } from '../../utils/helpers';

const PropertyFilters = ({ filters, onChange, onReset, categories = [] }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="card p-5 space-y-5 sticky top-24">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button onClick={onReset} className="text-sm text-primary-600 hover:underline">Reset</button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Search</label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="City, location, keyword..."
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Listing Type</label>
        <select value={filters.listingType || ''} onChange={(e) => handleChange('listingType', e.target.value)} className="input-field">
          <option value="">All</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Property Type</label>
        <select value={filters.propertyType || ''} onChange={(e) => handleChange('propertyType', e.target.value)} className="input-field">
          <option value="">All Types</option>
          {propertyTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select value={filters.category || ''} onChange={(e) => handleChange('category', e.target.value)} className="input-field">
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5">Min Price</label>
          <input type="number" value={filters.minPrice || ''} onChange={(e) => handleChange('minPrice', e.target.value)} className="input-field" placeholder="0" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Max Price</label>
          <input type="number" value={filters.maxPrice || ''} onChange={(e) => handleChange('maxPrice', e.target.value)} className="input-field" placeholder="Any" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5">Bedrooms</label>
          <select value={filters.bedrooms || ''} onChange={(e) => handleChange('bedrooms', e.target.value)} className="input-field">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Bathrooms</label>
          <select value={filters.bathrooms || ''} onChange={(e) => handleChange('bathrooms', e.target.value)} className="input-field">
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.amenities || []).includes(amenity)}
                onChange={(e) => {
                  const current = filters.amenities || [];
                  const updated = e.target.checked
                    ? [...current, amenity]
                    : current.filter((a) => a !== amenity);
                  handleChange('amenities', updated);
                }}
                className="rounded text-primary-600"
              />
              <span className="capitalize">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;
