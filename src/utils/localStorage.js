import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS, QUALITY_GATES, DEMAND_TYPES, STATUS, GATE_STATUS, DEFECT_SEVERITY, DEFECT_PRIORITY } from '../constants.js';

/**
 * Prefix for all eQIP localStorage keys to avoid collisions.
 * @type {string}
 */
const STORAGE_PREFIX = 'eqip_';

/**
 * Schema version key for migration support.
 * @type {string}
 */
const SCHEMA_VERSION_KEY = 'eqip_schema_version';

/**
 * Current schema version.
 * @type {number}
 */
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Key used to track whether initial seeding has occurred.
 * @type {string}
 */
const INITIALIZED_KEY = 'eqip_initialized';

// ---------------------------------------------------------------------------
// Core CRUD Helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve a value from localStorage by key, with JSON deserialization.
 * @param {string} key - The storage key.
 * @param {*} [defaultValue=null] - Value to return if key is not found or on error.
 * @returns {*} The parsed value, or defaultValue on failure.
 */
export function getItem(key, defaultValue = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[LocalStorageManager] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

/**
 * Store a value in localStorage with JSON serialization.
 * @param {string} key - The storage key.
 * @param {*} value - The value to store (will be JSON-serialized).
 * @returns {boolean} True if successful, false otherwise.
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[LocalStorageManager] Error writing key "${key}":`, err);
    return false;
  }
}

/**
 * Remove a single key from localStorage.
 * @param {string} key - The storage key to remove.
 * @returns {boolean} True if successful, false otherwise.
 */
export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`[LocalStorageManager] Error removing key "${key}":`, err);
    return false;
  }
}

/**
 * Clear all eQIP-prefixed keys from localStorage.
 * @returns {boolean} True if successful, false otherwise.
 */
export function clearAll() {
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    return true;
  } catch (err) {
    console.error('[LocalStorageManager] Error clearing storage:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Entity-Level Helpers
// ---------------------------------------------------------------------------

/**
 * Load an array of entities from localStorage by entity type key.
 * @param {string} entityType - The entity type key (e.g. 'releases', 'demands').
 * @returns {Array<object>} The array of entities, or empty array if not found.
 */
export function loadEntities(entityType) {
  const key = `${STORAGE_PREFIX}${entityType}`;
  return getItem(key, []);
}

/**
 * Persist an array of entities to localStorage by entity type key.
 * @param {string} entityType - The entity type key.
 * @param {Array<object>} entities - The entities to persist.
 * @returns {boolean} True if successful.
 */
export function persistEntities(entityType, entities) {
  const key = `${STORAGE_PREFIX}${entityType}`;
  return setItem(key, entities);
}

/**
 * Find a single entity by ID within a stored entity type.
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID.
 * @returns {object|null} The found entity or null.
 */
export function findEntityById(entityType, id) {
  const entities = loadEntities(entityType);
  return entities.find((e) => e.id === id) || null;
}

/**
 * Add a new entity to a stored entity type array.
 * @param {string} entityType - The entity type key.
 * @param {object} entity - The entity to add (should include an id).
 * @returns {object} The added entity.
 */
export function addEntity(entityType, entity) {
  const entities = loadEntities(entityType);
  const now = new Date().toISOString();
  const newEntity = {
    id: entity.id || uuidv4(),
    ...entity,
    created_at: entity.created_at || now,
    updated_at: entity.updated_at || now,
  };
  entities.push(newEntity);
  persistEntities(entityType, entities);
  return newEntity;
}

/**
 * Update an existing entity by ID within a stored entity type array.
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to update.
 * @param {object} updates - The fields to update.
 * @returns {object|null} The updated entity, or null if not found.
 */
export function updateEntity(entityType, id, updates) {
  const entities = loadEntities(entityType);
  const index = entities.findIndex((e) => e.id === id);
  if (index === -1) {
    console.warn(`[LocalStorageManager] Entity not found: ${entityType}/${id}`);
    return null;
  }
  const now = new Date().toISOString();
  entities[index] = {
    ...entities[index],
    ...updates,
    id: entities[index].id,
    created_at: entities[index].created_at,
    updated_at: now,
  };
  persistEntities(entityType, entities);
  return entities[index];
}

/**
 * Delete an entity by ID from a stored entity type array.
 * @param {string} entityType - The entity type key.
 * @param {string} id - The entity ID to delete.
 * @returns {boolean} True if the entity was found and deleted.
 */
export function deleteEntity(entityType, id) {
  const entities = loadEntities(entityType);
  const filtered = entities.filter((e) => e.id !== id);
  if (filtered.length === entities.length) {
    console.warn(`[LocalStorageManager] Entity not found for deletion: ${entityType}/${id}`);
    return false;
  }
  persistEntities(entityType, filtered);
  return true;
}

// ---------------------------------------------------------------------------
// Storage Event Listener
// ---------------------------------------------------------------------------

/**
 * Subscribe to storage change events for cross-tab synchronization.
 * @param {function} callback - Called with (key, newValue, oldValue) on change.
 * @returns {function} Unsubscribe function.
 */
export function onStorageChange(callback) {
  const handler = (event) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      let newValue = null;
      let oldValue = null;
      try {
        newValue = event.newValue ? JSON.parse(event.newValue) : null;
      } catch (_err) {
        newValue = event.newValue;
      }
      try {
        oldValue = event.oldValue ? JSON.parse(event.oldValue) : null;
      } catch (_err) {
        oldValue = event.oldValue;
      }
      callback(event.key, newValue, oldValue);
    }
  };
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('storage', handler);
  };
}

