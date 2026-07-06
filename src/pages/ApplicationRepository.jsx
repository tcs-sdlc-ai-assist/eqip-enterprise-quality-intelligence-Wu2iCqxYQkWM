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

/**
 * @module ApplicationRepository
 * Application Repository page for eQIP Quality Intelligence.
 *
 * Enterprise quality inventory with search, filter, add, edit, archive, export
 * (CSV/Excel simulated), and drill-down to Application Detail. Displays
 * application list with DataTable, create/edit forms with FormField, and
 * detail modal with quality metrics, environment mapping, governance compliance,
 * release history, and technology stack.
 * Uses DataTable, FilterBar, and export utilities.
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
 * Columns definition for the applications data table.
 * @type {Array<object>}
 */
const APPLICATION_TABLE_COLUMNS = [
  {
    key: 'name',
    label: 'Application',
    sortable: true,
    width: '200px',
    render: (value) => {
      if (!value) return '—';
      return <span className="font-medium text-deep-forest-teal-800">{value}</span>;
    },
  },
  {
    key: 'segment',
    label: 'Segment',
    sortable: true,
    width: '130px',
    render: (value) => {
      if (!value) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
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
    key: 'automationCoverage',
    label: 'Automation',
    sortable: true,
    align: 'right',
    width: '100px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-700">{value}%</span>;
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
      return <span className="text-xs text-gray-700">{value}%</span>;
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
      return <span className="text-xs text-gray-700">{typeof value === 'number' ? value.toFixed(2) : value}</span>;
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
  {
    key: 'teamSize',
    label: 'Team',
    sortable: true,
    align: 'center',
    width: '60px',
    render: (value) => {
      if (value === null || value === undefined) return '—';
      return <span className="text-xs text-gray-600">{value}</span>;
    },
  },
];

/**
 * Initial form state for creating a new application.
 * @returns {object} The initial form state.
 */
function getInitialFormState() {
  return {
    name: '',
    description: '',
    segment: '',
    owner: '',
    qualityScore: '',
    automationCoverage: '',
    testCoverage: '',
    defectDensity: '',
    riskLevel: 'low',
    status: 'active',
    teamSize: '',
    technology: '',
  };
}

/**
 * Risk level options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const RISK_LEVEL_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

/**
 * Status options for select fields.
 * @type {Array<{value: string, label: string}>}
 */
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

/**
 * Application Repository page component.
 *
 * @returns {React.ReactElement} The rendered ApplicationRepository page.
 */
export default function ApplicationRepository() {
  const { user, role, userId } = useAuth();
  const { canPerform } = useRBAC();
  const { isDataReady, dataVersion, getAll, entityTypes, createEntity, updateEntity, removeEntity } = useData();

  const [filterValues, setFilterValues] = useState({});
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  // Detail modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState('overview');

  // Create/Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(getInitialFormState());
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Archive confirm state
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [appToArchive, setAppToArchive] = useState(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const canCreate = canPerform('create', 'applications');
  const canUpdate = canPerform('update', 'applications');
  const canDelete = canPerform('delete', 'applications');
  const canExport = canPerform('export', 'applications');

  /**
   * Load applications data from DataContext.
   */
  const loadApplications = useCallback(() => {
    if (!isDataReady) return;

    setIsLoading(true);

    try {
      const appData = getAll(entityTypes.APPLICATIONS);
      setApplications(Array.isArray(appData) ? appData : []);
    } catch (err) {
      console.error('[ApplicationRepository] Error loading applications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDataReady, getAll, entityTypes]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications, dataVersion]);

  /**
   * Segment filter options.
   */
  const segmentOptions = useMemo(() => {
    const segments = new Set();
    for (let i = 0; i < applications.length; i++) {
      if (applications[i].segment) {
        segments.add(applications[i].segment);
      }
    }
    return [...segments].sort().map((s) => ({ value: s, label: s }));
  }, [applications]);

  /**
   * Technology filter options.
   */
  const technologyOptions = useMemo(() => {
    const techs = new Set();
    for (let i = 0; i < applications.length; i++) {
      if (Array.isArray(applications[i].technology)) {
        for (let j = 0; j < applications[i].technology.length; j++) {
          techs.add(applications[i].technology[j]);
        }
      }
    }
    return [...techs].sort().map((t) => ({ value: t, label: t }));
  }, [applications]);

  /**
   * Custom filters for the filter bar.
   */
  const customFilters = useMemo(() => {
    return [
      {
        key: 'riskLevel',
        label: 'Risk Level',
        options: RISK_LEVEL_OPTIONS,
      },
      {
        key: 'status',
        label: 'Status',
        options: STATUS_OPTIONS,
      },
    ];
  }, []);

  /**
   * Filtered applications based on filter values and search.
   */
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (filterValues.segment) {
      result = result.filter((app) => app.segment === filterValues.segment);
    }

    if (filterValues.riskLevel) {
      result = result.filter((app) => app.riskLevel === filterValues.riskLevel);
    }

    if (filterValues.status) {
      result = result.filter((app) => app.status === filterValues.status);
    }

    if (searchValue && searchValue.trim() !== '') {
      const queryLower = searchValue.trim().toLowerCase();
      result = result.filter((app) => {
        const name = app.name ? app.name.toLowerCase() : '';
        const segment = app.segment ? app.segment.toLowerCase() : '';
        const desc = app.description ? app.description.toLowerCase() : '';
        const techs = Array.isArray(app.technology) ? app.technology.join(' ').toLowerCase() : '';
        return name.includes(queryLower) || segment.includes(queryLower) || desc.includes(queryLower) || techs.includes(queryLower);
      });
    }

    return result;
  }, [applications, filterValues, searchValue]);

  /**
   * Summary metrics for the application list.
   */
  const summaryMetrics = useMemo(() => {
    const total = applications.length;
    let totalScore = 0;
    let scoreCount = 0;
    let totalAutomation = 0;
    let automationCount = 0;
    let totalDefectDensity = 0;
    let defectDensityCount = 0;
    let lowRisk = 0;
    let mediumRisk = 0;
    let highRisk = 0;
    let active = 0;

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];

      if (typeof app.qualityScore === 'number') {
        totalScore += app.qualityScore;
        scoreCount += 1;
      }

      if (typeof app.automationCoverage === 'number') {
        totalAutomation += app.automationCoverage;
        automationCount += 1;
      }

      if (typeof app.defectDensity === 'number') {
        totalDefectDensity += app.defectDensity;
        defectDensityCount += 1;
      }

      if (app.riskLevel === 'low') lowRisk += 1;
      else if (app.riskLevel === 'medium') mediumRisk += 1;
      else if (app.riskLevel === 'high' || app.riskLevel === 'critical') highRisk += 1;

      if (app.status === 'active') active += 1;
    }

    return {
      total,
      active,
      averageQualityScore: scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) / 100 : 0,
      averageAutomation: automationCount > 0 ? Math.round((totalAutomation / automationCount) * 100) / 100 : 0,
      averageDefectDensity: defectDensityCount > 0 ? Math.round((totalDefectDensity / defectDensityCount) * 100) / 100 : 0,
      lowRisk,
      mediumRisk,
      highRisk,
    };
  }, [applications]);

  /**
   * Quality score distribution data for chart.
   */
  const qualityDistributionData = useMemo(() => {
    const buckets = { 'A (90+)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };
    for (let i = 0; i < applications.length; i++) {
      const score = applications[i].qualityScore;
      if (typeof score !== 'number') continue;
      if (score >= 90) buckets['A (90+)'] += 1;
      else if (score >= 80) buckets['B (80-89)'] += 1;
      else if (score >= 70) buckets['C (70-79)'] += 1;
      else if (score >= 60) buckets['D (60-69)'] += 1;
      else buckets['F (<60)'] += 1;
    }
    return Object.keys(buckets).map((key) => ({ label: key, value: buckets[key] }));
  }, [applications]);

  /**
   * Risk level distribution data for chart.
   */
  const riskDistributionData = useMemo(() => {
    return [
      { label: 'Low', value: summaryMetrics.lowRisk },
      { label: 'Medium', value: summaryMetrics.mediumRisk },
      { label: 'High', value: summaryMetrics.highRisk },
    ].filter((d) => d.value > 0);
  }, [summaryMetrics]);

  /**
   * Segment distribution data for chart.
   */
  const segmentDistributionData = useMemo(() => {
    const counts = {};
    for (let i = 0; i < applications.length; i++) {
      const segment = applications[i].segment || 'Unknown';
      counts[segment] = (counts[segment] || 0) + 1;
    }
    return Object.keys(counts).map((key) => ({ label: key, value: counts[key] }));
  }, [applications]);

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
   * Handle row click to open application detail.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedApp(row);
    setDetailTab('overview');
    setIsDetailOpen(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setIsDetailOpen(false);
    setSelectedApp(null);
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
   * Open edit form for the selected application.
   */
  const handleOpenEdit = useCallback(() => {
    if (!selectedApp) return;
    setFormData({
      name: selectedApp.name || '',
      description: selectedApp.description || '',
      segment: selectedApp.segment || '',
      owner: selectedApp.owner || '',
      qualityScore: selectedApp.qualityScore !== null && selectedApp.qualityScore !== undefined ? String(selectedApp.qualityScore) : '',
      automationCoverage: selectedApp.automationCoverage !== null && selectedApp.automationCoverage !== undefined ? String(selectedApp.automationCoverage) : '',
      testCoverage: selectedApp.testCoverage !== null && selectedApp.testCoverage !== undefined ? String(selectedApp.testCoverage) : '',
      defectDensity: selectedApp.defectDensity !== null && selectedApp.defectDensity !== undefined ? String(selectedApp.defectDensity) : '',
      riskLevel: selectedApp.riskLevel || 'low',
      status: selectedApp.status || 'active',
      teamSize: selectedApp.teamSize !== null && selectedApp.teamSize !== undefined ? String(selectedApp.teamSize) : '',
      technology: Array.isArray(selectedApp.technology) ? selectedApp.technology.join(', ') : '',
    });
    setFormErrors({});
    setIsEditing(true);
    setIsFormOpen(true);
  }, [selectedApp]);

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
      errors.name = 'Application name is required.';
    }
    if (!formData.segment || formData.segment.trim() === '') {
      errors.segment = 'Segment is required.';
    }
    if (formData.qualityScore !== '' && formData.qualityScore !== null && formData.qualityScore !== undefined) {
      const score = Number(formData.qualityScore);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.qualityScore = 'Quality score must be between 0 and 100.';
      }
    }
    if (formData.automationCoverage !== '' && formData.automationCoverage !== null && formData.automationCoverage !== undefined) {
      const coverage = Number(formData.automationCoverage);
      if (isNaN(coverage) || coverage < 0 || coverage > 100) {
        errors.automationCoverage = 'Automation coverage must be between 0 and 100.';
      }
    }
    if (formData.testCoverage !== '' && formData.testCoverage !== null && formData.testCoverage !== undefined) {
      const coverage = Number(formData.testCoverage);
      if (isNaN(coverage) || coverage < 0 || coverage > 100) {
        errors.testCoverage = 'Test coverage must be between 0 and 100.';
      }
    }
    if (formData.defectDensity !== '' && formData.defectDensity !== null && formData.defectDensity !== undefined) {
      const density = Number(formData.defectDensity);
      if (isNaN(density) || density < 0) {
        errors.defectDensity = 'Defect density must be a non-negative number.';
      }
    }
    if (formData.teamSize !== '' && formData.teamSize !== null && formData.teamSize !== undefined) {
      const size = Number(formData.teamSize);
      if (isNaN(size) || size < 0 || !Number.isInteger(size)) {
        errors.teamSize = 'Team size must be a non-negative integer.';
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
      const technologyArray = formData.technology
        ? formData.technology.split(',').map((t) => t.trim()).filter((t) => t !== '')
        : [];

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        segment: formData.segment.trim(),
        owner: formData.owner.trim() || null,
        qualityScore: formData.qualityScore !== '' ? Number(formData.qualityScore) : 0,
        automationCoverage: formData.automationCoverage !== '' ? Number(formData.automationCoverage) : 0,
        testCoverage: formData.testCoverage !== '' ? Number(formData.testCoverage) : 0,
        defectDensity: formData.defectDensity !== '' ? Number(formData.defectDensity) : 0,
        riskLevel: formData.riskLevel || 'low',
        status: formData.status || 'active',
        teamSize: formData.teamSize !== '' ? Number(formData.teamSize) : 0,
        technology: technologyArray,
      };

      if (isEditing && selectedApp) {
        const updated = updateEntity(entityTypes.APPLICATIONS, selectedApp.id, data, userId);
        if (updated) {
          setSelectedApp(updated);
          handleCloseForm();
          loadApplications();
        }
      } else {
        const created = createEntity(entityTypes.APPLICATIONS, data, userId);
        if (created) {
          handleCloseForm();
          loadApplications();
        }
      }
    } catch (err) {
      console.error('[ApplicationRepository] Error saving application:', err);
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formData, isEditing, selectedApp, userId, entityTypes, updateEntity, createEntity, handleCloseForm, loadApplications]);

  /**
   * Handle archive application.
   */
  const handleOpenArchive = useCallback(() => {
    if (!selectedApp) return;
    setAppToArchive(selectedApp);
    setIsArchiveOpen(true);
  }, [selectedApp]);

  const handleCloseArchive = useCallback(() => {
    setIsArchiveOpen(false);
    setAppToArchive(null);
  }, []);

  const handleConfirmArchive = useCallback(() => {
    if (!appToArchive) return;

    setIsArchiving(true);

    try {
      const updated = updateEntity(entityTypes.APPLICATIONS, appToArchive.id, { status: 'archived' }, userId);
      if (updated) {
        logAction(userId, 'Archive Application', 'applications', appToArchive.id, `Archived application: ${appToArchive.name || appToArchive.id}`);
        handleCloseArchive();
        handleCloseDetail();
        loadApplications();
      }
    } catch (err) {
      console.error('[ApplicationRepository] Error archiving application:', err);
    } finally {
      setIsArchiving(false);
    }
  }, [appToArchive, userId, entityTypes, updateEntity, handleCloseArchive, handleCloseDetail, loadApplications]);

  /**
   * Handle export to CSV.
   */
  const handleExportCSV = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredApplications.map((app) => ({
      Name: app.name || '',
      Segment: app.segment || '',
      'Quality Score': app.qualityScore !== null && app.qualityScore !== undefined ? app.qualityScore : '',
      'Automation Coverage (%)': app.automationCoverage !== null && app.automationCoverage !== undefined ? app.automationCoverage : '',
      'Test Coverage (%)': app.testCoverage !== null && app.testCoverage !== undefined ? app.testCoverage : '',
      'Defect Density': app.defectDensity !== null && app.defectDensity !== undefined ? app.defectDensity : '',
      'Risk Level': app.riskLevel || '',
      Status: app.status || '',
      'Team Size': app.teamSize !== null && app.teamSize !== undefined ? app.teamSize : '',
      Technology: Array.isArray(app.technology) ? app.technology.join(', ') : '',
    }));

    exportToCSV(exportData, 'application-repository');

    logAction(userId, 'Export Applications CSV', 'applications', 'bulk', `Exported ${exportData.length} applications to CSV`);
  }, [canExport, filteredApplications, userId]);

  /**
   * Handle export to Excel.
   */
  const handleExportExcel = useCallback(() => {
    if (!canExport) return;

    const exportData = filteredApplications.map((app) => ({
      Name: app.name || '',
      Segment: app.segment || '',
      'Quality Score': app.qualityScore !== null && app.qualityScore !== undefined ? app.qualityScore : '',
      'Automation Coverage (%)': app.automationCoverage !== null && app.automationCoverage !== undefined ? app.automationCoverage : '',
      'Test Coverage (%)': app.testCoverage !== null && app.testCoverage !== undefined ? app.testCoverage : '',
      'Defect Density': app.defectDensity !== null && app.defectDensity !== undefined ? app.defectDensity : '',
      'Risk Level': app.riskLevel || '',
      Status: app.status || '',
      'Team Size': app.teamSize !== null && app.teamSize !== undefined ? app.teamSize : '',
      Technology: Array.isArray(app.technology) ? app.technology.join(', ') : '',
    }));

    exportToExcel(exportData, 'application-repository');

    logAction(userId, 'Export Applications Excel', 'applications', 'bulk', `Exported ${exportData.length} applications to Excel`);
  }, [canExport, filteredApplications, userId]);

  /**
   * Detail modal tabs.
   */
  const detailTabs = useMemo(() => {
    if (!selectedApp) return [];

    const releaseCount = Array.isArray(selectedApp.releaseHistory) ? selectedApp.releaseHistory.length : 0;
    const envCount = selectedApp.environmentMapping ? Object.keys(selectedApp.environmentMapping).length : 0;
    const govCount = selectedApp.governanceCompliance && Array.isArray(selectedApp.governanceCompliance.procedures) ? selectedApp.governanceCompliance.procedures.length : 0;

    return [
      { key: 'overview', label: 'Overview' },
      { key: 'environments', label: 'Environments', badge: envCount > 0 ? String(envCount) : undefined },
      { key: 'releases', label: 'Releases', badge: releaseCount > 0 ? String(releaseCount) : undefined },
      { key: 'governance', label: 'Governance', badge: govCount > 0 ? String(govCount) : undefined },
    ];
  }, [selectedApp]);

  /**
   * Release history timeline entries.
   */
  const releaseTimelineEntries = useMemo(() => {
    if (!selectedApp || !Array.isArray(selectedApp.releaseHistory)) return [];

    return selectedApp.releaseHistory.map((rel, idx) => ({
      id: rel.releaseId || `rel-${idx}`,
      title: rel.name || rel.releaseId || 'Release',
      description: `Quality Score: ${rel.qualityScore || '—'} | Status: ${rel.status || '—'}`,
      timestamp: rel.date,
      badge: rel.status ? <Badge status={rel.status === 'Ready' ? 'passed' : rel.status === 'At Risk' ? 'at_risk' : rel.status === 'In Progress' ? 'in_progress' : rel.status.toLowerCase().replace(/\s+/g, '_')} size="sm">{rel.status}</Badge> : null,
    }));
  }, [selectedApp]);

  if (isLoading && applications.length === 0) {
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
          <span className="text-sm text-gray-500 font-medium">Loading applications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="application-repository">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-deep-forest-teal-800">Application Repository</h1>
          <p className="text-sm text-gray-500 mt-[2px]">
            Enterprise quality inventory across all business segments
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
              ariaLabel="Add new application"
            >
              + Add Application
            </Button>
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1">
        <MetricCard
          label="Total Applications"
          value={summaryMetrics.total}
          variant="compact"
          size="sm"
          testId="metric-total-apps"
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
          label="Avg Quality Score"
          value={summaryMetrics.averageQualityScore}
          grade={scoreToGrade(summaryMetrics.averageQualityScore)}
          variant="compact"
          size="sm"
          testId="metric-avg-quality"
        />
        <MetricCard
          label="Avg Automation"
          value={summaryMetrics.averageAutomation}
          unit="%"
          variant="compact"
          size="sm"
          testId="metric-avg-automation"
        />
        <MetricCard
          label="Avg Defect Density"
          value={summaryMetrics.averageDefectDensity}
          variant="compact"
          size="sm"
          testId="metric-avg-defect-density"
        />
        <MetricCard
          label="Low Risk"
          value={summaryMetrics.lowRisk}
          status="healthy"
          variant="compact"
          size="sm"
          testId="metric-low-risk"
        />
        <MetricCard
          label="High Risk"
          value={summaryMetrics.highRisk}
          status={summaryMetrics.highRisk > 0 ? 'critical' : 'healthy'}
          variant="compact"
          size="sm"
          testId="metric-high-risk"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="bar"
            data={qualityDistributionData}
            title="Quality Score Distribution"
            description="Applications by quality grade"
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
            data={riskDistributionData}
            title="Risk Level Distribution"
            description="Applications by risk level"
            size="sm"
            showValues={true}
            showLabels={true}
            colors={['#78BE20', '#F59E0B', '#DC2626']}
            testId="chart-risk-distribution"
          />
        </Card>
        <Card variant="base" padding="md">
          <ChartPlaceholder
            type="horizontal-bar"
            data={segmentDistributionData}
            title="Segment Distribution"
            description="Applications by business segment"
            size="sm"
            showValues={true}
            showLabels={true}
            testId="chart-segment-distribution"
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
        searchPlaceholder="Search applications..."
        showSegmentFilter={true}
        segmentOptions={segmentOptions}
        showClearAll={true}
        onClearAll={handleClearAll}
        testId="application-filter-bar"
      />

      {/* Applications Data Table */}
      <DataTable
        columns={APPLICATION_TABLE_COLUMNS}
        data={filteredApplications}
        rowKey="id"
        paginated={true}
        pageSize={25}
        striped={true}
        hoverable={true}
        compact={false}
        searchable={false}
        loading={isLoading}
        onRowClick={handleRowClick}
        emptyTitle="No applications found"
        emptyMessage="No applications match the current filters. Try adjusting your search or filter criteria."
        ariaLabel="Application repository table"
        testId="applications-table"
      />

      {/* Application Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          title={selectedApp.name || 'Application Detail'}
          size="xl"
          closeOnOverlayClick={true}
          closeOnEscape={true}
          showCloseButton={true}
          ariaLabel={`Application detail: ${selectedApp.name || selectedApp.id}`}
          testId="application-detail-modal"
          actions={
            <div className="flex items-center gap-1 flex-wrap">
              {canUpdate && (
                <Button variant="secondary" size="sm" onClick={handleOpenEdit} ariaLabel="Edit application">
                  Edit
                </Button>
              )}
              {canUpdate && selectedApp.status !== 'archived' && (
                <Button variant="danger" size="sm" onClick={handleOpenArchive} ariaLabel="Archive application">
                  Archive
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-2">
            {/* Application Meta */}
            <div className="flex flex-wrap items-center gap-1">
              {selectedApp.status && (
                <Badge status={selectedApp.status} size="md" />
              )}
              {selectedApp.riskLevel && (
                <Badge status={selectedApp.riskLevel} size="md" />
              )}
              {selectedApp.qualityScore !== null && selectedApp.qualityScore !== undefined && (
                <Badge variant={gradeToVariant(scoreToGrade(selectedApp.qualityScore))} size="md">
                  Grade {scoreToGrade(selectedApp.qualityScore)}
                </Badge>
              )}
              {selectedApp.segment && (
                <Badge variant="neutral" size="md">{selectedApp.segment}</Badge>
              )}
            </div>

            {/* Detail Tabs */}
            <Tabs
              tabs={detailTabs}
              activeKey={detailTab}
              onChange={setDetailTab}
              variant="underline"
              size="md"
              testId="application-detail-tabs"
            />

            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-2">
                {selectedApp.description && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedApp.description}</p>
                  </div>
                )}

                {/* Quality Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  <MetricCard
                    label="Quality Score"
                    value={selectedApp.qualityScore}
                    grade={scoreToGrade(selectedApp.qualityScore)}
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Automation Coverage"
                    value={selectedApp.automationCoverage}
                    unit="%"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Test Coverage"
                    value={selectedApp.testCoverage}
                    unit="%"
                    variant="compact"
                    size="sm"
                  />
                  <MetricCard
                    label="Defect Density"
                    value={selectedApp.defectDensity}
                    unit="defects/KLOC"
                    variant="compact"
                    size="sm"
                  />
                </div>

                {/* Application Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Segment:</span>{' '}
                    <span className="text-gray-800">{selectedApp.segment || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Owner:</span>{' '}
                    <span className="text-gray-800">{selectedApp.owner || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Team Size:</span>{' '}
                    <span className="text-gray-800">{selectedApp.teamSize || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Risk Level:</span>{' '}
                    <span className="text-gray-800">{selectedApp.riskLevel || '—'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>{' '}
                    <span className="text-gray-800">{selectedApp.status || '—'}</span>
                  </div>
                </div>

                {/* Technology Stack */}
                {Array.isArray(selectedApp.technology) && selectedApp.technology.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Technology Stack</h4>
                    <div className="flex flex-wrap gap-0.5">
                      {selectedApp.technology.map((tech, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Governance Compliance Overview */}
                {selectedApp.governanceCompliance && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-600 mb-0.5">Governance Compliance</h4>
                    <ProgressBar
                      value={selectedApp.governanceCompliance.overallRate || 0}
                      max={100}
                      size="md"
                      variant="auto"
                      showValue={true}
                      label="Overall Compliance Rate"
                      unit="%"
                      testId="governance-compliance-bar"
                    />
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <div>
                    Created: {selectedApp.created_at ? new Date(selectedApp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                  <div>
                    Updated: {selectedApp.updated_at ? new Date(selectedApp.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Environments Tab */}
            {detailTab === 'environments' && (
              <div>
                {selectedApp.environmentMapping && Object.keys(selectedApp.environmentMapping).length > 0 ? (
                  <div className="space-y-0.5">
                    {Object.keys(selectedApp.environmentMapping).map((envKey) => {
                      const env = selectedApp.environmentMapping[envKey];
                      return (
                        <div
                          key={envKey}
                          className="flex items-center justify-between py-1 px-1.5 border border-gray-100 rounded-standard"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 capitalize">{envKey}</span>
                            <Badge status={env.status || 'unknown'} size="sm" />
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
                            {env.url && (
                              <span className="truncate max-w-[200px]" title={env.url}>{env.url}</span>
                            )}
                            {env.lastDeployment && (
                              <span className="text-[10px] text-gray-400">
                                Deployed: {new Date(env.lastDeployment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="No environments"
                    description="No environment mappings are configured for this application."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Releases Tab */}
            {detailTab === 'releases' && (
              <div>
                {releaseTimelineEntries.length > 0 ? (
                  <Timeline
                    entries={releaseTimelineEntries}
                    variant="base"
                    size="sm"
                    showTimestamps={true}
                    testId="application-release-timeline"
                  />
                ) : (
                  <EmptyState
                    title="No release history"
                    description="No releases have been recorded for this application."
                    variant="compact"
                  />
                )}
              </div>
            )}

            {/* Governance Tab */}
            {detailTab === 'governance' && (
              <div>
                {selectedApp.governanceCompliance && Array.isArray(selectedApp.governanceCompliance.procedures) && selectedApp.governanceCompliance.procedures.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <MetricCard
                        label="Overall Compliance"
                        value={selectedApp.governanceCompliance.overallRate || 0}
                        unit="%"
                        variant="compact"
                        size="sm"
                      />
                      <MetricCard
                        label="Procedures"
                        value={selectedApp.governanceCompliance.procedures.length}
                        variant="compact"
                        size="sm"
                      />
                    </div>

                    <div className="space-y-0.5">
                      {selectedApp.governanceCompliance.procedures.map((proc, idx) => (
                        <div
                          key={proc.procedureId || idx}
                          className="flex items-center justify-between py-0.5 px-1 border border-gray-100 rounded-standard"
                        >
                          <div className="flex items-center gap-0.5 min-w-0">
                            <span className="text-xs font-medium text-gray-800 truncate">{proc.name || proc.procedureId || 'Procedure'}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Badge status={proc.status || 'unknown'} size="sm" />
                            {proc.lastAudit && (
                              <span className="text-[10px] text-gray-400">
                                {new Date(proc.lastAudit).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No governance data"
                    description="No governance compliance data is available for this application."
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
        title={isEditing ? 'Edit Application' : 'Add New Application'}
        size="lg"
        closeOnOverlayClick={false}
        closeOnEscape={true}
        showCloseButton={true}
        ariaLabel={isEditing ? 'Edit application form' : 'Add application form'}
        testId="application-form-modal"
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
              ariaLabel={isEditing ? 'Save changes' : 'Add application'}
            >
              {isEditing ? 'Save Changes' : 'Add Application'}
            </Button>
          </>
        }
      >
        <div className="space-y-1.5">
          <FormField
            label="Application Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleFormChange}
            placeholder="Enter application name"
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
            placeholder="Describe the application..."
            rows={3}
            testId="form-description"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Segment"
              name="segment"
              type="text"
              value={formData.segment}
              onChange={handleFormChange}
              placeholder="e.g., Claims, Billing"
              required={true}
              error={formErrors.segment}
              testId="form-segment"
            />
            <FormField
              label="Owner"
              name="owner"
              type="text"
              value={formData.owner}
              onChange={handleFormChange}
              placeholder="e.g., user-001"
              testId="form-owner"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Quality Score (0-100)"
              name="qualityScore"
              type="number"
              value={formData.qualityScore}
              onChange={handleFormChange}
              placeholder="e.g., 85"
              min={0}
              max={100}
              error={formErrors.qualityScore}
              testId="form-quality-score"
            />
            <FormField
              label="Automation Coverage (%)"
              name="automationCoverage"
              type="number"
              value={formData.automationCoverage}
              onChange={handleFormChange}
              placeholder="e.g., 72"
              min={0}
              max={100}
              error={formErrors.automationCoverage}
              testId="form-automation-coverage"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <FormField
              label="Test Coverage (%)"
              name="testCoverage"
              type="number"
              value={formData.testCoverage}
              onChange={handleFormChange}
              placeholder="e.g., 80"
              min={0}
              max={100}
              error={formErrors.testCoverage}
              testId="form-test-coverage"
            />
            <FormField
              label="Defect Density"
              name="defectDensity"
              type="number"
              value={formData.defectDensity}
              onChange={handleFormChange}
              placeholder="e.g., 0.45"
              min={0}
              step="0.01"
              error={formErrors.defectDensity}
              testId="form-defect-density"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            <FormField
              label="Risk Level"
              name="riskLevel"
              type="select"
              value={formData.riskLevel}
              onChange={handleFormChange}
              options={RISK_LEVEL_OPTIONS}
              testId="form-risk-level"
            />
            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleFormChange}
              options={STATUS_OPTIONS}
              testId="form-status"
            />
            <FormField
              label="Team Size"
              name="teamSize"
              type="number"
              value={formData.teamSize}
              onChange={handleFormChange}
              placeholder="e.g., 12"
              min={0}
              error={formErrors.teamSize}
              testId="form-team-size"
            />
          </div>

          <FormField
            label="Technology Stack (comma-separated)"
            name="technology"
            type="text"
            value={formData.technology}
            onChange={handleFormChange}
            placeholder="e.g., React, Node.js, PostgreSQL"
            testId="form-technology"
          />
        </div>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isArchiveOpen}
        onClose={handleCloseArchive}
        onConfirm={handleConfirmArchive}
        title="Archive Application"
        message={`Are you sure you want to archive "${appToArchive ? appToArchive.name : ''}"? The application will be marked as archived and hidden from active views.`}
        variant="warning"
        confirmLabel="Archive"
        cancelLabel="Cancel"
        loading={isArchiving}
        loadingText="Archiving..."
        testId="application-archive-dialog"
      />
    </div>
  );
}