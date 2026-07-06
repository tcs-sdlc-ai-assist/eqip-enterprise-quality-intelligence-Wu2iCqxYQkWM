import PropTypes from 'prop-types';

/**
 * @module Button
 * Reusable Button component following the Vital Integrity design system.
 *
 * Variants:
 * - primary: Deep Forest Teal background, white text, 4px border radius
 * - secondary: Transparent background, 2px Living Green border, Living Green text, 4px border radius
 * - accent: Living Green background, white text
 * - ghost: Transparent background, Deep Forest Teal text
 * - danger: Red background, white text
 *
 * Supports disabled, loading, icon (left/right), and size variants.
 * Fully keyboard accessible with visible focus indicators.
 */

/**
 * Loading spinner SVG component rendered inside the button during loading state.
 * @returns {React.ReactElement} An animated SVG spinner.
 */
function LoadingSpinner() {
  return (
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
  );
}

/**
 * Base CSS classes shared across all button variants.
 * @type {string}
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 font-medium rounded-standard transition-all duration-150 cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

/**
 * Variant-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const VARIANT_CLASSES = Object.freeze({
  primary:
    'bg-deep-forest-teal text-white border-deep-forest-teal hover:bg-deep-forest-teal-700 active:bg-deep-forest-teal-900 focus-visible:ring-deep-forest-teal-500',
  secondary:
    'bg-transparent text-living-green-600 border-2 border-living-green hover:bg-living-green-50 active:bg-living-green-100 focus-visible:ring-living-green-500',
  accent:
    'bg-living-green text-white border-living-green hover:bg-living-green-600 active:bg-living-green-700 focus-visible:ring-living-green-500',
  ghost:
    'bg-transparent text-deep-forest-teal-700 border-transparent hover:bg-deep-forest-teal-50 active:bg-deep-forest-teal-100 focus-visible:ring-deep-forest-teal-400',
  danger:
    'bg-red-600 text-white border-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
});

/**
 * Size-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
});

/**
 * Reusable Button component with variant, size, loading, icon, and disabled support.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} [props.children] - Button label content.
 * @param {'primary'|'secondary'|'accent'|'ghost'|'danger'} [props.variant='primary'] - Visual variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {boolean} [props.loading=false] - Whether the button is in a loading state.
 * @param {string} [props.loadingText] - Text to display while loading. Falls back to children if not provided.
 * @param {React.ReactNode} [props.iconLeft] - Icon element rendered before the label.
 * @param {React.ReactNode} [props.iconRight] - Icon element rendered after the label.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - HTML button type attribute.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the button.
 * @param {function} [props.onClick] - Click event handler.
 * @param {object} [props.rest] - Any additional HTML button attributes.
 * @returns {React.ReactElement} The rendered Button element.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingText,
  iconLeft,
  iconRight,
  type = 'button',
  className = '',
  ariaLabel,
  onClick,
  ...rest
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const isDisabled = disabled || loading;

  const combinedClasses = [
    BASE_CLASSES,
    variantClasses,
    sizeClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const displayContent = loading ? (loadingText || children) : children;

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading ? (
        <LoadingSpinner />
      ) : iconLeft ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {iconLeft}
        </span>
      ) : null}

      {displayContent && <span>{displayContent}</span>}

      {!loading && iconRight ? (
        <span className="inline-flex shrink-0" aria-hidden="true">
          {iconRight}
        </span>
      ) : null}
    </button>
  );
}

Button.propTypes = {
  /** Button label content. */
  children: PropTypes.node,
  /** Visual variant of the button. */
  variant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost', 'danger']),
  /** Size variant of the button. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether the button is disabled. */
  disabled: PropTypes.bool,
  /** Whether the button is in a loading state. Disables the button and shows a spinner. */
  loading: PropTypes.bool,
  /** Text to display while loading. Falls back to children if not provided. */
  loadingText: PropTypes.string,
  /** Icon element rendered before the label. */
  iconLeft: PropTypes.node,
  /** Icon element rendered after the label. */
  iconRight: PropTypes.node,
  /** HTML button type attribute. */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Additional CSS classes to append to the button element. */
  className: PropTypes.string,
  /** Accessible label for the button. */
  ariaLabel: PropTypes.string,
  /** Click event handler. */
  onClick: PropTypes.func,
};