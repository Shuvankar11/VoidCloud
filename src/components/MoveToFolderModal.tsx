import React, { useState } from 'react';
import { Folder, Home, X, Check, ArrowRight } from 'lucide-react';
import { VaultFolder, ShieldedFile } from '../types';

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: VaultFolder[];
  targetFile?: ShieldedFile | null;
  bulkCount?: number;
  onConfirmMove: (targetFolderId: string | null) => void;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  folders,
  targetFile,
  bulkCount,
  onConfirmMove,
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    targetFile ? targetFile.folderId || null : null
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmMove(selectedFolderId);
    onClose();
  };

  const title = bulkCount && bulkCount > 1
    ? `Move ${bulkCount} Files to Folder`
    : `Move "${targetFile?.name || 'File'}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 truncate max-w-[260px]">{title}</h3>
              <p className="text-xs text-slate-500">Choose destination directory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {/* Root Option */}
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
              selectedFolderId === null
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold'
                : 'bg-slate-50/60 border-slate-200/60 text-slate-700 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-indigo-500" />
              <span>Root Vault (No Folder)</span>
            </div>
            {selectedFolderId === null && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Folder Options */}
          {folders.map((folder) => {
            const isSelected = selectedFolderId === folder.id;
            return (
              <button
                type="button"
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold'
                    : 'bg-slate-50/60 border-slate-200/60 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            );
          })}

          {folders.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              No custom folders created yet. Create a folder first!
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
          >
            <span>Move Here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