// ---------------------------------------------------------------------------
// Schema Migration
// ---------------------------------------------------------------------------

/**
 * Migrate localStorage schema from one version to another.
 * @param {string} entityType - The entity type key.
 * @param {number} fromVersion - The source schema version.
 * @param {number} toVersion - The target schema version.
 */
export function migrateSchema(entityType, fromVersion, toVersion) {
  if (fromVersion >= toVersion) {
    return;
  }
  const entities = loadEntities(entityType);
  const migrated = entities.map((entity) => {
    const updated = { ...entity };
    if (!updated.created_at) {
      updated.created_at = new Date().toISOString();
    }
    if (!updated.updated_at) {
      updated.updated_at = new Date().toISOString();
    }
    if (!updated.created_by) {
      updated.created_by = 'system';
    }
    if (!updated.updated_by) {
      updated.updated_by = 'system';
    }
    return updated;
  });
  persistEntities(entityType, migrated);
}

/**
 * Run all necessary schema migrations.
 */
function runMigrations() {
  const storedVersion = getItem(SCHEMA_VERSION_KEY, 0);
  if (storedVersion < CURRENT_SCHEMA_VERSION) {
    const entityTypes = [
      'releases',
      'quality-gates',
      'demands',
      'audit-logs',
      'governance-procedures',
      'test-assets',
    ];
    entityTypes.forEach((type) => {
      migrateSchema(type, storedVersion, CURRENT_SCHEMA_VERSION);
    });
    setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
  }
}

// ---------------------------------------------------------------------------
// Mock Data Seeding
// ---------------------------------------------------------------------------

/**
 * Generate a relative ISO date string.
 * @param {number} daysAgo - Number of days in the past.
 * @returns {string} ISO8601 date string.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Generate default mock releases.
 * @returns {Array<object>}
 */
function generateMockReleases() {
  return [
    {
      id: 'rel-001',
      name: 'Release 2024.06',
      segment: 'Claims',
      application: 'EQIP Core',
      quality_score: 92,
      status: 'Ready',
      recommendations: ['Increase test coverage', 'Review defect backlog'],
      created_at: daysAgo(30),
      updated_at: daysAgo(5),
      created_by: 'user-001',
      updated_by: 'user-002',
    },
    {
      id: 'rel-002',
      name: 'Release 2024.07',
      segment: 'Billing',
      application: 'Payment Gateway',
      quality_score: 78,
      status: 'In Progress',
      recommendations: ['Complete regression testing', 'Resolve critical defects'],
      created_at: daysAgo(20),
      updated_at: daysAgo(2),
      created_by: 'user-001',
      updated_by: 'user-003',
    },
    {
      id: 'rel-003',
      name: 'Release 2024.08',
      segment: 'Enrollment',
      application: 'Member Portal',
      quality_score: 85,
      status: 'In Review',
      recommendations: ['Run performance tests', 'Validate accessibility compliance'],
      created_at: daysAgo(15),
      updated_at: daysAgo(1),
      created_by: 'user-002',
      updated_by: 'user-002',
    },
    {
      id: 'rel-004',
      name: 'Release 2024.09',
      segment: 'Provider',
      application: 'Provider Directory',
      quality_score: 65,
      status: 'At Risk',
      recommendations: ['Address security vulnerabilities', 'Increase automation coverage'],
      created_at: daysAgo(10),
      updated_at: daysAgo(1),
      created_by: 'user-003',
      updated_by: 'user-001',
    },
    {
      id: 'rel-005',
      name: 'Release 2024.10',
      segment: 'Claims',
      application: 'Claims Processing',
      quality_score: 95,
      status: 'Ready',
      recommendations: [],
      created_at: daysAgo(45),
      updated_at: daysAgo(3),
      created_by: 'user-001',
      updated_by: 'user-001',
    },
  ];
}

