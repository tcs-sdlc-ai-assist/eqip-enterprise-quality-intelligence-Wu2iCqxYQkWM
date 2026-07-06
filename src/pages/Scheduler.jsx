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
 * @module Scheduler
 * Test Execution Scheduler page for eQIP Quality Intelligence.
 *
 * Configuration and management of test execution schedules with create, edit,
 * pause, resume, disable, delete workflows. Displays schedule list with DataTable,
 * create/edit forms with FormField, and detail modal with run history and
 * configuration details.
 * Uses DataTable, Modal, FormField, Badge, ConfirmDialog.
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
 * Helper to format duration in milliseconds to a human-readable string.
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted duration string.
 */
function formatDuration(ms) {
  if (ms === null || ms === undefined || typeof ms !== 'number') return '—';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
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
 * Frequency options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'on_demand', label: 'On Demand' },
];

/**
 * Status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'disabled', label: 'Disabled' },
];

/**
 * Environment options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const ENVIRONMENT_OPTIONS = [
  { value: 'staging', label: 'Staging' },
  { value: 'uat', label: 'UAT' },
  { value: 'performance', label: 'Performance' },
  { value: 'development', label: 'Development' },
];

/**
 * Columns definition for the schedules data table.
 * @type {Array<object>}
 */
const SCHEDULE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Schedule Name',
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
    key: 'testSuiteName',
    label: 'Test Suite',
    sortable: true,
    width: '180px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 truncate">{value}</span>;
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
    width: '90px',
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
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'nextRun',
    label: 'Next Run',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">N/A</span>;
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
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
 * Initial form state for creating a new schedule.
 * @returns {object} The initial form state.
 */
function getInitialFormState() {
  return {
    name: '',
    description: '',
    testSuiteId: '',
    testSuiteName: '',
    application: '',
    segment: '',
    frequency: 'daily',
    cronExpression: '',
    environment: 'staging',
    notifyOnFailure: true,
    retryOnFailure: false,
    maxRetries: '0',
  };
}

/**
 * Scheduler page component.
 *
 * @returns {React.ReactElement} The rendered Scheduler page.
 */
