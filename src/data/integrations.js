import { v4 as uuidv4 } from 'uuid';

/**
 * @module integrations
 * Mock integration data seed for eQIP Quality Intelligence.
 * 20 external system integrations with all PRD-specified fields including id, name, type,
 * status, syncFrequency, lastSync, errorCount, resiliencePattern, configuration,
 * healthChecks, metrics, and audit fields.
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
 * Mock integration data array with 20 external system integrations.
 * Each integration includes id, name, type, category, status, syncFrequency,
 * lastSync, nextSync, errorCount, resiliencePattern, configuration, healthChecks,
 * syncHistory, metrics, owner, segment, tags, version, and audit fields.
 * @type {Array<object>}
 */
const integrations = [
  {
    id: 'int-001',
    name: 'Azure DevOps',
    type: 'project_management',
    category: 'ALM',
    description: 'Azure DevOps integration for work item tracking, boards, repos, and pipeline status synchronization.',
    status: 'connected',
    syncFrequency: 'every_15_minutes',
    lastSync: daysAndHoursAgo(0, 1),
    nextSync: daysAgo(-0.01),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://dev.azure.com/eqip-org',
      project: 'eQIP-Quality',
      apiVersion: '7.1',
      authMethod: 'oauth2',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 100,
      fieldMappings: {
        workItemType: 'System.WorkItemType',
        state: 'System.State',
        assignedTo: 'System.AssignedTo',
        priority: 'Microsoft.VSTS.Common.Priority',
      },
    },
    healthChecks: [
      { id: 'hc-int-001-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 120 },
      { id: 'hc-int-001-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 85 },
      { id: 'hc-int-001-03', name: 'Data Sync Validation', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 340 },
    ],
    syncHistory: [
      { id: 'sh-001-01', date: daysAndHoursAgo(0, 1), status: 'success', duration: 12, recordsSynced: 245, errors: 0 },
      { id: 'sh-001-02', date: daysAndHoursAgo(0, 2), status: 'success', duration: 14, recordsSynced: 238, errors: 0 },
      { id: 'sh-001-03', date: daysAndHoursAgo(0, 3), status: 'success', duration: 11, recordsSynced: 240, errors: 0 },
    ],
    metrics: {
      totalSyncs: 1420,
      successfulSyncs: 1415,
      failedSyncs: 5,
      averageSyncDuration: 13,
      totalRecordsSynced: 342800,
      uptime: 99.65,
      lastErrorDate: daysAgo(12),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal'],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['alm', 'work-items', 'pipelines', 'repos'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'int-002',
    name: 'qTest',
    type: 'test_management',
    category: 'Testing',
    description: 'qTest integration for test case management, test execution tracking, and defect linkage.',
    status: 'connected',
    syncFrequency: 'every_30_minutes',
    lastSync: daysAndHoursAgo(0, 1),
    nextSync: daysAgo(-0.02),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://eqip.qtestnet.com/api/v3',
      projectId: 'PRJ-EQIP-001',
      apiVersion: 'v3',
      authMethod: 'api_token',
      timeout: 45000,
      retryAttempts: 3,
      retryDelay: 10000,
      batchSize: 200,
      fieldMappings: {
        testCaseId: 'id',
        testCaseName: 'name',
        status: 'status',
        priority: 'priority',
      },
    },
    healthChecks: [
      { id: 'hc-int-002-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 180 },
      { id: 'hc-int-002-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 95 },
      { id: 'hc-int-002-03', name: 'Test Case Sync', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 520 },
    ],
    syncHistory: [
      { id: 'sh-002-01', date: daysAndHoursAgo(0, 1), status: 'success', duration: 28, recordsSynced: 520, errors: 0 },
      { id: 'sh-002-02', date: daysAndHoursAgo(0, 2), status: 'success', duration: 30, recordsSynced: 518, errors: 0 },
      { id: 'sh-002-03', date: daysAndHoursAgo(0, 3), status: 'success', duration: 26, recordsSynced: 515, errors: 0 },
    ],
    metrics: {
      totalSyncs: 980,
      successfulSyncs: 975,
      failedSyncs: 5,
      averageSyncDuration: 28,
      totalRecordsSynced: 508600,
      uptime: 99.49,
      lastErrorDate: daysAgo(18),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    owner: 'user-008',
    segment: 'Enterprise',
    tags: ['test-management', 'test-cases', 'executions', 'defects'],
    version: 4,
    created_at: daysAgo(350),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'user-008',
  },
  {
    id: 'int-003',
    name: 'Jira',
    type: 'project_management',
    category: 'ALM',
    description: 'Jira integration for issue tracking, sprint management, and backlog synchronization across all segments.',
    status: 'connected',
    syncFrequency: 'every_15_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.01),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://eqip-org.atlassian.net',
      projectKeys: ['EQIP', 'CLM', 'BIL', 'ENR', 'PRV', 'PHR'],
      apiVersion: '3',
      authMethod: 'oauth2',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 100,
      fieldMappings: {
        issueType: 'issuetype',
        status: 'status',
        assignee: 'assignee',
        priority: 'priority',
        sprint: 'sprint',
      },
    },
    healthChecks: [
      { id: 'hc-int-003-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 95 },
      { id: 'hc-int-003-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 72 },
      { id: 'hc-int-003-03', name: 'Webhook Listener', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 45 },
    ],
    syncHistory: [
      { id: 'sh-003-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 18, recordsSynced: 380, errors: 0 },
      { id: 'sh-003-02', date: daysAndHoursAgo(0, 1), status: 'success', duration: 20, recordsSynced: 375, errors: 0 },
      { id: 'sh-003-03', date: daysAndHoursAgo(0, 2), status: 'success', duration: 17, recordsSynced: 382, errors: 0 },
    ],
    metrics: {
      totalSyncs: 2100,
      successfulSyncs: 2095,
      failedSyncs: 5,
      averageSyncDuration: 18,
      totalRecordsSynced: 798000,
      uptime: 99.76,
      lastErrorDate: daysAgo(22),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager'],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['alm', 'issues', 'sprints', 'backlog'],
    version: 6,
    created_at: daysAgo(365),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'int-004',
    name: 'Jira Align',
    type: 'portfolio_management',
    category: 'ALM',
    description: 'Jira Align integration for enterprise agile planning, portfolio management, and strategic alignment tracking.',
    status: 'connected',
    syncFrequency: 'hourly',
    lastSync: daysAndHoursAgo(0, 1),
    nextSync: daysAgo(-0.04),
    errorCount: 1,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://eqip-org.jiraalign.com/rest/align/api/2',
      instanceId: 'EQIP-ALIGN-001',
      apiVersion: '2',
      authMethod: 'api_token',
      timeout: 60000,
      retryAttempts: 5,
      retryDelay: 15000,
      batchSize: 50,
      fieldMappings: {
        epic: 'epicId',
        feature: 'featureId',
        program: 'programId',
        theme: 'themeId',
      },
    },
    healthChecks: [
      { id: 'hc-int-004-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 250 },
      { id: 'hc-int-004-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 140 },
      { id: 'hc-int-004-03', name: 'Portfolio Sync', status: 'warning', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 1800 },
    ],
    syncHistory: [
      { id: 'sh-004-01', date: daysAndHoursAgo(0, 1), status: 'success', duration: 45, recordsSynced: 120, errors: 0 },
      { id: 'sh-004-02', date: daysAndHoursAgo(0, 2), status: 'partial', duration: 52, recordsSynced: 115, errors: 1 },
      { id: 'sh-004-03', date: daysAndHoursAgo(0, 3), status: 'success', duration: 42, recordsSynced: 118, errors: 0 },
    ],
    metrics: {
      totalSyncs: 620,
      successfulSyncs: 612,
      failedSyncs: 8,
      averageSyncDuration: 44,
      totalRecordsSynced: 73200,
      uptime: 98.71,
      lastErrorDate: daysAgo(3),
    },
    applicableApplications: ['EQIP Core'],
    owner: 'user-011',
    segment: 'Enterprise',
    tags: ['portfolio', 'strategic-alignment', 'enterprise-agile'],
    version: 3,
    created_at: daysAgo(300),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'int-005',
    name: 'GitHub',
    type: 'source_control',
    category: 'DevOps',
    description: 'GitHub integration for source code repository management, pull request tracking, and code review status synchronization.',
    status: 'connected',
    syncFrequency: 'every_5_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.003),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://api.github.com',
      organization: 'eqip-org',
      apiVersion: '2022-11-28',
      authMethod: 'github_app',
      timeout: 20000,
      retryAttempts: 3,
      retryDelay: 3000,
      batchSize: 100,
      webhookSecret: '***',
      fieldMappings: {
        repository: 'repo',
        pullRequest: 'pull_request',
        commit: 'commit',
        branch: 'ref',
      },
    },
    healthChecks: [
      { id: 'hc-int-005-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 65 },
      { id: 'hc-int-005-02', name: 'Webhook Delivery', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 30 },
      { id: 'hc-int-005-03', name: 'Rate Limit Check', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 15 },
    ],
    syncHistory: [
      { id: 'sh-005-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 5, recordsSynced: 42, errors: 0 },
      { id: 'sh-005-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 4, recordsSynced: 38, errors: 0 },
      { id: 'sh-005-03', date: daysAndHoursAgo(0, 0), status: 'success', duration: 6, recordsSynced: 45, errors: 0 },
    ],
    metrics: {
      totalSyncs: 5200,
      successfulSyncs: 5198,
      failedSyncs: 2,
      averageSyncDuration: 5,
      totalRecordsSynced: 218400,
      uptime: 99.96,
      lastErrorDate: daysAgo(45),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Member Portal', 'Compliance Dashboard'],
    owner: 'user-019',
    segment: 'Enterprise',
    tags: ['source-control', 'pull-requests', 'code-review', 'webhooks'],
    version: 4,
    created_at: daysAgo(360),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'int-006',
    name: 'GitLab',
    type: 'source_control',
    category: 'DevOps',
    description: 'GitLab integration for source code management, CI/CD pipeline monitoring, and merge request tracking.',
    status: 'connected',
    syncFrequency: 'every_5_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.003),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://gitlab.eqip-org.com/api/v4',
      groupId: 'eqip-quality',
      apiVersion: 'v4',
      authMethod: 'oauth2',
      timeout: 20000,
      retryAttempts: 3,
      retryDelay: 3000,
      batchSize: 100,
      fieldMappings: {
        project: 'project_id',
        mergeRequest: 'merge_request_iid',
        pipeline: 'pipeline_id',
        job: 'job_id',
      },
    },
    healthChecks: [
      { id: 'hc-int-006-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 78 },
      { id: 'hc-int-006-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 55 },
      { id: 'hc-int-006-03', name: 'Pipeline Status', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 42 },
    ],
    syncHistory: [
      { id: 'sh-006-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 6, recordsSynced: 55, errors: 0 },
      { id: 'sh-006-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 5, recordsSynced: 52, errors: 0 },
      { id: 'sh-006-03', date: daysAndHoursAgo(0, 0), status: 'success', duration: 7, recordsSynced: 58, errors: 0 },
    ],
    metrics: {
      totalSyncs: 4800,
      successfulSyncs: 4795,
      failedSyncs: 5,
      averageSyncDuration: 6,
      totalRecordsSynced: 264000,
      uptime: 99.90,
      lastErrorDate: daysAgo(30),
    },
    applicableApplications: ['Payment Gateway', 'Billing Portal', 'Provider Directory', 'Credentialing System'],
    owner: 'user-019',
    segment: 'Enterprise',
    tags: ['source-control', 'ci-cd', 'merge-requests', 'pipelines'],
    version: 3,
    created_at: daysAgo(340),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'int-007',
    name: 'Jenkins',
    type: 'ci_cd',
    category: 'DevOps',
    description: 'Jenkins integration for build pipeline monitoring, job status tracking, and build artifact management.',
    status: 'connected',
    syncFrequency: 'every_5_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.003),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://jenkins.eqip-org.com',
      apiVersion: 'latest',
      authMethod: 'api_token',
      timeout: 25000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 50,
      monitoredJobs: ['eqip-core-build', 'claims-build', 'payment-build', 'member-portal-build'],
      fieldMappings: {
        jobName: 'name',
        buildNumber: 'number',
        result: 'result',
        duration: 'duration',
      },
    },
    healthChecks: [
      { id: 'hc-int-007-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 110 },
      { id: 'hc-int-007-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 80 },
      { id: 'hc-int-007-03', name: 'Build Queue Status', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 65 },
    ],
    syncHistory: [
      { id: 'sh-007-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 8, recordsSynced: 28, errors: 0 },
      { id: 'sh-007-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 7, recordsSynced: 25, errors: 0 },
      { id: 'sh-007-03', date: daysAndHoursAgo(0, 1), status: 'success', duration: 9, recordsSynced: 30, errors: 0 },
    ],
    metrics: {
      totalSyncs: 4500,
      successfulSyncs: 4492,
      failedSyncs: 8,
      averageSyncDuration: 8,
      totalRecordsSynced: 126000,
      uptime: 99.82,
      lastErrorDate: daysAgo(15),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Rx Platform'],
    owner: 'user-018',
    segment: 'Enterprise',
    tags: ['ci-cd', 'builds', 'pipelines', 'artifacts'],
    version: 5,
    created_at: daysAgo(355),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-018',
  },
  {
    id: 'int-008',
    name: 'Harness',
    type: 'ci_cd',
    category: 'DevOps',
    description: 'Harness integration for continuous delivery pipeline orchestration, deployment verification, and feature flag management.',
    status: 'connected',
    syncFrequency: 'every_10_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.007),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://app.harness.io/gateway/api',
      accountId: 'EQIP-HARNESS-001',
      apiVersion: 'v1',
      authMethod: 'api_key',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 50,
      fieldMappings: {
        pipeline: 'pipelineIdentifier',
        execution: 'planExecutionId',
        service: 'serviceIdentifier',
        environment: 'envIdentifier',
      },
    },
    healthChecks: [
      { id: 'hc-int-008-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 135 },
      { id: 'hc-int-008-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 90 },
      { id: 'hc-int-008-03', name: 'Deployment Status', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 110 },
    ],
    syncHistory: [
      { id: 'sh-008-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 10, recordsSynced: 35, errors: 0 },
      { id: 'sh-008-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 12, recordsSynced: 32, errors: 0 },
      { id: 'sh-008-03', date: daysAndHoursAgo(0, 1), status: 'success', duration: 11, recordsSynced: 38, errors: 0 },
    ],
    metrics: {
      totalSyncs: 3200,
      successfulSyncs: 3196,
      failedSyncs: 4,
      averageSyncDuration: 11,
      totalRecordsSynced: 112000,
      uptime: 99.88,
      lastErrorDate: daysAgo(28),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal'],
    owner: 'user-018',
    segment: 'Enterprise',
    tags: ['ci-cd', 'continuous-delivery', 'deployments', 'feature-flags'],
    version: 3,
    created_at: daysAgo(280),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-018',
  },
  {
    id: 'int-009',
    name: 'Azure Pipelines',
    type: 'ci_cd',
    category: 'DevOps',
    description: 'Azure Pipelines integration for build and release pipeline monitoring, test result ingestion, and deployment tracking.',
    status: 'connected',
    syncFrequency: 'every_10_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.007),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://dev.azure.com/eqip-org/eQIP-Quality/_apis/pipelines',
      project: 'eQIP-Quality',
      apiVersion: '7.1',
      authMethod: 'oauth2',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 50,
      fieldMappings: {
        pipelineId: 'id',
        runId: 'id',
        state: 'state',
        result: 'result',
      },
    },
    healthChecks: [
      { id: 'hc-int-009-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 105 },
      { id: 'hc-int-009-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 78 },
      { id: 'hc-int-009-03', name: 'Pipeline Run Status', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 92 },
    ],
    syncHistory: [
      { id: 'sh-009-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 9, recordsSynced: 22, errors: 0 },
      { id: 'sh-009-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 8, recordsSynced: 20, errors: 0 },
      { id: 'sh-009-03', date: daysAndHoursAgo(0, 1), status: 'success', duration: 10, recordsSynced: 25, errors: 0 },
    ],
    metrics: {
      totalSyncs: 3400,
      successfulSyncs: 3394,
      failedSyncs: 6,
      averageSyncDuration: 9,
      totalRecordsSynced: 74800,
      uptime: 99.82,
      lastErrorDate: daysAgo(20),
    },
    applicableApplications: ['Underwriting Engine', 'Risk Assessment Tool', 'Actuarial Platform', 'Compliance Dashboard'],
    owner: 'user-018',
    segment: 'Enterprise',
    tags: ['ci-cd', 'azure', 'pipelines', 'test-results'],
    version: 4,
    created_at: daysAgo(330),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-018',
  },
  {
    id: 'int-010',
    name: 'SonarQube',
    type: 'code_quality',
    category: 'Quality',
    description: 'SonarQube integration for static code analysis, code quality metrics, technical debt tracking, and quality gate status.',
    status: 'connected',
    syncFrequency: 'every_30_minutes',
    lastSync: daysAndHoursAgo(0, 1),
    nextSync: daysAgo(-0.02),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://sonarqube.eqip-org.com/api',
      apiVersion: '10.x',
      authMethod: 'api_token',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 20,
      monitoredProjects: ['eqip-core', 'claims-processing', 'payment-gateway', 'member-portal', 'provider-directory', 'rx-platform'],
      fieldMappings: {
        projectKey: 'key',
        qualityGate: 'qualityGateStatus',
        coverage: 'coverage',
        bugs: 'bugs',
        vulnerabilities: 'vulnerabilities',
        codeSmells: 'code_smells',
      },
    },
    healthChecks: [
      { id: 'hc-int-010-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 95 },
      { id: 'hc-int-010-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 60 },
      { id: 'hc-int-010-03', name: 'Analysis Status', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 150 },
    ],
    syncHistory: [
      { id: 'sh-010-01', date: daysAndHoursAgo(0, 1), status: 'success', duration: 15, recordsSynced: 85, errors: 0 },
      { id: 'sh-010-02', date: daysAndHoursAgo(0, 2), status: 'success', duration: 14, recordsSynced: 82, errors: 0 },
      { id: 'sh-010-03', date: daysAndHoursAgo(0, 3), status: 'success', duration: 16, recordsSynced: 88, errors: 0 },
    ],
    metrics: {
      totalSyncs: 1200,
      successfulSyncs: 1197,
      failedSyncs: 3,
      averageSyncDuration: 15,
      totalRecordsSynced: 102000,
      uptime: 99.75,
      lastErrorDate: daysAgo(35),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    owner: 'user-010',
    segment: 'Enterprise',
    tags: ['code-quality', 'static-analysis', 'coverage', 'technical-debt'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'int-011',
    name: 'Checkmarx',
    type: 'security_scanning',
    category: 'Security',
    description: 'Checkmarx integration for SAST/DAST security scanning, vulnerability tracking, and compliance reporting.',
    status: 'connected',
    syncFrequency: 'daily',
    lastSync: daysAgo(0),
    nextSync: daysAgo(-1),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://checkmarx.eqip-org.com/cxrestapi',
      apiVersion: 'v1',
      authMethod: 'oauth2',
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 10000,
      batchSize: 10,
      scanPresets: ['OWASP_Top_10', 'HIPAA', 'PCI_DSS'],
      fieldMappings: {
        scanId: 'id',
        projectName: 'name',
        highVulnerabilities: 'highSeverity',
        mediumVulnerabilities: 'mediumSeverity',
        lowVulnerabilities: 'lowSeverity',
      },
    },
    healthChecks: [
      { id: 'hc-int-011-01', name: 'API Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 220 },
      { id: 'hc-int-011-02', name: 'Authentication', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 150 },
      { id: 'hc-int-011-03', name: 'Scan Engine Status', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 180 },
    ],
    syncHistory: [
      { id: 'sh-011-01', date: daysAgo(0), status: 'success', duration: 120, recordsSynced: 45, errors: 0 },
      { id: 'sh-011-02', date: daysAgo(1), status: 'success', duration: 115, recordsSynced: 42, errors: 0 },
      { id: 'sh-011-03', date: daysAgo(2), status: 'success', duration: 125, recordsSynced: 48, errors: 0 },
    ],
    metrics: {
      totalSyncs: 180,
      successfulSyncs: 178,
      failedSyncs: 2,
      averageSyncDuration: 120,
      totalRecordsSynced: 8100,
      uptime: 98.89,
      lastErrorDate: daysAgo(42),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    owner: 'user-010',
    segment: 'Enterprise',
    tags: ['security', 'sast', 'dast', 'vulnerability-scanning'],
    version: 3,
    created_at: daysAgo(320),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'int-012',
    name: 'CAST',
    type: 'code_quality',
    category: 'Quality',
    description: 'CAST Software Intelligence integration for structural analysis, architectural insights, and software health scoring.',
    status: 'connected',
    syncFrequency: 'weekly',
    lastSync: daysAgo(2),
    nextSync: daysAgo(-5),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://cast.eqip-org.com/api/v2',
      apiVersion: 'v2',
      authMethod: 'api_token',
      timeout: 120000,
      retryAttempts: 2,
      retryDelay: 30000,
      batchSize: 10,
      fieldMappings: {
        applicationName: 'name',
        healthScore: 'healthFactor',
        technicalDebt: 'technicalDebt',
        securityScore: 'securityIndex',
      },
    },
    healthChecks: [
      { id: 'hc-int-012-01', name: 'API Connectivity', status: 'passed', lastRun: daysAgo(2), responseTimeMs: 350 },
      { id: 'hc-int-012-02', name: 'Authentication', status: 'passed', lastRun: daysAgo(2), responseTimeMs: 200 },
      { id: 'hc-int-012-03', name: 'Analysis Engine', status: 'passed', lastRun: daysAgo(2), responseTimeMs: 500 },
    ],
    syncHistory: [
      { id: 'sh-012-01', date: daysAgo(2), status: 'success', duration: 300, recordsSynced: 19, errors: 0 },
      { id: 'sh-012-02', date: daysAgo(9), status: 'success', duration: 290, recordsSynced: 19, errors: 0 },
      { id: 'sh-012-03', date: daysAgo(16), status: 'success', duration: 310, recordsSynced: 19, errors: 0 },
    ],
    metrics: {
      totalSyncs: 52,
      successfulSyncs: 51,
      failedSyncs: 1,
      averageSyncDuration: 300,
      totalRecordsSynced: 988,
      uptime: 98.08,
      lastErrorDate: daysAgo(60),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Underwriting Engine', 'Policy Admin System'],
    owner: 'user-019',
    segment: 'Enterprise',
    tags: ['code-quality', 'structural-analysis', 'architecture', 'health-scoring'],
    version: 2,
    created_at: daysAgo(250),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'int-013',
    name: 'Dynatrace',
    type: 'monitoring',
    category: 'Observability',
    description: 'Dynatrace integration for application performance monitoring, infrastructure health, and real-time alerting.',
    status: 'connected',
    syncFrequency: 'every_5_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.003),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://eqip-org.live.dynatrace.com/api/v2',
      environmentId: 'EQIP-DT-001',
      apiVersion: 'v2',
      authMethod: 'api_token',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 3000,
      batchSize: 100,
      monitoredEntities: ['SERVICE', 'HOST', 'PROCESS_GROUP', 'APPLICATION'],
      fieldMappings: {
        entityId: 'entityId',
        displayName: 'displayName',
        healthState: 'healthState',
        responseTime: 'responseTime',
      },
    },
    healthChecks: [
      { id: 'hc-int-013-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 45 },
      { id: 'hc-int-013-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 30 },
      { id: 'hc-int-013-03', name: 'Metrics Ingestion', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 55 },
    ],
    syncHistory: [
      { id: 'sh-013-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 4, recordsSynced: 150, errors: 0 },
      { id: 'sh-013-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 3, recordsSynced: 148, errors: 0 },
      { id: 'sh-013-03', date: daysAndHoursAgo(0, 0), status: 'success', duration: 5, recordsSynced: 155, errors: 0 },
    ],
    metrics: {
      totalSyncs: 6200,
      successfulSyncs: 6198,
      failedSyncs: 2,
      averageSyncDuration: 4,
      totalRecordsSynced: 930000,
      uptime: 99.97,
      lastErrorDate: daysAgo(55),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Compliance Dashboard'],
    owner: 'user-009',
    segment: 'Enterprise',
    tags: ['apm', 'monitoring', 'performance', 'alerting'],
    version: 4,
    created_at: daysAgo(350),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'int-014',
    name: 'Splunk',
    type: 'log_management',
    category: 'Observability',
    description: 'Splunk integration for centralized log management, search, alerting, and operational intelligence dashboards.',
    status: 'connected',
    syncFrequency: 'every_5_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.003),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://splunk.eqip-org.com:8089/services',
      apiVersion: '9.x',
      authMethod: 'bearer_token',
      timeout: 20000,
      retryAttempts: 3,
      retryDelay: 5000,
      batchSize: 500,
      indexes: ['eqip_app_logs', 'eqip_audit_logs', 'eqip_security_logs'],
      fieldMappings: {
        index: 'index',
        sourcetype: 'sourcetype',
        host: 'host',
        source: 'source',
      },
    },
    healthChecks: [
      { id: 'hc-int-014-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 85 },
      { id: 'hc-int-014-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 50 },
      { id: 'hc-int-014-03', name: 'Index Health', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 120 },
    ],
    syncHistory: [
      { id: 'sh-014-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 6, recordsSynced: 1200, errors: 0 },
      { id: 'sh-014-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 5, recordsSynced: 1150, errors: 0 },
      { id: 'sh-014-03', date: daysAndHoursAgo(0, 0), status: 'success', duration: 7, recordsSynced: 1280, errors: 0 },
    ],
    metrics: {
      totalSyncs: 5800,
      successfulSyncs: 5795,
      failedSyncs: 5,
      averageSyncDuration: 6,
      totalRecordsSynced: 6960000,
      uptime: 99.91,
      lastErrorDate: daysAgo(25),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Underwriting Engine', 'Policy Admin System', 'Insurance Claims Portal', 'Compliance Dashboard'],
    owner: 'user-009',
    segment: 'Enterprise',
    tags: ['log-management', 'search', 'alerting', 'operational-intelligence'],
    version: 5,
    created_at: daysAgo(360),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'int-015',
    name: 'ServiceNow',
    type: 'itsm',
    category: 'Operations',
    description: 'ServiceNow integration for IT service management, incident tracking, change management, and CMDB synchronization.',
    status: 'connected',
    syncFrequency: 'every_15_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.01),
    errorCount: 2,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://eqip-org.service-now.com/api/now',
      apiVersion: 'v2',
      authMethod: 'oauth2',
      timeout: 45000,
      retryAttempts: 3,
      retryDelay: 10000,
      batchSize: 100,
      tables: ['incident', 'change_request', 'cmdb_ci_server', 'problem'],
      fieldMappings: {
        number: 'number',
        state: 'state',
        priority: 'priority',
        assignedTo: 'assigned_to',
        category: 'category',
      },
    },
    healthChecks: [
      { id: 'hc-int-015-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 180 },
      { id: 'hc-int-015-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 120 },
      { id: 'hc-int-015-03', name: 'Table Access', status: 'warning', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 850 },
    ],
    syncHistory: [
      { id: 'sh-015-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 22, recordsSynced: 180, errors: 0 },
      { id: 'sh-015-02', date: daysAndHoursAgo(0, 1), status: 'partial', duration: 28, recordsSynced: 165, errors: 2 },
      { id: 'sh-015-03', date: daysAndHoursAgo(0, 2), status: 'success', duration: 20, recordsSynced: 175, errors: 0 },
    ],
    metrics: {
      totalSyncs: 1800,
      successfulSyncs: 1785,
      failedSyncs: 15,
      averageSyncDuration: 22,
      totalRecordsSynced: 324000,
      uptime: 99.17,
      lastErrorDate: daysAgo(1),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['itsm', 'incidents', 'change-management', 'cmdb'],
    version: 6,
    created_at: daysAgo(365),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'int-016',
    name: 'Power BI',
    type: 'reporting',
    category: 'Analytics',
    description: 'Power BI integration for executive dashboards, quality metrics visualization, and automated report distribution.',
    status: 'connected',
    syncFrequency: 'hourly',
    lastSync: daysAndHoursAgo(0, 1),
    nextSync: daysAgo(-0.04),
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://api.powerbi.com/v1.0/myorg',
      workspaceId: 'EQIP-PBI-WORKSPACE-001',
      apiVersion: 'v1.0',
      authMethod: 'oauth2',
      timeout: 60000,
      retryAttempts: 3,
      retryDelay: 15000,
      batchSize: 1000,
      datasets: ['eqip-quality-metrics', 'eqip-release-readiness', 'eqip-defect-trends'],
      fieldMappings: {
        datasetId: 'id',
        tableName: 'name',
        refreshStatus: 'status',
      },
    },
    healthChecks: [
      { id: 'hc-int-016-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 200 },
      { id: 'hc-int-016-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 150 },
      { id: 'hc-int-016-03', name: 'Dataset Refresh', status: 'passed', lastRun: daysAndHoursAgo(0, 1), responseTimeMs: 2500 },
    ],
    syncHistory: [
      { id: 'sh-016-01', date: daysAndHoursAgo(0, 1), status: 'success', duration: 45, recordsSynced: 3500, errors: 0 },
      { id: 'sh-016-02', date: daysAndHoursAgo(0, 2), status: 'success', duration: 48, recordsSynced: 3480, errors: 0 },
      { id: 'sh-016-03', date: daysAndHoursAgo(0, 3), status: 'success', duration: 42, recordsSynced: 3520, errors: 0 },
    ],
    metrics: {
      totalSyncs: 720,
      successfulSyncs: 718,
      failedSyncs: 2,
      averageSyncDuration: 45,
      totalRecordsSynced: 2520000,
      uptime: 99.72,
      lastErrorDate: daysAgo(38),
    },
    applicableApplications: ['EQIP Core'],
    owner: 'user-001',
    segment: 'Enterprise',
    tags: ['reporting', 'dashboards', 'analytics', 'visualization'],
    version: 3,
    created_at: daysAgo(300),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'int-017',
    name: 'Microsoft Teams',
    type: 'collaboration',
    category: 'Communication',
    description: 'Microsoft Teams integration for quality alert notifications, release status updates, and team collaboration channels.',
    status: 'connected',
    syncFrequency: 'real_time',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: null,
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://graph.microsoft.com/v1.0',
      tenantId: 'EQIP-TENANT-001',
      apiVersion: 'v1.0',
      authMethod: 'oauth2',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 2000,
      batchSize: 1,
      channels: [
        { name: 'Quality Alerts', webhookUrl: '***' },
        { name: 'Release Updates', webhookUrl: '***' },
        { name: 'Defect Notifications', webhookUrl: '***' },
      ],
      fieldMappings: {
        channelId: 'id',
        messageId: 'id',
        content: 'body.content',
      },
    },
    healthChecks: [
      { id: 'hc-int-017-01', name: 'Webhook Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 35 },
      { id: 'hc-int-017-02', name: 'Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 50 },
      { id: 'hc-int-017-03', name: 'Message Delivery', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 120 },
    ],
    syncHistory: [
      { id: 'sh-017-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 1, recordsSynced: 5, errors: 0 },
      { id: 'sh-017-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 1, recordsSynced: 3, errors: 0 },
      { id: 'sh-017-03', date: daysAndHoursAgo(0, 1), status: 'success', duration: 1, recordsSynced: 8, errors: 0 },
    ],
    metrics: {
      totalSyncs: 8500,
      successfulSyncs: 8495,
      failedSyncs: 5,
      averageSyncDuration: 1,
      totalRecordsSynced: 42500,
      uptime: 99.94,
      lastErrorDate: daysAgo(14),
    },
    applicableApplications: ['EQIP Core'],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['collaboration', 'notifications', 'alerts', 'teams'],
    version: 4,
    created_at: daysAgo(340),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'int-018',
    name: 'Slack',
    type: 'collaboration',
    category: 'Communication',
    description: 'Slack integration for real-time quality notifications, build status alerts, and cross-team communication.',
    status: 'connected',
    syncFrequency: 'real_time',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: null,
    errorCount: 0,
    resiliencePattern: 'retry_with_backoff',
    configuration: {
      baseUrl: 'https://slack.com/api',
      workspaceId: 'EQIP-SLACK-001',
      apiVersion: 'v2',
      authMethod: 'bot_token',
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 2000,
      batchSize: 1,
      channels: [
        { name: '#eqip-quality-alerts', channelId: 'C01QUALITY' },
        { name: '#eqip-releases', channelId: 'C02RELEASES' },
        { name: '#eqip-defects', channelId: 'C03DEFECTS' },
      ],
      fieldMappings: {
        channel: 'channel',
        text: 'text',
        blocks: 'blocks',
      },
    },
    healthChecks: [
      { id: 'hc-int-018-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 40 },
      { id: 'hc-int-018-02', name: 'Bot Authentication', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 35 },
      { id: 'hc-int-018-03', name: 'Message Delivery', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 80 },
    ],
    syncHistory: [
      { id: 'sh-018-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 1, recordsSynced: 4, errors: 0 },
      { id: 'sh-018-02', date: daysAndHoursAgo(0, 0), status: 'success', duration: 1, recordsSynced: 6, errors: 0 },
      { id: 'sh-018-03', date: daysAndHoursAgo(0, 1), status: 'success', duration: 1, recordsSynced: 5, errors: 0 },
    ],
    metrics: {
      totalSyncs: 9200,
      successfulSyncs: 9195,
      failedSyncs: 5,
      averageSyncDuration: 1,
      totalRecordsSynced: 46000,
      uptime: 99.95,
      lastErrorDate: daysAgo(20),
    },
    applicableApplications: ['EQIP Core'],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['collaboration', 'notifications', 'alerts', 'slack'],
    version: 3,
    created_at: daysAgo(330),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'int-019',
    name: 'Azure Entra ID',
    type: 'identity_provider',
    category: 'Security',
    description: 'Azure Entra ID (formerly Azure AD) integration for single sign-on, user provisioning, and role-based access control.',
    status: 'connected',
    syncFrequency: 'every_15_minutes',
    lastSync: daysAndHoursAgo(0, 0),
    nextSync: daysAgo(-0.01),
    errorCount: 0,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://graph.microsoft.com/v1.0',
      tenantId: 'EQIP-TENANT-001',
      apiVersion: 'v1.0',
      authMethod: 'oauth2',
      timeout: 15000,
      retryAttempts: 3,
      retryDelay: 3000,
      batchSize: 100,
      scimEnabled: true,
      groupMappings: {
        'EQIP-Admins': 'admin',
        'EQIP-QA-Leads': 'qa_lead',
        'EQIP-QA-Engineers': 'qa_engineer',
        'EQIP-Developers': 'developer',
        'EQIP-Viewers': 'viewer',
      },
      fieldMappings: {
        userId: 'id',
        displayName: 'displayName',
        email: 'mail',
        groups: 'memberOf',
      },
    },
    healthChecks: [
      { id: 'hc-int-019-01', name: 'API Connectivity', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 55 },
      { id: 'hc-int-019-02', name: 'SSO Endpoint', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 40 },
      { id: 'hc-int-019-03', name: 'SCIM Provisioning', status: 'passed', lastRun: daysAndHoursAgo(0, 0), responseTimeMs: 90 },
    ],
    syncHistory: [
      { id: 'sh-019-01', date: daysAndHoursAgo(0, 0), status: 'success', duration: 8, recordsSynced: 25, errors: 0 },
      { id: 'sh-019-02', date: daysAndHoursAgo(0, 1), status: 'success', duration: 7, recordsSynced: 25, errors: 0 },
      { id: 'sh-019-03', date: daysAndHoursAgo(0, 2), status: 'success', duration: 9, recordsSynced: 25, errors: 0 },
    ],
    metrics: {
      totalSyncs: 2400,
      successfulSyncs: 2399,
      failedSyncs: 1,
      averageSyncDuration: 8,
      totalRecordsSynced: 60000,
      uptime: 99.96,
      lastErrorDate: daysAgo(90),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Compliance Dashboard'],
    owner: 'user-001',
    segment: 'Enterprise',
    tags: ['identity', 'sso', 'rbac', 'user-provisioning'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAndHoursAgo(0, 0),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'int-020',
    name: 'Okta',
    type: 'identity_provider',
    category: 'Security',
    description: 'Okta integration for multi-factor authentication, adaptive access policies, and identity lifecycle management.',
    status: 'disconnected',
    syncFrequency: 'every_30_minutes',
    lastSync: daysAgo(5),
    nextSync: null,
    errorCount: 12,
    resiliencePattern: 'circuit_breaker',
    configuration: {
      baseUrl: 'https://eqip-org.okta.com/api/v1',
      orgId: 'EQIP-OKTA-001',
      apiVersion: 'v1',
      authMethod: 'api_token',
      timeout: 15000,
      retryAttempts: 5,
      retryDelay: 5000,
      batchSize: 100,
      mfaEnabled: true,
      adaptivePolicies: ['location-based', 'device-trust', 'risk-based'],
      fieldMappings: {
        userId: 'id',
        login: 'profile.login',
        email: 'profile.email',
        status: 'status',
        mfaFactors: 'factors',
      },
    },
    healthChecks: [
      { id: 'hc-int-020-01', name: 'API Connectivity', status: 'failed', lastRun: daysAgo(0), responseTimeMs: 0 },
      { id: 'hc-int-020-02', name: 'Authentication', status: 'failed', lastRun: daysAgo(0), responseTimeMs: 0 },
      { id: 'hc-int-020-03', name: 'MFA Service', status: 'failed', lastRun: daysAgo(0), responseTimeMs: 0 },
    ],
    syncHistory: [
      { id: 'sh-020-01', date: daysAgo(5), status: 'failed', duration: 0, recordsSynced: 0, errors: 3 },
      { id: 'sh-020-02', date: daysAgo(5), status: 'failed', duration: 0, recordsSynced: 0, errors: 3 },
      { id: 'sh-020-03', date: daysAgo(6), status: 'success', duration: 10, recordsSynced: 25, errors: 0 },
    ],
    metrics: {
      totalSyncs: 1100,
      successfulSyncs: 1088,
      failedSyncs: 12,
      averageSyncDuration: 10,
      totalRecordsSynced: 27200,
      uptime: 95.45,
      lastErrorDate: daysAgo(5),
    },
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal'],
    owner: 'user-001',
    segment: 'Enterprise',
    tags: ['identity', 'mfa', 'adaptive-access', 'lifecycle-management'],
    version: 4,
    created_at: daysAgo(310),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
];

export default integrations;

/**
 * Get all mock integrations.
 * @returns {Array<object>} Array of integration objects.
 */
export function getAllIntegrations() {
  return [...integrations];
}

/**
 * Find an integration by ID.
 * @param {string} id - The integration ID to find.
 * @returns {object|null} The integration object, or null if not found.
 */
export function getIntegrationById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return integrations.find((intg) => intg.id === id) || null;
}

/**
 * Get all integrations with a specific status.
 * @param {string} status - The status to filter by (e.g., 'connected', 'disconnected', 'error').
 * @returns {Array<object>} Array of integrations with the specified status.
 */
export function getIntegrationsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return integrations.filter((intg) => intg.status === status);
}

/**
 * Get all integrations with a specific type.
 * @param {string} type - The type to filter by (e.g., 'ci_cd', 'source_control', 'monitoring').
 * @returns {Array<object>} Array of integrations with the specified type.
 */
export function getIntegrationsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return integrations.filter((intg) => intg.type === type);
}

/**
 * Get all integrations within a specific category.
 * @param {string} category - The category to filter by (e.g., 'DevOps', 'Security', 'Quality').
 * @returns {Array<object>} Array of integrations within the specified category.
 */
export function getIntegrationsByCategory(category) {
  if (!category || typeof category !== 'string') {
    return [];
  }
  return integrations.filter((intg) => intg.category === category);
}

/**
 * Get all integrations owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of integrations owned by the specified user.
 */
export function getIntegrationsByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return integrations.filter((intg) => intg.owner === ownerId);
}

/**
 * Get all integrations applicable to a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of integrations applicable to the specified application.
 */
export function getIntegrationsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return integrations.filter(
    (intg) =>
      Array.isArray(intg.applicableApplications) &&
      intg.applicableApplications.includes(application),
  );
}

/**
 * Get all integrations with a specific resilience pattern.
 * @param {string} pattern - The resilience pattern to filter by (e.g., 'circuit_breaker', 'retry_with_backoff').
 * @returns {Array<object>} Array of integrations with the specified resilience pattern.
 */
export function getIntegrationsByResiliencePattern(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    return [];
  }
  return integrations.filter((intg) => intg.resiliencePattern === pattern);
}

/**
 * Get all integrations that have errors (errorCount > 0).
 * @returns {Array<object>} Array of integrations with errors.
 */
export function getIntegrationsWithErrors() {
  return integrations.filter(
    (intg) => typeof intg.errorCount === 'number' && intg.errorCount > 0,
  );
}

/**
 * Get all integrations with failed health checks.
 * @returns {Array<object>} Array of integrations that have at least one failed health check.
 */
export function getIntegrationsWithFailedHealthChecks() {
  return integrations.filter(
    (intg) =>
      Array.isArray(intg.healthChecks) &&
      intg.healthChecks.some((hc) => hc.status === 'failed'),
  );
}

/**
 * Get distinct types from the integration data.
 * @returns {string[]} Array of unique type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].type) {
      types.add(integrations[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct categories from the integration data.
 * @returns {string[]} Array of unique category strings.
 */
export function getDistinctCategories() {
  const categories = new Set();
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].category) {
      categories.add(integrations[i].category);
    }
  }
  return [...categories].sort();
}

/**
 * Get distinct statuses from the integration data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].status) {
      statuses.add(integrations[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct resilience patterns from the integration data.
 * @returns {string[]} Array of unique resilience pattern strings.
 */
export function getDistinctResiliencePatterns() {
  const patterns = new Set();
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].resiliencePattern) {
      patterns.add(integrations[i].resiliencePattern);
    }
  }
  return [...patterns].sort();
}

/**
 * Get a count of integrations grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getIntegrationCountByStatus() {
  const counts = {};
  for (let i = 0; i < integrations.length; i++) {
    const status = integrations[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of integrations grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getIntegrationCountByType() {
  const counts = {};
  for (let i = 0; i < integrations.length; i++) {
    const type = integrations[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of integrations grouped by category.
 * @returns {object} Object with category keys and count values.
 */
export function getIntegrationCountByCategory() {
  const counts = {};
  for (let i = 0; i < integrations.length; i++) {
    const category = integrations[i].category;
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

/**
 * Get the total error count across all integrations.
 * @returns {number} Total error count.
 */
export function getTotalErrorCount() {
  let total = 0;
  for (let i = 0; i < integrations.length; i++) {
    total += integrations[i].errorCount || 0;
  }
  return total;
}

/**
 * Get the total number of failed health checks across all integrations.
 * @returns {number} Total count of failed health checks.
 */
export function getTotalFailedHealthChecks() {
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
 * Calculate the average uptime across all integrations.
 * @returns {number} The average uptime percentage, or 0 if no integrations exist.
 */
export function getAverageUptime() {
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
 * Get the total number of records synced across all integrations.
 * @returns {number} Total records synced.
 */
export function getTotalRecordsSynced() {
  let total = 0;
  for (let i = 0; i < integrations.length; i++) {
    if (integrations[i].metrics && typeof integrations[i].metrics.totalRecordsSynced === 'number') {
      total += integrations[i].metrics.totalRecordsSynced;
    }
  }
  return total;
}

/**
 * Find an integration by name (case-insensitive).
 * @param {string} name - The integration name to search for.
 * @returns {object|null} The integration object, or null if not found.
 */
export function getIntegrationByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return integrations.find((intg) => intg.name.toLowerCase() === nameLower) || null;
}

/**
 * Get integrations sorted by error count in descending order (most errors first).
 * @param {number} [limit] - Optional maximum number of integrations to return.
 * @returns {Array<object>} Array of integrations sorted by error count.
 */
export function getIntegrationsByErrorCount(limit) {
  const sorted = [...integrations].sort((a, b) => (b.errorCount || 0) - (a.errorCount || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get integrations sorted by uptime in ascending order (lowest uptime first).
 * @param {number} [limit] - Optional maximum number of integrations to return.
 * @returns {Array<object>} Array of integrations sorted by uptime ascending.
 */
export function getLowestUptimeIntegrations(limit) {
  const sorted = [...integrations].sort((a, b) => {
    const uptimeA = a.metrics ? a.metrics.uptime : 100;
    const uptimeB = b.metrics ? b.metrics.uptime : 100;
    return uptimeA - uptimeB;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of integration health across all integrations.
 * @returns {object} Summary object with integration health metrics.
 */
export function getIntegrationSummary() {
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

    if (intg.status === 'connected') connected += 1;
    else if (intg.status === 'disconnected') disconnected += 1;
    else if (intg.status === 'error') error += 1;
    else if (intg.status === 'syncing') syncing += 1;
    else if (intg.status === 'pending') pending += 1;

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