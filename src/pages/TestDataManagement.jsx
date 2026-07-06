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
import Stepper from '../components/common/Stepper.jsx';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module TestDataManagement
 * Test Data Management page for eQIP Quality Intelligence.
 *
 * Manages test data assets with request, provision, refresh, mask, retire,
 * and audit workflows. Displays test data sets with DataTable, create/edit
 * forms with FormField, detail modal with refresh history, quality checks,
 * masking status, and provisioning workflow via Stepper.
 * Uses DataTable, FilterBar, Modal, FormField, Badge, Stepper.
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
 * Helper to format bytes to a human-readable string.
 * @param {number} bytes - The number of bytes.
 * @returns {string} Formatted size string.
 */
function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || typeof bytes !== 'number') return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Resolve masking status to a badge status string.
 * @param {string} status - The masking status.
 * @returns {string} The badge status string.
 */
function resolveMaskingStatus(status) {
  if (!status) return 'unknown';
  if (status === 'fully_masked') return 'passed';
  if (status === 'partially_masked') return 'warning';
  if (status === 'not_applicable') return 'neutral';
  return status;
}

/**
 * Resolve provisioning status to a badge status string.
 * @param {string} status - The provisioning status.
 * @returns {string} The badge status string.
 */
function resolveProvisioningStatus(status) {
  if (!status) return 'unknown';
  if (status === 'provisioned') return 'passed';
  if (status === 'needs_refresh') return 'warning';
  if (status === 'pending') return 'pending';
  return status;
}

/**
 * Provisioning workflow steps for the Stepper component.
 * @type {Readonly<Array<object>>}
 */
const PROVISIONING_STEPS = Object.freeze([
  { label: 'Request', key: 'request' },
  { label: 'Provision', key: 'provision' },
  { label: 'Mask', key: 'mask' },
  { label: 'Validate', key: 'validate' },
  { label: 'Active', key: 'active' },
]);

/**
 * Map provisioning status to stepper index.
 * @param {string} provisioningStatus - The provisioning status.
 * @param {string} dataStatus - The data set status.
 * @param {string} maskingStatus - The masking status.
 * @returns {number} The stepper index.
 */
function provisioningToStepIndex(provisioningStatus, dataStatus, maskingStatus) {
  if (dataStatus === 'stale') return 4;
  if (provisioningStatus === 'provisioned') {
    if (maskingStatus === 'fully_masked' || maskingStatus === 'not_applicable') return 4;
    if (maskingStatus === 'partially_masked') return 3;
    return 4;
  }
  if (provisioningStatus === 'needs_refresh') return 1;
  if (provisioningStatus === 'pending') return 0;
  return 0;
}

/**
 * Resolve provisioning stepper steps with state.
 * @param {string} provisioningStatus - The provisioning status.
 * @param {string} dataStatus - The data set status.
 * @param {string} maskingStatus - The masking status.
 * @returns {Array<object>} Array of stepper step objects.
 */
function resolveProvisioningSteps(provisioningStatus, dataStatus, maskingStatus) {
  const activeIndex = provisioningToStepIndex(provisioningStatus, dataStatus, maskingStatus);

  return PROVISIONING_STEPS.map((step, index) => {
    let state;
    if (dataStatus === 'stale' && index === 4) {
      state = 'error';
    } else if (index < activeIndex) {
      state = 'completed';
    } else if (index === activeIndex) {
      state = dataStatus === 'stale' ? 'error' : 'active';
    } else {
      state = 'pending';
    }
    return { label: step.label, state };
  });
}

/**
 * Type options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const TYPE_OPTIONS = [
  { value: 'Synthetic', label: 'Synthetic' },
  { value: 'Subset', label: 'Subset' },
  { value: 'Reference', label: 'Reference' },
  { value: 'Crafted', label: 'Crafted' },
];

/**
 * Status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'stale', label: 'Stale' },
  { value: 'archived', label: 'Archived' },
];

/**
 * Masking status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const MASKING_STATUS_OPTIONS = [
  { value: 'fully_masked', label: 'Fully Masked' },
  { value: 'partially_masked', label: 'Partially Masked' },
  { value: 'not_applicable', label: 'Not Applicable' },
];

/**
 * Provisioning status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const PROVISIONING_STATUS_OPTIONS = [
  { value: 'provisioned', label: 'Provisioned' },
  { value: 'needs_refresh', label: 'Needs Refresh' },
  { value: 'pending', label: 'Pending' },
];

/**
 * Format options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const FORMAT_OPTIONS = [
  { value: 'SQL', label: 'SQL' },
  { value: 'JSON', label: 'JSON' },
  { value: 'CSV', label: 'CSV' },
  { value: 'Mixed', label: 'Mixed' },
];

/**
 * Data classification options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const CLASSIFICATION_OPTIONS = [
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
  { value: 'internal', label: 'Internal' },
  { value: 'public', label: 'Public' },
];

/**
 * Refresh schedule options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const REFRESH_SCHEDULE_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'per_release', label: 'Per Release' },
];

/**
 * Retention policy options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const RETENTION_POLICY_OPTIONS = [
  { value: '30_days', label: '30 Days' },
  { value: '60_days', label: '60 Days' },
  { value: '90_days', label: '90 Days' },
  { value: '120_days', label: '120 Days' },
  { value: '180_days', label: '180 Days' },
  { value: '365_days', label: '365 Days' },
];

/**
 * Columns definition for the test data sets data table.
 * @type {Array<object>}
 */
const TEST_DATA_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
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
    key: 'maskingStatus',
    label: 'Masking',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveMaskingStatus(value)} size="sm">{value.replace(/_/g, ' ')}</Badge>;
    },
  },
  {
    key: 'provisioningStatus',
    label: 'Provisioning',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveProvisioningStatus(value)} size="sm">{value.replace(/_/g, ' ')}</Badge>;
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
    key: 'format',
    label: 'Format',
    sortable: true,
    width: '70px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'recordCount',
    label: 'Records',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{typeof value === 'number' ? value.toLocaleString() : value}</span>;
    },
  },
  {
    key: 'sizeBytes',
    label: 'Size',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{formatBytes(value)}</span>;
    },
  },
  {
    key: 'lastRefreshed',
    label: 'Last Refresh',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'dataClassification',
    label: 'Classification',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      const statusMap = {
        confidential: 'warning',
        restricted: 'error',
        internal: 'info',
        public: 'neutral',
      };
      return <Badge status={statusMap[value] || 'neutral'} size="sm">{value}</Badge>;
    },
  },
];

