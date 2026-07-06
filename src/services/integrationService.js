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
import { ROLES, INTEGRATION_STATUS } from '../constants.js';

/**
 * @module integrationService
 * IntegrationManager service for eQIP Quality Intelligence.
 * Provides CRUD operations for integrations with PII masking, role-based access,
 * resilience pattern simulation, and audit logging. Manages simulated status,
 * sync frequency, error counts, and resilience patterns (retry, circuit breaker,
 * timeout, alerting) for 20 external systems.
 * Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for integrations.
 * @type {string}
 */
const INTEGRATION_ENTITY_TYPE = ENTITY_TYPES.INTEGRATIONS;

/**
 * Roles that can view all integrations.
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
 * Roles that can update integrations.
 * @type {Set<string>}
 */
const UPDATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can create integrations.
 * @type {Set<string>}
 */
const CREATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can delete integrations.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Roles that can trigger sync or resilience pattern simulation.
 * @type {Set<string>}
 */
const SYNC_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Valid resilience patterns.
 * @type {Readonly<Array<string>>}
 */
const VALID_RESILIENCE_PATTERNS = Object.freeze([
  'circuit_breaker',
  'retry_with_backoff',
  'timeout',
  'bulkhead',
  'fallback',
]);

/**
 * Valid integration statuses.
 * @type {Readonly<Array<string>>}
 */
const VALID_STATUSES = Object.freeze([
  INTEGRATION_STATUS.CONNECTED,
  INTEGRATION_STATUS.DISCONNECTED,
  INTEGRATION_STATUS.ERROR,
  INTEGRATION_STATUS.SYNCING,
  INTEGRATION_STATUS.PENDING,
]);

/**
 * Valid sync frequencies.
 * @type {Readonly<Array<string>>}
 */
const VALID_SYNC_FREQUENCIES = Object.freeze([
  'real_time',
  'every_5_minutes',
  'every_10_minutes',
  'every_15_minutes',
  'every_30_minutes',
  'hourly',
  'daily',
  'weekly',
]);

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'create', 'update', 'delete', 'sync').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return VIEW_ROLES.has(role);
    case 'create':
      return CREATE_ROLES.has(role);
    case 'update':
      return UPDATE_ROLES.has(role);
    case 'delete':
      return DELETE_ROLES.has(role);
    case 'sync':
      return SYNC_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Get all integrations with optional filtering, searching, sorting, and pagination.
 * Applies PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { status: 'connected', category: 'DevOps' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @param {string} [options.userId] - The user ID for audit logging.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getIntegrations(options = {}) {
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

  let integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const result = processData(integrations, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'type', 'category', 'status', 'description', 'resiliencePattern', 'syncFrequency'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((intg) => maskEntity(intg, role));

  return result;
}

/**
 * Get all integrations without pagination (simple list).
 * Applies PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integration objects.
 */
export function getIntegrationsList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let integrations = getAll(INTEGRATION_ENTITY_TYPE);

  if (filters && Object.keys(filters).length > 0) {
    integrations = applyFilters(integrations, filters);
  }

  return integrations.map((intg) => maskEntity(intg, role));
}

/**
 * Get a single integration by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The integration ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked integration object, or null if not found.
 */
export function getIntegrationDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const integration = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!integration) {
    return null;
  }

  return maskEntity(integration, role);
}

/**
 * Get a single integration by ID (alias for getIntegrationDetail).
 *
 * @param {string} id - The integration ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked integration object, or null if not found.
 */
export function getIntegrationById(id, role = ROLES.VIEWER) {
  return getIntegrationDetail(id, role);
}

/**
 * Get a single integration by name (case-insensitive).
 * Applies PII masking based on role.
 *
 * @param {string} name - The integration name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked integration object, or null if not found.
 */
