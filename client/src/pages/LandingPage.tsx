import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ArrowRight, ShieldCheck, Sparkles, Cpu, GitPullRequest, Code2, CheckCircle } from 'lucide-react';
import { Hero3D } from '../components/landing/Hero3D';
import { LiveSimulator } from '../components/landing/LiveSimulator';
import { FeaturePillars } from '../components/landing/FeaturePillars';
import { ParticleCanvas3D } from '../components/landing/ParticleCanvas3D';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E14] text-gray-200 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* 3D Dynamic Background Canvas */}
      <ParticleCanvas3D />

      {/* Landing Topbar */}
      <header className="h-20 border-b border-white/10 bg-[#0D1117]/80 backdrop-blur-xl px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-400 to-cyan-400 p-0.5 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0D1117] rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight leading-none flex items-center gap-1.5">
              Codebase <span className="text-indigo-400 font-mono">Doctor</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              AI Software Maintenance
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition active:scale-95 hover:shadow-indigo-500/25"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Landing Page Sections */}
      <main className="relative z-10">
        <Hero3D />
        <LiveSimulator />
        <FeaturePillars />

        {/* How It Works Section */}
        <section className="py-24 px-6 max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Autonomous Workflow Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Codebase Doctor Audits & Heals
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-xl mx-auto">
              Automated 3-step continuous software health pipeline powered by static AST parsing & Gemini AI LLM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10 space-y-4 relative group hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-lg shadow-glow group-hover:scale-110 transition-transform">
                01
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" />
                  Connect Repository
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Paste any public GitHub URL or authenticate with 1-click GitHub OAuth to analyze private repositories securely.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-indigo-300/80 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero configuration required</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10 space-y-4 relative group hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-mono font-bold text-lg shadow-glow group-hover:scale-110 transition-transform">
                02
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  7-Engine AST Audit
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Server clones tree into isolated temporary sandboxes and runs 7 specialized static AST analyzer rules concurrently.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-cyan-300/80 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sub-second static analysis</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel glass-panel-hover p-8 rounded-3xl border border-white/10 space-y-4 relative group hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-lg shadow-glow group-hover:scale-110 transition-transform">
                03
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitPullRequest className="w-5 h-5 text-emerald-400" />
                  LLM Repair & PR Creation
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Gemini LLM synthesizes fixes into clean git diff patches and creates automated GitHub Pull Requests with 1 click.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-300/80 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated PR resolution</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Footer Banner */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 via-[#0D1117] to-cyan-950/30 space-y-8 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none"></div>
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none"></div>

            <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-semibold border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ready to Elevate Your Code Quality?
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Transform Technical Debt into Production Resilience
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-mono leading-relaxed pt-2">
                Run your first automated software health scan in seconds with zero configuration required.
              </p>
            </div>

            <div className="pt-2 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-glow hover:shadow-indigo-500/30 transition-all active:scale-95 inline-flex items-center justify-center gap-2 group/btn"
              >
                <Stethoscope className="w-5 h-5 text-cyan-200 group-hover/btn:rotate-12 transition-transform" />
                <span>Launch Codebase Doctor Platform</span>
                <ArrowRight className="w-4 h-4 text-white group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center text-xs font-mono text-gray-500 relative z-10 bg-[#0A0E14]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-indigo-400" />
            <span className="text-gray-400 font-bold">Codebase Doctor AI</span>
            <span>— 2026 Production Edition</span>
          </div>
          <p className="text-gray-500">Continuous static analysis & LLM automated software maintenance.</p>
        </div>
      </footer>
    </div>
  );
};

