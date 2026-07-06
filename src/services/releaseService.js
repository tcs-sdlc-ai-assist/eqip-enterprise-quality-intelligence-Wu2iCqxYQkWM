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
 * @module releaseService
 * ReleaseManager service for eQIP Quality Intelligence.
 * Provides CRUD operations for releases with PII masking, role-based scoping,
 * and audit logging. Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for releases.
 * @type {string}
 */
const RELEASE_ENTITY_TYPE = ENTITY_TYPES.RELEASES;

/**
 * Roles that can view all releases across all segments.
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
 * Roles that can create releases.
 * @type {Set<string>}
 */
const CREATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can update releases.
 * @type {Set<string>}
 */
const UPDATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can delete releases.
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
 * Apply role-based scoping to releases.
 * Admin, Program Manager, QA Lead, Release Manager, and Viewer can see all releases.
 * Other roles see only releases in their segment.
 *
 * @param {Array<object>} releases - The releases to scope.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} The scoped releases.
 */
function applyScopeByRole(releases, role, userSegment) {
  if (!Array.isArray(releases)) {
    return [];
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return releases;
  }

  if (!userSegment) {
    return releases;
  }

  return releases.filter((release) => release.segment === userSegment);
}

/**
 * Calculate a quality score for a release based on its quality gate statuses.
 * @param {object} release - The release object.
 * @returns {number} The calculated quality score (0-100).
 */
function calculateQualityScore(release) {
  if (!release || !release.qualityGateStatus || typeof release.qualityGateStatus !== 'object') {
    return release && typeof release.quality_score === 'number' ? release.quality_score : 0;
  }

  const gates = release.qualityGateStatus;
  const gateKeys = Object.keys(gates);

  if (gateKeys.length === 0) {
    return 0;
  }

  let passed = 0;
  let total = 0;

  for (let i = 0; i < gateKeys.length; i++) {
    const status = gates[gateKeys[i]];
    total += 1;
    if (status === 'passed' || status === 'waived') {
      passed += 1;
    }
  }

  if (total === 0) {
    return 0;
  }

  return Math.round((passed / total) * 100);
}

/**
 * Generate recommendations for a release based on its current state.
 * @param {object} release - The release object.
 * @returns {string[]} Array of recommendation strings.
 */
function generateRecommendations(release) {
  const recommendations = [];

  if (!release) {
    return recommendations;
  }

  if (release.qualityGateStatus && typeof release.qualityGateStatus === 'object') {
    const gates = release.qualityGateStatus;
    const gateKeys = Object.keys(gates);
    const failedGates = [];

    for (let i = 0; i < gateKeys.length; i++) {
      if (gates[gateKeys[i]] === 'failed') {
        failedGates.push(gateKeys[i]);
      }
    }

    if (failedGates.length > 0) {
      recommendations.push(`Address ${failedGates.length} failing quality gate(s): ${failedGates.join(', ')}.`);
    }
  }

  if (release.defects && typeof release.defects === 'object') {
    if (typeof release.defects.critical === 'number' && release.defects.critical > 0) {
      recommendations.push(`Resolve ${release.defects.critical} critical defect(s) before release.`);
    }
    if (typeof release.defects.open === 'number' && release.defects.open > 5) {
      recommendations.push(`Review and address ${release.defects.open} open defects.`);
    }
  }

  if (release.testResults && typeof release.testResults === 'object') {
    if (typeof release.testResults.automationCoverage === 'number' && release.testResults.automationCoverage < 80) {
      recommendations.push(`Increase automation coverage from ${release.testResults.automationCoverage}% to meet 80% target.`);
    }
    if (typeof release.testResults.passRate === 'number' && release.testResults.passRate < 95) {
      recommendations.push(`Improve test pass rate from ${release.testResults.passRate}% to meet 95% threshold.`);
    }
  }

  if (release.codeCoverage && typeof release.codeCoverage === 'object') {
    if (typeof release.codeCoverage.overall === 'number' && release.codeCoverage.overall < 80) {
      recommendations.push(`Increase code coverage from ${release.codeCoverage.overall}% to meet 80% target.`);
    }
  }

  if (release.pipelineStatus && typeof release.pipelineStatus === 'object') {
    if (release.pipelineStatus.deployment === 'blocked') {
      recommendations.push('Unblock deployment pipeline before proceeding.');
    }
  }

  return recommendations;
}

