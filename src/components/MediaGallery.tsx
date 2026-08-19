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
  Folder,
  FolderArchive,
  Users,
  MapPin,
  Cloud,
  Settings,
  Share2,
  CheckSquare,
  MoreHorizontal,
  Grid,
  Layers,
  ChevronDown,
  Minus,
  Square,
  X
} from 'lucide-react';

interface MediaTileProps {
  file: ShieldedFile;
  category: 'image' | 'video' | 'audio' | 'doc';
  gridDensity: 'small' | 'medium' | 'large';
  index: number;
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
  index,
  isSelected = false,
  onSelectToggle,
  isSelectionMode = false,
  onClick,
  onSave,
  onDelete,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const isShredded = file.status === 'shredded';
  const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  useEffect(() => {
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
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file.id]);

  // Determine span classes for masonry grid look (matching reference)
  const isLargeFeature = (index === 0 || index === 8 || index === 14) && gridDensity === 'medium';
  const isWideFeature = (index === 3 || index === 11) && gridDensity === 'medium';

  return (
    <div
      onClick={isSelectionMode ? onSelectToggle : onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 bg-slate-100 shadow-xs hover:shadow-md ${
        isLargeFeature
          ? 'col-span-2 row-span-2 h-72 sm:h-80'
          : isWideFeature
          ? 'col-span-2 h-36 sm:h-40'
          : gridDensity === 'small'
          ? 'h-28 sm:h-32'
          : gridDensity === 'large'
          ? 'h-52 sm:h-64'
          : 'h-36 sm:h-40'
      } ${isSelected ? 'ring-3 ring-rose-500 scale-[0.98]' : 'hover:scale-[1.01]'}`}
    >
      {/* Visual Content */}
      {category === 'image' ? (
        blobUrl ? (
          <img
            src={blobUrl}
            alt={file.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-sky-100 to-indigo-50 text-slate-700">
            <ImageIcon className="w-8 h-8 text-sky-500 mb-1" />
            <span className="text-[10px] font-bold truncate max-w-full">{file.name}</span>
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
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-tr from-purple-100 to-pink-50 text-slate-700">
            <Film className="w-8 h-8 text-purple-500 mb-1" />
            <span className="text-[10px] font-bold truncate max-w-full">{file.name}</span>
          </div>
        )
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 text-center">
          <FileText className="w-8 h-8 text-amber-500 mb-1" />
          <span className="text-xs font-bold text-slate-800 truncate max-w-full">{file.name}</span>
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-2.5 text-white">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold uppercase">
            {ext}
          </span>
          <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-md">
            {sizeMB} MB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold truncate max-w-[130px] drop-shadow-sm">
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

  const [activeSidebarTab, setActiveSidebarTab] = useState<'photos' | 'albums' | 'folders' | 'memories' | 'people' | 'locations'>('photos');
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

  const filteredMedia = useMemo(() => {
    return activeFiles.filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeSidebarTab === 'albums') {
        return getMediaCategory(f) === 'image' || getMediaCategory(f) === 'video';
      }
      return true;
    });
  }, [activeFiles, searchQuery, activeSidebarTab]);

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

  // Grouping timeline header
  const timelineDateString = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - ${filteredMedia.length} shielded photos`;
  }, [filteredMedia.length]);

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
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
      />

      {/* Main Microsoft Photos Redesign Window Frame */}
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] flex flex-col md:flex-row overflow-hidden min-h-[820px] text-slate-800 relative">
        
        {/* ============================================================ */}
        {/* 1. LEFT SIDEBAR: User Profile & Photos Navigation            */}
        {/* ============================================================ */}
        <aside className="md:w-60 bg-gradient-to-b from-slate-50/90 via-rose-50/30 to-slate-50/90 border-r border-slate-200/80 p-5 flex flex-col justify-between flex-shrink-0">
          <div className="space-y-6">
            
            {/* Top User Profile (Matching Reference: Aroha / Avatar) */}
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

            {/* Section 1: Library */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Library
              </div>

              <button
                onClick={() => setActiveSidebarTab('photos')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'photos'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {/* Active Coral Indicator Bar (Matching Reference) */}
                {activeSidebarTab === 'photos' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <ImageIcon className={`w-4 h-4 ${activeSidebarTab === 'photos' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Photos</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('albums')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'albums'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {activeSidebarTab === 'albums' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <FolderArchive className={`w-4 h-4 ${activeSidebarTab === 'albums' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Albums</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('folders')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'folders'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {activeSidebarTab === 'folders' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <Folder className={`w-4 h-4 ${activeSidebarTab === 'folders' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Folders</span>
              </button>
            </div>

            {/* Section 2: Collections */}
            <div className="space-y-1 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                Collections
              </div>

              <button
                onClick={() => setActiveSidebarTab('memories')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'memories'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {activeSidebarTab === 'memories' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <Clock className={`w-4 h-4 ${activeSidebarTab === 'memories' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Memories</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('people')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'people'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {activeSidebarTab === 'people' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <Users className={`w-4 h-4 ${activeSidebarTab === 'people' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>People</span>
              </button>

              <button
                onClick={() => setActiveSidebarTab('locations')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                  activeSidebarTab === 'locations'
                    ? 'text-slate-900 bg-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {activeSidebarTab === 'locations' && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-rose-500 rounded-r-full" />
                )}
                <MapPin className={`w-4 h-4 ${activeSidebarTab === 'locations' ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>Locations</span>
              </button>
            </div>

            {/* Section 3: Storage */}
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
        {/* 2. MAIN CENTER: Microsoft Photos Redesign Photo Wall         */}
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
                  title="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                  Photos
                </h1>
              </div>

              {/* Top Quick Actions (Matching Reference) */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-500" />
                  <span>New Photo</span>
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
                      alert(`Sharing ${selectedIds.length} zero-knowledge shielded photo links!`);
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                {/* Search Bar (Matching Reference) */}
                <div className="relative w-44 sm:w-56">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Photos"
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

            {/* Timeline Header & Density Switcher (Matching Reference) */}
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
                  title="Medium Grid (Masonry)"
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

            {/* Seamless Photographic Grid Wall (Matching Reference Photo Wall) */}
            {filteredMedia.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-12 sm:p-16 rounded-3xl border-2 border-dashed border-slate-200 hover:border-rose-400 bg-slate-50/50 hover:bg-rose-50/20 text-center transition-all cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-sm text-slate-800">
                  No photos in vault yet
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click anywhere here to upload and envelope-encrypt your photos with client-side zero-knowledge proofs.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all"
                >
                  + Upload Photos Now
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-2.5 sm:gap-3 ${
                  gridDensity === 'small'
                    ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'
                    : gridDensity === 'large'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                }`}
              >
                {filteredMedia.map((file, idx) => (
                  <MediaTile
                    key={file.id}
                    file={file}
                    category={getMediaCategory(file)}
                    gridDensity={gridDensity}
                    index={idx}
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
              <span>AES-256-GCM Envelope Encryption Enabled</span>
            </div>
            <span>{filteredMedia.length} Photos in Shielded Ledger</span>
          </div>
        </main>
      </div>
    </section>
  );
};
