/**
 * @module dateUtils
 * Date formatting and calculation utility for eQIP Quality Intelligence.
 * Provides date formatting, relative date calculations, date ranges, and range checks.
 */

/**
 * Format a date value as a locale-friendly date string (e.g., "Jan 15, 2024").
 * @param {string|Date|number} date - The date to format (ISO string, Date object, or timestamp).
 * @param {object} [options] - Intl.DateTimeFormat options override.
 * @returns {string} The formatted date string, or '—' if invalid.
 */
export function formatDate(date, options = {}) {
  if (date === null || date === undefined) {
    return '—';
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      return '—';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    return d.toLocaleDateString('en-US', defaultOptions);
  } catch (_err) {
    return '—';
  }
}

/**
 * Format a date value as a locale-friendly date-time string (e.g., "Jan 15, 2024, 2:30 PM").
 * @param {string|Date|number} date - The date to format (ISO string, Date object, or timestamp).
 * @param {object} [options] - Intl.DateTimeFormat options override.
 * @returns {string} The formatted date-time string, or '—' if invalid.
 */
export function formatDateTime(date, options = {}) {
  if (date === null || date === undefined) {
    return '—';
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      return '—';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      ...options,
    };

    return d.toLocaleDateString('en-US', defaultOptions);
  } catch (_err) {
    return '—';
  }
}

/**
 * Get a human-readable relative date string (e.g., "3 days ago", "in 2 hours").
 * @param {string|Date|number} date - The date to compare against now.
 * @returns {string} A relative date string, or '—' if invalid.
 */
export function getRelativeDate(date) {
  if (date === null || date === undefined) {
    return '—';
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      return '—';
    }

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const absDiffMs = Math.abs(diffMs);
    const isPast = diffMs > 0;

    const seconds = Math.floor(absDiffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    /** @param {number} value @param {string} unit @returns {string} */
    function formatRelative(value, unit) {
      const plural = value === 1 ? '' : 's';
      if (isPast) {
        return `${value} ${unit}${plural} ago`;
      }
      return `in ${value} ${unit}${plural}`;
    }

    if (seconds < 60) {
      return isPast ? 'just now' : 'in a moment';
    }
    if (minutes < 60) {
      return formatRelative(minutes, 'minute');
    }
    if (hours < 24) {
      return formatRelative(hours, 'hour');
    }
    if (days < 7) {
      return formatRelative(days, 'day');
    }
    if (weeks < 5) {
      return formatRelative(weeks, 'week');
    }
    if (months < 12) {
      return formatRelative(months, 'month');
    }
    return formatRelative(years, 'year');
  } catch (_err) {
    return '—';
  }
}

/**
 * Generate a date range object with start and end dates relative to the current date.
 * Supports named presets and custom day offsets.
 *
 * @param {string|number} range - A preset name ('today', 'last7', 'last30', 'last90', 'thisMonth',
 *   'lastMonth', 'thisQuarter', 'thisYear') or a number of days to look back.
 * @returns {{ start: Date, end: Date }} An object with start and end Date instances.
 */
export function getDateRange(range) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (typeof range === 'number') {
    const start = new Date(now);
    start.setDate(start.getDate() - Math.abs(range));
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  switch (range) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return { start, end };
    }
    case 'last7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'last30': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'last90': {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start, end };
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const monthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end: monthEnd };
    }
    case 'thisQuarter': {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
      return { start, end };
    }
    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { start, end };
    }
    default: {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
  }
}

/**
 * Check whether a given date falls within a specified range (inclusive).
 *
 * @param {string|Date|number} date - The date to check.
 * @param {string|Date|number} rangeStart - The start of the range.
 * @param {string|Date|number} rangeEnd - The end of the range.
 * @returns {boolean} True if the date is within the range (inclusive), false otherwise or if any date is invalid.
 */
export function isWithinRange(date, rangeStart, rangeEnd) {
  if (date === null || date === undefined || rangeStart === null || rangeStart === undefined || rangeEnd === null || rangeEnd === undefined) {
    return false;
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    const start = rangeStart instanceof Date ? rangeStart : new Date(rangeStart);
    const end = rangeEnd instanceof Date ? rangeEnd : new Date(rangeEnd);

    if (isNaN(d.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
  } catch (_err) {
    return false;
  }
}

/**
 * Generate an ISO date string relative to the current date.
 * Positive values go into the past, negative values go into the future.
 *
 * @param {number} days - Number of days relative to today (positive = past, negative = future).
 * @returns {string} ISO8601 date string.
 */
export function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/**
 * Calculate the number of days between two dates.
 *
 * @param {string|Date|number} dateA - The first date.
 * @param {string|Date|number} dateB - The second date.
 * @returns {number} The absolute number of whole days between the two dates, or -1 if invalid.
 */
export function daysBetween(dateA, dateB) {
  if (dateA === null || dateA === undefined || dateB === null || dateB === undefined) {
    return -1;
  }

  try {
    const a = dateA instanceof Date ? dateA : new Date(dateA);
    const b = dateB instanceof Date ? dateB : new Date(dateB);

    if (isNaN(a.getTime()) || isNaN(b.getTime())) {
      return -1;
    }

    const diffMs = Math.abs(a.getTime() - b.getTime());
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (_err) {
    return -1;
  }
}

/**
 * Parse a date value into a Date object safely.
 *
 * @param {string|Date|number|null|undefined} value - The value to parse.
 * @returns {Date|null} A valid Date object, or null if parsing fails.
 */
export function parseDate(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  try {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch (_err) {
    return null;
  }
}

/**
 * Format a date as an ISO date string (YYYY-MM-DD) without time component.
 *
 * @param {string|Date|number} date - The date to format.
 * @returns {string} The ISO date string (YYYY-MM-DD), or '' if invalid.
 */
export function toISODateString(date) {
  if (date === null || date === undefined) {
    return '';
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) {
      return '';
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (_err) {
    return '';
  }
}