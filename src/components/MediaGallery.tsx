import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { ShieldedFile } from '../types';
import { getFileBlob } from '../services/vaultIndexedDB';
import {
  Image as ImageIcon,
  Film,
  Music,
  FileText,
  FileCode,
  Archive,
  FileSpreadsheet,
  FileCheck,
  Eye,
  Download,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  HardDrive,
  Shield,
  Play,
  Maximize2,
  UploadCloud,
  CheckCircle2,
  Search,
  ArrowLeft,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface MediaCardProps {
  file: ShieldedFile;
  category: 'image' | 'video' | 'audio' | 'doc';
  onClick: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  file,
  category,
  onClick,
  onSave,
  onDelete,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const isShredded = file.status === 'shredded';
  const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
  const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  const formattedDate = new Date(file.uploadedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(file.uploadedAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

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
        console.warn('[MediaCard] Error loading blob:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file.id]);

  const renderDocIcon = () => {
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.pdf')) return <FileText className="w-10 h-10 text-rose-400" />;
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.tar') || lower.endsWith('.7z')) {
      return <Archive className="w-10 h-10 text-amber-400" />;
    }
    if (lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      return <FileSpreadsheet className="w-10 h-10 text-emerald-400" />;
    }
    if (lower.endsWith('.json') || lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.py') || lower.endsWith('.html') || lower.endsWith('.css') || lower.endsWith('.md')) {
      return <FileCode className="w-10 h-10 text-teal-400" />;
    }
    return <FileCheck className="w-10 h-10 text-sky-400" />;
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0B1120] hover:bg-[#0E1629] rounded-2xl border border-slate-800/90 hover:border-sky-500/60 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(56,189,248,0.2)] overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Thumbnail Window / Card Header */}
      <div className="relative w-full h-40 sm:h-48 bg-[#050811] flex items-center justify-center overflow-hidden border-b border-slate-800/80">
        
        {category === 'image' ? (
          blobUrl ? (
            <img
              src={blobUrl}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-10 h-10 text-sky-400 mx-auto opacity-75 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">Photo Shard</span>
            </div>
          )
        ) : category === 'video' ? (
          blobUrl ? (
            <div className="relative w-full h-full">
              <video
                src={blobUrl}
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                muted
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-sky-500/90 hover:bg-sky-400 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.6)] group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Film className="w-10 h-10 text-violet-400 mx-auto opacity-75 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">Video Shard</span>
            </div>
          )
        ) : category === 'audio' ? (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Music className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-mono text-emerald-300 block font-semibold">Audio Shard</span>
          </div>
        ) : (
          <div className="text-center p-4 space-y-2">
            <div className="p-3 rounded-2xl bg-[#0E1424] border border-slate-800 group-hover:border-sky-500/40 transition-colors inline-block">
              {renderDocIcon()}
            </div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
              {ext} FILE
            </span>
          </div>
        )}

        {/* Top Left Format Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-md bg-[#080D1A]/90 border border-slate-700/80 text-[10px] font-mono font-bold uppercase text-sky-300 shadow-md backdrop-blur-md">
            {ext}
          </span>
          {isShredded && (
            <span className="px-2 py-0.5 rounded-md bg-rose-950/90 border border-rose-500/40 text-[10px] font-mono text-rose-300">
              REVOKED
            </span>
          )}
        </div>

        {/* Top Right Size Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-md bg-black/80 border border-slate-700/80 text-[10px] font-mono text-slate-300 backdrop-blur-md">
            {sizeMB} MB
          </span>
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
          <span className="text-[11px] font-mono text-sky-300 flex items-center gap-1 font-bold">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click to Enlarge</span>
          </span>

          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
            {!isShredded && (
              <button
                onClick={onSave}
                title="Decrypt & Download"
                className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onDelete}
              title="Delete permanently"
              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* File Name */}
          <h4
            className={`text-xs font-mono font-bold truncate transition-colors ${
              isShredded ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-sky-300'
            }`}
            title={file.name}
          >
            {file.name}
          </h4>

          {/* Date & Time */}
          <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400 mt-1">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center space-x-1 text-emerald-400">
            <Shield className="w-3 h-3" />
            <span>AES-256-GCM</span>
          </div>

          <span className="text-sky-400 group-hover:underline">Open ↗</span>
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

  const [activeCategory, setActiveCategory] = useState<'all' | 'photos' | 'videos' | 'audio' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState(0);
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
      setUploadStage('Encrypting and shielding file in vault...');

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

  const activeFiles = files.filter(f => f.status === 'shielded');
  const photoFiles = activeFiles.filter(f => getMediaCategory(f) === 'image');
  const videoFiles = activeFiles.filter(f => getMediaCategory(f) === 'video');
  const audioFiles = activeFiles.filter(f => getMediaCategory(f) === 'audio');
  const docFiles = activeFiles.filter(f => getMediaCategory(f) === 'doc');

  const filteredMedia = files.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const cat = getMediaCategory(f);
    if (activeCategory === 'photos') return cat === 'image';
    if (activeCategory === 'videos') return cat === 'video';
    if (activeCategory === 'audio') return cat === 'audio';
    if (activeCategory === 'files') return cat === 'doc';
    return true;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Top Header with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveView('home')}
            className="p-2.5 rounded-xl bg-[#0E1424] hover:bg-[#141D30] border border-slate-700 hover:border-sky-500 text-sky-400 hover:text-white transition-all flex items-center gap-2 text-xs font-mono font-bold shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
              <span>Media & Files Vault</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 font-mono text-xs font-normal">
                {files.length} Objects
              </span>
            </h1>
            <span className="text-xs font-mono text-slate-400">
              Personal Shielded Storage • Partition {session.shieldedAddress.slice(0, 14)}...
            </span>
          </div>
        </div>

        {/* Action Button: Direct Upload */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photos / Files</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Live Upload Progress Bar if Uploading */}
      {isUploading && (
        <div className="cloud-card rounded-2xl p-6 border border-sky-500/50 bg-[#080D1A] shadow-[0_0_30px_rgba(56,189,248,0.25)] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-white truncate max-w-sm">
              Encrypting & Uploading: {uploadFileName} ({uploadFileSizeMB} MB)
            </span>
            <span className="text-sky-300 font-extrabold">{uploadProgress}%</span>
          </div>
          <div className="h-2.5 w-full bg-[#0E1424] rounded-full overflow-hidden border border-slate-700/80">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_15px_rgba(56,189,248,0.6)]"
            />
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-sky-300">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>{uploadStage}</span>
          </div>
        </div>
      )}

      {/* Drag & Drop Quick Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleFileDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-2xl p-6 sm:p-7 border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-400 bg-sky-950/30'
            : 'border-slate-800 hover:border-sky-500/50 bg-[#080D1A]/80'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-2 text-sky-400">
          <UploadCloud className="w-5 h-5" />
        </div>
        <h3 className="text-xs sm:text-sm font-semibold text-white font-mono">
          Drag & drop any Photo, Video, PDF, DOC, or Code file here
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
          All formats (JPG, PNG, MP4, PDF, DOCX, ZIP, TXT) are envelope-encrypted with AES-256-GCM.
        </p>
      </div>

      {/* Gallery Filter & Search Control Bar */}
      <div className="cloud-card rounded-2xl border border-slate-700/80 bg-[#080D1A]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center bg-[#0E1424] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Items ({activeFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('photos')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeCategory === 'photos'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Photos ({photoFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('videos')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeCategory === 'videos'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-violet-400" />
            <span>Videos ({videoFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('audio')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeCategory === 'audio'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audio ({audioFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('files')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeCategory === 'files'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Files & Docs ({docFiles.length})</span>
          </button>
        </div>

        {/* Search Media Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0E1424] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/60 font-mono"
          />
        </div>
      </div>

      {/* Grid of Small Media & File Boxes */}
      {filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredMedia.map((file) => (
            <MediaCard
              key={file.id}
              file={file}
              category={getMediaCategory(file)}
              onClick={() => setActivePreviewFile(file)}
              onSave={() => decryptAndDownloadFile(file)}
              onDelete={() => deleteFilePermanently(file.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-[#080D1A]/80 rounded-2xl border border-slate-800/80 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <FolderOpen className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-mono">No Items in this Category</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-sans">
              {activeCategory === 'photos'
                ? 'No photos uploaded yet. Upload .jpg, .png or .webp files.'
                : activeCategory === 'videos'
                ? 'No videos uploaded yet. Upload .mp4 or .webm files.'
                : activeCategory === 'files'
                ? 'No documents uploaded yet. Upload .pdf, .docx, .zip, or code files.'
                : 'Upload any file above to preview it in this vault.'}
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload First File</span>
          </button>
        </div>
      )}

    </div>
  );
};
