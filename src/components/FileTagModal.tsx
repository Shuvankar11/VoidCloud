import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { ShieldedFile } from '../types';

interface FileTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: ShieldedFile | null;
  onSaveTags: (fileId: string, tags: string[]) => void;
}

const PRESET_TAGS = [
  'Confidential',
  'Financial',
  'Work',
  'Personal',
  'ZK-Shielded',
  'Backup',
  'Legal',
  'Media',
];

export const FileTagModal: React.FC<FileTagModalProps> = ({
  isOpen,
  onClose,
  file,
  onSaveTags,
}) => {
  const [tags, setTags] = useState<string[]>(() => (file?.tags ? [...file.tags] : []));
  const [inputTag, setInputTag] = useState('');

  if (!isOpen || !file) return null;

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setInputTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    onSaveTags(file.id, tags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Manage File Tags</h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{file.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Tags */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700 mb-2">
            Active Tags ({tags.length})
          </label>
          <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-50/80 border border-slate-200/80 rounded-xl">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100/80 text-indigo-800 rounded-lg text-xs font-semibold shadow-2xs animate-fade-in"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-indigo-500 hover:text-indigo-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length === 0 && (
              <span className="text-xs text-slate-400 italic">No tags assigned yet.</span>
            )}
          </div>
        </div>

        {/* Add Tag Input */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Add Custom Tag
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(inputTag);
                }
              }}
              placeholder="Type tag name and press Enter..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => handleAddTag(inputTag)}
              disabled={!inputTag.trim()}
              className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Suggested Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TAGS.map((preset) => {
              const alreadyAdded = tags.includes(preset);
              return (
                <button
                  type="button"
                  key={preset}
                  onClick={() => (alreadyAdded ? handleRemoveTag(preset) : handleAddTag(preset))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    alreadyAdded
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {alreadyAdded ? '✓ ' : '+ '}#{preset}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
};
