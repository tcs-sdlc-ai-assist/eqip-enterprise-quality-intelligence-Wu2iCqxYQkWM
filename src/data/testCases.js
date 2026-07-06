import { v4 as uuidv4 } from 'uuid';

/**
 * @module testCases
 * Mock test case and test suite data seed for eQIP Quality Intelligence.
 * Covers all 13 PRD-specified test asset types with comprehensive fields including
 * id, title, type, priority, status, steps, expectedResults, automationStatus,
 * coverage, executionHistory, approvalStatus, version, and audit fields.
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
 * Mock test suite data array.
 * Each suite groups related test cases by functional area.
 * @type {Array<object>}
 */
const testSuites = [
  {
    id: 'suite-001',
    name: 'Claims Processing Regression Suite',
    description: 'Full regression test suite for claims processing workflows including intake, adjudication, and settlement.',
    type: 'Regression Pack',
    application: 'Claims Processing',
    segment: 'Claims',
    status: 'active',
    priority: 'p1',
    testCaseIds: ['tc-001', 'tc-002', 'tc-003', 'tc-004', 'tc-005'],
    totalCases: 5,
    automatedCount: 4,
    manualCount: 1,
    passRate: 96.0,
    lastExecuted: daysAgo(2),
    scheduledRun: daysAgo(-7),
    owner: 'user-005',
    tags: ['regression', 'claims', 'critical-path'],
    version: 3,
    created_at: daysAgo(180),
    updated_at: daysAgo(2),
    created_by: 'user-003',
    updated_by: 'user-005',
  },
  {
    id: 'suite-002',
    name: 'Payment Gateway Integration Suite',
    description: 'Integration test suite for payment processing, multi-currency support, and reconciliation.',
    type: 'Test Suite',
    application: 'Payment Gateway',
    segment: 'Billing',
    status: 'active',
    priority: 'p1',
    testCaseIds: ['tc-006', 'tc-007', 'tc-008', 'tc-009'],
    totalCases: 4,
    automatedCount: 3,
    manualCount: 1,
    passRate: 82.5,
    lastExecuted: daysAgo(1),
    scheduledRun: daysAgo(-3),
    owner: 'user-009',
    tags: ['integration', 'payments', 'billing'],
    version: 5,
    created_at: daysAgo(200),
    updated_at: daysAgo(1),
    created_by: 'user-004',
    updated_by: 'user-009',
  },
  {
    id: 'suite-003',
    name: 'Member Portal Enrollment Suite',
    description: 'End-to-end test suite for member enrollment flows, eligibility verification, and profile management.',
    type: 'Test Suite',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'active',
    priority: 'p2',
    testCaseIds: ['tc-010', 'tc-011', 'tc-012', 'tc-013'],
    totalCases: 4,
    automatedCount: 3,
    manualCount: 1,
    passRate: 94.0,
    lastExecuted: daysAgo(3),
    scheduledRun: daysAgo(-5),
    owner: 'user-006',
    tags: ['enrollment', 'member-portal', 'e2e'],
    version: 2,
    created_at: daysAgo(150),
    updated_at: daysAgo(3),
    created_by: 'user-003',
    updated_by: 'user-006',
  },
  {
    id: 'suite-004',
    name: 'Provider Directory Search Suite',
    description: 'Functional test suite for provider search, filtering, and directory display features.',
    type: 'Test Suite',
    application: 'Provider Directory',
    segment: 'Provider',
    status: 'active',
    priority: 'p2',
    testCaseIds: ['tc-014', 'tc-015', 'tc-016'],
    totalCases: 3,
    automatedCount: 1,
    manualCount: 2,
    passRate: 66.7,
    lastExecuted: daysAgo(1),
    scheduledRun: daysAgo(-2),
    owner: 'user-007',
    tags: ['provider', 'search', 'functional'],
    version: 4,
    created_at: daysAgo(160),
    updated_at: daysAgo(1),
    created_by: 'user-004',
    updated_by: 'user-007',
  },
  {
    id: 'suite-005',
    name: 'Rx Platform Formulary Suite',
    description: 'Test suite for formulary management, drug interaction alerts, and prior authorization workflows.',
    type: 'Test Suite',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    status: 'active',
    priority: 'p1',
    testCaseIds: ['tc-017', 'tc-018', 'tc-019', 'tc-020'],
    totalCases: 4,
    automatedCount: 3,
    manualCount: 1,
    passRate: 90.0,
    lastExecuted: daysAgo(2),
    scheduledRun: daysAgo(-4),
    owner: 'user-008',
    tags: ['pharmacy', 'formulary', 'clinical-safety'],
    version: 2,
    created_at: daysAgo(140),
    updated_at: daysAgo(2),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'suite-006',
    name: 'EQIP Core Performance Suite',
    description: 'Performance and load testing suite for the core quality intelligence platform dashboards and APIs.',
    type: 'Performance Script',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'active',
    priority: 'p2',
    testCaseIds: ['tc-021', 'tc-022', 'tc-023'],
    totalCases: 3,
    automatedCount: 3,
    manualCount: 0,
    passRate: 100.0,
    lastExecuted: daysAgo(5),
    scheduledRun: daysAgo(-14),
    owner: 'user-009',
    tags: ['performance', 'load-test', 'core'],
    version: 3,
    created_at: daysAgo(120),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'suite-007',
    name: 'Security Scan Configuration Suite',
    description: 'Security scanning configurations and vulnerability test cases across enterprise applications.',
    type: 'Security Scan Config',
    application: 'EQIP Core',
    segment: 'Enterprise',
    status: 'active',
    priority: 'p1',
    testCaseIds: ['tc-024', 'tc-025', 'tc-026'],
    totalCases: 3,
    automatedCount: 3,
    manualCount: 0,
    passRate: 88.0,
    lastExecuted: daysAgo(3),
    scheduledRun: daysAgo(-7),
    owner: 'user-010',
    tags: ['security', 'vulnerability', 'scan'],
    version: 6,
    created_at: daysAgo(200),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
  {
    id: 'suite-008',
    name: 'Accessibility Compliance Suite',
    description: 'WCAG 2.1 AA accessibility checklist and automated accessibility test cases for member-facing applications.',
    type: 'Accessibility Checklist',
    application: 'Member Portal',
    segment: 'Enrollment',
    status: 'active',
    priority: 'p2',
    testCaseIds: ['tc-027', 'tc-028', 'tc-029'],
    totalCases: 3,
    automatedCount: 2,
    manualCount: 1,
    passRate: 85.0,
    lastExecuted: daysAgo(4),
    scheduledRun: daysAgo(-10),
    owner: 'user-006',
    tags: ['accessibility', 'wcag', 'compliance'],
    version: 2,
    created_at: daysAgo(90),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'suite-009',
    name: 'Underwriting API Collection Suite',
    description: 'API test collection for underwriting engine endpoints including risk scoring and decision rules.',
    type: 'API Collection',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    status: 'active',
    priority: 'p2',
    testCaseIds: ['tc-030', 'tc-031', 'tc-032'],
    totalCases: 3,
    automatedCount: 3,
    manualCount: 0,
    passRate: 93.0,
    lastExecuted: daysAgo(2),
    scheduledRun: daysAgo(-5),
    owner: 'user-005',
    tags: ['api', 'underwriting', 'risk-scoring'],
    version: 3,
    created_at: daysAgo(110),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'suite-010',
    name: 'Compliance Dashboard Smoke Suite',
    description: 'Smoke test suite for compliance dashboard core functionality and real-time monitoring widgets.',
    type: 'Test Suite',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    status: 'active',
    priority: 'p1',
    testCaseIds: ['tc-033', 'tc-034', 'tc-035'],
    totalCases: 3,
    automatedCount: 3,
    manualCount: 0,
    passRate: 100.0,
    lastExecuted: daysAgo(1),
    scheduledRun: daysAgo(-3),
    owner: 'user-005',
    tags: ['smoke', 'compliance', 'dashboard'],
    version: 4,
    created_at: daysAgo(100),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'user-005',
  },
];

/**
 * Mock test case data array.
 * Each test case includes all PRD-specified fields: id, title, type, priority, status,
 * steps, expectedResults, automationStatus, coverage, executionHistory, approvalStatus,
 * version, and audit fields.
 * @type {Array<object>}
 */
const testCases = [
  // Claims Processing Regression Suite (suite-001)
  {
    id: 'tc-001',
    title: 'Verify claims intake form submission with valid data',
    description: 'Validate that a new claim can be submitted through the intake form with all required fields populated correctly.',
    type: 'Test Case',
    assetType: 'Regression Pack',
    suiteId: 'suite-001',
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Selenium',
    automationScriptPath: '/tests/claims/intake/tc-001-valid-submission.spec.js',
    preconditions: ['User is authenticated as claims processor', 'Claims intake module is accessible', 'Test member data is available'],
    steps: [
      { stepNumber: 1, action: 'Navigate to Claims Intake page', expectedResult: 'Claims intake form is displayed', status: 'passed' },
      { stepNumber: 2, action: 'Enter valid member ID in the Member ID field', expectedResult: 'Member information is auto-populated', status: 'passed' },
      { stepNumber: 3, action: 'Select claim type as "Medical"', expectedResult: 'Medical claim fields are displayed', status: 'passed' },
      { stepNumber: 4, action: 'Enter service date, provider, and diagnosis codes', expectedResult: 'All fields accept valid input', status: 'passed' },
      { stepNumber: 5, action: 'Click Submit Claim button', expectedResult: 'Claim is submitted successfully with confirmation number', status: 'passed' },
    ],
    expectedResults: 'Claim is created in the system with status "Pending Adjudication" and a unique claim ID is generated.',
    actualResults: 'Claim created successfully. Claim ID CLM-2024-00892 generated. Status set to Pending Adjudication.',
    testData: { memberId: 'MBR-TEST-001', claimType: 'Medical', providerNPI: '1234567890' },
    coverage: {
      requirements: ['REQ-CLM-001', 'REQ-CLM-002'],
      features: ['feat-012'],
      stories: ['story-019'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-001', date: daysAgo(2), status: 'passed', duration: 45, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-002', date: daysAgo(9), status: 'passed', duration: 48, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-003', date: daysAgo(16), status: 'passed', duration: 42, environment: 'uat', executedBy: 'user-005' },
      { executionId: 'exec-004', date: daysAgo(30), status: 'failed', duration: 52, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(60),
    tags: ['claims', 'intake', 'regression', 'critical-path'],
    estimatedDuration: 50,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(180),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-002',
    title: 'Verify claims adjudication auto-processing for clean claims',
    description: 'Validate that clean claims meeting all auto-adjudication criteria are processed automatically without manual intervention.',
    type: 'Test Case',
    assetType: 'Automation Script',
    suiteId: 'suite-001',
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Selenium',
    automationScriptPath: '/tests/claims/adjudication/tc-002-auto-adjudication.spec.js',
    preconditions: ['Clean claim exists in Pending Adjudication status', 'Auto-adjudication rules are configured', 'Provider is in-network'],
    steps: [
      { stepNumber: 1, action: 'Submit a clean claim with valid member, provider, and diagnosis', expectedResult: 'Claim enters adjudication queue', status: 'passed' },
      { stepNumber: 2, action: 'Wait for auto-adjudication engine to process', expectedResult: 'Claim is processed within 30 seconds', status: 'passed' },
      { stepNumber: 3, action: 'Verify claim status changes to "Adjudicated"', expectedResult: 'Status is updated to Adjudicated', status: 'passed' },
      { stepNumber: 4, action: 'Verify payment amount is calculated correctly', expectedResult: 'Payment matches contracted rate minus copay', status: 'passed' },
    ],
    expectedResults: 'Clean claim is auto-adjudicated with correct payment calculation and status update.',
    actualResults: 'Claim auto-adjudicated in 12 seconds. Payment of $245.00 calculated correctly.',
    testData: { claimId: 'CLM-TEST-ADJ-001', contractedRate: 300, copay: 55 },
    coverage: {
      requirements: ['REQ-CLM-003', 'REQ-CLM-004', 'REQ-CLM-005'],
      features: ['feat-012'],
      stories: ['story-019'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-005', date: daysAgo(2), status: 'passed', duration: 38, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-006', date: daysAgo(9), status: 'passed', duration: 41, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-007', date: daysAgo(23), status: 'passed', duration: 36, environment: 'uat', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(55),
    tags: ['claims', 'adjudication', 'auto-processing', 'regression'],
    estimatedDuration: 40,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(175),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'tc-003',
    title: 'Verify batch claims processing handles large volumes',
    description: 'Validate that the batch claims processing module can handle 10,000+ claims in a single batch run without errors.',
    type: 'Test Case',
    assetType: 'Performance Script',
    suiteId: 'suite-001',
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'JMeter',
    automationScriptPath: '/tests/claims/batch/tc-003-batch-volume.jmx',
    preconditions: ['Batch processing module is deployed', 'Test data set of 10,000 claims is prepared', 'Database has sufficient capacity'],
    steps: [
      { stepNumber: 1, action: 'Upload batch file with 10,000 claims', expectedResult: 'Batch file is accepted and queued', status: 'passed' },
      { stepNumber: 2, action: 'Trigger batch processing job', expectedResult: 'Job starts processing within 1 minute', status: 'passed' },
      { stepNumber: 3, action: 'Monitor processing progress', expectedResult: 'All 10,000 claims processed within 30 minutes', status: 'passed' },
      { stepNumber: 4, action: 'Verify batch completion report', expectedResult: 'Report shows 100% processing rate with error details', status: 'passed' },
    ],
    expectedResults: 'All 10,000 claims are processed within the SLA window with less than 0.1% error rate.',
    actualResults: 'Batch completed in 22 minutes. 9,997 claims processed successfully. 3 claims flagged for manual review (0.03% error rate).',
    testData: { batchSize: 10000, slaMinutes: 30, errorThreshold: 0.1 },
    coverage: {
      requirements: ['REQ-CLM-010', 'REQ-CLM-011'],
      features: ['feat-013'],
      stories: ['story-020'],
      coveragePercentage: 90,
    },
    executionHistory: [
      { executionId: 'exec-008', date: daysAgo(5), status: 'passed', duration: 1320, environment: 'staging', executedBy: 'user-009' },
      { executionId: 'exec-009', date: daysAgo(20), status: 'passed', duration: 1450, environment: 'staging', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(50),
    tags: ['claims', 'batch', 'performance', 'volume'],
    estimatedDuration: 1800,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(160),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-004',
    title: 'Verify claims duplication detection prevents duplicate submissions',
    description: 'Validate that the claims duplication detection engine identifies and flags duplicate claim submissions.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-001',
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Selenium',
    automationScriptPath: '/tests/claims/dedup/tc-004-duplicate-detection.spec.js',
    preconditions: ['Original claim exists in the system', 'Duplication detection rules are active'],
    steps: [
      { stepNumber: 1, action: 'Submit a claim with identical member, provider, date, and diagnosis as existing claim', expectedResult: 'System detects potential duplicate', status: 'passed' },
      { stepNumber: 2, action: 'Verify duplicate warning is displayed', expectedResult: 'Warning message shows matching claim ID', status: 'passed' },
      { stepNumber: 3, action: 'Attempt to force submit the duplicate', expectedResult: 'Claim is flagged for manual review', status: 'passed' },
    ],
    expectedResults: 'Duplicate claim is detected and flagged for manual review with reference to the original claim.',
    actualResults: 'Duplicate detected. Original claim CLM-2024-00890 referenced. New claim flagged for review.',
    testData: { originalClaimId: 'CLM-TEST-DUP-001', duplicateFields: ['memberId', 'providerId', 'serviceDate', 'diagnosisCode'] },
    coverage: {
      requirements: ['REQ-CLM-015'],
      features: ['feat-015'],
      stories: ['story-024'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-010', date: daysAgo(2), status: 'passed', duration: 28, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-011', date: daysAgo(12), status: 'passed', duration: 30, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(45),
    tags: ['claims', 'deduplication', 'data-quality'],
    estimatedDuration: 35,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(150),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-005',
    title: 'Verify claims status notification is sent to member',
    description: 'Validate that members receive notification when their claim status changes through the notification system.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-001',
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p3',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Claim exists with member contact information', 'Notification service is running', 'Member has opted in to notifications'],
    steps: [
      { stepNumber: 1, action: 'Update claim status from "Pending" to "Adjudicated"', expectedResult: 'Status change triggers notification event', status: 'passed' },
      { stepNumber: 2, action: 'Check notification queue', expectedResult: 'Notification is queued for the member', status: 'passed' },
      { stepNumber: 3, action: 'Verify notification content', expectedResult: 'Notification contains claim ID, new status, and next steps', status: 'passed' },
      { stepNumber: 4, action: 'Verify notification delivery', expectedResult: 'Notification is delivered via configured channel (email/SMS)', status: 'passed' },
    ],
    expectedResults: 'Member receives a notification with correct claim status update information.',
    actualResults: 'Email notification sent to member. Content verified with correct claim ID and status.',
    testData: { claimId: 'CLM-TEST-NOTIF-001', notificationChannel: 'email' },
    coverage: {
      requirements: ['REQ-CLM-020'],
      features: ['feat-014'],
      stories: ['story-021'],
      coveragePercentage: 85,
    },
    executionHistory: [
      { executionId: 'exec-012', date: daysAgo(3), status: 'passed', duration: 15, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-013', date: daysAgo(15), status: 'passed', duration: 18, environment: 'uat', executedBy: 'user-006' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(40),
    tags: ['claims', 'notifications', 'member-communication'],
    estimatedDuration: 20,
    environment: 'staging',
    version: 1,
    created_at: daysAgo(140),
    updated_at: daysAgo(3),
    created_by: 'user-005',
    updated_by: 'user-005',
  },

  // Payment Gateway Integration Suite (suite-002)
  {
    id: 'tc-006',
    title: 'Verify payment processing with valid credit card',
    description: 'Validate end-to-end payment processing flow with a valid credit card including authorization, capture, and settlement.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-002',
    application: 'Payment Gateway',
    segment: 'Billing',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Cypress',
    automationScriptPath: '/tests/payments/tc-006-valid-payment.cy.js',
    preconditions: ['Payment gateway sandbox is configured', 'Test credit card numbers are available', 'Merchant account is active'],
    steps: [
      { stepNumber: 1, action: 'Navigate to payment page', expectedResult: 'Payment form is displayed with amount', status: 'passed' },
      { stepNumber: 2, action: 'Enter valid test credit card details', expectedResult: 'Card details are accepted', status: 'passed' },
      { stepNumber: 3, action: 'Submit payment', expectedResult: 'Payment is authorized and captured', status: 'passed' },
      { stepNumber: 4, action: 'Verify payment confirmation', expectedResult: 'Confirmation page shows transaction ID and amount', status: 'passed' },
      { stepNumber: 5, action: 'Verify payment record in database', expectedResult: 'Payment record exists with correct status', status: 'passed' },
    ],
    expectedResults: 'Payment is processed successfully with authorization, capture, and database record creation.',
    actualResults: 'Payment processed. Transaction ID TXN-2024-45678 created. Amount $150.00 captured.',
    testData: { cardType: 'Visa', amount: 150.00, currency: 'USD' },
    coverage: {
      requirements: ['REQ-PAY-001', 'REQ-PAY-002'],
      features: ['feat-005'],
      stories: ['story-008'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-014', date: daysAgo(1), status: 'passed', duration: 35, environment: 'staging', executedBy: 'user-009' },
      { executionId: 'exec-015', date: daysAgo(8), status: 'passed', duration: 38, environment: 'staging', executedBy: 'user-020' },
      { executionId: 'exec-016', date: daysAgo(15), status: 'failed', duration: 42, environment: 'staging', executedBy: 'user-009' },
    ],
    defectsLinked: ['DEF-PAY-001'],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(70),
    tags: ['payments', 'credit-card', 'integration', 'critical-path'],
    estimatedDuration: 40,
    environment: 'staging',
    version: 5,
    created_at: daysAgo(200),
    updated_at: daysAgo(1),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-007',
    title: 'Verify multi-currency payment conversion',
    description: 'Validate that payments in non-USD currencies are correctly converted using current exchange rates.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-002',
    application: 'Payment Gateway',
    segment: 'Billing',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Cypress',
    automationScriptPath: '/tests/payments/tc-007-multi-currency.cy.js',
    preconditions: ['Multi-currency feature is enabled', 'Exchange rate service is available', 'Test accounts with non-USD currency exist'],
    steps: [
      { stepNumber: 1, action: 'Select EUR as payment currency', expectedResult: 'Currency selector shows EUR', status: 'passed' },
      { stepNumber: 2, action: 'Enter payment amount of 100 EUR', expectedResult: 'USD equivalent is displayed based on current rate', status: 'passed' },
      { stepNumber: 3, action: 'Submit payment', expectedResult: 'Payment processed in EUR with USD conversion recorded', status: 'passed' },
      { stepNumber: 4, action: 'Verify conversion rate in transaction record', expectedResult: 'Exchange rate and converted amount are stored', status: 'passed' },
    ],
    expectedResults: 'Multi-currency payment is processed with correct exchange rate conversion and both amounts recorded.',
    actualResults: 'Payment of 100 EUR processed. Converted to $108.50 USD at rate 1.085. Both amounts recorded.',
    testData: { sourceCurrency: 'EUR', amount: 100, targetCurrency: 'USD' },
    coverage: {
      requirements: ['REQ-PAY-005', 'REQ-PAY-006'],
      features: ['feat-004'],
      stories: ['story-007'],
      coveragePercentage: 90,
    },
    executionHistory: [
      { executionId: 'exec-017', date: daysAgo(1), status: 'passed', duration: 42, environment: 'staging', executedBy: 'user-020' },
      { executionId: 'exec-018', date: daysAgo(10), status: 'passed', duration: 45, environment: 'staging', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(65),
    tags: ['payments', 'multi-currency', 'conversion'],
    estimatedDuration: 45,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(190),
    updated_at: daysAgo(1),
    created_by: 'user-020',
    updated_by: 'user-020',
  },
  {
    id: 'tc-008',
    title: 'Verify payment reconciliation report accuracy',
    description: 'Validate that the payment reconciliation module generates accurate reports matching bank settlement data.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-002',
    application: 'Payment Gateway',
    segment: 'Billing',
    priority: 'p1',
    severity: 'high',
    status: 'failed',
    automationStatus: 'automated',
    automationFramework: 'Jest',
    automationScriptPath: '/tests/payments/tc-008-reconciliation.test.js',
    preconditions: ['Settlement data from bank is available', 'Payment transactions exist for reconciliation period', 'Reconciliation module is deployed'],
    steps: [
      { stepNumber: 1, action: 'Import bank settlement file for the period', expectedResult: 'Settlement file is parsed successfully', status: 'passed' },
      { stepNumber: 2, action: 'Run reconciliation process', expectedResult: 'All transactions are matched', status: 'failed' },
      { stepNumber: 3, action: 'Review discrepancy report', expectedResult: 'Discrepancies are identified and categorized', status: 'blocked' },
    ],
    expectedResults: 'Reconciliation report matches bank settlement data with all discrepancies identified.',
    actualResults: 'Reconciliation failed. 3 transactions could not be matched due to timing difference in settlement dates.',
    testData: { settlementPeriod: '2024-06', transactionCount: 1500 },
    coverage: {
      requirements: ['REQ-PAY-010', 'REQ-PAY-011'],
      features: ['feat-003'],
      stories: ['story-006'],
      coveragePercentage: 75,
    },
    executionHistory: [
      { executionId: 'exec-019', date: daysAgo(1), status: 'failed', duration: 120, environment: 'staging', executedBy: 'user-009' },
      { executionId: 'exec-020', date: daysAgo(8), status: 'failed', duration: 115, environment: 'staging', executedBy: 'user-020' },
      { executionId: 'exec-021', date: daysAgo(20), status: 'passed', duration: 110, environment: 'staging', executedBy: 'user-009' },
    ],
    defectsLinked: ['DEF-PAY-003', 'DEF-PAY-004'],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(60),
    tags: ['payments', 'reconciliation', 'reporting', 'critical'],
    estimatedDuration: 120,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(185),
    updated_at: daysAgo(1),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-009',
    title: 'Verify payment retry mechanism for failed transactions',
    description: 'Validate that the payment retry mechanism correctly retries failed payment transactions with exponential backoff.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-002',
    application: 'Payment Gateway',
    segment: 'Billing',
    priority: 'p2',
    severity: 'high',
    status: 'in_progress',
    automationStatus: 'in_development',
    automationFramework: 'Cypress',
    automationScriptPath: '/tests/payments/tc-009-retry-mechanism.cy.js',
    preconditions: ['Payment gateway is configured with retry policy', 'Mock payment processor can simulate failures'],
    steps: [
      { stepNumber: 1, action: 'Submit payment that triggers a transient failure', expectedResult: 'Payment fails with retryable error code', status: 'passed' },
      { stepNumber: 2, action: 'Verify first retry attempt after 30 seconds', expectedResult: 'System retries payment automatically', status: 'passed' },
      { stepNumber: 3, action: 'Verify second retry attempt after 60 seconds', expectedResult: 'System retries with exponential backoff', status: 'not_run' },
      { stepNumber: 4, action: 'Verify successful payment on retry', expectedResult: 'Payment succeeds on retry attempt', status: 'not_run' },
    ],
    expectedResults: 'Failed payment is retried with exponential backoff and eventually succeeds.',
    actualResults: 'First retry successful. Remaining steps pending automation completion.',
    testData: { failureType: 'transient', maxRetries: 3, backoffMultiplier: 2 },
    coverage: {
      requirements: ['REQ-PAY-015'],
      features: ['feat-005'],
      stories: ['story-009'],
      coveragePercentage: 60,
    },
    executionHistory: [
      { executionId: 'exec-022', date: daysAgo(2), status: 'in_progress', duration: 90, environment: 'staging', executedBy: 'user-020' },
    ],
    defectsLinked: [],
    approvalStatus: 'pending',
    approvedBy: null,
    approvedAt: null,
    tags: ['payments', 'retry', 'reliability', 'in-progress'],
    estimatedDuration: 120,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(100),
    updated_at: daysAgo(2),
    created_by: 'user-020',
    updated_by: 'user-020',
  },

  // Member Portal Enrollment Suite (suite-003)
  {
    id: 'tc-010',
    title: 'Verify new member enrollment flow end-to-end',
    description: 'Validate the complete member enrollment flow from plan selection through confirmation.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-003',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/enrollment/tc-010-new-enrollment.spec.js',
    preconditions: ['Open enrollment period is active', 'Test member data is available', 'Plan options are configured'],
    steps: [
      { stepNumber: 1, action: 'Navigate to enrollment page', expectedResult: 'Enrollment wizard is displayed', status: 'passed' },
      { stepNumber: 2, action: 'Enter personal information', expectedResult: 'Information is validated and accepted', status: 'passed' },
      { stepNumber: 3, action: 'Select health plan', expectedResult: 'Plan details and costs are displayed', status: 'passed' },
      { stepNumber: 4, action: 'Add dependents', expectedResult: 'Dependent information is captured', status: 'passed' },
      { stepNumber: 5, action: 'Review and confirm enrollment', expectedResult: 'Enrollment confirmation with member ID is displayed', status: 'passed' },
    ],
    expectedResults: 'Member is enrolled successfully with a new member ID and confirmation email sent.',
    actualResults: 'Enrollment completed. Member ID MBR-2024-11234 assigned. Confirmation email sent.',
    testData: { planType: 'PPO Gold', dependents: 2 },
    coverage: {
      requirements: ['REQ-ENR-001', 'REQ-ENR-002', 'REQ-ENR-003'],
      features: ['feat-006'],
      stories: ['story-010'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-023', date: daysAgo(3), status: 'passed', duration: 65, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-024', date: daysAgo(10), status: 'passed', duration: 70, environment: 'uat', executedBy: 'user-006' },
      { executionId: 'exec-025', date: daysAgo(25), status: 'passed', duration: 68, environment: 'staging', executedBy: 'user-021' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(50),
    tags: ['enrollment', 'e2e', 'member-portal', 'critical-path'],
    estimatedDuration: 70,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(150),
    updated_at: daysAgo(3),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'tc-011',
    title: 'Verify eligibility verification API integration',
    description: 'Validate that the eligibility verification API correctly validates member eligibility during enrollment.',
    type: 'Test Case',
    assetType: 'API Collection',
    suiteId: 'suite-003',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Postman/Newman',
    automationScriptPath: '/tests/enrollment/tc-011-eligibility-api.postman.json',
    preconditions: ['Eligibility service is running', 'Test member records exist in eligibility database'],
    steps: [
      { stepNumber: 1, action: 'Send eligibility check request with valid member SSN and DOB', expectedResult: 'API returns 200 with eligibility status', status: 'passed' },
      { stepNumber: 2, action: 'Verify eligible member response', expectedResult: 'Response contains eligible=true with plan options', status: 'passed' },
      { stepNumber: 3, action: 'Send eligibility check for ineligible member', expectedResult: 'API returns 200 with eligible=false and reason', status: 'passed' },
      { stepNumber: 4, action: 'Send eligibility check with invalid data', expectedResult: 'API returns 400 with validation errors', status: 'passed' },
    ],
    expectedResults: 'Eligibility API correctly validates member eligibility for all scenarios.',
    actualResults: 'All 4 scenarios passed. Response times under 200ms.',
    testData: { eligibleMemberId: 'MBR-ELIG-001', ineligibleMemberId: 'MBR-ELIG-002' },
    coverage: {
      requirements: ['REQ-ENR-005', 'REQ-ENR-006'],
      features: ['feat-006'],
      stories: ['story-011'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-026', date: daysAgo(3), status: 'passed', duration: 22, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-027', date: daysAgo(12), status: 'passed', duration: 25, environment: 'staging', executedBy: 'user-021' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(48),
    tags: ['enrollment', 'api', 'eligibility', 'integration'],
    estimatedDuration: 25,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(145),
    updated_at: daysAgo(3),
    created_by: 'user-021',
    updated_by: 'user-006',
  },
  {
    id: 'tc-012',
    title: 'Verify member profile self-service update',
    description: 'Validate that members can update their profile information through the self-service portal.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-003',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p3',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/enrollment/tc-012-profile-update.spec.js',
    preconditions: ['Member is authenticated', 'Profile page is accessible'],
    steps: [
      { stepNumber: 1, action: 'Navigate to My Profile page', expectedResult: 'Current profile information is displayed', status: 'passed' },
      { stepNumber: 2, action: 'Update address fields', expectedResult: 'Address fields accept new values', status: 'passed' },
      { stepNumber: 3, action: 'Save changes', expectedResult: 'Profile is updated with success message', status: 'passed' },
      { stepNumber: 4, action: 'Verify changes persist after page reload', expectedResult: 'Updated information is displayed', status: 'passed' },
    ],
    expectedResults: 'Member profile is updated successfully and changes persist.',
    actualResults: 'Profile updated. Address change reflected after reload. Audit trail entry created.',
    testData: { memberId: 'MBR-TEST-PROF-001', fieldUpdated: 'address' },
    coverage: {
      requirements: ['REQ-ENR-010'],
      features: ['feat-007'],
      stories: ['story-012'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-028', date: daysAgo(4), status: 'passed', duration: 30, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-029', date: daysAgo(18), status: 'passed', duration: 32, environment: 'uat', executedBy: 'user-006' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(45),
    tags: ['member-portal', 'profile', 'self-service'],
    estimatedDuration: 35,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(130),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'tc-013',
    title: 'Verify enrollment form accessibility compliance',
    description: 'Validate that the enrollment form meets WCAG 2.1 AA accessibility standards for screen readers and keyboard navigation.',
    type: 'Test Case',
    assetType: 'Accessibility Checklist',
    suiteId: 'suite-003',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p2',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Enrollment form is deployed', 'Screen reader (NVDA/JAWS) is available', 'axe DevTools extension is installed'],
    steps: [
      { stepNumber: 1, action: 'Run axe accessibility scan on enrollment form', expectedResult: 'No critical or serious violations', status: 'passed' },
      { stepNumber: 2, action: 'Navigate form using keyboard only (Tab, Enter, Space)', expectedResult: 'All interactive elements are reachable and operable', status: 'passed' },
      { stepNumber: 3, action: 'Test form with screen reader', expectedResult: 'All labels, instructions, and errors are announced', status: 'passed' },
      { stepNumber: 4, action: 'Verify color contrast ratios', expectedResult: 'All text meets 4.5:1 contrast ratio minimum', status: 'passed' },
    ],
    expectedResults: 'Enrollment form passes all WCAG 2.1 AA accessibility criteria.',
    actualResults: 'All checks passed. 0 critical violations. 2 minor best-practice suggestions noted.',
    testData: { wcagLevel: 'AA', toolUsed: 'axe DevTools' },
    coverage: {
      requirements: ['REQ-ACC-001', 'REQ-ACC-002'],
      features: ['feat-008'],
      stories: ['story-013'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-030', date: daysAgo(5), status: 'passed', duration: 45, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-031', date: daysAgo(20), status: 'failed', duration: 50, environment: 'staging', executedBy: 'user-006' },
    ],
    defectsLinked: ['DEF-ACC-001'],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(10),
    tags: ['accessibility', 'wcag', 'enrollment', 'compliance'],
    estimatedDuration: 60,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(120),
    updated_at: daysAgo(5),
    created_by: 'user-006',
    updated_by: 'user-006',
  },

  // Provider Directory Search Suite (suite-004)
  {
    id: 'tc-014',
    title: 'Verify provider search by specialty returns accurate results',
    description: 'Validate that searching for providers by specialty returns correctly filtered and ranked results.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-004',
    application: 'Provider Directory',
    segment: 'Provider',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Selenium',
    automationScriptPath: '/tests/provider/tc-014-search-specialty.spec.js',
    preconditions: ['Provider directory is populated with test data', 'Search index is up to date'],
    steps: [
      { stepNumber: 1, action: 'Navigate to provider search page', expectedResult: 'Search form with specialty dropdown is displayed', status: 'passed' },
      { stepNumber: 2, action: 'Select "Cardiology" from specialty dropdown', expectedResult: 'Specialty filter is applied', status: 'passed' },
      { stepNumber: 3, action: 'Click Search', expectedResult: 'Results show only cardiologists', status: 'passed' },
      { stepNumber: 4, action: 'Verify result count and provider details', expectedResult: 'All results have Cardiology specialty', status: 'passed' },
    ],
    expectedResults: 'Search returns only providers matching the selected specialty with correct details.',
    actualResults: '15 cardiologists returned. All results verified with correct specialty.',
    testData: { specialty: 'Cardiology', expectedMinResults: 5 },
    coverage: {
      requirements: ['REQ-PRV-001', 'REQ-PRV-002'],
      features: ['feat-009'],
      stories: ['story-015'],
      coveragePercentage: 90,
    },
    executionHistory: [
      { executionId: 'exec-032', date: daysAgo(1), status: 'passed', duration: 25, environment: 'staging', executedBy: 'user-007' },
      { executionId: 'exec-033', date: daysAgo(8), status: 'passed', duration: 28, environment: 'staging', executedBy: 'user-007' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(55),
    tags: ['provider', 'search', 'specialty', 'functional'],
    estimatedDuration: 30,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(160),
    updated_at: daysAgo(1),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'tc-015',
    title: 'Verify provider network tier display accuracy',
    description: 'Validate that provider network tier information (Tier 1, Tier 2, Out-of-Network) is displayed correctly.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-004',
    application: 'Provider Directory',
    segment: 'Provider',
    priority: 'p2',
    severity: 'high',
    status: 'failed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Provider tier data is loaded', 'Member plan with tiered network is active'],
    steps: [
      { stepNumber: 1, action: 'Search for a Tier 1 provider', expectedResult: 'Provider shows Tier 1 badge', status: 'passed' },
      { stepNumber: 2, action: 'Search for a Tier 2 provider', expectedResult: 'Provider shows Tier 2 badge', status: 'failed' },
      { stepNumber: 3, action: 'Search for an out-of-network provider', expectedResult: 'Provider shows Out-of-Network indicator', status: 'not_run' },
    ],
    expectedResults: 'All provider tier levels are displayed correctly with appropriate visual indicators.',
    actualResults: 'Tier 2 badge not displaying correctly. CSS styling issue causing badge to be hidden.',
    testData: { tier1ProviderId: 'PRV-T1-001', tier2ProviderId: 'PRV-T2-001', oonProviderId: 'PRV-OON-001' },
    coverage: {
      requirements: ['REQ-PRV-005'],
      features: ['feat-009'],
      stories: ['story-016'],
      coveragePercentage: 70,
    },
    executionHistory: [
      { executionId: 'exec-034', date: daysAgo(1), status: 'failed', duration: 20, environment: 'staging', executedBy: 'user-007' },
      { executionId: 'exec-035', date: daysAgo(10), status: 'failed', duration: 22, environment: 'staging', executedBy: 'user-007' },
    ],
    defectsLinked: ['DEF-PRV-002'],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(50),
    tags: ['provider', 'network-tier', 'display', 'ui'],
    estimatedDuration: 25,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(155),
    updated_at: daysAgo(1),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'tc-016',
    title: 'Verify provider data synchronization from credentialing system',
    description: 'Validate that provider data is correctly synchronized from the credentialing system to the provider directory.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-004',
    application: 'Provider Directory',
    segment: 'Provider',
    priority: 'p1',
    severity: 'critical',
    status: 'failed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Credentialing system has updated provider records', 'Data sync job is scheduled', 'Provider directory database is accessible'],
    steps: [
      { stepNumber: 1, action: 'Update provider credentials in credentialing system', expectedResult: 'Credential update is saved', status: 'passed' },
      { stepNumber: 2, action: 'Trigger data synchronization job', expectedResult: 'Sync job completes without errors', status: 'failed' },
      { stepNumber: 3, action: 'Verify updated data in provider directory', expectedResult: 'Provider directory reflects credential changes', status: 'blocked' },
    ],
    expectedResults: 'Provider credential updates are synchronized to the directory within the SLA window.',
    actualResults: 'Sync job failed with timeout error. Provider data not updated in directory.',
    testData: { providerId: 'PRV-SYNC-001', syncSlaMinutes: 15 },
    coverage: {
      requirements: ['REQ-PRV-010', 'REQ-PRV-011'],
      features: ['feat-011'],
      stories: ['story-018'],
      coveragePercentage: 65,
    },
    executionHistory: [
      { executionId: 'exec-036', date: daysAgo(1), status: 'failed', duration: 180, environment: 'staging', executedBy: 'user-007' },
      { executionId: 'exec-037', date: daysAgo(7), status: 'failed', duration: 200, environment: 'staging', executedBy: 'user-007' },
      { executionId: 'exec-038', date: daysAgo(21), status: 'passed', duration: 150, environment: 'staging', executedBy: 'user-007' },
    ],
    defectsLinked: ['DEF-PRV-005', 'DEF-PRV-006'],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(45),
    tags: ['provider', 'data-sync', 'credentialing', 'integration'],
    estimatedDuration: 180,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(165),
    updated_at: daysAgo(1),
    created_by: 'user-007',
    updated_by: 'user-007',
  },

  // Rx Platform Formulary Suite (suite-005)
  {
    id: 'tc-017',
    title: 'Verify formulary tier management CRUD operations',
    description: 'Validate create, read, update, and delete operations for formulary tier management.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-005',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Jest',
    automationScriptPath: '/tests/pharmacy/tc-017-formulary-crud.test.js',
    preconditions: ['Formulary management module is deployed', 'Admin user has formulary management permissions'],
    steps: [
      { stepNumber: 1, action: 'Create a new formulary tier', expectedResult: 'Tier is created with unique ID', status: 'passed' },
      { stepNumber: 2, action: 'Read the created tier details', expectedResult: 'Tier details match input data', status: 'passed' },
      { stepNumber: 3, action: 'Update tier name and copay amount', expectedResult: 'Tier is updated successfully', status: 'passed' },
      { stepNumber: 4, action: 'Delete the tier', expectedResult: 'Tier is soft-deleted and no longer visible', status: 'passed' },
    ],
    expectedResults: 'All CRUD operations for formulary tiers work correctly with proper validation.',
    actualResults: 'All CRUD operations passed. Audit trail entries created for each operation.',
    testData: { tierName: 'Test Tier', copayAmount: 25.00 },
    coverage: {
      requirements: ['REQ-RX-001', 'REQ-RX-002'],
      features: ['feat-016'],
      stories: ['story-025'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-039', date: daysAgo(2), status: 'passed', duration: 18, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-040', date: daysAgo(14), status: 'passed', duration: 20, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(40),
    tags: ['pharmacy', 'formulary', 'crud', 'api'],
    estimatedDuration: 20,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(140),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'tc-018',
    title: 'Verify drug interaction alert triggers correctly',
    description: 'Validate that the drug interaction alert system correctly identifies and alerts on known drug-drug interactions.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-005',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    priority: 'p1',
    severity: 'critical',
    status: 'failed',
    automationStatus: 'automated',
    automationFramework: 'Jest',
    automationScriptPath: '/tests/pharmacy/tc-018-drug-interaction.test.js',
    preconditions: ['Drug interaction database is loaded', 'Alert service is running', 'Test prescription data is available'],
    steps: [
      { stepNumber: 1, action: 'Submit prescription for Drug A (known interaction with Drug B)', expectedResult: 'System checks interaction database', status: 'passed' },
      { stepNumber: 2, action: 'Verify interaction alert is generated', expectedResult: 'Alert shows severity level and interaction details', status: 'passed' },
      { stepNumber: 3, action: 'Submit prescription for Drug C with no known interactions', expectedResult: 'No interaction alert is generated', status: 'failed' },
      { stepNumber: 4, action: 'Verify alert is logged in clinical safety audit', expectedResult: 'Audit trail contains interaction alert record', status: 'blocked' },
    ],
    expectedResults: 'Drug interaction alerts are generated accurately for known interactions and suppressed for non-interactions.',
    actualResults: 'False positive alert generated for Drug C. Interaction database has incorrect mapping.',
    testData: { drugA: 'Warfarin', drugB: 'Aspirin', drugC: 'Acetaminophen' },
    coverage: {
      requirements: ['REQ-RX-010', 'REQ-RX-011'],
      features: ['feat-018'],
      stories: ['story-028'],
      coveragePercentage: 80,
    },
    executionHistory: [
      { executionId: 'exec-041', date: daysAgo(2), status: 'failed', duration: 30, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-042', date: daysAgo(10), status: 'passed', duration: 28, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: ['DEF-RX-003'],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(35),
    tags: ['pharmacy', 'drug-interaction', 'clinical-safety', 'critical'],
    estimatedDuration: 35,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(135),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'tc-019',
    title: 'Verify prior authorization workflow submission and approval',
    description: 'Validate the prior authorization request workflow from submission through approval or denial.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-005',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/pharmacy/tc-019-prior-auth.spec.js',
    preconditions: ['Prior authorization module is deployed', 'Reviewer user account is configured', 'Drug requiring PA is in formulary'],
    steps: [
      { stepNumber: 1, action: 'Submit prior authorization request for a PA-required drug', expectedResult: 'PA request is created with pending status', status: 'passed' },
      { stepNumber: 2, action: 'Verify PA request appears in reviewer queue', expectedResult: 'Request is visible in reviewer dashboard', status: 'passed' },
      { stepNumber: 3, action: 'Reviewer approves the PA request', expectedResult: 'PA status changes to Approved', status: 'passed' },
      { stepNumber: 4, action: 'Verify prescription can be filled after PA approval', expectedResult: 'Prescription processing proceeds normally', status: 'passed' },
    ],
    expectedResults: 'Prior authorization workflow completes successfully from submission to approval.',
    actualResults: 'PA request PA-2024-5678 approved. Prescription fill authorized.',
    testData: { drugName: 'Humira', paReason: 'Step therapy requirement' },
    coverage: {
      requirements: ['REQ-RX-015', 'REQ-RX-016'],
      features: ['feat-017'],
      stories: ['story-026'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-043', date: daysAgo(3), status: 'passed', duration: 55, environment: 'staging', executedBy: 'user-008' },
      { executionId: 'exec-044', date: daysAgo(15), status: 'passed', duration: 58, environment: 'uat', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(30),
    tags: ['pharmacy', 'prior-authorization', 'workflow'],
    estimatedDuration: 60,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(125),
    updated_at: daysAgo(3),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'tc-020',
    title: 'Verify pharmacy network validation for prescription fill',
    description: 'Validate that prescriptions can only be filled at pharmacies within the member network.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-005',
    application: 'Rx Platform',
    segment: 'Pharmacy',
    priority: 'p2',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Pharmacy network data is loaded', 'Member plan has defined pharmacy network'],
    steps: [
      { stepNumber: 1, action: 'Attempt to fill prescription at in-network pharmacy', expectedResult: 'Prescription fill is authorized', status: 'passed' },
      { stepNumber: 2, action: 'Attempt to fill prescription at out-of-network pharmacy', expectedResult: 'Warning is displayed about out-of-network costs', status: 'passed' },
      { stepNumber: 3, action: 'Verify cost difference is displayed', expectedResult: 'In-network vs out-of-network cost comparison shown', status: 'passed' },
    ],
    expectedResults: 'Pharmacy network validation correctly identifies in-network and out-of-network pharmacies.',
    actualResults: 'Network validation working correctly. Cost comparison displayed accurately.',
    testData: { inNetworkPharmacy: 'PHR-NET-001', outOfNetworkPharmacy: 'PHR-OON-001' },
    coverage: {
      requirements: ['REQ-RX-020'],
      features: ['feat-018'],
      stories: ['story-027'],
      coveragePercentage: 85,
    },
    executionHistory: [
      { executionId: 'exec-045', date: daysAgo(4), status: 'passed', duration: 20, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(28),
    tags: ['pharmacy', 'network', 'validation'],
    estimatedDuration: 25,
    environment: 'staging',
    version: 1,
    created_at: daysAgo(110),
    updated_at: daysAgo(4),
    created_by: 'user-008',
    updated_by: 'user-008',
  },

  // EQIP Core Performance Suite (suite-006)
  {
    id: 'tc-021',
    title: 'Verify dashboard load time under normal load',
    description: 'Validate that the main dashboard loads within 2 seconds under normal concurrent user load.',
    type: 'Test Case',
    assetType: 'Performance Script',
    suiteId: 'suite-006',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'k6',
    automationScriptPath: '/tests/performance/tc-021-dashboard-load.k6.js',
    preconditions: ['Application is deployed to performance environment', 'Test data is seeded', 'Load generators are configured'],
    steps: [
      { stepNumber: 1, action: 'Configure 50 concurrent virtual users', expectedResult: 'Load test configuration is valid', status: 'passed' },
      { stepNumber: 2, action: 'Execute dashboard load test for 10 minutes', expectedResult: 'Test runs without errors', status: 'passed' },
      { stepNumber: 3, action: 'Measure P95 response time', expectedResult: 'P95 response time is under 2 seconds', status: 'passed' },
      { stepNumber: 4, action: 'Verify no errors during test', expectedResult: 'Error rate is below 0.1%', status: 'passed' },
    ],
    expectedResults: 'Dashboard loads within 2 seconds at P95 with 50 concurrent users.',
    actualResults: 'P95 response time: 1.4 seconds. Error rate: 0.02%. All thresholds met.',
    testData: { concurrentUsers: 50, durationMinutes: 10, p95Threshold: 2000 },
    coverage: {
      requirements: ['REQ-PERF-001'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-046', date: daysAgo(5), status: 'passed', duration: 600, environment: 'performance', executedBy: 'user-009' },
      { executionId: 'exec-047', date: daysAgo(20), status: 'passed', duration: 600, environment: 'performance', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(25),
    tags: ['performance', 'dashboard', 'load-test', 'response-time'],
    estimatedDuration: 660,
    environment: 'performance',
    version: 3,
    created_at: daysAgo(120),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-022',
    title: 'Verify API throughput under peak load',
    description: 'Validate that the EQIP Core API maintains acceptable throughput under peak load conditions.',
    type: 'Test Case',
    assetType: 'Performance Script',
    suiteId: 'suite-006',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'k6',
    automationScriptPath: '/tests/performance/tc-022-api-throughput.k6.js',
    preconditions: ['API endpoints are deployed', 'Load test environment is isolated', 'Monitoring is active'],
    steps: [
      { stepNumber: 1, action: 'Ramp up to 200 concurrent API requests', expectedResult: 'System handles ramp-up without errors', status: 'passed' },
      { stepNumber: 2, action: 'Sustain peak load for 15 minutes', expectedResult: 'Throughput remains above 500 req/sec', status: 'passed' },
      { stepNumber: 3, action: 'Monitor CPU and memory utilization', expectedResult: 'CPU below 80%, memory below 85%', status: 'passed' },
      { stepNumber: 4, action: 'Verify graceful degradation on overload', expectedResult: 'System returns 429 status codes, no crashes', status: 'passed' },
    ],
    expectedResults: 'API maintains 500+ req/sec throughput under peak load with acceptable resource utilization.',
    actualResults: 'Sustained 650 req/sec. CPU: 72%. Memory: 78%. No errors during peak.',
    testData: { peakUsers: 200, durationMinutes: 15, throughputThreshold: 500 },
    coverage: {
      requirements: ['REQ-PERF-002', 'REQ-PERF-003'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-048', date: daysAgo(5), status: 'passed', duration: 900, environment: 'performance', executedBy: 'user-009' },
      { executionId: 'exec-049', date: daysAgo(25), status: 'passed', duration: 900, environment: 'performance', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(22),
    tags: ['performance', 'api', 'throughput', 'peak-load'],
    estimatedDuration: 960,
    environment: 'performance',
    version: 2,
    created_at: daysAgo(115),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-023',
    title: 'Verify database query performance for metrics aggregation',
    description: 'Validate that metrics aggregation queries execute within acceptable time limits.',
    type: 'Test Case',
    assetType: 'Performance Script',
    suiteId: 'suite-006',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p3',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'k6',
    automationScriptPath: '/tests/performance/tc-023-db-query-perf.k6.js',
    preconditions: ['Database is populated with 1M+ records', 'Query execution plans are optimized', 'Database monitoring is active'],
    steps: [
      { stepNumber: 1, action: 'Execute enterprise quality score aggregation query', expectedResult: 'Query completes within 500ms', status: 'passed' },
      { stepNumber: 2, action: 'Execute release readiness score query across all releases', expectedResult: 'Query completes within 1 second', status: 'passed' },
      { stepNumber: 3, action: 'Execute trend data query for 12-month period', expectedResult: 'Query completes within 2 seconds', status: 'passed' },
    ],
    expectedResults: 'All metrics aggregation queries execute within defined time thresholds.',
    actualResults: 'EQS query: 320ms. RRS query: 780ms. Trend query: 1.5s. All within thresholds.',
    testData: { recordCount: 1000000, eqsThresholdMs: 500, rrsThresholdMs: 1000, trendThresholdMs: 2000 },
    coverage: {
      requirements: ['REQ-PERF-005'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 90,
    },
    executionHistory: [
      { executionId: 'exec-050', date: daysAgo(5), status: 'passed', duration: 120, environment: 'performance', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(20),
    tags: ['performance', 'database', 'query', 'metrics'],
    estimatedDuration: 150,
    environment: 'performance',
    version: 1,
    created_at: daysAgo(100),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },

  // Security Scan Configuration Suite (suite-007)
  {
    id: 'tc-024',
    title: 'Verify OWASP Top 10 vulnerability scan passes',
    description: 'Validate that the application passes OWASP Top 10 vulnerability scanning with no critical findings.',
    type: 'Test Case',
    assetType: 'Security Scan Config',
    suiteId: 'suite-007',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'OWASP ZAP',
    automationScriptPath: '/tests/security/tc-024-owasp-scan.zap',
    preconditions: ['OWASP ZAP is configured', 'Target application is deployed', 'Scan policy is defined'],
    steps: [
      { stepNumber: 1, action: 'Configure OWASP ZAP scan against target URL', expectedResult: 'Scan configuration is valid', status: 'passed' },
      { stepNumber: 2, action: 'Execute full active scan', expectedResult: 'Scan completes without tool errors', status: 'passed' },
      { stepNumber: 3, action: 'Review scan results for critical vulnerabilities', expectedResult: 'Zero critical vulnerabilities found', status: 'passed' },
      { stepNumber: 4, action: 'Review high severity findings', expectedResult: 'No high severity findings or all are false positives', status: 'passed' },
    ],
    expectedResults: 'Application passes OWASP Top 10 scan with zero critical and zero confirmed high severity findings.',
    actualResults: '0 critical, 0 high, 2 medium (accepted risk), 5 low findings.',
    testData: { scanType: 'active', targetUrl: 'https://staging.eqip-core.internal' },
    coverage: {
      requirements: ['REQ-SEC-001', 'REQ-SEC-002'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-051', date: daysAgo(3), status: 'passed', duration: 3600, environment: 'staging', executedBy: 'user-010' },
      { executionId: 'exec-052', date: daysAgo(30), status: 'passed', duration: 3500, environment: 'staging', executedBy: 'user-010' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(15),
    tags: ['security', 'owasp', 'vulnerability', 'scan'],
    estimatedDuration: 3600,
    environment: 'staging',
    version: 6,
    created_at: daysAgo(200),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
  {
    id: 'tc-025',
    title: 'Verify SQL injection prevention across all input fields',
    description: 'Validate that all user input fields are protected against SQL injection attacks.',
    type: 'Test Case',
    assetType: 'Security Scan Config',
    suiteId: 'suite-007',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'SQLMap',
    automationScriptPath: '/tests/security/tc-025-sql-injection.sh',
    preconditions: ['Application endpoints are identified', 'SQLMap is configured', 'Test database is isolated'],
    steps: [
      { stepNumber: 1, action: 'Run SQLMap against all form input endpoints', expectedResult: 'No SQL injection vulnerabilities detected', status: 'passed' },
      { stepNumber: 2, action: 'Test parameterized query bypass attempts', expectedResult: 'All bypass attempts are blocked', status: 'passed' },
      { stepNumber: 3, action: 'Verify error messages do not expose database details', expectedResult: 'Generic error messages returned', status: 'passed' },
    ],
    expectedResults: 'All input fields are protected against SQL injection with parameterized queries.',
    actualResults: 'No SQL injection vulnerabilities found across 45 tested endpoints.',
    testData: { endpointCount: 45, payloadTypes: ['union', 'blind', 'time-based'] },
    coverage: {
      requirements: ['REQ-SEC-005'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-053', date: daysAgo(3), status: 'passed', duration: 1800, environment: 'staging', executedBy: 'user-010' },
      { executionId: 'exec-054', date: daysAgo(30), status: 'passed', duration: 1750, environment: 'staging', executedBy: 'user-010' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(12),
    tags: ['security', 'sql-injection', 'input-validation'],
    estimatedDuration: 1800,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(195),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
  {
    id: 'tc-026',
    title: 'Verify XSS prevention in user-generated content',
    description: 'Validate that cross-site scripting (XSS) attacks are prevented in all user-generated content areas.',
    type: 'Test Case',
    assetType: 'Security Scan Config',
    suiteId: 'suite-007',
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p1',
    severity: 'critical',
    status: 'failed',
    automationStatus: 'automated',
    automationFramework: 'OWASP ZAP',
    automationScriptPath: '/tests/security/tc-026-xss-prevention.zap',
    preconditions: ['Application has user-generated content areas', 'XSS payloads are prepared'],
    steps: [
      { stepNumber: 1, action: 'Inject reflected XSS payloads in search fields', expectedResult: 'Payloads are sanitized and not executed', status: 'passed' },
      { stepNumber: 2, action: 'Inject stored XSS payloads in comment/notes fields', expectedResult: 'Payloads are sanitized on storage and display', status: 'failed' },
      { stepNumber: 3, action: 'Test DOM-based XSS via URL parameters', expectedResult: 'URL parameters are properly encoded', status: 'passed' },
    ],
    expectedResults: 'All XSS attack vectors are prevented through proper input sanitization and output encoding.',
    actualResults: 'Stored XSS vulnerability found in release notes field. Script tag not sanitized on display.',
    testData: { payloadCount: 50, vectorTypes: ['reflected', 'stored', 'dom-based'] },
    coverage: {
      requirements: ['REQ-SEC-006'],
      features: ['feat-001'],
      stories: ['story-003'],
      coveragePercentage: 85,
    },
    executionHistory: [
      { executionId: 'exec-055', date: daysAgo(3), status: 'failed', duration: 2400, environment: 'staging', executedBy: 'user-010' },
      { executionId: 'exec-056', date: daysAgo(30), status: 'passed', duration: 2300, environment: 'staging', executedBy: 'user-010' },
    ],
    defectsLinked: ['DEF-SEC-001'],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(10),
    tags: ['security', 'xss', 'input-sanitization'],
    estimatedDuration: 2400,
    environment: 'staging',
    version: 5,
    created_at: daysAgo(190),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },

  // Accessibility Compliance Suite (suite-008)
  {
    id: 'tc-027',
    title: 'Verify keyboard navigation across all interactive elements',
    description: 'Validate that all interactive elements on the member portal are accessible via keyboard navigation.',
    type: 'Test Case',
    assetType: 'Accessibility Checklist',
    suiteId: 'suite-008',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p2',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/accessibility/tc-027-keyboard-nav.spec.js',
    preconditions: ['Member portal is deployed', 'All pages are accessible'],
    steps: [
      { stepNumber: 1, action: 'Tab through all interactive elements on home page', expectedResult: 'Focus indicator is visible on each element', status: 'passed' },
      { stepNumber: 2, action: 'Activate buttons and links using Enter/Space', expectedResult: 'All actions are triggered correctly', status: 'passed' },
      { stepNumber: 3, action: 'Navigate dropdown menus using arrow keys', expectedResult: 'Dropdown items are navigable', status: 'passed' },
      { stepNumber: 4, action: 'Verify skip navigation link', expectedResult: 'Skip link bypasses navigation to main content', status: 'passed' },
    ],
    expectedResults: 'All interactive elements are keyboard accessible with visible focus indicators.',
    actualResults: 'All 42 interactive elements tested. Focus indicators visible. Skip navigation working.',
    testData: { pagesTestedCount: 8, interactiveElementCount: 42 },
    coverage: {
      requirements: ['REQ-ACC-003', 'REQ-ACC-004'],
      features: ['feat-008'],
      stories: ['story-013'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-057', date: daysAgo(4), status: 'passed', duration: 40, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-058', date: daysAgo(18), status: 'passed', duration: 45, environment: 'staging', executedBy: 'user-006' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(15),
    tags: ['accessibility', 'keyboard', 'navigation', 'wcag'],
    estimatedDuration: 45,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(90),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'tc-028',
    title: 'Verify screen reader compatibility with ARIA labels',
    description: 'Validate that all UI components have proper ARIA labels and are correctly announced by screen readers.',
    type: 'Test Case',
    assetType: 'Accessibility Checklist',
    suiteId: 'suite-008',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p2',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'axe-core',
    automationScriptPath: '/tests/accessibility/tc-028-aria-labels.spec.js',
    preconditions: ['axe-core is integrated', 'ARIA attributes are implemented'],
    steps: [
      { stepNumber: 1, action: 'Run axe-core scan for ARIA violations', expectedResult: 'No ARIA-related violations found', status: 'passed' },
      { stepNumber: 2, action: 'Verify all form fields have associated labels', expectedResult: 'All inputs have visible or ARIA labels', status: 'passed' },
      { stepNumber: 3, action: 'Verify all images have alt text', expectedResult: 'All meaningful images have descriptive alt text', status: 'passed' },
    ],
    expectedResults: 'All UI components have proper ARIA labels and are screen reader compatible.',
    actualResults: '0 ARIA violations. All 28 form fields labeled. All 15 images have alt text.',
    testData: { formFieldCount: 28, imageCount: 15 },
    coverage: {
      requirements: ['REQ-ACC-005'],
      features: ['feat-008'],
      stories: ['story-013'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-059', date: daysAgo(4), status: 'passed', duration: 15, environment: 'staging', executedBy: 'user-006' },
      { executionId: 'exec-060', date: daysAgo(20), status: 'failed', duration: 18, environment: 'staging', executedBy: 'user-006' },
    ],
    defectsLinked: ['DEF-ACC-002'],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(12),
    tags: ['accessibility', 'aria', 'screen-reader', 'wcag'],
    estimatedDuration: 20,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(85),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'tc-029',
    title: 'Verify color contrast compliance for all text elements',
    description: 'Validate that all text elements meet WCAG 2.1 AA color contrast requirements (4.5:1 for normal text, 3:1 for large text).',
    type: 'Test Case',
    assetType: 'Accessibility Checklist',
    suiteId: 'suite-008',
    application: 'Member Portal',
    segment: 'Enrollment',
    priority: 'p3',
    severity: 'low',
    status: 'passed',
    automationStatus: 'manual',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Color contrast analyzer tool is available', 'All pages are rendered with final styling'],
    steps: [
      { stepNumber: 1, action: 'Analyze all text elements on enrollment pages', expectedResult: 'All normal text meets 4.5:1 ratio', status: 'passed' },
      { stepNumber: 2, action: 'Analyze large text elements (headings)', expectedResult: 'All large text meets 3:1 ratio', status: 'passed' },
      { stepNumber: 3, action: 'Check interactive element states (hover, focus, disabled)', expectedResult: 'All states maintain contrast requirements', status: 'passed' },
    ],
    expectedResults: 'All text elements meet WCAG 2.1 AA color contrast requirements.',
    actualResults: 'All contrast ratios verified. Minimum ratio found: 5.2:1 (exceeds 4.5:1 requirement).',
    testData: { normalTextRatio: 4.5, largeTextRatio: 3.0 },
    coverage: {
      requirements: ['REQ-ACC-006'],
      features: ['feat-008'],
      stories: ['story-013'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-061', date: daysAgo(5), status: 'passed', duration: 30, environment: 'staging', executedBy: 'user-006' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(10),
    tags: ['accessibility', 'color-contrast', 'wcag', 'visual'],
    estimatedDuration: 35,
    environment: 'staging',
    version: 1,
    created_at: daysAgo(80),
    updated_at: daysAgo(5),
    created_by: 'user-006',
    updated_by: 'user-006',
  },

  // Underwriting API Collection Suite (suite-009)
  {
    id: 'tc-030',
    title: 'Verify risk scoring API returns correct score for standard applicant',
    description: 'Validate that the risk scoring API v2 returns accurate risk scores for standard applicant profiles.',
    type: 'Test Case',
    assetType: 'API Collection',
    suiteId: 'suite-009',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    priority: 'p1',
    severity: 'critical',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Postman/Newman',
    automationScriptPath: '/tests/underwriting/tc-030-risk-scoring-api.postman.json',
    preconditions: ['Risk scoring API v2 is deployed', 'Test applicant profiles are configured', 'Credit data mock service is running'],
    steps: [
      { stepNumber: 1, action: 'Send risk scoring request for low-risk applicant', expectedResult: 'API returns score between 80-100', status: 'passed' },
      { stepNumber: 2, action: 'Send risk scoring request for medium-risk applicant', expectedResult: 'API returns score between 50-79', status: 'passed' },
      { stepNumber: 3, action: 'Send risk scoring request for high-risk applicant', expectedResult: 'API returns score between 0-49', status: 'passed' },
      { stepNumber: 4, action: 'Verify scoring factors are included in response', expectedResult: 'Response contains factor breakdown', status: 'passed' },
    ],
    expectedResults: 'Risk scoring API returns accurate scores with factor breakdown for all risk profiles.',
    actualResults: 'Low-risk: 87. Medium-risk: 62. High-risk: 34. All factor breakdowns included.',
    testData: { lowRiskProfile: 'APP-LOW-001', mediumRiskProfile: 'APP-MED-001', highRiskProfile: 'APP-HIGH-001' },
    coverage: {
      requirements: ['REQ-UW-001', 'REQ-UW-002'],
      features: ['feat-022'],
      stories: ['story-032'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-062', date: daysAgo(2), status: 'passed', duration: 15, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-063', date: daysAgo(10), status: 'passed', duration: 18, environment: 'staging', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(20),
    tags: ['underwriting', 'api', 'risk-scoring', 'critical'],
    estimatedDuration: 20,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(110),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-031',
    title: 'Verify automated underwriting decision rules engine',
    description: 'Validate that the automated underwriting decision rules correctly approve, refer, or decline applications.',
    type: 'Test Case',
    assetType: 'API Collection',
    suiteId: 'suite-009',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Postman/Newman',
    automationScriptPath: '/tests/underwriting/tc-031-decision-rules.postman.json',
    preconditions: ['Decision rules engine is deployed', 'Rule sets are configured for auto-approve, refer, and decline'],
    steps: [
      { stepNumber: 1, action: 'Submit application meeting auto-approve criteria', expectedResult: 'Decision: Approved', status: 'passed' },
      { stepNumber: 2, action: 'Submit application meeting referral criteria', expectedResult: 'Decision: Referred to underwriter', status: 'passed' },
      { stepNumber: 3, action: 'Submit application meeting decline criteria', expectedResult: 'Decision: Declined with reason', status: 'passed' },
      { stepNumber: 4, action: 'Verify decision audit trail', expectedResult: 'All decisions are logged with rule references', status: 'passed' },
    ],
    expectedResults: 'Decision rules engine correctly categorizes applications into approve, refer, or decline.',
    actualResults: 'All 3 decision paths tested successfully. Audit trail entries verified.',
    testData: { autoApproveProfile: 'APP-AA-001', referProfile: 'APP-REF-001', declineProfile: 'APP-DEC-001' },
    coverage: {
      requirements: ['REQ-UW-005', 'REQ-UW-006'],
      features: ['feat-023'],
      stories: ['story-033'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-064', date: daysAgo(2), status: 'passed', duration: 22, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-065', date: daysAgo(12), status: 'passed', duration: 25, environment: 'staging', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(18),
    tags: ['underwriting', 'decision-rules', 'automation', 'api'],
    estimatedDuration: 25,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(105),
    updated_at: daysAgo(2),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-032',
    title: 'Verify external credit data source integration',
    description: 'Validate that the underwriting engine correctly integrates with external credit data sources for risk assessment.',
    type: 'Test Case',
    assetType: 'API Collection',
    suiteId: 'suite-009',
    application: 'Underwriting Engine',
    segment: 'Underwriting',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Postman/Newman',
    automationScriptPath: '/tests/underwriting/tc-032-credit-integration.postman.json',
    preconditions: ['Credit data mock service is running', 'API credentials are configured', 'Timeout settings are defined'],
    steps: [
      { stepNumber: 1, action: 'Request credit data for applicant with good credit', expectedResult: 'Credit score and history returned', status: 'passed' },
      { stepNumber: 2, action: 'Request credit data for applicant with no credit history', expectedResult: 'Thin file indicator returned', status: 'passed' },
      { stepNumber: 3, action: 'Simulate credit service timeout', expectedResult: 'Graceful fallback with manual review flag', status: 'passed' },
    ],
    expectedResults: 'Credit data integration works correctly for all scenarios including error handling.',
    actualResults: 'All scenarios passed. Timeout fallback triggered manual review flag correctly.',
    testData: { goodCreditSSN: 'XXX-XX-1234', noCreditSSN: 'XXX-XX-5678', timeoutMs: 5000 },
    coverage: {
      requirements: ['REQ-UW-010'],
      features: ['feat-023'],
      stories: ['story-034'],
      coveragePercentage: 90,
    },
    executionHistory: [
      { executionId: 'exec-066', date: daysAgo(3), status: 'passed', duration: 30, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-067', date: daysAgo(15), status: 'passed', duration: 35, environment: 'staging', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(16),
    tags: ['underwriting', 'credit', 'integration', 'external-service'],
    estimatedDuration: 35,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(100),
    updated_at: daysAgo(3),
    created_by: 'user-005',
    updated_by: 'user-005',
  },

  // Compliance Dashboard Smoke Suite (suite-010)
  {
    id: 'tc-033',
    title: 'Verify compliance dashboard loads with real-time monitoring widgets',
    description: 'Validate that the compliance dashboard loads correctly with all real-time monitoring widgets displaying current data.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-010',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/compliance/tc-033-dashboard-load.spec.js',
    preconditions: ['Compliance dashboard is deployed', 'Monitoring data feeds are active', 'User has compliance viewer role'],
    steps: [
      { stepNumber: 1, action: 'Navigate to compliance dashboard', expectedResult: 'Dashboard loads within 3 seconds', status: 'passed' },
      { stepNumber: 2, action: 'Verify compliance score widget displays current score', expectedResult: 'Score is displayed with trend indicator', status: 'passed' },
      { stepNumber: 3, action: 'Verify regulatory alerts widget shows active alerts', expectedResult: 'Active alerts are listed with severity', status: 'passed' },
      { stepNumber: 4, action: 'Verify compliance trend chart renders', expectedResult: 'Chart displays 12-month trend data', status: 'passed' },
    ],
    expectedResults: 'Compliance dashboard loads with all widgets displaying current and accurate data.',
    actualResults: 'Dashboard loaded in 1.8 seconds. All 4 widgets rendered with current data.',
    testData: { expectedWidgets: 4, loadTimeThresholdMs: 3000 },
    coverage: {
      requirements: ['REQ-CMP-001', 'REQ-CMP-002'],
      features: ['feat-025'],
      stories: ['story-036'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-068', date: daysAgo(1), status: 'passed', duration: 12, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-069', date: daysAgo(7), status: 'passed', duration: 14, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-070', date: daysAgo(14), status: 'passed', duration: 13, environment: 'uat', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(8),
    tags: ['compliance', 'dashboard', 'smoke', 'monitoring'],
    estimatedDuration: 15,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(100),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-034',
    title: 'Verify compliance alert notification system',
    description: 'Validate that compliance alerts are generated and notifications are sent when compliance thresholds are breached.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-010',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    priority: 'p1',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/compliance/tc-034-alert-notifications.spec.js',
    preconditions: ['Alert rules are configured', 'Notification service is running', 'Test compliance data can trigger alerts'],
    steps: [
      { stepNumber: 1, action: 'Simulate compliance score dropping below threshold', expectedResult: 'Alert is generated in the system', status: 'passed' },
      { stepNumber: 2, action: 'Verify alert appears on dashboard', expectedResult: 'Alert is displayed with severity and details', status: 'passed' },
      { stepNumber: 3, action: 'Verify notification is sent to configured recipients', expectedResult: 'Email notification received by compliance team', status: 'passed' },
      { stepNumber: 4, action: 'Acknowledge the alert', expectedResult: 'Alert status changes to Acknowledged', status: 'passed' },
    ],
    expectedResults: 'Compliance alerts are generated, displayed, and notified correctly when thresholds are breached.',
    actualResults: 'Alert generated within 30 seconds of threshold breach. Notification sent. Acknowledgment recorded.',
    testData: { complianceThreshold: 85, simulatedScore: 78 },
    coverage: {
      requirements: ['REQ-CMP-005', 'REQ-CMP-006'],
      features: ['feat-025'],
      stories: ['story-037'],
      coveragePercentage: 100,
    },
    executionHistory: [
      { executionId: 'exec-071', date: daysAgo(1), status: 'passed', duration: 25, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-072', date: daysAgo(8), status: 'passed', duration: 28, environment: 'staging', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(6),
    tags: ['compliance', 'alerts', 'notifications', 'monitoring'],
    estimatedDuration: 30,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(95),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'tc-035',
    title: 'Verify regulatory report generation and export',
    description: 'Validate that regulatory compliance reports can be generated and exported in required formats.',
    type: 'Test Case',
    assetType: 'Test Case',
    suiteId: 'suite-010',
    application: 'Compliance Dashboard',
    segment: 'Regulatory Compliance',
    priority: 'p2',
    severity: 'medium',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Playwright',
    automationScriptPath: '/tests/compliance/tc-035-report-generation.spec.js',
    preconditions: ['Report templates are configured', 'Compliance data is available for reporting period', 'Export functionality is deployed'],
    steps: [
      { stepNumber: 1, action: 'Select regulatory report type and date range', expectedResult: 'Report parameters are accepted', status: 'passed' },
      { stepNumber: 2, action: 'Generate the report', expectedResult: 'Report is generated within 30 seconds', status: 'passed' },
      { stepNumber: 3, action: 'Export report as CSV', expectedResult: 'CSV file is downloaded with correct data', status: 'passed' },
      { stepNumber: 4, action: 'Export report as PDF', expectedResult: 'PDF file is downloaded with proper formatting', status: 'passed' },
    ],
    expectedResults: 'Regulatory reports are generated accurately and exported in CSV and PDF formats.',
    actualResults: 'Report generated in 12 seconds. CSV and PDF exports verified with correct data.',
    testData: { reportType: 'Quarterly Compliance', dateRange: 'Q2 2024' },
    coverage: {
      requirements: ['REQ-CMP-010'],
      features: ['feat-026'],
      stories: ['story-038'],
      coveragePercentage: 95,
    },
    executionHistory: [
      { executionId: 'exec-073', date: daysAgo(1), status: 'passed', duration: 35, environment: 'staging', executedBy: 'user-005' },
      { executionId: 'exec-074', date: daysAgo(10), status: 'passed', duration: 38, environment: 'staging', executedBy: 'user-005' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(5),
    tags: ['compliance', 'reporting', 'export', 'regulatory'],
    estimatedDuration: 40,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(88),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },

  // Additional test cases covering remaining asset types
  {
    id: 'tc-036',
    title: 'Claims Processing Test Plan - Q3 2024',
    description: 'Comprehensive test plan for Claims Processing Q3 2024 release covering functional, integration, and regression testing.',
    type: 'Test Plan',
    assetType: 'Test Plan',
    suiteId: null,
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p1',
    severity: 'high',
    status: 'active',
    automationStatus: 'not_applicable',
    automationFramework: null,
    automationScriptPath: null,
    preconditions: ['Requirements are finalized', 'Test environment is provisioned'],
    steps: [],
    expectedResults: 'Test plan covers all in-scope requirements with defined entry/exit criteria.',
    actualResults: 'Test plan approved. 520 test cases identified. 80% automation target set.',
    testData: null,
    coverage: {
      requirements: ['REQ-CLM-001', 'REQ-CLM-002', 'REQ-CLM-003', 'REQ-CLM-004', 'REQ-CLM-005', 'REQ-CLM-010', 'REQ-CLM-011', 'REQ-CLM-015', 'REQ-CLM-020'],
      features: ['feat-012', 'feat-013', 'feat-014', 'feat-015'],
      stories: ['story-019', 'story-020', 'story-021', 'story-022', 'story-023', 'story-024'],
      coveragePercentage: 100,
    },
    executionHistory: [],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(50),
    tags: ['test-plan', 'claims', 'q3-2024'],
    estimatedDuration: 0,
    environment: null,
    version: 2,
    created_at: daysAgo(60),
    updated_at: daysAgo(5),
    created_by: 'user-003',
    updated_by: 'user-003',
  },
  {
    id: 'tc-037',
    title: 'Payment Gateway Test Script - Refund Processing',
    description: 'Automated test script for payment refund processing including full and partial refunds.',
    type: 'Test Script',
    assetType: 'Test Script',
    suiteId: null,
    application: 'Payment Gateway',
    segment: 'Billing',
    priority: 'p2',
    severity: 'high',
    status: 'passed',
    automationStatus: 'automated',
    automationFramework: 'Cypress',
    automationScriptPath: '/tests/payments/scripts/refund-processing.cy.js',
    preconditions: ['Completed payment exists for refund', 'Refund permissions are granted'],
    steps: [
      { stepNumber: 1, action: 'Initiate full refund for completed payment', expectedResult: 'Refund is processed and original payment reversed', status: 'passed' },
      { stepNumber: 2, action: 'Initiate partial refund for completed payment', expectedResult: 'Partial refund processed with remaining balance', status: 'passed' },
      { stepNumber: 3, action: 'Verify refund appears in transaction history', expectedResult: 'Refund transaction is recorded', status: 'passed' },
    ],
    expectedResults: 'Full and partial refunds are processed correctly with proper transaction records.',
    actualResults: 'Both refund types processed. Transaction history updated correctly.',
    testData: { originalAmount: 200.00, partialRefundAmount: 75.00 },
    coverage: {
      requirements: ['REQ-PAY-020'],
      features: ['feat-005'],
      stories: ['story-008'],
      coveragePercentage: 85,
    },
    executionHistory: [
      { executionId: 'exec-075', date: daysAgo(3), status: 'passed', duration: 45, environment: 'staging', executedBy: 'user-009' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(15),
    tags: ['payments', 'refund', 'test-script', 'automated'],
    estimatedDuration: 50,
    environment: 'staging',
    version: 2,
    created_at: daysAgo(75),
    updated_at: daysAgo(3),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'tc-038',
    title: 'Claims Test Data Generation Configuration',
    description: 'Test data generation configuration for creating realistic claims test data sets.',
    type: 'Test Data',
    assetType: 'Test Data',
    suiteId: null,
    application: 'Claims Processing',
    segment: 'Claims',
    priority: 'p3',
    severity: 'medium',
    status: 'active',
    automationStatus: 'automated',
    automationFramework: 'Custom Script',
    automationScriptPath: '/tests/data/claims-data-generator.js',
    preconditions: ['Test database is accessible', 'Data generation scripts are deployed'],
    steps: [
      { stepNumber: 1, action: 'Configure data generation parameters', expectedResult: 'Parameters accepted (member count, claim types, date range)', status: 'passed' },
      { stepNumber: 2, action: 'Execute data generation', expectedResult: 'Test data created in target database', status: 'passed' },
      { stepNumber: 3, action: 'Validate generated data integrity', expectedResult: 'All referential integrity constraints satisfied', status: 'passed' },
    ],
    expectedResults: 'Realistic test data is generated with proper relationships and data integrity.',
    actualResults: '5,000 member records and 25,000 claims generated with valid relationships.',
    testData: { memberCount: 5000, claimsPerMember: 5 },
    coverage: {
      requirements: [],
      features: [],
      stories: [],
      coveragePercentage: 0,
    },
    executionHistory: [
      { executionId: 'exec-076', date: daysAgo(7), status: 'passed', duration: 300, environment: 'staging', executedBy: 'user-008' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-003',
    approvedAt: daysAgo(30),
    tags: ['test-data', 'claims', 'data-generation'],
    estimatedDuration: 300,
    environment: 'staging',
    version: 3,
    created_at: daysAgo(120),
    updated_at: daysAgo(7),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'tc-039',
    title: 'Provider Directory Mock Service Configuration',
    description: 'Mock service configuration for simulating external provider data sources during testing.',
    type: 'Mock Service',
    assetType: 'Mock Service',
    suiteId: null,
    application: 'Provider Directory',
    segment: 'Provider',
    priority: 'p3',
    severity: 'low',
    status: 'active',
    automationStatus: 'automated',
    automationFramework: 'WireMock',
    automationScriptPath: '/tests/mocks/provider-service-mock.json',
    preconditions: ['WireMock is installed', 'Mock port is available'],
    steps: [
      { stepNumber: 1, action: 'Start mock service with provider data stubs', expectedResult: 'Mock service starts on configured port', status: 'passed' },
      { stepNumber: 2, action: 'Verify mock responds to provider search API', expectedResult: 'Mock returns configured provider data', status: 'passed' },
      { stepNumber: 3, action: 'Verify mock handles error scenarios', expectedResult: 'Mock returns configured error responses', status: 'passed' },
    ],
    expectedResults: 'Mock service correctly simulates external provider data source for all test scenarios.',
    actualResults: 'Mock service running. 15 stubs configured for success and error scenarios.',
    testData: { stubCount: 15, mockPort: 8089 },
    coverage: {
      requirements: [],
      features: ['feat-009', 'feat-010', 'feat-011'],
      stories: [],
      coveragePercentage: 0,
    },
    executionHistory: [
      { executionId: 'exec-077', date: daysAgo(5), status: 'passed', duration: 10, environment: 'development', executedBy: 'user-007' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-004',
    approvedAt: daysAgo(25),
    tags: ['mock-service', 'provider', 'wiremock', 'test-infrastructure'],
    estimatedDuration: 15,
    environment: 'development',
    version: 2,
    created_at: daysAgo(100),
    updated_at: daysAgo(5),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'tc-040',
    title: 'Staging Environment Configuration Validation',
    description: 'Test environment configuration validation to ensure staging environment matches production specifications.',
    type: 'Test Environment Config',
    assetType: 'Test Environment Config',
    suiteId: null,
    application: 'EQIP Core',
    segment: 'Enterprise',
    priority: 'p2',
    severity: 'medium',
    status: 'active',
    automationStatus: 'automated',
    automationFramework: 'Ansible',
    automationScriptPath: '/tests/infra/staging-env-validation.yml',
    preconditions: ['Staging environment is provisioned', 'Configuration management tool is accessible'],
    steps: [
      { stepNumber: 1, action: 'Validate server specifications match requirements', expectedResult: 'CPU, memory, and storage meet minimums', status: 'passed' },
      { stepNumber: 2, action: 'Validate network configuration', expectedResult: 'All required ports are open and accessible', status: 'passed' },
      { stepNumber: 3, action: 'Validate database configuration', expectedResult: 'Database version and settings match production', status: 'passed' },
      { stepNumber: 4, action: 'Validate SSL certificate configuration', expectedResult: 'Valid SSL certificates are installed', status: 'passed' },
    ],
    expectedResults: 'Staging environment configuration matches production specifications.',
    actualResults: 'All configuration checks passed. Environment ready for testing.',
    testData: { environment: 'staging', configChecks: 25 },
    coverage: {
      requirements: ['REQ-ENV-001'],
      features: [],
      stories: [],
      coveragePercentage: 0,
    },
    executionHistory: [
      { executionId: 'exec-078', date: daysAgo(3), status: 'passed', duration: 120, environment: 'staging', executedBy: 'user-010' },
    ],
    defectsLinked: [],
    approvalStatus: 'approved',
    approvedBy: 'user-001',
    approvedAt: daysAgo(20),
    tags: ['environment', 'configuration', 'infrastructure', 'validation'],
    estimatedDuration: 120,
    environment: 'staging',
    version: 4,
    created_at: daysAgo(180),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
];

export default testCases;

/**
 * Get all mock test cases.
 * @returns {Array<object>} Array of test case objects.
 */
export function getAllTestCases() {
  return [...testCases];
}

/**
 * Get all mock test suites.
 * @returns {Array<object>} Array of test suite objects.
 */
export function getAllTestSuites() {
  return [...testSuites];
}

/**
 * Find a test case by ID.
 * @param {string} id - The test case ID to find.
 * @returns {object|null} The test case object, or null if not found.
 */
export function getTestCaseById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return testCases.find((tc) => tc.id === id) || null;
}

/**
 * Find a test suite by ID.
 * @param {string} id - The test suite ID to find.
 * @returns {object|null} The test suite object, or null if not found.
 */
export function getTestSuiteById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return testSuites.find((suite) => suite.id === id) || null;
}

/**
 * Get all test cases for a specific suite.
 * @param {string} suiteId - The suite ID to filter by.
 * @returns {Array<object>} Array of test cases belonging to the suite.
 */
export function getTestCasesBySuiteId(suiteId) {
  if (!suiteId || typeof suiteId !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.suiteId === suiteId);
}

/**
 * Get all test cases for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of test cases for the specified application.
 */
export function getTestCasesByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.application === application);
}

/**
 * Get all test cases for a specific segment.
 * @param {string} segment - The segment to filter by.
 * @returns {Array<object>} Array of test cases for the specified segment.
 */
export function getTestCasesBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.segment === segment);
}

/**
 * Get all test cases with a specific status.
 * @param {string} status - The status to filter by (e.g., 'passed', 'failed', 'in_progress').
 * @returns {Array<object>} Array of test cases with the specified status.
 */
export function getTestCasesByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.status === status);
}

/**
 * Get all test cases with a specific priority.
 * @param {string} priority - The priority to filter by (e.g., 'p1', 'p2', 'p3', 'p4').
 * @returns {Array<object>} Array of test cases with the specified priority.
 */
export function getTestCasesByPriority(priority) {
  if (!priority || typeof priority !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.priority === priority);
}

/**
 * Get all test cases with a specific automation status.
 * @param {string} automationStatus - The automation status to filter by (e.g., 'automated', 'manual', 'in_development').
 * @returns {Array<object>} Array of test cases with the specified automation status.
 */
export function getTestCasesByAutomationStatus(automationStatus) {
  if (!automationStatus || typeof automationStatus !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.automationStatus === automationStatus);
}

/**
 * Get all test cases with a specific asset type.
 * @param {string} assetType - The asset type to filter by (e.g., 'Test Case', 'Performance Script').
 * @returns {Array<object>} Array of test cases with the specified asset type.
 */
export function getTestCasesByAssetType(assetType) {
  if (!assetType || typeof assetType !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.assetType === assetType);
}

/**
 * Get all test suites for a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of test suites for the specified application.
 */
export function getTestSuitesByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return testSuites.filter((suite) => suite.application === application);
}

/**
 * Get distinct asset types from the test case data.
 * @returns {string[]} Array of unique asset type strings.
 */
export function getDistinctAssetTypes() {
  const types = new Set();
  for (let i = 0; i < testCases.length; i++) {
    if (testCases[i].assetType) {
      types.add(testCases[i].assetType);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct applications from the test case data.
 * @returns {string[]} Array of unique application strings.
 */
export function getDistinctApplications() {
  const apps = new Set();
  for (let i = 0; i < testCases.length; i++) {
    if (testCases[i].application) {
      apps.add(testCases[i].application);
    }
  }
  return [...apps].sort();
}

/**
 * Get distinct segments from the test case data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < testCases.length; i++) {
    if (testCases[i].segment) {
      segments.add(testCases[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get a count of test cases grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getTestCaseCountByStatus() {
  const counts = {};
  for (let i = 0; i < testCases.length; i++) {
    const status = testCases[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test cases grouped by automation status.
 * @returns {object} Object with automation status keys and count values.
 */
export function getTestCaseCountByAutomationStatus() {
  const counts = {};
  for (let i = 0; i < testCases.length; i++) {
    const automationStatus = testCases[i].automationStatus;
    counts[automationStatus] = (counts[automationStatus] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test cases grouped by priority.
 * @returns {object} Object with priority keys and count values.
 */
export function getTestCaseCountByPriority() {
  const counts = {};
  for (let i = 0; i < testCases.length; i++) {
    const priority = testCases[i].priority;
    counts[priority] = (counts[priority] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test cases grouped by asset type.
 * @returns {object} Object with asset type keys and count values.
 */
export function getTestCaseCountByAssetType() {
  const counts = {};
  for (let i = 0; i < testCases.length; i++) {
    const assetType = testCases[i].assetType;
    counts[assetType] = (counts[assetType] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the overall pass rate across all test cases.
 * @returns {number} The pass rate percentage, or 0 if no test cases exist.
 */
export function getOverallPassRate() {
  const executable = testCases.filter(
    (tc) => tc.status === 'passed' || tc.status === 'failed',
  );
  if (executable.length === 0) {
    return 0;
  }
  const passed = executable.filter((tc) => tc.status === 'passed').length;
  return Math.round((passed / executable.length) * 10000) / 100;
}

/**
 * Calculate the overall automation coverage across all test cases.
 * @returns {number} The automation coverage percentage, or 0 if no test cases exist.
 */
export function getOverallAutomationCoverage() {
  if (testCases.length === 0) {
    return 0;
  }
  const automated = testCases.filter((tc) => tc.automationStatus === 'automated').length;
  return Math.round((automated / testCases.length) * 10000) / 100;
}

/**
 * Get test cases with linked defects.
 * @returns {Array<object>} Array of test cases that have linked defects.
 */
export function getTestCasesWithDefects() {
  return testCases.filter(
    (tc) => Array.isArray(tc.defectsLinked) && tc.defectsLinked.length > 0,
  );
}

/**
 * Get test cases with a specific approval status.
 * @param {string} approvalStatus - The approval status to filter by (e.g., 'approved', 'pending', 'rejected').
 * @returns {Array<object>} Array of test cases with the specified approval status.
 */
export function getTestCasesByApprovalStatus(approvalStatus) {
  if (!approvalStatus || typeof approvalStatus !== 'string') {
    return [];
  }
  return testCases.filter((tc) => tc.approvalStatus === approvalStatus);
}

/**
 * Find a test case by title (case-insensitive partial match).
 * @param {string} title - The title to search for.
 * @returns {Array<object>} Array of matching test cases.
 */
export function searchTestCasesByTitle(title) {
  if (!title || typeof title !== 'string') {
    return [];
  }
  const titleLower = title.toLowerCase();
  return testCases.filter(
    (tc) => tc.title && tc.title.toLowerCase().includes(titleLower),
  );
}

/**
 * Get the average coverage percentage across all test cases that have coverage data.
 * @returns {number} The average coverage percentage, or 0 if no coverage data exists.
 */
export function getAverageCoveragePercentage() {
  const withCoverage = testCases.filter(
    (tc) =>
      tc.coverage &&
      typeof tc.coverage.coveragePercentage === 'number' &&
      tc.coverage.coveragePercentage > 0,
  );
  if (withCoverage.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < withCoverage.length; i++) {
    total += withCoverage[i].coverage.coveragePercentage;
  }
  return Math.round((total / withCoverage.length) * 100) / 100;
}