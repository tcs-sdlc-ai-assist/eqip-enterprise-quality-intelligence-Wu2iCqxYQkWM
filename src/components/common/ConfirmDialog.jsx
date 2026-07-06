import PropTypes from 'prop-types';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

/**
 * @module ConfirmDialog
 * Reusable ConfirmDialog component following the Vital Integrity design system.
 *
 * Modal confirmation dialog with title, message, confirm/cancel buttons.
 * Used for destructive actions such as delete, reset, or irreversible operations.
 *
 * Variants:
 * - danger: Red confirm button for destructive actions (default)
 * - warning: Amber/yellow confirm button for cautionary actions
 * - info: Primary confirm button for non-destructive confirmations
 *
 * Features:
 * - Built on top of the Modal component with focus trap and escape-to-close
 * - Configurable confirm and cancel button labels
 * - Loading state support for async confirm actions
 * - Icon slot for visual emphasis
 * - Keyboard accessible with visible focus indicators
 * - ARIA dialog role with proper labeling
 */

/**
 * Default icon for danger variant.
 * Renders a warning triangle SVG icon.
 * @returns {React.ReactElement} An SVG warning icon.
 */
function DangerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Default icon for warning variant.
 * Renders an alert circle SVG icon.
 * @returns {React.ReactElement} An SVG alert icon.
 */
function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

/**
 * Default icon for info variant.
 * Renders an info circle SVG icon.
 * @returns {React.ReactElement} An SVG info icon.
 */
function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/**
 * Variant-specific icon color CSS class mappings.
 * @type {Readonly<object>}
 */
const ICON_COLOR_CLASSES = Object.freeze({
  danger: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-deep-forest-teal-500',
});

/**
 * Variant-specific icon background CSS class mappings.
 * @type {Readonly<object>}
 */
const ICON_BG_CLASSES = Object.freeze({
  danger: 'bg-red-50',
  warning: 'bg-yellow-50',
  info: 'bg-deep-forest-teal-50',
});

/**
 * Variant-specific confirm button variant mappings.
 * @type {Readonly<object>}
 */
const CONFIRM_BUTTON_VARIANT = Object.freeze({
  danger: 'danger',
  warning: 'accent',
  info: 'primary',
});

/**
 * Default icon components per variant.
 * @type {Readonly<object>}
 */
const DEFAULT_ICONS = Object.freeze({
  danger: DangerIcon,
  warning: WarningIcon,
  info: InfoIcon,
});

