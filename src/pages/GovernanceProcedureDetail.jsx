import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useRBAC } from '../contexts/RBACContext.jsx';
import { useData } from '../contexts/DataContext.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import ChartPlaceholder from '../components/common/ChartPlaceholder.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import DataTable from '../components/common/DataTable.jsx';
import Timeline from '../components/common/Timeline.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  getProcedureDetail,
} from '../services/governanceService.js';
import { getAuditLogs } from '../utils/auditLogger.js';
import { exportToCSV } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module GovernanceProcedureDetail
 * Governance Procedure Detail page for eQIP Quality Intelligence.
 *
 * Displays all specified fields for a governance procedure including:
 * - Procedure metadata (name, description, category, owner, status, risk level)
 * - Compliance status and compliance rate with progress bar
 * - Applicable segments and applications
 * - Evidence links with type, upload date, and uploader
 * - Review dates (last review, next review, frequency)
 * - Findings with severity, status, and resolution details
 * - Procedure-specific metrics
 * - Audit trail for the procedure
 * - Tags and version information
 *
 * Uses governanceService for data retrieval and auditLogger for audit trail.
 * Uses Tabs, Card, Badge, MetricCard, ChartPlaceholder, ProgressBar,
 * DataTable, Timeline, Button, EmptyState.
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
 * Check if a review date is overdue.
 * @param {string|Date} nextReviewDate - The next review date.
 * @returns {boolean} True if the review is overdue.
 */
function isReviewOverdue(nextReviewDate) {
  if (!nextReviewDate) return false;
  try {
    const d = nextReviewDate instanceof Date ? nextReviewDate : new Date(nextReviewDate);
    if (isNaN(d.getTime())) return false;
    return d.getTime() < new Date().getTime();
  } catch (_err) {
    return false;
  }
}

/**
 * Findings table columns.
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
 * Evidence table columns.
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
  {
    key: 'url',
    label: 'Location',
    sortable: false,
    render: (value) => {
      if (!value) return '—';
      return (
        <span className="text-xs text-gray-500 truncate" title={value}>
          {value}
        </span>
      );
    },
  },
];

/**
 * Audit log table columns.
 * @type {Array<object>}
 */
const AUDIT_LOG_TABLE_COLUMNS = [
  {
    key: 'action',
    label: 'Action',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'user_id',
    label: 'User',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{value}</span>;
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
  {
    key: 'timestamp',
    label: 'Timestamp',
    sortable: true,
    width: '150px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-500">{formatDateTime(value)}</span>;
    },
  },
];

/**
 * Governance Procedure Detail page component.
 *
 * @returns {React.ReactElement} The rendered GovernanceProcedureDetail page.
 */
