import React, { useEffect } from 'react';
import { X, Heart, Star } from 'lucide-react';

const SHORTCUTS = [
  { key: '/', description: 'Focus search input from anywhere' },
  { key: 'N', description: 'Focus Add Goal / Task input' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm font-sans animate-page-fade-in">
      <div
        className="bg-paper-card border-2 border-sky-soft rounded-2xl shadow-xl max-w-md w-full p-5 space-y-4 relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-sky-soft pb-3">
          <div className="w-full flex items-center justify-between bg-sky-deep text-white rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider shadow-xs mr-2">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-current text-white" />
              Keyboard Shortcuts
            </span>
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="p-1.5 text-ink/50 hover:text-ink rounded-xl hover:bg-sky-light transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2 py-1">
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-sky-light/40 border border-sky-soft shadow-xs"
            >
              <span className="text-xs text-ink font-semibold">{sc.description}</span>
              <kbd className="px-2.5 py-0.5 bg-sky-light border border-sky-soft rounded-md text-xs font-bold text-sky-deep font-mono shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Modal Footer Note */}
        <div className="pt-2 border-t border-sky-soft text-center">
          <p className="text-[11px] text-ink/70 font-semibold flex items-center justify-center gap-1">
            <span>Shortcuts pause automatically while typing in input fields.</span>
            <Heart className="w-2.5 h-2.5 text-sky-deep inline fill-current" />
          </p>
        </div>
      </div>
    </div>
  );
}