/**
 * Reusable ConfirmDialog component with title, message, confirm/cancel buttons,
 * variant-based styling, loading state, and icon support.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {function} props.onClose - Callback invoked when the dialog should close (cancel action).
 * @param {function} props.onConfirm - Callback invoked when the confirm button is clicked.
 * @param {string} [props.title='Are you sure?'] - The dialog title text.
 * @param {string} [props.message] - The dialog message/description text.
 * @param {React.ReactNode} [props.children] - Additional content rendered below the message.
 * @param {'danger'|'warning'|'info'} [props.variant='danger'] - Visual variant controlling icon and button colors.
 * @param {string} [props.confirmLabel='Confirm'] - Label for the confirm button.
 * @param {string} [props.cancelLabel='Cancel'] - Label for the cancel button.
 * @param {boolean} [props.loading=false] - Whether the confirm button is in a loading state.
 * @param {string} [props.loadingText] - Text to display on the confirm button while loading.
 * @param {boolean} [props.disabled=false] - Whether the confirm button is disabled.
 * @param {boolean} [props.showIcon=true] - Whether to show the variant icon.
 * @param {React.ReactNode} [props.icon] - Custom icon element to render instead of the default variant icon.
 * @param {boolean} [props.hideCancel=false] - Whether to hide the cancel button.
 * @param {boolean} [props.closeOnOverlayClick=false] - Whether clicking the overlay closes the dialog.
 * @param {boolean} [props.closeOnEscape=true] - Whether pressing Escape closes the dialog.
 * @param {'sm'|'md'} [props.size='sm'] - Size variant controlling modal max-width.
 * @param {string} [props.className] - Additional CSS classes for the modal panel.
 * @param {string} [props.ariaLabel] - Accessible label for the dialog.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement|null} The rendered ConfirmDialog element, or null if not open.
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  children,
  variant = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  loadingText,
  disabled = false,
  showIcon = true,
  icon,
  hideCancel = false,
  closeOnOverlayClick = false,
  closeOnEscape = true,
  size = 'sm',
  className = '',
  ariaLabel,
  testId,
}) {
  const resolvedVariant = CONFIRM_BUTTON_VARIANT[variant] ? variant : 'danger';
  const confirmButtonVariant = CONFIRM_BUTTON_VARIANT[resolvedVariant] || CONFIRM_BUTTON_VARIANT.danger;
  const iconColorClass = ICON_COLOR_CLASSES[resolvedVariant] || ICON_COLOR_CLASSES.danger;
  const iconBgClass = ICON_BG_CLASSES[resolvedVariant] || ICON_BG_CLASSES.danger;

  const DefaultIconComponent = DEFAULT_ICONS[resolvedVariant] || DEFAULT_ICONS.danger;

  const renderIcon = () => {
    if (!showIcon) {
      return null;
    }

    const iconContent = icon || <DefaultIconComponent />;

    return (
      <div
        className={[
          'flex items-center justify-center w-5 h-5 rounded-full shrink-0',
          iconBgClass,
          iconColorClass,
        ].join(' ')}
      >
        {iconContent}
      </div>
    );
  };

  const dialogBody = (
    <div className="flex gap-2">
      {renderIcon()}

      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-base font-semibold text-gray-900 mb-0.5">
            {title}
          </h3>
        )}

        {message && (
          <p className="text-sm text-gray-600">
            {message}
          </p>
        )}

        {children && (
          <div className="mt-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );

  const dialogActions = (
    <>
      {!hideCancel && (
        <Button
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={loading}
          ariaLabel={cancelLabel}
        >
          {cancelLabel}
        </Button>
      )}

      <Button
        variant={confirmButtonVariant}
        size="md"
        onClick={onConfirm}
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
        ariaLabel={confirmLabel}
      >
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      showCloseButton={false}
      ariaLabel={ariaLabel || title}
      className={className}
      testId={testId}
      actions={dialogActions}
    >
      {dialogBody}
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  /** Whether the dialog is open. */
  isOpen: PropTypes.bool.isRequired,
  /** Callback invoked when the dialog should close (cancel action). */
  onClose: PropTypes.func.isRequired,
  /** Callback invoked when the confirm button is clicked. */
  onConfirm: PropTypes.func.isRequired,
  /** The dialog title text. Defaults to 'Are you sure?'. */
  title: PropTypes.string,
  /** The dialog message/description text. */
  message: PropTypes.string,
  /** Additional content rendered below the message. */
  children: PropTypes.node,
  /** Visual variant controlling icon and button colors. */
  variant: PropTypes.oneOf(['danger', 'warning', 'info']),
  /** Label for the confirm button. */
  confirmLabel: PropTypes.string,
  /** Label for the cancel button. */
  cancelLabel: PropTypes.string,
  /** Whether the confirm button is in a loading state. */
  loading: PropTypes.bool,
  /** Text to display on the confirm button while loading. */
  loadingText: PropTypes.string,
  /** Whether the confirm button is disabled. */
  disabled: PropTypes.bool,
  /** Whether to show the variant icon. */
  showIcon: PropTypes.bool,
  /** Custom icon element to render instead of the default variant icon. */
  icon: PropTypes.node,
  /** Whether to hide the cancel button. */
  hideCancel: PropTypes.bool,
  /** Whether clicking the overlay closes the dialog. */
  closeOnOverlayClick: PropTypes.bool,
  /** Whether pressing Escape closes the dialog. */
  closeOnEscape: PropTypes.bool,
  /** Size variant controlling modal max-width. */
  size: PropTypes.oneOf(['sm', 'md']),
  /** Additional CSS classes for the modal panel. */
  className: PropTypes.string,
  /** Accessible label for the dialog. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};