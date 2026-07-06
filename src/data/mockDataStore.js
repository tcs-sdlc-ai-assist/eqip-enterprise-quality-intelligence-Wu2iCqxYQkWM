import { v4 as uuidv4 } from 'uuid';
import {
  getItem,
  setItem,
  loadEntities,
  persistEntities,
  findEntityById,
  addEntity,
  updateEntity,
  deleteEntity,
  initializeStorage,
  isStorageAvailable,
} from '../utils/localStorage.js';

import applications, { getAllApplications, getApplicationById } from './applications.js';
import releases, { getAllReleases, getReleaseById } from './releases.js';
import demands, { getAllDemands, getDemandById } from './demands.js';
import environments, { getAllEnvironments, getEnvironmentById } from './environments.js';
import governanceProcedures, { getAllGovernanceProcedures, getGovernanceProcedureById } from './governanceProcedures.js';
import integrations, { getAllIntegrations, getIntegrationById } from './integrations.js';
import metrics, { getAllMetrics as getAllMetricsData, getMetricById as getMetricDataById } from './metrics.js';
import notifications, { getAllNotifications, getNotificationById } from './notifications.js';
import postDeployments, { getAllPostDeployments, getPostDeploymentById } from './postDeployment.js';
import qualityGates, { getAllQualityGates, getQualityGateById } from './qualityGates.js';
import reports, { getAllReportInstances, getReportInstanceById, getAllReportTemplates, getAllReportSchedules, getAllReportExportHistory } from './reports.js';
import schedules, { getAllSchedules, getScheduleById } from './schedules.js';
import segments, { getAllSegments, getSegmentById } from './segments.js';
import testCases, { getAllTestCases, getTestCaseById, getAllTestSuites, getTestSuiteById } from './testCases.js';
import testDataSets, { getAllTestDataSets, getTestDataSetById } from './testData.js';
import testExecutions, { getAllTestExecutions, getTestExecutionById } from './testExecutions.js';
import users, { getAllUsers, getUserById } from './users.js';
import aiInsights, { getAllAIInsights, getAIInsightById } from './aiInsights.js';

/**
 * @module mockDataStore
 * Central mock data store for eQIP Quality Intelligence.
 * Aggregates all mock data modules, initializes localStorage on first load,
 * provides getAll/getById/create/update/delete operations for every entity type,
 * and syncs all changes to localStorage. Acts as the simulated API layer
 * matching PRD endpoint patterns.
 */

/**
 * Storage prefix for mock data store entities.
 * @type {string}
 */
const STORE_PREFIX = 'eqip_store_';

/**
 * Key used to track whether mock data store seeding has occurred.
 * @type {string}
 */
const STORE_INITIALIZED_KEY = 'eqip_store_initialized';

/**
 * Entity type keys used for storage.
 * @type {Readonly<object>}
 */
export const ENTITY_TYPES = Object.freeze({
  APPLICATIONS: 'applications',
  RELEASES: 'releases',
  DEMANDS: 'demands',
  ENVIRONMENTS: 'environments',
  GOVERNANCE_PROCEDURES: 'governance-procedures',
  INTEGRATIONS: 'integrations',
  METRICS: 'metrics',
  NOTIFICATIONS: 'notifications',
  POST_DEPLOYMENTS: 'post-deployments',
  QUALITY_GATES: 'quality-gates',
  REPORTS: 'reports',
  REPORT_TEMPLATES: 'report-templates',
  REPORT_SCHEDULES: 'report-schedules',
  REPORT_EXPORT_HISTORY: 'report-export-history',
  SCHEDULES: 'schedules',
  SEGMENTS: 'segments',
  TEST_CASES: 'test-cases',
  TEST_SUITES: 'test-suites',
  TEST_DATA: 'test-data',
  TEST_EXECUTIONS: 'test-executions',
  USERS: 'users',
  AI_INSIGHTS: 'ai-insights',
  AUDIT_LOGS: 'audit-logs',
});

/**
 * Map of entity types to their seed data getter functions.
 * @type {object}
 */
