import React from 'react';
import { 
  ChevronRight, 
  Menu,
  ExternalLink,
  Radio
} from 'lucide-react';

export default function Header({ currentTab, onOpenMobileMenu }) {
  const getTabTitle = () => {
    switch(currentTab) {
      case 'dashboard': 
        return { section: 'Admin', title: 'Dashboard', desc: 'Overview & Analytics' };
      case 'videos': 
        return { section: 'Media', title: 'Videos & Streams', desc: 'Google Drive Catalog' };
      case 'coupons': 
        return { section: 'Audience', title: 'Coupons & Deals', desc: 'Promotions & Passes' };
      case 'viewers': 
        return { section: 'Audience', title: 'Viewer Accounts', desc: 'Tiers & Access Control' };
      default: 
        return { section: 'Admin', title: 'Command Center', desc: 'Platform Management' };
    }
  };

  const { section, title } = getTabTitle();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu Toggle + Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu on Mobile/Tablet */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 lg:hidden transition-colors btn-press"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium hidden sm:inline">{section}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <span className="px-2.5 py-1 rounded-md bg-slate-800/60 border border-slate-700/60 font-semibold text-slate-200">
              {title}
            </span>
          </div>
        </nav>
      </div>

      {/* Right: Sleek, Minimal Utility Group */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Subtle Online Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium hidden sm:inline">Online</span>
        </div>

        {/* View Live Portal Icon Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-all btn-press"
          title="Open Viewer Website"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Admin Profile Chip */}
        <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-[11px] text-white shadow-sm ring-1 ring-white/10">
            A
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Admin</p>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">Superuser</p>
          </div>
        </div>
      </div>
    </header>
  );
}
