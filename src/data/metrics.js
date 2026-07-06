import { v4 as uuidv4 } from 'uuid';

/**
 * @module metrics
 * Mock metrics data seed for eQIP Quality Intelligence.
 * Pre-computed metric values, trends, and historical data for Executive Dashboard,
 * Adoption/Impact, and Analytics screens. Includes Enterprise Quality Score,
 * Release Readiness Score, and all PRD-defined metrics with configurable weights.
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
 * Helper to generate a month label string (e.g., "2024-01").
 * @param {number} monthsBack - Number of months in the past.
 * @returns {string} YYYY-MM formatted string.
 */
function monthsAgoLabel(monthsBack) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsBack);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Default metric weights used for Enterprise Quality Score calculation.
 * @type {Readonly<object>}
 */
export const DEFAULT_METRIC_WEIGHTS = Object.freeze({
  defect_density: 0.15,
  defect_removal_efficiency: 0.15,
  test_case_pass_rate: 0.15,
  test_execution_rate: 0.10,
  automation_coverage: 0.10,
  mean_time_to_detect: 0.05,
  mean_time_to_resolve: 0.05,
  escaped_defect_rate: 0.10,
  requirement_coverage: 0.10,
  quality_gate_compliance: 0.05,
});

/**
 * Default metric thresholds for scoring normalization.
 * @type {Readonly<object>}
 */
export const DEFAULT_METRIC_THRESHOLDS = Object.freeze({
  defect_density: { target: 1.0, direction: 'lower_is_better' },
  defect_removal_efficiency: { target: 95, direction: 'higher_is_better' },
  test_case_pass_rate: { target: 98, direction: 'higher_is_better' },
  test_execution_rate: { target: 100, direction: 'higher_is_better' },
  automation_coverage: { target: 80, direction: 'higher_is_better' },
  mean_time_to_detect: { target: 4, direction: 'lower_is_better' },
  mean_time_to_resolve: { target: 8, direction: 'lower_is_better' },
  escaped_defect_rate: { target: 2, direction: 'lower_is_better' },
  requirement_coverage: { target: 100, direction: 'higher_is_better' },
  quality_gate_compliance: { target: 100, direction: 'higher_is_better' },
});

/**
 * Mock pre-computed metrics data array.
 * Each metric includes id, key, name, value, normalizedScore, weight, unit,
 * formula, description, threshold, trend, segmentBreakdown, applicationBreakdown,
 * historicalData, and audit fields.
 * @type {Array<object>}
 */
