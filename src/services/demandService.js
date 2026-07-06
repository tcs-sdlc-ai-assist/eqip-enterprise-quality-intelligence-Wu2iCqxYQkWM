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
import { ROLES, DEMAND_TYPES } from '../constants.js';

/**
 * @module demandService
 * DemandManagement service for eQIP Quality Intelligence.
 * Provides CRUD operations for demands with PII masking, role-based scoping,
 * and audit logging. Supports all 10 demand types with full lifecycle
 * (intake, prioritization, approval, assignment, tracking, closure).
 * Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for demands.
 * @type {string}
 */
const DEMAND_ENTITY_TYPE = ENTITY_TYPES.DEMANDS;

/**
 * Roles that can view all demands across all segments.
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
 * Roles that can create demands.
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
  ROLES.SCRUM_MASTER,
]);

/**
 * Roles that can update demands.
 * @type {Set<string>}
 */
const UPDATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.SCRUM_MASTER,
]);

/**
 * Roles that can delete demands.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
]);

/**
 * Roles that can approve demands.
 * @type {Set<string>}
 */
const APPROVE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
]);

/**
 * Valid workflow state transitions.
 * @type {Readonly<object>}
 */
const WORKFLOW_TRANSITIONS = Object.freeze({
  intake: ['planning', 'closed'],
  planning: ['development', 'on_hold', 'closed'],
  development: ['testing', 'on_hold', 'closed'],
  testing: ['review', 'development', 'on_hold', 'closed'],
  review: ['closed', 'development'],
  in_progress: ['planning', 'development', 'testing', 'review', 'on_hold', 'closed'],
  on_hold: ['planning', 'development', 'testing', 'closed'],
  closed: [],
});

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'create', 'update', 'delete', 'approve').
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
    case 'approve':
      return APPROVE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Apply role-based scoping to demands.
 * Admin, Program Manager, QA Lead, Release Manager, and Viewer can see all demands.
 * Other roles see only demands in their segment.
 *
 * @param {Array<object>} demands - The demands to scope.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} The scoped demands.
 */
function applyScopeByRole(demands, role, userSegment) {
  if (!Array.isArray(demands)) {
    return [];
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return demands;
  }

  if (!userSegment) {
    return demands;
  }

  return demands.filter((demand) => demand.segment === userSegment);
}

/**
 * Validate that a demand type is one of the 10 PRD-specified types.
 * @param {string} type - The demand type to validate.
 * @returns {boolean} True if the type is valid.
 */
function isValidDemandType(type) {
  if (!type || typeof type !== 'string') {
    return false;
  }
  return DEMAND_TYPES.includes(type);
}

/**
 * Validate a workflow state transition.
 * @param {string} currentState - The current workflow state.
 * @param {string} newState - The proposed new workflow state.
 * @returns {boolean} True if the transition is valid.
 */
function isValidWorkflowTransition(currentState, newState) {
  if (!currentState || !newState) {
    return true;
  }
  const allowed = WORKFLOW_TRANSITIONS[currentState];
  if (!allowed) {
    return true;
  }
  return allowed.includes(newState);
}

/**
 * Get all demands with optional filtering, searching, sorting, and pagination.
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { status: 'active', type: 'Feature', segment: 'Claims' }).
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
export function getDemands(options = {}) {
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

  let demands = getAll(DEMAND_ENTITY_TYPE);

  demands = applyScopeByRole(demands, role, options.userSegment);

  const result = processData(demands, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['title', 'type', 'status', 'priority', 'severity', 'segment', 'application', 'workflowState', 'approvalStatus'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((demand) => maskEntity(demand, role));

  return result;
}

/**
 * Get all demands without pagination (simple list).
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked demand objects.
 */
export function getDemandsList(filters = {}, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let demands = getAll(DEMAND_ENTITY_TYPE);

  demands = applyScopeByRole(demands, role, userSegment);

  if (filters && Object.keys(filters).length > 0) {
    demands = applyFilters(demands, filters);
  }

  return demands.map((demand) => maskEntity(demand, role));
}

/**
 * Get a single demand by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The demand ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked demand object, or null if not found.
 */
export function getDemandDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const demand = getById(DEMAND_ENTITY_TYPE, id);

  if (!demand) {
    return null;
  }

  return maskEntity(demand, role);
}

