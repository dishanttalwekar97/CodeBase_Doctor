import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, Calendar, ChevronRight, FolderGit2, CheckCircle2 } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { scanService } from '../services/api';
import type { Scan } from '../types';
import { ScoreTrendChart } from '../components/history/ScoreTrendChart';

export const HistoryPage: React.FC = () => {
  const { repos, selectedRepo, selectRepo, loadScanDetails } = useScan();
  const [historyScans, setHistoryScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRepo) {
      setLoading(true);
      scanService.getRepoScans(selectedRepo.id)
        .then(scans => setHistoryScans(scans))
        .catch(err => console.error('Failed to load repo scan history:', err))
        .finally(() => setLoading(false));
    }
  }, [selectedRepo]);

  if (!selectedRepo) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-20 glass-panel rounded-2xl">
        <h3 className="text-base font-bold text-white mb-2">No Repository Selected</h3>
        <p className="text-xs text-gray-400 font-mono">Connect or select a repository to view scan trends over time.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Software Health History & Score Trends</h2>
            <p className="text-xs text-gray-400 font-mono">Tracking codebase quality trajectory for {selectedRepo.owner}/{selectedRepo.name}</p>
          </div>
        </div>

        {/* Repo Selector */}
        <select
          value={selectedRepo.id}
          onChange={(e) => {
            const repo = repos.find(r => r.id === e.target.value);
            if (repo) selectRepo(repo);
          }}
          className="bg-[#0A0E14] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
        >
          {repos.map(r => (
            <option key={r.id} value={r.id}>
              {r.owner}/{r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Score Trend Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Health Score Trajectory
          </h3>
          <span className="text-[10px] text-gray-400 font-mono">Score Scale 0-100</span>
        </div>

        {historyScans.length > 0 ? (
          <ScoreTrendChart scans={historyScans} />
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-mono">
            No historical scans recorded for this repository.
          </div>
        )}
      </motion.div>

      {/* Historical Scans Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4"
      >
        <h3 className="text-sm font-semibold text-white tracking-wide">Historical Scan Records</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-[10px] uppercase tracking-wider">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Health Score</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Commit</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {historyScans.map((scan, idx) => {
                const prevScan = historyScans[idx + 1];
                const scoreDelta = prevScan ? scan.overallScore - prevScan.overallScore : null;

                return (
                  <tr key={scan.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-medium">{new Date(scan.createdAt).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-500">{new Date(scan.createdAt).toLocaleTimeString()}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{scan.overallScore}</span>
                        {scoreDelta !== null && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              scoreDelta > 0
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : scoreDelta < 0
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {(scan.durationMs / 1000).toFixed(1)}s
                    </td>

                    <td className="py-3.5 px-4 text-indigo-300 font-mono">
                      #{scan.commitHash?.substring(0, 7) || 'latest'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => loadScanDetails(scan.id)}
                        className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition text-xs font-mono"
                      >
                        Inspect Dashboard
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
