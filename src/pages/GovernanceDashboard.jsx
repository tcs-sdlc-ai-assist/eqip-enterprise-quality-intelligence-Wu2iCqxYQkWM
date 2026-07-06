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
import {
  getProcedures,
  getProcedureDetail,
  getProceduresByCategory,
  getProceduresByComplianceStatus,
  getProceduresByRiskLevel,
  getProcedureCountByComplianceStatus,
  getProcedureCountByCategory,
  getProcedureCountByRiskLevel,
  getProceduresForSegment,
  getProceduresForApplication,
  getProceduresByOwner,
  getProceduresWithOpenFindings,
  getProceduresWithOverdueReviews,
  getLowestComplianceProcedures,
  getHighestComplianceProcedures,
  getAverageComplianceRate,
  getTotalOpenFindings,
  getFindingCountBySeverity,
  getGovernanceComplianceSummary,
  getDistinctValues,
  searchProcedures,
} from '../services/governanceService.js';
import { exportToCSV, exportToExcel } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module GovernanceDashboard
 * Governance Dashboard page for eQIP Quality Intelligence.
 *
 * Displays governance metrics, compliance status, and drill-downs by segment,
 * application, release, owner, or procedure. Uses governanceService for data.
 * Drill-down links to GovernanceProcedureDetail via modal.
 *
 * Sections:
 * - Summary metrics (total procedures, compliant, at risk, non-compliant, avg compliance, open findings)
 * - Compliance status distribution chart
 * - Category distribution chart
 * - Risk level distribution chart
 * - Finding severity distribution chart
 * - Overdue reviews alert
 * - Procedures data table with filtering and search
 * - Procedure detail modal with overview, findings, evidence, applicability tabs
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
 * Resolve compliance status to a badge status string.
 * @param {string} status - The compliance status.
 * @returns {string} The badge status string.
 */
function resolveComplianceStatus(status) {
  if (!status) return 'unknown';
  return status;
}

/**
 * Category filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const CATEGORY_OPTIONS = [
  { value: 'Change Management', label: 'Change Management' },
  { value: 'Security', label: 'Security' },
  { value: 'Regulatory', label: 'Regulatory' },
  { value: 'Privacy', label: 'Privacy' },
  { value: 'Accessibility', label: 'Accessibility' },
  { value: 'Development', label: 'Development' },
  { value: 'Release Management', label: 'Release Management' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Vendor Management', label: 'Vendor Management' },
  { value: 'Business Continuity', label: 'Business Continuity' },
  { value: 'Performance', label: 'Performance' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Quality Management', label: 'Quality Management' },
];

/**
 * Compliance status filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'non_compliant', label: 'Non-Compliant' },
];

/**
 * Risk level filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

/**
 * Review frequency filter options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const REVIEW_FREQUENCY_OPTIONS = [
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

/**
 * Columns definition for the governance procedures data table.
 * @type {Array<object>}
 */
const PROCEDURE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Procedure',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '150px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
  {
    key: 'complianceStatus',
    label: 'Compliance',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveComplianceStatus(value)} size="sm" />;
    },
  },
  {
    key: 'complianceRate',
    label: 'Rate',
    sortable: true,
    align: 'right',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-bold text-deep-forest-teal-800">{value}%</span>;
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
    key: 'findings',
    label: 'Open Findings',
    sortable: false,
    align: 'center',
    width: '110px',
    render: (value) => {
      if (!Array.isArray(value)) return <span className="text-xs text-gray-400">0</span>;
      const openFindings = value.filter((f) => f.status === 'open' || f.status === 'in_progress').length;
      if (openFindings === 0) return <span className="text-xs text-gray-400">0</span>;
      return <Badge variant="error" size="sm">{openFindings}</Badge>;
    },
  },
  {
    key: 'reviewFrequency',
    label: 'Frequency',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600 capitalize">{value}</span>;
    },
  },
  {
    key: 'lastReviewDate',
    label: 'Last Review',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'nextReviewDate',
    label: 'Next Review',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      const now = new Date().getTime();
      const nextReview = new Date(value).getTime();
      const isOverdue = !isNaN(nextReview) && nextReview < now;
      return (
        <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          {formatDate(value)}
          {isOverdue && ' (Overdue)'}
        </span>
      );
    },
  },
  {
    key: 'owner',
    label: 'Owner',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
    },
  },
];

