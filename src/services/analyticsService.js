import {
  getAll,
  getById,
  find,
  count,
  ENTITY_TYPES,
} from '../data/mockDataStore.js';
import { maskEntity } from '../utils/piiMasker.js';
import { logAction } from '../utils/auditLogger.js';
import { applyFilters, searchByText, sortData, paginateData, processData } from '../utils/filterUtils.js';
import { ROLES } from '../constants.js';
import {
  getAllMetrics,
  getMetricByKey,
  getMetricById,
  getMetricsSummary,
  getMetricTrends,
  calculateEnterpriseQualityScore,
  calculateReleaseReadinessScore,
  calculateSingleMetric,
  getWeights,
  setWeights,
  resetWeights,
  recalculateMetrics,
  normalizeMetricScore,
} from '../utils/metricsEngine.js';
import {
  getDashboardSummary,
  getQualityTrends,
  getAdoptionMetrics,
  getMetricByKey as getMetricDataByKey,
  getMetricSegmentBreakdown,
  getMetricApplicationBreakdown,
  getMetricHistoricalData,
  getEnterpriseQualityScore,
  getReleaseReadinessScore,
  getAtRiskMetrics,
  getHealthyMetrics,
  getImprovingMetrics,
  getDecliningMetrics,
  getLowestScoringMetrics,
  getHighestScoringMetrics,
  getMetricCountByStatus,
  getMetricCountByGrade,
  getMetricCountByTrend,
  getDistinctMetricKeys,
  getDistinctStatuses,
  getDistinctGrades,
  getDistinctTrends,
  searchMetrics,
  getMetricForApplication,
  getMetricForSegment,
} from '../data/metrics.js';

/**
 * @module analyticsService
 * AnalyticsDashboard service for eQIP Quality Intelligence.
 * Orchestrates MetricsEngine calculations and provides filtered, role-scoped
 * analytics data for Executive Dashboard and analytics screens.
 * Reads from mockDataStore and metrics data modules.
 */

/**
 * Roles that can view all analytics data across all segments.
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
 * Roles that can view analytics dashboards.
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
 * Roles that can configure metric weights.
 * @type {Set<string>}
 */
const CONFIGURE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.QA_LEAD,
]);

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'configure').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return VIEW_ROLES.has(role);
    case 'configure':
      return CONFIGURE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Apply role-based scoping to segment-level data.
 * Admin, Program Manager, QA Lead, Release Manager, and Viewer can see all segments.
 * Other roles see only their own segment.
 *
 * @param {object} segmentData - Object with segment keys and values.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} The scoped segment data.
 */
function scopeSegmentData(segmentData, role, userSegment) {
  if (!segmentData || typeof segmentData !== 'object') {
    return {};
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return { ...segmentData };
  }

  if (!userSegment) {
    return { ...segmentData };
  }

  const scoped = {};
  if (segmentData[userSegment] !== undefined) {
    scoped[userSegment] = segmentData[userSegment];
  }

  return scoped;
}

/**
 * Apply role-based scoping to application-level data.
 *
 * @param {object} appData - Object with application keys and values.
 * @param {string} role - The user role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} The scoped application data.
 */
function scopeApplicationData(appData, role, userSegment) {
  if (!appData || typeof appData !== 'object') {
    return {};
  }

  if (ALL_SEGMENTS_ROLES.has(role)) {
    return { ...appData };
  }

  if (!userSegment) {
    return { ...appData };
  }

  const applications = getAll(ENTITY_TYPES.APPLICATIONS);
  const segmentApps = new Set();

  for (let i = 0; i < applications.length; i++) {
    if (applications[i].segment === userSegment) {
      segmentApps.add(applications[i].name);
    }
  }

  const scoped = {};
  const keys = Object.keys(appData);

  for (let i = 0; i < keys.length; i++) {
    if (segmentApps.has(keys[i])) {
      scoped[keys[i]] = appData[keys[i]];
    }
  }

  return scoped;
}

