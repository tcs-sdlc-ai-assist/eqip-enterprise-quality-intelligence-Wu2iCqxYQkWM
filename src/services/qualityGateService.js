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
 * @module qualityGateService
 * QualityGateManager service for eQIP Quality Intelligence.
 * Provides CRUD operations for quality gates with PII masking, role-based access,
 * waiver workflow, and audit logging. Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for quality gates.
 * @type {string}
 */
const QUALITY_GATE_ENTITY_TYPE = ENTITY_TYPES.QUALITY_GATES;

/**
 * Roles that can view all quality gates across all segments.
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
 * Roles that can update quality gates (threshold, applicability, etc.).
 * @type {Set<string>}
 */
const UPDATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.QA_LEAD,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can request a waiver for a quality gate.
 * @type {Set<string>}
 */
const WAIVER_REQUEST_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can approve or reject a waiver.
 * @type {Set<string>}
 */
const WAIVER_APPROVE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can create quality gates.
 * @type {Set<string>}
 */
const CREATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can delete quality gates.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'create', 'update', 'delete', 'request_waiver', 'approve_waiver').
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
    case 'request_waiver':
      return WAIVER_REQUEST_ROLES.has(role);
    case 'approve_waiver':
      return WAIVER_APPROVE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Apply role-based scoping to quality gates.
 * Admin, Program Manager, QA Lead, Release Manager, and Viewer can see all gates.
 * Other roles see only gates applicable to their segment.
 *
 * @param {Array<object>} gates - The quality gates to scope.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} The scoped quality gates.
 */
function applyScopeByRole(gates, role, userSegment) {
  if (!Array.isArray(gates)) {
    return [];
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return gates;
  }

  if (!userSegment) {
    return gates;
  }

  return gates.filter((gate) => {
    if (!gate.applicabilityRules || !Array.isArray(gate.applicabilityRules.segments)) {
      return true;
    }
    if (gate.applicabilityRules.segments.length === 0) {
      return true;
    }
    return gate.applicabilityRules.segments.includes(userSegment);
  });
}

/**
 * Get all quality gates with optional filtering, searching, sorting, and pagination.
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { status: 'passed', phase: 'testing' }).
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
export function getQualityGates(options = {}) {
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

  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);

  gates = applyScopeByRole(gates, role, options.userSegment);

  const result = processData(gates, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'key', 'category', 'phase', 'status'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((gate) => maskEntity(gate, role));

  return result;
}

/**
 * Get all quality gates without pagination (simple list).
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked quality gate objects.
 */
export function getQualityGatesList(filters = {}, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);

  gates = applyScopeByRole(gates, role, userSegment);

  if (filters && Object.keys(filters).length > 0) {
    gates = applyFilters(gates, filters);
  }

  return gates.map((gate) => maskEntity(gate, role));
}

/**
 * Get a single quality gate by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The quality gate ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked quality gate object, or null if not found.
 */
export function getQualityGateDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const gate = getById(QUALITY_GATE_ENTITY_TYPE, id);

  if (!gate) {
    return null;
  }

  return maskEntity(gate, role);
}

/**
 * Get a single quality gate by ID (alias for getQualityGateDetail).
 *
 * @param {string} id - The quality gate ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked quality gate object, or null if not found.
 */
export function getQualityGateById(id, role = ROLES.VIEWER) {
  return getQualityGateDetail(id, role);
}

/**
 * Get a single quality gate by key.
 * Applies PII masking based on role.
 *
 * @param {string} key - The quality gate key (e.g., 'code_review').
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked quality gate object, or null if not found.
 */
export function getQualityGateByKey(key, role = ROLES.VIEWER) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  const gate = gates.find((g) => g.key === key);

  if (!gate) {
    return null;
  }

  return maskEntity(gate, role);
}

/**
 * Create a new quality gate.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The quality gate data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked quality gate, or null if unauthorized.
 */
