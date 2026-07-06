import PropTypes from 'prop-types';

/**
 * @module Timeline
 * Reusable Timeline component following the Vital Integrity design system.
 *
 * Vertical timeline with timestamped entries, icons, descriptions, and optional metadata.
 * Used for audit logs, history views, and activity feeds.
 *
 * Variants:
 * - base: Standard timeline with gray connector lines
 * - compact: Smaller spacing and text for dense layouts
 * - tinted: Deep Forest Teal tinted connector and icon backgrounds
 *
 * Sizes:
 * - sm: Compact timeline for inline/card usage
 * - md: Default timeline
 * - lg: Large timeline for full-page views
 *
 * Supports custom icons, timestamps, descriptions, metadata, and clickable entries.
 */

/**
 * Base CSS classes for the timeline container.
 * @type {string}
 */
const CONTAINER_CLASSES = 'flex flex-col w-full';

/**
 * Variant-specific CSS class mappings for the connector line.
 * @type {Readonly<object>}
 */
const CONNECTOR_VARIANT_CLASSES = Object.freeze({
  base: 'border-gray-200',
  compact: 'border-gray-200',
  tinted: 'border-deep-forest-teal-200',
});

/**
 * Variant-specific CSS class mappings for the icon circle background.
 * @type {Readonly<object>}
 */
const ICON_BG_VARIANT_CLASSES = Object.freeze({
  base: 'bg-gray-100 text-gray-500 border-gray-200',
  compact: 'bg-gray-100 text-gray-500 border-gray-200',
  tinted: 'bg-deep-forest-teal-50 text-deep-forest-teal-600 border-deep-forest-teal-200',
});

/**
 * Size-specific CSS class mappings for the icon circle.
 * @type {Readonly<object>}
 */
const ICON_SIZE_CLASSES = Object.freeze({
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
});

/**
 * Size-specific CSS class mappings for the connector line left offset.
 * @type {Readonly<object>}
 */
const CONNECTOR_LEFT_CLASSES = Object.freeze({
  sm: 'left-[11px]',
  md: 'left-[15px]',
  lg: 'left-[19px]',
});

/**
 * Size-specific CSS class mappings for the title text.
 * @type {Readonly<object>}
 */
const TITLE_SIZE_CLASSES = Object.freeze({
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
});

/**
 * Size-specific CSS class mappings for the description text.
 * @type {Readonly<object>}
 */
const DESCRIPTION_SIZE_CLASSES = Object.freeze({
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
});

/**
 * Size-specific CSS class mappings for the timestamp text.
 * @type {Readonly<object>}
 */
const TIMESTAMP_SIZE_CLASSES = Object.freeze({
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
});

/**
 * Size-specific CSS class mappings for the metadata text.
 * @type {Readonly<object>}
 */
const METADATA_SIZE_CLASSES = Object.freeze({
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
});

/**
 * Size-specific CSS class mappings for the entry content padding.
 * @type {Readonly<object>}
 */
const CONTENT_PADDING_CLASSES = Object.freeze({
  sm: 'pl-1 pb-1',
  md: 'pl-1.5 pb-2',
  lg: 'pl-2 pb-3',
});

/**
 * Size-specific CSS class mappings for the gap between icon and content.
 * @type {Readonly<object>}
 */
const GAP_CLASSES = Object.freeze({
  sm: 'gap-0.5',
  md: 'gap-1',
  lg: 'gap-1.5',
});

/**
 * Default circle icon SVG for timeline entries without a custom icon.
 * @param {object} props - Component props.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @returns {React.ReactElement} An SVG circle icon.
 */
