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
import {
  getQualityGates,
  getQualityGateDetail,
  getQualityGateById,
  getQualityGateByKey,
  createQualityGate,
  updateQualityGate,
  deleteQualityGate,
  requestWaiver,
  resolveWaiver,
  getQualityGatesByStatus,
  getQualityGatesByPhase,
  getQualityGatesByCategory,
  getQualityGateCountByStatus,
  getQualityGatesForRelease,
  getQualityGatesForApplication,
  getQualityGatesWithPendingWaivers,
  getMandatoryQualityGates,
  getOverallComplianceRate,
  getWeightedQualityGateScore,
  getTotalPendingWaivers,
  getQualityGateSummary,
  getDistinctValues,
  searchQualityGates,
} from '../services/qualityGateService.js';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module QualityGates
 * Quality Gates page for eQIP Quality Intelligence.
 *
 * Configures and monitors 16 release quality gates with thresholds,
 * applicability rules, and waiver handling. Displays gate list with status,
 * allows threshold editing, and waiver request/approval workflow.
 * Uses qualityGateService for all data operations.
 * All actions logged via auditLogger.
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
 * Quality gate phase order for the stepper.
 * @type {Readonly<Array<object>>}
 */
const QUALITY_GATE_PHASES = Object.freeze([
  { label: 'Planning', key: 'planning' },
  { label: 'Development', key: 'development' },
  { label: 'Build', key: 'build' },
  { label: 'Testing', key: 'testing' },
  { label: 'Acceptance', key: 'acceptance' },
  { label: 'Release', key: 'release' },
]);

/**
 * Phase filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const PHASE_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'development', label: 'Development' },
  { value: 'build', label: 'Build' },
  { value: 'testing', label: 'Testing' },
  { value: 'acceptance', label: 'Acceptance' },
  { value: 'release', label: 'Release' },
];

/**
 * Status filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'in_review', label: 'In Review' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'waived', label: 'Waived' },
  { value: 'blocked', label: 'Blocked' },
];

/**
 * Category filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const CATEGORY_OPTIONS = [
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Development', label: 'Development' },
  { value: 'Build', label: 'Build' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Security', label: 'Security' },
  { value: 'Compliance', label: 'Compliance' },
  { value: 'Acceptance', label: 'Acceptance' },
  { value: 'Release', label: 'Release' },
];

/**
 * Columns definition for the quality gates data table.
 * @type {Array<object>}
 */
