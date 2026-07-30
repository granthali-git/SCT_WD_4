import React, { useState } from 'react';
import { Plus, Calendar, Tag, AlertTriangle, ListChecks, X, Repeat, Check } from 'lucide-react';
import { parseNaturalLanguageDate } from '../utils/parseDate';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health'];

const PRIORITIES = [
  { name: 'Low', color: 'bg-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold ring-1 ring-emerald-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
  { name: 'Medium', color: 'bg-amber-400', activeBg: 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-semibold ring-1 ring-amber-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
  { name: 'High', color: 'bg-rose-500', activeBg: 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-semibold ring-1 ring-rose-500/30', idleBg: 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80' },
];

export default function AddTask({ onAddTask }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [quickDateMatched, setQuickDateMatched] = useState(false);
  const [repeat, setRepeat] = useState('none');
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);

  const handleQuickDateChange = (val) => {
    setQuickDate(val);
    if (!val.trim()) {
      setQuickDateMatched(false);
      return;
    }
    const parsed = parseNaturalLanguageDate(val);
    if (parsed) {
      setDueDate(parsed);
      setQuickDateMatched(true);
    } else {
      setQuickDateMatched(false);
    }
  };

  const handleAddSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now().toString(), text: subtaskInput.trim(), done: false },
    ]);
    setSubtaskInput('');
  };

  const handleSubtaskKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      id: Date.now().toString(),
      title: title.trim(),
      category,
      priority,
      dueDate,
      repeat,
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks,
    });

    setTitle('');
    setDueDate('');
    setQuickDate('');
    setQuickDateMatched(false);
    setRepeat('none');
    setSubtasks([]);
    setSubtaskInput('');
    setShowSubtasks(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-navy-light border border-navy-light rounded-lg p-4 space-y-3.5 font-mono">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-orange" />
          Add New Task
        </span>

        <button
          type="button"
          onClick={() => setShowSubtasks(!showSubtasks)}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-all border cursor-pointer ${
            showSubtasks || subtasks.length > 0
              ? 'bg-orange/10 border-orange/30 text-orange-light font-semibold'
              : 'bg-navy-card border-navy-light text-slate-300 hover:text-white'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          <span>{subtasks.length > 0 ? `Subtasks (${subtasks.length})` : '+ Subtasks'}</span>
        </button>
      </div>

      {/* Task Title Input */}
      <div>
        <input
          id="taskbloom-add-task-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title (Press 'N' to focus)..."
          className="w-full bg-navy-card border border-navy-light rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 transition-all"
        />
      </div>

      {/* Optional Subtasks Section */}
      {(showSubtasks || subtasks.length > 0) && (
        <div className="bg-navy-card border border-navy-light rounded-lg p-3 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-orange" />
            <span>Checklist</span>
          </div>

          {/* Subtask Input Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder="Add sub-item..."
              className="flex-1 bg-navy-light border border-navy-light rounded px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              aria-label="Add subtask"
              disabled={!subtaskInput.trim()}
              className="bg-navy-card hover:bg-navy-card/80 text-white disabled:opacity-40 p-1 rounded border border-navy-light text-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Draft Subtasks List */}
          {subtasks.length > 0 && (
            <ul className="space-y-1 pt-1">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between bg-navy-light border border-navy-light px-2.5 py-1 rounded text-xs text-white"
                >
                  <span className="truncate">{sub.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    aria-label={`Remove subtask ${sub.text}`}
                    className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors ml-2 flex-shrink-0 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Options Row: Category, Priority */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Category Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-orange text-white border-orange font-bold shadow-sm'
                    : 'bg-navy-card text-slate-300 border-navy-light hover:bg-navy-card/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Priority Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-slate-400" />
            Priority:
          </span>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setPriority(p.name)}
                className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1.5 transition-all cursor-pointer ${
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

      {/* Bottom Row: Due Date Picker, Quick Date Text & Repeat Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-navy-light">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Due:</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setQuickDateMatched(false);
              }}
              className="bg-navy-card border border-navy-light rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
            />
          </div>

          {/* Quick Date Natural Language Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={quickDate}
              onChange={(e) => handleQuickDateChange(e.target.value)}
              placeholder='e.g. "tomorrow 5pm"...'
              className="bg-navy-card border border-navy-light rounded pl-2.5 pr-6 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 w-40 sm:w-48"
            />
            {quickDateMatched && (
              <span className="absolute right-2 text-emerald-400 flex items-center" title="Date recognized">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Repeat:</label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="bg-navy-card border border-navy-light rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 cursor-pointer"
            >
              <option value="none" className="bg-navy-card text-white">None</option>
              <option value="daily" className="bg-navy-card text-white">Daily</option>
              <option value="weekly" className="bg-navy-card text-white">Weekly</option>
              <option value="monthly" className="bg-navy-card text-white">Monthly</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="flex items-center justify-center gap-1.5 bg-orange hover:bg-orange/90 disabled:opacity-40 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-md shadow-orange/20 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </form>
  );
}
