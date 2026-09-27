import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/services', label: 'Services' },
  { path: '/providers', label: 'Providers' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role === 'provider' ? '/provider-dashboard' : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                ServiceConnect
              </Link>
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <span className="mr-1.5">👤</span>
                    {user.name}
                  </Link>
                  <Link
                    to={dashboardPath}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-700 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ServiceConnect</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connecting customers with trusted service providers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">Home</Link></li>
                <li><Link to="/services" className="hover:text-indigo-600 dark:hover:text-indigo-400">Services</Link></li>
                <li><Link to="/providers" className="hover:text-indigo-600 dark:hover:text-indigo-400">Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><Link to="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400">Login</Link></li>
                <li><Link to="/register" className="hover:text-indigo-600 dark:hover:text-indigo-400">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Contact</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">support@serviceconnect.com</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} ServiceConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}