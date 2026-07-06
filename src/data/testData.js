import { v4 as uuidv4 } from 'uuid';

/**
 * @module testData
 * Mock test data management seed for eQIP Quality Intelligence.
 * Test data sets with all fields including id, name, type, status, maskingStatus,
 * provisioningStatus, associatedApplications, refreshHistory, and audit fields.
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
 * Mock test data sets array.
 * Each test data set includes id, name, description, type, status, format,
 * maskingStatus, provisioningStatus, associatedApplications, associatedEnvironments,
 * recordCount, sizeBytes, refreshHistory, qualityChecks, owner, segment, tags,
 * version, and audit fields.
 * @type {Array<object>}
 */
const testDataSets = [
  {
    id: 'td-001',
    name: 'Claims Member Base Data',
    description: 'Core member demographic and enrollment data for claims processing test scenarios. Includes 5,000 synthetic member records with realistic demographics.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Claims Processing', 'Claims Analytics', 'EQIP Core'],
    associatedEnvironments: ['DEV-Claims', 'STG-Claims', 'UAT-Claims'],
    recordCount: 5000,
    sizeBytes: 52428800,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'weekly',
    lastRefreshed: daysAgo(3),
    nextRefresh: daysAgo(-4),
    refreshHistory: [
      { id: 'rh-001-01', date: daysAgo(3), status: 'success', duration: 180, recordsProcessed: 5000, triggeredBy: 'user-008', notes: 'Weekly scheduled refresh completed successfully.' },
      { id: 'rh-001-02', date: daysAgo(10), status: 'success', duration: 175, recordsProcessed: 5000, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
      { id: 'rh-001-03', date: daysAgo(17), status: 'success', duration: 190, recordsProcessed: 5000, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
      { id: 'rh-001-04', date: daysAgo(24), status: 'failed', duration: 45, recordsProcessed: 1200, triggeredBy: 'system', notes: 'Refresh failed due to database connection timeout. Retried manually.' },
      { id: 'rh-001-05', date: daysAgo(23), status: 'success', duration: 200, recordsProcessed: 5000, triggeredBy: 'user-008', notes: 'Manual retry after failed automated refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-001-01', name: 'Referential Integrity', status: 'passed', lastRun: daysAgo(3), details: 'All foreign key relationships valid.' },
      { id: 'qc-001-02', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(3), details: 'All SSN, DOB, and address fields confirmed masked.' },
      { id: 'qc-001-03', name: 'Record Count Validation', status: 'passed', lastRun: daysAgo(3), details: 'Expected 5000 records, found 5000.' },
      { id: 'qc-001-04', name: 'Data Distribution Check', status: 'passed', lastRun: daysAgo(3), details: 'Age, gender, and state distributions within expected ranges.' },
    ],
    dependencies: [],
    owner: 'user-008',
    segment: 'Claims',
    tags: ['members', 'demographics', 'synthetic', 'claims', 'core-data'],
    version: 8,
    created_at: daysAgo(365),
    updated_at: daysAgo(3),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'td-002',
    name: 'Claims Transaction Data',
    description: 'Historical claims transaction data for regression and performance testing. Contains 25,000 claim records across multiple claim types and statuses.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Claims Processing', 'Claims Analytics'],
    associatedEnvironments: ['DEV-Claims', 'STG-Claims', 'UAT-Claims', 'PERF-Enterprise'],
    recordCount: 25000,
    sizeBytes: 262144000,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'weekly',
    lastRefreshed: daysAgo(3),
    nextRefresh: daysAgo(-4),
    refreshHistory: [
      { id: 'rh-002-01', date: daysAgo(3), status: 'success', duration: 420, recordsProcessed: 25000, triggeredBy: 'system', notes: 'Weekly scheduled refresh.' },
      { id: 'rh-002-02', date: daysAgo(10), status: 'success', duration: 415, recordsProcessed: 25000, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
      { id: 'rh-002-03', date: daysAgo(17), status: 'success', duration: 430, recordsProcessed: 25000, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-002-01', name: 'Referential Integrity', status: 'passed', lastRun: daysAgo(3), details: 'All member and provider references valid.' },
      { id: 'qc-002-02', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(3), details: 'All PII fields confirmed masked.' },
      { id: 'qc-002-03', name: 'Claim Type Distribution', status: 'passed', lastRun: daysAgo(3), details: 'Medical: 60%, Dental: 20%, Vision: 10%, Pharmacy: 10%.' },
      { id: 'qc-002-04', name: 'Date Range Validation', status: 'passed', lastRun: daysAgo(3), details: 'All service dates within expected 24-month window.' },
    ],
    dependencies: ['td-001'],
    owner: 'user-008',
    segment: 'Claims',
    tags: ['claims', 'transactions', 'synthetic', 'regression', 'performance'],
    version: 6,
    created_at: daysAgo(350),
    updated_at: daysAgo(3),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'td-003',
    name: 'Payment Gateway Test Transactions',
    description: 'Test payment transaction data for payment processing, reconciliation, and multi-currency testing. Includes valid, declined, and error scenario data.',
    type: 'Synthetic',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Payment Gateway', 'Billing Portal'],
    associatedEnvironments: ['DEV-Billing', 'STG-Billing', 'UAT-Billing'],
    recordCount: 10000,
    sizeBytes: 104857600,
    dataClassification: 'restricted',
    retentionPolicy: '60_days',
    refreshSchedule: 'bi-weekly',
    lastRefreshed: daysAgo(5),
    nextRefresh: daysAgo(-9),
    refreshHistory: [
      { id: 'rh-003-01', date: daysAgo(5), status: 'success', duration: 240, recordsProcessed: 10000, triggeredBy: 'user-009', notes: 'Bi-weekly refresh with updated test card numbers.' },
      { id: 'rh-003-02', date: daysAgo(19), status: 'success', duration: 235, recordsProcessed: 10000, triggeredBy: 'system', notes: 'Automated bi-weekly refresh.' },
      { id: 'rh-003-03', date: daysAgo(33), status: 'success', duration: 250, recordsProcessed: 10000, triggeredBy: 'system', notes: 'Automated bi-weekly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-003-01', name: 'Card Number Masking', status: 'passed', lastRun: daysAgo(5), details: 'All card numbers use test ranges (4111-xxxx, 5500-xxxx).' },
      { id: 'qc-003-02', name: 'Currency Distribution', status: 'passed', lastRun: daysAgo(5), details: 'USD: 70%, EUR: 15%, GBP: 10%, CAD: 5%.' },
      { id: 'qc-003-03', name: 'Scenario Coverage', status: 'passed', lastRun: daysAgo(5), details: 'Success: 80%, Declined: 12%, Error: 5%, Timeout: 3%.' },
    ],
    dependencies: [],
    owner: 'user-009',
    segment: 'Billing',
    tags: ['payments', 'transactions', 'synthetic', 'multi-currency', 'billing'],
    version: 5,
    created_at: daysAgo(340),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'td-004',
    name: 'Member Enrollment Test Data',
    description: 'Synthetic member enrollment data for testing enrollment flows, eligibility verification, and dependent enrollment scenarios.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Member Portal', 'Enrollment Engine'],
    associatedEnvironments: ['DEV-Enrollment', 'STG-Enrollment', 'UAT-Enrollment'],
    recordCount: 3000,
    sizeBytes: 31457280,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'weekly',
    lastRefreshed: daysAgo(4),
    nextRefresh: daysAgo(-3),
    refreshHistory: [
      { id: 'rh-004-01', date: daysAgo(4), status: 'success', duration: 150, recordsProcessed: 3000, triggeredBy: 'system', notes: 'Weekly scheduled refresh.' },
      { id: 'rh-004-02', date: daysAgo(11), status: 'success', duration: 145, recordsProcessed: 3000, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
      { id: 'rh-004-03', date: daysAgo(18), status: 'success', duration: 155, recordsProcessed: 3000, triggeredBy: 'user-006', notes: 'Manual refresh for enrollment flow redesign testing.' },
    ],
    qualityChecks: [
      { id: 'qc-004-01', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(4), details: 'All SSN, DOB, and contact fields confirmed masked.' },
      { id: 'qc-004-02', name: 'Plan Coverage Validation', status: 'passed', lastRun: daysAgo(4), details: 'All plan types represented: PPO, HMO, EPO, POS.' },
      { id: 'qc-004-03', name: 'Dependent Relationships', status: 'passed', lastRun: daysAgo(4), details: 'Spouse: 40%, Child: 45%, Domestic Partner: 15%.' },
    ],
    dependencies: [],
    owner: 'user-006',
    segment: 'Enrollment',
    tags: ['enrollment', 'members', 'synthetic', 'eligibility', 'dependents'],
    version: 4,
    created_at: daysAgo(300),
    updated_at: daysAgo(4),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'td-005',
    name: 'Provider Network Directory Data',
    description: 'Provider network data including provider demographics, specialties, credentials, and network tier assignments for directory search testing.',
    type: 'Subset',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'partially_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Provider Directory', 'Credentialing System'],
    associatedEnvironments: ['DEV-Provider', 'STG-Provider', 'UAT-Provider'],
    recordCount: 1200,
    sizeBytes: 15728640,
    dataClassification: 'internal',
    retentionPolicy: '120_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(12),
    nextRefresh: daysAgo(-18),
    refreshHistory: [
      { id: 'rh-005-01', date: daysAgo(12), status: 'success', duration: 90, recordsProcessed: 1200, triggeredBy: 'user-007', notes: 'Monthly refresh with updated provider credentials.' },
      { id: 'rh-005-02', date: daysAgo(42), status: 'success', duration: 85, recordsProcessed: 1150, triggeredBy: 'system', notes: 'Automated monthly refresh. 50 new providers added.' },
      { id: 'rh-005-03', date: daysAgo(72), status: 'success', duration: 80, recordsProcessed: 1100, triggeredBy: 'system', notes: 'Automated monthly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-005-01', name: 'NPI Masking Verification', status: 'warning', lastRun: daysAgo(12), details: 'NPI numbers partially masked. Full masking pending for next refresh.' },
      { id: 'qc-005-02', name: 'Specialty Distribution', status: 'passed', lastRun: daysAgo(12), details: '25 specialties represented across all network tiers.' },
      { id: 'qc-005-03', name: 'Credential Completeness', status: 'passed', lastRun: daysAgo(12), details: '95% of providers have complete credential records.' },
      { id: 'qc-005-04', name: 'Network Tier Assignment', status: 'passed', lastRun: daysAgo(12), details: 'Tier 1: 50%, Tier 2: 35%, Out-of-Network: 15%.' },
    ],
    dependencies: [],
    owner: 'user-007',
    segment: 'Provider',
    tags: ['provider', 'directory', 'subset', 'credentials', 'network-tier'],
    version: 5,
    created_at: daysAgo(320),
    updated_at: daysAgo(12),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'td-006',
    name: 'Formulary Drug Reference Data',
    description: 'Drug formulary reference data including drug names, NDC codes, tier assignments, prior authorization rules, and drug interaction mappings.',
    type: 'Reference',
    status: 'active',
    format: 'CSV',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Rx Platform', 'Formulary Manager'],
    associatedEnvironments: ['DEV-Pharmacy', 'STG-Pharmacy', 'UAT-Pharmacy'],
    recordCount: 8500,
    sizeBytes: 20971520,
    dataClassification: 'internal',
    retentionPolicy: '180_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(8),
    nextRefresh: daysAgo(-22),
    refreshHistory: [
      { id: 'rh-006-01', date: daysAgo(8), status: 'success', duration: 60, recordsProcessed: 8500, triggeredBy: 'user-008', notes: 'Monthly refresh with updated formulary tier assignments.' },
      { id: 'rh-006-02', date: daysAgo(38), status: 'success', duration: 55, recordsProcessed: 8400, triggeredBy: 'system', notes: 'Automated monthly refresh. 100 new drugs added.' },
      { id: 'rh-006-03', date: daysAgo(68), status: 'failed', duration: 20, recordsProcessed: 0, triggeredBy: 'system', notes: 'Refresh failed: source file format changed. Manual intervention required.' },
      { id: 'rh-006-04', date: daysAgo(66), status: 'success', duration: 65, recordsProcessed: 8300, triggeredBy: 'user-008', notes: 'Manual refresh after fixing source file parser.' },
    ],
    qualityChecks: [
      { id: 'qc-006-01', name: 'NDC Code Uniqueness', status: 'passed', lastRun: daysAgo(8), details: 'All 8500 NDC codes are unique.' },
      { id: 'qc-006-02', name: 'Tier Assignment Completeness', status: 'passed', lastRun: daysAgo(8), details: 'All drugs assigned to a formulary tier.' },
      { id: 'qc-006-03', name: 'Drug Interaction Mapping', status: 'warning', lastRun: daysAgo(8), details: '4 interaction mappings flagged for review after last import.' },
    ],
    dependencies: [],
    owner: 'user-008',
    segment: 'Pharmacy',
    tags: ['pharmacy', 'formulary', 'reference', 'drugs', 'interactions'],
    version: 7,
    created_at: daysAgo(310),
    updated_at: daysAgo(8),
    created_by: 'user-008',
    updated_by: 'user-008',
  },
  {
    id: 'td-007',
    name: 'Underwriting Applicant Profiles',
    description: 'Synthetic applicant profile data for underwriting risk scoring and decision rules testing. Includes low, medium, and high risk profiles.',
    type: 'Synthetic',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Underwriting Engine', 'Risk Assessment Tool'],
    associatedEnvironments: ['DEV-Underwriting', 'STG-Underwriting'],
    recordCount: 2000,
    sizeBytes: 20971520,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'bi-weekly',
    lastRefreshed: daysAgo(6),
    nextRefresh: daysAgo(-8),
    refreshHistory: [
      { id: 'rh-007-01', date: daysAgo(6), status: 'success', duration: 120, recordsProcessed: 2000, triggeredBy: 'user-005', notes: 'Bi-weekly refresh with updated risk scoring model v2 profiles.' },
      { id: 'rh-007-02', date: daysAgo(20), status: 'success', duration: 115, recordsProcessed: 2000, triggeredBy: 'system', notes: 'Automated bi-weekly refresh.' },
      { id: 'rh-007-03', date: daysAgo(34), status: 'success', duration: 118, recordsProcessed: 2000, triggeredBy: 'system', notes: 'Automated bi-weekly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-007-01', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(6), details: 'All SSN, DOB, and financial data confirmed masked.' },
      { id: 'qc-007-02', name: 'Risk Profile Distribution', status: 'passed', lastRun: daysAgo(6), details: 'Low: 40%, Medium: 35%, High: 25%.' },
      { id: 'qc-007-03', name: 'Credit Score Range', status: 'passed', lastRun: daysAgo(6), details: 'Credit scores distributed between 300-850 with realistic distribution.' },
    ],
    dependencies: [],
    owner: 'user-005',
    segment: 'Underwriting',
    tags: ['underwriting', 'applicants', 'synthetic', 'risk-scoring', 'profiles'],
    version: 4,
    created_at: daysAgo(280),
    updated_at: daysAgo(6),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'td-008',
    name: 'Policy Administration Test Policies',
    description: 'Test policy data for policy lifecycle management testing including issuance, endorsements, renewals, and cancellations.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Policy Admin System', 'Document Management'],
    associatedEnvironments: ['UAT-PolicyAdmin'],
    recordCount: 4000,
    sizeBytes: 41943040,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(25),
    nextRefresh: daysAgo(-5),
    refreshHistory: [
      { id: 'rh-008-01', date: daysAgo(25), status: 'success', duration: 200, recordsProcessed: 4000, triggeredBy: 'system', notes: 'Monthly scheduled refresh.' },
      { id: 'rh-008-02', date: daysAgo(55), status: 'success', duration: 195, recordsProcessed: 3800, triggeredBy: 'system', notes: 'Automated monthly refresh. 200 new policies added.' },
    ],
    qualityChecks: [
      { id: 'qc-008-01', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(25), details: 'All policyholder PII confirmed masked.' },
      { id: 'qc-008-02', name: 'Policy Status Distribution', status: 'passed', lastRun: daysAgo(25), details: 'Active: 60%, Lapsed: 15%, Cancelled: 10%, Renewed: 15%.' },
      { id: 'qc-008-03', name: 'Date Consistency', status: 'warning', lastRun: daysAgo(25), details: '3 policies have effective dates after expiration dates. Under review.' },
    ],
    dependencies: [],
    owner: 'user-013',
    segment: 'Policy Administration',
    tags: ['policy', 'administration', 'synthetic', 'lifecycle', 'endorsements'],
    version: 3,
    created_at: daysAgo(290),
    updated_at: daysAgo(25),
    created_by: 'user-013',
    updated_by: 'user-013',
  },
  {
    id: 'td-009',
    name: 'Insurance Claims Evidence Data',
    description: 'Test data for insurance claims including photo evidence uploads, document attachments, and OCR processing test files.',
    type: 'Synthetic',
    status: 'active',
    format: 'Mixed',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Insurance Claims Portal', 'Settlement Engine'],
    associatedEnvironments: ['DEV-Claims', 'STG-Claims'],
    recordCount: 1500,
    sizeBytes: 524288000,
    dataClassification: 'confidential',
    retentionPolicy: '60_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(14),
    nextRefresh: daysAgo(-16),
    refreshHistory: [
      { id: 'rh-009-01', date: daysAgo(14), status: 'success', duration: 300, recordsProcessed: 1500, triggeredBy: 'user-019', notes: 'Monthly refresh with new OCR test documents.' },
      { id: 'rh-009-02', date: daysAgo(44), status: 'success', duration: 290, recordsProcessed: 1400, triggeredBy: 'system', notes: 'Automated monthly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-009-01', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(14), details: 'All claimant PII in documents confirmed masked.' },
      { id: 'qc-009-02', name: 'File Format Validation', status: 'passed', lastRun: daysAgo(14), details: 'JPEG: 45%, PNG: 30%, PDF: 20%, TIFF: 5%.' },
      { id: 'qc-009-03', name: 'OCR Readability Score', status: 'passed', lastRun: daysAgo(14), details: 'Average OCR confidence score: 87%.' },
    ],
    dependencies: [],
    owner: 'user-019',
    segment: 'Insurance Claims',
    tags: ['insurance-claims', 'evidence', 'photos', 'ocr', 'documents'],
    version: 3,
    created_at: daysAgo(260),
    updated_at: daysAgo(14),
    created_by: 'user-019',
    updated_by: 'user-019',
  },
  {
    id: 'td-010',
    name: 'Actuarial Modeling Reference Data',
    description: 'Reference data for actuarial modeling and financial projection testing including mortality tables, loss ratios, and reserve factors.',
    type: 'Reference',
    status: 'active',
    format: 'CSV',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Actuarial Platform'],
    associatedEnvironments: ['DEV-Underwriting', 'STG-Underwriting'],
    recordCount: 15000,
    sizeBytes: 10485760,
    dataClassification: 'internal',
    retentionPolicy: '365_days',
    refreshSchedule: 'quarterly',
    lastRefreshed: daysAgo(45),
    nextRefresh: daysAgo(-45),
    refreshHistory: [
      { id: 'rh-010-01', date: daysAgo(45), status: 'success', duration: 45, recordsProcessed: 15000, triggeredBy: 'user-011', notes: 'Quarterly refresh with updated mortality tables.' },
      { id: 'rh-010-02', date: daysAgo(135), status: 'success', duration: 42, recordsProcessed: 14800, triggeredBy: 'system', notes: 'Automated quarterly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-010-01', name: 'Data Completeness', status: 'passed', lastRun: daysAgo(45), details: 'All required actuarial tables present and complete.' },
      { id: 'qc-010-02', name: 'Value Range Validation', status: 'passed', lastRun: daysAgo(45), details: 'All loss ratios and reserve factors within expected ranges.' },
    ],
    dependencies: [],
    owner: 'user-011',
    segment: 'Actuarial',
    tags: ['actuarial', 'reference', 'mortality', 'loss-ratios', 'reserves'],
    version: 2,
    created_at: daysAgo(250),
    updated_at: daysAgo(45),
    created_by: 'user-011',
    updated_by: 'user-011',
  },
  {
    id: 'td-011',
    name: 'Compliance Regulatory Reference Data',
    description: 'Regulatory compliance reference data including HIPAA rules, SOX requirements, state insurance regulations, and CMS guidelines for compliance testing.',
    type: 'Reference',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Compliance Dashboard', 'EQIP Core'],
    associatedEnvironments: ['DEV-EQIP-Core', 'STG-EQIP-Core'],
    recordCount: 500,
    sizeBytes: 5242880,
    dataClassification: 'internal',
    retentionPolicy: '365_days',
    refreshSchedule: 'quarterly',
    lastRefreshed: daysAgo(30),
    nextRefresh: daysAgo(-60),
    refreshHistory: [
      { id: 'rh-011-01', date: daysAgo(30), status: 'success', duration: 30, recordsProcessed: 500, triggeredBy: 'user-001', notes: 'Quarterly refresh with updated regulatory requirements.' },
      { id: 'rh-011-02', date: daysAgo(120), status: 'success', duration: 28, recordsProcessed: 480, triggeredBy: 'system', notes: 'Automated quarterly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-011-01', name: 'Regulation Completeness', status: 'passed', lastRun: daysAgo(30), details: 'All tracked regulations have current rule definitions.' },
      { id: 'qc-011-02', name: 'Cross-Reference Validation', status: 'passed', lastRun: daysAgo(30), details: 'All regulation cross-references are valid.' },
    ],
    dependencies: [],
    owner: 'user-001',
    segment: 'Regulatory Compliance',
    tags: ['compliance', 'regulatory', 'reference', 'hipaa', 'sox'],
    version: 3,
    created_at: daysAgo(240),
    updated_at: daysAgo(30),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'td-012',
    name: 'Performance Load Test Data',
    description: 'Large-scale synthetic data set for performance and load testing across enterprise applications. Includes member, claims, payment, and provider data.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Rx Platform'],
    associatedEnvironments: ['PERF-Enterprise'],
    recordCount: 100000,
    sizeBytes: 1073741824,
    dataClassification: 'confidential',
    retentionPolicy: '30_days',
    refreshSchedule: 'per_release',
    lastRefreshed: daysAgo(5),
    nextRefresh: null,
    refreshHistory: [
      { id: 'rh-012-01', date: daysAgo(5), status: 'success', duration: 1800, recordsProcessed: 100000, triggeredBy: 'user-009', notes: 'Refreshed for Release 2024.06 load testing.' },
      { id: 'rh-012-02', date: daysAgo(30), status: 'success', duration: 1750, recordsProcessed: 100000, triggeredBy: 'user-009', notes: 'Refreshed for Release 2024.05 load testing.' },
      { id: 'rh-012-03', date: daysAgo(60), status: 'failed', duration: 900, recordsProcessed: 45000, triggeredBy: 'system', notes: 'Refresh failed: insufficient disk space on performance environment.' },
      { id: 'rh-012-04', date: daysAgo(58), status: 'success', duration: 1900, recordsProcessed: 100000, triggeredBy: 'user-009', notes: 'Manual retry after disk space cleanup.' },
    ],
    qualityChecks: [
      { id: 'qc-012-01', name: 'Volume Verification', status: 'passed', lastRun: daysAgo(5), details: 'All 100,000 records loaded successfully.' },
      { id: 'qc-012-02', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(5), details: 'All PII fields confirmed masked across all entity types.' },
      { id: 'qc-012-03', name: 'Referential Integrity', status: 'passed', lastRun: daysAgo(5), details: 'All cross-entity references valid.' },
      { id: 'qc-012-04', name: 'Data Distribution', status: 'passed', lastRun: daysAgo(5), details: 'Realistic distribution across all dimensions verified.' },
    ],
    dependencies: ['td-001', 'td-002', 'td-003', 'td-004', 'td-005'],
    owner: 'user-009',
    segment: 'Enterprise',
    tags: ['performance', 'load-test', 'synthetic', 'enterprise', 'large-scale'],
    version: 6,
    created_at: daysAgo(200),
    updated_at: daysAgo(5),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'td-013',
    name: 'Security Scan Test Data',
    description: 'Test data specifically crafted for security testing including XSS payloads, SQL injection patterns, and boundary value data for input validation testing.',
    type: 'Crafted',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    associatedEnvironments: ['SEC-Enterprise'],
    recordCount: 500,
    sizeBytes: 2097152,
    dataClassification: 'internal',
    retentionPolicy: '180_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(3),
    nextRefresh: daysAgo(-27),
    refreshHistory: [
      { id: 'rh-013-01', date: daysAgo(3), status: 'success', duration: 15, recordsProcessed: 500, triggeredBy: 'user-010', notes: 'Monthly refresh with new XSS payload patterns.' },
      { id: 'rh-013-02', date: daysAgo(33), status: 'success', duration: 12, recordsProcessed: 480, triggeredBy: 'user-010', notes: 'Monthly refresh with updated OWASP payloads.' },
    ],
    qualityChecks: [
      { id: 'qc-013-01', name: 'Payload Validity', status: 'passed', lastRun: daysAgo(3), details: 'All 500 security test payloads validated.' },
      { id: 'qc-013-02', name: 'Category Coverage', status: 'passed', lastRun: daysAgo(3), details: 'XSS: 30%, SQLi: 25%, CSRF: 15%, Path Traversal: 10%, Other: 20%.' },
    ],
    dependencies: [],
    owner: 'user-010',
    segment: 'Enterprise',
    tags: ['security', 'xss', 'sql-injection', 'crafted', 'owasp'],
    version: 8,
    created_at: daysAgo(200),
    updated_at: daysAgo(3),
    created_by: 'user-010',
    updated_by: 'user-010',
  },
  {
    id: 'td-014',
    name: 'Accessibility Test Data',
    description: 'Test data for accessibility testing including form data with special characters, long text content, and screen reader test scenarios.',
    type: 'Crafted',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['EQIP Core', 'Member Portal', 'Billing Portal', 'Insurance Claims Portal', 'Compliance Dashboard'],
    associatedEnvironments: ['DEV-EQIP-Core', 'STG-EQIP-Core', 'DEV-Enrollment', 'STG-Enrollment'],
    recordCount: 200,
    sizeBytes: 1048576,
    dataClassification: 'public',
    retentionPolicy: '365_days',
    refreshSchedule: 'quarterly',
    lastRefreshed: daysAgo(20),
    nextRefresh: daysAgo(-70),
    refreshHistory: [
      { id: 'rh-014-01', date: daysAgo(20), status: 'success', duration: 10, recordsProcessed: 200, triggeredBy: 'user-006', notes: 'Quarterly refresh with new WCAG 2.1 test scenarios.' },
      { id: 'rh-014-02', date: daysAgo(110), status: 'success', duration: 8, recordsProcessed: 180, triggeredBy: 'user-006', notes: 'Quarterly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-014-01', name: 'Character Set Coverage', status: 'passed', lastRun: daysAgo(20), details: 'Unicode, RTL, CJK, and special characters all represented.' },
      { id: 'qc-014-02', name: 'Scenario Completeness', status: 'passed', lastRun: daysAgo(20), details: 'All WCAG 2.1 AA test scenarios covered.' },
    ],
    dependencies: [],
    owner: 'user-006',
    segment: 'Enterprise',
    tags: ['accessibility', 'wcag', 'crafted', 'screen-reader', 'special-characters'],
    version: 2,
    created_at: daysAgo(180),
    updated_at: daysAgo(20),
    created_by: 'user-006',
    updated_by: 'user-006',
  },
  {
    id: 'td-015',
    name: 'Batch Claims Processing Volume Data',
    description: 'High-volume batch claims data set for batch processing performance testing. Contains 50,000 claims with various adjudication scenarios.',
    type: 'Synthetic',
    status: 'active',
    format: 'CSV',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Claims Processing'],
    associatedEnvironments: ['PERF-Enterprise', 'STG-Claims'],
    recordCount: 50000,
    sizeBytes: 524288000,
    dataClassification: 'confidential',
    retentionPolicy: '60_days',
    refreshSchedule: 'per_release',
    lastRefreshed: daysAgo(7),
    nextRefresh: null,
    refreshHistory: [
      { id: 'rh-015-01', date: daysAgo(7), status: 'success', duration: 600, recordsProcessed: 50000, triggeredBy: 'user-009', notes: 'Refreshed for batch processing optimization testing.' },
      { id: 'rh-015-02', date: daysAgo(35), status: 'success', duration: 580, recordsProcessed: 50000, triggeredBy: 'user-009', notes: 'Refreshed for Release 2024.10 batch testing.' },
    ],
    qualityChecks: [
      { id: 'qc-015-01', name: 'Volume Verification', status: 'passed', lastRun: daysAgo(7), details: 'All 50,000 claims loaded successfully.' },
      { id: 'qc-015-02', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(7), details: 'All member and provider PII confirmed masked.' },
      { id: 'qc-015-03', name: 'Adjudication Scenario Coverage', status: 'passed', lastRun: daysAgo(7), details: 'Auto-adjudicate: 70%, Manual review: 20%, Deny: 10%.' },
    ],
    dependencies: ['td-001'],
    owner: 'user-009',
    segment: 'Claims',
    tags: ['claims', 'batch', 'performance', 'synthetic', 'high-volume'],
    version: 4,
    created_at: daysAgo(160),
    updated_at: daysAgo(7),
    created_by: 'user-009',
    updated_by: 'user-009',
  },
  {
    id: 'td-016',
    name: 'Payment Reconciliation Bank Settlement Data',
    description: 'Mock bank settlement files for payment reconciliation testing. Includes matched, unmatched, and discrepancy scenarios.',
    type: 'Crafted',
    status: 'active',
    format: 'CSV',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Payment Gateway'],
    associatedEnvironments: ['DEV-Billing', 'STG-Billing'],
    recordCount: 1500,
    sizeBytes: 5242880,
    dataClassification: 'restricted',
    retentionPolicy: '60_days',
    refreshSchedule: 'bi-weekly',
    lastRefreshed: daysAgo(2),
    nextRefresh: daysAgo(-12),
    refreshHistory: [
      { id: 'rh-016-01', date: daysAgo(2), status: 'success', duration: 30, recordsProcessed: 1500, triggeredBy: 'user-020', notes: 'Refreshed with T+1 settlement date scenarios for reconciliation fix testing.' },
      { id: 'rh-016-02', date: daysAgo(16), status: 'success', duration: 28, recordsProcessed: 1500, triggeredBy: 'system', notes: 'Automated bi-weekly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-016-01', name: 'Account Number Masking', status: 'passed', lastRun: daysAgo(2), details: 'All bank account numbers confirmed masked.' },
      { id: 'qc-016-02', name: 'Scenario Coverage', status: 'passed', lastRun: daysAgo(2), details: 'Matched: 85%, Unmatched: 10%, Discrepancy: 5%.' },
      { id: 'qc-016-03', name: 'Settlement Date Accuracy', status: 'passed', lastRun: daysAgo(2), details: 'T+0 and T+1 settlement scenarios properly represented.' },
    ],
    dependencies: ['td-003'],
    owner: 'user-020',
    segment: 'Billing',
    tags: ['payments', 'reconciliation', 'settlement', 'crafted', 'billing'],
    version: 3,
    created_at: daysAgo(140),
    updated_at: daysAgo(2),
    created_by: 'user-020',
    updated_by: 'user-020',
  },
  {
    id: 'td-017',
    name: 'Credentialing Provider Verification Data',
    description: 'Test data for provider credentialing verification workflows including license data, board certifications, and malpractice history.',
    type: 'Synthetic',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'partially_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['Credentialing System'],
    associatedEnvironments: ['DEV-Provider', 'STG-Provider'],
    recordCount: 800,
    sizeBytes: 8388608,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(15),
    nextRefresh: daysAgo(-15),
    refreshHistory: [
      { id: 'rh-017-01', date: daysAgo(15), status: 'success', duration: 60, recordsProcessed: 800, triggeredBy: 'user-007', notes: 'Monthly refresh with updated credential verification data.' },
      { id: 'rh-017-02', date: daysAgo(45), status: 'success', duration: 55, recordsProcessed: 780, triggeredBy: 'system', notes: 'Automated monthly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-017-01', name: 'License Data Completeness', status: 'passed', lastRun: daysAgo(15), details: '98% of providers have complete license records.' },
      { id: 'qc-017-02', name: 'Credential Status Distribution', status: 'passed', lastRun: daysAgo(15), details: 'Active: 75%, Expired: 15%, Pending: 10%.' },
    ],
    dependencies: ['td-005'],
    owner: 'user-007',
    segment: 'Provider',
    tags: ['credentialing', 'provider', 'synthetic', 'verification', 'licenses'],
    version: 3,
    created_at: daysAgo(220),
    updated_at: daysAgo(15),
    created_by: 'user-007',
    updated_by: 'user-007',
  },
  {
    id: 'td-018',
    name: 'EQIP Core Dashboard Widget Data',
    description: 'Pre-computed dashboard widget data for EQIP Core UI testing including quality scores, trend data, and metric summaries.',
    type: 'Synthetic',
    status: 'active',
    format: 'JSON',
    maskingStatus: 'not_applicable',
    provisioningStatus: 'provisioned',
    associatedApplications: ['EQIP Core'],
    associatedEnvironments: ['DEV-EQIP-Core', 'STG-EQIP-Core'],
    recordCount: 350,
    sizeBytes: 2097152,
    dataClassification: 'internal',
    retentionPolicy: '30_days',
    refreshSchedule: 'weekly',
    lastRefreshed: daysAgo(1),
    nextRefresh: daysAgo(-6),
    refreshHistory: [
      { id: 'rh-018-01', date: daysAgo(1), status: 'success', duration: 20, recordsProcessed: 350, triggeredBy: 'user-005', notes: 'Weekly refresh with latest quality metrics.' },
      { id: 'rh-018-02', date: daysAgo(8), status: 'success', duration: 18, recordsProcessed: 350, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
      { id: 'rh-018-03', date: daysAgo(15), status: 'success', duration: 22, recordsProcessed: 350, triggeredBy: 'system', notes: 'Automated weekly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-018-01', name: 'Data Freshness', status: 'passed', lastRun: daysAgo(1), details: 'All widget data within 24-hour freshness threshold.' },
      { id: 'qc-018-02', name: 'Metric Consistency', status: 'passed', lastRun: daysAgo(1), details: 'All computed metrics consistent with source data.' },
    ],
    dependencies: [],
    owner: 'user-005',
    segment: 'Enterprise',
    tags: ['dashboard', 'widgets', 'synthetic', 'metrics', 'eqip-core'],
    version: 10,
    created_at: daysAgo(150),
    updated_at: daysAgo(1),
    created_by: 'user-005',
    updated_by: 'user-005',
  },
  {
    id: 'td-019',
    name: 'Disaster Recovery Verification Data',
    description: 'Minimal verification data set used to validate disaster recovery environment functionality after failover.',
    type: 'Subset',
    status: 'active',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    provisioningStatus: 'provisioned',
    associatedApplications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Rx Platform', 'Compliance Dashboard'],
    associatedEnvironments: ['DR-Enterprise'],
    recordCount: 500,
    sizeBytes: 5242880,
    dataClassification: 'confidential',
    retentionPolicy: '365_days',
    refreshSchedule: 'quarterly',
    lastRefreshed: daysAgo(40),
    nextRefresh: daysAgo(-50),
    refreshHistory: [
      { id: 'rh-019-01', date: daysAgo(40), status: 'success', duration: 45, recordsProcessed: 500, triggeredBy: 'user-017', notes: 'Quarterly refresh aligned with DR test exercise.' },
      { id: 'rh-019-02', date: daysAgo(130), status: 'success', duration: 42, recordsProcessed: 500, triggeredBy: 'user-017', notes: 'Quarterly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-019-01', name: 'Cross-Application Verification', status: 'passed', lastRun: daysAgo(40), details: 'Verification records present for all 6 critical applications.' },
      { id: 'qc-019-02', name: 'PII Masking Verification', status: 'passed', lastRun: daysAgo(40), details: 'All PII fields confirmed masked.' },
    ],
    dependencies: [],
    owner: 'user-017',
    segment: 'Enterprise',
    tags: ['disaster-recovery', 'verification', 'subset', 'critical', 'enterprise'],
    version: 2,
    created_at: daysAgo(330),
    updated_at: daysAgo(40),
    created_by: 'user-017',
    updated_by: 'user-017',
  },
  {
    id: 'td-020',
    name: 'Document Management Test Files',
    description: 'Test document files for document management system testing including PDFs, Word documents, images, and large file uploads.',
    type: 'Crafted',
    status: 'stale',
    format: 'Mixed',
    maskingStatus: 'partially_masked',
    provisioningStatus: 'needs_refresh',
    associatedApplications: ['Document Management', 'Policy Admin System'],
    associatedEnvironments: ['UAT-PolicyAdmin'],
    recordCount: 250,
    sizeBytes: 262144000,
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'monthly',
    lastRefreshed: daysAgo(45),
    nextRefresh: daysAgo(15),
    refreshHistory: [
      { id: 'rh-020-01', date: daysAgo(45), status: 'success', duration: 120, recordsProcessed: 250, triggeredBy: 'system', notes: 'Monthly scheduled refresh.' },
      { id: 'rh-020-02', date: daysAgo(75), status: 'success', duration: 115, recordsProcessed: 250, triggeredBy: 'system', notes: 'Automated monthly refresh.' },
    ],
    qualityChecks: [
      { id: 'qc-020-01', name: 'PII Masking Verification', status: 'warning', lastRun: daysAgo(45), details: 'Some PDF documents may contain unmasked PII in embedded images. Review pending.' },
      { id: 'qc-020-02', name: 'File Format Distribution', status: 'passed', lastRun: daysAgo(45), details: 'PDF: 50%, DOCX: 25%, JPEG: 15%, TIFF: 10%.' },
      { id: 'qc-020-03', name: 'Data Freshness', status: 'failed', lastRun: daysAgo(0), details: 'Data set is 45 days old, exceeding 30-day freshness threshold.' },
    ],
    dependencies: [],
    owner: 'user-014',
    segment: 'Policy Administration',
    tags: ['documents', 'files', 'crafted', 'policy-admin', 'stale'],
    version: 3,
    created_at: daysAgo(200),
    updated_at: daysAgo(45),
    created_by: 'user-014',
    updated_by: 'user-014',
  },
];

