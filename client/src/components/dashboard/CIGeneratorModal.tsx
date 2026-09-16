import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, GitBranch, ShieldAlert } from 'lucide-react';

interface CIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoName: string;
}

export const CIGeneratorModal: React.FC<CIGeneratorModalProps> = ({ isOpen, onClose, repoName }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const yamlSnippet = `# Codebase Doctor GitHub Actions CI/CD Quality Gate Workflow
name: Codebase Doctor Health Audit Gate

on:
  push:
    branches: [ main, master, canary ]
  pull_request:
    branches: [ main, master ]

jobs:
  software-health-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Codebase
        uses: actions/checkout@v3

      - name: Codebase Doctor Audit Scan & Quality Gate
        uses: codebase-doctor/action@v1
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          min_overall_score: 70
          fail_on_critical_flaws: true
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(yamlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">GitHub Actions CI/CD Quality Gate</h3>
                <p className="text-xs text-gray-400 font-mono">Auto-block PRs if score drops below 70</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Add this workflow file to <code className="text-indigo-300 font-mono">.github/workflows/codebase-doctor.yml</code> in your repository to automatically run Codebase Doctor health audits on every Pull Request.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  .github/workflows/codebase-doctor.yml
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Workflow YAML!' : 'Copy Workflow YAML'}</span>
                </button>
              </div>

              <pre className="p-4 bg-[#0A0E14] border border-white/10 rounded-xl text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre-wrap">
                {yamlSnippet}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
