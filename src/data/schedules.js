import { v4 as uuidv4 } from 'uuid';

/**
 * @module schedules
 * Mock scheduler data seed for eQIP Quality Intelligence.
 * Test execution schedules with id, name, testSuiteId, frequency, cronExpression,
 * status (active/paused/disabled), nextRun, lastRun, createdBy, and audit fields.
 */

/**
 * Helper to generate a relative ISO date string.
 * @param {number} days - Number of days in the past (positive) or future (negative).
 * @returns {string} ISO8601 date string.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Helper to generate a relative ISO date string with hour offset.
 * @param {number} days - Number of days in the past.
 * @param {number} hours - Additional hours offset.
 * @returns {string} ISO8601 date string.
 */
function daysAndHoursAgo(days, hours) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/**
 * Mock test execution schedule data array.
 * Each schedule includes id, name, description, testSuiteId, testSuiteName,
 * application, segment, frequency, cronExpression, status, nextRun, lastRun,
 * lastRunStatus, lastRunDurationMs, environment, notifyOnFailure, recipients,
 * retryOnFailure, maxRetries, tags, owner, version, and audit fields.
 * @type {Array<object>}
 */
const schedules = [
  {
    id: 'sched-exec-001',
    name: 'Claims Regression - Nightly',
    description: 'Nightly execution of the Claims Processing regression test suite against the staging environment.',
    testSuiteId: 'suite-001',
    testSuiteName: 'Claims Processing Regression Suite',
    application: 'Claims Processing',
    segment: 'Claims',
    frequency: 'daily',
    cronExpression: '0 2 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAndHoursAgo(0, 6),
    lastRunStatus: 'success',
    lastRunDurationMs: 185000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-003'],
    retryOnFailure: true,
    maxRetries: 2,
    tags: ['regression', 'claims', 'nightly', 'automated'],
    owner: 'user-005',
    version: 4,
    created_at: daysAgo(180),
    updated_at: daysAndHoursAgo(0, 6),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-002',
    name: 'Payment Gateway Integration - Nightly',
    description: 'Nightly execution of the Payment Gateway integration test suite including payment processing and reconciliation tests.',
    testSuiteId: 'suite-002',
    testSuiteName: 'Payment Gateway Integration Suite',
    application: 'Payment Gateway',
    segment: 'Billing',
    frequency: 'daily',
    cronExpression: '0 3 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAndHoursAgo(0, 5),
    lastRunStatus: 'failed',
    lastRunDurationMs: 245000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-009', 'user-004', 'user-013'],
    retryOnFailure: true,
    maxRetries: 2,
    tags: ['integration', 'payments', 'nightly', 'automated'],
    owner: 'user-009',
    version: 5,
    created_at: daysAgo(200),
    updated_at: daysAndHoursAgo(0, 5),
    created_by: 'user-004',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-003',
    name: 'Member Portal Enrollment - Weekly',
    description: 'Weekly execution of the Member Portal enrollment end-to-end test suite on staging.',
    testSuiteId: 'suite-003',
    testSuiteName: 'Member Portal Enrollment Suite',
    application: 'Member Portal',
    segment: 'Enrollment',
    frequency: 'weekly',
    cronExpression: '0 4 * * 1',
    status: 'active',
    nextRun: daysAgo(-5),
    lastRun: daysAgo(3),
    lastRunStatus: 'success',
    lastRunDurationMs: 310000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-006', 'user-003'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['enrollment', 'e2e', 'weekly', 'automated'],
    owner: 'user-006',
    version: 2,
    created_at: daysAgo(150),
    updated_at: daysAgo(3),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-004',
    name: 'Provider Directory Search - Nightly',
    description: 'Nightly execution of the Provider Directory search functional test suite.',
    testSuiteId: 'suite-004',
    testSuiteName: 'Provider Directory Search Suite',
    application: 'Provider Directory',
    segment: 'Provider',
    frequency: 'daily',
    cronExpression: '0 2 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAgo(1),
    lastRunStatus: 'failed',
    lastRunDurationMs: 198000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-007', 'user-011'],
    retryOnFailure: true,
    maxRetries: 1,
    tags: ['provider', 'search', 'nightly', 'functional'],
    owner: 'user-007',
    version: 4,
    created_at: daysAgo(160),
    updated_at: daysAgo(1),
    created_by: 'user-004',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-005',
    name: 'Rx Platform Formulary - Nightly',
    description: 'Nightly execution of the Rx Platform formulary test suite including drug interaction alert tests.',
    testSuiteId: 'suite-005',
    testSuiteName: 'Rx Platform Formulary Suite',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    frequency: 'daily',
    cronExpression: '0 1 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAgo(2),
    lastRunStatus: 'failed',
    lastRunDurationMs: 162000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-008', 'user-012'],
    retryOnFailure: true,
    maxRetries: 2,
    tags: ['pharmacy', 'formulary', 'nightly', 'clinical-safety'],
    owner: 'user-008',
    version: 3,
    created_at: daysAgo(140),
    updated_at: daysAgo(2),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-006',
    name: 'EQIP Core Performance - Weekly',
    description: 'Weekly performance and load testing execution for the EQIP Core platform dashboards and APIs.',
    testSuiteId: 'suite-006',
    testSuiteName: 'EQIP Core Performance Suite',
    application: 'EQIP Core',
    segment: 'Enterprise',
    frequency: 'weekly',
    cronExpression: '0 0 * * 6',
    status: 'active',
    nextRun: daysAgo(-3),
    lastRun: daysAgo(5),
    lastRunStatus: 'success',
    lastRunDurationMs: 2160000,
    environment: 'performance',
    notifyOnFailure: true,
    recipients: ['user-009', 'user-001'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['performance', 'load-test', 'weekly', 'enterprise'],
    owner: 'user-009',
    version: 3,
    created_at: daysAgo(120),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-007',
    name: 'Security Scan - Weekly',
    description: 'Weekly OWASP Top 10 and XSS vulnerability scanning across enterprise applications.',
    testSuiteId: 'suite-007',
    testSuiteName: 'Security Scan Configuration Suite',
    application: 'EQIP Core',
    segment: 'Enterprise',
    frequency: 'weekly',
    cronExpression: '0 22 * * 0',
    status: 'active',
    nextRun: daysAgo(-4),
    lastRun: daysAgo(3),
    lastRunStatus: 'failed',
    lastRunDurationMs: 7800000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-010', 'user-001', 'user-002'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['security', 'owasp', 'vulnerability', 'weekly'],
    owner: 'user-010',
    version: 6,
    created_at: daysAgo(200),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-008',
    name: 'Accessibility Compliance - Bi-Weekly',
    description: 'Bi-weekly WCAG 2.1 AA accessibility compliance test execution for member-facing applications.',
    testSuiteId: 'suite-008',
    testSuiteName: 'Accessibility Compliance Suite',
    application: 'Member Portal',
    segment: 'Enrollment',
    frequency: 'bi-weekly',
    cronExpression: '0 5 1,15 * *',
    status: 'active',
    nextRun: daysAgo(-8),
    lastRun: daysAgo(4),
    lastRunStatus: 'success',
    lastRunDurationMs: 95000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-006', 'user-003'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['accessibility', 'wcag', 'bi-weekly', 'compliance'],
    owner: 'user-006',
    version: 2,
    created_at: daysAgo(90),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-009',
    name: 'Underwriting API - Nightly',
    description: 'Nightly execution of the Underwriting Engine API test collection including risk scoring and decision rules.',
    testSuiteId: 'suite-009',
    testSuiteName: 'Underwriting API Collection Suite',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    frequency: 'daily',
    cronExpression: '0 3 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAgo(2),
    lastRunStatus: 'success',
    lastRunDurationMs: 67000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-011'],
    retryOnFailure: true,
    maxRetries: 1,
    tags: ['underwriting', 'api', 'nightly', 'risk-scoring'],
    owner: 'user-005',
    version: 3,
    created_at: daysAgo(110),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-010',
    name: 'Compliance Dashboard Smoke - Nightly',
    description: 'Nightly smoke test execution for the Compliance Dashboard core functionality and monitoring widgets.',
    testSuiteId: 'suite-010',
    testSuiteName: 'Compliance Dashboard Smoke Suite',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    frequency: 'daily',
    cronExpression: '0 1 * * *',
    status: 'active',
    nextRun: daysAgo(-1),
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastRunDurationMs: 72000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-001'],
    retryOnFailure: true,
    maxRetries: 2,
    tags: ['compliance', 'smoke', 'nightly', 'dashboard'],
    owner: 'user-005',
    version: 4,
    created_at: daysAgo(100),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-011',
    name: 'Claims Regression - UAT Weekly',
    description: 'Weekly execution of the Claims Processing regression suite against the UAT environment for pre-release validation.',
    testSuiteId: 'suite-001',
    testSuiteName: 'Claims Processing Regression Suite',
    application: 'Claims Processing',
    segment: 'Claims',
    frequency: 'weekly',
    cronExpression: '0 6 * * 3',
    status: 'active',
    nextRun: daysAgo(-4),
    lastRun: daysAgo(7),
    lastRunStatus: 'success',
    lastRunDurationMs: 210000,
    environment: 'uat',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-003', 'user-022'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['regression', 'claims', 'weekly', 'uat'],
    owner: 'user-005',
    version: 2,
    created_at: daysAgo(130),
    updated_at: daysAgo(7),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-012',
    name: 'Payment Gateway Reconciliation - Paused',
    description: 'Nightly payment reconciliation test execution. Paused pending resolution of T+1 settlement date fix.',
    testSuiteId: 'suite-002',
    testSuiteName: 'Payment Gateway Integration Suite',
    application: 'Payment Gateway',
    segment: 'Billing',
    frequency: 'daily',
    cronExpression: '0 4 * * *',
    status: 'paused',
    nextRun: null,
    lastRun: daysAgo(5),
    lastRunStatus: 'failed',
    lastRunDurationMs: 130000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-009', 'user-020', 'user-013'],
    retryOnFailure: true,
    maxRetries: 2,
    tags: ['payments', 'reconciliation', 'paused', 'blocked'],
    owner: 'user-009',
    version: 6,
    created_at: daysAgo(185),
    updated_at: daysAgo(5),
    created_by: 'user-004',
    updated_by: 'user-009',
  },
  {
    id: 'sched-exec-013',
    name: 'Provider Data Sync - Disabled',
    description: 'Nightly provider data synchronization test. Disabled due to recurring timeout failures pending batch sync implementation.',
    testSuiteId: 'suite-004',
    testSuiteName: 'Provider Directory Search Suite',
    application: 'Provider Directory',
    segment: 'Provider',
    frequency: 'daily',
    cronExpression: '0 5 * * *',
    status: 'disabled',
    nextRun: null,
    lastRun: daysAgo(10),
    lastRunStatus: 'failed',
    lastRunDurationMs: 900000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-007', 'user-011'],
    retryOnFailure: true,
    maxRetries: 3,
    tags: ['provider', 'data-sync', 'disabled', 'timeout'],
    owner: 'user-007',
    version: 5,
    created_at: daysAgo(165),
    updated_at: daysAgo(10),
    created_by: 'user-004',
    updated_by: 'user-011',
  },
  {
    id: 'sched-exec-014',
    name: 'EQIP Core Performance - Pre-Release',
    description: 'On-demand performance test execution triggered before each release deployment to the performance environment.',
    testSuiteId: 'suite-006',
    testSuiteName: 'EQIP Core Performance Suite',
    application: 'EQIP Core',
    segment: 'Enterprise',
    frequency: 'on_demand',
    cronExpression: null,
    status: 'active',
    nextRun: null,
    lastRun: daysAgo(5),
    lastRunStatus: 'success',
    lastRunDurationMs: 2400000,
    environment: 'performance',
    notifyOnFailure: true,
    recipients: ['user-009', 'user-017', 'user-001'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['performance', 'pre-release', 'on-demand', 'enterprise'],
    owner: 'user-009',
    version: 3,
    created_at: daysAgo(100),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-015',
    name: 'Enrollment Flow - UAT Bi-Weekly',
    description: 'Bi-weekly execution of the enrollment flow test suite against the UAT environment for acceptance validation.',
    testSuiteId: 'suite-003',
    testSuiteName: 'Member Portal Enrollment Suite',
    application: 'Member Portal',
    segment: 'Enrollment',
    frequency: 'bi-weekly',
    cronExpression: '0 7 1,15 * *',
    status: 'active',
    nextRun: daysAgo(-10),
    lastRun: daysAgo(10),
    lastRunStatus: 'success',
    lastRunDurationMs: 340000,
    environment: 'uat',
    notifyOnFailure: true,
    recipients: ['user-006', 'user-023', 'user-014'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['enrollment', 'uat', 'bi-weekly', 'acceptance'],
    owner: 'user-006',
    version: 2,
    created_at: daysAgo(80),
    updated_at: daysAgo(10),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-016',
    name: 'Security Scan - Monthly Full',
    description: 'Monthly comprehensive security scan execution covering all enterprise applications with full OWASP and SAST/DAST analysis.',
    testSuiteId: 'suite-007',
    testSuiteName: 'Security Scan Configuration Suite',
    application: 'EQIP Core',
    segment: 'Enterprise',
    frequency: 'monthly',
    cronExpression: '0 20 1 * *',
    status: 'active',
    nextRun: daysAgo(-25),
    lastRun: daysAgo(30),
    lastRunStatus: 'success',
    lastRunDurationMs: 14400000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-010', 'user-001', 'user-002', 'user-017'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['security', 'monthly', 'comprehensive', 'sast', 'dast'],
    owner: 'user-010',
    version: 4,
    created_at: daysAgo(200),
    updated_at: daysAgo(30),
    created_by: 'user-010',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-017',
    name: 'Rx Platform Formulary - UAT Weekly',
    description: 'Weekly execution of the Rx Platform formulary test suite against the UAT environment for clinical safety validation.',
    testSuiteId: 'suite-005',
    testSuiteName: 'Rx Platform Formulary Suite',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    frequency: 'weekly',
    cronExpression: '0 5 * * 2',
    status: 'paused',
    nextRun: null,
    lastRun: daysAgo(14),
    lastRunStatus: 'failed',
    lastRunDurationMs: 175000,
    environment: 'uat',
    notifyOnFailure: true,
    recipients: ['user-008', 'user-012', 'user-003'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['pharmacy', 'formulary', 'uat', 'paused', 'clinical-safety'],
    owner: 'user-008',
    version: 3,
    created_at: daysAgo(100),
    updated_at: daysAgo(14),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'sched-exec-018',
    name: 'Underwriting API - Pre-Release',
    description: 'On-demand execution of the Underwriting API test collection triggered before each release deployment.',
    testSuiteId: 'suite-009',
    testSuiteName: 'Underwriting API Collection Suite',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    frequency: 'on_demand',
    cronExpression: null,
    status: 'active',
    nextRun: null,
    lastRun: daysAgo(2),
    lastRunStatus: 'success',
    lastRunDurationMs: 72000,
    environment: 'staging',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-011', 'user-017'],
    retryOnFailure: true,
    maxRetries: 1,
    tags: ['underwriting', 'api', 'pre-release', 'on-demand'],
    owner: 'user-005',
    version: 2,
    created_at: daysAgo(70),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-019',
    name: 'Compliance Dashboard - UAT Weekly',
    description: 'Weekly execution of the Compliance Dashboard smoke suite against the UAT environment for release readiness validation.',
    testSuiteId: 'suite-010',
    testSuiteName: 'Compliance Dashboard Smoke Suite',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    frequency: 'weekly',
    cronExpression: '0 6 * * 4',
    status: 'active',
    nextRun: daysAgo(-3),
    lastRun: daysAgo(7),
    lastRunStatus: 'success',
    lastRunDurationMs: 78000,
    environment: 'uat',
    notifyOnFailure: true,
    recipients: ['user-005', 'user-001'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['compliance', 'smoke', 'uat', 'weekly'],
    owner: 'user-005',
    version: 2,
    created_at: daysAgo(60),
    updated_at: daysAgo(7),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-exec-020',
    name: 'Claims Regression - Performance Monthly',
    description: 'Monthly performance regression test execution for Claims Processing batch operations under load.',
    testSuiteId: 'suite-001',
    testSuiteName: 'Claims Processing Regression Suite',
    application: 'Claims Processing',
    segment: 'Claims',
    frequency: 'monthly',
    cronExpression: '0 0 15 * *',
    status: 'active',
    nextRun: daysAgo(-12),
    lastRun: daysAgo(20),
    lastRunStatus: 'success',
    lastRunDurationMs: 1800000,
    environment: 'performance',
    notifyOnFailure: true,
    recipients: ['user-009', 'user-005', 'user-012'],
    retryOnFailure: false,
    maxRetries: 0,
    tags: ['claims', 'performance', 'monthly', 'batch', 'load-test'],
    owner: 'user-009',
    version: 2,
    created_at: daysAgo(90),
    updated_at: daysAgo(20),
    created_by: 'user-009',
    updated_by: 'system',
  },
];

export default schedules;

/**
 * Get all mock schedules.
 * @returns {Array<object>} Array of schedule objects.
 */
export function getAllSchedules() {
  return [...schedules];
}

/**
 * Find a schedule by ID.
 * @param {string} id - The schedule ID to find.
 * @returns {object|null} The schedule object, or null if not found.
 */
export function getScheduleById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return schedules.find((sched) => sched.id === id) || null;
}

/**
 * Get all schedules for a specific test suite.
 * @param {string} testSuiteId - The test suite ID to filter by.
 * @returns {Array<object>} Array of schedules for the specified test suite.
 */
export function getSchedulesByTestSuiteId(testSuiteId) {
  if (!testSuiteId || typeof testSuiteId !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.testSuiteId === testSuiteId);
}

/**
 * Get all schedules with a specific status.
 * @param {string} status - The status to filter by (e.g., 'active', 'paused', 'disabled').
 * @returns {Array<object>} Array of schedules with the specified status.
 */
export function getSchedulesByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.status === status);
}

/**
 * Get all schedules with a specific frequency.
 * @param {string} frequency - The frequency to filter by (e.g., 'daily', 'weekly', 'bi-weekly', 'monthly', 'on_demand').
 * @returns {Array<object>} Array of schedules with the specified frequency.
 */
export function getSchedulesByFrequency(frequency) {
  if (!frequency || typeof frequency !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.frequency === frequency);
}

/**
 * Get all schedules for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of schedules for the specified application.
 */
export function getSchedulesByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.application === application);
}

