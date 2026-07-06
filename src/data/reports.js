import { v4 as uuidv4 } from 'uuid';

/**
 * @module reports
 * Mock report data seed for eQIP Quality Intelligence.
 * Report definitions, templates, and simulated report outputs for all PRD-specified
 * reporting categories with export format metadata, PII masking indicators,
 * scheduling, and audit fields.
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
 * Supported export formats for reports.
 * @type {Readonly<Array<string>>}
 */
export const REPORT_EXPORT_FORMATS = Object.freeze([
  'csv',
  'excel',
  'pdf',
  'powerpoint',
  'json',
]);

/**
 * Report categories aligned with PRD-specified reporting areas.
 * @type {Readonly<Array<string>>}
 */
export const REPORT_CATEGORIES = Object.freeze([
  'Release Readiness',
  'Quality Metrics',
  'Defect Analysis',
  'Test Coverage',
  'Governance Compliance',
  'Executive Summary',
  'Trend Analysis',
  'Integration Health',
  'Environment Status',
  'Demand Management',
]);

/**
 * Report schedule frequency options.
 * @type {Readonly<Array<string>>}
 */
export const REPORT_SCHEDULES = Object.freeze([
  'on_demand',
  'daily',
  'weekly',
  'bi-weekly',
  'monthly',
  'quarterly',
  'annually',
]);

/**
 * Mock report template definitions.
 * Each template defines the structure, filters, columns, and export options
 * for a specific report type.
 * @type {Array<object>}
 */
