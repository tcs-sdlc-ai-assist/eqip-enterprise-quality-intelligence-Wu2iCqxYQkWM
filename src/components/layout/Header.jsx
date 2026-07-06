import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../common/Tooltip.jsx';

/**
 * @module Header
 * Top header bar component for eQIP Quality Intelligence.
 *
 * Displays:
 * - EQIP logo/title on the left
 * - Current user name/role display
 * - Notification bell with unread count badge
 * - Logout button
 *
 * Uses AuthContext for user info and logout, NotificationContext for unread count.
 */

/**
 * Notification bell SVG icon.
 * @returns {React.ReactElement} An SVG bell icon.
 */
function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

/**
 * Logout SVG icon.
 * @returns {React.ReactElement} An SVG logout icon.
 */
function LogoutIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/**
 * User avatar SVG icon.
 * @returns {React.ReactElement} An SVG user icon.
 */
function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
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
 * Application header component displaying logo, user info, notifications, and logout.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes for the header container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered Header element.
 */
export default function Header({ className = '', testId }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  /**
   * Handle logout button click.
   * Logs the user out and navigates to the root path.
   */
  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  /**
   * Handle notification bell click.
   * Navigates to the notifications/profile page.
   */
  const handleNotificationClick = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  /**
   * Handle logo/title click.
   * Navigates to the dashboard.
   */
  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const appTitle = import.meta.env.VITE_APP_TITLE || 'eQIP Quality Intelligence';

  const displayName = user ? (user.persona || user.role || 'User') : 'User';
  const displaySegment = user ? (user.segment || '') : '';

  const headerClasses = [
    'flex items-center justify-between px-3 py-1 bg-white border-b border-[#E0E0E0] shrink-0 z-[1020]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header
      className={headerClasses}
      role="banner"
      data-testid={testId}
    >
      {/* Left: Logo / Title */}
      <div className="flex items-center gap-1 min-w-0">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 rounded-standard"
          aria-label="Go to dashboard"
        >
          <span className="text-base font-bold text-deep-forest-teal-800 truncate">
            eQIP
          </span>
          <span className="text-xs text-living-green-600 font-medium truncate hidden sm:inline">
            Quality Intelligence
          </span>
        </button>
      </div>

      {/* Right: User info, notifications, logout */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* User Info */}
        <div className="flex items-center gap-0.5 min-w-0 hidden sm:flex">
          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-deep-forest-teal-50 text-deep-forest-teal-700 shrink-0">
            <UserIcon />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate leading-tight">
              {displayName}
            </p>
            {displaySegment && (
              <p className="text-[9px] text-gray-500 truncate leading-tight">
                {displaySegment}
              </p>
            )}
          </div>
        </div>

        {/* Notification Bell */}
        <Tooltip content={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`} position="bottom" delay={200}>
          <button
            type="button"
            onClick={handleNotificationClick}
            className="relative inline-flex items-center justify-center p-0.5 rounded-standard text-gray-600 hover:text-deep-forest-teal-700 hover:bg-deep-forest-teal-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-[2px] -right-[2px] inline-flex items-center justify-center min-w-[16px] h-[16px] px-[4px] text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Logout Button */}
        <Tooltip content="Logout" position="bottom" delay={200}>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center p-0.5 rounded-standard text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
            aria-label="Logout"
          >
            <LogoutIcon />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}

Header.propTypes = {
  /** Additional CSS classes for the header container. */
  className: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};