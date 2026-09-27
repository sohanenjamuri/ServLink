import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Simple Navbar for Auth Pages */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              ServiceConnect
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} ServiceConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}