export default testDataSets;

/**
 * Get all mock test data sets.
 * @returns {Array<object>} Array of test data set objects.
 */
export function getAllTestDataSets() {
  return [...testDataSets];
}

/**
 * Find a test data set by ID.
 * @param {string} id - The test data set ID to find.
 * @returns {object|null} The test data set object, or null if not found.
 */
export function getTestDataSetById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return testDataSets.find((td) => td.id === id) || null;
}

/**
 * Get all test data sets with a specific type.
 * @param {string} type - The type to filter by (e.g., 'Synthetic', 'Reference', 'Subset', 'Crafted').
 * @returns {Array<object>} Array of test data sets with the specified type.
 */
export function getTestDataSetsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.type === type);
}

/**
 * Get all test data sets with a specific status.
 * @param {string} status - The status to filter by (e.g., 'active', 'stale', 'archived').
 * @returns {Array<object>} Array of test data sets with the specified status.
 */
export function getTestDataSetsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.status === status);
}

/**
 * Get all test data sets with a specific masking status.
 * @param {string} maskingStatus - The masking status to filter by (e.g., 'fully_masked', 'partially_masked', 'not_applicable').
 * @returns {Array<object>} Array of test data sets with the specified masking status.
 */
export function getTestDataSetsByMaskingStatus(maskingStatus) {
  if (!maskingStatus || typeof maskingStatus !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.maskingStatus === maskingStatus);
}

