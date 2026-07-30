const STREAK_KEY = 'taskbloom_streak';

/**
 * Retrieve current streak info from localStorage.
 */
export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) {
      // Default initial streak for demoing the feature on first load
      const defaultStreak = { count: 3, lastCompletedDate: '' };
      localStorage.setItem(STREAK_KEY, JSON.stringify(defaultStreak));
      return defaultStreak;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.count === 'number' ? parsed : { count: 0, lastCompletedDate: '' };
  } catch (error) {
    return { count: 0, lastCompletedDate: '' };
  }
}

/**
 * Calculate and update streak based on today's tasks completion status.
 */
export function checkAndUpdateStreak(todayTasks) {
  const currentStreak = getStreak();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.completed).length;

  let newCount = currentStreak.count;
  let newLastDate = currentStreak.lastCompletedDate;

  // Reset streak if last completed date is older than yesterday and today is not completed yet
  if (
    currentStreak.lastCompletedDate &&
    currentStreak.lastCompletedDate !== todayStr &&
    currentStreak.lastCompletedDate !== yesterdayStr &&
    !(totalToday > 0 && completedToday === totalToday)
  ) {
    newCount = 0;
    newLastDate = '';
  }

  // Credit new streak day if all today's tasks are completed
  if (totalToday > 0 && completedToday === totalToday) {
    if (currentStreak.lastCompletedDate === yesterdayStr) {
      newCount = currentStreak.count + 1;
      newLastDate = todayStr;
    } else if (currentStreak.lastCompletedDate !== todayStr) {
      newCount = Math.max(currentStreak.count, 1);
      newLastDate = todayStr;
    }
  }

  const updated = { count: newCount, lastCompletedDate: newLastDate };
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update streak:', e);
  }

  return updated;
}
