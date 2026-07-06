import PropTypes from 'prop-types';

/**
 * @module ProgressBar
 * Reusable ProgressBar component following the Vital Integrity design system.
 *
 * Horizontal bar with percentage fill, color variants based on value thresholds,
 * label, and ARIA progressbar role.
 *
 * Variants:
 * - auto: Automatically selects color based on value thresholds (default)
 * - success: Living Green fill
 * - warning: Yellow/amber fill
 * - error: Red fill
 * - info: Blue fill
 * - accent: Deep Forest Teal fill
 * - neutral: Gray fill
 *
 * Sizes:
 * - xs: 4px height
 * - sm: 6px height
 * - md: 8px height (default)
 * - lg: 12px height
 * - xl: 16px height
 *
 * Supports label, value display, min/max, thresholds, and animation.
 */

/**
 * Base CSS classes for the progress bar track (background).
 * @type {string}
 */
const TRACK_BASE_CLASSES = 'w-full rounded-full overflow-hidden';

/**
 * Base CSS classes for the progress bar fill (foreground).
 * @type {string}
 */
const FILL_BASE_CLASSES = 'rounded-full transition-all duration-300 ease-out';

/**
 * Variant-specific CSS class mappings for the track background.
 * @type {Readonly<object>}
 */
const TRACK_VARIANT_CLASSES = Object.freeze({
  success: 'bg-living-green-100',
  warning: 'bg-yellow-100',
  error: 'bg-red-100',
  info: 'bg-blue-100',
  accent: 'bg-deep-forest-teal-50',
  neutral: 'bg-gray-200',
  auto: 'bg-gray-200',
});

/**
 * Variant-specific CSS class mappings for the fill bar.
 * @type {Readonly<object>}
 */
const FILL_VARIANT_CLASSES = Object.freeze({
  success: 'bg-living-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  accent: 'bg-deep-forest-teal',
  neutral: 'bg-gray-400',
});

/**
 * Size-specific CSS class mappings for the track height.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  xs: 'h-[4px]',
  sm: 'h-[6px]',
  md: 'h-[8px]',
  lg: 'h-[12px]',
  xl: 'h-[16px]',
});

/**
 * Default thresholds for auto variant color selection.
 * @type {Readonly<object>}
 */
const DEFAULT_THRESHOLDS = Object.freeze({
  error: 33,
  warning: 66,
  success: 100,
});

/**
 * Resolve the fill variant based on the current value and thresholds.
 * Used when variant is 'auto'.
 *
 * @param {number} percentage - The current percentage value (0-100).
 * @param {object} thresholds - The threshold configuration.
 * @param {number} thresholds.error - Values at or below this are error (red).
 * @param {number} thresholds.warning - Values at or below this are warning (yellow).
 * @param {number} thresholds.success - Values above warning threshold are success (green).
 * @param {boolean} invertThresholds - If true, lower values are better (e.g., defect density).
 * @returns {string} The resolved variant key.
 */
function resolveAutoVariant(percentage, thresholds, invertThresholds) {
  const t = thresholds || DEFAULT_THRESHOLDS;
  const errorThreshold = typeof t.error === 'number' ? t.error : DEFAULT_THRESHOLDS.error;
  const warningThreshold = typeof t.warning === 'number' ? t.warning : DEFAULT_THRESHOLDS.warning;

  if (invertThresholds) {
    if (percentage <= errorThreshold) {
      return 'success';
    }
    if (percentage <= warningThreshold) {
      return 'warning';
    }
    return 'error';
  }

  if (percentage <= errorThreshold) {
    return 'error';
  }
  if (percentage <= warningThreshold) {
    return 'warning';
  }
  return 'success';
}

/**
 * Format a numeric value for display.
 * @param {number} value - The value to format.
 * @param {string} [unit='%'] - The unit to append.
 * @returns {string} The formatted value string.
 */
function formatValue(value, unit) {
  if (value === null || value === undefined || typeof value !== 'number') {
    return '';
  }

  const displayValue = Number.isInteger(value) ? String(value) : value.toFixed(1);

  if (unit === '%') {
    return displayValue + '%';
  }

  if (unit && typeof unit === 'string') {
    return displayValue + ' ' + unit;
  }

  return displayValue + '%';
}

/**
 * Reusable ProgressBar component with variant, size, label, value display,
 * threshold-based coloring, and ARIA progressbar role.
 *
 * @param {object} props - Component props.
 * @param {number} [props.value=0] - The current value of the progress bar.
 * @param {number} [props.min=0] - The minimum value.
 * @param {number} [props.max=100] - The maximum value.
 * @param {'auto'|'success'|'warning'|'error'|'info'|'accent'|'neutral'} [props.variant='auto'] - Visual variant. 'auto' selects color based on thresholds.
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Size variant controlling bar height.
 * @param {string} [props.label] - Label text displayed above the progress bar.
 * @param {boolean} [props.showValue=false] - Whether to display the current value/percentage.
 * @param {string} [props.unit='%'] - The unit to display after the value.
 * @param {string} [props.valueLabel] - Custom value label to display instead of the computed value.
 * @param {object} [props.thresholds] - Custom thresholds for auto variant color selection.
 * @param {number} [props.thresholds.error] - Values at or below this threshold are red.
 * @param {number} [props.thresholds.warning] - Values at or below this threshold are yellow.
 * @param {number} [props.thresholds.success] - Values above warning threshold are green.
 * @param {boolean} [props.invertThresholds=false] - If true, lower values are better (inverts threshold logic).
 * @param {boolean} [props.animate=true] - Whether to animate the fill bar width transition.
 * @param {boolean} [props.striped=false] - Whether to apply a striped pattern to the fill bar.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.trackClassName] - Additional CSS classes for the track element.
 * @param {string} [props.fillClassName] - Additional CSS classes for the fill element.
 * @param {string} [props.ariaLabel] - Accessible label for the progress bar.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered ProgressBar element.
 */
