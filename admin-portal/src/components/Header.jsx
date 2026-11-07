import React from 'react';
import { 
  Shield, 
  ChevronRight, 
  RotateCcw,
  Menu,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function Header({ currentTab, onRefresh, onOpenMobileMenu }) {
  const db = getDatabase();

  const getTabTitle = () => {
    switch(currentTab) {
      case 'dashboard': 
        return { section: 'Admin', title: 'Dashboard Overview', desc: 'Real-time viewer metrics and platform status' };
      case 'videos': 
        return { section: 'Media', title: 'Videos & Streams', desc: 'Google Drive master videos, audio tracks & subtitles' };
      case 'coupons': 
        return { section: 'Audience', title: 'Coupons & Deals', desc: 'Create and manage promotional discount codes' };
      case 'viewers': 
        return { section: 'Audience', title: 'Viewer Accounts', desc: 'Manage registered users and subscription tiers' };
      default: 
        return { section: 'Admin', title: 'Command Center', desc: 'Platform Management Console' };
    }
  };

  const { section, title } = getTabTitle();

  const handleResetClean = () => {
    if (window.confirm("Purge any cached demo data and reset database to completely clean state?")) {
      db.resetAllToClean();
      if (onRefresh) onRefresh();
      window.location.reload();
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu on Mobile/Tablet */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline">{section}</span>
            <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" />
            <span className="text-slate-100 font-semibold truncate max-w-[140px] sm:max-w-none">{title}</span>
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live Status Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium hidden sm:inline">Live Sync Active</span>
          <span className="font-medium sm:hidden">Live</span>
        </div>

        {/* Open Viewer Website */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs font-medium transition-colors"
          title="Open Viewer Streaming Portal"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Open Viewer Website</span>
          <span className="sm:hidden">Viewer</span>
        </a>

        {/* Purge Cache Button */}
        <button
          onClick={handleResetClean}
          title="Clear all demo/cached records and reset to clean state"
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
