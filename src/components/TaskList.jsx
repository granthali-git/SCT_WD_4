import React, { useState } from 'react';
import {
  Check,
  Clock,
  Pencil,
  Trash2,
  X,
  Calendar,
  Save,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Plus,
  Repeat,
  GripVertical,
  BookOpen,
  Sparkles,
} from 'lucide-react';

const PRIORITIES = [
  { name: 'Low', badge: '3', badgeBg: 'bg-sky-soft text-sky-deep border border-sky-DEFAULT', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
  { name: 'Medium', badge: '2', badgeBg: 'bg-sky-DEFAULT text-white', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
  { name: 'High', badge: '1', badgeBg: 'bg-sky-deep text-white', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
];

const PRIORITY_MAP = PRIORITIES.reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

function getCategoryBadgeStyle() {
  return 'bg-sky-light text-sky-deep border-2 border-sky-DEFAULT font-bold shadow-2xs';
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function formatDueDate(dueDateStr) {
  if (!dueDateStr) return null;
  const d = new Date(dueDateStr);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isSameDay(d, now)) {
    return { label: `Today, ${formattedTime}`, isOverdue: false, isToday: true };
  }

  if (d < todayStart) {
    const formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return { label: `${formattedDate}, ${formattedTime}`, isOverdue: true, isToday: false };
  }

  const formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return { label: `${formattedDate}, ${formattedTime}`, isOverdue: false, isToday: false };
}

export default function TaskList({
  tasks,
  totalTasksCount,
  onToggleCompleted,
  onDeleteTask,
  onEditTask,
  onToggleSubtask,
  onReorderTasks,
}) {
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: 'Work',
    priority: 'Medium',
    dueDate: '',
    repeat: 'none',
    subtasks: [],
  });
  const [editSubtaskInput, setEditSubtaskInput] = useState('');
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditFormData({
      title: task.title,
      category: task.category || 'Work',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate || '',
      repeat: task.repeat || 'none',
      subtasks: task.subtasks ? [...task.subtasks] : [],
    });
    setEditSubtaskInput('');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
  };

  const saveEditing = (task) => {
    if (!editFormData.title.trim()) return;
    onEditTask({
      ...task,
      title: editFormData.title.trim(),
      category: editFormData.category,
      priority: editFormData.priority,
      dueDate: editFormData.dueDate,
      repeat: editFormData.repeat,
      subtasks: editFormData.subtasks,
    });
    setEditingTaskId(null);
  };

  const handleAddEditSubtask = () => {
    if (!editSubtaskInput.trim()) return;
    setEditFormData({
      ...editFormData,
      subtasks: [
        ...editFormData.subtasks,
        { id: Date.now().toString(), text: editSubtaskInput.trim(), done: false },
      ],
    });
    setEditSubtaskInput('');
  };

  const handleRemoveEditSubtask = (id) => {
    setEditFormData({
      ...editFormData,
      subtasks: editFormData.subtasks.filter((s) => s.id !== id),
    });
  };

  const handleDelete = (id) => {
    setDeletingTaskId(id);
    setTimeout(() => {
      onDeleteTask(id);
      setDeletingTaskId(null);
    }, 200);
  };

  const toggleExpand = (id) => {
    setExpandedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...tasks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    if (onReorderTasks) {
      onReorderTasks(updated);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Sticky-note callout style Empty State
  if (tasks.length === 0) {
    return (
      <div className="bg-sky-light border-2 border-sky-DEFAULT rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center font-sans shadow-xs space-y-2.5">
        <div className="p-3 bg-paper-card rounded-2xl border border-sky-DEFAULT mb-1 shadow-xs">
          {totalTasksCount === 0 ? (
            <BookOpen className="w-8 h-8 text-sky-deep" />
          ) : (
            <Sparkles className="w-8 h-8 text-sky-deep" />
          )}
        </div>
        <h3 className="font-fredoka font-bold text-lg text-sky-deep">
          {totalTasksCount === 0 ? 'No tasks yet — plan your day! 📝' : 'All tasks completed for today! ✨'}
        </h3>
        <p className="text-xs text-ink/70 max-w-xs font-semibold">
          {totalTasksCount === 0
            ? 'Add your first task above to keep your student to-do list organized.'
            : 'You cleared all active tasks in this view. Great job! 🌟'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {tasks.map((task, index) => {
        const isEditing = editingTaskId === task.id;
        const isDeleting = deletingTaskId === task.id;
        const isExpanded = expandedTaskIds.has(task.id);
        const dueInfo = formatDueDate(task.dueDate);
        const prioStyle = PRIORITY_MAP[task.priority] || PRIORITIES[1];

        const subtasks = task.subtasks || [];
        const totalSubtasks = subtasks.length;
        const completedSubtasks = subtasks.filter((s) => s.done).length;
        const subtaskPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        if (isEditing) {
          return (
            <div
              key={task.id}
              className="bg-paper-card border-2 border-sky-DEFAULT rounded-2xl p-4 space-y-3.5 shadow-sm"
            >
              <div className="bg-sky-light text-sky-deep rounded-lg px-3 py-1 font-bold text-xs inline-flex items-center gap-1.5 border border-sky-DEFAULT">
                <Pencil className="w-3.5 h-3.5 text-sky-deep" />
                <span>Editing Goal</span>
              </div>

              {/* Edit Title Input */}
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full bg-paper-card border-2 border-sky-DEFAULT rounded-xl px-3.5 py-2 text-xs text-ink font-semibold focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30"
              />

              {/* Edit Subtasks Checklist */}
              <div className="bg-sky-light/40 border border-sky-DEFAULT rounded-xl p-3 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-deep flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-sky-deep" />
                  <span>Subtasks / Checklist</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editSubtaskInput}
                    onChange={(e) => setEditSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEditSubtask();
                      }
                    }}
                    placeholder="Add a new subtask..."
                    className="flex-1 bg-paper-card border border-sky-DEFAULT rounded-lg px-3 py-1 text-xs text-ink focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditSubtask}
                    aria-label="Add subtask"
                    disabled={!editSubtaskInput.trim()}
                    className="bg-sky-deep hover:bg-sky-deep/90 text-white disabled:opacity-40 p-1 rounded-lg border border-sky-deep text-xs cursor-pointer font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {editFormData.subtasks.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {editFormData.subtasks.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center justify-between bg-paper-card border border-sky-DEFAULT px-3 py-1 rounded-lg text-xs text-ink font-medium"
                      >
                        <span className="truncate">{sub.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditSubtask(sub.id)}
                          aria-label={`Remove subtask ${sub.text}`}
                          className="text-ink/50 hover:text-rose-600 p-0.5 rounded transition-colors ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Options Row: Category, Priority */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Category Dropdown */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Category:</span>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="bg-paper-card border border-sky-DEFAULT rounded-xl px-2.5 py-1 text-xs text-sky-deep font-bold focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 cursor-pointer"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Priority:</span>
                  {PRIORITIES.map((p) => {
                    const isSelected = editFormData.priority === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, priority: p.name })}
                        className={`px-2.5 py-0.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected ? p.activeBg : p.idleBg
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${p.badgeBg}`}>
                          {p.badge}
                        </span>
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Due Date, Repeat & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-sky-DEFAULT">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-DEFAULT" />
                    <label className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Due Date:</label>
                    <input
                      type="datetime-local"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="bg-paper-card border border-sky-DEFAULT rounded-xl px-2.5 py-1 text-xs text-ink focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-sky-DEFAULT" />
                    <label className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Repeat:</label>
                    <select
                      value={editFormData.repeat}
                      onChange={(e) => setEditFormData({ ...editFormData, repeat: e.target.value })}
                      className="bg-paper-card border border-sky-DEFAULT rounded-xl px-2 py-1 text-xs text-ink focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 cursor-pointer font-semibold"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex items-center gap-1 bg-sky-light hover:bg-sky-soft/60 border border-sky-DEFAULT text-sky-deep font-bold px-3.5 py-1 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEditing(task)}
                    disabled={!editFormData.title.trim()}
                    className="flex items-center gap-1 bg-sky-deep hover:bg-sky-deep/90 disabled:opacity-40 text-white font-bold px-4 py-1 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={task.id}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => handleDragLeave(index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`relative rounded-xl border-2 border-sky-DEFAULT p-3.5 shadow-xs hover:border-sky-deep transition-all duration-200 ${
              isDeleting
                ? 'opacity-0 scale-95 pointer-events-none'
                : isDragging
                ? 'opacity-40 border-dashed border-2 border-sky-deep bg-sky-light'
                : isDragOver
                ? 'border-t-4 border-t-sky-deep bg-sky-light/40 shadow-xs'
                : task.completed
                ? 'bg-sky-light/40 border-2 border-sky-DEFAULT opacity-80'
                : 'bg-paper-card border-2 border-sky-DEFAULT'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              {/* Left Side: Drag Handle, Soft Square Checkbox & Task Details */}
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {/* Drag Handle Icon */}
                <div
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  role="button"
                  aria-label={`Drag to reorder task: ${task.title}`}
                  className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-sky-DEFAULT hover:text-sky-deep transition-colors flex-shrink-0 touch-none"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Soft Square (rounded-md) Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleCompleted(task.id)}
                  aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                  className={`mt-0.5 sm:mt-0 flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky/30 cursor-pointer shadow-xs ${
                    task.completed
                      ? 'bg-sky-deep border-sky-deep text-white animate-pop'
                      : 'border-sky-deep bg-paper-card hover:bg-sky-light active:scale-95'
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    {/* Title row with Priority Number Badge */}
                    <div className="flex items-center gap-2">
                      {/* Priority Numbered Circular Badge */}
                      <span
                        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold shadow-xs ${prioStyle.badgeBg}`}
                        title={`Priority: ${task.priority}`}
                      >
                        {prioStyle.badge}
                      </span>

                      <h3
                        className={`text-xs sm:text-sm select-none transition-all ${
                          task.completed
                            ? 'line-through text-ink/60 font-medium'
                            : 'text-ink font-bold'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* Metadata Row: Category Chip, Repeat Badge & Due Date */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] pt-0.5">
                      {/* Category Badge */}
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold ${getCategoryBadgeStyle()}`}
                      >
                        {task.category}
                      </span>

                      {/* Recurring Repeat Badge */}
                      {task.repeat && task.repeat !== 'none' && (
                        <span
                          className="bg-sky-light text-sky-deep border-2 border-sky-DEFAULT text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                          title={`Recurring ${task.repeat}`}
                        >
                          <Repeat className="w-3 h-3 text-sky-DEFAULT" />
                          <span className="capitalize">{task.repeat}</span>
                        </span>
                      )}

                      {/* Due Date Indicator */}
                      {dueInfo && (
                        <span
                          className={`flex items-center gap-1 text-[11px] font-bold ${
                            dueInfo.isOverdue && !task.completed
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full'
                              : dueInfo.isToday && !task.completed
                              ? 'text-sky-deep font-bold'
                              : 'text-ink/70'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-sky-DEFAULT" />
                          <span>{dueInfo.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side Actions: Edit & Delete */}
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
                <button
                  type="button"
                  onClick={() => startEditing(task)}
                  aria-label={`Edit task: ${task.title}`}
                  className="p-1 rounded-xl text-sky-deep hover:bg-sky-light transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Delete task: ${task.title}`}
                  className="p-1 rounded-xl text-ink/50 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtask Progress & Expand Button */}
            {totalSubtasks > 0 && (
              <div className="mt-3 pt-2.5 border-t border-sky-DEFAULT flex items-center justify-between gap-3">
                <div
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none group/prog"
                >
                  {/* Progress Text */}
                  <span className="text-[11px] font-bold text-sky-deep group-hover/prog:underline transition-colors">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>

                  {/* Mini Progress Bar Track & Fill */}
                  <div className="w-24 sm:w-32 h-2.5 bg-sky-light border border-sky-DEFAULT rounded-full overflow-hidden flex-shrink-0">
                    <div
                      className="h-full bg-sky-deep rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${subtaskPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Chevron Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-center gap-1 text-[11px] text-sky-deep font-bold px-2 py-0.5 rounded-xl hover:bg-sky-light transition-colors cursor-pointer"
                  aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-sky-deep" /> : <ChevronDown className="w-3.5 h-3.5 text-sky-deep" />}
                </button>
              </div>
            )}

            {/* Expanded Subtask Checklist */}
            {isExpanded && totalSubtasks > 0 && (
              <div className="mt-2 bg-sky-light/40 border border-sky-DEFAULT rounded-xl p-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-deep mb-1 flex items-center gap-1">
                  <ListChecks className="w-3 h-3 text-sky-deep" />
                  Checklist
                </div>
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      if (onToggleSubtask) onToggleSubtask(task.id, sub.id);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-paper-card cursor-pointer transition-colors group/sub"
                  >
                    {/* Subtask Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSubtask) onToggleSubtask(task.id, sub.id);
                      }}
                      aria-label={sub.done ? `Mark subtask "${sub.text}" as incomplete` : `Mark subtask "${sub.text}" as complete`}
                      className={`w-4 h-4 rounded-md border-2 transition-all flex-shrink-0 flex items-center justify-center cursor-pointer ${
                        sub.done
                          ? 'bg-sky-deep border-sky-deep text-white animate-pop'
                          : 'border-sky-deep bg-paper-card group-hover/sub:border-sky-deep'
                      }`}
                    >
                      {sub.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    {/* Subtask Text */}
                    <span
                      className={`text-xs font-semibold select-none transition-all ${
                        sub.done ? 'line-through text-ink/50' : 'text-ink'
                      }`}
                    >
                      {sub.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
