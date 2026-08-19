import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { useVault } from '../context/VaultContext';
import {
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Shield,
} from 'lucide-react';

interface YetiAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const YetiAuthModal: React.FC<YetiAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } = useAuth();
  const { connectWallet } = useWeb3Wallet();
  const { setActiveView } = useVault();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Focus tracking for Yeti reactive dialogue & animations
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // 3D Parallax Tilt Physics
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Real-time 3D cursor parallax tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (e.clientY - rect.top) / rect.height - 0.5;

      const rotY = Math.max(Math.min(relativeX * 18, 12), -12);
      const rotX = Math.max(Math.min(-relativeY * 18, 12), -12);

      const glowX = ((e.clientX - rect.left) / rect.width) * 100;
      const glowY = ((e.clientY - rect.top) / rect.height) * 100;

      setParallax({ rotateX: rotX, rotateY: rotY, glowX, glowY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        setActiveView('dashboard');
        onClose();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password);
        setActiveView('dashboard');
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMessage('Password reset instructions sent to your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setActiveView('dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await connectWallet('Midnight Lace', true);
      setActiveView('dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lace wallet connection failed.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Mascot Dialogue
  const mascotDialogue = isPasswordFocused
    ? showPassword
      ? "I'm looking away! 🙈 Your secrets are client-side shielded!"
      : "Zero-Knowledge Active! 🔒 I won't look at your password!"
    : isEmailFocused
    ? "Type your email! I'll set up your private ZK storage! 📧"
    : loading
    ? "Synthesizing Midnight Halo2 ZK Proof... ⚡"
    : "Hi! 👋 I'm your 3D Void Guardian!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/15 via-purple-500/15 to-indigo-500/15 pointer-events-none" />

      {/* Main Split Modal Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row my-auto transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================ */}
        {/* LEFT PANEL: 8K Pixar 3D Cinematic Scene (Full Bleed)         */}
        {/* ============================================================ */}
        <div className="md:w-1/2 relative overflow-hidden min-h-[420px] md:min-h-[580px] flex flex-col justify-between p-6 sm:p-8 bg-sky-900 select-none">
          
          {/* 8K Pixar 3D Cinematic Artwork with 3D Parallax Response */}
          <motion.div
            className="absolute inset-0 w-full h-full pointer-events-none"
            animate={{
              rotateY: parallax.rotateY,
              rotateX: parallax.rotateX,
              scale: 1.08,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.6 }}
          >
            <img
              src="/yeti-mascot.jpg"
              alt="8K Pixar 3D Yeti Mascot"
              className="w-full h-full object-cover object-center"
            />
            {/* Dynamic Cursor Light Shimmer */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 320px at ${parallax.glowX}% ${parallax.glowY}%, rgba(56, 189, 248, 0.22), transparent 70%)`,
              }}
            />
          </motion.div>

          {/* Top Brand Pill & Live Dialogue Bubble */}
          <div className="relative z-20 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-slate-900 font-bold text-xs shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>VOID GUARDIAN</span>
              </div>

              {isPasswordFocused && (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white font-bold text-[11px] shadow-md border border-white/20 animate-pulse">
                  <Lock className="w-3 h-3 text-sky-400" />
                  <span>ZK Shield Active</span>
                </div>
              )}
            </div>

            {/* Reactive Mascot Speech Bubble */}
            <motion.div
              key={mascotDialogue}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="self-start max-w-[280px] p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-white/90 shadow-xl text-slate-800 text-xs font-semibold relative"
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">✨</span>
                <span>{mascotDialogue}</span>
              </div>
              {/* Bubble Pointer Tail */}
              <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-white/95 transform rotate-45 border-b border-r border-white/90" />
            </motion.div>
          </div>

          {/* Blindfold Privacy Overlay when Password is Focused */}
          <AnimatePresence>
            {isPasswordFocused && !showPassword && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-25 bg-slate-950/40 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-white/95 text-sky-600 flex items-center justify-center shadow-2xl mb-3 border border-white">
                  <Lock className="w-8 h-8 animate-bounce" />
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/95 text-slate-900 font-display font-black text-xs shadow-2xl flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Zero-Knowledge Shield: Privacy Active</span>
                </div>
                <p className="text-[11px] text-sky-100 font-semibold mt-2 drop-shadow-md">
                  Your password never leaves your browser.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Headline Overlay */}
          <div className="relative z-20 mt-auto pt-16">
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-t from-slate-950/85 via-slate-950/60 to-transparent backdrop-blur-xs text-white space-y-1">
              <h3 className="font-display font-black text-xl sm:text-2xl tracking-wider leading-none uppercase drop-shadow-md">
                EXPLORE. LEARN. GROW.
              </h3>
              <p className="text-xs text-sky-200 font-medium drop-shadow-sm">
                Zero-Knowledge Shielded Cloud Vault
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: Clean Modern Login & Signup Form                */}
        {/* ============================================================ */}
        <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Header Brand */}
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
              <div className="w-9 h-9 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-lg text-slate-900 tracking-tight">
                VOID<span className="text-sky-500">CLOUD</span>
              </span>
            </div>

            <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight text-center md:text-left">
              {mode === 'signin' ? 'WELCOME BACK' : mode === 'signup' ? 'CREATE ACCOUNT' : 'RESET PASSWORD'}
            </h2>
            <p className="text-xs text-slate-500 mt-1 text-center md:text-left">
              {mode === 'signin'
                ? 'Enter your email and password to access your encrypted vault'
                : mode === 'signup'
                ? 'Start storing files privately with client-side zero-knowledge proofs'
                : 'Enter your registered email to receive recovery instructions'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="my-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="my-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              {successMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Signup) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all pr-10"
                  />
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* Remember Me / Forgot Password */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sky-600 hover:text-sky-800 font-bold cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Securing Vault...</span>
              ) : (
                <>
                  <span>
                    {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social / Wallet Sign In Buttons */}
          {mode !== 'forgot' && (
            <div className="space-y-3 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] uppercase font-mono text-slate-400 absolute">
                  Or continue with
                </span>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleWalletSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs transition-colors flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">
                    N
                  </span>
                  <span>Connect Midnight Lace Wallet</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher Footer */}
          <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                >
                  Back to Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