export default function GovernanceProcedureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [procedure, setProcedure] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [auditLogs, setAuditLogs] = useState([]);

  const canExport = canPerform('export', 'governance-procedures');

  /**
   * Load procedure data.
   */
  const loadData = useCallback(() => {
    if (!isDataReady || !id) return;

    setIsLoading(true);

    try {
      const detail = getProcedureDetail(id, role);
      setProcedure(detail || null);

      // Load audit logs for this procedure
      try {
        const logs = getAuditLogs({
          entityType: 'governance-procedures',
          entityId: id,
          sortOrder: 'desc',
          limit: 50,
        });
        setAuditLogs(Array.isArray(logs) ? logs : []);
      } catch (_err) {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('[GovernanceProcedureDetail] Error loading data:', err);
      setProcedure(null);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, id, role]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    navigate('/governance');
  }, [navigate]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport || !procedure) return;

    const exportData = {
      ID: procedure.id || '',
      Name: procedure.name || '',
      Category: procedure.category || '',
      'Compliance Status': procedure.complianceStatus || '',
      'Compliance Rate (%)': procedure.complianceRate !== null && procedure.complianceRate !== undefined ? procedure.complianceRate : '',
      'Risk Level': procedure.riskLevel || '',
      'Review Frequency': procedure.reviewFrequency || '',
      'Last Review Date': procedure.lastReviewDate || '',
      'Next Review Date': procedure.nextReviewDate || '',
      Owner: procedure.owner || '',
      Status: procedure.status || '',
      Description: procedure.description || '',
      'Open Findings': Array.isArray(procedure.findings) ? procedure.findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length : 0,
      'Total Findings': Array.isArray(procedure.findings) ? procedure.findings.length : 0,
      'Evidence Count': Array.isArray(procedure.evidenceLinks) ? procedure.evidenceLinks.length : 0,
      'Applicable Segments': Array.isArray(procedure.applicableSegments) ? procedure.applicableSegments.join(', ') : '',
      'Applicable Applications': Array.isArray(procedure.applicableApplications) ? procedure.applicableApplications.join(', ') : '',
    };

    exportToCSV([exportData], `governance-procedure-${procedure.id || 'detail'}`);

    logAction(userId, 'Export Governance Procedure Detail CSV', 'governance-procedures', procedure.id, `Exported governance procedure detail: ${procedure.name || procedure.id}`);
  }, [canExport, procedure, userId]);

  /**
   * Open findings count.
   */
  const openFindingsCount = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings)) return 0;
    return procedure.findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length;
  }, [procedure]);

  /**
   * Resolved findings count.
   */
  const resolvedFindingsCount = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings)) return 0;
    return procedure.findings.filter((f) => f.status === 'resolved').length;
  }, [procedure]);

  /**
   * In-progress findings count.
   */
  const inProgressFindingsCount = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings)) return 0;
    return procedure.findings.filter((f) => f.status === 'in_progress').length;
  }, [procedure]);

  /**
   * Finding severity distribution data for chart.
   */
  const findingSeverityData = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings) || procedure.findings.length === 0) return [];
    const counts = {};
    for (let i = 0; i < procedure.findings.length; i++) {
      const severity = procedure.findings[i].severity || 'unknown';
      counts[severity] = (counts[severity] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        value: counts[key],
      }));
  }, [procedure]);

  /**
   * Finding status distribution data for chart.
   */
  const findingStatusData = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings) || procedure.findings.length === 0) return [];
    const counts = {};
    for (let i = 0; i < procedure.findings.length; i++) {
      const status = procedure.findings[i].status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.keys(counts)
      .map((key) => ({
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: counts[key],
      }));
  }, [procedure]);

  /**
   * Evidence type distribution data for chart.
   */
  const evidenceTypeData = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.evidenceLinks) || procedure.evidenceLinks.length === 0) return [];
    const counts = {};
    for (let i = 0; i < procedure.evidenceLinks.length; i++) {
      const type = procedure.evidenceLinks[i].type || 'Other';
      counts[type] = (counts[type] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [procedure]);

  /**
   * Finding timeline entries.
   */
  const findingTimelineEntries = useMemo(() => {
    if (!procedure || !Array.isArray(procedure.findings)) return [];
    return procedure.findings.map((finding, idx) => ({
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
  }, [procedure]);

  /**
   * Audit log timeline entries.
   */
  const auditLogEntries = useMemo(() => {
    return auditLogs.slice(0, 20).map((log) => ({
      id: log.id || `log-${Math.random()}`,
      title: log.action || 'Action',
      description: log.details || '—',
      timestamp: log.timestamp || log.created_at,
      metadata: [
        { label: 'User', value: log.user_id || '—' },
      ],
    }));
  }, [auditLogs]);

  /**
   * Metrics data for display.
   */
  const metricsEntries = useMemo(() => {
    if (!procedure || !procedure.metrics || typeof procedure.metrics !== 'object') return [];
    return Object.keys(procedure.metrics).map((key) => ({
      key,
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/_/g, ' '),
      value: procedure.metrics[key],
    }));
  }, [procedure]);

  /**
   * Numeric metrics for chart.
   */
  const numericMetricsChartData = useMemo(() => {
    return metricsEntries
      .filter((m) => typeof m.value === 'number')
      .map((m) => ({ label: m.label, value: m.value }));
  }, [metricsEntries]);

  /**
   * Review overdue status.
   */
  const reviewOverdue = useMemo(() => {
    if (!procedure || !procedure.nextReviewDate) return false;
    return isReviewOverdue(procedure.nextReviewDate);
  }, [procedure]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    if (!procedure) return [];

    const findingCount = Array.isArray(procedure.findings) ? procedure.findings.length : 0;
    const evidenceCount = Array.isArray(procedure.evidenceLinks) ? procedure.evidenceLinks.length : 0;
    const segmentCount = Array.isArray(procedure.applicableSegments) ? procedure.applicableSegments.length : 0;
    const appCount = Array.isArray(procedure.applicableApplications) ? procedure.applicableApplications.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'compliance', label: 'Compliance' },
      { key: 'findings', label: 'Findings', badge: findingCount > 0 ? String(findingCount) : undefined },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'applicability', label: 'Applicability', badge: (segmentCount + appCount) > 0 ? String(segmentCount + appCount) : undefined },
      { key: 'metrics', label: 'Metrics' },
      { key: 'audit-trail', label: 'Audit Trail', badge: auditLogs.length > 0 ? String(auditLogs.length) : undefined },
    ];
  }, [procedure, auditLogs]);

  if (isLoading) {
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
          <span className="text-sm text-gray-500 font-medium">Loading governance procedure detail...</span>
        </div>
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="space-y-3" data-testid="governance-procedure-detail-not-found">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to governance dashboard">
          ← Back to Governance Dashboard
        </Button>
        <EmptyState
          title="Governance Procedure Not Found"
          description={`No governance procedure found with ID "${id}". It may have been removed or the ID is incorrect.`}
          actionLabel="Go to Governance Dashboard"
          onAction={handleBack}
          variant="base"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="governance-procedure-detail">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to governance dashboard">
          ← Back to Governance Dashboard
        </Button>
        <div className="flex items-center gap-1">
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              ariaLabel="Export procedure detail to CSV"
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-forest-teal-800">{procedure.name || 'Governance Procedure Detail'}</h1>
        {procedure.description && (
          <p className="text-sm text-gray-500 mt-[2px] max-w-2xl">{procedure.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {procedure.complianceStatus && (
            <Badge status={resolveComplianceStatus(procedure.complianceStatus)} size="md" />
          )}
          {procedure.riskLevel && (
            <Badge status={procedure.riskLevel} size="md" />
          )}
          {procedure.category && (
            <Badge variant="neutral" size="md">{procedure.category}</Badge>
          )}
          {procedure.status && (
            <Badge status={procedure.status} size="md" />
          )}
          {procedure.reviewFrequency && (
            <Badge variant="neutral" size="md">{procedure.reviewFrequency}</Badge>
          )}
          {procedure.complianceRate !== null && procedure.complianceRate !== undefined && (
            <Badge variant="info" size="md">
              Compliance: {procedure.complianceRate}%
            </Badge>
          )}
          {reviewOverdue && (
            <Badge variant="error" size="md">Review Overdue</Badge>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <MetricCard
          label="Compliance Rate"
          value={procedure.complianceRate}
          unit="%"
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Open Findings"
          value={openFindingsCount}
          status={openFindingsCount > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Resolved Findings"
          value={resolvedFindingsCount}
          status="completed"
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Evidence Items"
          value={Array.isArray(procedure.evidenceLinks) ? procedure.evidenceLinks.length : 0}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Segments"
          value={Array.isArray(procedure.applicableSegments) ? procedure.applicableSegments.length : 0}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Applications"
          value={Array.isArray(procedure.applicableApplications) ? procedure.applicableApplications.length : 0}
          variant="compact"
          size="sm"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="underline"
        size="md"
        testId="governance-procedure-detail-tabs"
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {/* Compliance Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Progress</h3>
            <ProgressBar
              value={procedure.complianceRate || 0}
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

          {/* Procedure Information */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Procedure Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Category:</span>{' '}
                <span className="text-gray-800">{procedure.category || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Compliance Status:</span>{' '}
                <span className="text-gray-800">{procedure.complianceStatus || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Risk Level:</span>{' '}
                <span className="text-gray-800">{procedure.riskLevel || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Owner:</span>{' '}
                <span className="text-gray-800">{procedure.owner || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Review Frequency:</span>{' '}
                <span className="text-gray-800">{procedure.reviewFrequency || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Last Review:</span>{' '}
                <span className="text-gray-800">{formatDate(procedure.lastReviewDate)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Next Review:</span>{' '}
                <span className={reviewOverdue ? 'text-red-600 font-medium' : 'text-gray-800'}>
                  {formatDate(procedure.nextReviewDate)}
                  {reviewOverdue && ' (Overdue)'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{' '}
                <span className="text-gray-800">{procedure.status || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Version:</span>{' '}
                <span className="text-gray-800">{procedure.version || 1}</span>
              </div>
            </div>
          </Card>

          {/* Review Schedule */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Review Schedule</h3>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Review Frequency</span>
                <span className="text-xs text-gray-600 capitalize">{procedure.reviewFrequency || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Last Review Date</span>
                <span className="text-xs text-gray-600">{formatDate(procedure.lastReviewDate)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Next Review Date</span>
                <span className={`text-xs ${reviewOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {formatDate(procedure.nextReviewDate)}
                  {reviewOverdue && ' (Overdue)'}
                </span>
              </div>
            </div>
          </Card>

          {/* Summary Charts */}
          {(findingSeverityData.length > 0 || evidenceTypeData.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {findingSeverityData.length > 0 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={findingSeverityData}
                    title="Finding Severity"
                    description="Findings by severity level"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                    testId="chart-overview-finding-severity"
                  />
                </Card>
              )}
              {evidenceTypeData.length > 0 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={evidenceTypeData}
                    title="Evidence by Type"
                    description="Evidence documents by type"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    testId="chart-overview-evidence-types"
                  />
                </Card>
              )}
            </div>
          )}

          {/* Tags */}
          {Array.isArray(procedure.tags) && procedure.tags.length > 0 && (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Tags</h3>
              <div className="flex flex-wrap gap-0.5">
                {procedure.tags.map((tag, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{tag}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
            <div>Created: {formatDate(procedure.created_at)}</div>
            <div>Updated: {formatDate(procedure.updated_at)}</div>
            {procedure.created_by && <div>Created By: {procedure.created_by}</div>}
            {procedure.updated_by && <div>Updated By: {procedure.updated_by}</div>}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-2">
          {/* Compliance Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
            <MetricCard
              label="Compliance Rate"
              value={procedure.complianceRate}
              unit="%"
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Compliance Status"
              value={procedure.complianceStatus ? procedure.complianceStatus.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'}
              status={resolveComplianceStatus(procedure.complianceStatus)}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Risk Level"
              value={procedure.riskLevel ? procedure.riskLevel.charAt(0).toUpperCase() + procedure.riskLevel.slice(1) : '—'}
              status={procedure.riskLevel || 'unknown'}
              variant="compact"
              size="sm"
            />
            <MetricCard
              label="Review Status"
              value={reviewOverdue ? 'Overdue' : 'On Schedule'}
              status={reviewOverdue ? 'warning' : 'healthy'}
              variant="compact"
              size="sm"
            />
          </div>

          {/* Compliance Progress */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Progress</h3>
            <ProgressBar
              value={procedure.complianceRate || 0}
              max={100}
              size="lg"
              variant="auto"
              showValue={true}
              label="Overall Compliance Rate"
              unit="%"
              thresholds={{ error: 70, warning: 85, success: 100 }}
              testId="procedure-compliance-detail-bar"
            />
          </Card>

          {/* Compliance Details */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Details</h3>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Compliance Status</span>
                <Badge status={resolveComplianceStatus(procedure.complianceStatus)} size="sm" />
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Compliance Rate</span>
                <span className="text-xs font-bold text-gray-700">{procedure.complianceRate || 0}%</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Risk Level</span>
                <Badge status={procedure.riskLevel || 'unknown'} size="sm" />
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Open Findings</span>
                <span className={`text-xs font-medium ${openFindingsCount > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>{openFindingsCount}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Resolved Findings</span>
                <span className="text-xs font-medium text-living-green-600">{resolvedFindingsCount}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Total Findings</span>
                <span className="text-xs text-gray-600">{Array.isArray(procedure.findings) ? procedure.findings.length : 0}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Evidence Documents</span>
                <span className="text-xs text-gray-600">{Array.isArray(procedure.evidenceLinks) ? procedure.evidenceLinks.length : 0}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Review Frequency</span>
                <span className="text-xs text-gray-600 capitalize">{procedure.reviewFrequency || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Last Review</span>
                <span className="text-xs text-gray-600">{formatDate(procedure.lastReviewDate)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard">
                <span className="text-xs font-medium text-gray-800">Next Review</span>
                <span className={`text-xs ${reviewOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {formatDate(procedure.nextReviewDate)}
                  {reviewOverdue && ' (Overdue)'}
                </span>
              </div>
            </div>
          </Card>

          {/* Compliance Gauge */}
          <Card variant="base" padding="md">
            <ChartPlaceholder
              type="gauge"
              value={procedure.complianceRate || 0}
              max={100}
              label="Compliance Rate"
              unit="%"
              size="md"
              testId="chart-compliance-gauge"
            />
          </Card>
        </div>
      )}

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div className="space-y-2">
          {Array.isArray(procedure.findings) && procedure.findings.length > 0 ? (
            <>
              {/* Finding Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Total Findings"
                  value={procedure.findings.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Open"
                  value={openFindingsCount}
                  status={openFindingsCount > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="In Progress"
                  value={inProgressFindingsCount}
                  status={inProgressFindingsCount > 0 ? 'in_progress' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Resolved"
                  value={resolvedFindingsCount}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Finding Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {findingSeverityData.length > 0 && (
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="donut"
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
                )}
                {findingStatusData.length > 0 && (
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="donut"
                      data={findingStatusData}
                      title="Finding Status"
                      description="Findings by current status"
                      size="sm"
                      showValues={true}
                      showLabels={true}
                      colors={['#F59E0B', '#3B82F6', '#78BE20', '#6B7280']}
                      testId="chart-finding-status"
                    />
                  </Card>
                )}
              </div>

              {/* Findings Table */}
              <DataTable
                columns={FINDINGS_TABLE_COLUMNS}
                data={procedure.findings}
                rowKey="id"
                paginated={procedure.findings.length > 10}
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
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Finding Timeline</h3>
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
      {activeTab === 'evidence' && (
        <div className="space-y-2">
          {Array.isArray(procedure.evidenceLinks) && procedure.evidenceLinks.length > 0 ? (
            <>
              {/* Evidence Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Evidence"
                  value={procedure.evidenceLinks.length}
                  variant="compact"
                  size="sm"
                />
                {(() => {
                  const typeCounts = {};
                  for (let i = 0; i < procedure.evidenceLinks.length; i++) {
                    const type = procedure.evidenceLinks[i].type || 'Other';
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
                <MetricCard
                  label="Unique Types"
                  value={evidenceTypeData.length}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Evidence Type Chart */}
              {evidenceTypeData.length > 1 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={evidenceTypeData}
                    title="Evidence by Type"
                    description="Evidence documents by type"
                    size="sm"
                    showValues={true}
                    showLabels={true}
                    testId="chart-evidence-types"
                  />
                </Card>
              )}

              {/* Evidence Table */}
              <DataTable
                columns={EVIDENCE_TABLE_COLUMNS}
                data={procedure.evidenceLinks}
                rowKey="id"
                paginated={procedure.evidenceLinks.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                emptyTitle="No evidence"
                emptyMessage="No evidence documents available."
                ariaLabel="Evidence table"
                testId="evidence-table"
              />

              {/* Evidence Detail Cards */}
              <div className="space-y-0.5">
                {procedure.evidenceLinks.map((ev, idx) => (
                  <Card key={ev.id || idx} variant="base" padding="sm">
                    <div className="flex items-start gap-1">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-medium text-gray-900 truncate">{ev.name || 'Evidence'}</span>
                          <Badge variant="neutral" size="sm">{ev.type || '—'}</Badge>
                        </div>
                        {ev.url && (
                          <p className="text-[10px] text-gray-500 mt-[1px] truncate" title={ev.url}>
                            📎 {ev.url}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-[1px]">
                          {ev.uploadedBy && (
                            <span className="text-[10px] text-gray-400">By: {ev.uploadedBy}</span>
                          )}
                          {ev.uploadedAt && (
                            <span className="text-[10px] text-gray-400">{formatDate(ev.uploadedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
      {activeTab === 'applicability' && (
        <div className="space-y-2">
          {/* Applicable Segments */}
          {Array.isArray(procedure.applicableSegments) && procedure.applicableSegments.length > 0 ? (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Applicable Segments ({procedure.applicableSegments.length})
              </h3>
              <div className="flex flex-wrap gap-0.5">
                {procedure.applicableSegments.map((seg, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{seg}</Badge>
                ))}
              </div>
            </Card>
          ) : (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Applicable Segments</h3>
              <p className="text-xs text-gray-500 italic">
                This procedure applies to all segments (no specific restrictions).
              </p>
            </Card>
          )}

          {/* Applicable Applications */}
          {Array.isArray(procedure.applicableApplications) && procedure.applicableApplications.length > 0 ? (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                Applicable Applications ({procedure.applicableApplications.length})
              </h3>
              <div className="flex flex-wrap gap-0.5">
                {procedure.applicableApplications.map((app, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">{app}</Badge>
                ))}
              </div>
            </Card>
          ) : (
            <Card variant="base" padding="md">
              <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Applicable Applications</h3>
              <p className="text-xs text-gray-500 italic">
                This procedure applies to all applications (no specific restrictions).
              </p>
            </Card>
          )}

          {/* Applicability Summary */}
          <Card variant="base" padding="md">
            <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Applicability Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Segments:</span>{' '}
                <span className="text-gray-800">
                  {Array.isArray(procedure.applicableSegments) && procedure.applicableSegments.length > 0
                    ? procedure.applicableSegments.length
                    : 'All'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Applications:</span>{' '}
                <span className="text-gray-800">
                  {Array.isArray(procedure.applicableApplications) && procedure.applicableApplications.length > 0
                    ? procedure.applicableApplications.length
                    : 'All'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Category:</span>{' '}
                <span className="text-gray-800">{procedure.category || '—'}</span>
              </div>
            </div>
          </Card>

          {/* Segment Distribution Chart */}
          {Array.isArray(procedure.applicableSegments) && procedure.applicableSegments.length > 1 && (
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={procedure.applicableSegments.map((seg) => ({ label: seg, value: 1 }))}
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

          {/* Application Distribution Chart */}
          {Array.isArray(procedure.applicableApplications) && procedure.applicableApplications.length > 1 && (
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="horizontal-bar"
                data={procedure.applicableApplications.slice(0, 15).map((app) => ({ label: app, value: 1 }))}
                title="Applicable Applications"
                description="Applications covered by this procedure"
                size="sm"
                showValues={false}
                showLabels={true}
                colors={['#78BE20']}
                testId="chart-applicable-applications"
              />
            </Card>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-2">
          {procedure.metrics && typeof procedure.metrics === 'object' && metricsEntries.length > 0 ? (
            <>
              {/* Metrics Summary */}
              <Card variant="base" padding="md">
                <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Procedure Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
                  {metricsEntries.map((metric) => (
                    <div key={metric.key}>
                      <span className="font-medium text-gray-600">{metric.label}:</span>{' '}
                      <span className="text-gray-800">
                        {typeof metric.value === 'number'
                          ? (Number.isInteger(metric.value) ? String(metric.value) : metric.value.toFixed(1))
                          : String(metric.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Compliance Score Metric */}
              {typeof procedure.metrics.complianceScore === 'number' && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-0.5">Compliance Score</h3>
                  <ProgressBar
                    value={procedure.metrics.complianceScore || 0}
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
              {numericMetricsChartData.length >= 2 && (
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="bar"
                    data={numericMetricsChartData.slice(0, 8)}
                    title="Procedure Metrics"
                    description="Key metrics for this governance procedure"
                    size="md"
                    showValues={true}
                    showLabels={true}
                    colors={['#024E38']}
                    testId="chart-procedure-metrics"
                  />
                </Card>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                {metricsEntries
                  .filter((m) => typeof m.value === 'number')
                  .slice(0, 8)
                  .map((metric) => (
                    <MetricCard
                      key={metric.key}
                      label={metric.label}
                      value={metric.value}
                      variant="compact"
                      size="sm"
                    />
                  ))}
              </div>
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

      {/* Audit Trail Tab */}
      {activeTab === 'audit-trail' && (
        <div className="space-y-2">
          {auditLogs.length > 0 ? (
            <>
              {/* Audit Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Audit Entries"
                  value={auditLogs.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Unique Actions"
                  value={(() => {
                    const actions = new Set();
                    for (let i = 0; i < auditLogs.length; i++) {
                      if (auditLogs[i].action) {
                        actions.add(auditLogs[i].action);
                      }
                    }
                    return actions.size;
                  })()}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Unique Users"
                  value={(() => {
                    const users = new Set();
                    for (let i = 0; i < auditLogs.length; i++) {
                      if (auditLogs[i].user_id) {
                        users.add(auditLogs[i].user_id);
                      }
                    }
                    return users.size;
                  })()}
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Audit Log Table */}
              <DataTable
                columns={AUDIT_LOG_TABLE_COLUMNS}
                data={auditLogs}
                rowKey="id"
                paginated={auditLogs.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                emptyTitle="No audit entries"
                emptyMessage="No audit trail entries found."
                ariaLabel="Audit trail table"
                testId="audit-trail-table"
              />

              {/* Audit Timeline */}
              {auditLogEntries.length > 0 && (
                <Card variant="base" padding="md">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">Audit Timeline</h3>
                  <Timeline
                    entries={auditLogEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="audit-trail-timeline"
                  />
                </Card>
              )}

              {/* Action Distribution Chart */}
              {(() => {
                const actionCounts = {};
                for (let i = 0; i < auditLogs.length; i++) {
                  const action = auditLogs[i].action || 'Unknown';
                  actionCounts[action] = (actionCounts[action] || 0) + 1;
                }
                const chartData = Object.keys(actionCounts)
                  .map((key) => ({ label: key, value: actionCounts[key] }))
                  .sort((a, b) => b.value - a.value);

                if (chartData.length >= 2) {
                  return (
                    <Card variant="base" padding="md">
                      <ChartPlaceholder
                        type="bar"
                        data={chartData.slice(0, 8)}
                        title="Audit Actions"
                        description="Audit entries by action type"
                        size="sm"
                        showValues={true}
                        showLabels={true}
                        colors={['#024E38']}
                        testId="chart-audit-actions"
                      />
                    </Card>
                  );
                }
                return null;
              })()}
            </>
          ) : (
            <EmptyState
              title="No audit trail"
              description="No audit trail entries have been recorded for this governance procedure. Audit entries are created when the procedure is modified."
              variant="compact"
            />
          )}
        </div>
      )}
    </div>
  );
}