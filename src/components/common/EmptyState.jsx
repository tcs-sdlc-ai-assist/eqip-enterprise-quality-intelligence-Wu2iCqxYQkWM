import PropTypes from 'prop-types';
import Button from './Button.jsx';

/**
 * @module EmptyState
 * Reusable EmptyState component following the Vital Integrity design system.
 *
 * Displays a centered icon, title, description, and optional action button
 * when no data is available for a given screen or section.
 *
 * Variants:
 * - base: Standard empty state with gray tones
 * - tinted: Deep Forest Teal tinted background
 * - compact: Smaller padding and text for inline/card usage
 *
 * Supports custom icon, title, description, action button, and additional content.
 */

/**
 * Base CSS classes for the empty state container.
 * @type {string}
 */
const BASE_CLASSES = 'flex flex-col items-center justify-center text-center';

/**
 * Variant-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const VARIANT_CLASSES = Object.freeze({
  base: 'bg-white',
  tinted: 'bg-deep-forest-teal-50 rounded-card',
  compact: 'bg-white',
});

/**
 * Size-specific CSS class mappings for padding.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  base: 'py-6 px-3',
  tinted: 'py-6 px-3',
  compact: 'py-3 px-2',
});

/**
 * Title size classes per variant.
 * @type {Readonly<object>}
 */
const TITLE_SIZE_CLASSES = Object.freeze({
  base: 'text-base font-medium text-gray-700',
  tinted: 'text-base font-medium text-deep-forest-teal-800',
  compact: 'text-sm font-medium text-gray-700',
});

/**
 * Description size classes per variant.
 * @type {Readonly<object>}
 */
const DESCRIPTION_SIZE_CLASSES = Object.freeze({
  base: 'text-sm text-gray-500',
  tinted: 'text-sm text-deep-forest-teal-600',
  compact: 'text-xs text-gray-500',
});

/**
 * Icon container size classes per variant.
 * @type {Readonly<object>}
 */
const ICON_SIZE_CLASSES = Object.freeze({
  base: 'mb-2',
  tinted: 'mb-2',
  compact: 'mb-1',
});

/**
 * Default empty state SVG icon.
 * Renders a simple table/grid icon indicating no data.
 * @returns {React.ReactElement} An SVG icon element.
 */
function DefaultIcon() {
  return (
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
  );
}

/**
 * Compact default SVG icon for the compact variant.
 * @returns {React.ReactElement} A smaller SVG icon element.
 */
function CompactDefaultIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
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
  );
}

/**
 * Reusable EmptyState component with icon, title, description, and optional action button.
 *
 * @param {object} props - Component props.
 * @param {string} [props.title] - The empty state title text. Defaults to 'No data available'.
 * @param {string} [props.description] - The empty state description text. Defaults to a generic message.
 * @param {React.ReactNode} [props.icon] - Custom icon element rendered above the title. If not provided, a default icon is used.
 * @param {boolean} [props.hideIcon=false] - Whether to hide the icon entirely.
 * @param {string} [props.actionLabel] - Label for the optional action button.
 * @param {function} [props.onAction] - Click handler for the optional action button.
 * @param {'primary'|'secondary'|'accent'|'ghost'} [props.actionVariant='primary'] - Visual variant for the action button.
 * @param {'sm'|'md'|'lg'} [props.actionSize='md'] - Size variant for the action button.
 * @param {React.ReactNode} [props.actionIcon] - Icon element rendered inside the action button (left position).
 * @param {'base'|'tinted'|'compact'} [props.variant='base'] - Visual variant of the empty state.
 * @param {boolean} [props.fullWidth=false] - Whether the empty state takes full width of its container.
 * @param {React.ReactNode} [props.children] - Additional content rendered below the description and above the action button.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the empty state region.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered EmptyState element.
 */
