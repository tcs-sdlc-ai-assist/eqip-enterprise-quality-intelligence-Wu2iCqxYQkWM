import { v4 as uuidv4 } from 'uuid';

/**
 * @module demands
 * Mock demand management data seed for eQIP Quality Intelligence.
 * Demand items covering all 10 PRD-specified demand types with comprehensive fields
 * including id, title, type, description, priority, status, requestedBy, assignedTo,
 * approvalStatus, workflowState, segment, application, createdAt, updatedAt, and audit fields.
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
 * Mock demand data array.
 * Each demand includes id, title, type, description, priority, severity, status,
 * requestedBy, assignedTo, approvalStatus, workflowState, segment, application,
 * estimatedEffort, actualEffort, targetRelease, acceptanceCriteria, dependencies,
 * comments, attachments, tags, version, and audit fields.
 * @type {Array<object>}
 */
const demands = [
  {
    id: 'dem-001',
    title: 'Claims Dashboard Filter Enhancement',
    type: 'Feature',
    description: 'Add advanced filtering capabilities to the claims dashboard including date range, claim type, and provider filters. Users should be able to save filter presets for quick access.',
    priority: 'p1',
    severity: 'high',
    status: 'in_progress',
    requestedBy: 'user-022',
    assignedTo: 'user-005',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Claims',
    application: 'EQIP Core',
    estimatedEffort: 13,
    actualEffort: 8,
    targetRelease: 'rel-001',
    acceptanceCriteria: [
      'Users can filter claims by date range, claim type, and provider',
      'Filter presets can be saved and loaded',
      'Filters persist across browser sessions',
      'Dashboard updates within 2 seconds after filter application',
    ],
    dependencies: ['dem-003'],
    comments: [
      { id: 'cmt-001-01', userId: 'user-022', text: 'This is critical for Q3 reporting needs.', createdAt: daysAgo(28) },
      { id: 'cmt-001-02', userId: 'user-003', text: 'Test plan approved. Automation scripts in progress.', createdAt: daysAgo(15) },
      { id: 'cmt-001-03', userId: 'user-005', text: 'Filter persistence implemented using localStorage.', createdAt: daysAgo(5) },
    ],
    attachments: [
      { id: 'att-001-01', name: 'filter-mockup.png', type: 'image/png', uploadedBy: 'user-022', uploadedAt: daysAgo(30) },
      { id: 'att-001-02', name: 'filter-requirements.pdf', type: 'application/pdf', uploadedBy: 'user-022', uploadedAt: daysAgo(29) },
    ],
    tags: ['dashboard', 'filters', 'claims', 'ux'],
    version: 3,
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
    created_by: 'user-022',
    updated_by: 'user-005',
  },
  {
    id: 'dem-002',
    title: 'Payment Reconciliation Module Improvement',
    type: 'Enhancement',
    description: 'Improve the payment reconciliation module to handle T+1 settlement date normalization and reduce false discrepancies in reconciliation reports.',
    priority: 'p1',
    severity: 'high',
    status: 'in_progress',
    requestedBy: 'user-013',
    assignedTo: 'user-020',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Billing',
    application: 'Payment Gateway',
    estimatedEffort: 8,
    actualEffort: 5,
    targetRelease: 'rel-002',
    acceptanceCriteria: [
      'Settlement date normalization accounts for T+1 banking windows',
      'Configurable settlement offset per payment processor',
      'Reconciliation accuracy improves to 99.8% or higher',
      'Existing reconciliation reports remain backward compatible',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-002-01', userId: 'user-013', text: 'This is causing 0.2% false discrepancies in monthly reports.', createdAt: daysAgo(18) },
      { id: 'cmt-002-02', userId: 'user-009', text: 'Root cause confirmed: T+1 settlement offset not accounted for.', createdAt: daysAgo(12) },
    ],
    attachments: [
      { id: 'att-002-01', name: 'reconciliation-analysis.xlsx', type: 'application/vnd.ms-excel', uploadedBy: 'user-009', uploadedAt: daysAgo(14) },
    ],
    tags: ['payments', 'reconciliation', 'billing', 'data-quality'],
    version: 2,
    created_at: daysAgo(20),
    updated_at: daysAgo(1),
    created_by: 'user-013',
    updated_by: 'user-020',
  },
  {
    id: 'dem-003',
    title: 'Fix Claims Duplication Detection False Positives',
    type: 'Bug Fix',
    description: 'The claims duplication detection engine is generating false positives for claims with the same provider but different service dates. The matching algorithm needs to include service date as a required match field.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-003',
    assignedTo: 'user-008',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Claims',
    application: 'Claims Processing',
    estimatedEffort: 5,
    actualEffort: 4,
    targetRelease: 'rel-005',
    acceptanceCriteria: [
      'Duplication detection includes service date as a required match field',
      'False positive rate drops below 0.5%',
      'Existing duplicate detection rules remain functional',
      'Unit tests cover all matching field combinations',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-003-01', userId: 'user-003', text: 'Identified during regression testing of Release 2024.10.', createdAt: daysAgo(40) },
      { id: 'cmt-003-02', userId: 'user-008', text: 'Fix deployed and verified. False positive rate now at 0.03%.', createdAt: daysAgo(25) },
    ],
    attachments: [],
    tags: ['claims', 'deduplication', 'bug', 'data-quality'],
    version: 4,
    created_at: daysAgo(42),
    updated_at: daysAgo(22),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'dem-004',
    title: 'Refactor Legacy Payment Validation Logic',
    type: 'Technical Debt',
    description: 'Refactor the legacy payment validation module to improve testability and reduce cyclomatic complexity. Current unit test coverage is at 60% due to tightly coupled dependencies.',
    priority: 'p3',
    severity: 'medium',
    status: 'active',
    requestedBy: 'user-020',
    assignedTo: 'user-020',
    approvalStatus: 'approved',
    workflowState: 'planning',
    segment: 'Billing',
    application: 'Payment Gateway',
    estimatedEffort: 13,
    actualEffort: 0,
    targetRelease: 'rel-002',
    acceptanceCriteria: [
      'Payment validation logic is decoupled from external dependencies',
      'Unit test coverage reaches 80% or higher',
      'Cyclomatic complexity reduced to 10 or below per function',
      'No functional regression in payment validation behavior',
    ],
    dependencies: ['dem-002'],
    comments: [
      { id: 'cmt-004-01', userId: 'user-020', text: 'This is blocking our ability to reach the 80% unit test coverage gate.', createdAt: daysAgo(15) },
      { id: 'cmt-004-02', userId: 'user-004', text: 'Approved for next sprint. Please coordinate with QA for regression testing.', createdAt: daysAgo(10) },
    ],
    attachments: [
      { id: 'att-004-01', name: 'refactoring-plan.md', type: 'text/markdown', uploadedBy: 'user-020', uploadedAt: daysAgo(14) },
    ],
    tags: ['technical-debt', 'refactoring', 'payments', 'testability'],
    version: 2,
    created_at: daysAgo(16),
    updated_at: daysAgo(3),
    created_by: 'user-020',
    updated_by: 'user-004',
  },
  {
    id: 'dem-005',
    title: 'Apply TLS 1.3 Configuration to Provider Directory',
    type: 'Security Patch',
    description: 'Update the Provider Directory staging environment to use TLS 1.3 configuration. Current TLS 1.2 configuration has been flagged by the security compliance check as outdated.',
    priority: 'p1',
    severity: 'critical',
    status: 'in_progress',
    requestedBy: 'user-010',
    assignedTo: 'user-011',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Provider',
    application: 'Provider Directory',
    estimatedEffort: 3,
    actualEffort: 2,
    targetRelease: 'rel-004',
    acceptanceCriteria: [
      'All environments use TLS 1.3 or higher',
      'Security scan passes with no TLS-related findings',
      'No service disruption during TLS upgrade',
      'Certificate chain validation passes on all endpoints',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-005-01', userId: 'user-010', text: 'Flagged during bi-weekly security compliance check. High priority.', createdAt: daysAgo(12) },
      { id: 'cmt-005-02', userId: 'user-011', text: 'TLS 1.3 configuration applied to staging. Production deployment pending CAB approval.', createdAt: daysAgo(5) },
    ],
    attachments: [
      { id: 'att-005-01', name: 'tls-scan-report.pdf', type: 'application/pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(12) },
    ],
    tags: ['security', 'tls', 'provider', 'compliance'],
    version: 3,
    created_at: daysAgo(14),
    updated_at: daysAgo(2),
    created_by: 'user-010',
    updated_by: 'user-011',
  },
  {
    id: 'dem-006',
    title: 'HIPAA Audit Trail Retention Extension',
    type: 'Compliance',
    description: 'Extend audit trail retention period for Claims Analytics from 5 years to 7 years to meet HIPAA regulatory requirements. Includes data migration for existing audit records.',
    priority: 'p2',
    severity: 'high',
    status: 'completed',
    requestedBy: 'user-001',
    assignedTo: 'user-022',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Claims',
    application: 'Claims Analytics',
    estimatedEffort: 8,
    actualEffort: 10,
    targetRelease: 'rel-005',
    acceptanceCriteria: [
      'Audit trail retention period is set to 7 years',
      'Existing audit records are migrated to extended retention',
      'Storage capacity planning accounts for 7-year retention',
      'Regulatory compliance audit passes for HIPAA audit trail requirements',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-006-01', userId: 'user-001', text: 'Identified during Q1 regulatory compliance audit. Must be resolved before Q3 audit.', createdAt: daysAgo(85) },
      { id: 'cmt-006-02', userId: 'user-022', text: 'Migration completed. 2.3M audit records extended to 7-year retention.', createdAt: daysAgo(55) },
      { id: 'cmt-006-03', userId: 'user-001', text: 'Verified during Q2 compliance review. Closing demand.', createdAt: daysAgo(45) },
    ],
    attachments: [
      { id: 'att-006-01', name: 'hipaa-audit-finding.pdf', type: 'application/pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(88) },
      { id: 'att-006-02', name: 'migration-report.pdf', type: 'application/pdf', uploadedBy: 'user-022', uploadedAt: daysAgo(56) },
    ],
    tags: ['compliance', 'hipaa', 'audit-trail', 'data-retention'],
    version: 5,
    created_at: daysAgo(90),
    updated_at: daysAgo(45),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'dem-007',
    title: 'Upgrade Database Connection Pool for Claims Processing',
    type: 'Infrastructure',
    description: 'Increase the database connection pool size from 10 to 50 for the Claims Processing member lookup service. Current pool size causes API timeouts during peak load periods.',
    priority: 'p2',
    severity: 'high',
    status: 'completed',
    requestedBy: 'user-009',
    assignedTo: 'user-018',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Claims',
    application: 'Claims Processing',
    estimatedEffort: 3,
    actualEffort: 2,
    targetRelease: 'rel-005',
    acceptanceCriteria: [
      'Connection pool size increased to 50',
      'Connection pool monitoring alerts configured',
      'No API timeouts during peak load testing',
      'Circuit breaker pattern implemented for member lookup API',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-007-01', userId: 'user-009', text: 'Root cause of test failure exec-004. Connection pool exhaustion during peak load.', createdAt: daysAgo(28) },
      { id: 'cmt-007-02', userId: 'user-018', text: 'Pool size increased. Monitoring alerts configured. Circuit breaker implemented.', createdAt: daysAgo(20) },
      { id: 'cmt-007-03', userId: 'user-009', text: 'Verified under load. No timeouts observed in 24-hour soak test.', createdAt: daysAgo(18) },
    ],
    attachments: [
      { id: 'att-007-01', name: 'connection-pool-analysis.pdf', type: 'application/pdf', uploadedBy: 'user-009', uploadedAt: daysAgo(28) },
    ],
    tags: ['infrastructure', 'database', 'connection-pool', 'performance'],
    version: 3,
    created_at: daysAgo(30),
    updated_at: daysAgo(16),
    created_by: 'user-009',
    updated_by: 'user-018',
  },
  {
    id: 'dem-008',
    title: 'Migrate Provider Credentialing Data to New Schema',
    type: 'Data Migration',
    description: 'Migrate provider credentialing data from the legacy schema to the new normalized schema. Includes data validation, transformation, and reconciliation steps.',
    priority: 'p2',
    severity: 'medium',
    status: 'in_progress',
    requestedBy: 'user-011',
    assignedTo: 'user-007',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Provider',
    application: 'Credentialing System',
    estimatedEffort: 13,
    actualEffort: 8,
    targetRelease: null,
    acceptanceCriteria: [
      'All provider credentialing records migrated to new schema',
      'Data validation passes with zero critical errors',
      'Reconciliation report shows 100% record count match',
      'Rollback procedure tested and documented',
      'No data loss during migration',
    ],
    dependencies: ['dem-012'],
    comments: [
      { id: 'cmt-008-01', userId: 'user-011', text: 'Legacy schema is blocking the provider directory sync improvements.', createdAt: daysAgo(35) },
      { id: 'cmt-008-02', userId: 'user-007', text: 'Phase 1 migration complete: 850 out of 1200 records migrated. Phase 2 in progress.', createdAt: daysAgo(10) },
    ],
    attachments: [
      { id: 'att-008-01', name: 'migration-plan.pdf', type: 'application/pdf', uploadedBy: 'user-007', uploadedAt: daysAgo(32) },
      { id: 'att-008-02', name: 'schema-mapping.xlsx', type: 'application/vnd.ms-excel', uploadedBy: 'user-007', uploadedAt: daysAgo(30) },
    ],
    tags: ['data-migration', 'provider', 'credentialing', 'schema'],
    version: 4,
    created_at: daysAgo(38),
    updated_at: daysAgo(3),
    created_by: 'user-011',
    updated_by: 'user-007',
  },
  {
    id: 'dem-009',
    title: 'Integrate Rx Platform with Formulary Data Provider',
    type: 'Integration',
    description: 'Integrate the Rx Platform with the external formulary data provider API to enable real-time drug formulary updates and interaction checking.',
    priority: 'p1',
    severity: 'high',
    status: 'in_progress',
    requestedBy: 'user-012',
    assignedTo: 'user-008',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Pharmacy',
    application: 'Rx Platform',
    estimatedEffort: 13,
    actualEffort: 7,
    targetRelease: 'rel-006',
    acceptanceCriteria: [
      'Real-time formulary data sync from external provider',
      'Drug interaction database updated within 24 hours of provider update',
      'API error handling with graceful fallback to cached data',
      'Data validation rules prevent incorrect formulary mappings',
      'Integration monitoring dashboard shows sync status',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-009-01', userId: 'user-012', text: 'Critical for resolving the false positive drug interaction alerts (DEF-RX-003).', createdAt: daysAgo(22) },
      { id: 'cmt-009-02', userId: 'user-008', text: 'API integration complete. Data validation rules in progress.', createdAt: daysAgo(8) },
      { id: 'cmt-009-03', userId: 'user-003', text: 'Test plan approved. Integration tests being developed.', createdAt: daysAgo(5) },
    ],
    attachments: [
      { id: 'att-009-01', name: 'formulary-api-spec.yaml', type: 'application/yaml', uploadedBy: 'user-012', uploadedAt: daysAgo(24) },
      { id: 'att-009-02', name: 'integration-architecture.png', type: 'image/png', uploadedBy: 'user-008', uploadedAt: daysAgo(20) },
    ],
    tags: ['integration', 'pharmacy', 'formulary', 'external-api'],
    version: 3,
    created_at: daysAgo(25),
    updated_at: daysAgo(2),
    created_by: 'user-012',
    updated_by: 'user-008',
  },
  {
    id: 'dem-010',
    title: 'Evaluate Batch Sync Approach for Provider Directory',
    type: 'Research Spike',
    description: 'Research and evaluate batch synchronization approaches for the Provider Directory to replace the current single-call sync that times out with 1000+ provider records.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-007',
    assignedTo: 'user-021',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Provider',
    application: 'Provider Directory',
    estimatedEffort: 5,
    actualEffort: 4,
    targetRelease: null,
    acceptanceCriteria: [
      'Document at least 3 batch sync approaches with pros/cons',
      'Provide performance benchmarks for each approach',
      'Recommend preferred approach with justification',
      'Estimate implementation effort for recommended approach',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-010-01', userId: 'user-007', text: 'Sync job timing out consistently since provider count exceeded 1000. Need a scalable solution.', createdAt: daysAgo(20) },
      { id: 'cmt-010-02', userId: 'user-021', text: 'Spike complete. Recommending paginated batch sync with 100 records per batch. See attached report.', createdAt: daysAgo(12) },
      { id: 'cmt-010-03', userId: 'user-011', text: 'Approved recommendation. Creating implementation demand dem-012.', createdAt: daysAgo(10) },
    ],
    attachments: [
      { id: 'att-010-01', name: 'batch-sync-spike-report.pdf', type: 'application/pdf', uploadedBy: 'user-021', uploadedAt: daysAgo(12) },
      { id: 'att-010-02', name: 'performance-benchmarks.xlsx', type: 'application/vnd.ms-excel', uploadedBy: 'user-021', uploadedAt: daysAgo(12) },
    ],
    tags: ['research', 'spike', 'provider', 'sync', 'performance'],
    version: 3,
    created_at: daysAgo(22),
    updated_at: daysAgo(10),
    created_by: 'user-007',
    updated_by: 'user-011',
  },
  {
    id: 'dem-011',
    title: 'Member Portal Enrollment Flow Redesign',
    type: 'Feature',
    description: 'Redesign the member enrollment flow to improve user experience, reduce form abandonment, and add dependent enrollment capabilities. Includes accessibility improvements for WCAG 2.1 AA compliance.',
    priority: 'p1',
    severity: 'high',
    status: 'completed',
    requestedBy: 'user-023',
    assignedTo: 'user-006',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Enrollment',
    application: 'Member Portal',
    estimatedEffort: 21,
    actualEffort: 24,
    targetRelease: 'rel-003',
    acceptanceCriteria: [
      'Enrollment wizard supports step-by-step flow with progress indicator',
      'Dependent enrollment workflow is integrated',
      'Form abandonment rate reduced by 20% compared to baseline',
      'All enrollment forms pass WCAG 2.1 AA accessibility audit',
      'Enrollment confirmation with member ID is displayed on completion',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-011-01', userId: 'user-023', text: 'Current enrollment flow has 35% abandonment rate. Redesign is critical for open enrollment period.', createdAt: daysAgo(50) },
      { id: 'cmt-011-02', userId: 'user-006', text: 'Redesign complete. Accessibility audit passed with 0 critical violations.', createdAt: daysAgo(8) },
      { id: 'cmt-011-03', userId: 'user-014', text: 'UAT sign-off obtained. Abandonment rate reduced to 18% in pilot.', createdAt: daysAgo(4) },
    ],
    attachments: [
      { id: 'att-011-01', name: 'enrollment-wireframes.pdf', type: 'application/pdf', uploadedBy: 'user-023', uploadedAt: daysAgo(48) },
      { id: 'att-011-02', name: 'accessibility-audit-report.pdf', type: 'application/pdf', uploadedBy: 'user-006', uploadedAt: daysAgo(10) },
    ],
    tags: ['feature', 'enrollment', 'ux', 'accessibility', 'member-portal'],
    version: 6,
    created_at: daysAgo(55),
    updated_at: daysAgo(3),
    created_by: 'user-023',
    updated_by: 'user-014',
  },
  {
    id: 'dem-012',
    title: 'Implement Paginated Batch Sync for Provider Directory',
    type: 'Enhancement',
    description: 'Implement paginated batch synchronization for the Provider Directory based on the research spike findings (dem-010). Use 100 records per batch with retry logic and exponential backoff.',
    priority: 'p1',
    severity: 'high',
    status: 'active',
    requestedBy: 'user-011',
    assignedTo: 'user-007',
    approvalStatus: 'approved',
    workflowState: 'planning',
    segment: 'Provider',
    application: 'Provider Directory',
    estimatedEffort: 8,
    actualEffort: 0,
    targetRelease: 'rel-004',
    acceptanceCriteria: [
      'Batch sync processes 100 records per batch',
      'Retry logic with exponential backoff for failed batches',
      'Full sync of 1200+ records completes within 15 minutes',
      'Sync progress is logged and monitorable',
      'Rollback capability for partial sync failures',
    ],
    dependencies: ['dem-010'],
    comments: [
      { id: 'cmt-012-01', userId: 'user-011', text: 'Based on spike dem-010 recommendation. High priority to unblock provider data sync.', createdAt: daysAgo(9) },
      { id: 'cmt-012-02', userId: 'user-007', text: 'Planning in progress. Coordinating with credentialing team for API pagination support.', createdAt: daysAgo(5) },
    ],
    attachments: [
      { id: 'att-012-01', name: 'batch-sync-design.pdf', type: 'application/pdf', uploadedBy: 'user-007', uploadedAt: daysAgo(6) },
    ],
    tags: ['enhancement', 'provider', 'sync', 'batch', 'performance'],
    version: 2,
    created_at: daysAgo(10),
    updated_at: daysAgo(2),
    created_by: 'user-011',
    updated_by: 'user-007',
  },
  {
    id: 'dem-013',
    title: 'Stored XSS Vulnerability Fix in Release Notes',
    type: 'Security Patch',
    description: 'Fix the stored XSS vulnerability found in the EQIP Core release notes field. Apply DOMPurify sanitization on both server-side storage and client-side rendering. Add Content-Security-Policy header.',
    priority: 'p1',
    severity: 'critical',
    status: 'in_progress',
    requestedBy: 'user-010',
    assignedTo: 'user-019',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Enterprise',
    application: 'EQIP Core',
    estimatedEffort: 5,
    actualEffort: 3,
    targetRelease: 'rel-001',
    acceptanceCriteria: [
      'DOMPurify sanitization applied on server-side storage of release notes',
      'Client-side rendering uses sanitized rendering component instead of dangerouslySetInnerHTML',
      'Content-Security-Policy header restricts inline script execution',
      'Automated XSS regression tests added for all rich text fields',
      'Security scan passes with zero XSS findings',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-013-01', userId: 'user-010', text: 'Critical vulnerability found during security scan (exec-055). CVSS estimate: 6.1.', createdAt: daysAgo(4) },
      { id: 'cmt-013-02', userId: 'user-019', text: 'DOMPurify applied on both storage and rendering. CSP header added. Regression tests in progress.', createdAt: daysAgo(2) },
      { id: 'cmt-013-03', userId: 'user-001', text: 'Expedited review. Must be resolved before Release 2024.06 deployment.', createdAt: daysAgo(1) },
    ],
    attachments: [
      { id: 'att-013-01', name: 'xss-vulnerability-report.pdf', type: 'application/pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(4) },
      { id: 'att-013-02', name: 'xss-poc-screenshot.png', type: 'image/png', uploadedBy: 'user-010', uploadedAt: daysAgo(4) },
    ],
    tags: ['security', 'xss', 'critical', 'vulnerability', 'hotfix'],
    version: 3,
    created_at: daysAgo(5),
    updated_at: daysAgo(1),
    created_by: 'user-010',
    updated_by: 'user-001',
  },
  {
    id: 'dem-014',
    title: 'Add Export Functionality for Quality Metrics',
    type: 'Feature',
    description: 'Add CSV and PDF export functionality for quality metrics dashboards. Exports should include PII masking and support configurable date ranges.',
    priority: 'p3',
    severity: 'medium',
    status: 'active',
    requestedBy: 'user-012',
    assignedTo: 'user-005',
    approvalStatus: 'approved',
    workflowState: 'planning',
    segment: 'Enterprise',
    application: 'EQIP Core',
    estimatedEffort: 8,
    actualEffort: 0,
    targetRelease: 'rel-001',
    acceptanceCriteria: [
      'Users can export quality metrics as CSV',
      'Users can export quality metrics as PDF',
      'PII fields are masked in all exports',
      'Date range filter is applied to exported data',
      'Export includes timestamp and user information',
    ],
    dependencies: ['dem-001'],
    comments: [
      { id: 'cmt-014-01', userId: 'user-012', text: 'Needed for quarterly executive reporting. CSV format is minimum requirement.', createdAt: daysAgo(18) },
      { id: 'cmt-014-02', userId: 'user-005', text: 'Will leverage existing exportUtils module. Planning for next sprint.', createdAt: daysAgo(12) },
    ],
    attachments: [],
    tags: ['feature', 'export', 'metrics', 'reporting'],
    version: 1,
    created_at: daysAgo(20),
    updated_at: daysAgo(8),
    created_by: 'user-012',
    updated_by: 'user-005',
  },
  {
    id: 'dem-015',
    title: 'SOX Compliance Audit Trail Enhancement',
    type: 'Compliance',
    description: 'Enhance audit trail capabilities for SOX compliance including immutable audit records, tamper detection, and automated compliance reporting for financial data access.',
    priority: 'p2',
    severity: 'high',
    status: 'active',
    requestedBy: 'user-001',
    assignedTo: 'user-002',
    approvalStatus: 'approved',
    workflowState: 'planning',
    segment: 'Enterprise',
    application: 'EQIP Core',
    estimatedEffort: 13,
    actualEffort: 0,
    targetRelease: null,
    acceptanceCriteria: [
      'Audit records are immutable once created',
      'Tamper detection mechanism validates audit record integrity',
      'Automated SOX compliance report generation',
      'Financial data access events are logged with full context',
      'Audit trail retention meets SOX 7-year requirement',
    ],
    dependencies: ['dem-006'],
    comments: [
      { id: 'cmt-015-01', userId: 'user-001', text: 'Required for upcoming SOX audit in Q4. Planning phase should start immediately.', createdAt: daysAgo(14) },
      { id: 'cmt-015-02', userId: 'user-002', text: 'Architecture review scheduled. Will leverage existing audit log infrastructure.', createdAt: daysAgo(8) },
    ],
    attachments: [
      { id: 'att-015-01', name: 'sox-requirements.pdf', type: 'application/pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(14) },
    ],
    tags: ['compliance', 'sox', 'audit-trail', 'financial'],
    version: 2,
    created_at: daysAgo(16),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'dem-016',
    title: 'Optimize Claims Adjudication Engine Performance',
    type: 'Enhancement',
    description: 'Optimize the claims adjudication engine to reduce processing time for batch claims. Current batch processing of 10,000 claims takes 22 minutes; target is under 15 minutes.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-012',
    assignedTo: 'user-019',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Claims',
    application: 'Claims Processing',
    estimatedEffort: 8,
    actualEffort: 7,
    targetRelease: 'rel-005',
    acceptanceCriteria: [
      'Batch processing of 10,000 claims completes within 15 minutes',
      'No increase in error rate during batch processing',
      'Memory utilization remains below 85% during peak processing',
      'Performance improvement is verified by load test',
    ],
    dependencies: ['dem-007'],
    comments: [
      { id: 'cmt-016-01', userId: 'user-012', text: 'Batch processing time has been increasing. Need optimization before Q4 volume increase.', createdAt: daysAgo(50) },
      { id: 'cmt-016-02', userId: 'user-019', text: 'Optimized query execution plan and added connection pooling. Batch time reduced to 12 minutes.', createdAt: daysAgo(30) },
      { id: 'cmt-016-03', userId: 'user-009', text: 'Load test verified: 10,000 claims processed in 11.5 minutes. Memory peak at 72%.', createdAt: daysAgo(25) },
    ],
    attachments: [
      { id: 'att-016-01', name: 'performance-optimization-report.pdf', type: 'application/pdf', uploadedBy: 'user-019', uploadedAt: daysAgo(28) },
    ],
    tags: ['enhancement', 'performance', 'claims', 'batch-processing'],
    version: 4,
    created_at: daysAgo(55),
    updated_at: daysAgo(22),
    created_by: 'user-012',
    updated_by: 'user-009',
  },
  {
    id: 'dem-017',
    title: 'Add Drug Interaction Database Validation Rules',
    type: 'Bug Fix',
    description: 'Add data validation rules for formulary imports to detect column misalignment and prevent incorrect drug interaction mappings. Addresses the false positive alert issue (DEF-RX-003).',
    priority: 'p1',
    severity: 'critical',
    status: 'in_progress',
    requestedBy: 'user-008',
    assignedTo: 'user-008',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Pharmacy',
    application: 'Rx Platform',
    estimatedEffort: 5,
    actualEffort: 3,
    targetRelease: 'rel-006',
    acceptanceCriteria: [
      'Import validation detects column misalignment in formulary data files',
      'Imported interactions are reconciled against FDA drug interaction reference database',
      'Erroneous drug interaction mappings are corrected',
      'No false positive drug interaction alerts for validated drugs',
      'Import validation report is generated for each formulary update',
    ],
    dependencies: ['dem-009'],
    comments: [
      { id: 'cmt-017-01', userId: 'user-008', text: 'Root cause: formulary data import had column misalignment affecting 4 drug interaction mappings.', createdAt: daysAgo(3) },
      { id: 'cmt-017-02', userId: 'user-012', text: 'Clinical safety impact. Prioritize this fix.', createdAt: daysAgo(2) },
    ],
    attachments: [
      { id: 'att-017-01', name: 'drug-interaction-analysis.pdf', type: 'application/pdf', uploadedBy: 'user-008', uploadedAt: daysAgo(3) },
    ],
    tags: ['bug-fix', 'pharmacy', 'drug-interaction', 'clinical-safety', 'data-validation'],
    version: 2,
    created_at: daysAgo(4),
    updated_at: daysAgo(1),
    created_by: 'user-008',
    updated_by: 'user-012',
  },
  {
    id: 'dem-018',
    title: 'Underwriting Risk Scoring Model v2 Deployment',
    type: 'Feature',
    description: 'Deploy the updated risk scoring model v2 for the underwriting engine. Includes new risk factors, updated scoring weights, and integration with external credit data source.',
    priority: 'p2',
    severity: 'high',
    status: 'completed',
    requestedBy: 'user-011',
    assignedTo: 'user-005',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Underwriting',
    application: 'Underwriting Engine',
    estimatedEffort: 13,
    actualEffort: 14,
    targetRelease: 'rel-008',
    acceptanceCriteria: [
      'Risk scoring model v2 is deployed and active',
      'New risk factors are included in scoring calculations',
      'External credit data source integration is functional',
      'Scoring accuracy validated against historical data set',
      'Audit trail captures all scoring decisions with rule references',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-018-01', userId: 'user-011', text: 'Model v2 has been validated by actuarial team. Ready for deployment.', createdAt: daysAgo(30) },
      { id: 'cmt-018-02', userId: 'user-005', text: 'Deployment complete. All API tests passing. Audit trail verified.', createdAt: daysAgo(5) },
      { id: 'cmt-018-03', userId: 'user-003', text: 'QA sign-off obtained. Risk scoring accuracy at 94.2% against historical data.', createdAt: daysAgo(3) },
    ],
    attachments: [
      { id: 'att-018-01', name: 'risk-model-v2-spec.pdf', type: 'application/pdf', uploadedBy: 'user-011', uploadedAt: daysAgo(35) },
      { id: 'att-018-02', name: 'model-validation-report.pdf', type: 'application/pdf', uploadedBy: 'user-005', uploadedAt: daysAgo(6) },
    ],
    tags: ['feature', 'underwriting', 'risk-scoring', 'model', 'credit-data'],
    version: 5,
    created_at: daysAgo(40),
    updated_at: daysAgo(2),
    created_by: 'user-011',
    updated_by: 'user-003',
  },
  {
    id: 'dem-019',
    title: 'Policy Admin System UAT Environment Upgrade',
    type: 'Infrastructure',
    description: 'Upgrade the Policy Admin System UAT environment to match the current production version. UAT is currently running 2 versions behind production, causing test environment parity issues.',
    priority: 'p2',
    severity: 'high',
    status: 'active',
    requestedBy: 'user-003',
    assignedTo: 'user-018',
    approvalStatus: 'approved',
    workflowState: 'planning',
    segment: 'Policy Administration',
    application: 'Policy Admin System',
    estimatedEffort: 5,
    actualEffort: 0,
    targetRelease: null,
    acceptanceCriteria: [
      'UAT environment is upgraded to match production version',
      'Database schema is synchronized with production',
      'All environment health checks pass after upgrade',
      'Test data refresh is completed post-upgrade',
      'Environment parity validation report is generated',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-019-01', userId: 'user-003', text: 'UAT environment drift is causing false test failures. Blocking regression testing.', createdAt: daysAgo(12) },
      { id: 'cmt-019-02', userId: 'user-017', text: 'Scheduled for next maintenance window. Coordinating with DBA team.', createdAt: daysAgo(8) },
    ],
    attachments: [
      { id: 'att-019-01', name: 'env-drift-report.pdf', type: 'application/pdf', uploadedBy: 'user-003', uploadedAt: daysAgo(12) },
    ],
    tags: ['infrastructure', 'environment', 'uat', 'policy-admin', 'parity'],
    version: 2,
    created_at: daysAgo(14),
    updated_at: daysAgo(5),
    created_by: 'user-003',
    updated_by: 'user-017',
  },
  {
    id: 'dem-020',
    title: 'Compliance Dashboard Real-Time Monitoring Widgets',
    type: 'Feature',
    description: 'Add real-time compliance monitoring widgets to the Compliance Dashboard including compliance score trend, regulatory alert feed, and procedure status overview.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-001',
    assignedTo: 'user-005',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Regulatory Compliance',
    application: 'Compliance Dashboard',
    estimatedEffort: 8,
    actualEffort: 7,
    targetRelease: 'rel-009',
    acceptanceCriteria: [
      'Compliance score widget displays current score with trend indicator',
      'Regulatory alert widget shows active alerts with severity levels',
      'Procedure status overview shows compliance status for all procedures',
      'Widgets refresh automatically at configurable intervals',
      'Dashboard loads within 3 seconds with all widgets',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-020-01', userId: 'user-001', text: 'Essential for real-time compliance visibility across the organization.', createdAt: daysAgo(42) },
      { id: 'cmt-020-02', userId: 'user-005', text: 'All widgets implemented and tested. Dashboard load time at 1.8 seconds.', createdAt: daysAgo(8) },
      { id: 'cmt-020-03', userId: 'user-001', text: 'Approved. Excellent work on the real-time monitoring capabilities.', createdAt: daysAgo(6) },
    ],
    attachments: [
      { id: 'att-020-01', name: 'widget-mockups.pdf', type: 'application/pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(44) },
      { id: 'att-020-02', name: 'dashboard-screenshot.png', type: 'image/png', uploadedBy: 'user-005', uploadedAt: daysAgo(9) },
    ],
    tags: ['feature', 'compliance', 'dashboard', 'monitoring', 'real-time'],
    version: 4,
    created_at: daysAgo(45),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'dem-021',
    title: 'Accessibility Remediation for Billing Portal Payment Form',
    type: 'Bug Fix',
    description: 'Fix accessibility violations in the Billing Portal payment form including missing ARIA labels on 3 input fields and insufficient color contrast on error messages.',
    priority: 'p2',
    severity: 'medium',
    status: 'active',
    requestedBy: 'user-006',
    assignedTo: 'user-006',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Billing',
    application: 'Billing Portal',
    estimatedEffort: 3,
    actualEffort: 1,
    targetRelease: null,
    acceptanceCriteria: [
      'All payment form input fields have associated ARIA labels',
      'Error messages meet WCAG 2.1 AA color contrast requirements (4.5:1)',
      'axe DevTools scan shows zero critical or serious violations',
      'Screen reader testing confirms all fields are properly announced',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-021-01', userId: 'user-006', text: 'Found during accessibility compliance review (gov-005). 3 input fields missing ARIA labels.', createdAt: daysAgo(8) },
    ],
    attachments: [
      { id: 'att-021-01', name: 'axe-scan-billing-portal.html', type: 'text/html', uploadedBy: 'user-006', uploadedAt: daysAgo(8) },
    ],
    tags: ['accessibility', 'wcag', 'billing', 'aria', 'bug-fix'],
    version: 1,
    created_at: daysAgo(10),
    updated_at: daysAgo(3),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'dem-022',
    title: 'Automate Document Management Test Suite',
    type: 'Technical Debt',
    description: 'Create an automated test suite for the Document Management system which currently has no automated tests. This is a critical gap identified by the test automation standards governance procedure (gov-013).',
    priority: 'p2',
    severity: 'high',
    status: 'draft',
    requestedBy: 'user-008',
    assignedTo: null,
    approvalStatus: 'pending',
    workflowState: 'intake',
    segment: 'Policy Administration',
    application: 'Document Management',
    estimatedEffort: 21,
    actualEffort: 0,
    targetRelease: null,
    acceptanceCriteria: [
      'Automated test suite covers core document CRUD operations',
      'Test automation coverage reaches at least 50%',
      'Tests are integrated into CI/CD pipeline',
      'Test execution time is under 10 minutes',
      'Flaky test rate is below 5%',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-022-01', userId: 'user-008', text: 'Document Management is the only application with zero automated tests. Critical gap per gov-013.', createdAt: daysAgo(6) },
      { id: 'cmt-022-02', userId: 'user-003', text: 'Reviewing for approval. Need to assess resource availability.', createdAt: daysAgo(3) },
    ],
    attachments: [],
    tags: ['technical-debt', 'automation', 'testing', 'document-management'],
    version: 1,
    created_at: daysAgo(8),
    updated_at: daysAgo(3),
    created_by: 'user-008',
    updated_by: 'user-003',
  },
  {
    id: 'dem-023',
    title: 'Insurance Claims Photo Upload Feature',
    type: 'Feature',
    description: 'Implement photo upload capability for insurance claims to allow policyholders to submit photographic evidence of damage or loss directly through the claims portal.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-014',
    assignedTo: 'user-019',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Insurance Claims',
    application: 'Insurance Claims Portal',
    estimatedEffort: 5,
    actualEffort: 5,
    targetRelease: 'rel-010',
    acceptanceCriteria: [
      'Policyholders can upload photos in JPEG, PNG, and HEIC formats',
      'Maximum file size of 10MB per photo, up to 10 photos per claim',
      'Photos are stored securely with encryption at rest',
      'Uploaded photos are displayed in the claims detail view',
      'Alternative text guidance is provided for accessibility',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-023-01', userId: 'user-014', text: 'Highly requested feature by policyholders. Will reduce claims processing time.', createdAt: daysAgo(25) },
      { id: 'cmt-023-02', userId: 'user-019', text: 'Photo upload implemented with client-side compression. All formats supported.', createdAt: daysAgo(8) },
    ],
    attachments: [
      { id: 'att-023-01', name: 'photo-upload-mockup.png', type: 'image/png', uploadedBy: 'user-014', uploadedAt: daysAgo(24) },
    ],
    tags: ['feature', 'insurance-claims', 'photo-upload', 'evidence'],
    version: 3,
    created_at: daysAgo(28),
    updated_at: daysAgo(4),
    created_by: 'user-014',
    updated_by: 'user-019',
  },
  {
    id: 'dem-024',
    title: 'Actuarial Platform Data Export Enhancement',
    type: 'Enhancement',
    description: 'Enhance the Actuarial Platform data export capabilities to support additional output formats (Parquet, SAS) and add scheduled export functionality.',
    priority: 'p3',
    severity: 'low',
    status: 'draft',
    requestedBy: 'user-011',
    assignedTo: null,
    approvalStatus: 'pending',
    workflowState: 'intake',
    segment: 'Actuarial',
    application: 'Actuarial Platform',
    estimatedEffort: 8,
    actualEffort: 0,
    targetRelease: null,
    acceptanceCriteria: [
      'Export supports Parquet and SAS file formats',
      'Scheduled exports can be configured with cron-like scheduling',
      'Export notifications are sent upon completion',
      'Large dataset exports (>1GB) are handled without timeout',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-024-01', userId: 'user-011', text: 'Actuarial team needs Parquet format for integration with their modeling tools.', createdAt: daysAgo(7) },
    ],
    attachments: [],
    tags: ['enhancement', 'actuarial', 'export', 'data-formats'],
    version: 1,
    created_at: daysAgo(8),
    updated_at: daysAgo(7),
    created_by: 'user-011',
    updated_by: 'user-011',
  },
  {
    id: 'dem-025',
    title: 'Evaluate AI-Assisted Test Case Generation',
    type: 'Research Spike',
    description: 'Research and evaluate AI-assisted test case generation tools and approaches for potential integration into the EQIP quality intelligence platform.',
    priority: 'p3',
    severity: 'low',
    status: 'active',
    requestedBy: 'user-003',
    assignedTo: 'user-008',
    approvalStatus: 'approved',
    workflowState: 'in_progress',
    segment: 'Enterprise',
    application: 'EQIP Core',
    estimatedEffort: 5,
    actualEffort: 2,
    targetRelease: null,
    acceptanceCriteria: [
      'Evaluate at least 3 AI test generation tools/approaches',
      'Document pros, cons, and cost analysis for each approach',
      'Provide proof-of-concept with one selected tool',
      'Assess integration feasibility with existing test frameworks',
      'Present findings to QA leadership team',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-025-01', userId: 'user-003', text: 'Exploring AI capabilities to improve test coverage and reduce manual test creation effort.', createdAt: daysAgo(15) },
      { id: 'cmt-025-02', userId: 'user-008', text: 'Initial evaluation of 3 tools complete. Working on proof-of-concept with most promising option.', createdAt: daysAgo(5) },
    ],
    attachments: [
      { id: 'att-025-01', name: 'ai-test-gen-evaluation.pdf', type: 'application/pdf', uploadedBy: 'user-008', uploadedAt: daysAgo(6) },
    ],
    tags: ['research', 'spike', 'ai', 'test-generation', 'innovation'],
    version: 2,
    created_at: daysAgo(18),
    updated_at: daysAgo(3),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'dem-026',
    title: 'Claims Document OCR Processing Integration',
    type: 'Integration',
    description: 'Integrate OCR processing capabilities for claims document uploads to automatically extract key information from submitted documents.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-014',
    assignedTo: 'user-019',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Insurance Claims',
    application: 'Insurance Claims Portal',
    estimatedEffort: 13,
    actualEffort: 15,
    targetRelease: 'rel-010',
    acceptanceCriteria: [
      'OCR processing extracts text from uploaded PDF and image documents',
      'Extracted data is mapped to claim fields with confidence scores',
      'Manual review workflow for low-confidence extractions',
      'OCR processing completes within 30 seconds per document',
      'Supported formats: PDF, JPEG, PNG, TIFF',
    ],
    dependencies: ['dem-023'],
    comments: [
      { id: 'cmt-026-01', userId: 'user-014', text: 'OCR will significantly reduce manual data entry for claims processing.', createdAt: daysAgo(24) },
      { id: 'cmt-026-02', userId: 'user-019', text: 'OCR integration complete. Average processing time: 12 seconds. Confidence threshold set at 85%.', createdAt: daysAgo(6) },
    ],
    attachments: [
      { id: 'att-026-01', name: 'ocr-integration-design.pdf', type: 'application/pdf', uploadedBy: 'user-019', uploadedAt: daysAgo(22) },
    ],
    tags: ['integration', 'ocr', 'insurance-claims', 'document-processing'],
    version: 4,
    created_at: daysAgo(26),
    updated_at: daysAgo(3),
    created_by: 'user-014',
    updated_by: 'user-019',
  },
  {
    id: 'dem-027',
    title: 'Data Migration for Billing Portal Transaction Logs',
    type: 'Data Migration',
    description: 'Migrate Billing Portal transaction logs older than 3 years to cold storage to enforce data retention policy and reduce primary database size.',
    priority: 'p3',
    severity: 'low',
    status: 'on_hold',
    requestedBy: 'user-002',
    assignedTo: 'user-018',
    approvalStatus: 'approved',
    workflowState: 'on_hold',
    segment: 'Billing',
    application: 'Billing Portal',
    estimatedEffort: 5,
    actualEffort: 0,
    targetRelease: null,
    acceptanceCriteria: [
      'Transaction logs older than 3 years are migrated to cold storage',
      'Migrated data remains queryable through archive interface',
      'Primary database size reduced by at least 30%',
      'Data integrity verification passes post-migration',
      'Rollback procedure documented and tested',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-027-01', userId: 'user-002', text: 'Data privacy review (gov-004) identified this as a compliance gap.', createdAt: daysAgo(14) },
      { id: 'cmt-027-02', userId: 'user-018', text: 'On hold pending cold storage infrastructure provisioning.', createdAt: daysAgo(8) },
    ],
    attachments: [],
    tags: ['data-migration', 'billing', 'data-retention', 'cold-storage'],
    version: 2,
    created_at: daysAgo(16),
    updated_at: daysAgo(6),
    created_by: 'user-002',
    updated_by: 'user-018',
  },
  {
    id: 'dem-028',
    title: 'Content-Security-Policy Header for Billing Portal',
    type: 'Security Patch',
    description: 'Add missing Content-Security-Policy header to the Billing Portal to prevent potential XSS and data injection attacks. Identified during security compliance check (gov-002).',
    priority: 'p2',
    severity: 'medium',
    status: 'active',
    requestedBy: 'user-010',
    assignedTo: 'user-020',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Billing',
    application: 'Billing Portal',
    estimatedEffort: 3,
    actualEffort: 1,
    targetRelease: null,
    acceptanceCriteria: [
      'Content-Security-Policy header is configured for all Billing Portal pages',
      'CSP policy restricts inline scripts and external resource loading',
      'No functional regression in Billing Portal features',
      'Security scan confirms CSP header is present and properly configured',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-028-01', userId: 'user-010', text: 'Missing CSP header flagged as medium severity in security compliance check.', createdAt: daysAgo(10) },
      { id: 'cmt-028-02', userId: 'user-020', text: 'CSP header configuration in progress. Testing for compatibility with existing scripts.', createdAt: daysAgo(4) },
    ],
    attachments: [],
    tags: ['security', 'csp', 'billing', 'headers'],
    version: 1,
    created_at: daysAgo(12),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-020',
  },
  {
    id: 'dem-029',
    title: 'Credentialing System Automation Script Stabilization',
    type: 'Technical Debt',
    description: 'Stabilize the Credentialing System automation test scripts which currently have a 30% flaky test rate. Identified as a critical gap by test automation standards governance (gov-013).',
    priority: 'p2',
    severity: 'high',
    status: 'active',
    requestedBy: 'user-003',
    assignedTo: 'user-007',
    approvalStatus: 'approved',
    workflowState: 'development',
    segment: 'Provider',
    application: 'Credentialing System',
    estimatedEffort: 8,
    actualEffort: 3,
    targetRelease: null,
    acceptanceCriteria: [
      'Flaky test rate reduced from 30% to below 5%',
      'Root cause analysis documented for each flaky test',
      'Test execution time does not increase by more than 10%',
      'All stabilized tests pass consistently for 10 consecutive runs',
    ],
    dependencies: [],
    comments: [
      { id: 'cmt-029-01', userId: 'user-003', text: '30% flaky rate is undermining confidence in test results. Must be addressed.', createdAt: daysAgo(16) },
      { id: 'cmt-029-02', userId: 'user-007', text: 'Root cause analysis complete for 8 of 12 flaky tests. Timing issues and test data dependencies identified.', createdAt: daysAgo(6) },
    ],
    attachments: [
      { id: 'att-029-01', name: 'flaky-test-analysis.xlsx', type: 'application/vnd.ms-excel', uploadedBy: 'user-007', uploadedAt: daysAgo(7) },
    ],
    tags: ['technical-debt', 'automation', 'flaky-tests', 'credentialing', 'stabilization'],
    version: 2,
    created_at: daysAgo(18),
    updated_at: daysAgo(3),
    created_by: 'user-003',
    updated_by: 'user-007',
  },
  {
    id: 'dem-030',
    title: 'Regulatory Report Generation for Compliance Dashboard',
    type: 'Feature',
    description: 'Add regulatory compliance report generation capability to the Compliance Dashboard supporting quarterly and annual report formats with CSV and PDF export.',
    priority: 'p2',
    severity: 'medium',
    status: 'completed',
    requestedBy: 'user-001',
    assignedTo: 'user-005',
    approvalStatus: 'approved',
    workflowState: 'closed',
    segment: 'Regulatory Compliance',
    application: 'Compliance Dashboard',
    estimatedEffort: 8,
    actualEffort: 7,
    targetRelease: 'rel-009',
    acceptanceCriteria: [
      'Quarterly and annual compliance reports can be generated',
      'Reports are exportable in CSV and PDF formats',
      'Report generation completes within 30 seconds',
      'Reports include compliance score trends, procedure status, and findings summary',
      'PII is masked in all exported reports',
    ],
    dependencies: ['dem-020'],
    comments: [
      { id: 'cmt-030-01', userId: 'user-001', text: 'Required for regulatory submissions. Must support both quarterly and annual formats.', createdAt: daysAgo(40) },
      { id: 'cmt-030-02', userId: 'user-005', text: 'Report generation implemented. CSV and PDF exports verified. Generation time: 12 seconds.', createdAt: daysAgo(8) },
    ],
    attachments: [
      { id: 'att-030-01', name: 'report-template-spec.pdf', type: 'application/pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(42) },
    ],
    tags: ['feature', 'compliance', 'reporting', 'regulatory', 'export'],
    version: 3,
    created_at: daysAgo(44),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
];

export default demands;

/**
 * Get all mock demands.
 * @returns {Array<object>} Array of demand objects.
 */
export function getAllDemands() {
  return [...demands];
}

/**
 * Find a demand by ID.
 * @param {string} id - The demand ID to find.
 * @returns {object|null} The demand object, or null if not found.
 */
export function getDemandById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return demands.find((dem) => dem.id === id) || null;
}

/**
 * Get all demands with a specific type.
 * @param {string} type - The demand type to filter by (e.g., 'Feature', 'Bug Fix').
 * @returns {Array<object>} Array of demands with the specified type.
 */
export function getDemandsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.type === type);
}

/**
 * Get all demands with a specific status.
 * @param {string} status - The status to filter by (e.g., 'active', 'in_progress', 'completed').
 * @returns {Array<object>} Array of demands with the specified status.
 */
export function getDemandsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.status === status);
}

/**
 * Get all demands with a specific priority.
 * @param {string} priority - The priority to filter by (e.g., 'p1', 'p2', 'p3', 'p4').
 * @returns {Array<object>} Array of demands with the specified priority.
 */
export function getDemandsByPriority(priority) {
  if (!priority || typeof priority !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.priority === priority);
}

/**
 * Get all demands within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of demands within the specified segment.
 */
export function getDemandsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.segment === segment);
}

