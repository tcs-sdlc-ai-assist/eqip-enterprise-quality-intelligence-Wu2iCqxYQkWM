import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Stepper from '../components/common/Stepper.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  getReleases,
  getReleaseDetail,
  getReleasesList,
  getReleasesByStatus,
  getReleaseCountByStatus,
  getAtRiskReleases,
  getReadyReleases,
  getReleasesForApplication,
  getReleasesWithPendingWaivers,
  getReleasesWithPendingApprovals,
  getAverageReadinessScore,
  getAverageQualityScore,
  getTotalOpenDefects,
  getTotalCriticalDefects,
  getReleaseSummary,
  getQualityGateSummary,
  getDistinctValues,
  searchReleases,
} from '../services/releaseService.js';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module ReleaseReadiness
 * Release Readiness Dashboard page for eQIP Quality Intelligence.
 *
 * Displays release-level quality status with scoring, quality gate compliance,
 * defect metrics, test results, pipeline status, approvals, waivers, AI risk
 * summaries, and recommendations. Supports filtering by segment, application,
 * release status, and date range. Drill-down to release detail via modal.
 * Uses releaseService for all data operations.
 */

/**
 * Helper to resolve a quality score to a grade letter.
 * @param {number} score - The quality score (0-100).
 * @returns {string} The letter grade.
 */
function scoreToGrade(score) {
  if (typeof score !== 'number' || isNaN(score)) return '—';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Helper to resolve a grade to a badge variant.
 * @param {string} grade - The letter grade.
 * @returns {string} The badge variant.
 */
function gradeToVariant(grade) {
  if (!grade) return 'neutral';
  const g = grade.toUpperCase();
  if (g === 'A') return 'success';
  if (g === 'B') return 'info';
  if (g === 'C') return 'warning';
  if (g === 'D') return 'error';
  if (g === 'F') return 'error';
  return 'neutral';
}

/**
 * Helper to resolve release status to a badge status string.
 * @param {string} status - The release status.
 * @returns {string} The badge status string.
 */
function resolveReleaseStatus(status) {
  if (!status) return 'unknown';
  const statusMap = {
    'Ready': 'passed',
    'In Progress': 'in_progress',
    'In Review': 'in_review',
    'At Risk': 'at_risk',
    'Draft': 'draft',
  };
  return statusMap[status] || status.toLowerCase().replace(/\s+/g, '_');
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
 * Quality gate keys grouped by phase.
 * @type {Readonly<object>}
 */
const GATE_PHASE_MAP = Object.freeze({
  planning: ['requirements_review', 'design_review', 'test_plan_approval'],
  development: ['code_review', 'static_analysis', 'unit_test_coverage'],
  build: ['build_verification'],
  testing: ['smoke_test', 'functional_test', 'regression_test', 'performance_test', 'security_scan', 'accessibility_audit'],
  acceptance: ['uat_signoff'],
  release: ['release_readiness', 'post_deployment_verification'],
});

/**
 * Resolve the phase stepper state from quality gate statuses.
 * @param {object} qualityGateStatus - The quality gate status object.
 * @returns {Array<object>} Array of stepper step objects.
 */
function resolvePhaseSteps(qualityGateStatus) {
  if (!qualityGateStatus || typeof qualityGateStatus !== 'object') {
    return QUALITY_GATE_PHASES.map((phase) => ({
      label: phase.label,
      state: 'pending',
    }));
  }

  return QUALITY_GATE_PHASES.map((phase) => {
    const gateKeys = GATE_PHASE_MAP[phase.key] || [];
    let allPassed = true;
    let anyFailed = false;
    let anyInReview = false;
    let allNotStarted = true;

    for (let i = 0; i < gateKeys.length; i++) {
      const status = qualityGateStatus[gateKeys[i]];
      if (status !== 'not_started') allNotStarted = false;
      if (status === 'failed') anyFailed = true;
      if (status === 'in_review') anyInReview = true;
      if (status !== 'passed' && status !== 'waived') allPassed = false;
    }

    if (gateKeys.length === 0) {
      return { label: phase.label, state: 'pending' };
    }

    if (anyFailed) return { label: phase.label, state: 'error' };
    if (allPassed) return { label: phase.label, state: 'completed' };
    if (anyInReview) return { label: phase.label, state: 'active' };
    if (allNotStarted) return { label: phase.label, state: 'pending' };
    return { label: phase.label, state: 'active' };
  });
}

/**
 * Release status filter options.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'Ready', label: 'Ready' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'At Risk', label: 'At Risk' },
  { value: 'Draft', label: 'Draft' },
];

/**
 * Columns definition for the releases data table.
 * @type {Array<object>}
 */
const RELEASE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Release',
    sortable: true,
    width: '180px',
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'application',
    label: 'Application',
    sortable: true,
    width: '150px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
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
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveReleaseStatus(value)} size="sm">{value}</Badge>;
    },
  },
  {
    key: 'readinessScore',
    label: 'Readiness',
    sortable: true,
    align: 'center',
    width: '100px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-bold text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'quality_score',
    label: 'Quality',
    sortable: true,
    align: 'center',
    width: '110px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      const grade = scoreToGrade(value);
      return (
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-sm font-bold">{value}</span>
          <Badge variant={gradeToVariant(grade)} size="sm">{grade}</Badge>
        </div>
      );
    },
  },
  {
    key: 'testResults',
    label: 'Pass Rate',
    sortable: false,
    align: 'right',
    width: '90px',
    render: (value) => {
      if (!value || value.passRate === null || value.passRate === undefined) return '—';
      return <span className="text-xs text-gray-700">{value.passRate}%</span>;
    },
  },
  {
    key: 'defects',
    label: 'Defects',
    sortable: false,
    align: 'center',
    width: '90px',
    render: (value) => {
      if (!value) return '—';
      const critical = value.critical || 0;
      const open = value.open || 0;
      return (
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-700">{open} open</span>
          {critical > 0 && (
            <span className="text-[10px] text-red-600 font-medium">{critical} critical</span>
          )}
        </div>
      );
    },
  },
  {
    key: 'version',
    label: 'Version',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
];

