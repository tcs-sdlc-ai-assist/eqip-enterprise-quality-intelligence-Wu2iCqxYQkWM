import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext.jsx';
import { logAction } from '../utils/auditLogger.js';
import { getItem, setItem } from '../utils/localStorage.js';
import {
  getNotifications,
  getNotificationsList,
  getNotificationDetail,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadNotifications,
  getUnreadCount,
  getRecentNotifications,
  getCriticalNotifications,
  getNotificationsByType,
  getNotificationsByPriority,
  getNotificationsByReadStatus,
  getNotificationCountByType,
  getNotificationCountByPriority,
  getNotificationCountByReadStatus,
  getNotificationSummary,
  getNotificationFilterOptions,
  searchNotifications,
  getNotificationsForEntity,
  getRoutingConfig,
  setRoutingConfig,
  resetRoutingConfig,
} from '../services/notificationService.js';

/**
 * @module NotificationContext
 * React Context provider for notification state in eQIP Quality Intelligence.
 * Manages in-app notification list, unread count, and notification preferences.
 * Provides useNotifications() hook for consuming components.
 */

/**
 * @typedef {object} NotificationContextValue
 * @property {Array<object>} notifications - The current list of notifications for the user.
 * @property {number} unreadCount - The number of unread notifications.
 * @property {boolean} isLoading - Whether notifications are being loaded.
 * @property {string|null} error - Error message if loading failed.
 * @property {object} preferences - Notification preferences for the current user.
 * @property {function} fetchNotifications - Fetch/refresh notifications for the current user.
 * @property {function} getNotificationById - Get a single notification by ID.
 * @property {function} markNotificationAsRead - Mark a notification as read.
 * @property {function} markNotificationAsUnread - Mark a notification as unread.
 * @property {function} markAllNotificationsAsRead - Mark all notifications as read.
 * @property {function} createNewNotification - Create a new notification.
 * @property {function} removeNotification - Delete a notification.
 * @property {function} getUnread - Get all unread notifications.
 * @property {function} getRecent - Get recent notifications.
 * @property {function} getCritical - Get critical notifications.
 * @property {function} getByType - Get notifications grouped by type.
 * @property {function} getByPriority - Get notifications grouped by priority.
 * @property {function} getByReadStatus - Get notifications grouped by read status.
 * @property {function} getCountByType - Get notification count by type.
 * @property {function} getCountByPriority - Get notification count by priority.
 * @property {function} getCountByReadStatus - Get notification count by read status.
 * @property {function} getSummary - Get notification summary.
 * @property {function} getFilterOptions - Get filter options for notification screens.
 * @property {function} searchByQuery - Search notifications by query.
 * @property {function} getForEntity - Get notifications for a specific entity.
 * @property {function} updatePreferences - Update notification preferences.
 * @property {function} refreshUnreadCount - Refresh the unread count.
 */

const NotificationContext = createContext(null);

/**
 * localStorage key for notification preferences.
 * @type {string}
 */
const NOTIFICATION_PREFERENCES_KEY = 'eqip_notification_preferences';

/**
 * Default notification preferences.
 * @type {Readonly<object>}
 */
const DEFAULT_PREFERENCES = Object.freeze({
  enabled: true,
  showBadge: true,
  playSound: false,
  autoMarkReadOnView: false,
  groupByType: false,
  defaultSortKey: 'created_at',
  defaultSortDirection: 'desc',
  defaultPageSize: 25,
  priorityFilter: null,
  typeFilter: null,
  channelFilter: null,
});

/**
 * Load notification preferences from localStorage.
 * @returns {object} The notification preferences.
 */
