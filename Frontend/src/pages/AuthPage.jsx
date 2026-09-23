import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LOGO_SRC from '../assets/logo.png';
import { Shield, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, signin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(name, email, password, role);
        navigate('/dashboard');
      } else {
        await signin(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050811] flex items-center justify-center px-4 py-12 transition-colors duration-300">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Logo and branding */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <motion.img
            whileHover={{ rotate: 10 }}
            alt="EduSphere Logo"
            className="h-10 w-auto object-contain drop-shadow-md"
            src={LOGO_SRC}
          />
          <span className="font-display text-2xl text-slate-900 dark:text-white font-bold tracking-tight transition-colors">
            EduSphere
          </span>
        </Link>

        {/* Auth card */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] p-8 transition-colors duration-300">
          {/* Header */}
          <div className="text-center mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm transition-colors">
                  {isSignUp
                    ? 'Join your institution on EduSphere'
                    : 'Sign in to access your academic dashboard'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name field (signup only) */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[20px]">
                      person
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Jane Smith"
                      required={isSignUp}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[20px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Role selector (signup only) */}
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 transition-colors">
                    I am a
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'student', icon: 'school', label: 'Student' },
                      { value: 'faculty', icon: 'history_edu', label: 'Faculty' },
                      { value: 'admin', icon: 'admin_panel_settings', label: 'Admin' },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-semibold transition-all ${
                          role === r.value
                            ? 'bg-secondary/10 dark:bg-cyan-900/30 border-secondary dark:border-cyan-500 text-secondary dark:text-cyan-400'
                            : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-blue-500 text-white font-bold text-sm shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="material-symbols-outlined text-[18px]"
                  >
                    progress_activity
                  </motion.span>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {isSignUp ? 'person_add' : 'login'}
                  </span>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 transition-colors" />
            <span className="text-xs text-slate-400 dark:text-slate-600 font-medium transition-colors">OR</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 transition-colors" />
          </div>

          {/* Toggle mode */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 transition-colors">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-secondary dark:text-cyan-400 font-bold hover:underline transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Create one'}
            </button>
          </p>
        </div>

        {/* Back to home */}
        <Link
          to="/"
          className="flex items-center justify-center gap-1.5 mt-6 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to homepage
        </Link>
      </motion.div>
    </div>
  );
}