/**
 * Render the executive dashboard with filtered, role-scoped data.
 * Returns a comprehensive dashboard data object including quality scores,
 * release readiness, defect trends, critical alerts, and recent activity.
 *
 * @param {object} [filters={}] - Dashboard filters.
 * @param {string} [filters.segment] - Filter by segment.
 * @param {string} [filters.application] - Filter by application.
 * @param {string} [filters.dateRange] - Date range preset (e.g., 'last7', 'last30', 'last90').
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @param {string} [userId] - The user ID for audit logging.
 * @returns {object} Dashboard data object.
 */
export function renderDashboard(filters = {}, role = ROLES.VIEWER, userSegment, userId) {
  if (!hasPermission(role, 'view')) {
    return {
      enterpriseQualityScore: null,
      releaseReadiness: null,
      metrics: [],
      qualityTrends: null,
      criticalAlerts: [],
      recentActivity: [],
      totalApplications: 0,
      totalReleases: 0,
      totalDemands: 0,
    };
  }

  const dashboardSummary = getDashboardSummary();
  const qualityTrends = getQualityTrends();

  const scopedDashboard = { ...dashboardSummary };

  if (filters.segment && typeof filters.segment === 'string') {
    if (scopedDashboard.criticalAlerts && Array.isArray(scopedDashboard.criticalAlerts)) {
      scopedDashboard.criticalAlerts = scopedDashboard.criticalAlerts.filter((alert) => {
        if (!alert.entityId) {
          return true;
        }
        return true;
      });
    }
  }

  const eqs = getEnterpriseQualityScore();
  const rrs = getReleaseReadinessScore();

  let eqsData = null;
  if (eqs) {
    eqsData = {
      value: eqs.value,
      grade: eqs.grade || scopedDashboard.enterpriseQualityScore.grade,
      trend: eqs.trend,
      trendPercentage: eqs.trendPercentage,
      target: scopedDashboard.enterpriseQualityScore.target,
    };

    if (eqs.segmentBreakdown) {
      eqsData.segmentBreakdown = scopeSegmentData(eqs.segmentBreakdown, role, userSegment);
    }

    if (eqs.applicationBreakdown) {
      eqsData.applicationBreakdown = scopeApplicationData(eqs.applicationBreakdown, role, userSegment);
    }
  }

  let rrsData = null;
  if (rrs) {
    rrsData = {
      value: rrs.value,
      status: rrs.status || scopedDashboard.releaseReadiness.status,
      trend: rrs.trend,
      trendPercentage: rrs.trendPercentage,
      target: scopedDashboard.releaseReadiness.target,
    };

    if (rrs.releaseBreakdown) {
      rrsData.releaseBreakdown = rrs.releaseBreakdown;
    }
  }

  let scopedQualityTrends = qualityTrends;
  if (qualityTrends && qualityTrends.enterpriseQualityScore) {
    scopedQualityTrends = { ...qualityTrends };
  }

  const criticalAlerts = Array.isArray(scopedDashboard.criticalAlerts)
    ? scopedDashboard.criticalAlerts.map((alert) => maskEntity(alert, role))
    : [];

  const recentActivity = Array.isArray(scopedDashboard.recentActivity)
    ? scopedDashboard.recentActivity.map((activity) => maskEntity(activity, role))
    : [];

  if (userId) {
    logAction(userId, 'View Dashboard', 'analytics', 'dashboard', 'Viewed executive dashboard');
  }

  return {
    enterpriseQualityScore: eqsData,
    releaseReadiness: rrsData,
    testPassRate: scopedDashboard.testPassRate || null,
    automationCoverage: scopedDashboard.automationCoverage || null,
    defectDensity: scopedDashboard.defectDensity || null,
    escapedDefectRate: scopedDashboard.escapedDefectRate || null,
    qualityGateCompliance: scopedDashboard.qualityGateCompliance || null,
    governanceCompliance: scopedDashboard.governanceCompliance || null,
    qualityTrends: scopedQualityTrends,
    criticalAlerts,
    recentActivity,
    totalApplications: scopedDashboard.totalApplications || 0,
    totalReleases: scopedDashboard.totalReleases || 0,
    totalDemands: scopedDashboard.totalDemands || 0,
    totalTestCases: scopedDashboard.totalTestCases || 0,
    totalIntegrations: scopedDashboard.totalIntegrations || 0,
    totalEnvironments: scopedDashboard.totalEnvironments || 0,
    lastUpdated: scopedDashboard.lastUpdated || new Date().toISOString(),
  };
}

