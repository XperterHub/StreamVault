import React from 'react';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Download, 
  Film, 
  Tag, 
  ShieldCheck, 
  HardDrive,
  Tv,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function DashboardOverview({ onNavigate }) {
  const db = getDatabase();
  const metrics = db.getMetrics();
  const users = db.getUsers();
  const videos = db.getVideos();
  const settings = db.getSettings();

  const totalUsers = users.length;
  const premiumUsers = users.filter(u => u.tier === 'PREMIUM').length;
  const freeUsers = users.filter(u => u.tier === 'FREE').length;
  const premiumPercent = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0;
  const freePercent = totalUsers > 0 ? Math.round((freeUsers / totalUsers) * 100) : 0;
  const isDriveLinked = !!settings.googleDriveServiceAccountEmail;

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
            Real-time live monitoring of registered viewers, subscriptions, and Google Drive video stream metrics.
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

      {/* Real-Time Platform Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-medium">Drive Bridge</span>
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            isDriveLinked ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {isDriveLinked ? 'Connected' : 'Not Linked'}
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-medium">AdSense IMA</span>
          </div>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            settings.adSensePublisherId ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-400'
          }`}>
            {settings.adSensePublisherId ? 'Active' : 'Unset'}
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-300 font-medium">Anti-Piracy</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            Enforced
          </span>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-medium">Viewer App</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            Port 3000
          </span>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Mobile 1 col, Tablet 2 cols, Desktop 4 cols) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Viewers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Total Viewers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{totalUsers}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Normal users (view-only on Port 3000)</p>
          </div>
        </div>

        {/* Paid VIP Subscriptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Paid Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{premiumUsers}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Ad-Free & 1080p/4K unlocked</p>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">Monthly Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">${metrics.monthlyRecurringRevenueUSD}</h3>
            <p className="text-[11px] text-slate-400 mt-1">From active paid subscriptions</p>
          </div>
        </div>

        {/* In-App Offline Downloads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-300">In-App Offline Vaults</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Download className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-100">{metrics.inAppOfflineDownloadsActive}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Encrypted in-app (IndexedDB AES-256)</p>
          </div>
        </div>
      </div>

      {/* Grid: Audience Breakdown & Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Tier Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Viewer Plan Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Free ad-supported vs paid VIP subscriptions</p>
          </div>

          {totalUsers === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No viewers registered yet. Viewers will appear here as they sign in on Port 3000.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">VIP Premium (Ad-Free, 4K, Offline)</span>
                  <span className="text-slate-200 font-semibold">{premiumPercent}%</span>
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
                  <span className="text-slate-300 font-medium">Free Tier (Ad-Supported 720p)</span>
                  <span className="text-slate-200 font-semibold">{freePercent}%</span>
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
            <span>Video Ad Impressions:</span>
            <span className="font-semibold text-slate-200">{metrics.adImpressionsDelivered} played</span>
          </div>
        </div>

        {/* Google AdSense / Video Ads */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-sm">Google AdSense (IMA Ads)</h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
              settings.adSensePublisherId
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {settings.adSensePublisherId ? 'Configured' : 'Setup Required'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Publisher ID:</span>
              <span className="font-mono text-slate-200 truncate max-w-[150px]">
                {settings.adSensePublisherId || 'Not Configured'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Est. Video Ad Revenue:</span>
              <span className="font-semibold text-slate-100">$0.00</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Placements:</span>
              <span className="text-slate-200 font-medium">Pre-Roll + Mid + Post</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>Configure AdSense Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Anti-Piracy Shields Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-100 text-sm">Anti-Piracy Shields</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
              Enforced
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Dynamic Floating Watermark</span>
              <span className="text-slate-200 font-medium">User ID + IP Overlay</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Screen Record Suppression</span>
              <span className="text-slate-200 font-medium">Canvas Blanking</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">HTML5 Video Ripping Block</span>
              <span className="text-slate-200 font-medium">In-Memory Chunks</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">DevTools Timing Trap</span>
              <span className="text-slate-200 font-medium">Debugger Tripwire</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('settings')}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>Adjust Security Toggles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-semibold text-slate-100 text-sm mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            <p className="text-[11px] text-slate-500 mt-0.5">{couponsCount(db)} coupons generated</p>
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
            <p className="text-[11px] text-slate-500 mt-0.5">Manage Free & VIP tiers</p>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <HardDrive className="w-4 h-4 text-amber-400" />
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>
            <p className="font-semibold text-xs text-slate-200">Cloud & DRM Settings</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Google Drive & AdSense</p>
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
