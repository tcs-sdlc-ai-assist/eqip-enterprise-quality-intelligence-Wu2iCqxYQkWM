import { v4 as uuidv4 } from 'uuid';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  find,
  count,
  apiGetAll,
  apiGetById,
  apiCreate,
  apiUpdate,
  ENTITY_TYPES,
} from '../data/mockDataStore.js';
import { maskEntity } from '../utils/piiMasker.js';
import { logAction } from '../utils/auditLogger.js';
import { applyFilters, searchByText, sortData, paginateData, processData } from '../utils/filterUtils.js';
import { ROLES } from '../constants.js';

/**
 * @module notificationService
 * Notification simulation service for eQIP Quality Intelligence.
 * Provides getNotifications, markAsRead, createNotification, and related operations.
 * Simulates in-app alerts for workflow events with configurable routing.
 * No real notifications are sent — all operations are simulated via mockDataStore
 * and localStorage.
 */

/**
 * The entity type key for notifications.
 * @type {string}
 */
const NOTIFICATION_ENTITY_TYPE = ENTITY_TYPES.NOTIFICATIONS;

/**
 * Roles that can view all notifications across all recipients.
 * @type {Set<string>}
 */
const ALL_NOTIFICATIONS_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Roles that can view notifications (their own).
 * @type {Set<string>}
 */
const VIEW_ROLES = new Set([
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
 * Roles that can create notifications (trigger workflow events).
 * @type {Set<string>}
 */
const CREATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
]);

/**
 * Roles that can mark notifications as read.
 * @type {Set<string>}
 */
const MARK_READ_ROLES = new Set([
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
 * Roles that can delete notifications.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Default notification routing configuration.
 * Maps event types to default channels and priority levels.
 * @type {Readonly<object>}
 */
const DEFAULT_ROUTING_CONFIG = Object.freeze({
  release_status_change: { channel: 'in_app', priority: 'high' },
  release_deployed: { channel: 'in_app', priority: 'medium' },
  release_at_risk: { channel: 'in_app', priority: 'critical' },
  release_approval_request: { channel: 'in_app', priority: 'high' },
  release_approval_complete: { channel: 'in_app', priority: 'medium' },
  quality_gate_failure: { channel: 'in_app', priority: 'critical' },
  quality_gate_passed: { channel: 'in_app', priority: 'low' },
  waiver_request: { channel: 'in_app', priority: 'high' },
  waiver_approved: { channel: 'in_app', priority: 'medium' },
  waiver_rejected: { channel: 'in_app', priority: 'high' },
  defect_critical: { channel: 'email', priority: 'critical' },
  demand_status_change: { channel: 'in_app', priority: 'medium' },
  demand_completed: { channel: 'in_app', priority: 'low' },
  demand_comment: { channel: 'in_app', priority: 'medium' },
  demand_approval_required: { channel: 'in_app', priority: 'medium' },
  demand_on_hold: { channel: 'in_app', priority: 'low' },
  demand_security_patch: { channel: 'email', priority: 'critical' },
  test_execution_failure: { channel: 'in_app', priority: 'high' },
  test_suite_execution_complete: { channel: 'in_app', priority: 'low' },
  test_data_refresh_failed: { channel: 'in_app', priority: 'high' },
  test_data_stale: { channel: 'in_app', priority: 'medium' },
  environment_degraded: { channel: 'in_app', priority: 'high' },
  environment_conflict: { channel: 'in_app', priority: 'critical' },
  environment_reservation: { channel: 'in_app', priority: 'low' },
  governance_finding: { channel: 'email', priority: 'critical' },
  governance_review_due: { channel: 'email', priority: 'medium' },
  governance_finding_resolved: { channel: 'in_app', priority: 'low' },
  integration_disconnected: { channel: 'in_app', priority: 'critical' },
  integration_sync_warning: { channel: 'in_app', priority: 'medium' },
  compliance_score_drop: { channel: 'email', priority: 'high' },
  security_scan_complete: { channel: 'in_app', priority: 'low' },
  performance_test_complete: { channel: 'in_app', priority: 'low' },
  drug_interaction_alert: { channel: 'email', priority: 'critical' },
  hipaa_compliance_update: { channel: 'email', priority: 'medium' },
  metrics_recalculated: { channel: 'in_app', priority: 'low' },
  application_quality_drop: { channel: 'in_app', priority: 'critical' },
});

/**
 * Mutable routing configuration that can be updated at runtime.
 * @type {object}
 */
let _routingConfig = { ...DEFAULT_ROUTING_CONFIG };

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'create', 'mark_read', 'delete').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return VIEW_ROLES.has(role);
    case 'create':
      return CREATE_ROLES.has(role);
    case 'mark_read':
      return MARK_READ_ROLES.has(role);
    case 'delete':
      return DELETE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Apply role-based scoping to notifications.
 * Admin can see all notifications. Other roles see only their own notifications.
 *
 * @param {Array<object>} notifications - The notifications to scope.
 * @param {string} role - The user role.
 * @param {string} [userId] - The user ID for scoping.
 * @returns {Array<object>} The scoped notifications.
 */
function applyScopeByRole(notifications, role, userId) {
  if (!Array.isArray(notifications)) {
    return [];
  }

  if (ALL_NOTIFICATIONS_ROLES.has(role)) {
    return notifications;
  }

  if (!userId) {
    return notifications;
  }

  return notifications.filter((notif) => notif.recipient === userId);
}

/**
 * Get the routing configuration for a given event type.
 * Falls back to default in_app/medium if the event type is not configured.
 *
 * @param {string} eventType - The notification event type.
 * @returns {{ channel: string, priority: string }} The routing configuration.
 */
function getRoutingForEvent(eventType) {
  if (!eventType || typeof eventType !== 'string') {
    return { channel: 'in_app', priority: 'medium' };
  }

  const config = _routingConfig[eventType];

  if (config) {
    return { ...config };
  }

  return { channel: 'in_app', priority: 'medium' };
}

// ---------------------------------------------------------------------------
// Routing Configuration Management
// ---------------------------------------------------------------------------

/**
 * Get the current notification routing configuration.
 *
 * @returns {object} The current routing configuration object.
 */
export function getRoutingConfig() {
  return { ..._routingConfig };
}

/**
 * Update the notification routing configuration.
 * Merges provided configuration with existing configuration.
 *
 * @param {object} config - Partial or full routing configuration to merge.
 * @returns {object} The updated routing configuration.
 */
export function setRoutingConfig(config) {
  if (!config || typeof config !== 'object') {
    return getRoutingConfig();
  }

  const keys = Object.keys(config);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = config[key];

    if (value && typeof value === 'object') {
      _routingConfig[key] = {
        channel: value.channel || 'in_app',
        priority: value.priority || 'medium',
      };
    }
  }

  return getRoutingConfig();
}

