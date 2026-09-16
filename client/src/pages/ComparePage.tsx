import React from 'react';
import { motion } from 'framer-motion';
import { Layers, ShieldAlert, Zap, FolderGit2, ArrowRight } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { RadialGauge } from '../components/dashboard/RadialGauge';

export const ComparePage: React.FC = () => {
  const { repos, selectRepo } = useScan();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Multi-Repository Comparative Analytics</h2>
            <p className="text-xs text-gray-400 font-mono">Side-by-side software health matrix across all connected organization codebases</p>
          </div>
        </div>

        <div className="text-xs font-mono text-gray-400">
          Comparing <strong className="text-white">{repos.length}</strong> Repositories
        </div>
      </div>

      {/* Repositories Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo, idx) => {
          const lastScan = repo.scans?.[0];
          const score = lastScan?.overallScore ?? 0;

          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs text-white font-bold truncate">
                    <FolderGit2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{repo.owner}/{repo.name}</span>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <RadialGauge score={score} size={150} />
                </div>

                {lastScan && (
                  <div className="space-y-2 font-mono text-xs text-gray-300 pt-2 border-t border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[11px]">Security</span>
                      <span className="text-emerald-400 font-bold">{lastScan.securityScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[11px]">Performance</span>
                      <span className="text-cyan-400 font-bold">{lastScan.performanceScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-[11px]">Docker Quality</span>
                      <span className="text-indigo-400 font-bold">{lastScan.dockerScore}/100</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => selectRepo(repo)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-white transition flex items-center justify-center gap-2 group-hover:border-indigo-500/40"
              >
                <span>Inspect Full Audit</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-1 transition" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