/**
 * Generate default mock quality gates.
 * @returns {Array<object>}
 */
function generateMockQualityGates() {
  return QUALITY_GATES.map((gate, index) => ({
    id: `gate-${String(index + 1).padStart(2, '0')}`,
    name: gate.label,
    key: gate.key,
    phase: gate.phase,
    description: gate.description,
    threshold: 80,
    status: index < 6 ? GATE_STATUS.PASSED : index < 10 ? GATE_STATUS.IN_REVIEW : GATE_STATUS.NOT_STARTED,
    applicability: 'All Releases',
    waiver: null,
    created_at: daysAgo(60),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-001',
  }));
}

/**
 * Generate default mock demands.
 * @returns {Array<object>}
 */
function generateMockDemands() {
  const segments = ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy'];
  const applications = ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'];
  const statuses = [STATUS.DRAFT, STATUS.ACTIVE, STATUS.IN_PROGRESS, STATUS.COMPLETED, STATUS.ON_HOLD];
  const priorities = [DEFECT_PRIORITY.P1, DEFECT_PRIORITY.P2, DEFECT_PRIORITY.P3, DEFECT_PRIORITY.P4];

  return DEMAND_TYPES.map((type, index) => ({
    id: `dem-${String(index + 1).padStart(3, '0')}`,
    type,
    title: `${type} - ${segments[index % segments.length]} Q${Math.ceil((index + 1) / 3)}`,
    description: `Mock demand for ${type.toLowerCase()} in ${segments[index % segments.length]} segment.`,
    status: statuses[index % statuses.length],
    priority: priorities[index % priorities.length],
    severity: Object.values(DEFECT_SEVERITY)[index % Object.values(DEFECT_SEVERITY).length],
    owner: `user-${String((index % 5) + 1).padStart(3, '0')}`,
    segment: segments[index % segments.length],
    application: applications[index % applications.length],
    created_at: daysAgo(30 - index * 2),
    updated_at: daysAgo(Math.max(1, 10 - index)),
    created_by: `user-${String((index % 3) + 1).padStart(3, '0')}`,
    updated_by: `user-${String((index % 4) + 1).padStart(3, '0')}`,
  }));
}

/**
 * Generate default mock governance procedures.
 * @returns {Array<object>}
 */
function generateMockGovernanceProcedures() {
  return [
    {
      id: 'gov-001',
      name: 'Change Advisory Board Review',
      category: 'Change Management',
      compliance_rate: 94,
      status: STATUS.ACTIVE,
      description: 'All changes must be reviewed and approved by the Change Advisory Board before deployment.',
      last_audit_date: daysAgo(14),
      next_audit_date: daysAgo(-30),
      created_at: daysAgo(90),
      updated_at: daysAgo(14),
      created_by: 'user-001',
      updated_by: 'user-001',
    },
    {
      id: 'gov-002',
      name: 'Security Compliance Check',
      category: 'Security',
      compliance_rate: 88,
      status: STATUS.ACTIVE,
      description: 'All releases must pass security compliance checks before production deployment.',
      last_audit_date: daysAgo(7),
      next_audit_date: daysAgo(-21),
      created_at: daysAgo(90),
      updated_at: daysAgo(7),
      created_by: 'user-001',
      updated_by: 'user-002',
    },
    {
      id: 'gov-003',
      name: 'Regulatory Compliance Audit',
      category: 'Regulatory',
      compliance_rate: 96,
      status: STATUS.ACTIVE,
      description: 'Quarterly audit to ensure compliance with healthcare regulations.',
      last_audit_date: daysAgo(45),
      next_audit_date: daysAgo(-45),
      created_at: daysAgo(180),
      updated_at: daysAgo(45),
      created_by: 'user-001',
      updated_by: 'user-001',
    },
    {
      id: 'gov-004',
      name: 'Data Privacy Review',
      category: 'Privacy',
      compliance_rate: 91,
      status: STATUS.ACTIVE,
      description: 'Review of data handling practices to ensure PII protection.',
      last_audit_date: daysAgo(21),
      next_audit_date: daysAgo(-14),
      created_at: daysAgo(120),
      updated_at: daysAgo(21),
      created_by: 'user-002',
      updated_by: 'user-002',
    },
    {
      id: 'gov-005',
      name: 'Accessibility Standards Review',
      category: 'Accessibility',
      compliance_rate: 82,
      status: STATUS.IN_PROGRESS,
      description: 'Ensure all applications meet WCAG 2.1 AA accessibility standards.',
      last_audit_date: daysAgo(30),
      next_audit_date: daysAgo(-7),
      created_at: daysAgo(60),
      updated_at: daysAgo(5),
      created_by: 'user-003',
      updated_by: 'user-001',
    },
  ];
}

