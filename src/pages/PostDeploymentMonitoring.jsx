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
 * @module PostDeploymentMonitoring
 * Post-Deployment Monitoring page for eQIP Quality Intelligence.
 *
 * Displays post-deployment monitoring data with all specified fields including
 * deployment status, incident tracking, rollback status, performance metrics,
 * health checks, verification tests, and feedback loop links. Links outcomes
 * back to releases and testing activity.
 *
 * Sections:
 * - Summary metrics (total deployments, healthy, degraded, rolled back, incidents, rollback rate)
 * - Status distribution chart
 * - Deployment type distribution chart
 * - Segment distribution chart
 * - Incident severity distribution chart
 * - Post-deployment data table with filtering and search
 * - Detail modal with overview, performance, health checks, verification tests,
 *   incidents, rollback details, feedback loops, and notifications tabs
 *
 * Uses DataTable, FilterBar, MetricCard, ChartPlaceholder, Card, Tabs, Timeline, Modal.
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
 * Helper to format a date-time string for display.
 * @param {string|Date} date - The date to format.
 * @returns {string} The formatted date-time string.
 */
function formatDateTime(date) {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (_err) {
    return '—';
  }
}

/**
 * Helper to format duration in minutes to a human-readable string.
 * @param {number} minutes - Duration in minutes.
 * @returns {string} Formatted duration string.
 */
function formatDurationMinutes(minutes) {
  if (minutes === null || minutes === undefined || typeof minutes !== 'number') return '—';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

/**
 * Resolve deployment status to a badge status string.
 * @param {string} status - The deployment status.
 * @returns {string} The badge status string.
 */
function resolveDeploymentStatus(status) {
  if (!status) return 'unknown';
  const statusMap = {
    healthy: 'passed',
    degraded: 'warning',
    rolled_back: 'failed',
    monitoring: 'in_progress',
  };
  return statusMap[status] || status;
}

/**
 * Resolve performance metric status to a badge status string.
 * @param {string} status - The performance metric status.
 * @returns {string} The badge status string.
 */
function resolvePerfStatus(status) {
  if (!status) return 'unknown';
  if (status === 'healthy') return 'passed';
  if (status === 'warning') return 'warning';
  if (status === 'critical') return 'failed';
  if (status === 'rolled_back') return 'neutral';
  return status;
}

/**
 * Status filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'rolled_back', label: 'Rolled Back' },
  { value: 'monitoring', label: 'Monitoring' },
];

/**
 * Deployment type filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const DEPLOYMENT_TYPE_OPTIONS = [
  { value: 'rolling', label: 'Rolling' },
  { value: 'blue_green', label: 'Blue/Green' },
  { value: 'canary', label: 'Canary' },
];

/**
 * Rollback status filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const ROLLBACK_STATUS_OPTIONS = [
  { value: 'not_required', label: 'Not Required' },
  { value: 'completed', label: 'Completed' },
  { value: 'in_progress', label: 'In Progress' },
];

/**
 * Columns definition for the post-deployment data table.
 * @type {Array<object>}
 */
const POST_DEPLOYMENT_TABLE_COLUMNS = [
  {
    key: 'applicationName',
    label: 'Application',
    sortable: true,
    width: '160px',
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'version',
    label: 'Version',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-600">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveDeploymentStatus(value)} size="sm">{value.replace(/_/g, ' ')}</Badge>;
    },
  },
  {
    key: 'deploymentType',
    label: 'Type',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value.replace(/_/g, ' ')}</span>;
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
    key: 'incidentCount',
    label: 'Incidents',
    sortable: true,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      if (value === 0) return <span className="text-xs text-gray-400">0</span>;
      return <Badge variant="error" size="sm">{value}</Badge>;
    },
  },
  {
    key: 'rollbackStatus',
    label: 'Rollback',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      const statusMap = {
        not_required: 'neutral',
        completed: 'failed',
        in_progress: 'warning',
      };
      return <Badge status={statusMap[value] || 'neutral'} size="sm">{value.replace(/_/g, ' ')}</Badge>;
    },
  },
  {
    key: 'deployedAt',
    label: 'Deployed',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'deployedBy',
    label: 'Deployed By',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'releaseId',
    label: 'Release',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-deep-forest-teal-700">{value}</span>;
    },
  },
];

/**
 * Health check table columns for the detail modal.
 * @type {Array<object>}
 */
const HEALTH_CHECK_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Check',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value === 'passed' ? 'passed' : value === 'warning' ? 'warning' : value === 'failed' ? 'failed' : 'unknown'} size="sm" />;
    },
  },
  {
    key: 'responseTimeMs',
    label: 'Response',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined || value === 0) return '—';
      return <span className="text-xs text-gray-600">{value}ms</span>;
    },
  },
  {
    key: 'lastChecked',
    label: 'Last Checked',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Verification test table columns for the detail modal.
 * @type {Array<object>}
 */
const VERIFICATION_TEST_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Test',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '90px',
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
      return <span className="text-xs text-gray-600">{value}s</span>;
    },
  },
  {
    key: 'executedAt',
    label: 'Executed',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Incident table columns for the detail modal.
 * @type {Array<object>}
 */
const INCIDENT_TABLE_COLUMNS = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
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
    key: 'impactedUsers',
    label: 'Impacted',
    sortable: true,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'resolutionTimeMinutes',
    label: 'Resolution',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return <span className="text-xs text-gray-400 italic">Open</span>;
      return <span className="text-xs text-gray-600">{formatDurationMinutes(value)}</span>;
    },
  },
  {
    key: 'reportedAt',
    label: 'Reported',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Feedback loop table columns for the detail modal.
 * @type {Array<object>}
 */
const FEEDBACK_LOOP_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '140px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'url',
    label: 'URL',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500 truncate" title={value}>{value}</span>;
    },
  },
];

/**
 * Notification table columns for the detail modal.
 * @type {Array<object>}
 */
