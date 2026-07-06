import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRBAC } from '../contexts/RBACContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import ChartPlaceholder from '../components/common/ChartPlaceholder.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Timeline from '../components/common/Timeline.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

/**
 * @module ApplicationDetail
 * Application Detail page for eQIP Quality Intelligence.
 *
 * Full quality profile for a selected application with sections for summary,
 * ownership, segment alignment, release history, test coverage, execution history,
 * automation health, defect trends, environment/test data mapping, quality gate
 * history, governance compliance, production health, AI recommendations, and
 * related demands.
 * Uses Tabs, Card, Badge, ChartPlaceholder, Timeline, DataTable.
 */

/**
 * Helper to resolve a quality score to a grade letter.
 * @param {number} score - The quality score (0-100).
 * @returns {string} The letter grade.
 */
function scoreToGrade(score) {
  if (typeof score !== 'number' || isNaN(score)) return '—';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Helper to resolve a grade to a badge variant.
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
 * Release history table columns.
 * @type {Array<object>}
 */
const RELEASE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Release',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      const statusMap = {
        'Ready': 'passed',
        'In Progress': 'in_progress',
        'In Review': 'in_review',
        'At Risk': 'at_risk',
        'Draft': 'draft',
      };
      return <Badge status={statusMap[value] || value} size="sm">{value}</Badge>;
    },
  },
  {
    key: 'readinessScore',
    label: 'Readiness',
    sortable: true,
    align: 'center',
    width: '100px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-bold">{value}</span>;
    },
  },
  {
    key: 'quality_score',
    label: 'Quality',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      const grade = scoreToGrade(value);
      return (
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-sm font-bold">{value}</span>
          <Badge variant={gradeToVariant(grade)} size="sm">{grade}</Badge>
        </div>
      );
    },
  },
  {
    key: 'segment',
    label: 'Segment',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
];

/**
 * Demand table columns.
 * @type {Array<object>}
 */
const DEMAND_TABLE_COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800 truncate">{value}</span>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'priority',
    label: 'Priority',
    sortable: true,
    width: '80px',
    align: 'center',
    render: (value) => {
      if (!value) return '—';
      const statusMap = { p1: 'critical', p2: 'high', p3: 'medium', p4: 'low' };
      return <Badge status={statusMap[value] || value} size="sm">{value.toUpperCase()}</Badge>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'assignedTo',
    label: 'Assigned',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">Unassigned</span>;
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
];

/**
 * Test case table columns.
 * @type {Array<object>}
 */
const TEST_CASE_TABLE_COLUMNS = [
  {
    key: 'title',
    label: 'Test Case',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900 truncate">{value}</span>;
    },
  },
  {
    key: 'assetType',
    label: 'Type',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'automationStatus',
    label: 'Automation',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'priority',
    label: 'Priority',
    sortable: true,
    width: '70px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm">{value.toUpperCase()}</Badge>;
    },
  },
];

/**
 * Governance table columns.
 * @type {Array<object>}
 */
const GOVERNANCE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Procedure',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '140px',
  },
  {
    key: 'complianceStatus',
    label: 'Status',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'complianceRate',
    label: 'Rate',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return `${value}%`;
    },
  },
  {
    key: 'riskLevel',
    label: 'Risk',
    sortable: true,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
];

/**
 * Application Detail page component.
 *
 * @returns {React.ReactElement} The rendered ApplicationDetail page.
 */
