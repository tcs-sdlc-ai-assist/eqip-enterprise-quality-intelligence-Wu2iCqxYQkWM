import { useState, useRef, useCallback, useEffect, useId } from 'react';
import PropTypes from 'prop-types';

/**
 * @module Tooltip
 * Reusable Tooltip component following the Vital Integrity design system.
 *
 * Hover/focus-triggered tooltip with ARIA tooltip role, positioned
 * above/below/left/right of trigger element.
 *
 * Positions:
 * - top: Tooltip appears above the trigger (default)
 * - bottom: Tooltip appears below the trigger
 * - left: Tooltip appears to the left of the trigger
 * - right: Tooltip appears to the right of the trigger
 *
 * Features:
 * - Hover and focus triggered
 * - ARIA tooltip role with proper associations
 * - Configurable delay before showing
 * - Configurable position
 * - Keyboard accessible (Escape to dismiss)
 * - Supports custom className for additional styling
 */

/**
 * Base CSS classes for the tooltip container (the wrapper around trigger + tooltip).
 * @type {string}
 */
const WRAPPER_CLASSES = 'relative inline-flex';

/**
 * Base CSS classes for the tooltip content element.
 * @type {string}
 */
const TOOLTIP_BASE_CLASSES =
  'absolute z-[1070] px-1.5 py-0.5 text-xs font-medium text-white bg-gray-900 rounded-standard shadow-md whitespace-nowrap pointer-events-none select-none transition-opacity duration-150';

/**
 * Position-specific CSS class mappings for the tooltip element.
 * @type {Readonly<object>}
 */
const POSITION_CLASSES = Object.freeze({
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1',
});

/**
 * Arrow CSS class mappings per position.
 * @type {Readonly<object>}
 */
const ARROW_CLASSES = Object.freeze({
  top: 'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900',
  bottom: 'absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900',
  left: 'absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900',
  right: 'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900',
});

/**
 * Reusable Tooltip component with position, delay, and ARIA support.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The trigger element that the tooltip is attached to.
 * @param {string} props.content - The tooltip text content.
 * @param {'top'|'bottom'|'left'|'right'} [props.position='top'] - Position of the tooltip relative to the trigger.
 * @param {number} [props.delay=200] - Delay in milliseconds before showing the tooltip on hover.
 * @param {boolean} [props.disabled=false] - Whether the tooltip is disabled (will not show).
 * @param {boolean} [props.showArrow=true] - Whether to show the directional arrow on the tooltip.
 * @param {string} [props.className] - Additional CSS classes for the tooltip content element.
 * @param {string} [props.wrapperClassName] - Additional CSS classes for the wrapper element.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered Tooltip element.
 */
export default function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  disabled = false,
  showArrow = true,
  className = '',
  wrapperClassName = '',
  testId,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const generatedId = useId();
  const tooltipId = `tooltip-${generatedId}`;

  /**
   * Clear any pending show timeout.
   */
  const clearShowTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Show the tooltip after the configured delay.
   */
  const handleShow = useCallback(() => {
    if (disabled || !content) {
      return;
    }

    clearShowTimeout();

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        timeoutRef.current = null;
      }, delay);
    } else {
      setIsVisible(true);
    }
  }, [disabled, content, delay, clearShowTimeout]);

  /**
   * Hide the tooltip immediately.
   */
  const handleHide = useCallback(() => {
    clearShowTimeout();
    setIsVisible(false);
  }, [clearShowTimeout]);

  /**
   * Handle keydown events on the trigger element.
   * Escape key dismisses the tooltip.
   * @param {React.KeyboardEvent} e - The keyboard event.
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && isVisible) {
        e.preventDefault();
        handleHide();
      }
    },
    [isVisible, handleHide],
  );

  /**
   * Clean up timeout on unmount.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = POSITION_CLASSES[position] || POSITION_CLASSES.top;
  const arrowClasses = ARROW_CLASSES[position] || ARROW_CLASSES.top;

  const tooltipCombinedClasses = [
    TOOLTIP_BASE_CLASSES,
    positionClasses,
    isVisible ? 'opacity-100' : 'opacity-0',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperCombinedClasses = [WRAPPER_CLASSES, wrapperClassName]
    .filter(Boolean)
    .join(' ');

  const shouldRender = !disabled && content;

  return (
    <div
      className={wrapperCombinedClasses}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
      onKeyDown={handleKeyDown}
      data-testid={testId}
    >
      <div
        aria-describedby={shouldRender && isVisible ? tooltipId : undefined}
      >
        {children}
      </div>

      {shouldRender && (
        <div
          id={tooltipId}
          role="tooltip"
          className={tooltipCombinedClasses}
          aria-hidden={!isVisible}
        >
          {content}
          {showArrow && (
            <span className={arrowClasses} aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}

Tooltip.propTypes = {
  /** The trigger element that the tooltip is attached to. */
  children: PropTypes.node.isRequired,
  /** The tooltip text content. */
  content: PropTypes.string,
  /** Position of the tooltip relative to the trigger. */
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  /** Delay in milliseconds before showing the tooltip on hover. */
  delay: PropTypes.number,
  /** Whether the tooltip is disabled (will not show). */
  disabled: PropTypes.bool,
  /** Whether to show the directional arrow on the tooltip. */
  showArrow: PropTypes.bool,
  /** Additional CSS classes for the tooltip content element. */
  className: PropTypes.string,
  /** Additional CSS classes for the wrapper element. */
  wrapperClassName: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};