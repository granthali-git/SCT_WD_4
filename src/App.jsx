import React, { useState, useEffect } from 'react';
import { Zap, Settings, HelpCircle, BarChart3, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
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
    title: 'Submit quarterly budget review',
    category: 'Work',
    priority: 'High',
    dueDate: yesterday.toISOString().slice(0, 16),
    repeat: 'none',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: '1-1', text: 'Gather department expense reports', done: true },
      { id: '1-2', text: 'Compare Q2 vs Q3 variance', done: true },
      { id: '1-3', text: 'Draft summary presentation', done: false },
    ],
  },
  {
    id: '2',
    title: 'Water indoor plants & garden',
    category: 'Health',
    priority: 'Medium',
    dueDate: todayLater.toISOString().slice(0, 16),
    repeat: 'daily',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: '2-1', text: 'Living room monstera', done: true },
      { id: '2-2', text: 'Balcony herbs', done: false },
    ],
  },
  {
    id: '3',
    title: 'Design TaskFlow UI concept',
    category: 'Study',
    priority: 'High',
    dueDate: tomorrow.toISOString().slice(0, 16),
    repeat: 'weekly',
    completed: false,
    createdAt: new Date().toISOString(),
    subtasks: [],
  },
  {
    id: '4',
    title: 'Set up React + Vite project shell',
    category: 'Work',
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
    <div className="min-h-screen bg-navy text-xs sm:text-sm flex flex-col items-center transition-all pb-12">
      {/* 1. STICKY HEADER BAR */}
      <header className="sticky top-0 z-40 w-full bg-navy-card border-b border-navy-light px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Left: Icon Badge & App Title */}
          <div className="flex items-center gap-3">
            <div className="bg-orange p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-xl text-white tracking-tight leading-none">
                TaskFlow
              </h1>
              <p className="text-slate-400 text-xs mt-0.5 font-mono">Corporate Task Manager</p>
            </div>
          </div>

          {/* Center: Pill Tabs */}
          <div className="flex items-center gap-1 bg-navy-light/60 p-1 rounded-full border border-navy-light">
            <button
              type="button"
              onClick={() => setHeaderTab('tasks')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                headerTab === 'tasks'
                  ? 'bg-orange text-white shadow-sm font-sans'
                  : 'text-slate-300 hover:text-white font-mono'
              }`}
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => setHeaderTab('analytics')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                headerTab === 'analytics'
                  ? 'bg-orange text-white shadow-sm font-sans'
                  : 'text-slate-300 hover:text-white font-mono'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Right: Stat Badges & Settings */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs bg-navy/40 px-3 py-1.5 rounded-lg border border-navy-light">
              <span className="text-orange-light font-semibold">{totalPending} pending</span>
              <div className="border-r border-navy-light h-3.5 mx-0.5" />
              <span className="text-emerald-400 font-semibold">{totalCompleted} completed</span>
              <div className="border-r border-navy-light h-3.5 mx-0.5" />
              <span className="text-rose-400 font-semibold">{totalOverdue} overdue</span>
            </div>

            <button
              type="button"
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-2 text-slate-300 hover:text-white bg-navy-light/80 hover:bg-navy-light rounded-lg transition-colors border border-navy-light cursor-pointer"
              title="Settings & Shortcuts (?)"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-2xl px-3 sm:px-6 pt-6 sm:pt-8 space-y-5">
        {/* 2. GREETING SECTION */}
        <section className="space-y-1 text-left">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
            {greeting.text} {greeting.emoji}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-mono">
            You have <span className="text-orange-light font-semibold">{todayPendingCount} tasks pending today</span> ({todayOverdueCount} overdue).
          </p>
        </section>

        {/* 3. MAIN CARD */}
        <div className="bg-navy-card border border-navy-light shadow-2xl shadow-black/50 rounded-xl p-4 sm:p-6 space-y-5 animate-page-fade-in">
          {headerTab === 'analytics' ? (
            /* Analytics View */
            <div className="space-y-4 font-mono text-white">
              <div className="flex items-center justify-between border-b border-navy-light pb-3">
                <h3 className="font-sans font-bold text-lg text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange" />
                  Productivity Analytics
                </h3>
                <span className="text-xs text-slate-400">Real-time metrics</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-navy-light p-3 rounded-lg border border-navy-light text-center">
                  <p className="text-xs text-slate-400">Total Pending</p>
                  <p className="text-xl font-bold text-orange-light mt-1">{totalPending}</p>
                </div>
                <div className="bg-navy-light p-3 rounded-lg border border-navy-light text-center">
                  <p className="text-xs text-slate-400">Total Completed</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{totalCompleted}</p>
                </div>
                <div className="bg-navy-light p-3 rounded-lg border border-navy-light text-center">
                  <p className="text-xs text-slate-400">Overdue Rate</p>
                  <p className="text-xl font-bold text-rose-400 mt-1">
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
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">Filter & Organize</p>
                </div>

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

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default App;
