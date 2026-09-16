import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Folder,
  Star,
  Tag,
  Key,
  Database,
  X,
  Copy,
  Check,
  Search,
  DownloadCloud,
} from 'lucide-react';
import { AuditLogItem, AuditActionType } from '../types';

interface ZKAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogItem[];
  onClearLogs: () => void;
}

const ACTION_CONFIG: Record<
  AuditActionType,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  FILE_ENCRYPT_UPLOAD: { label: 'AES-256 Encrypt & Shield', icon: Lock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  FILE_DECRYPT_DOWNLOAD: { label: 'ZK Witness Decrypt', icon: Download, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  FILE_STAR_TOGGLED: { label: 'Star Bookmark', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  FILE_MOVE_FOLDER: { label: 'Folder Relocation', icon: Folder, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  FILE_TAGS_UPDATED: { label: 'Tags Updated', icon: Tag, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  FILE_TRASHED: { label: 'Revoke Key to Trash', icon: Trash2, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  FILE_RESTORED: { label: 'Restore from Trash', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  FILE_PERMANENTLY_DELETED: { label: 'Shred & Purge', icon: Trash2, color: 'text-red-600 bg-red-50 border-red-200' },
  FOLDER_CREATED: { label: 'Create Directory', icon: Folder, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  FOLDER_DELETED: { label: 'Delete Directory', icon: Folder, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ZK_PROOF_GENERATED: { label: 'Halo2 Proof Generated', icon: Key, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  ZK_FAUCET_CLAIMED: { label: 'ZK Faucet Quota Claim', icon: Database, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  VAULT_BACKUP_EXPORTED: { label: 'Vault Backup Exported', icon: DownloadCloud, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  VAULT_BACKUP_RESTORED: { label: 'Vault Backup Restored', icon: Database, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
};

export const ZKAuditLogModal: React.FC<ZKAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'ENCRYPT' | 'DECRYPT' | 'ZK' | 'FILES'>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voidcloud-audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      // Search
      const matchSearch =
        search === '' ||
        item.details.toLowerCase().includes(search.toLowerCase()) ||
        item.targetName?.toLowerCase().includes(search.toLowerCase()) ||
        item.proofHash?.toLowerCase().includes(search.toLowerCase());

      if (!matchSearch) return false;

      // Filter
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'ENCRYPT') return item.action === 'FILE_ENCRYPT_UPLOAD';
      if (selectedFilter === 'DECRYPT') return item.action === 'FILE_DECRYPT_DOWNLOAD';
      if (selectedFilter === 'ZK')
        return (
          item.action === 'ZK_PROOF_GENERATED' ||
          item.action === 'ZK_FAUCET_CLAIMED' ||
          Boolean(item.proofHash)
        );
      if (selectedFilter === 'FILES')
        return (
          item.action.startsWith('FILE_') ||
          item.action.startsWith('FOLDER_')
        );
      return true;
    });
  }, [logs, search, selectedFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Cryptographic Audit Trail</h3>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-semibold">
                  Halo2 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Immutable client-side record of encryption, proof synthesis, and vault mutations
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

        {/* Toolbar */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event, file, or hash..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {(['ALL', 'ENCRYPT', 'DECRYPT', 'ZK', 'FILES'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedFilter === filter
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Log List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredLogs.map((log) => {
            const config = ACTION_CONFIG[log.action] || {
              label: log.action,
              icon: Activity,
              color: 'text-slate-600 bg-slate-50 border-slate-200',
            };
            const Icon = config.icon;

            return (
              <div
                key={log.id}
                className="p-3.5 bg-white border border-slate-200/70 rounded-xl shadow-2xs hover:border-slate-300 transition-all flex items-start gap-3 text-xs"
              >
                <div className={`p-2 rounded-xl border ${config.color} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 text-xs">{config.label}</span>
                    <time className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </time>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>

                  {/* Hash Badges */}
                  {(log.proofHash || log.txHash) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                      {log.proofHash && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                          <span className="text-slate-400">ZK:</span>
                          <span className="truncate max-w-[140px]">{log.proofHash}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.proofHash!)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy proof hash"
                          >
                            {copiedHash === log.proofHash ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                      {log.txHash && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-md text-slate-600">
                          <span className="text-slate-400">Tx:</span>
                          <span className="truncate max-w-[140px]">{log.txHash}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(log.txHash!)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy tx hash"
                          >
                            {copiedHash === log.txHash ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No audit events match your filter.</p>
              <p className="text-xs">Perform file encryption or ZK claims to generate logs.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Total recorded events: <strong className="text-slate-800">{logs.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all audit event logs? This will reset the timeline.')) {
                  onClearLogs();
                }
              }}
              disabled={logs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
