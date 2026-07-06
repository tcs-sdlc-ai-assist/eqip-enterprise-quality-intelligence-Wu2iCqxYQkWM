import { v4 as uuidv4 } from 'uuid';

/**
 * @module releases
 * Mock release data seed for eQIP Quality Intelligence.
 * Releases with all PRD-specified fields including readiness scores, quality gate status,
 * test results, code coverage, pipeline status, approvals, evidence, waivers,
 * AI risk summaries, recommendations, and audit fields.
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
 * Mock release data array with enterprise releases.
 * Each release includes id, name, application, version, status, readinessScore,
 * qualityGateStatus, stories, features, defects, testCases, testResults,
 * codeCoverage, pipelineStatus, approvals, evidence, waivers, aiRiskSummary,
 * recommendations, and audit fields.
 * @type {Array<object>}
 */
const releases = [
  {
    id: 'rel-001',
    name: 'Release 2024.06',
    segment: 'Claims',
    application: 'EQIP Core',
    version: '2024.06.0',
    status: 'Ready',
    readinessScore: 92,
    quality_score: 92,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'passed',
      performance_test: 'passed',
      security_scan: 'passed',
      accessibility_audit: 'passed',
      uat_signoff: 'passed',
      release_readiness: 'in_review',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-001', title: 'Implement claims dashboard filters', status: 'completed', points: 5 },
      { id: 'story-002', title: 'Add export functionality for claims data', status: 'completed', points: 3 },
      { id: 'story-003', title: 'Integrate quality score widget', status: 'completed', points: 8 },
      { id: 'story-004', title: 'Implement role-based navigation', status: 'completed', points: 5 },
      { id: 'story-005', title: 'Add audit trail logging', status: 'completed', points: 3 },
    ],
    features: [
      { id: 'feat-001', name: 'Claims Dashboard Enhancements', status: 'completed', storiesCount: 3 },
      { id: 'feat-002', name: 'Quality Score Integration', status: 'completed', storiesCount: 2 },
    ],
    defects: {
      total: 12,
      critical: 0,
      high: 1,
      medium: 5,
      low: 6,
      open: 1,
      resolved: 11,
      production: 0,
    },
    testCases: {
      total: 450,
      automated: 380,
      manual: 70,
      passed: 440,
      failed: 5,
      blocked: 2,
      skipped: 3,
      not_run: 0,
    },
    testResults: {
      passRate: 97.78,
      executionRate: 99.33,
      automationCoverage: 84.44,
      defectDensity: 0.35,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 88,
      unit: 92,
      integration: 78,
      e2e: 65,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'pending',
      lastRun: daysAgo(1),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(3), comments: 'All quality gates passed.' },
      { role: 'Release Manager', approver: 'user-017', status: 'approved', date: daysAgo(2), comments: 'Release criteria met.' },
      { role: 'Program Manager', approver: 'user-012', status: 'approved', date: daysAgo(1), comments: 'Approved for production deployment.' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Functional Test Report Q2-2024', uploadedBy: 'user-005', uploadedAt: daysAgo(4) },
      { type: 'Security Scan', name: 'Veracode Scan Results', uploadedBy: 'user-010', uploadedAt: daysAgo(3) },
      { type: 'Performance Report', name: 'Load Test Results', uploadedBy: 'user-009', uploadedAt: daysAgo(3) },
    ],
    waivers: [],
    aiRiskSummary: 'Low risk release. All quality gates passed with strong test coverage and zero critical defects. Automation coverage exceeds target threshold. Recommend proceeding with deployment.',
    recommendations: ['Increase test coverage for edge cases in claims filters', 'Review defect backlog for next sprint planning'],
    releaseDate: daysAgo(-5),
    plannedDate: daysAgo(-3),
    created_at: daysAgo(30),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'rel-002',
    name: 'Release 2024.07',
    segment: 'Billing',
    application: 'Payment Gateway',
    version: '2024.07.0',
    status: 'In Progress',
    readinessScore: 78,
    quality_score: 78,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'failed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'in_review',
      regression_test: 'in_review',
      performance_test: 'not_started',
      security_scan: 'in_review',
      accessibility_audit: 'not_started',
      uat_signoff: 'not_started',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-006', title: 'Implement payment reconciliation module', status: 'in_progress', points: 8 },
      { id: 'story-007', title: 'Add multi-currency support', status: 'completed', points: 13 },
      { id: 'story-008', title: 'Refactor payment validation logic', status: 'completed', points: 5 },
      { id: 'story-009', title: 'Implement retry mechanism for failed payments', status: 'in_progress', points: 5 },
    ],
    features: [
      { id: 'feat-003', name: 'Payment Reconciliation', status: 'in_progress', storiesCount: 2 },
      { id: 'feat-004', name: 'Multi-Currency Support', status: 'completed', storiesCount: 1 },
      { id: 'feat-005', name: 'Payment Reliability', status: 'in_progress', storiesCount: 1 },
    ],
    defects: {
      total: 18,
      critical: 2,
      high: 4,
      medium: 7,
      low: 5,
      open: 8,
      resolved: 10,
      production: 0,
    },
    testCases: {
      total: 320,
      automated: 192,
      manual: 128,
      passed: 240,
      failed: 22,
      blocked: 8,
      skipped: 10,
      not_run: 40,
    },
    testResults: {
      passRate: 75.0,
      executionRate: 87.5,
      automationCoverage: 60.0,
      defectDensity: 0.68,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 75,
      unit: 80,
      integration: 65,
      e2e: 48,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'failed',
      securityScan: 'in_progress',
      qualityGate: 'failed',
      deployment: 'blocked',
      lastRun: daysAgo(0),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-004', status: 'pending', date: null, comments: '' },
      { role: 'Release Manager', approver: 'user-017', status: 'pending', date: null, comments: '' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Partial Functional Test Report', uploadedBy: 'user-009', uploadedAt: daysAgo(2) },
    ],
    waivers: [
      {
        id: 'waiver-001',
        gateKey: 'unit_test_coverage',
        gateName: 'Unit Test Coverage',
        reason: 'Legacy payment module has limited testability. Refactoring planned for next sprint.',
        requestedBy: 'user-020',
        requestedAt: daysAgo(3),
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
      },
    ],
    aiRiskSummary: 'Medium risk release. Unit test coverage gate has failed and a waiver is pending. Two critical defects remain open in the payment reconciliation module. Integration tests are failing intermittently. Recommend resolving critical defects before proceeding.',
    recommendations: [
      'Complete regression testing before UAT',
      'Resolve critical defects in payment reconciliation',
      'Improve unit test coverage for payment validation module',
      'Address intermittent integration test failures',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-14),
    created_at: daysAgo(20),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'rel-003',
    name: 'Release 2024.08',
    segment: 'Enrollment',
    application: 'Member Portal',
    version: '2024.08.0',
    status: 'In Review',
    readinessScore: 85,
    quality_score: 85,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'passed',
      performance_test: 'in_review',
      security_scan: 'passed',
      accessibility_audit: 'in_review',
      uat_signoff: 'in_review',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-010', title: 'Redesign member enrollment flow', status: 'completed', points: 13 },
      { id: 'story-011', title: 'Add eligibility verification API integration', status: 'completed', points: 8 },
      { id: 'story-012', title: 'Implement member self-service profile updates', status: 'completed', points: 5 },
      { id: 'story-013', title: 'Add accessibility improvements to enrollment forms', status: 'completed', points: 3 },
      { id: 'story-014', title: 'Implement enrollment confirmation notifications', status: 'completed', points: 3 },
    ],
    features: [
      { id: 'feat-006', name: 'Enrollment Flow Redesign', status: 'completed', storiesCount: 2 },
      { id: 'feat-007', name: 'Member Self-Service', status: 'completed', storiesCount: 2 },
      { id: 'feat-008', name: 'Accessibility Compliance', status: 'completed', storiesCount: 1 },
    ],
    defects: {
      total: 9,
      critical: 0,
      high: 0,
      medium: 4,
      low: 5,
      open: 2,
      resolved: 7,
      production: 0,
    },
    testCases: {
      total: 380,
      automated: 266,
      manual: 114,
      passed: 358,
      failed: 8,
      blocked: 4,
      skipped: 5,
      not_run: 5,
    },
    testResults: {
      passRate: 94.21,
      executionRate: 98.68,
      automationCoverage: 70.0,
      defectDensity: 0.45,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 82,
      unit: 87,
      integration: 74,
      e2e: 60,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'pending',
      lastRun: daysAgo(1),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(2), comments: 'Test results look good. Minor accessibility items remain.' },
      { role: 'Release Manager', approver: 'user-017', status: 'pending', date: null, comments: '' },
      { role: 'Product Owner', approver: 'user-023', status: 'pending', date: null, comments: '' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Functional Test Report - Member Portal', uploadedBy: 'user-006', uploadedAt: daysAgo(3) },
      { type: 'Accessibility Report', name: 'WCAG 2.1 AA Audit Results', uploadedBy: 'user-006', uploadedAt: daysAgo(2) },
      { type: 'Security Scan', name: 'SonarQube Analysis Report', uploadedBy: 'user-010', uploadedAt: daysAgo(2) },
    ],
    waivers: [],
    aiRiskSummary: 'Low-to-medium risk release. All critical quality gates passed. Performance testing and accessibility audit are in review. No critical or high severity defects remain. UAT sign-off is pending.',
    recommendations: [
      'Run performance tests under peak load scenarios',
      'Validate accessibility compliance for screen readers',
      'Complete UAT sign-off before release approval',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-10),
    created_at: daysAgo(15),
    updated_at: daysAgo(1),
    created_by: 'user-002',
    updated_by: 'user-014',
  },
  {
    id: 'rel-004',
    name: 'Release 2024.09',
    segment: 'Provider',
    application: 'Provider Directory',
    version: '2024.09.0',
    status: 'At Risk',
    readinessScore: 65,
    quality_score: 65,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'failed',
      static_analysis: 'failed',
      unit_test_coverage: 'failed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'failed',
      regression_test: 'in_review',
      performance_test: 'not_started',
      security_scan: 'failed',
      accessibility_audit: 'not_started',
      uat_signoff: 'not_started',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-015', title: 'Implement provider search by specialty', status: 'completed', points: 5 },
      { id: 'story-016', title: 'Add provider network tier display', status: 'in_progress', points: 8 },
      { id: 'story-017', title: 'Integrate provider credentialing status', status: 'in_progress', points: 8 },
      { id: 'story-018', title: 'Fix provider data synchronization issues', status: 'in_progress', points: 13 },
    ],
    features: [
      { id: 'feat-009', name: 'Enhanced Provider Search', status: 'in_progress', storiesCount: 2 },
      { id: 'feat-010', name: 'Credentialing Integration', status: 'in_progress', storiesCount: 1 },
      { id: 'feat-011', name: 'Data Sync Reliability', status: 'in_progress', storiesCount: 1 },
    ],
    defects: {
      total: 28,
      critical: 3,
      high: 7,
      medium: 10,
      low: 8,
      open: 18,
      resolved: 10,
      production: 2,
    },
    testCases: {
      total: 260,
      automated: 117,
      manual: 143,
      passed: 168,
      failed: 42,
      blocked: 15,
      skipped: 10,
      not_run: 25,
    },
    testResults: {
      passRate: 64.62,
      executionRate: 90.38,
      automationCoverage: 45.0,
      defectDensity: 0.95,
      defectRemovalEfficiency: 92.86,
    },
    codeCoverage: {
      overall: 62,
      unit: 68,
      integration: 52,
      e2e: 35,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'failed',
      integrationTests: 'failed',
      securityScan: 'failed',
      qualityGate: 'failed',
      deployment: 'blocked',
      lastRun: daysAgo(0),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-004', status: 'rejected', date: daysAgo(1), comments: 'Multiple quality gates failing. Not ready for release.' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Partial Test Execution Report', uploadedBy: 'user-007', uploadedAt: daysAgo(2) },
    ],
    waivers: [
      {
        id: 'waiver-002',
        gateKey: 'security_scan',
        gateName: 'Security Scan',
        reason: 'Known vulnerability in third-party dependency. Patch expected within 2 weeks.',
        requestedBy: 'user-011',
        requestedAt: daysAgo(2),
        status: 'rejected',
        approvedBy: 'user-001',
        approvedAt: daysAgo(1),
      },
      {
        id: 'waiver-003',
        gateKey: 'code_review',
        gateName: 'Code Review',
        reason: 'Pending review from tech lead who is on PTO.',
        requestedBy: 'user-007',
        requestedAt: daysAgo(1),
        status: 'pending',
        approvedBy: null,
        approvedAt: null,
      },
    ],
    aiRiskSummary: 'High risk release. Multiple quality gates have failed including code review, static analysis, unit test coverage, functional test, and security scan. Three critical defects and seven high severity defects remain open. Two production defects have been reported. Automation coverage is significantly below target. Recommend delaying release until critical issues are resolved.',
    recommendations: [
      'Address security vulnerabilities immediately',
      'Increase automation coverage to at least 60%',
      'Resolve all critical and high severity defects',
      'Complete code review for all pending changes',
      'Re-run static analysis after code fixes',
      'Consider splitting release scope to reduce risk',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-7),
    created_at: daysAgo(10),
    updated_at: daysAgo(0),
    created_by: 'user-003',
    updated_by: 'user-011',
  },
  {
    id: 'rel-005',
    name: 'Release 2024.10',
    segment: 'Claims',
    application: 'Claims Processing',
    version: '2024.10.0',
    status: 'Ready',
    readinessScore: 95,
    quality_score: 95,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'passed',
      performance_test: 'passed',
      security_scan: 'passed',
      accessibility_audit: 'passed',
      uat_signoff: 'passed',
      release_readiness: 'passed',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-019', title: 'Optimize claims adjudication engine', status: 'completed', points: 13 },
      { id: 'story-020', title: 'Add batch claims processing support', status: 'completed', points: 8 },
      { id: 'story-021', title: 'Implement claims status notification system', status: 'completed', points: 5 },
      { id: 'story-022', title: 'Add claims analytics dashboard widgets', status: 'completed', points: 5 },
      { id: 'story-023', title: 'Improve claims search performance', status: 'completed', points: 3 },
      { id: 'story-024', title: 'Fix claims duplication detection', status: 'completed', points: 5 },
    ],
    features: [
      { id: 'feat-012', name: 'Claims Engine Optimization', status: 'completed', storiesCount: 2 },
      { id: 'feat-013', name: 'Batch Processing', status: 'completed', storiesCount: 1 },
      { id: 'feat-014', name: 'Claims Analytics', status: 'completed', storiesCount: 2 },
      { id: 'feat-015', name: 'Claims Data Quality', status: 'completed', storiesCount: 1 },
    ],
    defects: {
      total: 8,
      critical: 0,
      high: 0,
      medium: 3,
      low: 5,
      open: 0,
      resolved: 8,
      production: 0,
    },
    testCases: {
      total: 520,
      automated: 416,
      manual: 104,
      passed: 515,
      failed: 2,
      blocked: 0,
      skipped: 3,
      not_run: 0,
    },
    testResults: {
      passRate: 99.04,
      executionRate: 99.42,
      automationCoverage: 80.0,
      defectDensity: 0.28,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 91,
      unit: 95,
      integration: 84,
      e2e: 72,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'completed',
      lastRun: daysAgo(3),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(5), comments: 'Excellent quality metrics. All gates passed.' },
      { role: 'Release Manager', approver: 'user-017', status: 'approved', date: daysAgo(4), comments: 'Release criteria fully met.' },
      { role: 'Program Manager', approver: 'user-012', status: 'approved', date: daysAgo(3), comments: 'Approved. Outstanding release quality.' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Full Regression Test Report', uploadedBy: 'user-005', uploadedAt: daysAgo(6) },
      { type: 'Performance Report', name: 'Claims Engine Performance Benchmark', uploadedBy: 'user-009', uploadedAt: daysAgo(5) },
      { type: 'Security Scan', name: 'Fortify Security Scan Results', uploadedBy: 'user-010', uploadedAt: daysAgo(5) },
      { type: 'UAT Report', name: 'UAT Sign-off Document', uploadedBy: 'user-022', uploadedAt: daysAgo(4) },
    ],
    waivers: [],
    aiRiskSummary: 'Very low risk release. All 15 applicable quality gates passed. Zero critical or high severity defects. Test pass rate exceeds 99% with 80% automation coverage. All approvals obtained. Recommend immediate deployment.',
    recommendations: [],
    releaseDate: daysAgo(3),
    plannedDate: daysAgo(5),
    created_at: daysAgo(45),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'rel-006',
    name: 'Release 2024.11',
    segment: 'Pharmacy',
    application: 'Rx Platform',
    version: '2024.11.0',
    status: 'In Progress',
    readinessScore: 72,
    quality_score: 72,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'in_review',
      regression_test: 'not_started',
      performance_test: 'not_started',
      security_scan: 'in_review',
      accessibility_audit: 'not_started',
      uat_signoff: 'not_started',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-025', title: 'Implement formulary tier management', status: 'completed', points: 8 },
      { id: 'story-026', title: 'Add prior authorization workflow', status: 'in_progress', points: 13 },
      { id: 'story-027', title: 'Integrate pharmacy network validation', status: 'completed', points: 5 },
      { id: 'story-028', title: 'Implement drug interaction alerts', status: 'in_progress', points: 8 },
    ],
    features: [
      { id: 'feat-016', name: 'Formulary Management', status: 'completed', storiesCount: 1 },
      { id: 'feat-017', name: 'Prior Authorization', status: 'in_progress', storiesCount: 1 },
      { id: 'feat-018', name: 'Clinical Safety Alerts', status: 'in_progress', storiesCount: 2 },
    ],
    defects: {
      total: 15,
      critical: 1,
      high: 3,
      medium: 6,
      low: 5,
      open: 7,
      resolved: 8,
      production: 0,
    },
    testCases: {
      total: 340,
      automated: 238,
      manual: 102,
      passed: 270,
      failed: 18,
      blocked: 5,
      skipped: 7,
      not_run: 40,
    },
    testResults: {
      passRate: 79.41,
      executionRate: 88.24,
      automationCoverage: 70.0,
      defectDensity: 0.52,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 78,
      unit: 84,
      integration: 70,
      e2e: 52,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'in_progress',
      qualityGate: 'in_progress',
      deployment: 'pending',
      lastRun: daysAgo(0),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'pending', date: null, comments: '' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Functional Test Progress Report', uploadedBy: 'user-008', uploadedAt: daysAgo(1) },
    ],
    waivers: [],
    aiRiskSummary: 'Medium risk release. One critical defect in drug interaction alert module requires immediate attention. Prior authorization workflow is still in progress. Functional testing and security scan are under review. Recommend completing all in-progress stories before proceeding to regression testing.',
    recommendations: [
      'Resolve critical defect in drug interaction alerts',
      'Complete prior authorization workflow development',
      'Finish functional testing before starting regression',
      'Schedule performance testing for pharmacy transaction throughput',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-21),
    created_at: daysAgo(25),
    updated_at: daysAgo(0),
    created_by: 'user-002',
    updated_by: 'user-012',
  },
  {
    id: 'rel-007',
    name: 'Release 2024.12',
    segment: 'Enrollment',
    application: 'Enrollment Engine',
    version: '2024.12.0',
    status: 'Draft',
    readinessScore: 45,
    quality_score: 45,
    qualityGateStatus: {
      requirements_review: 'in_review',
      design_review: 'in_review',
      test_plan_approval: 'not_started',
      code_review: 'not_started',
      static_analysis: 'not_started',
      unit_test_coverage: 'not_started',
      build_verification: 'not_started',
      smoke_test: 'not_started',
      functional_test: 'not_started',
      regression_test: 'not_started',
      performance_test: 'not_started',
      security_scan: 'not_started',
      accessibility_audit: 'not_started',
      uat_signoff: 'not_started',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-029', title: 'Implement open enrollment period rules engine', status: 'draft', points: 13 },
      { id: 'story-030', title: 'Add dependent enrollment workflow', status: 'draft', points: 8 },
      { id: 'story-031', title: 'Implement plan comparison feature', status: 'draft', points: 8 },
    ],
    features: [
      { id: 'feat-019', name: 'Open Enrollment Rules', status: 'draft', storiesCount: 1 },
      { id: 'feat-020', name: 'Dependent Enrollment', status: 'draft', storiesCount: 1 },
      { id: 'feat-021', name: 'Plan Comparison', status: 'draft', storiesCount: 1 },
    ],
    defects: {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      resolved: 0,
      production: 0,
    },
    testCases: {
      total: 0,
      automated: 0,
      manual: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      not_run: 0,
    },
    testResults: {
      passRate: 0,
      executionRate: 0,
      automationCoverage: 0,
      defectDensity: 0,
      defectRemovalEfficiency: 0,
    },
    codeCoverage: {
      overall: 0,
      unit: 0,
      integration: 0,
      e2e: 0,
    },
    pipelineStatus: {
      build: 'not_started',
      unitTests: 'not_started',
      integrationTests: 'not_started',
      securityScan: 'not_started',
      qualityGate: 'not_started',
      deployment: 'not_started',
      lastRun: null,
    },
    approvals: [],
    evidence: [],
    waivers: [],
    aiRiskSummary: 'Release is in early planning phase. Requirements and design reviews are in progress. No development or testing has started. Risk assessment will be available once development begins.',
    recommendations: [
      'Complete requirements review and design sign-off',
      'Develop test plan aligned with enrollment rules complexity',
      'Plan for automation of enrollment workflow test cases',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-45),
    created_at: daysAgo(5),
    updated_at: daysAgo(0),
    created_by: 'user-014',
    updated_by: 'user-014',
  },
  {
    id: 'rel-008',
    name: 'Release 2024.13',
    segment: 'Underwriting',
    application: 'Underwriting Engine',
    version: '2024.13.0',
    status: 'In Progress',
    readinessScore: 80,
    quality_score: 80,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'in_review',
      performance_test: 'in_review',
      security_scan: 'passed',
      accessibility_audit: 'waived',
      uat_signoff: 'not_started',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-032', title: 'Implement risk scoring model v2', status: 'completed', points: 13 },
      { id: 'story-033', title: 'Add automated underwriting decision rules', status: 'completed', points: 8 },
      { id: 'story-034', title: 'Integrate external credit data source', status: 'completed', points: 8 },
      { id: 'story-035', title: 'Implement underwriting audit trail', status: 'completed', points: 5 },
    ],
    features: [
      { id: 'feat-022', name: 'Risk Scoring v2', status: 'completed', storiesCount: 1 },
      { id: 'feat-023', name: 'Automated Underwriting', status: 'completed', storiesCount: 2 },
      { id: 'feat-024', name: 'Underwriting Audit', status: 'completed', storiesCount: 1 },
    ],
    defects: {
      total: 11,
      critical: 0,
      high: 1,
      medium: 5,
      low: 5,
      open: 3,
      resolved: 8,
      production: 0,
    },
    testCases: {
      total: 290,
      automated: 191,
      manual: 99,
      passed: 265,
      failed: 10,
      blocked: 3,
      skipped: 2,
      not_run: 10,
    },
    testResults: {
      passRate: 91.38,
      executionRate: 96.55,
      automationCoverage: 65.86,
      defectDensity: 0.55,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 80,
      unit: 86,
      integration: 72,
      e2e: 55,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'pending',
      lastRun: daysAgo(1),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(2), comments: 'Quality metrics are acceptable. Accessibility waiver approved for backend service.' },
      { role: 'Release Manager', approver: 'user-017', status: 'pending', date: null, comments: '' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Underwriting Engine Test Report', uploadedBy: 'user-005', uploadedAt: daysAgo(3) },
      { type: 'Security Scan', name: 'Veracode Scan - Underwriting', uploadedBy: 'user-010', uploadedAt: daysAgo(2) },
    ],
    waivers: [
      {
        id: 'waiver-004',
        gateKey: 'accessibility_audit',
        gateName: 'Accessibility Audit',
        reason: 'Backend-only service with no user-facing UI. Accessibility audit not applicable.',
        requestedBy: 'user-011',
        requestedAt: daysAgo(5),
        status: 'approved',
        approvedBy: 'user-001',
        approvedAt: daysAgo(4),
      },
    ],
    aiRiskSummary: 'Low-to-medium risk release. Most quality gates passed. Accessibility audit waived for backend service. Regression and performance testing are in review. One high severity defect in risk scoring edge case needs resolution before UAT.',
    recommendations: [
      'Resolve high severity defect in risk scoring edge case',
      'Complete regression and performance testing',
      'Schedule UAT with underwriting team',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-18),
    created_at: daysAgo(28),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'rel-009',
    name: 'Release 2024.14',
    segment: 'Regulatory Compliance',
    application: 'Compliance Dashboard',
    version: '2024.14.0',
    status: 'Ready',
    readinessScore: 97,
    quality_score: 97,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'passed',
      performance_test: 'passed',
      security_scan: 'passed',
      accessibility_audit: 'passed',
      uat_signoff: 'passed',
      release_readiness: 'passed',
      post_deployment_verification: 'passed',
    },
    stories: [
      { id: 'story-036', title: 'Add real-time compliance monitoring widgets', status: 'completed', points: 8 },
      { id: 'story-037', title: 'Implement compliance alert notification system', status: 'completed', points: 5 },
      { id: 'story-038', title: 'Add regulatory report generation', status: 'completed', points: 8 },
    ],
    features: [
      { id: 'feat-025', name: 'Real-time Compliance Monitoring', status: 'completed', storiesCount: 2 },
      { id: 'feat-026', name: 'Regulatory Reporting', status: 'completed', storiesCount: 1 },
    ],
    defects: {
      total: 4,
      critical: 0,
      high: 0,
      medium: 1,
      low: 3,
      open: 0,
      resolved: 4,
      production: 0,
    },
    testCases: {
      total: 280,
      automated: 238,
      manual: 42,
      passed: 278,
      failed: 1,
      blocked: 0,
      skipped: 1,
      not_run: 0,
    },
    testResults: {
      passRate: 99.29,
      executionRate: 99.64,
      automationCoverage: 85.0,
      defectDensity: 0.18,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 93,
      unit: 96,
      integration: 88,
      e2e: 78,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'completed',
      lastRun: daysAgo(5),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(7), comments: 'Exceptional quality. All gates passed.' },
      { role: 'Release Manager', approver: 'user-017', status: 'approved', date: daysAgo(6), comments: 'Release approved.' },
      { role: 'VP of Quality', approver: 'user-001', status: 'approved', date: daysAgo(5), comments: 'Approved for production. Exemplary release quality.' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Complete Test Execution Report', uploadedBy: 'user-005', uploadedAt: daysAgo(8) },
      { type: 'Security Scan', name: 'Full Security Assessment', uploadedBy: 'user-010', uploadedAt: daysAgo(7) },
      { type: 'Performance Report', name: 'Dashboard Performance Benchmark', uploadedBy: 'user-009', uploadedAt: daysAgo(7) },
      { type: 'Accessibility Report', name: 'WCAG 2.1 AA Full Compliance Report', uploadedBy: 'user-006', uploadedAt: daysAgo(7) },
      { type: 'UAT Report', name: 'UAT Sign-off - Compliance Dashboard', uploadedBy: 'user-001', uploadedAt: daysAgo(6) },
    ],
    waivers: [],
    aiRiskSummary: 'Minimal risk release. All 16 quality gates passed including post-deployment verification. Zero critical or high severity defects. Test pass rate exceeds 99% with 85% automation coverage. This release demonstrates best-in-class quality practices.',
    recommendations: [],
    releaseDate: daysAgo(5),
    plannedDate: daysAgo(7),
    created_at: daysAgo(40),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'rel-010',
    name: 'Release 2024.15',
    segment: 'Insurance Claims',
    application: 'Insurance Claims Portal',
    version: '2024.15.0',
    status: 'In Review',
    readinessScore: 83,
    quality_score: 83,
    qualityGateStatus: {
      requirements_review: 'passed',
      design_review: 'passed',
      test_plan_approval: 'passed',
      code_review: 'passed',
      static_analysis: 'passed',
      unit_test_coverage: 'passed',
      build_verification: 'passed',
      smoke_test: 'passed',
      functional_test: 'passed',
      regression_test: 'passed',
      performance_test: 'passed',
      security_scan: 'passed',
      accessibility_audit: 'in_review',
      uat_signoff: 'in_review',
      release_readiness: 'not_started',
      post_deployment_verification: 'not_started',
    },
    stories: [
      { id: 'story-039', title: 'Implement claims photo upload feature', status: 'completed', points: 5 },
      { id: 'story-040', title: 'Add claims status tracking timeline', status: 'completed', points: 5 },
      { id: 'story-041', title: 'Implement agent claims assignment workflow', status: 'completed', points: 8 },
      { id: 'story-042', title: 'Add claims document OCR processing', status: 'completed', points: 13 },
    ],
    features: [
      { id: 'feat-027', name: 'Claims Photo Evidence', status: 'completed', storiesCount: 1 },
      { id: 'feat-028', name: 'Claims Tracking', status: 'completed', storiesCount: 1 },
      { id: 'feat-029', name: 'Agent Workflow', status: 'completed', storiesCount: 1 },
      { id: 'feat-030', name: 'Document Processing', status: 'completed', storiesCount: 1 },
    ],
    defects: {
      total: 10,
      critical: 0,
      high: 1,
      medium: 4,
      low: 5,
      open: 2,
      resolved: 8,
      production: 0,
    },
    testCases: {
      total: 310,
      automated: 198,
      manual: 112,
      passed: 292,
      failed: 6,
      blocked: 2,
      skipped: 4,
      not_run: 6,
    },
    testResults: {
      passRate: 94.19,
      executionRate: 98.06,
      automationCoverage: 63.87,
      defectDensity: 0.48,
      defectRemovalEfficiency: 100,
    },
    codeCoverage: {
      overall: 81,
      unit: 86,
      integration: 74,
      e2e: 58,
    },
    pipelineStatus: {
      build: 'passed',
      unitTests: 'passed',
      integrationTests: 'passed',
      securityScan: 'passed',
      qualityGate: 'passed',
      deployment: 'pending',
      lastRun: daysAgo(1),
    },
    approvals: [
      { role: 'QA Lead', approver: 'user-003', status: 'approved', date: daysAgo(2), comments: 'Quality metrics meet release criteria.' },
      { role: 'Release Manager', approver: 'user-017', status: 'pending', date: null, comments: '' },
    ],
    evidence: [
      { type: 'Test Report', name: 'Insurance Claims Portal Test Report', uploadedBy: 'user-006', uploadedAt: daysAgo(3) },
      { type: 'Security Scan', name: 'SonarQube Analysis - Claims Portal', uploadedBy: 'user-010', uploadedAt: daysAgo(2) },
    ],
    waivers: [],
    aiRiskSummary: 'Low-to-medium risk release. Core quality gates passed. Accessibility audit and UAT sign-off are in review. One high severity defect in document OCR processing needs attention. Overall quality metrics are within acceptable thresholds.',
    recommendations: [
      'Resolve high severity defect in OCR processing module',
      'Complete accessibility audit for photo upload feature',
      'Obtain UAT sign-off from claims operations team',
    ],
    releaseDate: null,
    plannedDate: daysAgo(-12),
    created_at: daysAgo(22),
    updated_at: daysAgo(1),
    created_by: 'user-014',
    updated_by: 'user-014',
  },
];