/**
 * Reset the notification routing configuration to defaults.
 *
 * @returns {object} The default routing configuration.
 */
export function resetRoutingConfig() {
  _routingConfig = { ...DEFAULT_ROUTING_CONFIG };
  return getRoutingConfig();
}

// ---------------------------------------------------------------------------
// Core Notification Operations
// ---------------------------------------------------------------------------

/**
 * Get notifications for a specific user with optional filtering, searching,
 * sorting, and pagination. Applies role-based scoping and PII masking.
 *
 * @param {string} userId - The user ID to get notifications for.
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { type: 'release_status_change', priority: 'critical' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='desc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getNotifications(userId, options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
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

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);

  notifications = applyScopeByRole(notifications, role, userId);

  const result = processData(notifications, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['type', 'subject', 'message', 'priority', 'status', 'channel'],
    sortKey: options.sortKey || 'created_at',
    sortDirection: options.sortDirection || 'desc',
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((notif) => maskEntity(notif, role));

  return result;
}

/**
 * Get all notifications for a specific user without pagination (simple list).
 * Applies role-based scoping and PII masking.
 *
 * @param {string} userId - The user ID to get notifications for.
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked notification objects.
 */
export function getNotificationsList(userId, filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);

  notifications = applyScopeByRole(notifications, role, userId);

  if (filters && Object.keys(filters).length > 0) {
    notifications = applyFilters(notifications, filters);
  }

  const sorted = sortData(notifications, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

/**
 * Get a single notification by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The notification ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked notification object, or null if not found.
 */
export function getNotificationDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const notification = getById(NOTIFICATION_ENTITY_TYPE, id);

  if (!notification) {
    return null;
  }

  return maskEntity(notification, role);
}

/**
 * Get a single notification by ID (alias for getNotificationDetail).
 *
 * @param {string} id - The notification ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked notification object, or null if not found.
 */
export function getNotificationById(id, role = ROLES.VIEWER) {
  return getNotificationDetail(id, role);
}