const SEED_DATA_MAP = {
  [ENTITY_TYPES.APPLICATIONS]: getAllApplications,
  [ENTITY_TYPES.RELEASES]: getAllReleases,
  [ENTITY_TYPES.DEMANDS]: getAllDemands,
  [ENTITY_TYPES.ENVIRONMENTS]: getAllEnvironments,
  [ENTITY_TYPES.GOVERNANCE_PROCEDURES]: getAllGovernanceProcedures,
  [ENTITY_TYPES.INTEGRATIONS]: getAllIntegrations,
  [ENTITY_TYPES.METRICS]: getAllMetricsData,
  [ENTITY_TYPES.NOTIFICATIONS]: getAllNotifications,
  [ENTITY_TYPES.POST_DEPLOYMENTS]: getAllPostDeployments,
  [ENTITY_TYPES.QUALITY_GATES]: getAllQualityGates,
  [ENTITY_TYPES.REPORTS]: getAllReportInstances,
  [ENTITY_TYPES.REPORT_TEMPLATES]: getAllReportTemplates,
  [ENTITY_TYPES.REPORT_SCHEDULES]: getAllReportSchedules,
  [ENTITY_TYPES.REPORT_EXPORT_HISTORY]: getAllReportExportHistory,
  [ENTITY_TYPES.SCHEDULES]: getAllSchedules,
  [ENTITY_TYPES.SEGMENTS]: getAllSegments,
  [ENTITY_TYPES.TEST_CASES]: getAllTestCases,
  [ENTITY_TYPES.TEST_SUITES]: getAllTestSuites,
  [ENTITY_TYPES.TEST_DATA]: getAllTestDataSets,
  [ENTITY_TYPES.TEST_EXECUTIONS]: getAllTestExecutions,
  [ENTITY_TYPES.USERS]: getAllUsers,
  [ENTITY_TYPES.AI_INSIGHTS]: getAllAIInsights,
};

/**
 * Map of entity types to their static getById functions (for fallback).
 * @type {object}
 */
const STATIC_GET_BY_ID_MAP = {
  [ENTITY_TYPES.APPLICATIONS]: getApplicationById,
  [ENTITY_TYPES.RELEASES]: getReleaseById,
  [ENTITY_TYPES.DEMANDS]: getDemandById,
  [ENTITY_TYPES.ENVIRONMENTS]: getEnvironmentById,
  [ENTITY_TYPES.GOVERNANCE_PROCEDURES]: getGovernanceProcedureById,
  [ENTITY_TYPES.INTEGRATIONS]: getIntegrationById,
  [ENTITY_TYPES.METRICS]: getMetricDataById,
  [ENTITY_TYPES.NOTIFICATIONS]: getNotificationById,
  [ENTITY_TYPES.POST_DEPLOYMENTS]: getPostDeploymentById,
  [ENTITY_TYPES.QUALITY_GATES]: getQualityGateById,
  [ENTITY_TYPES.REPORTS]: getReportInstanceById,
  [ENTITY_TYPES.SCHEDULES]: getScheduleById,
  [ENTITY_TYPES.SEGMENTS]: getSegmentById,
  [ENTITY_TYPES.TEST_CASES]: getTestCaseById,
  [ENTITY_TYPES.TEST_SUITES]: getTestSuiteById,
  [ENTITY_TYPES.TEST_DATA]: getTestDataSetById,
  [ENTITY_TYPES.TEST_EXECUTIONS]: getTestExecutionById,
  [ENTITY_TYPES.USERS]: getUserById,
  [ENTITY_TYPES.AI_INSIGHTS]: getAIInsightById,
};

/**
 * Internal cache for loaded entities to reduce localStorage reads.
 * @type {object}
 */
const _cache = {};

/**
 * Whether the store has been initialized.
 * @type {boolean}
 */
let _initialized = false;

// ---------------------------------------------------------------------------
// Storage Key Helpers
// ---------------------------------------------------------------------------

/**
 * Get the localStorage key for an entity type.
 * @param {string} entityType - The entity type key.
 * @returns {string} The localStorage key.
 */
function getStorageKey(entityType) {
  return `${STORE_PREFIX}${entityType}`;
}

/**
 * Load entities from localStorage for a given entity type.
 * @param {string} entityType - The entity type key.
 * @returns {Array<object>} Array of entity objects.
 */
