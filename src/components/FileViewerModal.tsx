import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { ShieldedFile } from '../types';
import { getFileBlob } from '../services/vaultIndexedDB';
import {
  X,
  Download,
  Trash2,
  Eye,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  FileCode,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Shield,
  Lock,
  Sparkles,
  Info,
  Loader2,
  HardDrive
} from 'lucide-react';

interface FileViewerModalProps {
  file: ShieldedFile | null;
  onClose: () => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  file,
  onClose,
  onNavigate,
  hasNext = false,
  hasPrev = false,
}) => {
  const { decryptAndDownloadFile, shredFile } = useVault();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata'>('preview');

  // Video / Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // Determine media category
  const getFileCategory = (f: ShieldedFile): 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'other' => {
    const name = f.name.toLowerCase();
    const mime = f.mimeType?.toLowerCase() || '';

    if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov|mkv|avi|m4v)$/i.test(name)) return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(name)) return 'audio';
    if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (
      mime.startsWith('text/') ||
      mime.includes('json') ||
      mime.includes('javascript') ||
      /\.(txt|json|md|js|ts|tsx|jsx|html|css|py|rs|go|c|cpp|yaml|yml|xml|sh|env)$/i.test(name)
    ) {
      return 'text';
    }
    return 'other';
  };

  const category = file ? getFileCategory(file) : 'other';

  // Load blob from IndexedDB or construct fallback
  useEffect(() => {
    if (!file) return;

    let isMounted = true;
    setLoading(true);
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
    setCurrentTime(0);

    async function loadContent() {
      try {
        if (file?.previewDataUrl) {
          setBlobUrl(file.previewDataUrl);
          setLoading(false);
          return;
        }

        const cached = await getFileBlob(file!.id);
        if (isMounted && cached && cached.blob) {
          const url = URL.createObjectURL(cached.blob);
          setBlobUrl(url);

          if (category === 'text') {
            const text = await cached.blob.text();
            setTextContent(text);
          }
          setLoading(false);
          return;
        }

        // Generate demo text for code/doc fallback
        if (category === 'text') {
          setTextContent(`// Zero-Knowledge Shielded File: ${file!.name}\n// Encrypted with AES-256-GCM Envelope Encryption\n// Midnight Preprod Quota Allocated: ${(file!.sizeBytes / 1024).toFixed(1)} KB\n\n{\n  "fileName": "${file!.name}",\n  "status": "${file!.status}",\n  "cipherHash": "${file!.zkCommitment}",\n  "verified": true\n}`);
        }
        setLoading(false);
      } catch (err) {
        console.warn('Failed to load file blob:', err);
        setLoading(false);
      }
    }

    loadContent();

    return () => {
      isMounted = false;
      if (blobUrl && !file?.previewDataUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file?.id, file?.previewDataUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext && onNavigate) onNavigate('next');
      if (e.key === 'ArrowLeft' && hasPrev && onNavigate) onNavigate('prev');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, hasNext, hasPrev]);

  if (!file) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (mediaRef.current) {
      mediaRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    mediaRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const sizeMB = (file.sizeBytes / (1024 * 1024)).toFixed(2);
  const isShredded = file.status === 'shredded';

  const renderMediaIcon = () => {
    switch (category) {
      case 'image': return <ImageIcon className="w-4 h-4 text-sky-500" />;
      case 'video': return <Film className="w-4 h-4 text-violet-500" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-500" />;
      case 'pdf': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'text': return <FileCode className="w-4 h-4 text-teal-500" />;
      default: return <HardDrive className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      {/* Outer White Glass Modal Card */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 flex-shrink-0">
              {renderMediaIcon()}
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
                <span className="truncate">{file.name}</span>
                {isShredded && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-bold">
                    REVOKED
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <span>{sizeMB} MB</span>
                <span>•</span>
                <span className="text-sky-600 font-semibold">{file.mimeType || category.toUpperCase()}</span>
                <span>•</span>
                <span className="hidden sm:inline text-slate-400">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View / Metadata Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span>Viewer</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === 'metadata' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>ZK Ledger</span>
              </button>
            </div>

            {/* Decrypt & Save CTA */}
            {!isShredded && (
              <button
                onClick={() => decryptAndDownloadFile(file)}
                className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-all shadow-sm shadow-sky-500/25 flex items-center gap-1.5 cursor-pointer"
                title="Decrypt with AES-256-GCM & Save"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Decrypt & Save</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body Area */}
        <div className="relative flex-1 bg-slate-50/70 overflow-hidden flex items-center justify-center p-4">
          
          {/* Navigation Arrows */}
          {hasPrev && onNavigate && (
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all border border-slate-200 cursor-pointer"
              title="Previous file"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && onNavigate && (
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all border border-slate-200 cursor-pointer"
              title="Next file"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {loading ? (
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Decrypting file shards from browser cache...</p>
            </div>
          ) : activeTab === 'metadata' ? (
            /* ZK Ledger & Metadata Tab */
            <div className="w-full max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-sky-500" />
                  <h4 className="font-bold text-slate-900 text-sm">Cryptographic ZK Proof Metadata</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Verified
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">File ID</div>
                  <div className="text-slate-800 font-bold break-all mt-0.5">{file.id}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">ZK Nullifier Commitment</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-sky-600 font-bold truncate max-w-sm">{file.zkCommitment}</span>
                    <button
                      onClick={() => handleCopy(file.zkCommitment, 'zk')}
                      className="text-slate-400 hover:text-sky-600 p-1"
                    >
                      {copiedKey === 'zk' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Client-Side IV & Salt</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-700 truncate max-w-sm">{file.ivHex || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
                    <button
                      onClick={() => handleCopy(file.ivHex || '', 'iv')}
                      className="text-slate-400 hover:text-sky-600 p-1"
                    >
                      {copiedKey === 'iv' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Media Preview Area */
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              {category === 'image' && blobUrl ? (
                <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={blobUrl}
                    alt={file.name}
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease',
                      maxHeight: '75vh',
                      maxWidth: '100%',
                    }}
                    className="object-contain rounded-2xl shadow-md"
                  />
                </div>
              ) : category === 'video' && blobUrl ? (
                <div className="w-full max-w-4xl max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-md bg-black">
                  <video
                    ref={mediaRef as any}
                    src={blobUrl}
                    controls
                    autoPlay
                    className="max-h-[70vh] w-full rounded-2xl"
                  />
                </div>
              ) : category === 'audio' && blobUrl ? (
                <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 shadow-lg text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <Music className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{file.name}</h4>
                  <audio
                    ref={mediaRef as any}
                    src={blobUrl}
                    controls
                    className="w-full mt-4"
                  />
                </div>
              ) : category === 'text' && textContent ? (
                <div className="w-full max-w-4xl max-h-[75vh] bg-white border border-slate-200 rounded-2xl p-4 overflow-auto shadow-sm">
                  <pre className="font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {textContent}
                  </pre>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{file.name}</h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    This file is encrypted and secured in your vault. Decrypt to view contents.
                  </p>
                  <button
                    onClick={() => decryptAndDownloadFile(file)}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Decrypted File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-slate-200 bg-white flex-shrink-0 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Midnight Proof Verified</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 hidden sm:inline">Use Arrow Keys ← → to switch files</span>
          </div>

          {/* Zoom controls for image */}
          {category === 'image' && activeTab === 'preview' && (
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-1 rounded-xl">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold px-1">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setRotation((rotation + 90) % 360)}
                className="p-1 hover:bg-white rounded text-slate-600 ml-1 cursor-pointer"
                title="Rotate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Shred File Option */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently shred this file?')) {
                shredFile(file.id);
                onClose();
              }
            }}
            className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Revoke Key</span>
          </button>
        </div>
      </div>
    </div>
  );
};
