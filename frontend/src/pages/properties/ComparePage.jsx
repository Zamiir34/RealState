import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { FiX, FiLayers } from 'react-icons/fi';
import { removeFromCompare, clearCompare } from '../../store/slices/propertySlice';
import { formatPrice, getPropertyImage } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ComparePage = () => {
  const dispatch = useDispatch();
  const { compareList } = useSelector((state) => state.property);

  const handleRemove = (id) => {
    dispatch(removeFromCompare(id));
    toast.success('Removed from compare');
  };

  const fields = [
    { key: 'price', label: 'Price', render: (p) => formatPrice(p.price, p.currency) },
    { key: 'propertyType', label: 'Type', render: (p) => p.propertyType },
    { key: 'listingType', label: 'Listing', render: (p) => p.listingType },
    { key: 'bedrooms', label: 'Bedrooms', render: (p) => p.bedrooms },
    { key: 'bathrooms', label: 'Bathrooms', render: (p) => p.bathrooms },
    { key: 'areaSize', label: 'Area', render: (p) => `${p.areaSize} ${p.areaUnit}` },
    { key: 'city', label: 'City', render: (p) => p.city },
    { key: 'status', label: 'Status', render: (p) => p.status },
  ];

  return (
    <>
      <Helmet><title>Compare Properties - RealP Estate</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><FiLayers /> Compare Properties</h1>
            <p className="text-gray-500 mt-1">Compare up to 4 properties side by side</p>
          </div>
          {compareList.length > 0 && (
            <button onClick={() => { dispatch(clearCompare()); toast.success('Compare list cleared'); }} className="btn-secondary">
              Clear All
            </button>
          )}
        </div>

        {compareList.length === 0 ? (
          <div className="card p-12 text-center">
            <FiLayers className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No properties to compare</p>
            <Link to="/properties" className="btn-primary">Browse Properties</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full card">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="p-4 text-left font-medium text-gray-500 w-40">Feature</th>
                  {compareList.map((p) => (
                    <th key={p._id} className="p-4 min-w-[200px]">
                      <div className="relative">
                        <button onClick={() => handleRemove(p._id)} className="absolute -top-1 -right-1 p-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-red-100">
                          <FiX />
                        </button>
                        <Link to={`/properties/${p._id}`}>
                          <img src={getPropertyImage(p)} alt={p.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                          <p className="font-semibold text-sm line-clamp-2 hover:text-primary-600">{p.title}</p>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-500">{field.label}</td>
                    {compareList.map((p) => (
                      <td key={p._id} className="p-4 text-center capitalize">{field.render(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default ComparePage;