/**
 * Get all releases with optional filtering, searching, sorting, and pagination.
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { status: 'Ready', segment: 'Claims' }).
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
export function getReleases(options = {}) {
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

  let releases = getAll(RELEASE_ENTITY_TYPE);

  releases = applyScopeByRole(releases, role, options.userSegment);

  const result = processData(releases, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'application', 'segment', 'status', 'version'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((release) => maskEntity(release, role));

  return result;
}

/**
 * Get all releases without pagination (simple list).
 * Applies role-based scoping and PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked release objects.
 */
export function getReleasesList(filters = {}, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let releases = getAll(RELEASE_ENTITY_TYPE);

  releases = applyScopeByRole(releases, role, userSegment);

  if (filters && Object.keys(filters).length > 0) {
    releases = applyFilters(releases, filters);
  }

  return releases.map((release) => maskEntity(release, role));
}

/**
 * Get a single release by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The release ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked release object, or null if not found.
 */
export function getReleaseDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const release = getById(RELEASE_ENTITY_TYPE, id);

  if (!release) {
    return null;
  }

  return maskEntity(release, role);
}

/**
 * Get a single release by ID (alias for getReleaseDetail).
 *
 * @param {string} id - The release ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked release object, or null if not found.
 */
export function getReleaseById(id, role = ROLES.VIEWER) {
  return getReleaseDetail(id, role);
}

/**
 * Create a new release.
 * Validates role permissions, generates quality score and recommendations,
 * applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The release data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked release, or null if unauthorized.
 */
export function createRelease(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    console.warn('[ReleaseService] User does not have permission to create releases.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[ReleaseService] Invalid release data for create.');
    return null;
  }

  const now = new Date().toISOString();

  const releaseData = {
    ...data,
    id: data.id || uuidv4(),
    status: data.status || 'Draft',
    readinessScore: data.readinessScore || 0,
    quality_score: data.quality_score || 0,
    recommendations: data.recommendations || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  if (releaseData.qualityGateStatus) {
    releaseData.quality_score = calculateQualityScore(releaseData);
    releaseData.readinessScore = releaseData.readinessScore || releaseData.quality_score;
  }

  if (releaseData.recommendations.length === 0) {
    releaseData.recommendations = generateRecommendations(releaseData);
  }

  const created = create(RELEASE_ENTITY_TYPE, releaseData, userId);

  if (!created) {
    console.warn('[ReleaseService] Failed to create release.');
    return null;
  }

  logAction(userId, 'Create Release', RELEASE_ENTITY_TYPE, created.id, `Created release: ${created.name || created.id}`);

  return maskEntity(created, role);
}

/**
 * Update an existing release by ID.
 * Validates role permissions, recalculates quality score and recommendations,
 * applies audit logging, and returns the masked entity.
 *
 * @param {string} id - The release ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked release, or null if unauthorized or not found.
 */
export function updateRelease(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    console.warn('[ReleaseService] User does not have permission to update releases.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReleaseService] Invalid release ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[ReleaseService] Invalid update data.');
    return null;
  }

  const existing = getById(RELEASE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReleaseService] Release not found: ${id}`);
    return null;
  }

  const updates = { ...data };

  if (updates.qualityGateStatus) {
    const merged = { ...existing, ...updates };
    updates.quality_score = calculateQualityScore(merged);
    updates.readinessScore = updates.readinessScore || updates.quality_score;
  }

  const updated = update(RELEASE_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[ReleaseService] Failed to update release: ${id}`);
    return null;
  }

  if (updated.recommendations === undefined || (Array.isArray(updated.recommendations) && updated.recommendations.length === 0)) {
    const newRecommendations = generateRecommendations(updated);
    if (newRecommendations.length > 0) {
      update(RELEASE_ENTITY_TYPE, id, { recommendations: newRecommendations }, userId);
      updated.recommendations = newRecommendations;
    }
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Release', RELEASE_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete a release by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The release ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the release was deleted, false otherwise.
 */
export function deleteRelease(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[ReleaseService] User does not have permission to delete releases.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReleaseService] Invalid release ID for delete.');
    return false;
  }

  const existing = getById(RELEASE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReleaseService] Release not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(RELEASE_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Release', RELEASE_ENTITY_TYPE, id, `Deleted release: ${existing.name || id}`);
  }

  return deleted;
}