/**
 * Refresh history table columns for the detail modal.
 * @type {Array<object>}
 */
const REFRESH_HISTORY_TABLE_COLUMNS = [
  {
    key: 'date',
    label: 'Date',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
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
    key: 'recordsProcessed',
    label: 'Records',
    sortable: true,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{typeof value === 'number' ? value.toLocaleString() : value}</span>;
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
    key: 'triggeredBy',
    label: 'Triggered By',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'notes',
    label: 'Notes',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 truncate">{value}</span>;
    },
  },
];

/**
 * Quality check table columns for the detail modal.
 * @type {Array<object>}
 */
const QUALITY_CHECK_TABLE_COLUMNS = [
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
    key: 'lastRun',
    label: 'Last Run',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'details',
    label: 'Details',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 truncate">{value}</span>;
    },
  },
];

/**
 * Initial form state for creating a new test data set.
 * @returns {object} The initial form state.
 */
function getInitialFormState() {
  return {
    name: '',
    description: '',
    type: 'Synthetic',
    format: 'SQL',
    maskingStatus: 'fully_masked',
    dataClassification: 'confidential',
    retentionPolicy: '90_days',
    refreshSchedule: 'weekly',
    segment: '',
    recordCount: '',
    sizeBytes: '',
  };
}

/**
 * Test Data Management page component.
 *
 * @returns {React.ReactElement} The rendered TestDataManagement page.
 */
