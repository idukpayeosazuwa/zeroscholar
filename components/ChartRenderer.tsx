import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import { ChartConfig, TableConfig } from '../types';

interface ChartRendererProps {
  config: ChartConfig | TableConfig;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#a4de6c'];

export const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  // Render Table
  if (config.type === 'table') {
    return (
      <div className="w-full overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border-2 border-gray-400 text-sm">
          <thead>
            <tr className="bg-gray-200">
              {config.headers.map((header, i) => (
                <th 
                  key={i} 
                  className="border border-gray-400 px-3 py-2 font-semibold text-gray-800 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td 
                    key={j} 
                    className="border border-gray-300 px-3 py-2 text-gray-700"
                  >
                    {cell !== null ? cell : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Prepare data for Recharts
  const chartData = config.data.labels.map((label, index) => {
    const dataPoint: any = { name: label };
    config.data.datasets.forEach(dataset => {
      dataPoint[dataset.name] = dataset.values[index];
    });
    return dataPoint;
  });

  return (
    <div className="w-full mb-4">
      {config.title && (
        <h4 className="text-center font-semibold text-gray-800 mb-3">{config.title}</h4>
      )}
      
      <ResponsiveContainer width="100%" height={320}>
        {config.type === 'bar' || config.type === 'clustered-bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name" 
              label={config.xAxisLabel ? { 
                value: config.xAxisLabel, 
                position: 'insideBottom', 
                offset: -15,
                style: { fontSize: '14px', fontWeight: 'bold' }
              } : undefined}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={config.yAxisLabel ? { 
                value: config.yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '14px', fontWeight: 'bold' }
              } : undefined}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
            />
            {config.data.datasets.length > 1 && <Legend />}
            {config.data.datasets.map((dataset, idx) => (
              <Bar 
                key={dataset.name} 
                dataKey={dataset.name} 
                fill={dataset.color || COLORS[idx % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        ) : config.type === 'pie' ? (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={config.data.datasets[0].name}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
            />
            <Legend />
          </PieChart>
        ) : config.type === 'line' ? (
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="name"
              label={config.xAxisLabel ? { 
                value: config.xAxisLabel, 
                position: 'insideBottom', 
                offset: -15,
                style: { fontSize: '14px', fontWeight: 'bold' }
              } : undefined}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={config.yAxisLabel ? { 
                value: config.yAxisLabel, 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: '14px', fontWeight: 'bold' }
              } : undefined}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }}
            />
            <Legend />
            {config.data.datasets.map((dataset, idx) => (
              <Line 
                key={dataset.name}
                type="monotone" 
                dataKey={dataset.name} 
                stroke={dataset.color || COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        ) : null}
      </ResponsiveContainer>

      {config.annotations && config.annotations.length > 0 && (
        <div className="mt-3 px-2 text-xs text-gray-600 italic space-y-1">
          {config.annotations.map((note, i) => (
            <p key={i}>* {note}</p>
          ))}
        </div>
      )}
    </div>
  );
};
