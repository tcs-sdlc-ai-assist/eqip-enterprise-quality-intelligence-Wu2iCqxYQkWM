import { v4 as uuidv4 } from 'uuid';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  find,
  count,
  apiGetAll,
  apiGetById,
  apiCreate,
  apiUpdate,
  ENTITY_TYPES,
} from '../data/mockDataStore.js';
import { maskEntity, maskForExport } from '../utils/piiMasker.js';
import { logAction } from '../utils/auditLogger.js';
import { applyFilters, searchByText, sortData, paginateData, processData } from '../utils/filterUtils.js';
import { exportToCSV, exportToExcel, exportToPDF, exportToPowerPoint, exportData, EXPORT_FORMATS } from '../utils/exportUtils.js';
import { ROLES } from '../constants.js';
import {
  getAllReportInstances,
  getReportInstanceById as getStaticReportInstanceById,
  getAllReportTemplates,
  getReportTemplateById as getStaticReportTemplateById,
  getAllReportSchedules,
  getReportScheduleById as getStaticReportScheduleById,
  getAllReportExportHistory,
  getReportInstancesByStatus,
  getReportInstancesByCategory,
  getReportInstancesByFormat,
  getReportInstancesByTemplateId,
  getReportInstancesByRequestedBy,
  getRecentReportInstances,
  searchReportInstances,
  getReportTemplatesByCategory,
  getReportTemplatesByRole,
  getReportTemplatesByFormat,
  getReportTemplateByName,
  getDistinctTemplateCategories,
  getDistinctReportStatuses,
  getDistinctReportCategories,
  getDistinctReportFormats,
  getReportInstanceCountByStatus,
  getReportInstanceCountByCategory,
  getReportInstanceCountByFormat,
  getReportExportCountByFormat,
  getReportExportCountByRole,
  getReportExportsByReportId,
  getReportExportsByUser,
  getReportExportsByFormat,
  getEnabledReportSchedules,
  getReportSchedulesByFrequency,
  getReportSchedulesByOwner,
  getAverageGenerationDuration,
  getTotalExportFileSize,
  getReportingSummary,
  simulateReportGeneration,
  simulateReportExport,
  REPORT_EXPORT_FORMATS,
  REPORT_CATEGORIES,
  REPORT_SCHEDULES,
} from '../data/reports.js';

/**
 * @module reportService
 * ReportingModule service for eQIP Quality Intelligence.
 * Provides report generation, export, template management, schedule management,
 * and export history tracking with PII masking, role-based access, and audit logging.
 * Supports export to CSV, Excel, PDF, PowerPoint (simulated).
 * Reads/writes via mockDataStore and localStorage.
 */

/**
 * The entity type key for report instances.
 * @type {string}
 */
const REPORT_ENTITY_TYPE = ENTITY_TYPES.REPORTS;

/**
 * The entity type key for report templates.
 * @type {string}
 */
const REPORT_TEMPLATE_ENTITY_TYPE = ENTITY_TYPES.REPORT_TEMPLATES;

/**
 * The entity type key for report schedules.
 * @type {string}
 */
const REPORT_SCHEDULE_ENTITY_TYPE = ENTITY_TYPES.REPORT_SCHEDULES;

/**
 * The entity type key for report export history.
 * @type {string}
 */
const REPORT_EXPORT_HISTORY_ENTITY_TYPE = ENTITY_TYPES.REPORT_EXPORT_HISTORY;

/**
 * Roles that can view reports.
 * @type {Set<string>}
 */
const VIEW_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.DEVELOPER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
  ROLES.VIEWER,
]);

/**
 * Roles that can generate reports.
 * @type {Set<string>}
 */
const GENERATE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.VIEWER,
]);

/**
 * Roles that can export reports.
 * @type {Set<string>}
 */
const EXPORT_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.PROJECT_MANAGER,
  ROLES.QA_LEAD,
  ROLES.QA_ENGINEER,
  ROLES.BUSINESS_ANALYST,
  ROLES.RELEASE_MANAGER,
  ROLES.SCRUM_MASTER,
  ROLES.VIEWER,
]);

/**
 * Roles that can manage report templates.
 * @type {Set<string>}
 */
const TEMPLATE_MANAGE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.QA_LEAD,
]);

/**
 * Roles that can manage report schedules.
 * @type {Set<string>}
 */
const SCHEDULE_MANAGE_ROLES = new Set([
  ROLES.ADMIN,
  ROLES.PROGRAM_MANAGER,
  ROLES.QA_LEAD,
  ROLES.RELEASE_MANAGER,
]);

/**
 * Roles that can delete reports.
 * @type {Set<string>}
 */
const DELETE_ROLES = new Set([
  ROLES.ADMIN,
]);

/**
 * Valid export format identifiers.
 * @type {Readonly<Array<string>>}
 */
const VALID_EXPORT_FORMATS = Object.freeze([
  'csv',
  'excel',
  'pdf',
  'powerpoint',
  'json',
]);