export function getIntegrationByName(name, role = ROLES.VIEWER) {
  if (!name || typeof name !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const nameLower = name.toLowerCase();
  const integration = integrations.find((intg) => intg.name && intg.name.toLowerCase() === nameLower);

  if (!integration) {
    return null;
  }

  return maskEntity(integration, role);
}

/**
 * Create a new integration.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The integration data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked integration, or null if unauthorized.
 */
export function createIntegration(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[IntegrationService] User does not have permission to create integrations.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[IntegrationService] Invalid integration data for create.');
    return null;
  }

  const now = new Date().toISOString();

  const integrationData = {
    ...data,
    id: data.id || `int-${uuidv4().slice(0, 8)}`,
    status: data.status || INTEGRATION_STATUS.PENDING,
    syncFrequency: data.syncFrequency || 'daily',
    errorCount: data.errorCount || 0,
    resiliencePattern: data.resiliencePattern || 'retry_with_backoff',
    healthChecks: data.healthChecks || [],
    syncHistory: data.syncHistory || [],
    metrics: data.metrics || {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncDuration: 0,
      totalRecordsSynced: 0,
      uptime: 100,
      lastErrorDate: null,
    },
    applicableApplications: data.applicableApplications || [],
    tags: data.tags || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  const created = create(INTEGRATION_ENTITY_TYPE, integrationData, userId);

  if (!created) {
    console.warn('[IntegrationService] Failed to create integration.');
    return null;
  }

  logAction(userId, 'Create Integration', INTEGRATION_ENTITY_TYPE, created.id, `Created integration: ${created.name || created.id}`);

  return maskEntity(created, role);
}

/**
 * Update an existing integration by ID.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {string} id - The integration ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked integration, or null if unauthorized or not found.
 */
export function updateIntegration(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[IntegrationService] User does not have permission to update integrations.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[IntegrationService] Invalid integration ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[IntegrationService] Invalid update data.');
    return null;
  }

  const existing = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[IntegrationService] Integration not found: ${id}`);
    return null;
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    console.warn(`[IntegrationService] Invalid integration status: ${data.status}`);
    return null;
  }

  if (data.resiliencePattern && !VALID_RESILIENCE_PATTERNS.includes(data.resiliencePattern)) {
    console.warn(`[IntegrationService] Invalid resilience pattern: ${data.resiliencePattern}`);
    return null;
  }

  if (data.syncFrequency && !VALID_SYNC_FREQUENCIES.includes(data.syncFrequency)) {
    console.warn(`[IntegrationService] Invalid sync frequency: ${data.syncFrequency}`);
    return null;
  }

  const updates = { ...data };

  const updated = update(INTEGRATION_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[IntegrationService] Failed to update integration: ${id}`);
    return null;
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Integration', INTEGRATION_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete an integration by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The integration ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the integration was deleted, false otherwise.
 */
export function deleteIntegration(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[IntegrationService] User does not have permission to delete integrations.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[IntegrationService] Invalid integration ID for delete.');
    return false;
  }

  const existing = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[IntegrationService] Integration not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(INTEGRATION_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Integration', INTEGRATION_ENTITY_TYPE, id, `Deleted integration: ${existing.name || id}`);
  }

  return deleted;
}

/**
 * Simulate a resilience pattern for an integration.
 * Generates a simulated response based on the pattern type.
 *
 * @param {string} id - The integration ID.
 * @param {string} [pattern] - The resilience pattern to simulate. If not provided, uses the integration's configured pattern.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The simulation result, or null if unauthorized or not found.
 */