const QUALITY_GATE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Quality Gate',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'phase',
    label: 'Phase',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 capitalize">{value}</span>;
    },
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
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
    key: 'threshold',
    label: 'Threshold',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (value, row) => {
      if (value === null || value === undefined) return '—';
      const unit = row.unit || '';
      if (unit === '%') return `${value}%`;
      if (unit === 'critical_issues' || unit === 'critical_vulnerabilities') return `≤ ${value}`;
      return String(value);
    },
  },
  {
    key: 'currentValue',
    label: 'Current',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (value, row) => {
      if (value === null || value === undefined) return '—';
      const unit = row.unit || '';
      if (unit === '%') return `${value}%`;
      return String(value);
    },
  },
  {
    key: 'weight',
    label: 'Weight',
    sortable: true,
    align: 'right',
    width: '70px',
    render: (value) => {
      if (value === null || value === undefined || value === 0) return '—';
      return (typeof value === 'number' ? (value * 100).toFixed(0) + '%' : String(value));
    },
  },
  {
    key: 'applicabilityRules',
    label: 'Mandatory',
    sortable: false,
    align: 'center',
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      if (value.mandatory === true) return <Badge variant="accent" size="sm">Yes</Badge>;
      return <span className="text-xs text-gray-400">No</span>;
    },
  },
  {
    key: 'waiverHistory',
    label: 'Waivers',
    sortable: false,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (!Array.isArray(value) || value.length === 0) return <span className="text-xs text-gray-400">0</span>;
      const pending = value.filter((w) => w.status === 'pending').length;
      if (pending > 0) return <Badge variant="warning" size="sm">{pending} pending</Badge>;
      return <span className="text-xs text-gray-500">{value.length}</span>;
    },
  },
  {
    key: 'lastEvaluated',
    label: 'Last Evaluated',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Waiver history table columns for the detail modal.
 * @type {Array<object>}
 */
const WAIVER_TABLE_COLUMNS = [
  {
    key: 'releaseId',
    label: 'Release',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
  {
    key: 'reason',
    label: 'Reason',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-700 truncate">{value}</span>;
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
    key: 'requestedBy',
    label: 'Requested By',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'requestedAt',
    label: 'Requested',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'approvedBy',
    label: 'Resolved By',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">—</span>;
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'approvedAt',
    label: 'Resolved',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
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
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-800">{value}</span>;
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
    key: 'uploadedBy',
    label: 'Uploaded By',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'uploadedAt',
    label: 'Uploaded',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
];

/**
 * Initial form state for editing a quality gate threshold.
 * @returns {object} The initial form state.
 */
function getInitialThresholdFormState() {
  return {
    threshold: '',
    weight: '',
  };
}

/**
 * Initial form state for requesting a waiver.
 * @returns {object} The initial form state.
 */
function getInitialWaiverFormState() {
  return {
    releaseId: '',
    reason: '',
    expiresAt: '',
  };
}

/**
 * Quality Gates page component.
 *
 * @returns {React.ReactElement} The rendered QualityGates page.
 */
export default function QualityGates() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [qualityGates, setQualityGates] = useState([]);
  const [summary, setSummary] = useState(null);

  // Detail modal state
  const [selectedGate, setSelectedGate] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Threshold edit modal state
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);
  const [thresholdForm, setThresholdForm] = useState(getInitialThresholdFormState());
  const [thresholdErrors, setThresholdErrors] = useState({});
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  // Waiver request modal state
  const [isWaiverRequestOpen, setIsWaiverRequestOpen] = useState(false);
  const [waiverForm, setWaiverForm] = useState(getInitialWaiverFormState());
  const [waiverErrors, setWaiverErrors] = useState({});
  const [isRequestingWaiver, setIsRequestingWaiver] = useState(false);

  // Waiver resolve modal state
  const [isWaiverResolveOpen, setIsWaiverResolveOpen] = useState(false);
  const [selectedWaiver, setSelectedWaiver] = useState(null);
  const [waiverDecision, setWaiverDecision] = useState('approved');
  const [waiverComments, setWaiverComments] = useState('');
  const [isResolvingWaiver, setIsResolvingWaiver] = useState(false);

  // Delete confirm state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [gateToDelete, setGateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const userSegment = user ? user.segment : undefined;
  const canUpdate = canPerform('update', 'quality-gates');
  const canCreate = canPerform('create', 'quality-gates');
  const canDelete = canPerform('delete', 'quality-gates');
  const canApprove = canPerform('approve', 'quality-gates');
  const canExport = canPerform('export', 'quality-gates');

  /**
   * Load quality gates data from qualityGateService.
   */
  const loadQualityGates = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const options = {
        filters: {},
        query: searchValue && searchValue.trim() !== '' ? searchValue : undefined,
        sortKey: 'phase',
        sortDirection: 'asc',
        role,
        userSegment,
      };

      if (filterValues.status) options.filters.status = filterValues.status;
      if (filterValues.phase) options.filters.phase = filterValues.phase;
      if (filterValues.category) options.filters.category = filterValues.category;

      if (Object.keys(options.filters).length === 0) {
        delete options.filters;
      }

      const result = getQualityGates(options);
      setQualityGates(result.items || []);

      const summaryData = getQualityGateSummary(role, userSegment);
      setSummary(summaryData);
    } catch (err) {
      console.error('[QualityGates] Error loading quality gates:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment, filterValues, searchValue]);

  useEffect(() => {
    loadQualityGates();
  }, [loadQualityGates, dataVersion]);

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
        key: 'phase',
        label: 'Phase',
        options: PHASE_OPTIONS,
      },
      {
        key: 'category',
        label: 'Category',
        options: CATEGORY_OPTIONS,
      },
    ];
  }, []);

  /**
   * Status distribution chart data.
   */
  const statusDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Passed', value: summary.passed || 0 },
      { label: 'Failed', value: summary.failed || 0 },
      { label: 'In Review', value: summary.inReview || 0 },
      { label: 'Not Started', value: summary.notStarted || 0 },
      { label: 'Waived', value: summary.waived || 0 },
      { label: 'Blocked', value: summary.blocked || 0 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  /**
   * Phase distribution chart data.
   */
  const phaseDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < qualityGates.length; i++) {
      const phase = qualityGates[i].phase ? qualityGates[i].phase.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Unknown';
      counts[phase] = (counts[phase] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [qualityGates]);

  /**
   * Category distribution chart data.
   */
  const categoryDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < qualityGates.length; i++) {
      const category = qualityGates[i].category || 'Unknown';
      counts[category] = (counts[category] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [qualityGates]);

  /**
   * Phase stepper steps derived from quality gate statuses.
   */
  const phaseStepperSteps = useMemo(() => {
    const phaseGates = {};
    for (let i = 0; i < qualityGates.length; i++) {
      const gate = qualityGates[i];
      const phase = gate.phase || 'unknown';
      if (!phaseGates[phase]) {
        phaseGates[phase] = [];
      }
      phaseGates[phase].push(gate.status);
    }

    return QUALITY_GATE_PHASES.map((phase) => {
      const statuses = phaseGates[phase.key] || [];
      if (statuses.length === 0) return { label: phase.label, state: 'pending' };

      const allPassed = statuses.every((s) => s === 'passed' || s === 'waived');
      const anyFailed = statuses.some((s) => s === 'failed');
      const anyInReview = statuses.some((s) => s === 'in_review');
      const allNotStarted = statuses.every((s) => s === 'not_started');

      if (anyFailed) return { label: phase.label, state: 'error' };
      if (allPassed) return { label: phase.label, state: 'completed' };
      if (anyInReview) return { label: phase.label, state: 'active' };
      if (allNotStarted) return { label: phase.label, state: 'pending' };
      return { label: phase.label, state: 'active' };
    });
  }, [qualityGates]);

  /**
   * Active phase index for the stepper.
   */
  const activePhaseIndex = useMemo(() => {
    for (let i = phaseStepperSteps.length - 1; i >= 0; i--) {
      if (phaseStepperSteps[i].state === 'active' || phaseStepperSteps[i].state === 'error') {
        return i;
      }
    }
    for (let i = phaseStepperSteps.length - 1; i >= 0; i--) {
      if (phaseStepperSteps[i].state === 'completed') {
        return Math.min(i + 1, phaseStepperSteps.length - 1);
      }
    }
    return 0;
  }, [phaseStepperSteps]);

  /**
   * Compliance rate.
   */
  const complianceRate = useMemo(() => {
    if (!summary) return 0;
    return summary.complianceRate || 0;
  }, [summary]);

  /**
   * Weighted score.
   */
  const weightedScore = useMemo(() => {
    try {
      return getWeightedQualityGateScore(role, userSegment);
    } catch (_err) {
      return 0;
    }
  }, [role, userSegment, dataVersion]);

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
   * Handle row click to open quality gate detail.
   */
  const handleRowClick = useCallback((row) => {
    const detail = getQualityGateDetail(row.id, role);
    setSelectedGate(detail || row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, [role]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedGate(null);
    setDetailTab('overview');
  }, []);

  /**
   * Open threshold edit modal.
   */
  const handleOpenThresholdEdit = useCallback(() => {
    if (!selectedGate) return;
    setThresholdForm({
      threshold: selectedGate.threshold !== null && selectedGate.threshold !== undefined ? String(selectedGate.threshold) : '',
      weight: selectedGate.weight !== null && selectedGate.weight !== undefined ? String(selectedGate.weight) : '',
    });
    setThresholdErrors({});
    setIsThresholdOpen(true);
  }, [selectedGate]);

  const handleCloseThresholdEdit = useCallback(() => {
    setIsThresholdOpen(false);
    setThresholdForm(getInitialThresholdFormState());
    setThresholdErrors({});
  }, []);

  /**
   * Handle threshold form field change.
   */
  const handleThresholdFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setThresholdForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (thresholdErrors[name]) {
      setThresholdErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [thresholdErrors]);

  /**
   * Validate threshold form.
   * @returns {boolean} True if valid.
   */
  const validateThresholdForm = useCallback(() => {
    const errors = {};
    if (thresholdForm.threshold !== '' && thresholdForm.threshold !== null && thresholdForm.threshold !== undefined) {
      const threshold = Number(thresholdForm.threshold);
      if (isNaN(threshold) || threshold < 0) {
        errors.threshold = 'Threshold must be a non-negative number.';
      }
    }
    if (thresholdForm.weight !== '' && thresholdForm.weight !== null && thresholdForm.weight !== undefined) {
      const weight = Number(thresholdForm.weight);
      if (isNaN(weight) || weight < 0 || weight > 1) {
        errors.weight = 'Weight must be between 0 and 1.';
      }
    }
    setThresholdErrors(errors);
    return Object.keys(errors).length === 0;
  }, [thresholdForm]);

  /**
   * Handle threshold form submit.
   */
  const handleThresholdSubmit = useCallback(() => {
    if (!validateThresholdForm() || !selectedGate) return;

    setIsSavingThreshold(true);

    try {
      const updates = {};
      if (thresholdForm.threshold !== '') {
        updates.threshold = Number(thresholdForm.threshold);
      }
      if (thresholdForm.weight !== '') {
        updates.weight = Number(thresholdForm.weight);
      }

      const updated = updateQualityGate(selectedGate.id, updates, userId, role);

      if (updated) {
        setSelectedGate(updated);
        handleCloseThresholdEdit();
        loadQualityGates();
      }
    } catch (err) {
      console.error('[QualityGates] Error updating threshold:', err);
    } finally {
      setIsSavingThreshold(false);
    }
  }, [validateThresholdForm, thresholdForm, selectedGate, userId, role, handleCloseThresholdEdit, loadQualityGates]);

  /**
   * Open waiver request modal.
   */
  const handleOpenWaiverRequest = useCallback(() => {
    if (!selectedGate) return;
    setWaiverForm(getInitialWaiverFormState());
    setWaiverErrors({});
    setIsWaiverRequestOpen(true);
  }, [selectedGate]);

  const handleCloseWaiverRequest = useCallback(() => {
    setIsWaiverRequestOpen(false);
    setWaiverForm(getInitialWaiverFormState());
    setWaiverErrors({});
  }, []);

  /**
   * Handle waiver form field change.
   */
  const handleWaiverFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setWaiverForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (waiverErrors[name]) {
      setWaiverErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [waiverErrors]);

  /**
   * Validate waiver form.
   * @returns {boolean} True if valid.
   */
  const validateWaiverForm = useCallback(() => {
    const errors = {};
    if (!waiverForm.reason || waiverForm.reason.trim() === '') {
      errors.reason = 'Reason is required for waiver request.';
    }
    setWaiverErrors(errors);
    return Object.keys(errors).length === 0;
  }, [waiverForm]);

  /**
   * Handle waiver request submit.
   */
  const handleWaiverRequestSubmit = useCallback(() => {
    if (!validateWaiverForm() || !selectedGate) return;

    setIsRequestingWaiver(true);

    try {
      const waiverData = {
        releaseId: waiverForm.releaseId || null,
        reason: waiverForm.reason.trim(),
        expiresAt: waiverForm.expiresAt || null,
      };

      const updated = requestWaiver(selectedGate.id, waiverData, userId, role);

      if (updated) {
        setSelectedGate(updated);
        handleCloseWaiverRequest();
        loadQualityGates();
      }
    } catch (err) {
      console.error('[QualityGates] Error requesting waiver:', err);
    } finally {
      setIsRequestingWaiver(false);
    }
  }, [validateWaiverForm, waiverForm, selectedGate, userId, role, handleCloseWaiverRequest, loadQualityGates]);

  /**
   * Open waiver resolve modal.
   */
  const handleOpenWaiverResolve = useCallback((waiver) => {
    if (!waiver || !selectedGate) return;
    setSelectedWaiver(waiver);
    setWaiverDecision('approved');
    setWaiverComments('');
    setIsWaiverResolveOpen(true);
  }, [selectedGate]);

  const handleCloseWaiverResolve = useCallback(() => {
    setIsWaiverResolveOpen(false);
    setSelectedWaiver(null);
    setWaiverDecision('approved');
    setWaiverComments('');
  }, []);

  /**
   * Handle waiver resolve submit.
   */
  const handleWaiverResolveSubmit = useCallback(() => {
    if (!selectedWaiver || !selectedGate) return;

    setIsResolvingWaiver(true);

    try {
      const updated = resolveWaiver(
        selectedGate.id,
        selectedWaiver.id,
        waiverDecision,
        waiverComments,
        userId,
        role,
      );

      if (updated) {
        setSelectedGate(updated);
        handleCloseWaiverResolve();
        loadQualityGates();
      }
    } catch (err) {
      console.error('[QualityGates] Error resolving waiver:', err);
    } finally {
      setIsResolvingWaiver(false);
    }
  }, [selectedWaiver, selectedGate, waiverDecision, waiverComments, userId, role, handleCloseWaiverResolve, loadQualityGates]);

  /**
   * Handle delete quality gate.
   */
  const handleOpenDelete = useCallback(() => {
    if (!selectedGate) return;
    setGateToDelete(selectedGate);
    setIsDeleteOpen(true);
  }, [selectedGate]);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setGateToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!gateToDelete) return;

    setIsDeleting(true);

    try {
      const deleted = deleteQualityGate(gateToDelete.id, userId, role);
      if (deleted) {
        handleCloseDelete();
        handleCloseDetail();
        loadQualityGates();
      }
    } catch (err) {
      console.error('[QualityGates] Error deleting quality gate:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [gateToDelete, userId, role, handleCloseDelete, handleCloseDetail, loadQualityGates]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = qualityGates.map((gate) => ({
      ID: gate.id || '',
      Name: gate.name || '',
      Key: gate.key || '',
      Phase: gate.phase || '',
      Category: gate.category || '',
      Status: gate.status || '',
      Threshold: gate.threshold !== null && gate.threshold !== undefined ? gate.threshold : '',
      'Current Value': gate.currentValue !== null && gate.currentValue !== undefined ? gate.currentValue : '',
      Unit: gate.unit || '',
      Weight: gate.weight !== null && gate.weight !== undefined ? gate.weight : '',
      Mandatory: gate.applicabilityRules && gate.applicabilityRules.mandatory ? 'Yes' : 'No',
      'Last Evaluated': gate.lastEvaluated || '',
      'Pending Waivers': Array.isArray(gate.waiverHistory) ? gate.waiverHistory.filter((w) => w.status === 'pending').length : 0,
    }));

    exportToCSV(exportData, 'quality-gates');

    logAction(userId, 'Export Quality Gates CSV', 'quality-gates', 'bulk', `Exported ${exportData.length} quality gates to CSV`);
  }, [canExport, qualityGates, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = qualityGates.map((gate) => ({
      ID: gate.id || '',
      Name: gate.name || '',
      Key: gate.key || '',
      Phase: gate.phase || '',
      Category: gate.category || '',
      Status: gate.status || '',
      Threshold: gate.threshold !== null && gate.threshold !== undefined ? gate.threshold : '',
      'Current Value': gate.currentValue !== null && gate.currentValue !== undefined ? gate.currentValue : '',
      Unit: gate.unit || '',
      Weight: gate.weight !== null && gate.weight !== undefined ? gate.weight : '',
      Mandatory: gate.applicabilityRules && gate.applicabilityRules.mandatory ? 'Yes' : 'No',
      'Last Evaluated': gate.lastEvaluated || '',
      'Pending Waivers': Array.isArray(gate.waiverHistory) ? gate.waiverHistory.filter((w) => w.status === 'pending').length : 0,
    }));

    exportToExcel(exportData, 'quality-gates');

    logAction(userId, 'Export Quality Gates Excel', 'quality-gates', 'bulk', `Exported ${exportData.length} quality gates to Excel`);
  }, [canExport, qualityGates, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedGate) return [];

    const waiverCount = Array.isArray(selectedGate.waiverHistory) ? selectedGate.waiverHistory.length : 0;
    const evidenceCount = Array.isArray(selectedGate.evidence) ? selectedGate.evidence.length : 0;
    const releaseCount = Array.isArray(selectedGate.linkedReleases) ? selectedGate.linkedReleases.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'applicability', label: 'Applicability' },
      { key: 'waivers', label: 'Waivers', badge: waiverCount > 0 ? String(waiverCount) : undefined },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'releases', label: 'Linked Releases', badge: releaseCount > 0 ? String(releaseCount) : undefined },
    ];
  }, [selectedGate]);

  /**
   * Waiver timeline entries.
   */
  const waiverTimelineEntries = useMemo(() => {
    if (!selectedGate || !Array.isArray(selectedGate.waiverHistory)) return [];
    return selectedGate.waiverHistory.map((waiver) => ({
      id: waiver.id || `waiver-${Math.random()}`,
      title: `Waiver - ${waiver.status || 'unknown'}`,
      description: waiver.reason || '—',
      timestamp: waiver.requestedAt,
      badge: waiver.status ? <Badge status={waiver.status} size="sm" /> : null,
      metadata: [
        { label: 'Release', value: waiver.releaseId || '—' },
        { label: 'Requested By', value: waiver.requestedBy || '—' },
        { label: 'Status', value: waiver.status || '—' },
        ...(waiver.approvedBy ? [{ label: 'Resolved By', value: waiver.approvedBy }] : []),
        ...(waiver.comments ? [{ label: 'Comments', value: waiver.comments }] : []),
      ],
    }));
  }, [selectedGate]);

  /**
   * Pending waivers for the selected gate.
   */
  const pendingWaivers = useMemo(() => {
    if (!selectedGate || !Array.isArray(selectedGate.waiverHistory)) return [];
    return selectedGate.waiverHistory.filter((w) => w.status === 'pending');
  }, [selectedGate]);

  /**
   * Gate progress bar value.
   */
  const gateProgressValue = useMemo(() => {
    if (!selectedGate) return 0;
    const threshold = selectedGate.threshold;
    const currentValue = selectedGate.currentValue;
    const unit = selectedGate.unit;

    if (threshold === null || threshold === undefined || currentValue === null || currentValue === undefined) return 0;

    if (unit === 'critical_issues' || unit === 'critical_vulnerabilities') {
      if (threshold === 0) return currentValue === 0 ? 100 : 0;
      return currentValue <= threshold ? 100 : Math.max(0, 100 - ((currentValue - threshold) * 20));
    }

    if (typeof threshold === 'number' && threshold > 0) {
      return Math.min((currentValue / threshold) * 100, 100);
    }

    return 0;
  }, [selectedGate]);

  if (isLoading && qualityGates.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading quality gates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="quality-gates">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Quality Gates</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Configure and monitor release quality gates with thresholds, applicability rules, and waiver handling
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
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1">
          <MetricCard
            label="Total Gates"
            value={summary.total}
            variant="compact"
            size="sm"
            testId="metric-total-gates"
          />
          <MetricCard
            label="Passed"
            value={summary.passed}
            status="passed"
            variant="compact"
            size="sm"
            testId="metric-passed"
          />
          <MetricCard
            label="Failed"
            value={summary.failed}
            status={summary.failed > 0 ? 'failed' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-failed"
          />
          <MetricCard
            label="In Review"
            value={summary.inReview}
            status={summary.inReview > 0 ? 'in_review' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-in-review"
          />
          <MetricCard
            label="Waived"
            value={summary.waived}
            status={summary.waived > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-waived"
          />
          <MetricCard
            label="Compliance Rate"
            value={complianceRate}
            unit="%"
            variant="compact"
            size="sm"
            testId="metric-compliance-rate"
          />
          <MetricCard
            label="Weighted Score"
            value={weightedScore}
            variant="compact"
            size="sm"
            testId="metric-weighted-score"
          />
          <MetricCard
            label="Pending Waivers"
            value={summary.pendingWaivers}
            status={summary.pendingWaivers > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-pending-waivers"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          <MetricCard
            label="Mandatory Gates"
            value={summary.mandatory}
            variant="compact"
            size="sm"
            testId="metric-mandatory"
          />
          <MetricCard
            label="Not Started"
            value={summary.notStarted}
            status={summary.notStarted > 0 ? 'pending' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-not-started"
          />
          <MetricCard
            label="Blocked"
            value={summary.blocked}
            status={summary.blocked > 0 ? 'blocked' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-blocked"
          />
          <MetricCard
            label="Total Weight"
            value={summary.totalWeight}
            variant="compact"
            size="sm"
            testId="metric-total-weight"
          />
        </div>
      )}

      {/* Phase Progress Stepper */}
      <Card variant="base" padding="md">
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Quality Gate Phase Progress</h3>
        <Stepper
          steps={phaseStepperSteps}
          activeStep={activePhaseIndex}
          variant="horizontal"
          size="md"
          testId="quality-gates-phase-stepper"
        />
      </Card>

      {/* Compliance Progress */}
      <Card variant="base" padding="md">
        <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Overall Compliance</h3>
        <ProgressBar
          value={complianceRate}
          max={100}
          size="md"
          variant="auto"
          showValue={true}
          label="Quality Gate Compliance Rate"
          unit="%"
          thresholds={{ error: 60, warning: 85, success: 100 }}
          testId="compliance-rate-bar"
        />
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Quality gates by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#8B5CF6', '#3B82F6']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={phaseDistributionData}
            title="Gates by Phase"
            description="Quality gates per release phase"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38']}
            testId="chart-phase-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={categoryDistributionData}
            title="Gates by Category"
            description="Quality gates per category"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-category-distribution"
          />
        </Card>
      </div>

      {/* Pending Waivers Alert */}
      {summary && summary.pendingWaivers > 0 && (
        <Card variant="base" padding="sm">
          <div className="flex items-center gap-1">
            <Badge status="warning" size="md">{summary.pendingWaivers} Pending Waiver{summary.pendingWaivers !== 1 ? 's' : ''}</Badge>
            <span className="text-xs text-gray-500">Quality gate waivers awaiting approval</span>
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
        searchPlaceholder="Search quality gates..."
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="quality-gates-filter-bar"
      />

      {/* Quality Gates Data Table */}
      <DataTable
        columns={QUALITY_GATE_TABLE_COLUMNS}
        data={qualityGates}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No quality gates found"
        emptyMessage="No quality gates match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Quality gates table"
        testId="quality-gates-table"
      />

      {/* Quality Gate Detail Modal */}
      {selectedGate && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedGate.name || 'Quality Gate Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Quality gate detail: ${selectedGate.name || selectedGate.id}`}
          testId="quality-gate-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenThresholdEdit} ariaLabel="Edit threshold">
                  Edit Threshold
                </Button>
              )}
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenWaiverRequest} ariaLabel="Request waiver">
                  Request Waiver
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleOpenDelete} ariaLabel="Delete quality gate">
                  Delete
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Gate Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedGate.status && <Badge status={selectedGate.status} size="md" />}
              {selectedGate.phase && (
                <Badge variant="neutral" size="md">{selectedGate.phase}</Badge>
              )}
              {selectedGate.category && (
                <Badge variant="neutral" size="md">{selectedGate.category}</Badge>
              )}
              {selectedGate.applicabilityRules && selectedGate.applicabilityRules.mandatory && (
                <Badge variant="accent" size="md">Mandatory</Badge>
              )}
              {selectedGate.unit && (
                <Badge variant="neutral" size="md">{selectedGate.unit}</Badge>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              <MetricCard
                label="Threshold"
                value={selectedGate.threshold !== null && selectedGate.threshold !== undefined ? selectedGate.threshold : '—'}
                unit={selectedGate.unit === '%' ? '%' : undefined}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Current Value"
                value={selectedGate.currentValue !== null && selectedGate.currentValue !== undefined ? selectedGate.currentValue : '—'}
                unit={selectedGate.unit === '%' ? '%' : undefined}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Weight"
                value={selectedGate.weight !== null && selectedGate.weight !== undefined ? (selectedGate.weight * 100).toFixed(0) + '%' : '—'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Pending Waivers"
                value={pendingWaivers.length}
                status={pendingWaivers.length > 0 ? 'warning' : 'healthy'}
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
              testId="quality-gate-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedGate.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedGate.description}</p>
                  </div>
                )}

                {/* Gate Progress */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Gate Progress</h4>
                  <ProgressBar
                    value={gateProgressValue}
                    max={100}
                    size="md"
                    variant="auto"
                    showValue={true}
                    label={`${selectedGate.name || 'Gate'} Compliance`}
                    unit="%"
                    thresholds={{ error: 60, warning: 85, success: 100 }}
                    testId="gate-progress-bar"
                  />
                  <div className="grid grid-cols-2 gap-1 mt-0.5 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Threshold:</span>{' '}
                      <span className="text-gray-800">
                        {selectedGate.threshold !== null && selectedGate.threshold !== undefined
                          ? (selectedGate.unit === '%' ? `${selectedGate.threshold}%` : (selectedGate.unit === 'critical_issues' || selectedGate.unit === 'critical_vulnerabilities' ? `≤ ${selectedGate.threshold}` : String(selectedGate.threshold)))
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Current:</span>{' '}
                      <span className="text-gray-800">
                        {selectedGate.currentValue !== null && selectedGate.currentValue !== undefined
                          ? (selectedGate.unit === '%' ? `${selectedGate.currentValue}%` : String(selectedGate.currentValue))
                          : '—'}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Gate Info */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Gate Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Key:</span>{' '}
                      <span className="text-gray-800 font-mono">{selectedGate.key || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phase:</span>{' '}
                      <span className="text-gray-800 capitalize">{selectedGate.phase || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>{' '}
                      <span className="text-gray-800">{selectedGate.category || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedGate.status || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Unit:</span>{' '}
                      <span className="text-gray-800">{selectedGate.unit || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Weight:</span>{' '}
                      <span className="text-gray-800">{selectedGate.weight !== null && selectedGate.weight !== undefined ? (selectedGate.weight * 100).toFixed(0) + '%' : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Mandatory:</span>{' '}
                      <span className="text-gray-800">{selectedGate.applicabilityRules && selectedGate.applicabilityRules.mandatory ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>{' '}
                      <span className="text-gray-800">{selectedGate.owner || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Evaluation:</span>{' '}
                      <span className="text-gray-800">{selectedGate.evaluationFrequency ? selectedGate.evaluationFrequency.replace(/_/g, ' ') : '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Evaluated:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedGate.lastEvaluated)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedGate.version || 1}</span>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                {Array.isArray(selectedGate.tags) && selectedGate.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedGate.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedGate.created_at)}</div>
                  <div>Updated: {formatDate(selectedGate.updated_at)}</div>
                  {selectedGate.created_by && <div>Created By: {selectedGate.created_by}</div>}
                  {selectedGate.updated_by && <div>Updated By: {selectedGate.updated_by}</div>}
                </div>
              </div>
            )}

            {/* Applicability Tab */}
            {detailTab === 'applicability' && (
              <div className="space-y-2">
                {selectedGate.applicabilityRules ? (
                  <>
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Applicability Rules</h4>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                          <span className="text-xs font-medium text-gray-800">Mandatory</span>
                          <Badge status={selectedGate.applicabilityRules.mandatory ? 'active' : 'inactive'} size="sm">
                            {selectedGate.applicabilityRules.mandatory ? 'Yes' : 'No'}
                          </Badge>
                        </div>

                        {/* Applicable Segments */}
                        {Array.isArray(selectedGate.applicabilityRules.segments) && selectedGate.applicabilityRules.segments.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Applicable Segments ({selectedGate.applicabilityRules.segments.length}):</span>
                            <div className="flex flex-wrap gap-0.5 mt-0.5">
                              {selectedGate.applicabilityRules.segments.map((seg, idx) => (
                                <Badge key={idx} variant="neutral" size="sm">{seg}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Applicable Applications */}
                        {Array.isArray(selectedGate.applicabilityRules.applications) && selectedGate.applicabilityRules.applications.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Applicable Applications ({selectedGate.applicabilityRules.applications.length}):</span>
                            <div className="flex flex-wrap gap-0.5 mt-0.5">
                              {selectedGate.applicabilityRules.applications.map((app, idx) => (
                                <Badge key={idx} variant="neutral" size="sm">{app}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Excluded Applications */}
                        {Array.isArray(selectedGate.applicabilityRules.excludedApplications) && selectedGate.applicabilityRules.excludedApplications.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Excluded Applications ({selectedGate.applicabilityRules.excludedApplications.length}):</span>
                            <div className="flex flex-wrap gap-0.5 mt-0.5">
                              {selectedGate.applicabilityRules.excludedApplications.map((app, idx) => (
                                <Badge key={idx} variant="error" size="sm">{app}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Release Types */}
                        {Array.isArray(selectedGate.applicabilityRules.releaseTypes) && selectedGate.applicabilityRules.releaseTypes.length > 0 && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Release Types ({selectedGate.applicabilityRules.releaseTypes.length}):</span>
                            <div className="flex flex-wrap gap-0.5 mt-0.5">
                              {selectedGate.applicabilityRules.releaseTypes.map((type, idx) => (
                                <Badge key={idx} variant="neutral" size="sm">{type}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* No segments/applications message */}
                    {(!Array.isArray(selectedGate.applicabilityRules.segments) || selectedGate.applicabilityRules.segments.length === 0) &&
                     (!Array.isArray(selectedGate.applicabilityRules.applications) || selectedGate.applicabilityRules.applications.length === 0) && (
                      <Card variant="base" padding="sm">
                        <p className="text-xs text-gray-500 italic">
                          This quality gate applies to all segments and applications (no specific restrictions).
                        </p>
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No applicability rules"
                    description="No applicability rules are configured for this quality gate."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Waivers Tab */}
            {detailTab === 'waivers' && (
              <div className="space-y-2">
                {Array.isArray(selectedGate.waiverHistory) && selectedGate.waiverHistory.length > 0 ? (
                  <>
                    {/* Waiver Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Waivers"
                        value={selectedGate.waiverHistory.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Pending"
                        value={pendingWaivers.length}
                        status={pendingWaivers.length > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Approved"
                        value={selectedGate.waiverHistory.filter((w) => w.status === 'approved').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Rejected"
                        value={selectedGate.waiverHistory.filter((w) => w.status === 'rejected').length}
                        status={selectedGate.waiverHistory.filter((w) => w.status === 'rejected').length > 0 ? 'error' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Pending Waivers Actions */}
                    {canApprove && pendingWaivers.length > 0 && (
                      <Card variant="tinted" padding="md">
                        <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">
                          Pending Waivers Requiring Action ({pendingWaivers.length})
                        </h4>
                        <div className="space-y-0.5">
                          {pendingWaivers.map((waiver) => (
                            <div
                              key={waiver.id}
                              className="flex items-center justify-between py-0.5 px-1 border border-deep-forest-teal-200 bg-white rounded-standard"
                            >
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-medium text-gray-800 truncate">{waiver.reason || 'No reason provided'}</span>
                                <div className="flex items-center gap-0.5 mt-[1px]">
                                  <span className="text-[10px] text-gray-400">Release: {waiver.releaseId || '—'}</span>
                                  <span className="text-[10px] text-gray-400">By: {waiver.requestedBy || '—'}</span>
                                  <span className="text-[10px] text-gray-400">{formatDate(waiver.requestedAt)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button
                                  variant="accent"
                                  size="sm"
                                  onClick={() => handleOpenWaiverResolve(waiver)}
                                  ariaLabel="Resolve waiver"
                                >
                                  Resolve
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Waiver History Table */}
                    <DataTable
                      columns={WAIVER_TABLE_COLUMNS}
                      data={selectedGate.waiverHistory}
                      rowKey="id"
                      paginated={selectedGate.waiverHistory.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No waivers"
                      emptyMessage="No waiver history available."
                      ariaLabel="Waiver history table"
                      testId="waiver-history-table"
                    />

                    {/* Waiver Timeline */}
                    {waiverTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Waiver Timeline</h4>
                        <Timeline
                          entries={waiverTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="waiver-timeline"
                        />
                      </Card>
                    )}

                    {/* Request Waiver Button */}
                    {canUpdate && (
                      <Button variant="secondary" size="sm" onClick={handleOpenWaiverRequest} ariaLabel="Request new waiver">
                        + Request Waiver
                      </Button>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No waivers"
                    description="No waiver requests have been submitted for this quality gate."
                    variant="compact"
                    actionLabel={canUpdate ? 'Request Waiver' : undefined}
                    onAction={canUpdate ? handleOpenWaiverRequest : undefined}
                  />
                )}
              </div>
            )}

            {/* Evidence Tab */}
            {detailTab === 'evidence' && (
              <div className="space-y-2">
                {Array.isArray(selectedGate.evidence) && selectedGate.evidence.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Evidence"
                        value={selectedGate.evidence.length}
                        variant="compact"
                        size="sm"
                      />
                      {(() => {
                        const typeCounts = {};
                        for (let i = 0; i < selectedGate.evidence.length; i++) {
                          const type = selectedGate.evidence[i].type || 'Other';
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
                      data={selectedGate.evidence}
                      rowKey="name"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No evidence"
                      emptyMessage="No evidence documents available."
                      ariaLabel="Evidence table"
                      testId="evidence-table"
                    />

                    {/* Evidence type chart */}
                    {selectedGate.evidence.length > 1 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={(() => {
                            const typeCounts = {};
                            for (let i = 0; i < selectedGate.evidence.length; i++) {
                              const type = selectedGate.evidence[i].type || 'Other';
                              typeCounts[type] = (typeCounts[type] || 0) + 1;
                            }
                            return Object.keys(typeCounts).map((key) => ({ label: key, value: typeCounts[key] }));
                          })()}
                          title="Evidence by Type"
                          description="Evidence documents by type"
                          size="sm"
                          showValues={true}
                          showLabels={true}
                          testId="chart-evidence-types"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No evidence"
                    description="No evidence documents have been uploaded for this quality gate."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Linked Releases Tab */}
            {detailTab === 'releases' && (
              <div className="space-y-2">
                {Array.isArray(selectedGate.linkedReleases) && selectedGate.linkedReleases.length > 0 ? (
                  <>
                    <MetricCard
                      label="Linked Releases"
                      value={selectedGate.linkedReleases.length}
                      variant="compact"
                      size="sm"
                    />

                    <div className="space-y-0.5">
                      {selectedGate.linkedReleases.map((releaseId, idx) => (
                        <div
                          key={releaseId || idx}
                          className="flex items-center py-0.5 px-1 border border-gray-100 rounded-standard"
                        >
                          <span className="text-xs font-mono text-deep-forest-teal-700">{releaseId}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No linked releases"
                    description="No releases are linked to this quality gate."
                    variant="compact"
                  />
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Threshold Edit Modal */}
      <Modal
        isOpen={isThresholdOpen}
        onClose={handleCloseThresholdEdit}
        title={`Edit Threshold: ${selectedGate ? selectedGate.name : ''}`}
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Edit quality gate threshold"
        testId="threshold-edit-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseThresholdEdit} disabled={isSavingThreshold}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleThresholdSubmit}
              loading={isSavingThreshold}
              loadingText="Saving..."
              ariaLabel="Save threshold"
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          {selectedGate && (
            <div className="text-xs text-gray-500 mb-1">
              <p>Current threshold: <span className="font-medium text-gray-800">{selectedGate.threshold !== null && selectedGate.threshold !== undefined ? selectedGate.threshold : '—'}</span> ({selectedGate.unit || '—'})</p>
              <p>Current value: <span className="font-medium text-gray-800">{selectedGate.currentValue !== null && selectedGate.currentValue !== undefined ? selectedGate.currentValue : '—'}</span></p>
              <p>Current weight: <span className="font-medium text-gray-800">{selectedGate.weight !== null && selectedGate.weight !== undefined ? selectedGate.weight : '—'}</span></p>
            </div>
          )}
          <FormField
            label={`Threshold (${selectedGate ? selectedGate.unit || '' : ''})`}
            name="threshold"
            type="number"
            value={thresholdForm.threshold}
            onChange={handleThresholdFormChange}
            placeholder="e.g., 80"
            min={0}
            error={thresholdErrors.threshold}
            testId="form-threshold"
          />
          <FormField
            label="Weight (0-1)"
            name="weight"
            type="number"
            value={thresholdForm.weight}
            onChange={handleThresholdFormChange}
            placeholder="e.g., 0.10"
            min={0}
            max={1}
            step="0.01"
            error={thresholdErrors.weight}
            testId="form-weight"
          />
        </div>
      </Modal>

      {/* Waiver Request Modal */}
      <Modal
        isOpen={isWaiverRequestOpen}
        onClose={handleCloseWaiverRequest}
        title={`Request Waiver: ${selectedGate ? selectedGate.name : ''}`}
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Request quality gate waiver"
        testId="waiver-request-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseWaiverRequest} disabled={isRequestingWaiver}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleWaiverRequestSubmit}
              loading={isRequestingWaiver}
              loadingText="Requesting..."
              ariaLabel="Submit waiver request"
            >
              Submit Request
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          {selectedGate && (
            <div className="text-xs text-gray-500 mb-1">
              <p>Gate: <span className="font-medium text-gray-800">{selectedGate.name}</span></p>
              <p>Status: <Badge status={selectedGate.status || 'unknown'} size="sm" /></p>
            </div>
          )}
          <FormField
            label="Release ID (optional)"
            name="releaseId"
            type="text"
            value={waiverForm.releaseId}
            onChange={handleWaiverFormChange}
            placeholder="e.g., rel-001"
            testId="form-waiver-release"
          />
          <FormField
            label="Reason for Waiver"
            name="reason"
            type="textarea"
            value={waiverForm.reason}
            onChange={handleWaiverFormChange}
            placeholder="Explain why a waiver is needed..."
            required={true}
            rows={3}
            error={waiverErrors.reason}
            testId="form-waiver-reason"
          />
          <FormField
            label="Expiration Date (optional)"
            name="expiresAt"
            type="date"
            value={waiverForm.expiresAt}
            onChange={handleWaiverFormChange}
            testId="form-waiver-expires"
          />
        </div>
      </Modal>

      {/* Waiver Resolve Modal */}
      <Modal
        isOpen={isWaiverResolveOpen}
        onClose={handleCloseWaiverResolve}
        title="Resolve Waiver"
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Resolve quality gate waiver"
        testId="waiver-resolve-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseWaiverResolve} disabled={isResolvingWaiver}>
              Cancel
            </Button>
            <Button
              variant={waiverDecision === 'approved' ? 'accent' : 'danger'}
              size="md"
              onClick={handleWaiverResolveSubmit}
              loading={isResolvingWaiver}
              loadingText={waiverDecision === 'approved' ? 'Approving...' : 'Rejecting...'}
              ariaLabel={waiverDecision === 'approved' ? 'Approve waiver' : 'Reject waiver'}
            >
              {waiverDecision === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          {selectedWaiver && (
            <div className="text-xs text-gray-500 mb-1">
              <p>Gate: <span className="font-medium text-gray-800">{selectedGate ? selectedGate.name : '—'}</span></p>
              <p>Release: <span className="font-medium text-gray-800">{selectedWaiver.releaseId || '—'}</span></p>
              <p>Requested By: <span className="font-medium text-gray-800">{selectedWaiver.requestedBy || '—'}</span></p>
              <p>Reason: <span className="font-medium text-gray-800">{selectedWaiver.reason || '—'}</span></p>
            </div>
          )}
          <FormField
            label="Decision"
            name="waiverDecision"
            type="select"
            value={waiverDecision}
            onChange={(e) => setWaiverDecision(e.target.value)}
            options={[
              { value: 'approved', label: 'Approve' },
              { value: 'rejected', label: 'Reject' },
            ]}
            testId="form-waiver-decision"
          />
          <FormField
            label={waiverDecision === 'approved' ? 'Comments (optional)' : 'Reason for rejection'}
            name="waiverComments"
            type="textarea"
            value={waiverComments}
            onChange={(e) => setWaiverComments(e.target.value)}
            placeholder={waiverDecision === 'approved' ? 'Add approval comments...' : 'Provide reason for rejection...'}
            rows={3}
            testId="form-waiver-comments"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Quality Gate"
        message={`Are you sure you want to delete "${gateToDelete ? gateToDelete.name : ''}"? This action cannot be undone. All waiver history and evidence will be permanently removed.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        loadingText="Deleting..."
        testId="quality-gate-delete-dialog"
      />
    </div>
  );
}