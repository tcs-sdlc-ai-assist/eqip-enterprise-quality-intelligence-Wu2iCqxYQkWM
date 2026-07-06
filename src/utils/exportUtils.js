import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { maskForExport } from './piiMasker.js';

/**
 * @module exportUtils
 * Data export utility for eQIP Quality Intelligence.
 * Provides CSV, Excel (CSV-based), PDF, and PowerPoint export with PII masking.
 */

/**
 * Flatten a nested object into a single-level object with dot-notation keys.
 * Arrays are joined with semicolons.
 * @param {object} obj - The object to flatten.
 * @param {string} [prefix=''] - Key prefix for recursion.
 * @returns {object} A flat key-value object.
 */
function flattenObject(obj, prefix = '') {
  const result = {};

  if (!obj || typeof obj !== 'object') {
    return result;
  }

  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      result[fullKey] = value
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return JSON.stringify(item);
          }
          return String(item);
        })
        .join('; ');
    } else if (typeof value === 'object' && value !== null) {
      const nested = flattenObject(value, fullKey);
      Object.assign(result, nested);
    } else if (value === null || value === undefined) {
      result[fullKey] = '';
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Normalize data into an array of flat objects suitable for tabular export.
 * Applies PII masking before flattening.
 * @param {object|Array<object>} data - The data to normalize.
 * @returns {Array<object>} Array of flat objects.
 */
function normalizeData(data) {
  if (!data) {
    return [];
  }

  const masked = maskForExport(data);

  const items = Array.isArray(masked) ? masked : [masked];

  return items.map((item) => {
    if (typeof item !== 'object' || item === null) {
      return { value: item };
    }
    return flattenObject(item);
  });
}

/**
 * Generate a timestamped filename with the given base name and extension.
 * @param {string} filename - The base filename (without extension).
 * @param {string} extension - The file extension (e.g., 'csv', 'xlsx').
 * @returns {string} The formatted filename.
 */
function generateFilename(filename, extension) {
  const baseName = filename || 'export';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}.${extension}`;
}

/**
 * Export data to CSV format and trigger a file download.
 * Applies PII masking via maskForExport before generating the CSV.
 *
 * @param {object|Array<object>} data - The data to export.
 * @param {string} [filename='export'] - The base filename (without extension).
 * @returns {boolean} True if the export was successful, false otherwise.
 */
export function exportToCSV(data, filename = 'export') {
  try {
    const normalizedData = normalizeData(data);

    if (normalizedData.length === 0) {
      console.warn('[exportUtils] No data to export.');
      return false;
    }

    const csv = Papa.unparse(normalizedData, {
      quotes: true,
      delimiter: ',',
      header: true,
      newline: '\r\n',
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const outputFilename = generateFilename(filename, 'csv');
    saveAs(blob, outputFilename);

    return true;
  } catch (err) {
    console.error('[exportUtils] Error exporting to CSV:', err);
    return false;
  }
}

/**
 * Export data to Excel-compatible CSV format and trigger a file download.
 * Uses CSV format with .xlsx extension for basic Excel compatibility.
 * Applies PII masking via maskForExport before generating the file.
 *
 * @param {object|Array<object>} data - The data to export.
 * @param {string} [filename='export'] - The base filename (without extension).
 * @returns {boolean} True if the export was successful, false otherwise.
 */
export function exportToExcel(data, filename = 'export') {
  try {
    const normalizedData = normalizeData(data);

    if (normalizedData.length === 0) {
      console.warn('[exportUtils] No data to export.');
      return false;
    }

    const BOM = '\uFEFF';
    const csv = Papa.unparse(normalizedData, {
      quotes: true,
      delimiter: ',',
      header: true,
      newline: '\r\n',
    });

    const blob = new Blob([BOM + csv], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const outputFilename = generateFilename(filename, 'xlsx');
    saveAs(blob, outputFilename);

    return true;
  } catch (err) {
    console.error('[exportUtils] Error exporting to Excel:', err);
    return false;
  }
}

/**
 * Export data as a placeholder PDF file download.
 * Generates a text-based placeholder since full PDF generation
 * is not available without additional dependencies.
 * Applies PII masking via maskForExport before generating the file.
 *
 * @param {object|Array<object>} data - The data to export.
 * @param {string} [filename='export'] - The base filename (without extension).
 * @returns {boolean} True if the export was successful, false otherwise.
 */
export function exportToPDF(data, filename = 'export') {
  try {
    const masked = maskForExport(data);
    const items = Array.isArray(masked) ? masked : [masked];

    if (items.length === 0) {
      console.warn('[exportUtils] No data to export.');
      return false;
    }

    const lines = [
      'eQIP Quality Intelligence - Export Report',
      '==========================================',
      `Generated: ${new Date().toISOString()}`,
      `Records: ${items.length}`,
      '',
      'NOTE: This is a placeholder text export. Full PDF generation requires additional dependencies.',
      '',
      '---',
      '',
    ];

    for (let i = 0; i < items.length; i++) {
      lines.push(`Record ${i + 1}:`);
      const flat = flattenObject(items[i]);
      const keys = Object.keys(flat);
      for (let j = 0; j < keys.length; j++) {
        lines.push(`  ${keys[j]}: ${flat[keys[j]]}`);
      }
      lines.push('');
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const outputFilename = generateFilename(filename, 'pdf.txt');
    saveAs(blob, outputFilename);

    return true;
  } catch (err) {
    console.error('[exportUtils] Error exporting to PDF:', err);
    return false;
  }
}

/**
 * Export data as a placeholder PowerPoint file download.
 * Generates a text-based placeholder since full PPTX generation
 * is not available without additional dependencies.
 * Applies PII masking via maskForExport before generating the file.
 *
 * @param {object|Array<object>} data - The data to export.
 * @param {string} [filename='export'] - The base filename (without extension).
 * @returns {boolean} True if the export was successful, false otherwise.
 */
export function exportToPowerPoint(data, filename = 'export') {
  try {
    const masked = maskForExport(data);
    const items = Array.isArray(masked) ? masked : [masked];

    if (items.length === 0) {
      console.warn('[exportUtils] No data to export.');
      return false;
    }

    const lines = [
      '========================================',
      'eQIP Quality Intelligence',
      'Presentation Export',
      '========================================',
      '',
      `Date: ${new Date().toISOString()}`,
      `Total Records: ${items.length}`,
      '',
      'NOTE: This is a placeholder text export. Full PowerPoint generation requires additional dependencies.',
      '',
    ];

    for (let i = 0; i < items.length; i++) {
      lines.push('----------------------------------------');
      lines.push(`Slide ${i + 1}`);
      lines.push('----------------------------------------');
      const flat = flattenObject(items[i]);
      const keys = Object.keys(flat);
      for (let j = 0; j < keys.length; j++) {
        lines.push(`  ${keys[j]}: ${flat[keys[j]]}`);
      }
      lines.push('');
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const outputFilename = generateFilename(filename, 'pptx.txt');
    saveAs(blob, outputFilename);

    return true;
  } catch (err) {
    console.error('[exportUtils] Error exporting to PowerPoint:', err);
    return false;
  }
}

/**
 * Supported export format identifiers.
 * @type {Readonly<{CSV: string, EXCEL: string, PDF: string, POWERPOINT: string}>}
 */
export const EXPORT_FORMATS = Object.freeze({
  CSV: 'csv',
  EXCEL: 'excel',
  PDF: 'pdf',
  POWERPOINT: 'powerpoint',
});

/**
 * Export data in the specified format.
 * Dispatches to the appropriate export function based on the format parameter.
 *
 * @param {object|Array<object>} data - The data to export.
 * @param {string} [filename='export'] - The base filename (without extension).
 * @param {string} [format='csv'] - The export format (csv, excel, pdf, powerpoint).
 * @returns {boolean} True if the export was successful, false otherwise.
 */
export function exportData(data, filename = 'export', format = EXPORT_FORMATS.CSV) {
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
      console.warn(`[exportUtils] Unsupported export format: ${format}. Falling back to CSV.`);
      return exportToCSV(data, filename);
  }
}