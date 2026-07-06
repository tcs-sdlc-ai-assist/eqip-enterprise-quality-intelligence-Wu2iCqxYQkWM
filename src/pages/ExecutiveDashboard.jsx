import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRBAC } from '../contexts/RBACContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import FilterBar from '../components/common/FilterBar.jsx';
import ChartPlaceholder from '../components/common/ChartPlaceholder.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Button from '../components/common/Button.jsx';
import {
  renderDashboard,
  applyDashboardFilters,
  displayMetrics,
  getMetricDetail,
  getMetricHistory,
  getMetricBySegment,
  getMetricByApplication,
  getEnterpriseQualityScoreDetail,
  getReleaseReadinessScoreDetail,
  getQualityTrendsData,
  getAdoptionMetricsData,
  getMetricsByStatus,
  getAtRiskMetricsData,
  getImprovingMetricsData,
  getDecliningMetricsData,
  getLowestScoringMetricsData,
  getHighestScoringMetricsData,
  getMetricStatusCounts,
  getMetricGradeCounts,
  getMetricTrendCounts,
  getMetricWeights,
  updateMetricWeights,
  resetMetricWeights,
  getAnalyticsFilterOptions,
  getAnalyticsSummary,
  searchAnalyticsMetrics,
} from '../services/analyticsService.js';
import {
  getDistinctSegments as getAppDistinctSegments,
} from '../data/applications.js';
import {
  getDistinctApplications as getReleaseDistinctApplications,
} from '../data/releases.js';

/**
 * @module ExecutiveDashboard
 * Executive Dashboard page for eQIP Quality Intelligence.
 *
 * Displays Enterprise Quality Score, Release Readiness Score, Automation Coverage,
 * Defect Density, Test Effectiveness, and all PRD-defined metrics.
 * Supports filtering by segment, application, date range, risk level, quality status.
 * Metric weights are configurable by admin and QA lead roles.
 * Uses MetricCard, FilterBar, ChartPlaceholder, and DataTable components.
 * Data sourced from analyticsService.
 */

/**
 * Helper to resolve a grade letter to a badge variant.
 * @param {string} grade - The letter grade.
 * @returns {string} The badge variant.
 */
function gradeToVariant(grade) {
  if (!grade) return 'neutral';
  const g = grade.toUpperCase();
  if (g === 'A') return 'success';
  if (g === 'B') return 'info';
  if (g === 'C') return 'warning';
  if (g === 'D') return 'error';
  if (g === 'F') return 'error';
  return 'neutral';
}

/**
 * Helper to resolve a trend string to a direction.
 * @param {string} trend - The trend string.
 * @returns {'up'|'down'|'neutral'} The trend direction.
 */
function resolveTrend(trend) {
  if (!trend) return 'neutral';
  const t = trend.toLowerCase();
  if (t === 'improving' || t === 'up') return 'up';
  if (t === 'declining' || t === 'down') return 'down';
  return 'neutral';
}

/**
 * Helper to resolve a status string to a risk level display.
 * @param {string} status - The status string.
 * @returns {string} The status for badge display.
 */
function resolveMetricStatus(status) {
  if (!status) return 'unknown';
  return status;
}

/**
 * Columns definition for the metrics data table.
 * @type {Array<object>}
 */
const METRICS_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Metric',
    sortable: true,
    width: '200px',
  },
  {
    key: 'value',
    label: 'Value',
    sortable: true,
    align: 'right',
    width: '100px',
    render: (value, row) => {
      if (value === null || value === undefined) return '—';
      const unit = row.unit || '';
      if (unit === '%') return `${typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(2)) : value}%`;
      if (unit === 'hours') return `${typeof value === 'number' ? value.toFixed(1) : value} hrs`;
      if (unit === 'defects/KLOC') return `${typeof value === 'number' ? value.toFixed(2) : value}`;
      if (unit === 'score') return typeof value === 'number' ? value.toFixed(1) : value;
      return String(value);
    },
  },
  {
    key: 'normalizedScore',
    label: 'Score',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return typeof value === 'number' ? value.toFixed(1) : String(value);
    },
  },
  {
    key: 'grade',
    label: 'Grade',
    sortable: true,
    align: 'center',
    width: '70px',
    render: (value) => {
      if (!value) return '—';
      return <Badge variant={gradeToVariant(value)} size="sm">{value}</Badge>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveMetricStatus(value)} size="sm" />;
    },
  },
  {
    key: 'trend',
    label: 'Trend',
    sortable: true,
    width: '100px',
    render: (value, row) => {
      if (!value) return '—';
      const pct = row.trendPercentage;
      const direction = resolveTrend(value);
      const color = direction === 'up' ? 'text-living-green-600' : direction === 'down' ? 'text-red-600' : 'text-gray-400';
      const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
      const pctStr = typeof pct === 'number' ? `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%` : '';
      return (
        <span className={`text-xs font-medium ${color}`}>
          {arrow} {pctStr}
        </span>
      );
    },
  },
  {
    key: 'weight',
    label: 'Weight',
    sortable: true,
    align: 'right',
    width: '70px',
    render: (value) => {
      if (value === null || value === undefined || value === 0) return '—';
      return (typeof value === 'number' ? (value * 100).toFixed(0) + '%' : String(value));
    },
  },
];

