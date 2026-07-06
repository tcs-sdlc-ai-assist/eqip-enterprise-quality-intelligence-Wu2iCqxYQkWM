import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * @module Modal
 * Reusable Modal component following the Vital Integrity design system.
 *
 * Overlay with 8px corner radius, tonal background, keyboard trap,
 * escape-to-close, ARIA dialog role. Supports title, body, and action slots.
 *
 * Variants:
 * - base: White background, standard border
 * - tinted: Deep Forest Teal-50 background, teal-tinted border
 *
 * Sizes:
 * - sm: max-w-md
 * - md: max-w-lg
 * - lg: max-w-2xl
 * - xl: max-w-4xl
 * - full: max-w-full (with margin)
 *
 * Fully keyboard accessible with focus trap and visible focus indicators.
 */

/**
 * Base CSS classes for the modal overlay.
 * @type {string}
 */
const OVERLAY_CLASSES =
  'fixed inset-0 z-[1050] flex items-center justify-center p-2 bg-black/50 transition-opacity duration-200';

/**
 * Base CSS classes for the modal panel.
 * @type {string}
 */
const PANEL_BASE_CLASSES =
  'relative w-full rounded-modal border overflow-hidden flex flex-col max-h-[90vh] focus:outline-none';

/**
 * Variant-specific CSS class mappings for the modal panel.
 * @type {Readonly<object>}
 */
const VARIANT_CLASSES = Object.freeze({
  base: 'bg-white border-[#E0E0E0]',
  tinted: 'bg-deep-forest-teal-50 border-deep-forest-teal-200',
});

/**
 * Size-specific CSS class mappings for the modal panel.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-32px)]',
});

/**
 * Get all focusable elements within a container.
 * @param {HTMLElement} container - The container element.
 * @returns {HTMLElement[]} Array of focusable elements.
 */
function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Close button SVG icon rendered in the modal header.
 * @returns {React.ReactElement} An SVG close icon.
 */
function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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
 * Reusable Modal component with title, body, and action slots.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Callback invoked when the modal should close.
 * @param {React.ReactNode} [props.title] - Content rendered in the modal header/title area.
 * @param {React.ReactNode} [props.children] - Content rendered in the modal body area.
 * @param {React.ReactNode} [props.actions] - Content rendered in the modal footer/actions area.
 * @param {'base'|'tinted'} [props.variant='base'] - Visual variant.
 * @param {'sm'|'md'|'lg'|'xl'|'full'} [props.size='md'] - Size variant controlling max-width.
 * @param {boolean} [props.closeOnOverlayClick=true] - Whether clicking the overlay closes the modal.
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing Escape closes the modal.
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button in the header.
 * @param {string} [props.className] - Additional CSS classes for the modal panel.
 * @param {string} [props.ariaLabel] - Accessible label for the modal dialog.
 * @param {string} [props.ariaDescribedBy] - ID of the element describing the modal.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {object} [props.rest] - Any additional HTML attributes.
 * @returns {React.ReactElement|null} The rendered Modal element, or null if not open.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  actions,
  variant = 'base',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  ariaLabel,
  ariaDescribedBy,
  testId,
  ...rest
}) {
  const panelRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  /**
   * Handle Escape key press to close the modal.
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = getFocusableElements(panelRef.current);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [closeOnEscape, onClose],
  );

  /**
   * Handle overlay click to close the modal.
   */
  const handleOverlayClick = useCallback(
    (e) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose],
  );

  /**
   * Manage focus trap, body scroll lock, and cleanup on open/close.
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousActiveElementRef.current = document.activeElement;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frameId = requestAnimationFrame(() => {
      if (panelRef.current) {
        const focusableElements = getFocusableElements(panelRef.current);

        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          panelRef.current.focus();
        }
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      document.body.style.overflow = originalOverflow;

      if (
        previousActiveElementRef.current &&
        typeof previousActiveElementRef.current.focus === 'function'
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const variantClasses = VARIANT_CLASSES[variant] || VARIANT_CLASSES.base;
  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const panelCombinedClasses = [
    PANEL_BASE_CLASSES,
    variantClasses,
    sizeClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasTitle = title !== undefined && title !== null;
  const hasActions = actions !== undefined && actions !== null;

  const modalContent = (
    <div
      className={OVERLAY_CLASSES}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
        aria-describedby={ariaDescribedBy}
        tabIndex={-1}
        className={panelCombinedClasses}
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {/* Header */}
        {(hasTitle || showCloseButton) && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#E0E0E0] shrink-0">
            {hasTitle && (
              <div className="text-lg font-semibold text-deep-forest-teal-800 pr-2">
                {title}
              </div>
            )}

            {!hasTitle && <div />}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center p-0.5 rounded-standard text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-2"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        {children !== undefined && children !== null && (
          <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
            {children}
          </div>
        )}

        {/* Footer / Actions */}
        {hasActions && (
          <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-modal shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * ModalHeader component for composing modal sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Header content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered ModalHeader element.
 */
export function ModalHeader({ children, className = '' }) {
  const combinedClasses = [
    'px-3 py-2 border-b border-[#E0E0E0]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

ModalHeader.propTypes = {
  /** Header content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * ModalBody component for composing modal sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Body content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered ModalBody element.
 */
export function ModalBody({ children, className = '' }) {
  const combinedClasses = [
    'flex-1 overflow-y-auto px-3 py-2 scrollbar-thin',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

ModalBody.propTypes = {
  /** Body content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

/**
 * ModalFooter component for composing modal sections manually.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Footer content.
 * @param {string} [props.className] - Additional CSS classes.
 * @returns {React.ReactElement} The rendered ModalFooter element.
 */
export function ModalFooter({ children, className = '' }) {
  const combinedClasses = [
    'flex items-center justify-end gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-modal',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
}

ModalFooter.propTypes = {
  /** Footer content. */
  children: PropTypes.node,
  /** Additional CSS classes. */
  className: PropTypes.string,
};

Modal.propTypes = {
  /** Whether the modal is open. */
  isOpen: PropTypes.bool.isRequired,
  /** Callback invoked when the modal should close. */
  onClose: PropTypes.func.isRequired,
  /** Content rendered in the modal header/title area. */
  title: PropTypes.node,
  /** Content rendered in the modal body area. */
  children: PropTypes.node,
  /** Content rendered in the modal footer/actions area. */
  actions: PropTypes.node,
  /** Visual variant of the modal. */
  variant: PropTypes.oneOf(['base', 'tinted']),
  /** Size variant controlling max-width. */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Whether clicking the overlay closes the modal. */
  closeOnOverlayClick: PropTypes.bool,
  /** Whether pressing Escape closes the modal. */
  closeOnEscape: PropTypes.bool,
  /** Whether to show the close button in the header. */
  showCloseButton: PropTypes.bool,
  /** Additional CSS classes for the modal panel. */
  className: PropTypes.string,
  /** Accessible label for the modal dialog. */
  ariaLabel: PropTypes.string,
  /** ID of the element describing the modal. */
  ariaDescribedBy: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};