/**
 * Mark a notification as read.
 * Updates the readStatus and readAt fields.
 *
 * @param {string} id - The notification ID to mark as read.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked notification, or null if unauthorized or not found.
 */
export function markAsRead(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'mark_read')) {
    console.warn('[NotificationService] User does not have permission to mark notifications as read.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[NotificationService] Invalid notification ID for markAsRead.');
    return null;
  }

  const existing = getById(NOTIFICATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[NotificationService] Notification not found: ${id}`);
    return null;
  }

  if (!ALL_NOTIFICATIONS_ROLES.has(role) && existing.recipient !== userId) {
    console.warn(`[NotificationService] User ${userId} cannot mark notification ${id} as read — not the recipient.`);
    return null;
  }

  if (existing.readStatus === true) {
    return maskEntity(existing, role);
  }

  const now = new Date().toISOString();

  const updates = {
    readStatus: true,
    readAt: now,
  };

  const updated = update(NOTIFICATION_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[NotificationService] Failed to mark notification as read: ${id}`);
    return null;
  }

  logAction(userId, 'Mark Notification Read', NOTIFICATION_ENTITY_TYPE, id, `Marked notification as read: ${existing.subject || id}`);

  return maskEntity(updated, role);
}

/**
 * Mark a notification as unread.
 * Updates the readStatus and clears readAt.
 *
 * @param {string} id - The notification ID to mark as unread.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked notification, or null if unauthorized or not found.
 */
export function markAsUnread(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'mark_read')) {
    console.warn('[NotificationService] User does not have permission to mark notifications as unread.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[NotificationService] Invalid notification ID for markAsUnread.');
    return null;
  }

  const existing = getById(NOTIFICATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[NotificationService] Notification not found: ${id}`);
    return null;
  }

  if (!ALL_NOTIFICATIONS_ROLES.has(role) && existing.recipient !== userId) {
    console.warn(`[NotificationService] User ${userId} cannot mark notification ${id} as unread — not the recipient.`);
    return null;
  }

  if (existing.readStatus === false) {
    return maskEntity(existing, role);
  }

  const updates = {
    readStatus: false,
    readAt: null,
  };

  const updated = update(NOTIFICATION_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[NotificationService] Failed to mark notification as unread: ${id}`);
    return null;
  }

  logAction(userId, 'Mark Notification Unread', NOTIFICATION_ENTITY_TYPE, id, `Marked notification as unread: ${existing.subject || id}`);

  return maskEntity(updated, role);
}

/**
 * Mark all notifications as read for a specific user.
 *
 * @param {string} userId - The user ID whose notifications should be marked as read.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} The number of notifications marked as read.
 */
export function markAllAsRead(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'mark_read')) {
    console.warn('[NotificationService] User does not have permission to mark notifications as read.');
    return 0;
  }

  if (!userId || typeof userId !== 'string') {
    console.warn('[NotificationService] Invalid user ID for markAllAsRead.');
    return 0;
  }

  const notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  const now = new Date().toISOString();
  let markedCount = 0;

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];

    if (notif.recipient === userId && notif.readStatus === false) {
      const updated = update(NOTIFICATION_ENTITY_TYPE, notif.id, {
        readStatus: true,
        readAt: now,
      }, userId);

      if (updated) {
        markedCount += 1;
      }
    }
  }

  if (markedCount > 0) {
    logAction(userId, 'Mark All Notifications Read', NOTIFICATION_ENTITY_TYPE, 'bulk', `Marked ${markedCount} notification(s) as read`);
  }

  return markedCount;
}

/**
 * Create a new notification for a workflow event.
 * Applies routing configuration to determine channel and priority.
 * No real notification is sent — the notification is stored in mockDataStore.
 *
 * @param {object} event - The workflow event data.
 * @param {string} event.type - The notification type (e.g., 'release_status_change', 'quality_gate_failure').
 * @param {string} event.recipient - The recipient user ID.
 * @param {string} event.subject - The notification subject.
 * @param {string} event.message - The notification message body.
 * @param {string} [event.triggeredBy='system'] - The user ID that triggered the event.
 * @param {string} [event.entityType] - The entity type related to the notification.
 * @param {string} [event.entityId] - The entity ID related to the notification.
 * @param {string} [event.actionUrl] - The URL to navigate to when the notification is clicked.
 * @param {string} [event.channel] - Override the default channel from routing config.
 * @param {string} [event.priority] - Override the default priority from routing config.
 * @param {Array<string>} [event.tags] - Tags for the notification.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked notification, or null if unauthorized or invalid.
 */
