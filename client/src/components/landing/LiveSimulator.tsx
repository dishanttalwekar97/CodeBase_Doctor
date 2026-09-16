import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Terminal, Sparkles, FolderGit2, ArrowRight, Play, CheckCircle2, Shield, Cpu, Activity } from 'lucide-react';
import { useScan } from '../../context/ScanContext';

export const LiveSimulator: React.FC = () => {
  const navigate = useNavigate();
  const { connectNewRepo, triggerScan } = useScan();
  const [url, setUrl] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'logs'>('audit');

  // Simulated live scanner log lines
  const [logIndex, setLogIndex] = useState(0);
  const simulatedLogs = [
    { type: 'info', text: '⚡ Initializing AST Sandbox Container [node:20-alpine]...' },
    { type: 'info', text: '📦 Fetching repository tree git HEAD ref...' },
    { type: 'success', text: '✅ Parsed 42 AST nodes in 12.4ms (Babel / TypeScript Parser)' },
    { type: 'warn', text: '⚠️ [Security] Hardcoded API token pattern detected in src/config.ts:14' },
    { type: 'warn', text: '⚠️ [Async Perf] Sequential await in Array.forEach() inside server/db.ts:89' },
    { type: 'info', text: '🤖 Dispatching Gemini AI LLM patch generator (gemini-3.6-flash)...' },
    { type: 'success', text: '✨ Synthesized 2 automated git diff repairs & health score: 84/100' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % simulatedLogs.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const sampleRepos = [
    { name: 'expressjs/express', url: 'https://github.com/expressjs/express' },
    { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js' },
    { name: 'facebook/react', url: 'https://github.com/facebook/react' }
  ];

  const handleSimulate = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setSimulating(true);
    try {
      const repo = await connectNewRepo(targetUrl);
      if (repo) {
        await triggerScan(repo.url, repo.id);
        navigate('/dashboard');
      }
    } catch {
      navigate('/dashboard');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8 relative overflow-hidden bg-gradient-to-b from-[#0D1117] to-[#0A0E14]">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-3 relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Live Interactive Sandbox
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Test Codebase Doctor on Any Repository
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-mono">
            Paste any public GitHub repository URL below to execute an instant multi-category scan with AI patch synthesis.
          </p>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSimulate(url); }}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto relative z-10"
        >
          <div className="relative flex-1">
            <FolderGit2 className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0A0E14] border border-white/15 rounded-2xl pl-12 pr-4 py-3.5 text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={simulating || !url.trim()}
            className={`px-7 py-3.5 rounded-2xl text-xs font-bold text-white shadow-glow transition-all flex items-center justify-center gap-2 ${
              simulating || !url.trim()
                ? 'bg-indigo-600/50 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:scale-95 shadow-indigo-500/25'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${simulating ? 'animate-spin' : ''}`} />
            <span>{simulating ? 'Analyzing Tree...' : 'Run Instant Audit'}</span>
          </button>
        </form>

        {/* Quick Sample Selector */}
        <div className="pt-2 text-center space-y-3 relative z-10">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            Or test with one of these popular open-source projects:
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {sampleRepos.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulate(sample.url)}
                disabled={simulating}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/40 text-xs font-mono text-indigo-300 transition flex items-center gap-2 group shadow-sm"
              >
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sample.name}</span>
                <ArrowRight className="w-3 h-3 text-gray-500 group-hover:translate-x-1 text-cyan-400 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Terminal Live Scan Mockup */}
        <div className="relative z-10 pt-4">
          <div className="bg-[#05080C] border border-white/15 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
            {/* Terminal Window Topbar */}
            <div className="bg-[#0D1117] px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="text-gray-400 text-[11px] ml-2 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  codebase-doctor-cli v2.4.0 — AST Terminal Output
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  <Activity className="w-3 h-3 animate-pulse" /> Live Stream
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-5 space-y-2 text-gray-300 min-h-[160px] flex flex-col justify-center">
              {simulatedLogs.slice(0, logIndex + 1).map((log, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-2 text-[11px] sm:text-xs"
                >
                  <span className="text-gray-600 select-none">[{new Date().toLocaleTimeString()}]</span>
                  <span
                    className={
                      log.type === 'warn'
                        ? 'text-amber-300'
                        : log.type === 'success'
                        ? 'text-emerald-400 font-bold'
                        : 'text-indigo-300'
                    }
                  >
                    {log.text}
                  </span>
                </motion.div>
              ))}
              <div className="flex items-center gap-1 text-indigo-400 animate-pulse pt-1 text-[11px]">
                <span>&gt;</span>
                <span className="w-2 h-4 bg-indigo-500 inline-block"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

