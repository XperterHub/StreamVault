import type { Media } from "../types";

export const STORAGE_KEY = "streamvault_admin_videos";

export function mapAdminVideoToMedia(v: any): Media {
  const defaultDriveId = v.driveFileIds?.videoDefault || "";
  const poster = v.thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80";
  const backdrop = v.bannerUrl || v.thumbnailUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80";

  return {
    id: v.id || `vid-${Date.now()}`,
    title: v.title,
    isForAdult: false,
    type: v.genre?.toLowerCase().includes("doc") || v.genre?.toLowerCase().includes("series")
      ? "series"
      : "movies",
    overview: v.description,
    image: {
      poster: poster,
      backdrop: backdrop,
    },
    releasedAt: v.uploadedAt ? v.uploadedAt.slice(0, 10) : "2026",
    language: { original: "en" },
    driveFileIds: v.driveFileIds || {},
    audioTracks: v.audioTracks || [],
    subtitles: v.subtitles || [],
    isPremiumOnly: !!v.isPremiumOnly,
    qualityTiers: v.qualityTiers || { freeCapped: "720p", premiumUnlocked: ["1080p", "4K HDR"] },
    durationSeconds: v.durationSeconds || 7200,
    streamUrl: defaultDriveId ? `/api/stream?id=${encodeURIComponent(defaultDriveId)}` : "",
  };
}

export const DEFAULT_JUJUTSU_KAISEN_MEDIA: Media = {
  id: "vid-jujutsu-kaisen",
  title: "Jujutsu Kaisen",
  isForAdult: false,
  type: "movies",
  overview: "Action and adventure brooo",
  image: {
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80",
  },
  releasedAt: "2026-11-12",
  language: { original: "en" },
  driveFileIds: {
    videoDefault: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
    video1080p: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
    video4K: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
  },
  audioTracks: [
    {
      id: "aud-en",
      languageCode: "en",
      languageName: "English",
      driveFileId: "1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50",
      isDefault: true,
    },
  ],
  subtitles: [],
  isPremiumOnly: false,
  qualityTiers: { freeCapped: "720p", premiumUnlocked: ["1080p", "4K HDR"] },
  durationSeconds: 7200,
  streamUrl: "https://drive.google.com/file/d/1eYdIEDowaxnXXDGOPAQrWGqh1io2nm50/preview",
};

export function getStoredVideos(): Media[] {
  if (typeof window === "undefined") return [DEFAULT_JUJUTSU_KAISEN_MEDIA];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_JUJUTSU_KAISEN_MEDIA];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(mapAdminVideoToMedia);
    }
  } catch {}
  return [DEFAULT_JUJUTSU_KAISEN_MEDIA];
}

export function getStoredLatestVideo(): Media | null {
  const list = getStoredVideos();
  return list.length > 0 ? list[0] : null;
}

