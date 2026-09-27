import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Providers from './pages/Providers';
import ProviderDetail from './pages/ProviderDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import Bookings from './pages/dashboard/Bookings';
import Profile from './pages/dashboard/Profile';
import Settings from './pages/dashboard/Settings';
import ProviderOverview from './pages/provider/Overview';
import ProviderServices from './pages/provider/Services';
import ProviderBookings from './pages/provider/Bookings';
import ProviderReviews from './pages/provider/Reviews';
import ProviderEarnings from './pages/provider/Earnings';
import ProviderProfile from './pages/provider/Profile';

function App() {
  return (
    <Routes>
      {/* Public Routes with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:id" element={<ProviderDetail />} />
        <Route path="*" element={<div className="p-8 text-center text-gray-900 dark:text-white">404 - Page Not Found</div>} />
      </Route>

      {/* Auth Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Customer Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/dashboard/bookings" element={<Bookings />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Protected Provider Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/provider-dashboard" element={<ProviderOverview />} />
          <Route path="/provider-dashboard/services" element={<ProviderServices />} />
          <Route path="/provider-dashboard/bookings" element={<ProviderBookings />} />
          <Route path="/provider-dashboard/reviews" element={<ProviderReviews />} />
          <Route path="/provider-dashboard/earnings" element={<ProviderEarnings />} />
          <Route path="/provider-dashboard/profile" element={<ProviderProfile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;