import { v4 as uuidv4 } from 'uuid';
import { loadEntities, persistEntities, addEntity } from './localStorage.js';

/**
 * @module auditLogger
 * Audit trail engine for eQIP Quality Intelligence.
 * Provides timestamped audit logging and filtered retrieval via localStorage.
 */

/**
 * The entity type key used for audit log storage.
 * @type {string}
 */
const AUDIT_LOG_ENTITY_TYPE = 'audit-logs';

/**
 * Current audit log schema version.
 * @type {number}
 */
const AUDIT_LOG_VERSION = 1;

/**
 * Log an action to the audit trail.
 * Creates a timestamped audit entry and persists it to localStorage.
 *
 * @param {string} userId - The ID of the user performing the action.
 * @param {string} action - The action being performed (e.g., 'Create Release', 'Update Quality Gate').
 * @param {string} entityType - The type of entity being acted upon (e.g., 'releases', 'quality-gates').
 * @param {string} entityId - The ID of the entity being acted upon.
 * @param {string} [details=''] - Additional details about the action.
 * @returns {object} The created audit log entry.
 */
export function logAction(userId, action, entityType, entityId, details = '') {
  if (!userId || !action || !entityType || !entityId) {
    console.warn(
      '[AuditLogManager] Missing required fields for audit log entry:',
      { userId, action, entityType, entityId },
    );
  }

  const entry = {
    id: uuidv4(),
    user_id: userId || 'unknown',
    action: action || 'Unknown Action',
    entity_type: entityType || 'unknown',
    entity_id: entityId || 'unknown',
    details: details || '',
    created_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    version: AUDIT_LOG_VERSION,
  };

  const logs = loadEntities(AUDIT_LOG_ENTITY_TYPE);
  logs.push(entry);
  persistEntities(AUDIT_LOG_ENTITY_TYPE, logs);

  return entry;
}

/**
 * Retrieve audit log entries with optional filtering.
 *
 * @param {object} [filters={}] - Optional filters to apply.
 * @param {string} [filters.userId] - Filter by user ID.
 * @param {string} [filters.user_id] - Alias for userId filter.
 * @param {string} [filters.action] - Filter by action type (case-insensitive partial match).
 * @param {string} [filters.entityType] - Filter by entity type (exact match).
 * @param {string} [filters.entity_type] - Alias for entityType filter.
 * @param {string} [filters.entityId] - Filter by entity ID (exact match).
 * @param {string} [filters.entity_id] - Alias for entityId filter.
 * @param {string} [filters.startDate] - Filter entries created on or after this ISO8601 date.
 * @param {string} [filters.endDate] - Filter entries created on or before this ISO8601 date.
 * @param {number} [filters.limit] - Maximum number of entries to return.
 * @param {string} [filters.sortOrder='desc'] - Sort order by created_at: 'asc' or 'desc'.
 * @returns {Array<object>} The filtered and sorted audit log entries.
 */
export function getAuditLogs(filters = {}) {
  let logs = loadEntities(AUDIT_LOG_ENTITY_TYPE);

  const userId = filters.userId || filters.user_id;
  if (userId) {
    logs = logs.filter((log) => log.user_id === userId);
  }

  const action = filters.action;
  if (action) {
    const actionLower = action.toLowerCase();
    logs = logs.filter(
      (log) => log.action && log.action.toLowerCase().includes(actionLower),
    );
  }

  const entityType = filters.entityType || filters.entity_type;
  if (entityType) {
    logs = logs.filter((log) => log.entity_type === entityType);
  }

  const entityId = filters.entityId || filters.entity_id;
  if (entityId) {
    logs = logs.filter((log) => log.entity_id === entityId);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    if (!isNaN(start)) {
      logs = logs.filter((log) => {
        const logTime = new Date(log.created_at || log.timestamp).getTime();
        return !isNaN(logTime) && logTime >= start;
      });
    }
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    if (!isNaN(end)) {
      logs = logs.filter((log) => {
        const logTime = new Date(log.created_at || log.timestamp).getTime();
        return !isNaN(logTime) && logTime <= end;
      });
    }
  }

  const sortOrder = filters.sortOrder || 'desc';
  logs.sort((a, b) => {
    const timeA = new Date(a.created_at || a.timestamp).getTime();
    const timeB = new Date(b.created_at || b.timestamp).getTime();
    if (isNaN(timeA) && isNaN(timeB)) return 0;
    if (isNaN(timeA)) return 1;
    if (isNaN(timeB)) return -1;
    return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
  });

  if (filters.limit && typeof filters.limit === 'number' && filters.limit > 0) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

/**
 * Get audit log entries for a specific entity.
 *
 * @param {string} entityType - The entity type to filter by.
 * @param {string} entityId - The entity ID to filter by.
 * @returns {Array<object>} Audit log entries for the specified entity, sorted descending.
 */
export function getAuditLogsForEntity(entityType, entityId) {
  return getAuditLogs({
    entityType,
    entityId,
    sortOrder: 'desc',
  });
}

/**
 * Get audit log entries for a specific user.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {number} [limit] - Optional maximum number of entries to return.
 * @returns {Array<object>} Audit log entries for the specified user, sorted descending.
 */
export function getAuditLogsForUser(userId, limit) {
  const filters = {
    userId,
    sortOrder: 'desc',
  };
  if (limit !== undefined && limit !== null) {
    filters.limit = limit;
  }
  return getAuditLogs(filters);
}

/**
 * Get the total count of audit log entries, optionally filtered.
 *
 * @param {object} [filters={}] - Optional filters (same as getAuditLogs).
 * @returns {number} The count of matching audit log entries.
 */
export function getAuditLogCount(filters = {}) {
  const filtersWithoutLimit = { ...filters };
  delete filtersWithoutLimit.limit;
  return getAuditLogs(filtersWithoutLimit).length;
}

/**
 * Clear all audit log entries from localStorage.
 * Use with caution — this is irreversible.
 *
 * @returns {boolean} True if successful.
 */
export function clearAuditLogs() {
  return persistEntities(AUDIT_LOG_ENTITY_TYPE, []);
}

/**
 * Get distinct action types from the audit log.
 *
 * @returns {string[]} Array of unique action type strings.
 */
export function getDistinctActions() {
  const logs = loadEntities(AUDIT_LOG_ENTITY_TYPE);
  const actions = new Set();
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].action) {
      actions.add(logs[i].action);
    }
  }
  return [...actions].sort();
}

/**
 * Get distinct entity types from the audit log.
 *
 * @returns {string[]} Array of unique entity type strings.
 */
export function getDistinctEntityTypes() {
  const logs = loadEntities(AUDIT_LOG_ENTITY_TYPE);
  const types = new Set();
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].entity_type) {
      types.add(logs[i].entity_type);
    }
  }
  return [...types].sort();
}