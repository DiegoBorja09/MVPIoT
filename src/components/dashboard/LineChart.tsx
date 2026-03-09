'use client';

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DataPoint {
  timestamp: string;
  value: number;
  raw: string;
}

interface LineChartProps {
  readonly data: DataPoint[];
  readonly unit?: string;
}

export default function LineChart({ data, unit = '' }: LineChartProps) {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const formattedData = sortedData.map(d => ({
    ...d,
    time: new Date(d.timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  if (formattedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsLineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="time" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          label={{ value: unit, angle: -90, position: 'insideLeft' }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, 'Value']}
          labelFormatter={(label) => `Fecha y hora: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={false}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
