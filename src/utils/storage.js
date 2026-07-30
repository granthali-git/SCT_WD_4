const STORAGE_KEY = 'taskbloom_tasks';

/**
 * Retrieve tasks array from localStorage safely.
 * Returns null if key does not exist or if corrupted.
 */
export function getTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to read tasks from localStorage:', error);
    return null;
  }
}

/**
 * Persist tasks array to localStorage.
 */
export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks to localStorage:', error);
  }
}
