import { v4 as uuidv4 } from 'uuid';

/**
 * @module postDeployment
 * Mock post-deployment monitoring data seed for eQIP Quality Intelligence.
 * Deployment events with id, releaseId, applicationId, status, incidentCount,
 * rollbackStatus, performanceMetrics, feedbackLoop links, and audit fields.
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
 * Mock post-deployment monitoring data array.
 * Each deployment event includes id, releaseId, applicationId, applicationName,
 * segment, version, deploymentType, status, deployedAt, deployedBy, environment,
 * incidentCount, incidents, rollbackStatus, rollbackDetails, performanceMetrics,
 * healthChecks, verificationTests, feedbackLoopLinks, notifications, tags,
 * version (schema), and audit fields.
 * @type {Array<object>}
 */
const postDeployments = [
  {
    id: 'pd-001',
    releaseId: 'rel-005',
    applicationId: 'app-002',
    applicationName: 'Claims Processing',
    segment: 'Claims',
    version: '2024.10.0',
    deploymentType: 'rolling',
    status: 'healthy',
    deployedAt: daysAgo(3),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 0,
    incidents: [],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 120, p95: 340, p99: 580, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 620, peak: 780, unit: 'req/sec', status: 'healthy', threshold: 500 },
      errorRate: { current: 0.02, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 45, peak: 62, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 58, peak: 68, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 85, p95: 210, p99: 420, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 142, peak: 198, unit: 'connections', status: 'healthy', threshold: 300 },
    },
    healthChecks: [
      { id: 'hc-pd-001-01', name: 'API Gateway', status: 'passed', responseTimeMs: 85, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-001-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 25, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-001-03', name: 'Message Queue', status: 'passed', responseTimeMs: 18, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-001-04', name: 'Cache Layer', status: 'passed', responseTimeMs: 5, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-001-05', name: 'External Service - Adjudication', status: 'passed', responseTimeMs: 145, lastChecked: daysAndHoursAgo(0, 1) },
    ],
    verificationTests: [
      { id: 'vt-001-01', name: 'Claims Intake Smoke Test', status: 'passed', duration: 12, executedAt: daysAgo(3) },
      { id: 'vt-001-02', name: 'Claims Adjudication Smoke Test', status: 'passed', duration: 18, executedAt: daysAgo(3) },
      { id: 'vt-001-03', name: 'Batch Processing Verification', status: 'passed', duration: 45, executedAt: daysAgo(3) },
      { id: 'vt-001-04', name: 'Claims Search Performance', status: 'passed', duration: 8, executedAt: daysAgo(3) },
      { id: 'vt-001-05', name: 'Notification Service Verification', status: 'passed', duration: 6, executedAt: daysAgo(3) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-001-01', type: 'monitoring_dashboard', name: 'Dynatrace - Claims Processing', url: 'https://eqip-org.live.dynatrace.com/claims-processing', status: 'active' },
      { id: 'fl-001-02', type: 'log_aggregation', name: 'Splunk - Claims Logs', url: 'https://splunk.eqip-org.com/claims-logs', status: 'active' },
      { id: 'fl-001-03', type: 'incident_management', name: 'ServiceNow - Claims Incidents', url: 'https://eqip-org.service-now.com/claims', status: 'active' },
      { id: 'fl-001-04', type: 'alerting', name: 'PagerDuty - Claims On-Call', url: 'https://eqip-org.pagerduty.com/claims', status: 'active' },
      { id: 'fl-001-05', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-001-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(3), status: 'delivered' },
      { id: 'notif-pd-001-02', type: 'verification_complete', channel: 'email', recipient: 'user-012', sentAt: daysAgo(3), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. All post-deployment verification tests passed. No incidents reported in the first 72 hours.',
    tags: ['production', 'claims', 'successful', 'rolling-deployment'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-002',
    releaseId: 'rel-009',
    applicationId: 'app-019',
    applicationName: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    version: '2024.14.0',
    deploymentType: 'blue_green',
    status: 'healthy',
    deployedAt: daysAgo(5),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 0,
    incidents: [],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 95, p95: 280, p99: 450, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 180, peak: 250, unit: 'req/sec', status: 'healthy', threshold: 150 },
      errorRate: { current: 0.01, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 32, peak: 48, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 45, peak: 55, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 70, p95: 180, p99: 350, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 65, peak: 95, unit: 'connections', status: 'healthy', threshold: 200 },
    },
    healthChecks: [
      { id: 'hc-pd-002-01', name: 'API Gateway', status: 'passed', responseTimeMs: 70, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-002-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 20, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-002-03', name: 'Grafana Integration', status: 'passed', responseTimeMs: 55, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-002-04', name: 'Notification Service', status: 'passed', responseTimeMs: 40, lastChecked: daysAndHoursAgo(0, 1) },
    ],
    verificationTests: [
      { id: 'vt-002-01', name: 'Dashboard Load Verification', status: 'passed', duration: 8, executedAt: daysAgo(5) },
      { id: 'vt-002-02', name: 'Compliance Score Widget', status: 'passed', duration: 5, executedAt: daysAgo(5) },
      { id: 'vt-002-03', name: 'Alert Notification System', status: 'passed', duration: 12, executedAt: daysAgo(5) },
      { id: 'vt-002-04', name: 'Report Generation', status: 'passed', duration: 15, executedAt: daysAgo(5) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-002-01', type: 'monitoring_dashboard', name: 'Dynatrace - Compliance Dashboard', url: 'https://eqip-org.live.dynatrace.com/compliance', status: 'active' },
      { id: 'fl-002-02', type: 'log_aggregation', name: 'Splunk - Compliance Logs', url: 'https://splunk.eqip-org.com/compliance-logs', status: 'active' },
      { id: 'fl-002-03', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-002-01', type: 'deployment_success', channel: 'teams', recipient: 'Release Updates', sentAt: daysAgo(5), status: 'delivered' },
      { id: 'notif-pd-002-02', type: 'verification_complete', channel: 'email', recipient: 'user-001', sentAt: daysAgo(5), status: 'delivered' },
    ],
    notes: 'Blue-green deployment completed with zero downtime. All quality gates passed including post-deployment verification. Quality score: 97.',
    tags: ['production', 'compliance', 'successful', 'blue-green', 'zero-downtime'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-003',
    releaseId: 'rel-001',
    applicationId: 'app-001',
    applicationName: 'EQIP Core',
    segment: 'Enterprise',
    version: '2024.06.0',
    deploymentType: 'rolling',
    status: 'monitoring',
    deployedAt: daysAgo(14),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 1,
    incidents: [
      {
        id: 'inc-003-01',
        title: 'Intermittent 503 errors on dashboard API',
        severity: 'medium',
        status: 'resolved',
        reportedAt: daysAndHoursAgo(13, 4),
        resolvedAt: daysAndHoursAgo(13, 1),
        resolutionTimeMinutes: 180,
        rootCause: 'Connection pool exhaustion during peak dashboard load. Pool size was not updated to match new API endpoint requirements.',
        resolution: 'Increased API gateway connection pool from 50 to 100. Added connection pool monitoring alert.',
        impactedUsers: 12,
        reportedBy: 'user-009',
        resolvedBy: 'user-018',
      },
    ],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 140, p95: 380, p99: 620, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 520, peak: 680, unit: 'req/sec', status: 'healthy', threshold: 400 },
      errorRate: { current: 0.05, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 52, peak: 72, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 62, peak: 75, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 100, p95: 250, p99: 480, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 185, peak: 260, unit: 'connections', status: 'healthy', threshold: 300 },
    },
    healthChecks: [
      { id: 'hc-pd-003-01', name: 'API Gateway', status: 'passed', responseTimeMs: 90, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-003-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 22, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-003-03', name: 'Notification Service', status: 'passed', responseTimeMs: 48, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-003-04', name: 'Authentication Service', status: 'passed', responseTimeMs: 35, lastChecked: daysAndHoursAgo(0, 1) },
    ],
    verificationTests: [
      { id: 'vt-003-01', name: 'Dashboard Load Smoke Test', status: 'passed', duration: 10, executedAt: daysAgo(14) },
      { id: 'vt-003-02', name: 'Quality Score Widget', status: 'passed', duration: 6, executedAt: daysAgo(14) },
      { id: 'vt-003-03', name: 'Role-Based Navigation', status: 'passed', duration: 14, executedAt: daysAgo(14) },
      { id: 'vt-003-04', name: 'Audit Trail Logging', status: 'passed', duration: 8, executedAt: daysAgo(14) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-003-01', type: 'monitoring_dashboard', name: 'Dynatrace - EQIP Core', url: 'https://eqip-org.live.dynatrace.com/eqip-core', status: 'active' },
      { id: 'fl-003-02', type: 'log_aggregation', name: 'Splunk - EQIP Core Logs', url: 'https://splunk.eqip-org.com/eqip-core-logs', status: 'active' },
      { id: 'fl-003-03', type: 'incident_management', name: 'ServiceNow - EQIP Core Incidents', url: 'https://eqip-org.service-now.com/eqip-core', status: 'active' },
      { id: 'fl-003-04', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-003-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(14), status: 'delivered' },
      { id: 'notif-pd-003-02', type: 'incident_reported', channel: 'pagerduty', recipient: 'eqip-core-oncall', sentAt: daysAndHoursAgo(13, 4), status: 'delivered' },
      { id: 'notif-pd-003-03', type: 'incident_resolved', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAndHoursAgo(13, 1), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. One medium severity incident (503 errors) occurred 24 hours post-deployment and was resolved within 3 hours. Root cause was connection pool sizing. Monitoring continues.',
    tags: ['production', 'enterprise', 'incident-resolved', 'monitoring'],
    version: 2,
    created_at: daysAgo(14),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-004',
    releaseId: 'rel-004',
    applicationId: 'app-008',
    applicationName: 'Provider Directory',
    segment: 'Provider',
    version: '2024.03.1',
    deploymentType: 'rolling',
    status: 'degraded',
    deployedAt: daysAgo(40),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 3,
    incidents: [
      {
        id: 'inc-004-01',
        title: 'Provider search response time exceeding 3-second SLA',
        severity: 'high',
        status: 'open',
        reportedAt: daysAgo(15),
        resolvedAt: null,
        resolutionTimeMinutes: null,
        rootCause: 'Elasticsearch index fragmentation causing slow search queries during peak hours. Provider count growth exceeded capacity planning estimates.',
        resolution: null,
        impactedUsers: 85,
        reportedBy: 'user-009',
        resolvedBy: null,
      },
      {
        id: 'inc-004-02',
        title: 'Provider data sync job timeout',
        severity: 'high',
        status: 'open',
        reportedAt: daysAgo(10),
        resolvedAt: null,
        resolutionTimeMinutes: null,
        rootCause: 'Single-call sync approach cannot handle 1200+ provider records. Timeout at 15-minute threshold.',
        resolution: null,
        impactedUsers: 0,
        reportedBy: 'user-007',
        resolvedBy: null,
      },
      {
        id: 'inc-004-03',
        title: 'Stale provider credential data displayed',
        severity: 'medium',
        status: 'in_progress',
        reportedAt: daysAgo(8),
        resolvedAt: null,
        resolutionTimeMinutes: null,
        rootCause: 'Data sync failures causing provider credential information to be outdated by up to 48 hours.',
        resolution: null,
        impactedUsers: 35,
        reportedBy: 'user-011',
        resolvedBy: null,
      },
    ],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 1200, p95: 3500, p99: 5200, unit: 'ms', status: 'critical', threshold: 2000 },
      throughput: { current: 85, peak: 120, unit: 'req/sec', status: 'warning', threshold: 150 },
      errorRate: { current: 2.5, unit: '%', status: 'critical', threshold: 1.0 },
      cpuUtilization: { current: 72, peak: 88, unit: '%', status: 'warning', threshold: 80 },
      memoryUtilization: { current: 78, peak: 92, unit: '%', status: 'critical', threshold: 85 },
      latency: { p50: 950, p95: 2800, p99: 4500, unit: 'ms', status: 'critical', threshold: 2000 },
      activeConnections: { current: 210, peak: 285, unit: 'connections', status: 'warning', threshold: 300 },
    },
    healthChecks: [
      { id: 'hc-pd-004-01', name: 'Database Connectivity', status: 'passed', responseTimeMs: 30, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-004-02', name: 'Elasticsearch', status: 'warning', responseTimeMs: 3200, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-004-03', name: 'Credentialing API', status: 'warning', responseTimeMs: 1800, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-004-04', name: 'Data Sync Job', status: 'failed', responseTimeMs: 0, lastChecked: daysAndHoursAgo(0, 1) },
    ],
    verificationTests: [
      { id: 'vt-004-01', name: 'Provider Search Smoke Test', status: 'passed', duration: 25, executedAt: daysAgo(40) },
      { id: 'vt-004-02', name: 'Provider Detail Page', status: 'passed', duration: 8, executedAt: daysAgo(40) },
      { id: 'vt-004-03', name: 'Data Sync Verification', status: 'failed', duration: 180, executedAt: daysAgo(40) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-004-01', type: 'monitoring_dashboard', name: 'Dynatrace - Provider Directory', url: 'https://eqip-org.live.dynatrace.com/provider-directory', status: 'active' },
      { id: 'fl-004-02', type: 'log_aggregation', name: 'Splunk - Provider Logs', url: 'https://splunk.eqip-org.com/provider-logs', status: 'active' },
      { id: 'fl-004-03', type: 'incident_management', name: 'ServiceNow - Provider Incidents', url: 'https://eqip-org.service-now.com/provider', status: 'active' },
      { id: 'fl-004-04', type: 'demand_tracking', name: 'Batch Sync Implementation', url: '/demands/dem-012', status: 'in_progress' },
      { id: 'fl-004-05', type: 'demand_tracking', name: 'TLS 1.3 Configuration', url: '/demands/dem-005', status: 'in_progress' },
    ],
    notifications: [
      { id: 'notif-pd-004-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(40), status: 'delivered' },
      { id: 'notif-pd-004-02', type: 'performance_degradation', channel: 'pagerduty', recipient: 'provider-oncall', sentAt: daysAgo(15), status: 'delivered' },
      { id: 'notif-pd-004-03', type: 'incident_reported', channel: 'email', recipient: 'user-011', sentAt: daysAgo(10), status: 'delivered' },
    ],
    notes: 'Production deployment is experiencing degraded performance. Provider search response times exceed SLA during peak hours. Data sync job is failing consistently. Batch sync implementation (dem-012) is in planning to address the root cause.',
    tags: ['production', 'provider', 'degraded', 'performance-issues', 'data-sync-failure'],
    version: 4,
    created_at: daysAgo(40),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-005',
    releaseId: 'rel-005',
    applicationId: 'app-002',
    applicationName: 'Claims Processing',
    segment: 'Claims',
    version: '2024.05.1',
    deploymentType: 'canary',
    status: 'rolled_back',
    deployedAt: daysAgo(60),
    deployedBy: 'user-018',
    environment: 'production',
    incidentCount: 2,
    incidents: [
      {
        id: 'inc-005-01',
        title: 'Claims adjudication engine producing incorrect payment calculations',
        severity: 'critical',
        status: 'resolved',
        reportedAt: daysAndHoursAgo(60, -2),
        resolvedAt: daysAndHoursAgo(60, -4),
        resolutionTimeMinutes: 120,
        rootCause: 'Regression in copay calculation logic introduced by fee schedule update. Copay amounts were doubled for in-network providers.',
        resolution: 'Rolled back to version 2024.05.0. Hotfix applied in version 2024.05.2 with corrected copay calculation and additional unit tests.',
        impactedUsers: 245,
        reportedBy: 'user-012',
        resolvedBy: 'user-017',
      },
      {
        id: 'inc-005-02',
        title: 'Batch claims processing queue backup',
        severity: 'high',
        status: 'resolved',
        reportedAt: daysAndHoursAgo(60, -3),
        resolvedAt: daysAndHoursAgo(60, -4),
        resolutionTimeMinutes: 60,
        rootCause: 'Cascading failure from incorrect adjudication results causing retry storms in the batch processing queue.',
        resolution: 'Resolved by rollback. Queue cleared automatically after rollback completed.',
        impactedUsers: 0,
        reportedBy: 'user-009',
        resolvedBy: 'user-017',
      },
    ],
    rollbackStatus: 'completed',
    rollbackDetails: {
      initiatedAt: daysAndHoursAgo(60, -3),
      completedAt: daysAndHoursAgo(60, -4),
      initiatedBy: 'user-017',
      reason: 'Critical defect in copay calculation logic causing incorrect payment amounts for in-network claims.',
      rolledBackToVersion: '2024.05.0',
      durationMinutes: 45,
      dataRecoveryRequired: true,
      dataRecoveryStatus: 'completed',
      dataRecoveryNotes: '312 claims with incorrect copay amounts were identified and reprocessed with correct calculations.',
      approvedBy: 'user-001',
    },
    performanceMetrics: {
      responseTime: { p50: 0, p95: 0, p99: 0, unit: 'ms', status: 'rolled_back', threshold: 500 },
      throughput: { current: 0, peak: 0, unit: 'req/sec', status: 'rolled_back', threshold: 500 },
      errorRate: { current: 0, unit: '%', status: 'rolled_back', threshold: 1.0 },
      cpuUtilization: { current: 0, peak: 0, unit: '%', status: 'rolled_back', threshold: 80 },
      memoryUtilization: { current: 0, peak: 0, unit: '%', status: 'rolled_back', threshold: 85 },
      latency: { p50: 0, p95: 0, p99: 0, unit: 'ms', status: 'rolled_back', threshold: 400 },
      activeConnections: { current: 0, peak: 0, unit: 'connections', status: 'rolled_back', threshold: 300 },
    },
    healthChecks: [],
    verificationTests: [
      { id: 'vt-005-01', name: 'Claims Intake Smoke Test', status: 'passed', duration: 12, executedAt: daysAgo(60) },
      { id: 'vt-005-02', name: 'Claims Adjudication Verification', status: 'failed', duration: 22, executedAt: daysAndHoursAgo(60, -2) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-005-01', type: 'incident_management', name: 'ServiceNow - INC-2024-0892', url: 'https://eqip-org.service-now.com/incident/INC-2024-0892', status: 'resolved' },
      { id: 'fl-005-02', type: 'post_incident_review', name: 'PIR - Copay Calculation Regression', url: '/reports/pir-2024-05-copay', status: 'completed' },
      { id: 'fl-005-03', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'failed' },
    ],
    notifications: [
      { id: 'notif-pd-005-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(60), status: 'delivered' },
      { id: 'notif-pd-005-02', type: 'incident_critical', channel: 'pagerduty', recipient: 'claims-oncall', sentAt: daysAndHoursAgo(60, -2), status: 'delivered' },
      { id: 'notif-pd-005-03', type: 'rollback_initiated', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAndHoursAgo(60, -3), status: 'delivered' },
      { id: 'notif-pd-005-04', type: 'rollback_completed', channel: 'email', recipient: 'user-001', sentAt: daysAndHoursAgo(60, -4), status: 'delivered' },
    ],
    notes: 'Canary deployment detected critical copay calculation regression within 2 hours. Rollback initiated and completed in 45 minutes. 312 affected claims were reprocessed. Post-incident review completed with 5 action items.',
    tags: ['production', 'claims', 'rolled-back', 'critical-incident', 'canary', 'data-recovery'],
    version: 5,
    created_at: daysAgo(60),
    updated_at: daysAgo(55),
    created_by: 'user-018',
    updated_by: 'user-017',
  },
  {
    id: 'pd-006',
    releaseId: 'rel-003',
    applicationId: 'app-006',
    applicationName: 'Member Portal',
    segment: 'Enrollment',
    version: '2024.05.0',
    deploymentType: 'blue_green',
    status: 'healthy',
    deployedAt: daysAgo(18),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 0,
    incidents: [],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 110, p95: 320, p99: 520, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 340, peak: 480, unit: 'req/sec', status: 'healthy', threshold: 300 },
      errorRate: { current: 0.03, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 38, peak: 55, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 50, peak: 62, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 80, p95: 220, p99: 400, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 120, peak: 175, unit: 'connections', status: 'healthy', threshold: 250 },
    },
    healthChecks: [
      { id: 'hc-pd-006-01', name: 'API Gateway', status: 'passed', responseTimeMs: 75, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-006-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 28, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-006-03', name: 'Eligibility Service', status: 'passed', responseTimeMs: 75, lastChecked: daysAndHoursAgo(0, 1) },
      { id: 'hc-pd-006-04', name: 'Notification Service', status: 'passed', responseTimeMs: 40, lastChecked: daysAndHoursAgo(0, 1) },
    ],
    verificationTests: [
      { id: 'vt-006-01', name: 'Enrollment Flow Smoke Test', status: 'passed', duration: 18, executedAt: daysAgo(18) },
      { id: 'vt-006-02', name: 'Eligibility Verification', status: 'passed', duration: 8, executedAt: daysAgo(18) },
      { id: 'vt-006-03', name: 'Profile Update Verification', status: 'passed', duration: 6, executedAt: daysAgo(18) },
      { id: 'vt-006-04', name: 'Accessibility Verification', status: 'passed', duration: 12, executedAt: daysAgo(18) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-006-01', type: 'monitoring_dashboard', name: 'Dynatrace - Member Portal', url: 'https://eqip-org.live.dynatrace.com/member-portal', status: 'active' },
      { id: 'fl-006-02', type: 'log_aggregation', name: 'Splunk - Member Portal Logs', url: 'https://splunk.eqip-org.com/member-portal-logs', status: 'active' },
      { id: 'fl-006-03', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
      { id: 'fl-006-04', type: 'user_feedback', name: 'Enrollment Abandonment Rate Tracker', url: '/metrics/enrollment-abandonment', status: 'active' },
    ],
    notifications: [
      { id: 'notif-pd-006-01', type: 'deployment_success', channel: 'teams', recipient: 'Release Updates', sentAt: daysAgo(18), status: 'delivered' },
      { id: 'notif-pd-006-02', type: 'verification_complete', channel: 'email', recipient: 'user-014', sentAt: daysAgo(18), status: 'delivered' },
    ],
    notes: 'Blue-green deployment completed with zero downtime. Enrollment abandonment rate decreased from 35% to 18% after deployment, confirming the enrollment flow redesign success.',
    tags: ['production', 'enrollment', 'successful', 'blue-green', 'zero-downtime'],
    version: 1,
    created_at: daysAgo(18),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-007',
    releaseId: 'rel-010',
    applicationId: 'app-016',
    applicationName: 'Insurance Claims Portal',
    segment: 'Insurance Claims',
    version: '2024.05.0',
    deploymentType: 'rolling',
    status: 'healthy',
    deployedAt: daysAgo(30),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 0,
    incidents: [],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 130, p95: 350, p99: 560, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 210, peak: 310, unit: 'req/sec', status: 'healthy', threshold: 200 },
      errorRate: { current: 0.04, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 40, peak: 58, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 52, peak: 65, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 95, p95: 240, p99: 430, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 88, peak: 135, unit: 'connections', status: 'healthy', threshold: 200 },
    },
    healthChecks: [
      { id: 'hc-pd-007-01', name: 'API Gateway', status: 'passed', responseTimeMs: 80, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-007-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 24, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-007-03', name: 'File Storage Service', status: 'passed', responseTimeMs: 110, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-007-04', name: 'OCR Processing Service', status: 'passed', responseTimeMs: 250, lastChecked: daysAndHoursAgo(0, 2) },
    ],
    verificationTests: [
      { id: 'vt-007-01', name: 'Claims Intake Smoke Test', status: 'passed', duration: 10, executedAt: daysAgo(30) },
      { id: 'vt-007-02', name: 'Photo Upload Verification', status: 'passed', duration: 15, executedAt: daysAgo(30) },
      { id: 'vt-007-03', name: 'OCR Processing Verification', status: 'passed', duration: 22, executedAt: daysAgo(30) },
      { id: 'vt-007-04', name: 'Claims Status Tracking', status: 'passed', duration: 8, executedAt: daysAgo(30) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-007-01', type: 'monitoring_dashboard', name: 'Dynatrace - Insurance Claims Portal', url: 'https://eqip-org.live.dynatrace.com/insurance-claims', status: 'active' },
      { id: 'fl-007-02', type: 'log_aggregation', name: 'Splunk - Insurance Claims Logs', url: 'https://splunk.eqip-org.com/insurance-claims-logs', status: 'active' },
      { id: 'fl-007-03', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-007-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(30), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. Photo upload and OCR processing features are functioning as expected. Average OCR processing time: 12 seconds.',
    tags: ['production', 'insurance-claims', 'successful', 'photo-upload', 'ocr'],
    version: 1,
    created_at: daysAgo(30),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-008',
    releaseId: 'rel-008',
    applicationId: 'app-012',
    applicationName: 'Underwriting Engine',
    segment: 'Underwriting',
    version: '2024.05.0',
    deploymentType: 'rolling',
    status: 'healthy',
    deployedAt: daysAgo(28),
    deployedBy: 'user-018',
    environment: 'production',
    incidentCount: 1,
    incidents: [
      {
        id: 'inc-008-01',
        title: 'Risk scoring model v2 edge case producing incorrect score for thin-file applicants',
        severity: 'medium',
        status: 'resolved',
        reportedAt: daysAgo(25),
        resolvedAt: daysAgo(23),
        resolutionTimeMinutes: 2880,
        rootCause: 'Risk scoring model v2 did not handle the thin-file credit indicator correctly. Applicants with no credit history received a default score of 0 instead of being flagged for manual review.',
        resolution: 'Hotfix applied to handle thin-file indicator. Applicants with no credit history are now correctly flagged for manual underwriter review with a neutral risk score.',
        impactedUsers: 8,
        reportedBy: 'user-005',
        resolvedBy: 'user-011',
      },
    ],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 85, p95: 220, p99: 380, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 150, peak: 220, unit: 'req/sec', status: 'healthy', threshold: 100 },
      errorRate: { current: 0.01, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 35, peak: 52, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 48, peak: 60, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 60, p95: 160, p99: 300, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 55, peak: 85, unit: 'connections', status: 'healthy', threshold: 150 },
    },
    healthChecks: [
      { id: 'hc-pd-008-01', name: 'Risk Scoring API', status: 'passed', responseTimeMs: 95, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-008-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 22, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-008-03', name: 'Drools Engine', status: 'passed', responseTimeMs: 110, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-008-04', name: 'Credit Data Service', status: 'passed', responseTimeMs: 180, lastChecked: daysAndHoursAgo(0, 2) },
    ],
    verificationTests: [
      { id: 'vt-008-01', name: 'Risk Scoring API Smoke Test', status: 'passed', duration: 8, executedAt: daysAgo(28) },
      { id: 'vt-008-02', name: 'Decision Rules Verification', status: 'passed', duration: 12, executedAt: daysAgo(28) },
      { id: 'vt-008-03', name: 'Credit Data Integration', status: 'passed', duration: 10, executedAt: daysAgo(28) },
      { id: 'vt-008-04', name: 'Audit Trail Verification', status: 'passed', duration: 6, executedAt: daysAgo(28) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-008-01', type: 'monitoring_dashboard', name: 'Dynatrace - Underwriting Engine', url: 'https://eqip-org.live.dynatrace.com/underwriting', status: 'active' },
      { id: 'fl-008-02', type: 'log_aggregation', name: 'Splunk - Underwriting Logs', url: 'https://splunk.eqip-org.com/underwriting-logs', status: 'active' },
      { id: 'fl-008-03', type: 'incident_management', name: 'ServiceNow - INC-2024-1045', url: 'https://eqip-org.service-now.com/incident/INC-2024-1045', status: 'resolved' },
    ],
    notifications: [
      { id: 'notif-pd-008-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(28), status: 'delivered' },
      { id: 'notif-pd-008-02', type: 'incident_reported', channel: 'email', recipient: 'user-011', sentAt: daysAgo(25), status: 'delivered' },
      { id: 'notif-pd-008-03', type: 'incident_resolved', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(23), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. One medium severity edge case identified in risk scoring model v2 for thin-file applicants. Hotfix applied within 48 hours. 8 affected applications were manually reviewed and corrected.',
    tags: ['production', 'underwriting', 'incident-resolved', 'risk-scoring', 'hotfix'],
    version: 3,
    created_at: daysAgo(28),
    updated_at: daysAgo(23),
    created_by: 'user-018',
    updated_by: 'user-011',
  },
  {
    id: 'pd-009',
    releaseId: 'rel-006',
    applicationId: 'app-010',
    applicationName: 'Rx Platform',
    segment: 'Pharmacy',
    version: '2024.06.0',
    deploymentType: 'rolling',
    status: 'healthy',
    deployedAt: daysAgo(22),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 0,
    incidents: [],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 100, p95: 290, p99: 480, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 280, peak: 420, unit: 'req/sec', status: 'healthy', threshold: 250 },
      errorRate: { current: 0.02, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 42, peak: 60, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 55, peak: 68, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 75, p95: 200, p99: 380, unit: 'ms', status: 'healthy', threshold: 400 },
      activeConnections: { current: 105, peak: 160, unit: 'connections', status: 'healthy', threshold: 250 },
    },
    healthChecks: [
      { id: 'hc-pd-009-01', name: 'API Gateway', status: 'passed', responseTimeMs: 78, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-009-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 26, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-009-03', name: 'Kafka Broker', status: 'passed', responseTimeMs: 15, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-009-04', name: 'Formulary API', status: 'passed', responseTimeMs: 90, lastChecked: daysAndHoursAgo(0, 2) },
    ],
    verificationTests: [
      { id: 'vt-009-01', name: 'Formulary Tier Management', status: 'passed', duration: 8, executedAt: daysAgo(22) },
      { id: 'vt-009-02', name: 'Prescription Processing', status: 'passed', duration: 12, executedAt: daysAgo(22) },
      { id: 'vt-009-03', name: 'Pharmacy Network Validation', status: 'passed', duration: 6, executedAt: daysAgo(22) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-009-01', type: 'monitoring_dashboard', name: 'Dynatrace - Rx Platform', url: 'https://eqip-org.live.dynatrace.com/rx-platform', status: 'active' },
      { id: 'fl-009-02', type: 'log_aggregation', name: 'Splunk - Rx Platform Logs', url: 'https://splunk.eqip-org.com/rx-platform-logs', status: 'active' },
      { id: 'fl-009-03', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-009-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(22), status: 'delivered' },
      { id: 'notif-pd-009-02', type: 'verification_complete', channel: 'email', recipient: 'user-012', sentAt: daysAgo(22), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. Formulary tier management and prescription processing features are functioning as expected. No incidents reported.',
    tags: ['production', 'pharmacy', 'successful', 'formulary'],
    version: 1,
    created_at: daysAgo(22),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'pd-010',
    releaseId: 'rel-002',
    applicationId: 'app-004',
    applicationName: 'Payment Gateway',
    segment: 'Billing',
    version: '2024.04.2',
    deploymentType: 'rolling',
    status: 'healthy',
    deployedAt: daysAgo(25),
    deployedBy: 'user-017',
    environment: 'production',
    incidentCount: 1,
    incidents: [
      {
        id: 'inc-010-01',
        title: 'Payment processor timeout during peak hours',
        severity: 'medium',
        status: 'resolved',
        reportedAt: daysAgo(22),
        resolvedAt: daysAgo(21),
        resolutionTimeMinutes: 1440,
        rootCause: 'External payment processor experienced elevated response times during peak hours, causing timeouts in the payment gateway. The gateway timeout was set to 15 seconds, which was insufficient during peak load.',
        resolution: 'Increased payment processor timeout from 15 to 30 seconds. Implemented circuit breaker pattern with fallback to queued processing for timeout scenarios.',
        impactedUsers: 42,
        reportedBy: 'user-013',
        resolvedBy: 'user-020',
      },
    ],
    rollbackStatus: 'not_required',
    rollbackDetails: null,
    performanceMetrics: {
      responseTime: { p50: 150, p95: 420, p99: 680, unit: 'ms', status: 'healthy', threshold: 500 },
      throughput: { current: 380, peak: 520, unit: 'req/sec', status: 'healthy', threshold: 350 },
      errorRate: { current: 0.08, unit: '%', status: 'healthy', threshold: 1.0 },
      cpuUtilization: { current: 50, peak: 68, unit: '%', status: 'healthy', threshold: 80 },
      memoryUtilization: { current: 62, peak: 72, unit: '%', status: 'healthy', threshold: 85 },
      latency: { p50: 110, p95: 320, p99: 550, unit: 'ms', status: 'healthy', threshold: 500 },
      activeConnections: { current: 165, peak: 230, unit: 'connections', status: 'healthy', threshold: 300 },
    },
    healthChecks: [
      { id: 'hc-pd-010-01', name: 'API Gateway', status: 'passed', responseTimeMs: 88, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-010-02', name: 'Database Connectivity', status: 'passed', responseTimeMs: 22, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-010-03', name: 'Payment Processor', status: 'passed', responseTimeMs: 180, lastChecked: daysAndHoursAgo(0, 2) },
      { id: 'hc-pd-010-04', name: 'Redis Cache', status: 'passed', responseTimeMs: 5, lastChecked: daysAndHoursAgo(0, 2) },
    ],
    verificationTests: [
      { id: 'vt-010-01', name: 'Payment Processing Smoke Test', status: 'passed', duration: 15, executedAt: daysAgo(25) },
      { id: 'vt-010-02', name: 'Multi-Currency Verification', status: 'passed', duration: 12, executedAt: daysAgo(25) },
      { id: 'vt-010-03', name: 'Refund Processing Verification', status: 'passed', duration: 10, executedAt: daysAgo(25) },
    ],
    feedbackLoopLinks: [
      { id: 'fl-010-01', type: 'monitoring_dashboard', name: 'Dynatrace - Payment Gateway', url: 'https://eqip-org.live.dynatrace.com/payment-gateway', status: 'active' },
      { id: 'fl-010-02', type: 'log_aggregation', name: 'Splunk - Payment Logs', url: 'https://splunk.eqip-org.com/payment-logs', status: 'active' },
      { id: 'fl-010-03', type: 'incident_management', name: 'ServiceNow - Payment Incidents', url: 'https://eqip-org.service-now.com/payments', status: 'active' },
      { id: 'fl-010-04', type: 'quality_gate', name: 'Post-Deployment Verification Gate', url: '/quality-gates/qg-016', status: 'passed' },
    ],
    notifications: [
      { id: 'notif-pd-010-01', type: 'deployment_success', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(25), status: 'delivered' },
      { id: 'notif-pd-010-02', type: 'incident_reported', channel: 'pagerduty', recipient: 'billing-oncall', sentAt: daysAgo(22), status: 'delivered' },
      { id: 'notif-pd-010-03', type: 'incident_resolved', channel: 'slack', recipient: '#eqip-releases', sentAt: daysAgo(21), status: 'delivered' },
    ],
    notes: 'Deployment completed successfully. One medium severity incident related to external payment processor timeouts during peak hours. Circuit breaker pattern implemented as remediation.',
    tags: ['production', 'billing', 'incident-resolved', 'payment-processor', 'circuit-breaker'],
    version: 2,
    created_at: daysAgo(25),
    updated_at: daysAgo(21),
    created_by: 'user-017',
    updated_by: 'user-020',
  },
];

export default postDeployments;

/**
 * Get all mock post-deployment events.
 * @returns {Array<object>} Array of post-deployment event objects.
 */
export function getAllPostDeployments() {
  return [...postDeployments];
}

/**
 * Find a post-deployment event by ID.
 * @param {string} id - The post-deployment event ID to find.
 * @returns {object|null} The post-deployment event object, or null if not found.
 */
export function getPostDeploymentById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return postDeployments.find((pd) => pd.id === id) || null;
}

/**
 * Get all post-deployment events for a specific release.
 * @param {string} releaseId - The release ID to filter by.
 * @returns {Array<object>} Array of post-deployment events for the specified release.
 */
export function getPostDeploymentsByReleaseId(releaseId) {
  if (!releaseId || typeof releaseId !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.releaseId === releaseId);
}

/**
 * Get all post-deployment events for a specific application.
 * @param {string} applicationId - The application ID to filter by.
 * @returns {Array<object>} Array of post-deployment events for the specified application.
 */
export function getPostDeploymentsByApplicationId(applicationId) {
  if (!applicationId || typeof applicationId !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.applicationId === applicationId);
}

/**
 * Get all post-deployment events with a specific status.
 * @param {string} status - The status to filter by (e.g., 'healthy', 'degraded', 'rolled_back', 'monitoring').
 * @returns {Array<object>} Array of post-deployment events with the specified status.
 */
export function getPostDeploymentsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.status === status);
}

/**
 * Get all post-deployment events within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of post-deployment events within the specified segment.
 */
export function getPostDeploymentsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.segment === segment);
}

/**
 * Get all post-deployment events with a specific deployment type.
 * @param {string} deploymentType - The deployment type to filter by (e.g., 'rolling', 'blue_green', 'canary').
 * @returns {Array<object>} Array of post-deployment events with the specified deployment type.
 */
export function getPostDeploymentsByDeploymentType(deploymentType) {
  if (!deploymentType || typeof deploymentType !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.deploymentType === deploymentType);
}

/**
 * Get all post-deployment events with a specific rollback status.
 * @param {string} rollbackStatus - The rollback status to filter by (e.g., 'not_required', 'completed', 'in_progress').
 * @returns {Array<object>} Array of post-deployment events with the specified rollback status.
 */
export function getPostDeploymentsByRollbackStatus(rollbackStatus) {
  if (!rollbackStatus || typeof rollbackStatus !== 'string') {
    return [];
  }
  return postDeployments.filter((pd) => pd.rollbackStatus === rollbackStatus);
}

/**
 * Get all post-deployment events that have incidents.
 * @returns {Array<object>} Array of post-deployment events with at least one incident.
 */
export function getPostDeploymentsWithIncidents() {
  return postDeployments.filter(
    (pd) => typeof pd.incidentCount === 'number' && pd.incidentCount > 0,
  );
}

/**
 * Get all post-deployment events that were rolled back.
 * @returns {Array<object>} Array of post-deployment events with rollback status 'completed'.
 */
export function getRolledBackDeployments() {
  return postDeployments.filter((pd) => pd.rollbackStatus === 'completed');
}

/**
 * Get all post-deployment events with degraded status.
 * @returns {Array<object>} Array of post-deployment events with 'degraded' status.
 */
export function getDegradedDeployments() {
  return postDeployments.filter((pd) => pd.status === 'degraded');
}

/**
 * Get all post-deployment events with failed health checks.
 * @returns {Array<object>} Array of post-deployment events that have at least one failed health check.
 */
export function getPostDeploymentsWithFailedHealthChecks() {
  return postDeployments.filter(
    (pd) =>
      Array.isArray(pd.healthChecks) &&
      pd.healthChecks.some((hc) => hc.status === 'failed'),
  );
}

/**
 * Get all post-deployment events with failed verification tests.
 * @returns {Array<object>} Array of post-deployment events that have at least one failed verification test.
 */
export function getPostDeploymentsWithFailedVerificationTests() {
  return postDeployments.filter(
    (pd) =>
      Array.isArray(pd.verificationTests) &&
      pd.verificationTests.some((vt) => vt.status === 'failed'),
  );
}

/**
 * Get distinct statuses from the post-deployment data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < postDeployments.length; i++) {
    if (postDeployments[i].status) {
      statuses.add(postDeployments[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct deployment types from the post-deployment data.
 * @returns {string[]} Array of unique deployment type strings.
 */
export function getDistinctDeploymentTypes() {
  const types = new Set();
  for (let i = 0; i < postDeployments.length; i++) {
    if (postDeployments[i].deploymentType) {
      types.add(postDeployments[i].deploymentType);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct segments from the post-deployment data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < postDeployments.length; i++) {
    if (postDeployments[i].segment) {
      segments.add(postDeployments[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct rollback statuses from the post-deployment data.
 * @returns {string[]} Array of unique rollback status strings.
 */
export function getDistinctRollbackStatuses() {
  const statuses = new Set();
  for (let i = 0; i < postDeployments.length; i++) {
    if (postDeployments[i].rollbackStatus) {
      statuses.add(postDeployments[i].rollbackStatus);
    }
  }
  return [...statuses].sort();
}

/**
 * Get a count of post-deployment events grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getPostDeploymentCountByStatus() {
  const counts = {};
  for (let i = 0; i < postDeployments.length; i++) {
    const status = postDeployments[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of post-deployment events grouped by deployment type.
 * @returns {object} Object with deployment type keys and count values.
 */
export function getPostDeploymentCountByDeploymentType() {
  const counts = {};
  for (let i = 0; i < postDeployments.length; i++) {
    const type = postDeployments[i].deploymentType;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of post-deployment events grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getPostDeploymentCountBySegment() {
  const counts = {};
  for (let i = 0; i < postDeployments.length; i++) {
    const segment = postDeployments[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of post-deployment events grouped by rollback status.
 * @returns {object} Object with rollback status keys and count values.
 */
export function getPostDeploymentCountByRollbackStatus() {
  const counts = {};
  for (let i = 0; i < postDeployments.length; i++) {
    const rollbackStatus = postDeployments[i].rollbackStatus;
    counts[rollbackStatus] = (counts[rollbackStatus] || 0) + 1;
  }
  return counts;
}

/**
 * Get the total number of incidents across all post-deployment events.
 * @returns {number} Total incident count.
 */
export function getTotalIncidentCount() {
  let total = 0;
  for (let i = 0; i < postDeployments.length; i++) {
    total += postDeployments[i].incidentCount || 0;
  }
  return total;
}

/**
 * Get the total number of failed health checks across all post-deployment events.
 * @returns {number} Total count of failed health checks.
 */
export function getTotalFailedHealthChecks() {
  let count = 0;
  for (let i = 0; i < postDeployments.length; i++) {
    if (Array.isArray(postDeployments[i].healthChecks)) {
      for (let j = 0; j < postDeployments[i].healthChecks.length; j++) {
        if (postDeployments[i].healthChecks[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of failed verification tests across all post-deployment events.
 * @returns {number} Total count of failed verification tests.
 */
export function getTotalFailedVerificationTests() {
  let count = 0;
  for (let i = 0; i < postDeployments.length; i++) {
    if (Array.isArray(postDeployments[i].verificationTests)) {
      for (let j = 0; j < postDeployments[i].verificationTests.length; j++) {
        if (postDeployments[i].verificationTests[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get all incidents across all post-deployment events.
 * @returns {Array<object>} Array of all incident objects with parent deployment context.
 */
export function getAllIncidents() {
  const allIncidents = [];
  for (let i = 0; i < postDeployments.length; i++) {
    const pd = postDeployments[i];
    if (Array.isArray(pd.incidents)) {
      for (let j = 0; j < pd.incidents.length; j++) {
        allIncidents.push({
          ...pd.incidents[j],
          deploymentId: pd.id,
          releaseId: pd.releaseId,
          applicationName: pd.applicationName,
          segment: pd.segment,
        });
      }
    }
  }
  return allIncidents;
}

/**
 * Get all open incidents across all post-deployment events.
 * @returns {Array<object>} Array of open incident objects with parent deployment context.
 */
export function getOpenIncidents() {
  return getAllIncidents().filter(
    (inc) => inc.status === 'open' || inc.status === 'in_progress',
  );
}

/**
 * Get all resolved incidents across all post-deployment events.
 * @returns {Array<object>} Array of resolved incident objects with parent deployment context.
 */
export function getResolvedIncidents() {
  return getAllIncidents().filter((inc) => inc.status === 'resolved');
}

/**
 * Get post-deployment events sorted by deployedAt in descending order (most recent first).
 * @param {number} [limit] - Optional maximum number of events to return.
 * @returns {Array<object>} Array of post-deployment events sorted by deployment date.
 */
export function getRecentPostDeployments(limit) {
  const sorted = [...postDeployments].sort((a, b) => {
    const dateA = new Date(a.deployedAt).getTime();
    const dateB = new Date(b.deployedAt).getTime();
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
 * Find a post-deployment event by application name (case-insensitive).
 * @param {string} applicationName - The application name to search for.
 * @returns {Array<object>} Array of matching post-deployment event objects.
 */
export function getPostDeploymentsByApplicationName(applicationName) {
  if (!applicationName || typeof applicationName !== 'string') {
    return [];
  }
  const nameLower = applicationName.toLowerCase();
  return postDeployments.filter(
    (pd) => pd.applicationName && pd.applicationName.toLowerCase() === nameLower,
  );
}

/**
 * Calculate the average incident count across all post-deployment events.
 * @returns {number} The average incident count, or 0 if no events exist.
 */
export function getAverageIncidentCount() {
  if (postDeployments.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < postDeployments.length; i++) {
    total += postDeployments[i].incidentCount || 0;
  }
  return Math.round((total / postDeployments.length) * 100) / 100;
}

/**
 * Calculate the rollback rate across all post-deployment events.
 * @returns {number} The rollback rate as a percentage (0-100), or 0 if no events exist.
 */
export function getRollbackRate() {
  if (postDeployments.length === 0) {
    return 0;
  }
  const rolledBack = postDeployments.filter((pd) => pd.rollbackStatus === 'completed').length;
  return Math.round((rolledBack / postDeployments.length) * 10000) / 100;
}

/**
 * Get a comprehensive summary of post-deployment metrics.
 * @returns {object} Summary object with post-deployment metrics.
 */
export function getPostDeploymentSummary() {
  const total = postDeployments.length;
  let healthy = 0;
  let degraded = 0;
  let rolledBack = 0;
  let monitoring = 0;
  let totalIncidents = 0;
  let openIncidents = 0;
  let resolvedIncidents = 0;
  let criticalIncidents = 0;
  let totalRollbacks = 0;
  let totalFailedHealthChecks = 0;
  let totalFailedVerifications = 0;
  let rollingDeployments = 0;
  let blueGreenDeployments = 0;
  let canaryDeployments = 0;

  for (let i = 0; i < postDeployments.length; i++) {
    const pd = postDeployments[i];

    if (pd.status === 'healthy') healthy += 1;
    else if (pd.status === 'degraded') degraded += 1;
    else if (pd.status === 'rolled_back') rolledBack += 1;
    else if (pd.status === 'monitoring') monitoring += 1;

    totalIncidents += pd.incidentCount || 0;

    if (pd.rollbackStatus === 'completed') totalRollbacks += 1;

    if (pd.deploymentType === 'rolling') rollingDeployments += 1;
    else if (pd.deploymentType === 'blue_green') blueGreenDeployments += 1;
    else if (pd.deploymentType === 'canary') canaryDeployments += 1;

    if (Array.isArray(pd.incidents)) {
      for (let j = 0; j < pd.incidents.length; j++) {
        const inc = pd.incidents[j];
        if (inc.status === 'open' || inc.status === 'in_progress') openIncidents += 1;
        else if (inc.status === 'resolved') resolvedIncidents += 1;
        if (inc.severity === 'critical') criticalIncidents += 1;
      }
    }

    if (Array.isArray(pd.healthChecks)) {
      for (let j = 0; j < pd.healthChecks.length; j++) {
        if (pd.healthChecks[j].status === 'failed') totalFailedHealthChecks += 1;
      }
    }

    if (Array.isArray(pd.verificationTests)) {
      for (let j = 0; j < pd.verificationTests.length; j++) {
        if (pd.verificationTests[j].status === 'failed') totalFailedVerifications += 1;
      }
    }
  }

  return {
    total,
    healthy,
    degraded,
    rolledBack,
    monitoring,
    totalIncidents,
    openIncidents,
    resolvedIncidents,
    criticalIncidents,
    totalRollbacks,
    rollbackRate: total > 0 ? Math.round((totalRollbacks / total) * 10000) / 100 : 0,
    totalFailedHealthChecks,
    totalFailedVerifications,
    rollingDeployments,
    blueGreenDeployments,
    canaryDeployments,
    successRate: total > 0 ? Math.round((healthy / total) * 10000) / 100 : 0,
  };
}