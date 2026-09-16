import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { VaultFolder } from '../types';

interface BreadcrumbNavProps {
  folders: VaultFolder[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
}) => {
  // Build breadcrumb trail from active folder up to root
  const trail: VaultFolder[] = [];
  let currentId = activeFolderId;

  while (currentId) {
    const found = folders.find((f) => f.id === currentId);
    if (found) {
      trail.unshift(found);
      currentId = found.parentId || null;
    } else {
      break;
    }
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 py-2 px-1 overflow-x-auto select-none">
      <button
        onClick={() => onSelectFolder(null)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
          activeFolderId === null
            ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
            : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Root Vault</span>
      </button>

      {trail.map((folder, index) => {
        const isLast = index === trail.length - 1;
        return (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all truncate max-w-[160px] ${
                isLast
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
              }`}
              title={folder.name}
            >
              <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{folder.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
