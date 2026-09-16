import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { Scan } from '../../types';

interface CategoryChartsProps {
  scan: Scan;
}

export const CategoryCharts: React.FC<CategoryChartsProps> = ({ scan }) => {
  const data = [
    { category: 'Security', score: scan.securityScore, weight: '25%' },
    { category: 'Performance', score: scan.performanceScore, weight: '15%' },
    { category: 'Architecture', score: scan.architectureScore, weight: '15%' },
    { category: 'Dependencies', score: scan.dependencyScore, weight: '15%' },
    { category: 'Testing', score: scan.testingScore, weight: '10%' },
    { category: 'Docker', score: scan.dockerScore, weight: '10%' },
    { category: 'Cloud', score: scan.cloudScore, weight: '10%' }
  ];

  const getBarColor = (score: number) => {
    if (score >= 80) return '#22D3EE'; // Cyan
    if (score >= 65) return '#818CF8'; // Indigo
    if (score >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white tracking-wide">Category Health Scores</h3>
        <span className="text-[10px] text-gray-400 font-mono">Weighted Total Matrix</span>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
            <YAxis type="category" dataKey="category" tick={{ fill: '#E5E7EB', fontSize: 12, fontFamily: 'JetBrains Mono' }} width={90} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0A0E14] border border-white/10 p-2.5 rounded-lg shadow-xl font-mono text-xs">
                      <div className="text-white font-bold">{d.category}</div>
                      <div className="text-indigo-400">Score: {d.score}/100</div>
                      <div className="text-gray-400 text-[10px]">Weight: {d.weight}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
