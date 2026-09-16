import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Sparkles, ArrowRight, ShieldCheck, Zap, GitBranch, Play, CheckCircle2, Lock, Cpu, Server } from 'lucide-react';
import { RadialGauge } from '../dashboard/RadialGauge';
import { useScan } from '../../context/ScanContext';

export const Hero3D: React.FC = () => {
  const navigate = useNavigate();
  const { connectNewRepo, triggerScan } = useScan();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.getBoundingClientRect();
    const centerX = card.left + card.width / 2;
    const centerY = card.top + card.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rY = (mouseX / (card.width / 2)) * 14;
    const rX = (-mouseY / (card.height / 2)) * 14;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleQuickAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      navigate('/dashboard');
      return;
    }
    setAnalyzing(true);
    try {
      const repo = await connectNewRepo(url.trim());
      if (repo) {
        await triggerScan(repo.url, repo.id);
      }
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="relative pt-20 pb-16 px-6 overflow-hidden min-h-[92vh] flex flex-col items-center justify-center">
      {/* Ambient 3D Glowing Mesh Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-cyan-400/25 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 rounded-full blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center space-y-8 z-10">
        {/* Top Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-glow"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Next-Gen Autonomous AI Software Health & Repair Engine</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase border border-indigo-500/40">v2.0</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08]"
        >
          Diagnose & Repair Your Codebase with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            AI Doctor Precision
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto font-sans leading-relaxed"
        >
          Connect any GitHub repository to receive automated static AST diagnostics across 7 quality pillars, instant LLM-generated code repair diffs, and 1-click Pull Request deployment.
        </motion.p>

        {/* Instant GitHub Audit Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleQuickAnalyze}
          className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3 p-2 rounded-2xl glass-panel border border-indigo-500/30 bg-[#0D1117]/90 shadow-2xl"
        >
          <div className="relative flex-1 w-full">
            <GitBranch className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing Repo...' : 'Audit Repository'}</span>
          </button>
        </motion.form>

        {/* Stat Counter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2"
        >
          <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-center">
            <div className="text-xl font-extrabold text-white font-mono">1,240+</div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">Codebases Audited</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-center">
            <div className="text-xl font-extrabold text-emerald-400 font-mono">99.4%</div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">Flaw Detection Rate</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-center">
            <div className="text-xl font-extrabold text-cyan-400 font-mono">&lt;0.4s</div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">Static AST Latency</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-white/10 text-center">
            <div className="text-xl font-extrabold text-indigo-400 font-mono">1-Click</div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">GitHub PR Fixes</div>
          </div>
        </motion.div>

        {/* Interactive 3D Gyro Tilt Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-6 relative"
          style={{ perspective: 1000 }}
        >
          {/* Floating 3D Badges around the preview card */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden lg:flex absolute -top-2 left-6 z-20 items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-2xl"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>🔒 0 Secret Leaks Detected</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden lg:flex absolute -bottom-4 right-6 z-20 items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-2xl"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>⚡ O(1) Batch Queries Refactored</span>
          </motion.div>

          {/* Interactive Card */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: 'transform 0.1s ease-out',
              transformStyle: 'preserve-3d'
            }}
            className="max-w-4xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 hover:border-cyan-400/50 shadow-[0_0_50px_rgba(99,102,241,0.25)] relative group cursor-pointer transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            {/* Gloss Reflection Overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-xs text-gray-300 font-semibold ml-2">expressjs/express (main)</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Live 3D Audit Active
              </div>
            </div>

            {/* 3D Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <RadialGauge score={88} size={180} />
              </div>

              <div className="md:col-span-7 space-y-3 text-left">
                <div className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Automated Diagnostics Matrix</span>
                  <span className="text-[10px] text-gray-500 font-mono">Real Time</span>
                </div>

                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-indigo-500/30 transition">
                    <span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-emerald-400" /> 🔒 Security AST Scan</span>
                    <span className="text-emerald-400 font-bold">92 / 100</span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-500/30 transition">
                    <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-cyan-400" /> ⚡ Async Performance Engine</span>
                    <span className="text-cyan-400 font-bold">88 / 100</span>
                  </div>

                  <div className="flex justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 transition">
                    <span className="flex items-center gap-2"><Cpu className="w-3.5 h-3.5 text-purple-400" /> 🏛️ Architectural Coupling</span>
                    <span className="text-purple-300 font-bold">85 / 100</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>2 Active Flaws Identified</span>
                  <span className="text-indigo-400 group-hover:translate-x-1.5 transition flex items-center gap-1 font-bold">
                    Launch Interactive Dashboard ↗
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