export function createNotification(event, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[NotificationService] User does not have permission to create notifications.');
    return null;
  }

  if (!event || typeof event !== 'object') {
    console.warn('[NotificationService] Invalid event data for createNotification.');
    return null;
  }

  if (!event.type || typeof event.type !== 'string') {
    console.warn('[NotificationService] Notification type is required.');
    return null;
  }

  if (!event.recipient || typeof event.recipient !== 'string') {
    console.warn('[NotificationService] Notification recipient is required.');
    return null;
  }

  if (!event.subject || typeof event.subject !== 'string') {
    console.warn('[NotificationService] Notification subject is required.');
    return null;
  }

  if (!event.message || typeof event.message !== 'string') {
    console.warn('[NotificationService] Notification message is required.');
    return null;
  }

  const routing = getRoutingForEvent(event.type);

  const now = new Date().toISOString();

  const notificationData = {
    id: `notif-${uuidv4().slice(0, 8)}`,
    type: event.type,
    channel: event.channel || routing.channel,
    recipient: event.recipient,
    subject: event.subject,
    message: event.message,
    status: 'delivered',
    priority: event.priority || routing.priority,
    triggeredBy: event.triggeredBy || userId,
    entityType: event.entityType || null,
    entityId: event.entityId || null,
    readStatus: false,
    readAt: null,
    actionUrl: event.actionUrl || null,
    tags: Array.isArray(event.tags) ? event.tags : [],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: 'system',
    updated_by: 'system',
  };

  const created = create(NOTIFICATION_ENTITY_TYPE, notificationData, 'system');

  if (!created) {
    console.warn('[NotificationService] Failed to create notification.');
    return null;
  }

  logAction(
    userId,
    'Create Notification',
    NOTIFICATION_ENTITY_TYPE,
    created.id,
    `Created notification "${created.subject}" for recipient ${created.recipient} (type: ${created.type}, channel: ${created.channel}, priority: ${created.priority})`,
  );

  return maskEntity(created, role);
}

/**
 * Delete a notification by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The notification ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the notification was deleted, false otherwise.
 */
export function deleteNotification(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[NotificationService] User does not have permission to delete notifications.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[NotificationService] Invalid notification ID for delete.');
    return false;
  }

  const existing = getById(NOTIFICATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[NotificationService] Notification not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(NOTIFICATION_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Notification', NOTIFICATION_ENTITY_TYPE, id, `Deleted notification: ${existing.subject || id}`);
  }

  return deleted;
}

// ---------------------------------------------------------------------------
// Grouped & Filtered Accessors
// ---------------------------------------------------------------------------

/**
 * Get notifications grouped by type for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and arrays of masked notifications.
 */
export function getNotificationsByType(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const grouped = {};

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    const type = notif.type || 'unknown';

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(maskEntity(notif, role));
  }

  return grouped;
}

/**
 * Get notifications grouped by priority for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with priority keys and arrays of masked notifications.
 */
export function getNotificationsByPriority(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const grouped = {};

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    const priority = notif.priority || 'medium';

    if (!grouped[priority]) {
      grouped[priority] = [];
    }

    grouped[priority].push(maskEntity(notif, role));
  }

  return grouped;
}

/**
 * Get notifications grouped by channel for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with channel keys and arrays of masked notifications.
 */
export function getNotificationsByChannel(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const grouped = {};

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    const channel = notif.channel || 'in_app';

    if (!grouped[channel]) {
      grouped[channel] = [];
    }

    grouped[channel].push(maskEntity(notif, role));
  }

  return grouped;
}

/**
 * Get notifications grouped by read status for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {{ read: Array<object>, unread: Array<object> }} Object with read and unread arrays.
 */
export function getNotificationsByReadStatus(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return { read: [], unread: [] };
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const result = { read: [], unread: [] };

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];
    const masked = maskEntity(notif, role);

    if (notif.readStatus === true) {
      result.read.push(masked);
    } else {
      result.unread.push(masked);
    }
  }

  return result;
}

/**
 * Get unread notifications for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked unread notification objects.
 */
