import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

export default function ProviderReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(apiUrl(`/api/reviews/provider/${user?._id}`));
        if (!response.ok) throw new Error('Failed to load reviews');
        setReviews(await response.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchReviews();
  }, [user?._id]);

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Reviews</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">See feedback from customers who completed your services</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">★ {averageRating}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{reviews.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <p className="text-gray-500 dark:text-gray-400">No customer reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{review.customer?.name || 'Customer'}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-yellow-500" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
