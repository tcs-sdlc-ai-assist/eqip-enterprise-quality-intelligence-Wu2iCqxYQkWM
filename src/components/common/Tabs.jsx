import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';

/**
 * @module Tabs
 * Reusable Tabs component following the Vital Integrity design system.
 *
 * Horizontal tab navigation with active state, keyboard navigation,
 * ARIA tablist/tab/tabpanel roles. Supports controlled and uncontrolled modes.
 *
 * Variants:
 * - underline: Bottom border indicator on active tab (default)
 * - pill: Rounded pill background on active tab
 * - enclosed: Bordered tab with connected panel
 *
 * Sizes:
 * - sm: Compact tabs
 * - md: Default tabs
 * - lg: Large tabs
 *
 * Fully keyboard accessible with Arrow keys, Home, End, Tab, Enter, Space.
 */

/**
 * Base CSS classes for the tab list container.
 * @type {string}
 */
const TABLIST_BASE_CLASSES = 'flex items-center';

/**
 * Variant-specific CSS class mappings for the tab list container.
 * @type {Readonly<object>}
 */
const TABLIST_VARIANT_CLASSES = Object.freeze({
  underline: 'border-b border-[#E0E0E0]',
  pill: 'bg-gray-100 rounded-card p-0.5 gap-0.5',
  enclosed: 'border-b border-[#E0E0E0]',
});

/**
 * Base CSS classes shared across all tab buttons.
 * @type {string}
 */
const TAB_BASE_CLASSES =
  'inline-flex items-center justify-center gap-1 font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Variant-specific CSS class mappings for individual tab buttons.
 * @type {Readonly<object>}
 */
const TAB_VARIANT_CLASSES = Object.freeze({
  underline: {
    base: 'border-b-2 border-transparent text-gray-600 hover:text-deep-forest-teal-700 hover:border-gray-300',
    active: 'border-b-2 border-deep-forest-teal text-deep-forest-teal-800 font-semibold',
  },
  pill: {
    base: 'rounded-standard text-gray-600 hover:text-deep-forest-teal-700 hover:bg-gray-200/60',
    active: 'rounded-standard bg-white text-deep-forest-teal-800 font-semibold shadow-sm',
  },
  enclosed: {
    base: 'border border-transparent text-gray-600 hover:text-deep-forest-teal-700 hover:bg-gray-50 rounded-t-standard -mb-px',
    active: 'border border-[#E0E0E0] border-b-white text-deep-forest-teal-800 font-semibold bg-white rounded-t-standard -mb-px',
  },
});

/**
 * Size-specific CSS class mappings for individual tab buttons.
 * @type {Readonly<object>}
 */
const TAB_SIZE_CLASSES = Object.freeze({
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
});

/**
 * Base CSS classes for the tab panel.
 * @type {string}
 */
const PANEL_BASE_CLASSES = 'focus-visible:outline-none';

/**
 * Size-specific CSS class mappings for the tab panel.
 * @type {Readonly<object>}
 */
const PANEL_SIZE_CLASSES = Object.freeze({
  sm: 'pt-1',
  md: 'pt-2',
  lg: 'pt-3',
});

/**
 * Generate a unique ID prefix for ARIA associations.
 * @param {string} [id] - Optional user-provided ID prefix.
 * @returns {string} The ID prefix.
 */