function DefaultIcon({ size = 'md' }) {
  const dimension = size === 'lg' ? 12 : size === 'sm' ? 8 : 10;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

DefaultIcon.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Format a timestamp value for display.
 * Accepts ISO strings, Date objects, or pre-formatted strings.
 *
 * @param {string|Date} timestamp - The timestamp to format.
 * @returns {string} The formatted timestamp string.
 */
function formatTimestamp(timestamp) {
  if (!timestamp) {
    return '';
  }

  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return timestamp;
  }

  if (timestamp instanceof Date) {
    if (!isNaN(timestamp.getTime())) {
      return timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
    return '';
  }

  return String(timestamp);
}

/**
 * Reusable Timeline component with vertical layout, timestamped entries,
 * icons, descriptions, metadata, and optional click handling.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.entries - Array of timeline entry definitions.
 * @param {string} [props.entries[].id] - Unique identifier for the entry.
 * @param {string} props.entries[].title - The entry title/label text.
 * @param {string} [props.entries[].description] - Optional description text displayed below the title.
 * @param {string|Date} [props.entries[].timestamp] - Timestamp for the entry. Formatted automatically if ISO string or Date.
 * @param {string} [props.entries[].formattedTimestamp] - Pre-formatted timestamp string. Overrides timestamp formatting.
 * @param {React.ReactNode} [props.entries[].icon] - Custom icon element for the entry circle. If not provided, a default dot icon is used.
 * @param {string} [props.entries[].iconColor] - Custom CSS class for the icon circle color (overrides variant default).
 * @param {Array<{label: string, value: string}>} [props.entries[].metadata] - Array of metadata key-value pairs displayed below the description.
 * @param {React.ReactNode} [props.entries[].badge] - Optional badge element rendered next to the title.
 * @param {React.ReactNode} [props.entries[].children] - Additional content rendered below the metadata.
 * @param {boolean} [props.entries[].disabled=false] - Whether the entry is visually dimmed and not clickable.
 * @param {'base'|'compact'|'tinted'} [props.variant='base'] - Visual variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {boolean} [props.showTimestamps=true] - Whether to display timestamps on entries.
 * @param {boolean} [props.clickable=false] - Whether entries are clickable.
 * @param {function} [props.onEntryClick] - Callback when an entry is clicked. Receives (entry, index).
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.ariaLabel] - Accessible label for the timeline.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement|null} The rendered Timeline element, or null if no entries.
 */
export default function Timeline({
  entries,
  variant = 'base',
  size = 'md',
  showTimestamps = true,
  clickable = false,
  onEntryClick,
  className = '',
  ariaLabel,
  testId,
}) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return null;
  }

  const isClickable = clickable && typeof onEntryClick === 'function';

  const connectorVariantClass = CONNECTOR_VARIANT_CLASSES[variant] || CONNECTOR_VARIANT_CLASSES.base;
  const iconBgVariantClass = ICON_BG_VARIANT_CLASSES[variant] || ICON_BG_VARIANT_CLASSES.base;
  const iconSizeClass = ICON_SIZE_CLASSES[size] || ICON_SIZE_CLASSES.md;
  const connectorLeftClass = CONNECTOR_LEFT_CLASSES[size] || CONNECTOR_LEFT_CLASSES.md;
  const titleSizeClass = TITLE_SIZE_CLASSES[size] || TITLE_SIZE_CLASSES.md;
  const descriptionSizeClass = DESCRIPTION_SIZE_CLASSES[size] || DESCRIPTION_SIZE_CLASSES.md;
  const timestampSizeClass = TIMESTAMP_SIZE_CLASSES[size] || TIMESTAMP_SIZE_CLASSES.md;
  const metadataSizeClass = METADATA_SIZE_CLASSES[size] || METADATA_SIZE_CLASSES.md;
  const contentPaddingClass = CONTENT_PADDING_CLASSES[size] || CONTENT_PADDING_CLASSES.md;
  const gapClass = GAP_CLASSES[size] || GAP_CLASSES.md;

  const containerClasses = [
    CONTAINER_CLASSES,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Handle entry click.
   * @param {number} index - The index of the clicked entry.
   * @param {object} entry - The entry definition.
   * @param {React.MouseEvent|React.KeyboardEvent} _e - The event.
   */
  function handleEntryClick(index, entry, _e) {
    if (!isClickable) {
      return;
    }

    if (entry.disabled === true) {
      return;
    }

    onEntryClick(entry, index);
  }

  /**
   * Handle entry keydown for keyboard accessibility.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @param {number} index - The index of the entry.
   * @param {object} entry - The entry definition.
   */
  function handleEntryKeyDown(e, index, entry) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEntryClick(index, entry, e);
    }
  }

  return (
    <div
      className={containerClasses}
      role="list"
      aria-label={ariaLabel || 'Timeline'}
      data-testid={testId}
    >
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const isDisabled = entry.disabled === true;
        const isEntryClickable = isClickable && !isDisabled;

        const displayTimestamp = entry.formattedTimestamp || (showTimestamps && entry.timestamp ? formatTimestamp(entry.timestamp) : null);

        const iconCircleClasses = [
          'inline-flex items-center justify-center rounded-full border shrink-0 z-[1] relative',
          entry.iconColor || iconBgVariantClass,
          iconSizeClass,
        ]
          .filter(Boolean)
          .join(' ');

        const entryContentClasses = [
          'flex-1 min-w-0',
          contentPaddingClass,
        ]
          .filter(Boolean)
          .join(' ');

        const entryRowClasses = [
          'flex items-start relative',
          gapClass,
          isEntryClickable ? 'cursor-pointer hover:bg-gray-50 rounded-standard transition-colors duration-150' : '',
          isDisabled ? 'opacity-50' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={entry.id || index}
            className="relative"
            role="listitem"
          >
            {/* Connector line */}
            {!isLast && (
              <div
                className={[
                  'absolute border-l',
                  connectorVariantClass,
                  connectorLeftClass,
                  'top-4 bottom-0',
                ].join(' ')}
                aria-hidden="true"
              />
            )}

            {/* Entry row */}
            <div
              className={entryRowClasses}
              onClick={isEntryClickable ? (e) => handleEntryClick(index, entry, e) : undefined}
              onKeyDown={isEntryClickable ? (e) => handleEntryKeyDown(e, index, entry) : undefined}
              tabIndex={isEntryClickable ? 0 : undefined}
              role={isEntryClickable ? 'button' : undefined}
              aria-disabled={isDisabled ? true : undefined}
            >
              {/* Icon circle */}
              <div className={iconCircleClasses}>
                {entry.icon ? (
                  <span className="inline-flex" aria-hidden="true">
                    {entry.icon}
                  </span>
                ) : (
                  <DefaultIcon size={size} />
                )}
              </div>

              {/* Content */}
              <div className={entryContentClasses}>
                {/* Title row with optional badge */}
                <div className="flex items-center gap-0.5 flex-wrap">
                  <span
                    className={[
                      'font-medium text-gray-900 leading-tight',
                      titleSizeClass,
                    ].join(' ')}
                  >
                    {entry.title || '—'}
                  </span>

                  {entry.badge && (
                    <span className="shrink-0">
                      {entry.badge}
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                {displayTimestamp && (
                  <span
                    className={[
                      'text-gray-400 leading-tight block',
                      timestampSizeClass,
                    ].join(' ')}
                  >
                    {displayTimestamp}
                  </span>
                )}

                {/* Description */}
                {entry.description && (
                  <p
                    className={[
                      'text-gray-600 leading-snug mt-[2px]',
                      descriptionSizeClass,
                    ].join(' ')}
                  >
                    {entry.description}
                  </p>
                )}

                {/* Metadata */}
                {Array.isArray(entry.metadata) && entry.metadata.length > 0 && (
                  <div className="flex flex-wrap gap-x-1 gap-y-[2px] mt-[2px]">
                    {entry.metadata.map((meta, metaIndex) => (
                      <span
                        key={meta.label || metaIndex}
                        className={[
                          'text-gray-400 leading-tight',
                          metadataSizeClass,
                        ].join(' ')}
                      >
                        <span className="text-gray-500 font-medium">{meta.label}:</span>{' '}
                        {meta.value}
                      </span>
                    ))}
                  </div>
                )}

                {/* Additional children content */}
                {entry.children && (
                  <div className="mt-0.5">
                    {entry.children}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Timeline.propTypes = {
  /** Array of timeline entry definitions. */
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique identifier for the entry. */
      id: PropTypes.string,
      /** The entry title/label text. */
      title: PropTypes.string.isRequired,
      /** Optional description text displayed below the title. */
      description: PropTypes.string,
      /** Timestamp for the entry. Formatted automatically if ISO string or Date. */
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      /** Pre-formatted timestamp string. Overrides timestamp formatting. */
      formattedTimestamp: PropTypes.string,
      /** Custom icon element for the entry circle. */
      icon: PropTypes.node,
      /** Custom CSS class for the icon circle color. */
      iconColor: PropTypes.string,
      /** Array of metadata key-value pairs displayed below the description. */
      metadata: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.string.isRequired,
        }),
      ),
      /** Optional badge element rendered next to the title. */
      badge: PropTypes.node,
      /** Additional content rendered below the metadata. */
      children: PropTypes.node,
      /** Whether the entry is visually dimmed and not clickable. */
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  /** Visual variant of the timeline. */
  variant: PropTypes.oneOf(['base', 'compact', 'tinted']),
  /** Size variant of the timeline. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether to display timestamps on entries. */
  showTimestamps: PropTypes.bool,
  /** Whether entries are clickable. */
  clickable: PropTypes.bool,
  /** Callback when an entry is clicked. Receives (entry, index). */
  onEntryClick: PropTypes.func,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Accessible label for the timeline. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};

/**
 * TimelineEntry component for composing timeline sections manually.
 * Renders a single timeline entry with icon, title, timestamp, description, and metadata.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Entry content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered TimelineEntry element.
 */
export function TimelineEntry({ children, className = '' }) {
  const combinedClasses = [
    'flex items-start gap-1 relative',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses} role="listitem">{children}</div>;
}

TimelineEntry.propTypes = {
  /** Entry content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * TimelineIcon component for composing timeline icon circles manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Icon content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered TimelineIcon element.
 */
export function TimelineIcon({ children, className = '' }) {
  const combinedClasses = [
    'inline-flex items-center justify-center w-4 h-4 rounded-full border bg-gray-100 text-gray-500 border-gray-200 shrink-0 z-[1]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClasses} aria-hidden="true">
      {children}
    </div>
  );
}

TimelineIcon.propTypes = {
  /** Icon content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * TimelineContent component for composing timeline content sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered TimelineContent element.
 */
export function TimelineContent({ children, className = '' }) {
  const combinedClasses = [
    'flex-1 min-w-0 pl-1.5 pb-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

TimelineContent.propTypes = {
  /** Content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};