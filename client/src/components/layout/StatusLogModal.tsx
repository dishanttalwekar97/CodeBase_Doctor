import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';
import { useScan } from '../../context/ScanContext';

export const StatusLogModal: React.FC = () => {
  const { scanning, statusLogs, selectedRepo } = useScan();

  if (!scanning) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-[#0D1117] border border-indigo-500/30 rounded-xl shadow-glow overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-[#161B26] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Repository Software Health Audit</h3>
                <p className="text-xs text-gray-400 font-mono">Target: {selectedRepo?.owner}/{selectedRepo?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              Analysis in Progress...
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-5 font-mono text-xs text-gray-300 bg-[#0A0E14] h-72 overflow-y-auto space-y-2 border-b border-white/10">
            {statusLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 text-gray-300 leading-relaxed"
              >
                <span className="text-indigo-400 select-none">&gt;</span>
                <span className={log.includes('Success') ? 'text-emerald-400 font-semibold' : log.includes('Error') ? 'text-red-400' : ''}>
                  {log}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Footer Status Indicators */}
          <div className="px-5 py-3 bg-[#161B26] flex items-center justify-between text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-indigo-400" /> Security AST</span>
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-cyan-400" /> Performance Engine</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-400" /> LLM Fix Generator</span>
            </div>
            <span>7 Categories Scan</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
