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
import Stepper from '../components/common/Stepper.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Timeline from '../components/common/Timeline.jsx';
import {
  getDemands,
  getDemandDetail,
  createDemand,
  updateDemand,
  deleteDemand,
  approveDemand,
  rejectDemand,
  assignDemand,
  transitionDemandWorkflow,
  addDemandComment,
  getDemandsByType,
  getDemandsByStatus,
  getDemandsByPriority,
  getDemandsBySegment,
  getDemandsByWorkflowState,
  getDemandCountByStatus,
  getDemandCountByType,
  getDemandCountByPriority,
  getDemandCountBySegment,
  getDemandCountByWorkflowState,
  getDemandCountByApprovalStatus,
  getDemandsByPriorityOrder,
  getDemandsPendingApproval,
  getUnassignedDemands,
  getDemandSummary,
  getDistinctValues,
  searchDemands,
} from '../services/demandService.js';
import { DEMAND_TYPES } from '../constants.js';

/**
 * @module DemandManagement
 * Demand Management page for eQIP Quality Intelligence.
 *
 * Supports intake, prioritization, approval, assignment, tracking, and closure
 * workflows for all 10 demand types. Displays demand list with DataTable,
 * create/edit forms with FormField, workflow stepper with Stepper, and
 * approval actions. All actions logged via auditLogger through demandService.
 * Uses demandService for all data operations.
 */

/**
 * Workflow states and their display order for the Stepper component.
 * @type {Readonly<Array<object>>}
 */
const WORKFLOW_STEPS = Object.freeze([
  { label: 'Intake', key: 'intake' },
  { label: 'Planning', key: 'planning' },
  { label: 'Development', key: 'development' },
  { label: 'Testing', key: 'testing' },
  { label: 'Review', key: 'review' },
  { label: 'Closed', key: 'closed' },
]);

/**
 * Map workflow state to stepper index.
 * @param {string} state - The workflow state.
 * @returns {number} The stepper index.
 */
function workflowStateToIndex(state) {
  if (!state || typeof state !== 'string') return 0;
  const normalized = state.toLowerCase();
  for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
    if (WORKFLOW_STEPS[i].key === normalized) return i;
  }
  if (normalized === 'in_progress') return 2;
  if (normalized === 'on_hold') return 2;
  return 0;
}

/**
 * Resolve a priority string to a badge variant.
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
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

/**
 * Demand type options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const TYPE_OPTIONS = DEMAND_TYPES.map((t) => ({ value: t, label: t }));

/**
 * Workflow state options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const WORKFLOW_STATE_OPTIONS = [
  { value: 'intake', label: 'Intake' },
  { value: 'planning', label: 'Planning' },
  { value: 'development', label: 'Development' },
  { value: 'testing', label: 'Testing' },
  { value: 'review', label: 'Review' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'closed', label: 'Closed' },
];

/**
 * Columns definition for the demands data table.
 * @type {Array<object>}
 */
const DEMAND_TABLE_COLUMNS = [
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
    key: 'priority',
    label: 'Priority',
    sortable: true,
    width: '90px',
    align: 'center',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolvePriorityStatus(value)} size="sm">{value.toUpperCase()}</Badge>;
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
    key: 'workflowState',
    label: 'Workflow',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'approvalStatus',
    label: 'Approval',
    sortable: true,
    width: '100px',
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
    key: 'application',
    label: 'Application',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'assignedTo',
    label: 'Assigned To',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">Unassigned</span>;
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
  {
    key: 'estimatedEffort',
    label: 'Effort',
    sortable: true,
    align: 'right',
    width: '70px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value} SP</span>;
    },
  },
];

/**
 * Initial form state for creating a new demand.
 * @returns {object} The initial form state.
 */
function getInitialFormState() {
  return {
    title: '',
    type: 'Feature',
    description: '',
    priority: 'p3',
    severity: 'medium',
    segment: '',
    application: '',
    estimatedEffort: '',
    targetRelease: '',
    assignedTo: '',
  };
}

/**
 * Demand Management page component.
 *
 * @returns {React.ReactElement} The rendered DemandManagement page.
 */
