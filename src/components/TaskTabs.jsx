import React from 'react';

export default function TaskTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue, isAlert: counts.overdue > 0 },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-sans">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              isActive
                ? 'bg-orange text-white font-bold shadow-sm'
                : 'bg-navy-light border border-navy-light text-slate-300 hover:text-white hover:bg-navy-light/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isActive
                  ? 'bg-white/20 text-white'
                  : tab.isAlert && tab.id === 'overdue'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-navy-card border border-navy-light text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