/**
 * Quality gate table columns for the detail modal.
 * @type {Array<object>}
 */
const QUALITY_GATE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Quality Gate',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>;
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
];

/**
 * Release Readiness Dashboard page component.
 *
 * @returns {React.ReactElement} The rendered ReleaseReadiness page.
 */
export default function ReleaseReadiness() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();
  const navigate = useNavigate();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [releases, setReleases] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState(null);

  // Detail modal state
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  const userSegment = user ? user.segment : undefined;
  const canExport = canPerform('export', 'releases');

  /**
   * Load releases data from releaseService.
   */
  const loadReleases = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const options = {
        filters: {},
        query: searchValue && searchValue.trim() !== '' ? searchValue : undefined,
        sortKey: 'readinessScore',
        sortDirection: 'desc',
        role,
        userSegment,
        userId,
      };

      if (filterValues.segment) options.filters.segment = filterValues.segment;
      if (filterValues.application) options.filters.application = filterValues.application;
      if (filterValues.status) options.filters.status = filterValues.status;

      if (Object.keys(options.filters).length === 0) {
        delete options.filters;
      }

      const result = getReleases(options);
      setReleases(result.items || []);
      setTotalItems(result.totalItems || 0);

      const summaryData = getReleaseSummary(role, userSegment);
      setSummary(summaryData);
    } catch (err) {
      console.error('[ReleaseReadiness] Error loading releases:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment, userId, filterValues, searchValue]);

  useEffect(() => {
    loadReleases();
  }, [loadReleases, dataVersion]);

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
        key: 'status',
        label: 'Release Status',
        options: STATUS_OPTIONS,
      },
    ];
  }, []);

  /**
   * Chart data for status distribution.
   */
  const statusDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Ready', value: summary.ready || 0 },
      { label: 'In Progress', value: summary.inProgress || 0 },
      { label: 'In Review', value: summary.inReview || 0 },
      { label: 'At Risk', value: summary.atRisk || 0 },
      { label: 'Draft', value: summary.draft || 0 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  /**
   * Chart data for readiness score distribution.
   */
  const readinessDistributionData = useMemo(() => {
    const buckets = { '90+': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 };
    for (let i = 0; i < releases.length; i++) {
      const score = releases[i].readinessScore;
      if (typeof score !== 'number') continue;
      if (score >= 90) buckets['90+'] += 1;
      else if (score >= 80) buckets['80-89'] += 1;
      else if (score >= 70) buckets['70-79'] += 1;
      else if (score >= 60) buckets['60-69'] += 1;
      else buckets['<60'] += 1;
    }
    return Object.keys(buckets).map((key) => ({ label: key, value: buckets[key] }));
  }, [releases]);

  /**
   * Chart data for quality gate summary.
   */
  const qualityGateSummaryData = useMemo(() => {
    if (!summary) return [];
    try {
      const gateSummary = getQualityGateSummary(role, userSegment);
      return [
        { label: 'Passed', value: gateSummary.passed || 0 },
        { label: 'Failed', value: gateSummary.failed || 0 },
        { label: 'In Review', value: gateSummary.in_review || 0 },
        { label: 'Not Started', value: gateSummary.not_started || 0 },
        { label: 'Waived', value: gateSummary.waived || 0 },
      ].filter((d) => d.value > 0);
    } catch (_err) {
      return [];
    }
  }, [summary, role, userSegment]);

  /**
   * Sparkline data for readiness scores across releases.
   */
  const readinessSparklineData = useMemo(() => {
    return releases
      .filter((r) => typeof r.readinessScore === 'number')
      .map((r) => r.readinessScore);
  }, [releases]);

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
   * Handle row click to open release detail.
   */
  const handleRowClick = useCallback((row) => {
    const detail = getReleaseDetail(row.id, role);
    setSelectedRelease(detail || row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, [role]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedRelease(null);
    setDetailTab('overview');
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = releases.map((rel) => ({
      Name: rel.name || '',
      Application: rel.application || '',
      Segment: rel.segment || '',
      Status: rel.status || '',
      'Readiness Score': rel.readinessScore !== null && rel.readinessScore !== undefined ? rel.readinessScore : '',
      'Quality Score': rel.quality_score !== null && rel.quality_score !== undefined ? rel.quality_score : '',
      Version: rel.version || '',
      'Test Pass Rate': rel.testResults && rel.testResults.passRate !== undefined ? rel.testResults.passRate + '%' : '',
      'Automation Coverage': rel.testResults && rel.testResults.automationCoverage !== undefined ? rel.testResults.automationCoverage + '%' : '',
      'Open Defects': rel.defects ? rel.defects.open || 0 : 0,
      'Critical Defects': rel.defects ? rel.defects.critical || 0 : 0,
    }));

    exportToCSV(exportData, 'release-readiness');

    logAction(userId, 'Export Releases CSV', 'releases', 'bulk', `Exported ${exportData.length} releases to CSV`);
  }, [canExport, releases, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = releases.map((rel) => ({
      Name: rel.name || '',
      Application: rel.application || '',
      Segment: rel.segment || '',
      Status: rel.status || '',
      'Readiness Score': rel.readinessScore !== null && rel.readinessScore !== undefined ? rel.readinessScore : '',
      'Quality Score': rel.quality_score !== null && rel.quality_score !== undefined ? rel.quality_score : '',
      Version: rel.version || '',
      'Test Pass Rate': rel.testResults && rel.testResults.passRate !== undefined ? rel.testResults.passRate + '%' : '',
      'Automation Coverage': rel.testResults && rel.testResults.automationCoverage !== undefined ? rel.testResults.automationCoverage + '%' : '',
      'Open Defects': rel.defects ? rel.defects.open || 0 : 0,
      'Critical Defects': rel.defects ? rel.defects.critical || 0 : 0,
    }));

    exportToExcel(exportData, 'release-readiness');

    logAction(userId, 'Export Releases Excel', 'releases', 'bulk', `Exported ${exportData.length} releases to Excel`);
  }, [canExport, releases, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedRelease) return [];

    const waiverCount = Array.isArray(selectedRelease.waivers) ? selectedRelease.waivers.length : 0;
    const approvalCount = Array.isArray(selectedRelease.approvals) ? selectedRelease.approvals.length : 0;
    const evidenceCount = Array.isArray(selectedRelease.evidence) ? selectedRelease.evidence.length : 0;
    const storyCount = Array.isArray(selectedRelease.stories) ? selectedRelease.stories.length : 0;
    const featureCount = Array.isArray(selectedRelease.features) ? selectedRelease.features.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'quality-gates', label: 'Quality Gates' },
      { key: 'test-results', label: 'Test Results' },
      { key: 'defects', label: 'Defects' },
      { key: 'stories', label: 'Stories', badge: storyCount > 0 ? String(storyCount) : undefined },
      { key: 'approvals', label: 'Approvals', badge: approvalCount > 0 ? String(approvalCount) : undefined },
      { key: 'waivers', label: 'Waivers', badge: waiverCount > 0 ? String(waiverCount) : undefined },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'recommendations', label: 'Recommendations' },
    ];
  }, [selectedRelease]);

  /**
   * Quality gate data for the detail modal table.
   */
  const qualityGateTableData = useMemo(() => {
    if (!selectedRelease || !selectedRelease.qualityGateStatus) return [];
    const gates = selectedRelease.qualityGateStatus;
    return Object.keys(gates).map((key) => ({
      id: key,
      name: key,
      status: gates[key],
    }));
  }, [selectedRelease]);

  /**
   * Phase stepper steps for the detail modal.
   */
  const phaseSteps = useMemo(() => {
    if (!selectedRelease || !selectedRelease.qualityGateStatus) {
      return QUALITY_GATE_PHASES.map((p) => ({ label: p.label, state: 'pending' }));
    }
    return resolvePhaseSteps(selectedRelease.qualityGateStatus);
  }, [selectedRelease]);

  /**
   * Active phase index for the stepper.
   */
  const activePhaseIndex = useMemo(() => {
    for (let i = phaseSteps.length - 1; i >= 0; i--) {
      if (phaseSteps[i].state === 'active' || phaseSteps[i].state === 'error') {
        return i;
      }
    }
    for (let i = phaseSteps.length - 1; i >= 0; i--) {
      if (phaseSteps[i].state === 'completed') {
        return Math.min(i + 1, phaseSteps.length - 1);
      }
    }
    return 0;
  }, [phaseSteps]);

  /**
   * Approval timeline entries.
   */
  const approvalEntries = useMemo(() => {
    if (!selectedRelease || !Array.isArray(selectedRelease.approvals)) return [];
    return selectedRelease.approvals.map((approval, idx) => ({
      id: `approval-${idx}`,
      title: `${approval.role || 'Approver'}: ${approval.approver || '—'}`,
      description: approval.comments || (approval.status === 'approved' ? 'Approved' : approval.status === 'pending' ? 'Pending approval' : approval.status === 'rejected' ? 'Rejected' : approval.status || '—'),
      timestamp: approval.date,
      badge: approval.status ? <Badge status={approval.status} size="sm" /> : null,
    }));
  }, [selectedRelease]);

  /**
   * Waiver timeline entries.
   */
  const waiverEntries = useMemo(() => {
    if (!selectedRelease || !Array.isArray(selectedRelease.waivers)) return [];
    return selectedRelease.waivers.map((waiver) => ({
      id: waiver.id || `waiver-${Math.random()}`,
      title: waiver.gateName || waiver.gateKey || 'Quality Gate Waiver',
      description: waiver.reason || '—',
      timestamp: waiver.requestedAt,
      badge: waiver.status ? <Badge status={waiver.status} size="sm" /> : null,
      metadata: [
        { label: 'Requested By', value: waiver.requestedBy || '—' },
        { label: 'Status', value: waiver.status || '—' },
        ...(waiver.approvedBy ? [{ label: 'Approved By', value: waiver.approvedBy }] : []),
      ],
    }));
  }, [selectedRelease]);

  /**
   * Pipeline status display data.
   */
  const pipelineSteps = useMemo(() => {
    if (!selectedRelease || !selectedRelease.pipelineStatus) return [];
    const pipeline = selectedRelease.pipelineStatus;
    const stepKeys = ['build', 'unitTests', 'integrationTests', 'securityScan', 'qualityGate', 'deployment'];
    const stepLabels = {
      build: 'Build',
      unitTests: 'Unit Tests',
      integrationTests: 'Integration Tests',
      securityScan: 'Security Scan',
      qualityGate: 'Quality Gate',
      deployment: 'Deployment',
    };

    return stepKeys.map((key) => {
      const status = pipeline[key] || 'not_started';
      let state = 'pending';
      if (status === 'passed' || status === 'completed') state = 'completed';
      else if (status === 'failed') state = 'error';
      else if (status === 'in_progress') state = 'active';
      else if (status === 'pending') state = 'pending';
      else if (status === 'blocked') state = 'error';
      else if (status === 'not_started') state = 'pending';

      return {
        label: stepLabels[key] || key,
        state,
      };
    });
  }, [selectedRelease]);

  /**
   * Active pipeline step index.
   */
  const activePipelineIndex = useMemo(() => {
    for (let i = pipelineSteps.length - 1; i >= 0; i--) {
      if (pipelineSteps[i].state === 'active' || pipelineSteps[i].state === 'error') {
        return i;
      }
    }
    for (let i = pipelineSteps.length - 1; i >= 0; i--) {
      if (pipelineSteps[i].state === 'completed') {
        return Math.min(i + 1, pipelineSteps.length - 1);
      }
    }
    return 0;
  }, [pipelineSteps]);

  if (isLoading && releases.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading release readiness...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="release-readiness">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Release Readiness</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Release-level quality status, scoring, and recommendations
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
            label="Total Releases"
            value={summary.total}
            variant="compact"
            size="sm"
            testId="metric-total-releases"
          />
          <MetricCard
            label="Ready"
            value={summary.ready}
            status="passed"
            variant="compact"
            size="sm"
            testId="metric-ready"
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
            label="At Risk"
            value={summary.atRisk}
            status={summary.atRisk > 0 ? 'at_risk' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-at-risk"
          />
          <MetricCard
            label="Avg Readiness"
            value={summary.averageReadinessScore}
            variant="compact"
            size="sm"
            sparklineData={readinessSparklineData.length >= 2 ? readinessSparklineData : undefined}
            testId="metric-avg-readiness"
          />
          <MetricCard
            label="Avg Quality"
            value={summary.averageQualityScore}
            grade={scoreToGrade(summary.averageQualityScore)}
            variant="compact"
            size="sm"
            testId="metric-avg-quality"
          />
          <MetricCard
            label="Open Defects"
            value={summary.totalOpenDefects}
            status={summary.totalOpenDefects > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-open-defects"
          />
          <MetricCard
            label="Critical Defects"
            value={summary.totalCriticalDefects}
            status={summary.totalCriticalDefects > 0 ? 'critical' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-critical-defects"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={statusDistributionData}
            title="Release Status"
            description="Releases by current status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#3B82F6', '#F59E0B', '#DC2626', '#6B7280']}
            testId="chart-status-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={readinessDistributionData}
            title="Readiness Score Distribution"
            description="Releases by readiness score range"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#3B82F6', '#F59E0B', '#DC2626', '#6B7280']}
            testId="chart-readiness-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="stacked-bar"
            data={qualityGateSummaryData}
            title="Quality Gate Summary"
            description="Gate status across all releases"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#8B5CF6']}
            testId="chart-quality-gate-summary"
          />
        </Card>
      </div>

      {/* Pending Waivers & Approvals */}
      {summary && (summary.pendingWaivers > 0 || summary.pendingApprovals > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {summary.pendingWaivers > 0 && (
            <Card variant="base" padding="sm">
              <div className="flex items-center gap-1">
                <Badge status="warning" size="md">{summary.pendingWaivers} Pending Waiver{summary.pendingWaivers !== 1 ? 's' : ''}</Badge>
                <span className="text-xs text-gray-500">Quality gate waivers awaiting approval</span>
              </div>
            </Card>
          )}
          {summary.pendingApprovals > 0 && (
            <Card variant="base" padding="sm">
              <div className="flex items-center gap-1">
                <Badge status="pending" size="md">{summary.pendingApprovals} Pending Approval{summary.pendingApprovals !== 1 ? 's' : ''}</Badge>
                <span className="text-xs text-gray-500">Releases awaiting approval</span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <FilterBar
        filters={customFilters}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        showSearch={true}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search releases..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showApplicationFilter={true}
        applicationOptions={applicationOptions}
        showDateRangeFilter={true}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="release-filter-bar"
      />

      {/* Releases Data Table */}
      <DataTable
        columns={RELEASE_TABLE_COLUMNS}
        data={releases}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No releases found"
        emptyMessage="No releases match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Release readiness table"
        testId="releases-table"
      />

      {/* Release Detail Modal */}
      {selectedRelease && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedRelease.name || 'Release Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Release detail: ${selectedRelease.name || selectedRelease.id}`}
          testId="release-detail-modal"
        >
          <div className="space-y-2">
            {/* Release Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedRelease.status && (
                <Badge status={resolveReleaseStatus(selectedRelease.status)} size="md">
                  {selectedRelease.status}
                </Badge>
              )}
              {selectedRelease.quality_score !== null && selectedRelease.quality_score !== undefined && (
                <Badge variant={gradeToVariant(scoreToGrade(selectedRelease.quality_score))} size="md">
                  Score: {selectedRelease.quality_score} (Grade {scoreToGrade(selectedRelease.quality_score)})
                </Badge>
              )}
              {selectedRelease.segment && (
                <Badge variant="neutral" size="md">{selectedRelease.segment}</Badge>
              )}
              {selectedRelease.application && (
                <Badge variant="neutral" size="md">{selectedRelease.application}</Badge>
              )}
              {selectedRelease.version && (
                <Badge variant="neutral" size="md">v{selectedRelease.version}</Badge>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              <MetricCard
                label="Readiness Score"
                value={selectedRelease.readinessScore}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Quality Score"
                value={selectedRelease.quality_score}
                grade={scoreToGrade(selectedRelease.quality_score)}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Test Pass Rate"
                value={selectedRelease.testResults ? selectedRelease.testResults.passRate : '—'}
                unit="%"
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Automation Coverage"
                value={selectedRelease.testResults ? selectedRelease.testResults.automationCoverage : '—'}
                unit="%"
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
              testId="release-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {/* AI Risk Summary */}
                {selectedRelease.aiRiskSummary && (
                  <Card variant="tinted" padding="md">
                    <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">AI Risk Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedRelease.aiRiskSummary}</p>
                  </Card>
                )}

                {/* Phase Progress Stepper */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Quality Gate Phase Progress</h4>
                  <Stepper
                    steps={phaseSteps}
                    activeStep={activePhaseIndex}
                    variant="horizontal"
                    size="md"
                    testId="release-phase-stepper"
                  />
                </Card>

                {/* Pipeline Status */}
                {pipelineSteps.length > 0 && (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">Pipeline Status</h4>
                    <Stepper
                      steps={pipelineSteps}
                      activeStep={activePipelineIndex}
                      variant="horizontal"
                      size="sm"
                      testId="release-pipeline-stepper"
                    />
                    {selectedRelease.pipelineStatus && selectedRelease.pipelineStatus.lastRun && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Last run: {formatDate(selectedRelease.pipelineStatus.lastRun)}
                      </p>
                    )}
                  </Card>
                )}

                {/* Release Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Application:</span>{' '}
                    <span className="text-gray-800">{selectedRelease.application || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{selectedRelease.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Version:</span>{' '}
                    <span className="text-gray-800">{selectedRelease.version || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Planned Date:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedRelease.plannedDate)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Release Date:</span>{' '}
                    <span className="text-gray-800">{formatDate(selectedRelease.releaseDate)}</span>
                  </div>
                </div>

                {/* Code Coverage */}
                {selectedRelease.codeCoverage && (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Code Coverage</h4>
                    <div className="space-y-0.5">
                      <ProgressBar
                        value={selectedRelease.codeCoverage.overall || 0}
                        max={100}
                        size="sm"
                        variant="auto"
                        showValue={true}
                        label="Overall"
                        unit="%"
                      />
                      <ProgressBar
                        value={selectedRelease.codeCoverage.unit || 0}
                        max={100}
                        size="xs"
                        variant="auto"
                        showValue={true}
                        label="Unit"
                        unit="%"
                      />
                      <ProgressBar
                        value={selectedRelease.codeCoverage.integration || 0}
                        max={100}
                        size="xs"
                        variant="auto"
                        showValue={true}
                        label="Integration"
                        unit="%"
                      />
                      <ProgressBar
                        value={selectedRelease.codeCoverage.e2e || 0}
                        max={100}
                        size="xs"
                        variant="auto"
                        showValue={true}
                        label="E2E"
                        unit="%"
                      />
                    </div>
                  </Card>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>
                    Created: {formatDate(selectedRelease.created_at)}
                  </div>
                  <div>
                    Updated: {formatDate(selectedRelease.updated_at)}
                  </div>
                </div>
              </div>
            )}

            {/* Quality Gates Tab */}
            {detailTab === 'quality-gates' && (
              <div className="space-y-2">
                {qualityGateTableData.length > 0 ? (
                  <>
                    {/* Gate Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Gates"
                        value={qualityGateTableData.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Passed"
                        value={qualityGateTableData.filter((g) => g.status === 'passed' || g.status === 'waived').length}
                        status="passed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Failed"
                        value={qualityGateTableData.filter((g) => g.status === 'failed').length}
                        status={qualityGateTableData.filter((g) => g.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="In Review"
                        value={qualityGateTableData.filter((g) => g.status === 'in_review').length}
                        status={qualityGateTableData.filter((g) => g.status === 'in_review').length > 0 ? 'in_review' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Phase Stepper */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">Phase Progress</h4>
                      <Stepper
                        steps={phaseSteps}
                        activeStep={activePhaseIndex}
                        variant="horizontal"
                        size="md"
                        testId="release-detail-phase-stepper"
                      />
                    </Card>

                    {/* Gate Table */}
                    <DataTable
                      columns={QUALITY_GATE_TABLE_COLUMNS}
                      data={qualityGateTableData}
                      rowKey="id"
                      paginated={false}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No quality gates"
                      emptyMessage="No quality gate data available for this release."
                      ariaLabel="Quality gates table"
                      testId="release-quality-gates-table"
                    />
                  </>
                ) : (
                  <EmptyState
                    title="No quality gate data"
                    description="No quality gate status information is available for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Test Results Tab */}
            {detailTab === 'test-results' && (
              <div className="space-y-2">
                {selectedRelease.testResults ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                      <MetricCard
                        label="Pass Rate"
                        value={selectedRelease.testResults.passRate}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Execution Rate"
                        value={selectedRelease.testResults.executionRate}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Automation Coverage"
                        value={selectedRelease.testResults.automationCoverage}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Defect Density"
                        value={selectedRelease.testResults.defectDensity}
                        unit="defects/KLOC"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="DRE"
                        value={selectedRelease.testResults.defectRemovalEfficiency}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {selectedRelease.testCases && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Test Case Summary</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                          <div>
                            <span className="font-medium text-gray-600">Total:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.total || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Automated:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.automated || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Manual:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.manual || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Passed:</span>{' '}
                            <span className="text-living-green-600 font-medium">{selectedRelease.testCases.passed || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Failed:</span>{' '}
                            <span className="text-red-600 font-medium">{selectedRelease.testCases.failed || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Blocked:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.blocked || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Skipped:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.skipped || 0}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Not Run:</span>{' '}
                            <span className="text-gray-800">{selectedRelease.testCases.not_run || 0}</span>
                          </div>
                        </div>

                        {/* Test case distribution chart */}
                        {selectedRelease.testCases.total > 0 && (
                          <div className="mt-1">
                            <ChartPlaceholder
                              type="donut"
                              data={[
                                { label: 'Passed', value: selectedRelease.testCases.passed || 0 },
                                { label: 'Failed', value: selectedRelease.testCases.failed || 0 },
                                { label: 'Blocked', value: selectedRelease.testCases.blocked || 0 },
                                { label: 'Skipped', value: selectedRelease.testCases.skipped || 0 },
                                { label: 'Not Run', value: selectedRelease.testCases.not_run || 0 },
                              ].filter((d) => d.value > 0)}
                              size="sm"
                              showValues={true}
                              showLabels={true}
                              colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6']}
                              testId="chart-test-case-distribution"
                            />
                          </div>
                        )}
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No test results"
                    description="No test result data is available for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Defects Tab */}
            {detailTab === 'defects' && (
              <div className="space-y-2">
                {selectedRelease.defects ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Defects"
                        value={selectedRelease.defects.total}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Critical"
                        value={selectedRelease.defects.critical}
                        status={selectedRelease.defects.critical > 0 ? 'critical' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Open"
                        value={selectedRelease.defects.open}
                        status={selectedRelease.defects.open > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Resolved"
                        value={selectedRelease.defects.resolved}
                        status="completed"
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Defect Severity Distribution</h4>
                      <ChartPlaceholder
                        type="bar"
                        data={[
                          { label: 'Critical', value: selectedRelease.defects.critical || 0 },
                          { label: 'High', value: selectedRelease.defects.high || 0 },
                          { label: 'Medium', value: selectedRelease.defects.medium || 0 },
                          { label: 'Low', value: selectedRelease.defects.low || 0 },
                        ].filter((d) => d.value > 0)}
                        size="sm"
                        showValues={true}
                        showLabels={true}
                        colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                        testId="chart-defect-severity"
                      />
                    </Card>

                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">High:</span>{' '}
                        <span className="text-gray-800">{selectedRelease.defects.high || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Medium:</span>{' '}
                        <span className="text-gray-800">{selectedRelease.defects.medium || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Low:</span>{' '}
                        <span className="text-gray-800">{selectedRelease.defects.low || 0}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Production:</span>{' '}
                        <span className={selectedRelease.defects.production > 0 ? 'text-red-600 font-medium' : 'text-gray-800'}>
                          {selectedRelease.defects.production || 0}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <EmptyState
                    title="No defect data"
                    description="No defect data is available for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Stories Tab */}
            {detailTab === 'stories' && (
              <div className="space-y-2">
                {Array.isArray(selectedRelease.stories) && selectedRelease.stories.length > 0 ? (
                  <>
                    {/* Features */}
                    {Array.isArray(selectedRelease.features) && selectedRelease.features.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Features</h4>
                        <div className="space-y-0.5">
                          {selectedRelease.features.map((feat, idx) => (
                            <div
                              key={feat.id || idx}
                              className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                            >
                              <span className="text-xs font-medium text-gray-800">{feat.name || feat.id}</span>
                              <div className="flex items-center gap-0.5">
                                <Badge status={feat.status || 'unknown'} size="sm" />
                                <span className="text-[10px] text-gray-400">{feat.storiesCount || 0} stories</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Stories */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Stories</h4>
                      <div className="space-y-0.5">
                        {selectedRelease.stories.map((story, idx) => (
                          <div
                            key={story.id || idx}
                            className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                          >
                            <span className="text-xs text-gray-800 truncate">{story.title || story.id}</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Badge status={story.status || 'unknown'} size="sm" />
                              <span className="text-[10px] text-gray-400">{story.points || 0} SP</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </>
                ) : (
                  <EmptyState
                    title="No stories"
                    description="No stories are associated with this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Approvals Tab */}
            {detailTab === 'approvals' && (
              <div>
                {approvalEntries.length > 0 ? (
                  <Timeline
                    entries={approvalEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="release-approvals-timeline"
                  />
                ) : (
                  <EmptyState
                    title="No approvals"
                    description="No approval records are available for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Waivers Tab */}
            {detailTab === 'waivers' && (
              <div>
                {waiverEntries.length > 0 ? (
                  <Timeline
                    entries={waiverEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="release-waivers-timeline"
                  />
                ) : (
                  <EmptyState
                    title="No waivers"
                    description="No waiver requests have been submitted for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Evidence Tab */}
            {detailTab === 'evidence' && (
              <div>
                {Array.isArray(selectedRelease.evidence) && selectedRelease.evidence.length > 0 ? (
                  <div className="space-y-0.5">
                    {selectedRelease.evidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <div className="flex items-center gap-0.5 min-w-0">
                          <span className="text-xs font-medium text-gray-800 truncate">{ev.name || 'Evidence'}</span>
                          <Badge variant="neutral" size="sm">{ev.type || '—'}</Badge>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <span className="text-[10px] text-gray-400">{ev.uploadedBy || '—'}</span>
                          <span className="text-[10px] text-gray-400">{formatDate(ev.uploadedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No evidence"
                    description="No evidence documents have been uploaded for this release."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Recommendations Tab */}
            {detailTab === 'recommendations' && (
              <div className="space-y-2">
                {/* AI Risk Summary */}
                {selectedRelease.aiRiskSummary && (
                  <Card variant="tinted" padding="md">
                    <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">AI Risk Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedRelease.aiRiskSummary}</p>
                  </Card>
                )}

                {/* Recommendations */}
                {Array.isArray(selectedRelease.recommendations) && selectedRelease.recommendations.length > 0 ? (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-[2px]">
                      {selectedRelease.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </Card>
                ) : (
                  <EmptyState
                    title="No recommendations"
                    description="No improvement recommendations are available for this release. This typically indicates the release meets all quality criteria."
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