import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRBAC } from '../contexts/RBACContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import FilterBar from '../components/common/FilterBar.jsx';
import ChartPlaceholder from '../components/common/ChartPlaceholder.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Tabs from '../components/common/Tabs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  getAdoptionMetricsData,
  getQualityTrendsData,
  getAnalyticsSummary,
  displayMetrics,
  getMetricDetail,
  getMetricHistory,
  getMetricBySegment,
  getMetricByApplication,
  getAtRiskMetricsData,
  getImprovingMetricsData,
  getDecliningMetricsData,
  getMetricStatusCounts,
  getMetricGradeCounts,
  getMetricTrendCounts,
} from '../services/analyticsService.js';
import {
  getDistinctSegments as getAppDistinctSegments,
} from '../data/applications.js';
import {
  getDistinctApplications as getReleaseDistinctApplications,
} from '../data/releases.js';

/**
 * @module AdoptionImpact
 * Adoption and Impact Dashboard page for eQIP Quality Intelligence.
 *
 * Displays all specified adoption and impact metrics and trends including:
 * - User adoption metrics (active users, session duration, daily active users)
 * - Feature usage breakdown
 * - Role distribution
 * - Export activity
 * - AI insights usage
 * - Quality impact trends (Enterprise Quality Score, defect trends, release trends, governance trends)
 * - Metric status, grade, and trend distribution
 * - At-risk, improving, and declining metrics
 *
 * Uses MetricCard, ChartPlaceholder, Card, FilterBar, Tabs, ProgressBar, Badge.
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
 * Helper to format a date string for display.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (_err) {
    return '—';
  }
}

/**
 * Adoption and Impact Dashboard page component.
 *
 * @returns {React.ReactElement} The rendered AdoptionImpact page.
 */
