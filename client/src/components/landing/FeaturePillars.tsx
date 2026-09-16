import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Layers, Package, TestTube, Container, Cloud, Sparkles, CheckCircle } from 'lucide-react';

export const FeaturePillars: React.FC = () => {
  const pillars = [
    {
      title: '🔒 Security AST Scan',
      desc: 'Detects hardcoded AWS/GitHub secrets, private keys, TLS validation bypasses, SQL injections, and weak cryptographic algorithms.',
      icon: Shield,
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.15)',
      badge: 'Zero-Trust Scanner'
    },
    {
      title: '⚡ Async Performance',
      desc: 'Identifies sequential database calls inside loops (N+1 query risks), event-loop blocking synchronous I/O, and unbounded queries.',
      icon: Zap,
      color: '#22D3EE',
      glow: 'rgba(34, 211, 238, 0.15)',
      badge: 'Event Loop Analyzer'
    },
    {
      title: '🏛️ Modular Architecture',
      desc: 'Flags giant source files (>400 lines), deep cyclomatic indentation (>5 levels), and unhandled Express controller async boundaries.',
      icon: Layers,
      color: '#818CF8',
      glow: 'rgba(129, 140, 248, 0.15)',
      badge: 'Complexity AST'
    },
    {
      title: '📦 Dependency Vulnerabilities',
      desc: 'Audits missing lockfiles, wildcard unpinned dependencies (*, latest), and legacy unmaintained npm packages (request, moment).',
      icon: Package,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.15)',
      badge: 'Package Auditor'
    },
    {
      title: '🧪 Automated Test Coverage',
      desc: 'Calculates test-to-source file coverage ratios and verifies Jest, Vitest, Playwright, or Cypress runner configurations.',
      icon: TestTube,
      color: '#EC4899',
      glow: 'rgba(236, 72, 153, 0.15)',
      badge: 'Coverage Inspector'
    },
    {
      title: '🐳 Hadolint Docker Audit',
      desc: 'Enforces container least-privilege security (non-root USER directives), base image tag pinning, and Docker layer caching rules.',
      icon: Container,
      color: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.15)',
      badge: 'Dockerfile Engine'
    },
    {
      title: '☁️ Cloud Readiness & K8s',
      desc: 'Checks Kubernetes readiness/liveness probes, container CPU/Memory resource limits, hardcoded compose secrets, and health endpoints.',
      icon: Cloud,
      color: '#14B8A6',
      glow: 'rgba(20, 184, 166, 0.15)',
      badge: 'K8s Probe Checker'
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>7-Category Automated Diagnostics</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          7 Pillars of Software Health Analysis
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 font-mono max-w-2xl mx-auto">
          Comprehensive static AST analysis combined with Gemini LLM context repair engine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-panel p-7 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 relative group transition-all duration-300 shadow-xl overflow-hidden"
              style={{
                boxShadow: `0 10px 30px -15px ${pillar.glow}`
              }}
            >
              {/* Dynamic Glow Accents */}
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: pillar.color }}
              ></div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md"
                    style={{
                      backgroundColor: `${pillar.color}15`,
                      borderColor: `${pillar.color}40`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: pillar.color }} />
                  </div>
                  <span
                    className="text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider"
                    style={{
                      color: pillar.color,
                      backgroundColor: `${pillar.color}10`,
                      borderColor: `${pillar.color}30`
                    }}
                  >
                    {pillar.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 text-[11px] font-mono text-gray-500 flex items-center justify-between border-t border-white/5 relative z-10">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Continuous AST Engine
                </span>
                <span className="font-bold" style={{ color: pillar.color }}>
                  Active Rule
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

