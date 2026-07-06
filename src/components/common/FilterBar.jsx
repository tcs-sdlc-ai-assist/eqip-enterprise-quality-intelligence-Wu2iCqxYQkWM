import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Button from './Button.jsx';

/**
 * @module FilterBar
 * Reusable FilterBar component following the Vital Integrity design system.
 *
 * Horizontal bar with combinable dropdown filters for segment, application,
 * release, date range, environment, product area, risk level, quality status.
 * Filters persist within session via optional onFilterChange callback.
 *
 * Features:
 * - Multiple combinable dropdown filters
 * - Search input for text-based filtering
 * - Active filter count badge
 * - Clear all / clear individual filter actions
 * - Responsive layout with horizontal scroll on small screens
 * - Keyboard accessible with visible focus indicators
 * - Session persistence via controlled or uncontrolled state
 */

/**
 * Base CSS classes for the filter bar container.
 * @type {string}
 */
const BAR_CLASSES =
  'flex flex-wrap items-center gap-2 px-3 py-2 bg-gray-50 border border-[#E0E0E0] rounded-card';

/**
 * Base CSS classes for individual filter select elements.
 * @type {string}
 */
const SELECT_CLASSES =
  'block w-auto min-w-[130px] px-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 appearance-none bg-no-repeat bg-right pr-4';

/**
 * Inline background-image style for select dropdown chevron.
 * @type {object}
 */
const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundPosition: 'right 8px center',
  backgroundSize: '16px',
};

/**
 * Default date range options.
 * @type {Readonly<Array<{value: string, label: string}>>}
 */
