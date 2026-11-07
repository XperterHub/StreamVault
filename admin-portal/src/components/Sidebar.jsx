import React from 'react';
import { 
  LayoutDashboard, 
  Film, 
  Tag, 
  Users, 
  LogOut, 
  X,
  Radio,
  Tv
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Sidebar({ currentTab, setCurrentTab, isMobileOpen, setIsMobileOpen }) {
  const { logout, adminUser } = useAdminAuth();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & Analytics' },
    { id: 'videos', name: 'Videos & Streams', icon: Film, desc: 'Google Drive Catalog' },
    { id: 'coupons', name: 'Coupons & Deals', icon: Tag, desc: 'Promotions & Passes' },
    { id: 'viewers', name: 'Viewer Accounts', icon: Users, desc: 'Tiers & Access Control' }
  ];

  const handleSelectTab = (id) => {
    setCurrentTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col h-full select-none shrink-0 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(37,99,235,0.35)] ring-1 ring-white/20">
              SV
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-slate-100 tracking-tight">StreamVault</h1>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Control Center</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden btn-press"
            title="Close Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Portal Status */}
        <div className="px-4 sm:px-5 pt-3.5 pb-2">
          <div className="px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Viewer Portal
            </span>
            <span className="text-emerald-400 text-[11px] font-semibold">
              Active
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/15 text-white border border-blue-500/30 shadow-[0_4px_15px_-3px_rgba(37,99,235,0.25)] font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-0.5'
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_#3b82f6]" />
                )}

                <div className="flex items-center space-x-3 text-left">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="leading-tight font-medium text-xs text-slate-200 group-hover:text-white">
                      {item.name}
                    </div>
                    <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-200">
                {adminUser?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  {adminUser?.email?.split('@')[0] || 'admin'}
                </div>
                <div className="text-[10px] text-slate-500">Super Administrator</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors btn-press"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
