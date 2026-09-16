import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, color: string) => void;
  parentFolderName?: string;
}

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-300' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-300' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-300' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-300' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500', ring: 'ring-purple-300' },
  { id: 'sky', label: 'Sky', bg: 'bg-sky-500', ring: 'ring-sky-300' },
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  parentFolderName,
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    onCreateFolder(folderName.trim(), selectedColor);
    setFolderName('');
    setSelectedColor('indigo');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">New Encrypted Folder</h3>
              <p className="text-xs text-slate-500">
                {parentFolderName ? `Creating inside "${parentFolderName}"` : 'Creating in Root Vault'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g., Contracts, Financials, Private Photos"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Folder Color Badge
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setSelectedColor(c.id)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    selectedColor === c.id
                      ? 'scale-110 ring-4 ' + c.ring + ' shadow-sm'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
