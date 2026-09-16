import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TestTube, Copy, Check, Download, Sparkles } from 'lucide-react';

interface UnitTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  testData: {
    testCode: string;
    fileName: string;
    filePath: string;
  } | null;
}

export const UnitTestModal: React.FC<UnitTestModalProps> = ({ isOpen, onClose, testData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!testData) return;
    navigator.clipboard.writeText(testData.testCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!testData) return;
    const blob = new Blob([testData.testCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = testData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && testData && (
        <motion.div
          key="unit-test-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            key="unit-test-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <TestTube className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>AI Unit Test Suite</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Vitest
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    Target file: <span className="text-gray-200">{testData.filePath}</span>
                  </p>
                </div>
              </div>

              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Code Viewer Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#0A0E14] space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span>{testData.fileName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-glow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-[#0D1117] border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed selection:bg-indigo-500/30">
                <code>{testData.testCode}</code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

