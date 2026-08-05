import React from 'react';
import { Search, Tag, Star, X } from 'lucide-react';

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
    <div className="bg-sky-light/40 border-2 border-sky-soft rounded-2xl p-3.5 space-y-2.5 font-sans shadow-xs">
      <div className="bg-sky-deep text-white rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-2">
          <Search className="w-4 h-4 text-white" />
          Filter & Organize
        </span>
        <Star className="w-4 h-4 fill-current" />
      </div>

      <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-sky-deep absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="taskbloom-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search goals ('/' to focus)..."
            className="w-full bg-paper-card border border-sky-soft rounded-xl pl-8 pr-8 py-1.5 text-xs text-ink font-semibold placeholder-ink/50 focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 bg-paper-card border border-sky-soft rounded-xl px-3 py-1 text-xs shadow-xs">
            <Tag className="w-3.5 h-3.5 text-sky-deep" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent text-xs text-sky-deep font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-paper-card border border-sky-soft rounded-xl px-3 py-1 text-xs shadow-xs">
            <Star className="w-3.5 h-3.5 text-sky-deep fill-sky-deep" />
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="bg-transparent text-xs text-sky-deep font-bold focus:outline-none cursor-pointer pr-1"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-ink hover:text-rose-600 font-bold px-2.5 py-1 rounded-xl bg-paper-card border border-sky-soft hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
