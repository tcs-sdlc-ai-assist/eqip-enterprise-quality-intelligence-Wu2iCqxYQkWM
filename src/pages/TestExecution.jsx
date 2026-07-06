import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRBAC } from '../contexts/RBACContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import DataTable from '../components/common/DataTable.jsx';
import FilterBar from '../components/common/FilterBar.jsx';
import Badge from '../components/common/Badge.jsx';
import Card from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import ChartPlaceholder from '../components/common/ChartPlaceholder.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Timeline from '../components/common/Timeline.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module TestExecution
 * Test Execution Dashboard page for eQIP Quality Intelligence.
 *
 * Displays test execution metrics, trends, and health by application/segment.
 * Supports filtering by application, segment, environment, result, and status.
 * Shows execution history with DataTable, summary metrics with MetricCard,
 * trend charts with ChartPlaceholder, and detail modal with Timeline.
 * Uses DataTable, FilterBar, MetricCard, ChartPlaceholder.
 */

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
 * Helper to format duration in seconds to a human-readable string.
 * @param {number} seconds - Duration in seconds.
 * @returns {string} Formatted duration string.
 */
function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || typeof seconds !== 'number') return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Columns definition for the test executions data table.
 * @type {Array<object>}
 */
const EXECUTION_TABLE_COLUMNS = [
  {
    key: 'testCaseTitle',
    label: 'Test Case',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800 truncate">{value}</span>;
    },
  },
  {
    key: 'application',
    label: 'Application',
    sortable: true,
    width: '140px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'result',
    label: 'Result',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
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
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{formatDuration(value)}</span>;
    },
  },
  {
    key: 'segment',
    label: 'Segment',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'executedBy',
    label: 'Executed By',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
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
    key: 'buildNumber',
    label: 'Build',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
];

/**
 * Evidence table columns for the detail modal.
 * @type {Array<object>}
 */
