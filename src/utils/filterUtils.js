/**
 * @module filterUtils
 * Generic filtering, search, sorting, and pagination utilities for eQIP Quality Intelligence.
 * Used across all list and dashboard screens.
 */

/**
 * Apply a set of filters to a data array.
 * Each filter key corresponds to a field on the data objects.
 * Supports exact match, array inclusion, and function predicates.
 *
 * @param {Array<object>} data - The array of objects to filter.
 * @param {object} [filters={}] - An object where keys are field names and values are filter criteria.
 *   - If the filter value is a function, it is called with (fieldValue, item) and must return boolean.
 *   - If the filter value is an array, the field value must be included in the array.
 *   - If the filter value is a string, a case-insensitive partial match is performed.
 *   - If the filter value is a number or boolean, an exact match is performed.
 *   - If the filter value is null or undefined, the filter is skipped.
 * @returns {Array<object>} The filtered array.
 */
export function applyFilters(data, filters = {}) {
  if (!Array.isArray(data)) {
    return [];
  }

  const filterKeys = Object.keys(filters);

  if (filterKeys.length === 0) {
    return [...data];
  }

  return data.filter((item) => {
    for (let i = 0; i < filterKeys.length; i++) {
      const key = filterKeys[i];
      const filterValue = filters[key];

      if (filterValue === null || filterValue === undefined) {
        continue;
      }

      const fieldValue = getNestedValue(item, key);

      if (typeof filterValue === 'function') {
        if (!filterValue(fieldValue, item)) {
          return false;
        }
        continue;
      }

      if (Array.isArray(filterValue)) {
        if (filterValue.length === 0) {
          continue;
        }
        if (!filterValue.includes(fieldValue)) {
          return false;
        }
        continue;
      }

      if (typeof filterValue === 'string') {
        if (filterValue === '') {
          continue;
        }
        const fieldStr = fieldValue === null || fieldValue === undefined ? '' : String(fieldValue);
        if (!fieldStr.toLowerCase().includes(filterValue.toLowerCase())) {
          return false;
        }
        continue;
      }

      if (typeof filterValue === 'number' || typeof filterValue === 'boolean') {
        if (fieldValue !== filterValue) {
          return false;
        }
        continue;
      }
    }

    return true;
  });
}

/**
 * Search an array of objects by a text query across specified fields.
 * Performs case-insensitive partial matching on each specified field.
 *
 * @param {Array<object>} data - The array of objects to search.
 * @param {string} query - The search query string.
 * @param {Array<string>} [fields=[]] - The field names to search within.
 *   Supports dot-notation for nested fields (e.g., 'address.city').
 *   If empty, all string fields at the top level are searched.
 * @returns {Array<object>} The matching objects.
 */
