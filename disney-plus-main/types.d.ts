export type Media = {
  id: string;
  title?: string;
  isForAdult?: boolean;
  overview?: string;
  type?: "movies" | "series";
  image: {
    backdrop?: string;
    poster?: string;
    logo?: Logo;
  };
  video?: Video;
  releasedAt?: string;
  language?: {
    original?: string;
  };
  driveFileIds?: {
    videoDefault?: string;
    video1080p?: string;
    video4K?: string;
  };
  audioTracks?: Array<{
    id: string;
    languageCode: string;
    languageName: string;
    driveFileId?: string;
    isDefault?: boolean;
  }>;
  subtitles?: Array<{
    id: string;
    languageCode: string;
    languageName: string;
    driveFileId?: string;
  }>;
  isPremiumOnly?: boolean;
  qualityTiers?: {
    freeCapped?: string;
    premiumUnlocked?: string[];
  };
  durationSeconds?: number;
  streamUrl?: string;
};

export type Logo = {
  aspectRatio?: number;
  width?: number;
  height?: number;
  image?: string;
};

export type Video = {
  id: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  isOfficial: boolean;
};
