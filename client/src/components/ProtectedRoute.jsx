import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * ProtectedRoute - Redirects unauthenticated users to login
 * @param {ReactNode} children - Routes to protect
 */
export function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    // Redirect to login but remember where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * AdminRoute - Protects admin-only routes
 * @param {ReactNode} children - Routes to protect
 */
export function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * RoleRoute - Protects routes by specific roles
 * @param {string|string[]} allowedRoles - Role(s) allowed to access
 * @param {ReactNode} children - Routes to protect
 */
export function RoleRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!rolesArray.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * GuestRoute - Redirects authenticated users away from auth pages
 * @param {ReactNode} children - Routes to protect
 */
export function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader />;

  if (isAuthenticated) {
    // Redirect to dashboard based on role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
