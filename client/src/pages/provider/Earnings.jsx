import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiUrl } from '../../config/api';

const parsePrice = (price) => Number(String(price || '').replace(/[^0-9.]/g, '')) || 0;

const monthKey = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || 'Unknown';
  return d.toLocaleString('default', { month: 'short', year: 'numeric' });
};

export default function ProviderEarnings() {
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
        if (!res.ok) throw new Error('Failed to load earnings');
        setBookings(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completed = bookings.filter((b) => b.status === 'completed');
  const pendingPay = bookings.filter((b) => b.status === 'confirmed');
  const total = completed.reduce((sum, b) => sum + parsePrice(b.price), 0);
  const pendingTotal = pendingPay.reduce((sum, b) => sum + parsePrice(b.price), 0);
  const thisMonthKey = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
  const thisMonth = completed
    .filter((b) => monthKey(b.updatedAt || b.date) === thisMonthKey)
    .reduce((sum, b) => sum + parsePrice(b.price), 0);

  const byMonth = {};
  completed.forEach((b) => {
    const key = monthKey(b.updatedAt || b.date);
    byMonth[key] = (byMonth[key] || 0) + parsePrice(b.price);
  });
  const monthRows = Object.entries(byMonth);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track income from completed bookings</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-600 dark:text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${total.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{completed.length} completed jobs</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${thisMonth.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{thisMonthKey}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming (Confirmed)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">${pendingTotal.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{pendingPay.length} confirmed jobs</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">By Month</h2>
        </div>
        {monthRows.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">Complete jobs to see monthly earnings</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {monthRows.map(([month, amount]) => (
              <div key={month} className="px-6 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{month}</span>
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">${amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Payouts</h2>
        </div>
        {completed.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">No completed bookings yet</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {completed.map((booking) => (
              <div key={booking._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{booking.serviceName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {booking.customer?.name || 'Customer'} · {booking.date} at {booking.time}
                  </p>
                </div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{booking.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