/**
 * Get all test data sets with a specific provisioning status.
 * @param {string} provisioningStatus - The provisioning status to filter by (e.g., 'provisioned', 'needs_refresh', 'pending').
 * @returns {Array<object>} Array of test data sets with the specified provisioning status.
 */
export function getTestDataSetsByProvisioningStatus(provisioningStatus) {
  if (!provisioningStatus || typeof provisioningStatus !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.provisioningStatus === provisioningStatus);
}

/**
 * Get all test data sets associated with a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of test data sets associated with the specified application.
 */
export function getTestDataSetsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return testDataSets.filter(
    (td) =>
      Array.isArray(td.associatedApplications) &&
      td.associatedApplications.includes(application),
  );
}

/**
 * Get all test data sets associated with a specific environment.
 * @param {string} environment - The environment name to filter by.
 * @returns {Array<object>} Array of test data sets associated with the specified environment.
 */
export function getTestDataSetsByEnvironment(environment) {
  if (!environment || typeof environment !== 'string') {
    return [];
  }
  return testDataSets.filter(
    (td) =>
      Array.isArray(td.associatedEnvironments) &&
      td.associatedEnvironments.includes(environment),
  );
}

/**
 * Get all test data sets within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of test data sets within the specified segment.
 */
export function getTestDataSetsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.segment === segment);
}

