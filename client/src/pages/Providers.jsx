import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await fetch(apiUrl('/api/providers'));
        if (!response.ok) throw new Error('Failed to fetch providers');
        const data = await response.json();
        setProviders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Service Providers</h1>
          <p className="text-gray-600 dark:text-gray-400">Find trusted professionals for your service needs</p>
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
            </select>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option>Sort by: Rating</option>
              <option>Most Reviews</option>
              <option>Newest</option>
              <option>Verified Only</option>
            </select>
            <input
              type="text"
              placeholder="Search providers..."
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex-1"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10"><p className="text-gray-500">Loading providers...</p></div>
        ) : error ? (
          <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Link
                key={provider._id}
                to={`/providers/${provider._id}`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{provider.category}</p>
                    </div>
                    {provider.verified && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-yellow-500 mr-4">
                      <span className="mr-1">★</span>
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">({provider.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {provider.location}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">View Profile →</span>
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