/**
 * Get all schedules within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of schedules within the specified segment.
 */
export function getSchedulesBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.segment === segment);
}

/**
 * Get all schedules for a specific environment.
 * @param {string} environment - The environment to filter by (e.g., 'staging', 'uat', 'performance').
 * @returns {Array<object>} Array of schedules for the specified environment.
 */
export function getSchedulesByEnvironment(environment) {
  if (!environment || typeof environment !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.environment === environment);
}

/**
 * Get all schedules owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of schedules owned by the specified user.
 */
export function getSchedulesByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.owner === ownerId);
}

/**
 * Get all schedules with a specific last run status.
 * @param {string} lastRunStatus - The last run status to filter by (e.g., 'success', 'failed').
 * @returns {Array<object>} Array of schedules with the specified last run status.
 */
export function getSchedulesByLastRunStatus(lastRunStatus) {
  if (!lastRunStatus || typeof lastRunStatus !== 'string') {
    return [];
  }
  return schedules.filter((sched) => sched.lastRunStatus === lastRunStatus);
}

/**
 * Get all active schedules.
 * @returns {Array<object>} Array of active schedule objects.
 */
export function getActiveSchedules() {
  return schedules.filter((sched) => sched.status === 'active');
}

/**
 * Get all paused schedules.
 * @returns {Array<object>} Array of paused schedule objects.
 */
