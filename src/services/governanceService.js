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
 * @module governanceService
 * GovernanceProcedureManager service for eQIP Quality Intelligence.
 * Provides CRUD operations for governance procedures with PII masking, role-based
 * scoping, and audit logging. Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for governance procedures.
 * @type {string}
 */
const GOVERNANCE_ENTITY_TYPE = ENTITY_TYPES.GOVERNANCE_PROCEDURES;

/**
 * Roles that can view all governance procedures across all segments.
 * @type {Set<string>}
 */
const ALL_SEGMENTS_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.QA_LEAD,
  ROLES.RELEASE_MANAGER,
  ROLES.VIEWER,
]);

/**
 * Roles that can create governance procedures.
 * @type {Set<string>}
 */
const CREATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can update governance procedures.
 * @type {Set<string>}
 */
const UPDATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can delete governance procedures.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'create', 'update', 'delete').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return true;
    case 'create':
      return CREATE_ROLES.has(role);
    case 'update':
      return UPDATE_ROLES.has(role);
    case 'delete':
      return DELETE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Apply role-based scoping to governance procedures.
 * Admin, Program Manager, QA Lead, Release Manager, and Viewer can see all procedures.
 * Other roles see only procedures applicable to their segment.
 *
 * @param {Array<object>} procedures - The procedures to scope.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} The scoped procedures.
 */
function applyScopeByRole(procedures, role, userSegment) {
  if (!Array.isArray(procedures)) {
    return [];
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return procedures;
  }

  if (!userSegment) {
    return procedures;
  }

  return procedures.filter((proc) => {
    if (!Array.isArray(proc.applicableSegments) || proc.applicableSegments.length === 0) {
      return true;
    }
    return proc.applicableSegments.includes(userSegment);
  });
}

/**
 * Get all governance procedures with optional filtering, searching, sorting, and pagination.
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { complianceStatus: 'compliant', category: 'Security' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @param {string} [options.userSegment] - The user's segment for scoping.
 * @param {string} [options.userId] - The user ID for audit logging.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getProcedures(options = {}) {
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

  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);

  procedures = applyScopeByRole(procedures, role, options.userSegment);

  const result = processData(procedures, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'category', 'complianceStatus', 'riskLevel', 'status'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((proc) => maskEntity(proc, role));

  return result;
}

/**
 * Get all governance procedures without pagination (simple list).
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked governance procedure objects.
 */
export function getProceduresList(filters = {}, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);

  procedures = applyScopeByRole(procedures, role, userSegment);

  if (filters && Object.keys(filters).length > 0) {
    procedures = applyFilters(procedures, filters);
  }

  return procedures.map((proc) => maskEntity(proc, role));
}

/**
 * Get a single governance procedure by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The governance procedure ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked governance procedure object, or null if not found.
 */
export function getProcedureDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const procedure = getById(GOVERNANCE_ENTITY_TYPE, id);

  if (!procedure) {
    return null;
  }

  return maskEntity(procedure, role);
}

/**
 * Get a single governance procedure by ID (alias for getProcedureDetail).
 *
 * @param {string} id - The governance procedure ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked governance procedure object, or null if not found.
 */
export function getGovernanceProcedureById(id, role = ROLES.VIEWER) {
  return getProcedureDetail(id, role);
}

/**
 * Get a single governance procedure by name (case-insensitive).
 * Applies PII masking based on role.
 *
 * @param {string} name - The governance procedure name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked governance procedure object, or null if not found.
 */
