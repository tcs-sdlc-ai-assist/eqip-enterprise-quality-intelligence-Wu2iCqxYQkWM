import { v4 as uuidv4 } from 'uuid';

/**
 * @module qualityGates
 * Mock quality gate data seed for eQIP Quality Intelligence.
 * 16 release quality gates with all PRD-specified fields including id, name, description,
 * category, threshold, currentValue, status, applicabilityRules, waiverHistory,
 * configurable weights, and audit fields.
 */

/**
 * Helper to generate a relative ISO date string.
 * @param {number} days - Number of days in the past.
 * @returns {string} ISO8601 date string.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Mock quality gate data array with 16 release quality gates.
 * Each gate includes id, name, description, category, phase, threshold, currentValue,
 * status (passed/failed/waived/not_started/in_review/blocked), applicabilityRules,
 * waiverHistory, weight, evidence, linkedReleases, and audit fields.
 * @type {Array<object>}
 */
const qualityGates = [
  {
    id: 'qg-001',
    key: 'requirements_review',
    name: 'Requirements Review',
    description: 'All requirements reviewed and approved by stakeholders.',
    category: 'Documentation',
    phase: 'planning',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.05,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Compliance', 'Security Patch'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Document', name: 'Requirements Sign-off Sheet', uploadedBy: 'user-003', uploadedAt: daysAgo(45), url: '/evidence/qg-001/requirements-signoff.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-007', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-003',
    lastEvaluated: daysAgo(2),
    evaluationFrequency: 'per_release',
    tags: ['planning', 'documentation', 'mandatory'],
    version: 3,
    created_at: daysAgo(365),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
  {
    id: 'qg-002',
    key: 'design_review',
    name: 'Design Review',
    description: 'Architecture and design documents reviewed and signed off.',
    category: 'Documentation',
    phase: 'planning',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.05,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Document', name: 'Architecture Review Board Minutes', uploadedBy: 'user-002', uploadedAt: daysAgo(40), url: '/evidence/qg-002/arb-minutes.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-007', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-002',
    lastEvaluated: daysAgo(3),
    evaluationFrequency: 'per_release',
    tags: ['planning', 'architecture', 'mandatory'],
    version: 2,
    created_at: daysAgo(365),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'qg-003',
    key: 'test_plan_approval',
    name: 'Test Plan Approval',
    description: 'Test plan reviewed and approved by QA lead.',
    category: 'Testing',
    phase: 'planning',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.05,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Compliance', 'Security Patch', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Document', name: 'Test Plan Approval Record', uploadedBy: 'user-003', uploadedAt: daysAgo(38), url: '/evidence/qg-003/test-plan-approval.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-007', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-003',
    lastEvaluated: daysAgo(3),
    evaluationFrequency: 'per_release',
    tags: ['planning', 'testing', 'mandatory'],
    version: 2,
    created_at: daysAgo(365),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
  {
    id: 'qg-004',
    key: 'code_review',
    name: 'Code Review',
    description: 'All code changes peer-reviewed and approved.',
    category: 'Development',
    phase: 'development',
    threshold: 100,
    currentValue: 85,
    status: 'failed',
    weight: 0.08,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [
      {
        id: 'waiver-qg004-001',
        releaseId: 'rel-004',
        reason: 'Pending review from tech lead who is on PTO.',
        requestedBy: 'user-007',
        requestedAt: daysAgo(1),
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        expiresAt: daysAgo(-14),
        comments: '',
      },
    ],
    evidence: [
      { type: 'Report', name: 'Code Review Coverage Report', uploadedBy: 'user-019', uploadedAt: daysAgo(5), url: '/evidence/qg-004/code-review-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-008'],
    owner: 'user-019',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_release',
    tags: ['development', 'code-quality', 'mandatory'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'qg-005',
    key: 'static_analysis',
    name: 'Static Analysis',
    description: 'Static analysis tools report zero critical issues.',
    category: 'Development',
    phase: 'development',
    threshold: 0,
    currentValue: 3,
    status: 'failed',
    weight: 0.06,
    unit: 'critical_issues',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'SonarQube Analysis Report', uploadedBy: 'user-010', uploadedAt: daysAgo(3), url: '/evidence/qg-005/sonarqube-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-008'],
    owner: 'user-010',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_build',
    tags: ['development', 'code-quality', 'automated'],
    version: 6,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'qg-006',
    key: 'unit_test_coverage',
    name: 'Unit Test Coverage',
    description: 'Unit test coverage meets the minimum threshold.',
    category: 'Testing',
    phase: 'development',
    threshold: 80,
    currentValue: 75,
    status: 'failed',
    weight: 0.08,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Infrastructure'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [
      {
        id: 'waiver-qg006-001',
        releaseId: 'rel-002',
        reason: 'Legacy payment module has limited testability. Refactoring planned for next sprint.',
        requestedBy: 'user-020',
        requestedAt: daysAgo(3),
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
        expiresAt: daysAgo(-30),
        comments: '',
      },
    ],
    evidence: [
      { type: 'Report', name: 'Unit Test Coverage Report', uploadedBy: 'user-008', uploadedAt: daysAgo(2), url: '/evidence/qg-006/coverage-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-008'],
    owner: 'user-008',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_build',
    tags: ['development', 'testing', 'coverage', 'automated'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-008',
  },
  {
    id: 'qg-007',
    key: 'build_verification',
    name: 'Build Verification',
    description: 'Build completes successfully with no errors.',
    category: 'Build',
    phase: 'build',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.05,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Build Pipeline Report', uploadedBy: 'user-018', uploadedAt: daysAgo(1), url: '/evidence/qg-007/build-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-018',
    lastEvaluated: daysAgo(0),
    evaluationFrequency: 'per_build',
    tags: ['build', 'ci-cd', 'automated', 'mandatory'],
    version: 4,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-018',
  },
  {
    id: 'qg-008',
    key: 'smoke_test',
    name: 'Smoke Test',
    description: 'Core smoke tests pass in the target environment.',
    category: 'Testing',
    phase: 'testing',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.06,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Smoke Test Results', uploadedBy: 'user-005', uploadedAt: daysAgo(2), url: '/evidence/qg-008/smoke-test-results.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-005',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_deployment',
    tags: ['testing', 'smoke', 'automated', 'mandatory'],
    version: 3,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'qg-009',
    key: 'functional_test',
    name: 'Functional Test',
    description: 'All functional test cases executed and passed.',
    category: 'Testing',
    phase: 'testing',
    threshold: 95,
    currentValue: 94.21,
    status: 'in_review',
    weight: 0.10,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Compliance', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Functional Test Execution Report', uploadedBy: 'user-006', uploadedAt: daysAgo(3), url: '/evidence/qg-009/functional-test-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-005',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_release',
    tags: ['testing', 'functional', 'mandatory'],
    version: 4,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'qg-010',
    key: 'regression_test',
    name: 'Regression Test',
    description: 'Full regression suite executed with acceptable pass rate.',
    category: 'Testing',
    phase: 'testing',
    threshold: 95,
    currentValue: 96.0,
    status: 'passed',
    weight: 0.10,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Regression Test Report', uploadedBy: 'user-005', uploadedAt: daysAgo(4), url: '/evidence/qg-010/regression-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-003', 'rel-005', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-005',
    lastEvaluated: daysAgo(2),
    evaluationFrequency: 'per_release',
    tags: ['testing', 'regression', 'automated', 'mandatory'],
    version: 3,
    created_at: daysAgo(365),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'qg-011',
    key: 'performance_test',
    name: 'Performance Test',
    description: 'Performance benchmarks met under expected load.',
    category: 'Testing',
    phase: 'testing',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.07,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Insurance Claims'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Infrastructure', 'Data Migration'],
      excludedApplications: ['Formulary Manager', 'Risk Assessment Tool'],
      mandatory: false,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Performance Benchmark Report', uploadedBy: 'user-009', uploadedAt: daysAgo(5), url: '/evidence/qg-011/performance-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-003', 'rel-005', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-009',
    lastEvaluated: daysAgo(3),
    evaluationFrequency: 'per_release',
    tags: ['testing', 'performance', 'load-test'],
    version: 3,
    created_at: daysAgo(365),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'qg-012',
    key: 'security_scan',
    name: 'Security Scan',
    description: 'Security scan completed with no critical vulnerabilities.',
    category: 'Security',
    phase: 'testing',
    threshold: 0,
    currentValue: 0,
    status: 'passed',
    weight: 0.08,
    unit: 'critical_vulnerabilities',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Compliance', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [
      {
        id: 'waiver-qg012-001',
        releaseId: 'rel-004',
        reason: 'Known vulnerability in third-party dependency. Patch expected within 2 weeks.',
        requestedBy: 'user-011',
        requestedAt: daysAgo(2),
        status: 'rejected',
        approvedBy: 'user-001',
        approvedAt: daysAgo(1),
        expiresAt: null,
        comments: 'Security vulnerability must be addressed before release. Cannot waive.',
      },
    ],
    evidence: [
      { type: 'Report', name: 'Veracode Scan Results', uploadedBy: 'user-010', uploadedAt: daysAgo(3), url: '/evidence/qg-012/veracode-scan.pdf' },
      { type: 'Report', name: 'OWASP ZAP Scan Report', uploadedBy: 'user-010', uploadedAt: daysAgo(3), url: '/evidence/qg-012/owasp-zap-report.html' },
    ],
    linkedReleases: ['rel-001', 'rel-002', 'rel-003', 'rel-004', 'rel-005', 'rel-006', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-010',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_build',
    tags: ['security', 'vulnerability', 'scan', 'automated', 'mandatory'],
    version: 6,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'qg-013',
    key: 'accessibility_audit',
    name: 'Accessibility Audit',
    description: 'Accessibility standards (WCAG) compliance verified.',
    category: 'Compliance',
    phase: 'testing',
    threshold: 100,
    currentValue: 95,
    status: 'in_review',
    weight: 0.05,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Insurance Claims', 'Regulatory Compliance'],
      applications: ['EQIP Core', 'Member Portal', 'Billing Portal', 'Insurance Claims Portal', 'Compliance Dashboard'],
      releaseTypes: ['Feature', 'Enhancement', 'Compliance'],
      excludedApplications: ['Underwriting Engine', 'Enrollment Engine', 'Settlement Engine', 'Actuarial Platform'],
      mandatory: false,
    },
    waiverHistory: [
      {
        id: 'waiver-qg013-001',
        releaseId: 'rel-008',
        reason: 'Backend-only service with no user-facing UI. Accessibility audit not applicable.',
        requestedBy: 'user-011',
        requestedAt: daysAgo(5),
        status: 'approved',
        approvedBy: 'user-001',
        approvedAt: daysAgo(4),
        expiresAt: null,
        comments: 'Waiver approved. Backend services without UI are exempt from accessibility audit.',
      },
    ],
    evidence: [
      { type: 'Report', name: 'WCAG 2.1 AA Audit Results', uploadedBy: 'user-006', uploadedAt: daysAgo(4), url: '/evidence/qg-013/wcag-audit.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-003', 'rel-005', 'rel-008', 'rel-009', 'rel-010'],
    owner: 'user-006',
    lastEvaluated: daysAgo(2),
    evaluationFrequency: 'per_release',
    tags: ['compliance', 'accessibility', 'wcag'],
    version: 3,
    created_at: daysAgo(300),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-006',
  },
  {
    id: 'qg-014',
    key: 'uat_signoff',
    name: 'UAT Sign-off',
    description: 'User acceptance testing completed and signed off.',
    category: 'Acceptance',
    phase: 'acceptance',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.08,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Compliance', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Document', name: 'UAT Sign-off Document', uploadedBy: 'user-022', uploadedAt: daysAgo(4), url: '/evidence/qg-014/uat-signoff.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-005', 'rel-009'],
    owner: 'user-022',
    lastEvaluated: daysAgo(3),
    evaluationFrequency: 'per_release',
    tags: ['acceptance', 'uat', 'mandatory'],
    version: 2,
    created_at: daysAgo(365),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-022',
  },
  {
    id: 'qg-015',
    key: 'release_readiness',
    name: 'Release Readiness',
    description: 'All release criteria met and deployment checklist completed.',
    category: 'Release',
    phase: 'release',
    threshold: 100,
    currentValue: 92,
    status: 'in_review',
    weight: 0.07,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Compliance', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Checklist', name: 'Release Readiness Checklist', uploadedBy: 'user-017', uploadedAt: daysAgo(2), url: '/evidence/qg-015/release-checklist.pdf' },
    ],
    linkedReleases: ['rel-001', 'rel-005', 'rel-009'],
    owner: 'user-017',
    lastEvaluated: daysAgo(1),
    evaluationFrequency: 'per_release',
    tags: ['release', 'readiness', 'checklist', 'mandatory'],
    version: 4,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'qg-016',
    key: 'post_deployment_verification',
    name: 'Post-Deployment Verification',
    description: 'Production verification tests pass after deployment.',
    category: 'Release',
    phase: 'release',
    threshold: 100,
    currentValue: 100,
    status: 'passed',
    weight: 0.07,
    unit: '%',
    applicabilityRules: {
      segments: ['Claims', 'Billing', 'Enrollment', 'Provider', 'Pharmacy', 'Enterprise', 'Underwriting', 'Policy Administration', 'Insurance Claims', 'Actuarial', 'Regulatory Compliance'],
      applications: [],
      releaseTypes: ['Feature', 'Enhancement', 'Bug Fix', 'Technical Debt', 'Security Patch', 'Compliance', 'Infrastructure', 'Data Migration', 'Integration'],
      excludedApplications: [],
      mandatory: true,
    },
    waiverHistory: [],
    evidence: [
      { type: 'Report', name: 'Post-Deployment Verification Report', uploadedBy: 'user-017', uploadedAt: daysAgo(5), url: '/evidence/qg-016/post-deploy-report.html' },
    ],
    linkedReleases: ['rel-005', 'rel-009'],
    owner: 'user-017',
    lastEvaluated: daysAgo(5),
    evaluationFrequency: 'per_deployment',
    tags: ['release', 'post-deployment', 'verification', 'mandatory'],
    version: 3,
    created_at: daysAgo(365),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
];

export default qualityGates;

/**
 * Get all mock quality gates.
 * @returns {Array<object>} Array of quality gate objects.
 */
export function getAllQualityGates() {
  return [...qualityGates];
}

/**
 * Find a quality gate by ID.
 * @param {string} id - The quality gate ID to find.
 * @returns {object|null} The quality gate object, or null if not found.
 */
export function getQualityGateById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return qualityGates.find((gate) => gate.id === id) || null;
}