export default releases;

/**
 * Get all mock releases.
 * @returns {Array<object>} Array of release objects.
 */
export function getAllReleases() {
  return [...releases];
}

/**
 * Find a release by ID.
 * @param {string} id - The release ID to find.
 * @returns {object|null} The release object, or null if not found.
 */
export function getReleaseById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return releases.find((release) => release.id === id) || null;
}

/**
 * Get all releases for a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of releases within the specified segment.
 */
export function getReleasesBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return releases.filter((release) => release.segment === segment);
}

/**
 * Get all releases for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of releases for the specified application.
 */
export function getReleasesByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return releases.filter((release) => release.application === application);
}

/**
 * Get all releases with a specific status.
 * @param {string} status - The status to filter by (e.g., 'Ready', 'In Progress', 'At Risk').
 * @returns {Array<object>} Array of releases with the specified status.
 */
export function getReleasesByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return releases.filter((release) => release.status === status);
}

/**
 * Get releases sorted by readiness score in descending order.
 * @param {number} [limit] - Optional maximum number of releases to return.
 * @returns {Array<object>} Array of releases sorted by readiness score.
 */
export function getReleasesByReadinessScore(limit) {
  const sorted = [...releases].sort((a, b) => (b.readinessScore || 0) - (a.readinessScore || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get at-risk releases (sorted by readiness score ascending).
 * @param {number} [limit] - Optional maximum number of releases to return.
 * @returns {Array<object>} Array of at-risk releases sorted by readiness score ascending.
 */
export function getAtRiskReleases(limit) {
  const sorted = [...releases].sort((a, b) => (a.readinessScore || 0) - (b.readinessScore || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get releases that have pending waivers.
 * @returns {Array<object>} Array of releases with pending waivers.
 */
export function getReleasesWithPendingWaivers() {
  return releases.filter(
    (release) =>
      Array.isArray(release.waivers) &&
      release.waivers.some((waiver) => waiver.status === 'pending'),
  );
}

/**
 * Get releases that have pending approvals.
 * @returns {Array<object>} Array of releases with pending approvals.
 */
export function getReleasesWithPendingApprovals() {
  return releases.filter(
    (release) =>
      Array.isArray(release.approvals) &&
      release.approvals.some((approval) => approval.status === 'pending'),
  );
}

/**
 * Get distinct statuses from the release data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].status) {
      statuses.add(releases[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct segments from the release data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].segment) {
      segments.add(releases[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct applications from the release data.
 * @returns {string[]} Array of unique application strings.
 */
export function getDistinctApplications() {
  const applications = new Set();
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].application) {
      applications.add(releases[i].application);
    }
  }
  return [...applications].sort();
}

/**
 * Get a count of releases grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getReleaseCountByStatus() {
  const counts = {};
  for (let i = 0; i < releases.length; i++) {
    const status = releases[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of releases grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getReleaseCountBySegment() {
  const counts = {};
  for (let i = 0; i < releases.length; i++) {
    const segment = releases[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average readiness score across all releases.
 * @returns {number} The average readiness score, or 0 if no releases exist.
 */
export function getAverageReadinessScore() {
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
 * Calculate the average quality score across all releases.
 * @returns {number} The average quality score, or 0 if no releases exist.
 */
export function getAverageQualityScore() {
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
 * Get the total number of open defects across all releases.
 * @returns {number} Total open defects.
 */
export function getTotalOpenDefects() {
  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].defects && typeof releases[i].defects.open === 'number') {
      total += releases[i].defects.open;
    }
  }
  return total;
}

/**
 * Get the total number of critical defects across all releases.
 * @returns {number} Total critical defects.
 */
export function getTotalCriticalDefects() {
  let total = 0;
  for (let i = 0; i < releases.length; i++) {
    if (releases[i].defects && typeof releases[i].defects.critical === 'number') {
      total += releases[i].defects.critical;
    }
  }
  return total;
}

/**
 * Find a release by name (case-insensitive).
 * @param {string} name - The release name to search for.
 * @returns {object|null} The release object, or null if not found.
 */
export function getReleaseByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return releases.find((release) => release.name.toLowerCase() === nameLower) || null;
}

/**
 * Get quality gate summary across all releases.
 * @returns {object} Object with gate status counts (passed, failed, in_review, not_started, waived).
 */
export function getQualityGateSummary() {
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