export default function TestDataManagement() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes, createEntity, updateEntity, removeEntity } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testDataSets, setTestDataSets] = useState([]);

  // Detail modal state
  const [selectedDataSet, setSelectedDataSet] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Create/Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(getInitialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Retire confirm state
  const [isRetireOpen, setIsRetireOpen] = useState(false);
  const [isRetiring, setIsRetiring] = useState(false);

  // Refresh confirm state
  const [isRefreshOpen, setIsRefreshOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [dataSetToDelete, setDataSetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = canPerform('create', 'test-assets');
  const canUpdate = canPerform('update', 'test-assets');
  const canDelete = canPerform('delete', 'test-assets');
  const canExport = canPerform('export', 'test-assets');

  /**
   * Load test data sets from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const tdData = getAll(entityTypes.TEST_DATA);
      setTestDataSets(Array.isArray(tdData) ? tdData : []);
    } catch (err) {
      console.error('[TestDataManagement] Error loading test data sets:', err);
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
    for (let i = 0; i < testDataSets.length; i++) {
      if (testDataSets[i].segment) {
        segments.add(testDataSets[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [testDataSets]);

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
        key: 'maskingStatus',
        label: 'Masking',
        options: MASKING_STATUS_OPTIONS,
      },
      {
        key: 'provisioningStatus',
        label: 'Provisioning',
        options: PROVISIONING_STATUS_OPTIONS,
      },
      {
        key: 'format',
        label: 'Format',
        options: FORMAT_OPTIONS,
      },
      {
        key: 'dataClassification',
        label: 'Classification',
        options: CLASSIFICATION_OPTIONS,
      },
    ];
  }, []);

  /**
   * Filtered test data sets based on filter values and search.
   */
  const filteredTestDataSets = useMemo(() => {
    let result = [...testDataSets];

    if (filterValues.segment) {
      result = result.filter((td) => td.segment === filterValues.segment);
    }
    if (filterValues.type) {
      result = result.filter((td) => td.type === filterValues.type);
    }
    if (filterValues.status) {
      result = result.filter((td) => td.status === filterValues.status);
    }
    if (filterValues.maskingStatus) {
      result = result.filter((td) => td.maskingStatus === filterValues.maskingStatus);
    }
    if (filterValues.provisioningStatus) {
      result = result.filter((td) => td.provisioningStatus === filterValues.provisioningStatus);
    }
    if (filterValues.format) {
      result = result.filter((td) => td.format === filterValues.format);
    }
    if (filterValues.dataClassification) {
      result = result.filter((td) => td.dataClassification === filterValues.dataClassification);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((td) => {
        const name = td.name ? td.name.toLowerCase() : '';
        const desc = td.description ? td.description.toLowerCase() : '';
        const segment = td.segment ? td.segment.toLowerCase() : '';
        const type = td.type ? td.type.toLowerCase() : '';
        const format = td.format ? td.format.toLowerCase() : '';
        const apps = Array.isArray(td.associatedApplications) ? td.associatedApplications.join(' ').toLowerCase() : '';
        return (
          name.includes(queryLower) ||
          desc.includes(queryLower) ||
          segment.includes(queryLower) ||
          type.includes(queryLower) ||
          format.includes(queryLower) ||
          apps.includes(queryLower)
        );
      });
    }

    return result;
  }, [testDataSets, filterValues, searchValue]);

  /**
   * Summary metrics for the test data management dashboard.
   */
  const summaryMetrics = useMemo(() => {
    const total = testDataSets.length;
    let active = 0;
    let stale = 0;
    let fullyMasked = 0;
    let partiallyMasked = 0;
    let notApplicable = 0;
    let provisioned = 0;
    let needsRefresh = 0;
    let totalRecords = 0;
    let totalSize = 0;
    let qualityWarnings = 0;
    let qualityFailures = 0;
    let failedRefreshes = 0;

    for (let i = 0; i < testDataSets.length; i++) {
      const td = testDataSets[i];
      totalRecords += td.recordCount || 0;
      totalSize += td.sizeBytes || 0;

      if (td.status === 'active') active += 1;
      else if (td.status === 'stale') stale += 1;

      if (td.maskingStatus === 'fully_masked') fullyMasked += 1;
      else if (td.maskingStatus === 'partially_masked') partiallyMasked += 1;
      else if (td.maskingStatus === 'not_applicable') notApplicable += 1;

      if (td.provisioningStatus === 'provisioned') provisioned += 1;
      else if (td.provisioningStatus === 'needs_refresh') needsRefresh += 1;

      if (Array.isArray(td.qualityChecks)) {
        for (let j = 0; j < td.qualityChecks.length; j++) {
          if (td.qualityChecks[j].status === 'warning') qualityWarnings += 1;
          if (td.qualityChecks[j].status === 'failed') qualityFailures += 1;
        }
      }

      if (Array.isArray(td.refreshHistory)) {
        for (let j = 0; j < td.refreshHistory.length; j++) {
          if (td.refreshHistory[j].status === 'failed') failedRefreshes += 1;
        }
      }
    }

    return {
      total,
      active,
      stale,
      fullyMasked,
      partiallyMasked,
      notApplicable,
      provisioned,
      needsRefresh,
      totalRecords,
      totalSize,
      totalSizeGB: Math.round((totalSize / (1024 * 1024 * 1024)) * 100) / 100,
      qualityWarnings,
      qualityFailures,
      failedRefreshes,
    };
  }, [testDataSets]);

  /**
   * Status distribution chart data.
   */
  const statusDistributionData = useMemo(() => {
    return [
      { label: 'Active', value: summaryMetrics.active },
      { label: 'Stale', value: summaryMetrics.stale },
      { label: 'Other', value: summaryMetrics.total - summaryMetrics.active - summaryMetrics.stale },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Masking status distribution chart data.
   */
  const maskingDistributionData = useMemo(() => {
    return [
      { label: 'Fully Masked', value: summaryMetrics.fullyMasked },
      { label: 'Partially Masked', value: summaryMetrics.partiallyMasked },
      { label: 'Not Applicable', value: summaryMetrics.notApplicable },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Type distribution chart data.
   */
  const typeDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testDataSets.length; i++) {
      const type = testDataSets[i].type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [testDataSets]);

  /**
   * Segment distribution chart data.
   */
  const segmentDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testDataSets.length; i++) {
      const segment = testDataSets[i].segment || 'Unknown';
      counts[segment] = (counts[segment] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] })).sort((a, b) => b.value - a.value);
  }, [testDataSets]);

  /**
   * Format distribution chart data.
   */
  const formatDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testDataSets.length; i++) {
      const format = testDataSets[i].format || 'Unknown';
      counts[format] = (counts[format] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [testDataSets]);

  /**
   * Classification distribution chart data.
   */
  const classificationDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testDataSets.length; i++) {
      const classification = testDataSets[i].dataClassification || 'Unknown';
      counts[classification] = (counts[classification] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [testDataSets]);

  /**
   * Provisioning distribution chart data.
   */
  const provisioningDistributionData = useMemo(() => {
    return [
      { label: 'Provisioned', value: summaryMetrics.provisioned },
      { label: 'Needs Refresh', value: summaryMetrics.needsRefresh },
      { label: 'Other', value: summaryMetrics.total - summaryMetrics.provisioned - summaryMetrics.needsRefresh },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

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
   * Handle row click to open detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedDataSet(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedDataSet(null);
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
   * Open edit form for the selected data set.
   */
  const handleOpenEdit = useCallback(() => {
    if (!selectedDataSet) return;
    setFormData({
      name: selectedDataSet.name || '',
      description: selectedDataSet.description || '',
      type: selectedDataSet.type || 'Synthetic',
      format: selectedDataSet.format || 'SQL',
      maskingStatus: selectedDataSet.maskingStatus || 'fully_masked',
      dataClassification: selectedDataSet.dataClassification || 'confidential',
      retentionPolicy: selectedDataSet.retentionPolicy || '90_days',
      refreshSchedule: selectedDataSet.refreshSchedule || 'weekly',
      segment: selectedDataSet.segment || '',
      recordCount: selectedDataSet.recordCount !== null && selectedDataSet.recordCount !== undefined ? String(selectedDataSet.recordCount) : '',
      sizeBytes: selectedDataSet.sizeBytes !== null && selectedDataSet.sizeBytes !== undefined ? String(selectedDataSet.sizeBytes) : '',
    });
    setFormErrors({});
    setIsEditing(true);
    setIsFormOpen(true);
  }, [selectedDataSet]);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
   * Validate form data.
   * @returns {boolean} True if valid.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required.';
    }
    if (!formData.type) {
      errors.type = 'Type is required.';
    }
    if (formData.recordCount !== '' && formData.recordCount !== null && formData.recordCount !== undefined) {
      const count = Number(formData.recordCount);
      if (isNaN(count) || count < 0 || !Number.isInteger(count)) {
        errors.recordCount = 'Record count must be a non-negative integer.';
      }
    }
    if (formData.sizeBytes !== '' && formData.sizeBytes !== null && formData.sizeBytes !== undefined) {
      const size = Number(formData.sizeBytes);
      if (isNaN(size) || size < 0) {
        errors.sizeBytes = 'Size must be a non-negative number.';
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
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        format: formData.format,
        maskingStatus: formData.maskingStatus,
        dataClassification: formData.dataClassification,
        retentionPolicy: formData.retentionPolicy,
        refreshSchedule: formData.refreshSchedule,
        segment: formData.segment || null,
        recordCount: formData.recordCount !== '' ? Number(formData.recordCount) : 0,
        sizeBytes: formData.sizeBytes !== '' ? Number(formData.sizeBytes) : 0,
      };

      if (isEditing && selectedDataSet) {
        const updated = updateEntity(entityTypes.TEST_DATA, selectedDataSet.id, data, userId);
        if (updated) {
          logAction(userId, 'Update Test Data Set', 'test-data', selectedDataSet.id, `Updated test data set: ${data.name}`);
          setSelectedDataSet(updated);
          handleCloseForm();
          loadData();
        }
      } else {
        data.status = 'active';
        data.provisioningStatus = 'pending';
        data.associatedApplications = [];
        data.associatedEnvironments = [];
        data.refreshHistory = [];
        data.qualityChecks = [];
        data.dependencies = [];
        data.lastRefreshed = null;
        data.nextRefresh = null;
        data.tags = [];

        const created = createEntity(entityTypes.TEST_DATA, data, userId);
        if (created) {
          logAction(userId, 'Create Test Data Set', 'test-data', created.id, `Created test data set: ${data.name}`);
          handleCloseForm();
          loadData();
        }
      }
    } catch (err) {
      console.error('[TestDataManagement] Error saving test data set:', err);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, isEditing, selectedDataSet, userId, entityTypes, updateEntity, createEntity, handleCloseForm, loadData]);

  /**
   * Handle retire test data set.
   */
  const handleOpenRetire = useCallback(() => {
    if (!selectedDataSet) return;
    setIsRetireOpen(true);
  }, [selectedDataSet]);

  const handleCloseRetire = useCallback(() => {
    setIsRetireOpen(false);
  }, []);

  const handleConfirmRetire = useCallback(() => {
    if (!selectedDataSet) return;

    setIsRetiring(true);

    try {
      const updated = updateEntity(entityTypes.TEST_DATA, selectedDataSet.id, {
        status: 'archived',
        provisioningStatus: 'needs_refresh',
      }, userId);

      if (updated) {
        logAction(userId, 'Retire Test Data Set', 'test-data', selectedDataSet.id, `Retired test data set: ${selectedDataSet.name || selectedDataSet.id}`);
        setSelectedDataSet(updated);
        handleCloseRetire();
        loadData();
      }
    } catch (err) {
      console.error('[TestDataManagement] Error retiring test data set:', err);
    } finally {
      setIsRetiring(false);
    }
  }, [selectedDataSet, userId, entityTypes, updateEntity, handleCloseRetire, loadData]);

  /**
   * Handle refresh test data set (simulated).
   */
  const handleOpenRefresh = useCallback(() => {
    if (!selectedDataSet) return;
    setIsRefreshOpen(true);
  }, [selectedDataSet]);

  const handleCloseRefresh = useCallback(() => {
    setIsRefreshOpen(false);
  }, []);

  const handleConfirmRefresh = useCallback(() => {
    if (!selectedDataSet) return;

    setIsRefreshing(true);

    try {
      const now = new Date().toISOString();
      const refreshSuccess = Math.random() > 0.1;
      const duration = Math.floor(Math.random() * 300) + 30;
      const recordsProcessed = refreshSuccess ? (selectedDataSet.recordCount || 0) : Math.floor((selectedDataSet.recordCount || 0) * Math.random());

      const newRefreshEntry = {
        id: `rh-${Date.now()}`,
        date: now,
        status: refreshSuccess ? 'success' : 'failed',
        duration,
        recordsProcessed,
        triggeredBy: userId,
        notes: refreshSuccess ? 'Manual refresh completed successfully.' : 'Refresh failed due to connection timeout.',
      };

      const existingHistory = Array.isArray(selectedDataSet.refreshHistory) ? [...selectedDataSet.refreshHistory] : [];
      existingHistory.unshift(newRefreshEntry);
      if (existingHistory.length > 10) {
        existingHistory.length = 10;
      }

      const updates = {
        refreshHistory: existingHistory,
        lastRefreshed: refreshSuccess ? now : selectedDataSet.lastRefreshed,
        status: refreshSuccess ? 'active' : selectedDataSet.status,
        provisioningStatus: refreshSuccess ? 'provisioned' : selectedDataSet.provisioningStatus,
      };

      const updated = updateEntity(entityTypes.TEST_DATA, selectedDataSet.id, updates, userId);

      if (updated) {
        logAction(userId, 'Refresh Test Data Set', 'test-data', selectedDataSet.id, `Refresh ${refreshSuccess ? 'succeeded' : 'failed'} for: ${selectedDataSet.name || selectedDataSet.id}. Records: ${recordsProcessed}. Duration: ${duration}s.`);
        setSelectedDataSet(updated);
        handleCloseRefresh();
        loadData();
      }
    } catch (err) {
      console.error('[TestDataManagement] Error refreshing test data set:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedDataSet, userId, entityTypes, updateEntity, handleCloseRefresh, loadData]);

  /**
   * Handle provision test data set (simulated).
   */
  const handleProvision = useCallback(() => {
    if (!selectedDataSet || !canUpdate) return;

    try {
      const now = new Date().toISOString();

      const updates = {
        provisioningStatus: 'provisioned',
        status: 'active',
        lastRefreshed: now,
      };

      const updated = updateEntity(entityTypes.TEST_DATA, selectedDataSet.id, updates, userId);

      if (updated) {
        logAction(userId, 'Provision Test Data Set', 'test-data', selectedDataSet.id, `Provisioned test data set: ${selectedDataSet.name || selectedDataSet.id}`);
        setSelectedDataSet(updated);
        loadData();
      }
    } catch (err) {
      console.error('[TestDataManagement] Error provisioning test data set:', err);
    }
  }, [selectedDataSet, canUpdate, userId, entityTypes, updateEntity, loadData]);

  /**
   * Handle mask test data set (simulated).
   */
  const handleMask = useCallback(() => {
    if (!selectedDataSet || !canUpdate) return;

    try {
      const updates = {
        maskingStatus: 'fully_masked',
      };

      const existingChecks = Array.isArray(selectedDataSet.qualityChecks) ? [...selectedDataSet.qualityChecks] : [];
      const piiCheckIndex = existingChecks.findIndex((qc) => qc.name && qc.name.toLowerCase().includes('pii'));
      if (piiCheckIndex !== -1) {
        existingChecks[piiCheckIndex] = {
          ...existingChecks[piiCheckIndex],
          status: 'passed',
          lastRun: new Date().toISOString(),
          details: 'All PII fields confirmed masked after masking operation.',
        };
        updates.qualityChecks = existingChecks;
      }

      const updated = updateEntity(entityTypes.TEST_DATA, selectedDataSet.id, updates, userId);

      if (updated) {
        logAction(userId, 'Mask Test Data Set', 'test-data', selectedDataSet.id, `Applied full masking to test data set: ${selectedDataSet.name || selectedDataSet.id}`);
        setSelectedDataSet(updated);
        loadData();
      }
    } catch (err) {
      console.error('[TestDataManagement] Error masking test data set:', err);
    }
  }, [selectedDataSet, canUpdate, userId, entityTypes, updateEntity, loadData]);

  /**
   * Handle delete test data set.
   */
  const handleOpenDelete = useCallback(() => {
    if (!selectedDataSet) return;
    setDataSetToDelete(selectedDataSet);
    setIsDeleteOpen(true);
  }, [selectedDataSet]);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDataSetToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!dataSetToDelete) return;

    setIsDeleting(true);

    try {
      const deleted = removeEntity(entityTypes.TEST_DATA, dataSetToDelete.id, userId);
      if (deleted) {
        logAction(userId, 'Delete Test Data Set', 'test-data', dataSetToDelete.id, `Deleted test data set: ${dataSetToDelete.name || dataSetToDelete.id}`);
        handleCloseDelete();
        handleCloseDetail();
        loadData();
      }
    } catch (err) {
      console.error('[TestDataManagement] Error deleting test data set:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [dataSetToDelete, userId, entityTypes, removeEntity, handleCloseDelete, handleCloseDetail, loadData]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredTestDataSets.map((td) => ({
      ID: td.id || '',
      Name: td.name || '',
      Type: td.type || '',
      Status: td.status || '',
      Format: td.format || '',
      'Masking Status': td.maskingStatus ? td.maskingStatus.replace(/_/g, ' ') : '',
      'Provisioning Status': td.provisioningStatus ? td.provisioningStatus.replace(/_/g, ' ') : '',
      Segment: td.segment || '',
      'Record Count': td.recordCount !== null && td.recordCount !== undefined ? td.recordCount : '',
      'Size (Bytes)': td.sizeBytes !== null && td.sizeBytes !== undefined ? td.sizeBytes : '',
      'Data Classification': td.dataClassification || '',
      'Retention Policy': td.retentionPolicy || '',
      'Refresh Schedule': td.refreshSchedule || '',
      'Last Refreshed': td.lastRefreshed || '',
      'Next Refresh': td.nextRefresh || '',
      Applications: Array.isArray(td.associatedApplications) ? td.associatedApplications.join(', ') : '',
      Environments: Array.isArray(td.associatedEnvironments) ? td.associatedEnvironments.join(', ') : '',
    }));

    exportToCSV(exportData, 'test-data-management');

    logAction(userId, 'Export Test Data CSV', 'test-data', 'bulk', `Exported ${exportData.length} test data sets to CSV`);
  }, [canExport, filteredTestDataSets, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredTestDataSets.map((td) => ({
      ID: td.id || '',
      Name: td.name || '',
      Type: td.type || '',
      Status: td.status || '',
      Format: td.format || '',
      'Masking Status': td.maskingStatus ? td.maskingStatus.replace(/_/g, ' ') : '',
      'Provisioning Status': td.provisioningStatus ? td.provisioningStatus.replace(/_/g, ' ') : '',
      Segment: td.segment || '',
      'Record Count': td.recordCount !== null && td.recordCount !== undefined ? td.recordCount : '',
      'Size (Bytes)': td.sizeBytes !== null && td.sizeBytes !== undefined ? td.sizeBytes : '',
      'Data Classification': td.dataClassification || '',
      'Retention Policy': td.retentionPolicy || '',
      'Refresh Schedule': td.refreshSchedule || '',
      'Last Refreshed': td.lastRefreshed || '',
      'Next Refresh': td.nextRefresh || '',
      Applications: Array.isArray(td.associatedApplications) ? td.associatedApplications.join(', ') : '',
      Environments: Array.isArray(td.associatedEnvironments) ? td.associatedEnvironments.join(', ') : '',
    }));

    exportToExcel(exportData, 'test-data-management');

    logAction(userId, 'Export Test Data Excel', 'test-data', 'bulk', `Exported ${exportData.length} test data sets to Excel`);
  }, [canExport, filteredTestDataSets, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedDataSet) return [];

    const refreshCount = Array.isArray(selectedDataSet.refreshHistory) ? selectedDataSet.refreshHistory.length : 0;
    const qualityCheckCount = Array.isArray(selectedDataSet.qualityChecks) ? selectedDataSet.qualityChecks.length : 0;
    const appCount = Array.isArray(selectedDataSet.associatedApplications) ? selectedDataSet.associatedApplications.length : 0;
    const envCount = Array.isArray(selectedDataSet.associatedEnvironments) ? selectedDataSet.associatedEnvironments.length : 0;
    const depCount = Array.isArray(selectedDataSet.dependencies) ? selectedDataSet.dependencies.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'provisioning', label: 'Provisioning' },
      { key: 'refresh-history', label: 'Refresh History', badge: refreshCount > 0 ? String(refreshCount) : undefined },
      { key: 'quality-checks', label: 'Quality Checks', badge: qualityCheckCount > 0 ? String(qualityCheckCount) : undefined },
      { key: 'associations', label: 'Associations', badge: (appCount + envCount) > 0 ? String(appCount + envCount) : undefined },
      { key: 'dependencies', label: 'Dependencies', badge: depCount > 0 ? String(depCount) : undefined },
    ];
  }, [selectedDataSet]);

  /**
   * Refresh history timeline entries.
   */
  const refreshTimelineEntries = useMemo(() => {
    if (!selectedDataSet || !Array.isArray(selectedDataSet.refreshHistory)) return [];
    return selectedDataSet.refreshHistory.map((rh) => ({
      id: rh.id || `rh-${Math.random()}`,
      title: `Refresh - ${rh.status || 'unknown'}`,
      description: rh.notes || `Records: ${rh.recordsProcessed || 0}. Duration: ${rh.duration || 0}s.`,
      timestamp: rh.date,
      badge: rh.status ? <Badge status={rh.status} size="sm" /> : null,
      metadata: [
        { label: 'Records', value: String(rh.recordsProcessed || 0) },
        { label: 'Duration', value: `${rh.duration || 0}s` },
        { label: 'By', value: rh.triggeredBy || '—' },
      ],
    }));
  }, [selectedDataSet]);

  /**
   * Provisioning stepper steps.
   */
  const provisioningSteps = useMemo(() => {
    if (!selectedDataSet) {
      return PROVISIONING_STEPS.map((step) => ({ label: step.label, state: 'pending' }));
    }
    return resolveProvisioningSteps(
      selectedDataSet.provisioningStatus,
      selectedDataSet.status,
      selectedDataSet.maskingStatus,
    );
  }, [selectedDataSet]);

  /**
   * Active provisioning step index.
   */
  const activeProvisioningIndex = useMemo(() => {
    if (!selectedDataSet) return 0;
    return provisioningToStepIndex(
      selectedDataSet.provisioningStatus,
      selectedDataSet.status,
      selectedDataSet.maskingStatus,
    );
  }, [selectedDataSet]);

  if (isLoading && testDataSets.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading test data management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="test-data-management">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Test Data Management</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Manage test data assets with provisioning, masking, refresh, and audit workflows
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
              ariaLabel="Request new test data set"
            >
              + Request Data Set
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <MetricCard
          label="Total Data Sets"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-datasets"
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
          label="Stale"
          value={summaryMetrics.stale}
          status={summaryMetrics.stale > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-stale"
        />
        <MetricCard
          label="Fully Masked"
          value={summaryMetrics.fullyMasked}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-fully-masked"
        />
        <MetricCard
          label="Needs Refresh"
          value={summaryMetrics.needsRefresh}
          status={summaryMetrics.needsRefresh > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-needs-refresh"
        />
        <MetricCard
          label="Total Records"
          value={summaryMetrics.totalRecords.toLocaleString()}
          variant="compact"
          size="sm"
          testId="metric-total-records"
        />
        <MetricCard
          label="Total Size"
          value={`${summaryMetrics.totalSizeGB} GB`}
          variant="compact"
          size="sm"
          testId="metric-total-size"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
        <MetricCard
          label="Quality Warnings"
          value={summaryMetrics.qualityWarnings}
          status={summaryMetrics.qualityWarnings > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-quality-warnings"
        />
        <MetricCard
          label="Quality Failures"
          value={summaryMetrics.qualityFailures}
          status={summaryMetrics.qualityFailures > 0 ? 'failed' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-quality-failures"
        />
        <MetricCard
          label="Failed Refreshes"
          value={summaryMetrics.failedRefreshes}
          status={summaryMetrics.failedRefreshes > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-failed-refreshes"
        />
        <MetricCard
          label="Partially Masked"
          value={summaryMetrics.partiallyMasked}
          status={summaryMetrics.partiallyMasked > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-partially-masked"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Data sets by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#6B7280']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={maskingDistributionData}
            title="Masking Status"
            description="Data sets by masking status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#6B7280']}
            testId="chart-masking-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={typeDistributionData}
            title="Type Distribution"
            description="Data sets by type"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B']}
            testId="chart-type-distribution"
          />
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={segmentDistributionData}
            title="Segment Distribution"
            description="Data sets by segment"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-segment-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={formatDistributionData}
            title="Format Distribution"
            description="Data sets by format"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-format-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={provisioningDistributionData}
            title="Provisioning Status"
            description="Data sets by provisioning status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#6B7280']}
            testId="chart-provisioning-distribution"
          />
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search test data sets..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="test-data-filter-bar"
      />

      {/* Test Data Sets Data Table */}
      <DataTable
        columns={TEST_DATA_TABLE_COLUMNS}
        data={filteredTestDataSets}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No test data sets found"
        emptyMessage="No test data sets match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Test data management table"
        testId="test-data-table"
      />

      {/* Detail Modal */}
      {selectedDataSet && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedDataSet.name || 'Test Data Set Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Test data set detail: ${selectedDataSet.name || selectedDataSet.id}`}
          testId="test-data-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canUpdate && selectedDataSet.provisioningStatus !== 'provisioned' && (
                <Button variant="accent" size="sm" onClick={handleProvision} ariaLabel="Provision data set">
                  Provision
                </Button>
              )}
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenRefresh} ariaLabel="Refresh data set">
                  Refresh
                </Button>
              )}
              {canUpdate && selectedDataSet.maskingStatus !== 'fully_masked' && selectedDataSet.maskingStatus !== 'not_applicable' && (
                <Button variant="secondary" size="sm" onClick={handleMask} ariaLabel="Mask data set">
                  Apply Masking
                </Button>
              )}
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenEdit} ariaLabel="Edit data set">
                  Edit
                </Button>
              )}
              {canUpdate && selectedDataSet.status !== 'archived' && (
                <Button variant="ghost" size="sm" onClick={handleOpenRetire} ariaLabel="Retire data set">
                  Retire
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleOpenDelete} ariaLabel="Delete data set">
                  Delete
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Data Set Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedDataSet.status && <Badge status={selectedDataSet.status} size="md" />}
              {selectedDataSet.type && <Badge variant="neutral" size="md">{selectedDataSet.type}</Badge>}
              {selectedDataSet.format && <Badge variant="neutral" size="md">{selectedDataSet.format}</Badge>}
              {selectedDataSet.maskingStatus && (
                <Badge status={resolveMaskingStatus(selectedDataSet.maskingStatus)} size="md">
                  {selectedDataSet.maskingStatus.replace(/_/g, ' ')}
                </Badge>
              )}
              {selectedDataSet.provisioningStatus && (
                <Badge status={resolveProvisioningStatus(selectedDataSet.provisioningStatus)} size="md">
                  {selectedDataSet.provisioningStatus.replace(/_/g, ' ')}
                </Badge>
              )}
              {selectedDataSet.dataClassification && (
                <Badge variant="neutral" size="md">{selectedDataSet.dataClassification}</Badge>
              )}
              {selectedDataSet.segment && <Badge variant="neutral" size="md">{selectedDataSet.segment}</Badge>}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="test-data-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedDataSet.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDataSet.description}</p>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  <MetricCard
                    label="Records"
                    value={selectedDataSet.recordCount !== null && selectedDataSet.recordCount !== undefined ? selectedDataSet.recordCount.toLocaleString() : '—'}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Size"
                    value={formatBytes(selectedDataSet.sizeBytes)}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Quality Checks"
                    value={Array.isArray(selectedDataSet.qualityChecks) ? selectedDataSet.qualityChecks.length : 0}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Refresh History"
                    value={Array.isArray(selectedDataSet.refreshHistory) ? selectedDataSet.refreshHistory.length : 0}
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Data Set Info */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Data Set Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.type || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Format:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.format || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.status || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Masking:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.maskingStatus ? selectedDataSet.maskingStatus.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Provisioning:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.provisioningStatus ? selectedDataSet.provisioningStatus.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Classification:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.dataClassification || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Retention:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.retentionPolicy ? selectedDataSet.retentionPolicy.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Refresh Schedule:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.refreshSchedule ? selectedDataSet.refreshSchedule.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Segment:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.segment || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.owner || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Refreshed:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedDataSet.lastRefreshed)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Next Refresh:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedDataSet.nextRefresh)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedDataSet.version || 1}</span>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                {Array.isArray(selectedDataSet.tags) && selectedDataSet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedDataSet.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedDataSet.created_at)}</div>
                  <div>Updated: {formatDate(selectedDataSet.updated_at)}</div>
                  {selectedDataSet.created_by && <div>Created By: {selectedDataSet.created_by}</div>}
                  {selectedDataSet.updated_by && <div>Updated By: {selectedDataSet.updated_by}</div>}
                </div>
              </div>
            )}

            {/* Provisioning Tab */}
            {detailTab === 'provisioning' && (
              <div className="space-y-2">
                {/* Provisioning Stepper */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Provisioning Workflow</h4>
                  <Stepper
                    steps={provisioningSteps}
                    activeStep={activeProvisioningIndex}
                    variant="horizontal"
                    size="md"
                    testId="test-data-provisioning-stepper"
                  />
                </Card>

                {/* Provisioning Status Details */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Provisioning Details</h4>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Provisioning Status</span>
                      <Badge status={resolveProvisioningStatus(selectedDataSet.provisioningStatus)} size="sm">
                        {selectedDataSet.provisioningStatus ? selectedDataSet.provisioningStatus.replace(/_/g, ' ') : '—'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Masking Status</span>
                      <Badge status={resolveMaskingStatus(selectedDataSet.maskingStatus)} size="sm">
                        {selectedDataSet.maskingStatus ? selectedDataSet.maskingStatus.replace(/_/g, ' ') : '—'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Data Status</span>
                      <Badge status={selectedDataSet.status || 'unknown'} size="sm" />
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Data Classification</span>
                      <span className="text-xs text-gray-600">{selectedDataSet.dataClassification || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Retention Policy</span>
                      <span className="text-xs text-gray-600">{selectedDataSet.retentionPolicy ? selectedDataSet.retentionPolicy.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Refresh Schedule</span>
                      <span className="text-xs text-gray-600">{selectedDataSet.refreshSchedule ? selectedDataSet.refreshSchedule.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Last Refreshed</span>
                      <span className="text-xs text-gray-600">{formatDateTime(selectedDataSet.lastRefreshed)}</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                      <span className="text-xs font-medium text-gray-800">Next Refresh</span>
                      <span className="text-xs text-gray-600">{formatDateTime(selectedDataSet.nextRefresh)}</span>
                    </div>
                  </div>
                </Card>

                {/* Provisioning Actions */}
                {canUpdate && (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Actions</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDataSet.provisioningStatus !== 'provisioned' && (
                        <Button variant="accent" size="sm" onClick={handleProvision} ariaLabel="Provision data set">
                          Provision
                        </Button>
                      )}
                      <Button variant="secondary" size="sm" onClick={handleOpenRefresh} ariaLabel="Refresh data set">
                        Refresh Data
                      </Button>
                      {selectedDataSet.maskingStatus !== 'fully_masked' && selectedDataSet.maskingStatus !== 'not_applicable' && (
                        <Button variant="secondary" size="sm" onClick={handleMask} ariaLabel="Apply masking">
                          Apply Full Masking
                        </Button>
                      )}
                      {selectedDataSet.status !== 'archived' && (
                        <Button variant="ghost" size="sm" onClick={handleOpenRetire} ariaLabel="Retire data set">
                          Retire
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Refresh History Tab */}
            {detailTab === 'refresh-history' && (
              <div className="space-y-2">
                {Array.isArray(selectedDataSet.refreshHistory) && selectedDataSet.refreshHistory.length > 0 ? (
                  <>
                    {/* Refresh Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Refreshes"
                        value={selectedDataSet.refreshHistory.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Successful"
                        value={selectedDataSet.refreshHistory.filter((rh) => rh.status === 'success').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedDataSet.refreshHistory.filter((rh) => rh.status === 'failed').length}
                        status={selectedDataSet.refreshHistory.filter((rh) => rh.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Last Refresh"
                        value={formatDate(selectedDataSet.lastRefreshed)}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Refresh History Table */}
                    <DataTable
                      columns={REFRESH_HISTORY_TABLE_COLUMNS}
                      data={selectedDataSet.refreshHistory}
                      rowKey="id"
                      paginated={selectedDataSet.refreshHistory.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No refresh history"
                      emptyMessage="No refresh history available."
                      ariaLabel="Refresh history table"
                      testId="refresh-history-table"
                    />

                    {/* Refresh Timeline */}
                    {refreshTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Refresh Timeline</h4>
                        <Timeline
                          entries={refreshTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="refresh-timeline"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No refresh history"
                    description="No refresh operations have been recorded for this test data set."
                    variant="compact"
                    actionLabel={canUpdate ? 'Refresh Now' : undefined}
                    onAction={canUpdate ? handleOpenRefresh : undefined}
                  />
                )}
              </div>
            )}

            {/* Quality Checks Tab */}
            {detailTab === 'quality-checks' && (
              <div className="space-y-2">
                {Array.isArray(selectedDataSet.qualityChecks) && selectedDataSet.qualityChecks.length > 0 ? (
                  <>
                    {/* Quality Check Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Checks"
                        value={selectedDataSet.qualityChecks.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={selectedDataSet.qualityChecks.filter((qc) => qc.status === 'passed').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Warning"
                        value={selectedDataSet.qualityChecks.filter((qc) => qc.status === 'warning').length}
                        status={selectedDataSet.qualityChecks.filter((qc) => qc.status === 'warning').length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedDataSet.qualityChecks.filter((qc) => qc.status === 'failed').length}
                        status={selectedDataSet.qualityChecks.filter((qc) => qc.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Quality Check Chart */}
                    <Card variant="base" padding="md">
                      <ChartPlaceholder
                        type="donut"
                        data={[
                          { label: 'Passed', value: selectedDataSet.qualityChecks.filter((qc) => qc.status === 'passed').length },
                          { label: 'Warning', value: selectedDataSet.qualityChecks.filter((qc) => qc.status === 'warning').length },
                          { label: 'Failed', value: selectedDataSet.qualityChecks.filter((qc) => qc.status === 'failed').length },
                        ].filter((d) => d.value > 0)}
                        title="Quality Check Status"
                        description="Quality check results"
                        size="sm"
                        showValues={true}
                        showLabels={true}
                        colors={['#78BE20', '#F59E0B', '#DC2626']}
                        testId="chart-quality-checks"
                      />
                    </Card>

                    {/* Quality Check Table */}
                    <DataTable
                      columns={QUALITY_CHECK_TABLE_COLUMNS}
                      data={selectedDataSet.qualityChecks}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No quality checks"
                      emptyMessage="No quality checks configured."
                      ariaLabel="Quality checks table"
                      testId="quality-checks-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No quality checks"
                    description="No quality checks are configured for this test data set."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Associations Tab */}
            {detailTab === 'associations' && (
              <div className="space-y-2">
                {/* Associated Applications */}
                {Array.isArray(selectedDataSet.associatedApplications) && selectedDataSet.associatedApplications.length > 0 ? (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Associated Applications ({selectedDataSet.associatedApplications.length})</h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedDataSet.associatedApplications.map((app, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{app}</Badge>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card variant="base" padding="md">
                    <EmptyState
                      title="No associated applications"
                      description="No applications are associated with this test data set."
                      variant="compact"
                    />
                  </Card>
                )}

                {/* Associated Environments */}
                {Array.isArray(selectedDataSet.associatedEnvironments) && selectedDataSet.associatedEnvironments.length > 0 ? (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Associated Environments ({selectedDataSet.associatedEnvironments.length})</h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedDataSet.associatedEnvironments.map((env, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{env}</Badge>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card variant="base" padding="md">
                    <EmptyState
                      title="No associated environments"
                      description="No environments are associated with this test data set."
                      variant="compact"
                    />
                  </Card>
                )}
              </div>
            )}

            {/* Dependencies Tab */}
            {detailTab === 'dependencies' && (
              <div>
                {Array.isArray(selectedDataSet.dependencies) && selectedDataSet.dependencies.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedDataSet.dependencies.map((dep, idx) => (
                      <div
                        key={dep || idx}
                        className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <span className="text-xs font-medium text-deep-forest-teal-700">{dep}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No dependencies"
                    description="This test data set has no dependencies on other data sets."
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
        title={isEditing ? 'Edit Test Data Set' : 'Request New Test Data Set'}
        size="lg"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={isEditing ? 'Edit test data set form' : 'Request test data set form'}
        testId="test-data-form-modal"
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
              ariaLabel={isEditing ? 'Save changes' : 'Request data set'}
            >
              {isEditing ? 'Save Changes' : 'Request Data Set'}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <FormField
            label="Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter test data set name"
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
            placeholder="Describe the test data set..."
            rows={3}
            testId="form-description"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleFormChange}
              options={TYPE_OPTIONS}
              required={true}
              error={formErrors.type}
              testId="form-type"
            />
            <FormField
              label="Format"
              name="format"
              type="select"
              value={formData.format}
              onChange={handleFormChange}
              options={FORMAT_OPTIONS}
              testId="form-format"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Masking Status"
              name="maskingStatus"
              type="select"
              value={formData.maskingStatus}
              onChange={handleFormChange}
              options={MASKING_STATUS_OPTIONS}
              testId="form-masking-status"
            />
            <FormField
              label="Data Classification"
              name="dataClassification"
              type="select"
              value={formData.dataClassification}
              onChange={handleFormChange}
              options={CLASSIFICATION_OPTIONS}
              testId="form-classification"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Retention Policy"
              name="retentionPolicy"
              type="select"
              value={formData.retentionPolicy}
              onChange={handleFormChange}
              options={RETENTION_POLICY_OPTIONS}
              testId="form-retention"
            />
            <FormField
              label="Refresh Schedule"
              name="refreshSchedule"
              type="select"
              value={formData.refreshSchedule}
              onChange={handleFormChange}
              options={REFRESH_SCHEDULE_OPTIONS}
              testId="form-refresh-schedule"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
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
            <FormField
              label="Record Count"
              name="recordCount"
              type="number"
              value={formData.recordCount}
              onChange={handleFormChange}
              placeholder="e.g., 5000"
              min={0}
              error={formErrors.recordCount}
              testId="form-record-count"
            />
            <FormField
              label="Size (Bytes)"
              name="sizeBytes"
              type="number"
              value={formData.sizeBytes}
              onChange={handleFormChange}
              placeholder="e.g., 52428800"
              min={0}
              error={formErrors.sizeBytes}
              testId="form-size-bytes"
            />
          </div>
        </div>
      </Modal>

      {/* Retire Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRetireOpen}
        onClose={handleCloseRetire}
        onConfirm={handleConfirmRetire}
        title="Retire Test Data Set"
        message={`Are you sure you want to retire "${selectedDataSet ? selectedDataSet.name : ''}"? The data set will be marked as archived and will no longer be available for provisioning.`}
        variant="warning"
        confirmLabel="Retire"
        cancelLabel="Cancel"
        loading={isRetiring}
        loadingText="Retiring..."
        testId="test-data-retire-dialog"
      />

      {/* Refresh Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRefreshOpen}
        onClose={handleCloseRefresh}
        onConfirm={handleConfirmRefresh}
        title="Refresh Test Data Set"
        message={`Are you sure you want to refresh "${selectedDataSet ? selectedDataSet.name : ''}"? This will trigger a data refresh operation which may take several minutes.`}
        variant="info"
        confirmLabel="Refresh"
        cancelLabel="Cancel"
        loading={isRefreshing}
        loadingText="Refreshing..."
        testId="test-data-refresh-dialog"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Test Data Set"
        message={`Are you sure you want to delete "${dataSetToDelete ? dataSetToDelete.name : ''}"? This action cannot be undone. All refresh history and quality check data will be permanently removed.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        loadingText="Deleting..."
        testId="test-data-delete-dialog"
      />
    </div>
  );
}