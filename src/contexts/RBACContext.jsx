import { createContext, useContext, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';
import { ROLES, NAV_ITEMS } from '../constants.js';
import { logAction } from '../utils/auditLogger.js';
import { getItem, setItem } from '../utils/localStorage.js';

/**
 * @module RBACContext
 * Role-Based Access Control context provider for eQIP Quality Intelligence.
 * Provides useRBAC() hook with canAccess(screen), canPerform(action),
 * hasRole(role), getPermissions() functions. Evaluates permissions based
 * on current user's role from AuthContext. Permission matrix is configurable
 * via admin. All access changes are logged via auditLogger.
 */

/**
 * @typedef {object} RBACContextValue
 * @property {function} canAccess - Check if the current user can access a screen/nav item.
 * @property {function} canPerform - Check if the current user can perform a specific action on an entity.
 * @property {function} hasRole - Check if the current user has a specific role.
 * @property {function} hasAnyRole - Check if the current user has any of the specified roles.
 * @property {function} getPermissions - Get the full permissions object for the current role.
 * @property {function} getAccessibleNavItems - Get nav items accessible to the current role.
 * @property {function} updatePermissionMatrix - Update the permission matrix (admin only).
 * @property {function} resetPermissionMatrix - Reset the permission matrix to defaults (admin only).
 * @property {string|null} currentRole - The current user's role.
 */

const RBACContext = createContext(null);

/**
 * localStorage key for the configurable permission matrix.
 * @type {string}
 */
const PERMISSION_MATRIX_KEY = 'eqip_permission_matrix';

/**
 * Default permission matrix mapping roles to allowed actions on entity types.
 * Actions: 'view', 'create', 'update', 'delete', 'approve', 'export', 'configure'.
 * Entity types: 'releases', 'quality-gates', 'demands', 'governance-procedures',
 *   'test-assets', 'metrics', 'integrations', 'reports', 'settings', 'audit-logs',
 *   'environments', 'notifications', 'applications', 'ai-insights'.
 * @type {Readonly<object>}
 */
const DEFAULT_PERMISSION_MATRIX = Object.freeze({
  [ROLES.ADMIN]: {
    releases: ['view', 'create', 'update', 'delete', 'approve', 'export', 'configure'],
    'quality-gates': ['view', 'create', 'update', 'delete', 'approve', 'export', 'configure'],
    demands: ['view', 'create', 'update', 'delete', 'approve', 'export'],
    'governance-procedures': ['view', 'create', 'update', 'delete', 'export', 'configure'],
    'test-assets': ['view', 'create', 'update', 'delete', 'export'],
    metrics: ['view', 'export', 'configure'],
    integrations: ['view', 'create', 'update', 'delete', 'configure'],
    reports: ['view', 'create', 'export'],
    settings: ['view', 'update', 'configure'],
    'audit-logs': ['view', 'export'],
    environments: ['view', 'create', 'update', 'delete', 'configure'],
    notifications: ['view', 'create', 'update', 'delete'],
    applications: ['view', 'create', 'update', 'delete', 'export'],
    'ai-insights': ['view', 'create', 'export'],
  },
  [ROLES.PROGRAM_MANAGER]: {
    releases: ['view', 'create', 'update', 'approve', 'export'],
    'quality-gates': ['view', 'approve', 'export'],
    demands: ['view', 'create', 'update', 'approve', 'export'],
    'governance-procedures': ['view', 'create', 'update', 'export'],
    'test-assets': ['view', 'export'],
    metrics: ['view', 'export'],
    integrations: ['view'],
    reports: ['view', 'create', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view', 'create'],
    applications: ['view', 'export'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.PROJECT_MANAGER]: {
    releases: ['view', 'create', 'update', 'export'],
    'quality-gates': ['view', 'export'],
    demands: ['view', 'create', 'update', 'approve', 'export'],
    'governance-procedures': ['view', 'export'],
    'test-assets': ['view'],
    metrics: ['view', 'export'],
    integrations: [],
    reports: ['view', 'create', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view', 'create'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.QA_LEAD]: {
    releases: ['view', 'create', 'update', 'approve', 'export'],
    'quality-gates': ['view', 'create', 'update', 'approve', 'export', 'configure'],
    demands: ['view', 'create', 'update', 'approve', 'export'],
    'governance-procedures': ['view', 'create', 'update', 'export'],
    'test-assets': ['view', 'create', 'update', 'delete', 'export'],
    metrics: ['view', 'export', 'configure'],
    integrations: ['view'],
    reports: ['view', 'create', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view', 'update'],
    notifications: ['view', 'create'],
    applications: ['view', 'export'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.QA_ENGINEER]: {
    releases: ['view'],
    'quality-gates': ['view', 'update'],
    demands: ['view', 'create', 'update'],
    'governance-procedures': ['view'],
    'test-assets': ['view', 'create', 'update', 'delete', 'export'],
    metrics: ['view', 'export'],
    integrations: [],
    reports: ['view', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view', 'create'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.DEVELOPER]: {
    releases: ['view'],
    'quality-gates': ['view'],
    demands: ['view', 'create', 'update'],
    'governance-procedures': ['view'],
    'test-assets': ['view', 'create', 'update', 'export'],
    metrics: ['view'],
    integrations: [],
    reports: ['view'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.BUSINESS_ANALYST]: {
    releases: ['view', 'export'],
    'quality-gates': ['view'],
    demands: ['view', 'create', 'update', 'export'],
    'governance-procedures': ['view', 'export'],
    'test-assets': ['view'],
    metrics: ['view', 'export'],
    integrations: [],
    reports: ['view', 'create', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view', 'create'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.RELEASE_MANAGER]: {
    releases: ['view', 'create', 'update', 'approve', 'export'],
    'quality-gates': ['view', 'update', 'approve', 'export'],
    demands: ['view', 'export'],
    'governance-procedures': ['view', 'export'],
    'test-assets': ['view'],
    metrics: ['view', 'export'],
    integrations: ['view', 'create', 'update', 'delete', 'configure'],
    reports: ['view', 'create', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view', 'update', 'configure'],
    notifications: ['view', 'create'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.SCRUM_MASTER]: {
    releases: ['view'],
    'quality-gates': ['view'],
    demands: ['view', 'create', 'update', 'export'],
    'governance-procedures': ['view'],
    'test-assets': ['view'],
    metrics: ['view', 'export'],
    integrations: [],
    reports: ['view', 'export'],
    settings: [],
    'audit-logs': ['view'],
    environments: ['view'],
    notifications: ['view', 'create'],
    applications: ['view'],
    'ai-insights': ['view', 'create'],
  },
  [ROLES.VIEWER]: {
    releases: ['view'],
    'quality-gates': ['view'],
    demands: ['view'],
    'governance-procedures': ['view'],
    'test-assets': ['view'],
    metrics: ['view'],
    integrations: [],
    reports: ['view', 'export'],
    settings: [],
    'audit-logs': [],
    environments: ['view'],
    notifications: ['view'],
    applications: ['view'],
    'ai-insights': ['view'],
  },
});

/**
 * Screen-to-nav-key mapping for canAccess checks.
 * Maps screen names to NAV_ITEMS keys.
 * @type {Readonly<object>}
 */
const SCREEN_NAV_MAP = Object.freeze({
  dashboard: 'dashboard',
  demands: 'demands',
  'test-assets': 'test-assets',
  'quality-gates': 'quality-gates',
  metrics: 'metrics',
  integrations: 'integrations',
  reports: 'reports',
  settings: 'settings',
});

/**
 * Load the permission matrix from localStorage, falling back to defaults.
 * @returns {object} The permission matrix.
 */
function loadPermissionMatrix() {
  const stored = getItem(PERMISSION_MATRIX_KEY, null);
  if (stored && typeof stored === 'object') {
    const merged = {};
    const allRoles = Object.values(ROLES);
    for (let i = 0; i < allRoles.length; i++) {
      const role = allRoles[i];
      if (stored[role] && typeof stored[role] === 'object') {
        merged[role] = { ...DEFAULT_PERMISSION_MATRIX[role], ...stored[role] };
      } else {
        merged[role] = DEFAULT_PERMISSION_MATRIX[role] ? { ...DEFAULT_PERMISSION_MATRIX[role] } : {};
      }
    }
    return merged;
  }
  return { ...DEFAULT_PERMISSION_MATRIX };
}

/**
 * RBACProvider component that wraps the application and provides RBAC state.
 * Reads the current user's role from AuthContext and evaluates permissions
 * against the configurable permission matrix.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render within the provider.
 * @returns {React.ReactElement} The RBACContext.Provider wrapping children.
 */
export function RBACProvider({ children }) {
  const { role, userId, isAuthenticated } = useAuth();

  /**
   * Get the current permission matrix (from localStorage or defaults).
   * @returns {object} The permission matrix.
   */
  const getPermissionMatrix = useCallback(() => {
    return loadPermissionMatrix();
  }, []);

  /**
   * Check if the current user can access a specific screen/nav item.
   * Evaluates against NAV_ITEMS role visibility rules.
   *
   * @param {string} screen - The screen key (e.g., 'dashboard', 'demands', 'quality-gates').
   * @returns {boolean} True if the current user can access the screen.
   */
  const canAccess = useCallback((screen) => {
    if (!screen || typeof screen !== 'string') {
      return false;
    }

    if (!isAuthenticated || !role) {
      return false;
    }

    const navKey = SCREEN_NAV_MAP[screen] || screen;

    const navItem = NAV_ITEMS.find((item) => item.key === navKey);

    if (navItem) {
      if (Array.isArray(navItem.roles) && navItem.roles.length > 0) {
        return navItem.roles.includes(role);
      }
      return true;
    }

    const matrix = getPermissionMatrix();
    const rolePermissions = matrix[role];

    if (!rolePermissions) {
      return false;
    }

    const entityPermissions = rolePermissions[screen];

    if (Array.isArray(entityPermissions) && entityPermissions.length > 0) {
      return entityPermissions.includes('view');
    }

    return false;
  }, [role, isAuthenticated, getPermissionMatrix]);

  /**
   * Check if the current user can perform a specific action on an entity type.
   * Evaluates against the permission matrix.
   *
   * @param {string} action - The action to check (e.g., 'view', 'create', 'update', 'delete', 'approve', 'export', 'configure').
   * @param {string} [entityType] - The entity type to check against (e.g., 'releases', 'demands').
   * @returns {boolean} True if the current user can perform the action.
   */
  const canPerform = useCallback((action, entityType) => {
    if (!action || typeof action !== 'string') {
      return false;
    }

    if (!isAuthenticated || !role) {
      return false;
    }

    if (!entityType || typeof entityType !== 'string') {
      if (role === ROLES.ADMIN) {
        return true;
      }
      return false;
    }

    const matrix = getPermissionMatrix();
    const rolePermissions = matrix[role];

    if (!rolePermissions) {
      return false;
    }

    const entityPermissions = rolePermissions[entityType];

    if (!Array.isArray(entityPermissions)) {
      return false;
    }

    return entityPermissions.includes(action);
  }, [role, isAuthenticated, getPermissionMatrix]);

  /**
   * Check if the current user has a specific role.
   *
   * @param {string} targetRole - The role to check for.
   * @returns {boolean} True if the current user has the specified role.
   */
  const hasRoleCheck = useCallback((targetRole) => {
    if (!targetRole || typeof targetRole !== 'string') {
      return false;
    }

    if (!isAuthenticated || !role) {
      return false;
    }

    return role === targetRole;
  }, [role, isAuthenticated]);

  /**
   * Check if the current user has any of the specified roles.
   *
   * @param {Array<string>} targetRoles - Array of roles to check against.
   * @returns {boolean} True if the current user has any of the specified roles.
   */
  const hasAnyRoleCheck = useCallback((targetRoles) => {
    if (!Array.isArray(targetRoles) || targetRoles.length === 0) {
      return false;
    }

    if (!isAuthenticated || !role) {
      return false;
    }

    return targetRoles.includes(role);
  }, [role, isAuthenticated]);

  /**
   * Get the full permissions object for the current role.
   *
   * @returns {object} The permissions object for the current role, or empty object if not authenticated.
   */
  const getPermissions = useCallback(() => {
    if (!isAuthenticated || !role) {
      return {};
    }

    const matrix = getPermissionMatrix();
    const rolePermissions = matrix[role];

    if (!rolePermissions) {
      return {};
    }

    return { ...rolePermissions };
  }, [role, isAuthenticated, getPermissionMatrix]);

  /**
   * Get nav items accessible to the current role.
   *
   * @returns {Array<object>} Array of accessible nav item objects.
   */
  const getAccessibleNavItems = useCallback(() => {
    if (!isAuthenticated || !role) {
      return [];
    }

    return NAV_ITEMS.filter((item) => {
      if (Array.isArray(item.roles) && item.roles.length > 0) {
        return item.roles.includes(role);
      }
      return true;
    });
  }, [role, isAuthenticated]);

  /**
   * Update the permission matrix (admin only).
   * Merges provided updates with the existing matrix and persists to localStorage.
   *
   * @param {object} updates - Partial permission matrix updates.
   *   Format: { [role]: { [entityType]: ['action1', 'action2'] } }
   * @returns {boolean} True if the update was successful, false if unauthorized.
   */
  const updatePermissionMatrix = useCallback((updates) => {
    if (!isAuthenticated || role !== ROLES.ADMIN) {
      console.warn('[RBACContext] Only admin users can update the permission matrix.');
      return false;
    }

    if (!updates || typeof updates !== 'object') {
      console.warn('[RBACContext] Invalid permission matrix updates.');
      return false;
    }

    const current = loadPermissionMatrix();
    const updatedMatrix = { ...current };

    const roleKeys = Object.keys(updates);
    for (let i = 0; i < roleKeys.length; i++) {
      const roleKey = roleKeys[i];
      const roleUpdates = updates[roleKey];

      if (!roleUpdates || typeof roleUpdates !== 'object') {
        continue;
      }

      if (!updatedMatrix[roleKey]) {
        updatedMatrix[roleKey] = {};
      }

      const entityKeys = Object.keys(roleUpdates);
      for (let j = 0; j < entityKeys.length; j++) {
        const entityKey = entityKeys[j];
        const actions = roleUpdates[entityKey];

        if (Array.isArray(actions)) {
          updatedMatrix[roleKey][entityKey] = [...actions];
        }
      }
    }

    setItem(PERMISSION_MATRIX_KEY, updatedMatrix);

    logAction(
      userId || 'unknown',
      'Update Permission Matrix',
      'settings',
      'permission-matrix',
      `Updated permission matrix for roles: ${roleKeys.join(', ')}`,
    );

    return true;
  }, [role, userId, isAuthenticated]);

  /**
   * Reset the permission matrix to defaults (admin only).
   * Removes the stored matrix from localStorage.
   *
   * @returns {boolean} True if the reset was successful, false if unauthorized.
   */
  const resetPermissionMatrix = useCallback(() => {
    if (!isAuthenticated || role !== ROLES.ADMIN) {
      console.warn('[RBACContext] Only admin users can reset the permission matrix.');
      return false;
    }

    setItem(PERMISSION_MATRIX_KEY, null);

    logAction(
      userId || 'unknown',
      'Reset Permission Matrix',
      'settings',
      'permission-matrix',
      'Reset permission matrix to defaults',
    );

    return true;
  }, [role, userId, isAuthenticated]);

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(() => ({
    canAccess,
    canPerform,
    hasRole: hasRoleCheck,
    hasAnyRole: hasAnyRoleCheck,
    getPermissions,
    getAccessibleNavItems,
    updatePermissionMatrix,
    resetPermissionMatrix,
    currentRole: role || null,
  }), [
    canAccess,
    canPerform,
    hasRoleCheck,
    hasAnyRoleCheck,
    getPermissions,
    getAccessibleNavItems,
    updatePermissionMatrix,
    resetPermissionMatrix,
    role,
  ]);

  return (
    <RBACContext.Provider value={contextValue}>
      {children}
    </RBACContext.Provider>
  );
}

RBACProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the RBAC context.
 * Must be used within an RBACProvider (which must be within an AuthProvider).
 *
 * @returns {RBACContextValue} The RBAC context value.
 * @throws {Error} If used outside of an RBACProvider.
 */
export function useRBAC() {
  const context = useContext(RBACContext);

  if (context === null) {
    throw new Error('useRBAC must be used within an RBACProvider. Wrap your component tree with <RBACProvider>.');
  }

  return context;
}

export default RBACContext;