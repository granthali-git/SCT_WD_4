import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { key: '/', description: 'Focus search input from anywhere' },
  { key: 'N', description: 'Focus Add Task input' },
  { key: 'Esc', description: 'Cancel task edit form or close modal' },
  { key: '?', description: 'Toggle shortcuts help menu' },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-md font-sans">
      <div
        className="bg-navy-card border border-navy-light rounded-xl shadow-2xl shadow-black/60 max-w-md w-full p-4 space-y-3 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-navy-light pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange/10 border border-orange/20 text-orange rounded-lg">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-white text-sm">Keyboard Shortcuts</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-navy-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2 py-1">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2 rounded bg-navy-light border border-navy-light"
            >
              <span className="text-xs text-white font-medium">{sc.description}</span>
              <kbd className="px-2 py-0.5 bg-navy border border-navy-light rounded text-xs font-semibold text-orange-light font-mono shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-navy-light text-center">
          <p className="text-[11px] text-slate-400">
            Shortcuts pause automatically while typing in input fields.
          </p>
        </div>
      </div>
    </div>
  );
}