export default function EmptyState({
  title,
  description,
  icon,
  hideIcon = false,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  actionSize = 'md',
  actionIcon,
  variant = 'base',
  fullWidth = false,
  children,
  className = '',
  ariaLabel,
  testId,
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.base;
  const sizeClasses = SIZE_CLASSES[variant] || SIZE_CLASSES.base;
  const titleClasses = TITLE_SIZE_CLASSES[variant] || TITLE_SIZE_CLASSES.base;
  const descriptionClasses = DESCRIPTION_SIZE_CLASSES[variant] || DESCRIPTION_SIZE_CLASSES.base;
  const iconContainerClasses = ICON_SIZE_CLASSES[variant] || ICON_SIZE_CLASSES.base;

  const isCompact = variant === 'compact';

  const defaultTitle = 'No data available';
  const defaultDescription =
    'There are no records to display. Try adjusting your filters or search criteria.';

  const displayTitle = title || defaultTitle;
  const displayDescription = description !== undefined ? description : defaultDescription;

  const hasAction =
    actionLabel &&
    typeof actionLabel === 'string' &&
    actionLabel.trim() !== '' &&
    typeof onAction === 'function';

  const iconColorClass =
    variant === 'tinted' ? 'text-deep-forest-teal-300' : 'text-gray-300';

  const renderIcon = () => {
    if (hideIcon) {
      return null;
    }

    if (icon) {
      return (
        <div className={`${iconContainerClasses} ${iconColorClass}`}>
          {icon}
        </div>
      );
    }

    return (
      <div className={`${iconContainerClasses} ${iconColorClass}`}>
        {isCompact ? <CompactDefaultIcon /> : <DefaultIcon />}
      </div>
    );
  };

  const combinedClasses = [
    BASE_CLASSES,
    variantClasses,
    sizeClasses,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={combinedClasses}
      role="status"
      aria-label={ariaLabel || displayTitle}
      data-testid={testId}
    >
      {renderIcon()}

      <h3 className={[titleClasses, isCompact ? 'mb-0.5' : 'mb-0.5'].join(' ')}>
        {displayTitle}
      </h3>

      {displayDescription && (
        <p className={[descriptionClasses, 'max-w-xs', isCompact ? '' : ''].filter(Boolean).join(' ')}>
          {displayDescription}
        </p>
      )}

      {children && (
        <div className={isCompact ? 'mt-1' : 'mt-2'}>
          {children}
        </div>
      )}

      {hasAction && (
        <div className={isCompact ? 'mt-1' : 'mt-2'}>
          <Button
            variant={actionVariant}
            size={actionSize}
            onClick={onAction}
            iconLeft={actionIcon}
            ariaLabel={actionLabel}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

EmptyState.propTypes = {
  /** The empty state title text. Defaults to 'No data available'. */
  title: PropTypes.string,
  /** The empty state description text. Defaults to a generic message. Set to null or '' to hide. */
  description: PropTypes.string,
  /** Custom icon element rendered above the title. If not provided, a default icon is used. */
  icon: PropTypes.node,
  /** Whether to hide the icon entirely. */
  hideIcon: PropTypes.bool,
  /** Label for the optional action button. */
  actionLabel: PropTypes.string,
  /** Click handler for the optional action button. */
  onAction: PropTypes.func,
  /** Visual variant for the action button. */
  actionVariant: PropTypes.oneOf(['primary', 'secondary', 'accent', 'ghost']),
  /** Size variant for the action button. */
  actionSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Icon element rendered inside the action button (left position). */
  actionIcon: PropTypes.node,
  /** Visual variant of the empty state. */
  variant: PropTypes.oneOf(['base', 'tinted', 'compact']),
  /** Whether the empty state takes full width of its container. */
  fullWidth: PropTypes.bool,
  /** Additional content rendered below the description and above the action button. */
  children: PropTypes.node,
  /** Additional CSS classes to append to the empty state container. */
  className: PropTypes.string,
  /** Accessible label for the empty state region. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};