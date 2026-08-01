import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name'); setIsSubmitting(false); return; }
        await signup(name, email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.message || err?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex items-center justify-center relative px-4"
    >
      <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/vjMvFSmGUxEtqVdaZgvFee9XkZl.jpg')] bg-cover bg-center opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/90" />

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', damping: 20 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] bg-clip-text text-transparent tracking-tight">emoplay+</h1>
        </div>

        <div className="bg-black/70 backdrop-blur-2xl p-10 rounded-2xl border border-white/10 shadow-2xl">
          {/* Toggle Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8">
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${(i === 0) === isLogin ? 'bg-[#0a84ff] text-white shadow-lg' : 'text-[#98989d] hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989d]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-4 rounded-xl outline-none focus:border-[#0a84ff] transition-colors placeholder-[#57575b]"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989d]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-4 rounded-xl outline-none focus:border-[#0a84ff] transition-colors placeholder-[#57575b]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989d]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-12 py-4 rounded-xl outline-none focus:border-[#0a84ff] transition-colors placeholder-[#57575b]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98989d] hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0a84ff] hover:bg-[#0070e0] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(10,132,255,0.3)]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-[#98989d] text-sm hover:text-white transition-colors hover:underline">
                Forgot password?
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-[#57575b] text-sm">
            {isLogin ? "New to emoplay? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-white hover:underline font-medium">
              {isLogin ? 'Sign up now.' : 'Sign in.'}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
