import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Layers, Package, TestTube, Container, Cloud } from 'lucide-react';
import type { Scan } from '../../types';

interface CategoryCardsProps {
  scan: Scan;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ scan }) => {
  const categories = [
    { name: 'Security', score: scan.securityScore, weight: '25%', icon: Shield, color: '#10B981', gradient: 'from-emerald-500 to-teal-400' },
    { name: 'Performance', score: scan.performanceScore, weight: '15%', icon: Zap, color: '#22D3EE', gradient: 'from-cyan-500 to-blue-400' },
    { name: 'Architecture', score: scan.architectureScore, weight: '15%', icon: Layers, color: '#818CF8', gradient: 'from-indigo-500 to-purple-400' },
    { name: 'Dependencies', score: scan.dependencyScore, weight: '15%', icon: Package, color: '#F59E0B', gradient: 'from-amber-500 to-yellow-400' },
    { name: 'Testing', score: scan.testingScore, weight: '10%', icon: TestTube, color: '#EC4899', gradient: 'from-pink-500 to-rose-400' },
    { name: 'Docker Quality', score: scan.dockerScore, weight: '10%', icon: Container, color: '#3B82F6', gradient: 'from-blue-500 to-cyan-400' },
    { name: 'Cloud Readiness', score: scan.cloudScore, weight: '10%', icon: Cloud, color: '#14B8A6', gradient: 'from-teal-500 to-emerald-400' }
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
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          Category Health Audit Matrix
        </h3>
        <span className="text-[10px] text-gray-400 font-mono">7 Categories • Weighted Average</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const status = getScoreBadge(cat.score);

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.2)] flex flex-col justify-between group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-2.5 rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">{cat.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">Weight {cat.weight}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold ${status.bg} ${status.text} ${status.border} shadow-sm`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-gray-400 text-[10px] font-medium">Category Score</span>
                  <span className="text-white font-extrabold">{cat.score} <span className="text-gray-500 font-normal">/ 100</span></span>
                </div>

                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${cat.gradient}`}
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
