import React from 'react';
import { CheckCircle2, Flame } from 'lucide-react';

export default function TaskProgress({ todayTasks, totalTasksCount, streakCount = 0 }) {
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const isAllTodayDone = totalToday > 0 && completedToday === totalToday;
  const percentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (totalTasksCount === 0) {
    return null;
  }

  return (
    <div className="bg-navy-light border border-navy-light rounded-lg p-3.5 space-y-2.5 transition-all font-mono">
      {isAllTodayDone ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 transition-all">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white text-xs sm:text-sm">
                All daily tasks completed
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Finished all {totalToday} {totalToday === 1 ? 'task' : 'tasks'} scheduled for today.
              </p>
            </div>
          </div>

          {streakCount >= 2 && (
            <div className="flex-shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{streakCount} day streak</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs gap-2 flex-wrap font-mono">
            <div className="flex items-center gap-2">
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px]">
                Daily Progress
              </span>
              {streakCount >= 2 && (
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{streakCount}d streak</span>
                </span>
              )}
            </div>

            <span className="text-slate-400 text-xs">
              {totalToday > 0 ? (
                <>
                  <strong className="text-white">{completedToday}</strong> /{' '}
                  <strong className="text-white">{totalToday}</strong> done ({percentage}%)
                </>
              ) : (
                'No tasks scheduled for today'
              )}
            </span>
          </div>

          <div className="w-full bg-navy/60 rounded-full h-1.5 overflow-hidden border border-navy-light">
            <div
              className="bg-orange h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-orange/30"
              style={{ width: `${totalToday > 0 ? percentage : 0}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