/**
 * Apply filters to analytics data and return filtered metrics.
 * Supports filtering by segment, application, metric status, trend, and grade.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [filters.segment] - Filter metrics by segment.
 * @param {string} [filters.application] - Filter metrics by application.
 * @param {string} [filters.status] - Filter metrics by status (e.g., 'healthy', 'at_risk').
 * @param {string} [filters.trend] - Filter metrics by trend (e.g., 'improving', 'stable', 'declining').
 * @param {string} [filters.grade] - Filter metrics by grade (e.g., 'A', 'B', 'C', 'D', 'F').
 * @param {string} [filters.query] - Search query for metric name or key.
 * @param {string} [filters.sortKey] - Field to sort by.
 * @param {string} [filters.sortDirection='asc'] - Sort direction.
 * @param {number} [filters.page] - Page number.
 * @param {number} [filters.pageSize] - Items per page.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Filtered metrics result with items and pagination.
 */
export function applyDashboardFilters(filters = {}, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: filters.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let metricsData = getAll(ENTITY_TYPES.METRICS);

  if (metricsData.length === 0) {
    const allMetrics = getAllMetrics();
    metricsData = allMetrics;
  }

  const filterCriteria = {};

  if (filters.status && typeof filters.status === 'string') {
    filterCriteria.status = filters.status;
  }

  if (filters.trend && typeof filters.trend === 'string') {
    filterCriteria.trend = filters.trend;
  }

  if (filters.grade && typeof filters.grade === 'string') {
    filterCriteria.grade = filters.grade;
  }

  const result = processData(metricsData, {
    filters: Object.keys(filterCriteria).length > 0 ? filterCriteria : undefined,
    query: filters.query,
    searchFields: ['name', 'key', 'status', 'grade', 'trend', 'unit', 'description'],
    sortKey: filters.sortKey,
    sortDirection: filters.sortDirection,
    page: filters.page,
    pageSize: filters.pageSize,
  });

  result.items = result.items.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });

  return result;
}

/**
 * Display metrics for the analytics screen.
 * Returns all calculated metrics with role-based scoping applied.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked metric objects.
 */
export function displayMetrics(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let metricsData = getAll(ENTITY_TYPES.METRICS);

  if (metricsData.length === 0) {
    metricsData = getAllMetrics();
  }

  return metricsData.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get a single metric by key with role-based scoping.
 *
 * @param {string} key - The metric key (e.g., 'defect_density').
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The masked metric object, or null if not found.
 */
export function getMetricDetail(key, role = ROLES.VIEWER, userSegment) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const metric = getMetricDataByKey(key);

  if (!metric) {
    return null;
  }

  const scoped = { ...metric };

  if (scoped.segmentBreakdown) {
    scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
  }

  if (scoped.applicationBreakdown) {
    scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
  }

  return maskEntity(scoped, role);
}

/**
 * Get metric historical data with role-based scoping.
 *
 * @param {string} key - The metric key.
 * @param {number} [periods=12] - Number of historical periods to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of historical data points.
 */
