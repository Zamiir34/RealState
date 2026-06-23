import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiHeart } from 'react-icons/fi';
import { fetchFavorites } from '../../store/slices/propertySlice';
import PropertyCard from '../../components/property/PropertyCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { favorites, loading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  return (
    <>
      <Helmet><title>Favorites - RealP Estate</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-8">
          <FiHeart className="text-red-500" /> My Favorites
        </h1>

        {loading ? (
          <LoadingSpinner size="lg" className="py-20" />
        ) : favorites.length === 0 ? (
          <div className="card p-12 text-center">
            <FiHeart className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No favorites yet</p>
            <Link to="/properties" className="btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
        )}
      </div>
    </>
  );
};

export default FavoritesPage;
