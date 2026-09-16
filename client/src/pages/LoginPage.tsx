import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loginDemo } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (errorParam === 'access_denied') {
      setErrorMsg('GitHub authorization was canceled. Please try again.');
    } else if (errorParam === 'invalid_state') {
      setErrorMsg('Security state validation failed (CSRF check). Please try again.');
    } else if (errorParam === 'oauth_not_configured') {
      setErrorMsg('GitHub OAuth is not configured in server .env. Click Demo Login to continue.');
    } else if (errorParam) {
      setErrorMsg('GitHub authentication failed. Please try again.');
    }
  }, [errorParam]);

  const handleGitHubLogin = () => {
    if (connecting) return;
    setConnecting(true);
    setErrorMsg(null);

    // Redirect browser to backend GitHub OAuth authorization endpoint
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBaseUrl}/auth/github`;
  };

  const handleDemoLogin = async () => {
    await loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0E14] text-gray-200 flex flex-col justify-between py-12 px-6 selection:bg-indigo-500 selection:text-white">
      {/* Top Header Logo */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-glow">
            <div className="w-full h-full bg-[#0D1117] rounded-[10px] flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              Codebase <span className="text-indigo-400 font-mono">Doctor</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-xs font-mono text-gray-400 hover:text-white transition"
        >
          Back to Home
        </button>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 my-auto"
      >
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Log in to Codebase Doctor
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            AI-powered software maintenance & health audit platform
          </p>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Elements */}
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0A0E14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition"
            >
              Continue with Email
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-mono text-gray-500 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Continue with GitHub Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={connecting}
            className={`w-full py-3.5 px-4 rounded-xl border border-white/15 bg-[#161B26] hover:bg-[#1f2636] text-white font-semibold text-sm transition shadow-glow flex items-center justify-center gap-3 ${
              connecting ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'
            }`}
          >
            {/* GitHub SVG Icon */}
            <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>{connecting ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
          </button>
        </div>

        {/* Demo Fast Track Login */}
        <div className="pt-2 text-center">
          <button
            onClick={handleDemoLogin}
            className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition flex items-center justify-center gap-1 mx-auto"
          >
            <span>Or enter instantly via Demo Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Signup text */}
        <div className="text-center text-xs text-gray-500 font-mono pt-2">
          Don't have an account?{' '}
          <button onClick={handleGitHubLogin} className="text-indigo-400 hover:underline font-semibold">
            Sign Up
          </button>
        </div>
      </motion.div>

      {/* Footer Terms */}
      <footer className="max-w-md mx-auto w-full text-center text-[11px] font-mono text-gray-600 flex justify-center gap-6">
        <a href="#terms" className="hover:text-gray-400">Terms</a>
        <a href="#privacy" className="hover:text-gray-400">Privacy Policy</a>
      </footer>
    </div>
  );
};
