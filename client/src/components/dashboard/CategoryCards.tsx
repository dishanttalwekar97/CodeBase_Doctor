import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Layers, Package, TestTube, Container, Cloud } from 'lucide-react';
import type { Scan } from '../../types';

interface CategoryCardsProps {
  scan: Scan;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ scan }) => {
  const categories = [
    { name: 'Security', score: scan.securityScore, weight: '25%', icon: Shield, color: '#10B981' },
    { name: 'Performance', score: scan.performanceScore, weight: '15%', icon: Zap, color: '#22D3EE' },
    { name: 'Architecture', score: scan.architectureScore, weight: '15%', icon: Layers, color: '#818CF8' },
    { name: 'Dependencies', score: scan.dependencyScore, weight: '15%', icon: Package, color: '#F59E0B' },
    { name: 'Testing', score: scan.testingScore, weight: '10%', icon: TestTube, color: '#EC4899' },
    { name: 'Docker Quality', score: scan.dockerScore, weight: '10%', icon: Container, color: '#3B82F6' },
    { name: 'Cloud Readiness', score: scan.cloudScore, weight: '10%', icon: Cloud, color: '#14B8A6' }
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'Good', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (score >= 65) return { label: 'Moderate', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    if (score >= 50) return { label: 'Warning', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    return { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-wide">Category Health Audit Matrix</h3>
        <span className="text-[10px] text-gray-400 font-mono">7 Categories • Weighted Average</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const status = getScoreBadge(cat.score);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-3.5 rounded-xl border border-white/10 hover:border-indigo-500/30 transition flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{cat.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">Weight {cat.weight}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${status.bg} ${status.text} ${status.border}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-gray-400 text-[10px]">Score</span>
                  <span className="text-white font-bold">{cat.score} / 100</span>
                </div>

                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