function generateIdPrefix(id) {
  if (id && typeof id === 'string') {
    return id;
  }
  return 'tabs-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Reusable Tabs component with controlled/uncontrolled modes, keyboard navigation,
 * and ARIA tablist/tab/tabpanel roles.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.tabs - Array of tab definitions.
 * @param {string} props.tabs[].key - Unique key for the tab.
 * @param {string} props.tabs[].label - Display label for the tab.
 * @param {React.ReactNode} [props.tabs[].icon] - Optional icon element rendered before the label.
 * @param {boolean} [props.tabs[].disabled=false] - Whether the tab is disabled.
 * @param {React.ReactNode} [props.tabs[].content] - Content rendered in the tab panel when active.
 * @param {string} [props.tabs[].badge] - Optional badge text displayed after the label.
 * @param {string} [props.activeKey] - Controlled active tab key.
 * @param {string} [props.defaultActiveKey] - Default active tab key for uncontrolled mode.
 * @param {function} [props.onChange] - Callback when the active tab changes. Receives (tabKey).
 * @param {'underline'|'pill'|'enclosed'} [props.variant='underline'] - Visual variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {boolean} [props.fullWidth=false] - Whether tabs stretch to fill the container width.
 * @param {React.ReactNode} [props.children] - Alternative to tabs[].content for rendering active panel content.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.tabListClassName] - Additional CSS classes for the tab list.
 * @param {string} [props.tabClassName] - Additional CSS classes for individual tab buttons.
 * @param {string} [props.panelClassName] - Additional CSS classes for the tab panel.
 * @param {string} [props.ariaLabel] - Accessible label for the tab list.
 * @param {string} [props.id] - ID prefix for ARIA associations.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered Tabs element.
 */