export function getPausedSchedules() {
  return schedules.filter((sched) => sched.status === 'paused');
}

/**
 * Get all disabled schedules.
 * @returns {Array<object>} Array of disabled schedule objects.
 */
export function getDisabledSchedules() {
  return schedules.filter((sched) => sched.status === 'disabled');
}

/**
 * Get all schedules that have failed on their last run.
 * @returns {Array<object>} Array of schedules with failed last run.
 */
export function getFailedSchedules() {
  return schedules.filter((sched) => sched.lastRunStatus === 'failed');
}

/**
 * Get distinct statuses from the schedule data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].status) {
      statuses.add(schedules[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct frequencies from the schedule data.
 * @returns {string[]} Array of unique frequency strings.
 */
export function getDistinctFrequencies() {
  const frequencies = new Set();
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].frequency) {
      frequencies.add(schedules[i].frequency);
    }
  }
  return [...frequencies].sort();
}

/**
 * Get distinct applications from the schedule data.
 * @returns {string[]} Array of unique application strings.
 */
export function getDistinctApplications() {
  const apps = new Set();
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].application) {
      apps.add(schedules[i].application);
    }
  }
  return [...apps].sort();
}

/**
 * Get distinct segments from the schedule data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].segment) {
      segments.add(schedules[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct environments from the schedule data.
 * @returns {string[]} Array of unique environment strings.
 */
