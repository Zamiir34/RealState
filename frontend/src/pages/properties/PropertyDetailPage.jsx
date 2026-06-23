import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  FiMapPin, FiMaximize, FiCalendar, FiMail, FiPhone, FiHeart, FiLayers,
} from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import { fetchProperty, clearProperty, toggleFavorite, addToCompare } from '../../store/slices/propertySlice';
import { formatPrice, getPropertyImage, statusColors, propertyTypes, formatLandSize, isLandProperty, resolveImageUrl } from '../../utils/helpers';
import PropertyMap from '../../components/property/PropertyMap';
import ReviewSection from '../../components/property/ReviewSection';
import PropertyCard from '../../components/property/PropertyCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { property, favorites } = useSelector((state) => state.property);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [visitModal, setVisitModal] = useState(false);
  const [contactForm, setContactForm] = useState({ message: '' });
  const [visitForm, setVisitForm] = useState({ date: '', time: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchProperty(id))
      .finally(() => setLoading(false));
    api.get(`/properties/${id}/similar`).then(({ data }) => setSimilar(data.data || [])).catch(() => {});
    return () => dispatch(clearProperty());
  }, [dispatch, id]);

  const isFavorite = favorites.some((f) => f._id === id);

  const handleFavorite = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await dispatch(toggleFavorite(id)).unwrap();
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch { toast.error('Failed to update favorite'); }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    setSubmitting(true);
    try {
      await api.post(`/properties/${id}/inquiry`, contactForm);
      toast.success('Inquiry sent successfully');
      setContactForm({ message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        property: id,
        date: visitForm.date,
        time: visitForm.time,
        notes: visitForm.notes,
      });
      toast.success('Visit scheduled successfully');
      setVisitModal(false);
      setVisitForm({ date: '', time: '', notes: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule visit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !property) return <LoadingSpinner size="lg" className="min-h-screen" />;

  const images = property.images?.length
    ? property.images.map((img) => ({ ...img, url: resolveImageUrl(img.url) }))
    : [{ url: getPropertyImage(property) }];
  const typeLabel = propertyTypes.find((t) => t.value === property.propertyType)?.label || property.propertyType;
  const land = isLandProperty(property);

  return (
    <>
      <Helmet><title>{property.title} - RealP Estate</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card overflow-hidden">
              <img src={images[activeImage]?.url} alt={property.title} className="w-full aspect-[16/9] object-cover" />
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-primary-600' : 'border-transparent'}`}>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${statusColors[property.status]}`}>{property.status}</span>
                    <span className={`badge ${land ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-gray-100 dark:bg-gray-700'}`}>{typeLabel}</span>
                    {!land && property.listingType === 'rent' && <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">For Rent</span>}
                    {land && <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">For Sale</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">{property.title}</h1>
                  <p className="text-gray-500 flex items-center gap-1 mt-2"><FiMapPin /> {property.location}, {property.city}, {property.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">{formatPrice(property.price, property.currency)}</p>
                  {property.listingType === 'rent' && <span className="text-gray-500">/month</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200 dark:border-gray-700">
                {land ? (
                  <>
                    <span className="flex items-center gap-2 font-semibold text-primary-600">
                      <FiMaximize /> {formatLandSize(property.areaSize, property.areaUnit)}
                    </span>
                    {property.landDimensions && (
                      <span className="flex items-center gap-2 text-slate-600">Dimensions: {property.landDimensions}</span>
                    )}
                  </>
                ) : (
                  <>
                    {property.bedrooms > 0 && <span className="flex items-center gap-2"><FaBed /> {property.bedrooms} Bedrooms</span>}
                    {property.bathrooms > 0 && <span className="flex items-center gap-2"><FaBath /> {property.bathrooms} Bathrooms</span>}
                    <span className="flex items-center gap-2"><FiMaximize /> {property.areaSize} {property.areaUnit}</span>
                  </>
                )}
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{property.description}</p>
              </div>

              {property.amenities?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <span key={a} className="badge bg-gray-100 dark:bg-gray-700 capitalize">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <PropertyMap latitude={property.latitude} longitude={property.longitude} title={property.title} className="h-80" />
            <ReviewSection propertyId={id} />
          </div>

          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <div className="flex gap-2 mb-4">
                <button onClick={handleFavorite} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <FiHeart className={isFavorite ? 'text-red-500 fill-red-500' : ''} /> Favorite
                </button>
                <button onClick={() => { dispatch(addToCompare(property)); toast.success('Added to compare'); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                  <FiLayers /> Compare
                </button>
              </div>
              <button onClick={() => setVisitModal(true)} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
                <FiCalendar /> Schedule Visit
              </button>

              {property.agent?.user && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                  <h3 className="font-semibold mb-2">Agent</h3>
                  <p className="font-medium">{property.agent.user.name}</p>
                  {property.agent.user.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><FiPhone /> {property.agent.user.phone}</p>
                  )}
                  {property.agent.user.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1"><FiMail /> {property.agent.user.email}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleInquiry} className="space-y-3">
                <h3 className="font-semibold">Contact Agent</h3>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ message: e.target.value })}
                  placeholder="I'm interested in this property..."
                  rows={4}
                  className="input-field"
                  required
                />
                <button type="submit" disabled={submitting} className="btn-primary w-full">Send Inquiry</button>
              </form>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>
          </section>
        )}
      </div>

      <Modal isOpen={visitModal} onClose={() => setVisitModal(false)} title="Schedule a Visit">
        <form onSubmit={handleScheduleVisit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Date</label>
            <input type="date" value={visitForm.date} onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })} required className="input-field" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Time</label>
            <input type="time" value={visitForm.time} onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })} rows={3} className="input-field" placeholder="Any special requests..." />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">Confirm Visit</button>
        </form>
      </Modal>
    </>
  );
};

export default PropertyDetailPage;
