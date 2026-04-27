import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * useIsAuthenticated - Check if user is logged in
 * @returns {boolean} true if authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * useIsAdmin - Check if logged-in user is admin
 * @returns {boolean}
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}

/**
 * useHasRole - Check if user has specific role(s)
 * @param {string|string[]} role - Role(s) to check
 * @returns {boolean}
 */
export function useHasRole(role) {
  const { user } = useAuth();
  if (!user) return false;
  const rolesArray = Array.isArray(role) ? role : [role];
  return rolesArray.includes(user.role);
}

/**
 * useRequireAuth - Redirect to login if not authenticated
 * @returns {object} user data
 */
export function useRequireAuth() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !isAuthenticated) {
    navigate('/login', { replace: true });
  }

  return { user, isAuthenticated, loading };
}

/**
 * useRequireAdmin - Redirect to home if not admin
 * @returns {object} user data
 */
export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && user?.role !== 'admin') {
    navigate('/', { replace: true });
  }

  return { user, loading };
}

/**
 * useLogout - Get logout function when user confirms
 */
export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (confirmMessage = 'Are you sure you want to logout?') => {
    if (window.confirm(confirmMessage)) {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return handleLogout;
}

/**
 * useUser - Get current user data with fallback
 */
export function useUser() {
  const { user, loading, isAuthenticated } = useAuth();

  return {
    user,
    loading,
    isAuthenticated,
    isBuddy: user?.role === 'buddy',
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
    isPartner: user?.role === 'partner',
  };
}
