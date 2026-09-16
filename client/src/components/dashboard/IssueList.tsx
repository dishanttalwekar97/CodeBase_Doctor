import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, FileCode, ArrowRight, Filter, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { Issue, Severity, Category } from '../../types';

interface IssueListProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
}

export const IssueList: React.FC<IssueListProps> = ({ issues, onSelectIssue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter issues based on search, category, and severity
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (selectedCategory !== 'ALL' && issue.category !== selectedCategory) return false;
      if (selectedSeverity !== 'ALL' && issue.severity !== selectedSeverity) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title.toLowerCase().includes(q);
        const matchFile = issue.filePath.toLowerCase().includes(q);
        const matchRule = issue.ruleId?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchFile && !matchRule) return false;
      }

      return true;
    });
  }, [issues, selectedCategory, selectedSeverity, searchQuery]);

  // Reset pagination when filters change
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const paginatedIssues = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, pageIndex, pageSize]);

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            Critical
          </span>
        );
      case 'IMPORTANT':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Important
          </span>
        );
      case 'IMPROVEMENT':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 text-xs font-mono font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            Improvement
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues by file, title, or rule ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0A0E14] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value as any); setCurrentPage(1); }}
            className="bg-[#0A0E14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">🔒 Security</option>
            <option value="PERFORMANCE">⚡ Performance</option>
            <option value="ARCHITECTURE">🏛️ Architecture</option>
            <option value="DEPENDENCIES">📦 Dependencies</option>
            <option value="TESTING">🧪 Testing</option>
            <option value="DOCKER">🐳 Docker</option>
            <option value="CLOUD">☁️ Cloud</option>
          </select>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => { setSelectedSeverity('ALL'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedSeverity === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setSelectedSeverity('CRITICAL'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedSeverity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/40' : 'text-gray-400 hover:text-red-400'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => { setSelectedSeverity('IMPORTANT'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedSeverity === 'IMPORTANT' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            Important
          </button>
          <button
            onClick={() => { setSelectedSeverity('IMPROVEMENT'); setCurrentPage(1); }}
            className={`px-2.5 py-1 rounded-lg transition ${
              selectedSeverity === 'IMPROVEMENT' ? 'bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/40' : 'text-gray-400 hover:text-yellow-300'
            }`}
          >
            Improvement
          </button>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3 flex-1">
        {paginatedIssues.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-mono text-xs glass-panel rounded-xl">
            No issues found matching search and severity filters.
          </div>
        ) : (
          paginatedIssues.map(issue => (
            <motion.div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.005 }}
              className={`glass-panel glass-panel-hover p-4 rounded-xl cursor-pointer transition border flex flex-col md:flex-row md:items-center justify-between gap-3 group ${
                issue.isResolved ? 'border-emerald-500/30 opacity-70 bg-emerald-950/10' : 'border-white/10'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getSeverityBadge(issue.severity)}
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-indigo-300 border border-white/10">
                    {issue.category}
                  </span>
                  <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-gray-500" />
                    {issue.filePath}:{issue.lineNumber || 1}
                  </span>
                  {issue.isResolved && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      RESOLVED
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                  {issue.title}
                </h4>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {issue.aiExplanation}
                </p>
              </div>

              {/* View Fix Action Trigger */}
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-medium group-hover:translate-x-1 transition flex-shrink-0 self-end md:self-center">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{issue.isResolved ? 'View Fix Details' : 'View AI Fix'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-mono text-gray-400">
        <div>
          Showing {filteredIssues.length === 0 ? 0 : (pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, filteredIssues.length)} of {filteredIssues.length} issues
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-500">Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-[#0A0E14] border border-white/10 rounded-lg px-2 py-1 text-xs text-white"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={pageIndex === 1}
              className={`p-1.5 rounded-lg border border-white/10 ${
                pageIndex === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 text-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-white">
              {pageIndex} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={pageIndex === totalPages}
              className={`p-1.5 rounded-lg border border-white/10 ${
                pageIndex === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 text-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