function loadFromStorage(entityType) {
  try {
    const key = getStorageKey(entityType);
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

/**
 * Save entities to localStorage for a given entity type.
 * @param {string} entityType - The entity type key.
 * @param {Array<object>} entities - The entities to persist.
 * @returns {boolean} True if successful.
 */
function saveToStorage(entityType, entities) {
  try {
    const key = getStorageKey(entityType);
    window.localStorage.setItem(key, JSON.stringify(entities));
    return true;
  } catch (err) {
    console.error(`[MockDataStore] Error saving ${entityType}:`, err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Seed a single entity type into localStorage if not already present.
 * @param {string} entityType - The entity type key.
 * @param {function} seedFn - Function that returns the seed data array.
 */
function seedEntityType(entityType, seedFn) {
  const existing = loadFromStorage(entityType);
  if (existing.length === 0) {
    try {
      const seedData = seedFn();
      if (Array.isArray(seedData) && seedData.length > 0) {
        saveToStorage(entityType, seedData);
      }
    } catch (err) {
      console.error(`[MockDataStore] Error seeding ${entityType}:`, err);
    }
  }
}

/**
 * Initialize the mock data store.
 * Seeds all entity types into localStorage on first load.
 * Safe to call multiple times — only seeds on first invocation.
 *
 * @returns {boolean} True if initialization occurred, false if already initialized.
 */
export function initializeMockDataStore() {
  if (_initialized) {
    return false;
  }

  if (!isStorageAvailable()) {
    console.warn('[MockDataStore] localStorage is not available. Operating in memory-only mode.');
    _initialized = true;
    return false;
  }

  // Initialize the base localStorage manager
  initializeStorage();

  try {
    const alreadySeeded = getItem(STORE_INITIALIZED_KEY, false);

    if (!alreadySeeded) {
      const entityTypes = Object.keys(SEED_DATA_MAP);
      for (let i = 0; i < entityTypes.length; i++) {
        const entityType = entityTypes[i];
        seedEntityType(entityType, SEED_DATA_MAP[entityType]);
      }

      // Seed audit logs as empty if not present
      const auditLogs = loadFromStorage(ENTITY_TYPES.AUDIT_LOGS);
      if (auditLogs.length === 0) {
        saveToStorage(ENTITY_TYPES.AUDIT_LOGS, []);
      }

      setItem(STORE_INITIALIZED_KEY, true);
    }

    _initialized = true;
    return !alreadySeeded;
  } catch (err) {
    console.error('[MockDataStore] Error during initialization:', err);
    _initialized = true;
    return false;
  }
}

/**
 * Reset the mock data store by clearing all stored data and re-seeding.
 *
 * @returns {boolean} True if successful.
 */
export function resetMockDataStore() {
  try {
    const entityTypes = Object.keys(SEED_DATA_MAP);
    for (let i = 0; i < entityTypes.length; i++) {
      const entityType = entityTypes[i];
      const key = getStorageKey(entityType);
      try {
        window.localStorage.removeItem(key);
      } catch (_err) {
        // ignore
      }
    }

    // Clear audit logs
    try {
      window.localStorage.removeItem(getStorageKey(ENTITY_TYPES.AUDIT_LOGS));
    } catch (_err) {
      // ignore
    }

    // Clear initialization flag
    try {
      window.localStorage.removeItem(STORE_INITIALIZED_KEY);
    } catch (_err) {
      // ignore
    }

    // Clear cache
    const cacheKeys = Object.keys(_cache);
    for (let i = 0; i < cacheKeys.length; i++) {
      delete _cache[cacheKeys[i]];
    }

    _initialized = false;

    return initializeMockDataStore();
  } catch (err) {
    console.error('[MockDataStore] Error during reset:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Core CRUD Operations
// ---------------------------------------------------------------------------

/**
 * Get all entities of a given type.
 * Loads from localStorage first; falls back to static seed data if empty.
 *
 * @param {string} entityType - The entity type key (use ENTITY_TYPES constants).
 * @returns {Array<object>} Array of entity objects.
 */
export function getAll(entityType) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }

  // Try localStorage first
  const stored = loadFromStorage(entityType);
  if (stored.length > 0) {
    return [...stored];
  }

  // Fall back to static seed data
  const seedFn = SEED_DATA_MAP[entityType];
  if (seedFn) {
    try {
      const seedData = seedFn();
      if (Array.isArray(seedData) && seedData.length > 0) {
        // Persist to localStorage for future reads
        saveToStorage(entityType, seedData);
        return [...seedData];
      }
    } catch (_err) {
      // ignore
    }
  }

  return [];
}

/**
 * Get a single entity by ID from a given entity type.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID.
 * @returns {object|null} The entity object, or null if not found.
 */
export function getById(entityType, id) {
  if (!entityType || typeof entityType !== 'string' || !id || typeof id !== 'string') {
    return null;
  }

  const entities = getAll(entityType);
  const found = entities.find((entity) => entity.id === id);

  if (found) {
    return { ...found };
  }

  // Fall back to static getById if available
  const staticGetById = STATIC_GET_BY_ID_MAP[entityType];
  if (staticGetById) {
    try {
      const staticResult = staticGetById(id);
      if (staticResult) {
        return { ...staticResult };
      }
    } catch (_err) {
      // ignore
    }
  }

  return null;
}

/**
 * Create a new entity of a given type.
 * Assigns a UUID if no id is provided. Adds audit fields.
 *
 * @param {string} entityType - The entity type key.
 * @param {object} entity - The entity data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {object} The created entity with generated fields.
 */
export function create(entityType, entity, userId = 'system') {
  if (!entityType || typeof entityType !== 'string') {
    console.warn('[MockDataStore] Invalid entity type for create.');
    return null;
  }

  if (!entity || typeof entity !== 'object') {
    console.warn('[MockDataStore] Invalid entity data for create.');
    return null;
  }

  const now = new Date().toISOString();
  const entities = getAll(entityType);

  const newEntity = {
    ...entity,
    id: entity.id || uuidv4(),
    created_at: entity.created_at || now,
    updated_at: now,
    created_by: entity.created_by || userId,
    updated_by: userId,
    version: entity.version || 1,
  };

  entities.push(newEntity);
  saveToStorage(entityType, entities);

  return { ...newEntity };
}

/**
 * Update an existing entity by ID within a given entity type.
 * Merges updates with existing entity data. Updates audit fields.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to update.
 * @param {object} updates - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {object|null} The updated entity, or null if not found.
 */
export function update(entityType, id, updates, userId = 'system') {
  if (!entityType || typeof entityType !== 'string' || !id || typeof id !== 'string') {
    console.warn('[MockDataStore] Invalid parameters for update.');
    return null;
  }

  if (!updates || typeof updates !== 'object') {
    console.warn('[MockDataStore] Invalid updates for update.');
    return null;
  }

  const entities = getAll(entityType);
  const index = entities.findIndex((entity) => entity.id === id);

  if (index === -1) {
    console.warn(`[MockDataStore] Entity not found: ${entityType}/${id}`);
    return null;
  }

  const now = new Date().toISOString();
  const existingEntity = entities[index];

  const updatedEntity = {
    ...existingEntity,
    ...updates,
    id: existingEntity.id,
    created_at: existingEntity.created_at,
    created_by: existingEntity.created_by,
    updated_at: now,
    updated_by: userId,
    version: (existingEntity.version || 0) + 1,
  };

  entities[index] = updatedEntity;
  saveToStorage(entityType, entities);

  return { ...updatedEntity };
}

/**
 * Delete an entity by ID from a given entity type.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to delete.
 * @returns {boolean} True if the entity was found and deleted.
 */
export function remove(entityType, id) {
  if (!entityType || typeof entityType !== 'string' || !id || typeof id !== 'string') {
    console.warn('[MockDataStore] Invalid parameters for delete.');
    return false;
  }

  const entities = getAll(entityType);
  const filtered = entities.filter((entity) => entity.id !== id);

  if (filtered.length === entities.length) {
    console.warn(`[MockDataStore] Entity not found for deletion: ${entityType}/${id}`);
    return false;
  }

  saveToStorage(entityType, filtered);
  return true;
}

// ---------------------------------------------------------------------------
// Query Operations
// ---------------------------------------------------------------------------

/**
 * Find entities matching a set of filter criteria.
 *
 * @param {string} entityType - The entity type key.
 * @param {object} [filters={}] - Filter criteria. Keys are field names, values are match values.
 *   - String values: case-insensitive partial match.
 *   - Array values: field value must be in the array.
 *   - Other values: exact match.
 * @returns {Array<object>} Array of matching entities.
 */
export function find(entityType, filters = {}) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }

  const entities = getAll(entityType);
  const filterKeys = Object.keys(filters);

  if (filterKeys.length === 0) {
    return [...entities];
  }

  return entities.filter((entity) => {
    for (let i = 0; i < filterKeys.length; i++) {
      const key = filterKeys[i];
      const filterValue = filters[key];

      if (filterValue === null || filterValue === undefined) {
        continue;
      }

      const fieldValue = entity[key];

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) {
          continue;
        }
        if (!filterValue.includes(fieldValue)) {
          return false;
        }
        continue;
      }

      if (typeof filterValue === 'string') {
        if (filterValue === '') {
          continue;
        }
        const fieldStr = fieldValue === null || fieldValue === undefined ? '' : String(fieldValue);
        if (!fieldStr.toLowerCase().includes(filterValue.toLowerCase())) {
          return false;
        }
        continue;
      }

      if (fieldValue !== filterValue) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Count entities of a given type, optionally filtered.
 *
 * @param {string} entityType - The entity type key.
 * @param {object} [filters={}] - Optional filter criteria.
 * @returns {number} The count of matching entities.
 */
export function count(entityType, filters = {}) {
  const filterKeys = Object.keys(filters);
  if (filterKeys.length === 0) {
    return getAll(entityType).length;
  }
  return find(entityType, filters).length;
}

/**
 * Check if an entity exists by ID.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID.
 * @returns {boolean} True if the entity exists.
 */
export function exists(entityType, id) {
  return getById(entityType, id) !== null;
}

// ---------------------------------------------------------------------------
// Batch Operations
// ---------------------------------------------------------------------------

/**
 * Create multiple entities at once.
 *
 * @param {string} entityType - The entity type key.
 * @param {Array<object>} entities - Array of entity data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {Array<object>} Array of created entities.
 */
export function createMany(entityType, entities, userId = 'system') {
  if (!entityType || !Array.isArray(entities)) {
    return [];
  }

  const now = new Date().toISOString();
  const existing = getAll(entityType);

  const newEntities = entities.map((entity) => ({
    ...entity,
    id: entity.id || uuidv4(),
    created_at: entity.created_at || now,
    updated_at: now,
    created_by: entity.created_by || userId,
    updated_by: userId,
    version: entity.version || 1,
  }));

  const combined = [...existing, ...newEntities];
  saveToStorage(entityType, combined);

  return newEntities.map((e) => ({ ...e }));
}

/**
 * Update multiple entities by their IDs.
 *
 * @param {string} entityType - The entity type key.
 * @param {Array<{id: string, updates: object}>} updateList - Array of {id, updates} objects.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {Array<object>} Array of updated entities (only those found and updated).
 */
export function updateMany(entityType, updateList, userId = 'system') {
  if (!entityType || !Array.isArray(updateList)) {
    return [];
  }

  const entities = getAll(entityType);
  const now = new Date().toISOString();
  const updatedEntities = [];

  for (let i = 0; i < updateList.length; i++) {
    const { id, updates } = updateList[i];
    if (!id || !updates) {
      continue;
    }

    const index = entities.findIndex((entity) => entity.id === id);
    if (index === -1) {
      continue;
    }

    entities[index] = {
      ...entities[index],
      ...updates,
      id: entities[index].id,
      created_at: entities[index].created_at,
      created_by: entities[index].created_by,
      updated_at: now,
      updated_by: userId,
      version: (entities[index].version || 0) + 1,
    };

    updatedEntities.push({ ...entities[index] });
  }

  if (updatedEntities.length > 0) {
    saveToStorage(entityType, entities);
  }

  return updatedEntities;
}

/**
 * Delete multiple entities by their IDs.
 *
 * @param {string} entityType - The entity type key.
 * @param {Array<string>} ids - Array of entity IDs to delete.
 * @returns {number} The number of entities deleted.
 */
export function removeMany(entityType, ids) {
  if (!entityType || !Array.isArray(ids)) {
    return 0;
  }

  const entities = getAll(entityType);
  const idSet = new Set(ids);
  const filtered = entities.filter((entity) => !idSet.has(entity.id));
  const deletedCount = entities.length - filtered.length;

  if (deletedCount > 0) {
    saveToStorage(entityType, filtered);
  }

  return deletedCount;
}

// ---------------------------------------------------------------------------
// Simulated API Layer
// ---------------------------------------------------------------------------

/**
 * Simulate an API GET request for a list of entities.
 * Returns a response object matching PRD endpoint patterns.
 *
 * @param {string} entityType - The entity type key.
 * @param {object} [params={}] - Query parameters (filters, pagination, sorting).
 * @param {object} [params.filters] - Filter criteria.
 * @param {number} [params.page=1] - Page number (1-based).
 * @param {number} [params.pageSize=25] - Items per page.
 * @param {string} [params.sortKey] - Field to sort by.
 * @param {string} [params.sortDirection='asc'] - Sort direction.
 * @param {string} [params.query] - Search query string.
 * @param {Array<string>} [params.searchFields] - Fields to search within.
 * @returns {object} Simulated API response.
 */
export function apiGetAll(entityType, params = {}) {
  try {
    let data = getAll(entityType);

    // Apply filters
    if (params.filters && typeof params.filters === 'object' && Object.keys(params.filters).length > 0) {
      data = find(entityType, params.filters);
    }

    // Apply search
    if (params.query && typeof params.query === 'string' && params.query.trim() !== '') {
      const queryLower = params.query.trim().toLowerCase();
      const searchFields = Array.isArray(params.searchFields) && params.searchFields.length > 0
        ? params.searchFields
        : null;

      data = data.filter((item) => {
        const fieldsToSearch = searchFields || Object.keys(item);
        for (let i = 0; i < fieldsToSearch.length; i++) {
          const value = item[fieldsToSearch[i]];
          if (value !== null && value !== undefined) {
            if (String(value).toLowerCase().includes(queryLower)) {
              return true;
            }
          }
        }
        return false;
      });
    }

    const totalItems = data.length;

    // Apply sorting
    if (params.sortKey && typeof params.sortKey === 'string') {
      const dir = params.sortDirection === 'desc' ? -1 : 1;
      data = [...data].sort((a, b) => {
        const valA = a[params.sortKey];
        const valB = b[params.sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'string' && typeof valB === 'string') {
          return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * dir;
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return (valA - valB) * dir;
        }
        return String(valA).localeCompare(String(valB)) * dir;
      });
    }

    // Apply pagination
    const page = Math.max(1, Math.floor(Number(params.page) || 1));
    const pageSize = Math.max(1, Math.floor(Number(params.pageSize) || 25));
    const totalPages = Math.ceil(totalItems / pageSize);
    const clampedPage = Math.min(page, Math.max(totalPages, 1));
    const startIndex = (clampedPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const items = data.slice(startIndex, endIndex);

    return {
      status: 200,
      data: items,
      pagination: {
        page: clampedPage,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: clampedPage < totalPages,
        hasPreviousPage: clampedPage > 1,
      },
    };
  } catch (err) {
    console.error(`[MockDataStore] apiGetAll error for ${entityType}:`, err);
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
 * Simulate an API GET request for a single entity by ID.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID.
 * @returns {object} Simulated API response.
 */
export function apiGetById(entityType, id) {
  try {
    const entity = getById(entityType, id);

    if (!entity) {
      return {
        status: 404,
        error: `${entityType} with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: entity,
    };
  } catch (err) {
    console.error(`[MockDataStore] apiGetById error for ${entityType}/${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to create a new entity.
 *
 * @param {string} entityType - The entity type key.
 * @param {object} entity - The entity data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {object} Simulated API response.
 */
export function apiCreate(entityType, entity, userId = 'system') {
  try {
    if (!entity || typeof entity !== 'object') {
      return {
        status: 400,
        error: 'Invalid request body',
        data: null,
      };
    }

    const created = create(entityType, entity, userId);

    if (!created) {
      return {
        status: 400,
        error: 'Failed to create entity',
        data: null,
      };
    }

    return {
      status: 201,
      data: created,
    };
  } catch (err) {
    console.error(`[MockDataStore] apiCreate error for ${entityType}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API PUT/PATCH request to update an entity.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to update.
 * @param {object} updates - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @returns {object} Simulated API response.
 */
export function apiUpdate(entityType, id, updates, userId = 'system') {
  try {
    if (!updates || typeof updates !== 'object') {
      return {
        status: 400,
        error: 'Invalid request body',
        data: null,
      };
    }

    const existing = getById(entityType, id);
    if (!existing) {
      return {
        status: 404,
        error: `${entityType} with id '${id}' not found`,
        data: null,
      };
    }

    const updated = update(entityType, id, updates, userId);

    if (!updated) {
      return {
        status: 500,
        error: 'Failed to update entity',
        data: null,
      };
    }

    return {
      status: 200,
      data: updated,
    };
  } catch (err) {
    console.error(`[MockDataStore] apiUpdate error for ${entityType}/${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API DELETE request to remove an entity.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to delete.
 * @returns {object} Simulated API response.
 */
export function apiDelete(entityType, id) {
  try {
    const existing = getById(entityType, id);
    if (!existing) {
      return {
        status: 404,
        error: `${entityType} with id '${id}' not found`,
      };
    }

    const deleted = remove(entityType, id);

    if (!deleted) {
      return {
        status: 500,
        error: 'Failed to delete entity',
      };
    }

    return {
      status: 200,
      message: `${entityType} '${id}' deleted successfully`,
    };
  } catch (err) {
    console.error(`[MockDataStore] apiDelete error for ${entityType}/${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
    };
  }
}

// ---------------------------------------------------------------------------
// Domain-Specific API Helpers
// ---------------------------------------------------------------------------

/**
 * Simulate GET /api/integrations endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetIntegrations(params = {}) {
  return apiGetAll(ENTITY_TYPES.INTEGRATIONS, params);
}

/**
 * Simulate GET /api/integrations/:id endpoint.
 *
 * @param {string} id - The integration ID.
 * @returns {object} Simulated API response.
 */
export function apiGetIntegrationById(id) {
  return apiGetById(ENTITY_TYPES.INTEGRATIONS, id);
}

/**
 * Simulate GET /api/metrics endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetMetrics(params = {}) {
  return apiGetAll(ENTITY_TYPES.METRICS, params);
}

/**
 * Simulate GET /api/metrics/:id endpoint.
 *
 * @param {string} id - The metric ID.
 * @returns {object} Simulated API response.
 */
export function apiGetMetricById(id) {
  return apiGetById(ENTITY_TYPES.METRICS, id);
}

/**
 * Simulate GET /api/releases endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetReleases(params = {}) {
  return apiGetAll(ENTITY_TYPES.RELEASES, params);
}

/**
 * Simulate GET /api/releases/:id endpoint.
 *
 * @param {string} id - The release ID.
 * @returns {object} Simulated API response.
 */
export function apiGetReleaseById(id) {
  return apiGetById(ENTITY_TYPES.RELEASES, id);
}

/**
 * Simulate GET /api/demands endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetDemands(params = {}) {
  return apiGetAll(ENTITY_TYPES.DEMANDS, params);
}

/**
 * Simulate GET /api/demands/:id endpoint.
 *
 * @param {string} id - The demand ID.
 * @returns {object} Simulated API response.
 */
export function apiGetDemandById(id) {
  return apiGetById(ENTITY_TYPES.DEMANDS, id);
}

/**
 * Simulate GET /api/quality-gates endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetQualityGates(params = {}) {
  return apiGetAll(ENTITY_TYPES.QUALITY_GATES, params);
}

/**
 * Simulate GET /api/quality-gates/:id endpoint.
 *
 * @param {string} id - The quality gate ID.
 * @returns {object} Simulated API response.
 */
export function apiGetQualityGateById(id) {
  return apiGetById(ENTITY_TYPES.QUALITY_GATES, id);
}

/**
 * Simulate GET /api/test-assets (test cases) endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetTestCases(params = {}) {
  return apiGetAll(ENTITY_TYPES.TEST_CASES, params);
}

/**
 * Simulate GET /api/test-assets/:id endpoint.
 *
 * @param {string} id - The test case ID.
 * @returns {object} Simulated API response.
 */
export function apiGetTestCaseById(id) {
  return apiGetById(ENTITY_TYPES.TEST_CASES, id);
}

/**
 * Simulate GET /api/reports endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetReports(params = {}) {
  return apiGetAll(ENTITY_TYPES.REPORTS, params);
}

/**
 * Simulate GET /api/reports/:id endpoint.
 *
 * @param {string} id - The report ID.
 * @returns {object} Simulated API response.
 */
export function apiGetReportById(id) {
  return apiGetById(ENTITY_TYPES.REPORTS, id);
}

/**
 * Simulate GET /api/applications endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetApplications(params = {}) {
  return apiGetAll(ENTITY_TYPES.APPLICATIONS, params);
}

/**
 * Simulate GET /api/applications/:id endpoint.
 *
 * @param {string} id - The application ID.
 * @returns {object} Simulated API response.
 */
export function apiGetApplicationById(id) {
  return apiGetById(ENTITY_TYPES.APPLICATIONS, id);
}

/**
 * Simulate GET /api/environments endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetEnvironments(params = {}) {
  return apiGetAll(ENTITY_TYPES.ENVIRONMENTS, params);
}

/**
 * Simulate GET /api/environments/:id endpoint.
 *
 * @param {string} id - The environment ID.
 * @returns {object} Simulated API response.
 */
export function apiGetEnvironmentById(id) {
  return apiGetById(ENTITY_TYPES.ENVIRONMENTS, id);
}

/**
 * Simulate GET /api/users endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetUsers(params = {}) {
  return apiGetAll(ENTITY_TYPES.USERS, params);
}

/**
 * Simulate GET /api/users/:id endpoint.
 *
 * @param {string} id - The user ID.
 * @returns {object} Simulated API response.
 */
export function apiGetUserById(id) {
  return apiGetById(ENTITY_TYPES.USERS, id);
}

/**
 * Simulate GET /api/ai-insights endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetAIInsights(params = {}) {
  return apiGetAll(ENTITY_TYPES.AI_INSIGHTS, params);
}

/**
 * Simulate GET /api/ai-insights/:id endpoint.
 *
 * @param {string} id - The AI insight ID.
 * @returns {object} Simulated API response.
 */
export function apiGetAIInsightById(id) {
  return apiGetById(ENTITY_TYPES.AI_INSIGHTS, id);
}

/**
 * Simulate GET /api/governance-procedures endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetGovernanceProcedures(params = {}) {
  return apiGetAll(ENTITY_TYPES.GOVERNANCE_PROCEDURES, params);
}

/**
 * Simulate GET /api/governance-procedures/:id endpoint.
 *
 * @param {string} id - The governance procedure ID.
 * @returns {object} Simulated API response.
 */
export function apiGetGovernanceProcedureById(id) {
  return apiGetById(ENTITY_TYPES.GOVERNANCE_PROCEDURES, id);
}

/**
 * Simulate GET /api/notifications endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetNotifications(params = {}) {
  return apiGetAll(ENTITY_TYPES.NOTIFICATIONS, params);
}

/**
 * Simulate GET /api/notifications/:id endpoint.
 *
 * @param {string} id - The notification ID.
 * @returns {object} Simulated API response.
 */
export function apiGetNotificationById(id) {
  return apiGetById(ENTITY_TYPES.NOTIFICATIONS, id);
}

/**
 * Simulate GET /api/test-executions endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetTestExecutions(params = {}) {
  return apiGetAll(ENTITY_TYPES.TEST_EXECUTIONS, params);
}

/**
 * Simulate GET /api/test-executions/:id endpoint.
 *
 * @param {string} id - The test execution ID.
 * @returns {object} Simulated API response.
 */
export function apiGetTestExecutionById(id) {
  return apiGetById(ENTITY_TYPES.TEST_EXECUTIONS, id);
}

/**
 * Simulate GET /api/post-deployments endpoint.
 *
 * @param {object} [params={}] - Query parameters.
 * @returns {object} Simulated API response.
 */
export function apiGetPostDeployments(params = {}) {
  return apiGetAll(ENTITY_TYPES.POST_DEPLOYMENTS, params);
}

/**
 * Simulate GET /api/post-deployments/:id endpoint.
 *
 * @param {string} id - The post-deployment ID.
 * @returns {object} Simulated API response.
 */
export function apiGetPostDeploymentById(id) {
  return apiGetById(ENTITY_TYPES.POST_DEPLOYMENTS, id);
}

// ---------------------------------------------------------------------------
// Summary & Aggregate Helpers
// ---------------------------------------------------------------------------

/**
 * Get a summary of entity counts across all entity types.
 *
 * @returns {object} Object with entity type keys and count values.
 */
export function getEntityCounts() {
  const counts = {};
  const entityTypes = Object.values(ENTITY_TYPES);

  for (let i = 0; i < entityTypes.length; i++) {
    const entityType = entityTypes[i];
    counts[entityType] = getAll(entityType).length;
  }

  return counts;
}

/**
 * Get a grouped count of entities by a specific field.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} field - The field to group by.
 * @returns {object} Object with field value keys and count values.
 */
export function getGroupedCount(entityType, field) {
  if (!entityType || !field) {
    return {};
  }

  const entities = getAll(entityType);
  const counts = {};

  for (let i = 0; i < entities.length; i++) {
    const value = entities[i][field];
    const key = value === null || value === undefined ? 'unknown' : String(value);
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

/**
 * Get distinct values for a specific field across all entities of a type.
 *
 * @param {string} entityType - The entity type key.
 * @param {string} field - The field to extract distinct values from.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(entityType, field) {
  if (!entityType || !field) {
    return [];
  }

  const entities = getAll(entityType);
  const values = new Set();

  for (let i = 0; i < entities.length; i++) {
    const value = entities[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

// ---------------------------------------------------------------------------
// Store Status
// ---------------------------------------------------------------------------

/**
 * Check if the mock data store has been initialized.
 *
 * @returns {boolean} True if initialized.
 */
export function isInitialized() {
  return _initialized;
}

/**
 * Get the store status including entity counts and initialization state.
 *
 * @returns {object} Store status object.
 */
export function getStoreStatus() {
  return {
    initialized: _initialized,
    storageAvailable: isStorageAvailable(),
    entityCounts: getEntityCounts(),
    timestamp: new Date().toISOString(),
  };
}