export function getGovernanceProcedureByName(name, role = ROLES.VIEWER) {
  if (!name || typeof name !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  const nameLower = name.toLowerCase();
  const procedure = procedures.find((proc) => proc.name && proc.name.toLowerCase() === nameLower);

  if (!procedure) {
    return null;
  }

  return maskEntity(procedure, role);
}

/**
 * Create a new governance procedure.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The governance procedure data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked governance procedure, or null if unauthorized.
 */
export function createGovernanceProcedure(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[GovernanceService] User does not have permission to create governance procedures.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[GovernanceService] Invalid governance procedure data for create.');
    return null;
  }

  const now = new Date().toISOString();

  const procedureData = {
    ...data,
    id: data.id || uuidv4(),
    complianceStatus: data.complianceStatus || 'compliant',
    complianceRate: data.complianceRate || 0,
    applicableSegments: data.applicableSegments || [],
    applicableApplications: data.applicableApplications || [],
    evidenceLinks: data.evidenceLinks || [],
    findings: data.findings || [],
    metrics: data.metrics || {},
    riskLevel: data.riskLevel || 'low',
    status: data.status || 'active',
    tags: data.tags || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  const created = create(GOVERNANCE_ENTITY_TYPE, procedureData, userId);

  if (!created) {
    console.warn('[GovernanceService] Failed to create governance procedure.');
    return null;
  }

  logAction(userId, 'Create Governance Procedure', GOVERNANCE_ENTITY_TYPE, created.id, `Created governance procedure: ${created.name || created.id}`);

  return maskEntity(created, role);
}

/**
 * Update an existing governance procedure by ID.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {string} id - The governance procedure ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked governance procedure, or null if unauthorized or not found.
 */
export function updateGovernanceProcedure(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[GovernanceService] User does not have permission to update governance procedures.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[GovernanceService] Invalid governance procedure ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[GovernanceService] Invalid update data.');
    return null;
  }

  const existing = getById(GOVERNANCE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[GovernanceService] Governance procedure not found: ${id}`);
    return null;
  }

  const updates = { ...data };

  const updated = update(GOVERNANCE_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[GovernanceService] Failed to update governance procedure: ${id}`);
    return null;
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Governance Procedure', GOVERNANCE_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete a governance procedure by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The governance procedure ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the governance procedure was deleted, false otherwise.
 */
export function deleteGovernanceProcedure(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[GovernanceService] User does not have permission to delete governance procedures.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[GovernanceService] Invalid governance procedure ID for delete.');
    return false;
  }

  const existing = getById(GOVERNANCE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[GovernanceService] Governance procedure not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(GOVERNANCE_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Governance Procedure', GOVERNANCE_ENTITY_TYPE, id, `Deleted governance procedure: ${existing.name || id}`);
  }

  return deleted;
}

/**
 * Get governance procedures grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with category keys and arrays of masked governance procedures.
 */
export function getProceduresByCategory(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const grouped = {};

  for (let i = 0; i < procedures.length; i++) {
    const proc = procedures[i];
    const category = proc.category || 'Unknown';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(maskEntity(proc, role));
  }

  return grouped;
}

/**
 * Get governance procedures grouped by compliance status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with compliance status keys and arrays of masked governance procedures.
 */
export function getProceduresByComplianceStatus(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const grouped = {};

  for (let i = 0; i < procedures.length; i++) {
    const proc = procedures[i];
    const status = proc.complianceStatus || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(proc, role));
  }

  return grouped;
}

/**
 * Get governance procedures grouped by risk level.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with risk level keys and arrays of masked governance procedures.
 */
export function getProceduresByRiskLevel(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const grouped = {};

  for (let i = 0; i < procedures.length; i++) {
    const proc = procedures[i];
    const riskLevel = proc.riskLevel || 'unknown';

    if (!grouped[riskLevel]) {
      grouped[riskLevel] = [];
    }

    grouped[riskLevel].push(maskEntity(proc, role));
  }

  return grouped;
}

/**
 * Get governance procedure count grouped by compliance status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with compliance status keys and count values.
 */
export function getProcedureCountByComplianceStatus(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const counts = {};

  for (let i = 0; i < procedures.length; i++) {
    const status = procedures[i].complianceStatus || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}

/**
 * Get governance procedure count grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with category keys and count values.
 */
export function getProcedureCountByCategory(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const counts = {};

  for (let i = 0; i < procedures.length; i++) {
    const category = procedures[i].category || 'Unknown';
    counts[category] = (counts[category] || 0) + 1;
  }

  return counts;
}

/**
 * Get governance procedure count grouped by risk level.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with risk level keys and count values.
 */
export function getProcedureCountByRiskLevel(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const counts = {};

  for (let i = 0; i < procedures.length; i++) {
    const riskLevel = procedures[i].riskLevel || 'unknown';
    counts[riskLevel] = (counts[riskLevel] || 0) + 1;
  }

  return counts;
}

/**
 * Get governance procedures applicable to a specific segment.
 *
 * @param {string} segment - The segment name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked governance procedures applicable to the segment.
 */
export function getProceduresForSegment(segment, role = ROLES.VIEWER) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }

  const procedures = getAll(GOVERNANCE_ENTITY_TYPE);

  const filtered = procedures.filter(
    (proc) =>
      Array.isArray(proc.applicableSegments) &&
      (proc.applicableSegments.length === 0 || proc.applicableSegments.includes(segment)),
  );

  return filtered.map((proc) => maskEntity(proc, role));
}

