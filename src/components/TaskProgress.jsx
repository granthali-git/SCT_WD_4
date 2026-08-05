import React from 'react';
import { CheckCircle2, Sparkles, TrendingUp, Star } from 'lucide-react';

export default function TaskProgress({ todayTasks, totalTasksCount, streakCount = 0 }) {
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const isAllTodayDone = totalToday > 0 && completedToday === totalToday;
  const percentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  if (totalTasksCount === 0) {
    return null;
  }

  return (
    <div className="bg-sky-light/40 border-2 border-sky-soft rounded-2xl p-4 space-y-3 transition-all font-sans shadow-xs">
      <div className="bg-sky-deep text-white rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-white" />
          Daily Progress & Streak
        </span>
        <Star className="w-4 h-4 fill-current" />
      </div>

      {isAllTodayDone ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-sky-light border-2 border-sky-soft rounded-xl p-3.5 transition-all">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-sky-deep flex-shrink-0" />
            <div>
              <h3 className="font-fredoka font-bold text-sky-deep text-xs sm:text-sm">
                All daily goals accomplished!
              </h3>
              <p className="text-[11px] text-ink/80 mt-0.5 font-semibold">
                Finished all {totalToday} {totalToday === 1 ? 'task' : 'tasks'} scheduled for today. ✨
              </p>
            </div>
          </div>

          {streakCount >= 2 && (
            <div className="flex-shrink-0 bg-sky-soft text-sky-deep rounded-full px-3.5 py-1 text-xs font-bold flex items-center gap-1.5 border border-sky-soft shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-deep" />
              <span>{streakCount} day streak</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs gap-2 flex-wrap font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-deep text-xs">
                Today's Completion
              </span>
              {streakCount >= 2 && (
                <span className="bg-sky-soft text-sky-deep border border-sky-soft text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3 text-sky-deep" />
                  <span>{streakCount}d streak</span>
                </span>
              )}
            </div>

            <span className="text-ink/80 text-xs font-medium">
              {totalToday > 0 ? (
                <>
                  <strong className="text-sky-deep font-bold">{completedToday}</strong> /{' '}
                  <strong className="text-sky-deep font-bold">{totalToday}</strong> done ({percentage}%)
                </>
              ) : (
                'No goals scheduled for today'
              )}
            </span>
          </div>

          <div className="w-full bg-sky-light border border-sky-soft rounded-full h-3 overflow-hidden">
            <div
              className="bg-sky-deep h-full rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${totalToday > 0 ? percentage : 0}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