export default function Tabs({
  tabs,
  activeKey: controlledActiveKey,
  defaultActiveKey,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  tabListClassName = '',
  tabClassName = '',
  panelClassName = '',
  ariaLabel,
  id,
  testId,
}) {
  const idPrefix = useMemo(() => generateIdPrefix(id), [id]);

  const tabItems = useMemo(() => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return [];
    }
    return tabs;
  }, [tabs]);

  const firstEnabledKey = useMemo(() => {
    for (let i = 0; i < tabItems.length; i++) {
      if (tabItems[i].disabled !== true) {
        return tabItems[i].key;
      }
    }
    return tabItems.length > 0 ? tabItems[0].key : null;
  }, [tabItems]);

  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || firstEnabledKey,
  );

  const activeTabKey =
    controlledActiveKey !== undefined ? controlledActiveKey : internalActiveKey;

  const tabRefs = useRef({});

  /**
   * Handle tab selection.
   * @param {string} tabKey - The key of the selected tab.
   */
  const handleTabClick = useCallback(
    (tabKey) => {
      const tab = tabItems.find((t) => t.key === tabKey);
      if (tab && tab.disabled === true) {
        return;
      }

      if (controlledActiveKey === undefined) {
        setInternalActiveKey(tabKey);
      }

      if (onChange) {
        onChange(tabKey);
      }
    },
    [tabItems, controlledActiveKey, onChange],
  );

  /**
   * Focus a tab button by key.
   * @param {string} tabKey - The key of the tab to focus.
   */
  const focusTab = useCallback((tabKey) => {
    const ref = tabRefs.current[tabKey];
    if (ref && typeof ref.focus === 'function') {
      ref.focus();
    }
  }, []);

  /**
   * Get the next enabled tab key in a given direction.
   * @param {string} currentKey - The current tab key.
   * @param {number} direction - 1 for forward, -1 for backward.
   * @returns {string|null} The next enabled tab key, or null if none found.
   */
  const getNextEnabledTab = useCallback(
    (currentKey, direction) => {
      const currentIndex = tabItems.findIndex((t) => t.key === currentKey);
      if (currentIndex === -1) {
        return null;
      }

      const len = tabItems.length;
      let nextIndex = currentIndex;

      for (let i = 0; i < len; i++) {
        nextIndex = (nextIndex + direction + len) % len;
        if (tabItems[nextIndex].disabled !== true) {
          return tabItems[nextIndex].key;
        }
      }

      return null;
    },
    [tabItems],
  );

  /**
   * Get the first enabled tab key.
   * @returns {string|null} The first enabled tab key.
   */
  const getFirstEnabledTab = useCallback(() => {
    for (let i = 0; i < tabItems.length; i++) {
      if (tabItems[i].disabled !== true) {
        return tabItems[i].key;
      }
    }
    return null;
  }, [tabItems]);

  /**
   * Get the last enabled tab key.
   * @returns {string|null} The last enabled tab key.
   */
  const getLastEnabledTab = useCallback(() => {
    for (let i = tabItems.length - 1; i >= 0; i--) {
      if (tabItems[i].disabled !== true) {
        return tabItems[i].key;
      }
    }
    return null;
  }, [tabItems]);

  /**
   * Handle keyboard navigation within the tab list.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @param {string} tabKey - The key of the currently focused tab.
   */
  const handleKeyDown = useCallback(
    (e, tabKey) => {
      let nextKey = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          e.preventDefault();
          nextKey = getNextEnabledTab(tabKey, 1);
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          e.preventDefault();
          nextKey = getNextEnabledTab(tabKey, -1);
          break;
        }
        case 'Home': {
          e.preventDefault();
          nextKey = getFirstEnabledTab();
          break;
        }
        case 'End': {
          e.preventDefault();
          nextKey = getLastEnabledTab();
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          handleTabClick(tabKey);
          return;
        }
        default:
          return;
      }

      if (nextKey !== null) {
        focusTab(nextKey);
        handleTabClick(nextKey);
      }
    },
    [getNextEnabledTab, getFirstEnabledTab, getLastEnabledTab, focusTab, handleTabClick],
  );

  // Determine the active tab's content
  const activeTab = useMemo(() => {
    return tabItems.find((t) => t.key === activeTabKey) || null;
  }, [tabItems, activeTabKey]);

  const panelContent = useMemo(() => {
    if (children !== undefined && children !== null) {
      return children;
    }
    if (activeTab && activeTab.content !== undefined && activeTab.content !== null) {
      return activeTab.content;
    }
    return null;
  }, [children, activeTab]);

  // Variant classes
  const tabListVariantClasses =
    TABLIST_VARIANT_CLASSES[variant] || TABLIST_VARIANT_CLASSES.underline;
  const tabVariantConfig =
    TAB_VARIANT_CLASSES[variant] || TAB_VARIANT_CLASSES.underline;
  const tabSizeClasses = TAB_SIZE_CLASSES[size] || TAB_SIZE_CLASSES.md;
  const panelSizeClasses = PANEL_SIZE_CLASSES[size] || PANEL_SIZE_CLASSES.md;

  const tabListCombinedClasses = [
    TABLIST_BASE_CLASSES,
    tabListVariantClasses,
    fullWidth ? 'w-full' : '',
    tabListClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const rootClasses = [className].filter(Boolean).join(' ');

  const panelCombinedClasses = [PANEL_BASE_CLASSES, panelSizeClasses, panelClassName]
    .filter(Boolean)
    .join(' ');

  if (tabItems.length === 0) {
    return null;
  }

  return (
    <div className={rootClasses || undefined} data-testid={testId}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-label={ariaLabel || 'Tabs'}
        className={tabListCombinedClasses}
      >
        {tabItems.map((tab) => {
          const isActive = tab.key === activeTabKey;
          const isDisabled = tab.disabled === true;

          const tabButtonClasses = [
            TAB_BASE_CLASSES,
            tabSizeClasses,
            isActive ? tabVariantConfig.active : tabVariantConfig.base,
            fullWidth ? 'flex-1' : '',
            tabClassName,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              role="tab"
              type="button"
              id={`${idPrefix}-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`${idPrefix}-panel-${tab.key}`}
              aria-disabled={isDisabled || undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={isDisabled}
              className={tabButtonClasses}
              onClick={() => handleTabClick(tab.key)}
              onKeyDown={(e) => handleKeyDown(e, tab.key)}
            >
              {tab.icon && (
                <span className="inline-flex shrink-0" aria-hidden="true">
                  {tab.icon}
                </span>
              )}

              <span>{tab.label}</span>

              {tab.badge !== undefined && tab.badge !== null && (
                <span className="inline-flex items-center justify-center px-0.5 py-[1px] text-[10px] font-medium leading-none rounded-full bg-deep-forest-teal-50 text-deep-forest-teal-800 ml-0.5">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      {panelContent !== null && (
        <div
          role="tabpanel"
          id={activeTab ? `${idPrefix}-panel-${activeTab.key}` : undefined}
          aria-labelledby={
            activeTab ? `${idPrefix}-tab-${activeTab.key}` : undefined
          }
          tabIndex={0}
          className={panelCombinedClasses}
        >
          {panelContent}
        </div>
      )}
    </div>
  );
}

Tabs.propTypes = {
  /** Array of tab definitions. */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique key for the tab. */
      key: PropTypes.string.isRequired,
      /** Display label for the tab. */
      label: PropTypes.string.isRequired,
      /** Optional icon element rendered before the label. */
      icon: PropTypes.node,
      /** Whether the tab is disabled. */
      disabled: PropTypes.bool,
      /** Content rendered in the tab panel when active. */
      content: PropTypes.node,
      /** Optional badge text displayed after the label. */
      badge: PropTypes.string,
    }),
  ).isRequired,
  /** Controlled active tab key. */
  activeKey: PropTypes.string,
  /** Default active tab key for uncontrolled mode. */
  defaultActiveKey: PropTypes.string,
  /** Callback when the active tab changes. Receives (tabKey). */
  onChange: PropTypes.func,
  /** Visual variant of the tabs. */
  variant: PropTypes.oneOf(['underline', 'pill', 'enclosed']),
  /** Size variant of the tabs. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether tabs stretch to fill the container width. */
  fullWidth: PropTypes.bool,
  /** Alternative to tabs[].content for rendering active panel content. */
  children: PropTypes.node,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Additional CSS classes for the tab list. */
  tabListClassName: PropTypes.string,
  /** Additional CSS classes for individual tab buttons. */
  tabClassName: PropTypes.string,
  /** Additional CSS classes for the tab panel. */
  panelClassName: PropTypes.string,
  /** Accessible label for the tab list. */
  ariaLabel: PropTypes.string,
  /** ID prefix for ARIA associations. */
  id: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};

/**
 * TabList component for composing tab sections manually.
 * Renders a container with role="tablist".
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Tab button elements.
 * @param {string} [props.ariaLabel] - Accessible label for the tab list.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered TabList element.
 */
export function TabList({ children, ariaLabel, className = '' }) {
  const combinedClasses = [
    TABLIST_BASE_CLASSES,
    TABLIST_VARIANT_CLASSES.underline,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div role="tablist" aria-label={ariaLabel || 'Tabs'} className={combinedClasses}>
      {children}
    </div>
  );
}

TabList.propTypes = {
  /** Tab button elements. */
  children: PropTypes.node,
  /** Accessible label for the tab list. */
  ariaLabel: PropTypes.string,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * TabPanel component for composing tab sections manually.
 * Renders a container with role="tabpanel".
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Panel content.
 * @param {string} [props.id] - Panel ID for ARIA association.
 * @param {string} [props.ariaLabelledBy] - ID of the associated tab for ARIA.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered TabPanel element.
 */
export function TabPanel({ children, id, ariaLabelledBy, className = '' }) {
  const combinedClasses = [PANEL_BASE_CLASSES, PANEL_SIZE_CLASSES.md, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={ariaLabelledBy}
      tabIndex={0}
      className={combinedClasses}
    >
      {children}
    </div>
  );
}

TabPanel.propTypes = {
  /** Panel content. */
  children: PropTypes.node,
  /** Panel ID for ARIA association. */
  id: PropTypes.string,
  /** ID of the associated tab for ARIA. */
  ariaLabelledBy: PropTypes.string,
  /** Additional CSS classes. */
  className: PropTypes.string,
};