/**
 * Findings table columns for the detail modal.
 * @type {Array<object>}
 */
const FINDINGS_TABLE_COLUMNS = [
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
    key: 'identifiedAt',
    label: 'Identified',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'resolvedAt',
    label: 'Resolved',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">—</span>;
      return <span className="text-xs text-gray-500">{formatDate(value)}</span>;
    },
  },
  {
    key: 'resolvedBy',
    label: 'Resolved By',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return <span className="text-xs text-gray-400 italic">—</span>;
      return <span className="text-xs text-gray-500">{value}</span>;
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
 * Governance Dashboard page component.
 *
 * @returns {React.ReactElement} The rendered GovernanceDashboard page.
 */
export default function GovernanceDashboard() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [procedures, setProcedures] = useState([]);
  const [summary, setSummary] = useState(null);

  // Detail modal state
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  const userSegment = user ? user.segment : undefined;
  const canExport = canPerform('export', 'governance-procedures');

  /**
   * Load governance procedures data from governanceService.
   */
  const loadProcedures = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const options = {
        filters: {},
        query: searchValue && searchValue.trim() !== '' ? searchValue : undefined,
        sortKey: 'complianceRate',
        sortDirection: 'asc',
        role,
        userSegment,
      };

      if (filterValues.category) options.filters.category = filterValues.category;
      if (filterValues.complianceStatus) options.filters.complianceStatus = filterValues.complianceStatus;
      if (filterValues.riskLevel) options.filters.riskLevel = filterValues.riskLevel;
      if (filterValues.reviewFrequency) options.filters.reviewFrequency = filterValues.reviewFrequency;

      if (Object.keys(options.filters).length === 0) {
        delete options.filters;
      }

      const result = getProcedures(options);
      setProcedures(result.items || []);

      const summaryData = getGovernanceComplianceSummary(role, userSegment);
      setSummary(summaryData);
    } catch (err) {
      console.error('[GovernanceDashboard] Error loading procedures:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, role, userSegment, filterValues, searchValue]);

  useEffect(() => {
    loadProcedures();
  }, [loadProcedures, dataVersion]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'category',
        label: 'Category',
        options: CATEGORY_OPTIONS,
      },
      {
        key: 'complianceStatus',
        label: 'Compliance Status',
        options: COMPLIANCE_STATUS_OPTIONS,
      },
      {
        key: 'riskLevel',
        label: 'Risk Level',
        options: RISK_LEVEL_OPTIONS,
      },
      {
        key: 'reviewFrequency',
        label: 'Review Frequency',
        options: REVIEW_FREQUENCY_OPTIONS,
      },
    ];
  }, []);

  /**
   * Compliance status distribution chart data.
   */
  const complianceDistributionData = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Compliant', value: summary.compliant || 0 },
      { label: 'At Risk', value: summary.atRisk || 0 },
      { label: 'Non-Compliant', value: summary.nonCompliant || 0 },
    ].filter((d) => d.value > 0);
  }, [summary]);

  /**
   * Category distribution chart data.
   */
  const categoryDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < procedures.length; i++) {
      const category = procedures[i].category || 'Unknown';
      counts[category] = (counts[category] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({ label: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value);
  }, [procedures]);

  /**
   * Risk level distribution chart data.
   */
  const riskDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < procedures.length; i++) {
      const riskLevel = procedures[i].riskLevel || 'unknown';
      counts[riskLevel] = (counts[riskLevel] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: counts[key],
      }))
      .sort((a, b) => b.value - a.value);
  }, [procedures]);

  /**
   * Finding severity distribution chart data.
   */
  const findingSeverityData = useMemo(() => {
    try {
      const counts = getFindingCountBySeverity(role, userSegment);
      return Object.keys(counts)
        .map((key) => ({
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value: counts[key],
        }))
        .sort((a, b) => b.value - a.value);
    } catch (_err) {
      return [];
    }
  }, [role, userSegment, dataVersion]);

  /**
   * Compliance rate sparkline data.
   */
  const complianceSparklineData = useMemo(() => {
    return procedures
      .filter((proc) => typeof proc.complianceRate === 'number')
      .map((proc) => proc.complianceRate);
  }, [procedures]);

  /**
   * Compliance rate by category chart data.
   */
  const complianceByCategoryData = useMemo(() => {
    const categoryStats = {};
    for (let i = 0; i < procedures.length; i++) {
      const proc = procedures[i];
      const category = proc.category || 'Unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, count: 0 };
      }
      if (typeof proc.complianceRate === 'number') {
        categoryStats[category].total += proc.complianceRate;
        categoryStats[category].count += 1;
      }
    }
    return Object.keys(categoryStats)
      .map((key) => ({
        label: key,
        value: categoryStats[key].count > 0
          ? Math.round((categoryStats[key].total / categoryStats[key].count) * 100) / 100
          : 0,
      }))
      .sort((a, b) => a.value - b.value);
  }, [procedures]);

  /**
   * Overdue reviews.
   */
  const overdueReviews = useMemo(() => {
    try {
      return getProceduresWithOverdueReviews(role, userSegment);
    } catch (_err) {
      return [];
    }
  }, [role, userSegment, dataVersion]);

  /**
   * Procedures with open findings.
   */
  const proceduresWithOpenFindings = useMemo(() => {
    try {
      return getProceduresWithOpenFindings(role, userSegment);
    } catch (_err) {
      return [];
    }
  }, [role, userSegment, dataVersion]);

  /**
   * Lowest compliance procedures.
   */
  const lowestComplianceProcedures = useMemo(() => {
    try {
      return getLowestComplianceProcedures(5, role, userSegment);
    } catch (_err) {
      return [];
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
   * Handle row click to open procedure detail.
   */
  const handleRowClick = useCallback((row) => {
    const detail = getProcedureDetail(row.id, role);
    setSelectedProcedure(detail || row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, [role]);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedProcedure(null);
    setDetailTab('overview');
  }, []);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = procedures.map((proc) => ({
      ID: proc.id || '',
      Name: proc.name || '',
      Category: proc.category || '',
      'Compliance Status': proc.complianceStatus || '',
      'Compliance Rate (%)': proc.complianceRate !== null && proc.complianceRate !== undefined ? proc.complianceRate : '',
      'Risk Level': proc.riskLevel || '',
      'Review Frequency': proc.reviewFrequency || '',
      'Last Review Date': proc.lastReviewDate || '',
      'Next Review Date': proc.nextReviewDate || '',
      Owner: proc.owner || '',
      Status: proc.status || '',
      'Open Findings': Array.isArray(proc.findings) ? proc.findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length : 0,
      'Total Findings': Array.isArray(proc.findings) ? proc.findings.length : 0,
      'Evidence Count': Array.isArray(proc.evidenceLinks) ? proc.evidenceLinks.length : 0,
    }));

    exportToCSV(exportData, 'governance-procedures');

    logAction(userId, 'Export Governance Procedures CSV', 'governance-procedures', 'bulk', `Exported ${exportData.length} governance procedures to CSV`);
  }, [canExport, procedures, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = procedures.map((proc) => ({
      ID: proc.id || '',
      Name: proc.name || '',
      Category: proc.category || '',
      'Compliance Status': proc.complianceStatus || '',
      'Compliance Rate (%)': proc.complianceRate !== null && proc.complianceRate !== undefined ? proc.complianceRate : '',
      'Risk Level': proc.riskLevel || '',
      'Review Frequency': proc.reviewFrequency || '',
      'Last Review Date': proc.lastReviewDate || '',
      'Next Review Date': proc.nextReviewDate || '',
      Owner: proc.owner || '',
      Status: proc.status || '',
      'Open Findings': Array.isArray(proc.findings) ? proc.findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length : 0,
      'Total Findings': Array.isArray(proc.findings) ? proc.findings.length : 0,
      'Evidence Count': Array.isArray(proc.evidenceLinks) ? proc.evidenceLinks.length : 0,
    }));

    exportToExcel(exportData, 'governance-procedures');

    logAction(userId, 'Export Governance Procedures Excel', 'governance-procedures', 'bulk', `Exported ${exportData.length} governance procedures to Excel`);
  }, [canExport, procedures, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedProcedure) return [];

    const findingCount = Array.isArray(selectedProcedure.findings) ? selectedProcedure.findings.length : 0;
    const evidenceCount = Array.isArray(selectedProcedure.evidenceLinks) ? selectedProcedure.evidenceLinks.length : 0;
    const segmentCount = Array.isArray(selectedProcedure.applicableSegments) ? selectedProcedure.applicableSegments.length : 0;
    const appCount = Array.isArray(selectedProcedure.applicableApplications) ? selectedProcedure.applicableApplications.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'findings', label: 'Findings', badge: findingCount > 0 ? String(findingCount) : undefined },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'applicability', label: 'Applicability', badge: (segmentCount + appCount) > 0 ? String(segmentCount + appCount) : undefined },
      { key: 'metrics', label: 'Metrics' },
    ];
  }, [selectedProcedure]);

  /**
   * Finding timeline entries for the detail modal.
   */
  const findingTimelineEntries = useMemo(() => {
    if (!selectedProcedure || !Array.isArray(selectedProcedure.findings)) return [];
    return selectedProcedure.findings.map((finding, idx) => ({
      id: finding.id || `finding-${idx}`,
      title: finding.description || 'Finding',
      description: finding.status === 'resolved'
        ? `Resolved by ${finding.resolvedBy || '—'} on ${formatDate(finding.resolvedAt)}`
        : `Status: ${finding.status || 'unknown'}`,
      timestamp: finding.identifiedAt,
      badge: finding.status ? <Badge status={finding.status} size="sm" /> : null,
      metadata: [
        { label: 'Severity', value: finding.severity || '—' },
        { label: 'Status', value: finding.status || '—' },
      ],
    }));
  }, [selectedProcedure]);

  /**
   * Open findings count for the selected procedure.
   */
  const selectedOpenFindings = useMemo(() => {
    if (!selectedProcedure || !Array.isArray(selectedProcedure.findings)) return 0;
    return selectedProcedure.findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length;
  }, [selectedProcedure]);

  /**
   * Resolved findings count for the selected procedure.
   */
  const selectedResolvedFindings = useMemo(() => {
    if (!selectedProcedure || !Array.isArray(selectedProcedure.findings)) return 0;
    return selectedProcedure.findings.filter((f) => f.status === 'resolved').length;
  }, [selectedProcedure]);

  /**
   * Finding severity distribution for the selected procedure.
   */
  const selectedFindingSeverityData = useMemo(() => {
    if (!selectedProcedure || !Array.isArray(selectedProcedure.findings)) return [];
    const counts = {};
    for (let i = 0; i < selectedProcedure.findings.length; i++) {
      const severity = selectedProcedure.findings[i].severity || 'unknown';
      counts[severity] = (counts[severity] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: counts[key],
      }));
  }, [selectedProcedure]);

  /**
   * Finding status distribution for the selected procedure.
   */
  const selectedFindingStatusData = useMemo(() => {
    if (!selectedProcedure || !Array.isArray(selectedProcedure.findings)) return [];
    const counts = {};
    for (let i = 0; i < selectedProcedure.findings.length; i++) {
      const status = selectedProcedure.findings[i].status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: counts[key],
      }));
  }, [selectedProcedure]);

  if (isLoading && procedures.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading governance dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="governance-dashboard">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Governance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Governance metrics, compliance status, and procedure drill-downs
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <MetricCard
            label="Total Procedures"
            value={summary.totalProcedures}
            variant="compact"
            size="sm"
            testId="metric-total-procedures"
          />
          <MetricCard
            label="Compliant"
            value={summary.compliant}
            status="compliant"
            variant="compact"
            size="sm"
            testId="metric-compliant"
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
            label="Non-Compliant"
            value={summary.nonCompliant}
            status={summary.nonCompliant > 0 ? 'critical' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-non-compliant"
          />
          <MetricCard
            label="Avg Compliance"
            value={summary.averageComplianceRate}
            unit="%"
            sparklineData={complianceSparklineData.length >= 2 ? complianceSparklineData : undefined}
            variant="compact"
            size="sm"
            testId="metric-avg-compliance"
          />
          <MetricCard
            label="Open Findings"
            value={summary.openFindings}
            status={summary.openFindings > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-open-findings"
          />
          <MetricCard
            label="Overdue Reviews"
            value={overdueReviews.length}
            status={overdueReviews.length > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-overdue-reviews"
          />
        </div>
      )}

      {/* Secondary Metrics */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          <MetricCard
            label="Total Findings"
            value={summary.totalFindings}
            variant="compact"
            size="sm"
            testId="metric-total-findings"
          />
          <MetricCard
            label="Resolved Findings"
            value={summary.resolvedFindings}
            status="completed"
            variant="compact"
            size="sm"
            testId="metric-resolved-findings"
          />
          <MetricCard
            label="With Open Findings"
            value={proceduresWithOpenFindings.length}
            status={proceduresWithOpenFindings.length > 0 ? 'warning' : 'healthy'}
            variant="compact"
            size="sm"
            testId="metric-with-open-findings"
          />
          <MetricCard
            label="Categories"
            value={categoryDistributionData.length}
            variant="compact"
            size="sm"
            testId="metric-categories"
          />
        </div>
      )}

      {/* Overall Compliance Progress */}
      {summary && (
        <Card variant="base" padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Overall Governance Compliance</h3>
          <ProgressBar
            value={summary.averageComplianceRate || 0}
            max={100}
            size="md"
            variant="auto"
            showValue={true}
            label="Average Compliance Rate"
            unit="%"
            thresholds={{ error: 70, warning: 85, success: 100 }}
            testId="overall-compliance-bar"
          />
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={complianceDistributionData}
            title="Compliance Status"
            description="Procedures by compliance status"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#DC2626']}
            testId="chart-compliance-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={riskDistributionData}
            title="Risk Level Distribution"
            description="Procedures by risk level"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#DC2626']}
            testId="chart-risk-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={findingSeverityData}
            title="Finding Severity"
            description="Findings by severity level"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
            testId="chart-finding-severity"
          />
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={complianceByCategoryData}
            title="Compliance Rate by Category"
            description="Average compliance rate per category (%)"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38']}
            testId="chart-compliance-by-category"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={categoryDistributionData.slice(0, 10)}
            title="Procedures by Category"
            description="Number of procedures per category"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20']}
            testId="chart-category-distribution"
          />
        </Card>
      </div>

      {/* Overdue Reviews Alert */}
      {overdueReviews.length > 0 && (
        <Card variant="base" padding="md">
          <div className="flex items-center gap-1 mb-0.5">
            <Badge status="warning" size="md">{overdueReviews.length} Overdue Review{overdueReviews.length !== 1 ? 's' : ''}</Badge>
            <span className="text-xs text-gray-500">Governance procedures with overdue reviews requiring attention</span>
          </div>
          <div className="space-y-0.5">
            {overdueReviews.slice(0, 5).map((proc) => (
              <div
                key={proc.id}
                className="flex items-center justify-between py-0.5 px-1 border border-yellow-200 bg-yellow-50/30 rounded-standard cursor-pointer hover:bg-yellow-50 transition-colors duration-150"
                onClick={() => handleRowClick(proc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRowClick(proc);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View ${proc.name || proc.id}`}
              >
                <div className="flex items-center gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-gray-800 truncate">{proc.name || proc.id}</span>
                  <Badge status={resolveComplianceStatus(proc.complianceStatus)} size="sm" />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="text-[10px] text-red-600 font-medium">
                    Due: {formatDate(proc.nextReviewDate)}
                  </span>
                  <span className="text-[10px] text-gray-400">{proc.complianceRate}%</span>
                </div>
              </div>
            ))}
            {overdueReviews.length > 5 && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                + {overdueReviews.length - 5} more overdue review{overdueReviews.length - 5 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Lowest Compliance Procedures */}
      {lowestComplianceProcedures.length > 0 && (
        <Card variant="base" padding="md">
          <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Lowest Compliance Procedures</h3>
          <div className="space-y-0.5">
            {lowestComplianceProcedures.map((proc) => (
              <div
                key={proc.id}
                className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
              >
                <div className="flex items-center gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-gray-800 truncate">{proc.name || proc.id}</span>
                  <Badge status={resolveComplianceStatus(proc.complianceStatus)} size="sm" />
                  <Badge status={proc.riskLevel || 'unknown'} size="sm" />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="text-xs font-bold text-gray-700">{proc.complianceRate}%</span>
                  <div className="w-[60px]">
                    <ProgressBar
                      value={proc.complianceRate || 0}
                      max={100}
                      size="xs"
                      variant="auto"
                      showValue={false}
                      thresholds={{ error: 70, warning: 85, success: 100 }}
                    />
                  </div>
                </div>
              </div>
            ))}
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
        searchPlaceholder="Search governance procedures..."
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="governance-filter-bar"
      />

      {/* Procedures Data Table */}
      <DataTable
        columns={PROCEDURE_TABLE_COLUMNS}
        data={procedures}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No governance procedures found"
        emptyMessage="No governance procedures match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Governance procedures table"
        testId="governance-procedures-table"
      />

      {/* Procedure Detail Modal */}
      {selectedProcedure && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedProcedure.name || 'Governance Procedure Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Governance procedure detail: ${selectedProcedure.name || selectedProcedure.id}`}
          testId="governance-procedure-detail-modal"
        >
          <div className="space-y-2">
            {/* Procedure Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedProcedure.complianceStatus && (
                <Badge status={resolveComplianceStatus(selectedProcedure.complianceStatus)} size="md" />
              )}
              {selectedProcedure.riskLevel && (
                <Badge status={selectedProcedure.riskLevel} size="md" />
              )}
              {selectedProcedure.category && (
                <Badge variant="neutral" size="md">{selectedProcedure.category}</Badge>
              )}
              {selectedProcedure.status && (
                <Badge status={selectedProcedure.status} size="md" />
              )}
              {selectedProcedure.reviewFrequency && (
                <Badge variant="neutral" size="md">{selectedProcedure.reviewFrequency}</Badge>
              )}
              {selectedProcedure.complianceRate !== null && selectedProcedure.complianceRate !== undefined && (
                <Badge variant="info" size="md">
                  Compliance: {selectedProcedure.complianceRate}%
                </Badge>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
              <MetricCard
                label="Compliance Rate"
                value={selectedProcedure.complianceRate}
                unit="%"
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Open Findings"
                value={selectedOpenFindings}
                status={selectedOpenFindings > 0 ? 'warning' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Resolved Findings"
                value={selectedResolvedFindings}
                status="completed"
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Evidence Items"
                value={Array.isArray(selectedProcedure.evidenceLinks) ? selectedProcedure.evidenceLinks.length : 0}
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
              testId="governance-procedure-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedProcedure.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedProcedure.description}</p>
                  </div>
                )}

                {/* Compliance Progress */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Progress</h4>
                  <ProgressBar
                    value={selectedProcedure.complianceRate || 0}
                    max={100}
                    size="md"
                    variant="auto"
                    showValue={true}
                    label="Compliance Rate"
                    unit="%"
                    thresholds={{ error: 70, warning: 85, success: 100 }}
                    testId="procedure-compliance-bar"
                  />
                </Card>

                {/* Procedure Info */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Procedure Information</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.category || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Compliance Status:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.complianceStatus || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Risk Level:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.riskLevel || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.owner || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Review Frequency:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.reviewFrequency || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Last Review:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedProcedure.lastReviewDate)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Next Review:</span>{' '}
                      <span className="text-gray-800">{formatDate(selectedProcedure.nextReviewDate)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.status || '—'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Version:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.version || 1}</span>
                    </div>
                  </div>
                </Card>

                {/* Tags */}
                {Array.isArray(selectedProcedure.tags) && selectedProcedure.tags.length > 0 && (
                  <div className="flex flex-wrap gap-0.5">
                    {selectedProcedure.tags.map((tag, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>Created: {formatDate(selectedProcedure.created_at)}</div>
                  <div>Updated: {formatDate(selectedProcedure.updated_at)}</div>
                  {selectedProcedure.created_by && <div>Created By: {selectedProcedure.created_by}</div>}
                  {selectedProcedure.updated_by && <div>Updated By: {selectedProcedure.updated_by}</div>}
                </div>
              </div>
            )}

            {/* Findings Tab */}
            {detailTab === 'findings' && (
              <div className="space-y-2">
                {Array.isArray(selectedProcedure.findings) && selectedProcedure.findings.length > 0 ? (
                  <>
                    {/* Finding Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <MetricCard
                        label="Total Findings"
                        value={selectedProcedure.findings.length}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Open"
                        value={selectedOpenFindings}
                        status={selectedOpenFindings > 0 ? 'warning' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Resolved"
                        value={selectedResolvedFindings}
                        status="completed"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="In Progress"
                        value={selectedProcedure.findings.filter((f) => f.status === 'in_progress').length}
                        status={selectedProcedure.findings.filter((f) => f.status === 'in_progress').length > 0 ? 'in_progress' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Finding Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      {selectedFindingSeverityData.length > 0 && (
                        <Card variant="base" padding="md">
                          <ChartPlaceholder
                            type="donut"
                            data={selectedFindingSeverityData}
                            title="Finding Severity"
                            description="Findings by severity level"
                            size="sm"
                            showValues={true}
                            showLabels={true}
                            colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                            testId="chart-procedure-finding-severity"
                          />
                        </Card>
                      )}
                      {selectedFindingStatusData.length > 0 && (
                        <Card variant="base" padding="md">
                          <ChartPlaceholder
                            type="donut"
                            data={selectedFindingStatusData}
                            title="Finding Status"
                            description="Findings by current status"
                            size="sm"
                            showValues={true}
                            showLabels={true}
                            colors={['#F59E0B', '#3B82F6', '#78BE20', '#6B7280']}
                            testId="chart-procedure-finding-status"
                          />
                        </Card>
                      )}
                    </div>

                    {/* Findings Table */}
                    <DataTable
                      columns={FINDINGS_TABLE_COLUMNS}
                      data={selectedProcedure.findings}
                      rowKey="id"
                      paginated={selectedProcedure.findings.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No findings"
                      emptyMessage="No findings recorded."
                      ariaLabel="Findings table"
                      testId="findings-table"
                    />

                    {/* Finding Timeline */}
                    {findingTimelineEntries.length > 0 && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-1">Finding Timeline</h4>
                        <Timeline
                          entries={findingTimelineEntries}
                          variant="base"
                          size="sm"
                          showTimestamps={true}
                          testId="finding-timeline"
                        />
                      </Card>
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No findings"
                    description="No findings have been recorded for this governance procedure."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Evidence Tab */}
            {detailTab === 'evidence' && (
              <div className="space-y-2">
                {Array.isArray(selectedProcedure.evidenceLinks) && selectedProcedure.evidenceLinks.length > 0 ? (
                  <>
                    {/* Evidence Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Total Evidence"
                        value={selectedProcedure.evidenceLinks.length}
                        variant="compact"
                        size="sm"
                      />
                      {(() => {
                        const typeCounts = {};
                        for (let i = 0; i < selectedProcedure.evidenceLinks.length; i++) {
                          const type = selectedProcedure.evidenceLinks[i].type || 'Other';
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

                    {/* Evidence Table */}
                    <DataTable
                      columns={EVIDENCE_TABLE_COLUMNS}
                      data={selectedProcedure.evidenceLinks}
                      rowKey="id"
                      paginated={selectedProcedure.evidenceLinks.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      emptyTitle="No evidence"
                      emptyMessage="No evidence documents available."
                      ariaLabel="Evidence table"
                      testId="evidence-table"
                    />

                    {/* Evidence Type Chart */}
                    {selectedProcedure.evidenceLinks.length > 1 && (
                      <Card variant="base" padding="md">
                        <ChartPlaceholder
                          type="donut"
                          data={(() => {
                            const typeCounts = {};
                            for (let i = 0; i < selectedProcedure.evidenceLinks.length; i++) {
                              const type = selectedProcedure.evidenceLinks[i].type || 'Other';
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
                    description="No evidence documents have been uploaded for this governance procedure."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Applicability Tab */}
            {detailTab === 'applicability' && (
              <div className="space-y-2">
                {/* Applicable Segments */}
                {Array.isArray(selectedProcedure.applicableSegments) && selectedProcedure.applicableSegments.length > 0 ? (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">
                      Applicable Segments ({selectedProcedure.applicableSegments.length})
                    </h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedProcedure.applicableSegments.map((seg, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{seg}</Badge>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Applicable Segments</h4>
                    <p className="text-xs text-gray-500 italic">
                      This procedure applies to all segments (no specific restrictions).
                    </p>
                  </Card>
                )}

                {/* Applicable Applications */}
                {Array.isArray(selectedProcedure.applicableApplications) && selectedProcedure.applicableApplications.length > 0 ? (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">
                      Applicable Applications ({selectedProcedure.applicableApplications.length})
                    </h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedProcedure.applicableApplications.map((app, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{app}</Badge>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <Card variant="base" padding="md">
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Applicable Applications</h4>
                    <p className="text-xs text-gray-500 italic">
                      This procedure applies to all applications (no specific restrictions).
                    </p>
                  </Card>
                )}

                {/* Applicability Summary */}
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Applicability Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Segments:</span>{' '}
                      <span className="text-gray-800">
                        {Array.isArray(selectedProcedure.applicableSegments) && selectedProcedure.applicableSegments.length > 0
                          ? selectedProcedure.applicableSegments.length
                          : 'All'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Applications:</span>{' '}
                      <span className="text-gray-800">
                        {Array.isArray(selectedProcedure.applicableApplications) && selectedProcedure.applicableApplications.length > 0
                          ? selectedProcedure.applicableApplications.length
                          : 'All'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>{' '}
                      <span className="text-gray-800">{selectedProcedure.category || '—'}</span>
                    </div>
                  </div>
                </Card>

                {/* Segment Distribution Chart */}
                {Array.isArray(selectedProcedure.applicableSegments) && selectedProcedure.applicableSegments.length > 1 && (
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="bar"
                      data={selectedProcedure.applicableSegments.map((seg) => ({ label: seg, value: 1 }))}
                      title="Applicable Segments"
                      description="Segments covered by this procedure"
                      size="sm"
                      showValues={false}
                      showLabels={true}
                      colors={['#024E38']}
                      testId="chart-applicable-segments"
                    />
                  </Card>
                )}
              </div>
            )}

            {/* Metrics Tab */}
            {detailTab === 'metrics' && (
              <div className="space-y-2">
                {selectedProcedure.metrics && typeof selectedProcedure.metrics === 'object' ? (
                  <>
                    {/* Metrics Summary */}
                    <Card variant="base" padding="md">
                      <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Procedure Metrics</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                        {Object.keys(selectedProcedure.metrics).map((key) => {
                          const value = selectedProcedure.metrics[key];
                          const label = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())
                            .replace(/_/g, ' ');
                          return (
                            <div key={key}>
                              <span className="font-medium text-gray-600">{label}:</span>{' '}
                              <span className="text-gray-800">
                                {typeof value === 'number'
                                  ? (Number.isInteger(value) ? String(value) : value.toFixed(1))
                                  : String(value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    {/* Compliance Score Metric */}
                    {typeof selectedProcedure.metrics.complianceScore === 'number' && (
                      <Card variant="base" padding="md">
                        <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Score</h4>
                        <ProgressBar
                          value={selectedProcedure.metrics.complianceScore || 0}
                          max={100}
                          size="md"
                          variant="auto"
                          showValue={true}
                          label="Compliance Score"
                          unit="%"
                          thresholds={{ error: 70, warning: 85, success: 100 }}
                        />
                      </Card>
                    )}

                    {/* Metrics Chart */}
                    {(() => {
                      const numericMetrics = Object.keys(selectedProcedure.metrics)
                        .filter((key) => typeof selectedProcedure.metrics[key] === 'number')
                        .map((key) => ({
                          label: key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, (str) => str.toUpperCase())
                            .replace(/_/g, ' '),
                          value: selectedProcedure.metrics[key],
                        }));

                      if (numericMetrics.length >= 2) {
                        return (
                          <Card variant="base" padding="md">
                            <ChartPlaceholder
                              type="bar"
                              data={numericMetrics.slice(0, 8)}
                              title="Procedure Metrics"
                              description="Key metrics for this governance procedure"
                              size="sm"
                              showValues={true}
                              showLabels={true}
                              colors={['#024E38']}
                              testId="chart-procedure-metrics"
                            />
                          </Card>
                        );
                      }
                      return null;
                    })()}
                  </>
                ) : (
                  <EmptyState
                    title="No metrics data"
                    description="No metrics data is available for this governance procedure."
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