import React, { useState } from 'react';
import { Folder, MoreVertical, Trash2, FolderOpen } from 'lucide-react';
import { VaultFolder } from '../types';

interface FolderCardProps {
  folder: VaultFolder;
  fileCount: number;
  onOpen: (folderId: string) => void;
  onDelete: (folderId: string) => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'group-hover:border-indigo-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'group-hover:border-emerald-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'group-hover:border-rose-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'group-hover:border-amber-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'group-hover:border-purple-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', ring: 'group-hover:border-sky-200' },
};

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  fileCount,
  onOpen,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const colorTheme = COLOR_MAP[folder.color || 'indigo'] || COLOR_MAP.indigo;

  return (
    <div
      onClick={() => onOpen(folder.id)}
      className="group relative flex items-center justify-between p-3.5 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-indigo-200 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl ${colorTheme.bg} flex items-center justify-center ${colorTheme.text} shrink-0 transition-transform group-hover:scale-105`}>
          <Folder className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
            {folder.name}
          </h4>
          <p className="text-[11px] text-slate-400 font-medium">
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </p>
        </div>
      </div>

      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Folder options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-in">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpen(folder.id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Open Folder</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                if (confirm(`Delete folder "${folder.name}"? Files will be moved back to Root Vault.`)) {
                  onDelete(folder.id);
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Folder</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
