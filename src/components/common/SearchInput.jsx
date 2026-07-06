import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @module SearchInput
 * Reusable SearchInput component following the Vital Integrity design system.
 *
 * Text input with search icon, debounced onChange, clear button, and ARIA search role.
 *
 * Features:
 * - Search icon rendered inside the input on the left
 * - Debounced onChange callback with configurable delay
 * - Clear button to reset the search value
 * - Controlled and uncontrolled modes
 * - ARIA role="search" for accessibility
 * - Keyboard accessible with visible focus indicators
 * - Consistent styling with design system form inputs
 *
 * Sizes:
 * - sm: Compact search input
 * - md: Default search input
 * - lg: Large search input
 */

/**
 * Base CSS classes for the search input container.
 * @type {string}
 */
const CONTAINER_BASE_CLASSES = 'relative flex items-center';

/**
 * Base CSS classes for the search input element.
 * @type {string}
 */
const INPUT_BASE_CLASSES =
  'block w-full bg-white border border-gray-300 rounded-standard shadow-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900';

/**
 * Size-specific CSS class mappings for the input element.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  sm: 'text-xs py-0.5 pl-4 pr-4',
  md: 'text-sm py-1 pl-4 pr-4',
  lg: 'text-base py-1.5 pl-5 pr-5',
});

/**
 * Size-specific CSS class mappings for the search icon container.
 * @type {Readonly<object>}
 */
const ICON_POSITION_CLASSES = Object.freeze({
  sm: 'pl-1',
  md: 'pl-1.5',
  lg: 'pl-2',
});

/**
 * Size-specific CSS class mappings for the clear button container.
 * @type {Readonly<object>}
 */
const CLEAR_POSITION_CLASSES = Object.freeze({
  sm: 'pr-1',
  md: 'pr-1.5',
  lg: 'pr-2',
});

/**
 * Search icon SVG component.
 * @param {object} props - Component props.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @returns {React.ReactElement} An SVG search icon.
 */
