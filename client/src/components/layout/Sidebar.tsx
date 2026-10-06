import React from 'react';
import { NavLink } from 'react-router-dom';
import { Stethoscope, LayoutDashboard, History, FolderGit2, Plus, ShieldCheck, Layers } from 'lucide-react';
import { useScan } from '../../context/ScanContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onOpenConnectModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenConnectModal }) => {
  const { repos, selectedRepo, selectRepo } = useScan();
  const { isDemo } = useAuth();

  return (
    <aside className="w-64 bg-[#0B0F17]/90 backdrop-blur-xl border-r border-white/10 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              Codebase <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-mono">Doctor</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase">AI Maintenance</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="px-3 py-4 space-y-1">
        <div className="text-[10px] uppercase font-mono font-semibold text-gray-400 px-3 mb-2 tracking-wider">
          Platform
        </div>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600/25 to-indigo-600/5 text-indigo-200 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full shadow-[0_0_8px_#6366f1]"></span>
              )}
              <LayoutDashboard className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-purple-600/25 to-purple-600/5 text-purple-200 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-500 rounded-r-full shadow-[0_0_8px_#a855f7]"></span>
              )}
              <Layers className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
              <span>Multi-Repo Compare</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-cyan-600/25 to-cyan-600/5 text-cyan-200 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#22d3ee]"></span>
              )}
              <History className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
              <span>Scan History</span>
            </>
          )}
        </NavLink>
      </div>

      {/* Connected Repositories Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-white/5">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] uppercase font-mono font-semibold text-gray-400 tracking-wider flex items-center gap-1.5">
            Connected Repos
            <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[10px]">{repos.length}</span>
          </span>
          <button
            onClick={onOpenConnectModal}
            className="p-1 hover:bg-indigo-500/20 rounded-md text-indigo-400 hover:text-indigo-300 transition"
            title="Connect Repository"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {repos.map(repo => {
            const isSelected = selectedRepo?.id === repo.id;
            const lastScore = repo.scans?.[0]?.overallScore;

            return (
              <button
                key={repo.id}
                onClick={() => selectRepo(repo)}
                title={`${repo.owner}/${repo.name}`}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 group ${
                  isSelected
                    ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FolderGit2 className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isSelected ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                  <span className="truncate font-mono">{repo.owner}/{repo.name}</span>
                </div>

                {lastScore !== undefined && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold flex-shrink-0 border ${
                      lastScore >= 80
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : lastScore >= 60
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {lastScore}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Badge */}
      <div className="p-3 border-t border-white/10 bg-[#07090E]">
        <div className="p-2.5 rounded-xl glass-panel flex items-center gap-2.5 border border-white/10">
          <div className="relative flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
          </div>
          <div className="text-xs">
            <div className="text-white font-medium text-[11px] flex items-center gap-1">
              Static + AI Engine
            </div>
            <div className="text-gray-400 text-[10px] font-mono">
              {!isDemo ? '🚀 Production Real Mode' : '🧪 Demo Mode (Active)'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
