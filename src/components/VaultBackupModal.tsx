import React, { useState } from 'react';
import { DownloadCloud, UploadCloud, X, CheckCircle2, AlertTriangle, FileArchive, Shield } from 'lucide-react';
import { UserSession, ShieldedFile, VaultFolder } from '../types';

interface VaultBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  files: ShieldedFile[];
  folders: VaultFolder[];
  onExport: () => Promise<void>;
  onImport: (jsonString: string) => Promise<{ success: boolean; message: string }>;
}

export const VaultBackupModal: React.FC<VaultBackupModalProps> = ({
  isOpen,
  onClose,
  session,
  files,
  folders,
  onExport,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'restore'>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleExportClick = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      await onExport();
      setStatusMessage({ type: 'success', text: 'Encrypted vault backup downloaded successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Export failed.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      setIsRestoring(true);
      setStatusMessage(null);
      try {
        const result = await onImport(content);
        if (result.success) {
          setStatusMessage({ type: 'success', text: result.message });
        } else {
          setStatusMessage({ type: 'error', text: result.message });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Restore failed.' });
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const activeFiles = files.filter((f) => f.status === 'shielded');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Vault Snapshot & Disaster Recovery</h3>
              <p className="text-xs text-slate-500">Export or restore encrypted vault state</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100/80 rounded-xl mt-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('export');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Export Snapshot</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('restore');
              setStatusMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'restore'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Restore Snapshot</span>
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Shielded User Identity:</span>
                <span className="font-mono text-slate-800">{session.shieldedAddress.slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Active Encrypted Files:</span>
                <span className="font-semibold text-slate-800">{activeFiles.length} files</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Custom Directory Folders:</span>
                <span className="font-semibold text-slate-800">{folders.length} folders</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Integrity Protection:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  SHA-256 Verified
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Exporting will generate a secure, standalone JSON archive containing your encrypted file metadata,
              directory tree, and tags. You can use this archive to restore your vault anytime.
            </p>

            <button
              type="button"
              onClick={handleExportClick}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-all"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{isExporting ? 'Generating Archive...' : 'Download Encrypted Snapshot'}</span>
            </button>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === 'restore' && (
          <div className="mt-5 space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center transition-colors">
              <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">Upload VoidCloud JSON Backup</p>
              <p className="text-[11px] text-slate-400 mt-1">Select a previously exported .json archive file</p>
              <label className="mt-3 inline-block px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={isRestoring}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                Restoring a snapshot will merge or sync the archive files and folders with your current vault. Existing files will remain preserved.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end pt-4 mt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
