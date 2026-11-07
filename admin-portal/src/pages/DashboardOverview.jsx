import React from 'react';
import { 
  Users, 
  CreditCard, 
  Film, 
  Tag, 
  ArrowRight,
  Tv,
  Sparkles
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
    <div className="space-y-5 sm:space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-100">Executive Dashboard</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time management of video streams, registered viewers, and promotional passes.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('videos')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Add Video</span>
          </button>
          <button
            onClick={() => onNavigate('coupons')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Videos */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Catalog Titles</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Film className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{videos.length}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Ingested video streams</p>
          </div>
        </div>

        {/* Total Viewers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Total Viewers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{totalUsers}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Registered viewer accounts</p>
          </div>
        </div>

        {/* Paid VIP Subscriptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">VIP Premium</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{premiumUsers}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Full HD / 4K subscribers</p>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Active Coupons</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{totalCoupons}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Promotional discount passes</p>
          </div>
        </div>
      </div>

      {/* Grid: Audience & Content Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Tier Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Viewer Plan Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Free standard vs VIP subscriptions</p>
          </div>

          {totalUsers === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No viewers registered yet. Viewers will appear here as they sign in on the streaming portal.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">VIP Premium Tier</span>
                  <span className="text-slate-200 font-semibold">{premiumPercent}% ({premiumUsers})</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${premiumPercent}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Free Member Tier</span>
                  <span className="text-slate-200 font-semibold">{freePercent}% ({freeUsers})</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-slate-700 h-2 rounded-full" 
                    style={{ width: `${freePercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Authentication Provider:</span>
            <span className="font-semibold text-slate-200">Google Firebase Auth</span>
          </div>
        </div>

        {/* Content Catalog Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-sm">Catalog Distribution</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950/40 text-blue-300 border border-blue-800/50">
              {videos.length} Total Titles
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-blue-400" /> Movies
              </span>
              <span className="font-semibold text-slate-200">{moviesCount} titles</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-indigo-400" /> Series
              </span>
              <span className="font-semibold text-slate-200">{seriesCount} titles</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Originals
              </span>
              <span className="font-semibold text-slate-200">{originalsCount} titles</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('videos')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>Manage Video Streams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Access Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-semibold text-slate-100 text-sm mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('videos')}
            className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <Film className="w-4 h-4 text-blue-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="font-semibold text-xs text-slate-200">Video Catalog</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{videos.length} videos published</p>
          </button>

          <button
            onClick={() => onNavigate('coupons')}
            className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <Tag className="w-4 h-4 text-indigo-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="font-semibold text-xs text-slate-200">Discount Coupons</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{totalCoupons} coupons active</p>
          </button>

          <button
            onClick={() => onNavigate('viewers')}
            className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="font-semibold text-xs text-slate-200">Viewer Management</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage Free & VIP accounts</p>
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
