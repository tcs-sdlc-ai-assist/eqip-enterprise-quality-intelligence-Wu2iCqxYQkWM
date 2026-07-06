import { v4 as uuidv4 } from 'uuid';

/**
 * @module applications
 * Mock application data seed for eQIP Quality Intelligence.
 * Enterprise applications with all PRD-specified fields including quality metrics,
 * environment mappings, governance compliance, and audit fields.
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
 * Mock application data array with enterprise applications.
 * Each application includes id, name, segment, owner, qualityScore, automationCoverage,
 * testCoverage, defectDensity, releaseHistory, environmentMapping, governanceCompliance,
 * riskLevel, status, and audit fields.
 * @type {Array<object>}
 */
const applications = [
  {
    id: 'app-001',
    name: 'EQIP Core',
    description: 'Core quality intelligence platform providing centralized quality metrics, dashboards, and reporting across all business segments.',
    segment: 'Enterprise',
    owner: 'user-001',
    qualityScore: 92,
    automationCoverage: 78,
    testCoverage: 88,
    defectDensity: 0.35,
    releaseHistory: [
      { releaseId: 'rel-001', name: 'Release 2024.06', date: daysAgo(30), qualityScore: 92, status: 'Ready' },
      { releaseId: 'rel-005', name: 'Release 2024.10', date: daysAgo(45), qualityScore: 95, status: 'Ready' },
      { releaseId: 'rel-prev-001', name: 'Release 2024.03', date: daysAgo(120), qualityScore: 89, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.eqip-core.internal', status: 'active', lastDeployment: daysAgo(1) },
      staging: { url: 'https://staging.eqip-core.internal', status: 'active', lastDeployment: daysAgo(3) },
      uat: { url: 'https://uat.eqip-core.internal', status: 'active', lastDeployment: daysAgo(7) },
      production: { url: 'https://eqip-core.internal', status: 'active', lastDeployment: daysAgo(14) },
    },
    governanceCompliance: {
      overallRate: 94,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(7) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(45) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(21) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['React', 'Node.js', 'PostgreSQL'],
    teamSize: 12,
    created_at: daysAgo(365),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'app-002',
    name: 'Claims Processing',
    description: 'Automated claims intake, adjudication, and settlement processing system for healthcare claims.',
    segment: 'Claims',
    owner: 'user-012',
    qualityScore: 89,
    automationCoverage: 72,
    testCoverage: 85,
    defectDensity: 0.42,
    releaseHistory: [
      { releaseId: 'rel-005', name: 'Release 2024.10', date: daysAgo(45), qualityScore: 95, status: 'Ready' },
      { releaseId: 'rel-prev-002', name: 'Release 2024.04', date: daysAgo(100), qualityScore: 87, status: 'Ready' },
      { releaseId: 'rel-prev-003', name: 'Release 2024.01', date: daysAgo(180), qualityScore: 84, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.claims.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.claims.internal', status: 'active', lastDeployment: daysAgo(5) },
      uat: { url: 'https://uat.claims.internal', status: 'active', lastDeployment: daysAgo(10) },
      production: { url: 'https://claims.internal', status: 'active', lastDeployment: daysAgo(20) },
    },
    governanceCompliance: {
      overallRate: 91,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(10) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(50) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'at_risk', lastAudit: daysAgo(35) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['Java', 'Spring Boot', 'Oracle'],
    teamSize: 15,
    created_at: daysAgo(350),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-012',
  },
  {
    id: 'app-003',
    name: 'Claims Analytics',
    description: 'Claims data analytics, reporting, trend analysis, and fraud detection platform.',
    segment: 'Claims',
    owner: 'user-022',
    qualityScore: 86,
    automationCoverage: 65,
    testCoverage: 80,
    defectDensity: 0.51,
    releaseHistory: [
      { releaseId: 'rel-prev-004', name: 'Release 2024.05', date: daysAgo(75), qualityScore: 83, status: 'Ready' },
      { releaseId: 'rel-prev-005', name: 'Release 2024.02', date: daysAgo(150), qualityScore: 80, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.claims-analytics.internal', status: 'active', lastDeployment: daysAgo(3) },
      staging: { url: 'https://staging.claims-analytics.internal', status: 'active', lastDeployment: daysAgo(8) },
      uat: { url: 'https://uat.claims-analytics.internal', status: 'active', lastDeployment: daysAgo(15) },
      production: { url: 'https://claims-analytics.internal', status: 'active', lastDeployment: daysAgo(30) },
    },
    governanceCompliance: {
      overallRate: 88,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(20) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(12) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(25) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Python', 'Apache Spark', 'Snowflake'],
    teamSize: 8,
    created_at: daysAgo(280),
    updated_at: daysAgo(3),
    created_by: 'user-012',
    updated_by: 'user-022',
  },
  {
    id: 'app-004',
    name: 'Payment Gateway',
    description: 'Billing, invoicing, and payment processing gateway supporting multiple payment methods and reconciliation.',
    segment: 'Billing',
    owner: 'user-013',
    qualityScore: 78,
    automationCoverage: 60,
    testCoverage: 75,
    defectDensity: 0.68,
    releaseHistory: [
      { releaseId: 'rel-002', name: 'Release 2024.07', date: daysAgo(20), qualityScore: 78, status: 'In Progress' },
      { releaseId: 'rel-prev-006', name: 'Release 2024.04', date: daysAgo(90), qualityScore: 74, status: 'Ready' },
      { releaseId: 'rel-prev-007', name: 'Release 2024.01', date: daysAgo(170), qualityScore: 71, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.payment.internal', status: 'active', lastDeployment: daysAgo(1) },
      staging: { url: 'https://staging.payment.internal', status: 'active', lastDeployment: daysAgo(4) },
      uat: { url: 'https://uat.payment.internal', status: 'active', lastDeployment: daysAgo(9) },
      production: { url: 'https://payment.internal', status: 'active', lastDeployment: daysAgo(25) },
    },
    governanceCompliance: {
      overallRate: 82,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(18) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'at_risk', lastAudit: daysAgo(30) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(60) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(28) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Java', 'Spring Boot', 'MySQL', 'Redis'],
    teamSize: 10,
    created_at: daysAgo(340),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'app-005',
    name: 'Billing Portal',
    description: 'Self-service billing portal for members and providers to view statements, make payments, and manage billing preferences.',
    segment: 'Billing',
    owner: 'user-004',
    qualityScore: 81,
    automationCoverage: 55,
    testCoverage: 78,
    defectDensity: 0.58,
    releaseHistory: [
      { releaseId: 'rel-prev-008', name: 'Release 2024.05', date: daysAgo(70), qualityScore: 79, status: 'Ready' },
      { releaseId: 'rel-prev-009', name: 'Release 2024.02', date: daysAgo(140), qualityScore: 76, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.billing-portal.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.billing-portal.internal', status: 'active', lastDeployment: daysAgo(6) },
      uat: { url: 'https://uat.billing-portal.internal', status: 'active', lastDeployment: daysAgo(12) },
      production: { url: 'https://billing-portal.internal', status: 'active', lastDeployment: daysAgo(28) },
    },
    governanceCompliance: {
      overallRate: 85,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(16) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-005', name: 'Accessibility Standards Review', status: 'at_risk', lastAudit: daysAgo(30) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['React', 'Node.js', 'MongoDB'],
    teamSize: 6,
    created_at: daysAgo(300),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-004',
  },
  {
    id: 'app-006',
    name: 'Member Portal',
    description: 'Member-facing portal for enrollment, eligibility verification, benefits information, and self-service account management.',
    segment: 'Enrollment',
    owner: 'user-014',
    qualityScore: 85,
    automationCoverage: 70,
    testCoverage: 82,
    defectDensity: 0.45,
    releaseHistory: [
      { releaseId: 'rel-003', name: 'Release 2024.08', date: daysAgo(15), qualityScore: 85, status: 'In Review' },
      { releaseId: 'rel-prev-010', name: 'Release 2024.05', date: daysAgo(80), qualityScore: 82, status: 'Ready' },
      { releaseId: 'rel-prev-011', name: 'Release 2024.02', date: daysAgo(155), qualityScore: 79, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.member-portal.internal', status: 'active', lastDeployment: daysAgo(1) },
      staging: { url: 'https://staging.member-portal.internal', status: 'active', lastDeployment: daysAgo(4) },
      uat: { url: 'https://uat.member-portal.internal', status: 'active', lastDeployment: daysAgo(8) },
      production: { url: 'https://member-portal.internal', status: 'active', lastDeployment: daysAgo(18) },
    },
    governanceCompliance: {
      overallRate: 90,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(12) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(9) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(20) },
        { procedureId: 'gov-005', name: 'Accessibility Standards Review', status: 'compliant', lastAudit: daysAgo(25) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    teamSize: 9,
    created_at: daysAgo(330),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-014',
  },
  {
    id: 'app-007',
    name: 'Enrollment Engine',
    description: 'Backend enrollment processing engine handling eligibility rules, plan selection, and enrollment lifecycle management.',
    segment: 'Enrollment',
    owner: 'user-023',
    qualityScore: 83,
    automationCoverage: 68,
    testCoverage: 80,
    defectDensity: 0.52,
    releaseHistory: [
      { releaseId: 'rel-prev-012', name: 'Release 2024.04', date: daysAgo(95), qualityScore: 81, status: 'Ready' },
      { releaseId: 'rel-prev-013', name: 'Release 2024.01', date: daysAgo(175), qualityScore: 78, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.enrollment-engine.internal', status: 'active', lastDeployment: daysAgo(3) },
      staging: { url: 'https://staging.enrollment-engine.internal', status: 'active', lastDeployment: daysAgo(7) },
      uat: { url: 'https://uat.enrollment-engine.internal', status: 'active', lastDeployment: daysAgo(14) },
      production: { url: 'https://enrollment-engine.internal', status: 'active', lastDeployment: daysAgo(35) },
    },
    governanceCompliance: {
      overallRate: 87,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(15) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(11) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(55) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['Java', 'Spring Boot', 'PostgreSQL'],
    teamSize: 7,
    created_at: daysAgo(310),
    updated_at: daysAgo(4),
    created_by: 'user-001',
    updated_by: 'user-023',
  },
  {
    id: 'app-008',
    name: 'Provider Directory',
    description: 'Provider network directory and search service for members and internal operations.',
    segment: 'Provider',
    owner: 'user-011',
    qualityScore: 65,
    automationCoverage: 45,
    testCoverage: 62,
    defectDensity: 0.95,
    releaseHistory: [
      { releaseId: 'rel-004', name: 'Release 2024.09', date: daysAgo(10), qualityScore: 65, status: 'At Risk' },
      { releaseId: 'rel-prev-014', name: 'Release 2024.03', date: daysAgo(110), qualityScore: 60, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.provider-dir.internal', status: 'active', lastDeployment: daysAgo(1) },
      staging: { url: 'https://staging.provider-dir.internal', status: 'active', lastDeployment: daysAgo(5) },
      uat: { url: 'https://uat.provider-dir.internal', status: 'degraded', lastDeployment: daysAgo(12) },
      production: { url: 'https://provider-dir.internal', status: 'active', lastDeployment: daysAgo(40) },
    },
    governanceCompliance: {
      overallRate: 72,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'at_risk', lastAudit: daysAgo(25) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'non_compliant', lastAudit: daysAgo(40) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'at_risk', lastAudit: daysAgo(38) },
      ],
    },
    riskLevel: 'high',
    status: 'active',
    technology: ['Python', 'Django', 'Elasticsearch', 'PostgreSQL'],
    teamSize: 5,
    created_at: daysAgo(320),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'app-009',
    name: 'Credentialing System',
    description: 'Provider credentialing, verification, and re-credentialing workflow management system.',
    segment: 'Provider',
    owner: 'user-007',
    qualityScore: 70,
    automationCoverage: 50,
    testCoverage: 68,
    defectDensity: 0.78,
    releaseHistory: [
      { releaseId: 'rel-prev-015', name: 'Release 2024.04', date: daysAgo(85), qualityScore: 68, status: 'Ready' },
      { releaseId: 'rel-prev-016', name: 'Release 2023.12', date: daysAgo(200), qualityScore: 64, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.credentialing.internal', status: 'active', lastDeployment: daysAgo(4) },
      staging: { url: 'https://staging.credentialing.internal', status: 'active', lastDeployment: daysAgo(10) },
      uat: { url: 'https://uat.credentialing.internal', status: 'active', lastDeployment: daysAgo(20) },
      production: { url: 'https://credentialing.internal', status: 'active', lastDeployment: daysAgo(45) },
    },
    governanceCompliance: {
      overallRate: 76,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(22) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'at_risk', lastAudit: daysAgo(35) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(50) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['.NET', 'C#', 'SQL Server'],
    teamSize: 4,
    created_at: daysAgo(290),
    updated_at: daysAgo(6),
    created_by: 'user-001',
    updated_by: 'user-007',
  },
  {
    id: 'app-010',
    name: 'Rx Platform',
    description: 'Pharmacy benefits management platform handling prescription processing, formulary management, and pharmacy network operations.',
    segment: 'Pharmacy',
    owner: 'user-012',
    qualityScore: 88,
    automationCoverage: 74,
    testCoverage: 84,
    defectDensity: 0.38,
    releaseHistory: [
      { releaseId: 'rel-prev-017', name: 'Release 2024.06', date: daysAgo(35), qualityScore: 88, status: 'Ready' },
      { releaseId: 'rel-prev-018', name: 'Release 2024.03', date: daysAgo(105), qualityScore: 85, status: 'Ready' },
      { releaseId: 'rel-prev-019', name: 'Release 2023.12', date: daysAgo(190), qualityScore: 82, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.rx-platform.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.rx-platform.internal', status: 'active', lastDeployment: daysAgo(5) },
      uat: { url: 'https://uat.rx-platform.internal', status: 'active', lastDeployment: daysAgo(10) },
      production: { url: 'https://rx-platform.internal', status: 'active', lastDeployment: daysAgo(22) },
    },
    governanceCompliance: {
      overallRate: 93,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(10) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(8) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(40) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(18) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['Java', 'Spring Boot', 'Oracle', 'Kafka'],
    teamSize: 11,
    created_at: daysAgo(315),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-012',
  },
  {
    id: 'app-011',
    name: 'Formulary Manager',
    description: 'Drug formulary management system for maintaining formulary lists, tier structures, and prior authorization rules.',
    segment: 'Pharmacy',
    owner: 'user-005',
    qualityScore: 84,
    automationCoverage: 62,
    testCoverage: 79,
    defectDensity: 0.55,
    releaseHistory: [
      { releaseId: 'rel-prev-020', name: 'Release 2024.05', date: daysAgo(65), qualityScore: 82, status: 'Ready' },
      { releaseId: 'rel-prev-021', name: 'Release 2024.01', date: daysAgo(165), qualityScore: 79, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.formulary.internal', status: 'active', lastDeployment: daysAgo(3) },
      staging: { url: 'https://staging.formulary.internal', status: 'active', lastDeployment: daysAgo(8) },
      uat: { url: 'https://uat.formulary.internal', status: 'active', lastDeployment: daysAgo(16) },
      production: { url: 'https://formulary.internal', status: 'active', lastDeployment: daysAgo(32) },
    },
    governanceCompliance: {
      overallRate: 89,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(13) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(11) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(48) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['Python', 'FastAPI', 'PostgreSQL'],
    teamSize: 5,
    created_at: daysAgo(270),
    updated_at: daysAgo(4),
    created_by: 'user-012',
    updated_by: 'user-005',
  },
  {
    id: 'app-012',
    name: 'Underwriting Engine',
    description: 'Automated underwriting and risk assessment engine for insurance policy applications.',
    segment: 'Underwriting',
    owner: 'user-011',
    qualityScore: 82,
    automationCoverage: 66,
    testCoverage: 77,
    defectDensity: 0.61,
    releaseHistory: [
      { releaseId: 'rel-prev-022', name: 'Release 2024.05', date: daysAgo(60), qualityScore: 80, status: 'Ready' },
      { releaseId: 'rel-prev-023', name: 'Release 2024.02', date: daysAgo(135), qualityScore: 77, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.underwriting.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.underwriting.internal', status: 'active', lastDeployment: daysAgo(6) },
      uat: { url: 'https://uat.underwriting.internal', status: 'active', lastDeployment: daysAgo(13) },
      production: { url: 'https://underwriting.internal', status: 'active', lastDeployment: daysAgo(28) },
    },
    governanceCompliance: {
      overallRate: 86,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(17) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(13) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(52) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Java', 'Drools', 'PostgreSQL'],
    teamSize: 7,
    created_at: daysAgo(305),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'app-013',
    name: 'Risk Assessment Tool',
    description: 'Risk modeling and assessment tool for evaluating insurance applicant risk profiles.',
    segment: 'Underwriting',
    owner: 'user-020',
    qualityScore: 79,
    automationCoverage: 58,
    testCoverage: 73,
    defectDensity: 0.72,
    releaseHistory: [
      { releaseId: 'rel-prev-024', name: 'Release 2024.04', date: daysAgo(88), qualityScore: 76, status: 'Ready' },
      { releaseId: 'rel-prev-025', name: 'Release 2023.11', date: daysAgo(210), qualityScore: 72, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.risk-assess.internal', status: 'active', lastDeployment: daysAgo(4) },
      staging: { url: 'https://staging.risk-assess.internal', status: 'active', lastDeployment: daysAgo(9) },
      uat: { url: 'https://uat.risk-assess.internal', status: 'active', lastDeployment: daysAgo(18) },
      production: { url: 'https://risk-assess.internal', status: 'active', lastDeployment: daysAgo(38) },
    },
    governanceCompliance: {
      overallRate: 80,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(20) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'at_risk', lastAudit: daysAgo(28) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Python', 'scikit-learn', 'PostgreSQL'],
    teamSize: 4,
    created_at: daysAgo(260),
    updated_at: daysAgo(5),
    created_by: 'user-011',
    updated_by: 'user-020',
  },
  {
    id: 'app-014',
    name: 'Policy Admin System',
    description: 'Policy lifecycle administration system managing issuance, endorsements, renewals, and cancellations.',
    segment: 'Policy Administration',
    owner: 'user-013',
    qualityScore: 76,
    automationCoverage: 52,
    testCoverage: 70,
    defectDensity: 0.82,
    releaseHistory: [
      { releaseId: 'rel-prev-026', name: 'Release 2024.05', date: daysAgo(68), qualityScore: 74, status: 'Ready' },
      { releaseId: 'rel-prev-027', name: 'Release 2024.02', date: daysAgo(145), qualityScore: 70, status: 'Ready' },
      { releaseId: 'rel-prev-028', name: 'Release 2023.10', date: daysAgo(240), qualityScore: 67, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.policy-admin.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.policy-admin.internal', status: 'active', lastDeployment: daysAgo(7) },
      uat: { url: 'https://uat.policy-admin.internal', status: 'degraded', lastDeployment: daysAgo(15) },
      production: { url: 'https://policy-admin.internal', status: 'active', lastDeployment: daysAgo(30) },
    },
    governanceCompliance: {
      overallRate: 78,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'at_risk', lastAudit: daysAgo(22) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(15) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'at_risk', lastAudit: daysAgo(65) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(24) },
      ],
    },
    riskLevel: 'high',
    status: 'active',
    technology: ['COBOL', 'Java', 'DB2', 'MQ'],
    teamSize: 8,
    created_at: daysAgo(350),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'app-015',
    name: 'Document Management',
    description: 'Enterprise document management system for policy documents, correspondence, and regulatory filings.',
    segment: 'Policy Administration',
    owner: 'user-014',
    qualityScore: 74,
    automationCoverage: 48,
    testCoverage: 66,
    defectDensity: 0.88,
    releaseHistory: [
      { releaseId: 'rel-prev-029', name: 'Release 2024.03', date: daysAgo(100), qualityScore: 72, status: 'Ready' },
      { releaseId: 'rel-prev-030', name: 'Release 2023.11', date: daysAgo(205), qualityScore: 69, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.docmgmt.internal', status: 'active', lastDeployment: daysAgo(5) },
      staging: { url: 'https://staging.docmgmt.internal', status: 'active', lastDeployment: daysAgo(12) },
      uat: { url: 'https://uat.docmgmt.internal', status: 'active', lastDeployment: daysAgo(22) },
      production: { url: 'https://docmgmt.internal', status: 'active', lastDeployment: daysAgo(42) },
    },
    governanceCompliance: {
      overallRate: 75,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(19) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'at_risk', lastAudit: daysAgo(32) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'at_risk', lastAudit: daysAgo(36) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Java', 'Alfresco', 'PostgreSQL'],
    teamSize: 4,
    created_at: daysAgo(285),
    updated_at: daysAgo(8),
    created_by: 'user-001',
    updated_by: 'user-014',
  },
  {
    id: 'app-016',
    name: 'Insurance Claims Portal',
    description: 'Insurance claims intake and tracking portal for policyholders and agents.',
    segment: 'Insurance Claims',
    owner: 'user-014',
    qualityScore: 80,
    automationCoverage: 63,
    testCoverage: 76,
    defectDensity: 0.62,
    releaseHistory: [
      { releaseId: 'rel-prev-031', name: 'Release 2024.05', date: daysAgo(72), qualityScore: 78, status: 'Ready' },
      { releaseId: 'rel-prev-032', name: 'Release 2024.01', date: daysAgo(160), qualityScore: 75, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.ins-claims.internal', status: 'active', lastDeployment: daysAgo(2) },
      staging: { url: 'https://staging.ins-claims.internal', status: 'active', lastDeployment: daysAgo(6) },
      uat: { url: 'https://uat.ins-claims.internal', status: 'active', lastDeployment: daysAgo(14) },
      production: { url: 'https://ins-claims.internal', status: 'active', lastDeployment: daysAgo(30) },
    },
    governanceCompliance: {
      overallRate: 84,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(12) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(55) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['React', 'Node.js', 'PostgreSQL'],
    teamSize: 6,
    created_at: daysAgo(275),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-014',
  },
  {
    id: 'app-017',
    name: 'Settlement Engine',
    description: 'Automated insurance claims settlement calculation and payment processing engine.',
    segment: 'Insurance Claims',
    owner: 'user-019',
    qualityScore: 77,
    automationCoverage: 56,
    testCoverage: 72,
    defectDensity: 0.74,
    releaseHistory: [
      { releaseId: 'rel-prev-033', name: 'Release 2024.04', date: daysAgo(82), qualityScore: 75, status: 'Ready' },
      { releaseId: 'rel-prev-034', name: 'Release 2023.12', date: daysAgo(195), qualityScore: 71, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.settlement.internal', status: 'active', lastDeployment: daysAgo(3) },
      staging: { url: 'https://staging.settlement.internal', status: 'active', lastDeployment: daysAgo(8) },
      uat: { url: 'https://uat.settlement.internal', status: 'active', lastDeployment: daysAgo(17) },
      production: { url: 'https://settlement.internal', status: 'active', lastDeployment: daysAgo(35) },
    },
    governanceCompliance: {
      overallRate: 81,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(16) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'at_risk', lastAudit: daysAgo(62) },
      ],
    },
    riskLevel: 'medium',
    status: 'active',
    technology: ['Java', 'Spring Boot', 'Oracle'],
    teamSize: 5,
    created_at: daysAgo(265),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-019',
  },
  {
    id: 'app-018',
    name: 'Actuarial Platform',
    description: 'Actuarial modeling, reserving, and financial projection platform for insurance operations.',
    segment: 'Actuarial',
    owner: 'user-011',
    qualityScore: 90,
    automationCoverage: 71,
    testCoverage: 86,
    defectDensity: 0.32,
    releaseHistory: [
      { releaseId: 'rel-prev-035', name: 'Release 2024.04', date: daysAgo(90), qualityScore: 89, status: 'Ready' },
      { releaseId: 'rel-prev-036', name: 'Release 2023.12', date: daysAgo(185), qualityScore: 86, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.actuarial.internal', status: 'active', lastDeployment: daysAgo(5) },
      staging: { url: 'https://staging.actuarial.internal', status: 'active', lastDeployment: daysAgo(12) },
      uat: { url: 'https://uat.actuarial.internal', status: 'active', lastDeployment: daysAgo(20) },
      production: { url: 'https://actuarial.internal', status: 'active', lastDeployment: daysAgo(40) },
    },
    governanceCompliance: {
      overallRate: 95,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(10) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(8) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(42) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(16) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['R', 'Python', 'SAS', 'PostgreSQL'],
    teamSize: 6,
    created_at: daysAgo(250),
    updated_at: daysAgo(7),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'app-019',
    name: 'Compliance Dashboard',
    description: 'Cross-domain regulatory compliance monitoring, reporting, and alerting dashboard.',
    segment: 'Regulatory Compliance',
    owner: 'user-001',
    qualityScore: 95,
    automationCoverage: 82,
    testCoverage: 91,
    defectDensity: 0.22,
    releaseHistory: [
      { releaseId: 'rel-prev-037', name: 'Release 2024.06', date: daysAgo(40), qualityScore: 94, status: 'Ready' },
      { releaseId: 'rel-prev-038', name: 'Release 2024.03', date: daysAgo(115), qualityScore: 92, status: 'Ready' },
    ],
    environmentMapping: {
      development: { url: 'https://dev.compliance.internal', status: 'active', lastDeployment: daysAgo(3) },
      staging: { url: 'https://staging.compliance.internal', status: 'active', lastDeployment: daysAgo(7) },
      uat: { url: 'https://uat.compliance.internal', status: 'active', lastDeployment: daysAgo(14) },
      production: { url: 'https://compliance.internal', status: 'active', lastDeployment: daysAgo(25) },
    },
    governanceCompliance: {
      overallRate: 98,
      procedures: [
        { procedureId: 'gov-001', name: 'Change Advisory Board Review', status: 'compliant', lastAudit: daysAgo(8) },
        { procedureId: 'gov-002', name: 'Security Compliance Check', status: 'compliant', lastAudit: daysAgo(6) },
        { procedureId: 'gov-003', name: 'Regulatory Compliance Audit', status: 'compliant', lastAudit: daysAgo(35) },
        { procedureId: 'gov-004', name: 'Data Privacy Review', status: 'compliant', lastAudit: daysAgo(14) },
        { procedureId: 'gov-005', name: 'Accessibility Standards Review', status: 'compliant', lastAudit: daysAgo(20) },
      ],
    },
    riskLevel: 'low',
    status: 'active',
    technology: ['React', 'Node.js', 'PostgreSQL', 'Grafana'],
    teamSize: 5,
    created_at: daysAgo(240),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
];

export default applications;

/**
 * Get all mock applications.
 * @returns {Array<object>} Array of application objects.
 */
export function getAllApplications() {
  return [...applications];
}

/**
 * Find an application by ID.
 * @param {string} id - The application ID to find.
 * @returns {object|null} The application object, or null if not found.
 */
export function getApplicationById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return applications.find((app) => app.id === id) || null;
}

/**
 * Get all applications within a specific segment.
 * @param {string} segment - The segment to filter by (e.g., 'Claims', 'Billing').
 * @returns {Array<object>} Array of applications within the specified segment.
 */
export function getApplicationsBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return applications.filter((app) => app.segment === segment);
}

/**
 * Get all applications owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of applications owned by the specified user.
 */
export function getApplicationsByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return applications.filter((app) => app.owner === ownerId);
}

/**
 * Get all applications with a specific risk level.
 * @param {string} riskLevel - The risk level to filter by (e.g., 'low', 'medium', 'high').
 * @returns {Array<object>} Array of applications with the specified risk level.
 */
export function getApplicationsByRiskLevel(riskLevel) {
  if (!riskLevel || typeof riskLevel !== 'string') {
    return [];
  }
  return applications.filter((app) => app.riskLevel === riskLevel);
}

/**
 * Get all applications with a specific status.
 * @param {string} status - The status to filter by (e.g., 'active', 'inactive').
 * @returns {Array<object>} Array of applications with the specified status.
 */
export function getApplicationsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return applications.filter((app) => app.status === status);
}

/**
 * Get all applications that use a specific technology.
 * @param {string} technology - The technology name to filter by (e.g., 'React', 'Java').
 * @returns {Array<object>} Array of applications using the specified technology.
 */
export function getApplicationsByTechnology(technology) {
  if (!technology || typeof technology !== 'string') {
    return [];
  }
  return applications.filter(
    (app) =>
      Array.isArray(app.technology) && app.technology.includes(technology),
  );
}

/**
 * Get distinct segments from the application data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < applications.length; i++) {
    if (applications[i].segment) {
      segments.add(applications[i].segment);
    }
  }
  return [...segments].sort();
}

/**
 * Get distinct technologies from the application data.
 * @returns {string[]} Array of unique technology strings.
 */
export function getDistinctTechnologies() {
  const technologies = new Set();
  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    if (Array.isArray(app.technology)) {
      for (let j = 0; j < app.technology.length; j++) {
        technologies.add(app.technology[j]);
      }
    }
  }
  return [...technologies].sort();
}

/**
 * Get a count of applications grouped by segment.
 * @returns {object} Object with segment keys and count values.
 */
export function getApplicationCountBySegment() {
  const counts = {};
  for (let i = 0; i < applications.length; i++) {
    const segment = applications[i].segment;
    counts[segment] = (counts[segment] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of applications grouped by risk level.
 * @returns {object} Object with risk level keys and count values.
 */
export function getApplicationCountByRiskLevel() {
  const counts = {};
  for (let i = 0; i < applications.length; i++) {
    const riskLevel = applications[i].riskLevel;
    counts[riskLevel] = (counts[riskLevel] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average quality score across all applications.
 * @returns {number} The average quality score, or 0 if no applications exist.
 */
export function getAverageQualityScore() {
  if (applications.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < applications.length; i++) {
    total += applications[i].qualityScore || 0;
  }
  return Math.round((total / applications.length) * 100) / 100;
}

/**
 * Calculate the average automation coverage across all applications.
 * @returns {number} The average automation coverage percentage, or 0 if no applications exist.
 */
export function getAverageAutomationCoverage() {
  if (applications.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < applications.length; i++) {
    total += applications[i].automationCoverage || 0;
  }
  return Math.round((total / applications.length) * 100) / 100;
}

/**
 * Calculate the average test coverage across all applications.
 * @returns {number} The average test coverage percentage, or 0 if no applications exist.
 */
export function getAverageTestCoverage() {
  if (applications.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < applications.length; i++) {
    total += applications[i].testCoverage || 0;
  }
  return Math.round((total / applications.length) * 100) / 100;
}

/**
 * Calculate the average defect density across all applications.
 * @returns {number} The average defect density, or 0 if no applications exist.
 */
export function getAverageDefectDensity() {
  if (applications.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < applications.length; i++) {
    total += applications[i].defectDensity || 0;
  }
  return Math.round((total / applications.length) * 100) / 100;
}

/**
 * Get applications sorted by quality score in descending order.
 * @param {number} [limit] - Optional maximum number of applications to return.
 * @returns {Array<object>} Array of applications sorted by quality score.
 */
export function getTopApplicationsByQualityScore(limit) {
  const sorted = [...applications].sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get applications with the highest risk (sorted by quality score ascending).
 * @param {number} [limit] - Optional maximum number of applications to return.
 * @returns {Array<object>} Array of at-risk applications sorted by quality score ascending.
 */
export function getAtRiskApplications(limit) {
  const sorted = [...applications].sort((a, b) => (a.qualityScore || 0) - (b.qualityScore || 0));
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Find an application by name (case-insensitive).
 * @param {string} name - The application name to search for.
 * @returns {object|null} The application object, or null if not found.
 */
export function getApplicationByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return applications.find((app) => app.name.toLowerCase() === nameLower) || null;
}