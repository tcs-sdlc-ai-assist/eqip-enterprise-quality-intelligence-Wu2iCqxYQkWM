import { useId, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * @module FormField
 * Reusable FormField component following the Vital Integrity design system.
 *
 * Supports multiple input types: text, email, password, number, tel, url,
 * select, textarea, checkbox, radio, date, datetime-local, time.
 *
 * Features:
 * - Accessible label associations via htmlFor/id
 * - Required field indicator (asterisk)
 * - Validation error message display
 * - Hint/help text support
 * - Disabled state
 * - Consistent spacing and typography from design system
 * - Keyboard accessible with visible focus indicators
 */

/**
 * Base CSS classes for text-like input elements.
 * @type {string}
 */
const INPUT_BASE_CLASSES =
  'block w-full px-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';

/**
 * Error state CSS classes for text-like input elements.
 * @type {string}
 */
const INPUT_ERROR_CLASSES =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20';

/**
 * Base CSS classes for select elements.
 * @type {string}
 */
const SELECT_BASE_CLASSES =
  'block w-full px-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed appearance-none bg-no-repeat bg-right pr-4';

/**
 * Inline background-image style for select dropdown chevron.
 * @type {object}
 */
const SELECT_CHEVRON_STYLE = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
  backgroundPosition: 'right 8px center',
  backgroundSize: '16px',
};

/**
 * Base CSS classes for textarea elements.
 * @type {string}
 */
const TEXTAREA_BASE_CLASSES =
  'block w-full px-1.5 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-standard shadow-sm placeholder:text-gray-400 transition-colors duration-150 focus:outline-none focus:border-deep-forest-teal-500 focus:ring-2 focus:ring-deep-forest-teal-500/20 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed resize-y min-h-[80px]';

/**
 * Base CSS classes for checkbox elements.
 * @type {string}
 */
const CHECKBOX_BASE_CLASSES =
  'h-2 w-2 rounded-standard border-gray-300 text-deep-forest-teal-600 focus:ring-deep-forest-teal-500/20 focus:ring-2 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Base CSS classes for radio elements.
 * @type {string}
 */
const RADIO_BASE_CLASSES =
  'h-2 w-2 rounded-full border-gray-300 text-deep-forest-teal-600 focus:ring-deep-forest-teal-500/20 focus:ring-2 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

/**
 * Size-specific CSS class mappings for text-like inputs.
 * @type {Readonly<object>}
 */
const SIZE_CLASSES = Object.freeze({
  sm: 'text-xs px-1 py-0.5',
  md: 'text-sm px-1.5 py-1',
  lg: 'text-base px-2 py-1.5',
});

/**
 * Input types that use the standard text input rendering.
 * @type {Set<string>}
 */
const TEXT_INPUT_TYPES = new Set([
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'date',
  'datetime-local',
  'time',
  'search',
]);