const reportTemplates = [
  {
    id: 'tmpl-001',
    name: 'Release Readiness Report',
    description: 'Comprehensive release readiness assessment including quality gate status, test results, defect summary, and approval status for a specific release.',
    category: 'Release Readiness',
    supportedFormats: ['csv', 'excel', 'pdf', 'powerpoint'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'releaseId', label: 'Release', type: 'select', required: true },
      { key: 'segment', label: 'Segment', type: 'select', required: false },
      { key: 'application', label: 'Application', type: 'select', required: false },
    ],
    columns: [
      'Release Name', 'Application', 'Segment', 'Status', 'Readiness Score',
      'Quality Gates Passed', 'Quality Gates Failed', 'Test Pass Rate',
      'Automation Coverage', 'Critical Defects', 'Open Defects', 'Approvals',
    ],
    maskedFields: ['created_by', 'updated_by', 'approver', 'assignee'],
    includeCharts: true,
    chartTypes: ['bar', 'gauge', 'table'],
    schedule: 'on_demand',
    owner: 'user-017',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'release_manager'],
    status: 'active',
    tags: ['release', 'readiness', 'quality-gates', 'executive'],
    version: 3,
    created_at: daysAgo(300),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'user-017',
  },
  {
    id: 'tmpl-002',
    name: 'Enterprise Quality Score Report',
    description: 'Enterprise-wide quality score breakdown by segment and application with trend analysis and metric-level detail.',
    category: 'Quality Metrics',
    supportedFormats: ['csv', 'excel', 'pdf', 'powerpoint'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
    ],
    columns: [
      'Metric Name', 'Value', 'Normalized Score', 'Weight', 'Unit',
      'Trend', 'Trend Percentage', 'Grade', 'Status',
    ],
    maskedFields: ['created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['line', 'radar', 'bar', 'gauge'],
    schedule: 'monthly',
    owner: 'user-001',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'viewer'],
    status: 'active',
    tags: ['quality-score', 'enterprise', 'metrics', 'executive'],
    version: 4,
    created_at: daysAgo(350),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'tmpl-003',
    name: 'Defect Analysis Report',
    description: 'Detailed defect analysis including density, severity distribution, resolution times, escaped defect rate, and root cause categorization.',
    category: 'Defect Analysis',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'excel',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
      { key: 'severity', label: 'Severity', type: 'multi-select', required: false },
      { key: 'status', label: 'Status', type: 'multi-select', required: false },
    ],
    columns: [
      'Defect ID', 'Title', 'Application', 'Segment', 'Severity', 'Priority',
      'Status', 'Assigned To', 'Created Date', 'Resolved Date',
      'Resolution Time (hrs)', 'Root Cause Category',
    ],
    maskedFields: ['assigned_to', 'created_by', 'updated_by', 'reporter'],
    includeCharts: true,
    chartTypes: ['pie', 'bar', 'line', 'heatmap'],
    schedule: 'weekly',
    owner: 'user-003',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'qa_engineer'],
    status: 'active',
    tags: ['defects', 'analysis', 'severity', 'trends'],
    version: 5,
    created_at: daysAgo(320),
    updated_at: daysAgo(2),
    created_by: 'user-003',
    updated_by: 'user-003',
  },
  {
    id: 'tmpl-004',
    name: 'Test Coverage & Execution Report',
    description: 'Test coverage analysis including requirement coverage, automation coverage, execution rates, pass rates, and test suite performance.',
    category: 'Test Coverage',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'excel',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
      { key: 'suiteId', label: 'Test Suite', type: 'multi-select', required: false },
      { key: 'automationStatus', label: 'Automation Status', type: 'multi-select', required: false },
    ],
    columns: [
      'Test Suite', 'Application', 'Total Cases', 'Automated', 'Manual',
      'Passed', 'Failed', 'Blocked', 'Skipped', 'Not Run',
      'Pass Rate (%)', 'Execution Rate (%)', 'Automation Coverage (%)',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['bar', 'stacked-bar', 'pie', 'line'],
    schedule: 'weekly',
    owner: 'user-008',
    roles: ['admin', 'qa_lead', 'qa_engineer', 'developer'],
    status: 'active',
    tags: ['testing', 'coverage', 'automation', 'execution'],
    version: 3,
    created_at: daysAgo(280),
    updated_at: daysAgo(4),
    created_by: 'user-003',
    updated_by: 'user-008',
  },
  {
    id: 'tmpl-005',
    name: 'Governance Compliance Report',
    description: 'Governance procedure compliance status, findings summary, overdue reviews, and remediation tracking across all segments.',
    category: 'Governance Compliance',
    supportedFormats: ['csv', 'excel', 'pdf', 'powerpoint'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'category', label: 'Category', type: 'multi-select', required: false },
      { key: 'complianceStatus', label: 'Compliance Status', type: 'multi-select', required: false },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
    ],
    columns: [
      'Procedure Name', 'Category', 'Compliance Status', 'Compliance Rate (%)',
      'Open Findings', 'Resolved Findings', 'Last Review Date',
      'Next Review Date', 'Risk Level', 'Owner',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['bar', 'gauge', 'table', 'pie'],
    schedule: 'quarterly',
    owner: 'user-001',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'business_analyst', 'viewer'],
    status: 'active',
    tags: ['governance', 'compliance', 'regulatory', 'findings'],
    version: 2,
    created_at: daysAgo(240),
    updated_at: daysAgo(8),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'tmpl-006',
    name: 'Executive Summary Report',
    description: 'High-level executive summary of enterprise quality posture including quality score, release status, critical alerts, and key recommendations.',
    category: 'Executive Summary',
    supportedFormats: ['pdf', 'powerpoint'],
    defaultFormat: 'powerpoint',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
    ],
    columns: [
      'Enterprise Quality Score', 'Grade', 'Release Readiness Score',
      'Total Releases', 'At-Risk Releases', 'Critical Alerts',
      'Automation Coverage (%)', 'Governance Compliance (%)',
      'Key Recommendations',
    ],
    maskedFields: ['created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['gauge', 'bar', 'line', 'kpi-card'],
    schedule: 'monthly',
    owner: 'user-001',
    roles: ['admin', 'program_manager', 'viewer'],
    status: 'active',
    tags: ['executive', 'summary', 'quality-score', 'strategic'],
    version: 3,
    created_at: daysAgo(310),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'tmpl-007',
    name: 'Quality Trend Analysis Report',
    description: 'Historical trend analysis for all quality metrics over configurable time periods with segment and application breakdowns.',
    category: 'Trend Analysis',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'metricKeys', label: 'Metrics', type: 'multi-select', required: false },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
      { key: 'granularity', label: 'Granularity', type: 'select', required: false },
    ],
    columns: [
      'Period', 'Metric Name', 'Value', 'Previous Value', 'Change',
      'Change (%)', 'Trend Direction', 'Segment', 'Application',
    ],
    maskedFields: ['created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['line', 'area', 'bar'],
    schedule: 'monthly',
    owner: 'user-003',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'qa_engineer', 'scrum_master', 'viewer'],
    status: 'active',
    tags: ['trends', 'analysis', 'historical', 'metrics'],
    version: 2,
    created_at: daysAgo(200),
    updated_at: daysAgo(6),
    created_by: 'user-003',
    updated_by: 'user-003',
  },
  {
    id: 'tmpl-008',
    name: 'Integration Health Report',
    description: 'Health status, uptime, error counts, sync history, and resilience pattern status for all configured integrations.',
    category: 'Integration Health',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'excel',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'status', label: 'Status', type: 'multi-select', required: false },
      { key: 'category', label: 'Category', type: 'multi-select', required: false },
    ],
    columns: [
      'Integration Name', 'Type', 'Category', 'Status', 'Uptime (%)',
      'Error Count', 'Last Sync', 'Sync Frequency', 'Records Synced',
      'Resilience Pattern', 'Health Check Status',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['bar', 'table', 'gauge'],
    schedule: 'weekly',
    owner: 'user-017',
    roles: ['admin', 'release_manager'],
    status: 'active',
    tags: ['integrations', 'health', 'uptime', 'sync'],
    version: 2,
    created_at: daysAgo(180),
    updated_at: daysAgo(3),
    created_by: 'user-017',
    updated_by: 'user-017',
  },
  {
    id: 'tmpl-009',
    name: 'Environment Status Report',
    description: 'Environment health, readiness scores, conflict flags, reservation status, and capacity utilization across all environments.',
    category: 'Environment Status',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'excel',
    filters: [
      { key: 'type', label: 'Environment Type', type: 'multi-select', required: false },
      { key: 'status', label: 'Status', type: 'multi-select', required: false },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
    ],
    columns: [
      'Environment Name', 'Type', 'Status', 'Segment', 'Readiness Score',
      'Applications', 'Active Reservations', 'Open Conflicts',
      'CPU Usage (%)', 'Memory Usage (%)', 'Storage Usage (%)',
      'Last Deployment', 'Last Data Refresh',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['bar', 'table', 'heatmap'],
    schedule: 'weekly',
    owner: 'user-003',
    roles: ['admin', 'qa_lead', 'qa_engineer', 'release_manager'],
    status: 'active',
    tags: ['environments', 'health', 'capacity', 'readiness'],
    version: 2,
    created_at: daysAgo(160),
    updated_at: daysAgo(5),
    created_by: 'user-003',
    updated_by: 'user-003',
  },
  {
    id: 'tmpl-010',
    name: 'Demand Management Report',
    description: 'Demand pipeline status, effort tracking, approval workflow status, and backlog analysis across all segments and applications.',
    category: 'Demand Management',
    supportedFormats: ['csv', 'excel', 'pdf'],
    defaultFormat: 'excel',
    filters: [
      { key: 'dateRange', label: 'Date Range', type: 'daterange', required: true },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
      { key: 'type', label: 'Demand Type', type: 'multi-select', required: false },
      { key: 'status', label: 'Status', type: 'multi-select', required: false },
      { key: 'priority', label: 'Priority', type: 'multi-select', required: false },
    ],
    columns: [
      'Demand ID', 'Title', 'Type', 'Segment', 'Application', 'Priority',
      'Severity', 'Status', 'Workflow State', 'Approval Status',
      'Estimated Effort', 'Actual Effort', 'Assigned To', 'Target Release',
    ],
    maskedFields: ['assigned_to', 'requested_by', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['bar', 'pie', 'stacked-bar', 'table'],
    schedule: 'weekly',
    owner: 'user-012',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'business_analyst', 'scrum_master'],
    status: 'active',
    tags: ['demands', 'backlog', 'effort', 'pipeline'],
    version: 3,
    created_at: daysAgo(250),
    updated_at: daysAgo(2),
    created_by: 'user-012',
    updated_by: 'user-012',
  },
  {
    id: 'tmpl-011',
    name: 'Regulatory Compliance Report',
    description: 'Quarterly regulatory compliance report for HIPAA, SOX, and CMS requirements with compliance score trends and procedure status.',
    category: 'Governance Compliance',
    supportedFormats: ['csv', 'pdf'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'dateRange', label: 'Reporting Period', type: 'daterange', required: true },
      { key: 'regulationType', label: 'Regulation Type', type: 'multi-select', required: false },
    ],
    columns: [
      'Regulation', 'Requirement', 'Compliance Status', 'Evidence',
      'Last Audit Date', 'Next Audit Date', 'Findings', 'Remediation Status',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by', 'auditor'],
    includeCharts: true,
    chartTypes: ['gauge', 'table', 'bar'],
    schedule: 'quarterly',
    owner: 'user-001',
    roles: ['admin', 'program_manager', 'viewer'],
    status: 'active',
    tags: ['regulatory', 'hipaa', 'sox', 'cms', 'compliance'],
    version: 2,
    created_at: daysAgo(220),
    updated_at: daysAgo(10),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
  {
    id: 'tmpl-012',
    name: 'Application Quality Scorecard',
    description: 'Per-application quality scorecard with quality score, automation coverage, defect density, governance compliance, and risk level.',
    category: 'Quality Metrics',
    supportedFormats: ['csv', 'excel', 'pdf', 'powerpoint'],
    defaultFormat: 'pdf',
    filters: [
      { key: 'application', label: 'Application', type: 'multi-select', required: false },
      { key: 'segment', label: 'Segment', type: 'multi-select', required: false },
      { key: 'riskLevel', label: 'Risk Level', type: 'multi-select', required: false },
    ],
    columns: [
      'Application', 'Segment', 'Quality Score', 'Automation Coverage (%)',
      'Test Coverage (%)', 'Defect Density', 'Governance Compliance (%)',
      'Risk Level', 'Team Size', 'Technology Stack',
    ],
    maskedFields: ['owner', 'created_by', 'updated_by'],
    includeCharts: true,
    chartTypes: ['radar', 'bar', 'table', 'heatmap'],
    schedule: 'monthly',
    owner: 'user-001',
    roles: ['admin', 'program_manager', 'project_manager', 'qa_lead', 'viewer'],
    status: 'active',
    tags: ['application', 'scorecard', 'quality', 'comparison'],
    version: 2,
    created_at: daysAgo(190),
    updated_at: daysAgo(4),
    created_by: 'user-001',
    updated_by: 'user-001',
  },
];

/**
 * Mock generated report instances.
 * Each report represents a specific execution of a report template with
 * applied filters, generated output data, and export metadata.
 * @type {Array<object>}
 */
const reportInstances = [
  {
    id: 'rpt-001',
    templateId: 'tmpl-006',
    templateName: 'Executive Summary Report',
    name: 'Executive Summary - Q2 2024',
    description: 'Quarterly executive summary of enterprise quality posture for Q2 2024.',
    category: 'Executive Summary',
    status: 'completed',
    format: 'powerpoint',
    filters: {
      dateRange: { start: daysAgo(90), end: daysAgo(0) },
      segment: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 4500,
    fileUrl: '/mock-exports/executive-summary-q2-2024.pptx.txt',
    fileSizeBytes: 2097152,
    recordCount: 19,
    maskedFields: ['created_by', 'updated_by'],
    outputSummary: {
      enterpriseQualityScore: 82.5,
      grade: 'B',
      releaseReadinessScore: 79.4,
      totalReleases: 10,
      atRiskReleases: 1,
      criticalAlerts: 4,
      automationCoverage: 63.2,
      governanceCompliance: 87.87,
      keyRecommendations: [
        'Address Provider Directory quality score decline (65, Grade D)',
        'Increase enterprise automation coverage from 63.2% to 80% target',
        'Resolve Okta integration disconnection',
        'Address 4 at-risk governance procedures',
      ],
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['executive', 'quarterly', 'q2-2024'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-002',
    templateId: 'tmpl-002',
    templateName: 'Enterprise Quality Score Report',
    name: 'Enterprise Quality Score - June 2024',
    description: 'Monthly enterprise quality score breakdown with segment and application analysis.',
    category: 'Quality Metrics',
    status: 'completed',
    format: 'pdf',
    filters: {
      dateRange: { start: daysAgo(30), end: daysAgo(0) },
      segment: [],
      application: [],
    },
    generatedAt: daysAndHoursAgo(0, 5),
    generationDurationMs: 3200,
    fileUrl: '/mock-exports/enterprise-quality-score-june-2024.pdf.txt',
    fileSizeBytes: 1572864,
    recordCount: 13,
    maskedFields: ['created_by', 'updated_by'],
    outputSummary: {
      enterpriseQualityScore: 82.5,
      grade: 'B',
      trend: 'improving',
      trendPercentage: 2.3,
      topMetric: { name: 'Defect Density', value: 0.59, score: 100 },
      bottomMetric: { name: 'Escaped Defect Rate', value: 3.2, score: 62.5 },
      segmentScores: {
        Claims: 92,
        Billing: 78,
        Enrollment: 85,
        Provider: 65,
        Pharmacy: 88,
        Enterprise: 92,
        Underwriting: 82,
        'Policy Administration': 76,
        'Insurance Claims': 80,
        Actuarial: 90,
        'Regulatory Compliance': 95,
      },
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['quality-score', 'monthly', 'june-2024'],
    version: 1,
    created_at: daysAndHoursAgo(0, 5),
    updated_at: daysAndHoursAgo(0, 5),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-003',
    templateId: 'tmpl-003',
    templateName: 'Defect Analysis Report',
    name: 'Defect Analysis - Claims Segment - June 2024',
    description: 'Weekly defect analysis for the Claims segment covering severity distribution, resolution times, and trends.',
    category: 'Defect Analysis',
    status: 'completed',
    format: 'excel',
    filters: {
      dateRange: { start: daysAgo(7), end: daysAgo(0) },
      segment: ['Claims'],
      application: [],
      severity: [],
      status: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 2100,
    fileUrl: '/mock-exports/defect-analysis-claims-june-2024.xlsx',
    fileSizeBytes: 524288,
    recordCount: 12,
    maskedFields: ['assigned_to', 'created_by', 'updated_by', 'reporter'],
    outputSummary: {
      totalDefects: 12,
      critical: 0,
      high: 1,
      medium: 5,
      low: 6,
      openDefects: 1,
      resolvedDefects: 11,
      averageResolutionTimeHrs: 5.5,
      defectDensity: 0.42,
      escapedDefectRate: 1.5,
    },
    requestedBy: 'user-003',
    owner: 'user-003',
    tags: ['defects', 'claims', 'weekly'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'rpt-004',
    templateId: 'tmpl-004',
    templateName: 'Test Coverage & Execution Report',
    name: 'Test Coverage Report - All Applications - June 2024',
    description: 'Weekly test coverage and execution report across all applications.',
    category: 'Test Coverage',
    status: 'completed',
    format: 'excel',
    filters: {
      dateRange: { start: daysAgo(7), end: daysAgo(0) },
      application: [],
      suiteId: [],
      automationStatus: [],
    },
    generatedAt: daysAgo(2),
    generationDurationMs: 2800,
    fileUrl: '/mock-exports/test-coverage-all-apps-june-2024.xlsx',
    fileSizeBytes: 786432,
    recordCount: 10,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: {
      totalTestSuites: 10,
      totalTestCases: 40,
      automatedCases: 28,
      manualCases: 12,
      overallPassRate: 88.5,
      overallExecutionRate: 95.5,
      overallAutomationCoverage: 63.2,
      suitesAboveTarget: 6,
      suitesBelowTarget: 4,
    },
    requestedBy: 'user-008',
    owner: 'user-008',
    tags: ['testing', 'coverage', 'weekly'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-008',
    updated_by: 'system',
  },
  {
    id: 'rpt-005',
    templateId: 'tmpl-005',
    templateName: 'Governance Compliance Report',
    name: 'Governance Compliance - Q2 2024',
    description: 'Quarterly governance compliance report covering all 15 procedures with findings and remediation status.',
    category: 'Governance Compliance',
    status: 'completed',
    format: 'pdf',
    filters: {
      dateRange: { start: daysAgo(90), end: daysAgo(0) },
      category: [],
      complianceStatus: [],
      segment: [],
    },
    generatedAt: daysAgo(3),
    generationDurationMs: 3800,
    fileUrl: '/mock-exports/governance-compliance-q2-2024.pdf.txt',
    fileSizeBytes: 1048576,
    recordCount: 15,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: {
      totalProcedures: 15,
      compliant: 10,
      atRisk: 4,
      nonCompliant: 1,
      averageComplianceRate: 87.87,
      totalOpenFindings: 18,
      totalResolvedFindings: 15,
      overdueReviews: 2,
      highestCompliance: { name: 'Regulatory Compliance Audit', rate: 96 },
      lowestCompliance: { name: 'Test Automation Standards', rate: 75 },
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['governance', 'compliance', 'quarterly', 'q2-2024'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-006',
    templateId: 'tmpl-001',
    templateName: 'Release Readiness Report',
    name: 'Release Readiness - Release 2024.06 (EQIP Core)',
    description: 'Release readiness assessment for Release 2024.06 including quality gate status and approval summary.',
    category: 'Release Readiness',
    status: 'completed',
    format: 'pdf',
    filters: {
      releaseId: 'rel-001',
      segment: 'Claims',
      application: 'EQIP Core',
    },
    generatedAt: daysAgo(2),
    generationDurationMs: 2500,
    fileUrl: '/mock-exports/release-readiness-2024.06-eqip-core.pdf.txt',
    fileSizeBytes: 943718,
    recordCount: 1,
    maskedFields: ['created_by', 'updated_by', 'approver', 'assignee'],
    outputSummary: {
      releaseName: 'Release 2024.06',
      application: 'EQIP Core',
      readinessScore: 92,
      qualityScore: 92,
      status: 'Ready',
      gatesPassed: 15,
      gatesFailed: 0,
      gatesInReview: 1,
      testPassRate: 97.78,
      automationCoverage: 84.44,
      criticalDefects: 0,
      openDefects: 1,
      approvalsObtained: 3,
      approvalsPending: 0,
    },
    requestedBy: 'user-017',
    owner: 'user-017',
    tags: ['release', 'readiness', 'rel-001', 'eqip-core'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'rpt-007',
    templateId: 'tmpl-001',
    templateName: 'Release Readiness Report',
    name: 'Release Readiness - Release 2024.09 (Provider Directory)',
    description: 'Release readiness assessment for Release 2024.09 highlighting at-risk status and quality gate failures.',
    category: 'Release Readiness',
    status: 'completed',
    format: 'pdf',
    filters: {
      releaseId: 'rel-004',
      segment: 'Provider',
      application: 'Provider Directory',
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 2200,
    fileUrl: '/mock-exports/release-readiness-2024.09-provider-directory.pdf.txt',
    fileSizeBytes: 891289,
    recordCount: 1,
    maskedFields: ['created_by', 'updated_by', 'approver', 'assignee'],
    outputSummary: {
      releaseName: 'Release 2024.09',
      application: 'Provider Directory',
      readinessScore: 65,
      qualityScore: 65,
      status: 'At Risk',
      gatesPassed: 5,
      gatesFailed: 5,
      gatesInReview: 1,
      testPassRate: 64.62,
      automationCoverage: 45.0,
      criticalDefects: 3,
      openDefects: 18,
      approvalsObtained: 0,
      approvalsPending: 1,
    },
    requestedBy: 'user-011',
    owner: 'user-011',
    tags: ['release', 'readiness', 'rel-004', 'provider-directory', 'at-risk'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'rpt-008',
    templateId: 'tmpl-007',
    templateName: 'Quality Trend Analysis Report',
    name: 'Quality Trends - 12 Month Analysis',
    description: 'Twelve-month quality trend analysis across all metrics with segment breakdowns.',
    category: 'Trend Analysis',
    status: 'completed',
    format: 'pdf',
    filters: {
      dateRange: { start: daysAgo(365), end: daysAgo(0) },
      metricKeys: [],
      segment: [],
      application: [],
      granularity: 'monthly',
    },
    generatedAt: daysAgo(3),
    generationDurationMs: 5200,
    fileUrl: '/mock-exports/quality-trends-12-month.pdf.txt',
    fileSizeBytes: 2621440,
    recordCount: 130,
    maskedFields: ['created_by', 'updated_by'],
    outputSummary: {
      periodsAnalyzed: 12,
      metricsTracked: 10,
      overallTrend: 'improving',
      qualityScoreChange: 8.0,
      qualityScoreStart: 74.5,
      qualityScoreEnd: 82.5,
      mostImprovedMetric: { name: 'Escaped Defect Rate', improvement: -51.0 },
      leastImprovedMetric: { name: 'Quality Gate Compliance', improvement: 12.8 },
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['trends', '12-month', 'analysis'],
    version: 1,
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-009',
    templateId: 'tmpl-008',
    templateName: 'Integration Health Report',
    name: 'Integration Health - Weekly Report',
    description: 'Weekly integration health status report covering all 20 configured integrations.',
    category: 'Integration Health',
    status: 'completed',
    format: 'excel',
    filters: {
      dateRange: { start: daysAgo(7), end: daysAgo(0) },
      status: [],
      category: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 1800,
    fileUrl: '/mock-exports/integration-health-weekly.xlsx',
    fileSizeBytes: 419430,
    recordCount: 20,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: {
      totalIntegrations: 20,
      connected: 19,
      disconnected: 1,
      withErrors: 3,
      averageUptime: 99.52,
      totalRecordsSynced: 12500000,
      criticalIssues: [
        { integration: 'Okta', issue: 'Disconnected for 5 days', severity: 'critical' },
      ],
      warnings: [
        { integration: 'ServiceNow', issue: '2 sync errors in last 24 hours', severity: 'warning' },
        { integration: 'Jira Align', issue: 'Portfolio sync response time elevated', severity: 'warning' },
      ],
    },
    requestedBy: 'user-017',
    owner: 'user-017',
    tags: ['integrations', 'health', 'weekly'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'rpt-010',
    templateId: 'tmpl-009',
    templateName: 'Environment Status Report',
    name: 'Environment Status - Weekly Report',
    description: 'Weekly environment status report covering all 28 environments with health and capacity metrics.',
    category: 'Environment Status',
    status: 'completed',
    format: 'excel',
    filters: {
      type: [],
      status: [],
      segment: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 2000,
    fileUrl: '/mock-exports/environment-status-weekly.xlsx',
    fileSizeBytes: 524288,
    recordCount: 28,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: {
      totalEnvironments: 28,
      active: 25,
      degraded: 2,
      standby: 1,
      averageReadinessScore: 92.5,
      totalOpenConflicts: 8,
      totalActiveReservations: 17,
      totalFailedHealthChecks: 1,
      degradedEnvironments: [
        { name: 'UAT-PolicyAdmin', score: 58, issues: 3 },
        { name: 'UAT-Provider', score: 65, issues: 2 },
      ],
    },
    requestedBy: 'user-003',
    owner: 'user-003',
    tags: ['environments', 'status', 'weekly'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'rpt-011',
    templateId: 'tmpl-010',
    templateName: 'Demand Management Report',
    name: 'Demand Pipeline - Weekly Report',
    description: 'Weekly demand pipeline status report covering all 30 demands across segments.',
    category: 'Demand Management',
    status: 'completed',
    format: 'excel',
    filters: {
      dateRange: { start: daysAgo(7), end: daysAgo(0) },
      segment: [],
      application: [],
      type: [],
      status: [],
      priority: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 1600,
    fileUrl: '/mock-exports/demand-pipeline-weekly.xlsx',
    fileSizeBytes: 393216,
    recordCount: 30,
    maskedFields: ['assigned_to', 'requested_by', 'created_by', 'updated_by'],
    outputSummary: {
      totalDemands: 30,
      draft: 2,
      active: 8,
      inProgress: 7,
      completed: 11,
      onHold: 1,
      cancelled: 0,
      totalEstimatedEffort: 232,
      totalActualEffort: 131,
      pendingApproval: 2,
      unassigned: 2,
      completionRate: 36.67,
    },
    requestedBy: 'user-012',
    owner: 'user-012',
    tags: ['demands', 'pipeline', 'weekly'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'rpt-012',
    templateId: 'tmpl-011',
    templateName: 'Regulatory Compliance Report',
    name: 'Regulatory Compliance - Q2 2024',
    description: 'Quarterly regulatory compliance report for HIPAA, SOX, and CMS requirements.',
    category: 'Governance Compliance',
    status: 'completed',
    format: 'pdf',
    filters: {
      dateRange: { start: daysAgo(90), end: daysAgo(0) },
      regulationType: [],
    },
    generatedAt: daysAgo(5),
    generationDurationMs: 4200,
    fileUrl: '/mock-exports/regulatory-compliance-q2-2024.pdf.txt',
    fileSizeBytes: 1310720,
    recordCount: 48,
    maskedFields: ['owner', 'created_by', 'updated_by', 'auditor'],
    outputSummary: {
      totalRegulations: 48,
      compliant: 46,
      atRisk: 2,
      nonCompliant: 0,
      hipaaCompliance: 96,
      soxCompliance: 94,
      cmsCompliance: 98,
      openFindings: 0,
      resolvedFindings: 12,
      nextAuditDate: daysAgo(-45),
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['regulatory', 'compliance', 'quarterly', 'q2-2024', 'hipaa', 'sox'],
    version: 1,
    created_at: daysAgo(5),
    updated_at: daysAgo(5),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-013',
    templateId: 'tmpl-012',
    templateName: 'Application Quality Scorecard',
    name: 'Application Quality Scorecard - All Applications',
    description: 'Monthly application quality scorecard comparing all 19 applications.',
    category: 'Quality Metrics',
    status: 'completed',
    format: 'pdf',
    filters: {
      application: [],
      segment: [],
      riskLevel: [],
    },
    generatedAt: daysAgo(2),
    generationDurationMs: 3500,
    fileUrl: '/mock-exports/application-quality-scorecard.pdf.txt',
    fileSizeBytes: 1835008,
    recordCount: 19,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: {
      totalApplications: 19,
      averageQualityScore: 81.63,
      averageAutomationCoverage: 63.2,
      averageTestCoverage: 77.68,
      averageDefectDensity: 0.59,
      highRiskApplications: 2,
      mediumRiskApplications: 6,
      lowRiskApplications: 11,
      topApplication: { name: 'Compliance Dashboard', score: 95 },
      bottomApplication: { name: 'Provider Directory', score: 65 },
    },
    requestedBy: 'user-001',
    owner: 'user-001',
    tags: ['application', 'scorecard', 'monthly'],
    version: 1,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'rpt-014',
    templateId: 'tmpl-003',
    templateName: 'Defect Analysis Report',
    name: 'Defect Analysis - Provider Directory - Critical',
    description: 'Focused defect analysis for Provider Directory critical and high severity defects.',
    category: 'Defect Analysis',
    status: 'completed',
    format: 'csv',
    filters: {
      dateRange: { start: daysAgo(30), end: daysAgo(0) },
      segment: ['Provider'],
      application: ['Provider Directory'],
      severity: ['critical', 'high'],
      status: [],
    },
    generatedAt: daysAgo(1),
    generationDurationMs: 1200,
    fileUrl: '/mock-exports/defect-analysis-provider-directory-critical.csv',
    fileSizeBytes: 131072,
    recordCount: 10,
    maskedFields: ['assigned_to', 'created_by', 'updated_by', 'reporter'],
    outputSummary: {
      totalDefects: 10,
      critical: 3,
      high: 7,
      openDefects: 8,
      resolvedDefects: 2,
      averageResolutionTimeHrs: 12.0,
      defectDensity: 0.95,
      escapedDefectRate: 7.14,
      topIssueAreas: ['Data Sync', 'Security', 'Search Performance'],
    },
    requestedBy: 'user-011',
    owner: 'user-011',
    tags: ['defects', 'provider-directory', 'critical', 'high-severity'],
    version: 1,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'rpt-015',
    templateId: 'tmpl-006',
    templateName: 'Executive Summary Report',
    name: 'Executive Summary - In Progress',
    description: 'Executive summary report currently being generated.',
    category: 'Executive Summary',
    status: 'in_progress',
    format: 'powerpoint',
    filters: {
      dateRange: { start: daysAgo(30), end: daysAgo(0) },
      segment: ['Claims', 'Billing'],
    },
    generatedAt: null,
    generationDurationMs: null,
    fileUrl: null,
    fileSizeBytes: null,
    recordCount: null,
    maskedFields: ['created_by', 'updated_by'],
    outputSummary: null,
    requestedBy: 'user-012',
    owner: 'user-012',
    tags: ['executive', 'in-progress'],
    version: 1,
    created_at: daysAndHoursAgo(0, 1),
    updated_at: daysAndHoursAgo(0, 1),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'rpt-016',
    templateId: 'tmpl-004',
    templateName: 'Test Coverage & Execution Report',
    name: 'Test Coverage - Failed Generation',
    description: 'Test coverage report that failed during generation due to data processing error.',
    category: 'Test Coverage',
    status: 'failed',
    format: 'excel',
    filters: {
      dateRange: { start: daysAgo(90), end: daysAgo(0) },
      application: [],
      suiteId: [],
      automationStatus: [],
    },
    generatedAt: null,
    generationDurationMs: 8500,
    fileUrl: null,
    fileSizeBytes: null,
    recordCount: null,
    maskedFields: ['owner', 'created_by', 'updated_by'],
    outputSummary: null,
    errorMessage: 'Report generation failed: Data aggregation timeout after 8.5 seconds. The 90-day date range produced too many records for in-memory processing. Try reducing the date range to 30 days.',
    requestedBy: 'user-008',
    owner: 'user-008',
    tags: ['testing', 'coverage', 'failed'],
    version: 1,
    created_at: daysAgo(4),
    updated_at: daysAgo(4),
    created_by: 'user-008',
    updated_by: 'system',
  },
];

/**
 * Mock scheduled report configurations.
 * Each schedule defines a recurring report generation with template, filters,
 * recipients, and delivery settings.
 * @type {Array<object>}
 */
const reportSchedules = [
  {
    id: 'sched-001',
    templateId: 'tmpl-006',
    templateName: 'Executive Summary Report',
    name: 'Monthly Executive Summary',
    description: 'Automated monthly executive summary report distributed to leadership team.',
    schedule: 'monthly',
    cronExpression: '0 8 1 * *',
    format: 'powerpoint',
    filters: {
      dateRange: 'lastMonth',
      segment: [],
    },
    recipients: ['user-001', 'user-002', 'user-011', 'user-024', 'user-025'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastReportId: 'rpt-001',
    nextRun: daysAgo(-29),
    runHistory: [
      { date: daysAgo(1), status: 'success', reportId: 'rpt-001', durationMs: 4500 },
      { date: daysAgo(31), status: 'success', reportId: 'rpt-prev-001', durationMs: 4200 },
      { date: daysAgo(62), status: 'success', reportId: 'rpt-prev-002', durationMs: 4800 },
    ],
    owner: 'user-001',
    tags: ['executive', 'monthly', 'automated'],
    version: 2,
    created_at: daysAgo(180),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'sched-002',
    templateId: 'tmpl-003',
    templateName: 'Defect Analysis Report',
    name: 'Weekly Defect Analysis - All Segments',
    description: 'Automated weekly defect analysis report for QA leadership.',
    schedule: 'weekly',
    cronExpression: '0 7 * * 1',
    format: 'excel',
    filters: {
      dateRange: 'last7',
      segment: [],
      application: [],
      severity: [],
      status: [],
    },
    recipients: ['user-003', 'user-004', 'user-005'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastReportId: 'rpt-003',
    nextRun: daysAgo(-6),
    runHistory: [
      { date: daysAgo(1), status: 'success', reportId: 'rpt-003', durationMs: 2100 },
      { date: daysAgo(8), status: 'success', reportId: 'rpt-prev-003', durationMs: 1900 },
      { date: daysAgo(15), status: 'success', reportId: 'rpt-prev-004', durationMs: 2200 },
      { date: daysAgo(22), status: 'failed', reportId: null, durationMs: 5000 },
    ],
    owner: 'user-003',
    tags: ['defects', 'weekly', 'automated'],
    version: 3,
    created_at: daysAgo(200),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-003',
    templateId: 'tmpl-008',
    templateName: 'Integration Health Report',
    name: 'Weekly Integration Health',
    description: 'Automated weekly integration health report for release management team.',
    schedule: 'weekly',
    cronExpression: '0 6 * * 1',
    format: 'excel',
    filters: {
      dateRange: 'last7',
      status: [],
      category: [],
    },
    recipients: ['user-017', 'user-018', 'user-001'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastReportId: 'rpt-009',
    nextRun: daysAgo(-6),
    runHistory: [
      { date: daysAgo(1), status: 'success', reportId: 'rpt-009', durationMs: 1800 },
      { date: daysAgo(8), status: 'success', reportId: 'rpt-prev-005', durationMs: 1700 },
      { date: daysAgo(15), status: 'success', reportId: 'rpt-prev-006', durationMs: 1900 },
    ],
    owner: 'user-017',
    tags: ['integrations', 'weekly', 'automated'],
    version: 2,
    created_at: daysAgo(150),
    updated_at: daysAgo(1),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'sched-004',
    templateId: 'tmpl-005',
    templateName: 'Governance Compliance Report',
    name: 'Quarterly Governance Compliance',
    description: 'Automated quarterly governance compliance report for regulatory submissions.',
    schedule: 'quarterly',
    cronExpression: '0 8 1 1,4,7,10 *',
    format: 'pdf',
    filters: {
      dateRange: 'thisQuarter',
      category: [],
      complianceStatus: [],
      segment: [],
    },
    recipients: ['user-001', 'user-002', 'user-011', 'user-025'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(3),
    lastRunStatus: 'success',
    lastReportId: 'rpt-005',
    nextRun: daysAgo(-87),
    runHistory: [
      { date: daysAgo(3), status: 'success', reportId: 'rpt-005', durationMs: 3800 },
      { date: daysAgo(93), status: 'success', reportId: 'rpt-prev-007', durationMs: 3600 },
    ],
    owner: 'user-001',
    tags: ['governance', 'quarterly', 'automated', 'regulatory'],
    version: 2,
    created_at: daysAgo(240),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'sched-005',
    templateId: 'tmpl-010',
    templateName: 'Demand Management Report',
    name: 'Weekly Demand Pipeline',
    description: 'Automated weekly demand pipeline status report for program management.',
    schedule: 'weekly',
    cronExpression: '0 7 * * 1',
    format: 'excel',
    filters: {
      dateRange: 'last7',
      segment: [],
      application: [],
      type: [],
      status: [],
      priority: [],
    },
    recipients: ['user-011', 'user-012', 'user-013', 'user-014'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastReportId: 'rpt-011',
    nextRun: daysAgo(-6),
    runHistory: [
      { date: daysAgo(1), status: 'success', reportId: 'rpt-011', durationMs: 1600 },
      { date: daysAgo(8), status: 'success', reportId: 'rpt-prev-008', durationMs: 1500 },
      { date: daysAgo(15), status: 'success', reportId: 'rpt-prev-009', durationMs: 1700 },
    ],
    owner: 'user-012',
    tags: ['demands', 'weekly', 'automated', 'pipeline'],
    version: 2,
    created_at: daysAgo(160),
    updated_at: daysAgo(1),
    created_by: 'user-012',
    updated_by: 'system',
  },
  {
    id: 'sched-006',
    templateId: 'tmpl-009',
    templateName: 'Environment Status Report',
    name: 'Weekly Environment Status',
    description: 'Automated weekly environment status report for QA and release teams.',
    schedule: 'weekly',
    cronExpression: '0 6 * * 1',
    format: 'excel',
    filters: {
      type: [],
      status: [],
      segment: [],
    },
    recipients: ['user-003', 'user-008', 'user-017'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAgo(1),
    lastRunStatus: 'success',
    lastReportId: 'rpt-010',
    nextRun: daysAgo(-6),
    runHistory: [
      { date: daysAgo(1), status: 'success', reportId: 'rpt-010', durationMs: 2000 },
      { date: daysAgo(8), status: 'success', reportId: 'rpt-prev-010', durationMs: 1900 },
    ],
    owner: 'user-003',
    tags: ['environments', 'weekly', 'automated'],
    version: 1,
    created_at: daysAgo(100),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'sched-007',
    templateId: 'tmpl-002',
    templateName: 'Enterprise Quality Score Report',
    name: 'Monthly Quality Score Report',
    description: 'Automated monthly enterprise quality score report.',
    schedule: 'monthly',
    cronExpression: '0 8 1 * *',
    format: 'pdf',
    filters: {
      dateRange: 'lastMonth',
      segment: [],
      application: [],
    },
    recipients: ['user-001', 'user-002', 'user-003', 'user-011'],
    deliveryChannel: 'email',
    enabled: true,
    lastRun: daysAndHoursAgo(0, 5),
    lastRunStatus: 'success',
    lastReportId: 'rpt-002',
    nextRun: daysAgo(-25),
    runHistory: [
      { date: daysAndHoursAgo(0, 5), status: 'success', reportId: 'rpt-002', durationMs: 3200 },
      { date: daysAgo(30), status: 'success', reportId: 'rpt-prev-011', durationMs: 3100 },
      { date: daysAgo(61), status: 'success', reportId: 'rpt-prev-012', durationMs: 3400 },
    ],
    owner: 'user-001',
    tags: ['quality-score', 'monthly', 'automated'],
    version: 2,
    created_at: daysAgo(200),
    updated_at: daysAndHoursAgo(0, 5),
    created_by: 'user-001',
    updated_by: 'system',
  },
];

/**
 * Mock report export history.
 * Tracks individual export actions with format, user, and PII masking details.
 * @type {Array<object>}
 */
const reportExportHistory = [
  {
    id: 'exp-001',
    reportId: 'rpt-001',
    reportName: 'Executive Summary - Q2 2024',
    format: 'powerpoint',
    exportedBy: 'user-001',
    exportedAt: daysAgo(1),
    fileSizeBytes: 2097152,
    fileUrl: '/mock-exports/executive-summary-q2-2024.pptx.txt',
    maskedFields: ['created_by', 'updated_by'],
    userRole: 'admin',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'exp-002',
    reportId: 'rpt-002',
    reportName: 'Enterprise Quality Score - June 2024',
    format: 'pdf',
    exportedBy: 'user-001',
    exportedAt: daysAndHoursAgo(0, 4),
    fileSizeBytes: 1572864,
    fileUrl: '/mock-exports/enterprise-quality-score-june-2024.pdf.txt',
    maskedFields: ['created_by', 'updated_by'],
    userRole: 'admin',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAndHoursAgo(0, 4),
    updated_at: daysAndHoursAgo(0, 4),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'exp-003',
    reportId: 'rpt-002',
    reportName: 'Enterprise Quality Score - June 2024',
    format: 'csv',
    exportedBy: 'user-003',
    exportedAt: daysAndHoursAgo(0, 3),
    fileSizeBytes: 262144,
    fileUrl: '/mock-exports/enterprise-quality-score-june-2024.csv',
    maskedFields: ['created_by', 'updated_by'],
    userRole: 'qa_lead',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAndHoursAgo(0, 3),
    updated_at: daysAndHoursAgo(0, 3),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'exp-004',
    reportId: 'rpt-003',
    reportName: 'Defect Analysis - Claims Segment - June 2024',
    format: 'excel',
    exportedBy: 'user-003',
    exportedAt: daysAgo(1),
    fileSizeBytes: 524288,
    fileUrl: '/mock-exports/defect-analysis-claims-june-2024.xlsx',
    maskedFields: ['assigned_to', 'created_by', 'updated_by', 'reporter'],
    userRole: 'qa_lead',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-003',
    updated_by: 'system',
  },
  {
    id: 'exp-005',
    reportId: 'rpt-005',
    reportName: 'Governance Compliance - Q2 2024',
    format: 'pdf',
    exportedBy: 'user-001',
    exportedAt: daysAgo(3),
    fileSizeBytes: 1048576,
    fileUrl: '/mock-exports/governance-compliance-q2-2024.pdf.txt',
    maskedFields: ['owner', 'created_by', 'updated_by'],
    userRole: 'admin',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(3),
    updated_at: daysAgo(3),
    created_by: 'user-001',
    updated_by: 'system',
  },
  {
    id: 'exp-006',
    reportId: 'rpt-006',
    reportName: 'Release Readiness - Release 2024.06 (EQIP Core)',
    format: 'pdf',
    exportedBy: 'user-017',
    exportedAt: daysAgo(2),
    fileSizeBytes: 943718,
    fileUrl: '/mock-exports/release-readiness-2024.06-eqip-core.pdf.txt',
    maskedFields: ['created_by', 'updated_by', 'approver', 'assignee'],
    userRole: 'release_manager',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-017',
    updated_by: 'system',
  },
  {
    id: 'exp-007',
    reportId: 'rpt-007',
    reportName: 'Release Readiness - Release 2024.09 (Provider Directory)',
    format: 'pdf',
    exportedBy: 'user-011',
    exportedAt: daysAgo(1),
    fileSizeBytes: 891289,
    fileUrl: '/mock-exports/release-readiness-2024.09-provider-directory.pdf.txt',
    maskedFields: ['created_by', 'updated_by', 'approver', 'assignee'],
    userRole: 'program_manager',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
    created_by: 'user-011',
    updated_by: 'system',
  },
  {
    id: 'exp-008',
    reportId: 'rpt-013',
    reportName: 'Application Quality Scorecard - All Applications',
    format: 'csv',
    exportedBy: 'user-024',
    exportedAt: daysAgo(2),
    fileSizeBytes: 196608,
    fileUrl: '/mock-exports/application-quality-scorecard.csv',
    maskedFields: ['owner', 'created_by', 'updated_by'],
    userRole: 'viewer',
    piiMaskingApplied: true,
    status: 'completed',
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    created_by: 'user-024',
    updated_by: 'system',
  },
];

export default reportInstances;

// ---------------------------------------------------------------------------
// Report Template Accessors
// ---------------------------------------------------------------------------

/**
 * Get all report templates.
 * @returns {Array<object>} Array of report template objects.
 */
export function getAllReportTemplates() {
  return [...reportTemplates];
}

/**
 * Find a report template by ID.
 * @param {string} id - The template ID to find.
 * @returns {object|null} The template object, or null if not found.
 */
export function getReportTemplateById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return reportTemplates.find((tmpl) => tmpl.id === id) || null;
}

/**
 * Get all report templates within a specific category.
 * @param {string} category - The category to filter by.
 * @returns {Array<object>} Array of templates within the specified category.
 */
export function getReportTemplatesByCategory(category) {
  if (!category || typeof category !== 'string') {
    return [];
  }
  return reportTemplates.filter((tmpl) => tmpl.category === category);
}

/**
 * Get all report templates accessible by a specific role.
 * @param {string} role - The role to filter by.
 * @returns {Array<object>} Array of templates accessible by the specified role.
 */
export function getReportTemplatesByRole(role) {
  if (!role || typeof role !== 'string') {
    return [];
  }
  return reportTemplates.filter(
    (tmpl) => Array.isArray(tmpl.roles) && tmpl.roles.includes(role),
  );
}

/**
 * Get all report templates that support a specific export format.
 * @param {string} format - The export format to filter by (e.g., 'csv', 'pdf').
 * @returns {Array<object>} Array of templates supporting the specified format.
 */
export function getReportTemplatesByFormat(format) {
  if (!format || typeof format !== 'string') {
    return [];
  }
  return reportTemplates.filter(
    (tmpl) =>
      Array.isArray(tmpl.supportedFormats) && tmpl.supportedFormats.includes(format),
  );
}

/**
 * Find a report template by name (case-insensitive).
 * @param {string} name - The template name to search for.
 * @returns {object|null} The template object, or null if not found.
 */
export function getReportTemplateByName(name) {
  if (!name || typeof name !== 'string') {
    return null;
  }
  const nameLower = name.toLowerCase();
  return reportTemplates.find(
    (tmpl) => tmpl.name.toLowerCase() === nameLower,
  ) || null;
}

/**
 * Get distinct categories from the report template data.
 * @returns {string[]} Array of unique category strings.
 */
export function getDistinctTemplateCategories() {
  const categories = new Set();
  for (let i = 0; i < reportTemplates.length; i++) {
    if (reportTemplates[i].category) {
      categories.add(reportTemplates[i].category);
    }
  }
  return [...categories].sort();
}

// ---------------------------------------------------------------------------
// Report Instance Accessors
// ---------------------------------------------------------------------------

/**
 * Get all report instances.
 * @returns {Array<object>} Array of report instance objects.
 */
export function getAllReportInstances() {
  return [...reportInstances];
}

/**
 * Find a report instance by ID.
 * @param {string} id - The report instance ID to find.
 * @returns {object|null} The report instance object, or null if not found.
 */
export function getReportInstanceById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return reportInstances.find((rpt) => rpt.id === id) || null;
}

/**
 * Get all report instances with a specific status.
 * @param {string} status - The status to filter by (e.g., 'completed', 'in_progress', 'failed').
 * @returns {Array<object>} Array of report instances with the specified status.
 */
export function getReportInstancesByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return reportInstances.filter((rpt) => rpt.status === status);
}

/**
 * Get all report instances within a specific category.
 * @param {string} category - The category to filter by.
 * @returns {Array<object>} Array of report instances within the specified category.
 */
export function getReportInstancesByCategory(category) {
  if (!category || typeof category !== 'string') {
    return [];
  }
  return reportInstances.filter((rpt) => rpt.category === category);
}

/**
 * Get all report instances for a specific template.
 * @param {string} templateId - The template ID to filter by.
 * @returns {Array<object>} Array of report instances for the specified template.
 */
export function getReportInstancesByTemplateId(templateId) {
  if (!templateId || typeof templateId !== 'string') {
    return [];
  }
  return reportInstances.filter((rpt) => rpt.templateId === templateId);
}

/**
 * Get all report instances with a specific format.
 * @param {string} format - The format to filter by (e.g., 'csv', 'pdf', 'excel').
 * @returns {Array<object>} Array of report instances with the specified format.
 */
export function getReportInstancesByFormat(format) {
  if (!format || typeof format !== 'string') {
    return [];
  }
  return reportInstances.filter((rpt) => rpt.format === format);
}

/**
 * Get all report instances requested by a specific user.
 * @param {string} userId - The user ID to filter by.
 * @returns {Array<object>} Array of report instances requested by the specified user.
 */
export function getReportInstancesByRequestedBy(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return reportInstances.filter((rpt) => rpt.requestedBy === userId);
}

/**
 * Get report instances sorted by generatedAt in descending order (newest first).
 * @param {number} [limit] - Optional maximum number of instances to return.
 * @returns {Array<object>} Array of report instances sorted by generation date.
 */
export function getRecentReportInstances(limit) {
  const sorted = [...reportInstances].sort((a, b) => {
    const dateA = a.generatedAt ? new Date(a.generatedAt).getTime() : 0;
    const dateB = b.generatedAt ? new Date(b.generatedAt).getTime() : 0;
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
 * Search report instances by name (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching report instance objects.
 */
export function searchReportInstances(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return reportInstances.filter(
    (rpt) => rpt.name && rpt.name.toLowerCase().includes(queryLower),
  );
}

// ---------------------------------------------------------------------------
// Report Schedule Accessors
// ---------------------------------------------------------------------------

/**
 * Get all report schedules.
 * @returns {Array<object>} Array of report schedule objects.
 */
export function getAllReportSchedules() {
  return [...reportSchedules];
}

/**
 * Find a report schedule by ID.
 * @param {string} id - The schedule ID to find.
 * @returns {object|null} The schedule object, or null if not found.
 */
export function getReportScheduleById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return reportSchedules.find((sched) => sched.id === id) || null;
}

/**
 * Get all enabled report schedules.
 * @returns {Array<object>} Array of enabled schedule objects.
 */
export function getEnabledReportSchedules() {
  return reportSchedules.filter((sched) => sched.enabled === true);
}

/**
 * Get all report schedules with a specific frequency.
 * @param {string} schedule - The schedule frequency to filter by (e.g., 'weekly', 'monthly').
 * @returns {Array<object>} Array of schedules with the specified frequency.
 */
export function getReportSchedulesByFrequency(schedule) {
  if (!schedule || typeof schedule !== 'string') {
    return [];
  }
  return reportSchedules.filter((sched) => sched.schedule === schedule);
}

/**
 * Get all report schedules owned by a specific user.
 * @param {string} ownerId - The owner user ID.
 * @returns {Array<object>} Array of schedules owned by the specified user.
 */
export function getReportSchedulesByOwner(ownerId) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }
  return reportSchedules.filter((sched) => sched.owner === ownerId);
}

// ---------------------------------------------------------------------------
// Report Export History Accessors
// ---------------------------------------------------------------------------

/**
 * Get all report export history entries.
 * @returns {Array<object>} Array of export history objects.
 */
export function getAllReportExportHistory() {
  return [...reportExportHistory];
}

/**
 * Find a report export history entry by ID.
 * @param {string} id - The export history ID to find.
 * @returns {object|null} The export history object, or null if not found.
 */
export function getReportExportById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return reportExportHistory.find((exp) => exp.id === id) || null;
}

/**
 * Get all export history entries for a specific report.
 * @param {string} reportId - The report ID to filter by.
 * @returns {Array<object>} Array of export history entries for the specified report.
 */
export function getReportExportsByReportId(reportId) {
  if (!reportId || typeof reportId !== 'string') {
    return [];
  }
  return reportExportHistory.filter((exp) => exp.reportId === reportId);
}

/**
 * Get all export history entries by a specific user.
 * @param {string} userId - The user ID to filter by.
 * @returns {Array<object>} Array of export history entries by the specified user.
 */
export function getReportExportsByUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return reportExportHistory.filter((exp) => exp.exportedBy === userId);
}

/**
 * Get all export history entries with a specific format.
 * @param {string} format - The format to filter by (e.g., 'csv', 'pdf', 'excel').
 * @returns {Array<object>} Array of export history entries with the specified format.
 */
export function getReportExportsByFormat(format) {
  if (!format || typeof format !== 'string') {
    return [];
  }
  return reportExportHistory.filter((exp) => exp.format === format);
}

// ---------------------------------------------------------------------------
// Aggregate & Summary Functions
// ---------------------------------------------------------------------------

/**
 * Get a count of report instances grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getReportInstanceCountByStatus() {
  const counts = {};
  for (let i = 0; i < reportInstances.length; i++) {
    const status = reportInstances[i].status;
    counts[status] = (counts[status] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of report instances grouped by category.
 * @returns {object} Object with category keys and count values.
 */
export function getReportInstanceCountByCategory() {
  const counts = {};
  for (let i = 0; i < reportInstances.length; i++) {
    const category = reportInstances[i].category;
    counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of report instances grouped by format.
 * @returns {object} Object with format keys and count values.
 */
export function getReportInstanceCountByFormat() {
  const counts = {};
  for (let i = 0; i < reportInstances.length; i++) {
    const format = reportInstances[i].format;
    counts[format] = (counts[format] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of report exports grouped by format.
 * @returns {object} Object with format keys and count values.
 */
export function getReportExportCountByFormat() {
  const counts = {};
  for (let i = 0; i < reportExportHistory.length; i++) {
    const format = reportExportHistory[i].format;
    counts[format] = (counts[format] || 0) + 1;
  }
  return counts;
}

/**
 * Get a count of report exports grouped by user role.
 * @returns {object} Object with role keys and count values.
 */
export function getReportExportCountByRole() {
  const counts = {};
  for (let i = 0; i < reportExportHistory.length; i++) {
    const role = reportExportHistory[i].userRole;
    counts[role] = (counts[role] || 0) + 1;
  }
  return counts;
}

/**
 * Get distinct statuses from the report instance data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctReportStatuses() {
  const statuses = new Set();
  for (let i = 0; i < reportInstances.length; i++) {
    if (reportInstances[i].status) {
      statuses.add(reportInstances[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct categories from the report instance data.
 * @returns {string[]} Array of unique category strings.
 */
export function getDistinctReportCategories() {
  const categories = new Set();
  for (let i = 0; i < reportInstances.length; i++) {
    if (reportInstances[i].category) {
      categories.add(reportInstances[i].category);
    }
  }
  return [...categories].sort();
}

/**
 * Get distinct formats from the report instance data.
 * @returns {string[]} Array of unique format strings.
 */
export function getDistinctReportFormats() {
  const formats = new Set();
  for (let i = 0; i < reportInstances.length; i++) {
    if (reportInstances[i].format) {
      formats.add(reportInstances[i].format);
    }
  }
  return [...formats].sort();
}

/**
 * Calculate the average generation duration across all completed report instances.
 * @returns {number} The average generation duration in milliseconds, or 0 if no completed instances exist.
 */
export function getAverageGenerationDuration() {
  const completed = reportInstances.filter(
    (rpt) =>
      rpt.status === 'completed' &&
      typeof rpt.generationDurationMs === 'number' &&
      rpt.generationDurationMs > 0,
  );
  if (completed.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < completed.length; i++) {
    total += completed[i].generationDurationMs;
  }
  return Math.round(total / completed.length);
}

/**
 * Get the total file size of all completed report exports.
 * @returns {number} Total file size in bytes.
 */
export function getTotalExportFileSize() {
  let total = 0;
  for (let i = 0; i < reportExportHistory.length; i++) {
    total += reportExportHistory[i].fileSizeBytes || 0;
  }
  return total;
}

/**
 * Get a comprehensive summary of reporting metrics.
 * @returns {object} Summary object with reporting metrics.
 */
export function getReportingSummary() {
  const totalTemplates = reportTemplates.length;
  const totalInstances = reportInstances.length;
  const totalSchedules = reportSchedules.length;
  const totalExports = reportExportHistory.length;

  let completed = 0;
  let inProgress = 0;
  let failed = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let totalFileSize = 0;

  for (let i = 0; i < reportInstances.length; i++) {
    const rpt = reportInstances[i];
    if (rpt.status === 'completed') {
      completed += 1;
    } else if (rpt.status === 'in_progress') {
      inProgress += 1;
    } else if (rpt.status === 'failed') {
      failed += 1;
    }

    if (typeof rpt.generationDurationMs === 'number' && rpt.generationDurationMs > 0) {
      totalDuration += rpt.generationDurationMs;
      durationCount += 1;
    }

    if (typeof rpt.fileSizeBytes === 'number') {
      totalFileSize += rpt.fileSizeBytes;
    }
  }

  let enabledSchedules = 0;
  let disabledSchedules = 0;
  for (let i = 0; i < reportSchedules.length; i++) {
    if (reportSchedules[i].enabled) {
      enabledSchedules += 1;
    } else {
      disabledSchedules += 1;
    }
  }

  const exportFormatCounts = {};
  for (let i = 0; i < reportExportHistory.length; i++) {
    const format = reportExportHistory[i].format;
    exportFormatCounts[format] = (exportFormatCounts[format] || 0) + 1;
  }

  return {
    totalTemplates,
    totalInstances,
    completed,
    inProgress,
    failed,
    totalSchedules,
    enabledSchedules,
    disabledSchedules,
    totalExports,
    averageGenerationDurationMs: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    totalFileSizeBytes: totalFileSize,
    totalFileSizeMB: Math.round((totalFileSize / (1024 * 1024)) * 100) / 100,
    exportFormatCounts,
  };
}

/**
 * Simulate generating a report from a template with given filters.
 * Returns a mock report instance object.
 *
 * @param {string} templateId - The template ID to generate from.
 * @param {object} [filters={}] - The filters to apply.
 * @param {string} [format] - The export format. Uses template default if not specified.
 * @param {string} [userId='user-001'] - The user ID requesting the report.
 * @returns {object} A simulated report instance object.
 */
export function simulateReportGeneration(templateId, filters = {}, format, userId = 'user-001') {
  const template = getReportTemplateById(templateId);

  if (!template) {
    return {
      id: uuidv4(),
      templateId: templateId || 'unknown',
      templateName: 'Unknown Template',
      name: 'Report Generation Failed',
      description: 'Template not found.',
      category: 'Unknown',
      status: 'failed',
      format: format || 'csv',
      filters,
      generatedAt: null,
      generationDurationMs: 50,
      fileUrl: null,
      fileSizeBytes: null,
      recordCount: null,
      maskedFields: [],
      outputSummary: null,
      errorMessage: 'Report template not found: ' + (templateId || 'null'),
      requestedBy: userId,
      owner: userId,
      tags: ['error', 'template-not-found'],
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: userId,
      updated_by: 'system',
    };
  }

  const effectiveFormat = format || template.defaultFormat;
  const now = new Date().toISOString();
  const durationMs = Math.floor(Math.random() * 3000) + 1000;

  return {
    id: uuidv4(),
    templateId: template.id,
    templateName: template.name,
    name: template.name + ' - ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    description: 'Generated report from template: ' + template.name,
    category: template.category,
    status: 'completed',
    format: effectiveFormat,
    filters,
    generatedAt: now,
    generationDurationMs: durationMs,
    fileUrl: '/mock-exports/' + template.name.toLowerCase().replace(/\s+/g, '-') + '.' + effectiveFormat,
    fileSizeBytes: Math.floor(Math.random() * 2000000) + 100000,
    recordCount: Math.floor(Math.random() * 50) + 5,
    maskedFields: template.maskedFields || [],
    outputSummary: {
      note: 'Simulated report output. Actual data would be populated from mock data sources.',
      templateCategory: template.category,
      filtersApplied: Object.keys(filters).length,
      columnsIncluded: template.columns ? template.columns.length : 0,
    },
    requestedBy: userId,
    owner: userId,
    tags: ['simulated', template.category.toLowerCase().replace(/\s+/g, '-')],
    version: 1,
    created_at: now,
    updated_at: now,
    created_by: userId,
    updated_by: 'system',
  };
}

/**
 * Simulate exporting a report in a specific format.
 * Returns a mock export history entry.
 *
 * @param {string} reportId - The report instance ID to export.
 * @param {string} [format='csv'] - The export format.
 * @param {string} [userId='user-001'] - The user ID performing the export.
 * @param {string} [userRole='viewer'] - The role of the user performing the export.
 * @returns {object} A simulated export history entry.
 */
export function simulateReportExport(reportId, format = 'csv', userId = 'user-001', userRole = 'viewer') {
  const report = getReportInstanceById(reportId);
  const now = new Date().toISOString();

  if (!report) {
    return {
      id: uuidv4(),
      reportId: reportId || 'unknown',
      reportName: 'Unknown Report',
      format,
      exportedBy: userId,
      exportedAt: now,
      fileSizeBytes: 0,
      fileUrl: null,
      maskedFields: [],
      userRole,
      piiMaskingApplied: true,
      status: 'failed',
      errorMessage: 'Report not found: ' + (reportId || 'null'),
      created_at: now,
      updated_at: now,
      created_by: userId,
      updated_by: 'system',
    };
  }

  return {
    id: uuidv4(),
    reportId: report.id,
    reportName: report.name,
    format,
    exportedBy: userId,
    exportedAt: now,
    fileSizeBytes: Math.floor(Math.random() * 1000000) + 50000,
    fileUrl: '/mock-exports/' + report.name.toLowerCase().replace(/\s+/g, '-') + '.' + format,
    maskedFields: report.maskedFields || [],
    userRole,
    piiMaskingApplied: true,
    status: 'completed',
    created_at: now,
    updated_at: now,
    created_by: userId,
    updated_by: 'system',
  };
}