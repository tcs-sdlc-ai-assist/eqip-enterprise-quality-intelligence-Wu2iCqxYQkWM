import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { STORAGE_KEYS, ROLES, PERSONA_ROLE_MAP } from '../constants.js';
import { getItem, setItem, removeItem } from '../utils/localStorage.js';
import { getAllUsers, getUserById } from '../data/users.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module AuthContext
 * Authentication context provider for eQIP Quality Intelligence.
 * Manages mock login (user selection from pre-provisioned list), logout,
 * session persistence in localStorage, and current user state.
 * Provides useAuth() hook for consuming components.
 */

/**
 * @typedef {object} AuthContextValue
 * @property {object|null} user - The currently authenticated user object, or null if not logged in.
 * @property {string|null} role - The current user's RBAC role string, or null if not logged in.
 * @property {string|null} userId - The current user's ID, or null if not logged in.
 * @property {boolean} isAuthenticated - Whether a user is currently authenticated.
 * @property {boolean} isLoading - Whether the auth state is being initialized from storage.
 * @property {function} login - Function to log in as a specific user by ID.
 * @property {function} logout - Function to log out the current user.
 * @property {function} switchRole - Function to switch the current user's active role.
 * @property {function} getAvailableUsers - Function to get the list of available users for login.
 * @property {function} hasRole - Function to check if the current user has a specific role.
 * @property {function} hasAnyRole - Function to check if the current user has any of the specified roles.
 */

const AuthContext = createContext(null);

/**
 * Default user ID used when no session is found in localStorage.
 * @type {string}
 */
const DEFAULT_USER_ID = 'user-001';

/**
 * AuthProvider component that wraps the application and provides authentication state.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render within the provider.
 * @returns {React.ReactElement} The AuthContext.Provider wrapping children.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize auth state from localStorage on mount.
   */
  useEffect(() => {
    try {
      const storedProfile = getItem(STORAGE_KEYS.USER_PROFILE, null);
      const storedRole = getItem(STORAGE_KEYS.SELECTED_ROLE, null);

      if (storedProfile && typeof storedProfile === 'object' && storedProfile.id) {
        const freshUser = getUserById(storedProfile.id);

        if (freshUser) {
          setUser(freshUser);
          setRole(storedRole || freshUser.role || ROLES.VIEWER);
        } else {
          setUser(storedProfile);
          setRole(storedRole || storedProfile.role || ROLES.VIEWER);
        }
      } else {
        const defaultUser = getUserById(DEFAULT_USER_ID);

        if (defaultUser) {
          setUser(defaultUser);
          setRole(defaultUser.role || ROLES.ADMIN);
          setItem(STORAGE_KEYS.USER_PROFILE, defaultUser);
          setItem(STORAGE_KEYS.SELECTED_ROLE, defaultUser.role || ROLES.ADMIN);
        }
      }
    } catch (err) {
      console.error('[AuthContext] Error initializing auth state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log in as a specific user by their user ID.
   * Persists the user profile and role to localStorage.
   *
   * @param {string} userId - The user ID to log in as.
   * @returns {boolean} True if login was successful, false otherwise.
   */
  const login = useCallback((userId) => {
    if (!userId || typeof userId !== 'string') {
      console.warn('[AuthContext] Invalid user ID for login.');
      return false;
    }

    const selectedUser = getUserById(userId);

    if (!selectedUser) {
      console.warn(`[AuthContext] User not found: ${userId}`);
      return false;
    }

    const userRole = selectedUser.role || ROLES.VIEWER;

    setUser(selectedUser);
    setRole(userRole);

    setItem(STORAGE_KEYS.USER_PROFILE, selectedUser);
    setItem(STORAGE_KEYS.SELECTED_ROLE, userRole);
    setItem(STORAGE_KEYS.AUTH_TOKEN, `mock-token-${userId}-${Date.now()}`);

    const now = new Date().toISOString();
    const updatedUser = { ...selectedUser, lastLogin: now };
    setUser(updatedUser);
    setItem(STORAGE_KEYS.USER_PROFILE, updatedUser);

    logAction(
      userId,
      'Login',
      'auth',
      userId,
      `User logged in as ${selectedUser.persona || selectedUser.role} (${userRole})`,
    );

    return true;
  }, []);

  /**
   * Log out the current user.
   * Clears the user profile and auth token from localStorage.
   * Preserves non-auth preferences (theme, sidebar state, etc.).
   */
  const logout = useCallback(() => {
    const currentUserId = user ? user.id : 'unknown';

    logAction(
      currentUserId,
      'Logout',
      'auth',
      currentUserId,
      'User logged out',
    );

    setUser(null);
    setRole(null);

    removeItem(STORAGE_KEYS.USER_PROFILE);
    removeItem(STORAGE_KEYS.SELECTED_ROLE);
    removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }, [user]);

  /**
   * Switch the current user's active role.
   * Only allows switching to a valid RBAC role.
   * Persists the new role to localStorage.
   *
   * @param {string} newRole - The new role to switch to.
   * @returns {boolean} True if the role switch was successful, false otherwise.
   */
  const switchRole = useCallback((newRole) => {
    if (!newRole || typeof newRole !== 'string') {
      console.warn('[AuthContext] Invalid role for switchRole.');
      return false;
    }

    const validRoles = Object.values(ROLES);

    if (!validRoles.includes(newRole)) {
      console.warn(`[AuthContext] Invalid role: ${newRole}. Must be one of: ${validRoles.join(', ')}`);
      return false;
    }

    if (!user) {
      console.warn('[AuthContext] Cannot switch role — no user is logged in.');
      return false;
    }

    const previousRole = role;

    setRole(newRole);
    setItem(STORAGE_KEYS.SELECTED_ROLE, newRole);

    logAction(
      user.id,
      'Switch Role',
      'auth',
      user.id,
      `Role switched from "${previousRole}" to "${newRole}"`,
    );

    return true;
  }, [user, role]);

  /**
   * Get the list of all available users for the login selector.
   *
   * @returns {Array<object>} Array of user objects available for login.
   */
  const getAvailableUsers = useCallback(() => {
    try {
      return getAllUsers();
    } catch (err) {
      console.error('[AuthContext] Error getting available users:', err);
      return [];
    }
  }, []);

  /**
   * Check if the current user has a specific role.
   *
   * @param {string} targetRole - The role to check for.
   * @returns {boolean} True if the current user has the specified role.
   */
  const hasRole = useCallback((targetRole) => {
    if (!role || !targetRole) {
      return false;
    }
    return role === targetRole;
  }, [role]);

  /**
   * Check if the current user has any of the specified roles.
   *
   * @param {Array<string>} targetRoles - Array of roles to check against.
   * @returns {boolean} True if the current user has any of the specified roles.
   */
  const hasAnyRole = useCallback((targetRoles) => {
    if (!role || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return false;
    }
    return targetRoles.includes(role);
  }, [role]);

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(() => ({
    user,
    role,
    userId: user ? user.id : null,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    switchRole,
    getAvailableUsers,
    hasRole,
    hasAnyRole,
  }), [user, role, isLoading, login, logout, switchRole, getAvailableUsers, hasRole, hasAnyRole]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue} The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider. Wrap your component tree with <AuthProvider>.');
  }

  return context;
}

export default AuthContext;