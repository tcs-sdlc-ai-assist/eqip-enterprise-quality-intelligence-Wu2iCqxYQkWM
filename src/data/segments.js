import { v4 as uuidv4 } from 'uuid';

/**
 * @module segments
 * Mock segment data seed for eQIP Quality Intelligence.
 * Business segments with Healthcare and Insurance domains, including sub-segments.
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
 * Mock segment data array with Healthcare and Insurance segments and sub-segments.
 * Each segment includes id, name, description, owner, applicationCount, releaseCount,
 * qualityScore, complianceStatus, and audit fields.
 * @type {Array<object>}
 */
const segments = [
  {
    id: 'seg-001',
    name: 'Claims',
    description: 'Claims processing and adjudication for all lines of business.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-012',
    applicationCount: 3,
    releaseCount: 5,
    qualityScore: 92,
    complianceStatus: 'compliant',
    applications: ['EQIP Core', 'Claims Processing', 'Claims Analytics'],
    status: 'active',
    created_at: daysAgo(365),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'seg-002',
    name: 'Billing',
    description: 'Billing, invoicing, and payment processing operations.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-013',
    applicationCount: 2,
    releaseCount: 4,
    qualityScore: 78,
    complianceStatus: 'compliant',
    applications: ['Payment Gateway', 'Billing Portal'],
    status: 'active',
    created_at: daysAgo(350),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'seg-003',
    name: 'Enrollment',
    description: 'Member enrollment, eligibility verification, and onboarding.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-014',
    applicationCount: 2,
    releaseCount: 3,
    qualityScore: 85,
    complianceStatus: 'compliant',
    applications: ['Member Portal', 'Enrollment Engine'],
    status: 'active',
    created_at: daysAgo(340),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
  {
    id: 'seg-004',
    name: 'Provider',
    description: 'Provider network management, credentialing, and directory services.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-011',
    applicationCount: 2,
    releaseCount: 2,
    qualityScore: 65,
    complianceStatus: 'at_risk',
    applications: ['Provider Directory', 'Credentialing System'],
    status: 'active',
    created_at: daysAgo(330),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'seg-005',
    name: 'Pharmacy',
    description: 'Pharmacy benefits management, formulary, and prescription processing.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-012',
    applicationCount: 2,
    releaseCount: 3,
    qualityScore: 88,
    complianceStatus: 'compliant',
    applications: ['Rx Platform', 'Formulary Manager'],
    status: 'active',
    created_at: daysAgo(320),
    updated_at: daysAgo(4),
    created_by: 'user-001',
    updated_by: 'user-002',
  },
  {
    id: 'seg-006',
    name: 'Enterprise',
    description: 'Enterprise-wide shared services, infrastructure, and cross-cutting concerns.',
    domain: 'Healthcare',
    parentSegmentId: null,
    owner: 'user-001',
    applicationCount: 5,
    releaseCount: 8,
    qualityScore: 91,
    complianceStatus: 'compliant',
    applications: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    status: 'active',
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'seg-007',
    name: 'Claims Adjudication',
    description: 'Automated and manual claims adjudication sub-processes.',
    domain: 'Healthcare',
    parentSegmentId: 'seg-001',
    owner: 'user-005',
    applicationCount: 1,
    releaseCount: 3,
    qualityScore: 94,
    complianceStatus: 'compliant',
    applications: ['Claims Processing'],
    status: 'active',
    created_at: daysAgo(300),
    updated_at: daysAgo(7),
    created_by: 'user-012',
    updated_by: 'user-005',
  },
  {
    id: 'seg-008',
    name: 'Claims Analytics',
    description: 'Claims data analytics, reporting, and fraud detection.',
    domain: 'Healthcare',
    parentSegmentId: 'seg-001',
    owner: 'user-022',
    applicationCount: 1,
    releaseCount: 2,
    qualityScore: 89,
    complianceStatus: 'compliant',
    applications: ['Claims Analytics'],
    status: 'active',
    created_at: daysAgo(280),
    updated_at: daysAgo(10),
    created_by: 'user-012',
    updated_by: 'user-022',
  },
  {
    id: 'seg-009',
    name: 'Underwriting',
    description: 'Risk assessment, policy underwriting, and rating engine.',
    domain: 'Insurance',
    parentSegmentId: null,
    owner: 'user-011',
    applicationCount: 2,
    releaseCount: 3,
    qualityScore: 82,
    complianceStatus: 'compliant',
    applications: ['Underwriting Engine', 'Risk Assessment Tool'],
    status: 'active',
    created_at: daysAgo(310),
    updated_at: daysAgo(6),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'seg-010',
    name: 'Policy Administration',
    description: 'Policy lifecycle management, issuance, endorsements, and renewals.',
    domain: 'Insurance',
    parentSegmentId: null,
    owner: 'user-013',
    applicationCount: 2,
    releaseCount: 4,
    qualityScore: 76,
    complianceStatus: 'at_risk',
    applications: ['Policy Admin System', 'Document Management'],
    status: 'active',
    created_at: daysAgo(300),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-013',
  },
  {
    id: 'seg-011',
    name: 'Insurance Claims',
    description: 'Insurance claims intake, investigation, and settlement processing.',
    domain: 'Insurance',
    parentSegmentId: null,
    owner: 'user-014',
    applicationCount: 2,
    releaseCount: 3,
    qualityScore: 80,
    complianceStatus: 'compliant',
    applications: ['Insurance Claims Portal', 'Settlement Engine'],
    status: 'active',
    created_at: daysAgo(290),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-014',
  },
  {
    id: 'seg-012',
    name: 'Actuarial',
    description: 'Actuarial modeling, reserving, and financial projections.',
    domain: 'Insurance',
    parentSegmentId: null,
    owner: 'user-011',
    applicationCount: 1,
    releaseCount: 2,
    qualityScore: 90,
    complianceStatus: 'compliant',
    applications: ['Actuarial Platform'],
    status: 'active',
    created_at: daysAgo(270),
    updated_at: daysAgo(14),
    created_by: 'user-001',
    updated_by: 'user-011',
  },
  {
    id: 'seg-013',
    name: 'Policy Renewals',
    description: 'Automated and manual policy renewal processing sub-segment.',
    domain: 'Insurance',
    parentSegmentId: 'seg-010',
    owner: 'user-023',
    applicationCount: 1,
    releaseCount: 2,
    qualityScore: 73,
    complianceStatus: 'at_risk',
    applications: ['Policy Admin System'],
    status: 'active',
    created_at: daysAgo(250),
    updated_at: daysAgo(8),
    created_by: 'user-013',
    updated_by: 'user-023',
  },
  {
    id: 'seg-014',
    name: 'Member Services',
    description: 'Member communication, support, and self-service capabilities.',
    domain: 'Healthcare',
    parentSegmentId: 'seg-003',
    owner: 'user-023',
    applicationCount: 1,
    releaseCount: 2,
    qualityScore: 87,
    complianceStatus: 'compliant',
    applications: ['Member Portal'],
    status: 'active',
    created_at: daysAgo(260),
    updated_at: daysAgo(9),
    created_by: 'user-014',
    updated_by: 'user-023',
  },
  {
    id: 'seg-015',
    name: 'Regulatory Compliance',
    description: 'Cross-domain regulatory compliance monitoring and reporting.',
    domain: 'Insurance',
    parentSegmentId: null,
    owner: 'user-001',
    applicationCount: 1,
    releaseCount: 1,
    qualityScore: 95,
    complianceStatus: 'compliant',
    applications: ['Compliance Dashboard'],
    status: 'active',
    created_at: daysAgo(240),
    updated_at: daysAgo(12),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
];

export default segments;

/**
 * Get all mock segments.
 * @returns {Array<object>} Array of segment objects.
 */
export function getAllSegments() {
  return [...segments];
}

/**
 * Find a segment by ID.
 * @param {string} id - The segment ID to find.
 * @returns {object|null} The segment object, or null if not found.
 */
export function getSegmentById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return segments.find((segment) => segment.id === id) || null;
}

/**
 * Get all segments within a specific domain.
 * @param {string} domain - The domain to filter by (e.g., 'Healthcare', 'Insurance').
 * @returns {Array<object>} Array of segments within the specified domain.
 */
export function getSegmentsByDomain(domain) {
  if (!domain || typeof domain !== 'string') {
    return [];
  }
  return segments.filter((segment) => segment.domain === domain);
}

/**
 * Get all top-level segments (no parent).
 * @returns {Array<object>} Array of top-level segment objects.
 */
export function getTopLevelSegments() {
  return segments.filter((segment) => segment.parentSegmentId === null);
}

/**
 * Get all sub-segments for a given parent segment ID.
 * @param {string} parentId - The parent segment ID.
 * @returns {Array<object>} Array of sub-segment objects.
 */
export function getSubSegments(parentId) {
  if (!parentId || typeof parentId !== 'string') {
    return [];
  }
  return segments.filter((segment) => segment.parentSegmentId === parentId);
}

/**
 * Get all segments owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of segments owned by the specified user.
 */
export function getSegmentsByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return segments.filter((segment) => segment.owner === ownerId);
}

