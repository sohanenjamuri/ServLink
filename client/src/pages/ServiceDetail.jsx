import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl(`/api/services/${id}`));

        if (!response.ok) {
          throw new Error('Service not found');
        }

        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err.message || 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-red-500 text-lg mb-4">{error || 'Service not found'}</p>
            <Link
              to="/services"
              className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const provider = service.provider || null;

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/services"
            className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            ← Back to Services
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-sm font-medium">
                  {service.category}
                </span>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{service.name}</h1>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Starting at</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{service.price}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr] gap-8 mt-8">
              <div>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Overview</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {service.description || 'No description provided yet for this service.'}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Service includes</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• Professional service by a verified local provider</li>
                    <li>• Flexible scheduling options</li>
                    <li>• Transparent pricing with no hidden fees</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Provider</h3>
                  {provider ? (
                    <div className="space-y-3">
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{provider.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{provider.location || 'Location not provided'}</p>
                      <div className="flex items-center text-yellow-500">
                        <span className="mr-1">★</span>
                        <span className="font-medium text-gray-900 dark:text-white">{provider.rating || 0}</span>
                      </div>
                      <Link
                        to={`/providers/${provider._id}`}
                        className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        View Provider Profile
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">Provider details unavailable.</p>
                  )}
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium mb-2">Ready to book?</p>
                  <Link
                    to={provider ? `/providers/${provider._id}` : '/services'}
                    className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Book This Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
