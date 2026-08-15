import React, { useState, useRef } from 'react';
import { useVault } from '../context/VaultContext';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import {
  Cloud,
  FileText,
  ShieldCheck,
  HardDrive,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Server,
  Key,
  Database,
  ArrowUpRight,
  UserCheck,
  Lock,
  Plus,
  Coins,
  Shield,
  Loader2
} from 'lucide-react';

export const InteractiveCloudDriveHero: React.FC = () => {
  const { session, files, claimBonusWithZKProof, isGeneratingProof, uploadAndEncryptFile } = useVault();
  const { user, setIsAuthModalOpen } = useAuth();
  const { setIsPricingModalOpen } = useWeb3Wallet();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSizeMB, setUploadFileSizeMB] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCapacityBytes = session.quotaGB * 1024 * 1024 * 1024;
  const activeFiles = files.filter(f => f.status === 'shielded');
  const usedBytes = activeFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
  const percentUsed = Math.max(0.1, Math.min(100, (usedBytes / totalCapacityBytes) * 100));

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

  return (
    <div className="relative w-full max-w-xl mx-auto lg:max-w-none">
      {/* Background Soft Glow Aura */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500/15 via-blue-600/15 to-emerald-500/15 rounded-3xl blur-2xl opacity-75 pointer-events-none" />

      {/* Main Glassmorphic Real Cloud Drive Vault Console */}
      <div className="relative cloud-card rounded-2xl border border-slate-700/80 bg-[#080D1A]/95 p-5 sm:p-6 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Drive Top Window Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline pl-2 border-l border-slate-800">
              voidcloud://vault/{session.shieldedAddress.slice(0, 12)}...
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-sky-300 bg-[#0E1424] px-2.5 py-1 rounded-lg border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user ? user.displayName || user.email.split('@')[0] : 'Guest Session'}</span>
            </div>

            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="text-[11px] font-mono px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Upgrade</span>
            </button>
          </div>
        </div>

        {/* Real Cloud Storage Capacity Progress Bar */}
        <div className="bg-[#0E1424] rounded-xl p-3.5 sm:p-4 border border-slate-800/80 mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white">Active Storage Quota</span>
            </div>
            <span className="text-sky-300 font-bold">{session.quotaGB} GB Total</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full bg-[#080D1A] rounded-full overflow-hidden border border-slate-800">
            <div
              style={{ width: `${percentUsed}%` }}
              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 rounded-full transition-all duration-500"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-2">
            <span>{usedMB} MB Used ({activeFiles.length} files)</span>
            <span className="text-slate-500">{session.planName || (session.quotaGB > 20 ? 'Expanded Tier' : '20GB Standard Tier')}</span>
          </div>
        </div>

        {/* Live Uploading Progress Card OR Drag & Drop Zone */}
        {isUploading ? (
          <div className="border border-sky-500/50 rounded-xl p-5 bg-gradient-to-b from-[#0E1424] to-[#080D1A] shadow-[0_0_25px_rgba(56,189,248,0.2)]">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center space-x-2.5 truncate">
                <div className="p-2 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-mono font-bold text-white block truncate">{uploadFileName}</span>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Total Size: {uploadFileSizeMB} MB
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-sm font-mono font-extrabold text-sky-300">{uploadProgress}%</span>
                <span className="text-[10px] font-mono text-slate-500 block">
                  {currentUploadedMB} / {uploadFileSizeMB} MB
                </span>
              </div>
            </div>

            {/* Glowing Live Progress Line */}
            <div className="h-2.5 w-full bg-[#080D1A] rounded-full overflow-hidden border border-slate-700/80 relative my-2">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(56,189,248,0.6)] relative"
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full animate-ping" />
              </div>
            </div>

            {/* Current Stage Status */}
            <div className="flex items-center space-x-2 text-[11px] font-mono text-sky-300 pt-1">
              {uploadProgress < 100 ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              )}
              <span className="truncate">{uploadStage}</span>
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
            className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-sky-400 bg-sky-950/30'
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

            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-1.5 text-sky-400">
              <UploadCloud className="w-5 h-5" />
            </div>

            <h4 className="text-xs sm:text-sm font-semibold text-white font-mono">
              Drop files here or click to encrypt & upload
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
              Client-side AES-256-GCM + Decentralized Shielded Relay
            </p>
          </div>
        )}

        {/* Real Live Stored Files Preview (Top 2 items) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>Recent Vault Objects ({activeFiles.length})</span>
            <a href="#vault" className="text-sky-400 hover:text-sky-300 flex items-center gap-0.5 text-[11px]">
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {activeFiles.length > 0 ? (
            <div className="space-y-1.5">
              {activeFiles.slice(0, 2).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0E1424] border border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center space-x-2.5 truncate max-w-[220px] sm:max-w-xs">
                    <FileText className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 text-[11px]">
                    <span className="text-slate-400">{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                      SHIELDED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-3 text-center text-[11px] font-mono text-slate-500 bg-[#080D1A] rounded-xl border border-slate-800/50">
              No files uploaded yet. Drag & drop files above to start.
            </div>
          )}
        </div>

        {/* Footer Status Indicators */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Midnight Preprod: Connected</span>
          </div>

          <div className="flex items-center space-x-1 text-sky-400">
            <Shield className="w-3 h-3" />
            <span>Decentralized Shielded Relay</span>
          </div>
        </div>

      </div>
    </div>
  );
};