/**
 * Check if a user role has permission for a given action.
 * @param {string} role - The user role.
 * @param {string} action - The action ('view', 'generate', 'export', 'manage_templates', 'manage_schedules', 'delete').
 * @returns {boolean} True if the role has permission.
 */
function hasPermission(role, action) {
  switch (action) {
    case 'view':
      return VIEW_ROLES.has(role);
    case 'generate':
      return GENERATE_ROLES.has(role);
    case 'export':
      return EXPORT_ROLES.has(role);
    case 'manage_templates':
      return TEMPLATE_MANAGE_ROLES.has(role);
    case 'manage_schedules':
      return SCHEDULE_MANAGE_ROLES.has(role);
    case 'delete':
      return DELETE_ROLES.has(role);
    default:
      return false;
  }
}

/**
 * Check if a role has access to a specific report template.
 * @param {object} template - The report template object.
 * @param {string} role - The user role.
 * @returns {boolean} True if the role has access to the template.
 */
function hasTemplateAccess(template, role) {
  if (!template) {
    return false;
  }

  if (role === ROLES.ADMIN) {
    return true;
  }

  if (Array.isArray(template.roles) && template.roles.length > 0) {
    return template.roles.includes(role);
  }

  return true;
}

/**
 * Validate that an export format is supported.
 * @param {string} format - The export format to validate.
 * @returns {boolean} True if the format is valid.
 */
function isValidExportFormat(format) {
  if (!format || typeof format !== 'string') {
    return false;
  }
  return VALID_EXPORT_FORMATS.includes(format);
}

// ---------------------------------------------------------------------------
// Report Template Operations
// ---------------------------------------------------------------------------

/**
 * Get all report templates with optional filtering, searching, sorting, and pagination.
 * Applies role-based access filtering and PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { category: 'Quality Metrics' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @param {string} [options.userId] - The user ID for audit logging.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getTemplates(options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let templates = getAll(REPORT_TEMPLATE_ENTITY_TYPE);

  if (templates.length === 0) {
    templates = getAllReportTemplates();
  }

  templates = templates.filter((tmpl) => hasTemplateAccess(tmpl, role));

  const result = processData(templates, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'category', 'description', 'status'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((tmpl) => maskEntity(tmpl, role));

  return result;
}

/**
 * Get all report templates without pagination (simple list).
 * Applies role-based access filtering and PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report template objects.
 */
export function getTemplatesList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let templates = getAll(REPORT_TEMPLATE_ENTITY_TYPE);

  if (templates.length === 0) {
    templates = getAllReportTemplates();
  }

  templates = templates.filter((tmpl) => hasTemplateAccess(tmpl, role));

  if (filters && Object.keys(filters).length > 0) {
    templates = applyFilters(templates, filters);
  }

  return templates.map((tmpl) => maskEntity(tmpl, role));
}

/**
 * Get a single report template by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The report template ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report template object, or null if not found.
 */
export function getTemplateDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  let template = getById(REPORT_TEMPLATE_ENTITY_TYPE, id);

  if (!template) {
    template = getStaticReportTemplateById(id);
  }

  if (!template) {
    return null;
  }

  if (!hasTemplateAccess(template, role)) {
    return null;
  }

  return maskEntity(template, role);
}

/**
 * Get a single report template by ID (alias for getTemplateDetail).
 *
 * @param {string} id - The report template ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report template object, or null if not found.
 */
export function getTemplateById(id, role = ROLES.VIEWER) {
  return getTemplateDetail(id, role);
}

/**
 * Get report templates by category.
 *
 * @param {string} category - The category to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report templates in the specified category.
 */
