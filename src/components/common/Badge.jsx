import PropTypes from 'prop-types';

/**
 * @module Badge
 * Reusable Badge component following the Vital Integrity design system.
 *
 * Status indicators with color-coded backgrounds for quality intelligence workflows.
 *
 * Variants:
 * - success: Living Green background, dark green text (passed, healthy, compliant, active, connected)
 * - warning: Yellow/amber background, dark yellow text (at_risk, pending, in_review, in_progress, degraded, waived)
 * - error: Red background, dark red text (failed, critical, non_compliant, disconnected, blocked, cancelled)
 * - info: Blue background, dark blue text (info, draft, not_started, syncing)
 * - neutral: Gray background, dark gray text (inactive, archived, unknown, skipped)
 * - accent: Deep Forest Teal background, white text (approved, ready)
 *
 * Supports text and icon variants, multiple sizes, and optional dot indicator.
 */

/**
 * Base CSS classes shared across all badge variants.
 * @type {string}
 */
const BASE_CLASSES =
  'inline-flex items-center gap-0.5 font-medium rounded-full select-none whitespace-nowrap';

/**
 * Variant-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const VARIANT_CLASSES = Object.freeze({
  success: 'bg-living-green-100 text-living-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-700',
  accent: 'bg-deep-forest-teal text-white',
});

/**
 * Size-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  sm: 'text-[10px] px-1 py-[1px]',
  md: 'text-xs px-1 py-0.5',
  lg: 'text-sm px-1.5 py-0.5',
});

/**
 * Dot indicator size classes.
 * @type {Readonly<object>}
 */
const DOT_SIZE_CLASSES = Object.freeze({
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
});

/**
 * Dot indicator color classes per variant.
 * @type {Readonly<object>}
 */
const DOT_COLOR_CLASSES = Object.freeze({
  success: 'bg-living-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-400',
  accent: 'bg-white',
});

/**
 * Map of common status strings to badge variants.
 * @type {Readonly<object>}
 */
const STATUS_VARIANT_MAP = Object.freeze({
  // Success statuses
  passed: 'success',
  healthy: 'success',
  compliant: 'success',
  active: 'success',
  connected: 'success',
  completed: 'success',
  success: 'success',
  ready: 'accent',
  approved: 'accent',

  // Warning statuses
  at_risk: 'warning',
  pending: 'warning',
  in_review: 'warning',
  in_progress: 'warning',
  degraded: 'warning',
  waived: 'warning',
  warning: 'warning',
  on_hold: 'warning',
  partial: 'warning',
  syncing: 'warning',
  monitoring: 'warning',

  // Error statuses
  failed: 'error',
  critical: 'error',
  non_compliant: 'error',
  disconnected: 'error',
  blocked: 'error',
  cancelled: 'error',
  error: 'error',
  rejected: 'error',
  rolled_back: 'error',
  high: 'error',

  // Info statuses
  info: 'info',
  draft: 'info',
  not_started: 'info',
  not_run: 'info',
  low: 'info',
  medium: 'info',
  standby: 'info',

  // Neutral statuses
  inactive: 'neutral',
  archived: 'neutral',
  unknown: 'neutral',
  skipped: 'neutral',
  not_applicable: 'neutral',
});

/**
 * Resolve a status string to a badge variant.
 * @param {string} status - The status string to resolve.
 * @returns {string} The resolved variant key.
 */
function resolveVariant(status) {
  if (!status || typeof status !== 'string') {
    return 'neutral';
  }

  const normalized = status.toLowerCase().replace(/[\s-]+/g, '_');

  if (STATUS_VARIANT_MAP[normalized]) {
    return STATUS_VARIANT_MAP[normalized];
  }

  return 'neutral';
}

/**
 * Format a status string for display.
 * Converts snake_case and kebab-case to Title Case.
 * @param {string} status - The status string to format.
 * @returns {string} The formatted display string.
 */
function formatStatusLabel(status) {
  if (!status || typeof status !== 'string') {
    return '';
  }

  return status
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Reusable Badge component with variant, size, icon, dot, and status support.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} [props.children] - Badge label content. Overrides label prop.
 * @param {string} [props.label] - Badge label text. Used when children is not provided.
 * @param {'success'|'warning'|'error'|'info'|'neutral'|'accent'} [props.variant] - Visual variant. If not provided, resolved from status prop.
 * @param {string} [props.status] - Status string used to auto-resolve variant and label. Overridden by explicit variant prop.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {React.ReactNode} [props.iconLeft] - Icon element rendered before the label.
 * @param {React.ReactNode} [props.iconRight] - Icon element rendered after the label.
 * @param {boolean} [props.dot=false] - Whether to show a colored dot indicator before the label.
 * @param {boolean} [props.uppercase=false] - Whether to render the label in uppercase.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the badge.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {object} [props.rest] - Any additional HTML attributes.
 * @returns {React.ReactElement} The rendered Badge element.
 */
export default function Badge({
  children,
  label,
  variant,
  status,
  size = 'md',
  iconLeft,
  iconRight,
  dot = false,
  uppercase = false,
  className = '',
  ariaLabel,
  testId,
  ...rest
}) {
  const resolvedVariant = variant || (status ? resolveVariant(status) : 'neutral');
  const variantClasses = VARIANT_CLASSES[resolvedVariant] || VARIANT_CLASSES.neutral;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const dotSizeClass = DOT_SIZE_CLASSES[size] || DOT_SIZE_CLASSES.md;
  const dotColorClass = DOT_COLOR_CLASSES[resolvedVariant] || DOT_COLOR_CLASSES.neutral;

  const displayContent = children || label || (status ? formatStatusLabel(status) : '');

  const combinedClasses = [
    BASE_CLASSES,
    variantClasses,
    sizeClasses,
    uppercase ? 'uppercase tracking-wider' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={combinedClasses}
      aria-label={ariaLabel}
      role="status"
      data-testid={testId}
      {...rest}
    >
      {dot && (
        <span
          className={`${dotSizeClass} ${dotColorClass} rounded-full shrink-0`}
          aria-hidden="true"
        />
      )}

      {!dot && iconLeft && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {iconLeft}
        </span>
      )}

      {displayContent && <span>{displayContent}</span>}

      {iconRight && (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </span>
  );
}

Badge.propTypes = {
  /** Badge label content. Overrides label prop. */
  children: PropTypes.node,
  /** Badge label text. Used when children is not provided. */
  label: PropTypes.string,
  /** Visual variant of the badge. If not provided, resolved from status prop. */
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info', 'neutral', 'accent']),
  /** Status string used to auto-resolve variant and label. */
  status: PropTypes.string,
  /** Size variant of the badge. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Icon element rendered before the label. */
  iconLeft: PropTypes.node,
  /** Icon element rendered after the label. */
  iconRight: PropTypes.node,
  /** Whether to show a colored dot indicator before the label. */
  dot: PropTypes.bool,
  /** Whether to render the label in uppercase. */
  uppercase: PropTypes.bool,
  /** Additional CSS classes to append to the badge element. */
  className: PropTypes.string,
  /** Accessible label for the badge. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};

/**
 * Resolve a status string to a badge variant.
 * Exported for use in other components that need to determine badge colors.
 *
 * @param {string} status - The status string to resolve.
 * @returns {string} The resolved variant key.
 */
export { resolveVariant, formatStatusLabel, STATUS_VARIANT_MAP };