/**
 * Find a quality gate by key.
 * @param {string} key - The quality gate key to find (e.g., 'code_review').
 * @returns {object|null} The quality gate object, or null if not found.
 */
export function getQualityGateByKey(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }
  return qualityGates.find((gate) => gate.key === key) || null;
}

/**
 * Get all quality gates with a specific status.
 * @param {string} status - The status to filter by (e.g., 'passed', 'failed', 'in_review', 'waived').
 * @returns {Array<object>} Array of quality gates with the specified status.
 */
export function getQualityGatesByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return qualityGates.filter((gate) => gate.status === status);
}

/**
 * Get all quality gates within a specific phase.
 * @param {string} phase - The phase to filter by (e.g., 'planning', 'development', 'testing', 'release').
 * @returns {Array<object>} Array of quality gates within the specified phase.
 */
export function getQualityGatesByPhase(phase) {
  if (!phase || typeof phase !== 'string') {
    return [];
  }
  return qualityGates.filter((gate) => gate.phase === phase);
}

/**
 * Get all quality gates within a specific category.
 * @param {string} category - The category to filter by (e.g., 'Testing', 'Security', 'Development').
 * @returns {Array<object>} Array of quality gates within the specified category.
 */
export function getQualityGatesByCategory(category) {
  if (!category || typeof category !== 'string') {
    return [];
  }
  return qualityGates.filter((gate) => gate.category === category);
}