export function getTemplatesByCategory(category, role = ROLES.VIEWER) {
  if (!category || typeof category !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const templates = getReportTemplatesByCategory(category);

  return templates
    .filter((tmpl) => hasTemplateAccess(tmpl, role))
    .map((tmpl) => maskEntity(tmpl, role));
}

/**
 * Get report templates accessible by a specific role.
 *
 * @param {string} targetRole - The role to check access for.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report templates accessible by the target role.
 */
export function getTemplatesForRole(targetRole, role = ROLES.VIEWER) {
  if (!targetRole || typeof targetRole !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const templates = getReportTemplatesByRole(targetRole);

  return templates.map((tmpl) => maskEntity(tmpl, role));
}

/**
 * Get report templates that support a specific export format.
 *
 * @param {string} format - The export format to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report templates supporting the format.
 */
export function getTemplatesByFormat(format, role = ROLES.VIEWER) {
  if (!format || typeof format !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const templates = getReportTemplatesByFormat(format);

  return templates
    .filter((tmpl) => hasTemplateAccess(tmpl, role))
    .map((tmpl) => maskEntity(tmpl, role));
}

// ---------------------------------------------------------------------------
// Report Instance Operations
// ---------------------------------------------------------------------------

/**
 * Get all report instances with optional filtering, searching, sorting, and pagination.
 * Applies PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria (e.g., { status: 'completed', category: 'Quality Metrics' }).
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role for RBAC and PII masking.
 * @param {string} [options.userId] - The user ID for audit logging.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getReports(options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  const result = processData(reports, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'templateName', 'category', 'status', 'format'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((report) => maskEntity(report, role));

  return result;
}

/**
 * Get all report instances without pagination (simple list).
 * Applies PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report instance objects.
 */
export function getReportsList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  if (filters && Object.keys(filters).length > 0) {
    reports = applyFilters(reports, filters);
  }

  return reports.map((report) => maskEntity(report, role));
}

/**
 * Get a single report instance by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The report instance ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report instance object, or null if not found.
 */
export function getReportDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  let report = getById(REPORT_ENTITY_TYPE, id);

  if (!report) {
    report = getStaticReportInstanceById(id);
  }

  if (!report) {
    return null;
  }

  return maskEntity(report, role);
}

/**
 * Get a single report instance by ID (alias for getReportDetail).
 *
 * @param {string} id - The report instance ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report instance object, or null if not found.
 */
export function getReportById(id, role = ROLES.VIEWER) {
  return getReportDetail(id, role);
}

/**
 * Generate a report from a template with given filters.
 * Validates role permissions, template access, applies audit logging,
 * and returns the generated report instance.
 *
 * @param {string} templateId - The template ID to generate from.
 * @param {object} [filters={}] - The filters to apply.
 * @param {string} [format] - The export format. Uses template default if not specified.
 * @param {string} [userId='user-001'] - The user ID requesting the report.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The generated and masked report instance, or null if unauthorized.
 */
export function generateReport(templateId, filters = {}, format, userId = 'user-001', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'generate')) {
    console.warn('[ReportService] User does not have permission to generate reports.');
    return null;
  }

  if (!templateId || typeof templateId !== 'string') {
    console.warn('[ReportService] Template ID is required for report generation.');
    return null;
  }

  let template = getById(REPORT_TEMPLATE_ENTITY_TYPE, templateId);

  if (!template) {
    template = getStaticReportTemplateById(templateId);
  }

  if (!template) {
    console.warn(`[ReportService] Report template not found: ${templateId}`);
    return null;
  }

  if (!hasTemplateAccess(template, role)) {
    console.warn(`[ReportService] User role "${role}" does not have access to template "${templateId}".`);
    return null;
  }

  if (format && !isValidExportFormat(format)) {
    console.warn(`[ReportService] Invalid export format: ${format}. Must be one of: ${VALID_EXPORT_FORMATS.join(', ')}`);
    return null;
  }

  if (format && Array.isArray(template.supportedFormats) && template.supportedFormats.length > 0) {
    if (!template.supportedFormats.includes(format)) {
      console.warn(`[ReportService] Format "${format}" is not supported by template "${templateId}". Supported: ${template.supportedFormats.join(', ')}`);
      return null;
    }
  }

  const reportInstance = simulateReportGeneration(templateId, filters, format, userId);

  if (!reportInstance) {
    console.warn('[ReportService] Failed to generate report.');
    return null;
  }

  const created = create(REPORT_ENTITY_TYPE, reportInstance, userId);

  if (!created) {
    console.warn('[ReportService] Failed to persist generated report.');
    return null;
  }

  logAction(
    userId,
    'Generate Report',
    REPORT_ENTITY_TYPE,
    created.id,
    `Generated report "${created.name}" from template "${template.name}" in format "${created.format}".`,
  );

  return maskEntity(created, role);
}

/**
 * Export a report in a specific format.
 * Validates role permissions, applies PII masking for export, creates an export
 * history entry, and triggers the file download.
 *
 * @param {string} reportId - The report instance ID to export.
 * @param {string} [format='csv'] - The export format (csv, excel, pdf, powerpoint).
 * @param {string} [userId='user-001'] - The user ID performing the export.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The export result with file URL and masked fields, or null if unauthorized.
 */
