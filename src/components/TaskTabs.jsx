import React from 'react';

export default function TaskTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue, isAlert: counts.overdue > 0 },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 font-sans">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              isActive
                ? 'bg-sky-deep text-white shadow-xs font-bold'
                : 'bg-sky-light text-sky-deep border border-sky-soft hover:bg-sky-soft/60 font-bold'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                isActive
                  ? 'bg-paper-card text-sky-deep'
                  : tab.isAlert && tab.id === 'overdue'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-paper-card border border-sky-soft text-sky-deep'
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