/**
 * Get a single demand by ID (alias for getDemandDetail).
 *
 * @param {string} id - The demand ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked demand object, or null if not found.
 */
export function getDemandById(id, role = ROLES.VIEWER) {
  return getDemandDetail(id, role);
}

/**
 * Create a new demand.
 * Validates role permissions, demand type, applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The demand data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked demand, or null if unauthorized.
 */
export function createDemand(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[DemandService] User does not have permission to create demands.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[DemandService] Invalid demand data for create.');
    return null;
  }

  if (data.type && !isValidDemandType(data.type)) {
    console.warn(`[DemandService] Invalid demand type: ${data.type}. Must be one of: ${DEMAND_TYPES.join(', ')}`);
    return null;
  }

  const now = new Date().toISOString();

  const demandData = {
    ...data,
    id: data.id || `dem-${uuidv4().slice(0, 8)}`,
    type: data.type || 'Feature',
    priority: data.priority || 'p3',
    severity: data.severity || 'medium',
    status: data.status || 'draft',
    approvalStatus: data.approvalStatus || 'pending',
    workflowState: data.workflowState || 'intake',
    requestedBy: data.requestedBy || userId,
    assignedTo: data.assignedTo || null,
    estimatedEffort: data.estimatedEffort || 0,
    actualEffort: data.actualEffort || 0,
    targetRelease: data.targetRelease || null,
    acceptanceCriteria: data.acceptanceCriteria || [],
    dependencies: data.dependencies || [],
    comments: data.comments || [],
    attachments: data.attachments || [],
    tags: data.tags || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  const created = create(DEMAND_ENTITY_TYPE, demandData, userId);

  if (!created) {
    console.warn('[DemandService] Failed to create demand.');
    return null;
  }

  logAction(userId, 'Create Demand', DEMAND_ENTITY_TYPE, created.id, `Created demand: ${created.title || created.id} (Type: ${created.type})`);

  return maskEntity(created, role);
}

/**
 * Update an existing demand by ID.
 * Validates role permissions, workflow transitions, applies audit logging,
 * and returns the masked entity.
 *
 * @param {string} id - The demand ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized or not found.
 */
export function updateDemand(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[DemandService] User does not have permission to update demands.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[DemandService] Invalid update data.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  if (data.type && !isValidDemandType(data.type)) {
    console.warn(`[DemandService] Invalid demand type: ${data.type}. Must be one of: ${DEMAND_TYPES.join(', ')}`);
    return null;
  }

  if (data.workflowState && existing.workflowState) {
    if (!isValidWorkflowTransition(existing.workflowState, data.workflowState)) {
      console.warn(`[DemandService] Invalid workflow transition from "${existing.workflowState}" to "${data.workflowState}" for demand ${id}.`);
      return null;
    }
  }

  const updates = { ...data };

  // Auto-update status based on workflow state changes
  if (updates.workflowState === 'closed' && !updates.status) {
    updates.status = 'completed';
  } else if (updates.workflowState === 'on_hold' && !updates.status) {
    updates.status = 'on_hold';
  } else if (updates.workflowState === 'development' && !updates.status) {
    updates.status = 'in_progress';
  } else if (updates.workflowState === 'planning' && !updates.status && existing.status === 'draft') {
    updates.status = 'active';
  }

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to update demand: ${id}`);
    return null;
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Demand', DEMAND_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete a demand by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The demand ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the demand was deleted, false otherwise.
 */
export function deleteDemand(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[DemandService] User does not have permission to delete demands.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for delete.');
    return false;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(DEMAND_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Demand', DEMAND_ENTITY_TYPE, id, `Deleted demand: ${existing.title || id}`);
  }

  return deleted;
}

/**
 * Approve a demand.
 * Validates role permissions, updates approval status, and applies audit logging.
 *
 * @param {string} id - The demand ID to approve.
 * @param {string} [comments=''] - Optional approval comments.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized or not found.
 */
export function approveDemand(id, comments = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve')) {
    console.warn('[DemandService] User does not have permission to approve demands.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for approval.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  const now = new Date().toISOString();

  const updates = {
    approvalStatus: 'approved',
    updated_at: now,
    updated_by: userId,
  };

  if (existing.status === 'draft') {
    updates.status = 'active';
  }

  if (comments) {
    const existingComments = Array.isArray(existing.comments) ? [...existing.comments] : [];
    existingComments.push({
      id: `cmt-${uuidv4().slice(0, 8)}`,
      userId,
      text: `Approved: ${comments}`,
      createdAt: now,
    });
    updates.comments = existingComments;
  }

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to approve demand: ${id}`);
    return null;
  }

  logAction(userId, 'Approve Demand', DEMAND_ENTITY_TYPE, id, `Approved demand: ${existing.title || id}. ${comments ? 'Comment: ' + comments : ''}`);

  return maskEntity(updated, role);
}

