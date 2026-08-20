import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { ShieldedFile } from '../types';
import { getFileBlob } from '../services/vaultIndexedDB';
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  FileCode,
  Archive,
  Eye,
  Download,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Play,
  Maximize2,
  UploadCloud,
  CheckCircle2,
  Search,
  ArrowLeft,
  Loader2,
  Plus,
  Lock,
  Cloud,
  Settings,
  Share2,
  CheckSquare,
  Grid,
  Layers,
  Square,
  X,
  Volume2,
} from 'lucide-react';

interface MediaTileProps {
  file: ShieldedFile;
  category: 'image' | 'video' | 'audio' | 'doc';
  gridDensity: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  onSelectToggle?: () => void;
  isSelectionMode?: boolean;
  onClick: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const MediaTile: React.FC<MediaTileProps> = ({
  file,
  category,
  gridDensity,
  isSelected = false,
  onSelectToggle,
  isSelectionMode = false,
  onClick,
  onSave,
  onDelete,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(file.previewDataUrl || null);
  const isShredded = file.status === 'shredded';
  const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  useEffect(() => {
    if (file.previewDataUrl) {
      setBlobUrl(file.previewDataUrl);
      return;
    }
    let isMounted = true;
    async function load() {
      try {
        const cached = await getFileBlob(file.id);
        if (isMounted && cached && cached.blob) {
          const url = URL.createObjectURL(cached.blob);
          setBlobUrl(url);
        }
      } catch (err) {
        console.warn('[MediaTile] Error loading blob:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
      if (blobUrl && !file.previewDataUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file.id, file.previewDataUrl]);

  const heightClass =
    gridDensity === 'small'
      ? 'h-32 sm:h-36'
      : gridDensity === 'large'
      ? 'h-64 sm:h-72'
      : 'h-44 sm:h-52';

  const activeImageUrl = file.previewDataUrl || blobUrl;

  return (
    <div
      onClick={isSelectionMode ? onSelectToggle : onClick}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 bg-slate-100 shadow-xs hover:shadow-md border border-slate-200/80 ${heightClass} ${
        isSelected ? 'ring-3 ring-rose-500 scale-[0.98]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* Visual Content */}
      {category === 'image' ? (
        activeImageUrl ? (
          <img
            src={activeImageUrl}
            alt={file.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-sky-100 to-indigo-50 text-slate-700">
            <ImageIcon className="w-8 h-8 text-sky-500 mb-1" />
            <span className="text-[11px] font-bold truncate max-w-[90%]">{file.name}</span>
          </div>
        )
      ) : category === 'video' ? (
        blobUrl ? (
          <div className="relative w-full h-full">
            <video
              src={blobUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-purple-100 to-pink-50 text-slate-700">
            <Film className="w-8 h-8 text-purple-500 mb-1" />
            <span className="text-[11px] font-bold truncate max-w-[90%]">{file.name}</span>
          </div>
        )
      ) : category === 'audio' ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-indigo-50 to-purple-50 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
            <Volume2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[90%]">{file.name}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sizeMB} MB • {ext}</span>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 text-center">
          <FileText className="w-8 h-8 text-amber-500 mb-1" />
          <span className="text-xs font-bold text-slate-800 truncate max-w-[90%]">{file.name}</span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sizeMB} MB • {ext}</span>
        </div>
      )}

      {/* Top Left Selection Checkbox */}
      {isSelectionMode && (
        <div className="absolute top-2 left-2 z-20">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/80 border-slate-300'}`}>
            {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
          </div>
        </div>
      )}

      {/* Hover Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-3 text-white">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold uppercase">
            {ext}
          </span>
          <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-md">
            {sizeMB} MB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold truncate max-w-[140px] drop-shadow-sm">
            {file.name}
          </span>

          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            {!isShredded && (
              <button
                onClick={onSave}
                title="Decrypt & Download"
                className="p-1 rounded-md bg-white/90 hover:bg-white text-slate-900 shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onDelete}
              title="Delete"
              className="p-1 rounded-md bg-rose-500 hover:bg-rose-600 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MediaGallery: React.FC = () => {
  const {
    files,
    setActivePreviewFile,
    decryptAndDownloadFile,
    deleteFilePermanently,
    uploadAndEncryptFile,
    setActiveView,
    session,
  } = useVault();
  const { user } = useAuth();

  // Sidebar media filter tab: 'all' | 'photos' | 'videos' | 'songs' | 'files'
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'songs' | 'files'>('photos');
  const [gridDensity, setGridDensity] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaCategory = (f: ShieldedFile): 'image' | 'video' | 'audio' | 'doc' => {
    const name = f.name.toLowerCase();
    const mime = f.mimeType?.toLowerCase() || '';
    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv|avi|m4v)$/i.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) return 'audio';
    return 'doc';
  };

  const activeFiles = useMemo(() => files.filter((f) => f.status === 'shielded'), [files]);

  // Real Counts for Categories
  const counts = useMemo(() => {
    return {
      all: activeFiles.length,
      photos: activeFiles.filter((f) => getMediaCategory(f) === 'image').length,
      videos: activeFiles.filter((f) => getMediaCategory(f) === 'video').length,
      songs: activeFiles.filter((f) => getMediaCategory(f) === 'audio').length,
      files: activeFiles.filter((f) => getMediaCategory(f) === 'doc').length,
    };
  }, [activeFiles]);

  const filteredMedia = useMemo(() => {
    return activeFiles.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      const cat = getMediaCategory(f);
      if (activeTab === 'all') return true;
      if (activeTab === 'photos') return cat === 'image';
      if (activeTab === 'videos') return cat === 'video';
      if (activeTab === 'songs') return cat === 'audio';
      if (activeTab === 'files') return cat === 'doc';
      return true;
    });
  }, [activeFiles, searchQuery, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      setUploadProgress(10);
      setUploadStage('Encrypting and shielding media in vault...');

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

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const tabTitle =
    activeTab === 'photos'
      ? 'Photos'
      : activeTab === 'videos'
      ? 'Videos'
      : activeTab === 'songs'
      ? 'Songs & Audio'
      : activeTab === 'files'
      ? 'Documents & Files'
      : 'All Media';

  // Grouping timeline header
  const timelineDateString = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • ${filteredMedia.length} shielded ${activeTab}`;
  }, [filteredMedia.length, activeTab]);

  return (
    <section
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
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.rar,.txt"
        className="hidden"
      />

      {/* Main Microsoft Photos Redesign Window Frame */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] flex flex-col md:flex-row overflow-hidden min-h-[820px] text-slate-800 relative">
        
        {/* ============================================================ */}
        {/* 1. LEFT SIDEBAR: User Profile & Media Category Tabs          */}
        {/* ============================================================ */}
        <aside className="md:w-60 bg-gradient-to-b from-slate-50/90 via-rose-50/20 to-slate-50/90 border-r border-slate-200/80 p-5 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-6">
            
            {/* Top User Profile */}
            <div className="flex flex-col items-center text-center pt-2 pb-4 border-b border-slate-200/60">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-bold flex items-center justify-center shadow-md mb-2 overflow-hidden border-2 border-white">
                <img
                  src="/voidcloud-logo.jpg"
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-display font-black text-sm text-slate-900">
                {user?.displayName || 'Shuvankar Samanta'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">
                {user?.email || 'kgp.shuvankar112@gmail.com'}
              </p>
            </div>

            {/* Media Categories Navigation (Replaces old memories/people/locations) */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Media Library
              </div>

              {/* 1. Photos */}
              <button
                onClick={() => setActiveTab('photos')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'photos'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {activeTab === 'photos' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-full" />
                  )}
                  <ImageIcon className={`w-4 h-4 ${activeTab === 'photos' ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>Photos</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {counts.photos}
                </span>
              </button>

              {/* 2. Videos */}
              <button
                onClick={() => setActiveTab('videos')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'videos'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {activeTab === 'videos' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-full" />
                  )}
                  <Film className={`w-4 h-4 ${activeTab === 'videos' ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>Videos</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {counts.videos}
                </span>
              </button>

              {/* 3. Songs & Audio */}
              <button
                onClick={() => setActiveTab('songs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'songs'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {activeTab === 'songs' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-full" />
                  )}
                  <Music className={`w-4 h-4 ${activeTab === 'songs' ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>Songs / Audio</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {counts.songs}
                </span>
              </button>

              {/* 4. Files & Documents */}
              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'files'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {activeTab === 'files' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-full" />
                  )}
                  <FileText className={`w-4 h-4 ${activeTab === 'files' ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>Documents & Files</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {counts.files}
                </span>
              </button>

              {/* 5. All Media */}
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {activeTab === 'all' && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-rose-500 rounded-r-full" />
                  )}
                  <Layers className={`w-4 h-4 ${activeTab === 'all' ? 'text-rose-500' : 'text-slate-400'}`} />
                  <span>All Media</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {counts.all}
                </span>
              </button>
            </div>

            {/* Storage Quota Pill */}
            <div className="space-y-1 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Storage
              </div>

              <div className="px-3 py-2 rounded-xl bg-white/70 border border-slate-200/60 flex items-center justify-between text-xs font-semibold shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <Cloud className="w-4 h-4 text-sky-500" />
                  <span>Midnight ZK Vault</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                  {session.quotaGB}GB
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Settings Link & Back to Dashboard */}
          <div className="pt-4 border-t border-slate-200/60 space-y-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 2. MAIN CENTER: Media Wall & Action Bar                      */}
        {/* ============================================================ */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            
            {/* Top Windows App Header Bar (Title, Actions & Search) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              
              {/* Back Arrow & Main Title */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                  {tabTitle}
                </h1>
              </div>

              {/* Top Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-500" />
                  <span>Upload Media</span>
                </button>

                <button
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                  }}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelectionMode
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedIds.length > 0) {
                      alert(`Sharing ${selectedIds.length} zero-knowledge shielded media links!`);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Search Bar */}
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${tabTitle}...`}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100/90 border border-slate-200/60 focus:border-rose-400 focus:bg-white text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Upload Progress Bar if Uploading */}
            {isUploading && (
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{uploadStage}</span>
                  <span className="text-rose-600">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-rose-100">
                  <div
                    style={{ width: `${uploadProgress}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {/* Timeline Header & Density Switcher */}
            <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-200/50">
              <div className="text-xs font-bold text-slate-700">
                {timelineDateString}
              </div>

              {/* Density Controls (Small, Medium, Large Grid with Active Underline Indicator) */}
              <div className="flex items-center space-x-2 text-slate-400">
                <button
                  onClick={() => setGridDensity('small')}
                  className={`p-1 rounded-md transition-colors relative cursor-pointer ${
                    gridDensity === 'small' ? 'text-slate-900 font-bold' : 'hover:text-slate-700'
                  }`}
                  title="Small Grid"
                >
                  <Square className="w-3.5 h-3.5" />
                  {gridDensity === 'small' && (
                    <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setGridDensity('medium')}
                  className={`p-1 rounded-md transition-colors relative cursor-pointer ${
                    gridDensity === 'medium' ? 'text-slate-900 font-bold' : 'hover:text-slate-700'
                  }`}
                  title="Medium Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  {gridDensity === 'medium' && (
                    <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setGridDensity('large')}
                  className={`p-1 rounded-md transition-colors relative cursor-pointer ${
                    gridDensity === 'large' ? 'text-slate-900 font-bold' : 'hover:text-slate-700'
                  }`}
                  title="Large Grid"
                >
                  <Layers className="w-3.5 h-3.5" />
                  {gridDensity === 'large' && (
                    <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-rose-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Seamless Photographic Grid Wall */}
            {filteredMedia.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/20 text-center transition-all cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">
                  No {tabTitle.toLowerCase()} in vault yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click anywhere here to upload and envelope-encrypt your {tabTitle.toLowerCase()} with client-side zero-knowledge proofs.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all"
                >
                  + Upload {tabTitle} Now
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-3 sm:gap-4 ${
                  gridDensity === 'small'
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7'
                    : gridDensity === 'large'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                }`}
              >
                {filteredMedia.map((file) => (
                  <MediaTile
                    key={file.id}
                    file={file}
                    category={getMediaCategory(file)}
                    gridDensity={gridDensity}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(file.id)}
                    onSelectToggle={() => toggleSelectId(file.id)}
                    onClick={() => setActivePreviewFile(file)}
                    onSave={() => decryptAndDownloadFile(file)}
                    onDelete={() => deleteFilePermanently(file.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Bottom Floating Stats Bar */}
          <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AES-256-GCM Envelope Encryption Active</span>
            </div>
            <span>{filteredMedia.length} {tabTitle} in Shielded Ledger</span>
          </div>
        </main>
      </div>
    </section>
  );
};
