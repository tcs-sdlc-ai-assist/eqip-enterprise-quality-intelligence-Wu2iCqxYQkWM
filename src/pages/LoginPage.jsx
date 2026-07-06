import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ROLES } from '../constants.js';
import Badge from '../components/common/Badge.jsx';

/**
 * @module LoginPage
 * Mock login page for eQIP Quality Intelligence.
 *
 * Displays a grid of pre-provisioned users grouped by RBAC role.
 * User clicks a card to select and "log in" — no real authentication.
 * Session persists in localStorage via AuthContext.
 * Styled per Vital Integrity design system.
 */

/**
 * Role display configuration with labels and descriptions.
 * @type {Readonly<object>}
 */
const ROLE_DISPLAY = Object.freeze({
  [ROLES.ADMIN]: {
    label: 'Administrator',
    description: 'Full system access, configuration, and user management.',
    color: 'bg-deep-forest-teal text-white',
    badgeVariant: 'accent',
  },
  [ROLES.PROGRAM_MANAGER]: {
    label: 'Program Manager',
    description: 'Cross-segment visibility, release approvals, and strategic oversight.',
    color: 'bg-deep-forest-teal-50 text-deep-forest-teal-800',
    badgeVariant: 'info',
  },
  [ROLES.PROJECT_MANAGER]: {
    label: 'Project Manager',
    description: 'Demand management, release tracking, and team coordination.',
    color: 'bg-deep-forest-teal-50 text-deep-forest-teal-800',
    badgeVariant: 'info',
  },
  [ROLES.QA_LEAD]: {
    label: 'QA Lead',
    description: 'Quality gate management, test strategy, and metrics configuration.',
    color: 'bg-living-green-50 text-living-green-800',
    badgeVariant: 'success',
  },
  [ROLES.QA_ENGINEER]: {
    label: 'QA Engineer',
    description: 'Test execution, defect management, and automation development.',
    color: 'bg-living-green-50 text-living-green-800',
    badgeVariant: 'success',
  },
  [ROLES.DEVELOPER]: {
    label: 'Developer',
    description: 'Code quality metrics, test assets, and defect resolution.',
    color: 'bg-blue-50 text-blue-800',
    badgeVariant: 'info',
  },
  [ROLES.BUSINESS_ANALYST]: {
    label: 'Business Analyst',
    description: 'Requirements coverage, demand creation, and reporting.',
    color: 'bg-yellow-50 text-yellow-800',
    badgeVariant: 'warning',
  },
  [ROLES.RELEASE_MANAGER]: {
    label: 'Release Manager',
    description: 'Release readiness, deployment approvals, and integration management.',
    color: 'bg-deep-forest-teal-50 text-deep-forest-teal-800',
    badgeVariant: 'info',
  },
  [ROLES.SCRUM_MASTER]: {
    label: 'Scrum Master',
    description: 'Sprint metrics, demand tracking, and team velocity.',
    color: 'bg-blue-50 text-blue-800',
    badgeVariant: 'info',
  },
  [ROLES.VIEWER]: {
    label: 'Viewer',
    description: 'Read-only access to dashboards and reports.',
    color: 'bg-gray-50 text-gray-700',
    badgeVariant: 'neutral',
  },
});

/**
 * Role ordering for display.
 * @type {Readonly<Array<string>>}
 */
const ROLE_ORDER = Object.freeze([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
  ROLES.VIEWER,
]);

/**
 * User card SVG icon.
 * @returns {React.ReactElement} An SVG user icon.
 */
function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/**
 * Loading spinner component.
 * @returns {React.ReactElement} A spinner element.
 */
function LoginSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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
  );
}

/**
 * Individual user card component for the login grid.
 *
 * @param {object} props - Component props.
 * @param {object} props.user - The user object.
 * @param {boolean} props.isLoading - Whether this user is currently being logged in.
 * @param {function} props.onSelect - Callback when the user card is clicked.
 * @returns {React.ReactElement} The rendered user card.
 */
