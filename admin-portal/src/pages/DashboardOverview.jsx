import React from 'react';
import { 
  Users, 
  CreditCard, 
  Film, 
  Tag, 
  ArrowRight,
  Tv,
  Sparkles,
  TrendingUp,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function DashboardOverview({ onNavigate }) {
  const db = getDatabase();
  const users = db.getUsers();
  const videos = db.getVideos();

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.tier === 'PREMIUM').length;
  const freeUsers = users.filter(u => u.tier === 'FREE').length;
  const premiumPercent = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const freePercent = totalUsers > 0 ? Math.round((freeUsers / totalUsers) * 100) : 0;

  const moviesCount = videos.filter(v => v.type === 'movies').length;
  const seriesCount = videos.filter(v => v.type === 'series').length;
  const originalsCount = videos.filter(v => v.type === 'originals').length;
  const totalCoupons = couponsCount(db);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/90 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
            Real-time management console for video streams, viewer accounts, and promotional coupons.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => onNavigate('videos')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] btn-press"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Add Video</span>
          </button>
          <button
            onClick={() => onNavigate('coupons')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all hover:border-slate-600 btn-press"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Videos */}
        <div 
          onClick={() => onNavigate('videos')}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Catalog Titles
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Film className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{videos.length}</h3>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Ingested video streams</span>
              <span className="text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                Manage &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Total Viewers */}
        <div 
          onClick={() => onNavigate('viewers')}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Registered Viewers
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{totalUsers}</h3>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Audience accounts</span>
              <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                Inspect &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Paid VIP Subscriptions */}
        <div 
          onClick={() => onNavigate('viewers')}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              VIP Premium
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{premiumUsers}</h3>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Ultra-HD subscribers</span>
              <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                {premiumPercent}% &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Active Coupons */}
        <div 
          onClick={() => onNavigate('coupons')}
          className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 card-hover cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
              Active Coupons
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{totalCoupons}</h3>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Promotional passes</span>
              <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center">
                Deals &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Audience & Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Tier Distribution */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Viewer Plan Distribution</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {totalUsers} Viewers
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Ratio between free standard viewers and VIP members</p>
          </div>

          {totalUsers === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-slate-800/50">
              No viewers registered yet. As viewers sign in via Google Auth, they will be listed here.
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    VIP Premium Tier
                  </span>
                  <span className="text-slate-200 font-bold">{premiumPercent}% ({premiumUsers})</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(premiumPercent, 3)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Free Member Tier
                  </span>
                  <span className="text-slate-200 font-bold">{freePercent}% ({freeUsers})</span>
                </div>
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                  <div 
                    className="bg-slate-600 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(freePercent, 3)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Google Firebase Auth Provider
            </span>
            <button
              onClick={() => onNavigate('viewers')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Manage Accounts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Catalog Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Catalog Distribution</span>
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/40">
              {videos.length} Titles Ingested
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-colors">
              <span className="text-slate-300 flex items-center gap-2.5 font-medium">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Film className="w-3.5 h-3.5" />
                </div>
                Movies Collection
              </span>
              <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                {moviesCount} titles
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-colors">
              <span className="text-slate-300 flex items-center gap-2.5 font-medium">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Tv className="w-3.5 h-3.5" />
                </div>
                Television Series
              </span>
              <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                {seriesCount} titles
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700/60 transition-colors">
              <span className="text-slate-300 flex items-center gap-2.5 font-medium">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                Exclusive Originals
              </span>
              <span className="font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                {originalsCount} titles
              </span>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Multi-audio & Subtitle tracks</span>
            <button
              onClick={() => onNavigate('videos')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Manage Titles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="font-bold text-slate-100 text-sm mb-4">Quick Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <button
            onClick={() => onNavigate('videos')}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/40 text-left transition-all duration-200 group card-hover btn-press"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="font-bold text-xs text-slate-100 group-hover:text-white transition-colors">Video Catalog</p>
            <p className="text-[11px] text-slate-500 mt-1">{videos.length} videos ingested</p>
          </button>

          <button
            onClick={() => onNavigate('coupons')}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 text-left transition-all duration-200 group card-hover btn-press"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Tag className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="font-bold text-xs text-slate-100 group-hover:text-white transition-colors">Discount Coupons</p>
            <p className="text-[11px] text-slate-500 mt-1">{totalCoupons} promotional codes</p>
          </button>

          <button
            onClick={() => onNavigate('viewers')}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-indigo-500/40 text-left transition-all duration-200 group card-hover btn-press"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="font-bold text-xs text-slate-100 group-hover:text-white transition-colors">Viewer Management</p>
            <p className="text-[11px] text-slate-500 mt-1">Manage accounts & subscriptions</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function couponsCount(db) {
  try {
    return db.getCoupons().length;
  } catch (e) {
    return 0;
  }
}
