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
import FormField from '../components/common/FormField.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Timeline from '../components/common/Timeline.jsx';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module EnvironmentManagement
 * Environment Management page for eQIP Quality Intelligence.
 *
 * Displays environment inventory with reservation, status updates, readiness
 * validation, and conflict detection. Supports filtering by type, status,
 * segment, and readiness. Drill-down into environment details via modal
 * showing health checks, reservations, conflict flags, capacity, and
 * deployment history.
 * Uses DataTable, FilterBar, Modal, FormField, Badge.
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
 * Resolve readiness status to a badge status string.
 * @param {string} status - The readiness status.
 * @returns {string} The badge status string.
 */
function resolveReadinessStatus(status) {
  if (!status) return 'unknown';
  const s = status.toLowerCase();
  if (s === 'ready') return 'passed';
  if (s === 'degraded') return 'warning';
  if (s === 'down') return 'failed';
  if (s === 'standby') return 'pending';
  return status;
}

/**
 * Environment type options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const TYPE_OPTIONS = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'uat', label: 'UAT' },
  { value: 'production', label: 'Production' },
  { value: 'performance', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'disaster_recovery', label: 'Disaster Recovery' },
];

/**
 * Environment status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'standby', label: 'Standby' },
  { value: 'down', label: 'Down' },
];

/**
 * Readiness status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const READINESS_OPTIONS = [
  { value: 'ready', label: 'Ready' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'down', label: 'Down' },
];

/**
 * Columns definition for the environments data table.
 * @type {Array<object>}
 */