export default function DemandManagement() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [demands, setDemands] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState(null);

  // Detail modal state
  const [selectedDemand, setSelectedDemand] = useState(null);
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
  const [demandToDelete, setDemandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Approval modal state
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [approvalComments, setApprovalComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Workflow transition state
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  const userSegment = user ? user.segment : undefined;
  const canCreate = canPerform('create', 'demands');
  const canUpdate = canPerform('update', 'demands');
  const canDelete = canPerform('delete', 'demands');
  const canApprove = canPerform('approve', 'demands');

  /**
   * Load demands data from demandService.
   */
  const loadDemands = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const options = {
        filters: {},
        query: searchValue && searchValue.trim() !== '' ? searchValue : undefined,
        sortKey: 'created_at',
        sortDirection: 'desc',
        role,
        userSegment,
        userId,
      };

      if (filterValues.type) options.filters.type = filterValues.type;
      if (filterValues.status) options.filters.status = filterValues.status;
      if (filterValues.priority) options.filters.priority = filterValues.priority;
      if (filterValues.segment) options.filters.segment = filterValues.segment;
      if (filterValues.workflowState) options.filters.workflowState = filterValues.workflowState;
      if (filterValues.approvalStatus) options.filters.approvalStatus = filterValues.approvalStatus;

      if (Object.keys(options.filters).length === 0) {
        delete options.filters;
      }

      const result = getDemands(options);
      setDemands(result.items || []);
      setTotalItems(result.totalItems || 0);

      const summaryData = getDemandSummary(role, userSegment);
      setSummary(summaryData);
    } catch (err) {
      console.error('[DemandManagement] Error loading demands:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment, userId, filterValues, searchValue]);

  useEffect(() => {
    loadDemands();
  }, [loadDemands, dataVersion]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    try {
      const segments = getDistinctValues('segment', role, userSegment);
      return segments.map((s) => ({ value: s, label: s }));
    } catch (_err) {
      return [];
    }
  }, [role, userSegment]);

  /**
   * Application filter options.
   */
  const applicationOptions = useMemo(() => {
    try {
      const apps = getDistinctValues('application', role, userSegment);
      return apps.map((a) => ({ value: a, label: a }));
    } catch (_err) {
      return [];
    }
  }, [role, userSegment]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'type',
        label: 'Demand Type',
        options: TYPE_OPTIONS,
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
        key: 'workflowState',
        label: 'Workflow State',
        options: WORKFLOW_STATE_OPTIONS,
      },
      {
        key: 'approvalStatus',
        label: 'Approval',
        options: [
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ],
      },
    ];
  }, []);

  /**
   * Chart data for demand type distribution.
   */
  const typeDistributionData = useMemo(() => {
    if (!summary) return [];
    try {
      const counts = getDemandCountByType(role, userSegment);
      return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
    } catch (_err) {
      return [];
    }
  }, [summary, role, userSegment]);

  /**
   * Chart data for demand status distribution.
   */
  const statusDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Draft', value: summary.draft || 0 },
      { label: 'Active', value: summary.active || 0 },
      { label: 'In Progress', value: summary.inProgress || 0 },
      { label: 'Completed', value: summary.completed || 0 },
      { label: 'On Hold', value: summary.onHold || 0 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  /**
   * Chart data for demand priority distribution.
   */
  const priorityDistributionData = useMemo(() => {
    if (!summary) return [];
    try {
      const counts = getDemandCountByPriority(role, userSegment);
      return Object.keys(counts).map((key) => ({ label: key.toUpperCase(), value: counts[key] }));
    } catch (_err) {
      return [];
    }
  }, [summary, role, userSegment]);

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
   * Handle row click to open demand detail.
   */
  const handleRowClick = useCallback((row) => {
    const detail = getDemandDetail(row.id, role);
    setSelectedDemand(detail || row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, [role]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedDemand(null);
    setDetailTab('overview');
    setCommentText('');
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
   * Open edit form for the selected demand.
   */
  const handleOpenEdit = useCallback(() => {
    if (!selectedDemand) return;
    setFormData({
      title: selectedDemand.title || '',
      type: selectedDemand.type || 'Feature',
      description: selectedDemand.description || '',
      priority: selectedDemand.priority || 'p3',
      severity: selectedDemand.severity || 'medium',
      segment: selectedDemand.segment || '',
      application: selectedDemand.application || '',
      estimatedEffort: selectedDemand.estimatedEffort !== null && selectedDemand.estimatedEffort !== undefined ? String(selectedDemand.estimatedEffort) : '',
      targetRelease: selectedDemand.targetRelease || '',
      assignedTo: selectedDemand.assignedTo || '',
    });
    setFormErrors({});
    setIsEditing(true);
    setIsFormOpen(true);
  }, [selectedDemand]);

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
    if (!formData.type) {
      errors.type = 'Demand type is required.';
    }
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required.';
    }
    if (formData.estimatedEffort !== '' && formData.estimatedEffort !== null && formData.estimatedEffort !== undefined) {
      const effort = Number(formData.estimatedEffort);
      if (isNaN(effort) || effort < 0) {
        errors.estimatedEffort = 'Estimated effort must be a non-negative number.';
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
        type: formData.type,
        description: formData.description.trim(),
        priority: formData.priority,
        severity: formData.severity,
        segment: formData.segment || undefined,
        application: formData.application || undefined,
        estimatedEffort: formData.estimatedEffort !== '' ? Number(formData.estimatedEffort) : 0,
        targetRelease: formData.targetRelease || null,
        assignedTo: formData.assignedTo || null,
      };

      if (isEditing && selectedDemand) {
        const updated = updateDemand(selectedDemand.id, data, userId, role);
        if (updated) {
          setSelectedDemand(updated);
          handleCloseForm();
          loadDemands();
        }
      } else {
        const created = createDemand(data, userId, role);
        if (created) {
          handleCloseForm();
          loadDemands();
        }
      }
    } catch (err) {
      console.error('[DemandManagement] Error saving demand:', err);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, isEditing, selectedDemand, userId, role, handleCloseForm, loadDemands]);

  /**
   * Handle delete demand.
   */
  const handleOpenDelete = useCallback(() => {
    if (!selectedDemand) return;
    setDemandToDelete(selectedDemand);
    setIsDeleteOpen(true);
  }, [selectedDemand]);

  const handleCloseDelete = useCallback(() => {
    setIsDeleteOpen(false);
    setDemandToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!demandToDelete) return;

    setIsDeleting(true);

    try {
      const deleted = deleteDemand(demandToDelete.id, userId, role);
      if (deleted) {
        handleCloseDelete();
        handleCloseDetail();
        loadDemands();
      }
    } catch (err) {
      console.error('[DemandManagement] Error deleting demand:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [demandToDelete, userId, role, handleCloseDelete, handleCloseDetail, loadDemands]);

  /**
   * Handle approval action.
   */
  const handleOpenApproval = useCallback((action) => {
    setApprovalAction(action);
    setApprovalComments('');
    setIsApprovalOpen(true);
  }, []);

  const handleCloseApproval = useCallback(() => {
    setIsApprovalOpen(false);
    setApprovalAction('approve');
    setApprovalComments('');
  }, []);

  const handleConfirmApproval = useCallback(() => {
    if (!selectedDemand) return;

    setIsApproving(true);

    try {
      let result;
      if (approvalAction === 'approve') {
        result = approveDemand(selectedDemand.id, approvalComments, userId, role);
      } else {
        result = rejectDemand(selectedDemand.id, approvalComments, userId, role);
      }

      if (result) {
        setSelectedDemand(result);
        handleCloseApproval();
        loadDemands();
      }
    } catch (err) {
      console.error('[DemandManagement] Error processing approval:', err);
    } finally {
      setIsApproving(false);
    }
  }, [selectedDemand, approvalAction, approvalComments, userId, role, handleCloseApproval, loadDemands]);

  /**
   * Handle workflow transition.
   */
  const handleOpenTransition = useCallback(() => {
    setTransitionTarget('');
    setIsTransitionOpen(true);
  }, []);

  const handleCloseTransition = useCallback(() => {
    setIsTransitionOpen(false);
    setTransitionTarget('');
  }, []);

  const handleConfirmTransition = useCallback(() => {
    if (!selectedDemand || !transitionTarget) return;

    setIsTransitioning(true);

    try {
      const result = transitionDemandWorkflow(selectedDemand.id, transitionTarget, userId, role);
      if (result) {
        setSelectedDemand(result);
        handleCloseTransition();
        loadDemands();
      }
    } catch (err) {
      console.error('[DemandManagement] Error transitioning workflow:', err);
    } finally {
      setIsTransitioning(false);
    }
  }, [selectedDemand, transitionTarget, userId, role, handleCloseTransition, loadDemands]);

  /**
   * Handle adding a comment.
   */
  const handleAddComment = useCallback(() => {
    if (!selectedDemand || !commentText || commentText.trim() === '') return;

    setIsAddingComment(true);

    try {
      const result = addDemandComment(selectedDemand.id, commentText.trim(), userId, role);
      if (result) {
        setSelectedDemand(result);
        setCommentText('');
        loadDemands();
      }
    } catch (err) {
      console.error('[DemandManagement] Error adding comment:', err);
    } finally {
      setIsAddingComment(false);
    }
  }, [selectedDemand, commentText, userId, role, loadDemands]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedDemand) return [];
    const commentCount = Array.isArray(selectedDemand.comments) ? selectedDemand.comments.length : 0;
    const attachmentCount = Array.isArray(selectedDemand.attachments) ? selectedDemand.attachments.length : 0;
    const depCount = Array.isArray(selectedDemand.dependencies) ? selectedDemand.dependencies.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'workflow', label: 'Workflow' },
      { key: 'comments', label: 'Comments', badge: commentCount > 0 ? String(commentCount) : undefined },
      { key: 'attachments', label: 'Attachments', badge: attachmentCount > 0 ? String(attachmentCount) : undefined },
      { key: 'dependencies', label: 'Dependencies', badge: depCount > 0 ? String(depCount) : undefined },
    ];
  }, [selectedDemand]);

  /**
   * Comment timeline entries.
   */
  const commentEntries = useMemo(() => {
    if (!selectedDemand || !Array.isArray(selectedDemand.comments)) return [];
    return selectedDemand.comments.map((cmt) => ({
      id: cmt.id,
      title: cmt.userId || 'User',
      description: cmt.text || '',
      timestamp: cmt.createdAt,
    }));
  }, [selectedDemand]);

  /**
   * Workflow stepper steps with state.
   */
  const workflowSteps = useMemo(() => {
    if (!selectedDemand) return [];
    const currentIndex = workflowStateToIndex(selectedDemand.workflowState);
    return WORKFLOW_STEPS.map((step, index) => {
      let state;
      if (selectedDemand.workflowState === 'on_hold') {
        if (index < currentIndex) state = 'completed';
        else if (index === currentIndex) state = 'error';
        else state = 'pending';
      } else if (selectedDemand.workflowState === 'closed') {
        state = 'completed';
      } else {
        if (index < currentIndex) state = 'completed';
        else if (index === currentIndex) state = 'active';
        else state = 'pending';
      }
      return {
        label: step.label,
        state,
      };
    });
  }, [selectedDemand]);

  if (isLoading && demands.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading demands...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="demand-management">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Demand Management</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Intake, prioritize, approve, assign, and track quality demands
          </p>
        </div>
        <div className="flex items-center gap-1">
          {canCreate && (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenCreate}
              ariaLabel="Create new demand"
            >
              + New Demand
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <MetricCard
            label="Total Demands"
            value={summary.total}
            variant="compact"
            size="sm"
            testId="metric-total-demands"
          />
          <MetricCard
            label="In Progress"
            value={summary.inProgress}
            status={summary.inProgress > 0 ? 'in_progress' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-in-progress"
          />
          <MetricCard
            label="Completed"
            value={summary.completed}
            status="completed"
            variant="compact"
            size="sm"
            testId="metric-completed"
          />
          <MetricCard
            label="Pending Approval"
            value={summary.pendingApproval}
            status={summary.pendingApproval > 0 ? 'pending' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-pending-approval"
          />
          <MetricCard
            label="Unassigned"
            value={summary.unassigned}
            status={summary.unassigned > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-unassigned"
          />
          <MetricCard
            label="Est. Effort"
            value={summary.totalEstimatedEffort}
            unit="SP"
            variant="compact"
            size="sm"
            testId="metric-estimated-effort"
          />
          <MetricCard
            label="Completion Rate"
            value={summary.completionRate}
            unit="%"
            variant="compact"
            size="sm"
            testId="metric-completion-rate"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Status Distribution"
            description="Demands by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#6B7280', '#3B82F6', '#F59E0B', '#78BE20', '#DC2626']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={priorityDistributionData}
            title="Priority Distribution"
            description="Demands by priority level"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
            testId="chart-priority-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={typeDistributionData}
            title="Type Distribution"
            description="Demands by type"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-type-distribution"
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
        searchPlaceholder="Search demands..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="demand-filter-bar"
      />

      {/* Demands Data Table */}
      <DataTable
        columns={DEMAND_TABLE_COLUMNS}
        data={demands}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No demands found"
        emptyMessage="No demands match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Demand management table"
        testId="demands-table"
      />

      {/* Demand Detail Modal */}
      {selectedDemand && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedDemand.title || 'Demand Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Demand detail: ${selectedDemand.title || selectedDemand.id}`}
          testId="demand-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canApprove && selectedDemand.approvalStatus === 'pending' && (
                <>
                  <Button variant="accent" size="sm" onClick={() => handleOpenApproval('approve')} ariaLabel="Approve demand">
                    Approve
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleOpenApproval('reject')} ariaLabel="Reject demand">
                    Reject
                  </Button>
                </>
              )}
              {canUpdate && (
                <>
                  <Button variant="secondary" size="sm" onClick={handleOpenEdit} ariaLabel="Edit demand">
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleOpenTransition} ariaLabel="Transition workflow">
                    Transition
                  </Button>
                </>
              )}
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleOpenDelete} ariaLabel="Delete demand">
                  Delete
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Demand Meta */}
            <div className="flex flex-wrap items-center gap-1">
              <Badge status={selectedDemand.status} size="md" />
              <Badge status={resolvePriorityStatus(selectedDemand.priority)} size="md">
                {selectedDemand.priority ? selectedDemand.priority.toUpperCase() : '—'}
              </Badge>
              <Badge status={selectedDemand.severity} size="md" />
              <Badge status={selectedDemand.approvalStatus} size="md" />
              {selectedDemand.type && (
                <Badge variant="neutral" size="md">{selectedDemand.type}</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="demand-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedDemand.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedDemand.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Requested By:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.requestedBy || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Assigned To:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Estimated Effort:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.estimatedEffort || 0} SP</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Actual Effort:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.actualEffort || 0} SP</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Target Release:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.targetRelease || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Workflow State:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.workflowState || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Version:</span>{' '}
                    <span className="text-gray-800">{selectedDemand.version || 1}</span>
                  </div>
                </div>

                {/* Acceptance Criteria */}
                {Array.isArray(selectedDemand.acceptanceCriteria) && selectedDemand.acceptanceCriteria.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Acceptance Criteria</h4>
                    <ul className="list-disc list-inside space-y-[2px]">
                      {selectedDemand.acceptanceCriteria.map((ac, idx) => (
                        <li key={idx} className="text-xs text-gray-700">{ac}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(selectedDemand.tags) && selectedDemand.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedDemand.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>
                    Created: {selectedDemand.created_at ? new Date(selectedDemand.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                  <div>
                    Updated: {selectedDemand.updated_at ? new Date(selectedDemand.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Tab */}
            {detailTab === 'workflow' && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800">Workflow Progress</h4>
                <Stepper
                  steps={workflowSteps}
                  activeStep={workflowStateToIndex(selectedDemand.workflowState)}
                  variant="horizontal"
                  size="md"
                  testId="demand-workflow-stepper"
                />

                {selectedDemand.workflowState === 'on_hold' && (
                  <div className="px-2 py-1 bg-yellow-50 border border-yellow-200 rounded-card text-xs text-yellow-800">
                    This demand is currently on hold.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Current State:</span>{' '}
                    <Badge status={selectedDemand.workflowState} size="sm" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Approval Status:</span>{' '}
                    <Badge status={selectedDemand.approvalStatus} size="sm" />
                  </div>
                </div>

                {canUpdate && (
                  <Button variant="secondary" size="sm" onClick={handleOpenTransition} ariaLabel="Transition workflow state">
                    Transition Workflow
                  </Button>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {detailTab === 'comments' && (
              <div className="space-y-2">
                {commentEntries.length > 0 ? (
                  <Timeline
                    entries={commentEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="demand-comments-timeline"
                  />
                ) : (
                  <EmptyState
                    title="No comments"
                    description="No comments have been added to this demand yet."
                    variant="compact"
                  />
                )}

                {canUpdate && (
                  <div className="flex items-end gap-1">
                    <div className="flex-1">
                      <FormField
                        type="textarea"
                        label="Add Comment"
                        name="comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Type your comment..."
                        rows={2}
                        size="sm"
                      />
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddComment}
                      loading={isAddingComment}
                      disabled={!commentText || commentText.trim() === ''}
                      ariaLabel="Add comment"
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Attachments Tab */}
            {detailTab === 'attachments' && (
              <div>
                {Array.isArray(selectedDemand.attachments) && selectedDemand.attachments.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedDemand.attachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-xs font-medium text-gray-800 truncate">{att.name || 'Attachment'}</span>
                          <span className="text-[10px] text-gray-400">{att.type || ''}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {att.uploadedAt ? new Date(att.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No attachments"
                    description="No attachments have been added to this demand."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Dependencies Tab */}
            {detailTab === 'dependencies' && (
              <div>
                {Array.isArray(selectedDemand.dependencies) && selectedDemand.dependencies.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedDemand.dependencies.map((dep, idx) => (
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
                    description="This demand has no dependencies."
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
        title={isEditing ? 'Edit Demand' : 'Create New Demand'}
        size="lg"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={isEditing ? 'Edit demand form' : 'Create demand form'}
        testId="demand-form-modal"
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
              ariaLabel={isEditing ? 'Save changes' : 'Create demand'}
            >
              {isEditing ? 'Save Changes' : 'Create Demand'}
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
            placeholder="Enter demand title"
            required={true}
            error={formErrors.title}
            testId="form-title"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Demand Type"
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
              label="Estimated Effort (Story Points)"
              name="estimatedEffort"
              type="number"
              value={formData.estimatedEffort}
              onChange={handleFormChange}
              placeholder="e.g., 8"
              min={0}
              error={formErrors.estimatedEffort}
              testId="form-effort"
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleFormChange}
            placeholder="Describe the demand in detail..."
            required={true}
            rows={4}
            error={formErrors.description}
            testId="form-description"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
              label="Application"
              name="application"
              type="select"
              value={formData.application}
              onChange={handleFormChange}
              options={applicationOptions}
              placeholder="Select application"
              testId="form-application"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Target Release"
              name="targetRelease"
              type="text"
              value={formData.targetRelease}
              onChange={handleFormChange}
              placeholder="e.g., rel-001"
              testId="form-target-release"
            />
            <FormField
              label="Assigned To"
              name="assignedTo"
              type="text"
              value={formData.assignedTo}
              onChange={handleFormChange}
              placeholder="e.g., user-005"
              testId="form-assigned-to"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Demand"
        message={`Are you sure you want to delete "${demandToDelete ? demandToDelete.title : ''}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        loadingText="Deleting..."
        testId="demand-delete-dialog"
      />

      {/* Approval Dialog */}
      <Modal
        isOpen={isApprovalOpen}
        onClose={handleCloseApproval}
        title={approvalAction === 'approve' ? 'Approve Demand' : 'Reject Demand'}
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={approvalAction === 'approve' ? 'Approve demand dialog' : 'Reject demand dialog'}
        testId="demand-approval-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseApproval} disabled={isApproving}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === 'approve' ? 'accent' : 'danger'}
              size="md"
              onClick={handleConfirmApproval}
              loading={isApproving}
              loadingText={approvalAction === 'approve' ? 'Approving...' : 'Rejecting...'}
              ariaLabel={approvalAction === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
            >
              {approvalAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            {approvalAction === 'approve'
              ? `Approve demand "${selectedDemand ? selectedDemand.title : ''}"?`
              : `Reject demand "${selectedDemand ? selectedDemand.title : ''}"?`}
          </p>
          <FormField
            label={approvalAction === 'approve' ? 'Comments (optional)' : 'Reason for rejection'}
            name="approvalComments"
            type="textarea"
            value={approvalComments}
            onChange={(e) => setApprovalComments(e.target.value)}
            placeholder={approvalAction === 'approve' ? 'Add approval comments...' : 'Provide reason for rejection...'}
            rows={3}
            testId="approval-comments"
          />
        </div>
      </Modal>

      {/* Workflow Transition Dialog */}
      <Modal
        isOpen={isTransitionOpen}
        onClose={handleCloseTransition}
        title="Transition Workflow"
        size="sm"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel="Transition workflow dialog"
        testId="demand-transition-modal"
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseTransition} disabled={isTransitioning}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmTransition}
              loading={isTransitioning}
              loadingText="Transitioning..."
              disabled={!transitionTarget}
              ariaLabel="Confirm transition"
            >
              Transition
            </Button>
          </>
        }
      >
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Current state: <Badge status={selectedDemand ? selectedDemand.workflowState : 'unknown'} size="sm" />
          </p>
          <FormField
            label="New Workflow State"
            name="transitionTarget"
            type="select"
            value={transitionTarget}
            onChange={(e) => setTransitionTarget(e.target.value)}
            options={WORKFLOW_STATE_OPTIONS}
            placeholder="Select new state"
            required={true}
            testId="transition-target"
          />
        </div>
      </Modal>
    </div>
  );
}