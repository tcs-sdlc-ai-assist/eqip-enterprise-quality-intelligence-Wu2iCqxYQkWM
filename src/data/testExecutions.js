import { v4 as uuidv4 } from 'uuid';

/**
 * @module testExecutions
 * Mock test execution data seed for eQIP Quality Intelligence.
 * Executions with all PRD-specified fields including id, testCaseId, testSuiteId,
 * status, result, duration, environment, evidence, failureReason, aiAnalysis,
 * remediation, executedBy, executedAt, and audit fields.
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
 * Mock test execution data array.
 * Each execution includes id, testCaseId, testSuiteId, status, result, duration,
 * environment, evidence, failureReason, aiAnalysis, remediation, executedBy,
 * executedAt, and audit fields.
 * @type {Array<object>}
 */
const testExecutions = [
  // Claims Processing Regression Suite executions
  {
    id: 'exec-001',
    testCaseId: 'tc-001',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims intake form submission with valid data',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 45,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'claims-intake-success.png', url: '/evidence/exec-001/screenshot-1.png', capturedAt: daysAgo(2) },
      { type: 'log', name: 'test-execution-log.txt', url: '/evidence/exec-001/log.txt', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'intake'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-002',
    testCaseId: 'tc-001',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims intake form submission with valid data',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 48,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc2',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'screenshot', name: 'claims-intake-success.png', url: '/evidence/exec-002/screenshot-1.png', capturedAt: daysAgo(9) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(9),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'intake'],
    created_at: daysAgo(9),
    updated_at: daysAgo(9),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-003',
    testCaseId: 'tc-001',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims intake form submission with valid data',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 42,
    environment: 'uat',
    buildNumber: 'build-2024.06-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'screenshot', name: 'claims-intake-uat.png', url: '/evidence/exec-003/screenshot-1.png', capturedAt: daysAgo(16) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(16),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'uat'],
    created_at: daysAgo(16),
    updated_at: daysAgo(16),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-004',
    testCaseId: 'tc-001',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims intake form submission with valid data',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'failed',
    duration: 52,
    environment: 'staging',
    buildNumber: 'build-2024.05-rc4',
    browserOrPlatform: 'Chrome 123',
    evidence: [
      { type: 'screenshot', name: 'claims-intake-failure.png', url: '/evidence/exec-004/screenshot-1.png', capturedAt: daysAgo(30) },
      { type: 'log', name: 'error-log.txt', url: '/evidence/exec-004/error-log.txt', capturedAt: daysAgo(30) },
    ],
    failureReason: 'Member ID auto-population failed due to API timeout. The member lookup service returned a 504 Gateway Timeout after 30 seconds.',
    aiAnalysis: 'Root cause identified as a database connection pool exhaustion in the member lookup service. The connection pool was configured with a maximum of 10 connections, which was insufficient during peak load. Similar failures observed in 3 other test cases during the same execution window.',
    remediation: 'Increased connection pool size from 10 to 50 in the member lookup service configuration. Added connection pool monitoring alerts. Implemented circuit breaker pattern for member lookup API calls.',
    executedBy: 'user-008',
    executedAt: daysAgo(30),
    retryCount: 1,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'failure'],
    created_at: daysAgo(30),
    updated_at: daysAgo(28),
    created_by: 'user-008',
    updated_by: 'user-005',
  },
  {
    id: 'exec-005',
    testCaseId: 'tc-002',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims adjudication auto-processing for clean claims',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 38,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'log', name: 'adjudication-log.txt', url: '/evidence/exec-005/log.txt', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'adjudication'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-006',
    testCaseId: 'tc-002',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims adjudication auto-processing for clean claims',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 41,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc2',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(9),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'adjudication'],
    created_at: daysAgo(9),
    updated_at: daysAgo(9),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-007',
    testCaseId: 'tc-002',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims adjudication auto-processing for clean claims',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 36,
    environment: 'uat',
    buildNumber: 'build-2024.06-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'log', name: 'adjudication-uat-log.txt', url: '/evidence/exec-007/log.txt', capturedAt: daysAgo(23) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(23),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'adjudication', 'uat'],
    created_at: daysAgo(23),
    updated_at: daysAgo(23),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-008',
    testCaseId: 'tc-003',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify batch claims processing handles large volumes',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 1320,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'JMeter 5.6',
    evidence: [
      { type: 'report', name: 'batch-performance-report.html', url: '/evidence/exec-008/report.html', capturedAt: daysAgo(5) },
      { type: 'log', name: 'batch-processing-log.txt', url: '/evidence/exec-008/log.txt', capturedAt: daysAgo(5) },
      { type: 'metrics', name: 'throughput-metrics.json', url: '/evidence/exec-008/metrics.json', capturedAt: daysAgo(5) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(5),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['performance', 'claims', 'batch'],
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-009',
    testCaseId: 'tc-003',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify batch claims processing handles large volumes',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 1450,
    environment: 'staging',
    buildNumber: 'build-2024.05-rc2',
    browserOrPlatform: 'JMeter 5.6',
    evidence: [
      { type: 'report', name: 'batch-performance-report.html', url: '/evidence/exec-009/report.html', capturedAt: daysAgo(20) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(20),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['performance', 'claims', 'batch'],
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-010',
    testCaseId: 'tc-004',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims duplication detection prevents duplicate submissions',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 28,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'duplicate-warning.png', url: '/evidence/exec-010/screenshot-1.png', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'deduplication'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-011',
    testCaseId: 'tc-004',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims duplication detection prevents duplicate submissions',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 30,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(12),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['regression', 'claims', 'deduplication'],
    created_at: daysAgo(12),
    updated_at: daysAgo(12),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-012',
    testCaseId: 'tc-005',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims status notification is sent to member',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 15,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'Manual',
    evidence: [
      { type: 'screenshot', name: 'notification-email.png', url: '/evidence/exec-012/screenshot-1.png', capturedAt: daysAgo(3) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(3),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['claims', 'notifications', 'manual'],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-013',
    testCaseId: 'tc-005',
    testSuiteId: 'suite-001',
    testCaseTitle: 'Verify claims status notification is sent to member',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'completed',
    result: 'passed',
    duration: 18,
    environment: 'uat',
    buildNumber: 'build-2024.06-rc1',
    browserOrPlatform: 'Manual',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(15),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['claims', 'notifications', 'manual', 'uat'],
    created_at: daysAgo(15),
    updated_at: daysAgo(15),
    created_by: 'user-006',
    updated_by: 'user-006',
  },

  // Payment Gateway Integration Suite executions
  {
    id: 'exec-014',
    testCaseId: 'tc-006',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment processing with valid credit card',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'passed',
    duration: 35,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'payment-confirmation.png', url: '/evidence/exec-014/screenshot-1.png', capturedAt: daysAgo(1) },
      { type: 'log', name: 'payment-transaction-log.txt', url: '/evidence/exec-014/log.txt', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'credit-card'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-015',
    testCaseId: 'tc-006',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment processing with valid credit card',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'passed',
    duration: 38,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-020',
    executedAt: daysAgo(8),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'credit-card'],
    created_at: daysAgo(8),
    updated_at: daysAgo(8),
    created_by: 'user-020',
    updated_by: 'user-020',
  },
  {
    id: 'exec-016',
    testCaseId: 'tc-006',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment processing with valid credit card',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'failed',
    duration: 42,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc4',
    browserOrPlatform: 'Chrome 123',
    evidence: [
      { type: 'screenshot', name: 'payment-error.png', url: '/evidence/exec-016/screenshot-1.png', capturedAt: daysAgo(15) },
      { type: 'log', name: 'payment-error-log.txt', url: '/evidence/exec-016/error-log.txt', capturedAt: daysAgo(15) },
    ],
    failureReason: 'Payment authorization failed with error code AUTH_DECLINED. The payment processor sandbox returned an unexpected decline code for the test card number. Root cause was an expired test card configuration in the sandbox environment.',
    aiAnalysis: 'Analysis indicates the test card number 4111-XXXX-XXXX-1111 expired in the sandbox environment on 2024-05-31. The sandbox configuration was not updated after the monthly rotation. This is an environment configuration issue, not a code defect. Recommend updating sandbox test card configurations as part of monthly maintenance.',
    remediation: 'Updated sandbox test card configurations with new expiration dates. Added automated check for test card expiration in CI/CD pipeline pre-flight checks. Created runbook for monthly sandbox maintenance.',
    executedBy: 'user-009',
    executedAt: daysAgo(15),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'failure', 'environment'],
    created_at: daysAgo(15),
    updated_at: daysAgo(13),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-017',
    testCaseId: 'tc-007',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify multi-currency payment conversion',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'passed',
    duration: 42,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'currency-conversion.png', url: '/evidence/exec-017/screenshot-1.png', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-020',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'multi-currency'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-020',
    updated_by: 'user-020',
  },
  {
    id: 'exec-018',
    testCaseId: 'tc-007',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify multi-currency payment conversion',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'passed',
    duration: 45,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(10),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'multi-currency'],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-019',
    testCaseId: 'tc-008',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment reconciliation report accuracy',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'failed',
    duration: 120,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc2',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'log', name: 'reconciliation-error.txt', url: '/evidence/exec-019/error-log.txt', capturedAt: daysAgo(1) },
      { type: 'report', name: 'discrepancy-report.csv', url: '/evidence/exec-019/discrepancy.csv', capturedAt: daysAgo(1) },
    ],
    failureReason: '3 transactions could not be matched due to timing difference in settlement dates. The bank settlement file uses T+1 settlement dating while the system records transactions at T+0. This creates a mismatch for transactions processed near midnight.',
    aiAnalysis: 'Pattern analysis reveals this is a recurring issue affecting approximately 0.2% of transactions processed between 23:00 and 00:00 UTC. The reconciliation engine does not account for the T+1 settlement window used by the acquiring bank. Similar issues have been reported in exec-020 and exec-021. Recommend implementing a settlement date normalization layer.',
    remediation: 'Implementing settlement date normalization to account for T+1 banking settlement windows. Adding configurable settlement offset per payment processor. Fix targeted for Release 2024.07 patch.',
    executedBy: 'user-009',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'reconciliation', 'failure'],
    created_at: daysAgo(1),
    updated_at: daysAgo(0),
    created_by: 'user-009',
    updated_by: 'user-013',
  },
  {
    id: 'exec-020',
    testCaseId: 'tc-008',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment reconciliation report accuracy',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'failed',
    duration: 115,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc1',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'log', name: 'reconciliation-error.txt', url: '/evidence/exec-020/error-log.txt', capturedAt: daysAgo(8) },
    ],
    failureReason: 'Same settlement date mismatch issue as exec-019. 2 transactions unmatched due to T+1 settlement offset.',
    aiAnalysis: 'Consistent with previously identified settlement date normalization issue. Defect DEF-PAY-003 tracks this issue.',
    remediation: null,
    executedBy: 'user-020',
    executedAt: daysAgo(8),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'reconciliation', 'failure'],
    created_at: daysAgo(8),
    updated_at: daysAgo(8),
    created_by: 'user-020',
    updated_by: 'user-020',
  },
  {
    id: 'exec-021',
    testCaseId: 'tc-008',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment reconciliation report accuracy',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'completed',
    result: 'passed',
    duration: 110,
    environment: 'staging',
    buildNumber: 'build-2024.05-rc3',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'report', name: 'reconciliation-report.html', url: '/evidence/exec-021/report.html', capturedAt: daysAgo(20) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(20),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'reconciliation'],
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-022',
    testCaseId: 'tc-009',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment retry mechanism for failed transactions',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'in_progress',
    result: null,
    duration: 90,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'log', name: 'retry-partial-log.txt', url: '/evidence/exec-022/log.txt', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: 'Execution is in progress. First two retry steps completed successfully. Remaining steps pending automation script completion for exponential backoff verification.',
    remediation: null,
    executedBy: 'user-020',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['integration', 'payments', 'retry', 'in-progress'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-020',
    updated_by: 'user-020',
  },

  // Member Portal Enrollment Suite executions
  {
    id: 'exec-023',
    testCaseId: 'tc-010',
    testSuiteId: 'suite-003',
    testCaseTitle: 'Verify new member enrollment flow end-to-end',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 65,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'enrollment-confirmation.png', url: '/evidence/exec-023/screenshot-1.png', capturedAt: daysAgo(3) },
      { type: 'video', name: 'enrollment-flow-recording.mp4', url: '/evidence/exec-023/video.mp4', capturedAt: daysAgo(3) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(3),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['enrollment', 'e2e', 'member-portal'],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'exec-024',
    testCaseId: 'tc-010',
    testSuiteId: 'suite-003',
    testCaseTitle: 'Verify new member enrollment flow end-to-end',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 70,
    environment: 'uat',
    buildNumber: 'build-2024.08-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'screenshot', name: 'enrollment-uat-confirmation.png', url: '/evidence/exec-024/screenshot-1.png', capturedAt: daysAgo(10) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(10),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['enrollment', 'e2e', 'member-portal', 'uat'],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'exec-025',
    testCaseId: 'tc-010',
    testSuiteId: 'suite-003',
    testCaseTitle: 'Verify new member enrollment flow end-to-end',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 68,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc3',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-021',
    executedAt: daysAgo(25),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['enrollment', 'e2e', 'member-portal'],
    created_at: daysAgo(25),
    updated_at: daysAgo(25),
    created_by: 'user-021',
    updated_by: 'user-021',
  },
  {
    id: 'exec-026',
    testCaseId: 'tc-011',
    testSuiteId: 'suite-003',
    testCaseTitle: 'Verify eligibility verification API integration',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 22,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'Newman 6.0',
    evidence: [
      { type: 'report', name: 'eligibility-api-report.html', url: '/evidence/exec-026/report.html', capturedAt: daysAgo(3) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(3),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['enrollment', 'api', 'eligibility'],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'exec-027',
    testCaseId: 'tc-011',
    testSuiteId: 'suite-003',
    testCaseTitle: 'Verify eligibility verification API integration',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 25,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc1',
    browserOrPlatform: 'Newman 6.0',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-021',
    executedAt: daysAgo(12),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['enrollment', 'api', 'eligibility'],
    created_at: daysAgo(12),
    updated_at: daysAgo(12),
    created_by: 'user-021',
    updated_by: 'user-021',
  },

  // Provider Directory Search Suite executions
  {
    id: 'exec-032',
    testCaseId: 'tc-014',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider search by specialty returns accurate results',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'passed',
    duration: 25,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'provider-search-results.png', url: '/evidence/exec-032/screenshot-1.png', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'search', 'functional'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'exec-033',
    testCaseId: 'tc-014',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider search by specialty returns accurate results',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'passed',
    duration: 28,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAgo(8),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'search', 'functional'],
    created_at: daysAgo(8),
    updated_at: daysAgo(8),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'exec-034',
    testCaseId: 'tc-015',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider network tier display accuracy',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'failed',
    duration: 20,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'tier2-badge-missing.png', url: '/evidence/exec-034/screenshot-1.png', capturedAt: daysAgo(1) },
      { type: 'screenshot', name: 'tier2-css-inspector.png', url: '/evidence/exec-034/screenshot-2.png', capturedAt: daysAgo(1) },
    ],
    failureReason: 'Tier 2 badge not displaying correctly. CSS styling issue causing the badge element to have display:none applied by a conflicting media query rule. The badge HTML element is present in the DOM but visually hidden.',
    aiAnalysis: 'CSS specificity conflict detected. The .provider-tier-badge class is overridden by a more specific selector .provider-card .badge-container > span which sets display:none for elements without the .tier-1 class. This was introduced in commit abc123 as part of the provider card redesign. The fix requires updating the CSS selector to include .tier-2 class in the visibility rule.',
    remediation: 'Updated CSS selector to include all tier classes (.tier-1, .tier-2, .tier-3) in the visibility rule. Added visual regression test to prevent future CSS conflicts on tier badges.',
    executedBy: 'user-007',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'network-tier', 'failure', 'css'],
    created_at: daysAgo(1),
    updated_at: daysAgo(0),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'exec-035',
    testCaseId: 'tc-015',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider network tier display accuracy',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'failed',
    duration: 22,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'screenshot', name: 'tier2-badge-missing.png', url: '/evidence/exec-035/screenshot-1.png', capturedAt: daysAgo(10) },
    ],
    failureReason: 'Same Tier 2 badge display issue as exec-034. CSS conflict persists across builds.',
    aiAnalysis: 'Recurring CSS specificity issue. Defect DEF-PRV-002 tracks this problem.',
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAgo(10),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'network-tier', 'failure', 'css'],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'exec-036',
    testCaseId: 'tc-016',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider data synchronization from credentialing system',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'failed',
    duration: 180,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc2',
    browserOrPlatform: 'Manual',
    evidence: [
      { type: 'log', name: 'sync-timeout-error.txt', url: '/evidence/exec-036/error-log.txt', capturedAt: daysAgo(1) },
      { type: 'screenshot', name: 'sync-job-dashboard.png', url: '/evidence/exec-036/screenshot-1.png', capturedAt: daysAgo(1) },
    ],
    failureReason: 'Data synchronization job failed with timeout error after 15 minutes. The credentialing system API returned partial data before the connection was terminated. 450 out of 1200 provider records were synchronized before the failure.',
    aiAnalysis: 'The sync job is attempting to fetch all provider records in a single API call. With 1200+ records, the response payload exceeds 50MB, causing the HTTP client to timeout at the 15-minute threshold. The credentialing system API does not support pagination in the current version. Historical analysis shows this issue started occurring when the provider count exceeded 1000 records approximately 3 weeks ago.',
    remediation: 'Implementing batch synchronization with configurable page size (default 100 records per batch). Adding retry logic with exponential backoff for individual batch failures. Coordinating with credentialing system team to add pagination support to their API.',
    executedBy: 'user-007',
    executedAt: daysAgo(1),
    retryCount: 2,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'data-sync', 'failure', 'timeout'],
    created_at: daysAgo(1),
    updated_at: daysAgo(0),
    created_by: 'user-007',
    updated_by: 'user-011',
  },
  {
    id: 'exec-037',
    testCaseId: 'tc-016',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider data synchronization from credentialing system',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'failed',
    duration: 200,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc1',
    browserOrPlatform: 'Manual',
    evidence: [
      { type: 'log', name: 'sync-timeout-error.txt', url: '/evidence/exec-037/error-log.txt', capturedAt: daysAgo(7) },
    ],
    failureReason: 'Same timeout issue as exec-036. Sync job timed out after processing 380 records.',
    aiAnalysis: 'Consistent with the batch size limitation identified in exec-036. Provider count has grown to 1150 records at time of execution.',
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAgo(7),
    retryCount: 1,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'data-sync', 'failure', 'timeout'],
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'exec-038',
    testCaseId: 'tc-016',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider data synchronization from credentialing system',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'passed',
    duration: 150,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'Manual',
    evidence: [
      { type: 'log', name: 'sync-success-log.txt', url: '/evidence/exec-038/log.txt', capturedAt: daysAgo(21) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAgo(21),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['provider', 'data-sync'],
    created_at: daysAgo(21),
    updated_at: daysAgo(21),
    created_by: 'user-007',
    updated_by: 'user-007',
  },

  // Rx Platform Formulary Suite executions
  {
    id: 'exec-039',
    testCaseId: 'tc-017',
    testSuiteId: 'suite-005',
    testCaseTitle: 'Verify formulary tier management CRUD operations',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    status: 'completed',
    result: 'passed',
    duration: 18,
    environment: 'staging',
    buildNumber: 'build-2024.11-rc1',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'log', name: 'formulary-crud-log.txt', url: '/evidence/exec-039/log.txt', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['pharmacy', 'formulary', 'crud'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-040',
    testCaseId: 'tc-017',
    testSuiteId: 'suite-005',
    testCaseTitle: 'Verify formulary tier management CRUD operations',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    status: 'completed',
    result: 'passed',
    duration: 20,
    environment: 'staging',
    buildNumber: 'build-2024.10-rc3',
    browserOrPlatform: 'Node.js 20',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(14),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['pharmacy', 'formulary', 'crud'],
    created_at: daysAgo(14),
    updated_at: daysAgo(14),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'exec-041',
    testCaseId: 'tc-018',
    testSuiteId: 'suite-005',
    testCaseTitle: 'Verify drug interaction alert triggers correctly',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    status: 'completed',
    result: 'failed',
    duration: 30,
    environment: 'staging',
    buildNumber: 'build-2024.11-rc1',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'log', name: 'drug-interaction-error.txt', url: '/evidence/exec-041/error-log.txt', capturedAt: daysAgo(2) },
      { type: 'screenshot', name: 'false-positive-alert.png', url: '/evidence/exec-041/screenshot-1.png', capturedAt: daysAgo(2) },
    ],
    failureReason: 'False positive drug interaction alert generated for Acetaminophen. The drug interaction database contains an incorrect mapping that flags Acetaminophen as having a severe interaction with the test member\'s existing medications when no such interaction exists.',
    aiAnalysis: 'Database analysis reveals an erroneous entry in the drug_interactions table (row ID 4582) that maps Acetaminophen (NDC: 00904-1982-60) to interaction category "severe" with drug class "anticoagulants". This entry was introduced during the last formulary data import on ' + daysAgo(18) + '. The source data file contained a formatting error that shifted column values. 3 other incorrect mappings were also identified in the same import batch.',
    remediation: 'Correcting the 4 erroneous drug interaction mappings in the database. Implementing data validation rules for formulary imports to detect column misalignment. Adding a reconciliation step that compares imported interactions against the FDA drug interaction reference database.',
    executedBy: 'user-008',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['pharmacy', 'drug-interaction', 'failure', 'clinical-safety'],
    created_at: daysAgo(2),
    updated_at: daysAgo(1),
    created_by: 'user-008',
    updated_by: 'user-012',
  },
  {
    id: 'exec-042',
    testCaseId: 'tc-018',
    testSuiteId: 'suite-005',
    testCaseTitle: 'Verify drug interaction alert triggers correctly',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    status: 'completed',
    result: 'passed',
    duration: 28,
    environment: 'staging',
    buildNumber: 'build-2024.10-rc3',
    browserOrPlatform: 'Node.js 20',
    evidence: [
      { type: 'log', name: 'drug-interaction-log.txt', url: '/evidence/exec-042/log.txt', capturedAt: daysAgo(10) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-008',
    executedAt: daysAgo(10),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['pharmacy', 'drug-interaction', 'clinical-safety'],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    created_by: 'user-008',
    updated_by: 'user-008',
  },

  // EQIP Core Performance Suite executions
  {
    id: 'exec-046',
    testCaseId: 'tc-021',
    testSuiteId: 'suite-006',
    testCaseTitle: 'Verify dashboard load time under normal load',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'passed',
    duration: 600,
    environment: 'performance',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'k6 0.49',
    evidence: [
      { type: 'report', name: 'dashboard-load-test-report.html', url: '/evidence/exec-046/report.html', capturedAt: daysAgo(5) },
      { type: 'metrics', name: 'load-test-metrics.json', url: '/evidence/exec-046/metrics.json', capturedAt: daysAgo(5) },
      { type: 'chart', name: 'response-time-chart.png', url: '/evidence/exec-046/chart.png', capturedAt: daysAgo(5) },
    ],
    failureReason: null,
    aiAnalysis: 'Performance metrics within acceptable thresholds. P95 response time of 1.4 seconds is well below the 2-second target. P99 response time of 1.8 seconds also within limits. No memory leaks detected during the 10-minute test window. CPU utilization peaked at 65%.',
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(5),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['performance', 'dashboard', 'load-test'],
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-047',
    testCaseId: 'tc-021',
    testSuiteId: 'suite-006',
    testCaseTitle: 'Verify dashboard load time under normal load',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'passed',
    duration: 600,
    environment: 'performance',
    buildNumber: 'build-2024.05-rc2',
    browserOrPlatform: 'k6 0.49',
    evidence: [
      { type: 'report', name: 'dashboard-load-test-report.html', url: '/evidence/exec-047/report.html', capturedAt: daysAgo(20) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(20),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['performance', 'dashboard', 'load-test'],
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'exec-048',
    testCaseId: 'tc-022',
    testSuiteId: 'suite-006',
    testCaseTitle: 'Verify API throughput under peak load',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'passed',
    duration: 900,
    environment: 'performance',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'k6 0.49',
    evidence: [
      { type: 'report', name: 'api-throughput-report.html', url: '/evidence/exec-048/report.html', capturedAt: daysAgo(5) },
      { type: 'metrics', name: 'throughput-metrics.json', url: '/evidence/exec-048/metrics.json', capturedAt: daysAgo(5) },
    ],
    failureReason: null,
    aiAnalysis: 'API sustained 650 req/sec throughput under peak load of 200 concurrent users, exceeding the 500 req/sec target by 30%. CPU utilization at 72% and memory at 78% are within acceptable limits. Graceful degradation verified with proper 429 status codes returned when load exceeded 250 concurrent users.',
    remediation: null,
    executedBy: 'user-009',
    executedAt: daysAgo(5),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['performance', 'api', 'throughput', 'peak-load'],
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },

  // Security Scan Suite executions
  {
    id: 'exec-051',
    testCaseId: 'tc-024',
    testSuiteId: 'suite-007',
    testCaseTitle: 'Verify OWASP Top 10 vulnerability scan passes',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'passed',
    duration: 3600,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'OWASP ZAP 2.14',
    evidence: [
      { type: 'report', name: 'owasp-scan-report.html', url: '/evidence/exec-051/report.html', capturedAt: daysAgo(3) },
      { type: 'report', name: 'vulnerability-summary.pdf', url: '/evidence/exec-051/summary.pdf', capturedAt: daysAgo(3) },
    ],
    failureReason: null,
    aiAnalysis: 'Full OWASP Top 10 scan completed. 0 critical vulnerabilities, 0 high severity findings. 2 medium severity findings identified as accepted risks (CORS configuration for internal APIs, missing X-Content-Type-Options header on static assets). 5 low severity informational findings documented.',
    remediation: null,
    executedBy: 'user-010',
    executedAt: daysAgo(3),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['security', 'owasp', 'vulnerability-scan'],
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
  {
    id: 'exec-055',
    testCaseId: 'tc-026',
    testSuiteId: 'suite-007',
    testCaseTitle: 'Verify XSS prevention in user-generated content',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'failed',
    duration: 2400,
    environment: 'staging',
    buildNumber: 'build-2024.06-rc3',
    browserOrPlatform: 'OWASP ZAP 2.14',
    evidence: [
      { type: 'report', name: 'xss-scan-report.html', url: '/evidence/exec-055/report.html', capturedAt: daysAgo(3) },
      { type: 'screenshot', name: 'stored-xss-poc.png', url: '/evidence/exec-055/screenshot-1.png', capturedAt: daysAgo(3) },
      { type: 'log', name: 'xss-payload-log.txt', url: '/evidence/exec-055/payload-log.txt', capturedAt: daysAgo(3) },
    ],
    failureReason: 'Stored XSS vulnerability found in the release notes field. A <script> tag payload was successfully stored and executed when the release notes were rendered on the release detail page. The input sanitization library (DOMPurify) was not applied to the release notes rich text editor output.',
    aiAnalysis: 'Critical stored XSS vulnerability in the release notes field. The rich text editor component (TinyMCE) outputs raw HTML that is stored directly in the database without server-side sanitization. On the display side, the release notes are rendered using dangerouslySetInnerHTML without client-side sanitization. Attack vector: authenticated user with release edit permissions can inject arbitrary JavaScript. Impact: session hijacking, data exfiltration, privilege escalation. CVSS score estimate: 6.1 (Medium). Recommend immediate remediation.',
    remediation: 'Applied DOMPurify sanitization on both server-side storage and client-side rendering of release notes. Replaced dangerouslySetInnerHTML with a sanitized rendering component. Added Content-Security-Policy header to restrict inline script execution. Added automated XSS regression tests for all rich text fields.',
    executedBy: 'user-010',
    executedAt: daysAgo(3),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['security', 'xss', 'vulnerability', 'critical'],
    created_at: daysAgo(3),
    updated_at: daysAgo(1),
    created_by: 'user-010',
    updated_by: 'user-001',
  },
  {
    id: 'exec-056',
    testCaseId: 'tc-026',
    testSuiteId: 'suite-007',
    testCaseTitle: 'Verify XSS prevention in user-generated content',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'completed',
    result: 'passed',
    duration: 2300,
    environment: 'staging',
    buildNumber: 'build-2024.05-rc2',
    browserOrPlatform: 'OWASP ZAP 2.14',
    evidence: [
      { type: 'report', name: 'xss-scan-report.html', url: '/evidence/exec-056/report.html', capturedAt: daysAgo(30) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-010',
    executedAt: daysAgo(30),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['security', 'xss', 'vulnerability-scan'],
    created_at: daysAgo(30),
    updated_at: daysAgo(30),
    created_by: 'user-010',
    updated_by: 'user-010',
  },

  // Accessibility Compliance Suite executions
  {
    id: 'exec-057',
    testCaseId: 'tc-027',
    testSuiteId: 'suite-008',
    testCaseTitle: 'Verify keyboard navigation across all interactive elements',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 40,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'report', name: 'keyboard-nav-report.html', url: '/evidence/exec-057/report.html', capturedAt: daysAgo(4) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(4),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['accessibility', 'keyboard', 'wcag'],
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'exec-059',
    testCaseId: 'tc-028',
    testSuiteId: 'suite-008',
    testCaseTitle: 'Verify screen reader compatibility with ARIA labels',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'passed',
    duration: 15,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'axe-core 4.8',
    evidence: [
      { type: 'report', name: 'aria-audit-report.html', url: '/evidence/exec-059/report.html', capturedAt: daysAgo(4) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(4),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['accessibility', 'aria', 'screen-reader'],
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'exec-060',
    testCaseId: 'tc-028',
    testSuiteId: 'suite-008',
    testCaseTitle: 'Verify screen reader compatibility with ARIA labels',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'completed',
    result: 'failed',
    duration: 18,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc3',
    browserOrPlatform: 'axe-core 4.8',
    evidence: [
      { type: 'report', name: 'aria-violations-report.html', url: '/evidence/exec-060/report.html', capturedAt: daysAgo(20) },
    ],
    failureReason: '3 form fields in the enrollment wizard were missing associated ARIA labels. The date of birth field, plan selection dropdown, and dependent relationship field had no aria-label or aria-labelledby attributes.',
    aiAnalysis: 'The missing ARIA labels were introduced when the enrollment form was refactored to use a new form component library. The new library does not automatically associate labels with form controls. This affects screen reader users who cannot identify the purpose of these 3 fields. WCAG 2.1 AA criterion 1.3.1 (Info and Relationships) and 4.1.2 (Name, Role, Value) are violated.',
    remediation: 'Added explicit aria-label attributes to all 3 affected form fields. Updated the form component library wrapper to automatically generate aria-labelledby associations from visible label elements. Added axe-core automated checks to the CI pipeline to catch future ARIA violations.',
    executedBy: 'user-006',
    executedAt: daysAgo(20),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['accessibility', 'aria', 'failure', 'wcag'],
    created_at: daysAgo(20),
    updated_at: daysAgo(18),
    created_by: 'user-006',
    updated_by: 'user-006',
  },

  // Underwriting API Collection Suite executions
  {
    id: 'exec-062',
    testCaseId: 'tc-030',
    testSuiteId: 'suite-009',
    testCaseTitle: 'Verify risk scoring API returns correct score for standard applicant',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    status: 'completed',
    result: 'passed',
    duration: 15,
    environment: 'staging',
    buildNumber: 'build-2024.13-rc2',
    browserOrPlatform: 'Newman 6.0',
    evidence: [
      { type: 'report', name: 'risk-scoring-api-report.html', url: '/evidence/exec-062/report.html', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['underwriting', 'api', 'risk-scoring'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-063',
    testCaseId: 'tc-030',
    testSuiteId: 'suite-009',
    testCaseTitle: 'Verify risk scoring API returns correct score for standard applicant',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    status: 'completed',
    result: 'passed',
    duration: 18,
    environment: 'staging',
    buildNumber: 'build-2024.13-rc1',
    browserOrPlatform: 'Newman 6.0',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(10),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['underwriting', 'api', 'risk-scoring'],
    created_at: daysAgo(10),
    updated_at: daysAgo(10),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-064',
    testCaseId: 'tc-031',
    testSuiteId: 'suite-009',
    testCaseTitle: 'Verify automated underwriting decision rules engine',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    status: 'completed',
    result: 'passed',
    duration: 22,
    environment: 'staging',
    buildNumber: 'build-2024.13-rc2',
    browserOrPlatform: 'Newman 6.0',
    evidence: [
      { type: 'report', name: 'decision-rules-report.html', url: '/evidence/exec-064/report.html', capturedAt: daysAgo(2) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(2),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['underwriting', 'decision-rules', 'api'],
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },

  // Compliance Dashboard Smoke Suite executions
  {
    id: 'exec-068',
    testCaseId: 'tc-033',
    testSuiteId: 'suite-010',
    testCaseTitle: 'Verify compliance dashboard loads with real-time monitoring widgets',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'completed',
    result: 'passed',
    duration: 12,
    environment: 'staging',
    buildNumber: 'build-2024.14-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'compliance-dashboard.png', url: '/evidence/exec-068/screenshot-1.png', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['compliance', 'dashboard', 'smoke'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-069',
    testCaseId: 'tc-033',
    testSuiteId: 'suite-010',
    testCaseTitle: 'Verify compliance dashboard loads with real-time monitoring widgets',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'completed',
    result: 'passed',
    duration: 14,
    environment: 'staging',
    buildNumber: 'build-2024.14-rc2',
    browserOrPlatform: 'Chrome 124',
    evidence: [],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(7),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['compliance', 'dashboard', 'smoke'],
    created_at: daysAgo(7),
    updated_at: daysAgo(7),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-070',
    testCaseId: 'tc-033',
    testSuiteId: 'suite-010',
    testCaseTitle: 'Verify compliance dashboard loads with real-time monitoring widgets',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'completed',
    result: 'passed',
    duration: 13,
    environment: 'uat',
    buildNumber: 'build-2024.14-rc1',
    browserOrPlatform: 'Chrome 124',
    evidence: [
      { type: 'screenshot', name: 'compliance-dashboard-uat.png', url: '/evidence/exec-070/screenshot-1.png', capturedAt: daysAgo(14) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(14),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['compliance', 'dashboard', 'smoke', 'uat'],
    created_at: daysAgo(14),
    updated_at: daysAgo(14),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-071',
    testCaseId: 'tc-034',
    testSuiteId: 'suite-010',
    testCaseTitle: 'Verify compliance alert notification system',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'completed',
    result: 'passed',
    duration: 25,
    environment: 'staging',
    buildNumber: 'build-2024.14-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'screenshot', name: 'compliance-alert.png', url: '/evidence/exec-071/screenshot-1.png', capturedAt: daysAgo(1) },
      { type: 'log', name: 'notification-delivery-log.txt', url: '/evidence/exec-071/log.txt', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['compliance', 'alerts', 'notifications'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'exec-073',
    testCaseId: 'tc-035',
    testSuiteId: 'suite-010',
    testCaseTitle: 'Verify regulatory report generation and export',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'completed',
    result: 'passed',
    duration: 35,
    environment: 'staging',
    buildNumber: 'build-2024.14-rc3',
    browserOrPlatform: 'Chrome 125',
    evidence: [
      { type: 'report', name: 'generated-compliance-report.pdf', url: '/evidence/exec-073/report.pdf', capturedAt: daysAgo(1) },
      { type: 'report', name: 'generated-compliance-report.csv', url: '/evidence/exec-073/report.csv', capturedAt: daysAgo(1) },
    ],
    failureReason: null,
    aiAnalysis: null,
    remediation: null,
    executedBy: 'user-005',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['compliance', 'reporting', 'export'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },

  // Additional retry execution
  {
    id: 'exec-080',
    testCaseId: 'tc-016',
    testSuiteId: 'suite-004',
    testCaseTitle: 'Verify provider data synchronization from credentialing system',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'completed',
    result: 'failed',
    duration: 195,
    environment: 'staging',
    buildNumber: 'build-2024.09-rc2',
    browserOrPlatform: 'Manual',
    evidence: [
      { type: 'log', name: 'retry-sync-error.txt', url: '/evidence/exec-080/error-log.txt', capturedAt: daysAgo(1) },
    ],
    failureReason: 'Retry of exec-036. Same timeout issue persists. Sync job timed out after processing 460 records.',
    aiAnalysis: 'Retry confirms the timeout issue is deterministic and not caused by transient infrastructure problems. The batch synchronization fix is required before this test can pass.',
    remediation: null,
    executedBy: 'user-007',
    executedAt: daysAndHoursAgo(1, 2),
    retryCount: 0,
    isRetry: true,
    parentExecutionId: 'exec-036',
    tags: ['provider', 'data-sync', 'failure', 'retry'],
    created_at: daysAndHoursAgo(1, 2),
    updated_at: daysAndHoursAgo(1, 2),
    created_by: 'user-007',
    updated_by: 'user-007',
  },

  // Blocked execution
  {
    id: 'exec-081',
    testCaseId: 'tc-009',
    testSuiteId: 'suite-002',
    testCaseTitle: 'Verify payment retry mechanism for failed transactions',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'blocked',
    result: 'blocked',
    duration: 0,
    environment: 'staging',
    buildNumber: 'build-2024.07-rc2',
    browserOrPlatform: 'Chrome 125',
    evidence: [],
    failureReason: 'Blocked by environment issue. Payment processor sandbox is down for scheduled maintenance. Unable to simulate transient payment failures required for retry mechanism testing.',
    aiAnalysis: 'Execution blocked due to external dependency. Payment processor sandbox maintenance window: ' + daysAgo(1) + ' to ' + daysAgo(0) + '. Recommend rescheduling execution after maintenance window closes.',
    remediation: null,
    executedBy: 'user-020',
    executedAt: daysAgo(1),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['payments', 'retry', 'blocked', 'environment'],
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-020',
    updated_by: 'user-020',
  },

  // Skipped execution
  {
    id: 'exec-082',
    testCaseId: 'tc-029',
    testSuiteId: 'suite-008',
    testCaseTitle: 'Verify color contrast compliance for all text elements',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'skipped',
    result: 'skipped',
    duration: 0,
    environment: 'staging',
    buildNumber: 'build-2024.08-rc2',
    browserOrPlatform: 'Manual',
    evidence: [],
    failureReason: 'Skipped due to no UI changes in this build. Color contrast was verified in the previous build (build-2024.08-rc1) and no CSS or theme changes were included in rc2.',
    aiAnalysis: 'Skip is justified. Diff analysis of build-2024.08-rc1 to build-2024.08-rc2 shows no changes to CSS files, theme configuration, or color-related components. Re-execution recommended when UI styling changes are introduced.',
    remediation: null,
    executedBy: 'user-006',
    executedAt: daysAgo(4),
    retryCount: 0,
    isRetry: false,
    parentExecutionId: null,
    tags: ['accessibility', 'color-contrast', 'skipped'],
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
];

export default testExecutions;

/**
 * Get all mock test executions.
 * @returns {Array<object>} Array of test execution objects.
 */
export function getAllTestExecutions() {
  return [...testExecutions];
}

/**
 * Find a test execution by ID.
 * @param {string} id - The execution ID to find.
 * @returns {object|null} The execution object, or null if not found.
 */
export function getTestExecutionById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return testExecutions.find((exec) => exec.id === id) || null;
}

/**
 * Get all executions for a specific test case.
 * @param {string} testCaseId - The test case ID to filter by.
 * @returns {Array<object>} Array of executions for the specified test case.
 */
export function getExecutionsByTestCaseId(testCaseId) {
  if (!testCaseId || typeof testCaseId !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.testCaseId === testCaseId);
}

/**
 * Get all executions for a specific test suite.
 * @param {string} testSuiteId - The test suite ID to filter by.
 * @returns {Array<object>} Array of executions for the specified test suite.
 */
export function getExecutionsByTestSuiteId(testSuiteId) {
  if (!testSuiteId || typeof testSuiteId !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.testSuiteId === testSuiteId);
}

/**
 * Get all executions for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of executions for the specified application.
 */
export function getExecutionsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.application === application);
}

/**
 * Get all executions for a specific segment.
 * @param {string} segment - The segment to filter by.
 * @returns {Array<object>} Array of executions for the specified segment.
 */
export function getExecutionsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.segment === segment);
}

/**
 * Get all executions with a specific result.
 * @param {string} result - The result to filter by (e.g., 'passed', 'failed', 'blocked', 'skipped').
 * @returns {Array<object>} Array of executions with the specified result.
 */
export function getExecutionsByResult(result) {
  if (!result || typeof result !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.result === result);
}

/**
 * Get all executions with a specific status.
 * @param {string} status - The status to filter by (e.g., 'completed', 'in_progress', 'blocked', 'skipped').
 * @returns {Array<object>} Array of executions with the specified status.
 */
export function getExecutionsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.status === status);
}

/**
 * Get all executions for a specific environment.
 * @param {string} environment - The environment to filter by (e.g., 'staging', 'uat', 'performance').
 * @returns {Array<object>} Array of executions for the specified environment.
 */
export function getExecutionsByEnvironment(environment) {
  if (!environment || typeof environment !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.environment === environment);
}

/**
 * Get all executions performed by a specific user.
 * @param {string} userId - The user ID to filter by.
 * @returns {Array<object>} Array of executions performed by the specified user.
 */
export function getExecutionsByUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return testExecutions.filter((exec) => exec.executedBy === userId);
}

/**
 * Get all failed executions.
 * @returns {Array<object>} Array of failed execution objects.
 */
export function getFailedExecutions() {
  return testExecutions.filter((exec) => exec.result === 'failed');
}

/**
 * Get all executions that have AI analysis.
 * @returns {Array<object>} Array of executions with AI analysis.
 */
export function getExecutionsWithAIAnalysis() {
  return testExecutions.filter(
    (exec) => exec.aiAnalysis !== null && exec.aiAnalysis !== '',
  );
}

/**
 * Get all executions that have remediation information.
 * @returns {Array<object>} Array of executions with remediation.
 */
export function getExecutionsWithRemediation() {
  return testExecutions.filter(
    (exec) => exec.remediation !== null && exec.remediation !== '',
  );
}

/**
 * Get all retry executions.
 * @returns {Array<object>} Array of retry execution objects.
 */
export function getRetryExecutions() {
  return testExecutions.filter((exec) => exec.isRetry === true);
}

/**
 * Get distinct applications from the execution data.
 * @returns {string[]} Array of unique application strings.
 */
export function getDistinctApplications() {
  const apps = new Set();
  for (let i = 0; i < testExecutions.length; i++) {
    if (testExecutions[i].application) {
      apps.add(testExecutions[i].application);
    }
  }
  return [...apps].sort();
}

/**
 * Get distinct segments from the execution data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < testExecutions.length; i++) {
    if (testExecutions[i].segment) {
      segments.add(testExecutions[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct environments from the execution data.
 * @returns {string[]} Array of unique environment strings.
 */
export function getDistinctEnvironments() {
  const envs = new Set();
  for (let i = 0; i < testExecutions.length; i++) {
    if (testExecutions[i].environment) {
      envs.add(testExecutions[i].environment);
    }
  }
  return [...envs].sort();
}

/**
 * Get a count of executions grouped by result.
 * @returns {object} Object with result keys and count values.
 */
export function getExecutionCountByResult() {
  const counts = {};
  for (let i = 0; i < testExecutions.length; i++) {
    const result = testExecutions[i].result || 'unknown';
    counts[result] = (counts[result] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of executions grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getExecutionCountByStatus() {
  const counts = {};
  for (let i = 0; i < testExecutions.length; i++) {
    const status = testExecutions[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of executions grouped by application.
 * @returns {object} Object with application keys and count values.
 */
export function getExecutionCountByApplication() {
  const counts = {};
  for (let i = 0; i < testExecutions.length; i++) {
    const app = testExecutions[i].application;
    counts[app] = (counts[app] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of executions grouped by environment.
 * @returns {object} Object with environment keys and count values.
 */
export function getExecutionCountByEnvironment() {
  const counts = {};
  for (let i = 0; i < testExecutions.length; i++) {
    const env = testExecutions[i].environment;
    counts[env] = (counts[env] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the overall pass rate across all completed executions.
 * @returns {number} The pass rate percentage, or 0 if no completed executions exist.
 */
export function getOverallPassRate() {
  const completed = testExecutions.filter((exec) => exec.status === 'completed');
  if (completed.length === 0) {
    return 0;
  }
  const passed = completed.filter((exec) => exec.result === 'passed').length;
  return Math.round((passed / completed.length) * 10000) / 100;
}

/**
 * Calculate the overall failure rate across all completed executions.
 * @returns {number} The failure rate percentage, or 0 if no completed executions exist.
 */
export function getOverallFailureRate() {
  const completed = testExecutions.filter((exec) => exec.status === 'completed');
  if (completed.length === 0) {
    return 0;
  }
  const failed = completed.filter((exec) => exec.result === 'failed').length;
  return Math.round((failed / completed.length) * 10000) / 100;
}

/**
 * Calculate the average execution duration across all completed executions.
 * @returns {number} The average duration in seconds, or 0 if no completed executions exist.
 */
export function getAverageExecutionDuration() {
  const completed = testExecutions.filter(
    (exec) => exec.status === 'completed' && typeof exec.duration === 'number' && exec.duration > 0,
  );
  if (completed.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < completed.length; i++) {
    total += completed[i].duration;
  }
  return Math.round((total / completed.length) * 100) / 100;
}

/**
 * Get the most recent executions, sorted by executedAt descending.
 * @param {number} [limit=10] - Maximum number of executions to return.
 * @returns {Array<object>} Array of recent execution objects.
 */
export function getRecentExecutions(limit = 10) {
  const sorted = [...testExecutions].sort((a, b) => {
    const dateA = new Date(a.executedAt).getTime();
    const dateB = new Date(b.executedAt).getTime();
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
 * Get executions sorted by duration descending (longest first).
 * @param {number} [limit=10] - Maximum number of executions to return.
 * @returns {Array<object>} Array of execution objects sorted by duration.
 */
export function getLongestExecutions(limit = 10) {
  const sorted = [...testExecutions].sort((a, b) => (b.duration || 0) - (a.duration || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get the total count of executions with evidence attachments.
 * @returns {number} Count of executions with at least one evidence item.
 */
export function getExecutionsWithEvidenceCount() {
  return testExecutions.filter(
    (exec) => Array.isArray(exec.evidence) && exec.evidence.length > 0,
  ).length;
}

/**
 * Search executions by test case title (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching execution objects.
 */
export function searchExecutionsByTitle(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return testExecutions.filter(
    (exec) =>
      exec.testCaseTitle &&
      exec.testCaseTitle.toLowerCase().includes(queryLower),
  );
}