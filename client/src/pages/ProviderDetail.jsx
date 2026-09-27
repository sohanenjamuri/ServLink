import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Cookies from 'js-cookie';
import { apiUrl } from '../config/api';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        setLoading(true);
        const [providerRes, servicesRes] = await Promise.all([
          fetch(apiUrl(`/api/providers/${id}`)),
          fetch(apiUrl(`/api/services?provider=${id}`)),
        ]);

        if (!providerRes.ok) throw new Error('Provider not found');
        const providerData = await providerRes.json();
        setProvider(providerData);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        const reviewsRes = await fetch(apiUrl(`/api/reviews/provider/${id}`));
        if (reviewsRes.ok) setReviews(await reviewsRes.json());

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProviderData();
  }, [id]);

  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'P';

  const openBookingModal = (service) => {
    if (!user) {
      setBookingMessage('Please log in as a customer to request a service.');
      setTimeout(() => setBookingMessage(''), 3000);
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      setBookingMessage('Only customers can request services.');
      setTimeout(() => setBookingMessage(''), 3000);
      return;
    }
    setSelectedService(service);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
    setBookingTime('10:00');
    setShowModal(true);
  };

  const closeBookingModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setBookingDate('');
    setBookingTime('');
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedService || !bookingDate || !bookingTime) return;
    setBookingSubmitting(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: id,
          service: selectedService._id,
          serviceName: selectedService.name,
          date: bookingDate,
          time: bookingTime,
          price: selectedService.price,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create booking');
      }
      setBookingMessage(`Booking request sent! "${selectedService.name}" is pending confirmation.`);
      closeBookingModal();
      setTimeout(() => setBookingMessage(''), 5000);
    } catch (err) {
      setBookingMessage(err.message || 'Failed to create booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">{error || 'Provider not found'}</p>
            <Link
              to="/providers"
              className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ← Back to Providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/providers"
            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            ← Back to Providers
          </Link>
        </div>

        {bookingMessage && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{bookingMessage}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-lg">
              {getInitials(provider.name)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{provider.name}</h1>
                {provider.verified && (
                  <span className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {provider.category && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {provider.category}
                  </span>
                )}
                <div className="flex items-center text-yellow-500">
                  <span className="mr-1">★</span>
                  <span className="font-medium">{provider.rating || 0}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({provider.reviews || 0} reviews)
                  </span>
                </div>
                {provider.location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {provider.location}
                  </div>
                )}
              </div>
              {provider.bio && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{provider.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            {provider.phone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.phone}</p>
                </div>
              </div>
            )}
            {provider.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{provider.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{provider.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-500 dark:text-gray-400">No reviews yet. Complete a booking to share your experience.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{review.customer?.name || 'Customer'}</p>
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

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Services Offered</h2>
          <p className="text-gray-600 dark:text-gray-400">Browse all services provided by {provider.name}</p>
        </div>

        {services.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 text-center">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No services listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                      {service.category}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <span className="mr-1">★</span>
                      <span className="font-medium">{service.rating || 0}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{service.price}</span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => openBookingModal(service)}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Request Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeBookingModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Request Service</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {provider?.name ? `with ${provider.name}` : ''}
                </p>
              </div>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full mb-2">
                    {selectedService.category}
                  </span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{selectedService.name}</h4>
                  {selectedService.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {selectedService.description}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedService.price}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <p className="mb-1">💡 <strong>What happens next?</strong></p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Your request will be sent to the provider</li>
                  <li>Provider can confirm or decline the booking</li>
                  <li>Track status in your Dashboard → Bookings</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  disabled={bookingSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-75" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