export function searchByText(data, query, fields = []) {
  if (!Array.isArray(data)) {
    return [];
  }

  if (!query || typeof query !== 'string' || query.trim() === '') {
    return [...data];
  }

  const queryLower = query.trim().toLowerCase();

  return data.filter((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const searchFields = fields.length > 0 ? fields : Object.keys(item);

    for (let i = 0; i < searchFields.length; i++) {
      const field = searchFields[i];
      const value = getNestedValue(item, field);

      if (value === null || value === undefined) {
        continue;
      }

      const strValue = String(value).toLowerCase();

      if (strValue.includes(queryLower)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Sort an array of objects by a specified key and direction.
 * Supports string, number, date, and boolean comparisons.
 * Supports dot-notation for nested fields.
 *
 * @param {Array<object>} data - The array of objects to sort.
 * @param {string} sortKey - The field name to sort by (supports dot-notation).
 * @param {string} [direction='asc'] - The sort direction: 'asc' or 'desc'.
 * @returns {Array<object>} A new sorted array.
 */
export function sortData(data, sortKey, direction = 'asc') {
  if (!Array.isArray(data)) {
    return [];
  }

  if (!sortKey || typeof sortKey !== 'string') {
    return [...data];
  }

  const dir = direction === 'desc' ? -1 : 1;

  return [...data].sort((a, b) => {
    const valA = getNestedValue(a, sortKey);
    const valB = getNestedValue(b, sortKey);

    if (valA === valB) {
      return 0;
    }

    if (valA === null || valA === undefined) {
      return 1;
    }

    if (valB === null || valB === undefined) {
      return -1;
    }

    // Attempt date comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
      const dateA = Date.parse(valA);
      const dateB = Date.parse(valB);

      if (!isNaN(dateA) && !isNaN(dateB) && isLikelyDateString(valA) && isLikelyDateString(valB)) {
        return (dateA - dateB) * dir;
      }

      return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * dir;
    }

    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * dir;
    }

    if (typeof valA === 'boolean' && typeof valB === 'boolean') {
      return (Number(valA) - Number(valB)) * dir;
    }

    const strA = String(valA);
    const strB = String(valB);
    return strA.localeCompare(strB, undefined, { sensitivity: 'base' }) * dir;
  });
}

/**
 * Paginate an array of objects.
 *
 * @param {Array<object>} data - The array of objects to paginate.
 * @param {number} [page=1] - The current page number (1-based).
 * @param {number} [pageSize=10] - The number of items per page.
 * @returns {{ items: Array<object>, page: number, pageSize: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean }} Pagination result object.
 */
export function paginateData(data, page = 1, pageSize = 10) {
  if (!Array.isArray(data)) {
    return {
      items: [],
      page: 1,
      pageSize,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safePageSize = Math.max(1, Math.floor(Number(pageSize) || 10));
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / safePageSize);
  const clampedPage = Math.min(safePage, Math.max(totalPages, 1));
  const startIndex = (clampedPage - 1) * safePageSize;
  const endIndex = Math.min(startIndex + safePageSize, totalItems);
  const items = data.slice(startIndex, endIndex);

  return {
    items,
    page: clampedPage,
    pageSize: safePageSize,
    totalItems,
    totalPages,
    hasNextPage: clampedPage < totalPages,
    hasPreviousPage: clampedPage > 1,
  };
}

/**
 * Combine filtering, searching, sorting, and pagination in a single call.
 *
 * @param {Array<object>} data - The source data array.
 * @param {object} [options={}] - Combined options.
 * @param {object} [options.filters] - Filters to apply (see applyFilters).
 * @param {string} [options.query] - Search query string (see searchByText).
 * @param {Array<string>} [options.searchFields] - Fields to search within (see searchByText).
 * @param {string} [options.sortKey] - Field to sort by (see sortData).
 * @param {string} [options.sortDirection] - Sort direction: 'asc' or 'desc' (see sortData).
 * @param {number} [options.page] - Page number for pagination (see paginateData).
 * @param {number} [options.pageSize] - Page size for pagination (see paginateData).
 * @returns {{ items: Array<object>, page: number, pageSize: number, totalItems: number, totalPages: number, hasNextPage: boolean, hasPreviousPage: boolean, filteredTotal: number }} Combined result.
 */
export function processData(data, options = {}) {
  if (!Array.isArray(data)) {
    return {
      items: [],
      page: 1,
      pageSize: options.pageSize || 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      filteredTotal: 0,
    };
  }

  let result = data;

  if (options.filters && Object.keys(options.filters).length > 0) {
    result = applyFilters(result, options.filters);
  }

  if (options.query && typeof options.query === 'string' && options.query.trim() !== '') {
    result = searchByText(result, options.query, options.searchFields);
  }

  const filteredTotal = result.length;

  if (options.sortKey) {
    result = sortData(result, options.sortKey, options.sortDirection);
  }

  const paginated = paginateData(result, options.page, options.pageSize);

  return {
    ...paginated,
    filteredTotal,
  };
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

/**
 * Get a nested value from an object using dot-notation.
 * @param {object} obj - The source object.
 * @param {string} path - The dot-notation path (e.g., 'address.city').
 * @returns {*} The value at the path, or undefined if not found.
 */
function getNestedValue(obj, path) {
  if (!obj || typeof obj !== 'object' || !path) {
    return undefined;
  }

  if (!path.includes('.')) {
    return obj[path];
  }

  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[parts[i]];
  }

  return current;
}

/**
 * Check if a string looks like an ISO date string.
 * @param {string} value - The string to check.
 * @returns {boolean} True if the string appears to be a date.
 */
function isLikelyDateString(value) {
  if (typeof value !== 'string') {
    return false;
  }
  // Match ISO 8601 patterns: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/.test(value);
}