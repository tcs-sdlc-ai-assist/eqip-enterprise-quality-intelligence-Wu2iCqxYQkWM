import PropTypes from 'prop-types';

/**
 * @module ChartPlaceholder
 * Reusable ChartPlaceholder component following the Vital Integrity design system.
 *
 * Renders simple bar, line, pie, gauge, donut, and sparkline chart visualizations
 * using CSS-only or inline SVG. No external charting library dependency.
 *
 * Chart Types:
 * - bar: Vertical bar chart with labeled bars
 * - horizontal-bar: Horizontal bar chart with labeled bars
 * - line: Line chart rendered as SVG polyline
 * - pie: Pie/donut chart rendered as SVG circle segments
 * - donut: Donut chart (pie with center cutout)
 * - gauge: Semi-circular gauge indicator
 * - sparkline: Compact inline sparkline (no axes)
 * - stacked-bar: Stacked horizontal bar segments
 *
 * Supports custom colors, labels, sizes, and optional title/description.
 */

/**
 * Default color palette for chart segments.
 * @type {Readonly<Array<string>>}
 */
const DEFAULT_COLORS = Object.freeze([
  '#024E38', // Deep Forest Teal
  '#78BE20', // Living Green
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#DC2626', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F97316', // Orange
]);

/**
 * Size-specific dimension mappings.
 * @type {Readonly<object>}
 */
const SIZE_DIMENSIONS = Object.freeze({
  sm: { width: 200, height: 120, barWidth: 16, fontSize: 10, padding: 8 },
  md: { width: 320, height: 180, barWidth: 24, fontSize: 12, padding: 12 },
  lg: { width: 480, height: 260, barWidth: 32, fontSize: 14, padding: 16 },
});

/**
 * Get a color from the palette by index, cycling through if needed.
 * @param {number} index - The index of the color.
 * @param {Array<string>} [colors] - Optional custom color palette.
 * @returns {string} The color hex string.
 */
function getColor(index, colors) {
  const palette = Array.isArray(colors) && colors.length > 0 ? colors : DEFAULT_COLORS;
  return palette[index % palette.length];
}

/**
 * Clamp a number between min and max.
 * @param {number} value - The value to clamp.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} The clamped value.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Render a vertical bar chart using CSS.
 *
 * @param {object} props - Chart props.
 * @param {Array<{label: string, value: number}>} props.data - Data points.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {boolean} props.showValues - Whether to show values on bars.
 * @param {boolean} props.showLabels - Whether to show labels below bars.
 * @returns {React.ReactElement} The bar chart element.
 */
