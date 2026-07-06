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
 * @module TestExecutionDetail
 * Test Execution Detail page for eQIP Quality Intelligence.
 *
 * Displays all required fields for a test execution including:
 * - Execution metadata (ID, test case, suite, application, segment, environment, build, platform)
 * - Result and status with duration
 * - Evidence (logs, screenshots, video as simulated links)
 * - Failure reason with detailed display
 * - AI analysis with root cause and pattern detection
 * - Recommended remediation actions
 * - Retry information and parent execution linkage
 * - Tags and audit fields
 *
 * Uses Tabs, Card, Badge, Timeline, DataTable, MetricCard, ChartPlaceholder.
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (_err) {
    return '—';
  }
}

/**
 * Helper to format a short date string for display.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function formatShortDate(date) {
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
 * Evidence type icon SVG components.
 */
function ScreenshotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MetricsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}

/**
 * Get the icon component for an evidence type.
 * @param {string} type - The evidence type.
 * @returns {React.ReactElement} The icon component.
 */
function getEvidenceIcon(type) {
  if (!type) return <LogIcon />;
  const t = type.toLowerCase();
  if (t === 'screenshot') return <ScreenshotIcon />;
  if (t === 'video') return <VideoIcon />;
  if (t === 'log') return <LogIcon />;
  if (t === 'report') return <ReportIcon />;
  if (t === 'metrics') return <MetricsIcon />;
  if (t === 'chart') return <ChartIcon />;
  return <LogIcon />;
}

/**
 * Evidence table columns.
 * @type {Array<object>}
 */
const EVIDENCE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (value, row) => {
      if (!value) return '—';
      return (
        <div className="flex items-center gap-0.5">
          <span className="text-gray-400 shrink-0">{getEvidenceIcon(row.type)}</span>
          <span className="text-xs font-medium text-deep-forest-teal-800 truncate">{value}</span>
        </div>
      );
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge variant="neutral" size="sm">{value}</Badge>;
    },
  },
  {
    key: 'url',
    label: 'Location',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return (
        <span className="text-xs text-gray-500 truncate" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    key: 'capturedAt',
    label: 'Captured',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatShortDate(value)}</span>;
    },
  },
];

/**
 * Related executions table columns (for retry chain).
 * @type {Array<object>}
 */
const RELATED_EXECUTION_COLUMNS = [
  {
    key: 'id',
    label: 'Execution ID',
    sortable: true,
    width: '120px',
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
    key: 'duration',
    label: 'Duration',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{formatDuration(value)}</span>;
    },
  },
  {
    key: 'executedAt',
    label: 'Date',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatShortDate(value)}</span>;
    },
  },
  {
    key: 'isRetry',
    label: 'Retry',
    sortable: true,
    width: '60px',
    align: 'center',
    render: (value) => {
      if (value === true) return <Badge variant="warning" size="sm">Yes</Badge>;
      return <span className="text-xs text-gray-400">No</span>;
    },
  },
];

/**
 * Test Execution Detail page component.
 *
 * @returns {React.ReactElement} The rendered TestExecutionDetail page.
 */