/**
 * Get releases grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and arrays of masked releases.
 */
export function getReleasesByStatus(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const grouped = {};

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    const status = release.status || 'Unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(release, role));
  }

  return grouped;
}

/**
 * Get releases grouped by segment.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with segment keys and arrays of masked releases.
 */
export function getReleasesBySegment(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const grouped = {};

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];
    const segment = release.segment || 'Unknown';

    if (!grouped[segment]) {
      grouped[segment] = [];
    }

    grouped[segment].push(maskEntity(release, role));
  }

  return grouped;
}

/**
 * Get release count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and count values.
 */
export function getReleaseCountByStatus(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const counts = {};

  for (let i = 0; i < releases.length; i++) {
    const status = releases[i].status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
  }

  return counts;
}

/**
 * Get at-risk releases sorted by readiness score ascending.
 *
 * @param {number} [limit] - Maximum number of releases to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked at-risk releases.
 */
export function getAtRiskReleases(limit, role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const sorted = [...releases].sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0));

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((release) => maskEntity(release, role));
}

/**
 * Get releases sorted by readiness score descending (most ready first).
 *
 * @param {number} [limit] - Maximum number of releases to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked releases sorted by readiness.
 */
export function getReadyReleases(limit, role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const sorted = [...releases].sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));

  const result = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  return result.map((release) => maskEntity(release, role));
}

/**
 * Get releases for a specific application.
 *
 * @param {string} application - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked releases for the application.
 */
export function getReleasesForApplication(application, role = ROLES.VIEWER) {
  if (!application || typeof application !== 'string') {
    return [];
  }

  const releases = getAll(RELEASE_ENTITY_TYPE);
  const filtered = releases.filter((release) => release.application === application);

  return filtered.map((release) => maskEntity(release, role));
}

/**
 * Get the average readiness score across all accessible releases.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} The average readiness score, or 0 if no releases exist.
 */
export function getAverageReadinessScore(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  if (releases.length === 0) {
    return 0;
  }

  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    total += releases[i].readinessScore || 0;
  }

  return Math.round((total / releases.length) * 100) / 100;
}

/**
 * Get the average quality score across all accessible releases.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} The average quality score, or 0 if no releases exist.
 */
export function getAverageQualityScore(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  if (releases.length === 0) {
    return 0;
  }

  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    total += releases[i].quality_score || 0;
  }

  return Math.round((total / releases.length) * 100) / 100;
}

/**
 * Get releases with pending waivers.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked releases with pending waivers.
 */
export function getReleasesWithPendingWaivers(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const filtered = releases.filter(
    (release) =>
      Array.isArray(release.waivers) &&
      release.waivers.some((waiver) => waiver.status === 'pending'),
  );

  return filtered.map((release) => maskEntity(release, role));
}

/**
 * Get releases with pending approvals.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked releases with pending approvals.
 */
export function getReleasesWithPendingApprovals(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const filtered = releases.filter(
    (release) =>
      Array.isArray(release.approvals) &&
      release.approvals.some((approval) => approval.status === 'pending'),
  );

  return filtered.map((release) => maskEntity(release, role));
}

/**
 * Get the total count of open defects across all accessible releases.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total open defects.
 */
export function getTotalOpenDefects(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].defects && typeof releases[i].defects.open === 'number') {
      total += releases[i].defects.open;
    }
  }

  return total;
}

/**
 * Get the total count of critical defects across all accessible releases.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {number} Total critical defects.
 */
export function getTotalCriticalDefects(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].defects && typeof releases[i].defects.critical === 'number') {
      total += releases[i].defects.critical;
    }
  }

  return total;
}

/**
 * Get a summary of release metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Summary object with release metrics.
 */