const metrics = [
  {
    id: 'metric-defect_density',
    key: 'defect_density',
    name: 'Defect Density',
    value: 0.59,
    normalizedScore: 100,
    weight: 0.15,
    unit: 'defects/KLOC',
    formula: 'total_defects / size_kloc',
    description: 'Number of defects per thousand lines of code.',
    threshold: { target: 1.0, direction: 'lower_is_better' },
    trend: 'improving',
    trendPercentage: -8.5,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 0.42, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 0.68, normalizedScore: 100, trend: 'stable' },
      Enrollment: { value: 0.52, normalizedScore: 100, trend: 'improving' },
      Provider: { value: 0.95, normalizedScore: 100, trend: 'declining' },
      Pharmacy: { value: 0.38, normalizedScore: 100, trend: 'improving' },
      Enterprise: { value: 0.35, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 0.61, normalizedScore: 100, trend: 'stable' },
      'Policy Administration': { value: 0.82, normalizedScore: 100, trend: 'declining' },
      'Insurance Claims': { value: 0.62, normalizedScore: 100, trend: 'stable' },
      Actuarial: { value: 0.32, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 0.22, normalizedScore: 100, trend: 'improving' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 0.35, trend: 'improving' },
      'Claims Processing': { value: 0.42, trend: 'improving' },
      'Claims Analytics': { value: 0.51, trend: 'stable' },
      'Payment Gateway': { value: 0.68, trend: 'stable' },
      'Billing Portal': { value: 0.58, trend: 'improving' },
      'Member Portal': { value: 0.45, trend: 'improving' },
      'Enrollment Engine': { value: 0.52, trend: 'stable' },
      'Provider Directory': { value: 0.95, trend: 'declining' },
      'Credentialing System': { value: 0.78, trend: 'stable' },
      'Rx Platform': { value: 0.38, trend: 'improving' },
      'Formulary Manager': { value: 0.55, trend: 'stable' },
      'Underwriting Engine': { value: 0.61, trend: 'stable' },
      'Risk Assessment Tool': { value: 0.72, trend: 'declining' },
      'Policy Admin System': { value: 0.82, trend: 'declining' },
      'Document Management': { value: 0.88, trend: 'stable' },
      'Insurance Claims Portal': { value: 0.62, trend: 'stable' },
      'Settlement Engine': { value: 0.74, trend: 'stable' },
      'Actuarial Platform': { value: 0.32, trend: 'improving' },
      'Compliance Dashboard': { value: 0.22, trend: 'improving' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 0.78 },
      { period: monthsAgoLabel(10), value: 0.75 },
      { period: monthsAgoLabel(9), value: 0.73 },
      { period: monthsAgoLabel(8), value: 0.71 },
      { period: monthsAgoLabel(7), value: 0.69 },
      { period: monthsAgoLabel(6), value: 0.67 },
      { period: monthsAgoLabel(5), value: 0.66 },
      { period: monthsAgoLabel(4), value: 0.64 },
      { period: monthsAgoLabel(3), value: 0.63 },
      { period: monthsAgoLabel(2), value: 0.62 },
      { period: monthsAgoLabel(1), value: 0.60 },
      { period: monthsAgoLabel(0), value: 0.59 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['quality', 'defects', 'code-quality'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-defect_removal_efficiency',
    key: 'defect_removal_efficiency',
    name: 'Defect Removal Efficiency',
    value: 92.5,
    normalizedScore: 97.37,
    weight: 0.15,
    unit: '%',
    formula: '(defects_found_before_release / total_defects) * 100',
    description: 'Percentage of defects found before production release.',
    threshold: { target: 95, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 3.2,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 96.5, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 88.0, normalizedScore: 92.63, trend: 'stable' },
      Enrollment: { value: 94.0, normalizedScore: 98.95, trend: 'improving' },
      Provider: { value: 85.0, normalizedScore: 89.47, trend: 'declining' },
      Pharmacy: { value: 95.5, normalizedScore: 100, trend: 'improving' },
      Enterprise: { value: 97.0, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 91.0, normalizedScore: 95.79, trend: 'stable' },
      'Policy Administration': { value: 87.0, normalizedScore: 91.58, trend: 'stable' },
      'Insurance Claims': { value: 93.0, normalizedScore: 97.89, trend: 'improving' },
      Actuarial: { value: 98.0, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 99.0, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 97.0, trend: 'improving' },
      'Claims Processing': { value: 96.5, trend: 'improving' },
      'Claims Analytics': { value: 94.0, trend: 'stable' },
      'Payment Gateway': { value: 88.0, trend: 'stable' },
      'Billing Portal': { value: 90.0, trend: 'improving' },
      'Member Portal': { value: 94.0, trend: 'improving' },
      'Enrollment Engine': { value: 93.0, trend: 'stable' },
      'Provider Directory': { value: 85.0, trend: 'declining' },
      'Credentialing System': { value: 87.0, trend: 'stable' },
      'Rx Platform': { value: 95.5, trend: 'improving' },
      'Formulary Manager': { value: 92.0, trend: 'stable' },
      'Underwriting Engine': { value: 91.0, trend: 'stable' },
      'Risk Assessment Tool': { value: 89.0, trend: 'stable' },
      'Policy Admin System': { value: 87.0, trend: 'stable' },
      'Document Management': { value: 86.0, trend: 'declining' },
      'Insurance Claims Portal': { value: 93.0, trend: 'improving' },
      'Settlement Engine': { value: 90.0, trend: 'stable' },
      'Actuarial Platform': { value: 98.0, trend: 'improving' },
      'Compliance Dashboard': { value: 99.0, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 86.0 },
      { period: monthsAgoLabel(10), value: 87.0 },
      { period: monthsAgoLabel(9), value: 87.5 },
      { period: monthsAgoLabel(8), value: 88.0 },
      { period: monthsAgoLabel(7), value: 88.5 },
      { period: monthsAgoLabel(6), value: 89.5 },
      { period: monthsAgoLabel(5), value: 90.0 },
      { period: monthsAgoLabel(4), value: 90.5 },
      { period: monthsAgoLabel(3), value: 91.0 },
      { period: monthsAgoLabel(2), value: 91.5 },
      { period: monthsAgoLabel(1), value: 92.0 },
      { period: monthsAgoLabel(0), value: 92.5 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['quality', 'defects', 'efficiency'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-test_case_pass_rate',
    key: 'test_case_pass_rate',
    name: 'Test Case Pass Rate',
    value: 97.78,
    normalizedScore: 99.78,
    weight: 0.15,
    unit: '%',
    formula: '(passed_tests / total_tests) * 100',
    description: 'Percentage of test cases that passed.',
    threshold: { target: 98, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 1.8,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 99.04, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 94.21, normalizedScore: 96.13, trend: 'stable' },
      Enrollment: { value: 97.5, normalizedScore: 99.49, trend: 'improving' },
      Provider: { value: 88.0, normalizedScore: 89.80, trend: 'declining' },
      Pharmacy: { value: 96.0, normalizedScore: 97.96, trend: 'stable' },
      Enterprise: { value: 99.5, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 95.0, normalizedScore: 96.94, trend: 'stable' },
      'Policy Administration': { value: 91.0, normalizedScore: 92.86, trend: 'stable' },
      'Insurance Claims': { value: 96.5, normalizedScore: 98.47, trend: 'improving' },
      Actuarial: { value: 98.5, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 99.29, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 97.78, trend: 'improving' },
      'Claims Processing': { value: 99.04, trend: 'improving' },
      'Claims Analytics': { value: 96.0, trend: 'stable' },
      'Payment Gateway': { value: 75.0, trend: 'declining' },
      'Billing Portal': { value: 92.0, trend: 'stable' },
      'Member Portal': { value: 94.21, trend: 'improving' },
      'Enrollment Engine': { value: 95.0, trend: 'stable' },
      'Provider Directory': { value: 64.62, trend: 'declining' },
      'Credentialing System': { value: 88.0, trend: 'stable' },
      'Rx Platform': { value: 79.41, trend: 'stable' },
      'Formulary Manager': { value: 94.0, trend: 'stable' },
      'Underwriting Engine': { value: 91.38, trend: 'stable' },
      'Risk Assessment Tool': { value: 90.0, trend: 'stable' },
      'Policy Admin System': { value: 89.0, trend: 'stable' },
      'Document Management': { value: 85.0, trend: 'declining' },
      'Insurance Claims Portal': { value: 94.19, trend: 'improving' },
      'Settlement Engine': { value: 92.0, trend: 'stable' },
      'Actuarial Platform': { value: 98.5, trend: 'improving' },
      'Compliance Dashboard': { value: 99.29, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 93.5 },
      { period: monthsAgoLabel(10), value: 94.0 },
      { period: monthsAgoLabel(9), value: 94.5 },
      { period: monthsAgoLabel(8), value: 95.0 },
      { period: monthsAgoLabel(7), value: 95.2 },
      { period: monthsAgoLabel(6), value: 95.8 },
      { period: monthsAgoLabel(5), value: 96.0 },
      { period: monthsAgoLabel(4), value: 96.5 },
      { period: monthsAgoLabel(3), value: 97.0 },
      { period: monthsAgoLabel(2), value: 97.2 },
      { period: monthsAgoLabel(1), value: 97.5 },
      { period: monthsAgoLabel(0), value: 97.78 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['testing', 'pass-rate', 'quality'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-test_execution_rate',
    key: 'test_execution_rate',
    name: 'Test Execution Rate',
    value: 95.5,
    normalizedScore: 95.5,
    weight: 0.10,
    unit: '%',
    formula: '(executed_tests / planned_tests) * 100',
    description: 'Percentage of planned test cases that have been executed.',
    threshold: { target: 100, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 2.1,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 99.42, normalizedScore: 99.42, trend: 'improving' },
      Billing: { value: 87.5, normalizedScore: 87.5, trend: 'stable' },
      Enrollment: { value: 98.68, normalizedScore: 98.68, trend: 'improving' },
      Provider: { value: 90.38, normalizedScore: 90.38, trend: 'stable' },
      Pharmacy: { value: 88.24, normalizedScore: 88.24, trend: 'stable' },
      Enterprise: { value: 99.33, normalizedScore: 99.33, trend: 'improving' },
      Underwriting: { value: 96.55, normalizedScore: 96.55, trend: 'improving' },
      'Policy Administration': { value: 88.0, normalizedScore: 88.0, trend: 'stable' },
      'Insurance Claims': { value: 98.06, normalizedScore: 98.06, trend: 'improving' },
      Actuarial: { value: 97.0, normalizedScore: 97.0, trend: 'stable' },
      'Regulatory Compliance': { value: 99.64, normalizedScore: 99.64, trend: 'improving' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 99.33, trend: 'improving' },
      'Claims Processing': { value: 99.42, trend: 'improving' },
      'Payment Gateway': { value: 87.5, trend: 'stable' },
      'Member Portal': { value: 98.68, trend: 'improving' },
      'Provider Directory': { value: 90.38, trend: 'stable' },
      'Rx Platform': { value: 88.24, trend: 'stable' },
      'Underwriting Engine': { value: 96.55, trend: 'improving' },
      'Insurance Claims Portal': { value: 98.06, trend: 'improving' },
      'Compliance Dashboard': { value: 99.64, trend: 'improving' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 88.0 },
      { period: monthsAgoLabel(10), value: 89.0 },
      { period: monthsAgoLabel(9), value: 89.5 },
      { period: monthsAgoLabel(8), value: 90.0 },
      { period: monthsAgoLabel(7), value: 91.0 },
      { period: monthsAgoLabel(6), value: 92.0 },
      { period: monthsAgoLabel(5), value: 92.5 },
      { period: monthsAgoLabel(4), value: 93.0 },
      { period: monthsAgoLabel(3), value: 94.0 },
      { period: monthsAgoLabel(2), value: 94.5 },
      { period: monthsAgoLabel(1), value: 95.0 },
      { period: monthsAgoLabel(0), value: 95.5 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['testing', 'execution', 'coverage'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-automation_coverage',
    key: 'automation_coverage',
    name: 'Automation Coverage',
    value: 63.2,
    normalizedScore: 79.0,
    weight: 0.10,
    unit: '%',
    formula: '(automated_tests / total_tests) * 100',
    description: 'Percentage of test cases that are automated.',
    threshold: { target: 80, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 5.3,
    status: 'at_risk',
    grade: 'C',
    segmentBreakdown: {
      Claims: { value: 80.0, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 60.0, normalizedScore: 75.0, trend: 'stable' },
      Enrollment: { value: 70.0, normalizedScore: 87.5, trend: 'improving' },
      Provider: { value: 45.0, normalizedScore: 56.25, trend: 'declining' },
      Pharmacy: { value: 70.0, normalizedScore: 87.5, trend: 'improving' },
      Enterprise: { value: 84.44, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 65.86, normalizedScore: 82.33, trend: 'stable' },
      'Policy Administration': { value: 48.0, normalizedScore: 60.0, trend: 'stable' },
      'Insurance Claims': { value: 63.87, normalizedScore: 79.84, trend: 'improving' },
      Actuarial: { value: 71.0, normalizedScore: 88.75, trend: 'stable' },
      'Regulatory Compliance': { value: 85.0, normalizedScore: 100, trend: 'improving' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 84.44, trend: 'improving' },
      'Claims Processing': { value: 80.0, trend: 'improving' },
      'Claims Analytics': { value: 65.0, trend: 'stable' },
      'Payment Gateway': { value: 60.0, trend: 'stable' },
      'Billing Portal': { value: 55.0, trend: 'stable' },
      'Member Portal': { value: 70.0, trend: 'improving' },
      'Enrollment Engine': { value: 68.0, trend: 'stable' },
      'Provider Directory': { value: 45.0, trend: 'declining' },
      'Credentialing System': { value: 50.0, trend: 'stable' },
      'Rx Platform': { value: 70.0, trend: 'improving' },
      'Formulary Manager': { value: 62.0, trend: 'stable' },
      'Underwriting Engine': { value: 65.86, trend: 'stable' },
      'Risk Assessment Tool': { value: 58.0, trend: 'stable' },
      'Policy Admin System': { value: 52.0, trend: 'stable' },
      'Document Management': { value: 0.0, trend: 'stable' },
      'Insurance Claims Portal': { value: 63.87, trend: 'improving' },
      'Settlement Engine': { value: 56.0, trend: 'stable' },
      'Actuarial Platform': { value: 71.0, trend: 'stable' },
      'Compliance Dashboard': { value: 85.0, trend: 'improving' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 48.0 },
      { period: monthsAgoLabel(10), value: 50.0 },
      { period: monthsAgoLabel(9), value: 52.0 },
      { period: monthsAgoLabel(8), value: 53.5 },
      { period: monthsAgoLabel(7), value: 55.0 },
      { period: monthsAgoLabel(6), value: 56.5 },
      { period: monthsAgoLabel(5), value: 58.0 },
      { period: monthsAgoLabel(4), value: 59.5 },
      { period: monthsAgoLabel(3), value: 60.5 },
      { period: monthsAgoLabel(2), value: 61.5 },
      { period: monthsAgoLabel(1), value: 62.5 },
      { period: monthsAgoLabel(0), value: 63.2 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['testing', 'automation', 'coverage'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-mean_time_to_detect',
    key: 'mean_time_to_detect',
    name: 'Mean Time to Detect (MTTD)',
    value: 3.8,
    normalizedScore: 100,
    weight: 0.05,
    unit: 'hours',
    formula: 'sum(detection_times) / total_defects',
    description: 'Average time to detect a defect after introduction.',
    threshold: { target: 4, direction: 'lower_is_better' },
    trend: 'improving',
    trendPercentage: -12.0,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 2.5, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 4.2, normalizedScore: 95.24, trend: 'stable' },
      Enrollment: { value: 3.0, normalizedScore: 100, trend: 'improving' },
      Provider: { value: 6.5, normalizedScore: 61.54, trend: 'declining' },
      Pharmacy: { value: 3.5, normalizedScore: 100, trend: 'improving' },
      Enterprise: { value: 2.0, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 4.0, normalizedScore: 100, trend: 'stable' },
      'Policy Administration': { value: 5.5, normalizedScore: 72.73, trend: 'stable' },
      'Insurance Claims': { value: 3.8, normalizedScore: 100, trend: 'improving' },
      Actuarial: { value: 2.2, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 1.5, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 2.0, trend: 'improving' },
      'Claims Processing': { value: 2.5, trend: 'improving' },
      'Payment Gateway': { value: 4.2, trend: 'stable' },
      'Provider Directory': { value: 6.5, trend: 'declining' },
      'Rx Platform': { value: 3.5, trend: 'improving' },
      'Compliance Dashboard': { value: 1.5, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 5.8 },
      { period: monthsAgoLabel(10), value: 5.5 },
      { period: monthsAgoLabel(9), value: 5.2 },
      { period: monthsAgoLabel(8), value: 5.0 },
      { period: monthsAgoLabel(7), value: 4.8 },
      { period: monthsAgoLabel(6), value: 4.6 },
      { period: monthsAgoLabel(5), value: 4.4 },
      { period: monthsAgoLabel(4), value: 4.2 },
      { period: monthsAgoLabel(3), value: 4.1 },
      { period: monthsAgoLabel(2), value: 4.0 },
      { period: monthsAgoLabel(1), value: 3.9 },
      { period: monthsAgoLabel(0), value: 3.8 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['defects', 'detection', 'time'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-mean_time_to_resolve',
    key: 'mean_time_to_resolve',
    name: 'Mean Time to Resolve (MTTR)',
    value: 7.2,
    normalizedScore: 100,
    weight: 0.05,
    unit: 'hours',
    formula: 'sum(resolution_times) / total_defects',
    description: 'Average time to resolve a defect after detection.',
    threshold: { target: 8, direction: 'lower_is_better' },
    trend: 'improving',
    trendPercentage: -10.0,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 5.5, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 8.5, normalizedScore: 94.12, trend: 'stable' },
      Enrollment: { value: 6.0, normalizedScore: 100, trend: 'improving' },
      Provider: { value: 12.0, normalizedScore: 66.67, trend: 'declining' },
      Pharmacy: { value: 6.5, normalizedScore: 100, trend: 'improving' },
      Enterprise: { value: 4.5, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 7.5, normalizedScore: 100, trend: 'stable' },
      'Policy Administration': { value: 10.0, normalizedScore: 80.0, trend: 'stable' },
      'Insurance Claims': { value: 7.0, normalizedScore: 100, trend: 'improving' },
      Actuarial: { value: 4.0, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 3.0, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 4.5, trend: 'improving' },
      'Claims Processing': { value: 5.5, trend: 'improving' },
      'Payment Gateway': { value: 8.5, trend: 'stable' },
      'Provider Directory': { value: 12.0, trend: 'declining' },
      'Rx Platform': { value: 6.5, trend: 'improving' },
      'Compliance Dashboard': { value: 3.0, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 10.5 },
      { period: monthsAgoLabel(10), value: 10.0 },
      { period: monthsAgoLabel(9), value: 9.8 },
      { period: monthsAgoLabel(8), value: 9.5 },
      { period: monthsAgoLabel(7), value: 9.0 },
      { period: monthsAgoLabel(6), value: 8.8 },
      { period: monthsAgoLabel(5), value: 8.5 },
      { period: monthsAgoLabel(4), value: 8.2 },
      { period: monthsAgoLabel(3), value: 8.0 },
      { period: monthsAgoLabel(2), value: 7.8 },
      { period: monthsAgoLabel(1), value: 7.5 },
      { period: monthsAgoLabel(0), value: 7.2 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['defects', 'resolution', 'time'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-escaped_defect_rate',
    key: 'escaped_defect_rate',
    name: 'Escaped Defect Rate',
    value: 3.2,
    normalizedScore: 62.5,
    weight: 0.10,
    unit: '%',
    formula: '(production_defects / total_defects) * 100',
    description: 'Percentage of defects found in production.',
    threshold: { target: 2, direction: 'lower_is_better' },
    trend: 'improving',
    trendPercentage: -15.0,
    status: 'at_risk',
    grade: 'C',
    segmentBreakdown: {
      Claims: { value: 1.5, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 4.0, normalizedScore: 50.0, trend: 'stable' },
      Enrollment: { value: 2.0, normalizedScore: 100, trend: 'improving' },
      Provider: { value: 7.14, normalizedScore: 28.01, trend: 'declining' },
      Pharmacy: { value: 2.5, normalizedScore: 80.0, trend: 'stable' },
      Enterprise: { value: 1.0, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 3.0, normalizedScore: 66.67, trend: 'stable' },
      'Policy Administration': { value: 5.0, normalizedScore: 40.0, trend: 'stable' },
      'Insurance Claims': { value: 2.8, normalizedScore: 71.43, trend: 'improving' },
      Actuarial: { value: 1.0, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 0.5, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 1.0, trend: 'improving' },
      'Claims Processing': { value: 1.5, trend: 'improving' },
      'Payment Gateway': { value: 4.0, trend: 'stable' },
      'Provider Directory': { value: 7.14, trend: 'declining' },
      'Rx Platform': { value: 2.5, trend: 'stable' },
      'Compliance Dashboard': { value: 0.5, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 6.5 },
      { period: monthsAgoLabel(10), value: 6.0 },
      { period: monthsAgoLabel(9), value: 5.5 },
      { period: monthsAgoLabel(8), value: 5.2 },
      { period: monthsAgoLabel(7), value: 5.0 },
      { period: monthsAgoLabel(6), value: 4.5 },
      { period: monthsAgoLabel(5), value: 4.2 },
      { period: monthsAgoLabel(4), value: 4.0 },
      { period: monthsAgoLabel(3), value: 3.8 },
      { period: monthsAgoLabel(2), value: 3.5 },
      { period: monthsAgoLabel(1), value: 3.3 },
      { period: monthsAgoLabel(0), value: 3.2 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['defects', 'escaped', 'production'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-requirement_coverage',
    key: 'requirement_coverage',
    name: 'Requirement Coverage',
    value: 93.33,
    normalizedScore: 93.33,
    weight: 0.10,
    unit: '%',
    formula: '(requirements_with_tests / total_requirements) * 100',
    description: 'Percentage of requirements covered by at least one test.',
    threshold: { target: 100, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 2.5,
    status: 'healthy',
    grade: 'A',
    segmentBreakdown: {
      Claims: { value: 96.0, normalizedScore: 96.0, trend: 'improving' },
      Billing: { value: 88.0, normalizedScore: 88.0, trend: 'stable' },
      Enrollment: { value: 94.0, normalizedScore: 94.0, trend: 'improving' },
      Provider: { value: 82.0, normalizedScore: 82.0, trend: 'stable' },
      Pharmacy: { value: 95.0, normalizedScore: 95.0, trend: 'improving' },
      Enterprise: { value: 98.0, normalizedScore: 98.0, trend: 'improving' },
      Underwriting: { value: 90.0, normalizedScore: 90.0, trend: 'stable' },
      'Policy Administration': { value: 85.0, normalizedScore: 85.0, trend: 'stable' },
      'Insurance Claims': { value: 93.0, normalizedScore: 93.0, trend: 'improving' },
      Actuarial: { value: 97.0, normalizedScore: 97.0, trend: 'improving' },
      'Regulatory Compliance': { value: 99.0, normalizedScore: 99.0, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 98.0, trend: 'improving' },
      'Claims Processing': { value: 96.0, trend: 'improving' },
      'Payment Gateway': { value: 88.0, trend: 'stable' },
      'Member Portal': { value: 94.0, trend: 'improving' },
      'Provider Directory': { value: 82.0, trend: 'stable' },
      'Rx Platform': { value: 95.0, trend: 'improving' },
      'Underwriting Engine': { value: 90.0, trend: 'stable' },
      'Compliance Dashboard': { value: 99.0, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 82.0 },
      { period: monthsAgoLabel(10), value: 83.5 },
      { period: monthsAgoLabel(9), value: 85.0 },
      { period: monthsAgoLabel(8), value: 86.0 },
      { period: monthsAgoLabel(7), value: 87.0 },
      { period: monthsAgoLabel(6), value: 88.5 },
      { period: monthsAgoLabel(5), value: 89.5 },
      { period: monthsAgoLabel(4), value: 90.5 },
      { period: monthsAgoLabel(3), value: 91.5 },
      { period: monthsAgoLabel(2), value: 92.0 },
      { period: monthsAgoLabel(1), value: 92.8 },
      { period: monthsAgoLabel(0), value: 93.33 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['requirements', 'coverage', 'traceability'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-quality_gate_compliance',
    key: 'quality_gate_compliance',
    name: 'Quality Gate Compliance',
    value: 81.25,
    normalizedScore: 81.25,
    weight: 0.05,
    unit: '%',
    formula: '(gates_passed / total_gates) * 100',
    description: 'Percentage of quality gates that have been passed.',
    threshold: { target: 100, direction: 'higher_is_better' },
    trend: 'stable',
    trendPercentage: 0.5,
    status: 'at_risk',
    grade: 'B',
    segmentBreakdown: {
      Claims: { value: 93.75, normalizedScore: 93.75, trend: 'improving' },
      Billing: { value: 68.75, normalizedScore: 68.75, trend: 'stable' },
      Enrollment: { value: 87.5, normalizedScore: 87.5, trend: 'improving' },
      Provider: { value: 50.0, normalizedScore: 50.0, trend: 'declining' },
      Pharmacy: { value: 75.0, normalizedScore: 75.0, trend: 'stable' },
      Enterprise: { value: 93.75, normalizedScore: 93.75, trend: 'improving' },
      Underwriting: { value: 81.25, normalizedScore: 81.25, trend: 'stable' },
      'Policy Administration': { value: 62.5, normalizedScore: 62.5, trend: 'stable' },
      'Insurance Claims': { value: 87.5, normalizedScore: 87.5, trend: 'improving' },
      Actuarial: { value: 93.75, normalizedScore: 93.75, trend: 'improving' },
      'Regulatory Compliance': { value: 100.0, normalizedScore: 100.0, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 93.75, trend: 'improving' },
      'Claims Processing': { value: 93.75, trend: 'improving' },
      'Payment Gateway': { value: 43.75, trend: 'declining' },
      'Member Portal': { value: 75.0, trend: 'improving' },
      'Provider Directory': { value: 25.0, trend: 'declining' },
      'Rx Platform': { value: 56.25, trend: 'stable' },
      'Underwriting Engine': { value: 81.25, trend: 'stable' },
      'Insurance Claims Portal': { value: 87.5, trend: 'improving' },
      'Compliance Dashboard': { value: 100.0, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 72.0 },
      { period: monthsAgoLabel(10), value: 73.0 },
      { period: monthsAgoLabel(9), value: 74.5 },
      { period: monthsAgoLabel(8), value: 75.0 },
      { period: monthsAgoLabel(7), value: 76.0 },
      { period: monthsAgoLabel(6), value: 77.0 },
      { period: monthsAgoLabel(5), value: 78.0 },
      { period: monthsAgoLabel(4), value: 79.0 },
      { period: monthsAgoLabel(3), value: 80.0 },
      { period: monthsAgoLabel(2), value: 80.5 },
      { period: monthsAgoLabel(1), value: 81.0 },
      { period: monthsAgoLabel(0), value: 81.25 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['quality-gates', 'compliance', 'governance'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-enterprise_quality_score',
    key: 'enterprise_quality_score',
    name: 'Enterprise Quality Score',
    value: 82.5,
    normalizedScore: 82.5,
    weight: 1.0,
    unit: 'score',
    formula: 'weighted_average(all_normalized_metrics)',
    description: 'Composite quality score across all metrics, calculated as a weighted average of normalized individual metric scores.',
    threshold: { target: 90, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 2.3,
    status: 'healthy',
    grade: 'B',
    breakdown: {
      defect_density: { label: 'Defect Density', rawValue: 0.59, normalizedScore: 100, weight: 0.15 },
      defect_removal_efficiency: { label: 'Defect Removal Efficiency', rawValue: 92.5, normalizedScore: 97.37, weight: 0.15 },
      test_case_pass_rate: { label: 'Test Case Pass Rate', rawValue: 97.78, normalizedScore: 99.78, weight: 0.15 },
      test_execution_rate: { label: 'Test Execution Rate', rawValue: 95.5, normalizedScore: 95.5, weight: 0.10 },
      automation_coverage: { label: 'Automation Coverage', rawValue: 63.2, normalizedScore: 79.0, weight: 0.10 },
      mean_time_to_detect: { label: 'Mean Time to Detect', rawValue: 3.8, normalizedScore: 100, weight: 0.05 },
      mean_time_to_resolve: { label: 'Mean Time to Resolve', rawValue: 7.2, normalizedScore: 100, weight: 0.05 },
      escaped_defect_rate: { label: 'Escaped Defect Rate', rawValue: 3.2, normalizedScore: 62.5, weight: 0.10 },
      requirement_coverage: { label: 'Requirement Coverage', rawValue: 93.33, normalizedScore: 93.33, weight: 0.10 },
      quality_gate_compliance: { label: 'Quality Gate Compliance', rawValue: 81.25, normalizedScore: 81.25, weight: 0.05 },
    },
    segmentBreakdown: {
      Claims: { value: 92, grade: 'A', trend: 'improving' },
      Billing: { value: 78, grade: 'C', trend: 'stable' },
      Enrollment: { value: 85, grade: 'B', trend: 'improving' },
      Provider: { value: 65, grade: 'D', trend: 'declining' },
      Pharmacy: { value: 88, grade: 'B', trend: 'improving' },
      Enterprise: { value: 92, grade: 'A', trend: 'improving' },
      Underwriting: { value: 82, grade: 'B', trend: 'stable' },
      'Policy Administration': { value: 76, grade: 'C', trend: 'stable' },
      'Insurance Claims': { value: 80, grade: 'B', trend: 'improving' },
      Actuarial: { value: 90, grade: 'A', trend: 'improving' },
      'Regulatory Compliance': { value: 95, grade: 'A', trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 92, grade: 'A', trend: 'improving' },
      'Claims Processing': { value: 89, grade: 'B', trend: 'improving' },
      'Claims Analytics': { value: 86, grade: 'B', trend: 'stable' },
      'Payment Gateway': { value: 78, grade: 'C', trend: 'stable' },
      'Billing Portal': { value: 81, grade: 'B', trend: 'improving' },
      'Member Portal': { value: 85, grade: 'B', trend: 'improving' },
      'Enrollment Engine': { value: 83, grade: 'B', trend: 'stable' },
      'Provider Directory': { value: 65, grade: 'D', trend: 'declining' },
      'Credentialing System': { value: 70, grade: 'C', trend: 'stable' },
      'Rx Platform': { value: 88, grade: 'B', trend: 'improving' },
      'Formulary Manager': { value: 84, grade: 'B', trend: 'stable' },
      'Underwriting Engine': { value: 82, grade: 'B', trend: 'stable' },
      'Risk Assessment Tool': { value: 79, grade: 'C', trend: 'stable' },
      'Policy Admin System': { value: 76, grade: 'C', trend: 'stable' },
      'Document Management': { value: 74, grade: 'C', trend: 'declining' },
      'Insurance Claims Portal': { value: 80, grade: 'B', trend: 'improving' },
      'Settlement Engine': { value: 77, grade: 'C', trend: 'stable' },
      'Actuarial Platform': { value: 90, grade: 'A', trend: 'improving' },
      'Compliance Dashboard': { value: 95, grade: 'A', trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 74.5 },
      { period: monthsAgoLabel(10), value: 75.5 },
      { period: monthsAgoLabel(9), value: 76.5 },
      { period: monthsAgoLabel(8), value: 77.0 },
      { period: monthsAgoLabel(7), value: 78.0 },
      { period: monthsAgoLabel(6), value: 78.5 },
      { period: monthsAgoLabel(5), value: 79.5 },
      { period: monthsAgoLabel(4), value: 80.0 },
      { period: monthsAgoLabel(3), value: 80.5 },
      { period: monthsAgoLabel(2), value: 81.0 },
      { period: monthsAgoLabel(1), value: 82.0 },
      { period: monthsAgoLabel(0), value: 82.5 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['enterprise', 'quality-score', 'composite', 'executive'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-release_readiness_score',
    key: 'release_readiness_score',
    name: 'Release Readiness Score',
    value: 79.4,
    normalizedScore: 79.4,
    weight: 1.0,
    unit: 'score',
    formula: 'weighted_average(gate_compliance, pass_rate, dre, automation, req_coverage)',
    description: 'Composite readiness score for release decisions, combining quality gate compliance, test pass rate, defect removal efficiency, automation coverage, and requirement coverage.',
    threshold: { target: 80, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 3.0,
    status: 'at_risk',
    grade: 'C',
    releaseBreakdown: {
      'rel-001': { name: 'Release 2024.06', application: 'EQIP Core', score: 92, status: 'Ready', grade: 'A' },
      'rel-002': { name: 'Release 2024.07', application: 'Payment Gateway', score: 78, status: 'In Progress', grade: 'C' },
      'rel-003': { name: 'Release 2024.08', application: 'Member Portal', score: 85, status: 'In Review', grade: 'B' },
      'rel-004': { name: 'Release 2024.09', application: 'Provider Directory', score: 65, status: 'At Risk', grade: 'D' },
      'rel-005': { name: 'Release 2024.10', application: 'Claims Processing', score: 95, status: 'Ready', grade: 'A' },
      'rel-006': { name: 'Release 2024.11', application: 'Rx Platform', score: 72, status: 'In Progress', grade: 'C' },
      'rel-007': { name: 'Release 2024.12', application: 'Enrollment Engine', score: 45, status: 'Draft', grade: 'F' },
      'rel-008': { name: 'Release 2024.13', application: 'Underwriting Engine', score: 80, status: 'In Progress', grade: 'B' },
      'rel-009': { name: 'Release 2024.14', application: 'Compliance Dashboard', score: 97, status: 'Ready', grade: 'A' },
      'rel-010': { name: 'Release 2024.15', application: 'Insurance Claims Portal', score: 83, status: 'In Review', grade: 'B' },
    },
    recommendations: [
      'Address failing quality gates for Payment Gateway Release 2024.07.',
      'Resolve critical defects in Provider Directory Release 2024.09 before proceeding.',
      'Increase automation coverage across all releases to meet 80% target.',
      'Complete requirements review for Enrollment Engine Release 2024.12.',
    ],
    historicalData: [
      { period: monthsAgoLabel(11), value: 68.0 },
      { period: monthsAgoLabel(10), value: 69.5 },
      { period: monthsAgoLabel(9), value: 70.5 },
      { period: monthsAgoLabel(8), value: 71.5 },
      { period: monthsAgoLabel(7), value: 72.5 },
      { period: monthsAgoLabel(6), value: 73.5 },
      { period: monthsAgoLabel(5), value: 74.5 },
      { period: monthsAgoLabel(4), value: 75.5 },
      { period: monthsAgoLabel(3), value: 76.5 },
      { period: monthsAgoLabel(2), value: 77.5 },
      { period: monthsAgoLabel(1), value: 78.5 },
      { period: monthsAgoLabel(0), value: 79.4 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['release', 'readiness', 'composite', 'executive'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
  {
    id: 'metric-test_effectiveness',
    key: 'test_effectiveness',
    name: 'Test Effectiveness',
    value: 84.44,
    normalizedScore: 84.44,
    weight: 0,
    unit: '%',
    formula: '(defects_found_by_tests / total_defects) * 100',
    description: 'Percentage of defects found through testing activities.',
    threshold: { target: 90, direction: 'higher_is_better' },
    trend: 'improving',
    trendPercentage: 4.0,
    status: 'healthy',
    grade: 'B',
    segmentBreakdown: {
      Claims: { value: 90.0, normalizedScore: 100, trend: 'improving' },
      Billing: { value: 78.0, normalizedScore: 86.67, trend: 'stable' },
      Enrollment: { value: 88.0, normalizedScore: 97.78, trend: 'improving' },
      Provider: { value: 72.0, normalizedScore: 80.0, trend: 'declining' },
      Pharmacy: { value: 86.0, normalizedScore: 95.56, trend: 'improving' },
      Enterprise: { value: 92.0, normalizedScore: 100, trend: 'improving' },
      Underwriting: { value: 82.0, normalizedScore: 91.11, trend: 'stable' },
      'Policy Administration': { value: 75.0, normalizedScore: 83.33, trend: 'stable' },
      'Insurance Claims': { value: 85.0, normalizedScore: 94.44, trend: 'improving' },
      Actuarial: { value: 94.0, normalizedScore: 100, trend: 'improving' },
      'Regulatory Compliance': { value: 96.0, normalizedScore: 100, trend: 'stable' },
    },
    applicationBreakdown: {
      'EQIP Core': { value: 92.0, trend: 'improving' },
      'Claims Processing': { value: 90.0, trend: 'improving' },
      'Payment Gateway': { value: 78.0, trend: 'stable' },
      'Provider Directory': { value: 72.0, trend: 'declining' },
      'Rx Platform': { value: 86.0, trend: 'improving' },
      'Compliance Dashboard': { value: 96.0, trend: 'stable' },
    },
    historicalData: [
      { period: monthsAgoLabel(11), value: 72.0 },
      { period: monthsAgoLabel(10), value: 73.5 },
      { period: monthsAgoLabel(9), value: 75.0 },
      { period: monthsAgoLabel(8), value: 76.0 },
      { period: monthsAgoLabel(7), value: 77.5 },
      { period: monthsAgoLabel(6), value: 78.5 },
      { period: monthsAgoLabel(5), value: 79.5 },
      { period: monthsAgoLabel(4), value: 80.5 },
      { period: monthsAgoLabel(3), value: 81.5 },
      { period: monthsAgoLabel(2), value: 82.5 },
      { period: monthsAgoLabel(1), value: 83.5 },
      { period: monthsAgoLabel(0), value: 84.44 },
    ],
    lastCalculated: daysAgo(0),
    tags: ['testing', 'effectiveness', 'defects'],
    version: 1,
    created_at: daysAgo(365),
    updated_at: daysAgo(0),
    created_by: 'system',
    updated_by: 'system',
  },
];

/**
 * Mock adoption and impact metrics for the Analytics screen.
 * @type {object}
 */
const adoptionMetrics = {
  totalUsers: 25,
  activeUsers: 22,
  activeUsersPercentage: 88.0,
  averageSessionDuration: 18.5,
  averageSessionDurationUnit: 'minutes',
  dailyActiveUsers: [
    { date: daysAgo(6), count: 18 },
    { date: daysAgo(5), count: 20 },
    { date: daysAgo(4), count: 19 },
    { date: daysAgo(3), count: 22 },
    { date: daysAgo(2), count: 21 },
    { date: daysAgo(1), count: 20 },
    { date: daysAgo(0), count: 22 },
  ],
  featureUsage: {
    dashboard: { views: 1250, uniqueUsers: 22, trend: 'stable' },
    demands: { views: 890, uniqueUsers: 18, trend: 'improving' },
    testAssets: { views: 720, uniqueUsers: 14, trend: 'improving' },
    qualityGates: { views: 650, uniqueUsers: 16, trend: 'stable' },
    metrics: { views: 580, uniqueUsers: 15, trend: 'improving' },
    integrations: { views: 120, uniqueUsers: 4, trend: 'stable' },
    reports: { views: 340, uniqueUsers: 12, trend: 'improving' },
    settings: { views: 45, uniqueUsers: 2, trend: 'stable' },
  },
  roleDistribution: {
    admin: 2,
    program_manager: 2,
    project_manager: 2,
    qa_lead: 2,
    qa_engineer: 6,
    developer: 3,
    business_analyst: 2,
    release_manager: 2,
    scrum_master: 2,
    viewer: 2,
  },
  exportActivity: {
    totalExports: 156,
    csvExports: 98,
    excelExports: 35,
    pdfExports: 18,
    powerpointExports: 5,
    lastExportDate: daysAgo(0),
  },
  aiInsightsUsage: {
    totalQueries: 245,
    riskPredictions: 68,
    recommendations: 42,
    naturalLanguageSearches: 85,
    askEqipQueries: 50,
    averageConfidence: 0.93,
    averageResponseTimeMs: 1250,
  },
  lastUpdated: daysAgo(0),
};

/**
 * Mock quality trend data for the Executive Dashboard.
 * @type {object}
 */
const qualityTrends = {
  enterpriseQualityScore: {
    current: 82.5,
    previous: 80.2,
    change: 2.3,
    changePercentage: 2.87,
    trend: 'improving',
    grade: 'B',
    target: 90,
    historicalData: [
      { period: 'Q1 2023', value: 68.0 },
      { period: 'Q2 2023', value: 71.5 },
      { period: 'Q3 2023', value: 74.0 },
      { period: 'Q4 2023', value: 76.5 },
      { period: 'Q1 2024', value: 80.2 },
      { period: 'Q2 2024', value: 82.5 },
    ],
  },
  defectTrends: {
    totalDefects: {
      current: 115,
      previous: 142,
      change: -27,
      changePercentage: -19.01,
      trend: 'improving',
    },
    criticalDefects: {
      current: 6,
      previous: 12,
      change: -6,
      changePercentage: -50.0,
      trend: 'improving',
    },
    openDefects: {
      current: 41,
      previous: 58,
      change: -17,
      changePercentage: -29.31,
      trend: 'improving',
    },
    monthlyDefects: [
      { period: monthsAgoLabel(11), total: 22, critical: 3, high: 5, medium: 8, low: 6 },
      { period: monthsAgoLabel(10), total: 20, critical: 2, high: 5, medium: 7, low: 6 },
      { period: monthsAgoLabel(9), total: 18, critical: 2, high: 4, medium: 7, low: 5 },
      { period: monthsAgoLabel(8), total: 16, critical: 1, high: 4, medium: 6, low: 5 },
      { period: monthsAgoLabel(7), total: 15, critical: 1, high: 3, medium: 6, low: 5 },
      { period: monthsAgoLabel(6), total: 14, critical: 1, high: 3, medium: 5, low: 5 },
      { period: monthsAgoLabel(5), total: 12, critical: 1, high: 3, medium: 4, low: 4 },
      { period: monthsAgoLabel(4), total: 11, critical: 1, high: 2, medium: 4, low: 4 },
      { period: monthsAgoLabel(3), total: 10, critical: 1, high: 2, medium: 4, low: 3 },
      { period: monthsAgoLabel(2), total: 9, critical: 0, high: 2, medium: 4, low: 3 },
      { period: monthsAgoLabel(1), total: 8, critical: 0, high: 2, medium: 3, low: 3 },
      { period: monthsAgoLabel(0), total: 7, critical: 0, high: 1, medium: 3, low: 3 },
    ],
  },
  releaseTrends: {
    totalReleases: 10,
    readyReleases: 3,
    inProgressReleases: 3,
    atRiskReleases: 1,
    inReviewReleases: 2,
    draftReleases: 1,
    averageReadinessScore: 79.4,
    averageQualityScore: 79.2,
    onTimeDeliveryRate: 80.0,
    quarterlyReleases: [
      { period: 'Q1 2023', count: 6, avgScore: 72 },
      { period: 'Q2 2023', count: 7, avgScore: 74 },
      { period: 'Q3 2023', count: 8, avgScore: 76 },
      { period: 'Q4 2023', count: 8, avgScore: 78 },
      { period: 'Q1 2024', count: 9, avgScore: 80 },
      { period: 'Q2 2024', count: 10, avgScore: 82 },
    ],
  },
  governanceTrends: {
    averageComplianceRate: 87.87,
    compliantProcedures: 10,
    atRiskProcedures: 4,
    nonCompliantProcedures: 1,
    totalOpenFindings: 18,
    quarterlyCompliance: [
      { period: 'Q1 2023', rate: 78 },
      { period: 'Q2 2023', rate: 80 },
      { period: 'Q3 2023', rate: 82 },
      { period: 'Q4 2023', rate: 84 },
      { period: 'Q1 2024', rate: 86 },
      { period: 'Q2 2024', rate: 87.87 },
    ],
  },
  lastUpdated: daysAgo(0),
};

/**
 * Mock dashboard summary data for the Executive Dashboard.
 * @type {object}
 */
const dashboardSummary = {
  enterpriseQualityScore: {
    value: 82.5,
    grade: 'B',
    trend: 'improving',
    trendPercentage: 2.3,
    target: 90,
  },
  releaseReadiness: {
    value: 79.4,
    status: 'At Risk',
    trend: 'improving',
    trendPercentage: 3.0,
    target: 80,
  },
  testPassRate: {
    value: 97.78,
    trend: 'improving',
    trendPercentage: 1.8,
    target: 98,
  },
  automationCoverage: {
    value: 63.2,
    trend: 'improving',
    trendPercentage: 5.3,
    target: 80,
    status: 'at_risk',
  },
  defectDensity: {
    value: 0.59,
    trend: 'improving',
    trendPercentage: -8.5,
    target: 1.0,
  },
  escapedDefectRate: {
    value: 3.2,
    trend: 'improving',
    trendPercentage: -15.0,
    target: 2.0,
    status: 'at_risk',
  },
  qualityGateCompliance: {
    value: 81.25,
    trend: 'stable',
    trendPercentage: 0.5,
    target: 100,
    status: 'at_risk',
  },
  governanceCompliance: {
    value: 87.87,
    trend: 'improving',
    trendPercentage: 2.2,
    target: 95,
  },
  totalApplications: 19,
  totalReleases: 10,
  totalDemands: 30,
  totalTestCases: 40,
  totalIntegrations: 20,
  totalEnvironments: 28,
  criticalAlerts: [
    { id: 'alert-001', type: 'release_at_risk', message: 'Release 2024.09 (Provider Directory) is at critical risk with 5 failed quality gates.', severity: 'critical', entityId: 'rel-004', createdAt: daysAgo(1) },
    { id: 'alert-002', type: 'integration_disconnected', message: 'Okta integration has been disconnected for 5 days.', severity: 'critical', entityId: 'int-020', createdAt: daysAgo(5) },
    { id: 'alert-003', type: 'security_vulnerability', message: 'Stored XSS vulnerability found in EQIP Core release notes field.', severity: 'critical', entityId: 'dem-013', createdAt: daysAgo(3) },
    { id: 'alert-004', type: 'clinical_safety', message: 'False positive drug interaction alert in Rx Platform.', severity: 'critical', entityId: 'exec-041', createdAt: daysAgo(2) },
  ],
  recentActivity: [
    { id: 'activity-001', action: 'Release 2024.14 deployed to production', entityType: 'releases', entityId: 'rel-009', userId: 'user-017', timestamp: daysAgo(5) },
    { id: 'activity-002', action: 'Quality gate waiver rejected for Provider Directory security scan', entityType: 'quality-gates', entityId: 'qg-012', userId: 'user-001', timestamp: daysAgo(1) },
    { id: 'activity-003', action: 'XSS vulnerability fix in progress for EQIP Core', entityType: 'demands', entityId: 'dem-013', userId: 'user-019', timestamp: daysAgo(2) },
    { id: 'activity-004', action: 'Enterprise Quality Score recalculated: 82.5 (Grade B)', entityType: 'metrics', entityId: 'metric-enterprise_quality_score', userId: 'system', timestamp: daysAgo(0) },
    { id: 'activity-005', action: 'Claims Processing Release 2024.10 approved for production', entityType: 'releases', entityId: 'rel-005', userId: 'user-012', timestamp: daysAgo(3) },
  ],
  lastUpdated: daysAgo(0),
};

export default metrics;

/**
 * Get all mock metrics.
 * @returns {Array<object>} Array of metric objects.
 */
export function getAllMetrics() {
  return [...metrics];
}

/**
 * Find a metric by ID.
 * @param {string} id - The metric ID to find.
 * @returns {object|null} The metric object, or null if not found.
 */
export function getMetricById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }
  return metrics.find((m) => m.id === id) || null;
}

/**
 * Find a metric by key.
 * @param {string} key - The metric key to find (e.g., 'defect_density').
 * @returns {object|null} The metric object, or null if not found.
 */
export function getMetricByKey(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }
  return metrics.find((m) => m.key === key) || null;
}

/**
 * Get all metrics with a specific status.
 * @param {string} status - The status to filter by (e.g., 'healthy', 'at_risk').
 * @returns {Array<object>} Array of metrics with the specified status.
 */
export function getMetricsByStatus(status) {
  if (!status || typeof status !== 'string') {
    return [];
  }
  return metrics.filter((m) => m.status === status);
}

/**
 * Get all metrics with a specific trend.
 * @param {string} trend - The trend to filter by (e.g., 'improving', 'stable', 'declining').
 * @returns {Array<object>} Array of metrics with the specified trend.
 */
export function getMetricsByTrend(trend) {
  if (!trend || typeof trend !== 'string') {
    return [];
  }
  return metrics.filter((m) => m.trend === trend);
}

/**
 * Get all metrics with a specific grade.
 * @param {string} grade - The grade to filter by (e.g., 'A', 'B', 'C', 'D', 'F').
 * @returns {Array<object>} Array of metrics with the specified grade.
 */
export function getMetricsByGrade(grade) {
  if (!grade || typeof grade !== 'string') {
    return [];
  }
  return metrics.filter((m) => m.grade === grade);
}

/**
 * Get historical data for a specific metric.
 * @param {string} key - The metric key.
 * @param {number} [periods=12] - Number of historical periods to return.
 * @returns {Array<object>} Array of historical data points.
 */
export function getMetricHistoricalData(key, periods) {
  if (!key || typeof key !== 'string') {
    return [];
  }
  const metric = metrics.find((m) => m.key === key);
  if (!metric || !Array.isArray(metric.historicalData)) {
    return [];
  }
  if (typeof periods === 'number' && periods > 0) {
    return metric.historicalData.slice(-periods);
  }
  return [...metric.historicalData];
}

/**
 * Get segment breakdown for a specific metric.
 * @param {string} key - The metric key.
 * @returns {object|null} The segment breakdown object, or null if not found.
 */
export function getMetricSegmentBreakdown(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }
  const metric = metrics.find((m) => m.key === key);
  if (!metric || !metric.segmentBreakdown) {
    return null;
  }
  return { ...metric.segmentBreakdown };
}

/**
 * Get application breakdown for a specific metric.
 * @param {string} key - The metric key.
 * @returns {object|null} The application breakdown object, or null if not found.
 */
export function getMetricApplicationBreakdown(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }
  const metric = metrics.find((m) => m.key === key);
  if (!metric || !metric.applicationBreakdown) {
    return null;
  }
  return { ...metric.applicationBreakdown };
}

/**
 * Get the Enterprise Quality Score metric.
 * @returns {object|null} The Enterprise Quality Score metric object.
 */
export function getEnterpriseQualityScore() {
  return getMetricByKey('enterprise_quality_score');
}

/**
 * Get the Release Readiness Score metric.
 * @returns {object|null} The Release Readiness Score metric object.
 */
export function getReleaseReadinessScore() {
  return getMetricByKey('release_readiness_score');
}

/**
 * Get distinct metric keys from the metrics data.
 * @returns {string[]} Array of unique metric key strings.
 */
export function getDistinctMetricKeys() {
  const keys = new Set();
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].key) {
      keys.add(metrics[i].key);
    }
  }
  return [...keys].sort();
}

/**
 * Get distinct statuses from the metrics data.
 * @returns {string[]} Array of unique status strings.
 */
export function getDistinctStatuses() {
  const statuses = new Set();
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].status) {
      statuses.add(metrics[i].status);
    }
  }
  return [...statuses].sort();
}

/**
 * Get distinct grades from the metrics data.
 * @returns {string[]} Array of unique grade strings.
 */
export function getDistinctGrades() {
  const grades = new Set();
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].grade) {
      grades.add(metrics[i].grade);
    }
  }
  return [...grades].sort();
}

/**
 * Get distinct trends from the metrics data.
 * @returns {string[]} Array of unique trend strings.
 */
export function getDistinctTrends() {
  const trends = new Set();
  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].trend) {
      trends.add(metrics[i].trend);
    }
  }
  return [...trends].sort();
}

/**
 * Get a count of metrics grouped by status.
 * @returns {object} Object with status keys and count values.
 */
export function getMetricCountByStatus() {
  const counts = {};
  for (let i = 0; i < metrics.length; i++) {
    const status = metrics[i].status;
    if (status) {
      counts[status] = (counts[status] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Get a count of metrics grouped by grade.
 * @returns {object} Object with grade keys and count values.
 */
export function getMetricCountByGrade() {
  const counts = {};
  for (let i = 0; i < metrics.length; i++) {
    const grade = metrics[i].grade;
    if (grade) {
      counts[grade] = (counts[grade] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Get a count of metrics grouped by trend.
 * @returns {object} Object with trend keys and count values.
 */
export function getMetricCountByTrend() {
  const counts = {};
  for (let i = 0; i < metrics.length; i++) {
    const trend = metrics[i].trend;
    if (trend) {
      counts[trend] = (counts[trend] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Get the adoption metrics data.
 * @returns {object} The adoption metrics object.
 */
export function getAdoptionMetrics() {
  return { ...adoptionMetrics };
}

/**
 * Get the quality trends data.
 * @returns {object} The quality trends object.
 */
export function getQualityTrends() {
  return JSON.parse(JSON.stringify(qualityTrends));
}

/**
 * Get the dashboard summary data.
 * @returns {object} The dashboard summary object.
 */
export function getDashboardSummary() {
  return JSON.parse(JSON.stringify(dashboardSummary));
}

/**
 * Get metrics sorted by normalized score in ascending order (worst first).
 * @param {number} [limit] - Optional maximum number of metrics to return.
 * @returns {Array<object>} Array of metrics sorted by normalized score ascending.
 */
export function getLowestScoringMetrics(limit) {
  const sorted = [...metrics].sort(
    (a, b) => (a.normalizedScore || 0) - (b.normalizedScore || 0),
  );
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get metrics sorted by normalized score in descending order (best first).
 * @param {number} [limit] - Optional maximum number of metrics to return.
 * @returns {Array<object>} Array of metrics sorted by normalized score descending.
 */
export function getHighestScoringMetrics(limit) {
  const sorted = [...metrics].sort(
    (a, b) => (b.normalizedScore || 0) - (a.normalizedScore || 0),
  );
  if (typeof limit === 'number' && limit > 0) {
    return sorted.slice(0, limit);
  }
  return sorted;
}

/**
 * Get metrics that are at risk (status === 'at_risk').
 * @returns {Array<object>} Array of at-risk metric objects.
 */
export function getAtRiskMetrics() {
  return metrics.filter((m) => m.status === 'at_risk');
}

/**
 * Get metrics that are healthy (status === 'healthy').
 * @returns {Array<object>} Array of healthy metric objects.
 */
export function getHealthyMetrics() {
  return metrics.filter((m) => m.status === 'healthy');
}

/**
 * Get metrics that are improving (trend === 'improving').
 * @returns {Array<object>} Array of improving metric objects.
 */
export function getImprovingMetrics() {
  return metrics.filter((m) => m.trend === 'improving');
}

/**
 * Get metrics that are declining (trend === 'declining').
 * @returns {Array<object>} Array of declining metric objects.
 */
export function getDecliningMetrics() {
  return metrics.filter((m) => m.trend === 'declining');
}

/**
 * Get the default metric weights.
 * @returns {object} The default metric weights object.
 */
export function getDefaultWeights() {
  return { ...DEFAULT_METRIC_WEIGHTS };
}

/**
 * Get the default metric thresholds.
 * @returns {object} The default metric thresholds object.
 */
export function getDefaultThresholds() {
  return JSON.parse(JSON.stringify(DEFAULT_METRIC_THRESHOLDS));
}

/**
 * Calculate the average normalized score across all core metrics (excluding composite scores).
 * @returns {number} The average normalized score, or 0 if no metrics exist.
 */
export function getAverageNormalizedScore() {
  const coreMetrics = metrics.filter(
    (m) =>
      m.key !== 'enterprise_quality_score' &&
      m.key !== 'release_readiness_score' &&
      m.key !== 'test_effectiveness',
  );
  if (coreMetrics.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < coreMetrics.length; i++) {
    total += coreMetrics[i].normalizedScore || 0;
  }
  return Math.round((total / coreMetrics.length) * 100) / 100;
}

/**
 * Get a summary of all metrics for dashboard display.
 * @returns {object} Summary object with key metric values.
 */
export function getMetricsSummary() {
  const summary = {};
  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    summary[metric.key] = {
      name: metric.name,
      value: metric.value,
      normalizedScore: metric.normalizedScore,
      unit: metric.unit,
      grade: metric.grade || null,
      status: metric.status || null,
      trend: metric.trend || null,
      trendPercentage: metric.trendPercentage || 0,
      lastCalculated: metric.lastCalculated,
    };
  }
  return summary;
}

/**
 * Search metrics by name or key (case-insensitive partial match).
 * @param {string} query - The search query.
 * @returns {Array<object>} Array of matching metric objects.
 */
export function searchMetrics(query) {
  if (!query || typeof query !== 'string') {
    return [];
  }
  const queryLower = query.toLowerCase();
  return metrics.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(queryLower)) ||
      (m.key && m.key.toLowerCase().includes(queryLower)),
  );
}

/**
 * Get the total weight sum across all weighted metrics.
 * @returns {number} The sum of all metric weights (excluding composite scores).
 */
export function getTotalWeight() {
  let total = 0;
  for (let i = 0; i < metrics.length; i++) {
    if (
      metrics[i].key !== 'enterprise_quality_score' &&
      metrics[i].key !== 'release_readiness_score' &&
      metrics[i].key !== 'test_effectiveness'
    ) {
      total += metrics[i].weight || 0;
    }
  }
  return Math.round(total * 100) / 100;
}

/**
 * Get metric value for a specific application from the application breakdown.
 * @param {string} metricKey - The metric key.
 * @param {string} applicationName - The application name.
 * @returns {object|null} The application metric data, or null if not found.
 */
export function getMetricForApplication(metricKey, applicationName) {
  if (!metricKey || !applicationName) {
    return null;
  }
  const metric = metrics.find((m) => m.key === metricKey);
  if (!metric || !metric.applicationBreakdown) {
    return null;
  }
  const appData = metric.applicationBreakdown[applicationName];
  if (!appData) {
    return null;
  }
  return { ...appData, metricKey, applicationName };
}

/**
 * Get metric value for a specific segment from the segment breakdown.
 * @param {string} metricKey - The metric key.
 * @param {string} segmentName - The segment name.
 * @returns {object|null} The segment metric data, or null if not found.
 */
export function getMetricForSegment(metricKey, segmentName) {
  if (!metricKey || !segmentName) {
    return null;
  }
  const metric = metrics.find((m) => m.key === metricKey);
  if (!metric || !metric.segmentBreakdown) {
    return null;
  }
  const segData = metric.segmentBreakdown[segmentName];
  if (!segData) {
    return null;
  }
  return { ...segData, metricKey, segmentName };
}