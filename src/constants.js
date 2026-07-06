/**
 * Application-wide constants for eQIP Quality Intelligence
 * @module constants
 */

// ---------------------------------------------------------------------------
// RBAC Role Names (10 roles)
// ---------------------------------------------------------------------------
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  PROGRAM_MANAGER: 'program_manager',
  PROJECT_MANAGER: 'project_manager',
  QA_LEAD: 'qa_lead',
  QA_ENGINEER: 'qa_engineer',
  DEVELOPER: 'developer',
  BUSINESS_ANALYST: 'business_analyst',
  RELEASE_MANAGER: 'release_manager',
  SCRUM_MASTER: 'scrum_master',
  VIEWER: 'viewer',
});

// ---------------------------------------------------------------------------
// Persona-to-Role Mappings (25 personas)
// ---------------------------------------------------------------------------
export const PERSONA_ROLE_MAP = Object.freeze({
  'VP of Quality': ROLES.ADMIN,
  'Director of QA': ROLES.ADMIN,
  'Quality Assurance Manager': ROLES.QA_LEAD,
  'QA Team Lead': ROLES.QA_LEAD,
  'Senior QA Engineer': ROLES.QA_ENGINEER,
  'QA Engineer': ROLES.QA_ENGINEER,
  'Junior QA Engineer': ROLES.QA_ENGINEER,
  'Test Automation Engineer': ROLES.QA_ENGINEER,
  'Performance Test Engineer': ROLES.QA_ENGINEER,
  'Security Test Engineer': ROLES.QA_ENGINEER,
  'Program Director': ROLES.PROGRAM_MANAGER,
  'Program Manager': ROLES.PROGRAM_MANAGER,
  'Project Manager': ROLES.PROJECT_MANAGER,
  'Delivery Manager': ROLES.PROJECT_MANAGER,
  'Scrum Master': ROLES.SCRUM_MASTER,
  'Agile Coach': ROLES.SCRUM_MASTER,
  'Release Manager': ROLES.RELEASE_MANAGER,
  'Release Engineer': ROLES.RELEASE_MANAGER,
  'Software Developer': ROLES.DEVELOPER,
  'Senior Developer': ROLES.DEVELOPER,
  'Tech Lead': ROLES.DEVELOPER,
  'Business Analyst': ROLES.BUSINESS_ANALYST,
  'Product Owner': ROLES.BUSINESS_ANALYST,
  'Stakeholder': ROLES.VIEWER,
  'Executive Sponsor': ROLES.VIEWER,
});

// ---------------------------------------------------------------------------
// Navigation Item Definitions with Role Visibility Rules
// ---------------------------------------------------------------------------
export const NAV_ITEMS = Object.freeze([
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
    roles: [
      ROLES.ADMIN,
      ROLES.PROGRAM_MANAGER,
      ROLES.PROJECT_MANAGER,
      ROLES.QA_LEAD,
      ROLES.QA_ENGINEER,
      ROLES.DEVELOPER,
      ROLES.BUSINESS_ANALYST,
      ROLES.RELEASE_MANAGER,
      ROLES.SCRUM_MASTER,
      ROLES.VIEWER,
    ],
  },
  {
    key: 'demands',
    label: 'Demands',
    path: '/demands',
    icon: 'demands',
    roles: [
      ROLES.ADMIN,
      ROLES.PROGRAM_MANAGER,
      ROLES.PROJECT_MANAGER,
      ROLES.QA_LEAD,
      ROLES.BUSINESS_ANALYST,
      ROLES.SCRUM_MASTER,
    ],
  },
  {
    key: 'test-assets',
    label: 'Test Assets',
    path: '/test-assets',
    icon: 'test-assets',
    roles: [
      ROLES.ADMIN,
      ROLES.QA_LEAD,
      ROLES.QA_ENGINEER,
      ROLES.DEVELOPER,
    ],
  },
  {
    key: 'quality-gates',
    label: 'Quality Gates',
    path: '/quality-gates',
    icon: 'quality-gates',
    roles: [
      ROLES.ADMIN,
      ROLES.PROGRAM_MANAGER,
      ROLES.PROJECT_MANAGER,
      ROLES.QA_LEAD,
      ROLES.RELEASE_MANAGER,
    ],
  },
  {
    key: 'metrics',
    label: 'Metrics',
    path: '/metrics',
    icon: 'metrics',
    roles: [
      ROLES.ADMIN,
      ROLES.PROGRAM_MANAGER,
      ROLES.PROJECT_MANAGER,
      ROLES.QA_LEAD,
      ROLES.QA_ENGINEER,
      ROLES.SCRUM_MASTER,
      ROLES.VIEWER,
    ],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    path: '/integrations',
    icon: 'integrations',
    roles: [ROLES.ADMIN, ROLES.RELEASE_MANAGER],
  },
  {
    key: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'reports',
    roles: [
      ROLES.ADMIN,
      ROLES.PROGRAM_MANAGER,
      ROLES.PROJECT_MANAGER,
      ROLES.QA_LEAD,
      ROLES.BUSINESS_ANALYST,
      ROLES.VIEWER,
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'settings',
    roles: [ROLES.ADMIN],
  },
]);

