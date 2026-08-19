import React, { useState, useRef } from 'react';
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
  Info,
  X,
  Grid,
  List,
  CheckCircle2,
  ChevronDown,
  UploadCloud,
  FileUp,
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock initial demo items blended with live uploaded files
  const mockPresetFiles: ShieldedFile[] = [
    {
      id: 'demo-1',
      name: 'UX Principles & Design Tokens.docx',
      sizeBytes: 678 * 1024,
      encryptedCid: 'bafybeiclk4...docx_enc',
      zkCommitment: '0x8f2a...91b0',
      uploadedAt: '2026-08-16T14:30:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    {
      id: 'demo-2',
      name: 'Dont Make Me Think (Shielded).pdf',
      sizeBytes: 14 * 1024 * 1024,
      encryptedCid: 'bafybeidmmt...pdf_enc',
      zkCommitment: '0x3c7e...4419',
      uploadedAt: '2026-08-15T11:20:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/pdf',
    },
    {
      id: 'demo-3',
      name: 'UI/UX Interactive Portfolio 2026.zip',
      sizeBytes: 1100 * 1024 * 1024,
      encryptedCid: 'bafybeifoli...zip_enc',
      zkCommitment: '0x992d...aa41',
      uploadedAt: '2026-08-14T09:15:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/zip',
    },
    {
      id: 'demo-4',
      name: 'Atomic Design System Spec.pdf',
      sizeBytes: 6 * 1024 * 1024,
      encryptedCid: 'bafybeiatom...pdf_enc',
      zkCommitment: '0x10ae...ff32',
      uploadedAt: '2026-08-13T16:45:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/pdf',
    },
    {
      id: 'demo-5',
      name: 'Midnight Compact Plugin Package.zip',
      sizeBytes: 381 * 1024 * 1024,
      encryptedCid: 'bafybeizipp...zip_enc',
      zkCommitment: '0x77ba...6201',
      uploadedAt: '2026-08-12T18:00:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/zip',
    },
    {
      id: 'demo-6',
      name: 'Actionable Guide to Starting Design System.docx',
      sizeBytes: 2 * 1024 * 1024,
      encryptedCid: 'bafybeiguide...docx_enc',
      zkCommitment: '0x44ee...9902',
      uploadedAt: '2026-08-10T10:10:00Z',
      status: 'shielded',
      encryptionAlgo: 'AES-256-GCM',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
  ];

  // Combined real + demo files
  const allVaultFiles = files.length > 0 ? files : mockPresetFiles;

  // Filtered files
  const filteredFiles = allVaultFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const mime = file.mimeType || '';
    const name = file.name.toLowerCase();

    if (activeTab === 'trash') return matchesSearch && file.status === 'shredded';
    if (file.status === 'shredded') return false;

    if (selectedCategory === 'doc') {
      return matchesSearch && (mime.includes('pdf') || mime.includes('word') || name.endsWith('.pdf') || name.endsWith('.docx') || name.endsWith('.doc'));
    }
    if (selectedCategory === 'image') {
      return matchesSearch && (mime.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg'));
    }
    if (selectedCategory === 'video') {
      return matchesSearch && (mime.startsWith('video/') || name.endsWith('.mp4') || name.endsWith('.mkv'));
    }
    if (selectedCategory === 'archive') {
      return matchesSearch && (mime.includes('zip') || mime.includes('tar') || name.endsWith('.zip') || name.endsWith('.tar'));
    }
    return matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} B`;
  };

  const getFileIcon = (file: ShieldedFile) => {
    const name = file.name.toLowerCase();
    const mime = file.mimeType || '';

    if (name.endsWith('.pdf') || mime.includes('pdf')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
          PDF
        </div>
      );
    }
    if (name.endsWith('.docx') || name.endsWith('.doc') || mime.includes('word')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
          DOC
        </div>
      );
    }
    if (name.endsWith('.zip') || name.endsWith('.tar') || mime.includes('zip')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
          ZIP
        </div>
      );
    }
    if (mime.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
      return (
        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4" />
      </div>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    setIsUploading(true);
    try {
      await uploadAndEncryptFile(selected);
    } catch (err: any) {
      alert(err.message || 'File upload and ZK proof generation failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section
      id="vault-dashboard"
      className="relative w-full min-h-screen py-8 px-2 sm:px-4 md:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all duration-300"
      style={{
        backgroundImage: 'url(/aurora-bg.jpg)',
        backgroundColor: '#EBF4FF',
      }}
    >
      {/* Hidden File Input for Clean Upload Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        id="file-upload-input"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-sky-900/10 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Unified Dashboard Container (Matching Reference 3) */}
      <div className="relative z-10 max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] overflow-hidden flex flex-col lg:flex-row text-slate-800">
        
        {/* ============================================================ */}
        {/* 1. LEFT SIDEBAR NAVIGATION                                   */}
        {/* ============================================================ */}
        <aside className="lg:w-64 bg-slate-50/90 border-r border-slate-200/80 p-5 flex flex-col justify-between flex-shrink-0">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center space-x-2.5 mb-6 px-1">
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="font-display font-black text-lg text-slate-900 tracking-tight">
                VOID<span className="text-sky-500">CLOUD</span>
              </span>
            </div>

            {/* + Add New File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all mb-6"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add New File</span>
                </>
              )}
            </button>

            {/* Navigation Menu */}
            <nav className="space-y-1 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'home'
                    ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'files'
                    ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>My Files</span>
              </button>

              <button
                onClick={() => setActiveTab('shared')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'shared'
                    ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>Shared Files</span>
              </button>

              <button
                onClick={() => setActiveTab('starred')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'starred'
                    ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </button>

              <button
                onClick={() => setActiveTab('trash')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  activeTab === 'trash'
                    ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Trash</span>
              </button>
            </nav>
          </div>

          {/* Bottom Account Indicator (Personal - Only You) */}
          <div className="mt-8 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                  P
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-800">Personal</div>
                  <div className="text-[10px] text-slate-400">Only You</div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* 2. CENTER CONTENT: QUICK ACCESS & RECENTS TABLE              */}
        {/* ============================================================ */}
        <main className="flex-1 p-5 sm:p-7 overflow-y-auto max-h-[880px]">
          
          {/* Top Search Bar & Action Toggles */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, documents or ZK proofs..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 border border-slate-200/60 focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Layout Toggles */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'grid' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewLayout === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Top Announcement Banner (Matching Reference 3) */}
          {showAnnouncement && (
            <div className="mb-6 p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200/70 text-sky-900 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Info className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span>
                  <strong>Notice:</strong> We have updated our zero-knowledge proof circuits on Midnight Preprod!
                </span>
              </div>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="text-sky-500 hover:text-sky-700 p-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Access Section */}
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-bold text-sm text-slate-900 tracking-tight">
                Quick Access
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">4 pinned vaults</span>
            </div>

            {/* Quick Access Horizontal Cards (Matching Reference 3) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Card 1: Folder */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'archive' ? 'all' : 'archive')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mb-3 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">Human Centered Design</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Encrypted Folder</div>
              </div>

              {/* Card 2: PDF */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'doc' ? 'all' : 'doc')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
                  PDF
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">Thinking With Type.pdf</div>
                <div className="text-[10px] text-slate-400 mt-0.5">14.0 MB</div>
              </div>

              {/* Card 3: DOCX */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'doc' ? 'all' : 'doc')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
                  DOC
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">Product Roadmap.docx</div>
                <div className="text-[10px] text-slate-400 mt-0.5">678 KB</div>
              </div>

              {/* Card 4: ZIP */}
              <div
                onClick={() => setSelectedCategory(selectedCategory === 'archive' ? 'all' : 'archive')}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center mb-3 shadow-xs">
                  ZIP
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">3D Illustration Pack</div>
                <div className="text-[10px] text-slate-400 mt-0.5">381 MB</div>
              </div>
            </div>
          </div>

          {/* Recents Section */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display font-bold text-sm text-slate-900 tracking-tight">
                Recents
              </h2>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Sort by:</span>
                <span className="font-bold text-slate-700">Modified Date ↓</span>
              </div>
            </div>

            {/* Recents Table View (Matching Reference 3) */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4">Name ↑</th>
                    <th className="py-3 px-4">Modified</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-center">ZK Shield</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setActivePreviewFile(file)}
                    >
                      {/* Name Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(file)}
                          <div>
                            <span className="font-bold text-slate-800 text-xs block group-hover:text-sky-600 transition-colors max-w-[220px] sm:max-w-[280px] truncate">
                              {file.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              AES-256-GCM • ZK Protected
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Modified Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(file.uploadedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* File Size */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatFileSize(file.sizeBytes)}
                      </td>

                      {/* ZK Shield Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>ZK Proven</span>
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setActiveMenuFileId(activeMenuFileId === file.id ? null : file.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="File Options"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuFileId === file.id && (
                            <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1 text-left text-xs">
                              <button
                                onClick={() => {
                                  setActivePreviewFile(file);
                                  setActiveMenuFileId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-sky-50 text-slate-700 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-sky-500" />
                                <span>Preview</span>
                              </button>

                              <button
                                onClick={() => {
                                  decryptAndDownloadFile(file);
                                  setActiveMenuFileId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-sky-50 text-slate-700 flex items-center space-x-2"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Download</span>
                              </button>

                              <button
                                onClick={() => {
                                  shredFile(file.id);
                                  setActiveMenuFileId(null);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
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
          </div>
        </main>

        {/* ============================================================ */}
        {/* 3. RIGHT SIDEBAR: STORAGE METER & BREAKDOWN                   */}
        {/* ============================================================ */}
        <aside className="lg:w-80 bg-slate-50/70 border-l border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between flex-shrink-0">
          <div>
            {/* Top User Profile */}
            <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-200/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                  {user?.email ? user.email.slice(0, 1).toUpperCase() : 'S'}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {user?.displayName || 'Shuvankar Samanta'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {user?.email || 'kgp.shuvankar112@gmail.com'}
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Storage Meter Header (Matching Reference 3) */}
            <div className="mb-6">
              <div className="flex items-baseline space-x-1.5">
                <span className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  {(session.usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  used of {session.quotaGB} GB
                </span>
              </div>

              {/* Segmented Multi-Color Progress Bar */}
              <div className="w-full h-2.5 bg-slate-200 rounded-full flex overflow-hidden mt-3 shadow-inner">
                <div style={{ width: '45%' }} className="bg-emerald-500 h-full" title="Images 45%" />
                <div style={{ width: '25%' }} className="bg-sky-500 h-full" title="Videos 25%" />
                <div style={{ width: '15%' }} className="bg-amber-400 h-full" title="Documents 15%" />
                <div style={{ width: '5%' }} className="bg-rose-400 h-full" title="Others 5%" />
              </div>
            </div>

            {/* Category Breakdown List (Matching Reference 3) */}
            <div className="space-y-3.5 mb-6 text-xs">
              {/* Images */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Images</div>
                    <div className="text-[10px] text-slate-400">1,195 files</div>
                  </div>
                </div>
                <span className="font-bold text-slate-700">12.2 GB</span>
              </div>

              {/* Videos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Videos</div>
                    <div className="text-[10px] text-slate-400">53 files</div>
                  </div>
                </div>
                <span className="font-bold text-slate-700">6.1 GB</span>
              </div>

              {/* Documents */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Documents</div>
                    <div className="text-[10px] text-slate-400">486 files</div>
                  </div>
                </div>
                <span className="font-bold text-slate-700">1.7 GB</span>
              </div>

              {/* Others */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Archive className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Others</div>
                    <div className="text-[10px] text-slate-400">32 files</div>
                  </div>
                </div>
                <span className="font-bold text-slate-700">13 MB</span>
              </div>
            </div>
          </div>

          {/* "Need More Space?" Card (Matching Reference 3) */}
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
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Upgrade Plan
              </button>
              {!session.bonusClaimed && (
                <button
                  onClick={() => claimBonusWithZKProof()}
                  className="w-full py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold text-[11px] transition-colors"
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