function BarChart({ data, colors, dimensions, showValues, showLabels }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map((d) => (typeof d.value === 'number' ? d.value : 0)), 1);
  const barGap = Math.max(4, Math.floor(dimensions.barWidth * 0.3));
  const chartHeight = dimensions.height - (showLabels ? 24 : 8);

  return (
    <div
      className="flex items-end justify-center gap-0.5"
      style={{ height: `${dimensions.height}px`, minWidth: `${Math.min(dimensions.width, data.length * (dimensions.barWidth + barGap))}px` }}
    >
      {data.map((item, index) => {
        const value = typeof item.value === 'number' ? item.value : 0;
        const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const barHeight = Math.max(2, (heightPercent / 100) * chartHeight);
        const color = getColor(index, colors);

        return (
          <div
            key={item.label || index}
            className="flex flex-col items-center"
            style={{ width: `${dimensions.barWidth}px` }}
          >
            {showValues && (
              <span
                className="text-gray-600 font-medium leading-none mb-[2px] truncate"
                style={{ fontSize: `${dimensions.fontSize - 2}px`, maxWidth: `${dimensions.barWidth + 8}px` }}
              >
                {typeof value === 'number' && !isNaN(value)
                  ? (Number.isInteger(value) ? String(value) : value.toFixed(1))
                  : '—'}
              </span>
            )}
            <div
              className="rounded-t-sm transition-all duration-300 ease-out w-full"
              style={{
                height: `${barHeight}px`,
                backgroundColor: color,
                minHeight: '2px',
              }}
              aria-label={`${item.label || ''}: ${value}`}
            />
            {showLabels && (
              <span
                className="text-gray-500 leading-none mt-[3px] truncate text-center w-full"
                style={{ fontSize: `${dimensions.fontSize - 2}px` }}
                title={item.label || ''}
              >
                {item.label || ''}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  showValues: PropTypes.bool,
  showLabels: PropTypes.bool,
};

/**
 * Render a horizontal bar chart using CSS.
 *
 * @param {object} props - Chart props.
 * @param {Array<{label: string, value: number}>} props.data - Data points.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {boolean} props.showValues - Whether to show values on bars.
 * @param {boolean} props.showLabels - Whether to show labels.
 * @returns {React.ReactElement} The horizontal bar chart element.
 */
function HorizontalBarChart({ data, colors, dimensions, showValues, showLabels }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const maxValue = Math.max(...data.map((d) => (typeof d.value === 'number' ? d.value : 0)), 1);
  const barHeight = Math.max(12, Math.floor(dimensions.barWidth * 0.75));

  return (
    <div className="flex flex-col gap-[6px] w-full" style={{ maxWidth: `${dimensions.width}px` }}>
      {data.map((item, index) => {
        const value = typeof item.value === 'number' ? item.value : 0;
        const widthPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = getColor(index, colors);

        return (
          <div key={item.label || index} className="flex items-center gap-1">
            {showLabels && (
              <span
                className="text-gray-600 font-medium truncate shrink-0 text-right"
                style={{ fontSize: `${dimensions.fontSize - 2}px`, width: '60px' }}
                title={item.label || ''}
              >
                {item.label || ''}
              </span>
            )}
            <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: `${barHeight}px` }}>
              <div
                className="rounded-full transition-all duration-300 ease-out h-full"
                style={{
                  width: `${Math.max(widthPercent, 1)}%`,
                  backgroundColor: color,
                }}
                aria-label={`${item.label || ''}: ${value}`}
              />
            </div>
            {showValues && (
              <span
                className="text-gray-500 font-medium shrink-0"
                style={{ fontSize: `${dimensions.fontSize - 2}px`, minWidth: '28px' }}
              >
                {typeof value === 'number' && !isNaN(value)
                  ? (Number.isInteger(value) ? String(value) : value.toFixed(1))
                  : '—'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

HorizontalBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  showValues: PropTypes.bool,
  showLabels: PropTypes.bool,
};

/**
 * Render a line chart using SVG polyline.
 *
 * @param {object} props - Chart props.
 * @param {Array<{label: string, value: number}>} props.data - Data points.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {boolean} props.showValues - Whether to show values at data points.
 * @param {boolean} props.showLabels - Whether to show labels on x-axis.
 * @param {boolean} props.showDots - Whether to show dots at data points.
 * @param {boolean} props.showArea - Whether to show filled area under the line.
 * @returns {React.ReactElement} The line chart SVG element.
 */
function LineChart({ data, colors, dimensions, showValues, showLabels, showDots, showArea }) {
  if (!Array.isArray(data) || data.length < 2) {
    return null;
  }

  const values = data.map((d) => (typeof d.value === 'number' ? d.value : 0));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const svgWidth = dimensions.width;
  const svgHeight = dimensions.height;
  const paddingX = dimensions.padding + 4;
  const paddingTop = showValues ? 16 : 8;
  const paddingBottom = showLabels ? 20 : 8;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const color = getColor(0, colors);

  const points = values.map((value, index) => {
    const x = paddingX + (index / (values.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y, value, label: data[index].label };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const areaPoints = [
    `${points[0].x},${paddingTop + chartHeight}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${paddingTop + chartHeight}`,
  ].join(' ');

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="overflow-visible"
      aria-label="Line chart"
      role="img"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const y = paddingTop + chartHeight * (1 - ratio);
        return (
          <line
            key={`grid-${ratio}`}
            x1={paddingX}
            y1={y}
            x2={svgWidth - paddingX}
            y2={y}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray={ratio === 0 ? 'none' : '4,4'}
          />
        );
      })}

      {/* Area fill */}
      {showArea && (
        <polygon
          points={areaPoints}
          fill={color}
          fillOpacity="0.1"
        />
      )}

      {/* Line */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots !== false && points.map((p, index) => (
        <circle
          key={`dot-${index}`}
          cx={p.x}
          cy={p.y}
          r="3"
          fill="white"
          stroke={color}
          strokeWidth="2"
        />
      ))}

      {/* Values */}
      {showValues && points.map((p, index) => (
        <text
          key={`val-${index}`}
          x={p.x}
          y={p.y - 8}
          textAnchor="middle"
          fill="#6B7280"
          fontSize={dimensions.fontSize - 2}
          fontFamily="Public Sans, sans-serif"
        >
          {Number.isInteger(p.value) ? String(p.value) : p.value.toFixed(1)}
        </text>
      ))}

      {/* Labels */}
      {showLabels && points.map((p, index) => {
        const showEveryN = points.length > 8 ? Math.ceil(points.length / 6) : 1;
        if (index % showEveryN !== 0 && index !== points.length - 1) {
          return null;
        }
        return (
          <text
            key={`label-${index}`}
            x={p.x}
            y={svgHeight - 4}
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize={dimensions.fontSize - 3}
            fontFamily="Public Sans, sans-serif"
          >
            {p.label || ''}
          </text>
        );
      })}
    </svg>
  );
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  showValues: PropTypes.bool,
  showLabels: PropTypes.bool,
  showDots: PropTypes.bool,
  showArea: PropTypes.bool,
};

/**
 * Render a pie or donut chart using SVG.
 *
 * @param {object} props - Chart props.
 * @param {Array<{label: string, value: number}>} props.data - Data segments.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {boolean} props.showLabels - Whether to show a legend.
 * @param {boolean} props.showValues - Whether to show values in legend.
 * @param {boolean} props.isDonut - Whether to render as donut (with center cutout).
 * @returns {React.ReactElement} The pie/donut chart SVG element.
 */
function PieChart({ data, colors, dimensions, showLabels, showValues, isDonut }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, d) => sum + (typeof d.value === 'number' && d.value > 0 ? d.value : 0), 0);

  if (total <= 0) {
    return null;
  }

  const size = Math.min(dimensions.width, dimensions.height);
  const radius = (size / 2) - 4;
  const innerRadius = isDonut ? radius * 0.55 : 0;
  const cx = size / 2;
  const cy = size / 2;

  let currentAngle = -Math.PI / 2;

  const segments = data
    .filter((d) => typeof d.value === 'number' && d.value > 0)
    .map((item, index) => {
      const value = item.value;
      const angle = (value / total) * Math.PI * 2;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const largeArc = angle > Math.PI ? 1 : 0;

      const x1Outer = cx + radius * Math.cos(startAngle);
      const y1Outer = cy + radius * Math.sin(startAngle);
      const x2Outer = cx + radius * Math.cos(endAngle);
      const y2Outer = cy + radius * Math.sin(endAngle);

      let pathD;

      if (isDonut) {
        const x1Inner = cx + innerRadius * Math.cos(startAngle);
        const y1Inner = cy + innerRadius * Math.sin(startAngle);
        const x2Inner = cx + innerRadius * Math.cos(endAngle);
        const y2Inner = cy + innerRadius * Math.sin(endAngle);

        pathD = [
          `M ${x1Outer} ${y1Outer}`,
          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
          `L ${x2Inner} ${y2Inner}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
          'Z',
        ].join(' ');
      } else {
        if (data.filter((d) => typeof d.value === 'number' && d.value > 0).length === 1) {
          pathD = [
            `M ${cx} ${cy - radius}`,
            `A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius}`,
            `L ${cx} ${cy}`,
            'Z',
          ].join(' ');
        } else {
          pathD = [
            `M ${cx} ${cy}`,
            `L ${x1Outer} ${y1Outer}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
            'Z',
          ].join(' ');
        }
      }

      return {
        pathD,
        color: getColor(index, colors),
        label: item.label || '',
        value,
        percentage: Math.round((value / total) * 100),
      };
    });

  const legendWidth = showLabels ? 120 : 0;
  const totalWidth = size + (showLabels ? legendWidth + 12 : 0);

  return (
    <div className="flex items-center gap-1.5" style={{ maxWidth: `${totalWidth}px` }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
        aria-label={isDonut ? 'Donut chart' : 'Pie chart'}
        role="img"
      >
        {segments.map((seg, index) => (
          <path
            key={`seg-${index}`}
            d={seg.pathD}
            fill={seg.color}
            stroke="white"
            strokeWidth="1.5"
          >
            <title>{`${seg.label}: ${seg.value} (${seg.percentage}%)`}</title>
          </path>
        ))}
        {isDonut && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#111827"
            fontSize={dimensions.fontSize + 2}
            fontWeight="600"
            fontFamily="Public Sans, sans-serif"
          >
            {total}
          </text>
        )}
      </svg>

      {showLabels && (
        <div className="flex flex-col gap-[3px] min-w-0">
          {segments.map((seg, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-0.5 min-w-0">
              <span
                className="w-[10px] h-[10px] rounded-sm shrink-0"
                style={{ backgroundColor: seg.color }}
                aria-hidden="true"
              />
              <span
                className="text-gray-600 truncate leading-tight"
                style={{ fontSize: `${dimensions.fontSize - 2}px` }}
                title={seg.label}
              >
                {seg.label}
              </span>
              {showValues && (
                <span
                  className="text-gray-400 shrink-0 leading-tight"
                  style={{ fontSize: `${dimensions.fontSize - 3}px` }}
                >
                  {seg.percentage}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

PieChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  showLabels: PropTypes.bool,
  showValues: PropTypes.bool,
  isDonut: PropTypes.bool,
};

/**
 * Render a gauge chart using SVG arc.
 *
 * @param {object} props - Chart props.
 * @param {number} props.value - The current value (0-100).
 * @param {number} [props.max=100] - The maximum value.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {string} [props.label] - Label text below the gauge.
 * @param {string} [props.unit] - Unit to display after the value.
 * @returns {React.ReactElement} The gauge chart SVG element.
 */
function GaugeChart({ value, max, colors, dimensions, label, unit }) {
  const safeMax = typeof max === 'number' && max > 0 ? max : 100;
  const safeValue = typeof value === 'number' ? clamp(value, 0, safeMax) : 0;
  const percentage = safeMax > 0 ? (safeValue / safeMax) * 100 : 0;

  const size = Math.min(dimensions.width, dimensions.height + 20);
  const radius = (size / 2) - 12;
  const strokeWidth = Math.max(8, Math.floor(radius * 0.2));
  const cx = size / 2;
  const cy = size / 2 + 8;

  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const totalArc = endAngle - startAngle;
  const valueAngle = startAngle + (percentage / 100) * totalArc;

  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy + radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy + radius * Math.sin(endAngle);

  const valX2 = cx + radius * Math.cos(valueAngle);
  const valY2 = cy + radius * Math.sin(valueAngle);
  const valueLargeArc = percentage > 50 ? 1 : 0;

  let gaugeColor;
  if (percentage >= 80) {
    gaugeColor = getColor(1, colors); // Green
  } else if (percentage >= 60) {
    gaugeColor = getColor(3, colors); // Amber
  } else {
    gaugeColor = getColor(4, colors); // Red
  }

  if (Array.isArray(colors) && colors.length > 0) {
    gaugeColor = colors[0];
  }

  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 0 1 ${bgX2} ${bgY2}`;

  let valuePath = '';
  if (percentage > 0) {
    valuePath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${valueLargeArc} 1 ${valX2} ${valY2}`;
  }

  const displayValue = Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 24}
        viewBox={`0 0 ${size} ${size / 2 + 24}`}
        className="overflow-visible"
        aria-label={`Gauge: ${displayValue}${unit || ''}`}
        role="img"
      >
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Value arc */}
        {percentage > 0 && (
          <path
            d={valuePath}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* Value text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#111827"
          fontSize={dimensions.fontSize + 6}
          fontWeight="700"
          fontFamily="Public Sans, sans-serif"
        >
          {displayValue}{unit || ''}
        </text>
      </svg>

      {label && (
        <span
          className="text-gray-500 font-medium text-center -mt-[4px]"
          style={{ fontSize: `${dimensions.fontSize - 1}px` }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

GaugeChart.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  label: PropTypes.string,
  unit: PropTypes.string,
};

/**
 * Render a sparkline chart using SVG polyline.
 *
 * @param {object} props - Chart props.
 * @param {Array<number>} props.values - Array of numeric data points.
 * @param {string} [props.color] - Stroke color.
 * @param {number} [props.width=80] - SVG width.
 * @param {number} [props.height=24] - SVG height.
 * @param {boolean} [props.showArea] - Whether to show filled area.
 * @returns {React.ReactElement|null} The sparkline SVG, or null if insufficient data.
 */
function SparklineChart({ values, color, width, height, showArea }) {
  if (!Array.isArray(values) || values.length < 2) {
    return null;
  }

  const filtered = values.filter((v) => typeof v === 'number' && !isNaN(v));

  if (filtered.length < 2) {
    return null;
  }

  const svgWidth = typeof width === 'number' && width > 0 ? width : 80;
  const svgHeight = typeof height === 'number' && height > 0 ? height : 24;
  const strokeColor = color || '#78BE20';

  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;

  const padding = 2;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  const points = filtered.map((value, index) => {
    const x = padding + (index / (filtered.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return `${x},${y}`;
  });

  const polylinePoints = points.join(' ');

  const areaPoints = [
    `${padding},${padding + chartHeight}`,
    ...points,
    `${padding + chartWidth},${padding + chartHeight}`,
  ].join(' ');

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="shrink-0"
      aria-hidden="true"
    >
      {showArea && (
        <polygon
          points={areaPoints}
          fill={strokeColor}
          fillOpacity="0.1"
        />
      )}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

SparklineChart.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  showArea: PropTypes.bool,
};

/**
 * Render a stacked horizontal bar chart using CSS.
 *
 * @param {object} props - Chart props.
 * @param {Array<{label: string, value: number}>} props.data - Data segments.
 * @param {Array<string>} [props.colors] - Custom color palette.
 * @param {object} props.dimensions - Size dimensions.
 * @param {boolean} props.showLabels - Whether to show a legend.
 * @param {boolean} props.showValues - Whether to show values in legend.
 * @returns {React.ReactElement} The stacked bar chart element.
 */
function StackedBarChart({ data, colors, dimensions, showLabels, showValues }) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const total = data.reduce((sum, d) => sum + (typeof d.value === 'number' && d.value > 0 ? d.value : 0), 0);

  if (total <= 0) {
    return null;
  }

  const barHeight = Math.max(16, Math.floor(dimensions.barWidth));

  return (
    <div className="flex flex-col gap-1" style={{ maxWidth: `${dimensions.width}px` }}>
      <div
        className="flex w-full rounded-full overflow-hidden"
        style={{ height: `${barHeight}px` }}
        role="img"
        aria-label="Stacked bar chart"
      >
        {data
          .filter((d) => typeof d.value === 'number' && d.value > 0)
          .map((item, index) => {
            const percentage = (item.value / total) * 100;
            const color = getColor(index, colors);

            return (
              <div
                key={item.label || index}
                className="transition-all duration-300 ease-out"
                style={{
                  width: `${Math.max(percentage, 0.5)}%`,
                  backgroundColor: color,
                  height: '100%',
                }}
                title={`${item.label || ''}: ${item.value} (${Math.round(percentage)}%)`}
              />
            );
          })}
      </div>

      {showLabels && (
        <div className="flex flex-wrap gap-x-1.5 gap-y-[3px]">
          {data
            .filter((d) => typeof d.value === 'number' && d.value > 0)
            .map((item, index) => {
              const percentage = Math.round((item.value / total) * 100);
              const color = getColor(index, colors);

              return (
                <div key={`legend-${index}`} className="flex items-center gap-0.5">
                  <span
                    className="w-[8px] h-[8px] rounded-sm shrink-0"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  <span
                    className="text-gray-600 leading-tight"
                    style={{ fontSize: `${dimensions.fontSize - 2}px` }}
                  >
                    {item.label || ''}
                  </span>
                  {showValues && (
                    <span
                      className="text-gray-400 leading-tight"
                      style={{ fontSize: `${dimensions.fontSize - 3}px` }}
                    >
                      {percentage}%
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

StackedBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  colors: PropTypes.arrayOf(PropTypes.string),
  dimensions: PropTypes.object.isRequired,
  showLabels: PropTypes.bool,
  showValues: PropTypes.bool,
};

/**
 * Reusable ChartPlaceholder component that renders simple chart visualizations
 * using CSS-only or SVG. No external charting library dependency.
 *
 * @param {object} props - Component props.
 * @param {'bar'|'horizontal-bar'|'line'|'pie'|'donut'|'gauge'|'sparkline'|'stacked-bar'} [props.type='bar'] - The chart type to render.
 * @param {Array<{label: string, value: number}>} [props.data] - Data points for bar, line, pie, donut, stacked-bar charts.
 * @param {Array<number>} [props.values] - Numeric values for sparkline chart type.
 * @param {number} [props.value] - Single value for gauge chart type.
 * @param {number} [props.max=100] - Maximum value for gauge chart type.
 * @param {string} [props.unit] - Unit to display for gauge chart type.
 * @param {string} [props.title] - Optional title displayed above the chart.
 * @param {string} [props.description] - Optional description displayed below the title.
 * @param {string} [props.label] - Label for gauge chart type.
 * @param {Array<string>} [props.colors] - Custom color palette. Falls back to default palette.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant controlling chart dimensions.
 * @param {boolean} [props.showValues=false] - Whether to display values on the chart.
 * @param {boolean} [props.showLabels=true] - Whether to display labels/legend.
 * @param {boolean} [props.showDots=true] - Whether to show dots on line charts.
 * @param {boolean} [props.showArea=false] - Whether to show filled area on line/sparkline charts.
 * @param {string} [props.className] - Additional CSS classes to append.
 * @param {string} [props.ariaLabel] - Accessible label for the chart.
 * @param {string} [props.testId] - data-testid attribute for testing.
 * @returns {React.ReactElement} The rendered ChartPlaceholder element.
 */
export default function ChartPlaceholder({
  type = 'bar',
  data,
  values,
  value,
  max = 100,
  unit,
  title,
  description,
  label,
  colors,
  size = 'md',
  showValues = false,
  showLabels = true,
  showDots = true,
  showArea = false,
  className = '',
  ariaLabel,
  testId,
}) {
  const dimensions = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.md;

  const hasData = (Array.isArray(data) && data.length > 0) ||
    (Array.isArray(values) && values.length >= 2) ||
    (type === 'gauge' && typeof value === 'number');

  const containerClasses = [
    'flex flex-col',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  /**
   * Render the appropriate chart based on type.
   * @returns {React.ReactElement|null}
   */
  function renderChart() {
    if (!hasData) {
      return (
        <div
          className="flex items-center justify-center text-gray-300"
          style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
        >
          <div className="flex flex-col items-center gap-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span className="text-xs text-gray-400">No chart data</span>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showValues={showValues}
            showLabels={showLabels}
          />
        );

      case 'horizontal-bar':
        return (
          <HorizontalBarChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showValues={showValues}
            showLabels={showLabels}
          />
        );

      case 'line':
        return (
          <LineChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showValues={showValues}
            showLabels={showLabels}
            showDots={showDots}
            showArea={showArea}
          />
        );

      case 'pie':
        return (
          <PieChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showLabels={showLabels}
            showValues={showValues}
            isDonut={false}
          />
        );

      case 'donut':
        return (
          <PieChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showLabels={showLabels}
            showValues={showValues}
            isDonut={true}
          />
        );

      case 'gauge':
        return (
          <GaugeChart
            value={value}
            max={max}
            colors={colors}
            dimensions={dimensions}
            label={label}
            unit={unit}
          />
        );

      case 'sparkline':
        return (
          <SparklineChart
            values={values || (Array.isArray(data) ? data.map((d) => d.value) : [])}
            color={Array.isArray(colors) && colors.length > 0 ? colors[0] : undefined}
            width={dimensions.width}
            height={Math.min(dimensions.height, 40)}
            showArea={showArea}
          />
        );

      case 'stacked-bar':
        return (
          <StackedBarChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showLabels={showLabels}
            showValues={showValues}
          />
        );

      default:
        return (
          <BarChart
            data={data}
            colors={colors}
            dimensions={dimensions}
            showValues={showValues}
            showLabels={showLabels}
          />
        );
    }
  }

  return (
    <div
      className={containerClasses}
      role="figure"
      aria-label={ariaLabel || title || `${type} chart`}
      data-testid={testId}
    >
      {(title || description) && (
        <div className="mb-1">
          {title && (
            <h4
              className="text-sm font-semibold text-gray-800 leading-tight"
            >
              {title}
            </h4>
          )}
          {description && (
            <p
              className="text-xs text-gray-500 leading-tight mt-[2px]"
            >
              {description}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center">
        {renderChart()}
      </div>
    </div>
  );
}

ChartPlaceholder.propTypes = {
  /** The chart type to render. */
  type: PropTypes.oneOf(['bar', 'horizontal-bar', 'line', 'pie', 'donut', 'gauge', 'sparkline', 'stacked-bar']),
  /** Data points for bar, line, pie, donut, stacked-bar charts. */
  data: PropTypes.arrayOf(
    PropTypes.shape({
      /** Data point label. */
      label: PropTypes.string,
      /** Data point value. */
      value: PropTypes.number,
    }),
  ),
  /** Numeric values for sparkline chart type. */
  values: PropTypes.arrayOf(PropTypes.number),
  /** Single value for gauge chart type. */
  value: PropTypes.number,
  /** Maximum value for gauge chart type. */
  max: PropTypes.number,
  /** Unit to display for gauge chart type. */
  unit: PropTypes.string,
  /** Optional title displayed above the chart. */
  title: PropTypes.string,
  /** Optional description displayed below the title. */
  description: PropTypes.string,
  /** Label for gauge chart type. */
  label: PropTypes.string,
  /** Custom color palette. Falls back to default palette. */
  colors: PropTypes.arrayOf(PropTypes.string),
  /** Size variant controlling chart dimensions. */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether to display values on the chart. */
  showValues: PropTypes.bool,
  /** Whether to display labels/legend. */
  showLabels: PropTypes.bool,
  /** Whether to show dots on line charts. */
  showDots: PropTypes.bool,
  /** Whether to show filled area on line/sparkline charts. */
  showArea: PropTypes.bool,
  /** Additional CSS classes to append. */
  className: PropTypes.string,
  /** Accessible label for the chart. */
  ariaLabel: PropTypes.string,
  /** data-testid attribute for testing. */
  testId: PropTypes.string,
};