// ---------------------------------------------------------------------------
// Demand Types (10)
// ---------------------------------------------------------------------------
export const DEMAND_TYPES = Object.freeze([
  'Feature',
  'Enhancement',
  'Bug Fix',
  'Technical Debt',
  'Security Patch',
  'Compliance',
  'Infrastructure',
  'Data Migration',
  'Integration',
  'Research Spike',
]);

// ---------------------------------------------------------------------------
// Test Asset Types (13)
// ---------------------------------------------------------------------------
export const TEST_ASSET_TYPES = Object.freeze([
  'Test Plan',
  'Test Suite',
  'Test Case',
  'Test Script',
  'Test Data',
  'Automation Script',
  'Performance Script',
  'Security Scan Config',
  'API Collection',
  'Mock Service',
  'Test Environment Config',
  'Accessibility Checklist',
  'Regression Pack',
]);

// ---------------------------------------------------------------------------
// Quality Gate Definitions (16)
// ---------------------------------------------------------------------------
export const QUALITY_GATES = Object.freeze([
  {
    key: 'requirements_review',
    label: 'Requirements Review',
    phase: 'planning',
    description: 'All requirements reviewed and approved by stakeholders.',
  },
  {
    key: 'design_review',
    label: 'Design Review',
    phase: 'planning',
    description: 'Architecture and design documents reviewed and signed off.',
  },
  {
    key: 'test_plan_approval',
    label: 'Test Plan Approval',
    phase: 'planning',
    description: 'Test plan reviewed and approved by QA lead.',
  },
  {
    key: 'code_review',
    label: 'Code Review',
    phase: 'development',
    description: 'All code changes peer-reviewed and approved.',
  },
  {
    key: 'static_analysis',
    label: 'Static Analysis',
    phase: 'development',
    description: 'Static analysis tools report zero critical issues.',
  },
  {
    key: 'unit_test_coverage',
    label: 'Unit Test Coverage',
    phase: 'development',
    description: 'Unit test coverage meets the minimum threshold.',
  },
  {
    key: 'build_verification',
    label: 'Build Verification',
    phase: 'build',
    description: 'Build completes successfully with no errors.',
  },
  {
    key: 'smoke_test',
    label: 'Smoke Test',
    phase: 'testing',
    description: 'Core smoke tests pass in the target environment.',
  },
  {
    key: 'functional_test',
    label: 'Functional Test',
    phase: 'testing',
    description: 'All functional test cases executed and passed.',
  },
  {
    key: 'regression_test',
    label: 'Regression Test',
    phase: 'testing',
    description: 'Full regression suite executed with acceptable pass rate.',
  },
  {
    key: 'performance_test',
    label: 'Performance Test',
    phase: 'testing',
    description: 'Performance benchmarks met under expected load.',
  },
  {
    key: 'security_scan',
    label: 'Security Scan',
    phase: 'testing',
    description: 'Security scan completed with no critical vulnerabilities.',
  },
  {
    key: 'accessibility_audit',
    label: 'Accessibility Audit',
    phase: 'testing',
    description: 'Accessibility standards (WCAG) compliance verified.',
  },
  {
    key: 'uat_signoff',
    label: 'UAT Sign-off',
    phase: 'acceptance',
    description: 'User acceptance testing completed and signed off.',
  },
  {
    key: 'release_readiness',
    label: 'Release Readiness',
    phase: 'release',
    description: 'All release criteria met and deployment checklist completed.',
  },
  {
    key: 'post_deployment_verification',
    label: 'Post-Deployment Verification',
    phase: 'release',
    description: 'Production verification tests pass after deployment.',
  },
]);

