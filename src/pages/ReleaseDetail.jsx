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
import Stepper from '../components/common/Stepper.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  getReleaseDetail,
} from '../services/releaseService.js';
import { exportToCSV } from '../utils/exportUtils.js';
import { logAction } from '../utils/auditLogger.js';

/**
 * @module ReleaseDetail
 * Release Detail page for eQIP Quality Intelligence.
 *
 * Drill-down into a specific release displaying all required sections:
 * stories, features, defects, test cases/suites, test results, code coverage,
 * pipeline/deployment status, approvals, evidence, waivers, AI risk summary,
 * and recommendations.
 * Uses Tabs, Card, DataTable, Badge, Timeline, ChartPlaceholder, Stepper.
 * Data from releaseService.
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
 * Quality gate table columns.
 * @type {Array<object>}
 */
const QUALITY_GATE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Quality Gate',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return (
        <span className="text-xs font-medium text-gray-900">
          {value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      );
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
];

/**
 * Story table columns.
 * @type {Array<object>}
 */
const STORY_TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
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
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'points',
    label: 'Points',
    sortable: true,
    align: 'center',
    width: '70px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value} SP</span>;
    },
  },
];

/**
 * Feature table columns.
 * @type {Array<object>}
 */
const FEATURE_TABLE_COLUMNS = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs font-mono text-gray-500">{value}</span>;
    },
  },
  {
    key: 'name',
    label: 'Feature',
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
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
  {
    key: 'storiesCount',
    label: 'Stories',
    sortable: true,
    align: 'center',
    width: '80px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
];

/**
 * Release Detail page component.
 *
 * @returns {React.ReactElement} The rendered ReleaseDetail page.
 */
export default function ReleaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion } = useData();

  const [release, setRelease] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const canExport = canPerform('export', 'releases');

  /**
   * Load release data.
   */
  const loadRelease = useCallback(() => {
    if (!isDataReady || !id) return;

    setIsLoading(true);

    try {
      const detail = getReleaseDetail(id, role);
      setRelease(detail || null);
    } catch (err) {
      console.error('[ReleaseDetail] Error loading release:', err);
      setRelease(null);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, id, role]);

  useEffect(() => {
    loadRelease();
  }, [loadRelease, dataVersion]);

  /**
   * Handle back navigation.
   */
  const handleBack = useCallback(() => {
    navigate('/releases');
  }, [navigate]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport || !release) return;

    const exportData = {
      Name: release.name || '',
      Application: release.application || '',
      Segment: release.segment || '',
      Status: release.status || '',
      Version: release.version || '',
      'Readiness Score': release.readinessScore !== null && release.readinessScore !== undefined ? release.readinessScore : '',
      'Quality Score': release.quality_score !== null && release.quality_score !== undefined ? release.quality_score : '',
      'Test Pass Rate': release.testResults && release.testResults.passRate !== undefined ? release.testResults.passRate + '%' : '',
      'Automation Coverage': release.testResults && release.testResults.automationCoverage !== undefined ? release.testResults.automationCoverage + '%' : '',
      'Open Defects': release.defects ? release.defects.open || 0 : 0,
      'Critical Defects': release.defects ? release.defects.critical || 0 : 0,
      'Planned Date': formatDate(release.plannedDate),
      'Release Date': formatDate(release.releaseDate),
    };

    exportToCSV([exportData], `release-${release.id || 'detail'}`);

    logAction(userId, 'Export Release Detail CSV', 'releases', release.id, `Exported release detail: ${release.name || release.id}`);
  }, [canExport, release, userId]);

  /**
   * Quality gate data for the table.
   */
  const qualityGateTableData = useMemo(() => {
    if (!release || !release.qualityGateStatus) return [];
    const gates = release.qualityGateStatus;
    return Object.keys(gates).map((key) => ({
      id: key,
      name: key,
      status: gates[key],
    }));
  }, [release]);

  /**
   * Phase stepper steps.
   */
  const phaseSteps = useMemo(() => {
    if (!release || !release.qualityGateStatus) {
      return QUALITY_GATE_PHASES.map((p) => ({ label: p.label, state: 'pending' }));
    }
    return resolvePhaseSteps(release.qualityGateStatus);
  }, [release]);

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
   * Pipeline status stepper steps.
   */
  const pipelineSteps = useMemo(() => {
    if (!release || !release.pipelineStatus) return [];
    const pipeline = release.pipelineStatus;
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
  }, [release]);

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

  /**
   * Approval timeline entries.
   */
  const approvalEntries = useMemo(() => {
    if (!release || !Array.isArray(release.approvals)) return [];
    return release.approvals.map((approval, idx) => ({
      id: `approval-${idx}`,
      title: `${approval.role || 'Approver'}: ${approval.approver || '—'}`,
      description: approval.comments || (approval.status === 'approved' ? 'Approved' : approval.status === 'pending' ? 'Pending approval' : approval.status === 'rejected' ? 'Rejected' : approval.status || '—'),
      timestamp: approval.date,
      badge: approval.status ? <Badge status={approval.status} size="sm" /> : null,
    }));
  }, [release]);

  /**
   * Waiver timeline entries.
   */
  const waiverEntries = useMemo(() => {
    if (!release || !Array.isArray(release.waivers)) return [];
    return release.waivers.map((waiver) => ({
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
  }, [release]);

  /**
   * Test case distribution chart data.
   */
  const testCaseDistributionData = useMemo(() => {
    if (!release || !release.testCases) return [];
    return [
      { label: 'Passed', value: release.testCases.passed || 0 },
      { label: 'Failed', value: release.testCases.failed || 0 },
      { label: 'Blocked', value: release.testCases.blocked || 0 },
      { label: 'Skipped', value: release.testCases.skipped || 0 },
      { label: 'Not Run', value: release.testCases.not_run || 0 },
    ].filter((d) => d.value > 0);
  }, [release]);

  /**
   * Defect severity distribution chart data.
   */
  const defectSeverityData = useMemo(() => {
    if (!release || !release.defects) return [];
    return [
      { label: 'Critical', value: release.defects.critical || 0 },
      { label: 'High', value: release.defects.high || 0 },
      { label: 'Medium', value: release.defects.medium || 0 },
      { label: 'Low', value: release.defects.low || 0 },
    ].filter((d) => d.value > 0);
  }, [release]);

  /**
   * Defect status distribution chart data.
   */
  const defectStatusData = useMemo(() => {
    if (!release || !release.defects) return [];
    return [
      { label: 'Open', value: release.defects.open || 0 },
      { label: 'Resolved', value: release.defects.resolved || 0 },
      { label: 'Production', value: release.defects.production || 0 },
    ].filter((d) => d.value > 0);
  }, [release]);

  /**
   * Quality gate status distribution chart data.
   */
  const gateStatusDistributionData = useMemo(() => {
    if (!qualityGateTableData || qualityGateTableData.length === 0) return [];
    const counts = {};
    for (let i = 0; i < qualityGateTableData.length; i++) {
      const status = qualityGateTableData[i].status || 'unknown';
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: counts[key],
    }));
  }, [qualityGateTableData]);

  /**
   * Tab definitions.
   */
  const tabs = useMemo(() => {
    if (!release) return [];

    const storyCount = Array.isArray(release.stories) ? release.stories.length : 0;
    const featureCount = Array.isArray(release.features) ? release.features.length : 0;
    const waiverCount = Array.isArray(release.waivers) ? release.waivers.length : 0;
    const approvalCount = Array.isArray(release.approvals) ? release.approvals.length : 0;
    const evidenceCount = Array.isArray(release.evidence) ? release.evidence.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'quality-gates', label: 'Quality Gates', badge: String(qualityGateTableData.length) },
      { key: 'stories', label: 'Stories & Features', badge: storyCount > 0 ? String(storyCount) : undefined },
      { key: 'test-results', label: 'Test Results' },
      { key: 'defects', label: 'Defects' },
      { key: 'code-coverage', label: 'Code Coverage' },
      { key: 'pipeline', label: 'Pipeline' },
      { key: 'approvals', label: 'Approvals', badge: approvalCount > 0 ? String(approvalCount) : undefined },
      { key: 'waivers', label: 'Waivers', badge: waiverCount > 0 ? String(waiverCount) : undefined },
      { key: 'evidence', label: 'Evidence', badge: evidenceCount > 0 ? String(evidenceCount) : undefined },
      { key: 'recommendations', label: 'AI & Recommendations' },
    ];
  }, [release, qualityGateTableData]);

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
          <span className="text-sm text-gray-500 font-medium">Loading release detail...</span>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="space-y-3" data-testid="release-detail-not-found">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to releases">
          ← Back to Release Readiness
        </Button>
        <EmptyState
          title="Release Not Found"
          description={`No release found with ID "${id}". It may have been removed or the ID is incorrect.`}
          actionLabel="Go to Release Readiness"
          onAction={handleBack}
          variant="base"
        />
      </div>
    );
  }

  const grade = scoreToGrade(release.quality_score);

  return (
    <div className="space-y-3" data-testid="release-detail">
      {/* Back Button */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={handleBack} ariaLabel="Back to releases">
          ← Back to Release Readiness
        </Button>
        <div className="flex items-center gap-1">
          {canExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              ariaLabel="Export release detail to CSV"
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-deep-forest-teal-800">{release.name || 'Release Detail'}</h1>
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {release.status && (
            <Badge status={resolveReleaseStatus(release.status)} size="md">
              {release.status}
            </Badge>
          )}
          {release.quality_score !== null && release.quality_score !== undefined && (
            <Badge variant={gradeToVariant(grade)} size="md">
              Score: {release.quality_score} (Grade {grade})
            </Badge>
          )}
          {release.segment && <Badge variant="neutral" size="md">{release.segment}</Badge>}
          {release.application && <Badge variant="neutral" size="md">{release.application}</Badge>}
          {release.version && <Badge variant="neutral" size="md">v{release.version}</Badge>}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <MetricCard
          label="Readiness Score"
          value={release.readinessScore}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Quality Score"
          value={release.quality_score}
          grade={grade}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Test Pass Rate"
          value={release.testResults ? release.testResults.passRate : '—'}
          unit="%"
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Automation Coverage"
          value={release.testResults ? release.testResults.automationCoverage : '—'}
          unit="%"
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Open Defects"
          value={release.defects ? release.defects.open : 0}
          status={release.defects && release.defects.open > 0 ? 'warning' : 'healthy'}
          variant="compact"
          size="sm"
        />
        <MetricCard
          label="Critical Defects"
          value={release.defects ? release.defects.critical : 0}
          status={release.defects && release.defects.critical > 0 ? 'critical' : 'healthy'}
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
        testId="release-detail-tabs"
      />

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-2">
          {/* AI Risk Summary */}
          {release.aiRiskSummary && (
            <Card variant="tinted" padding="md">
              <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">AI Risk Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{release.aiRiskSummary}</p>
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
              testId="release-detail-phase-stepper"
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
                testId="release-detail-pipeline-stepper"
              />
              {release.pipelineStatus && release.pipelineStatus.lastRun && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Last run: {formatDate(release.pipelineStatus.lastRun)}
                </p>
              )}
            </Card>
          )}

          {/* Release Info */}
          <Card variant="base" padding="md">
            <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Release Information</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1 text-xs">
              <div>
                <span className="font-medium text-gray-600">Application:</span>{' '}
                <span className="text-gray-800">{release.application || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Segment:</span>{' '}
                <span className="text-gray-800">{release.segment || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Version:</span>{' '}
                <span className="text-gray-800">{release.version || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>{' '}
                <span className="text-gray-800">{release.status || '—'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Planned Date:</span>{' '}
                <span className="text-gray-800">{formatDate(release.plannedDate)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Release Date:</span>{' '}
                <span className="text-gray-800">{formatDate(release.releaseDate)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Created:</span>{' '}
                <span className="text-gray-800">{formatDate(release.created_at)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Updated:</span>{' '}
                <span className="text-gray-800">{formatDate(release.updated_at)}</span>
              </div>
            </div>
          </Card>

          {/* Summary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={testCaseDistributionData}
                title="Test Case Results"
                description="Test case outcome distribution"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6']}
                testId="chart-test-case-dist"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="bar"
                data={defectSeverityData}
                title="Defect Severity"
                description="Defects by severity level"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                testId="chart-defect-severity"
              />
            </Card>
            <Card variant="base" padding="md">
              <ChartPlaceholder
                type="donut"
                data={gateStatusDistributionData}
                title="Quality Gate Status"
                description="Gate status distribution"
                size="sm"
                showValues={true}
                showLabels={true}
                colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#8B5CF6']}
                testId="chart-gate-status-dist"
              />
            </Card>
          </div>

          {/* Test Results Summary */}
          {release.testResults && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
              <MetricCard label="Pass Rate" value={release.testResults.passRate} unit="%" variant="compact" size="sm" />
              <MetricCard label="Execution Rate" value={release.testResults.executionRate} unit="%" variant="compact" size="sm" />
              <MetricCard label="Automation" value={release.testResults.automationCoverage} unit="%" variant="compact" size="sm" />
              <MetricCard label="Defect Density" value={release.testResults.defectDensity} unit="defects/KLOC" variant="compact" size="sm" />
              <MetricCard label="DRE" value={release.testResults.defectRemovalEfficiency} unit="%" variant="compact" size="sm" />
            </div>
          )}

          {/* Recommendations */}
          {Array.isArray(release.recommendations) && release.recommendations.length > 0 && (
            <Card variant="base" padding="md">
              <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Recommendations</h4>
              <ul className="list-disc list-inside space-y-[2px]">
                {release.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-gray-700">{rec}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Quality Gates Tab */}
      {activeTab === 'quality-gates' && (
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
                  testId="release-detail-qg-phase-stepper"
                />
              </Card>

              {/* Gate Status Chart */}
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="stacked-bar"
                  data={gateStatusDistributionData}
                  title="Quality Gate Status Distribution"
                  description="Gates by current status"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#8B5CF6']}
                  testId="chart-qg-status-dist"
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
                testId="release-detail-quality-gates-table"
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

      {/* Stories & Features Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-2">
          {/* Features */}
          {Array.isArray(release.features) && release.features.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-gray-800">Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Total Features"
                  value={release.features.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Completed"
                  value={release.features.filter((f) => f.status === 'completed').length}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="In Progress"
                  value={release.features.filter((f) => f.status === 'in_progress').length}
                  status={release.features.filter((f) => f.status === 'in_progress').length > 0 ? 'in_progress' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Draft"
                  value={release.features.filter((f) => f.status === 'draft').length}
                  variant="compact"
                  size="sm"
                />
              </div>
              <DataTable
                columns={FEATURE_TABLE_COLUMNS}
                data={release.features}
                rowKey="id"
                paginated={release.features.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                emptyTitle="No features"
                emptyMessage="No features found for this release."
                ariaLabel="Release features table"
                testId="release-detail-features-table"
              />
            </>
          )}

          {/* Stories */}
          {Array.isArray(release.stories) && release.stories.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold text-gray-800">Stories</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Total Stories"
                  value={release.stories.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Completed"
                  value={release.stories.filter((s) => s.status === 'completed').length}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="In Progress"
                  value={release.stories.filter((s) => s.status === 'in_progress').length}
                  status={release.stories.filter((s) => s.status === 'in_progress').length > 0 ? 'in_progress' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Total Points"
                  value={release.stories.reduce((sum, s) => sum + (s.points || 0), 0)}
                  unit="SP"
                  variant="compact"
                  size="sm"
                />
              </div>

              {/* Story status chart */}
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={[
                    { label: 'Completed', value: release.stories.filter((s) => s.status === 'completed').length },
                    { label: 'In Progress', value: release.stories.filter((s) => s.status === 'in_progress').length },
                    { label: 'Draft', value: release.stories.filter((s) => s.status === 'draft').length },
                  ].filter((d) => d.value > 0)}
                  title="Story Status"
                  description="Stories by current status"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#F59E0B', '#6B7280']}
                  testId="chart-story-status"
                />
              </Card>

              <DataTable
                columns={STORY_TABLE_COLUMNS}
                data={release.stories}
                rowKey="id"
                paginated={release.stories.length > 10}
                pageSize={10}
                striped={true}
                hoverable={true}
                compact={true}
                searchable={release.stories.length > 5}
                searchPlaceholder="Search stories..."
                emptyTitle="No stories"
                emptyMessage="No stories found for this release."
                ariaLabel="Release stories table"
                testId="release-detail-stories-table"
              />
            </>
          ) : (
            <EmptyState
              title="No stories or features"
              description="No stories or features are associated with this release."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Test Results Tab */}
      {activeTab === 'test-results' && (
        <div className="space-y-2">
          {release.testResults ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
                <MetricCard label="Pass Rate" value={release.testResults.passRate} unit="%" variant="compact" size="sm" />
                <MetricCard label="Execution Rate" value={release.testResults.executionRate} unit="%" variant="compact" size="sm" />
                <MetricCard label="Automation Coverage" value={release.testResults.automationCoverage} unit="%" variant="compact" size="sm" />
                <MetricCard label="Defect Density" value={release.testResults.defectDensity} unit="defects/KLOC" variant="compact" size="sm" />
                <MetricCard label="DRE" value={release.testResults.defectRemovalEfficiency} unit="%" variant="compact" size="sm" />
              </div>

              {release.testCases && (
                <Card variant="base" padding="md">
                  <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Test Case Summary</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                    <div>
                      <span className="font-medium text-gray-600">Total:</span>{' '}
                      <span className="text-gray-800">{release.testCases.total || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Automated:</span>{' '}
                      <span className="text-gray-800">{release.testCases.automated || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Manual:</span>{' '}
                      <span className="text-gray-800">{release.testCases.manual || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Passed:</span>{' '}
                      <span className="text-living-green-600 font-medium">{release.testCases.passed || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Failed:</span>{' '}
                      <span className="text-red-600 font-medium">{release.testCases.failed || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Blocked:</span>{' '}
                      <span className="text-gray-800">{release.testCases.blocked || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Skipped:</span>{' '}
                      <span className="text-gray-800">{release.testCases.skipped || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Not Run:</span>{' '}
                      <span className="text-gray-800">{release.testCases.not_run || 0}</span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Test case distribution chart */}
              {testCaseDistributionData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="donut"
                      data={testCaseDistributionData}
                      title="Test Case Results"
                      description="Test case outcome distribution"
                      size="md"
                      showValues={true}
                      showLabels={true}
                      colors={['#78BE20', '#DC2626', '#F59E0B', '#6B7280', '#3B82F6']}
                      testId="chart-test-results-dist"
                    />
                  </Card>
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="bar"
                      data={[
                        { label: 'Automated', value: release.testCases ? release.testCases.automated || 0 : 0 },
                        { label: 'Manual', value: release.testCases ? release.testCases.manual || 0 : 0 },
                      ]}
                      title="Automation Breakdown"
                      description="Automated vs manual test cases"
                      size="md"
                      showValues={true}
                      showLabels={true}
                      colors={['#78BE20', '#F59E0B']}
                      testId="chart-automation-breakdown"
                    />
                  </Card>
                </div>
              )}

              {/* Progress bars for key metrics */}
              <Card variant="base" padding="md">
                <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Key Test Metrics</h4>
                <div className="space-y-0.5">
                  <ProgressBar
                    value={release.testResults.passRate || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Pass Rate"
                    unit="%"
                    thresholds={{ error: 80, warning: 95, success: 100 }}
                  />
                  <ProgressBar
                    value={release.testResults.executionRate || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Execution Rate"
                    unit="%"
                    thresholds={{ error: 80, warning: 95, success: 100 }}
                  />
                  <ProgressBar
                    value={release.testResults.automationCoverage || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Automation Coverage"
                    unit="%"
                    thresholds={{ error: 50, warning: 80, success: 100 }}
                  />
                  <ProgressBar
                    value={release.testResults.defectRemovalEfficiency || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Defect Removal Efficiency"
                    unit="%"
                    thresholds={{ error: 80, warning: 95, success: 100 }}
                  />
                </div>
              </Card>
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
      {activeTab === 'defects' && (
        <div className="space-y-2">
          {release.defects ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard
                  label="Total Defects"
                  value={release.defects.total}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Critical"
                  value={release.defects.critical}
                  status={release.defects.critical > 0 ? 'critical' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Open"
                  value={release.defects.open}
                  status={release.defects.open > 0 ? 'warning' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Resolved"
                  value={release.defects.resolved}
                  status="completed"
                  variant="compact"
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="bar"
                    data={defectSeverityData}
                    title="Defect Severity Distribution"
                    description="Defects by severity level"
                    size="md"
                    showValues={true}
                    showLabels={true}
                    colors={['#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                    testId="chart-defect-severity-detail"
                  />
                </Card>
                <Card variant="base" padding="md">
                  <ChartPlaceholder
                    type="donut"
                    data={defectStatusData}
                    title="Defect Status"
                    description="Open vs resolved vs production"
                    size="md"
                    showValues={true}
                    showLabels={true}
                    colors={['#F59E0B', '#78BE20', '#DC2626']}
                    testId="chart-defect-status-detail"
                  />
                </Card>
              </div>

              <Card variant="base" padding="md">
                <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Defect Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Total:</span>{' '}
                    <span className="text-gray-800">{release.defects.total || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Critical:</span>{' '}
                    <span className={release.defects.critical > 0 ? 'text-red-600 font-medium' : 'text-gray-800'}>{release.defects.critical || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">High:</span>{' '}
                    <span className="text-gray-800">{release.defects.high || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Medium:</span>{' '}
                    <span className="text-gray-800">{release.defects.medium || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Low:</span>{' '}
                    <span className="text-gray-800">{release.defects.low || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Open:</span>{' '}
                    <span className={release.defects.open > 0 ? 'text-yellow-600 font-medium' : 'text-gray-800'}>{release.defects.open || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Resolved:</span>{' '}
                    <span className="text-living-green-600 font-medium">{release.defects.resolved || 0}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Production:</span>{' '}
                    <span className={release.defects.production > 0 ? 'text-red-600 font-medium' : 'text-gray-800'}>{release.defects.production || 0}</span>
                  </div>
                </div>
              </Card>
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

      {/* Code Coverage Tab */}
      {activeTab === 'code-coverage' && (
        <div className="space-y-2">
          {release.codeCoverage ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                <MetricCard label="Overall" value={release.codeCoverage.overall} unit="%" variant="compact" size="sm" />
                <MetricCard label="Unit" value={release.codeCoverage.unit} unit="%" variant="compact" size="sm" />
                <MetricCard label="Integration" value={release.codeCoverage.integration} unit="%" variant="compact" size="sm" />
                <MetricCard label="E2E" value={release.codeCoverage.e2e} unit="%" variant="compact" size="sm" />
              </div>

              <Card variant="base" padding="md">
                <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Code Coverage Breakdown</h4>
                <div className="space-y-0.5">
                  <ProgressBar
                    value={release.codeCoverage.overall || 0}
                    max={100}
                    size="md"
                    variant="auto"
                    showValue={true}
                    label="Overall Coverage"
                    unit="%"
                    thresholds={{ error: 60, warning: 80, success: 100 }}
                  />
                  <ProgressBar
                    value={release.codeCoverage.unit || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Unit Test Coverage"
                    unit="%"
                    thresholds={{ error: 60, warning: 80, success: 100 }}
                  />
                  <ProgressBar
                    value={release.codeCoverage.integration || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="Integration Test Coverage"
                    unit="%"
                    thresholds={{ error: 50, warning: 70, success: 100 }}
                  />
                  <ProgressBar
                    value={release.codeCoverage.e2e || 0}
                    max={100}
                    size="sm"
                    variant="auto"
                    showValue={true}
                    label="E2E Test Coverage"
                    unit="%"
                    thresholds={{ error: 30, warning: 60, success: 100 }}
                  />
                </div>
              </Card>

              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="bar"
                  data={[
                    { label: 'Overall', value: release.codeCoverage.overall || 0 },
                    { label: 'Unit', value: release.codeCoverage.unit || 0 },
                    { label: 'Integration', value: release.codeCoverage.integration || 0 },
                    { label: 'E2E', value: release.codeCoverage.e2e || 0 },
                  ]}
                  title="Coverage by Type"
                  description="Code coverage across test types"
                  size="md"
                  showValues={true}
                  showLabels={true}
                  colors={['#024E38', '#78BE20', '#3B82F6', '#F59E0B']}
                  testId="chart-code-coverage-types"
                />
              </Card>
            </>
          ) : (
            <EmptyState
              title="No code coverage data"
              description="No code coverage data is available for this release."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-2">
          {release.pipelineStatus ? (
            <>
              {/* Pipeline Stepper */}
              <Card variant="base" padding="md">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Pipeline Progress</h4>
                <Stepper
                  steps={pipelineSteps}
                  activeStep={activePipelineIndex}
                  variant="horizontal"
                  size="md"
                  testId="release-detail-pipeline-tab-stepper"
                />
                {release.pipelineStatus.lastRun && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Last run: {formatDate(release.pipelineStatus.lastRun)}
                  </p>
                )}
              </Card>

              {/* Pipeline Status Details */}
              <Card variant="base" padding="md">
                <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Pipeline Stage Status</h4>
                <div className="space-y-0.5">
                  {['build', 'unitTests', 'integrationTests', 'securityScan', 'qualityGate', 'deployment'].map((key) => {
                    const status = release.pipelineStatus[key] || 'not_started';
                    const labels = {
                      build: 'Build',
                      unitTests: 'Unit Tests',
                      integrationTests: 'Integration Tests',
                      securityScan: 'Security Scan',
                      qualityGate: 'Quality Gate',
                      deployment: 'Deployment',
                    };
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                      >
                        <span className="text-xs font-medium text-gray-800">{labels[key] || key}</span>
                        <Badge status={status} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Pipeline Chart */}
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="stacked-bar"
                  data={(() => {
                    const counts = {};
                    ['build', 'unitTests', 'integrationTests', 'securityScan', 'qualityGate', 'deployment'].forEach((key) => {
                      const status = release.pipelineStatus[key] || 'not_started';
                      const normalized = status === 'passed' || status === 'completed' ? 'Passed' : status === 'failed' ? 'Failed' : status === 'blocked' ? 'Blocked' : status === 'in_progress' ? 'In Progress' : status === 'pending' ? 'Pending' : 'Not Started';
                      counts[normalized] = (counts[normalized] || 0) + 1;
                    });
                    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
                  })()}
                  title="Pipeline Status Summary"
                  description="Stages by status"
                  size="sm"
                  showValues={true}
                  showLabels={true}
                  colors={['#78BE20', '#DC2626', '#F59E0B', '#3B82F6', '#6B7280']}
                  testId="chart-pipeline-summary"
                />
              </Card>
            </>
          ) : (
            <EmptyState
              title="No pipeline data"
              description="No pipeline status data is available for this release."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-2">
          {approvalEntries.length > 0 ? (
            <>
              {/* Approval Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Approvals"
                  value={approvalEntries.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Approved"
                  value={Array.isArray(release.approvals) ? release.approvals.filter((a) => a.status === 'approved').length : 0}
                  status="passed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Pending"
                  value={Array.isArray(release.approvals) ? release.approvals.filter((a) => a.status === 'pending').length : 0}
                  status={Array.isArray(release.approvals) && release.approvals.filter((a) => a.status === 'pending').length > 0 ? 'pending' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>

              <Timeline
                entries={approvalEntries}
                variant="base"
                size="sm"
                showTimestamps={true}
                testId="release-detail-approvals-timeline"
              />
            </>
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
      {activeTab === 'waivers' && (
        <div className="space-y-2">
          {waiverEntries.length > 0 ? (
            <>
              {/* Waiver Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Waivers"
                  value={waiverEntries.length}
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Approved"
                  value={Array.isArray(release.waivers) ? release.waivers.filter((w) => w.status === 'approved').length : 0}
                  status="passed"
                  variant="compact"
                  size="sm"
                />
                <MetricCard
                  label="Pending"
                  value={Array.isArray(release.waivers) ? release.waivers.filter((w) => w.status === 'pending').length : 0}
                  status={Array.isArray(release.waivers) && release.waivers.filter((w) => w.status === 'pending').length > 0 ? 'pending' : 'healthy'}
                  variant="compact"
                  size="sm"
                />
              </div>

              <Timeline
                entries={waiverEntries}
                variant="base"
                size="sm"
                showTimestamps={true}
                testId="release-detail-waivers-timeline"
              />
            </>
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
      {activeTab === 'evidence' && (
        <div className="space-y-2">
          {Array.isArray(release.evidence) && release.evidence.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <MetricCard
                  label="Total Evidence"
                  value={release.evidence.length}
                  variant="compact"
                  size="sm"
                />
                {(() => {
                  const typeCounts = {};
                  for (let i = 0; i < release.evidence.length; i++) {
                    const type = release.evidence[i].type || 'Other';
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

              <div className="space-y-0.5">
                {release.evidence.map((ev, idx) => (
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

              {/* Evidence type chart */}
              <Card variant="base" padding="md">
                <ChartPlaceholder
                  type="donut"
                  data={(() => {
                    const typeCounts = {};
                    for (let i = 0; i < release.evidence.length; i++) {
                      const type = release.evidence[i].type || 'Other';
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
            </>
          ) : (
            <EmptyState
              title="No evidence"
              description="No evidence documents have been uploaded for this release."
              variant="compact"
            />
          )}
        </div>
      )}

      {/* AI & Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-2">
          {/* AI Risk Summary */}
          {release.aiRiskSummary ? (
            <Card variant="tinted" padding="md">
              <h4 className="text-xs font-semibold text-deep-forest-teal-800 mb-0.5">AI Risk Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{release.aiRiskSummary}</p>
            </Card>
          ) : (
            <Card variant="base" padding="md">
              <p className="text-xs text-gray-500 italic">No AI risk summary is available for this release.</p>
            </Card>
          )}

          {/* Recommendations */}
          {Array.isArray(release.recommendations) && release.recommendations.length > 0 ? (
            <Card variant="base" padding="md">
              <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Recommendations</h4>
              <ul className="list-disc list-inside space-y-[2px]">
                {release.recommendations.map((rec, idx) => (
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

          {/* Key Risk Indicators */}
          <Card variant="base" padding="md">
            <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Key Risk Indicators</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              <MetricCard
                label="Quality Score"
                value={release.quality_score}
                grade={grade}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Failed Gates"
                value={qualityGateTableData.filter((g) => g.status === 'failed').length}
                status={qualityGateTableData.filter((g) => g.status === 'failed').length > 0 ? 'failed' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Critical Defects"
                value={release.defects ? release.defects.critical : 0}
                status={release.defects && release.defects.critical > 0 ? 'critical' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Pending Waivers"
                value={Array.isArray(release.waivers) ? release.waivers.filter((w) => w.status === 'pending').length : 0}
                status={Array.isArray(release.waivers) && release.waivers.filter((w) => w.status === 'pending').length > 0 ? 'warning' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Pending Approvals"
                value={Array.isArray(release.approvals) ? release.approvals.filter((a) => a.status === 'pending').length : 0}
                status={Array.isArray(release.approvals) && release.approvals.filter((a) => a.status === 'pending').length > 0 ? 'pending' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Production Defects"
                value={release.defects ? release.defects.production : 0}
                status={release.defects && release.defects.production > 0 ? 'critical' : 'healthy'}
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Test Pass Rate"
                value={release.testResults ? release.testResults.passRate : '—'}
                unit="%"
                variant="compact"
                size="sm"
              />
              <MetricCard
                label="Pipeline"
                value={release.pipelineStatus ? (release.pipelineStatus.deployment === 'blocked' ? 'Blocked' : release.pipelineStatus.deployment === 'completed' ? 'Complete' : release.pipelineStatus.deployment || '—') : '—'}
                status={release.pipelineStatus && release.pipelineStatus.deployment === 'blocked' ? 'blocked' : release.pipelineStatus && (release.pipelineStatus.deployment === 'completed' || release.pipelineStatus.deployment === 'passed') ? 'passed' : 'pending'}
                variant="compact"
                size="sm"
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}