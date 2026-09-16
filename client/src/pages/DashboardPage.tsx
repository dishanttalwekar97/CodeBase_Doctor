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
      <div className="p-8 text-center max-w-md mx-auto my-20 glass-panel rounded-2xl">
        <h3 className="text-base font-bold text-white mb-2">No Repository Connected</h3>
        <p className="text-xs text-gray-400 font-mono mb-4">Connect a GitHub repository to generate your software health report.</p>
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto my-20 glass-panel rounded-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{selectedRepo.owner}/{selectedRepo.name}</h3>
          <p className="text-xs text-gray-400 font-mono">No analysis scan recorded yet. Run a software health audit to inspect security and performance.</p>
        </div>
        <button
          onClick={() => triggerScan(selectedRepo.url, selectedRepo.id)}
          disabled={scanning}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow transition"
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white tracking-tight">{selectedRepo.owner}/{selectedRepo.name}</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedRepo.defaultBranch}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-500" /> Scanned {new Date(currentScan.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>Duration: {(currentScan.durationMs / 1000).toFixed(1)}s</span>
            <span>•</span>
            <span className="text-gray-300">Commit: #{currentScan.commitHash?.substring(0, 7) || 'latest'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* GitHub CI/CD Workflow Generator */}
          <button
            onClick={() => setIsCIModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>CI/CD Gate</span>
          </button>

          {/* GitHub README Badge Action */}
          <button
            onClick={() => setIsBadgeModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-emerald-400 hover:bg-white/10 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>README Badge</span>
          </button>

          {/* Export Report Action */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white transition"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Export Health Report</span>
          </button>

          {/* Re-scan Action */}
          <button
            onClick={() => triggerScan()}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${scanning ? 'animate-spin' : ''}`} />
            <span>Re-scan Repo</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Radial Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-4 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-4 left-4 text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold">
            Overall Health Score
          </div>
          <div className="my-4">
            <RadialGauge score={currentScan.overallScore} size={180} />
          </div>
        </motion.div>

        {/* Category Breakdown Charts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-8 glass-panel p-6 rounded-2xl border border-white/10"
        >
          <CategoryCharts scan={currentScan} />
        </motion.div>
      </div>

      {/* Category Cards Matrix Grid */}
      <CategoryCards scan={currentScan} />

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="text-[10px] uppercase font-mono text-gray-400 font-semibold mb-1">Active Issues</div>
          <div className="text-2xl font-bold font-mono text-white">{activeIssues.length}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-red-500/20 bg-red-950/10">
          <div className="text-[10px] uppercase font-mono text-red-400 font-semibold mb-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Critical Flaws
          </div>
          <div className="text-2xl font-bold font-mono text-red-400">{criticalCount}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
          <div className="text-[10px] uppercase font-mono text-amber-400 font-semibold mb-1">Important Fixes</div>
          <div className="text-2xl font-bold font-mono text-amber-400">{importantCount}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-yellow-500/20 bg-yellow-950/10">
          <div className="text-[10px] uppercase font-mono text-yellow-300 font-semibold mb-1">Improvements</div>
          <div className="text-2xl font-bold font-mono text-yellow-300">{improvementCount}</div>
        </div>
      </div>

      {/* Main Prioritized Issue List with Search & Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6 rounded-2xl border border-white/10 min-h-[400px]"
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
