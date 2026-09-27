import { useRef, useEffect, useState } from 'react';
import { Outlet, Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const dashboardNavLinks = [
  { path: '/dashboard', label: 'Overview', icon: '📊' },
  { path: '/dashboard/bookings', label: 'Bookings', icon: '📅' },
  { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

const providerNavLinks = [
  { path: '/provider-dashboard', label: 'Overview', icon: '📊' },
  { path: '/provider-dashboard/services', label: 'My Services', icon: '🔧' },
  { path: '/provider-dashboard/bookings', label: 'Bookings', icon: '📅' },
  { path: '/provider-dashboard/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/provider-dashboard/earnings', label: 'Earnings', icon: '💰' },
  { path: '/provider-dashboard/profile', label: 'Profile', icon: '👤' },
];

const adminNavLinks = [
  { path: '/admin-dashboard', label: 'Overview', icon: '📊' },
  { path: '/admin-dashboard/users', label: 'Users', icon: '👥' },
  { path: '/admin-dashboard/providers', label: 'Providers', icon: '🔧' },
  { path: '/admin-dashboard/services', label: 'Services', icon: '📋' },
  { path: '/admin-dashboard/bookings', label: 'Bookings', icon: '📅' },
  { path: '/admin-dashboard/analytics', label: 'Analytics', icon: '📈' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isProvider = location.pathname.startsWith('/provider-dashboard');
  const isAdmin = location.pathname.startsWith('/admin-dashboard');
  const isCustomer = location.pathname.startsWith('/dashboard') && !isProvider && !isAdmin;

  const navLinks = isProvider ? providerNavLinks : isAdmin ? adminNavLinks : dashboardNavLinks;
  const dashboardTitle = isProvider ? 'Provider Dashboard' : isAdmin ? 'Admin Dashboard' : 'Customer Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Profile dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const closeDropdown = () => setIsDropdownOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to={isProvider ? '/provider-dashboard' : isAdmin ? '/admin-dashboard' : '/dashboard'} className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {dashboardTitle}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.name || 'User'}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    id="profile-menu"
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fade-in"
                    role="menu"
                    aria-orientation="vertical"
                  >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    {user?.role && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full capitalize">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <Link
                    to={isProvider ? '/provider-dashboard/profile' : isAdmin ? '/admin-dashboard/profile' : '/dashboard/profile'}
                    onClick={closeDropdown}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <Link
                    to={isProvider ? '/provider-dashboard/settings' : isAdmin ? '/admin-dashboard/settings' : '/dashboard/settings'}
                    onClick={closeDropdown}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    role="menuitem"
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/provider-dashboard' || link.path === '/dashboard' || link.path === '/admin-dashboard'}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="lg:hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
            <nav className="flex gap-1 px-4 py-2 min-w-max">
              {navLinks.map((link) => (
                <NavLink
                  key={`m-${link.path}`}
                  to={link.path}
                  end={link.path === '/provider-dashboard' || link.path === '/dashboard' || link.path === '/admin-dashboard'}
                  className={({ isActive }) => `
                    px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    ${isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {link.icon} {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} ServiceConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}