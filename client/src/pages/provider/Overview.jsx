import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const parsePrice = (price) => Number(String(price || '').replace(/[^0-9.]/g, '')) || 0;

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

export default function ProviderOverview() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = Cookies.get('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [bookingsRes, servicesRes] = await Promise.all([
          fetch(apiUrl('/api/bookings'), { headers }),
          fetch(apiUrl('/api/services/mine'), { headers }),
        ]);
        if (!bookingsRes.ok) throw new Error('Failed to load bookings');
        if (!servicesRes.ok) throw new Error('Failed to load services');
        setBookings(await bookingsRes.json());
        setServices(await servicesRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pending = bookings.filter((b) => b.status === 'pending');
  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const completed = bookings.filter((b) => b.status === 'completed');
  const earnings = completed.reduce((sum, b) => sum + parsePrice(b.price), 0);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'Provider'}!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your services, bookings, and earnings</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Services</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{services.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pending.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed Jobs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{completed.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${earnings.toFixed(0)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Bookings</h2>
          <Link to="/provider-dashboard/bookings" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View All →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">No upcoming bookings yet</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcoming.slice(0, 5).map((booking) => (
              <div key={booking._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{booking.serviceName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer: {booking.customer?.name || 'N/A'}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{booking.date} at {booking.time}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{booking.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/provider-dashboard/services" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center">
              <div className="text-2xl mb-1">🔧</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">My Services</p>
            </Link>
            <Link to="/provider-dashboard/bookings" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center">
              <div className="text-2xl mb-1">📅</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Bookings</p>
            </Link>
            <Link to="/provider-dashboard/earnings" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center">
              <div className="text-2xl mb-1">💰</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Earnings</p>
            </Link>
            <Link to="/provider-dashboard/profile" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center">
              <div className="text-2xl mb-1">👤</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Edit Profile</p>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Services</h2>
          {services.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">You have not listed any services yet.</p>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 4).map((service) => (
                <div key={service._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{service.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{service.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
