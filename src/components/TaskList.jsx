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
  CheckCircle2,
  Inbox,
} from 'lucide-react';

const PRIORITIES = [
  { name: 'Low', color: 'bg-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold ring-1 ring-emerald-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
  { name: 'Medium', color: 'bg-amber-400', activeBg: 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold ring-1 ring-amber-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
  { name: 'High', color: 'bg-rose-500', activeBg: 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-semibold ring-1 ring-rose-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
];

const PRIORITY_MAP = PRIORITIES.reduce((acc, p) => ({ ...acc, [p.name]: p }), {});

function getCategoryBadgeStyle(category) {
  switch (category) {
    case 'Work':
      return 'bg-violet-500/20 text-violet-300 border border-violet-500/30';
    case 'Personal':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30';
    case 'Study':
      return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    case 'Health':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    default:
      return 'bg-navy-card text-slate-300 border border-navy-light';
  }
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
  onUpdateTask,
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
    onUpdateTask(task.id, {
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

  // Render Empty State
  if (tasks.length === 0) {
    return (
      <div className="bg-navy-light border border-dashed border-navy-light rounded-lg p-8 sm:p-10 flex flex-col items-center justify-center text-center font-sans">
        <div className="p-3 bg-navy-card rounded-lg border border-navy-light mb-3 shadow-inner">
          {totalTasksCount === 0 ? (
            <Inbox className="w-6 h-6 text-slate-400" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          )}
        </div>
        <h3 className="font-serif font-bold text-white text-sm">
          {totalTasksCount === 0 ? 'No tasks yet' : 'All tasks completed'}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {totalTasksCount === 0
            ? 'Add your first task above to start organizing.'
            : 'You have cleared all active tasks in this view.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 font-sans">
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
              className="bg-navy-card border border-navy-light rounded-lg p-3.5 space-y-3"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Pencil className="w-3.5 h-3.5 text-orange" />
                <span>Editing Task</span>
              </div>

              {/* Edit Title Input */}
              <input
                type="text"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full bg-navy-light border border-navy-light rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
              />

              {/* Edit Subtasks Checklist */}
              <div className="bg-navy-light border border-navy-light rounded-lg p-3 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-orange" />
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
                    className="flex-1 bg-navy-card border border-navy-light rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddEditSubtask}
                    aria-label="Add subtask"
                    disabled={!editSubtaskInput.trim()}
                    className="bg-navy-light hover:bg-navy-light/80 text-white disabled:opacity-40 p-1 rounded border border-navy-light text-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {editFormData.subtasks.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {editFormData.subtasks.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex items-center justify-between bg-navy-card border border-navy-light px-2.5 py-1 rounded text-xs text-white"
                      >
                        <span className="truncate">{sub.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveEditSubtask(sub.id)}
                          aria-label={`Remove subtask ${sub.text}`}
                          className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors ml-2 cursor-pointer"
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
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Category:</span>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="bg-navy-light border border-navy-light rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 cursor-pointer"
                  >
                    <option value="Work" className="bg-navy-card text-white">Work</option>
                    <option value="Personal" className="bg-navy-card text-white">Personal</option>
                    <option value="Study" className="bg-navy-card text-white">Study</option>
                    <option value="Health" className="bg-navy-card text-white">Health</option>
                  </select>
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Priority:</span>
                  {PRIORITIES.map((p) => {
                    const isSelected = editFormData.priority === p.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, priority: p.name })}
                        className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected ? p.activeBg : p.idleBg
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-xs ${p.color}`} />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Row: Due Date, Repeat & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-navy-light">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Due Date:</label>
                    <input
                      type="datetime-local"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="bg-navy-light border border-navy-light rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Repeat:</label>
                    <select
                      value={editFormData.repeat}
                      onChange={(e) => setEditFormData({ ...editFormData, repeat: e.target.value })}
                      className="bg-navy-light border border-navy-light rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 cursor-pointer"
                    >
                      <option value="none" className="bg-navy-card text-white">None</option>
                      <option value="daily" className="bg-navy-card text-white">Daily</option>
                      <option value="weekly" className="bg-navy-card text-white">Weekly</option>
                      <option value="monthly" className="bg-navy-card text-white">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex items-center gap-1 bg-navy-light hover:bg-navy-light/80 border border-navy-light text-slate-300 font-medium px-3 py-1 rounded text-xs transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEditing(task)}
                    disabled={!editFormData.title.trim()}
                    className="flex items-center gap-1 bg-orange hover:bg-orange/90 disabled:opacity-40 text-white font-semibold px-3 py-1 rounded text-xs transition-all shadow-md shadow-orange/20 cursor-pointer"
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
            className={`relative bg-navy-light rounded-lg border border-navy-light p-3.5 shadow-xs hover:border-orange/40 hover:-translate-y-0.5 transition-all duration-200 ${
              isDeleting
                ? 'opacity-0 scale-95 pointer-events-none'
                : isDragging
                ? 'opacity-40 border-dashed border-2 border-orange bg-orange/10'
                : isDragOver
                ? 'border-t-2 border-t-orange bg-orange/5 shadow-sm'
                : task.completed
                ? 'group opacity-60 bg-navy-light/60 hover:translate-y-0'
                : 'group'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-3">
              {/* Left Side: Drag Handle, Checkbox & Task Details */}
              <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                {/* Drag Handle Icon */}
                <div
                  draggable={!isEditing}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  role="button"
                  aria-label={`Drag to reorder task: ${task.title}`}
                  className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-slate-400 hover:text-white transition-colors flex-shrink-0 touch-none"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Circular Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleCompleted(task.id)}
                  aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
                  className={`mt-0.5 sm:mt-0 flex-shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-orange/30 cursor-pointer ${
                    task.completed
                      ? 'bg-orange border-orange text-white'
                      : 'border-navy-light hover:border-orange bg-navy-card'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                </button>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    {/* Title row with Priority Dot */}
                    <div className="flex items-center gap-2">
                      {/* Priority Dot */}
                      <span
                        className={`w-2 h-2 rounded-xs flex-shrink-0 ${prioStyle.color}`}
                        title={`Priority: ${task.priority}`}
                      />

                      <h3
                        className={`text-xs font-semibold select-none transition-all ${
                          task.completed
                            ? 'line-through text-slate-500 font-normal'
                            : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* Metadata Row: Category Chip, Repeat Badge & Due Date */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px] pt-0.5">
                      {/* Category Badge */}
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${getCategoryBadgeStyle(task.category)}`}
                      >
                        {task.category}
                      </span>

                      {/* Recurring Repeat Badge */}
                      {task.repeat && task.repeat !== 'none' && (
                        <span
                          className="bg-orange/10 text-orange-light border border-orange/20 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1"
                          title={`Recurring ${task.repeat}`}
                        >
                          <Repeat className="w-3 h-3 text-orange" />
                          <span className="capitalize">{task.repeat}</span>
                        </span>
                      )}

                      {/* Due Date Indicator */}
                      {dueInfo && (
                        <span
                          className={`flex items-center gap-1 text-[11px] font-medium ${
                            dueInfo.isOverdue && !task.completed
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold'
                              : dueInfo.isToday && !task.completed
                              ? 'text-amber-400 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
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
                  className="p-1 rounded text-slate-400 hover:text-orange-light hover:bg-orange/10 transition-colors cursor-pointer"
                  title="Edit task"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Delete task: ${task.title}`}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Subtask Progress & Expand Button */}
            {totalSubtasks > 0 && (
              <div className="mt-2.5 pt-2 border-t border-navy-light flex items-center justify-between gap-3">
                <div
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none group/prog"
                >
                  {/* Progress Text */}
                  <span className="text-[11px] font-semibold text-slate-400 group-hover/prog:text-orange-light transition-colors">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>

                  {/* Mini Progress Bar */}
                  <div className="w-20 sm:w-28 h-1.5 bg-navy/60 rounded-full overflow-hidden flex-shrink-0 border border-navy-light">
                    <div
                      className="h-full bg-orange rounded-full transition-all duration-300 shadow-sm shadow-orange/30"
                      style={{ width: `${subtaskPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Chevron Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(task.id)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-orange-light font-medium px-1.5 py-0.5 rounded hover:bg-orange/10 transition-colors cursor-pointer"
                  aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-orange" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Expanded Subtask Checklist */}
            {isExpanded && totalSubtasks > 0 && (
              <div className="mt-2 bg-navy-card border border-navy-light rounded-lg p-2.5 space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <ListChecks className="w-3 h-3 text-orange" />
                  Checklist
                </div>
                {subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      if (onToggleSubtask) onToggleSubtask(task.id, sub.id);
                    }}
                    className="flex items-center gap-2 p-1 rounded hover:bg-navy-light cursor-pointer transition-colors group/sub"
                  >
                    {/* Subtask Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleSubtask) onToggleSubtask(task.id, sub.id);
                      }}
                      aria-label={sub.done ? `Mark subtask "${sub.text}" as incomplete` : `Mark subtask "${sub.text}" as complete`}
                      className={`w-3.5 h-3.5 rounded border transition-all flex-shrink-0 flex items-center justify-center cursor-pointer ${
                        sub.done
                          ? 'bg-orange border-orange text-white'
                          : 'border-navy-light bg-navy-light group-hover/sub:border-orange'
                      }`}
                    >
                      {sub.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </button>

                    {/* Subtask Text */}
                    <span
                      className={`text-xs font-medium select-none transition-all ${
                        sub.done ? 'line-through text-slate-500' : 'text-white'
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
