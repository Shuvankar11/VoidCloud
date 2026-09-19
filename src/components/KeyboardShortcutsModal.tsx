import React from 'react';
import { X, Command } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ['/'], description: 'Focus search bar across current vault' },
  { keys: ['Esc'], description: 'Close any active modal or menu' },
  { keys: ['Ctrl', 'U'], description: 'Trigger encrypted file upload' },
  { keys: ['Ctrl', 'A'], description: 'Select all files in active folder' },
  { keys: ['Ctrl', 'B'], description: 'Export encrypted disaster recovery backup' },
  { keys: ['?'], description: 'Open this keyboard shortcuts cheat-sheet' }
];

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-white space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">VoidCloud Vault Navigation Hotkeys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {SHORTCUTS.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800/50 last:border-0">
              <span className="text-slate-300 font-medium">{item.description}</span>
              <div className="flex items-center gap-1.5">
                {item.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg shadow-inner"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-800 rounded border border-slate-700">Esc</kbd> anytime to dismiss
        </div>
      </div>
    </div>
  );
};
