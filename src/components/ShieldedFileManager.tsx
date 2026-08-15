import React, { useState, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { ShieldedFile } from '../types';
import {
  Cloud,
  UploadCloud,
  Lock,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  Search,
  RefreshCw,
  Key,
  UserCheck,
  HardDrive,
  Inbox,
  Shield,
  Loader2,
  X,
  Eye,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Film,
  Music,
  FileCode,
  Sparkles
} from 'lucide-react';

export const ShieldedFileManager: React.FC = () => {
  const {
    files,
    uploadAndEncryptFile,
    shredFile,
    deleteFilePermanently,
    decryptAndDownloadFile,
    clearAllFiles,
    setActivePreviewFile,
    session,
  } = useVault();
  const { user, setIsAuthModalOpen } = useAuth();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos' | 'docs' | 'shredded'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileCategory = (f: ShieldedFile): 'image' | 'video' | 'audio' | 'doc' => {
    const name = f.name.toLowerCase();
    const mime = f.mimeType?.toLowerCase() || '';
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv)$/i.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(name)) return 'audio';
    return 'doc';
  };

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
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    const cat = getFileCategory(f);
    if (activeTab === 'images') return f.status === 'shielded' && cat === 'image';
    if (activeTab === 'videos') return f.status === 'shielded' && cat === 'video';
    if (activeTab === 'docs') return f.status === 'shielded' && (cat === 'doc' || cat === 'audio');
    if (activeTab === 'shredded') return f.status === 'shredded';
    return true;
  });

  const renderFileIcon = (file: ShieldedFile) => {
    const cat = getFileCategory(file);
    const isShredded = file.status === 'shredded';
    if (isShredded) return <FileText className="w-4 h-4 text-rose-400" />;
    switch (cat) {
      case 'image': return <ImageIcon className="w-4 h-4 text-sky-400" />;
      case 'video': return <Film className="w-4 h-4 text-violet-400" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-400" />;
      default: return <FileCode className="w-4 h-4 text-amber-400" />;
    }
  };

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
          Photos, videos & documents are envelope-encrypted locally. Click on any file to open the built-in media viewer.
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
          className={`cloud-card rounded-2xl p-8 sm:p-10 border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-400 bg-sky-950/20'
              : 'border-slate-700/80 hover:border-sky-500/50 bg-[#080D1A]/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-4 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-semibold text-white font-mono">
            Drop photos, videos, or files here to encrypt & store
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto font-sans">
            Real-time client AES-256-GCM encryption with Midnight Zero-Knowledge proof synthesis.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              Browse Local Files
            </button>
          </div>
        </div>
      )}

      {/* Vault Files Console */}
      <div className="mt-10 cloud-card rounded-2xl border border-slate-700/80 bg-[#080D1A]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
              <span>Vault Objects</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 font-normal">
                {files.length}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Tabs */}
            <div className="flex bg-[#0E1424] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'all' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({files.length})
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'images' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Photos ({files.filter(f => f.status === 'shielded' && getFileCategory(f) === 'image').length})
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'videos' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Videos ({files.filter(f => f.status === 'shielded' && getFileCategory(f) === 'video').length})
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeTab === 'docs' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                Docs
              </button>
            </div>

            {/* View Mode Toggle (Table / Grid) */}
            <div className="flex bg-[#0E1424] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Gallery View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0E1424] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
              />
            </div>

            {/* Clear All */}
            {files.length > 0 && (
              <button
                onClick={() => clearAllFiles()}
                title="Wipe vault files"
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors text-xs font-mono flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Content View: GRID OR TABLE */}
        {filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            /* GALLERY GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
                const isShredded = file.status === 'shredded';
                const cat = getFileCategory(file);

                return (
                  <div
                    key={file.id}
                    className="group relative bg-[#0E1424] rounded-xl border border-slate-800 hover:border-sky-500/50 p-4 transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar of Card */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-xl bg-[#080D1A] border border-slate-800 group-hover:border-sky-500/40 transition-colors">
                          {renderFileIcon(file)}
                        </div>
                        {isShredded ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-mono">
                            REVOKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                            SHIELDED
                          </span>
                        )}
                      </div>

                      {/* File Name & Info */}
                      <h4
                        onClick={() => setActivePreviewFile(file)}
                        className={`text-xs font-mono font-bold truncate cursor-pointer transition-colors ${
                          isShredded ? 'text-slate-500 line-through' : 'text-slate-200 hover:text-sky-300'
                        }`}
                        title={file.name}
                      >
                        {file.name}
                      </h4>

                      <p className="text-[11px] font-mono text-slate-400 mt-1">
                        {sizeMB} MB • {file.mimeType || cat.toUpperCase()}
                      </p>

                      <p className="text-[10px] font-mono text-slate-500 mt-2 truncate" title={file.encryptedCid}>
                        CID: {file.encryptedCid.slice(0, 14)}...
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                      <button
                        onClick={() => setActivePreviewFile(file)}
                        className="flex-1 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 text-[11px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Preview</span>
                      </button>

                      {!isShredded && (
                        <button
                          onClick={() => decryptAndDownloadFile(file)}
                          title="Decrypt & Download"
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => deleteFilePermanently(file.id)}
                        title="Delete Permanently"
                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE LIST VIEW */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">OBJECT NAME</th>
                    <th className="pb-3 font-semibold">TYPE</th>
                    <th className="pb-3 font-semibold">STORAGE SHARD</th>
                    <th className="pb-3 font-semibold">DECENTRALIZED CID</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFiles.map((file) => {
                    const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
                    const isShredded = file.status === 'shredded';
                    const cat = getFileCategory(file);

                    return (
                      <tr key={file.id} className="hover:bg-slate-900/50 transition-colors group">
                        {/* Name & Icon */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center space-x-3">
                            <div
                              onClick={() => setActivePreviewFile(file)}
                              className="p-2 rounded-xl bg-[#0E1424] border border-slate-800 group-hover:border-sky-500/40 transition-colors cursor-pointer"
                            >
                              {renderFileIcon(file)}
                            </div>
                            <div className="truncate max-w-xs">
                              <span
                                onClick={() => setActivePreviewFile(file)}
                                className={`font-medium block cursor-pointer hover:text-sky-300 transition-colors truncate ${
                                  isShredded ? 'line-through text-slate-500' : 'text-slate-200'
                                }`}
                              >
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {sizeMB} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* File Category */}
                        <td className="py-3.5 pr-4 text-slate-400">
                          <span className="text-sky-400 uppercase text-[10px] font-bold">
                            {cat}
                          </span>
                        </td>

                        {/* Storage Backend */}
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center space-x-1.5 text-sky-400">
                            <Shield className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                            <span className="text-[11px] text-slate-300">Shielded Relay</span>
                          </div>
                        </td>

                        {/* CID */}
                        <td className="py-3.5 pr-4 text-slate-400">
                          <span
                            onClick={() => setActivePreviewFile(file)}
                            className="text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                            title={file.encryptedCid}
                          >
                            {file.encryptedCid.slice(0, 14)}...
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 pr-4">
                          {isShredded ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-400 text-[10px]">
                              <ShieldAlert className="w-3 h-3" />
                              <span>REVOKED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>SHIELDED</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setActivePreviewFile(file)}
                            title="Open in-app media previewer"
                            className="px-2.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 border border-sky-500/40 text-sky-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>

                          {!isShredded && (
                            <button
                              onClick={() => decryptAndDownloadFile(file)}
                              title="Fetch and decrypt with client witness secret"
                              className="px-2.5 py-1.5 rounded-lg bg-[#0E1424] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors inline-flex items-center space-x-1 text-[11px]"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          )}

                          <button
                            onClick={() => deleteFilePermanently(file.id)}
                            title="Permanently remove file from vault"
                            className="px-2 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 hover:text-white transition-colors inline-flex items-center text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="text-center py-14 px-4 bg-[#080D1A]/50 rounded-xl border border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 font-mono">Your Cloud Vault is Empty</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
              No files uploaded yet. Drag and drop photos, videos, or documents above to test the previewer!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
