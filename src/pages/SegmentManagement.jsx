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
import Tabs from '../components/common/Tabs.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Modal from '../components/common/Modal.jsx';
import Timeline from '../components/common/Timeline.jsx';

/**
 * @module SegmentManagement
 * Segment Management page for eQIP Quality Intelligence.
 *
 * Lists business segments with quality scores, compliance status, application counts,
 * release counts, and domain information. Supports drill-down into segment details
 * including applications, releases, test assets, execution history, quality trends,
 * and governance compliance. Data scoped by mock user role.
 * Uses DataTable, FilterBar, Tabs, and MetricCard components.
 */

/**
 * Helper to resolve compliance status to a badge variant.
 * @param {string} status - The compliance status.
 * @returns {string} The badge status string.
 */
function resolveComplianceStatus(status) {
  if (!status) return 'unknown';
  return status;
}

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
 * Columns definition for the segments data table.
 * @type {Array<object>}
 */
const SEGMENT_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Segment',
    sortable: true,
    width: '180px',
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'domain',
    label: 'Domain',
    sortable: true,
    width: '120px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value === 'Healthcare' ? 'info' : 'warning'} size="sm">{value}</Badge>;
    },
  },
  {
    key: 'qualityScore',
    label: 'Quality Score',
    sortable: true,
    align: 'center',
    width: '120px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      const grade = scoreToGrade(value);
      return (
        <div className="flex items-center justify-center gap-0.5">
          <span className="text-sm font-bold text-deep-forest-teal-800">{value}</span>
          <Badge variant={gradeToVariant(grade)} size="sm">{grade}</Badge>
        </div>
      );
    },
  },
  {
    key: 'complianceStatus',
    label: 'Compliance',
    sortable: true,
    width: '110px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={resolveComplianceStatus(value)} size="sm" />;
    },
  },
  {
    key: 'applicationCount',
    label: 'Applications',
    sortable: true,
    align: 'center',
    width: '100px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-medium text-gray-700">{value}</span>;
    },
  },
  {
    key: 'releaseCount',
    label: 'Releases',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-medium text-gray-700">{value}</span>;
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
];

/**
 * Columns definition for the applications drill-down table.
 * @type {Array<object>}
 */
const APPLICATION_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Application',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'qualityScore',
    label: 'Quality Score',
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
    key: 'automationCoverage',
    label: 'Automation',
    sortable: true,
    align: 'right',
    width: '100px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return `${value}%`;
    },
  },
  {
    key: 'testCoverage',
    label: 'Test Coverage',
    sortable: true,
    align: 'right',
    width: '110px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return `${value}%`;
    },
  },
  {
    key: 'defectDensity',
    label: 'Defect Density',
    sortable: true,
    align: 'right',
    width: '120px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return typeof value === 'number' ? value.toFixed(2) : String(value);
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
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '80px',
    render: (value) => {
      if (!value) return '—';
      return <Badge status={value} size="sm" />;
    },
  },
];

/**
 * Columns definition for the releases drill-down table.
 * @type {Array<object>}
 */
const RELEASE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Release',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'application',
    label: 'Application',
    sortable: true,
    width: '150px',
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    width: '100px',
    render: (value) => {
      if (!value) return '—';
      const statusMap = {
        'Ready': 'passed',
        'In Progress': 'in_progress',
        'In Review': 'in_review',
        'At Risk': 'at_risk',
        'Draft': 'draft',
      };
      return <Badge status={statusMap[value] || value} size="sm">{value}</Badge>;
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
      return <span className="text-sm font-bold">{value}</span>;
    },
  },
  {
    key: 'quality_score',
    label: 'Quality',
    sortable: true,
    align: 'center',
    width: '90px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-sm font-bold">{value}</span>;
    },
  },
];

/**
 * Columns definition for the governance drill-down table.
 * @type {Array<object>}
 */
const GOVERNANCE_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Procedure',
    sortable: true,
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-gray-900">{value}</span>;
    },
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    width: '140px',
  },
  {
    key: 'complianceStatus',
    label: 'Status',
    sortable: true,
    width: '110px',
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
      return `${value}%`;
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
];

/**
 * Segment Management page component.
 *
 * @returns {React.ReactElement} The rendered SegmentManagement page.
 */
