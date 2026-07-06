import PropTypes from 'prop-types';

/**
 * @module Stepper
 * Reusable Stepper component following the Vital Integrity design system.
 *
 * Multi-step workflow indicator with step labels, active/completed/pending states.
 * Used for demand and waiver workflows.
 *
 * Step States:
 * - completed: Deep Forest Teal filled circle with checkmark, solid connector
 * - active: Living Green filled circle with step number, pulsing ring
 * - pending: Gray outlined circle with step number, dashed connector
 * - error: Red filled circle with exclamation, solid connector
 *
 * Variants:
 * - horizontal: Steps laid out horizontally with connectors between (default)
 * - vertical: Steps laid out vertically with connectors between
 *
 * Sizes:
 * - sm: Compact stepper for inline/card usage
 * - md: Default stepper
 * - lg: Large stepper for full-page workflows
 *
 * Supports clickable steps, custom icons, and optional descriptions.
 */

/**
 * Base CSS classes for the stepper container.
 * @type {string}
 */
const HORIZONTAL_CONTAINER_CLASSES = 'flex items-start w-full';

/**
 * Vertical container classes.
 * @type {string}
 */
const VERTICAL_CONTAINER_CLASSES = 'flex flex-col w-full';

/**
 * Step state color mappings for the circle background.
 * @type {Readonly<object>}
 */
const CIRCLE_STATE_CLASSES = Object.freeze({
  completed: 'bg-deep-forest-teal text-white border-deep-forest-teal',
  active: 'bg-living-green text-white border-living-green ring-2 ring-living-green-200 ring-offset-1',
  pending: 'bg-white text-gray-400 border-gray-300',
  error: 'bg-red-500 text-white border-red-500',
});

/**
 * Connector state color mappings.
 * @type {Readonly<object>}
 */
const CONNECTOR_STATE_CLASSES = Object.freeze({
  completed: 'bg-deep-forest-teal',
  active: 'bg-gray-200',
  pending: 'bg-gray-200',
  error: 'bg-red-300',
});

/**
 * Vertical connector state classes.
 * @type {Readonly<object>}
 */
const VERTICAL_CONNECTOR_STATE_CLASSES = Object.freeze({
  completed: 'border-deep-forest-teal border-solid',
  active: 'border-gray-300 border-dashed',
  pending: 'border-gray-300 border-dashed',
  error: 'border-red-300 border-solid',
});

/**
 * Label state color mappings.
 * @type {Readonly<object>}
 */
const LABEL_STATE_CLASSES = Object.freeze({
  completed: 'text-deep-forest-teal-800 font-medium',
  active: 'text-deep-forest-teal-800 font-semibold',
  pending: 'text-gray-400 font-normal',
  error: 'text-red-600 font-medium',
});

/**
 * Description state color mappings.
 * @type {Readonly<object>}
 */
const DESCRIPTION_STATE_CLASSES = Object.freeze({
  completed: 'text-gray-500',
  active: 'text-gray-600',
  pending: 'text-gray-400',
  error: 'text-red-500',
});

/**
 * Size-specific circle dimension classes.
 * @type {Readonly<object>}
 */
const CIRCLE_SIZE_CLASSES = Object.freeze({
  sm: 'w-3 h-3 text-[10px]',
  md: 'w-4 h-4 text-xs',
  lg: 'w-5 h-5 text-sm',
});

/**
 * Size-specific label text classes.
 * @type {Readonly<object>}
 */
const LABEL_SIZE_CLASSES = Object.freeze({
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
});

/**
 * Size-specific description text classes.
 * @type {Readonly<object>}
 */
const DESCRIPTION_SIZE_CLASSES = Object.freeze({
  sm: 'text-[9px]',
  md: 'text-[10px]',
  lg: 'text-xs',
});

/**
 * Size-specific horizontal connector height classes.
 * @type {Readonly<object>}
 */
const CONNECTOR_HEIGHT_CLASSES = Object.freeze({
  sm: 'h-[2px]',
  md: 'h-[2px]',
  lg: 'h-[3px]',
});

/**
 * Size-specific vertical connector width classes.
 * @type {Readonly<object>}
 */
const VERTICAL_CONNECTOR_CLASSES = Object.freeze({
  sm: 'border-l ml-[11px] min-h-[20px]',
  md: 'border-l-2 ml-[15px] min-h-[24px]',
  lg: 'border-l-2 ml-[19px] min-h-[32px]',
});