/**
 * Get governance procedures applicable to a specific application.
 *
 * @param {string} application - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked governance procedures applicable to the application.
 */
export function getProceduresForApplication(application, role = ROLES.VIEWER) {
  if (!application || typeof application !== 'string') {
    return [];
  }

  const procedures = getAll(GOVERNANCE_ENTITY_TYPE);

  const filtered = procedures.filter(
    (proc) =>
      Array.isArray(proc.applicableApplications) &&
      (proc.applicableApplications.length === 0 || proc.applicableApplications.includes(application)),
  );

  return filtered.map((proc) => maskEntity(proc, role));
}

/**
 * Get governance procedures owned by a specific user.
 *
 * @param {string} ownerId - The owner user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked governance procedures owned by the user.
 */
export function getProceduresByOwner(ownerId, role = ROLES.VIEWER) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }

  const procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  const filtered = procedures.filter((proc) => proc.owner === ownerId);

  return filtered.map((proc) => maskEntity(proc, role));
}

/**
 * Get all governance procedures with open or in-progress findings.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked governance procedures with unresolved findings.
 */
export function getProceduresWithOpenFindings(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const filtered = procedures.filter(
    (proc) =>
      Array.isArray(proc.findings) &&
      proc.findings.some(
        (finding) => finding.status === 'open' || finding.status === 'in_progress',
      ),
  );

  return filtered.map((proc) => maskEntity(proc, role));
}

/**
 * Get all governance procedures with overdue reviews.
 * A review is overdue if nextReviewDate is in the past.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked governance procedures with overdue reviews.
 */
export function getProceduresWithOverdueReviews(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const now = new Date().getTime();

  const filtered = procedures.filter((proc) => {
    if (!proc.nextReviewDate) {
      return false;
    }
    const nextReview = new Date(proc.nextReviewDate).getTime();
    return !isNaN(nextReview) && nextReview < now;
  });

  return filtered.map((proc) => maskEntity(proc, role));
}

/**
 * Get governance procedures sorted by compliance rate ascending (worst first).
 *
 * @param {number} [limit] - Maximum number of procedures to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked governance procedures sorted by compliance rate.
 */
export function getLowestComplianceProcedures(limit, role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const sorted = [...procedures].sort(
    (a, b) => (a.complianceRate || 0) - (b.complianceRate || 0),
  );

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((proc) => maskEntity(proc, role));
}

/**
 * Get governance procedures sorted by compliance rate descending (best first).
 *
 * @param {number} [limit] - Maximum number of procedures to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked governance procedures sorted by compliance rate.
 */
export function getHighestComplianceProcedures(limit, role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const sorted = [...procedures].sort(
    (a, b) => (b.complianceRate || 0) - (a.complianceRate || 0),
  );

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((proc) => maskEntity(proc, role));
}

/**
 * Calculate the average compliance rate across all accessible governance procedures.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} The average compliance rate, or 0 if no procedures exist.
 */
export function getAverageComplianceRate(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  if (procedures.length === 0) {
    return 0;
  }

  let total = 0;
  for (let i = 0; i < procedures.length; i++) {
    total += procedures[i].complianceRate || 0;
  }

  return Math.round((total / procedures.length) * 100) / 100;
}

/**
 * Get the total number of open findings across all accessible governance procedures.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total count of open and in-progress findings.
 */
export function getTotalOpenFindings(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  let count = 0;
  for (let i = 0; i < procedures.length; i++) {
    if (Array.isArray(procedures[i].findings)) {
      for (let j = 0; j < procedures[i].findings.length; j++) {
        const status = procedures[i].findings[j].status;
        if (status === 'open' || status === 'in_progress') {
          count += 1;
        }
      }
    }
  }

  return count;
}

/**
 * Get the total number of findings grouped by severity across all accessible governance procedures.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with severity keys and count values.
 */