/**
 * Get all test data sets owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of test data sets owned by the specified user.
 */
export function getTestDataSetsByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.owner === ownerId);
}

/**
 * Get all test data sets with a specific format.
 * @param {string} format - The format to filter by (e.g., 'SQL', 'JSON', 'CSV', 'Mixed').
 * @returns {Array<object>} Array of test data sets with the specified format.
 */
export function getTestDataSetsByFormat(format) {
  if (!format || typeof format !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.format === format);
}

/**
 * Get all test data sets with a specific data classification.
 * @param {string} classification - The data classification to filter by (e.g., 'confidential', 'restricted', 'internal', 'public').
 * @returns {Array<object>} Array of test data sets with the specified classification.
 */
export function getTestDataSetsByClassification(classification) {
  if (!classification || typeof classification !== 'string') {
    return [];
  }
  return testDataSets.filter((td) => td.dataClassification === classification);
}

/**
 * Get all test data sets that have dependencies.
 * @returns {Array<object>} Array of test data sets with non-empty dependencies.
 */
export function getTestDataSetsWithDependencies() {
  return testDataSets.filter(
    (td) => Array.isArray(td.dependencies) && td.dependencies.length > 0,
  );
}

/**
 * Get all test data sets that need a refresh (provisioning status is 'needs_refresh' or data is stale).
 * @returns {Array<object>} Array of test data sets needing refresh.
 */
