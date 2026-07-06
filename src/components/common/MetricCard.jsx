import PropTypes from 'prop-types';
import Card from './Card.jsx';
import Badge from './Badge.jsx';

/**
 * @module MetricCard
 * Reusable MetricCard component following the Vital Integrity design system.
 *
 * Displays a single metric with label, value, trend indicator (up/down/neutral),
 * and optional sparkline visualization. Built on top of the Card component.
 *
 * Variants:
 * - base: Standard metric display
 * - compact: Smaller metric display for dense layouts
 * - highlighted: Emphasized metric with tinted background
 *
 * Trend directions:
 * - up: Green arrow up indicator (improving)
 * - down: Red arrow down indicator (declining)
 * - neutral: Gray horizontal indicator (stable)
 *
 * Supports optional sparkline data, unit display, target comparison,
 * grade badge, and status badge.
 */

/**
 * Base CSS classes for the metric value display.
 * @type {string}
 */
const VALUE_BASE_CLASSES = 'font-bold text-deep-forest-teal-800 leading-tight';

/**
 * Size-specific CSS class mappings for the metric value.
 * @type {Readonly<object>}
 */
const VALUE_SIZE_CLASSES = Object.freeze({
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
});

/**
 * Trend direction color mappings.
 * @type {Readonly<object>}
 */
const TREND_COLORS = Object.freeze({
  up: 'text-living-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-400',
});

/**
 * Trend direction background color mappings for the badge.
 * @type {Readonly<object>}
 */
const TREND_BG_COLORS = Object.freeze({
  up: 'bg-living-green-50',
  down: 'bg-red-50',
  neutral: 'bg-gray-100',
});

/**
 * Card variant mappings for MetricCard variants.
 * @type {Readonly<object>}
 */
const CARD_VARIANT_MAP = Object.freeze({
  base: 'base',
  compact: 'base',
  highlighted: 'tinted',
});

/**
 * Chevron Up SVG icon for upward trend.
 * @returns {React.ReactElement} An SVG chevron up icon.
 */
function TrendUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/**
 * Chevron Down SVG icon for downward trend.
 * @returns {React.ReactElement} An SVG chevron down icon.
 */
function TrendDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Minus SVG icon for neutral trend.
 * @returns {React.ReactElement} An SVG minus icon.
 */
function TrendNeutralIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/**
 * Render the trend icon based on direction.
 * @param {string} direction - The trend direction ('up', 'down', 'neutral').
 * @returns {React.ReactElement} The trend icon element.
 */
function renderTrendIcon(direction) {
  if (direction === 'up') {
    return <TrendUpIcon />;
  }
  if (direction === 'down') {
    return <TrendDownIcon />;
  }
  return <TrendNeutralIcon />;
}

/**
 * Format a trend percentage for display.
 * @param {number} percentage - The trend percentage value.
 * @param {string} direction - The trend direction.
 * @returns {string} The formatted trend percentage string.
 */
function formatTrendPercentage(percentage) {
  if (percentage === null || percentage === undefined || typeof percentage !== 'number') {
    return '';
  }

  const absValue = Math.abs(percentage);
  const formatted = absValue % 1 === 0 ? String(absValue) : absValue.toFixed(1);

  if (percentage > 0) {
    return '+' + formatted + '%';
  }
  if (percentage < 0) {
    return '-' + formatted + '%';
  }
  return formatted + '%';
}

/**
 * Format a metric value for display.
 * @param {number|string} value - The metric value.
 * @param {string} [unit] - The unit to append.
 * @returns {string} The formatted value string.
 */
function formatMetricValue(value, unit) {
  if (value === null || value === undefined) {
    return '—';
  }

  let displayValue;

  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      displayValue = String(value);
    } else {
      displayValue = value.toFixed(2).replace(/\.?0+$/, '');
      if (displayValue.indexOf('.') !== -1) {
        const parts = displayValue.split('.');
        if (parts[1] && parts[1].length > 2) {
          displayValue = value.toFixed(2);
        }
      }
    }
  } else {
    displayValue = String(value);
  }

  if (unit && typeof unit === 'string') {
    if (unit === '%') {
      return displayValue + '%';
    }
    return displayValue + ' ' + unit;
  }

  return displayValue;
}