export function getFindingCountBySeverity(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const counts = {};
  for (let i = 0; i < procedures.length; i++) {
    if (Array.isArray(procedures[i].findings)) {
      for (let j = 0; j < procedures[i].findings.length; j++) {
        const severity = procedures[i].findings[j].severity;
        if (severity) {
          counts[severity] = (counts[severity] || 0) + 1;
        }
      }
    }
  }

  return counts;
}

/**
 * Get a comprehensive summary of governance compliance metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Summary object with governance compliance metrics.
 */
export function getGovernanceComplianceSummary(role = ROLES.VIEWER, userSegment) {
  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const total = procedures.length;
  let compliant = 0;
  let atRisk = 0;
  let nonCompliant = 0;
  let totalRate = 0;
  let totalFindings = 0;
  let openFindings = 0;
  let resolvedFindings = 0;
  let overdueReviews = 0;

  const now = new Date().getTime();

  for (let i = 0; i < procedures.length; i++) {
    const proc = procedures[i];
    totalRate += proc.complianceRate || 0;

    if (proc.complianceStatus === 'compliant') {
      compliant += 1;
    } else if (proc.complianceStatus === 'at_risk') {
      atRisk += 1;
    } else if (proc.complianceStatus === 'non_compliant') {
      nonCompliant += 1;
    }

    if (Array.isArray(proc.findings)) {
      totalFindings += proc.findings.length;
      for (let j = 0; j < proc.findings.length; j++) {
        if (proc.findings[j].status === 'open' || proc.findings[j].status === 'in_progress') {
          openFindings += 1;
        } else if (proc.findings[j].status === 'resolved') {
          resolvedFindings += 1;
        }
      }
    }

    if (proc.nextReviewDate) {
      const nextReview = new Date(proc.nextReviewDate).getTime();
      if (!isNaN(nextReview) && nextReview < now) {
        overdueReviews += 1;
      }
    }
  }

  return {
    totalProcedures: total,
    compliant,
    atRisk,
    nonCompliant,
    averageComplianceRate: total > 0 ? Math.round((totalRate / total) * 100) / 100 : 0,
    totalFindings,
    openFindings,
    resolvedFindings,
    overdueReviews,
  };
}

/**
 * Get distinct values for a specific field across all accessible governance procedures.
 *
 * @param {string} field - The field name to extract distinct values from.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(field, role = ROLES.VIEWER, userSegment) {
  if (!field || typeof field !== 'string') {
    return [];
  }

  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const values = new Set();

  for (let i = 0; i < procedures.length; i++) {
    const value = procedures[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Search governance procedures by name or category (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of matching masked governance procedures.
 */
export function searchProcedures(query, role = ROLES.VIEWER, userSegment) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  let procedures = getAll(GOVERNANCE_ENTITY_TYPE);
  procedures = applyScopeByRole(procedures, role, userSegment);

  const results = searchByText(procedures, query, ['name', 'category', 'complianceStatus', 'riskLevel', 'description']);

  return results.map((proc) => maskEntity(proc, role));
}

/**
 * Simulate an API GET request for governance procedures.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetGovernanceProcedures(params = {}, role = ROLES.VIEWER) {
  const response = apiGetAll(GOVERNANCE_ENTITY_TYPE, params);

  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map((proc) => maskEntity(proc, role));
  }

  return response;
}

/**
 * Simulate an API GET request for a single governance procedure.
 *
 * @param {string} id - The governance procedure ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetGovernanceProcedure(id, role = ROLES.VIEWER) {
  const response = apiGetById(GOVERNANCE_ENTITY_TYPE, id);

  if (response.data) {
    response.data = maskEntity(response.data, role);
  }

  return response;
}

/**
 * Simulate an API POST request to create a governance procedure.
 *
 * @param {object} data - The governance procedure data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateGovernanceProcedure(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    return {
      status: 403,
      error: 'You do not have permission to create governance procedures.',
      data: null,
    };
  }

  const created = createGovernanceProcedure(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create governance procedure.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update a governance procedure.
 *
 * @param {string} id - The governance procedure ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateGovernanceProcedure(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to update governance procedures.',
      data: null,
    };
  }

  const updated = updateGovernanceProcedure(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Governance procedure with id '${id}' not found.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete a governance procedure.
 *
 * @param {string} id - The governance procedure ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteGovernanceProcedure(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete governance procedures.',
    };
  }

  const deleted = deleteGovernanceProcedure(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Governance procedure with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Governance procedure '${id}' deleted successfully.`,
  };
}