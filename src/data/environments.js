import { v4 as uuidv4 } from 'uuid';

/**
 * @module environments
 * Mock environment data seed for eQIP Quality Intelligence.
 * Environment inventory with all PRD-specified fields including id, name, type,
 * status, applications, reservations, readinessStatus, conflictFlags, and audit fields.
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
 * Mock environment data array.
 * Each environment includes id, name, type, status, description, url, applications,
 * reservations, readinessStatus, conflictFlags, healthChecks, capacity, owner,
 * segment, tags, version, and audit fields.
 * @type {Array<object>}
 */
const environments = [
  {
    id: 'env-001',
    name: 'DEV-Claims',
    type: 'development',
    status: 'active',
    description: 'Development environment for Claims Processing and Claims Analytics applications.',
    url: 'https://dev.claims.internal',
    applications: ['Claims Processing', 'Claims Analytics'],
    segment: 'Claims',
    reservations: [
      { id: 'res-001', userId: 'user-008', userName: 'A*******r', purpose: 'Automation script development', startDate: daysAgo(2), endDate: daysAgo(-5), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 98,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-001', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 45 },
      { id: 'hc-002', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 120 },
      { id: 'hc-003', name: 'Message Queue', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 30 },
    ],
    capacity: {
      cpu: { used: 35, total: 100, unit: '%' },
      memory: { used: 48, total: 100, unit: '%' },
      storage: { used: 120, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(1),
    lastDataRefresh: daysAgo(3),
    configVersion: '2024.06-rc3',
    owner: 'user-008',
    tags: ['development', 'claims', 'automation'],
    version: 5,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-008',
  },
  {
    id: 'env-002',
    name: 'DEV-Billing',
    type: 'development',
    status: 'active',
    description: 'Development environment for Payment Gateway and Billing Portal applications.',
    url: 'https://dev.billing.internal',
    applications: ['Payment Gateway', 'Billing Portal'],
    segment: 'Billing',
    reservations: [
      { id: 'res-002', userId: 'user-020', userName: 'S*******r', purpose: 'Payment reconciliation module development', startDate: daysAgo(3), endDate: daysAgo(-4), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 96,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-004', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 52 },
      { id: 'hc-005', name: 'Payment Processor Sandbox', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 210 },
      { id: 'hc-006', name: 'Redis Cache', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 8 },
    ],
    capacity: {
      cpu: { used: 42, total: 100, unit: '%' },
      memory: { used: 55, total: 100, unit: '%' },
      storage: { used: 85, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(1),
    lastDataRefresh: daysAgo(5),
    configVersion: '2024.07-rc2',
    owner: 'user-020',
    tags: ['development', 'billing', 'payments'],
    version: 4,
    created_at: daysAgo(350),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-020',
  },
  {
    id: 'env-003',
    name: 'DEV-Enrollment',
    type: 'development',
    status: 'active',
    description: 'Development environment for Member Portal and Enrollment Engine applications.',
    url: 'https://dev.enrollment.internal',
    applications: ['Member Portal', 'Enrollment Engine'],
    segment: 'Enrollment',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 99,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-007', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 38 },
      { id: 'hc-008', name: 'Eligibility Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 95 },
    ],
    capacity: {
      cpu: { used: 28, total: 100, unit: '%' },
      memory: { used: 40, total: 100, unit: '%' },
      storage: { used: 65, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(1),
    lastDataRefresh: daysAgo(4),
    configVersion: '2024.08-rc2',
    owner: 'user-006',
    tags: ['development', 'enrollment', 'member-portal'],
    version: 3,
    created_at: daysAgo(340),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-006',
  },
  {
    id: 'env-004',
    name: 'DEV-Provider',
    type: 'development',
    status: 'active',
    description: 'Development environment for Provider Directory and Credentialing System applications.',
    url: 'https://dev.provider.internal',
    applications: ['Provider Directory', 'Credentialing System'],
    segment: 'Provider',
    reservations: [
      { id: 'res-003', userId: 'user-007', userName: 'J*******r', purpose: 'Batch sync implementation', startDate: daysAgo(1), endDate: daysAgo(-7), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 94,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-009', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 55 },
      { id: 'hc-010', name: 'Elasticsearch', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 78 },
      { id: 'hc-011', name: 'Credentialing API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 145 },
    ],
    capacity: {
      cpu: { used: 38, total: 100, unit: '%' },
      memory: { used: 52, total: 100, unit: '%' },
      storage: { used: 110, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(1),
    lastDataRefresh: daysAgo(3),
    configVersion: '2024.09-rc2',
    owner: 'user-007',
    tags: ['development', 'provider', 'credentialing'],
    version: 6,
    created_at: daysAgo(330),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-007',
  },
  {
    id: 'env-005',
    name: 'DEV-Pharmacy',
    type: 'development',
    status: 'active',
    description: 'Development environment for Rx Platform and Formulary Manager applications.',
    url: 'https://dev.pharmacy.internal',
    applications: ['Rx Platform', 'Formulary Manager'],
    segment: 'Pharmacy',
    reservations: [
      { id: 'res-004', userId: 'user-008', userName: 'A*******r', purpose: 'Drug interaction validation rules', startDate: daysAgo(1), endDate: daysAgo(-3), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 97,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-012', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 42 },
      { id: 'hc-013', name: 'Kafka Broker', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 25 },
      { id: 'hc-014', name: 'Formulary API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 110 },
    ],
    capacity: {
      cpu: { used: 30, total: 100, unit: '%' },
      memory: { used: 45, total: 100, unit: '%' },
      storage: { used: 95, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(2),
    lastDataRefresh: daysAgo(5),
    configVersion: '2024.11-rc1',
    owner: 'user-008',
    tags: ['development', 'pharmacy', 'formulary'],
    version: 3,
    created_at: daysAgo(320),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-008',
  },
  {
    id: 'env-006',
    name: 'STG-Claims',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Claims Processing and Claims Analytics integration testing.',
    url: 'https://staging.claims.internal',
    applications: ['Claims Processing', 'Claims Analytics'],
    segment: 'Claims',
    reservations: [
      { id: 'res-005', userId: 'user-005', userName: 'S*******r', purpose: 'Regression test execution', startDate: daysAgo(1), endDate: daysAgo(-2), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 95,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-015', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 48 },
      { id: 'hc-016', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 135 },
      { id: 'hc-017', name: 'Message Queue', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 28 },
      { id: 'hc-018', name: 'External Service Mock', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 65 },
    ],
    capacity: {
      cpu: { used: 55, total: 100, unit: '%' },
      memory: { used: 62, total: 100, unit: '%' },
      storage: { used: 200, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(3),
    lastDataRefresh: daysAgo(7),
    configVersion: '2024.06-rc3',
    owner: 'user-005',
    tags: ['staging', 'claims', 'integration'],
    version: 8,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'env-007',
    name: 'STG-Billing',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Payment Gateway and Billing Portal integration testing.',
    url: 'https://staging.billing.internal',
    applications: ['Payment Gateway', 'Billing Portal'],
    segment: 'Billing',
    reservations: [
      { id: 'res-006', userId: 'user-009', userName: 'P*******r', purpose: 'Payment reconciliation testing', startDate: daysAgo(0), endDate: daysAgo(-3), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 93,
    },
    conflictFlags: [
      { id: 'cf-001', type: 'schedule_overlap', description: 'Performance testing scheduled during regression window', severity: 'medium', raisedBy: 'user-009', raisedAt: daysAgo(1), status: 'open' },
    ],
    healthChecks: [
      { id: 'hc-019', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 50 },
      { id: 'hc-020', name: 'Payment Processor Sandbox', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 225 },
      { id: 'hc-021', name: 'Redis Cache', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 12 },
    ],
    capacity: {
      cpu: { used: 60, total: 100, unit: '%' },
      memory: { used: 68, total: 100, unit: '%' },
      storage: { used: 180, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(4),
    lastDataRefresh: daysAgo(6),
    configVersion: '2024.07-rc2',
    owner: 'user-009',
    tags: ['staging', 'billing', 'payments', 'integration'],
    version: 7,
    created_at: daysAgo(350),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'env-008',
    name: 'STG-Enrollment',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Member Portal and Enrollment Engine integration testing.',
    url: 'https://staging.enrollment.internal',
    applications: ['Member Portal', 'Enrollment Engine'],
    segment: 'Enrollment',
    reservations: [
      { id: 'res-007', userId: 'user-006', userName: 'Q*******e', purpose: 'Enrollment flow regression testing', startDate: daysAgo(2), endDate: daysAgo(-3), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 97,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-022', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 40 },
      { id: 'hc-023', name: 'Eligibility Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 88 },
      { id: 'hc-024', name: 'Notification Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 55 },
    ],
    capacity: {
      cpu: { used: 40, total: 100, unit: '%' },
      memory: { used: 50, total: 100, unit: '%' },
      storage: { used: 140, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(4),
    lastDataRefresh: daysAgo(8),
    configVersion: '2024.08-rc2',
    owner: 'user-006',
    tags: ['staging', 'enrollment', 'member-portal'],
    version: 4,
    created_at: daysAgo(340),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-006',
  },
  {
    id: 'env-009',
    name: 'STG-Provider',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Provider Directory and Credentialing System integration testing.',
    url: 'https://staging.provider.internal',
    applications: ['Provider Directory', 'Credentialing System'],
    segment: 'Provider',
    reservations: [
      { id: 'res-008', userId: 'user-007', userName: 'J*******r', purpose: 'Provider sync testing', startDate: daysAgo(0), endDate: daysAgo(-5), status: 'active' },
    ],
    readinessStatus: {
      overall: 'degraded',
      database: 'healthy',
      services: 'degraded',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 72,
    },
    conflictFlags: [
      { id: 'cf-002', type: 'data_drift', description: 'Staging database schema is 1 migration behind development', severity: 'high', raisedBy: 'user-007', raisedAt: daysAgo(3), status: 'open' },
      { id: 'cf-003', type: 'service_degradation', description: 'Elasticsearch index rebuild in progress causing slow search responses', severity: 'medium', raisedBy: 'user-007', raisedAt: daysAgo(1), status: 'in_progress' },
    ],
    healthChecks: [
      { id: 'hc-025', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 58 },
      { id: 'hc-026', name: 'Elasticsearch', status: 'warning', lastRun: daysAgo(0), responseTimeMs: 3200 },
      { id: 'hc-027', name: 'Credentialing API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 160 },
    ],
    capacity: {
      cpu: { used: 72, total: 100, unit: '%' },
      memory: { used: 78, total: 100, unit: '%' },
      storage: { used: 280, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(5),
    lastDataRefresh: daysAgo(12),
    configVersion: '2024.09-rc1',
    owner: 'user-007',
    tags: ['staging', 'provider', 'degraded'],
    version: 9,
    created_at: daysAgo(330),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-007',
  },
  {
    id: 'env-010',
    name: 'STG-Pharmacy',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Rx Platform and Formulary Manager integration testing.',
    url: 'https://staging.pharmacy.internal',
    applications: ['Rx Platform', 'Formulary Manager'],
    segment: 'Pharmacy',
    reservations: [
      { id: 'res-009', userId: 'user-008', userName: 'A*******r', purpose: 'Drug interaction alert testing', startDate: daysAgo(1), endDate: daysAgo(-4), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 95,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-028', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 44 },
      { id: 'hc-029', name: 'Kafka Broker', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 22 },
      { id: 'hc-030', name: 'Formulary API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 105 },
    ],
    capacity: {
      cpu: { used: 48, total: 100, unit: '%' },
      memory: { used: 58, total: 100, unit: '%' },
      storage: { used: 160, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(5),
    lastDataRefresh: daysAgo(8),
    configVersion: '2024.11-rc1',
    owner: 'user-008',
    tags: ['staging', 'pharmacy', 'formulary'],
    version: 5,
    created_at: daysAgo(320),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-008',
  },
  {
    id: 'env-011',
    name: 'UAT-Claims',
    type: 'uat',
    status: 'active',
    description: 'User acceptance testing environment for Claims Processing and Claims Analytics.',
    url: 'https://uat.claims.internal',
    applications: ['Claims Processing', 'Claims Analytics'],
    segment: 'Claims',
    reservations: [
      { id: 'res-010', userId: 'user-022', userName: 'B*******t', purpose: 'UAT sign-off testing', startDate: daysAgo(5), endDate: daysAgo(-2), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 96,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-031', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 50 },
      { id: 'hc-032', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 140 },
    ],
    capacity: {
      cpu: { used: 35, total: 100, unit: '%' },
      memory: { used: 48, total: 100, unit: '%' },
      storage: { used: 220, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(7),
    lastDataRefresh: daysAgo(10),
    configVersion: '2024.06-rc3',
    owner: 'user-022',
    tags: ['uat', 'claims', 'acceptance'],
    version: 4,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-022',
  },
  {
    id: 'env-012',
    name: 'UAT-Billing',
    type: 'uat',
    status: 'active',
    description: 'User acceptance testing environment for Payment Gateway and Billing Portal.',
    url: 'https://uat.billing.internal',
    applications: ['Payment Gateway', 'Billing Portal'],
    segment: 'Billing',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 91,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-033', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 55 },
      { id: 'hc-034', name: 'Payment Processor Sandbox', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 240 },
    ],
    capacity: {
      cpu: { used: 25, total: 100, unit: '%' },
      memory: { used: 38, total: 100, unit: '%' },
      storage: { used: 150, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(9),
    lastDataRefresh: daysAgo(12),
    configVersion: '2024.07-rc1',
    owner: 'user-013',
    tags: ['uat', 'billing', 'acceptance'],
    version: 3,
    created_at: daysAgo(350),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'env-013',
    name: 'UAT-Enrollment',
    type: 'uat',
    status: 'active',
    description: 'User acceptance testing environment for Member Portal and Enrollment Engine.',
    url: 'https://uat.enrollment.internal',
    applications: ['Member Portal', 'Enrollment Engine'],
    segment: 'Enrollment',
    reservations: [
      { id: 'res-011', userId: 'user-023', userName: 'P*******r', purpose: 'Enrollment flow UAT', startDate: daysAgo(3), endDate: daysAgo(-4), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 94,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-035', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 42 },
      { id: 'hc-036', name: 'Eligibility Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 92 },
    ],
    capacity: {
      cpu: { used: 30, total: 100, unit: '%' },
      memory: { used: 42, total: 100, unit: '%' },
      storage: { used: 130, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(8),
    lastDataRefresh: daysAgo(10),
    configVersion: '2024.08-rc1',
    owner: 'user-023',
    tags: ['uat', 'enrollment', 'acceptance'],
    version: 3,
    created_at: daysAgo(340),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-023',
  },
  {
    id: 'env-014',
    name: 'UAT-Provider',
    type: 'uat',
    status: 'degraded',
    description: 'User acceptance testing environment for Provider Directory and Credentialing System.',
    url: 'https://uat.provider.internal',
    applications: ['Provider Directory', 'Credentialing System'],
    segment: 'Provider',
    reservations: [],
    readinessStatus: {
      overall: 'degraded',
      database: 'degraded',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 65,
    },
    conflictFlags: [
      { id: 'cf-004', type: 'version_drift', description: 'UAT database schema is 2 versions behind production', severity: 'high', raisedBy: 'user-003', raisedAt: daysAgo(12), status: 'open' },
      { id: 'cf-005', type: 'data_staleness', description: 'Test data has not been refreshed in 20 days', severity: 'medium', raisedBy: 'user-007', raisedAt: daysAgo(8), status: 'open' },
    ],
    healthChecks: [
      { id: 'hc-037', name: 'Database Connectivity', status: 'warning', lastRun: daysAgo(0), responseTimeMs: 1800 },
      { id: 'hc-038', name: 'Elasticsearch', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 250 },
      { id: 'hc-039', name: 'Credentialing API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 180 },
    ],
    capacity: {
      cpu: { used: 45, total: 100, unit: '%' },
      memory: { used: 65, total: 100, unit: '%' },
      storage: { used: 310, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(12),
    lastDataRefresh: daysAgo(20),
    configVersion: '2024.08-rc2',
    owner: 'user-011',
    tags: ['uat', 'provider', 'degraded', 'needs-attention'],
    version: 5,
    created_at: daysAgo(330),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'env-015',
    name: 'PERF-Enterprise',
    type: 'performance',
    status: 'active',
    description: 'Dedicated performance and load testing environment for enterprise-wide applications.',
    url: 'https://perf.eqip.internal',
    applications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Rx Platform'],
    segment: 'Enterprise',
    reservations: [
      { id: 'res-012', userId: 'user-009', userName: 'P*******r', purpose: 'Load testing for Release 2024.06', startDate: daysAgo(3), endDate: daysAgo(-4), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 98,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-040', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 35 },
      { id: 'hc-041', name: 'Load Generator', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 15 },
      { id: 'hc-042', name: 'Monitoring Stack', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 45 },
      { id: 'hc-043', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 80 },
    ],
    capacity: {
      cpu: { used: 20, total: 100, unit: '%' },
      memory: { used: 30, total: 100, unit: '%' },
      storage: { used: 350, total: 1000, unit: 'GB' },
    },
    lastDeployment: daysAgo(5),
    lastDataRefresh: daysAgo(5),
    configVersion: '2024.06-rc3',
    owner: 'user-009',
    tags: ['performance', 'load-testing', 'enterprise'],
    version: 6,
    created_at: daysAgo(300),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-009',
  },
  {
    id: 'env-016',
    name: 'SEC-Enterprise',
    type: 'security',
    status: 'active',
    description: 'Dedicated security testing environment for vulnerability scanning and penetration testing.',
    url: 'https://sec.eqip.internal',
    applications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    segment: 'Enterprise',
    reservations: [
      { id: 'res-013', userId: 'user-010', userName: 'S*******r', purpose: 'OWASP security scan execution', startDate: daysAgo(2), endDate: daysAgo(-5), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 99,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-044', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 38 },
      { id: 'hc-045', name: 'OWASP ZAP Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 120 },
      { id: 'hc-046', name: 'Veracode Agent', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 200 },
    ],
    capacity: {
      cpu: { used: 15, total: 100, unit: '%' },
      memory: { used: 25, total: 100, unit: '%' },
      storage: { used: 180, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(3),
    lastDataRefresh: daysAgo(3),
    configVersion: '2024.06-rc3',
    owner: 'user-010',
    tags: ['security', 'vulnerability-scan', 'penetration-testing'],
    version: 8,
    created_at: daysAgo(280),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'env-017',
    name: 'PROD-Claims',
    type: 'production',
    status: 'active',
    description: 'Production environment for Claims Processing and Claims Analytics.',
    url: 'https://claims.internal',
    applications: ['Claims Processing', 'Claims Analytics'],
    segment: 'Claims',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 100,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-047', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 25 },
      { id: 'hc-048', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 85 },
      { id: 'hc-049', name: 'Message Queue', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 18 },
      { id: 'hc-050', name: 'CDN', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 12 },
    ],
    capacity: {
      cpu: { used: 45, total: 100, unit: '%' },
      memory: { used: 58, total: 100, unit: '%' },
      storage: { used: 680, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(14),
    lastDataRefresh: null,
    configVersion: '2024.05.1',
    owner: 'user-017',
    tags: ['production', 'claims', 'critical'],
    version: 12,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-018',
    name: 'PROD-Billing',
    type: 'production',
    status: 'active',
    description: 'Production environment for Payment Gateway and Billing Portal.',
    url: 'https://billing.internal',
    applications: ['Payment Gateway', 'Billing Portal'],
    segment: 'Billing',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 100,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-051', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 22 },
      { id: 'hc-052', name: 'Payment Processor', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 180 },
      { id: 'hc-053', name: 'Redis Cache', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 5 },
    ],
    capacity: {
      cpu: { used: 50, total: 100, unit: '%' },
      memory: { used: 62, total: 100, unit: '%' },
      storage: { used: 520, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(25),
    lastDataRefresh: null,
    configVersion: '2024.04.2',
    owner: 'user-017',
    tags: ['production', 'billing', 'critical'],
    version: 10,
    created_at: daysAgo(350),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-019',
    name: 'PROD-Enrollment',
    type: 'production',
    status: 'active',
    description: 'Production environment for Member Portal and Enrollment Engine.',
    url: 'https://enrollment.internal',
    applications: ['Member Portal', 'Enrollment Engine'],
    segment: 'Enrollment',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 100,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-054', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 28 },
      { id: 'hc-055', name: 'Eligibility Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 75 },
      { id: 'hc-056', name: 'Notification Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 40 },
    ],
    capacity: {
      cpu: { used: 38, total: 100, unit: '%' },
      memory: { used: 50, total: 100, unit: '%' },
      storage: { used: 420, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(18),
    lastDataRefresh: null,
    configVersion: '2024.05.0',
    owner: 'user-017',
    tags: ['production', 'enrollment', 'critical'],
    version: 8,
    created_at: daysAgo(340),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-020',
    name: 'PROD-Provider',
    type: 'production',
    status: 'active',
    description: 'Production environment for Provider Directory and Credentialing System.',
    url: 'https://provider.internal',
    applications: ['Provider Directory', 'Credentialing System'],
    segment: 'Provider',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 98,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-057', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 30 },
      { id: 'hc-058', name: 'Elasticsearch', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 65 },
      { id: 'hc-059', name: 'Credentialing API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 120 },
    ],
    capacity: {
      cpu: { used: 42, total: 100, unit: '%' },
      memory: { used: 55, total: 100, unit: '%' },
      storage: { used: 380, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(40),
    lastDataRefresh: null,
    configVersion: '2024.03.1',
    owner: 'user-017',
    tags: ['production', 'provider', 'critical'],
    version: 7,
    created_at: daysAgo(330),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-021',
    name: 'PROD-Pharmacy',
    type: 'production',
    status: 'active',
    description: 'Production environment for Rx Platform and Formulary Manager.',
    url: 'https://pharmacy.internal',
    applications: ['Rx Platform', 'Formulary Manager'],
    segment: 'Pharmacy',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 100,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-060', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 26 },
      { id: 'hc-061', name: 'Kafka Broker', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 15 },
      { id: 'hc-062', name: 'Formulary API', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 90 },
    ],
    capacity: {
      cpu: { used: 40, total: 100, unit: '%' },
      memory: { used: 52, total: 100, unit: '%' },
      storage: { used: 450, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(22),
    lastDataRefresh: null,
    configVersion: '2024.04.1',
    owner: 'user-017',
    tags: ['production', 'pharmacy', 'critical'],
    version: 9,
    created_at: daysAgo(320),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-022',
    name: 'PROD-Enterprise',
    type: 'production',
    status: 'active',
    description: 'Production environment for EQIP Core and Compliance Dashboard.',
    url: 'https://eqip.internal',
    applications: ['EQIP Core', 'Compliance Dashboard'],
    segment: 'Enterprise',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 100,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-063', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 20 },
      { id: 'hc-064', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 70 },
      { id: 'hc-065', name: 'Grafana', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 55 },
    ],
    capacity: {
      cpu: { used: 35, total: 100, unit: '%' },
      memory: { used: 48, total: 100, unit: '%' },
      storage: { used: 320, total: 2000, unit: 'GB' },
    },
    lastDeployment: daysAgo(14),
    lastDataRefresh: null,
    configVersion: '2024.05.1',
    owner: 'user-017',
    tags: ['production', 'enterprise', 'critical'],
    version: 11,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'env-023',
    name: 'UAT-PolicyAdmin',
    type: 'uat',
    status: 'degraded',
    description: 'User acceptance testing environment for Policy Admin System and Document Management.',
    url: 'https://uat.policy-admin.internal',
    applications: ['Policy Admin System', 'Document Management'],
    segment: 'Policy Administration',
    reservations: [],
    readinessStatus: {
      overall: 'degraded',
      database: 'degraded',
      services: 'degraded',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 58,
    },
    conflictFlags: [
      { id: 'cf-006', type: 'version_drift', description: 'UAT environment running 2 versions behind production', severity: 'critical', raisedBy: 'user-003', raisedAt: daysAgo(15), status: 'open' },
      { id: 'cf-007', type: 'data_staleness', description: 'Test data refresh overdue by 15 days', severity: 'high', raisedBy: 'user-003', raisedAt: daysAgo(10), status: 'open' },
      { id: 'cf-008', type: 'service_degradation', description: 'Document Management service intermittently failing health checks', severity: 'high', raisedBy: 'user-018', raisedAt: daysAgo(5), status: 'in_progress' },
    ],
    healthChecks: [
      { id: 'hc-066', name: 'Database Connectivity', status: 'warning', lastRun: daysAgo(0), responseTimeMs: 2500 },
      { id: 'hc-067', name: 'Policy Admin API', status: 'warning', lastRun: daysAgo(0), responseTimeMs: 4200 },
      { id: 'hc-068', name: 'Document Management Service', status: 'failed', lastRun: daysAgo(0), responseTimeMs: 0 },
    ],
    capacity: {
      cpu: { used: 65, total: 100, unit: '%' },
      memory: { used: 78, total: 100, unit: '%' },
      storage: { used: 380, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(15),
    lastDataRefresh: daysAgo(25),
    configVersion: '2024.03.0',
    owner: 'user-013',
    tags: ['uat', 'policy-admin', 'degraded', 'critical-attention'],
    version: 6,
    created_at: daysAgo(300),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'env-024',
    name: 'DEV-Underwriting',
    type: 'development',
    status: 'active',
    description: 'Development environment for Underwriting Engine and Risk Assessment Tool.',
    url: 'https://dev.underwriting.internal',
    applications: ['Underwriting Engine', 'Risk Assessment Tool'],
    segment: 'Underwriting',
    reservations: [
      { id: 'res-014', userId: 'user-005', userName: 'S*******r', purpose: 'Risk scoring model v2 testing', startDate: daysAgo(1), endDate: daysAgo(-6), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 96,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-069', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 40 },
      { id: 'hc-070', name: 'Drools Engine', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 95 },
      { id: 'hc-071', name: 'Credit Data Mock', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 60 },
    ],
    capacity: {
      cpu: { used: 32, total: 100, unit: '%' },
      memory: { used: 45, total: 100, unit: '%' },
      storage: { used: 75, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(2),
    lastDataRefresh: daysAgo(4),
    configVersion: '2024.13-rc2',
    owner: 'user-005',
    tags: ['development', 'underwriting', 'risk-scoring'],
    version: 4,
    created_at: daysAgo(310),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'env-025',
    name: 'STG-Underwriting',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for Underwriting Engine and Risk Assessment Tool integration testing.',
    url: 'https://staging.underwriting.internal',
    applications: ['Underwriting Engine', 'Risk Assessment Tool'],
    segment: 'Underwriting',
    reservations: [
      { id: 'res-015', userId: 'user-005', userName: 'S*******r', purpose: 'Regression testing for risk scoring v2', startDate: daysAgo(1), endDate: daysAgo(-3), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 94,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-072', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 48 },
      { id: 'hc-073', name: 'Drools Engine', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 110 },
      { id: 'hc-074', name: 'Credit Data Mock', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 72 },
    ],
    capacity: {
      cpu: { used: 38, total: 100, unit: '%' },
      memory: { used: 52, total: 100, unit: '%' },
      storage: { used: 130, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(6),
    lastDataRefresh: daysAgo(8),
    configVersion: '2024.13-rc1',
    owner: 'user-005',
    tags: ['staging', 'underwriting', 'integration'],
    version: 5,
    created_at: daysAgo(310),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-005',
  },
  {
    id: 'env-026',
    name: 'DEV-EQIP-Core',
    type: 'development',
    status: 'active',
    description: 'Development environment for EQIP Core quality intelligence platform.',
    url: 'https://dev.eqip-core.internal',
    applications: ['EQIP Core'],
    segment: 'Enterprise',
    reservations: [
      { id: 'res-016', userId: 'user-019', userName: 'S*******r', purpose: 'XSS vulnerability fix development', startDate: daysAgo(1), endDate: daysAgo(-3), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 97,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-075', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 32 },
      { id: 'hc-076', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 90 },
      { id: 'hc-077', name: 'Notification Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 48 },
    ],
    capacity: {
      cpu: { used: 30, total: 100, unit: '%' },
      memory: { used: 42, total: 100, unit: '%' },
      storage: { used: 90, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(1),
    lastDataRefresh: daysAgo(2),
    configVersion: '2024.06-rc3',
    owner: 'user-019',
    tags: ['development', 'eqip-core', 'enterprise'],
    version: 7,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'env-027',
    name: 'STG-EQIP-Core',
    type: 'staging',
    status: 'active',
    description: 'Staging environment for EQIP Core quality intelligence platform integration testing.',
    url: 'https://staging.eqip-core.internal',
    applications: ['EQIP Core'],
    segment: 'Enterprise',
    reservations: [
      { id: 'res-017', userId: 'user-010', userName: 'S*******r', purpose: 'Security scan execution', startDate: daysAgo(2), endDate: daysAgo(-5), status: 'active' },
    ],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'healthy',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 96,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-078', name: 'Database Connectivity', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 38 },
      { id: 'hc-079', name: 'API Gateway', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 100 },
      { id: 'hc-080', name: 'Notification Service', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 52 },
    ],
    capacity: {
      cpu: { used: 42, total: 100, unit: '%' },
      memory: { used: 55, total: 100, unit: '%' },
      storage: { used: 170, total: 500, unit: 'GB' },
    },
    lastDeployment: daysAgo(3),
    lastDataRefresh: daysAgo(5),
    configVersion: '2024.06-rc3',
    owner: 'user-010',
    tags: ['staging', 'eqip-core', 'enterprise', 'security'],
    version: 9,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-010',
  },
  {
    id: 'env-028',
    name: 'DR-Enterprise',
    type: 'disaster_recovery',
    status: 'standby',
    description: 'Disaster recovery environment for all enterprise-critical applications.',
    url: 'https://dr.eqip.internal',
    applications: ['EQIP Core', 'Claims Processing', 'Payment Gateway', 'Member Portal', 'Rx Platform', 'Compliance Dashboard'],
    segment: 'Enterprise',
    reservations: [],
    readinessStatus: {
      overall: 'ready',
      database: 'healthy',
      services: 'standby',
      connectivity: 'healthy',
      lastChecked: daysAgo(0),
      score: 93,
    },
    conflictFlags: [],
    healthChecks: [
      { id: 'hc-081', name: 'Database Replication', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 150 },
      { id: 'hc-082', name: 'Failover Readiness', status: 'passed', lastRun: daysAgo(0), responseTimeMs: 200 },
      { id: 'hc-083', name: 'Backup Verification', status: 'passed', lastRun: daysAgo(1), responseTimeMs: 5000 },
    ],
    capacity: {
      cpu: { used: 5, total: 100, unit: '%' },
      memory: { used: 12, total: 100, unit: '%' },
      storage: { used: 1200, total: 4000, unit: 'GB' },
    },
    lastDeployment: daysAgo(40),
    lastDataRefresh: daysAgo(0),
    configVersion: '2024.05.1',
    owner: 'user-017',
    tags: ['disaster-recovery', 'standby', 'enterprise', 'critical'],
    version: 4,
    created_at: daysAgo(330),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
];

export default environments;

/**
 * Get all mock environments.
 * @returns {Array<object>} Array of environment objects.
 */
export function getAllEnvironments() {
  return [...environments];
}

/**
 * Find an environment by ID.
 * @param {string} id - The environment ID to find.
 * @returns {object|null} The environment object, or null if not found.
 */
export function getEnvironmentById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return environments.find((env) => env.id === id) || null;
}

/**
 * Get all environments with a specific type.
 * @param {string} type - The environment type to filter by (e.g., 'development', 'staging', 'uat', 'production').
 * @returns {Array<object>} Array of environments with the specified type.
 */
export function getEnvironmentsByType(type) {
  if (!type || typeof type !== 'string') {
    return [];
  }
  return environments.filter((env) => env.type === type);
}

/**
 * Get all environments with a specific status.
 * @param {string} status - The status to filter by (e.g., 'active', 'degraded', 'standby', 'down').
 * @returns {Array<object>} Array of environments with the specified status.
 */
export function getEnvironmentsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return environments.filter((env) => env.status === status);
}

/**
 * Get all environments within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of environments within the specified segment.
 */
export function getEnvironmentsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return environments.filter((env) => env.segment === segment);
}

/**
 * Get all environments that host a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of environments hosting the specified application.
 */
export function getEnvironmentsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return environments.filter(
    (env) =>
      Array.isArray(env.applications) && env.applications.includes(application),
  );
}

/**
 * Get all environments owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of environments owned by the specified user.
 */
export function getEnvironmentsByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return environments.filter((env) => env.owner === ownerId);
}

/**
 * Get all environments with active reservations.
 * @returns {Array<object>} Array of environments that have active reservations.
 */
export function getEnvironmentsWithActiveReservations() {
  return environments.filter(
    (env) =>
      Array.isArray(env.reservations) &&
      env.reservations.some((res) => res.status === 'active'),
  );
}

/**
 * Get all environments with open conflict flags.
 * @returns {Array<object>} Array of environments that have open or in-progress conflict flags.
 */
export function getEnvironmentsWithConflicts() {
  return environments.filter(
    (env) =>
      Array.isArray(env.conflictFlags) &&
      env.conflictFlags.some(
        (flag) => flag.status === 'open' || flag.status === 'in_progress',
      ),
  );
}

/**
 * Get all environments with a degraded readiness status.
 * @returns {Array<object>} Array of environments with degraded readiness.
 */
export function getDegradedEnvironments() {
  return environments.filter(
    (env) =>
      env.readinessStatus &&
      env.readinessStatus.overall === 'degraded',
  );
}

/**
 * Get all environments with a specific readiness status.
 * @param {string} readinessStatus - The readiness status to filter by (e.g., 'ready', 'degraded', 'down').
 * @returns {Array<object>} Array of environments with the specified readiness status.
 */
export function getEnvironmentsByReadinessStatus(readinessStatus) {
  if (!readinessStatus || typeof readinessStatus !== 'string') {
    return [];
  }
  return environments.filter(
    (env) =>
      env.readinessStatus &&
      env.readinessStatus.overall === readinessStatus,
  );
}

/**
 * Get distinct environment types from the environment data.
 * @returns {string[]} Array of unique environment type strings.
 */
export function getDistinctTypes() {
  const types = new Set();
  for (let i = 0; i < environments.length; i++) {
    if (environments[i].type) {
      types.add(environments[i].type);
    }
  }
  return [...types].sort();
}

/**
 * Get distinct statuses from the environment data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < environments.length; i++) {
    if (environments[i].status) {
      statuses.add(environments[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct segments from the environment data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < environments.length; i++) {
    if (environments[i].segment) {
      segments.add(environments[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get a count of environments grouped by type.
 * @returns {object} Object with type keys and count values.
 */
export function getEnvironmentCountByType() {
  const counts = {};
  for (let i = 0; i < environments.length; i++) {
    const type = environments[i].type;
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of environments grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getEnvironmentCountByStatus() {
  const counts = {};
  for (let i = 0; i < environments.length; i++) {
    const status = environments[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of environments grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getEnvironmentCountBySegment() {
  const counts = {};
  for (let i = 0; i < environments.length; i++) {
    const segment = environments[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of environments grouped by readiness status.
 * @returns {object} Object with readiness status keys and count values.
 */
export function getEnvironmentCountByReadinessStatus() {
  const counts = {};
  for (let i = 0; i < environments.length; i++) {
    const readiness = environments[i].readinessStatus
      ? environments[i].readinessStatus.overall
      : 'unknown';
    counts[readiness] = (counts[readiness] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average readiness score across all environments.
 * @returns {number} The average readiness score, or 0 if no environments exist.
 */
export function getAverageReadinessScore() {
  if (environments.length === 0) {
    return 0;
  }
  let total = 0;
  let count = 0;
  for (let i = 0; i < environments.length; i++) {
    if (
      environments[i].readinessStatus &&
      typeof environments[i].readinessStatus.score === 'number'
    ) {
      total += environments[i].readinessStatus.score;
      count += 1;
    }
  }
  if (count === 0) {
    return 0;
  }
  return Math.round((total / count) * 100) / 100;
}

/**
 * Get the total number of open conflict flags across all environments.
 * @returns {number} Total count of open and in-progress conflict flags.
 */
export function getTotalOpenConflicts() {
  let count = 0;
  for (let i = 0; i < environments.length; i++) {
    if (Array.isArray(environments[i].conflictFlags)) {
      for (let j = 0; j < environments[i].conflictFlags.length; j++) {
        const status = environments[i].conflictFlags[j].status;
        if (status === 'open' || status === 'in_progress') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of active reservations across all environments.
 * @returns {number} Total count of active reservations.
 */
export function getTotalActiveReservations() {
  let count = 0;
  for (let i = 0; i < environments.length; i++) {
    if (Array.isArray(environments[i].reservations)) {
      for (let j = 0; j < environments[i].reservations.length; j++) {
        if (environments[i].reservations[j].status === 'active') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Get the total number of failed health checks across all environments.
 * @returns {number} Total count of failed health checks.
 */
export function getTotalFailedHealthChecks() {
  let count = 0;
  for (let i = 0; i < environments.length; i++) {
    if (Array.isArray(environments[i].healthChecks)) {
      for (let j = 0; j < environments[i].healthChecks.length; j++) {
        if (environments[i].healthChecks[j].status === 'failed') {
          count += 1;
        }
      }
    }
  }
  return count;
}

/**
 * Find an environment by name (case-insensitive).
 * @param {string} name - The environment name to search for.
 * @returns {object|null} The environment object, or null if not found.
 */
export function getEnvironmentByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return environments.find((env) => env.name.toLowerCase() === nameLower) || null;
}

/**
 * Get environments sorted by readiness score in ascending order (worst first).
 * @param {number} [limit] - Optional maximum number of environments to return.
 * @returns {Array<object>} Array of environments sorted by readiness score ascending.
 */
export function getLowestReadinessEnvironments(limit) {
  const sorted = [...environments].sort((a, b) => {
    const scoreA = a.readinessStatus ? a.readinessStatus.score : 0;
    const scoreB = b.readinessStatus ? b.readinessStatus.score : 0;
    return scoreA - scoreB;
  });
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get a summary of environment health across all environments.
 * @returns {object} Summary object with environment health metrics.
 */
export function getEnvironmentSummary() {
  const total = environments.length;
  let active = 0;
  let degraded = 0;
  let standby = 0;
  let down = 0;
  let totalScore = 0;
  let scoreCount = 0;
  let totalConflicts = 0;
  let totalReservations = 0;
  let totalFailedChecks = 0;

  for (let i = 0; i < environments.length; i++) {
    const env = environments[i];

    if (env.status === 'active') active += 1;
    else if (env.status === 'degraded') degraded += 1;
    else if (env.status === 'standby') standby += 1;
    else if (env.status === 'down') down += 1;

    if (env.readinessStatus && typeof env.readinessStatus.score === 'number') {
      totalScore += env.readinessStatus.score;
      scoreCount += 1;
    }

    if (Array.isArray(env.conflictFlags)) {
      for (let j = 0; j < env.conflictFlags.length; j++) {
        const status = env.conflictFlags[j].status;
        if (status === 'open' || status === 'in_progress') {
          totalConflicts += 1;
        }
      }
    }

    if (Array.isArray(env.reservations)) {
      for (let j = 0; j < env.reservations.length; j++) {
        if (env.reservations[j].status === 'active') {
          totalReservations += 1;
        }
      }
    }

    if (Array.isArray(env.healthChecks)) {
      for (let j = 0; j < env.healthChecks.length; j++) {
        if (env.healthChecks[j].status === 'failed') {
          totalFailedChecks += 1;
        }
      }
    }
  }

  return {
    total,
    active,
    degraded,
    standby,
    down,
    averageReadinessScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) / 100 : 0,
    totalOpenConflicts: totalConflicts,
    totalActiveReservations: totalReservations,
    totalFailedHealthChecks: totalFailedChecks,
  };
}