// ---------------------------------------------------------------------------
// Integration System Names (20)
// ---------------------------------------------------------------------------
export const INTEGRATION_SYSTEMS = Object.freeze([
  'Jira',
  'Azure DevOps',
  'ServiceNow',
  'Rally',
  'GitHub',
  'GitLab',
  'Bitbucket',
  'Jenkins',
  'CircleCI',
  'Bamboo',
  'Selenium Grid',
  'BrowserStack',
  'SonarQube',
  'Fortify',
  'Veracode',
  'Splunk',
  'Datadog',
  'PagerDuty',
  'Slack',
  'Microsoft Teams',
]);

// ---------------------------------------------------------------------------
// Metric Formula Definitions
// ---------------------------------------------------------------------------
export const METRIC_FORMULAS = Object.freeze({
  defect_density: {
    key: 'defect_density',
    label: 'Defect Density',
    formula: 'total_defects / size_kloc',
    unit: 'defects/KLOC',
    description: 'Number of defects per thousand lines of code.',
  },
  defect_removal_efficiency: {
    key: 'defect_removal_efficiency',
    label: 'Defect Removal Efficiency',
    formula: '(defects_found_before_release / total_defects) * 100',
    unit: '%',
    description: 'Percentage of defects found before production release.',
  },
  test_case_pass_rate: {
    key: 'test_case_pass_rate',
    label: 'Test Case Pass Rate',
    formula: '(passed_tests / total_tests) * 100',
    unit: '%',
    description: 'Percentage of test cases that passed.',
  },
  test_execution_rate: {
    key: 'test_execution_rate',
    label: 'Test Execution Rate',
    formula: '(executed_tests / planned_tests) * 100',
    unit: '%',
    description: 'Percentage of planned test cases that have been executed.',
  },
  automation_coverage: {
    key: 'automation_coverage',
    label: 'Automation Coverage',
    formula: '(automated_tests / total_tests) * 100',
    unit: '%',
    description: 'Percentage of test cases that are automated.',
  },
  mean_time_to_detect: {
    key: 'mean_time_to_detect',
    label: 'Mean Time to Detect (MTTD)',
    formula: 'sum(detection_times) / total_defects',
    unit: 'hours',
    description: 'Average time to detect a defect after introduction.',
  },
  mean_time_to_resolve: {
    key: 'mean_time_to_resolve',
    label: 'Mean Time to Resolve (MTTR)',
    formula: 'sum(resolution_times) / total_defects',
    unit: 'hours',
    description: 'Average time to resolve a defect after detection.',
  },
  escaped_defect_rate: {
    key: 'escaped_defect_rate',
    label: 'Escaped Defect Rate',
    formula: '(production_defects / total_defects) * 100',
    unit: '%',
    description: 'Percentage of defects found in production.',
  },
  requirement_coverage: {
    key: 'requirement_coverage',
    label: 'Requirement Coverage',
    formula: '(requirements_with_tests / total_requirements) * 100',
    unit: '%',
    description: 'Percentage of requirements covered by at least one test.',
  },
  quality_gate_compliance: {
    key: 'quality_gate_compliance',
    label: 'Quality Gate Compliance',
    formula: '(gates_passed / total_gates) * 100',
    unit: '%',
    description: 'Percentage of quality gates that have been passed.',
  },
});

