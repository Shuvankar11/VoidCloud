import React from 'react';
import { Star, Folder, Trash2, Download, X, CheckSquare } from 'lucide-react';

interface FloatingBatchBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStar: () => void;
  onBulkMoveToFolder: () => void;
  onBulkDownload: () => void;
  onBulkTrash: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkStar,
  onBulkMoveToFolder,
  onBulkDownload,
  onBulkTrash,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
      <div className="flex items-center gap-2 md:gap-3 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl text-white text-xs font-medium transition-all">
        {/* Count and Select All */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
          <span className="px-2 py-0.5 bg-indigo-500 text-white rounded-md font-bold text-[11px]">
            {selectedCount}
          </span>
          <span className="hidden sm:inline text-slate-300">selected</span>
          <button
            type="button"
            onClick={onSelectAll}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            <span>{selectedCount === totalCount ? 'All' : `All (${totalCount})`}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={onBulkStar}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded-xl transition-colors"
            title="Star Selected"
          >
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Star</span>
          </button>

          <button
            type="button"
            onClick={onBulkMoveToFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-indigo-300 rounded-xl transition-colors"
            title="Move to Folder"
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Folder</span>
          </button>

          <button
            type="button"
            onClick={onBulkDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-300 rounded-xl transition-colors"
            title="Download Selected"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={onBulkTrash}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 rounded-xl transition-colors"
            title="Move to Trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trash</span>
          </button>
        </div>

        {/* Clear Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
