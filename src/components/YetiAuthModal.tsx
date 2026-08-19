import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { useVault } from '../context/VaultContext';
import { X, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

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

  // Focus tracking for Yeti reactions
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Mouse tracking for 3D Yeti Card Tilt & Eye Tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width * 0.25;
      const cardCenterY = rect.top + rect.height * 0.45;

      const deltaX = e.clientX - cardCenterX;
      const deltaY = e.clientY - cardCenterY;

      // 3D Perspective Tilt Math
      const tiltX = Math.min(Math.max((deltaX / rect.width) * 14, -14), 14);
      const tiltY = Math.min(Math.max((deltaY / rect.height) * 14, -14), 14);

      // Eye pupil vector calculation
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDist = 400;
      const magnitude = Math.min(distance / maxDist, 1) * 8;
      const angle = Math.atan2(deltaY, deltaX);

      setTilt({ x: tiltX, y: tiltY });
      setPupilOffset({
        x: Math.cos(angle) * magnitude,
        y: Math.sin(angle) * magnitude,
      });
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

  const handleLaceConnect = async () => {
    setError(null);
    setLoading(true);
    try {
      await connectWallet('Midnight Lace');
      setActiveView('dashboard');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lace wallet connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
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
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================ */}
        {/* LEFT PANEL: Photorealistic 3D Yeti Mascot (Matching Ref 2)   */}
        {/* ============================================================ */}
        <div className="md:w-1/2 relative bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 p-6 sm:p-8 flex items-center justify-center overflow-hidden min-h-[380px] md:min-h-[540px]">
          
          {/* Fluffy Background Cloud Blurs */}
          <div className="absolute top-6 left-6 w-36 h-20 bg-white/70 rounded-full blur-md -z-0 animate-pulse" />
          <div className="absolute top-16 right-8 w-44 h-24 bg-white/80 rounded-full blur-md -z-0" />

          {/* 3D Tilt Card containing the Photorealistic Yeti Mascot */}
          <div
            className="relative z-10 w-full h-full max-w-[340px] max-h-[440px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white transition-transform duration-100 ease-out"
            style={{
              transform: `perspective(800px) rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg) scale(${isPasswordFocused ? 0.96 : 1})`,
            }}
          >
            {/* Real 3D Yeti Image */}
            <img
              src="/yeti-mascot.png"
              alt="Yeti Guardian Mascot"
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Dynamic Cursor-Reactive Eye Glow Overlays */}
            <div
              className="absolute pointer-events-none transition-transform duration-75"
              style={{
                top: '39%',
                left: '38%',
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              }}
            >
              {/* Left pupil highlight */}
              <div className="w-2.5 h-2.5 rounded-full bg-white/70 blur-[0.5px] shadow-sm" />
            </div>

            <div
              className="absolute pointer-events-none transition-transform duration-75"
              style={{
                top: '39%',
                left: '58%',
                transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
              }}
            >
              {/* Right pupil highlight */}
              <div className="w-2.5 h-2.5 rounded-full bg-white/70 blur-[0.5px] shadow-sm" />
            </div>

            {/* Password Focus Shy Mask Overlay */}
            {isPasswordFocused && (
              <div className="absolute inset-0 bg-sky-950/20 backdrop-blur-[1px] flex items-center justify-center animate-fade-in">
                <div className="px-4 py-2 rounded-full bg-white/90 text-slate-800 font-bold text-xs shadow-lg flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-sky-600" />
                  <span>Zero-Knowledge Shielded</span>
                </div>
              </div>
            )}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 my-4">
            {/* Email */}
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
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
                <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
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

          {/* Social & Web3 Buttons */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-mono text-slate-400 uppercase">
                  Or continue with
                </span>
              </div>

              {/* Google */}
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

              {/* Midnight Lace Wallet */}
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