const ENVIRONMENT_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Environment',
    sortable: true,
    width: '180px',
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 capitalize">{value.replace(/_/g, ' ')}</span>;
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
    key: 'segment',
    label: 'Segment',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'readinessStatus',
    label: 'Readiness',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!value || !value.overall) return '—';
      return <Badge status={resolveReadinessStatus(value.overall)} size="sm">{value.overall}</Badge>;
    },
  },
  {
    key: 'readinessStatus',
    label: 'Score',
    sortable: false,
    align: 'center',
    width: '70px',
    render: (value) => {
      if (!value || value.score === null || value.score === undefined) return '—';
      return <span className="text-sm font-bold text-deep-forest-teal-800">{value.score}</span>;
    },
  },
  {
    key: 'applications',
    label: 'Applications',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!Array.isArray(value)) return '—';
      return <span className="text-xs text-gray-600">{value.length}</span>;
    },
  },
  {
    key: 'conflictFlags',
    label: 'Conflicts',
    sortable: false,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (!Array.isArray(value)) return '0';
      const openConflicts = value.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').length;
      if (openConflicts === 0) return <span className="text-xs text-gray-400">0</span>;
      return <Badge variant="error" size="sm">{openConflicts}</Badge>;
    },
  },
  {
    key: 'reservations',
    label: 'Reserved',
    sortable: false,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (!Array.isArray(value)) return '—';
      const activeRes = value.filter((r) => r.status === 'active').length;
      if (activeRes === 0) return <span className="text-xs text-gray-400">No</span>;
      return <Badge variant="info" size="sm">{activeRes}</Badge>;
    },
  },
  {
    key: 'lastDeployment',
    label: 'Last Deploy',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
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
    key: 'lastRun',
    label: 'Last Run',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Reservation table columns for the detail modal.
 * @type {Array<object>}
 */
const RESERVATION_TABLE_COLUMNS = [
  {
    key: 'userName',
    label: 'User',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-800">{value}</span>;
    },
  },
  {
    key: 'purpose',
    label: 'Purpose',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-700">{value}</span>;
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
    key: 'startDate',
    label: 'Start',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'endDate',
    label: 'End',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Conflict flag table columns for the detail modal.
 * @type {Array<object>}
 */
const CONFLICT_TABLE_COLUMNS = [
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-700">{value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>;
    },
  },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-700">{value}</span>;
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
    key: 'raisedAt',
    label: 'Raised',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Initial form state for creating a reservation.
 * @returns {object} The initial form state.
 */
function getInitialReservationFormState() {
  return {
    purpose: '',
    startDate: '',
    endDate: '',
  };
}

/**
 * Environment Management page component.
 *
 * @returns {React.ReactElement} The rendered EnvironmentManagement page.
 */
export default function EnvironmentManagement() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes, updateEntity } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [environments, setEnvironments] = useState([]);

  // Detail modal state
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Reservation modal state
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState(getInitialReservationFormState());
  const [reservationErrors, setReservationErrors] = useState({});
  const [isReserving, setIsReserving] = useState(false);

  // Status update confirm state
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Readiness validation state
  const [isValidating, setIsValidating] = useState(false);

  const canUpdate = canPerform('update', 'environments');
  const canExport = canPerform('export', 'environments');

  /**
   * Load environments data from DataContext.
   */
  const loadEnvironments = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const envData = getAll(entityTypes.ENVIRONMENTS);
      setEnvironments(Array.isArray(envData) ? envData : []);
    } catch (err) {
      console.error('[EnvironmentManagement] Error loading environments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, getAll, entityTypes]);

  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments, dataVersion]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    const segments = new Set();
    for (let i = 0; i < environments.length; i++) {
      if (environments[i].segment) {
        segments.add(environments[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [environments]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'type',
        label: 'Type',
        options: TYPE_OPTIONS,
      },
      {
        key: 'status',
        label: 'Status',
        options: STATUS_OPTIONS,
      },
      {
        key: 'readiness',
        label: 'Readiness',
        options: READINESS_OPTIONS,
      },
    ];
  }, []);

  /**
   * Filtered environments based on filter values and search.
   */
  const filteredEnvironments = useMemo(() => {
    let result = [...environments];

    if (filterValues.segment) {
      result = result.filter((env) => env.segment === filterValues.segment);
    }

    if (filterValues.type) {
      result = result.filter((env) => env.type === filterValues.type);
    }

    if (filterValues.status) {
      result = result.filter((env) => env.status === filterValues.status);
    }

    if (filterValues.readiness) {
      result = result.filter((env) => {
        if (!env.readinessStatus) return false;
        return env.readinessStatus.overall === filterValues.readiness;
      });
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((env) => {
        const name = env.name ? env.name.toLowerCase() : '';
        const segment = env.segment ? env.segment.toLowerCase() : '';
        const desc = env.description ? env.description.toLowerCase() : '';
        const type = env.type ? env.type.toLowerCase() : '';
        const apps = Array.isArray(env.applications) ? env.applications.join(' ').toLowerCase() : '';
        return (
          name.includes(queryLower) ||
          segment.includes(queryLower) ||
          desc.includes(queryLower) ||
          type.includes(queryLower) ||
          apps.includes(queryLower)
        );
      });
    }

    return result;
  }, [environments, filterValues, searchValue]);

  /**
   * Summary metrics for the environment list.
   */
  const summaryMetrics = useMemo(() => {
    const total = environments.length;
    let active = 0;
    let degraded = 0;
    let standby = 0;
    let down = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let totalConflicts = 0;
    let totalReservations = 0;
    let totalFailedChecks = 0;
    let readyCount = 0;
    let degradedReadiness = 0;

    for (let i = 0; i < environments.length; i++) {
      const env = environments[i];

      if (env.status === 'active') active += 1;
      else if (env.status === 'degraded') degraded += 1;
      else if (env.status === 'standby') standby += 1;
      else if (env.status === 'down') down += 1;

      if (env.readinessStatus && typeof env.readinessStatus.score === 'number') {
        totalScore += env.readinessStatus.score;
        scoreCount += 1;
      }

      if (env.readinessStatus && env.readinessStatus.overall === 'ready') {
        readyCount += 1;
      }
      if (env.readinessStatus && env.readinessStatus.overall === 'degraded') {
        degradedReadiness += 1;
      }

      if (Array.isArray(env.conflictFlags)) {
        for (let j = 0; j < env.conflictFlags.length; j++) {
          const cfStatus = env.conflictFlags[j].status;
          if (cfStatus === 'open' || cfStatus === 'in_progress') {
            totalConflicts += 1;
          }
        }
      }

      if (Array.isArray(env.reservations)) {
        for (let j = 0; j < env.reservations.length; j++) {
          if (env.reservations[j].status === 'active') {
            totalReservations += 1;
          }
        }
      }

      if (Array.isArray(env.healthChecks)) {
        for (let j = 0; j < env.healthChecks.length; j++) {
          if (env.healthChecks[j].status === 'failed') {
            totalFailedChecks += 1;
          }
        }
      }
    }

    return {
      total,
      active,
      degraded,
      standby,
      down,
      averageScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) / 100 : 0,
      totalConflicts,
      totalReservations,
      totalFailedChecks,
      readyCount,
      degradedReadiness,
    };
  }, [environments]);

  /**
   * Status distribution chart data.
   */
  const statusDistributionData = useMemo(() => {
    return [
      { label: 'Active', value: summaryMetrics.active },
      { label: 'Degraded', value: summaryMetrics.degraded },
      { label: 'Standby', value: summaryMetrics.standby },
      { label: 'Down', value: summaryMetrics.down },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Type distribution chart data.
   */
  const typeDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < environments.length; i++) {
      const type = environments[i].type ? environments[i].type.replace(/_/g, ' ') : 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [environments]);

  /**
   * Segment distribution chart data.
   */
  const segmentDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < environments.length; i++) {
      const segment = environments[i].segment || 'Unknown';
      counts[segment] = (counts[segment] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [environments]);

  /**
   * Readiness distribution chart data.
   */
  const readinessDistributionData = useMemo(() => {
    return [
      { label: 'Ready', value: summaryMetrics.readyCount },
      { label: 'Degraded', value: summaryMetrics.degradedReadiness },
      { label: 'Other', value: summaryMetrics.total - summaryMetrics.readyCount - summaryMetrics.degradedReadiness },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Readiness score sparkline data.
   */
  const readinessSparklineData = useMemo(() => {
    return environments
      .filter((env) => env.readinessStatus && typeof env.readinessStatus.score === 'number')
      .map((env) => env.readinessStatus.score);
  }, [environments]);

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
   * Handle row click to open environment detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedEnv(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedEnv(null);
    setDetailTab('overview');
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredEnvironments.map((env) => ({
      Name: env.name || '',
      Type: env.type || '',
      Status: env.status || '',
      Segment: env.segment || '',
      'Readiness Status': env.readinessStatus ? env.readinessStatus.overall || '' : '',
      'Readiness Score': env.readinessStatus && env.readinessStatus.score !== undefined ? env.readinessStatus.score : '',
      Applications: Array.isArray(env.applications) ? env.applications.join(', ') : '',
      'Open Conflicts': Array.isArray(env.conflictFlags) ? env.conflictFlags.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').length : 0,
      'Active Reservations': Array.isArray(env.reservations) ? env.reservations.filter((r) => r.status === 'active').length : 0,
      'Last Deployment': env.lastDeployment || '',
      'Last Data Refresh': env.lastDataRefresh || '',
      'Config Version': env.configVersion || '',
      URL: env.url || '',
    }));

    exportToCSV(exportData, 'environment-management');

    logAction(userId, 'Export Environments CSV', 'environments', 'bulk', `Exported ${exportData.length} environments to CSV`);
  }, [canExport, filteredEnvironments, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredEnvironments.map((env) => ({
      Name: env.name || '',
      Type: env.type || '',
      Status: env.status || '',
      Segment: env.segment || '',
      'Readiness Status': env.readinessStatus ? env.readinessStatus.overall || '' : '',
      'Readiness Score': env.readinessStatus && env.readinessStatus.score !== undefined ? env.readinessStatus.score : '',
      Applications: Array.isArray(env.applications) ? env.applications.join(', ') : '',
      'Open Conflicts': Array.isArray(env.conflictFlags) ? env.conflictFlags.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').length : 0,
      'Active Reservations': Array.isArray(env.reservations) ? env.reservations.filter((r) => r.status === 'active').length : 0,
      'Last Deployment': env.lastDeployment || '',
      'Last Data Refresh': env.lastDataRefresh || '',
      'Config Version': env.configVersion || '',
      URL: env.url || '',
    }));

    exportToExcel(exportData, 'environment-management');

    logAction(userId, 'Export Environments Excel', 'environments', 'bulk', `Exported ${exportData.length} environments to Excel`);
  }, [canExport, filteredEnvironments, userId]);

  /**
   * Open reservation form.
   */
  const handleOpenReservation = useCallback(() => {
    if (!selectedEnv) return;
    setReservationForm(getInitialReservationFormState());
    setReservationErrors({});
    setIsReservationOpen(true);
  }, [selectedEnv]);

  const handleCloseReservation = useCallback(() => {
    setIsReservationOpen(false);
    setReservationForm(getInitialReservationFormState());
    setReservationErrors({});
  }, []);

  /**
   * Handle reservation form field change.
   */
  const handleReservationFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (reservationErrors[name]) {
      setReservationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [reservationErrors]);

  /**
   * Validate reservation form.
   * @returns {boolean} True if valid.
   */
  const validateReservationForm = useCallback(() => {
    const errors = {};
    if (!reservationForm.purpose || reservationForm.purpose.trim() === '') {
      errors.purpose = 'Purpose is required.';
    }
    if (!reservationForm.startDate) {
      errors.startDate = 'Start date is required.';
    }
    if (!reservationForm.endDate) {
      errors.endDate = 'End date is required.';
    }
    if (reservationForm.startDate && reservationForm.endDate) {
      const start = new Date(reservationForm.startDate);
      const end = new Date(reservationForm.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
        errors.endDate = 'End date must be after start date.';
      }
    }
    setReservationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [reservationForm]);

  /**
   * Handle reservation form submit.
   */
  const handleReservationSubmit = useCallback(() => {
    if (!validateReservationForm() || !selectedEnv) return;

    setIsReserving(true);

    try {
      const now = new Date().toISOString();
      const existingReservations = Array.isArray(selectedEnv.reservations) ? [...selectedEnv.reservations] : [];

      const newReservation = {
        id: `res-${Date.now()}`,
        userId: userId,
        userName: user ? (user.persona || user.role || 'User') : 'User',
        purpose: reservationForm.purpose.trim(),
        startDate: reservationForm.startDate,
        endDate: reservationForm.endDate,
        status: 'active',
      };

      existingReservations.push(newReservation);

      const updated = updateEntity(entityTypes.ENVIRONMENTS, selectedEnv.id, {
        reservations: existingReservations,
      }, userId);

      if (updated) {
        logAction(userId, 'Reserve Environment', 'environments', selectedEnv.id, `Reserved environment "${selectedEnv.name}" for: ${reservationForm.purpose.trim()}`);
        setSelectedEnv(updated);
        handleCloseReservation();
        loadEnvironments();
      }
    } catch (err) {
      console.error('[EnvironmentManagement] Error creating reservation:', err);
    } finally {
      setIsReserving(false);
    }
  }, [validateReservationForm, selectedEnv, userId, user, reservationForm, entityTypes, updateEntity, handleCloseReservation, loadEnvironments]);

  /**
   * Handle status update.
   */
  const handleOpenStatusUpdate = useCallback(() => {
    if (!selectedEnv) return;
    setNewStatus(selectedEnv.status || 'active');
    setIsStatusUpdateOpen(true);
  }, [selectedEnv]);

  const handleCloseStatusUpdate = useCallback(() => {
    setIsStatusUpdateOpen(false);
    setNewStatus('');
  }, []);

  const handleConfirmStatusUpdate = useCallback(() => {
    if (!selectedEnv || !newStatus) return;

    setIsUpdatingStatus(true);

    try {
      const updated = updateEntity(entityTypes.ENVIRONMENTS, selectedEnv.id, {
        status: newStatus,
      }, userId);

      if (updated) {
        logAction(userId, 'Update Environment Status', 'environments', selectedEnv.id, `Updated status of "${selectedEnv.name}" from "${selectedEnv.status}" to "${newStatus}"`);
        setSelectedEnv(updated);
        handleCloseStatusUpdate();
        loadEnvironments();
      }
    } catch (err) {
      console.error('[EnvironmentManagement] Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  }, [selectedEnv, newStatus, userId, entityTypes, updateEntity, handleCloseStatusUpdate, loadEnvironments]);

  /**
   * Handle readiness validation (simulated).
   */
  const handleValidateReadiness = useCallback(() => {
    if (!selectedEnv || !canUpdate) return;

    setIsValidating(true);

    try {
      const now = new Date().toISOString();

      const updatedReadiness = selectedEnv.readinessStatus
        ? { ...selectedEnv.readinessStatus, lastChecked: now }
        : { overall: 'ready', database: 'healthy', services: 'healthy', connectivity: 'healthy', lastChecked: now, score: 95 };

      const updatedHealthChecks = Array.isArray(selectedEnv.healthChecks)
        ? selectedEnv.healthChecks.map((hc) => ({
            ...hc,
            lastRun: now,
            responseTimeMs: Math.floor(Math.random() * 200) + 20,
          }))
        : [];

      const updated = updateEntity(entityTypes.ENVIRONMENTS, selectedEnv.id, {
        readinessStatus: updatedReadiness,
        healthChecks: updatedHealthChecks,
      }, userId);

      if (updated) {
        logAction(userId, 'Validate Environment Readiness', 'environments', selectedEnv.id, `Validated readiness for "${selectedEnv.name}". Score: ${updatedReadiness.score}`);
        setSelectedEnv(updated);
        loadEnvironments();
      }
    } catch (err) {
      console.error('[EnvironmentManagement] Error validating readiness:', err);
    } finally {
      setIsValidating(false);
    }
  }, [selectedEnv, canUpdate, userId, entityTypes, updateEntity, loadEnvironments]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedEnv) return [];

    const healthCheckCount = Array.isArray(selectedEnv.healthChecks) ? selectedEnv.healthChecks.length : 0;
    const reservationCount = Array.isArray(selectedEnv.reservations) ? selectedEnv.reservations.length : 0;
    const conflictCount = Array.isArray(selectedEnv.conflictFlags) ? selectedEnv.conflictFlags.length : 0;
    const appCount = Array.isArray(selectedEnv.applications) ? selectedEnv.applications.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'health-checks', label: 'Health Checks', badge: healthCheckCount > 0 ? String(healthCheckCount) : undefined },
      { key: 'reservations', label: 'Reservations', badge: reservationCount > 0 ? String(reservationCount) : undefined },
      { key: 'conflicts', label: 'Conflicts', badge: conflictCount > 0 ? String(conflictCount) : undefined },
      { key: 'capacity', label: 'Capacity' },
      { key: 'applications', label: 'Applications', badge: appCount > 0 ? String(appCount) : undefined },
    ];
  }, [selectedEnv]);

  /**
   * Conflict timeline entries.
   */
  const conflictTimelineEntries = useMemo(() => {
    if (!selectedEnv || !Array.isArray(selectedEnv.conflictFlags)) return [];
    return selectedEnv.conflictFlags.map((cf, idx) => ({
      id: cf.id || `cf-${idx}`,
      title: cf.type ? cf.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Conflict',
      description: cf.description || '—',
      timestamp: cf.raisedAt,
      badge: cf.status ? <Badge status={cf.status} size="sm" /> : null,
      metadata: [
        { label: 'Severity', value: cf.severity || '—' },
        { label: 'Status', value: cf.status || '—' },
        { label: 'Raised By', value: cf.raisedBy || '—' },
      ],
    }));
  }, [selectedEnv]);

  /**
   * Capacity chart data.
   */
  const capacityData = useMemo(() => {
    if (!selectedEnv || !selectedEnv.capacity) return [];
    const cap = selectedEnv.capacity;
    const result = [];
    if (cap.cpu) {
      result.push({ label: 'CPU', value: cap.cpu.used || 0 });
    }
    if (cap.memory) {
      result.push({ label: 'Memory', value: cap.memory.used || 0 });
    }
    if (cap.storage) {
      const storagePercent = cap.storage.total > 0
        ? Math.round((cap.storage.used / cap.storage.total) * 100)
        : 0;
      result.push({ label: 'Storage', value: storagePercent });
    }
    return result;
  }, [selectedEnv]);

  if (isLoading && environments.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading environments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="environment-management">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Environment Management</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Environment inventory, reservations, readiness validation, and conflict detection
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
          label="Total Environments"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-envs"
        />
        <MetricCard
          label="Active"
          value={summaryMetrics.active}
          status="active"
          variant="compact"
          size="sm"
          testId="metric-active"
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
          label="Avg Readiness"
          value={summaryMetrics.averageScore}
          sparklineData={readinessSparklineData.length >= 2 ? readinessSparklineData : undefined}
          variant="compact"
          size="sm"
          testId="metric-avg-readiness"
        />
        <MetricCard
          label="Open Conflicts"
          value={summaryMetrics.totalConflicts}
          status={summaryMetrics.totalConflicts > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-conflicts"
        />
        <MetricCard
          label="Active Reservations"
          value={summaryMetrics.totalReservations}
          variant="compact"
          size="sm"
          testId="metric-reservations"
        />
        <MetricCard
          label="Failed Checks"
          value={summaryMetrics.totalFailedChecks}
          status={summaryMetrics.totalFailedChecks > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed-checks"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Environments by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#3B82F6', '#DC2626']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={typeDistributionData}
            title="Type Distribution"
            description="Environments by type"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38']}
            testId="chart-type-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={readinessDistributionData}
            title="Readiness Status"
            description="Environments by readiness"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#6B7280']}
            testId="chart-readiness-distribution"
          />
        </Card>
      </div>

      {/* Segment Distribution */}
      {segmentDistributionData.length > 0 && (
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={segmentDistributionData}
            title="Environments by Segment"
            description="Number of environments per business segment"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-segment-distribution"
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
        searchPlaceholder="Search environments..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="environment-filter-bar"
      />

      {/* Environments Data Table */}
      <DataTable
        columns={ENVIRONMENT_TABLE_COLUMNS}
        data={filteredEnvironments}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No environments found"
        emptyMessage="No environments match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Environment management table"
        testId="environments-table"
      />

      {/* Environment Detail Modal */}
      {selectedEnv && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedEnv.name || 'Environment Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Environment detail: ${selectedEnv.name || selectedEnv.id}`}
          testId="environment-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canUpdate && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleOpenReservation} ariaLabel="Reserve environment">
                    Reserve
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleOpenStatusUpdate} ariaLabel="Update status">
                    Update Status
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={handleValidateReadiness}
                    loading={isValidating}
                    loadingText="Validating..."
                    ariaLabel="Validate readiness"
                  >
                    Validate Readiness
                  </Button>
                </>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Environment Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedEnv.status && (
                <Badge status={selectedEnv.status} size="md" />
              )}
              {selectedEnv.type && (
                <Badge variant="neutral" size="md">{selectedEnv.type.replace(/_/g, ' ')}</Badge>
              )}
              {selectedEnv.segment && (
                <Badge variant="neutral" size="md">{selectedEnv.segment}</Badge>
              )}
              {selectedEnv.readinessStatus && selectedEnv.readinessStatus.overall && (
                <Badge status={resolveReadinessStatus(selectedEnv.readinessStatus.overall)} size="md">
                  Readiness: {selectedEnv.readinessStatus.overall}
                </Badge>
              )}
              {selectedEnv.readinessStatus && typeof selectedEnv.readinessStatus.score === 'number' && (
                <Badge variant="info" size="md">
                  Score: {selectedEnv.readinessStatus.score}
                </Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="environment-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedEnv.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedEnv.description}</p>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  <MetricCard
                    label="Readiness Score"
                    value={selectedEnv.readinessStatus ? selectedEnv.readinessStatus.score : '—'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Health Checks"
                    value={Array.isArray(selectedEnv.healthChecks) ? selectedEnv.healthChecks.length : 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Open Conflicts"
                    value={Array.isArray(selectedEnv.conflictFlags) ? selectedEnv.conflictFlags.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').length : 0}
                    status={Array.isArray(selectedEnv.conflictFlags) && selectedEnv.conflictFlags.filter((cf) => cf.status === 'open' || cf.status === 'in_progress').length > 0 ? 'warning' : 'healthy'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Active Reservations"
                    value={Array.isArray(selectedEnv.reservations) ? selectedEnv.reservations.filter((r) => r.status === 'active').length : 0}
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Environment Info */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Environment Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>{' '}
                      <span className="text-gray-800 capitalize">{selectedEnv.type ? selectedEnv.type.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedEnv.status || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Segment:</span>{' '}
                      <span className="text-gray-800">{selectedEnv.segment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>{' '}
                      <span className="text-gray-800">{selectedEnv.owner || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">URL:</span>{' '}
                      <span className="text-gray-800 truncate">{selectedEnv.url || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Config Version:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedEnv.configVersion || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Deployment:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedEnv.lastDeployment)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Data Refresh:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedEnv.lastDataRefresh)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedEnv.version || 1}</span>
                    </div>
                  </div>
                </Card>

                {/* Readiness Status */}
                {selectedEnv.readinessStatus && (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Readiness Status</h4>
                    <div className="space-y-0.5">
                      <ProgressBar
                        value={selectedEnv.readinessStatus.score || 0}
                        max={100}
                        size="md"
                        variant="auto"
                        showValue={true}
                        label="Readiness Score"
                        unit="%"
                        thresholds={{ error: 60, warning: 85, success: 100 }}
                        testId="env-readiness-bar"
                      />
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs mt-0.5">
                        <div>
                          <span className="font-medium text-gray-600">Overall:</span>{' '}
                          <Badge status={resolveReadinessStatus(selectedEnv.readinessStatus.overall)} size="sm">
                            {selectedEnv.readinessStatus.overall || '—'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Database:</span>{' '}
                          <Badge status={selectedEnv.readinessStatus.database === 'healthy' ? 'passed' : selectedEnv.readinessStatus.database === 'degraded' ? 'warning' : 'unknown'} size="sm">
                            {selectedEnv.readinessStatus.database || '—'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Services:</span>{' '}
                          <Badge status={selectedEnv.readinessStatus.services === 'healthy' ? 'passed' : selectedEnv.readinessStatus.services === 'degraded' ? 'warning' : 'unknown'} size="sm">
                            {selectedEnv.readinessStatus.services || '—'}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Connectivity:</span>{' '}
                          <Badge status={selectedEnv.readinessStatus.connectivity === 'healthy' ? 'passed' : selectedEnv.readinessStatus.connectivity === 'degraded' ? 'warning' : 'unknown'} size="sm">
                            {selectedEnv.readinessStatus.connectivity || '—'}
                          </Badge>
                        </div>
                      </div>
                      {selectedEnv.readinessStatus.lastChecked && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Last checked: {formatDateTime(selectedEnv.readinessStatus.lastChecked)}
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Applications */}
                {Array.isArray(selectedEnv.applications) && selectedEnv.applications.length > 0 && (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Hosted Applications</h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedEnv.applications.map((app, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{app}</Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Tags */}
                {Array.isArray(selectedEnv.tags) && selectedEnv.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedEnv.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedEnv.created_at)}</div>
                  <div>Updated: {formatDate(selectedEnv.updated_at)}</div>
                </div>
              </div>
            )}

            {/* Health Checks Tab */}
            {detailTab === 'health-checks' && (
              <div className="space-y-2">
                {Array.isArray(selectedEnv.healthChecks) && selectedEnv.healthChecks.length > 0 ? (
                  <>
                    {/* Health Check Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Checks"
                        value={selectedEnv.healthChecks.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={selectedEnv.healthChecks.filter((hc) => hc.status === 'passed').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Warning"
                        value={selectedEnv.healthChecks.filter((hc) => hc.status === 'warning').length}
                        status={selectedEnv.healthChecks.filter((hc) => hc.status === 'warning').length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedEnv.healthChecks.filter((hc) => hc.status === 'failed').length}
                        status={selectedEnv.healthChecks.filter((hc) => hc.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Health Check Chart */}
                    <Card variant="base" padding="md">
                      <ChartPlaceholder
                        type="donut"
                        data={[
                          { label: 'Passed', value: selectedEnv.healthChecks.filter((hc) => hc.status === 'passed').length },
                          { label: 'Warning', value: selectedEnv.healthChecks.filter((hc) => hc.status === 'warning').length },
                          { label: 'Failed', value: selectedEnv.healthChecks.filter((hc) => hc.status === 'failed').length },
                        ].filter((d) => d.value > 0)}
                        title="Health Check Status"
                        description="Health check results"
                        size="sm"
                        showValues={true}
                        showLabels={true}
                        colors={['#78BE20', '#F59E0B', '#DC2626']}
                        testId="chart-health-checks"
                      />
                    </Card>

                    {/* Health Check Table */}
                    <DataTable
                      columns={HEALTH_CHECK_TABLE_COLUMNS}
                      data={selectedEnv.healthChecks}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No health checks"
                      emptyMessage="No health checks configured."
                      ariaLabel="Health checks table"
                      testId="health-checks-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No health checks"
                    description="No health checks are configured for this environment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Reservations Tab */}
            {detailTab === 'reservations' && (
              <div className="space-y-2">
                {Array.isArray(selectedEnv.reservations) && selectedEnv.reservations.length > 0 ? (
                  <>
                    {/* Reservation Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Reservations"
                        value={selectedEnv.reservations.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Active"
                        value={selectedEnv.reservations.filter((r) => r.status === 'active').length}
                        status="active"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Expired"
                        value={selectedEnv.reservations.filter((r) => r.status !== 'active').length}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Reservation Table */}
                    <DataTable
                      columns={RESERVATION_TABLE_COLUMNS}
                      data={selectedEnv.reservations}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No reservations"
                      emptyMessage="No reservations for this environment."
                      ariaLabel="Reservations table"
                      testId="reservations-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No reservations"
                    description="No reservations have been made for this environment."
                    variant="compact"
                    actionLabel={canUpdate ? 'Reserve Now' : undefined}
                    onAction={canUpdate ? handleOpenReservation : undefined}
                  />
                )}

                {canUpdate && selectedEnv.reservations && selectedEnv.reservations.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleOpenReservation} ariaLabel="Add reservation">
                    + Add Reservation
                  </Button>
                )}
              </div>
            )}

            {/* Conflicts Tab */}
            {detailTab === 'conflicts' && (
              <div className="space-y-2">
                {Array.isArray(selectedEnv.conflictFlags) && selectedEnv.conflictFlags.length > 0 ? (
                  <>
                    {/* Conflict Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Conflicts"
                        value={selectedEnv.conflictFlags.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Open"
                        value={selectedEnv.conflictFlags.filter((cf) => cf.status === 'open').length}
                        status={selectedEnv.conflictFlags.filter((cf) => cf.status === 'open').length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="In Progress"
                        value={selectedEnv.conflictFlags.filter((cf) => cf.status === 'in_progress').length}
                        status={selectedEnv.conflictFlags.filter((cf) => cf.status === 'in_progress').length > 0 ? 'in_progress' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Conflict Table */}
                    <DataTable
                      columns={CONFLICT_TABLE_COLUMNS}
                      data={selectedEnv.conflictFlags}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No conflicts"
                      emptyMessage="No conflict flags for this environment."
                      ariaLabel="Conflict flags table"
                      testId="conflicts-table"
                    />

                    {/* Conflict Timeline */}
                    {conflictTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Conflict Timeline</h4>
                        <Timeline
                          entries={conflictTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="conflict-timeline"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No conflicts"
                    description="No conflict flags have been raised for this environment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Capacity Tab */}
            {detailTab === 'capacity' && (
              <div className="space-y-2">
                {selectedEnv.capacity ? (
                  <>
                    {/* Capacity Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {selectedEnv.capacity.cpu && (
                        <MetricCard
                          label="CPU Usage"
                          value={selectedEnv.capacity.cpu.used || 0}
                          unit="%"
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedEnv.capacity.memory && (
                        <MetricCard
                          label="Memory Usage"
                          value={selectedEnv.capacity.memory.used || 0}
                          unit="%"
                          variant="compact"
                          size="sm"
                        />
                      )}
                      {selectedEnv.capacity.storage && (
                        <MetricCard
                          label="Storage"
                          value={`${selectedEnv.capacity.storage.used || 0}/${selectedEnv.capacity.storage.total || 0}`}
                          unit={selectedEnv.capacity.storage.unit || 'GB'}
                          variant="compact"
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Capacity Progress Bars */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Resource Utilization</h4>
                      <div className="space-y-0.5">
                        {selectedEnv.capacity.cpu && (
                          <ProgressBar
                            value={selectedEnv.capacity.cpu.used || 0}
                            max={selectedEnv.capacity.cpu.total || 100}
                            size="md"
                            variant="auto"
                            showValue={true}
                            label="CPU"
                            unit="%"
                            thresholds={{ error: 90, warning: 75, success: 100 }}
                          />
                        )}
                        {selectedEnv.capacity.memory && (
                          <ProgressBar
                            value={selectedEnv.capacity.memory.used || 0}
                            max={selectedEnv.capacity.memory.total || 100}
                            size="md"
                            variant="auto"
                            showValue={true}
                            label="Memory"
                            unit="%"
                            thresholds={{ error: 90, warning: 80, success: 100 }}
                          />
                        )}
                        {selectedEnv.capacity.storage && (
                          <ProgressBar
                            value={selectedEnv.capacity.storage.used || 0}
                            max={selectedEnv.capacity.storage.total || 100}
                            size="md"
                            variant="auto"
                            showValue={true}
                            label={`Storage (${selectedEnv.capacity.storage.unit || 'GB'})`}
                            valueLabel={`${selectedEnv.capacity.storage.used || 0} / ${selectedEnv.capacity.storage.total || 0} ${selectedEnv.capacity.storage.unit || 'GB'}`}
                          />
                        )}
                      </div>
                    </Card>

                    {/* Capacity Chart */}
                    {capacityData.length > 0 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="bar"
                          data={capacityData}
                          title="Resource Usage (%)"
                          description="Current resource utilization"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          colors={['#024E38', '#78BE20', '#3B82F6']}
                          testId="chart-capacity"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No capacity data"
                    description="No capacity information is available for this environment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Applications Tab */}
            {detailTab === 'applications' && (
              <div className="space-y-2">
                {Array.isArray(selectedEnv.applications) && selectedEnv.applications.length > 0 ? (
                  <>
                    <MetricCard
                      label="Hosted Applications"
                      value={selectedEnv.applications.length}
                      variant="compact"
                      size="sm"
                    />

                    <div className="space-y-0.5">
                      {selectedEnv.applications.map((app, idx) => (
                        <div
                          key={idx}
                          className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                        >
                          <span className="text-sm font-medium text-deep-forest-teal-800">{app}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No applications"
                    description="No applications are hosted on this environment."
                    variant="compact"
                  />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reservation Form Modal */}
      <Modal
        isOpen={isReservationOpen}
        onClose={handleCloseReservation}
        title={`Reserve ${selectedEnv ? selectedEnv.name : 'Environment'}`}
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Reserve environment form"
        testId="reservation-form-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseReservation} disabled={isReserving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleReservationSubmit}
              loading={isReserving}
              loadingText="Reserving..."
              ariaLabel="Confirm reservation"
            >
              Reserve
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <FormField
            label="Purpose"
            name="purpose"
            type="text"
            value={reservationForm.purpose}
            onChange={handleReservationFormChange}
            placeholder="e.g., Regression test execution"
            required={true}
            error={reservationErrors.purpose}
            testId="form-purpose"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={reservationForm.startDate}
              onChange={handleReservationFormChange}
              required={true}
              error={reservationErrors.startDate}
              testId="form-start-date"
            />
            <FormField
              label="End Date"
              name="endDate"
              type="date"
              value={reservationForm.endDate}
              onChange={handleReservationFormChange}
              required={true}
              error={reservationErrors.endDate}
              testId="form-end-date"
            />
          </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusUpdateOpen}
        onClose={handleCloseStatusUpdate}
        title="Update Environment Status"
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Update environment status"
        testId="status-update-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseStatusUpdate} disabled={isUpdatingStatus}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmStatusUpdate}
              loading={isUpdatingStatus}
              loadingText="Updating..."
              disabled={!newStatus}
              ariaLabel="Confirm status update"
            >
              Update Status
            </Button>
          </>
        }
      >
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Current status: <Badge status={selectedEnv ? selectedEnv.status : 'unknown'} size="sm" />
          </p>
          <FormField
            label="New Status"
            name="newStatus"
            type="select"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={STATUS_OPTIONS}
            required={true}
            testId="form-new-status"
          />
        </div>
      </Modal>
    </div>
  );
}