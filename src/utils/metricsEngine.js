import { v4 as uuidv4 } from 'uuid';
import { loadEntities, persistEntities, getItem, setItem } from './localStorage.js';
import { METRIC_FORMULAS } from '../constants.js';

/**
 * @module metricsEngine
 * Core Metrics Engine for eQIP Quality Intelligence.
 * Calculates Enterprise Quality Score, Release Readiness Score, Automation Coverage,
 * Defect Density, Test Effectiveness, and all other PRD-defined metrics.
 * Weights are configurable and stored in localStorage.
 */

/**
 * The entity type key used for metrics storage.
 * @type {string}
 */
const METRICS_ENTITY_TYPE = 'metrics';

/**
 * The localStorage key for metric weights configuration.
 * @type {string}
 */
const WEIGHTS_STORAGE_KEY = 'eqip_metric_weights';

/**
 * Default metric weights used for Enterprise Quality Score calculation.
 * @type {Readonly<object>}
 */
const DEFAULT_WEIGHTS = Object.freeze({
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
 * Values above the threshold score 100; values below are proportionally scored.
 * @type {Readonly<object>}
 */
const DEFAULT_THRESHOLDS = Object.freeze({
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

// ---------------------------------------------------------------------------
// Weight Management
// ---------------------------------------------------------------------------

/**
 * Retrieve the current metric weights from localStorage.
 * Falls back to default weights if none are stored.
 *
 * @returns {object} The metric weights object.
 */
export function getWeights() {
  const stored = getItem(WEIGHTS_STORAGE_KEY, null);
  if (stored && typeof stored === 'object') {
    return { ...DEFAULT_WEIGHTS, ...stored };
  }
  return { ...DEFAULT_WEIGHTS };
}

/**
 * Update metric weights in localStorage.
 * Merges provided weights with existing weights.
 *
 * @param {object} weights - Partial or full weights object to merge.
 * @returns {object} The updated weights object.
 */
export function setWeights(weights) {
  if (!weights || typeof weights !== 'object') {
    return getWeights();
  }

  const current = getWeights();
  const updated = { ...current };

  const keys = Object.keys(weights);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = weights[key];
    if (typeof value === 'number' && value >= 0 && value <= 1) {
      updated[key] = value;
    }
  }

  setItem(WEIGHTS_STORAGE_KEY, updated);
  return updated;
}

/**
 * Reset metric weights to defaults.
 *
 * @returns {object} The default weights object.
 */
export function resetWeights() {
  setItem(WEIGHTS_STORAGE_KEY, { ...DEFAULT_WEIGHTS });
  return { ...DEFAULT_WEIGHTS };
}

// ---------------------------------------------------------------------------
// Individual Metric Calculations
// ---------------------------------------------------------------------------

/**
 * Calculate Defect Density.
 * Formula: total_defects / size_kloc
 *
 * @param {object} data - Input data.
 * @param {number} data.total_defects - Total number of defects.
 * @param {number} data.size_kloc - Size in thousands of lines of code.
 * @returns {number} Defect density value (defects/KLOC).
 */
export function calculateDefectDensity(data) {
  const totalDefects = getNumericValue(data, 'total_defects', 0);
  const sizeKloc = getNumericValue(data, 'size_kloc', 1);

  if (sizeKloc <= 0) {
    return 0;
  }

  return roundToDecimals(totalDefects / sizeKloc, 2);
}

/**
 * Calculate Defect Removal Efficiency.
 * Formula: (defects_found_before_release / total_defects) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.defects_found_before_release - Defects found before release.
 * @param {number} data.total_defects - Total number of defects.
 * @returns {number} DRE percentage.
 */
export function calculateDefectRemovalEfficiency(data) {
  const defectsFoundBeforeRelease = getNumericValue(data, 'defects_found_before_release', 0);
  const totalDefects = getNumericValue(data, 'total_defects', 0);

  if (totalDefects <= 0) {
    return 100;
  }

  return roundToDecimals((defectsFoundBeforeRelease / totalDefects) * 100, 2);
}

/**
 * Calculate Test Case Pass Rate.
 * Formula: (passed_tests / total_tests) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.passed_tests - Number of passed tests.
 * @param {number} data.total_tests - Total number of tests.
 * @returns {number} Pass rate percentage.
 */
export function calculateTestCasePassRate(data) {
  const passedTests = getNumericValue(data, 'passed_tests', 0);
  const totalTests = getNumericValue(data, 'total_tests', 0);

  if (totalTests <= 0) {
    return 0;
  }

  return roundToDecimals((passedTests / totalTests) * 100, 2);
}

/**
 * Calculate Test Execution Rate.
 * Formula: (executed_tests / planned_tests) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.executed_tests - Number of executed tests.
 * @param {number} data.planned_tests - Number of planned tests.
 * @returns {number} Execution rate percentage.
 */
export function calculateTestExecutionRate(data) {
  const executedTests = getNumericValue(data, 'executed_tests', 0);
  const plannedTests = getNumericValue(data, 'planned_tests', 0);

  if (plannedTests <= 0) {
    return 0;
  }

  return roundToDecimals((executedTests / plannedTests) * 100, 2);
}

/**
 * Calculate Automation Coverage.
 * Formula: (automated_tests / total_tests) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.automated_tests - Number of automated tests.
 * @param {number} data.total_tests - Total number of tests.
 * @returns {number} Automation coverage percentage.
 */
export function calculateAutomationCoverage(data) {
  const automatedTests = getNumericValue(data, 'automated_tests', 0);
  const totalTests = getNumericValue(data, 'total_tests', 0);

  if (totalTests <= 0) {
    return 0;
  }

  return roundToDecimals((automatedTests / totalTests) * 100, 2);
}

/**
 * Calculate Mean Time to Detect (MTTD).
 * Formula: sum(detection_times) / total_defects
 *
 * @param {object} data - Input data.
 * @param {number} data.sum_detection_times - Sum of detection times in hours.
 * @param {number} data.total_defects - Total number of defects.
 * @returns {number} MTTD in hours.
 */
export function calculateMeanTimeToDetect(data) {
  const sumDetectionTimes = getNumericValue(data, 'sum_detection_times', 0);
  const totalDefects = getNumericValue(data, 'total_defects', 0);

  if (totalDefects <= 0) {
    return 0;
  }

  return roundToDecimals(sumDetectionTimes / totalDefects, 2);
}

/**
 * Calculate Mean Time to Resolve (MTTR).
 * Formula: sum(resolution_times) / total_defects
 *
 * @param {object} data - Input data.
 * @param {number} data.sum_resolution_times - Sum of resolution times in hours.
 * @param {number} data.total_defects - Total number of defects.
 * @returns {number} MTTR in hours.
 */
export function calculateMeanTimeToResolve(data) {
  const sumResolutionTimes = getNumericValue(data, 'sum_resolution_times', 0);
  const totalDefects = getNumericValue(data, 'total_defects', 0);

  if (totalDefects <= 0) {
    return 0;
  }

  return roundToDecimals(sumResolutionTimes / totalDefects, 2);
}

/**
 * Calculate Escaped Defect Rate.
 * Formula: (production_defects / total_defects) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.production_defects - Number of defects found in production.
 * @param {number} data.total_defects - Total number of defects.
 * @returns {number} Escaped defect rate percentage.
 */
export function calculateEscapedDefectRate(data) {
  const productionDefects = getNumericValue(data, 'production_defects', 0);
  const totalDefects = getNumericValue(data, 'total_defects', 0);

  if (totalDefects <= 0) {
    return 0;
  }

  return roundToDecimals((productionDefects / totalDefects) * 100, 2);
}

/**
 * Calculate Requirement Coverage.
 * Formula: (requirements_with_tests / total_requirements) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.requirements_with_tests - Requirements covered by tests.
 * @param {number} data.total_requirements - Total number of requirements.
 * @returns {number} Requirement coverage percentage.
 */
export function calculateRequirementCoverage(data) {
  const requirementsWithTests = getNumericValue(data, 'requirements_with_tests', 0);
  const totalRequirements = getNumericValue(data, 'total_requirements', 0);

  if (totalRequirements <= 0) {
    return 0;
  }

  return roundToDecimals((requirementsWithTests / totalRequirements) * 100, 2);
}

/**
 * Calculate Quality Gate Compliance.
 * Formula: (gates_passed / total_gates) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.gates_passed - Number of quality gates passed.
 * @param {number} data.total_gates - Total number of quality gates.
 * @returns {number} Quality gate compliance percentage.
 */
export function calculateQualityGateCompliance(data) {
  const gatesPassed = getNumericValue(data, 'gates_passed', 0);
  const totalGates = getNumericValue(data, 'total_gates', 0);

  if (totalGates <= 0) {
    return 0;
  }

  return roundToDecimals((gatesPassed / totalGates) * 100, 2);
}

/**
 * Calculate Test Effectiveness.
 * Formula: (defects_found_by_tests / total_defects) * 100
 *
 * @param {object} data - Input data.
 * @param {number} data.defects_found_by_tests - Defects found by testing.
 * @param {number} data.total_defects - Total number of defects.
 * @returns {number} Test effectiveness percentage.
 */
export function calculateTestEffectiveness(data) {
  const defectsFoundByTests = getNumericValue(data, 'defects_found_by_tests', 0);
  const totalDefects = getNumericValue(data, 'total_defects', 0);

  if (totalDefects <= 0) {
    return 100;
  }

  return roundToDecimals((defectsFoundByTests / totalDefects) * 100, 2);
}

// ---------------------------------------------------------------------------
// Metric Calculation Map
// ---------------------------------------------------------------------------

/**
 * Map of metric keys to their calculation functions.
 * @type {object}
 */
const METRIC_CALCULATORS = {
  defect_density: calculateDefectDensity,
  defect_removal_efficiency: calculateDefectRemovalEfficiency,
  test_case_pass_rate: calculateTestCasePassRate,
  test_execution_rate: calculateTestExecutionRate,
  automation_coverage: calculateAutomationCoverage,
  mean_time_to_detect: calculateMeanTimeToDetect,
  mean_time_to_resolve: calculateMeanTimeToResolve,
  escaped_defect_rate: calculateEscapedDefectRate,
  requirement_coverage: calculateRequirementCoverage,
  quality_gate_compliance: calculateQualityGateCompliance,
  test_effectiveness: calculateTestEffectiveness,
};

// ---------------------------------------------------------------------------
// Normalization & Scoring
// ---------------------------------------------------------------------------

/**
 * Normalize a raw metric value to a 0-100 score based on threshold and direction.
 *
 * @param {number} value - The raw metric value.
 * @param {object} threshold - The threshold configuration.
 * @param {number} threshold.target - The target value.
 * @param {string} threshold.direction - 'higher_is_better' or 'lower_is_better'.
 * @returns {number} Normalized score between 0 and 100.
 */
export function normalizeMetricScore(value, threshold) {
  if (!threshold || typeof threshold.target !== 'number') {
    return 0;
  }

  const target = threshold.target;
  const direction = threshold.direction || 'higher_is_better';

  if (direction === 'higher_is_better') {
    if (target <= 0) {
      return value > 0 ? 100 : 0;
    }
    const score = (value / target) * 100;
    return roundToDecimals(Math.min(Math.max(score, 0), 100), 2);
  }

  // lower_is_better
  if (value <= 0) {
    return 100;
  }
  if (target <= 0) {
    return 0;
  }
  const score = (target / value) * 100;
  return roundToDecimals(Math.min(Math.max(score, 0), 100), 2);
}

// ---------------------------------------------------------------------------
// Composite Scores
// ---------------------------------------------------------------------------

/**
 * Calculate the Enterprise Quality Score as a weighted average of all normalized metric scores.
 *
 * @param {object} data - Raw input data containing all metric fields.
 * @param {object} [weights] - Optional weights override. Uses stored/default weights if not provided.
 * @returns {object} Enterprise Quality Score result.
 * @returns {number} return.score - The composite score (0-100).
 * @returns {object} return.breakdown - Individual metric scores and weights.
 * @returns {string} return.grade - Letter grade (A, B, C, D, F).
 * @returns {string} return.last_calculated - ISO timestamp.
 */
export function calculateEnterpriseQualityScore(data, weights) {
  const effectiveWeights = weights || getWeights();
  const safeData = data && typeof data === 'object' ? data : {};

  const breakdown = {};
  let totalWeight = 0;
  let weightedSum = 0;

  const metricKeys = Object.keys(METRIC_FORMULAS);

  for (let i = 0; i < metricKeys.length; i++) {
    const key = metricKeys[i];
    const calculator = METRIC_CALCULATORS[key];
    const threshold = DEFAULT_THRESHOLDS[key];
    const weight = typeof effectiveWeights[key] === 'number' ? effectiveWeights[key] : 0;

    if (!calculator || !threshold) {
      continue;
    }

    const rawValue = calculator(safeData);
    const normalizedScore = normalizeMetricScore(rawValue, threshold);

    breakdown[key] = {
      key,
      label: METRIC_FORMULAS[key] ? METRIC_FORMULAS[key].label : key,
      rawValue,
      normalizedScore,
      weight,
      unit: METRIC_FORMULAS[key] ? METRIC_FORMULAS[key].unit : '',
    };

    weightedSum += normalizedScore * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0
    ? roundToDecimals(weightedSum / totalWeight, 2)
    : 0;

  return {
    score,
    breakdown,
    grade: scoreToGrade(score),
    last_calculated: new Date().toISOString(),
  };
}

/**
 * Calculate Release Readiness Score for a specific release.
 * Combines quality gate compliance, test pass rate, defect metrics, and automation coverage.
 *
 * @param {object} data - Release-specific data.
 * @param {object} [weights] - Optional weights override.
 * @returns {object} Release readiness result.
 * @returns {number} return.score - The readiness score (0-100).
 * @returns {string} return.status - 'Ready', 'At Risk', 'Not Ready'.
 * @returns {object} return.breakdown - Individual metric contributions.
 * @returns {string[]} return.recommendations - Improvement recommendations.
 * @returns {string} return.last_calculated - ISO timestamp.
 */
export function calculateReleaseReadinessScore(data, weights) {
  const safeData = data && typeof data === 'object' ? data : {};

  const releaseWeights = weights || {
    quality_gate_compliance: 0.30,
    test_case_pass_rate: 0.25,
    defect_removal_efficiency: 0.20,
    automation_coverage: 0.15,
    requirement_coverage: 0.10,
  };

  const breakdown = {};
  let totalWeight = 0;
  let weightedSum = 0;

  const keys = Object.keys(releaseWeights);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const calculator = METRIC_CALCULATORS[key];
    const threshold = DEFAULT_THRESHOLDS[key];
    const weight = typeof releaseWeights[key] === 'number' ? releaseWeights[key] : 0;

    if (!calculator || !threshold) {
      continue;
    }

    const rawValue = calculator(safeData);
    const normalizedScore = normalizeMetricScore(rawValue, threshold);

    breakdown[key] = {
      key,
      label: METRIC_FORMULAS[key] ? METRIC_FORMULAS[key].label : key,
      rawValue,
      normalizedScore,
      weight,
    };

    weightedSum += normalizedScore * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0
    ? roundToDecimals(weightedSum / totalWeight, 2)
    : 0;

  const status = score >= 80 ? 'Ready' : score >= 60 ? 'At Risk' : 'Not Ready';

  const recommendations = generateRecommendations(breakdown);

  return {
    score,
    status,
    breakdown,
    recommendations,
    last_calculated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Full Metrics Calculation
// ---------------------------------------------------------------------------

/**
 * Calculate all metrics from the provided data and optional weights.
 * Persists calculated metrics to localStorage.
 *
 * @param {object} [data={}] - Raw input data containing all metric fields.
 * @param {object} [weights] - Optional weights override.
 * @returns {Array<object>} Array of calculated metric objects.
 */
export function calculateMetrics(data, weights) {
  const safeData = data && typeof data === 'object' ? data : generateDefaultMetricData();
  const effectiveWeights = weights || getWeights();
  const now = new Date().toISOString();

  const metrics = [];

  const metricKeys = Object.keys(METRIC_FORMULAS);

  for (let i = 0; i < metricKeys.length; i++) {
    const key = metricKeys[i];
    const formula = METRIC_FORMULAS[key];
    const calculator = METRIC_CALCULATORS[key];

    if (!calculator) {
      continue;
    }

    const rawValue = calculator(safeData);
    const threshold = DEFAULT_THRESHOLDS[key];
    const normalizedScore = threshold ? normalizeMetricScore(rawValue, threshold) : rawValue;
    const weight = typeof effectiveWeights[key] === 'number' ? effectiveWeights[key] : 0;

    metrics.push({
      id: `metric-${key}`,
      key,
      name: formula.label,
      value: rawValue,
      normalized_score: normalizedScore,
      weight,
      unit: formula.unit,
      formula: formula.formula,
      description: formula.description,
      last_calculated: now,
      created_at: now,
      updated_at: now,
      created_by: 'system',
      updated_by: 'system',
      version: 1,
    });
  }

  // Add Enterprise Quality Score
  const eqs = calculateEnterpriseQualityScore(safeData, effectiveWeights);
  metrics.push({
    id: 'metric-enterprise_quality_score',
    key: 'enterprise_quality_score',
    name: 'Enterprise Quality Score',
    value: eqs.score,
    normalized_score: eqs.score,
    weight: 1,
    unit: 'score',
    formula: 'weighted_average(all_normalized_metrics)',
    description: 'Composite quality score across all metrics.',
    grade: eqs.grade,
    breakdown: eqs.breakdown,
    last_calculated: now,
    created_at: now,
    updated_at: now,
    created_by: 'system',
    updated_by: 'system',
    version: 1,
  });

  // Add Release Readiness Score
  const rrs = calculateReleaseReadinessScore(safeData, null);
  metrics.push({
    id: 'metric-release_readiness_score',
    key: 'release_readiness_score',
    name: 'Release Readiness Score',
    value: rrs.score,
    normalized_score: rrs.score,
    weight: 1,
    unit: 'score',
    formula: 'weighted_average(gate_compliance, pass_rate, dre, automation, req_coverage)',
    description: 'Composite readiness score for release decisions.',
    status: rrs.status,
    recommendations: rrs.recommendations,
    breakdown: rrs.breakdown,
    last_calculated: now,
    created_at: now,
    updated_at: now,
    created_by: 'system',
    updated_by: 'system',
    version: 1,
  });

  // Add Test Effectiveness
  const testEffectiveness = calculateTestEffectiveness(safeData);
  metrics.push({
    id: 'metric-test_effectiveness',
    key: 'test_effectiveness',
    name: 'Test Effectiveness',
    value: testEffectiveness,
    normalized_score: testEffectiveness,
    weight: 0,
    unit: '%',
    formula: '(defects_found_by_tests / total_defects) * 100',
    description: 'Percentage of defects found through testing activities.',
    last_calculated: now,
    created_at: now,
    updated_at: now,
    created_by: 'system',
    updated_by: 'system',
    version: 1,
  });

  persistEntities(METRICS_ENTITY_TYPE, metrics);

  return metrics;
}

/**
 * Trigger a full recalculation of all metrics using stored or default data.
 * Loads existing metric data from localStorage, recalculates, and persists.
 *
 * @param {object} [data] - Optional raw data override. If not provided, uses default mock data.
 * @returns {Array<object>} Array of recalculated metric objects.
 */
export function recalculateMetrics(data) {
  const inputData = data || generateDefaultMetricData();
  const weights = getWeights();
  return calculateMetrics(inputData, weights);
}

/**
 * Retrieve a single metric by its ID from localStorage.
 *
 * @param {string} id - The metric ID (e.g., 'metric-defect_density').
 * @returns {object|null} The metric object, or null if not found.
 */
export function getMetricById(id) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  const metrics = loadEntities(METRICS_ENTITY_TYPE);

  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].id === id) {
      return metrics[i];
    }
  }

  return null;
}

/**
 * Retrieve a single metric by its key from localStorage.
 *
 * @param {string} key - The metric key (e.g., 'defect_density').
 * @returns {object|null} The metric object, or null if not found.
 */
export function getMetricByKey(key) {
  if (!key || typeof key !== 'string') {
    return null;
  }

  const metrics = loadEntities(METRICS_ENTITY_TYPE);

  for (let i = 0; i < metrics.length; i++) {
    if (metrics[i].key === key) {
      return metrics[i];
    }
  }

  return null;
}

/**
 * Retrieve all calculated metrics from localStorage.
 *
 * @returns {Array<object>} Array of metric objects.
 */
export function getAllMetrics() {
  const metrics = loadEntities(METRICS_ENTITY_TYPE);

  if (metrics.length === 0) {
    return recalculateMetrics();
  }

  return metrics;
}

/**
 * Get a summary of key metrics for dashboard display.
 *
 * @returns {object} Summary object with key metric values.
 */
export function getMetricsSummary() {
  const metrics = getAllMetrics();
  const summary = {};

  for (let i = 0; i < metrics.length; i++) {
    const metric = metrics[i];
    summary[metric.key] = {
      name: metric.name,
      value: metric.value,
      normalized_score: metric.normalized_score,
      unit: metric.unit,
      grade: metric.grade || null,
      status: metric.status || null,
      last_calculated: metric.last_calculated,
    };
  }

  return summary;
}

/**
 * Get metric trend data (simulated).
 * Generates mock historical data points for trend visualization.
 *
 * @param {string} metricKey - The metric key to get trends for.
 * @param {number} [periods=12] - Number of historical periods to generate.
 * @returns {Array<object>} Array of trend data points.
 */
export function getMetricTrends(metricKey, periods = 12) {
  if (!metricKey || typeof metricKey !== 'string') {
    return [];
  }

  const currentMetric = getMetricByKey(metricKey);
  const currentValue = currentMetric ? currentMetric.value : 50;
  const trends = [];

  for (let i = periods - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const variance = (Math.sin(i * 0.7) * 10) + (Math.random() * 5 - 2.5);
    let value = currentValue + variance - ((periods - 1 - i) * 0.5);

    if (currentMetric && currentMetric.unit === '%') {
      value = Math.min(Math.max(value, 0), 100);
    } else if (value < 0) {
      value = Math.abs(value);
    }

    trends.push({
      period: date.toISOString().slice(0, 7),
      date: date.toISOString(),
      value: roundToDecimals(value, 2),
      metric_key: metricKey,
    });
  }

  return trends;
}

/**
 * Calculate a single metric by key with provided data.
 *
 * @param {string} metricKey - The metric key to calculate.
 * @param {object} data - The input data for calculation.
 * @returns {object|null} The calculated metric result, or null if key is invalid.
 */
export function calculateSingleMetric(metricKey, data) {
  if (!metricKey || typeof metricKey !== 'string') {
    return null;
  }

  const calculator = METRIC_CALCULATORS[metricKey];
  if (!calculator) {
    if (metricKey === 'enterprise_quality_score') {
      return calculateEnterpriseQualityScore(data);
    }
    if (metricKey === 'release_readiness_score') {
      return calculateReleaseReadinessScore(data);
    }
    if (metricKey === 'test_effectiveness') {
      return {
        key: metricKey,
        value: calculateTestEffectiveness(data),
        last_calculated: new Date().toISOString(),
      };
    }
    return null;
  }

  const safeData = data && typeof data === 'object' ? data : {};
  const rawValue = calculator(safeData);
  const threshold = DEFAULT_THRESHOLDS[metricKey];
  const normalizedScore = threshold ? normalizeMetricScore(rawValue, threshold) : rawValue;
  const formula = METRIC_FORMULAS[metricKey];

  return {
    key: metricKey,
    name: formula ? formula.label : metricKey,
    value: rawValue,
    normalized_score: normalizedScore,
    unit: formula ? formula.unit : '',
    last_calculated: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Safely extract a numeric value from a data object.
 * @param {object} data - The data object.
 * @param {string} key - The key to extract.
 * @param {number} defaultValue - Default value if key is missing or non-numeric.
 * @returns {number} The numeric value.
 */
function getNumericValue(data, key, defaultValue) {
  if (!data || typeof data !== 'object') {
    return defaultValue;
  }

  const value = data[key];

  if (value === null || value === undefined) {
    return defaultValue;
  }

  const num = Number(value);
  if (isNaN(num)) {
    return defaultValue;
  }

  return num;
}

/**
 * Round a number to a specified number of decimal places.
 * @param {number} value - The value to round.
 * @param {number} decimals - Number of decimal places.
 * @returns {number} The rounded value.
 */
function roundToDecimals(value, decimals) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert a numeric score (0-100) to a letter grade.
 * @param {number} score - The score to convert.
 * @returns {string} Letter grade (A, B, C, D, F).
 */
function scoreToGrade(score) {
  if (score >= 90) {
    return 'A';
  }
  if (score >= 80) {
    return 'B';
  }
  if (score >= 70) {
    return 'C';
  }
  if (score >= 60) {
    return 'D';
  }
  return 'F';
}

/**
 * Generate improvement recommendations based on metric breakdown.
 * @param {object} breakdown - The metric breakdown object.
 * @returns {string[]} Array of recommendation strings.
 */
function generateRecommendations(breakdown) {
  const recommendations = [];

  if (!breakdown || typeof breakdown !== 'object') {
    return recommendations;
  }

  const keys = Object.keys(breakdown);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const metric = breakdown[key];

    if (!metric || typeof metric.normalizedScore !== 'number') {
      continue;
    }

    if (metric.normalizedScore < 60) {
      switch (key) {
        case 'quality_gate_compliance':
          recommendations.push('Critical: Address failing quality gates before release.');
          break;
        case 'test_case_pass_rate':
          recommendations.push('Critical: Investigate and fix failing test cases.');
          break;
        case 'defect_removal_efficiency':
          recommendations.push('Improve pre-release defect detection processes.');
          break;
        case 'automation_coverage':
          recommendations.push('Increase test automation coverage to reduce manual effort.');
          break;
        case 'requirement_coverage':
          recommendations.push('Ensure all requirements have associated test cases.');
          break;
        default:
          recommendations.push(`Improve ${metric.label || key} (currently at ${metric.normalizedScore}%).`);
          break;
      }
    } else if (metric.normalizedScore < 80) {
      switch (key) {
        case 'quality_gate_compliance':
          recommendations.push('Review quality gate waivers and address pending gates.');
          break;
        case 'test_case_pass_rate':
          recommendations.push('Review and stabilize flaky test cases.');
          break;
        case 'defect_removal_efficiency':
          recommendations.push('Enhance code review and static analysis practices.');
          break;
        case 'automation_coverage':
          recommendations.push('Consider automating high-priority regression test cases.');
          break;
        case 'requirement_coverage':
          recommendations.push('Map remaining requirements to test cases.');
          break;
        default:
          break;
      }
    }
  }

  return recommendations;
}

/**
 * Generate default mock metric input data for calculations.
 * @returns {object} Mock data object with all required metric fields.
 */
function generateDefaultMetricData() {
  return {
    total_defects: 45,
    size_kloc: 120,
    defects_found_before_release: 40,
    passed_tests: 1850,
    total_tests: 2000,
    executed_tests: 1900,
    planned_tests: 2000,
    automated_tests: 1400,
    sum_detection_times: 180,
    sum_resolution_times: 360,
    production_defects: 5,
    requirements_with_tests: 280,
    total_requirements: 300,
    gates_passed: 13,
    total_gates: 16,
    defects_found_by_tests: 38,
  };
}