export function simulateResiliencePattern(id, pattern, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'sync')) {
    console.warn('[IntegrationService] User does not have permission to simulate resilience patterns.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[IntegrationService] Invalid integration ID for resilience simulation.');
    return null;
  }

  const existing = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[IntegrationService] Integration not found: ${id}`);
    return null;
  }

  const effectivePattern = pattern || existing.resiliencePattern || 'retry_with_backoff';

  if (!VALID_RESILIENCE_PATTERNS.includes(effectivePattern)) {
    console.warn(`[IntegrationService] Invalid resilience pattern: ${effectivePattern}`);
    return null;
  }

  const now = new Date().toISOString();
  let simulationResult;

  switch (effectivePattern) {
    case 'circuit_breaker': {
      const isOpen = Math.random() < 0.2;
      simulationResult = {
        pattern: 'circuit_breaker',
        integrationId: id,
        integrationName: existing.name,
        state: isOpen ? 'open' : 'closed',
        failureCount: isOpen ? Math.floor(Math.random() * 10) + 5 : Math.floor(Math.random() * 3),
        failureThreshold: 5,
        resetTimeoutMs: 30000,
        lastFailure: isOpen ? now : null,
        halfOpenAttempts: isOpen ? 0 : null,
        message: isOpen
          ? `Circuit breaker is OPEN for ${existing.name}. Requests are being short-circuited. Will attempt half-open state in 30 seconds.`
          : `Circuit breaker is CLOSED for ${existing.name}. All requests are flowing normally.`,
        simulatedAt: now,
        success: !isOpen,
      };
      break;
    }
    case 'retry_with_backoff': {
      const retryCount = Math.floor(Math.random() * 4);
      const succeeded = retryCount < 3;
      const delays = [];
      for (let i = 0; i < retryCount; i++) {
        delays.push(Math.pow(2, i) * 1000);
      }
      simulationResult = {
        pattern: 'retry_with_backoff',
        integrationId: id,
        integrationName: existing.name,
        totalAttempts: retryCount + 1,
        maxRetries: 3,
        retryDelays: delays,
        backoffMultiplier: 2,
        initialDelayMs: 1000,
        succeeded,
        finalStatus: succeeded ? 'success' : 'max_retries_exceeded',
        message: succeeded
          ? `Request succeeded after ${retryCount} retry attempt(s) for ${existing.name}.`
          : `Request failed after ${retryCount + 1} attempts for ${existing.name}. Max retries exceeded.`,
        simulatedAt: now,
        success: succeeded,
      };
      break;
    }
    case 'timeout': {
      const timedOut = Math.random() < 0.3;
      const responseTimeMs = timedOut
        ? Math.floor(Math.random() * 10000) + 30000
        : Math.floor(Math.random() * 2000) + 100;
      const timeoutThresholdMs = 30000;
      simulationResult = {
        pattern: 'timeout',
        integrationId: id,
        integrationName: existing.name,
        timeoutThresholdMs,
        responseTimeMs,
        timedOut,
        message: timedOut
          ? `Request to ${existing.name} timed out after ${timeoutThresholdMs}ms. Response time: ${responseTimeMs}ms.`
          : `Request to ${existing.name} completed in ${responseTimeMs}ms (within ${timeoutThresholdMs}ms threshold).`,
        simulatedAt: now,
        success: !timedOut,
      };
      break;
    }
    case 'bulkhead': {
      const currentConcurrency = Math.floor(Math.random() * 15) + 1;
      const maxConcurrency = 10;
      const rejected = currentConcurrency > maxConcurrency;
      simulationResult = {
        pattern: 'bulkhead',
        integrationId: id,
        integrationName: existing.name,
        maxConcurrency,
        currentConcurrency,
        queueSize: rejected ? currentConcurrency - maxConcurrency : 0,
        rejected,
        message: rejected
          ? `Bulkhead limit reached for ${existing.name}. ${currentConcurrency - maxConcurrency} request(s) queued. Max concurrency: ${maxConcurrency}.`
          : `Bulkhead for ${existing.name} is within limits. ${currentConcurrency}/${maxConcurrency} concurrent requests.`,
        simulatedAt: now,
        success: !rejected,
      };
      break;
    }
    case 'fallback': {
      const primaryFailed = Math.random() < 0.4;
      simulationResult = {
        pattern: 'fallback',
        integrationId: id,
        integrationName: existing.name,
        primaryStatus: primaryFailed ? 'failed' : 'success',
        fallbackActivated: primaryFailed,
        fallbackSource: primaryFailed ? 'cached_data' : null,
        cacheAge: primaryFailed ? Math.floor(Math.random() * 300) + 60 : null,
        cacheAgeUnit: 'seconds',
        message: primaryFailed
          ? `Primary request to ${existing.name} failed. Serving cached data (age: ${Math.floor(Math.random() * 300) + 60}s).`
          : `Primary request to ${existing.name} succeeded. No fallback needed.`,
        simulatedAt: now,
        success: true,
      };
      break;
    }
    default: {
      simulationResult = {
        pattern: effectivePattern,
        integrationId: id,
        integrationName: existing.name,
        message: `Unknown resilience pattern: ${effectivePattern}`,
        simulatedAt: now,
        success: false,
      };
      break;
    }
  }

  logAction(
    userId,
    'Simulate Resilience Pattern',
    INTEGRATION_ENTITY_TYPE,
    id,
    `Simulated "${effectivePattern}" pattern for integration "${existing.name || id}". Result: ${simulationResult.success ? 'success' : 'failure'}`,
  );

  return simulationResult;
}

/**
 * Simulate a sync operation for an integration.
 * Updates the integration's sync history, metrics, and last sync timestamp.
 *
 * @param {string} id - The integration ID.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The sync result, or null if unauthorized or not found.
 */
export function simulateSync(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'sync')) {
    console.warn('[IntegrationService] User does not have permission to trigger sync.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[IntegrationService] Invalid integration ID for sync.');
    return null;
  }

  const existing = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[IntegrationService] Integration not found: ${id}`);
    return null;
  }

  if (existing.status === INTEGRATION_STATUS.DISCONNECTED) {
    return {
      integrationId: id,
      integrationName: existing.name,
      status: 'failed',
      error: `Integration "${existing.name}" is disconnected. Cannot sync.`,
      syncedAt: new Date().toISOString(),
      success: false,
    };
  }

  const now = new Date().toISOString();
  const syncSuccess = Math.random() > 0.15;
  const duration = Math.floor(Math.random() * 50) + 5;
  const recordsSynced = syncSuccess ? Math.floor(Math.random() * 500) + 10 : 0;
  const errors = syncSuccess ? 0 : Math.floor(Math.random() * 3) + 1;

  const syncEntry = {
    id: `sh-${uuidv4().slice(0, 8)}`,
    date: now,
    status: syncSuccess ? 'success' : 'failed',
    duration,
    recordsSynced,
    errors,
  };

  const existingSyncHistory = Array.isArray(existing.syncHistory) ? [...existing.syncHistory] : [];
  existingSyncHistory.unshift(syncEntry);
  if (existingSyncHistory.length > 10) {
    existingSyncHistory.length = 10;
  }

  const existingMetrics = existing.metrics && typeof existing.metrics === 'object'
    ? { ...existing.metrics }
    : {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncDuration: 0,
        totalRecordsSynced: 0,
        uptime: 99.5,
        lastErrorDate: null,
      };

  existingMetrics.totalSyncs = (existingMetrics.totalSyncs || 0) + 1;
  if (syncSuccess) {
    existingMetrics.successfulSyncs = (existingMetrics.successfulSyncs || 0) + 1;
    existingMetrics.totalRecordsSynced = (existingMetrics.totalRecordsSynced || 0) + recordsSynced;
  } else {
    existingMetrics.failedSyncs = (existingMetrics.failedSyncs || 0) + 1;
    existingMetrics.lastErrorDate = now;
  }
  existingMetrics.averageSyncDuration = Math.round(
    ((existingMetrics.averageSyncDuration || 0) * (existingMetrics.totalSyncs - 1) + duration) / existingMetrics.totalSyncs,
  );

  const updates = {
    lastSync: now,
    syncHistory: existingSyncHistory,
    metrics: existingMetrics,
    errorCount: syncSuccess ? existing.errorCount : (existing.errorCount || 0) + errors,
    status: syncSuccess ? INTEGRATION_STATUS.CONNECTED : existing.status,
  };

  const updated = update(INTEGRATION_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[IntegrationService] Failed to update integration after sync: ${id}`);
    return null;
  }

  logAction(
    userId,
    'Sync Integration',
    INTEGRATION_ENTITY_TYPE,
    id,
    `Sync ${syncSuccess ? 'succeeded' : 'failed'} for "${existing.name || id}". Records synced: ${recordsSynced}. Duration: ${duration}s.`,
  );

  return {
    integrationId: id,
    integrationName: existing.name,
    status: syncSuccess ? 'success' : 'failed',
    duration,
    recordsSynced,
    errors,
    syncedAt: now,
    success: syncSuccess,
  };
}

/**
 * Reconnect a disconnected integration.
 * Simulates reconnection by updating status and resetting error state.
 *
 * @param {string} id - The integration ID.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked integration, or null if unauthorized or not found.
 */
export function reconnectIntegration(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[IntegrationService] User does not have permission to reconnect integrations.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[IntegrationService] Invalid integration ID for reconnect.');
    return null;
  }

  const existing = getById(INTEGRATION_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[IntegrationService] Integration not found: ${id}`);
    return null;
  }

  const now = new Date().toISOString();

  const reconnectSuccess = Math.random() > 0.2;

  const updates = {
    status: reconnectSuccess ? INTEGRATION_STATUS.CONNECTED : INTEGRATION_STATUS.ERROR,
    errorCount: reconnectSuccess ? 0 : existing.errorCount,
    updated_at: now,
    updated_by: userId,
  };

  if (reconnectSuccess && Array.isArray(existing.healthChecks)) {
    updates.healthChecks = existing.healthChecks.map((hc) => ({
      ...hc,
      status: 'passed',
      lastRun: now,
      responseTimeMs: Math.floor(Math.random() * 200) + 50,
    }));
  }

  const updated = update(INTEGRATION_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[IntegrationService] Failed to reconnect integration: ${id}`);
    return null;
  }

  logAction(
    userId,
    'Reconnect Integration',
    INTEGRATION_ENTITY_TYPE,
    id,
    `Reconnection ${reconnectSuccess ? 'succeeded' : 'failed'} for "${existing.name || id}".`,
  );

  return maskEntity(updated, role);
}

/**
 * Get integrations grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and arrays of masked integrations.
 */
export function getIntegrationsByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const grouped = {};

  for (let i = 0; i < integrations.length; i++) {
    const intg = integrations[i];
    const status = intg.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(intg, role));
  }

  return grouped;
}

/**
 * Get integrations grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with category keys and arrays of masked integrations.
 */
export function getIntegrationsByCategory(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const grouped = {};

  for (let i = 0; i < integrations.length; i++) {
    const intg = integrations[i];
    const category = intg.category || 'Unknown';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(maskEntity(intg, role));
  }

  return grouped;
}

/**
 * Get integrations grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and arrays of masked integrations.
 */
export function getIntegrationsByType(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const grouped = {};

  for (let i = 0; i < integrations.length; i++) {
    const intg = integrations[i];
    const type = intg.type || 'unknown';

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(maskEntity(intg, role));
  }

  return grouped;
}

/**
 * Get integration count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and count values.
 */
export function getIntegrationCountByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const counts = {};

  for (let i = 0; i < integrations.length; i++) {
    const status = integrations[i].status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}

/**
 * Get integration count grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with category keys and count values.
 */
export function getIntegrationCountByCategory(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const counts = {};

  for (let i = 0; i < integrations.length; i++) {
    const category = integrations[i].category || 'Unknown';
    counts[category] = (counts[category] || 0) + 1;
  }

  return counts;
}

/**
 * Get integration count grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with type keys and count values.
 */
export function getIntegrationCountByType(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const counts = {};

  for (let i = 0; i < integrations.length; i++) {
    const type = integrations[i].type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}

/**
 * Get integrations applicable to a specific application.
 *
 * @param {string} application - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations applicable to the application.
 */
export function getIntegrationsForApplication(application, role = ROLES.VIEWER) {
  if (!application || typeof application !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const filtered = integrations.filter(
    (intg) =>
      Array.isArray(intg.applicableApplications) &&
      intg.applicableApplications.includes(application),
  );

  return filtered.map((intg) => maskEntity(intg, role));
}

/**
 * Get integrations owned by a specific user.
 *
 * @param {string} ownerId - The owner user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations owned by the user.
 */
export function getIntegrationsByOwner(ownerId, role = ROLES.VIEWER) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const filtered = integrations.filter((intg) => intg.owner === ownerId);

  return filtered.map((intg) => maskEntity(intg, role));
}

/**
 * Get all integrations with errors (errorCount > 0).
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations with errors.
 */
export function getIntegrationsWithErrors(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const filtered = integrations.filter(
    (intg) => typeof intg.errorCount === 'number' && intg.errorCount > 0,
  );

  return filtered.map((intg) => maskEntity(intg, role));
}

/**
 * Get all integrations with failed health checks.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations with at least one failed health check.
 */
export function getIntegrationsWithFailedHealthChecks(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const filtered = integrations.filter(
    (intg) =>
      Array.isArray(intg.healthChecks) &&
      intg.healthChecks.some((hc) => hc.status === 'failed'),
  );

  return filtered.map((intg) => maskEntity(intg, role));
}

/**
 * Get all disconnected integrations.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked disconnected integrations.
 */
export function getDisconnectedIntegrations(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const filtered = integrations.filter(
    (intg) => intg.status === INTEGRATION_STATUS.DISCONNECTED,
  );

  return filtered.map((intg) => maskEntity(intg, role));
}

/**
 * Get integrations sorted by error count descending (most errors first).
 *
 * @param {number} [limit] - Maximum number of integrations to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations sorted by error count.
 */
export function getIntegrationsByErrorCount(limit, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const sorted = [...integrations].sort((a, b) => (b.errorCount || 0) - (a.errorCount || 0));

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((intg) => maskEntity(intg, role));
}

/**
 * Get integrations sorted by uptime ascending (lowest uptime first).
 *
 * @param {number} [limit] - Maximum number of integrations to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked integrations sorted by uptime ascending.
 */
export function getLowestUptimeIntegrations(limit, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const sorted = [...integrations].sort((a, b) => {
    const uptimeA = a.metrics ? a.metrics.uptime : 100;
    const uptimeB = b.metrics ? b.metrics.uptime : 100;
    return uptimeA - uptimeB;
  });

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((intg) => maskEntity(intg, role));
}

/**
 * Calculate the average uptime across all integrations.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} The average uptime percentage, or 0 if no integrations exist.
 */
export function getAverageUptime(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  if (integrations.length === 0) {
    return 0;
  }

  let total = 0;
  let count = 0;

  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].metrics && typeof integrations[i].metrics.uptime === 'number') {
      total += integrations[i].metrics.uptime;
      count += 1;
    }
  }

  if (count === 0) {
    return 0;
  }

  return Math.round((total / count) * 100) / 100;
}

/**
 * Get the total error count across all integrations.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} Total error count.
 */
export function getTotalErrorCount(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  let total = 0;
  for (let i = 0; i < integrations.length; i++) {
    total += integrations[i].errorCount || 0;
  }

  return total;
}

/**
 * Get the total number of records synced across all integrations.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} Total records synced.
 */
export function getTotalRecordsSynced(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  let total = 0;
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].metrics && typeof integrations[i].metrics.totalRecordsSynced === 'number') {
      total += integrations[i].metrics.totalRecordsSynced;
    }
  }

  return total;
}

/**
 * Get the total number of failed health checks across all integrations.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} Total count of failed health checks.
 */
export function getTotalFailedHealthChecks(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  let count = 0;
  for (let i = 0; i < integrations.length; i++) {
    if (Array.isArray(integrations[i].healthChecks)) {
      for (let j = 0; j < integrations[i].healthChecks.length; j++) {
        if (integrations[i].healthChecks[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }

  return count;
}

/**
 * Get distinct values for a specific field across all integrations.
 *
 * @param {string} field - The field name to extract distinct values from.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(field, role = ROLES.VIEWER) {
  if (!field || typeof field !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);
  const values = new Set();

  for (let i = 0; i < integrations.length; i++) {
    const value = integrations[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Search integrations by name or description (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of matching masked integrations.
 */
export function searchIntegrations(query, role = ROLES.VIEWER) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const results = searchByText(integrations, query, ['name', 'type', 'category', 'status', 'description', 'resiliencePattern']);

  return results.map((intg) => maskEntity(intg, role));
}

/**
 * Get a comprehensive summary of integration health metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Summary object with integration health metrics.
 */
export function getIntegrationSummary(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      total: 0,
      connected: 0,
      disconnected: 0,
      error: 0,
      syncing: 0,
      pending: 0,
      totalErrors: 0,
      totalFailedHealthChecks: 0,
      averageUptime: 0,
      totalRecordsSynced: 0,
    };
  }

  const integrations = getAll(INTEGRATION_ENTITY_TYPE);

  const total = integrations.length;
  let connected = 0;
  let disconnected = 0;
  let error = 0;
  let syncing = 0;
  let pending = 0;
  let totalErrors = 0;
  let totalFailedChecks = 0;
  let totalUptime = 0;
  let uptimeCount = 0;
  let totalRecords = 0;

  for (let i = 0; i < integrations.length; i++) {
    const intg = integrations[i];

    if (intg.status === INTEGRATION_STATUS.CONNECTED) connected += 1;
    else if (intg.status === INTEGRATION_STATUS.DISCONNECTED) disconnected += 1;
    else if (intg.status === INTEGRATION_STATUS.ERROR) error += 1;
    else if (intg.status === INTEGRATION_STATUS.SYNCING) syncing += 1;
    else if (intg.status === INTEGRATION_STATUS.PENDING) pending += 1;

    totalErrors += intg.errorCount || 0;

    if (Array.isArray(intg.healthChecks)) {
      for (let j = 0; j < intg.healthChecks.length; j++) {
        if (intg.healthChecks[j].status === 'failed') {
          totalFailedChecks += 1;
        }
      }
    }

    if (intg.metrics && typeof intg.metrics.uptime === 'number') {
      totalUptime += intg.metrics.uptime;
      uptimeCount += 1;
    }

    if (intg.metrics && typeof intg.metrics.totalRecordsSynced === 'number') {
      totalRecords += intg.metrics.totalRecordsSynced;
    }
  }

  return {
    total,
    connected,
    disconnected,
    error,
    syncing,
    pending,
    totalErrors,
    totalFailedHealthChecks: totalFailedChecks,
    averageUptime: uptimeCount > 0 ? Math.round((totalUptime / uptimeCount) * 100) / 100 : 0,
    totalRecordsSynced: totalRecords,
  };
}

/**
 * Simulate an API GET request for integrations.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetIntegrations(params = {}, role = ROLES.VIEWER) {
  const response = apiGetAll(INTEGRATION_ENTITY_TYPE, params);

  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map((intg) => maskEntity(intg, role));
  }

  return response;
}

/**
 * Simulate an API GET request for a single integration.
 *
 * @param {string} id - The integration ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetIntegration(id, role = ROLES.VIEWER) {
  const response = apiGetById(INTEGRATION_ENTITY_TYPE, id);

  if (response.data) {
    response.data = maskEntity(response.data, role);
  }

  return response;
}

/**
 * Simulate an API POST request to create an integration.
 *
 * @param {object} data - The integration data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateIntegration(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    return {
      status: 403,
      error: 'You do not have permission to create integrations.',
      data: null,
    };
  }

  const created = createIntegration(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create integration.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update an integration.
 *
 * @param {string} id - The integration ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateIntegration(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to update integrations.',
      data: null,
    };
  }

  const updated = updateIntegration(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Integration with id '${id}' not found or update failed.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete an integration.
 *
 * @param {string} id - The integration ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteIntegration(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete integrations.',
    };
  }

  const deleted = deleteIntegration(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Integration with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Integration '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API POST request to trigger a sync.
 *
 * @param {string} id - The integration ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiSyncIntegration(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'sync')) {
    return {
      status: 403,
      error: 'You do not have permission to trigger integration sync.',
      data: null,
    };
  }

  const result = simulateSync(id, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to sync integration. Check integration ID.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to simulate a resilience pattern.
 *
 * @param {string} id - The integration ID.
 * @param {string} [pattern] - The resilience pattern to simulate.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiSimulateResiliencePattern(id, pattern, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'sync')) {
    return {
      status: 403,
      error: 'You do not have permission to simulate resilience patterns.',
      data: null,
    };
  }

  const result = simulateResiliencePattern(id, pattern, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to simulate resilience pattern. Check integration ID and pattern.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to reconnect a disconnected integration.
 *
 * @param {string} id - The integration ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiReconnectIntegration(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to reconnect integrations.',
      data: null,
    };
  }

  const result = reconnectIntegration(id, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to reconnect integration. Check integration ID.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}