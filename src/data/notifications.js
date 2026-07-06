import { v4 as uuidv4 } from 'uuid';

/**
 * @module notifications
 * Mock notification data seed for eQIP Quality Intelligence.
 * Simulated notifications for workflow events with id, type, channel, recipient,
 * message, status, triggeredBy, createdAt, readStatus, and audit fields.
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
 * Mock notification data array.
 * Each notification includes id, type, channel, recipient, subject, message,
 * status, priority, triggeredBy, entityType, entityId, readStatus, readAt,
 * actionUrl, tags, version, and audit fields.
 * @type {Array<object>}
 */
const notifications = [
  {
    id: 'notif-001',
    type: 'release_status_change',
    channel: 'in_app',
    recipient: 'user-001',
    subject: 'Release 2024.06 Status Updated',
    message: 'Release 2024.06 for EQIP Core has been updated to "Ready" status. All quality gates have passed and approvals are complete.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'user-017',
    entityType: 'releases',
    entityId: 'rel-001',
    readStatus: true,
    readAt: daysAndHoursAgo(0, 4),
    actionUrl: '/releases/rel-001',
    tags: ['release', 'status-change', 'ready'],
    version: 1,
    created_at: daysAndHoursAgo(0, 6),
    updated_at: daysAndHoursAgo(0, 4),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-002',
    type: 'quality_gate_failure',
    channel: 'in_app',
    recipient: 'user-003',
    subject: 'Quality Gate Failed: Unit Test Coverage',
    message: 'The Unit Test Coverage quality gate has failed for Release 2024.07 (Payment Gateway). Current value: 75%, threshold: 80%. A waiver has been requested.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'quality-gates',
    entityId: 'qg-006',
    readStatus: true,
    readAt: daysAndHoursAgo(0, 8),
    actionUrl: '/quality-gates/qg-006',
    tags: ['quality-gate', 'failure', 'unit-test-coverage'],
    version: 1,
    created_at: daysAndHoursAgo(0, 10),
    updated_at: daysAndHoursAgo(0, 8),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-003',
    type: 'waiver_request',
    channel: 'in_app',
    recipient: 'user-001',
    subject: 'Waiver Request: Unit Test Coverage - Release 2024.07',
    message: 'A waiver has been requested by user-020 for the Unit Test Coverage quality gate on Release 2024.07. Reason: Legacy payment module has limited testability. Refactoring planned for next sprint.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'user-020',
    entityType: 'quality-gates',
    entityId: 'qg-006',
    readStatus: false,
    readAt: null,
    actionUrl: '/quality-gates/qg-006',
    tags: ['waiver', 'request', 'pending-approval'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-004',
    type: 'defect_critical',
    channel: 'email',
    recipient: 'user-010',
    subject: 'Critical Vulnerability: Stored XSS in EQIP Core',
    message: 'A critical stored XSS vulnerability has been identified in the EQIP Core release notes field during security scan execution (exec-055). Immediate remediation is required before Release 2024.06 deployment.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'test-executions',
    entityId: 'exec-055',
    readStatus: true,
    readAt: daysAndHoursAgo(3, 1),
    actionUrl: '/test-assets/tc-026',
    tags: ['security', 'xss', 'critical', 'vulnerability'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAndHoursAgo(3, 1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-005',
    type: 'release_approval_request',
    channel: 'in_app',
    recipient: 'user-017',
    subject: 'Approval Required: Release 2024.08 - Member Portal',
    message: 'Release 2024.08 for Member Portal is pending your approval as Release Manager. QA Lead has approved. Please review the release readiness report and provide your decision.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'user-003',
    entityType: 'releases',
    entityId: 'rel-003',
    readStatus: false,
    readAt: null,
    actionUrl: '/releases/rel-003',
    tags: ['release', 'approval', 'pending'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-006',
    type: 'demand_status_change',
    channel: 'in_app',
    recipient: 'user-005',
    subject: 'Demand Assigned: Claims Dashboard Filter Enhancement',
    message: 'You have been assigned to demand dem-001: "Claims Dashboard Filter Enhancement". Priority: P1. Target release: Release 2024.06.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-003',
    entityType: 'demands',
    entityId: 'dem-001',
    readStatus: true,
    readAt: daysAgo(28),
    actionUrl: '/demands/dem-001',
    tags: ['demand', 'assignment', 'claims'],
    version: 1,
    created_at: daysAgo(30),
    updated_at: daysAgo(28),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-007',
    type: 'test_execution_failure',
    channel: 'in_app',
    recipient: 'user-009',
    subject: 'Test Failure: Payment Reconciliation Report Accuracy',
    message: 'Test case tc-008 "Verify payment reconciliation report accuracy" has failed in staging environment (build-2024.07-rc2). 3 transactions could not be matched due to T+1 settlement date timing difference.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'test-executions',
    entityId: 'exec-019',
    readStatus: true,
    readAt: daysAndHoursAgo(1, 2),
    actionUrl: '/test-assets/tc-008',
    tags: ['test-failure', 'payments', 'reconciliation'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAndHoursAgo(1, 2),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-008',
    type: 'environment_degraded',
    channel: 'in_app',
    recipient: 'user-007',
    subject: 'Environment Degraded: STG-Provider',
    message: 'The STG-Provider staging environment has been flagged as degraded. Elasticsearch index rebuild is in progress causing slow search responses. Database schema is 1 migration behind development.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'environments',
    entityId: 'env-009',
    readStatus: true,
    readAt: daysAndHoursAgo(1, 5),
    actionUrl: '/environments/env-009',
    tags: ['environment', 'degraded', 'provider', 'staging'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAndHoursAgo(1, 5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-009',
    type: 'governance_finding',
    channel: 'email',
    recipient: 'user-002',
    subject: 'Data Privacy Finding: Unmasked SSN in Claims Processing Staging',
    message: 'A critical finding has been identified during the Data Privacy Review (gov-004): Claims Processing stores unmasked SSN in the staging database. Immediate remediation is required.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'user-002',
    entityType: 'governance-procedures',
    entityId: 'gov-004',
    readStatus: true,
    readAt: daysAgo(20),
    actionUrl: '/governance/gov-004',
    tags: ['governance', 'privacy', 'pii', 'critical-finding'],
    version: 1,
    created_at: daysAgo(21),
    updated_at: daysAgo(20),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-010',
    type: 'integration_disconnected',
    channel: 'in_app',
    recipient: 'user-001',
    subject: 'Integration Disconnected: Okta',
    message: 'The Okta integration (int-020) has been disconnected. API connectivity, authentication, and MFA service health checks are all failing. 12 errors recorded. Last successful sync was 5 days ago.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'integrations',
    entityId: 'int-020',
    readStatus: false,
    readAt: null,
    actionUrl: '/integrations/int-020',
    tags: ['integration', 'disconnected', 'okta', 'identity'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-011',
    type: 'release_deployed',
    channel: 'in_app',
    recipient: 'user-012',
    subject: 'Release 2024.10 Deployed to Production',
    message: 'Release 2024.10 for Claims Processing has been successfully deployed to production. All post-deployment verification tests have passed. Quality score: 95.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-017',
    entityType: 'releases',
    entityId: 'rel-005',
    readStatus: true,
    readAt: daysAgo(3),
    actionUrl: '/releases/rel-005',
    tags: ['release', 'deployed', 'production', 'claims'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-012',
    type: 'demand_comment',
    channel: 'in_app',
    recipient: 'user-008',
    subject: 'New Comment on Demand: Drug Interaction Database Validation',
    message: 'user-012 commented on demand dem-017: "Clinical safety impact. Prioritize this fix." The demand involves adding data validation rules for formulary imports.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-012',
    entityType: 'demands',
    entityId: 'dem-017',
    readStatus: true,
    readAt: daysAndHoursAgo(2, 3),
    actionUrl: '/demands/dem-017',
    tags: ['demand', 'comment', 'pharmacy', 'clinical-safety'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAndHoursAgo(2, 3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-013',
    type: 'quality_gate_passed',
    channel: 'in_app',
    recipient: 'user-017',
    subject: 'All Quality Gates Passed: Release 2024.14',
    message: 'All 16 quality gates have passed for Release 2024.14 (Compliance Dashboard). The release has achieved a quality score of 97 and is ready for production deployment.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'system',
    entityType: 'releases',
    entityId: 'rel-009',
    readStatus: true,
    readAt: daysAgo(5),
    actionUrl: '/releases/rel-009',
    tags: ['quality-gate', 'all-passed', 'compliance-dashboard'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-014',
    type: 'test_data_refresh_failed',
    channel: 'in_app',
    recipient: 'user-008',
    subject: 'Test Data Refresh Failed: Claims Member Base Data',
    message: 'The weekly scheduled refresh for test data set td-001 "Claims Member Base Data" has failed due to database connection timeout. 1,200 of 5,000 records were processed before failure.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'test-data',
    entityId: 'td-001',
    readStatus: true,
    readAt: daysAgo(22),
    actionUrl: '/test-data/td-001',
    tags: ['test-data', 'refresh-failed', 'claims'],
    version: 1,
    created_at: daysAgo(24),
    updated_at: daysAgo(22),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-015',
    type: 'waiver_approved',
    channel: 'in_app',
    recipient: 'user-011',
    subject: 'Waiver Approved: Accessibility Audit - Release 2024.13',
    message: 'Your waiver request for the Accessibility Audit quality gate on Release 2024.13 (Underwriting Engine) has been approved by user-001. Reason: Backend-only service with no user-facing UI.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-001',
    entityType: 'quality-gates',
    entityId: 'qg-013',
    readStatus: true,
    readAt: daysAgo(4),
    actionUrl: '/quality-gates/qg-013',
    tags: ['waiver', 'approved', 'accessibility'],
    version: 1,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-016',
    type: 'waiver_rejected',
    channel: 'in_app',
    recipient: 'user-011',
    subject: 'Waiver Rejected: Security Scan - Release 2024.09',
    message: 'Your waiver request for the Security Scan quality gate on Release 2024.09 (Provider Directory) has been rejected by user-001. Comment: Security vulnerability must be addressed before release. Cannot waive.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'user-001',
    entityType: 'quality-gates',
    entityId: 'qg-012',
    readStatus: true,
    readAt: daysAgo(1),
    actionUrl: '/quality-gates/qg-012',
    tags: ['waiver', 'rejected', 'security'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-017',
    type: 'environment_conflict',
    channel: 'in_app',
    recipient: 'user-003',
    subject: 'Environment Conflict: UAT-PolicyAdmin Version Drift',
    message: 'Critical conflict detected on UAT-PolicyAdmin (env-023): UAT environment is running 2 versions behind production. Test data refresh is overdue by 15 days. Document Management service is intermittently failing health checks.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'environments',
    entityId: 'env-023',
    readStatus: false,
    readAt: null,
    actionUrl: '/environments/env-023',
    tags: ['environment', 'conflict', 'version-drift', 'policy-admin'],
    version: 1,
    created_at: daysAgo(15),
    updated_at: daysAgo(15),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-018',
    type: 'demand_completed',
    channel: 'in_app',
    recipient: 'user-023',
    subject: 'Demand Completed: Member Portal Enrollment Flow Redesign',
    message: 'Demand dem-011 "Member Portal Enrollment Flow Redesign" has been completed. UAT sign-off obtained. Enrollment abandonment rate reduced from 35% to 18% in pilot.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'user-014',
    entityType: 'demands',
    entityId: 'dem-011',
    readStatus: true,
    readAt: daysAgo(3),
    actionUrl: '/demands/dem-011',
    tags: ['demand', 'completed', 'enrollment', 'member-portal'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-019',
    type: 'governance_review_due',
    channel: 'email',
    recipient: 'user-003',
    subject: 'Governance Review Due: Test Environment Management',
    message: 'The monthly review for governance procedure gov-009 "Test Environment Management" is due within 5 days. Current compliance rate: 78% (at risk). 3 open findings require attention.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'system',
    entityType: 'governance-procedures',
    entityId: 'gov-009',
    readStatus: false,
    readAt: null,
    actionUrl: '/governance/gov-009',
    tags: ['governance', 'review-due', 'test-environment'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-020',
    type: 'release_at_risk',
    channel: 'in_app',
    recipient: 'user-011',
    subject: 'Release At Risk: Release 2024.09 - Provider Directory',
    message: 'Release 2024.09 for Provider Directory has been flagged as "At Risk" with a readiness score of 65. Multiple quality gates have failed including code review, static analysis, unit test coverage, functional test, and security scan. 3 critical defects remain open.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'releases',
    entityId: 'rel-004',
    readStatus: true,
    readAt: daysAgo(9),
    actionUrl: '/releases/rel-004',
    tags: ['release', 'at-risk', 'provider-directory'],
    version: 1,
    created_at: daysAgo(10),
    updated_at: daysAgo(9),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-021',
    type: 'test_execution_failure',
    channel: 'in_app',
    recipient: 'user-007',
    subject: 'Test Failure: Provider Data Synchronization',
    message: 'Test case tc-016 "Verify provider data synchronization from credentialing system" has failed in staging environment. Sync job timed out after processing 450 of 1200 provider records. This is a recurring issue.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'test-executions',
    entityId: 'exec-036',
    readStatus: true,
    readAt: daysAndHoursAgo(1, 3),
    actionUrl: '/test-assets/tc-016',
    tags: ['test-failure', 'provider', 'data-sync', 'timeout'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAndHoursAgo(1, 3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-022',
    type: 'integration_sync_warning',
    channel: 'in_app',
    recipient: 'user-017',
    subject: 'Integration Sync Warning: ServiceNow',
    message: 'The ServiceNow integration (int-015) experienced a partial sync failure. 165 of 180 records synced successfully. 2 errors encountered during table access. Error count: 2.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'system',
    entityType: 'integrations',
    entityId: 'int-015',
    readStatus: true,
    readAt: daysAndHoursAgo(0, 5),
    actionUrl: '/integrations/int-015',
    tags: ['integration', 'sync-warning', 'servicenow'],
    version: 1,
    created_at: daysAndHoursAgo(0, 8),
    updated_at: daysAndHoursAgo(0, 5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-023',
    type: 'demand_approval_required',
    channel: 'in_app',
    recipient: 'user-003',
    subject: 'Approval Required: Automate Document Management Test Suite',
    message: 'Demand dem-022 "Automate Document Management Test Suite" is pending your approval. This is a critical gap identified by test automation standards governance (gov-013). Estimated effort: 21 story points.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-008',
    entityType: 'demands',
    entityId: 'dem-022',
    readStatus: false,
    readAt: null,
    actionUrl: '/demands/dem-022',
    tags: ['demand', 'approval', 'automation', 'document-management'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-024',
    type: 'compliance_score_drop',
    channel: 'email',
    recipient: 'user-001',
    subject: 'Compliance Score Drop: Test Automation Standards',
    message: 'Governance procedure gov-013 "Test Automation Standards" compliance rate has dropped to 75% (at risk). Key findings: Provider Directory automation coverage at 45%, Document Management has no automated tests, Credentialing System has 30% flaky test rate.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'governance-procedures',
    entityId: 'gov-013',
    readStatus: true,
    readAt: daysAgo(19),
    actionUrl: '/governance/gov-013',
    tags: ['compliance', 'score-drop', 'test-automation', 'at-risk'],
    version: 1,
    created_at: daysAgo(20),
    updated_at: daysAgo(19),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-025',
    type: 'security_scan_complete',
    channel: 'in_app',
    recipient: 'user-010',
    subject: 'Security Scan Complete: EQIP Core - OWASP Top 10',
    message: 'OWASP Top 10 vulnerability scan for EQIP Core has completed. Results: 0 critical, 0 high, 2 medium (accepted risk), 5 low findings. Scan duration: 60 minutes.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'system',
    entityType: 'test-executions',
    entityId: 'exec-051',
    readStatus: true,
    readAt: daysAgo(3),
    actionUrl: '/test-assets/tc-024',
    tags: ['security', 'scan-complete', 'owasp', 'eqip-core'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-026',
    type: 'performance_test_complete',
    channel: 'in_app',
    recipient: 'user-009',
    subject: 'Performance Test Complete: Dashboard Load Time',
    message: 'Performance test tc-021 "Verify dashboard load time under normal load" has completed successfully. P95 response time: 1.4 seconds (target: 2 seconds). Error rate: 0.02%.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'system',
    entityType: 'test-executions',
    entityId: 'exec-046',
    readStatus: true,
    readAt: daysAgo(5),
    actionUrl: '/test-assets/tc-021',
    tags: ['performance', 'test-complete', 'dashboard'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-027',
    type: 'drug_interaction_alert',
    channel: 'email',
    recipient: 'user-012',
    subject: 'Clinical Safety Alert: False Positive Drug Interaction',
    message: 'A false positive drug interaction alert has been identified in the Rx Platform (exec-041). Acetaminophen incorrectly flagged as having severe interaction with anticoagulants. Root cause: formulary data import column misalignment affecting 4 drug interaction mappings.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'user-008',
    entityType: 'test-executions',
    entityId: 'exec-041',
    readStatus: true,
    readAt: daysAndHoursAgo(2, 1),
    actionUrl: '/test-assets/tc-018',
    tags: ['clinical-safety', 'drug-interaction', 'false-positive', 'pharmacy'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAndHoursAgo(2, 1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-028',
    type: 'release_approval_complete',
    channel: 'in_app',
    recipient: 'user-001',
    subject: 'Release Approved: Release 2024.14 - Compliance Dashboard',
    message: 'Release 2024.14 for Compliance Dashboard has received all required approvals. QA Lead, Release Manager, and VP of Quality have approved. Quality score: 97. Deployment to production is authorized.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-001',
    entityType: 'releases',
    entityId: 'rel-009',
    readStatus: true,
    readAt: daysAgo(5),
    actionUrl: '/releases/rel-009',
    tags: ['release', 'approved', 'compliance-dashboard'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-029',
    type: 'environment_reservation',
    channel: 'in_app',
    recipient: 'user-005',
    subject: 'Environment Reserved: STG-Claims',
    message: 'You have reserved the STG-Claims staging environment for regression test execution. Reservation period: ' + daysAgo(1) + ' to ' + daysAgo(-2) + '.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'user-005',
    entityType: 'environments',
    entityId: 'env-006',
    readStatus: true,
    readAt: daysAgo(1),
    actionUrl: '/environments/env-006',
    tags: ['environment', 'reservation', 'staging', 'claims'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-030',
    type: 'demand_on_hold',
    channel: 'in_app',
    recipient: 'user-018',
    subject: 'Demand On Hold: Billing Portal Transaction Log Migration',
    message: 'Demand dem-027 "Data Migration for Billing Portal Transaction Logs" has been placed on hold pending cold storage infrastructure provisioning.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'user-018',
    entityType: 'demands',
    entityId: 'dem-027',
    readStatus: true,
    readAt: daysAgo(7),
    actionUrl: '/demands/dem-027',
    tags: ['demand', 'on-hold', 'data-migration', 'billing'],
    version: 1,
    created_at: daysAgo(8),
    updated_at: daysAgo(7),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-031',
    type: 'accessibility_finding',
    channel: 'in_app',
    recipient: 'user-006',
    subject: 'Accessibility Finding: Billing Portal Payment Form',
    message: 'Accessibility compliance review (gov-005) has identified 3 input fields missing ARIA labels on the Billing Portal payment form. Error messages have insufficient color contrast (below 4.5:1 ratio).',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'system',
    entityType: 'governance-procedures',
    entityId: 'gov-005',
    readStatus: true,
    readAt: daysAgo(7),
    actionUrl: '/governance/gov-005',
    tags: ['accessibility', 'finding', 'aria', 'billing-portal'],
    version: 1,
    created_at: daysAgo(8),
    updated_at: daysAgo(7),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-032',
    type: 'test_data_stale',
    channel: 'in_app',
    recipient: 'user-014',
    subject: 'Test Data Stale: Document Management Test Files',
    message: 'Test data set td-020 "Document Management Test Files" has been marked as stale. Last refreshed 45 days ago, exceeding the 30-day freshness threshold. Some PDF documents may contain unmasked PII in embedded images.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'system',
    entityType: 'test-data',
    entityId: 'td-020',
    readStatus: false,
    readAt: null,
    actionUrl: '/test-data/td-020',
    tags: ['test-data', 'stale', 'document-management', 'pii-risk'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-033',
    type: 'release_approval_request',
    channel: 'in_app',
    recipient: 'user-023',
    subject: 'Approval Required: Release 2024.08 - Member Portal',
    message: 'Release 2024.08 for Member Portal is pending your approval as Product Owner. QA Lead has approved. Accessibility audit and UAT sign-off are in review.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'user-003',
    entityType: 'releases',
    entityId: 'rel-003',
    readStatus: false,
    readAt: null,
    actionUrl: '/releases/rel-003',
    tags: ['release', 'approval', 'pending', 'member-portal'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-034',
    type: 'demand_security_patch',
    channel: 'email',
    recipient: 'user-019',
    subject: 'Security Patch Assigned: Stored XSS Vulnerability Fix',
    message: 'You have been assigned to demand dem-013 "Stored XSS Vulnerability Fix in Release Notes". Priority: P1, Severity: Critical. Apply DOMPurify sanitization and add Content-Security-Policy header. Must be resolved before Release 2024.06 deployment.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'user-001',
    entityType: 'demands',
    entityId: 'dem-013',
    readStatus: true,
    readAt: daysAgo(4),
    actionUrl: '/demands/dem-013',
    tags: ['demand', 'security-patch', 'xss', 'critical'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(4),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-035',
    type: 'metrics_recalculated',
    channel: 'in_app',
    recipient: 'user-001',
    subject: 'Enterprise Quality Score Updated',
    message: 'The Enterprise Quality Score has been recalculated. Current score: 82.5 (Grade: B). Key improvements: Test Case Pass Rate increased to 97.78%. Areas needing attention: Automation Coverage at 63.2%.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'system',
    entityType: 'metrics',
    entityId: 'metric-enterprise_quality_score',
    readStatus: true,
    readAt: daysAndHoursAgo(0, 2),
    actionUrl: '/metrics',
    tags: ['metrics', 'quality-score', 'recalculated'],
    version: 1,
    created_at: daysAndHoursAgo(0, 5),
    updated_at: daysAndHoursAgo(0, 2),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-036',
    type: 'hipaa_compliance_update',
    channel: 'email',
    recipient: 'user-001',
    subject: 'HIPAA Compliance: Audit Trail Retention Extended',
    message: 'Demand dem-006 "HIPAA Audit Trail Retention Extension" has been completed. Audit trail retention for Claims Analytics has been extended from 5 years to 7 years. 2.3M audit records migrated successfully.',
    status: 'delivered',
    priority: 'medium',
    triggeredBy: 'user-022',
    entityType: 'demands',
    entityId: 'dem-006',
    readStatus: true,
    readAt: daysAgo(44),
    actionUrl: '/demands/dem-006',
    tags: ['compliance', 'hipaa', 'audit-trail', 'completed'],
    version: 1,
    created_at: daysAgo(45),
    updated_at: daysAgo(44),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-037',
    type: 'test_suite_execution_complete',
    channel: 'in_app',
    recipient: 'user-005',
    subject: 'Test Suite Complete: Compliance Dashboard Smoke Suite',
    message: 'Test suite suite-010 "Compliance Dashboard Smoke Suite" execution has completed. Pass rate: 100%. All 3 test cases passed. Total duration: 72 seconds.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'system',
    entityType: 'test-suites',
    entityId: 'suite-010',
    readStatus: true,
    readAt: daysAgo(1),
    actionUrl: '/test-assets/suite-010',
    tags: ['test-suite', 'complete', 'compliance', 'smoke'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-038',
    type: 'release_status_change',
    channel: 'in_app',
    recipient: 'user-013',
    subject: 'Release 2024.07 Pipeline Blocked',
    message: 'Release 2024.07 for Payment Gateway has a blocked deployment pipeline. Integration tests are failing and the quality gate has failed. 2 critical defects remain open in the payment reconciliation module.',
    status: 'delivered',
    priority: 'high',
    triggeredBy: 'system',
    entityType: 'releases',
    entityId: 'rel-002',
    readStatus: true,
    readAt: daysAndHoursAgo(0, 3),
    actionUrl: '/releases/rel-002',
    tags: ['release', 'pipeline-blocked', 'payment-gateway'],
    version: 1,
    created_at: daysAndHoursAgo(0, 6),
    updated_at: daysAndHoursAgo(0, 3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-039',
    type: 'governance_finding_resolved',
    channel: 'in_app',
    recipient: 'user-003',
    subject: 'Finding Resolved: Provider Directory Critical Defect SLA',
    message: 'Governance finding find-015-01 "Provider Directory critical defect resolution exceeded 24-hour SLA" has been resolved by user-007. Defect management process compliance score: 91%.',
    status: 'delivered',
    priority: 'low',
    triggeredBy: 'user-007',
    entityType: 'governance-procedures',
    entityId: 'gov-015',
    readStatus: true,
    readAt: daysAgo(3),
    actionUrl: '/governance/gov-015',
    tags: ['governance', 'finding-resolved', 'defect-management'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'notif-040',
    type: 'application_quality_drop',
    channel: 'in_app',
    recipient: 'user-011',
    subject: 'Quality Score Drop: Provider Directory',
    message: 'Provider Directory application quality score has dropped to 65 (high risk). Automation coverage is at 45%, defect density is 0.95, and governance compliance is at 72%. Immediate attention required.',
    status: 'delivered',
    priority: 'critical',
    triggeredBy: 'system',
    entityType: 'applications',
    entityId: 'app-008',
    readStatus: false,
    readAt: null,
    actionUrl: '/applications/app-008',
    tags: ['application', 'quality-drop', 'provider-directory', 'high-risk'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'system',
    updated_by: 'system',
  },
];

export default notifications;

/**
 * Get all mock notifications.
 * @returns {Array<object>} Array of notification objects.
 */
export function getAllNotifications() {
  return [...notifications];
}

/**
 * Find a notification by ID.
 * @param {string} id - The notification ID to find.
 * @returns {object|null} The notification object, or null if not found.
 */
export function getNotificationById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return notifications.find((notif) => notif.id === id) || null;
}

/**
 * Get all notifications for a specific recipient.
 * @param {string} recipientId - The recipient user ID.
 * @returns {Array<object>} Array of notifications for the specified recipient.
 */
export function getNotificationsByRecipient(recipientId) {
  if (!recipientId || typeof recipientId !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.recipient === recipientId);
}

/**
 * Get all notifications with a specific type.
 * @param {string} type - The notification type to filter by.
 * @returns {Array<object>} Array of notifications with the specified type.
 */
export function getNotificationsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.type === type);
}

/**
 * Get all notifications with a specific channel.
 * @param {string} channel - The channel to filter by (e.g., 'in_app', 'email').
 * @returns {Array<object>} Array of notifications with the specified channel.
 */
export function getNotificationsByChannel(channel) {
  if (!channel || typeof channel !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.channel === channel);
}

/**
 * Get all notifications with a specific status.
 * @param {string} status - The status to filter by (e.g., 'delivered', 'pending', 'failed').
 * @returns {Array<object>} Array of notifications with the specified status.
 */
export function getNotificationsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.status === status);
}

/**
 * Get all notifications with a specific priority.
 * @param {string} priority - The priority to filter by (e.g., 'critical', 'high', 'medium', 'low').
 * @returns {Array<object>} Array of notifications with the specified priority.
 */
export function getNotificationsByPriority(priority) {
  if (!priority || typeof priority !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.priority === priority);
}

/**
 * Get all notifications triggered by a specific user.
 * @param {string} userId - The user ID who triggered the notification.
 * @returns {Array<object>} Array of notifications triggered by the specified user.
 */
export function getNotificationsByTriggeredBy(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return notifications.filter((notif) => notif.triggeredBy === userId);
}

/**
 * Get all notifications for a specific entity.
 * @param {string} entityType - The entity type to filter by.
 * @param {string} entityId - The entity ID to filter by.
 * @returns {Array<object>} Array of notifications for the specified entity.
 */
export function getNotificationsByEntity(entityType, entityId) {
  if (!entityType || typeof entityType !== 'string') {
    return [];
  }
  if (!entityId || typeof entityId !== 'string') {
    return [];
  }
  return notifications.filter(
    (notif) => notif.entityType === entityType && notif.entityId === entityId,
  );
}

/**
 * Get all unread notifications for a specific recipient.
 * @param {string} recipientId - The recipient user ID.
 * @returns {Array<object>} Array of unread notifications for the specified recipient.
 */
export function getUnreadNotifications(recipientId) {
  if (!recipientId || typeof recipientId !== 'string') {
    return notifications.filter((notif) => notif.readStatus === false);
  }
  return notifications.filter(
    (notif) => notif.recipient === recipientId && notif.readStatus === false,
  );
}

/**
 * Get all read notifications for a specific recipient.
 * @param {string} recipientId - The recipient user ID.
 * @returns {Array<object>} Array of read notifications for the specified recipient.
 */
export function getReadNotifications(recipientId) {
  if (!recipientId || typeof recipientId !== 'string') {
    return notifications.filter((notif) => notif.readStatus === true);
  }
  return notifications.filter(
    (notif) => notif.recipient === recipientId && notif.readStatus === true,
  );
}

/**
 * Get distinct notification types from the notification data.
 * @returns {string[]} Array of unique notification type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].type) {
      types.add(notifications[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct channels from the notification data.
 * @returns {string[]} Array of unique channel strings.
 */
export function getDistinctChannels() {
  const channels = new Set();
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].channel) {
      channels.add(notifications[i].channel);
    }
  }
  return [...channels].sort();
}

/**
 * Get distinct priorities from the notification data.
 * @returns {string[]} Array of unique priority strings.
 */
export function getDistinctPriorities() {
  const priorities = new Set();
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].priority) {
      priorities.add(notifications[i].priority);
    }
  }
  return [...priorities].sort();
}

/**
 * Get distinct entity types from the notification data.
 * @returns {string[]} Array of unique entity type strings.
 */
export function getDistinctEntityTypes() {
  const entityTypes = new Set();
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].entityType) {
      entityTypes.add(notifications[i].entityType);
    }
  }
  return [...entityTypes].sort();
}

/**
 * Get a count of notifications grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getNotificationCountByType() {
  const counts = {};
  for (let i = 0; i < notifications.length; i++) {
    const type = notifications[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of notifications grouped by channel.
 * @returns {object} Object with channel keys and count values.
 */
export function getNotificationCountByChannel() {
  const counts = {};
  for (let i = 0; i < notifications.length; i++) {
    const channel = notifications[i].channel;
    counts[channel] = (counts[channel] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of notifications grouped by priority.
 * @returns {object} Object with priority keys and count values.
 */
export function getNotificationCountByPriority() {
  const counts = {};
  for (let i = 0; i < notifications.length; i++) {
    const priority = notifications[i].priority;
    counts[priority] = (counts[priority] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of notifications grouped by read status.
 * @returns {object} Object with read status keys and count values.
 */
export function getNotificationCountByReadStatus() {
  let read = 0;
  let unread = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].readStatus === true) {
      read += 1;
    } else {
      unread += 1;
    }
  }
  return { read, unread };
}

/**
 * Get the total count of unread notifications.
 * @returns {number} Total count of unread notifications.
 */
export function getTotalUnreadCount() {
  let count = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].readStatus === false) {
      count += 1;
    }
  }
  return count;
}

/**
 * Get the total count of unread notifications for a specific recipient.
 * @param {string} recipientId - The recipient user ID.
 * @returns {number} Total count of unread notifications for the recipient.
 */
export function getUnreadCountForRecipient(recipientId) {
  if (!recipientId || typeof recipientId !== 'string') {
    return 0;
  }
  let count = 0;
  for (let i = 0; i < notifications.length; i++) {
    if (notifications[i].recipient === recipientId && notifications[i].readStatus === false) {
      count += 1;
    }
  }
  return count;
}

/**
 * Get notifications sorted by created_at in descending order (newest first).
 * @param {number} [limit] - Optional maximum number of notifications to return.
 * @returns {Array<object>} Array of notifications sorted by creation date.
 */
export function getRecentNotifications(limit) {
  const sorted = [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
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
 * Get recent notifications for a specific recipient, sorted by created_at descending.
 * @param {string} recipientId - The recipient user ID.
 * @param {number} [limit] - Optional maximum number of notifications to return.
 * @returns {Array<object>} Array of notifications for the recipient sorted by creation date.
 */
export function getRecentNotificationsForRecipient(recipientId, limit) {
  if (!recipientId || typeof recipientId !== 'string') {
    return [];
  }
  const recipientNotifs = notifications.filter((notif) => notif.recipient === recipientId);
  const sorted = recipientNotifs.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
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
 * Search notifications by subject or message (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching notification objects.
 */
export function searchNotifications(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return notifications.filter(
    (notif) =>
      (notif.subject && notif.subject.toLowerCase().includes(queryLower)) ||
      (notif.message && notif.message.toLowerCase().includes(queryLower)),
  );
}

/**
 * Get a summary of notification metrics.
 * @returns {object} Summary object with notification metrics.
 */
export function getNotificationSummary() {
  const total = notifications.length;
  let read = 0;
  let unread = 0;
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let inApp = 0;
  let email = 0;

  for (let i = 0; i < notifications.length; i++) {
    const notif = notifications[i];

    if (notif.readStatus === true) {
      read += 1;
    } else {
      unread += 1;
    }

    if (notif.priority === 'critical') critical += 1;
    else if (notif.priority === 'high') high += 1;
    else if (notif.priority === 'medium') medium += 1;
    else if (notif.priority === 'low') low += 1;

    if (notif.channel === 'in_app') inApp += 1;
    else if (notif.channel === 'email') email += 1;
  }

  return {
    total,
    read,
    unread,
    readRate: total > 0 ? Math.round((read / total) * 10000) / 100 : 0,
    critical,
    high,
    medium,
    low,
    inApp,
    email,
  };
}