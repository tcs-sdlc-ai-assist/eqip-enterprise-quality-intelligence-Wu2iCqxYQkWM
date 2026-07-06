import PropTypes from 'prop-types';

/**
 * @module Card
 * Reusable Card component following the Vital Integrity design system.
 *
 * Flat card with 1px border, 8px corner radius, tonal background layers, no drop shadows.
 * Supports header, body, footer slots with optional interactive hover state.
 *
 * Variants:
 * - base: White background, standard border
 * - raised: Gray-50 background, lighter border
 * - sunken: Gray-100 background, standard border
 * - tinted: Deep Forest Teal-50 background, teal-tinted border
 *
 * Supports optional header, body, footer sections, and interactive hover state.
 */

/**
 * Base CSS classes shared across all card variants.
 * @type {string}
 */
const BASE_CLASSES = 'border rounded-card overflow-hidden';

/**
 * Variant-specific CSS class mappings.
 * @type {Readonly<object>}
 */
const VARIANT_CLASSES = Object.freeze({
  base: 'bg-white border-[#E0E0E0]',
  raised: 'bg-gray-50 border-gray-100',
  sunken: 'bg-gray-100 border-[#E0E0E0]',
  tinted: 'bg-deep-forest-teal-50 border-deep-forest-teal-200',
});

/**
 * Padding size CSS class mappings.
 * @type {Readonly<object>}
 */
const PADDING_CLASSES = Object.freeze({
  none: '',
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
});

/**
 * Card component with header, body, and footer slots.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} [props.children] - Card body content. Used when header/body/footer slots are not needed.
 * @param {React.ReactNode} [props.header] - Content rendered in the card header section with bottom border.
 * @param {React.ReactNode} [props.body] - Content rendered in the card body section.
 * @param {React.ReactNode} [props.footer] - Content rendered in the card footer section with top border and tinted background.
 * @param {'base'|'raised'|'sunken'|'tinted'} [props.variant='base'] - Visual variant.
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md'] - Padding size for the body/children area when no slots are used.
 * @param {boolean} [props.interactive=false] - Whether the card has a hover state with border color change.
 * @param {boolean} [props.fullWidth=false] - Whether the card takes full width of its container.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the card.
 * @param {string} [props.role] - ARIA role for the card element.
 * @param {function} [props.onClick] - Click event handler. When provided, the card becomes interactive automatically.
 * @param {object} [props.rest] - Any additional HTML attributes.
 * @returns {React.ReactElement} The rendered Card element.
 */
export default function Card({
  children,
  header,
  body,
  footer,
  variant = 'base',
  padding = 'md',
  interactive = false,
  fullWidth = false,
  className = '',
  ariaLabel,
  role,
  onClick,
  ...rest
}) {
  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.base;
  const isInteractive = interactive || typeof onClick === 'function';

  const interactiveClasses = isInteractive
    ? 'transition-colors duration-200 hover:border-gray-300 cursor-pointer'
    : '';

  const widthClasses = fullWidth ? 'w-full' : '';

  const combinedClasses = [
    BASE_CLASSES,
    variantClasses,
    interactiveClasses,
    widthClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasSlots = header !== undefined || body !== undefined || footer !== undefined;

  const Tag = onClick ? 'div' : 'div';

  return (
    <Tag
      className={combinedClasses}
      aria-label={ariaLabel}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...rest}
    >
      {hasSlots ? (
        <>
          {header !== undefined && header !== null && (
            <div className="px-3 py-2 border-b border-[#E0E0E0]">
              {header}
            </div>
          )}

          {body !== undefined && body !== null && (
            <div className={PADDING_CLASSES[padding] || PADDING_CLASSES.md}>
              {body}
            </div>
          )}

          {children && !body && (
            <div className={PADDING_CLASSES[padding] || PADDING_CLASSES.md}>
              {children}
            </div>
          )}

          {footer !== undefined && footer !== null && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-card">
              {footer}
            </div>
          )}
        </>
      ) : (
        <div className={PADDING_CLASSES[padding] || PADDING_CLASSES.md}>
          {children}
        </div>
      )}
    </Tag>
  );
}

/**
 * CardHeader component for composing card sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Header content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered CardHeader element.
 */
export function CardHeader({ children, className = '' }) {
  const combinedClasses = [
    'px-3 py-2 border-b border-[#E0E0E0]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

CardHeader.propTypes = {
  /** Header content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * CardBody component for composing card sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Body content.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md'] - Padding size.
 * @returns {React.ReactElement} The rendered CardBody element.
 */
export function CardBody({ children, className = '', padding = 'md' }) {
  const paddingClass = PADDING_CLASSES[padding] || PADDING_CLASSES.md;

  const combinedClasses = [
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

CardBody.propTypes = {
  /** Body content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
  /** Padding size. */
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
};

/**
 * CardFooter component for composing card sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Footer content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered CardFooter element.
 */
export function CardFooter({ children, className = '' }) {
  const combinedClasses = [
    'px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-card',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

CardFooter.propTypes = {
  /** Footer content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

Card.propTypes = {
  /** Card body content. Used when header/body/footer slots are not needed. */
  children: PropTypes.node,
  /** Content rendered in the card header section with bottom border. */
  header: PropTypes.node,
  /** Content rendered in the card body section. */
  body: PropTypes.node,
  /** Content rendered in the card footer section with top border and tinted background. */
  footer: PropTypes.node,
  /** Visual variant of the card. */
  variant: PropTypes.oneOf(['base', 'raised', 'sunken', 'tinted']),
  /** Padding size for the body/children area. */
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  /** Whether the card has a hover state with border color change. */
  interactive: PropTypes.bool,
  /** Whether the card takes full width of its container. */
  fullWidth: PropTypes.bool,
  /** Additional CSS classes to append to the card element. */
  className: PropTypes.string,
  /** Accessible label for the card. */
  ariaLabel: PropTypes.string,
  /** ARIA role for the card element. */
  role: PropTypes.string,
  /** Click event handler. When provided, the card becomes interactive automatically. */
  onClick: PropTypes.func,
};