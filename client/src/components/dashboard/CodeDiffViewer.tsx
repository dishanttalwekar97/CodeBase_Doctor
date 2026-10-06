import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, Code2, Play, CheckCircle2, TrendingUp, GitPullRequest, TestTube, FileText, Loader2 } from 'lucide-react';
import type { Issue } from '../../types';
import { scanService } from '../../services/api';
import { useScan } from '../../context/ScanContext';
import { UnitTestModal } from './UnitTestModal';

interface CodeDiffViewerProps {
  issue: Issue | null;
  onClose: () => void;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({ issue, onClose }) => {
  const { currentScan, loadScanDetails } = useScan();
  const [activeTab, setActiveTab] = useState<'diff' | 'fullFile'>('diff');
  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [creatingPR, setCreatingPR] = useState(false);
  const [prCreatedUrl, setPrCreatedUrl] = useState<string | null>(null);
  const [prError, setPrError] = useState<string | null>(null);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [testData, setTestData] = useState<{ testCode: string; fileName: string; filePath: string } | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [fixSuccess, setFixSuccess] = useState<{ scoreGain: number } | null>(null);

  // Full file state
  const [fullFileContent, setFullFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const [diffMode, setDiffMode] = useState<'split' | 'unified'>('split');

  useEffect(() => {
    setActiveTab('diff');
    setFullFileContent(null);
    setDiffMode('split');
  }, [issue?.id]);

  useEffect(() => {
    if (activeTab === 'fullFile' && !fullFileContent && currentScan && issue) {
      setLoadingFile(true);
      scanService.getFileContent(currentScan.id, issue.filePath)
        .then((res) => {
          setFullFileContent(res.content);
        })
        .catch(() => {
          setFullFileContent(`// Unable to fetch source code for ${issue.filePath}`);
        })
        .finally(() => {
          setLoadingFile(false);
        });
    }
  }, [activeTab, fullFileContent, currentScan, issue]);

  const handleCopy = () => {
    const textToCopy = activeTab === 'fullFile' && fullFileContent ? fullFileContent : issue?.afterSnippet;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyFix = async () => {
    if (!currentScan || !issue) return;
    setApplying(true);
    try {
      const res = await scanService.applyFix(currentScan.id, issue.id);
      setFixSuccess({ scoreGain: res.scoreGain });
      await loadScanDetails(currentScan.id);
    } catch (err: any) {
      console.error('Failed to apply fix:', err);
    } finally {
      setApplying(false);
    }
  };

  const handleCreatePR = async () => {
    if (!currentScan || !issue) return;
    setCreatingPR(true);
    setPrError(null);
    try {
      const res = await scanService.createFixPR(currentScan.id, issue.id);
      setPrCreatedUrl(res.prUrl);
      await loadScanDetails(currentScan.id);
    } catch (err: any) {
      console.error('Failed to create PR:', err);
      setPrError(err.response?.data?.error || err.message || 'Failed to create PR');
    } finally {
      setCreatingPR(false);
    }
  };

  const handleGenerateTest = async () => {
    if (!issue) return;
    setGeneratingTest(true);
    try {
      const data = await scanService.generateUnitTest(issue.id);
      setTestData(data);
      setIsTestModalOpen(true);
    } catch (err: any) {
      console.error('Failed to generate unit test:', err);
    } finally {
      setGeneratingTest(false);
    }
  };

  const formatDisplayFilePath = (rawPath?: string): string => {
    if (!rawPath) return 'package.json';
    const clean = rawPath.replace(/\\/g, '/').replace(/\/$/, '');
    if (!clean || clean === 'src' || clean === '.' || clean === './') {
      return 'package.json';
    }
    return clean;
  };

  return (
    <AnimatePresence>
      {issue && (
        <motion.div
          key="diff-viewer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="diff-viewer-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    {issue.category || 'ANALYSIS'}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {formatDisplayFilePath(issue.filePath)}:{issue.lineNumber || 1}
                  </span>
                  {issue.isResolved && (
                    <span className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{issue.title || 'Code Improvement'}</h3>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* View Mode Tab Bar */}
            <div className="px-6 pt-3 bg-[#111622] border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`px-4 py-2 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'diff'
                      ? 'border-indigo-500 text-indigo-300 bg-[#0D1117]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>⚡ AI Repair Patch Diff</span>
                </button>

                <button
                  onClick={() => setActiveTab('fullFile')}
                  className={`px-4 py-2 rounded-t-xl text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition ${
                    activeTab === 'fullFile'
                      ? 'border-indigo-500 text-indigo-300 bg-[#0D1117]'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>📄 Entire Source File View</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {activeTab === 'diff' && (
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs font-mono">
                    <button
                      onClick={() => setDiffMode('split')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        diffMode === 'split' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Side-by-Side
                    </button>
                    <button
                      onClick={() => setDiffMode('unified')}
                      className={`px-2.5 py-1 rounded-md transition ${
                        diffMode === 'unified' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Unified Diff
                    </button>
                  </div>
                )}

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-200 hover:bg-white/10 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  <span>{copied ? 'Copied Code!' : activeTab === 'fullFile' ? 'Copy Entire File' : 'Copy Fix Code'}</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#0A0E14]">
              {/* Success Notification Banner */}
              {fixSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center justify-between shadow-glow"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>AI Repair Patch Applied! Issue resolved successfully.</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    Score Gain: +{fixSuccess.scoreGain} pts
                  </div>
                </motion.div>
              )}

              {/* GitHub PR Created Banner */}
              {prCreatedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs flex items-center justify-between shadow-glow"
                >
                  <div className="flex items-center gap-2">
                    <GitPullRequest className="w-5 h-5 text-indigo-400" />
                    <span>GitHub Pull Request created successfully!</span>
                  </div>
                  <a
                    href={prCreatedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1"
                  >
                    <span>View PR on GitHub</span>
                    <span>↗</span>
                  </a>
                </motion.div>
              )}

              {/* GitHub PR Error Banner */}
              {prError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs flex items-center justify-between"
                >
                  <span>{prError}</span>
                </motion.div>
              )}

              {/* AI Explanation Box */}
              <div className="glass-panel p-4.5 rounded-2xl border border-indigo-500/25 bg-[#0D1220]/90 space-y-3 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Architect Explanation & Impact
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* AI Unit Test Generator Button */}
                    <button
                      onClick={handleGenerateTest}
                      disabled={generatingTest}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
                    >
                      <TestTube className={`w-3.5 h-3.5 text-emerald-400 ${generatingTest ? 'animate-spin' : ''}`} />
                      <span>{generatingTest ? 'Generating...' : '🧪 AI Unit Test'}</span>
                    </button>

                    {/* Create GitHub PR Action */}
                    <button
                      onClick={handleCreatePR}
                      disabled={creatingPR}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 transition shadow-sm"
                    >
                      <GitPullRequest className={`w-3.5 h-3.5 text-cyan-400 ${creatingPR ? 'animate-spin' : ''}`} />
                      <span>{creatingPR ? 'Creating PR...' : '🚀 Create GitHub PR'}</span>
                    </button>

                    {/* Apply AI Repair Action */}
                    {!issue.isResolved ? (
                      <button
                        onClick={handleApplyFix}
                        disabled={applying}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-white transition-all shadow-md ${
                          applying ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                        }`}
                      >
                        <Play className={`w-3 h-3 fill-current ${applying ? 'animate-spin' : ''}`} />
                        <span>{applying ? 'Applying...' : '⚡ Apply AI Repair'}</span>
                      </button>
                    ) : (
                      <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
                        Resolved
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {issue.aiExplanation || 'No AI explanation available.'}
                </p>

                {issue.impact && (
                  <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 pt-0.5">
                    <span className="font-bold">⚡ Impact:</span> {issue.impact}
                  </div>
                )}
              </div>

              {/* View Tab Switcher: Diff View vs Full File View */}
              {activeTab === 'diff' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      Code Fix Diff Suggestion
                    </h4>

                    <div className="text-[11px] font-mono flex items-center gap-3">
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Red = Original Code (-)
                      </span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Green = Proposed Fix (+)
                      </span>
                    </div>
                  </div>

                  {diffMode === 'split' ? (
                    /* Side-by-side Line-by-Line Diff */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Code (Removed Lines in RED) */}
                      <div className="rounded-2xl border border-red-500/25 bg-[#0C0E14] overflow-hidden flex flex-col shadow-md">
                        <div className="px-4 py-2.5 bg-red-950/25 border-b border-red-500/20 text-red-400 font-mono text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            Current Code Context
                          </span>
                          <span className="text-[10px] text-red-300/70 font-mono">Line {issue.lineNumber || 1}</span>
                        </div>
                        <div className="p-3 text-xs font-mono overflow-x-auto space-y-0.5 bg-[#090C12] min-h-[140px] divide-y divide-white/[0.03]">
                          {issue.beforeSnippet ? (
                            issue.beforeSnippet.split('\n').map((line, idx) => (
                              <div key={idx} className="flex items-center font-mono py-1 px-2.5 rounded bg-red-500/10 hover:bg-red-500/15 text-red-300 text-xs transition">
                                <span className="w-6 text-red-400 font-bold select-none text-xs flex-shrink-0">-</span>
                                <span className="whitespace-pre font-mono leading-relaxed overflow-x-auto">{line || ' '}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 italic p-2">// No code snippet available</div>
                          )}
                        </div>
                      </div>

                      {/* After AI Code Fix (Added Lines in GREEN) */}
                      <div className="rounded-2xl border border-emerald-500/25 bg-[#0C0E14] overflow-hidden flex flex-col shadow-md">
                        <div className="px-4 py-2.5 bg-emerald-950/25 border-b border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Proposed AI Repair
                          </span>
                          <span className="text-[10px] text-emerald-300/70 font-mono">Production Ready</span>
                        </div>
                        <div className="p-3 text-xs font-mono overflow-x-auto space-y-0.5 bg-[#090C12] min-h-[140px] divide-y divide-white/[0.03]">
                          {issue.afterSnippet ? (
                            issue.afterSnippet.split('\n').map((line, idx) => (
                              <div key={idx} className="flex items-center font-mono py-1 px-2.5 rounded bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 text-xs transition">
                                <span className="w-6 text-emerald-400 font-bold select-none text-xs flex-shrink-0">+</span>
                                <span className="whitespace-pre font-mono leading-relaxed overflow-x-auto">{line || ' '}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-500 italic p-2">// Proposed AI fix code snippet</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Unified Git Diff View */
                    <div className="rounded-2xl border border-white/10 bg-[#0C0E14] overflow-hidden font-mono text-xs shadow-xl">
                      <div className="px-4 py-2.5 bg-[#141923] border-b border-white/10 text-gray-300 text-xs font-bold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-indigo-400" />
                          Unified Patch Diff ({formatDisplayFilePath(issue.filePath)})
                        </span>
                        <div className="flex items-center gap-3 text-[10px]">
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> -{issue.beforeSnippet?.split('\n').length || 0} removed
                          </span>
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> +{issue.afterSnippet?.split('\n').length || 0} added
                          </span>
                        </div>
                      </div>

                      <div className="p-3 space-y-0.5 bg-[#090C12] overflow-x-auto">
                        <div className="text-gray-500 text-[11px] px-3 py-1 bg-white/5 rounded border border-white/5 font-mono mb-2">
                          @@ -{issue.lineNumber || 1},{issue.beforeSnippet?.split('\n').length || 1} +{issue.lineNumber || 1},{issue.afterSnippet?.split('\n').length || 1} @@ {formatDisplayFilePath(issue.filePath)}
                        </div>

                        {/* Original Removed Lines in RED */}
                        {issue.beforeSnippet?.split('\n').map((line, idx) => (
                          <div key={`rem-${idx}`} className="flex items-center font-mono py-1 px-3 rounded bg-red-500/10 hover:bg-red-500/15 text-red-300 text-xs transition">
                            <span className="w-6 text-red-400 font-bold select-none text-xs flex-shrink-0">-</span>
                            <span className="whitespace-pre font-mono leading-relaxed">{line}</span>
                          </div>
                        ))}

                        {/* Replacement Added Lines in GREEN */}
                        {issue.afterSnippet?.split('\n').map((line, idx) => (
                          <div key={`add-${idx}`} className="flex items-center font-mono py-1 px-3 rounded bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 text-xs transition">
                            <span className="w-6 text-emerald-400 font-bold select-none text-xs flex-shrink-0">+</span>
                            <span className="whitespace-pre font-mono leading-relaxed">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Entire Source File Code Viewer */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Full File Code: <span className="text-white font-bold">{formatDisplayFilePath(issue.filePath)}</span>
                    </span>
                    {issue.lineNumber && (
                      <span className="text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/30 font-bold">
                        Target Issue Line: Line {issue.lineNumber}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0D1117] overflow-hidden font-mono text-xs max-h-[500px] overflow-y-auto">
                    {loadingFile ? (
                      <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                        <span>Fetching full source code from repository...</span>
                      </div>
                    ) : fullFileContent ? (
                      <div className="divide-y divide-white/5">
                        {fullFileContent.split('\n').map((line, idx) => {
                          const currentLineNum = idx + 1;
                          const isHighlighted = issue.lineNumber && currentLineNum === issue.lineNumber;

                          return (
                            <div
                              key={idx}
                              className={`flex items-center font-mono py-1 px-3 transition ${
                                isHighlighted
                                  ? 'bg-red-500/20 border-l-4 border-red-500 text-red-200 font-bold'
                                  : 'hover:bg-white/5 text-gray-300'
                              }`}
                            >
                              <span className="w-12 text-right pr-4 text-gray-600 select-none text-[11px]">
                                {currentLineNum}
                              </span>
                              {isHighlighted && (
                                <span className="text-red-400 font-bold mr-2 select-none">-</span>
                              )}
                              <pre className="flex-1 overflow-x-auto whitespace-pre font-mono text-xs">
                                {line || ' '}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Unable to load full file code preview.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#161B26] border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>Rule ID: {issue.ruleId || 'N/A'}</span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition"
              >
                Done Reviewing
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* AI Unit Test Generator Modal */}
      <UnitTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        testData={testData}
      />
    </AnimatePresence>
  );
};