/**
 * Checkmark SVG icon for completed steps.
 * @param {object} props - Component props.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @returns {React.ReactElement} An SVG checkmark icon.
 */
function CheckIcon({ size = 'md' }) {
  const dimension = size === 'lg' ? 14 : size === 'sm' ? 10 : 12;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

CheckIcon.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Exclamation SVG icon for error steps.
 * @param {object} props - Component props.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @returns {React.ReactElement} An SVG exclamation icon.
 */
function ErrorIcon({ size = 'md' }) {
  const dimension = size === 'lg' ? 14 : size === 'sm' ? 10 : 12;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

ErrorIcon.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

/**
 * Resolve the state of a step based on the current active step index.
 * If the step has an explicit state, that is used. Otherwise, state is
 * derived from position relative to the active step.
 *
 * @param {object} step - The step definition.
 * @param {number} stepIndex - The index of this step.
 * @param {number} activeStepIndex - The index of the currently active step.
 * @returns {'completed'|'active'|'pending'|'error'} The resolved step state.
 */
function resolveStepState(step, stepIndex, activeStepIndex) {
  if (step.state && typeof step.state === 'string') {
    const validStates = ['completed', 'active', 'pending', 'error'];
    if (validStates.includes(step.state)) {
      return step.state;
    }
  }

  if (stepIndex < activeStepIndex) {
    return 'completed';
  }

  if (stepIndex === activeStepIndex) {
    return 'active';
  }

  return 'pending';
}

/**
 * Resolve the connector state between two steps.
 * The connector takes the state of the step it leads to (the next step),
 * but if the current step is completed, the connector is also completed.
 *
 * @param {string} currentStepState - The state of the current step.
 * @returns {'completed'|'active'|'pending'|'error'} The connector state.
 */
function resolveConnectorState(currentStepState) {
  if (currentStepState === 'completed') {
    return 'completed';
  }

  if (currentStepState === 'error') {
    return 'error';
  }

  return 'pending';
}

/**
 * Render the circle indicator for a step.
 *
 * @param {object} props - Component props.
 * @param {string} props.state - The step state.
 * @param {number} props.stepNumber - The 1-based step number.
 * @param {'sm'|'md'|'lg'} props.size - The size variant.
 * @param {React.ReactNode} [props.icon] - Optional custom icon.
 * @returns {React.ReactElement} The step circle element.
 */
function StepCircle({ state, stepNumber, size, icon }) {
  const circleStateClass = CIRCLE_STATE_CLASSES[state] || CIRCLE_STATE_CLASSES.pending;
  const circleSizeClass = CIRCLE_SIZE_CLASSES[size] || CIRCLE_SIZE_CLASSES.md;

  const combinedClasses = [
    'inline-flex items-center justify-center rounded-full border-2 shrink-0 transition-all duration-200 select-none',
    circleStateClass,
    circleSizeClass,
  ]
    .filter(Boolean)
    .join(' ');

  let content;

  if (icon) {
    content = (
      <span className="inline-flex" aria-hidden="true">
        {icon}
      </span>
    );
  } else if (state === 'completed') {
    content = <CheckIcon size={size} />;
  } else if (state === 'error') {
    content = <ErrorIcon size={size} />;
  } else {
    content = <span>{stepNumber}</span>;
  }

  return (
    <div className={combinedClasses}>
      {content}
    </div>
  );
}

StepCircle.propTypes = {
  state: PropTypes.oneOf(['completed', 'active', 'pending', 'error']),
  stepNumber: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  icon: PropTypes.node,
};

/**
 * Reusable Stepper component with horizontal/vertical layout, step states,
 * clickable steps, custom icons, and optional descriptions.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.steps - Array of step definitions.
 * @param {string} props.steps[].label - The step label text.
 * @param {string} [props.steps[].description] - Optional step description text.
 * @param {'completed'|'active'|'pending'|'error'} [props.steps[].state] - Explicit step state. If not provided, derived from activeStep.
 * @param {React.ReactNode} [props.steps[].icon] - Optional custom icon element for the step circle.
 * @param {boolean} [props.steps[].disabled=false] - Whether the step is disabled (not clickable).
 * @param {number} [props.activeStep=0] - The index of the currently active step (0-based). Used to derive step states when explicit state is not provided.
 * @param {'horizontal'|'vertical'} [props.variant='horizontal'] - Layout variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant.
 * @param {boolean} [props.clickable=false] - Whether steps are clickable.
 * @param {function} [props.onStepClick] - Callback when a step is clicked. Receives (stepIndex, step).
 * @param {boolean} [props.showDescriptions=true] - Whether to show step descriptions.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.ariaLabel] - Accessible label for the stepper.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement|null} The rendered Stepper element, or null if no steps.
 */
export default function Stepper({
  steps,
  activeStep = 0,
  variant = 'horizontal',
  size = 'md',
  clickable = false,
  onStepClick,
  showDescriptions = true,
  className = '',
  ariaLabel,
  testId,
}) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }

  const isHorizontal = variant === 'horizontal';
  const isClickable = clickable && typeof onStepClick === 'function';

  /**
   * Handle step click.
   * @param {number} stepIndex - The index of the clicked step.
   * @param {object} step - The step definition.
   * @param {React.MouseEvent|React.KeyboardEvent} e - The event.
   */
  function handleStepClick(stepIndex, step, e) {
    if (!isClickable) {
      return;
    }

    if (step.disabled === true) {
      return;
    }

    onStepClick(stepIndex, step);
  }

  /**
   * Handle step keydown for keyboard accessibility.
   * @param {React.KeyboardEvent} e - The keyboard event.
   * @param {number} stepIndex - The index of the step.
   * @param {object} step - The step definition.
   */
  function handleStepKeyDown(e, stepIndex, step) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(stepIndex, step, e);
    }
  }

  const containerClasses = [
    isHorizontal ? HORIZONTAL_CONTAINER_CLASSES : VERTICAL_CONTAINER_CLASSES,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isHorizontal) {
    return (
      <nav
        className={containerClasses}
        aria-label={ariaLabel || 'Progress steps'}
        data-testid={testId}
      >
        <ol className="flex items-start w-full">
          {steps.map((step, index) => {
            const stepState = resolveStepState(step, index, activeStep);
            const isLast = index === steps.length - 1;
            const connectorState = resolveConnectorState(stepState);
            const labelStateClass = LABEL_STATE_CLASSES[stepState] || LABEL_STATE_CLASSES.pending;
            const labelSizeClass = LABEL_SIZE_CLASSES[size] || LABEL_SIZE_CLASSES.md;
            const descriptionStateClass = DESCRIPTION_STATE_CLASSES[stepState] || DESCRIPTION_STATE_CLASSES.pending;
            const descriptionSizeClass = DESCRIPTION_SIZE_CLASSES[size] || DESCRIPTION_SIZE_CLASSES.md;
            const connectorHeightClass = CONNECTOR_HEIGHT_CLASSES[size] || CONNECTOR_HEIGHT_CLASSES.md;
            const connectorColorClass = CONNECTOR_STATE_CLASSES[connectorState] || CONNECTOR_STATE_CLASSES.pending;

            const isStepClickable = isClickable && step.disabled !== true;
            const stepCursorClass = isStepClickable ? 'cursor-pointer' : '';
            const stepHoverClass = isStepClickable ? 'hover:opacity-80' : '';

            return (
              <li
                key={step.label || index}
                className={[
                  'flex items-start',
                  isLast ? '' : 'flex-1',
                ].filter(Boolean).join(' ')}
              >
                <div
                  className={[
                    'flex flex-col items-center',
                    stepCursorClass,
                    stepHoverClass,
                    'transition-opacity duration-150',
                  ].filter(Boolean).join(' ')}
                  role={isStepClickable ? 'button' : undefined}
                  tabIndex={isStepClickable ? 0 : undefined}
                  onClick={isStepClickable ? (e) => handleStepClick(index, step, e) : undefined}
                  onKeyDown={isStepClickable ? (e) => handleStepKeyDown(e, index, step) : undefined}
                  aria-current={stepState === 'active' ? 'step' : undefined}
                  aria-disabled={step.disabled === true ? true : undefined}
                >
                  <StepCircle
                    state={stepState}
                    stepNumber={index + 1}
                    size={size}
                    icon={step.icon}
                  />

                  <span
                    className={[
                      'mt-0.5 text-center max-w-[80px] leading-tight',
                      labelStateClass,
                      labelSizeClass,
                    ].join(' ')}
                  >
                    {step.label}
                  </span>

                  {showDescriptions && step.description && (
                    <span
                      className={[
                        'mt-[2px] text-center max-w-[80px] leading-tight',
                        descriptionStateClass,
                        descriptionSizeClass,
                      ].join(' ')}
                    >
                      {step.description}
                    </span>
                  )}
                </div>

                {!isLast && (
                  <div
                    className={[
                      'flex-1 mt-2',
                      'mx-1',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    <div
                      className={[
                        'w-full rounded-full',
                        connectorHeightClass,
                        connectorColorClass,
                      ].join(' ')}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  // Vertical variant
  return (
    <nav
      className={containerClasses}
      aria-label={ariaLabel || 'Progress steps'}
      data-testid={testId}
    >
      <ol className="flex flex-col w-full">
        {steps.map((step, index) => {
          const stepState = resolveStepState(step, index, activeStep);
          const isLast = index === steps.length - 1;
          const connectorState = resolveConnectorState(stepState);
          const labelStateClass = LABEL_STATE_CLASSES[stepState] || LABEL_STATE_CLASSES.pending;
          const labelSizeClass = LABEL_SIZE_CLASSES[size] || LABEL_SIZE_CLASSES.md;
          const descriptionStateClass = DESCRIPTION_STATE_CLASSES[stepState] || DESCRIPTION_STATE_CLASSES.pending;
          const descriptionSizeClass = DESCRIPTION_SIZE_CLASSES[size] || DESCRIPTION_SIZE_CLASSES.md;
          const verticalConnectorClass = VERTICAL_CONNECTOR_CLASSES[size] || VERTICAL_CONNECTOR_CLASSES.md;
          const verticalConnectorStateClass = VERTICAL_CONNECTOR_STATE_CLASSES[connectorState] || VERTICAL_CONNECTOR_STATE_CLASSES.pending;

          const isStepClickable = isClickable && step.disabled !== true;
          const stepCursorClass = isStepClickable ? 'cursor-pointer' : '';
          const stepHoverClass = isStepClickable ? 'hover:opacity-80' : '';

          return (
            <li
              key={step.label || index}
              className="flex flex-col"
            >
              <div
                className={[
                  'flex items-center gap-1',
                  stepCursorClass,
                  stepHoverClass,
                  'transition-opacity duration-150',
                ].filter(Boolean).join(' ')}
                role={isStepClickable ? 'button' : undefined}
                tabIndex={isStepClickable ? 0 : undefined}
                onClick={isStepClickable ? (e) => handleStepClick(index, step, e) : undefined}
                onKeyDown={isStepClickable ? (e) => handleStepKeyDown(e, index, step) : undefined}
                aria-current={stepState === 'active' ? 'step' : undefined}
                aria-disabled={step.disabled === true ? true : undefined}
              >
                <StepCircle
                  state={stepState}
                  stepNumber={index + 1}
                  size={size}
                  icon={step.icon}
                />

                <div className="flex flex-col min-w-0">
                  <span
                    className={[
                      'leading-tight',
                      labelStateClass,
                      labelSizeClass,
                    ].join(' ')}
                  >
                    {step.label}
                  </span>

                  {showDescriptions && step.description && (
                    <span
                      className={[
                        'leading-tight',
                        descriptionStateClass,
                        descriptionSizeClass,
                      ].join(' ')}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={[
                    verticalConnectorClass,
                    verticalConnectorStateClass,
                  ].join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Stepper.propTypes = {
  /** Array of step definitions. */
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      /** The step label text. */
      label: PropTypes.string.isRequired,
      /** Optional step description text. */
      description: PropTypes.string,
      /** Explicit step state. If not provided, derived from activeStep. */
      state: PropTypes.oneOf(['completed', 'active', 'pending', 'error']),
      /** Optional custom icon element for the step circle. */
      icon: PropTypes.node,
      /** Whether the step is disabled (not clickable). */
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  /** The index of the currently active step (0-based). Used to derive step states when explicit state is not provided. */
  activeStep: PropTypes.number,
  /** Layout variant. */
  variant: PropTypes.oneOf(['horizontal', 'vertical']),
  /** Size variant. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether steps are clickable. */
  clickable: PropTypes.bool,
  /** Callback when a step is clicked. Receives (stepIndex, step). */
  onStepClick: PropTypes.func,
  /** Whether to show step descriptions. */
  showDescriptions: PropTypes.bool,
  /** Additional CSS classes for the root container. */
  className: PropTypes.string,
  /** Accessible label for the stepper. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};

/**
 * Resolve the state of a step based on position relative to the active step.
 * Exported for use in other components that need to determine step states.
 *
 * @param {object} step - The step definition.
 * @param {number} stepIndex - The index of this step.
 * @param {number} activeStepIndex - The index of the currently active step.
 * @returns {'completed'|'active'|'pending'|'error'} The resolved step state.
 */
export { resolveStepState };