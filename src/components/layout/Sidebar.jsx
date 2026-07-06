import { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRBAC } from '../../contexts/RBACContext.jsx';
import { STORAGE_KEYS } from '../../constants.js';
import { getItem, setItem } from '../../utils/localStorage.js';
import Tooltip from '../common/Tooltip.jsx';

/**
 * @module Sidebar
 * Persistent left navigation sidebar component for eQIP Quality Intelligence.
 *
 * Renders navigation items based on the current user's role using useRBAC().
 * Items that the user cannot access are not rendered.
 *
 * Features:
 * - Role-based navigation item visibility via useRBAC().canAccess()
 * - Collapsible sidebar with icon-only mode
 * - Active route highlighting
 * - Tooltip labels in collapsed mode
 * - Keyboard accessible
 * - Persists collapsed state to localStorage
 */

/**
 * Navigation item definitions with keys, labels, paths, and icons.
 * Each item includes a screen key used for RBAC canAccess() checks.
 * @type {Readonly<Array<object>>}
 */
const NAV_ITEMS = Object.freeze([
  {
    key: 'dashboard',
    label: 'Executive Dashboard',
    path: '/',
    screenKey: 'dashboard',
  },
  {
    key: 'demands',
    label: 'Demand Management',
    path: '/demands',
    screenKey: 'demands',
  },
  {
    key: 'segments',
    label: 'Segment Management',
    path: '/segments',
    screenKey: 'dashboard',
  },
  {
    key: 'applications',
    label: 'Application Repository',
    path: '/applications',
    screenKey: 'dashboard',
  },
  {
    key: 'releases',
    label: 'Release Readiness',
    path: '/releases',
    screenKey: 'dashboard',
  },
  {
    key: 'test-assets',
    label: 'Test Repository',
    path: '/test-assets',
    screenKey: 'test-assets',
  },
  {
    key: 'test-executions',
    label: 'Test Execution',
    path: '/test-executions',
    screenKey: 'test-assets',
  },
  {
    key: 'automation',
    label: 'Automation Intelligence',
    path: '/automation',
    screenKey: 'test-assets',
  },
  {
    key: 'environments',
    label: 'Environment Management',
    path: '/environments',
    screenKey: 'dashboard',
  },
  {
    key: 'test-data',
    label: 'Test Data Management',
    path: '/test-data',
    screenKey: 'test-assets',
  },
  {
    key: 'quality-gates',
    label: 'Quality Gates',
    path: '/quality-gates',
    screenKey: 'quality-gates',
  },
  {
    key: 'governance',
    label: 'Governance',
    path: '/governance',
    screenKey: 'dashboard',
  },
  {
    key: 'post-deployment',
    label: 'Post Deployment Monitoring',
    path: '/post-deployment',
    screenKey: 'dashboard',
  },
  {
    key: 'reports',
    label: 'Reporting and Analytics',
    path: '/reports',
    screenKey: 'reports',
  },
  {
    key: 'ai-insights',
    label: 'AI Insights',
    path: '/ai-insights',
    screenKey: 'metrics',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    screenKey: 'integrations',
  },
  {
    key: 'settings',
    label: 'Administration',
    path: '/settings',
    screenKey: 'settings',
  },
  {
    key: 'profile',
    label: 'My Profile',
    path: '/profile',
    screenKey: 'dashboard',
  },
]);

/**
 * SVG icon components for each navigation item.
 * Each icon is a simple 20x20 SVG.
 */

function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function DemandsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SegmentsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ApplicationsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function ReleasesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      <polyline points="16 16 12 12 8 16" />
    </svg>
  );
}

function TestAssetsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function TestExecutionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function AutomationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 14h3" />
      <path d="M1 9h3" />
      <path d="M1 14h3" />
    </svg>
  );
}

function EnvironmentsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}

function TestDataIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function QualityGatesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function GovernanceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PostDeploymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function AIInsightsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IntegrationsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}

/**
 * Map of navigation item keys to their icon components.
 * @type {Readonly<object>}
 */
const ICON_MAP = Object.freeze({
  dashboard: DashboardIcon,
  demands: DemandsIcon,
  segments: SegmentsIcon,
  applications: ApplicationsIcon,
  releases: ReleasesIcon,
  'test-assets': TestAssetsIcon,
  'test-executions': TestExecutionIcon,
  automation: AutomationIcon,
  environments: EnvironmentsIcon,
  'test-data': TestDataIcon,
  'quality-gates': QualityGatesIcon,
  governance: GovernanceIcon,
  'post-deployment': PostDeploymentIcon,
  reports: ReportsIcon,
  'ai-insights': AIInsightsIcon,
  integrations: IntegrationsIcon,
  settings: SettingsIcon,
  profile: ProfileIcon,
});

/**
 * Sidebar navigation item component.
 *
 * @param {object} props - Component props.
 * @param {object} props.item - The navigation item definition.
 * @param {boolean} props.isActive - Whether this item is the active route.
 * @param {boolean} props.isCollapsed - Whether the sidebar is collapsed.
 * @param {function} props.onClick - Click handler for navigation.
 * @returns {React.ReactElement} The rendered navigation item.
 */
