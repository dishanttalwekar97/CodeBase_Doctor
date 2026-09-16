import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { Scan } from '../../types';

interface ScoreTrendChartProps {
  scans: Scan[];
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ scans }) => {
  const chartData = [...scans]
    .reverse()
    .map(scan => ({
      date: new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: scan.overallScore,
      security: scan.securityScore,
      performance: scan.performanceScore,
      duration: (scan.durationMs / 1000).toFixed(1)
    }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
          <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-[#0A0E14] border border-white/10 p-3 rounded-xl shadow-2xl font-mono text-xs">
                    <div className="text-gray-400 mb-1">{data.date}</div>
                    <div className="text-indigo-400 font-bold">Overall Score: {data.score}/100</div>
                    <div className="text-cyan-400">Security: {data.security}/100</div>
                    <div className="text-emerald-400">Performance: {data.performance}/100</div>
                    <div className="text-gray-500 text-[10px] mt-1">Duration: {data.duration}s</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{ fill: '#6366F1', r: 5 }}
            activeDot={{ r: 8, fill: '#22D3EE' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