const NOTIFICATION_TABLE_COLUMNS = [
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-700">{value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>;
    },
  },
  {
    key: 'channel',
    label: 'Channel',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge variant="neutral" size="sm">{value}</Badge>;
    },
  },
  {
    key: 'recipient',
    label: 'Recipient',
    sortable: true,
    width: '140px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'sentAt',
    label: 'Sent',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Post-Deployment Monitoring page component.
 *
 * @returns {React.ReactElement} The rendered PostDeploymentMonitoring page.
 */
export default function PostDeploymentMonitoring() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [postDeployments, setPostDeployments] = useState([]);

  // Detail modal state
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  const canExport = canPerform('export', 'releases');

  /**
   * Load post-deployment data from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const pdData = getAll(entityTypes.POST_DEPLOYMENTS);
      setPostDeployments(Array.isArray(pdData) ? pdData : []);
    } catch (err) {
      console.error('[PostDeploymentMonitoring] Error loading data:', err);
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
    for (let i = 0; i < postDeployments.length; i++) {
      if (postDeployments[i].segment) {
        segments.add(postDeployments[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [postDeployments]);

  /**
   * Application filter options.
   */
  const applicationOptions = useMemo(() => {
    const apps = new Set();
    for (let i = 0; i < postDeployments.length; i++) {
      if (postDeployments[i].applicationName) {
        apps.add(postDeployments[i].applicationName);
      }
    }
    return [...apps].sort().map((a) => ({ value: a, label: a }));
  }, [postDeployments]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'status',
        label: 'Status',
        options: STATUS_OPTIONS,
      },
      {
        key: 'deploymentType',
        label: 'Deployment Type',
        options: DEPLOYMENT_TYPE_OPTIONS,
      },
      {
        key: 'rollbackStatus',
        label: 'Rollback',
        options: ROLLBACK_STATUS_OPTIONS,
      },
    ];
  }, []);

  /**
   * Filtered post-deployments based on filter values and search.
   */
  const filteredPostDeployments = useMemo(() => {
    let result = [...postDeployments];

    if (filterValues.segment) {
      result = result.filter((pd) => pd.segment === filterValues.segment);
    }
    if (filterValues.application) {
      result = result.filter((pd) => pd.applicationName === filterValues.application);
    }
    if (filterValues.status) {
      result = result.filter((pd) => pd.status === filterValues.status);
    }
    if (filterValues.deploymentType) {
      result = result.filter((pd) => pd.deploymentType === filterValues.deploymentType);
    }
    if (filterValues.rollbackStatus) {
      result = result.filter((pd) => pd.rollbackStatus === filterValues.rollbackStatus);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((pd) => {
        const appName = pd.applicationName ? pd.applicationName.toLowerCase() : '';
        const segment = pd.segment ? pd.segment.toLowerCase() : '';
        const version = pd.version ? pd.version.toLowerCase() : '';
        const status = pd.status ? pd.status.toLowerCase() : '';
        const notes = pd.notes ? pd.notes.toLowerCase() : '';
        const releaseId = pd.releaseId ? pd.releaseId.toLowerCase() : '';
        return (
          appName.includes(queryLower) ||
          segment.includes(queryLower) ||
          version.includes(queryLower) ||
          status.includes(queryLower) ||
          notes.includes(queryLower) ||
          releaseId.includes(queryLower)
        );
      });
    }

    // Sort by deployedAt descending by default
    result.sort((a, b) => {
      const dateA = new Date(a.deployedAt).getTime();
      const dateB = new Date(b.deployedAt).getTime();
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

    return result;
  }, [postDeployments, filterValues, searchValue]);

  /**
   * Summary metrics for the post-deployment monitoring dashboard.
   */
  const summaryMetrics = useMemo(() => {
    const total = postDeployments.length;
    let healthy = 0;
    let degraded = 0;
    let rolledBack = 0;
    let monitoring = 0;
    let totalIncidents = 0;
    let openIncidents = 0;
    let resolvedIncidents = 0;
    let criticalIncidents = 0;
    let totalRollbacks = 0;
    let totalFailedHealthChecks = 0;
    let totalFailedVerifications = 0;
    let rollingDeployments = 0;
    let blueGreenDeployments = 0;
    let canaryDeployments = 0;

    for (let i = 0; i < postDeployments.length; i++) {
      const pd = postDeployments[i];

      if (pd.status === 'healthy') healthy += 1;
      else if (pd.status === 'degraded') degraded += 1;
      else if (pd.status === 'rolled_back') rolledBack += 1;
      else if (pd.status === 'monitoring') monitoring += 1;

      totalIncidents += pd.incidentCount || 0;

      if (pd.rollbackStatus === 'completed') totalRollbacks += 1;

      if (pd.deploymentType === 'rolling') rollingDeployments += 1;
      else if (pd.deploymentType === 'blue_green') blueGreenDeployments += 1;
      else if (pd.deploymentType === 'canary') canaryDeployments += 1;

      if (Array.isArray(pd.incidents)) {
        for (let j = 0; j < pd.incidents.length; j++) {
          const inc = pd.incidents[j];
          if (inc.status === 'open' || inc.status === 'in_progress') openIncidents += 1;
          else if (inc.status === 'resolved') resolvedIncidents += 1;
          if (inc.severity === 'critical') criticalIncidents += 1;
        }
      }

      if (Array.isArray(pd.healthChecks)) {
        for (let j = 0; j < pd.healthChecks.length; j++) {
          if (pd.healthChecks[j].status === 'failed') totalFailedHealthChecks += 1;
        }
      }

      if (Array.isArray(pd.verificationTests)) {
        for (let j = 0; j < pd.verificationTests.length; j++) {
          if (pd.verificationTests[j].status === 'failed') totalFailedVerifications += 1;
        }
      }
    }

    const rollbackRate = total > 0 ? Math.round((totalRollbacks / total) * 10000) / 100 : 0;
    const successRate = total > 0 ? Math.round((healthy / total) * 10000) / 100 : 0;

    return {
      total,
      healthy,
      degraded,
      rolledBack,
      monitoring,
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      criticalIncidents,
      totalRollbacks,
      rollbackRate,
      successRate,
      totalFailedHealthChecks,
      totalFailedVerifications,
      rollingDeployments,
      blueGreenDeployments,
      canaryDeployments,
    };
  }, [postDeployments]);

  /**
   * Status distribution chart data.
   */
  const statusDistributionData = useMemo(() => {
    return [
      { label: 'Healthy', value: summaryMetrics.healthy },
      { label: 'Degraded', value: summaryMetrics.degraded },
      { label: 'Rolled Back', value: summaryMetrics.rolledBack },
      { label: 'Monitoring', value: summaryMetrics.monitoring },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Deployment type distribution chart data.
   */
  const deploymentTypeDistributionData = useMemo(() => {
    return [
      { label: 'Rolling', value: summaryMetrics.rollingDeployments },
      { label: 'Blue/Green', value: summaryMetrics.blueGreenDeployments },
      { label: 'Canary', value: summaryMetrics.canaryDeployments },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Segment distribution chart data.
   */
  const segmentDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < postDeployments.length; i++) {
      const segment = postDeployments[i].segment || 'Unknown';
      counts[segment] = (counts[segment] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [postDeployments]);

  /**
   * Incident severity distribution chart data.
   */
  const incidentSeverityData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < postDeployments.length; i++) {
      if (Array.isArray(postDeployments[i].incidents)) {
        for (let j = 0; j < postDeployments[i].incidents.length; j++) {
          const severity = postDeployments[i].incidents[j].severity || 'unknown';
          counts[severity] = (counts[severity] || 0) + 1;
        }
      }
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: counts[key],
      }))
      .sort((a, b) => b.value - a.value);
  }, [postDeployments]);

  /**
   * Incident status distribution chart data.
   */
  const incidentStatusData = useMemo(() => {
    return [
      { label: 'Open', value: summaryMetrics.openIncidents },
      { label: 'Resolved', value: summaryMetrics.resolvedIncidents },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Rollback distribution chart data.
   */
  const rollbackDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < postDeployments.length; i++) {
      const rollbackStatus = postDeployments[i].rollbackStatus || 'unknown';
      counts[rollbackStatus] = (counts[rollbackStatus] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: counts[key],
      }));
  }, [postDeployments]);

  /**
   * Application distribution chart data.
   */
  const applicationDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < postDeployments.length; i++) {
      const app = postDeployments[i].applicationName || 'Unknown';
      counts[app] = (counts[app] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [postDeployments]);

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
   * Handle row click to open deployment detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedDeployment(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedDeployment(null);
    setDetailTab('overview');
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredPostDeployments.map((pd) => ({
      ID: pd.id || '',
      'Release ID': pd.releaseId || '',
      Application: pd.applicationName || '',
      Segment: pd.segment || '',
      Version: pd.version || '',
      'Deployment Type': pd.deploymentType || '',
      Status: pd.status || '',
      'Deployed At': pd.deployedAt || '',
      'Deployed By': pd.deployedBy || '',
      'Incident Count': pd.incidentCount !== null && pd.incidentCount !== undefined ? pd.incidentCount : '',
      'Rollback Status': pd.rollbackStatus || '',
      'Health Checks': Array.isArray(pd.healthChecks) ? pd.healthChecks.length : 0,
      'Verification Tests': Array.isArray(pd.verificationTests) ? pd.verificationTests.length : 0,
      'Feedback Loops': Array.isArray(pd.feedbackLoopLinks) ? pd.feedbackLoopLinks.length : 0,
    }));

    exportToCSV(exportData, 'post-deployment-monitoring');

    logAction(userId, 'Export Post-Deployment CSV', 'post-deployments', 'bulk', `Exported ${exportData.length} post-deployment records to CSV`);
  }, [canExport, filteredPostDeployments, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredPostDeployments.map((pd) => ({
      ID: pd.id || '',
      'Release ID': pd.releaseId || '',
      Application: pd.applicationName || '',
      Segment: pd.segment || '',
      Version: pd.version || '',
      'Deployment Type': pd.deploymentType || '',
      Status: pd.status || '',
      'Deployed At': pd.deployedAt || '',
      'Deployed By': pd.deployedBy || '',
      'Incident Count': pd.incidentCount !== null && pd.incidentCount !== undefined ? pd.incidentCount : '',
      'Rollback Status': pd.rollbackStatus || '',
      'Health Checks': Array.isArray(pd.healthChecks) ? pd.healthChecks.length : 0,
      'Verification Tests': Array.isArray(pd.verificationTests) ? pd.verificationTests.length : 0,
      'Feedback Loops': Array.isArray(pd.feedbackLoopLinks) ? pd.feedbackLoopLinks.length : 0,
    }));

    exportToExcel(exportData, 'post-deployment-monitoring');

    logAction(userId, 'Export Post-Deployment Excel', 'post-deployments', 'bulk', `Exported ${exportData.length} post-deployment records to Excel`);
  }, [canExport, filteredPostDeployments, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedDeployment) return [];

    const healthCheckCount = Array.isArray(selectedDeployment.healthChecks) ? selectedDeployment.healthChecks.length : 0;
    const verificationCount = Array.isArray(selectedDeployment.verificationTests) ? selectedDeployment.verificationTests.length : 0;
    const incidentCount = Array.isArray(selectedDeployment.incidents) ? selectedDeployment.incidents.length : 0;
    const feedbackCount = Array.isArray(selectedDeployment.feedbackLoopLinks) ? selectedDeployment.feedbackLoopLinks.length : 0;
    const notificationCount = Array.isArray(selectedDeployment.notifications) ? selectedDeployment.notifications.length : 0;
    const hasRollback = selectedDeployment.rollbackStatus === 'completed' || selectedDeployment.rollbackStatus === 'in_progress';
    const hasPerformance = selectedDeployment.performanceMetrics && typeof selectedDeployment.performanceMetrics === 'object';

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'performance', label: 'Performance', badge: hasPerformance ? '✓' : undefined },
      { key: 'health-checks', label: 'Health Checks', badge: healthCheckCount > 0 ? String(healthCheckCount) : undefined },
      { key: 'verification', label: 'Verification', badge: verificationCount > 0 ? String(verificationCount) : undefined },
      { key: 'incidents', label: 'Incidents', badge: incidentCount > 0 ? String(incidentCount) : undefined },
      { key: 'rollback', label: 'Rollback', badge: hasRollback ? '!' : undefined },
      { key: 'feedback', label: 'Feedback Loops', badge: feedbackCount > 0 ? String(feedbackCount) : undefined },
      { key: 'notifications', label: 'Notifications', badge: notificationCount > 0 ? String(notificationCount) : undefined },
    ];
  }, [selectedDeployment]);

  /**
   * Incident timeline entries for the detail modal.
   */
  const incidentTimelineEntries = useMemo(() => {
    if (!selectedDeployment || !Array.isArray(selectedDeployment.incidents)) return [];
    return selectedDeployment.incidents.map((inc) => ({
      id: inc.id || `inc-${Math.random()}`,
      title: inc.title || 'Incident',
      description: inc.rootCause || inc.resolution || `Severity: ${inc.severity || '—'} | Status: ${inc.status || '—'}`,
      timestamp: inc.reportedAt,
      badge: inc.status ? <Badge status={inc.status} size="sm" /> : null,
      metadata: [
        { label: 'Severity', value: inc.severity || '—' },
        { label: 'Status', value: inc.status || '—' },
        { label: 'Impacted Users', value: String(inc.impactedUsers || 0) },
        ...(inc.resolutionTimeMinutes ? [{ label: 'Resolution Time', value: formatDurationMinutes(inc.resolutionTimeMinutes) }] : []),
      ],
    }));
  }, [selectedDeployment]);

  /**
   * Notification timeline entries for the detail modal.
   */
  const notificationTimelineEntries = useMemo(() => {
    if (!selectedDeployment || !Array.isArray(selectedDeployment.notifications)) return [];
    return selectedDeployment.notifications.map((notif) => ({
      id: notif.id || `notif-${Math.random()}`,
      title: notif.type ? notif.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Notification',
      description: `Channel: ${notif.channel || '—'} | Recipient: ${notif.recipient || '—'}`,
      timestamp: notif.sentAt,
      badge: notif.status ? <Badge status={notif.status} size="sm" /> : null,
    }));
  }, [selectedDeployment]);

  /**
   * Performance metrics chart data for the detail modal.
   */
  const performanceChartData = useMemo(() => {
    if (!selectedDeployment || !selectedDeployment.performanceMetrics) return [];
    const perf = selectedDeployment.performanceMetrics;
    const result = [];
    if (perf.cpuUtilization && typeof perf.cpuUtilization.current === 'number') {
      result.push({ label: 'CPU', value: perf.cpuUtilization.current });
    }
    if (perf.memoryUtilization && typeof perf.memoryUtilization.current === 'number') {
      result.push({ label: 'Memory', value: perf.memoryUtilization.current });
    }
    if (perf.errorRate && typeof perf.errorRate.current === 'number') {
      result.push({ label: 'Error Rate', value: perf.errorRate.current });
    }
    return result;
  }, [selectedDeployment]);

  /**
   * Health check status distribution for the detail modal.
   */
  const healthCheckStatusData = useMemo(() => {
    if (!selectedDeployment || !Array.isArray(selectedDeployment.healthChecks)) return [];
    const counts = { passed: 0, warning: 0, failed: 0 };
    for (let i = 0; i < selectedDeployment.healthChecks.length; i++) {
      const status = selectedDeployment.healthChecks[i].status;
      if (status === 'passed') counts.passed += 1;
      else if (status === 'warning') counts.warning += 1;
      else if (status === 'failed') counts.failed += 1;
    }
    return [
      { label: 'Passed', value: counts.passed },
      { label: 'Warning', value: counts.warning },
      { label: 'Failed', value: counts.failed },
    ].filter((d) => d.value > 0);
  }, [selectedDeployment]);

  /**
   * Verification test status distribution for the detail modal.
   */
  const verificationStatusData = useMemo(() => {
    if (!selectedDeployment || !Array.isArray(selectedDeployment.verificationTests)) return [];
    const counts = { passed: 0, failed: 0 };
    for (let i = 0; i < selectedDeployment.verificationTests.length; i++) {
      const status = selectedDeployment.verificationTests[i].status;
      if (status === 'passed') counts.passed += 1;
      else if (status === 'failed') counts.failed += 1;
    }
    return [
      { label: 'Passed', value: counts.passed },
      { label: 'Failed', value: counts.failed },
    ].filter((d) => d.value > 0);
  }, [selectedDeployment]);

  if (isLoading && postDeployments.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading post-deployment monitoring...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="post-deployment-monitoring">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Post-Deployment Monitoring</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Monitor deployment health, incidents, rollbacks, and production performance
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1">
        <MetricCard
          label="Total Deployments"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-deployments"
        />
        <MetricCard
          label="Healthy"
          value={summaryMetrics.healthy}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-healthy"
        />
        <MetricCard
          label="Degraded"
          value={summaryMetrics.degraded}
          status={summaryMetrics.degraded > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-degraded"
        />
        <MetricCard
          label="Rolled Back"
          value={summaryMetrics.rolledBack}
          status={summaryMetrics.rolledBack > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-rolled-back"
        />
        <MetricCard
          label="Monitoring"
          value={summaryMetrics.monitoring}
          status={summaryMetrics.monitoring > 0 ? 'in_progress' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-monitoring"
        />
        <MetricCard
          label="Total Incidents"
          value={summaryMetrics.totalIncidents}
          status={summaryMetrics.totalIncidents > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-total-incidents"
        />
        <MetricCard
          label="Rollback Rate"
          value={summaryMetrics.rollbackRate}
          unit="%"
          status={summaryMetrics.rollbackRate > 10 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-rollback-rate"
        />
        <MetricCard
          label="Success Rate"
          value={summaryMetrics.successRate}
          unit="%"
          variant="compact"
          size="sm"
          testId="metric-success-rate"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <MetricCard
          label="Open Incidents"
          value={summaryMetrics.openIncidents}
          status={summaryMetrics.openIncidents > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-open-incidents"
        />
        <MetricCard
          label="Critical Incidents"
          value={summaryMetrics.criticalIncidents}
          status={summaryMetrics.criticalIncidents > 0 ? 'critical' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-critical-incidents"
        />
        <MetricCard
          label="Failed Health Checks"
          value={summaryMetrics.totalFailedHealthChecks}
          status={summaryMetrics.totalFailedHealthChecks > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed-health-checks"
        />
        <MetricCard
          label="Failed Verifications"
          value={summaryMetrics.totalFailedVerifications}
          status={summaryMetrics.totalFailedVerifications > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed-verifications"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Deployment Status"
            description="Deployments by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#DC2626', '#3B82F6']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={deploymentTypeDistributionData}
            title="Deployment Type"
            description="Deployments by type"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#78BE20', '#F59E0B']}
            testId="chart-deployment-type"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={incidentSeverityData}
            title="Incident Severity"
            description="Incidents by severity level"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
            testId="chart-incident-severity"
          />
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={applicationDistributionData}
            title="Deployments by Application"
            description="Number of deployments per application"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-app-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={rollbackDistributionData}
            title="Rollback Status"
            description="Deployments by rollback status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280']}
            testId="chart-rollback-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={segmentDistributionData}
            title="Deployments by Segment"
            description="Number of deployments per segment"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38']}
            testId="chart-segment-distribution"
          />
        </Card>
      </div>

      {/* Incident Alert */}
      {summaryMetrics.openIncidents > 0 && (
        <Card variant="base" padding="sm">
          <div className="flex items-center gap-1">
            <Badge status="warning" size="md">{summaryMetrics.openIncidents} Open Incident{summaryMetrics.openIncidents !== 1 ? 's' : ''}</Badge>
            <span className="text-xs text-gray-500">Post-deployment incidents requiring attention</span>
            {summaryMetrics.criticalIncidents > 0 && (
              <Badge status="critical" size="md">{summaryMetrics.criticalIncidents} Critical</Badge>
            )}
          </div>
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
        searchPlaceholder="Search deployments..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="post-deployment-filter-bar"
      />

      {/* Post-Deployment Data Table */}
      <DataTable
        columns={POST_DEPLOYMENT_TABLE_COLUMNS}
        data={filteredPostDeployments}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No post-deployment data found"
        emptyMessage="No post-deployment monitoring records match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Post-deployment monitoring table"
        testId="post-deployment-table"
      />

      {/* Detail Modal */}
      {selectedDeployment && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={`${selectedDeployment.applicationName || 'Deployment'} - ${selectedDeployment.version || ''}`}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Post-deployment detail: ${selectedDeployment.applicationName || selectedDeployment.id}`}
          testId="post-deployment-detail-modal"
        >
          <div className="space-y-2">
            {/* Deployment Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedDeployment.status && (
                <Badge status={resolveDeploymentStatus(selectedDeployment.status)} size="md">
                  {selectedDeployment.status.replace(/_/g, ' ')}
                </Badge>
              )}
              {selectedDeployment.deploymentType && (
                <Badge variant="neutral" size="md">{selectedDeployment.deploymentType.replace(/_/g, ' ')}</Badge>
              )}
              {selectedDeployment.segment && (
                <Badge variant="neutral" size="md">{selectedDeployment.segment}</Badge>
              )}
              {selectedDeployment.rollbackStatus && selectedDeployment.rollbackStatus !== 'not_required' && (
                <Badge status={selectedDeployment.rollbackStatus === 'completed' ? 'failed' : 'warning'} size="md">
                  Rollback: {selectedDeployment.rollbackStatus.replace(/_/g, ' ')}
                </Badge>
              )}
              {selectedDeployment.releaseId && (
                <Badge variant="info" size="md">Release: {selectedDeployment.releaseId}</Badge>
              )}
              {selectedDeployment.incidentCount > 0 && (
                <Badge variant="error" size="md">{selectedDeployment.incidentCount} Incident{selectedDeployment.incidentCount !== 1 ? 's' : ''}</Badge>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              <MetricCard
                label="Status"
                value={selectedDeployment.status ? selectedDeployment.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                status={resolveDeploymentStatus(selectedDeployment.status)}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Incidents"
                value={selectedDeployment.incidentCount || 0}
                status={selectedDeployment.incidentCount > 0 ? 'warning' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Health Checks"
                value={Array.isArray(selectedDeployment.healthChecks) ? selectedDeployment.healthChecks.length : 0}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Verification Tests"
                value={Array.isArray(selectedDeployment.verificationTests) ? selectedDeployment.verificationTests.length : 0}
                variant="compact"
                size="sm"
              />
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="post-deployment-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {/* Notes */}
                {selectedDeployment.notes && (
                  <Card variant="base" padding="md">
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Deployment Notes</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDeployment.notes}</p>
                  </Card>
                )}

                {/* Deployment Information */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Deployment Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Application:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.applicationName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Application ID:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedDeployment.applicationId || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Release ID:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedDeployment.releaseId || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.version || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Segment:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.segment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Deployment Type:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.deploymentType ? selectedDeployment.deploymentType.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.status ? selectedDeployment.status.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Environment:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.environment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Deployed At:</span>{' '}
                      <span className="text-gray-800">{formatDateTime(selectedDeployment.deployedAt)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Deployed By:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.deployedBy || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Incident Count:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.incidentCount || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Rollback Status:</span>{' '}
                      <span className="text-gray-800">{selectedDeployment.rollbackStatus ? selectedDeployment.rollbackStatus.replace(/_/g, ' ') : '—'}</span>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                {Array.isArray(selectedDeployment.tags) && selectedDeployment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedDeployment.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Summary Charts */}
                {(healthCheckStatusData.length > 0 || verificationStatusData.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                    {healthCheckStatusData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={healthCheckStatusData}
                          title="Health Check Status"
                          description="Health check results"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#78BE20', '#F59E0B', '#DC2626']}
                          testId="chart-detail-health-checks"
                        />
                      </Card>
                    )}
                    {verificationStatusData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={verificationStatusData}
                          title="Verification Tests"
                          description="Verification test results"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#78BE20', '#DC2626']}
                          testId="chart-detail-verification"
                        />
                      </Card>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedDeployment.created_at)}</div>
                  <div>Updated: {formatDate(selectedDeployment.updated_at)}</div>
                  {selectedDeployment.created_by && <div>Created By: {selectedDeployment.created_by}</div>}
                  {selectedDeployment.updated_by && <div>Updated By: {selectedDeployment.updated_by}</div>}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {detailTab === 'performance' && (
              <div className="space-y-2">
                {selectedDeployment.performanceMetrics && typeof selectedDeployment.performanceMetrics === 'object' ? (
                  <>
                    {/* Performance Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                      {selectedDeployment.performanceMetrics.responseTime && (
                        <MetricCard
                          label="Response Time (P95)"
                          value={selectedDeployment.performanceMetrics.responseTime.p95 || '—'}
                          unit="ms"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.responseTime.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.throughput && (
                        <MetricCard
                          label="Throughput"
                          value={selectedDeployment.performanceMetrics.throughput.current || '—'}
                          unit="req/sec"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.throughput.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.errorRate && (
                        <MetricCard
                          label="Error Rate"
                          value={selectedDeployment.performanceMetrics.errorRate.current || '—'}
                          unit="%"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.errorRate.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.cpuUtilization && (
                        <MetricCard
                          label="CPU"
                          value={selectedDeployment.performanceMetrics.cpuUtilization.current || '—'}
                          unit="%"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.cpuUtilization.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.memoryUtilization && (
                        <MetricCard
                          label="Memory"
                          value={selectedDeployment.performanceMetrics.memoryUtilization.current || '—'}
                          unit="%"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.memoryUtilization.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.latency && (
                        <MetricCard
                          label="Latency (P95)"
                          value={selectedDeployment.performanceMetrics.latency.p95 || '—'}
                          unit="ms"
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.latency.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedDeployment.performanceMetrics.activeConnections && (
                        <MetricCard
                          label="Active Connections"
                          value={selectedDeployment.performanceMetrics.activeConnections.current || '—'}
                          status={resolvePerfStatus(selectedDeployment.performanceMetrics.activeConnections.status)}
                          variant="compact"
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Performance Progress Bars */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Resource Utilization</h4>
                      <div className="space-y-0.5">
                        {selectedDeployment.performanceMetrics.cpuUtilization && (
                          <ProgressBar
                            value={selectedDeployment.performanceMetrics.cpuUtilization.current || 0}
                            max={100}
                            size="sm"
                            variant="auto"
                            showValue={true}
                            label="CPU"
                            unit="%"
                            thresholds={{ error: 90, warning: 75, success: 100 }}
                          />
                        )}
                        {selectedDeployment.performanceMetrics.memoryUtilization && (
                          <ProgressBar
                            value={selectedDeployment.performanceMetrics.memoryUtilization.current || 0}
                            max={100}
                            size="sm"
                            variant="auto"
                            showValue={true}
                            label="Memory"
                            unit="%"
                            thresholds={{ error: 90, warning: 80, success: 100 }}
                          />
                        )}
                        {selectedDeployment.performanceMetrics.errorRate && (
                          <ProgressBar
                            value={selectedDeployment.performanceMetrics.errorRate.current || 0}
                            max={selectedDeployment.performanceMetrics.errorRate.threshold || 5}
                            size="sm"
                            variant="auto"
                            showValue={true}
                            label="Error Rate"
                            unit="%"
                            invertThresholds={true}
                          />
                        )}
                      </div>
                    </Card>

                    {/* Performance Chart */}
                    {performanceChartData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="bar"
                          data={performanceChartData}
                          title="Resource Usage (%)"
                          description="Current resource utilization"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#024E38', '#78BE20', '#DC2626']}
                          testId="chart-detail-performance"
                        />
                      </Card>
                    )}

                    {/* Performance Details */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Performance Details</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                        {selectedDeployment.performanceMetrics.responseTime && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Response P50:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.responseTime.p50 || '—'}ms</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Response P95:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.responseTime.p95 || '—'}ms</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Response P99:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.responseTime.p99 || '—'}ms</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Threshold:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.responseTime.threshold || '—'}ms</span>
                            </div>
                          </>
                        )}
                        {selectedDeployment.performanceMetrics.throughput && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Throughput Current:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.throughput.current || '—'} req/sec</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Throughput Peak:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.performanceMetrics.throughput.peak || '—'} req/sec</span>
                            </div>
                          </>
                        )}
                        {selectedDeployment.performanceMetrics.cpuUtilization && (
                          <div>
                            <span className="font-medium text-gray-600">CPU Peak:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.performanceMetrics.cpuUtilization.peak || '—'}%</span>
                          </div>
                        )}
                        {selectedDeployment.performanceMetrics.memoryUtilization && (
                          <div>
                            <span className="font-medium text-gray-600">Memory Peak:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.performanceMetrics.memoryUtilization.peak || '—'}%</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </>
                ) : (
                  <EmptyState
                    title="No performance data"
                    description="No performance metrics are available for this deployment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Health Checks Tab */}
            {detailTab === 'health-checks' && (
              <div className="space-y-2">
                {Array.isArray(selectedDeployment.healthChecks) && selectedDeployment.healthChecks.length > 0 ? (
                  <>
                    {/* Health Check Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Checks"
                        value={selectedDeployment.healthChecks.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={selectedDeployment.healthChecks.filter((hc) => hc.status === 'passed').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Warning"
                        value={selectedDeployment.healthChecks.filter((hc) => hc.status === 'warning').length}
                        status={selectedDeployment.healthChecks.filter((hc) => hc.status === 'warning').length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedDeployment.healthChecks.filter((hc) => hc.status === 'failed').length}
                        status={selectedDeployment.healthChecks.filter((hc) => hc.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Health Check Chart */}
                    {healthCheckStatusData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={healthCheckStatusData}
                          title="Health Check Status"
                          description="Health check results"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#78BE20', '#F59E0B', '#DC2626']}
                          testId="chart-health-check-status"
                        />
                      </Card>
                    )}

                    {/* Health Check Table */}
                    <DataTable
                      columns={HEALTH_CHECK_TABLE_COLUMNS}
                      data={selectedDeployment.healthChecks}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No health checks"
                      emptyMessage="No health checks configured."
                      ariaLabel="Health checks table"
                      testId="detail-health-checks-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No health checks"
                    description="No health check data is available for this deployment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Verification Tests Tab */}
            {detailTab === 'verification' && (
              <div className="space-y-2">
                {Array.isArray(selectedDeployment.verificationTests) && selectedDeployment.verificationTests.length > 0 ? (
                  <>
                    {/* Verification Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Tests"
                        value={selectedDeployment.verificationTests.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={selectedDeployment.verificationTests.filter((vt) => vt.status === 'passed').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedDeployment.verificationTests.filter((vt) => vt.status === 'failed').length}
                        status={selectedDeployment.verificationTests.filter((vt) => vt.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Verification Chart */}
                    {verificationStatusData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={verificationStatusData}
                          title="Verification Test Results"
                          description="Post-deployment verification test outcomes"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#78BE20', '#DC2626']}
                          testId="chart-verification-status"
                        />
                      </Card>
                    )}

                    {/* Verification Table */}
                    <DataTable
                      columns={VERIFICATION_TEST_TABLE_COLUMNS}
                      data={selectedDeployment.verificationTests}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No verification tests"
                      emptyMessage="No verification tests recorded."
                      ariaLabel="Verification tests table"
                      testId="detail-verification-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No verification tests"
                    description="No post-deployment verification test data is available."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Incidents Tab */}
            {detailTab === 'incidents' && (
              <div className="space-y-2">
                {Array.isArray(selectedDeployment.incidents) && selectedDeployment.incidents.length > 0 ? (
                  <>
                    {/* Incident Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Incidents"
                        value={selectedDeployment.incidents.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Open"
                        value={selectedDeployment.incidents.filter((inc) => inc.status === 'open' || inc.status === 'in_progress').length}
                        status={selectedDeployment.incidents.filter((inc) => inc.status === 'open' || inc.status === 'in_progress').length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Resolved"
                        value={selectedDeployment.incidents.filter((inc) => inc.status === 'resolved').length}
                        status="completed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Critical"
                        value={selectedDeployment.incidents.filter((inc) => inc.severity === 'critical').length}
                        status={selectedDeployment.incidents.filter((inc) => inc.severity === 'critical').length > 0 ? 'critical' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Incident Table */}
                    <DataTable
                      columns={INCIDENT_TABLE_COLUMNS}
                      data={selectedDeployment.incidents}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No incidents"
                      emptyMessage="No incidents recorded."
                      ariaLabel="Incidents table"
                      testId="detail-incidents-table"
                    />

                    {/* Incident Timeline */}
                    {incidentTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Incident Timeline</h4>
                        <Timeline
                          entries={incidentTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="detail-incident-timeline"
                        />
                      </Card>
                    )}

                    {/* Incident Details */}
                    {selectedDeployment.incidents.map((inc, idx) => (
                      <Card key={inc.id || idx} variant="base" padding="md">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          <h4 className="text-xs font-semibold text-gray-800 truncate">{inc.title || 'Incident'}</h4>
                          {inc.severity && <Badge status={inc.severity} size="sm" />}
                          {inc.status && <Badge status={inc.status} size="sm" />}
                        </div>
                        {inc.rootCause && (
                          <div className="mt-0.5">
                            <span className="text-[10px] font-semibold text-gray-600">Root Cause:</span>
                            <p className="text-xs text-gray-700 mt-[1px]">{inc.rootCause}</p>
                          </div>
                        )}
                        {inc.resolution && (
                          <div className="mt-0.5">
                            <span className="text-[10px] font-semibold text-gray-600">Resolution:</span>
                            <p className="text-xs text-gray-700 mt-[1px]">{inc.resolution}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5 mt-0.5 text-[10px] text-gray-400">
                          <div>Reported: {formatDateTime(inc.reportedAt)}</div>
                          <div>Resolved: {inc.resolvedAt ? formatDateTime(inc.resolvedAt) : 'Open'}</div>
                          <div>Impacted Users: {inc.impactedUsers || 0}</div>
                          <div>Resolution Time: {inc.resolutionTimeMinutes ? formatDurationMinutes(inc.resolutionTimeMinutes) : '—'}</div>
                          {inc.reportedBy && <div>Reported By: {inc.reportedBy}</div>}
                          {inc.resolvedBy && <div>Resolved By: {inc.resolvedBy}</div>}
                        </div>
                      </Card>
                    ))}
                  </>
                ) : (
                  <EmptyState
                    title="No incidents"
                    description="No incidents have been reported for this deployment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Rollback Tab */}
            {detailTab === 'rollback' && (
              <div className="space-y-2">
                {selectedDeployment.rollbackStatus && selectedDeployment.rollbackStatus !== 'not_required' ? (
                  <>
                    {/* Rollback Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Rollback Status"
                        value={selectedDeployment.rollbackStatus ? selectedDeployment.rollbackStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                        status={selectedDeployment.rollbackStatus === 'completed' ? 'failed' : 'warning'}
                        variant="compact"
                        size="sm"
                      />
                      {selectedDeployment.rollbackDetails && (
                        <>
                          <MetricCard
                            label="Duration"
                            value={selectedDeployment.rollbackDetails.durationMinutes ? formatDurationMinutes(selectedDeployment.rollbackDetails.durationMinutes) : '—'}
                            variant="compact"
                            size="sm"
                          />
                          <MetricCard
                            label="Data Recovery"
                            value={selectedDeployment.rollbackDetails.dataRecoveryRequired ? 'Required' : 'Not Required'}
                            status={selectedDeployment.rollbackDetails.dataRecoveryRequired ? 'warning' : 'healthy'}
                            variant="compact"
                            size="sm"
                          />
                        </>
                      )}
                    </div>

                    {/* Rollback Details */}
                    {selectedDeployment.rollbackDetails && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Rollback Details</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                          <div>
                            <span className="font-medium text-gray-600">Initiated At:</span>{' '}
                            <span className="text-gray-800">{formatDateTime(selectedDeployment.rollbackDetails.initiatedAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Completed At:</span>{' '}
                            <span className="text-gray-800">{formatDateTime(selectedDeployment.rollbackDetails.completedAt)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Initiated By:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.rollbackDetails.initiatedBy || '—'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Rolled Back To:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.rollbackDetails.rolledBackToVersion || '—'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Duration:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.rollbackDetails.durationMinutes ? formatDurationMinutes(selectedDeployment.rollbackDetails.durationMinutes) : '—'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Approved By:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.rollbackDetails.approvedBy || '—'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Data Recovery:</span>{' '}
                            <span className="text-gray-800">{selectedDeployment.rollbackDetails.dataRecoveryRequired ? 'Yes' : 'No'}</span>
                          </div>
                          {selectedDeployment.rollbackDetails.dataRecoveryStatus && (
                            <div>
                              <span className="font-medium text-gray-600">Recovery Status:</span>{' '}
                              <span className="text-gray-800">{selectedDeployment.rollbackDetails.dataRecoveryStatus}</span>
                            </div>
                          )}
                        </div>

                        {selectedDeployment.rollbackDetails.reason && (
                          <div className="mt-1">
                            <span className="text-xs font-semibold text-gray-600">Reason:</span>
                            <p className="text-xs text-gray-700 mt-[1px]">{selectedDeployment.rollbackDetails.reason}</p>
                          </div>
                        )}

                        {selectedDeployment.rollbackDetails.dataRecoveryNotes && (
                          <div className="mt-0.5">
                            <span className="text-xs font-semibold text-gray-600">Data Recovery Notes:</span>
                            <p className="text-xs text-gray-700 mt-[1px]">{selectedDeployment.rollbackDetails.dataRecoveryNotes}</p>
                          </div>
                        )}
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No rollback"
                    description="No rollback was required for this deployment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Feedback Loops Tab */}
            {detailTab === 'feedback' && (
              <div className="space-y-2">
                {Array.isArray(selectedDeployment.feedbackLoopLinks) && selectedDeployment.feedbackLoopLinks.length > 0 ? (
                  <>
                    {/* Feedback Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Links"
                        value={selectedDeployment.feedbackLoopLinks.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Active"
                        value={selectedDeployment.feedbackLoopLinks.filter((fl) => fl.status === 'active').length}
                        status="active"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Types"
                        value={(() => {
                          const types = new Set();
                          for (let i = 0; i < selectedDeployment.feedbackLoopLinks.length; i++) {
                            if (selectedDeployment.feedbackLoopLinks[i].type) {
                              types.add(selectedDeployment.feedbackLoopLinks[i].type);
                            }
                          }
                          return types.size;
                        })()}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Feedback Loop Table */}
                    <DataTable
                      columns={FEEDBACK_LOOP_TABLE_COLUMNS}
                      data={selectedDeployment.feedbackLoopLinks}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No feedback loops"
                      emptyMessage="No feedback loop links configured."
                      ariaLabel="Feedback loops table"
                      testId="detail-feedback-table"
                    />

                    {/* Feedback Loop Detail Cards */}
                    <div className="space-y-0.5">
                      {selectedDeployment.feedbackLoopLinks.map((fl, idx) => (
                        <Card key={fl.id || idx} variant="base" padding="sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-0.5 min-w-0">
                              <span className="text-xs font-medium text-gray-900">{fl.name || 'Feedback Link'}</span>
                              <Badge variant="neutral" size="sm">{fl.type ? fl.type.replace(/_/g, ' ') : '—'}</Badge>
                              {fl.status && <Badge status={fl.status} size="sm" />}
                            </div>
                          </div>
                          {fl.url && (
                            <p className="text-[10px] text-gray-500 mt-[1px] truncate" title={fl.url}>
                              📎 {fl.url}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>

                    {/* Feedback Type Chart */}
                    {(() => {
                      const typeCounts = {};
                      for (let i = 0; i < selectedDeployment.feedbackLoopLinks.length; i++) {
                        const type = selectedDeployment.feedbackLoopLinks[i].type ? selectedDeployment.feedbackLoopLinks[i].type.replace(/_/g, ' ') : 'Other';
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                      }
                      const chartData = Object.keys(typeCounts).map((key) => ({ label: key, value: typeCounts[key] }));
                      if (chartData.length > 1) {
                        return (
                          <Card variant="base" padding="md">
                            <ChartPlaceholder
                              type="donut"
                              data={chartData}
                              title="Feedback Loop Types"
                              description="Links by type"
                              size="sm"
                              showValues={true}
                              showLabels={true}
                              testId="chart-feedback-types"
                            />
                          </Card>
                        );
                      }
                      return null;
                    })()}
                  </>
                ) : (
                  <EmptyState
                    title="No feedback loops"
                    description="No feedback loop links are configured for this deployment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {detailTab === 'notifications' && (
              <div className="space-y-2">
                {Array.isArray(selectedDeployment.notifications) && selectedDeployment.notifications.length > 0 ? (
                  <>
                    {/* Notification Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Notifications"
                        value={selectedDeployment.notifications.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Delivered"
                        value={selectedDeployment.notifications.filter((n) => n.status === 'delivered').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Channels"
                        value={(() => {
                          const channels = new Set();
                          for (let i = 0; i < selectedDeployment.notifications.length; i++) {
                            if (selectedDeployment.notifications[i].channel) {
                              channels.add(selectedDeployment.notifications[i].channel);
                            }
                          }
                          return channels.size;
                        })()}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Notification Table */}
                    <DataTable
                      columns={NOTIFICATION_TABLE_COLUMNS}
                      data={selectedDeployment.notifications}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No notifications"
                      emptyMessage="No notifications sent."
                      ariaLabel="Notifications table"
                      testId="detail-notifications-table"
                    />

                    {/* Notification Timeline */}
                    {notificationTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Notification Timeline</h4>
                        <Timeline
                          entries={notificationTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="detail-notification-timeline"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No notifications"
                    description="No notifications have been sent for this deployment."
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