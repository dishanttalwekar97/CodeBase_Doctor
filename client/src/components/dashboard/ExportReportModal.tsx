import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, FileCode, Printer } from 'lucide-react';
import { scanService } from '../../services/api';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanId: string;
  repoName: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  scanId,
  repoName
}) => {
  const handleDownload = (format: 'markdown' | 'json') => {
    scanService.downloadReport(scanId, format);
    onClose();
  };

  const handleOpenExecutiveReport = () => {
    scanService.openExecutiveReport(scanId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="export-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="export-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Export Health Audit Report</h3>
                  <p className="text-xs text-gray-400 font-mono">{repoName}</p>
                </div>
              </div>

              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                Export executive software maintenance reports containing overall health score breakdowns, categorized flaws, and AI-generated repair diffs.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleOpenExecutiveReport}
                  className="w-full p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between text-left border border-emerald-500/30 group transition shadow-glow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">Executive PDF / Printable Report</div>
                      <div className="text-xs text-emerald-400/80 font-mono">Styled Executive view ready to print or save as PDF</div>
                    </div>
                  </div>

                  <Printer className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => handleDownload('markdown')}
                  className="w-full p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between text-left border border-white/10 group transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition">Markdown Report (.md)</div>
                      <div className="text-xs text-gray-400 font-mono">Formatted for GitHub PRs, docs, & Notion</div>
                    </div>
                  </div>

                  <Download className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => handleDownload('json')}
                  className="w-full p-4 rounded-xl glass-panel glass-panel-hover flex items-center justify-between text-left border border-white/10 group transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition">Raw JSON Audit Export (.json)</div>
                      <div className="text-xs text-gray-400 font-mono">Full structured data dump for CI/CD pipelines</div>
                    </div>
                  </div>

                  <Download className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