function loadPreferences() {
  const stored = getItem(NOTIFICATION_PREFERENCES_KEY, null);
  if (stored && typeof stored === 'object') {
    return { ...DEFAULT_PREFERENCES, ...stored };
  }
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Save notification preferences to localStorage.
 * @param {object} preferences - The preferences to save.
 * @returns {boolean} True if successful.
 */
function savePreferences(preferences) {
  return setItem(NOTIFICATION_PREFERENCES_KEY, preferences);
}

/**
 * NotificationProvider component that wraps the application and provides
 * notification state. Reads notifications from notificationService and
 * provides CRUD operations and filtering to all child components.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render within the provider.
 * @returns {React.ReactElement} The NotificationContext.Provider wrapping children.
 */
export function NotificationProvider({ children }) {
  const { user, role, userId, isAuthenticated } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(loadPreferences);
  const [dataVersion, setDataVersion] = useState(0);

  /**
   * Fetch notifications for the current user.
   * Loads notifications from the notification service and updates state.
   *
   * @param {object} [options={}] - Query options.
   * @param {object} [options.filters] - Filter criteria.
   * @param {string} [options.query] - Search query.
   * @param {string} [options.sortKey] - Sort key.
   * @param {string} [options.sortDirection] - Sort direction.
   * @param {number} [options.page] - Page number.
   * @param {number} [options.pageSize] - Page size.
   * @returns {object} The notification result with items and pagination.
   */
  const fetchNotifications = useCallback((options = {}) => {
    if (!isAuthenticated || !userId) {
      setNotifications([]);
      setUnreadCount(0);
      return {
        items: [],
        page: 1,
        pageSize: options.pageSize || preferences.defaultPageSize || 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        filteredTotal: 0,
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = getNotifications(userId, {
        filters: options.filters || undefined,
        query: options.query || undefined,
        sortKey: options.sortKey || preferences.defaultSortKey || 'created_at',
        sortDirection: options.sortDirection || preferences.defaultSortDirection || 'desc',
        page: options.page || 1,
        pageSize: options.pageSize || preferences.defaultPageSize || 25,
        role: role || 'viewer',
      });

      setNotifications(result.items || []);

      const count = getUnreadCount(userId, role || 'viewer');
      setUnreadCount(count);

      setIsLoading(false);
      return result;
    } catch (err) {
      console.error('[NotificationContext] Error fetching notifications:', err);
      setError('Failed to load notifications.');
      setIsLoading(false);
      return {
        items: [],
        page: 1,
        pageSize: options.pageSize || 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        filteredTotal: 0,
      };
    }
  }, [isAuthenticated, userId, role, preferences.defaultSortKey, preferences.defaultSortDirection, preferences.defaultPageSize]);

  /**
   * Initialize notifications when user changes.
   */
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, userId, dataVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Refresh the unread count without reloading all notifications.
   *
   * @returns {number} The updated unread count.
   */
  const refreshUnreadCount = useCallback(() => {
    if (!isAuthenticated || !userId) {
      setUnreadCount(0);
      return 0;
    }

    try {
      const count = getUnreadCount(userId, role || 'viewer');
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error('[NotificationContext] Error refreshing unread count:', err);
      return unreadCount;
    }
  }, [isAuthenticated, userId, role, unreadCount]);

  /**
   * Get a single notification by ID.
   *
   * @param {string} id - The notification ID.
   * @returns {object|null} The notification object, or null if not found.
   */
  const getNotificationByIdFn = useCallback((id) => {
    if (!id || typeof id !== 'string') {
      return null;
    }

    try {
      return getNotificationDetail(id, role || 'viewer');
    } catch (err) {
      console.error(`[NotificationContext] Error getting notification ${id}:`, err);
      return null;
    }
  }, [role]);

  /**
   * Mark a notification as read.
   *
   * @param {string} id - The notification ID to mark as read.
   * @returns {object|null} The updated notification, or null on failure.
   */
  const markNotificationAsRead = useCallback((id) => {
    if (!id || typeof id !== 'string') {
      return null;
    }

    if (!isAuthenticated || !userId) {
      return null;
    }

    try {
      const result = markAsRead(id, userId, role || 'viewer');

      if (result) {
        setDataVersion((prev) => prev + 1);
      }

      return result;
    } catch (err) {
      console.error(`[NotificationContext] Error marking notification ${id} as read:`, err);
      return null;
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Mark a notification as unread.
   *
   * @param {string} id - The notification ID to mark as unread.
   * @returns {object|null} The updated notification, or null on failure.
   */
  const markNotificationAsUnread = useCallback((id) => {
    if (!id || typeof id !== 'string') {
      return null;
    }

    if (!isAuthenticated || !userId) {
      return null;
    }

    try {
      const result = markAsUnread(id, userId, role || 'viewer');

      if (result) {
        setDataVersion((prev) => prev + 1);
      }

      return result;
    } catch (err) {
      console.error(`[NotificationContext] Error marking notification ${id} as unread:`, err);
      return null;
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Mark all notifications as read for the current user.
   *
   * @returns {number} The number of notifications marked as read.
   */
  const markAllNotificationsAsRead = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return 0;
    }

    try {
      const count = markAllAsRead(userId, role || 'viewer');

      if (count > 0) {
        setDataVersion((prev) => prev + 1);
      }

      return count;
    } catch (err) {
      console.error('[NotificationContext] Error marking all notifications as read:', err);
      return 0;
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Create a new notification.
   *
   * @param {object} event - The notification event data.
   * @param {string} event.type - The notification type.
   * @param {string} event.recipient - The recipient user ID.
   * @param {string} event.subject - The notification subject.
   * @param {string} event.message - The notification message.
   * @param {string} [event.triggeredBy] - The user ID that triggered the event.
   * @param {string} [event.entityType] - The entity type.
   * @param {string} [event.entityId] - The entity ID.
   * @param {string} [event.actionUrl] - The action URL.
   * @param {string} [event.channel] - Override channel.
   * @param {string} [event.priority] - Override priority.
   * @param {Array<string>} [event.tags] - Tags.
   * @returns {object|null} The created notification, or null on failure.
   */
  const createNewNotification = useCallback((event) => {
    if (!isAuthenticated || !userId) {
      return null;
    }

    if (!event || typeof event !== 'object') {
      return null;
    }

    try {
      const result = createNotification(event, userId, role || 'viewer');

      if (result) {
        setDataVersion((prev) => prev + 1);
      }

      return result;
    } catch (err) {
      console.error('[NotificationContext] Error creating notification:', err);
      return null;
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Delete a notification.
   *
   * @param {string} id - The notification ID to delete.
   * @returns {boolean} True if the notification was deleted.
   */
  const removeNotification = useCallback((id) => {
    if (!id || typeof id !== 'string') {
      return false;
    }

    if (!isAuthenticated || !userId) {
      return false;
    }

    try {
      const result = deleteNotification(id, userId, role || 'viewer');

      if (result) {
        setDataVersion((prev) => prev + 1);
      }

      return result;
    } catch (err) {
      console.error(`[NotificationContext] Error deleting notification ${id}:`, err);
      return false;
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get all unread notifications for the current user.
   *
   * @returns {Array<object>} Array of unread notifications.
   */
  const getUnread = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return [];
    }

    try {
      return getUnreadNotifications(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting unread notifications:', err);
      return [];
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get recent notifications for the current user.
   *
   * @param {number} [limit=10] - Maximum number of notifications to return.
   * @returns {Array<object>} Array of recent notifications.
   */
  const getRecent = useCallback((limit = 10) => {
    if (!isAuthenticated || !userId) {
      return [];
    }

    try {
      return getRecentNotifications(userId, limit, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting recent notifications:', err);
      return [];
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get critical notifications for the current user.
   *
   * @returns {Array<object>} Array of critical notifications.
   */
  const getCritical = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return [];
    }

    try {
      return getCriticalNotifications(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting critical notifications:', err);
      return [];
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notifications grouped by type for the current user.
   *
   * @returns {object} Object with type keys and arrays of notifications.
   */
  const getByType = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {};
    }

    try {
      return getNotificationsByType(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notifications by type:', err);
      return {};
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notifications grouped by priority for the current user.
   *
   * @returns {object} Object with priority keys and arrays of notifications.
   */
  const getByPriority = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {};
    }

    try {
      return getNotificationsByPriority(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notifications by priority:', err);
      return {};
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notifications grouped by read status for the current user.
   *
   * @returns {{ read: Array<object>, unread: Array<object> }} Object with read and unread arrays.
   */
  const getByReadStatus = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return { read: [], unread: [] };
    }

    try {
      return getNotificationsByReadStatus(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notifications by read status:', err);
      return { read: [], unread: [] };
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notification count grouped by type for the current user.
   *
   * @returns {object} Object with type keys and count values.
   */
  const getCountByType = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {};
    }

    try {
      return getNotificationCountByType(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notification count by type:', err);
      return {};
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notification count grouped by priority for the current user.
   *
   * @returns {object} Object with priority keys and count values.
   */
  const getCountByPriority = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {};
    }

    try {
      return getNotificationCountByPriority(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notification count by priority:', err);
      return {};
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notification count grouped by read status for the current user.
   *
   * @returns {{ read: number, unread: number }} Object with read and unread counts.
   */
  const getCountByReadStatus = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return { read: 0, unread: 0 };
    }

    try {
      return getNotificationCountByReadStatus(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notification count by read status:', err);
      return { read: 0, unread: 0 };
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get a comprehensive summary of notification metrics for the current user.
   *
   * @returns {object} Summary object with notification metrics.
   */
  const getSummary = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {
        total: 0,
        read: 0,
        unread: 0,
        readRate: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        inApp: 0,
        email: 0,
      };
    }

    try {
      return getNotificationSummary(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notification summary:', err);
      return {
        total: 0,
        read: 0,
        unread: 0,
        readRate: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        inApp: 0,
        email: 0,
      };
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get distinct filter options for notification screens.
   *
   * @returns {object} Object with arrays of distinct values for each filter dimension.
   */
  const getFilterOptions = useCallback(() => {
    if (!isAuthenticated || !userId) {
      return {
        types: [],
        priorities: [],
        channels: [],
        statuses: [],
      };
    }

    try {
      return getNotificationFilterOptions(userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error getting notification filter options:', err);
      return {
        types: [],
        priorities: [],
        channels: [],
        statuses: [],
      };
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Search notifications by query text.
   *
   * @param {string} query - The search query.
   * @returns {Array<object>} Array of matching notifications.
   */
  const searchByQuery = useCallback((query) => {
    if (!query || typeof query !== 'string') {
      return [];
    }

    if (!isAuthenticated || !userId) {
      return [];
    }

    try {
      return searchNotifications(query, userId, role || 'viewer');
    } catch (err) {
      console.error('[NotificationContext] Error searching notifications:', err);
      return [];
    }
  }, [isAuthenticated, userId, role]);

  /**
   * Get notifications for a specific entity.
   *
   * @param {string} entityType - The entity type.
   * @param {string} entityId - The entity ID.
   * @returns {Array<object>} Array of notifications for the entity.
   */
  const getForEntity = useCallback((entityType, entityId) => {
    if (!entityType || typeof entityType !== 'string') {
      return [];
    }

    if (!entityId || typeof entityId !== 'string') {
      return [];
    }

    try {
      return getNotificationsForEntity(entityType, entityId, role || 'viewer');
    } catch (err) {
      console.error(`[NotificationContext] Error getting notifications for entity ${entityType}/${entityId}:`, err);
      return [];
    }
  }, [role]);

  /**
   * Update notification preferences.
   * Merges provided updates with existing preferences and persists to localStorage.
   *
   * @param {object} updates - Partial preferences to update.
   * @returns {object} The updated preferences.
   */
  const updatePreferences = useCallback((updates) => {
    if (!updates || typeof updates !== 'object') {
      return preferences;
    }

    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    savePreferences(updated);

    if (userId) {
      logAction(
        userId,
        'Update Notification Preferences',
        'notifications',
        'preferences',
        `Updated notification preferences: ${Object.keys(updates).join(', ')}`,
      );
    }

    return updated;
  }, [preferences, userId]);

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    fetchNotifications,
    getNotificationById: getNotificationByIdFn,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    createNewNotification,
    removeNotification,
    getUnread,
    getRecent,
    getCritical,
    getByType,
    getByPriority,
    getByReadStatus,
    getCountByType,
    getCountByPriority,
    getCountByReadStatus,
    getSummary,
    getFilterOptions,
    searchByQuery,
    getForEntity,
    updatePreferences,
    refreshUnreadCount,
  }), [
    notifications,
    unreadCount,
    isLoading,
    error,
    preferences,
    fetchNotifications,
    getNotificationByIdFn,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    createNewNotification,
    removeNotification,
    getUnread,
    getRecent,
    getCritical,
    getByType,
    getByPriority,
    getByReadStatus,
    getCountByType,
    getCountByPriority,
    getCountByReadStatus,
    getSummary,
    getFilterOptions,
    searchByQuery,
    getForEntity,
    updatePreferences,
    refreshUnreadCount,
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook to access the notification context.
 * Must be used within a NotificationProvider (which must be within an AuthProvider).
 *
 * @returns {NotificationContextValue} The notification context value.
 * @throws {Error} If used outside of a NotificationProvider.
 */
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (context === null) {
    throw new Error('useNotifications must be used within a NotificationProvider. Wrap your component tree with <NotificationProvider>.');
  }

  return context;
}

export default NotificationContext;