export default function SegmentManagement() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [segments, setSegments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [releases, setReleases] = useState([]);
  const [governanceProcedures, setGovernanceProcedures] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);

  const userSegment = user ? user.segment : undefined;

  /**
   * Load all data from DataContext.
   */
  const loadData = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const segData = getAll(entityTypes.SEGMENTS);
      const appData = getAll(entityTypes.APPLICATIONS);
      const relData = getAll(entityTypes.RELEASES);
      const govData = getAll(entityTypes.GOVERNANCE_PROCEDURES);
      const tcData = getAll(entityTypes.TEST_CASES);
      const execData = getAll(entityTypes.TEST_EXECUTIONS);

      setSegments(Array.isArray(segData) ? segData : []);
      setApplications(Array.isArray(appData) ? appData : []);
      setReleases(Array.isArray(relData) ? relData : []);
      setGovernanceProcedures(Array.isArray(govData) ? govData : []);
      setTestCases(Array.isArray(tcData) ? tcData : []);
      setTestExecutions(Array.isArray(execData) ? execData : []);
    } catch (err) {
      console.error('[SegmentManagement] Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, getAll, entityTypes]);

  useEffect(() => {
    loadData();
  }, [loadData, dataVersion]);

  /**
   * Domain filter options.
   */
  const domainOptions = useMemo(() => {
    const domains = new Set();
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].domain) {
        domains.add(segments[i].domain);
      }
    }
    return [...domains].sort().map((d) => ({ value: d, label: d }));
  }, [segments]);

  /**
   * Compliance status filter options.
   */
  const complianceOptions = useMemo(() => {
    return [
      { value: 'compliant', label: 'Compliant' },
      { value: 'at_risk', label: 'At Risk' },
      { value: 'non_compliant', label: 'Non-Compliant' },
    ];
  }, []);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'domain',
        label: 'Domain',
        options: domainOptions,
      },
      {
        key: 'complianceStatus',
        label: 'Compliance',
        options: complianceOptions,
      },
    ];
  }, [domainOptions, complianceOptions]);

  /**
   * Filtered segments based on filter values and search.
   */
  const filteredSegments = useMemo(() => {
    let result = [...segments];

    if (filterValues.domain) {
      result = result.filter((seg) => seg.domain === filterValues.domain);
    }

    if (filterValues.complianceStatus) {
      result = result.filter((seg) => seg.complianceStatus === filterValues.complianceStatus);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((seg) => {
        const name = seg.name ? seg.name.toLowerCase() : '';
        const domain = seg.domain ? seg.domain.toLowerCase() : '';
        const desc = seg.description ? seg.description.toLowerCase() : '';
        return name.includes(queryLower) || domain.includes(queryLower) || desc.includes(queryLower);
      });
    }

    return result;
  }, [segments, filterValues, searchValue]);

  /**
   * Summary metrics for the segment list.
   */
  const summaryMetrics = useMemo(() => {
    const total = segments.length;
    let compliant = 0;
    let atRisk = 0;
    let nonCompliant = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let totalApps = 0;
    let totalReleases = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.complianceStatus === 'compliant') compliant += 1;
      else if (seg.complianceStatus === 'at_risk') atRisk += 1;
      else if (seg.complianceStatus === 'non_compliant') nonCompliant += 1;

      if (typeof seg.qualityScore === 'number') {
        totalScore += seg.qualityScore;
        scoreCount += 1;
      }

      totalApps += seg.applicationCount || 0;
      totalReleases += seg.releaseCount || 0;
    }

    return {
      total,
      compliant,
      atRisk,
      nonCompliant,
      averageQualityScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) / 100 : 0,
      totalApplications: totalApps,
      totalReleases: totalReleases,
    };
  }, [segments]);

  /**
   * Get applications for a specific segment.
   * @param {string} segmentName - The segment name.
   * @returns {Array<object>} Array of applications in the segment.
   */
  const getApplicationsForSegment = useCallback((segmentName) => {
    if (!segmentName) return [];
    return applications.filter((app) => app.segment === segmentName);
  }, [applications]);

  /**
   * Get releases for a specific segment.
   * @param {string} segmentName - The segment name.
   * @returns {Array<object>} Array of releases in the segment.
   */
  const getReleasesForSegment = useCallback((segmentName) => {
    if (!segmentName) return [];
    return releases.filter((rel) => rel.segment === segmentName);
  }, [releases]);

  /**
   * Get governance procedures applicable to a specific segment.
   * @param {string} segmentName - The segment name.
   * @returns {Array<object>} Array of governance procedures for the segment.
   */
  const getGovernanceForSegment = useCallback((segmentName) => {
    if (!segmentName) return [];
    return governanceProcedures.filter((proc) => {
      if (!Array.isArray(proc.applicableSegments) || proc.applicableSegments.length === 0) {
        return true;
      }
      return proc.applicableSegments.includes(segmentName);
    });
  }, [governanceProcedures]);

  /**
   * Get test cases for a specific segment.
   * @param {string} segmentName - The segment name.
   * @returns {Array<object>} Array of test cases in the segment.
   */
  const getTestCasesForSegment = useCallback((segmentName) => {
    if (!segmentName) return [];
    return testCases.filter((tc) => tc.segment === segmentName);
  }, [testCases]);

  /**
   * Get test executions for a specific segment.
   * @param {string} segmentName - The segment name.
   * @returns {Array<object>} Array of test executions in the segment.
   */
  const getTestExecutionsForSegment = useCallback((segmentName) => {
    if (!segmentName) return [];
    return testExecutions.filter((exec) => exec.segment === segmentName);
  }, [testExecutions]);

  /**
   * Segment detail data for the selected segment.
   */
  const segmentDetail = useMemo(() => {
    if (!selectedSegment) return null;

    const segApps = getApplicationsForSegment(selectedSegment.name);
    const segReleases = getReleasesForSegment(selectedSegment.name);
    const segGovernance = getGovernanceForSegment(selectedSegment.name);
    const segTestCases = getTestCasesForSegment(selectedSegment.name);
    const segExecutions = getTestExecutionsForSegment(selectedSegment.name);

    let avgAppScore = 0;
    if (segApps.length > 0) {
      let total = 0;
      for (let i = 0; i < segApps.length; i++) {
        total += segApps[i].qualityScore || 0;
      }
      avgAppScore = Math.round((total / segApps.length) * 100) / 100;
    }

    let avgAutomation = 0;
    if (segApps.length > 0) {
      let total = 0;
      for (let i = 0; i < segApps.length; i++) {
        total += segApps[i].automationCoverage || 0;
      }
      avgAutomation = Math.round((total / segApps.length) * 100) / 100;
    }

    let avgDefectDensity = 0;
    if (segApps.length > 0) {
      let total = 0;
      for (let i = 0; i < segApps.length; i++) {
        total += segApps[i].defectDensity || 0;
      }
      avgDefectDensity = Math.round((total / segApps.length) * 100) / 100;
    }

    let govCompliance = 0;
    if (segGovernance.length > 0) {
      let total = 0;
      for (let i = 0; i < segGovernance.length; i++) {
        total += segGovernance[i].complianceRate || 0;
      }
      govCompliance = Math.round((total / segGovernance.length) * 100) / 100;
    }

    let passedExecs = 0;
    let completedExecs = 0;
    for (let i = 0; i < segExecutions.length; i++) {
      if (segExecutions[i].status === 'completed') {
        completedExecs += 1;
        if (segExecutions[i].result === 'passed') {
          passedExecs += 1;
        }
      }
    }
    const passRate = completedExecs > 0 ? Math.round((passedExecs / completedExecs) * 10000) / 100 : 0;

    const subSegments = segments.filter((s) => s.parentSegmentId === selectedSegment.id);

    const recentExecutions = [...segExecutions]
      .sort((a, b) => {
        const dateA = new Date(a.executedAt).getTime();
        const dateB = new Date(b.executedAt).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateB - dateA;
      })
      .slice(0, 10);

    const qualityTrendData = [];
    if (segApps.length > 0) {
      for (let i = 0; i < segApps.length; i++) {
        const app = segApps[i];
        if (Array.isArray(app.releaseHistory)) {
          for (let j = 0; j < app.releaseHistory.length; j++) {
            const rh = app.releaseHistory[j];
            if (rh.qualityScore && rh.name) {
              qualityTrendData.push({
                label: rh.name.replace('Release ', ''),
                value: rh.qualityScore,
              });
            }
          }
        }
      }
    }

    return {
      applications: segApps,
      releases: segReleases,
      governance: segGovernance,
      testCases: segTestCases,
      executions: segExecutions,
      recentExecutions,
      subSegments,
      avgAppScore,
      avgAutomation,
      avgDefectDensity,
      govCompliance,
      passRate,
      totalTestCases: segTestCases.length,
      totalExecutions: segExecutions.length,
      qualityTrendData,
    };
  }, [selectedSegment, segments, getApplicationsForSegment, getReleasesForSegment, getGovernanceForSegment, getTestCasesForSegment, getTestExecutionsForSegment]);

  /**
   * Handle filter change.
   * @param {string} filterKey - The filter key.
   * @param {string} value - The filter value.
   */
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  }, []);

  /**
   * Handle search change.
   * @param {string} value - The search value.
   */
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
  }, []);

  /**
   * Handle clear all filters.
   */
  const handleClearAll = useCallback(() => {
    setFilterValues({});
    setSearchValue('');
  }, []);

  /**
   * Handle row click to open segment detail.
   * @param {object} row - The clicked segment row.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedSegment(row);
    setActiveTab('overview');
    setIsDetailOpen(true);
  }, []);

  /**
   * Handle closing the detail modal.
   */
  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedSegment(null);
    setActiveTab('overview');
  }, []);

  /**
   * Handle tab change in the detail modal.
   * @param {string} tabKey - The tab key.
   */
  const handleTabChange = useCallback((tabKey) => {
    setActiveTab(tabKey);
  }, []);

  /**
   * Quality score distribution data for chart.
   */
  const qualityDistributionData = useMemo(() => {
    const buckets = { 'A (90+)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };
    for (let i = 0; i < segments.length; i++) {
      const score = segments[i].qualityScore;
      if (typeof score !== 'number') continue;
      if (score >= 90) buckets['A (90+)'] += 1;
      else if (score >= 80) buckets['B (80-89)'] += 1;
      else if (score >= 70) buckets['C (70-79)'] += 1;
      else if (score >= 60) buckets['D (60-69)'] += 1;
      else buckets['F (<60)'] += 1;
    }
    return Object.keys(buckets).map((key) => ({ label: key, value: buckets[key] }));
  }, [segments]);

  /**
   * Compliance distribution data for chart.
   */
  const complianceDistributionData = useMemo(() => {
    return [
      { label: 'Compliant', value: summaryMetrics.compliant },
      { label: 'At Risk', value: summaryMetrics.atRisk },
      { label: 'Non-Compliant', value: summaryMetrics.nonCompliant },
    ];
  }, [summaryMetrics]);

  /**
   * Domain distribution data for chart.
   */
  const domainDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < segments.length; i++) {
      const domain = segments[i].domain || 'Unknown';
      counts[domain] = (counts[domain] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [segments]);

  /**
   * Detail modal tabs definition.
   */
  const detailTabs = useMemo(() => {
    if (!selectedSegment || !segmentDetail) return [];

    return [
      {
        key: 'overview',
        label: 'Overview',
        badge: null,
      },
      {
        key: 'applications',
        label: 'Applications',
        badge: String(segmentDetail.applications.length),
      },
      {
        key: 'releases',
        label: 'Releases',
        badge: String(segmentDetail.releases.length),
      },
      {
        key: 'test-assets',
        label: 'Test Assets',
        badge: String(segmentDetail.totalTestCases),
      },
      {
        key: 'executions',
        label: 'Execution History',
        badge: String(segmentDetail.totalExecutions),
      },
      {
        key: 'governance',
        label: 'Governance',
        badge: String(segmentDetail.governance.length),
      },
    ];
  }, [selectedSegment, segmentDetail]);

  /**
   * Execution history timeline entries.
   */
  const executionTimelineEntries = useMemo(() => {
    if (!segmentDetail || !segmentDetail.recentExecutions) return [];

    return segmentDetail.recentExecutions.map((exec) => ({
      id: exec.id,
      title: exec.testCaseTitle || exec.id,
      description: exec.failureReason || (exec.result === 'passed' ? 'Test passed successfully.' : exec.result === 'failed' ? 'Test failed.' : `Status: ${exec.result || 'unknown'}`),
      timestamp: exec.executedAt,
      badge: exec.result ? <Badge status={exec.result} size="sm" /> : null,
      metadata: [
        { label: 'Application', value: exec.application || '—' },
        { label: 'Environment', value: exec.environment || '—' },
        { label: 'Duration', value: typeof exec.duration === 'number' ? `${exec.duration}s` : '—' },
      ],
    }));
  }, [segmentDetail]);

  if (isLoading && segments.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading segments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="segment-management">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Segment Management</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Business segments across Healthcare and Insurance domains
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <MetricCard
          label="Total Segments"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-segments"
        />
        <MetricCard
          label="Avg Quality Score"
          value={summaryMetrics.averageQualityScore}
          grade={scoreToGrade(summaryMetrics.averageQualityScore)}
          variant="compact"
          size="sm"
          testId="metric-avg-quality"
        />
        <MetricCard
          label="Compliant"
          value={summaryMetrics.compliant}
          status="compliant"
          variant="compact"
          size="sm"
          testId="metric-compliant"
        />
        <MetricCard
          label="At Risk"
          value={summaryMetrics.atRisk}
          status={summaryMetrics.atRisk > 0 ? 'at_risk' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-at-risk"
        />
        <MetricCard
          label="Non-Compliant"
          value={summaryMetrics.nonCompliant}
          status={summaryMetrics.nonCompliant > 0 ? 'critical' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-non-compliant"
        />
        <MetricCard
          label="Applications"
          value={summaryMetrics.totalApplications}
          variant="compact"
          size="sm"
          testId="metric-total-apps"
        />
        <MetricCard
          label="Releases"
          value={summaryMetrics.totalReleases}
          variant="compact"
          size="sm"
          testId="metric-total-releases"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={qualityDistributionData}
            title="Quality Score Distribution"
            description="Segments by quality grade"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#3B82F6', '#F59E0B', '#DC2626', '#6B7280']}
            testId="chart-quality-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="donut"
            data={complianceDistributionData}
            title="Compliance Status"
            description="Segment compliance breakdown"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#DC2626']}
            testId="chart-compliance-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="pie"
            data={domainDistributionData}
            title="Domain Distribution"
            description="Segments by business domain"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#024E38', '#3B82F6']}
            testId="chart-domain-distribution"
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
        searchPlaceholder="Search segments..."
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="segment-filter-bar"
      />

      {/* Segments Data Table */}
      <DataTable
        columns={SEGMENT_TABLE_COLUMNS}
        data={filteredSegments}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No segments found"
        emptyMessage="No segments match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Business segments table"
        testId="segments-table"
      />

      {/* Segment Detail Modal */}
      {selectedSegment && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedSegment.name}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Segment detail: ${selectedSegment.name}`}
          testId="segment-detail-modal"
        >
          <div className="space-y-2">
            {/* Segment Description */}
            {selectedSegment.description && (
              <p className="text-sm text-gray-600">{selectedSegment.description}</p>
            )}

            {/* Segment Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedSegment.domain && (
                <Badge status={selectedSegment.domain === 'Healthcare' ? 'info' : 'warning'} size="md">
                  {selectedSegment.domain}
                </Badge>
              )}
              {selectedSegment.complianceStatus && (
                <Badge status={resolveComplianceStatus(selectedSegment.complianceStatus)} size="md" />
              )}
              {selectedSegment.status && (
                <Badge status={selectedSegment.status} size="md" />
              )}
              {selectedSegment.parentSegmentId && (
                <Badge variant="neutral" size="md">Sub-segment</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={activeTab}
              onChange={handleTabChange}
              variant="underline"
              size="md"
              testId="segment-detail-tabs"
            />

            {/* Tab Content */}
            {activeTab === 'overview' && segmentDetail && (
              <div className="space-y-2">
                {/* Overview Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  <MetricCard
                    label="Quality Score"
                    value={selectedSegment.qualityScore}
                    grade={scoreToGrade(selectedSegment.qualityScore)}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Avg App Score"
                    value={segmentDetail.avgAppScore}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Automation Coverage"
                    value={segmentDetail.avgAutomation}
                    unit="%"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Defect Density"
                    value={segmentDetail.avgDefectDensity}
                    unit="defects/KLOC"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Test Pass Rate"
                    value={segmentDetail.passRate}
                    unit="%"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Governance Compliance"
                    value={segmentDetail.govCompliance}
                    unit="%"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Test Cases"
                    value={segmentDetail.totalTestCases}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Executions"
                    value={segmentDetail.totalExecutions}
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Quality Trend Chart */}
                {segmentDetail.qualityTrendData.length >= 2 && (
                  <Card variant="base" padding="md">
                    <ChartPlaceholder
                      type="line"
                      data={segmentDetail.qualityTrendData}
                      title="Quality Trends"
                      description="Quality scores across recent releases"
                      size="sm"
                      showValues={true}
                      showLabels={true}
                      showDots={true}
                      colors={['#024E38']}
                      testId="chart-segment-quality-trend"
                    />
                  </Card>
                )}

                {/* Sub-segments */}
                {segmentDetail.subSegments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Sub-segments</h4>
                    <div className="space-y-0.5">
                      {segmentDetail.subSegments.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                        >
                          <div className="flex items-center gap-0.5">
                            <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                            <Badge status={resolveComplianceStatus(sub.complianceStatus)} size="sm" />
                          </div>
                          <div className="flex items-center gap-0.5">
                            <span className="text-xs text-gray-500">Score: {sub.qualityScore || '—'}</span>
                            {sub.qualityScore && (
                              <Badge variant={gradeToVariant(scoreToGrade(sub.qualityScore))} size="sm">
                                {scoreToGrade(sub.qualityScore)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Segment Info */}
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <div>
                    <span className="font-medium text-gray-600">Owner:</span> {selectedSegment.owner || '—'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Applications:</span> {selectedSegment.applicationCount || 0}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Releases:</span> {selectedSegment.releaseCount || 0}
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Domain:</span> {selectedSegment.domain || '—'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && segmentDetail && (
              <div>
                {segmentDetail.applications.length > 0 ? (
                  <DataTable
                    columns={APPLICATION_TABLE_COLUMNS}
                    data={segmentDetail.applications}
                    rowKey="id"
                    paginated={segmentDetail.applications.length > 10}
                    pageSize={10}
                    striped={true}
                    hoverable={true}
                    compact={true}
                    searchable={segmentDetail.applications.length > 5}
                    searchPlaceholder="Search applications..."
                    emptyTitle="No applications"
                    emptyMessage="No applications found in this segment."
                    ariaLabel="Segment applications table"
                    testId="segment-applications-table"
                  />
                ) : (
                  <EmptyState
                    title="No applications"
                    description="No applications are associated with this segment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {activeTab === 'releases' && segmentDetail && (
              <div>
                {segmentDetail.releases.length > 0 ? (
                  <DataTable
                    columns={RELEASE_TABLE_COLUMNS}
                    data={segmentDetail.releases}
                    rowKey="id"
                    paginated={segmentDetail.releases.length > 10}
                    pageSize={10}
                    striped={true}
                    hoverable={true}
                    compact={true}
                    searchable={segmentDetail.releases.length > 5}
                    searchPlaceholder="Search releases..."
                    emptyTitle="No releases"
                    emptyMessage="No releases found in this segment."
                    ariaLabel="Segment releases table"
                    testId="segment-releases-table"
                  />
                ) : (
                  <EmptyState
                    title="No releases"
                    description="No releases are associated with this segment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {activeTab === 'test-assets' && segmentDetail && (
              <div>
                {segmentDetail.testCases.length > 0 ? (
                  <div className="space-y-1">
                    {/* Test Asset Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Total</p>
                          <p className="text-lg font-bold text-deep-forest-teal-800">{segmentDetail.testCases.length}</p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Automated</p>
                          <p className="text-lg font-bold text-deep-forest-teal-800">
                            {segmentDetail.testCases.filter((tc) => tc.automationStatus === 'automated').length}
                          </p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Manual</p>
                          <p className="text-lg font-bold text-deep-forest-teal-800">
                            {segmentDetail.testCases.filter((tc) => tc.automationStatus === 'manual').length}
                          </p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Passed</p>
                          <p className="text-lg font-bold text-living-green-600">
                            {segmentDetail.testCases.filter((tc) => tc.status === 'passed').length}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Test Cases by Type */}
                    <DataTable
                      columns={[
                        {
                          key: 'title',
                          label: 'Test Case',
                          sortable: true,
                          render: (value) => {
                            if (!value) return '—';
                            return <span className="text-xs font-medium text-gray-900 truncate">{value}</span>;
                          },
                        },
                        {
                          key: 'assetType',
                          label: 'Type',
                          sortable: true,
                          width: '120px',
                          render: (value) => {
                            if (!value) return '—';
                            return <span className="text-xs text-gray-600">{value}</span>;
                          },
                        },
                        {
                          key: 'automationStatus',
                          label: 'Automation',
                          sortable: true,
                          width: '100px',
                          render: (value) => {
                            if (!value) return '—';
                            return <Badge status={value} size="sm" />;
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
                          width: '70px',
                          render: (value) => {
                            if (!value) return '—';
                            return <Badge status={value} size="sm">{value.toUpperCase()}</Badge>;
                          },
                        },
                      ]}
                      data={segmentDetail.testCases}
                      rowKey="id"
                      paginated={segmentDetail.testCases.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      searchable={segmentDetail.testCases.length > 5}
                      searchPlaceholder="Search test cases..."
                      emptyTitle="No test cases"
                      emptyMessage="No test cases found in this segment."
                      ariaLabel="Segment test cases table"
                      testId="segment-test-cases-table"
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No test assets"
                    description="No test assets are associated with this segment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {activeTab === 'executions' && segmentDetail && (
              <div>
                {segmentDetail.recentExecutions.length > 0 ? (
                  <div className="space-y-1">
                    {/* Execution Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Total Executions</p>
                          <p className="text-lg font-bold text-deep-forest-teal-800">{segmentDetail.totalExecutions}</p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Pass Rate</p>
                          <p className="text-lg font-bold text-living-green-600">{segmentDetail.passRate}%</p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Passed</p>
                          <p className="text-lg font-bold text-living-green-600">
                            {segmentDetail.executions.filter((e) => e.result === 'passed').length}
                          </p>
                        </div>
                      </Card>
                      <Card variant="base" padding="sm">
                        <div className="text-center">
                          <p className="text-[10px] text-gray-500 font-medium">Failed</p>
                          <p className="text-lg font-bold text-red-600">
                            {segmentDetail.executions.filter((e) => e.result === 'failed').length}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Execution Timeline */}
                    <h4 className="text-sm font-semibold text-gray-800">Recent Executions</h4>
                    <Timeline
                      entries={executionTimelineEntries}
                      variant="base"
                      size="sm"
                      showTimestamps={true}
                      testId="segment-execution-timeline"
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No execution history"
                    description="No test executions have been recorded for this segment."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {activeTab === 'governance' && segmentDetail && (
              <div>
                {segmentDetail.governance.length > 0 ? (
                  <div className="space-y-1">
                    {/* Governance Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      <MetricCard
                        label="Avg Compliance Rate"
                        value={segmentDetail.govCompliance}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Compliant"
                        value={segmentDetail.governance.filter((g) => g.complianceStatus === 'compliant').length}
                        status="compliant"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="At Risk"
                        value={segmentDetail.governance.filter((g) => g.complianceStatus === 'at_risk').length}
                        status={segmentDetail.governance.filter((g) => g.complianceStatus === 'at_risk').length > 0 ? 'at_risk' : 'healthy'}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    {/* Governance Table */}
                    <DataTable
                      columns={GOVERNANCE_TABLE_COLUMNS}
                      data={segmentDetail.governance}
                      rowKey="id"
                      paginated={segmentDetail.governance.length > 10}
                      pageSize={10}
                      striped={true}
                      hoverable={true}
                      compact={true}
                      searchable={segmentDetail.governance.length > 5}
                      searchPlaceholder="Search procedures..."
                      emptyTitle="No governance procedures"
                      emptyMessage="No governance procedures are applicable to this segment."
                      ariaLabel="Segment governance procedures table"
                      testId="segment-governance-table"
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No governance procedures"
                    description="No governance procedures are applicable to this segment."
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