export default function AdoptionImpact() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [activeTab, setActiveTab] = useState('adoption');
  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [adoptionMetrics, setAdoptionMetrics] = useState(null);
  const [qualityTrends, setQualityTrends] = useState(null);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [metricsData, setMetricsData] = useState([]);
  const [atRiskMetrics, setAtRiskMetrics] = useState([]);
  const [improvingMetrics, setImprovingMetrics] = useState([]);
  const [decliningMetrics, setDecliningMetrics] = useState([]);

  const userSegment = user ? user.segment : undefined;

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
   * Load all dashboard data from analyticsService.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const adoption = getAdoptionMetricsData(role);
      setAdoptionMetrics(adoption);

      const trends = getQualityTrendsData(role, userSegment);
      setQualityTrends(trends);

      const summary = getAnalyticsSummary(role, userSegment);
      setAnalyticsSummary(summary);

      const metrics = displayMetrics(role, userSegment);
      setMetricsData(metrics);

      const atRisk = getAtRiskMetricsData(role, userSegment);
      setAtRiskMetrics(atRisk);

      const improving = getImprovingMetricsData(role, userSegment);
      setImprovingMetrics(improving);

      const declining = getDecliningMetricsData(role, userSegment);
      setDecliningMetrics(declining);
    } catch (err) {
      console.error('[AdoptionImpact] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Handle filter change.
   */
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  /**
   * Handle search change.
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
   * Daily active users chart data.
   */
  const dailyActiveUsersData = useMemo(() => {
    if (!adoptionMetrics || !Array.isArray(adoptionMetrics.dailyActiveUsers)) return [];
    return adoptionMetrics.dailyActiveUsers.map((d) => ({
      label: d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
      value: d.count || 0,
    }));
  }, [adoptionMetrics]);

  /**
   * Feature usage chart data.
   */
  const featureUsageData = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.featureUsage) return [];
    const usage = adoptionMetrics.featureUsage;
    return Object.keys(usage).map((key) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      value: usage[key].views || 0,
    })).sort((a, b) => b.value - a.value);
  }, [adoptionMetrics]);

  /**
   * Feature unique users chart data.
   */
  const featureUniqueUsersData = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.featureUsage) return [];
    const usage = adoptionMetrics.featureUsage;
    return Object.keys(usage).map((key) => ({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      value: usage[key].uniqueUsers || 0,
    })).sort((a, b) => b.value - a.value);
  }, [adoptionMetrics]);

  /**
   * Role distribution chart data.
   */
  const roleDistributionData = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.roleDistribution) return [];
    const dist = adoptionMetrics.roleDistribution;
    return Object.keys(dist).map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: dist[key] || 0,
    })).sort((a, b) => b.value - a.value);
  }, [adoptionMetrics]);

  /**
   * Export format distribution chart data.
   */
  const exportFormatData = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.exportActivity) return [];
    const activity = adoptionMetrics.exportActivity;
    return [
      { label: 'CSV', value: activity.csvExports || 0 },
      { label: 'Excel', value: activity.excelExports || 0 },
      { label: 'PDF', value: activity.pdfExports || 0 },
      { label: 'PowerPoint', value: activity.powerpointExports || 0 },
    ].filter((d) => d.value > 0);
  }, [adoptionMetrics]);

  /**
   * AI insights usage chart data.
   */
  const aiInsightsUsageData = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.aiInsightsUsage) return [];
    const ai = adoptionMetrics.aiInsightsUsage;
    return [
      { label: 'Risk Predictions', value: ai.riskPredictions || 0 },
      { label: 'Recommendations', value: ai.recommendations || 0 },
      { label: 'NL Searches', value: ai.naturalLanguageSearches || 0 },
      { label: 'Ask EQIP', value: ai.askEqipQueries || 0 },
    ].filter((d) => d.value > 0);
  }, [adoptionMetrics]);

  /**
   * Enterprise Quality Score trend data.
   */
  const eqsTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.enterpriseQualityScore || !qualityTrends.enterpriseQualityScore.historicalData) return [];
    return qualityTrends.enterpriseQualityScore.historicalData.map((d) => ({
      label: d.period || '',
      value: d.value || 0,
    }));
  }, [qualityTrends]);

  /**
   * Enterprise Quality Score sparkline data.
   */
  const eqsSparklineData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.enterpriseQualityScore || !qualityTrends.enterpriseQualityScore.historicalData) return [];
    return qualityTrends.enterpriseQualityScore.historicalData.map((d) => d.value);
  }, [qualityTrends]);

  /**
   * Defect trend data.
   */
  const defectTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.defectTrends || !qualityTrends.defectTrends.monthlyDefects) return [];
    return qualityTrends.defectTrends.monthlyDefects.map((d) => ({
      label: d.period || '',
      value: d.total || 0,
    }));
  }, [qualityTrends]);

  /**
   * Defect severity trend data.
   */
  const defectSeverityTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.defectTrends || !qualityTrends.defectTrends.monthlyDefects) return [];
    const monthly = qualityTrends.defectTrends.monthlyDefects;
    if (monthly.length === 0) return [];
    const latest = monthly[monthly.length - 1];
    return [
      { label: 'Critical', value: latest.critical || 0 },
      { label: 'High', value: latest.high || 0 },
      { label: 'Medium', value: latest.medium || 0 },
      { label: 'Low', value: latest.low || 0 },
    ].filter((d) => d.value > 0);
  }, [qualityTrends]);

  /**
   * Release quality trend data.
   */
  const releaseTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.releaseTrends || !qualityTrends.releaseTrends.quarterlyReleases) return [];
    return qualityTrends.releaseTrends.quarterlyReleases.map((d) => ({
      label: d.period || '',
      value: d.avgScore || 0,
    }));
  }, [qualityTrends]);

  /**
   * Governance compliance trend data.
   */
  const governanceTrendData = useMemo(() => {
    if (!qualityTrends || !qualityTrends.governanceTrends || !qualityTrends.governanceTrends.quarterlyCompliance) return [];
    return qualityTrends.governanceTrends.quarterlyCompliance.map((d) => ({
      label: d.period || '',
      value: d.rate || 0,
    }));
  }, [qualityTrends]);

  /**
   * Metric status distribution chart data.
   */
  const metricStatusData = useMemo(() => {
    if (!analyticsSummary || !analyticsSummary.statusCounts) return [];
    const counts = analyticsSummary.statusCounts;
    return Object.keys(counts).map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[key],
    })).filter((d) => d.value > 0);
  }, [analyticsSummary]);

  /**
   * Metric grade distribution chart data.
   */
  const metricGradeData = useMemo(() => {
    if (!analyticsSummary || !analyticsSummary.gradeCounts) return [];
    const counts = analyticsSummary.gradeCounts;
    return Object.keys(counts).sort().map((key) => ({
      label: `Grade ${key}`,
      value: counts[key],
    })).filter((d) => d.value > 0);
  }, [analyticsSummary]);

  /**
   * Metric trend distribution chart data.
   */
  const metricTrendDistData = useMemo(() => {
    if (!analyticsSummary || !analyticsSummary.trendCounts) return [];
    const counts = analyticsSummary.trendCounts;
    return Object.keys(counts).map((key) => ({
      label: key.replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[key],
    })).filter((d) => d.value > 0);
  }, [analyticsSummary]);

  /**
   * Feature usage trend indicators.
   */
  const featureUsageTrends = useMemo(() => {
    if (!adoptionMetrics || !adoptionMetrics.featureUsage) return {};
    const usage = adoptionMetrics.featureUsage;
    const trends = {};
    const keys = Object.keys(usage);
    for (let i = 0; i < keys.length; i++) {
      trends[keys[i]] = usage[keys[i]].trend || 'stable';
    }
    return trends;
  }, [adoptionMetrics]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    return [
      { key: 'adoption', label: 'User Adoption' },
      { key: 'feature-usage', label: 'Feature Usage' },
      { key: 'quality-impact', label: 'Quality Impact' },
      { key: 'ai-insights', label: 'AI Insights Usage' },
      { key: 'metric-health', label: 'Metric Health' },
    ];
  }, []);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'dateRange',
        label: 'Date Range',
        options: [
          { value: 'last7', label: 'Last 7 Days' },
          { value: 'last30', label: 'Last 30 Days' },
          { value: 'last90', label: 'Last 90 Days' },
          { value: 'thisMonth', label: 'This Month' },
          { value: 'thisQuarter', label: 'This Quarter' },
          { value: 'thisYear', label: 'This Year' },
        ],
      },
    ];
  }, []);

  if (isLoading && !adoptionMetrics) {
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
          <span className="text-sm text-gray-500 font-medium">Loading adoption & impact dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="adoption-impact">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Adoption & Impact</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Platform adoption metrics, feature usage, quality impact trends, and AI insights usage
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={false}
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="adoption-impact-filter-bar"
      />

      {/* Top-Level Summary Metrics */}
      {adoptionMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <MetricCard
            label="Total Users"
            value={adoptionMetrics.totalUsers || 0}
            variant="compact"
            size="sm"
            testId="metric-total-users"
          />
          <MetricCard
            label="Active Users"
            value={adoptionMetrics.activeUsers || 0}
            status="active"
            variant="compact"
            size="sm"
            testId="metric-active-users"
          />
          <MetricCard
            label="Active Rate"
            value={adoptionMetrics.activeUsersPercentage || 0}
            unit="%"
            variant="compact"
            size="sm"
            testId="metric-active-rate"
          />
          <MetricCard
            label="Avg Session"
            value={adoptionMetrics.averageSessionDuration || 0}
            unit={adoptionMetrics.averageSessionDurationUnit || 'minutes'}
            variant="compact"
            size="sm"
            testId="metric-avg-session"
          />
          <MetricCard
            label="Total Exports"
            value={adoptionMetrics.exportActivity ? adoptionMetrics.exportActivity.totalExports || 0 : 0}
            variant="compact"
            size="sm"
            testId="metric-total-exports"
          />
          <MetricCard
            label="AI Queries"
            value={adoptionMetrics.aiInsightsUsage ? adoptionMetrics.aiInsightsUsage.totalQueries || 0 : 0}
            variant="compact"
            size="sm"
            testId="metric-ai-queries"
          />
        </div>
      )}

      {/* Quality Impact Summary */}
      {qualityTrends && qualityTrends.enterpriseQualityScore && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <MetricCard
            label="Enterprise Quality Score"
            value={qualityTrends.enterpriseQualityScore.current || 0}
            grade={qualityTrends.enterpriseQualityScore.grade || undefined}
            trend={resolveTrend(qualityTrends.enterpriseQualityScore.trend)}
            trendPercentage={qualityTrends.enterpriseQualityScore.changePercentage || undefined}
            target={qualityTrends.enterpriseQualityScore.target || undefined}
            sparklineData={eqsSparklineData.length >= 2 ? eqsSparklineData : undefined}
            variant="compact"
            size="sm"
            testId="metric-eqs"
          />
          {qualityTrends.defectTrends && (
            <>
              <MetricCard
                label="Total Defects"
                value={qualityTrends.defectTrends.totalDefects ? qualityTrends.defectTrends.totalDefects.current || 0 : 0}
                trend={qualityTrends.defectTrends.totalDefects ? resolveTrend(qualityTrends.defectTrends.totalDefects.trend) : undefined}
                trendPercentage={qualityTrends.defectTrends.totalDefects ? qualityTrends.defectTrends.totalDefects.changePercentage || undefined : undefined}
                variant="compact"
                size="sm"
                testId="metric-total-defects"
              />
              <MetricCard
                label="Critical Defects"
                value={qualityTrends.defectTrends.criticalDefects ? qualityTrends.defectTrends.criticalDefects.current || 0 : 0}
                status={qualityTrends.defectTrends.criticalDefects && qualityTrends.defectTrends.criticalDefects.current > 0 ? 'critical' : 'healthy'}
                trend={qualityTrends.defectTrends.criticalDefects ? resolveTrend(qualityTrends.defectTrends.criticalDefects.trend) : undefined}
                variant="compact"
                size="sm"
                testId="metric-critical-defects"
              />
              <MetricCard
                label="Open Defects"
                value={qualityTrends.defectTrends.openDefects ? qualityTrends.defectTrends.openDefects.current || 0 : 0}
                status={qualityTrends.defectTrends.openDefects && qualityTrends.defectTrends.openDefects.current > 0 ? 'warning' : 'healthy'}
                trend={qualityTrends.defectTrends.openDefects ? resolveTrend(qualityTrends.defectTrends.openDefects.trend) : undefined}
                variant="compact"
                size="sm"
                testId="metric-open-defects"
              />
            </>
          )}
          {qualityTrends.releaseTrends && (
            <>
              <MetricCard
                label="Total Releases"
                value={qualityTrends.releaseTrends.totalReleases || 0}
                variant="compact"
                size="sm"
                testId="metric-total-releases"
              />
              <MetricCard
                label="On-Time Delivery"
                value={qualityTrends.releaseTrends.onTimeDeliveryRate || 0}
                unit="%"
                variant="compact"
                size="sm"
                testId="metric-on-time-delivery"
              />
            </>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="underline"
        size="md"
        testId="adoption-impact-tabs"
      />

      {/* User Adoption Tab */}
      {activeTab === 'adoption' && adoptionMetrics && (
        <div className="space-y-2">
          {/* Adoption Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            <MetricCard
              label="Total Users"
              value={adoptionMetrics.totalUsers || 0}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Active Users"
              value={adoptionMetrics.activeUsers || 0}
              status="active"
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Active Rate"
              value={adoptionMetrics.activeUsersPercentage || 0}
              unit="%"
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Avg Session Duration"
              value={adoptionMetrics.averageSessionDuration || 0}
              unit={adoptionMetrics.averageSessionDurationUnit || 'minutes'}
              variant="compact"
              size="sm"
            />
          </div>

          {/* Adoption Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">User Adoption Progress</h3>
            <ProgressBar
              value={adoptionMetrics.activeUsersPercentage || 0}
              max={100}
              size="md"
              variant="auto"
              showValue={true}
              label="Active User Rate"
              unit="%"
              thresholds={{ error: 50, warning: 75, success: 100 }}
              testId="adoption-progress-bar"
            />
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {/* Daily Active Users */}
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="line"
                data={dailyActiveUsersData}
                title="Daily Active Users"
                description="Active users per day over the last 7 days"
                size="md"
                showValues={true}
                showLabels={true}
                showDots={true}
                showArea={true}
                colors={['#024E38']}
                testId="chart-daily-active-users"
              />
            </Card>

            {/* Role Distribution */}
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={roleDistributionData}
                title="Role Distribution"
                description="Users by RBAC role"
                size="md"
                showValues={true}
                showLabels={true}
                testId="chart-role-distribution"
              />
            </Card>
          </div>

          {/* Role Breakdown Detail */}
          {adoptionMetrics.roleDistribution && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Role Breakdown</h3>
              <div className="space-y-0.5">
                {Object.keys(adoptionMetrics.roleDistribution).map((roleKey) => {
                  const count = adoptionMetrics.roleDistribution[roleKey] || 0;
                  const total = adoptionMetrics.totalUsers || 1;
                  const percentage = Math.round((count / total) * 10000) / 100;
                  return (
                    <div
                      key={roleKey}
                      className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {roleKey.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-gray-600">{count} user{count !== 1 ? 's' : ''}</span>
                        <span className="text-[10px] text-gray-400">({percentage}%)</span>
                        <div className="w-[60px]">
                          <ProgressBar
                            value={percentage}
                            max={100}
                            size="xs"
                            variant="accent"
                            showValue={false}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Export Activity */}
          {adoptionMetrics.exportActivity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Export Activity</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  <MetricCard
                    label="Total Exports"
                    value={adoptionMetrics.exportActivity.totalExports || 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="CSV Exports"
                    value={adoptionMetrics.exportActivity.csvExports || 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Excel Exports"
                    value={adoptionMetrics.exportActivity.excelExports || 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="PDF Exports"
                    value={adoptionMetrics.exportActivity.pdfExports || 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="PowerPoint Exports"
                    value={adoptionMetrics.exportActivity.powerpointExports || 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Last Export"
                    value={formatDate(adoptionMetrics.exportActivity.lastExportDate)}
                    variant="compact"
                    size="sm"
                  />
                </div>
              </Card>

              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={exportFormatData}
                  title="Export Format Distribution"
                  description="Exports by format type"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B']}
                  testId="chart-export-format"
                />
              </Card>
            </div>
          )}

          {/* Last Updated */}
          {adoptionMetrics.lastUpdated && (
            <div className="text-right">
              <span className="text-[10px] text-gray-400">
                Last updated: {formatDate(adoptionMetrics.lastUpdated)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Feature Usage Tab */}
      {activeTab === 'feature-usage' && adoptionMetrics && adoptionMetrics.featureUsage && (
        <div className="space-y-2">
          {/* Feature Usage Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="horizontal-bar"
                data={featureUsageData}
                title="Feature Views"
                description="Total page views per feature"
                size="md"
                showValues={true}
                showLabels={true}
                colors={['#024E38']}
                testId="chart-feature-views"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="horizontal-bar"
                data={featureUniqueUsersData}
                title="Feature Unique Users"
                description="Unique users per feature"
                size="md"
                showValues={true}
                showLabels={true}
                colors={['#78BE20']}
                testId="chart-feature-unique-users"
              />
            </Card>
          </div>

          {/* Feature Usage Detail */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Feature Usage Detail</h3>
            <div className="space-y-0.5">
              {Object.keys(adoptionMetrics.featureUsage).map((featureKey) => {
                const feature = adoptionMetrics.featureUsage[featureKey];
                const trend = feature.trend || 'stable';
                return (
                  <div
                    key={featureKey}
                    className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                  >
                    <div className="flex items-center gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-gray-800">
                        {featureKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                      </span>
                      <Badge
                        status={trend === 'improving' ? 'passed' : trend === 'stable' ? 'neutral' : 'warning'}
                        size="sm"
                      >
                        {trend}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-600">{feature.views || 0} views</span>
                      <span className="text-[10px] text-gray-400">{feature.uniqueUsers || 0} users</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Feature Adoption Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Feature Adoption Rate</h3>
            <div className="space-y-0.5">
              {Object.keys(adoptionMetrics.featureUsage).map((featureKey) => {
                const feature = adoptionMetrics.featureUsage[featureKey];
                const totalUsers = adoptionMetrics.totalUsers || 1;
                const adoptionRate = Math.round(((feature.uniqueUsers || 0) / totalUsers) * 10000) / 100;
                return (
                  <ProgressBar
                    key={featureKey}
                    value={adoptionRate}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label={featureKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    unit="%"
                    thresholds={{ error: 20, warning: 50, success: 100 }}
                  />
                );
              })}
            </div>
          </Card>

          {/* Feature Trend Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard
              label="Improving Features"
              value={Object.values(featureUsageTrends).filter((t) => t === 'improving').length}
              status="passed"
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Stable Features"
              value={Object.values(featureUsageTrends).filter((t) => t === 'stable').length}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Declining Features"
              value={Object.values(featureUsageTrends).filter((t) => t === 'declining').length}
              status={Object.values(featureUsageTrends).filter((t) => t === 'declining').length > 0 ? 'warning' : 'healthy'}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Total Features"
              value={Object.keys(adoptionMetrics.featureUsage).length}
              variant="compact"
              size="sm"
            />
          </div>
        </div>
      )}

      {/* Quality Impact Tab */}
      {activeTab === 'quality-impact' && qualityTrends && (
        <div className="space-y-2">
          {/* Quality Score Trend */}
          {qualityTrends.enterpriseQualityScore && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Current Score"
                  value={qualityTrends.enterpriseQualityScore.current || 0}
                  grade={qualityTrends.enterpriseQualityScore.grade || undefined}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Previous Score"
                  value={qualityTrends.enterpriseQualityScore.previous || 0}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Change"
                  value={qualityTrends.enterpriseQualityScore.change || 0}
                  trend={resolveTrend(qualityTrends.enterpriseQualityScore.trend)}
                  trendPercentage={qualityTrends.enterpriseQualityScore.changePercentage || undefined}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Target"
                  value={qualityTrends.enterpriseQualityScore.target || 90}
                  variant="compact"
                  size="sm"
                />
              </div>

              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="line"
                  data={eqsTrendData}
                  title="Enterprise Quality Score Trend"
                  description="Quality score progression over time"
                  size="md"
                  showValues={false}
                  showLabels={true}
                  showDots={true}
                  showArea={true}
                  colors={['#024E38']}
                  testId="chart-eqs-trend"
                />
              </Card>
            </>
          )}

          {/* Defect & Release Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {defectTrendData.length >= 2 && (
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
            )}
            {releaseTrendData.length >= 2 && (
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
            )}
          </div>

          {/* Governance & Defect Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {governanceTrendData.length >= 2 && (
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
            )}
            {defectSeverityTrendData.length > 0 && (
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="bar"
                  data={defectSeverityTrendData}
                  title="Current Defect Severity"
                  description="Defects by severity (latest month)"
                  size="md"
                  showValues={true}
                  showLabels={true}
                  colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                  testId="chart-defect-severity"
                />
              </Card>
            )}
          </div>

          {/* Release Trends Summary */}
          {qualityTrends.releaseTrends && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Release Impact Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                <MetricCard
                  label="Total Releases"
                  value={qualityTrends.releaseTrends.totalReleases || 0}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Ready"
                  value={qualityTrends.releaseTrends.readyReleases || 0}
                  status="passed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="At Risk"
                  value={qualityTrends.releaseTrends.atRiskReleases || 0}
                  status={qualityTrends.releaseTrends.atRiskReleases > 0 ? 'at_risk' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Avg Readiness"
                  value={qualityTrends.releaseTrends.averageReadinessScore || 0}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="On-Time Rate"
                  value={qualityTrends.releaseTrends.onTimeDeliveryRate || 0}
                  unit="%"
                  variant="compact"
                  size="sm"
                />
              </div>
            </Card>
          )}

          {/* Governance Trends Summary */}
          {qualityTrends.governanceTrends && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Governance Impact Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Avg Compliance"
                  value={qualityTrends.governanceTrends.averageComplianceRate || 0}
                  unit="%"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Compliant"
                  value={qualityTrends.governanceTrends.compliantProcedures || 0}
                  status="compliant"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="At Risk"
                  value={qualityTrends.governanceTrends.atRiskProcedures || 0}
                  status={qualityTrends.governanceTrends.atRiskProcedures > 0 ? 'at_risk' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Open Findings"
                  value={qualityTrends.governanceTrends.totalOpenFindings || 0}
                  status={qualityTrends.governanceTrends.totalOpenFindings > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI Insights Usage Tab */}
      {activeTab === 'ai-insights' && adoptionMetrics && adoptionMetrics.aiInsightsUsage && (
        <div className="space-y-2">
          {/* AI Usage Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            <MetricCard
              label="Total AI Queries"
              value={adoptionMetrics.aiInsightsUsage.totalQueries || 0}
              variant="compact"
              size="sm"
              testId="metric-ai-total-queries"
            />
            <MetricCard
              label="Risk Predictions"
              value={adoptionMetrics.aiInsightsUsage.riskPredictions || 0}
              variant="compact"
              size="sm"
              testId="metric-ai-risk-predictions"
            />
            <MetricCard
              label="Recommendations"
              value={adoptionMetrics.aiInsightsUsage.recommendations || 0}
              variant="compact"
              size="sm"
              testId="metric-ai-recommendations"
            />
            <MetricCard
              label="NL Searches"
              value={adoptionMetrics.aiInsightsUsage.naturalLanguageSearches || 0}
              variant="compact"
              size="sm"
              testId="metric-ai-nl-searches"
            />
            <MetricCard
              label="Ask EQIP Queries"
              value={adoptionMetrics.aiInsightsUsage.askEqipQueries || 0}
              variant="compact"
              size="sm"
              testId="metric-ai-ask-eqip"
            />
            <MetricCard
              label="Avg Confidence"
              value={adoptionMetrics.aiInsightsUsage.averageConfidence ? Math.round(adoptionMetrics.aiInsightsUsage.averageConfidence * 100) : 0}
              unit="%"
              variant="compact"
              size="sm"
              testId="metric-ai-avg-confidence"
            />
            <MetricCard
              label="Avg Response Time"
              value={adoptionMetrics.aiInsightsUsage.averageResponseTimeMs || 0}
              unit="ms"
              variant="compact"
              size="sm"
              testId="metric-ai-avg-response"
            />
          </div>

          {/* AI Usage Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={aiInsightsUsageData}
                title="AI Query Distribution"
                description="Queries by type"
                size="md"
                showValues={true}
                showLabels={true}
                colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B']}
                testId="chart-ai-query-distribution"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={aiInsightsUsageData}
                title="AI Query Volume"
                description="Number of queries by type"
                size="md"
                showValues={true}
                showLabels={true}
                colors={['#024E38']}
                testId="chart-ai-query-volume"
              />
            </Card>
          </div>

          {/* AI Performance */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">AI Performance Metrics</h3>
            <div className="space-y-0.5">
              <ProgressBar
                value={adoptionMetrics.aiInsightsUsage.averageConfidence ? Math.round(adoptionMetrics.aiInsightsUsage.averageConfidence * 100) : 0}
                max={100}
                size="md"
                variant="auto"
                showValue={true}
                label="Average Confidence Score"
                unit="%"
                thresholds={{ error: 60, warning: 80, success: 100 }}
                testId="ai-confidence-bar"
              />
              <ProgressBar
                value={adoptionMetrics.aiInsightsUsage.averageResponseTimeMs || 0}
                max={3000}
                size="sm"
                variant="auto"
                showValue={true}
                label="Average Response Time"
                valueLabel={`${adoptionMetrics.aiInsightsUsage.averageResponseTimeMs || 0}ms`}
                invertThresholds={true}
                thresholds={{ error: 80, warning: 50, success: 100 }}
              />
            </div>
          </Card>

          {/* AI Usage Detail */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">AI Usage Breakdown</h3>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Risk Predictions</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-600">{adoptionMetrics.aiInsightsUsage.riskPredictions || 0}</span>
                  <span className="text-[10px] text-gray-400">
                    ({adoptionMetrics.aiInsightsUsage.totalQueries > 0
                      ? Math.round(((adoptionMetrics.aiInsightsUsage.riskPredictions || 0) / adoptionMetrics.aiInsightsUsage.totalQueries) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Recommendations</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-600">{adoptionMetrics.aiInsightsUsage.recommendations || 0}</span>
                  <span className="text-[10px] text-gray-400">
                    ({adoptionMetrics.aiInsightsUsage.totalQueries > 0
                      ? Math.round(((adoptionMetrics.aiInsightsUsage.recommendations || 0) / adoptionMetrics.aiInsightsUsage.totalQueries) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Natural Language Searches</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-600">{adoptionMetrics.aiInsightsUsage.naturalLanguageSearches || 0}</span>
                  <span className="text-[10px] text-gray-400">
                    ({adoptionMetrics.aiInsightsUsage.totalQueries > 0
                      ? Math.round(((adoptionMetrics.aiInsightsUsage.naturalLanguageSearches || 0) / adoptionMetrics.aiInsightsUsage.totalQueries) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Ask EQIP Queries</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-600">{adoptionMetrics.aiInsightsUsage.askEqipQueries || 0}</span>
                  <span className="text-[10px] text-gray-400">
                    ({adoptionMetrics.aiInsightsUsage.totalQueries > 0
                      ? Math.round(((adoptionMetrics.aiInsightsUsage.askEqipQueries || 0) / adoptionMetrics.aiInsightsUsage.totalQueries) * 100)
                      : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Metric Health Tab */}
      {activeTab === 'metric-health' && analyticsSummary && (
        <div className="space-y-2">
          {/* Metric Health Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            <MetricCard
              label="Total Metrics"
              value={analyticsSummary.totalMetrics || 0}
              variant="compact"
              size="sm"
              testId="metric-total-metrics"
            />
            <MetricCard
              label="Healthy"
              value={analyticsSummary.statusCounts && analyticsSummary.statusCounts.healthy ? analyticsSummary.statusCounts.healthy : 0}
              status="healthy"
              variant="compact"
              size="sm"
              testId="metric-healthy-count"
            />
            <MetricCard
              label="At Risk"
              value={analyticsSummary.statusCounts && analyticsSummary.statusCounts.at_risk ? analyticsSummary.statusCounts.at_risk : 0}
              status={analyticsSummary.statusCounts && analyticsSummary.statusCounts.at_risk > 0 ? 'at_risk' : 'healthy'}
              variant="compact"
              size="sm"
              testId="metric-at-risk-count"
            />
            <MetricCard
              label="Improving"
              value={improvingMetrics.length}
              status="passed"
              variant="compact"
              size="sm"
              testId="metric-improving-count"
            />
          </div>

          {/* Metric Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            {metricStatusData.length > 0 && (
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={metricStatusData}
                  title="Metric Status"
                  description="Metrics by health status"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#F59E0B', '#DC2626', '#6B7280']}
                  testId="chart-metric-status"
                />
              </Card>
            )}
            {metricGradeData.length > 0 && (
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="bar"
                  data={metricGradeData}
                  title="Metric Grades"
                  description="Metrics by letter grade"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#3B82F6', '#F59E0B', '#DC2626', '#6B7280']}
                  testId="chart-metric-grades"
                />
              </Card>
            )}
            {metricTrendDistData.length > 0 && (
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={metricTrendDistData}
                  title="Metric Trends"
                  description="Metrics by trend direction"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#6B7280', '#DC2626']}
                  testId="chart-metric-trends"
                />
              </Card>
            )}
          </div>

          {/* At-Risk Metrics */}
          {atRiskMetrics.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                At-Risk Metrics ({atRiskMetrics.length})
              </h3>
              <div className="space-y-0.5">
                {atRiskMetrics.map((metric) => (
                  <div
                    key={metric.id || metric.key}
                    className="flex items-center justify-between py-0.5 px-1 border border-yellow-200 bg-yellow-50/30 rounded-standard"
                  >
                    <div className="flex items-center gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-gray-800">{metric.name || metric.key || '—'}</span>
                      <Badge status="at_risk" size="sm" />
                      {metric.grade && (
                        <Badge variant={gradeToVariant(metric.grade)} size="sm">{metric.grade}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <span className="text-xs text-gray-600">
                        {metric.value !== null && metric.value !== undefined
                          ? (metric.unit === '%' ? `${metric.value}%` : String(metric.value))
                          : '—'}
                      </span>
                      {metric.trendPercentage !== undefined && typeof metric.trendPercentage === 'number' && (
                        <span className={`text-[10px] font-medium ${metric.trendPercentage > 0 ? 'text-living-green-600' : metric.trendPercentage < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                          {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Improving Metrics */}
          {improvingMetrics.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Improving Metrics ({improvingMetrics.length})
              </h3>
              <div className="space-y-0.5">
                {improvingMetrics.map((metric) => (
                  <div
                    key={metric.id || metric.key}
                    className="flex items-center justify-between py-0.5 px-1 border border-living-green-200 bg-living-green-50/30 rounded-standard"
                  >
                    <div className="flex items-center gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-gray-800">{metric.name || metric.key || '—'}</span>
                      <Badge status="passed" size="sm">improving</Badge>
                      {metric.grade && (
                        <Badge variant={gradeToVariant(metric.grade)} size="sm">{metric.grade}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <span className="text-xs text-gray-600">
                        {metric.value !== null && metric.value !== undefined
                          ? (metric.unit === '%' ? `${metric.value}%` : String(metric.value))
                          : '—'}
                      </span>
                      {metric.trendPercentage !== undefined && typeof metric.trendPercentage === 'number' && (
                        <span className="text-[10px] font-medium text-living-green-600">
                          {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Declining Metrics */}
          {decliningMetrics.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Declining Metrics ({decliningMetrics.length})
              </h3>
              <div className="space-y-0.5">
                {decliningMetrics.map((metric) => (
                  <div
                    key={metric.id || metric.key}
                    className="flex items-center justify-between py-0.5 px-1 border border-red-200 bg-red-50/30 rounded-standard"
                  >
                    <div className="flex items-center gap-0.5 min-w-0">
                      <span className="text-xs font-medium text-gray-800">{metric.name || metric.key || '—'}</span>
                      <Badge status="failed" size="sm">declining</Badge>
                      {metric.grade && (
                        <Badge variant={gradeToVariant(metric.grade)} size="sm">{metric.grade}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <span className="text-xs text-gray-600">
                        {metric.value !== null && metric.value !== undefined
                          ? (metric.unit === '%' ? `${metric.value}%` : String(metric.value))
                          : '—'}
                      </span>
                      {metric.trendPercentage !== undefined && typeof metric.trendPercentage === 'number' && (
                        <span className="text-[10px] font-medium text-red-600">
                          {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {atRiskMetrics.length === 0 && improvingMetrics.length === 0 && decliningMetrics.length === 0 && (
            <EmptyState
              title="No metric health data"
              description="No metric health data is available. Metrics will appear here once calculated."
              variant="compact"
            />
          )}

          {/* All Metrics Overview */}
          {metricsData.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">All Metrics Overview</h3>
              <div className="space-y-0.5">
                {metricsData.map((metric) => {
                  const isComposite = metric.key === 'enterprise_quality_score' || metric.key === 'release_readiness_score' || metric.key === 'test_effectiveness';
                  return (
                    <div
                      key={metric.id || metric.key}
                      className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <div className="flex items-center gap-0.5 min-w-0">
                        <span className={`text-xs font-medium text-gray-800 truncate ${isComposite ? 'font-semibold' : ''}`}>
                          {metric.name || metric.key || '—'}
                        </span>
                        {metric.status && <Badge status={metric.status} size="sm" />}
                        {metric.grade && (
                          <Badge variant={gradeToVariant(metric.grade)} size="sm">{metric.grade}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <span className="text-xs text-gray-700 font-medium">
                          {metric.value !== null && metric.value !== undefined
                            ? (metric.unit === '%'
                              ? `${typeof metric.value === 'number' ? (Number.isInteger(metric.value) ? metric.value : metric.value.toFixed(2)) : metric.value}%`
                              : metric.unit === 'hours'
                                ? `${typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value} hrs`
                                : metric.unit === 'defects/KLOC'
                                  ? `${typeof metric.value === 'number' ? metric.value.toFixed(2) : metric.value}`
                                  : metric.unit === 'score'
                                    ? `${typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}`
                                    : String(metric.value))
                            : '—'}
                        </span>
                        {metric.trend && (
                          <span className={`text-[10px] font-medium ${metric.trend === 'improving' ? 'text-living-green-600' : metric.trend === 'declining' ? 'text-red-600' : 'text-gray-400'}`}>
                            {metric.trend === 'improving' ? '↑' : metric.trend === 'declining' ? '↓' : '→'}
                          </span>
                        )}
                        {metric.trendPercentage !== undefined && typeof metric.trendPercentage === 'number' && (
                          <span className={`text-[10px] ${metric.trendPercentage > 0 ? 'text-living-green-600' : metric.trendPercentage < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Last Updated */}
      {adoptionMetrics && adoptionMetrics.lastUpdated && (
        <div className="text-right">
          <span className="text-[10px] text-gray-400">
            Data as of: {formatDate(adoptionMetrics.lastUpdated)}
          </span>
        </div>
      )}
    </div>
  );
}