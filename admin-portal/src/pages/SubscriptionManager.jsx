import React, { useState } from 'react';
import { Users, Crown, Download, Film, Check, Search, X, ShieldCheck } from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function SubscriptionManager() {
  const db = getDatabase();
  const [users, setUsers] = useState(db.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL' | 'PREMIUM' | 'FREE'
  const [notification, setNotification] = useState('');

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || u.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalUsers = users.length;
  const vipUsers = users.filter(u => u.tier === 'PREMIUM').length;
  const freeUsers = users.filter(u => u.tier === 'FREE').length;

  const toggleTier = (userId) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        const newTier = u.tier === 'PREMIUM' ? 'FREE' : 'PREMIUM';
        return {
          ...u,
          tier: newTier,
          expiresAt: newTier === 'PREMIUM' ? '2027-11-05' : null
        };
      }
      return u;
    });
    setUsers(updated);
    db.saveUsers(updated);
    setNotification("Updated user subscription tier!");
    setTimeout(() => setNotification(''), 2500);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Viewer Accounts & Subscriptions</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
              {totalUsers} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor registered viewers, manage membership tiers, and upgrade accounts to VIP Premium.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email or name..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setTierFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            tierFilter === 'ALL'
              ? 'bg-slate-850 border-blue-500/40 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Total Viewers</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-100 mt-1">{totalUsers}</p>
        </button>

        <button
          onClick={() => setTierFilter('PREMIUM')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            tierFilter === 'PREMIUM'
              ? 'bg-slate-850 border-amber-500/40 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">VIP Premium Members</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-blue-400 mt-1">{vipUsers}</p>
        </button>

        <button
          onClick={() => setTierFilter('FREE')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            tierFilter === 'FREE'
              ? 'bg-slate-850 border-slate-600 shadow-sm'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Free Tier (With Ads)</span>
            <Film className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xl font-bold text-slate-300 mt-1">{freeUsers}</p>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-100 text-xs sm:text-sm">
            Accounts ({filteredUsers.length})
          </h3>
          <span className="text-xs text-slate-400">View-only access for regular viewers</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-14 px-4 text-center text-slate-500 text-xs space-y-2">
            <Users className="w-9 h-9 text-slate-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-slate-300">No viewer accounts found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When viewers sign in or subscribe on the streaming website (Port 3000), their accounts, tiers, and offline downloads will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 sm:px-5 py-3">Viewer Profile</th>
                  <th className="px-4 sm:px-5 py-3">Plan Tier</th>
                  <th className="px-4 sm:px-5 py-3">In-App Vaults</th>
                  <th className="px-4 sm:px-5 py-3">Streams Watched</th>
                  <th className="px-4 sm:px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="px-4 sm:px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                          {u.name?.slice(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100 text-xs">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5">
                      {u.tier === 'PREMIUM' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/30 inline-flex items-center gap-1">
                          <Crown className="w-3 h-3 text-amber-400" />
                          VIP Premium
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          Free (With Ads)
                        </span>
                      )}
                    </td>

                    <td className="px-4 sm:px-5 py-3.5">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.offlineDownloadsCount || 0} titles</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5">
                      <div className="flex items-center space-x-1.5 text-slate-300">
                        <Film className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.streamsWatched || 0} views</span>
                      </div>
                    </td>

                    <td className="px-4 sm:px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleTier(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                          u.tier === 'PREMIUM'
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {u.tier === 'PREMIUM' ? 'Switch to Free' : 'Grant VIP'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