export function createQualityGate(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[QualityGateService] User does not have permission to create quality gates.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[QualityGateService] Invalid quality gate data for create.');
    return null;
  }

  const now = new Date().toISOString();

  const gateData = {
    ...data,
    id: data.id || uuidv4(),
    status: data.status || 'not_started',
    currentValue: data.currentValue || 0,
    waiverHistory: data.waiverHistory || [],
    evidence: data.evidence || [],
    linkedReleases: data.linkedReleases || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  const created = create(QUALITY_GATE_ENTITY_TYPE, gateData, userId);

  if (!created) {
    console.warn('[QualityGateService] Failed to create quality gate.');
    return null;
  }

  logAction(userId, 'Create Quality Gate', QUALITY_GATE_ENTITY_TYPE, created.id, `Created quality gate: ${created.name || created.id}`);

  return maskEntity(created, role);
}

/**
 * Update an existing quality gate by ID.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {string} id - The quality gate ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked quality gate, or null if unauthorized or not found.
 */
export function updateQualityGate(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[QualityGateService] User does not have permission to update quality gates.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[QualityGateService] Invalid quality gate ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[QualityGateService] Invalid update data.');
    return null;
  }

  const existing = getById(QUALITY_GATE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[QualityGateService] Quality gate not found: ${id}`);
    return null;
  }

  const updates = { ...data };

  // Recalculate status if currentValue and threshold are provided
  if (updates.currentValue !== undefined || updates.threshold !== undefined) {
    const threshold = updates.threshold !== undefined ? updates.threshold : existing.threshold;
    const currentValue = updates.currentValue !== undefined ? updates.currentValue : existing.currentValue;
    const unit = updates.unit || existing.unit;

    if (unit === 'critical_issues' || unit === 'critical_vulnerabilities') {
      if (typeof currentValue === 'number' && typeof threshold === 'number') {
        if (currentValue <= threshold) {
          updates.status = 'passed';
        } else {
          updates.status = 'failed';
        }
      }
    } else if (unit === '%') {
      if (typeof currentValue === 'number' && typeof threshold === 'number') {
        if (currentValue >= threshold) {
          updates.status = 'passed';
        } else {
          updates.status = 'failed';
        }
      }
    }
  }

  updates.lastEvaluated = new Date().toISOString();

  const updated = update(QUALITY_GATE_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[QualityGateService] Failed to update quality gate: ${id}`);
    return null;
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Quality Gate', QUALITY_GATE_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete a quality gate by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The quality gate ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the quality gate was deleted, false otherwise.
 */
export function deleteQualityGate(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[QualityGateService] User does not have permission to delete quality gates.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[QualityGateService] Invalid quality gate ID for delete.');
    return false;
  }

  const existing = getById(QUALITY_GATE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[QualityGateService] Quality gate not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(QUALITY_GATE_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Quality Gate', QUALITY_GATE_ENTITY_TYPE, id, `Deleted quality gate: ${existing.name || id}`);
  }

  return deleted;
}

/**
 * Request a waiver for a quality gate.
 * Creates a waiver entry in the gate's waiverHistory and updates the gate status.
 *
 * @param {string} gateId - The quality gate ID.
 * @param {object} waiverData - The waiver request data.
 * @param {string} waiverData.releaseId - The release ID the waiver applies to.
 * @param {string} waiverData.reason - The reason for the waiver request.
 * @param {string} [waiverData.expiresAt] - Optional expiration date for the waiver.
 * @param {string} [userId='system'] - The user ID requesting the waiver.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked quality gate, or null if unauthorized or not found.
 */