function SidebarNavItem({ item, isActive, isCollapsed, onClick }) {
  const IconComponent = ICON_MAP[item.key] || DashboardIcon;

  const handleClick = useCallback(() => {
    onClick(item.path);
  }, [onClick, item.path]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(item.path);
      }
    },
    [onClick, item.path],
  );

  const itemClasses = [
    'flex items-center gap-1.5 w-full rounded-standard transition-all duration-150 cursor-pointer select-none',
    isCollapsed ? 'justify-center px-1 py-1' : 'px-1.5 py-1',
    isActive
      ? 'bg-deep-forest-teal text-white font-semibold'
      : 'text-gray-600 hover:bg-deep-forest-teal-50 hover:text-deep-forest-teal-800',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <div
      className={itemClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="link"
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="inline-flex shrink-0" aria-hidden="true">
        <IconComponent />
      </span>
      {!isCollapsed && (
        <span className="text-xs leading-tight truncate">{item.label}</span>
      )}
    </div>
  );

  if (isCollapsed) {
    return (
      <Tooltip content={item.label} position="right" delay={100}>
        {content}
      </Tooltip>
    );
  }

  return content;
}

SidebarNavItem.propTypes = {
  item: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    screenKey: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Persistent left navigation sidebar component.
 * Renders navigation items based on the current user's role using useRBAC().
 * Items that the user cannot access are not rendered.
 *
 * @param {object} props - Component props.
 * @param {string} [props.className] - Additional CSS classes for the sidebar container.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered Sidebar element.
 */
export default function Sidebar({ className = '', testId }) {
  const { user, isAuthenticated } = useAuth();
  const { canAccess } = useRBAC();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  });

  /**
   * Toggle the sidebar collapsed state and persist to localStorage.
   */
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, next);
      return next;
    });
  }, []);

  /**
   * Navigate to a path when a nav item is clicked.
   * @param {string} path - The path to navigate to.
   */
  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate],
  );

  /**
   * Filter navigation items based on RBAC canAccess checks.
   */
  const accessibleItems = useMemo(() => {
    if (!isAuthenticated) {
      return [];
    }

    return NAV_ITEMS.filter((item) => {
      return canAccess(item.screenKey);
    });
  }, [isAuthenticated, canAccess]);

  /**
   * Determine the active path for highlighting.
   * @param {string} itemPath - The nav item path.
   * @returns {boolean} True if the item path matches the current location.
   */
  const isActivePath = useCallback(
    (itemPath) => {
      if (itemPath === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(itemPath);
    },
    [location.pathname],
  );

  if (!isAuthenticated) {
    return null;
  }

  const sidebarClasses = [
    'flex flex-col h-full bg-white border-r border-[#E0E0E0] transition-all duration-200 shrink-0',
    isCollapsed ? 'w-[56px]' : 'w-[240px]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={sidebarClasses}
      aria-label="Main navigation"
      data-testid={testId}
    >
      {/* Logo / Brand Area */}
      <div className="flex items-center justify-between px-1.5 py-1.5 border-b border-[#E0E0E0] shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-0.5 min-w-0">
            <span className="text-sm font-bold text-deep-forest-teal-800 truncate">
              eQIP
            </span>
            <span className="text-[10px] text-living-green-600 font-medium truncate">
              Quality Intelligence
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleToggleCollapse}
          className="inline-flex items-center justify-center p-0.5 rounded-standard text-gray-500 hover:text-deep-forest-teal-700 hover:bg-deep-forest-teal-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 shrink-0"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-1 px-0.5 space-y-[2px]">
        {accessibleItems.map((item) => (
          <SidebarNavItem
            key={item.key}
            item={item}
            isActive={isActivePath(item.path)}
            isCollapsed={isCollapsed}
            onClick={handleNavigate}
          />
        ))}
      </div>

      {/* User Info Footer */}
      {user && !isCollapsed && (
        <div className="shrink-0 border-t border-[#E0E0E0] px-1.5 py-1">
          <div className="flex items-center gap-0.5 min-w-0">
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-deep-forest-teal-50 text-deep-forest-teal-700 shrink-0">
              <ProfileIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-800 truncate">
                {user.persona || user.role || 'User'}
              </p>
              <p className="text-[9px] text-gray-500 truncate">
                {user.segment || 'Enterprise'}
              </p>
            </div>
          </div>
        </div>
      )}

      {user && isCollapsed && (
        <div className="shrink-0 border-t border-[#E0E0E0] px-0.5 py-1 flex justify-center">
          <Tooltip content={user.persona || user.role || 'User'} position="right" delay={100}>
            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-deep-forest-teal-50 text-deep-forest-teal-700">
              <ProfileIcon />
            </div>
          </Tooltip>
        </div>
      )}
    </nav>
  );
}

Sidebar.propTypes = {
  /** Additional CSS classes for the sidebar container. */
  className: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};