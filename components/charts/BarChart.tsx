import React from 'react';
import { GraphData } from '../../types';

interface BarChartProps {
  data: GraphData;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (data.type !== 'bar') return null;

  const topPadding = 30;
  const chartHeight = 200;
  const chartWidth = 400;
  const yAxisWidth = 40;
  const xAxisHeight = 30;

  const allDataPoints = data.datasets.flatMap(ds => ds.data);
  const maxValue = allDataPoints.length > 0 ? Math.max(...allDataPoints) * 1.2 : 1;

  const numYAxisLabels = 5;
  const yAxisLabels = Array.from({ length: numYAxisLabels + 1 }, (_, i) => {
    const value = (maxValue / numYAxisLabels) * i;
    // Simple formatting for labels
    if (maxValue < 1) return value.toFixed(2);
    if (maxValue < 10) return value.toFixed(1);
    return Math.round(value);
  });

  const numGroups = data.labels.length;
  const numSets = data.datasets.length;
  const groupWidth = (chartWidth - yAxisWidth) / numGroups;
  const barWidth = groupWidth * 0.7 / numSets;

  return (
    <div className="p-2 md:p-4 bg-gray-50 rounded-lg mb-4 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + xAxisHeight + topPadding}`} role="img" aria-label={data.title || 'Bar chart'}>
        {data.title && (
          <text x={chartWidth / 2} y={topPadding / 2} textAnchor="middle" className="font-bold text-gray-700">
            {data.title}
          </text>
        )}

        {/* Y-axis Labels and Grid Lines */}
        <g className="text-xs text-gray-500">
          {yAxisLabels.map((label, i) => {
            const y = topPadding + chartHeight - (i * (chartHeight / numYAxisLabels));
            return (
              <g key={i}>
                <text x={yAxisWidth - 8} y={y + 4} textAnchor="end">{label}</text>
                <line x1={yAxisWidth} y1={y} x2={chartWidth} y2={y} stroke={i === 0 ? "#9ca3af" : "#e5e7eb"} />
              </g>
            );
          })}
          {data.yAxisLabel && (
             <text
                transform={`rotate(-90, 10, ${topPadding + chartHeight / 2})`}
                x="10"
                y={topPadding + chartHeight / 2}
                textAnchor="middle"
                className="text-xs font-medium text-gray-600"
            >
                {data.yAxisLabel}
            </text>
          )}
        </g>
        
        {/* Bars and X-axis Labels */}
        {data.labels.map((label, groupIndex) => {
          const groupX = yAxisWidth + groupIndex * groupWidth;
          return (
            <g key={label}>
              {data.datasets.map((dataset, setIndex) => {
                const value = dataset.data[groupIndex];
                if (value === undefined || value === null) return null;
                const barHeight = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
                const x = groupX + (groupWidth * 0.15) + (setIndex * barWidth);
                const y = topPadding + chartHeight - barHeight;
                // Fix: Handle both string and string[] for backgroundColor to ensure type safety.
                const color = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor) || '#3b82f6';
                
                return (
                  <g key={`${label}-${dataset.label}`}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="2">
                      <title>{`${dataset.label} (${label}): ${value}`}</title>
                    </rect>
                  </g>
                );
              })}
              <text x={groupX + groupWidth / 2} y={topPadding + chartHeight + 15} textAnchor="middle" className="text-xs text-gray-600 whitespace-pre-line">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      {data.datasets.length > 1 && (
         <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2">
            {data.datasets.map((dataset) => (
            <div key={dataset.label} className="flex items-center text-xs">
                {/* Fix: Handle both string and string[] for backgroundColor to ensure type safety. */}
                <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor }}></span>
                <span>{dataset.label}</span>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default BarChart;