export default function Scheduler() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes, createEntity, updateEntity, removeEntity } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [testSuites, setTestSuites] = useState([]);

  // Detail modal state
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Create/Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(getInitialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pause confirm state
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  // Resume confirm state
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Disable confirm state
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const canCreate = canPerform('create', 'test-assets');
  const canUpdate = canPerform('update', 'test-assets');
  const canDelete = canPerform('delete', 'test-assets');
  const canExport = canPerform('export', 'test-assets');

  /**
   * Load schedules and test suites from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const schedData = getAll(entityTypes.SCHEDULES);
      const suiteData = getAll(entityTypes.TEST_SUITES);
      setSchedules(Array.isArray(schedData) ? schedData : []);
      setTestSuites(Array.isArray(suiteData) ? suiteData : []);
    } catch (err) {
      console.error('[Scheduler] Error loading data:', err);
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
    for (let i = 0; i < schedules.length; i++) {
      if (schedules[i].application) {
        apps.add(schedules[i].application);
      }
    }
    return [...apps].sort().map((a) => ({ value: a, label: a }));
  }, [schedules]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    const segments = new Set();
    for (let i = 0; i < schedules.length; i++) {
      if (schedules[i].segment) {
        segments.add(schedules[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [schedules]);

  /**
   * Test suite options for select fields.
   */
  const testSuiteOptions = useMemo(() => {
    return testSuites.map((ts) => ({
      value: ts.id,
      label: ts.name || ts.id,
    }));
  }, [testSuites]);

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
        key: 'frequency',
        label: 'Frequency',
        options: FREQUENCY_OPTIONS,
      },
      {
        key: 'environment',
        label: 'Environment',
        options: ENVIRONMENT_OPTIONS,
      },
      {
        key: 'lastRunStatus',
        label: 'Last Run',
        options: [
          { value: 'success', label: 'Success' },
          { value: 'failed', label: 'Failed' },
        ],
      },
    ];
  }, []);

  /**
   * Filtered schedules based on filter values and search.
   */
  const filteredSchedules = useMemo(() => {
    let result = [...schedules];

    if (filterValues.segment) {
      result = result.filter((s) => s.segment === filterValues.segment);
    }
    if (filterValues.application) {
      result = result.filter((s) => s.application === filterValues.application);
    }
    if (filterValues.status) {
      result = result.filter((s) => s.status === filterValues.status);
    }
    if (filterValues.frequency) {
      result = result.filter((s) => s.frequency === filterValues.frequency);
    }
    if (filterValues.environment) {
      result = result.filter((s) => s.environment === filterValues.environment);
    }
    if (filterValues.lastRunStatus) {
      result = result.filter((s) => s.lastRunStatus === filterValues.lastRunStatus);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((s) => {
        const name = s.name ? s.name.toLowerCase() : '';
        const app = s.application ? s.application.toLowerCase() : '';
        const seg = s.segment ? s.segment.toLowerCase() : '';
        const suite = s.testSuiteName ? s.testSuiteName.toLowerCase() : '';
        const desc = s.description ? s.description.toLowerCase() : '';
        const env = s.environment ? s.environment.toLowerCase() : '';
        return (
          name.includes(queryLower) ||
          app.includes(queryLower) ||
          seg.includes(queryLower) ||
          suite.includes(queryLower) ||
          desc.includes(queryLower) ||
          env.includes(queryLower)
        );
      });
    }

    return result;
  }, [schedules, filterValues, searchValue]);

  /**
   * Summary metrics for the scheduler dashboard.
   */
  const summaryMetrics = useMemo(() => {
    const total = schedules.length;
    const active = schedules.filter((s) => s.status === 'active').length;
    const paused = schedules.filter((s) => s.status === 'paused').length;
    const disabled = schedules.filter((s) => s.status === 'disabled').length;
    const lastRunSuccess = schedules.filter((s) => s.lastRunStatus === 'success').length;
    const lastRunFailed = schedules.filter((s) => s.lastRunStatus === 'failed').length;
    const retryEnabled = schedules.filter((s) => s.retryOnFailure === true).length;

    let totalDuration = 0;
    let durationCount = 0;
    for (let i = 0; i < schedules.length; i++) {
      if (typeof schedules[i].lastRunDurationMs === 'number' && schedules[i].lastRunDurationMs > 0) {
        totalDuration += schedules[i].lastRunDurationMs;
        durationCount += 1;
      }
    }
    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    let daily = 0;
    let weekly = 0;
    let biWeekly = 0;
    let monthly = 0;
    let onDemand = 0;
    for (let i = 0; i < schedules.length; i++) {
      if (schedules[i].frequency === 'daily') daily += 1;
      else if (schedules[i].frequency === 'weekly') weekly += 1;
      else if (schedules[i].frequency === 'bi-weekly') biWeekly += 1;
      else if (schedules[i].frequency === 'monthly') monthly += 1;
      else if (schedules[i].frequency === 'on_demand') onDemand += 1;
    }

    return {
      total,
      active,
      paused,
      disabled,
      lastRunSuccess,
      lastRunFailed,
      retryEnabled,
      avgDuration,
      daily,
      weekly,
      biWeekly,
      monthly,
      onDemand,
    };
  }, [schedules]);

  /**
   * Status distribution chart data.
   */
  const statusDistributionData = useMemo(() => {
    return [
      { label: 'Active', value: summaryMetrics.active },
      { label: 'Paused', value: summaryMetrics.paused },
      { label: 'Disabled', value: summaryMetrics.disabled },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Frequency distribution chart data.
   */
  const frequencyDistributionData = useMemo(() => {
    return [
      { label: 'Daily', value: summaryMetrics.daily },
      { label: 'Weekly', value: summaryMetrics.weekly },
      { label: 'Bi-Weekly', value: summaryMetrics.biWeekly },
      { label: 'Monthly', value: summaryMetrics.monthly },
      { label: 'On Demand', value: summaryMetrics.onDemand },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Last run status distribution chart data.
   */
  const lastRunDistributionData = useMemo(() => {
    return [
      { label: 'Success', value: summaryMetrics.lastRunSuccess },
      { label: 'Failed', value: summaryMetrics.lastRunFailed },
      { label: 'No Run', value: summaryMetrics.total - summaryMetrics.lastRunSuccess - summaryMetrics.lastRunFailed },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Application distribution chart data.
   */
  const applicationDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < schedules.length; i++) {
      const app = schedules[i].application || 'Unknown';
      counts[app] = (counts[app] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [schedules]);

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
   * Handle row click to open schedule detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedSchedule(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedSchedule(null);
    setDetailTab('overview');
  }, []);

  /**
   * Open create form.
   */
  const handleOpenCreate = useCallback(() => {
    setFormData(getInitialFormState());
    setFormErrors({});
    setIsEditing(false);
    setIsFormOpen(true);
  }, []);

  /**
   * Open edit form for the selected schedule.
   */
  const handleOpenEdit = useCallback(() => {
    if (!selectedSchedule) return;
    setFormData({
      name: selectedSchedule.name || '',
      description: selectedSchedule.description || '',
      testSuiteId: selectedSchedule.testSuiteId || '',
      testSuiteName: selectedSchedule.testSuiteName || '',
      application: selectedSchedule.application || '',
      segment: selectedSchedule.segment || '',
      frequency: selectedSchedule.frequency || 'daily',
      cronExpression: selectedSchedule.cronExpression || '',
      environment: selectedSchedule.environment || 'staging',
      notifyOnFailure: selectedSchedule.notifyOnFailure !== false,
      retryOnFailure: selectedSchedule.retryOnFailure === true,
      maxRetries: selectedSchedule.maxRetries !== null && selectedSchedule.maxRetries !== undefined ? String(selectedSchedule.maxRetries) : '0',
    });
    setFormErrors({});
    setIsEditing(true);
    setIsFormOpen(true);
  }, [selectedSchedule]);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setFormData(getInitialFormState());
    setFormErrors({});
    setIsEditing(false);
  }, []);

  /**
   * Handle form field change.
   */
  const handleFormChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [formErrors]);

  /**
   * Handle checkbox change for notifyOnFailure and retryOnFailure.
   */
  const handleCheckboxChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }, []);

  /**
   * Validate form data.
   * @returns {boolean} True if valid.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Schedule name is required.';
    }
    if (!formData.frequency) {
      errors.frequency = 'Frequency is required.';
    }
    if (!formData.environment) {
      errors.environment = 'Environment is required.';
    }
    if (formData.maxRetries !== '' && formData.maxRetries !== null && formData.maxRetries !== undefined) {
      const retries = Number(formData.maxRetries);
      if (isNaN(retries) || retries < 0 || !Number.isInteger(retries)) {
        errors.maxRetries = 'Max retries must be a non-negative integer.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Handle form submit (create or update).
   */
  const handleFormSubmit = useCallback(() => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const selectedSuite = testSuites.find((ts) => ts.id === formData.testSuiteId);

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        testSuiteId: formData.testSuiteId || null,
        testSuiteName: selectedSuite ? selectedSuite.name : formData.testSuiteName || '',
        application: formData.application || (selectedSuite ? selectedSuite.application : ''),
        segment: formData.segment || (selectedSuite ? selectedSuite.segment : ''),
        frequency: formData.frequency,
        cronExpression: formData.cronExpression || null,
        environment: formData.environment,
        notifyOnFailure: formData.notifyOnFailure !== false,
        retryOnFailure: formData.retryOnFailure === true,
        maxRetries: formData.maxRetries !== '' ? Number(formData.maxRetries) : 0,
      };

      if (isEditing && selectedSchedule) {
        const updated = updateEntity(entityTypes.SCHEDULES, selectedSchedule.id, data, userId);
        if (updated) {
          logAction(userId, 'Update Schedule', 'schedules', selectedSchedule.id, `Updated schedule: ${data.name}`);
          setSelectedSchedule(updated);
          handleCloseForm();
          loadData();
        }
      } else {
        data.status = 'active';
        data.lastRun = null;
        data.lastRunStatus = null;
        data.lastRunDurationMs = null;
        data.nextRun = null;
        data.recipients = [];
        data.tags = [];

        const created = createEntity(entityTypes.SCHEDULES, data, userId);
        if (created) {
          logAction(userId, 'Create Schedule', 'schedules', created.id, `Created schedule: ${data.name}`);
          handleCloseForm();
          loadData();
        }
      }
    } catch (err) {
      console.error('[Scheduler] Error saving schedule:', err);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, isEditing, selectedSchedule, userId, entityTypes, updateEntity, createEntity, handleCloseForm, loadData, testSuites]);

  /**
   * Handle delete schedule.
   */
  const handleOpenDelete = useCallback(() => {
    if (!selectedSchedule) return;
    setScheduleToDelete(selectedSchedule);
    setIsDeleteOpen(true);
  }, [selectedSchedule]);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setScheduleToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!scheduleToDelete) return;

    setIsDeleting(true);

    try {
      const deleted = removeEntity(entityTypes.SCHEDULES, scheduleToDelete.id, userId);
      if (deleted) {
        logAction(userId, 'Delete Schedule', 'schedules', scheduleToDelete.id, `Deleted schedule: ${scheduleToDelete.name || scheduleToDelete.id}`);
        handleCloseDelete();
        handleCloseDetail();
        loadData();
      }
    } catch (err) {
      console.error('[Scheduler] Error deleting schedule:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [scheduleToDelete, userId, entityTypes, removeEntity, handleCloseDelete, handleCloseDetail, loadData]);

  /**
   * Handle pause schedule.
   */
  const handleOpenPause = useCallback(() => {
    if (!selectedSchedule) return;
    setIsPauseOpen(true);
  }, [selectedSchedule]);

  const handleClosePause = useCallback(() => {
    setIsPauseOpen(false);
  }, []);

  const handleConfirmPause = useCallback(() => {
    if (!selectedSchedule) return;

    setIsPausing(true);

    try {
      const updated = updateEntity(entityTypes.SCHEDULES, selectedSchedule.id, {
        status: 'paused',
        nextRun: null,
      }, userId);

      if (updated) {
        logAction(userId, 'Pause Schedule', 'schedules', selectedSchedule.id, `Paused schedule: ${selectedSchedule.name || selectedSchedule.id}`);
        setSelectedSchedule(updated);
        handleClosePause();
        loadData();
      }
    } catch (err) {
      console.error('[Scheduler] Error pausing schedule:', err);
    } finally {
      setIsPausing(false);
    }
  }, [selectedSchedule, userId, entityTypes, updateEntity, handleClosePause, loadData]);

  /**
   * Handle resume schedule.
   */
  const handleOpenResume = useCallback(() => {
    if (!selectedSchedule) return;
    setIsResumeOpen(true);
  }, [selectedSchedule]);

  const handleCloseResume = useCallback(() => {
    setIsResumeOpen(false);
  }, []);

  const handleConfirmResume = useCallback(() => {
    if (!selectedSchedule) return;

    setIsResuming(true);

    try {
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setDate(nextRun.getDate() + 1);

      const updated = updateEntity(entityTypes.SCHEDULES, selectedSchedule.id, {
        status: 'active',
        nextRun: nextRun.toISOString(),
      }, userId);

      if (updated) {
        logAction(userId, 'Resume Schedule', 'schedules', selectedSchedule.id, `Resumed schedule: ${selectedSchedule.name || selectedSchedule.id}`);
        setSelectedSchedule(updated);
        handleCloseResume();
        loadData();
      }
    } catch (err) {
      console.error('[Scheduler] Error resuming schedule:', err);
    } finally {
      setIsResuming(false);
    }
  }, [selectedSchedule, userId, entityTypes, updateEntity, handleCloseResume, loadData]);

  /**
   * Handle disable schedule.
   */
  const handleOpenDisable = useCallback(() => {
    if (!selectedSchedule) return;
    setIsDisableOpen(true);
  }, [selectedSchedule]);

  const handleCloseDisable = useCallback(() => {
    setIsDisableOpen(false);
  }, []);

  const handleConfirmDisable = useCallback(() => {
    if (!selectedSchedule) return;

    setIsDisabling(true);

    try {
      const updated = updateEntity(entityTypes.SCHEDULES, selectedSchedule.id, {
        status: 'disabled',
        nextRun: null,
      }, userId);

      if (updated) {
        logAction(userId, 'Disable Schedule', 'schedules', selectedSchedule.id, `Disabled schedule: ${selectedSchedule.name || selectedSchedule.id}`);
        setSelectedSchedule(updated);
        handleCloseDisable();
        loadData();
      }
    } catch (err) {
      console.error('[Scheduler] Error disabling schedule:', err);
    } finally {
      setIsDisabling(false);
    }
  }, [selectedSchedule, userId, entityTypes, updateEntity, handleCloseDisable, loadData]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredSchedules.map((s) => ({
      ID: s.id || '',
      Name: s.name || '',
      'Test Suite': s.testSuiteName || '',
      Application: s.application || '',
      Segment: s.segment || '',
      Frequency: s.frequency || '',
      Status: s.status || '',
      Environment: s.environment || '',
      'Cron Expression': s.cronExpression || '',
      'Last Run Status': s.lastRunStatus || '',
      'Last Run': s.lastRun || '',
      'Next Run': s.nextRun || '',
      'Last Run Duration (ms)': typeof s.lastRunDurationMs === 'number' ? s.lastRunDurationMs : '',
      'Notify On Failure': s.notifyOnFailure === true ? 'Yes' : 'No',
      'Retry On Failure': s.retryOnFailure === true ? 'Yes' : 'No',
      'Max Retries': s.maxRetries !== null && s.maxRetries !== undefined ? s.maxRetries : '',
    }));

    exportToCSV(exportData, 'test-execution-schedules');

    logAction(userId, 'Export Schedules CSV', 'schedules', 'bulk', `Exported ${exportData.length} schedules to CSV`);
  }, [canExport, filteredSchedules, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredSchedules.map((s) => ({
      ID: s.id || '',
      Name: s.name || '',
      'Test Suite': s.testSuiteName || '',
      Application: s.application || '',
      Segment: s.segment || '',
      Frequency: s.frequency || '',
      Status: s.status || '',
      Environment: s.environment || '',
      'Cron Expression': s.cronExpression || '',
      'Last Run Status': s.lastRunStatus || '',
      'Last Run': s.lastRun || '',
      'Next Run': s.nextRun || '',
      'Last Run Duration (ms)': typeof s.lastRunDurationMs === 'number' ? s.lastRunDurationMs : '',
      'Notify On Failure': s.notifyOnFailure === true ? 'Yes' : 'No',
      'Retry On Failure': s.retryOnFailure === true ? 'Yes' : 'No',
      'Max Retries': s.maxRetries !== null && s.maxRetries !== undefined ? s.maxRetries : '',
    }));

    exportToExcel(exportData, 'test-execution-schedules');

    logAction(userId, 'Export Schedules Excel', 'schedules', 'bulk', `Exported ${exportData.length} schedules to Excel`);
  }, [canExport, filteredSchedules, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedSchedule) return [];

    const recipientCount = Array.isArray(selectedSchedule.recipients) ? selectedSchedule.recipients.length : 0;
    const tagCount = Array.isArray(selectedSchedule.tags) ? selectedSchedule.tags.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'configuration', label: 'Configuration' },
      { key: 'recipients', label: 'Recipients', badge: recipientCount > 0 ? String(recipientCount) : undefined },
      { key: 'tags', label: 'Tags', badge: tagCount > 0 ? String(tagCount) : undefined },
    ];
  }, [selectedSchedule]);

  /**
   * Duration sparkline data from schedules.
   */
  const durationSparklineData = useMemo(() => {
    return schedules
      .filter((s) => typeof s.lastRunDurationMs === 'number' && s.lastRunDurationMs > 0)
      .map((s) => s.lastRunDurationMs)
      .slice(0, 20);
  }, [schedules]);

  if (isLoading && schedules.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading schedules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="scheduler">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Test Execution Scheduler</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Configure and manage automated test execution schedules
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
          {canCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              ariaLabel="Create new schedule"
            >
              + New Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <MetricCard
          label="Total Schedules"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-schedules"
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
          label="Paused"
          value={summaryMetrics.paused}
          status={summaryMetrics.paused > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-paused"
        />
        <MetricCard
          label="Disabled"
          value={summaryMetrics.disabled}
          status={summaryMetrics.disabled > 0 ? 'inactive' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-disabled"
        />
        <MetricCard
          label="Last Run Success"
          value={summaryMetrics.lastRunSuccess}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-last-run-success"
        />
        <MetricCard
          label="Last Run Failed"
          value={summaryMetrics.lastRunFailed}
          status={summaryMetrics.lastRunFailed > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-last-run-failed"
        />
        <MetricCard
          label="Avg Duration"
          value={summaryMetrics.avgDuration > 0 ? formatDuration(summaryMetrics.avgDuration) : '—'}
          sparklineData={durationSparklineData.length >= 2 ? durationSparklineData : undefined}
          variant="compact"
          size="sm"
          testId="metric-avg-duration"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Schedules by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#6B7280']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={frequencyDistributionData}
            title="Frequency Distribution"
            description="Schedules by execution frequency"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B', '#6B7280']}
            testId="chart-frequency-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={lastRunDistributionData}
            title="Last Run Results"
            description="Last execution outcome"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#6B7280']}
            testId="chart-last-run-distribution"
          />
        </Card>
      </div>

      {/* Application Distribution */}
      {applicationDistributionData.length > 0 && (
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={applicationDistributionData}
            title="Schedules by Application"
            description="Number of schedules per application"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-app-distribution"
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
        searchPlaceholder="Search schedules..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="scheduler-filter-bar"
      />

      {/* Schedules Data Table */}
      <DataTable
        columns={SCHEDULE_TABLE_COLUMNS}
        data={filteredSchedules}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No schedules found"
        emptyMessage="No schedules match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Test execution schedules table"
        testId="schedules-table"
      />

      {/* Schedule Detail Modal */}
      {selectedSchedule && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedSchedule.name || 'Schedule Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Schedule detail: ${selectedSchedule.name || selectedSchedule.id}`}
          testId="schedule-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canUpdate && selectedSchedule.status === 'active' && (
                <Button variant="ghost" size="sm" onClick={handleOpenPause} ariaLabel="Pause schedule">
                  Pause
                </Button>
              )}
              {canUpdate && (selectedSchedule.status === 'paused' || selectedSchedule.status === 'disabled') && (
                <Button variant="accent" size="sm" onClick={handleOpenResume} ariaLabel="Resume schedule">
                  Resume
                </Button>
              )}
              {canUpdate && selectedSchedule.status !== 'disabled' && (
                <Button variant="ghost" size="sm" onClick={handleOpenDisable} ariaLabel="Disable schedule">
                  Disable
                </Button>
              )}
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenEdit} ariaLabel="Edit schedule">
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleOpenDelete} ariaLabel="Delete schedule">
                  Delete
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Schedule Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedSchedule.status && (
                <Badge status={selectedSchedule.status} size="md" />
              )}
              {selectedSchedule.frequency && (
                <Badge variant="neutral" size="md">{selectedSchedule.frequency.replace(/_/g, ' ')}</Badge>
              )}
              {selectedSchedule.environment && (
                <Badge variant="neutral" size="md">{selectedSchedule.environment}</Badge>
              )}
              {selectedSchedule.application && (
                <Badge variant="neutral" size="md">{selectedSchedule.application}</Badge>
              )}
              {selectedSchedule.segment && (
                <Badge variant="neutral" size="md">{selectedSchedule.segment}</Badge>
              )}
              {selectedSchedule.lastRunStatus && (
                <Badge status={selectedSchedule.lastRunStatus} size="md">
                  Last: {selectedSchedule.lastRunStatus}
                </Badge>
              )}
              {selectedSchedule.retryOnFailure && (
                <Badge variant="info" size="md">Retry Enabled</Badge>
              )}
              {selectedSchedule.notifyOnFailure && (
                <Badge variant="info" size="md">Notify on Failure</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="schedule-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedSchedule.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedSchedule.description}</p>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  <MetricCard
                    label="Status"
                    value={selectedSchedule.status ? selectedSchedule.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                    status={selectedSchedule.status || 'unknown'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Last Run"
                    value={selectedSchedule.lastRunStatus ? selectedSchedule.lastRunStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
                    status={selectedSchedule.lastRunStatus || 'unknown'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Duration"
                    value={typeof selectedSchedule.lastRunDurationMs === 'number' ? formatDuration(selectedSchedule.lastRunDurationMs) : '—'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Max Retries"
                    value={selectedSchedule.maxRetries !== null && selectedSchedule.maxRetries !== undefined ? selectedSchedule.maxRetries : 0}
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Schedule Info */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Schedule Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Test Suite:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.testSuiteName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Suite ID:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedSchedule.testSuiteId || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Application:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.application || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Segment:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.segment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Frequency:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.frequency ? selectedSchedule.frequency.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Cron:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedSchedule.cronExpression || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Environment:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.environment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.status || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Run:</span>{' '}
                      <span className="text-gray-800">{formatDateTime(selectedSchedule.lastRun)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Next Run:</span>{' '}
                      <span className="text-gray-800">{formatDateTime(selectedSchedule.nextRun)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Run Status:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.lastRunStatus || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Duration:</span>{' '}
                      <span className="text-gray-800">{typeof selectedSchedule.lastRunDurationMs === 'number' ? formatDuration(selectedSchedule.lastRunDurationMs) : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Notify on Failure:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.notifyOnFailure ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Retry on Failure:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.retryOnFailure ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Max Retries:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.maxRetries || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.owner || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedSchedule.version || 1}</span>
                    </div>
                  </div>
                </Card>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedSchedule.created_at)}</div>
                  <div>Updated: {formatDate(selectedSchedule.updated_at)}</div>
                  {selectedSchedule.created_by && <div>Created By: {selectedSchedule.created_by}</div>}
                  {selectedSchedule.updated_by && <div>Updated By: {selectedSchedule.updated_by}</div>}
                </div>
              </div>
            )}

            {/* Configuration Tab */}
            {detailTab === 'configuration' && (
              <div className="space-y-2">
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Execution Configuration</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Frequency</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.frequency ? selectedSchedule.frequency.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Cron Expression</span>
                      <span className="text-xs text-gray-600 font-mono">{selectedSchedule.cronExpression || 'Not configured'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Environment</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.environment || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Notify on Failure</span>
                      <Badge status={selectedSchedule.notifyOnFailure ? 'active' : 'inactive'} size="sm">
                        {selectedSchedule.notifyOnFailure ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Retry on Failure</span>
                      <Badge status={selectedSchedule.retryOnFailure ? 'active' : 'inactive'} size="sm">
                        {selectedSchedule.retryOnFailure ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Max Retries</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.maxRetries || 0}</span>
                    </div>
                  </div>
                </Card>

                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Test Suite Details</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Suite Name</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.testSuiteName || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Suite ID</span>
                      <span className="text-xs text-gray-600 font-mono">{selectedSchedule.testSuiteId || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Application</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.application || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Segment</span>
                      <span className="text-xs text-gray-600">{selectedSchedule.segment || '—'}</span>
                    </div>
                  </div>
                </Card>

                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Run History Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Last Run:</span>{' '}
                      <span className="text-gray-800">{formatDateTime(selectedSchedule.lastRun)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Status:</span>{' '}
                      {selectedSchedule.lastRunStatus ? <Badge status={selectedSchedule.lastRunStatus} size="sm" /> : <span className="text-gray-400">—</span>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Duration:</span>{' '}
                      <span className="text-gray-800">{typeof selectedSchedule.lastRunDurationMs === 'number' ? formatDuration(selectedSchedule.lastRunDurationMs) : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Next Run:</span>{' '}
                      <span className="text-gray-800">{formatDateTime(selectedSchedule.nextRun)}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Recipients Tab */}
            {detailTab === 'recipients' && (
              <div>
                {Array.isArray(selectedSchedule.recipients) && selectedSchedule.recipients.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedSchedule.recipients.map((recipient, idx) => (
                      <div
                        key={recipient || idx}
                        className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <span className="text-xs font-medium text-deep-forest-teal-700">{recipient}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recipients configured"
                    description="No notification recipients have been configured for this schedule."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Tags Tab */}
            {detailTab === 'tags' && (
              <div>
                {Array.isArray(selectedSchedule.tags) && selectedSchedule.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedSchedule.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No tags"
                    description="No tags have been added to this schedule."
                    variant="compact"
                  />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={isEditing ? 'Edit Schedule' : 'Create New Schedule'}
        size="lg"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={isEditing ? 'Edit schedule form' : 'Create schedule form'}
        testId="schedule-form-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleFormSubmit}
              loading={isSaving}
              loadingText="Saving..."
              ariaLabel={isEditing ? 'Save changes' : 'Create schedule'}
            >
              {isEditing ? 'Save Changes' : 'Create Schedule'}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <FormField
            label="Schedule Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter schedule name"
            required={true}
            error={formErrors.name}
            testId="form-name"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Describe the schedule..."
            rows={2}
            testId="form-description"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Test Suite"
              name="testSuiteId"
              type="select"
              value={formData.testSuiteId}
              onChange={handleFormChange}
              options={testSuiteOptions}
              placeholder="Select test suite"
              testId="form-test-suite"
            />
            <FormField
              label="Frequency"
              name="frequency"
              type="select"
              value={formData.frequency}
              onChange={handleFormChange}
              options={FREQUENCY_OPTIONS}
              required={true}
              error={formErrors.frequency}
              testId="form-frequency"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Environment"
              name="environment"
              type="select"
              value={formData.environment}
              onChange={handleFormChange}
              options={ENVIRONMENT_OPTIONS}
              required={true}
              error={formErrors.environment}
              testId="form-environment"
            />
            <FormField
              label="Cron Expression"
              name="cronExpression"
              type="text"
              value={formData.cronExpression}
              onChange={handleFormChange}
              placeholder="e.g., 0 2 * * *"
              hint="Standard cron format (minute hour day month weekday)"
              testId="form-cron"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Application"
              name="application"
              type="select"
              value={formData.application}
              onChange={handleFormChange}
              options={applicationOptions}
              placeholder="Select application"
              testId="form-application"
            />
            <FormField
              label="Segment"
              name="segment"
              type="select"
              value={formData.segment}
              onChange={handleFormChange}
              options={segmentOptions}
              placeholder="Select segment"
              testId="form-segment"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <FormField
              label="Max Retries"
              name="maxRetries"
              type="number"
              value={formData.maxRetries}
              onChange={handleFormChange}
              placeholder="e.g., 2"
              min={0}
              error={formErrors.maxRetries}
              testId="form-max-retries"
            />
            <FormField
              label="Notify on Failure"
              name="notifyOnFailure"
              type="checkbox"
              checked={formData.notifyOnFailure}
              onChange={handleCheckboxChange}
              testId="form-notify-on-failure"
            />
            <FormField
              label="Retry on Failure"
              name="retryOnFailure"
              type="checkbox"
              checked={formData.retryOnFailure}
              onChange={handleCheckboxChange}
              testId="form-retry-on-failure"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Schedule"
        message={`Are you sure you want to delete "${scheduleToDelete ? scheduleToDelete.name : ''}"? This action cannot be undone. All scheduled executions will be cancelled.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        loadingText="Deleting..."
        testId="schedule-delete-dialog"
      />

      {/* Pause Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isPauseOpen}
        onClose={handleClosePause}
        onConfirm={handleConfirmPause}
        title="Pause Schedule"
        message={`Are you sure you want to pause "${selectedSchedule ? selectedSchedule.name : ''}"? Scheduled executions will be suspended until the schedule is resumed.`}
        variant="warning"
        confirmLabel="Pause"
        cancelLabel="Cancel"
        loading={isPausing}
        loadingText="Pausing..."
        testId="schedule-pause-dialog"
      />

      {/* Resume Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResumeOpen}
        onClose={handleCloseResume}
        onConfirm={handleConfirmResume}
        title="Resume Schedule"
        message={`Are you sure you want to resume "${selectedSchedule ? selectedSchedule.name : ''}"? Scheduled executions will be reactivated.`}
        variant="info"
        confirmLabel="Resume"
        cancelLabel="Cancel"
        loading={isResuming}
        loadingText="Resuming..."
        testId="schedule-resume-dialog"
      />

      {/* Disable Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDisableOpen}
        onClose={handleCloseDisable}
        onConfirm={handleConfirmDisable}
        title="Disable Schedule"
        message={`Are you sure you want to disable "${selectedSchedule ? selectedSchedule.name : ''}"? The schedule will be deactivated and no further executions will occur until it is re-enabled.`}
        variant="warning"
        confirmLabel="Disable"
        cancelLabel="Cancel"
        loading={isDisabling}
        loadingText="Disabling..."
        testId="schedule-disable-dialog"
      />
    </div>
  );
}