/**
 * Get all demands for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of demands for the specified application.
 */
export function getDemandsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.application === application);
}

/**
 * Get all demands with a specific approval status.
 * @param {string} approvalStatus - The approval status to filter by (e.g., 'approved', 'pending', 'rejected').
 * @returns {Array<object>} Array of demands with the specified approval status.
 */
export function getDemandsByApprovalStatus(approvalStatus) {
  if (!approvalStatus || typeof approvalStatus !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.approvalStatus === approvalStatus);
}

/**
 * Get all demands with a specific workflow state.
 * @param {string} workflowState - The workflow state to filter by (e.g., 'intake', 'planning', 'development', 'closed').
 * @returns {Array<object>} Array of demands with the specified workflow state.
 */
export function getDemandsByWorkflowState(workflowState) {
  if (!workflowState || typeof workflowState !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.workflowState === workflowState);
}

/**
 * Get all demands requested by a specific user.
 * @param {string} userId - The user ID who requested the demand.
 * @returns {Array<object>} Array of demands requested by the specified user.
 */
export function getDemandsByRequestedBy(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.requestedBy === userId);
}

/**
 * Get all demands assigned to a specific user.
 * @param {string} userId - The user ID the demand is assigned to.
 * @returns {Array<object>} Array of demands assigned to the specified user.
 */
