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
    <aside className="w-64 bg-[#0D1117] border-r border-white/10 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-glow">
            <div className="w-full h-full bg-[#0D1117] rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              Codebase <span className="text-indigo-400 font-mono">Doctor</span>
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
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 text-indigo-400" />
          Dashboard
        </NavLink>

        <NavLink
          to="/compare"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Layers className="w-4 h-4 text-purple-400" />
          Multi-Repo Compare
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <History className="w-4 h-4 text-cyan-400" />
          Scan History
        </NavLink>
      </div>

      {/* Connected Repositories Section */}
      <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-white/5">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[10px] uppercase font-mono font-semibold text-gray-400 tracking-wider">
            Connected Repos ({repos.length})
          </span>
          <button
            onClick={onOpenConnectModal}
            className="p-1 hover:bg-white/10 rounded text-indigo-400 hover:text-white transition"
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
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between gap-2 group ${
                  isSelected
                    ? 'bg-white/10 text-white font-medium border border-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FolderGit2 className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-500'}`} />
                  <span className="truncate font-mono">{repo.owner}/{repo.name}</span>
                </div>

                {lastScore !== undefined && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                      lastScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : lastScore >= 60
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-amber-500/20 text-amber-400'
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
      <div className="p-3 border-t border-white/10 bg-[#0A0E14]">
        <div className="p-2.5 rounded-lg glass-panel flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <div className="text-white font-medium text-[11px] flex items-center gap-1">
              Static + AI Engine <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-gray-400 text-[10px]">
              {!isDemo ? '🚀 Production Real Mode' : '🧪 Demo Mode (Active)'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
