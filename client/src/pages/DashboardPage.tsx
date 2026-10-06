import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Calendar, FileText, ShieldCheck, GitBranch } from 'lucide-react';
import { useScan } from '../context/ScanContext';
import { RadialGauge } from '../components/dashboard/RadialGauge';
import { CategoryCharts } from '../components/dashboard/CategoryCharts';
import { CategoryCards } from '../components/dashboard/CategoryCards';
import { IssueList } from '../components/dashboard/IssueList';
import { CodeDiffViewer } from '../components/dashboard/CodeDiffViewer';
import { ExportReportModal } from '../components/dashboard/ExportReportModal';
import { EmbedBadgeModal } from '../components/repo/EmbedBadgeModal';
import { CIGeneratorModal } from '../components/dashboard/CIGeneratorModal';
import type { Issue } from '../types';

export const DashboardPage: React.FC = () => {
  const { selectedRepo, currentScan, triggerScan, scanning } = useScan();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isCIModalOpen, setIsCIModalOpen] = useState(false);

  if (!selectedRepo) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-20 glass-panel rounded-3xl border border-white/10 shadow-2xl">
        <h3 className="text-base font-bold text-white mb-2">No Repository Connected</h3>
        <p className="text-xs text-gray-400 font-mono mb-4">Connect a GitHub repository to generate your software health report.</p>
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto my-20 glass-panel rounded-3xl border border-indigo-500/30 shadow-2xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <ShieldAlert className="w-7 h-7 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{selectedRepo.owner}/{selectedRepo.name}</h3>
          <p className="text-xs text-gray-400 font-mono">No analysis scan recorded yet. Run a software health audit to inspect security and performance.</p>
        </div>
        <button
          onClick={() => triggerScan(selectedRepo.url, selectedRepo.id)}
          disabled={scanning}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.4)] transition"
        >
          {scanning ? 'Running Analysis...' : 'Launch First Health Audit'}
        </button>
      </div>
    );
  }

  const issues = currentScan.issues || [];
  const activeIssues = issues.filter(i => !i.isResolved);
  const criticalCount = activeIssues.filter(i => i.severity === 'CRITICAL').length;
  const importantCount = activeIssues.filter(i => i.severity === 'IMPORTANT').length;
  const improvementCount = activeIssues.filter(i => i.severity === 'IMPROVEMENT').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto relative">
      {/* Top Banner Info */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-white/10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-white tracking-tight">{selectedRepo.owner}/{selectedRepo.name}</h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
              {selectedRepo.defaultBranch}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              Scanned {new Date(currentScan.createdAt).toLocaleString()}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">Duration: <strong className="text-indigo-300 font-mono">{(currentScan.durationMs / 1000).toFixed(1)}s</strong></span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-300">Commit: <strong className="text-cyan-300 font-mono">#{currentScan.commitHash?.substring(0, 7) || 'latest'}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          {/* GitHub CI/CD Workflow Generator */}
          <button
            onClick={() => setIsCIModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition shadow-sm"
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>CI/CD Gate</span>
          </button>

          {/* GitHub README Badge Action */}
          <button
            onClick={() => setIsBadgeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>README Badge</span>
          </button>

          {/* Export Report Action */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-200 hover:bg-white/10 hover:text-white transition shadow-sm"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Export Health Report</span>
          </button>

          {/* Re-scan Action */}
          <button
            onClick={() => triggerScan()}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${scanning ? 'animate-spin' : ''}`} />
            <span>Re-scan Repo</span>
          </button>
        </div>
      </motion.div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Radial Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-4 glass-panel p-6 rounded-3xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300"
        >
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-gray-400 font-bold">Overall Software Health</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          </div>

          <div className="my-3">
            <RadialGauge score={currentScan.overallScore} size={185} />
          </div>
        </motion.div>

        {/* Category Breakdown Charts */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="md:col-span-8 glass-panel p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all duration-300"
        >
          <CategoryCharts scan={currentScan} />
        </motion.div>
      </div>

      {/* Category Cards Matrix Grid */}
      <CategoryCards scan={currentScan} />

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all"
        >
          <div className="text-[10px] uppercase font-mono text-gray-400 font-bold tracking-wider mb-1">Active Issues</div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">{activeIssues.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-950/20 hover:border-red-500/50 transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]"
        >
          <div className="text-[10px] uppercase font-mono text-red-400 font-bold tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Critical Flaws
          </div>
          <div className="text-3xl font-black font-mono text-red-400 tracking-tight">{criticalCount}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 hover:border-amber-500/50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.1)]"
        >
          <div className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider mb-1">Important Fixes</div>
          <div className="text-3xl font-black font-mono text-amber-400 tracking-tight">{importantCount}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-4 rounded-2xl border border-yellow-500/30 bg-yellow-950/20 hover:border-yellow-500/50 transition-all shadow-[0_0_20px_rgba(234,179,8,0.1)]"
        >
          <div className="text-[10px] uppercase font-mono text-yellow-300 font-bold tracking-wider mb-1">Improvements</div>
          <div className="text-3xl font-black font-mono text-yellow-300 tracking-tight">{improvementCount}</div>
        </motion.div>
      </div>

      {/* Main Prioritized Issue List with Search & Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-indigo-500/30 transition-all duration-300 min-h-[400px]"
      >
        <IssueList issues={issues} onSelectIssue={(issue) => setSelectedIssue(issue)} />
      </motion.div>

      {/* Code Diff Viewer Modal */}
      <CodeDiffViewer issue={selectedIssue} onClose={() => setSelectedIssue(null)} />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scanId={currentScan.id}
        repoName={`${selectedRepo.owner}/${selectedRepo.name}`}
      />

      {/* Embed Badge Modal */}
      <EmbedBadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        owner={selectedRepo.owner}
        name={selectedRepo.name}
      />

      {/* CI/CD Generator Modal */}
      <CIGeneratorModal
        isOpen={isCIModalOpen}
        onClose={() => setIsCIModalOpen(false)}
        repoName={`${selectedRepo.owner}/${selectedRepo.name}`}
      />
    </div>
  );
};