export function getMetricHistory(key, periods = 12, role = ROLES.VIEWER) {
  if (!key || typeof key !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  return getMetricHistoricalData(key, periods);
}

/**
 * Get metric segment breakdown with role-based scoping.
 *
 * @param {string} key - The metric key.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The scoped segment breakdown, or null if not found.
 */
export function getMetricBySegment(key, role = ROLES.VIEWER, userSegment) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const breakdown = getMetricSegmentBreakdown(key);

  if (!breakdown) {
    return null;
  }

  return scopeSegmentData(breakdown, role, userSegment);
}

/**
 * Get metric application breakdown with role-based scoping.
 *
 * @param {string} key - The metric key.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The scoped application breakdown, or null if not found.
 */
export function getMetricByApplication(key, role = ROLES.VIEWER, userSegment) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  const breakdown = getMetricApplicationBreakdown(key);

  if (!breakdown) {
    return null;
  }

  return scopeApplicationData(breakdown, role, userSegment);
}

/**
 * Get the Enterprise Quality Score with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The scoped Enterprise Quality Score metric.
 */
export function getEnterpriseQualityScoreDetail(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return null;
  }

  const eqs = getEnterpriseQualityScore();

  if (!eqs) {
    return null;
  }

  const scoped = { ...eqs };

  if (scoped.segmentBreakdown) {
    scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
  }

  if (scoped.applicationBreakdown) {
    scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
  }

  return maskEntity(scoped, role);
}

/**
 * Get the Release Readiness Score with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The scoped Release Readiness Score metric.
 */
export function getReleaseReadinessScoreDetail(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return null;
  }

  const rrs = getReleaseReadinessScore();

  if (!rrs) {
    return null;
  }

  const scoped = { ...rrs };

  return maskEntity(scoped, role);
}

/**
 * Get quality trends data with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The quality trends data.
 */
export function getQualityTrendsData(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return null;
  }

  const trends = getQualityTrends();

  if (!trends) {
    return null;
  }

  return trends;
}

/**
 * Get adoption metrics data.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The adoption metrics data.
 */
export function getAdoptionMetricsData(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return null;
  }

  return getAdoptionMetrics();
}

/**
 * Get metrics grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with status keys and arrays of masked metrics.
 */
export function getMetricsByStatus(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let metricsData = getAll(ENTITY_TYPES.METRICS);

  if (metricsData.length === 0) {
    metricsData = getAllMetrics();
  }

  const grouped = {};

  for (let i = 0; i < metricsData.length; i++) {
    const metric = metricsData[i];
    const status = metric.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    grouped[status].push(maskEntity(scoped, role));
  }

  return grouped;
}

/**
 * Get metrics grouped by trend.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with trend keys and arrays of masked metrics.
 */
export function getMetricsByTrend(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let metricsData = getAll(ENTITY_TYPES.METRICS);

  if (metricsData.length === 0) {
    metricsData = getAllMetrics();
  }

  const grouped = {};

  for (let i = 0; i < metricsData.length; i++) {
    const metric = metricsData[i];
    const trend = metric.trend || 'unknown';

    if (!grouped[trend]) {
      grouped[trend] = [];
    }

    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    grouped[trend].push(maskEntity(scoped, role));
  }

  return grouped;
}

/**
 * Get metrics grouped by grade.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Object with grade keys and arrays of masked metrics.
 */
export function getMetricsByGrade(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let metricsData = getAll(ENTITY_TYPES.METRICS);

  if (metricsData.length === 0) {
    metricsData = getAllMetrics();
  }

  const grouped = {};

  for (let i = 0; i < metricsData.length; i++) {
    const metric = metricsData[i];
    const grade = metric.grade || 'N/A';

    if (!grouped[grade]) {
      grouped[grade] = [];
    }

    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    grouped[grade].push(maskEntity(scoped, role));
  }

  return grouped;
}

/**
 * Get at-risk metrics with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked at-risk metric objects.
 */