export function exportReport(reportId, format = 'csv', userId = 'user-001', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'export')) {
    console.warn('[ReportService] User does not have permission to export reports.');
    return null;
  }

  if (!reportId || typeof reportId !== 'string') {
    console.warn('[ReportService] Report ID is required for export.');
    return null;
  }

  if (!isValidExportFormat(format)) {
    console.warn(`[ReportService] Invalid export format: ${format}. Must be one of: ${VALID_EXPORT_FORMATS.join(', ')}`);
    return null;
  }

  let report = getById(REPORT_ENTITY_TYPE, reportId);

  if (!report) {
    report = getStaticReportInstanceById(reportId);
  }

  if (!report) {
    console.warn(`[ReportService] Report not found: ${reportId}`);
    return null;
  }

  if (report.status !== 'completed') {
    console.warn(`[ReportService] Report "${reportId}" is not completed (status: ${report.status}). Cannot export.`);
    return null;
  }

  const exportEntry = simulateReportExport(reportId, format, userId, role);

  if (!exportEntry) {
    console.warn(`[ReportService] Failed to create export entry for report: ${reportId}`);
    return null;
  }

  const maskedReport = maskForExport(report);

  const exportFormat = format === 'excel' ? EXPORT_FORMATS.EXCEL
    : format === 'pdf' ? EXPORT_FORMATS.PDF
    : format === 'powerpoint' ? EXPORT_FORMATS.POWERPOINT
    : EXPORT_FORMATS.CSV;

  try {
    if (maskedReport && maskedReport.outputSummary) {
      const exportData = maskedReport.outputSummary;
      const filename = report.name
        ? report.name.toLowerCase().replace(/\s+/g, '-')
        : 'report-export';

      exportToFormat(exportData, filename, exportFormat);
    }
  } catch (err) {
    console.error('[ReportService] Error during file export:', err);
  }

  logAction(
    userId,
    'Export Report',
    REPORT_ENTITY_TYPE,
    reportId,
    `Exported report "${report.name || reportId}" in format "${format}". Masked fields: ${Array.isArray(exportEntry.maskedFields) ? exportEntry.maskedFields.join(', ') : 'none'}.`,
  );

  return {
    id: exportEntry.id,
    reportId: exportEntry.reportId,
    reportName: exportEntry.reportName,
    format: exportEntry.format,
    exportedBy: exportEntry.exportedBy,
    exportedAt: exportEntry.exportedAt,
    fileSizeBytes: exportEntry.fileSizeBytes,
    fileUrl: exportEntry.fileUrl,
    maskedFields: exportEntry.maskedFields,
    piiMaskingApplied: exportEntry.piiMaskingApplied,
    status: exportEntry.status,
  };
}

/**
 * Internal helper to dispatch export to the correct format function.
 * @param {object|Array<object>} data - The data to export.
 * @param {string} filename - The base filename.
 * @param {string} format - The export format constant.
 * @returns {boolean} True if export was successful.
 */
function exportToFormat(data, filename, format) {
  switch (format) {
    case EXPORT_FORMATS.CSV:
      return exportToCSV(data, filename);
    case EXPORT_FORMATS.EXCEL:
      return exportToExcel(data, filename);
    case EXPORT_FORMATS.PDF:
      return exportToPDF(data, filename);
    case EXPORT_FORMATS.POWERPOINT:
      return exportToPowerPoint(data, filename);
    default:
      return exportToCSV(data, filename);
  }
}

/**
 * Delete a report instance by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The report instance ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the report was deleted, false otherwise.
 */
export function deleteReport(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[ReportService] User does not have permission to delete reports.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReportService] Invalid report ID for delete.');
    return false;
  }

  const existing = getById(REPORT_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReportService] Report not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(REPORT_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Report', REPORT_ENTITY_TYPE, id, `Deleted report: ${existing.name || id}`);
  }

  return deleted;
}

// ---------------------------------------------------------------------------
// Report Schedule Operations
// ---------------------------------------------------------------------------

/**
 * Get all report schedules with optional filtering, searching, sorting, and pagination.
 * Applies PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria.
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getSchedules(options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let schedules = getAll(REPORT_SCHEDULE_ENTITY_TYPE);

  if (schedules.length === 0) {
    schedules = getAllReportSchedules();
  }

  const result = processData(schedules, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['name', 'templateName', 'schedule', 'format'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((sched) => maskEntity(sched, role));

  return result;
}

/**
 * Get all report schedules without pagination (simple list).
 * Applies PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report schedule objects.
 */
export function getSchedulesList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let schedules = getAll(REPORT_SCHEDULE_ENTITY_TYPE);

  if (schedules.length === 0) {
    schedules = getAllReportSchedules();
  }

  if (filters && Object.keys(filters).length > 0) {
    schedules = applyFilters(schedules, filters);
  }

  return schedules.map((sched) => maskEntity(sched, role));
}

/**
 * Get a single report schedule by ID.
 * Applies PII masking based on role.
 *
 * @param {string} id - The report schedule ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report schedule object, or null if not found.
 */
export function getScheduleDetail(id, role = ROLES.VIEWER) {
  if (!id || typeof id !== 'string') {
    return null;
  }

  if (!hasPermission(role, 'view')) {
    return null;
  }

  let schedule = getById(REPORT_SCHEDULE_ENTITY_TYPE, id);

  if (!schedule) {
    schedule = getStaticReportScheduleById(id);
  }

  if (!schedule) {
    return null;
  }

  return maskEntity(schedule, role);
}

/**
 * Get a single report schedule by ID (alias for getScheduleDetail).
 *
 * @param {string} id - The report schedule ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The masked report schedule object, or null if not found.
 */
export function getScheduleById(id, role = ROLES.VIEWER) {
  return getScheduleDetail(id, role);
}

/**
 * Create a new report schedule.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {object} data - The report schedule data to create.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The created and masked report schedule, or null if unauthorized.
 */