/**
 * Get all segments with a specific compliance status.
 * @param {string} status - The compliance status to filter by (e.g., 'compliant', 'at_risk').
 * @returns {Array<object>} Array of segments with the specified compliance status.
 */
export function getSegmentsByComplianceStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return segments.filter((segment) => segment.complianceStatus === status);
}

/**
 * Get all segments that include a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of segments that include the specified application.
 */
export function getSegmentsByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return segments.filter(
    (segment) =>
      Array.isArray(segment.applications) && segment.applications.includes(application),
  );
}

/**
 * Get distinct domains from the segment data.
 * @returns {string[]} Array of unique domain strings.
 */
export function getDistinctDomains() {
  const domains = new Set();
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].domain) {
      domains.add(segments[i].domain);
    }
  }
  return [...domains].sort();
}

/**
 * Get a count of segments grouped by domain.
 * @returns {object} Object with domain keys and count values.
 */
export function getSegmentCountByDomain() {
  const counts = {};
  for (let i = 0; i < segments.length; i++) {
    const domain = segments[i].domain;
    counts[domain] = (counts[domain] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of segments grouped by compliance status.
 * @returns {object} Object with compliance status keys and count values.
 */
export function getSegmentCountByComplianceStatus() {
  const counts = {};
  for (let i = 0; i < segments.length; i++) {
    const status = segments[i].complianceStatus;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Calculate the average quality score across all segments.
 * @returns {number} The average quality score, or 0 if no segments exist.
 */
export function getAverageQualityScore() {
  if (segments.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < segments.length; i++) {
    total += segments[i].qualityScore || 0;
  }
  return Math.round((total / segments.length) * 100) / 100;
}