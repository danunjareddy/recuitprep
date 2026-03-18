import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Check, RotateCcw, ChevronLeft, Loader2, Shield } from 'lucide-react';

interface SignupProps {
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

export default function Signup({ onClose, onSuccess, onSwitchToLogin }: SignupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept terms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        // Simulate user data
        const user = { id: Date.now(), email };
        localStorage.setItem('user', JSON.stringify(user));
        onSuccess(data.token, user);
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Server error. Check if backend running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 max-w-md w-full rounded-3xl p-8 space-y-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <ChevronLeft size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Repeat password"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl cursor-pointer group hover:border-zinc-600 transition-all">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-300">
              I accept the{' '}
              <span className="text-emerald-400 font-bold hover:underline cursor-pointer">Terms of Service</span>
              {' '}and{' '}
              <span className="text-emerald-400 font-bold hover:underline cursor-pointer">Privacy Policy</span>
            </span>
          </label>

          <button 
            type="submit" 
            disabled={loading || password !== confirmPassword || !termsAccepted}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-600/50 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield size={20} />}
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center space-y-4">
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="w-full text-emerald-400 hover:text-emerald-300 font-bold text-sm transition-colors"
          >
            Already have an account? Sign in
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-400 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