export function getDemandsByAssignedTo(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.assignedTo === userId);
}

/**
 * Get all demands linked to a specific target release.
 * @param {string} releaseId - The release ID to filter by.
 * @returns {Array<object>} Array of demands targeting the specified release.
 */
export function getDemandsByTargetRelease(releaseId) {
  if (!releaseId || typeof releaseId !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.targetRelease === releaseId);
}

/**
 * Get all demands with a specific severity.
 * @param {string} severity - The severity to filter by (e.g., 'critical', 'high', 'medium', 'low').
 * @returns {Array<object>} Array of demands with the specified severity.
 */
export function getDemandsBySeverity(severity) {
  if (!severity || typeof severity !== 'string') {
    return [];
  }
  return demands.filter((dem) => dem.severity === severity);
}

/**
 * Get distinct demand types from the demand data.
 * @returns {string[]} Array of unique demand type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].type) {
      types.add(demands[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct statuses from the demand data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].status) {
      statuses.add(demands[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct segments from the demand data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].segment) {
      segments.add(demands[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct applications from the demand data.
 * @returns {string[]} Array of unique application strings.
 */
export function getDistinctApplications() {
  const apps = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].application) {
      apps.add(demands[i].application);
    }
  }
  return [...apps].sort();
}

/**
 * Get distinct workflow states from the demand data.
 * @returns {string[]} Array of unique workflow state strings.
 */
