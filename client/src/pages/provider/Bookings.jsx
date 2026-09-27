import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl('/api/bookings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      setBookings(await res.json());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    const labels = {
      confirmed: 'confirm this booking',
      completed: 'mark this booking as completed',
      cancelled: 'decline this booking',
    };
    if (!window.confirm(`Are you sure you want to ${labels[status]}?`)) return;
    setUpdatingId(id);
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl(`/api/bookings/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review requests and manage upcoming jobs</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
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
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Customer bookings for your services will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
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
                  Customer: <span className="font-medium text-gray-700 dark:text-gray-300">{booking.customer?.name || 'N/A'}</span>
                  {booking.customer?.email ? ` · ${booking.customer.email}` : ''}
                </p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>📅 {booking.date}</span>
                  <span>🕐 {booking.time}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">💰 {booking.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {booking.status === 'pending' && (
                  <>
                    <button
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, 'confirmed')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, 'cancelled')}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, 'completed')}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                    >
                      Complete
                    </button>
                    <button
                      disabled={updatingId === booking._id}
                      onClick={() => updateStatus(booking._id, 'cancelled')}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <span className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">✓ Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
