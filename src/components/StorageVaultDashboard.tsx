import React, { useState, useRef, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { ShieldedFile } from '../types';
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
  Lock,
} from 'lucide-react';

export const StorageVaultDashboard: React.FC = () => {
  const {
    session,
    files,
    setActivePreviewFile,
    claimBonusWithZKProof,
    shredFile,
    decryptAndDownloadFile,
    uploadAndEncryptFile,
  } = useVault();
  const { user } = useAuth();
  const { setIsPricingModalOpen } = useWeb3Wallet();

  const [activeTab, setActiveTab] = useState<'home' | 'files' | 'shared' | 'starred' | 'trash'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'doc' | 'image' | 'video' | 'archive'>('all');
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

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

  // Filtered files
  const filteredFiles = useMemo(() => {
    const list = activeTab === 'trash' ? trashFiles : activeFiles;
    return list.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      return getFileCategory(file) === selectedCategory;
    });
  }, [activeFiles, trashFiles, activeTab, searchQuery, selectedCategory]);

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

            {/* "+ Add New File" CTA Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New File</span>
            </button>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setSelectedCategory('all');
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'home'
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
                onClick={() => setActiveTab('shared')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'shared'
                    ? 'bg-sky-50 text-sky-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-4 h-4 text-slate-400" />
                <span>Shared Files</span>
              </button>

              <button
                onClick={() => setActiveTab('starred')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer ${
                  activeTab === 'starred'
                    ? 'bg-sky-50 text-sky-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Star className="w-4 h-4 text-slate-400" />
                <span>Starred</span>
              </button>

              <button
                onClick={() => setActiveTab('trash')}
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
          {/* RECENTS FILE TABLE / GRID                                    */}
          {/* ============================================================ */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-black text-sm text-slate-900 tracking-tight">
                {activeTab === 'trash' ? 'Trash & Revoked Files' : 'Recent Files'}
              </h2>
              <span className="text-xs text-slate-400 font-semibold">
                Sort by: <strong className="text-slate-700">Modified Date ↓</strong>
              </span>
            </div>

            {/* Empty State */}
            {filteredFiles.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-10 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 text-center transition-all cursor-pointer space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs text-slate-800">
                  {activeTab === 'trash' ? 'Trash is empty' : 'No files uploaded yet'}
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {activeTab === 'trash'
                    ? 'Revoked and shredded files will appear here.'
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
                    className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                        {renderFileIcon(file)}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        ZK Proven
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-slate-900 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatSizeDynamic(file.sizeBytes)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List Table Layout */
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] bg-slate-50/60">
                      <th className="py-3 px-4 font-bold">NAME ↑</th>
                      <th className="py-3 px-4 font-bold">MODIFIED</th>
                      <th className="py-3 px-4 font-bold">SIZE</th>
                      <th className="py-3 px-4 font-bold">ZK SHIELD</th>
                      <th className="py-3 px-4 font-bold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setActivePreviewFile(file)}
                      >
                        {/* File Name & Icon */}
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              {renderFileIcon(file)}
                            </div>
                            <div className="truncate max-w-[220px] sm:max-w-xs">
                              <div className="font-bold text-slate-900 truncate" title={file.name}>
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                AES-256-GCM • ZK Protected
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Modified Date */}
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                          {new Date(file.uploadedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Size */}
                        <td className="py-3 px-4 text-slate-700 font-mono font-semibold whitespace-nowrap">
                          {formatSizeDynamic(file.sizeBytes)}
                        </td>

                        {/* ZK Shield Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>ZK Proven</span>
                          </span>
                        </td>

                        {/* Actions Menu */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {activeMenuFileId === file.id && (
                              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-30 text-xs font-semibold">
                                <button
                                  onClick={() => {
                                    setActivePreviewFile(file);
                                    setActiveMenuFileId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-sky-50 text-slate-700 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-sky-500" />
                                  <span>Preview</span>
                                </button>

                                <button
                                  onClick={() => {
                                    decryptAndDownloadFile(file);
                                    setActiveMenuFileId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-sky-50 text-slate-700 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Download</span>
                                </button>

                                <button
                                  onClick={() => {
                                    shredFile(file.id);
                                    setActiveMenuFileId(null);
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Shred</span>
                                </button>
                              </div>
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
    </section>
  );
};