export function requestWaiver(gateId, waiverData, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'request_waiver')) {
    console.warn('[QualityGateService] User does not have permission to request waivers.');
    return null;
  }

  if (!gateId || typeof gateId !== 'string') {
    console.warn('[QualityGateService] Invalid quality gate ID for waiver request.');
    return null;
  }

  if (!waiverData || typeof waiverData !== 'object') {
    console.warn('[QualityGateService] Invalid waiver data.');
    return null;
  }

  if (!waiverData.reason || typeof waiverData.reason !== 'string' || waiverData.reason.trim() === '') {
    console.warn('[QualityGateService] Waiver reason is required.');
    return null;
  }

  const existing = getById(QUALITY_GATE_ENTITY_TYPE, gateId);

  if (!existing) {
    console.warn(`[QualityGateService] Quality gate not found: ${gateId}`);
    return null;
  }

  const now = new Date().toISOString();

  const waiverEntry = {
    id: `waiver-${uuidv4().slice(0, 8)}`,
    releaseId: waiverData.releaseId || null,
    reason: waiverData.reason.trim(),
    requestedBy: userId,
    requestedAt: now,
    status: 'pending',
    approvedBy: null,
    approvedAt: null,
    expiresAt: waiverData.expiresAt || null,
    comments: waiverData.comments || '',
  };

  const waiverHistory = Array.isArray(existing.waiverHistory)
    ? [...existing.waiverHistory, waiverEntry]
    : [waiverEntry];

  const updates = {
    waiverHistory,
    updated_at: now,
    updated_by: userId,
  };

  const updated = update(QUALITY_GATE_ENTITY_TYPE, gateId, updates, userId);

  if (!updated) {
    console.warn(`[QualityGateService] Failed to request waiver for quality gate: ${gateId}`);
    return null;
  }

  logAction(
    userId,
    'Quality Gate Waiver Request',
    QUALITY_GATE_ENTITY_TYPE,
    gateId,
    `Waiver requested for gate "${existing.name || gateId}" on release "${waiverData.releaseId || 'N/A'}". Reason: ${waiverData.reason.trim()}`,
  );

  return maskEntity(updated, role);
}

/**
 * Approve or reject a waiver for a quality gate.
 * Updates the waiver entry status and optionally updates the gate status to 'waived'.
 *
 * @param {string} gateId - The quality gate ID.
 * @param {string} waiverId - The waiver entry ID to approve/reject.
 * @param {string} decision - The decision: 'approved' or 'rejected'.
 * @param {string} [comments=''] - Optional comments for the decision.
 * @param {string} [userId='system'] - The user ID making the decision.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked quality gate, or null if unauthorized or not found.
 */
export function resolveWaiver(gateId, waiverId, decision, comments = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve_waiver')) {
    console.warn('[QualityGateService] User does not have permission to approve/reject waivers.');
    return null;
  }

  if (!gateId || typeof gateId !== 'string') {
    console.warn('[QualityGateService] Invalid quality gate ID for waiver resolution.');
    return null;
  }

  if (!waiverId || typeof waiverId !== 'string') {
    console.warn('[QualityGateService] Invalid waiver ID for resolution.');
    return null;
  }

  if (decision !== 'approved' && decision !== 'rejected') {
    console.warn('[QualityGateService] Invalid waiver decision. Must be "approved" or "rejected".');
    return null;
  }

  const existing = getById(QUALITY_GATE_ENTITY_TYPE, gateId);

  if (!existing) {
    console.warn(`[QualityGateService] Quality gate not found: ${gateId}`);
    return null;
  }

  if (!Array.isArray(existing.waiverHistory)) {
    console.warn(`[QualityGateService] No waiver history found for quality gate: ${gateId}`);
    return null;
  }

  const waiverIndex = existing.waiverHistory.findIndex((w) => w.id === waiverId);

  if (waiverIndex === -1) {
    console.warn(`[QualityGateService] Waiver not found: ${waiverId} in gate ${gateId}`);
    return null;
  }

  const now = new Date().toISOString();

  const updatedWaiverHistory = [...existing.waiverHistory];
  updatedWaiverHistory[waiverIndex] = {
    ...updatedWaiverHistory[waiverIndex],
    status: decision,
    approvedBy: userId,
    approvedAt: now,
    comments: comments || updatedWaiverHistory[waiverIndex].comments || '',
  };

  const updates = {
    waiverHistory: updatedWaiverHistory,
    updated_at: now,
    updated_by: userId,
  };

  // If approved, update gate status to 'waived'
  if (decision === 'approved') {
    updates.status = 'waived';
  }

  const updated = update(QUALITY_GATE_ENTITY_TYPE, gateId, updates, userId);

  if (!updated) {
    console.warn(`[QualityGateService] Failed to resolve waiver for quality gate: ${gateId}`);
    return null;
  }

  const actionLabel = decision === 'approved' ? 'Waiver Approved' : 'Waiver Rejected';
  logAction(
    userId,
    `Quality Gate ${actionLabel}`,
    QUALITY_GATE_ENTITY_TYPE,
    gateId,
    `${actionLabel} for gate "${existing.name || gateId}", waiver "${waiverId}". ${comments ? 'Comment: ' + comments : ''}`,
  );

  return maskEntity(updated, role);
}

