import React, { useState, useEffect } from 'react';
import {
  Settings,
  BarChart3,
  Sparkles,
  Star,
  BookOpen,
  Pencil,
  Coffee,
  Cloud,
  AlarmClock,
  Smile,
} from 'lucide-react';
import AddTask from './components/AddTask';
import TaskList from './components/TaskList';
import TaskTabs from './components/TaskTabs';
import TaskProgress from './components/TaskProgress';
import TaskFilterBar from './components/TaskFilterBar';
import ShortcutsModal from './components/ShortcutsModal';
import { getTasks, saveTasks } from './utils/storage';
import { checkAndUpdateStreak, getStreak } from './utils/streak';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getNextDueDate(dueDateStr, repeat) {
  let baseDate = new Date();
  if (dueDateStr) {
    const parsed = new Date(dueDateStr);
    if (!isNaN(parsed.getTime())) {
      baseDate = parsed;
    }
  }

  const nextDate = new Date(baseDate);

  if (repeat === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (repeat === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (repeat === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  const hours = String(nextDate.getHours()).padStart(2, '0');
  const minutes = String(nextDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Generate relative dates for realistic mock initial tasks
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
yesterday.setHours(14, 0, 0, 0);

const todayLater = new Date(now);
todayLater.setHours(18, 30, 0, 0);

const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
tomorrow.setHours(10, 0, 0, 0);

const INITIAL_TASKS = [
  {
    id: '1',
    title: 'Complete chapter review & planner notes',
    category: 'Study',
    priority: 'High',
    dueDate: yesterday.toISOString().slice(0, 16),
    repeat: 'none',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: '1-1', text: 'Read Biology chapter 4 summary', done: true },
      { id: '1-2', text: 'Highlight key diagrams & terms', done: true },
      { id: '1-3', text: 'Draft flashcards for review', done: false },
    ],
  },
  {
    id: '2',
    title: 'Water indoor plants & study space desk',
    category: 'Personal',
    priority: 'Medium',
    dueDate: todayLater.toISOString().slice(0, 16),
    repeat: 'daily',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: '2-1', text: 'Desk succulent & window ivy', done: true },
      { id: '2-2', text: 'Organize pastel pens', done: false },
    ],
  },
  {
    id: '3',
    title: 'Design student planner UI mockups',
    category: 'Work',
    priority: 'High',
    dueDate: tomorrow.toISOString().slice(0, 16),
    repeat: 'weekly',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: '4',
    title: 'Set up daily goal tracker notebook',
    category: 'Health',
    priority: 'Low',
    dueDate: '',
    repeat: 'none',
    completed: true,
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
];

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = getTasks();
    return saved !== null ? saved : INITIAL_TASKS;
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [streak, setStreak] = useState(() => getStreak());
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isTyping =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable);

      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isTyping) {
          activeElement.blur();
        }
        return;
      }

      if (isTyping) return;

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('taskbloom-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        const addTaskInput = document.getElementById('taskbloom-add-task-input');
        if (addTaskInput) {
          addTaskInput.focus();
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isShortcutsModalOpen]);

  // Date Boundaries
  const curr = new Date();
  const todayStart = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
  const todayEnd = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate(), 23, 59, 59, 999);

  // Tab counts & today's tasks computation
  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && isSameDay(d, curr);
  });

  // Persist tasks and check streak whenever task list changes
  useEffect(() => {
    saveTasks(tasks);
    const updatedStreak = checkAndUpdateStreak(todayTasks);
    setStreak(updatedStreak);
  }, [tasks]);

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleToggleCompleted = (id) => {
    setTasks((prevTasks) => {
      const targetTask = prevTasks.find((t) => t.id === id);
      if (!targetTask) return prevTasks;

      const isMarkingComplete = !targetTask.completed;
      const isRecurring = targetTask.repeat && targetTask.repeat !== 'none';

      const updatedTasks = prevTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      if (isMarkingComplete && isRecurring) {
        const nextDueDate = getNextDueDate(targetTask.dueDate, targetTask.repeat);
        const nextTask = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 7),
          title: targetTask.title,
          category: targetTask.category,
          priority: targetTask.priority,
          dueDate: nextDueDate,
          repeat: targetTask.repeat,
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: (targetTask.subtasks || []).map((sub) => ({ ...sub, done: false })),
        };
        return [nextTask, ...updatedTasks];
      }

      return updatedTasks;
    });
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((sub) =>
          sub.id === subtaskId ? { ...sub, done: !sub.done } : sub
        );
        return { ...t, subtasks: updatedSubtasks };
      })
    );
  };

  const handleDeleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id));
  };

  const handleEditTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleReorderTasks = (reorderedFilteredList) => {
    setTasks((prevTasks) => {
      const reorderedIds = new Set(reorderedFilteredList.map((t) => t.id));
      const indices = [];
      prevTasks.forEach((t, index) => {
        if (reorderedIds.has(t.id)) {
          indices.push(index);
        }
      });

      const nextTasks = [...prevTasks];
      indices.forEach((posIndex, i) => {
        nextTasks[posIndex] = reorderedFilteredList[i];
      });

      return nextTasks;
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPriority('All');
  };

  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && d < todayStart;
  });

  const upcomingTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && d > todayEnd;
  });

  const tabCounts = {
    all: tasks.length,
    today: todayTasks.length,
    upcoming: upcomingTasks.length,
    overdue: overdueTasks.length,
  };

  // Combined Filtering: Tab + Search + Category + Priority
  const filteredTasks = tasks.filter((t) => {
    // 1. Date Tab Filter
    if (activeTab === 'today') {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime()) || !isSameDay(d, curr)) return false;
    } else if (activeTab === 'upcoming') {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime()) || d <= todayEnd) return false;
    } else if (activeTab === 'overdue') {
      if (!t.dueDate || t.completed) return false;
      const d = new Date(t.dueDate);
      if (isNaN(d.getTime()) || d >= todayStart) return false;
    }

    // 2. Search Keyword Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (!t.title.toLowerCase().includes(q)) return false;
    }

    // 3. Category Filter
    if (selectedCategory !== 'All') {
      if (t.category !== selectedCategory) return false;
    }

    // 4. Priority Filter
    if (selectedPriority !== 'All') {
      if (t.priority !== selectedPriority) return false;
    }

    return true;
  });

  const [headerTab, setHeaderTab] = useState('tasks');
  const greeting = getGreeting();

  const totalPending = tasks.filter((t) => !t.completed).length;
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalOverdue = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && d < todayStart;
  }).length;

  const todayPendingCount = todayTasks.filter((t) => !t.completed).length;
  const todayOverdueCount = todayTasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && d < todayStart;
  }).length;

  return (
    <div className="min-h-screen bg-paper printable-paper-pattern text-ink text-xs sm:text-sm flex flex-col items-center relative overflow-x-hidden pb-12 transition-all">
      {/* DECORATIVE PLANNER DOODLES / ICONS ON LEFT AND RIGHT SIDES */}
      <BookOpen className="fixed top-28 left-4 sm:left-12 w-10 h-10 text-sky-deep/30 z-0 pointer-events-none transform -rotate-12 hidden md:block" />
      <Coffee className="fixed top-[360px] left-6 sm:left-14 w-10 h-10 text-sky-deep/30 z-0 pointer-events-none transform rotate-6 hidden md:block" />
      <Pencil className="fixed bottom-24 left-5 sm:left-16 w-10 h-10 text-sky-deep/30 z-0 pointer-events-none transform -rotate-45 hidden md:block" />
      <Cloud className="fixed top-32 right-4 sm:right-12 w-11 h-11 text-sky-deep/30 z-0 pointer-events-none transform rotate-12 hidden md:block" />
      <AlarmClock className="fixed top-[380px] right-6 sm:right-14 w-10 h-10 text-sky-deep/30 z-0 pointer-events-none transform -rotate-6 hidden md:block" />
      <Star className="fixed bottom-28 right-5 sm:right-16 w-10 h-10 text-sky-deep/30 fill-sky-deep/20 z-0 pointer-events-none transform rotate-45 hidden md:block" />

      {/* 1. STICKY HEADER BAR */}
      <header className="sticky top-0 z-40 w-full bg-sky-light/95 backdrop-blur-md border-b-2 border-sky-soft px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Top-Left Rotated Sticky Note */}
          <div className="hidden sm:block bg-sky-light text-sky-deep border-2 border-sky-soft rounded-xl px-3 py-2 text-xs font-bold transform -rotate-2 shadow-xs select-none">
            Small steps every day lead to big results ✨
          </div>

          {/* Centered App Title & Subtitle Badge */}
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-deep" />
              <h1 className="font-fredoka font-bold text-2xl sm:text-3xl text-sky-deep tracking-wider uppercase leading-none drop-shadow-xs">
                STUDENT TO DO LIST
              </h1>
              <Star className="w-5 h-5 text-sky-deep fill-sky-deep" />
            </div>
            <div className="mt-1.5">
              <span className="bg-sky-soft text-sky-deep border-2 border-sky-soft rounded-full px-4 py-1 text-xs italic font-bold inline-block shadow-xs">
                Plan today, achieve tomorrow ♡
              </span>
            </div>
          </div>

          {/* Top-Right Rotated Sticky Note */}
          <div className="hidden sm:block bg-sky-light text-sky-deep border-2 border-sky-soft rounded-xl px-3 py-2 text-xs font-bold transform rotate-2 shadow-xs select-none">
            Focus · Plan · Work · Stay consistent · Succeed 🌟
          </div>
        </div>

        {/* Navigation & Stat Row */}
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 mt-2.5 pt-2.5 border-t-2 border-sky-soft">
          {/* Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-sky-light p-1 rounded-xl border-2 border-sky-soft shadow-xs">
            <button
              type="button"
              onClick={() => setHeaderTab('tasks')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                headerTab === 'tasks'
                  ? 'bg-sky-deep text-white border-2 border-sky-deep shadow-xs font-sans'
                  : 'text-sky-deep hover:bg-sky-soft font-sans'
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => setHeaderTab('analytics')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                headerTab === 'analytics'
                  ? 'bg-sky-deep text-white border-2 border-sky-deep shadow-xs font-sans'
                  : 'text-sky-deep hover:bg-sky-soft font-sans'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Stat Badges & Settings */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 font-sans text-xs bg-paper-card border-2 border-sky-soft px-3 py-1 rounded-full shadow-xs">
              <span className="bg-sky-light text-sky-deep border border-sky-soft px-2.5 py-0.5 rounded-full font-bold">{totalPending} pending</span>
              <div className="border-r-2 border-sky-soft h-3.5 mx-0.5" />
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">{totalCompleted} completed</span>
              <div className="border-r-2 border-sky-soft h-3.5 mx-0.5" />
              <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 rounded-full font-bold">{totalOverdue} overdue</span>
            </div>

            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-2 text-sky-deep bg-sky-light hover:bg-sky-deep hover:text-white rounded-xl transition-all border-2 border-sky-soft cursor-pointer shadow-xs"
              title="Settings & Shortcuts (?)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-2xl px-3 sm:px-6 pt-6 sm:pt-8 space-y-5 z-10">
        {/* 2. GREETING SECTION */}
        <section className="space-y-1 text-left px-1">
          <h2 className="font-fredoka font-bold text-2xl sm:text-3xl text-sky-deep tracking-tight">
            {greeting.text} {greeting.emoji}
          </h2>
          <p className="text-ink/80 text-xs sm:text-sm font-sans font-medium">
            You have <span className="text-sky-deep font-bold">{todayPendingCount} tasks pending today</span> ({todayOverdueCount} overdue).
          </p>
        </section>

        {/* 3. MAIN CARD */}
        <div className="bg-paper-card border-2 border-sky-soft shadow-md shadow-sky-deep/15 rounded-2xl p-4 sm:p-6 space-y-5 animate-page-fade-in relative z-10">
          {headerTab === 'analytics' ? (
            /* Analytics View */
            <div className="space-y-4 font-sans text-ink">
              <div className="flex items-center justify-between border-b-2 border-sky-soft pb-3">
                <h3 className="font-fredoka font-bold text-lg text-sky-deep flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sky-deep" />
                  Productivity & Goal Analytics
                </h3>
                <span className="text-xs text-sky-deep font-bold">Real-time metrics</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-sky-light/60 p-3.5 rounded-xl border-2 border-sky-soft text-center shadow-xs">
                  <p className="text-xs text-ink/70 font-medium">Total Pending</p>
                  <p className="text-xl font-bold text-sky-deep mt-1">{totalPending}</p>
                </div>
                <div className="bg-sky-light/60 p-3.5 rounded-xl border-2 border-sky-soft text-center shadow-xs">
                  <p className="text-xs text-ink/70 font-medium">Total Completed</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{totalCompleted}</p>
                </div>
                <div className="bg-sky-light/60 p-3.5 rounded-xl border-2 border-sky-soft text-center shadow-xs">
                  <p className="text-xs text-ink/70 font-medium">Overdue Rate</p>
                  <p className="text-xl font-bold text-rose-600 mt-1">
                    {tasks.length > 0 ? Math.round((totalOverdue / tasks.length) * 100) : 0}%
                  </p>
                </div>
              </div>

              <TaskProgress
                todayTasks={todayTasks}
                totalTasksCount={tasks.length}
                streakCount={streak.count}
              />
            </div>
          ) : (
            /* Tasks View */
            <>
              {/* Progress Bar & Status Section */}
              <TaskProgress
                todayTasks={todayTasks}
                totalTasksCount={tasks.length}
                streakCount={streak.count}
              />

              {/* Add Task Form Component */}
              <AddTask onAddTask={handleAddTask} />

              {/* Search, Filters & Smart Date Tabs */}
              <section className="space-y-3 pt-1">
                <TaskFilterBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedPriority={selectedPriority}
                  onPriorityChange={setSelectedPriority}
                  onResetFilters={handleResetFilters}
                />

                <TaskTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  counts={tabCounts}
                />

                <TaskList
                  tasks={filteredTasks}
                  totalTasksCount={tasks.length}
                  onToggleCompleted={handleToggleCompleted}
                  onToggleSubtask={handleToggleSubtask}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={handleEditTask}
                  onReorderTasks={handleReorderTasks}
                />
              </section>
            </>
          )}
        </div>
      </main>

      {/* FOOTER BADGE */}
      <footer className="mt-8 text-center space-y-2 z-10">
        <div className="inline-block bg-sky-deep text-white border-2 border-sky-deep rounded-full px-6 py-2 font-bold shadow-md">
          KEEP GROWING 🌸
        </div>
        <p className="text-xs italic text-ink/70 font-medium">
          Every small task completed brings you closer to your big goals.
        </p>
      </footer>

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
