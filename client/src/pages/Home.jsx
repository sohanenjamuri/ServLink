import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in and not loading, redirect to appropriate dashboard
    if (!loading && user) {
      const dashboardPath = user.role === 'provider' ? '/provider-dashboard' : '/dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading state or nothing while checking auth
  if (loading || user) {
    return null;
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Find Trusted <span className="text-indigo-600 dark:text-indigo-400">Service Providers</span> Near You
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Connect with verified professionals for home repairs, cleaning, tutoring, and more.
            Book services with confidence and convenience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Services
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 text-lg font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              Become a Provider
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why Choose ServiceConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Providers', description: 'All providers are background checked and verified for your safety.', icon: '✅' },
              { title: 'Easy Booking', description: 'Book services in minutes with our simple booking system.', icon: '📅' },
              { title: 'Secure Payments', description: 'Pay safely through our platform with multiple payment options.', icon: '💳' },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Home Repair',
              'Cleaning',
              'Tutoring',
              'Beauty & Wellness',
              'Automotive',
              'Pet Care',
              'Event Planning',
              'Tech Support',
            ].map((category, index) => (
              <Link
                key={index}
                to="/services"
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="text-3xl mb-3">📦</div>
                <h3 className="font-medium text-gray-900 dark:text-white">{category}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/services"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View All Categories →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}