const EVIDENCE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-800">{value}</span>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge variant="neutral" size="sm">{value}</Badge>;
    },
  },
  {
    key: 'capturedAt',
    label: 'Captured',
    sortable: false,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Test Execution Dashboard page component.
 *
 * @returns {React.ReactElement} The rendered TestExecution page.
 */
export default function TestExecution() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [executions, setExecutions] = useState([]);
  const [testSuites, setTestSuites] = useState([]);

  // Detail modal state
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  const canExport = canPerform('export', 'test-assets');

  /**
   * Load test execution data from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const execData = getAll(entityTypes.TEST_EXECUTIONS);
      const suiteData = getAll(entityTypes.TEST_SUITES);
      setExecutions(Array.isArray(execData) ? execData : []);
      setTestSuites(Array.isArray(suiteData) ? suiteData : []);
    } catch (err) {
      console.error('[TestExecution] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, getAll, entityTypes]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Application filter options.
   */
  const applicationOptions = useMemo(() => {
    const apps = new Set();
    for (let i = 0; i < executions.length; i++) {
      if (executions[i].application) {
        apps.add(executions[i].application);
      }
    }
    return [...apps].sort().map((a) => ({ value: a, label: a }));
  }, [executions]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    const segments = new Set();
    for (let i = 0; i < executions.length; i++) {
      if (executions[i].segment) {
        segments.add(executions[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [executions]);

  /**
   * Environment filter options.
   */
  const environmentOptions = useMemo(() => {
    const envs = new Set();
    for (let i = 0; i < executions.length; i++) {
      if (executions[i].environment) {
        envs.add(executions[i].environment);
      }
    }
    return [...envs].sort().map((e) => ({ value: e, label: e }));
  }, [executions]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'result',
        label: 'Result',
        options: [
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
          { value: 'blocked', label: 'Blocked' },
          { value: 'skipped', label: 'Skipped' },
        ],
      },
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'completed', label: 'Completed' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'blocked', label: 'Blocked' },
          { value: 'skipped', label: 'Skipped' },
        ],
      },
      {
        key: 'environment',
        label: 'Environment',
        options: environmentOptions,
      },
    ];
  }, [environmentOptions]);

  /**
   * Filtered executions based on filter values and search.
   */
  const filteredExecutions = useMemo(() => {
    let result = [...executions];

    if (filterValues.segment) {
      result = result.filter((exec) => exec.segment === filterValues.segment);
    }

    if (filterValues.application) {
      result = result.filter((exec) => exec.application === filterValues.application);
    }

    if (filterValues.result) {
      result = result.filter((exec) => exec.result === filterValues.result);
    }

    if (filterValues.status) {
      result = result.filter((exec) => exec.status === filterValues.status);
    }

    if (filterValues.environment) {
      result = result.filter((exec) => exec.environment === filterValues.environment);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((exec) => {
        const title = exec.testCaseTitle ? exec.testCaseTitle.toLowerCase() : '';
        const app = exec.application ? exec.application.toLowerCase() : '';
        const seg = exec.segment ? exec.segment.toLowerCase() : '';
        const build = exec.buildNumber ? exec.buildNumber.toLowerCase() : '';
        const env = exec.environment ? exec.environment.toLowerCase() : '';
        const failureReason = exec.failureReason ? exec.failureReason.toLowerCase() : '';
        return (
          title.includes(queryLower) ||
          app.includes(queryLower) ||
          seg.includes(queryLower) ||
          build.includes(queryLower) ||
          env.includes(queryLower) ||
          failureReason.includes(queryLower)
        );
      });
    }

    // Sort by executedAt descending by default
    result.sort((a, b) => {
      const dateA = new Date(a.executedAt).getTime();
      const dateB = new Date(b.executedAt).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    return result;
  }, [executions, filterValues, searchValue]);

  /**
   * Summary metrics for the execution dashboard.
   */
  const summaryMetrics = useMemo(() => {
    const total = executions.length;
    const completed = executions.filter((e) => e.status === 'completed').length;
    const inProgress = executions.filter((e) => e.status === 'in_progress').length;
    const blocked = executions.filter((e) => e.status === 'blocked' || e.result === 'blocked').length;
    const skipped = executions.filter((e) => e.status === 'skipped' || e.result === 'skipped').length;

    const passed = executions.filter((e) => e.result === 'passed').length;
    const failed = executions.filter((e) => e.result === 'failed').length;

    const passRate = completed > 0
      ? Math.round((passed / completed) * 10000) / 100
      : 0;

    const failureRate = completed > 0
      ? Math.round((failed / completed) * 10000) / 100
      : 0;

    let totalDuration = 0;
    let durationCount = 0;
    for (let i = 0; i < executions.length; i++) {
      if (typeof executions[i].duration === 'number' && executions[i].duration > 0 && executions[i].status === 'completed') {
        totalDuration += executions[i].duration;
        durationCount += 1;
      }
    }
    const avgDuration = durationCount > 0 ? Math.round((totalDuration / durationCount) * 100) / 100 : 0;

    const withAIAnalysis = executions.filter(
      (e) => e.aiAnalysis !== null && e.aiAnalysis !== undefined && e.aiAnalysis !== '',
    ).length;

    const withRemediation = executions.filter(
      (e) => e.remediation !== null && e.remediation !== undefined && e.remediation !== '',
    ).length;

    const retries = executions.filter((e) => e.isRetry === true).length;

    const withEvidence = executions.filter(
      (e) => Array.isArray(e.evidence) && e.evidence.length > 0,
    ).length;

    return {
      total,
      completed,
      inProgress,
      blocked,
      skipped,
      passed,
      failed,
      passRate,
      failureRate,
      avgDuration,
      withAIAnalysis,
      withRemediation,
      retries,
      withEvidence,
    };
  }, [executions]);

  /**
   * Result distribution chart data.
   */
  const resultDistributionData = useMemo(() => {
    return [
      { label: 'Passed', value: summaryMetrics.passed },
      { label: 'Failed', value: summaryMetrics.failed },
      { label: 'Blocked', value: summaryMetrics.blocked },
      { label: 'Skipped', value: summaryMetrics.skipped },
      { label: 'In Progress', value: summaryMetrics.inProgress },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Execution by application chart data.
   */
  const executionByApplicationData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < executions.length; i++) {
      const app = executions[i].application || 'Unknown';
      counts[app] = (counts[app] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [executions]);

  /**
   * Execution by environment chart data.
   */
  const executionByEnvironmentData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < executions.length; i++) {
      const env = executions[i].environment || 'Unknown';
      counts[env] = (counts[env] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [executions]);

  /**
   * Pass rate by application chart data.
   */
  const passRateByApplicationData = useMemo(() => {
    const appStats = {};
    for (let i = 0; i < executions.length; i++) {
      const exec = executions[i];
      if (exec.status !== 'completed') continue;
      const app = exec.application || 'Unknown';
      if (!appStats[app]) {
        appStats[app] = { passed: 0, total: 0 };
      }
      appStats[app].total += 1;
      if (exec.result === 'passed') {
        appStats[app].passed += 1;
      }
    }
    return Object.keys(appStats)
      .map((key) => ({
        label: key,
        value: appStats[key].total > 0
          ? Math.round((appStats[key].passed / appStats[key].total) * 10000) / 100
          : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [executions]);

  /**
   * Execution trend data (by date).
   */
  const executionTrendData = useMemo(() => {
    const dateGroups = {};
    for (let i = 0; i < executions.length; i++) {
      const exec = executions[i];
      if (!exec.executedAt) continue;
      const dateKey = exec.executedAt.slice(0, 10);
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { total: 0, passed: 0, failed: 0 };
      }
      dateGroups[dateKey].total += 1;
      if (exec.result === 'passed') dateGroups[dateKey].passed += 1;
      if (exec.result === 'failed') dateGroups[dateKey].failed += 1;
    }

    const sortedDates = Object.keys(dateGroups).sort();
    return sortedDates.map((dateKey) => ({
      label: dateKey,
      value: dateGroups[dateKey].total,
    }));
  }, [executions]);

  /**
   * Pass rate trend data (by date).
   */
  const passRateTrendData = useMemo(() => {
    const dateGroups = {};
    for (let i = 0; i < executions.length; i++) {
      const exec = executions[i];
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
      return { label: dateKey, value: rate };
    });
  }, [executions]);

  /**
   * Failed executions for quick access.
   */
  const failedExecutions = useMemo(() => {
    return executions
      .filter((e) => e.result === 'failed')
      .sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [executions]);

  /**
   * Failed execution timeline entries.
   */
  const failedExecutionEntries = useMemo(() => {
    return failedExecutions.map((exec) => ({
      id: exec.id,
      title: exec.testCaseTitle || exec.id,
      description: exec.failureReason || 'Test failed. No failure reason provided.',
      timestamp: exec.executedAt,
      badge: <Badge status="failed" size="sm" />,
      metadata: [
        { label: 'Application', value: exec.application || '—' },
        { label: 'Environment', value: exec.environment || '—' },
        { label: 'Duration', value: typeof exec.duration === 'number' ? formatDuration(exec.duration) : '—' },
      ],
    }));
  }, [failedExecutions]);

  /**
   * Execution by segment chart data.
   */
  const executionBySegmentData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < executions.length; i++) {
      const seg = executions[i].segment || 'Unknown';
      counts[seg] = (counts[seg] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [executions]);

  /**
   * Duration sparkline data.
   */
  const durationSparklineData = useMemo(() => {
    const sorted = [...executions]
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

    return sorted.map((e) => e.duration);
  }, [executions]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleFilterChange = useCallback((filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilterValues({});
    setSearchValue('');
  }, []);

  /**
   * Handle row click to open execution detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedExecution(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedExecution(null);
    setDetailTab('overview');
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredExecutions.map((exec) => ({
      ID: exec.id || '',
      'Test Case': exec.testCaseTitle || '',
      Application: exec.application || '',
      Segment: exec.segment || '',
      Result: exec.result || '',
      Status: exec.status || '',
      Environment: exec.environment || '',
      'Duration (s)': typeof exec.duration === 'number' ? exec.duration : '',
      'Build Number': exec.buildNumber || '',
      'Executed By': exec.executedBy || '',
      'Executed At': exec.executedAt || '',
      'Failure Reason': exec.failureReason || '',
      'Is Retry': exec.isRetry === true ? 'Yes' : 'No',
    }));

    exportToCSV(exportData, 'test-executions');

    logAction(userId, 'Export Test Executions CSV', 'test-executions', 'bulk', `Exported ${exportData.length} test executions to CSV`);
  }, [canExport, filteredExecutions, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredExecutions.map((exec) => ({
      ID: exec.id || '',
      'Test Case': exec.testCaseTitle || '',
      Application: exec.application || '',
      Segment: exec.segment || '',
      Result: exec.result || '',
      Status: exec.status || '',
      Environment: exec.environment || '',
      'Duration (s)': typeof exec.duration === 'number' ? exec.duration : '',
      'Build Number': exec.buildNumber || '',
      'Executed By': exec.executedBy || '',
      'Executed At': exec.executedAt || '',
      'Failure Reason': exec.failureReason || '',
      'Is Retry': exec.isRetry === true ? 'Yes' : 'No',
    }));

    exportToExcel(exportData, 'test-executions');

    logAction(userId, 'Export Test Executions Excel', 'test-executions', 'bulk', `Exported ${exportData.length} test executions to Excel`);
  }, [canExport, filteredExecutions, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedExecution) return [];

    const evidenceCount = Array.isArray(selectedExecution.evidence) ? selectedExecution.evidence.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'analysis', label: 'AI Analysis' },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
    ];
  }, [selectedExecution]);

  if (isLoading && executions.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading test executions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="test-execution">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Test Execution</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Test execution metrics, trends, and health by application and segment
          </p>
        </div>
        <div className="flex items-center gap-1">
          {canExport && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCSV}
                ariaLabel="Export to CSV"
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportExcel}
                ariaLabel="Export to Excel"
              >
                Export Excel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <MetricCard
          label="Total Executions"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-executions"
        />
        <MetricCard
          label="Passed"
          value={summaryMetrics.passed}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-passed"
        />
        <MetricCard
          label="Failed"
          value={summaryMetrics.failed}
          status={summaryMetrics.failed > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed"
        />
        <MetricCard
          label="Pass Rate"
          value={summaryMetrics.passRate}
          unit="%"
          variant="compact"
          size="sm"
          testId="metric-pass-rate"
        />
        <MetricCard
          label="Failure Rate"
          value={summaryMetrics.failureRate}
          unit="%"
          status={summaryMetrics.failureRate > 10 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failure-rate"
        />
        <MetricCard
          label="Avg Duration"
          value={summaryMetrics.avgDuration}
          unit="s"
          sparklineData={durationSparklineData.length >= 2 ? durationSparklineData : undefined}
          variant="compact"
          size="sm"
          testId="metric-avg-duration"
        />
        <MetricCard
          label="Blocked"
          value={summaryMetrics.blocked}
          status={summaryMetrics.blocked > 0 ? 'blocked' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-blocked"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <MetricCard
          label="Completed"
          value={summaryMetrics.completed}
          status="completed"
          variant="compact"
          size="sm"
          testId="metric-completed"
        />
        <MetricCard
          label="In Progress"
          value={summaryMetrics.inProgress}
          status={summaryMetrics.inProgress > 0 ? 'in_progress' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-in-progress"
        />
        <MetricCard
          label="With AI Analysis"
          value={summaryMetrics.withAIAnalysis}
          variant="compact"
          size="sm"
          testId="metric-ai-analysis"
        />
        <MetricCard
          label="Retries"
          value={summaryMetrics.retries}
          status={summaryMetrics.retries > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-retries"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={resultDistributionData}
            title="Result Distribution"
            description="Execution outcomes"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6']}
            testId="chart-result-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={executionByApplicationData}
            title="Executions by Application"
            description="Test execution count per application"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-exec-by-application"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={executionByEnvironmentData}
            title="Executions by Environment"
            description="Test execution count per environment"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B']}
            testId="chart-exec-by-environment"
          />
        </Card>
      </div>

      {/* Trend Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {executionTrendData.length >= 2 && (
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="bar"
              data={executionTrendData}
              title="Execution Volume Trend"
              description="Total executions per day"
              size="md"
              showValues={false}
              showLabels={true}
              colors={['#024E38']}
              testId="chart-exec-trend"
            />
          </Card>
        )}
        {passRateTrendData.length >= 2 && (
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
              testId="chart-pass-rate-trend"
            />
          </Card>
        )}
      </div>

      {/* Pass Rate by Application & Segment Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {passRateByApplicationData.length > 0 && (
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="horizontal-bar"
              data={passRateByApplicationData}
              title="Pass Rate by Application"
              description="Test pass rate per application (%)"
              size="sm"
              showValues={true}
              showLabels={true}
              colors={['#78BE20']}
              testId="chart-pass-rate-by-app"
            />
          </Card>
        )}
        {executionBySegmentData.length > 0 && (
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="pie"
              data={executionBySegmentData}
              title="Executions by Segment"
              description="Test execution distribution by segment"
              size="sm"
              showValues={true}
              showLabels={true}
              testId="chart-exec-by-segment"
            />
          </Card>
        )}
      </div>

      {/* Recent Failed Executions */}
      {failedExecutionEntries.length > 0 && (
        <Card variant="base" padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Recent Failed Executions</h3>
          <Timeline
            entries={failedExecutionEntries}
            variant="base"
            size="sm"
            showTimestamps={true}
            testId="failed-executions-timeline"
          />
        </Card>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search executions..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="test-execution-filter-bar"
      />

      {/* Executions Data Table */}
      <DataTable
        columns={EXECUTION_TABLE_COLUMNS}
        data={filteredExecutions}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No test executions found"
        emptyMessage="No test executions match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Test executions table"
        testId="test-executions-table"
      />

      {/* Execution Detail Modal */}
      {selectedExecution && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedExecution.testCaseTitle || 'Execution Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Execution detail: ${selectedExecution.testCaseTitle || selectedExecution.id}`}
          testId="execution-detail-modal"
        >
          <div className="space-y-2">
            {/* Execution Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedExecution.result && (
                <Badge status={selectedExecution.result} size="md" />
              )}
              {selectedExecution.status && (
                <Badge status={selectedExecution.status} size="md" />
              )}
              {selectedExecution.application && (
                <Badge variant="neutral" size="md">{selectedExecution.application}</Badge>
              )}
              {selectedExecution.segment && (
                <Badge variant="neutral" size="md">{selectedExecution.segment}</Badge>
              )}
              {selectedExecution.environment && (
                <Badge variant="neutral" size="md">{selectedExecution.environment}</Badge>
              )}
              {selectedExecution.isRetry && (
                <Badge variant="warning" size="md">Retry</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="execution-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {/* Execution Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Execution ID:</span>{' '}
                    <span className="text-gray-800 font-mono">{selectedExecution.id || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Test Case ID:</span>{' '}
                    <span className="text-gray-800 font-mono">{selectedExecution.testCaseId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Test Suite ID:</span>{' '}
                    <span className="text-gray-800 font-mono">{selectedExecution.testSuiteId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Environment:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.environment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Result:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.result || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.status || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>{' '}
                    <span className="text-gray-800">{typeof selectedExecution.duration === 'number' ? formatDuration(selectedExecution.duration) : '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Build:</span>{' '}
                    <span className="text-gray-800 font-mono">{selectedExecution.buildNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Platform:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.browserOrPlatform || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Executed By:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.executedBy || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Executed At:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedExecution.executedAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Retry Count:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.retryCount || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Is Retry:</span>{' '}
                    <span className="text-gray-800">{selectedExecution.isRetry ? 'Yes' : 'No'}</span>
                  </div>
                  {selectedExecution.parentExecutionId && (
                    <div>
                      <span className="font-medium text-gray-600">Parent Execution:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedExecution.parentExecutionId}</span>
                    </div>
                  )}
                </div>

                {/* Failure Reason */}
                {selectedExecution.failureReason && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Failure Reason</h4>
                    <div className="px-1.5 py-1 bg-red-50 border border-red-200 rounded-card text-xs text-red-800 leading-relaxed">
                      {selectedExecution.failureReason}
                    </div>
                  </div>
                )}

                {/* Remediation */}
                {selectedExecution.remediation && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Remediation</h4>
                    <div className="px-1.5 py-1 bg-living-green-50 border border-living-green-200 rounded-card text-xs text-living-green-800 leading-relaxed">
                      {selectedExecution.remediation}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(selectedExecution.tags) && selectedExecution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedExecution.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  <MetricCard
                    label="Duration"
                    value={typeof selectedExecution.duration === 'number' ? selectedExecution.duration : '—'}
                    unit="s"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Result"
                    value={selectedExecution.result ? selectedExecution.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                    status={selectedExecution.result || 'unknown'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Evidence Items"
                    value={Array.isArray(selectedExecution.evidence) ? selectedExecution.evidence.length : 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Retry Count"
                    value={selectedExecution.retryCount || 0}
                    status={selectedExecution.retryCount > 0 ? 'warning' : 'healthy'}
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedExecution.created_at)}</div>
                  <div>Updated: {formatDate(selectedExecution.updated_at)}</div>
                </div>
              </div>
            )}

            {/* AI Analysis Tab */}
            {detailTab === 'analysis' && (
              <div className="space-y-2">
                {selectedExecution.aiAnalysis ? (
                  <Card variant="tinted" padding="md">
                    <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">AI Analysis</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedExecution.aiAnalysis}</p>
                  </Card>
                ) : (
                  <EmptyState
                    title="No AI analysis"
                    description="No AI analysis is available for this test execution."
                    variant="compact"
                  />
                )}

                {selectedExecution.remediation && (
                  <Card variant="base" padding="md">
                    <h4 className="text-xs font-semibold text-gray-800 mb-0.5">Remediation</h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{selectedExecution.remediation}</p>
                  </Card>
                )}

                {selectedExecution.failureReason && (
                  <Card variant="base" padding="md">
                    <h4 className="text-xs font-semibold text-gray-800 mb-0.5">Failure Reason</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedExecution.failureReason}</p>
                  </Card>
                )}

                {!selectedExecution.aiAnalysis && !selectedExecution.remediation && !selectedExecution.failureReason && (
                  <EmptyState
                    title="No analysis data"
                    description="No AI analysis, remediation, or failure information is available for this execution."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Evidence Tab */}
            {detailTab === 'evidence' && (
              <div className="space-y-2">
                {Array.isArray(selectedExecution.evidence) && selectedExecution.evidence.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Evidence"
                        value={selectedExecution.evidence.length}
                        variant="compact"
                        size="sm"
                      />
                      {(() => {
                        const typeCounts = {};
                        for (let i = 0; i < selectedExecution.evidence.length; i++) {
                          const type = selectedExecution.evidence[i].type || 'Other';
                          typeCounts[type] = (typeCounts[type] || 0) + 1;
                        }
                        const topType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
                        return (
                          <MetricCard
                            label="Most Common Type"
                            value={topType || '—'}
                            variant="compact"
                            size="sm"
                          />
                        );
                      })()}
                    </div>

                    <DataTable
                      columns={EVIDENCE_TABLE_COLUMNS}
                      data={selectedExecution.evidence}
                      rowKey="name"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No evidence"
                      emptyMessage="No evidence items available."
                      ariaLabel="Evidence table"
                      testId="evidence-table"
                    />

                    {/* Evidence type chart */}
                    <Card variant="base" padding="md">
                      <ChartPlaceholder
                        type="donut"
                        data={(() => {
                          const typeCounts = {};
                          for (let i = 0; i < selectedExecution.evidence.length; i++) {
                            const type = selectedExecution.evidence[i].type || 'Other';
                            typeCounts[type] = (typeCounts[type] || 0) + 1;
                          }
                          return Object.keys(typeCounts).map((key) => ({ label: key, value: typeCounts[key] }));
                        })()}
                        title="Evidence by Type"
                        description="Evidence items by type"
                        size="sm"
                        showValues={true}
                        showLabels={true}
                        testId="chart-evidence-types"
                      />
                    </Card>
                  </>
                ) : (
                  <EmptyState
                    title="No evidence"
                    description="No evidence items have been captured for this test execution."
                    variant="compact"
                  />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}