/**
 * Reusable FormField component with label, input, validation, and accessibility support.
 *
 * @param {object} props - Component props.
 * @param {string} [props.id] - Custom ID for the input element. Auto-generated if not provided.
 * @param {string} [props.label] - Label text displayed above the input.
 * @param {string} [props.name] - The name attribute for the input element.
 * @param {'text'|'email'|'password'|'number'|'tel'|'url'|'select'|'textarea'|'checkbox'|'radio'|'date'|'datetime-local'|'time'|'search'} [props.type='text'] - The input type.
 * @param {string|number|boolean} [props.value] - The current value of the input (controlled).
 * @param {string} [props.defaultValue] - The default value of the input (uncontrolled).
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {boolean} [props.required=false] - Whether the field is required.
 * @param {boolean} [props.disabled=false] - Whether the field is disabled.
 * @param {boolean} [props.readOnly=false] - Whether the field is read-only.
 * @param {string} [props.error] - Validation error message to display below the input.
 * @param {string} [props.hint] - Help text displayed below the input (hidden when error is shown).
 * @param {function} [props.onChange] - Change event handler. Receives the event object.
 * @param {function} [props.onBlur] - Blur event handler. Receives the event object.
 * @param {function} [props.onFocus] - Focus event handler. Receives the event object.
 * @param {Array<{value: string, label: string}>} [props.options] - Options for select, radio types.
 * @param {number} [props.rows=3] - Number of rows for textarea type.
 * @param {number} [props.min] - Minimum value for number/date inputs.
 * @param {number} [props.max] - Maximum value for number/date inputs.
 * @param {number} [props.step] - Step value for number inputs.
 * @param {number} [props.minLength] - Minimum length for text inputs.
 * @param {number} [props.maxLength] - Maximum length for text inputs.
 * @param {string} [props.pattern] - Regex pattern for text inputs.
 * @param {string} [props.autoComplete] - Autocomplete attribute value.
 * @param {boolean} [props.checked] - Checked state for checkbox/radio (controlled).
 * @param {boolean} [props.defaultChecked] - Default checked state for checkbox/radio (uncontrolled).
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant for the input.
 * @param {boolean} [props.fullWidth=true] - Whether the field takes full width.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.inputClassName] - Additional CSS classes for the input element.
 * @param {string} [props.labelClassName] - Additional CSS classes for the label element.
 * @param {string} [props.ariaLabel] - Accessible label for the input (used when label prop is not provided).
 * @param {string} [props.ariaDescribedBy] - ID of the element describing the input.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @param {React.ReactNode} [props.iconLeft] - Icon element rendered inside the input on the left.
 * @param {React.ReactNode} [props.iconRight] - Icon element rendered inside the input on the right.
 * @param {object} [props.rest] - Any additional HTML input attributes.
 * @returns {React.ReactElement} The rendered FormField element.
 */