// ---------------------------------------------------------------------------
// localStorage Keys
// ---------------------------------------------------------------------------
export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'eqip_auth_token',
  USER_PROFILE: 'eqip_user_profile',
  SELECTED_ROLE: 'eqip_selected_role',
  THEME_PREFERENCE: 'eqip_theme_preference',
  SIDEBAR_COLLAPSED: 'eqip_sidebar_collapsed',
  LAST_VISITED_PATH: 'eqip_last_visited_path',
  FILTER_PREFERENCES: 'eqip_filter_preferences',
  DASHBOARD_LAYOUT: 'eqip_dashboard_layout',
});

// ---------------------------------------------------------------------------
// API Endpoint Paths
// ---------------------------------------------------------------------------
export const API_ENDPOINTS = Object.freeze({
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_PROFILE: '/api/auth/profile',
  USERS: '/api/users',
  USERS_BY_ID: '/api/users/:id',
  DEMANDS: '/api/demands',
  DEMANDS_BY_ID: '/api/demands/:id',
  TEST_ASSETS: '/api/test-assets',
  TEST_ASSETS_BY_ID: '/api/test-assets/:id',
  QUALITY_GATES: '/api/quality-gates',
  QUALITY_GATES_BY_ID: '/api/quality-gates/:id',
  QUALITY_GATE_STATUS: '/api/quality-gates/:id/status',
  METRICS: '/api/metrics',
  METRICS_SUMMARY: '/api/metrics/summary',
  METRICS_TRENDS: '/api/metrics/trends',
  INTEGRATIONS: '/api/integrations',
  INTEGRATIONS_BY_ID: '/api/integrations/:id',
  INTEGRATIONS_SYNC: '/api/integrations/:id/sync',
  REPORTS: '/api/reports',
  REPORTS_GENERATE: '/api/reports/generate',
  REPORTS_EXPORT: '/api/reports/export',
  SETTINGS: '/api/settings',
});

// ---------------------------------------------------------------------------
// Status Enums
// ---------------------------------------------------------------------------
export const STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ARCHIVED: 'archived',
});

export const GATE_STATUS = Object.freeze({
  NOT_STARTED: 'not_started',
  IN_REVIEW: 'in_review',
  PASSED: 'passed',
  FAILED: 'failed',
  WAIVED: 'waived',
  BLOCKED: 'blocked',
});

export const DEFECT_SEVERITY = Object.freeze({
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFORMATIONAL: 'informational',
});

export const DEFECT_PRIORITY = Object.freeze({
  P1: 'p1',
  P2: 'p2',
  P3: 'p3',
  P4: 'p4',
});

export const TEST_EXECUTION_STATUS = Object.freeze({
  NOT_RUN: 'not_run',
  PASSED: 'passed',
  FAILED: 'failed',
  BLOCKED: 'blocked',
  SKIPPED: 'skipped',
  IN_PROGRESS: 'in_progress',
});

export const INTEGRATION_STATUS = Object.freeze({
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  SYNCING: 'syncing',
  PENDING: 'pending',
});

// ---------------------------------------------------------------------------
// Design System Tokens
// ---------------------------------------------------------------------------
export const DESIGN_TOKENS = Object.freeze({
  colors: {
    primary: '#024E38',
    primaryLight: '#046843',
    primaryDark: '#013626',
    accent: '#78BE20',
    accentLight: '#96d933',
    accentDark: '#589117',
    success: '#78BE20',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#3B82F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textDisabled: '#9CA3AF',
    surfaceBase: '#FFFFFF',
    surfaceRaised: '#F9FAFB',
    surfaceSunken: '#F3F4F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    standard: '4px',
    card: '8px',
    modal: '8px',
    full: '9999px',
  },
  typography: {
    fontFamily: '"Public Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  transitions: {
    fast: '150ms ease',
    normal: '200ms ease',
    slow: '300ms ease',
  },
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
});