function SearchIcon({ size = 'md' }) {
  const dimension = size === 'lg' ? 18 : size === 'sm' ? 14 : 16;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

SearchIcon.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Close/clear icon SVG component.
 * @param {object} props - Component props.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @returns {React.ReactElement} An SVG close icon.
 */
function ClearIcon({ size = 'md' }) {
  const dimension = size === 'lg' ? 16 : size === 'sm' ? 12 : 14;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
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

ClearIcon.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Reusable SearchInput component with search icon, debounced onChange,
 * clear button, and ARIA search role.
 *
 * @param {object} props - Component props.
 * @param {string} [props.value] - Controlled search value.
 * @param {string} [props.defaultValue=''] - Default search value for uncontrolled mode.
 * @param {function} [props.onChange] - Callback when the search value changes. Receives the string value.
 * @param {function} [props.onClear] - Callback when the clear button is clicked.
 * @param {function} [props.onSubmit] - Callback when Enter is pressed. Receives the current value.
 * @param {string} [props.placeholder='Search...'] - Placeholder text for the input.
 * @param {number} [props.debounceMs=300] - Debounce delay in milliseconds for the onChange callback. Set to 0 for no debounce.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {boolean} [props.disabled=false] - Whether the input is disabled.
 * @param {boolean} [props.autoFocus=false] - Whether the input should be auto-focused on mount.
 * @param {boolean} [props.showClearButton=true] - Whether to show the clear button when the input has a value.
 * @param {boolean} [props.fullWidth=true] - Whether the input takes full width of its container.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.inputClassName] - Additional CSS classes for the input element.
 * @param {string} [props.ariaLabel] - Accessible label for the search input.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {string} [props.id] - HTML id attribute for the input element.
 * @param {string} [props.name] - HTML name attribute for the input element.
 * @param {number} [props.minWidth] - Minimum width in pixels for the input.
 * @param {number} [props.maxWidth] - Maximum width in pixels for the input.
 * @returns {React.ReactElement} The rendered SearchInput element.
 */
export default function SearchInput({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search...',
  debounceMs = 300,
  size = 'md',
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  fullWidth = true,
  className = '',
  inputClassName = '',
  ariaLabel,
  testId,
  id,
  name,
  minWidth,
  maxWidth,
}) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  const currentValue = isControlled ? controlledValue : internalValue;

  /**
   * Clean up debounce timer on unmount.
   */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  /**
   * Auto-focus the input on mount if autoFocus is true.
   */
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Handle input value change with optional debouncing.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value;

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (onChange) {
        if (debounceMs > 0) {
          if (debounceTimerRef.current !== null) {
            clearTimeout(debounceTimerRef.current);
          }

          debounceTimerRef.current = setTimeout(() => {
            onChange(newValue);
            debounceTimerRef.current = null;
          }, debounceMs);
        } else {
          onChange(newValue);
        }
      }
    },
    [isControlled, onChange, debounceMs],
  );

  /**
   * Handle clear button click.
   */
  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isControlled, onChange, onClear]);

  /**
   * Handle keydown events on the input.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();

        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }

        if (onSubmit) {
          onSubmit(currentValue);
        } else if (onChange) {
          onChange(currentValue);
        }
      }

      if (e.key === 'Escape') {
        if (currentValue !== '') {
          e.preventDefault();
          handleClear();
        }
      }
    },
    [currentValue, onChange, onSubmit, handleClear],
  );

  const hasValue = typeof currentValue === 'string' && currentValue.length > 0;

  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const iconPositionClasses = ICON_POSITION_CLASSES[size] || ICON_POSITION_CLASSES.md;
  const clearPositionClasses = CLEAR_POSITION_CLASSES[size] || CLEAR_POSITION_CLASSES.md;

  const inputCombinedClasses = [
    INPUT_BASE_CLASSES,
    sizeClasses,
    inputClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const containerCombinedClasses = [
    CONTAINER_BASE_CLASSES,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const containerStyle = {};
  if (typeof minWidth === 'number' && minWidth > 0) {
    containerStyle.minWidth = `${minWidth}px`;
  }
  if (typeof maxWidth === 'number' && maxWidth > 0) {
    containerStyle.maxWidth = `${maxWidth}px`;
  }

  return (
    <div
      role="search"
      className={containerCombinedClasses}
      style={Object.keys(containerStyle).length > 0 ? containerStyle : undefined}
      data-testid={testId}
    >
      {/* Search Icon */}
      <span
        className={`absolute inset-y-0 left-0 flex items-center ${iconPositionClasses} text-gray-400 pointer-events-none`}
        aria-hidden="true"
      >
        <SearchIcon size={size} />
      </span>

      {/* Input */}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="search"
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellCheck="false"
        aria-label={ariaLabel || placeholder || 'Search'}
        className={inputCombinedClasses}
      />

      {/* Clear Button */}
      {showClearButton && hasValue && !disabled && (
        <span
          className={`absolute inset-y-0 right-0 flex items-center ${clearPositionClasses}`}
        >
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center p-0.5 rounded-standard text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-forest-teal-500 focus-visible:ring-offset-1"
            aria-label="Clear search"
            tabIndex={-1}
          >
            <ClearIcon size={size} />
          </button>
        </span>
      )}
    </div>
  );
}

SearchInput.propTypes = {
  /** Controlled search value. */
  value: PropTypes.string,
  /** Default search value for uncontrolled mode. */
  defaultValue: PropTypes.string,
  /** Callback when the search value changes. Receives the string value. */
  onChange: PropTypes.func,
  /** Callback when the clear button is clicked. */
  onClear: PropTypes.func,
  /** Callback when Enter is pressed. Receives the current value. */
  onSubmit: PropTypes.func,
  /** Placeholder text for the input. */
  placeholder: PropTypes.string,
  /** Debounce delay in milliseconds for the onChange callback. Set to 0 for no debounce. */
  debounceMs: PropTypes.number,
  /** Size variant. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether the input is disabled. */
  disabled: PropTypes.bool,
  /** Whether the input should be auto-focused on mount. */
  autoFocus: PropTypes.bool,
  /** Whether to show the clear button when the input has a value. */
  showClearButton: PropTypes.bool,
  /** Whether the input takes full width of its container. */
  fullWidth: PropTypes.bool,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Additional CSS classes for the input element. */
  inputClassName: PropTypes.string,
  /** Accessible label for the search input. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
  /** HTML id attribute for the input element. */
  id: PropTypes.string,
  /** HTML name attribute for the input element. */
  name: PropTypes.string,
  /** Minimum width in pixels for the input. */
  minWidth: PropTypes.number,
  /** Maximum width in pixels for the input. */
  maxWidth: PropTypes.number,
};