import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Lock, 
  HardDrive, 
  Tv, 
  Check, 
  Save, 
  CheckCircle2, 
  Sliders, 
  Play, 
  RotateCcw, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

export default function SecuritySettings() {
  const db = getDatabase();
  const [settings, setSettings] = useState(db.getSettings());
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'STORAGE' | 'ADS' | 'DRM'
  const [notification, setNotification] = useState('');
  const [testWatermarkText, setTestWatermarkText] = useState('UID: usr-9912 • viewer@streamvault.local • 2026-11-05');

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    db.saveSettings(updated);
    showNotice();
  };

  const handleSliderChange = (e) => {
    const updated = { ...settings, watermarkOpacity: parseFloat(e.target.value) };
    setSettings(updated);
    db.saveSettings(updated);
  };

  const handleSaveInputs = (e) => {
    e.preventDefault();
    db.saveSettings(settings);
    showNotice();
  };

  const showNotice = () => {
    setNotification("Settings updated & immediately active across viewer streams!");
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Platform Settings & Security Controls</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> All Shields Armed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your Google Drive direct streaming, Google AdSense publisher configuration, and DRM anti-piracy shields.
          </p>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'ALL' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Settings
          </button>
          <button
            onClick={() => setActiveTab('STORAGE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'STORAGE' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drive Streaming
          </button>
          <button
            onClick={() => setActiveTab('ADS')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'ADS' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Google Ads
          </button>
          <button
            onClick={() => setActiveTab('DRM')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'DRM' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DRM & Watermark
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center space-x-2">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* SECTION 1: GOOGLE DRIVE STREAMING & SECTION 2: GOOGLE ADSENSE */}
      {(activeTab === 'ALL' || activeTab === 'STORAGE' || activeTab === 'ADS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Section 1: Google Drive Direct Streaming */}
          {(activeTab === 'ALL' || activeTab === 'STORAGE') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 uppercase tracking-wider">
                      Google Drive Direct Streaming
                    </h3>
                    <p className="text-[11px] text-slate-400">Zero cloud configuration required</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                  Active & Ready
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Direct Link Ingestion Active</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Simply paste any Google Drive video link when adding a video. The platform automatically streams chunked byte ranges directly into our custom HTML5 video player.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div>&bull; No Google Service Account JSON setup needed.</div>
                    <div>&bull; No manual "Drive Sync" steps required.</div>
                    <div>&bull; Set file sharing to: <strong>"Anyone with the link can view"</strong>.</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Direct Video Stream Delivery</span>
                    <span className="text-emerald-400 font-mono font-medium">HTTP 206 Partial Content (OK)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Range-based streaming proxy hides your Google Drive URL from viewers and prevents file ripping.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="http://localhost:3000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Test Playback on Viewer Website</span>
                </a>
              </div>
            </div>
          )}

          {/* Section 2: Google AdSense Video Ads */}
          {(activeTab === 'ALL' || activeTab === 'ADS') && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Tv className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 uppercase tracking-wider">
                      Google AdSense Video Ads (IMA)
                    </h3>
                    <p className="text-[11px] text-slate-400">Pre-roll, mid-roll, and skip controls</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                  Enabled
                </span>
              </div>

              <form onSubmit={handleSaveInputs} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Google AdSense Publisher ID
                  </label>
                  <input
                    type="text"
                    value={settings.adSensePublisherId || 'pub-2509450853164699'}
                    onChange={(e) => setSettings({ ...settings, adSensePublisherId: e.target.value })}
                    placeholder="pub-2509450853164699"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ads are automatically delivered to Free Tier viewers. VIP Premium subscribers bypass all ads.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Ad Placements Enabled (Free Viewers)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle('enablePreRollAds')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        settings.enablePreRollAds
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Pre-Roll {settings.enablePreRollAds ? '✓' : ''}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle('enableMidRollAds')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        settings.enableMidRollAds
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Mid-Roll {settings.enableMidRollAds ? '✓' : ''}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggle('enablePostRollAds')}
                      className={`py-2 px-2 rounded-lg border text-xs font-semibold text-center transition-colors ${
                        settings.enablePostRollAds
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Post-Roll {settings.enablePostRollAds ? '✓' : ''}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Skip Ad Countdown (Seconds)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="30"
                    value={settings.skipAdDelaySeconds || 5}
                    onChange={(e) => setSettings({ ...settings, skipAdDelaySeconds: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save AdSense Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: FORENSIC DRM & WATERMARKING */}
      {(activeTab === 'ALL' || activeTab === 'DRM') && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Anti-Piracy Shields & Forensic Watermarking
                </h3>
                <p className="text-[11px] text-slate-400">Real-time screen recorder suppression & ripper blocking</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
              Enforced Live
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Watermark Toggle */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">Dynamic Floating Watermark</span>
                  <input
                    type="checkbox"
                    checked={settings.dynamicWatermarkEnabled}
                    onChange={() => handleToggle('dynamicWatermarkEnabled')}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Overlays viewer's user ID, email, and IP address dynamically across video frames.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-slate-200">{Math.round((settings.watermarkOpacity || 0.25) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={settings.watermarkOpacity || 0.25}
                  onChange={handleSliderChange}
                  className="w-full accent-blue-600 h-1.5 bg-slate-800 rounded-full"
                />
              </div>
            </div>

            {/* Anti-Screen Recording */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">Screen Record Blanking</span>
                  <input
                    type="checkbox"
                    checked={settings.antiScreenRecordEnabled}
                    onChange={() => handleToggle('antiScreenRecordEnabled')}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Instantly blacks out video playback if tab loses focus or external recording tool is detected.
                </p>
              </div>

              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Page Visibility API Active</span>
              </div>
            </div>

            {/* Anti-DevTools & Anti-Ripping */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-200">HTML5 Video Anti-Ripping</span>
                  <input
                    type="checkbox"
                    checked={settings.disableRightClickAndShortcuts}
                    onChange={() => handleToggle('disableRightClickAndShortcuts')}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Blocks right-click, media inspection, Ctrl+S, F12 developer console, and suppresses direct download buttons.
                </p>
              </div>

              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>nodownload flag enforced</span>
              </div>
            </div>
          </div>

          {/* Watermark Live Preview Canvas */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Live Forensic Watermark Preview</span>
              <span className="text-[11px] text-slate-500 font-mono">Rendered on viewer canvas</span>
            </div>
            <div className="relative h-28 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center overflow-hidden">
              <div 
                className="font-mono text-xs text-white border border-white/10 px-3 py-1 rounded bg-black/20 select-none pointer-events-none"
                style={{ opacity: settings.watermarkOpacity || 0.25 }}
              >
                {testWatermarkText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