export function createSchedule(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    console.warn('[ReportService] User does not have permission to create report schedules.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[ReportService] Invalid report schedule data for create.');
    return null;
  }

  const now = new Date().toISOString();

  const scheduleData = {
    ...data,
    id: data.id || `sched-${uuidv4().slice(0, 8)}`,
    enabled: data.enabled !== false,
    lastRun: data.lastRun || null,
    lastRunStatus: data.lastRunStatus || null,
    lastReportId: data.lastReportId || null,
    nextRun: data.nextRun || null,
    runHistory: data.runHistory || [],
    tags: data.tags || [],
    created_at: data.created_at || now,
    updated_at: now,
    created_by: userId,
    updated_by: userId,
    version: 1,
  };

  const created = create(REPORT_SCHEDULE_ENTITY_TYPE, scheduleData, userId);

  if (!created) {
    console.warn('[ReportService] Failed to create report schedule.');
    return null;
  }

  logAction(userId, 'Create Report Schedule', REPORT_SCHEDULE_ENTITY_TYPE, created.id, `Created report schedule: ${created.name || created.id}`);

  return maskEntity(created, role);
}

/**
 * Update an existing report schedule by ID.
 * Validates role permissions, applies audit logging, and returns the masked entity.
 *
 * @param {string} id - The report schedule ID to update.
 * @param {object} data - The fields to update.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked report schedule, or null if unauthorized or not found.
 */
export function updateSchedule(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    console.warn('[ReportService] User does not have permission to update report schedules.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReportService] Invalid report schedule ID for update.');
    return null;
  }

  if (!data || typeof data !== 'object') {
    console.warn('[ReportService] Invalid update data.');
    return null;
  }

  const existing = getById(REPORT_SCHEDULE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReportService] Report schedule not found: ${id}`);
    return null;
  }

  const updates = { ...data };

  const updated = update(REPORT_SCHEDULE_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[ReportService] Failed to update report schedule: ${id}`);
    return null;
  }

  const changedFields = Object.keys(data).join(', ');
  logAction(userId, 'Update Report Schedule', REPORT_SCHEDULE_ENTITY_TYPE, id, `Updated fields: ${changedFields}`);

  return maskEntity(updated, role);
}

/**
 * Delete a report schedule by ID.
 * Validates role permissions and applies audit logging.
 *
 * @param {string} id - The report schedule ID to delete.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {boolean} True if the report schedule was deleted, false otherwise.
 */
