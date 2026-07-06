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
import DataTable from '../components/common/DataTable.jsx';
import Timeline from '../components/common/Timeline.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

/**
 * @module TestSuiteDetail
 * Test Suite Detail page for eQIP Quality Intelligence.
 *
 * Displays all required fields for a test suite including name, description,
 * type, application, segment, status, priority, test case list, coverage,
 * execution history, approval status, pass rate trends, automation breakdown,
 * and linked schedules.
 * Uses Tabs, Card, DataTable, Badge, ChartPlaceholder, Timeline.
 */

/**
 * Helper to resolve a priority string to a badge status.
 * @param {string} priority - The priority string.
 * @returns {string} The badge status string.
 */
function resolvePriorityStatus(priority) {
  if (!priority) return 'neutral';
  const p = priority.toLowerCase();
  if (p === 'p1') return 'critical';
  if (p === 'p2') return 'high';
  if (p === 'p3') return 'medium';
  if (p === 'p4') return 'low';
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
 * Test case table columns for the suite's test cases.
 * @type {Array<object>}
 */
const TEST_CASE_TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
  {
    key: 'title',
    label: 'Title',
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
    align: 'center',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolvePriorityStatus(value)} size="sm">{value.toUpperCase()}</Badge>;
    },
  },
  {
    key: 'approvalStatus',
    label: 'Approval',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
];

/**
 * Execution history table columns.
 * @type {Array<object>}
 */
const EXECUTION_TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'Execution',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
  {
    key: 'testCaseTitle',
    label: 'Test Case',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900 truncate">{value}</span>;
    },
  },
  {
    key: 'result',
    label: 'Result',
    sortable: true,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'environment',
    label: 'Environment',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'duration',
    label: 'Duration',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}s</span>;
    },
  },
  {
    key: 'executedAt',
    label: 'Date',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'executedBy',
    label: 'By',
    sortable: true,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
];

/**
 * Schedule table columns.
 * @type {Array<object>}
 */
const SCHEDULE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Schedule',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'frequency',
    label: 'Frequency',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value.replace(/_/g, ' ')}</span>;
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
    key: 'environment',
    label: 'Environment',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'lastRunStatus',
    label: 'Last Run',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'lastRun',
    label: 'Last Run Date',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Test Suite Detail page component.
 *
 * @returns {React.ReactElement} The rendered TestSuiteDetail page.
 */
