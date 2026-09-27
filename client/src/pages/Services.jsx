import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(apiUrl('/api/services'));
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setServices(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Services</h1>
          <p className="text-gray-600 dark:text-gray-400">Browse and book from our wide range of professional services</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>All Categories</option>
              <option>Cleaning</option>
              <option>Home Repair</option>
              <option>Tutoring</option>
              <option>Beauty & Wellness</option>
              <option>Automotive</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>Sort by: Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
              <option>Most Reviewed</option>
            </select>
            <input
              type="text"
              placeholder="Search services..."
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10"><p className="text-gray-500">Loading services...</p></div>
        ) : error ? (
          <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Link
                key={service._id}
                to={`/services/${service._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full">
                      {service.category}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <span className="mr-1">★</span>
                      <span className="font-medium">{service.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">By {service.provider?.name || 'Unknown'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{service.price}</span>
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-10 space-x-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
        </div>
      </div>
    </div>
  );
}