/**
 * Resolve trend direction from a string.
 * @param {string} trend - The trend string (e.g., 'improving', 'declining', 'stable', 'up', 'down').
 * @returns {string} The normalized trend direction ('up', 'down', 'neutral').
 */
function resolveTrendDirection(trend) {
  if (!trend || typeof trend !== 'string') {
    return 'neutral';
  }

  const normalized = trend.toLowerCase().trim();

  if (normalized === 'up' || normalized === 'improving' || normalized === 'increase' || normalized === 'positive') {
    return 'up';
  }

  if (normalized === 'down' || normalized === 'declining' || normalized === 'decrease' || normalized === 'negative') {
    return 'down';
  }

  return 'neutral';
}

/**
 * Simple sparkline SVG component.
 * Renders a small line chart from an array of numeric data points.
 *
 * @param {object} props - Component props.
 * @param {Array<number>} props.data - Array of numeric data points.
 * @param {number} [props.width=80] - SVG width.
 * @param {number} [props.height=24] - SVG height.
 * @param {string} [props.color='#78BE20'] - Stroke color.
 * @returns {React.ReactElement|null} The sparkline SVG, or null if no data.
 */
function Sparkline({ data, width = 80, height = 24, color = '#78BE20' }) {
  if (!Array.isArray(data) || data.length < 2) {
    return null;
  }

  const values = data.filter((v) => typeof v === 'number' && !isNaN(v));

  if (values.length < 2) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Sparkline.propTypes = {
  /** Array of numeric data points. */
  data: PropTypes.arrayOf(PropTypes.number),
  /** SVG width. */
  width: PropTypes.number,
  /** SVG height. */
  height: PropTypes.number,
  /** Stroke color. */
  color: PropTypes.string,
};

/**
 * Reusable MetricCard component displaying a single metric with label, value,
 * trend indicator, and optional sparkline.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - The metric label/name displayed above the value.
 * @param {number|string} props.value - The metric value to display.
 * @param {string} [props.unit] - The unit to display after the value (e.g., '%', 'defects/KLOC').
 * @param {'up'|'down'|'neutral'|'improving'|'declining'|'stable'} [props.trend] - The trend direction.
 * @param {number} [props.trendPercentage] - The trend percentage change value.
 * @param {string} [props.trendLabel] - Custom label for the trend indicator.
 * @param {Array<number>} [props.sparklineData] - Array of numeric data points for the sparkline.
 * @param {string} [props.sparklineColor] - Custom color for the sparkline stroke.
 * @param {number|string} [props.target] - Target value for comparison display.
 * @param {string} [props.grade] - Letter grade to display as a badge (e.g., 'A', 'B', 'C').
 * @param {string} [props.status] - Status string to display as a badge (e.g., 'healthy', 'at_risk').
 * @param {React.ReactNode} [props.icon] - Optional icon element rendered before the label.
 * @param {'base'|'compact'|'highlighted'} [props.variant='base'] - Visual variant.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant controlling value text size.
 * @param {boolean} [props.interactive=false] - Whether the card has a hover state.
 * @param {function} [props.onClick] - Click event handler. When provided, the card becomes interactive.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the metric card.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered MetricCard element.
 */
export default function MetricCard({
  label,
  value,
  unit,
  trend,
  trendPercentage,
  trendLabel,
  sparklineData,
  sparklineColor,
  target,
  grade,
  status,
  icon,
  variant = 'base',
  size = 'md',
  interactive = false,
  onClick,
  className = '',
  ariaLabel,
  testId,
}) {
  const resolvedTrend = trend ? resolveTrendDirection(trend) : null;
  const cardVariant = CARD_VARIANT_MAP[variant] || CARD_VARIANT_MAP.base;
  const valueSizeClass = VALUE_SIZE_CLASSES[size] || VALUE_SIZE_CLASSES.md;
  const isCompact = variant === 'compact';

  const trendColor = resolvedTrend ? TREND_COLORS[resolvedTrend] : '';
  const trendBgColor = resolvedTrend ? TREND_BG_COLORS[resolvedTrend] : '';

  const formattedValue = formatMetricValue(value, unit);
  const formattedTrendPercentage = formatTrendPercentage(trendPercentage);

  const hasTrend = resolvedTrend !== null && (formattedTrendPercentage || trendLabel);
  const hasSparkline = Array.isArray(sparklineData) && sparklineData.length >= 2;
  const hasTarget = target !== null && target !== undefined;
  const hasGrade = grade && typeof grade === 'string';
  const hasStatus = status && typeof status === 'string';

  const gradeVariantMap = {
    A: 'success',
    B: 'info',
    C: 'warning',
    D: 'error',
    F: 'error',
  };

  const cardPadding = isCompact ? 'sm' : 'md';

  const cardContent = (
    <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
      {/* Header row: label + optional grade/status badges */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5 min-w-0">
          {icon && (
            <span className="inline-flex shrink-0 text-deep-forest-teal-500" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className={[
            'text-gray-500 font-medium truncate',
            isCompact ? 'text-[11px]' : 'text-xs',
          ].join(' ')}>
            {label || '—'}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {hasGrade && (
            <Badge
              variant={gradeVariantMap[grade.toUpperCase()] || 'neutral'}
              size="sm"
            >
              {grade.toUpperCase()}
            </Badge>
          )}
          {hasStatus && (
            <Badge
              status={status}
              size="sm"
            />
          )}
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between gap-1">
        <div className="flex items-baseline gap-0.5 min-w-0">
          <span className={[VALUE_BASE_CLASSES, valueSizeClass].join(' ')}>
            {formattedValue}
          </span>
        </div>

        {/* Sparkline */}
        {hasSparkline && (
          <div className="shrink-0">
            <Sparkline
              data={sparklineData}
              width={isCompact ? 60 : 80}
              height={isCompact ? 20 : 24}
              color={sparklineColor || (resolvedTrend === 'down' ? '#DC2626' : '#78BE20')}
            />
          </div>
        )}
      </div>

      {/* Trend row + target */}
      {(hasTrend || hasTarget) && (
        <div className="flex items-center justify-between gap-1">
          {hasTrend && (
            <span
              className={[
                'inline-flex items-center gap-[2px] px-0.5 py-[1px] rounded-full text-[10px] font-medium',
                trendBgColor,
                trendColor,
              ].join(' ')}
            >
              {renderTrendIcon(resolvedTrend)}
              <span>
                {formattedTrendPercentage}
                {trendLabel ? (formattedTrendPercentage ? ' ' : '') + trendLabel : ''}
              </span>
            </span>
          )}

          {hasTarget && (
            <span className="text-[10px] text-gray-400 font-medium">
              Target: {typeof target === 'number' && unit === '%' ? target + '%' : String(target)}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card
      variant={cardVariant}
      padding={cardPadding}
      interactive={interactive || typeof onClick === 'function'}
      onClick={onClick}
      className={className}
      ariaLabel={ariaLabel || (label ? `Metric: ${label}` : undefined)}
      data-testid={testId}
    >
      {cardContent}
    </Card>
  );
}

MetricCard.propTypes = {
  /** The metric label/name displayed above the value. */
  label: PropTypes.string.isRequired,
  /** The metric value to display. */
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** The unit to display after the value (e.g., '%', 'defects/KLOC'). */
  unit: PropTypes.string,
  /** The trend direction. */
  trend: PropTypes.oneOf(['up', 'down', 'neutral', 'improving', 'declining', 'stable']),
  /** The trend percentage change value. */
  trendPercentage: PropTypes.number,
  /** Custom label for the trend indicator. */
  trendLabel: PropTypes.string,
  /** Array of numeric data points for the sparkline. */
  sparklineData: PropTypes.arrayOf(PropTypes.number),
  /** Custom color for the sparkline stroke. */
  sparklineColor: PropTypes.string,
  /** Target value for comparison display. */
  target: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  /** Letter grade to display as a badge (e.g., 'A', 'B', 'C'). */
  grade: PropTypes.string,
  /** Status string to display as a badge (e.g., 'healthy', 'at_risk'). */
  status: PropTypes.string,
  /** Optional icon element rendered before the label. */
  icon: PropTypes.node,
  /** Visual variant of the metric card. */
  variant: PropTypes.oneOf(['base', 'compact', 'highlighted']),
  /** Size variant controlling value text size. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether the card has a hover state. */
  interactive: PropTypes.bool,
  /** Click event handler. When provided, the card becomes interactive. */
  onClick: PropTypes.func,
  /** Additional CSS classes to append to the card element. */
  className: PropTypes.string,
  /** Accessible label for the metric card. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};