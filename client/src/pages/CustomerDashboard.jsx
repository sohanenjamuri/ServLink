import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';
import { apiUrl } from '../config/api';

const parsePrice = (price) => Number(String(price || '').replace(/[^0-9.]/g, '')) || 0;

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('default', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(apiUrl('/api/bookings'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load bookings');
        setBookings(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const activeBookings = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalSpent = completedBookings.reduce(
    (sum, b) => sum + parsePrice(b.price),
    0
  );
  const reviewsWritten = user?.reviews ? Number(user.reviews) || 0 : 0;
  const upcoming = bookings
    .filter((b) => b.status === 'pending' || b.status === 'confirmed')
    .sort((a, b) => {
      const ad = new Date(`${a.date}T${a.time}`);
      const bd = new Date(`${b.date}T${b.time}`);
      return ad.getTime() - bd.getTime();
    })
    .slice(0, 5);

  const recentActivity = bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map((b) => {
      let label = 'Booked';
      let icon = '📅';
      let color = 'bg-blue-100 text-blue-600';
      if (b.status === 'completed') {
        label = 'Completed';
        icon = '✅';
        color = 'bg-green-100 text-green-600';
      } else if (b.status === 'cancelled') {
        label = 'Cancelled';
        icon = '❌';
        color = 'bg-red-100 text-red-600';
      } else if (b.status === 'confirmed') {
        label = 'Confirmed';
        icon = '✔️';
        color = 'bg-indigo-100 text-indigo-600';
      } else if (b.status === 'pending') {
        label = 'Requested';
        icon = '⏳';
        color = 'bg-yellow-100 text-yellow-600';
      }
      return {
        id: b._id,
        action: label,
        icon,
        color,
        service: b.serviceName,
        date: formatDate(b.createdAt || b.date),
      };
    });

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Here's what's happening with your bookings
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {activeBookings.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xl">
              📅
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Services</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {completedBookings.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-xl">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl">
              💰
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reviews Written</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {reviewsWritten}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center text-xl">
              ⭐
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Bookings
          </h2>
          <Link
            to="/dashboard/bookings"
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            View All →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-3">📅</div>
            <p>No upcoming bookings yet</p>
            <Link
              to="/services"
              className="inline-block mt-3 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcoming.map((booking) => (
              <div
                key={booking._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {booking.serviceName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    With {booking.provider?.name || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {booking.date} at {booking.time}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {booking.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/services"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center"
            >
              <div className="text-2xl mb-1">🔍</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Browse Services</p>
            </Link>
            <Link
              to="/providers"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center"
            >
              <div className="text-2xl mb-1">👥</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Find Providers</p>
            </Link>
            <Link
              to="/dashboard/bookings"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center"
            >
              <div className="text-2xl mb-1">📅</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">My Bookings</p>
            </Link>
            <Link
              to="/dashboard/profile"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-center"
            >
              <div className="text-2xl mb-1">👤</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Edit Profile</p>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">No recent activity yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Book a service to see your activity here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${activity.color}`}
                    >
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action} {activity.service}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
