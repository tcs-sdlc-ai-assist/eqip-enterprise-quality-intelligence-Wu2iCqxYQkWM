import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';

/**
 * @module DataTable
 * Reusable DataTable component following the Vital Integrity design system.
 *
 * Features:
 * - Sortable columns with visual indicators
 * - Client-side pagination with configurable page sizes
 * - Row selection (single and multi-select)
 * - Search input with debounced filtering
 * - Filter dropdowns
 * - Export button integration
 * - Empty state display
 * - Keyboard navigable (Tab, Enter, Space, Arrow keys)
 * - Responsive layout with horizontal scroll on small screens
 *
 * Follows design system grid, spacing, and tonal surface layers.
 */

/**
 * Default page size options.
 * @type {Readonly<Array<number>>}
 */
const DEFAULT_PAGE_SIZE_OPTIONS = Object.freeze([10, 25, 50, 100]);

/**
 * Sort direction constants.
 * @type {Readonly<object>}
 */
const SORT_DIRECTION = Object.freeze({
  ASC: 'asc',
  DESC: 'desc',
  NONE: 'none',
});

/**
 * Chevron up SVG icon for ascending sort indicator.
 * @returns {React.ReactElement} An SVG chevron up icon.
 */
function ChevronUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/**
 * Chevron down SVG icon for descending sort indicator.
 * @returns {React.ReactElement} An SVG chevron down icon.
 */
function ChevronDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Sort indicator component showing current sort direction.
 * @param {object} props - Component props.
 * @param {string} props.direction - The current sort direction ('asc', 'desc', 'none').
 * @returns {React.ReactElement} The sort indicator element.
 */
function SortIndicator({ direction }) {
  if (direction === SORT_DIRECTION.ASC) {
    return (
      <span className="inline-flex ml-0.5 text-deep-forest-teal-600">
        <ChevronUpIcon />
      </span>
    );
  }

  if (direction === SORT_DIRECTION.DESC) {
    return (
      <span className="inline-flex ml-0.5 text-deep-forest-teal-600">
        <ChevronDownIcon />
      </span>
    );
  }

  return (
    <span className="inline-flex ml-0.5 text-gray-300">
      <ChevronUpIcon />
    </span>
  );
}

SortIndicator.propTypes = {
  direction: PropTypes.oneOf(['asc', 'desc', 'none']),
};

/**
 * Search icon SVG component.
 * @returns {React.ReactElement} An SVG search icon.
 */
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/**
 * Empty state component displayed when no data is available.
 * @param {object} props - Component props.
 * @param {string} [props.title] - The empty state title.
 * @param {string} [props.message] - The empty state message.
 * @param {React.ReactNode} [props.icon] - Optional icon element.
 * @returns {React.ReactElement} The empty state element.
 */