export function getTestDataSetsNeedingRefresh() {
  return testDataSets.filter(
    (td) =>
      td.provisioningStatus === 'needs_refresh' ||
      td.status === 'stale',
  );
}

/**
 * Get all test data sets with failed quality checks.
 * @returns {Array<object>} Array of test data sets that have at least one failed quality check.
 */
export function getTestDataSetsWithFailedQualityChecks() {
  return testDataSets.filter(
    (td) =>
      Array.isArray(td.qualityChecks) &&
      td.qualityChecks.some((qc) => qc.status === 'failed'),
  );
}

/**
 * Get all test data sets with warning quality checks.
 * @returns {Array<object>} Array of test data sets that have at least one warning quality check.
 */
export function getTestDataSetsWithWarningQualityChecks() {
  return testDataSets.filter(
    (td) =>
      Array.isArray(td.qualityChecks) &&
      td.qualityChecks.some((qc) => qc.status === 'warning'),
  );
}

/**
 * Get distinct types from the test data set data.
 * @returns {string[]} Array of unique type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].type) {
      types.add(testDataSets[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct statuses from the test data set data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].status) {
      statuses.add(testDataSets[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct masking statuses from the test data set data.
 * @returns {string[]} Array of unique masking status strings.
 */
export function getDistinctMaskingStatuses() {
  const statuses = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].maskingStatus) {
      statuses.add(testDataSets[i].maskingStatus);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct provisioning statuses from the test data set data.
 * @returns {string[]} Array of unique provisioning status strings.
 */
export function getDistinctProvisioningStatuses() {
  const statuses = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].provisioningStatus) {
      statuses.add(testDataSets[i].provisioningStatus);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct formats from the test data set data.
 * @returns {string[]} Array of unique format strings.
 */
export function getDistinctFormats() {
  const formats = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].format) {
      formats.add(testDataSets[i].format);
    }
  }
  return [...formats].sort();
}