/**
 * Get all quality gates linked to a specific release.
 * @param {string} releaseId - The release ID to filter by.
 * @returns {Array<object>} Array of quality gates linked to the specified release.
 */
export function getQualityGatesByRelease(releaseId) {
  if (!releaseId || typeof releaseId !== 'string') {
    return [];
  }
  return qualityGates.filter(
    (gate) =>
      Array.isArray(gate.linkedReleases) && gate.linkedReleases.includes(releaseId),
  );
}

/**
 * Get all quality gates applicable to a specific segment.
 * @param {string} segment - The segment to check applicability for.
 * @returns {Array<object>} Array of quality gates applicable to the specified segment.
 */
export function getQualityGatesBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return qualityGates.filter(
    (gate) =>
      gate.applicabilityRules &&
      Array.isArray(gate.applicabilityRules.segments) &&
      (gate.applicabilityRules.segments.length === 0 ||
        gate.applicabilityRules.segments.includes(segment)),
  );
}

/**
 * Get all quality gates applicable to a specific application.
 * @param {string} application - The application name to check applicability for.
 * @returns {Array<object>} Array of quality gates applicable to the specified application.
 */
export function getQualityGatesByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return qualityGates.filter((gate) => {
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
}

/**
 * Get all mandatory quality gates.
 * @returns {Array<object>} Array of mandatory quality gate objects.
 */
export function getMandatoryQualityGates() {
  return qualityGates.filter(
    (gate) => gate.applicabilityRules && gate.applicabilityRules.mandatory === true,
  );
}

/**
 * Get all quality gates that have pending waivers.
 * @returns {Array<object>} Array of quality gates with pending waivers.
 */
export function getQualityGatesWithPendingWaivers() {
  return qualityGates.filter(
    (gate) =>
      Array.isArray(gate.waiverHistory) &&
      gate.waiverHistory.some((waiver) => waiver.status === 'pending'),
  );
}

/**
 * Get all quality gates that have any waiver history.
 * @returns {Array<object>} Array of quality gates with waiver history.
 */
export function getQualityGatesWithWaivers() {
  return qualityGates.filter(
    (gate) => Array.isArray(gate.waiverHistory) && gate.waiverHistory.length > 0,
  );
}

/**
 * Get all quality gates owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of quality gates owned by the specified user.
 */
export function getQualityGatesByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return qualityGates.filter((gate) => gate.owner === ownerId);
}

