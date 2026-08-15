import React, { useState, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { Cloud, UploadCloud, Lock, FileText, Download, Trash2, CheckCircle2, ShieldAlert, Search, RefreshCw, Key, UserCheck, HardDrive, Inbox, Shield, Loader2, X } from 'lucide-react';

export const ShieldedFileManager: React.FC = () => {
  const { files, uploadAndEncryptFile, shredFile, deleteFilePermanently, decryptAndDownloadFile, clearAllFiles, session } = useVault();
  const { user, setIsAuthModalOpen } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'shielded' | 'shredded'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const processFiles = async (fileList: FileList) => {
    setIsUploading(true);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeMB = parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 0.1;
      setUploadFileName(file.name);
      setUploadFileSizeMB(sizeMB);
      setUploadProgress(2);
      setUploadStage('Initiating zero-knowledge encrypted pipeline...');

      await uploadAndEncryptFile(file, (percent, stage) => {
        setUploadProgress(percent);
        setUploadStage(stage);
      });
    }

    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadFileName('');
      setUploadStage('');
    }, 700);
  };

  const currentUploadedMB = ((uploadProgress / 100) * uploadFileSizeMB).toFixed(2);

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'shielded') return matchesSearch && f.status === 'shielded';
    if (activeTab === 'shredded') return matchesSearch && f.status === 'shredded';
    return matchesSearch;
  });

  return (
    <section id="vault" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-3">
          <HardDrive className="w-3.5 h-3.5" />
          <span>DECENTRALIZED OBJECT STORAGE CONSOLE</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Cloud Object Vault
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          Files are envelope-encrypted locally in your browser before pin. Only your personal account witness secret can decrypt them.
        </p>

        {/* User Account Bar */}
        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0E1424] border border-slate-700/80 text-xs font-mono">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Vault Partition:</span>
          <span className="text-sky-300 font-semibold">{user ? user.displayName || user.email : 'Guest Session'}</span>
          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 ml-2 underline"
            >
              Connect Account
            </button>
          )}
        </div>
      </div>

      {/* Upload Drag & Drop Zone OR Active Live Progress Bar */}
      {isUploading ? (
        <div className="cloud-card rounded-2xl p-8 sm:p-10 border border-sky-500/50 bg-[#080D1A] shadow-[0_0_30px_rgba(56,189,248,0.25)]">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <span className="text-base font-mono font-bold text-white block truncate">{uploadFileName}</span>
                  <span className="text-xs font-mono text-slate-400 block">
                    File Size: {uploadFileSizeMB} MB • Encryption: AES-256-GCM
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-mono font-extrabold text-sky-300">{uploadProgress}%</span>
                <span className="text-xs font-mono text-slate-400 block">
                  {currentUploadedMB} / {uploadFileSizeMB} MB
                </span>
              </div>
            </div>

            {/* Large Glowing Live Upload Track */}
            <div className="h-4 w-full bg-[#0E1424] rounded-xl overflow-hidden border border-slate-700/80 relative p-0.5">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-lg transition-all duration-150 shadow-[0_0_20px_rgba(56,189,248,0.7)] relative flex items-center justify-end"
              >
                <div className="w-2.5 h-full bg-white rounded-r-lg animate-ping" />
              </div>
            </div>

            {/* Stage Progress Message */}
            <div className="flex items-center space-x-2 text-xs font-mono text-sky-300 pt-1">
              {uploadProgress < 100 ? (
                <Loader2 className="w-4 h-4 animate-spin text-sky-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              )}
              <span>{uploadStage}</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cloud-card rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all border-dashed ${
            isDragging
              ? 'border-sky-400 bg-sky-950/20 shadow-[0_0_30px_rgba(56,189,248,0.25)]'
              : 'border-slate-700 hover:border-sky-500/50 bg-[#080D1A]/90'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <UploadCloud className="w-7 h-7 text-sky-400" />
          </div>

          <h3 className="text-lg font-semibold text-white font-display">
            Drag & drop files to client-side encrypt & pin to decentralized cloud
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Automatic 256-bit AES-GCM envelope encryption + Midnight ZK quota commitment synthesis
          </p>

          <div className="mt-5 flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold font-mono shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:scale-105"
            >
              Browse Local Files
            </button>
          </div>
        </div>
      )}

      {/* Vault Files Table & Filter Bar */}
      <div className="mt-8 cloud-card rounded-2xl p-6 sm:p-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-lg text-white">Stored Cloud Objects</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-500/30 text-sky-400">
              {files.filter(f => f.status === 'shielded').length} Active
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {/* Filter Tabs */}
            <div className="flex bg-[#080D1A] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-lg ${activeTab === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400'}`}
              >
                All ({files.length})
              </button>
              <button
                onClick={() => setActiveTab('shielded')}
                className={`px-3 py-1 rounded-lg ${activeTab === 'shielded' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}
              >
                Shielded ({files.filter(f => f.status === 'shielded').length})
              </button>
              <button
                onClick={() => setActiveTab('shredded')}
                className={`px-3 py-1 rounded-lg ${activeTab === 'shredded' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'}`}
              >
                Revoked ({files.filter(f => f.status === 'shredded').length})
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080D1A] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
              />
            </div>

            {/* Clear/Reset Button if files exist */}
            {files.length > 0 && (
              <button
                onClick={() => clearAllFiles()}
                title="Wipe vault files"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors text-xs font-mono flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Files Table */}
        {filteredFiles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">OBJECT NAME & OWNER</th>
                  <th className="pb-3 font-semibold">STORAGE SHARD</th>
                  <th className="pb-3 font-semibold">DECENTRALIZED CID</th>
                  <th className="pb-3 font-semibold">ZK COMMITMENT</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredFiles.map((file) => {
                  const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
                  const isShredded = file.status === 'shredded';

                  return (
                    <tr key={file.id} className="hover:bg-slate-900/50 transition-colors">
                      {/* Name & Owner */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-xl ${isShredded ? 'bg-rose-950/40 border border-rose-500/30' : 'bg-sky-950/40 border border-sky-500/30'}`}>
                            <FileText className={`w-4 h-4 ${isShredded ? 'text-rose-400' : 'text-sky-400'}`} />
                          </div>
                          <div>
                            <span className={`font-medium block ${isShredded ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {sizeMB} MB • Owner: {file.ownerEmail || 'Your Account'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Storage Backend */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center space-x-1.5 text-sky-400">
                          <Shield className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                          <span className="text-[11px] text-slate-300">Shielded Shard</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {file.telegramFileId ? file.telegramFileId.slice(0, 10) + '...' : 'Encrypted Shard'}
                        </span>
                      </td>

                      {/* CID */}
                      <td className="py-4 pr-4 text-slate-400">
                        <span className="text-slate-400 hover:text-sky-300 transition-colors cursor-pointer" title={file.encryptedCid}>
                          {file.encryptedCid.slice(0, 16)}...
                        </span>
                      </td>

                      {/* ZK Commitment */}
                      <td className="py-4 pr-4">
                        <span className="text-blue-400 font-mono text-[11px]" title={file.zkCommitment}>
                          {file.zkCommitment.slice(0, 14)}...
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-4">
                        {isShredded ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[10px]">
                            <ShieldAlert className="w-3 h-3" />
                            <span>REVOKED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SHIELDED</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right space-x-2">
                        {!isShredded ? (
                          <>
                            <button
                              onClick={() => decryptAndDownloadFile(file)}
                              title="Fetch and decrypt with client witness secret"
                              className="px-2.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                            >
                              <Download className="w-3 h-3" />
                              <span>Decrypt</span>
                            </button>
                            <button
                              onClick={() => shredFile(file.id)}
                              title="Revoke key commitment on Midnight Preprod"
                              className="px-2.5 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                            <button
                              onClick={() => deleteFilePermanently(file.id)}
                              title="Permanently remove file from vault and storage"
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                            >
                              <X className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => deleteFilePermanently(file.id)}
                            title="Remove revoked entry from list"
                            className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-14 px-4 bg-[#080D1A]/50 rounded-xl border border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 font-mono">Your Cloud Vault is Empty</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
              No files uploaded yet. Drag and drop any file above or click "Browse Local Files" to encrypt and store in your private cloud vault.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