/**
 * Get distinct segments from the test data set data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].segment) {
      segments.add(testDataSets[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct data classifications from the test data set data.
 * @returns {string[]} Array of unique data classification strings.
 */
export function getDistinctClassifications() {
  const classifications = new Set();
  for (let i = 0; i < testDataSets.length; i++) {
    if (testDataSets[i].dataClassification) {
      classifications.add(testDataSets[i].dataClassification);
    }
  }
  return [...classifications].sort();
}

/**
 * Get a count of test data sets grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getTestDataSetCountByType() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const type = testDataSets[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test data sets grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getTestDataSetCountByStatus() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const status = testDataSets[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test data sets grouped by masking status.
 * @returns {object} Object with masking status keys and count values.
 */
export function getTestDataSetCountByMaskingStatus() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const maskingStatus = testDataSets[i].maskingStatus;
    counts[maskingStatus] = (counts[maskingStatus] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test data sets grouped by provisioning status.
 * @returns {object} Object with provisioning status keys and count values.
 */
export function getTestDataSetCountByProvisioningStatus() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const provisioningStatus = testDataSets[i].provisioningStatus;
    counts[provisioningStatus] = (counts[provisioningStatus] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test data sets grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getTestDataSetCountBySegment() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const segment = testDataSets[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of test data sets grouped by format.
 * @returns {object} Object with format keys and count values.
 */
export function getTestDataSetCountByFormat() {
  const counts = {};
  for (let i = 0; i < testDataSets.length; i++) {
    const format = testDataSets[i].format;
    counts[format] = (counts[format] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the total record count across all test data sets.
 * @returns {number} Total record count.
 */
export function getTotalRecordCount() {
  let total = 0;
  for (let i = 0; i < testDataSets.length; i++) {
    total += testDataSets[i].recordCount || 0;
  }
  return total;
}

/**
 * Calculate the total size in bytes across all test data sets.
 * @returns {number} Total size in bytes.
 */
export function getTotalSizeBytes() {
  let total = 0;
  for (let i = 0; i < testDataSets.length; i++) {
    total += testDataSets[i].sizeBytes || 0;
  }
  return total;
}

/**
 * Get the total number of failed refresh attempts across all test data sets.
 * @returns {number} Total count of failed refresh history entries.
 */
export function getTotalFailedRefreshes() {
  let count = 0;
  for (let i = 0; i < testDataSets.length; i++) {
    if (Array.isArray(testDataSets[i].refreshHistory)) {
      for (let j = 0; j < testDataSets[i].refreshHistory.length; j++) {
        if (testDataSets[i].refreshHistory[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of quality check warnings across all test data sets.
 * @returns {number} Total count of warning quality checks.
 */
export function getTotalQualityCheckWarnings() {
  let count = 0;
  for (let i = 0; i < testDataSets.length; i++) {
    if (Array.isArray(testDataSets[i].qualityChecks)) {
      for (let j = 0; j < testDataSets[i].qualityChecks.length; j++) {
        if (testDataSets[i].qualityChecks[j].status === 'warning') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of quality check failures across all test data sets.
 * @returns {number} Total count of failed quality checks.
 */
export function getTotalQualityCheckFailures() {
  let count = 0;
  for (let i = 0; i < testDataSets.length; i++) {
    if (Array.isArray(testDataSets[i].qualityChecks)) {
      for (let j = 0; j < testDataSets[i].qualityChecks.length; j++) {
        if (testDataSets[i].qualityChecks[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Find a test data set by name (case-insensitive).
 * @param {string} name - The test data set name to search for.
 * @returns {object|null} The test data set object, or null if not found.
 */
export function getTestDataSetByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return testDataSets.find((td) => td.name.toLowerCase() === nameLower) || null;
}

/**
 * Search test data sets by name (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching test data set objects.
 */
export function searchTestDataSetsByName(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return testDataSets.filter(
    (td) => td.name && td.name.toLowerCase().includes(queryLower),
  );
}

/**
 * Get test data sets sorted by size in descending order (largest first).
 * @param {number} [limit] - Optional maximum number of test data sets to return.
 * @returns {Array<object>} Array of test data sets sorted by size.
 */
export function getLargestTestDataSets(limit) {
  const sorted = [...testDataSets].sort((a, b) => (b.sizeBytes || 0) - (a.sizeBytes || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get test data sets sorted by last refreshed date in ascending order (oldest first).
 * @param {number} [limit] - Optional maximum number of test data sets to return.
 * @returns {Array<object>} Array of test data sets sorted by last refreshed date.
 */
export function getOldestRefreshedTestDataSets(limit) {
  const sorted = [...testDataSets].sort((a, b) => {
    const dateA = a.lastRefreshed ? new Date(a.lastRefreshed).getTime() : 0;
    const dateB = b.lastRefreshed ? new Date(b.lastRefreshed).getTime() : 0;
    if (isNaN(dateA) && isNaN(dateB)) return 0;
    if (isNaN(dateA)) return -1;
    if (isNaN(dateB)) return 1;
    return dateA - dateB;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of test data management metrics.
 * @returns {object} Summary object with test data metrics.
 */
export function getTestDataSummary() {
  const total = testDataSets.length;
  let active = 0;
  let stale = 0;
  let totalRecords = 0;
  let totalSize = 0;
  let fullyMasked = 0;
  let partiallyMasked = 0;
  let notApplicable = 0;
  let provisioned = 0;
  let needsRefresh = 0;
  let qualityWarnings = 0;
  let qualityFailures = 0;
  let failedRefreshes = 0;

  for (let i = 0; i < testDataSets.length; i++) {
    const td = testDataSets[i];
    totalRecords += td.recordCount || 0;
    totalSize += td.sizeBytes || 0;

    if (td.status === 'active') active += 1;
    else if (td.status === 'stale') stale += 1;

    if (td.maskingStatus === 'fully_masked') fullyMasked += 1;
    else if (td.maskingStatus === 'partially_masked') partiallyMasked += 1;
    else if (td.maskingStatus === 'not_applicable') notApplicable += 1;

    if (td.provisioningStatus === 'provisioned') provisioned += 1;
    else if (td.provisioningStatus === 'needs_refresh') needsRefresh += 1;

    if (Array.isArray(td.qualityChecks)) {
      for (let j = 0; j < td.qualityChecks.length; j++) {
        if (td.qualityChecks[j].status === 'warning') qualityWarnings += 1;
        if (td.qualityChecks[j].status === 'failed') qualityFailures += 1;
      }
    }

    if (Array.isArray(td.refreshHistory)) {
      for (let j = 0; j < td.refreshHistory.length; j++) {
        if (td.refreshHistory[j].status === 'failed') failedRefreshes += 1;
      }
    }
  }

  return {
    total,
    active,
    stale,
    totalRecords,
    totalSizeBytes: totalSize,
    totalSizeGB: Math.round((totalSize / (1024 * 1024 * 1024)) * 100) / 100,
    fullyMasked,
    partiallyMasked,
    maskingNotApplicable: notApplicable,
    provisioned,
    needsRefresh,
    qualityWarnings,
    qualityFailures,
    failedRefreshes,
  };
}