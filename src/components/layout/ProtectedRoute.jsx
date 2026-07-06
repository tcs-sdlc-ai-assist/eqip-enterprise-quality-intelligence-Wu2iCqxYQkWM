import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRBAC } from '../../contexts/RBACContext.jsx';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * @module ProtectedRoute
 * Route guard component for eQIP Quality Intelligence.
 *
 * Checks if the user is authenticated (via AuthContext) and has permission
 * to access the route (via RBACContext). Redirects to login if unauthenticated,
 * shows an access denied message if unauthorized.
 *
 * Features:
 * - Authentication check via useAuth().isAuthenticated
 * - Loading state handling during auth initialization
 * - Optional screen-level RBAC check via useRBAC().canAccess()
 * - Optional role-based access check via useRBAC().hasAnyRole()
 * - Redirect to root path when unauthenticated
 * - Access denied display when unauthorized
 * - Renders children when all checks pass
 */

/**
 * Access denied SVG icon.
 * @returns {React.ReactElement} An SVG lock icon.
 */
function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/**
 * Loading spinner component displayed during auth initialization.
 * @returns {React.ReactElement} A centered loading spinner.
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
      <div className="flex flex-col items-center gap-2">
        <svg
          className="animate-spin h-5 w-5 text-deep-forest-teal"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm text-gray-500 font-medium">Loading...</span>
      </div>
    </div>
  );
}

/**
 * Access denied component displayed when the user does not have permission.
 * @param {object} props - Component props.
 * @param {string} [props.message] - Custom access denied message.
 * @returns {React.ReactElement} An access denied display.
 */
function AccessDenied({ message }) {
  const displayMessage =
    message ||
    'You do not have permission to access this page. Please contact your administrator if you believe this is an error.';

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center text-center py-6 px-3 max-w-md">
        <div className="mb-2 text-red-300">
          <LockIcon />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Access Denied
        </h2>
        <p className="text-sm text-gray-500 mb-2">
          {displayMessage}
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-1 px-2 py-1 text-sm font-medium rounded-standard bg-deep-forest-teal text-white border border-deep-forest-teal hover:bg-deep-forest-teal-700 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-2"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

AccessDenied.propTypes = {
  /** Custom access denied message. */
  message: PropTypes.string,
};

/**
 * ProtectedRoute component that guards routes based on authentication and authorization.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The child components to render when access is granted.
 * @param {string} [props.screenKey] - The screen key used for RBAC canAccess() check. If not provided, only authentication is checked.
 * @param {Array<string>} [props.requiredRoles] - Array of roles that are allowed to access this route. If not provided, any authenticated role is allowed (subject to screenKey check).
 * @param {string} [props.redirectTo='/'] - The path to redirect to when unauthenticated.
 * @param {string} [props.accessDeniedMessage] - Custom message to display when access is denied.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered ProtectedRoute element.
 */
export default function ProtectedRoute({
  children,
  screenKey,
  requiredRoles,
  redirectTo = '/',
  accessDeniedMessage,
  testId,
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { canAccess, hasAnyRole } = useRBAC();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (screenKey && typeof screenKey === 'string') {
    if (!canAccess(screenKey)) {
      return (
        <div data-testid={testId}>
          <AccessDenied message={accessDeniedMessage} />
        </div>
      );
    }
  }

  if (Array.isArray(requiredRoles) && requiredRoles.length > 0) {
    if (!hasAnyRole(requiredRoles)) {
      return (
        <div data-testid={testId}>
          <AccessDenied message={accessDeniedMessage} />
        </div>
      );
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  /** The child components to render when access is granted. */
  children: PropTypes.node.isRequired,
  /** The screen key used for RBAC canAccess() check. If not provided, only authentication is checked. */
  screenKey: PropTypes.string,
  /** Array of roles that are allowed to access this route. If not provided, any authenticated role is allowed. */
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  /** The path to redirect to when unauthenticated. */
  redirectTo: PropTypes.string,
  /** Custom message to display when access is denied. */
  accessDeniedMessage: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};