/**
 * Get quality gates grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and arrays of masked quality gates.
 */
export function getQualityGatesByStatus(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const grouped = {};

  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    const status = gate.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(gate, role));
  }

  return grouped;
}

/**
 * Get quality gates grouped by phase.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with phase keys and arrays of masked quality gates.
 */
export function getQualityGatesByPhase(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const grouped = {};

  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    const phase = gate.phase || 'unknown';

    if (!grouped[phase]) {
      grouped[phase] = [];
    }

    grouped[phase].push(maskEntity(gate, role));
  }

  return grouped;
}

/**
 * Get quality gates grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with category keys and arrays of masked quality gates.
 */
export function getQualityGatesByCategory(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const grouped = {};

  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    const category = gate.category || 'Unknown';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(maskEntity(gate, role));
  }

  return grouped;
}

/**
 * Get quality gate count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and count values.
 */
export function getQualityGateCountByStatus(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const counts = {};

  for (let i = 0; i < gates.length; i++) {
    const status = gates[i].status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}

/**
 * Get quality gates linked to a specific release.
 *
 * @param {string} releaseId - The release ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked quality gates linked to the release.
 */
export function getQualityGatesForRelease(releaseId, role = ROLES.VIEWER) {
  if (!releaseId || typeof releaseId !== 'string') {
    return [];
  }

  const gates = getAll(QUALITY_GATE_ENTITY_TYPE);

  const filtered = gates.filter(
    (gate) =>
      Array.isArray(gate.linkedReleases) && gate.linkedReleases.includes(releaseId),
  );

  return filtered.map((gate) => maskEntity(gate, role));
}

/**
 * Get quality gates applicable to a specific application.
 *
 * @param {string} application - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked quality gates applicable to the application.
 */
export function getQualityGatesForApplication(application, role = ROLES.VIEWER) {
  if (!application || typeof application !== 'string') {
    return [];
  }

  const gates = getAll(QUALITY_GATE_ENTITY_TYPE);

  const filtered = gates.filter((gate) => {
    if (!gate.applicabilityRules) {
      return true;
    }
    const excluded = gate.applicabilityRules.excludedApplications;
    if (Array.isArray(excluded) && excluded.includes(application)) {
      return false;
    }
    const apps = gate.applicabilityRules.applications;
    if (Array.isArray(apps) && apps.length > 0) {
      return apps.includes(application);
    }
    return true;
  });

  return filtered.map((gate) => maskEntity(gate, role));
}

/**
 * Get all quality gates with pending waivers.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked quality gates with pending waivers.
 */
export function getQualityGatesWithPendingWaivers(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const filtered = gates.filter(
    (gate) =>
      Array.isArray(gate.waiverHistory) &&
      gate.waiverHistory.some((waiver) => waiver.status === 'pending'),
  );

  return filtered.map((gate) => maskEntity(gate, role));
}

/**
 * Get all mandatory quality gates.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked mandatory quality gate objects.
 */
export function getMandatoryQualityGates(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const filtered = gates.filter(
    (gate) => gate.applicabilityRules && gate.applicabilityRules.mandatory === true,
  );

  return filtered.map((gate) => maskEntity(gate, role));
}

/**
 * Calculate the overall quality gate compliance rate.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} The compliance rate percentage (0-100), or 0 if no gates exist.
 */
export function getOverallComplianceRate(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  if (gates.length === 0) {
    return 0;
  }

  const passed = gates.filter(
    (gate) => gate.status === 'passed' || gate.status === 'waived',
  ).length;

  return Math.round((passed / gates.length) * 10000) / 100;
}

/**
 * Calculate the weighted quality gate score.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} The weighted score (0-100), or 0 if no gates exist.
 */
export function getWeightedQualityGateScore(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  if (gates.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];
    const weight = typeof gate.weight === 'number' ? gate.weight : 0;
    totalWeight += weight;

    if (gate.status === 'passed' || gate.status === 'waived') {
      weightedSum += 100 * weight;
    } else if (gate.status === 'in_review') {
      const threshold = gate.threshold || 100;
      const currentValue = gate.currentValue || 0;
      let score;
      if (gate.unit === 'critical_issues' || gate.unit === 'critical_vulnerabilities') {
        score = currentValue <= threshold ? 100 : Math.max(0, 100 - ((currentValue - threshold) * 20));
      } else {
        score = threshold > 0 ? Math.min((currentValue / threshold) * 100, 100) : 0;
      }
      weightedSum += score * weight;
    } else if (gate.status === 'failed') {
      const threshold = gate.threshold || 100;
      const currentValue = gate.currentValue || 0;
      let score;
      if (gate.unit === 'critical_issues' || gate.unit === 'critical_vulnerabilities') {
        score = currentValue <= threshold ? 100 : Math.max(0, 100 - ((currentValue - threshold) * 20));
      } else {
        score = threshold > 0 ? Math.min((currentValue / threshold) * 100, 100) : 0;
      }
      weightedSum += score * weight;
    }
  }

  if (totalWeight <= 0) {
    return 0;
  }

  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/**
 * Get the total number of pending waivers across all accessible quality gates.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total count of pending waivers.
 */
export function getTotalPendingWaivers(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  let count = 0;
  for (let i = 0; i < gates.length; i++) {
    if (Array.isArray(gates[i].waiverHistory)) {
      for (let j = 0; j < gates[i].waiverHistory.length; j++) {
        if (gates[i].waiverHistory[j].status === 'pending') {
          count += 1;
        }
      }
    }
  }

  return count;
}

/**
 * Get quality gate summary for a specific release.
 *
 * @param {string} releaseId - The release ID to get summary for.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Summary object with counts by status.
 */
export function getQualityGateSummaryForRelease(releaseId, role = ROLES.VIEWER) {
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    in_review: 0,
    not_started: 0,
    waived: 0,
    blocked: 0,
  };

  if (!releaseId || typeof releaseId !== 'string') {
    return summary;
  }

  const releaseGates = getQualityGatesForRelease(releaseId, role);
  summary.total = releaseGates.length;

  for (let i = 0; i < releaseGates.length; i++) {
    const status = releaseGates[i].status;
    if (summary[status] !== undefined) {
      summary[status] += 1;
    }
  }

  return summary;
}