export function getUnreadNotifications(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const unread = notifications.filter((notif) => notif.readStatus === false);

  const sorted = sortData(unread, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

/**
 * Get read notifications for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked read notification objects.
 */
export function getReadNotifications(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const read = notifications.filter((notif) => notif.readStatus === true);

  const sorted = sortData(read, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

/**
 * Get notifications for a specific entity.
 *
 * @param {string} entityType - The entity type to filter by.
 * @param {string} entityId - The entity ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked notifications for the specified entity.
 */
export function getNotificationsForEntity(entityType, entityId, role = ROLES.VIEWER) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }

  if (!entityId || typeof entityId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const notifications = getAll(NOTIFICATION_ENTITY_TYPE);

  const filtered = notifications.filter(
    (notif) => notif.entityType === entityType && notif.entityId === entityId,
  );

  const sorted = sortData(filtered, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

/**
 * Get notifications triggered by a specific user.
 *
 * @param {string} triggeredBy - The user ID who triggered the notifications.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked notifications triggered by the user.
 */
export function getNotificationsTriggeredBy(triggeredBy, role = ROLES.VIEWER) {
  if (!triggeredBy || typeof triggeredBy !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const notifications = getAll(NOTIFICATION_ENTITY_TYPE);

  const filtered = notifications.filter((notif) => notif.triggeredBy === triggeredBy);

  const sorted = sortData(filtered, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

/**
 * Get recent notifications for a specific user, sorted by creation date descending.
 *
 * @param {string} userId - The user ID.
 * @param {number} [limit=10] - Maximum number of notifications to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked recent notification objects.
 */
export function getRecentNotifications(userId, limit = 10, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const sorted = sortData(notifications, 'created_at', 'desc');

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((notif) => maskEntity(notif, role));
}

/**
 * Get critical notifications for a specific user (priority === 'critical').
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked critical notification objects.
 */
export function getCriticalNotifications(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const critical = notifications.filter((notif) => notif.priority === 'critical');

  const sorted = sortData(critical, 'created_at', 'desc');

  return sorted.map((notif) => maskEntity(notif, role));
}

// ---------------------------------------------------------------------------
// Count Operations
// ---------------------------------------------------------------------------

/**
 * Get the total count of unread notifications for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} Total count of unread notifications.
 */
export function getUnreadCount(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  if (!userId || typeof userId !== 'string') {
    return 0;
  }

  const notifications = getAll(NOTIFICATION_ENTITY_TYPE);

  let count = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].recipient === userId && notifications[i].readStatus === false) {
      count += 1;
    }
  }

  return count;
}

/**
 * Get notification count grouped by type for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and count values.
 */
export function getNotificationCountByType(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const counts = {};

  for (let i = 0; i < notifications.length; i++) {
    const type = notifications[i].type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}

/**
 * Get notification count grouped by priority for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with priority keys and count values.
 */
export function getNotificationCountByPriority(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const counts = {};

  for (let i = 0; i < notifications.length; i++) {
    const priority = notifications[i].priority || 'medium';
    counts[priority] = (counts[priority] || 0) + 1;
  }

  return counts;
}

/**
 * Get notification count grouped by channel for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with channel keys and count values.
 */
export function getNotificationCountByChannel(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const counts = {};

  for (let i = 0; i < notifications.length; i++) {
    const channel = notifications[i].channel || 'in_app';
    counts[channel] = (counts[channel] || 0) + 1;
  }

  return counts;
}

/**
 * Get notification count grouped by read status for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {{ read: number, unread: number }} Object with read and unread counts.
 */
export function getNotificationCountByReadStatus(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return { read: 0, unread: 0 };
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  let read = 0;
  let unread = 0;

  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].readStatus === true) {
      read += 1;
    } else {
      unread += 1;
    }
  }

  return { read, unread };
}

// ---------------------------------------------------------------------------
// Distinct Values & Filter Options
// ---------------------------------------------------------------------------

/**
 * Get distinct values for a specific field across all accessible notifications.
 *
 * @param {string} field - The field name to extract distinct values from.
 * @param {string} [userId] - The user ID for scoping.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(field, userId, role = ROLES.VIEWER) {
  if (!field || typeof field !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const values = new Set();

  for (let i = 0; i < notifications.length; i++) {
    const value = notifications[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Get distinct filter options for notification screens.
 *
 * @param {string} [userId] - The user ID for scoping.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with arrays of distinct values for each filter dimension.
 */
export function getNotificationFilterOptions(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      types: [],
      priorities: [],
      channels: [],
      statuses: [],
    };
  }

  return {
    types: getDistinctValues('type', userId, role),
    priorities: getDistinctValues('priority', userId, role),
    channels: getDistinctValues('channel', userId, role),
    statuses: getDistinctValues('status', userId, role),
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Search notifications by subject or message (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [userId] - The user ID for scoping.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of matching masked notification objects.
 */
export function searchNotifications(query, userId, role = ROLES.VIEWER) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const results = searchByText(notifications, query, ['subject', 'message', 'type', 'priority', 'channel']);

  return results.map((notif) => maskEntity(notif, role));
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Get a comprehensive summary of notification metrics for a specific user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Summary object with notification metrics.
 */
export function getNotificationSummary(userId, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
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

  let notifications = getAll(NOTIFICATION_ENTITY_TYPE);
  notifications = applyScopeByRole(notifications, role, userId);

  const total = notifications.length;
  let read = 0;
  let unread = 0;
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let inApp = 0;
  let email = 0;

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];

    if (notif.readStatus === true) {
      read += 1;
    } else {
      unread += 1;
    }

    if (notif.priority === 'critical') critical += 1;
    else if (notif.priority === 'high') high += 1;
    else if (notif.priority === 'medium') medium += 1;
    else if (notif.priority === 'low') low += 1;

    if (notif.channel === 'in_app') inApp += 1;
    else if (notif.channel === 'email') email += 1;
  }

  return {
    total,
    read,
    unread,
    readRate: total > 0 ? Math.round((read / total) * 10000) / 100 : 0,
    critical,
    high,
    medium,
    low,
    inApp,
    email,
  };
}

// ---------------------------------------------------------------------------
// Batch Notification Creation
// ---------------------------------------------------------------------------

/**
 * Create multiple notifications at once for a workflow event.
 * Useful for broadcasting notifications to multiple recipients.
 *
 * @param {object} event - The base workflow event data (same as createNotification).
 * @param {Array<string>} recipients - Array of recipient user IDs.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of created and masked notifications.
 */
export function createBulkNotifications(event, recipients, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[NotificationService] User does not have permission to create notifications.');
    return [];
  }

  if (!event || typeof event !== 'object') {
    console.warn('[NotificationService] Invalid event data for createBulkNotifications.');
    return [];
  }

  if (!Array.isArray(recipients) || recipients.length === 0) {
    console.warn('[NotificationService] Recipients array is required for bulk notification creation.');
    return [];
  }

  const created = [];

  for (let i = 0; i < recipients.length; i++) {
    const recipientId = recipients[i];

    if (!recipientId || typeof recipientId !== 'string') {
      continue;
    }

    const notification = createNotification(
      {
        ...event,
        recipient: recipientId,
      },
      userId,
      role,
    );

    if (notification) {
      created.push(notification);
    }
  }

  if (created.length > 0) {
    logAction(
      userId,
      'Create Bulk Notifications',
      NOTIFICATION_ENTITY_TYPE,
      'bulk',
      `Created ${created.length} notification(s) for event type "${event.type}" to ${recipients.length} recipient(s)`,
    );
  }

  return created;
}

// ---------------------------------------------------------------------------
// Simulated API Layer
// ---------------------------------------------------------------------------

/**
 * Simulate an API GET request for notifications.
 *
 * @param {string} userId - The user ID to get notifications for.
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetNotifications(userId, params = {}, role = ROLES.VIEWER) {
  try {
    const result = getNotifications(userId, { ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[NotificationService] apiGetNotifications error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for a single notification.
 *
 * @param {string} id - The notification ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetNotification(id, role = ROLES.VIEWER) {
  try {
    const notification = getNotificationDetail(id, role);

    if (!notification) {
      return {
        status: 404,
        error: `Notification with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: notification,
    };
  } catch (err) {
    console.error(`[NotificationService] apiGetNotification error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to create a notification.
 *
 * @param {object} event - The workflow event data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateNotification(event, userId = 'system', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'create')) {
      return {
        status: 403,
        error: 'You do not have permission to create notifications.',
        data: null,
      };
    }

    const created = createNotification(event, userId, role);

    if (!created) {
      return {
        status: 400,
        error: 'Failed to create notification. Check required fields (type, recipient, subject, message).',
        data: null,
      };
    }

    return {
      status: 201,
      data: created,
    };
  } catch (err) {
    console.error('[NotificationService] apiCreateNotification error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to mark a notification as read.
 *
 * @param {string} id - The notification ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiMarkAsRead(id, userId = 'system', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'mark_read')) {
      return {
        status: 403,
        error: 'You do not have permission to mark notifications as read.',
        data: null,
      };
    }

    const result = markAsRead(id, userId, role);

    if (!result) {
      return {
        status: 404,
        error: `Notification with id '${id}' not found or cannot be marked as read.`,
        data: null,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error(`[NotificationService] apiMarkAsRead error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to mark a notification as unread.
 *
 * @param {string} id - The notification ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiMarkAsUnread(id, userId = 'system', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'mark_read')) {
      return {
        status: 403,
        error: 'You do not have permission to mark notifications as unread.',
        data: null,
      };
    }

    const result = markAsUnread(id, userId, role);

    if (!result) {
      return {
        status: 404,
        error: `Notification with id '${id}' not found or cannot be marked as unread.`,
        data: null,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error(`[NotificationService] apiMarkAsUnread error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to mark all notifications as read for a user.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiMarkAllAsRead(userId, role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'mark_read')) {
      return {
        status: 403,
        error: 'You do not have permission to mark notifications as read.',
        data: null,
      };
    }

    const markedCount = markAllAsRead(userId, role);

    return {
      status: 200,
      data: {
        markedCount,
        message: `${markedCount} notification(s) marked as read.`,
      },
    };
  } catch (err) {
    console.error('[NotificationService] apiMarkAllAsRead error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API DELETE request to delete a notification.
 *
 * @param {string} id - The notification ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteNotification(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete notifications.',
    };
  }

  const deleted = deleteNotification(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Notification with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Notification '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API GET request for unread notification count.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetUnreadCount(userId, role = ROLES.VIEWER) {
  try {
    const unreadCount = getUnreadCount(userId, role);

    return {
      status: 200,
      data: {
        userId,
        unreadCount,
      },
    };
  } catch (err) {
    console.error('[NotificationService] apiGetUnreadCount error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for notification summary.
 *
 * @param {string} userId - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetNotificationSummary(userId, role = ROLES.VIEWER) {
  try {
    const summary = getNotificationSummary(userId, role);

    return {
      status: 200,
      data: summary,
    };
  } catch (err) {
    console.error('[NotificationService] apiGetNotificationSummary error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to create bulk notifications.
 *
 * @param {object} event - The base workflow event data.
 * @param {Array<string>} recipients - Array of recipient user IDs.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateBulkNotifications(event, recipients, userId = 'system', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'create')) {
      return {
        status: 403,
        error: 'You do not have permission to create notifications.',
        data: null,
      };
    }

    const created = createBulkNotifications(event, recipients, userId, role);

    if (created.length === 0) {
      return {
        status: 400,
        error: 'Failed to create bulk notifications. Check event data and recipients.',
        data: [],
      };
    }

    return {
      status: 201,
      data: created,
      meta: {
        requested: recipients.length,
        created: created.length,
      },
    };
  } catch (err) {
    console.error('[NotificationService] apiCreateBulkNotifications error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for notification routing configuration.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetRoutingConfig(role = ROLES.VIEWER) {
  if (role !== ROLES.ADMIN) {
    return {
      status: 403,
      error: 'Only administrators can view notification routing configuration.',
      data: null,
    };
  }

  return {
    status: 200,
    data: getRoutingConfig(),
  };
}

/**
 * Simulate an API PUT request to update notification routing configuration.
 *
 * @param {object} config - The routing configuration to update.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiSetRoutingConfig(config, userId = 'system', role = ROLES.VIEWER) {
  if (role !== ROLES.ADMIN) {
    return {
      status: 403,
      error: 'Only administrators can update notification routing configuration.',
      data: null,
    };
  }

  const updated = setRoutingConfig(config);

  logAction(userId, 'Update Notification Routing', NOTIFICATION_ENTITY_TYPE, 'routing-config', 'Updated notification routing configuration');

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API POST request to reset notification routing configuration.
 *
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiResetRoutingConfig(userId = 'system', role = ROLES.VIEWER) {
  if (role !== ROLES.ADMIN) {
    return {
      status: 403,
      error: 'Only administrators can reset notification routing configuration.',
      data: null,
    };
  }

  const defaults = resetRoutingConfig();

  logAction(userId, 'Reset Notification Routing', NOTIFICATION_ENTITY_TYPE, 'routing-config', 'Reset notification routing configuration to defaults');

  return {
    status: 200,
    data: defaults,
  };
}