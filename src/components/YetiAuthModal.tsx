import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { useVault } from '../context/VaultContext';
import {
  X,
  Eye,
  EyeOff,
  ShieldCheck,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 via-slate-900/20 to-indigo-500/10 pointer-events-none" />

      {/* Main Split Modal Container (Matching Reference: Modern Login Screen UI/UX) */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.28)] border border-slate-100 overflow-hidden flex flex-col md:flex-row my-auto transition-all duration-300 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ============================================================ */}
        {/* LEFT PANEL: Midnight Botanical Mountain Art (WELCOME)        */}
        {/* ============================================================ */}
        <div
          className="md:w-1/2 relative overflow-hidden min-h-[320px] md:min-h-[540px] bg-cover bg-center select-none"
          style={{
            backgroundImage: 'url(/login-art.jpg)',
            backgroundColor: '#0E1726',
          }}
        >
          {/* Subtle vignette shadow */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* ============================================================ */}
        {/* RIGHT PANEL: Pure Clean Minimalist Login / Signup Form       */}
        {/* ============================================================ */}
        <div className="md:w-1/2 p-7 sm:p-10 md:p-12 flex flex-col justify-between bg-white text-slate-800">
          <div>
            {/* Title (Matching Reference: "Login") */}
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight text-center mb-8 mt-2">
              {mode === 'signin' ? 'Login' : mode === 'signup' ? 'Sign up' : 'Reset Password'}
            </h2>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {successMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Underline Field (Matching Reference) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="w-full bg-transparent border-b border-slate-300 focus:border-slate-900 pb-1.5 text-sm text-slate-900 outline-none transition-colors"
                />
              </div>

              {/* Password Underline Field (Matching Reference) */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Password
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full bg-transparent border-b border-slate-300 focus:border-slate-900 pb-1.5 text-sm text-slate-900 outline-none transition-colors pr-7"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 bottom-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password Field (Signup) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      className="w-full bg-transparent border-b border-slate-300 focus:border-slate-900 pb-1.5 text-sm text-slate-900 outline-none transition-colors pr-7"
                    />
                  </div>
                </div>
              )}

              {/* Pill Navy CTA Button (Matching Reference) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#0B1536] hover:bg-[#070D24] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Securing Vault...</span>
                ) : (
                  <span>{mode === 'signin' ? 'Login' : mode === 'signup' ? 'Sign up' : 'Send Reset Link'}</span>
                )}
              </button>
            </form>

            {/* Social / Wallet Sign In Options */}
            {mode !== 'forgot' && (
              <div className="space-y-2.5 pt-5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
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
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleWalletSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[9px]">
                    N
                  </span>
                  <span>Connect Midnight Lace Wallet</span>
                </button>
              </div>
            )}
          </div>

          {/* Mode Switcher Footer (Matching Reference: "Don't have an account? Sign up") */}
          <div className="text-center pt-6 text-xs text-slate-600">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
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
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Back to Login
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
