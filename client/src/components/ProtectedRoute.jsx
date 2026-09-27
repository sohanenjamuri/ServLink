import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in — redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role — redirect to their own dashboard
    const fallback = user.role === 'provider' ? '/provider-dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