export function getDistinctEnvironments() {
  const envs = new Set();
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].environment) {
      envs.add(schedules[i].environment);
    }
  }
  return [...envs].sort();
}

/**
 * Get a count of schedules grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getScheduleCountByStatus() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const status = schedules[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of schedules grouped by frequency.
 * @returns {object} Object with frequency keys and count values.
 */
export function getScheduleCountByFrequency() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const frequency = schedules[i].frequency;
    counts[frequency] = (counts[frequency] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of schedules grouped by application.
 * @returns {object} Object with application keys and count values.
 */
export function getScheduleCountByApplication() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const application = schedules[i].application;
    counts[application] = (counts[application] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of schedules grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getScheduleCountBySegment() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const segment = schedules[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of schedules grouped by last run status.
 * @returns {object} Object with last run status keys and count values.
 */
export function getScheduleCountByLastRunStatus() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const lastRunStatus = schedules[i].lastRunStatus;
    if (lastRunStatus) {
      counts[lastRunStatus] = (counts[lastRunStatus] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Get a count of schedules grouped by environment.
 * @returns {object} Object with environment keys and count values.
 */
export function getScheduleCountByEnvironment() {
  const counts = {};
  for (let i = 0; i < schedules.length; i++) {
    const environment = schedules[i].environment;
    counts[environment] = (counts[environment] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average last run duration across all schedules with a recorded duration.
 * @returns {number} The average duration in milliseconds, or 0 if no durations exist.
 */
export function getAverageLastRunDuration() {
  let total = 0;
  let count = 0;
  for (let i = 0; i < schedules.length; i++) {
    if (typeof schedules[i].lastRunDurationMs === 'number' && schedules[i].lastRunDurationMs > 0) {
      total += schedules[i].lastRunDurationMs;
      count += 1;
    }
  }
  if (count === 0) {
    return 0;
  }
  return Math.round(total / count);
}

/**
 * Get the total number of schedules with retry on failure enabled.
 * @returns {number} Count of schedules with retryOnFailure set to true.
 */
export function getRetryEnabledCount() {
  let count = 0;
  for (let i = 0; i < schedules.length; i++) {
    if (schedules[i].retryOnFailure === true) {
      count += 1;
    }
  }
  return count;
}

/**
 * Find a schedule by name (case-insensitive).
 * @param {string} name - The schedule name to search for.
 * @returns {object|null} The schedule object, or null if not found.
 */
export function getScheduleByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return schedules.find((sched) => sched.name.toLowerCase() === nameLower) || null;
}

/**
 * Search schedules by name (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching schedule objects.
 */
export function searchSchedulesByName(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return schedules.filter(
    (sched) => sched.name && sched.name.toLowerCase().includes(queryLower),
  );
}

/**
 * Get schedules sorted by last run date in descending order (most recent first).
 * @param {number} [limit] - Optional maximum number of schedules to return.
 * @returns {Array<object>} Array of schedules sorted by last run date.
 */
export function getRecentlyRunSchedules(limit) {
  const sorted = [...schedules].sort((a, b) => {
    const dateA = a.lastRun ? new Date(a.lastRun).getTime() : 0;
    const dateB = b.lastRun ? new Date(b.lastRun).getTime() : 0;
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get schedules sorted by next run date in ascending order (soonest first).
 * Schedules without a next run date are placed at the end.
 * @param {number} [limit] - Optional maximum number of schedules to return.
 * @returns {Array<object>} Array of schedules sorted by next run date.
 */
export function getUpcomingSchedules(limit) {
  const sorted = [...schedules].sort((a, b) => {
    const dateA = a.nextRun ? new Date(a.nextRun).getTime() : Infinity;
    const dateB = b.nextRun ? new Date(b.nextRun).getTime() : Infinity;
    if (dateA === Infinity && dateB === Infinity) return 0;
    if (dateA === Infinity) return 1;
    if (dateB === Infinity) return -1;
    return dateA - dateB;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of schedule metrics.
 * @returns {object} Summary object with schedule metrics.
 */
export function getScheduleSummary() {
  const total = schedules.length;
  let active = 0;
  let paused = 0;
  let disabled = 0;
  let lastRunSuccess = 0;
  let lastRunFailed = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let retryEnabled = 0;
  let daily = 0;
  let weekly = 0;
  let biWeekly = 0;
  let monthly = 0;
  let onDemand = 0;

  for (let i = 0; i < schedules.length; i++) {
    const sched = schedules[i];

    if (sched.status === 'active') active += 1;
    else if (sched.status === 'paused') paused += 1;
    else if (sched.status === 'disabled') disabled += 1;

    if (sched.lastRunStatus === 'success') lastRunSuccess += 1;
    else if (sched.lastRunStatus === 'failed') lastRunFailed += 1;

    if (typeof sched.lastRunDurationMs === 'number' && sched.lastRunDurationMs > 0) {
      totalDuration += sched.lastRunDurationMs;
      durationCount += 1;
    }

    if (sched.retryOnFailure === true) retryEnabled += 1;

    if (sched.frequency === 'daily') daily += 1;
    else if (sched.frequency === 'weekly') weekly += 1;
    else if (sched.frequency === 'bi-weekly') biWeekly += 1;
    else if (sched.frequency === 'monthly') monthly += 1;
    else if (sched.frequency === 'on_demand') onDemand += 1;
  }

  return {
    total,
    active,
    paused,
    disabled,
    lastRunSuccess,
    lastRunFailed,
    lastRunSuccessRate: total > 0 ? Math.round((lastRunSuccess / total) * 10000) / 100 : 0,
    averageLastRunDurationMs: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    retryEnabled,
    daily,
    weekly,
    biWeekly,
    monthly,
    onDemand,
  };
}