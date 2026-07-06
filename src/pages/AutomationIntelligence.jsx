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
import EmptyState from '../components/common/EmptyState.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Timeline from '../components/common/Timeline.jsx';
import Modal from '../components/common/Modal.jsx';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module AutomationIntelligence
 * Automation Intelligence page for eQIP Quality Intelligence.
 *
 * Displays automation metrics, coverage analysis, trends, health indicators,
 * and AI-driven recommendations for improving test automation across all
 * applications and segments. Data is filterable by segment, application,
 * automation status, and priority.
 *
 * Sections:
 * - Summary metrics (coverage, automated count, manual count, flaky rate, pass rate)
 * - Coverage by application chart
 * - Coverage by segment chart
 * - Automation status distribution chart
 * - Test suite automation health table
 * - Test case automation detail table
 * - Recommendations for automation improvement
 *
 * Uses MetricCard, FilterBar, DataTable, ChartPlaceholder, Card, Tabs.
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
 * Columns definition for the test suites automation health table.
 * @type {Array<object>}
 */
const SUITE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Test Suite',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
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
    key: 'totalCases',
    label: 'Total',
    sortable: true,
    align: 'center',
    width: '60px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-medium text-gray-700">{value}</span>;
    },
  },
  {
    key: 'automatedCount',
    label: 'Auto',
    sortable: true,
    align: 'center',
    width: '60px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'manualCount',
    label: 'Manual',
    sortable: true,
    align: 'center',
    width: '60px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'automationCoverage',
    label: 'Coverage',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value, row) => {
      const total = row.totalCases || 0;
      const automated = row.automatedCount || 0;
      const coverage = total > 0 ? Math.round((automated / total) * 10000) / 100 : 0;
      return <span className="text-xs text-gray-700">{coverage}%</span>;
    },
  },
  {
    key: 'passRate',
    label: 'Pass Rate',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{value}%</span>;
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
    width: '80px',
    align: 'center',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolvePriorityStatus(value)} size="sm">{value.toUpperCase()}</Badge>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
];

/**
 * Columns definition for the test cases automation detail table.
 * @type {Array<object>}
 */
const TEST_CASE_TABLE_COLUMNS = [
  {
    key: 'title',
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
    key: 'assetType',
    label: 'Type',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'automationStatus',
    label: 'Automation',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'automationFramework',
    label: 'Framework',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">—</span>;
      return <span className="text-xs text-gray-600">{value}</span>;
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
    width: '80px',
    align: 'center',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolvePriorityStatus(value)} size="sm">{value.toUpperCase()}</Badge>;
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
];

/**
 * Columns definition for the application automation coverage table.
 * @type {Array<object>}
 */
const APP_COVERAGE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Application',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'segment',
    label: 'Segment',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'automationCoverage',
    label: 'Automation Coverage',
    sortable: true,
    align: 'right',
    width: '150px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{value}%</span>;
    },
  },
  {
    key: 'testCoverage',
    label: 'Test Coverage',
    sortable: true,
    align: 'right',
    width: '120px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{value}%</span>;
    },
  },
  {
    key: 'qualityScore',
    label: 'Quality Score',
    sortable: true,
    align: 'center',
    width: '110px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-bold text-deep-forest-teal-800">{value}</span>;
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
];

/**
 * Automation Intelligence page component.
 *
 * @returns {React.ReactElement} The rendered AutomationIntelligence page.
 */