export function getAtRiskMetricsData(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const atRisk = getAtRiskMetrics();

  return atRisk.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get improving metrics with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked improving metric objects.
 */
export function getImprovingMetricsData(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const improving = getImprovingMetrics();

  return improving.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get declining metrics with role-based scoping.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked declining metric objects.
 */
export function getDecliningMetricsData(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const declining = getDecliningMetrics();

  return declining.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get lowest scoring metrics with role-based scoping.
 *
 * @param {number} [limit] - Maximum number of metrics to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked metrics sorted by score ascending.
 */
export function getLowestScoringMetricsData(limit, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const lowest = getLowestScoringMetrics(limit);

  return lowest.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get highest scoring metrics with role-based scoping.
 *
 * @param {number} [limit] - Maximum number of metrics to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of masked metrics sorted by score descending.
 */
export function getHighestScoringMetricsData(limit, role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const highest = getHighestScoringMetrics(limit);

  return highest.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get metric value for a specific application.
 *
 * @param {string} metricKey - The metric key.
 * @param {string} applicationName - The application name.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The application metric data, or null if not found.
 */
export function getMetricValueForApplication(metricKey, applicationName, role = ROLES.VIEWER) {
  if (!metricKey || !applicationName) {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  return getMetricForApplication(metricKey, applicationName);
}

/**
 * Get metric value for a specific segment.
 *
 * @param {string} metricKey - The metric key.
 * @param {string} segmentName - The segment name.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object|null} The segment metric data, or null if not found or not accessible.
 */
export function getMetricValueForSegment(metricKey, segmentName, role = ROLES.VIEWER, userSegment) {
  if (!metricKey || !segmentName) {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  if (!ALL_SEGMENTS_ROLES.has(role) && userSegment && segmentName !== userSegment) {
    return null;
  }

  return getMetricForSegment(metricKey, segmentName);
}

/**
 * Get metric trend data for visualization.
 *
 * @param {string} metricKey - The metric key.
 * @param {number} [periods=12] - Number of historical periods.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of trend data points.
 */
export function getMetricTrendData(metricKey, periods = 12, role = ROLES.VIEWER) {
  if (!metricKey || typeof metricKey !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  return getMetricTrends(metricKey, periods);
}

/**
 * Get metric counts grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and count values.
 */
export function getMetricStatusCounts(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getMetricCountByStatus();
}

/**
 * Get metric counts grouped by grade.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with grade keys and count values.
 */
export function getMetricGradeCounts(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getMetricCountByGrade();
}

/**
 * Get metric counts grouped by trend.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with trend keys and count values.
 */
export function getMetricTrendCounts(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getMetricCountByTrend();
}

/**
 * Get the current metric weights configuration.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The metric weights object, or null if not authorized.
 */
export function getMetricWeights(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return null;
  }

  return getWeights();
}

/**
 * Update metric weights configuration.
 * Only admin and QA lead roles can configure weights.
 *
 * @param {object} weights - The weights to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated weights, or null if not authorized.
 */
export function updateMetricWeights(weights, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    console.warn('[AnalyticsService] User does not have permission to configure metric weights.');
    return null;
  }

  if (!weights || typeof weights !== 'object') {
    console.warn('[AnalyticsService] Invalid weights data.');
    return null;
  }

  const updated = setWeights(weights);

  logAction(userId, 'Update Metric Weights', 'metrics', 'weights', `Updated metric weights: ${Object.keys(weights).join(', ')}`);

  return updated;
}

/**
 * Reset metric weights to defaults.
 * Only admin and QA lead roles can configure weights.
 *
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The default weights, or null if not authorized.
 */
export function resetMetricWeights(userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    console.warn('[AnalyticsService] User does not have permission to reset metric weights.');
    return null;
  }

  const defaults = resetWeights();

  logAction(userId, 'Reset Metric Weights', 'metrics', 'weights', 'Reset metric weights to defaults');

  return defaults;
}

/**
 * Trigger a full recalculation of all metrics.
 * Only admin and QA lead roles can trigger recalculation.
 *
 * @param {object} [data] - Optional raw data override for calculation.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>|null} Array of recalculated metrics, or null if not authorized.
 */
export function triggerMetricsRecalculation(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    console.warn('[AnalyticsService] User does not have permission to trigger metrics recalculation.');
    return null;
  }

  const metrics = recalculateMetrics(data);

  logAction(userId, 'Recalculate Metrics', 'metrics', 'all', 'Triggered full metrics recalculation');

  return metrics;
}

/**
 * Calculate a single metric with provided data.
 *
 * @param {string} metricKey - The metric key to calculate.
 * @param {object} data - The input data for calculation.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The calculated metric result, or null if not authorized or invalid key.
 */
export function calculateMetric(metricKey, data, role = ROLES.VIEWER) {
  if (!metricKey || typeof metricKey !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  return calculateSingleMetric(metricKey, data);
}

/**
 * Search metrics by name or key.
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {Array<object>} Array of matching masked metrics.
 */
export function searchAnalyticsMetrics(query, role = ROLES.VIEWER, userSegment) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const results = searchMetrics(query);

  return results.map((metric) => {
    const scoped = { ...metric };

    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }

    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }

    return maskEntity(scoped, role);
  });
}

/**
 * Get distinct filter values for analytics screens.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with arrays of distinct values for each filter dimension.
 */
export function getAnalyticsFilterOptions(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      metricKeys: [],
      statuses: [],
      grades: [],
      trends: [],
    };
  }

  return {
    metricKeys: getDistinctMetricKeys(),
    statuses: getDistinctStatuses(),
    grades: getDistinctGrades(),
    trends: getDistinctTrends(),
  };
}