export default function ProgressBar({
  value = 0,
  min = 0,
  max = 100,
  variant = 'auto',
  size = 'md',
  label,
  showValue = false,
  unit = '%',
  valueLabel,
  thresholds,
  invertThresholds = false,
  animate = true,
  striped = false,
  className = '',
  trackClassName = '',
  fillClassName = '',
  ariaLabel,
  testId,
}) {
  const safeMin = typeof min === 'number' ? min : 0;
  const safeMax = typeof max === 'number' && max > safeMin ? max : 100;
  const safeValue = typeof value === 'number'
    ? Math.min(Math.max(value, safeMin), safeMax)
    : safeMin;

  const range = safeMax - safeMin;
  const percentage = range > 0
    ? Math.round(((safeValue - safeMin) / range) * 10000) / 100
    : 0;

  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const resolvedVariant = variant === 'auto'
    ? resolveAutoVariant(clampedPercentage, thresholds, invertThresholds)
    : variant;

  const trackVariantClasses = TRACK_VARIANT_CLASSES[variant === 'auto' ? 'auto' : resolvedVariant] || TRACK_VARIANT_CLASSES.auto;
  const fillVariantClasses = FILL_VARIANT_CLASSES[resolvedVariant] || FILL_VARIANT_CLASSES.neutral;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const displayValue = valueLabel || formatValue(safeValue, unit);

  const hasLabel = label && typeof label === 'string';
  const hasValue = showValue || (valueLabel && typeof valueLabel === 'string');

  const trackCombinedClasses = [
    TRACK_BASE_CLASSES,
    trackVariantClasses,
    sizeClasses,
    trackClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const fillCombinedClasses = [
    FILL_BASE_CLASSES,
    fillVariantClasses,
    sizeClasses,
    animate ? '' : 'transition-none',
    striped ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%]' : '',
    fillClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const rootClasses = [
    'w-full',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses} data-testid={testId}>
      {(hasLabel || hasValue) && (
        <div className="flex items-center justify-between gap-1 mb-0.5">
          {hasLabel && (
            <span className="text-xs font-medium text-gray-700 truncate">
              {label}
            </span>
          )}
          {hasValue && (
            <span className="text-xs font-medium text-gray-500 shrink-0">
              {displayValue}
            </span>
          )}
        </div>
      )}

      <div
        className={trackCombinedClasses}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemin={safeMin}
        aria-valuemax={safeMax}
        aria-label={ariaLabel || label || `Progress: ${Math.round(clampedPercentage)}%`}
      >
        <div
          className={fillCombinedClasses}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  /** The current value of the progress bar. */
  value: PropTypes.number,
  /** The minimum value. */
  min: PropTypes.number,
  /** The maximum value. */
  max: PropTypes.number,
  /** Visual variant. 'auto' selects color based on thresholds. */
  variant: PropTypes.oneOf(['auto', 'success', 'warning', 'error', 'info', 'accent', 'neutral']),
  /** Size variant controlling bar height. */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  /** Label text displayed above the progress bar. */
  label: PropTypes.string,
  /** Whether to display the current value/percentage. */
  showValue: PropTypes.bool,
  /** The unit to display after the value. */
  unit: PropTypes.string,
  /** Custom value label to display instead of the computed value. */
  valueLabel: PropTypes.string,
  /** Custom thresholds for auto variant color selection. */
  thresholds: PropTypes.shape({
    error: PropTypes.number,
    warning: PropTypes.number,
    success: PropTypes.number,
  }),
  /** If true, lower values are better (inverts threshold logic). */
  invertThresholds: PropTypes.bool,
  /** Whether to animate the fill bar width transition. */
  animate: PropTypes.bool,
  /** Whether to apply a striped pattern to the fill bar. */
  striped: PropTypes.bool,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Additional CSS classes for the track element. */
  trackClassName: PropTypes.string,
  /** Additional CSS classes for the fill element. */
  fillClassName: PropTypes.string,
  /** Accessible label for the progress bar. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};

/**
 * Resolve the auto variant for a given percentage and thresholds.
 * Exported for use in other components that need to determine progress bar colors.
 *
 * @param {number} percentage - The current percentage value (0-100).
 * @param {object} [thresholds] - The threshold configuration.
 * @param {boolean} [invertThresholds=false] - If true, lower values are better.
 * @returns {string} The resolved variant key.
 */
export { resolveAutoVariant, DEFAULT_THRESHOLDS };