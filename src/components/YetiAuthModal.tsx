import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

interface YetiProps {
  mouseX: number;
  mouseY: number;
  isPasswordFocused: boolean;
  showPassword: boolean;
  isEmailFocused: boolean;
  isLoading: boolean;
}

export const InteractiveYetiCharacter: React.FC<YetiProps> = ({
  mouseX,
  mouseY,
  isPasswordFocused,
  showPassword,
  isEmailFocused,
  isLoading,
}) => {
  const leftEyeRef = useRef<SVGGElement>(null);
  const rightEyeRef = useRef<SVGGElement>(null);
  const [pupilPos, setPupilPos] = useState({ lx: 0, ly: 0, rx: 0, ry: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Random natural blinking every 3.5 - 6 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200);
    return () => clearInterval(blinkInterval);
  }, []);

  // Compute pupil angles and offsets based on cursor position
  useEffect(() => {
    if (isPasswordFocused && !showPassword) {
      setPupilPos({ lx: 0, ly: 0, rx: 0, ry: 0 });
      return;
    }

    if (isEmailFocused) {
      // Look down-right towards the input fields
      setPupilPos({ lx: 7, ly: 8, rx: 7, ry: 8 });
      return;
    }

    if (leftEyeRef.current && rightEyeRef.current) {
      const leftRect = leftEyeRef.current.getBoundingClientRect();
      const rightRect = rightEyeRef.current.getBoundingClientRect();

      const lCenterX = leftRect.left + leftRect.width / 2;
      const lCenterY = leftRect.top + leftRect.height / 2;
      const rCenterX = rightRect.left + rightRect.width / 2;
      const rCenterY = rightRect.top + rightRect.height / 2;

      const lAngle = Math.atan2(mouseY - lCenterY, mouseX - lCenterX);
      const lDist = Math.hypot(mouseX - lCenterX, mouseY - lCenterY);
      const lRadius = Math.min(lDist / 35, 11);

      const rAngle = Math.atan2(mouseY - rCenterY, mouseX - rCenterX);
      const rDist = Math.hypot(mouseX - rCenterX, mouseY - rCenterY);
      const rRadius = Math.min(rDist / 35, 11);

      setPupilPos({
        lx: Math.cos(lAngle) * lRadius,
        ly: Math.sin(lAngle) * lRadius,
        rx: Math.cos(rAngle) * rRadius,
        ry: Math.sin(rAngle) * rRadius,
      });
    }
  }, [mouseX, mouseY, isPasswordFocused, showPassword, isEmailFocused]);

  // Head tilt based on mouse offset
  const headRotateX = isEmailFocused ? 12 : Math.max(Math.min((mouseY - window.innerHeight / 2) / 35, 15), -15);
  const headRotateY = isEmailFocused ? 14 : Math.max(Math.min((mouseX - window.innerWidth / 2) / 35, 18), -18);

  const coveringEyes = isPasswordFocused && !showPassword;
  const peeking = isPasswordFocused && showPassword;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* 3D Container with Perspective */}
      <motion.div
        className="relative w-[340px] h-[390px] flex items-center justify-center"
        style={{
          perspective: 1000,
        }}
      >
        <motion.svg
          viewBox="0 0 400 450"
          className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
          animate={{
            rotateX: headRotateX,
            rotateY: headRotateY,
            scale: isLoading ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.8,
          }}
        >
          <defs>
            {/* Gradients for Fur, Face, Horns, Scarf */}
            <linearGradient id="bodyFur" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="65%" stopColor="#EEF6FC" />
              <stop offset="100%" stopColor="#D2E6F7" />
            </linearGradient>

            <linearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#BCE3FA" />
              <stop offset="100%" stopColor="#76BCE8" />
            </linearGradient>

            <linearGradient id="hornGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5E83A8" />
              <stop offset="100%" stopColor="#304D6B" />
            </linearGradient>

            <linearGradient id="scarfGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            <linearGradient id="eyeShine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2D3748" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            <filter id="furShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* 1. Horns */}
          <path
            d="M 125 125 C 100 80, 85 60, 65 80 C 75 110, 95 130, 120 145 Z"
            fill="url(#hornGrad)"
          />
          <path
            d="M 275 125 C 300 80, 315 60, 335 80 C 325 110, 305 130, 280 145 Z"
            fill="url(#hornGrad)"
          />

          {/* 2. Fluffy White Body */}
          <ellipse cx="200" cy="330" rx="140" ry="110" fill="url(#bodyFur)" filter="url(#furShadow)" />

          {/* Fluffy Head with Tuft Outline */}
          <path
            d="M 110 200 
               C 90 140, 130 90, 200 85 
               C 270 90, 310 140, 290 200 
               C 320 270, 280 320, 200 320 
               C 120 320, 80 270, 110 200 Z"
            fill="url(#bodyFur)"
            filter="url(#furShadow)"
          />

          {/* Top Hair Tuft */}
          <path
            d="M 185 85 C 175 45, 215 50, 200 85 Z"
            fill="#FFFFFF"
          />
          <path
            d="M 200 85 C 215 45, 245 55, 215 85 Z"
            fill="#FFFFFF"
          />

          {/* 3. Baby Blue Cute Face Mask */}
          <path
            d="M 135 190 
               C 130 145, 160 130, 200 130 
               C 240 130, 270 145, 265 190 
               C 268 235, 235 250, 200 250 
               C 165 250, 132 235, 135 190 Z"
            fill="url(#faceGrad)"
          />

          {/* Cheeks Blush */}
          <circle cx="150" cy="210" r="14" fill="#F472B6" opacity="0.3" />
          <circle cx="250" cy="210" r="14" fill="#F472B6" opacity="0.3" />

          {/* 4. Reactive Eyes and Pupils */}
          {/* Left Eye */}
          <g ref={leftEyeRef} id="leftEye">
            <ellipse
              cx="170"
              cy="185"
              rx="20"
              ry={isBlinking || (coveringEyes && !peeking) ? 2 : 23}
              fill="#FFFFFF"
              stroke="#BCE3FA"
              strokeWidth="2"
            />
            {(!coveringEyes || peeking) && !isBlinking && (
              <g transform={`translate(${pupilPos.lx}, ${pupilPos.ly})`}>
                {/* Dark Pupil */}
                <circle cx="170" cy="185" r="12" fill="url(#eyeShine)" />
                <circle cx="170" cy="185" r="9" fill="#0284C7" />
                <circle cx="170" cy="185" r="6" fill="#0F172A" />
                {/* Starry Sparkles */}
                <circle cx="166" cy="180" r="3.5" fill="#FFFFFF" />
                <circle cx="174" cy="188" r="1.5" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* Right Eye */}
          <g ref={rightEyeRef} id="rightEye">
            <ellipse
              cx="230"
              cy="185"
              rx="20"
              ry={isBlinking || coveringEyes ? 2 : 23}
              fill="#FFFFFF"
              stroke="#BCE3FA"
              strokeWidth="2"
            />
            {!coveringEyes && !isBlinking && (
              <g transform={`translate(${pupilPos.rx}, ${pupilPos.ry})`}>
                {/* Dark Pupil */}
                <circle cx="230" cy="185" r="12" fill="url(#eyeShine)" />
                <circle cx="230" cy="185" r="9" fill="#0284C7" />
                <circle cx="230" cy="185" r="6" fill="#0F172A" />
                {/* Starry Sparkles */}
                <circle cx="226" cy="180" r="3.5" fill="#FFFFFF" />
                <circle cx="234" cy="188" r="1.5" fill="#FFFFFF" />
              </g>
            )}
          </g>

          {/* 5. Cute Black Button Nose */}
          <ellipse cx="200" cy="205" rx="11" ry="7" fill="#1E293B" />
          <ellipse cx="198" cy="203" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.6" />

          {/* 6. Mouth */}
          {isLoading ? (
            <ellipse cx="200" cy="226" rx="8" ry="6" fill="#1E293B" />
          ) : (
            <path
              d="M 188 222 Q 200 234 212 222"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* 7. Cozy Blue Snowflake Scarf */}
          <path
            d="M 120 280 C 160 265, 240 265, 280 280 C 265 315, 135 315, 120 280 Z"
            fill="url(#scarfGrad)"
            filter="url(#furShadow)"
          />
          {/* Scarf Tail */}
          <path
            d="M 140 290 L 155 365 L 185 360 L 170 290 Z"
            fill="url(#scarfGrad)"
          />
          {/* Gold Shield Badge on Scarf */}
          <circle cx="163" cy="335" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <path
            d="M 160 332 L 166 332 L 166 336 C 166 339, 163 341, 163 341 C 163 341, 160 339, 160 336 Z"
            fill="#B45309"
          />

          {/* 8. Paws / Hands with Blindfold Actions */}
          {/* Left Paw */}
          <motion.g
            animate={{
              y: coveringEyes ? -85 : peeking ? -45 : 0,
              x: coveringEyes ? 35 : peeking ? 15 : 0,
              rotate: coveringEyes ? 25 : peeking ? 10 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <ellipse cx="110" cy="290" rx="28" ry="24" fill="url(#bodyFur)" filter="url(#furShadow)" />
            {/* Claws / Finger Tufts */}
            <circle cx="98" cy="278" r="5" fill="#E2E8F0" />
            <circle cx="110" cy="274" r="5" fill="#E2E8F0" />
            <circle cx="122" cy="278" r="5" fill="#E2E8F0" />
          </motion.g>

          {/* Right Paw (Waving or Covering Right Eye) */}
          <motion.g
            animate={{
              y: coveringEyes ? -85 : 0,
              x: coveringEyes ? -35 : 0,
              rotate: coveringEyes ? -25 : [0, 8, -8, 0],
            }}
            transition={
              coveringEyes
                ? { type: 'spring', stiffness: 280, damping: 20 }
                : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
            }
          >
            <ellipse cx="290" cy="290" rx="28" ry="24" fill="url(#bodyFur)" filter="url(#furShadow)" />
            {/* Claws / Finger Tufts */}
            <circle cx="278" cy="278" r="5" fill="#E2E8F0" />
            <circle cx="290" cy="274" r="5" fill="#E2E8F0" />
            <circle cx="302" cy="278" r="5" fill="#E2E8F0" />
          </motion.g>
        </motion.svg>
      </motion.div>
    </div>
  );
};

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
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  // Mouse tracking
  const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isOpen) return;
      setMousePos({ x: e.clientX, y: e.clientY });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/15 via-purple-500/15 to-indigo-500/15 pointer-events-none" />

      {/* Main Split Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row my-auto transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ============================================================ */}
        {/* LEFT PANEL: Fully Cursor-Reactive 3D Yeti Guardian Scene    */}
        {/* ============================================================ */}
        <div
          className="md:w-1/2 relative overflow-hidden min-h-[420px] md:min-h-[580px] flex flex-col justify-between p-6 sm:p-8 bg-cover bg-center select-none"
          style={{
            backgroundImage: 'url(/aurora-bg.jpg)',
            backgroundColor: '#D9EEFD',
          }}
        >
          {/* Top Brand Pill Overlay */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 text-slate-800 font-bold text-xs shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>VOID GUARDIAN</span>
            </div>

            {isPasswordFocused && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white font-bold text-[11px] shadow-md border border-white/20 animate-pulse">
                <Lock className="w-3 h-3 text-sky-400" />
                <span>{showPassword ? 'Peeking' : 'Shielding Eyes'}</span>
              </div>
            )}
          </div>

          {/* Interactive Character Center */}
          <div className="relative z-10 flex-1 flex items-center justify-center my-2">
            <InteractiveYetiCharacter
              mouseX={mousePos.x}
              mouseY={mousePos.y}
              isPasswordFocused={isPasswordFocused}
              showPassword={showPassword}
              isEmailFocused={isEmailFocused}
              isLoading={loading}
            />
          </div>

          {/* Bottom Headline Overlay */}
          <div className="relative z-20 mt-auto">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/80 shadow-md text-slate-800 space-y-0.5">
              <h3 className="font-display font-black text-lg sm:text-xl tracking-wider uppercase text-slate-900">
                EXPLORE. LEARN. GROW.
              </h3>
              <p className="text-xs text-sky-600 font-bold">
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