export function getReleaseSummary(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const total = releases.length;
  let ready = 0;
  let inProgress = 0;
  let inReview = 0;
  let atRisk = 0;
  let draft = 0;
  let totalReadiness = 0;
  let totalQuality = 0;
  let totalOpenDefects = 0;
  let totalCriticalDefects = 0;
  let pendingWaivers = 0;
  let pendingApprovals = 0;

  for (let i = 0; i < releases.length; i++) {
    const release = releases[i];

    totalReadiness += release.readinessScore || 0;
    totalQuality += release.quality_score || 0;

    if (release.status === 'Ready') ready += 1;
    else if (release.status === 'In Progress') inProgress += 1;
    else if (release.status === 'In Review') inReview += 1;
    else if (release.status === 'At Risk') atRisk += 1;
    else if (release.status === 'Draft') draft += 1;

    if (release.defects) {
      totalOpenDefects += release.defects.open || 0;
      totalCriticalDefects += release.defects.critical || 0;
    }

    if (Array.isArray(release.waivers)) {
      for (let j = 0; j < release.waivers.length; j++) {
        if (release.waivers[j].status === 'pending') {
          pendingWaivers += 1;
        }
      }
    }

    if (Array.isArray(release.approvals)) {
      for (let j = 0; j < release.approvals.length; j++) {
        if (release.approvals[j].status === 'pending') {
          pendingApprovals += 1;
        }
      }
    }
  }

  return {
    total,
    ready,
    inProgress,
    inReview,
    atRisk,
    draft,
    averageReadinessScore: total > 0 ? Math.round((totalReadiness / total) * 100) / 100 : 0,
    averageQualityScore: total > 0 ? Math.round((totalQuality / total) * 100) / 100 : 0,
    totalOpenDefects,
    totalCriticalDefects,
    pendingWaivers,
    pendingApprovals,
  };
}

/**
 * Get quality gate summary across all accessible releases.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with gate status counts.
 */
export function getQualityGateSummary(role = ROLES.VIEWER, userSegment) {
  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const summary = {
    passed: 0,
    failed: 0,
    in_review: 0,
    not_started: 0,
    waived: 0,
    blocked: 0,
  };

  for (let i = 0; i < releases.length; i++) {
    const gates = releases[i].qualityGateStatus;
    if (gates && typeof gates === 'object') {
      const gateKeys = Object.keys(gates);
      for (let j = 0; j < gateKeys.length; j++) {
        const status = gates[gateKeys[j]];
        if (summary[status] !== undefined) {
          summary[status] += 1;
        }
      }
    }
  }

  return summary;
}

/**
 * Get distinct values for a specific field across all accessible releases.
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

  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const values = new Set();

  for (let i = 0; i < releases.length; i++) {
    const value = releases[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Search releases by name (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of matching masked releases.
 */
export function searchReleases(query, role = ROLES.VIEWER, userSegment) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  let releases = getAll(RELEASE_ENTITY_TYPE);
  releases = applyScopeByRole(releases, role, userSegment);

  const results = searchByText(releases, query, ['name', 'application', 'segment', 'status', 'version']);

  return results.map((release) => maskEntity(release, role));
}

/**
 * Simulate an API GET request for releases.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetReleases(params = {}, role = ROLES.VIEWER) {
  const response = apiGetAll(RELEASE_ENTITY_TYPE, params);

  if (response.data && Array.isArray(response.data)) {
    response.data = response.data.map((release) => maskEntity(release, role));
  }

  return response;
}

/**
 * Simulate an API GET request for a single release.
 *
 * @param {string} id - The release ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetRelease(id, role = ROLES.VIEWER) {
  const response = apiGetById(RELEASE_ENTITY_TYPE, id);

  if (response.data) {
    response.data = maskEntity(response.data, role);
  }

  return response;
}

/**
 * Simulate an API POST request to create a release.
 *
 * @param {object} data - The release data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateRelease(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'create')) {
    return {
      status: 403,
      error: 'You do not have permission to create releases.',
      data: null,
    };
  }

  const created = createRelease(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create release.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update a release.
 *
 * @param {string} id - The release ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateRelease(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'update')) {
    return {
      status: 403,
      error: 'You do not have permission to update releases.',
      data: null,
    };
  }

  const updated = updateRelease(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Release with id '${id}' not found.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete a release.
 *
 * @param {string} id - The release ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteRelease(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete releases.',
    };
  }

  const deleted = deleteRelease(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Release with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Release '${id}' deleted successfully.`,
  };
}