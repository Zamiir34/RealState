import { useState, useEffect } from 'react';
import { FiUpload, FiX, FiMap } from 'react-icons/fi';
import { propertyTypes, landAreaUnits, resolveImageUrl } from '../../utils/helpers';

export const emptyPropertyForm = {
  title: '',
  description: '',
  price: '',
  propertyType: 'house',
  listingType: 'sale',
  location: '',
  city: '',
  country: '',
  state: '',
  bedrooms: 0,
  bathrooms: 0,
  areaSize: '',
  areaUnit: 'sqft',
  landDimensions: '',
};

const PropertyListingForm = ({
  form,
  setForm,
  onSubmit,
  submitLabel = 'Save Property',
  landOnly = false,
  existingImages = [],
}) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const isLand = landOnly || form.propertyType === 'land';

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  useEffect(() => {
    if (landOnly) {
      setForm((f) => ({ ...f, propertyType: 'land', listingType: 'sale', areaUnit: f.areaUnit || 'acre' }));
    }
  }, [landOnly, setForm]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    images.forEach((file) => formData.append('images', file));
    onSubmit(formData, images);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Land photo upload */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">
          {isLand ? 'Land Photos' : 'Property Photos'}
          {isLand && <span className="text-red-500 ml-1">*</span>}
        </label>

        {existingImages.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {existingImages.map((img, i) => (
              <img key={i} src={resolveImageUrl(img.url)} alt="" className="w-20 h-20 object-cover rounded-xl border" />
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition">
          <FiUpload className="text-2xl text-slate-400 mb-2" />
          <span className="text-sm text-slate-500">Click to upload {isLand ? 'land' : 'property'} photos</span>
          <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP up to 10MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageChange} />
        </label>

        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative">
                <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl" />
                <button type="button" onClick={() => removeNewImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1.5">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field"
          placeholder={isLand ? 'e.g. Prime Residential Plot in Miami' : 'Property title'}
          required
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="input-field"
          placeholder={isLand ? 'Describe the land, soil type, access roads, zoning...' : 'Describe the property'}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Price (USD)</label>
        <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
      </div>

      {!landOnly && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Property Type</label>
          <select value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value, areaUnit: e.target.value === 'land' ? 'acre' : 'sqft' })} className="input-field">
            {propertyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      )}

      {!isLand && (
        <div>
          <label className="block text-sm font-medium mb-1.5">Listing Type</label>
          <select value={form.listingType} onChange={(e) => setForm({ ...form, listingType: e.target.value })} className="input-field">
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>
      )}

      {isLand && (
        <div className="md:col-span-2 flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
          <FiMap className="shrink-0" />
          Land listings are sold only. Upload a clear photo and specify the total land size.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5">City</label>
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Location / Address</label>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Country</label>
        <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">State / Region</label>
        <input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">
          {isLand ? 'Land Size' : 'Area Size'} <span className="text-red-500">*</span>
        </label>
        <input type="number" min="0" step="any" value={form.areaSize} onChange={(e) => setForm({ ...form, areaSize: e.target.value })} className="input-field" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Size Unit</label>
        <select value={form.areaUnit} onChange={(e) => setForm({ ...form, areaUnit: e.target.value })} className="input-field">
          {(isLand ? landAreaUnits : landAreaUnits.filter((u) => ['sqft', 'sqm'].includes(u.value))).map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      {isLand && (
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">Land Dimensions (optional)</label>
          <input
            value={form.landDimensions || ''}
            onChange={(e) => setForm({ ...form, landDimensions: e.target.value })}
            className="input-field"
            placeholder="e.g. 50m × 100m or 200ft × 300ft"
          />
        </div>
      )}

      {!isLand && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bedrooms</label>
            <input type="number" min="0" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Bathrooms</label>
            <input type="number" min="0" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="input-field" />
          </div>
        </>
      )}

      <div className="md:col-span-2">
        <button type="submit" className="btn-primary w-full">{submitLabel}</button>
      </div>
    </form>
  );
};

export default PropertyListingForm;
