import React from 'react';
import { Search, Tag, AlertTriangle, X } from 'lucide-react';

export default function TaskFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
  onResetFilters,
}) {
  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'All' || selectedPriority !== 'All';

  return (
    <div className="bg-navy-light border border-navy-light rounded-lg p-2.5 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5 font-sans">
      <div className="relative flex-1">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="taskbloom-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks ('/' to focus)..."
          className="w-full bg-navy-card border border-navy-light rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 bg-navy-card border border-navy-light rounded-lg px-2 py-1 text-xs">
          <Tag className="w-3 h-3 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="All" className="bg-navy-card text-white">All Categories</option>
            <option value="Work" className="bg-navy-card text-white">Work</option>
            <option value="Personal" className="bg-navy-card text-white">Personal</option>
            <option value="Study" className="bg-navy-card text-white">Study</option>
            <option value="Health" className="bg-navy-card text-white">Health</option>
          </select>
        </div>

        <div className="flex items-center gap-1 bg-navy-card border border-navy-light rounded-lg px-2 py-1 text-xs">
          <AlertTriangle className="w-3 h-3 text-slate-400" />
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer pr-1"
          >
            <option value="All" className="bg-navy-card text-white">All Priorities</option>
            <option value="High" className="bg-navy-card text-white">High</option>
            <option value="Medium" className="bg-navy-card text-white">Medium</option>
            <option value="Low" className="bg-navy-card text-white">Low</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-slate-300 hover:text-rose-400 font-medium px-2 py-1 rounded bg-navy-card border border-navy-light transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}