export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, getById, entityTypes } = useData();

  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  // Related data
  const [releases, setReleases] = useState([]);
  const [demands, setDemands] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [testDataSets, setTestDataSets] = useState([]);
  const [governanceProcedures, setGovernanceProcedures] = useState([]);
  const [postDeployments, setPostDeployments] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  /**
   * Load application and related data.
   */
  const loadData = useCallback(() => {
    if (!isDataReady || !id) return;

    setIsLoading(true);

    try {
      const app = getById(entityTypes.APPLICATIONS, id);

      if (!app) {
        setApplication(null);
        setIsLoading(false);
        return;
      }

      setApplication(app);

      const appName = app.name;

      // Load releases for this application
      const allReleases = getAll(entityTypes.RELEASES);
      const appReleases = Array.isArray(allReleases)
        ? allReleases.filter((r) => r.application === appName)
        : [];
      setReleases(appReleases);

      // Load demands for this application
      const allDemands = getAll(entityTypes.DEMANDS);
      const appDemands = Array.isArray(allDemands)
        ? allDemands.filter((d) => d.application === appName)
        : [];
      setDemands(appDemands);

      // Load test cases for this application
      const allTestCases = getAll(entityTypes.TEST_CASES);
      const appTestCases = Array.isArray(allTestCases)
        ? allTestCases.filter((tc) => tc.application === appName)
        : [];
      setTestCases(appTestCases);

      // Load test executions for this application
      const allExecutions = getAll(entityTypes.TEST_EXECUTIONS);
      const appExecutions = Array.isArray(allExecutions)
        ? allExecutions.filter((exec) => exec.application === appName)
        : [];
      setTestExecutions(appExecutions);

      // Load environments for this application
      const allEnvironments = getAll(entityTypes.ENVIRONMENTS);
      const appEnvironments = Array.isArray(allEnvironments)
        ? allEnvironments.filter(
            (env) =>
              Array.isArray(env.applications) && env.applications.includes(appName),
          )
        : [];
      setEnvironments(appEnvironments);

      // Load test data sets for this application
      const allTestData = getAll(entityTypes.TEST_DATA);
      const appTestData = Array.isArray(allTestData)
        ? allTestData.filter(
            (td) =>
              Array.isArray(td.associatedApplications) &&
              td.associatedApplications.includes(appName),
          )
        : [];
      setTestDataSets(appTestData);

      // Load governance procedures applicable to this application
      const allGov = getAll(entityTypes.GOVERNANCE_PROCEDURES);
      const appGov = Array.isArray(allGov)
        ? allGov.filter(
            (proc) =>
              Array.isArray(proc.applicableApplications) &&
              (proc.applicableApplications.length === 0 ||
                proc.applicableApplications.includes(appName)),
          )
        : [];
      setGovernanceProcedures(appGov);

      // Load post-deployment data for this application
      const allPostDeploy = getAll(entityTypes.POST_DEPLOYMENTS);
      const appPostDeploy = Array.isArray(allPostDeploy)
        ? allPostDeploy.filter((pd) => pd.applicationName === appName || pd.applicationId === id)
        : [];
      setPostDeployments(appPostDeploy);

      // Load AI insights for this application
      const allInsights = getAll(entityTypes.AI_INSIGHTS);
      const appInsights = Array.isArray(allInsights)
        ? allInsights.filter(
            (insight) =>
              (insight.entityType === 'applications' && insight.entityId === id) ||
              (insight.result &&
                insight.result.summary &&
                typeof insight.result.summary === 'string' &&
                insight.result.summary.toLowerCase().includes(appName.toLowerCase())),
          )
        : [];
      setAiInsights(appInsights);
    } catch (err) {
      console.error('[ApplicationDetail] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, id, getAll, getById, entityTypes]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Summary metrics computed from related data.
   */
  const summaryMetrics = useMemo(() => {
    if (!application) return null;

    const totalTestCases = testCases.length;
    const automatedTestCases = testCases.filter((tc) => tc.automationStatus === 'automated').length;
    const manualTestCases = testCases.filter((tc) => tc.automationStatus === 'manual').length;
    const passedTestCases = testCases.filter((tc) => tc.status === 'passed').length;
    const failedTestCases = testCases.filter((tc) => tc.status === 'failed').length;

    const totalExecutions = testExecutions.length;
    const passedExecutions = testExecutions.filter((e) => e.result === 'passed').length;
    const failedExecutions = testExecutions.filter((e) => e.result === 'failed').length;
    const completedExecutions = testExecutions.filter((e) => e.status === 'completed').length;
    const executionPassRate = completedExecutions > 0
      ? Math.round((passedExecutions / completedExecutions) * 10000) / 100
      : 0;

    const automationCoverage = totalTestCases > 0
      ? Math.round((automatedTestCases / totalTestCases) * 10000) / 100
      : 0;

    const totalDemands = demands.length;
    const openDemands = demands.filter((d) => d.status === 'active' || d.status === 'in_progress' || d.status === 'draft').length;
    const completedDemands = demands.filter((d) => d.status === 'completed').length;

    const totalReleases = releases.length;
    const readyReleases = releases.filter((r) => r.status === 'Ready').length;
    const atRiskReleases = releases.filter((r) => r.status === 'At Risk').length;

    const totalEnvironments = environments.length;
    const healthyEnvironments = environments.filter(
      (env) => env.readinessStatus && env.readinessStatus.overall === 'ready',
    ).length;
    const degradedEnvironments = environments.filter(
      (env) => env.readinessStatus && env.readinessStatus.overall === 'degraded',
    ).length;

    const totalPostDeployments = postDeployments.length;
    const healthyDeployments = postDeployments.filter((pd) => pd.status === 'healthy').length;
    const totalIncidents = postDeployments.reduce((sum, pd) => sum + (pd.incidentCount || 0), 0);

    const govCompliant = governanceProcedures.filter((g) => g.complianceStatus === 'compliant').length;
    const govAtRisk = governanceProcedures.filter((g) => g.complianceStatus === 'at_risk').length;
    let avgGovCompliance = 0;
    if (governanceProcedures.length > 0) {
      let total = 0;
      for (let i = 0; i < governanceProcedures.length; i++) {
        total += governanceProcedures[i].complianceRate || 0;
      }
      avgGovCompliance = Math.round((total / governanceProcedures.length) * 100) / 100;
    }

    return {
      totalTestCases,
      automatedTestCases,
      manualTestCases,
      passedTestCases,
      failedTestCases,
      totalExecutions,
      passedExecutions,
      failedExecutions,
      executionPassRate,
      automationCoverage,
      totalDemands,
      openDemands,
      completedDemands,
      totalReleases,
      readyReleases,
      atRiskReleases,
      totalEnvironments,
      healthyEnvironments,
      degradedEnvironments,
      totalPostDeployments,
      healthyDeployments,
      totalIncidents,
      govCompliant,
      govAtRisk,
      avgGovCompliance,
    };
  }, [application, testCases, testExecutions, demands, releases, environments, postDeployments, governanceProcedures]);

  /**
   * Release history chart data.
   */
  const releaseQualityTrendData = useMemo(() => {
    if (!Array.isArray(application?.releaseHistory)) return [];
    return application.releaseHistory
      .filter((rh) => rh.qualityScore && rh.name)
      .map((rh) => ({
        label: rh.name.replace('Release ', ''),
        value: rh.qualityScore,
      }));
  }, [application]);

  /**
   * Execution result distribution data.
   */
  const executionResultData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Passed', value: summaryMetrics.passedExecutions },
      { label: 'Failed', value: summaryMetrics.failedExecutions },
      { label: 'Other', value: summaryMetrics.totalExecutions - summaryMetrics.passedExecutions - summaryMetrics.failedExecutions },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Test case automation distribution data.
   */
  const automationDistributionData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Automated', value: summaryMetrics.automatedTestCases },
      { label: 'Manual', value: summaryMetrics.manualTestCases },
      { label: 'Other', value: summaryMetrics.totalTestCases - summaryMetrics.automatedTestCases - summaryMetrics.manualTestCases },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Test case status distribution data.
   */
  const testCaseStatusData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Passed', value: summaryMetrics.passedTestCases },
      { label: 'Failed', value: summaryMetrics.failedTestCases },
      { label: 'Other', value: summaryMetrics.totalTestCases - summaryMetrics.passedTestCases - summaryMetrics.failedTestCases },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Demand status distribution data.
   */
  const demandStatusData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < demands.length; i++) {
      const status = demands[i].status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), value: counts[key] }));
  }, [demands]);

  /**
   * Recent execution timeline entries.
   */
  const recentExecutionEntries = useMemo(() => {
    const sorted = [...testExecutions]
      .sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      })
      .slice(0, 15);

    return sorted.map((exec) => ({
      id: exec.id,
      title: exec.testCaseTitle || exec.id,
      description: exec.failureReason || (exec.result === 'passed' ? 'Test passed successfully.' : exec.result === 'failed' ? 'Test failed.' : `Status: ${exec.result || 'unknown'}`),
      timestamp: exec.executedAt,
      badge: exec.result ? <Badge status={exec.result} size="sm" /> : null,
      metadata: [
        { label: 'Environment', value: exec.environment || '—' },
        { label: 'Duration', value: typeof exec.duration === 'number' ? `${exec.duration}s` : '—' },
        { label: 'Build', value: exec.buildNumber || '—' },
      ],
    }));
  }, [testExecutions]);

  /**
   * Release history timeline entries.
   */
  const releaseTimelineEntries = useMemo(() => {
    if (!Array.isArray(application?.releaseHistory)) return [];
    return application.releaseHistory.map((rel, idx) => ({
      id: rel.releaseId || `rel-${idx}`,
      title: rel.name || rel.releaseId || 'Release',
      description: `Quality Score: ${rel.qualityScore || '—'} | Status: ${rel.status || '—'}`,
      timestamp: rel.date,
      badge: rel.status ? (
        <Badge
          status={
            rel.status === 'Ready'
              ? 'passed'
              : rel.status === 'At Risk'
                ? 'at_risk'
                : rel.status === 'In Progress'
                  ? 'in_progress'
                  : rel.status.toLowerCase().replace(/\s+/g, '_')
          }
          size="sm"
        >
          {rel.status}
        </Badge>
      ) : null,
    }));
  }, [application]);

  /**
   * Post-deployment timeline entries.
   */
  const postDeploymentEntries = useMemo(() => {
    return postDeployments.map((pd) => ({
      id: pd.id,
      title: `${pd.version || 'Unknown'} - ${pd.deploymentType || 'deployment'}`,
      description: pd.notes || `Status: ${pd.status || 'unknown'}. Incidents: ${pd.incidentCount || 0}.`,
      timestamp: pd.deployedAt,
      badge: pd.status ? <Badge status={pd.status} size="sm" /> : null,
      metadata: [
        { label: 'Type', value: pd.deploymentType || '—' },
        { label: 'Incidents', value: String(pd.incidentCount || 0) },
        { label: 'Rollback', value: pd.rollbackStatus || '—' },
      ],
    }));
  }, [postDeployments]);

  /**
   * AI insights timeline entries.
   */
  const aiInsightEntries = useMemo(() => {
    return aiInsights.map((insight) => ({
      id: insight.id,
      title: insight.query || insight.type || 'AI Insight',
      description: insight.result && insight.result.summary ? insight.result.summary.slice(0, 200) + (insight.result.summary.length > 200 ? '...' : '') : 'No summary available.',
      timestamp: insight.created_at,
      badge: insight.status ? <Badge status={insight.status} size="sm" /> : null,
      metadata: [
        { label: 'Type', value: insight.type ? insight.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—' },
        { label: 'Confidence', value: insight.result && typeof insight.result.confidence === 'number' ? `${Math.round(insight.result.confidence * 100)}%` : '—' },
      ],
    }));
  }, [aiInsights]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    if (!application || !summaryMetrics) return [];

    return [
      { key: 'summary', label: 'Summary' },
      { key: 'releases', label: 'Releases', badge: String(summaryMetrics.totalReleases) },
      { key: 'test-coverage', label: 'Test Coverage', badge: String(summaryMetrics.totalTestCases) },
      { key: 'executions', label: 'Executions', badge: String(summaryMetrics.totalExecutions) },
      { key: 'environments', label: 'Environments', badge: String(summaryMetrics.totalEnvironments) },
      { key: 'governance', label: 'Governance', badge: String(governanceProcedures.length) },
      { key: 'production', label: 'Production Health', badge: String(summaryMetrics.totalPostDeployments) },
      { key: 'demands', label: 'Demands', badge: String(summaryMetrics.totalDemands) },
      { key: 'ai-insights', label: 'AI Insights', badge: String(aiInsights.length) },
    ];
  }, [application, summaryMetrics, governanceProcedures, aiInsights]);

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    navigate('/applications');
  }, [navigate]);

  if (isLoading) {
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
          <span className="text-sm text-gray-500 font-medium">Loading application detail...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-3" data-testid="application-detail-not-found">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to applications">
          ← Back to Applications
        </Button>
        <EmptyState
          title="Application Not Found"
          description={`No application found with ID "${id}". It may have been removed or the ID is incorrect.`}
          actionLabel="Go to Application Repository"
          onAction={handleBack}
          variant="base"
        />
      </div>
    );
  }

  const grade = scoreToGrade(application.qualityScore);

  return (
    <div className="space-y-3" data-testid="application-detail">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to applications">
        ← Back to Applications
      </Button>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">{application.name}</h1>
          {application.description && (
            <p className="text-sm text-gray-500 mt-[2px] max-w-2xl">{application.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {application.status && <Badge status={application.status} size="md" />}
            {application.riskLevel && <Badge status={application.riskLevel} size="md" />}
            {application.qualityScore !== null && application.qualityScore !== undefined && (
              <Badge variant={gradeToVariant(grade)} size="md">
                Score: {application.qualityScore} (Grade {grade})
              </Badge>
            )}
            {application.segment && <Badge variant="neutral" size="md">{application.segment}</Badge>}
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <MetricCard
            label="Quality Score"
            value={application.qualityScore}
            grade={grade}
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Automation Coverage"
            value={application.automationCoverage}
            unit="%"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Test Coverage"
            value={application.testCoverage}
            unit="%"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Defect Density"
            value={application.defectDensity}
            unit="defects/KLOC"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Test Pass Rate"
            value={summaryMetrics.executionPassRate}
            unit="%"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Gov. Compliance"
            value={summaryMetrics.avgGovCompliance}
            unit="%"
            variant="compact"
            size="sm"
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="underline"
        size="md"
        testId="application-detail-tabs"
      />

      {/* Summary Tab */}
      {activeTab === 'summary' && summaryMetrics && (
        <div className="space-y-2">
          {/* Ownership & Segment */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Application Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Segment:</span>{' '}
                <span className="text-gray-800">{application.segment || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Owner:</span>{' '}
                <span className="text-gray-800">{application.owner || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Team Size:</span>{' '}
                <span className="text-gray-800">{application.teamSize || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Risk Level:</span>{' '}
                <span className="text-gray-800">{application.riskLevel || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{' '}
                <span className="text-gray-800">{application.status || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>{' '}
                <span className="text-gray-800">{formatDate(application.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>{' '}
                <span className="text-gray-800">{formatDate(application.updated_at)}</span>
              </div>
            </div>

            {/* Technology Stack */}
            {Array.isArray(application.technology) && application.technology.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium text-gray-600">Technology Stack:</span>
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {application.technology.map((tech, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Summary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={automationDistributionData}
                title="Automation Coverage"
                description="Test case automation breakdown"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#6B7280']}
                testId="chart-automation-dist"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={executionResultData}
                title="Execution Results"
                description="Test execution outcome distribution"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#DC2626', '#6B7280']}
                testId="chart-execution-results"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="line"
                data={releaseQualityTrendData}
                title="Quality Score Trend"
                description="Quality scores across releases"
                size="sm"
                showValues={true}
                showLabels={true}
                showDots={true}
                colors={['#024E38']}
                testId="chart-quality-trend"
              />
            </Card>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            <MetricCard label="Releases" value={summaryMetrics.totalReleases} variant="compact" size="sm" />
            <MetricCard label="Ready Releases" value={summaryMetrics.readyReleases} status="passed" variant="compact" size="sm" />
            <MetricCard label="At Risk Releases" value={summaryMetrics.atRiskReleases} status={summaryMetrics.atRiskReleases > 0 ? 'at_risk' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Test Cases" value={summaryMetrics.totalTestCases} variant="compact" size="sm" />
            <MetricCard label="Executions" value={summaryMetrics.totalExecutions} variant="compact" size="sm" />
            <MetricCard label="Environments" value={summaryMetrics.totalEnvironments} variant="compact" size="sm" />
            <MetricCard label="Open Demands" value={summaryMetrics.openDemands} status={summaryMetrics.openDemands > 0 ? 'in_progress' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Completed Demands" value={summaryMetrics.completedDemands} status="completed" variant="compact" size="sm" />
            <MetricCard label="Gov. Compliant" value={summaryMetrics.govCompliant} status="compliant" variant="compact" size="sm" />
            <MetricCard label="Gov. At Risk" value={summaryMetrics.govAtRisk} status={summaryMetrics.govAtRisk > 0 ? 'at_risk' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Deployments" value={summaryMetrics.totalPostDeployments} variant="compact" size="sm" />
            <MetricCard label="Incidents" value={summaryMetrics.totalIncidents} status={summaryMetrics.totalIncidents > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
          </div>

          {/* Governance Compliance Bar */}
          {application.governanceCompliance && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Governance Compliance</h3>
              <ProgressBar
                value={application.governanceCompliance.overallRate || 0}
                max={100}
                size="md"
                variant="auto"
                showValue={true}
                label="Overall Compliance Rate"
                unit="%"
                testId="governance-compliance-bar"
              />
              {Array.isArray(application.governanceCompliance.procedures) && application.governanceCompliance.procedures.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {application.governanceCompliance.procedures.map((proc, idx) => (
                    <div
                      key={proc.procedureId || idx}
                      className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <span className="text-xs font-medium text-gray-800 truncate">{proc.name || proc.procedureId || 'Procedure'}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Badge status={proc.status || 'unknown'} size="sm" />
                        {proc.lastAudit && (
                          <span className="text-[10px] text-gray-400">{formatDate(proc.lastAudit)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Environment Mapping */}
          {application.environmentMapping && Object.keys(application.environmentMapping).length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Environment Mapping</h3>
              <div className="space-y-0.5">
                {Object.keys(application.environmentMapping).map((envKey) => {
                  const env = application.environmentMapping[envKey];
                  return (
                    <div
                      key={envKey}
                      className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <div className="flex items-center gap-0.5 min-w-0">
                        <span className="text-xs font-medium text-gray-900 capitalize">{envKey}</span>
                        <Badge status={env.status || 'unknown'} size="sm" />
                      </div>
                      <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
                        {env.url && (
                          <span className="truncate max-w-[200px]" title={env.url}>{env.url}</span>
                        )}
                        {env.lastDeployment && (
                          <span className="text-[10px] text-gray-400">
                            Deployed: {formatDate(env.lastDeployment)}
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

      {/* Releases Tab */}
      {activeTab === 'releases' && (
        <div className="space-y-2">
          {releases.length > 0 ? (
            <>
              <DataTable
                columns={RELEASE_TABLE_COLUMNS}
                data={releases}
                rowKey="id"
                paginated={releases.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={false}
                searchable={releases.length > 5}
                searchPlaceholder="Search releases..."
                emptyTitle="No releases"
                emptyMessage="No releases found for this application."
                ariaLabel="Application releases table"
                testId="app-releases-table"
              />

              {releaseTimelineEntries.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Release History Timeline</h3>
                  <Timeline
                    entries={releaseTimelineEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="app-release-timeline"
                  />
                </Card>
              )}

              {releaseQualityTrendData.length >= 2 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="line"
                    data={releaseQualityTrendData}
                    title="Release Quality Trend"
                    description="Quality scores across releases"
                    size="md"
                    showValues={true}
                    showLabels={true}
                    showDots={true}
                    showArea={true}
                    colors={['#024E38']}
                    testId="chart-release-quality-trend"
                  />
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No releases"
              description="No releases have been recorded for this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Test Coverage Tab */}
      {activeTab === 'test-coverage' && (
        <div className="space-y-2">
          {testCases.length > 0 ? (
            <>
              {/* Test Coverage Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Test Cases" value={summaryMetrics.totalTestCases} variant="compact" size="sm" />
                <MetricCard label="Automated" value={summaryMetrics.automatedTestCases} variant="compact" size="sm" />
                <MetricCard label="Manual" value={summaryMetrics.manualTestCases} variant="compact" size="sm" />
                <MetricCard label="Automation Coverage" value={summaryMetrics.automationCoverage} unit="%" variant="compact" size="sm" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={automationDistributionData}
                    title="Automation Distribution"
                    description="Automated vs manual test cases"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    colors={['#78BE20', '#F59E0B', '#6B7280']}
                    testId="chart-automation-coverage"
                  />
                </Card>
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={testCaseStatusData}
                    title="Test Case Status"
                    description="Pass/fail distribution"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    colors={['#78BE20', '#DC2626', '#6B7280']}
                    testId="chart-test-case-status"
                  />
                </Card>
              </div>

              {/* Test Cases Table */}
              <DataTable
                columns={TEST_CASE_TABLE_COLUMNS}
                data={testCases}
                rowKey="id"
                paginated={testCases.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                searchable={testCases.length > 5}
                searchPlaceholder="Search test cases..."
                emptyTitle="No test cases"
                emptyMessage="No test cases found for this application."
                ariaLabel="Application test cases table"
                testId="app-test-cases-table"
              />
            </>
          ) : (
            <EmptyState
              title="No test cases"
              description="No test cases are associated with this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-2">
          {testExecutions.length > 0 ? (
            <>
              {/* Execution Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Executions" value={summaryMetrics.totalExecutions} variant="compact" size="sm" />
                <MetricCard label="Passed" value={summaryMetrics.passedExecutions} status="passed" variant="compact" size="sm" />
                <MetricCard label="Failed" value={summaryMetrics.failedExecutions} status={summaryMetrics.failedExecutions > 0 ? 'failed' : 'healthy'} variant="compact" size="sm" />
                <MetricCard label="Pass Rate" value={summaryMetrics.executionPassRate} unit="%" variant="compact" size="sm" />
              </div>

              {/* Execution Result Chart */}
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={executionResultData}
                  title="Execution Results"
                  description="Test execution outcome distribution"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#DC2626', '#6B7280']}
                  testId="chart-exec-results"
                />
              </Card>

              {/* Execution Timeline */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Recent Executions</h3>
                <Timeline
                  entries={recentExecutionEntries}
                  variant="base"
                  size="sm"
                  showTimestamps={true}
                  testId="app-execution-timeline"
                />
              </Card>
            </>
          ) : (
            <EmptyState
              title="No execution history"
              description="No test executions have been recorded for this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Environments Tab */}
      {activeTab === 'environments' && (
        <div className="space-y-2">
          {environments.length > 0 ? (
            <>
              {/* Environment Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Environments" value={summaryMetrics.totalEnvironments} variant="compact" size="sm" />
                <MetricCard label="Healthy" value={summaryMetrics.healthyEnvironments} status="healthy" variant="compact" size="sm" />
                <MetricCard label="Degraded" value={summaryMetrics.degradedEnvironments} status={summaryMetrics.degradedEnvironments > 0 ? 'degraded' : 'healthy'} variant="compact" size="sm" />
                <MetricCard label="Test Data Sets" value={testDataSets.length} variant="compact" size="sm" />
              </div>

              {/* Environment List */}
              <div className="space-y-0.5">
                {environments.map((env) => (
                  <Card key={env.id} variant="base" padding="sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{env.name}</span>
                        <Badge status={env.status || 'unknown'} size="sm" />
                        <Badge variant="neutral" size="sm">{env.type || 'unknown'}</Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {env.readinessStatus && typeof env.readinessStatus.score === 'number' && (
                          <span className="text-xs text-gray-500">Score: {env.readinessStatus.score}</span>
                        )}
                        {env.segment && (
                          <span className="text-[10px] text-gray-400">{env.segment}</span>
                        )}
                      </div>
                    </div>
                    {env.description && (
                      <p className="text-[10px] text-gray-500 mt-[2px]">{env.description}</p>
                    )}
                    {Array.isArray(env.conflictFlags) && env.conflictFlags.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-0.5">
                        {env.conflictFlags.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').map((cf, idx) => (
                          <span key={cf.id || idx} className="text-[10px] text-red-600 bg-red-50 px-0.5 py-[1px] rounded">
                            {cf.description || cf.type || 'Conflict'}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Test Data Sets */}
              {testDataSets.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Test Data Sets</h3>
                  <div className="space-y-0.5">
                    {testDataSets.map((td) => (
                      <div
                        key={td.id}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-xs font-medium text-gray-800 truncate">{td.name}</span>
                          <Badge status={td.status || 'unknown'} size="sm" />
                          <Badge variant="neutral" size="sm">{td.type || '—'}</Badge>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="text-[10px] text-gray-400">{td.recordCount || 0} records</span>
                          <Badge status={td.maskingStatus === 'fully_masked' ? 'passed' : td.maskingStatus === 'partially_masked' ? 'warning' : 'neutral'} size="sm">
                            {td.maskingStatus ? td.maskingStatus.replace(/_/g, ' ') : '—'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No environments"
              description="No environments are associated with this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Governance Tab */}
      {activeTab === 'governance' && (
        <div className="space-y-2">
          {governanceProcedures.length > 0 ? (
            <>
              {/* Governance Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Procedures" value={governanceProcedures.length} variant="compact" size="sm" />
                <MetricCard label="Compliant" value={summaryMetrics.govCompliant} status="compliant" variant="compact" size="sm" />
                <MetricCard label="At Risk" value={summaryMetrics.govAtRisk} status={summaryMetrics.govAtRisk > 0 ? 'at_risk' : 'healthy'} variant="compact" size="sm" />
                <MetricCard label="Avg Compliance" value={summaryMetrics.avgGovCompliance} unit="%" variant="compact" size="sm" />
              </div>

              {/* Governance Table */}
              <DataTable
                columns={GOVERNANCE_TABLE_COLUMNS}
                data={governanceProcedures}
                rowKey="id"
                paginated={governanceProcedures.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                searchable={governanceProcedures.length > 5}
                searchPlaceholder="Search procedures..."
                emptyTitle="No governance procedures"
                emptyMessage="No governance procedures are applicable to this application."
                ariaLabel="Application governance procedures table"
                testId="app-governance-table"
              />
            </>
          ) : (
            <EmptyState
              title="No governance data"
              description="No governance procedures are applicable to this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Production Health Tab */}
      {activeTab === 'production' && (
        <div className="space-y-2">
          {postDeployments.length > 0 ? (
            <>
              {/* Production Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Deployments" value={summaryMetrics.totalPostDeployments} variant="compact" size="sm" />
                <MetricCard label="Healthy" value={summaryMetrics.healthyDeployments} status="healthy" variant="compact" size="sm" />
                <MetricCard label="Total Incidents" value={summaryMetrics.totalIncidents} status={summaryMetrics.totalIncidents > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
                <MetricCard
                  label="Rollbacks"
                  value={postDeployments.filter((pd) => pd.rollbackStatus === 'completed').length}
                  status={postDeployments.filter((pd) => pd.rollbackStatus === 'completed').length > 0 ? 'error' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Post-Deployment Timeline */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Deployment History</h3>
                <Timeline
                  entries={postDeploymentEntries}
                  variant="base"
                  size="sm"
                  showTimestamps={true}
                  testId="app-post-deployment-timeline"
                />
              </Card>

              {/* Performance Metrics from latest deployment */}
              {postDeployments.length > 0 && postDeployments[0].performanceMetrics && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Latest Deployment Performance</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    {postDeployments[0].performanceMetrics.responseTime && (
                      <div>
                        <span className="font-medium text-gray-600">Response Time (P95):</span>{' '}
                        <span className="text-gray-800">{postDeployments[0].performanceMetrics.responseTime.p95 || '—'}ms</span>
                      </div>
                    )}
                    {postDeployments[0].performanceMetrics.throughput && (
                      <div>
                        <span className="font-medium text-gray-600">Throughput:</span>{' '}
                        <span className="text-gray-800">{postDeployments[0].performanceMetrics.throughput.current || '—'} req/sec</span>
                      </div>
                    )}
                    {postDeployments[0].performanceMetrics.errorRate && (
                      <div>
                        <span className="font-medium text-gray-600">Error Rate:</span>{' '}
                        <span className="text-gray-800">{postDeployments[0].performanceMetrics.errorRate.current || '—'}%</span>
                      </div>
                    )}
                    {postDeployments[0].performanceMetrics.cpuUtilization && (
                      <div>
                        <span className="font-medium text-gray-600">CPU:</span>{' '}
                        <span className="text-gray-800">{postDeployments[0].performanceMetrics.cpuUtilization.current || '—'}%</span>
                      </div>
                    )}
                    {postDeployments[0].performanceMetrics.memoryUtilization && (
                      <div>
                        <span className="font-medium text-gray-600">Memory:</span>{' '}
                        <span className="text-gray-800">{postDeployments[0].performanceMetrics.memoryUtilization.current || '—'}%</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Health Checks from latest deployment */}
              {postDeployments.length > 0 && Array.isArray(postDeployments[0].healthChecks) && postDeployments[0].healthChecks.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Health Checks</h3>
                  <div className="space-y-0.5">
                    {postDeployments[0].healthChecks.map((hc, idx) => (
                      <div
                        key={hc.id || idx}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center gap-0.5">
                          <span className="text-xs font-medium text-gray-800">{hc.name}</span>
                          <Badge status={hc.status === 'passed' ? 'passed' : hc.status === 'warning' ? 'warning' : hc.status === 'failed' ? 'failed' : 'unknown'} size="sm" />
                        </div>
                        <span className="text-[10px] text-gray-400">{hc.responseTimeMs || '—'}ms</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No production data"
              description="No post-deployment monitoring data is available for this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Demands Tab */}
      {activeTab === 'demands' && (
        <div className="space-y-2">
          {demands.length > 0 ? (
            <>
              {/* Demand Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Demands" value={summaryMetrics.totalDemands} variant="compact" size="sm" />
                <MetricCard label="Open" value={summaryMetrics.openDemands} status={summaryMetrics.openDemands > 0 ? 'in_progress' : 'healthy'} variant="compact" size="sm" />
                <MetricCard label="Completed" value={summaryMetrics.completedDemands} status="completed" variant="compact" size="sm" />
                <MetricCard
                  label="Completion Rate"
                  value={summaryMetrics.totalDemands > 0 ? Math.round((summaryMetrics.completedDemands / summaryMetrics.totalDemands) * 10000) / 100 : 0}
                  unit="%"
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Demand Status Chart */}
              {demandStatusData.length > 0 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={demandStatusData}
                    title="Demand Status Distribution"
                    description="Demands by current status"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    colors={['#6B7280', '#3B82F6', '#F59E0B', '#78BE20', '#DC2626', '#8B5CF6']}
                    testId="chart-demand-status"
                  />
                </Card>
              )}

              {/* Demands Table */}
              <DataTable
                columns={DEMAND_TABLE_COLUMNS}
                data={demands}
                rowKey="id"
                paginated={demands.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={false}
                searchable={demands.length > 5}
                searchPlaceholder="Search demands..."
                emptyTitle="No demands"
                emptyMessage="No demands found for this application."
                ariaLabel="Application demands table"
                testId="app-demands-table"
              />
            </>
          ) : (
            <EmptyState
              title="No demands"
              description="No demands are associated with this application."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-2">
          {aiInsights.length > 0 ? (
            <>
              {/* AI Insights Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Insights" value={aiInsights.length} variant="compact" size="sm" />
                <MetricCard
                  label="Risk Predictions"
                  value={aiInsights.filter((i) => i.type === 'risk_prediction').length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Recommendations"
                  value={aiInsights.filter((i) => i.type === 'recommendation').length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Completed"
                  value={aiInsights.filter((i) => i.status === 'completed').length}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* AI Insights Timeline */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">AI Insights & Recommendations</h3>
                <Timeline
                  entries={aiInsightEntries}
                  variant="base"
                  size="sm"
                  showTimestamps={true}
                  testId="app-ai-insights-timeline"
                />
              </Card>

              {/* Detailed Insights */}
              {aiInsights.map((insight) => {
                if (!insight.result) return null;

                const hasRecommendations = Array.isArray(insight.result.recommendations) && insight.result.recommendations.length > 0;
                const hasFactors = Array.isArray(insight.result.factors) && insight.result.factors.length > 0;

                if (!hasRecommendations && !hasFactors && !insight.result.answer) return null;

                return (
                  <Card key={insight.id} variant="base" padding="md">
                    <div className="flex items-center gap-0.5 mb-0.5">
                      <h4 className="text-xs font-semibold text-gray-800 truncate">{insight.query || insight.type || 'Insight'}</h4>
                      {insight.status && <Badge status={insight.status} size="sm" />}
                      {insight.type && (
                        <Badge variant="neutral" size="sm">
                          {insight.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      )}
                    </div>

                    {insight.result.summary && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-0.5">{insight.result.summary}</p>
                    )}

                    {insight.result.answer && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-0.5 whitespace-pre-line">{insight.result.answer.slice(0, 500)}{insight.result.answer.length > 500 ? '...' : ''}</p>
                    )}

                    {hasFactors && (
                      <div className="mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-600">Risk Factors:</span>
                        <div className="space-y-[2px] mt-[2px]">
                          {insight.result.factors.map((factor, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                              <span className="text-gray-700">{factor.factor}</span>
                              <Badge
                                status={factor.impact === 'positive' ? 'passed' : factor.impact === 'negative' ? 'failed' : factor.impact === 'critical' ? 'critical' : 'warning'}
                                size="sm"
                              >
                                {factor.impact}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasRecommendations && (
                      <div className="mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-600">Recommendations:</span>
                        <ul className="list-disc list-inside space-y-[1px] mt-[2px]">
                          {insight.result.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-[10px] text-gray-700">
                              {typeof rec === 'string' ? rec : rec.action || rec.area || JSON.stringify(rec)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.result.confidence !== undefined && typeof insight.result.confidence === 'number' && (
                      <div className="mt-0.5 text-[10px] text-gray-400">
                        Confidence: {Math.round(insight.result.confidence * 100)}%
                        {insight.processingTimeMs ? ` | Processing: ${insight.processingTimeMs}ms` : ''}
                      </div>
                    )}
                  </Card>
                );
              })}
            </>
          ) : (
            <EmptyState
              title="No AI insights"
              description="No AI insights or recommendations are available for this application."
              variant="compact"
            />
          )}
        </div>
      )}
    </div>
  );
}