/**
 * Reject a demand.
 * Validates role permissions, updates approval status, and applies audit logging.
 *
 * @param {string} id - The demand ID to reject.
 * @param {string} [reason=''] - Reason for rejection.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized or not found.
 */
export function rejectDemand(id, reason = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve')) {
    console.warn('[DemandService] User does not have permission to reject demands.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for rejection.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  const now = new Date().toISOString();

  const updates = {
    approvalStatus: 'rejected',
    updated_at: now,
    updated_by: userId,
  };

  if (reason) {
    const existingComments = Array.isArray(existing.comments) ? [...existing.comments] : [];
    existingComments.push({
      id: `cmt-${uuidv4().slice(0, 8)}`,
      userId,
      text: `Rejected: ${reason}`,
      createdAt: now,
    });
    updates.comments = existingComments;
  }

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to reject demand: ${id}`);
    return null;
  }

  logAction(userId, 'Reject Demand', DEMAND_ENTITY_TYPE, id, `Rejected demand: ${existing.title || id}. ${reason ? 'Reason: ' + reason : ''}`);

  return maskEntity(updated, role);
}

/**
 * Assign a demand to a user.
 * Validates role permissions, updates assignment, and applies audit logging.
 *
 * @param {string} id - The demand ID to assign.
 * @param {string} assigneeId - The user ID to assign the demand to.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized or not found.
 */
export function assignDemand(id, assigneeId, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[DemandService] User does not have permission to assign demands.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for assignment.');
    return null;
  }

  if (!assigneeId || typeof assigneeId !== 'string') {
    console.warn('[DemandService] Invalid assignee ID.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  const now = new Date().toISOString();

  const updates = {
    assignedTo: assigneeId,
    updated_at: now,
    updated_by: userId,
  };

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to assign demand: ${id}`);
    return null;
  }

  logAction(userId, 'Assign Demand', DEMAND_ENTITY_TYPE, id, `Assigned demand "${existing.title || id}" to ${assigneeId}`);

  return maskEntity(updated, role);
}

/**
 * Transition a demand's workflow state.
 * Validates role permissions, workflow transition, and applies audit logging.
 *
 * @param {string} id - The demand ID.
 * @param {string} newState - The new workflow state.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized, not found, or invalid transition.
 */
