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
import { TEST_ASSET_TYPES } from '../constants.js';

/**
 * @module TestRepository
 * Test Repository page for eQIP Quality Intelligence.
 *
 * Manages 13 test asset types with create, edit, approve, clone, retire,
 * search, filter, import/export, and version history. Displays test cases
 * and test suites with DataTable, create/edit forms with FormField, and
 * detail modal with execution history, coverage, and linked defects.
 * Uses DataTable, FilterBar, Modal, FormField, and export utilities.
 */

/**
 * Priority options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const PRIORITY_OPTIONS = [
  { value: 'p1', label: 'P1 - Critical' },
  { value: 'p2', label: 'P2 - High' },
  { value: 'p3', label: 'P3 - Medium' },
  { value: 'p4', label: 'P4 - Low' },
];

/**
 * Severity options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

/**
 * Status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'retired', label: 'Retired' },
];

/**
 * Automation status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const AUTOMATION_STATUS_OPTIONS = [
  { value: 'automated', label: 'Automated' },
  { value: 'manual', label: 'Manual' },
  { value: 'in_development', label: 'In Development' },
  { value: 'not_applicable', label: 'Not Applicable' },
];

/**
 * Approval status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const APPROVAL_STATUS_OPTIONS = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

/**
 * Asset type options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const ASSET_TYPE_OPTIONS = TEST_ASSET_TYPES.map((t) => ({ value: t, label: t }));

/**
 * Resolve a priority string to a badge status.
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
 * Columns definition for the test cases data table.
 * @type {Array<object>}
 */
const TEST_CASE_TABLE_COLUMNS = [
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
    key: 'approvalStatus',
    label: 'Approval',
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
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'version',
    label: 'Ver',
    sortable: true,
    align: 'center',
    width: '50px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-500">v{value}</span>;
    },
  },
];

/**
 * Columns definition for the test suites data table.
 * @type {Array<object>}
 */
const TEST_SUITE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Suite Name',
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
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
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
    key: 'totalCases',
    label: 'Cases',
    sortable: true,
    align: 'center',
    width: '70px',
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
 * Execution history table columns for the detail modal.
 * @type {Array<object>}
 */
const EXECUTION_HISTORY_COLUMNS = [
  {
    key: 'executionId',
    label: 'Execution',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
  {
    key: 'status',
    label: 'Result',
    sortable: false,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'environment',
    label: 'Environment',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'duration',
    label: 'Duration',
    sortable: false,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}s</span>;
    },
  },
  {
    key: 'date',
    label: 'Date',
    sortable: false,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'executedBy',
    label: 'By',
    sortable: false,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
];

/**
 * Initial form state for creating a new test case.
 * @returns {object} The initial form state.
 */
function getInitialFormState() {
  return {
    title: '',
    description: '',
    type: 'Test Case',
    assetType: 'Test Case',
    application: '',
    segment: '',
    priority: 'p3',
    severity: 'medium',
    automationStatus: 'manual',
    automationFramework: '',
    automationScriptPath: '',
    expectedResults: '',
    estimatedDuration: '',
    environment: '',
  };
}

/**
 * Test Repository page component.
 *
 * @returns {React.ReactElement} The rendered TestRepository page.
 */