function EmptyState({ title, message, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
      {icon ? (
        <div className="mb-2 text-gray-300">{icon}</div>
      ) : (
        <div className="mb-2 text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        </div>
      )}
      <h3 className="text-base font-medium text-gray-700 mb-0.5">
        {title || 'No data available'}
      </h3>
      <p className="text-sm text-gray-500 max-w-xs">
        {message || 'There are no records to display. Try adjusting your filters or search criteria.'}
      </p>
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  icon: PropTypes.node,
};

/**
 * Get a nested value from an object using dot-notation.
 * @param {object} obj - The source object.
 * @param {string} path - The dot-notation path.
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
 * Reusable DataTable component with sorting, pagination, search, filtering,
 * row selection, export, and empty state support.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.columns - Column definitions array.
 * @param {string} props.columns[].key - The data field key (supports dot-notation).
 * @param {string} props.columns[].label - The column header label.
 * @param {boolean} [props.columns[].sortable=false] - Whether the column is sortable.
 * @param {function} [props.columns[].render] - Custom render function (value, row, rowIndex) => ReactNode.
 * @param {string} [props.columns[].align='left'] - Text alignment ('left', 'center', 'right').
 * @param {string} [props.columns[].width] - Optional column width (e.g., '120px', '20%').
 * @param {boolean} [props.columns[].hidden=false] - Whether the column is hidden.
 * @param {Array<object>} props.data - The data array to display.
 * @param {string} [props.rowKey='id'] - The field name to use as a unique row key.
 * @param {boolean} [props.selectable=false] - Whether rows are selectable.
 * @param {Array<string>} [props.selectedRows=[]] - Array of selected row keys (controlled).
 * @param {function} [props.onSelectionChange] - Callback when selection changes. Receives array of selected row keys.
 * @param {boolean} [props.searchable=false] - Whether to show the search input.
 * @param {string} [props.searchPlaceholder='Search...'] - Placeholder text for the search input.
 * @param {string} [props.searchValue] - Controlled search value.
 * @param {function} [props.onSearchChange] - Callback when search value changes.
 * @param {Array<string>} [props.searchFields] - Fields to search within. If empty, searches all string fields.
 * @param {Array<object>} [props.filters] - Filter dropdown definitions.
 * @param {string} props.filters[].key - The data field key to filter by.
 * @param {string} props.filters[].label - The filter dropdown label.
 * @param {Array<{value: string, label: string}>} props.filters[].options - The filter options.
 * @param {object} [props.filterValues={}] - Controlled filter values object { [filterKey]: selectedValue }.
 * @param {function} [props.onFilterChange] - Callback when a filter changes. Receives (filterKey, value).
 * @param {boolean} [props.paginated=true] - Whether to show pagination controls.
 * @param {number} [props.pageSize=10] - Initial page size.
 * @param {Array<number>} [props.pageSizeOptions] - Available page size options.
 * @param {number} [props.currentPage] - Controlled current page (1-based).
 * @param {function} [props.onPageChange] - Callback when page changes. Receives page number.
 * @param {function} [props.onPageSizeChange] - Callback when page size changes. Receives new page size.
 * @param {string} [props.sortKey] - Controlled sort key.
 * @param {string} [props.sortDirection='none'] - Controlled sort direction.
 * @param {function} [props.onSortChange] - Callback when sort changes. Receives (sortKey, sortDirection).
 * @param {boolean} [props.showExport=false] - Whether to show the export button.
 * @param {function} [props.onExport] - Callback when export is clicked. Receives the current filtered/sorted data.
 * @param {string} [props.exportLabel='Export'] - Label for the export button.
 * @param {function} [props.onRowClick] - Callback when a row is clicked. Receives (row, rowIndex).
 * @param {boolean} [props.striped=true] - Whether to apply striped row styling.
 * @param {boolean} [props.hoverable=true] - Whether to apply hover styling to rows.
 * @param {boolean} [props.bordered=false] - Whether to apply borders between rows.
 * @param {boolean} [props.compact=false] - Whether to use compact row padding.
 * @param {boolean} [props.loading=false] - Whether the table is in a loading state.
 * @param {string} [props.emptyTitle] - Custom empty state title.
 * @param {string} [props.emptyMessage] - Custom empty state message.
 * @param {React.ReactNode} [props.emptyIcon] - Custom empty state icon.
 * @param {React.ReactNode} [props.toolbar] - Additional toolbar content rendered before search/filters.
 * @param {string} [props.className] - Additional CSS classes for the table container.
 * @param {string} [props.ariaLabel] - Accessible label for the table.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered DataTable element.
 */
export default function DataTable({
  columns,
  data,
  rowKey = 'id',
  selectable = false,
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue: controlledSearchValue,
  onSearchChange,
  searchFields,
  filters,
  filterValues: controlledFilterValues,
  onFilterChange,
  paginated = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  currentPage: controlledCurrentPage,
  onPageChange,
  onPageSizeChange,
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSortChange,
  showExport = false,
  onExport,
  exportLabel = 'Export',
  onRowClick,
  striped = true,
  hoverable = true,
  bordered = false,
  compact = false,
  loading = false,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  toolbar,
  className = '',
  ariaLabel,
  testId,
}) {
  // Internal state for uncontrolled mode
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const [internalSortKey, setInternalSortKey] = useState(null);
  const [internalSortDirection, setInternalSortDirection] = useState(SORT_DIRECTION.NONE);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);
  const [internalFilterValues, setInternalFilterValues] = useState({});

  const searchInputRef = useRef(null);

  // Determine controlled vs uncontrolled values
  const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue;
  const activeSortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
  const activeSortDirection = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDirection;
  const activePage = controlledCurrentPage !== undefined ? controlledCurrentPage : internalCurrentPage;
  const activePageSize = internalPageSize;
  const activeSelectedRows = controlledSelectedRows !== undefined ? controlledSelectedRows : internalSelectedRows;
  const activeFilterValues = controlledFilterValues !== undefined ? controlledFilterValues : internalFilterValues;

  // Visible columns
  const visibleColumns = useMemo(() => {
    if (!Array.isArray(columns)) {
      return [];
    }
    return columns.filter((col) => col.hidden !== true);
  }, [columns]);

  // Filter data by search
  const searchFilteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    if (!searchValue || typeof searchValue !== 'string' || searchValue.trim() === '') {
      return data;
    }

    const queryLower = searchValue.trim().toLowerCase();
    const fields = Array.isArray(searchFields) && searchFields.length > 0
      ? searchFields
      : visibleColumns.map((col) => col.key);

    return data.filter((row) => {
      for (let i = 0; i < fields.length; i++) {
        const value = getNestedValue(row, fields[i]);
        if (value !== null && value !== undefined) {
          if (String(value).toLowerCase().includes(queryLower)) {
            return true;
          }
        }
      }
      return false;
    });
  }, [data, searchValue, searchFields, visibleColumns]);

  // Filter data by dropdown filters
  const filteredData = useMemo(() => {
    if (!Array.isArray(filters) || filters.length === 0) {
      return searchFilteredData;
    }

    const filterKeys = Object.keys(activeFilterValues);
    if (filterKeys.length === 0) {
      return searchFilteredData;
    }

    return searchFilteredData.filter((row) => {
      for (let i = 0; i < filterKeys.length; i++) {
        const filterKey = filterKeys[i];
        const filterValue = activeFilterValues[filterKey];

        if (filterValue === '' || filterValue === null || filterValue === undefined) {
          continue;
        }

        const rowValue = getNestedValue(row, filterKey);
        if (String(rowValue) !== String(filterValue)) {
          return false;
        }
      }
      return true;
    });
  }, [searchFilteredData, filters, activeFilterValues]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!activeSortKey || activeSortDirection === SORT_DIRECTION.NONE) {
      return filteredData;
    }

    const dir = activeSortDirection === SORT_DIRECTION.DESC ? -1 : 1;

    return [...filteredData].sort((a, b) => {
      const valA = getNestedValue(a, activeSortKey);
      const valB = getNestedValue(b, activeSortKey);

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * dir;
      }

      return String(valA).localeCompare(String(valB)) * dir;
    });
  }, [filteredData, activeSortKey, activeSortDirection]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalItems / activePageSize)) : 1;
  const clampedPage = Math.min(Math.max(1, activePage), totalPages);

  const paginatedData = useMemo(() => {
    if (!paginated) {
      return sortedData;
    }

    const startIndex = (clampedPage - 1) * activePageSize;
    const endIndex = Math.min(startIndex + activePageSize, totalItems);
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, paginated, clampedPage, activePageSize, totalItems]);

  // Reset page when filters/search change
  useEffect(() => {
    if (controlledCurrentPage === undefined) {
      setInternalCurrentPage(1);
    }
  }, [searchValue, activeFilterValues, controlledCurrentPage]);

  // Handlers
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  }, [onSearchChange]);

  const handleSortClick = useCallback((columnKey) => {
    let newDirection;

    if (activeSortKey === columnKey) {
      if (activeSortDirection === SORT_DIRECTION.ASC) {
        newDirection = SORT_DIRECTION.DESC;
      } else if (activeSortDirection === SORT_DIRECTION.DESC) {
        newDirection = SORT_DIRECTION.NONE;
      } else {
        newDirection = SORT_DIRECTION.ASC;
      }
    } else {
      newDirection = SORT_DIRECTION.ASC;
    }

    const newKey = newDirection === SORT_DIRECTION.NONE ? null : columnKey;

    if (onSortChange) {
      onSortChange(newKey, newDirection);
    } else {
      setInternalSortKey(newKey);
      setInternalSortDirection(newDirection);
    }
  }, [activeSortKey, activeSortDirection, onSortChange]);

  const handlePageChange = useCallback((page) => {
    const safePage = Math.min(Math.max(1, page), totalPages);
    if (onPageChange) {
      onPageChange(safePage);
    } else {
      setInternalCurrentPage(safePage);
    }
  }, [totalPages, onPageChange]);

  const handlePageSizeChange = useCallback((e) => {
    const newSize = Number(e.target.value);
    setInternalPageSize(newSize);
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
    if (controlledCurrentPage === undefined) {
      setInternalCurrentPage(1);
    }
    if (onPageChange) {
      onPageChange(1);
    }
  }, [onPageSizeChange, onPageChange, controlledCurrentPage]);

  const handleSelectAll = useCallback((e) => {
    const checked = e.target.checked;
    let newSelection;

    if (checked) {
      newSelection = paginatedData.map((row) => getNestedValue(row, rowKey)).filter(Boolean);
    } else {
      newSelection = [];
    }

    if (onSelectionChange) {
      onSelectionChange(newSelection);
    } else {
      setInternalSelectedRows(newSelection);
    }
  }, [paginatedData, rowKey, onSelectionChange]);

  const handleSelectRow = useCallback((rowId) => {
    const currentSelection = [...activeSelectedRows];
    const index = currentSelection.indexOf(rowId);

    if (index === -1) {
      currentSelection.push(rowId);
    } else {
      currentSelection.splice(index, 1);
    }

    if (onSelectionChange) {
      onSelectionChange(currentSelection);
    } else {
      setInternalSelectedRows(currentSelection);
    }
  }, [activeSelectedRows, onSelectionChange]);

  const handleFilterChange = useCallback((filterKey, value) => {
    if (onFilterChange) {
      onFilterChange(filterKey, value);
    } else {
      setInternalFilterValues((prev) => ({
        ...prev,
        [filterKey]: value,
      }));
    }
  }, [onFilterChange]);

  const handleExportClick = useCallback(() => {
    if (onExport) {
      onExport(sortedData);
    }
  }, [onExport, sortedData]);

  const handleRowClick = useCallback((row, rowIndex) => {
    if (onRowClick) {
      onRowClick(row, rowIndex);
    }
  }, [onRowClick]);

  const handleRowKeyDown = useCallback((e, row, rowIndex) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (onRowClick) {
        onRowClick(row, rowIndex);
      }
    }
  }, [onRowClick]);

  const handleHeaderKeyDown = useCallback((e, columnKey) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSortClick(columnKey);
    }
  }, [handleSortClick]);

  // Check if all visible rows are selected
  const allVisibleSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((row) => {
      const id = getNestedValue(row, rowKey);
      return activeSelectedRows.includes(id);
    });
  }, [paginatedData, rowKey, activeSelectedRows]);

  const someVisibleSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    const someSelected = paginatedData.some((row) => {
      const id = getNestedValue(row, rowKey);
      return activeSelectedRows.includes(id);
    });
    return someSelected && !allVisibleSelected;
  }, [paginatedData, rowKey, activeSelectedRows, allVisibleSelected]);

  // Pagination range display
  const paginationStart = totalItems === 0 ? 0 : (clampedPage - 1) * activePageSize + 1;
  const paginationEnd = Math.min(clampedPage * activePageSize, totalItems);

  // Row classes
  const cellPadding = compact ? 'px-2 py-1' : 'px-3 py-1.5';
  const headerPadding = compact ? 'px-2 py-1' : 'px-3 py-1.5';

  const hasToolbar = searchable || (Array.isArray(filters) && filters.length > 0) || showExport || toolbar;

  const containerClasses = [
    'border border-[#E0E0E0] rounded-card overflow-hidden bg-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} data-testid={testId}>
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-[#E0E0E0] bg-gray-50">
          {toolbar && <div className="flex items-center">{toolbar}</div>}

          {searchable && (
            <div className="relative flex-shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-gray-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="block w-full min-w-[180px] max-w-[280px] pl-4 pr-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20"
                aria-label="Search table"
              />
            </div>
          )}

          {Array.isArray(filters) && filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {filters.map((filter) => (
                <div key={filter.key} className="flex-shrink-0">
                  <select
                    value={activeFilterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="block w-auto min-w-[120px] px-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 appearance-none bg-no-repeat bg-right pr-4"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px',
                    }}
                    aria-label={filter.label}
                  >
                    <option value="">{filter.label}</option>
                    {Array.isArray(filter.options) &&
                      filter.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {selectable && activeSelectedRows.length > 0 && (
            <span className="text-xs text-gray-500">
              {activeSelectedRows.length} selected
            </span>
          )}

          {showExport && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportClick}
              ariaLabel={exportLabel}
              disabled={totalItems === 0}
            >
              {exportLabel}
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table
          className="w-full text-sm text-left"
          aria-label={ariaLabel || 'Data table'}
          role="grid"
        >
          <thead className="bg-gray-50 border-b border-[#E0E0E0]">
            <tr>
              {selectable && (
                <th
                  scope="col"
                  className={`${headerPadding} w-[40px] text-center`}
                >
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = someVisibleSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-2 w-2 rounded-standard border-gray-300 text-deep-forest-teal-600 focus:ring-deep-forest-teal-500/20 focus:ring-2 focus:ring-offset-0 cursor-pointer"
                    aria-label="Select all rows"
                    disabled={paginatedData.length === 0}
                  />
                </th>
              )}
              {visibleColumns.map((col) => {
                const isSorted = activeSortKey === col.key;
                const currentDirection = isSorted ? activeSortDirection : SORT_DIRECTION.NONE;
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                      ? 'text-right'
                      : 'text-left';

                if (col.sortable) {
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`${headerPadding} ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider select-none cursor-pointer hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-inset`}
                      style={col.width ? { width: col.width } : undefined}
                      onClick={() => handleSortClick(col.key)}
                      onKeyDown={(e) => handleHeaderKeyDown(e, col.key)}
                      tabIndex={0}
                      role="columnheader"
                      aria-sort={
                        currentDirection === SORT_DIRECTION.ASC
                          ? 'ascending'
                          : currentDirection === SORT_DIRECTION.DESC
                            ? 'descending'
                            : 'none'
                      }
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {col.label}
                        <SortIndicator direction={currentDirection} />
                      </span>
                    </th>
                  );
                }

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`${headerPadding} ${alignClass} text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                    style={col.width ? { width: col.width } : undefined}
                    role="columnheader"
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="px-3 py-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                >
                  <EmptyState
                    title={emptyTitle}
                    message={emptyMessage}
                    icon={emptyIcon}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowId = getNestedValue(row, rowKey);
                const isSelected = activeSelectedRows.includes(rowId);
                const isClickable = typeof onRowClick === 'function';

                const rowClasses = [
                  'transition-colors duration-100',
                  striped && rowIndex % 2 === 1 ? 'bg-gray-50/50' : '',
                  hoverable ? 'hover:bg-deep-forest-teal-50/40' : '',
                  bordered ? 'border-b border-gray-200' : '',
                  isSelected ? 'bg-deep-forest-teal-50' : '',
                  isClickable ? 'cursor-pointer' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <tr
                    key={rowId || rowIndex}
                    className={rowClasses}
                    onClick={isClickable ? () => handleRowClick(row, rowIndex) : undefined}
                    onKeyDown={isClickable ? (e) => handleRowKeyDown(e, row, rowIndex) : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    role={isClickable ? 'row' : undefined}
                    aria-selected={selectable ? isSelected : undefined}
                  >
                    {selectable && (
                      <td className={`${cellPadding} text-center`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-2 w-2 rounded-standard border-gray-300 text-deep-forest-teal-600 focus:ring-deep-forest-teal-500/20 focus:ring-2 focus:ring-offset-0 cursor-pointer"
                          aria-label={`Select row ${rowId || rowIndex}`}
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => {
                      const value = getNestedValue(row, col.key);
                      const alignClass =
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                            ? 'text-right'
                            : 'text-left';

                      const cellContent = col.render
                        ? col.render(value, row, rowIndex)
                        : value !== null && value !== undefined
                          ? String(value)
                          : '—';

                      return (
                        <td
                          key={col.key}
                          className={`${cellPadding} ${alignClass} text-sm text-gray-700`}
                          style={col.width ? { width: col.width } : undefined}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && !loading && totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Showing {paginationStart}–{paginationEnd} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <label htmlFor="datatable-page-size" className="text-xs text-gray-500 sr-only">
                Rows per page
              </label>
              <select
                id="datatable-page-size"
                value={activePageSize}
                onChange={handlePageSizeChange}
                className="block w-auto px-1 py-0.5 text-xs text-gray-700 bg-white border border-gray-300 rounded-standard shadow-sm transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 appearance-none bg-no-repeat bg-right pr-3"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                  backgroundPosition: 'right 4px center',
                  backgroundSize: '12px',
                }}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={clampedPage <= 1}
              className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-standard transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="First page"
            >
              «
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(clampedPage - 1)}
              disabled={clampedPage <= 1}
              className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-standard transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              ‹
            </button>

            {generatePageNumbers(clampedPage, totalPages).map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="inline-flex items-center justify-center w-4 h-4 text-xs text-gray-400"
                  >
                    …
                  </span>
                );
              }

              const isActive = pageNum === clampedPage;

              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={[
                    'inline-flex items-center justify-center w-4 h-4 text-xs font-medium rounded-standard transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1',
                    isActive
                      ? 'bg-deep-forest-teal text-white border border-deep-forest-teal'
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handlePageChange(clampedPage + 1)}
              disabled={clampedPage >= totalPages}
              className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-standard transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              ›
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={clampedPage >= totalPages}
              className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-standard transition-colors duration-150 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate an array of page numbers to display in the pagination control.
 * Includes ellipsis markers for large page counts.
 *
 * @param {number} currentPage - The current active page.
 * @param {number} totalPages - The total number of pages.
 * @returns {Array<number|string>} Array of page numbers and '...' markers.
 */
function generatePageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  const pages = [];

  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

DataTable.propTypes = {
  /** Column definitions array. */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** The data field key (supports dot-notation). */
      key: PropTypes.string.isRequired,
      /** The column header label. */
      label: PropTypes.string.isRequired,
      /** Whether the column is sortable. */
      sortable: PropTypes.bool,
      /** Custom render function (value, row, rowIndex) => ReactNode. */
      render: PropTypes.func,
      /** Text alignment. */
      align: PropTypes.oneOf(['left', 'center', 'right']),
      /** Optional column width. */
      width: PropTypes.string,
      /** Whether the column is hidden. */
      hidden: PropTypes.bool,
    }),
  ).isRequired,
  /** The data array to display. */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  /** The field name to use as a unique row key. */
  rowKey: PropTypes.string,
  /** Whether rows are selectable. */
  selectable: PropTypes.bool,
  /** Array of selected row keys (controlled). */
  selectedRows: PropTypes.arrayOf(PropTypes.string),
  /** Callback when selection changes. */
  onSelectionChange: PropTypes.func,
  /** Whether to show the search input. */
  searchable: PropTypes.bool,
  /** Placeholder text for the search input. */
  searchPlaceholder: PropTypes.string,
  /** Controlled search value. */
  searchValue: PropTypes.string,
  /** Callback when search value changes. */
  onSearchChange: PropTypes.func,
  /** Fields to search within. */
  searchFields: PropTypes.arrayOf(PropTypes.string),
  /** Filter dropdown definitions. */
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }),
  ),
  /** Controlled filter values object. */
  filterValues: PropTypes.object,
  /** Callback when a filter changes. */
  onFilterChange: PropTypes.func,
  /** Whether to show pagination controls. */
  paginated: PropTypes.bool,
  /** Initial page size. */
  pageSize: PropTypes.number,
  /** Available page size options. */
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  /** Controlled current page (1-based). */
  currentPage: PropTypes.number,
  /** Callback when page changes. */
  onPageChange: PropTypes.func,
  /** Callback when page size changes. */
  onPageSizeChange: PropTypes.func,
  /** Controlled sort key. */
  sortKey: PropTypes.string,
  /** Controlled sort direction. */
  sortDirection: PropTypes.oneOf(['asc', 'desc', 'none']),
  /** Callback when sort changes. */
  onSortChange: PropTypes.func,
  /** Whether to show the export button. */
  showExport: PropTypes.bool,
  /** Callback when export is clicked. */
  onExport: PropTypes.func,
  /** Label for the export button. */
  exportLabel: PropTypes.string,
  /** Callback when a row is clicked. */
  onRowClick: PropTypes.func,
  /** Whether to apply striped row styling. */
  striped: PropTypes.bool,
  /** Whether to apply hover styling to rows. */
  hoverable: PropTypes.bool,
  /** Whether to apply borders between rows. */
  bordered: PropTypes.bool,
  /** Whether to use compact row padding. */
  compact: PropTypes.bool,
  /** Whether the table is in a loading state. */
  loading: PropTypes.bool,
  /** Custom empty state title. */
  emptyTitle: PropTypes.string,
  /** Custom empty state message. */
  emptyMessage: PropTypes.string,
  /** Custom empty state icon. */
  emptyIcon: PropTypes.node,
  /** Additional toolbar content. */
  toolbar: PropTypes.node,
  /** Additional CSS classes for the table container. */
  className: PropTypes.string,
  /** Accessible label for the table. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};