/**
 * Get a comprehensive analytics summary for dashboard display.
 * Combines metrics summary, counts, and key indicators.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Analytics summary object.
 */
export function getAnalyticsSummary(role = ROLES.VIEWER, userSegment) {
  if (!hasPermission(role, 'view')) {
    return {
      totalMetrics: 0,
      statusCounts: {},
      gradeCounts: {},
      trendCounts: {},
      enterpriseQualityScore: null,
      releaseReadinessScore: null,
      atRiskMetrics: [],
      improvingMetrics: [],
    };
  }

  const statusCounts = getMetricCountByStatus();
  const gradeCounts = getMetricCountByGrade();
  const trendCounts = getMetricCountByTrend();

  const eqs = getEnterpriseQualityScore();
  const rrs = getReleaseReadinessScore();

  const atRisk = getAtRiskMetrics();
  const improving = getImprovingMetrics();

  let totalMetrics = 0;
  const statusKeys = Object.keys(statusCounts);
  for (let i = 0; i < statusKeys.length; i++) {
    totalMetrics += statusCounts[statusKeys[i]];
  }

  const scopedAtRisk = atRisk.map((metric) => {
    const scoped = { ...metric };
    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }
    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }
    return maskEntity(scoped, role);
  });

  const scopedImproving = improving.map((metric) => {
    const scoped = { ...metric };
    if (scoped.segmentBreakdown) {
      scoped.segmentBreakdown = scopeSegmentData(scoped.segmentBreakdown, role, userSegment);
    }
    if (scoped.applicationBreakdown) {
      scoped.applicationBreakdown = scopeApplicationData(scoped.applicationBreakdown, role, userSegment);
    }
    return maskEntity(scoped, role);
  });

  let eqsScoped = null;
  if (eqs) {
    eqsScoped = { ...eqs };
    if (eqsScoped.segmentBreakdown) {
      eqsScoped.segmentBreakdown = scopeSegmentData(eqsScoped.segmentBreakdown, role, userSegment);
    }
    if (eqsScoped.applicationBreakdown) {
      eqsScoped.applicationBreakdown = scopeApplicationData(eqsScoped.applicationBreakdown, role, userSegment);
    }
    eqsScoped = maskEntity(eqsScoped, role);
  }

  let rrsScoped = null;
  if (rrs) {
    rrsScoped = maskEntity({ ...rrs }, role);
  }

  return {
    totalMetrics,
    statusCounts,
    gradeCounts,
    trendCounts,
    enterpriseQualityScore: eqsScoped,
    releaseReadinessScore: rrsScoped,
    atRiskMetrics: scopedAtRisk,
    improvingMetrics: scopedImproving,
  };
}