/**
 * Get a comprehensive summary of quality gate metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Summary object with quality gate metrics.
 */
export function getQualityGateSummary(role = ROLES.VIEWER, userSegment) {
  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const total = gates.length;
  let passed = 0;
  let failed = 0;
  let inReview = 0;
  let notStarted = 0;
  let waived = 0;
  let blocked = 0;
  let mandatory = 0;
  let pendingWaivers = 0;
  let totalWeight = 0;

  for (let i = 0; i < gates.length; i++) {
    const gate = gates[i];

    if (gate.status === 'passed') passed += 1;
    else if (gate.status === 'failed') failed += 1;
    else if (gate.status === 'in_review') inReview += 1;
    else if (gate.status === 'not_started') notStarted += 1;
    else if (gate.status === 'waived') waived += 1;
    else if (gate.status === 'blocked') blocked += 1;

    if (gate.applicabilityRules && gate.applicabilityRules.mandatory === true) {
      mandatory += 1;
    }

    totalWeight += typeof gate.weight === 'number' ? gate.weight : 0;

    if (Array.isArray(gate.waiverHistory)) {
      for (let j = 0; j < gate.waiverHistory.length; j++) {
        if (gate.waiverHistory[j].status === 'pending') {
          pendingWaivers += 1;
        }
      }
    }
  }

  const complianceRate = total > 0
    ? Math.round(((passed + waived) / total) * 10000) / 100
    : 0;

  return {
    total,
    passed,
    failed,
    inReview,
    notStarted,
    waived,
    blocked,
    mandatory,
    pendingWaivers,
    totalWeight: Math.round(totalWeight * 100) / 100,
    complianceRate,
  };
}

