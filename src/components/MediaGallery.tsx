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
  Play,
  Maximize2,
  UploadCloud,
  CheckCircle2,
  Search,
  ArrowLeft,
  Loader2,
  Plus,
  Lock,
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
    if (lower.endsWith('.pdf')) return <FileText className="w-10 h-10 text-rose-500" />;
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.tar') || lower.endsWith('.7z')) {
      return <Archive className="w-10 h-10 text-emerald-500" />;
    }
    if (lower.endsWith('.csv') || lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      return <FileSpreadsheet className="w-10 h-10 text-green-600" />;
    }
    if (lower.endsWith('.json') || lower.endsWith('.js') || lower.endsWith('.ts') || lower.endsWith('.py') || lower.endsWith('.html') || lower.endsWith('.css') || lower.endsWith('.md')) {
      return <FileCode className="w-10 h-10 text-teal-600" />;
    }
    return <FileCheck className="w-10 h-10 text-sky-500" />;
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 hover:border-sky-400 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Thumbnail Window / Card Header */}
      <div className="relative w-full h-40 sm:h-48 bg-slate-100/70 flex items-center justify-center overflow-hidden border-b border-slate-200/80">
        {category === 'image' ? (
          blobUrl ? (
            <img
              src={blobUrl}
              alt={file.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-center p-4">
              <ImageIcon className="w-10 h-10 text-sky-500 mx-auto opacity-75 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Photo Shard</span>
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
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <Film className="w-10 h-10 text-violet-500 mx-auto opacity-75 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-semibold text-slate-500 mt-1 block">Video Shard</span>
            </div>
          )
        ) : category === 'audio' ? (
          <div className="text-center p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Music className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-emerald-700 block font-bold">Audio Shard</span>
          </div>
        ) : (
          <div className="text-center p-4 space-y-2">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 group-hover:border-sky-300 transition-colors inline-block">
              {renderDocIcon()}
            </div>
            <span className="text-[10px] text-slate-600 block uppercase font-bold">
              {ext} FILE
            </span>
          </div>
        )}

        {/* Top Left Format Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
          <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-bold uppercase text-slate-800 shadow-xs">
            {ext}
          </span>
          {isShredded && (
            <span className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600">
              REVOKED
            </span>
          )}
        </div>

        {/* Top Right Size Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
            {sizeMB} MB
          </span>
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
          <span className="text-[11px] text-white flex items-center gap-1 font-bold">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click to Enlarge</span>
          </span>

          <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
            {!isShredded && (
              <button
                onClick={onSave}
                title="Decrypt & Download"
                className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onDelete}
              title="Delete permanently"
              className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Body Info */}
      <div className="p-4 flex flex-col justify-between flex-1 space-y-3 bg-white">
        <div>
          <h3
            className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-sky-600 transition-colors"
            title={file.name}
          >
            {file.name}
          </h3>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ZK Shielded
            </span>
          </div>
        </div>

        {/* Card Footer Key Metadata */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center space-x-1">
            <Lock className="w-3 h-3 text-sky-500" />
            <span>AES-256</span>
          </div>
          <span className="text-sky-600 font-semibold group-hover:underline">Open ↗</span>
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
    <section
      className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all"
      style={{
        backgroundImage: 'url(/aurora-bg.jpg)',
        backgroundColor: '#EBF4FF',
      }}
    >
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] p-6 sm:p-8 space-y-6 text-slate-800">
        
        {/* Top Header with Back Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Media & Files Vault</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                  {files.length} Objects
                </span>
              </h1>
              <span className="text-xs text-slate-400">
                Personal Shielded Storage • Quota {session.quotaGB} GB Allocated
              </span>
            </div>
          </div>

          {/* Action Button: Direct Upload */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="rounded-2xl p-5 border border-sky-300 bg-sky-50/90 shadow-md space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 truncate max-w-sm">
                Encrypting & Uploading: {uploadFileName} ({uploadFileSizeMB} MB)
              </span>
              <span className="text-sky-600 font-black">{uploadProgress}%</span>
            </div>
            <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-sky-200">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-150"
              />
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-sky-700 font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
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
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">
            Drag & drop any Photo, Video, PDF, DOC, or Code file here
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            All formats (JPG, PNG, MP4, PDF, DOCX, ZIP, TXT) are envelope-encrypted with AES-256-GCM.
          </p>
        </div>

        {/* Gallery Filter & Search Control Bar */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeCategory === 'all'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All ({activeFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('photos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeCategory === 'photos'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Photos ({photoFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('videos')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeCategory === 'videos'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos ({videoFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('audio')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeCategory === 'audio'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio ({audioFiles.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('files')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeCategory === 'files'
                  ? 'bg-sky-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Docs ({docFiles.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by file name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Media Grid Cards */}
        {filteredMedia.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto shadow-xs">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No media items found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload photos, videos, or documents to store them in your zero-knowledge shielded vault partition.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
        )}
      </div>
    </section>
  );
};