/**
 * Simulate an API GET request for analytics dashboard data.
 *
 * @param {object} [params={}] - Query parameters including filters.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Simulated API response.
 */
export function apiGetDashboard(params = {}, role = ROLES.VIEWER, userSegment) {
  try {
    const dashboard = renderDashboard(params.filters || {}, role, userSegment, params.userId);

    return {
      status: 200,
      data: dashboard,
    };
  } catch (err) {
    console.error('[AnalyticsService] apiGetDashboard error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for metrics list.
 *
 * @param {object} [params={}] - Query parameters including filters.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Simulated API response.
 */
export function apiGetMetrics(params = {}, role = ROLES.VIEWER, userSegment) {
  try {
    const result = applyDashboardFilters(params, role, userSegment);

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
    console.error('[AnalyticsService] apiGetMetrics error:', err);
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
 * Simulate an API GET request for a single metric by key.
 *
 * @param {string} key - The metric key.
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Simulated API response.
 */
export function apiGetMetricByKey(key, role = ROLES.VIEWER, userSegment) {
  try {
    const metric = getMetricDetail(key, role, userSegment);

    if (!metric) {
      return {
        status: 404,
        error: `Metric with key '${key}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: metric,
    };
  } catch (err) {
    console.error(`[AnalyticsService] apiGetMetricByKey error for ${key}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for metric trends.
 *
 * @param {string} key - The metric key.
 * @param {number} [periods=12] - Number of historical periods.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetMetricTrends(key, periods = 12, role = ROLES.VIEWER) {
  try {
    const trends = getMetricTrendData(key, periods, role);

    return {
      status: 200,
      data: trends,
    };
  } catch (err) {
    console.error(`[AnalyticsService] apiGetMetricTrends error for ${key}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
    };
  }
}

/**
 * Simulate an API GET request for analytics summary.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @param {string} [userSegment] - The user's segment for scoping.
 * @returns {object} Simulated API response.
 */
export function apiGetAnalyticsSummary(role = ROLES.VIEWER, userSegment) {
  try {
    const summary = getAnalyticsSummary(role, userSegment);

    return {
      status: 200,
      data: summary,
    };
  } catch (err) {
    console.error('[AnalyticsService] apiGetAnalyticsSummary error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API PUT request to update metric weights.
 *
 * @param {object} weights - The weights to update.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateMetricWeights(weights, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    return {
      status: 403,
      error: 'You do not have permission to configure metric weights.',
      data: null,
    };
  }

  const updated = updateMetricWeights(weights, userId, role);

  if (!updated) {
    return {
      status: 400,
      error: 'Failed to update metric weights.',
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API POST request to reset metric weights.
 *
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiResetMetricWeights(userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    return {
      status: 403,
      error: 'You do not have permission to reset metric weights.',
      data: null,
    };
  }

  const defaults = resetMetricWeights(userId, role);

  if (!defaults) {
    return {
      status: 500,
      error: 'Failed to reset metric weights.',
      data: null,
    };
  }

  return {
    status: 200,
    data: defaults,
  };
}

/**
 * Simulate an API POST request to trigger metrics recalculation.
 *
 * @param {object} [data] - Optional raw data override.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiRecalculateMetrics(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'configure')) {
    return {
      status: 403,
      error: 'You do not have permission to trigger metrics recalculation.',
      data: null,
    };
  }

  const metrics = triggerMetricsRecalculation(data, userId, role);

  if (!metrics) {
    return {
      status: 500,
      error: 'Failed to recalculate metrics.',
      data: null,
    };
  }

  return {
    status: 200,
    data: metrics,
  };
}