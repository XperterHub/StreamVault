import React, { useState } from 'react';
import { Lock, User, KeyRound, AlertCircle, Shield } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function LoginModal() {
  const { login } = useAdminAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setError(res.message);
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 relative animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shadow-sm">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Admin Sign In</h2>
          <p className="text-xs text-slate-400 mt-1">Authorized personnel only</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-start space-x-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Admin Login ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Default credentials: <span className="text-slate-300 font-mono">admin</span> / <span className="text-slate-300 font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
