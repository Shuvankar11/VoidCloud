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
} from 'lucide-react';

interface PixarYetiProps {
  mouseX: number;
  mouseY: number;
  isPasswordFocused: boolean;
  showPassword: boolean;
  isEmailFocused: boolean;
  isLoading: boolean;
}

export const Pixar3DYetiGuardian: React.FC<PixarYetiProps> = ({
  mouseX,
  mouseY,
  isPasswordFocused,
  showPassword,
  isEmailFocused,
  isLoading,
}) => {
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const headRef = useRef<SVGGElement>(null);

  // Natural Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Real-time cursor tracking for 3D eyes
  useEffect(() => {
    if (isPasswordFocused && !showPassword) {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (isEmailFocused) {
      setPupilOffset({ x: 8, y: 9 });
      return;
    }

    if (headRef.current) {
      const rect = headRef.current.getBoundingClientRect();
      const headCenterX = rect.left + rect.width / 2;
      const headCenterY = rect.top + rect.height * 0.45;

      const deltaX = mouseX - headCenterX;
      const deltaY = mouseY - headCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.hypot(deltaX, deltaY);
      const maxRadius = 9;
      const radius = Math.min(distance / 32, maxRadius);

      setPupilOffset({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }
  }, [mouseX, mouseY, isPasswordFocused, showPassword, isEmailFocused]);

  // Head 3D rotation angles
  const headRotateX = isEmailFocused
    ? 10
    : Math.max(Math.min((mouseY - window.innerHeight / 2) / 30, 14), -14);
  const headRotateY = isEmailFocused
    ? 12
    : Math.max(Math.min((mouseX - window.innerWidth / 2) / 30, 16), -16);

  const coveringEyes = isPasswordFocused && !showPassword;
  const peeking = isPasswordFocused && showPassword;

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <motion.div
        className="relative w-[320px] h-[370px] flex items-center justify-center"
        style={{ perspective: 1200 }}
      >
        <motion.svg
          viewBox="0 0 380 440"
          className="w-full h-full drop-shadow-[0_25px_45px_rgba(15,23,42,0.35)]"
          animate={{
            rotateX: headRotateX,
            rotateY: headRotateY,
            scale: isLoading ? 1.04 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 280,
            damping: 24,
            mass: 0.7,
          }}
        >
          <defs>
            {/* 3D Volumetric Lighting Gradients */}
            {/* 1. Body & Fur Sphere Shader */}
            <radialGradient id="pixarBodyFur" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#F0F7FD" />
              <stop offset="85%" stopColor="#D4E6F6" />
              <stop offset="100%" stopColor="#A8C8E6" />
            </radialGradient>

            {/* 2. Head Shader with High Soft Specular */}
            <radialGradient id="pixarHeadFur" cx="35%" cy="25%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#F2F8FE" />
              <stop offset="88%" stopColor="#D2E5F7" />
              <stop offset="100%" stopColor="#9EC2E4" />
            </radialGradient>

            {/* 3. Soft Baby Blue Pixar Face Mask */}
            <radialGradient id="pixarFace" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#CFEEFC" />
              <stop offset="70%" stopColor="#93CEF3" />
              <stop offset="100%" stopColor="#5CAEE4" />
            </radialGradient>

            {/* 4. Deep Metallic Horns */}
            <linearGradient id="pixarHorns" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7E9EB8" />
              <stop offset="50%" stopColor="#4D708F" />
              <stop offset="100%" stopColor="#2A435A" />
            </linearGradient>

            {/* 5. Volumetric Knitted Blue Scarf */}
            <linearGradient id="pixarScarf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>

            {/* 6. Realistic 3D Glass Eye Gradients */}
            <radialGradient id="irisGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="85%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#082F49" />
            </radialGradient>

            <radialGradient id="scleraGrad" cx="30%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="75%" stopColor="#FFFFFF" />
              <stop offset="95%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#CBD5E1" />
            </radialGradient>

            <filter id="pixarShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.22" floodColor="#0F172A" />
            </filter>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* 1. HORNS (Layered Behind Head)                           */}
          {/* ======================================================== */}
          {/* Left Horn */}
          <path
            d="M 125 125 C 95 85, 75 55, 55 75 C 65 110, 90 135, 120 150 Z"
            fill="url(#pixarHorns)"
            filter="url(#pixarShadow)"
          />
          {/* Right Horn */}
          <path
            d="M 255 125 C 285 85, 305 55, 325 75 C 315 110, 290 135, 260 150 Z"
            fill="url(#pixarHorns)"
            filter="url(#pixarShadow)"
          />

          {/* ======================================================== */}
          {/* 2. FLUFFY 3D BODY                                        */}
          {/* ======================================================== */}
          <ellipse
            cx="190"
            cy="330"
            rx="135"
            ry="105"
            fill="url(#pixarBodyFur)"
            filter="url(#pixarShadow)"
          />

          {/* Fur Tufts around Body */}
          <circle cx="95" cy="340" r="18" fill="url(#pixarBodyFur)" opacity="0.9" />
          <circle cx="285" cy="340" r="18" fill="url(#pixarBodyFur)" opacity="0.9" />

          {/* ======================================================== */}
          {/* 3. FLUFFY 3D HEAD & HAIR TUFTS                           */}
          {/* ======================================================== */}
          <g ref={headRef}>
            {/* Base Head Sphere */}
            <ellipse
              cx="190"
              cy="200"
              rx="105"
              ry="98"
              fill="url(#pixarHeadFur)"
              filter="url(#pixarShadow)"
            />

            {/* Top Crown Fur Tufts */}
            <path
              d="M 175 105 C 160 55, 210 65, 195 105 Z"
              fill="url(#pixarHeadFur)"
            />
            <path
              d="M 190 105 C 205 50, 240 65, 210 105 Z"
              fill="url(#pixarHeadFur)"
            />
            <path
              d="M 160 115 C 140 75, 180 85, 175 115 Z"
              fill="url(#pixarHeadFur)"
            />

            {/* Side Fur Cheek Tufts */}
            <circle cx="95" cy="210" r="22" fill="url(#pixarHeadFur)" />
            <circle cx="85" cy="190" r="16" fill="url(#pixarHeadFur)" />
            <circle cx="285" cy="210" r="22" fill="url(#pixarHeadFur)" />
            <circle cx="295" cy="190" r="16" fill="url(#pixarHeadFur)" />

            {/* ======================================================== */}
            {/* 4. SOFT 3D PIXAR FACE MASK                               */}
            {/* ======================================================== */}
            <ellipse
              cx="190"
              cy="200"
              rx="68"
              ry="58"
              fill="url(#pixarFace)"
            />

            {/* Soft Pink Blush Cheeks */}
            <ellipse cx="145" cy="220" rx="14" ry="9" fill="#F472B6" opacity="0.4" filter="url(#softGlow)" />
            <ellipse cx="235" cy="220" rx="14" ry="9" fill="#F472B6" opacity="0.4" filter="url(#softGlow)" />

            {/* ======================================================== */}
            {/* 5. 3D GLOSSY EYES WITH REAL-TIME CURSOR TRACKING          */}
            {/* ======================================================== */}
            {/* Left Eye */}
            <g id="leftEye">
              {/* Sclera Eyeball (White Sphere) */}
              <ellipse
                cx="160"
                cy="185"
                rx="18"
                ry={isBlinking || (coveringEyes && !peeking) ? 2 : 22}
                fill="url(#scleraGrad)"
                stroke="#93CEF3"
                strokeWidth="1.5"
              />

              {/* Dynamic Tracking Iris & Pupil */}
              {(!coveringEyes || peeking) && !isBlinking && (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  {/* Glowing Blue Iris */}
                  <circle cx="160" cy="185" r="12.5" fill="url(#irisGrad)" />
                  {/* Inner Dark Pupil */}
                  <circle cx="160" cy="185" r="7" fill="#0A0F1D" />
                  {/* Primary Star Specular Glint */}
                  <circle cx="156" cy="180" r="4" fill="#FFFFFF" />
                  {/* Secondary Tiny Sparkle */}
                  <circle cx="164" cy="189" r="1.8" fill="#FFFFFF" opacity="0.9" />
                </g>
              )}
            </g>

            {/* Right Eye */}
            <g id="rightEye">
              {/* Sclera Eyeball (White Sphere) */}
              <ellipse
                cx="220"
                cy="185"
                rx="18"
                ry={isBlinking || coveringEyes ? 2 : 22}
                fill="url(#scleraGrad)"
                stroke="#93CEF3"
                strokeWidth="1.5"
              />

              {/* Dynamic Tracking Iris & Pupil */}
              {!coveringEyes && !isBlinking && (
                <g transform={`translate(${pupilOffset.x}, ${pupilOffset.y})`}>
                  {/* Glowing Blue Iris */}
                  <circle cx="220" cy="185" r="12.5" fill="url(#irisGrad)" />
                  {/* Inner Dark Pupil */}
                  <circle cx="220" cy="185" r="7" fill="#0A0F1D" />
                  {/* Primary Star Specular Glint */}
                  <circle cx="216" cy="180" r="4" fill="#FFFFFF" />
                  {/* Secondary Tiny Sparkle */}
                  <circle cx="224" cy="189" r="1.8" fill="#FFFFFF" opacity="0.9" />
                </g>
              )}
            </g>

            {/* ======================================================== */}
            {/* 6. CUTE NOSE & SMILE                                     */}
            {/* ======================================================== */}
            {/* 3D Black Button Nose */}
            <ellipse cx="190" cy="205" rx="10" ry="6.5" fill="#1E293B" />
            <ellipse cx="188" cy="203" rx="3.5" ry="2" fill="#FFFFFF" opacity="0.7" />

            {/* Cute Smile Mouth */}
            {isLoading ? (
              <ellipse cx="190" cy="226" rx="7" ry="5.5" fill="#1E293B" />
            ) : (
              <path
                d="M 178 222 Q 190 234 202 222"
                fill="none"
                stroke="#1E293B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}
          </g>

          {/* ======================================================== */}
          {/* 7. COZY BLUE KNITTED SCARF WITH GOLD SHIELD              */}
          {/* ======================================================== */}
          {/* Scarf Wrap */}
          <path
            d="M 110 270 C 150 255, 230 255, 270 270 C 255 305, 125 305, 110 270 Z"
            fill="url(#pixarScarf)"
            filter="url(#pixarShadow)"
          />
          {/* Scarf Hanging Tail */}
          <path
            d="M 130 280 L 145 355 L 175 350 L 160 280 Z"
            fill="url(#pixarScarf)"
            filter="url(#pixarShadow)"
          />
          {/* Gold Embossed Shield Medallion */}
          <circle cx="152" cy="325" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <path
            d="M 149 322 L 155 322 L 155 326 C 155 329, 152 331, 152 331 C 152 331, 149 329, 149 326 Z"
            fill="#B45309"
          />

          {/* ======================================================== */}
          {/* 8. 3D FLUFFY PAWS (Interactive Cover Eyes / Wave)        */}
          {/* ======================================================== */}
          {/* Left Paw */}
          <motion.g
            animate={{
              y: coveringEyes ? -95 : peeking ? -50 : 0,
              x: coveringEyes ? 42 : peeking ? 18 : 0,
              rotate: coveringEyes ? 30 : peeking ? 12 : 0,
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          >
            <ellipse
              cx="100"
              cy="285"
              rx="26"
              ry="22"
              fill="url(#pixarBodyFur)"
              filter="url(#pixarShadow)"
            />
            {/* Claws */}
            <circle cx="88" cy="274" r="5" fill="#E2E8F0" />
            <circle cx="100" cy="270" r="5" fill="#E2E8F0" />
            <circle cx="112" cy="274" r="5" fill="#E2E8F0" />
          </motion.g>

          {/* Right Paw (Waving or Covering Right Eye) */}
          <motion.g
            animate={{
              y: coveringEyes ? -95 : 0,
              x: coveringEyes ? -42 : 0,
              rotate: coveringEyes ? -30 : [0, 8, -8, 0],
            }}
            transition={
              coveringEyes
                ? { type: 'spring', stiffness: 280, damping: 20 }
                : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
            }
          >
            <ellipse
              cx="280"
              cy="285"
              rx="26"
              ry="22"
              fill="url(#pixarBodyFur)"
              filter="url(#pixarShadow)"
            />
            {/* Claws */}
            <circle cx="268" cy="274" r="5" fill="#E2E8F0" />
            <circle cx="280" cy="270" r="5" fill="#E2E8F0" />
            <circle cx="292" cy="274" r="5" fill="#E2E8F0" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md">
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
        {/* LEFT PANEL: 3D Pixar Volumetric Yeti Scene                   */}
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
                <span>{showPassword ? 'Peeking 👀' : 'Eyes Shielded 🙈'}</span>
              </div>
            )}
          </div>

          {/* 3D Pixar Animated Character Center */}
          <div className="relative z-10 flex-1 flex items-center justify-center my-auto py-2">
            <Pixar3DYetiGuardian
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
            <div className="p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-md border border-white/80 shadow-md text-slate-800 space-y-0.5">
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
