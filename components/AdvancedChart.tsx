'use client';

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: {
    month: string;
    year2020: number;
    year2021: number;
    year2022: number;
  }[];
  isDarkMode: boolean;
}

export default function AdvancedChart({ data, isDarkMode }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        {/* ✅ Gradient background */}
        <defs>
          <linearGradient id="color2020" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="color2021" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="color2022" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* ✅ Grid + Axis */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
        />
        <XAxis
          dataKey="month"
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
        />
        <YAxis
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
        />

        {/* ✅ Tooltip + Legend */}
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />

        {/* ✅ พื้นที่ (Area) */}
        <Area
          type="monotone"
          dataKey="year2020"
          stroke="#22d3ee"
          fillOpacity={1}
          fill="url(#color2020)"
          name="2020"
        />
        <Area
          type="monotone"
          dataKey="year2021"
          stroke="#f472b6"
          fillOpacity={1}
          fill="url(#color2021)"
          name="2021"
        />
        <Area
          type="monotone"
          dataKey="year2022"
          stroke="#60a5fa"
          fillOpacity={1}
          fill="url(#color2022)"
          name="2022"
        />

        {/* ✅ เส้น (Line) ซ้อนทับบนพื้นที่ */}
        <Line type="monotone" dataKey="year2020" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="year2021" stroke="#ec4899" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="year2022" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