export default function AutomationIntelligence() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [applications, setApplications] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  // Detail modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const canExport = canPerform('export', 'test-assets');

  /**
   * Load all data from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const tcData = getAll(entityTypes.TEST_CASES);
      const tsData = getAll(entityTypes.TEST_SUITES);
      const appData = getAll(entityTypes.APPLICATIONS);
      const execData = getAll(entityTypes.TEST_EXECUTIONS);
      const schedData = getAll(entityTypes.SCHEDULES);
      const insightData = getAll(entityTypes.AI_INSIGHTS);

      setTestCases(Array.isArray(tcData) ? tcData : []);
      setTestSuites(Array.isArray(tsData) ? tsData : []);
      setApplications(Array.isArray(appData) ? appData : []);
      setTestExecutions(Array.isArray(execData) ? execData : []);
      setSchedules(Array.isArray(schedData) ? schedData : []);
      setAiInsights(Array.isArray(insightData) ? insightData : []);
    } catch (err) {
      console.error('[AutomationIntelligence] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, getAll, entityTypes]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    const segments = new Set();
    for (let i = 0; i < testCases.length; i++) {
      if (testCases[i].segment) {
        segments.add(testCases[i].segment);
      }
    }
    for (let i = 0; i < applications.length; i++) {
      if (applications[i].segment) {
        segments.add(applications[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [testCases, applications]);

  /**
   * Application filter options.
   */
  const applicationOptions = useMemo(() => {
    const apps = new Set();
    for (let i = 0; i < testCases.length; i++) {
      if (testCases[i].application) {
        apps.add(testCases[i].application);
      }
    }
    return [...apps].sort().map((a) => ({ value: a, label: a }));
  }, [testCases]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'automationStatus',
        label: 'Automation Status',
        options: [
          { value: 'automated', label: 'Automated' },
          { value: 'manual', label: 'Manual' },
          { value: 'in_development', label: 'In Development' },
          { value: 'not_applicable', label: 'Not Applicable' },
        ],
      },
      {
        key: 'priority',
        label: 'Priority',
        options: [
          { value: 'p1', label: 'P1 - Critical' },
          { value: 'p2', label: 'P2 - High' },
          { value: 'p3', label: 'P3 - Medium' },
          { value: 'p4', label: 'P4 - Low' },
        ],
      },
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'passed', label: 'Passed' },
          { value: 'failed', label: 'Failed' },
          { value: 'active', label: 'Active' },
          { value: 'in_progress', label: 'In Progress' },
        ],
      },
    ];
  }, []);

  /**
   * Filtered test cases based on filter values and search.
   */
  const filteredTestCases = useMemo(() => {
    let result = [...testCases];

    if (filterValues.segment) {
      result = result.filter((tc) => tc.segment === filterValues.segment);
    }
    if (filterValues.application) {
      result = result.filter((tc) => tc.application === filterValues.application);
    }
    if (filterValues.automationStatus) {
      result = result.filter((tc) => tc.automationStatus === filterValues.automationStatus);
    }
    if (filterValues.priority) {
      result = result.filter((tc) => tc.priority === filterValues.priority);
    }
    if (filterValues.status) {
      result = result.filter((tc) => tc.status === filterValues.status);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((tc) => {
        const title = tc.title ? tc.title.toLowerCase() : '';
        const app = tc.application ? tc.application.toLowerCase() : '';
        const seg = tc.segment ? tc.segment.toLowerCase() : '';
        const assetType = tc.assetType ? tc.assetType.toLowerCase() : '';
        const framework = tc.automationFramework ? tc.automationFramework.toLowerCase() : '';
        return (
          title.includes(queryLower) ||
          app.includes(queryLower) ||
          seg.includes(queryLower) ||
          assetType.includes(queryLower) ||
          framework.includes(queryLower)
        );
      });
    }

    return result;
  }, [testCases, filterValues, searchValue]);

  /**
   * Filtered test suites based on filter values and search.
   */
  const filteredTestSuites = useMemo(() => {
    let result = [...testSuites];

    if (filterValues.segment) {
      result = result.filter((ts) => ts.segment === filterValues.segment);
    }
    if (filterValues.application) {
      result = result.filter((ts) => ts.application === filterValues.application);
    }
    if (filterValues.priority) {
      result = result.filter((ts) => ts.priority === filterValues.priority);
    }
    if (filterValues.status) {
      result = result.filter((ts) => ts.status === filterValues.status);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((ts) => {
        const name = ts.name ? ts.name.toLowerCase() : '';
        const app = ts.application ? ts.application.toLowerCase() : '';
        const seg = ts.segment ? ts.segment.toLowerCase() : '';
        const type = ts.type ? ts.type.toLowerCase() : '';
        return (
          name.includes(queryLower) ||
          app.includes(queryLower) ||
          seg.includes(queryLower) ||
          type.includes(queryLower)
        );
      });
    }

    return result;
  }, [testSuites, filterValues, searchValue]);

  /**
   * Summary metrics for the automation intelligence dashboard.
   */
  const summaryMetrics = useMemo(() => {
    const totalCases = testCases.length;
    const automated = testCases.filter((tc) => tc.automationStatus === 'automated').length;
    const manual = testCases.filter((tc) => tc.automationStatus === 'manual').length;
    const inDevelopment = testCases.filter((tc) => tc.automationStatus === 'in_development').length;
    const notApplicable = testCases.filter((tc) => tc.automationStatus === 'not_applicable').length;

    const automationCoverage = totalCases > 0
      ? Math.round((automated / totalCases) * 10000) / 100
      : 0;

    const totalSuites = testSuites.length;
    let avgSuitePassRate = 0;
    if (totalSuites > 0) {
      let total = 0;
      for (let i = 0; i < testSuites.length; i++) {
        total += testSuites[i].passRate || 0;
      }
      avgSuitePassRate = Math.round((total / totalSuites) * 100) / 100;
    }

    const totalExecutions = testExecutions.length;
    const completedExecutions = testExecutions.filter((e) => e.status === 'completed').length;
    const passedExecutions = testExecutions.filter((e) => e.result === 'passed').length;
    const failedExecutions = testExecutions.filter((e) => e.result === 'failed').length;
    const executionPassRate = completedExecutions > 0
      ? Math.round((passedExecutions / completedExecutions) * 10000) / 100
      : 0;

    const retryExecutions = testExecutions.filter((e) => e.isRetry === true).length;
    const withAIAnalysis = testExecutions.filter(
      (e) => e.aiAnalysis !== null && e.aiAnalysis !== undefined && e.aiAnalysis !== '',
    ).length;

    // Frameworks used
    const frameworks = new Set();
    for (let i = 0; i < testCases.length; i++) {
      if (testCases[i].automationFramework) {
        frameworks.add(testCases[i].automationFramework);
      }
    }

    // Active schedules
    const activeSchedules = schedules.filter((s) => s.status === 'active').length;
    const pausedSchedules = schedules.filter((s) => s.status === 'paused').length;
    const disabledSchedules = schedules.filter((s) => s.status === 'disabled').length;
    const failedSchedules = schedules.filter((s) => s.lastRunStatus === 'failed').length;

    // Applications with zero automation
    const appsWithZeroAutomation = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage === 0,
    ).length;

    // Applications below target (80%)
    const appsBelowTarget = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage < 80 && app.automationCoverage > 0,
    ).length;

    // Applications at or above target
    const appsAboveTarget = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage >= 80,
    ).length;

    // Average automation coverage across applications
    let avgAppAutomation = 0;
    if (applications.length > 0) {
      let total = 0;
      let count = 0;
      for (let i = 0; i < applications.length; i++) {
        if (typeof applications[i].automationCoverage === 'number') {
          total += applications[i].automationCoverage;
          count += 1;
        }
      }
      avgAppAutomation = count > 0 ? Math.round((total / count) * 100) / 100 : 0;
    }

    return {
      totalCases,
      automated,
      manual,
      inDevelopment,
      notApplicable,
      automationCoverage,
      totalSuites,
      avgSuitePassRate,
      totalExecutions,
      completedExecutions,
      passedExecutions,
      failedExecutions,
      executionPassRate,
      retryExecutions,
      withAIAnalysis,
      frameworkCount: frameworks.size,
      frameworks: [...frameworks].sort(),
      activeSchedules,
      pausedSchedules,
      disabledSchedules,
      failedSchedules,
      totalSchedules: schedules.length,
      appsWithZeroAutomation,
      appsBelowTarget,
      appsAboveTarget,
      avgAppAutomation,
    };
  }, [testCases, testSuites, testExecutions, schedules, applications]);

  /**
   * Automation coverage by application chart data.
   */
  const coverageByApplicationData = useMemo(() => {
    return applications
      .filter((app) => typeof app.automationCoverage === 'number')
      .map((app) => ({
        label: app.name,
        value: app.automationCoverage,
      }))
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  /**
   * Automation coverage by segment chart data.
   */
  const coverageBySegmentData = useMemo(() => {
    const segmentStats = {};
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const segment = app.segment || 'Unknown';
      if (!segmentStats[segment]) {
        segmentStats[segment] = { total: 0, count: 0 };
      }
      if (typeof app.automationCoverage === 'number') {
        segmentStats[segment].total += app.automationCoverage;
        segmentStats[segment].count += 1;
      }
    }
    return Object.keys(segmentStats)
      .map((key) => ({
        label: key,
        value: segmentStats[key].count > 0
          ? Math.round((segmentStats[key].total / segmentStats[key].count) * 100) / 100
          : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  /**
   * Automation status distribution chart data.
   */
  const automationStatusDistributionData = useMemo(() => {
    return [
      { label: 'Automated', value: summaryMetrics.automated },
      { label: 'Manual', value: summaryMetrics.manual },
      { label: 'In Development', value: summaryMetrics.inDevelopment },
      { label: 'Not Applicable', value: summaryMetrics.notApplicable },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Framework distribution chart data.
   */
  const frameworkDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testCases.length; i++) {
      const framework = testCases[i].automationFramework || (testCases[i].automationStatus === 'manual' ? 'Manual' : 'None');
      counts[framework] = (counts[framework] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [testCases]);

  /**
   * Schedule status distribution chart data.
   */
  const scheduleStatusDistributionData = useMemo(() => {
    return [
      { label: 'Active', value: summaryMetrics.activeSchedules },
      { label: 'Paused', value: summaryMetrics.pausedSchedules },
      { label: 'Disabled', value: summaryMetrics.disabledSchedules },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Application coverage target comparison chart data.
   */
  const appCoverageTargetData = useMemo(() => {
    return [
      { label: 'Above 80%', value: summaryMetrics.appsAboveTarget },
      { label: 'Below 80%', value: summaryMetrics.appsBelowTarget },
      { label: 'Zero Coverage', value: summaryMetrics.appsWithZeroAutomation },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Execution pass rate sparkline data.
   */
  const passRateSparklineData = useMemo(() => {
    const sorted = [...testExecutions]
      .filter((e) => e.status === 'completed' && e.executedAt)
      .sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      });

    // Group by date and compute daily pass rate
    const dateGroups = {};
    for (let i = 0; i < sorted.length; i++) {
      const exec = sorted[i];
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
      return group.total > 0 ? Math.round((group.passed / group.total) * 100) : 0;
    });
  }, [testExecutions]);

  /**
   * Automation coverage trend data (from application release history).
   */
  const automationTrendData = useMemo(() => {
    // Simulate trend from application data
    const coverageValues = applications
      .filter((app) => typeof app.automationCoverage === 'number')
      .map((app) => app.automationCoverage)
      .sort((a, b) => a - b);

    if (coverageValues.length < 2) return [];

    return coverageValues.map((val, idx) => ({
      label: `App ${idx + 1}`,
      value: val,
    }));
  }, [applications]);

  /**
   * AI insights related to automation.
   */
  const automationInsights = useMemo(() => {
    return aiInsights.filter((insight) => {
      if (!insight) return false;
      const tags = Array.isArray(insight.tags) ? insight.tags : [];
      const query = insight.query ? insight.query.toLowerCase() : '';
      const summary = insight.result && insight.result.summary ? insight.result.summary.toLowerCase() : '';

      return (
        tags.includes('automation') ||
        tags.includes('test-automation') ||
        tags.includes('automation-coverage') ||
        query.includes('automation') ||
        query.includes('automate') ||
        summary.includes('automation') ||
        summary.includes('automate')
      );
    });
  }, [aiInsights]);

  /**
   * Automation insight timeline entries.
   */
  const automationInsightEntries = useMemo(() => {
    return automationInsights.slice(0, 10).map((insight) => ({
      id: insight.id,
      title: insight.query || insight.type || 'AI Insight',
      description: insight.result && insight.result.summary
        ? insight.result.summary.slice(0, 200) + (insight.result.summary.length > 200 ? '...' : '')
        : 'No summary available.',
      timestamp: insight.created_at,
      badge: insight.status ? <Badge status={insight.status} size="sm" /> : null,
      metadata: [
        { label: 'Type', value: insight.type ? insight.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—' },
        { label: 'Confidence', value: insight.result && typeof insight.result.confidence === 'number' ? `${Math.round(insight.result.confidence * 100)}%` : '—' },
      ],
    }));
  }, [automationInsights]);

  /**
   * Recommendations for automation improvement.
   */
  const automationRecommendations = useMemo(() => {
    const recommendations = [];

    // Applications with zero automation
    const zeroAutoApps = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage === 0,
    );
    for (let i = 0; i < zeroAutoApps.length; i++) {
      recommendations.push({
        priority: 'critical',
        area: `${zeroAutoApps[i].name} - Zero Automation`,
        current: '0%',
        target: '50%',
        action: `Create automated test suite for ${zeroAutoApps[i].name}. This application has no automated tests.`,
        impact: 'high',
      });
    }

    // Applications significantly below target
    const lowAutoApps = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage > 0 && app.automationCoverage < 50,
    );
    for (let i = 0; i < lowAutoApps.length; i++) {
      recommendations.push({
        priority: 'high',
        area: `${lowAutoApps[i].name} - Low Coverage`,
        current: `${lowAutoApps[i].automationCoverage}%`,
        target: '70%',
        action: `Increase automation coverage for ${lowAutoApps[i].name} from ${lowAutoApps[i].automationCoverage}% to at least 70%.`,
        impact: 'high',
      });
    }

    // Applications below target but making progress
    const belowTargetApps = applications.filter(
      (app) => typeof app.automationCoverage === 'number' && app.automationCoverage >= 50 && app.automationCoverage < 80,
    );
    for (let i = 0; i < belowTargetApps.length; i++) {
      recommendations.push({
        priority: 'medium',
        area: `${belowTargetApps[i].name} - Below Target`,
        current: `${belowTargetApps[i].automationCoverage}%`,
        target: '80%',
        action: `Continue increasing automation coverage for ${belowTargetApps[i].name} to meet the 80% target.`,
        impact: 'medium',
      });
    }

    // Failed schedules
    const failedScheds = schedules.filter((s) => s.lastRunStatus === 'failed');
    for (let i = 0; i < failedScheds.length; i++) {
      recommendations.push({
        priority: 'high',
        area: `${failedScheds[i].name} - Schedule Failure`,
        current: 'Failed',
        target: 'Passing',
        action: `Investigate and fix failing schedule "${failedScheds[i].name}" for ${failedScheds[i].application || 'unknown application'}.`,
        impact: 'high',
      });
    }

    // Paused/disabled schedules
    const inactiveScheds = schedules.filter((s) => s.status === 'paused' || s.status === 'disabled');
    if (inactiveScheds.length > 0) {
      recommendations.push({
        priority: 'medium',
        area: 'Inactive Schedules',
        current: `${inactiveScheds.length} paused/disabled`,
        target: 'All active',
        action: `Review and reactivate ${inactiveScheds.length} paused or disabled test execution schedule(s).`,
        impact: 'medium',
      });
    }

    // Manual test cases that could be automated
    const manualHighPriority = testCases.filter(
      (tc) => tc.automationStatus === 'manual' && (tc.priority === 'p1' || tc.priority === 'p2'),
    );
    if (manualHighPriority.length > 0) {
      recommendations.push({
        priority: 'high',
        area: 'High-Priority Manual Tests',
        current: `${manualHighPriority.length} manual P1/P2 tests`,
        target: 'Automated',
        action: `Automate ${manualHighPriority.length} high-priority (P1/P2) test cases that are currently manual.`,
        impact: 'high',
      });
    }

    return recommendations;
  }, [applications, schedules, testCases]);

  /**
   * Filtered applications for the coverage table.
   */
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (filterValues.segment) {
      result = result.filter((app) => app.segment === filterValues.segment);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((app) => {
        const name = app.name ? app.name.toLowerCase() : '';
        const segment = app.segment ? app.segment.toLowerCase() : '';
        return name.includes(queryLower) || segment.includes(queryLower);
      });
    }

    return result;
  }, [applications, filterValues, searchValue]);

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
   * Handle application row click to show detail.
   */
  const handleAppRowClick = useCallback((row) => {
    setSelectedApp(row);
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedApp(null);
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredTestCases.map((tc) => ({
      ID: tc.id || '',
      Title: tc.title || '',
      'Asset Type': tc.assetType || '',
      Application: tc.application || '',
      Segment: tc.segment || '',
      Priority: tc.priority || '',
      'Automation Status': tc.automationStatus || '',
      'Automation Framework': tc.automationFramework || '',
      Status: tc.status || '',
      'Approval Status': tc.approvalStatus || '',
    }));

    exportToCSV(exportData, 'automation-intelligence');

    logAction(userId, 'Export Automation Intelligence CSV', 'test-assets', 'bulk', `Exported ${exportData.length} test cases to CSV`);
  }, [canExport, filteredTestCases, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredTestCases.map((tc) => ({
      ID: tc.id || '',
      Title: tc.title || '',
      'Asset Type': tc.assetType || '',
      Application: tc.application || '',
      Segment: tc.segment || '',
      Priority: tc.priority || '',
      'Automation Status': tc.automationStatus || '',
      'Automation Framework': tc.automationFramework || '',
      Status: tc.status || '',
      'Approval Status': tc.approvalStatus || '',
    }));

    exportToExcel(exportData, 'automation-intelligence');

    logAction(userId, 'Export Automation Intelligence Excel', 'test-assets', 'bulk', `Exported ${exportData.length} test cases to Excel`);
  }, [canExport, filteredTestCases, userId]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    return [
      { key: 'overview', label: 'Overview' },
      { key: 'applications', label: 'Application Coverage', badge: String(applications.length) },
      { key: 'suites', label: 'Test Suites', badge: String(testSuites.length) },
      { key: 'test-cases', label: 'Test Cases', badge: String(testCases.length) },
      { key: 'schedules', label: 'Schedules', badge: String(schedules.length) },
      { key: 'recommendations', label: 'Recommendations', badge: automationRecommendations.length > 0 ? String(automationRecommendations.length) : undefined },
      { key: 'ai-insights', label: 'AI Insights', badge: automationInsights.length > 0 ? String(automationInsights.length) : undefined },
    ];
  }, [applications, testSuites, testCases, schedules, automationRecommendations, automationInsights]);

  /**
   * Selected application detail data.
   */
  const selectedAppDetail = useMemo(() => {
    if (!selectedApp) return null;

    const appTestCases = testCases.filter((tc) => tc.application === selectedApp.name);
    const appSuites = testSuites.filter((ts) => ts.application === selectedApp.name);
    const appExecutions = testExecutions.filter((exec) => exec.application === selectedApp.name);

    const totalCases = appTestCases.length;
    const automatedCases = appTestCases.filter((tc) => tc.automationStatus === 'automated').length;
    const manualCases = appTestCases.filter((tc) => tc.automationStatus === 'manual').length;
    const coverage = totalCases > 0 ? Math.round((automatedCases / totalCases) * 10000) / 100 : 0;

    const completedExecs = appExecutions.filter((e) => e.status === 'completed').length;
    const passedExecs = appExecutions.filter((e) => e.result === 'passed').length;
    const passRate = completedExecs > 0 ? Math.round((passedExecs / completedExecs) * 10000) / 100 : 0;

    const frameworksUsed = new Set();
    for (let i = 0; i < appTestCases.length; i++) {
      if (appTestCases[i].automationFramework) {
        frameworksUsed.add(appTestCases[i].automationFramework);
      }
    }

    return {
      testCases: appTestCases,
      suites: appSuites,
      executions: appExecutions,
      totalCases,
      automatedCases,
      manualCases,
      coverage,
      passRate,
      completedExecs,
      passedExecs,
      frameworks: [...frameworksUsed],
    };
  }, [selectedApp, testCases, testSuites, testExecutions]);

  if (isLoading && testCases.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading automation intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="automation-intelligence">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Automation Intelligence</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Automation metrics, coverage analysis, trends, and improvement recommendations
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
          label="Automation Coverage"
          value={summaryMetrics.automationCoverage}
          unit="%"
          target={80}
          status={summaryMetrics.automationCoverage >= 80 ? 'healthy' : summaryMetrics.automationCoverage >= 60 ? 'at_risk' : 'critical'}
          variant="compact"
          size="sm"
          sparklineData={passRateSparklineData.length >= 2 ? passRateSparklineData : undefined}
          testId="metric-automation-coverage"
        />
        <MetricCard
          label="Automated Tests"
          value={summaryMetrics.automated}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-automated"
        />
        <MetricCard
          label="Manual Tests"
          value={summaryMetrics.manual}
          variant="compact"
          size="sm"
          testId="metric-manual"
        />
        <MetricCard
          label="In Development"
          value={summaryMetrics.inDevelopment}
          status={summaryMetrics.inDevelopment > 0 ? 'in_progress' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-in-development"
        />
        <MetricCard
          label="Execution Pass Rate"
          value={summaryMetrics.executionPassRate}
          unit="%"
          variant="compact"
          size="sm"
          testId="metric-pass-rate"
        />
        <MetricCard
          label="Avg App Coverage"
          value={summaryMetrics.avgAppAutomation}
          unit="%"
          target={80}
          variant="compact"
          size="sm"
          testId="metric-avg-app-coverage"
        />
        <MetricCard
          label="Frameworks"
          value={summaryMetrics.frameworkCount}
          variant="compact"
          size="sm"
          testId="metric-frameworks"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <MetricCard
          label="Total Test Cases"
          value={summaryMetrics.totalCases}
          variant="compact"
          size="sm"
          testId="metric-total-cases"
        />
        <MetricCard
          label="Test Suites"
          value={summaryMetrics.totalSuites}
          variant="compact"
          size="sm"
          testId="metric-total-suites"
        />
        <MetricCard
          label="Active Schedules"
          value={summaryMetrics.activeSchedules}
          status="active"
          variant="compact"
          size="sm"
          testId="metric-active-schedules"
        />
        <MetricCard
          label="Failed Schedules"
          value={summaryMetrics.failedSchedules}
          status={summaryMetrics.failedSchedules > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed-schedules"
        />
        <MetricCard
          label="Apps Below Target"
          value={summaryMetrics.appsBelowTarget + summaryMetrics.appsWithZeroAutomation}
          status={summaryMetrics.appsBelowTarget + summaryMetrics.appsWithZeroAutomation > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-apps-below-target"
        />
        <MetricCard
          label="Recommendations"
          value={automationRecommendations.length}
          status={automationRecommendations.length > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-recommendations"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="underline"
        size="md"
        testId="automation-intelligence-tabs"
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={automationStatusDistributionData}
                title="Automation Status"
                description="Test cases by automation status"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#3B82F6', '#6B7280']}
                testId="chart-automation-status"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="horizontal-bar"
                data={coverageByApplicationData.slice(0, 10)}
                title="Coverage by Application"
                description="Automation coverage per application (%)"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#024E38']}
                testId="chart-coverage-by-app"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={coverageBySegmentData}
                title="Coverage by Segment"
                description="Average automation coverage per segment (%)"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20']}
                testId="chart-coverage-by-segment"
              />
            </Card>
          </div>

          {/* Second Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={frameworkDistributionData.slice(0, 8)}
                title="Framework Distribution"
                description="Test cases by automation framework"
                size="sm"
                showValues={true}
                showLabels={true}
                testId="chart-framework-distribution"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={appCoverageTargetData}
                title="Target Compliance"
                description="Applications vs 80% automation target"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#DC2626']}
                testId="chart-target-compliance"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={scheduleStatusDistributionData}
                title="Schedule Status"
                description="Test execution schedules by status"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#6B7280']}
                testId="chart-schedule-status"
              />
            </Card>
          </div>

          {/* Automation Coverage Trend */}
          {automationTrendData.length >= 2 && (
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={automationTrendData}
                title="Automation Coverage Across Applications"
                description="Coverage percentage per application (sorted ascending)"
                size="md"
                showValues={false}
                showLabels={true}
                colors={['#024E38']}
                testId="chart-automation-trend"
              />
            </Card>
          )}

          {/* Coverage Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Automation Coverage Progress</h3>
            <div className="space-y-0.5">
              <ProgressBar
                value={summaryMetrics.automationCoverage}
                max={100}
                size="md"
                variant="auto"
                showValue={true}
                label="Overall Automation Coverage"
                unit="%"
                thresholds={{ error: 50, warning: 80, success: 100 }}
                testId="progress-overall-coverage"
              />
              <ProgressBar
                value={summaryMetrics.avgAppAutomation}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Average Application Coverage"
                unit="%"
                thresholds={{ error: 50, warning: 80, success: 100 }}
                testId="progress-avg-app-coverage"
              />
              <ProgressBar
                value={summaryMetrics.executionPassRate}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Execution Pass Rate"
                unit="%"
                thresholds={{ error: 80, warning: 95, success: 100 }}
                testId="progress-pass-rate"
              />
              <ProgressBar
                value={summaryMetrics.avgSuitePassRate}
                max={100}
                size="sm"
                variant="auto"
                showValue={true}
                label="Average Suite Pass Rate"
                unit="%"
                thresholds={{ error: 80, warning: 95, success: 100 }}
                testId="progress-suite-pass-rate"
              />
            </div>
          </Card>

          {/* Frameworks Used */}
          {summaryMetrics.frameworks.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Automation Frameworks in Use</h3>
              <div className="flex flex-wrap gap-0.5">
                {summaryMetrics.frameworks.map((framework, idx) => (
                  <Badge key={idx} variant="neutral" size="md">{framework}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Top Recommendations Preview */}
          {automationRecommendations.length > 0 && (
            <Card variant="tinted" padding="md">
              <h3 className="text-sm font-semibold text-deep-forest-teal-800 mb-0.5">
                Top Automation Recommendations ({automationRecommendations.length})
              </h3>
              <ul className="list-disc list-inside space-y-[2px]">
                {automationRecommendations.slice(0, 5).map((rec, idx) => (
                  <li key={idx} className="text-xs text-gray-700">
                    <Badge
                      status={rec.priority === 'critical' ? 'critical' : rec.priority === 'high' ? 'high' : 'medium'}
                      size="sm"
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>{' '}
                    {rec.action}
                  </li>
                ))}
              </ul>
              {automationRecommendations.length > 5 && (
                <div className="mt-0.5">
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('recommendations')} ariaLabel="View all recommendations">
                    View all {automationRecommendations.length} recommendations →
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Application Coverage Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-2">
          {/* Filter Bar */}
          <FilterBar
            filters={[]}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search applications..."
            showSegmentFilter={true}
            segmentOptions={segmentOptions}
            showClearAll={true}
            onClearAll={handleClearAll}
            testId="automation-app-filter-bar"
          />

          {/* Application Coverage Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard label="Total Applications" value={applications.length} variant="compact" size="sm" />
            <MetricCard label="Above 80% Target" value={summaryMetrics.appsAboveTarget} status="passed" variant="compact" size="sm" />
            <MetricCard label="Below 80% Target" value={summaryMetrics.appsBelowTarget} status={summaryMetrics.appsBelowTarget > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Zero Coverage" value={summaryMetrics.appsWithZeroAutomation} status={summaryMetrics.appsWithZeroAutomation > 0 ? 'critical' : 'healthy'} variant="compact" size="sm" />
          </div>

          {/* Coverage Chart */}
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="horizontal-bar"
              data={coverageByApplicationData}
              title="Automation Coverage by Application"
              description="Automation coverage percentage per application"
              size="md"
              showValues={true}
              showLabels={true}
              colors={['#024E38']}
              testId="chart-app-coverage-detail"
            />
          </Card>

          {/* Application Coverage Table */}
          <DataTable
            columns={APP_COVERAGE_TABLE_COLUMNS}
            data={filteredApplications}
            rowKey="id"
            paginated={true}
            pageSize={25}
            striped={true}
            hoverable={true}
            compact={false}
            searchable={false}
            loading={isLoading}
            onRowClick={handleAppRowClick}
            emptyTitle="No applications found"
            emptyMessage="No applications match the current filters."
            ariaLabel="Application automation coverage table"
            testId="app-coverage-table"
          />
        </div>
      )}

      {/* Test Suites Tab */}
      {activeTab === 'suites' && (
        <div className="space-y-2">
          {/* Filter Bar */}
          <FilterBar
            filters={customFilters.filter((f) => f.key !== 'automationStatus')}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search test suites..."
            showSegmentFilter={true}
            segmentOptions={segmentOptions}
            showApplicationFilter={true}
            applicationOptions={applicationOptions}
            showClearAll={true}
            onClearAll={handleClearAll}
            testId="automation-suite-filter-bar"
          />

          {/* Suite Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard label="Total Suites" value={summaryMetrics.totalSuites} variant="compact" size="sm" />
            <MetricCard label="Avg Pass Rate" value={summaryMetrics.avgSuitePassRate} unit="%" variant="compact" size="sm" />
            <MetricCard
              label="Total Cases in Suites"
              value={testSuites.reduce((sum, ts) => sum + (ts.totalCases || 0), 0)}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Automated in Suites"
              value={testSuites.reduce((sum, ts) => sum + (ts.automatedCount || 0), 0)}
              status="passed"
              variant="compact"
              size="sm"
            />
          </div>

          {/* Test Suites Table */}
          <DataTable
            columns={SUITE_TABLE_COLUMNS}
            data={filteredTestSuites}
            rowKey="id"
            paginated={true}
            pageSize={25}
            striped={true}
            hoverable={true}
            compact={false}
            searchable={false}
            loading={isLoading}
            emptyTitle="No test suites found"
            emptyMessage="No test suites match the current filters."
            ariaLabel="Test suites automation health table"
            testId="suites-table"
          />
        </div>
      )}

      {/* Test Cases Tab */}
      {activeTab === 'test-cases' && (
        <div className="space-y-2">
          {/* Filter Bar */}
          <FilterBar
            filters={customFilters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            showSearch={true}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search test cases..."
            showSegmentFilter={true}
            segmentOptions={segmentOptions}
            showApplicationFilter={true}
            applicationOptions={applicationOptions}
            showClearAll={true}
            onClearAll={handleClearAll}
            testId="automation-tc-filter-bar"
          />

          {/* Test Case Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard label="Total Test Cases" value={filteredTestCases.length} variant="compact" size="sm" />
            <MetricCard
              label="Automated"
              value={filteredTestCases.filter((tc) => tc.automationStatus === 'automated').length}
              status="passed"
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Manual"
              value={filteredTestCases.filter((tc) => tc.automationStatus === 'manual').length}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Coverage"
              value={filteredTestCases.length > 0
                ? Math.round((filteredTestCases.filter((tc) => tc.automationStatus === 'automated').length / filteredTestCases.length) * 10000) / 100
                : 0}
              unit="%"
              variant="compact"
              size="sm"
            />
          </div>

          {/* Test Cases Table */}
          <DataTable
            columns={TEST_CASE_TABLE_COLUMNS}
            data={filteredTestCases}
            rowKey="id"
            paginated={true}
            pageSize={25}
            striped={true}
            hoverable={true}
            compact={false}
            searchable={false}
            loading={isLoading}
            emptyTitle="No test cases found"
            emptyMessage="No test cases match the current filters."
            ariaLabel="Test cases automation detail table"
            testId="test-cases-table"
          />
        </div>
      )}

      {/* Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-2">
          {/* Schedule Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard label="Total Schedules" value={summaryMetrics.totalSchedules} variant="compact" size="sm" />
            <MetricCard label="Active" value={summaryMetrics.activeSchedules} status="active" variant="compact" size="sm" />
            <MetricCard label="Paused" value={summaryMetrics.pausedSchedules} status={summaryMetrics.pausedSchedules > 0 ? 'warning' : 'healthy'} variant="compact" size="sm" />
            <MetricCard label="Failed Last Run" value={summaryMetrics.failedSchedules} status={summaryMetrics.failedSchedules > 0 ? 'failed' : 'healthy'} variant="compact" size="sm" />
          </div>

          {/* Schedule Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={scheduleStatusDistributionData}
                title="Schedule Status"
                description="Schedules by current status"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#F59E0B', '#6B7280']}
                testId="chart-schedule-status-tab"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={(() => {
                  const counts = {};
                  for (let i = 0; i < schedules.length; i++) {
                    const freq = schedules[i].frequency ? schedules[i].frequency.replace(/_/g, ' ') : 'Unknown';
                    counts[freq] = (counts[freq] || 0) + 1;
                  }
                  return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
                })()}
                title="Schedule Frequency"
                description="Schedules by execution frequency"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#024E38']}
                testId="chart-schedule-frequency"
              />
            </Card>
          </div>

          {/* Schedule List */}
          <div className="space-y-0.5">
            {schedules.length > 0 ? (
              schedules.map((sched) => (
                <Card key={sched.id} variant="base" padding="sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{sched.name}</span>
                      <Badge status={sched.status || 'unknown'} size="sm" />
                      <Badge variant="neutral" size="sm">{sched.frequency ? sched.frequency.replace(/_/g, ' ') : '—'}</Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {sched.lastRunStatus && <Badge status={sched.lastRunStatus} size="sm" />}
                      {sched.application && (
                        <span className="text-[10px] text-gray-400">{sched.application}</span>
                      )}
                    </div>
                  </div>
                  {sched.description && (
                    <p className="text-[10px] text-gray-500 mt-[2px]">{sched.description}</p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 mt-0.5 text-[10px] text-gray-400">
                    <div>Environment: {sched.environment || '—'}</div>
                    <div>Last Run: {formatDate(sched.lastRun)}</div>
                    <div>Next Run: {formatDate(sched.nextRun)}</div>
                    <div>Suite: {sched.testSuiteName || '—'}</div>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                title="No schedules"
                description="No test execution schedules are configured."
                variant="compact"
              />
            )}
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-2">
          {automationRecommendations.length > 0 ? (
            <>
              {/* Recommendation Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Recommendations"
                  value={automationRecommendations.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Critical/High"
                  value={automationRecommendations.filter((r) => r.priority === 'critical' || r.priority === 'high').length}
                  status={automationRecommendations.filter((r) => r.priority === 'critical' || r.priority === 'high').length > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Medium"
                  value={automationRecommendations.filter((r) => r.priority === 'medium').length}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Recommendations List */}
              <div className="space-y-0.5">
                {automationRecommendations.map((rec, idx) => (
                  <Card key={idx} variant="base" padding="md">
                    <div className="flex items-start gap-1">
                      <Badge
                        status={rec.priority === 'critical' ? 'critical' : rec.priority === 'high' ? 'high' : 'medium'}
                        size="md"
                      >
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-800">{rec.area}</h4>
                        <p className="text-xs text-gray-700 mt-[2px]">{rec.action}</p>
                        <div className="flex flex-wrap gap-1 mt-0.5 text-[10px] text-gray-500">
                          <span>Current: <span className="font-medium text-gray-700">{rec.current}</span></span>
                          <span>Target: <span className="font-medium text-gray-700">{rec.target}</span></span>
                          <span>Impact: <Badge status={rec.impact === 'high' ? 'high' : 'medium'} size="sm">{rec.impact}</Badge></span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No recommendations"
              description="All automation metrics are within acceptable thresholds. No improvement recommendations at this time."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-2">
          {automationInsights.length > 0 ? (
            <>
              {/* AI Insights Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Automation Insights"
                  value={automationInsights.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Completed"
                  value={automationInsights.filter((i) => i.status === 'completed').length}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Recommendations"
                  value={automationInsights.filter((i) => i.type === 'recommendation').length}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* AI Insights Timeline */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Automation-Related AI Insights</h3>
                <Timeline
                  entries={automationInsightEntries}
                  variant="base"
                  size="sm"
                  showTimestamps={true}
                  testId="automation-ai-insights-timeline"
                />
              </Card>

              {/* Detailed Insights */}
              {automationInsights.map((insight) => {
                if (!insight.result) return null;

                const hasRecommendations = Array.isArray(insight.result.recommendations) && insight.result.recommendations.length > 0;

                if (!hasRecommendations && !insight.result.summary) return null;

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
                      <p className="text-xs text-gray-600 leading-relaxed mb-0.5">{insight.result.summary.slice(0, 400)}{insight.result.summary.length > 400 ? '...' : ''}</p>
                    )}

                    {hasRecommendations && (
                      <div className="mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-600">Recommendations:</span>
                        <ul className="list-disc list-inside space-y-[1px] mt-[2px]">
                          {insight.result.recommendations.slice(0, 5).map((rec, idx) => (
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
              title="No automation AI insights"
              description="No AI insights related to test automation are available. Try asking EQIP about automation coverage or test automation priorities."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && selectedAppDetail && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={`${selectedApp.name} - Automation Detail`}
          size="lg"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Automation detail for ${selectedApp.name}`}
          testId="app-automation-detail-modal"
        >
          <div className="space-y-2">
            {/* App Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedApp.status && <Badge status={selectedApp.status} size="md" />}
              {selectedApp.riskLevel && <Badge status={selectedApp.riskLevel} size="md" />}
              {selectedApp.segment && <Badge variant="neutral" size="md">{selectedApp.segment}</Badge>}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              <MetricCard
                label="Automation Coverage"
                value={selectedApp.automationCoverage}
                unit="%"
                target={80}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Test Coverage"
                value={selectedApp.testCoverage}
                unit="%"
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Quality Score"
                value={selectedApp.qualityScore}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Defect Density"
                value={selectedApp.defectDensity}
                unit="defects/KLOC"
                variant="compact"
                size="sm"
              />
            </div>

            {/* Automation Breakdown */}
            <Card variant="base" padding="md">
              <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Automation Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Total Test Cases:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.totalCases}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Automated:</span>{' '}
                  <span className="text-living-green-600 font-medium">{selectedAppDetail.automatedCases}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Manual:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.manualCases}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Coverage:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.coverage}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Test Suites:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.suites.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Executions:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.executions.length}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Pass Rate:</span>{' '}
                  <span className="text-gray-800">{selectedAppDetail.passRate}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Team Size:</span>{' '}
                  <span className="text-gray-800">{selectedApp.teamSize || '—'}</span>
                </div>
              </div>
            </Card>

            {/* Coverage Progress */}
            <Card variant="base" padding="md">
              <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Coverage Progress</h4>
              <ProgressBar
                value={selectedAppDetail.coverage}
                max={100}
                size="md"
                variant="auto"
                showValue={true}
                label="Automation Coverage"
                unit="%"
                thresholds={{ error: 50, warning: 80, success: 100 }}
              />
            </Card>

            {/* Automation Distribution */}
            {selectedAppDetail.totalCases > 0 && (
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={[
                    { label: 'Automated', value: selectedAppDetail.automatedCases },
                    { label: 'Manual', value: selectedAppDetail.manualCases },
                    { label: 'Other', value: selectedAppDetail.totalCases - selectedAppDetail.automatedCases - selectedAppDetail.manualCases },
                  ].filter((d) => d.value > 0)}
                  title="Automation Distribution"
                  description="Automated vs manual test cases"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#F59E0B', '#6B7280']}
                  testId="chart-app-detail-automation"
                />
              </Card>
            )}

            {/* Frameworks */}
            {selectedAppDetail.frameworks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Frameworks Used</h4>
                <div className="flex flex-wrap gap-0.5">
                  {selectedAppDetail.frameworks.map((framework, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{framework}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Technology Stack */}
            {Array.isArray(selectedApp.technology) && selectedApp.technology.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Technology Stack</h4>
                <div className="flex flex-wrap gap-0.5">
                  {selectedApp.technology.map((tech, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}