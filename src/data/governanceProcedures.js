import { v4 as uuidv4 } from 'uuid';

/**
 * @module governanceProcedures
 * Mock governance procedure data seed for eQIP Quality Intelligence.
 * Procedures with all PRD-specified fields including id, name, description, category,
 * owner, complianceStatus, applicableSegments, applicableApplications, lastReviewDate,
 * nextReviewDate, evidenceLinks, metrics, riskLevel, and audit fields.
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
 * Mock governance procedure data array.
 * Each procedure includes id, name, description, category, owner, complianceStatus,
 * complianceRate, applicableSegments, applicableApplications, lastReviewDate,
 * nextReviewDate, reviewFrequency, evidenceLinks, findings, metrics, riskLevel,
 * status, tags, version, and audit fields.
 * @type {Array<object>}
 */
const governanceProcedures = [
  {
    id: 'gov-001',
    name: 'Change Advisory Board Review',
    description: 'All changes must be reviewed and approved by the Change Advisory Board before deployment to production environments. Ensures proper risk assessment, impact analysis, and stakeholder alignment for all change requests.',
    category: 'Change Management',
    owner: 'user-001',
    complianceStatus: 'compliant',
    complianceRate: 94,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(14),
    nextReviewDate: daysAgo(-30),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-001-01', name: 'CAB Meeting Minutes - June 2024', type: 'Document', url: '/evidence/gov-001/cab-minutes-june-2024.pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(14) },
      { id: 'ev-001-02', name: 'Change Request Log Q2 2024', type: 'Spreadsheet', url: '/evidence/gov-001/change-request-log-q2.xlsx', uploadedBy: 'user-002', uploadedAt: daysAgo(16) },
      { id: 'ev-001-03', name: 'CAB Approval Workflow Screenshot', type: 'Screenshot', url: '/evidence/gov-001/cab-workflow.png', uploadedBy: 'user-017', uploadedAt: daysAgo(20) },
    ],
    findings: [
      { id: 'find-001-01', description: 'Two emergency changes bypassed CAB review in Q1 2024.', severity: 'medium', status: 'resolved', identifiedAt: daysAgo(90), resolvedAt: daysAgo(60), resolvedBy: 'user-001' },
      { id: 'find-001-02', description: 'CAB meeting attendance below 80% threshold for March 2024.', severity: 'low', status: 'resolved', identifiedAt: daysAgo(75), resolvedAt: daysAgo(50), resolvedBy: 'user-002' },
    ],
    metrics: {
      totalChangesReviewed: 142,
      changesApproved: 128,
      changesRejected: 8,
      changesDeferred: 6,
      averageReviewTime: 2.3,
      emergencyChanges: 4,
      complianceScore: 94,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['change-management', 'cab', 'mandatory', 'enterprise-wide'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAgo(14),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'gov-002',
    name: 'Security Compliance Check',
    description: 'All releases must pass security compliance checks before production deployment. Includes vulnerability scanning, penetration testing results review, security configuration validation, and compliance with organizational security policies.',
    category: 'Security',
    owner: 'user-010',
    complianceStatus: 'compliant',
    complianceRate: 88,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(7),
    nextReviewDate: daysAgo(-21),
    reviewFrequency: 'bi-weekly',
    evidenceLinks: [
      { id: 'ev-002-01', name: 'Veracode Scan Summary - June 2024', type: 'Report', url: '/evidence/gov-002/veracode-summary-june.pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(7) },
      { id: 'ev-002-02', name: 'OWASP ZAP Scan Results', type: 'Report', url: '/evidence/gov-002/owasp-zap-results.html', uploadedBy: 'user-010', uploadedAt: daysAgo(8) },
      { id: 'ev-002-03', name: 'Security Policy Compliance Matrix', type: 'Spreadsheet', url: '/evidence/gov-002/security-compliance-matrix.xlsx', uploadedBy: 'user-001', uploadedAt: daysAgo(10) },
    ],
    findings: [
      { id: 'find-002-01', description: 'Provider Directory has outdated TLS configuration on staging environment.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(15), resolvedAt: null, resolvedBy: null },
      { id: 'find-002-02', description: 'Stored XSS vulnerability found in EQIP Core release notes field.', severity: 'critical', status: 'resolved', identifiedAt: daysAgo(10), resolvedAt: daysAgo(3), resolvedBy: 'user-019' },
      { id: 'find-002-03', description: 'Missing Content-Security-Policy header on Billing Portal.', severity: 'medium', status: 'in_progress', identifiedAt: daysAgo(12), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalScansCompleted: 86,
      criticalVulnerabilities: 1,
      highVulnerabilities: 3,
      mediumVulnerabilities: 12,
      lowVulnerabilities: 28,
      averageRemediationTime: 5.2,
      complianceScore: 88,
    },
    riskLevel: 'medium',
    status: 'active',
    tags: ['security', 'vulnerability', 'scan', 'mandatory', 'enterprise-wide'],
    version: 8,
    created_at: daysAgo(365),
    updated_at: daysAgo(7),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'gov-003',
    name: 'Regulatory Compliance Audit',
    description: 'Quarterly audit to ensure compliance with healthcare and insurance regulations including HIPAA, SOX, state insurance regulations, and CMS requirements. Covers data handling, access controls, audit trails, and reporting obligations.',
    category: 'Regulatory',
    owner: 'user-001',
    complianceStatus: 'compliant',
    complianceRate: 96,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(45),
    nextReviewDate: daysAgo(-45),
    reviewFrequency: 'quarterly',
    evidenceLinks: [
      { id: 'ev-003-01', name: 'Q1 2024 Regulatory Compliance Report', type: 'Report', url: '/evidence/gov-003/q1-2024-compliance-report.pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(45) },
      { id: 'ev-003-02', name: 'HIPAA Compliance Checklist', type: 'Checklist', url: '/evidence/gov-003/hipaa-checklist.pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(48) },
      { id: 'ev-003-03', name: 'SOX Audit Trail Verification', type: 'Report', url: '/evidence/gov-003/sox-audit-trail.pdf', uploadedBy: 'user-002', uploadedAt: daysAgo(50) },
      { id: 'ev-003-04', name: 'CMS Reporting Compliance Evidence', type: 'Document', url: '/evidence/gov-003/cms-reporting-evidence.pdf', uploadedBy: 'user-001', uploadedAt: daysAgo(46) },
    ],
    findings: [
      { id: 'find-003-01', description: 'Audit trail retention period for Claims Analytics does not meet 7-year requirement.', severity: 'high', status: 'resolved', identifiedAt: daysAgo(90), resolvedAt: daysAgo(60), resolvedBy: 'user-022' },
    ],
    metrics: {
      totalRegulationsTracked: 48,
      regulationsCompliant: 46,
      regulationsAtRisk: 2,
      regulationsNonCompliant: 0,
      auditFindingsOpen: 0,
      auditFindingsResolved: 12,
      complianceScore: 96,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['regulatory', 'hipaa', 'sox', 'cms', 'quarterly', 'mandatory'],
    version: 4,
    created_at: daysAgo(365),
    updated_at: daysAgo(45),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'gov-004',
    name: 'Data Privacy Review',
    description: 'Review of data handling practices to ensure PII protection across all applications. Covers data classification, encryption at rest and in transit, access controls, data retention policies, and breach notification procedures.',
    category: 'Privacy',
    owner: 'user-002',
    complianceStatus: 'at_risk',
    complianceRate: 91,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(21),
    nextReviewDate: daysAgo(-14),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-004-01', name: 'Data Classification Inventory', type: 'Spreadsheet', url: '/evidence/gov-004/data-classification-inventory.xlsx', uploadedBy: 'user-002', uploadedAt: daysAgo(21) },
      { id: 'ev-004-02', name: 'Encryption Standards Compliance Report', type: 'Report', url: '/evidence/gov-004/encryption-compliance.pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(22) },
      { id: 'ev-004-03', name: 'PII Access Control Audit', type: 'Report', url: '/evidence/gov-004/pii-access-audit.pdf', uploadedBy: 'user-002', uploadedAt: daysAgo(24) },
    ],
    findings: [
      { id: 'find-004-01', description: 'Claims Processing stores unmasked SSN in staging database.', severity: 'critical', status: 'in_progress', identifiedAt: daysAgo(21), resolvedAt: null, resolvedBy: null },
      { id: 'find-004-02', description: 'Provider Directory exports include unmasked provider NPI numbers.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(18), resolvedAt: null, resolvedBy: null },
      { id: 'find-004-03', description: 'Data retention policy not enforced for Billing Portal transaction logs older than 5 years.', severity: 'medium', status: 'open', identifiedAt: daysAgo(15), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalDataAssets: 234,
      assetsClassified: 218,
      assetsEncrypted: 210,
      piiFieldsIdentified: 156,
      piiFieldsMasked: 142,
      dataBreachIncidents: 0,
      complianceScore: 91,
    },
    riskLevel: 'medium',
    status: 'active',
    tags: ['privacy', 'pii', 'data-protection', 'encryption', 'mandatory'],
    version: 6,
    created_at: daysAgo(300),
    updated_at: daysAgo(21),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'gov-005',
    name: 'Accessibility Standards Review',
    description: 'Ensure all member-facing and provider-facing applications meet WCAG 2.1 AA accessibility standards. Covers keyboard navigation, screen reader compatibility, color contrast, form labels, and alternative text for images.',
    category: 'Accessibility',
    owner: 'user-006',
    complianceStatus: 'at_risk',
    complianceRate: 82,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Enterprise', 'Insurance Claims', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Billing Portal', 'Member Portal', 'Provider Directory', 'Insurance Claims Portal', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(30),
    nextReviewDate: daysAgo(-7),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-005-01', name: 'WCAG 2.1 AA Audit Report - Member Portal', type: 'Report', url: '/evidence/gov-005/wcag-audit-member-portal.pdf', uploadedBy: 'user-006', uploadedAt: daysAgo(30) },
      { id: 'ev-005-02', name: 'axe DevTools Scan Results - Billing Portal', type: 'Report', url: '/evidence/gov-005/axe-scan-billing-portal.html', uploadedBy: 'user-006', uploadedAt: daysAgo(32) },
      { id: 'ev-005-03', name: 'Keyboard Navigation Test Results', type: 'Report', url: '/evidence/gov-005/keyboard-nav-results.pdf', uploadedBy: 'user-006', uploadedAt: daysAgo(31) },
    ],
    findings: [
      { id: 'find-005-01', description: 'Billing Portal payment form missing ARIA labels on 3 input fields.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(30), resolvedAt: null, resolvedBy: null },
      { id: 'find-005-02', description: 'Provider Directory search results lack proper heading hierarchy.', severity: 'medium', status: 'open', identifiedAt: daysAgo(28), resolvedAt: null, resolvedBy: null },
      { id: 'find-005-03', description: 'Insurance Claims Portal photo upload lacks alternative text guidance.', severity: 'medium', status: 'open', identifiedAt: daysAgo(25), resolvedAt: null, resolvedBy: null },
      { id: 'find-005-04', description: 'EQIP Core dashboard charts not accessible to screen readers.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(35), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalPagesAudited: 45,
      pagesCompliant: 37,
      pagesAtRisk: 6,
      pagesNonCompliant: 2,
      criticalViolations: 0,
      seriousViolations: 4,
      moderateViolations: 8,
      minorViolations: 12,
      complianceScore: 82,
    },
    riskLevel: 'medium',
    status: 'active',
    tags: ['accessibility', 'wcag', 'a11y', 'member-facing'],
    version: 3,
    created_at: daysAgo(180),
    updated_at: daysAgo(30),
    created_by: 'user-001',
    updated_by: 'user-006',
  },
  {
    id: 'gov-006',
    name: 'Code Quality Standards',
    description: 'Enforce code quality standards across all development teams including code review requirements, static analysis thresholds, unit test coverage minimums, and coding style guidelines.',
    category: 'Development',
    owner: 'user-019',
    complianceStatus: 'compliant',
    complianceRate: 90,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(10),
    nextReviewDate: daysAgo(-20),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-006-01', name: 'SonarQube Quality Gate Report - June 2024', type: 'Report', url: '/evidence/gov-006/sonarqube-report-june.html', uploadedBy: 'user-019', uploadedAt: daysAgo(10) },
      { id: 'ev-006-02', name: 'Code Review Completion Metrics', type: 'Spreadsheet', url: '/evidence/gov-006/code-review-metrics.xlsx', uploadedBy: 'user-019', uploadedAt: daysAgo(11) },
      { id: 'ev-006-03', name: 'Unit Test Coverage Summary', type: 'Report', url: '/evidence/gov-006/unit-test-coverage.html', uploadedBy: 'user-008', uploadedAt: daysAgo(10) },
    ],
    findings: [
      { id: 'find-006-01', description: 'Payment Gateway unit test coverage at 75%, below 80% threshold.', severity: 'medium', status: 'in_progress', identifiedAt: daysAgo(10), resolvedAt: null, resolvedBy: null },
      { id: 'find-006-02', description: 'Provider Directory has 3 critical SonarQube issues unresolved.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(8), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalRepositories: 19,
      repositoriesCompliant: 15,
      repositoriesAtRisk: 3,
      repositoriesNonCompliant: 1,
      averageCodeCoverage: 78.5,
      averageCodeReviewTime: 4.2,
      staticAnalysisIssues: 42,
      complianceScore: 90,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['code-quality', 'static-analysis', 'code-review', 'coverage'],
    version: 7,
    created_at: daysAgo(350),
    updated_at: daysAgo(10),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'gov-007',
    name: 'Release Management Process',
    description: 'Standardized release management process including release planning, environment promotion, deployment checklists, rollback procedures, and post-deployment verification requirements.',
    category: 'Release Management',
    owner: 'user-017',
    complianceStatus: 'compliant',
    complianceRate: 92,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(12),
    nextReviewDate: daysAgo(-18),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-007-01', name: 'Release Calendar Q2 2024', type: 'Document', url: '/evidence/gov-007/release-calendar-q2.pdf', uploadedBy: 'user-017', uploadedAt: daysAgo(12) },
      { id: 'ev-007-02', name: 'Deployment Checklist Template', type: 'Checklist', url: '/evidence/gov-007/deployment-checklist.pdf', uploadedBy: 'user-017', uploadedAt: daysAgo(15) },
      { id: 'ev-007-03', name: 'Rollback Procedure Documentation', type: 'Document', url: '/evidence/gov-007/rollback-procedures.pdf', uploadedBy: 'user-018', uploadedAt: daysAgo(20) },
    ],
    findings: [
      { id: 'find-007-01', description: 'Provider Directory release 2024.09 deployed without completing post-deployment verification.', severity: 'high', status: 'resolved', identifiedAt: daysAgo(10), resolvedAt: daysAgo(5), resolvedBy: 'user-017' },
    ],
    metrics: {
      totalReleases: 28,
      successfulDeployments: 26,
      failedDeployments: 1,
      rollbacks: 1,
      averageDeploymentTime: 45,
      postDeployVerificationRate: 92,
      complianceScore: 92,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['release-management', 'deployment', 'rollback', 'mandatory'],
    version: 4,
    created_at: daysAgo(340),
    updated_at: daysAgo(12),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'gov-008',
    name: 'Incident Management Process',
    description: 'Standardized incident management process for production issues including severity classification, escalation procedures, communication protocols, root cause analysis, and post-incident review requirements.',
    category: 'Operations',
    owner: 'user-011',
    complianceStatus: 'compliant',
    complianceRate: 89,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(18),
    nextReviewDate: daysAgo(-12),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-008-01', name: 'Incident Response Playbook', type: 'Document', url: '/evidence/gov-008/incident-response-playbook.pdf', uploadedBy: 'user-011', uploadedAt: daysAgo(18) },
      { id: 'ev-008-02', name: 'Incident Log Q2 2024', type: 'Spreadsheet', url: '/evidence/gov-008/incident-log-q2.xlsx', uploadedBy: 'user-011', uploadedAt: daysAgo(20) },
      { id: 'ev-008-03', name: 'Post-Incident Review Template', type: 'Document', url: '/evidence/gov-008/post-incident-review-template.pdf', uploadedBy: 'user-017', uploadedAt: daysAgo(25) },
    ],
    findings: [
      { id: 'find-008-01', description: 'Post-incident review not completed within 5-day SLA for 2 incidents in Q2.', severity: 'medium', status: 'resolved', identifiedAt: daysAgo(18), resolvedAt: daysAgo(10), resolvedBy: 'user-011' },
      { id: 'find-008-02', description: 'Severity classification inconsistency between Claims and Billing teams.', severity: 'low', status: 'resolved', identifiedAt: daysAgo(25), resolvedAt: daysAgo(15), resolvedBy: 'user-011' },
    ],
    metrics: {
      totalIncidents: 34,
      criticalIncidents: 2,
      highIncidents: 8,
      mediumIncidents: 14,
      lowIncidents: 10,
      averageResolutionTime: 6.8,
      postIncidentReviewRate: 88,
      complianceScore: 89,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['incident-management', 'operations', 'escalation', 'rca'],
    version: 5,
    created_at: daysAgo(320),
    updated_at: daysAgo(18),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'gov-009',
    name: 'Test Environment Management',
    description: 'Governance of test environment provisioning, configuration management, data refresh schedules, and environment parity with production. Ensures test environments are properly maintained and representative of production.',
    category: 'Testing',
    owner: 'user-003',
    complianceStatus: 'at_risk',
    complianceRate: 78,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(25),
    nextReviewDate: daysAgo(-5),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-009-01', name: 'Environment Configuration Audit Report', type: 'Report', url: '/evidence/gov-009/env-config-audit.pdf', uploadedBy: 'user-003', uploadedAt: daysAgo(25) },
      { id: 'ev-009-02', name: 'Data Refresh Schedule', type: 'Document', url: '/evidence/gov-009/data-refresh-schedule.pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(28) },
    ],
    findings: [
      { id: 'find-009-01', description: 'Provider Directory UAT environment has degraded status with outdated database schema.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(12), resolvedAt: null, resolvedBy: null },
      { id: 'find-009-02', description: 'Policy Admin System UAT environment running 2 versions behind production.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(15), resolvedAt: null, resolvedBy: null },
      { id: 'find-009-03', description: 'Test data refresh not completed for 3 environments in the last 30 days.', severity: 'medium', status: 'open', identifiedAt: daysAgo(10), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalEnvironments: 76,
      environmentsHealthy: 62,
      environmentsDegraded: 10,
      environmentsDown: 4,
      averageDataRefreshAge: 18,
      configurationDriftRate: 12,
      complianceScore: 78,
    },
    riskLevel: 'high',
    status: 'active',
    tags: ['test-environment', 'configuration', 'data-refresh', 'parity'],
    version: 4,
    created_at: daysAgo(280),
    updated_at: daysAgo(25),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
  {
    id: 'gov-010',
    name: 'Vendor & Third-Party Risk Assessment',
    description: 'Assessment and monitoring of third-party vendor risks including security posture, SLA compliance, data handling practices, and business continuity capabilities for all integrated external systems.',
    category: 'Vendor Management',
    owner: 'user-011',
    complianceStatus: 'compliant',
    complianceRate: 86,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Insurance Claims'],
    applicableApplications: ['Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Underwriting Engine', 'Insurance Claims Portal'],
    lastReviewDate: daysAgo(35),
    nextReviewDate: daysAgo(-55),
    reviewFrequency: 'quarterly',
    evidenceLinks: [
      { id: 'ev-010-01', name: 'Vendor Risk Assessment Matrix Q2 2024', type: 'Spreadsheet', url: '/evidence/gov-010/vendor-risk-matrix-q2.xlsx', uploadedBy: 'user-011', uploadedAt: daysAgo(35) },
      { id: 'ev-010-02', name: 'Third-Party SLA Compliance Report', type: 'Report', url: '/evidence/gov-010/third-party-sla-report.pdf', uploadedBy: 'user-011', uploadedAt: daysAgo(38) },
      { id: 'ev-010-03', name: 'Vendor Security Questionnaire Responses', type: 'Document', url: '/evidence/gov-010/vendor-security-questionnaires.pdf', uploadedBy: 'user-010', uploadedAt: daysAgo(40) },
    ],
    findings: [
      { id: 'find-010-01', description: 'Payment processor vendor has not completed annual SOC 2 Type II audit renewal.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(35), resolvedAt: null, resolvedBy: null },
      { id: 'find-010-02', description: 'Credit data provider SLA breach: 3 instances of response time exceeding 5-second threshold.', severity: 'medium', status: 'resolved', identifiedAt: daysAgo(40), resolvedAt: daysAgo(20), resolvedBy: 'user-011' },
    ],
    metrics: {
      totalVendors: 20,
      vendorsCompliant: 16,
      vendorsAtRisk: 3,
      vendorsNonCompliant: 1,
      averageSLACompliance: 94.5,
      vendorSecurityScore: 86,
      complianceScore: 86,
    },
    riskLevel: 'medium',
    status: 'active',
    tags: ['vendor-management', 'third-party', 'risk-assessment', 'sla'],
    version: 3,
    created_at: daysAgo(250),
    updated_at: daysAgo(35),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'gov-011',
    name: 'Business Continuity & Disaster Recovery',
    description: 'Business continuity and disaster recovery planning, testing, and compliance for all critical applications. Covers RTO/RPO targets, failover procedures, backup verification, and annual DR testing.',
    category: 'Business Continuity',
    owner: 'user-017',
    complianceStatus: 'compliant',
    complianceRate: 93,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Rx Platform', 'Underwriting Engine', 'Policy Admin System', 'Insurance Claims Portal', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(40),
    nextReviewDate: daysAgo(-50),
    reviewFrequency: 'quarterly',
    evidenceLinks: [
      { id: 'ev-011-01', name: 'DR Test Results - May 2024', type: 'Report', url: '/evidence/gov-011/dr-test-results-may.pdf', uploadedBy: 'user-017', uploadedAt: daysAgo(40) },
      { id: 'ev-011-02', name: 'Business Continuity Plan v3.2', type: 'Document', url: '/evidence/gov-011/bcp-v3.2.pdf', uploadedBy: 'user-017', uploadedAt: daysAgo(45) },
      { id: 'ev-011-03', name: 'Backup Verification Report', type: 'Report', url: '/evidence/gov-011/backup-verification.pdf', uploadedBy: 'user-018', uploadedAt: daysAgo(42) },
    ],
    findings: [
      { id: 'find-011-01', description: 'Document Management system RTO exceeded target by 15 minutes during DR test.', severity: 'medium', status: 'resolved', identifiedAt: daysAgo(40), resolvedAt: daysAgo(25), resolvedBy: 'user-017' },
    ],
    metrics: {
      totalCriticalApps: 12,
      appsWithDRPlan: 12,
      appsDRTested: 11,
      averageRTOMinutes: 30,
      averageRPOMinutes: 15,
      lastDRTestDate: daysAgo(40),
      backupSuccessRate: 99.8,
      complianceScore: 93,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['business-continuity', 'disaster-recovery', 'dr-testing', 'backup'],
    version: 4,
    created_at: daysAgo(330),
    updated_at: daysAgo(40),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'gov-012',
    name: 'Performance & Capacity Management',
    description: 'Monitoring and governance of application performance standards, capacity planning, and scalability requirements. Ensures applications meet defined SLAs for response time, throughput, and availability.',
    category: 'Performance',
    owner: 'user-009',
    complianceStatus: 'compliant',
    complianceRate: 87,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Insurance Claims'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform', 'Underwriting Engine', 'Insurance Claims Portal'],
    lastReviewDate: daysAgo(15),
    nextReviewDate: daysAgo(-15),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-012-01', name: 'Performance Benchmark Report - June 2024', type: 'Report', url: '/evidence/gov-012/performance-benchmark-june.pdf', uploadedBy: 'user-009', uploadedAt: daysAgo(15) },
      { id: 'ev-012-02', name: 'Capacity Planning Forecast Q3 2024', type: 'Document', url: '/evidence/gov-012/capacity-forecast-q3.pdf', uploadedBy: 'user-009', uploadedAt: daysAgo(18) },
    ],
    findings: [
      { id: 'find-012-01', description: 'Provider Directory search response time exceeds 3-second SLA during peak hours.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(15), resolvedAt: null, resolvedBy: null },
      { id: 'find-012-02', description: 'Claims Processing batch job duration increased 40% over last quarter.', severity: 'medium', status: 'resolved', identifiedAt: daysAgo(20), resolvedAt: daysAgo(8), resolvedBy: 'user-009' },
    ],
    metrics: {
      totalSLAs: 32,
      slasMetTarget: 28,
      slasAtRisk: 3,
      slasBreached: 1,
      averageResponseTime: 1.8,
      peakThroughput: 650,
      uptimePercentage: 99.95,
      complianceScore: 87,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['performance', 'capacity', 'sla', 'monitoring'],
    version: 5,
    created_at: daysAgo(270),
    updated_at: daysAgo(15),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'gov-013',
    name: 'Test Automation Standards',
    description: 'Standards and governance for test automation practices including framework selection, script maintainability, execution reliability, and automation coverage targets across all applications.',
    category: 'Testing',
    owner: 'user-008',
    complianceStatus: 'at_risk',
    complianceRate: 75,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(20),
    nextReviewDate: daysAgo(-10),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-013-01', name: 'Automation Coverage Report - June 2024', type: 'Report', url: '/evidence/gov-013/automation-coverage-june.html', uploadedBy: 'user-008', uploadedAt: daysAgo(20) },
      { id: 'ev-013-02', name: 'Test Automation Framework Standards', type: 'Document', url: '/evidence/gov-013/automation-framework-standards.pdf', uploadedBy: 'user-003', uploadedAt: daysAgo(60) },
    ],
    findings: [
      { id: 'find-013-01', description: 'Provider Directory automation coverage at 45%, significantly below 70% target.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(20), resolvedAt: null, resolvedBy: null },
      { id: 'find-013-02', description: 'Document Management has no automated test suite.', severity: 'critical', status: 'open', identifiedAt: daysAgo(20), resolvedAt: null, resolvedBy: null },
      { id: 'find-013-03', description: 'Credentialing System automation scripts have 30% flaky test rate.', severity: 'high', status: 'in_progress', identifiedAt: daysAgo(18), resolvedAt: null, resolvedBy: null },
      { id: 'find-013-04', description: 'Billing Portal automation coverage at 55%, below 70% target.', severity: 'medium', status: 'in_progress', identifiedAt: daysAgo(20), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalApplications: 19,
      applicationsAboveTarget: 10,
      applicationsBelowTarget: 7,
      applicationsNoAutomation: 2,
      averageAutomationCoverage: 63.2,
      averageFlakyTestRate: 8.5,
      automationROI: 3.2,
      complianceScore: 75,
    },
    riskLevel: 'high',
    status: 'active',
    tags: ['test-automation', 'coverage', 'framework', 'reliability'],
    version: 3,
    created_at: daysAgo(200),
    updated_at: daysAgo(20),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'gov-014',
    name: 'Documentation Standards',
    description: 'Standards for technical and business documentation including API documentation, architecture decision records, runbooks, user guides, and knowledge base maintenance.',
    category: 'Documentation',
    owner: 'user-022',
    complianceStatus: 'compliant',
    complianceRate: 84,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(22),
    nextReviewDate: daysAgo(-8),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-014-01', name: 'Documentation Completeness Audit', type: 'Report', url: '/evidence/gov-014/doc-completeness-audit.pdf', uploadedBy: 'user-022', uploadedAt: daysAgo(22) },
      { id: 'ev-014-02', name: 'API Documentation Coverage Report', type: 'Report', url: '/evidence/gov-014/api-doc-coverage.html', uploadedBy: 'user-019', uploadedAt: daysAgo(24) },
    ],
    findings: [
      { id: 'find-014-01', description: 'Risk Assessment Tool missing API documentation for 4 endpoints.', severity: 'medium', status: 'in_progress', identifiedAt: daysAgo(22), resolvedAt: null, resolvedBy: null },
      { id: 'find-014-02', description: 'Credentialing System runbook not updated since last architecture change.', severity: 'low', status: 'open', identifiedAt: daysAgo(22), resolvedAt: null, resolvedBy: null },
    ],
    metrics: {
      totalDocuments: 156,
      documentsUpToDate: 131,
      documentsOutdated: 18,
      documentsMissing: 7,
      apiDocCoverage: 88,
      runbookCoverage: 79,
      complianceScore: 84,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['documentation', 'api-docs', 'runbooks', 'knowledge-base'],
    version: 2,
    created_at: daysAgo(180),
    updated_at: daysAgo(22),
    created_by: 'user-001',
    updated_by: 'user-022',
  },
  {
    id: 'gov-015',
    name: 'Defect Management Process',
    description: 'Governance of defect lifecycle management including severity classification, triage procedures, SLA-based resolution targets, root cause analysis requirements, and defect trend monitoring.',
    category: 'Quality Management',
    owner: 'user-003',
    complianceStatus: 'compliant',
    complianceRate: 91,
    applicableSegments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
    applicableApplications: ['EQIP Core', 'Claims Processing', 'Claims Analytics', 'Payment Gateway', 'Billing Portal', 'Member Portal', 'Enrollment Engine', 'Provider Directory', 'Credentialing System', 'Rx Platform', 'Formulary Manager', 'Underwriting Engine', 'Risk Assessment Tool', 'Policy Admin System', 'Document Management', 'Insurance Claims Portal', 'Settlement Engine', 'Actuarial Platform', 'Compliance Dashboard'],
    lastReviewDate: daysAgo(8),
    nextReviewDate: daysAgo(-22),
    reviewFrequency: 'monthly',
    evidenceLinks: [
      { id: 'ev-015-01', name: 'Defect Metrics Dashboard Export - June 2024', type: 'Report', url: '/evidence/gov-015/defect-metrics-june.pdf', uploadedBy: 'user-003', uploadedAt: daysAgo(8) },
      { id: 'ev-015-02', name: 'Defect Triage Process Documentation', type: 'Document', url: '/evidence/gov-015/defect-triage-process.pdf', uploadedBy: 'user-003', uploadedAt: daysAgo(60) },
      { id: 'ev-015-03', name: 'Root Cause Analysis Summary Q2 2024', type: 'Report', url: '/evidence/gov-015/rca-summary-q2.pdf', uploadedBy: 'user-005', uploadedAt: daysAgo(10) },
    ],
    findings: [
      { id: 'find-015-01', description: 'Provider Directory critical defect resolution exceeded 24-hour SLA by 8 hours.', severity: 'high', status: 'resolved', identifiedAt: daysAgo(8), resolvedAt: daysAgo(3), resolvedBy: 'user-007' },
    ],
    metrics: {
      totalDefectsTracked: 245,
      defectsResolvedInSLA: 223,
      defectsExceededSLA: 22,
      criticalDefectMTTR: 18.5,
      highDefectMTTR: 36.2,
      rootCauseAnalysisRate: 92,
      defectReopenRate: 4.5,
      complianceScore: 91,
    },
    riskLevel: 'low',
    status: 'active',
    tags: ['defect-management', 'triage', 'sla', 'rca', 'quality'],
    version: 5,
    created_at: daysAgo(310),
    updated_at: daysAgo(8),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
];

export default governanceProcedures;

/**
 * Get all mock governance procedures.
 * @returns {Array<object>} Array of governance procedure objects.
 */
export function getAllGovernanceProcedures() {
  return [...governanceProcedures];
}

/**
 * Find a governance procedure by ID.
 * @param {string} id - The procedure ID to find.
 * @returns {object|null} The procedure object, or null if not found.
 */
export function getGovernanceProcedureById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return governanceProcedures.find((proc) => proc.id === id) || null;
}

/**
 * Get all governance procedures within a specific category.
 * @param {string} category - The category to filter by (e.g., 'Security', 'Regulatory').
 * @returns {Array<object>} Array of procedures within the specified category.
 */
export function getGovernanceProceduresByCategory(category) {
  if (!category || typeof category !== 'string') {
    return [];
  }
  return governanceProcedures.filter((proc) => proc.category === category);
}

/**
 * Get all governance procedures with a specific compliance status.
 * @param {string} status - The compliance status to filter by (e.g., 'compliant', 'at_risk', 'non_compliant').
 * @returns {Array<object>} Array of procedures with the specified compliance status.
 */
export function getGovernanceProceduresByComplianceStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return governanceProcedures.filter((proc) => proc.complianceStatus === status);
}

/**
 * Get all governance procedures owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of procedures owned by the specified user.
 */
export function getGovernanceProceduresByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return governanceProcedures.filter((proc) => proc.owner === ownerId);
}

/**
 * Get all governance procedures applicable to a specific segment.
 * @param {string} segment - The segment to check applicability for.
 * @returns {Array<object>} Array of procedures applicable to the specified segment.
 */
export function getGovernanceProceduresBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return governanceProcedures.filter(
    (proc) =>
      Array.isArray(proc.applicableSegments) &&
      proc.applicableSegments.includes(segment),
  );
}

/**
 * Get all governance procedures applicable to a specific application.
 * @param {string} application - The application name to check applicability for.
 * @returns {Array<object>} Array of procedures applicable to the specified application.
 */
export function getGovernanceProceduresByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return governanceProcedures.filter(
    (proc) =>
      Array.isArray(proc.applicableApplications) &&
      proc.applicableApplications.includes(application),
  );
}

/**
 * Get all governance procedures with a specific risk level.
 * @param {string} riskLevel - The risk level to filter by (e.g., 'low', 'medium', 'high').
 * @returns {Array<object>} Array of procedures with the specified risk level.
 */
export function getGovernanceProceduresByRiskLevel(riskLevel) {
  if (!riskLevel || typeof riskLevel !== 'string') {
    return [];
  }
  return governanceProcedures.filter((proc) => proc.riskLevel === riskLevel);
}

/**
 * Get all governance procedures that have open or in-progress findings.
 * @returns {Array<object>} Array of procedures with unresolved findings.
 */
export function getGovernanceProceduresWithOpenFindings() {
  return governanceProcedures.filter(
    (proc) =>
      Array.isArray(proc.findings) &&
      proc.findings.some(
        (finding) => finding.status === 'open' || finding.status === 'in_progress',
      ),
  );
}

/**
 * Get all governance procedures with overdue reviews.
 * A review is overdue if nextReviewDate is in the past.
 * @returns {Array<object>} Array of procedures with overdue reviews.
 */
export function getGovernanceProceduresWithOverdueReviews() {
  const now = new Date().getTime();
  return governanceProcedures.filter((proc) => {
    if (!proc.nextReviewDate) {
      return false;
    }
    const nextReview = new Date(proc.nextReviewDate).getTime();
    return !isNaN(nextReview) && nextReview < now;
  });
}

/**
 * Get distinct categories from the governance procedure data.
 * @returns {string[]} Array of unique category strings.
 */
export function getDistinctCategories() {
  const categories = new Set();
  for (let i = 0; i < governanceProcedures.length; i++) {
    if (governanceProcedures[i].category) {
      categories.add(governanceProcedures[i].category);
    }
  }
  return [...categories].sort();
}

/**
 * Get distinct compliance statuses from the governance procedure data.
 * @returns {string[]} Array of unique compliance status strings.
 */
export function getDistinctComplianceStatuses() {
  const statuses = new Set();
  for (let i = 0; i < governanceProcedures.length; i++) {
    if (governanceProcedures[i].complianceStatus) {
      statuses.add(governanceProcedures[i].complianceStatus);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct risk levels from the governance procedure data.
 * @returns {string[]} Array of unique risk level strings.
 */
export function getDistinctRiskLevels() {
  const levels = new Set();
  for (let i = 0; i < governanceProcedures.length; i++) {
    if (governanceProcedures[i].riskLevel) {
      levels.add(governanceProcedures[i].riskLevel);
    }
  }
  return [...levels].sort();
}

/**
 * Get a count of governance procedures grouped by category.
 * @returns {object} Object with category keys and count values.
 */
export function getGovernanceProcedureCountByCategory() {
  const counts = {};
  for (let i = 0; i < governanceProcedures.length; i++) {
    const category = governanceProcedures[i].category;
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of governance procedures grouped by compliance status.
 * @returns {object} Object with compliance status keys and count values.
 */
export function getGovernanceProcedureCountByComplianceStatus() {
  const counts = {};
  for (let i = 0; i < governanceProcedures.length; i++) {
    const status = governanceProcedures[i].complianceStatus;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of governance procedures grouped by risk level.
 * @returns {object} Object with risk level keys and count values.
 */
export function getGovernanceProcedureCountByRiskLevel() {
  const counts = {};
  for (let i = 0; i < governanceProcedures.length; i++) {
    const level = governanceProcedures[i].riskLevel;
    counts[level] = (counts[level] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average compliance rate across all governance procedures.
 * @returns {number} The average compliance rate, or 0 if no procedures exist.
 */
export function getAverageComplianceRate() {
  if (governanceProcedures.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < governanceProcedures.length; i++) {
    total += governanceProcedures[i].complianceRate || 0;
  }
  return Math.round((total / governanceProcedures.length) * 100) / 100;
}

/**
 * Get the total number of open findings across all governance procedures.
 * @returns {number} Total count of open and in-progress findings.
 */
export function getTotalOpenFindings() {
  let count = 0;
  for (let i = 0; i < governanceProcedures.length; i++) {
    if (Array.isArray(governanceProcedures[i].findings)) {
      for (let j = 0; j < governanceProcedures[i].findings.length; j++) {
        const status = governanceProcedures[i].findings[j].status;
        if (status === 'open' || status === 'in_progress') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of findings grouped by severity.
 * @returns {object} Object with severity keys and count values.
 */
export function getFindingCountBySeverity() {
  const counts = {};
  for (let i = 0; i < governanceProcedures.length; i++) {
    if (Array.isArray(governanceProcedures[i].findings)) {
      for (let j = 0; j < governanceProcedures[i].findings.length; j++) {
        const severity = governanceProcedures[i].findings[j].severity;
        counts[severity] = (counts[severity] || 0) + 1;
      }
    }
  }
  return counts;
}

/**
 * Find a governance procedure by name (case-insensitive).
 * @param {string} name - The procedure name to search for.
 * @returns {object|null} The procedure object, or null if not found.
 */
export function getGovernanceProcedureByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return governanceProcedures.find(
    (proc) => proc.name.toLowerCase() === nameLower,
  ) || null;
}

/**
 * Get governance procedures sorted by compliance rate in ascending order (worst first).
 * @param {number} [limit] - Optional maximum number of procedures to return.
 * @returns {Array<object>} Array of procedures sorted by compliance rate ascending.
 */
export function getLowestComplianceProcedures(limit) {
  const sorted = [...governanceProcedures].sort(
    (a, b) => (a.complianceRate || 0) - (b.complianceRate || 0),
  );
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get governance procedures sorted by compliance rate in descending order (best first).
 * @param {number} [limit] - Optional maximum number of procedures to return.
 * @returns {Array<object>} Array of procedures sorted by compliance rate descending.
 */
export function getHighestComplianceProcedures(limit) {
  const sorted = [...governanceProcedures].sort(
    (a, b) => (b.complianceRate || 0) - (a.complianceRate || 0),
  );
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of governance compliance across all procedures.
 * @returns {object} Summary object with overall compliance metrics.
 */
export function getGovernanceComplianceSummary() {
  const total = governanceProcedures.length;
  let compliant = 0;
  let atRisk = 0;
  let nonCompliant = 0;
  let totalRate = 0;
  let totalFindings = 0;
  let openFindings = 0;
  let resolvedFindings = 0;

  for (let i = 0; i < governanceProcedures.length; i++) {
    const proc = governanceProcedures[i];
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
  };
}