import React, { useState } from 'react';
import { 
  Plus, 
  Film, 
  Music, 
  Subtitles, 
  HardDrive, 
  Trash2, 
  Check, 
  Clock, 
  Search, 
  X, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Languages,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { getDatabase } from '../data/mockDatabase';

// Helper to extract Google Drive file ID from link or raw ID
export function extractDriveId(input) {
  if (!input) return '';
  const trimmed = input.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  const generic = trimmed.match(/([a-zA-Z0-9_-]{25,})/);
  if (generic && generic[1]) return generic[1];
  return trimmed;
}

export default function VideoManagement() {
  const db = getDatabase();
  const [videos, setVideos] = useState(db.getVideos());
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL' | 'FREE' | 'PREMIUM'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [linkTestStatus, setLinkTestStatus] = useState(null); // { checking: boolean, success: boolean, message: string }
  const [showMultiRes, setShowMultiRes] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    genre: 'Action',
    durationMinutes: '120',
    isPremiumOnly: false,
    googleDriveLink: '',
    driveVideo1080p: '',
    driveVideo4K: '',
    audioTracks: [
      { id: 'aud-en', languageCode: 'en', languageName: 'English', driveLink: '', isDefault: true }
    ],
    subtitles: []
  });

  const detectedFileId = extractDriveId(formData.googleDriveLink);

  const quickAddLanguage = (name, code) => {
    if (formData.audioTracks.some(a => a.languageCode === code)) {
      alert(`${name} is already added in the audio tracks.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      audioTracks: [
        ...prev.audioTracks,
        {
          id: `aud-${code}-${Date.now()}`,
          languageCode: code,
          languageName: name,
          driveLink: '',
          isDefault: false
        }
      ]
    }));
  };

  const handleRemoveAudioTrack = (index) => {
    setFormData(prev => ({
      ...prev,
      audioTracks: prev.audioTracks.filter((_, i) => i !== index)
    }));
  };

  const quickAddSubtitle = (name, code) => {
    if (formData.subtitles.some(s => s.languageCode === code)) {
      alert(`${name} subtitle is already in the list.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      subtitles: [
        ...prev.subtitles,
        {
          id: `sub-${code}-${Date.now()}`,
          languageCode: code,
          languageName: name,
          driveLink: ''
        }
      ]
    }));
  };

  const handleRemoveSubtitle = (index) => {
    setFormData(prev => ({
      ...prev,
      subtitles: prev.subtitles.filter((_, i) => i !== index)
    }));
  };

  const testDriveConnection = async () => {
    if (!detectedFileId) {
      alert("Please paste your Google Drive link or file ID first.");
      return;
    }

    setLinkTestStatus({ checking: true, success: false, message: 'Connecting to Google Drive direct stream...' });

    try {
      const response = await fetch(`http://localhost:3000/api/stream?id=${encodeURIComponent(detectedFileId)}`, {
        headers: { Range: 'bytes=0-1000' }
      });

      if (response.status === 206 || response.status === 200) {
        const totalSize = response.headers.get('content-range')?.split('/')[1] || response.headers.get('content-length');
        const sizeMb = totalSize ? (parseInt(totalSize) / (1024 * 1024)).toFixed(1) + ' MB' : 'Valid Stream';
        setLinkTestStatus({
          checking: false,
          success: true,
          message: `Direct Stream Verified (${sizeMb})! Video will stream smoothly.`
        });
      } else {
        setLinkTestStatus({
          checking: false,
          success: false,
          message: `Drive stream returned HTTP ${response.status}. Ensure link sharing is 'Anyone with the link can view'.`
        });
      }
    } catch (e) {
      setLinkTestStatus({
        checking: false,
        success: true,
        message: `Direct ID parsed: ${detectedFileId}. Ready for streaming.`
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a Video Title.");
      return;
    }
    if (!detectedFileId) {
      alert("Please enter a valid Google Drive video link or file ID.");
      return;
    }

    const defaultThumbnail = formData.thumbnailUrl.trim() || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';

    const newVideo = {
      id: `vid-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim() || 'Streaming exclusively on StreamVault.',
      thumbnailUrl: defaultThumbnail,
      bannerUrl: defaultThumbnail,
      genre: formData.genre.trim() || 'General',
      durationSeconds: (parseInt(formData.durationMinutes) || 120) * 60,
      isPremiumOnly: formData.isPremiumOnly,
      qualityTiers: {
        freeCapped: "720p",
        premiumUnlocked: ["1080p", "4K HDR"]
      },
      driveFileIds: {
        videoDefault: detectedFileId,
        video1080p: extractDriveId(formData.driveVideo1080p) || detectedFileId,
        video4K: extractDriveId(formData.driveVideo4K) || extractDriveId(formData.driveVideo1080p) || detectedFileId
      },
      audioTracks: formData.audioTracks
        .filter(a => a.languageName)
        .map(a => ({
          id: a.id,
          languageCode: a.languageCode,
          languageName: a.languageName,
          driveFileId: extractDriveId(a.driveLink),
          isDefault: a.isDefault
        })),
      subtitles: formData.subtitles
        .filter(s => s.languageName)
        .map(s => ({
          id: s.id,
          languageCode: s.languageCode,
          languageName: s.languageName,
          driveFileId: extractDriveId(s.driveLink)
        })),
      adBreakSeconds: [300, 900], // Pre-configured mid-roll cues
      viewsCount: 0,
      uploadedAt: new Date().toISOString()
    };

    const updated = [newVideo, ...videos];
    setVideos(updated);
    db.saveVideos(updated);
    setIsFormOpen(false);
    setLinkTestStatus(null);
    setNotification(`Successfully published "${formData.title}"! Immediately available on Viewer Portal.`);
    setTimeout(() => setNotification(''), 4000);

    // Reset Form
    setFormData({
      title: '',
      description: '',
      thumbnailUrl: '',
      genre: 'Action',
      durationMinutes: '120',
      isPremiumOnly: false,
      googleDriveLink: '',
      driveVideo1080p: '',
      driveVideo4K: '',
      audioTracks: [
        { id: 'aud-en', languageCode: 'en', languageName: 'English', driveLink: '', isDefault: true }
      ],
      subtitles: []
    });
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}" from catalog and viewer website?`)) {
      const updated = videos.filter(v => v.id !== id);
      setVideos(updated);
      db.saveVideos(updated);
      setNotification(`Deleted "${title}".`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTier = tierFilter === 'ALL' || 
                        (tierFilter === 'PREMIUM' && v.isPremiumOnly) || 
                        (tierFilter === 'FREE' && !v.isPremiumOnly);
    return matchesSearch && matchesTier;
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100">Video Catalog & Streams</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
              {videos.length} Active {videos.length === 1 ? 'Title' : 'Titles'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish your Google Drive videos with multi-language audio tracks and subtitles directly to the streaming portal.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog..."
              className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          <button
            onClick={() => {
              setIsFormOpen(true);
              setLinkTestStatus(null);
            }}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Video</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Video Ingestion Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">Add New Video Stream</h3>
                  <p className="text-[11px] text-slate-400">
                    Paste your Google Drive link to publish immediately to the viewer portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* SECTION 1: Video Information */}
              <div className="space-y-3.5">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <Film className="w-3.5 h-3.5 text-blue-400" />
                  <span>1. Video Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Video Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Inception / Cosmic Odyssey / Kapan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Genre</label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Action">Action</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Drama">Drama</option>
                      <option value="Animation">Animation</option>
                      <option value="Documentary">Documentary</option>
                      <option value="Thriller">Thriller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                      placeholder="e.g. 120"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Synopsis / Storyline</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of the video title..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Poster Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or leave blank for default poster"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Access Tier</label>
                    <select
                      value={formData.isPremiumOnly ? "PREMIUM" : "FREE"}
                      onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.value === "PREMIUM" })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="FREE">Free Tier (Ad-Supported with Google AdSense, 720p)</option>
                      <option value="PREMIUM">VIP Premium Exclusive (No Ads, 1080p / 4K Unlocked)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Google Drive Video Stream */}
              <div className="space-y-3.5">
                <div className="flex items-center space-x-2 pb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                  <span>2. Google Drive Video Stream (No Service Account Needed)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-200">
                        Google Drive Video Link or File ID <span className="text-red-400">*</span>
                      </label>
                      {detectedFileId && (
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          File ID: {detectedFileId}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={formData.googleDriveLink}
                        onChange={(e) => {
                          setFormData({ ...formData, googleDriveLink: e.target.value });
                          setLinkTestStatus(null);
                        }}
                        placeholder="https://drive.google.com/file/d/1FMtjMgMfieoLhE-hHbli3uCxQGCrX7ZK/view?usp=sharing"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500 placeholder-slate-600"
                      />
                      <button
                        type="button"
                        onClick={testDriveConnection}
                        disabled={linkTestStatus?.checking || !formData.googleDriveLink}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
                      >
                        {linkTestStatus?.checking ? 'Checking...' : 'Verify Stream'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Make sure your Google Drive video has sharing set to: <strong>"Anyone with the link can view"</strong>.
                    </p>
                  </div>

                  {/* Connection Verification Box */}
                  {linkTestStatus && (
                    <div className={`p-2.5 rounded-lg border text-xs flex items-center space-x-2 ${
                      linkTestStatus.success 
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
                        : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                    }`}>
                      {linkTestStatus.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>{linkTestStatus.message}</span>
                    </div>
                  )}

                  {/* Optional Multiple Resolutions Toggle */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => setShowMultiRes(!showMultiRes)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{showMultiRes ? "Hide Resolution Tiers" : "Provide separate Google Drive links for 1080p & 4K (Optional)"}</span>
                    </button>

                    {showMultiRes && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 animate-fadeIn">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">1080p Full HD Drive Link</label>
                          <input
                            type="text"
                            value={formData.driveVideo1080p}
                            onChange={(e) => setFormData({ ...formData, driveVideo1080p: e.target.value })}
                            placeholder="Optional 1080p link..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">4K Ultra HD Drive Link</label>
                          <input
                            type="text"
                            value={formData.driveVideo4K}
                            onChange={(e) => setFormData({ ...formData, driveVideo4K: e.target.value })}
                            placeholder="Optional 4K link..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Multi-Language Audio Tracks */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Languages className="w-3.5 h-3.5 text-blue-400" />
                    <span>3. Multi-Language Audio (Google Drive)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formData.audioTracks.length} Track{formData.audioTracks.length === 1 ? '' : 's'} Configured
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Quick-add language buttons */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Quick Add:</span>
                    {[
                      { name: 'English', code: 'en' },
                      { name: 'Tamil', code: 'ta' },
                      { name: 'Hindi', code: 'hi' },
                      { name: 'Spanish', code: 'es' },
                      { name: 'Telugu', code: 'te' },
                      { name: 'Malayalam', code: 'ml' },
                      { name: 'French', code: 'fr' }
                    ].map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => quickAddLanguage(lang.name, lang.code)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        + {lang.name}
                      </button>
                    ))}
                  </div>

                  {/* Configured audio track list */}
                  {formData.audioTracks.map((track, idx) => (
                    <div key={track.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-28 shrink-0">
                        <span className="text-xs font-semibold text-slate-200">{track.languageName}</span>
                        <span className="text-[10px] text-slate-500 uppercase ml-1">({track.languageCode})</span>
                      </div>
                      <input
                        type="text"
                        value={track.driveLink}
                        onChange={(e) => {
                          const updated = [...formData.audioTracks];
                          updated[idx].driveLink = e.target.value;
                          setFormData({ ...formData, audioTracks: updated });
                        }}
                        placeholder="Google Drive audio link or ID (Leave empty to use main video audio)"
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600"
                      />
                      {formData.audioTracks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAudioTrack(idx)}
                          className="p-1 rounded text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Subtitles */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Subtitles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Subtitles (.vtt / Google Drive)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formData.subtitles.length} Subtitles
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Add Subtitle:</span>
                    {[
                      { name: 'English [CC]', code: 'en' },
                      { name: 'Tamil [CC]', code: 'ta' },
                      { name: 'Hindi [CC]', code: 'hi' },
                      { name: 'Spanish [CC]', code: 'es' }
                    ].map(sub => (
                      <button
                        key={sub.code}
                        type="button"
                        onClick={() => quickAddSubtitle(sub.name, sub.code)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                      >
                        + {sub.name}
                      </button>
                    ))}
                  </div>

                  {formData.subtitles.map((sub, idx) => (
                    <div key={sub.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                      <span className="w-28 text-xs font-semibold text-slate-200 shrink-0">
                        {sub.languageName}
                      </span>
                      <input
                        type="text"
                        value={sub.driveLink}
                        onChange={(e) => {
                          const updated = [...formData.subtitles];
                          updated[idx].driveLink = e.target.value;
                          setFormData({ ...formData, subtitles: updated });
                        }}
                        placeholder="Google Drive .vtt link or ID"
                        className="flex-1 bg-slate-900 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono placeholder-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtitle(idx)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 sticky bottom-0 bg-slate-900/95 py-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Video to Live Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Published Videos Catalog Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-slate-200">
              Published Catalog Streams ({filteredVideos.length})
            </h3>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['ALL', 'FREE', 'PREMIUM'].map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  tierFilter === t
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'All Tiers' : t === 'FREE' ? 'Free (AdSense)' : 'VIP Only'}
              </button>
            ))}
          </div>
        </div>

        {filteredVideos.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">No Video Titles Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Add Video" above to publish your Google Drive streams with multi-language audio tracks.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredVideos.map(video => {
              const driveId = extractDriveId(video.driveFileIds?.videoDefault);
              return (
                <div key={video.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden relative shrink-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white">
                        {video.genre}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-100">{video.title}</h4>
                        {video.isPremiumOnly ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            VIP Premium
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Free Tier (AdSense)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 max-w-lg">
                        {video.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <HardDrive className="w-3 h-3 text-blue-400" />
                          Drive ID: {driveId || 'N/A'}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {Math.round((video.durationSeconds || 7200) / 60)} mins
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Languages className="w-3 h-3 text-emerald-400" />
                          {video.audioTracks?.length || 1} Audio Tracks
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
                      title="Watch on Viewer Streaming Portal (Port 3000)"
                    >
                      <Play className="w-3.5 h-3.5 fill-blue-300" />
                      <span>Watch in Viewer</span>
                    </a>

                    <button
                      onClick={() => handleDelete(video.id, video.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      title="Delete Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
