import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { X, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Focus tracking for Yeti reactions
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [, setIsEmailFocused] = useState(false);

  // Mouse tracking for Yeti Eyes
  const containerRef = useRef<HTMLDivElement>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const faceCenterX = rect.left + rect.width * 0.25;
      const faceCenterY = rect.top + rect.height * 0.38;

      const deltaX = e.clientX - faceCenterX;
      const deltaY = e.clientY - faceCenterY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 400;

      // Eye pupil offset range: -9px to +9px
      const eyeMagnitude = Math.min(distance / maxDistance, 1) * 9;
      const angle = Math.atan2(deltaY, deltaX);

      const pupilX = Math.cos(angle) * eyeMagnitude;
      const pupilY = Math.sin(angle) * eyeMagnitude;

      // Subtle head tilt
      const tiltX = Math.min(Math.max((deltaX / rect.width) * 8, -8), 8);
      const tiltY = Math.min(Math.max((deltaY / rect.height) * 8, -8), 8);

      setEyeOffset({ x: pupilX, y: pupilY });
      setHeadTilt({ x: tiltX, y: tiltY });
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
        onClose();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await signUpWithEmail(email, password);
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLaceConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      await connectWallet('Midnight Lace');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lace wallet connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 via-purple-500/10 to-indigo-500/10 pointer-events-none" />

      {/* Main Split Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row my-auto transition-all duration-300"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: 3D Cursor-Reactive Yeti Character */}
        <div className="md:w-1/2 relative bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 p-8 flex flex-col justify-between overflow-hidden min-h-[380px] md:min-h-[540px]">
          {/* Fluffy Background Clouds */}
          <div className="absolute top-6 left-6 w-32 h-16 bg-white/70 rounded-full blur-[1px] -z-0 animate-pulse" />
          <div className="absolute top-16 right-8 w-40 h-20 bg-white/80 rounded-full blur-[1px] -z-0" />
          <div className="absolute bottom-12 left-0 right-0 h-32 bg-gradient-to-t from-emerald-300/60 via-emerald-200/40 to-transparent rounded-t-[50%] -z-0" />

          {/* Top Brand Logo inside Yeti Panel */}
          <div className="relative z-10 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-md border border-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-sky-500" />
            </div>
            <span className="font-display font-extrabold text-slate-800 text-sm tracking-wider uppercase">
              VOID GUARDIAN
            </span>
          </div>

          {/* Interactive Yeti Character (SVG Canvas with Eye-Tracking Math) */}
          <div
            className="relative z-10 flex items-center justify-center my-auto transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(600px) rotateY(${headTilt.x}deg) rotateX(${-headTilt.y}deg)`,
            }}
          >
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
              {/* Outer Fluffy Yeti Body (Cute White/Cyan Yeti) */}
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
                <defs>
                  {/* Fluffy fur shadow and gradients */}
                  <linearGradient id="yetiBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#F0F7FF" />
                    <stop offset="100%" stopColor="#D9ECFA" />
                  </linearGradient>

                  <linearGradient id="yetiFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#BEE3F8" />
                    <stop offset="100%" stopColor="#90CDF4" />
                  </linearGradient>

                  <linearGradient id="yetiHornGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#63B3ED" />
                    <stop offset="100%" stopColor="#3182CE" />
                  </linearGradient>
                </defs>

                {/* Fluffy Silhouette Tufts */}
                <circle cx="100" cy="115" r="70" fill="url(#yetiBodyGrad)" />
                <circle cx="50" cy="95" r="22" fill="url(#yetiBodyGrad)" />
                <circle cx="150" cy="95" r="22" fill="url(#yetiBodyGrad)" />
                <circle cx="55" cy="135" r="26" fill="url(#yetiBodyGrad)" />
                <circle cx="145" cy="135" r="26" fill="url(#yetiBodyGrad)" />
                <circle cx="100" cy="65" r="24" fill="url(#yetiBodyGrad)" />
                <circle cx="75" cy="70" r="20" fill="url(#yetiBodyGrad)" />
                <circle cx="125" cy="70" r="20" fill="url(#yetiBodyGrad)" />

                {/* Soft Blue Ears */}
                <circle cx="48" cy="100" r="12" fill="#90CDF4" opacity="0.8" />
                <circle cx="152" cy="100" r="12" fill="#90CDF4" opacity="0.8" />

                {/* Cute Inner Face Oval */}
                <ellipse cx="100" cy="112" rx="46" ry="38" fill="url(#yetiFaceGrad)" />

                {/* Left Eye White Sclera */}
                <ellipse cx="80" cy="106" rx="14" ry="16" fill="#FFFFFF" />
                {/* Right Eye White Sclera */}
                <ellipse cx="120" cy="106" rx="14" ry="16" fill="#FFFFFF" />

                {/* Left Eye Pupil (Follows Cursor) */}
                <g
                  style={{
                    transform: isPasswordFocused
                      ? 'translate(0px, 8px)'
                      : `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                    transition: isPasswordFocused ? 'transform 0.3s ease' : 'none',
                  }}
                >
                  <circle cx="80" cy="106" r="8" fill="#1A202C" />
                  {/* Glossy Reflection Highlight */}
                  <circle cx="77" cy="103" r="3" fill="#FFFFFF" />
                  <circle cx="82" cy="109" r="1.2" fill="#FFFFFF" />
                </g>

                {/* Right Eye Pupil (Follows Cursor) */}
                <g
                  style={{
                    transform: isPasswordFocused
                      ? 'translate(0px, 8px)'
                      : `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                    transition: isPasswordFocused ? 'transform 0.3s ease' : 'none',
                  }}
                >
                  <circle cx="120" cy="106" r="8" fill="#1A202C" />
                  {/* Glossy Reflection Highlight */}
                  <circle cx="117" cy="103" r="3" fill="#FFFFFF" />
                  <circle cx="122" cy="109" r="1.2" fill="#FFFFFF" />
                </g>

                {/* Password Eye Cover Mode (Playful Blinking / Covering) */}
                {isPasswordFocused && (
                  <g className="animate-fade-in">
                    {/* Cute Closed Eyelids */}
                    <path
                      d="M 68 106 Q 80 114 92 106"
                      stroke="#2B6CB0"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 108 106 Q 120 114 132 106"
                      stroke="#2B6CB0"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                )}

                {/* Cute Blue Button Nose */}
                <ellipse cx="100" cy="119" rx="5" ry="3.5" fill="#3182CE" />

                {/* Smiling Mouth */}
                <path
                  d="M 94 126 Q 100 133 106 126"
                  stroke="#2B6CB0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Cute Rosy Cheeks */}
                <circle cx="68" cy="120" r="6" fill="#F687B3" opacity="0.4" />
                <circle cx="132" cy="120" r="6" fill="#F687B3" opacity="0.4" />

                {/* Cute Paws resting at bottom */}
                <ellipse cx="70" cy="165" rx="14" ry="10" fill="#90CDF4" />
                <ellipse cx="130" cy="165" rx="14" ry="10" fill="#90CDF4" />
              </svg>
            </div>
          </div>

          {/* Bottom Bold Motivational Tagline */}
          <div className="relative z-10 text-center md:text-left">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight leading-none">
              EXPLORE.<br />
              LEARN. GROW.
            </h3>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Zero-Knowledge Shielded Cloud Vault
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Clean Modern Login & Signup Form */}
        <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-white">
          {/* Header Icon & Title */}
          <div>
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
                ? 'Enter your email and password to access your vault'
                : mode === 'signup'
                ? 'Start storing files privately with client-side zero-knowledge proofs'
                : 'Enter your registered email to receive recovery instructions'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-medium">
              {successMessage}
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    placeholder="Confirm your password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sky-600 hover:text-sky-700 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs font-mono shadow-md transition-all flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Instructions'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Social & Web3 Lace Sign In */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              {/* Midnight Lace Wallet Button */}
              <button
                type="button"
                onClick={handleLaceConnect}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 hover:border-purple-300 text-purple-900 font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">
                  N
                </div>
                <span>Connect Midnight Lace Wallet</span>
              </button>
            </div>
          )}

          {/* Footer Mode Switcher */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-sky-600 hover:text-sky-700 underline ml-1"
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
                  className="font-bold text-sky-600 hover:text-sky-700 underline ml-1"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-sky-600 hover:text-sky-700 underline"
              >
                ← Back to Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