export function getDistinctWorkflowStates() {
  const states = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].workflowState) {
      states.add(demands[i].workflowState);
    }
  }
  return [...states].sort();
}

/**
 * Get distinct priorities from the demand data.
 * @returns {string[]} Array of unique priority strings.
 */
export function getDistinctPriorities() {
  const priorities = new Set();
  for (let i = 0; i < demands.length; i++) {
    if (demands[i].priority) {
      priorities.add(demands[i].priority);
    }
  }
  return [...priorities].sort();
}

/**
 * Get a count of demands grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getDemandCountByType() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const type = demands[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of demands grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getDemandCountByStatus() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const status = demands[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of demands grouped by priority.
 * @returns {object} Object with priority keys and count values.
 */
export function getDemandCountByPriority() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const priority = demands[i].priority;
    counts[priority] = (counts[priority] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of demands grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getDemandCountBySegment() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const segment = demands[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of demands grouped by workflow state.
 * @returns {object} Object with workflow state keys and count values.
 */
export function getDemandCountByWorkflowState() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const state = demands[i].workflowState;
    counts[state] = (counts[state] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of demands grouped by approval status.
 * @returns {object} Object with approval status keys and count values.
 */
export function getDemandCountByApprovalStatus() {
  const counts = {};
  for (let i = 0; i < demands.length; i++) {
    const status = demands[i].approvalStatus;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get the total estimated effort across all demands.
 * @returns {number} Total estimated effort in story points.
 */
export function getTotalEstimatedEffort() {
  let total = 0;
  for (let i = 0; i < demands.length; i++) {
    total += demands[i].estimatedEffort || 0;
  }
  return total;
}

/**
 * Get the total actual effort across all demands.
 * @returns {number} Total actual effort in story points.
 */
export function getTotalActualEffort() {
  let total = 0;
  for (let i = 0; i < demands.length; i++) {
    total += demands[i].actualEffort || 0;
  }
  return total;
}

/**
 * Get demands that have dependencies.
 * @returns {Array<object>} Array of demands with non-empty dependencies.
 */
export function getDemandsWithDependencies() {
  return demands.filter(
    (dem) => Array.isArray(dem.dependencies) && dem.dependencies.length > 0,
  );
}

/**
 * Get demands that are unassigned.
 * @returns {Array<object>} Array of demands with no assignee.
 */
export function getUnassignedDemands() {
  return demands.filter(
    (dem) => dem.assignedTo === null || dem.assignedTo === undefined || dem.assignedTo === '',
  );
}

/**
 * Get demands sorted by priority (p1 first).
 * @param {number} [limit] - Optional maximum number of demands to return.
 * @returns {Array<object>} Array of demands sorted by priority.
 */
export function getDemandsByPriorityOrder(limit) {
  const priorityOrder = { p1: 1, p2: 2, p3: 3, p4: 4 };
  const sorted = [...demands].sort((a, b) => {
    const orderA = priorityOrder[a.priority] || 99;
    const orderB = priorityOrder[b.priority] || 99;
    return orderA - orderB;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Find a demand by title (case-insensitive partial match).
 * @param {string} title - The title to search for.
 * @returns {Array<object>} Array of matching demand objects.
 */
export function searchDemandsByTitle(title) {
  if (!title || typeof title !== 'string') {
    return [];
  }
  const titleLower = title.toLowerCase();
  return demands.filter(
    (dem) => dem.title && dem.title.toLowerCase().includes(titleLower),
  );
}

/**
 * Get a summary of demand metrics.
 * @returns {object} Summary object with demand metrics.
 */
export function getDemandSummary() {
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