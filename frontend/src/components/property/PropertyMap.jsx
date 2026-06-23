import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { FiMapPin } from 'react-icons/fi';

const mapContainerStyle = { width: '100%', height: '100%', minHeight: '300px', borderRadius: '0.75rem' };
const defaultCenter = { lat: 40.7128, lng: -74.006 };

const PropertyMap = ({ latitude, longitude, title, className = '' }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const center = latitude && longitude
    ? { lat: Number(latitude), lng: Number(longitude) }
    : defaultCenter;

  if (!apiKey) {
    return (
      <div className={`relative bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center ${className}`} style={{ minHeight: 300 }}>
        <div className="text-center p-6">
          <FiMapPin className="text-4xl text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">{title || 'Property Location'}</p>
          {latitude && longitude && (
            <p className="text-sm text-gray-400 mt-1">{latitude}, {longitude}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">Add VITE_GOOGLE_MAPS_API_KEY to enable map</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden ${className}`} style={{ minHeight: 300 }}>
      <LoadScript googleMapsApiKey={apiKey}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
          <Marker position={center} title={title} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default PropertyMap;