export function transitionDemandWorkflow(id, newState, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[DemandService] User does not have permission to transition demand workflow.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for workflow transition.');
    return null;
  }

  if (!newState || typeof newState !== 'string') {
    console.warn('[DemandService] Invalid workflow state.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  if (!isValidWorkflowTransition(existing.workflowState, newState)) {
    console.warn(`[DemandService] Invalid workflow transition from "${existing.workflowState}" to "${newState}" for demand ${id}.`);
    return null;
  }

  const previousState = existing.workflowState;

  const updates = {
    workflowState: newState,
  };

  // Auto-update status based on workflow state
  if (newState === 'closed') {
    updates.status = 'completed';
  } else if (newState === 'on_hold') {
    updates.status = 'on_hold';
  } else if (newState === 'development' || newState === 'testing' || newState === 'review') {
    updates.status = 'in_progress';
  } else if (newState === 'planning' && existing.status === 'draft') {
    updates.status = 'active';
  }

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to transition demand workflow: ${id}`);
    return null;
  }

  logAction(userId, 'Demand Workflow Transition', DEMAND_ENTITY_TYPE, id, `Transitioned demand "${existing.title || id}" from "${previousState}" to "${newState}"`);

  return maskEntity(updated, role);
}

/**
 * Add a comment to a demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} text - The comment text.
 * @param {string} [userId='system'] - The user ID adding the comment.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked demand, or null if unauthorized or not found.
 */
export function addDemandComment(id, text, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[DemandService] User does not have permission to comment on demands.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[DemandService] Invalid demand ID for comment.');
    return null;
  }

  if (!text || typeof text !== 'string' || text.trim() === '') {
    console.warn('[DemandService] Comment text is required.');
    return null;
  }

  const existing = getById(DEMAND_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[DemandService] Demand not found: ${id}`);
    return null;
  }

  const now = new Date().toISOString();

  const existingComments = Array.isArray(existing.comments) ? [...existing.comments] : [];
  existingComments.push({
    id: `cmt-${uuidv4().slice(0, 8)}`,
    userId,
    text: text.trim(),
    createdAt: now,
  });

  const updates = {
    comments: existingComments,
  };

  const updated = update(DEMAND_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[DemandService] Failed to add comment to demand: ${id}`);
    return null;
  }

  logAction(userId, 'Add Demand Comment', DEMAND_ENTITY_TYPE, id, `Added comment to demand "${existing.title || id}"`);

  return maskEntity(updated, role);
}

/**
 * Get demands grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with type keys and arrays of masked demands.
 */
export function getDemandsByType(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const grouped = {};

  for (let i = 0; i < demands.length; i++) {
    const demand = demands[i];
    const type = demand.type || 'Unknown';

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(maskEntity(demand, role));
  }

  return grouped;
}

/**
 * Get demands grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and arrays of masked demands.
 */
export function getDemandsByStatus(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const grouped = {};

  for (let i = 0; i < demands.length; i++) {
    const demand = demands[i];
    const status = demand.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(demand, role));
  }

  return grouped;
}

/**
 * Get demands grouped by priority.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with priority keys and arrays of masked demands.
 */
export function getDemandsByPriority(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const grouped = {};

  for (let i = 0; i < demands.length; i++) {
    const demand = demands[i];
    const priority = demand.priority || 'unknown';

    if (!grouped[priority]) {
      grouped[priority] = [];
    }

    grouped[priority].push(maskEntity(demand, role));
  }

  return grouped;
}

/**
 * Get demands grouped by segment.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with segment keys and arrays of masked demands.
 */
export function getDemandsBySegment(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const grouped = {};

  for (let i = 0; i < demands.length; i++) {
    const demand = demands[i];
    const segment = demand.segment || 'Unknown';

    if (!grouped[segment]) {
      grouped[segment] = [];
    }

    grouped[segment].push(maskEntity(demand, role));
  }

  return grouped;
}

/**
 * Get demands grouped by workflow state.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with workflow state keys and arrays of masked demands.
 */
export function getDemandsByWorkflowState(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const grouped = {};

  for (let i = 0; i < demands.length; i++) {
    const demand = demands[i];
    const state = demand.workflowState || 'unknown';

    if (!grouped[state]) {
      grouped[state] = [];
    }

    grouped[state].push(maskEntity(demand, role));
  }

  return grouped;
}

/**
 * Get demand count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and count values.
 */
export function getDemandCountByStatus(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const status = demands[i].status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}

/**
 * Get demand count grouped by type.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with type keys and count values.
 */
export function getDemandCountByType(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const type = demands[i].type || 'Unknown';
    counts[type] = (counts[type] || 0) + 1;
  }

  return counts;
}

/**
 * Get demand count grouped by priority.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with priority keys and count values.
 */
export function getDemandCountByPriority(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const priority = demands[i].priority || 'unknown';
    counts[priority] = (counts[priority] || 0) + 1;
  }

  return counts;
}

/**
 * Get demand count grouped by segment.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with segment keys and count values.
 */
export function getDemandCountBySegment(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const segment = demands[i].segment || 'Unknown';
    counts[segment] = (counts[segment] || 0) + 1;
  }

  return counts;
}

/**
 * Get demand count grouped by workflow state.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with workflow state keys and count values.
 */
export function getDemandCountByWorkflowState(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const state = demands[i].workflowState || 'unknown';
    counts[state] = (counts[state] || 0) + 1;
  }

  return counts;
}

/**
 * Get demand count grouped by approval status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with approval status keys and count values.
 */
export function getDemandCountByApprovalStatus(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const counts = {};

  for (let i = 0; i < demands.length; i++) {
    const approvalStatus = demands[i].approvalStatus || 'unknown';
    counts[approvalStatus] = (counts[approvalStatus] || 0) + 1;
  }

  return counts;
}

/**
 * Get demands sorted by priority (p1 first).
 *
 * @param {number} [limit] - Maximum number of demands to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked demands sorted by priority.
 */
export function getDemandsByPriorityOrder(limit, role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const priorityOrder = { p1: 1, p2: 2, p3: 3, p4: 4 };
  const sorted = [...demands].sort((a, b) => {
    const orderA = priorityOrder[a.priority] || 99;
    const orderB = priorityOrder[b.priority] || 99;
    return orderA - orderB;
  });

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands for a specific application.
 *
 * @param {string} application - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked demands for the application.
 */
export function getDemandsForApplication(application, role = ROLES.VIEWER) {
  if (!application || typeof application !== 'string') {
    return [];
  }

  const demands = getAll(DEMAND_ENTITY_TYPE);
  const filtered = demands.filter((demand) => demand.application === application);

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands for a specific target release.
 *
 * @param {string} releaseId - The release ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked demands targeting the release.
 */
export function getDemandsForRelease(releaseId, role = ROLES.VIEWER) {
  if (!releaseId || typeof releaseId !== 'string') {
    return [];
  }

  const demands = getAll(DEMAND_ENTITY_TYPE);
  const filtered = demands.filter((demand) => demand.targetRelease === releaseId);

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands assigned to a specific user.
 *
 * @param {string} assigneeId - The assignee user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked demands assigned to the user.
 */
export function getDemandsForAssignee(assigneeId, role = ROLES.VIEWER) {
  if (!assigneeId || typeof assigneeId !== 'string') {
    return [];
  }

  const demands = getAll(DEMAND_ENTITY_TYPE);
  const filtered = demands.filter((demand) => demand.assignedTo === assigneeId);

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands requested by a specific user.
 *
 * @param {string} requesterId - The requester user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked demands requested by the user.
 */
export function getDemandsForRequester(requesterId, role = ROLES.VIEWER) {
  if (!requesterId || typeof requesterId !== 'string') {
    return [];
  }

  const demands = getAll(DEMAND_ENTITY_TYPE);
  const filtered = demands.filter((demand) => demand.requestedBy === requesterId);

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get unassigned demands.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked unassigned demands.
 */
export function getUnassignedDemands(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const filtered = demands.filter(
    (demand) => demand.assignedTo === null || demand.assignedTo === undefined || demand.assignedTo === '',
  );

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands pending approval.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked demands pending approval.
 */
export function getDemandsPendingApproval(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const filtered = demands.filter((demand) => demand.approvalStatus === 'pending');

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get demands with dependencies.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked demands with non-empty dependencies.
 */
export function getDemandsWithDependencies(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const filtered = demands.filter(
    (demand) => Array.isArray(demand.dependencies) && demand.dependencies.length > 0,
  );

  return filtered.map((demand) => maskEntity(demand, role));
}

/**
 * Get the total estimated effort across all accessible demands.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total estimated effort in story points.
 */
export function getTotalEstimatedEffort(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  let total = 0;
  for (let i = 0; i < demands.length; i++) {
    total += demands[i].estimatedEffort || 0;
  }

  return total;
}

/**
 * Get the total actual effort across all accessible demands.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total actual effort in story points.
 */
export function getTotalActualEffort(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  let total = 0;
  for (let i = 0; i < demands.length; i++) {
    total += demands[i].actualEffort || 0;
  }

  return total;
}

/**
 * Get a comprehensive summary of demand metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Summary object with demand metrics.
 */
export function getDemandSummary(role = ROLES.VIEWER, userSegment) {
  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const total = demands.length;
  let draft = 0;
  let active = 0;
  let inProgress = 0;
  let completed = 0;
  let onHold = 0;
  let cancelled = 0;
  let totalEstimated = 0;
  let totalActual = 0;
  let pendingApproval = 0;
  let unassigned = 0;

  for (let i = 0; i < demands.length; i++) {
    const dem = demands[i];
    totalEstimated += dem.estimatedEffort || 0;
    totalActual += dem.actualEffort || 0;

    if (dem.status === 'draft') draft += 1;
    else if (dem.status === 'active') active += 1;
    else if (dem.status === 'in_progress') inProgress += 1;
    else if (dem.status === 'completed') completed += 1;
    else if (dem.status === 'on_hold') onHold += 1;
    else if (dem.status === 'cancelled') cancelled += 1;

    if (dem.approvalStatus === 'pending') pendingApproval += 1;
    if (!dem.assignedTo) unassigned += 1;
  }

  return {
    total,
    draft,
    active,
    inProgress,
    completed,
    onHold,
    cancelled,
    totalEstimatedEffort: totalEstimated,
    totalActualEffort: totalActual,
    pendingApproval,
    unassigned,
    completionRate: total > 0 ? Math.round((completed / total) * 10000) / 100 : 0,
  };
}

/**
 * Get distinct values for a specific field across all accessible demands.
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

  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const values = new Set();

  for (let i = 0; i < demands.length; i++) {
    const value = demands[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Search demands by title or description (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of matching masked demands.
 */
export function searchDemands(query, role = ROLES.VIEWER, userSegment) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  let demands = getAll(DEMAND_ENTITY_TYPE);
  demands = applyScopeByRole(demands, role, userSegment);

  const results = searchByText(demands, query, ['title', 'description', 'type', 'status', 'priority', 'segment', 'application']);

  return results.map((demand) => maskEntity(demand, role));
}

/**
 * Simulate an API GET request for demands.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetDemands(params = {}, role = ROLES.VIEWER) {
  const response = apiGetAll(DEMAND_ENTITY_TYPE, params);

  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map((demand) => maskEntity(demand, role));
  }

  return response;
}

/**
 * Simulate an API GET request for a single demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetDemand(id, role = ROLES.VIEWER) {
  const response = apiGetById(DEMAND_ENTITY_TYPE, id);

  if (response.data) {
    response.data = maskEntity(response.data, role);
  }

  return response;
}

/**
 * Simulate an API POST request to create a demand.
 *
 * @param {object} data - The demand data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateDemand(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    return {
      status: 403,
      error: 'You do not have permission to create demands.',
      data: null,
    };
  }

  const created = createDemand(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create demand. Check demand type and required fields.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update a demand.
 *
 * @param {string} id - The demand ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateDemand(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to update demands.',
      data: null,
    };
  }

  const updated = updateDemand(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Demand with id '${id}' not found or update failed.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete a demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteDemand(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete demands.',
    };
  }

  const deleted = deleteDemand(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Demand with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Demand '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API POST request to approve a demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} [comments=''] - Approval comments.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiApproveDemand(id, comments = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve')) {
    return {
      status: 403,
      error: 'You do not have permission to approve demands.',
      data: null,
    };
  }

  const result = approveDemand(id, comments, userId, role);

  if (!result) {
    return {
      status: 404,
      error: `Demand with id '${id}' not found.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to reject a demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} [reason=''] - Rejection reason.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiRejectDemand(id, reason = '', userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'approve')) {
    return {
      status: 403,
      error: 'You do not have permission to reject demands.',
      data: null,
    };
  }

  const result = rejectDemand(id, reason, userId, role);

  if (!result) {
    return {
      status: 404,
      error: `Demand with id '${id}' not found.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to assign a demand.
 *
 * @param {string} id - The demand ID.
 * @param {string} assigneeId - The assignee user ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiAssignDemand(id, assigneeId, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to assign demands.',
      data: null,
    };
  }

  const result = assignDemand(id, assigneeId, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to assign demand. Check demand ID and assignee ID.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API POST request to transition a demand's workflow state.
 *
 * @param {string} id - The demand ID.
 * @param {string} newState - The new workflow state.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiTransitionDemandWorkflow(id, newState, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to transition demand workflow.',
      data: null,
    };
  }

  const result = transitionDemandWorkflow(id, newState, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to transition demand workflow. Check demand ID and workflow state.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}