function UserCard({ user, isLoading, onSelect }) {
  const roleConfig = ROLE_DISPLAY[user.role] || ROLE_DISPLAY[ROLES.VIEWER];

  const handleClick = useCallback(() => {
    if (!isLoading) {
      onSelect(user.id);
    }
  }, [isLoading, onSelect, user.id]);

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
        e.preventDefault();
        onSelect(user.id);
      }
    },
    [isLoading, onSelect, user.id],
  );

  return (
    <div
      className={[
        'flex items-start gap-1.5 p-2 border rounded-card cursor-pointer transition-all duration-200 select-none',
        'hover:border-deep-forest-teal-400 hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-2',
        isLoading ? 'opacity-70 pointer-events-none border-deep-forest-teal-400 bg-deep-forest-teal-50/30' : 'border-[#E0E0E0] bg-white',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Log in as ${user.persona || user.role}`}
      aria-busy={isLoading || undefined}
    >
      {/* Avatar */}
      <div
        className={[
          'flex items-center justify-center w-5 h-5 rounded-full shrink-0',
          roleConfig.color,
        ].join(' ')}
      >
        {isLoading ? <LoginSpinner /> : <UserIcon />}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-0.5 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {user.persona || user.role || 'User'}
          </span>
          <Badge variant={roleConfig.badgeVariant} size="sm">
            {roleConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 mt-[2px] truncate">
          {user.segment || 'Enterprise'}
        </p>
        <p className="text-[10px] text-gray-400 mt-[1px] truncate">
          {user.id}
        </p>
      </div>
    </div>
  );
}

/**
 * Mock login page component.
 * Displays pre-provisioned users grouped by RBAC role.
 * Clicking a user card logs in as that user via AuthContext.
 *
 * @returns {React.ReactElement} The rendered LoginPage element.
 */
export default function LoginPage() {
  const { login, getAvailableUsers, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Get all available users and group them by role.
   */
  const groupedUsers = useMemo(() => {
    const users = getAvailableUsers();
    const groups = {};

    for (let i = 0; i < ROLE_ORDER.length; i++) {
      const role = ROLE_ORDER[i];
      groups[role] = [];
    }

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const role = user.role || ROLES.VIEWER;

      if (!groups[role]) {
        groups[role] = [];
      }

      groups[role].push(user);
    }

    return groups;
  }, [getAvailableUsers]);

  /**
   * Get roles that have at least one user.
   */
  const activeRoles = useMemo(() => {
    return ROLE_ORDER.filter((role) => groupedUsers[role] && groupedUsers[role].length > 0);
  }, [groupedUsers]);

  /**
   * Handle user selection for login.
   * @param {string} userId - The user ID to log in as.
   */
  const handleUserSelect = useCallback(
    (userId) => {
      if (loadingUserId) {
        return;
      }

      setError(null);
      setLoadingUserId(userId);

      setTimeout(() => {
        try {
          const success = login(userId);

          if (success) {
            navigate('/');
          } else {
            setError('Failed to log in. Please try again.');
            setLoadingUserId(null);
          }
        } catch (err) {
          console.error('[LoginPage] Login error:', err);
          setError('An unexpected error occurred. Please try again.');
          setLoadingUserId(null);
        }
      }, 300);
    },
    [login, navigate, loadingUserId],
  );

  /**
   * If already authenticated, redirect to dashboard.
   */
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const appTitle = import.meta.env.VITE_APP_TITLE || 'eQIP Quality Intelligence';

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-[#E0E0E0] px-3 py-2">
        <div className="max-w-[1280px] mx-auto flex items-center gap-1">
          <span className="text-lg font-bold text-deep-forest-teal-800">
            eQIP
          </span>
          <span className="text-sm text-living-green-600 font-medium">
            Quality Intelligence
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-[1280px] mx-auto px-3 py-3">
          {/* Title Section */}
          <div className="text-center mb-3">
            <h1 className="text-2xl font-bold text-deep-forest-teal-800 mb-0.5">
              Select a User to Continue
            </h1>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">
              Choose a persona below to explore {appTitle} with role-based access.
              Each persona has different permissions and views.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="max-w-lg mx-auto mb-2 px-2 py-1 bg-red-50 border border-red-200 rounded-card text-sm text-red-700 text-center"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* User Groups */}
          <div className="space-y-3">
            {activeRoles.map((role) => {
              const roleConfig = ROLE_DISPLAY[role] || ROLE_DISPLAY[ROLES.VIEWER];
              const users = groupedUsers[role];

              if (!users || users.length === 0) {
                return null;
              }

              return (
                <section key={role} aria-label={`${roleConfig.label} users`}>
                  {/* Role Group Header */}
                  <div className="flex items-center gap-1 mb-1">
                    <h2 className="text-base font-semibold text-gray-800">
                      {roleConfig.label}
                    </h2>
                    <Badge variant={roleConfig.badgeVariant} size="sm">
                      {users.length}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {roleConfig.description}
                  </p>

                  {/* User Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                    {users.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        isLoading={loadingUserId === user.id}
                        onSelect={handleUserSelect}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="text-center mt-3 pb-3">
            <p className="text-[10px] text-gray-400">
              This is a mock login page for demonstration purposes. No real authentication is performed.
              Session data is stored in your browser&apos;s localStorage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}