export function deleteSchedule(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    console.warn('[ReportService] User does not have permission to delete report schedules.');
    return false;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReportService] Invalid report schedule ID for delete.');
    return false;
  }

  const existing = getById(REPORT_SCHEDULE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReportService] Report schedule not found for deletion: ${id}`);
    return false;
  }

  const deleted = remove(REPORT_SCHEDULE_ENTITY_TYPE, id);

  if (deleted) {
    logAction(userId, 'Delete Report Schedule', REPORT_SCHEDULE_ENTITY_TYPE, id, `Deleted report schedule: ${existing.name || id}`);
  }

  return deleted;
}

/**
 * Enable or disable a report schedule.
 *
 * @param {string} id - The report schedule ID.
 * @param {boolean} enabled - Whether the schedule should be enabled.
 * @param {string} [userId='system'] - The user ID performing the action.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object|null} The updated and masked report schedule, or null if unauthorized or not found.
 */
export function toggleSchedule(id, enabled, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    console.warn('[ReportService] User does not have permission to toggle report schedules.');
    return null;
  }

  if (!id || typeof id !== 'string') {
    console.warn('[ReportService] Invalid report schedule ID for toggle.');
    return null;
  }

  const existing = getById(REPORT_SCHEDULE_ENTITY_TYPE, id);

  if (!existing) {
    console.warn(`[ReportService] Report schedule not found: ${id}`);
    return null;
  }

  const updates = {
    enabled: enabled !== false,
  };

  if (!updates.enabled) {
    updates.nextRun = null;
  }

  const updated = update(REPORT_SCHEDULE_ENTITY_TYPE, id, updates, userId);

  if (!updated) {
    console.warn(`[ReportService] Failed to toggle report schedule: ${id}`);
    return null;
  }

  const action = updates.enabled ? 'Enable' : 'Disable';
  logAction(userId, `${action} Report Schedule`, REPORT_SCHEDULE_ENTITY_TYPE, id, `${action}d report schedule: ${existing.name || id}`);

  return maskEntity(updated, role);
}

// ---------------------------------------------------------------------------
// Export History Operations
// ---------------------------------------------------------------------------

/**
 * Get all report export history entries with optional filtering, searching, sorting, and pagination.
 * Applies PII masking.
 *
 * @param {object} [options={}] - Query options.
 * @param {object} [options.filters] - Filter criteria.
 * @param {string} [options.query] - Search query string.
 * @param {Array<string>} [options.searchFields] - Fields to search within.
 * @param {string} [options.sortKey] - Field to sort by.
 * @param {string} [options.sortDirection='asc'] - Sort direction.
 * @param {number} [options.page=1] - Page number.
 * @param {number} [options.pageSize=25] - Items per page.
 * @param {string} [options.role='viewer'] - The current user's role.
 * @returns {object} Result object with items, pagination, and filteredTotal.
 */
export function getExportHistory(options = {}) {
  const role = options.role || ROLES.VIEWER;

  if (!hasPermission(role, 'view')) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 25,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let history = getAll(REPORT_EXPORT_HISTORY_ENTITY_TYPE);

  if (history.length === 0) {
    history = getAllReportExportHistory();
  }

  const result = processData(history, {
    filters: options.filters,
    query: options.query,
    searchFields: options.searchFields || ['reportName', 'format', 'status', 'userRole'],
    sortKey: options.sortKey,
    sortDirection: options.sortDirection,
    page: options.page,
    pageSize: options.pageSize,
  });

  result.items = result.items.map((entry) => maskEntity(entry, role));

  return result;
}

/**
 * Get all export history entries without pagination (simple list).
 * Applies PII masking.
 *
 * @param {object} [filters={}] - Filter criteria.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked export history objects.
 */
export function getExportHistoryList(filters = {}, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  let history = getAll(REPORT_EXPORT_HISTORY_ENTITY_TYPE);

  if (history.length === 0) {
    history = getAllReportExportHistory();
  }

  if (filters && Object.keys(filters).length > 0) {
    history = applyFilters(history, filters);
  }

  return history.map((entry) => maskEntity(entry, role));
}

/**
 * Get export history entries for a specific report.
 *
 * @param {string} reportId - The report ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked export history entries for the report.
 */
export function getExportHistoryForReport(reportId, role = ROLES.VIEWER) {
  if (!reportId || typeof reportId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const entries = getReportExportsByReportId(reportId);

  return entries.map((entry) => maskEntity(entry, role));
}

/**
 * Get export history entries for a specific user.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked export history entries for the user.
 */
export function getExportHistoryForUser(userId, role = ROLES.VIEWER) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const entries = getReportExportsByUser(userId);

  return entries.map((entry) => maskEntity(entry, role));
}

// ---------------------------------------------------------------------------
// Grouped & Count Operations
// ---------------------------------------------------------------------------

/**
 * Get reports grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and arrays of masked reports.
 */
export function getReportsByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  const grouped = {};

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const status = report.status || 'unknown';

    if (!grouped[status]) {
      grouped[status] = [];
    }

    grouped[status].push(maskEntity(report, role));
  }

  return grouped;
}

/**
 * Get reports grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with category keys and arrays of masked reports.
 */
export function getReportsByCategory(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  const grouped = {};

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const category = report.category || 'Unknown';

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category].push(maskEntity(report, role));
  }

  return grouped;
}

/**
 * Get reports grouped by format.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with format keys and arrays of masked reports.
 */
export function getReportsByFormat(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  const grouped = {};

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const format = report.format || 'unknown';

    if (!grouped[format]) {
      grouped[format] = [];
    }

    grouped[format].push(maskEntity(report, role));
  }

  return grouped;
}

/**
 * Get report count grouped by status.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with status keys and count values.
 */
export function getReportCountByStatus(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getReportInstanceCountByStatus();
}

/**
 * Get report count grouped by category.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with category keys and count values.
 */
export function getReportCountByCategory(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getReportInstanceCountByCategory();
}

/**
 * Get report count grouped by format.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with format keys and count values.
 */
export function getReportCountByFormat(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getReportInstanceCountByFormat();
}

/**
 * Get export count grouped by format.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with format keys and count values.
 */
export function getExportCountByFormat(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getReportExportCountByFormat();
}

/**
 * Get export count grouped by user role.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with role keys and count values.
 */
export function getExportCountByRole(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {};
  }

  return getReportExportCountByRole();
}

// ---------------------------------------------------------------------------
// Filtered Accessors
// ---------------------------------------------------------------------------

/**
 * Get reports for a specific template.
 *
 * @param {string} templateId - The template ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked reports for the template.
 */
export function getReportsForTemplate(templateId, role = ROLES.VIEWER) {
  if (!templateId || typeof templateId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const reports = getReportInstancesByTemplateId(templateId);

  return reports.map((report) => maskEntity(report, role));
}

/**
 * Get reports requested by a specific user.
 *
 * @param {string} userId - The user ID to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked reports requested by the user.
 */
export function getReportsForUser(userId, role = ROLES.VIEWER) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const reports = getReportInstancesByRequestedBy(userId);

  return reports.map((report) => maskEntity(report, role));
}

/**
 * Get recent report instances sorted by generation date descending.
 *
 * @param {number} [limit=10] - Maximum number of reports to return.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked recent report instances.
 */
export function getRecentReports(limit = 10, role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const recent = getRecentReportInstances(limit);

  return recent.map((report) => maskEntity(report, role));
}

/**
 * Get enabled report schedules.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked enabled report schedules.
 */
export function getEnabledSchedules(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return [];
  }

  const schedules = getEnabledReportSchedules();

  return schedules.map((sched) => maskEntity(sched, role));
}

/**
 * Get report schedules by frequency.
 *
 * @param {string} frequency - The schedule frequency to filter by.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report schedules with the specified frequency.
 */
export function getSchedulesByFrequency(frequency, role = ROLES.VIEWER) {
  if (!frequency || typeof frequency !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const schedules = getReportSchedulesByFrequency(frequency);

  return schedules.map((sched) => maskEntity(sched, role));
}

/**
 * Get report schedules owned by a specific user.
 *
 * @param {string} ownerId - The owner user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of masked report schedules owned by the user.
 */
export function getSchedulesForOwner(ownerId, role = ROLES.VIEWER) {
  if (!ownerId || typeof ownerId !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const schedules = getReportSchedulesByOwner(ownerId);

  return schedules.map((sched) => maskEntity(sched, role));
}

// ---------------------------------------------------------------------------
// Distinct Values & Filter Options
// ---------------------------------------------------------------------------

/**
 * Get distinct values for a specific field across all report instances.
 *
 * @param {string} field - The field name to extract distinct values from.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<*>} Array of distinct values, sorted.
 */
export function getDistinctValues(field, role = ROLES.VIEWER) {
  if (!field || typeof field !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  let reports = getAll(REPORT_ENTITY_TYPE);

  if (reports.length === 0) {
    reports = getAllReportInstances();
  }

  const values = new Set();

  for (let i = 0; i < reports.length; i++) {
    const value = reports[i][field];
    if (value !== null && value !== undefined) {
      values.add(value);
    }
  }

  return [...values].sort();
}

/**
 * Get distinct filter options for report screens.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Object with arrays of distinct values for each filter dimension.
 */
export function getReportFilterOptions(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      statuses: [],
      categories: [],
      formats: [],
      templateCategories: [],
    };
  }

  return {
    statuses: getDistinctReportStatuses(),
    categories: getDistinctReportCategories(),
    formats: getDistinctReportFormats(),
    templateCategories: getDistinctTemplateCategories(),
  };
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Search report instances by name (case-insensitive partial match).
 *
 * @param {string} query - The search query.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {Array<object>} Array of matching masked report instances.
 */
export function searchReports(query, role = ROLES.VIEWER) {
  if (!query || typeof query !== 'string') {
    return [];
  }

  if (!hasPermission(role, 'view')) {
    return [];
  }

  const results = searchReportInstances(query);

  return results.map((report) => maskEntity(report, role));
}

// ---------------------------------------------------------------------------
// Summary & Metrics
// ---------------------------------------------------------------------------

/**
 * Get the average report generation duration across all completed reports.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} The average generation duration in milliseconds, or 0 if no completed reports exist.
 */
export function getAvgGenerationDuration(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  return getAverageGenerationDuration();
}

/**
 * Get the total file size of all completed report exports.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {number} Total file size in bytes.
 */
export function getTotalExportSize(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return 0;
  }

  return getTotalExportFileSize();
}

/**
 * Get a comprehensive summary of reporting metrics for dashboard display.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Summary object with reporting metrics.
 */
export function getReportSummary(role = ROLES.VIEWER) {
  if (!hasPermission(role, 'view')) {
    return {
      totalTemplates: 0,
      totalInstances: 0,
      completed: 0,
      inProgress: 0,
      failed: 0,
      totalSchedules: 0,
      enabledSchedules: 0,
      disabledSchedules: 0,
      totalExports: 0,
      averageGenerationDurationMs: 0,
      totalFileSizeBytes: 0,
      totalFileSizeMB: 0,
      exportFormatCounts: {},
    };
  }

  return getReportingSummary();
}

// ---------------------------------------------------------------------------
// Simulated API Layer
// ---------------------------------------------------------------------------

/**
 * Simulate an API GET request for report instances.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetReports(params = {}, role = ROLES.VIEWER) {
  try {
    const result = getReports({ ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[ReportService] apiGetReports error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for a single report instance.
 *
 * @param {string} id - The report instance ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetReport(id, role = ROLES.VIEWER) {
  try {
    const report = getReportDetail(id, role);

    if (!report) {
      return {
        status: 404,
        error: `Report with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: report,
    };
  } catch (err) {
    console.error(`[ReportService] apiGetReport error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to generate a report.
 *
 * @param {string} templateId - The template ID.
 * @param {object} [filters={}] - The filters to apply.
 * @param {string} [format] - The export format.
 * @param {string} [userId='user-001'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGenerateReport(templateId, filters = {}, format, userId = 'user-001', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'generate')) {
      return {
        status: 403,
        error: 'You do not have permission to generate reports.',
        data: null,
      };
    }

    const result = generateReport(templateId, filters, format, userId, role);

    if (!result) {
      return {
        status: 400,
        error: 'Failed to generate report. Check template ID, format, and permissions.',
        data: null,
      };
    }

    return {
      status: 201,
      data: result,
    };
  } catch (err) {
    console.error('[ReportService] apiGenerateReport error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to export a report.
 *
 * @param {string} reportId - The report instance ID.
 * @param {string} [format='csv'] - The export format.
 * @param {string} [userId='user-001'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiExportReport(reportId, format = 'csv', userId = 'user-001', role = ROLES.VIEWER) {
  try {
    if (!hasPermission(role, 'export')) {
      return {
        status: 403,
        error: 'You do not have permission to export reports.',
        data: null,
      };
    }

    const result = exportReport(reportId, format, userId, role);

    if (!result) {
      return {
        status: 400,
        error: 'Failed to export report. Check report ID, format, and report status.',
        data: null,
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (err) {
    console.error('[ReportService] apiExportReport error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API DELETE request to delete a report.
 *
 * @param {string} id - The report instance ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteReport(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete reports.',
    };
  }

  const deleted = deleteReport(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Report with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Report '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API GET request for report templates.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetTemplates(params = {}, role = ROLES.VIEWER) {
  try {
    const result = getTemplates({ ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[ReportService] apiGetTemplates error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for a single report template.
 *
 * @param {string} id - The report template ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetTemplate(id, role = ROLES.VIEWER) {
  try {
    const template = getTemplateDetail(id, role);

    if (!template) {
      return {
        status: 404,
        error: `Report template with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: template,
    };
  } catch (err) {
    console.error(`[ReportService] apiGetTemplate error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API GET request for report schedules.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetSchedules(params = {}, role = ROLES.VIEWER) {
  try {
    const result = getSchedules({ ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[ReportService] apiGetSchedules error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for a single report schedule.
 *
 * @param {string} id - The report schedule ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetSchedule(id, role = ROLES.VIEWER) {
  try {
    const schedule = getScheduleDetail(id, role);

    if (!schedule) {
      return {
        status: 404,
        error: `Report schedule with id '${id}' not found`,
        data: null,
      };
    }

    return {
      status: 200,
      data: schedule,
    };
  } catch (err) {
    console.error(`[ReportService] apiGetSchedule error for ${id}:`, err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}

/**
 * Simulate an API POST request to create a report schedule.
 *
 * @param {object} data - The report schedule data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiCreateSchedule(data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    return {
      status: 403,
      error: 'You do not have permission to create report schedules.',
      data: null,
    };
  }

  const created = createSchedule(data, userId, role);

  if (!created) {
    return {
      status: 400,
      error: 'Failed to create report schedule.',
      data: null,
    };
  }

  return {
    status: 201,
    data: created,
  };
}

/**
 * Simulate an API PUT request to update a report schedule.
 *
 * @param {string} id - The report schedule ID.
 * @param {object} data - The update data.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiUpdateSchedule(id, data, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    return {
      status: 403,
      error: 'You do not have permission to update report schedules.',
      data: null,
    };
  }

  const updated = updateSchedule(id, data, userId, role);

  if (!updated) {
    return {
      status: 404,
      error: `Report schedule with id '${id}' not found or update failed.`,
      data: null,
    };
  }

  return {
    status: 200,
    data: updated,
  };
}

/**
 * Simulate an API DELETE request to delete a report schedule.
 *
 * @param {string} id - The report schedule ID.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiDeleteSchedule(id, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'delete')) {
    return {
      status: 403,
      error: 'You do not have permission to delete report schedules.',
    };
  }

  const deleted = deleteSchedule(id, userId, role);

  if (!deleted) {
    return {
      status: 404,
      error: `Report schedule with id '${id}' not found.`,
    };
  }

  return {
    status: 200,
    message: `Report schedule '${id}' deleted successfully.`,
  };
}

/**
 * Simulate an API POST request to toggle a report schedule.
 *
 * @param {string} id - The report schedule ID.
 * @param {boolean} enabled - Whether the schedule should be enabled.
 * @param {string} [userId='system'] - The user ID.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiToggleSchedule(id, enabled, userId = 'system', role = ROLES.VIEWER) {
  if (!hasPermission(role, 'manage_schedules')) {
    return {
      status: 403,
      error: 'You do not have permission to toggle report schedules.',
      data: null,
    };
  }

  const result = toggleSchedule(id, enabled, userId, role);

  if (!result) {
    return {
      status: 400,
      error: 'Failed to toggle report schedule. Check schedule ID.',
      data: null,
    };
  }

  return {
    status: 200,
    data: result,
  };
}

/**
 * Simulate an API GET request for export history.
 *
 * @param {object} [params={}] - Query parameters.
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetExportHistory(params = {}, role = ROLES.VIEWER) {
  try {
    const result = getExportHistory({ ...params, role });

    return {
      status: 200,
      data: result.items,
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      },
    };
  } catch (err) {
    console.error('[ReportService] apiGetExportHistory error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: [],
      pagination: {
        page: 1,
        pageSize: 25,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simulate an API GET request for reporting summary.
 *
 * @param {string} [role='viewer'] - The current user's role.
 * @returns {object} Simulated API response.
 */
export function apiGetReportSummary(role = ROLES.VIEWER) {
  try {
    const summary = getReportSummary(role);

    return {
      status: 200,
      data: summary,
    };
  } catch (err) {
    console.error('[ReportService] apiGetReportSummary error:', err);
    return {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
  }
}