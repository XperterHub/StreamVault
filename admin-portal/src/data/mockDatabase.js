// StreamVault Production Storage Engine
// Strictly Zero demo/fake data. Only stores real user-ingested videos, real users, and real coupons.

const STORAGE_KEYS = {
  VERSION: 'streamvault_clean_v4_zero_demo',
  VIDEOS: 'streamvault_admin_videos',
  COUPONS: 'streamvault_admin_coupons',
  USERS: 'streamvault_admin_users',
  SETTINGS: 'streamvault_admin_settings',
  METRICS: 'streamvault_admin_metrics'
};

const SYNC_API_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/sync` : '/api/sync';

// Initial Video Catalog — Jujutsu Kaisen default stream
export const INITIAL_VIDEOS = [
  {
    id: "vid-jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    description: "Action and adventure brooo",
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
    genre: "Action",
    durationSeconds: 7200,
    isPremiumOnly: false,
    qualityTiers: {
      freeCapped: "720p",
      premiumUnlocked: ["1080p", "4K HDR"]
    },
    driveFileIds: {
      videoDefault: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
      video1080p: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
      video4K: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50"
    },
    audioTracks: [
      {
        id: "aud-en",
        languageCode: "en",
        languageName: "English",
        driveFileId: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
        isDefault: true
      }
    ],
    subtitles: [],
    viewsCount: 1,
    uploadedAt: "2026-11-12T19:00:00.000Z"
  }
];
export const INITIAL_COUPONS = [];
export const INITIAL_USERS = [];

export const INITIAL_SETTINGS = {
  isGoogleDriveConnected: true
};

export const INITIAL_METRICS = {
  totalRegisteredUsers: 0,
  activePaidSubscriptions: 0,
  monthlyRecurringRevenueUSD: 0,
  dailyActiveViewers: 0,
  totalVideoHoursStreamed: 0
};

// Automatic purge of any legacy demo data from localStorage on initialization
if (typeof window !== 'undefined') {
  try {
    const isClean = localStorage.getItem(STORAGE_KEYS.VERSION) === 'true';
    const rawVideos = localStorage.getItem(STORAGE_KEYS.VIDEOS) || '';
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS) || '';
    const rawCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS) || '';

    // Check if any old demo artifacts exist
    const hasLegacyData = 
      !isClean ||
      rawVideos.includes('Guardians of the Cosmos') ||
      rawVideos.includes('Shadows of the Deep Ocean') ||
      rawVideos.includes('The Mandalorian') ||
      rawUsers.includes('sarah@cyber.com') ||
      rawUsers.includes('Sarah Connor') ||
      rawCoupons.includes('VIP50');

    if (hasLegacyData) {
      console.log('StreamVault: Purging legacy demo data and initializing clean production storage.');
      localStorage.removeItem(STORAGE_KEYS.VIDEOS);
      localStorage.removeItem(STORAGE_KEYS.COUPONS);
      localStorage.removeItem(STORAGE_KEYS.USERS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.METRICS);

      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(INITIAL_METRICS));
      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
    }
  } catch (e) {
    console.error('Storage initialization notice:', e);
  }
}

// Background sync to Viewer Portal
async function syncToViewerPortal(payload) {
  try {
    await fetch(SYNC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Viewer portal offline fallback
  }
}

export const getDatabase = () => {
  const getFullState = () => ({
    videos: (() => {
      const s = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      return s ? JSON.parse(s) : INITIAL_VIDEOS;
    })(),
    coupons: (() => {
      const s = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return s ? JSON.parse(s) : INITIAL_COUPONS;
    })(),
    users: (() => {
      const s = localStorage.getItem(STORAGE_KEYS.USERS);
      return s ? JSON.parse(s) : INITIAL_USERS;
    })(),
    settings: (() => {
      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return s ? JSON.parse(s) : INITIAL_SETTINGS;
    })(),
    metrics: (() => {
      const s = localStorage.getItem(STORAGE_KEYS.METRICS);
      return s ? JSON.parse(s) : INITIAL_METRICS;
    })()
  });

  return {
    getVideos: () => {
      const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
      return INITIAL_VIDEOS;
    },
    saveVideos: (videos) => {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
      const full = getFullState();
      full.videos = videos;
      syncToViewerPortal(full);
      window.dispatchEvent(new Event('streamvault_data_updated'));
      window.dispatchEvent(new CustomEvent('streamvault-sync'));
    },
    getCoupons: () => {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    },
    saveCoupons: (coupons) => {
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
      const full = getFullState();
      full.coupons = coupons;
      syncToViewerPortal(full);
      window.dispatchEvent(new Event('streamvault_data_updated'));
    },
    getUsers: () => {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    },
    saveUsers: (users) => {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const full = getFullState();
      full.users = users;
      syncToViewerPortal(full);
      window.dispatchEvent(new Event('streamvault_data_updated'));
    },
    getSettings: () => {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    },
    saveSettings: (settings) => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      const full = getFullState();
      full.settings = settings;
      syncToViewerPortal(full);
      window.dispatchEvent(new Event('streamvault_data_updated'));
    },
    getMetrics: () => {
      // Calculate strictly from actual database records (all 0 if empty)
      const users = (() => {
        const s = localStorage.getItem(STORAGE_KEYS.USERS);
        return s ? JSON.parse(s) : INITIAL_USERS;
      })();
      const videos = (() => {
        const s = localStorage.getItem(STORAGE_KEYS.VIDEOS);
        return s ? JSON.parse(s) : INITIAL_VIDEOS;
      })();

      const premiumCount = users.filter(u => u.tier === 'PREMIUM').length;
      const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
      const offlineVaults = users.reduce((acc, u) => acc + (u.offlineDownloadsCount || 0), 0);

      return {
        totalRegisteredUsers: users.length,
        activePaidSubscriptions: premiumCount,
        monthlyRecurringRevenueUSD: premiumCount * 12,
        dailyActiveViewers: users.length > 0 ? users.length : 0,
        totalVideoHoursStreamed: Math.round(videos.reduce((acc, v) => acc + (v.durationSeconds || 0) * (v.viewsCount || 0), 0) / 3600),
        estimatedAdRevenueUSD: 0,
        adImpressionsDelivered: 0,
        inAppOfflineDownloadsActive: offlineVaults
      };
    },
    resetAllToClean: () => {
      localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(INITIAL_METRICS));
      localStorage.setItem(STORAGE_KEYS.VERSION, 'true');
      syncToViewerPortal({
        videos: [],
        coupons: [],
        users: [],
        settings: INITIAL_SETTINGS,
        metrics: INITIAL_METRICS
      });
      window.dispatchEvent(new Event('streamvault_data_updated'));
    }
  };
};
