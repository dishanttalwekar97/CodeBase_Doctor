import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, GitBranch, Sparkles, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';
import { useScan } from '../../context/ScanContext';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenConnectModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenConnectModal }) => {
  const { selectedRepo, triggerScan, scanning } = useScan();
  const { user, isDemo, logout, toggleMode } = useAuth();

  return (
    <header className="h-16 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Active Repo Indicator */}
      <div className="flex items-center gap-3">
        {selectedRepo ? (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-sm shadow-sm">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-white font-semibold">{selectedRepo.owner}/{selectedRepo.name}</span>
            <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md font-mono border border-indigo-500/30">
              {selectedRepo.defaultBranch}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            No repository selected
          </div>
        )}
      </div>

      {/* Action Controls & User Identity */}
      <div className="flex items-center gap-3">
        {/* Production Real Mode Switcher Pill */}
        <button
          onClick={toggleMode}
          title="Click to toggle between Production Real Mode and Demo Mode"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold border transition-all duration-300 ${
            !isDemo
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
          }`}
        >
          {!isDemo ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>🚀 Production Real Mode</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>🧪 Demo Mode (Click to Switch)</span>
            </>
          )}
        </button>

        {/* Connect New Repo Button */}
        <button
          onClick={onOpenConnectModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/10 hover:text-white hover:border-white/20 transition"
        >
          <Plus className="w-4 h-4 text-indigo-400" />
          <span>Connect Repo</span>
        </button>

        {/* Run Scan Action Button */}
        <button
          onClick={() => triggerScan()}
          disabled={scanning || !selectedRepo}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-300 ${
            scanning || !selectedRepo
              ? 'bg-indigo-600/50 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Analyzing Repo...' : 'Run Software Scan'}</span>
        </button>

        {/* User Identity Profile / GitHub Login */}
        <div className="pl-3 border-l border-white/10 flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <img
                src={user.avatarUrl || 'https://github.com/github.png'}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover shadow-sm"
              />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">{user.name || user.username}</div>
                <div className="text-[10px] text-indigo-300 font-mono">@{user.username}</div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#24292e] hover:bg-[#2f363d] text-white text-xs font-semibold border border-white/10 hover:border-white/20 transition shadow-sm"
            >
              <UserIcon className="w-4 h-4" />
              <span>Login with GitHub</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
