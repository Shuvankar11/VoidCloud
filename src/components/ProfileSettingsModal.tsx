import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useWeb3Wallet } from '../context/WalletContext';
import {
  X,
  User,
  Lock,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  HardDrive,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { id: 'yeti', name: 'Yeti Mascot', url: '/yeti-mascot.jpg' },
  { id: 'void', name: 'Void Shard', url: '/voidcloud-logo.jpg' },
  {
    id: 'cyber',
    name: 'Cyber Sentinel',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'aurora',
    name: 'Aurora Pilot',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'neon',
    name: 'Neon Shifter',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'zenith',
    name: 'Zenith Sage',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, changePassword, signOut } = useAuth();
  const { session } = useVault();
  const { setIsPricingModalOpen, wallet } = useWeb3Wallet();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'vault'>('profile');

  // Profile Form States
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with current user data
  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      setPhotoURL(user.photoURL);
      setProfileSuccess(null);
      setProfileError(null);
      setSecuritySuccess(null);
      setSecurityError(null);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user, isOpen]);

  // Escape key close listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  // Handle custom DP image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileError(null);
    setProfileSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    // Limit size to 4 MB to keep localStorage and session safe
    if (file.size > 4 * 1024 * 1024) {
      setProfileError('Avatar image must be smaller than 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 256;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.88);
              setPhotoURL(compressed);
              setProfileSuccess('Custom photo loaded! Click "Save Changes" to apply.');
            } else {
              setPhotoURL(reader.result as string);
              setProfileSuccess('Custom photo loaded! Click "Save Changes" to apply.');
            }
          } catch {
            setPhotoURL(reader.result as string);
            setProfileSuccess('Custom photo loaded! Click "Save Changes" to apply.');
          }
        };
        img.onerror = () => {
          setPhotoURL(reader.result as string);
          setProfileSuccess('Custom photo loaded! Click "Save Changes" to apply.');
        };
        img.src = reader.result;
      }
    };
    reader.onerror = () => {
      setProfileError('Failed to read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  // Handle saving profile changes (Name and DP)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setSavingProfile(true);

    try {
      if (!displayName.trim()) {
        throw new Error('Please enter a display name.');
      }

      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL: photoURL || '',
      });

      setProfileSuccess('Profile & Avatar updated successfully!');
      setTimeout(() => {
        setProfileSuccess(null);
      }, 3500);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError(null);
    setSecuritySuccess(null);
    setSavingSecurity(true);

    try {
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match.');
      }

      await changePassword(currentPassword, newPassword);

      setSecuritySuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSecuritySuccess(null);
      }, 3500);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update password.');
    } finally {
      setSavingSecurity(false);
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return email ? email.slice(0, 2).toUpperCase() : 'VC';
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passStrength = calculatePasswordStrength(newPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-slate-900/20 to-indigo-500/10 pointer-events-none" />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.28)] border border-slate-100 overflow-hidden flex flex-col my-auto transition-all duration-300">
        
        {/* Header with Decorative Accent */}
        <div className="relative bg-gradient-to-r from-[#0B1536] via-[#10204E] to-[#0B1536] text-white p-6 sm:p-8">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-lg shadow-sky-500/20 flex-shrink-0">
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                {photoURL ? (
                  <img src={photoURL} alt="Profile DP" className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(displayName, user.email)}</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white">
                  {displayName || 'Vault Commander'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-300 text-[10px] font-bold tracking-wide uppercase border border-sky-400/30">
                  Verified Vault
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {user.email} &bull; <span className="font-mono text-[11px] text-slate-400">UID: {user.uid.slice(0, 12)}...</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1.5 mt-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile & DP</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center space-x-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center space-x-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'vault'
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Vault & Storage</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
          {/* ============================================================ */}
          {/* TAB 1: PROFILE & AVATAR (DP) SETTINGS                         */}
          {/* ============================================================ */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {profileError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Avatar / DP Upload Section */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Profile Picture (DP / Avatar)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
                  {/* Large DP Preview */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl p-1 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-md flex-shrink-0">
                      <div className="w-full h-full rounded-[20px] overflow-hidden bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-2xl">
                        {photoURL ? (
                          <img src={photoURL} alt="Current DP" className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(displayName, user.email)}</span>
                        )}
                      </div>
                    </div>
                    {photoURL && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoURL(undefined);
                          setProfileSuccess('Photo removed. Save changes to apply.');
                        }}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md transition-colors cursor-pointer"
                        title="Remove custom photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload New Photo</span>
                      </button>

                      {photoURL && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoURL(undefined);
                            setProfileSuccess('Photo cleared. Click "Save Changes" to revert to initials.');
                          }}
                          className="inline-flex items-center space-x-1.5 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports JPG, PNG, WEBP, or GIF (max 4 MB). Your avatar is stored securely in your encrypted vault.
                    </p>
                  </div>
                </div>

                {/* Preset Avatars Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                    Or select a themed avatar preset:
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setPhotoURL(preset.url);
                          setProfileSuccess(`Selected ${preset.name}! Click "Save Changes" to apply.`);
                        }}
                        className={`group relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          photoURL === preset.url
                            ? 'border-sky-500 ring-2 ring-sky-500/30 scale-105'
                            : 'border-slate-200 hover:border-slate-400 hover:scale-105'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        {photoURL === preset.url && (
                          <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={60}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-sm text-slate-900 outline-none transition-all font-medium"
                  />
                  <span className="absolute right-3.5 top-3 text-[11px] font-mono text-slate-400">
                    {displayName.length}/60
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This name is displayed in the dashboard header, activity ledger, and shared encrypted files.
                </p>
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address (Vault ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-sm text-slate-500 outline-none cursor-not-allowed font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Your vault identity is bound to this email. To change email, contact security governance.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-2.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {savingProfile ? <span>Saving Changes...</span> : <span>Save Changes</span>}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 2: SECURITY & PASSWORD CHANGE                            */}
          {/* ============================================================ */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              {securityError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{securityError}</span>
                </div>
              )}

              {securitySuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                  <span>{securitySuccess}</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start space-x-3">
                <KeyRound className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-800">End-to-End Encrypted Authentication</div>
                  <div>
                    Updating your password will re-encrypt your local vault session keys. Keep your new password secure.
                  </div>
                </div>
              </div>

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-sm text-slate-900 outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-sm text-slate-900 outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-400 font-semibold">Password Strength:</span>
                      <span
                        className={`font-bold ${
                          passStrength >= 75
                            ? 'text-emerald-600'
                            : passStrength >= 50
                            ? 'text-amber-600'
                            : 'text-rose-500'
                        }`}
                      >
                        {passStrength >= 75 ? 'Strong' : passStrength >= 50 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passStrength >= 75
                            ? 'bg-emerald-500'
                            : passStrength >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${passStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white text-sm text-slate-900 outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <div className="text-[11px] font-semibold pt-0.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Passwords match</span>
                      </span>
                    ) : (
                      <span className="text-rose-500">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSecurity}
                  className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {savingSecurity ? <span>Updating Password...</span> : <span>Update Password</span>}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* TAB 3: VAULT & STORAGE OVERVIEW                              */}
          {/* ============================================================ */}
          {activeTab === 'vault' && (
            <div className="space-y-6">
              {/* Storage Quota Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Storage Allocation
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                    {session.quotaGB} GB Tier
                  </span>
                </div>
                <div className="text-2xl font-display font-black text-slate-900">
                  {session.quotaGB} GB Allocated
                </div>
                <p className="text-xs text-slate-600">
                  Upgradable with 1-time Preprod Testnet unlock (80 GB / 150 NIGHT) or Mainnet Sentinel tiers up to 1 TB.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsPricingModalOpen(true);
                  }}
                  className="py-2 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Upgrade Storage Capacity</span>
                </button>
              </div>

              {/* Cryptographic Account Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Account Credentials & Web3 Identity
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Account ID (UID)</span>
                    <span className="font-mono text-slate-800 font-semibold">{user.uid}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Created On</span>
                    <span className="text-slate-800 font-semibold">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Web3 Wallet Status</span>
                    <span className="text-slate-800 font-semibold">
                      {wallet.isConnected ? `${wallet.walletName || 'Web3 Wallet'} (Connected)` : 'No Wallet Connected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone: Sign Out */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Session Management</div>
                  <div className="text-[11px] text-slate-400">Safely terminate this browser vault session</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    onClose();
                    await signOut();
                  }}
                  className="py-2 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Sign Out of Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
