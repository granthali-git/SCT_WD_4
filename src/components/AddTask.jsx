import React, { useState } from 'react';
import { Plus, Calendar, Tag, Star, ListChecks, X, Repeat, Check, CheckSquare } from 'lucide-react';
import { parseNaturalLanguageDate } from '../utils/parseDate';

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health'];

const PRIORITIES = [
  { name: 'Low', badge: '3', badgeBg: 'bg-sky-soft text-sky-deep border border-sky-DEFAULT', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
  { name: 'Medium', badge: '2', badgeBg: 'bg-sky-DEFAULT text-white', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
  { name: 'High', badge: '1', badgeBg: 'bg-sky-deep text-white', activeBg: 'bg-sky-light text-sky-deep font-bold border-2 border-sky-deep shadow-xs', idleBg: 'bg-paper-card text-sky-deep border-2 border-sky-DEFAULT hover:bg-sky-light' },
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
    <form onSubmit={handleSubmit} className="bg-sky-light/40 border-2 border-sky-DEFAULT rounded-2xl p-4 sm:p-5 space-y-4 font-sans shadow-xs">
      <div className="flex items-center justify-between">
        <div className="w-full bg-sky-deep text-white rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-white" />
            Add New Goal / Task
          </span>
          <Star className="w-4 h-4 fill-current" />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowSubtasks(!showSubtasks)}
          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border-2 cursor-pointer ${
            showSubtasks || subtasks.length > 0
              ? 'bg-sky-deep text-white border-sky-deep shadow-xs'
              : 'bg-sky-light text-sky-deep border-sky-DEFAULT hover:bg-sky-soft'
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
          placeholder="What would you like to achieve today? (Press 'N' to focus)..."
          className="w-full bg-paper-card border-2 border-sky-DEFAULT rounded-xl px-4 py-2.5 text-xs text-ink placeholder-ink/50 focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 transition-all shadow-xs font-semibold"
        />
      </div>

      {/* Optional Subtasks Section */}
      {(showSubtasks || subtasks.length > 0) && (
        <div className="bg-sky-light border-2 border-sky-DEFAULT rounded-xl p-3 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-deep flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-sky-deep" />
            <span>Subtask Checklist</span>
          </div>

          {/* Subtask Input Field */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={handleSubtaskKeyDown}
              placeholder="Add step-by-step detail..."
              className="flex-1 bg-paper-card border-2 border-sky-DEFAULT rounded-lg px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 font-medium"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              aria-label="Add subtask"
              disabled={!subtaskInput.trim()}
              className="bg-sky-deep hover:bg-sky-deep/90 text-white disabled:bg-sky-DEFAULT p-1.5 rounded-lg border border-sky-deep text-xs transition-all cursor-pointer font-bold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Draft Subtasks List */}
          {subtasks.length > 0 && (
            <ul className="space-y-1.5 pt-1">
              {subtasks.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between bg-paper-card border border-sky-DEFAULT px-3 py-1.5 rounded-lg text-xs text-ink font-medium shadow-xs"
                >
                  <span className="truncate">{sub.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    aria-label={`Remove subtask ${sub.text}`}
                    className="text-ink/50 hover:text-rose-600 p-0.5 rounded transition-colors ml-2 flex-shrink-0 cursor-pointer"
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
          <span className="text-sky-deep text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-sky-deep" />
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all border-2 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-deep text-white border-sky-deep font-bold shadow-xs'
                    : 'bg-sky-light text-sky-deep border-sky-DEFAULT hover:bg-sky-soft'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Priority Selector with Numbered Circular Badges (1, 2, 3) */}
        <div className="flex items-center gap-1.5">
          <span className="text-sky-deep text-[11px] font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-sky-deep fill-sky-deep" />
            Priority:
          </span>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => setPriority(p.name)}
                className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
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

      {/* Bottom Row: Due Date Picker, Quick Date Text & Repeat Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t-2 border-sky-DEFAULT">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-DEFAULT" />
            <label className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Due:</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setQuickDateMatched(false);
              }}
              className="bg-paper-card border-2 border-sky-DEFAULT rounded-xl px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 font-bold shadow-xs"
            />
          </div>

          {/* Quick Date Natural Language Input with explicit sky-DEFAULT border */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={quickDate}
              onChange={(e) => handleQuickDateChange(e.target.value)}
              placeholder='e.g. "tomorrow 5pm"...'
              className="bg-paper-card border-2 border-sky-DEFAULT rounded-xl pl-2.5 pr-6 py-1.5 text-xs text-ink placeholder-ink/50 focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 w-40 sm:w-44 font-bold shadow-xs"
            />
            {quickDateMatched && (
              <span className="absolute right-2 text-emerald-700 flex items-center" title="Date recognized">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5 text-sky-DEFAULT" />
            <label className="text-[11px] uppercase tracking-wider text-sky-deep font-bold">Repeat:</label>
            <select
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
              className="bg-paper-card border-2 border-sky-DEFAULT rounded-xl px-2.5 py-1.5 text-xs text-sky-deep focus:outline-none focus:border-sky-deep focus:ring-2 focus:ring-sky/30 cursor-pointer font-bold shadow-xs"
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Add Task Button — Solid Strong Sky Deep Blue (#0F5D8F) */}
        <button
          type="submit"
          className={`flex items-center justify-center gap-1.5 bg-sky-deep text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md border-2 border-sky-deep cursor-pointer active:scale-95 ${
            !title.trim() ? 'opacity-90 cursor-pointer' : 'hover:bg-sky-deep/90'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>
    </form>
  );
}