const DEFAULT_DATE_RANGE_OPTIONS = Object.freeze([
  { value: 'today', label: 'Today' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
  { value: 'thisYear', label: 'This Year' },
]);

/**
 * Default risk level options.
 * @type {Readonly<Array<{value: string, label: string}>>}
 */
const DEFAULT_RISK_LEVEL_OPTIONS = Object.freeze([
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]);

/**
 * Default quality status options.
 * @type {Readonly<Array<{value: string, label: string}>>}
 */
const DEFAULT_QUALITY_STATUS_OPTIONS = Object.freeze([
  { value: 'healthy', label: 'Healthy' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'critical', label: 'Critical' },
]);

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
 * Close icon SVG component for clearing individual filters.
 * @returns {React.ReactElement} An SVG close icon.
 */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/**
 * Count the number of active (non-empty) filter values.
 * @param {object} filterValues - The current filter values object.
 * @returns {number} The count of active filters.
 */
function countActiveFilters(filterValues) {
  if (!filterValues || typeof filterValues !== 'object') {
    return 0;
  }

  let count = 0;
  const keys = Object.keys(filterValues);

  for (let i = 0; i < keys.length; i++) {
    const value = filterValues[keys[i]];
    if (value !== '' && value !== null && value !== undefined) {
      count += 1;
    }
  }

  return count;
}

/**
 * Reusable FilterBar component with combinable dropdown filters, search input,
 * active filter count, and clear actions.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} [props.filters] - Custom filter definitions array. Each filter object:
 *   @param {string} props.filters[].key - The filter key used in filterValues.
 *   @param {string} props.filters[].label - The display label / placeholder for the filter.
 *   @param {Array<{value: string, label: string}>} props.filters[].options - The dropdown options.
 *   @param {boolean} [props.filters[].hidden=false] - Whether the filter is hidden.
 * @param {object} [props.filterValues] - Controlled filter values object { [filterKey]: selectedValue }.
 * @param {function} [props.onFilterChange] - Callback when a filter changes. Receives (filterKey, value).
 * @param {boolean} [props.showSearch=false] - Whether to show the search input.
 * @param {string} [props.searchValue] - Controlled search value.
 * @param {function} [props.onSearchChange] - Callback when search value changes. Receives (value).
 * @param {string} [props.searchPlaceholder='Search...'] - Placeholder text for the search input.
 * @param {boolean} [props.showSegmentFilter=false] - Whether to show the segment filter.
 * @param {Array<{value: string, label: string}>} [props.segmentOptions] - Options for the segment filter.
 * @param {boolean} [props.showApplicationFilter=false] - Whether to show the application filter.
 * @param {Array<{value: string, label: string}>} [props.applicationOptions] - Options for the application filter.
 * @param {boolean} [props.showReleaseFilter=false] - Whether to show the release filter.
 * @param {Array<{value: string, label: string}>} [props.releaseOptions] - Options for the release filter.
 * @param {boolean} [props.showDateRangeFilter=false] - Whether to show the date range filter.
 * @param {Array<{value: string, label: string}>} [props.dateRangeOptions] - Options for the date range filter.
 * @param {boolean} [props.showEnvironmentFilter=false] - Whether to show the environment filter.
 * @param {Array<{value: string, label: string}>} [props.environmentOptions] - Options for the environment filter.
 * @param {boolean} [props.showProductAreaFilter=false] - Whether to show the product area filter.
 * @param {Array<{value: string, label: string}>} [props.productAreaOptions] - Options for the product area filter.
 * @param {boolean} [props.showRiskLevelFilter=false] - Whether to show the risk level filter.
 * @param {Array<{value: string, label: string}>} [props.riskLevelOptions] - Options for the risk level filter.
 * @param {boolean} [props.showQualityStatusFilter=false] - Whether to show the quality status filter.
 * @param {Array<{value: string, label: string}>} [props.qualityStatusOptions] - Options for the quality status filter.
 * @param {boolean} [props.showClearAll=true] - Whether to show the "Clear All" button when filters are active.
 * @param {function} [props.onClearAll] - Callback when "Clear All" is clicked.
 * @param {React.ReactNode} [props.children] - Additional content rendered at the end of the filter bar.
 * @param {string} [props.className] - Additional CSS classes for the filter bar container.
 * @param {string} [props.ariaLabel] - Accessible label for the filter bar.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered FilterBar element.
 */
export default function FilterBar({
  filters,
  filterValues: controlledFilterValues,
  onFilterChange,
  showSearch = false,
  searchValue: controlledSearchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSegmentFilter = false,
  segmentOptions,
  showApplicationFilter = false,
  applicationOptions,
  showReleaseFilter = false,
  releaseOptions,
  showDateRangeFilter = false,
  dateRangeOptions,
  showEnvironmentFilter = false,
  environmentOptions,
  showProductAreaFilter = false,
  productAreaOptions,
  showRiskLevelFilter = false,
  riskLevelOptions,
  showQualityStatusFilter = false,
  qualityStatusOptions,
  showClearAll = true,
  onClearAll,
  children,
  className = '',
  ariaLabel,
  testId,
}) {
  // Internal state for uncontrolled mode
  const [internalFilterValues, setInternalFilterValues] = useState({});
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const searchInputRef = useRef(null);

  // Determine controlled vs uncontrolled values
  const activeFilterValues =
    controlledFilterValues !== undefined
      ? controlledFilterValues
      : internalFilterValues;

  const activeSearchValue =
    controlledSearchValue !== undefined
      ? controlledSearchValue
      : internalSearchValue;

  // Build the list of built-in filters based on show* props
  const builtInFilters = useMemo(() => {
    const result = [];

    if (showSegmentFilter) {
      result.push({
        key: 'segment',
        label: 'Segment',
        options: segmentOptions || [],
      });
    }

    if (showApplicationFilter) {
      result.push({
        key: 'application',
        label: 'Application',
        options: applicationOptions || [],
      });
    }

    if (showReleaseFilter) {
      result.push({
        key: 'release',
        label: 'Release',
        options: releaseOptions || [],
      });
    }

    if (showDateRangeFilter) {
      result.push({
        key: 'dateRange',
        label: 'Date Range',
        options: dateRangeOptions || [...DEFAULT_DATE_RANGE_OPTIONS],
      });
    }

    if (showEnvironmentFilter) {
      result.push({
        key: 'environment',
        label: 'Environment',
        options: environmentOptions || [],
      });
    }

    if (showProductAreaFilter) {
      result.push({
        key: 'productArea',
        label: 'Product Area',
        options: productAreaOptions || [],
      });
    }

    if (showRiskLevelFilter) {
      result.push({
        key: 'riskLevel',
        label: 'Risk Level',
        options: riskLevelOptions || [...DEFAULT_RISK_LEVEL_OPTIONS],
      });
    }

    if (showQualityStatusFilter) {
      result.push({
        key: 'qualityStatus',
        label: 'Quality Status',
        options: qualityStatusOptions || [...DEFAULT_QUALITY_STATUS_OPTIONS],
      });
    }

    return result;
  }, [
    showSegmentFilter,
    segmentOptions,
    showApplicationFilter,
    applicationOptions,
    showReleaseFilter,
    releaseOptions,
    showDateRangeFilter,
    dateRangeOptions,
    showEnvironmentFilter,
    environmentOptions,
    showProductAreaFilter,
    productAreaOptions,
    showRiskLevelFilter,
    riskLevelOptions,
    showQualityStatusFilter,
    qualityStatusOptions,
  ]);

  // Merge built-in filters with custom filters
  const allFilters = useMemo(() => {
    const combined = [...builtInFilters];

    if (Array.isArray(filters)) {
      for (let i = 0; i < filters.length; i++) {
        const filter = filters[i];
        if (filter && filter.key && filter.hidden !== true) {
          // Avoid duplicates by key
          const existingIndex = combined.findIndex((f) => f.key === filter.key);
          if (existingIndex === -1) {
            combined.push(filter);
          } else {
            combined[existingIndex] = filter;
          }
        }
      }
    }

    return combined;
  }, [builtInFilters, filters]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (filterKey, value) => {
      if (onFilterChange) {
        onFilterChange(filterKey, value);
      } else {
        setInternalFilterValues((prev) => ({
          ...prev,
          [filterKey]: value,
        }));
      }
    },
    [onFilterChange],
  );

  // Handle search change
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        setInternalSearchValue(value);
      }
    },
    [onSearchChange],
  );

  // Handle clear individual filter
  const handleClearFilter = useCallback(
    (filterKey) => {
      if (onFilterChange) {
        onFilterChange(filterKey, '');
      } else {
        setInternalFilterValues((prev) => {
          const updated = { ...prev };
          updated[filterKey] = '';
          return updated;
        });
      }
    },
    [onFilterChange],
  );

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    } else if (onFilterChange) {
      for (let i = 0; i < allFilters.length; i++) {
        onFilterChange(allFilters[i].key, '');
      }
      if (onSearchChange) {
        onSearchChange('');
      }
    } else {
      setInternalFilterValues({});
      setInternalSearchValue('');
    }
  }, [onClearAll, onFilterChange, onSearchChange, allFilters]);

  // Count active filters (excluding search)
  const activeCount = useMemo(
    () => countActiveFilters(activeFilterValues),
    [activeFilterValues],
  );

  // Include search in active count for display
  const totalActiveCount = useMemo(() => {
    let total = activeCount;
    if (
      showSearch &&
      activeSearchValue &&
      typeof activeSearchValue === 'string' &&
      activeSearchValue.trim() !== ''
    ) {
      total += 1;
    }
    return total;
  }, [activeCount, showSearch, activeSearchValue]);

  // Check if there are any filters to display
  const hasFilters = allFilters.length > 0 || showSearch;

  if (!hasFilters && !children) {
    return null;
  }

  const containerClasses = [BAR_CLASSES, className].filter(Boolean).join(' ');

  return (
    <div
      className={containerClasses}
      role="toolbar"
      aria-label={ariaLabel || 'Filter bar'}
      data-testid={testId}
    >
      {/* Search Input */}
      {showSearch && (
        <div className="relative flex-shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            value={activeSearchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="block w-full min-w-[180px] max-w-[280px] pl-4 pr-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20"
            aria-label="Search"
          />
        </div>
      )}

      {/* Filter Dropdowns */}
      {allFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {allFilters.map((filter) => {
            const currentValue = activeFilterValues[filter.key] || '';
            const hasValue = currentValue !== '';

            return (
              <div key={filter.key} className="relative flex-shrink-0">
                <select
                  value={currentValue}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className={[
                    SELECT_CLASSES,
                    hasValue
                      ? 'border-deep-forest-teal-400 bg-deep-forest-teal-50/30'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={SELECT_CHEVRON_STYLE}
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
            );
          })}
        </div>
      )}

      {/* Active Filter Tags */}
      {totalActiveCount > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {allFilters.map((filter) => {
            const currentValue = activeFilterValues[filter.key] || '';
            if (currentValue === '') {
              return null;
            }

            const selectedOption = Array.isArray(filter.options)
              ? filter.options.find((opt) => opt.value === currentValue)
              : null;

            const displayLabel = selectedOption
              ? selectedOption.label
              : currentValue;

            return (
              <span
                key={`tag-${filter.key}`}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 text-xs font-medium text-deep-forest-teal-800 bg-deep-forest-teal-50 border border-deep-forest-teal-200 rounded-full"
              >
                <span className="text-gray-500">{filter.label}:</span>
                <span>{displayLabel}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter(filter.key)}
                  className="inline-flex items-center justify-center w-2 h-2 ml-0.5 text-deep-forest-teal-600 hover:text-deep-forest-teal-800 hover:bg-deep-forest-teal-100 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1"
                  aria-label={`Clear ${filter.label} filter`}
                >
                  <CloseIcon />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Active Filter Count Badge */}
      {totalActiveCount > 0 && (
        <span className="text-xs text-gray-500">
          {totalActiveCount} filter{totalActiveCount !== 1 ? 's' : ''} active
        </span>
      )}

      {/* Clear All Button */}
      {showClearAll && totalActiveCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          ariaLabel="Clear all filters"
        >
          Clear All
        </Button>
      )}

      {/* Additional Content */}
      {children}
    </div>
  );
}

FilterBar.propTypes = {
  /** Custom filter definitions array. */
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      /** The filter key used in filterValues. */
      key: PropTypes.string.isRequired,
      /** The display label / placeholder for the filter. */
      label: PropTypes.string.isRequired,
      /** The dropdown options. */
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
      /** Whether the filter is hidden. */
      hidden: PropTypes.bool,
    }),
  ),
  /** Controlled filter values object { [filterKey]: selectedValue }. */
  filterValues: PropTypes.object,
  /** Callback when a filter changes. Receives (filterKey, value). */
  onFilterChange: PropTypes.func,
  /** Whether to show the search input. */
  showSearch: PropTypes.bool,
  /** Controlled search value. */
  searchValue: PropTypes.string,
  /** Callback when search value changes. Receives (value). */
  onSearchChange: PropTypes.func,
  /** Placeholder text for the search input. */
  searchPlaceholder: PropTypes.string,
  /** Whether to show the segment filter. */
  showSegmentFilter: PropTypes.bool,
  /** Options for the segment filter. */
  segmentOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the application filter. */
  showApplicationFilter: PropTypes.bool,
  /** Options for the application filter. */
  applicationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the release filter. */
  showReleaseFilter: PropTypes.bool,
  /** Options for the release filter. */
  releaseOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the date range filter. */
  showDateRangeFilter: PropTypes.bool,
  /** Options for the date range filter. Defaults to common presets. */
  dateRangeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the environment filter. */
  showEnvironmentFilter: PropTypes.bool,
  /** Options for the environment filter. */
  environmentOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the product area filter. */
  showProductAreaFilter: PropTypes.bool,
  /** Options for the product area filter. */
  productAreaOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the risk level filter. */
  showRiskLevelFilter: PropTypes.bool,
  /** Options for the risk level filter. Defaults to Low/Medium/High/Critical. */
  riskLevelOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the quality status filter. */
  showQualityStatusFilter: PropTypes.bool,
  /** Options for the quality status filter. Defaults to Healthy/At Risk/Critical. */
  qualityStatusOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Whether to show the "Clear All" button when filters are active. */
  showClearAll: PropTypes.bool,
  /** Callback when "Clear All" is clicked. */
  onClearAll: PropTypes.func,
  /** Additional content rendered at the end of the filter bar. */
  children: PropTypes.node,
  /** Additional CSS classes for the filter bar container. */
  className: PropTypes.string,
  /** Accessible label for the filter bar. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};