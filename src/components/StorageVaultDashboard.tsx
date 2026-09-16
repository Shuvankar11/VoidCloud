import React, { useState, useRef, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { ShieldedFile } from '../types';
import { BreadcrumbNav } from './BreadcrumbNav';
import { FolderCard } from './FolderCard';
import { CreateFolderModal } from './CreateFolderModal';
import { MoveToFolderModal } from './MoveToFolderModal';
import { FileTagModal } from './FileTagModal';
import { FloatingBatchBar } from './FloatingBatchBar';
import { ZKAuditLogModal } from './ZKAuditLogModal';
import { VaultBackupModal } from './VaultBackupModal';
import {
  Search,
  Plus,
  Home,
  Folder,
  Share2,
  Star,
  Trash2,
  Settings,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  Video,
  Archive,
  Cloud,
  Download,
  Eye,
  X,
  Grid,
  List,
  CheckCircle2,
  UploadCloud,
  FileUp,
  FileCode,
  Music,
  RotateCcw,
  Undo2,
  Lock,
  FolderPlus,
  Activity,
  DownloadCloud,
  Tag as TagIcon,
  CheckSquare,
  Square,
} from 'lucide-react';

export const StorageVaultDashboard: React.FC = () => {
  const {
    session,
    files,
    setActivePreviewFile,
    claimBonusWithZKProof,
    shredFile,
    restoreFile,
    emptyTrash,
    restoreAllTrash,
    deleteFilePermanently,
    decryptAndDownloadFile,
    toggleStarFile,
    uploadAndEncryptFile,
    folders,
    activeFolderId,
    setActiveFolderId,
    createFolder,
    deleteFolder,
    moveFileToFolder,
    updateFileTags,
    bulkStarFiles,
    bulkMoveToTrash,
    bulkMoveToFolder,
    auditLogs,
    addAuditLog,
    clearAuditLogs,
    exportVaultBackup,
    importVaultBackup,
  } = useVault();
  const { user } = useAuth();
  const { setIsPricingModalOpen } = useWeb3Wallet();

  const [activeTab, setActiveTab] = useState<'home' | 'files' | 'starred' | 'trash'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'doc' | 'image' | 'video' | 'archive'>('all');
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  // New states for Folder, Tag, Batch, Audit, and Backup
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveTargetFile, setMoveTargetFile] = useState<ShieldedFile | null>(null);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagTargetFile, setTagTargetFile] = useState<ShieldedFile | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real Category Helper
  const getFileCategory = (f: ShieldedFile): 'image' | 'video' | 'doc' | 'archive' => {
    const name = f.name.toLowerCase();
    const mime = f.mimeType?.toLowerCase() || '';
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv|avi|m4v)$/i.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) return 'archive';
    if (
      mime.includes('pdf') ||
      mime.includes('word') ||
      mime.includes('document') ||
      mime.includes('text') ||
      /\.(pdf|docx|doc|txt|md|csv|xlsx|json|ts|js|py|html|css)$/i.test(name)
    ) {
      return 'doc';
    }
    return 'archive';
  };

  // Real Active Files & Category Breakdown
  const activeFiles = useMemo(() => files.filter((f) => f.status === 'shielded'), [files]);
  const trashFiles = useMemo(() => files.filter((f) => f.status === 'shredded'), [files]);
  const starredFiles = useMemo(() => activeFiles.filter((f) => f.isStarred), [activeFiles]);

  const imageFiles = useMemo(() => activeFiles.filter((f) => getFileCategory(f) === 'image'), [activeFiles]);
  const videoFiles = useMemo(() => activeFiles.filter((f) => getFileCategory(f) === 'video'), [activeFiles]);
  const docFiles = useMemo(() => activeFiles.filter((f) => getFileCategory(f) === 'doc'), [activeFiles]);
  const otherFiles = useMemo(() => activeFiles.filter((f) => getFileCategory(f) === 'archive'), [activeFiles]);

  // Real Bytes Calculations
  const imageBytes = useMemo(() => imageFiles.reduce((acc, f) => acc + f.sizeBytes, 0), [imageFiles]);
  const videoBytes = useMemo(() => videoFiles.reduce((acc, f) => acc + f.sizeBytes, 0), [videoFiles]);
  const docBytes = useMemo(() => docFiles.reduce((acc, f) => acc + f.sizeBytes, 0), [docFiles]);
  const otherBytes = useMemo(() => otherFiles.reduce((acc, f) => acc + f.sizeBytes, 0), [otherFiles]);
  const totalUsedBytes = useMemo(() => imageBytes + videoBytes + docBytes + otherBytes, [imageBytes, videoBytes, docBytes, otherBytes]);

  const formatSizeDynamic = (bytes: number) => {
    if (bytes === 0) return '0.0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const totalQuotaBytes = Math.max((session.quotaGB || 40) * 1024 * 1024 * 1024, 1);
  const imagePct = Math.min((imageBytes / totalQuotaBytes) * 100, 100);
  const videoPct = Math.min((videoBytes / totalQuotaBytes) * 100, 100);
  const docPct = Math.min((docBytes / totalQuotaBytes) * 100, 100);
  const otherPct = Math.min((otherBytes / totalQuotaBytes) * 100, 100);

  // Subfolders & Available Tags
  const currentFolders = useMemo(() => {
    if (activeTab !== 'home' && activeTab !== 'files') return [];
    return folders.filter((f) => (f.parentId || null) === activeFolderId);
  }, [folders, activeTab, activeFolderId]);

  const activeFolder = useMemo(() => {
    return folders.find((f) => f.id === activeFolderId) || null;
  }, [folders, activeFolderId]);

  const availableTags = useMemo(() => {
    const set = new Set<string>();
    activeFiles.forEach((f) => {
      if (f.tags) f.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [activeFiles]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    const list = activeTab === 'trash'
      ? trashFiles
      : activeTab === 'starred'
      ? starredFiles
      : activeFiles;

    return list.filter((file) => {
      // If in home or files tab and not searching, filter by activeFolderId
      if ((activeTab === 'home' || activeTab === 'files') && !searchQuery) {
        if (activeFolderId === null) {
          if (file.folderId) return false;
        } else {
          if (file.folderId !== activeFolderId) return false;
        }
      }

      // Tag filter
      if (selectedTagFilter && (!file.tags || !file.tags.includes(selectedTagFilter))) {
        return false;
      }

      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      return getFileCategory(file) === selectedCategory;
    });
  }, [activeFiles, trashFiles, starredFiles, activeTab, searchQuery, selectedCategory, activeFolderId, selectedTagFilter]);

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length && filteredFiles.length > 0) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map((f) => f.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedFileIds([]);
  };

  const handleBulkStar = () => {
    bulkStarFiles(selectedFileIds, true);
    setSelectedFileIds([]);
  };

  const handleBulkTrash = () => {
    bulkMoveToTrash(selectedFileIds);
    setSelectedFileIds([]);
  };

  const handleBulkMoveToFolder = (targetFolderId: string | null) => {
    bulkMoveToFolder(selectedFileIds, targetFolderId);
    setSelectedFileIds([]);
    setIsMoveModalOpen(false);
  };

  const handleBulkDownload = () => {
    const targets = files.filter((f) => selectedFileIds.includes(f.id));
    targets.forEach((f) => decryptAndDownloadFile(f));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      setUploadStage('Encrypting file with AES-256-GCM...');

      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        await uploadAndEncryptFile(file, (percent, stage) => {
          setUploadProgress(percent);
          setUploadStage(stage);
        });
      }

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStage('');
      }, 600);
    }
  };

  const renderFileIcon = (file: ShieldedFile) => {
    const cat = getFileCategory(file);
    if (cat === 'image') return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    if (cat === 'video') return <Video className="w-5 h-5 text-sky-500" />;
    if (cat === 'doc') return <FileText className="w-5 h-5 text-amber-500" />;
    return <Archive className="w-5 h-5 text-purple-500" />;
  };

  return (
    <section
      id="vault-dashboard"
      className="min-h-screen py-6 sm:py-8 px-3 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all select-none"
      style={{
        backgroundImage: 'url(/aurora-bg.jpg)',
        backgroundColor: '#EBF4FF',
      }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      {/* Main Dashboard Card Container (Matching Reference 3) */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] flex flex-col lg:flex-row overflow-hidden min-h-[820px] text-slate-800">
        
        {/* ============================================================ */}
        {/* 1. LEFT SIDEBAR: LOGO & NAV LINKS (Matching Reference 3)     */}
        {/* ============================================================ */}
        <aside className="lg:w-64 bg-slate-50/70 border-r border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-lg tracking-wide text-slate-900">
                VOID<span className="text-sky-500">CLOUD</span>
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                className="py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] text-slate-700 border border-slate-200/80 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                title="Create New Folder"
              >
                <FolderPlus className="w-4 h-4 text-sky-500" />
                <span>+ Folder</span>
              </button>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                  setActiveFolderId(null);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'home' && activeFolderId === null
                    ? 'bg-sky-50 text-sky-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4 text-sky-500" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('files');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'files'
                    ? 'bg-sky-50 text-sky-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Folder className="w-4 h-4 text-slate-400" />
                  <span>My Files</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400">{activeFiles.length}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('starred');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'starred'
                    ? 'bg-amber-50 text-amber-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Star className={`w-4 h-4 ${activeTab === 'starred' || starredFiles.length > 0 ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                  <span>Starred</span>
                </div>
                {starredFiles.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                    {starredFiles.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('trash');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'trash'
                    ? 'bg-rose-50 text-rose-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Trash</span>
                </div>
                {trashFiles.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
                    {trashFiles.length}
                  </span>
                )}
              </button>

              <div className="pt-2 border-t border-slate-200/80 my-1"></div>

              {/* ZK Audit Trail CTA */}
              <button
                onClick={() => setIsAuditLogOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer text-slate-600 hover:bg-purple-50 hover:text-purple-700"
              >
                <div className="flex items-center space-x-3">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>ZK Audit Trail</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 font-bold">
                  {auditLogs.length}
                </span>
              </button>

              {/* Vault Backup CTA */}
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <div className="flex items-center space-x-3">
                  <DownloadCloud className="w-4 h-4 text-emerald-500" />
                  <span>Backup & Restore</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Bottom Account Switcher */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  P
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Personal</div>
                  <div className="text-[10px] text-slate-400 font-medium">Only You</div>
                </div>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 2. MAIN CENTER: SEARCH, QUICK ACCESS & RECENTS TABLE         */}
        {/* ============================================================ */}
        <main className="flex-1 p-5 sm:p-7 md:p-8 space-y-6 overflow-y-auto">
          
          {/* Top Search Bar & View Mode Switcher */}
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, documents, or ZK commitments..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-100/80 border border-slate-200/80 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewLayout === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  viewLayout === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Announcement Banner */}
          {showAnnouncement && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center justify-between text-xs text-sky-800">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <span>
                  <strong className="font-bold">Notice:</strong> Your zero-knowledge shielded vault is live on Midnight Preprod with {session.quotaGB} GB allocated capacity!
                </span>
              </div>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="text-sky-600 hover:text-sky-900 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Upload Progress Bar if Uploading */}
          {isUploading && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{uploadStage}</span>
                <span className="text-sky-600">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-sky-100">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-150"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* QUICK ACCESS CARDS (Real Category Filters / Upload Actions)  */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-black text-sm text-slate-900 tracking-tight">
                Quick Access
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                {activeFiles.length} {activeFiles.length === 1 ? 'file' : 'files'} stored
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 1: Images */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'image' ? 'all' : 'image')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedCategory === 'image'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-200'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Photos & Images</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {imageFiles.length} files • {formatSizeDynamic(imageBytes)}
                  </div>
                </div>
              </div>

              {/* Card 2: Videos */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'video' ? 'all' : 'video')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedCategory === 'video'
                    ? 'border-sky-500 bg-sky-50/70 shadow-sm ring-2 ring-sky-200'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Video Vault</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {videoFiles.length} files • {formatSizeDynamic(videoBytes)}
                  </div>
                </div>
              </div>

              {/* Card 3: Documents */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'doc' ? 'all' : 'doc')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedCategory === 'doc'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-200'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">PDFs & Docs</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {docFiles.length} files • {formatSizeDynamic(docBytes)}
                  </div>
                </div>
              </div>

              {/* Card 4: Archives & Code */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'archive' ? 'all' : 'archive')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                  selectedCategory === 'archive'
                    ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-2 ring-purple-200'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">ZIP & Code</div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {otherFiles.length} files • {formatSizeDynamic(otherBytes)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* FOLDER NAVIGATION & HIERARCHY (Home & Files tabs)            */}
          {/* ============================================================ */}
          {(activeTab === 'home' || activeTab === 'files') && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
              <BreadcrumbNav
                folders={folders}
                activeFolderId={activeFolderId}
                onSelectFolder={(id) => setActiveFolderId(id)}
              />
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5 text-sky-500" />
                <span>New Folder</span>
              </button>
            </div>
          )}

          {/* Subfolders in current view */}
          {(activeTab === 'home' || activeTab === 'files') && currentFolders.length > 0 && !searchQuery && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-display font-bold text-xs text-slate-700 tracking-tight">
                  Folders ({currentFolders.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    fileCount={files.filter((f) => f.folderId === folder.id && f.status === 'shielded').length}
                    onOpen={(folderId) => setActiveFolderId(folderId)}
                    onDelete={(folderId) => deleteFolder(folderId)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tag Filter Pills */}
          {availableTags.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1 flex-shrink-0">
                <TagIcon className="w-3.5 h-3.5" />
                <span>Filter by Tag:</span>
              </span>
              <button
                onClick={() => setSelectedTagFilter(null)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                  selectedTagFilter === null
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
                    selectedTagFilter === tag
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* RECENTS FILE TABLE / GRID                                    */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center space-x-3">
                <h2 className="font-display font-black text-sm text-slate-900 tracking-tight">
                  {activeTab === 'trash'
                    ? 'Trash & Revoked Files'
                    : activeTab === 'starred'
                    ? 'Starred Files'
                    : activeTab === 'files'
                    ? (activeFolder ? activeFolder.name : 'All Files')
                    : (activeFolder ? activeFolder.name : 'Recent Files')}
                </h2>
                {activeTab === 'trash' && trashFiles.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => restoreAllTrash()}
                      className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-all flex items-center space-x-1 border border-emerald-200 shadow-2xs cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-600" />
                      <span>Restore All</span>
                    </button>
                    <button
                      onClick={() => emptyTrash()}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all flex items-center space-x-1 border border-rose-200 shadow-2xs cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Empty Trash</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                Sort by: <strong className="text-slate-700">Modified Date ↓</strong>
              </span>
            </div>

            {/* Empty State */}
            {filteredFiles.length === 0 ? (
              <div
                onClick={() => activeTab !== 'trash' && activeTab !== 'starred' && fileInputRef.current?.click()}
                className="p-10 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 text-center transition-all cursor-pointer space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                  {activeTab === 'starred' ? (
                    <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
                  ) : activeTab === 'trash' ? (
                    <Trash2 className="w-6 h-6 text-rose-500" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-800">
                  {activeTab === 'trash'
                    ? 'Trash is empty'
                    : activeTab === 'starred'
                    ? 'No starred files yet'
                    : 'No files in this view'}
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {activeTab === 'trash'
                    ? 'Revoked and shredded files will appear here. You can restore them anytime!'
                    : activeTab === 'starred'
                    ? 'Click the star icon (⭐) on any file in your vault to bookmark it for instant access.'
                    : 'Click here or drag and drop any image, video, PDF, or document to upload with zero-knowledge envelope encryption.'}
                </p>
              </div>
            ) : viewLayout === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => setActivePreviewFile(file)}
                    className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-3 group relative ${
                      selectedFileIds.includes(file.id)
                        ? 'border-sky-500 ring-2 ring-sky-200 shadow-sm'
                        : 'border-slate-200 hover:border-sky-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {file.status !== 'shredded' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectFile(file.id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Select file"
                          >
                            {selectedFileIds.includes(file.id) ? (
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                            )}
                          </button>
                        )}
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                          {renderFileIcon(file)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {file.status !== 'shredded' ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStarFile(file.id);
                              }}
                              title={file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                              className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${file.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                            </button>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              ZK Proven
                            </span>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreFile(file.id);
                            }}
                            title="Restore file to vault"
                            className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center space-x-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatSizeDynamic(file.sizeBytes)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List Table Layout (Clean, Beautiful Padding, Perfectly Centered 3 Dots, No Overflow) */
              <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-visible">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[11px] bg-slate-50/70">
                      <th className="py-3.5 pl-3 pr-1 w-10 text-center">
                        <button
                          onClick={handleSelectAll}
                          className="p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={selectedFileIds.length === filteredFiles.length && filteredFiles.length > 0 ? 'Deselect All' : 'Select All'}
                        >
                          {filteredFiles.length > 0 && selectedFileIds.length === filteredFiles.length ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 pl-2 pr-3 w-auto min-w-0">NAME ↑</th>
                      <th className="hidden sm:table-cell py-3.5 px-2 w-28">MODIFIED</th>
                      <th className="py-3.5 px-2 w-20">SIZE</th>
                      <th className="py-3.5 px-2 text-center w-28">ZK SHIELD</th>
                      <th className="py-3.5 px-2 text-center w-16">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={`transition-colors group cursor-pointer ${
                          selectedFileIds.includes(file.id) ? 'bg-sky-50/70' : 'hover:bg-sky-50/40'
                        }`}
                        onClick={() => setActivePreviewFile(file)}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 pl-3 pr-1 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSelectFile(file.id)}
                            className="p-1 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                          >
                            {selectedFileIds.includes(file.id) ? (
                              <CheckSquare className="w-4 h-4 text-sky-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                            )}
                          </button>
                        </td>

                        {/* File Name & Icon & Star */}
                        <td className="py-3.5 pl-2 pr-3 min-w-0 overflow-hidden">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            {file.status !== 'shredded' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStarFile(file.id);
                                }}
                                title={file.isStarred ? 'Remove from Starred' : 'Add to Starred'}
                                className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0"
                              >
                                <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}`} />
                              </button>
                            )}
                            <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100 flex-shrink-0">
                              {renderFileIcon(file)}
                            </div>
                            <div className="truncate min-w-0 flex-1">
                              <div className="font-bold text-slate-900 truncate text-xs" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
                                <span className="truncate">{file.status === 'shredded' ? 'Shredded on Midnight' : 'AES-256-GCM • ZK Protected'}</span>
                                {file.tags && file.tags.length > 0 && (
                                  <span className="flex items-center gap-1 flex-shrink-0">
                                    {file.tags.map((tag) => (
                                      <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-sans font-semibold text-[9px]">
                                        #{tag}
                                      </span>
                                    ))}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Modified Date */}
                        <td className="hidden sm:table-cell py-3.5 px-2 text-slate-500 whitespace-nowrap text-[11px] truncate">
                          {new Date(file.uploadedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Size */}
                        <td className="py-3.5 px-2 text-slate-700 font-mono font-semibold whitespace-nowrap text-xs">
                          {formatSizeDynamic(file.sizeBytes)}
                        </td>

                        {/* ZK Shield Status */}
                        <td className="py-3.5 px-2 whitespace-nowrap text-center">
                          {file.status === 'shredded' ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold whitespace-nowrap">
                              <Trash2 className="w-3 h-3 text-rose-500 flex-shrink-0" />
                              <span>In Trash</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span>ZK Proven</span>
                            </span>
                          )}
                        </td>

                        {/* Actions Menu (Centered with 18px Inset from Right Edge) */}
                        <td className="py-3.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-flex items-center justify-center">
                            <button
                              onClick={() => setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id)}
                              title="File actions"
                              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                activeMenuFileId === file.id
                                  ? 'bg-slate-200 text-slate-900 shadow-xs ring-1 ring-slate-300'
                                  : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu (Z-50, Unclipped, Styled Cleanly) */}
                            {activeMenuFileId === file.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setActiveMenuFileId(null)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95 text-left">
                                  {file.status === 'shredded' || activeTab === 'trash' ? (
                                    <>
                                      {/* Restore Action */}
                                      <button
                                        onClick={() => {
                                          restoreFile(file.id);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left font-bold"
                                      >
                                        <RotateCcw className="w-4 h-4 text-emerald-600" />
                                        <span>Restore File</span>
                                      </button>

                                      <div className="border-t border-slate-100 my-1" />

                                      {/* Delete Permanently Action */}
                                      <button
                                        onClick={() => {
                                          deleteFilePermanently(file.id);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2.5 transition-colors cursor-pointer text-left font-bold"
                                      >
                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                        <span>Delete Permanently</span>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          toggleStarFile(file.id);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-amber-50 text-slate-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <Star className={`w-4 h-4 ${file.isStarred ? 'text-amber-500 fill-amber-400' : 'text-amber-500'}`} />
                                        <span>{file.isStarred ? 'Unstar File' : 'Star File'}</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setActivePreviewFile(file);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <Eye className="w-4 h-4 text-sky-500" />
                                        <span>Preview</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          decryptAndDownloadFile(file);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-slate-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <Download className="w-4 h-4 text-emerald-500" />
                                        <span>Download</span>
                                      </button>

                                      <div className="border-t border-slate-100 my-1" />

                                      <button
                                        onClick={() => {
                                          setMoveTargetFile(file);
                                          setIsMoveModalOpen(true);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-sky-50 text-slate-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <Folder className="w-4 h-4 text-sky-500" />
                                        <span>Move to Folder</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setTagTargetFile(file);
                                          setIsTagModalOpen(true);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-amber-50 text-slate-700 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <TagIcon className="w-4 h-4 text-amber-500" />
                                        <span>Manage Tags</span>
                                      </button>

                                      <div className="border-t border-slate-100 my-1" />

                                      <button
                                        onClick={() => {
                                          shredFile(file.id);
                                          setActiveMenuFileId(null);
                                        }}
                                        className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
                                      >
                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                        <span>Move to Trash</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        {/* ============================================================ */}
        {/* 3. RIGHT SIDEBAR: REAL STORAGE METER & CATEGORY BREAKDOWN    */}
        {/* ============================================================ */}
        <aside className="lg:w-80 bg-slate-50/70 border-l border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between flex-shrink-0">
          <div>
            {/* Top User Profile */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-200/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                  {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : user?.email ? user.email.slice(0, 1).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 truncate max-w-[140px]">
                    {user?.displayName || user?.email?.split('@')[0] || 'Authenticated User'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {user?.email || 'vault-user@voidcloud.io'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Account Settings & Upgrades"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Storage Meter Header (100% Real Calculation) */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-1.5">
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {formatSizeDynamic(totalUsedBytes)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  used of {session.quotaGB} GB
                </span>
              </div>

              {/* Segmented Multi-Color Progress Bar (Real Dynamic Percentages) */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full flex overflow-hidden mt-3 shadow-inner">
                <div
                  style={{ width: `${Math.max(imagePct, totalUsedBytes === 0 ? 0 : 2)}%` }}
                  className="bg-emerald-500 h-full transition-all duration-300"
                  title={`Images ${imagePct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${Math.max(videoPct, 0)}%` }}
                  className="bg-sky-500 h-full transition-all duration-300"
                  title={`Videos ${videoPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${Math.max(docPct, 0)}%` }}
                  className="bg-amber-400 h-full transition-all duration-300"
                  title={`Documents ${docPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${Math.max(otherPct, 0)}%` }}
                  className="bg-purple-500 h-full transition-all duration-300"
                  title={`Others ${otherPct.toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Category Breakdown List (100% Real Live Calculation from Uploaded Files) */}
            <div className="space-y-3.5 mb-6 text-xs">
              {/* Images */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Images</div>
                    <div className="text-[10px] text-slate-400">
                      {imageFiles.length} {imageFiles.length === 1 ? 'file' : 'files'}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-700 font-mono">
                  {formatSizeDynamic(imageBytes)}
                </span>
              </div>

              {/* Videos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Videos</div>
                    <div className="text-[10px] text-slate-400">
                      {videoFiles.length} {videoFiles.length === 1 ? 'file' : 'files'}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-700 font-mono">
                  {formatSizeDynamic(videoBytes)}
                </span>
              </div>

              {/* Documents */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Documents</div>
                    <div className="text-[10px] text-slate-400">
                      {docFiles.length} {docFiles.length === 1 ? 'file' : 'files'}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-700 font-mono">
                  {formatSizeDynamic(docBytes)}
                </span>
              </div>

              {/* Others */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Archive className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Others & ZIP</div>
                    <div className="text-[10px] text-slate-400">
                      {otherFiles.length} {otherFiles.length === 1 ? 'file' : 'files'}
                    </div>
                  </div>
                </div>
                <span className="font-bold text-slate-700 font-mono">
                  {formatSizeDynamic(otherBytes)}
                </span>
              </div>
            </div>
          </div>

          {/* "Need More Space?" Card */}
          <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200/70 mt-4">
            <h3 className="font-display font-bold text-xs text-slate-900 mb-1">
              Need More Space?
            </h3>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Get more spaces by upgrading your plan or claiming +20GB ZK testnet bonus.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Upgrade Plan
              </button>
              {!session.bonusClaimed && (
                <button
                  onClick={() => claimBonusWithZKProof()}
                  className="w-full py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  ⚡ Claim +20GB ZK Bonus
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Batch Operations Bar */}
      <FloatingBatchBar
        selectedCount={selectedFileIds.length}
        totalCount={filteredFiles.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkStar={handleBulkStar}
        onBulkMoveToFolder={() => setIsMoveModalOpen(true)}
        onBulkDownload={handleBulkDownload}
        onBulkTrash={handleBulkTrash}
      />

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onCreateFolder={(name, color) => createFolder(name, color, activeFolderId || undefined)}
        parentFolderName={activeFolder?.name}
      />

      {/* Move To Folder Modal (supports single target file or batch selection) */}
      <MoveToFolderModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setMoveTargetFile(null);
        }}
        folders={folders}
        targetFile={moveTargetFile}
        bulkCount={selectedFileIds.length}
        onConfirmMove={(targetFolderId: string | null) => {
          if (moveTargetFile) {
            moveFileToFolder(moveTargetFile.id, targetFolderId);
            setMoveTargetFile(null);
            setIsMoveModalOpen(false);
          } else {
            handleBulkMoveToFolder(targetFolderId);
          }
        }}
      />

      {/* File Tag Modal */}
      <FileTagModal
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setTagTargetFile(null);
        }}
        file={tagTargetFile}
        onSaveTags={(fileId: string, tags: string[]) => {
          updateFileTags(fileId, tags);
          setTagTargetFile(null);
          setIsTagModalOpen(false);
        }}
      />

      {/* ZK Cryptographic Audit Log Modal */}
      <ZKAuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        logs={auditLogs}
        onClearLogs={clearAuditLogs}
      />

      {/* Vault Backup & Disaster Recovery Modal */}
      <VaultBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        session={session}
        files={files}
        folders={folders}
        onExport={exportVaultBackup}
        onImport={importVaultBackup}
      />
    </section>
  );
};
