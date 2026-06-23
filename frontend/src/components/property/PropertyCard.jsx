import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiLayers, FiMapPin, FiMaximize, FiArrowUpRight } from 'react-icons/fi';
import { FaBed, FaBath } from 'react-icons/fa';
import { formatPrice, getPropertyImage, statusColors, formatLandSize, isLandProperty } from '../../utils/helpers';
import { toggleFavorite, addToCompare, removeFromCompare } from '../../store/slices/propertySlice';
import toast from 'react-hot-toast';

const PropertyCard = ({ property, showFavorite = true }) => {
  const dispatch = useDispatch();
  const { favorites, compareList } = useSelector((state) => state.property);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isFavorite = favorites.some((f) => f._id === property._id);
  const isCompared = compareList.some((p) => p._id === property._id);

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to save favorites'); return; }
    try {
      await dispatch(toggleFavorite(property._id)).unwrap();
      toast.success(isFavorite ? 'Removed from favorites' : 'Saved to favorites');
    } catch { toast.error('Failed to update favorite'); }
  };

  const handleCompare = (e) => {
    e.preventDefault();
    if (isCompared) {
      dispatch(removeFromCompare(property._id));
      toast.success('Removed from compare');
    } else if (compareList.length >= 4) {
      toast.error('Compare up to 4 properties');
    } else {
      dispatch(addToCompare(property));
      toast.success('Added to compare');
    }
  };

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group card overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={getPropertyImage(property)}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-3 left-3 flex gap-2">
          {property.isFeatured && (
            <span className="badge bg-accent-500 text-white shadow-lg">Featured</span>
          )}
          <span className={`badge backdrop-blur-md ${statusColors[property.status] || statusColors.available}`}>
            {property.status}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {showFavorite && (
            <button
              onClick={handleFavorite}
              className="p-2.5 rounded-xl bg-white/90 hover:bg-white shadow-lg backdrop-blur"
              aria-label="Favorite"
            >
              <FiHeart className={isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-600'} />
            </button>
          )}
          <button
            onClick={handleCompare}
            className={`p-2.5 rounded-xl bg-white/90 hover:bg-white shadow-lg backdrop-blur ${isCompared ? 'text-primary-600' : 'text-slate-600'}`}
            aria-label="Compare"
          >
            <FiLayers />
          </button>
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="bg-white/95 dark:bg-surface-900/95 backdrop-blur text-surface-900 dark:text-white px-3 py-1.5 rounded-xl font-display font-bold text-lg shadow-lg">
            {formatPrice(property.price, property.currency)}
            {property.listingType === 'rent' && <span className="text-sm font-normal text-slate-500">/mo</span>}
          </span>
          <span className="p-2 rounded-xl bg-primary-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <FiArrowUpRight />
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1.5">
          <FiMapPin className="shrink-0 text-primary-500" /> {property.city}, {property.country}
        </p>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
          {isLandProperty(property) ? (
            <span className="flex items-center gap-1.5 font-medium text-primary-600">
              <FiMaximize className="text-primary-500" /> {formatLandSize(property.areaSize, property.areaUnit)}
            </span>
          ) : (
            <>
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1.5"><FaBed className="text-primary-500" /> {property.bedrooms}</span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1.5"><FaBath className="text-primary-500" /> {property.bathrooms}</span>
              )}
              <span className="flex items-center gap-1.5"><FiMaximize className="text-primary-500" /> {property.areaSize} {property.areaUnit}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
