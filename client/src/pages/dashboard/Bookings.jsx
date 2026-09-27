import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl('/api/bookings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl(`/api/bookings/${id}/cancel`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setReviewSubmitting(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl(`/api/reviews/booking/${reviewingBooking._id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: 'Review service is unavailable. Please restart the backend server.' };
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      setReviewingBooking(null);
      setReviewComment('');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your service bookings</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No {filter !== 'all' ? filter : ''} bookings found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Your bookings will appear here once you book a service</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <div
              key={booking._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{booking.serviceName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Provider: <span className="font-medium text-gray-700 dark:text-gray-300">{booking.provider?.name || 'N/A'}</span>
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    📅 {booking.date}
                  </span>
                  <span className="flex items-center gap-1">
                    🕐 {booking.time}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                    💰 {booking.price}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                {booking.status === 'completed' && !booking.reviewed && (
                  <button
                    onClick={() => {
                      setReviewingBooking(booking);
                      setReviewRating(5);
                      setReviewComment('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    Write Review
                  </button>
                )}
                {booking.status === 'completed' && booking.reviewed && (
                  <span className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                    ✓ Reviewed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReviewingBooking(null)} />
          <form onSubmit={submitReview} className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Write a Review</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{reviewingBooking.serviceName} with {reviewingBooking.provider?.name || 'your provider'}</p>
              </div>
              <button type="button" onClick={() => setReviewingBooking(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex gap-1 mb-5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewRating(value)}
                  className={`text-3xl ${value <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                  aria-label={`${value} stars`}
                >★</button>
              ))}
            </div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your review</label>
            <textarea
              id="review-comment"
              required
              maxLength={1000}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              rows={4}
              placeholder="How was your experience?"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button type="button" onClick={() => setReviewingBooking(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
              <button type="submit" disabled={reviewSubmitting} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
