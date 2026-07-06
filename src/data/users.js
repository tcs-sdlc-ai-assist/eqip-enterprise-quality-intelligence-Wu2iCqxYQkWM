import { ROLES, PERSONA_ROLE_MAP } from '../constants.js';

/**
 * @module users
 * Mock user data seed for eQIP Quality Intelligence.
 * 25 pre-provisioned users representing all personas mapped to 10 RBAC roles.
 */

/**
 * Helper to generate a relative ISO date string.
 * @param {number} daysAgo - Number of days in the past.
 * @returns {string} ISO8601 date string.
 */
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Mock user data array with 25 pre-provisioned users.
 * Each user represents one of the 25 personas mapped to 10 RBAC roles.
 * PII fields (name, email, phone) are stored in masked form.
 * @type {Array<object>}
 */
const users = [
  {
    id: 'user-001',
    name: 'V*******n',
    email: 'v*****@e****.com',
    phone: '***-***-1001',
    role: ROLES.ADMIN,
    persona: 'VP of Quality',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score', 'release-readiness', 'defect-trends', 'quality-gates'] },
      aiAssistant: true,
    },
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'user-002',
    name: 'D*******r',
    email: 'd*****@e****.com',
    phone: '***-***-1002',
    role: ROLES.ADMIN,
    persona: 'Director of QA',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score', 'defect-density', 'automation-coverage'] },
      aiAssistant: true,
    },
    created_at: daysAgo(350),
    updated_at: daysAgo(1),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'user-003',
    name: 'Q*******r',
    email: 'q*****@e****.com',
    phone: '***-***-1003',
    role: ROLES.QA_LEAD,
    persona: 'Quality Assurance Manager',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/quality-gates',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['quality-gates', 'test-pass-rate', 'defect-removal-efficiency'] },
      aiAssistant: true,
    },
    created_at: daysAgo(300),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-004',
    name: 'T*******d',
    email: 't*****@e****.com',
    phone: '***-***-1004',
    role: ROLES.QA_LEAD,
    persona: 'QA Team Lead',
    segment: 'Billing',
    applicationAccess: ['Payment Gateway'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-pass-rate', 'automation-coverage', 'defect-trends'] },
      aiAssistant: false,
    },
    created_at: daysAgo(280),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'user-003',
  },
  {
    id: 'user-005',
    name: 'S*******r',
    email: 's*****@e****.com',
    phone: '***-***-1005',
    role: ROLES.QA_ENGINEER,
    persona: 'Senior QA Engineer',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-pass-rate', 'defect-density'] },
      aiAssistant: true,
    },
    created_at: daysAgo(270),
    updated_at: daysAgo(0),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'user-006',
    name: 'Q*******e',
    email: 'q*****e@e****.com',
    phone: '***-***-1006',
    role: ROLES.QA_ENGINEER,
    persona: 'QA Engineer',
    segment: 'Enrollment',
    applicationAccess: ['Member Portal'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-pass-rate', 'test-execution-rate'] },
      aiAssistant: false,
    },
    created_at: daysAgo(250),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'user-007',
    name: 'J*******r',
    email: 'j*****@e****.com',
    phone: '***-***-1007',
    role: ROLES.QA_ENGINEER,
    persona: 'Junior QA Engineer',
    segment: 'Provider',
    applicationAccess: ['Provider Directory'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 1, widgets: ['test-pass-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(120),
    updated_at: daysAgo(0),
    created_by: 'user-004',
    updated_by: 'system',
  },
  {
    id: 'user-008',
    name: 'A*******r',
    email: 'a*****@e****.com',
    phone: '***-***-1008',
    role: ROLES.QA_ENGINEER,
    persona: 'Test Automation Engineer',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['automation-coverage', 'test-execution-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(200),
    updated_at: daysAgo(0),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'user-009',
    name: 'P*******r',
    email: 'p*****@e****.com',
    phone: '***-***-1009',
    role: ROLES.QA_ENGINEER,
    persona: 'Performance Test Engineer',
    segment: 'Billing',
    applicationAccess: ['Payment Gateway'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(2),
    preferences: {
      defaultLandingPage: '/metrics',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-execution-rate', 'defect-density'] },
      aiAssistant: false,
    },
    created_at: daysAgo(190),
    updated_at: daysAgo(2),
    created_by: 'user-004',
    updated_by: 'system',
  },
  {
    id: 'user-010',
    name: 'S*******r',
    email: 's*****t@e****.com',
    phone: '***-***-1010',
    role: ROLES.QA_ENGINEER,
    persona: 'Security Test Engineer',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/quality-gates',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['quality-gates', 'escaped-defect-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(180),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-011',
    name: 'P*******r',
    email: 'p*****d@e****.com',
    phone: '***-***-1011',
    role: ROLES.PROGRAM_MANAGER,
    persona: 'Program Director',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score', 'release-readiness', 'quality-gates'] },
      aiAssistant: true,
    },
    created_at: daysAgo(340),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-012',
    name: 'P*******r',
    email: 'p*****m@e****.com',
    phone: '***-***-1012',
    role: ROLES.PROGRAM_MANAGER,
    persona: 'Program Manager',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score', 'defect-trends', 'release-readiness'] },
      aiAssistant: false,
    },
    created_at: daysAgo(320),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-013',
    name: 'P*******r',
    email: 'p*****j@e****.com',
    phone: '***-***-1013',
    role: ROLES.PROJECT_MANAGER,
    persona: 'Project Manager',
    segment: 'Billing',
    applicationAccess: ['Payment Gateway'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/demands',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['release-readiness', 'quality-gates', 'defect-trends'] },
      aiAssistant: true,
    },
    created_at: daysAgo(290),
    updated_at: daysAgo(0),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'user-014',
    name: 'D*******r',
    email: 'd*****m@e****.com',
    phone: '***-***-1014',
    role: ROLES.PROJECT_MANAGER,
    persona: 'Delivery Manager',
    segment: 'Enrollment',
    applicationAccess: ['Member Portal'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/demands',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['release-readiness', 'defect-trends'] },
      aiAssistant: false,
    },
    created_at: daysAgo(260),
    updated_at: daysAgo(1),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'user-015',
    name: 'S*******r',
    email: 's*****m@e****.com',
    phone: '***-***-1015',
    role: ROLES.SCRUM_MASTER,
    persona: 'Scrum Master',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/demands',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-execution-rate', 'defect-trends', 'release-readiness'] },
      aiAssistant: true,
    },
    created_at: daysAgo(240),
    updated_at: daysAgo(0),
    created_by: 'user-013',
    updated_by: 'system',
  },
  {
    id: 'user-016',
    name: 'A*******h',
    email: 'a*****c@e****.com',
    phone: '***-***-1016',
    role: ROLES.SCRUM_MASTER,
    persona: 'Agile Coach',
    segment: 'Billing',
    applicationAccess: ['Payment Gateway'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(2),
    preferences: {
      defaultLandingPage: '/metrics',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['test-execution-rate', 'automation-coverage'] },
      aiAssistant: false,
    },
    created_at: daysAgo(230),
    updated_at: daysAgo(2),
    created_by: 'user-013',
    updated_by: 'system',
  },
  {
    id: 'user-017',
    name: 'R*******r',
    email: 'r*****m@e****.com',
    phone: '***-***-1017',
    role: ROLES.RELEASE_MANAGER,
    persona: 'Release Manager',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/quality-gates',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['release-readiness', 'quality-gates', 'escaped-defect-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(310),
    updated_at: daysAgo(0),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-018',
    name: 'R*******r',
    email: 'r*****e@e****.com',
    phone: '***-***-1018',
    role: ROLES.RELEASE_MANAGER,
    persona: 'Release Engineer',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/integrations',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['release-readiness', 'quality-gates'] },
      aiAssistant: false,
    },
    created_at: daysAgo(220),
    updated_at: daysAgo(1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'user-019',
    name: 'S*******r',
    email: 's*****d@e****.com',
    phone: '***-***-1019',
    role: ROLES.DEVELOPER,
    persona: 'Software Developer',
    segment: 'Claims',
    applicationAccess: ['EQIP Core'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: false,
      dashboardLayout: { columns: 1, widgets: ['defect-density', 'test-pass-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(210),
    updated_at: daysAgo(0),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'user-020',
    name: 'S*******r',
    email: 's*****v@e****.com',
    phone: '***-***-1020',
    role: ROLES.DEVELOPER,
    persona: 'Senior Developer',
    segment: 'Billing',
    applicationAccess: ['Payment Gateway'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['defect-density', 'automation-coverage', 'test-pass-rate'] },
      aiAssistant: true,
    },
    created_at: daysAgo(200),
    updated_at: daysAgo(0),
    created_by: 'user-004',
    updated_by: 'system',
  },
  {
    id: 'user-021',
    name: 'T*******d',
    email: 't*****l@e****.com',
    phone: '***-***-1021',
    role: ROLES.DEVELOPER,
    persona: 'Tech Lead',
    segment: 'Enrollment',
    applicationAccess: ['Member Portal'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/test-assets',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['defect-density', 'test-pass-rate', 'automation-coverage'] },
      aiAssistant: true,
    },
    created_at: daysAgo(195),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'user-022',
    name: 'B*******t',
    email: 'b*****a@e****.com',
    phone: '***-***-1022',
    role: ROLES.BUSINESS_ANALYST,
    persona: 'Business Analyst',
    segment: 'Claims',
    applicationAccess: ['EQIP Core', 'Claims Processing'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(0),
    preferences: {
      defaultLandingPage: '/demands',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['requirement-coverage', 'release-readiness'] },
      aiAssistant: true,
    },
    created_at: daysAgo(260),
    updated_at: daysAgo(0),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'user-023',
    name: 'P*******r',
    email: 'p*****o@e****.com',
    phone: '***-***-1023',
    role: ROLES.BUSINESS_ANALYST,
    persona: 'Product Owner',
    segment: 'Enrollment',
    applicationAccess: ['Member Portal'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(1),
    preferences: {
      defaultLandingPage: '/demands',
      notifications: true,
      dashboardLayout: { columns: 2, widgets: ['requirement-coverage', 'defect-trends'] },
      aiAssistant: false,
    },
    created_at: daysAgo(240),
    updated_at: daysAgo(1),
    created_by: 'user-014',
    updated_by: 'system',
  },
  {
    id: 'user-024',
    name: 'S*******r',
    email: 's*****h@e****.com',
    phone: '***-***-1024',
    role: ROLES.VIEWER,
    persona: 'Stakeholder',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(3),
    preferences: {
      defaultLandingPage: '/',
      notifications: false,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score', 'release-readiness'] },
      aiAssistant: false,
    },
    created_at: daysAgo(180),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'user-025',
    name: 'E*******r',
    email: 'e*****s@e****.com',
    phone: '***-***-1025',
    role: ROLES.VIEWER,
    persona: 'Executive Sponsor',
    segment: 'Enterprise',
    applicationAccess: ['EQIP Core', 'Payment Gateway', 'Member Portal', 'Provider Directory', 'Rx Platform'],
    authSource: '***',
    status: 'active',
    lastLogin: daysAgo(5),
    preferences: {
      defaultLandingPage: '/reports',
      notifications: false,
      dashboardLayout: { columns: 2, widgets: ['enterprise-quality-score'] },
      aiAssistant: false,
    },
    created_at: daysAgo(365),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'system',
  },
];

export default users;

/**
 * Get all mock users.
 * @returns {Array<object>} Array of user objects.
 */
export function getAllUsers() {
  return [...users];
}

/**
 * Find a user by ID.
 * @param {string} id - The user ID to find.
 * @returns {object|null} The user object, or null if not found.
 */
export function getUserById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return users.find((user) => user.id === id) || null;
}

/**
 * Get all users with a specific role.
 * @param {string} role - The RBAC role to filter by.
 * @returns {Array<object>} Array of users with the specified role.
 */
export function getUsersByRole(role) {
  if (!role || typeof role !== 'string') {
    return [];
  }
  return users.filter((user) => user.role === role);
}

/**
 * Get all users with a specific persona.
 * @param {string} persona - The persona to filter by.
 * @returns {Array<object>} Array of users with the specified persona.
 */
export function getUsersByPersona(persona) {
  if (!persona || typeof persona !== 'string') {
    return [];
  }
  return users.filter((user) => user.persona === persona);
}

/**
 * Get all users within a specific segment.
 * @param {string} segment - The segment to filter by.
 * @returns {Array<object>} Array of users within the specified segment.
 */
export function getUsersBySegment(segment) {
  if (!segment || typeof segment !== 'string') {
    return [];
  }
  return users.filter((user) => user.segment === segment);
}

/**
 * Get all users with access to a specific application.
 * @param {string} application - The application name to filter by.
 * @returns {Array<object>} Array of users with access to the specified application.
 */
export function getUsersByApplication(application) {
  if (!application || typeof application !== 'string') {
    return [];
  }
  return users.filter(
    (user) => Array.isArray(user.applicationAccess) && user.applicationAccess.includes(application),
  );
}

/**
 * Get a count of users grouped by role.
 * @returns {object} Object with role keys and count values.
 */
export function getUserCountByRole() {
  const counts = {};
  for (let i = 0; i < users.length; i++) {
    const role = users[i].role;
    counts[role] = (counts[role] || 0) + 1;
  }
  return counts;
}

/**
 * Get distinct segments from the user data.
 * @returns {string[]} Array of unique segment strings.
 */
export function getDistinctSegments() {
  const segments = new Set();
  for (let i = 0; i < users.length; i++) {
    if (users[i].segment) {
      segments.add(users[i].segment);
    }
  }
  return [...segments].sort();
}