/**
 * Get distinct values for a specific field across all accessible quality gates.
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

  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const values = new Set();

  for (let i = 0; i < gates.length; i++) {
    const value = gates[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Search quality gates by name or key (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of matching masked quality gates.
 */
export function searchQualityGates(query, role = ROLES.VIEWER, userSegment) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  let gates = getAll(QUALITY_GATE_ENTITY_TYPE);
  gates = applyScopeByRole(gates, role, userSegment);

  const results = searchByText(gates, query, ['name', 'key', 'category', 'phase', 'status', 'description']);

  return results.map((gate) => maskEntity(gate, role));
}

/**
 * Simulate an API GET request for quality gates.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetQualityGates(params = {}, role = ROLES.VIEWER) {
  const response = apiGetAll(QUALITY_GATE_ENTITY_TYPE, params);

  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map((gate) => maskEntity(gate, role));
  }

  return response;
}

/**
 * Simulate an API GET request for a single quality gate.
 *
 * @param {string} id - The quality gate ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetQualityGate(id, role = ROLES.VIEWER) {
  const response = apiGetById(QUALITY_GATE_ENTITY_TYPE, id);

  if (response.data) {
    response.data = maskEntity(response.data, role);
  }

  return response;
}

/**
 * Simulate an API POST request to create a quality gate.
 *
 * @param {object} data - The quality gate data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateQualityGate(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    return {
      status: 403,
      error: 'You do not have permission to create quality gates.',
      data: null,
    };
  }

  const created = createQualityGate(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create quality gate.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update a quality gate.
 *
 * @param {string} id - The quality gate ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateQualityGate(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to update quality gates.',
      data: null,
    };
  }

  const updated = updateQualityGate(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Quality gate with id '${id}' not found.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete a quality gate.
 *
 * @param {string} id - The quality gate ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteQualityGate(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete quality gates.',
    };
  }

  const deleted = deleteQualityGate(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Quality gate with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Quality gate '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API POST request to request a waiver.
 *
 * @param {string} gateId - The quality gate ID.
 * @param {object} waiverData - The waiver request data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiRequestWaiver(gateId, waiverData, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'request_waiver')) {
    return {
      status: 403,
      error: 'You do not have permission to request waivers.',
      data: null,
    };
  }

  const result = requestWaiver(gateId, waiverData, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to request waiver. Check gate ID and waiver data.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to resolve (approve/reject) a waiver.
 *
 * @param {string} gateId - The quality gate ID.
 * @param {string} waiverId - The waiver entry ID.
 * @param {string} decision - The decision: 'approved' or 'rejected'.
 * @param {string} [comments=''] - Optional comments.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiResolveWaiver(gateId, waiverId, decision, comments = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve_waiver')) {
    return {
      status: 403,
      error: 'You do not have permission to approve or reject waivers.',
      data: null,
    };
  }

  const result = resolveWaiver(gateId, waiverId, decision, comments, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to resolve waiver. Check gate ID, waiver ID, and decision.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}