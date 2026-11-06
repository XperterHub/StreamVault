import type { Media } from "../types";
import fs from "fs";
import path from "path";

const SHARED_DB_PATH = path.resolve(process.cwd(), "..", "data", "shared_streamvault.json");

export function getSharedVideos(): Media[] {
  try {
    if (fs.existsSync(SHARED_DB_PATH)) {
      const raw = fs.readFileSync(SHARED_DB_PATH, "utf-8");
      const data = JSON.parse(raw);
      if (data.videos && Array.isArray(data.videos)) {
        return data.videos.map((v: any) => {
          const defaultDriveId = v.driveFileIds?.videoDefault || "";
          return {
            id: v.id,
            title: v.title,
            isForAdult: false,
            type: v.genre?.toLowerCase().includes("doc") || v.genre?.toLowerCase().includes("series") ? "series" : "movies",
            overview: v.description,
            image: {
              poster: v.thumbnailUrl,
              backdrop: v.bannerUrl || v.thumbnailUrl,
            },
            releasedAt: v.uploadedAt ? v.uploadedAt.slice(0, 10) : "",
            language: { original: "en" },
            driveFileIds: v.driveFileIds || {},
            audioTracks: v.audioTracks || [],
            subtitles: v.subtitles || [],
            isPremiumOnly: !!v.isPremiumOnly,
            qualityTiers: v.qualityTiers || {
              freeCapped: "720p",
              premiumUnlocked: ["1080p", "4K HDR"]
            },
            durationSeconds: v.durationSeconds || 7200,
            streamUrl: defaultDriveId ? `/api/stream?id=${encodeURIComponent(defaultDriveId)}` : ""
          };
        });
      }
    }
  } catch (e) {
    console.error("Could not read shared database", e);
  }

  return [];
}

export function getSharedSettings() {
  try {
    if (fs.existsSync(SHARED_DB_PATH)) {
      const raw = fs.readFileSync(SHARED_DB_PATH, "utf-8");
      const data = JSON.parse(raw);
      return data.settings || {};
    }
  } catch (e) {
    console.error("Could not read shared settings", e);
  }
  return {
    adSensePublisherId: "pub-2509450853164699",
    enablePreRollAds: true,
    enableMidRollAds: true,
    skipAdDelaySeconds: 5
  };
}

export const STREAMVAULT_CATALOG: Media[] = [];