export default function TestRepository() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes, createEntity, updateEntity, removeEntity } = useData();

  const [activeView, setActiveView] = useState('test-cases');
  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);

  // Detail modal state
  const [selectedItem, setSelectedItem] = useState(null);
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
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Approve confirm state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Retire confirm state
  const [isRetireOpen, setIsRetireOpen] = useState(false);
  const [isRetiring, setIsRetiring] = useState(false);

  const canCreate = canPerform('create', 'test-assets');
  const canUpdate = canPerform('update', 'test-assets');
  const canDelete = canPerform('delete', 'test-assets');
  const canExport = canPerform('export', 'test-assets');

  /**
   * Load test cases and test suites from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const tcData = getAll(entityTypes.TEST_CASES);
      const tsData = getAll(entityTypes.TEST_SUITES);
      setTestCases(Array.isArray(tcData) ? tcData : []);
      setTestSuites(Array.isArray(tsData) ? tsData : []);
    } catch (err) {
      console.error('[TestRepository] Error loading data:', err);
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
    for (let i = 0; i < testSuites.length; i++) {
      if (testSuites[i].segment) {
        segments.add(testSuites[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [testCases, testSuites]);

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
    for (let i = 0; i < testSuites.length; i++) {
      if (testSuites[i].application) {
        apps.add(testSuites[i].application);
      }
    }
    return [...apps].sort().map((a) => ({ value: a, label: a }));
  }, [testCases, testSuites]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    if (activeView === 'test-cases') {
      return [
        {
          key: 'assetType',
          label: 'Asset Type',
          options: ASSET_TYPE_OPTIONS,
        },
        {
          key: 'automationStatus',
          label: 'Automation',
          options: AUTOMATION_STATUS_OPTIONS,
        },
        {
          key: 'status',
          label: 'Status',
          options: STATUS_OPTIONS,
        },
        {
          key: 'priority',
          label: 'Priority',
          options: PRIORITY_OPTIONS,
        },
        {
          key: 'approvalStatus',
          label: 'Approval',
          options: APPROVAL_STATUS_OPTIONS,
        },
      ];
    }
    return [
      {
        key: 'status',
        label: 'Status',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'draft', label: 'Draft' },
          { value: 'retired', label: 'Retired' },
        ],
      },
      {
        key: 'priority',
        label: 'Priority',
        options: PRIORITY_OPTIONS,
      },
    ];
  }, [activeView]);

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
    if (filterValues.assetType) {
      result = result.filter((tc) => tc.assetType === filterValues.assetType);
    }
    if (filterValues.automationStatus) {
      result = result.filter((tc) => tc.automationStatus === filterValues.automationStatus);
    }
    if (filterValues.status) {
      result = result.filter((tc) => tc.status === filterValues.status);
    }
    if (filterValues.priority) {
      result = result.filter((tc) => tc.priority === filterValues.priority);
    }
    if (filterValues.approvalStatus) {
      result = result.filter((tc) => tc.approvalStatus === filterValues.approvalStatus);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((tc) => {
        const title = tc.title ? tc.title.toLowerCase() : '';
        const desc = tc.description ? tc.description.toLowerCase() : '';
        const app = tc.application ? tc.application.toLowerCase() : '';
        const assetType = tc.assetType ? tc.assetType.toLowerCase() : '';
        return title.includes(queryLower) || desc.includes(queryLower) || app.includes(queryLower) || assetType.includes(queryLower);
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
    if (filterValues.status) {
      result = result.filter((ts) => ts.status === filterValues.status);
    }
    if (filterValues.priority) {
      result = result.filter((ts) => ts.priority === filterValues.priority);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((ts) => {
        const name = ts.name ? ts.name.toLowerCase() : '';
        const desc = ts.description ? ts.description.toLowerCase() : '';
        const app = ts.application ? ts.application.toLowerCase() : '';
        return name.includes(queryLower) || desc.includes(queryLower) || app.includes(queryLower);
      });
    }

    return result;
  }, [testSuites, filterValues, searchValue]);

  /**
   * Summary metrics for the test repository.
   */
  const summaryMetrics = useMemo(() => {
    const totalCases = testCases.length;
    const automated = testCases.filter((tc) => tc.automationStatus === 'automated').length;
    const manual = testCases.filter((tc) => tc.automationStatus === 'manual').length;
    const passed = testCases.filter((tc) => tc.status === 'passed').length;
    const failed = testCases.filter((tc) => tc.status === 'failed').length;
    const pending = testCases.filter((tc) => tc.approvalStatus === 'pending').length;
    const approved = testCases.filter((tc) => tc.approvalStatus === 'approved').length;
    const totalSuites = testSuites.length;
    const automationCoverage = totalCases > 0 ? Math.round((automated / totalCases) * 10000) / 100 : 0;

    let avgPassRate = 0;
    if (testSuites.length > 0) {
      let total = 0;
      for (let i = 0; i < testSuites.length; i++) {
        total += testSuites[i].passRate || 0;
      }
      avgPassRate = Math.round((total / testSuites.length) * 100) / 100;
    }

    const withDefects = testCases.filter(
      (tc) => Array.isArray(tc.defectsLinked) && tc.defectsLinked.length > 0,
    ).length;

    return {
      totalCases,
      automated,
      manual,
      passed,
      failed,
      pending,
      approved,
      totalSuites,
      automationCoverage,
      avgPassRate,
      withDefects,
    };
  }, [testCases, testSuites]);

  /**
   * Asset type distribution data for chart.
   */
  const assetTypeDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testCases.length; i++) {
      const type = testCases[i].assetType || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [testCases]);

  /**
   * Automation distribution data for chart.
   */
  const automationDistributionData = useMemo(() => {
    return [
      { label: 'Automated', value: summaryMetrics.automated },
      { label: 'Manual', value: summaryMetrics.manual },
      { label: 'Other', value: summaryMetrics.totalCases - summaryMetrics.automated - summaryMetrics.manual },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Status distribution data for chart.
   */
  const statusDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < testCases.length; i++) {
      const status = testCases[i].status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[key],
    }));
  }, [testCases]);

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
   * Handle view tab change.
   */
  const handleViewChange = useCallback((tabKey) => {
    setActiveView(tabKey);
    setFilterValues({});
    setSearchValue('');
  }, []);

  /**
   * Handle row click to open detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedItem(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedItem(null);
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
   * Open edit form for the selected item.
   */
  const handleOpenEdit = useCallback(() => {
    if (!selectedItem) return;
    setFormData({
      title: selectedItem.title || '',
      description: selectedItem.description || '',
      type: selectedItem.type || 'Test Case',
      assetType: selectedItem.assetType || 'Test Case',
      application: selectedItem.application || '',
      segment: selectedItem.segment || '',
      priority: selectedItem.priority || 'p3',
      severity: selectedItem.severity || 'medium',
      automationStatus: selectedItem.automationStatus || 'manual',
      automationFramework: selectedItem.automationFramework || '',
      automationScriptPath: selectedItem.automationScriptPath || '',
      expectedResults: selectedItem.expectedResults || '',
      estimatedDuration: selectedItem.estimatedDuration !== null && selectedItem.estimatedDuration !== undefined ? String(selectedItem.estimatedDuration) : '',
      environment: selectedItem.environment || '',
    });
    setFormErrors({});
    setIsEditing(true);
    setIsFormOpen(true);
  }, [selectedItem]);

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
    if (!formData.title || formData.title.trim() === '') {
      errors.title = 'Title is required.';
    }
    if (!formData.assetType) {
      errors.assetType = 'Asset type is required.';
    }
    if (formData.estimatedDuration !== '' && formData.estimatedDuration !== null && formData.estimatedDuration !== undefined) {
      const dur = Number(formData.estimatedDuration);
      if (isNaN(dur) || dur < 0) {
        errors.estimatedDuration = 'Estimated duration must be a non-negative number.';
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
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type || 'Test Case',
        assetType: formData.assetType || 'Test Case',
        application: formData.application || null,
        segment: formData.segment || null,
        priority: formData.priority || 'p3',
        severity: formData.severity || 'medium',
        automationStatus: formData.automationStatus || 'manual',
        automationFramework: formData.automationFramework || null,
        automationScriptPath: formData.automationScriptPath || null,
        expectedResults: formData.expectedResults || '',
        estimatedDuration: formData.estimatedDuration !== '' ? Number(formData.estimatedDuration) : 0,
        environment: formData.environment || null,
      };

      if (isEditing && selectedItem) {
        const updated = updateEntity(entityTypes.TEST_CASES, selectedItem.id, data, userId);
        if (updated) {
          setSelectedItem(updated);
          handleCloseForm();
          loadData();
        }
      } else {
        data.status = 'active';
        data.approvalStatus = 'pending';
        data.preconditions = [];
        data.steps = [];
        data.testData = null;
        data.coverage = { requirements: [], features: [], stories: [], coveragePercentage: 0 };
        data.executionHistory = [];
        data.defectsLinked = [];
        data.tags = [];

        const created = createEntity(entityTypes.TEST_CASES, data, userId);
        if (created) {
          handleCloseForm();
          loadData();
        }
      }
    } catch (err) {
      console.error('[TestRepository] Error saving test case:', err);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, isEditing, selectedItem, userId, entityTypes, updateEntity, createEntity, handleCloseForm, loadData]);

  /**
   * Handle clone test case.
   */
  const handleClone = useCallback(() => {
    if (!selectedItem || !canCreate) return;

    try {
      const cloneData = {
        ...selectedItem,
        id: undefined,
        title: `${selectedItem.title || 'Test Case'} (Clone)`,
        status: 'active',
        approvalStatus: 'pending',
        executionHistory: [],
        version: 1,
      };

      delete cloneData.id;
      delete cloneData.created_at;
      delete cloneData.updated_at;
      delete cloneData.created_by;
      delete cloneData.updated_by;

      const created = createEntity(entityTypes.TEST_CASES, cloneData, userId);
      if (created) {
        logAction(userId, 'Clone Test Case', 'test-cases', created.id, `Cloned from ${selectedItem.id}: ${selectedItem.title || selectedItem.id}`);
        handleCloseDetail();
        loadData();
      }
    } catch (err) {
      console.error('[TestRepository] Error cloning test case:', err);
    }
  }, [selectedItem, canCreate, userId, entityTypes, createEntity, handleCloseDetail, loadData]);

  /**
   * Handle approve test case.
   */
  const handleOpenApprove = useCallback(() => {
    if (!selectedItem) return;
    setIsApproveOpen(true);
  }, [selectedItem]);

  const handleCloseApprove = useCallback(() => {
    setIsApproveOpen(false);
  }, []);

  const handleConfirmApprove = useCallback(() => {
    if (!selectedItem) return;

    setIsApproving(true);

    try {
      const updated = updateEntity(entityTypes.TEST_CASES, selectedItem.id, {
        approvalStatus: 'approved',
        approvedBy: userId,
        approvedAt: new Date().toISOString(),
      }, userId);

      if (updated) {
        logAction(userId, 'Approve Test Case', 'test-cases', selectedItem.id, `Approved test case: ${selectedItem.title || selectedItem.id}`);
        setSelectedItem(updated);
        handleCloseApprove();
        loadData();
      }
    } catch (err) {
      console.error('[TestRepository] Error approving test case:', err);
    } finally {
      setIsApproving(false);
    }
  }, [selectedItem, userId, entityTypes, updateEntity, handleCloseApprove, loadData]);

  /**
   * Handle retire test case.
   */
  const handleOpenRetire = useCallback(() => {
    if (!selectedItem) return;
    setIsRetireOpen(true);
  }, [selectedItem]);

  const handleCloseRetire = useCallback(() => {
    setIsRetireOpen(false);
  }, []);

  const handleConfirmRetire = useCallback(() => {
    if (!selectedItem) return;

    setIsRetiring(true);

    try {
      const updated = updateEntity(entityTypes.TEST_CASES, selectedItem.id, {
        status: 'retired',
      }, userId);

      if (updated) {
        logAction(userId, 'Retire Test Case', 'test-cases', selectedItem.id, `Retired test case: ${selectedItem.title || selectedItem.id}`);
        setSelectedItem(updated);
        handleCloseRetire();
        loadData();
      }
    } catch (err) {
      console.error('[TestRepository] Error retiring test case:', err);
    } finally {
      setIsRetiring(false);
    }
  }, [selectedItem, userId, entityTypes, updateEntity, handleCloseRetire, loadData]);

  /**
   * Handle delete test case.
   */
  const handleOpenDelete = useCallback(() => {
    if (!selectedItem) return;
    setItemToDelete(selectedItem);
    setIsDeleteOpen(true);
  }, [selectedItem]);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setItemToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      const deleted = removeEntity(entityTypes.TEST_CASES, itemToDelete.id, userId);
      if (deleted) {
        handleCloseDelete();
        handleCloseDetail();
        loadData();
      }
    } catch (err) {
      console.error('[TestRepository] Error deleting test case:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [itemToDelete, userId, entityTypes, removeEntity, handleCloseDelete, handleCloseDetail, loadData]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const data = activeView === 'test-cases' ? filteredTestCases : filteredTestSuites;

    const exportData = data.map((item) => {
      if (activeView === 'test-cases') {
        return {
          ID: item.id || '',
          Title: item.title || '',
          'Asset Type': item.assetType || '',
          Application: item.application || '',
          Segment: item.segment || '',
          Priority: item.priority || '',
          Severity: item.severity || '',
          Status: item.status || '',
          'Automation Status': item.automationStatus || '',
          'Approval Status': item.approvalStatus || '',
          'Automation Framework': item.automationFramework || '',
          Version: item.version || '',
        };
      }
      return {
        ID: item.id || '',
        Name: item.name || '',
        Type: item.type || '',
        Application: item.application || '',
        Segment: item.segment || '',
        'Total Cases': item.totalCases || 0,
        Automated: item.automatedCount || 0,
        Manual: item.manualCount || 0,
        'Pass Rate': item.passRate !== null && item.passRate !== undefined ? item.passRate + '%' : '',
        Status: item.status || '',
        Priority: item.priority || '',
      };
    });

    exportToCSV(exportData, activeView === 'test-cases' ? 'test-cases' : 'test-suites');

    logAction(userId, `Export ${activeView === 'test-cases' ? 'Test Cases' : 'Test Suites'} CSV`, 'test-assets', 'bulk', `Exported ${exportData.length} items to CSV`);
  }, [canExport, activeView, filteredTestCases, filteredTestSuites, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const data = activeView === 'test-cases' ? filteredTestCases : filteredTestSuites;

    const exportData = data.map((item) => {
      if (activeView === 'test-cases') {
        return {
          ID: item.id || '',
          Title: item.title || '',
          'Asset Type': item.assetType || '',
          Application: item.application || '',
          Segment: item.segment || '',
          Priority: item.priority || '',
          Severity: item.severity || '',
          Status: item.status || '',
          'Automation Status': item.automationStatus || '',
          'Approval Status': item.approvalStatus || '',
          'Automation Framework': item.automationFramework || '',
          Version: item.version || '',
        };
      }
      return {
        ID: item.id || '',
        Name: item.name || '',
        Type: item.type || '',
        Application: item.application || '',
        Segment: item.segment || '',
        'Total Cases': item.totalCases || 0,
        Automated: item.automatedCount || 0,
        Manual: item.manualCount || 0,
        'Pass Rate': item.passRate !== null && item.passRate !== undefined ? item.passRate + '%' : '',
        Status: item.status || '',
        Priority: item.priority || '',
      };
    });

    exportToExcel(exportData, activeView === 'test-cases' ? 'test-cases' : 'test-suites');

    logAction(userId, `Export ${activeView === 'test-cases' ? 'Test Cases' : 'Test Suites'} Excel`, 'test-assets', 'bulk', `Exported ${exportData.length} items to Excel`);
  }, [canExport, activeView, filteredTestCases, filteredTestSuites, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedItem) return [];

    const isTestCase = activeView === 'test-cases';

    if (isTestCase) {
      const execCount = Array.isArray(selectedItem.executionHistory) ? selectedItem.executionHistory.length : 0;
      const defectCount = Array.isArray(selectedItem.defectsLinked) ? selectedItem.defectsLinked.length : 0;
      const stepCount = Array.isArray(selectedItem.steps) ? selectedItem.steps.length : 0;

      return [
        { key: 'overview', label: 'Overview' },
        { key: 'steps', label: 'Steps', badge: stepCount > 0 ? String(stepCount) : undefined },
        { key: 'coverage', label: 'Coverage' },
        { key: 'executions', label: 'Executions', badge: execCount > 0 ? String(execCount) : undefined },
        { key: 'defects', label: 'Defects', badge: defectCount > 0 ? String(defectCount) : undefined },
        { key: 'history', label: 'Version History' },
      ];
    }

    const caseCount = Array.isArray(selectedItem.testCaseIds) ? selectedItem.testCaseIds.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'cases', label: 'Test Cases', badge: caseCount > 0 ? String(caseCount) : undefined },
    ];
  }, [selectedItem, activeView]);

  /**
   * Execution history timeline entries.
   */
  const executionTimelineEntries = useMemo(() => {
    if (!selectedItem || !Array.isArray(selectedItem.executionHistory)) return [];

    return selectedItem.executionHistory.map((exec) => ({
      id: exec.executionId || `exec-${Math.random()}`,
      title: `${exec.executionId || 'Execution'} - ${exec.status || 'unknown'}`,
      description: `Environment: ${exec.environment || '—'} | Duration: ${typeof exec.duration === 'number' ? exec.duration + 's' : '—'} | By: ${exec.executedBy || '—'}`,
      timestamp: exec.date,
      badge: exec.status ? <Badge status={exec.status} size="sm" /> : null,
    }));
  }, [selectedItem]);

  /**
   * View tabs definition.
   */
  const viewTabs = useMemo(() => {
    return [
      { key: 'test-cases', label: 'Test Cases', badge: String(testCases.length) },
      { key: 'test-suites', label: 'Test Suites', badge: String(testSuites.length) },
    ];
  }, [testCases, testSuites]);

  if (isLoading && testCases.length === 0 && testSuites.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading test repository...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="test-repository">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Test Repository</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Manage test cases, suites, and all 13 test asset types
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
              ariaLabel="Create new test case"
            >
              + New Test Case
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
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
          label="Automation Coverage"
          value={summaryMetrics.automationCoverage}
          unit="%"
          variant="compact"
          size="sm"
          testId="metric-automation-coverage"
        />
        <MetricCard
          label="Automated"
          value={summaryMetrics.automated}
          status="passed"
          variant="compact"
          size="sm"
          testId="metric-automated"
        />
        <MetricCard
          label="Manual"
          value={summaryMetrics.manual}
          variant="compact"
          size="sm"
          testId="metric-manual"
        />
        <MetricCard
          label="Pending Approval"
          value={summaryMetrics.pending}
          status={summaryMetrics.pending > 0 ? 'pending' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-pending"
        />
      </div>

      {/* Charts Row */}
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
            testId="chart-automation-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Test cases by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6', '#8B5CF6']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={assetTypeDistributionData}
            title="Asset Type Distribution"
            description="Test cases by asset type"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-asset-type-distribution"
          />
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs
        tabs={viewTabs}
        activeKey={activeView}
        onChange={handleViewChange}
        variant="pill"
        size="md"
        testId="test-repository-view-tabs"
      />

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder={activeView === 'test-cases' ? 'Search test cases...' : 'Search test suites...'}
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="test-repository-filter-bar"
      />

      {/* Data Table */}
      {activeView === 'test-cases' ? (
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
          onRowClick={handleRowClick}
          emptyTitle="No test cases found"
          emptyMessage="No test cases match the current filters. Try adjusting your search or filter criteria."
          ariaLabel="Test cases table"
          testId="test-cases-table"
        />
      ) : (
        <DataTable
          columns={TEST_SUITE_TABLE_COLUMNS}
          data={filteredTestSuites}
          rowKey="id"
          paginated={true}
          pageSize={25}
          striped={true}
          hoverable={true}
          compact={false}
          searchable={false}
          loading={isLoading}
          onRowClick={handleRowClick}
          emptyTitle="No test suites found"
          emptyMessage="No test suites match the current filters. Try adjusting your search or filter criteria."
          ariaLabel="Test suites table"
          testId="test-suites-table"
        />
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={activeView === 'test-cases' ? (selectedItem.title || 'Test Case Detail') : (selectedItem.name || 'Test Suite Detail')}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={activeView === 'test-cases' ? `Test case detail: ${selectedItem.title || selectedItem.id}` : `Test suite detail: ${selectedItem.name || selectedItem.id}`}
          testId="test-detail-modal"
          actions={
            activeView === 'test-cases' ? (
              <div className="flex items-center gap-1 flex-wrap">
                {canUpdate && selectedItem.approvalStatus === 'pending' && (
                  <Button variant="accent" size="sm" onClick={handleOpenApprove} ariaLabel="Approve test case">
                    Approve
                  </Button>
                )}
                {canCreate && (
                  <Button variant="secondary" size="sm" onClick={handleClone} ariaLabel="Clone test case">
                    Clone
                  </Button>
                )}
                {canUpdate && (
                  <Button variant="secondary" size="sm" onClick={handleOpenEdit} ariaLabel="Edit test case">
                    Edit
                  </Button>
                )}
                {canUpdate && selectedItem.status !== 'retired' && (
                  <Button variant="ghost" size="sm" onClick={handleOpenRetire} ariaLabel="Retire test case">
                    Retire
                  </Button>
                )}
                {canDelete && (
                  <Button variant="danger" size="sm" onClick={handleOpenDelete} ariaLabel="Delete test case">
                    Delete
                  </Button>
                )}
              </div>
            ) : null
          }
        >
          <div className="space-y-2">
            {/* Meta Badges */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedItem.status && <Badge status={selectedItem.status} size="md" />}
              {activeView === 'test-cases' && selectedItem.priority && (
                <Badge status={resolvePriorityStatus(selectedItem.priority)} size="md">
                  {selectedItem.priority.toUpperCase()}
                </Badge>
              )}
              {activeView === 'test-cases' && selectedItem.automationStatus && (
                <Badge status={selectedItem.automationStatus} size="md" />
              )}
              {activeView === 'test-cases' && selectedItem.approvalStatus && (
                <Badge status={selectedItem.approvalStatus} size="md" />
              )}
              {selectedItem.assetType && (
                <Badge variant="neutral" size="md">{selectedItem.assetType || selectedItem.type}</Badge>
              )}
              {selectedItem.segment && (
                <Badge variant="neutral" size="md">{selectedItem.segment}</Badge>
              )}
              {selectedItem.application && (
                <Badge variant="neutral" size="md">{selectedItem.application}</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="test-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {(selectedItem.description || selectedItem.expectedResults) && (
                  <div>
                    {selectedItem.description && (
                      <>
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
                      </>
                    )}
                    {selectedItem.expectedResults && (
                      <div className="mt-1">
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Expected Results</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.expectedResults}</p>
                      </div>
                    )}
                    {selectedItem.actualResults && (
                      <div className="mt-1">
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Actual Results</h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.actualResults}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{selectedItem.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{selectedItem.segment || '—'}</span>
                  </div>
                  {activeView === 'test-cases' && (
                    <>
                      <div>
                        <span className="font-medium text-gray-600">Priority:</span>{' '}
                        <span className="text-gray-800">{selectedItem.priority ? selectedItem.priority.toUpperCase() : '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Severity:</span>{' '}
                        <span className="text-gray-800">{selectedItem.severity || '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Automation:</span>{' '}
                        <span className="text-gray-800">{selectedItem.automationStatus || '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Framework:</span>{' '}
                        <span className="text-gray-800">{selectedItem.automationFramework || '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Script Path:</span>{' '}
                        <span className="text-gray-800 truncate">{selectedItem.automationScriptPath || '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Est. Duration:</span>{' '}
                        <span className="text-gray-800">{selectedItem.estimatedDuration ? `${selectedItem.estimatedDuration}s` : '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Environment:</span>{' '}
                        <span className="text-gray-800">{selectedItem.environment || '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Approval:</span>{' '}
                        <span className="text-gray-800">{selectedItem.approvalStatus || '—'}</span>
                      </div>
                      {selectedItem.approvedBy && (
                        <div>
                          <span className="font-medium text-gray-600">Approved By:</span>{' '}
                          <span className="text-gray-800">{selectedItem.approvedBy}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-600">Version:</span>{' '}
                        <span className="text-gray-800">{selectedItem.version || 1}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Suite:</span>{' '}
                        <span className="text-gray-800">{selectedItem.suiteId || '—'}</span>
                      </div>
                    </>
                  )}
                  {activeView === 'test-suites' && (
                    <>
                      <div>
                        <span className="font-medium text-gray-600">Total Cases:</span>{' '}
                        <span className="text-gray-800">{selectedItem.totalCases || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Automated:</span>{' '}
                        <span className="text-gray-800">{selectedItem.automatedCount || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Manual:</span>{' '}
                        <span className="text-gray-800">{selectedItem.manualCount || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Pass Rate:</span>{' '}
                        <span className="text-gray-800">{selectedItem.passRate !== null && selectedItem.passRate !== undefined ? `${selectedItem.passRate}%` : '—'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Last Executed:</span>{' '}
                        <span className="text-gray-800">{formatDate(selectedItem.lastExecuted)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Owner:</span>{' '}
                        <span className="text-gray-800">{selectedItem.owner || '—'}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Preconditions */}
                {activeView === 'test-cases' && Array.isArray(selectedItem.preconditions) && selectedItem.preconditions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Preconditions</h4>
                    <ul className="list-disc list-inside space-y-[2px]">
                      {selectedItem.preconditions.map((pc, idx) => (
                        <li key={idx} className="text-xs text-gray-700">{pc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(selectedItem.tags) && selectedItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Test Data */}
                {activeView === 'test-cases' && selectedItem.testData && typeof selectedItem.testData === 'object' && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Test Data</h4>
                    <div className="grid grid-cols-2 gap-0.5 text-xs">
                      {Object.keys(selectedItem.testData).map((key) => (
                        <div key={key}>
                          <span className="font-medium text-gray-600">{key}:</span>{' '}
                          <span className="text-gray-800">{String(selectedItem.testData[key])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedItem.created_at)}</div>
                  <div>Updated: {formatDate(selectedItem.updated_at)}</div>
                </div>
              </div>
            )}

            {/* Steps Tab */}
            {detailTab === 'steps' && activeView === 'test-cases' && (
              <div>
                {Array.isArray(selectedItem.steps) && selectedItem.steps.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedItem.steps.map((step, idx) => (
                      <div
                        key={step.stepNumber || idx}
                        className="flex items-start gap-1 py-1 px-1.5 border border-gray-100 rounded-standard"
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
                ) : (
                  <EmptyState
                    title="No steps defined"
                    description="No test steps have been defined for this test case."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Coverage Tab */}
            {detailTab === 'coverage' && activeView === 'test-cases' && (
              <div className="space-y-2">
                {selectedItem.coverage ? (
                  <>
                    <MetricCard
                      label="Coverage Percentage"
                      value={selectedItem.coverage.coveragePercentage || 0}
                      unit="%"
                      variant="compact"
                      size="sm"
                    />

                    {Array.isArray(selectedItem.coverage.requirements) && selectedItem.coverage.requirements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Requirements Covered</h4>
                        <div className="flex flex-wrap gap-0.5">
                          {selectedItem.coverage.requirements.map((req, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{req}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(selectedItem.coverage.features) && selectedItem.coverage.features.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Features Covered</h4>
                        <div className="flex flex-wrap gap-0.5">
                          {selectedItem.coverage.features.map((feat, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{feat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Array.isArray(selectedItem.coverage.stories) && selectedItem.coverage.stories.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Stories Covered</h4>
                        <div className="flex flex-wrap gap-0.5">
                          {selectedItem.coverage.stories.map((story, idx) => (
                            <Badge key={idx} variant="neutral" size="sm">{story}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!selectedItem.coverage.requirements || selectedItem.coverage.requirements.length === 0) &&
                     (!selectedItem.coverage.features || selectedItem.coverage.features.length === 0) &&
                     (!selectedItem.coverage.stories || selectedItem.coverage.stories.length === 0) && (
                      <EmptyState
                        title="No coverage data"
                        description="No requirements, features, or stories are linked to this test case."
                        variant="compact"
                      />
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No coverage data"
                    description="No coverage information is available for this test case."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Executions Tab */}
            {detailTab === 'executions' && activeView === 'test-cases' && (
              <div className="space-y-2">
                {Array.isArray(selectedItem.executionHistory) && selectedItem.executionHistory.length > 0 ? (
                  <>
                    {/* Execution Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Executions"
                        value={selectedItem.executionHistory.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={selectedItem.executionHistory.filter((e) => e.status === 'passed').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={selectedItem.executionHistory.filter((e) => e.status === 'failed').length}
                        status={selectedItem.executionHistory.filter((e) => e.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Pass Rate"
                        value={(() => {
                          const total = selectedItem.executionHistory.length;
                          const passed = selectedItem.executionHistory.filter((e) => e.status === 'passed').length;
                          return total > 0 ? Math.round((passed / total) * 10000) / 100 : 0;
                        })()}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Execution History Table */}
                    <DataTable
                      columns={EXECUTION_HISTORY_COLUMNS}
                      data={selectedItem.executionHistory}
                      rowKey="executionId"
                      paginated={selectedItem.executionHistory.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No executions"
                      emptyMessage="No execution history available."
                      ariaLabel="Execution history table"
                      testId="execution-history-table"
                    />

                    {/* Execution Timeline */}
                    {executionTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Execution Timeline</h4>
                        <Timeline
                          entries={executionTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="execution-timeline"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No execution history"
                    description="No test executions have been recorded for this test case."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Defects Tab */}
            {detailTab === 'defects' && activeView === 'test-cases' && (
              <div>
                {Array.isArray(selectedItem.defectsLinked) && selectedItem.defectsLinked.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedItem.defectsLinked.map((defect, idx) => (
                      <div
                        key={defect || idx}
                        className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <span className="text-xs font-medium text-deep-forest-teal-700">{defect}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No linked defects"
                    description="No defects are linked to this test case."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Version History Tab */}
            {detailTab === 'history' && activeView === 'test-cases' && (
              <div className="space-y-1">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Current Version:</span>{' '}
                    <span className="text-gray-800">v{selectedItem.version || 1}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Created:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedItem.created_at)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Created By:</span>{' '}
                    <span className="text-gray-800">{selectedItem.created_by || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Last Updated:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedItem.updated_at)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Updated By:</span>{' '}
                    <span className="text-gray-800">{selectedItem.updated_by || '—'}</span>
                  </div>
                  {selectedItem.approvedBy && (
                    <div>
                      <span className="font-medium text-gray-600">Approved By:</span>{' '}
                      <span className="text-gray-800">{selectedItem.approvedBy}</span>
                    </div>
                  )}
                  {selectedItem.approvedAt && (
                    <div>
                      <span className="font-medium text-gray-600">Approved At:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedItem.approvedAt)}</span>
                    </div>
                  )}
                </div>

                <Card variant="sunken" padding="sm">
                  <p className="text-[10px] text-gray-500 italic">
                    Version history tracking is simulated. In a production system, each edit would create a new version entry with a diff of changed fields.
                  </p>
                </Card>
              </div>
            )}

            {/* Test Cases Tab (for suites) */}
            {detailTab === 'cases' && activeView === 'test-suites' && (
              <div>
                {Array.isArray(selectedItem.testCaseIds) && selectedItem.testCaseIds.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedItem.testCaseIds.map((tcId, idx) => {
                      const tc = testCases.find((t) => t.id === tcId);
                      return (
                        <div
                          key={tcId || idx}
                          className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                        >
                          <div className="flex items-center gap-0.5 min-w-0">
                            <span className="text-xs font-mono text-gray-500">{tcId}</span>
                            {tc && (
                              <span className="text-xs font-medium text-gray-800 truncate">{tc.title}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {tc && tc.status && <Badge status={tc.status} size="sm" />}
                            {tc && tc.automationStatus && <Badge status={tc.automationStatus} size="sm" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No test cases"
                    description="No test cases are associated with this test suite."
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
        title={isEditing ? 'Edit Test Case' : 'Create New Test Case'}
        size="lg"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={isEditing ? 'Edit test case form' : 'Create test case form'}
        testId="test-case-form-modal"
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
              ariaLabel={isEditing ? 'Save changes' : 'Create test case'}
            >
              {isEditing ? 'Save Changes' : 'Create Test Case'}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <FormField
            label="Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleFormChange}
            placeholder="Enter test case title"
            required={true}
            error={formErrors.title}
            testId="form-title"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Describe the test case..."
            rows={3}
            testId="form-description"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Asset Type"
              name="assetType"
              type="select"
              value={formData.assetType}
              onChange={handleFormChange}
              options={ASSET_TYPE_OPTIONS}
              required={true}
              error={formErrors.assetType}
              testId="form-asset-type"
            />
            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleFormChange}
              options={PRIORITY_OPTIONS}
              testId="form-priority"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Severity"
              name="severity"
              type="select"
              value={formData.severity}
              onChange={handleFormChange}
              options={SEVERITY_OPTIONS}
              testId="form-severity"
            />
            <FormField
              label="Automation Status"
              name="automationStatus"
              type="select"
              value={formData.automationStatus}
              onChange={handleFormChange}
              options={AUTOMATION_STATUS_OPTIONS}
              testId="form-automation-status"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Automation Framework"
              name="automationFramework"
              type="text"
              value={formData.automationFramework}
              onChange={handleFormChange}
              placeholder="e.g., Selenium, Playwright, Jest"
              testId="form-automation-framework"
            />
            <FormField
              label="Script Path"
              name="automationScriptPath"
              type="text"
              value={formData.automationScriptPath}
              onChange={handleFormChange}
              placeholder="e.g., /tests/claims/tc-001.spec.js"
              testId="form-script-path"
            />
          </div>

          <FormField
            label="Expected Results"
            name="expectedResults"
            type="textarea"
            value={formData.expectedResults}
            onChange={handleFormChange}
            placeholder="Describe the expected results..."
            rows={2}
            testId="form-expected-results"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Estimated Duration (seconds)"
              name="estimatedDuration"
              type="number"
              value={formData.estimatedDuration}
              onChange={handleFormChange}
              placeholder="e.g., 60"
              min={0}
              error={formErrors.estimatedDuration}
              testId="form-estimated-duration"
            />
            <FormField
              label="Environment"
              name="environment"
              type="text"
              value={formData.environment}
              onChange={handleFormChange}
              placeholder="e.g., staging, uat"
              testId="form-environment"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Test Case"
        message={`Are you sure you want to delete "${itemToDelete ? (itemToDelete.title || itemToDelete.name || itemToDelete.id) : ''}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        loadingText="Deleting..."
        testId="test-case-delete-dialog"
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isApproveOpen}
        onClose={handleCloseApprove}
        onConfirm={handleConfirmApprove}
        title="Approve Test Case"
        message={`Approve test case "${selectedItem ? (selectedItem.title || selectedItem.id) : ''}"? This will mark it as approved for execution.`}
        variant="info"
        confirmLabel="Approve"
        cancelLabel="Cancel"
        loading={isApproving}
        loadingText="Approving..."
        testId="test-case-approve-dialog"
      />

      {/* Retire Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRetireOpen}
        onClose={handleCloseRetire}
        onConfirm={handleConfirmRetire}
        title="Retire Test Case"
        message={`Retire test case "${selectedItem ? (selectedItem.title || selectedItem.id) : ''}"? Retired test cases will no longer be included in active test suites or scheduled executions.`}
        variant="warning"
        confirmLabel="Retire"
        cancelLabel="Cancel"
        loading={isRetiring}
        loadingText="Retiring..."
        testId="test-case-retire-dialog"
      />
    </div>
  );
}