export default function TestExecutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, getById, entityTypes } = useData();

  const [execution, setExecution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Related data
  const [relatedExecutions, setRelatedExecutions] = useState([]);
  const [testCase, setTestCase] = useState(null);
  const [testSuite, setTestSuite] = useState(null);

  /**
   * Load execution and related data.
   */
  const loadData = useCallback(() => {
    if (!isDataReady || !id) return;

    setIsLoading(true);

    try {
      const exec = getById(entityTypes.TEST_EXECUTIONS, id);

      if (!exec) {
        setExecution(null);
        setIsLoading(false);
        return;
      }

      setExecution(exec);

      // Load related test case
      if (exec.testCaseId) {
        const tc = getById(entityTypes.TEST_CASES, exec.testCaseId);
        setTestCase(tc || null);
      } else {
        setTestCase(null);
      }

      // Load related test suite
      if (exec.testSuiteId) {
        const ts = getById(entityTypes.TEST_SUITES, exec.testSuiteId);
        setTestSuite(ts || null);
      } else {
        setTestSuite(null);
      }

      // Load related executions (same test case or retry chain)
      const allExecutions = getAll(entityTypes.TEST_EXECUTIONS);
      const related = Array.isArray(allExecutions)
        ? allExecutions.filter((e) => {
            if (e.id === id) return false;
            // Same test case
            if (exec.testCaseId && e.testCaseId === exec.testCaseId) return true;
            // Retry chain
            if (exec.parentExecutionId && e.id === exec.parentExecutionId) return true;
            if (e.parentExecutionId === id) return true;
            return false;
          })
        : [];

      // Sort by executedAt descending
      related.sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      });

      setRelatedExecutions(related);
    } catch (err) {
      console.error('[TestExecutionDetail] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, id, getAll, getById, entityTypes]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Evidence type distribution data for chart.
   */
  const evidenceTypeDistributionData = useMemo(() => {
    if (!execution || !Array.isArray(execution.evidence) || execution.evidence.length === 0) return [];
    const counts = {};
    for (let i = 0; i < execution.evidence.length; i++) {
      const type = execution.evidence[i].type || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [execution]);

  /**
   * Related execution result distribution data for chart.
   */
  const relatedResultDistributionData = useMemo(() => {
    if (relatedExecutions.length === 0) return [];
    const counts = {};
    for (let i = 0; i < relatedExecutions.length; i++) {
      const result = relatedExecutions[i].result || 'unknown';
      counts[result] = (counts[result] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[key],
    }));
  }, [relatedExecutions]);

  /**
   * Duration trend data from related executions.
   */
  const durationTrendData = useMemo(() => {
    const allExecs = [execution, ...relatedExecutions].filter(
      (e) => e && e.status === 'completed' && typeof e.duration === 'number' && e.duration > 0 && e.executedAt,
    );

    allExecs.sort((a, b) => {
      const dateA = new Date(a.executedAt).getTime();
      const dateB = new Date(b.executedAt).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateA - dateB;
    });

    return allExecs.map((e) => ({
      label: e.id || formatShortDate(e.executedAt),
      value: e.duration,
    }));
  }, [execution, relatedExecutions]);

  /**
   * Related execution timeline entries.
   */
  const relatedExecutionEntries = useMemo(() => {
    return relatedExecutions.slice(0, 15).map((exec) => ({
      id: exec.id,
      title: exec.testCaseTitle || exec.id,
      description: exec.failureReason || (exec.result === 'passed' ? 'Test passed successfully.' : exec.result === 'failed' ? 'Test failed.' : `Status: ${exec.result || 'unknown'}`),
      timestamp: exec.executedAt,
      badge: exec.result ? <Badge status={exec.result} size="sm" /> : null,
      metadata: [
        { label: 'Environment', value: exec.environment || '—' },
        { label: 'Duration', value: typeof exec.duration === 'number' ? formatDuration(exec.duration) : '—' },
        { label: 'Build', value: exec.buildNumber || '—' },
      ],
    }));
  }, [relatedExecutions]);

  /**
   * Test case execution history entries (from the test case's executionHistory field).
   */
  const testCaseHistoryEntries = useMemo(() => {
    if (!testCase || !Array.isArray(testCase.executionHistory)) return [];
    return testCase.executionHistory.map((exec) => ({
      id: exec.executionId || `hist-${Math.random()}`,
      title: `${exec.executionId || 'Execution'} - ${exec.status || 'unknown'}`,
      description: `Environment: ${exec.environment || '—'} | Duration: ${typeof exec.duration === 'number' ? exec.duration + 's' : '—'} | By: ${exec.executedBy || '—'}`,
      timestamp: exec.date,
      badge: exec.status ? <Badge status={exec.status} size="sm" /> : null,
    }));
  }, [testCase]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    if (!execution) return [];

    const evidenceCount = Array.isArray(execution.evidence) ? execution.evidence.length : 0;
    const hasFailure = execution.failureReason && typeof execution.failureReason === 'string' && execution.failureReason.trim() !== '';
    const hasAIAnalysis = execution.aiAnalysis && typeof execution.aiAnalysis === 'string' && execution.aiAnalysis.trim() !== '';
    const hasRemediation = execution.remediation && typeof execution.remediation === 'string' && execution.remediation.trim() !== '';
    const hasRelated = relatedExecutions.length > 0;
    const hasTestCase = testCase !== null;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'failure', label: 'Failure Analysis', badge: hasFailure ? '!' : undefined },
      { key: 'ai-analysis', label: 'AI Analysis', badge: hasAIAnalysis ? '✓' : undefined },
      { key: 'remediation', label: 'Remediation', badge: hasRemediation ? '✓' : undefined },
      { key: 'related', label: 'Related Executions', badge: hasRelated ? String(relatedExecutions.length) : undefined },
      { key: 'test-case', label: 'Test Case', badge: hasTestCase ? '✓' : undefined },
    ];
  }, [execution, relatedExecutions, testCase]);

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    navigate('/test-executions');
  }, [navigate]);

  /**
   * Navigate to a related execution.
   */
  const handleNavigateToExecution = useCallback((row) => {
    if (row && row.id) {
      navigate(`/test-executions/${row.id}`);
    }
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
          <span className="text-sm text-gray-500 font-medium">Loading execution detail...</span>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="space-y-3" data-testid="test-execution-detail-not-found">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to test executions">
          ← Back to Test Execution
        </Button>
        <EmptyState
          title="Execution Not Found"
          description={`No test execution found with ID "${id}". It may have been removed or the ID is incorrect.`}
          actionLabel="Go to Test Execution"
          onAction={handleBack}
          variant="base"
        />
      </div>
    );
  }

  const hasFailureReason = execution.failureReason && typeof execution.failureReason === 'string' && execution.failureReason.trim() !== '';
  const hasAIAnalysis = execution.aiAnalysis && typeof execution.aiAnalysis === 'string' && execution.aiAnalysis.trim() !== '';
  const hasRemediation = execution.remediation && typeof execution.remediation === 'string' && execution.remediation.trim() !== '';
  const evidenceCount = Array.isArray(execution.evidence) ? execution.evidence.length : 0;

  return (
    <div className="space-y-3" data-testid="test-execution-detail">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to test executions">
        ← Back to Test Execution
      </Button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-forest-teal-800">
          {execution.testCaseTitle || 'Execution Detail'}
        </h1>
        <p className="text-xs text-gray-500 mt-[2px] font-mono">{execution.id}</p>
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {execution.result && (
            <Badge status={execution.result} size="md" />
          )}
          {execution.status && (
            <Badge status={execution.status} size="md" />
          )}
          {execution.application && (
            <Badge variant="neutral" size="md">{execution.application}</Badge>
          )}
          {execution.segment && (
            <Badge variant="neutral" size="md">{execution.segment}</Badge>
          )}
          {execution.environment && (
            <Badge variant="neutral" size="md">{execution.environment}</Badge>
          )}
          {execution.isRetry && (
            <Badge variant="warning" size="md">Retry</Badge>
          )}
          {hasFailureReason && (
            <Badge variant="error" size="md">Has Failure</Badge>
          )}
          {hasAIAnalysis && (
            <Badge variant="info" size="md">AI Analyzed</Badge>
          )}
          {hasRemediation && (
            <Badge variant="success" size="md">Remediation Available</Badge>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <MetricCard
          label="Result"
          value={execution.result ? execution.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
          status={execution.result || 'unknown'}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Duration"
          value={typeof execution.duration === 'number' ? execution.duration : '—'}
          unit="s"
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Evidence Items"
          value={evidenceCount}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Retry Count"
          value={execution.retryCount || 0}
          status={execution.retryCount > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Related Executions"
          value={relatedExecutions.length}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Status"
          value={execution.status ? execution.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
          status={execution.status || 'unknown'}
          variant="compact"
          size="sm"
        />
      </div>

      {/* Quick Summary Cards */}
      {(hasFailureReason || hasAIAnalysis || hasRemediation) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          {hasFailureReason && (
            <Card variant="base" padding="sm">
              <div className="flex items-start gap-0.5">
                <span className="text-red-500 shrink-0 mt-[1px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-red-700 uppercase tracking-wider">Failure Reason</p>
                  <p className="text-xs text-gray-700 leading-snug mt-[1px] line-clamp-3">{execution.failureReason}</p>
                </div>
              </div>
            </Card>
          )}
          {hasAIAnalysis && (
            <Card variant="base" padding="sm">
              <div className="flex items-start gap-0.5">
                <span className="text-blue-500 shrink-0 mt-[1px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">AI Analysis</p>
                  <p className="text-xs text-gray-700 leading-snug mt-[1px] line-clamp-3">{execution.aiAnalysis}</p>
                </div>
              </div>
            </Card>
          )}
          {hasRemediation && (
            <Card variant="base" padding="sm">
              <div className="flex items-start gap-0.5">
                <span className="text-living-green-600 shrink-0 mt-[1px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-living-green-700 uppercase tracking-wider">Remediation</p>
                  <p className="text-xs text-gray-700 leading-snug mt-[1px] line-clamp-3">{execution.remediation}</p>
                </div>
              </div>
            </Card>
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
        testId="test-execution-detail-tabs"
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {/* Execution Information */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Execution Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Execution ID:</span>{' '}
                <span className="text-gray-800 font-mono">{execution.id || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Test Case ID:</span>{' '}
                <span className="text-gray-800 font-mono">{execution.testCaseId || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Test Suite ID:</span>{' '}
                <span className="text-gray-800 font-mono">{execution.testSuiteId || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Application:</span>{' '}
                <span className="text-gray-800">{execution.application || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Segment:</span>{' '}
                <span className="text-gray-800">{execution.segment || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Environment:</span>{' '}
                <span className="text-gray-800">{execution.environment || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Result:</span>{' '}
                <span className="text-gray-800">{execution.result || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{' '}
                <span className="text-gray-800">{execution.status || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Duration:</span>{' '}
                <span className="text-gray-800">{typeof execution.duration === 'number' ? formatDuration(execution.duration) : '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Build:</span>{' '}
                <span className="text-gray-800 font-mono">{execution.buildNumber || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Platform:</span>{' '}
                <span className="text-gray-800">{execution.browserOrPlatform || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Executed By:</span>{' '}
                <span className="text-gray-800">{execution.executedBy || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Executed At:</span>{' '}
                <span className="text-gray-800">{formatDate(execution.executedAt)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Retry Count:</span>{' '}
                <span className="text-gray-800">{execution.retryCount || 0}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Is Retry:</span>{' '}
                <span className="text-gray-800">{execution.isRetry ? 'Yes' : 'No'}</span>
              </div>
              {execution.parentExecutionId && (
                <div>
                  <span className="font-medium text-gray-600">Parent Execution:</span>{' '}
                  <span className="text-gray-800 font-mono">{execution.parentExecutionId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {Array.isArray(execution.tags) && execution.tags.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Tags</h3>
              <div className="flex flex-wrap gap-0.5">
                {execution.tags.map((tag, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Failure Reason (if present) */}
          {hasFailureReason && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-red-700 mb-0.5">Failure Reason</h3>
              <div className="px-1.5 py-1 bg-red-50 border border-red-200 rounded-card text-xs text-red-800 leading-relaxed whitespace-pre-line">
                {execution.failureReason}
              </div>
            </Card>
          )}

          {/* AI Analysis (if present) */}
          {hasAIAnalysis && (
            <Card variant="tinted" padding="md">
              <h3 className="text-sm font-semibold text-deep-forest-teal-800 mb-0.5">AI Analysis</h3>
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{execution.aiAnalysis}</p>
            </Card>
          )}

          {/* Remediation (if present) */}
          {hasRemediation && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-living-green-700 mb-0.5">Recommended Remediation</h3>
              <div className="px-1.5 py-1 bg-living-green-50 border border-living-green-200 rounded-card text-xs text-living-green-800 leading-relaxed whitespace-pre-line">
                {execution.remediation}
              </div>
            </Card>
          )}

          {/* Evidence Summary */}
          {evidenceCount > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Evidence Summary</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-600">{evidenceCount} evidence item{evidenceCount !== 1 ? 's' : ''} captured</span>
                </div>
                {evidenceTypeDistributionData.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {evidenceTypeDistributionData.map((item, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">
                        {item.label}: {item.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Test Case & Suite Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {testCase && (
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Test Case</h3>
                <div className="space-y-0.5 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Title:</span>{' '}
                    <span className="text-gray-800">{testCase.title || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <span className="text-gray-800">{testCase.assetType || testCase.type || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>{' '}
                    {testCase.priority ? <Badge status={testCase.priority === 'p1' ? 'critical' : testCase.priority === 'p2' ? 'high' : testCase.priority === 'p3' ? 'medium' : 'low'} size="sm">{testCase.priority.toUpperCase()}</Badge> : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Automation:</span>{' '}
                    {testCase.automationStatus ? <Badge status={testCase.automationStatus} size="sm" /> : '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Approval:</span>{' '}
                    {testCase.approvalStatus ? <Badge status={testCase.approvalStatus} size="sm" /> : '—'}
                  </div>
                  {testCase.automationFramework && (
                    <div>
                      <span className="font-medium text-gray-600">Framework:</span>{' '}
                      <span className="text-gray-800">{testCase.automationFramework}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {testSuite && (
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Test Suite</h3>
                <div className="space-y-0.5 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>{' '}
                    <span className="text-gray-800">{testSuite.name || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <span className="text-gray-800">{testSuite.type || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Cases:</span>{' '}
                    <span className="text-gray-800">{testSuite.totalCases || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Pass Rate:</span>{' '}
                    <span className="text-gray-800">{testSuite.passRate !== null && testSuite.passRate !== undefined ? `${testSuite.passRate}%` : '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>{' '}
                    {testSuite.status ? <Badge status={testSuite.status} size="sm" /> : '—'}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Audit Fields */}
          <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
            <div>Created: {formatDate(execution.created_at)}</div>
            <div>Updated: {formatDate(execution.updated_at)}</div>
            {execution.created_by && <div>Created By: {execution.created_by}</div>}
            {execution.updated_by && <div>Updated By: {execution.updated_by}</div>}
          </div>
        </div>
      )}

      {/* Evidence Tab */}
      {activeTab === 'evidence' && (
        <div className="space-y-2">
          {Array.isArray(execution.evidence) && execution.evidence.length > 0 ? (
            <>
              {/* Evidence Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Total Evidence"
                  value={evidenceCount}
                  variant="compact"
                  size="sm"
                />
                {(() => {
                  const screenshots = execution.evidence.filter((e) => e.type === 'screenshot').length;
                  return (
                    <MetricCard
                      label="Screenshots"
                      value={screenshots}
                      variant="compact"
                      size="sm"
                    />
                  );
                })()}
                {(() => {
                  const logs = execution.evidence.filter((e) => e.type === 'log').length;
                  return (
                    <MetricCard
                      label="Logs"
                      value={logs}
                      variant="compact"
                      size="sm"
                    />
                  );
                })()}
                {(() => {
                  const other = execution.evidence.filter((e) => e.type !== 'screenshot' && e.type !== 'log').length;
                  return (
                    <MetricCard
                      label="Other"
                      value={other}
                      variant="compact"
                      size="sm"
                    />
                  );
                })()}
              </div>

              {/* Evidence Type Distribution Chart */}
              {evidenceTypeDistributionData.length > 1 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={evidenceTypeDistributionData}
                    title="Evidence by Type"
                    description="Distribution of evidence items by type"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    testId="chart-evidence-type-dist"
                  />
                </Card>
              )}

              {/* Evidence Table */}
              <DataTable
                columns={EVIDENCE_TABLE_COLUMNS}
                data={execution.evidence}
                rowKey="name"
                paginated={execution.evidence.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                emptyTitle="No evidence"
                emptyMessage="No evidence items available."
                ariaLabel="Evidence table"
                testId="evidence-table"
              />

              {/* Evidence Detail Cards */}
              <div className="space-y-0.5">
                {execution.evidence.map((ev, idx) => (
                  <Card key={ev.name || idx} variant="base" padding="sm">
                    <div className="flex items-start gap-1">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-500 shrink-0">
                        {getEvidenceIcon(ev.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-gray-900 truncate">{ev.name || 'Evidence'}</span>
                          <Badge variant="neutral" size="sm">{ev.type || '—'}</Badge>
                        </div>
                        {ev.url && (
                          <p className="text-[10px] text-gray-500 mt-[1px] truncate" title={ev.url}>
                            📎 {ev.url}
                          </p>
                        )}
                        {ev.capturedAt && (
                          <p className="text-[10px] text-gray-400 mt-[1px]">
                            Captured: {formatShortDate(ev.capturedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No evidence captured"
              description="No evidence items (logs, screenshots, videos, reports) have been captured for this test execution."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Failure Analysis Tab */}
      {activeTab === 'failure' && (
        <div className="space-y-2">
          {hasFailureReason ? (
            <>
              {/* Failure Status */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Result"
                  value={execution.result ? execution.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                  status={execution.result || 'unknown'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Duration"
                  value={typeof execution.duration === 'number' ? execution.duration : '—'}
                  unit="s"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Retry Count"
                  value={execution.retryCount || 0}
                  status={execution.retryCount > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Failure Reason */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-red-700 mb-0.5">Failure Reason</h3>
                <div className="px-1.5 py-1 bg-red-50 border border-red-200 rounded-card text-sm text-red-800 leading-relaxed whitespace-pre-line">
                  {execution.failureReason}
                </div>
              </Card>

              {/* Failure Context */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Failure Context</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Environment:</span>{' '}
                    <span className="text-gray-800">{execution.environment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Build:</span>{' '}
                    <span className="text-gray-800 font-mono">{execution.buildNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Platform:</span>{' '}
                    <span className="text-gray-800">{execution.browserOrPlatform || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Executed At:</span>{' '}
                    <span className="text-gray-800">{formatDate(execution.executedAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Executed By:</span>{' '}
                    <span className="text-gray-800">{execution.executedBy || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Is Retry:</span>{' '}
                    <span className="text-gray-800">{execution.isRetry ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </Card>

              {/* Related Evidence for Failure */}
              {Array.isArray(execution.evidence) && execution.evidence.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Related Evidence</h3>
                  <div className="space-y-0.5">
                    {execution.evidence.map((ev, idx) => (
                      <div
                        key={ev.name || idx}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-gray-400 shrink-0">{getEvidenceIcon(ev.type)}</span>
                          <span className="text-xs font-medium text-gray-800 truncate">{ev.name || 'Evidence'}</span>
                          <Badge variant="neutral" size="sm">{ev.type || '—'}</Badge>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">{formatShortDate(ev.capturedAt)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* AI Analysis Link */}
              {hasAIAnalysis && (
                <Card variant="tinted" padding="md">
                  <h3 className="text-sm font-semibold text-deep-forest-teal-800 mb-0.5">AI Root Cause Analysis Available</h3>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{execution.aiAnalysis}</p>
                  <div className="mt-0.5">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('ai-analysis')} ariaLabel="View full AI analysis">
                      View Full AI Analysis →
                    </Button>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No failure information"
              description={execution.result === 'passed'
                ? 'This test execution passed successfully. No failure information is available.'
                : 'No failure reason has been recorded for this test execution.'}
              variant="compact"
            />
          )}
        </div>
      )}

      {/* AI Analysis Tab */}
      {activeTab === 'ai-analysis' && (
        <div className="space-y-2">
          {hasAIAnalysis ? (
            <>
              {/* AI Analysis Header */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="AI Analysis"
                  value="Available"
                  status="info"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Result"
                  value={execution.result ? execution.result.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                  status={execution.result || 'unknown'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Remediation"
                  value={hasRemediation ? 'Available' : 'Not Available'}
                  status={hasRemediation ? 'success' : 'neutral'}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* AI Analysis Content */}
              <Card variant="tinted" padding="md">
                <h3 className="text-sm font-semibold text-deep-forest-teal-800 mb-0.5">AI Root Cause Analysis</h3>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {execution.aiAnalysis}
                </div>
              </Card>

              {/* Failure Reason for Context */}
              {hasFailureReason && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Original Failure Reason</h3>
                  <div className="px-1.5 py-1 bg-red-50 border border-red-200 rounded-card text-xs text-red-800 leading-relaxed whitespace-pre-line">
                    {execution.failureReason}
                  </div>
                </Card>
              )}

              {/* Remediation Link */}
              {hasRemediation && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-living-green-700 mb-0.5">Recommended Remediation</h3>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">{execution.remediation}</p>
                  <div className="mt-0.5">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('remediation')} ariaLabel="View full remediation">
                      View Full Remediation →
                    </Button>
                  </div>
                </Card>
              )}

              {/* Analysis Metadata */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Analysis Context</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Test Case:</span>{' '}
                    <span className="text-gray-800">{execution.testCaseTitle || execution.testCaseId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{execution.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Environment:</span>{' '}
                    <span className="text-gray-800">{execution.environment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Build:</span>{' '}
                    <span className="text-gray-800 font-mono">{execution.buildNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Executed At:</span>{' '}
                    <span className="text-gray-800">{formatDate(execution.executedAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>{' '}
                    <span className="text-gray-800">{typeof execution.duration === 'number' ? formatDuration(execution.duration) : '—'}</span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              title="No AI analysis available"
              description="No AI-powered root cause analysis has been generated for this test execution. AI analysis is typically available for failed executions with sufficient context."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Remediation Tab */}
      {activeTab === 'remediation' && (
        <div className="space-y-2">
          {hasRemediation ? (
            <>
              {/* Remediation Status */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Remediation"
                  value="Available"
                  status="success"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="AI Analysis"
                  value={hasAIAnalysis ? 'Available' : 'Not Available'}
                  status={hasAIAnalysis ? 'info' : 'neutral'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Evidence Items"
                  value={evidenceCount}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Remediation Content */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-living-green-700 mb-0.5">Recommended Remediation</h3>
                <div className="px-1.5 py-1 bg-living-green-50 border border-living-green-200 rounded-card text-sm text-living-green-800 leading-relaxed whitespace-pre-line">
                  {execution.remediation}
                </div>
              </Card>

              {/* Root Cause (from AI Analysis) */}
              {hasAIAnalysis && (
                <Card variant="tinted" padding="md">
                  <h3 className="text-sm font-semibold text-deep-forest-teal-800 mb-0.5">Root Cause (AI Analysis)</h3>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{execution.aiAnalysis}</p>
                </Card>
              )}

              {/* Original Failure */}
              {hasFailureReason && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Original Failure</h3>
                  <div className="px-1.5 py-1 bg-red-50 border border-red-200 rounded-card text-xs text-red-800 leading-relaxed whitespace-pre-line">
                    {execution.failureReason}
                  </div>
                </Card>
              )}

              {/* Remediation Context */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Remediation Context</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Test Case:</span>{' '}
                    <span className="text-gray-800">{execution.testCaseTitle || execution.testCaseId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{execution.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{execution.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Environment:</span>{' '}
                    <span className="text-gray-800">{execution.environment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Build:</span>{' '}
                    <span className="text-gray-800 font-mono">{execution.buildNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Retry Count:</span>{' '}
                    <span className="text-gray-800">{execution.retryCount || 0}</span>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              title="No remediation available"
              description="No recommended remediation actions have been generated for this test execution. Remediation is typically provided alongside AI analysis for failed executions."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Related Executions Tab */}
      {activeTab === 'related' && (
        <div className="space-y-2">
          {relatedExecutions.length > 0 ? (
            <>
              {/* Related Execution Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Related Executions"
                  value={relatedExecutions.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Passed"
                  value={relatedExecutions.filter((e) => e.result === 'passed').length}
                  status="passed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Failed"
                  value={relatedExecutions.filter((e) => e.result === 'failed').length}
                  status={relatedExecutions.filter((e) => e.result === 'failed').length > 0 ? 'failed' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Retries"
                  value={relatedExecutions.filter((e) => e.isRetry === true).length}
                  status={relatedExecutions.filter((e) => e.isRetry === true).length > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Result Distribution Chart */}
              {relatedResultDistributionData.length > 0 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={relatedResultDistributionData}
                    title="Related Execution Results"
                    description="Result distribution across related executions"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6']}
                    testId="chart-related-results"
                  />
                </Card>
              )}

              {/* Duration Trend Chart */}
              {durationTrendData.length >= 2 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="line"
                    data={durationTrendData}
                    title="Execution Duration Trend"
                    description="Duration across related executions (seconds)"
                    size="sm"
                    showValues={false}
                    showLabels={true}
                    showDots={true}
                    colors={['#3B82F6']}
                    testId="chart-duration-trend"
                  />
                </Card>
              )}

              {/* Related Executions Table */}
              <DataTable
                columns={RELATED_EXECUTION_COLUMNS}
                data={relatedExecutions}
                rowKey="id"
                paginated={relatedExecutions.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                onRowClick={handleNavigateToExecution}
                emptyTitle="No related executions"
                emptyMessage="No related executions found."
                ariaLabel="Related executions table"
                testId="related-executions-table"
              />

              {/* Related Execution Timeline */}
              {relatedExecutionEntries.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Execution History Timeline</h3>
                  <Timeline
                    entries={relatedExecutionEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="related-execution-timeline"
                  />
                </Card>
              )}

              {/* Retry Chain */}
              {(execution.parentExecutionId || relatedExecutions.some((e) => e.parentExecutionId === id || e.isRetry)) && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Retry Chain</h3>
                  <div className="space-y-0.5">
                    {execution.parentExecutionId && (
                      <div className="flex items-center gap-0.5 py-0.5 px-1 border border-gray-100 rounded-standard">
                        <span className="text-xs text-gray-500">Parent:</span>
                        <span className="text-xs font-mono text-deep-forest-teal-700">{execution.parentExecutionId}</span>
                        <Badge variant="neutral" size="sm">Original</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-0.5 py-0.5 px-1 border border-deep-forest-teal-200 bg-deep-forest-teal-50/30 rounded-standard">
                      <span className="text-xs text-gray-500">Current:</span>
                      <span className="text-xs font-mono text-deep-forest-teal-700 font-bold">{execution.id}</span>
                      {execution.isRetry && <Badge variant="warning" size="sm">Retry</Badge>}
                      {execution.result && <Badge status={execution.result} size="sm" />}
                    </div>
                    {relatedExecutions
                      .filter((e) => e.parentExecutionId === id)
                      .map((retryExec) => (
                        <div key={retryExec.id} className="flex items-center gap-0.5 py-0.5 px-1 border border-gray-100 rounded-standard">
                          <span className="text-xs text-gray-500">Retry:</span>
                          <span className="text-xs font-mono text-deep-forest-teal-700">{retryExec.id}</span>
                          <Badge variant="warning" size="sm">Retry</Badge>
                          {retryExec.result && <Badge status={retryExec.result} size="sm" />}
                        </div>
                      ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <EmptyState
              title="No related executions"
              description="No other executions are related to this test execution. Related executions include other runs of the same test case and retry attempts."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Test Case Tab */}
      {activeTab === 'test-case' && (
        <div className="space-y-2">
          {testCase ? (
            <>
              {/* Test Case Info */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Test Case Details</h3>
                <div className="space-y-1">
                  {testCase.title && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Title</h4>
                      <p className="text-sm text-gray-800 font-medium">{testCase.title}</p>
                    </div>
                  )}
                  {testCase.description && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">{testCase.description}</p>
                    </div>
                  )}
                  {testCase.expectedResults && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Expected Results</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">{testCase.expectedResults}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Test Case Metadata */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Test Case Metadata</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">ID:</span>{' '}
                    <span className="text-gray-800 font-mono">{testCase.id || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Type:</span>{' '}
                    <span className="text-gray-800">{testCase.assetType || testCase.type || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{testCase.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{testCase.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Priority:</span>{' '}
                    <span className="text-gray-800">{testCase.priority ? testCase.priority.toUpperCase() : '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Severity:</span>{' '}
                    <span className="text-gray-800">{testCase.severity || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Automation:</span>{' '}
                    <span className="text-gray-800">{testCase.automationStatus || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Framework:</span>{' '}
                    <span className="text-gray-800">{testCase.automationFramework || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Approval:</span>{' '}
                    <span className="text-gray-800">{testCase.approvalStatus || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Version:</span>{' '}
                    <span className="text-gray-800">v{testCase.version || 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Suite:</span>{' '}
                    <span className="text-gray-800">{testCase.suiteId || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Est. Duration:</span>{' '}
                    <span className="text-gray-800">{testCase.estimatedDuration ? `${testCase.estimatedDuration}s` : '—'}</span>
                  </div>
                </div>
              </Card>

              {/* Test Case Steps */}
              {Array.isArray(testCase.steps) && testCase.steps.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Test Steps</h3>
                  <div className="space-y-0.5">
                    {testCase.steps.map((step, idx) => (
                      <div
                        key={step.stepNumber || idx}
                        className="flex items-start gap-1 py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center justify-center w-3 h-3 rounded-full bg-deep-forest-teal-50 text-deep-forest-teal-700 shrink-0 text-xs font-bold">
                          {step.stepNumber || idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">{step.action || '—'}</p>
                          <p className="text-[10px] text-gray-500 mt-[1px]">
                            Expected: {step.expectedResult || '—'}
                          </p>
                          {step.status && (
                            <div className="mt-[2px]">
                              <Badge status={step.status} size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Test Case Preconditions */}
              {Array.isArray(testCase.preconditions) && testCase.preconditions.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Preconditions</h3>
                  <ul className="list-disc list-inside space-y-[2px]">
                    {testCase.preconditions.map((pc, idx) => (
                      <li key={idx} className="text-xs text-gray-700">{pc}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Test Case Coverage */}
              {testCase.coverage && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Coverage</h3>
                  <div className="space-y-0.5">
                    {testCase.coverage.coveragePercentage !== undefined && (
                      <ProgressBar
                        value={testCase.coverage.coveragePercentage || 0}
                        max={100}
                        size="sm"
                        variant="auto"
                        showValue={true}
                        label="Coverage Percentage"
                        unit="%"
                        thresholds={{ error: 60, warning: 85, success: 100 }}
                      />
                    )}
                    {Array.isArray(testCase.coverage.requirements) && testCase.coverage.requirements.length > 0 && (
                      <div className="mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-600">Requirements:</span>
                        <div className="flex flex-wrap gap-0.5 mt-[2px]">
                          {testCase.coverage.requirements.map((req, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{req}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {Array.isArray(testCase.coverage.features) && testCase.coverage.features.length > 0 && (
                      <div className="mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-600">Features:</span>
                        <div className="flex flex-wrap gap-0.5 mt-[2px]">
                          {testCase.coverage.features.map((feat, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{feat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Test Case Linked Defects */}
              {Array.isArray(testCase.defectsLinked) && testCase.defectsLinked.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Linked Defects</h3>
                  <div className="flex flex-wrap gap-0.5">
                    {testCase.defectsLinked.map((defect, idx) => (
                      <Badge key={idx} variant="error" size="sm">{defect}</Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Test Case Execution History */}
              {testCaseHistoryEntries.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Test Case Execution History</h3>
                  <Timeline
                    entries={testCaseHistoryEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="test-case-history-timeline"
                  />
                </Card>
              )}

              {/* Test Case Tags */}
              {Array.isArray(testCase.tags) && testCase.tags.length > 0 && (
                <div className="flex flex-wrap gap-0.5">
                  {testCase.tags.map((tag, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                  ))}
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="Test case not found"
              description={execution.testCaseId
                ? `The test case "${execution.testCaseId}" associated with this execution could not be found.`
                : 'No test case is associated with this execution.'}
              variant="compact"
            />
          )}
        </div>
      )}
    </div>
  );
}