/**
 * Generate default mock audit logs.
 * @returns {Array<object>}
 */
function generateMockAuditLogs() {
  return [
    {
      id: 'audit-001',
      action: 'Create Release',
      entity_type: 'releases',
      entity_id: 'rel-001',
      user_id: 'user-001',
      timestamp: daysAgo(30),
      details: 'Created Release 2024.06',
    },
    {
      id: 'audit-002',
      action: 'Update Quality Gate',
      entity_type: 'quality-gates',
      entity_id: 'gate-01',
      user_id: 'user-002',
      timestamp: daysAgo(25),
      details: 'Threshold changed from 75 to 80',
    },
    {
      id: 'audit-003',
      action: 'Create Demand',
      entity_type: 'demands',
      entity_id: 'dem-001',
      user_id: 'user-001',
      timestamp: daysAgo(20),
      details: 'Created Feature demand for Claims segment',
    },
    {
      id: 'audit-004',
      action: 'Update Demand',
      entity_type: 'demands',
      entity_id: 'dem-001',
      user_id: 'user-003',
      timestamp: daysAgo(15),
      details: 'Status changed from draft to active',
    },
    {
      id: 'audit-005',
      action: 'Update Release',
      entity_type: 'releases',
      entity_id: 'rel-002',
      user_id: 'user-002',
      timestamp: daysAgo(10),
      details: 'Quality score updated to 78',
    },
    {
      id: 'audit-006',
      action: 'Governance Audit',
      entity_type: 'governance-procedures',
      entity_id: 'gov-001',
      user_id: 'user-001',
      timestamp: daysAgo(14),
      details: 'Completed Change Advisory Board review audit',
    },
    {
      id: 'audit-007',
      action: 'Quality Gate Waiver',
      entity_type: 'quality-gates',
      entity_id: 'gate-05',
      user_id: 'user-001',
      timestamp: daysAgo(8),
      details: 'Waiver requested for unit test coverage gate',
    },
    {
      id: 'audit-008',
      action: 'Delete Demand',
      entity_type: 'demands',
      entity_id: 'dem-010',
      user_id: 'user-002',
      timestamp: daysAgo(5),
      details: 'Removed duplicate Research Spike demand',
    },
  ];
}

/**
 * Generate default mock user profile.
 * @returns {object}
 */
function generateMockUserProfile() {
  return {
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@eqip.example.com',
    role: 'admin',
    persona: 'VP of Quality',
    avatar: null,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
  };
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initialize localStorage with default mock data if not already seeded.
 * Safe to call multiple times — only seeds on first load.
 * @returns {boolean} True if initialization occurred, false if already initialized.
 */
export function initializeStorage() {
  try {
    const alreadyInitialized = getItem(INITIALIZED_KEY, false);
    if (alreadyInitialized) {
      runMigrations();
      return false;
    }

    persistEntities('releases', generateMockReleases());
    persistEntities('quality-gates', generateMockQualityGates());
    persistEntities('demands', generateMockDemands());
    persistEntities('governance-procedures', generateMockGovernanceProcedures());
    persistEntities('audit-logs', generateMockAuditLogs());

    setItem(STORAGE_KEYS.USER_PROFILE, generateMockUserProfile());
    setItem(STORAGE_KEYS.SELECTED_ROLE, 'admin');
    setItem(STORAGE_KEYS.THEME_PREFERENCE, 'light');
    setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
    setItem(STORAGE_KEYS.LAST_VISITED_PATH, '/');
    setItem(STORAGE_KEYS.FILTER_PREFERENCES, {});
    setItem(STORAGE_KEYS.DASHBOARD_LAYOUT, { columns: 2, widgets: [] });

    setItem(SCHEMA_VERSION_KEY, CURRENT_SCHEMA_VERSION);
    setItem(INITIALIZED_KEY, true);

    return true;
  } catch (err) {
    console.error('[LocalStorageManager] Error during initialization:', err);
    return false;
  }
}

/**
 * Reset all eQIP data and re-seed with defaults.
 * @returns {boolean} True if successful.
 */
export function resetStorage() {
  clearAll();
  return initializeStorage();
}

/**
 * Check if localStorage is available in the current environment.
 * @returns {boolean} True if localStorage is available.
 */
export function isStorageAvailable() {
  try {
    const testKey = '__eqip_storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (_err) {
    return false;
  }
}