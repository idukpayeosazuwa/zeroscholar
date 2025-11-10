import React from 'react';
import { GraphData } from '../../types';

interface QuizBarChartProps {
  data: GraphData;
}

const QuizBarChart: React.FC<QuizBarChartProps> = ({ data }) => {
  if (data.type !== 'bar') return null;

  const topPadding = 30; // Space for title and labels on top of bars
  const chartHeight = 220;
  const chartWidth = 450;
  const yAxisWidth = 40;
  const xAxisHeight = 40;

  const allDataPoints = data.datasets.flatMap(ds => ds.data);
  const maxValue = allDataPoints.length > 0 ? Math.max(0, ...allDataPoints) * 1.1 : 0; // Add 10% padding
  const minValue = allDataPoints.length > 0 ? Math.min(0, ...allDataPoints) : 0;
  const range = maxValue - minValue;

  const zeroY = range === 0 ? chartHeight : chartHeight - ((-minValue / range) * chartHeight);

  const numYAxisLabels = 5;
  const yAxisLabels = Array.from({ length: numYAxisLabels + 1 }, (_, i) => {
    const value = minValue + (range / numYAxisLabels) * i;
    if (range === 0) return 0;
    return parseFloat(value.toPrecision(2));
  });

  const numGroups = data.labels.length;
  const numSets = data.datasets.length;
  const groupWidth = (chartWidth - yAxisWidth) / numGroups;
  const groupSpacing = groupWidth * 0.2;
  const barWidth = (groupWidth - groupSpacing) / numSets;

  return (
    <div className="p-2 md:p-4 bg-gray-50 rounded-lg mb-4 w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + xAxisHeight + topPadding}`} role="img" aria-label={data.title || 'Bar chart'}>
        {data.title && (
          <text x={(chartWidth + yAxisWidth) / 2} y={topPadding / 2 + 5} textAnchor="middle" className="font-bold text-gray-700">
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
                <line x1={yAxisWidth} y1={y} x2={chartWidth} y2={y} stroke={"#e5e7eb"} />
              </g>
            );
          })}
           <line x1={yAxisWidth} y1={topPadding + zeroY} x2={chartWidth} y2={topPadding + zeroY} stroke={"#9ca3af"} />
          {data.yAxisLabel && (
             <text
                transform={`rotate(-90, 10, ${topPadding + chartHeight/2})`}
                x="10"
                y={topPadding + chartHeight/2}
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

                const barHeight = range > 0 ? (Math.abs(value) / range) * chartHeight : 0;
                const x = groupX + (groupSpacing / 2) + (setIndex * barWidth);
                const barYPos = value >= 0 ? zeroY - barHeight : zeroY;
                const y = topPadding + barYPos;
                // Fix: Handle both string and string[] for backgroundColor to ensure type safety.
                const color = (Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor) || '#3b82f6';
                
                return (
                  <g key={`${label}-${dataset.label}`}>
                    <rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx="1">
                      <title>{`${dataset.label} (${label}): ${value}`}</title>
                    </rect>
                    <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="text-[9px] font-semibold fill-gray-600">
                        {value}
                    </text>
                  </g>
                );
              })}
              <text x={groupX + groupWidth / 2} y={topPadding + chartHeight + 20} textAnchor="middle" className="text-xs text-gray-600 whitespace-pre-wrap">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.datasets.map((dataset) => (
          <div key={dataset.label} className="flex items-center text-xs">
            {/* Fix: Handle both string and string[] for backgroundColor to ensure type safety. */}
            <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor[0] : dataset.backgroundColor }}></span>
            <span>{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizBarChart;
