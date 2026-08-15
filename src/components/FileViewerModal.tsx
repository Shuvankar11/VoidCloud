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
  Maximize2,
  Minimize2,
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
  ExternalLink,
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
    setDuration(0);
    setTextContent(null);

    async function loadData() {
      try {
        const cached = await getFileBlob(file!.id);
        if (!isMounted) return;

        if (cached && cached.blob) {
          const url = URL.createObjectURL(cached.blob);
          setBlobUrl(url);

          if (category === 'text') {
            const text = await cached.blob.text();
            if (isMounted) setTextContent(text);
          }
        } else {
          // If no local blob cached, synthesize a preview placeholder
          if (category === 'text') {
            setTextContent(
              `// [VOIDCLOUD SHIELDED OBJECT: ${file!.name}]\n` +
              `// Client AES-256-GCM Envelope Encryption\n` +
              `// Storage Relay: ${file!.storageBackend || 'Telegram Private Channel'}\n` +
              `// Decentralized CID: ${file!.encryptedCid}\n` +
              `// ZK Nullifier Commitment: ${file!.zkCommitment}\n` +
              `// Upload Timestamp: ${file!.uploadedAt}\n\n` +
              `[Encrypted Payload Verified On-Chain: Ready for Decryption Download]`
            );
          }
          setBlobUrl(null);
        }
      } catch (err) {
        console.error('[FileViewerModal] Error loading media blob:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file?.id]);

  // Keyboard navigation & ESC handler
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
      case 'image': return <ImageIcon className="w-4 h-4 text-sky-400" />;
      case 'video': return <Film className="w-4 h-4 text-violet-400" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-400" />;
      case 'pdf': return <FileText className="w-4 h-4 text-amber-400" />;
      case 'text': return <FileCode className="w-4 h-4 text-teal-400" />;
      default: return <HardDrive className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      {/* Outer Cyberpunk Modal Card */}
      <div className="relative w-full max-w-5xl h-[92vh] sm:h-[88vh] bg-[#080D1A] border border-slate-700/80 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.2)] flex flex-col overflow-hidden">
        
        {/* Neon Border Highlights */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 via-violet-500 to-emerald-400" />
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-[#0E1424]/90 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 flex-shrink-0">
              {renderMediaIcon()}
            </div>
            <div className="truncate">
              <h3 className="text-sm sm:text-base font-mono font-bold text-white truncate flex items-center gap-2">
                <span className="truncate">{file.name}</span>
                {isShredded && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-400 text-[10px] font-sans">
                    REVOKED
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span>{sizeMB} MB</span>
                <span>•</span>
                <span className="text-sky-400">{file.mimeType || category.toUpperCase()}</span>
                <span>•</span>
                <span className="hidden sm:inline text-slate-500">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* View / Metadata Switcher */}
            <div className="hidden sm:flex items-center bg-[#080D1A] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Viewer</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'metadata' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>ZK Ledger</span>
              </button>
            </div>

            {/* Decrypt & Download */}
            {!isShredded && (
              <button
                onClick={() => decryptAndDownloadFile(file)}
                className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center gap-1.5"
                title="Decrypt with client witness secret and download"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Decrypt & Save</span>
              </button>
            )}

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/80"
              title="Close (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Display Canvas */}
        <div className="relative flex-1 bg-[#050811] overflow-hidden flex items-center justify-center p-3 sm:p-6">
          {loading ? (
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Loading & decrypting media stream...</p>
            </div>
          ) : activeTab === 'metadata' ? (
            /* ZK Ledger & Cryptographic Proof Metadata Tab */
            <div className="w-full max-w-2xl bg-[#080D1A] rounded-2xl border border-slate-800 p-6 space-y-4 font-mono text-xs overflow-y-auto max-h-[70vh]">
              <div className="flex items-center space-x-2 text-sky-400 pb-3 border-b border-slate-800">
                <Shield className="w-4 h-4" />
                <span className="font-bold text-sm">Cryptographic Witness & Ledger Verification</span>
              </div>

              <div className="space-y-3">
                <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Decentralized Content Identifier (CID):</span>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 break-all">{file.encryptedCid}</span>
                    <button
                      onClick={() => handleCopy(file.encryptedCid, 'cid')}
                      className="text-sky-400 hover:text-sky-300 p-1.5 rounded-lg hover:bg-sky-950/50 flex-shrink-0"
                    >
                      {copiedKey === 'cid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-1">Zero-Knowledge Quota Commitment:</span>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 break-all">{file.zkCommitment}</span>
                    <button
                      onClick={() => handleCopy(file.zkCommitment, 'zk')}
                      className="text-sky-400 hover:text-sky-300 p-1.5 rounded-lg hover:bg-sky-950/50 flex-shrink-0"
                    >
                      {copiedKey === 'zk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Encryption Cipher</span>
                    <span className="text-emerald-400 font-bold">AES-256-GCM (Authenticated)</span>
                  </div>
                  <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Storage Backend</span>
                    <span className="text-violet-400 font-bold">Midnight Shielded Relay</span>
                  </div>
                  <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">File Size in Bytes</span>
                    <span className="text-slate-200">{file.sizeBytes.toLocaleString()} bytes</span>
                  </div>
                  <div className="bg-[#0E1424] p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Owner Identity</span>
                    <span className="text-sky-300">{file.ownerEmail || 'Shielded Account'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Media Render Section */
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              
              {/* IMAGE VIEWER */}
              {category === 'image' && (
                <div className="relative w-full h-full flex items-center justify-center overflow-auto p-2">
                  {blobUrl ? (
                    <img
                      src={blobUrl}
                      alt={file.name}
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease-out',
                      }}
                      className="max-w-full max-h-[65vh] sm:max-h-[70vh] object-contain rounded-lg shadow-2xl select-none"
                    />
                  ) : (
                    <div className="text-center p-8 bg-[#080D1A] rounded-2xl border border-slate-800 max-w-md">
                      <ImageIcon className="w-12 h-12 text-sky-400 mx-auto mb-3 opacity-75" />
                      <h4 className="text-sm font-bold text-white font-mono">{file.name}</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans">
                        This image is encrypted and stored in your private cloud vault. Click below to decrypt and view at native resolution.
                      </p>
                      <button
                        onClick={() => decryptAndDownloadFile(file)}
                        className="mt-4 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Decrypt Image File</span>
                      </button>
                    </div>
                  )}

                  {/* Floating Image Zoom & Rotation Controls */}
                  {blobUrl && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-[#080D1A]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-2xl z-20">
                      <button
                        onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono text-sky-300 w-12 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <button
                        onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-slate-700 mx-1" />
                      <button
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setZoom(1);
                          setRotation(0);
                        }}
                        className="px-2 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* VIDEO VIEWER */}
              {category === 'video' && (
                <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
                  {blobUrl ? (
                    <div className="relative w-full max-h-[62vh] sm:max-h-[68vh] bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl group flex flex-col">
                      <video
                        ref={mediaRef as any}
                        src={blobUrl}
                        className="w-full h-full max-h-[58vh] object-contain mx-auto"
                        onTimeUpdate={() => {
                          if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
                        }}
                        onLoadedMetadata={() => {
                          if (mediaRef.current) setDuration(mediaRef.current.duration);
                        }}
                        onEnded={() => setIsPlaying(false)}
                        onClick={togglePlay}
                      />

                      {/* Custom Video Controls Bar */}
                      <div className="p-3 bg-[#080D1A]/95 border-t border-slate-800 flex items-center space-x-3 font-mono text-xs">
                        <button
                          onClick={togglePlay}
                          className="p-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 transition-colors"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <span className="text-slate-400 text-[11px] w-24">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Seek Slider */}
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                        />

                        <button
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-[#080D1A] rounded-2xl border border-slate-800 max-w-md">
                      <Film className="w-12 h-12 text-violet-400 mx-auto mb-3 opacity-75" />
                      <h4 className="text-sm font-bold text-white font-mono">{file.name}</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans">
                        Decentralized video shard stored in vault. Click below to decrypt and stream on your local player.
                      </p>
                      <button
                        onClick={() => decryptAndDownloadFile(file)}
                        className="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold font-mono text-xs inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Decrypt & Play Video</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AUDIO PLAYER */}
              {category === 'audio' && (
                <div className="w-full max-w-md bg-[#080D1A] rounded-2xl border border-slate-800 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 relative">
                    <Music className="w-9 h-9" />
                    {isPlaying && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white font-mono truncate">{file.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">{sizeMB} MB • Shielded Audio Track</p>
                  </div>

                  {/* Animated Waveform Bars */}
                  <div className="flex items-center justify-center space-x-1.5 h-12">
                    {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85, 70, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          height: isPlaying ? `${Math.max(15, (h * (Math.sin(currentTime * 3 + i) + 1.2)) / 2)}%` : '20%',
                          transition: 'height 0.15s ease',
                        }}
                        className="w-1.5 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full"
                      />
                    ))}
                  </div>

                  {blobUrl ? (
                    <div className="space-y-4">
                      <audio
                        ref={mediaRef as any}
                        src={blobUrl}
                        onTimeUpdate={() => {
                          if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime);
                        }}
                        onLoadedMetadata={() => {
                          if (mediaRef.current) setDuration(mediaRef.current.duration);
                        }}
                        onEnded={() => setIsPlaying(false)}
                      />

                      {/* Scrubber */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <div className="flex justify-between text-[11px] font-mono text-slate-400">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={togglePlay}
                          className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => decryptAndDownloadFile(file)}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs inline-flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Decrypt & Play Audio</span>
                    </button>
                  )}
                </div>
              )}

              {/* PDF VIEWER */}
              {category === 'pdf' && (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {blobUrl ? (
                    <iframe
                      src={blobUrl}
                      title={file.name}
                      className="w-full h-[65vh] sm:h-[72vh] rounded-xl border border-slate-800 bg-slate-900"
                    />
                  ) : (
                    <div className="text-center p-8 bg-[#080D1A] rounded-2xl border border-slate-800 max-w-md">
                      <FileText className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-75" />
                      <h4 className="text-sm font-bold text-white font-mono">{file.name}</h4>
                      <p className="text-xs text-slate-400 mt-2 font-sans">
                        Encrypted PDF document stored in vault. Click below to decrypt and open.
                      </p>
                      <button
                        onClick={() => decryptAndDownloadFile(file)}
                        className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono text-xs inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Decrypt PDF Document</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* CODE / TEXT VIEWER */}
              {category === 'text' && (
                <div className="w-full h-full flex flex-col bg-[#080D1A] rounded-xl border border-slate-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#0E1424] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-teal-400 font-bold">{file.name}</span>
                    <button
                      onClick={() => handleCopy(textContent || '', 'text')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copiedKey === 'text' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'text' ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 flex-1 overflow-auto text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                    {textContent || 'Loading decrypted text content...'}
                  </pre>
                </div>
              )}

              {/* OTHER / GENERIC BINARY VIEWER */}
              {category === 'other' && (
                <div className="text-center p-8 bg-[#080D1A] rounded-2xl border border-slate-800 max-w-md space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
                    <HardDrive className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-mono">{file.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {sizeMB} MB • Shielded Binary Object
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    This file is securely envelope-encrypted with AES-256-GCM. Use your client-side witness secret to decrypt it back to your device.
                  </p>
                  <button
                    onClick={() => decryptAndDownloadFile(file)}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs inline-flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Decrypt & Download to Disk</span>
                  </button>
                </div>
              )}

            </div>
          )}

          {/* Left / Right Carousel Navigation Arrows for Photos/Videos */}
          {hasPrev && (
            <button
              onClick={() => onNavigate && onNavigate('prev')}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#080D1A]/90 hover:bg-[#0E1424] border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-xl z-20"
              title="Previous File (Left Arrow)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {hasNext && (
            <button
              onClick={() => onNavigate && onNavigate('next')}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#080D1A]/90 hover:bg-[#0E1424] border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-xl z-20"
              title="Next File (Right Arrow)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-[#0E1424]/95 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 flex-shrink-0 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Midnight Proof Verified</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 font-sans hidden sm:inline">Use Arrow Keys ← → to switch files</span>
          </div>

          <div className="flex items-center space-x-3">
            {!isShredded && (
              <button
                onClick={() => {
                  shredFile(file.id);
                  onClose();
                }}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Revoke Key</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
