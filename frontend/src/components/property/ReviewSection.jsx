import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiStar } from 'react-icons/fi';
import api from '../../api/axios';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const ReviewSection = ({ propertyId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/property/${propertyId}`);
        setReviews(data.data || []);
      } catch {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [propertyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', {
        property: propertyId,
        rating: form.rating,
        comment: form.comment,
      });
      setReviews((prev) => [data.data, ...prev]);
      setForm({ rating: 5, comment: '' });
      toast.success('Review submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <LoadingSpinner className="py-8" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-semibold">Reviews</h3>
        <div className="flex items-center gap-1 text-amber-500">
          <FiStar className="fill-amber-500" />
          <span className="font-semibold">{avgRating}</span>
          <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="input-field w-32">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </div>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Share your experience..."
            rows={3}
            className="input-field"
            required
          />
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-medium">
                    {review.user?.name?.[0] || 'U'}
                  </div>
                  <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FiStar key={i} className="fill-amber-500 text-sm" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
              <p className="text-xs text-gray-400 mt-2">{formatDate(review.createdAt)}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