/**
 * Get distinct categories from the quality gate data.
 * @returns {string[]} Array of unique category strings.
 */
export function getDistinctCategories() {
  const categories = new Set();
  for (let i = 0; i < qualityGates.length; i++) {
    if (qualityGates[i].category) {
      categories.add(qualityGates[i].category);
    }
  }
  return [...categories].sort();
}

/**
 * Get distinct phases from the quality gate data.
 * @returns {string[]} Array of unique phase strings.
 */
export function getDistinctPhases() {
  const phases = new Set();
  for (let i = 0; i < qualityGates.length; i++) {
    if (qualityGates[i].phase) {
      phases.add(qualityGates[i].phase);
    }
  }
  return [...phases].sort();
}

/**
 * Get distinct statuses from the quality gate data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < qualityGates.length; i++) {
    if (qualityGates[i].status) {
      statuses.add(qualityGates[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get a count of quality gates grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getQualityGateCountByStatus() {
  const counts = {};
  for (let i = 0; i < qualityGates.length; i++) {
    const status = qualityGates[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of quality gates grouped by phase.
 * @returns {object} Object with phase keys and count values.
 */
export function getQualityGateCountByPhase() {
  const counts = {};
  for (let i = 0; i < qualityGates.length; i++) {
    const phase = qualityGates[i].phase;
    counts[phase] = (counts[phase] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of quality gates grouped by category.
 * @returns {object} Object with category keys and count values.
 */
export function getQualityGateCountByCategory() {
  const counts = {};
  for (let i = 0; i < qualityGates.length; i++) {
    const category = qualityGates[i].category;
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the overall quality gate compliance rate.
 * @returns {number} The compliance rate percentage (0-100), or 0 if no gates exist.
 */
export function getOverallComplianceRate() {
  if (qualityGates.length === 0) {
    return 0;
  }
  const passed = qualityGates.filter(
    (gate) => gate.status === 'passed' || gate.status === 'waived',
  ).length;
  return Math.round((passed / qualityGates.length) * 10000) / 100;
}

/**
 * Calculate the weighted quality gate score.
 * Uses each gate's weight and normalized score (currentValue / threshold).
 * @returns {number} The weighted score (0-100), or 0 if no gates exist.
 */
export function getWeightedQualityGateScore() {
  if (qualityGates.length === 0) {
    return 0;
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (let i = 0; i < qualityGates.length; i++) {
    const gate = qualityGates[i];
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
 * Get the total number of pending waivers across all quality gates.
 * @returns {number} Total count of pending waivers.
 */
export function getTotalPendingWaivers() {
  let count = 0;
  for (let i = 0; i < qualityGates.length; i++) {
    if (Array.isArray(qualityGates[i].waiverHistory)) {
      for (let j = 0; j < qualityGates[i].waiverHistory.length; j++) {
        if (qualityGates[i].waiverHistory[j].status === 'pending') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get quality gate summary for a specific release.
 * @param {string} releaseId - The release ID to get summary for.
 * @returns {object} Summary object with counts by status.
 */
export function getQualityGateSummaryForRelease(releaseId) {
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

  const releaseGates = getQualityGatesByRelease(releaseId);
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
 * Find a quality gate by name (case-insensitive).
 * @param {string} name - The quality gate name to search for.
 * @returns {object|null} The quality gate object, or null if not found.
 */
export function getQualityGateByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return qualityGates.find((gate) => gate.name.toLowerCase() === nameLower) || null;
}

/**
 * Get all quality gates sorted by weight in descending order.
 * @param {number} [limit] - Optional maximum number of gates to return.
 * @returns {Array<object>} Array of quality gates sorted by weight.
 */
export function getQualityGatesByWeight(limit) {
  const sorted = [...qualityGates].sort((a, b) => (b.weight || 0) - (a.weight || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get the total weight sum across all quality gates.
 * @returns {number} The sum of all gate weights.
 */
export function getTotalWeight() {
  let total = 0;
  for (let i = 0; i < qualityGates.length; i++) {
    total += qualityGates[i].weight || 0;
  }
  return Math.round(total * 100) / 100;
}