import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderGit2, Link as LinkIcon, Sparkles, ArrowRight, Lock, Globe, Star, RefreshCw } from 'lucide-react';
import { useScan } from '../../context/ScanContext';
import { useAuth } from '../../context/AuthContext';
import { repoService } from '../../services/api';

interface ConnectRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GitHubUserRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  htmlUrl: string;
  description: string;
  isPrivate: boolean;
  stars: number;
  language: string;
}

export const ConnectRepoModal: React.FC<ConnectRepoModalProps> = ({ isOpen, onClose }) => {
  const { connectNewRepo, triggerScan } = useScan();
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRepos, setUserRepos] = useState<GitHubUserRepo[]>([]);
  const [fetchingUserRepos, setFetchingUserRepos] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setFetchingUserRepos(true);
      repoService.getUserGitHubRepos()
        .then(data => setUserRepos(data))
        .catch(err => console.error('Failed to load user repos:', err))
        .finally(() => setFetchingUserRepos(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const sampleRepos = [
    { name: 'expressjs/express', url: 'https://github.com/expressjs/express', desc: 'Fast, unopinionated Node.js web framework' },
    { name: 'vercel/next.js', url: 'https://github.com/vercel/next.js', desc: 'The React Framework for the Web' },
    { name: 'facebook/react', url: 'https://github.com/facebook/react', desc: 'Library for web user interfaces' }
  ];

  const handleSubmit = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const repo = await connectNewRepo(targetUrl.trim());
      onClose();
      setUrl('');
      if (repo) {
        await triggerScan(repo.url, repo.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to connect repository');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 bg-[#161B26] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Connect GitHub Repository</h3>
                <p className="text-xs text-gray-400">Select from your GitHub account or paste a repository URL</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Direct URL Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(url); }} className="space-y-3">
              <label className="text-xs font-mono text-gray-300 uppercase tracking-wider block">
                Repository URL
              </label>

              <div className="relative">
                <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://github.com/owner/repository"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className={`w-full py-3 rounded-xl text-xs font-semibold text-white shadow-glow transition flex items-center justify-center gap-2 ${
                  loading || !url.trim()
                    ? 'bg-indigo-600/50 cursor-not-allowed opacity-70'
                    : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? 'Connecting Repo...' : 'Connect & Launch Health Audit'}</span>
              </button>
            </form>

            {/* Authenticated GitHub Account Repositories Section */}
            {user && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <img src={user.avatarUrl || 'https://github.com/github.png'} alt={user.username} className="w-4 h-4 rounded-full" />
                    <span>Your GitHub Repositories (@{user.username})</span>
                  </span>
                  {fetchingUserRepos && (
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  )}
                </div>

                {fetchingUserRepos ? (
                  <div className="p-4 text-center text-xs font-mono text-gray-500 bg-white/5 rounded-xl border border-white/5">
                    Fetching your GitHub repositories...
                  </div>
                ) : userRepos.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {userRepos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleSubmit(repo.htmlUrl)}
                        disabled={loading}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs transition group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="font-mono text-white font-semibold flex items-center gap-2 truncate">
                            {repo.isPrivate ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            )}
                            <span className="truncate">{repo.fullName}</span>
                          </div>
                          {repo.description && (
                            <p className="text-gray-400 text-[11px] truncate mt-0.5">{repo.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono mt-1">
                            {repo.language && <span className="text-indigo-300">{repo.language}</span>}
                            {repo.stars > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-400/80">
                                <Star className="w-3 h-3 fill-current" /> {repo.stars}
                              </span>
                            )}
                            <span>{repo.isPrivate ? 'Private' : 'Public'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-indigo-400 font-mono text-[11px] group-hover:translate-x-1 transition flex-shrink-0">
                          <span>Connect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs font-mono text-gray-500 bg-white/5 rounded-xl border border-white/5">
                    No repositories found in your GitHub account.
                  </div>
                )}
              </div>
            )}

            {/* Quick Sample Repos */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                Or pick a public sample repository:
              </span>

              <div className="space-y-2">
                {sampleRepos.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(sample.url)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-xl glass-panel glass-panel-hover flex items-center justify-between text-xs transition group border border-white/10"
                  >
                    <div>
                      <div className="font-mono text-white font-semibold flex items-center gap-1.5">
                        <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                        {sample.name}
                      </div>
                      <div className="text-gray-400 text-[11px] mt-0.5">{sample.desc}</div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