export default function FormField({
  id: customId,
  label,
  name,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  hint,
  onChange,
  onBlur,
  onFocus,
  options,
  rows = 3,
  min,
  max,
  step,
  minLength,
  maxLength,
  pattern,
  autoComplete,
  checked,
  defaultChecked,
  size = 'md',
  fullWidth = true,
  className = '',
  inputClassName = '',
  labelClassName = '',
  ariaLabel,
  ariaDescribedBy,
  testId,
  iconLeft,
  iconRight,
  ...rest
}) {
  const generatedId = useId();
  const inputId = customId || `formfield-${generatedId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint && !error ? `${inputId}-hint` : undefined;
  const describedBy = [ariaDescribedBy, errorId, hintId].filter(Boolean).join(' ') || undefined;

  const hasError = typeof error === 'string' && error.trim() !== '';
  const isCheckboxOrRadio = type === 'checkbox' || type === 'radio';
  const isSelect = type === 'select';
  const isTextarea = type === 'textarea';
  const isRadioGroup = type === 'radio' && Array.isArray(options) && options.length > 0;
  const isTextInput = TEXT_INPUT_TYPES.has(type);

  const sizeClasses = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const rootClasses = [
    'space-y-0.5',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'block text-sm font-medium text-gray-700',
    labelClassName,
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Render the label element.
   * For checkbox (single, no options), label is rendered inline after the input.
   * For radio groups, a fieldset legend is used instead.
   * @returns {React.ReactElement|null}
   */
  function renderLabel() {
    if (!label) {
      return null;
    }

    if (isRadioGroup) {
      return null;
    }

    if (type === 'checkbox' && (!Array.isArray(options) || options.length === 0)) {
      return null;
    }

    return (
      <label htmlFor={inputId} className={labelClasses}>
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }

  /**
   * Render the error message.
   * @returns {React.ReactElement|null}
   */
  function renderError() {
    if (!hasError) {
      return null;
    }

    return (
      <p id={errorId} className="text-xs text-red-600 mt-0.5" role="alert">
        {error}
      </p>
    );
  }

  /**
   * Render the hint text.
   * @returns {React.ReactElement|null}
   */
  function renderHint() {
    if (!hint || hasError) {
      return null;
    }

    return (
      <p id={hintId} className="text-xs text-gray-500 mt-0.5">
        {hint}
      </p>
    );
  }

  /**
   * Render a text-like input element.
   * @returns {React.ReactElement}
   */
  function renderTextInput() {
    const hasIcons = iconLeft || iconRight;

    const inputClasses = [
      INPUT_BASE_CLASSES,
      sizeClasses,
      hasError ? INPUT_ERROR_CLASSES : '',
      hasIcons && iconLeft ? 'pl-4' : '',
      hasIcons && iconRight ? 'pr-4' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    const inputElement = (
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        min={min}
        max={max}
        step={step}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        autoComplete={autoComplete}
        aria-label={!label ? ariaLabel : undefined}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        className={inputClasses}
        data-testid={testId}
        {...rest}
      />
    );

    if (!hasIcons) {
      return inputElement;
    }

    return (
      <div className="relative">
        {iconLeft && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-gray-400 pointer-events-none" aria-hidden="true">
            {iconLeft}
          </span>
        )}
        {inputElement}
        {iconRight && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-1.5 text-gray-400 pointer-events-none" aria-hidden="true">
            {iconRight}
          </span>
        )}
      </div>
    );
  }

  /**
   * Render a select element.
   * @returns {React.ReactElement}
   */
  function renderSelect() {
    const selectClasses = [
      SELECT_BASE_CLASSES,
      sizeClasses,
      hasError ? INPUT_ERROR_CLASSES : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <select
        id={inputId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        aria-label={!label ? ariaLabel : undefined}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        className={selectClasses}
        style={SELECT_CHEVRON_STYLE}
        data-testid={testId}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {Array.isArray(options) &&
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
    );
  }

  /**
   * Render a textarea element.
   * @returns {React.ReactElement}
   */
  function renderTextarea() {
    const textareaClasses = [
      TEXTAREA_BASE_CLASSES,
      sizeClasses,
      hasError ? INPUT_ERROR_CLASSES : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <textarea
        id={inputId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        rows={rows}
        minLength={minLength}
        maxLength={maxLength}
        aria-label={!label ? ariaLabel : undefined}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        className={textareaClasses}
        data-testid={testId}
        {...rest}
      />
    );
  }

  /**
   * Render a single checkbox element with inline label.
   * @returns {React.ReactElement}
   */
  function renderCheckbox() {
    const checkboxClasses = [
      CHECKBOX_BASE_CLASSES,
      hasError ? 'border-red-500' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex items-start gap-1">
        <div className="flex items-center h-[20px]">
          <input
            id={inputId}
            name={name}
            type="checkbox"
            value={value}
            checked={checked}
            defaultChecked={defaultChecked}
            required={required}
            disabled={disabled}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-label={!label ? ariaLabel : undefined}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            className={checkboxClasses}
            data-testid={testId}
            {...rest}
          />
        </div>
        {label && (
          <label htmlFor={inputId} className="text-sm text-gray-700 cursor-pointer select-none">
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
      </div>
    );
  }

  /**
   * Render a radio group with fieldset and legend.
   * @returns {React.ReactElement}
   */
  function renderRadioGroup() {
    const radioClasses = [
      RADIO_BASE_CLASSES,
      hasError ? 'border-red-500' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <fieldset
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        data-testid={testId}
      >
        {label && (
          <legend className={labelClasses}>
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </legend>
        )}
        <div className="mt-0.5 space-y-0.5">
          {Array.isArray(options) &&
            options.map((opt) => {
              const optionId = `${inputId}-${opt.value}`;
              return (
                <div key={opt.value} className="flex items-center gap-1">
                  <input
                    id={optionId}
                    name={name || inputId}
                    type="radio"
                    value={opt.value}
                    checked={value !== undefined ? value === opt.value : undefined}
                    defaultChecked={defaultValue !== undefined ? defaultValue === opt.value : undefined}
                    disabled={disabled}
                    onChange={onChange}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    className={radioClasses}
                    {...rest}
                  />
                  <label htmlFor={optionId} className="text-sm text-gray-700 cursor-pointer select-none">
                    {opt.label}
                  </label>
                </div>
              );
            })}
        </div>
      </fieldset>
    );
  }

  /**
   * Render a single radio element (no options array).
   * @returns {React.ReactElement}
   */
  function renderSingleRadio() {
    const radioClasses = [
      RADIO_BASE_CLASSES,
      hasError ? 'border-red-500' : '',
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex items-center gap-1">
        <input
          id={inputId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          aria-label={!label ? ariaLabel : undefined}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={radioClasses}
          data-testid={testId}
          {...rest}
        />
        {label && (
          <label htmlFor={inputId} className="text-sm text-gray-700 cursor-pointer select-none">
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
      </div>
    );
  }

  /**
   * Render the appropriate input element based on type.
   * @returns {React.ReactElement}
   */
  function renderInput() {
    if (isRadioGroup) {
      return renderRadioGroup();
    }

    if (type === 'radio') {
      return renderSingleRadio();
    }

    if (type === 'checkbox') {
      return renderCheckbox();
    }

    if (isSelect) {
      return renderSelect();
    }

    if (isTextarea) {
      return renderTextarea();
    }

    if (isTextInput) {
      return renderTextInput();
    }

    return renderTextInput();
  }

  if (isCheckboxOrRadio && !isRadioGroup) {
    return (
      <div className={rootClasses}>
        {renderInput()}
        {renderError()}
        {renderHint()}
      </div>
    );
  }

  if (isRadioGroup) {
    return (
      <div className={rootClasses}>
        {renderInput()}
        {renderError()}
        {renderHint()}
      </div>
    );
  }

  return (
    <div className={rootClasses}>
      {renderLabel()}
      {renderInput()}
      {renderError()}
      {renderHint()}
    </div>
  );
}

FormField.propTypes = {
  /** Custom ID for the input element. Auto-generated if not provided. */
  id: PropTypes.string,
  /** Label text displayed above the input. */
  label: PropTypes.string,
  /** The name attribute for the input element. */
  name: PropTypes.string,
  /** The input type. */
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'url',
    'select',
    'textarea',
    'checkbox',
    'radio',
    'date',
    'datetime-local',
    'time',
    'search',
  ]),
  /** The current value of the input (controlled). */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
  /** The default value of the input (uncontrolled). */
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Placeholder text for the input. */
  placeholder: PropTypes.string,
  /** Whether the field is required. */
  required: PropTypes.bool,
  /** Whether the field is disabled. */
  disabled: PropTypes.bool,
  /** Whether the field is read-only. */
  readOnly: PropTypes.bool,
  /** Validation error message to display below the input. */
  error: PropTypes.string,
  /** Help text displayed below the input (hidden when error is shown). */
  hint: PropTypes.string,
  /** Change event handler. Receives the event object. */
  onChange: PropTypes.func,
  /** Blur event handler. Receives the event object. */
  onBlur: PropTypes.func,
  /** Focus event handler. Receives the event object. */
  onFocus: PropTypes.func,
  /** Options for select and radio types. */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  /** Number of rows for textarea type. */
  rows: PropTypes.number,
  /** Minimum value for number/date inputs. */
  min: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Maximum value for number/date inputs. */
  max: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Step value for number inputs. */
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Minimum length for text inputs. */
  minLength: PropTypes.number,
  /** Maximum length for text inputs. */
  maxLength: PropTypes.number,
  /** Regex pattern for text inputs. */
  pattern: PropTypes.string,
  /** Autocomplete attribute value. */
  autoComplete: PropTypes.string,
  /** Checked state for checkbox/radio (controlled). */
  checked: PropTypes.bool,
  /** Default checked state for checkbox/radio (uncontrolled). */
  defaultChecked: PropTypes.bool,
  /** Size variant for the input. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether the field takes full width. */
  fullWidth: PropTypes.bool,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Additional CSS classes for the input element. */
  inputClassName: PropTypes.string,
  /** Additional CSS classes for the label element. */
  labelClassName: PropTypes.string,
  /** Accessible label for the input (used when label prop is not provided). */
  ariaLabel: PropTypes.string,
  /** ID of the element describing the input. */
  ariaDescribedBy: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
  /** Icon element rendered inside the input on the left. */
  iconLeft: PropTypes.node,
  /** Icon element rendered inside the input on the right. */
  iconRight: PropTypes.node,
};