/**
 * Columns definition for the critical alerts table.
 * @type {Array<object>}
 */
const ALERTS_TABLE_COLUMNS = [
  {
    key: 'severity',
    label: 'Severity',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'message',
    label: 'Alert',
    sortable: false,
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '140px',
    render: (value) => {
      if (!value) return '—';
      return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
  },
];

/**
 * Executive Dashboard page component.
 *
 * @returns {React.ReactElement} The rendered ExecutiveDashboard page.
 */
export default function ExecutiveDashboard() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [qualityTrends, setQualityTrends] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWeightsConfig, setShowWeightsConfig] = useState(false);
  const [weights, setWeights] = useState({});

  const userSegment = user ? user.segment : undefined;
  const canConfigure = canPerform('configure', 'metrics');

  const segmentOptions = useMemo(() => {
    try {
      const segments = getAppDistinctSegments();
      return segments.map((s) => ({ value: s, label: s }));
    } catch (_err) {
      return [];
    }
  }, []);

  const applicationOptions = useMemo(() => {
    try {
      const apps = getReleaseDistinctApplications();
      return apps.map((a) => ({ value: a, label: a }));
    } catch (_err) {
      return [];
    }
  }, []);

  /**
   * Load dashboard data from analyticsService.
   */
  const loadDashboardData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const filters = {};
      if (filterValues.segment) filters.segment = filterValues.segment;
      if (filterValues.application) filters.application = filterValues.application;
      if (filterValues.dateRange) filters.dateRange = filterValues.dateRange;

      const dashboard = renderDashboard(filters, role, userSegment, userId);
      setDashboardData(dashboard);

      const filterOpts = {};
      if (filterValues.status) filterOpts.status = filterValues.status;
      if (filterValues.trend) filterOpts.trend = filterValues.trend;
      if (filterValues.grade) filterOpts.grade = filterValues.grade;

      let metrics = displayMetrics(role, userSegment);

      if (searchValue && searchValue.trim() !== '') {
        metrics = searchAnalyticsMetrics(searchValue, role, userSegment);
      }

      if (filterOpts.status) {
        metrics = metrics.filter((m) => m.status === filterOpts.status);
      }
      if (filterOpts.trend) {
        metrics = metrics.filter((m) => m.trend === filterOpts.trend);
      }
      if (filterOpts.grade) {
        metrics = metrics.filter((m) => m.grade === filterOpts.grade);
      }

      setMetricsData(metrics);

      const trends = getQualityTrendsData(role, userSegment);
      setQualityTrends(trends);

      const currentWeights = getMetricWeights(role);
      if (currentWeights) {
        setWeights(currentWeights);
      }
    } catch (err) {
      console.error('[ExecutiveDashboard] Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment, userId, filterValues, searchValue]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, dataVersion]);

  /**
   * Handle filter change.
   * @param {string} filterKey - The filter key.
   * @param {string} value - The filter value.
   */
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  /**
   * Handle search change.
   * @param {string} value - The search value.
   */
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  /**
   * Handle clear all filters.
   */
  const handleClearAll = useCallback(() => {
    setFilterValues({});
    setSearchValue('');
  }, []);

  /**
   * Handle weight reset.
   */
  const handleResetWeights = useCallback(() => {
    if (!canConfigure) return;
    const defaults = resetMetricWeights(userId, role);
    if (defaults) {
      setWeights(defaults);
      loadDashboardData();
    }
  }, [canConfigure, userId, role, loadDashboardData]);

  /**
   * Toggle weights configuration panel.
   */
  const handleToggleWeightsConfig = useCallback(() => {
    setShowWeightsConfig((prev) => !prev);
  }, []);

  const eqs = dashboardData ? dashboardData.enterpriseQualityScore : null;
  const rrs = dashboardData ? dashboardData.releaseReadiness : null;
  const testPassRate = dashboardData ? dashboardData.testPassRate : null;
  const automationCoverage = dashboardData ? dashboardData.automationCoverage : null;
  const defectDensity = dashboardData ? dashboardData.defectDensity : null;
  const escapedDefectRate = dashboardData ? dashboardData.escapedDefectRate : null;
  const qualityGateCompliance = dashboardData ? dashboardData.qualityGateCompliance : null;
  const governanceCompliance = dashboardData ? dashboardData.governanceCompliance : null;
  const criticalAlerts = dashboardData ? dashboardData.criticalAlerts : [];
  const recentActivity = dashboardData ? dashboardData.recentActivity : [];

  const eqsHistorical = useMemo(() => {
    if (!qualityTrends || !qualityTrends.enterpriseQualityScore || !qualityTrends.enterpriseQualityScore.historicalData) {
      return [];
    }
    return qualityTrends.enterpriseQualityScore.historicalData.map((d) => d.value);
  }, [qualityTrends]);

  const defectTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.defectTrends || !qualityTrends.defectTrends.monthlyDefects) {
      return [];
    }
    return qualityTrends.defectTrends.monthlyDefects.map((d) => ({
      label: d.period,
      value: d.total,
    }));
  }, [qualityTrends]);

  const releaseTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.releaseTrends || !qualityTrends.releaseTrends.quarterlyReleases) {
      return [];
    }
    return qualityTrends.releaseTrends.quarterlyReleases.map((d) => ({
      label: d.period,
      value: d.avgScore,
    }));
  }, [qualityTrends]);

  const governanceTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.governanceTrends || !qualityTrends.governanceTrends.quarterlyCompliance) {
      return [];
    }
    return qualityTrends.governanceTrends.quarterlyCompliance.map((d) => ({
      label: d.period,
      value: d.rate,
    }));
  }, [qualityTrends]);

  const segmentBreakdownData = useMemo(() => {
    if (!eqs || !eqs.segmentBreakdown) return [];
    const keys = Object.keys(eqs.segmentBreakdown);
    return keys.map((key) => {
      const seg = eqs.segmentBreakdown[key];
      return {
        label: key,
        value: typeof seg === 'object' ? (seg.value || 0) : (typeof seg === 'number' ? seg : 0),
      };
    });
  }, [eqs]);

  const riskLevelOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const qualityStatusOptions = [
    { value: 'healthy', label: 'Healthy' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'critical', label: 'Critical' },
  ];

  const customFilters = useMemo(() => {
    return [
      {
        key: 'status',
        label: 'Metric Status',
        options: [
          { value: 'healthy', label: 'Healthy' },
          { value: 'at_risk', label: 'At Risk' },
        ],
      },
      {
        key: 'trend',
        label: 'Trend',
        options: [
          { value: 'improving', label: 'Improving' },
          { value: 'stable', label: 'Stable' },
          { value: 'declining', label: 'Declining' },
        ],
      },
      {
        key: 'grade',
        label: 'Grade',
        options: [
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
          { value: 'D', label: 'D' },
          { value: 'F', label: 'F' },
        ],
      },
    ];
  }, []);

  if (isLoading && !dashboardData) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-1">
          <svg
            className="animate-spin h-5 w-5 text-deep-forest-teal"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm text-gray-500 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="executive-dashboard">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Enterprise quality intelligence overview
          </p>
        </div>
        <div className="flex items-center gap-1">
          {canConfigure && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleWeightsConfig}
              ariaLabel={showWeightsConfig ? 'Hide weight configuration' : 'Configure metric weights'}
            >
              {showWeightsConfig ? 'Hide Weights' : 'Configure Weights'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search metrics..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showDateRangeFilter={true}
        showRiskLevelFilter={true}
        riskLevelOptions={riskLevelOptions}
        showQualityStatusFilter={true}
        qualityStatusOptions={qualityStatusOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="dashboard-filter-bar"
      />

      {/* Weights Configuration Panel */}
      {showWeightsConfig && canConfigure && (
        <Card variant="tinted" padding="md">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-deep-forest-teal-800">Metric Weight Configuration</h3>
              <Button variant="ghost" size="sm" onClick={handleResetWeights} ariaLabel="Reset weights to defaults">
                Reset to Defaults
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1">
              {Object.keys(weights).map((key) => {
                const weightValue = weights[key];
                const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="flex flex-col gap-0.5">
                    <label className="text-[10px] text-gray-600 font-medium truncate" title={label}>
                      {label}
                    </label>
                    <div className="flex items-center gap-0.5">
                      <ProgressBar
                        value={typeof weightValue === 'number' ? weightValue * 100 : 0}
                        max={100}
                        size="xs"
                        variant="accent"
                        showValue={false}
                        className="flex-1"
                      />
                      <span className="text-[10px] text-gray-500 font-medium w-[28px] text-right">
                        {typeof weightValue === 'number' ? (weightValue * 100).toFixed(0) + '%' : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {/* Enterprise Quality Score */}
        <MetricCard
          label="Enterprise Quality Score"
          value={eqs ? eqs.value : '—'}
          unit=""
          trend={eqs ? resolveTrend(eqs.trend) : undefined}
          trendPercentage={eqs ? eqs.trendPercentage : undefined}
          trendLabel={eqs && eqs.trend ? eqs.trend : undefined}
          grade={eqs ? eqs.grade : undefined}
          target={eqs ? eqs.target : undefined}
          sparklineData={eqsHistorical.length >= 2 ? eqsHistorical : undefined}
          variant="highlighted"
          size="lg"
          testId="metric-eqs"
        />

        {/* Release Readiness Score */}
        <MetricCard
          label="Release Readiness"
          value={rrs ? rrs.value : '—'}
          unit=""
          trend={rrs ? resolveTrend(rrs.trend) : undefined}
          trendPercentage={rrs ? rrs.trendPercentage : undefined}
          status={rrs ? rrs.status : undefined}
          target={rrs ? rrs.target : undefined}
          variant="base"
          size="md"
          testId="metric-rrs"
        />

        {/* Test Pass Rate */}
        <MetricCard
          label="Test Pass Rate"
          value={testPassRate ? testPassRate.value : '—'}
          unit="%"
          trend={testPassRate ? resolveTrend(testPassRate.trend) : undefined}
          trendPercentage={testPassRate ? testPassRate.trendPercentage : undefined}
          target={testPassRate ? testPassRate.target : undefined}
          variant="base"
          size="md"
          testId="metric-pass-rate"
        />

        {/* Automation Coverage */}
        <MetricCard
          label="Automation Coverage"
          value={automationCoverage ? automationCoverage.value : '—'}
          unit="%"
          trend={automationCoverage ? resolveTrend(automationCoverage.trend) : undefined}
          trendPercentage={automationCoverage ? automationCoverage.trendPercentage : undefined}
          status={automationCoverage ? automationCoverage.status : undefined}
          target={automationCoverage ? automationCoverage.target : undefined}
          variant="base"
          size="md"
          testId="metric-automation"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {/* Defect Density */}
        <MetricCard
          label="Defect Density"
          value={defectDensity ? defectDensity.value : '—'}
          unit="defects/KLOC"
          trend={defectDensity ? resolveTrend(defectDensity.trend) : undefined}
          trendPercentage={defectDensity ? defectDensity.trendPercentage : undefined}
          target={defectDensity ? defectDensity.target : undefined}
          variant="compact"
          size="sm"
          testId="metric-defect-density"
        />

        {/* Escaped Defect Rate */}
        <MetricCard
          label="Escaped Defect Rate"
          value={escapedDefectRate ? escapedDefectRate.value : '—'}
          unit="%"
          trend={escapedDefectRate ? resolveTrend(escapedDefectRate.trend) : undefined}
          trendPercentage={escapedDefectRate ? escapedDefectRate.trendPercentage : undefined}
          status={escapedDefectRate ? escapedDefectRate.status : undefined}
          target={escapedDefectRate ? escapedDefectRate.target : undefined}
          variant="compact"
          size="sm"
          testId="metric-escaped-defect"
        />

        {/* Quality Gate Compliance */}
        <MetricCard
          label="Quality Gate Compliance"
          value={qualityGateCompliance ? qualityGateCompliance.value : '—'}
          unit="%"
          trend={qualityGateCompliance ? resolveTrend(qualityGateCompliance.trend) : undefined}
          trendPercentage={qualityGateCompliance ? qualityGateCompliance.trendPercentage : undefined}
          status={qualityGateCompliance ? qualityGateCompliance.status : undefined}
          target={qualityGateCompliance ? qualityGateCompliance.target : undefined}
          variant="compact"
          size="sm"
          testId="metric-gate-compliance"
        />

        {/* Governance Compliance */}
        <MetricCard
          label="Governance Compliance"
          value={governanceCompliance ? governanceCompliance.value : '—'}
          unit="%"
          trend={governanceCompliance ? resolveTrend(governanceCompliance.trend) : undefined}
          trendPercentage={governanceCompliance ? governanceCompliance.trendPercentage : undefined}
          target={governanceCompliance ? governanceCompliance.target : undefined}
          variant="compact"
          size="sm"
          testId="metric-governance"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1">
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Applications</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalApplications : 0}</p>
          </div>
        </Card>
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Releases</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalReleases : 0}</p>
          </div>
        </Card>
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Demands</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalDemands : 0}</p>
          </div>
        </Card>
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Test Cases</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalTestCases : 0}</p>
          </div>
        </Card>
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Integrations</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalIntegrations : 0}</p>
          </div>
        </Card>
        <Card variant="base" padding="sm">
          <div className="text-center">
            <p className="text-[10px] text-gray-500 font-medium">Environments</p>
            <p className="text-lg font-bold text-deep-forest-teal-800">{dashboardData ? dashboardData.totalEnvironments : 0}</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {/* Quality Score Trend */}
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="line"
            data={qualityTrends && qualityTrends.enterpriseQualityScore && qualityTrends.enterpriseQualityScore.historicalData
              ? qualityTrends.enterpriseQualityScore.historicalData.map((d) => ({
                  label: d.period,
                  value: d.value,
                }))
              : []
            }
            title="Enterprise Quality Score Trend"
            description="12-month quality score progression"
            size="md"
            showValues={false}
            showLabels={true}
            showArea={true}
            colors={['#024E38']}
            testId="chart-eqs-trend"
          />
        </Card>

        {/* Defect Trends */}
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={defectTrendData}
            title="Monthly Defect Trends"
            description="Total defects per month"
            size="md"
            showValues={false}
            showLabels={true}
            colors={['#DC2626']}
            testId="chart-defect-trend"
          />
        </Card>

        {/* Segment Quality Breakdown */}
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={segmentBreakdownData}
            title="Quality by Segment"
            description="Quality score per business segment"
            size="md"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B', '#DC2626', '#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#F97316']}
            testId="chart-segment-breakdown"
          />
        </Card>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {/* Release Quality Trend */}
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="line"
            data={releaseTrendData}
            title="Release Quality Trend"
            description="Average quality score per quarter"
            size="md"
            showValues={true}
            showLabels={true}
            showDots={true}
            colors={['#78BE20']}
            testId="chart-release-trend"
          />
        </Card>

        {/* Governance Compliance Trend */}
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="line"
            data={governanceTrendData}
            title="Governance Compliance Trend"
            description="Compliance rate per quarter"
            size="md"
            showValues={true}
            showLabels={true}
            showArea={true}
            colors={['#3B82F6']}
            testId="chart-governance-trend"
          />
        </Card>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-1">Critical Alerts</h2>
          <DataTable
            columns={ALERTS_TABLE_COLUMNS}
            data={criticalAlerts}
            rowKey="id"
            paginated={false}
            striped={true}
            hoverable={true}
            compact={true}
            emptyTitle="No critical alerts"
            emptyMessage="There are no critical alerts at this time."
            ariaLabel="Critical alerts table"
            testId="alerts-table"
          />
        </div>
      )}

      {/* All Metrics Table */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-1">All Quality Metrics</h2>
        <DataTable
          columns={METRICS_TABLE_COLUMNS}
          data={metricsData}
          rowKey="id"
          paginated={true}
          pageSize={25}
          striped={true}
          hoverable={true}
          compact={false}
          searchable={false}
          loading={isLoading}
          emptyTitle="No metrics found"
          emptyMessage="No metrics match the current filters. Try adjusting your search or filter criteria."
          ariaLabel="Quality metrics table"
          testId="metrics-table"
        />
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card variant="base" padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Recent Activity</h3>
          <div className="space-y-0.5">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id || index}
                className="flex items-start gap-1 py-0.5 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-tight">
                    {activity.action || '—'}
                  </p>
                  {activity.timestamp && (
                    <p className="text-[10px] text-gray-400 leading-tight mt-[1px]">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>
                {activity.entityType && (
                  <Badge status={activity.entityType.replace(/-/g, '_')} size="sm" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Last Updated */}
      {dashboardData && dashboardData.lastUpdated && (
        <div className="text-right">
          <span className="text-[10px] text-gray-400">
            Last updated: {new Date(dashboardData.lastUpdated).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        </div>
      )}
    </div>
  );
}