export default function TestSuiteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, getById, entityTypes } = useData();

  const [suite, setSuite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Related data
  const [testCases, setTestCases] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);
  const [schedules, setSchedules] = useState([]);

  /**
   * Load test suite and related data.
   */
  const loadData = useCallback(() => {
    if (!isDataReady || !id) return;

    setIsLoading(true);

    try {
      const suiteData = getById(entityTypes.TEST_SUITES, id);

      if (!suiteData) {
        setSuite(null);
        setIsLoading(false);
        return;
      }

      setSuite(suiteData);

      // Load test cases belonging to this suite
      const allTestCases = getAll(entityTypes.TEST_CASES);
      const suiteTestCaseIds = Array.isArray(suiteData.testCaseIds) ? suiteData.testCaseIds : [];
      const suiteCases = Array.isArray(allTestCases)
        ? allTestCases.filter((tc) => {
            if (suiteTestCaseIds.length > 0) {
              return suiteTestCaseIds.includes(tc.id);
            }
            return tc.suiteId === id;
          })
        : [];
      setTestCases(suiteCases);

      // Load test executions for this suite
      const allExecutions = getAll(entityTypes.TEST_EXECUTIONS);
      const suiteExecutions = Array.isArray(allExecutions)
        ? allExecutions.filter((exec) => exec.testSuiteId === id)
        : [];
      setTestExecutions(suiteExecutions);

      // Load schedules for this suite
      const allSchedules = getAll(entityTypes.SCHEDULES);
      const suiteSchedules = Array.isArray(allSchedules)
        ? allSchedules.filter((sched) => sched.testSuiteId === id)
        : [];
      setSchedules(suiteSchedules);
    } catch (err) {
      console.error('[TestSuiteDetail] Error loading data:', err);
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
    if (!suite) return null;

    const totalCases = testCases.length;
    const automatedCases = testCases.filter((tc) => tc.automationStatus === 'automated').length;
    const manualCases = testCases.filter((tc) => tc.automationStatus === 'manual').length;
    const passedCases = testCases.filter((tc) => tc.status === 'passed').length;
    const failedCases = testCases.filter((tc) => tc.status === 'failed').length;
    const approvedCases = testCases.filter((tc) => tc.approvalStatus === 'approved').length;
    const pendingCases = testCases.filter((tc) => tc.approvalStatus === 'pending').length;

    const automationCoverage = totalCases > 0
      ? Math.round((automatedCases / totalCases) * 10000) / 100
      : 0;

    const totalExecutions = testExecutions.length;
    const completedExecutions = testExecutions.filter((e) => e.status === 'completed').length;
    const passedExecutions = testExecutions.filter((e) => e.result === 'passed').length;
    const failedExecutions = testExecutions.filter((e) => e.result === 'failed').length;
    const executionPassRate = completedExecutions > 0
      ? Math.round((passedExecutions / completedExecutions) * 10000) / 100
      : 0;

    let avgDuration = 0;
    const durationsWithValues = testExecutions.filter(
      (e) => e.status === 'completed' && typeof e.duration === 'number' && e.duration > 0,
    );
    if (durationsWithValues.length > 0) {
      let totalDuration = 0;
      for (let i = 0; i < durationsWithValues.length; i++) {
        totalDuration += durationsWithValues[i].duration;
      }
      avgDuration = Math.round((totalDuration / durationsWithValues.length) * 100) / 100;
    }

    const withDefects = testCases.filter(
      (tc) => Array.isArray(tc.defectsLinked) && tc.defectsLinked.length > 0,
    ).length;

    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s) => s.status === 'active').length;
    const pausedSchedules = schedules.filter((s) => s.status === 'paused').length;

    // Coverage from test cases
    let totalCoveragePercentage = 0;
    let coverageCount = 0;
    for (let i = 0; i < testCases.length; i++) {
      if (
        testCases[i].coverage &&
        typeof testCases[i].coverage.coveragePercentage === 'number' &&
        testCases[i].coverage.coveragePercentage > 0
      ) {
        totalCoveragePercentage += testCases[i].coverage.coveragePercentage;
        coverageCount += 1;
      }
    }
    const avgCoverage = coverageCount > 0
      ? Math.round((totalCoveragePercentage / coverageCount) * 100) / 100
      : 0;

    return {
      totalCases,
      automatedCases,
      manualCases,
      passedCases,
      failedCases,
      approvedCases,
      pendingCases,
      automationCoverage,
      totalExecutions,
      completedExecutions,
      passedExecutions,
      failedExecutions,
      executionPassRate,
      avgDuration,
      withDefects,
      totalSchedules,
      activeSchedules,
      pausedSchedules,
      avgCoverage,
    };
  }, [suite, testCases, testExecutions, schedules]);

  /**
   * Automation distribution chart data.
   */
  const automationDistributionData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Automated', value: summaryMetrics.automatedCases },
      { label: 'Manual', value: summaryMetrics.manualCases },
      { label: 'Other', value: summaryMetrics.totalCases - summaryMetrics.automatedCases - summaryMetrics.manualCases },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Test case status distribution chart data.
   */
  const testCaseStatusData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Passed', value: summaryMetrics.passedCases },
      { label: 'Failed', value: summaryMetrics.failedCases },
      { label: 'Other', value: summaryMetrics.totalCases - summaryMetrics.passedCases - summaryMetrics.failedCases },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Execution result distribution chart data.
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
   * Approval status distribution chart data.
   */
  const approvalStatusData = useMemo(() => {
    if (!summaryMetrics) return [];
    return [
      { label: 'Approved', value: summaryMetrics.approvedCases },
      { label: 'Pending', value: summaryMetrics.pendingCases },
      { label: 'Other', value: summaryMetrics.totalCases - summaryMetrics.approvedCases - summaryMetrics.pendingCases },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Pass rate trend data from execution history.
   */
  const passRateTrendData = useMemo(() => {
    if (testExecutions.length < 2) return [];

    // Group executions by date (day)
    const dateGroups = {};
    for (let i = 0; i < testExecutions.length; i++) {
      const exec = testExecutions[i];
      if (!exec.executedAt || exec.status !== 'completed') continue;
      const dateKey = exec.executedAt.slice(0, 10);
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { passed: 0, total: 0 };
      }
      dateGroups[dateKey].total += 1;
      if (exec.result === 'passed') {
        dateGroups[dateKey].passed += 1;
      }
    }

    const sortedDates = Object.keys(dateGroups).sort();
    return sortedDates.map((dateKey) => {
      const group = dateGroups[dateKey];
      const rate = group.total > 0 ? Math.round((group.passed / group.total) * 10000) / 100 : 0;
      return {
        label: dateKey,
        value: rate,
      };
    });
  }, [testExecutions]);

  /**
   * Execution duration trend data.
   */
  const durationTrendData = useMemo(() => {
    const sorted = [...testExecutions]
      .filter((e) => e.status === 'completed' && typeof e.duration === 'number' && e.duration > 0 && e.executedAt)
      .sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      })
      .slice(-20);

    return sorted.map((exec) => ({
      label: exec.id || exec.executedAt.slice(0, 10),
      value: exec.duration,
    }));
  }, [testExecutions]);

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
   * Coverage data aggregated from test cases.
   */
  const coverageData = useMemo(() => {
    const requirements = new Set();
    const features = new Set();
    const stories = new Set();

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (tc.coverage) {
        if (Array.isArray(tc.coverage.requirements)) {
          for (let j = 0; j < tc.coverage.requirements.length; j++) {
            requirements.add(tc.coverage.requirements[j]);
          }
        }
        if (Array.isArray(tc.coverage.features)) {
          for (let j = 0; j < tc.coverage.features.length; j++) {
            features.add(tc.coverage.features[j]);
          }
        }
        if (Array.isArray(tc.coverage.stories)) {
          for (let j = 0; j < tc.coverage.stories.length; j++) {
            stories.add(tc.coverage.stories[j]);
          }
        }
      }
    }

    return {
      requirements: [...requirements],
      features: [...features],
      stories: [...stories],
    };
  }, [testCases]);

  /**
   * All linked defects aggregated from test cases.
   */
  const allLinkedDefects = useMemo(() => {
    const defects = new Set();
    for (let i = 0; i < testCases.length; i++) {
      if (Array.isArray(testCases[i].defectsLinked)) {
        for (let j = 0; j < testCases[i].defectsLinked.length; j++) {
          defects.add(testCases[i].defectsLinked[j]);
        }
      }
    }
    return [...defects];
  }, [testCases]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    if (!suite || !summaryMetrics) return [];

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'test-cases', label: 'Test Cases', badge: String(summaryMetrics.totalCases) },
      { key: 'executions', label: 'Executions', badge: String(summaryMetrics.totalExecutions) },
      { key: 'coverage', label: 'Coverage' },
      { key: 'trends', label: 'Trends' },
      { key: 'schedules', label: 'Schedules', badge: String(summaryMetrics.totalSchedules) },
      { key: 'defects', label: 'Defects', badge: allLinkedDefects.length > 0 ? String(allLinkedDefects.length) : undefined },
    ];
  }, [suite, summaryMetrics, allLinkedDefects]);

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    navigate('/test-assets');
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
          <span className="text-sm text-gray-500 font-medium">Loading test suite detail...</span>
        </div>
      </div>
    );
  }

  if (!suite) {
    return (
      <div className="space-y-3" data-testid="test-suite-detail-not-found">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to test repository">
          ← Back to Test Repository
        </Button>
        <EmptyState
          title="Test Suite Not Found"
          description={`No test suite found with ID "${id}". It may have been removed or the ID is incorrect.`}
          actionLabel="Go to Test Repository"
          onAction={handleBack}
          variant="base"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="test-suite-detail">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to test repository">
        ← Back to Test Repository
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-forest-teal-800">{suite.name || 'Test Suite Detail'}</h1>
        {suite.description && (
          <p className="text-sm text-gray-500 mt-[2px] max-w-2xl">{suite.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {suite.status && <Badge status={suite.status} size="md" />}
          {suite.priority && (
            <Badge status={resolvePriorityStatus(suite.priority)} size="md">
              {suite.priority.toUpperCase()}
            </Badge>
          )}
          {suite.type && <Badge variant="neutral" size="md">{suite.type}</Badge>}
          {suite.segment && <Badge variant="neutral" size="md">{suite.segment}</Badge>}
          {suite.application && <Badge variant="neutral" size="md">{suite.application}</Badge>}
        </div>
      </div>

      {/* Key Metrics Row */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
          <MetricCard
            label="Total Cases"
            value={summaryMetrics.totalCases}
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Automated"
            value={summaryMetrics.automatedCases}
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Pass Rate"
            value={suite.passRate !== null && suite.passRate !== undefined ? suite.passRate : summaryMetrics.executionPassRate}
            unit="%"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Automation Coverage"
            value={summaryMetrics.automationCoverage}
            unit="%"
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Executions"
            value={summaryMetrics.totalExecutions}
            variant="compact"
            size="sm"
          />
          <MetricCard
            label="Avg Coverage"
            value={summaryMetrics.avgCoverage}
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
        testId="test-suite-detail-tabs"
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && summaryMetrics && (
        <div className="space-y-2">
          {/* Suite Information */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Suite Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Application:</span>{' '}
                <span className="text-gray-800">{suite.application || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Segment:</span>{' '}
                <span className="text-gray-800">{suite.segment || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Type:</span>{' '}
                <span className="text-gray-800">{suite.type || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{' '}
                <span className="text-gray-800">{suite.status || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Priority:</span>{' '}
                <span className="text-gray-800">{suite.priority ? suite.priority.toUpperCase() : '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Owner:</span>{' '}
                <span className="text-gray-800">{suite.owner || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Cases:</span>{' '}
                <span className="text-gray-800">{suite.totalCases || summaryMetrics.totalCases}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Automated:</span>{' '}
                <span className="text-gray-800">{suite.automatedCount || summaryMetrics.automatedCases}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Manual:</span>{' '}
                <span className="text-gray-800">{suite.manualCount || summaryMetrics.manualCases}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Pass Rate:</span>{' '}
                <span className="text-gray-800">{suite.passRate !== null && suite.passRate !== undefined ? `${suite.passRate}%` : '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Executed:</span>{' '}
                <span className="text-gray-800">{formatDate(suite.lastExecuted)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Scheduled Run:</span>{' '}
                <span className="text-gray-800">{formatDate(suite.scheduledRun)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Version:</span>{' '}
                <span className="text-gray-800">{suite.version || 1}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>{' '}
                <span className="text-gray-800">{formatDate(suite.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>{' '}
                <span className="text-gray-800">{formatDate(suite.updated_at)}</span>
              </div>
            </div>

            {/* Tags */}
            {Array.isArray(suite.tags) && suite.tags.length > 0 && (
              <div className="mt-1">
                <span className="text-xs font-medium text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {suite.tags.map((tag, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
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
                description="Automated vs manual test cases"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#6B7280']}
                testId="chart-suite-automation"
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
                testId="chart-suite-status"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={executionResultData}
                title="Execution Results"
                description="Execution outcome distribution"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#DC2626', '#6B7280']}
                testId="chart-suite-exec-results"
              />
            </Card>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
            <MetricCard label="Passed Cases" value={summaryMetrics.passedCases} status="passed" variant="compact" size="sm" />
            <MetricCard label="Failed Cases" value={summaryMetrics.failedCases} status={summaryMetrics.failedCases > 0 ? 'failed' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Approved" value={summaryMetrics.approvedCases} status="approved" variant="compact" size="sm" />
            <MetricCard label="Pending Approval" value={summaryMetrics.pendingCases} status={summaryMetrics.pendingCases > 0 ? 'pending' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="With Defects" value={summaryMetrics.withDefects} status={summaryMetrics.withDefects > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Avg Duration" value={summaryMetrics.avgDuration} unit="s" variant="compact" size="sm" />
          </div>

          {/* Approval Status */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Approval Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              <div>
                <ProgressBar
                  value={summaryMetrics.totalCases > 0 ? Math.round((summaryMetrics.approvedCases / summaryMetrics.totalCases) * 100) : 0}
                  max={100}
                  size="md"
                  variant="auto"
                  showValue={true}
                  label="Approval Rate"
                  unit="%"
                  testId="suite-approval-rate-bar"
                />
              </div>
              <div>
                <ChartPlaceholder
                  type="donut"
                  data={approvalStatusData}
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#F59E0B', '#6B7280']}
                  testId="chart-suite-approval"
                />
              </div>
            </div>
          </Card>

          {/* Pass Rate Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Key Metrics</h3>
            <div className="space-y-0.5">
              <ProgressBar
                value={suite.passRate !== null && suite.passRate !== undefined ? suite.passRate : summaryMetrics.executionPassRate}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Pass Rate"
                unit="%"
                thresholds={{ error: 80, warning: 95, success: 100 }}
              />
              <ProgressBar
                value={summaryMetrics.automationCoverage}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Automation Coverage"
                unit="%"
                thresholds={{ error: 50, warning: 80, success: 100 }}
              />
              <ProgressBar
                value={summaryMetrics.avgCoverage}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Avg Requirement Coverage"
                unit="%"
                thresholds={{ error: 60, warning: 85, success: 100 }}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Test Cases Tab */}
      {activeTab === 'test-cases' && (
        <div className="space-y-2">
          {testCases.length > 0 ? (
            <>
              {/* Test Case Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Total Cases" value={summaryMetrics.totalCases} variant="compact" size="sm" />
                <MetricCard label="Automated" value={summaryMetrics.automatedCases} status="passed" variant="compact" size="sm" />
                <MetricCard label="Manual" value={summaryMetrics.manualCases} variant="compact" size="sm" />
                <MetricCard label="Automation Coverage" value={summaryMetrics.automationCoverage} unit="%" variant="compact" size="sm" />
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
                emptyMessage="No test cases found in this suite."
                ariaLabel="Suite test cases table"
                testId="suite-test-cases-table"
              />
            </>
          ) : (
            <EmptyState
              title="No test cases"
              description="No test cases are associated with this test suite."
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
                  testId="chart-suite-exec-results-tab"
                />
              </Card>

              {/* Execution Table */}
              <DataTable
                columns={EXECUTION_TABLE_COLUMNS}
                data={testExecutions}
                rowKey="id"
                paginated={testExecutions.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                searchable={testExecutions.length > 5}
                searchPlaceholder="Search executions..."
                emptyTitle="No executions"
                emptyMessage="No test executions found for this suite."
                ariaLabel="Suite executions table"
                testId="suite-executions-table"
              />

              {/* Execution Timeline */}
              {recentExecutionEntries.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Recent Executions</h3>
                  <Timeline
                    entries={recentExecutionEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="suite-execution-timeline"
                  />
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No execution history"
              description="No test executions have been recorded for this suite."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <div className="space-y-2">
          {/* Coverage Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard label="Avg Coverage" value={summaryMetrics.avgCoverage} unit="%" variant="compact" size="sm" />
            <MetricCard label="Requirements" value={coverageData.requirements.length} variant="compact" size="sm" />
            <MetricCard label="Features" value={coverageData.features.length} variant="compact" size="sm" />
            <MetricCard label="Stories" value={coverageData.stories.length} variant="compact" size="sm" />
          </div>

          {/* Coverage Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Coverage Metrics</h3>
            <ProgressBar
              value={summaryMetrics.avgCoverage}
              max={100}
              size="md"
              variant="auto"
              showValue={true}
              label="Average Requirement Coverage"
              unit="%"
              thresholds={{ error: 60, warning: 85, success: 100 }}
              testId="suite-coverage-bar"
            />
          </Card>

          {/* Requirements Covered */}
          {coverageData.requirements.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Requirements Covered ({coverageData.requirements.length})</h3>
              <div className="flex flex-wrap gap-0.5">
                {coverageData.requirements.map((req, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{req}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Features Covered */}
          {coverageData.features.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Features Covered ({coverageData.features.length})</h3>
              <div className="flex flex-wrap gap-0.5">
                {coverageData.features.map((feat, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{feat}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Stories Covered */}
          {coverageData.stories.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Stories Covered ({coverageData.stories.length})</h3>
              <div className="flex flex-wrap gap-0.5">
                {coverageData.stories.map((story, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{story}</Badge>
                ))}
              </div>
            </Card>
          )}

          {coverageData.requirements.length === 0 && coverageData.features.length === 0 && coverageData.stories.length === 0 && (
            <EmptyState
              title="No coverage data"
              description="No requirements, features, or stories are linked to test cases in this suite."
              variant="compact"
            />
          )}

          {/* Per-Test-Case Coverage */}
          {testCases.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Coverage by Test Case</h3>
              <div className="space-y-0.5">
                {testCases.map((tc) => {
                  const coveragePct = tc.coverage && typeof tc.coverage.coveragePercentage === 'number'
                    ? tc.coverage.coveragePercentage
                    : 0;
                  return (
                    <div
                      key={tc.id}
                      className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <span className="text-xs font-medium text-gray-800 truncate flex-1 min-w-0">{tc.title || tc.id}</span>
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        <span className="text-[10px] text-gray-500">{coveragePct}%</span>
                        <div className="w-[60px]">
                          <ProgressBar
                            value={coveragePct}
                            max={100}
                            size="xs"
                            variant="auto"
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
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-2">
          {/* Pass Rate Trend */}
          {passRateTrendData.length >= 2 ? (
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="line"
                data={passRateTrendData}
                title="Pass Rate Trend"
                description="Test pass rate over time"
                size="md"
                showValues={true}
                showLabels={true}
                showDots={true}
                showArea={true}
                colors={['#78BE20']}
                testId="chart-suite-pass-rate-trend"
              />
            </Card>
          ) : (
            <Card variant="base" padding="md">
              <EmptyState
                title="Insufficient data for pass rate trend"
                description="At least 2 execution data points are needed to display the pass rate trend."
                variant="compact"
              />
            </Card>
          )}

          {/* Duration Trend */}
          {durationTrendData.length >= 2 ? (
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="line"
                data={durationTrendData}
                title="Execution Duration Trend"
                description="Test execution duration over time (seconds)"
                size="md"
                showValues={false}
                showLabels={true}
                showDots={true}
                colors={['#3B82F6']}
                testId="chart-suite-duration-trend"
              />
            </Card>
          ) : (
            <Card variant="base" padding="md">
              <EmptyState
                title="Insufficient data for duration trend"
                description="At least 2 execution data points are needed to display the duration trend."
                variant="compact"
              />
            </Card>
          )}

          {/* Automation vs Manual Trend */}
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="bar"
              data={[
                { label: 'Automated', value: summaryMetrics ? summaryMetrics.automatedCases : 0 },
                { label: 'Manual', value: summaryMetrics ? summaryMetrics.manualCases : 0 },
              ]}
              title="Automation Breakdown"
              description="Automated vs manual test cases"
              size="md"
              showValues={true}
              showLabels={true}
              colors={['#78BE20', '#F59E0B']}
              testId="chart-suite-automation-bar"
            />
          </Card>

          {/* Execution Result Distribution */}
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="stacked-bar"
              data={executionResultData}
              title="Execution Result Distribution"
              description="Passed vs failed vs other"
              size="md"
              showValues={true}
              showLabels={true}
              colors={['#78BE20', '#DC2626', '#6B7280']}
              testId="chart-suite-exec-stacked"
            />
          </Card>
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-2">
          {schedules.length > 0 ? (
            <>
              {/* Schedule Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard label="Total Schedules" value={summaryMetrics.totalSchedules} variant="compact" size="sm" />
                <MetricCard label="Active" value={summaryMetrics.activeSchedules} status="active" variant="compact" size="sm" />
                <MetricCard label="Paused" value={summaryMetrics.pausedSchedules} status={summaryMetrics.pausedSchedules > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
              </div>

              {/* Schedules Table */}
              <DataTable
                columns={SCHEDULE_TABLE_COLUMNS}
                data={schedules}
                rowKey="id"
                paginated={schedules.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                emptyTitle="No schedules"
                emptyMessage="No schedules found for this suite."
                ariaLabel="Suite schedules table"
                testId="suite-schedules-table"
              />

              {/* Schedule Details */}
              <div className="space-y-0.5">
                {schedules.map((sched) => (
                  <Card key={sched.id} variant="base" padding="sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900">{sched.name}</span>
                        <Badge status={sched.status || 'unknown'} size="sm" />
                        <Badge variant="neutral" size="sm">{sched.frequency ? sched.frequency.replace(/_/g, ' ') : '—'}</Badge>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {sched.lastRunStatus && <Badge status={sched.lastRunStatus} size="sm" />}
                        {sched.environment && (
                          <span className="text-[10px] text-gray-400">{sched.environment}</span>
                        )}
                      </div>
                    </div>
                    {sched.description && (
                      <p className="text-[10px] text-gray-500 mt-[2px]">{sched.description}</p>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 mt-0.5 text-[10px] text-gray-400">
                      <div>Last Run: {formatDate(sched.lastRun)}</div>
                      <div>Next Run: {formatDate(sched.nextRun)}</div>
                      {sched.cronExpression && <div>Cron: {sched.cronExpression}</div>}
                      {typeof sched.lastRunDurationMs === 'number' && sched.lastRunDurationMs > 0 && (
                        <div>Duration: {Math.round(sched.lastRunDurationMs / 1000)}s</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No schedules"
              description="No execution schedules are configured for this test suite."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Defects Tab */}
      {activeTab === 'defects' && (
        <div className="space-y-2">
          {allLinkedDefects.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard label="Linked Defects" value={allLinkedDefects.length} variant="compact" size="sm" />
                <MetricCard label="Cases with Defects" value={summaryMetrics.withDefects} status={summaryMetrics.withDefects > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
              </div>

              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">All Linked Defects</h3>
                <div className="space-y-0.5">
                  {allLinkedDefects.map((defect, idx) => (
                    <div
                      key={defect || idx}
                      className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                    >
                      <span className="text-xs font-medium text-deep-forest-teal-700">{defect}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Defects by Test Case */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Defects by Test Case</h3>
                <div className="space-y-0.5">
                  {testCases
                    .filter((tc) => Array.isArray(tc.defectsLinked) && tc.defectsLinked.length > 0)
                    .map((tc) => (
                      <div
                        key={tc.id}
                        className="py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-800 truncate">{tc.title || tc.id}</span>
                          <span className="text-[10px] text-gray-400 shrink-0">{tc.defectsLinked.length} defect{tc.defectsLinked.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex flex-wrap gap-0.5 mt-[2px]">
                          {tc.defectsLinked.map((def, idx) => (
                            <Badge key={idx} variant="error" size="sm">{def}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              title="No linked defects"
              description="No defects are linked to test cases in this suite."
              variant="compact"
            />
          )}
        </div>
      )}
    </div>
  );
}