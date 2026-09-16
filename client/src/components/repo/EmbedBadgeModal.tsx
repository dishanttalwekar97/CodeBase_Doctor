import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ShieldCheck, Code2 } from 'lucide-react';

interface EmbedBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  owner: string;
  name: string;
}

export const EmbedBadgeModal: React.FC<EmbedBadgeModalProps> = ({ isOpen, onClose, owner, name }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const badgeUrl = `http://localhost:5000/api/repos/badge/${owner}/${name}.svg`;
  const markdownSnippet = `[![Codebase Doctor Score](${badgeUrl})](http://localhost:5173)`;
  const htmlSnippet = `<a href="http://localhost:5173"><img src="${badgeUrl}" alt="Codebase Doctor Score"/></a>`;

  const copyToClipboard = (text: string, type: 'md' | 'html') => {
    navigator.clipboard.writeText(text);
    if (type === 'md') {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } else {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">GitHub README Health Badge</h3>
                <p className="text-xs text-gray-400 font-mono">{owner}/{name}</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Live Badge Preview */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 text-center space-y-2">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Live SVG Badge Preview</span>
              <div className="flex justify-center py-2">
                <img src={badgeUrl} alt="Badge Preview" className="h-7" />
              </div>
            </div>

            {/* Markdown Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                  Markdown (for README.md)
                </label>
                <button
                  onClick={() => copyToClipboard(markdownSnippet, 'md')}
                  className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300"
                >
                  {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMd ? 'Copied Markdown!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0A0E14] border border-white/10 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                {markdownSnippet}
              </pre>
            </div>

            {/* HTML Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-gray-300 uppercase tracking-wider">
                  HTML Embed Snippet
                </label>
                <button
                  onClick={() => copyToClipboard(htmlSnippet, 'html')}
                  className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'Copied HTML!' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#0A0E14] border border-white/10 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                {htmlSnippet}
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
