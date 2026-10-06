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
    { category: 'Security', score: scan.securityScore, weight: '25%', gradId: 'gradSec' },
    { category: 'Performance', score: scan.performanceScore, weight: '15%', gradId: 'gradPerf' },
    { category: 'Architecture', score: scan.architectureScore, weight: '15%', gradId: 'gradArch' },
    { category: 'Dependencies', score: scan.dependencyScore, weight: '15%', gradId: 'gradDep' },
    { category: 'Testing', score: scan.testingScore, weight: '10%', gradId: 'gradTest' },
    { category: 'Docker', score: scan.dockerScore, weight: '10%', gradId: 'gradDock' },
    { category: 'Cloud', score: scan.cloudScore, weight: '10%', gradId: 'gradCloud' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide">Category Health Audit Breakdown</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">7 Categories</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono tracking-wider">Weighted Matrix</span>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="gradSec" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <linearGradient id="gradPerf" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
              <linearGradient id="gradArch" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
              <linearGradient id="gradDep" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="gradTest" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>
              <linearGradient id="gradDock" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="gradCloud" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#2DD4BF" />
              </linearGradient>
            </defs>

            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fill: '#E5E7EB', fontSize: 12, fontWeight: 500, fontFamily: 'Inter' }}
              width={95}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0B0F17]/95 border border-white/15 backdrop-blur-xl p-3 rounded-xl shadow-2xl font-mono text-xs">
                      <div className="text-white font-bold flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        {d.category}
                      </div>
                      <div className="text-indigo-300 font-semibold">Health Score: {d.score} / 100</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">Weighted Contribution: {d.weight}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${entry.gradId})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
